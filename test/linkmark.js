const { launch, SITE } = require("./browser");
/* WHICH NAMES LINK, AND HOW THAT IS SAID. It has been an underline (in
   three mechanisms), a dot, and a step back on the rows without a
   page; it is a tick in the margin now. So this checks the mechanism
   as well as the result: every link carries one and no plain name
   does, the class in the markup agrees with the link on every row,
   the tick is centred on the capitals, and — the thing a margin mark
   can get wrong that an underline cannot — it is inside the panel
   rather than off the edge of the screen. */
(async()=>{
  const b=await launch();
  let bad=0;
  for(const [w,h] of [[1920,1080],[1440,900],[768,1024],[430,932],[390,844],[320,568],[844,390]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(1900);
    const r=await pg.evaluate(()=>{
      const rows=[...document.querySelectorAll('.roster li')];
      const links=rows.map(li=>li.querySelector('a.n')).filter(Boolean);
      const plain=rows.map(li=>li.querySelector('span.n')).filter(Boolean);
      const tick=e=>{const c=getComputedStyle(e,'::before');
        return {w:parseFloat(c.width)||0, h:parseFloat(c.height)||0, bg:c.backgroundColor};};
      const has=e=>{const t=tick(e);
        return t.w>0 && t.h>0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(t.bg);};
      const marked=links.filter(has).length, plainMarked=plain.filter(has).length;
      /* the class in the markup has to agree with the link on every row */
      const mismatch=rows.filter(li=>
        !!li.querySelector('a.n') === li.classList.contains('nolink')).length;
      const a=links[0], fs=parseFloat(getComputedStyle(a).fontSize);
      const box=a.getBoundingClientRect(), t=tick(a);
      const probe=document.createElement('span');
      probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
      a.appendChild(probe); const base=probe.getBoundingClientRect().bottom; probe.remove();
      const left=box.left-0.78*fs;
      const mid=box.bottom-(0.63-0.65)*fs-t.h/2;   /* the tick's own middle */
      return {fs:+fs.toFixed(2), rows:rows.length, links:links.length, plain:plain.length,
              marked, plainMarked, mismatch,
              tw:+t.w.toFixed(2), th:+t.h.toFixed(2), thEm:+(t.h/fs).toFixed(2),
              edge:+left.toFixed(1), gap:+(box.left-(left+t.w)).toFixed(1),
              capOff:+((base-0.3125*fs)-mid).toFixed(2),
              noBorder:parseFloat(getComputedStyle(a).borderBottomWidth)===0};
    });
    const ok = r.marked===r.links && r.plainMarked===0 && r.mismatch===0
            && r.links+r.plain===r.rows && r.tw>=1 && r.thEm>1.1 && r.thEm<1.5
            && r.edge>=2 && r.gap>=3 && Math.abs(r.capOff)<=1.2 && r.noBorder;
    if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(9)} tick ${r.tw}x${r.th}px (${r.thEm}em)  `+
      `${r.marked}/${r.links} links, ${r.plainMarked}/${r.plain} plain, ${r.mismatch} mismatched; `+
      `left edge x=${r.edge}, ${r.gap}px before the name, ${r.capOff}px off the cap middle`);
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
})();
