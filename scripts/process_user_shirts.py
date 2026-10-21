import os
import shutil
from PIL import Image, ImageDraw
from rembg import new_session, remove

RAW_DIR = "public/shirts/raw"
OUT_DIR = "public/shirts"
USER_UPLOADED_DIR = r"C:\Users\Elsan\.gemini\antigravity-ide\brain\29b34aec-a6ba-42f6-9b9c-66b7ee0f051e\.user_uploaded"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

raw_mappings = {
    "keten-koynek.png": "media_1792349780560.jpg",
    "kargo-salvar.png": "media_1792349776870.jpg",
    "hudi-qara.png": "media_1792349834471.jpg",
    "ag-tisort.png": "media_1792349760352.jpg",
}

print("1. Copying raw files to public/shirts/raw/...")
for target_name, src_file in raw_mappings.items():
    src_path = os.path.join(USER_UPLOADED_DIR, src_file)
    dst_path = os.path.join(RAW_DIR, target_name)
    shutil.copy2(src_path, dst_path)
    print(f"  Copied {src_file} -> {dst_path}")

print("\n2. Initializing rembg session...")
session = new_session("u2netp")

def trim_and_resize(im, target_height=1600):
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    new_w = int(w * (target_height / h))
    im = im.resize((new_w, target_height), Image.Resampling.LANCZOS)
    return im

# 1. Keten Koynek
print("\nProcessing keten-koynek...")
im_keten = Image.open(os.path.join(RAW_DIR, "keten-koynek.png")).convert("RGB")
# Remove bg
res_keten = remove(im_keten, session=session, alpha_matting=True, alpha_matting_erode_size=10)
# Clean up shadow on the right if any
# Convert to RGBA and threshold alpha: any low-opacity pixels (< 160) on the right half get cleared
r, g, b, a = res_keten.split()
a_data = list(a.getdata())
width, height = res_keten.size
new_a = []
for idx, val in enumerate(a_data):
    x = idx % width
    # If on the right side and low alpha (shadow residue)
    if x > width * 0.70 and val < 170:
        new_a.append(0)
    elif val < 30: # general stray noise
        new_a.append(0)
    else:
        new_a.append(val)
a.putdata(new_a)
res_keten = Image.merge("RGBA", (r, g, b, a))
res_keten = trim_and_resize(res_keten, 1600)
res_keten.save(os.path.join(OUT_DIR, "keten-koynek.png"), "PNG")
print("Saved public/shirts/keten-koynek.png", res_keten.size)

# 2. Kargo Salvar
print("\nProcessing kargo-salvar...")
im_kargo = Image.open(os.path.join(RAW_DIR, "kargo-salvar.png")).convert("RGB")
# Remove sparkle icon in bottom-right corner before rembg
draw = ImageDraw.Draw(im_kargo)
bg_color = im_kargo.getpixel((im_kargo.width - 100, im_kargo.height - 100))
# Cover bottom right 90x90
draw.rectangle([im_kargo.width - 90, im_kargo.height - 90, im_kargo.width, im_kargo.height], fill=bg_color)
res_kargo = remove(im_kargo, session=session, alpha_matting=True, alpha_matting_erode_size=10)
# Height slightly lower so pants don't collide with buttons
res_kargo = trim_and_resize(res_kargo, 1420)
res_kargo.save(os.path.join(OUT_DIR, "kargo-salvar.png"), "PNG")
print("Saved public/shirts/kargo-salvar.png", res_kargo.size)

# 3. Hudi Qara
print("\nProcessing hudi-qara...")
im_hudi = Image.open(os.path.join(RAW_DIR, "hudi-qara.png")).convert("RGB")
res_hudi = remove(im_hudi, session=session, alpha_matting=True, alpha_matting_erode_size=10)
res_hudi = trim_and_resize(res_hudi, 1600)
res_hudi.save(os.path.join(OUT_DIR, "hudi-qara.png"), "PNG")
print("Saved public/shirts/hudi-qara.png", res_hudi.size)

# 4. Ag Tisort
print("\nProcessing ag-tisort...")
im_ag = Image.open(os.path.join(RAW_DIR, "ag-tisort.png")).convert("RGB")
res_ag = remove(im_ag, session=session, alpha_matting=True, alpha_matting_erode_size=10)
res_ag = trim_and_resize(res_ag, 1600)
res_ag.save(os.path.join(OUT_DIR, "ag-tisort.png"), "PNG")
print("Saved public/shirts/ag-tisort.png", res_ag.size)

# 5. Magenta Tee (already exists, let's normalize to 1600px height trimmed)
if os.path.exists(os.path.join(OUT_DIR, "magenta.png")):
    print("\nNormalizing magenta.png to 1600px...")
    im_mag = Image.open(os.path.join(OUT_DIR, "magenta.png")).convert("RGBA")
    res_mag = trim_and_resize(im_mag, 1600)
    res_mag.save(os.path.join(OUT_DIR, "magenta.png"), "PNG")
    print("Saved public/shirts/magenta.png", res_mag.size)

print("\nAll images processed successfully!")
