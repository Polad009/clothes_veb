import cv2
import numpy as np
from PIL import Image

TARGET_W, TARGET_H = 900, 1200

def fit_on_canvas(im, target_w=TARGET_W, target_h=TARGET_H, max_ratio=0.88):
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    cw, ch = im.size
    scale = min((target_w * max_ratio) / cw, (target_h * max_ratio) / ch)
    new_w, new_h = int(cw * scale), int(ch * scale)
    scaled = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    paste_x = (target_w - new_w) // 2
    paste_y = (target_h - new_h) // 2
    canvas.paste(scaled, (paste_x, paste_y), scaled)
    return canvas

# 1. Clean up White Front from raw
raw_white = Image.open("public/images/uploads/bmw_m4_tee_white_raw.png").convert("RGBA")
arr_w = np.array(raw_white)

# Clean any table shadow artifacts around borders
# Shadows on table have high alpha but lower brightness and warm tint (x < 100, x > 650, y > 800)
# Let's inspect where alpha > 0
# Create clean alpha mask
alpha = arr_w[:, :, 3]
r, g, b = arr_w[:, :, 0], arr_w[:, :, 1], arr_w[:, :, 2]

# On table shadow, brightness is around 120-180 and saturation is low
# Fabric is either white (>230) or artwork (colored, saturated or dark car grill)
# The tabletop in the user's photo was grey/beige (RGB ~ 180, 185, 190)
# Threshold out low-alpha edge fringing
clean_alpha = np.where(alpha < 40, 0, alpha)
arr_w[:, :, 3] = clean_alpha

white_front_clean = fit_on_canvas(Image.fromarray(arr_w))
white_front_clean.save("public/images/uploads/bmw_m4_tee_white_front.png")
print("Saved white front!")

# 2. Extract graphic layer for overlaying on Black and Grey
# The graphic is centered on the torso:
# Y: 180 to 950, X: 150 to 750
# In the white shirt, the fabric is near pure white (#FAF8F5, RGB > 240)
# Pixels belonging to the artwork have color or are darker than white fabric
arr_wf = np.array(white_front_clean)
wf_r, wf_g, wf_b, wf_a = arr_wf[:, :, 0], arr_wf[:, :, 1], arr_wf[:, :, 2], arr_wf[:, :, 3]

# Calculate difference from pure white fabric
# Artwork has lower brightness or noticeable color
gray_val = (wf_r.astype(float) + wf_g.astype(float) + wf_b.astype(float)) / 3.0
color_diff = np.maximum.reduce([
    np.abs(wf_r.astype(int) - wf_g.astype(int)),
    np.abs(wf_r.astype(int) - wf_b.astype(int)),
    np.abs(wf_g.astype(int) - wf_b.astype(int))
])

# Artwork mask on the torso
art_mask = (wf_a > 100) & ((gray_val < 235) | (color_diff > 10))
# Dilate slightly for smooth transition
art_mask_u8 = cv2.dilate((art_mask * 255).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
art_alpha = (art_mask_u8.astype(float) / 255.0)[:, :, np.newaxis]

# 3. Create Clean White Back View
# In a white crewneck, back is solid white fabric with collar band from behind.
# We inpaint the artwork area using the clean white fabric from sleeves/collar:
wf_rgb = arr_wf[:, :, :3]
white_back_rgb = cv2.inpaint(wf_rgb, art_mask_u8, 11, cv2.INPAINT_TELEA)

# Also cover the inside collar tag from the front view (y: 120-220, x: 400-500)
tag_mask = np.zeros((TARGET_H, TARGET_W), dtype=np.uint8)
tag_mask[120:230, 390:510] = (gray_val[120:230, 390:510] < 220) * 255
tag_mask = cv2.dilate(tag_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
white_back_rgb = cv2.inpaint(white_back_rgb, tag_mask, 7, cv2.INPAINT_TELEA)

white_back = Image.fromarray(np.dstack([white_back_rgb, wf_a]))
white_back.save("public/images/uploads/bmw_m4_tee_white_back.png")
print("Saved white back!")

# 4. Create Washed Black Front and Back
# Convert white fabric to washed black fabric (base black ~ RGB(24, 24, 26))
# Calculate shading from white fabric folds:
white_norm = np.clip(white_back_rgb.astype(float) / 245.0, 0.0, 1.0)
black_base = np.array([24.0, 24.0, 26.0])
black_fabric = (black_base * (0.65 + 0.65 * white_norm)).astype(np.uint8)

# Black Back
black_back = Image.fromarray(np.dstack([black_fabric, wf_a]))
black_back.save("public/images/uploads/bmw_m4_tee_black_back.png")
print("Saved black back!")

# Black Front: composite artwork onto black fabric
# For artwork with light colors (cyan stripes, white car hood), keep them bright with subtle shadow
black_front_rgb = (wf_rgb * art_alpha + black_fabric * (1.0 - art_alpha)).astype(np.uint8)
black_front = Image.fromarray(np.dstack([black_front_rgb, wf_a]))
black_front.save("public/images/uploads/bmw_m4_tee_black_front.png")
print("Saved black front!")

# 5. Create Heather Grey Front and Back
# Base grey ~ RGB(145, 148, 152)
grey_base = np.array([142.0, 145.0, 150.0])
np.random.seed(42)
heather_noise = np.random.normal(0, 3.5, (TARGET_H, TARGET_W, 1))
grey_fabric = np.clip((grey_base * (0.60 + 0.55 * white_norm) + heather_noise), 30, 245).astype(np.uint8)

# Grey Back
grey_back = Image.fromarray(np.dstack([grey_fabric, wf_a]))
grey_back.save("public/images/uploads/bmw_m4_tee_grey_back.png")
print("Saved grey back!")

# Grey Front: composite artwork onto grey fabric
grey_front_rgb = (wf_rgb * art_alpha + grey_fabric * (1.0 - art_alpha)).astype(np.uint8)
grey_front = Image.fromarray(np.dstack([grey_front_rgb, wf_a]))
grey_front.save("public/images/uploads/bmw_m4_tee_grey_front.png")
print("Saved grey front!")
