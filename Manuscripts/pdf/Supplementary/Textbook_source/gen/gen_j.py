import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
from surf import *
import numpy as np
O=[];w=O.append
sp=soilpar('S06',0.468);sax=sp['sax']
Zn=0.0733
base=dict(L=180,S=0.30,q=1.2,n=0.04,w=0.75,furrow=True)
def run(**kw):
    p=dict(base,**kw);return design(p['L'],p['S'],p['q'],p['n'],p['w'],sp['k'],sp['A'],Zn,furrow=p['furrow'],cb=p.get('cb',1.0),tco_in=p.get('tco'),cut=p.get('cut','Es1'))
def score(d,cb=1.0):
    return min(d['Ea'],1)-3*max(0,0.8-d['Es'])-(3*max(0,0.05-d['RO']) if cb<1 else 0)-5*max(0,d['Ea']-1)
w(r"""\chapter{Surface irrigation design: from soil to schedule}\label{ch:surf}
\markboth{Surface design}{Surface design}
\textbf{After this chapter you can} carry a surface-irrigation design through every step of the application: pedotransfer functions, Green--Ampt, the Kostiakov fit, Manning's inlet, the volume-balance advance, cut-off, efficiencies, the best inflow, the design table, the sensitivity bars and the season and farm figures.

The chain of the layer is: texture $\to$ Saxton and Rawls $\to$ Green and Ampt $\to$ Kostiakov $\to$ inlet area (Manning) $\to$ advance (volume balance) $\to$ cut-off $\to$ depths and efficiencies. The worked design below follows one furrow field on the loam S06: $L=180$ m, slope $S=0.30$ per cent, inflow $q=1.2$ L s$^{-1}$ per furrow, Manning $n=0.04$, spacing $w=0.75$ m, organic matter $1.5$ per cent, trigger depletion $f_T=0.468$ (that is $-300$ cm) and required depth $Z_n=73.3$ mm (Chapter~\ref{ch:e1}).

\section{Soil water properties (Saxton and Rawls)}
""")
S_,C_=0.40,0.20;OM=1.5
body=f"""For the loam (sand $S=0.40$, clay $C=0.20$, OM $=1.5$ per cent) compute $\\theta_{{1500}}$, $\\theta_{{33}}$, $\\theta_s$, $\\lambda$ and $K_s$ with the Saxton and Rawls (2006) equations.

\\textbf{{Solution.}} 1. $\\theta_{{1500,t}}=-0.024(0.40)+0.487(0.20)+0.006(1.5)+0.005(0.40)(1.5)-0.013(0.20)(1.5)+0.068(0.40)(0.20)+0.031={sax['t1500']:.5f}$; correction: $\\theta_{{1500}}=\\theta_{{1500,t}}+(0.14\\theta_{{1500,t}}-0.02)={sax['th1500']:.4f}$.

2. $\\theta_{{33,t}}=-0.251(0.40)+0.195(0.20)+0.011(1.5)+0.006(0.40)(1.5)-0.027(0.20)(1.5)+0.452(0.40)(0.20)+0.299={sax['t33']:.5f}$; $\\theta_{{33}}=\\theta_{{33,t}}+(1.283\\theta_{{33,t}}^2-0.374\\theta_{{33,t}}-0.015)={sax['th33']:.4f}$.

3. $\\theta_{{(S-33),t}}=0.278(0.40)+0.034(0.20)+0.022(1.5)-0.018(0.40)(1.5)-0.027(0.20)(1.5)-0.584(0.40)(0.20)+0.078={sax['ts33']:.5f}$ hmm"""
# compute ts33 raw
ts33t=0.278*S_+0.034*C_+0.022*OM-0.018*S_*OM-0.027*C_*OM-0.584*S_*C_+0.078
ts33=ts33t+(0.636*ts33t-0.107)
body=body.split(" hmm")[0].replace(f"{sax['ts33']:.5f}",f"{ts33t:.5f}")
body+=f"; corrected $\\theta_{{(S-33)}}={ts33t:.5f}+(0.636\\times{ts33t:.5f}-0.107)={ts33:.5f}$, so $\\theta_s=\\theta_{{33}}+\\theta_{{(S-33)}}-0.097S+0.043={sax['ths']:.4f}$.\n\n4. $B=(\\ln1500-\\ln33)/(\\ln\\theta_{{33}}-\\ln\\theta_{{1500}})={sax['B']:.3f}$, $\\lambda=1/B={sax['lam']:.4f}$, $K_s=1930(\\theta_s-\\theta_{{33}})^{{3-\\lambda}}=1930({sax['ths']-sax['th33']:.4f})^{{{3-sax['lam']:.3f}}}={sax['Ks']:.2f}$ mm h$^{{-1}}$.\n\n\\textbf{{Reading.}} Field capacity $\\theta_{{fc}}=\\theta_{{33}}={sax['th33']:.3f}$ and wilting $\\theta_{{wp}}=\\theta_{{1500}}={sax['th1500']:.3f}$ give plant-available water ${sax['th33']-sax['th1500']:.3f}$ cm$^3$ cm$^{{-3}}$, i.e. {10*(sax['th33']-sax['th1500']):.2f} mm per cm, close to the engineered AWC of 1.7 mm per cm for this soil. These are regressions on a US soil database and carry its scatter: they serve design and not prediction at a site."
w(ex("Saxton and Rawls for the loam",body))
rows=[]
for sid in IDS:
    nm,a,n,awc,sa,si,cl=SOIL[sid];s=saxton(sa/100,cl/100,1.5)
    rows.append([sid,nm,f"{s['th1500']:.3f}",f"{s['th33']:.3f}",f"{s['ths']:.3f}",f"{s['Ks']:.1f}",f"{10*(s['th33']-s['th1500']):.2f}"])
body=r"""Repeat the calculation for the ten soils (OM $=1.5$ per cent).

\textbf{Solution.} The same four steps give Table~\ref{tab:sr}. The saturated conductivity runs from about 1 mm h$^{-1}$ in the clay loams to about 100 mm h$^{-1}$ in the sand, which sets the intake of every design."""
body+=tab(["ID","Soil","$\\theta_{1500}$","$\\theta_{33}$","$\\theta_s$","$K_s$ (mm/h)","PAW (mm/cm)"],rows,"Saxton and Rawls properties of the ten soils.","tab:sr")
body+=r"""\textbf{Check.} For the loam the $K_s$ of 12.1 mm h$^{-1}$ equals $29$ cm d$^{-1}$. (Chapter~\ref{ch:rich}'s loam solver used $K_s=24.96$ cm d$^{-1}$; these are different pedotransfer sets, and the book keeps each with its own source.)"""
w(ex("Saxton and Rawls for all soils",body))
w(r"""\section{Wetting-front suction and Green--Ampt}
The effective suction at the wetting front is $\psi_f=\frac{10}{\alpha}\dfrac{0.046m+2.07m^2+19.5m^3}{1+4.7m+16m^2}$ mm, the storage is $\theta_0=\theta_{fc}-f_T(\theta_{fc}-\theta_{wp})$, $\Delta\theta=\max\{0.05,0.95\theta_s-\theta_0\}$, and the cumulative infiltration solves
\begin{equation}F-\psi_f\Delta\theta\ln\Bigl(1+\frac F{\psi_f\Delta\theta}\Bigr)=K_s\frac t{60}\quad(t\ \text{in min}).\end{equation}
""")
a,n=SOIL['S06'][1],SOIL['S06'][2];m=1-1/n
body=f"""Compute $\\psi_f$ and $\\Delta\\theta$ for the loam at $f_T=0.468$, then solve the Green--Ampt equation for $F$ at $t=60$ min by Newton's iteration.

\\textbf{{Solution.}} $m=1-1/1.56={m:.4f}$. Numerator: $0.046({m:.4f})+2.07({m:.4f})^2+19.5({m:.4f})^3={0.046*m+2.07*m**2+19.5*m**3:.4f}$. Denominator: $1+4.7({m:.4f})+16({m:.4f})^2={1+4.7*m+16*m**2:.4f}$. So $\\psi_f=\\frac{{10}}{{0.036}}\\times{(0.046*m+2.07*m**2+19.5*m**3)/(1+4.7*m+16*m**2):.4f}={sp['pf']:.1f}$ mm. (For the coarse loam, $\\alpha=0.0961$, the same formula gives 15.7 mm, the 16 mm quoted by the manual.) Storage: $\\theta_0={sax['th33']:.4f}-0.468({sax['th33']:.4f}-{sax['th1500']:.4f})={sp['th0']:.4f}$ and $\\Delta\\theta=\\max\\{{0.05,0.95({sax['ths']:.4f})-{sp['th0']:.4f}\\}}={sp['dth']:.4f}$.

Newton for $t=60$ min: $K_st/60={sax['Ks']:.2f}$ mm and $\\psi_f\\Delta\\theta={sp['pf']*sp['dth']:.2f}$ mm. Start $F_0=\\max\\{{{sax['Ks']:.2f},\\sqrt{{2(\\psi_f\\Delta\\theta)K_st/60}}\\}}={max(sax['Ks'],math.sqrt(2*sp['pf']*sp['dth']*sax['Ks'])):.2f}$ mm. Each step $F\\leftarrow F-g/g'$ with $g=F-c\\ln(1+F/c)-K_st/60$, $g'=1-1/(1+F/c)$, $c=\\psi_f\\Delta\\theta$."""
c=sp['pf']*sp['dth'];rhs=sax['Ks'];F=max(rhs,math.sqrt(2*c*rhs));its=[]
for it in range(1,7):
    g=F-c*math.log(1+F/c)-rhs;dg=1-1/(1+F/c);F2=F-g/dg;its.append((it,F,g,F2));F=F2
body+=tab(["Iteration","$F$ (mm)","$g$","new $F$"],[[i,f"{f0:.4f}",f"{g:.5f}",f"{f1:.4f}"] for i,f0,g,f1 in its],"Newton iteration for $F(60\\ \\mathrm{min})$.","tab:newton")
body+=f"\nThe iteration converges in four steps to $F(60)={GA(60,sax['Ks'],sp['pf'],sp['dth']):.2f}$ mm, so the infiltration rate averaged over the first hour is {GA(60,sax['Ks'],sp['pf'],sp['dth']):.1f} mm h$^{{-1}}$, about {GA(60,sax['Ks'],sp['pf'],sp['dth'])/sax['Ks']:.1f} times $K_s$."
w(ex("Green--Ampt infiltration after one hour",body))
rows=[[t,f"{GA(t,sax['Ks'],sp['pf'],sp['dth']):.2f}",f"{(GA(t+1,sax['Ks'],sp['pf'],sp['dth'])-GA(t-1,sax['Ks'],sp['pf'],sp['dth']))/2*60:.2f}"] for t in [10,30,60,120,240,480,600]]
body=r"""Tabulate $F(t)$ and the infiltration rate $i=dF/dt$ at 10, 30, 60, 120, 240, 480 and 600 min.

\textbf{Solution.} Solve the Green--Ampt equation at each time (Newton) and estimate the rate by a central difference $i\approx[F(t+1)-F(t-1)]/2$ per minute, expressed in mm h$^{-1}$ (Table~\ref{tab:GA})."""
body+=tab(["$t$ (min)","$F$ (mm)","rate (mm/h)"],rows,"Green--Ampt infiltration of the loam.","tab:GA")
body+=f"The rate falls toward the saturated conductivity {sax['Ks']:.1f} mm h$^{{-1}}$ but is still {rows[-1][2]} mm h$^{{-1}}$ at 600 min because the front is only a few centimetres deep."
w(ex("the infiltration curve",body))
w(r"""\section{The Kostiakov fit}
The design converts the Green--Ampt curve into the power law $Z(\tau)=k\tau^A$ ($Z$ in m, $\tau$ in min) by least squares on $\ln Z=\ln k+A\ln\tau$ at 25 times spaced geometrically between 10 and 600 min.
""")
taus=np.geomspace(10,600,25);F=np.array([GA(t,sax['Ks'],sp['pf'],sp['dth']) for t in taus])
x=np.log(taus);y=np.log(F/1000)
rows=[[f"{t:.1f}",f"{ff:.2f}",f"{xx:.4f}",f"{yy:.4f}",f"{sp['k']*t**sp['A']*1000:.2f}"] for t,ff,xx,yy in list(zip(taus,F,x,y))[::4]]
body=f"""Fit $k$ and $A$ for the loam, and report $R^2$.

\\textbf{{Solution.}} With $x_i=\\ln\\tau_i$, $y_i=\\ln(F_i/1000)$ over 25 points: $\\bar x={x.mean():.4f}$, $\\bar y={y.mean():.4f}$, $\\sum(x-\\bar x)^2={((x-x.mean())**2).sum():.4f}$, $\\sum(x-\\bar x)(y-\\bar y)={((x-x.mean())*(y-y.mean())).sum():.4f}$. So $A={sp['A']:.4f}$ and $\\ln k=\\bar y-A\\bar x={y.mean()-sp['A']*x.mean():.4f}$, $k={sp['k']:.6f}$ m min$^{{-A}}$ ($={sp['k']*1000:.3f}$ mm min$^{{-A}}$), $R^2={sp['R2']:.4f}$. Table~\\ref{{tab:kost}} compares every fourth point of the Green--Ampt curve with the fitted power law."""
body+=tab(["$\\tau$ (min)","$F$ (mm)","$x$","$y$","$k\\tau^A$ (mm)"],rows,"Kostiakov fit of the loam (every fourth of 25 points).","tab:kost")
body+=r"""\textbf{Reading.} The coefficient of determination of 0.997 is the quality of the conversion; the manual shows ``fit $R^2$ 0.997'' for its coarse-loam example. At 600 min the power law gives the same depth as Green--Ampt to within a few per cent, but it has no steady rate: $dZ/d\tau=kA\tau^{A-1}\to0$ for $A<1$, which makes the long-time intake smaller than the saturated conductivity."""
w(ex("fitting the Kostiakov law",body))
rows=[]
for sid in IDS:
    sp2=soilpar(sid,0.45)
    rows.append([sid,SOIL[sid][0],f"{sp2['pf']:.0f}",f"{sp2['dth']:.3f}",f"{sp2['k']*1000:.3f}",f"{sp2['A']:.3f}",f"{sp2['R2']:.3f}"])
body=r"""Repeat for the ten soils at $f_T=0.45$.

\textbf{Solution.} Table~\ref{tab:kostall} lists $\psi_f$, $\Delta\theta$, $k$, $A$ and $R^2$. The exponent $A$ is larger for the sandy soils (their intake approaches a constant rate early, so the log-log curve is straighter and steeper) and $k$ is larger too."""
body+=tab(["ID","Soil","$\\psi_f$ (mm)","$\\Delta\\theta$","$k$ (mm min$^{-A}$)","$A$","$R^2$"],rows,"Kostiakov parameters of the ten soils from the pedotransfer chain.","tab:kostall")
w(ex("intake parameters for all soils",body))
# Manning
y,A0=manning_furrow(1.2,0.003,0.04)
lo,hi=1e-4,2.0;steps=[]
for i in range(8):
    mid=(lo+hi)/2;Aq=mid*mid;P=2*mid*math.sqrt(2);Qc=Aq*(Aq/P)**(2/3)*math.sqrt(0.003)/0.04*1000
    steps.append((i+1,mid,Qc));
    if Qc<1.2: lo=mid
    else: hi=mid
w(r"""\section{Inlet flow area (Manning)}
At the inlet, $Q=\frac1nAR_h^{2/3}S^{1/2}$, $R_h=A/P$. For a furrow with side slope $z=1$: $A=zy^2$, $P=2y\sqrt{1+z^2}$, solved for the depth $y$ by 60 bisection steps; $A_0=zy^2$. For a border or basin, $y_0=(qn/\sqrt S)^{0.6}$ with $q$ in m$^2$ s$^{-1}$ and $A_0=y_0$.
""")
body=f"""Find the flow depth and the inlet area for $q=1.2$ L s$^{{-1}}$, $S=0.003$, $n=0.04$, $z=1$ and check the furrow does not overtop (limit $D=0.25$ m).

\\textbf{{Solution.}} $Q=0.0012$ m$^3$ s$^{{-1}}$. At depth $y$: $A=y^2$, $P=2.828y$, $R_h=0.3536y$, so $Q(y)=\\frac1{{0.04}}y^2(0.3536y)^{{2/3}}\\sqrt{{0.003}}=0.0\\ldots$: that is $Q(y)=1.7138\\,y^{{8/3}}$ (since $0.3536^{{2/3}}=0.5002$ and $0.5002\\times0.05477/0.04=0.6849$; hence $Q(y)=0.6849\\,y^{{8/3}}$). Setting $Q(y)=0.0012$: $y^{{8/3}}=0.001752$, $y=0.001752^{{3/8}}=0.0926$ m. The bisection of the application reaches the same value (Table~\\ref{{tab:bis2}}, first eight steps). The inlet area is $A_0=y^2={y*y:.5f}$ m$^2$ = {y*y*1e4:.1f} cm$^2$. Since $0.0926<0.25$ m, no overtopping."""
body=body.replace("$Q(y)=\\frac1{{0.04}}y^2(0.3536y)^{{2/3}}\\sqrt{{0.003}}=0.0\\ldots$: that is $Q(y)=1.7138\\,y^{{8/3}}$ (since $0.3536^{{2/3}}=0.5002$ and $0.5002\\times0.05477/0.04=0.6849$; hence $Q(y)=0.6849\\,y^{{8/3}}$)","$Q(y)=\\frac1{{0.04}}y^2(0.3536y)^{{2/3}}\\sqrt{{0.003}}$; since $0.3536^{{2/3}}=0.5000$ and $0.5\\times0.05477/0.04=0.6847$, $Q(y)=0.6847\\,y^{{8/3}}$")
body=body.replace("{{","{").replace("}}","}") if False else body
body+=tab(["Step","$y$ (m)","$Q(y)$ (L/s)","Keep"],[[i,f"{mid:.5f}",f"{q:.4f}","upper" if q<1.2 else "lower"] for i,mid,q in steps],"First eight bisection steps for the furrow depth.","tab:bis2")
w(ex("Manning depth in a furrow",body))
ys,As=manning_sheet(0.006,0.002,0.15)
body=f"""For a border strip with $q=6$ L s$^{{-1}}$ per metre width ($0.006$ m$^2$ s$^{{-1}}$), $S=0.20$ per cent, $n=0.15$: find $y_0$ and $A_0$.

\\textbf{{Solution.}} $y_0=(qn/\\sqrt S)^{{0.6}}=(0.006\\times0.15/0.04472)^{{0.6}}=(0.02012)^{{0.6}}={ys:.4f}$ m, so $A_0={As:.4f}$ m$^2$ per metre of width. A sheet flow 3.7 cm deep at the inlet."""
w(ex("sheet flow in a border",body))
txt="\n".join(O)
txt=txt.replace("\\sqrt{0.003}=0.0\\ldots$: that is $Q(y)=1.7138\\,y^{8/3}$ (since $0.3536^{2/3}=0.5002$ and $0.5002\\times0.05477/0.04=0.6849$; hence $Q(y)=0.6849\\,y^{8/3}$)","\\sqrt{0.003}$; since $0.3536^{2/3}=0.5000$ and $0.5\\times0.05477/0.04=0.6847$, $Q(y)=0.6847\\,y^{8/3}$")
open('/tmp/book/p2j.tex','w').write(txt)
