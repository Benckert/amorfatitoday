Where the numbers in index.html came from.

These are not suites — nothing here passes or fails. They are the
measurements that produced the constants the stylesheet is built on,
kept because a number with no provenance is a number the next person
tidies away.

  coeff.js       the cqw coefficient each layout can take, per layout
  colwidth.js    roster type size against photograph width
  widths2.js     the rendered width of every credit, for their order
  em.js          the em-widths the headline and the verse set in
  emwidth.js     how many ems the widest credit occupies
  lead.js        the lede's measure
  her.js         where the lit figure lands in each image's own box
  samewidth.js   hero against artists, at six desktop sizes
  lazycheck.js   whether loading="lazy" defers anything under the deck
  dash.js        the two mid-points the en dash is levelled between
  jdepth.js      how far the capital J descends below the baseline
  jclear.js      the clearance under it, at dpr 3
  names.js       rendered width against letter count
  centre.js/py   the poem's block against the shirt, in rendered pixels
  edges.js       the one-pixel step at a photograph's edge
  shape.js/py    the CTA ring's speed against position on the outline
  bell.js/py     the ring's falloff and its speed profile
  ramp.py        generates the linear() easing for that profile
  arc.py         arc length round the ring
  profile.py     brightness along the outline through one lobe

They take the same environment as the suites: run them from test/ with
a server on :8137, or set SITE. `node tools/coeff.js`.
