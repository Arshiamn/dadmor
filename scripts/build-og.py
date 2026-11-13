#!/usr/bin/env python3
"""Regenerate og.png for v5 from the NEON FIELD lion.
Replaces the stale light-theme og (v2/v3, near-white background).
1200x630, night #0B0A14, neon v2 lion (violet + green eyes), dadmor wordmark
+ EN tagline. Deterministic (seeded dot texture)."""
import os
import random
import re
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.expanduser("~/workspace/dadmor")
NEON = os.path.join(BASE, "neon-identity/lion-neon-v2-icon.svg")
OUT = os.path.expanduser("~/workspace/dadmor/v5/public/og.png")

NIGHT = (11, 10, 20)
INK = (240, 239, 247)
VIOLET = (140, 128, 255)
LIVE = (0, 230, 118)
MUTED = (176, 174, 198)


def parse(svg_path):
    s = open(svg_path).read()
    vb = [float(x) for x in re.search(r'viewBox="([\d. ]+)"', s).group(1).split()]
    circles = [(float(x), float(y), float(r)) for x, y, r in
               re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/>', s)]
    face = []
    for d, fill in re.findall(r'<path d="([^"]+)"(?: fill="([^"]+)")? fill-rule="nonzero"/>', s):
        fill = fill or "#8c80ff"
        for sub in re.split(r'(?<=Z)\s+(?=M)', d.strip()):
            pts = re.findall(r'[ML]\s*([\d.]+)\s+([\d.]+)', sub)
            face.append(([(float(x), float(y)) for x, y in pts], fill))
    return vb, circles, face


def draw_lion(size):
    vb, circles, face = parse(NEON)
    x0, y0, w, h = vb
    sc = size[0] / w
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)

    def T(p):
        return ((p[0] - x0) * sc, (p[1] - y0) * sc)

    for poly, fill in face:
        dr.polygon([T(p) for p in poly], fill=fill)
    for cx, cy, r in circles:
        x, y = T((cx, cy))
        rr = r * sc
        dr.ellipse([x - rr, y - rr, x + rr, y + rr], fill="#8c80ff")
    return img


W, H = 1200, 630
img = Image.new("RGB", (W, H), NIGHT)
dr = ImageDraw.Draw(img, "RGBA")

# faint dot-field texture (seeded, deterministic)
rnd = random.Random(1405)
for _ in range(260):
    x = rnd.uniform(0, W)
    y = rnd.uniform(0, H)
    r = rnd.uniform(0.8, 2.6)
    a = rnd.randint(18, 55)
    col = LIVE if rnd.random() < 0.05 else VIOLET
    dr.ellipse([x - r, y - r, x + r, y + r], fill=col + (a,))

# lion, left
lion_h = 520
lion_w = int(lion_h * 312 / 356)
lion = draw_lion((lion_w, lion_h))
img.paste(lion, (80, (H - lion_h) // 2), lion)

# wordmark + tagline, right
try:
    big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 96)
    tag = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
except Exception:
    big = tag = small = ImageFont.load_default()
tx = 600
dr.text((tx, 225), "dadmor", fill=VIOLET, font=big)
dr.text((tx, 345), "A structure that lasts.", fill=INK, font=tag)
# live-signal dot + mono-ish label
dr.ellipse([tx, 425, tx + 12, 437], fill=LIVE)
dr.text((tx + 22, 415), "D3 · VERIFIED AND HANDED OVER", fill=MUTED, font=small)

img.save(OUT)
print("saved", OUT, img.size, os.path.getsize(OUT), "bytes")
