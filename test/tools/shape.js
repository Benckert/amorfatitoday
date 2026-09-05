const { launch, SITE } = require("../browser");
const fs=require('fs');
/* Phase frames at a given size, plus the pill's own geometry, so the
   speed can be read against WHERE ON THE OUTLINE the light is rather
   than against how far through the lap it is. */
(async()=>{
  const SP=process.env.SP, W=+process.argv[2], H=+process.argv[3], tag=process.argv[4];
  const dir=`${SP}/shape-${tag}`; fs.mkdirSync(dir,{recursive:true});
  for(const f of fs.readdirSync(dir)) fs.unlinkSync(`${dir}/${f}`);
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<1100,isMobile:W<1100,deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1400);
  const n=await pg.evaluate(()=>{window.__rim=[];
    document.querySelectorAll('.jump .ticket .rim rect').forEach(e=>
      e.getAnimations().forEach(a=>{a.pause();window.__rim.push(a);}));
    return window.__rim.length;});
  if(!n){await b.close();throw new Error('no animation on the rim rects');}
  const geo=await pg.evaluate(()=>{const r=document.querySelector('.jump .ticket').getBoundingClientRect();
    return {x:Math.round(r.left)-4,y:Math.round(r.top)-4,
            width:Math.round(r.width)+8,height:Math.round(r.height)+8,
            pillW:+r.width.toFixed(2),pillH:+r.height.toFixed(2)};});
  fs.writeFileSync(`${dir}/geo.json`,JSON.stringify(geo));
  const STEPS=120, DUR=10000;
  for(let i=0;i<STEPS;i++){
    await pg.evaluate(t=>{window.__rim.forEach(a=>{a.currentTime=t;});},DUR*i/STEPS);
    await pg.screenshot({path:`${dir}/f-${String(i).padStart(3,'0')}.png`,clip:geo});
  }
  await b.close();
  console.log(`${tag}: ${STEPS} phases, pill ${geo.pillW}x${geo.pillH}`);
})();
