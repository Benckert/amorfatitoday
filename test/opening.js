/* THE OPENING SURVIVES A FINGER LANDING ON IT.

   On a cold visit the title waits for its face and then rises, letter
   by letter; until it does, `.js .title .ch` is at opacity 0. The wait
   was gated on a variable the drag also used as its start time — one
   `var` name, one function scope — so a touch inside the first 1 200 ms
   set the gate to a timestamp, every later check read that as "already
   begun", and the headline never arrived at all.

   It only shows up when the face is genuinely late: with the woff2 in
   cache the very first poll succeeds and the rise is already over
   before a finger can land. So the fonts are held back here, which is
   the cold first visit this page is mostly seen on.

   Three cases, all on a fresh context so sessionStorage is empty:
   untouched, touched early, and touched early with the face on time. */
const { launch, SITE } = require("./browser");

const HOLD = 700;          /* ms the woff2 is held back */
const TOUCH_AT = 150;      /* ms after commit that the finger lands */

(async () => {
  const b = await launch();
  const log = [];

  async function visit({ slowFonts, touchEarly }) {
    const ctx = await b.newContext({ viewport: { width: 375, height: 704 },
                                     hasTouch: true, isMobile: true });
    const pg = await ctx.newPage();
    if (slowFonts) await ctx.route("**/*.woff2", async route => {
      await new Promise(r => setTimeout(r, HOLD));
      await route.continue();
    });
    const cdp = await ctx.newCDPSession(pg);
    await pg.goto(SITE + "/index.html", { waitUntil: "commit" });
    if (touchEarly) {
      await pg.waitForTimeout(TOUCH_AT);
      await cdp.send("Input.dispatchTouchEvent",
        { type: "touchStart", touchPoints: [{ x: 180, y: 400 }] });
      await cdp.send("Input.dispatchTouchEvent",
        { type: "touchEnd", touchPoints: [] });
    }
    /* well past the 1 200 ms the rise gives up after */
    await pg.waitForTimeout(HOLD + 2600);
    const seen = await pg.evaluate(() => {
      const ch = document.querySelector(".title .ch");
      return {
        opacity: ch ? Number(getComputedStyle(ch).opacity) : null,
        letters: document.querySelectorAll(".title .ch").length,
        /* the visit is only marked spent once the opening has played */
        spent: (() => { try { return sessionStorage.getItem("amorfati.opening"); }
                        catch (e) { return "err"; } })(),
      };
    });
    await ctx.close();
    return seen;
  }

  const cases = [
    ["face late, untouched", { slowFonts: true, touchEarly: false }],
    ["face late, touched early", { slowFonts: true, touchEarly: true }],
    ["face on time, touched early", { slowFonts: false, touchEarly: true }],
  ];
  for (const [label, opts] of cases) {
    const s = await visit(opts);
    const ok = s.letters > 0 && s.opacity === 1 && s.spent === "1";
    log.push(`${ok ? "PASS" : "FAIL"} title arrives — ${label.padEnd(28)} ` +
             `letters=${s.letters} opacity=${s.opacity} spent=${s.spent}`);
  }

  console.log(log.join("\n"));
  await b.close();
  process.exit(log.some(l => l.startsWith("FAIL")) ? 1 : 0);
})();
