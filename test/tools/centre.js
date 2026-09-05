const { launch, SITE } = require("../browser");
const fs=require('fs');
/* Does the poem sit centred between the screen's edge and her shirt?
   The shirt is found in the RENDERED pixels — bright and nearly
   neutral, which is the cotton and not the warm streaks across it —
   rather than trusted from the formula that positions the block. */
(async()=>{
  const b=await launch();
  const SIZES=[[1280,800],[1366,768],[1440,900],[1600,900],[1680,1050],[1920,1080],
               [2560,1440],[1280,1024],[1400,1050],[1300,760]];
  const out=[];
  for(const [w,h] of SIZES){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#about',{waitUntil:'load'});
    await pg.waitForTimeout(1800);
    const geo=await pg.evaluate(()=>{
      const ps=[...document.querySelectorAll('.hand p')].slice(0,4);
      const l=Math.min(...ps.map(p=>p.getBoundingClientRect().left));
      const r=Math.max(...ps.map(p=>p.getBoundingClientRect().right));
      const cs=getComputedStyle(document.querySelector('#about'));
      return {left:Math.round(l),right:Math.round(r),
              padLeft:cs.paddingLeft, shirtCalc:cs.getPropertyValue('--shirt')};
    });
    await pg.screenshot({path:`${process.env.SP}/c-${w}x${h}.png`});
    out.push([w,h,geo]);
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(process.env.SP+'/centre.json',JSON.stringify(out));
  console.log('measured');
})();
