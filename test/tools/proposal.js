const { launch, SITE } = require("../browser");
(async()=>{
const b=await launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const pg=await ctx.newPage();
await pg.goto(SITE + '/index.html',{waitUntil:'load'});
await pg.waitForTimeout(2200);
// Replace the page's wheel handling with the proposed model:
// one scroll above a threshold turns a slide; everything is ignored
// until the animation finishes; then the check resets.
await pg.evaluate(()=>{
  window.__turns=0;
  const GLIDE=620, THRESHOLD=24;
  let busy=false, spin=0;
  window.addEventListener('wheel',e=>{
    e.preventDefault();
    if(busy) return;                       // ignored while animating
    spin+=e.deltaY;
    if(Math.abs(spin)<THRESHOLD) return;
    spin=0; busy=true; window.__turns++;
    setTimeout(()=>{ busy=false; spin=0; }, GLIDE);   // reset when done
  },{passive:false,capture:true});
},{});
async function stream(spec){
  await pg.evaluate(async(spec)=>{
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    for(const d of spec){ window.dispatchEvent(new WheelEvent('wheel',{deltaY:d,cancelable:true,bubbles:true})); await sleep(16); }
  },spec);
}
function flick(peak,decay){const s=[];for(let i=1;i<=6;i++)s.push(peak*i/6);let d=peak;while(d>0.6){d*=decay;s.push(d);}return s;}
for(const [p,dc] of [[40,0.955],[140,0.955],[400,0.955],[140,0.97],[400,0.97]]){
  await pg.evaluate(()=>window.__turns=0);
  await stream(flick(p,dc));
  await pg.waitForTimeout(300);
  const t=await pg.evaluate(()=>window.__turns);
  console.log(`  one flick peak ${String(p).padStart(3)} decay ${dc}  ->  ${t} page turn${t===1?'':'s'}${t>1?'   <-- double':''}`);
}
await b.close();})();
