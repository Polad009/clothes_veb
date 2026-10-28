import cv2
import numpy as np
from PIL import Image, ImageFilter

front = Image.open("public/images/uploads/bmw_hoodie_black_front_v1.png").convert("RGBA")
w, h = front.size
arr = np.array(front)

# Clone fabric texture from clean areas
# Clean torso fabric is on the right side: x from 200 to 270 and y from 400 to 750
# and between y 460 and 580 across x 250 to 650 (below logos, above pocket)
# Let's inspect the median color and texture of the black fabric
torso_sample = arr[480:550, 300:600, :3]
fabric_median = np.median(torso_sample, axis=(0, 1))
print("Fabric median BGR/RGB:", fabric_median)

# Let's create a perfect back view:
# 1. Start with the front array
back_arr = arr.copy()

# 2. Smoothly cover the BMW logo area (y: 340-480, x: 500-640)
# We can mirror the clean fabric from the left chest (x: 260-400) or blend from surrounding
# Notice left chest has folds, let's take clean fabric from x: 200-300 or synthesize
# Using OpenCV SeamlessClone!
# Create a patch of clean black hoodie fabric from x: 230 to 350, y: 360 to 480
patch = back_arr[360:480, 230:350, :3].copy()
# Mirror it horizontally so lighting matches
patch_flipped = np.fliplr(patch)

# Seamless clone onto the BMW logo area
center_bmw = (570, 420)
mask_clone = 255 * np.ones(patch_flipped.shape, patch_flipped.dtype)
bgr_back = cv2.cvtColor(back_arr[:, :, :3], cv2.COLOR_RGB2BGR)
bgr_patch = cv2.cvtColor(patch_flipped, cv2.COLOR_RGB2BGR)
bgr_back = cv2.seamlessClone(bgr_patch, bgr_back, mask_clone[:, :, 0], center_bmw, cv2.NORMAL_CLONE)

# Now remove the M logo area (y: 380-450, x: 275-415)
# Take clean patch from below: y: 480-550, x: 280-400
patch_m = back_arr[480:550, 280:400, :3].copy()
patch_m = cv2.resize(patch_m, (140, 80))
center_m = (345, 420)
mask_m = 255 * np.ones(patch_m.shape, patch_m.dtype)
bgr_patch_m = cv2.cvtColor(patch_m, cv2.COLOR_RGB2BGR)
bgr_back = cv2.seamlessClone(bgr_patch_m, bgr_back, mask_m[:, :, 0], center_m, cv2.NORMAL_CLONE)

# Now remove drawstrings in the center (x: 420-480, y: 310-530)
patch_center = back_arr[470:570, 320:420, :3].copy()
patch_center = cv2.resize(patch_center, (80, 220))
center_str = (450, 420)
mask_str = 255 * np.ones(patch_center.shape, patch_center.dtype)
bgr_patch_str = cv2.cvtColor(patch_center, cv2.COLOR_RGB2BGR)
bgr_back = cv2.seamlessClone(bgr_patch_str, bgr_back, mask_str[:, :, 0], center_str, cv2.NORMAL_CLONE)

# Now remove kangaroo pocket seam (y: 580-740, x: 280-620)
# Below the chest is a horizontal seam and pocket outline.
# Inpaint pocket edges smoothly:
p_mask = np.zeros((h, w), dtype=np.uint8)
# Pocket top edge: y ~ 585-610, x ~ 290-610
p_mask[580:615, 290:610] = 255
# Pocket side diagonal edges:
p_mask[610:720, 270:340] = 255
p_mask[610:720, 560:630] = 255
bgr_back = cv2.inpaint(bgr_back, p_mask, 5, cv2.INPAINT_TELEA)

# Now the neck area: in front view there is a dark hollow hole where the neck enters.
# On the back, the hood fabric falls smoothly over the neck and upper back.
# Neck hole is y: 240-320, x: 400-500.
# Let's clone hood texture from the hood top (y: 180-260, x: 400-500)
hood_patch = bgr_back[160:240, 400:500].copy()
center_neck = (450, 280)
mask_neck = 255 * np.ones(hood_patch.shape, hood_patch.dtype)
bgr_back = cv2.seamlessClone(hood_patch, bgr_back, mask_neck[:, :, 0], center_neck, cv2.NORMAL_CLONE)

# Reassemble RGBA
rgb_back = cv2.cvtColor(bgr_back, cv2.COLOR_BGR2RGB)
back_arr[:, :, :3] = rgb_back

back_img = Image.fromarray(back_arr)
# Slight bilateral smoothing on torso to unify texture
back_img.save("public/images/uploads/bmw_hoodie_black_back_v2.png")
print("Saved bmw_hoodie_black_back_v2.png successfully!")
