const { launch, SITE } = require("../browser");
/* Which width each screen actually asks for, and what the page costs
   because of it. srcset is only worth having if the choices are right. */
(async () => {
  const b = await launch();
  const cases = [["phone dpr3", 390, 844, 3], ["phone dpr2", 390, 844, 2],
                 ["big phone dpr3", 430, 932, 3], ["tablet dpr2", 768, 1024, 2],
                 ["laptop dpr1", 1440, 900, 1], ["laptop dpr2", 1440, 900, 2],
                 ["desktop dpr1", 1920, 1080, 1]];
  for (const [tag, w, h, dpr] of cases) {
    const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:w<1100,
                                     isMobile:w<1100, deviceScaleFactor:dpr });
    const pg = await ctx.newPage();
    let bytes = 0; const got = [];
    pg.on("response", async r => {
      if (r.request().resourceType() !== "image") return;
      got.push(r.url().split("/").pop());
      try { bytes += (await r.body()).length; } catch (e) {}
    });
    await pg.goto(SITE + "/index.html", { waitUntil: "load" });
    await pg.waitForTimeout(2200);
    for (const i of [1, 2]) {
      await pg.evaluate(i => { const d = document.querySelectorAll(".dots button");
        if (d.length && getComputedStyle(d[0].parentElement).display !== "none") d[i].click();
        else document.querySelectorAll(".jump a.to")[i].click(); }, i);
      await pg.waitForTimeout(1400);
    }
    console.log(`${tag.padEnd(15)} ${String(w).padStart(4)}x${h} @${dpr}  ${(bytes/1024).toFixed(0).padStart(4)} KB  ${got.join(", ")}`);
    await ctx.close();
  }
  await b.close();
})();
