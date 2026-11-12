"""Product images for the dark graphic prints: the designs from dark-designs.py printed on
photos of plain black garments (free Unsplash photos, listed in MEDIA_LICENSES.md).
usage: python dark-images.py <src_dir> <designs_dir> <out_dir>
  src_dir: man2.jpg teeflat.jpg hm14.jpg hm7.jpg and hblank-black.png (the white hoodie photo
  cut out and turned black)
writes <design>-<view>.jpg, 1600x2000"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageOps

SRC, DESIGNS, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
W, H = 1600, 2000
BG = (236, 234, 230)
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "photo-compose.py"), encoding="utf-8").read()
exec(_src[_src.index("def arr("):_src.index("def canvas(")])

# photo: crop box (x0, y0, x1, y1 as fractions) shown on the site, and where the print sits (cx, cy, width).
# The print is centred on the garment's own centre line in every photo.
VIEWS = {
    "model": ("man2.jpg", (0.0, 0.03, 1.0, 0.9675), (0.50, 0.545, 0.33)),
    "flat": ("teeflat.jpg", (0.338, 0.085, 0.657, 0.69), (0.497, 0.47, 0.15)),
    "hood-flat": ("hblank-black.png", None, (0.50, 0.385, 0.60)),
    "hood-model": ("hm14.jpg", (0.0, 0.22, 1.0, 0.923), (0.515, 0.615, 0.50)),
    "hood-model2": ("hm7.jpg", (0.2, 0.13, 0.8, 0.63), (0.50, 0.392, 0.25)),
}
PRODUCTS = {"money": ["model", "flat"], "awake": ["model", "flat"], "eternal": ["model", "flat"], "strike": ["hood-model", "hood-flat", "hood-model2"]}
# tall designs are sized down so they end above the hem
TALL = {"awake": 0.78, "eternal": 0.86}

for design, views in PRODUCTS.items():
    for v in views:
        photo, box, (cx, cy, wf) = VIEWS[v]
        g = arr(Image.open(os.path.join(SRC, photo)))
        g = place(g, os.path.join(DESIGNS, design + ".png"), cx, cy, wf * TALL.get(design, 1.0), True)
        h, w = g.shape[:2]
        im = Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA")
        if box is None:      # cut-out garment: centred on a plain light background
            s = min(W * 0.84 / w, H * 0.84 / h)
            im = im.resize((int(w * s), int(h * s)), Image.LANCZOS)
            c = Image.new("RGB", (W, H), BG)
            c.paste(im, ((W - im.width) // 2, (H - im.height) // 2), im)
            im = c
        else:
            im = im.convert("RGB").crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
            im = ImageOps.fit(im, (W, H), Image.LANCZOS)
        im.save(os.path.join(OUT, f"{design}-{v}.jpg"), quality=88)
        print(design, v)
