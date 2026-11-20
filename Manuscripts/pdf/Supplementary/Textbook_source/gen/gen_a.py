import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import eng2
O=[]
def w(s): O.append(s)
# ---------------- Chapter: Engine 1
w(r"""\part{SWAFL layers: worked mathematics}
\chapter{Engine 1: depletion, critical suction and the meta-model}\label{ch:e1}
\markboth{Engine 1}{Engine 1}
\textbf{After this chapter you can} compute the depletion of plant-available water from a suction, invert it by bisection, reproduce the table of critical suctions of the application, and evaluate the meta-model ratios, the closure window and the irrigation efficiency by hand.

Part II treats the application layer by layer. Every layer of SWAFL is driven by one of two engines (the Daisy meta-model and the daily bucket model) or by a design module. For each layer this part states the relations that the manual gives, then solves them with numbers. The numbers come from running the stated equations; every problem is solved in full, and where an input is not published (an annual flux, say) it is labelled as an assumed value.

\section{Depletion between field capacity and wilting point}
The application defines depletion of plant-available water between field capacity (suction 100 cm, pF 2.0) and the wilting point (15,849 cm, pF 4.2):
\begin{equation}\label{eq:fdep}
f(h)=\frac{\Se(100)-\Se(|h|)}{\Se(100)-\Se(15\,849)},\qquad f_{\rm used}=\min\{1,\max\{0,f\}\}.
\end{equation}
$f=0$ is field capacity and $f=1$ is the wilting point.
""")
S=['S06','S03','S10']
rows=[]
body=r"""Compute $f$ at the sensor suction $|h|=300$ cm for the loam S06 ($\alpha=0.036$, $n=1.56$), the sand S03 ($\alpha=0.145$, $n=2.68$) and the silty clay loam S10 ($\alpha=0.010$, $n=1.23$).

\textbf{Solution.} For each soil compute $m=1-1/n$ and three values of $\Se=[1+(\alpha h)^n]^{-m}$.

"""
for s in S:
    nm,a,n,*_=SOIL[s]; m=1-1/n
    s1,s2,s3=Se(a,n,100),Se(a,n,300),Se(a,n,15849)
    f=(s1-s2)/(s1-s3)
    body+=f"\\textbf{{{nm}}} ($m={m:.4f}$): $\\Se(100)={s1:.4f}$, $\\Se(300)={s2:.4f}$, $\\Se(15849)={s3:.4f}$. Then $f=({s1:.4f}-{s2:.4f})/({s1:.4f}-{s3:.4f})={f:.3f}$.\n\n"
body+=r"""\textbf{Reading.} At $-300$ cm the sand has used 84 per cent of its plant-available water while the silty clay loam has used 24 per cent. The same suction means very different dryness in different soils; this is the reason for the trigger law of Chapter~\ref{ch:ctrl}."""
w(ex("depletion at 300 cm in three soils",body))

# bisection
tr=[];a,n=SOIL['S06'][1],SOIL['S06'][2];hs=hof(a,n,.45,tr)
rows=[[k,f"{mid:.4f}",f"{h:.1f}",f"{ff:.4f}","lower" if ff<.45 else "upper"] for k,mid,h,ff in tr]
body=r"""Find the suction at which the loam S06 reaches the soil-independent critical depletion $f^*=0.45$. The application solves $f(h)=f^*$ by bisection on $\log_{10}|h|\in[0,4.6]$ with 60 halvings.

\textbf{Solution.} Start with the interval $[0,4.6]$. At each step take the midpoint $x=\log_{10}h$, evaluate $f$ with Equation~(\ref{eq:fdep}) and keep the half that still brackets $0.45$ (if $f<0.45$ the root is above, so the lower end moves up). The first eight steps are in Table~\ref{tab:bis}; the interval has then shrunk to $4.6/2^8=0.018$ in $\log_{10}h$, that is 4 per cent in $h$. After 60 halvings the width is $4\times10^{-18}$ and the answer is """+f"$h^*={hs:.1f}$ cm."+"\n"
body+=tab(["Step","$\\log_{10}h$ mid","$h$ (cm)","$f(h)$","Keep"],rows,"First eight bisection steps for the loam at $f^*=0.45$.","tab:bis")
body+=r"""\textbf{Check.} The application's table gives 284 cm for the loam; the computed value agrees to the rounding of the printed parameters."""
w(ex("inverting the depletion by bisection",body))

rows=[]
for s in IDS:
    nm,a,n,awc,*_=SOIL[s];h=hof(a,n,.45);ff=fdep(a,n,300)
    rows.append([s,nm,f"{a:.4f}",f"{n:.3f}",f"{awc}",f"{h:.0f}",f"{ff:.3f}"])
w(r"""\section{Table of critical suctions for the ten soils}""")
body=r"""Reproduce the application's table of effective parameters: for each of the ten soils compute the suction $h^*$ at $f^*=0.45$ and the depletion at 300 cm.

\textbf{Solution.} Repeat Problem~\ref{}the bisection for every soil. The result is in Table~\ref{tab:h45}. The published values are $387, 262, 143, 160, 195, 284, 401, 311, 503, 729$ cm and $0.380, 0.496, 0.842, 0.756, 0.627, 0.468, 0.367, 0.439, 0.314, 0.237$; the largest difference is 1 cm and 0.001 in $f$, which comes from the rounding of the printed parameters.
""".replace("Repeat Problem~\\ref{}the bisection","Repeat the bisection")
body+=tab(["ID","Soil","$\\alpha$ (cm$^{-1}$)","$n$","AWC (mm/cm)","$h^*$ (cm)","$f(300)$"],rows,"Critical suction at $f^*=0.45$ and depletion at 300 cm, computed from Equation~(\\ref{eq:fdep}).","tab:h45")
body+=r"""\textbf{Reading.} The critical suction rises from 143 cm for the sand to 729 cm for the silty clay loam: a fivefold spread in suction for one and the same depletion. A trigger at a fixed suction is therefore a different management in every soil."""
w(ex("the table of critical suctions",body))

# Zn
body=r"""The default net irrigation depth is $Z_n=\mathrm{clip}(f_T\cdot\mathrm{AWC}\cdot R_{\max};25,150)$ mm, with the maximum rooting depth
\begin{equation}\label{eq:rmax}R_{\max}=\mathrm{clip}\Bigl(R_c(0.85+0.3\,\mathrm{sand})\bigl[1+0.12\log_{10}(|h_T|/300)\bigr]\bigl[1-0.18\tfrac{N-100}{100}\bigr];25,100\Bigr)\ \text{cm}.\end{equation}
For a cereal $R_c=95$ cm. Find $Z_n$ for the loam S06 (sand 40 per cent, AWC 1.7 mm cm$^{-1}$) with trigger $-300$ cm and nitrogen $100$ per cent.

\textbf{Solution.} 1. Rooting depth: $0.85+0.3(0.40)=0.97$; the suction factor is $1+0.12\log_{10}(300/300)=1$; the nitrogen factor is $1-0.18(0)=1$. So $R_{\max}=95(0.97)=92.15$ cm, inside the clip $[25,100]$.

2. Trigger depletion: $f_T=f(300)=0.468$ (Table~\ref{tab:h45}).

3. Depth: $Z_n=0.468\times1.7\times92.15=73.3$ mm, inside $[25,150]$ mm.

\textbf{Repeat for the sand S03} (sand 92 per cent). $R_{\max}=95(0.85+0.276)=106.97$, clipped to $100$ cm. $f_T=0.842$, so $Z_n=0.842\times0.6\times100=50.5$ mm. The sand needs a smaller net depth per event (50.5 mm against 73.3 mm) because it holds less water per centimetre, although it is irrigated from a deeper depletion.

\textbf{Effect of a drier trigger.} For the loam at $h_T=1000$ cm: the suction factor is $1+0.12\log_{10}(3.333)=1.0627$, $R_{\max}=92.15\times1.0627=97.9$ cm, $f_T=f(1000)$ is """
nm,a,n,*_=SOIL['S06'];f1000=fdep(a,n,1000)
body+=f"${f1000:.3f}$, so $Z_n={f1000:.3f}\\times1.7\\times97.9={f1000*1.7*97.9:.1f}$ mm. A drier trigger deepens the roots by 6 per cent and increases the depth of each application by "+f"{(f1000*1.7*97.9/73.3-1)*100:.0f} per cent."
w(ex("net irrigation depth and rooting depth",body))

# meta-model
w(r"""\section{The meta-model: ratios of Daisy results}
The annual fluxes of Engine 1 are built from the 20-year Daisy means $\mathbf b=(E_b,T_b,ET_b,I_b,Y_b,D_b,N_b)$ and from lookups in the mulch tables $M(\varphi,\rho)$ and warming tables $W(\Delta T,\rho)$ of the ensemble. The structure is multiplicative for fluxes and additive for drainage:
\begin{align}
T&=T_b\Bigl[\frac{\mathrm{now}.T}{\mathrm{bare}.T}\Bigr]\,\mathrm{clip}\Bigl(\frac{\mathrm{tN}.T}{\mathrm{tB}.T};0.3,2.5\Bigr),\label{eq:mT}\\
D&=D_b+(\mathrm{now}.D-\mathrm{bare}.D)+(\mathrm{tN}.D-\mathrm{tB}.D).\label{eq:mD}
\end{align}
Fluxes are multiplied because ratios of large numbers are stable; drainage and leaching are added because ratios of numbers near zero are not.
""")
body=r"""For a soil the baseline is $T_b=240$ mm, $D_b=40$ mm. The mulch table gives, at the present mulch and rain, $\mathrm{now}.T=232$, $\mathrm{bare}.T=225$, $\mathrm{now}.D=55$, $\mathrm{bare}.D=38$; the warming table gives $\mathrm{tN}.T=236$, $\mathrm{tB}.T=229$, $\mathrm{tN}.D=44$, $\mathrm{tB}.D=40$. (These table entries are \emph{assumed} illustration values; the real ones are in the ensemble tables.) Find $T$ and $D$.

\textbf{Solution.} Transpiration: the mulch ratio is $232/225=1.0311$; the warming ratio is $236/229=1.0306$, inside $[0.3,2.5]$. So $T=240\times1.0311\times1.0306=255.0$ mm.

Drainage: $D=40+(55-38)+(44-40)=40+17+4=61$ mm.

\textbf{Why not multiply drainage?} If $\mathrm{bare}.D$ were $2$ mm and $\mathrm{now}.D$ were $6$ mm, the ratio would be 3 and $D_b=40$ would become 120 mm; the additive form adds only the 4 mm difference. This is why the application treats drainage and leaching as differences."""
w(ex("combining mulch and warming ratios",body))

body=r"""After the four corrections the model enforces closure: $ET\in[P+I-D-30,\ P+I-D+15]$; if $ET$ lies outside, $ET$ is clipped and $E$, $T$ are scaled by the same factor. Then $E_{\rm other}=\max(0,ET-T-E)$, $\Delta S=P+I-ET-D$ and the irrigation efficiency $\mathrm{IE}=100Y/I$ (kg m$^{-3}$). Take $P=600$, $I=150$, $D=61$, $T=255$, $E=190$, $ET=520$ and $Y=6.4$ Mg ha$^{-1}$.

\textbf{Solution.} 1. Window: $P+I-D=689$, so $ET$ must lie in $[659,704]$. The model value $ET=520$ is below the lower bound.

2. Clip: $ET\leftarrow659$. The scale factor is $659/520=1.2673$, so $T=255\times1.2673=323.2$ and $E=190\times1.2673=240.8$ mm.

3. $E_{\rm other}=\max(0,659-323.2-240.8)=95.0$ mm (interception and mulch evaporation).

4. $\Delta S=600+150-659-61=30$ mm.

5. $\mathrm{IE}=100(6.4)/150=4.27$ kg m$^{-3}$ (1 mm is 10 m$^3$ ha$^{-1}$, so 150 mm is 1,500 m$^3$ and 6,400 kg / 1,500 m$^3$ = 4.27).

\textbf{Reading.} The window protects the balance from independent effects compounding beyond what the water allows; here it raised $ET$ by 139 mm, a large correction, which would signal that the ratio inputs are inconsistent."""
w(ex("closure window and irrigation efficiency",body))

w(r"""\section{Sensitivity of the reported numbers}""")
body=r"""For the loam, $Z_n$ is proportional to $f_T$, AWC and $R_{\max}$. Compute the relative change of $Z_n$ if AWC is overestimated by 20 per cent.

\textbf{Solution.} $Z_n\propto \mathrm{AWC}$, so the relative change is $+20$ per cent: $73.3\to88.0$ mm. Because $f_T=f(h_T)$ does not involve AWC, the suction at which irrigation starts is unchanged; only the depth per application changes. The number of events per season falls in proportion, so the seasonal total is first-order unaffected, but the events are larger and rarer."""
w(ex("sensitivity of the depth to the water capacity",body))
open('/tmp/book/p2a.tex','w').write("\n".join(O))
