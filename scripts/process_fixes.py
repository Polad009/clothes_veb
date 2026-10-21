import os
from PIL import Image
import numpy as np

BRAIN_DIR = r"C:\Users\Elsan\.gemini\antigravity-ide\brain\7e8f92ae-68cc-45f8-aea8-acff43114131"
STUDIO_DIR = r"c:\Users\Elsan\Documents\clothes_veb\public\images\studio"

CAP_FRONT_RAW = os.path.join(BRAIN_DIR, "clean_white_cap_front_1792527205187.jpg")
CAP_BACK_RAW = os.path.join(BRAIN_DIR, "white_baseball_cap_back_1792526287061.jpg")

ZIP_FRONT_RAW = os.path.join(BRAIN_DIR, "white_quarter_zip_front_1792527229194.jpg")
ZIP_BACK_RAW = os.path.join(BRAIN_DIR, "white_quarter_zip_back_1792527254470.jpg")

COLORS = {
    "white": None,
    "black": (26, 26, 28),
    "sand": (215, 206, 199),
    "sky-blue": (147, 197, 253),
    "darkblue": (24, 38, 70),
    "green": (45, 68, 54),
    "red": (180, 42, 42)
}

def remove_white_bg_clean(img: Image.Image, is_cap=False) -> Image.Image:
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    rgb = arr[:, :, :3]
    h, w = arr.shape[:2]
    
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    sat = np.where(max_c > 0, (max_c - min_c) / np.maximum(max_c, 1), 0)
    
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    
    # Pure white background
    bg_mask = (lum > 244) & (sat < 0.04)
    alpha[bg_mask] = 0.0
    
    # Feather edge
    feather_mask = (lum > 232) & (lum <= 244) & (sat < 0.06)
    factor = (244.0 - lum[feather_mask]) / 12.0
    alpha[feather_mask] = np.clip(factor * 255.0, 0, 255)

    # For cap front: eliminate any floor shadow below the brim!
    # The brim ends around y = 0.82 * h. Any shadow below the brim should be cleared!
    if is_cap:
        # Clear bottom 17% of image where drop shadow rests
        clear_start_y = int(h * 0.83)
        alpha[clear_start_y:, :] = 0.0
        
        # Smooth fade 5 pixels above clear_start_y
        for y in range(int(h * 0.81), clear_start_y):
            progress = (clear_start_y - y) / (clear_start_y - int(h * 0.81))
            alpha[y, :] *= progress

    arr[:, :, 3] = alpha
    return Image.fromarray(arr.astype(np.uint8), "RGBA")

def tint_garment(base_white: Image.Image, target_rgb: tuple) -> Image.Image:
    if target_rgb is None:
        return base_white
    
    arr = np.array(base_white, dtype=np.float32)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    
    lum = (0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]) / 255.0
    tR, tG, tB = target_rgb
    
    is_dark = (tR + tG + tB) < 180
    if is_dark:
        out_r = (lum ** 1.35) * tR * 1.35
        out_g = (lum ** 1.35) * tG * 1.35
        out_b = (lum ** 1.35) * tB * 1.35
    else:
        out_r = lum * tR
        out_g = lum * tG
        out_b = lum * tB
        
    out_rgb = np.stack([out_r, out_g, out_b], axis=2)
    out_rgb = np.clip(out_rgb, 0, 255)
    
    out_arr = np.dstack([out_rgb, alpha])
    return Image.fromarray(out_arr.astype(np.uint8), "RGBA")

def process():
    cap_dir = os.path.join(STUDIO_DIR, "kepka")
    zip_dir = os.path.join(STUDIO_DIR, "yarimzamok")
    os.makedirs(cap_dir, exist_ok=True)
    os.makedirs(zip_dir, exist_ok=True)
    
    # --- CAP FRONT & BACK ---
    print("Processing new clean cap...")
    cap_f = Image.open(CAP_FRONT_RAW)
    cap_f_cut = remove_white_bg_clean(cap_f, is_cap=True)
    cap_f_cut = cap_f_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    cap_b = Image.open(CAP_BACK_RAW)
    cap_b_cut = remove_white_bg_clean(cap_b, is_cap=True)
    cap_b_cut = cap_b_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    for cname, crgb in COLORS.items():
        # Save kepka front
        tf = tint_garment(cap_f_cut, crgb)
        tf.save(os.path.join(cap_dir, f"{cname}-front-kepka.png"), "PNG")
        # Save kepka back
        tb = tint_garment(cap_b_cut, crgb)
        tb.save(os.path.join(cap_dir, f"{cname}-back-kepka.png"), "PNG")
        print(f"Saved kepka {cname}")

    # --- YARIMZAMOK (QUARTER-ZIP) FRONT & BACK ---
    print("Processing new authentic yarimzamok...")
    zip_f = Image.open(ZIP_FRONT_RAW)
    zip_f_cut = remove_white_bg_clean(zip_f, is_cap=False)
    zip_f_cut = zip_f_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    zip_b = Image.open(ZIP_BACK_RAW)
    zip_b_cut = remove_white_bg_clean(zip_b, is_cap=False)
    zip_b_cut = zip_b_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    for cname, crgb in COLORS.items():
        # Save yarimzamok front
        zf = tint_garment(zip_f_cut, crgb)
        zf.save(os.path.join(zip_dir, f"{cname}-front-yarimzamok.png"), "PNG")
        # Save yarimzamok back
        zb = tint_garment(zip_b_cut, crgb)
        zb.save(os.path.join(zip_dir, f"{cname}-back-yarimzamok.png"), "PNG")
        print(f"Saved yarimzamok {cname}")

if __name__ == "__main__":
    process()
