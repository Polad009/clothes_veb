from PIL import Image, ImageDraw, ImageFont

# Canvas 1800 x 1200 with elegant light background
cw, ch = 1800, 1200
bg = Image.new("RGBA", (cw, ch), (248, 248, 250, 255))
draw = ImageDraw.Draw(bg)

# Draw title bar
draw.text((60, 40), "HORWALLE ATELIER — BMW M MOTORSPORT HEAVYWEIGHT HOODIE", fill=(20, 20, 24))
draw.text((60, 70), "380 GSM Heavyweight Fleece · Front & Clean Back Views · 3 Colorways (Washed Black, Heather Grey, Clean White)", fill=(100, 100, 110))

# Place 6 images in a 3 columns x 2 rows grid
# Col 1: Black Front & Back
# Col 2: Grey Front & Back
# Col 3: White Front & Back
item_w, item_h = 520, 500

images = [
    ("public/images/uploads/bmw_hoodie_black_front_v3.png", 60, 120, "Washed Black — Ön Görünüş"),
    ("public/images/uploads/bmw_hoodie_black_back_v3.png", 60, 640, "Washed Black — Arxa (Minimalist)"),
    ("public/images/uploads/bmw_hoodie_grey_front_v3.png", 640, 120, "Heather Grey — Ön Görünüş"),
    ("public/images/uploads/bmw_hoodie_grey_back_v3.png", 640, 640, "Heather Grey — Arxa (Minimalist)"),
    ("public/images/uploads/bmw_hoodie_white_front_v3.png", 1220, 120, "Clean White — Ön Görünüş"),
    ("public/images/uploads/bmw_hoodie_white_back_v3.png", 1220, 640, "Clean White — Arxa (Minimalist)")
]

for path, x, y, label in images:
    im = Image.open(path).convert("RGBA")
    # Resize to fit item_w, item_h
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    scale = min(item_w / im.width, item_h / im.height) * 0.92
    nw, nh = int(im.width * scale), int(im.height * scale)
    im_resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    px = x + (item_w - nw) // 2
    py = y + (item_h - nh) // 2
    bg.paste(im_resized, (px, py), im_resized)
    draw.text((x + 20, y + item_h - 15), label, fill=(50, 50, 60))

bg.save("public/images/uploads/bmw_hoodie_presentation.png")
print("Presentation board saved!")
