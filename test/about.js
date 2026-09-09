const { launch, SITE } = require("./browser");
/* The headline against the verse: how long each is, how even a
   two-line headline comes out, and whether the poem still sits centred
   in the gap beside her shirt. */
(async()=>{
  let bad=0;
  const b=await launch();
  const SIZES=[[320,568],[360,640],[375,704],[390,844],[430,932],[768,1024],[820,1180],
               [844,390],[667,375],[812,375],[1280,800],[1440,900],[1920,1080],[600,1400]];
  for(const [w,h] of SIZES){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1100,isMobile:w<1100});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html#about',{waitUntil:'load'});
    await pg.waitForTimeout(1700);
    const r=await pg.evaluate(()=>{
      const lede=document.querySelector('.lede');
      const rg=document.createRange(); rg.selectNodeContents(lede);
      /* A line's length is the EXTENT of its rects, not their sum: a
         range over content holding more than one run returns a rect per
         run, and summing them counted a one-line headline twice over.
         Tops are bucketed to 3px, because two runs on one line can
         differ by a fraction. */
      const rows=[...rg.getClientRects()].filter(x=>x.width>0);
      const byTop=new Map();
      rows.forEach(x=>{const k=Math.round(x.top/3)*3;
        const e=byTop.get(k)||{l:1e9,r:-1e9};
        e.l=Math.min(e.l,x.left); e.r=Math.max(e.r,x.right); byTop.set(k,e);});
      const lens=[...byTop.entries()].sort((a,c)=>a[0]-c[0])
                 .map(([,e])=>Math.round(e.r-e.l));
      /* every line of the verse — it is six now, in three stanzas */
      const ps=[...document.querySelectorAll('.hand p')];
      const widest=Math.max(...ps.map(p=>p.getBoundingClientRect().width));
      const hand=getComputedStyle(document.querySelector('.hand'));
      /* THE POEM IS CENTRED IN THE GAP BETWEEN THE SCREEN'S EDGE AND HER
         SHIRT, which nothing tested until an invalid calc() set
         padding-left to 0 and slid the whole block against the left
         edge at every width with all ten suites still green. The gap is
         read off the rendered figure rather than recomputed from the
         formula, so this checks the result and not the arithmetic. */
      const ab=document.querySelector('#about');
      const fig=document.querySelector('#about .beside img');
      /* The centring is in force only where the section is side by side
         with the figure: below 1240px, and in portrait, it takes the
         plain gutter and the poem is not shirt-centred at all. ASK THE
         SAME MEDIA CONDITION THE STYLESHEET ASKS, not the padding that
         came out. Keyed to the outcome -- "in force where the padding
         beat the gutter floor" -- the check disables itself on exactly
         the failure it exists to catch, because the bug sets that
         padding to 0. It was written that way first and passed with the
         fault put back deliberately. */
      const inForce=!matchMedia('(max-width:1240px), (orientation:portrait)')
                      .matches;
      let centre=null;
      if(fig && inForce){
        const f=fig.getBoundingClientRect();
        const shirt=f.left+f.width*(1-0.829);
        const b=document.querySelector('.hand').getBoundingClientRect();
        centre=+((b.left+b.width/2)-shirt/2).toFixed(1);
      }
      return {lens, ledeFs:+parseFloat(getComputedStyle(lede).fontSize).toFixed(1),
              verse:Math.round(widest), handFs:+parseFloat(hand.fontSize).toFixed(1),
              adv:hand.getPropertyValue('--adv').trim(), centre};
    });
    const hl=Math.max(...r.lens);
    const spread=hl-Math.min(...r.lens);
    /* THE HEADLINE MATCHES THE VERSE'S LONGEST LINE AT EVERY SIZE. It
       was a desktop-only rule while the headline was Cormorant capitals
       and the verse a script -- two faces in two cases with no ratio
       between them to hold, so off the desktop the headline was set on
       its own absolute curve, narrower than the verse and smaller. In
       the same hand at one weight up there IS a ratio, so one --lede-k
       serves every width and the rule is the same everywhere. Where the
       headline takes two lines, those two are still level. */
    const match = Math.abs(hl-r.verse)<=2;
    const even=r.lens.length===1||spread<=2;
    /* off centre by more than a couple of pixels is a fault wherever
       the side-by-side layout puts the poem beside the figure */
    const centred = r.centre===null || Math.abs(r.centre)<=2;
    if(!(match&&even&&centred)) bad++;
    console.log(`${match&&even&&centred?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} `+
      `headline ${String(hl).padStart(4)}px @${String(r.ledeFs).padStart(5)}  `+
      `verse ${String(r.verse).padStart(4)}px @${String(r.handFs).padStart(5)} adv ${r.adv}  `+
      `${match?'match':'FAILS THE RULE'}  `+
      `${r.centre===null?'gutter-set     ':
         `poem off centre ${String(r.centre).padStart(6)}${centred?'':' OFF'}`}  `+
      `${r.lens.length>1?`two lines ${r.lens.join(' / ')} spread ${spread}`:'one line'}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
