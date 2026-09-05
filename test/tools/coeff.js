const { launch, SITE } = require("../browser");
/* The coefficient is 100 divided by the ems the longest credit sets
   in — but only if the text has the whole container to sit in. Where
   it does not, the shortfall has to come out of the coefficient. This
   measures the largest coefficient each layout can actually take. */
(async()=>{
  const b=await launch();
  let worst=99;
  for(const [w,h] of [[1920,1080],[1440,900],[1280,800],[768,1024],[430,932],[390,844],
                      [375,704],[360,640],[320,568],[844,390],[667,375],[600,1400]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(1800);
    const r=await pg.evaluate(()=>{
      const ul=document.querySelector('.roster'), lis=[...ul.querySelectorAll('li')];
      const cont=document.querySelector('.who-company').getBoundingClientRect().width;
      const avail=lis[0].getBoundingClientRect().width;      /* what the row really has */
      const fs=parseFloat(getComputedStyle(lis[0]).fontSize);
      const probe=lis[0].cloneNode(true);
      probe.style.cssText+=';position:absolute;left:-9999px;white-space:nowrap;width:auto;visibility:hidden';
      ul.appendChild(probe);
      const wid=Math.max(...lis.map(li=>{probe.innerHTML=li.innerHTML;
        return probe.getBoundingClientRect().width;}));
      probe.remove();
      return {cont:+cont.toFixed(1), avail:+avail.toFixed(1), fs:+fs.toFixed(2),
              ems:+(wid/fs).toFixed(2), max:+(100*avail/(wid/fs)/cont*100).toFixed(3)};
    });
    worst=Math.min(worst,r.max);
    console.log(`${(w+'x'+h).padEnd(10)} container ${String(r.cont).padStart(6)}  row ${String(r.avail).padStart(6)}  `+
      `font ${String(r.fs).padStart(5)}  longest ${r.ems}em  max coefficient ${r.max}cqw`);
    await ctx.close();
  }
  console.log(`\nthe smallest of those is ${worst.toFixed(3)}cqw — that is the ceiling for all of them`);
  await b.close();
})();
