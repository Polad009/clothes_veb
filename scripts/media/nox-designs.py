"""Horwalle "NOX" — dark streetwear print designs (original artwork), generated as vector SVG.

Direction (2026 research): gothic / grunge streetwear — blackletter type, cyber-sigil thorn lines,
four-point stars, chrome lettering, worn prints. Every shape here is drawn by this script;
nothing is traced or copied from another brand.

Fonts (SIL Open Font License, free for commercial printing): UnifrakturMaguntia, Grenze Gotisch,
Space Mono, Archivo. Text is converted to outlines, the printer needs no fonts.

usage: python nox-designs.py <fonts_dir> <out_dir>
Writes <out_dir>/<design>-<bone|ink>.svg and designs.json (render with render-designs.ts,
then nox-distress.py adds the worn texture to the PNGs).
"""
import json
import math
import os
import random
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

BONE = "#ECE8E0"   # ink on dark garments
INK = "#111111"    # ink on light garments


class Face:
    def __init__(self, file, axes=None):
        f = TTFont(os.path.join(FONTS, file))
        if axes:
            f = instantiateVariableFont(f, axes)
        self.gs = f.getGlyphSet()
        self.cmap = f.getBestCmap()
        self.upm = f["head"].unitsPerEm
        self.hmtx = f["hmtx"]
        cap = getattr(f["OS/2"], "sCapHeight", 0)
        self.cap = (cap or self.upm * 0.7) / self.upm

    def adv(self, ch):
        g = self.cmap.get(ord(ch))
        return self.hmtx[g][0] if g else self.upm * 0.3

    def width(self, text, size, tracking=0.0):
        s = size / self.upm
        return sum(self.adv(c) * s for c in text) + tracking * max(0, len(text) - 1)

    def glyph(self, ch, size, x, y):
        g = self.cmap.get(ord(ch))
        if g is None:
            return ""
        s = size / self.upm
        pen = SVGPathPen(self.gs)
        self.gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
        return pen.getCommands()

    def path(self, text, size, x, y, anchor="middle", tracking=0.0):
        s = size / self.upm
        w = self.width(text, size, tracking)
        x -= w / 2 if anchor == "middle" else (w if anchor == "end" else 0)
        parts = []
        for ch in text:
            d = self.glyph(ch, size, x, y)
            if d:
                parts.append(d)
            x += self.adv(ch) * s + tracking
        return " ".join(parts)

    def size_for_width(self, text, w, tracking=0.0):
        return (w - tracking * max(0, len(text) - 1)) * 1000 / self.width(text, 1000, 0)

    def arc(self, text, size, cx, cy, r, tracking=0.0):
        """text set on the top of a circle (centre cx, cy; baseline radius r)"""
        s = size / self.upm
        total = self.width(text, size, tracking)
        a = -total / 2 / r
        parts = []
        for ch in text:
            adv = self.adv(ch) * s
            mid = a + adv / 2 / r
            d = self.glyph(ch, size, -adv / 2, 0)
            if d:
                deg = math.degrees(mid)
                x = cx + r * math.sin(mid)
                y = cy - r * math.cos(mid)
                parts.append(f'<path transform="translate({x:.1f} {y:.1f}) rotate({deg:.2f})" d="{d}"/>')
            a += (adv + tracking) / r
        return "".join(parts)


FRAK = Face("UnifrakturMaguntia-Book.ttf")
GOTH = Face("GrenzeGotisch[wght].ttf", {"wght": 800})
GOTH_L = Face("GrenzeGotisch[wght].ttf", {"wght": 500})
MONO = Face("SpaceMono-Bold.ttf")
WIDE = Face("Archivo-VF.ttf", {"wght": 900, "wdth": 125})

designs = {}


def save(name, w, h, body, px_w, px_h, note, distress=0.0):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>'
    with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as fh:
        fh.write(svg)
    designs[name] = {"w": w, "h": h, "px": [px_w, px_h], "note": note, "distress": distress}


def P(d, color, extra=""):
    return f'<path d="{d}" fill="{color}" {extra}/>'


# ── geometry helpers ────────────────────────────────────────────────────────
def bez(p0, p1, p2, p3, n=28):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                    u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]))
    return out


def taper(pts, w0, w1, swell=0.0):
    """filled outline around a centre line, width going w0 -> w1 (plus a bulge in the middle)"""
    left, right = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        a = pts[max(i - 1, 0)]
        b = pts[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        t = i / (n - 1)
        w = (w0 * (1 - t) + w1 * t + swell * math.sin(math.pi * t)) / 2
        left.append((x + nx * w, y + ny * w))
        right.append((x - nx * w, y - ny * w))
    poly = left + right[::-1]
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in poly) + " Z"


def mirror(d_list, cx):
    """mirror a list of polygon paths around x = cx"""
    out = []
    for d in d_list:
        toks = d.replace("M", "").replace("Z", "").split(" L")
        pts = [tuple(map(float, t.split())) for t in toks]
        out.append("M" + " L".join(f"{2 * cx - x:.1f} {y:.1f}" for x, y in pts) + " Z")
    return out


def thorn(x, y, ang, length, width, bend=0.25, barbs=0, rnd=None):
    """a curved spike from (x, y) heading at ang (radians), optional little side barbs"""
    dx, dy = math.cos(ang), math.sin(ang)
    nx, ny = -dy, dx
    p3 = (x + dx * length, y + dy * length)
    p1 = (x + dx * length * 0.33 + nx * length * bend * 0.6, y + dy * length * 0.33 + ny * length * bend * 0.6)
    p2 = (x + dx * length * 0.7 + nx * length * bend, y + dy * length * 0.7 + ny * length * bend)
    pts = bez((x, y), p1, p2, p3)
    out = [taper(pts, width, 0.8)]
    for k in range(barbs):
        t = 0.3 + 0.5 * (k + 0.5) / barbs
        i = int(t * (len(pts) - 1))
        bx, by = pts[i]
        side = 1 if k % 2 == 0 else -1
        ba = ang + side * (0.75 + (rnd.random() * 0.25 if rnd else 0.1)) - bend * 0.6
        out.append(taper(bez((bx, by), (bx + math.cos(ba) * length * 0.08, by + math.sin(ba) * length * 0.08),
                             (bx + math.cos(ba) * length * 0.16, by + math.sin(ba) * length * 0.16),
                             (bx + math.cos(ba + side * 0.25) * length * 0.24, by + math.sin(ba + side * 0.25) * length * 0.24), 12),
                         width * 0.45, 0.5))
    return out


def star4(cx, cy, r, waist=0.16):
    """four-point sparkle star"""
    pts = []
    for i in range(8):
        a = -math.pi / 2 + i * math.pi / 4
        rr = r if i % 2 == 0 else r * waist
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    # curved sides: quadratic through the waist points
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(0, 8, 2):
        w = pts[i + 1]
        nxt = pts[(i + 2) % 8]
        d += f" Q{(w[0] * 2 + cx) / 3:.1f} {(w[1] * 2 + cy) / 3:.1f} {nxt[0]:.1f} {nxt[1]:.1f}"
    return d + " Z"


def sigil(cx, cy, scale, seed, gap=None):
    """symmetric cyber-sigil: a swelling spine with layered curved thorns and horns, mirrored
    left/right. gap=(y0, y1) keeps a horizontal band clear (for type)."""
    rnd = random.Random(seed)
    half = []
    top, bot = cy - 830 * scale, cy + 830 * scale
    g0, g1 = gap if gap else (cy, cy)
    # spine: two swelling blades, broken around the type band
    spine = [taper(bez((cx, top), (cx, top + 200 * scale), (cx, g0 - 260 * scale), (cx, g0 - 40 * scale), 50), 1, 1, 34 * scale),
             taper(bez((cx, g1 + 40 * scale), (cx, g1 + 260 * scale), (cx, bot - 200 * scale), (cx, bot), 50), 1, 1, 34 * scale)]
    # horns: big outward hooks at the top and bottom ends
    half += thorn(cx + 6, top + 120 * scale, math.radians(-62), 520 * scale, 30 * scale, bend=0.55, barbs=2, rnd=rnd)
    half += thorn(cx + 6, bot - 120 * scale, math.radians(62), 520 * scale, 30 * scale, bend=-0.55, barbs=2, rnd=rnd)
    # side thorns along both blades
    for blade, (y0, y1), up in (("top", (top + 230 * scale, g0 - 80 * scale), True), ("bot", (g1 + 80 * scale, bot - 230 * scale), False)):
        n = 5
        for i in range(n):
            t = (i + 0.5) / n
            y = y0 + (y1 - y0) * t
            near = 1 - abs((y - cy) / (830 * scale))          # longer near the middle
            length = (240 + 430 * near + rnd.uniform(-40, 40)) * scale
            ang = math.radians((-28 if up else 28) + rnd.uniform(-9, 9))
            half += thorn(cx + 8, y, ang, length, (18 + 18 * near) * scale, bend=-0.38 if up else 0.38, barbs=2, rnd=rnd)
            # fine echo line: thin parallel thorn for the "fine-line" look
            half += thorn(cx + 30 * scale, y + (24 if up else -24) * scale, ang + (0.12 if up else -0.12), length * 0.8, 5 * scale,
                          bend=-0.42 if up else 0.42)
    # wings framing the type band
    if gap:
        for s, yy in ((-1, g0 - 30 * scale), (1, g1 + 30 * scale)):
            half += thorn(cx + 40 * scale, yy, math.radians(-8 * s), 700 * scale, 16 * scale, bend=-0.16 * s, barbs=3, rnd=rnd)
    return spine + half + mirror(half, cx)


def ink_tag(ink):
    return "bone" if ink == BONE else "ink"


BIG = (1500, 1800, 4500, 5400)     # 15 x 18 in, back or big front
CHEST = (400, 400, 1200, 1200)     # 4 x 4 in


# ── 1. THORN — big front print ──────────────────────────────────────────────
def thorn_big(ink):
    w, h = BIG[:2]
    cx, cy = w / 2, 860
    body = "".join(P(d, ink) for d in sigil(cx, cy, 0.86, 7, gap=(740, 1000)))
    s = FRAK.size_for_width("Horwalle", 1180)
    body += P(FRAK.path("Horwalle", s, cx, 975), ink)
    body += P(MONO.path("NOX / 001", 44, cx, 1690, tracking=22), ink)
    save("thorn-big-" + ink_tag(ink), *BIG[:2], body, *BIG[2:], "big front, 15x18 in", distress=0.35)


# ── 2. GOTHIC — arched blackletter, big back print ──────────────────────────
def gothic(ink):
    w, h = BIG[:2]
    cx = w / 2
    s = FRAK.size_for_width("Horwalle", 1300) * 1.0
    body = f'<g fill="{ink}">' + FRAK.arc("Horwalle", s, cx, 1260, 820) + "</g>"
    # star with a thin halo and rays
    body += P(star4(cx, 1020, 260, 0.13), ink)
    body += f'<circle cx="{cx}" cy="1020" r="330" fill="none" stroke="{ink}" stroke-width="9"/>'
    body += f'<circle cx="{cx}" cy="1020" r="352" fill="none" stroke="{ink}" stroke-width="3"/>'
    for k in range(24):
        a = k * math.pi / 12
        r0, r1 = 372, 372 + (46 if k % 2 == 0 else 22)
        body += (f'<line x1="{cx + r0 * math.cos(a):.1f}" y1="{1020 + r0 * math.sin(a):.1f}" '
                 f'x2="{cx + r1 * math.cos(a):.1f}" y2="{1020 + r1 * math.sin(a):.1f}" stroke="{ink}" stroke-width="7"/>')
    for sx, sy, r in ((290, 820, 46), (1210, 820, 46), (330, 1300, 30), (1170, 1300, 30)):
        body += P(star4(sx, sy, r, 0.18), ink)
    body += P(GOTH.path("Est. MMXXVI", 118, cx, 1575), ink)
    body += P(MONO.path("BAKU · AZERBAIJAN", 46, cx, 1680, tracking=20), ink)
    save("gothic-back-" + ink_tag(ink), *BIG[:2], body, *BIG[2:], "back, 15x18 in", distress=0.55)


# ── 3. ODLAR YURDU — flame sigil, big back print ────────────────────────────
def odlar(ink):
    w, h = BIG[:2]
    cx = w / 2
    rnd = random.Random(31)
    half = []
    # flame tongues: tall curved spikes rising from a common root, longest in the middle
    root = 1130
    for i in range(6):
        off = 18 + i * 62
        length = 820 - i * 115 + rnd.uniform(-30, 30)
        ang = math.radians(-90 + 6 + i * 11)
        half += thorn(cx + off, root, ang, length, 44 - i * 4, bend=0.42 - i * 0.03, barbs=1 if i < 4 else 0, rnd=rnd)
    flames = [taper(bez((cx, root), (cx - 30, root - 380), (cx + 30, root - 640), (cx, root - 930), 60), 56, 0.8)]
    flames += half + mirror(half, cx)
    body = "".join(P(d, ink) for d in flames)
    # base bar with thorns pointing down
    body += f'<rect x="{cx - 470}" y="{root + 20}" width="940" height="12" fill="{ink}"/>'
    for s in (-1, 1):
        for k in range(4):
            x = cx + s * (90 + k * 110)
            body += P(thorn(x, root + 32, math.radians(90 + s * 12), 70 + k * 18, 12)[0], ink)
    body += P(GOTH.path("Odlar Yurdu", GOTH.size_for_width("Odlar Yurdu", 1240), cx, 1500), ink)
    body += P(MONO.path("LAND OF FIRE — HORWALLE", 44, cx, 1640, tracking=16), ink)
    save("odlar-back-" + ink_tag(ink), *BIG[:2], body, *BIG[2:], "back, 15x18 in", distress=0.45)


# ── 4. STAR — concentric four-point star, big back print ────────────────────
def star(ink):
    w, h = BIG[:2]
    cx, cy = w / 2, 760
    body = ""
    for k in range(8):
        r = 640 - k * 68
        sw = 12 - k
        body += f'<path d="{star4(cx, cy, r, 0.16)}" fill="none" stroke="{ink}" stroke-width="{sw}" stroke-linejoin="miter"/>'
    body += P(star4(cx, cy, 90, 0.18), ink)
    s = FRAK.size_for_width("Horwalle", 980)
    body += P(FRAK.path("Horwalle", s, cx, 1560), ink)
    body += P(MONO.path("NO SIGNAL  ·  NO SAVIOUR", 40, cx, 1680, tracking=14), ink)
    save("star-back-" + ink_tag(ink), *BIG[:2], body, *BIG[2:], "back, 15x18 in", distress=0.4)


# ── 5. CHROME — liquid chrome lettering (full colour, for black garments) ───
def chrome():
    w, h = 1500, 700
    cx = w / 2
    s = FRAK.size_for_width("Horwalle", 1380)
    d = FRAK.path("Horwalle", s, cx, 520)
    grad = ('<defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="#ffffff"/><stop offset="0.28" stop-color="#cfd3d8"/>'
            '<stop offset="0.46" stop-color="#5c6168"/><stop offset="0.52" stop-color="#2a2d31"/>'
            '<stop offset="0.6" stop-color="#9aa0a7"/><stop offset="0.8" stop-color="#f4f6f8"/>'
            '<stop offset="1" stop-color="#8d939a"/></linearGradient>'
            '<linearGradient id="e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d42"/>'
            '<stop offset="1" stop-color="#0d0e10"/></linearGradient></defs>')
    body = grad
    body += f'<path d="{d}" fill="url(#e)" transform="translate(10 16)"/>'                 # depth
    body += f'<path d="{d}" fill="url(#c)" stroke="#f8fafc" stroke-width="5" stroke-linejoin="round"/>'
    for sx, sy, r in ((180, 170, 70), (1330, 600, 52), (1240, 150, 34), (330, 610, 28)):
        body += P(star4(sx, sy, r, 0.14), "#f4f6f8")
    save("chrome-back-bone", w, h, body, 4500, 2100, "back, 15x7 in, full colour (DTF / DTG)", distress=0.0)


# ── 6. H monogram with crossing thorns — chest / cap ───────────────────────
def mono_h(ink, name, w, h, px, note):
    cx, cy = w / 2, h / 2
    sc = min(w, h) / 400
    s = FRAK.size_for_width("H", 200 * sc)
    body = P(FRAK.path("H", s, cx, cy + 105 * sc), ink)
    for side in (-1, 1):
        for k, (dy, L, wd) in enumerate(((-10, 150, 13), (30, 105, 8))):
            for d in thorn(cx + side * 95 * sc, cy + dy * sc, math.radians(90 - side * 90 - side * (8 + 10 * k)), L * sc, wd * sc,
                           bend=0.3 * side, barbs=1, rnd=random.Random(5 + k)):
                body += P(d, ink)
    body += P(star4(cx, cy - 165 * sc, 22 * sc, 0.2), ink)
    save(f"{name}-{ink_tag(ink)}", w, h, body, *px, note, distress=0.15)


# ── 7. leg — vertical thorn line with blackletter ──────────────────────────
def leg(ink):
    w, h = 300, 1200
    s = GOTH.size_for_width("Horwalle", 900)
    d = GOTH.path("Horwalle", s, 0, s * GOTH.cap / 2)
    body = f'<g transform="translate(150 560) rotate(-90)">{P(d, ink)}</g>'
    body += P(taper(bez((150, 1060), (150, 1100), (150, 1150), (150, 1195), 12), 14, 0.8), ink)
    body += P(star4(150, 1040, 34, 0.2), ink)
    for k in range(3):
        y = 1085 + k * 32
        for sd in (-1, 1):
            body += P(thorn(150, y, math.radians(90 + sd * 55), 40, 6)[0], ink)
    save("nox-leg-" + ink_tag(ink), w, h, body, 900, 3600, "left leg, vertical, 3x12 in", distress=0.3)


for ink in (BONE, INK):
    thorn_big(ink); gothic(ink); odlar(ink); star(ink); leg(ink)
    mono_h(ink, "h-chest", *CHEST[:2], CHEST[2:], "left chest, 4x4 in")
    mono_h(ink, "h-cap", 400, 400, (1200, 1200), "cap front, 4x4 in (embroidery or print)")
chrome()

with open(os.path.join(OUT, "designs.json"), "w", encoding="utf-8") as fh:
    json.dump(designs, fh, indent=1)
print(len(designs), "designs")
