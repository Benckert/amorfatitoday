const { launch, SITE } = require("../browser");
(async()=>{
  const b=await launch();
  for(const [name,w,h] of JSON.parse(process.env.SHOTS)){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    const pg=await ctx.newPage();
    await pg.addInitScript(()=>{
      const st=document.createElement('style');
      st.textContent=`#artists .beside{display:none!important}
        [data-reveal]{opacity:1!important;transform:none!important;transition:none!important}`;
      document.addEventListener('DOMContentLoaded',()=>document.head.appendChild(st));
    });
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(1600);
    const box=await pg.evaluate(()=>{
      const r=document.querySelector('.who-lead').getBoundingClientRect();
      return {x:Math.round(r.left),y:Math.round(r.top)-24,
              width:Math.round(r.width),height:Math.round(r.height)+48};
    });
    await pg.screenshot({path:`${process.env.SP}/L-${name}.png`,clip:box});
    console.log(name,JSON.stringify(box));
    await ctx.close();
  }
  await b.close();
})();
