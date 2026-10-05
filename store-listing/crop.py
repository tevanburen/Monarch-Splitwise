# /// script
# requires-python = ">=3.13"
# dependencies = ["pillow"]
# ///
"""Crop a screenshot to the widget's border, then center it on a 640x400 canvas.

The padding uses the screenshot's background color (sampled from the top-left pixel).

Usage: uv run crop.py <input.png> [output.png]
"""

import sys
from pathlib import Path

from PIL import Image

# Widget card border color (Tailwind gray-200 on the card)
BORDER = (229, 229, 229)
# Chrome Web Store screenshot size
CANVAS = (640, 400)

src = Path(sys.argv[1])
dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_stem(f"{src.stem}-{CANVAS[0]}x{CANVAS[1]}")

im = Image.open(src).convert("RGBA")
width, height = im.size
pixels = im.load()

xs, ys = [], []
for y in range(height):
    for x in range(width):
        if pixels[x, y][:3] == BORDER:
            xs.append(x)
            ys.append(y)

if not xs:
    sys.exit(f"No border pixels {BORDER} found in {src}")

background = pixels[0, 0]
cropped = im.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
if cropped.width > CANVAS[0] or cropped.height > CANVAS[1]:
    sys.exit(f"Cropped widget {cropped.size} is larger than {CANVAS}")

# Remove the drop shadow, which only shows in the rounded corners: on each row,
# paint everything outside the outermost border pixels with the background
cropped_pixels = cropped.load()
for y in range(cropped.height):
    row = [x for x in range(cropped.width) if cropped_pixels[x, y][:3] == BORDER]
    if not row:
        continue
    for x in [*range(row[0]), *range(row[-1] + 1, cropped.width)]:
        cropped_pixels[x, y] = background

canvas = Image.new("RGBA", CANVAS, background)
canvas.paste(
    cropped,
    ((CANVAS[0] - cropped.width) // 2, (CANVAS[1] - cropped.height) // 2),
)
canvas.save(dst)
print(f"{src.name} {im.size} -> cropped {cropped.size} -> {dst.name} {CANVAS}")
