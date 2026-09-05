const { launch, SITE } = require("../browser");
/* How many EMS the widest credit sets in. That number is what the cqw
   coefficient is 100 divided by, so it has to be measured, not guessed. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:1920,height:1080}});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(1800);
  const r=await pg.evaluate(()=>{
    const ul=document.querySelector('.roster');
    const lis=[...document.querySelectorAll('.roster li')];
    const probe=lis[0].cloneNode(true);
    probe.style.cssText='position:absolute;left:-9999px;white-space:nowrap;width:auto;visibility:hidden';
    ul.appendChild(probe);
    const fs=parseFloat(getComputedStyle(lis[0]).fontSize);
    const out=lis.map(li=>{probe.innerHTML=li.innerHTML;
      return [li.querySelector('.n').textContent, +(probe.getBoundingClientRect().width/fs).toFixed(2)];});
    probe.remove();
    out.sort((a,b)=>b[1]-a[1]);
    return {fs, out};});
  console.log('font',r.fs+'px  — widest credits, in ems:');
  r.out.slice(0,5).forEach(([n,e])=>console.log(`   ${String(e).padStart(6)} em  ${n}`));
  console.log('\ncoefficient for cqw = 100 /', r.out[0][1], '=', (100/r.out[0][1]).toFixed(3));
  await b.close();
})();
