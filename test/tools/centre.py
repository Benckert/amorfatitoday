#!/usr/bin/env python3
"""PASS/FAIL for the poem's placement. Run scratchpad/centre.js first;
it writes the block geometry and one screenshot per size. The shirt is
found in the RENDERED pixels -- bright and nearly neutral, which is the
cotton and not the warm streaks across it -- so this checks the result
rather than re-deriving the formula that produced it."""
from PIL import Image
import numpy as np, json, sys, os
SP=os.path.dirname(os.path.abspath(__file__))
data=json.load(open(SP+"/centre.json"))
bad=0
print(f"{'size':>12}  {'gap left':>9} {'gap right':>10}  {'diff':>6}   shirt at")
for w,h,g in data:
    a=np.array(Image.open(f"{SP}/c-{w}x{h}.png").convert("RGB")).astype(int)
    lum=(a[...,0]*299+a[...,1]*587+a[...,2]*114)//1000
    sat=a.max(axis=2)-a.min(axis=2)
    cols=((lum>195)&(sat<38)).sum(axis=0)
    shirt=min(x for x in range(w) if cols[x]>12)
    gl=g["left"]; gr=shirt-g["right"]; d=gl-gr
    ok=abs(d)<=3
    if not ok: bad+=1
    print(f"{'PASS' if ok else 'FAIL'} {w}x{h:<7} {gl:9d} {gr:10d}  {d:+6d}   {shirt:6d}")
print(f"\n{bad} FAILED" if bad else "\nALL PASS")
sys.exit(1 if bad else 0)
