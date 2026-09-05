const { launch, SITE } = require("./browser");
(async()=>{
const b=await launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const pg=await ctx.newPage();
await pg.goto(SITE + '/index.html',{waitUntil:'load'});
await pg.waitForTimeout(2200);
const at=()=>pg.evaluate(()=>[...document.querySelectorAll('.dots button')].findIndex(x=>x.getAttribute('aria-current')==='true'));
const home=async()=>{await pg.evaluate(()=>document.querySelectorAll('.dots button')[0].click());await pg.waitForTimeout(900);};
async function stream(spec){
  await pg.evaluate(async(spec)=>{
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    for(const d of spec){ window.dispatchEvent(new WheelEvent('wheel',{deltaY:d,cancelable:true,bubbles:true})); await sleep(16); }
  },spec);
}
// a trackpad flick: a short push, then a decaying momentum tail
function flick(peak,decay){
  const s=[]; for(let i=1;i<=6;i++) s.push(peak*i/6);
  let d=peak; while(d>0.6){ d*=decay; s.push(d); }
  return s;
}
let bad=0;
async function T(label,spec,want,cmp){
  await home(); await stream(spec); await pg.waitForTimeout(900);
  const got=await at(); const ok=cmp?cmp(got):got===want;
  if(!ok) bad++;
  console.log(`${ok?'PASS':'FAIL'} ${label.padEnd(40)} -> ${got} (${cmp?want:'want '+want})  ${spec.length} ev / ${Math.round(spec.length*16)}ms`);
}
console.log('--- one flick must turn exactly one page ---');
for(const p of [40,140,400,700]) for(const d of [0.955,0.97,0.98])
  await T(`flick peak ${p}, decay ${d}`, flick(p,d), 1);
console.log('--- deliberate second flicks must turn again ---');
await home(); await stream(flick(200,0.97)); await pg.waitForTimeout(400); await stream(flick(200,0.97));
await pg.waitForTimeout(900);
let g=await at(); if(g!==2)bad++; console.log(`${g===2?'PASS':'FAIL'} two flicks 400ms apart                  -> ${g} (want 2)`);
console.log('--- continuous scrolling must never lock ---');
await T('steady 55/ev for 3.5s', Array.from({length:220},()=>55), '>=2', g=>g>=1);
await home();
const t0=Date.now();
await stream(Array.from({length:220},()=>55));
console.log(`   (that stream ran ${Date.now()-t0}ms; ended on section ${await at()})`);
await T('slow steady 18/ev for 3.5s', Array.from({length:220},()=>18), '>=1', g=>g>=1);
await T('varying 30-90/ev for 3.5s', Array.from({length:220},(_,i)=>30+60*Math.abs(Math.sin(i/9))), '>=1', g=>g>=1);
console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
await b.close(); process.exit(bad?1:0);})();
