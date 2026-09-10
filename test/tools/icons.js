/* Renders the two icon files the page cannot carry inline.

   The favicon itself lives in index.html as a data URI — one fewer
   request on a page whose whole point is the first screen — but two
   things have to be files:

     images/apple-touch-icon.png   iOS will not take an SVG here.
     images/share-card.jpg         og:image. A link preview is a
                                   1.91:1 card, and the photographs on
                                   this site are 2:3 — handed the hero
                                   whole, every platform crops its own
                                   strip out of the middle of her.

   Both are drawn from the same source as the favicon: the page's own
   hand, its own faces, its own photograph, its own black. The card is
   the landing screen laid out sideways.

       cd test && node tools/icons.js

   It writes into images/ and prints what it wrote. Nothing runs it
   automatically; re-run it when the mark, the date or the venue
   change. The mark's path comes from tools/mark.py — see there. */
const fs = require("fs");
const path = require("path");
const { launch } = require("../browser");

const ROOT = path.join(__dirname, "..", "..");
const url = p => "file://" + path.join(ROOT, p);

/* the 'a' of Tangerine 700 as an outline, in a 32 box — tools/mark.py */
const MARK = "M24.2 20.2Q24.3 20.1 24.5 20.2Q24.7 20.4 24.6 20.6Q23.5 22.3 22 23.3Q20.6 24.3 19.3 24.3Q17.8 24.3 17.4 22.2Q16.9 20.1 17.8 17.2Q16 20 14 22Q11.9 23.9 9.7 24.3Q8.1 24.3 7.2 22.9Q6.4 21.5 6.4 19.6Q6.4 17.4 7.4 15.3Q8.5 13.2 10.2 11.5Q11.9 9.8 14 8.7Q16.2 7.7 18.3 7.7Q20.6 7.7 21.9 8.8Q22.5 8.3 23.5 8Q24.6 7.7 25.3 7.7Q25.6 7.7 25.6 8Q24.1 9.8 23 12Q22 14.2 21.4 16.2Q20.8 18.1 20.7 19.7Q20.5 21.3 20.9 21.9Q21.2 22.2 22 22.1Q22.8 21.9 24.2 20.2ZM11.7 21.9Q12.5 21.9 13.6 20.9Q14.7 20 16 18.3Q17.2 16.7 18.4 14.7Q19.6 12.7 20.5 10.6Q20.3 9.8 19.3 9.2Q18.4 8.7 17.1 8.7Q15.6 8.7 14.3 9.5Q13 10.2 12.1 11.5Q11.2 12.9 10.6 14.7Q10 16.6 10 18.8Q10 20.2 10.5 21.1Q11 21.9 11.7 21.9Z";

const CREAM = "#f6e3bd";

/* The ground is the vignette the photographs carry, not flat black: at
   180px it reads as the candle the gold is named for, and at 16px it is
   simply black. The stroke is weight the hand does not have on its own
   — .25 at 180px keeps its thick-and-thin, where the favicon's .5 is
   what keeps the counter of the 'a' open at 16. */
function icon(stroke) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<defs><radialGradient id="g" cx=".5" cy=".47" r=".62">` +
    `<stop offset="0" stop-color="#3b2a11"/>` +
    `<stop offset=".55" stop-color="#150d05"/>` +
    `<stop offset="1" stop-color="#000"/></radialGradient></defs>` +
    `<rect width="32" height="32" fill="url(#g)"/>` +
    `<path d="${MARK}" fill="${CREAM}" stroke="${CREAM}" ` +
    `stroke-width="${stroke}" stroke-linejoin="round"/></svg>`;
}

/* The landing, sideways. The photograph stands the full height at its
   own proportions and is feathered into the black rather than cropped
   — the same rule the page holds to — and the words take the room that
   leaves, in the order the landing puts them in. */
const CARD = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Jost';font-weight:300;src:url('${url("fonts/jost-300-latin.woff2")}') format('woff2')}
@font-face{font-family:'CormGar';font-weight:400;src:url('${url("fonts/cormgar-400-latin.woff2")}') format('woff2')}
@font-face{font-family:'Tangerine';font-weight:700;src:url('${url("fonts/tangerine-700-latin.woff2")}') format('woff2')}
:root{--cream:#f6e3bd;--paper:rgba(246,227,189,.86);--gold:#d9a441;--mist:rgba(246,227,189,.58)}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#000}
.card{position:relative;width:1200px;height:630px;background:#000;overflow:hidden;display:flex;align-items:center}
.fig{position:absolute;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-end}
.fig img{height:630px;width:auto;display:block;filter:brightness(.9) saturate(.94);
  --feath:linear-gradient(to right,transparent 0,#000 26%,#000 100%);
  --vig:radial-gradient(76% 68% at 52% 44%,#000 0%,#000 32%,rgba(0,0,0,.88) 62%,rgba(0,0,0,.72) 100%);
  -webkit-mask-image:var(--vig),var(--feath);-webkit-mask-composite:source-in;
  mask-image:var(--vig),var(--feath);mask-composite:intersect}
.veil{position:absolute;inset:0;background:linear-gradient(to right,#000 0%,#000 40%,
  rgba(0,0,0,.82) 56%,rgba(0,0,0,.30) 70%,rgba(0,0,0,0) 84%)}
.says{position:relative;z-index:2;padding:0 0 0 104px;max-width:700px}
h1{font-family:'Jost',sans-serif;font-weight:300;font-size:86px;line-height:1;letter-spacing:.15em;
  text-indent:.15em;text-transform:uppercase;color:var(--cream);margin:0;text-shadow:0 2px 30px rgba(0,0,0,.85)}
.lede{font-family:'Tangerine',cursive;font-weight:700;font-size:60px;line-height:1.1;letter-spacing:.026em;
  color:var(--gold);margin:26px 0 0;text-shadow:0 1px 4px #000,0 2px 18px rgba(0,0,0,.9)}
.when{font-family:'CormGar',serif;font-size:25px;letter-spacing:.2em;text-indent:.2em;color:var(--paper);
  margin:34px 0 0;text-shadow:0 1px 14px rgba(0,0,0,.9)}
.where{font-family:'CormGar',serif;font-size:21px;letter-spacing:.2em;text-indent:.2em;color:var(--mist);
  margin:12px 0 0;text-shadow:0 1px 14px rgba(0,0,0,.9)}
</style>
<div class="card">
  <div class="fig"><img src="${url("images/hero-1440.jpg")}" alt=""></div>
  <div class="veil"></div>
  <div class="says">
    <h1>Amor Fati</h1>
    <p class="lede">An immersion in vibration</p>
    <p class="when">September 17 &nbsp;&#183;&nbsp; 7&#8211;9 pm</p>
    <p class="where">Mindepartementet, Skeppsholmen</p>
  </div>
</div>`;

(async () => {
  const b = await launch();
  const wrote = [];

  /* Written to a file and navigated to, never setContent: a page set
     that way has about:blank for an origin and will not fetch a file://
     font or photograph — which comes out as a card with no picture on
     it and the hand in a fallback serif, not as an error. */
  const scratch = fs.mkdtempSync(path.join(require("os").tmpdir(), "icons-"));
  async function shoot(html, { width, height, out, type, quality, scale }) {
    const ctx = await b.newContext({ viewport: { width, height },
                                     deviceScaleFactor: scale || 1 });
    const pg = await ctx.newPage();
    const page = path.join(scratch, "page.html");
    fs.writeFileSync(page, html);
    await pg.goto("file://" + page, { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready.then(() => true));
    await pg.waitForTimeout(300);
    const file = path.join(ROOT, out);
    await pg.screenshot(Object.assign({ path: file, type },
                        type === "jpeg" ? { quality } : {}));
    await ctx.close();
    wrote.push(`${out}  ${fs.statSync(file).size} bytes`);
  }

  await shoot(`<style>html,body{margin:0}svg{display:block;width:180px;height:180px}</style>`
              + icon(0.25),
              { width: 180, height: 180, out: "images/apple-touch-icon.png", type: "png" });
  await shoot(CARD,
              { width: 1200, height: 630, out: "images/share-card.jpg", type: "jpeg", quality: 88 });

  fs.rmSync(scratch, { recursive: true, force: true });
  console.log(wrote.join("\n"));
  await b.close();
})();
