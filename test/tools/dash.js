const { launch, SITE } = require("../browser");
/* A dash is drawn to cut lowercase, so against a row set in capitals it
   sits low. This measures both mid-points off the painted glyphs -- the
   ink, via a canvas, not the line boxes, which say nothing about where
   a glyph actually is -- and prints the shift that puts them level. */
(async()=>{
  const b=await launch();
  const ctx=await b.newContext({viewport:{width:1920,height:1080}});
  const pg=await ctx.newPage();
  await pg.goto(SITE + '/index.html#artists',{waitUntil:'load'});
  await pg.waitForTimeout(1800);
  const r=await pg.evaluate(()=>{
    const li=document.querySelector('.roster li');
    const cs=getComputedStyle(li);
    const c=document.createElement('canvas').getContext('2d');
    c.font=`${cs.fontStyle} ${cs.fontWeight} 200px ${cs.fontFamily}`;
    const cap=c.measureText('M');          // a capital, ink top to ink bottom
    const dash=c.measureText('–');    // the en dash
    const capMid  = (-cap.actualBoundingBoxAscent + cap.actualBoundingBoxDescent)/2;
    const dashMid = (-dash.actualBoundingBoxAscent + dash.actualBoundingBoxDescent)/2;
    return {capAsc:cap.actualBoundingBoxAscent/200, capDesc:cap.actualBoundingBoxDescent/200,
            dashAsc:dash.actualBoundingBoxAscent/200, dashDesc:dash.actualBoundingBoxDescent/200,
            capMid:capMid/200, dashMid:dashMid/200,
            width:dash.width/200,
            roleScale:parseFloat(getComputedStyle(document.querySelector('.roster .r')).fontSize)
                      /parseFloat(cs.fontSize)};
  });
  console.log(JSON.stringify(r,null,1));
  console.log(`\ncapital M ink runs ${r.capAsc.toFixed(3)}em above the baseline`);
  console.log(`en dash sits ${r.dashAsc.toFixed(3)}em above it, ${r.width.toFixed(3)}em wide`);
  const capMid=-r.capMid, dashMid=-r.dashMid;          // ems above the baseline
  const roleMid=capMid*r.roleScale;                    // the role is set smaller
  console.log(`mid of the name's capitals ${capMid.toFixed(4)}em above the baseline`);
  console.log(`mid of the role's capitals ${roleMid.toFixed(4)}em (set at ${r.roleScale})`);
  console.log(`mid of the dash           ${dashMid.toFixed(4)}em`);
  console.log(`\n  centred on the name's capitals:  top: ${-(capMid-dashMid).toFixed(4)}em`);
  console.log(`  centred between the two:         top: ${-((capMid+roleMid)/2-dashMid).toFixed(4)}em`);
  await b.close();
})();
