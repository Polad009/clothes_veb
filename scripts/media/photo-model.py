
# On-model product photos: our designs placed on licensed Pexels photos of people in plain garments.
# usage: python model.py <raw_dir> <designs_dir> <out_dir>
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
raw, designs, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
def arr(im):
    return np.asarray(im.convert("RGBA")).astype(np.float32) / 255.0


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def blur(x, r):
    im = Image.fromarray((np.clip(x, 0, 1) * 65535).astype(np.uint16) if False else (np.clip(x, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255.0


def place(g, design_file, cx, cy, wfrac, dark):
    """g: garment RGBA float array. cx, cy, wfrac are fractions of the garment size."""
    h, w = g.shape[:2]
    d = Image.open(design_file).convert("RGBA")
    dw = int(w * wfrac); dh = int(dw * d.height / d.width)
    d = arr(d.resize((dw, dh), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5)))
    x0 = int(w * cx - dw / 2); y0 = int(h * cy - dh / 2)
    sl = (slice(y0, y0 + dh), slice(x0, x0 + dw))
    reg = g[sl].copy()
    L = lum(reg)
    Ls = blur(L, 2.0)
    m = d[..., 3] > 0.3
    ref = np.median(Ls[m]) if m.any() else Ls.mean()
    shade = np.clip(Ls / max(ref, 1e-3), 0.5, 1.3)
    grain = (L - Ls)
    ink = d[..., :3]
    if dark:   # light ink on dark fabric: ink follows the folds, slightly softened
        shade = 1 + (shade - 1) * 0.55
        p = ink * shade[..., None] * 0.93 + grain[..., None] * 0.8
        a = d[..., 3] * 0.94
    else:      # dark ink on light fabric: multiply, so folds and grain show through
        p = ink * (reg[..., :3] / max(ref, 1e-3)) * 0.98 + 0.05 * (1 - ink)
        p = np.minimum(p, reg[..., :3])
        a = d[..., 3] * 0.95
    a = a * reg[..., 3]   # never print outside the garment
    reg[..., :3] = reg[..., :3] * (1 - a[..., None]) + np.clip(p, 0, 1) * a[..., None]
    g[sl] = reg
    return g




def crop45(g, top=None, cx=0.5):
    h, w = g.shape[:2]
    if h / w >= 1.25:
        ch = int(w * 1.25); y0 = int(min(max(0, (top or 0) * h), h - ch)); g = g[y0:y0 + ch]
    else:
        cw = int(h / 1.25); x0 = int(min(max(0, cx * w - cw / 2), w - cw)); g = g[:, x0:x0 + cw]
    im = Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA").convert("RGB")
    return im.resize((1600, 2000), Image.LANCZOS)

def shot(photo, prints, top=None, cx=0.5):
    g = arr(Image.open(os.path.join(raw, photo + ".jpg")))
    h, w = g.shape[:2]
    for design, x, y, wf, dark in prints:
        if design.startswith("leg"):            # tall strip: wf is its height as a share of the photo height
            d = Image.open(os.path.join(designs, design + ".png")); wf = wf * h * d.width / d.height / w
        g = place(g, os.path.join(designs, design + ".png"), x, y, wf, dark)
    return crop45(g, top, cx)

# photo id -> where things sit (fractions of the photo)
TEE_W_FRONT = ("8217461", 0.62, 0.44, 0.10)
TEE_W_BACK = ("6311141", 0.53, 0.52, 0.31)
TEE_B_FRONT = ("4066293", 0.60, 0.27, 0.075)
HOOD_W_BACK = ("8217415", 0.50, 0.58, 0.30)
HOOD_B_FRONT = ("6311619", 0.615, 0.36, 0.085)
HOOD_B_BACK = ("6311506", 0.525, 0.57, 0.29)
LEG = ("6311619", 0.635, 0.885, 0.16)
CAP = ("9558786", 0.51, 0.435, 0.07)
CAP_TEE = ("9558786", 0.62, 0.68, 0.09)

def P(spot, design, dark):
    return (design, spot[1], spot[2], spot[3], dark)

jobs = {
  # product key -> colour -> list of (file, photo, prints, top)
  "schwa-tee": {"Ağ": [("m1", "8217461", [P(TEE_W_FRONT, "schwa-chest-ink", False)], 0.12), ("m2", "6311141", [P(TEE_W_BACK, "schwa-back-ink", False)], 0.06)],
                "Qara": [("m1", "4066293", [P(TEE_B_FRONT, "schwa-chest-bone", True)], None)]},
  "winds-tee": {"Ağ": [("m1", "8217461", [P(TEE_W_FRONT, "winds-chest-ink", False)], 0.12), ("m2", "6311141", [P(TEE_W_BACK, "winds-back-ink", False)], 0.06)],
                "Qara": [("m1", "4066293", [P(TEE_B_FRONT, "winds-chest-bone", True)], None)]},
  "carpet-tee": {"Ağ": [("m1", "8217461", [P(TEE_W_FRONT, "carpet-chest-ink", False)], 0.12), ("m2", "6311141", [P(TEE_W_BACK, "carpet-back-ink", False)], 0.06)],
                 "Qara": [("m1", "4066293", [P(TEE_B_FRONT, "carpet-chest-bone", True)], None)]},
  "buta-hoodie": {"Qara": [("m1", "6311619", [P(HOOD_B_FRONT, "buta-chest-bone", True)], 0.08), ("m2", "6311506", [P(HOOD_B_BACK, "buta-back-bone", True)], 0.1)]},
  "caspian-hoodie": {"Qara": [("m1", "6311619", [P(HOOD_B_FRONT, "caspian-chest-bone", True)], 0.08), ("m2", "6311506", [P(HOOD_B_BACK, "caspian-back-bone", True)], 0.1)]},
  "essential-hoodie": {"Qara": [("m1", "6311619", [P(HOOD_B_FRONT, "essential-chest-bone", True)], 0.08), ("m2", "6311506", [P(HOOD_B_BACK, "essential-back-bone", True)], 0.1)],
                       "Ağ": [("m2", "8217415", [P(HOOD_W_BACK, "essential-back-ink", False)], 0.14)]},
  "logo-joggers": {"Qara": [("m1", "6311619", [P(LEG, "leg-bone", True)], 0.167), ("m2", "6311506", [], 0.167)]},
  "schwa-cap": {"Ağ": [("m1", "9558786", [P(CAP, "cap-ink", False)], 0.15)]},
  "essential-set": {"Qara": [("m1", "6311619", [P(HOOD_B_FRONT, "essential-chest-bone", True), P(LEG, "leg-bone", True)], 0.12),
                             ("m2", "6311506", [P(HOOD_B_BACK, "essential-back-bone", True)], 0.12)]},
  "baku-set": {"Ağ": [("m1", "9558786", [P(CAP, "cap-ink", False), P(CAP_TEE, "schwa-chest-ink", False)], 0.15),
                      ("m2", "6311141", [P(TEE_W_BACK, "schwa-back-ink", False)], 0.06)]},
}
only = sys.argv[4] if len(sys.argv) > 4 else None
manifest = {}
for key, cols in jobs.items():
    if only and only not in key: continue
    manifest[key] = {}
    for cname, shots in cols.items():
        files = []
        for tag, photo, prints, top in shots:
            fn = f"{key}-{'ag' if cname == 'Ağ' else 'qara'}-{tag}.jpg"
            shot(photo, prints, top, 0.5).save(os.path.join(out, fn), quality=86, optimize=True, progressive=True)
            files.append(fn)
        manifest[key][cname] = files
        print(key, cname, files)
json.dump(manifest, open(os.path.join(out, "model.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
