import os
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

# Load base front image
front_img = Image.open("public/images/uploads/bmw_hoodie_black_front_v1.png").convert("RGBA")
w, h = front_img.size

# Convert to OpenCV format (BGRA)
cv_front = cv2.cvtColor(np.array(front_img), cv2.COLOR_RGBA2BGRA)
b, g, r, a = cv2.split(cv_front)

# 1. CREATE BACK VIEW OF BLACK HOODIE
# For the back view:
# We need to remove the logos, the drawstrings, and soften the kangaroo pocket seam.
# Create a mask for inpainting:
inpaint_mask = np.zeros((h, w), dtype=np.uint8)

# Area containing M logo, drawstrings, BMW logo:
# Y: 310 to 530, X: 260 to 630
# But only where there are bright features or drawstrings
chest_roi = cv_front[310:530, 260:630]
chest_b, chest_g, chest_r, chest_a = cv2.split(chest_roi)
chest_gray = cv2.cvtColor(chest_roi[:, :, :3], cv2.COLOR_BGR2GRAY)

# In chest_roi, fabric is dark black (< 45). Logos and eyelets and drawstrings are brighter or colored.
# Also the eyelets at y ~ 310-335, strings hang down to y ~ 525.
chest_bright = (chest_gray > 38) | (chest_r > 50) | (chest_b > 50)
inpaint_mask[310:530, 260:630][chest_bright] = 255

# Also dilate slightly so inpaint covers borders smoothly
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
inpaint_mask = cv2.dilate(inpaint_mask, kernel, iterations=2)

# Also inpaint kangaroo pocket center pocket lines to make back smooth
# Pocket seam is around y: 590 to 750, x: 280 to 620
pocket_roi = cv_front[585:750, 280:620]
pocket_gray = cv2.cvtColor(pocket_roi[:, :, :3], cv2.COLOR_BGR2GRAY)
pocket_lines = (pocket_gray > 42) & (pocket_gray < 75)
pocket_mask = np.zeros((h, w), dtype=np.uint8)
pocket_mask[585:750, 280:620][pocket_lines] = 255
pocket_mask = cv2.dilate(pocket_mask, kernel, iterations=1)

# Combined inpaint mask for back
total_back_mask = cv2.bitwise_or(inpaint_mask, pocket_mask)

# Inpaint using Telea / Navier-Stokes
rgb = cv2.cvtColor(cv_front, cv2.COLOR_BGRA2BGR)
inpainted_bgr = cv2.inpaint(rgb, total_back_mask, 7, cv2.INPAINT_TELEA)

# Hood opening on the back: on the back, the hood hangs down over the neck,
# so the neck hole should be covered with the hood texture.
# In front view, neck opening is dark inside the hood.
# On the back, it is continuous fabric from the hood.
# Inpaint covers this beautifully!

# Re-attach alpha
black_back_cv = cv2.merge([inpainted_bgr[:, :, 0], inpainted_bgr[:, :, 1], inpainted_bgr[:, :, 2], a])
black_back_img = Image.fromarray(cv2.cvtColor(black_back_cv, cv2.COLOR_BGRA2RGBA))

# Save black back
black_back_img.save("public/images/uploads/bmw_hoodie_black_back_v1.png")
print("Saved black back!")

# 2. ISOLATE LOGO OVERLAY LAYER
# The logos are the M logo and BMW roundel.
# We extract them with an alpha mask so they can be placed on Grey and White hoodies.
logo_mask = np.zeros((h, w), dtype=np.uint8)
# M logo rect: y 380:450, x 280:415
# BMW roundel rect: y 380:465, x 515:615
logo_mask[380:455, 280:415] = 255
logo_mask[380:465, 515:615] = 255

# Keep only the logo pixels where they differ from black fabric
logo_diff = (chest_gray > 25)
logo_combined = np.zeros((h, w), dtype=np.uint8)
logo_combined[310:530, 260:630][logo_diff] = 255
logo_mask = cv2.bitwise_and(logo_mask, logo_combined)

# Eyelets and string aglets (rings at neck):
eyelet_mask = np.zeros((h, w), dtype=np.uint8)
eyelet_mask[310:340, 430:480] = 255
eyelet_mask = cv2.bitwise_and(eyelet_mask, logo_combined)

# Total front hardware & logos mask
hardware_mask = cv2.bitwise_or(logo_mask, eyelet_mask)

logo_rgba = np.zeros((h, w, 4), dtype=np.uint8)
front_np = np.array(front_img)
for c in range(3):
    logo_rgba[:, :, c] = front_np[:, :, c]
logo_rgba[:, :, 3] = np.where(hardware_mask > 0, front_np[:, :, 3], 0)
logo_layer = Image.fromarray(logo_rgba)
logo_layer.save("public/images/uploads/bmw_hoodie_logos_layer.png")
print("Saved logo layer!")
