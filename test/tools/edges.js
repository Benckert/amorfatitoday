const { launch, SITE } = require("../browser");
const fs=require('fs');
/* A strip across each figure at mid height, so the step where the
   photograph meets the page's black can be measured rather than
   judged. */
(async()=>{
  const b=await launch();
  const out={};
  for(const [name,w,h,sec,sel] of [['hero',1440,900,0,'#amor .shot img'],
                                   ['artists',1440,900,2,'#artists .beside img'],
                                   ['hero-l',1200,500,0,'#amor .shot img'],
                                   ['artists-l',1200,500,2,'#artists .beside img']]){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1700);
    await pg.evaluate(k=>document.querySelectorAll('.jump a.to')[k].click(),sec);
    await pg.waitForTimeout(1200);
    const r=await pg.evaluate(s=>{const e=document.querySelector(s);
      if(!e) return null; const b=e.getBoundingClientRect();
      return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)};},sel);
    if(!r){ console.log(name,'no image'); await ctx.close(); continue; }
    const strip={x:Math.max(0,r.x-60),y:Math.round(r.y+r.h*0.45),
                 width:Math.min(w-Math.max(0,r.x-60),r.w+120),height:14};
    await pg.screenshot({path:`${process.env.SP}/edge-${name}.png`,clip:strip});
    out[name]={img:r,strip};
    console.log(`${name.padEnd(10)} image ${r.w}x${r.h} at x=${r.x}   strip from x=${strip.x}`);
    await ctx.close();
  }
  fs.writeFileSync(process.env.SP+'/edges.json',JSON.stringify(out));
  await b.close();
})();
