import os
from PIL import Image, ImageOps, ImageFilter
import numpy as np

os.makedirs('public/images/categories', exist_ok=True)

CANVAS_W = 1000
CANVAS_H = 750
BG_COLOR = (250, 247, 242, 255) # Matches website warm stone background #FAF7F2

def add_drop_shadow(image_rgba, offset=(0, 14), blur=16, shadow_alpha=35):
    """Creates a soft elegant studio shadow underneath the clothing item"""
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
# 1. T-SHIRT & KÖYNƏK (Tee on left, Shirt on right)
# ==========================================
canvas_tshirt = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)

# Tee (Black luxury streetwear tee)
tee_raw = Image.open('public/images/uploads/mclaren_tee_black_front_v2.png').convert('RGBA')
tee_crop = crop_tight(tee_raw)

# Shirt (White crisp linen button-down)
shirt_raw = Image.open('public/shirts/keten-koynek.webp').convert('RGBA')
shirt_crop = crop_tight(shirt_raw)

# Set common target height ~ 540px
TARGET_H_TOPS = 540

# Scale Tee
tee_scale = TARGET_H_TOPS / tee_crop.size[1]
tee_w = int(tee_crop.size[0] * tee_scale)
tee_res = tee_crop.resize((tee_w, TARGET_H_TOPS), Image.Resampling.LANCZOS)

# Scale Shirt
shirt_scale = TARGET_H_TOPS / shirt_crop.size[1]
shirt_w = int(shirt_crop.size[0] * shirt_scale)
shirt_res = shirt_crop.resize((shirt_w, TARGET_H_TOPS), Image.Resampling.LANCZOS)

# Center both side-by-side
GAP_TOPS = 40
TOTAL_W_TOPS = tee_w + shirt_w + GAP_TOPS
START_X_TOPS = (CANVAS_W - TOTAL_W_TOPS) // 2
START_Y_TOPS = (CANVAS_H - TARGET_H_TOPS) // 2

# Place Tee with shadow
shadow_tee = add_drop_shadow(tee_res, offset=(0, 15), blur=18, shadow_alpha=35)
canvas_tshirt.paste(shadow_tee, (START_X_TOPS - 36, START_Y_TOPS - 20), shadow_tee)
canvas_tshirt.paste(tee_res, (START_X_TOPS, START_Y_TOPS), tee_res)

# Place Shirt with shadow
pos_shirt_x = START_X_TOPS + tee_w + GAP_TOPS
shadow_shirt = add_drop_shadow(shirt_res, offset=(0, 15), blur=18, shadow_alpha=35)
canvas_tshirt.paste(shadow_shirt, (pos_shirt_x - 36, START_Y_TOPS - 20), shadow_shirt)
canvas_tshirt.paste(shirt_res, (pos_shirt_x, START_Y_TOPS), shirt_res)

# Save
canvas_tshirt.convert('RGB').save('public/images/categories/tshirt-and-shirt-showcase.jpg', quality=95)
canvas_tshirt.convert('RGB').save('public/images/categories/tshirt-and-shirt-showcase.webp', quality=95)
print("Saved T-Shirt & Koynek showcase successfully.")


# ==========================================
# 2. ŞALVAR & ŞORTİK (Full Pants on left, Shorts on right)
# ==========================================
canvas_bottoms = Image.new('RGBA', (CANVAS_W, CANVAS_H), BG_COLOR)

# Full Pants (Full length Kargo / Chino)
pants_raw = Image.open('public/shirts/kargo-salvar.webp').convert('RGBA')
pants_crop = crop_tight(pants_raw)

# Target height for full length pants = 620px
PANTS_H = 620
pants_scale = PANTS_H / pants_crop.size[1]
pants_w = int(pants_crop.size[0] * pants_scale)
pants_res = pants_crop.resize((pants_w, PANTS_H), Image.Resampling.LANCZOS)

# Create Shorts:
# We crop the studio darkblue trousers to realistic shorts proportion (waist down to just above knee)
shorts_source = Image.open('public/images/studio/salvar/darkblue-front-salvar.png').convert('RGBA')
shorts_tight = crop_tight(shorts_source)

# Shorts are typically ~45% length of full trousers
shorts_cutoff_y = int(shorts_tight.size[1] * 0.48)
shorts_crop = shorts_tight.crop((0, 0, shorts_tight.size[0], shorts_cutoff_y))

# Add a neat hem line / curve to bottom edge of shorts
w_sc, h_sc = shorts_crop.size
alpha_sc = np.array(shorts_crop.split()[3])
# Soften bottom edge
alpha_sc[h_sc-6:, :] = np.minimum(alpha_sc[h_sc-6:, :], np.linspace(255, 0, 6)[:, None].astype(np.uint8))
shorts_crop.putalpha(Image.fromarray(alpha_sc))

# Target height for shorts = 360px
SHORTS_H = 360
shorts_scale = SHORTS_H / shorts_crop.size[1]
shorts_w = int(shorts_crop.size[0] * shorts_scale)
shorts_res = shorts_crop.resize((shorts_w, SHORTS_H), Image.Resampling.LANCZOS)

# Center both side-by-side
GAP_BOTTOMS = 60
TOTAL_W_BOTTOMS = pants_w + shorts_w + GAP_BOTTOMS
START_X_BOTTOMS = (CANVAS_W - TOTAL_W_BOTTOMS) // 2

# Vertical alignment: align waistline near top (~70px from top)
START_Y_PANTS = (CANVAS_H - PANTS_H) // 2 + 5
START_Y_SHORTS = START_Y_PANTS + 30 # Slightly lower for natural balanced look

# Place Pants with shadow
shadow_pants = add_drop_shadow(pants_res, offset=(0, 16), blur=20, shadow_alpha=40)
canvas_bottoms.paste(shadow_pants, (START_X_BOTTOMS - 40, START_Y_PANTS - 20), shadow_pants)
canvas_bottoms.paste(pants_res, (START_X_BOTTOMS, START_Y_PANTS), pants_res)

# Place Shorts with shadow
pos_shorts_x = START_X_BOTTOMS + pants_w + GAP_BOTTOMS
shadow_shorts = add_drop_shadow(shorts_res, offset=(0, 14), blur=18, shadow_alpha=35)
canvas_bottoms.paste(shadow_shorts, (pos_shorts_x - 36, START_Y_SHORTS - 20), shadow_shorts)
canvas_bottoms.paste(shorts_res, (pos_shorts_x, START_Y_SHORTS), shorts_res)

# Save
canvas_bottoms.convert('RGB').save('public/images/categories/salvar-and-shortik-showcase.jpg', quality=95)
canvas_bottoms.convert('RGB').save('public/images/categories/salvar-and-shortik-showcase.webp', quality=95)
print("Saved Salvar & Sortik showcase successfully.")
