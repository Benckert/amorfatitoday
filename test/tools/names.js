const { launch, SITE } = require("../browser");
(async()=>{
  const b=await launch();
  const pg=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(2200);
  const r=await pg.evaluate(()=>[...document.querySelectorAll('.roster .n')].map(n=>{
    const g=document.createRange(); g.selectNodeContents(n);
    const rects=[...g.getClientRects()];
    return [n.textContent, n.textContent.length,
            +(Math.max(...rects.map(x=>x.right))-Math.min(...rects.map(x=>x.left))).toFixed(1)];}));
  r.sort((a,b)=>a[1]-b[1]||a[2]-b[2]);
  r.forEach(([n,c,w])=>console.log(`  ${String(c).padStart(2)} chars  ${String(w).padStart(6)}px  ${n}`));
  await b.close();
})();
