"""Horwalle dark graphic prints (money / eye / lightning / statue), for black garments.
The lightning is drawn by the script, not taken from a photo.

Original compositions built from free Unsplash photos (Unsplash License: commercial use and
modification allowed) reworked into print art, plus type in OFL fonts (Anton, Space Mono,
UnifrakturMaguntia). Sources are listed in MEDIA_LICENSES.md.

usage: python dark-designs.py <src_dir> <fonts_dir> <out_dir>
  src_dir: bill.jpg eye.jpg statue.jpg
writes <name>.png (transparent, 3000 px wide, light ink for dark fabric)
"""
import os
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

SRC, FONTS, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
BONE = (236, 232, 224)
rng = np.random.default_rng(7)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def word(text, ff, width, tracking=0):
    """Mask of `text` scaled to exactly `width` px wide, cropped to the ink."""
    f = font(ff, 600)
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    widths = [d.textlength(c, font=f) for c in text]
    total = int(sum(widths) + tracking * (len(text) - 1)) + 80
    m = Image.new("L", (total, 900), 0)
    d = ImageDraw.Draw(m)
    x = 40
    for c, w in zip(text, widths):
        d.text((x, 700), c, font=f, fill=255, anchor="ls")
        x += w + tracking
    m = m.crop(m.getbbox())
    return m.resize((width, int(m.height * width / m.width)), Image.LANCZOS)


def photo(name):
    return Image.open(os.path.join(SRC, name + ".jpg")).convert("RGB")


def curve(a, lo, hi, gamma=1.0):
    return np.clip((a - lo) / (hi - lo), 0, 1) ** gamma


def distress(mask, amount=0.10, scale=3):
    """Worn screen-print texture: knocks small specks and a few scratches out of a mask."""
    w, h = mask.size
    n = rng.random((h // scale + 1, w // scale + 1))
    n = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
    keep = (np.asarray(n).astype(np.float32) / 255.0) > amount * 3.2
    big = rng.random((h // 60 + 1, w // 60 + 1))
    big = np.asarray(Image.fromarray((big * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255.0
    keep = keep | (big > 0.42)          # wear comes in patches, not evenly
    out = np.asarray(mask).astype(np.float32) * keep
    sc = Image.new("L", (w, h), 255)
    d = ImageDraw.Draw(sc)
    for _ in range(26):
        x, y = rng.integers(0, w), rng.integers(0, h)
        d.line((x, y, x + rng.integers(-260, 260), y + rng.integers(60, 420)), fill=0, width=int(rng.integers(2, 5)))
    return Image.fromarray(out.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), sc


def rgba(rgb, alpha):
    im = Image.new("RGBA", alpha.size, rgb + (0,))
    im.putalpha(alpha)
    return im


def save(im, name):
    im = im.crop(im.getbbox())
    im.save(os.path.join(OUT, name + ".png"))
    print(name, im.size)


# ── 1. MONEY: letters cut out of banknotes, bone outline, ink drips ─────────────────────────
def money():
    W = 3000
    m = word("MONEY", "Anton.ttf", W - 200, tracking=18)
    H = m.height + 1500
    letters = Image.new("L", (W, H), 0)
    letters.paste(m, (100, 120))
    bills = ImageOps.fit(photo("bill"), (W, m.height + 240), Image.LANCZOS)
    g = np.asarray(bills).astype(np.float32) / 255.0
    L = g.mean(axis=2)
    L = curve(L, 0.12, 0.92, 0.9)
    tint = np.stack([L * 0.86 + 0.04, L * 0.95 + 0.05, L * 0.80 + 0.03], axis=2)   # banknote green-grey
    fill = Image.new("RGB", (W, H), (0, 0, 0))
    fill.paste(Image.fromarray((tint * 255).astype(np.uint8)), (0, 0))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    edge = ImageChops.subtract(letters.filter(ImageFilter.MaxFilter(31)), letters.filter(ImageFilter.MinFilter(5)))
    # drips run down from the outline
    drips = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(drips)
    base = 120 + m.height
    for _ in range(46):
        x = int(rng.integers(140, W - 140))
        if letters.getpixel((x, base - 30)) == 0:
            continue
        ln = int(rng.integers(90, 760)); wd = int(rng.integers(9, 26))
        d.rounded_rectangle((x - wd // 2, base - 20, x + wd // 2, base + ln), wd // 2, fill=255)
        d.ellipse((x - wd * 0.8, base + ln - wd, x + wd * 0.8, base + ln + wd * 0.9), fill=255)
    line = ImageChops.lighter(edge, drips)
    out.alpha_composite(rgba(BONE, line))
    out.paste(fill, (0, 0), letters)
    sub = word("COUNT IT. KEEP IT. MULTIPLY IT.", "Mono.ttf", W - 900, tracking=14)
    out.alpha_composite(rgba(BONE, sub), ((W - sub.width) // 2, base + 900))
    a, sc = distress(out.getchannel("A"), 0.05)
    out.putalpha(ImageChops.multiply(a, sc))
    save(out, "money")


# ── 2. STAY AWAKE: an eye between two cracked words ────────────────────────────────────────
def awake():
    W = 3000
    top = word("STAY", "Anton.ttf", W - 160, tracking=30)
    bot = word("AWAKE", "Anton.ttf", W - 160, tracking=20)
    eye = photo("eye")
    ew = W - 160
    eye = ImageOps.fit(eye, (ew, int(ew * 0.62)), Image.LANCZOS, centering=(0.5, 0.42))
    L = np.asarray(eye.convert("L")).astype(np.float32) / 255.0
    a = curve(L, 0.10, 0.80, 0.85)
    yy, xx = np.mgrid[0:eye.height, 0:eye.width].astype(np.float32)
    r = np.sqrt(((xx - ew / 2) / (ew * 0.52)) ** 2 + ((yy - eye.height / 2) / (eye.height * 0.56)) ** 2)
    a *= np.clip((1.0 - r) / 0.22, 0, 1)                      # fades into the fabric, no box
    gap = 70
    H = top.height + eye.height + bot.height + gap * 2 + 420
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = 60
    for part in (top, None, bot):
        if part is None:
            out.alpha_composite(rgba(BONE, Image.fromarray((a * 255).astype(np.uint8))), (80, y))
            y += eye.height + gap
            continue
        # the words carry the eye photo's own grain so they read as one piece
        tex = ImageOps.fit(photo("eye").convert("L"), part.size, Image.LANCZOS, centering=(0.2, 0.9))
        t = 0.82 + 0.18 * curve(np.asarray(tex).astype(np.float32) / 255.0, 0.15, 0.75)
        pa = Image.fromarray((np.asarray(part).astype(np.float32) * t).astype(np.uint8))
        out.alpha_composite(rgba(BONE, pa), (80, y))
        y += part.height + gap
    sub = word("they blink — you don't", "Fraktur.ttf", 1500)
    out.alpha_composite(rgba(BONE, sub), ((W - sub.width) // 2, y + 40))
    a2, sc = distress(out.getchannel("A"), 0.045)
    out.putalpha(ImageChops.multiply(a2, sc))
    save(out, "awake")


# ── 3. STRIKE: drawn lightning that forks down from the shoulders and the collar ────────────
def strike():
    W, H = 3000, 2600
    core = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(core)
    r = np.random.default_rng(23)

    def bolt(x, y, ang, length, width, depth=0):
        """A jagged path; it thins as it goes and throws off smaller forks."""
        steps = max(4, int(length / 46))
        for i in range(steps):
            ang += r.normal(0, 0.27)
            ang = float(np.clip(ang, np.pi * 0.14, np.pi * 0.86)) if depth == 0 else ang
            seg = 46 * r.uniform(0.7, 1.35)
            nx, ny = x + np.cos(ang) * seg, y + np.sin(ang) * seg
            w = max(2.0, width * (1 - 0.72 * i / steps))
            d.line((x, y, nx, ny), fill=255, width=int(round(w)))
            d.ellipse((nx - w / 2, ny - w / 2, nx + w / 2, ny + w / 2), fill=255)
            if depth < 3 and r.random() < (0.30 if depth == 0 else 0.20) and w > 3:
                side = r.choice([-1, 1])
                bolt(nx, ny, ang + side * r.uniform(0.45, 1.05), length * r.uniform(0.28, 0.5) * (1 - i / steps * 0.5), w * 0.55, depth + 1)
            x, y = nx, ny

    # three main strikes: both shoulders angle inwards, the collar one runs straight down
    # the left half is drawn and mirrored, so the print sits evenly on the chest
    for x0, a0, ln, wd in ((330, 0.40 * np.pi, 2500, 30), (900, 0.45 * np.pi, 1500, 17), (1500, 0.5 * np.pi, 1900, 24)):
        bolt(x0, 40, a0, ln, wd)
    left = core.crop((0, 0, W // 2 + 60, H))
    core = Image.new("L", (W, H), 0)
    core.paste(left, (0, 0))
    core = ImageChops.lighter(core, ImageOps.mirror(core))
    c = np.asarray(core.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255.0
    g1 = np.asarray(core.filter(ImageFilter.GaussianBlur(9))).astype(np.float32) / 255.0
    g2 = np.asarray(core.filter(ImageFilter.GaussianBlur(34))).astype(np.float32) / 255.0
    a = np.clip(np.maximum(c, np.maximum(g1 * 1.5, g2 * 1.9) * 0.62), 0, 1)
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    a *= np.clip((H - yy) / 380, 0, 1)                           # dies out before the pocket
    rgb = np.stack([0.66 + 0.34 * c, 0.80 + 0.20 * c, np.ones_like(c)], axis=2)      # white core, cold blue halo
    out = Image.fromarray((np.dstack([rgb, a]) * 255).astype(np.uint8), "RGBA")
    save(out, "strike")


# ── 4. ETERNAL: marble bust in magenta over warped rows of type ────────────────────────────
def eternal():
    W = 3000
    st = photo("statue")
    w, h = st.size
    st = st.crop((int(w * 0.10), int(h * 0.04), int(w * 0.90), int(h * 0.90)))
    sw = 2100
    st = st.resize((sw, int(st.height * sw / st.width)), Image.LANCZOS)
    H = st.height + 500
    rows = Image.new("L", (W, H), 0)
    wd = word("ETERNAL", "Anton.ttf", W - 120, tracking=24)
    step = int(wd.height * 0.74)
    for i, y in enumerate(range(420, H - wd.height - 520, step)):
        strip = np.asarray(wd).astype(np.float32)
        out_strip = np.zeros_like(strip)
        for r in range(strip.shape[0]):                         # each row of pixels slides sideways: liquid chrome look
            sh = int(46 * np.sin(r / 38.0 + i * 1.3))
            out_strip[r] = np.roll(strip[r], sh)
        band = (0.35 + 0.65 * (0.5 + 0.5 * np.sin(np.arange(strip.shape[0]) / 17.0 + i)))[:, None]
        rows.paste(Image.fromarray((out_strip * band).astype(np.uint8)), (60, y))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.alpha_composite(rgba(BONE, rows))
    L = np.asarray(st.convert("L")).astype(np.float32) / 255.0
    a = curve(L, 0.07, 0.30)
    # close the dark hollows (eyes, folds) so the figure is one solid shape
    solid = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.MinFilter(41)).filter(ImageFilter.GaussianBlur(3))
    a = np.maximum(a, np.asarray(solid).astype(np.float32) / 255.0)
    t = curve(L, 0.08, 0.85, 0.8)[..., None]
    dark, mid, light = np.array([0.42, 0.02, 0.24]), np.array([1.0, 0.16, 0.52]), np.array([1.0, 0.86, 0.90])
    col = np.where(t < 0.55, dark + (mid - dark) * (t / 0.55), mid + (light - mid) * ((t - 0.55) / 0.45))
    statue = Image.fromarray((np.dstack([col, a]) * 255).astype(np.uint8), "RGBA")
    # knock the type out behind the figure so the bust stays readable
    hole = Image.new("L", (W, H), 0)
    hole.paste(statue.getchannel("A").filter(ImageFilter.MaxFilter(25)), ((W - sw) // 2, 200))
    out.putalpha(ImageChops.subtract(out.getchannel("A"), hole))
    out.alpha_composite(statue, ((W - sw) // 2, 200))
    sub = word("nothing gold can stay", "Fraktur.ttf", 1700)
    out.alpha_composite(rgba((255, 120, 170), sub), ((W - sub.width) // 2, H - sub.height - 40))
    save(out, "eternal")


money(); awake(); strike(); eternal()
