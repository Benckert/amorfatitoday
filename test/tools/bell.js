const { launch, SITE } = require("../browser");
const fs=require('fs');
/* Deterministic sampling of the rim animation. animation-delay is no
   use here: on a PAUSED animation Chromium keeps the hold time it
   already had, so every frame came out byte-identical. The Web
   Animations API sets the time itself, which does move it. */
(async()=>{
  const SP=process.env.SP;
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1200);
  const n=await pg.evaluate(()=>{
    window.__rim=[];
    document.querySelectorAll('.jump .ticket .rim rect').forEach(e=>{
      e.getAnimations().forEach(a=>{a.pause();window.__rim.push(a);});});
    return window.__rim.length;
  });
  console.log('animations held:',n);
  if(!n){await b.close();throw new Error('no animation on the rim rects');}
  const geo=await pg.evaluate(()=>{const r=document.querySelector('.jump .ticket').getBoundingClientRect();
    return {x:Math.round(r.left)-4,y:Math.round(r.top)-4,width:Math.round(r.width)+8,height:Math.round(r.height)+8};});
  fs.writeFileSync(SP+'/bell/geo.json',JSON.stringify(geo));
  const STEPS=120, DUR=10000;
  for(let i=0;i<STEPS;i++){
    await pg.evaluate(t=>{window.__rim.forEach(a=>{a.currentTime=t;});},DUR*i/STEPS);
    await pg.screenshot({path:`${SP}/bell/f-${String(i).padStart(3,'0')}.png`,clip:geo});
  }
  await b.close();
  console.log(`${STEPS} phase frames, ${geo.width}x${geo.height} @3x`);
})();
