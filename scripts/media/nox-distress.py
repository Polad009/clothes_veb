"""Worn-print texture for the NOX print files: knocks small random specks out of the
artwork (like a vintage, washed screen print). Strength per design comes from designs.json
("distress", 0..1). Runs on the PNGs made by render-designs.ts, in place. Seeded, so re-runs match.
usage: python nox-distress.py <designs_dir>"""
import json
import os
import sys
import zlib

import numpy as np
from PIL import Image, ImageFilter

d = sys.argv[1]
meta = json.load(open(os.path.join(d, "designs.json"), encoding="utf-8"))


def noise(h, w, cell, rng):
    small = rng.random((max(2, h // cell), max(2, w // cell))).astype(np.float32)
    return np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255


for name, m in meta.items():
    k = float(m.get("distress", 0))
    if k <= 0:
        continue
    f = os.path.join(d, name + ".png")
    im = Image.open(f).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    rng = np.random.default_rng(zlib.crc32(name.rsplit("-", 1)[0].encode()))
    # big soft wear patches x fine grain: holes appear where both are low
    patch = noise(h, w, 260, rng) * 0.6 + noise(h, w, 90, rng) * 0.4
    grain = noise(h, w, 6, rng) * 0.55 + noise(h, w, 2, rng) * 0.45
    wear = patch * 0.55 + grain * 0.45
    thr = 0.18 + 0.2 * k
    hole = wear < thr
    # scattered fine specks over the whole print (ink that did not take)
    hole |= noise(h, w, 3, rng) < 0.035 + 0.05 * k
    m8 = Image.fromarray((hole * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    keep = 1 - np.asarray(m8).astype(np.float32) / 255
    a[..., 3] *= keep
    Image.fromarray(a.astype(np.uint8), "RGBA").save(f, optimize=True, dpi=(300, 300))
    print(name, f"distress {k}", f"{(hole.mean() * 100):.1f}% knocked out")
