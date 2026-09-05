#!/usr/bin/env python3
"""How long the highlight is, measured ALONG the outline rather than by
counting pixels. A band of 'within N px of the rectangle's sides'
balloons at the rounded ends and reports a longer lobe there than is
really drawn; walking the stadium path at even steps does not."""
from PIL import Image
import numpy as np, math, sys, os
SP=os.path.dirname(os.path.abspath(__file__))
pre=sys.argv[1] if len(sys.argv)>1 else "ev"
n=int(sys.argv[2]) if len(sys.argv)>2 else 20
thr=int(sys.argv[3]) if len(sys.argv)>3 else 200

def outline(W,H,inset,steps=1400):
    r=H/2-inset
    cx0,cx1=H/2, W-H/2
    straight=cx1-cx0
    per=2*straight+2*math.pi*r
    pts=[]
    for i in range(steps):
        d=per*i/steps
        if d<straight:                      # top, left to right
            pts.append((cx0+d, inset))
        elif d<straight+math.pi*r:          # right cap
            a=(d-straight)/r - math.pi/2
            pts.append((cx1+r*math.cos(a), H/2+r*math.sin(a)))
        elif d<2*straight+math.pi*r:        # bottom, right to left
            pts.append((cx1-(d-straight-math.pi*r), H-inset))
        else:                               # left cap
            a=(d-2*straight-math.pi*r)/r + math.pi/2
            pts.append((cx0+r*math.cos(a), H/2+r*math.sin(a)))
    return pts, per

def runs(mask):
    """longest contiguous run on a circular boolean array"""
    m=len(mask)
    if all(mask): return m
    best=cur=0; start=0
    while mask[start]: start+=1
    for k in range(m):
        i=(start+k)%m
        cur = cur+1 if mask[i] else 0
        best=max(best,cur)
    return best

rows=[]
for i in range(n):
    im=Image.open(f"{SP}/{pre}-{i}.png").convert("L")
    a=np.array(im).astype(float); H,W=a.shape
    # Sample ACROSS the band, not on one line through it. The lit ring
    # is only a few device pixels wide; a single offset that sits in it
    # on the straight sides can sit just outside it round the ends, and
    # then the lobe reads as short exactly where it is not.
    per=None; stacks=[]
    for inset in (1.5,2.5,3.5,4.5,5.5):
        pts,per=outline(W,H,inset)
        col=[]
        for (x,y) in pts:
            xi=min(max(int(round(x)),0),W-1); yi=min(max(int(round(y)),0),H-1)
            col.append(a[yi,xi])
        stacks.append(col)
    vals=[max(c[k] for c in stacks) for k in range(len(stacks[0]))]
    lit=[v>thr for v in vals]
    run=runs(lit)
    frac=run/len(lit)
    rows.append(frac*per)
    pos=(vals.index(max(vals))/len(vals))*100
    print(f"{i*0.5:5.1f}s  lobe {frac*per:6.1f}px  ({frac*100:4.1f}% of the {per:.0f}px perimeter)"
          f"   centred at {pos:5.1f}% round")
r=np.array(rows)
print(f"\nlobe length: min {r.min():.1f}  max {r.max():.1f}  mean {r.mean():.1f}px   "
      f"spread {(r.max()-r.min())/r.mean()*100:.0f}% of the mean")
