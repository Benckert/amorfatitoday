const { launch, SITE } = require("./browser");
(async () => {
  const b = await launch();
  const out=[]; const P=(c,m)=>out.push((c?'PASS ':'FAIL ')+m);

  // reveals fire on later sections
  for (const [n,w,h] of [['phone',390,844],['desktop',1440,900]]) {
    const ctx = await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:w<900});
    const pg = await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(2200);
    const t = await pg.evaluate(()=>getComputedStyle(document.querySelector('.title .ch')).opacity);
    P(parseFloat(t)>0.9, `${n}: title letters revealed (opacity ${t})`);
    for (const i of [1,2]) {
      await pg.evaluate(i=>document.querySelectorAll('.dots button')[i].click(),i);
      await pg.waitForTimeout(2200);
      const hidden = await pg.evaluate(i=>{
        const p=document.querySelectorAll('.panel')[i];
        return [...p.querySelectorAll('[data-reveal]')].filter(e=>parseFloat(getComputedStyle(e).opacity)<0.9).length;
      },i);
      P(hidden===0, `${n}: section ${i} lines all revealed (${hidden} still hidden)`);
    }
    // hash + reload
    await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
    await pg.waitForTimeout(400);
    const top = await pg.evaluate(()=>Math.round(document.getElementById('artists').getBoundingClientRect().top));
    P(top===0, `${n}: deep link #artists opens on it (top ${top})`);
    // tab-follow
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(400);
    // the artists section has no links of its own any more, so plant one
    await pg.evaluate(()=>{const a=document.createElement('a');a.href='#';a.textContent='x';
      document.getElementById('artists').appendChild(a);a.focus();});
    await pg.waitForTimeout(200);
    const ft = await pg.evaluate(()=>Math.round(document.getElementById('artists').getBoundingClientRect().top));
    P(ft===0, `${n}: focus in a clipped section brings it up (top ${ft})`);
    // fixed nav sits inside the screen
    const nav = await pg.evaluate(()=>{const r=document.querySelector('.jump').getBoundingClientRect();
      return {b:Math.round(r.bottom), t:Math.round(r.top)};});
    P(nav.b<=h+1 && nav.t>=0, `${n}: link rail inside the screen (top ${nav.t} bottom ${nav.b} of ${h})`);
    await ctx.close();
  }

  // no-script fallback: an ordinary scrolling page
  const ctx = await b.newContext({viewport:{width:390,height:844}, javaScriptEnabled:false});
  const pg = await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(400);
  const ns = await pg.evaluate(()=>({doc:document.documentElement.scrollHeight, ih:innerHeight,
    vis:[...document.querySelectorAll('.panel')].map(p=>Math.round(p.getBoundingClientRect().height))}));
  P(ns.doc > ns.ih*2.5, `no script: page scrolls through all three (doc ${ns.doc}, screen ${ns.ih})`);
  P(ns.vis.every(v=>v>=ns.ih), `no script: sections at least a screen each (${ns.vis.join('/')})`);
  await ctx.close();

  console.log(out.join('\n'));
  await b.close();
  process.exit(out.some(l=>l.startsWith('FAIL'))?1:0);
})();
