import io
import logging

import cv2
import numpy as np
import torch
from PIL import Image

logger = logging.getLogger(__name__)

IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

TUMOR_OVERLAY_COLOR = (255, 60, 60)  # RGB red
TUMOR_DETECTION_THRESHOLD = 0.5  # % coverage to flag tumor_detected


def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Load image bytes into an RGB numpy array."""
    with Image.open(io.BytesIO(image_bytes)) as image:
        return np.array(image.convert("RGB"))


def apply_clahe(rgb_image: np.ndarray) -> np.ndarray:
    """Enhance contrast for medical imaging using CLAHE on the L channel."""
    lab = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    enhanced = cv2.merge((l_channel, a_channel, b_channel))
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)


def preprocess_image(
    image_bytes: bytes,
    input_size: int = 256,
    device: torch.device | None = None,
) -> tuple[torch.Tensor, np.ndarray, tuple[int, int]]:
    """
    Preprocess a liver CT/MRI image for segmentation inference.

    Returns tensor batch, original RGB image, and original (height, width).
    """
    rgb_image = load_image_from_bytes(image_bytes)
    original_size = (rgb_image.shape[0], rgb_image.shape[1])
    enhanced = apply_clahe(rgb_image)

    resized = cv2.resize(enhanced, (input_size, input_size), interpolation=cv2.INTER_AREA)
    normalized = resized.astype(np.float32) / 255.0
    normalized = (normalized - IMAGENET_MEAN) / IMAGENET_STD

    tensor = torch.from_numpy(normalized.transpose(2, 0, 1)).unsqueeze(0)
    if device is not None:
        tensor = tensor.to(device)
    return tensor, rgb_image, original_size


def build_segmentation_overlay(
    original_image: np.ndarray,
    mask: np.ndarray,
    alpha: float = 0.45,
) -> np.ndarray:
    """Blend a binary tumor mask onto the original scan."""
    mask_bool = mask.astype(bool)
    overlay = original_image.copy()
    color_layer = np.zeros_like(original_image)
    color_layer[mask_bool] = TUMOR_OVERLAY_COLOR
    overlay[mask_bool] = (
        (1 - alpha) * original_image[mask_bool] + alpha * color_layer[mask_bool]
    ).astype(np.uint8)
    return overlay


def encode_overlay_png(overlay_image: np.ndarray) -> bytes:
    """Encode an RGB overlay image as PNG bytes."""
    with io.BytesIO() as buffer:
        Image.fromarray(overlay_image).save(buffer, format="PNG")
        return buffer.getvalue()
