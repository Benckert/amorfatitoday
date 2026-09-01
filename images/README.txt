What the page uses, and how:

  hero.jpg      the reaching dancer. The opening section, and again in
                the closing one — the same photograph, the same size,
                on the same side, so the page ends where it began.
                Mirrored (--flip:scaleX(-1)) so her reach carries
                towards the words rather than away from them.

  text.jpg      the verse, in the company's own hand. Shown whole. It
                is black to its own edges, so it has no visible frame
                on the page's black — the words simply stand there.
                The verse also lives in the image's alt text, so screen
                readers and link previews still get it.

  dancer.jpg    the figure alone, beside the verse. Mirrored, so she
                turns towards the words.

  artists.jpeg  candlelight. The artists section — the one panel that
                holds its photograph on the left.

EVERY PHOTOGRAPH IS SHOWN WHOLE.

There is no object-fit in the stylesheet and no object-position: each
image is given its own aspect ratio inside a box it may not exceed
(max-width:100%, max-height:var(--shot)), so no pixel of any file is
ever cut off. Where there is not room, the photograph becomes smaller —
it never becomes a crop. On a phone --shot drops from 74svh to 44svh
for exactly that reason.

The files here are the originals as delivered: not recompressed, not
resized, not retouched. hero.jpg and artists.jpeg still carry their
camera EXIF.

--flip is the one edit the design makes, and it is a layout decision
rather than a change to the picture: scaleX(-1) mirrors an image, none
leaves it alone. It lives in the stylesheet next to the .shot img rule,
NOT as an inline style on the element — an inline style outranks a
stylesheet and would silently beat the narrow-screen rules. Three lines
set it; delete one and that photograph faces the way the file does.

Sizes, for reference:

  hero.jpg      720 x 1080   (2:3)
  artists.jpeg  720 x 1080   (2:3)
  dancer.jpg    719 x 1079   (2:3)
  text.jpg     1186 x 1186   (square)

If you replace one, nothing needs adjusting: the layout reads the
aspect ratio from the file. Keep the width/height attributes on the
<img> in step with the new file so the page does not shift as it loads.
