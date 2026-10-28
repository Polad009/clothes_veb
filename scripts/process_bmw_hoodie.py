import os
import sys
from PIL import Image

input_path = r"C:\Users\Elsan\.gemini\antigravity-ide\brain\92fe3a67-01e5-4bdc-a685-e4a8cd36a451\.user_uploaded\media_1792869898510.jpg"
output_dir = "public/images/uploads"
os.makedirs(output_dir, exist_ok=True)

print("Opening image...")
im = Image.open(input_path).convert("RGB")
print("Original size:", im.size)

try:
    import rembg
    print("Running rembg remove...")
    clean = rembg.remove(im)
    out_file = os.path.join(output_dir, "bmw_hoodie_black_front.png")
    clean.save(out_file, "PNG")
    print("Saved clean png to:", out_file)
except Exception as e:
    print("Rembg error:", e)
    # Save direct copy
    out_file = os.path.join(output_dir, "bmw_hoodie_black_front.png")
    im.save(out_file, "PNG")
    print("Saved raw copy to:", out_file)
