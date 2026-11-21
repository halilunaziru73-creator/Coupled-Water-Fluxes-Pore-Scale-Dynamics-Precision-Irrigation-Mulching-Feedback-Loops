from x09 import mk,Q
from h import *
import math
from scipy.optimize import brentq
# ---- ch11 surface irrigation: furrow design
k_,a_,f0=0.0040,0.55,0.0001  # Kostiakov m3/m/min^a, m3/m/min
n=0.04;S0=0.002;L=250.;Zreq=0.060;sp=0.75  # spacing m
Zreq_m=Zreq
# required intake opportunity time: Z = k t^a + f0 t   (m3/m per m => divide by spacing)  here Z in m3/m of furrow
Zv=Zreq*sp  # m3/m
tn=brentq(lambda t:k_*t**a_+f0*t-Zv,1,2000)
# Manning furrow flow: Q = (1/n) A R^(2/3) S^(1/2); trapezoid-ish; use wide approx A=0.012 m2, R=0.05
A=0.012;R=0.05;Qmax=(1/n)*A*R**(2/3)*math.sqrt(S0)*1000 # L/s
Qmaxcrit=0.6/S0*1.0  # erosion limit L/s (Criddle)  
Qe=0.63/(S0*100)  # L/s, Criddle q=0.63/S
# advance: Wr power law x = p t^r  with r from intake exponent
r=0.6
def adv(Q):
    # volume balance: Q t = sigma_y A0 x + sigma_z k t^a x ;  solve for t at x=L (surface storage 0.77 A0 x -> 0.8 A... ) 
    A0=0.010;sy=0.77*A0;sz=(a_+r*(1-a_)+1)/((1+a_)*(1+r))
    g=lambda t:Q*60/1000*t - sy*L-(sz*k_*t**a_+f0*t*0.5)*L
    return brentq(g,5,5000)
Qs=[0.9,1.2,1.6,2.0];rows=[]
for q in Qs:
    ta=adv(q);tco=ta+0.5*0 ;tl=tn+ (0.0) ;
    # cutoff when opportunity time at tail ~= tn : t_co = tn + ta  (rough: Tco=ta+tn... ) 
    tco=tn+ta*0.5
    V=q*60/1000*tco;Va=V/(L*sp)*1000
    Ea=Zreq*1000*L*sp/(q*60*tco)*100 if False else Zreq*1000/Va*100
    rows.append([q,'%.0f'%ta,'%.0f'%tco,'%.0f'%Va,'%.0f'%min(100,Ea)])
tab=tabl(['$q_0$ (L/s)','Advance (min)','Cut-off (min)','Applied depth (mm)','$E_a$ (\\%)'],[[('%.1f'%r_[0])]+r_[1:] for r_ in rows],'Furrow design alternatives for $L=250$ m, $S_0=0.002$, spacing 0.75 m.','rrrrr')
mk(11,"classify surface irrigation systems; compute the intake opportunity time from the Kostiakov--Lewis equation; size a furrow with Manning's equation and the erosive limit; estimate advance and cut-off by volume balance; and choose the inflow that maximises application efficiency.",
 [('Introduction',[Q(r"Surface irrigation spreads water over the soil by gravity: the water advances across the field, soaks in and, after the inflow is cut, recedes or ponds. It irrigates most of the world's irrigated land, because it is cheap. Its performance depends on a small number of things: the intake of the soil, the slope, the roughness, the length, and the inflow and cut-off time. This chapter gives the design of the furrow, border and basin, with a full worked furrow.")]),
  ('Types of surface irrigation',[Q(r"There are three. In \emph{basins} the water is ponded on level land and the soil drinks it; the design is the volume per basin. In \emph{borders} a strip of land is irrigated by a sheet of water that advances down a gentle slope. In \emph{furrows} the water runs in small channels between crop rows and wets the soil sideways; furrows suit row crops and give the farmer the most control. Basins need flat land and a large flow; borders suit close-growing crops such as wheat and alfalfa; furrows suit maize, cotton and vegetables.")]),
  ('Soil intake',[Q(r"The cumulative intake per unit length of furrow is $Z=k\tau^{a}+f_0\tau$ (Kostiakov--Lewis), with the opportunity time $\tau$ in minutes. With $k=%.4f$ m$^3$\,m$^{-1}$\,min$^{-a}$, $a=%.2f$ and $f_0=%.4f$ m$^3$\,m$^{-1}$\,min$^{-1}$, a required depth of %.0f mm over a spacing of %.2f m means $Z=%.4f$ m$^3$\,m$^{-1}$; solving $k\tau^a+f_0\tau=Z$ gives $\tau_n=%.0f$ min."%(k_,a_,f0,Zreq*1000,sp,Zv,tn))]),
  ('Flow in the furrow',[Q(r"The flow of the furrow follows Manning's equation $Q=\frac{1}{n}AR^{2/3}S_0^{1/2}$. With $n=0.04$, $A=0.012$ m$^2$, $R=0.05$ m and $S_0=0.002$ the carrying capacity is $%.1f$ L\,s$^{-1}$; the safe inflow against erosion is Criddle's $q_{max}=0.63/S_0(\%%)$ = %.1f L\,s$^{-1}$ for a slope of %.1f per cent."%(Qmax,Qe,S0*100)),])
 ],
 'Design project 11: a furrow system for 250-m runs','sec:proj11',
 [Q(r"\textbf{Brief.} A furrow system on a clay loam of slope 0.002 is to deliver a net depth of 60 mm in furrows 250 m long and 0.75 m apart. The required opportunity time is %.0f min. The designer tries four inflows from 0.9 to 2.0 L\,s$^{-1}$ and compares the advance time, the cut-off time and the efficiency. The advance is solved from a volume balance with surface storage $\sigma_y A_0$ and subsurface storage $\sigma_z k t^a$."%tn)],
 tab+Q(r"\textbf{Reading the table.} A larger inflow advances faster, so the head of the field is not over-watered while the tail is wet: efficiency rises. The erosive limit of %.1f L\,s$^{-1}$ caps the choice; the designer takes the largest stable flow that stays inside the limit, and chooses cut-off from the opportunity-time requirement. The tail-water can be reused or cut back."%Qe),
 [(r"Intake after 120 min for $k=0.01$, $a=0.6$, $f_0=0.0004$.","%.3f m$^3$/m"%(0.01*120**0.6+0.0004*120)),(r"Manning flow for $n=0.035$, $A=0.015$, $R=0.06$, $S=0.003$.","%.1f L/s"%(1/0.035*0.015*0.06**(2/3)*math.sqrt(0.003)*1000)),(r"Criddle limit for $S=0.4$ per cent.","%.2f L/s"%(0.63/0.4)),(r"Depth applied for $q=1.0$ L/s, 200 min, $L=200$, spacing 1.0.","%.0f mm"%(1.0*60*200/1000/(200*1.0)*1000)),(r"Application efficiency if 55 mm of 75 mm is stored.","%.0f per cent"%(55/75*100)),(r"Name the three surface systems.","basin, border, furrow"),(r"Why does higher inflow improve uniformity?","faster advance"),(r"What is $\sigma_z$?","subsurface shape factor"),(r"What does cut-off time mean?","inflow stopped"),(r"A basin 40 m by 30 m, 70 mm. Volume?","%.0f m$^3$"%(40*30*0.07))],
 [r"Name the three surface systems.",r"What is the opportunity time?",r"State the Kostiakov--Lewis equation.",r"How does Manning's equation relate to flow?",r"What is the erosion limit?",r"What does volume balance give?",r"Why is tail water reused?",r"How do you choose cut-off?"],
 [(r"Furrows suit",["row crops","rice","none","lakes"],0),(r"Criddle gives",["max stable flow","rain","salinity","cost"],0),(r"$Z=$",["$k\\tau^a+f_0\\tau$","$kP$","$K S$","$\\theta$"],0),(r"Basins are",["level","steep","sloped","dry"],0),(r"Higher inflow",["speeds advance","stops it","does nothing","adds rain"],0),(r"Cut-off ends",["inflow","rain","crop","season"],0),(r"Manning uses",["$n$","$C$","$f$","$\\mu$"],0),(r"Efficiency is stored/",["applied","rain","ET","none"],0),(r"Borders suit",["wheat","tomato","none","rice only"],0),(r"Tail water is",["runoff","rain","dew","none"],0)])
print('ok11')
