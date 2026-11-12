"""Product images for the dark graphic prints: the designs from dark-designs.py printed on
photos of plain black garments (free Unsplash photos, listed in MEDIA_LICENSES.md).
usage: python dark-images.py <src_dir> <designs_dir> <out_dir>
  src_dir: man2.jpg man1.jpg hood.jpg teeflat.jpg
writes <design>-<view>.jpg, 1600x2000"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageOps

SRC, DESIGNS, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
W, H = 1600, 2000
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "photo-compose.py"), encoding="utf-8").read()
exec(_src[_src.index("def arr("):_src.index("def canvas(")])

# photo: crop box (x0, y0, x1, y1 as fractions) shown on the site, and where the print sits (cx, cy, width)
VIEWS = {
    "model": ("man2", (0.0, 0.03, 1.0, 0.9675), {"tee": (0.50, 0.545, 0.33)}),
    "model2": ("man1", (0.335, 0.0, 0.665, 0.62), {"tee": (0.503, 0.445, 0.105)}),
    "flat": ("teeflat", (0.338, 0.085, 0.657, 0.69), {"tee": (0.497, 0.47, 0.15)}),
    "hood": ("hood", (0.0, 0.1667, 1.0, 1.0), {"wide": (0.50, 0.80, 0.80)}),
}
PRODUCTS = {"money": ("tee", ["model", "flat", "model2"]), "awake": ("tee", ["model", "flat", "model2"]), "eternal": ("tee", ["model", "flat", "model2"]), "strike": ("wide", ["hood"])}
# tall designs are sized by height so they end above the hem
TALL = {"awake": 0.78, "eternal": 0.86}

for design, (slot, views) in PRODUCTS.items():
    for v in views:
        photo, box, slots = VIEWS[v]
        g = arr(Image.open(os.path.join(SRC, photo + ".jpg")))
        cx, cy, wf = slots[slot]
        g = place(g, os.path.join(DESIGNS, design + ".png"), cx, cy, wf * TALL.get(design, 1.0), True)
        h, w = g.shape[:2]
        im = Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA").convert("RGB")
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        ImageOps.fit(im, (W, H), Image.LANCZOS).save(os.path.join(OUT, f"{design}-{v}.jpg"), quality=88)
        print(design, v)
