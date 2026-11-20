import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import eng2, numpy as np, pandas as pd
O=[];w=O.append
R='../../../../results/'
w(r"""\chapter{Field balance, soil--plant--air and profile evolution}\label{ch:bal}
\markboth{Field balance}{Field balance}
\textbf{After this chapter you can} check the budget printed by the field-balance layer, compute the potentials along the soil--plant--air path, and the share of the root zone beyond a trigger.

\section{Field balance: the closed budget}
The home layer draws the water budget of a field for a day, a year or the 20-year mean: $P+I=T+E+E_{\rm other}+D+\Delta S$ (Equation 5.12 of the application). In the average-year view the five numbers over the arrows and the strip below must satisfy this identity.
""")
body=r"""The average-year view shows $P=598$, $I=142$, $T=236$, $E=171$, interception and mulch evaporation $E_{\rm other}=88$, $D=207$ mm. (These are illustrative numbers for the check.) (a) Compute the storage change. (b) Change the rainfall scale to $\times1.3$ and recompute the rain; if the extra rain is shared as $25$ per cent evaporated, $15$ per cent intercepted and the rest drained, find the new drainage and $\Delta S$.

\textbf{Solution.} (a) Inputs $598+142=740$ mm; outputs $236+171+88+207=702$ mm; $\Delta S=740-702=+38$ mm. (b) The new rain is $1.3\times598=777.4$ mm, an extra $179.4$ mm. Evaporation takes $0.25\times179.4=44.9$ mm, interception $0.15\times179.4=26.9$ mm, drainage the remaining $60$ per cent, $107.6$ mm. New values: $E=215.9$, $E_{\rm other}=114.9$, $D=314.6$, and $\Delta S=777.4+142-(236+215.9+114.9+314.6)=+38$ mm (unchanged by construction). Drainage rises by 52 per cent for 30 per cent more rain, which is why the drainage and nitrate-leaching arrows thicken together.

\textbf{Efficiency indices.} The irrigation efficiency for a yield of 6.6 Mg ha$^{-1}$ is $100\times6.6/142=4.65$ kg m$^{-3}$; the transpiration share of evapotranspiration is $236/(236+171+88)=47.7$ per cent."""
w(ex("checking the budget and changing the rain",body))

w(r"""\section{Soil, plant and air: potentials along the path}
The suction of each layer is $h_i=\max\{30,h(f_i)\}$ with $f_i=1-s_i$ and $\psi_{\rm soil,i}=-h_i\times9.807\times10^{-5}$ MPa cm$^{-1}$. The root-zone suction is the density-weighted mean $h_{RZ}=\sum\rho_ih_i/\sum\rho_i$. The plant is a chain of series resistances,
\begin{align}
R_{\rm soil}&=0.03\max\{K_r,0.002\}^{-0.55},\quad R_{\rm root}=0.10,\ R_{\rm xyl}=0.05,\ R_{\rm leaf}=0.08\ \ (\text{MPa per mm d}^{-1}),\\
\psi_{\rm root}&=\psi_{RZ}-aER_{\rm soil},\quad\psi_{\rm stem}=\psi_{\rm root}-aER_{\rm root},\quad\psi_{\rm leaf}=\mathrm{clip}\bigl(\psi_{\rm stem}-aE(R_{\rm xyl}+R_{\rm leaf});-3.2,0\bigr),
\end{align}
with $a=1$ when the cover exceeds 0.05 and $a=0$ for a fallow field. The air above the canopy has $\psi_{\rm air}=(RT/V_w)\ln\mathrm{RH}\approx135.5\ln\mathrm{RH}$ MPa.
""")
def spa(sid,h,E):
    nm,a,n,*_=SOIL[sid];kr=Kr(a,n,h);Rs=0.03*max(kr,0.002)**-0.55
    psi=-h*9.807e-5
    pr=psi-E*Rs;ps=pr-E*0.10;pl=max(-3.2,min(0,ps-E*(0.05+0.08)))
    return kr,Rs,psi,pr,ps,pl,ps-E*0.13
rows=[]
for sid,h in [('S06',50),('S06',300),('S06',1000),('S03',300)]:
    kr,Rs,psi,pr,ps,pl,raw=spa(sid,h,4.0)
    rows.append([sid,h,f"{kr:.2e}",f"{Rs:.3f}",f"{psi:.4f}",f"{pr:.3f}",f"{ps:.3f}",f"{pl:.3f}"])
body=r"""A transpiring crop ($a=1$) takes $E=4$ mm d$^{-1}$. Compute the potentials along the path for the loam S06 at root-zone suctions of 50, 300 and 1000 cm, and for the sand S03 at 300 cm.

\textbf{Solution (loam, 300 cm, in full).} 1. Relative conductivity $K_r(300)=3.8\times10^{-5}$, below the floor $0.002$, so $R_{\rm soil}=0.03(0.002)^{-0.55}=0.03\times30.5=0.915$ MPa per mm d$^{-1}$. 2. Soil potential $\psi_{RZ}=-300\times9.807\times10^{-5}=-0.0294$ MPa. 3. $\psi_{\rm root}=-0.0294-4(0.915)=-3.689$ MPa. 4. $\psi_{\rm stem}=-3.689-4(0.10)=-4.089$ MPa. 5. $\psi_{\rm leaf}=-4.089-4(0.05+0.08)=-4.609$, clipped to $-3.2$ MPa. Table~\ref{tab:spa} lists the other cases."""
body+=tab(["Soil","$h$ (cm)","$K_r$","$R_{\\rm soil}$","$\\psi_{RZ}$","$\\psi_{\\rm root}$","$\\psi_{\\rm stem}$","$\\psi_{\\rm leaf}$"],rows,"Potentials (MPa) along the soil--plant path for $E=4$ mm d$^{-1}$.","tab:spa")
body+=r"""\textbf{Caution (from the manual, reproduced by the numbers).} In every case except the wet loam the relative conductivity is below the floor and $R_{\rm soil}$ sits at its cap of $0.92$ MPa per mm d$^{-1}$; the leaf potential then reaches the clip at $-3.2$ MPa, below the intended range $-1$ to $-1.5$ MPa. The leaf, stem and root potentials of this layer therefore illustrate the series-resistance concept and are not a measure of plant water status."""
w(ex("the soil--plant--air path",body))
rh=0.66;pa=135.5*math.log(rh);rh3=min(0.9,max(0.35,0.66-0.03*3));pa3=135.5*math.log(rh3)
body=f"""Compute the air potential at $\\mathrm{{RH}}=66$ per cent and under a warming of $\\Delta T=3$ K, where $\\mathrm{{RH}}=\\mathrm{{clip}}(0.66-0.03\\Delta T;0.35,0.90)$. Also verify the constant 135.5.

\\textbf{{Solution.}} $RT/V_w=8.314\\times293/(18\\times10^{{-6}})=1.353\\times10^{{8}}$ Pa $=135.3$ MPa (the application uses 135.5). At $66$ per cent: $\\psi_{{\\rm air}}=135.5\\ln0.66={pa:.1f}$ MPa. With $\\Delta T=3$ K the humidity is $0.66-0.09=0.57$ and $\\psi_{{\\rm air}}=135.5\\ln0.57={pa3:.1f}$ MPa: the air gets $20$ MPa drier. The potential difference from a leaf at $-1.5$ MPa to the air is therefore about 55 to 75 MPa, far larger than any difference inside the plant; the resistances of the chain decide how much of it is used, not the size of the air potential itself."""
w(ex("the water potential of the air",body))
w(r"""\section{Profile evolution}
The share of the 0 to 60 cm root zone beyond the trigger is the thickness-weighted fraction
\begin{equation}\mathrm{share}=\frac{\sum_{i:z_i\le60,\ h_i>h_T}\Delta z_i}{\sum_{i:z_i\le60}\Delta z_i},\end{equation}
and the seasonal mean suction is the geometric mean $m_y=10^{\frac1{183}\sum_d\log_{10}h_d}$.
""")
h=np.array([60,80,120,200,350,500,700,900,1100,1300,1600,2000])
share=(h>300).mean()
body=f"""Twelve layers of 5 cm (down to 60 cm) have suctions $h_i=60,80,120,200,350,500,700,900,1100,1300,1600,2000$ cm. Find the share beyond a trigger of 300 cm and beyond 1000 cm; and the geometric mean suction of the profile.

\\textbf{{Solution.}} Layers above 300 cm: 350, 500, 700, 900, 1100, 1300, 1600, 2000, which is 8 of 12, so the share is $8\\times5/60={share:.3f}$. Beyond 1000 cm: 1100, 1300, 1600, 2000, which is 4 of 12, so $0.333$. The geometric mean is $10^{{\\overline{{\\log_{{10}}h}}}}$: the mean of the logarithms is ${np.log10(h).mean():.4f}$, so $m={10**np.log10(h).mean():.0f}$ cm, which is lower than the arithmetic mean ${h.mean():.0f}$ cm because the geometric mean damps the very dry layers. The heat strip of the application uses the geometric mean for this reason."""
w(ex("share of the root zone beyond the trigger",body))
# rainfall year factor already done; now driest/wettest
body=r"""In the 20-year record the median growing-season mean suction is $m_{\rm med}=250$ cm. A season has $\overline{\log_{10}h}=2.8$. Find its $m_y$, the year factor $\gamma_y$ for rainfall generation, and the mean wet-day depth for $P=600$ mm.

\textbf{Solution.} $m_y=10^{2.8}=631$ cm. $\gamma_y=(250/631)^{0.3}=0.396^{0.3}=e^{0.3\ln0.396}=e^{-0.2788}=0.757$ (inside $[0.65,1.45]$). $\mu_0=5.871$ mm, so the mean wet-day depth is $5.871\times0.757=4.44$ mm and the expected annual rain is $0.28\times365\times4.44=454$ mm, 24 per cent below the 600 mm normal. A dry season in the record gives a dry generated year."""
w(ex("dry seasons in the record",body))
open('/tmp/book/p2d.tex','w').write("\n".join(O))
