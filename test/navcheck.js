const { launch, SITE } = require("./browser");
/* The rule is out for the current section, in for the others, and
   comes out under a hovered one; and the breath is sampled through a
   whole cycle so its shape can be read rather than assumed. */
(async()=>{
  const b=await launch();
  let bad=0;
  // desktop: the rule
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg.waitForTimeout(1600);
  const sx=()=>pg.evaluate(()=>[...document.querySelectorAll('.jump a.to')].map(a=>{
    /* the rule is uncovered by a clip now, not scaled: closed reads
       as inset(0 50% 0 50%), open as inset(0px) */
    const c=getComputedStyle(a,'::after').clipPath;
    return /50%/.test(c) ? 0 : 1;}));
  const rest=await sx();
  const ok1 = rest[0]===1 && rest[1]===0 && rest[2]===0;
  if(!ok1) bad++;
  console.log(`${ok1?'PASS':'FAIL'} at rest on amor: rules ${rest.join(' / ')} (want 1 / 0 / 0)`);
  await pg.hover('.jump a.to[href="#artists"]');
  await pg.waitForTimeout(700);
  const hov=await sx();
  const ok2 = hov[0]===1 && hov[1]===0 && hov[2]===1;
  if(!ok2) bad++;
  console.log(`${ok2?'PASS':'FAIL'} hovering artists:  rules ${hov.join(' / ')} (want 1 / 0 / 1)`);
  /* No standing underline anywhere; a divider on the second and third
     link and not on the first, so the row does not open with one. */
  const borders=await pg.evaluate(()=>[...document.querySelectorAll('.jump a.to')]
    .map(a=>{const c=getComputedStyle(a);
      return c.borderBottomWidth+'/'+c.borderLeftWidth;}));
  const okB = borders.every(b=>b.startsWith('0px/'))
           && borders[0]==='0px/0px' && borders[1]!=='0px/0px' && borders[2]!=='0px/0px';
  if(!okB) bad++;
  console.log(`${okB?'PASS':'FAIL'} no underline, dividers on 2 and 3: ${borders.join('  ')}`);
  /* and the rule still spans the word, not the word plus the divider */
  const centred=await pg.evaluate(()=>[...document.querySelectorAll('.jump a.to')].map(a=>{
    const r=a.getBoundingClientRect();
    const ar=[...a.getClientRects()];
    const rg=document.createRange(); rg.selectNodeContents(a);
    const t=[...rg.getClientRects()][0];
    const pad=parseFloat(getComputedStyle(a).paddingLeft);
    const bl=parseFloat(getComputedStyle(a).borderLeftWidth);
    return +( (r.left+bl+pad) - t.left ).toFixed(1);}));
  const okC = centred.every(d=>Math.abs(d)<1.5);
  if(!okC) bad++;
  console.log(`${okC?'PASS':'FAIL'} rule starts where the word does: offsets ${centred.join(' / ')}`);
  await ctx.close();

  // phone: the breath
  const ctx2=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const pg2=await ctx2.newPage();
  await pg2.goto(SITE + '/index.html',{waitUntil:'load'});
  await pg2.waitForTimeout(1500);
  /* The glow holds still; the only thing that moves is the light going
     round the rim, on its own element. */
  const an=await pg2.evaluate(()=>{
    const t=document.querySelector('.jump .ticket');
    const g=getComputedStyle(t,'::before'), p=getComputedStyle(t);
    const rim=t.querySelector('.rim .lit');
    const r=rim?getComputedStyle(rim):null;
    return {glow:g.animationName, pill:p.animationName,
            rim:r?r.animationName:'(no rim)',
            rimDur:r?parseFloat(r.animationDuration)||0:0,
            rimTiming:r?r.animationTimingFunction:''};});
  const okStill = an.glow==='none' && an.pill==='none';
  if(!okStill) bad++;
  console.log(`${okStill?'PASS':'FAIL'} the glow and the pill hold still `+
              `(glow ${an.glow}, pill ${an.pill})`);
  const okRim = /^lap-/.test(an.rim) && an.rimDur>=6;
  if(!okRim) bad++;
  /* the easing is 96 points long; say what it is, not all of it */
  const timing=/^linear\(/.test(an.rimTiming)
    ? `linear() with ${an.rimTiming.split(',').length} points`
    : an.rimTiming;
  console.log(`${okRim?'PASS':'FAIL'} the light goes round: ${an.rim} ${an.rimDur}s ${timing}`);

  /* THE OTHER ONE THAT MATTERS. A var() inside the keyframe makes
     stroke-dashoffset animate DISCRETELY: the declaration parses, the
     animation reports as running, and the light still sits still and
     teleports half way through the lap. Nothing short of sampling the
     offset over the lap catches it, so sample it: the two lobes are
     stepped through a lap and have to take many distinct positions,
     move one whole 100 over it, and stay exactly 50 apart throughout. */
  const trav=await pg2.evaluate(()=>{
    const rects=[...document.querySelectorAll('.jump .ticket .rim rect')];
    const an=rects.map(e=>{const a=e.getAnimations()[0];a&&a.pause();return a;});
    if(an.some(a=>!a)) return null;
    const off=[];
    /* 0..19 of 20, not 0..20: at exactly one duration an infinite
       animation is back at the start, so the last sample would read
       as no travel at all. */
    const at=[];
    for(let i=0;i<20;i++) at.push(10000*i/20);
    at.push(9999);          /* just short of the wrap, for the full lap */
    for(const t of at){
      an.forEach(a=>{a.currentTime=t;});
      off.push(rects.map(e=>parseFloat(getComputedStyle(e).strokeDashoffset)));
    }
    return off;
  });
  let okTrav=false, note='no animation on the rim rects';
  if(trav){
    const steps=new Set(trav.map(r=>r[0].toFixed(2))).size;
    const lap=trav[0][0]-trav[20][0];
    const down=trav.every((r,i)=>i===0||r[0]<trav[i-1][0]);
    const gaps=trav.map(r=>Math.abs(r[0]-r[1]));
    const apart=Math.max(...gaps)-Math.min(...gaps);
    okTrav = steps>=18 && down && Math.abs(lap-100)<1 && apart<0.6;
    note=`${steps}/21 distinct offsets, ${down?'monotone':'NOT monotone'}, `+
         `lap ${lap.toFixed(1)}, lobes drift ${apart.toFixed(2)}`;
  }
  if(!okTrav) bad++;
  console.log(`${okTrav?'PASS':'FAIL'} it interpolates, a whole lap, lobes locked opposite: ${note}`);

  /* AND THE SPEED FOLLOWS THE SHAPE. The light is meant to run down
     the long sides and dwell round the ends, so the fastest sample has
     to fall on a straight and the slowest on an arc — a property of
     WHERE it is, which a check on the timing function's name could not
     see. The straight's share of the lap is computed from the pill the
     browser actually laid out, not assumed. */
  const ramp=await pg2.evaluate(()=>{
    const rect=document.querySelector('.jump .ticket .rim .lit');
    const a=rect.getAnimations()[0]; if(!a) return null;
    a.pause();
    const box=document.querySelector('.jump .ticket').getBoundingClientRect();
    const st=(box.width-box.height)/(2*(box.width-box.height)+Math.PI*box.height)*100;
    const K=120, off=[];
    for(let i=0;i<=K;i++){a.currentTime=10000*i/K;
      off.push(parseFloat(getComputedStyle(rect).strokeDashoffset));}
    const at=[],v=[];
    for(let i=0;i<K;i++){
      let d=off[i]-off[i+1]; if(d<-50) d+=100; if(d>50) d-=100;
      v.push(d); at.push(((off[0]-off[i])%100+100)%100);
    }
    return {st:+st.toFixed(2), at, v,
            w:+box.width.toFixed(1), h:+box.height.toFixed(1)};
  });
  let okRamp=false, rnote='no animation';
  if(ramp){
    const onStraight=d=>(d%50)<ramp.st;
    const fast=ramp.v.indexOf(Math.max(...ramp.v));
    const slow=ramp.v.indexOf(Math.min(...ramp.v));
    const ratio=Math.max(...ramp.v)/Math.min(...ramp.v);
    okRamp = onStraight(ramp.at[fast]) && !onStraight(ramp.at[slow]) && ratio>2;
    rnote=`pill ${ramp.w}x${ramp.h}, straight is ${ramp.st}% of the lap; `+
          `fastest at ${ramp.at[fast].toFixed(1)} (${onStraight(ramp.at[fast])?'straight':'ARC'}), `+
          `slowest at ${ramp.at[slow].toFixed(1)} (${onStraight(ramp.at[slow])?'STRAIGHT':'arc'}), `+
          `ratio ${ratio.toFixed(2)}`;
  }
  if(!okRamp) bad++;
  console.log(`${okRamp?'PASS':'FAIL'} fast down the sides, slow round the ends: ${rnote}`);

  /* THE REGRESSION THAT MATTERS. The version before this paused the
     shimmer while the deck carried .glide, on the assumption that the
     class marks a turn in progress. It does not: transitionend clears
     the gliding FLAG and leaves the CLASS on, so after the first turn
     the class is on for good and the animation stopped for good --
     running only in the moment between a finger landing and lifting.
     Nothing about this animation may depend on the page's state. */
  await pg2.evaluate(()=>document.querySelectorAll('.dots button')[2].click());
  await pg2.waitForTimeout(1500);
  const after=await pg2.evaluate(()=>{
    const rim=document.querySelector('.jump .ticket .rim .lit');
    return {glide:document.getElementById('deck').classList.contains('glide'),
            state:rim?getComputedStyle(rim).animationPlayState:'(no rim)'};});
  const okAfter = after.state==='running';
  if(!okAfter) bad++;
  console.log(`${okAfter?'PASS':'FAIL'} still running once the page has settled `+
              `(.glide ${after.glide?"ON":"off"}, the lap ${after.state})`);

  /* nothing around the button changes while it sits there */
  const samples=[];
  for(let i=0;i<8;i++){
    samples.push(await pg2.evaluate(()=>{
      const g=getComputedStyle(document.querySelector('.jump .ticket'),'::before');
      const p=getComputedStyle(document.querySelector('.jump .ticket'));
      return parseFloat(g.opacity).toFixed(2)+' '+p.borderTopColor;}));
    await pg2.waitForTimeout(300);
  }
  const steady=new Set(samples).size===1;
  if(!steady) bad++;
  console.log(`${steady?'PASS':'FAIL'} nothing flickers: ${[...new Set(samples)].join(' | ')}`);

  const frost=await pg2.evaluate(()=>{
    const cs=getComputedStyle(document.querySelector('.jump .ticket'));
    return (cs.backdropFilter||cs.webkitBackdropFilter||'none');});
  const okF = /blur/.test(frost) && /brightness/.test(frost);
  if(!okF) bad++;
  console.log(`${okF?'PASS':'FAIL'} frosted, and the filter darkens as well as blurs: ${frost}`);
  const still=await pg2.evaluate(()=>{
    /* nothing on the pill itself may be promoted: transform stays none */
    const cs=getComputedStyle(document.querySelector('.jump .ticket'));
    return cs.transform;});
  const ok4 = still==='none' || still==='matrix(1, 0, 0, 1, 0, 0)';
  if(!ok4) bad++;
  console.log(`${ok4?'PASS':'FAIL'} the pill itself is not transformed (${still})`);
  await b.close();
  console.log(bad?`\n${bad} FAILED`:'\nALL PASS');
  process.exit(bad?1:0);
})();
