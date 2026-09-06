const { launch, SITE } = require("../browser");
/* What --figure claims the about figure is, against what it measures.
   The two agreed while the photographs' own 720px was the binding cap;
   higher-resolution sources removed that cap. */
(async () => {
  const b = await launch();
  for (const [w,h] of [[1280,800],[1440,900],[1920,1080],[2560,1440],[3440,1440]]) {
    const ctx = await b.newContext({viewport:{width:w,height:h}});
    const pg = await ctx.newPage();
    await pg.goto(SITE + "/index.html", {waitUntil:"load"});
    await pg.waitForTimeout(1200);
    await pg.evaluate(()=>document.querySelectorAll('.jump a.to')[1].click());
    await pg.waitForTimeout(1400);
    const r = await pg.evaluate(()=>{
      const img=document.querySelector('#about .beside img');
      const cs=getComputedStyle(document.querySelector('#about'));
      const px=v=>{const d=document.createElement('div');d.style.cssText='position:absolute;width:'+v;
        document.body.appendChild(d);const x=d.getBoundingClientRect().width;d.remove();return x;};
      return {real:+img.getBoundingClientRect().width.toFixed(1),
              claimed:+px(cs.getPropertyValue('--figure').trim()).toFixed(1),
              verseLeft:+document.querySelector('#about .hand').getBoundingClientRect().left.toFixed(0)};
    });
    const bad = Math.abs(r.real-r.claimed) > 2;
    console.log(`${(w+'x'+h).padEnd(10)} figure measures ${String(r.real).padStart(6)}  --figure says ${String(r.claimed).padStart(6)}  ${bad?'MISMATCH':'agree'}   verse left ${r.verseLeft}`);
    await ctx.close();
  }
  await b.close();
})();
