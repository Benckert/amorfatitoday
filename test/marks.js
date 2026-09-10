const { launch, SITE } = require("./browser");
/* THE FOUR THINGS THAT REPRESENT THE PAGE SOMEWHERE ELSE — the tab
   icon, the home-screen icon, and the card a shared link becomes — and
   every one of them fails silently. A malformed data URI is a blank
   tab, a missing PNG is a screenshot of the page on someone's home
   screen, and og:image dimensions that disagree with the file are a
   preview laid out for a shape the picture is not.

   So: each one parses and loads, each one is the size it says it is,
   and og and twitter point at the same picture. Nothing here looks at
   what is drawn — that is a judgement, and it is in test/tools/icons.js
   where the drawing is. */
(async () => {
  const b = await launch();
  const ctx = await b.newContext({ viewport: { width: 900, height: 700 } });
  const pg = await ctx.newPage();
  await pg.goto(SITE + "/index.html", { waitUntil: "load" });
  const log = [];

  const meta = await pg.evaluate(() => {
    const at = s => { const e = document.querySelector(s); return e && (e.content || e.href); };
    return {
      icon: at("link[rel=icon]"),
      touch: at("link[rel=apple-touch-icon]"),
      og: at('meta[property="og:image"]'),
      ogW: Number(at('meta[property="og:image:width"]')),
      ogH: Number(at('meta[property="og:image:height"]')),
      ogAlt: at('meta[property="og:image:alt"]'),
      tw: at('meta[name="twitter:image"]'),
      card: at('meta[name="twitter:card"]'),
    };
  });

  /* the scraper has no page to resolve against, so these have to be
     absolute — and they are absolute to the live host, which is not
     where this is being served from; the file is fetched from here */
  const local = u => SITE + "/" + String(u).replace(/^https?:\/\/[^/]+\//, "");

  async function measure(src) {
    return pg.evaluate(s => new Promise(res => {
      const i = new Image();
      i.onload = () => res({ ok: true, w: i.naturalWidth, h: i.naturalHeight });
      i.onerror = () => res({ ok: false, w: 0, h: 0 });
      i.src = s;
    }), src);
  }

  /* The favicon is checked for PARSING and nothing else: an <img> given
     an SVG with no width or height reports 150x150 whatever is inside
     it, so there is no size here to assert. Parsing is the failure that
     actually happens — a data URI with one character wrong is a blank
     tab and no error anywhere. */
  const want = [
    ["favicon", meta.icon, null, null],
    ["apple-touch-icon", local(meta.touch), 180, 180],
    ["share card", local(meta.og), meta.ogW, meta.ogH],
  ];
  for (const [name, src, w, h] of want) {
    const r = await measure(src);
    const ok = r.ok && (w == null || (r.w === w && r.h === h));
    log.push(`${ok ? "PASS" : "FAIL"} ${name.padEnd(18)} parses=${r.ok} ` +
             `${w == null ? "(no size to assert)" : `${r.w}x${r.h} want ${w}x${h}`}`);
  }

  /* a preview laid out as a large card and pointed at a portrait
     photograph is the whole reason the card exists */
  const ratio = meta.ogW / meta.ogH;
  const wide = meta.card === "summary_large_image" && ratio > 1.7 && ratio < 2.1;
  log.push(`${wide ? "PASS" : "FAIL"} card is landscape   ` +
           `${meta.card} ${meta.ogW}x${meta.ogH} ratio=${ratio.toFixed(2)} (want 1.7-2.1)`);

  const same = meta.og === meta.tw;
  log.push(`${same ? "PASS" : "FAIL"} og and twitter agree ${same ? meta.og : meta.og + " vs " + meta.tw}`);

  const described = !!meta.ogAlt && meta.ogAlt.length > 20;
  log.push(`${described ? "PASS" : "FAIL"} card has alt text   ${described ? meta.ogAlt.length + " chars" : "(none)"}`);

  console.log(log.join("\n"));
  await b.close();
  process.exit(log.some(l => l.startsWith("FAIL")) ? 1 : 0);
})();
