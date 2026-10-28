import os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

# 1. Load the clean black front hoodie
front_path = "public/images/uploads/bmw_hoodie_black_front.png"
im_front = Image.open(front_path).convert("RGBA")
w, h = im_front.size

# Check bounding box
bbox = im_front.getbbox()
print("Front size:", (w, h), "Bbox:", bbox)

# Create a clean canvas with standard aspect ratio (e.g. 1000 x 1400 or 800 x 1100)
# Let's inspect the crop
cropped_front = im_front.crop(bbox)
cw, ch = cropped_front.size

# Target canvas 900 x 1200
target_w, target_h = 900, 1200
scale = min((target_w * 0.92) / cw, (target_h * 0.92) / ch)
new_w, new_h = int(cw * scale), int(ch * scale)
scaled_front = cropped_front.resize((new_w, new_h), Image.Resampling.LANCZOS)

canvas_front = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
paste_x = (target_w - new_w) // 2
paste_y = (target_h - new_h) // 2
canvas_front.paste(scaled_front, (paste_x, paste_y), scaled_front)
canvas_front.save("public/images/uploads/bmw_hoodie_black_front_v1.png")
print("Saved black front:", canvas_front.size)
