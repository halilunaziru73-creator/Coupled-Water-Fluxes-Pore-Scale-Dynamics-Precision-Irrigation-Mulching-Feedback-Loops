import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from h import *
from sidport import saxton,psiF,gaF,fitK
from sprport import *
from lib import SOIL
TEX={'S01':(45,20),'S02':(88,4),'S03':(92,3),'S04':(82,6),'S05':(65,10),'S06':(40,20),'S07':(20,15),'S08':(55,30),'S09':(30,35),'S10':(10,35)}
def W(t): return '\\par\\noindent where '+t+'\n\n'
def E(eq,wh,lab=''): return '\\begin{equation}'+(('\\boxed{'+eq+'}') if len(eq)<170 else eq)+(('\\label{%s}'%lab) if lab else '')+'\\end{equation}\n'+W(wh)
def kosfit(sid):
    sd,cl=TEX[sid];s=saxton(sd/100,cl/100,1.5);psi=psiF(SOIL[sid][1],SOIL[sid][2]);dth=max(.05,.95*s['sat']-(s['fc']-.5*(s['fc']-s['wp'])))
    f=fitK(lambda t:gaF(t,s['ks'],psi,dth)/1000,10,600);return f['k'],f['A'],s['ks'],dth
def SP(sid='S06',t='impact',d=None,P=None,Ss=None,Sl=None,Zn=12,**kw):
    st=ST[t];k,A,ks,dth=kosfit(sid)
    return sprinkler(t,d or st['d'],P or st['P'],Ss or st['Ss'],Sl or st['Sl'],Zn,k,A,**kw)
b=''
b+=sec('Sprinkler irrigation: what the layer does')
b+=P(r"The sprinkler layer simulates the distribution of water from a set of sprinklers over the field and the fate of that water in the soil. From a sprinkler type, a nozzle diameter, a pressure and a spacing, it computes the discharge and the wetted radius; it superposes the patterns of all the sprinklers around a point to get the depth caught at every point of a repeating cell; it removes the water lost to wind drift and evaporation; and it passes the rest through the intake of the soil to find the water stored, lost to deep percolation and lost as runoff. The set time is chosen so that the driest quarter of the field receives the net depth.")
b+=sec('Types of sprinklers')
rows=[[v['l'],'%.2f'%v['cR'],str(v['m']),'%.1f'%v['F'],'%.1f--%.1f'%v['dr'],'%d--%d'%v['pr'],'%.1f / %d'%(v['d'],v['P']),'%d $\\times$ %d'%(v['Ss'],v['Sl'])] for v in ST.values()]
b+=tabl(['Type','$c_R$','pattern','drift $F$','nozzle range (mm)','pressure range (kPa)','default $d$ / $P$','default $S_s\\times S_l$ (m)'],rows,'Sprinkler types of the application.','lrlrcccc')
b+=P(r"\textbf{Impact sprinklers} are the classic rotating-arm heads, with one or two nozzles and a throw of 12 to 20 m; they give a triangular-like pattern and a good uniformity at moderate pressure. \textbf{Rotating sprays} throw less (5 to 8 m) at low pressure (70--250 kPa) and give a pattern that is heaviest in a ring; their small drops drift more (factor 1.6). \textbf{Micro-sprinklers} are small, low-pressure heads for trees, with a throw of 2 to 4 m and a flat pattern. \textbf{Big guns} are large rotating nozzles of 10 to 25 mm that throw 30 m or more at 350--700 kPa; they are used on travelling reels and are the most sensitive to wind. For each type the pattern is a function of the relative distance $x=r/R$ from the sprinkler:")
b+=E(r"\hat p(x)=\begin{cases}1-x^{m}&\text{impact }(m=1.3),\ \text{big gun }(m=1)\\ (0.5+0.5x)(1-x^{6})&\text{rotating spray}\\ (0.55+0.45x)(1-x^{5})&\text{micro-sprinkler}\end{cases},\quad \hat p=0\ (x\ge1),",r"$\hat p(x)$ is the relative application rate at the relative distance $x=r/R$ (1 at the sprinkler), $r$ the distance from the sprinkler (m), $R$ the wetted radius (m) and $m$ the exponent of the pattern. The pattern is scaled so that its integral over the circle equals the discharge of the nozzle.",'eq:p-pat')
b+=sec('Nozzle, pressure and radius')
b+=E(r"q=0.95\,A_n\sqrt{2g\,h}\times6\times10^{4},\quad A_n=\pi\left(\frac{d}{2000}\right)^{2},\quad h=\frac{P}{9.81},",r"$q$ is the discharge of the nozzle (L\,min$^{-1}$), 0.95 the discharge coefficient, $A_n$ the area of the nozzle (m$^2$), $d$ its diameter (mm), $g=9.81$ m\,s$^{-2}$, $h$ the pressure head (m) and $P$ the operating pressure (kPa); $6\times10^{4}$ converts m$^3$\,s$^{-1}$ to L\,min$^{-1}$.",'eq:p-q')
b+=E(r"R=c_R\sqrt{d\,h}\;\Phi(\alpha),\qquad\Phi(\alpha)=\left[\frac{\max(0.05,\sin3.1\alpha^{\circ})}{0.9763}\right]^{0.45},",r"$R$ is the wetted radius (m), $c_R$ the radius coefficient of the type (Table above), $d$ the nozzle diameter (mm), $h$ the pressure head (m) and $\Phi(\alpha)$ a correction for the angle $\alpha$ of the trajectory above the horizontal (degrees); $\Phi=1$ at the default angle of 25$^\circ$, and the range peaks near $29^\circ$.",'eq:p-R')
q_,R_,h_=nozzle('impact',4.4,300)
b+=ex(r"An impact sprinkler with a 4.4-mm nozzle at 300 kPa and a trajectory of 25$^\circ$: find the head, the discharge and the wetted radius.",
 r"$h=300/9.81=%.2f$ m \ans $A_n=\pi(4.4/2000)^2=%.3e$ m$^2$ \ans $q=0.95\times%.3e\times\sqrt{2\times9.81\times%.2f}\times6\times10^4=%.2f$ L\,min$^{-1}$ ($%.2f$ m$^3$\,h$^{-1}$) \ans $\Phi(25^\circ)=1$; $R=1.35\sqrt{4.4\times%.2f}=%.2f$ m \ans Wetted diameter $%.1f$ m; the spacing of 12$\times$18 m is %.0f and %.0f per cent of the diameter \ans"%(h_,math.pi*(4.4/2000)**2,math.pi*(4.4/2000)**2,h_,q_,q_*.06,h_,R_,2*R_,100*12/(2*R_),100*18/(2*R_)),'Discharge and radius of a nozzle')
rows=[]
for t in ST:
    for d in ((2.4,4.4,6.4) if t=='impact' else (1.5,3.2,5) if t=='spray' else (.8,1.3,2.5) if t=='micro' else (10,16,25)):
        for Pp in (ST[t]['P'],):
            q,R,h=nozzle(t,d,Pp);rows.append([ST[t]['l'],d,Pp,'%.1f'%h,'%.2f'%q,'%.1f'%R,'%.2f'%(q*.06)])
b+=tabl(['Type','$d$ (mm)','$P$ (kPa)','$h$ (m)','$q$ (L/min)','$R$ (m)','$q$ (m$^3$/h)'],rows,'Discharge and radius for three nozzle sizes of each type at its default pressure.','lrrrrrr')
rows=[]
for Pp in (200,250,300,350,400,500):
    q,R,h=nozzle('impact',4.4,Pp);rows.append([Pp,'%.1f'%h,'%.2f'%q,'%.1f'%R])
b+=tabl(['$P$ (kPa)','$h$ (m)','$q$ (L/min)','$R$ (m)'],rows,'Effect of the pressure on the impact sprinkler of 4.4 mm.','rrrr')
b+=sec('Overlap and uniformity')
b+=P(r"The application rate at a point is the sum of the contributions of all sprinklers around it. The application evaluates it on a repeating cell of the layout, $S_s\times S_l$ for a rectangular layout and $S_s\times2S_l$ for a triangular layout (where every second lateral is shifted by $S_s/2$):",
 E(r"a(x,y)=\sum_{i,j}p\bigl(x-x_{ij},\,y-y_{ij}\bigr),\qquad \overline{a}=\frac{1}{n}\sum a,\qquad CU=1-\frac{\frac1n\sum|a-\bar a|}{\bar a},",r"$a(x,y)$ is the gross application rate at the point $(x,y)$ (mm\,min$^{-1}$), $p$ the pattern of one sprinkler (Eq.~\ref{eq:p-pat} scaled to the discharge), $(x_{ij},y_{ij})$ the positions of the sprinklers (shifted by $S_s/2$ on alternate laterals in a triangular layout), $n$ the number of points of the cell (196 for a rectangular layout), $\bar a$ the mean rate and $CU$ the Christiansen uniformity coefficient (fraction); the mean rate over the cell equals the discharge divided by the area, $q/(S_sS_l)$.",'eq:p-cu'),
 r"The wind distorts the pattern: it shifts the centre downwind by $0.03uR$ and stretches the radius to $R(1+0.022u\cos\theta)$ downwind and shortens it upwind (limits 0.7 to 1.4). Here $u$ is the wind speed (m\,s$^{-1}$) and $\theta$ the angle from the wind direction.")
rows=[]
for tri in (False,True):
    for Ss,Sl in ((9,9),(12,12),(12,18),(15,18),(18,18),(18,24),(24,24)):
        r=SP(Ss=Ss,Sl=Sl,tri=tri);rows.append(['triangular' if tri else 'rectangular','%d $\\times$ %d'%(Ss,Sl),'%.1f'%r['AR'],'%.1f'%(100*r['CU']),'%.1f'%(100*r['DU']),'%.0f'%r['T']])
b+=tabl(['Layout','$S_s\\times S_l$ (m)','mean rate (mm/h)','$CU$ (\\%)','$DU_{lq}$ (\\%)','set time (min)'],rows,'Spacing and layout for the impact sprinkler (4.4 mm, 300 kPa, wind 3 m/s) on the loam S06, $Z_n=12$ mm.','llrrrr')
rows=[]
for u in (0,1,2,3,5,7,10):
    r=SP(u=u);rows.append([u,'%.1f'%(100*r['CU']),'%.1f'%(100*r['DU']),'%.1f'%(100*r['wdf']),'%.0f'%r['T'],'%.1f'%(100*r['Ea'])])
b+=tabl(['Wind $u$ (m/s)','$CU$ (\\%)','$DU_{lq}$ (\\%)','drift loss (\\%)','set time (min)','$E_a$ (\\%)'],rows,'Effect of the wind on the impact sprinkler, 12 $\\times$ 18 m, loam S06.','rrrrrr')
b+=sec('Wind drift and evaporation')
b+=E(r"\delta=\min\Bigl\{0.45,\ \tfrac1{100}\bigl(1.2+0.5u+0.04u^{2}\bigr)F\Bigl(\tfrac{P}{250}\Bigr)^{0.7}\bigl[1+0.025(T_a-20)\bigr]\bigl[0.6+0.4\tfrac{\sin\alpha}{0.4226}\bigr]\Bigr\},",r"$\delta$ is the fraction of the discharge lost to drift and evaporation of the drops in the air (the percentage is clipped between 0.5 and 45), $u$ the wind speed at the sprinkler (m\,s$^{-1}$), $F$ the drift factor of the type (1, 1.6, 0.7, 1.3), $P$ the pressure (kPa), $T_a$ the air temperature ($^\circ$C) and $\alpha$ the trajectory angle (the last factor is 1 at 25$^\circ$).",'eq:p-wd')
r=SP()
b+=ex(r"Find the drift and evaporation loss of the impact sprinkler at 300 kPa, wind 3 m\,s$^{-1}$, 24$^\circ$C and a trajectory of 25$^\circ$.",
 r"$1.2+0.5(3)+0.04(9)=3.06$ \ans $(P/250)^{0.7}=(1.2)^{0.7}=%.3f$; $1+0.025(24-20)=1.10$; angle factor $0.6+0.4\sin25^\circ/0.4226=1.0$ \ans $\delta=3.06\times1\times%.3f\times1.10\times1.0/100=%.4f$, i.e.\ %.1f per cent \ans On a gross depth of %.1f mm this is %.2f mm lost before the water reaches the soil \ans"%(1.2**.7,1.2**.7,3.06*1.2**.7*1.1/100,100*r['wdf'],r['gross'],r['wd']),'Drift loss')
b+=sec('The soil intake and the set time')
b+=P(r"At a point that receives the rate $a$ (net of the drift) for the time $T$ the intake follows Kostiakov, $F=KT^{A}$ with $K$ in mm\,min$^{-A}$. Water arrives at the rate $a$ until the soil can no longer take it; ponding starts at",
 E(r"t_p=\left(\frac{a}{K}\right)^{\frac1{A-1}},\qquad F=\begin{cases}aT&T\le t_p\\ KT^{A}&T>t_p\end{cases},\qquad RO=\max\{0,\ aT-F-S_{d,\rm eff}\},\quad S_{d,\rm eff}=\frac{S_d}{1+0.25S},",r"$t_p$ is the time of ponding (min), $a$ the application rate at the point (mm\,min$^{-1}$), $K$ (mm\,min$^{-A}$) and $A$ the Kostiakov parameters of the soil (from the Saxton--Rawls and Green--Ampt chain of Chapter~11), $T$ the time of the set (min), $F$ the infiltrated depth (mm), $RO$ the runoff (mm), $S_{d,\rm eff}$ the effective depression storage (mm), $S_d$ the surface storage (5, 3.5 and 2 mm for conventional, reduced and no tillage) and $S$ the ground slope (per cent).",'eq:p-ga'),
 r"The set time is the smallest $T$ for which the mean depth in the driest quarter of the points reaches the net depth $Z_n$ (a bisection over 1 to 2400 min). The performance indicators follow:",
 E(r"E_a=\frac{\overline{\min(I,Z_n)}}{\bar a T},\quad E_s=\frac{\overline{\min(I,Z_n)}}{Z_n},\quad DU_{lq}=\frac{\overline{I}_{lq}}{\bar I},",r"$I$ is the depth infiltrated at a point (mm), $\bar a T$ the gross depth applied (mm), $\overline{\min(I,Z_n)}$ the mean stored depth over the points, $E_s$ the requirement efficiency and $DU_{lq}$ the distribution uniformity, the mean of the lowest quarter of the infiltrated depths $\overline I_{lq}$ divided by the mean $\bar I$; the deep percolation is $\overline{\max(I-Z_n,0)}/(\bar aT)$ and the runoff $\overline{RO}/(\bar aT)$.",'eq:p-ind'))
rows=[]
for sid in sorted(TEX):
    k,A,ks,dth=kosfit(sid);r=SP(sid)
    rows.append([sid,SOIL[sid][0],'%.1f'%ks,'%.4f'%k,'%.3f'%A,'%.0f'%r['T'],'%.0f'%(100*r['Ea']),'%.1f'%(100*r['dpf']),'%.1f'%(100*r['rof']),'%.0f'%(100*r['DU'])])
b+=tabl(['ID','Soil','$K_s$ (mm/h)','$k$','$A$','set (min)','$E_a$ (\\%)','$DP$ (\\%)','$RO$ (\\%)','$DU_{lq}$ (\\%)'],rows,'Impact sprinkler (4.4 mm, 300 kPa, 12 $\\times$ 18 m, wind 3 m/s) on the ten soils, $Z_n=12$ mm.','llrrrrrrrr')
b+=P(r"The table repeats the lesson of Chapter~6: the rate of the sprinkler, about 6 mm\,h$^{-1}$, is below the intake of most soils, so there is no runoff, and the main loss is the deep percolation from the over-irrigated overlap on the coarse soils; on the clays, where the intake is small, ponding and runoff begin sooner and the set time must be shortened.")
rows=[]
for P_ in (200,250,300,350,400,450):
    r=SP(P=P_);rows.append([P_,'%.1f'%r['R'],'%.1f'%r['AR'],'%.1f'%(100*r['CU']),'%.0f'%r['T'],'%.1f'%(100*r['Ea'])])
b+=tabl(['$P$ (kPa)','$R$ (m)','mean rate (mm/h)','$CU$ (\\%)','set (min)','$E_a$ (\\%)'],rows,'Effect of the pressure (12 $\\times$ 18 m spacing is held, loam S06).','rrrrrr')
rows=[]
for d in (3.2,3.8,4.4,5.0,5.6,6.4):
    r=SP(d=d);rows.append(['%.1f'%d,'%.2f'%(nozzle('impact',d,300)[0]*.06),'%.1f'%r['R'],'%.1f'%r['AR'],'%.1f'%(100*r['CU']),'%.0f'%r['T'],'%.1f'%(100*r['Ea'])])
b+=tabl(['$d$ (mm)','$q$ (m$^3$/h)','$R$ (m)','rate (mm/h)','$CU$ (\\%)','set (min)','$E_a$ (\\%)'],rows,'Effect of the nozzle size (300 kPa, 12 $\\times$ 18 m, loam S06).','rrrrrrr')
r=SP()
b+=ex(r"Design the sprinkler set for the loam S06 with a net depth $Z_n=12$ mm: impact sprinkler 4.4 mm at 300 kPa, 12$\times$18 m, wind 3 m\,s$^{-1}$, air at 24$^\circ$C. Report the pattern, the set time and the fate of the water.",
 r"Discharge $q=%.2f$ L\,min$^{-1}$; radius $R=%.1f$ m \ans Mean gross rate $\bar a=q/(S_sS_l)=%.2f\times60/216=%.2f$ mm\,h$^{-1}$ \ans Superposition on the $14\times14$ cell: $CU=%.1f$ per cent \ans Drift loss $\delta=%.1f$ per cent, so the net rate is $%.2f$ mm\,h$^{-1}$ \ans The bisection finds $T=%.0f$ min ($%.2f$ h) for which the driest quarter catches 12 mm \ans Gross depth $%.1f$ mm; $E_a=%.1f$, $E_s=%.1f$, deep percolation $%.1f$, runoff $%.1f$, drift $%.1f$ per cent; $DU_{lq}=%.1f$ per cent \ans"%(r['q'],r['R'],r['q'],r['AR'],100*r['CU'],100*r['wdf'],r['AR']*(1-r['wdf']),r['T'],r['T']/60,r['gross'],100*r['Ea'],100*r['Es'],100*r['dpf'],100*r['rof'],100*r['wdf'],100*r['DU']),'A sprinkler set from nozzle to fate of the water')
write(13,'deep',b)
print('ok33')
