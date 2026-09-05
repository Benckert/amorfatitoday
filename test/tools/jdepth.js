const { launch, SITE } = require("../browser");
/* How far below the baseline the capital J actually reaches, in ems,
   because whether a rule drawn as a box can clear it is arithmetic and
   not a matter of taste. */
(async()=>{
  const b=await launch();
  const pg=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:4})).newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(2200);
  const r=await pg.evaluate(()=>{
    const a=[...document.querySelectorAll('.roster .n')].find(x=>/LJUNGBERG/i.test(x.textContent));
    const fs=parseFloat(getComputedStyle(a).fontSize);
    const probe=document.createElement('span');
    probe.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
    a.appendChild(probe); const base=probe.getBoundingClientRect().bottom; probe.remove();
    const box=a.getBoundingClientRect();
    return {fs:+fs.toFixed(2), base:+base.toFixed(2),
            top:+box.top.toFixed(2), bottom:+box.bottom.toFixed(2),
            left:+box.left.toFixed(2), right:+box.right.toFixed(2)};
  });
  const clip={x:Math.floor(r.left)-2,y:Math.floor(r.top)-4,
              width:Math.ceil(r.right-r.left)+4,height:Math.ceil(r.bottom-r.top)+14};
  await pg.screenshot({path:process.env.SP+'/jdepth.png',clip});
  console.log(JSON.stringify({...r,clip}));
  await b.close();
})();
