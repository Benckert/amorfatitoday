const { launch, SITE } = require("./browser");
/* The button's own size, everywhere. An unstyled <svg> inside it has
   an intrinsic 300x150 and will quietly inflate the whole row. */
(async()=>{
  const b=await launch();
  let bad=0;
  for(const [w,h] of [[320,568],[390,844],[768,1024],[844,390],[1024,768],
                      [1280,800],[1440,900],[1920,1080],[600,1400],[1200,500]]){
    const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<1241,isMobile:w<1241});
    const pg=await ctx.newPage();
    await pg.goto(SITE + '/index.html',{waitUntil:'load'});
    await pg.waitForTimeout(1400);
    const r=await pg.evaluate(()=>{
      const t=document.querySelector('.jump .ticket').getBoundingClientRect();
      const j=document.querySelector('.jump').getBoundingClientRect();
      const rim=document.querySelector('.jump .ticket .rim');
      return {tw:Math.round(t.width),th:Math.round(t.height),
              jh:Math.round(j.height), rim:getComputedStyle(rim).display};});
    /* a pill is wider than it is tall and nothing like the width of the page */
    const ok = r.th<80 && r.tw<w*0.75 && r.tw>r.th;
    if(!ok) bad++;
    console.log(`${ok?'PASS':'FAIL'} ${(w+'x'+h).padEnd(10)} button ${r.tw}x${r.th}  `+
                `row ${r.jh}  rim ${r.rim}`);
    await ctx.close();
  }
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
