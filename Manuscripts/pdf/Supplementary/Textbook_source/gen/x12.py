from x09 import mk,Q
from h import *
import math
# ---- ch12 drip: emitter, lateral Hazen-Williams, EU
def hw(Q_lps,C,D_mm,L): # head loss m, Q in L/s
    Q=Q_lps/1000;D=D_mm/1000
    return 10.67*L*Q**1.852/(C**1.852*D**4.871)
q0,x=1.6,0.5  # L/h, exponent
H0=10.0 # m
Sl,Se,Lat,Dl=0.5,0.3,100.,16.0
# lateral: 100 m, emitters every 0.5 m -> 200 emitters; Christiansen F=0.36 (m=1.852 N=200)
N=int(Lat/Se*0+Lat/0.5);Ql=N*q0/3600  # L/s
F=1/2.852+1/(2*N)+math.sqrt(1.852-1)/(6*N**2)
hf=hw(Ql,150,Dl,Lat)*F
# pressure variation: q ~ H^x
rows=[]
for D in (14.0,16.0,18.0,20.0):
    hfD=hw(Ql,150,D,Lat)*F
    Hmax=H0;Hmin=H0-hfD
    qmin=q0*(Hmin/H0)**x;qavg=q0*(1-0.5*(1-(Hmin/H0)**x))
    EU=100*(1-1.27*0.03/math.sqrt(1))*qmin/qavg
    rows.append(['%.0f'%D,'%.2f'%hfD,'%.1f'%(100*hfD/H0),'%.3f'%(qmin),'%.1f'%EU])
tab=tabl(['Lateral $D$ (mm)','$h_f$ (m)','$h_f/H_0$ (\\%)','$q_{min}$ (L/h)','$EU$ (\\%)'],rows,'Lateral diameter alternatives for $L=100$ m with 200 emitters of 1.6 L/h at 10 m head.','rrrrr')
# set time for drip: Tn = Id/(q*N per plant) ; plant spacing 0.5 x 1.5, ET peak 6 mm/d, Kr 0.8
ETc=6.0*0.8;area=0.5*1.5;Vd=ETc*area; qpp=1.6; T=Vd/qpp
mk(12,"design a drip system from the emitter outward: relate discharge to pressure, compute lateral head loss with Hazen--Williams and the Christiansen factor, select the lateral diameter by emission uniformity, compute the set time, and size the manifold and filter.",
 [('Introduction',[Q(r"Drip (trickle) irrigation delivers water at a few litres per hour to the root zone through emitters on small tubes. The design follows the water from the emitter backwards: the emitter sets the discharge, the lateral the pressure variation, the submain and main the pressure at the head, and the filter and pump the energy. A design is good when the emission uniformity is above about 90 per cent.")]),
  ('Types of drip systems',[Q(r"Drip is of three kinds: \emph{point-source} emitters (drippers on the line or in-line), \emph{line-source} (dripperline with continuous emitters) and \emph{subsurface} (SDI, buried). Emitters may be \emph{pressure compensating} (the discharge is constant over a range of pressures, $x\approx0$) or \emph{non-compensating} ($x$ from 0.5 to 1).")]),
  ('Emitter hydraulics',[Q(r"The discharge of an emitter is $q=K_dH^{x}$. A turbulent-flow emitter has $x=0.5$: with $q_0=%.1f$ L\,h$^{-1}$ at $H_0=%.0f$ m, a loss of 1.5 m of head gives $q=%.2f$ L\,h$^{-1}$, a fall of %.1f per cent."%(q0,H0,q0*(8.5/10)**0.5,100*(1-(8.5/10)**0.5)))]),
  ('Lateral design',[Q(r"The Hazen--Williams head loss in a pipe is $h_f=10.67\,L\,Q^{1.852}/(C^{1.852}D^{4.871})$ with $Q$ in m$^3$\,s$^{-1}$ and $D$ in m. For a lateral with outlets the loss is multiplied by the Christiansen factor $F=\frac{1}{m+1}+\frac{1}{2N}+\frac{\sqrt{m-1}}{6N^2}$, which for $m=1.852$ and $N=%d$ outlets is %.3f. The lateral of 100 m with %d emitters carries %.3f L\,s$^{-1}$."%(N,F,N,Ql))]),
  ('Emission uniformity',[Q(r"The \kw{emission uniformity} is $EU=100(1-1.27\,CV/\sqrt{n_e})\,q_{min}/q_{avg}$. It combines the manufacturing variation $CV$ (here 0.03) and the pressure variation along the lateral. An EU above 90 per cent is excellent, 80--90 acceptable and below 70 unacceptable.")]),
 ],
 'Design project 12: a drip lateral and irrigation set for a vegetable block','sec:proj12',
 [Q(r"\textbf{Brief.} A lateral of 100 m carries 200 in-line emitters at 0.5-m spacing, with an inlet head of 10 m and a coefficient $x=0.5$. The designer chooses the diameter from the table; peak crop water use is 6 mm\,d$^{-1}$ with a ground cover factor of 0.8, plants at 0.5 by 1.5 m, with one emitter per plant of 1.6 L\,h$^{-1}$.")],
 tab+Q(r"\textbf{Set time.} The daily volume per plant is $%.1f\times%.2f=%.2f$ L; one emitter at 1.6 L\,h$^{-1}$ needs $T=%.1f$ h of operation per day. Splitting the lateral into two sets of %.0f emitters halves the flow at the head, which cuts the pipe size or the loss. The choice of the designer is the smallest diameter with $EU\ge90$ per cent."%(ETc,area,Vd,T,N/2)),
 [(r"Emitter discharge at 7 m if $q_0=2$ at 10 m, $x=0.5$.","%.2f L/h"%(2*(0.7)**0.5)),(r"Christiansen $F$ for $m=1.852$, $N=100$.","%.3f"%(1/2.852+1/200+math.sqrt(0.852)/60000)),(r"HW loss for $Q=0.1$ L/s, $C=150$, $D=16$, $L=50$.","%.2f m"%hw(0.1,150,16,50)),(r"EU for $q_{min}=1.5$, $q_{avg}=1.6$, $CV=0.04$, $n_e=1$.","%.1f"%(100*(1-1.27*0.04)*1.5/1.6)),(r"Hours per day if need is 3.2 L per plant, 2 emitters of 1.6.","1.0 h"),(r"Name two kinds of drip emitters.","compensating; non-compensating"),(r"Why does a larger $D$ raise EU?","lower head loss"),(r"What is the acceptable EU range?","80-90 per cent"),(r"What is SDI?","subsurface drip"),(r"Daily volume per plant for 5 mm/d, $0.4\times1.2$ m, $K_r=0.7$.","%.2f L"%(5*0.7*0.4*1.2))],
 [r"List the components of a drip system.",r"What does the exponent $x$ measure?",r"What is the Christiansen factor for?",r"How is EU computed?",r"Why do drip systems need filtration?",r"What is a pressure-compensating emitter?",r"What limits the length of a lateral?",r"How is the set time found?"],
 [(r"$q=$",["$K_dH^x$","$K/H$","$H/K$","$K+H$"],0),(r"$x=0$ means",["compensating","laminar","leaking","none"],0),(r"$F$ depends on",["$N$ and $m$","rain","salt","none"],0),(r"EU above 90 is",["excellent","poor","none","fail"],0),(r"Drip needs",["filters","pumps off","tanks only","none"],0),(r"HW uses",["$C$","$n$","$f$","$\\mu$"],0),(r"SDI is",["buried","sprayed","flood","none"],0),(r"Smaller $D$",["more loss","less loss","none","rain"],0),(r"Lateral length is limited by",["head loss","rain","soil","sun"],0),(r"Set time = volume/",["discharge","rain","depth","none"],0)])
print('ok12')
