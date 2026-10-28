import cv2
import numpy as np
import rembg
from PIL import Image

# 1. Isolate the back view of regular t-shirt
back_raw = Image.open("public/images/products/essential-white-cotton-tee/back.jpg").convert("RGB")
clean_black_back = rembg.remove(back_raw)
clean_black_back.save("public/images/uploads/regular_tee_black_back_raw.png")
print("Saved regular_tee_black_back_raw.png!")

# 2. Isolate front view of regular t-shirt
front_raw = Image.open("public/images/products/essential-white-cotton-tee/front.jpg").convert("RGB")
clean_black_front = rembg.remove(front_raw)
clean_black_front.save("public/images/uploads/regular_tee_black_front_raw.png")
print("Saved regular_tee_black_front_raw.png!")
