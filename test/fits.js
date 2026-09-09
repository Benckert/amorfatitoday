const { launch, SITE } = require("./browser");
(async()=>{const b=await launch();
let bad=0;
/* THE DESKTOP SIZES USED TO BE 1024x768, 1280x800, 1440x900 and
   1920x1080, and every one of them passed while the verse ran a long
   way under the link rail on most of the desktops in between. The three
   that mattered were all roughly 16:10; what overflows is a screen that
   is WIDE AND NOT TALL, because the hand takes min(vw, svh) and the vw
   term keeps growing while the height does not. 1440x800, 1600x900,
   1716x930 and 1920x900 are the shapes a laptop with a dock or a
   browser with tabs and a bookmarks bar actually presents, and they
   were off by 17 to 84px. The short-and-wide row is the point of this
   list, not the round numbers. */
const SIZES=[[320,568],[360,640],[375,704],[390,844],[414,719],[768,1024],[820,1180],
             [844,390],[667,375],[812,375],[736,414],[926,428],[896,414],
             [1024,768],[1280,800],[1440,900],[1920,1080],[600,1400],[1200,500],
             [1250,700],[1280,720],[1366,720],[1440,720],[1440,800],[1512,860],
             [1600,900],[1680,900],[1716,930],[1920,900],[2560,1080],[2560,1440]];
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
