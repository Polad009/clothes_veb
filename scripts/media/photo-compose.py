"""Put the collection designs on the real garment photos (blanks) so they read as printed.
usage: python compose.py <blanks_dir> <designs_dir> <out_dir>
writes <out>/<key>-<tag>-front.png / -back.png and mockups.json (same shape as make-mockups.ts)"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps

blanks, designs, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
W, H = 1600, 2000  # product images are shown 4:5


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


def canvas(g, pad=0.06):
    im = Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA")
    s = min(W * (1 - 2 * pad) / im.width, H * (1 - 2 * pad) / im.height)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c.paste(im, ((W - im.width) // 2, (H - im.height) // 2), im)
    return c


def fabric_panel(g, box, dark):
    """close-up of the fabric for the hoodie back print: a real patch of the photo, mirrored to fill"""
    h, w = g.shape[:2]
    x0, y0, x1, y1 = [int(v) for v in (box[0] * w, box[1] * h, box[2] * w, box[3] * h)]
    patch = Image.fromarray((g[y0:y1, x0:x1] * 255).astype(np.uint8), "RGBA").convert("RGB")
    pw, ph = patch.size
    tile = Image.new("RGB", (pw * 2, ph * 2))
    tile.paste(patch, (0, 0)); tile.paste(ImageOps.mirror(patch), (pw, 0))
    tile.paste(ImageOps.flip(patch), (0, ph)); tile.paste(ImageOps.flip(ImageOps.mirror(patch)), (pw, ph))
    sw, sh = 1240, 1550
    full = Image.new("RGB", (sw, sh))
    for yy in range(0, sh, tile.height):
        for xx in range(0, sw, tile.width):
            full.paste(tile, (xx, yy))
    f = arr(full)
    # keep only the fine knit grain of the real patch (no tiling stripes), on the fabric's own colour
    L = lum(f); grain = L - blur(L, 3)
    col = np.median(f[..., :3].reshape(-1, 3), axis=0)
    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    # one soft light fall-off and two shallow diagonal folds, like fabric laid flat
    light = 1.03 - 0.22 * (((xx - sw * 0.42) / sw) ** 2 + ((yy - sh * 0.36) / sh) ** 2)
    fold = 0.035 * np.exp(-(((xx * 0.55 + yy * 0.85) - sh * 0.95) / 70.0) ** 2) - 0.03 * np.exp(-(((xx * 0.7 - yy * 0.7) + sh * 0.1) / 90.0) ** 2)
    k = 2.2 if dark else 1.0
    f[..., :3] = np.clip(col[None, None, :] * (light + fold * k)[..., None] + grain[..., None] * (1.6 if dark else 0.8), 0, 1)
    # rounded corners
    mask = Image.new("L", (sw, sh), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, sh - 1), 36, fill=255)
    f[..., 3] = np.asarray(mask).astype(np.float32) / 255.0
    return f


# where the prints sit on each photo (fractions of the cut-out's width/height)
SPOT = {
    "tee-black": {"chest": (0.60, 0.25, 0.11), "back": (0.50, 0.44, 0.36)},
    "tee-white": {"chest": (0.60, 0.21, 0.11), "back": (0.50, 0.40, 0.36)},
    "hoodie": {"chest": (0.63, 0.29, 0.11), "panel": (0.18, 0.24, 0.33, 0.42)},
    "cap-black": {"front": (0.50, 0.40, 0.17)},
}

COLL = [
    # key, [(colour name, tag, blank, dark, ink)], front design, back design, kind
    ("schwa-tee", [("Qara", "qara", "tee-black", True, "bone"), ("Ağ", "ag", "tee-white", False, "ink")], "schwa-chest", "schwa-back", "tee"),
    ("winds-tee", [("Ağ", "ag", "tee-white", False, "ink"), ("Qara", "qara", "tee-black", True, "bone")], "winds-chest", "winds-back", "tee"),
    ("carpet-tee", [("Qara", "qara", "tee-black", True, "bone"), ("Ağ", "ag", "tee-white", False, "ink")], "carpet-chest", "carpet-back", "tee"),
    ("buta-hoodie", [("Qara", "qara", "hoodie-black", True, "bone")], "buta-chest", "buta-back", "hoodie"),
    ("caspian-hoodie", [("Boz", "boz", "hoodie-grey", False, "ink"), ("Qara", "qara", "hoodie-black", True, "bone")], "caspian-chest", "caspian-back", "hoodie"),
    ("essential-hoodie", [("Qara", "qara", "hoodie-black", True, "bone"), ("Ağ", "ag", "hoodie-white", False, "ink")], "essential-chest", "essential-back", "hoodie"),
    ("schwa-cap", [("Qara", "qara", "cap-black", True, "bone")], "cap", None, "cap"),
]

only = sys.argv[4] if len(sys.argv) > 4 else None
manifest = {}
for key, colours, front, back, kind in COLL:
    if only and only not in key:
        continue
    manifest[key] = {}
    for cname, tag, blank, dark, ink in colours:
        g0 = arr(Image.open(os.path.join(blanks, blank + ".png")))
        spot = SPOT["hoodie" if kind == "hoodie" else blank]
        df = lambda n: os.path.join(designs, f"{n}-{ink}.png")
        if kind == "cap":
            g = place(g0.copy(), df(front), *spot["front"], dark)
        else:
            g = place(g0.copy(), df(front), *spot["chest"], dark)
        fname = f"{key}-{tag}-front.png"
        canvas(g).save(os.path.join(out, fname), optimize=True)
        entry = {"front": fname}
        if back:
            if kind == "tee":   # the back of a tee: same photo mirrored, inside label smoothed away, big print
                gb = g0[:, ::-1].copy()
                # from the back the inside neck label is not visible: smooth it away
                h0, w0 = gb.shape[:2]
                ys, xs = slice(0, int(h0 * 0.12)), slice(int(w0 * 0.40), int(w0 * 0.60))
                reg = gb[ys, xs]
                Lr = lum(reg); Lb = blur(Lr, 12)
                odd = (np.abs(Lr - Lb) > 0.06) & (reg[..., 3] > 0.5)
                odd = np.asarray(Image.fromarray((odd * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
                for c in range(3):
                    ch = reg[..., c]; chb = blur(ch, 12); ch[odd] = chb[odd]
                gb[ys, xs] = reg
                gb = place(gb, df(back), *spot["back"], dark)
                bimg = canvas(gb)
            else:               # hoodie: close-up of the real fabric with the back print
                panel = fabric_panel(g0, spot["panel"], dark)
                panel = place(panel, df(back), 0.5, 0.5, 0.62, dark)
                bimg = canvas(panel, pad=0.05)
            bname = f"{key}-{tag}-back.png"
            bimg.save(os.path.join(out, bname), optimize=True)
            entry["back"] = bname
        manifest[key][cname] = entry
        print(key, cname, entry)
json.dump(manifest, open(os.path.join(out, "mockups.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
