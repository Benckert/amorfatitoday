const { launch, SITE } = require("../browser");
/* The long row against the longest normal one, in the parts that make
   it up — so the scale and the role's size can be chosen rather than
   guessed at. */
(async () => {
  const b = await launch();
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  const pg = await ctx.newPage();
  await pg.goto(SITE + "/index.html#artists", {waitUntil:"load"});
  await pg.waitForTimeout(2200);
  const r = await pg.evaluate(() => {
    const ul = document.querySelector(".roster");
    const lis = [...ul.querySelectorAll("li")];
    const col = document.querySelector(".who-company").getBoundingClientRect().width;
    const probe = lis[0].cloneNode(true);
    probe.style.cssText += ";position:absolute;left:-9999px;white-space:nowrap;width:auto;visibility:hidden";
    ul.appendChild(probe);
    const base = parseFloat(getComputedStyle(lis[0]).fontSize);
    const widthOf = (li, roleScale) => {
      probe.innerHTML = li.innerHTML;
      probe.style.fontSize = base + "px";
      const rr = probe.querySelector(".r");
      if (rr) rr.style.fontSize = roleScale;
      return probe.getBoundingClientRect().width;
    };
    const ink = li => { const g=document.createRange(); g.selectNodeContents(li);
      const rs=[...g.getClientRects()].filter(x=>x.width>0);
      return Math.max(...rs.map(x=>x.right)) - Math.min(...rs.map(x=>x.left)); };
    const long = lis.find(l => l.classList.contains("long"));
    const kris = lis.find(l => /KRISTOFFER/i.test(l.textContent));
    const out = {
      base:+base.toFixed(2), col:+col.toFixed(1),
      kris:+widthOf(kris,"").toFixed(1),
      longAt84:+widthOf(long,"").toFixed(1),
      longAt100:+widthOf(long,"1em").toFixed(1),
      longAt92:+widthOf(long,".92em").toFixed(1),
      /* INK, not the box: a .roster li is a block filling the column,
         so getBoundingClientRect on it returns the column for every
         row and says nothing about how far the words reach. */
      rendered:+ink(long).toFixed(1),
      krisRendered:+ink(kris).toFixed(1),
      scale:parseFloat(getComputedStyle(long).getPropertyValue("--scale")) || 1,
    };
    probe.remove();
    return out;
  });
  const fit = w => (r.kris / w);
  console.log(`base ${r.base}px, column ${r.col}px`);
  console.log(`KRISTOFFER row renders ${r.krisRendered}px  (the longest that fits at full size)`);
  console.log(`SIMON row renders      ${r.rendered}px  — ${(r.krisRendered-r.rendered).toFixed(1)}px short of it\n`);
  console.log(`if the role stays at .84em : row is ${r.longAt84}px at full size -> scale ${fit(r.longAt84).toFixed(3)}, name at ${(fit(r.longAt84)*r.base).toFixed(2)}px`);
  console.log(`if the role goes to .92em  : row is ${r.longAt92}px at full size -> scale ${fit(r.longAt92).toFixed(3)}, name at ${(fit(r.longAt92)*r.base).toFixed(2)}px`);
  console.log(`if the role matches 1em    : row is ${r.longAt100}px at full size -> scale ${fit(r.longAt100).toFixed(3)}, name at ${(fit(r.longAt100)*r.base).toFixed(2)}px`);
  console.log(`\n(the scale in force, ${r.scale}, puts the name at ${(r.scale*r.base).toFixed(2)}px)`);
  await b.close();
})();
