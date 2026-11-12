"""Back view for each tote bag: the same product photo, the printed panel replaced by plain fabric
(colour and light taken from the bag's own plain edges, plus the fabric grain), mirrored.
Seams, handles and the bag's outline stay from the real photo.
usage: python tote-backs.py <images_dir> <out_dir> <id> [<id> ...]"""
import os
import sys

import cv2
import numpy as np

src, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True)

for tid in sys.argv[3:]:
    img = cv2.imread(os.path.join(src, f"{tid}.webp"), cv2.IMREAD_COLOR).astype(np.float32)
    h, w = img.shape[:2]
    lab = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    corners = np.concatenate([lab[:20, :20].reshape(-1, 3), lab[:20, -20:].reshape(-1, 3)])
    bag = np.linalg.norm(lab - np.median(corners, 0), axis=2) > 14
    n, lbl, stats, _ = cv2.connectedComponentsWithStats(bag.astype(np.uint8))
    bag = lbl == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
    # fill the outline: white parts of a print must not count as holes in the bag
    cs, _ = cv2.findContours(bag.astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros((h, w), np.uint8)
    cv2.drawContours(filled, cs, -1, 255, thickness=cv2.FILLED)
    bag = filled > 0
    widths = bag.sum(1)
    body = bag & (widths > widths.max() * 0.55)[:, None]          # the panel, not the handles
    inner = cv2.erode(body.astype(np.uint8), np.ones((31, 31), np.uint8)) > 0
    ys = np.where(inner.any(1))[0]
    y0, y1 = ys.min(), ys.max()
    # plain fabric samples: a thin band just inside the left and right seams of every row
    samples = []
    for y in range(y0, y1 + 1):
        xs = np.where(inner[y])[0]
        if len(xs) < 20:
            continue
        k = max(6, int(len(xs) * 0.035))
        samples.append(np.concatenate([img[y, xs[:k]], img[y, xs[-k:]]]))
    flat = np.concatenate(samples)
    # the fabric colour: the top band of the panel (prints rarely reach it), else the edge bands
    topband = img[y0:y0 + max(8, (y1 - y0) // 25)][inner[y0:y0 + max(8, (y1 - y0) // 25)]]
    fabric = np.median(topband, 0) if len(topband) > 200 else np.median(flat, 0)
    # light: smooth vertical profile from the edge bands (prints touching one edge are ignored by the median)
    prof = np.array([np.median(np.concatenate([img[y, np.where(inner[y])[0][:12]], img[y, np.where(inner[y])[0][-12:]]]), 0)
                     if inner[y].sum() > 24 else fabric for y in range(h)])
    prof = cv2.GaussianBlur(prof.reshape(h, 1, 3), (1, 0), sigmaX=1, sigmaY=40).reshape(h, 3)
    # rows where a print touches the seam would tint the light: fall back to the fabric colour there
    far = np.linalg.norm(prof - fabric, axis=1) > 14
    prof[far] = fabric
    prof = cv2.GaussianBlur(prof.reshape(h, 1, 3), (1, 0), sigmaX=1, sigmaY=25).reshape(h, 3)
    prof = np.clip(prof, fabric * 0.88, fabric * 1.12)
    base = np.repeat(prof[:, None, :], w, axis=1)
    # fabric grain: fine even noise (a woven look without repeating stripes)
    rng = np.random.default_rng(int(tid))
    gfull = cv2.GaussianBlur(rng.normal(0, 3.0, (h, w)).astype(np.float32), (0, 0), 0.7)[..., None]
    plain = np.clip(base + gfull * 0.9, 0, 255)
    # blend the plain panel in with a soft edge, keep seams/handles/outline from the photo
    # the strip between the seam and the panel keeps the photo, except stray print pixels in it
    ring = (cv2.erode(body.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0) & ~inner   # off the outline itself
    stray = ring & (np.linalg.norm(img - fabric, axis=2) > 45)
    stray = cv2.dilate(stray.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    stray &= cv2.erode(body.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    m = np.maximum(cv2.GaussianBlur(inner.astype(np.float32), (0, 0), 6), cv2.GaussianBlur(stray.astype(np.float32), (0, 0), 1.5))[..., None]
    outimg = img * (1 - m) + plain * m
    back = cv2.flip(outimg.astype(np.uint8), 1)
    cv2.imwrite(os.path.join(out, f"{tid}-back.jpg"), back, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(tid, "ok")
