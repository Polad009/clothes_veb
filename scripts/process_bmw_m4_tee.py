import os
import rembg
from PIL import Image

input_path = r"C:\Users\Elsan\.gemini\antigravity-ide\brain\92fe3a67-01e5-4bdc-a685-e4a8cd36a451\.user_uploaded\media_1792871039650.jpg"
output_dir = "public/images/uploads"
os.makedirs(output_dir, exist_ok=True)

print("Opening image...")
im = Image.open(input_path).convert("RGB")
print("Original size:", im.size)

clean = rembg.remove(im)
out_raw = os.path.join(output_dir, "bmw_m4_tee_white_raw.png")
clean.save(out_raw, "PNG")
print("Saved clean png to:", out_raw)
