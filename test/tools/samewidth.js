const { launch, SITE } = require("../browser");
(async()=>{
  const b=await launch();
  for(const [w,h] of [[1280,800],[1366,768],[1440,900],[1680,1050],[1920,1080],[2560,1440]]){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1500);
    const hero=await pg.evaluate(()=>{const r=document.querySelector('#amor .shot img').getBoundingClientRect();
      return [+r.width.toFixed(1),+r.height.toFixed(1)];});
    await pg.evaluate(()=>document.querySelectorAll('.jump a.to')[2].click());
    await pg.waitForTimeout(1400);
    const art=await pg.evaluate(()=>{const r=document.querySelector('#artists .beside img').getBoundingClientRect();
      return [+r.width.toFixed(1),+r.height.toFixed(1)];});
    console.log(`${(w+'x'+h).padEnd(10)} hero ${hero[0]}x${hero[1]}   artists ${art[0]}x${art[1]}   `+
      `${Math.abs(hero[0]-art[0])<0.6?'SAME width':'DIFFERENT ('+(art[0]-hero[0]).toFixed(1)+'px)'}`);
    await ctx.close();
  }
  await b.close();
})();
