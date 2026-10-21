import os
from PIL import Image, ImageDraw
from rembg import new_session, remove

RAW_DIR = "public/shirts/raw"
OUT_DIR = "public/shirts"

print("Initializing bria-rmbg session...")
session = new_session("bria-rmbg")

def trim_and_resize(im, target_height=1600):
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    w, h = im.size
    new_w = int(w * (target_height / h))
    im = im.resize((new_w, target_height), Image.Resampling.LANCZOS)
    return im

# 1. Keten Koynek (already tested, let's process cleanly)
print("\n1. Processing keten-koynek with bria-rmbg...")
if os.path.exists("public/shirts/test_keten_bria.png"):
    res_keten = Image.open("public/shirts/test_keten_bria.png").convert("RGBA")
else:
    im_keten = Image.open(os.path.join(RAW_DIR, "keten-koynek.png")).convert("RGB")
    res_keten = remove(im_keten, session=session)

# Clean any wall shadow residue if present (only low alpha on far right edge)
r, g, b, a = res_keten.split()
a_data = list(a.getdata())
width, height = res_keten.size
new_a = []
for idx, val in enumerate(a_data):
    x = idx % width
    if x > width * 0.85 and val < 60:
        new_a.append(0)
    else:
        new_a.append(val)
a.putdata(new_a)
res_keten = Image.merge("RGBA", (r, g, b, a))
res_keten = trim_and_resize(res_keten, 1600)
res_keten.save(os.path.join(OUT_DIR, "keten-koynek.png"), "PNG")
print("Saved keten-koynek.png:", res_keten.size)

# 2. Ag Tisort (already processed into test_ag_bria.png)
print("\n2. Processing ag-tisort...")
if os.path.exists("public/shirts/test_ag_bria.png"):
    res_ag = Image.open("public/shirts/test_ag_bria.png").convert("RGBA")
else:
    im_ag = Image.open(os.path.join(RAW_DIR, "ag-tisort.png")).convert("RGB")
    res_ag = remove(im_ag, session=session)
res_ag = trim_and_resize(res_ag, 1600)
res_ag.save(os.path.join(OUT_DIR, "ag-tisort.png"), "PNG")
print("Saved ag-tisort.png:", res_ag.size)

# 3. Kargo Salvar
print("\n3. Processing kargo-salvar with bria-rmbg...")
im_kargo = Image.open(os.path.join(RAW_DIR, "kargo-salvar.png")).convert("RGB")
draw = ImageDraw.Draw(im_kargo)
bg_color = im_kargo.getpixel((im_kargo.width - 100, im_kargo.height - 100))
draw.rectangle([im_kargo.width - 90, im_kargo.height - 90, im_kargo.width, im_kargo.height], fill=bg_color)
res_kargo = remove(im_kargo, session=session)
res_kargo = trim_and_resize(res_kargo, 1420)
res_kargo.save(os.path.join(OUT_DIR, "kargo-salvar.png"), "PNG")
print("Saved kargo-salvar.png:", res_kargo.size)

# 4. Hudi Qara
print("\n4. Processing hudi-qara with bria-rmbg...")
im_hudi = Image.open(os.path.join(RAW_DIR, "hudi-qara.png")).convert("RGB")
res_hudi = remove(im_hudi, session=session)
res_hudi = trim_and_resize(res_hudi, 1600)
res_hudi.save(os.path.join(OUT_DIR, "hudi-qara.png"), "PNG")
print("Saved hudi-qara.png:", res_hudi.size)

print("\nAll 4 products re-processed with bria-rmbg successfully!")
