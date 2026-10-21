import os
from PIL import Image, ImageOps, ImageEnhance
import numpy as np

BRAIN_DIR = r"C:\Users\Elsan\.gemini\antigravity-ide\brain\7e8f92ae-68cc-45f8-aea8-acff43114131"
STUDIO_DIR = r"c:\Users\Elsan\Documents\clothes_veb\public\images\studio"

CAP_FRONT_RAW = os.path.join(BRAIN_DIR, "white_baseball_cap_front_1792526265831.jpg")
CAP_BACK_RAW = os.path.join(BRAIN_DIR, "white_baseball_cap_back_1792526287061.jpg")
PANTS_FRONT_RAW = os.path.join(BRAIN_DIR, "white_sweatpants_front_1792526304789.jpg")
PANTS_BACK_RAW = os.path.join(BRAIN_DIR, "white_sweatpants_back_1792526326438.jpg")

COLORS = {
    "white": None,
    "black": (26, 26, 28),
    "sand": (215, 206, 199),
    "sky-blue": (147, 197, 253),
    "darkblue": (24, 38, 70),
    "green": (45, 68, 54),
    "red": (180, 42, 42)
}

def remove_white_bg(img: Image.Image, threshold=245, feather=10) -> Image.Image:
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    rgb = arr[:, :, :3]
    
    # Distance from white (255, 255, 255)
    dist = np.sqrt(np.sum((255.0 - rgb) ** 2, axis=2))
    
    # Background has very small distance from white
    # threshold dist: pure white = 0
    # Let's check brightness
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    
    # Border sampling for background flood/distance
    # In studio shots on white, background is lum > 240 and saturation < 0.05
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    sat = np.where(max_c > 0, (max_c - min_c) / np.maximum(max_c, 1), 0)
    
    alpha = np.ones((img.height, img.width), dtype=np.float32) * 255.0
    
    # Background mask: near-white and low saturation
    bg_mask = (lum > 246) & (sat < 0.04)
    alpha[bg_mask] = 0.0
    
    # Feather boundary
    transition = (lum > 235) & (lum <= 246) & (sat < 0.06)
    factor = (246.0 - lum[transition]) / 11.0
    alpha[transition] = np.clip(factor * 255.0, 0, 255)
    
    # Also clean corners
    arr[:, :, 3] = alpha
    result = Image.fromarray(arr.astype(np.uint8), "RGBA")
    return result

def tint_garment(base_white: Image.Image, target_rgb: tuple) -> Image.Image:
    if target_rgb is None:
        return base_white
    
    arr = np.array(base_white, dtype=np.float32)
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3]
    
    lum = (0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]) / 255.0
    
    tR, tG, tB = target_rgb
    
    # For black / dark colors, we multiply brightness
    is_dark = (tR + tG + tB) < 180
    
    if is_dark:
        # Scale luminance so white becomes target_rgb and shadows get deeper
        out_r = (lum ** 1.3) * tR * 1.35
        out_g = (lum ** 1.3) * tG * 1.35
        out_b = (lum ** 1.3) * tB * 1.35
    else:
        # For sand / sky-blue / red
        out_r = lum * tR
        out_g = lum * tG
        out_b = lum * tB
    
    out_rgb = np.stack([out_r, out_g, out_b], axis=2)
    out_rgb = np.clip(out_rgb, 0, 255)
    
    out_arr = np.dstack([out_rgb, alpha])
    return Image.fromarray(out_arr.astype(np.uint8), "RGBA")

def process():
    cap_dir = os.path.join(STUDIO_DIR, "kepka")
    salvar_dir = os.path.join(STUDIO_DIR, "salvar")
    os.makedirs(cap_dir, exist_ok=True)
    os.makedirs(salvar_dir, exist_ok=True)
    
    # 1. Cap Front
    print("Processing cap front...")
    cap_f = Image.open(CAP_FRONT_RAW)
    cap_f_cut = remove_white_bg(cap_f)
    cap_f_cut = cap_f_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    # 2. Cap Back
    print("Processing cap back...")
    cap_b = Image.open(CAP_BACK_RAW)
    cap_b_cut = remove_white_bg(cap_b)
    cap_b_cut = cap_b_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    for cname, crgb in COLORS.items():
        # Kepka front
        tinted_f = tint_garment(cap_f_cut, crgb)
        tinted_f.save(os.path.join(cap_dir, f"{cname}-front-kepka.png"), "PNG")
        # Kepka back
        tinted_b = tint_garment(cap_b_cut, crgb)
        tinted_b.save(os.path.join(cap_dir, f"{cname}-back-kepka.png"), "PNG")
        print(f"Saved kepka {cname}")

    # 3. Pants Front
    print("Processing pants front...")
    pants_f = Image.open(PANTS_FRONT_RAW)
    pants_f_cut = remove_white_bg(pants_f)
    pants_f_cut = pants_f_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    # 4. Pants Back
    print("Processing pants back...")
    pants_b = Image.open(PANTS_BACK_RAW)
    pants_b_cut = remove_white_bg(pants_b)
    pants_b_cut = pants_b_cut.resize((700, 700), Image.Resampling.LANCZOS)
    
    for cname, crgb in COLORS.items():
        # Pants front
        tinted_f = tint_garment(pants_f_cut, crgb)
        tinted_f.save(os.path.join(salvar_dir, f"{cname}-front-salvar.png"), "PNG")
        # Pants back
        tinted_b = tint_garment(pants_b_cut, crgb)
        tinted_b.save(os.path.join(salvar_dir, f"{cname}-back-salvar.png"), "PNG")
        print(f"Saved salvar {cname}")

if __name__ == "__main__":
    process()
