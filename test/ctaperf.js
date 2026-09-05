const { launch, SITE } = require("./browser");
/* Frames delivered through a page turn, with the frosted button on
   screen. This stylesheet already carries a 16fps scar from putting a
   backdrop-filter under a moving page, so the question is measured
   rather than argued. */
(async()=>{
  const b=await launch();
  for(const label of ['with the frost','frost removed']){
    const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1600);
    if(label==='frost removed') await pg.evaluate(()=>{
      const st=document.createElement('style');
      st.textContent='.jump .ticket{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}';
      document.head.appendChild(st);});
    const fps=await pg.evaluate(async()=>{
      const frames=[];
      let stop=false;
      const tick=t=>{frames.push(t); if(!stop) requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
      document.querySelectorAll('.dots button')[1].click();
      await new Promise(r=>setTimeout(r,1000));
      stop=true;
      const gaps=[];
      for(let i=1;i<frames.length;i++) gaps.push(frames[i]-frames[i-1]);
      gaps.sort((a,b)=>a-b);
      return {n:frames.length,
              median:+gaps[Math.floor(gaps.length/2)].toFixed(1),
              worst:+gaps[gaps.length-1].toFixed(1)};
    });
    console.log(`${label.padEnd(15)} ${fps.n} frames in 1s  median gap ${fps.median}ms `+
                `(${Math.round(1000/fps.median)}fps)  worst ${fps.worst}ms`);
    await ctx.close();
  }
  await b.close();
})();
