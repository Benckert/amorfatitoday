What the page uses, and how:

  hero.jpg      the reaching dancer. Fills the screen on `amor`.
                Mirrored (--flip:scaleX(-1)) so her reach carries
                towards the words rather than away from them.

  text-cropped.png
                the verse, in the company's own hand — the cropped
                artwork, which holds far more of the frame than the
                original did and so is readable at a glance. This is
                the one the page uses. Shown whole, like everything
                else: the crop came from you, the page adds none. It
                is black to its own edges, so it has no visible frame
                on the page's black — the words simply stand there.
                The verse also lives in the image's alt text, so screen
                readers and link previews still get it.

  text.jpg      the original, uncropped artwork. No longer used; kept
                because it is the source the cropped one came from.

  dancer.jpg    the figure alone, standing the full height of the
                screen at the outer edge of `about`, beside the verse.
                Mirrored (--flip:scaleX(-1)).

                On a phone the verse sits above her and she runs edge
                to edge below it — the one photograph on the page that
                is cropped, and the one place object-fit appears. See
                below. The soft edge there runs from the FOOT of the
                frame, not the top: her head is at the top, and a fade
                over it reads as a cut-off head even when nothing is
                cropped at all. It doubles as the blend behind the
                links along the bottom.

  artists.jpeg  candlelight. Fills the screen on `artists`, with the
                names over the dark of its left side.

EVERY PHOTOGRAPH IS SHOWN WHOLE, WITH ONE EXCEPTION.

The exception is dancer.jpg on a phone, where she runs the full width
of the screen: a 2:3 photograph that wide is taller than the room left
under the verse, so object-fit:cover crops her, and object-position
pins the top of the frame so it is her legs that go and never her
head. Roughly three-quarters of the photograph survives on a normal
phone. That is the only object-fit and the only object-position in the
stylesheet, both inside the narrow-screen block.

Everywhere else there is neither. Each image is given max-width:100%
and max-height:100% with its width and height left auto, so it takes
the largest size that fits the screen at its own aspect ratio and no
pixel of any file is cut off.

That is also what lets a section fill the screen without cropping. A
2:3 photograph inside a landscape viewport is limited by its HEIGHT, so
it stands the full height of the screen and the black either side of it
is the page's own. A phone is narrower than these photographs are tall,
so there the same rule limits by width instead and the picture is
letterboxed above and below. Where there is not room, a photograph
becomes smaller — it never becomes a crop.

Two of the three limits are worth knowing about: the box has to have a
resolvable height for max-height:100% to mean anything (see the note on
the figure beside the verse in README.md), and a grid track will not
give it one.

The files here are the originals as delivered: not recompressed, not
resized, not retouched. hero.jpg and artists.jpeg still carry their
camera EXIF.

--flip is the one edit the design makes, and it is a layout decision
rather than a change to the picture: scaleX(-1) mirrors an image, none
leaves it alone. It lives in the stylesheet, NOT as an inline style on
the element — an inline style outranks a stylesheet and would silently
beat the narrow-screen rules. Two lines set it, one for hero.jpg and
one for dancer.jpg; delete a line and that photograph faces the way
its file does.

Sizes, for reference:

  hero.jpg      720 x 1080   (2:3)
  artists.jpeg  720 x 1080   (2:3)
  dancer.jpg    719 x 1079   (2:3)
  text.jpg     1186 x 1186   (square)

If you replace one, nothing needs adjusting: the layout reads the
aspect ratio from the file. Keep the width/height attributes on the
<img> in step with the new file so the page does not shift as it loads.
