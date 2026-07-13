import base64
import cv2
import logging
import sys
from pathlib import Path

import numpy as np
import torch

from app.ml import model_def
from app.ml.preprocessing import (
    TUMOR_DETECTION_THRESHOLD,
    build_segmentation_overlay,
    encode_overlay_png,
    preprocess_image,
)

# The checkpoint was saved with this class living in `__main__`, so pickle
# looks for it there. Remap it to our module so torch.load can rebuild it.
sys.modules["__main__"].MobileNetClassifier = model_def.MobileNetClassifier

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "model"
DEFAULT_MODEL_PATH = MODEL_DIR / "liver_cancer_model_full.pth"

_MODEL = None


def get_model():
    global _MODEL
    if _MODEL is None:
        if not DEFAULT_MODEL_PATH.exists():
            raise RuntimeError(f"Model weights not found at {DEFAULT_MODEL_PATH}")
        logger.info("Loading liver cancer diagnosis model from %s", DEFAULT_MODEL_PATH)
        _MODEL = torch.load(DEFAULT_MODEL_PATH, map_location="cpu", weights_only=False)
        _MODEL.eval()
    return _MODEL


def decode_data_url(data_url: str) -> bytes:
    """Decode a data URL (or raw base64 string) into bytes."""
    if data_url.startswith("data:"):
        _, _, encoded = data_url.partition(",")
        return base64.b64decode(encoded)
    return base64.b64decode(data_url)


def _to_probability_map(output: torch.Tensor) -> np.ndarray:
    """Normalize a model output tensor to a single-channel [0, 1] probability map."""
    if hasattr(output, "get") and isinstance(output, dict):
        output = output.get("out") or output.get("mask") or next(iter(output.values()))

    if output.dim() == 4 and output.shape[1] == 2:
        probs = torch.softmax(output, dim=1)[:, 1]
    elif output.dim() == 4 and output.shape[1] == 1:
        probs = torch.sigmoid(output)[:, 0]
    else:
        probs = torch.sigmoid(output)

    return probs.squeeze().cpu().numpy().astype(np.float32)


def run_diagnosis(image_bytes: bytes) -> dict:
    """Run the segmentation model on image bytes and return diagnosis results."""
    model = get_model()
    tensor, rgb_image, original_size = preprocess_image(image_bytes)

    with torch.no_grad():
        output = model(tensor)

    probs = _to_probability_map(output)
    mask = (probs > TUMOR_DETECTION_THRESHOLD).astype(np.uint8)
    mask_full = cv2.resize(
        mask, (original_size[1], original_size[0]), interpolation=cv2.INTER_NEAREST
    )
    coverage = float(mask_full.mean())
    overlay_png = encode_overlay_png(build_segmentation_overlay(rgb_image, mask_full))

    return {
        "cancer_type": "liver",
        "confidence": round(coverage * 100, 1),
        "tumor_detected": coverage > 0,
        "coverage": coverage,
        "overlay_png": overlay_png,
    }
