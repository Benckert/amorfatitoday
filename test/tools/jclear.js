const { launch, SITE } = require("../browser");
/* ELIAS LJUNGBERG is the one name in the roster with a descending
   capital, and the rule under it passes exactly where the J's tail
   goes. Shot at dpr 3 so the clearance can be counted in pixels. */
(async()=>{
  const SP=process.env.SP;
  const b=await launch();
  const sizes=[[1920,1080],[1440,900],[1280,800],[768,1024],[390,844],[320,568]];
  for(const [w,h] of sizes){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100,deviceScaleFactor:3});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(2000);
    const box=await pg.evaluate(()=>{
      const a=[...document.querySelectorAll('.roster a.n')].find(x=>/LJUNGBERG/i.test(x.textContent));
      const r=a.getBoundingClientRect();
      return {x:Math.floor(r.left),y:Math.floor(r.top),
              width:Math.ceil(r.width),height:Math.ceil(r.height)+8};});
    await pg.screenshot({path:`${SP}/jc-${w}.png`,clip:box});
    await ctx.close();
  }
  await b.close(); console.log(sizes.map(s=>s[0]).join(' '));
})();
