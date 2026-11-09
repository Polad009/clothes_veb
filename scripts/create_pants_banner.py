from PIL import Image, ImageFilter
import numpy as np

# We create a luxury wide landscape banner: 1600 x 1100
CANVAS_W = 1600
CANVAS_H = 1100

pants_rgba = Image.open('public/images/categories/trio_pants_cutout.png').convert('RGBA')

# Target height for the 3 pants = 940px
TARGET_H = 940
scale = TARGET_H / pants_rgba.size[1]
target_w = int(pants_rgba.size[0] * scale)
pants_resized = pants_rgba.resize((target_w, TARGET_H), Image.Resampling.LANCZOS)

# Soft luxury ambient shadow under the trousers
w, h = pants_resized.size
blur = 28
shadow = Image.new('RGBA', (w + blur * 4, h + blur * 4), (0, 0, 0, 0))
alpha = pants_resized.split()[3]
silhouette = Image.new('L', (w, h), 0)
silhouette.paste(alpha)
shadow.paste((15, 10, 8, 55), (blur * 2 + 10, blur * 2 + 25), mask=silhouette)
shadow = shadow.filter(ImageFilter.GaussianBlur(blur))

# 1. Dark Luxury Studio Version (Deep charcoal to black radial vignette)
canvas_dark = Image.new('RGBA', (CANVAS_W, CANVAS_H), (18, 16, 17, 255))
# Place pants on the right/center portion leaving left side elegant for luxury typography
start_x = CANVAS_W - target_w - 60
start_y = (CANVAS_H - TARGET_H) // 2 + 10

canvas_dark.paste(shadow, (start_x - 56, start_y - 25), shadow)
canvas_dark.paste(pants_resized, (start_x, start_y), pants_resized)

canvas_dark.convert('RGB').save('public/images/categories/pants_collection_banner.jpg', quality=95)
canvas_dark.convert('RGB').save('public/images/categories/pants_collection_banner.webp', quality=95)

# Also save standalone transparent trio webp for direct hero placement
pants_resized.save('public/images/categories/trio_pants_cutout.webp', quality=95)
print('Successfully generated pants collection banners!')
