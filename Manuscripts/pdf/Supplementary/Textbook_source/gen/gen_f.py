import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import numpy as np, pandas as pd
from gen_e import phi,th
O=[];w=O.append
def cum_Q(t,e0,Q1,q0,tau):
    t1=(Q1-q0)/e0
    if t<=t1: return q0+e0*t
    return Q1+2*e0*tau*(math.sqrt(1+(t-t1)/tau)-1)
w(r"""\chapter{Mulch and evaporation layers}\label{ch:mulch}
\markboth{Mulch and evaporation}{Mulch and evaporation}
\textbf{After this chapter you can} compute what a mulch saves and where the saved water goes, follow the two stages of soil drying with the application's constants, and read the regime map.

\section{Mulch against bare soil}
The layer evaluates Engine 1 at bare soil ($\varphi=1$), at your mulch strength and at $\varphi=0.1$. With $E_\varphi,I_\varphi,D_\varphi$ from Equations 5.4, 5.7 and 5.9:
\begin{equation}\Delta E=E_{1.0}-E_\varphi,\quad\Delta I=I_{1.0}-I_\varphi,\quad\Delta D=D_\varphi-D_{1.0}.\end{equation}
""")
body=r"""For a soil the engine gives bare soil ($\varphi=1$): $E=190$, $I=180$, $D=40$; and with mulch $\varphi=0.5$: $E=140$, $I=148$, $D=62$ mm yr$^{-1}$ (illustration values). Find the three savings and the verdict; then repeat with a wet year ($\rho=1.3$) where $E$ falls from $175$ to $130$, $I$ from $120$ to $112$, and $D$ rises from $150$ to $188$.

\textbf{Solution.} Normal year: $\Delta E=190-140=50$ mm, $\Delta I=180-148=32$ mm, $\Delta D=62-40=22$ mm. The share of the saved evaporation that becomes less irrigation is $32/50=0.64$ and the share that becomes extra drainage is $22/50=0.44$ (the two exceed 1 together, so part of the drainage is not funded from the evaporation saving alone; the rest is storage change and transpiration, see Equation~(\ref{eq:fate2})). Since $\Delta I>\Delta D$ the verdict is ``dry to normal: most of the saved water becomes less irrigation''. Wet year: $\Delta E=45$, $\Delta I=8$, $\Delta D=38$. Now $\Delta D>\Delta I$ and the verdict reads ``wet conditions: much of the water the mulch saves now leaves as drainage''."""
w(ex("what a mulch saves",body))
w(r"""\section{Fate of the saved water}
At each rainfall scale $\rho$ the layer partitions the evaporation saved,
\begin{equation}\label{eq:fate2}f_I=\frac{\max\{\Delta I,0\}}{\max\{\Delta E,0.1\}},\ f_D=\frac{\max\{\Delta D,0\}}{\max\{\Delta E,0.1\}},\ f_T=\frac{\max\{\Delta T,0\}}{\max\{\Delta E,0.1\}},\ f_{\rm rest}=\max\{0,1-f_I-f_D-f_T\},\end{equation}
and reports as crossover the first $\rho$ with $\Delta D\ge\Delta I$ and $\Delta D>1$ mm.
""")
rho=[0.5,0.7,0.9,1.0,1.1,1.2,1.3,1.4]
dE=[38,44,48,50,50,49,48,46]; dI=[33,31,29,26,21,15,9,5]; dD=[0.6,3,8,13,17,24,29,33]; dT=[1,2,3,4,4,4,5,5]
rows=[]; cross=None
for r,e,i,d,t in zip(rho,dE,dI,dD,dT):
    fi=max(i,0)/max(e,.1);fd=max(d,0)/max(e,.1);ft=max(t,0)/max(e,.1)
    rest=max(0,1-fi-fd-ft)
    if cross is None and d>=i and d>1: cross=r
    rows.append([r,e,i,d,t,f"{fi:.2f}",f"{fd:.2f}",f"{ft:.2f}",f"{rest:.2f}"])
body=r"""A mulch of strength $\varphi=0.5$ gives, at rainfall scales $\rho=0.5,\dots,1.4$, the changes of Table~\ref{tab:fatepart} (illustration values shaped like the study's trend: the irrigation saving falls with rain while drainage rises). Compute the partition of Equation~(\ref{eq:fate2}) and the crossover.

\textbf{Solution.} At $\rho=1.0$: $f_I=26/50=0.52$, $f_D=13/50=0.26$, $f_T=4/50=0.08$, $f_{\rm rest}=1-0.86=0.14$. The other rows are in the table."""
body+=tab(["$\\rho$","$\\Delta E$","$\\Delta I$","$\\Delta D$","$\\Delta T$","$f_I$","$f_D$","$f_T$","$f_{\\rm rest}$"],rows,"Partition of the saved evaporation.","tab:fatepart")
body+=f"\nThe first $\\rho$ with $\\Delta D\\ge\\Delta I$ and $\\Delta D>1$ is $\\rho={cross}$ in the table; interpolating between $\\rho=1.2$ ($\\Delta D-\\Delta I=+9$ hmm"
body=body.split(" hmm")[0]
# linear interpolation between 1.1 and 1.2
body="\n".join(body.split("\n")[:-1])
body+=r"""
The first $\rho$ in the table with $\Delta D\ge\Delta I$ and $\Delta D>1$ is $\rho=1.2$. Between the grid points $\Delta D-\Delta I$ is $-4$ at $\rho=1.1$ and $+9$ at $\rho=1.2$, so linear interpolation puts the crossover at $\rho=1.1+0.1\times4/13=1.131$. The study reports about 60 per cent of the saved water going to reduced irrigation in dry years, about 63 per cent to extra drainage in wet years, and a crossover near $\rho\approx1.2$; the illustration table, which is not the study's, gives $f_I=0.87$ at $\rho=0.5$ and $f_D=0.72$ at $\rho=1.4$, which have the same trend."""
w(ex("partition of the saved evaporation",body))
w(r"""\section{The regime map}
For each cell of (mulch factor, rainfall scale) the engine forms the regime index $\mathcal I=(E-D)/\max\{1,E+D\}$: evaporation-dominated if $\mathcal I>0.05$, drainage-dominated if $\mathcal I<-0.05$, on the boundary otherwise; $\mathcal I=+1$ is all evaporation and $-1$ all drainage.
""")
cells=[(1.0,0.7,190,12),(1.0,1.0,185,45),(1.0,1.3,175,150),(0.5,0.7,125,15),(0.5,1.0,140,62),(0.5,1.3,130,188),(0.2,1.0,70,95)]
rows=[]
for p,r,E,D in cells:
    I=(E-D)/max(1,E+D);reg='evaporation' if I>0.05 else('drainage' if I<-0.05 else 'boundary')
    rows.append([p,r,E,D,f"{I:+.3f}",reg])
body=r"""Classify the seven cells of Table~\ref{tab:regime} (illustration values of annual $E$ and $D$).

\textbf{Solution.} Compute $\mathcal I=(E-D)/\max\{1,E+D\}$. For the first cell: $(190-12)/202=+0.881$, evaporation-dominated. For the cell $(\varphi=0.5,\rho=1.0)$: $(140-62)/202=+0.386$. For $(0.5,1.3)$: $(130-188)/318=-0.182$, drainage-dominated. For $(0.2,1.0)$: $(70-95)/165=-0.152$."""
body+=tab(["$\\varphi$","$\\rho$","$E$","$D$","$\\mathcal I$","Regime"],rows,"Regime index.","tab:regime")
body+=r"""\textbf{Reading.} Strong mulch in a wet climate pushes the soil into the drainage regime where mulch ``saves less'' water for the crop, because the saved evaporation leaves as drainage."""
w(ex("regime index",body))
# evaporation stages
w(r"""\section{Two-stage evaporation}
With $e_0$ the atmospheric demand under mulch and canopy, $Q_1$ the stage-1 storage and $\tau$ the stage-2 time scale, $t_1=(Q_1-q_0)/e_0$ and
\begin{equation}Q(t)=\begin{cases}q_0+e_0t,&t\le t_1\\ Q_1+2e_0\tau\bigl(\sqrt{1+(t-t_1)/\tau}-1\bigr),&t>t_1\end{cases}\qquad e(t)=\begin{cases}e_0,&t\le t_1\\ e_0/\sqrt{1+(t-t_1)/\tau},&t>t_1\end{cases}\end{equation}
The parameters are
$h_i=\frac{0.25}{\alpha}(1.5-0.5\rho)$, $h_s=4/\alpha$, $Q_1=\max\{2,[\theta(h_i)-\theta(h_s)]L_1(0.6+0.4\rho)\}$ with $L_1=40$ mm, $\tau=0.006+0.03(\mathrm{clay}+\mathrm{silt})/100$ d, $q_0=(1-w_f)0.95Q_1$, $w_f=\mathrm{clip}(1-z_d/50;0.05,1)$, and $e_0=e_{0,b}\varphi(1-0.4c)$.
""")
rows=[]
for s in IDS:
    nm,a,n,awc,sa,si,cl=SOIL[s]
    hi=0.25/a*1.0;hs=4/a
    Q1=max(2,(th(s,hi)-th(s,hs))*40*1.0);tau=0.006+0.03*(cl+si)/100
    rows.append([s,nm,f"{hi:.1f}",f"{hs:.0f}",f"{Q1:.2f}",f"{Q1/4.2:.2f}",f"{tau:.4f}",f"{cum_Q(10,4.2,Q1,0,tau):.1f}"])
body=r"""With bare soil ($\varphi=1$, $c=0$, so $e_0=4.2$ mm d$^{-1}$), rainfall scale $\rho=1$ and a surface method ($q_0=0$), compute for the ten soils $h_i$, $h_s$, $Q_1$, the stage-1 duration $t_1$, $\tau$ and the cumulative loss at 10 days.

\textbf{Solution, loam S06 in full.} $\alpha=0.036$: $h_i=0.25/0.036\times(1.5-0.5)=6.94$ cm; $h_s=4/0.036=111$ cm. The retention uses $\phi=0.428$, $\theta_r=0.022$ (Chapter~\ref{ch:struct}): $\Se(6.94)=0.9959$ hmm"""
nm,a,n,*_=SOIL['S06']
body=body.split(" hmm")[0]+f"$\\Se(6.94)={Se(a,n,6.94):.4f}$ and $\\Se(111)={Se(a,n,111):.4f}$, so $\\theta(h_i)-\\theta(h_s)=0.406({Se(a,n,6.94):.4f}-{Se(a,n,111):.4f})={0.406*(Se(a,n,6.94)-Se(a,n,111)):.4f}$ and $Q_1=0.1054\\ldots\\times40=$"
q1=(th('S06',6.94)-th('S06',111))*40
body=body.replace("$Q_1=0.1054\\ldots\\times40=$",f"$Q_1={q1:.2f}$ mm. Stage 1 lasts $t_1=Q_1/e_0={q1/4.2:.2f}$ d. Then $\\tau=0.006+0.03(0.60)=0.024$ d. After 10 days: $t-t_1={10-q1/4.2:.2f}$ d, $Q=Q_1+2(4.2)(0.024)(\\sqrt{{1+{(10-q1/4.2)/0.024:.1f}}}-1)={cum_Q(10,4.2,q1,0,0.024):.1f}$ mm. Table~\\ref{{tab:stage}} gives all ten soils.")
body+=tab(["ID","Soil","$h_i$","$h_s$","$Q_1$ (mm)","$t_1$ (d)","$\\tau$ (d)","$Q(10)$ (mm)"],rows,"Stage-1 storage, duration and cumulative loss in 10 days (bare, $\\rho=1$).","tab:stage")
body+=r"""\textbf{Check against the manual.} It says stage 1 lasts about 3 days for the sand at the season-mean demand and about 1 day for the silty clay loam: the table gives $3.03$ and $1.10$ days. Stage 1 is longest in the sands (large $Q_1$, because the window between $h_i$ and $h_s$ scales with $1/\alpha$) while in stage 2 the rate $e_0/\sqrt{1+(t-t_1)/\tau}$ falls faster for the small-$\tau$ sands than for the fine soils: the sands lose their larger stage-1 reserve first and then dry out quickly, as the application describes."""
w(ex("stage-1 and stage-2 evaporation of the ten soils",body))
# effect of mulch
nm,a,n,*_=SOIL['S06'];q1=(th('S06',6.94)-th('S06',111))*40;tau=0.024
rows=[]
for ph in [1.0,0.5,0.2]:
    for c in [0,0.8]:
        e0=4.2*ph*(1-0.4*c);t1=q1/e0
        rows.append([ph,c,f"{e0:.3f}",f"{t1:.2f}",f"{cum_Q(10,e0,q1,0,tau):.1f}",f"{cum_Q(24,e0,q1,0,tau):.1f}"])
body=r"""For the loam, with the stage constants above, compute $e_0$, $t_1$, and the cumulative loss at 10 and 24 days for mulch strengths $\varphi=1,0.5,0.2$ with canopy cover $c=0$ and $c=0.8$.

\textbf{Solution.} $e_0=4.2\varphi(1-0.4c)$. For $\varphi=0.5$, $c=0.8$: $e_0=4.2\times0.5\times0.68=1.428$ mm d$^{-1}$, $t_1=8.43/1.428=5.90$ d. Table~\ref{tab:mulchev} lists the six cases. Mulch lengthens stage 1 in proportion to $1/\varphi$ (from 2.0 days to 10 days for $\varphi=0.2$), and the cumulative loss falls more than in proportion because stage 2 starts later, which is why the evaporation saving grows convexly with mulch strength."""
body+=tab(["$\\varphi$","$c$","$e_0$","$t_1$ (d)","$Q(10)$","$Q(24)$"],rows,"Effect of mulch and canopy on evaporation of the loam.","tab:mulchev")
w(ex("mulch and canopy in the evaporation model",body))
# drying front
body=r"""After stage 1, the depth of the dry layer is $\ell(t)=\min\{60,(Q(t)-Q_1)/\Delta\theta\}$ mm with $\Delta\theta=\mathrm{clip}(\theta(h_i)-\theta(10^4);0.05,0.4)$. For the loam bare soil at 10 days, find $\ell$ and the suction at depth $z=40$ mm from $\log_{10}h(z)=\log_{10}h_s+(\log_{10}h_i-\log_{10}h_s)(1-e^{-(z-\ell)/\lambda})$, $\lambda=L_1/3$."""
dth=min(0.4,max(0.05,th('S06',6.94)-th('S06',1e4)))
Q10=cum_Q(10,4.2,q1,0,tau);l=min(60,(Q10-q1)/dth)
lam=40/3
z=40;lg=math.log10(111)+(math.log10(6.94)-math.log10(111))*(1-math.exp(-(z-l)/lam)) if z>=l else 5
body+=f"\n\n\\textbf{{Solution.}} $\\Delta\\theta=\\theta(6.94)-\\theta(10^4)={dth:.3f}$. At 10 days $Q={Q10:.1f}$ mm, so $\\ell=({Q10:.1f}-{q1:.2f})/{dth:.3f}={(Q10-q1)/dth:.1f}$ mm"+("" if (Q10-q1)/dth<=60 else ", which exceeds the cap, so $\\ell=60$ mm")+f". With $\\lambda=13.3$ mm, at $z=40$ mm "+(f"the exponent is $-(40-{l:.1f})/13.3={-(z-l)/lam:.2f}$ and $\\log_{{10}}h={lg:.3f}$, that is $h={10**lg:.0f}$ cm." if z>=l else "the depth lies inside the dry layer, so $h=10^5$ cm.")
w(ex("the drying front",body))
open('/tmp/book/p2f.tex','w').write("\n".join(O))
