const { launch, SITE } = require("./browser");
(async()=>{const b=await launch();
let bad=0;
const SIZES=[[320,568],[360,640],[375,704],[390,844],[414,719],[768,1024],[820,1180],
             [844,390],[667,375],[812,375],[736,414],[926,428],[896,414],
             [1024,768],[1280,800],[1440,900],[1920,1080],[600,1400],[1200,500]];
for(const [w,h] of SIZES){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
 const pg=await ctx.newPage();
 const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto(SITE + '/index.html',{waitUntil:'load'});
 await pg.waitForTimeout(2000);
 // the title is split into per-letter spans, so count distinct baselines
 const titleLines=await pg.evaluate(()=>{
   const tops=new Set([...document.querySelectorAll('.title .ch')].map(s=>Math.round(s.getBoundingClientRect().top)));
   return tops.size ? new Set([...tops].map(t=>Math.round(t/8))).size : 1;});
 await pg.evaluate(()=>document.querySelectorAll('.dots button')[1].click());
 await pg.waitForTimeout(900);
 const about=await pg.evaluate(()=>{
   const p=document.getElementById('about').getBoundingClientRect();
   const v=document.querySelector('.hand').getBoundingClientRect();
   const r=document.querySelector('.jump').getBoundingClientRect();
   const f=document.querySelector('#about .beside img').getBoundingClientRect();
   return {top:Math.round(p.top-v.top),bottom:Math.round(v.bottom-p.bottom),
           right:Math.round(v.right-p.right),rail:Math.round(r.top-v.bottom),
           overFigure:Math.round(v.right-f.left)};});
 await pg.evaluate(()=>document.querySelectorAll('.dots button')[2].click());
 await pg.waitForTimeout(900);
 const art=await pg.evaluate(()=>{
   const p=document.getElementById('artists').getBoundingClientRect();
   const ro=document.querySelector('.roster').getBoundingClientRect();
   const ln=document.querySelector('.lead-name').getBoundingClientRect();
   return {rosterBottom:Math.round(ro.bottom-p.bottom),leadTop:Math.round(p.top-ln.top)};});
 const spills=[];
 if(about.top>1) spills.push('verse above panel '+about.top);
 if(about.bottom>1) spills.push('verse below panel '+about.bottom);
 if(about.right>1) spills.push('verse past right '+about.right);
 if(about.rail<0) spills.push('verse under rail '+about.rail);
 if(art.rosterBottom>1) spills.push('roster below panel '+art.rosterBottom);
 const ok = titleLines===1 && spills.length===0 && errs.length===0;
 if(!ok) bad++;
 console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} title ${titleLines}ln  verse->rail ${String(about.rail).padStart(4)}  verse vs figure ${String(about.overFigure).padStart(5)}  ${spills.length?'SPILL: '+spills.join('; '):'clean'}${errs.length?'  ERR '+errs[0]:''}`);
 await ctx.close();}
await b.close();
console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
process.exit(bad?1:0);})();
