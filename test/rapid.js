const { launch, SITE } = require("./browser");
(async()=>{
const b=await launch();
const ctx=await b.newContext({viewport:{width:375,height:704},hasTouch:true,isMobile:true});
const pg=await ctx.newPage();
await pg.goto(SITE + '/index.html',{waitUntil:'load'});
await pg.waitForTimeout(2200);
const cdp=await ctx.newCDPSession(pg);
const at=()=>pg.evaluate(()=>[...document.querySelectorAll('.dots button')].findIndex(x=>x.getAttribute('aria-current')==='true'));
async function swipe(dy,steps){let y=400;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y}]});
  for(let i=1;i<=steps;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:y+dy*i/steps}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
const t0=Date.now();
await swipe(-300,4); await pg.waitForTimeout(140); await swipe(-300,4);
await pg.waitForTimeout(700);
console.log(`two swipes 140ms apart -> section ${await at()} (want 2), settled after ${Date.now()-t0}ms`);
// back to 0, then three in a row
await pg.evaluate(()=>document.querySelectorAll('.dots button')[0].click());
await pg.waitForTimeout(600);
await swipe(-300,4); await pg.waitForTimeout(90); await swipe(-300,4); await pg.waitForTimeout(90); await swipe(-300,4);
await pg.waitForTimeout(700);
console.log(`three swipes 90ms apart -> section ${await at()} (want 2, clamped at the end)`);
// a single swipe must still be one section
await pg.evaluate(()=>document.querySelectorAll('.dots button')[0].click());
await pg.waitForTimeout(700);
await swipe(-300,4); await pg.waitForTimeout(800);
console.log(`one swipe -> section ${await at()} (want 1)`);
const err=await pg.evaluate(()=>({tops:[...document.querySelectorAll('.panel')].map(p=>Math.round(p.getBoundingClientRect().top))}));
console.log('tops',err.tops.join('/'));
await b.close();})();
