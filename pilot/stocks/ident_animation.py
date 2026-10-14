#!/usr/bin/env python3
"""Generate original Stocks animated opener and closing without AI/paid calls.

Use with an approved review MP4 that already reserves 3.6s intro and 4.5s outro.
The approved actor footage and original audio track are preserved. Do not use
as evidence of final studio realism, source rights, or creative approval.

Example:
python pilot/stocks/ident_animation.py \
  --source /private/STOCKS-R3-REVIEW-CHANNEL-PACKAGE-FINAL.mp4 \
  --logo /private/original-authorized-T-logo.png \
  --outdir /private/stocks-ident
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse
import hashlib
import json
import subprocess
import time
import numpy as np

parser = argparse.ArgumentParser(description="Render Stocks intro/outro over an approved existing review MP4.")
parser.add_argument("--source", required=True, help="Source approved R3 review MP4 with static ident segments")
parser.add_argument("--logo", required=True, help="Original licensed user-provided T symbol, PNG")
parser.add_argument("--outdir", default="./stocks-ident-output", help="Private render directory")
args = parser.parse_args()
OUTPUT = Path(args.outdir).resolve()
SOURCE = Path(args.source).resolve()
LOGO = Path(args.logo).resolve()
if not SOURCE.is_file() or not LOGO.is_file():
    parser.error("Source MP4 and logo PNG must exist. Do not request remote paid media.")
OUTPUT.mkdir(parents=True, exist_ok=True)

W, H, FPS = 1280, 720, 30
CYAN = (41, 190, 210)
WHITE = (242, 249, 253)
GOLD = (243, 192, 119)
MUTED = (170, 199, 216)
FAMILY = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
HEAVY = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
for p in ("/usr/share/fonts/truetype/opentype/inter/InterDisplay-Regular.otf",
          "/usr/share/fonts/truetype/inter/InterDisplay-Regular.otf"):
    if Path(p).exists():
        FAMILY = p
for p in ("/usr/share/fonts/truetype/opentype/inter/InterDisplay-Bold.otf",
          "/usr/share/fonts/truetype/inter/InterDisplay-Bold.otf"):
    if Path(p).exists():
        HEAVY = p


def font(size, bold=False):
    return ImageFont.truetype(HEAVY if bold else FAMILY, size)


def ease(value):
    x = max(0., min(1., value))
    return x * x * (3 - 2 * x)


def background():
    y = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    x = np.linspace(0, 1, W, dtype=np.float32)[None, :, None]
    c1 = np.array([3, 13, 27], np.float32)[None, None, :]
    c2 = np.array([10, 38, 59], np.float32)[None, None, :]
    opacity = np.broadcast_to(.15 + .75 * y + .10 * x, (H, W, 1))
    image = Image.fromarray(np.clip(c1 * (1 - opacity) + c2 * opacity, 0, 255).astype("uint8"), "RGB").convert("RGBA")
    lines = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(lines, "RGBA")
    for j in range(16):
        a = 70 + j * 90
        draw.line([(a - 400, 0), (a + 210, H)], fill=(70, 145, 177, 10), width=1)
    image.alpha_composite(lines)
    ImageDraw.Draw(image, "RGBA").line([(0, 34), (W, 34)], fill=(40, 183, 205, 85), width=2)
    ImageDraw.Draw(image, "RGBA").line([(0, 662), (W, 662)], fill=(50, 108, 140, 90), width=1)
    return image


BASE = background()
BRAND = Image.open(LOGO).convert("RGBA")


def mark(frame, center, scale):
    logo = BRAND.resize((int(51 * scale), int(62 * scale)), Image.Resampling.LANCZOS)
    frame.alpha_composite(logo, (int(center[0] - logo.width / 2), int(center[1] - logo.height / 2)))


def text(frame, xy, label, size, color=WHITE, bold=False, alpha=255):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text(xy, label, font=font(size, bold), fill=(*color, int(alpha)))
    frame.alpha_composite(layer)


def footnote(frame, label):
    draw = ImageDraw.Draw(frame, "RGBA")
    draw.rounded_rectangle((42, 642, 382, 679), radius=4,
                           fill=(9, 37, 55, 230), outline=(66, 117, 140, 130), width=1)
    text(frame, (55, 650), label, 15, MUTED, True)


def opening(t):
    frame = BASE.copy()
    draw = ImageDraw.Draw(frame, "RGBA")
    travel = (t / 3.6) * 1200
    shear = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer = ImageDraw.Draw(shear, "RGBA")
    for j in range(6):
        pos = int(travel + j * 250 - 650)
        layer.polygon([(pos, 36), (pos + 115, 36), (pos - 250, 650), (pos - 350, 650)],
                      fill=(40, 158, 192, round(14 + 6 * (j % 2))))
    frame.alpha_composite(shear)
    reveal = ease((t - .08) / .76)
    draw.rounded_rectangle((106, 230, 1175, 238), radius=3, fill=(23, 80, 113, 255))
    draw.rounded_rectangle((106, 230, 106 + int(1069 * reveal), 238), radius=3, fill=(49, 194, 209, 255))
    size = .82 + .18 * ease((t - .15) / .75)
    mark(frame, (290 - int(35 * (1 - ease((t - .12) / .7))), 340), size * 1.45)
    text(frame, (365, 268), "STOCKS", 102, WHITE, True, int(255 * ease((t - .2) / .78)))
    text(frame, (369, 393), "FINANCIAL NEWS", 29, CYAN, True, int(220 * ease((t - .8) / .45)))
    x = 210
    for label, begin in (("OIL", .95), ("BANK EARNINGS", 1.37), ("INFLATION", 1.82)):
        alpha = round(232 * ease((t - begin) / .42))
        text(frame, (x, 515), label, 22, WHITE, True, alpha)
        x += 95 if label == "OIL" else 255
        if label != "INFLATION":
            draw.line([(x - 10, 511), (x - 10, 542)], fill=(87, 163, 184, alpha), width=2)
            x += 28
    draw.rectangle((0, 714, W, H), fill=(35, 165, 191, 255))
    footnote(frame, "MONDAY 12 OCT 2026  |  EARLY SESSION  |  REPLAY")
    return frame


def closing(t):
    frame = BASE.copy()
    draw = ImageDraw.Draw(frame, "RGBA")
    shear = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer = ImageDraw.Draw(shear, "RGBA")
    for j in range(8):
        a = (t * .55 + j * .22) % 1
        x = int(W * (a - .2))
        layer.line([(x, 40), (x - 205, 649)], fill=(34, 165, 195, 24), width=4)
    frame.alpha_composite(shear)
    text(frame, (133, 134), "THANK YOU FOR WATCHING", 26, MUTED, True,
         int(255 * ease((t - .15) / .55)))
    draw.rectangle((124, 235, 124 + round(1032 * ease((t - .38) / .78)), 241), fill=(*CYAN, 255))
    mark(frame, (285, 345), 1.55)
    text(frame, (380, 277), "STOCKS", 110, WHITE, True,
         int(255 * ease((t - .45) / .5)))
    text(frame, (384, 410), "MARKETS  /  CONTEXT  /  WHAT COMES NEXT", 23, CYAN, True,
         int(235 * ease((t - 1.0) / .48)))
    text(frame, (385, 526), "THE NEXT MARKET UPDATE", 22, GOLD, True,
         int(210 * ease((t - 1.55) / .5)))
    draw.rectangle((0, 714, W, H), fill=(*CYAN, 255))
    footnote(frame, "PRE-RECORDED  |  12 OCT 2026")
    return frame


def render(name, seconds, drawing):
    frames = round(seconds * FPS)
    destination = OUTPUT / (name + ".mp4")
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
               "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{W}x{H}",
               "-framerate", str(FPS), "-i", "pipe:0",
               "-vf", "scale=1920:1080:flags=lanczos,format=yuv420p",
               "-r", str(FPS), "-an", "-c:v", "libx264", "-preset", "veryfast",
               "-crf", "18", "-movflags", "+faststart", str(destination)]
    job = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    for f in range(frames):
        frame = drawing(f / FPS)
        job.stdin.write(frame.convert("RGB").tobytes())
    job.stdin.close()
    errors = job.stderr.read().decode(errors="replace")
    if job.wait():
        raise RuntimeError("FFmpeg animation encoding failed: " + errors[-1800:])
    return destination


def probe(filename):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                             "format=duration", "-of", "json", str(filename)],
                            check=True, capture_output=True, text=True)
    return float(json.loads(result.stdout)["format"]["duration"])


if __name__ == "__main__":
    start = time.monotonic()
    opener = render("opening", 3.6, opening)
    tail = render("closing", 4.5, closing)
    source_duration = probe(SOURCE)
    begin = probe(opener)
    end = probe(tail)
    if source_duration < begin + end + 10:
        raise ValueError("Not enough actual programme between intro and closing")
    destination = OUTPUT / "STOCKS-R4-ANIMATED-IDENT-CHANNEL-REVIEW.mp4"
    timeline = (f"[0:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[i];"
                f"[1:v]trim=start={begin:.6f}:end={source_duration-end:.6f},"
                "setpts=PTS-STARTPTS,fps=30,format=yuv420p[m];"
                "[2:v]setpts=PTS-STARTPTS,fps=30,format=yuv420p[o];"
                "[i][m][o]concat=n=3:v=1:a=0[v]")
    command = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
               "-i", str(opener), "-i", str(SOURCE), "-i", str(tail),
               "-filter_complex", timeline, "-map", "[v]", "-map", "1:a:0",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
               "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "copy",
               "-movflags", "+faststart", str(destination)]
    subprocess.run(command, check=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i",
                    str(destination), "-f", "null", "-"], check=True)
    result = {
        "status": "technical_pass_creative_review_pending",
        "duration_seconds": probe(destination),
        "opening_seconds": begin, "closing_seconds": end,
        "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
        "audio_track": "copied unchanged from original programme",
        "new_provider_calls": 0,
        "creative_review_required": True,
        "studio_photorealism": "unchanged from the source MP4",
        "fully_voiced_golden_sample": False,
        "render_elapsed_seconds": round(time.monotonic() - start),
    }
    (OUTPUT / "STOCKS-R4-TECHNICAL-REPORT.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
