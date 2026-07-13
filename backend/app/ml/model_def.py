"""Reconstructed definition of the trained `MobileNetClassifier`.

The saved `liver_cancer_model_full.pth` was created with
`torch.save(model)` from a training script where this class lived in
`__main__`. The checkpoint contains ONLY a torchvision `MobileNetV2`
backbone (`backbone.features`); there is no segmentation/classification
head and no parameterised custom layers. The forward pass below is a
reconstruction that turns the backbone features into a single-channel
spatial mask (parameter-free, since no head weights exist).

If you have the original `forward()` from training, paste it here to
replace the reconstruction for accurate results.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class MobileNetClassifier(nn.Module):
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (N, 3, 256, 256) -> backbone features (N, 1280, H/32, W/32)
        feat = self.backbone.features(x)
        # No learned segmentation head exists in the saved weights, so this
        # is a parameter-free reconstruction: turn the backbone's per-channel
        # activation magnitudes into a single spatial heatmap, min-max
        # normalised per sample to [0, 1] so the mask is spatially meaningful
        # regardless of feature scale.
        act = feat.abs().mean(dim=1, keepdim=True)
        act = F.interpolate(act, size=(256, 256), mode="bilinear", align_corners=False)
        min_v = act.amin(dim=(2, 3), keepdim=True)
        max_v = act.amax(dim=(2, 3), keepdim=True)
        act = (act - min_v) / (max_v - min_v + 1e-8)
        # Center around 0 (midpoint -> sigmoid 0.5) so the 0.5 mask
        # threshold yields a partial, spatially-varying mask rather than
        # saturating to fully positive/negative.
        return (act - 0.5) * 8.0
