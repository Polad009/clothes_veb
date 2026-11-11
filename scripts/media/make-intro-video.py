"""Horwalle intro: our own cut + grade of licensed Pexels clips.
usage: python edit.py <scratchpad> <out_dir>
"""
import os, subprocess, sys

T, OUT = sys.argv[1], sys.argv[2]
FF = os.path.join(T, "tools", "node_modules", "ffmpeg-static", "ffmpeg.exe")
R = os.path.join(T, "pexels_raw")
A = os.path.join(R, "8128354-hd_1080_1920_25fps.mp4")   # dark close-up, black hoodie
B = os.path.join(R, "6322410-hd_1080_2048_30fps.mp4")   # hoodie, textured wall
C = os.path.join(R, "6322407-hd_1080_2048_30fps.mp4")   # hoodie, light wall
D = os.path.join(R, "10378651-hd_1080_2048_25fps.mp4")  # night bridge, hood up

# one look for every shot: nearly monochrome, deeper blacks, soft vignette (site palette: black + bone)
GRADE = ("eq=saturation=0.16:contrast=1.14:brightness=-0.035:gamma=0.96,"
         "curves=all='0/0 0.14/0.07 0.5/0.47 0.86/0.86 1/0.96',"
         "colorbalance=rh=0.025:bh=-0.02,"
         "vignette=angle=PI/5")

ENC = ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "slow",
       "-movflags", "+faststart", "-an", "-r", "25"]


def run(args):
    print(" ".join(os.path.basename(a) if os.sep in a else a for a in args[:6]), "...")
    subprocess.run([FF, "-v", "error", "-y", *args], check=True)


def seg(idx, start, dur, w, h, y_bias=0.5):
    """trim -> 25 fps -> scale to width -> crop to w x h (vertical position y_bias) -> grade"""
    return (f"[{idx}:v]trim=start={start}:duration={dur},setpts=PTS-STARTPTS,fps=25,"
            f"scale={w}:-2,crop={w}:{h}:0:(ih-{h})*{y_bias},{GRADE},format=yuv420p,settb=AVTB")


os.makedirs(OUT, exist_ok=True)

# ── phone: 720x1280, four shots with crossfades ────────────────────────────────
shots = [(A, 0.0, 3.2, 0.5), (D, 2.6, 3.4, 0.35), (B, 2.2, 3.4, 0.3), (C, 3.0, 3.4, 0.3)]
X = 0.6
parts, inputs = [], []
for i, (src, st, du, yb) in enumerate(shots):
    inputs += ["-i", src]
    parts.append(seg(i, st, du, 720, 1280, yb) + f"[s{i}]")
length = shots[0][2]
chain, prev = [], "s0"
for i in range(1, len(shots)):
    off = round(length - X, 3)
    chain.append(f"[{prev}][s{i}]xfade=transition=fade:duration={X}:offset={off}[x{i}]")
    prev = f"x{i}"
    length = length + shots[i][2] - X
total = round(length, 3)
fc = ";".join(parts + chain) + f";[{prev}]fade=t=in:st=0:d=0.5,fade=t=out:st={total-0.6}:d=0.6[v]"
mobile = os.path.join(OUT, "horwalle-intro-mobile.mp4")
run([*inputs, "-filter_complex", fc, "-map", "[v]", *ENC, "-crf", "27", "-maxrate", "1600k", "-bufsize", "3200k", mobile])

# ── computer: 1920x1080 triptych (three 640x1080 columns) ──────────────────────
DUR = 10.0
fc2 = ";".join([
    seg(0, 1.5, DUR, 640, 1080, 0.25) + "[l]",
    # the dark close-up is short: play it forward then backward so it never jumps
    f"[1:v]trim=start=0:duration=5.6,setpts=PTS-STARTPTS,fps=25,scale=640:-2,crop=640:1080:0:(ih-1080)*0.3,{GRADE},format=yuv420p,split[af][ab]",
    "[ab]reverse[ar]",
    "[af][ar]concat=n=2:v=1,trim=duration=10,setpts=PTS-STARTPTS,settb=AVTB[m]",
    seg(2, 1.5, DUR, 640, 1080, 0.3) + "[r]",
    "[l][m][r]hstack=inputs=3,"
    "drawbox=x=639:y=0:w=2:h=ih:color=0x0A0A0A@1:t=fill,drawbox=x=1279:y=0:w=2:h=ih:color=0x0A0A0A@1:t=fill,"
    f"fade=t=in:st=0:d=0.5,fade=t=out:st={DUR-0.6}:d=0.6[v]",
])
desktop = os.path.join(OUT, "horwalle-intro-desktop.mp4")
run(["-i", B, "-i", A, "-i", D, "-filter_complex", fc2, "-map", "[v]", *ENC, "-crf", "28", "-maxrate", "3000k", "-bufsize", "6000k", desktop])

# ── posters: a frame after the fade-in ─────────────────────────────────────────
for name in ("mobile", "desktop"):
    run(["-ss", "0.8", "-i", os.path.join(OUT, f"horwalle-intro-{name}.mp4"), "-frames:v", "1", "-q:v", "4",
         os.path.join(OUT, f"horwalle-intro-{name}.jpg")])

for f in sorted(os.listdir(OUT)):
    print(f"{f}: {os.path.getsize(os.path.join(OUT, f)) / 1024:.0f} KB")
print("phone length:", total, "s")
