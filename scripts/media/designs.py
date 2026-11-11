"""Horwalle "Bakı Seriyası 01" — original print designs, generated as vector SVG.

Text is converted to outlines (no fonts needed by the printer). Fonts: Archivo, Anton,
Space Mono — all SIL Open Font License (free for commercial printing).

usage: python designs.py <fonts_dir> <out_dir>
Writes <out_dir>/<design>.svg plus designs.json (design -> canvas size and target pixel size).
"""
import json
import math
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

BONE = "#EDEAE3"   # ink for dark garments
INK = "#111111"    # ink for light garments


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

    def path(self, text, size, x, y, anchor="middle", tracking=0.0):
        """outline path; y is the baseline"""
        s = size / self.upm
        w = self.width(text, size, tracking)
        x -= w / 2 if anchor == "middle" else (w if anchor == "end" else 0)
        parts = []
        for ch in text:
            g = self.cmap.get(ord(ch))
            if g is not None:
                pen = SVGPathPen(self.gs)
                self.gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
                d = pen.getCommands()
                if d:
                    parts.append(d)
            x += self.adv(ch) * s + tracking
        return " ".join(parts)

    def size_for_cap(self, cap_px):
        return cap_px / self.cap

    def size_for_width(self, text, w, tracking=0.0):
        base = self.width(text, 1000, 0)
        return (w - tracking * max(0, len(text) - 1)) * 1000 / base


BLACK_X = Face("Archivo-VF.ttf", {"wght": 900, "wdth": 125})   # headline: black, expanded
BLACK = Face("Archivo-VF.ttf", {"wght": 900, "wdth": 100})
MED = Face("Archivo-VF.ttf", {"wght": 600, "wdth": 110})
ANTON = Face("Anton.ttf")
MONO = Face("SpaceMono-Bold.ttf")

designs = {}


def save(name, w, h, body, px_w, px_h, note):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{body}</svg>'
    with open(os.path.join(OUT, f"{name}.svg"), "w", encoding="utf-8") as fh:
        fh.write(svg)
    designs[name] = {"w": w, "h": h, "px": [px_w, px_h], "note": note}


def P(d, color):
    return f'<path d="{d}" fill="{color}"/>'


def stroke(d, color, sw, extra=""):
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'


# canvases (in hundredths of an inch): back 15x18 in, chest 4x4 in, cap 5x2.5 in, leg 3x12 in
BACK = (1500, 1800, 4500, 5400)
CHEST = (400, 400, 1200, 1200)

# ── 1. Ə ─────────────────────────────────────────────────────────────────────
def schwa(ink):
    w, h = BACK[:2]
    big = BLACK_X.size_for_cap(1080)
    body = P(BLACK_X.path("Ə", big, w / 2, 1210), ink)
    body += f'<rect x="250" y="1330" width="1000" height="10" fill="{ink}"/>'
    body += P(MED.path("BAKI — BAKU", 92, w / 2, 1490, tracking=26), ink)
    body += P(MONO.path("40.4093° N   49.8671° E", 58, w / 2, 1600, tracking=4), ink)
    body += P(MONO.path("HORWALLE / BAKI SERİYASI 01", 40, w / 2, 1745, tracking=10), ink)
    save("schwa-back-" + ("bone" if ink == BONE else "ink"), *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    cw, ch = CHEST[:2]
    body = P(BLACK_X.path("Ə", BLACK_X.size_for_cap(300), cw / 2, 350), ink)
    save("schwa-chest-" + ("bone" if ink == BONE else "ink"), *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 2. Küləklər Şəhəri (City of Winds) ─────────────────────────────────────
def wind_lines(x0, y0, width, n, gap, sw, ink, curls=(1, 4)):
    out = ""
    for i in range(n):
        y = y0 + i * gap
        L = width * (0.55 + 0.45 * math.sin(i * 1.7 + 0.6) ** 2)
        x1 = x0 + (width - L) * (0.15 if i % 2 else 0.7)
        x2 = x1 + L
        a = 18 + 10 * (i % 3)
        d = f"M {x1:.1f} {y:.1f} C {x1 + L*0.3:.1f} {y - a:.1f}, {x1 + L*0.6:.1f} {y + a:.1f}, {x2:.1f} {y:.1f}"
        if i in curls:  # end in a small curl, like a gust
            r = gap * 0.38
            d += f" C {x2 + r*1.2:.1f} {y:.1f}, {x2 + r*1.2:.1f} {y - r*1.6:.1f}, {x2:.1f} {y - r*1.6:.1f}"
            d += f" C {x2 - r*0.9:.1f} {y - r*1.6:.1f}, {x2 - r*0.9:.1f} {y - r*0.6:.1f}, {x2 - r*0.1:.1f} {y - r*0.7:.1f}"
        out += stroke(d, ink, sw)
    return out


def winds(ink):
    w, h = BACK[:2]
    s1 = ANTON.size_for_width("KÜLƏKLƏR", 1320)
    body = P(ANTON.path("KÜLƏKLƏR", s1, w / 2, 470), ink)
    s2 = ANTON.size_for_width("ŞƏHƏRİ", 1320)
    body += P(ANTON.path("ŞƏHƏRİ", min(s1, s2), w / 2, 900), ink)
    body += wind_lines(120, 1060, 1260, 7, 64, 20, ink)
    body += P(MED.path("CITY OF WINDS", 88, w / 2, 1620, tracking=30), ink)
    body += P(MONO.path("BAKU · AZERBAIJAN · EST. 2026", 44, w / 2, 1730, tracking=8), ink)
    tag = "bone" if ink == BONE else "ink"
    save("winds-back-" + tag, *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    body = wind_lines(40, 110, 320, 3, 70, 16, ink, curls=(1,))
    body += P(MONO.path("BAKU", 56, 200, 370, tracking=14), ink)
    save("winds-chest-" + tag, *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 3. Xalça Code (carpet medallion in "knots") ──────────────────────────────
def carpet_cells(n):
    c = n // 2
    cells = set()
    for i in range(n):
        for j in range(n):
            di, dj = abs(i - c), abs(j - c)
            d = di + dj                      # diamond distance
            q = max(di, dj)                  # square distance
            on = False
            if q == c or (q == c - 2 and (i + j) % 2 == 0):          # frame + dotted inner frame
                on = True
            elif d in (c - 2, c - 4) and q < c - 2:                  # double diamond outline
                on = True
            elif d == c - 6 and q < c - 4 and (i % 4 == 0 or j % 4 == 0):  # teeth
                on = True
            elif q < c - 3:
                star = (q <= c // 3) or (d <= c // 2 - 1)            # 8-point star = square ∪ diamond
                inner = (q <= c // 3 - 2) or (d <= c // 2 - 3)
                if star and not inner:
                    on = True
                elif d <= 3 or (d == 6 and (di == 0 or dj == 0 or di == dj)):  # centre
                    on = True
                elif d > c - 2 and q < c - 2:                        # corner fields: small diamonds
                    ci, cj = (c - c // 2), (c - c // 2)
                    for oi in (-1, 1):
                        for oj in (-1, 1):
                            ld = abs(i - (c + oi * ci)) + abs(j - (c + oj * cj))
                            if ld in (2, 4) or ld == 0:
                                on = True
            if on:
                cells.add((i, j))
    return cells


def knots(cells, n, x0, y0, size, ink, inset=0.14):
    cs = size / n
    k = cs * (1 - inset * 2)
    return "".join(
        f'<rect x="{x0 + j*cs + cs*inset:.2f}" y="{y0 + i*cs + cs*inset:.2f}" width="{k:.2f}" height="{k:.2f}" fill="{ink}"/>'
        for (i, j) in sorted(cells)
    )


def carpet(ink):
    w, h = BACK[:2]
    n = 61
    body = knots(carpet_cells(n), n, 130, 80, 1240, ink)
    body += P(BLACK_X.path("XALÇA", BLACK_X.size_for_cap(150), w / 2, 1590, tracking=20), ink)
    body += P(MONO.path("CARPET CODE · 01 · AZERBAIJAN", 42, w / 2, 1720, tracking=8), ink)
    tag = "bone" if ink == BONE else "ink"
    save("carpet-back-" + tag, *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    m = 33
    body = knots(carpet_cells(m), m, 20, 20, 360, ink, inset=0.12)
    save("carpet-chest-" + tag, *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 4. Buta / Odlar Yurdu ───────────────────────────────────────────────────
BUTA = ("M 520 1260 C 250 1260 110 1070 130 860 C 150 640 300 520 420 420 "
        "C 540 320 590 200 560 100 C 548 50 600 14 652 38 C 724 72 716 166 660 168 "
        "C 628 170 616 140 636 124 C 700 230 880 450 880 760 C 880 1060 720 1260 520 1260 Z")


def scaled(d, s, cx, cy):
    out, nums = [], []
    for tok in d.replace(",", " ").split():
        if tok.isalpha():
            out.append(tok)
        else:
            nums.append(float(tok))
            if len(nums) == 2:
                x, y = nums
                out.append(f"{cx + (x - cx) * s:.1f} {cy + (y - cy) * s:.1f}")
                nums = []
    return " ".join(out)


def buta_art(x, y, scale, ink, sw):
    g = f'<g transform="translate({x} {y}) scale({scale})">'
    for s, k in ((1.0, 1.0), (0.76, 0.85), (0.52, 0.7)):
        g += stroke(scaled(BUTA, s, 500, 900), ink, sw * k / scale)
    g += P(scaled(BUTA, 0.22, 500, 980), ink)
    g += "</g>"
    return g


def buta(ink):
    w, h = BACK[:2]
    body = buta_art(330, 40, 1.02, ink, 24)
    body += P(BLACK_X.path("ODLAR YURDU", BLACK_X.size_for_width("ODLAR YURDU", 1300, 12), w / 2, 1630, tracking=12), ink)
    body += P(MONO.path("LAND OF FIRE · AZERBAIJAN", 44, w / 2, 1740, tracking=8), ink)
    tag = "bone" if ink == BONE else "ink"
    save("buta-back-" + tag, *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    body = buta_art(70, 0, 0.28, ink, 12)
    save("buta-chest-" + tag, *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 5. Xəzər (Caspian) ──────────────────────────────────────────────────────
def waves(x0, x1, y, amp, period, sw, ink):
    pts = []
    x = x0
    while x <= x1 + 1:
        pts.append(f"{x:.1f} {y + amp * math.sin((x - x0) / period * 2 * math.pi):.1f}")
        x += period / 16
    return stroke("M " + " L ".join(pts), ink, sw)


def caspian(ink):
    w, h = BACK[:2]
    size = ANTON.size_for_width("XƏZƏR", 1340, 16)
    top, base = 170, 170 + size * ANTON.cap
    word = ANTON.path("XƏZƏR", size, w / 2, base, tracking=16)
    tag = "bone" if ink == BONE else "ink"
    body = f'<defs><clipPath id="word-{tag}"><path d="{word}"/></clipPath></defs>'
    lines = ""
    yy = top - 40
    i = 0
    while yy < base + 60:
        lines += waves(40, 1460, yy, 10, 240 + (i % 3) * 30, 17, ink)
        yy += 32
        i += 1
    body += f'<g clip-path="url(#word-{tag})">{lines}</g>'
    for k in range(3):
        body += waves(120, 1380, base + 110 + k * 58, 16, 260, 14, ink)
    body += P(MED.path("CASPIAN SEA", 96, w / 2, base + 420, tracking=34), ink)
    body += P(MONO.path("−28 M · BELOW SEA LEVEL", 46, w / 2, base + 530, tracking=8), ink)
    save("caspian-back-" + tag, *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    cs = BLACK_X.size_for_width("XƏZƏR", 360, 4)
    body = P(BLACK_X.path("XƏZƏR", cs, 200, 200, tracking=4), ink)
    body += waves(40, 360, 270, 7, 90, 9, ink) + waves(40, 360, 310, 7, 90, 9, ink)
    save("caspian-chest-" + tag, *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 6. Horwalle Essential ───────────────────────────────────────────────────
def essential(ink):
    w, h = BACK[:2]
    size = BLACK_X.size_for_width("HOR", 1160)
    capH = size * BLACK_X.cap
    y = 200 + capH
    body = ""
    for word in ("HOR", "WAL", "LE"):
        body += P(BLACK_X.path(word, size, 680, y), ink)
        y += capH + 70
    vt = MONO.path("EST. 2026 — BAKU, AZERBAIJAN", 46, 0, 0, anchor="middle", tracking=10)
    body += f'<g transform="translate(1390 {200 + (y - 200) / 2 - 35}) rotate(-90)">{P(vt, ink)}</g>'
    tag = "bone" if ink == BONE else "ink"
    save("essential-back-" + tag, *BACK[:2], body, *BACK[2:], "back, 15x18 in")
    s = BLACK_X.size_for_width("HORWALLE", 370, 2)
    body = P(BLACK_X.path("HORWALLE", s, 200, 215, tracking=2), ink)
    body += P(MONO.path("BAKU", 34, 200, 275, tracking=12), ink)
    save("essential-chest-" + tag, *CHEST[:2], body, *CHEST[2:], "left chest, 4x4 in")


# ── 7. Joggers leg / 8. Cap ─────────────────────────────────────────────────
def leg(ink):
    w, h = 300, 1200
    s = ANTON.size_for_width("HORWALLE", 1150, 6)
    d = ANTON.path("HORWALLE", s, 0, s * ANTON.cap / 2, tracking=6)
    body = f'<g transform="translate(150 600) rotate(-90)">{P(d, ink)}</g>'
    save("leg-" + ("bone" if ink == BONE else "ink"), w, h, body, 900, 3600, "left leg, vertical, 3x12 in")


def cap(ink):
    w, h = 500, 250
    body = P(BLACK_X.path("Ə", BLACK_X.size_for_cap(200), w / 2, 225), ink)
    save("cap-" + ("bone" if ink == BONE else "ink"), w, h, body, 1500, 750, "cap front, 5x2.5 in (embroidery or print)")


for ink in (BONE, INK):
    schwa(ink); winds(ink); carpet(ink); buta(ink); caspian(ink); essential(ink); leg(ink); cap(ink)

with open(os.path.join(OUT, "designs.json"), "w", encoding="utf-8") as fh:
    json.dump(designs, fh, indent=1)
print(len(designs), "designs")
