# amor fati — Vallerie with Company

A single self-contained `index.html`. No build step, no dependencies —
open it in a browser, or drop the folder on any host.

One page, three sections — **amor**, **about**, **artists** — each one
exactly one screen tall, plus a **Tickets** button that leaves the site.

## Editing it

Everything you need to change is marked `<!-- EDIT -->` in `index.html`,
and there is a checklist at the top of that file. In order:

1. **The ticket URL** — search for `kickstarter.com`. It is the `href`
   on the Tickets button, which lives in the `<template id="jump-tpl">`
   near the top of the body, so changing it once changes it in all
   three copies.
2. **Instagram and email** — at the foot of the artists section.

The title, the subtitle, the dates, the verse and all ten artists are
already set. There is no venue/price section: those details live on the
ticket page, which is where anyone reading them is going anyway.

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

**The roster is ordered by how wide each name is set, not by how many
letters it has.** They were measured in a browser at the real tracking:
"Amina Avdić" is the same eleven characters as "Yazz Meavis" but sets
wider, and "Eliot Charoff" sets narrower than "Lova Hellberg" though
both are thirteen. Counted rather than measured, three of the nine sit
in the wrong place and the ramp has kinks in it. Vallerie is outside
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
drift either, and the links now stay put while the page scrolls instead
of riding up and down with whatever section is passing. A gradient
under it keeps it off the photographs.

**One thing in that rail is not navigation, and it is shaped
differently.** The ticket button leaves the site, so it is the only
enclosed, warm, gold-edged thing there, set apart from the three
section links with real space and carrying the arrow that means "away
from here". It is never marked as the
current section, and the script that tracks scrolling only ever touches
`a.to`.

**The navigation is identical everywhere, by construction.** The row of
section links is written once, as a `<template>`, and stamped into each
panel by script — so the four copies cannot drift apart. The section
you are in is named in gold rather than hidden. The dots on the right
are the same four places, and both are driven from the same state.

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

## Notes

- The title waits for the display face before it rises, capped at 1.2s.
  It is a width measurement rather than `document.fonts`: `fonts.check()`
  answers "can this be rendered", true from the first frame because the
  fallback can, and `document.fonts` stays empty because Chrome does not
  expose faces from a cross-origin stylesheet. Without the wait, the font
  lands mid-rise and every glyph changes shape in flight.
- **The page scrolls inside `<main>`, not inside the document**, and
  that is the fix for a whole class of mobile trouble rather than a
  preference. While the document itself scrolls, a phone browser
  expands and retracts its own toolbar as you go and the viewport
  changes height underneath the layout: sections sized to one viewport
  stop matching the screen, a strip of the neighbouring section shows
  above or below, and the last snap point can end up beyond the
  furthest the page can reach, so snapping retries a move it can never
  finish. `svh`, `lvh` and `dvh` each *describe* that moving target;
  none of them stops it moving, and three separate attempts to pick the
  right one all failed on a real phone. Browsers only drive the toolbar
  from document-level scrolling, so with `html,body{height:100%;
  overflow:hidden}` and the scrolling moved into `main`, the viewport
  is one size for the whole visit, `height:100%` is a real number, and
  every section is exactly the screen it is on. The cost is that the
  toolbar stays visible. **Everything in the script asks `main` about
  scrolling — `scrollTop`, `clientHeight`, its own scroll event, and
  the IntersectionObserver's `root`. If you reintroduce
  `window.scrollY` anywhere, it will read zero forever.**
- **Scroll snapping is `mandatory` everywhere, with
  `scroll-snap-stop:always` on each panel.** That is the scroll-lock
  this site is built around: a scroll of any size advances exactly one
  section and lands it square. A short-lived attempt to soften this to
  `proximity` on touch was a mistake — under proximity a 180px scroll
  simply stays 180px in, leaving the reader between two sections, which
  is the opposite of what the layout wants. `scroll-snap-stop` is what
  keeps a hard fling from carrying past a snap point and landing two
  sections away.
- The `goTo()` fallback that corrects a cancelled smooth scroll now
  stands down if the reader starts scrolling themselves. Correcting a
  scroll someone is in the middle of is itself a jump, and a worse one,
  because they caused it and it fought them.
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
- Scroll snapping is `mandatory`, which is honest here because every
  section really is exactly one screen. The one exception is a phone
  held sideways, where there is so little height that the sections are
  allowed to grow and snapping is switched off — squeezing the
  photographs to fit that would leave nothing to look at.
- The figure beside the verse is pinned to the panel rather than sized
  by a grid track. A grid item's height comes from its content, so
  `max-height:100%` had nothing to resolve against and the photograph
  was capped on width while its height ran free — 719x1079 rendered
  575x1079, visibly squashed. Against the panel, which is exactly one
  screen, both limits resolve.
- Which section you are in is decided by scroll position — the panel
  whose middle is nearest the middle of the viewport — not by
  intersection, which lights the wrong one during a transition.
- Motion respects `prefers-reduced-motion`: the reveals, the letter rise
  and the scroll cue all stop for anyone who has asked their device for
  that, and section jumps become instant.
- Everything that animates is compositor-only (opacity and transform).
  The title's halo is one painted-once gradient rather than a
  text-shadow. Layers are asked for a frame before they are needed and
  handed back once the block has landed.
