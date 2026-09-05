const { launch, SITE } = require("./browser");

/* Reads the deck's real translateY, and records, for every touchmove the
   browser actually delivers, how far the deck sits from where the finger
   says it should be. Chromium withholds touchmove until the finger has
   passed its slop, so the check has to be "does the deck track the finger
   on every move it gets", not "did it move by exactly my 2px". */
const INSTRUMENT = () => {
  const ty = () => {
    const m = getComputedStyle(document.getElementById('deck')).transform;
    if (!m || m === 'none') return 0;
    let v = /matrix3d\(([^)]+)\)/.exec(m); if (v) return parseFloat(v[1].split(',')[13]);
    v = /matrix\(([^)]+)\)/.exec(m); if (v) return parseFloat(v[1].split(',')[5]);
    return 0;
  };
  window.__ty = ty;
  window.__slip = [];
  let base = null, from = null;
  window.addEventListener('touchstart', e => {
    base = window.__restBefore;                 // deck position just before the press
    from = e.touches[0].clientY;
  }, {passive:true, capture:true});
  window.addEventListener('touchmove', e => {
    if (base === null) return;
    const want = base + (e.touches[0].clientY - from);
    window.__slip.push(+(ty() - want).toFixed(2));
  }, {passive:true});
};

(async()=>{
  const b=await launch();
  let bad=0;
  const CASES=[
    ['iPhone 14  toolbar shown', 393,852,780],
    ['iPhone SE  toolbar shown', 375,667,600],
    ['iPhone 15+ toolbar shown', 430,932,860],
    ['no mismatch',              390,844,null],
  ];
  for(const [label,w,h,forced] of CASES){
    for(const sec of [1,2]){
      const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
      /* The real thing, not a CSS variable set from outside: on iOS the
         visual viewport is shorter than the layout viewport by the height
         of the toolbar, and the page reads it through visualViewport.
         Poking --screen afterwards would leave the page's own measurement
         untouched, and so would test nothing. */
      if(forced) await ctx.addInitScript(v=>{
        Object.defineProperty(window.visualViewport,'height',{get:()=>v,configurable:true});
      }, forced);
      const pg=await ctx.newPage();
      const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
      await pg.goto(SITE + '/index.html',{waitUntil:'load'});
      await pg.waitForTimeout(1200);
      const seen=await pg.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--screen').trim());
      await pg.evaluate(INSTRUMENT);
      await pg.evaluate(i=>document.querySelectorAll('.jump a')[i].click(), sec);
      await pg.waitForTimeout(1100);                       // let the glide finish

      const rest=await pg.evaluate(()=>{window.__restBefore=window.__ty();return window.__restBefore;});
      const cdp=await ctx.newCDPSession(pg);
      const cx=Math.round(w/2), y0=Math.round(h/2);
      /* Drag inwards. At the last section a drag further on is damped to a
         fifth on purpose, and measuring that would be measuring the
         rubber band rather than whether the deck holds the finger. */
      const dir = sec===2 ? +1 : -1;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:y0}]});
      for(let i=1;i<=8;i++){
        await new Promise(r=>setTimeout(r,35));
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:y0+dir*i*6}]});
      }
      const slip=await pg.evaluate(()=>window.__slip.slice());
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await pg.waitForTimeout(900);

      const worst = slip.length ? Math.max(...slip.map(Math.abs)) : Infinity;
      const ok = slip.length>=3 && worst<=1.0 && errs.length===0;
      if(!ok) bad++;
      console.log(`${ok?'PASS':'FAIL'} ${label.padEnd(26)} sec ${sec}  --screen ${(seen||'unset').padStart(6)} `+
        `body ${h}  rest ${String(Math.round(rest)).padStart(6)}  `+
        `${slip.length} moves  worst gap finger-to-deck ${worst.toFixed(1)}px`+
        (errs.length?'  ERR '+errs[0]:''));
      await ctx.close();
    }
  }

  /* Grabbing a page that is still gliding must stop it where it is.
     Sampled inside the page: reading "before" over a round trip and
     "after" over another measures the time between them, because the
     glide is legitimately still moving in the gap. What matters is that
     the deck goes still on the press and does not leap to the
     destination. */
  const ctx=await b.newContext({viewport:{width:393,height:852},hasTouch:true,isMobile:true});
  const pg=await ctx.newPage();
  const gerrs=[]; pg.on('pageerror',e=>gerrs.push(String(e)));
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1200);
  await pg.evaluate(()=>{
    const d=document.getElementById('deck');
    window.__ty=()=>{const m=getComputedStyle(d).transform;
      let v=/matrix3d\(([^)]+)\)/.exec(m); if(v)return +(+v[1].split(',')[13]).toFixed(1);
      v=/matrix\(([^)]+)\)/.exec(m); if(v)return +(+v[1].split(',')[5]).toFixed(1); return 0;};
    window.__held=[];
    window.addEventListener('touchstart',()=>{      // after the site's own
      window.__held.push(window.__ty());
      [16,120,300].forEach(ms=>setTimeout(()=>window.__held.push(window.__ty()),ms));
    },{passive:true});
  });
  await pg.evaluate(()=>document.querySelectorAll('.jump a')[2].click());
  await pg.waitForTimeout(160);                            // mid-flight
  const cdp=await ctx.newCDPSession(pg);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:196,y:400}]});
  await pg.waitForTimeout(420);
  const held=await pg.evaluate(()=>window.__held);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const dest=-2*852;
  const froze  = held.length===4 && held.every(v=>Math.abs(v-held[0])<=0.5);
  const midway = Math.abs(held[0]-dest)>40 && held[0]<-1;
  if(!(froze&&midway&&gerrs.length===0)) bad++;
  console.log(`${froze&&midway?'PASS':'FAIL'} grab mid-glide             held at ${held.join(' / ')}  `+
    `(destination ${dest}${midway?', stopped short of it':'  <<< SNAPPED TO IT'})`+
    (gerrs.length?'  ERR '+gerrs[0]:''));

  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
