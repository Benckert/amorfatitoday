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
let seed=11; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
const J=0.45;   // real trackpad deltas jitter; a smooth curve is not a test
function tail(peak,decay){const s=[];let d=peak;while(d>0.8){d*=decay;s.push(Math.max(1,Math.round(d*(1+(rnd()*2-1)*J))));}return s;}
function flick(peak,decay){const s=[];for(let i=1;i<=6;i++)s.push(Math.round(peak*i/6));return s.concat(tail(peak,decay));}
// a flick, then a small unintended continuation partway down its tail
function nudged(peak,decay,nudgePeak,atEvent){
  const f=flick(peak,decay); const out=f.slice(0,atEvent);
  const rest=f.slice(atEvent);
  const n=[]; for(let i=1;i<=4;i++) n.push(nudgePeak*i/4);
  // the nudge rides on top of what the tail is already delivering
  for(let i=0;i<n.length;i++) out.push(n[i]+(rest[i]||0));
  return out.concat(rest.slice(n.length));
}
let bad=0;
async function T(label,spec,want,cmp){
  await home(); await stream(spec); await pg.waitForTimeout(900);
  const got=await at(); const ok=cmp?cmp(got):got===want;
  if(!ok) bad++;
  console.log(`${ok?'PASS':'FAIL'} ${label.padEnd(44)} -> ${got} (want ${want})`);
}
console.log('--- one flick stays one, however hard ---');
for(const p of [40,140,400,700]) await T(`flick peak ${p}`, flick(p,0.97), 1);
console.log('--- an accidental nudge on the tail must NOT turn again ---');
await T('flick 200 + nudge 40 at ev 20',  nudged(200,0.97,40,20), 1);
await T('flick 200 + nudge 70 at ev 35',  nudged(200,0.97,70,35), 1);
await T('flick 200 + nudge 100 at ev 55', nudged(200,0.97,100,55), 1);
await T('flick 400 + nudge 90 at ev 40',  nudged(400,0.97,90,40), 1);
console.log('--- a deliberate second flick must still turn ---');
// Under ~500ms the second throw overlaps the first too heavily for the
// envelope to have turned. One turn there is the deliberate answer.
for(const [gapEv,label,want] of [[30,'300ms later (overlapping)',1],[45,'500ms later',2],[60,'700ms later',2],[70,'900ms later',2],[90,'1300ms later',2]]){
  const f=flick(200,0.97); const spec=f.slice(0,gapEv).concat(flick(200,0.97));
  await T(`flick 200, then a full flick ${label}`, spec, want);
}
console.log('--- continuous scrolling still never locks ---');
await T('steady 55/ev for 3.5s',  Array.from({length:220},()=>55), '>=1', g=>g>=1);
await T('steady 18/ev for 4.5s',  Array.from({length:280},()=>18), '>=1', g=>g>=1);
console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
await b.close(); process.exit(bad?1:0);})();
