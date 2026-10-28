import cv2
import numpy as np
from PIL import Image

# 1. Load the original black front image with transparent background
im_front = Image.open("public/images/uploads/bmw_hoodie_black_front.png").convert("RGBA")
arr_front = np.array(im_front)
r, g, b, a = arr_front[:, :, 0], arr_front[:, :, 1], arr_front[:, :, 2], arr_front[:, :, 3]

# 2. Extract the logos accurately
# The BMW roundel is on the right chest (viewer's right)
# The BMW M logo is on the left chest (viewer's left)
# Let's crop them directly from the original image with their exact coordinates
# Let's verify coordinates:
# M logo: y ~ 380-450, x ~ 215-310 in raw image
# BMW logo: y ~ 380-465, x ~ 390-480 in raw image

# Let's write a script to detect and inspect the logos
print("Image size:", im_front.size)

# Find mask of garment (where alpha > 10)
garment_mask = a > 20

# Luminance of black fabric
gray = cv2.cvtColor(arr_front[:, :, :3], cv2.COLOR_RGB2GRAY)
# In black fabric, values are mostly 15 to 60. Values > 70 in chest are logos/metal eyelets.
fabric_gray = np.clip(gray, 10, 55).astype(np.float32)
# Normalize fabric shading: 0 (deep shadow) to 1.0 (highlight)
shading = (fabric_gray - fabric_gray.min()) / (fabric_gray.max() - fabric_gray.min() + 1e-5)
# Add non-linear curve to keep rich natural shadows
shading = np.power(shading, 1.1)

# Logos mask (colored or bright pixels on chest)
is_logo = (a > 50) & (((r > 70) | (g > 70) | (b > 70)) | ((r.astype(int) - b.astype(int)) > 20) | ((b.astype(int) - r.astype(int)) > 20))
# Dilate logo mask slightly for anti-aliasing
logo_mask_uint8 = is_logo.astype(np.uint8) * 255
logo_mask_uint8 = cv2.dilate(logo_mask_uint8, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
logo_alpha = (logo_mask_uint8.astype(float) / 255.0)[:, :, np.newaxis]

# 3. GENERATE HEATHER GREY HOODIE
# Grey target base color: ~ RGB(140, 142, 146)
grey_base = np.array([135, 138, 142], dtype=np.float32)
# Add subtle heather noise
np.random.seed(42)
heather_noise = np.random.normal(0, 4.0, (arr_front.shape[0], arr_front.shape[1], 1))

grey_fabric = (grey_base * (0.62 + 0.65 * shading[:, :, np.newaxis]) + heather_noise)
grey_fabric = np.clip(grey_fabric, 30, 240).astype(np.uint8)

# Composite logos on top
grey_front = (arr_front[:, :, :3] * logo_alpha + grey_fabric * (1.0 - logo_alpha)).astype(np.uint8)
grey_front_rgba = np.dstack([grey_front, a])
Image.fromarray(grey_front_rgba).save("public/images/uploads/bmw_hoodie_grey_front.png")
print("Saved bmw_hoodie_grey_front.png!")

# 4. GENERATE CLEAN WHITE HOODIE
# White base color: ~ RGB(242, 242, 245)
white_base = np.array([242, 242, 245], dtype=np.float32)
# Deep shading for white fabric so folds and contours look 3D and rich
white_fabric = white_base * (0.60 + 0.45 * shading[:, :, np.newaxis])
white_fabric = np.clip(white_fabric, 70, 255).astype(np.uint8)

white_front = (arr_front[:, :, :3] * logo_alpha + white_fabric * (1.0 - logo_alpha)).astype(np.uint8)
white_front_rgba = np.dstack([white_front, a])
Image.fromarray(white_front_rgba).save("public/images/uploads/bmw_hoodie_white_front.png")
print("Saved bmw_hoodie_white_front.png!")

# 5. GENERATE BACK VIEWS (no logos)
# For black back: take fabric without logos
# Inpaint logo areas on fabric:
black_fabric_clean = cv2.inpaint(arr_front[:, :, :3], logo_mask_uint8, 7, cv2.INPAINT_TELEA)
black_back_rgba = np.dstack([black_fabric_clean, a])
Image.fromarray(black_back_rgba).save("public/images/uploads/bmw_hoodie_black_back.png")
print("Saved bmw_hoodie_black_back.png!")

grey_back_rgba = np.dstack([grey_fabric, a])
Image.fromarray(grey_back_rgba).save("public/images/uploads/bmw_hoodie_grey_back.png")
print("Saved bmw_hoodie_grey_back.png!")

white_back_rgba = np.dstack([white_fabric, a])
Image.fromarray(white_back_rgba).save("public/images/uploads/bmw_hoodie_white_back.png")
print("Saved bmw_hoodie_white_back.png!")
