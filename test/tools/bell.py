#!/usr/bin/env python3
"""Reads the phase frames two ways: the shape of one lobe along the
outline (how softly it ends) and where the lobe sits from phase to
phase (the speed profile)."""
from PIL import Image
import numpy as np, math, os, json, glob
SP=os.path.dirname(os.path.abspath(__file__)); D=SP+"/bell"
geo=json.load(open(D+"/geo.json"))
files=sorted(glob.glob(D+"/f-*.png"))
im0=np.array(Image.open(files[0]).convert("L")); H,W=im0.shape
S=W/geo["width"]            # device px per css px
PAD=4*S                     # the clip's own margin round the pill
def outline(inset,steps=1600):
    x0,y0=PAD+inset,PAD+inset
    x1,y1=W-PAD-inset,H-PAD-inset
    h=y1-y0; r=h/2
    cx0,cx1=x0+r,x1-r; straight=cx1-cx0
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
INSETS=[i*S for i in (0.5,1.0,1.5,2.0,2.5,3.0)]
RINGS=[outline(i) for i in INSETS]
PER=RINGS[0][1]; N=1600; STEP=PER/N
def trace(path):
    a=np.array(Image.open(path).convert("L")).astype(float)
    out=np.zeros(N)
    for pts,_ in RINGS:
        s=np.array([a[min(max(int(round(y)),0),H-1)][min(max(int(round(x)),0),W-1)] for x,y in pts])
        out=np.maximum(out,s)
    return out

# ---- 1. the shape of the bright lobe -------------------------------
v=trace(files[0]); floor=np.percentile(v,15); pk=int(np.argmax(v)); top=v[pk]
print(f"pill {(W-2*PAD)/S:.0f}x{(H-2*PAD)/S:.0f}css  perimeter {PER/S:.0f}css px "
      f"over {N} steps ({STEP/S:.2f}px)  floor {floor:.0f} peak {top:.0f}")
print("\n  along the rim from the peak (css px) : back / forward, share of peak")
for d in range(0,220,10):
    l=(v[(pk-d)%N]-floor)/(top-floor); r=(v[(pk+d)%N]-floor)/(top-floor)
    bar="#"*int(max(r,0)*34)
    print(f"   {d*STEP/S:6.1f}   {l*100:5.1f}%  {r*100:5.1f}%  {bar}")
def falloff(sign,hi_f=0.9,lo_f=0.2):
    hi=lo=None
    for d in range(0,900):
        f=(v[(pk+sign*d)%N]-floor)/(top-floor+1e-9)
        if hi is None and f<=hi_f: hi=d
        if hi is not None and f<=lo_f: lo=d; break
    return (lo-hi)*STEP/S if lo is not None else -1
print(f"\n  90%->20% falloff: back {falloff(-1):.1f}px, forward {falloff(1):.1f}px")

# ---- 2. where the lobe sits, phase by phase ------------------------
def peak_at(v):
    """centroid of the brightest run, in steps, wrapped"""
    f=v-np.percentile(v,15); f=np.clip(f,0,None)
    k=int(np.argmax(f))
    idx=np.arange(-160,161)
    w=f[(k+idx)%N]; w=np.clip(w-0.35*f[k],0,None)
    return (k+ (idx*w).sum()/max(w.sum(),1e-9)) % N
pos=[]
for p in files: pos.append(peak_at(trace(p)))
u=[pos[0]]
for x in pos[1:]:
    d=(x-u[-1]+N/2)%N-N/2
    u.append(u[-1]+d)
u=np.array(u); T=10.0; dt=T/len(files)
frac=(u-u[0])/N                      # laps travelled
spd=np.gradient(frac,dt)*100         # % of the lap per second
print("\n  phase   position(% of lap)   speed(% per s)")
for i in range(0,len(files),4):
    bar="#"*int(max(spd[i],0)*1.6)
    print(f"   {i*dt:5.2f}s   {frac[i]*100:7.2f}          {spd[i]:6.2f}  {bar}")
print(f"\n  travel over the lap: {(u[-1]-u[0])/N*100+ (100/len(files)):.1f}% "
      f"(expect ~100)\n  speed min {spd.min():.1f}  max {spd.max():.1f}  "
      f"ratio {spd.max()/max(spd.min(),1e-9):.2f}")

# ---- 3. the reflection, and the length round the whole lap ---------
print("\n  phase   lit peak  dim peak  ratio   lit width at half max (css px)")
rows=[]
for i in range(0,len(files),8):
    v=trace(files[i]); fl=np.percentile(v,15)
    a=v-fl
    k=int(np.argmax(a)); lit=a[k]
    # the dim lobe lives near half a lap away
    win=[(k+N//2+d)%N for d in range(-260,261)]
    dim=max(a[j] for j in win)
    half=lit/2; L=R=0
    while a[(k-L-1)%N]>half and L<N//4: L+=1
    while a[(k+R+1)%N]>half and R<N//4: R+=1
    w=(L+R)*STEP/S
    rows.append((lit,dim,w))
    print(f"   {i*T/len(files):5.2f}s   {lit:6.1f}   {dim:6.1f}   {dim/lit:5.2f}   {w:6.1f}")
ws=[r[2] for r in rows]; rs=[r[1]/r[0] for r in rows]
print(f"\n  width {min(ws):.1f}-{max(ws):.1f}px over the lap "
      f"({(max(ws)-min(ws))/ (sum(ws)/len(ws))*100:.0f}% spread); "
      f"reflection {min(rs):.2f}-{max(rs):.2f} of the bright lobe")
