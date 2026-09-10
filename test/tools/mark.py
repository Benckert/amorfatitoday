"""Where the favicon's path came from.

The mark is the page's own hand: the lowercase 'a' of Tangerine 700,
the face the verse on `about` is set in. A favicon cannot be `<text>` —
an SVG used as an icon is rendered with no access to a webfont, so it
would come out in whatever serif the browser reaches for — so the glyph
is carried as an outline instead, which is also what makes the mark
independent of the font file ever changing.

This prints that outline, fitted to the 32-unit box the <link rel=icon>
data URI uses: y flipped, centred on the glyph's own bounding box, and
scaled so the letter is WIDTH_FRACTION of the box wide.

    pip install fonttools brotli          # brotli is what reads woff2
    python3 tools/mark.py [width-fraction]

Paste the path into the data URI in index.html. Re-run it if the face,
the letter or the fraction ever change; nothing reads it at runtime.
"""
import sys
from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONT = "fonts/tangerine-700-latin.woff2"
LETTER = "a"
BOX = 32.0
# .60 of the box: the letter is wide for its height, and past this it
# crowds the corners the way iOS rounds an apple-touch-icon.
WIDTH_FRACTION = float(sys.argv[1]) if len(sys.argv) > 1 else 0.60

font = TTFont(FONT)
glyphs = font.getGlyphSet()
name = font.getBestCmap()[ord(LETTER)]

bounds = BoundsPen(glyphs)
glyphs[name].draw(bounds)
x0, y0, x1, y1 = bounds.bounds
w, h = x1 - x0, y1 - y0

scale = (BOX * WIDTH_FRACTION) / w
tx = (BOX - w * scale) / 2 - x0 * scale
ty = (BOX + h * scale) / 2 + y0 * scale     # +y is up in a font, down in SVG

pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
glyphs[name].draw(TransformPen(pen, Transform(scale, 0, 0, -scale, tx, ty)))

print(f"/* '{LETTER}' of {FONT}, {w * scale:.2f} x {h * scale:.2f} "
      f"in a {BOX:.0f} box */")
print(pen.getCommands())
