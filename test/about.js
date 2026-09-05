const { launch, SITE } = require("./browser");
/* The headline against the verse: how long each is, and when the
   headline takes two lines, how even they come out. */
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
      /* A line's length is the EXTENT of its rects, not their sum. The
         headline holds two spans now, so a range over it returns a rect
         per run; summing them counted a one-line headline twice over.
         Tops are bucketed to 3px, because the two spans on one line can
         differ by a fraction. */
      const rows=[...rg.getClientRects()].filter(x=>x.width>0);
      const byTop=new Map();
      rows.forEach(x=>{const k=Math.round(x.top/3)*3;
        const e=byTop.get(k)||{l:1e9,r:-1e9};
        e.l=Math.min(e.l,x.left); e.r=Math.max(e.r,x.right); byTop.set(k,e);});
      let lens=[...byTop.entries()].sort((a,c)=>a[0]-c[0])
                 .map(([,e])=>Math.round(e.r-e.l));
      /* Where the two spans are set as blocks each IS a line, so measure
         them directly rather than bucketing rects by their tops — a
         line whose two runs differ by a fraction of a pixel was landing
         in two buckets and reporting as two lines. */
      const spans=[...lede.querySelectorAll('span')];
      if(spans.length===2 && getComputedStyle(spans[0]).display==='block')
        lens=spans.map(sp=>{const g=document.createRange();g.selectNodeContents(sp);
          const rs=[...g.getClientRects()].filter(x=>x.width>0);
          return Math.round(Math.max(...rs.map(x=>x.right))-Math.min(...rs.map(x=>x.left)));});
      const ps=[...document.querySelectorAll('.hand p')].slice(0,4);
      const widest=Math.max(...ps.map(p=>p.getBoundingClientRect().width));
      const hand=getComputedStyle(document.querySelector('.hand'));
      return {lens, ledeFs:+parseFloat(getComputedStyle(lede).fontSize).toFixed(1),
              verse:Math.round(widest), handFs:+parseFloat(hand.fontSize).toFixed(1),
              adv:hand.getPropertyValue('--adv').trim()};
    });
    const hl=Math.max(...r.lens);
    const spread=hl-Math.min(...r.lens);
    /* Matching the verse's longest line is a DESKTOP rule -- there the
       two are the whole of the section and an unequal pair reads as a
       mistake. Off it the headline is set on its own curve: narrower
       than the verse, and always smaller than it. Either way, where it
       takes two lines those two are the same length as each other. */
    const desk = w>1240 && w>h && h>540;
    const match = desk ? Math.abs(hl-r.verse)<=2
                       : (hl<=r.verse+2 && r.ledeFs<r.handFs);
    const even=r.lens.length===1||spread<=2;
    if(!(match&&even)) bad++;
    console.log(`${match&&even?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} `+
      `headline ${String(hl).padStart(4)}px @${String(r.ledeFs).padStart(5)}  `+
      `verse ${String(r.verse).padStart(4)}px @${String(r.handFs).padStart(5)} adv ${r.adv}  `+
      `${match?(desk?'match':'narrower, smaller'):'FAILS THE RULE'}  `+
      `${r.lens.length>1?`two lines ${r.lens.join(' / ')} spread ${spread}`:'one line'}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
