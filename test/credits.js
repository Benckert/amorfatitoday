const { launch, SITE } = require("./browser");
/* The content checks the layout suites do not cover: that no credit row
   opens a line with a dash, that the roster fits its column and the
   panel, that the landing's date and venue clear the link rail, and
   that the headline over the verse stays on one or two lines. */
(async()=>{
  const b=await launch();
  let bad=0;
  const SIZES=[[320,568],[360,640],[375,704],[390,844],[414,719],[430,932],
               [768,1024],[820,1180],[844,390],[667,375],
               [900,700],[960,640],[1024,768],[1100,720],[1152,864],
               [1280,800],[1366,768],[1440,900],[1920,1080],[600,1400],[1200,500]];
  for(const [w,h] of SIZES){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900});
    const pg=await ctx.newPage();
    const errs=[]; pg.on('pageerror',e=>errs.push(String(e)));
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1600);

    // landing: the venue line must clear the rail
    const land=await pg.evaluate(()=>{
      const wh=document.querySelector('.where').getBoundingClientRect();
      const rail=document.querySelector('.jump').getBoundingClientRect();
      return {gap:Math.round(rail.top-wh.bottom), whereRows:
        new Set([...document.querySelector('.where a').getClientRects()].map(r=>Math.round(r.top))).size};
    });

    await pg.evaluate(()=>document.querySelectorAll('.jump a')[1].click());
    await pg.waitForTimeout(900);
    const lede=await pg.evaluate(()=>{
      const el=document.querySelector('.lede');
      /* Lines by height over line-height, not by counting rects: the
         headline holds two spans, set as blocks where it takes two
         lines, and a range over it returns a rect per run — which read
         as four lines. */
      const b=el.getBoundingClientRect(), p=document.querySelector('#about').getBoundingClientRect();
      const lh=parseFloat(getComputedStyle(el).lineHeight);
      return {rows:Math.round(b.height/lh),
              spill:Math.round(Math.max(p.left-b.left,(b.left+b.width)-(p.left+p.width)))};
    });

    await pg.evaluate(()=>document.querySelectorAll('.jump a')[2].click());
    await pg.waitForTimeout(900);
    const cred=await pg.evaluate(()=>{
      const lis=[...document.querySelectorAll('.roster li')];
      const col=document.querySelector('.who-company').getBoundingClientRect();
      const panel=document.querySelector('#artists').getBoundingClientRect();
      const rail=document.querySelector('.jump').getBoundingClientRect();
      let wrapped=0, dashLeads=0;
      /* Line COUNT, measured against a one-line probe of the same row.
         Every other way of counting has been wrong here: the number of
         client rects counts one per inline run, so a row with a name, a
         dash and a role reads as three lines; and comparing the tops of
         those rects fails too, because the role is set smaller and a
         smaller inline box sits lower on the same line. The height of
         the row against the height it has when it cannot wrap is the
         one measure that does not care how the row is put together. */
      const probe=lis[0].cloneNode(true);
      probe.style.cssText='position:absolute;left:-9999px;top:0;white-space:nowrap;'+
                          'width:auto;visibility:hidden';
      lis[0].parentNode.appendChild(probe);
      const oneLine=(li)=>{probe.innerHTML=li.innerHTML;
        return probe.getBoundingClientRect().height;};
      for(const li of lis){
        const lines=Math.round(li.getBoundingClientRect().height/oneLine(li));
        if(lines>1){
          wrapped++;
          /* a row that broke in the wrong place opens its second line
             with the dash, hard against the left edge of the column */
          const dr=li.querySelector('.d').getBoundingClientRect();
          if(dr.left < li.getBoundingClientRect().left + 2) dashLeads++;
        }
      }
      probe.remove();
      const last=lis[lis.length-1].getBoundingClientRect();
      const first=document.querySelector('.company-label').getBoundingClientRect();
      const lead=document.querySelector('.lead-name .role');
      return {wrapped,dashLeads,
        overCol:Math.round(Math.max(...lis.map(l=>l.getBoundingClientRect().right))-col.right),
        overTop:Math.round(panel.top-first.top),
        overBot:Math.round(last.bottom-Math.min(panel.bottom,rail.top)),
        roleShown:!!lead && getComputedStyle(lead).display!=='none',
        /* Exactly one horizon, and on a wide screen exactly one. A
           bare `.lead-name span` once matched the role nested inside
           it and drew a second rule, which no measurement of position
           or size would show. It is painted as a background on the
           role now, so both ways of drawing one are counted. */
        rules:[...document.querySelectorAll('.lead-name, .lead-name *')]
          .filter(e=>{const c=getComputedStyle(e,'::after');
            return c.content!=='none' && c.display!=='none';}).length
          + [...document.querySelectorAll('.lead-name *')]
              .filter(e=>getComputedStyle(e).backgroundImage!=='none').length,
        /* and it sits BETWEEN the name and the role, not under both */
        ruleBetween:(()=>{const r=document.querySelector('.lead-name .role');
          if(!r || getComputedStyle(r).backgroundImage==='none') return null;
          const sp=document.querySelector('.lead-name > span').getBoundingClientRect();
          const rr=r.getBoundingClientRect();
          return Math.round(rr.top-sp.top)>0 && Math.round(sp.bottom-rr.bottom)<2;})()};
    });

    const ok = land.gap>0 && lede.rows<=2 && lede.spill<=1 &&
               cred.dashLeads===0 && cred.overCol<=1 && cred.overTop<=1 &&
               cred.overBot<=1 && cred.roleShown && cred.rules<=1 &&
               cred.ruleBetween!==false && errs.length===0;
    if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} `+
      `venue-to-rail ${String(land.gap).padStart(4)}  headline ${lede.rows}ln  `+
      `rows wrapped ${String(cred.wrapped).padStart(2)}  dash-led ${cred.dashLeads}  `+
      `roster past col ${String(cred.overCol).padStart(4)} top ${String(cred.overTop).padStart(4)} bottom ${String(cred.overBot).padStart(4)}  `+
      `horizons ${cred.rules}${cred.ruleBetween===true?' between':''}`+
      (errs.length?'  ERR '+errs[0]:''));
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
