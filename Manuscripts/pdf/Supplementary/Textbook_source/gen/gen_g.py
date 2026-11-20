import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import numpy as np
O=[];w=O.append
w(r"""\chapter{Feedback loops and the hidden questions of the vadose zone}\label{ch:fb}
\markboth{Feedback loops}{Feedback loops}
\textbf{After this chapter you can} compute the seven one-step effects and the arrow widths of the feedback layer, the nitrate cost of drainage, and the numbers behind each of the eight hidden questions.

\section{The seven effects}
For each control the engine moves one step on its list and re-evaluates Engine 1; the change is printed and the arrow width is $w_k=5+\mathrm{clip}(\mu_k;0,4)$ pixels, with $\mu_k$ from the table: temperature $\mu_1=8|\Delta Y|$; rain $\mu_2=|\Delta D|/12$; mulch $\mu_3=|\Delta E|/14$; trigger $\mu_4=|\Delta I|/8$; nitrate cost of drainage $\mu_5=|\Delta D|/10$; nitrogen $\mu_6=|\Delta N_L|/8$; consolidation $\mu_7=|\Delta D|/2$.
""")
steps=[("Temperature $+0.5$ K","$\\Delta Y$",-0.11,8),("Rain $+0.1$","$\\Delta D$",9.0,1/12),("Stronger mulch","$\\Delta E$",-14.0,1/14),("Trigger one step drier","$\\Delta I$",-22.0,1/8),("Drainage (rain step)","$\\Delta D$",9.0,1/10),("Nitrogen $+15$ per cent","$\\Delta N_L$",5.2,1/8),("Consolidation one step","$\\Delta D$",-0.6,1/2)]
rows=[]
for k,(nm,q,v,fac) in enumerate(steps,1):
    mu=abs(v)*fac;wd=5+min(4,max(0,mu))
    rows.append([k,nm,q,f"{v:+.2f}",f"{mu:.3f}",f"{wd:.2f}"])
body=r"""One-step differences for a soil (illustration values: $\Delta Y=-0.11$ Mg ha$^{-1}$, $\Delta D=+9.0$ mm for the rain step, $\Delta E=-14$ mm, $\Delta I=-22$ mm, $\Delta N_L=+5.2$ kg ha$^{-1}$, $\Delta D=-0.6$ mm for consolidation) give the arrow widths of Table~\ref{tab:arrow}.

\textbf{Solution.} Example, row 4: $\mu_4=22/8=2.75$, so $w_4=5+2.75=7.75$ pixels. Row 3: $\mu_3=14/14=1.0$, $w_3=6.0$. Row 1: $\mu_1=8\times0.11=0.88$, $w_1=5.88$. A step that would give $\mu>4$ is clipped at width 9 pixels."""
body+=tab(["\\#","Control step","Effect","Value","$\\mu$","Width (px)"],rows,"Arrow widths of the seven feedbacks.","tab:arrow")
w(ex("arrow widths",body))
body=r"""The study reports about $1.06$ kg N ha$^{-1}$ lost per mm of drainage: $\kappa_N=\dfrac{N_L^{(\text{rain step})}-N_L}{D^{(\text{rain step})}-D}$. With the rain step above ($\Delta D=+9.0$ mm, $\Delta N_L=+9.5$ kg N ha$^{-1}$), find $\kappa_N$ and the nitrate lost if the drainage is cut by 40 mm.

\textbf{Solution.} $\kappa_N=9.5/9.0=1.056$ kg N ha$^{-1}$ mm$^{-1}$, consistent with 1.06. Cutting drainage by 40 mm saves $40\times1.06=42.4$ kg N ha$^{-1}$, equal to a dressing of 42 kg of nitrogen that would otherwise be leached. The row is printed only if $|\Delta D|>0.5$ mm (otherwise ``no change''), because the ratio of two tiny differences is unstable."""
w(ex("the nitrate cost of drainage",body))
w(r"""\section{Hidden question 1: wetting and drying}
The wetting curve has twice the $\alpha$ of the drying curve. A sensor reads a suction from the water content; the same water content therefore corresponds to different suctions on the two branches.
""")
nm,a,n,*_=SOIL['S06'];m=1-1/n
se=Se(a,n,300)
hw=((se**(-1/m)-1)**(1/n))/(2*a)
body=f"""The loam ($\\alpha_d=0.036$, $n=1.56$) is at the trigger on the drying curve, $h_d=300$ cm. Find the suction that the same water content has on the wetting curve ($\\alpha_w=2\\alpha_d$).

\\textbf{{Solution.}} $\\Se=\\Se(300)={se:.4f}$ on the drying curve. On the wetting branch, $h_w=\\alpha_w^{{-1}}(\\Se^{{-1/m}}-1)^{{1/n}}$; since $\\alpha_w=2\\alpha_d$, $h_w=h_d/2=150$ cm exactly (check: ${hw:.1f}$ cm). A sensor that has just been wetted thus reads 150 cm where a drying soil at the same water content reads 300 cm: the trigger set in suction fires at twice the water deficit after wetting as after drying. Hysteresis makes the same reading mean different amounts of water."""
w(ex("the same water content on two branches",body))
w(r"""\section{Hidden question 2: where does water still move}
The capillary conductivity is $K_s K_r(h)$, and a film term proportional to $h^{-1.5}$ and anchored at $10^{-7}$ cm d$^{-1}$ at pF 4.2 ($h=15\,849$ cm) is added.
""")
Ks=24.96
rows=[]
for h in [300,3000,15849,10**5,316228]:
    kc=Ks*Kr(0.036,1.56,h);kf=1e-7*(h/15849)**-1.5
    rows.append([f"{h:,}".replace(',','{,}'),f"{kc:.2e}",f"{kf:.2e}",f"{kc+kf:.2e}"])
# crossover
lo,hi=1e2,1e7
f=lambda h:Ks*Kr(0.036,1.56,h)-1e-7*(h/15849)**-1.5
for _ in range(80):
    mid=math.sqrt(lo*hi)
    if f(mid)>0: lo=mid
    else: hi=mid
body=r"""For the loam with $K_s=24.96$ cm d$^{-1}$ compute the capillary conductivity, the film term and their sum at suctions 300, 3000, 15,849, $10^5$ and 316,228 cm (pF 5.5), and find the suction at which the film term overtakes the capillary term.

\textbf{Solution.} At pF 4.2 the film term is $10^{-7}$ cm d$^{-1}$ by construction. At pF 5.5: $10^{-7}(316228/15849)^{-1.5}=10^{-7}\times0.01122=1.12\times10^{-9}$ cm d$^{-1}$. The capillary term is $K_sK_r(h)$ with $K_r$ from the Mualem equation."""
body+=tab(["$h$ (cm)","Capillary","Film","Sum"],rows,"Conductivity (cm d$^{-1}$) of the loam, capillary and film terms.","tab:film")
body+=f"The two terms are equal at $h\\approx{fx(math.sqrt(lo*hi),0)}$ cm; beyond it, the film dominates. Where the soil is drier than that the conductivity falls only as $h^{{-1.5}}$ (a factor of 31.6 per decade of suction) instead of by orders of magnitude, so some water still moves in air-dry soil. The film term is an \\emph{{illustrative}} form, not calibrated.".replace(",",",")
w(ex("capillary and film conductivity",body))
w(r"""\section{Hidden question 5: where does the nitrate travel}
The panel shows the pores that empty at less than 31.6 cm (the \emph{wide} pores, radius above $47\ \mu$m) and the share of pore volume and of conductivity that they carry: share of volume $1-\Se(31.6)$; share of conductivity $1-K_r(31.6)$.
""")
rows=[]
for s in IDS:
    nm,a,n,*_=SOIL[s]
    rows.append([s,nm,f"{1-Se(a,n,31.6):.3f}",f"{1-Kr(a,n,31.6):.4f}"])
body=r"""Compute these two shares for the ten soils.

\textbf{Solution.} For the loam: $\Se(31.6)=0.7$ and $K_r(31.6)=0.37$ hmm"""
a,n=SOIL['S06'][1],SOIL['S06'][2]
body=body.split(" hmm")[0].replace("$\\Se(31.6)=0.7$ and $K_r(31.6)=0.37$",f"$\\Se(31.6)={Se(a,n,31.6):.3f}$ and $K_r(31.6)={Kr(a,n,31.6):.3f}$; the wide pores hold {100*(1-Se(a,n,31.6)):.0f} per cent of the pore volume and carry {100*(1-Kr(a,n,31.6)):.1f} per cent of the conductivity")+"."
body+=tab(["ID","Soil","Volume share","Conductivity share"],rows,"Share of pore volume and of conductivity in pores emptied below 31.6 cm.","tab:wide")
body+=r"""\textbf{Reading.} Where the wide pores carry nearly all of the conductivity, solute moves fast through a small part of the pore volume, so a nitrate pulse reaches the drain earlier than the mean water content suggests."""
w(ex("wide pores and conductivity",body))
w(r"""\section{Hidden question 4: the water table}
The water content above a water table at height $z$ is $\Se=[1+(\alpha z)^n]^{-m}$ (equilibrium, suction $h=z$); the quasi-saturated height is where $\Se<0.9$, that is $z_{90}=\alpha^{-1}(0.9^{-1/m}-1)^{1/n}$.
""")
rows=[]
for s in IDS:
    nm,a,n,*_=SOIL[s];m=1-1/n
    z90=((0.9**(-1/m)-1)**(1/n))/a
    rows.append([s,nm,f"{Se(a,n,5):.3f}",f"{Se(a,n,25):.3f}",f"{Se(a,n,60):.3f}",f"{Se(a,n,150):.3f}",f"{z90:.1f}"])
body=r"""Find $\Se$ at 5, 25, 60 and 150 cm above the water table and the height $z_{90}$ for the ten soils.

\textbf{Solution.} For the loam ($\alpha=0.036$, $n=1.56$, $m=0.359$): $0.9^{-1/m}=0.9^{-2.786}=1.341$, so $z_{90}=(1.341-1)^{0.641}/0.036=(0.341)^{0.641}/0.036=0.5013/0.036=13.9$ cm. Table~\ref{tab:wt} lists the ten soils."""
body+=tab(["ID","Soil","$\\Se$(5)","$\\Se$(25)","$\\Se$(60)","$\\Se$(150)","$z_{90}$ (cm)"],rows,"Water content above a water table and quasi-saturated height.","tab:wt")
w(ex("how far the water table reaches into the root zone",body))
w(r"""\section{Hidden questions 6 and 7: salinity and the uptake curve}
At steady state the salt entering equals the salt leaving: $I\,EC_{\rm irr}=D\,EC_{\rm dr}$. The root-zone salinity is taken as a quarter of the sum, $EC_{\rm rz}=(EC_{\rm irr}+EC_{\rm dr})/4$, and wheat loses $7.1$ per cent of yield per dS m$^{-1}$ above a threshold of 6 dS m$^{-1}$.
""")
rows=[]
for I_,D_ in [(150,60),(150,30),(150,15)]:
    for ec in [2,4,6]:
        dr=ec*I_/D_;rz=(ec+dr)/4;y=1-0.071*max(0,rz-6)
        rows.append([I_,D_,ec,f"{dr:.1f}",f"{rz:.2f}",f"{100*y:.1f}"])
body=r"""For an irrigation of $I=150$ mm and drainage of $60$, $30$ and $15$ mm, find $EC_{\rm dr}$, $EC_{\rm rz}$ and the relative yield for irrigation water of 2, 4 and 6 dS m$^{-1}$. Then find the largest irrigation-water salinity that keeps the yield at 100 per cent.

\textbf{Solution.} $EC_{\rm dr}=EC_{\rm irr}I/D$. For $I=150$, $D=60$, $EC_{\rm irr}=2$: $EC_{\rm dr}=5$, $EC_{\rm rz}=(2+5)/4=1.75$ dS m$^{-1}$, below 6, so yield 100 per cent. For $D=15$ and $EC_{\rm irr}=6$: $EC_{\rm dr}=60$, $EC_{\rm rz}=16.5$, loss $0.071(16.5-6)=0.745$, yield 25.5 per cent. See Table~\ref{tab:salt}."""
body+=tab(["$I$","$D$","$EC_{\\rm irr}$","$EC_{\\rm dr}$","$EC_{\\rm rz}$","Yield (\\%)"],rows,"Salt balance and wheat yield.","tab:salt")
body+=r"""\textbf{Threshold.} $EC_{\rm rz}=EC_{\rm irr}(1+I/D)/4\le6$ gives $EC_{\rm irr}\le24/(1+I/D)$: $6.86$ dS m$^{-1}$ for $D=60$ ($I/D=2.5$), $4.0$ for $D=30$ and $2.2$ for $D=15$. Less drainage means less leaching and a lower tolerable salinity: the same irrigation water that is safe in a free-draining soil damages wheat in a tight soil. The steady state, the one-quarter rule and the threshold are stated simple forms ``for teaching and comparison'', not calibrated to a field."""
w(ex("how salty can the irrigation water be",body))
body=r"""The uptake curve has breakpoints at 10, 25, 500 and 8,000 cm (a Feddes-type reduction function; here assumed linear in $h$ between breakpoints): uptake is zero at $h\le10$ cm (anaerobic), rises linearly to 1 at 25 cm, stays at 1 until 500 cm and falls linearly to 0 at 8,000 cm. Find the relative uptake at $h=15,\ 300,\ 1000,\ 3000$ and 6000 cm.

\textbf{Solution.} At 15 cm: $(15-10)/(25-10)=0.333$. At 300 cm: 1. At 1000 cm: $1-(1000-500)/7500=0.933$. At 3000: $1-2500/7500=0.667$. At 6000: $1-5500/7500=0.267$. A trigger of $-1000$ cm therefore costs a crop only about 7 per cent of the potential uptake at the moment of the trigger, but the average over the dry-down is lower. In the loam $-1000$ cm is a depletion of """+f"{fdep(0.036,1.56,1000):.2f}"+r""", beyond the $f^*=0.45$."""
w(ex("reduction of root uptake with suction",body))
w(r"""\section{Hidden question 8: keeping up with the sun}
The topsoil delivers water against the demand until stage 2 begins; mulch reduces the demand and lengthens stage 1 (Chapter~\ref{ch:mulch}). The panel's answer is the stage-1 duration $t_1=Q_1/e_0$.""")
body=r"""For the sand (S03, $Q_1=12.7$ mm) and the silty clay loam (S10, $Q_1=4.6$ mm) find how long the topsoil keeps up with a demand of 4.2 mm d$^{-1}$ bare, and with a mulch $\varphi=0.3$.

\textbf{Solution.} Bare: sand $12.7/4.2=3.0$ d; silty clay loam $4.6/4.2=1.1$ d. With mulch $e_0=4.2\times0.3=1.26$: sand $12.7/1.26=10.1$ d; silty clay loam $4.6/1.26=3.7$ d. Mulch triples the time that the surface keeps pace in both soils; the sand has the longer reserve."""
w(ex("stage 1 with and without mulch",body))
open('/tmp/book/p2g.tex','w').write("\n".join(O))
