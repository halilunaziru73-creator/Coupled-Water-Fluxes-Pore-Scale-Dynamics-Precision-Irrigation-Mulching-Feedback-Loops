from x09 import mk,Q
from h import *
import math
from scipy.optimize import brentq
# ---- ch14 drainage + salinity: Hooghoudt with equivalent depth, leaching requirement
K1,K2=0.8,0.3  # m/d above / below drain level
q=0.007 # m/d design discharge
h=0.5; D_imp=6.0 # depth to barrier below drains
r0=0.1 # drain radius
def de(L,d):
    if d/L<0.3:
        return d/(1+d/L*(8/math.pi*math.log(d/r0)-3.4))
    return min(d,math.pi*L/(8*(math.log(L/r0)-1.15)))
rows=[]
for dd in (1.2,1.5,1.8,2.1):
    d=D_imp-dd+0.0 if False else (D_imp-dd)
    f=lambda L:(8*K2*de(L,d)*h+4*K1*h*h)/L**2-q
    L=brentq(f,5,200)
    rows.append([ '%.1f'%dd,'%.1f'%d,'%.1f'%de(L,d),'%.0f'%L,'%.0f'%(10000/L)])
tab=tabl(['Drain depth (m)','$d$ (m)','$d_e$ (m)','Spacing $L$ (m)','Drain length (m/ha)'],rows,'Hooghoudt spacings for $q=7$ mm/d, $h=0.5$ m, $K_1=0.8$, $K_2=0.3$ m/d, barrier at 6 m.','rrrrr')
ECw,ECe,ECdw=1.5,3.0,5*3.0-1.5
LR=ECw/(5*ECe-ECw)
mk(14,"explain why drainage and salinity must be treated together; compute Hooghoudt's drain spacing with the equivalent depth; compute the leaching requirement and the leaching fraction; and design a subsurface drainage system with drain length and pipe size.",
 [('Introduction',[Q(r"Irrigation adds water and salts. Where the water table is shallow, or the soil drains slowly, the salts stay in the root zone and the water table rises, so the crop is both too wet and too salty. Drainage removes the surplus water and, with it, the salt; it is the part of the water balance that keeps irrigation sustainable. This chapter gives the two calculations of drainage design: the spacing of subsurface drains and the leaching needed to keep the salinity at the tolerable level.")]),
  ('Types of drainage',[Q(r"Drainage is \emph{surface} (ditches, land levelling, bedding) or \emph{subsurface} (buried perforated pipes or tiles, mole drains, tube wells for vertical drainage). Subsurface pipe drains suit flat irrigated land with fine texture and a barrier below.")]),
  ('Steady-state spacing: the Hooghoudt equation',[Q(r"For steady recharge $q$ onto a water table midway between two drains of spacing $L$, with the water table $h$ above drain level, the Hooghoudt equation is"),
   eqn(r"q=\frac{8K_2d_e\,h+4K_1h^2}{L^2},"),
   Q(r"where $K_1$ is the conductivity above the drains, $K_2$ below, and $d_e$ the equivalent depth that allows for the convergence of flow to the drains: $d_e=d/\bigl[1+\frac{d}{L}\bigl(\frac{8}{\pi}\ln\frac{d}{r_0}-3.4\bigr)\bigr]$ for $d/L<0.3$, where $d$ is the depth of the barrier below the drains and $r_0$ the drain radius. Since $d_e$ depends on $L$, the equation is solved by iteration.")]),
  ('Salinity and the leaching requirement',[Q(r"A crop tolerates a saturation-extract salinity $EC_e$. The water that drains below the roots carries away the salt of the irrigation water, concentrated by evapotranspiration. The \kw{leaching requirement} is $LR=EC_w/(5EC_e-EC_w)$. For irrigation water of $EC_w=%.1f$ dS\,m$^{-1}$ and a crop with $EC_e=%.1f$: $LR=%.3f$, so %.1f per cent of the applied water must drain."%(ECw,ECe,LR,100*LR))]),
 ],
 'Design project 14: a drainage system for an irrigated clay field','sec:proj14',
 [Q(r"\textbf{Brief.} A 40-ha field of cotton ($EC_e$ threshold 7.7 dS\,m$^{-1}$) is irrigated with water of 1.5 dS\,m$^{-1}$ and has a barrier at 6 m. The design discharge is 7 mm\,d$^{-1}$ and the water table midway between drains is allowed to stand $h=0.5$ m above drain level; $K_1=0.8$, $K_2=0.3$ m\,d$^{-1}$. The designer chooses a drain depth, and then the spacing and the total pipe.")],
 tab+Q(r"\textbf{Reading.} Deeper drains lower the barrier-limited flow path only slightly, because the equivalent depth saturates as the drain nears the barrier, so the spacing rises little with depth; the extra excavation cost must be set against the small gain in spacing. At 1.8 m, $L=%s$ m, so the field of 40 ha needs about $%.0f$ km of pipe. The leaching requirement for cotton at an $EC_e$ of 7.7 is $%.3f$, small, so the drainage is set by the water table rather than by salt."%(rows[2][3],40*float(10000/float(rows[2][3]))/1000,1.5/(5*7.7-1.5))),
 [(r"$LR$ for $EC_w=2$, $EC_e=6$.","%.3f"%(2/(30-2))),(r"$q$ for $L=40$, $K_2=0.5$, $d_e=2$, $h=0.4$, $K_1=0.8$.","%.4f m/d"%((8*0.5*2*0.4+4*0.8*0.16)/1600)),(r"Spacing for $q=5$ mm/d if $8K_2d_eh+4K_1h^2=20$.","%.0f m"%math.sqrt(20/0.005)),(r"Pipe per hectare for $L=25$ m.","%.0f m"%(10000/25)),(r"Leaching depth for 800 mm applied, LR 0.15.","120 mm"),(r"Why is $d_e$ less than $d$?","flow convergence"),(r"Name two kinds of subsurface drains.","pipe; mole"),(r"What is $r_0$?","drain radius"),(r"How does a barrier affect $L$?","shallower barrier, narrower spacing"),(r"Why leach?","remove salt")],
 [r"Name the types of drainage.",r"What does the Hooghoudt equation give?",r"Why does $d_e$ depend on $L$?",r"What is the leaching requirement?",r"How is the spacing solved?",r"What limits drain depth?",r"What is a mole drain?",r"Why do salinity and drainage go together?"],
 [(r"Hooghoudt gives",["spacing","rain","ET","price"],0),(r"$LR=$",["$EC_w/(5EC_e-EC_w)$","$EC_e/EC_w$","$EC_w$","none"],0),(r"$d_e$ is",["equivalent depth","drain size","rain","none"],0),(r"Barrier shallow",["narrower spacing","wider","none","salt"],0),(r"Mole drain is",["unlined channel","pipe","pump","none"],0),(r"$K_1$ is",["above drains","below","none","salt"],0),(r"Leaching removes",["salt","rain","crop","none"],0),(r"Spacing is by",["iteration","guess","none","rain"],0),(r"$r_0$ is",["drain radius","rain","salt","none"],0),(r"$h$ is",["head above drain","depth","time","none"],0)])
print('ok14')
