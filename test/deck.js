const { launch, SITE } = require("./browser");
const SIZES = [
  ['iPhone13mini-bar',375,629],['iPhone13mini',375,704],['iPhone11',414,719],
  ['iPhone SE',320,568],['iPhone 8',375,667],['iPhone 13',390,844],
  ['Pixel 7',412,732],['iPad portrait',768,1024],['iPad Air',820,1180],
  ['iPad landscape',1024,768],['laptop',1280,800],['desktop',1440,900],['wide',1920,1080],
  ['phone landscape',844,390],['small phone land',667,375],['tall',600,1400],['short wide',1200,500],
];
(async () => {
  const b = await launch();
  let bad = [];
  for (const [name,w,h] of SIZES) {
    const ctx = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true, isMobile:w<900 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e)));
    pg.on('console', m => { if (m.type()==='error' && !/404|ambient/.test(m.text())) errs.push('console:'+m.text()); });
    await pg.goto(SITE + '/index.html', { waitUntil:'load' });
    await pg.waitForTimeout(350);
    const r = await pg.evaluate(() => {
      const ps=[...document.querySelectorAll('.panel')], deck=document.getElementById('deck');
      return { doc: document.documentElement.scrollHeight, inner: innerHeight,
        deckH: Math.round(deck.getBoundingClientRect().height),
        ph: ps.map(p=>Math.round(p.getBoundingClientRect().height)),
        tops: ps.map(p=>Math.round(p.getBoundingClientRect().top)),
        ovx: document.documentElement.scrollWidth - innerWidth };
    });
    const steps=[];
    for (let i=1;i<3;i++){
      await pg.evaluate(i=>document.querySelectorAll('.dots button')[i].click(), i);
      await pg.waitForTimeout(800);
      steps.push(await pg.evaluate(() => {
        const ps=[...document.querySelectorAll('.panel')];
        return { tops: ps.map(p=>Math.round(p.getBoundingClientRect().top)),
                 cur: [...document.querySelectorAll('.dots button')].findIndex(b=>b.getAttribute('aria-current')==='true'),
                 hash: location.hash };
      }));
    }
    await pg.keyboard.press('Home'); await pg.waitForTimeout(800);
    const home = await pg.evaluate(()=>Math.round(document.querySelectorAll('.panel')[0].getBoundingClientRect().top));
    // wheel: one burst = one section
    // a dense flick with a decaying tail, dispatched on the page's own
    // clock: CDP round trips leave gaps a real trackpad never has
    await pg.evaluate(async()=>{
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));
      const s=[]; let peak=140;
      for(let i=1;i<=6;i++) s.push(peak*i/6);
      let d=peak; while(d>0.6){ d*=0.955; s.push(d); }
      for(const dy of s){ window.dispatchEvent(new WheelEvent('wheel',{deltaY:dy,cancelable:true,bubbles:true})); await sleep(16); }
    });
    await pg.waitForTimeout(900);
    const afterWheel = await pg.evaluate(()=>[...document.querySelectorAll('.dots button')].findIndex(b=>b.getAttribute('aria-current')==='true'));
    const cover = r.ph.every(x=>x>=h) && r.ph.every(x=>x<=h+1);
    const ok = cover && r.tops[0]===0 && r.doc<=h+1 && r.ovx<=0 && r.deckH===h
      && steps.every((s,i)=>s.tops[i+1]===0 && s.cur===i+1)
      && home===0 && afterWheel===1 && errs.length===0;
    if(!ok) bad.push(name);
    console.log((ok?'PASS ':'FAIL ')+name.padEnd(18)+`${w}x${h}`.padEnd(10)+
      `deck=${r.deckH} panels=${r.ph.join('/')} tops=${r.tops.join('/')} doc=${r.doc} ovx=${r.ovx} `+
      `nav=${steps.map(s=>s.cur).join(',')} tops2=${steps.map(s=>s.tops.join('/')).join(' | ')} home=${home} wheel=${afterWheel}`+
      (errs.length?' ERR '+errs.slice(0,2).join(' | '):''));
    await ctx.close();
  }
  await b.close();
  console.log('\n'+(bad.length?'FAILED: '+bad.join(', '):'ALL PASS'));
  process.exit(bad.length?1:0);
})();
