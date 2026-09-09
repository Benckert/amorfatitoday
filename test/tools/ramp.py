#!/usr/bin/env python3
"""The light should run down the long sides and dwell round the ends,
so its speed is a function of WHERE IT IS on the outline, not of how
far through the lap it is. Emits the linear() easing that does it.

A stadium's outline is straight, arc, straight, arc, and the two of
each are equal, so the profile repeats every half lap exactly — which
is also what keeps the two lobes opposite.

MID=S/2 puts the fastest point in the middle of a straight, which is
this. MID=S/2+25 puts it in the middle of an arc and runs the whole
thing backwards; that was tried and set aside."""
import math

# Every pill the page renders, measured rather than remembered — the
# list this replaced held four shapes, none of which it renders any
# more. Regenerate with the sweep in test/tools/ (a pill per distinct
# rounded size) when the button's type or padding changes.
PILLS=((117.7,41),(124.9,41.8),(135,44.9),(148.4,49.1),(176.7,55.5),(128.7,41.4))
shares=[]
for w,h in PILLS:
    st=w-h; arc=math.pi*h/2; per=2*st+2*arc
    shares.append(st/per*100)
    print(f"  {w}x{h}: straight {st/per*100:5.2f}%  arc {arc/per*100:5.2f}%  perimeter {per:.0f}px")

# ONE PROFILE HAS TO SERVE ALL OF THEM, and the figure that is least
# wrong everywhere is the midpoint of the range, not a round number
# near it. 29.0 was the round number: it sat 1.82% of the lap from the
# narrowest pill, where the midpoint is 0.95 from the furthest of them.
S=(min(shares)+max(shares))/2
print(f"\n  straight runs {min(shares):.2f} to {max(shares):.2f}, so S={S:.2f}")
print(f"  worst phase error  S=29.00 {max(abs(x-29) for x in shares):.2f}%"
      f"   S={S:.2f} {max(abs(x-S) for x in shares):.2f}%")
AMP=0.5           # speed swings 1 +/- AMP, so fastest/slowest = 3.0
MID=S/2           # fastest at the middle of a straight
def v(d): return 1+AMP*math.cos(2*math.pi*(d-MID)/50)

# WHAT THE EYE READS IS THE TIME SPLIT, not the speed ratio -- the
# lesson of running this backwards. The straights are the longer part
# of the outline, so a profile that is fast on them compresses their
# share of the lap and one that is slow on them compounds it: the same
# amplitude reads as a mild dwell one way round and a crawl the other.
def split():
    n=200000; dd=100/n; ts=ta=0.0
    for i in range(n):
        d=i*dd+dd/2; dt=dd/v(d)
        if (d%50)<S: ts+=dt
        else: ta+=dt
    return ts/(ts+ta)*100, ta/(ts+ta)*100
_ts,_ta=split()
print(f"  distance: straights {2*S:.0f}% of the outline, arcs {100-2*S:.0f}%")
print(f"  time:     straights {_ts:.1f}%, arcs {_ta:.1f}%")

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
