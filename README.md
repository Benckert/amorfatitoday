# amor fati — Vallerie with Company

A single self-contained `index.html`. No build step, no dependencies —
open it in a browser, or drop the folder on any host.

One page, four sections: the opening, the invitation, the artists, the
evening.

## Editing it

Everything you need to change is marked `<!-- EDIT -->` in `index.html`,
and there is a checklist at the top of that file. In order:

1. **Opening** — the date/time/venue stamp. The title, the company name
   and the tagline are already set.
2. **Artists** — nine names and what each of them does.
3. **Details** — date, time, doors, place, price, **and the Kickstarter
   URL** (search for `kickstarter.com` — it's the `href` on the button),
   then Instagram and email just below it.

## What the design holds to

**The photographs are never cropped.** Each one is shown whole, at its
own aspect ratio, inside a box it may not exceed — `object-fit` is
deliberately absent from the stylesheet. On a narrow screen a photograph
gives up size, never edges. The files in `images/` are the originals,
untouched and unre-encoded.

The one edit the design makes to a photograph is mirroring, and it is
made for the layout rather than to the picture: it turns each figure's
reach towards the words instead of away from them. Three `--flip` lines
in the stylesheet do it, and deleting one undoes it.

**One measure.** Every photograph on the page is held to the same
`--shot` height. That single token is most of what makes four different
sections read as one site.

**One shape, four times.** A photograph on one side, words on the other,
the same row of links along the foot. The opening and the closing hold
the photograph on the same side so the page ends where it began; the
artists panel turns the other way, which is the only variation.

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

"Vallerie with Company" is set in **La Belle Aurore**, the closest match
on Google Fonts to the hand in the company's own artwork. It is an
approximation, and it appears one section away from the real lettering
on their slide — so if you know the actual font, swap the `family=` name
in the `<link>` tags and the `--script` token. If you'd rather not risk
the near-miss, setting `--script` to `var(--serif)` drops the script
entirely.

## Sound

Optional, off by default — see `audio/README.txt`. If the file isn't
there the toggle hides itself and the page is simply silent.

## Publishing

Any static host works:

- **Netlify Drop** — drag this folder onto <https://app.netlify.com/drop>.
- **Vercel** — `npx vercel` in this folder.
- **GitHub Pages** — push, then Settings → Pages → deploy from this branch.

## Notes

- Fonts come from Google Fonts, loaded without blocking the first paint,
  so the page appears immediately and the serif swaps in a moment later.
  It falls back to system serif/sans gracefully with no connection at all.
- The title waits for the serif before it rises, capped at 1.2s. It is a
  width measurement rather than `document.fonts`: `fonts.check()` answers
  "can this be rendered", true from the first frame, and `document.fonts`
  stays empty because Chrome does not expose faces from a cross-origin
  stylesheet. Without the wait, the font lands mid-rise and every glyph
  changes shape in flight — worst on the f, whose long hook the fallback
  has nothing like.
- Scroll snapping is `proximity`, not `mandatory`: a section that
  outgrows a short screen has to stay reachable.
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
