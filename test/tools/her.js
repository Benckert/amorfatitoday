const { launch, SITE } = require("../browser");
/* Where the lit figure lands inside the IMG'S OWN BOX, per layout —
   which is not where she is in the file, because on a phone the
   artists figure is object-fit:cover and object-position moves the
   crop under it. Shot at the element's box so the numbers are
   directly usable as a gradient centre. */
(async()=>{
  const SP=process.env.SP;
  const b=await launch();
  const shots=[['desk',1440,900],['wide',1920,1080],['pad',768,1024],
               ['phone',390,844],['mini',320,568],['land',844,390]];
  for(const [tag,W,H] of shots){
    const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<1100,isMobile:W<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1500);
    for(const [name,sel,section] of [['hero','#amor .shot img',0],
                                     ['artists','#artists .beside img',2]]){
      await pg.evaluate(i=>document.querySelectorAll('.dots button,.jump a.to')[i]&&
        document.querySelectorAll('.dots button').length?document.querySelectorAll('.dots button')[i].click()
        :document.querySelectorAll('.jump a.to')[i].click(), section);
      await pg.waitForTimeout(1300);
      const r=await pg.evaluate(s=>{const e=document.querySelector(s);
        if(!e) return null; const b=e.getBoundingClientRect();
        return {x:Math.round(b.left),y:Math.round(b.top),
                width:Math.round(b.width),height:Math.round(b.height),
                fit:getComputedStyle(e).objectFit,pos:getComputedStyle(e).objectPosition};},sel);
      if(!r||r.width<8||r.height<8){console.log(`${tag} ${name}: not visible`);continue;}
      await pg.screenshot({path:`${SP}/her-${tag}-${name}.png`,
        clip:{x:Math.max(r.x,0),y:Math.max(r.y,0),width:r.width,height:r.height}});
      console.log(`${tag}\t${name}\tbox ${r.width}x${r.height}\t${r.fit} ${r.pos}`);
    }
    await ctx.close();
  }
  await b.close();
})();
