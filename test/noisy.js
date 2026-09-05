const { launch, SITE } = require("./browser");
(async()=>{
const b=await launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const pg=await ctx.newPage();
await pg.goto(SITE + '/index.html',{waitUntil:'load'});
await pg.waitForTimeout(2200);
const at=()=>pg.evaluate(()=>[...document.querySelectorAll('.dots button')].findIndex(x=>x.getAttribute('aria-current')==='true'));
const home=async()=>{await pg.evaluate(()=>document.querySelectorAll('.dots button')[0].click());await pg.waitForTimeout(900);};
async function stream(spec){await pg.evaluate(async(spec)=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for(const d of spec){window.dispatchEvent(new WheelEvent('wheel',{deltaY:d,cancelable:true,bubbles:true}));await sleep(16);}},spec);}
let seed=7; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
// a real trackpad's deltas are quantised and jittery, not a smooth curve
function flick(peak,decay,noise){
  const s=[]; for(let i=1;i<=6;i++) s.push(Math.round(peak*i/6));
  let d=peak;
  while(d>0.8){ d*=decay; s.push(Math.max(1,Math.round(d*(1+(rnd()*2-1)*noise)))); }
  return s;
}
let bad=0;
for(const noise of [0.35,0.5,0.65]){
  for(const p of [140,400]){
    let turns=[];
    for(let trial=0;trial<3;trial++){
      await home(); await stream(flick(p,0.97,noise)); await pg.waitForTimeout(900);
      turns.push(await at());
    }
    const ok=turns.every(t=>t===1); if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} peak ${String(p).padStart(3)}  jitter +/-${Math.round(noise*100)}%  -> turns ${turns.join(',')} (want 1,1,1)`);
  }
}
console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
await b.close();})();
