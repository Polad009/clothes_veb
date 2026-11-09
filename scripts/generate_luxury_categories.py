import os
from PIL import Image, ImageFilter
import numpy as np

os.makedirs('public/images/categories', exist_ok=True)

CANVAS_W = 1000
CANVAS_H = 750
# Warm stone studio background matching #FAF7F2
BG_COLOR = (250, 247, 242, 255)

def add_drop_shadow(image_rgba, offset=(0, 16), blur=18, shadow_alpha=40):
    w, h = image_rgba.size
    shadow = Image.new('RGBA', (w + blur * 4, h + blur * 4), (0, 0, 0, 0))
    alpha = image_rgba.split()[3]
    silhouette = Image.new('L', (w, h), 0)
    silhouette.paste(alpha)
    shadow.paste((30, 25, 20, shadow_alpha), (blur * 2 + offset[0], blur * 2 + offset[1]), mask=silhouette)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    return shadow

def crop_tight(img_rgba, pad=5):
    arr = np.array(img_rgba)
    alpha = arr[:, :, 3]
    rows = np.where(alpha > 15)[0]
    cols = np.where(alpha > 15)[1]
    if len(rows) == 0 or len(cols) == 0:
        return img_rgba
    r_min = max(0, rows.min() - pad)
    r_max = min(img_rgba.size[1], rows.max() + pad)
    c_min = max(0, cols.min() - pad)
    c_max = min(img_rgba.size[0], cols.max() + pad)
    return img_rgba.crop((c_min, r_min, c_max, r_max))

# ==========================================
# 1. T-SHIRT & KÖYNƏK
# ==========================================
canvas_1 = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)
tee_raw = Image.open('public/images/studio/t-shirt/black-front-shirt.png').convert('RGBA')
tee_crop = crop_tight(tee_raw)
shirt_raw = Image.open('public/shirts/keten-koynek.webp').convert('RGBA')
shirt_crop = crop_tight(shirt_raw)

TARGET_H_1 = 540
tee_scale = TARGET_H_1 / tee_crop.size[1]
tee_w = int(tee_crop.size[0] * tee_scale)
tee_res = tee_crop.resize((tee_w, TARGET_H_1), Image.Resampling.LANCZOS)

shirt_scale = TARGET_H_1 / shirt_crop.size[1]
shirt_w = int(shirt_crop.size[0] * shirt_scale)
shirt_res = shirt_crop.resize((shirt_w, TARGET_H_1), Image.Resampling.LANCZOS)

GAP_1 = 50
TOTAL_W_1 = tee_w + shirt_w + GAP_1
START_X_1 = (CANVAS_W - TOTAL_W_1) // 2
START_Y_1 = (CANVAS_H - TARGET_H_1) // 2

sh_tee = add_drop_shadow(tee_res, offset=(0, 16), blur=20, shadow_alpha=35)
canvas_1.paste(sh_tee, (START_X_1 - 40, START_Y_1 - 20), sh_tee)
canvas_1.paste(tee_res, (START_X_1, START_Y_1), tee_res)

pos_shirt_x = START_X_1 + tee_w + GAP_1
sh_shirt = add_drop_shadow(shirt_res, offset=(0, 16), blur=20, shadow_alpha=35)
canvas_1.paste(sh_shirt, (pos_shirt_x - 40, START_Y_1 - 20), sh_shirt)
canvas_1.paste(shirt_res, (pos_shirt_x, START_Y_1), shirt_res)

canvas_1.convert('RGB').save('public/images/categories/tshirt-and-shirt-showcase.jpg', quality=95)
canvas_1.convert('RGB').save('public/images/categories/tshirt-and-shirt-showcase.webp', quality=95)
print("1. Saved T-Shirt & Koynek")

# ==========================================
# 2. HUDİ & SVİTER (Oversized Hoodie on left, Crewneck Sweatshirt on right)
# ==========================================
canvas_2 = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)
hoodie_raw = Image.open('public/images/studio/hoodie/black-front-hoodie.png').convert('RGBA')
hoodie_crop = crop_tight(hoodie_raw)
sweat_raw = Image.open('public/images/studio/sweatshirt/black-front-sweatshirt.png').convert('RGBA')
sweat_crop = crop_tight(sweat_raw)

TARGET_H_2 = 540
hoodie_scale = TARGET_H_2 / hoodie_crop.size[1]
hoodie_w = int(hoodie_crop.size[0] * hoodie_scale)
hoodie_res = hoodie_crop.resize((hoodie_w, TARGET_H_2), Image.Resampling.LANCZOS)

sweat_scale = TARGET_H_2 / sweat_crop.size[1]
sweat_w = int(sweat_crop.size[0] * sweat_scale)
sweat_res = sweat_crop.resize((sweat_w, TARGET_H_2), Image.Resampling.LANCZOS)

GAP_2 = 45
TOTAL_W_2 = hoodie_w + sweat_w + GAP_2
START_X_2 = (CANVAS_W - TOTAL_W_2) // 2
START_Y_2 = (CANVAS_H - TARGET_H_2) // 2

sh_hoodie = add_drop_shadow(hoodie_res, offset=(0, 16), blur=22, shadow_alpha=40)
canvas_2.paste(sh_hoodie, (START_X_2 - 44, START_Y_2 - 20), sh_hoodie)
canvas_2.paste(hoodie_res, (START_X_2, START_Y_2), hoodie_res)

pos_sweat_x = START_X_2 + hoodie_w + GAP_2
sh_sweat = add_drop_shadow(sweat_res, offset=(0, 16), blur=22, shadow_alpha=40)
canvas_2.paste(sh_sweat, (pos_sweat_x - 44, START_Y_2 - 20), sh_sweat)
canvas_2.paste(sweat_res, (pos_sweat_x, START_Y_2), sweat_res)

canvas_2.convert('RGB').save('public/images/categories/hudi-and-sviter-showcase.jpg', quality=95)
canvas_2.convert('RGB').save('public/images/categories/hudi-and-sviter-showcase.webp', quality=95)
print("2. Saved Hudi & Sviter")

# ==========================================
# 3. ŞALVAR & ŞORTİK (Chino / Cargo on left, Darkblue Shorts on right)
# ==========================================
canvas_3 = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)
pants_raw = Image.open('public/shirts/kargo-salvar.webp').convert('RGBA')
pants_crop = crop_tight(pants_raw)

PANTS_H = 620
pants_scale = PANTS_H / pants_crop.size[1]
pants_w = int(pants_crop.size[0] * pants_scale)
pants_res = pants_crop.resize((pants_w, PANTS_H), Image.Resampling.LANCZOS)

shorts_source = Image.open('public/images/studio/salvar/darkblue-front-salvar.png').convert('RGBA')
shorts_tight = crop_tight(shorts_source)
shorts_cutoff_y = int(shorts_tight.size[1] * 0.48)
shorts_crop = shorts_tight.crop((0, 0, shorts_tight.size[0], shorts_cutoff_y))

w_sc, h_sc = shorts_crop.size
alpha_sc = np.array(shorts_crop.split()[3])
alpha_sc[h_sc-6:, :] = np.minimum(alpha_sc[h_sc-6:, :], np.linspace(255, 0, 6)[:, None].astype(np.uint8))
shorts_crop.putalpha(Image.fromarray(alpha_sc))

SHORTS_H = 360
shorts_scale = SHORTS_H / shorts_crop.size[1]
shorts_w = int(shorts_crop.size[0] * shorts_scale)
shorts_res = shorts_crop.resize((shorts_w, SHORTS_H), Image.Resampling.LANCZOS)

GAP_3 = 60
TOTAL_W_3 = pants_w + shorts_w + GAP_3
START_X_3 = (CANVAS_W - TOTAL_W_3) // 2

START_Y_PANTS = (CANVAS_H - PANTS_H) // 2 + 5
START_Y_SHORTS = START_Y_PANTS + 30

sh_pants = add_drop_shadow(pants_res, offset=(0, 16), blur=20, shadow_alpha=40)
canvas_3.paste(sh_pants, (START_X_3 - 40, START_Y_PANTS - 20), sh_pants)
canvas_3.paste(pants_res, (START_X_3, START_Y_PANTS), pants_res)

pos_shorts_x = START_X_3 + pants_w + GAP_3
sh_shorts = add_drop_shadow(shorts_res, offset=(0, 14), blur=18, shadow_alpha=35)
canvas_3.paste(sh_shorts, (pos_shorts_x - 36, START_Y_SHORTS - 20), sh_shorts)
canvas_3.paste(shorts_res, (pos_shorts_x, START_Y_SHORTS), shorts_res)

canvas_3.convert('RGB').save('public/images/categories/salvar-and-shortik-showcase.jpg', quality=95)
canvas_3.convert('RGB').save('public/images/categories/salvar-and-shortik-showcase.webp', quality=95)
print("3. Saved Salvar & Sortik")

# ==========================================
# 4. AKSESUARLAR (Heavy Snapback Cap on left, Natural Canvas Tote on right)
# ==========================================
canvas_4 = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)
cap_raw = Image.open('public/images/studio/kepka/black-front-kepka.png').convert('RGBA')
cap_crop = crop_tight(cap_raw)
bag_raw = Image.open('public/images/studio/chanta/beige-front-chanta.png').convert('RGBA')
bag_crop = crop_tight(bag_raw)

BAG_H = 530
bag_scale = BAG_H / bag_crop.size[1]
bag_w = int(bag_crop.size[0] * bag_scale)
bag_res = bag_crop.resize((bag_w, BAG_H), Image.Resampling.LANCZOS)

CAP_H = 350
cap_scale = CAP_H / cap_crop.size[1]
cap_w = int(cap_crop.size[0] * cap_scale)
cap_res = cap_crop.resize((cap_w, CAP_H), Image.Resampling.LANCZOS)

GAP_4 = 60
TOTAL_W_4 = cap_w + bag_w + GAP_4
START_X_4 = (CANVAS_W - TOTAL_W_4) // 2

START_Y_CAP = (CANVAS_H - CAP_H) // 2 + 20
START_Y_BAG = (CANVAS_H - BAG_H) // 2

sh_cap = add_drop_shadow(cap_res, offset=(0, 14), blur=18, shadow_alpha=35)
canvas_4.paste(sh_cap, (START_X_4 - 36, START_Y_CAP - 20), sh_cap)
canvas_4.paste(cap_res, (START_X_4, START_Y_CAP), cap_res)

pos_bag_x = START_X_4 + cap_w + GAP_4
sh_bag = add_drop_shadow(bag_res, offset=(0, 18), blur=24, shadow_alpha=38)
canvas_4.paste(sh_bag, (pos_bag_x - 48, START_Y_BAG - 20), sh_bag)
canvas_4.paste(bag_res, (pos_bag_x, START_Y_BAG), bag_res)

canvas_4.convert('RGB').save('public/images/categories/accessories-showcase.jpg', quality=95)
canvas_4.convert('RGB').save('public/images/categories/accessories-showcase.webp', quality=95)
print("4. Saved Aksesuarlar")
