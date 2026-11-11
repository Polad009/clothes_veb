import os, sys
from PIL import Image
from rembg import new_session, remove

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
session = new_session("isnet-general-use")
for f in sorted(os.listdir(src)):
    if not f.endswith(".jpg"):
        continue
    im = Image.open(os.path.join(src, f)).convert("RGB")
    cut = remove(im, session=session, post_process_mask=True)
    bbox = cut.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    cut = cut.crop(bbox)
    cut.save(os.path.join(out, f.replace(".jpg", ".png")))
    print(f, "->", cut.size)
