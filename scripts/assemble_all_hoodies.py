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

# 1. Black Front
front_raw = Image.open("public/images/uploads/bmw_hoodie_black_front.png").convert("RGBA")
black_front = fit_on_canvas(front_raw)
black_front.save("public/images/uploads/bmw_hoodie_black_front_v3.png")

# 2. Grey Front & White Front
grey_front_raw = Image.open("public/images/uploads/bmw_hoodie_grey_front.png").convert("RGBA")
grey_front = fit_on_canvas(grey_front_raw)
grey_front.save("public/images/uploads/bmw_hoodie_grey_front_v3.png")

white_front_raw = Image.open("public/images/uploads/bmw_hoodie_white_front.png").convert("RGBA")
white_front = fit_on_canvas(white_front_raw)
white_front.save("public/images/uploads/bmw_hoodie_white_front_v3.png")

# 3. Real Black Back
back_raw = Image.open("public/images/uploads/real_hoodie_back_clean.png").convert("RGBA")
black_back = fit_on_canvas(back_raw)

# Clean any faint print shadow on the back torso (y: 350 to 800, x: 230 to 670)
arr_bb = np.array(black_back)
bgr_bb = cv2.cvtColor(arr_bb[:, :, :3], cv2.COLOR_RGB2BGR)
# Apply a smooth inpaint/filter along the box borders if any
rect_mask = np.zeros((TARGET_H, TARGET_W), dtype=np.uint8)
# Border of the faint print box:
cv2.rectangle(rect_mask, (250, 370), (650, 780), 255, 14)
bgr_bb = cv2.inpaint(bgr_bb, rect_mask, 7, cv2.INPAINT_TELEA)
black_back = Image.fromarray(np.dstack([cv2.cvtColor(bgr_bb, cv2.COLOR_BGR2RGB), arr_bb[:, :, 3]]))
black_back.save("public/images/uploads/bmw_hoodie_black_back_v3.png")

# 4. Generate Grey Back & White Back
arr_back = np.array(black_back)
r, g, b, a = arr_back[:, :, 0], arr_back[:, :, 1], arr_back[:, :, 2], arr_back[:, :, 3]
gray_back = cv2.cvtColor(arr_back[:, :, :3], cv2.COLOR_RGB2GRAY)
fabric_gray_b = np.clip(gray_back, 10, 55).astype(np.float32)
shading_b = (fabric_gray_b - fabric_gray_b.min()) / (fabric_gray_b.max() - fabric_gray_b.min() + 1e-5)
shading_b = np.power(shading_b, 1.1)

# Grey Back
grey_base = np.array([135, 138, 142], dtype=np.float32)
np.random.seed(42)
heather_noise = np.random.normal(0, 3.5, (arr_back.shape[0], arr_back.shape[1], 1))
grey_fabric_b = (grey_base * (0.62 + 0.65 * shading_b[:, :, np.newaxis]) + heather_noise)
grey_fabric_b = np.clip(grey_fabric_b, 30, 240).astype(np.uint8)
grey_back_rgba = np.dstack([grey_fabric_b, a])
Image.fromarray(grey_back_rgba).save("public/images/uploads/bmw_hoodie_grey_back_v3.png")

# White Back
white_base = np.array([242, 242, 245], dtype=np.float32)
white_fabric_b = white_base * (0.60 + 0.45 * shading_b[:, :, np.newaxis])
white_fabric_b = np.clip(white_fabric_b, 70, 255).astype(np.uint8)
white_back_rgba = np.dstack([white_fabric_b, a])
Image.fromarray(white_back_rgba).save("public/images/uploads/bmw_hoodie_white_back_v3.png")

print("All 6 hoodie variations generated with seamless back views!")
