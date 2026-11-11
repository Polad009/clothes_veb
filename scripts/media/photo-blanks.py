"""Clean the cut-out garment photos and make colour variants from the real photos.
usage: python blanks.py <cut_dir> <out_dir>"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

cut, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)


def load(name):
    return np.asarray(Image.open(os.path.join(cut, name + ".png")).convert("RGBA")).astype(np.float32) / 255.0


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def sat(a):
    mx = a[..., :3].max(-1); mn = a[..., :3].min(-1)
    return (mx - mn) / np.maximum(mx, 1e-4)


def largest_component(mask):
    # keep the biggest connected blob (the garment); simple flood fill on a downscaled mask
    from collections import deque
    h, w = mask.shape
    seen = np.zeros_like(mask, bool); best = None; best_n = 0
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if len(pts) > best_n:
                    best_n = len(pts); best = pts
    keep = np.zeros_like(mask, bool)
    if best:
        ys, xs = zip(*best); keep[list(ys), list(xs)] = True
    return keep


def drop_above_shoulders(alpha, frac=0.25, run=60):
    """remove the hook / rail above the garment: the garment starts at the first row that stays
    wider than frac of the widest row for `run` rows (a thin rail never does)"""
    widths = (alpha > 0.5).sum(1)
    wide = widths > widths.max() * frac
    top = 0
    for y in range(len(wide) - run):
        if wide[y:y + run].all():
            top = y
            break
    alpha[:top] = 0
    return alpha


def finish(a, name):
    alpha = a[..., 3]
    ys, xs = np.where(alpha > 0.03)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    img = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGBA")
    # soften the cut edge a touch
    al = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.8))
    img.putalpha(al)
    img.save(os.path.join(out, name + ".png"))
    print(name, img.size)
    return a


# ── black tee: keep dark fabric (+ the white neck label), drop wall shadow and hanger ──
a = load("tee-black")
L = lum(a); alpha = a[..., 3].copy()
dark = L < 0.2
h, w = L.shape
label = np.zeros_like(dark)
label[int(h * 0.02):int(h * 0.16), int(w * 0.35):int(w * 0.65)] = True   # inside the collar
keep = (dark | (label & (alpha > 0.5)))
keep = largest_component(keep | label) | (label & (alpha > 0.5))
alpha = np.where(keep, alpha, 0)
alpha = drop_above_shoulders(alpha, 0.3)
# the cut-out left a hole where the white neck label was: fill it with the inner-collar fabric
from PIL import ImageDraw
outside = Image.fromarray(((alpha < 0.5) * 255).astype(np.uint8)).copy()
for x in range(0, w, 8):                              # mark transparent area reachable from the border
    for y in (0, h - 1):
        if outside.getpixel((x, y)) == 255:
            ImageDraw.floodfill(outside, (x, y), 128)
for y in range(0, h, 8):
    for x in (0, w - 1):
        if outside.getpixel((x, y)) == 255:
            ImageDraw.floodfill(outside, (x, y), 128)
hole = np.asarray(outside) == 255                     # transparent but enclosed = the label hole
hole[int(h * 0.4):] = False; hole[:, :int(w * 0.3)] = False; hole[:, int(w * 0.7):] = False
inner = (alpha > 0.5) & (L < 0.2)
a[hole, :3] = np.median(a[inner, :3], axis=0)
alpha[hole] = 1.0
a[..., 3] = alpha
finish(a, "tee-black")

# ── white tee: drop rail + hook ──
a = load("tee-white")
a[..., 3] = drop_above_shoulders(a[..., 3].copy(), 0.25)
finish(a, "tee-white")

# ── white hoodie: keep neutral (non-coloured) pixels of the main blob, drop rope/plants/jeans ──
a = load("hoodie-white")
alpha = a[..., 3].copy()
neutral = (sat(a) < 0.16) & (alpha > 0.4)
# the jeans hang right behind the hoodie's right sleeve: cut them away along the sleeve edge
# (points traced on the 2400px cut-out)
from PIL import ImageDraw
cutm = Image.new("L", (alpha.shape[1], alpha.shape[0]), 0); d = ImageDraw.Draw(cutm)
sx = alpha.shape[1] / 2400.0
P = lambda pts: [(x * sx, y * sx) for x, y in pts]
d.polygon(P([(1590, 0), (1596, 600), (1622, 650), (1644, 840), (1662, 1080), (1678, 1320), (1690, 1524),
             (1694, 1662), (1694, 1803), (2400, 1803), (2400, 0)]), fill=255)
d.polygon(P([(1530, 1400), (1556, 1420), (1556, 1556), (1602, 1556), (1602, 1664), (1694, 1664), (1694, 1803),
             (1400, 1803), (1400, 1592), (1500, 1586), (1512, 1450)]), fill=255)
neutral &= ~(np.asarray(cutm) > 0)
keep = largest_component(neutral)
alpha = np.where(keep, alpha, 0)
alpha = drop_above_shoulders(alpha, 0.2)
a[..., 3] = alpha
hw = finish(a, "hoodie-white")

# ── cap: as is ──
cap = finish(load("cap-white"), "cap-white")


def recolour(a, rgb, mode):
    """real-photo recolour: keep the photo's light and folds, change the fabric colour"""
    L = lum(a)
    m = a[..., 3] > 0.5
    ref = np.percentile(L[m], 90)
    shade = np.clip(L / ref, 0, 1.15)
    c = np.array(rgb, np.float32) / 255.0
    o = a.copy()
    if mode == "dark":          # black fabric: shading as a gentle lift over the base colour
        lift = (shade - 1.0) * 0.22 + (shade ** 4) * 0.05
        o[..., :3] = np.clip(c + lift[..., None], 0, 1)
    else:                       # mid / light fabric: multiply the colour by the shading
        o[..., :3] = np.clip(c * (shade[..., None] ** 1.1) * 1.04, 0, 1)
    return o


finish(recolour(hw, (24, 24, 24), "dark"), "hoodie-black")
finish(recolour(hw, (156, 155, 152), "mid"), "hoodie-grey")
finish(recolour(cap, (26, 26, 26), "dark"), "cap-black")
