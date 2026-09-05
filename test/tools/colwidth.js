const { launch, SITE } = require("../browser");
/* What the roster's type size costs in photograph width. The column is
   what is left over beside the figure, so the only way past the
   one-line rule is to take width off the picture. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(2000);
  const rows=await pg.evaluate(()=>{
    const ul=document.querySelector('.roster'), lis=[...ul.querySelectorAll('li')];
    const fig=document.querySelector('#artists .beside img');
    const out=[];
    const probe=lis[0].cloneNode(true);
    probe.style.cssText+=';position:absolute;left:-9999px;white-space:nowrap;width:auto;visibility:hidden';
    ul.appendChild(probe);
    const best=(col,fam,track)=>{
      if(fam){lis.forEach(li=>li.style.fontFamily=fam);probe.style.fontFamily=fam;}
      if(track){lis.forEach(li=>{li.style.letterSpacing=track;li.style.textIndent=track;});
                probe.style.letterSpacing=track;probe.style.textIndent=track;}
      let lo=8,hi=30;
      for(let i=0;i<24;i++){const mid=(lo+hi)/2;probe.style.fontSize=mid+'px';
        const w=Math.max(...lis.map(li=>{probe.innerHTML=li.innerHTML;
          return probe.getBoundingClientRect().width;}));
        (w<=col-1)?lo=mid:hi=mid;}
      return +lo.toFixed(2);
    };
    const base=+fig.getBoundingClientRect().width.toFixed(0);
    for(const shrink of [0,.06,.12,.18]){
      fig.style.maxWidth=`${(1-shrink)*100}%`;
      fig.style.width=`${Math.round(base*(1-shrink))}px`;
      /* the column takes the width the picture gives up, evenly on both sides */
      const col=document.querySelector('.who-company').getBoundingClientRect().width
                + base*shrink/2;
      out.push({shrink:Math.round(shrink*100), figure:Math.round(base*(1-shrink)),
                col:Math.round(col),
                corm:best(col,'var(--micro)','.10em'), jost:best(col,'var(--display)','.10em')});
    }
    probe.remove();
    return {base, out};
  });
  console.log(`the photograph is ${rows.base}px wide at 1440x900\n`);
  console.log('  picture      column   Cormorant .10em   Jost 300 .10em');
  for(const r of rows.out)
    console.log(`  -${String(r.shrink).padStart(2)}% ${String(r.figure).padStart(4)}px  ${String(r.col).padStart(4)}px   `+
      `${String(r.corm).padStart(9)}px   ${String(r.jost).padStart(10)}px`);
  await b.close();
})();
