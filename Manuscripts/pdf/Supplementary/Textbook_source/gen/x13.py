from x09 import mk,Q
from h import *
import math
# ---- ch13 sprinkler
def nozzle(d_mm,P_kpa,Cd=0.95): # L/min
    return 0.0 + Cd*(math.pi*d_mm**2/4*1e-6)*math.sqrt(2*P_kpa*1000/1000)*60000
def radius(d_mm,P_kpa): return 1.35*math.sqrt(d_mm*P_kpa/100*10)/1.0  # empirical m (d mm, P kPa/100=bar*...) 
rows=[]
Sl=12.0;Sm=18.0
for d,P in ((4.0,300),(4.8,350),(5.6,350),(6.4,400)):
    q=nozzle(d,P)*60/1000 # m3/h
    R=0.9*math.sqrt(d*P/100*1.0)*1.2*1.0
    R=3.4*math.sqrt(d*(P/100))
    app=q*1000/(Sl*Sm)
    rows.append([ '%.1f'%d,'%.0f'%P,'%.2f'%q,'%.1f'%R,'%.1f'%app,'%.2f'%(Sl/(2*R))])
tab=tabl(['Nozzle (mm)','Pressure (kPa)','$q$ (m$^3$/h)','$R$ (m)','App. rate (mm/h)','$S_l/2R$'],rows,'Sprinkler nozzle alternatives on a $12\\times18$ m rectangular spacing.','rrrrrr')
Sl=12;Sm=18
d,P=4.8,350
q=nozzle(d,P)*60/1000;app=q*1000/(Sl*Sm)
tset=60*9/app/60 if False else 9.0/app # hours for 9 mm gross
mk(13,"classify sprinkler systems; compute the nozzle discharge and the wetted radius; choose the spacing from the overlap rule; compute application rate, set time and the Christiansen uniformity; and size the lateral with the 20 per cent rule.",
 [('Introduction',[Q(r"A sprinkler system imitates rain: water under pressure leaves through a nozzle, breaks into drops and falls on the crop. It can irrigate land that is not level, it can apply small depths, and it can be automated. Its drawbacks are energy (the pressure), wind drift and evaporation from the drops, and wetting of the leaves. This chapter gives the design from the nozzle to the lateral.")]),
  ('Types of sprinkler systems',[Q(r"Sprinkler systems are \emph{set} (portable or solid-set laterals moved between positions), \emph{continuous-move} (centre pivot, linear move, travelling gun) and \emph{permanent}. Solid-set systems need many sprinklers and pipes but little labour; pivots need little pipe but a smooth ground and an even application rate that rises towards the end.")]),
  ('Nozzle discharge and wetted radius',[Q(r"The discharge of a nozzle follows the orifice law $q=C_dA\sqrt{2gH}$. For $d=%.1f$ mm and a pressure of %d kPa with $C_d=0.95$, $q=%.2f$ m$^3$\,h$^{-1}$. The wetted radius grows with the nozzle size and the pressure; an empirical form is $R=3.4\sqrt{d\,P}$ with $d$ in mm and $P$ in bar, which gives $R=%.1f$ m here."%(d,P,q,3.4*math.sqrt(d*P/100)))]),
  ('Spacing and application rate',[Q(r"With the sprinklers on a rectangular spacing $S_l\times S_m$ the application rate is $I=q/(S_lS_m)$; here $I=%.1f$ mm\,h$^{-1}$, which must be below the infiltration rate of the soil, or runoff follows. The spacing is chosen at 50 to 65 per cent of the wetted diameter, less in wind."%app)]),
  ('Uniformity',[Q(r"Christiansen's coefficient is $CU=100\bigl(1-\sum|z_i-\bar z|/\sum z_i\bigr)$ from catch-can depths $z_i$; 85 per cent or more is the target. For the depths 11, 12, 9, 13, 10, 12, 8, 11 mm: mean %.2f, $\sum|z-\bar z|=%.2f$, $CU=%.1f$ per cent."%(sum([11,12,9,13,10,12,8,11])/8,sum(abs(z-sum([11,12,9,13,10,12,8,11])/8) for z in [11,12,9,13,10,12,8,11]),100*(1-sum(abs(z-sum([11,12,9,13,10,12,8,11])/8) for z in [11,12,9,13,10,12,8,11])/sum([11,12,9,13,10,12,8,11]))))])
 ],
 'Design project 13: a solid-set sprinkler block for alfalfa','sec:proj13',
 [Q(r"\textbf{Brief.} A 12-ha block of alfalfa on a sandy loam (basic intake 15 mm\,h$^{-1}$) is to be irrigated by a solid-set system with sprinklers on a $12\times18$ m rectangle. The peak $ET_c$ is 8 mm\,d$^{-1}$ and the application efficiency is 0.80, so the gross depth for a 5-day interval is $8\times5/0.8=50$ mm. The designer compares four nozzles for the application rate.")],
 tab+Q(r"\textbf{Reading.} The nozzle of %.1f mm at %d kPa gives %.1f mm\,h$^{-1}$, below the intake rate of 15 mm\,h$^{-1}$, so there is no runoff; the set time for the 50 mm is $%.1f$ h, and two sets a day complete the block. The number of sprinklers in operation is the block area divided by the spacing, $12\times10^4/216=%d$, for a system flow of %.0f m$^3$\,h$^{-1}$ if the whole block runs at once."%(d,P,app,50/app,int(120000/216),q*120000/216)),
 [(r"Discharge of a 5-mm nozzle at 300 kPa.","%.2f m$^3$/h"%(nozzle(5,300)*60/1000)),(r"Application rate for $q=1.8$ m$^3$/h, $12\times12$.","%.1f mm/h"%(1.8*1000/144)),(r"Set time for 40 mm at 8 mm/h.","5 h"),(r"Spacing at 60 per cent of a 36-m diameter.","%.1f m"%(0.6*36)),(r"$CU$ for depths 10, 12, 8, 10.","%.1f per cent"%(100*(1-(0+2+2+0)/40))),(r"Gross depth for $ET=6$, 4 d, $E_a=0.75$.","%.0f mm"%(6*4/0.75)),(r"Name two continuous-move systems.","pivot, linear move"),(r"Why is wind a problem?","drift distorts pattern"),(r"What is the 20 per cent rule?","lateral pressure variation under 20 per cent"),(r"Number of sprinklers for 8 ha at $12\times12$.","%.0f"%(80000/144))],
 [r"Name three sprinkler system types.",r"What sets the wetted radius?",r"What is Christiansen's coefficient?",r"Why must $I$ be below the intake rate?",r"What is the 20 per cent rule?",r"How does wind change the spacing?",r"Why does a pivot's rate rise to the end?",r"How do you find the set time?"],
 [(r"$I=$",["$q/(S_lS_m)$","$qS$","$q+S$","none"],0),(r"CU target",["85 per cent","10","20","none"],0),(r"Pivot is",["continuous-move","basin","furrow","none"],0),(r"Wind",["distorts","helps","none","rain"],0),(r"Orifice law uses",["$\\sqrt{2gH}$","$gH$","$H$","none"],0),(r"Spacing is a fraction of",["diameter","depth","time","none"],0),(r"Solid set has",["fixed laterals","no pipes","no pumps","none"],0),(r"$I$ below",["intake","rain","ET","none"],0),(r"Set time = depth/",["rate","time","area","none"],0),(r"Sprinkle loses",["drift","nothing","none","gold"],0)])
print('ok13')
