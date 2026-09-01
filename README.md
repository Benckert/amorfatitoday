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
frame, so what goes is the floor and her legs, never her head. Between
77% and 79% of the photograph survives on a typical phone, 60% on a
short 360x640 one. This is the only `object-fit` in the stylesheet, it
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
that order — she leads, so she is set apart above it in gold with a
short rule, rather than made loud within it.

**One shape, three times.** A photograph filling the screen, the words
over the black beside or beneath it, the same row along the foot.

**One thing on the page is not navigation, and it is shaped
differently.** The Tickets button leaves the site, so it is the only
enclosed, gold-edged thing in the rail, set apart from the three
section links with real space and carrying the arrow that means "away
from here". The rail reads as: here are the parts, and here is how you
come. It is never marked as the current section, and the script that
tracks scrolling only ever touches `a.to`.

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

Two families, and no more. **Bodoni Moda** carries the display: a
didone, whose thick-to-thin is the same drama the photographs have, set
in capitals at 0.16em. A geometric sans was here first and was too
even-toned to sit against these pictures. **Inter** carries every small
line — the subtitle, the dates, the artists' names, the links — and it
never appears above 0.9rem, which is the point of it: at that size you
want a face with no opinion.

Both are **self-hosted**, in `fonts/`. Nothing is fetched from Google,
so the page does not depend on a third party being up, no visitor's
request for it reaches one, and the display face is there on the first
paint rather than a beat later. Only the latin and latin-ext subsets
are included — latin-ext is not optional, it carries the ć in Amina
Avdić's name. To change a face: drop the `.woff2` files in `fonts/`,
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

## Notes

- The title waits for the display face before it rises, capped at 1.2s.
  It is a width measurement rather than `document.fonts`: `fonts.check()`
  answers "can this be rendered", true from the first frame because the
  fallback can, and `document.fonts` stays empty because Chrome does not
  expose faces from a cross-origin stylesheet. Without the wait, the font
  lands mid-rise and every glyph changes shape in flight.
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
