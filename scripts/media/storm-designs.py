"""Horwalle "STORM" — horror / lightning / mentality print designs.

Built from free Pexels photos (Pexels License: commercial use and modification allowed; the
photos are reworked into screen-print style art, never sold as they are) plus type in OFL fonts
(Anton, Space Mono, UnifrakturMaguntia). Sources are listed in MEDIA_LICENSES.md.

For dark garments ("bone"): the light parts of the photo become light ink and the dark parts
become the garment itself (fades out at the edges, no box). For light garments ("ink"): the
photo is printed as a framed box in black ink.

usage: python storm-designs.py <photos_dir> <fonts_dir> <out_dir>
writes <name>-bone.png / <name>-ink.png (300 dpi, transparent) and designs.json; nox-distress.py
then adds the worn texture.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PHOTOS, FONTS, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)

BONE = (236, 232, 224)
INK = (17, 17, 17)
designs = {}


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def text_layer(canvas_size, items):
    """items: (text, font file, size, cx, baseline_y, tracking px). Returns an L mask."""
    m = Image.new("L", canvas_size, 0)
    d = ImageDraw.Draw(m)
    for text, ff, size, cx, y, tr in items:
        f = font(ff, size)
        widths = [d.textlength(ch, font=f) for ch in text]
        total = sum(widths) + tr * (len(text) - 1)
        x = cx - total / 2
        for ch, w in zip(text, widths):
            d.text((x, y), ch, font=f, fill=255, anchor="ls")
            x += w + tr
    return np.asarray(m).astype(np.float32) / 255


def fit_size(text, ff, width, tr=0):
    """font size that makes text exactly `width` px wide"""
    f = font(ff, 1000)
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    w = sum(d.textlength(ch, font=f) for ch in text) + tr * (len(text) - 1)
    return int(1000 * width / w)


def photo(pid, box, crop=(0.5, 0.5), lo=0.08, hi=0.92, gamma=1.0, invert=False):
    """grey photo resized to cover box (w, h); crop = focus point. returns float 0..1 luminance"""
    im = Image.open(os.path.join(PHOTOS, f"{pid}.jpg")).convert("L")
    w, h = box
    s = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * s + 1), int(im.height * s + 1)), Image.LANCZOS)
    x0 = int((im.width - w) * crop[0])
    y0 = int((im.height - h) * crop[1])
    g = np.asarray(im.crop((x0, y0, x0 + w, y0 + h))).astype(np.float32) / 255
    g = np.clip((g - lo) / (hi - lo), 0, 1) ** gamma
    return 1 - g if invert else g


def fade(h, w, edge=0.16, shape="rect"):
    """soft edge mask so the art melts into the garment"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    if shape == "oval":
        r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
        return np.clip((1 - r) / edge, 0, 1)
    fx = np.clip(np.minimum(xx, w - 1 - xx) / (w * edge), 0, 1)
    fy = np.clip(np.minimum(yy, h - 1 - yy) / (h * edge), 0, 1)
    return np.minimum(fx, fy) ** 1.2


def rough_box(h, w, seed=1):
    """rectangle with torn, uneven edges (for the framed box prints)"""
    rng = np.random.default_rng(seed)
    m = np.ones((h, w), np.float32)
    small = rng.random((max(2, h // 40), max(2, w // 40))).astype(np.float32)
    n = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255
    yy, xx = np.mgrid[0:h, 0:w]
    edge = np.minimum(np.minimum(xx, w - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
    m[edge < 6 + n * 38] = 0
    return m


def bolt(size, w=1.0):
    """lightning bolt icon as an L mask"""
    m = Image.new("L", (size, size), 0)
    s = size / 100
    pts = [(58, 2), (22, 54), (46, 54), (34, 98), (80, 40), (54, 40), (70, 2)]
    ImageDraw.Draw(m).polygon([(x * s * w + size * (1 - w) / 2, y * s) for x, y in pts], fill=255)
    return np.asarray(m).astype(np.float32) / 255


def paste(dst, src, x, y):
    h, w = src.shape
    H, W = dst.shape
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return
    dst[y0:y1, x0:x1] = np.maximum(dst[y0:y1, x0:x1], src[y0 - y:y1 - y, x0 - x:x1 - x])


def save(name, alpha_bone, alpha_ink, note, distress):
    for tag, a, col in (("bone", alpha_bone, BONE), ("ink", alpha_ink, INK)):
        if a is None:
            continue
        h, w = a.shape
        rgba = np.zeros((h, w, 4), np.uint8)
        rgba[..., 0], rgba[..., 1], rgba[..., 2] = col
        rgba[..., 3] = (np.clip(a, 0, 1) * 255).astype(np.uint8)
        im = Image.fromarray(rgba, "RGBA")
        bb = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
        im = im.crop(bb)
        pad = int(max(im.size) * 0.02)
        out = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
        out.paste(im, (pad, pad))
        out.save(os.path.join(OUT, f"{name}-{tag}.png"), optimize=True, dpi=(300, 300))
        designs[f"{name}-{tag}"] = {"w": out.width, "h": out.height, "px": [out.width, out.height], "note": note, "distress": distress}
        print(f"{name}-{tag}", out.size, f"{out.width / 300 * 2.54:.1f} cm wide")


W, H = 4500, 5400   # 15 x 18 in at 300 dpi


# ── 1. STRIKE — a single bolt over the wordmark ─────────────────────────────
def strike():
    pw, ph = 4400, 4300
    g = photo("15580058", (int(pw * 1.5), int(ph * 1.5)), crop=(0.12, 0.08), lo=0.4, hi=0.86, gamma=1.1)[:ph, :pw]
    bone = np.zeros((H, W), np.float32)
    paste(bone, g * fade(ph, pw, 0.22), (W - pw) // 2, 0)
    t = text_layer((W, H), [
        ("HORWALLE", "Anton.ttf", fit_size("HORWALLE", "Anton.ttf", 4300, 30), W // 2, 4720, 30),
        ("ELECTRIC MENTALITY  —  NO. 01", "SpaceMono-Bold.ttf", 120, W // 2, 5050, 18),
    ])
    bone = np.maximum(bone, t)
    ink = np.zeros((H, W), np.float32)
    box = (1 - photo("15580058", (int(3300 * 1.5), int(3800 * 1.5)), crop=(0.12, 0.08), lo=0.3, hi=0.9, gamma=1.0)[:3800, :3300]) * rough_box(3800, 3300, 3)
    paste(ink, box, (W - 3300) // 2, 0)
    ink = np.maximum(ink, t)
    save("strike-back", bone, ink, "back, 15x18 in", 0.3)


# ── 2. MENTALITY — skull out of the dark ────────────────────────────────────
def mentality():
    bone = np.zeros((H, W), np.float32)
    head = text_layer((W, H), [("MENTALITY", "Anton.ttf", fit_size("MENTALITY", "Anton.ttf", 4300, 20), W // 2, 1250, 20)])
    pw, ph = 3400, 3900
    g = photo("5611491", (pw, ph), crop=(0.5, 0.45), lo=0.04, hi=0.62, gamma=0.95)
    paste(bone, g * fade(ph, pw, 0.3, "oval"), (W - pw) // 2, 1150)
    bone = np.maximum(bone, head)
    foot = text_layer((W, H), [("FEAR IS A STATE OF MIND", "SpaceMono-Bold.ttf", 130, W // 2, 5250, 22)])
    bone = np.maximum(bone, foot)
    ink = np.zeros((H, W), np.float32)
    box = (1 - photo("5611491", (3600, 3700), crop=(0.5, 0.45), lo=0.06, hi=0.7, gamma=1.25)) * rough_box(3700, 3600, 5)
    paste(ink, box, (W - 3600) // 2, 1380)
    ink = np.maximum(np.maximum(ink, head), foot)
    save("mentality-back", bone, ink, "back, 15x18 in", 0.35)


# ── 3. STORM — wide storm in a torn frame ───────────────────────────────────
def storm():
    bw, bh = 4300, 2900
    top = text_layer((W, H), [("Horwalle", "UnifrakturMaguntia-Book.ttf", fit_size("Horwalle", "UnifrakturMaguntia-Book.ttf", 3600), W // 2, 1050, 0)])
    foot = text_layer((W, H), [
        ("BORN IN THE STORM", "Anton.ttf", fit_size("BORN IN THE STORM", "Anton.ttf", 4300, 24), W // 2, 4720, 24),
        ("NO CALM  ·  NO SHELTER  ·  NO FEAR", "SpaceMono-Bold.ttf", 110, W // 2, 5000, 16),
    ])
    g = photo("10349161", (bw, bh), crop=(0.5, 0.5), lo=0.05, hi=0.9, gamma=1.1)
    bone = np.zeros((H, W), np.float32)
    paste(bone, g * rough_box(bh, bw, 7), (W - bw) // 2, 1250)
    bone = np.maximum(np.maximum(bone, top), foot)
    ink = np.zeros((H, W), np.float32)
    paste(ink, (1 - g) * rough_box(bh, bw, 7), (W - bw) // 2, 1250)
    ink = np.maximum(np.maximum(ink, top), foot)
    save("storm-back", bone, ink, "back, 15x18 in", 0.4)


# ── 4. SAVE YOURSELF — hands reaching up from the dark ──────────────────────
def reach():
    pw, ph = 3800, 3900
    g = photo("12660640", (pw, ph), crop=(0.5, 0.75), lo=0.1, hi=0.75, gamma=1.3)
    size = fit_size("YOURSELF", "Anton.ttf", 4300, 26)
    cap = int(size * 0.74)                     # Anton cap height
    y1 = 120 + cap
    y2 = y1 + cap + 90
    head = text_layer((W, H), [
        ("SAVE", "Anton.ttf", size, W // 2, y1, 26),
        ("YOURSELF", "Anton.ttf", size, W // 2, y2, 26),
    ])
    top = y2 + 140
    bone = np.zeros((H, W), np.float32)
    paste(bone, g * fade(ph, pw, 0.2), (W - pw) // 2, top)
    bone = np.maximum(bone, head)
    ink = np.zeros((H, W), np.float32)
    paste(ink, (1 - g) * rough_box(ph, pw, 9), (W - pw) // 2, top)
    ink = np.maximum(ink, head)
    save("reach-back", bone, ink, "back, 15x18 in", 0.35)


# ── 5. HALF DEAD — half-lit skull, big front print ──────────────────────────
def halfdead():
    pw, ph = 3300, 4300
    g = photo("36218813", (pw, ph), crop=(0.55, 0.42), lo=0.05, hi=0.8, gamma=1.2)
    bone = np.zeros((H, W), np.float32)
    paste(bone, g * fade(ph, pw, 0.18), (W - pw) // 2 + 150, 300)
    side = Image.new("L", (H, 420), 0)
    d = ImageDraw.Draw(side)
    f = font("Anton.ttf", 360)
    d.text((H // 2, 330), "HALF DEAD  /  HALF ALIVE", font=f, fill=255, anchor="ms")
    side = np.asarray(side.rotate(90, expand=True)).astype(np.float32) / 255
    paste(bone, side, 420, 0)
    bone = np.maximum(bone, text_layer((W, H), [("HORWALLE — MENTALITY DIVISION", "SpaceMono-Bold.ttf", 110, W // 2 + 300, 5000, 14)]))
    save("halfdead-big", bone, None, "big front, 15x18 in", 0.3)


# ── 6. small marks: chest, cap, leg ─────────────────────────────────────────
def marks():
    cw = ch = 1200
    for tag in ("bone", "ink"):
        pass
    a = np.zeros((ch, cw), np.float32)
    paste(a, bolt(560), (cw - 560) // 2, 60)
    a = np.maximum(a, text_layer((cw, ch), [("MENTALITY", "Anton.ttf", fit_size("MENTALITY", "Anton.ttf", 1080, 8), cw // 2, 900, 8),
                                           ("HORWALLE", "SpaceMono-Bold.ttf", 70, cw // 2, 1050, 22)]))
    save("bolt-chest", a, a, "left chest, 4x4 in", 0.15)
    a = np.zeros((ch, cw), np.float32)
    paste(a, bolt(900), (cw - 900) // 2, 150)
    save("bolt-cap", a, a, "cap front, 4x4 in (embroidery or print)", 0.1)
    lw, lh = 900, 3600
    leg = Image.new("L", (lh, lw), 0)
    d = ImageDraw.Draw(leg)
    s = fit_size("MENTALITY", "Anton.ttf", 2600, 10)
    d.text((1400, 640), "MENTALITY", font=font("Anton.ttf", s), fill=255, anchor="ms")
    leg = np.asarray(leg.rotate(90, expand=True)).astype(np.float32) / 255
    paste(leg, bolt(440), (lw - 440) // 2, 80)
    save("mentality-leg", leg, leg, "left leg, vertical, 3x12 in", 0.25)


strike(); mentality(); storm(); reach(); halfdead(); marks()
with open(os.path.join(OUT, "designs.json"), "w", encoding="utf-8") as fh:
    json.dump(designs, fh, indent=1)
print(len(designs), "files")
