// The iOS trap: the LAYOUT viewport (what a fixed body sizes to) is taller
// than the VISUAL viewport (what --screen measures) by the height of the
// browser's toolbars. If anything in the deck is sized from --screen while
// the clipping box is the layout viewport, the next section sits in the gap
// and shows through. Headless Chromium has no toolbar, so the two are equal
// and the bug cannot appear on its own — it is forced here.
const { launch, SITE } = require("./browser");
(async()=>{const b=await launch();
let bad=0;
for(const [w,h,screen] of [[393,852,580],[375,704,530],[414,896,610],[390,844,600],[360,780,540],[320,568,410]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
 /* Shorten the visual viewport at the source, the way a toolbar does,
    rather than writing --screen from outside: the page's own JS reads
    visualViewport, and a variable poked in afterwards leaves that
    reading alone. */
 await ctx.addInitScript(v=>{
   Object.defineProperty(window.visualViewport,'height',{get:()=>v,configurable:true});
 }, screen);
 const pg=await ctx.newPage();
 await pg.goto(SITE + '/index.html',{waitUntil:'load'});
 await pg.waitForTimeout(1600);

 await pg.waitForTimeout(250);
 const r=await pg.evaluate(()=>{
   const ps=[...document.querySelectorAll('.panel')];
   return {body:Math.round(document.body.getBoundingClientRect().height),
           deck:Math.round(document.getElementById('deck').getBoundingClientRect().height),
           panel:Math.round(ps[0].getBoundingClientRect().height),
           second:Math.round(ps[1].getBoundingClientRect().top),
           vh:innerHeight};});
 // three things, all of which must hold:
 const covers  = r.panel>=r.vh;              // a section covers the whole screen
 const clipped = r.second>=r.body-1;         // the next one cannot show through
 const unmoved = r.deck===r.vh;              // --screen changed nothing
 await pg.evaluate(()=>document.querySelectorAll('.dots button')[2].click());
 await pg.waitForTimeout(900);
 const lands=await pg.evaluate(()=>Math.round(document.getElementById('artists').getBoundingClientRect().top));
 const steps = lands===0;
 const ok = covers&&clipped&&unmoved&&steps;
 if(!ok) bad++;
 const why=[!covers&&'section shorter than the screen',!clipped&&'section 2 shows through',
            !unmoved&&'--screen still sizes something',!steps&&'deck will not step'].filter(Boolean);
 console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(9)} --screen ${screen}: body ${r.body} deck ${r.deck} section ${r.panel} next at ${r.second}${ok?'':'   <<< '+why.join('; ')}`);
 await ctx.close();}
await b.close();
console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
process.exit(bad?1:0);})();
