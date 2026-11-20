import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import eng2, numpy as np, pandas as pd
O=[];w=O.append
R='../../../../results/'
def phi(cl,si): return min(.5,max(.34,.36+.0016*cl+.0009*si))
def th(s,h):
    nm,a,n,awc,sa,si,cl=SOIL[s];p=phi(cl,si);tr=.01+.0006*cl
    return tr+(p-tr)*Se(a,n,h)
# ======= Structure
w(r"""\chapter{Soil structure and tillage layers}\label{ch:struct}
\markboth{Soil structure}{Soil structure}
\textbf{After this chapter you can} follow the consolidation of a tilled topsoil, build the retention curve from texture, compute the capillary radius of a pore and the hydraulic effect of tillage, and read the depth of root uptake.

\section{Pore index and consolidation}
After tillage the relative pore space $p$ (1 is freshly loosened) relaxes to a consolidated value $p_c=0.30$:
\begin{equation}p(t)=p_c+(p_0-p_c)e^{-\tau_ct},\qquad p_0=1.00\ (\text{conventional}),\ 0.72\ (\text{reduced}),\end{equation}
with $t$ in days since tillage; no-till keeps $p=0.42$. The half-life of loose pores is $\ln2/\tau_c$.
""")
rows=[]
for tau in [0.001,0.005,0.01,0.02]:
    rows.append([f"{tau:.3f}",f"{math.log(2)/tau:.0f}"]+[f"{0.30+(p0-0.30)*math.exp(-tau*t):.3f}" for p0 in (1.0,0.72) for t in (30,120)])
body=r"""Compute $p(t)$ at 30 and 120 days for conventional and reduced tillage at the four rates $\tau_c=0.001,0.005,0.01,0.02$ d$^{-1}$, with the half-lives.

\textbf{Solution.} Half-life $=\ln2/\tau_c$: $693$ d at $0.001$, $139$ d at $0.005$, $69$ d at $0.01$ and $35$ d at $0.02$. For conventional tillage at $\tau_c=0.01$ and $t=30$: $p=0.30+0.70e^{-0.3}=0.30+0.70(0.7408)=0.8186$. At $t=120$: $0.30+0.70e^{-1.2}=0.30+0.70(0.3012)=0.511$. Table~\ref{tab:pore} lists all cases."""
body+=tab(["$\\tau_c$ (d$^{-1}$)","Half-life (d)","conv. 30 d","conv. 120 d","reduced 30 d","reduced 120 d"],rows,"Relative pore space after tillage.","tab:pore")
body+=r"""\textbf{Reading.} With the fastest consolidation (0.02) a conventionally tilled topsoil is back at 0.33 after 120 days, nearly consolidated; at 0.001 it is still 0.89 after the same time. The hydrological effect of tillage in the application's bars is read from the Daisy runs (E5), not from this curve; the curve is a drawing constant."""
w(ex("consolidation after tillage",body))
w(r"""\section{The retention curve from texture}
The thin section uses $\phi=\mathrm{clip}(0.36+0.0016\,\mathrm{clay}+0.0009\,\mathrm{silt};0.34,0.50)$, $\theta_r=0.01+0.0006\,\mathrm{clay}$ (percentages) and $\theta(h)=\theta_r+(\phi-\theta_r)\Se(h)$.
""")
rows=[]
for s in IDS:
    nm,a,n,awc,sa,si,cl=SOIL[s]
    rows.append([s,nm,sa,si,cl,f"{phi(cl,si):.3f}",f"{.01+.0006*cl:.3f}",f"{th(s,100):.3f}",f"{th(s,15849):.3f}",f"{th(s,100)-th(s,15849):.3f}"])
body=r"""Compute $\phi$, $\theta_r$, the field-capacity content $\theta(100)$, the wilting content $\theta(15849)$ and the plant-available water $\theta(100)-\theta(15849)$ for the ten soils.

\textbf{Solution.} Worked for the loam (S06: 40 per cent sand, 40 silt, 20 clay): $\phi=0.36+0.0016(20)+0.0009(40)=0.36+0.032+0.036=0.428$; $\theta_r=0.01+0.0006(20)=0.022$. With $\alpha=0.036$, $n=1.56$: $\Se(100)=0.5107$ hmm"""
nm,a,n,*_=SOIL['S06']
body=body.split(" hmm")[0]+f"$\\Se(100)={Se(a,n,100):.4f}$ and $\\Se(15849)={Se(a,n,15849):.4f}$. So $\\theta(100)=0.022+0.406({Se(a,n,100):.4f})={th('S06',100):.3f}$ and $\\theta(15849)={th('S06',15849):.3f}$; the plant-available water is ${th('S06',100)-th('S06',15849):.3f}$ cm$^3$ cm$^{{-3}}$, that is {10*(th('S06',100)-th('S06',15849)):.2f} mm per cm. Table~\\ref{{tab:thetaten}} gives all ten soils."
body+=tab(["ID","Soil","Sand","Silt","Clay","$\\phi$","$\\theta_r$","$\\theta(100)$","$\\theta(15849)$","AWC$_{\\rm vG}$"],rows,"Water contents from texture (percentages of sand, silt, clay).","tab:thetaten")
body+=r"""\textbf{Reading.} Between 100 and 15,849 cm the retention curve gives $0.004$ cm$^3$ cm$^{-3}$ for the sand (0.04 mm per cm) rising to $0.25$ for the silt loam and silty clay loam (2.5 mm per cm). The engineered per-texture constants of Chapter~\ref{ch:e1} are 0.6 mm per cm for the sand and 1.7 to 2.0 for the fine soils. The two agree in order of magnitude for the loams, but not for the sands: with $n=2.68$ almost all of the sand's water leaves the pores before 100 cm. The manual labels the AWC constants as typical texture-class values, not derived from the study soil, and this comparison shows why the label matters."""
w(ex("water contents from texture",body))
# Jurin
rows=[[h,f"{1.49/h*10:.4f}" if False else f"{1490/h:.2f}"] for h in [10,31.6,100,300,1000,15849]]
body=r"""A pore of radius $r$ fills with water at suction $h$ if $r\le r_c(h)$, where Jurin's law gives $r_c=\dfrac{2\sigma\cos\gamma}{\rho_wgh}\approx\dfrac{0.149\ \mathrm{cm}^2}{h}$. (a) Verify the constant $0.149$ cm$^2$. (b) Find the largest water-filled pore at 10, 31.6, 100, 300, 1000 and 15,849 cm. (c) At what suction does a pore of radius 25 $\mu$m empty?

\textbf{Solution.} (a) $\sigma=0.0728$ N m$^{-1}$, $\gamma=0$, $\rho_w=998$ kg m$^{-3}$, $g=9.81$ m s$^{-2}$: $2\sigma/(\rho_wg)=0.1456/(9790.4)=1.487\times10^{-5}$ m$^2$ $=0.1487$ cm$^2$ $\approx0.149$ cm$^2$. (b) $r_c=0.149/h$ cm, that is $1490/h$ $\mu$m, so the radii are $149$, $47.2$, $14.9$, $4.97$, $1.49$ and $0.094$ $\mu$m (Table~\ref{tab:jur} gives the same in $\mu$m). (c) $h=1490/25=59.6$ cm. The rule of the application, ``$r$ in micrometres empties at about 1490 divided by $r$ centimetres'', is the same law. The ``wide pores'' of the hidden-question panel, those that empty at less than 31.6 cm, have $r>47$ $\mu$m."""
body+=tab(["$h$ (cm)","$r_c$ ($\\mu$m)"],rows,"Capillary radius.","tab:jur")
w(ex("Jurin's law and the pore picture",body))
# tillage effect OLS regression with real memory data vs clay
t=pd.read_csv(R+'p1_table2.csv',index_col=0)
cl=np.array([SOIL[s][6] for s in t.index],float);y=t.phiD_E9.values
b=((cl-cl.mean())*(y-y.mean())).sum()/((cl-cl.mean())**2).sum();a0=y.mean()-b*cl.mean()
r=np.corrcoef(cl,y)[0,1]
rows=[[s,SOIL[s][0],int(c),f"{v:.3f}",f"{a0+b*c:.3f}"] for s,c,v in zip(t.index,cl,y)]
w(r"""\section{Hydraulic drivers: regression on clay}
For each soil the layer shows $\Delta_{\rm till}=D(\mathrm{conv})-D(\mathrm{notill})$ and $\Delta_{\rm cons}$, and fits ordinary least squares on clay content $c$:
\begin{equation}\hat\Delta=a+bc,\quad b=\frac{\sum_s(c_s-\bar c)(\Delta_s-\bar\Delta)}{\sum_s(c_s-\bar c)^2},\quad a=\bar\Delta-b\bar c.\end{equation}
""")
body=f"""The drainage differences of run set E5 are not part of the repository tables, so the same least-squares recipe is applied here to the archived \\emph{{drainage share of the memory fate}} $\\phi_D$ (Chapter~\\ref{{ch:fate}}), of the ten soils, against clay. Fit $\\hat\\phi_D=a+bc$.

\\textbf{{Solution.}} Clay percentages: {', '.join(str(int(c)) for c in cl)}; mean $\\bar c={cl.mean():.1f}$. $\\bar\\phi_D={y.mean():.4f}$. $\\sum(c-\\bar c)^2={((cl-cl.mean())**2).sum():.1f}$ and $\\sum(c-\\bar c)(\\phi-\\bar\\phi)={((cl-cl.mean())*(y-y.mean())).sum():.3f}$. Slope $b={b:.4f}$ per percentage point of clay, intercept $a={a0:.3f}$, correlation $r={r:.3f}$, $R^2={r*r:.3f}$. Table~\\ref{{tab:ols}} lists the fitted values. Each additional percentage point of clay lowers the drainage share of the memory by {abs(b):.3f}, but clay explains only {100*r*r:.0f} per cent of the variance: the fit is a trend and not a law (the retention parameter $n$ explains the memory far better, Spearman $\\rho=0.952$, Chapter~\\ref{{ch:mem}})."""
body+=tab(["ID","Soil","Clay (\\%)","$\\phi_D$ (data)","fitted"],rows,"Least-squares fit of the drainage share of memory on clay.","tab:ols")
w(ex("regression of a hydraulic effect on clay",body))
# root depth z_p
r2=eng2.run('S06');U=r2['U'];cum=np.cumsum(U)/U.sum()
k50=int(np.argmax(cum>=0.5))+1;k90=int(np.argmax(cum>=0.9))+1
body=f"""The depth holding a fraction $p$ of the uptake is $z_p=k_p\\Delta z$, $k_p=\\min\\{{k:\\sum_{{i\\le k}}U_i/\\sum U_i\\ge p\\}}$. For the loam season of Chapter~\\ref{{ch:e2}} the transpiration drawn from the first twenty layers (mm) was """+", ".join(f"{u:.1f}" for u in U[:20])+f""". Find $z_{{0.5}}$ and $z_{{0.9}}$.

\\textbf{{Solution.}} The total uptake over all layers is ${U.sum():.1f}$ mm. The cumulative shares reach 50 per cent at layer {k50} (cumulative {cum[k50-1]:.3f}; layer {k50-1} has {cum[k50-2]:.3f}), so $z_{{0.5}}={k50}\\times2.5={k50*2.5:.1f}$ cm. They reach 90 per cent at layer {k90} ({cum[k90-1]:.3f}; one layer less gives {cum[k90-2]:.3f}), so $z_{{0.9}}={k90*2.5:.1f}$ cm. Half of the water is taken from the upper {k50*2.5:.0f} cm although the roots reach {r2['Rd']:.0f} cm: the root-density function decreases exponentially with depth."""
w(ex("depth of root uptake",body))
open('/tmp/book/p2e.tex','w').write("\n".join(O))
