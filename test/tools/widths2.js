const { launch, SITE } = require("../browser");
/* Rendered width of the WHOLE row -- name, dash and role -- measured in
   place with the real face, tracking and capitals, because letter count
   and rendered width disagree once those are applied. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(2200);
  const r=await pg.evaluate(()=>{
    const lis=[...document.querySelectorAll('.roster li')];
    const probe=lis[0].cloneNode(true);
    probe.style.cssText='position:absolute;left:-9999px;white-space:nowrap;width:auto;visibility:hidden';
    lis[0].parentNode.appendChild(probe);
    const out=lis.map(li=>{
      probe.innerHTML=li.innerHTML;
      return [li.querySelector('.n').textContent, li.querySelector('.r').textContent,
              +probe.getBoundingClientRect().width.toFixed(1)];});
    probe.remove();
    return out;});
  console.log('as written, top to bottom:');
  r.forEach(([n,role,w],i)=>console.log(`  ${String(i+1).padStart(2)}. ${String(w).padStart(6)}px  ${n} — ${role}`));
  const sorted=[...r].sort((a,b)=>a[2]-b[2]);
  const same=sorted.every((x,i)=>x[0]===r[i][0]);
  console.log(same?'\nALREADY shortest to longest':'\nsorted by rendered width:');
  if(!same) sorted.forEach(([n,role,w],i)=>console.log(`  ${String(i+1).padStart(2)}. ${String(w).padStart(6)}px  ${n} — ${role}`));
  await b.close();
})();
