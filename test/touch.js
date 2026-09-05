const { launch, SITE } = require("./browser");
(async () => {
  const b = await launch();
  const ctx = await b.newContext({ viewport:{width:375,height:704}, hasTouch:true, isMobile:true });
  const pg = await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(350);
  const cdp = await ctx.newCDPSession(pg);
  const at = () => pg.evaluate(()=>[...document.querySelectorAll('.dots button')].findIndex(x=>x.getAttribute('aria-current')==='true'));
  const top0 = () => pg.evaluate(()=>[...document.querySelectorAll('.panel')].map(p=>Math.round(p.getBoundingClientRect().top)).join('/'));
  async function swipe(dy, ms, steps=10){
    let y=400;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y}]});
    for(let i=1;i<=steps;i++){
      await new Promise(r=>setTimeout(r,ms/steps));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:y+dy*i/steps}]});
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await pg.waitForTimeout(900);
  }
  const log=[];
  const T=async(label,exp,fn)=>{ await fn(); const a=await at(); const t=await top0();
    log.push(`${a===exp?'PASS':'FAIL'} ${label.padEnd(34)} at=${a} exp=${exp} tops=${t}`); };

  await T('slow full swipe up -> 1', 1, ()=>swipe(-300,400));
  await T('slow full swipe up -> 2', 2, ()=>swipe(-300,400));
  await T('swipe up at last stays 2', 2, ()=>swipe(-300,400));
  await T('swipe down -> 1', 1, ()=>swipe(300,400));
  await T('tiny swipe up (30px slow) stays', 1, ()=>swipe(-30,700));
  await T('quick flick up -> 2', 2, ()=>swipe(-70,0,3));
  await T('swipe down -> 1', 1, ()=>swipe(300,400));
  await T('swipe down -> 0', 0, ()=>swipe(300,400));
  await T('swipe down at first stays 0', 0, ()=>swipe(300,400));
  // does the document ever scroll?
  const doc = await pg.evaluate(()=>({sy:scrollY, dh:document.documentElement.scrollHeight, ih:innerHeight}));
  log.push(`${doc.sy===0&&doc.dh<=doc.ih+1?'PASS':'FAIL'} document never scrolls          scrollY=${doc.sy} docH=${doc.dh} inner=${doc.ih}`);
  log.push(`${errs.length?'FAIL':'PASS'} no js errors                       ${errs.slice(0,2).join('|')}`);
  console.log(log.join('\n'));
  await b.close();
  process.exit(log.some(l=>l.startsWith('FAIL'))?1:0);
})();
