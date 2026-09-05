#!/usr/bin/env python3
"""Speed against POSITION on the outline. The straights and the arcs
are marked, because the whole point of this profile is that the light
runs down one and dwells round the other."""
from PIL import Image
import numpy as np, math, os, json, glob, sys
SP=os.path.dirname(os.path.abspath(__file__)); D=f"{SP}/shape-{sys.argv[1]}"
geo=json.load(open(D+"/geo.json")); files=sorted(glob.glob(D+"/f-*.png"))
im0=np.array(Image.open(files[0]).convert("L")); H,W=im0.shape
S=W/geo["width"]; PAD=4*S
def outline(inset,steps=1600):
    x0,y0=PAD+inset,PAD+inset; x1,y1=W-PAD-inset,H-PAD-inset
    h=y1-y0; r=h/2; cx0,cx1=x0+r,x1-r; straight=cx1-cx0
    per=2*straight+2*math.pi*r; pts=[]
    for i in range(steps):
        d=per*i/steps
        if d<straight: pts.append((cx0+d,y0))
        elif d<straight+math.pi*r:
            a=(d-straight)/r-math.pi/2; pts.append((cx1+r*math.cos(a),y0+r+r*math.sin(a)))
        elif d<2*straight+math.pi*r: pts.append((cx1-(d-straight-math.pi*r),y1))
        else:
            a=(d-2*straight-math.pi*r)/r+math.pi/2; pts.append((cx0+r*math.cos(a),y0+r+r*math.sin(a)))
    return pts,per
RINGS=[outline(i*S) for i in (0.5,1.0,1.5,2.0,2.5,3.0)]
PER=RINGS[0][1]; N=1600
def trace(path):
    a=np.array(Image.open(path).convert("L")).astype(float); out=np.zeros(N)
    for pts,_ in RINGS:
        out=np.maximum(out,np.array([a[min(max(int(round(y)),0),H-1)][min(max(int(round(x)),0),W-1)]
                                     for x,y in pts]))
    return out
def peak_at(v):
    f=np.clip(v-np.percentile(v,15),0,None); k=int(np.argmax(f))
    idx=np.arange(-200,201); w=np.clip(f[(k+idx)%N]-0.35*f[k],0,None)
    return (k+(idx*w).sum()/max(w.sum(),1e-9))%N

pw,ph=geo["pillW"],geo["pillH"]
st=(pw-ph)/(2*(pw-ph)+math.pi*ph)*100        # the straight's share, per cent of the lap
print(f"pill {pw}x{ph}   straight {st:.2f}% of the lap, arc {50-st:.2f}%   "
      f"perimeter {PER/S:.0f}px")

pos=[peak_at(trace(p)) for p in files]
u=[pos[0]]
for x in pos[1:]:
    u.append(u[-1]+((x-u[-1]+N/2)%N-N/2))
u=np.array(u)*100/N; T=10.0; dt=T/len(files)
spd=np.gradient(u,dt)
where=(u-u[0])%100                            # 0 is the start of the top straight

def seg(d):
    d%=50
    return "straight" if d<st else "arc"
print("\n  position on the outline        speed (% of the lap per second)")
order=np.argsort(where)
for j in order[::3]:
    d=where[j]; bar="#"*int(spd[j]*1.7)
    print(f"   {d:6.2f}  {seg(d):8}   {spd[j]:6.2f}  {bar}")
sm=[spd[j] for j in range(len(u)) if seg(where[j])=="straight"]
am=[spd[j] for j in range(len(u)) if seg(where[j])=="arc"]
mids=[spd[j] for j in range(len(u)) if abs((where[j]%50)-st/2)<3]
mida=[spd[j] for j in range(len(u)) if abs((where[j]%50)-(st+50)/2)<3]
print(f"\n  straights: mean {np.mean(sm):.2f}   arcs: mean {np.mean(am):.2f}   "
      f"ratio {np.mean(sm)/np.mean(am):.2f}")
print(f"  mid-straight {np.mean(mids):.2f}   mid-arc {np.mean(mida):.2f}   "
      f"ratio {np.mean(mids)/np.mean(mida):.2f}")
print(f"  lap travelled {(u[-1]-u[0])*len(files)/(len(files)-1):.1f}%")
