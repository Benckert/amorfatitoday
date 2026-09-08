#!/usr/bin/env python3
"""The light should run down the long sides and dwell round the ends,
so its speed is a function of WHERE IT IS on the outline, not of how
far through the lap it is. Emits the linear() easing that does it.

A stadium's outline is straight, arc, straight, arc, and the two of
each are equal, so the profile repeats every half lap exactly — which
is also what keeps the two lobes opposite."""
import math

# The straight's share of the perimeter, in per cent, at the four pill
# shapes the page actually renders (w x h, measured by pillbox.js):
for w,h in ((133,41),(182,55),(139,45),(121,41)):
    s=w-h; r=h/2; arc=math.pi*r; per=2*s+2*arc
    print(f"  {w}x{h}: straight {s/per*100:5.2f}%  arc {arc/per*100:5.2f}%  perimeter {per:.0f}px")
S=29.0            # the straight's share, one profile for all four
AMP=0.5           # speed swings 1 +/- AMP, so fastest/slowest = 3.0
MID=S/2           # fastest at the middle of a straight
def v(d): return 1+AMP*math.cos(2*math.pi*(d-MID)/50)

N=20000
dd=100/N
t=[0.0]
for i in range(N):
    t.append(t[-1]+dd/v(i*dd+dd/2))
T=t[-1]
tn=[x/T for x in t]                      # time, 0..1, at each distance step

POINTS=96
out=[]
for k in range(POINTS+1):
    tt=k/POINTS
    lo,hi=0,N
    while hi-lo>1:
        mid=(lo+hi)//2
        if tn[mid]<tt: lo=mid
        else: hi=mid
    span=tn[hi]-tn[lo]
    f=0 if span==0 else (tt-tn[lo])/span
    d=(lo+f)*dd
    out.append((tt,d/100))
print(f"\nhalf-lap check: distance at t=50% is {out[POINTS//2][1]*100:.4f} (want 50)")
sp=[(out[i+1][1]-out[i][1])*POINTS for i in range(POINTS)]
print(f"speed {min(sp)*100:.1f} to {max(sp)*100:.1f} per cent of the lap per unit time, "
      f"ratio {max(sp)/min(sp):.2f}; biggest step between neighbours "
      f"{max(abs(sp[i+1]-sp[i])/sp[i] for i in range(len(sp)-1))*100:.1f}%")

terms=[]
for k,(tt,dv) in enumerate(out):
    if k==0: terms.append("0")
    elif k==POINTS: terms.append("1")
    else: terms.append(f"{dv:.4f} {tt*100:.4g}%")
line="linear("+", ".join(terms)+")"
print(f"\n{len(line)} chars\n")
# wrapped for the stylesheet
import textwrap
print("\n".join(textwrap.wrap(line,68,subsequent_indent="  ")))
