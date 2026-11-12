"""Product images for the NOX collection: plain product photos (the cleaned real garment photos
from photo-blanks.py) and photos of people wearing it (Pexels model photos), with the NOX
designs printed on them.
usage: python nox-images.py <blanks_dir> <model_raw_dir> <designs_dir> <out_dir>
writes mockups.json ({front, back}) and model.json ([worn photos]) for publish-collection.ts"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageOps

blanks, raw, designs, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
W, H = 1600, 2000

# shared helpers (arr, lum, blur, place, canvas, fabric_panel) live in photo-compose.py
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "photo-compose.py"), encoding="utf-8").read()
exec(_src[_src.index("def arr("):_src.index("# where the prints sit")])


def dfile(design, ink):
    f = os.path.join(designs, f"{design}-{ink}.png")
    return f if os.path.exists(f) else os.path.join(designs, f"{design}-bone.png")


def flat(blank, prints, mirror=False):
    g = arr(Image.open(os.path.join(blanks, blank + ".png")))
    if mirror:
        g = g[:, ::-1].copy()
    for design, ink, (x, y, wf), dark in prints:
        g = place(g, dfile(design, ink), x, y, wf, dark)
    return canvas(g)


def panel(blank, design, ink, dark):
    g0 = arr(Image.open(os.path.join(blanks, blank + ".png")))
    p = fabric_panel(g0, (0.18, 0.24, 0.33, 0.42), dark)
    return canvas(place(p, dfile(design, ink), 0.5, 0.5, 0.62, dark), pad=0.05)


def worn(photo, prints, top):
    g = arr(Image.open(os.path.join(raw, photo + ".jpg")))
    h, w = g.shape[:2]
    for design, ink, (x, y, wf), dark in prints:
        if "leg" in design:      # tall strip: wf is its height as a share of the photo height
            d = Image.open(dfile(design, ink)); wf = wf * h * d.width / d.height / w
        g = place(g, dfile(design, ink), x, y, wf, dark)
    if h / w >= 1.25:
        ch = int(w * 1.25); y0 = int(min(max(0, top * h), h - ch)); g = g[y0:y0 + ch]
    else:
        cw = int(h / 1.25); x0 = (w - cw) // 2; g = g[:, x0:x0 + cw]
    return Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), "RGBA").convert("RGB").resize((W, H), Image.LANCZOS)


# print positions, fractions of the photo: (centre x, centre y, width)
FLAT = {
    "tee-black": {"chest": (0.60, 0.25, 0.11), "big": (0.50, 0.47, 0.40), "back": (0.50, 0.44, 0.38), "wide": (0.50, 0.30, 0.52)},
    "tee-white": {"chest": (0.60, 0.21, 0.11), "big": (0.50, 0.42, 0.38), "back": (0.50, 0.40, 0.36), "wide": (0.50, 0.27, 0.50)},
    "hoodie": {"chest": (0.63, 0.29, 0.11), "big": (0.50, 0.445, 0.27)},
    "cap": {"front": (0.50, 0.40, 0.15)},
}
WORN = {
    "8217461": {"chest": (0.62, 0.44, 0.10), "big": (0.51, 0.555, 0.27)},          # white tee, front
    "6311141": {"back": (0.53, 0.52, 0.31), "wide": (0.53, 0.43, 0.42)},            # white tee, back
    "4066293": {"chest": (0.60, 0.27, 0.075), "big": (0.50, 0.44, 0.17)},          # black tee, front
    "8217415": {"back": (0.50, 0.58, 0.30)},                                        # white hoodie, back
    "6311619": {"chest": (0.615, 0.36, 0.085), "big": (0.505, 0.435, 0.21), "leg": (0.635, 0.885, 0.16)},  # black hoodie + joggers
    "6311506": {"back": (0.525, 0.57, 0.29)},                                       # black hoodie, back
    "9558786": {"cap": (0.51, 0.435, 0.07), "chest": (0.62, 0.68, 0.09)},          # white cap + white tee
}
TOP = {"8217461": 0.12, "6311141": 0.06, "4066293": 0, "8217415": 0.14, "6311619": 0.08, "6311506": 0.1, "9558786": 0.15}

B, I = ("bone", True), ("ink", False)   # (ink file, dark garment)


def pr(design, spot, inkdark):
    return (design, inkdark[0], spot, inkdark[1])


JOBS = {
    # key: {colour: {"front": flat spec, "back": flat spec | panel, "worn": [(photo, [(design, spotname)])]}}
    "nox-thorn-tee": {
        "Qara": {"front": ("tee-black", [("thorn-big", "big")]), "worn": [("4066293", [("thorn-big", "big")])]},
        "Ağ": {"front": ("tee-white", [("thorn-big", "big")]), "worn": [("8217461", [("thorn-big", "big")])]},
    },
    "nox-gothic-tee": {
        "Qara": {"front": ("tee-black", [("h-chest", "chest")]), "back": ("tee-black", [("gothic-back", "back")]),
                 "worn": [("4066293", [("h-chest", "chest")])]},
        "Ağ": {"front": ("tee-white", [("h-chest", "chest")]), "back": ("tee-white", [("gothic-back", "back")]),
               "worn": [("6311141", [("gothic-back", "back")]), ("8217461", [("h-chest", "chest")])]},
    },
    "nox-chrome-tee": {
        "Qara": {"front": ("tee-black", [("h-chest", "chest")]), "back": ("tee-black", [("chrome-back", "wide")]),
                 "worn": [("4066293", [("h-chest", "chest")])]},
    },
    "nox-odlar-hoodie": {
        "Qara": {"front": ("hoodie-black", [("h-chest", "chest")]), "back": ("panel", "hoodie-black", "odlar-back"),
                 "worn": [("6311506", [("odlar-back", "back")]), ("6311619", [("h-chest", "chest")])]},
        "Boz": {"front": ("hoodie-grey", [("h-chest", "chest")]), "back": ("panel", "hoodie-grey", "odlar-back")},
    },
    "nox-thorn-hoodie": {
        "Qara": {"front": ("hoodie-black", [("thorn-big", "big")]), "worn": [("6311619", [("thorn-big", "big")])]},
    },
    "nox-star-hoodie": {
        "Qara": {"front": ("hoodie-black", [("h-chest", "chest")]), "back": ("panel", "hoodie-black", "star-back"),
                 "worn": [("6311506", [("star-back", "back")]), ("6311619", [("h-chest", "chest")])]},
        "Ağ": {"front": ("hoodie-white", [("h-chest", "chest")]), "back": ("panel", "hoodie-white", "star-back"),
               "worn": [("8217415", [("star-back", "back")])]},
    },
    "nox-thorn-joggers": {"Qara": {"worn": [("6311619", [("nox-leg", "leg")]), ("6311506", [])]}},
    "nox-h-cap": {
        "Qara": {"front": ("cap-black", [("h-cap", "front")])},
        "Ağ": {"worn": [("9558786", [("h-cap", "cap")])]},
    },
    "nox-thorn-set": {"Qara": {"worn": [("6311619", [("thorn-big", "big"), ("nox-leg", "leg")]), ("6311506", [])]}},
    "nox-gothic-set": {"Ağ": {"worn": [("9558786", [("h-cap", "cap"), ("h-chest", "chest")]), ("6311141", [("gothic-back", "back")])]}},
}
DARK = {"Qara": B, "Ağ": I, "Boz": I}

only = sys.argv[5] if len(sys.argv) > 5 else None
mock, model = {}, {}
for key, cols in JOBS.items():
    if only and only not in key:
        continue
    for cname, spec in cols.items():
        tag = {"Qara": "qara", "Ağ": "ag", "Boz": "boz"}[cname]
        inkdark = DARK[cname]
        entry = {}
        for side in ("front", "back"):
            if side not in spec:
                continue
            s = spec[side]
            if s[0] == "panel":
                img = panel(s[1], s[2], inkdark[0], inkdark[1])
            else:
                blank, items = s
                spots = FLAT["hoodie" if blank.startswith("hoodie") else "cap" if blank.startswith("cap") else blank]
                img = flat(blank, [pr(d, spots[sp], inkdark) for d, sp in items], mirror=(side == "back"))
            fn = f"{key}-{tag}-{side}.png"
            img.save(os.path.join(out, fn), optimize=True)
            entry[side] = fn
        if entry:
            if "front" not in entry:
                entry = {"front": entry["back"]}
            mock.setdefault(key, {})[cname] = entry
        files = []
        for n, (photo, items) in enumerate(spec.get("worn", [])):
            # the cap photo shows a white cap and a white tee: dark ink there whatever the colour
            ink_here = I if photo in ("9558786", "8217461", "6311141", "8217415") else B
            img = worn(photo, [pr(d, WORN[photo][sp], ink_here) for d, sp in items], TOP[photo])
            fn = f"{key}-{tag}-m{n + 1}.jpg"
            img.save(os.path.join(out, fn), quality=86, optimize=True, progressive=True)
            files.append(fn)
        if files:
            model.setdefault(key, {})[cname] = files
        print(key, cname, entry, files)
json.dump(mock, open(os.path.join(out, "mockups.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(model, open(os.path.join(out, "model.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
