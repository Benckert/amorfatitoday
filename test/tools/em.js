const { launch, SITE } = require("../browser");
/* The em-widths both lines set in, and the room the column has. The
   headline's em-width changes with its tracking, so it is measured at
   each of the three settings. */
(async()=>{
  const b=await launch();
  for(const [w,h] of [[1920,1080],[1440,900],[1280,800],[768,1024],[390,844],[320,568],[844,390],[667,375]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#about',{waitUntil:'load'});
    await pg.waitForTimeout(1700);
    const r=await pg.evaluate(()=>{
      const lede=document.querySelector('.lede'), hand=document.querySelector('.hand');
      const spans=[...lede.querySelectorAll('span')];
      const blocks=getComputedStyle(spans[0]).display==='block';
      const ext=el=>{const g=document.createRange();g.selectNodeContents(el);
        const rs=[...g.getClientRects()].filter(x=>x.width>0);
        return Math.max(...rs.map(x=>x.right))-Math.min(...rs.map(x=>x.left));};
      const fsH=parseFloat(getComputedStyle(lede).fontSize);
      const fsV=parseFloat(getComputedStyle(hand).fontSize);
      const ps=[...hand.querySelectorAll('p')].slice(0,4);
      const verse=Math.max(...ps.map(p=>p.getBoundingClientRect().width));
      /* the column the verse box may use */
      const col=document.querySelector('#about .verse').getBoundingClientRect().width;
      const lead=blocks?ext(spans[0]):ext(lede);
      return {blocks,fsH:+fsH.toFixed(2),fsV:+fsV.toFixed(2),
              headline:+lead.toFixed(0),verse:+verse.toFixed(0),col:+col.toFixed(0),
              trackH:getComputedStyle(lede).letterSpacing,
              kH:+(lead/fsH).toFixed(3),kV:+(verse/fsV).toFixed(3),
              adv:getComputedStyle(hand).getPropertyValue('--adv').trim()};
    });
    console.log(`${(w+'x'+h).padEnd(10)} ${r.blocks?'2-line':'1-line'} track ${r.trackH.padStart(7)}  `+
      `headline ${String(r.headline).padStart(4)}@${String(r.fsH).padStart(5)} kH ${String(r.kH).padStart(6)}  `+
      `verse ${String(r.verse).padStart(4)}@${String(r.fsV).padStart(5)} kV ${r.kV}  adv ${r.adv}  column ${r.col}`);
    await ctx.close();
  }
  await b.close();
})();
