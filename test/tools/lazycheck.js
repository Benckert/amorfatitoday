const { launch, SITE } = require("../browser");
/* Does loading="lazy" actually defer anything here? The deck keeps
   every section in the document and moves them with a transform, which
   is exactly the case where the browser's idea of "off screen" and
   yours can differ. So this counts what is fetched before a turn, and
   what a turn adds. */
(async()=>{
  const b=await launch();
  for(const [tag,w,h] of [['phone',390,844],['desk',1440,900]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100});
    const pg=await ctx.newPage();
    const got=[];
    pg.on('response',r=>{if(r.request().resourceType()==='image')
      got.push(r.url().split('/').pop());});
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(2500);
    const atLoad=[...got];
    await pg.evaluate(()=>{const d=document.querySelectorAll('.dots button');
      if(d.length&&getComputedStyle(d[0].parentElement).display!=='none') d[1].click();
      else document.querySelectorAll('.jump a.to')[1].click();});
    await pg.waitForTimeout(1800);
    await pg.evaluate(()=>{const d=document.querySelectorAll('.dots button');
      if(d.length&&getComputedStyle(d[0].parentElement).display!=='none') d[2].click();
      else document.querySelectorAll('.jump a.to')[2].click();});
    await pg.waitForTimeout(1800);
    console.log(`${tag.padEnd(6)} at first paint: ${atLoad.join(', ')||'(none)'}`);
    console.log(`       after two turns: ${got.join(', ')}`);
    await ctx.close();
  }
  await b.close();
})();
