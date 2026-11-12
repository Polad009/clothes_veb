"""Joggers that match the shop's black tees: the print is taken from the tee's product photo
(exisstore artwork, used with the supplier's permission) and placed on the left thigh of a real
jogger photo (Pexels 39457505, cleaned to the trousers only and recoloured black).

usage: python joggers-from-tees.py <jogger_cutout.png> <tee_images_dir> <out_dir> <tee_id> [<tee_id> ...]
writes joggers-black.png (plain blank), <id>-front.png (print on the thigh) and <id>-detail.jpg (close-up)."""
import os
import sys
from collections import deque

import cv2
import numpy as np
from PIL import Image, ImageFilter

cut, tees, out = sys.argv[1:4]
ids = sys.argv[4:]
os.makedirs(out, exist_ok=True)
W, H = 1600, 2000


def lum(a):
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def sat(a):
    mx = a[..., :3].max(-1); mn = a[..., :3].min(-1)
    return (mx - mn) / np.maximum(mx, 1e-4)


def largest(mask, step=3):
    h, w = mask.shape
    seen = np.zeros_like(mask, bool); best = [];
    for y in range(0, h, step):
        for x in range(0, w, step):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; pts = []
                while q:
                    cy, cx = q.popleft(); pts.append((cy, cx))
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if len(pts) > len(best):
                    best = pts
    keep = np.zeros_like(mask, bool)
    if best:
        ys, xs = zip(*best); keep[list(ys), list(xs)] = True
    return keep


def fill_outline(mask):
    """the garment's full silhouette: everything inside its outer outline"""
    m = (mask * 255).astype(np.uint8)
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros_like(m)
    cv2.drawContours(out, cs, -1, 255, thickness=cv2.FILLED)
    return out > 0


def close(mask, size):
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (size, size))
    return cv2.morphologyEx((mask * 255).astype(np.uint8), cv2.MORPH_CLOSE, k) > 0


def morph(mask, size, mode):
    im = Image.fromarray((mask * 255).astype(np.uint8))
    f = ImageFilter.MaxFilter(size) if mode == "grow" else ImageFilter.MinFilter(size)
    return np.asarray(im.filter(f)) > 127


# ── 1. the trousers only ────────────────────────────────────────────────────
src = Image.open(cut).convert("RGBA")
src = src.resize((src.width // 2, src.height // 2), Image.LANCZOS)     # plenty for product images, faster
a = np.asarray(src).astype(np.float32) / 255
h, w = a.shape[:2]
L, S, A = lum(a), sat(a), a[..., 3]
fabric = (A > 0.5) & (L > 0.5) & (S < 0.18)
# drawstring: dark pixels in the middle of the waistband
cord = np.zeros_like(fabric)
cord[int(h * 0.06):int(h * 0.3), int(w * 0.33):int(w * 0.67)] = True
cord &= (A > 0.5) & (L < 0.35) & (S < 0.3)
keep = largest(fabric)
keep = morph(morph(keep, 9, "grow"), 9, "shrink")                     # close small gaps (seams, folds)
keep |= cord & morph(keep, 41, "grow")
keep &= A > 0.3
# the hands sat in the pockets: close those notches in the upper part, fill them as plain fabric
# the hip area is convex: its convex outline rebuilds the sides cleanly
ys0 = np.where(keep.any(1))[0]
top = ys0.min() + int((ys0.max() - ys0.min()) * 0.33)
pts = np.column_stack(np.where(keep[:top])[::-1]).astype(np.int32)
hull = np.zeros(keep.shape, np.uint8)
cv2.fillPoly(hull, [cv2.convexHull(pts)], 255)
closed = keep.copy()
closed[:top] |= hull[:top] > 0
closed = fill_outline(close(closed, 9))
patch = closed & ~keep
a[patch, :3] = np.median(a[keep & ~cord, :3], axis=0)
a[patch, 3] = 1.0
keep = closed
ys, xs = np.where(keep)
keep[:ys.min() + int(h * 0.012)] = False                                # ragged top edge
ys, xs = np.where(keep)
a[..., 3] = np.where(keep, np.maximum(A, patch * 1.0), 0)
a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
h, w = a.shape[:2]

# recolour to black, keeping the photo's folds (same method as photo-blanks.py)
L = lum(a); m = a[..., 3] > 0.5
ref = np.percentile(L[m], 90)
shade = np.clip(L / ref, 0, 1.15)
black = a.copy()
lift = (shade - 1.0) * 0.22 + (shade ** 4) * 0.05
black[..., :3] = np.clip(0.085 + lift[..., None], 0, 1)
cordmask = (lum(a) < 0.35)
black[cordmask, :3] = np.clip(a[cordmask, :3] * 0.6 + 0.02, 0, 1)    # drawstring stays a little darker


def canvas(g, pad=0.05):
    im = Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA")
    im.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(0.8)))
    s = min(W * (1 - 2 * pad) / im.width, H * (1 - 2 * pad) / im.height)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c.paste(im, ((W - im.width) // 2, (H - im.height) // 2), im)
    return c


canvas(black).save(os.path.join(out, "joggers-black.png"), optimize=True)


# ── 2. the print, cut out of the tee's product photo ────────────────────────
def tee_print(tid):
    im = Image.open(os.path.join(tees, f"{tid}.webp")).convert("RGB")
    t = np.asarray(im).astype(np.float32) / 255
    th, tw = t.shape[:2]
    Lt = lum(t)
    tee = largest(Lt < 0.2, step=4)                                     # the black garment
    filled = fill_outline(close(tee, 15))                               # garment incl. the print area
    mx = t.max(-1)
    art = filled & (mx > 0.2)
    art &= ~morph(~filled, 31, "grow")                                  # stay off the garment's edge
    ys, xs = np.where(art)
    if not len(ys):
        raise SystemExit(f"no print found in {tid}")
    # ignore stray specks: take the dense part of the print
    y0, y1 = np.percentile(ys, [0.5, 99.5]).astype(int)
    x0, x1 = np.percentile(xs, [0.5, 99.5]).astype(int)
    pad = 6
    crop = t[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    keepc = filled[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]
    alpha = np.clip((crop.max(-1) - 0.13) / 0.22, 0, 1) * keepc
    rgba = np.dstack([crop, alpha])
    return rgba


def place(g, art, cx, cy, wfrac):
    gh, gw = g.shape[:2]
    ah, aw = art.shape[:2]
    nw = int(gw * wfrac); nh = int(nw * ah / aw)
    a = np.asarray(Image.fromarray((art * 255).astype(np.uint8), "RGBA").resize((nw, nh), Image.LANCZOS)).astype(np.float32) / 255
    x0 = int(gw * cx - nw / 2); y0 = int(gh * cy - nh / 2)
    reg = g[y0:y0 + nh, x0:x0 + nw].copy()
    Lr = lum(reg)
    ref = np.median(Lr[reg[..., 3] > 0.5]) if (reg[..., 3] > 0.5).any() else 0.1
    shade = 1 + (np.clip(Lr / max(ref, 1e-3), 0.5, 1.6) - 1) * 0.5          # folds show through the ink
    al = a[..., 3] * reg[..., 3] * 0.95
    p = np.clip(a[..., :3] * shade[..., None] * 0.95, 0, 1)
    reg[..., :3] = reg[..., :3] * (1 - al[..., None]) + p * al[..., None]
    g[y0:y0 + nh, x0:x0 + nw] = reg
    return g, (x0, y0, nw, nh)


for tid in ids:
    art = tee_print(tid)
    # left thigh (viewer's right), keep tall prints narrower
    ah, aw = art.shape[:2]
    wfrac = 0.25 if ah / aw < 1.3 else 0.2
    g, (x0, y0, nw, nh) = place(black.copy(), art, 0.655, 0.41, wfrac * 0.85)
    canvas(g).save(os.path.join(out, f"{tid}-front.png"), optimize=True)
    # close-up of the print on the fabric
    gh, gw = g.shape[:2]
    cxp, cyp = x0 + nw / 2, y0 + nh / 2
    side = int(max(nw, nh) * 1.5)
    bx0 = int(max(0, min(gw - side, cxp - side / 2))); by0 = int(max(0, min(gh - side * 1.25, cyp - side * 0.6)))
    crop = g[by0:by0 + int(side * 1.25), bx0:bx0 + side]
    det = Image.fromarray((np.clip(crop, 0, 1) * 255).astype(np.uint8), "RGBA")
    bg = Image.new("RGB", det.size, (236, 234, 230)); bg.paste(det, (0, 0), det)
    bg.resize((W, H), Image.LANCZOS).save(os.path.join(out, f"{tid}-detail.jpg"), quality=88)
    print(tid, "print", art.shape[1], "x", art.shape[0])
