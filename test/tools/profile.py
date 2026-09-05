#!/usr/bin/env python3
"""The brightness profile ALONG the outline through one lobe, so the
shape of its ends can be read rather than guessed."""
from PIL import Image
import numpy as np, math, sys, os
SP=os.path.dirname(os.path.abspath(__file__))
pre=sys.argv[1]; idx=int(sys.argv[2])
def outline(W,H,inset,steps=1200):
    r=H/2-inset; cx0,cx1=H/2,W-H/2; straight=cx1-cx0
    per=2*straight+2*math.pi*r; pts=[]
    for i in range(steps):
        d=per*i/steps
        if d<straight: pts.append((cx0+d,inset))
        elif d<straight+math.pi*r:
            a=(d-straight)/r-math.pi/2; pts.append((cx1+r*math.cos(a),H/2+r*math.sin(a)))
        elif d<2*straight+math.pi*r: pts.append((cx1-(d-straight-math.pi*r),H-inset))
        else:
            a=(d-2*straight-math.pi*r)/r+math.pi/2; pts.append((cx0+r*math.cos(a),H/2+r*math.sin(a)))
    return pts,per
a=np.array(Image.open(f"{SP}/{pre}-{idx}.png").convert("L")).astype(float); H,W=a.shape
stacks=[]
for inset in (1.5,2.5,3.5,4.5,5.5):
    pts,per=outline(W,H,inset)
    stacks.append([a[min(max(int(round(y)),0),H-1)][min(max(int(round(x)),0),W-1)] for x,y in pts])
v=np.array([max(c[k] for c in stacks) for k in range(len(stacks[0]))])
m=len(v); step=per/m
k0=int(np.argmax(v))
base=np.percentile(v,20)
print(f"perimeter {per:.0f}px over {m} steps ({step:.2f}px each); floor {base:.0f}, peak {v[k0]:.0f}")
print("\nprofile through the lobe, from its peak outwards (px from peak : brightness)")
for d in range(0,90,4):
    l=v[(k0-d)%m]; r=v[(k0+d)%m]
    barl="#"*int((l-base)/ (v[k0]-base) * 30) if v[k0]>base else ""
    print(f"  {d*step:5.1f}px   back {l:5.0f}  fwd {r:5.0f}   {barl}")
# how many px to fall from 90% to 20% of the peak
def falloff(sign):
    hi=None;lo=None
    for d in range(0,300):
        val=v[(k0+sign*d)%m]
        f=(val-base)/(v[k0]-base+1e-9)
        if hi is None and f<=0.9: hi=d
        if f<=0.2: lo=d; break
    return (lo-hi)*step if hi is not None and lo is not None else -1
print(f"\nfall from 90% to 20% of the peak: back {falloff(-1):.1f}px, forward {falloff(1):.1f}px")
