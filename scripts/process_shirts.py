import os
import sys
from PIL import Image

def process_image(input_path, output_path, crop_left_half=False):
    print(f"Processing: {input_path} -> {output_path}")
    img = Image.open(input_path).convert("RGBA")
    
    # If dual image, crop the front (left half)
    if crop_left_half or (img.width > img.height * 1.3):
        # crop left 52% with a bit of margin
        crop_w = int(img.width * 0.52)
        img = img.crop((0, 0, crop_w, img.height))
        print(f"  Cropped left half: new size {img.size}")
        
    try:
        from rembg import new_session, remove
        print("  Running rembg with lightweight u2netp model (~4.7MB)...")
        session = new_session("u2netp")
        result = remove(img, session=session)
    except Exception as e:
        print(f"  rembg failed or not ready: {e}. Trying simple color thresholding...")
        # Fallback if rembg is not available
        datas = img.getdata()
        newData = []
        for item in datas:
            # If near white background (RGB > 240)
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        result = img

    # Trim empty transparent edges
    bbox = result.getbbox()
    if bbox:
        # Add 10px padding
        pad = 10
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(result.width, bbox[2] + pad)
        bottom = min(result.height, bbox[3] + pad)
        result = result.crop((left, top, right, bottom))
        print(f"  Trimmed bbox to: {result.size}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result.save(output_path, "PNG")
    print(f"  Saved successfully to {output_path}")

if __name__ == "__main__":
    targets = [
        {
            "in": "public/images/products/beige-linen-relaxed-shirt/front.jpg",
            "out": "public/shirts/ketan.png",
            "crop_left": False
        },
        {
            "in": "public/images/products/white-oxford-button-down-shirt/front.jpg",
            "out": "public/shirts/oxford.png",
            "crop_left": False
        },
        {
            "in": "public/images/products/heavyweight-hoodie-black/front.jpg",
            "out": "public/shirts/hudi.png",
            "crop_left": False
        },
        {
            "in": "public/images/hero/magenta-tee.jpg",
            "out": "public/shirts/magenta.png",
            "crop_left": False
        }
    ]

    for t in targets:
        if os.path.exists(t["in"]):
            process_image(t["in"], t["out"], t.get("crop_left", False))
        else:
            print(f"Input not found: {t['in']}")
