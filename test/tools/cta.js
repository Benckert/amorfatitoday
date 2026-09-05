const { launch, SITE } = require("../browser");
/* The button over each section's foot, on a phone, plus the luminance
   of what is actually behind it. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1700);
  for(let i=0;i<3;i++){
    await pg.evaluate(k=>document.querySelectorAll('.dots button')[k].click(),i);
    await pg.waitForTimeout(1500);
    const box=await pg.evaluate(()=>{const r=document.querySelector('.jump .ticket').getBoundingClientRect();
      return {x:Math.round(r.left)-26,y:Math.round(r.top)-20,
              width:Math.round(r.width)+52,height:Math.round(r.height)+40};});
    await pg.screenshot({path:`${process.env.SP}/cta-s${i}.png`,clip:box});
  }
  await b.close(); console.log('done');
})();
