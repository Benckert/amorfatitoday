# amor fati — Vallerie with Company

A single self-contained `index.html`. No build step, no dependencies —
open it in a browser, or drop the folder on any host.

One page, three sections — **amor**, **about**, **artists** — each one
exactly one screen tall, plus a **Tickets** button that leaves the site.

## Editing it

Nothing in the page is a placeholder any more. The ticket button in
`<nav class="jump">` points at the Billetto listing (the `bref` query
parameter is Billetto's own referral tag, supplied with the link — it
is not tracking added here). The title, the subtitle, the date, the
venue, the headline, the verse and all fourteen artists are set.

The venue sits under the date on the landing, as a link to the map
Google itself shares (its `g_st` parameter is Google's, part of that
link, not tracking added here). There is no price section and no social
links: those live on the ticket page, which is where anyone reading
them is going anyway.

Each credit is a name and a role — `<span class="n">` and
`<span class="r">` with an em dash between them. To add one, write the
row, run `scratchpad/widths2.js`, and put it where that says: the order
is by rendered width, and the script prints the list sorted so the
placement is read off rather than guessed.

## What the design holds to

**Every section is exactly one screen, and photographs are shown
whole** — with one deliberate exception, below. Those two are usually a
trade, and the way out is that a 2:3 photograph in a landscape viewport
is limited by *height*: it stands the full height of the screen at its
own proportions, with the page's black either side, and the section is
filled without the picture being cut. `max-width` and `max-height`
together, with `width` and `height` left `auto`, do the whole job. On a
phone the screen is narrower than the photograph is tall, so the same
one rule limits it by width instead and it is letterboxed rather than
cropped. The files in `images/` are the originals, untouched and
unre-encoded.

**The exception: the figure on `about`, on a phone only.** There she
runs edge to edge, and a 2:3 photograph at the full width of a phone is
taller than the room left under the verse — so something has to go.
`object-fit:cover` with `object-position:50% 0%` pins the top of the
frame, so what goes is the floor and her legs, never her head. She runs to the very
bottom of the screen and under the links, whose backdrop is the foot of
the photograph rather than flat black. About 87% of the photograph
survives on a typical phone, 71% on a short 360x640 one. This is the only `object-fit` in the stylesheet, it
is inside the narrow-screen block, and deleting that one rule returns
her to being whole with black either side.

That crop has to be *asked for* rather than allowed to happen. `#about`
centres its items, which leaves the figure's box sized by its content
instead of by its row; with no definite height, `height:100%` on the
image resolves to `auto`, the image lays out at its natural ratio, and
the panel's `overflow:hidden` quietly clips whatever hangs past the
bottom. The crop then happens by accident, off-screen, and moves with
every screen size — it measured 9px on one phone and 48px on another.
`align-self:stretch` on that box is what makes it exactly its row, so
the crop is the one the stylesheet describes.

The one edit the design makes to a photograph is mirroring, and it is
made for the layout rather than to the picture: it turns each figure's
reach towards the words instead of away from them. Three `--flip` lines
in the stylesheet do it, and deleting one undoes it.

**The landing sits off the foot of the frame**, not on it — the title
lands around three-fifths of the way down, and the space beneath it is
what makes the photograph read as a room rather than a backdrop. The
hero is unmirrored there, so her reach opens rightward across the
frame.

**One frame.** Every section insets its words by the same `--inset` —
the gutter on a narrow screen, half the slack beside `--measure` on a
wide one — so the first letter of every section lands on the same
vertical line at any width. Measured at 1440px: 160px on all three.

**The roster is ordered by how wide each credit is set, not by how many
letters it has.** The whole row counts, name and role together, and it
is measured in a browser at the real tracking: "Amina Avdić" is the
same eleven characters as "Yazz Meavis" but sets wider, and "Eliot
Charoff" sets narrower than "Lova Hellberg" though both are thirteen.
Counted rather than measured, several sit in the wrong place and the
ramp has kinks in it.

**No credit wraps, at any size, and the way that is held is that the
type is sized from its COLUMN rather than from the viewport.**
`.who-company` is a container and `.roster li` is
`clamp(.6rem, 4.05cqw, .92rem)` — the coefficient is 100 divided by the
23.9em the longest credit sets in, so that credit lands just inside its
column everywhere and every other one lands short. A vw curve cannot do
this: the column is what is left over after a photograph sized by the
screen's *height*, so at 1440x900 it is 311px and at 1920x1080 it is
478px, and no function of the width alone knows that. The same
coefficient is used in all three layouts; only the floor and the
ceiling change.

Three things bought the width that made it possible. The role is set at
.84 of the name with .08em of tracking against the name's .14em — which
also says which half is which, so the mist no longer has to carry that
alone. The dash is an en rather than an em, half the width for the same
mark. And it carries its own margins instead of sitting between two
word spaces. The space after it stays, because it is the one place the
row could break if a name ever outgrew this, and it is pulled back to
nothing with a -.09em margin so the dash sits .30em from the name and
.30em from the role rather than noticeably nearer the name.

**The dash is levelled with the capitals, and the number is measured.**
A dash is drawn to cut lowercase, so in a row set in capitals it sits
low: the ink of a capital runs 0 to .625em above the baseline, mid
.3125em, while the en dash runs .17 to .21em, mid .19em. The role is
set at .84, so the middle of its capitals is .2625em. `top:-.098em`
levels the dash with the mean of the two. `scratchpad/dash.js` measures
it off the painted glyphs — a canvas, not the line boxes, which say
nothing about where a glyph actually is — and `scratchpad/gaps.js`
checks the two gaps either side.

Vallerie is outside
that order — she leads, so she is set apart above it in gold rather
than made loud within it, a step larger than the rest, and centred on
the rule beneath her so the name and its horizon share a mid-point. The
company is set in from her by an em or two, so the list reads as hers. The mark beneath her is a hairline drawn the
width of the names that arrives out of nothing and leaves into
nothing; it was a short gold stub anchored to the left, which read as
an underline someone had cut off.

**`about` and `artists` are literally the same layout.** Both carry
the class `.split`, and one rule set positions both: the words in a
column at the frame's left edge, the photograph standing the full
height of the screen at the right, filling the half the words do not.
They cannot drift apart, because there is nothing to drift.

`artists` no longer uses that two-part shape at all. It is three
columns — her name on the left, the company on the right, the
photograph centred between them — because that picture is a room with
someone in the middle of it, and pushed to either edge it loses the
room. Its side columns take the `--gutter` rather than the 1120px
measure: at the measure there is not enough width left beside a 600px
figure to set a name in. On a phone it stacks like `about` does, words
before picture, which is why both text columns come first in the
markup. It still shares `.split` for the narrow-screen behaviour.

That shape has one hazard, and `artists` hit it. A whole 2:3 photograph
standing the full height of a 1440x900 screen is 600px wide and no
wider — so if the words do not reach across their own half, the middle
of the frame is simply empty. At the first attempt the longest name
ended at x=490 and the photograph began at x=840: a 350px hole down
the centre, a quarter of the frame. The fix is not to move anything but
to set the names large enough to occupy the column they were given —
they run about 50% larger now, which closes it to ~200px and reads as
a margin. The same arithmetic applies to any section put in this
layout: give it words wide enough for its half, or it will hollow out
in the middle.
Each section only says where its own subject sits in its frame, through
`--focus`: the top on `about` so a phone crop takes her legs and never
her head, just below centre on `artists` where the candle is.

On a phone both stack the same way too — words first, photograph
running full-bleed beneath them to the foot of the screen and under the
links. The words come first in the markup for that reason: stacked in
source order, a photograph placed first pushes ten names off a phone
screen, which is exactly what happened before they were reordered.

**The link rail is fixed to the viewport**, not stamped into each
section. It used to be one `<template>` cloned into all three panels so
the copies could not drift apart; one element that never moves cannot
drift either, and the links stay put while the deck moves behind them
instead of riding up and down with whatever section is passing. A gradient
under it keeps it off the photographs.

**One thing in that rail is not navigation, and it is shaped
differently.** The ticket button leaves the site, so it is the only
enclosed, warm, gold-edged thing there, set apart from the three
section links with real space and carrying the arrow that means "away
from here". It is never marked as the
current section: the script that marks where you are only ever touches
`a.to`.

**The navigation is identical everywhere, by construction.** There is
one row of section links, fixed to the foot of the viewport, so there
are no copies to drift apart. The section you are in is named in gold
rather than hidden. The dots on the right are the same three places,
and both are driven from the deck's index.

**The opening plays once a visit.** The title arrives letter by letter
and the blocks under it rise, and that is remembered in `sessionStorage`.
Any later load in the same tab is simply already in place — the class is
set before the first paint, so nothing flickers into position. A fresh
visit tomorrow plays it again.

### The palette

Two families, both taken from the photographs rather than chosen for
them. The lit parts of every image measure 33-42° hue at 0.28-0.67
saturation — candlelight — and `--gold` sits at 39°, the same light,
with `--paper` the same hue much lighter. Everything that glows is that
same candlelight. Nothing on the page is more saturated than 0.67, which
is the saturation of the photographs themselves. If you add a colour,
that is the ceiling to stay under.

### The lettering

One family, in two cuts. **Alegreya Sans SC** sets the display in real
small capitals; **Alegreya Sans**, the same design without them,
carries every other line — so nothing on the page speaks in a different
voice. Both are humanist, so the letterforms keep a little of the hand
in them rather than being drawn with a compass, which is where the
warmth at this size comes from.

Alegreya Sans SC is a small-caps **family**, not a font with an `smcp`
feature: its lowercase glyphs *are* the small capitals. So the title is
written `Amor Fati` in the markup and left alone — no
`text-transform`, because uppercasing it would throw the small caps
away and hand back plain capitals. If you edit that text, keep the
capitalisation you want to see.

Both are **self-hosted**, in `fonts/` — 192K, six files. Nothing is fetched from Google,
so the page does not depend on a third party being up, no visitor's
request for it reaches one, and the display face is there on the first
paint rather than a beat later. Only the latin and latin-ext subsets are
included — latin-ext is not optional, it carries the Ć in Amina Avdić's
name, and every candidate face was checked for that glyph (`fontTools`,
`cmap`, U+0106) before being considered. To change a face: drop the `.woff2` files in `fonts/`,
edit the `@font-face` blocks at the top of the stylesheet, and set
`--display` or `--micro`.

The one hand-lettered thing on the page is the verse, and that is the
company's own artwork rather than a font. An earlier build set "Vallerie
with Company" in a script face chosen to approximate that hand; it has
been dropped, because an approximation of the lettering one section away
from the lettering itself is a near-miss you cannot un-see.

Tracked capitals add their spacing to the right of the last letter too,
which shifts the line off-centre. Every tracked line here carries a
`text-indent` equal to its `letter-spacing`, which puts it back.

## Sound

Optional, off by default — see `audio/README.txt`. If the file isn't
there the toggle hides itself and the page is simply silent.

## Publishing

Any static host works:

- **Netlify Drop** — drag this folder onto <https://app.netlify.com/drop>.
- **Vercel** — `npx vercel` in this folder.
- **GitHub Pages** — push, then Settings → Pages → deploy from this branch.

## House rules

**No emoji anywhere on this page** — not in the markup, not in the
favicon, not as a bullet or an arrow. The arrow on the ticket button is
an inline SVG for exactly this reason: written as the character `↗`
(U+2197) it has emoji presentation on iOS and Android, and the system
substitutes a colour emoji font, which put a blue emoji in the middle
of the button. Any glyph in U+2190–21FF, U+2600–27BF or U+2B00–2BFF is
liable to the same thing. Draw it, or pick a character with no emoji
presentation.

## The type

**Three faces, each with one job.** Cormorant Garamond carries the
page — roman 400 for text, italic 300 for exactly one thing, her name.
Jost 300 sets the title and nothing else. Allura sets the verse on
`about`. All self-hosted in `fonts/`, latin and latin-ext.

**The title is a geometric sans against a page of serif, on purpose.**
Jost is drawn with a compass where everything else is drawn with a pen,
and one word set against the grain reads as a mark rather than as more
text. Full capitals, tracked to .24em; `lowercase` is the other reading
and the letterforms take it — a one-word change on `.title`.

**The verse is set, not photographed.** It was `images/text-cropped.png`,
a 1001x854 scan of the verse in Vallerie's hand: soft at any size the
layout wanted, and invisible to anything that reads a page. Allura was
chosen by holding nine scripts against that scan — its letterforms are
the ones that match, round and barely slanted and evenly stroked, where
Herr Von Muellerhoff leans much further and Cedarville Cursive is a
school hand rather than a formal one. Sized against both axes,
`min(vw, svh)`, so it keeps its proportion to the column without a
short screen pushing it past the foot of the panel. Checked at 15 sizes
from 320x568 to 1920x1080 for spill, and for collision with the rail
and the figure.

**Every change of case or family on the title moves its size with it.**
Small capitals stand about three quarters the height of full ones, so
the same nominal size reads a third smaller: going from Cormorant small
caps to Jost capitals meant `clamp(2.7rem,11.5vw,8rem)` down to
`clamp(2.1rem,8.4vw,5.6rem)`, and the narrow setting from 12.6vw to
8.6vw. One line at every width from 320px up. Change the case again and
re-measure rather than keeping the numbers.

**Her name is set in the same cream as every other one.** What sets
her apart is where she is and how she is set — her own column on a wide
screen, larger, the one italic on the page, a horizon under the name —
rather than a colour the rest of the list does not get. On a phone,
where she is set exactly like the roster, it is her place above "with
company" that says it.

**On a phone her name is set exactly like the rest of the roster** —
same size, tracking and capitals, upright rather than italic. At nearly twice the size and leaning,
it was a second thing happening in a column with room for one. Her role
follows the same rule: its own line under the name on a wide screen,
where the column has the room; back on the line behind a dash on a
phone, set like every other credit — including the step down to .84
that the roster's roles take. Left to inherit the name's own size it
read as a second name rather than as a role — and it is the roster's own dash
element under the roster's own rule, not a second one built out of
`::before`. Built separately, hers came out tight against her role
while every other row had air on both sides of it.

**The horizon draws between her name and her role, not under the pair.**
It is a background image on the role — `background-size:100% 1px` at
the top — rather than a pseudo-element, because `::before` on that box
is the dash the narrow setting puts back on the line, and one box
cannot have two of either. It comes out the width of her name without
being told to: the role is a block inside a span shrink-wrapped to its
widest line, and a single word set this small is never that.

It sits close under the name and well clear of the role — 20px above,
31px below — so it reads as belonging to the name and dividing the role
off from it. The two CSS numbers are nothing like the two gaps: the
italic line above ends at its baseline and carries about 16px of its
own descender space below that, so 4px of margin makes the 20px gap
while 27px of padding makes the 31px one. That is why they are measured
off the pixels rather than set by eye — `scratchpad/lead.js` hides the
photograph, flattens the reveal, and scans the ink bands.

**On a phone, the air either side of "with company" is equal**, and
equal between the *ink*, not between the boxes. Setting the two box
gaps the same leaves the eye with unequal ones: the name above is set
larger and carries more space under its baseline than that line does,
a bias that measures 3-4px on every screen. So the row gap and the
credit's own top padding are held as `--row-gap` and `--row-pad` on
`#artists`, the label's margin is built from both plus the bias, and
the two cannot drift apart when either changes. Scanned at 320x568,
375x704, 390x844, 768x1024 and 820x1180: equal within a pixel at all
five.

**`.lead-name > span`, and the child combinator is load-bearing.** Her
role is a span inside the span the horizon is drawn on, so a bare
`.lead-name span` matched it too and gave it its own rule — the name
came out with two hairlines under it, one under the block and one under
the word. Nothing that measures position or size can see that, which is
why `scratchpad/credits.js` counts the elements under `.lead-name` with
a painted `::after` and requires at most one.

**A tablet is not a large phone.** The stacked layout now reaches from
a 320px phone to a 1240px tablet, and everything in it was sized for
the small end: a flat `--gutter:1.4rem` and credits that stayed at
12.8px on a 768px screen, which was the whole list whispering. The
credits' ceiling rises with the width (`clamp(.8rem, 1.4vw + .35rem,
1.15rem)`) while the floor does not, so a phone is untouched and an
iPad sets its names at 16.4px, an iPad Air at 17.1 and a landscape iPad
at 18.4. The row's air comes from `svh` and was capped at `.46rem`,
which any tall screen hit at once; the cap is raised so it can breathe.
The gutter grows with the width and stops.

**The stacked layout starts at 1240px, not 820.** Sized from their
column, the credits hold three columns wherever that column can carry
the type at a size worth reading. The floor is where it cannot: at
1152x864 — four by three, where a photograph sized by the screen's
*height* takes half its width — the side column is 200px against the
229px the longest credit needs even at the smallest size the clamp
allows. Below 1240 the section stacks, and at the full width of the
screen the credits set at their largest. The threshold is measured, not
a device: it is the width at which a column stops being able to hold a
name and a role on one line.

**`about` had to be backed out of the stacked layout on a sideways
phone, and that was a regression from moving the breakpoint.** The
section used to fall outside the stacked block entirely — it began at
820px and a sideways phone is wider than that — so the wide rules
reached it and `padding-right:44%` was the only adjustment it needed.
At 1240px the block caught it too: the words kept their inset and the
figure went underneath them as a full-bleed strip about 130px tall,
cropped to her shoulder, with the reserved 44% standing empty beside
it. Everything the stacked block sets on the pair is undone there now,
not just the padding.

**On a desktop the poem sits centred in the gap between the screen's
edge and her shirt**, rather than at the page's standard inset. The
words and the figure are the whole of this section, so what the eye
reads is the space between them against the space outside them; left
at the inset those two were unequal by 119px at 1920.

Where her shirt falls is worked out. The figure is height-limited
until the screen gets square (720x1080 at 2:3, so .6664 of the panel's
height), width-limited after that at the 42% the box is given, and on
a screen taller than the photograph it stops at its own 719px —
`max-height` limits, it never enlarges, which is why the `min()` has
three terms. The figure is flush right and MIRRORED here, so the
nearest part of her shirt on screen is the *furthest* part of it in
the file: .829 of the width, scanning for pixels that are bright and
nearly neutral, the cotton rather than the warm streaks across it.
The block is 14.32em of the hand, so half of that off half the gap is
where its left edge goes.

The floor is the **gutter**, not the inset. The inset is the larger of
the gutter and half the slack beside `--measure`, and on a wide screen
the second wins — 400px at 1920 against the 341 that centres the
block — so floored at the inset the poem sat 119px right of centre on
exactly the screens where the gap is widest. This is the one place a
section's words leave the shared left line the rest of the page keeps;
that line is worth more between `amor` and `artists`, which are a
title and a list, than it is here, where the words and the figure are
a pair and how they sit against each other is what the section is.

`scratchpad/centre.js` and `centre.py` check it against the rendered
pixels rather than re-deriving the formula, at ten desktop shapes from
1280x800 to 2560x1440: within a pixel at all of them. 2560x1440 is in
that list because it is the one that caught the missing 719px term.

**The headline is exactly as long as the verse's longest line — on a
desktop.** There the two are the whole of the section and an unequal
pair reads as a mistake. Stacked or sideways the headline is set on
its own curve, narrower than the verse and a good deal smaller, which
is what a line standing over a poem should be; `about.js` checks the
match on a desktop and narrower-and-smaller everywhere else.

Holding the match needs one size computed from the other. Curving them
separately and hoping is what left the verse 112px shorter than its
headline on a tablet and 46-75px shorter on a sideways phone. Both
lengths are constants of their strings: "each moment of all time gifted
us" sets in 14.32em of the hand at its .4em word-spacing, and the
headline in 35.79em of the micro face at .28em of tracking. So `#about`
carries one `--hand-size`, the hand takes it, and the headline takes
`calc(var(--hand-size) * var(--lede-k))` where `--lede-k` is the ratio
of those two em-widths.

`--lede-k` is .4003, the ratio at the desktop's .28em of tracking.
Re-measure it with `scratchpad/em.js` if either string or that
tracking changes.

**The leading pays for the size.** The hand is set larger than the
photograph has it — read on a screen it wants to be — so the lines come
closer together to make room: `--adv` is 2.25 on a wide screen, 2 on a
phone and 1.55 sideways, against the photograph's 2.53. The signature
is held wider than the lines are, 1.3 of an advance rather than the
photograph's 1.175, so the pause before the name survives the lines
closing up. `verse.js` therefore checks the rendered advance against
what the CSS asks for rather than against the scan's own figure — the
scan's is still printed beside it, so the departure stays visible.

**Where the headline takes two lines, they are the same length.** The
break is the only even one the phrase allows — "live immersion in
sound," is 24 characters, "movement, presence" is 18 — and balancing
cannot change that ratio, because tracking lands on both lines alike.
What evens them is tracking the shorter line out to meet the longer:
.184em over the first, an em figure, so it holds at every size the
headline is set at. `text-indent` puts the same amount back, since
tracking hangs off the last letter and would otherwise throw the
centring. It needs the two halves to be addressable, so they are
spans, set as blocks below 495px — measured, not chosen: at 496 the
line comes to 448px inside 451px of column and fits, and under that it
does not. The two come out within a pixel of each other from 320 to
430.

**The verse holds a readable size on the small screens.** It is sized
against both axes, and on the short ones the `svh` term is what binds:
at 320x568 that put the hand at 17.6px, which is not enough of a script
this light to read comfortably. The height coefficient goes from 3.1 to
3.6 on a phone and from 5.4 to 5.8 on a sideways one, with the floors
raised to match, and the headline over it comes up too.

Height is what bounds it on a sideways phone, so the leading there is
tighter still. At the larger size and the photograph's leading the last
line came within 11px of the link rail at 844x390, which is not
clearance, it is luck. It is 22-46px across every sideways phone in the
suite now — 812x375, 736x414, 896x414 and 926x428 were added to
`fits.js` for exactly this, because 390 tall was the only one of that
shape it had been checking.

**The signature is centred wherever the verse and the figure stack.**
Beside the figure it sits 2.07em in, which is where the photograph puts
it. Stacked, the block sits in the middle of the panel and an indent
from its left edge reads as sitting off to one side of it, so the
indent is held as `--sign-in` and set to zero there.

**One place the photograph gives way, and it is a last resort.** A
phone held sideways is about 667x375; the figure stands the full 375
and takes 250 of the 667 across, leaving each side column 174px against
the 188 the longest credit needs — with the type already at the
smallest this setting allows. Everywhere else the way out was type;
there it has run out, so the figure comes down to 78% of the height and
gives each column the 27px it wants. It is bounded to screens under
760px wide, so the figure keeps its full height everywhere else. That
rule has to sit *after* the sideways-phone block, not before it: that
block sets `max-height:100%` on the same element, and source order
decides.

**The headline over the verse is capitals**, tracked to .28em and set a
step smaller than the lowercase setting was — capitals at the same
nominal size stand about a third taller and read that much louder, and
this line stands over the verse, which is the voice on that section. It
takes two lines on a phone, balanced, so it breaks into two even ones
rather than a full line and a single word under it.

**The verse ranges left, and its spacing is measured off the
photograph rather than chosen.** Centring turned the stanza into a
funnel; every line now starts on one edge, as every line does in
`images/text.jpg`. The old objection to ranging it left — that a ragged
right edge would hang in the middle of the column — is answered by the
block shrinking to its longest line (`width:max-content`), so the left
edge is the edge of the text and it is the whole block the layout
places: at the left of the column on a wide screen, centred on a phone.

The numbers come from measuring the original against its own x-height,
which is what makes them survive a change of size. In the scan the word
gaps run 41-53px against a 21px x-height, the lines advance 177px, the
signature sits 208px below the last line and 145px in from the left.
That is 2.15 x-heights between words, 8.4 between lines, 1.175 of an
advance before the name and 6.9 in from the edge. Allura's x-height is
.30em, which turns those into ems: `word-spacing:.4em` once the .219em
the font already puts in a space and the .03em of tracking that lands
on it are taken off, an advance of 2.53em, a signature 2.97em below the
last line and 2.07em in.

Held as three custom properties — `--lh`, `--adv`, `--sign` — because a
phone has to close the leading up to fit five lines and the ratio
between the two gaps should not drift when it does. The margins are the
difference between the advance and the line box, so setting the three
per breakpoint is the whole adjustment. A phone runs 2.25 and a sideways
phone 2.0, against the photograph's 2.53.

The hand also sets its commas and exclamation marks off from the word
before, about half a word gap. That is `.hand span{margin-left:.28em}`
on a bare span around the mark, rather than a space in the text, so
what is copied or read aloud is ordinary punctuation.

`scratchpad/verse.js` holds the proportions rather than the pixels: it
checks that the four lines are flush to within .6px, that none of them
wraps, that the block stays inside the panel, and that the three ratios
match the scan at eight sizes. Its line count has to be distinct line
tops — a range over content holding inline elements returns one rect per
run, so a line carrying two spans counts as three and reads as wrapped.

**One way through the page per screen, not two.** A wide screen has
room along the foot for three named links, and names beat marks; a
phone does not — the row was already on a vw curve to stop it wrapping,
and what it was spending that width on was three links duplicating the
dots at the side. Below 1240px the dots take the navigation and the
foot carries the one thing that leaves the site, at the size it should
have been all along. The JavaScript lights both sets regardless of
which is shown, so neither can fall out of step with the other.

**Hover is guarded on `(hover:hover)`.** A touch screen has no hover to
give, but it does leave the last state a tap produced sitting on the
element — an unguarded `:hover` reads as a second current section until
something else is tapped. `:focus-visible` is not guarded: a keyboard
reaches these on any device, so every hover rule has a focus twin
outside the query.

**The ticket button breathes where there is no hover to wait for.** It
is the GLOW that animates and not the pill: the pill carries the
border-radius, and animating a transform on it would promote it to its
own layer for good and cost the antialiasing along that curve on
WebKit — the same trap the desktop hover's 2px lift is written around.
The glow is a radial gradient on its own layer with no edge to lose,
and the border warms with it in colour only. 3.8s, and it stops
entirely under `prefers-reduced-motion`.

**`--rail` is written on the row's own terms.** It is what every
section reserves at its foot, and a height guessed beside the row
drifts from it: at a flat 3.5rem it covered a 57px rail and not the
81px one the bigger button made, so the venue line on the landing ran
into it and the last credit sat on it. It is now the button's own size
plus the row's bottom padding, on both sides of the breakpoint.
`scratchpad/rail.js` asserts that what the row occupies never exceeds
what this reserves — which immediately turned up a latent 9px shortfall
on a 1280x800 desktop that had never overlapped anything only because
those sections had room to spare.

**Everything in the link rail is on a vw curve, and it has to be.** At
a fixed .66rem the row needed 373px, which is more than a 320 or 360px
phone has, so the ticket button dropped onto a second row — measured
wrapping at 320, 340 and 360, with two pixels to spare at 375. Sizes,
tracking, link padding and the button's own padding all shrink with the
screen now: 302px of 320 at the narrowest, one row from 320 to 1440.
`scratchpad/rail.js` measures it. Note that counting rows by comparing
each child's `top` does not work here — the button is taller than the
links, so their tops differ on one row; compare the row's height to its
tallest child instead.

The choice is about the work rather than about taste. Cormorant is a
high-contrast old-style face: the strokes swell and thin the way a pen
does, so every letter has a direction and a speed in it. A geometric
sans is drawn with a compass and stands still. The brief was movement,
lightness and fluidity, and that is what separates the two.

- **Every size is larger than the sans it replaced, by 10-15%.**
  Cormorant's x-height is small for its em — which is where its air
  comes from — so matched by nominal size it reads a good deal smaller.
  Do not "restore" those numbers to the old ones.
- **The narrow title is 9.4vw, and that number is measured.** At the
  sans's old 10.5vw, "AMOR FATI" in Cormorant needed 376px of the 330px
  a 375px screen leaves inside the inset, and broke onto two lines.
  Checked from 320px up: one line at every width, with 25px to spare at
  the narrowest.
- **`latin-ext` is not optional.** The Ć in Amina Avdić's name is
  U+0106 and lives only in that subset; each file was checked for it
  with fontTools before being committed.
- **The italic is rationed.** It is on `.lead-name` and nowhere else,
  so the lean reads as a person rather than as a style.
- **REVERTING.** The previous pairing was Alegreya Sans SC 500 for
  `--display` and Alegreya Sans 300 for `--micro`, self-hosted the same
  way. Alegreya Sans SC is a small-caps *family* rather than a font
  with an `smcp` feature — its lowercase glyphs *are* the small
  capitals — so the title was written "Amor Fati" and given no
  `text-transform`. `git log --oneline -- fonts/` finds the commit that
  carried those files.

## Notes

- The title waits for the display face before it rises, capped at 1.2s.
  It is a width measurement rather than `document.fonts`: `fonts.check()`
  answers "can this be rendered", true from the first frame because the
  fallback can, and `document.fonts` stays empty because Chrome does not
  expose faces from a cross-origin stylesheet. Without the wait, the font
  lands mid-rise and every glyph changes shape in flight.
- **The landing photograph sits against the TOP edge on a phone, and
  nothing is cropped to put it there.** A 2:3 frame on a screen that
  narrow is limited by width, so it is shorter than the screen and the
  difference has to go somewhere; centred (`align-items:center`, the
  default for `.shot`) it was split in two and the half above her read
  as the picture starting late. `align-items:flex-start` drops all of
  it at the foot instead, under the words, where the frame had already
  gone to black — so the join is invisible and the picture starts at
  the top of the screen. An earlier pass solved this by cropping
  (`object-fit:cover`); this is the version that keeps her whole.

- **On a phone the artists photograph is the ground the words are
  written on**, not a panel beneath them: it fills the section and the
  names sit over it in the LOWER left, which is the dark of the room —
  the floor and the shadow under her, where type has the least to
  compete with, and it leaves the lit half of the frame clear above
  them. There is no section heading over them: the `<h2>` is still in
  the markup as `class="sr"`, so a screen reader and the document
  outline still get it, but on screen it was the only thing competing
  with her name. There are no social links on the section either.

- **The horizon under her name is drawn on a `<span>`, and that span
  is the whole fix.** A paragraph fills its column, so a rule anchored
  to one edge of it with a fixed width lands wherever the column
  happens to be: measured at 208px under a 143px name on a desktop
  (64px of it left of the V) and 160px under 91px on a phone (67px
  past the end). An inline-block is the only box on the page that is
  exactly as wide as the words in it, so the rule goes on that, with
  `left:0;right:0` instead of a width. Now measured 0 and 0 at
  1440x900, 375x704 and 844x390. The overhang that remains is exactly
  symmetrical: `letter-spacing` adds its .08em after the last letter
  and `text-indent` puts the same .08em back before the first. On a
  phone the rule itself is `display:none` but the span keeps its
  padding, so the gap it used to sit in stays.
  Two gradients carry it — across, so cream type reads over the left
  and the candle is still a photograph by the middle; down, a little at
  the head and more at the foot where the fixed links are. Neither
  reaches full black.

  **`grid-column` and `grid-row` are reset to `auto` on that layer, and
  it is load-bearing.** An absolutely positioned grid child with a
  *definite* grid position is laid out against its grid area rather
  than against the panel — so with the desktop rule's
  `grid-column:2;grid-row:1` still in force, `inset:0` resolved to the
  first row and the photograph began below the section's top padding:
  a 32px band of black at the top, the same defect the full-bleed hero
  was fixing. Placed automatically the containing block is the grid
  container's padding box, which is the whole panel. Measured: the
  layer is `t0 b0 l0 r0` against its section at 375x704 and 768x1024,
  and untouched at 1440x900 and 844x390.

- **A phone held sideways gets the three-column artists layout, not the
  stacked one, and its sections stay one screen like everywhere else.**
  There used to be an exemption here — `height:auto` with a
  `min-height`, on the reasoning that a short screen should be allowed
  to grow rather than squeeze the photographs. That reasoning predated
  the fixed link rail and the three-column artists section, and by the
  time both existed it produced 1157px of content on a 390px screen,
  with the names running underneath the links and the photograph laying
  itself out at its natural 716x1074. Landscape phones are wide, so
  three columns fit them; everything is simply set smaller. Checked at
  844x390, 932x430 and 780x360.
- **The page does not scroll, and that is the fix.** Sections live in
  a deck — a flex column inside a `position:fixed` body that clips —
  and a gesture moves the deck by `transform:translate3d`, one screen
  per step. Nothing measures anything after the first frame, so nothing
  can drift.

  Everything before this fought the same thing and lost. A phone's
  browser retracts its toolbar *while the document scrolls*, so a
  scrolling page's viewport changes height mid-gesture: sections sized
  to it resize under the reader, every snap point below them moves, and
  releasing a drag lands on a target that is no longer where it was.
  That is not a bug in this stylesheet to be tuned out. It is what a
  scrolling document on a phone does, and `svh`, `lvh`, `dvh`, measured
  pixels, extra slack on the last section and a smaller snap threshold
  were each tried and each failed, because each of them was an attempt
  to hold a moving thing still rather than to stop it moving.

  The libraries built for exactly this arrangement do not do better:
  fullPage.js, the canonical one, carries open, unresolved reports of
  the same iOS height bug ([#4733][fp1], [#2414][fp2]) and is GPLv3 or
  paid. The ones that *are* immune — Swiper among them — are immune
  because they do not scroll the document either; they move slides by
  transform. That technique is 120 lines, so it is written here rather
  than added as a dependency, and this file stays the whole site.

  What it buys: the toolbar has no scroll to react to, so it stays out
  and the viewport is one number for the whole visit. A section is
  `flex:0 0 100%` of the deck, so it is the screen by construction —
  there is no viewport unit left to be wrong about anything. Verified
  at 17 sizes from 320x568 to 1920x1080: deck, all three sections and
  the screen are the same number, the document's scroll height never
  exceeds one screen, and every section arrives at exactly `top:0`.

  What it costs: the address bar never retracts, so a phone gives up
  the ~40px it would have reclaimed. That is the trade, taken
  deliberately — those 40px were the whole source of the instability.

[fp1]: https://github.com/alvarotrigo/fullPage.js/issues/4733
[fp2]: https://github.com/alvarotrigo/fullPage.js/issues/2414

- **ONE height, and everything uses it: the body, the deck, the
  sections.** The body is fixed to the four edges, so that height is
  the layout viewport — the whole screen, including the strip behind a
  phone browser's toolbars. A section covers all of it. Nothing is
  sized from `--screen`.

  That is the bug that put two sections on screen at once. The deck was
  sized from `--screen`, the VISUAL viewport, which on iOS is shorter
  than the layout viewport by the height of those toolbars — while the
  box that clips, the body, was still the taller one. The sections
  below the first sat in the gap between the two and were in plain
  view. Reproduced at 393x852 with `--screen` forced to 580: body 852,
  deck 580, section two at y=580.

  **Two fixes that look right and are not.** Sizing the body down to
  `--screen` also closes the gap, and makes a section stop at the
  toolbar instead of running behind it — the opposite of every section
  covering the whole screen. And the clip cannot go on the deck: the
  deck carries the transform, and overflow clips a transformed element
  in its own coordinate space, so the window would travel with the
  content and show nothing at all. The clip belongs on an ancestor that
  never moves.

  `--screen` is still measured, for the drag threshold and for telling
  whether the reader has pinch-zoomed. Nothing is sized from it, and
  `scratchpad/ios.js` asserts that: it shortens the visual viewport at
  six phone sizes and checks that the section still covers the screen,
  that the next one cannot show through, that the deck's height did not
  move, and that stepping still lands.

  **A finger has to hold the pixels it landed on.** Two separate things
  used to pull the page out from under it, and both are worth keeping
  written down because both were invisible on a desktop.

  The resting place of section n is `calc(var(--at) * -100%)` — a
  percentage of the deck, so `-n x deck-height`. The drag used to put
  the deck at `-n x --screen` instead. Those agree on section one,
  where both are nothing, and they agree wherever the two viewports do;
  on a phone anywhere else they differ by the height of the toolbar, so
  the page jumped by that much on the first millimetre of every drag,
  and by twice that on the section after. The drag now starts from the
  deck's actual computed transform, which is right whatever the unit,
  and cannot drift apart from the resting rule again.

  And a finger landing during a glide used to call `land()`, which
  drops the transition and puts the deck on its destination in one
  frame. Grabbing something in motion should stop it where it is, not
  throw it the rest of the way first — so touch now freezes the deck at
  the position it reads off the transform, and the glide's bookkeeping
  is cleared without the snap. `land()` still serves the wheel and the
  keyboard, where there is nothing under a finger to hold still.

  `scratchpad/grab.js` holds both: it tracks the deck against the
  finger on every touchmove the browser delivers, at four sizes and two
  sections, and it presses mid-glide and requires the deck to be still
  at +16ms, +120ms and +300ms without having reached the destination.
  Against the build before the fix it reports 72px of slip on section
  one, 144px on section two, and a deck that keeps travelling under a
  finger that has already landed.

  A note on testing this at all: the fake has to be
  `visualViewport.height` itself, installed before the page's scripts
  run. Writing `--screen` from outside looks equivalent and is not —
  the page's own JS keeps its own measurement, so the whole JS half of
  the bug goes unseen. That mistake is why `grab.js` passed on the
  broken build the first time it was run.

  Headless Chromium has no toolbar, so the two viewports are equal
  there and this cannot appear on its own — which is why it survived
  every suite until it was seen on a phone. **The version approved
  before this had the same bug**; it was latent because the strip of
  the next section happened to be black.

- **Without script it is an ordinary long page.** Every deck rule is
  gated on `html.js`, and the class is set in a one-line script in the
  `<head>` rather than at the end of the body, so the deck layout is
  the first one painted rather than the second. With script off,
  sections are `min-height:100svh` in normal flow and the page scrolls
  the way any page does.

- **Gestures are interpreted, not delegated.** A wheel burst is
  disarmed until its deltas have been quiet for 160ms, so one trackpad
  flick is one section rather than a walk through the whole page. A
  finger drags the deck one to one and the release decides: past 12% of
  the screen, or faster than 0.25px/ms having moved at least 24px. At
  the first and last section the pull is damped to a fifth rather than
  stopped, so the end of the page announces itself. Keyboard: arrows,
  page keys, space, Home and End.

- **Focus follows into clipped sections.** Off-screen here means
  clipped, not below the fold, so there is no scroll for the browser to
  bring a tabbed-to link into view with. A `focusin` listener moves the
  deck to whichever section took focus.

- **Alignment inside `#artists` is driven by a custom property**
  (`--reach-align`), not by adding a more specific selector in the
  narrow-screen block. Overriding an id-plus-two-class rule needs a
  selector at least as specific, and that arms race has already been
  lost four separate times in this file. Set the property, read it once.
- On a phone the left column uses `display:contents` so its three
  parts become grid items in their own right and can be ordered
  independently — the socials belong at the end of the words, not
  wedged between her name and the company. Inherited properties still
  pass through a `display:contents` box, but its own padding does not,
  so the parts carry their own inset.
- `align-self:stretch` on a figure inside a centred grid is
  load-bearing, and it has had to be added twice — once on `about`,
  once on `artists`. Without it the box is sized by its content,
  `height:100%` resolves to `auto`, and the photograph lays out at its
  natural 720x1080: overflowing a 900px panel and being silently
  clipped by `overflow:hidden`. It looks nearly right in a screenshot.
- An `id` outranks a class, so every `#artists` rule written for the
  wide layout also lands in the narrow one unless it is given back
  there. Three separate defects came from this: a figure 22px short of
  the right edge, a full-bleed figure 146px wide because it kept
  `grid-column:2` and fell into an implicit second column, and roster
  sizes collapsing together. If you add an `#artists` rule, check the
  phone.
- `--inset` is declared on `:root`, not on `.panel`. The link rail is
  fixed to the viewport and lives outside every panel, and a `var()`
  that resolves to nothing makes the entire shorthand it sits in
  invalid — which silently stripped all the padding off the rail and
  put the ticket button flush against the bottom edge of the screen.
  Nothing errored; the padding simply computed to zero.
- **The ticket button's lift is `translateY`, never `translate3d`, and
  it carries no `will-change`.** This is the jagged border. A 3d
  transform, or a declared `will-change`, promotes the element to its
  own compositor layer for good — and a promoted layer is rasterised
  once and then transformed, which on WebKit drops the antialiasing
  along a `border-radius`, so the edge comes back as stair-steps. A
  plain 2d translate is composited only while it animates. At a 2px
  lift and a 2px border there is nothing here that needs its own layer.
  If the edge ever looks jagged again, the lift is the first thing to
  take out — the glow alone carried the hover perfectly well. The other
  candidate, if it survives that: the pill's box is fractional in every
  dimension at every size (92.547 x 32.188 at y 654.922 on a 375x704
  screen) because the rail's type is fluid, and the answer there is
  drawing the ring with `box-shadow` rather than `border`.
- **Hover lights the button, it does not fill it.** The border goes to
  full gold, the tint roughly doubles and the glow behind grows by
  half; the label stays cream. Filled solid, the one warm thing on the
  page became a slab, which is not what the rest of it is made of.
- **One section per gesture, however hard or long — and never stuck.**
  These two pull against each other, and getting one has repeatedly
  cost the other. A flick keeps sending deltas for a second or more
  after the fingers have lifted, and the page has to tell that tail
  apart from a hand still working.

  Silence alone cannot: a second flick arrives before the first tail
  has died, so the stream never goes quiet and the page locks until the
  pointer happens to move. Delta size alone cannot either: a tail
  decays on average but not monotonically, so both "it got bigger" and
  "it is still big" fire partway down a hard throw and turn one flick
  into two. Resetting when the animation ends — the obvious model —
  is worse than either: **measured at 2, 3, 4 and 5 turns for a single
  flick** (`scratchpad/proposal.js`), because a 620ms animation ends
  while a 2000ms tail is still delivering 30-100 per event and it
  re-crosses the threshold immediately.

  What a tail cannot do is either of these, and they are what the
  handler tests:
  1. **Turn back upward.** Momentum only slows, so a stream that stops
     falling and climbs to over twice its own low has a finger behind
     it. Measured against the run's own low rather than a fraction of
     the peak — that is what lets it see a second flick thrown while
     the first is still loud, where there is no dip below any fixed
     fraction, only a turn.
  2. **Travel further than it has left in it.** A decaying tail's
     remaining distance is bounded: peak / (1 - decay). That is 22x the
     peak at the rate a trackpad usually decays and 50x at the slowest
     worth allowing for, and the envelope reads a few per cent under
     the true peak, so the budget is 90x with a floor under it.

  (2) is what answers a steady scroll that never varies and never
  stops: it keeps turning instead of waiting for a silence that is not
  coming. Plus the two cheap ones — 220ms of quiet, and a pointer move
  500ms after a step, which cannot fire mid-flick because a two-finger
  scroll does not move the cursor.

  **Read the envelope, never the raw deltas.** Real trackpad deltas
  jitter, so on raw samples any value is a low and the next can be
  twice it: measured, a single flick turned two pages *every time* at
  +/-50% jitter (`scratchpad/noisy.js`). Both rules read an exponential
  average about four events wide, which cannot turn upward on noise,
  and the peak comes from the same average so one spike cannot inflate
  it. Clean at +/-65% jitter now.

  **2.2x is tuned, and the tuning is a straight trade-off** measured
  both ways in `scratchpad/sens.js`. Below 2.0, a half-strength nudge
  on a decaying tail turns the page — the page feeling trigger-happy.
  Above 2.2, a deliberate second flick has to be further behind the
  first to count. At 2.2 a second flick registers from about 500ms
  after the first, and nothing smaller than a real throw registers at
  all. Two flicks closer than that overlap too heavily for the envelope
  to have turned, and count as one gesture: that is the intended
  answer, not a gap in the detector.

  Verified across twelve flick shapes (peaks 40 to 700, tails from 1.5s
  to 5.7s): one turn each. Nudges at a fifth, a third and half strength
  on a live tail: no turn. Steady, slow and varying continuous scrolls:
  they keep turning.

  **Test it with a modelled momentum tail, not with `mouse.wheel`.**
  CDP round trips leave 100ms-plus gaps between synthesized events,
  which a trackpad never has — a gap past the quiet window re-arms
  mid-gesture and the test double-steps for reasons the browser never
  would. `scratchpad/trackpad.js` dispatches WheelEvents on the page's
  own clock: a six-event push then a 0.955-per-16ms decay, which is
  close enough to macOS to reproduce the real double-step and to prove
  it gone. Cases: one flick at peak 40, 140 and 400 all turn exactly
  one page; two flicks 420ms apart turn two; 3.5s of unbroken
  scrolling turns one.

- **The photographs are all the same size.** All three files are 2:3,
  and on a wide screen each is limited by height — so given the same
  height they render at the same width. The artists section used to pad
  its middle column top and bottom, which made that photograph 792px
  tall against the hero's 900 and 528 wide against 600; it read as two
  different pictures. Its block padding is gone, and the words are
  centred in the row, so they lose nothing by it. Measured equal at
  1280x800, 1440x900, 1920x1080, 844x390 and 375x704.
- **The link rail is one centred group, narrower than the picture.**
  It was stretched to the photograph's width for a while, with the
  ticket button pushed out to the right edge: the ends lined up and it
  left a lake of black through the middle of the row. Held together and
  centred reads better than aligned and pulled apart.
- **The roster is smaller and tighter than the rest of the page**
  (`clamp(.72rem,1.05vw,.92rem)`, .14em) because that wider middle
  column took the width out of the side ones. Measured across seven
  screen sizes: the longest credit sits on one line everywhere from
  1280 up. At 1024x768 the column is 178px and it needs two lines,
  which no readable size avoids — `text-wrap:balance` makes those two
  lines even rather than a long one and a stub.
- **A gesture interrupts a glide instead of queueing behind it.**
  `land()` drops the transition so the deck is on `--at` that frame,
  and the new gesture starts from a section rather than from halfway
  between two. Before this, input during a glide was thrown away: two
  quick swipes moved one section, and the second only registered once
  everything had come to rest. The glide stays at .62s — the interrupt
  is what fixed the lag, not a shorter animation. Held arrow keys get a
  180ms cooldown so auto-repeat does not fly through the page; nothing
  else needs one, since one gesture is one section by construction.
- The lock is absolute — a gesture moves exactly one section, never a
  fraction and never two — which is honest here because every section
  really is exactly one screen, on every size checked including a phone
  held sideways.
- The figure beside the verse is pinned to the panel rather than sized
  by a grid track. A grid item's height comes from its content, so
  `max-height:100%` had nothing to resolve against and the photograph
  was capped on width while its height ran free — 719x1079 rendered
  575x1079, visibly squashed. Against the panel, which is exactly one
  screen, both limits resolve.
- Which section you are in is not deduced from anything. It is the
  deck's index, and the dots, the links and the address bar's hash are
  all set from it, so they cannot disagree with what is on screen. The
  earlier build inferred it from scroll position, and before that from
  intersection, which lit the wrong dot mid-transition.
- Motion respects `prefers-reduced-motion`: the reveals, the letter rise
  and the glide between sections all stop for anyone who has asked
  their device for that; a section change is then instant.
- Everything that animates is compositor-only (opacity and transform).
  The title's halo is one painted-once gradient rather than a
  text-shadow. Layers are asked for a frame before they are needed and
  handed back once the block has landed.
