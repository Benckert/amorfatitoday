const { launch, SITE } = require("./browser");
/* Ten turns per condition, counting frames longer than 20ms. Single
   runs in this container are noisy enough to argue either way, so the
   comparison is a distribution and the control is the same page with
   the ring removed. */
(async()=>{
  const b=await launch();
  const trial=async(kill,W,H)=>{
    const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<1100,isMobile:W<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1300);
    if(kill) await pg.evaluate(()=>{const st=document.createElement('style');
      st.textContent='.jump .ticket .rim{display:none!important}';document.head.appendChild(st);});
    const drops=[];
    for(let k=0;k<10;k++){
      const d=await pg.evaluate(async(i)=>{
        const f=[]; let stop=false;
        const tick=t=>{f.push(t); if(!stop) requestAnimationFrame(tick);};
        requestAnimationFrame(tick);
        document.querySelectorAll('.dots button')[i%3].click();
        await new Promise(r=>setTimeout(r,900));
        stop=true;
        let late=0;
        for(let j=1;j<f.length;j++) if(f[j]-f[j-1]>20) late++;
        return late;
      },k);
      drops.push(d);
      await pg.waitForTimeout(400);
    }
    await ctx.close();
    return drops;
  };
  const sum=a=>a.reduce((x,y)=>x+y,0);
  /* both shapes now: the ring used to be on the touch screens only */
  for(const [tag,W,H] of [['phone  390x844',390,844],['desktop 1440x900',1440,900]]){
    const withRim=await trial(false,W,H);
    const without=await trial(true,W,H);
    const diff=sum(withRim)-sum(without);
    console.log(`${tag}`);
    console.log('  turns with the ring:   ', withRim.join(' '), ' total late frames', sum(withRim));
    console.log('  turns with it removed: ', without.join(' '), ' total late frames', sum(without));
    console.log(`  difference over 10 turns each: ${diff>=0?'+':''}${diff} late frames  `+
      `${Math.abs(diff)<=2?'— the ring costs nothing measurable':'— the ring is costing frames'}\n`);
  }
  await b.close();
})();
