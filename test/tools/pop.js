const { launch, SITE } = require("../browser");
/* Frames of the rule as it grows, cropped to the line itself. If it
   "pops" at full width the last frame will differ in thickness or
   brightness from the ones before it by more than the width change. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1600);
  const box=await pg.evaluate(()=>{
    const a=document.querySelector('.jump a.to[href="#artists"]').getBoundingClientRect();
    return {x:Math.round(a.left)-4,y:Math.round(a.bottom)-6,
            width:Math.round(a.width)+8,height:12};});
  await pg.hover('.jump a.to[href="#artists"]');
  for(const t of [80,160,240,320,400,500,700,1200]){
    await pg.waitForTimeout(t===80?80:t-(t===160?80:t===240?160:t===320?240:t===400?320:t===500?400:t===700?500:700));
    await pg.screenshot({path:`${process.env.SP}/pop-${t}.png`,clip:box});
  }
  await b.close(); console.log('frames captured');
})();
