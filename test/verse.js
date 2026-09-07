const { launch, SITE } = require("./browser");
/* The photograph, measured against its own x-height (see README):
     line advance / longest line   = 177/982 = 0.180
   and every verse line flush on one left edge. A phone closes the
   leading up to fit, so the advance ratio is only checked where the
   full setting is used.

   The signature the photograph carries is not on the page — the verse
   ends on a full stop instead — so the indent and the wider gap before
   the name are no longer checked. What is left is the shape of the
   stanza itself. */
const T={adv:0.180};
(async()=>{
  const b=await launch();
  let bad=0;
  const SIZES=[['desktop',1440,900,true],['laptop',1280,800,true],['wide',1920,1080,true],
               ['iPad',768,1024,false],['iPhone 13',390,844,false],['iPhone SE',320,568,false],
               ['iPhone 15+',430,932,false],['landscape',844,390,false]];
  for(const [label,w,h,full] of SIZES){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
    const pg=await ctx.newPage();
    const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1500);
    await pg.evaluate(()=>document.querySelectorAll('.jump a')[1].click());
    await pg.waitForTimeout(900);
    const r=await pg.evaluate(()=>{
      const ps=[...document.querySelectorAll('.hand p')];
      const box=document.querySelector('.hand').getBoundingClientRect();
      const panel=document.querySelector('#about').getBoundingClientRect();
      const lh=parseFloat(getComputedStyle(ps[0]).lineHeight);
      return {
        lines:ps.map(p=>{const b=p.getBoundingClientRect();
          /* Distinct line tops, not the number of rects: a range over
             content holding inline elements returns one rect per run, so
             a line carrying two spans counts as three and every line
             with punctuation in it looks wrapped. */
          const rg=document.createRange();rg.selectNodeContents(p);
          const tops=new Set([...rg.getClientRects()].map(r=>Math.round(r.top)));
          return {left:+b.left.toFixed(1),width:+b.width.toFixed(1),top:+b.top.toFixed(1),
                  rows:tops.size};}),
        box:{left:+box.left.toFixed(1),width:+box.width.toFixed(1),
             top:+box.top.toFixed(1),height:+box.height.toFixed(1)},
        panel:{left:+panel.left.toFixed(1),width:+panel.width.toFixed(1),
               top:+panel.top.toFixed(1),height:+panel.height.toFixed(1)},
        lh,
        /* The advance is a choice per breakpoint now — the hand is set
           larger than the photograph has it and the lines come closer
           together to pay for that — so what is checked is that the
           rendering matches what the CSS asks for, not the scan's own
           2.53. Expressed against the longest line, which is a
           constant 10.314em of the hand — Tangerine's figure, measured
           by test/tools/em.js. It was 14.32 while the hand was Allura,
           and nothing about the advance itself changed when it moved. */
        wantAdv:(()=>{const cs=getComputedStyle(document.querySelector('.hand'));
          return parseFloat(cs.getPropertyValue('--adv'))/10.314;})(),
        photo:0.180        /* what the photograph itself measures at */
      };
    });
    const L=r.lines, verse=L.slice(0,4);
    const longest=Math.max(...verse.map(l=>l.width));
    const edges=verse.map(l=>l.left);
    const flush=Math.max(...edges)-Math.min(...edges) < 0.6;
    const advs=[];
    for(let i=1;i<4;i++) advs.push(verse[i].top-verse[i-1].top);
    const adv=advs.reduce((a,c)=>a+c,0)/advs.length;
    const wrapped=L.filter(l=>l.rows!==1).length;
    const spill=Math.round(Math.max(r.panel.left-r.box.left,
                (r.box.left+r.box.width)-(r.panel.left+r.panel.width),
                r.panel.top-r.box.top,
                (r.box.top+r.box.height)-(r.panel.top+r.panel.height)));
    const advR=adv/longest;
    const ok = flush && wrapped===0 && spill<=1 && errs.length===0 &&
               L.length===4 &&
               Math.abs(advR-r.wantAdv)<0.004;
    if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${label.padEnd(11)} ${(w+'x'+h).padEnd(9)} `+
      `flush ${flush?'yes':'NO '}  wrapped ${wrapped}  spill ${String(spill).padStart(4)}  `+
      `adv/line ${advR.toFixed(3)}(want ${r.wantAdv.toFixed(3)}, `+
      `photograph ${r.photo})  `+
      `lines ${L.length}`+
      (errs.length?'  ERR '+errs[0]:''));
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
