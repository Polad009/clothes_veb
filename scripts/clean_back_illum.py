import cv2
import numpy as np
from PIL import Image

# Load the real clean back
back_raw = Image.open("public/images/uploads/real_hoodie_back_clean.png").convert("RGBA")
arr = np.array(back_raw)
bgr = cv2.cvtColor(arr[:, :, :3], cv2.COLOR_RGB2BGR)
alpha = arr[:, :, 3]

# Create a mask for the back torso area that has the faint rectangle (y: 280 to 580, x: 180 to 520)
# Low-pass filter (smooth background illumination) vs high-pass (fabric texture)
gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)

# Torso mask
torso_mask = np.zeros(gray.shape, dtype=np.float32)
# Define smooth ellipse on torso
cv2.rectangle(torso_mask, (180, 260), (520, 580), 1.0, -1)
torso_mask = cv2.GaussianBlur(torso_mask, (51, 51), 0)

# Decompose into large-scale lighting and fine texture
low_freq = cv2.GaussianBlur(gray, (65, 65), 0)
high_freq = gray - low_freq

# Calculate median illumination outside the rectangle
sample_bg = gray[260:580, 100:170]
target_illum = np.median(sample_bg)

# Replace low_freq in the torso with target_illum
smoothed_low = low_freq * (1.0 - torso_mask) + target_illum * torso_mask
reconstructed_gray = np.clip(smoothed_low + high_freq, 0, 255).astype(np.uint8)

# Apply difference to BGR channels
diff = reconstructed_gray.astype(float) - gray
for c in range(3):
    bgr[:, :, c] = np.clip(bgr[:, :, c].astype(float) + diff, 0, 255).astype(np.uint8)

# Re-save cleaned real back
clean_bgr_img = Image.fromarray(np.dstack([cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), alpha]))
clean_bgr_img.save("public/images/uploads/real_hoodie_back_clean.png")
print("Cleaned real_hoodie_back_clean.png successfully!")
