const { launch, SITE } = require("./browser");
/* What the rail actually occupies, against the --rail token that
   reserves room for it. */
(async()=>{
  const b=await launch();
  let bad=0;
  for(const [w,h] of [[320,568],[360,640],[375,704],[390,844],[430,932],[600,1400],
                      [768,1024],[820,1180],[1024,768],[1152,864],[1200,500],
                      [844,390],[667,375],[1280,800],[1920,1080]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1241,isMobile:w<1241});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1400);
    const r=await pg.evaluate(()=>{
      const j=document.querySelector('.jump').getBoundingClientRect();
      const t=document.querySelector('.jump .ticket').getBoundingClientRect();
      /* --rail has to be RESOLVED through a probe: a custom property
         comes back as the text it was written as, so clamp(...) reads
         as a string and parseFloat gives NaN. */
      const probe=document.createElement('div');
      probe.style.cssText='position:absolute;visibility:hidden;height:var(--rail)';
      document.body.appendChild(probe);
      const token=probe.getBoundingClientRect().height; probe.remove();
      return {rail:Math.round(innerHeight-j.top), ticket:Math.round(t.height),
              token:Math.round(token),
              fs:getComputedStyle(document.querySelector('.jump')).fontSize};
    });
    const tok=r.token, ok=tok>=r.rail;
    if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} rail occupies ${String(r.rail).padStart(3)}px  `+
      `--rail reserves ${String(tok).padStart(3)}px  ${ok?'covered, slack '+(tok-r.rail):'SHORT by '+(r.rail-tok)}   `+
      `ticket ${r.ticket} @${r.fs}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
