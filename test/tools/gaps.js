const { launch, SITE } = require("../browser");
/* The gap either side of the dash, in ems of the row. Rect edges under-
   report the left gap by the tracking that hangs off the name's last
   letter, so the tracking is added back. */
(async()=>{
  const b=await launch();
  for(const [w,h,label] of [[1920,1080,'wide, roster'],[390,844,'phone, roster'],[390,844,'phone, her line']]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(1600);
    const her=label.includes('her');
    const r=await pg.evaluate((her)=>{
      const row=her?document.querySelector('.lead-name'):document.querySelector('.roster li');
      const n=her?null:row.querySelector('.n');
      const d=row.querySelector('.d'), rr=her?row.querySelector('.role'):row.querySelector('.r');
      if(!d||getComputedStyle(d).display==='none') return null;
      const cs=getComputedStyle(row);
      const fs=parseFloat(cs.fontSize), track=parseFloat(cs.letterSpacing);
      const dr=d.getBoundingClientRect(), rrr=rr.getBoundingClientRect();
      let leftEdge;
      if(n) leftEdge=n.getBoundingClientRect().right;
      else { const rg=document.createRange();
             rg.setStart(row.firstElementChild.firstChild,0);
             rg.setEnd(row.firstElementChild.firstChild,row.firstElementChild.firstChild.length);
             leftEdge=[...rg.getClientRects()].pop().right; }
      return {fs, track,
        left:+(((dr.left-leftEdge)+track)/fs).toFixed(3),
        right:+((rrr.left-dr.right)/fs).toFixed(3)};
    }, her);
    console.log(`${label.padEnd(16)} ${r?`gap before ${r.left}em   gap after ${r.right}em   (font ${r.fs}px)`:'dash hidden'}`);
    await ctx.close();
  }
  await b.close();
})();
