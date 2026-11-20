import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import eng2, numpy as np
O=[];w=O.append
w(r"""\chapter{Engine 2: the daily bucket model, step by step}\label{ch:e2}
\markboth{Engine 2}{Engine 2}
\textbf{After this chapter you can} generate the canopy, rain, evaporation, transpiration and irrigation of a day by hand, run a season of the daily model, and scale it to the annual meta-model.

The daily model has $N=40$ layers of thickness $\Delta z=2.5$ cm. Layer $i$ holds water $w_i$ between $0$ and $W_{\max}=\mathrm{AWC}\,\Delta z$ (mm); relative content $s_i=w_i/W_{\max}$ and depletion $f_i=1-s_i$. All layers start at $0.72W_{\max}$. The sensor layer is $j_s=\mathrm{round}(z_s/\Delta z)$.
""")
# layout
body=r"""For the loam (AWC $=1.7$ mm cm$^{-1}$) with sensor depth 20 cm find $W_{\max}$, the sensor layer, the starting water and the trigger depletion for $-300$ cm.

\textbf{Solution.} $W_{\max}=1.7\times2.5=4.25$ mm; $j_s=\mathrm{round}(20/2.5)=8$; starting water $0.72\times4.25=3.06$ mm per layer, so the 100 cm profile holds $40\times3.06=122.4$ mm of plant-available water out of $170$ mm. The trigger depletion is $f_T=0.468$ (Chapter~\ref{ch:e1}), so the sensor layer must fall to $s_8\le1-0.468=0.532$, that is $w_8\le2.26$ mm, to start irrigation. At the start $w_8=3.06>2.26$, so no irrigation is due."""
w(ex("layout and state",body))
# canopy
w(r"""\section{Crop calendar and canopy cover}
For spring barley the sowing day is 100 and the harvest day is 225. The cover is the logistic
\begin{equation}c(d)=\frac{1}{1+\exp[-(d-d_{\rm mid})/13]},\quad d_{\rm mid}=d_{\rm sow}+50,\end{equation}
which after the peak day $d_{\rm pk}=d_{\rm harv}-50$ declines linearly to zero at harvest: $c\leftarrow c\,\max\{0,1-(d-d_{\rm pk})/(d_{\rm harv}-d_{\rm pk})\}$.
""")
rows=[]
for d in [100,120,140,150,160,175,190,205,215,225]:
    rows.append([d,f"{eng2.canopy_spring(d):.3f}"])
body=r"""Compute the canopy cover of spring barley on days 100, 120, 140, 150, 160, 175, 190, 205, 215 and 225.

\textbf{Solution.} $d_{\rm mid}=150$, $d_{\rm pk}=175$. Before the peak $c=1/(1+e^{-(d-150)/13})$: on day 120, $(120-150)/13=-2.308$, $e^{2.308}=10.05$, so $c=1/11.05=0.0905$; on day 150, $c=0.5$; on day 160, $e^{-0.769}=0.4634$ so $c=0.683$. At the peak $d=175$: $e^{-1.923}=0.1462$, $c=0.872$. After the peak the factor is $1-(d-175)/50$: on day 190 the logistic gives $0.9690\times$ hmm"""
# compute precisely
c190=1/(1+math.exp(-(190-150)/13)); body=body.split("on day 190")[0]
body+=f"on day 190 the logistic gives ${c190:.3f}$ and the factor is $1-15/50=0.70$, so $c={c190*0.7:.3f}$; on day 205, ${1/(1+math.exp(-55/13)):.3f}\\times0.40={eng2.canopy_spring(205):.3f}$; on day 225, the factor is $0$ and $c=0$. Table~\\ref{{tab:can}} lists all ten days."
body+=tab(["Day","Cover $c$"],rows,"Canopy cover of spring barley.","tab:can")
body+=r"""\textbf{Reading.} The curve is engineered to reproduce the shape of a canopy, not a measured leaf-area record; the cover mean over the year, $\bar C=\frac1{365}\sum c(d)="""+f"{sum(eng2.canopy_spring(d) for d in range(365))/365:.3f}"+r"$ is the divisor that spreads the annual transpiration over the days."
w(ex("canopy cover through the season",body))
# rain
w(r"""\section{Rainfall generator}
Rain falls on a day with probability 0.28; the wet-day depth is exponential and capped,
\begin{equation}R=\min\{70,\ \mu_0\gamma_y(-\ln U)\},\ U\sim\mathrm{Uniform}(0,1),\quad \mu_0=\frac{P}{0.28\times365}.\end{equation}
The canopy and litter catch the first $I_c=\mu_0\ln(1/r)$ mm of every shower, with $r=\max\{40,P-P_{\rm other}\}/P$, and only throughfall $T_f=\max\{0,R-I_c\}>0.3$ mm enters the soil.
""")
body=r"""For an annual rain $P=600$ mm, find $\mu_0$, the expected number of wet days, the probability that a wet day exceeds the cap, and the interception $I_c$ if $P_{\rm other}=60$ mm.

\textbf{Solution.} $\mu_0=600/(0.28\times365)=5.871$ mm. Expected wet days: $0.28\times365=102.2$. The exponential tail gives $P(R>70)=\exp(-70/5.871)=\exp(-11.92)=6.7\times10^{-6}$ (with $\gamma_y=1$), so the cap hardly binds in a year with 102 wet days (the chance that it binds at least once is $102\times6.7\times10^{-6}=7\times10^{-4}$). Next, $r=\max\{40,600-60\}/600=540/600=0.9$ and $I_c=5.871\ln(1/0.9)=0.619$ mm.

\textbf{Check.} The expected interception per wet day is $\mu_0(1-r)=5.871\times0.1=0.587$ mm, so the yearly total is $102.2\times0.587=60.0$ mm, which equals $P_{\rm other}$. The choice of $I_c$ makes the daily generator reproduce the annual interception of Engine 1."""
w(ex("rainfall generator constants",body))
body=r"""The dryness factor is $\gamma_y=\mathrm{clip}\bigl((m_{\rm med}/m_y)^{0.3};0.65,1.45\bigr)$ with $m_y=10^{\overline{\log_{10}h}}$ the geometric-mean suction of the growing season. If the median season has $m_{\rm med}=300$ cm and year $y$ has $m_y=900$ cm, find $\gamma_y$ and the mean wet-day depth of that year; do the same for $m_y=60$ cm.

\textbf{Solution.} Dry year: $(300/900)^{0.3}=0.3333^{0.3}=e^{0.3\ln0.3333}=e^{-0.3296}=0.719$; the clip does not bind, so $\gamma_y=0.719$ and the mean wet-day depth is $5.871\times0.719=4.22$ mm. Wet year: $(300/60)^{0.3}=5^{0.3}=e^{0.4828}=1.621$, clipped to $1.45$, so the mean depth is $5.871\times1.45=8.51$ mm. A drier record (higher suction) gives drier generated years, and the clip stops the factor from exceeding $0.65$ to $1.45$."""
w(ex("the year factor",body))

# redistribution
w(r"""\section{Infiltration, redistribution and drainage}
Water enters the top layer and cascades: any layer above $W_{\max}$ passes the excess down; the excess leaving layer 40 is drainage. Between layers a slow redistribution moves water toward the drier neighbour, $q_i=0.08(w_{i+1}-w_i)$, $w_i\leftarrow w_i+q_i$, $w_{i+1}\leftarrow w_{i+1}-q_i$.
""")
body=r"""The loam ($W_{\max}=4.25$ mm) has all layers at $3.06$ mm. A throughfall of $10.0$ mm arrives. Find the water in layers 1 to 4 after the cascade, then after one redistribution pass over the pair (1,2).

\textbf{Solution.} Layer 1: $3.06+10.00=13.06$ mm, an excess of $13.06-4.25=8.81$ mm, so $w_1=4.25$ and $8.81$ mm moves down. Layer 2: $3.06+8.81=11.87$, excess $7.62$, $w_2=4.25$. Layer 3: $3.06+7.62=10.68$, excess $6.43$, $w_3=4.25$. Layer 4: $3.06+6.43=9.49$, excess $5.24$, $w_4=4.25$. The front continues until the excess is used up: each layer absorbs $4.25-3.06=1.19$ mm, so $10.00/1.19=8.4$ layers are filled, that is the wetting front reaches $8.4\times2.5=21$ cm. No drainage occurs at 100 cm.

\textbf{Redistribution.} Within the filled layers $w_i=w_{i+1}$ so $q=0$. At the front, layers 8 and 9 have $w_8=4.25$ and $w_9=3.06+0.4\times1.19=3.54$: $q_8=0.08(3.54-4.25)=-0.057$ mm, so $0.057$ mm moves from layer 8 to layer 9 (downward), smoothing the front by 0.057 mm per day per layer pair."""
w(ex("a 10 mm shower in the loam",body))

# roots
w(r"""\section{Roots}
The rooting depth chases water while the canopy grows,
\begin{equation}R_d\leftarrow\max\Bigl\{R_d,\ \min\Bigl\{R_{\max}\,\mathrm{clip}\bigl(\tfrac{c-0.04}{0.96};0,1\bigr)^{0.8},\ R_{\max},\ R_d+1.7(0.35+\bar s_{\rm wet})\kappa\Bigr\}\Bigr\},\end{equation}
and the root density is
\begin{equation}\rho_i\propto\exp\Bigl(-\frac{z_i}{\lambda R_d+8}\Bigr)(0.45+0.9s_i)\Bigl[1+3e^{-((z_i-z_d)/12)^2}\Bigr]_{\rm drip\ only},\quad z_i\le R_d,\ \sum\rho_i=1,\end{equation}
with $\lambda=0.32$ for cereal.
""")
# one day root depth example
c=0.5;Rmax=92.15
t1=Rmax*max(0,min(1,(c-0.04)/0.96))**0.8;t3=20+1.7*(0.35+0.6)*1.0
body=f"""On day 150 ($c=0.5$) the root depth is $R_d=20$ cm, $R_{{\\max}}=92.15$ cm, the mean relative content under the front is $\\bar s_{{\\rm wet}}=0.60$ and the topsoil is wet ($\\kappa=1$). Find the new $R_d$.

\\textbf{{Solution.}} Three candidates: (a) the cover limit $92.15\\,\\mathrm{{clip}}((0.5-0.04)/0.96)^{{0.8}}=92.15\\times0.4792^{{0.8}}=92.15\\times0.5549={t1:.1f}$ cm; (b) $R_{{\\max}}=92.15$ cm; (c) the growth rate $20+1.7(0.35+0.60)(1)=20+1.615={t3:.2f}$ cm. The minimum is {min(t1,92.15,t3):.2f} cm, and the maximum with the old value $20$ is {max(20,min(t1,92.15,t3)):.2f} cm. The root front therefore advances by 1.6 cm per day while the canopy supports a deeper root: at this rate it needs about $(92-20)/1.6=45$ days to reach full depth."""
w(ex("rooting depth advance",body))
z=np.array([1.25,3.75,6.25,8.75,11.25,13.75]);Rd=15;s=np.array([.5,.55,.6,.65,.7,.7])
rho=np.exp(-z/(0.32*Rd+8))*(0.45+0.9*s);rho/=rho.sum()
rows=[[f"{zz:.2f}",f"{ss:.2f}",f"{np.exp(-zz/(0.32*Rd+8)):.4f}",f"{0.45+0.9*ss:.3f}",f"{r:.4f}"] for zz,ss,r in zip(z,s,rho)]
body=r"""With $R_d=15$ cm and the six layers of 0 to 15 cm having relative contents $s=0.50,0.55,0.60,0.65,0.70,0.70$ (no drip), compute the root densities.

\textbf{Solution.} $\lambda R_d+8=0.32(15)+8=12.8$ cm. Layer centres $z_i=1.25,3.75,\dots,13.75$ cm. The product $\exp(-z/12.8)(0.45+0.9s)$ is evaluated in Table~\ref{tab:rho} and normalised to sum to 1 (the total before normalisation is $"""+f"{(np.exp(-z/(0.32*Rd+8))*(0.45+0.9*s)).sum():.4f}"+r"""$). Root density decreases with depth by the exponential and increases with wetness by the second factor; here the wetter lower layers compensate only part of the exponential decline."""
body+=tab(["$z_i$ (cm)","$s_i$","$e^{-z/12.8}$","$0.45+0.9s$","$\\rho_i$"],rows,"Root density of the first six layers.","tab:rho")
w(ex("root density by layer",body))

# E and T
w(r"""\section{Evaporation and transpiration}
Daily soil evaporation spreads the annual $E_{\rm yr}$ with a sinusoidal weight reduced by canopy shade,
\begin{equation}E_d=E_{\rm yr}\frac{w({\rm doy})}{\sum_{k=0}^{364}w(k)}(1-0.3c),\quad w({\rm doy})=0.35+0.65\cdot\tfrac12\Bigl[1+\sin\tfrac{2\pi({\rm doy}-100)}{364}\Bigr],\end{equation}
drawn from the top four layers with weights $(0.55,0.25,0.12,0.08)$, never below $0.05W_{\max}$. Transpiration demand is $T_d=k_tT_{\rm yr}c(d)/(\bar C\cdot365)$ divided among layers by $q_i^T=T_d\rho_ia_i/\sum_j\rho_ja_j$ with $a_i=\mathrm{clip}\bigl((s_i-0.15)/0.6;0,1\bigr)$.
""")
wts=np.array([0.35+0.65*0.5*(1+math.sin(2*math.pi*(k-100)/364)) for k in range(365)])
d=180;Ed=170*wts[d]/wts.sum()*(1-0.3*0.8)
body=f"""With $E_{{\\rm yr}}=170$ mm, find the evaporation on day {d+1} (doy index {d}), when the canopy cover is $c=0.8$, and how it is drawn from the layers.

\\textbf{{Solution.}} The seasonal weight is $w({d})=0.35+0.65\\times0.5[1+\\sin(2\\pi\\,80/364)]=0.35+0.325[1+{math.sin(2*math.pi*80/364):.4f}]={wts[d]:.4f}$. The sum of the weights over the year is $\\sum w={wts.sum():.2f}$ (mean {wts.mean():.3f}). Hence $E_d=170\\times{wts[d]:.4f}/{wts.sum():.2f}\\times(1-0.24)={Ed:.3f}$ mm. It is taken from layers 1 to 4 as $0.55,0.25,0.12,0.08$ times this: ${0.55*Ed:.3f},{0.25*Ed:.3f},{0.12*Ed:.3f},{0.08*Ed:.3f}$ mm, provided that each layer stays above $0.05W_{{\\max}}=0.21$ mm. Without a canopy ($c=0$) the same day would lose ${170*wts[d]/wts.sum():.3f}$ mm, 30 per cent more than {Ed:.3f}: shade reduces evaporation."""
w(ex("evaporation of one day",body))
Td=230*0.8/(0.138*365)
body=f"""With $T_{{\\rm yr}}=230$ mm, $\\bar C=0.138$ and $k_t=1$, find $T_d$ on a day with $c=0.8$ and distribute it among three layers with $\\rho=(0.5,0.3,0.2)$ and $s=(0.8,0.5,0.2)$.

\\textbf{{Solution.}} $T_d=230\\times0.8/(0.138\\times365)=184/50.37={Td:.3f}$ mm. Availability $a_i=\\mathrm{{clip}}((s_i-0.15)/0.6)$: $(0.8-0.15)/0.6=1.083\\to1$; $(0.5-0.15)/0.6=0.583$; $(0.2-0.15)/0.6=0.083$. The weights $\\rho_ia_i=0.5,\\ 0.175,\\ 0.0167$ sum to $0.6917$. The shares are $0.723,\\ 0.253,\\ 0.024$, so the uptake is ${Td*0.5/0.6917:.3f},\\ {Td*0.175/0.6917:.3f},\\ {Td*0.01667/0.6917:.3f}$ mm. The wettest layer supplies 72 per cent although it holds only half of the roots, and the dry third layer is almost shut off: this is the linear stress function between 15 and 75 per cent of plant-available water."""
w(ex("transpiration demand and its division",body))

# irrigation rule + whole season
r=eng2.run('S06')
w(r"""\section{The irrigation rule and a season run}
An irrigation of dose $d$ is applied on a day if the canopy cover exceeds 0.2, $95\le\mathrm{doy}\le250$, the spacing and budget rules hold, the sensor layer is dry enough ($1-s_j\ge f_T$) and $f_T<0.995$. The dose is $d=\mathrm{clip}(\bar I/10;15,35)$ mm.
""")
body=f"""For $\\bar I=150$ mm yr$^{{-1}}$ find the dose; then run the daily model for one season of spring barley on the loam with $P=600$ mm, $E_{{\\rm yr}}=170$, $T_{{\\rm yr}}=230$, trigger $-300$ cm, sensor at 20 cm, $k_t=1$ and a fixed random seed. (Simplifications of this worked run: $\\bar s_{{\\rm wet}}=0.6$ and $\\kappa=1$ in the root advance; no spacing rule.)

\\textbf{{Solution.}} Dose: $150/10=15$ mm, which is at the lower clip, so $d=15$ mm. (The run below used the limit rule $\\mathrm{{clip}}(15;15,35)$.) The run gives: rain $P={r['P']:.0f}$ mm, irrigation ${r['I']:.0f}$ mm in {len(r['irr_days'])} events on days {', '.join(map(str,r['irr_days']))}, soil evaporation ${r['E']:.0f}$ mm, transpiration ${r['T']:.0f}$ mm, drainage ${r['D']:.0f}$ mm, and final rooting depth ${r['Rd']:.0f}$ cm. Storage change: the profile started at $0.72W_{{\\max}}=3.06$ mm per layer, 122.4 mm in all.

\\textbf{{Balance check.}} $P+I-E-T-D=\\Delta S$: ${r['P']:.0f}+{r['I']:.0f}-{r['E']:.0f}-{r['T']:.0f}-{r['D']:.0f}={r['P']+r['I']-r['E']-r['T']-r['D']:.0f}$ mm; the throughfall is smaller than $P$ by the interception $P-\\sum T_f$, so the storage change equals this minus the interception of {r['P']-sum(l[3] for l in r['log']):.0f} mm. In words: the engine conserves mass because every flux is taken from, or given to, the layers.\\par
The first irrigation occurs on day {r['irr_days'][0]}, when the sensor layer first reaches $1-s_8\\ge0.468$; before that the crop lived on rain and storage."""
w(ex("one season of the loam",body))
# sand vs loam
r2=eng2.run('S03')
body=f"""Repeat the season run for the sand S03 (AWC 0.6 mm cm$^{{-1}}$, trigger depletion $f_T=0.842$ at 300 cm) with the same weather seed.

\\textbf{{Solution.}} $W_{{\\max}}=0.6\\times2.5=1.5$ mm per layer. Irrigation ${r2['I']:.0f}$ mm in {len(r2['irr_days'])} events (days {', '.join(map(str,r2['irr_days']))}), drainage ${r2['D']:.0f}$ mm, transpiration ${r2['T']:.0f}$ mm, evaporation ${r2['E']:.0f}$ mm. Compared with the loam (drainage ${r['D']:.0f}$ mm) the sand drains ${r2['D']-r['D']:.0f}$ mm more: the layers hold only 1.5 mm each, so most of every shower and irrigation passes below 1 m. With the same dose of 15 mm the sand wastes a larger share, which is the mechanism behind the fate of saved water in Chapter~\\ref{{ch:fate}}.

\\textbf{{Reading.}} The daily model is a tipping-bucket engine; the application scales drainage and the wetting front to Engine~1 (Equation below) because they are not Richards solutions."""
w(ex("the same season in the sand",body))
# scaling
w(r"""\section{Scaling to the annual model}
The daily results are multiplied by constants so that their 20-year means equal Engine 1:
\begin{equation}S_P=\frac P{P_{\rm sim}},\ S_{\rm thr}=\frac{P-P_{\rm other}}{T_{f,\rm sim}},\ S_E=\frac E{E_{\rm sim}},\ S_T=\frac T{T_{\rm sim}},\ S_D=\frac D{D_{\rm sim}},\end{equation}
and the displayed fluxes are $R=P_dS_P$, $T_f=\min\{R,T_{f,d}S_{\rm thr}\}$, $E=E_dS_E$, $T=T_dS_T$, $D=D_dS_D$, with $\Delta S_d=T_f+I-E-T-D$.
""")
body=f"""Engine 1 gives $P=600$, $P_{{\\rm other}}=60$, $E=170$, $T=230$, $D=70$ mm. The daily run of the loam above gave $P_{{\\rm sim}}={r['P']:.1f}$, $T_{{f,\\rm sim}}={sum(l[3] for l in r['log']):.1f}$, $E_{{\\rm sim}}={r['E']:.1f}$, $T_{{\\rm sim}}={r['T']:.1f}$, $D_{{\\rm sim}}={r['D']:.1f}$ mm. Find the scale factors and the displayed drainage of a day on which the model drained $12$ mm.

\\textbf{{Solution.}} $S_P=600/{r['P']:.1f}={600/r['P']:.4f}$; $S_{{\\rm thr}}=540/{sum(l[3] for l in r['log']):.1f}={540/sum(l[3] for l in r['log']):.4f}$; $S_E=170/{r['E']:.1f}={170/r['E']:.4f}$; $S_T=230/{r['T']:.1f}={230/r['T']:.4f}$; $S_D=70/{r['D']:.1f}={70/r['D']:.4f}$. A day with a drainage of 12 mm is shown as $12\\times{70/r['D']:.4f}={12*70/r['D']:.2f}$ mm. The scale factors are close to 1 when the daily engine is already consistent with the annual one; a factor far from 1 (here $S_D={70/r['D']:.2f}$) flags a bucket model that drains too much compared with the Richards-based Daisy result, which is the reason for the scaling."""
w(ex("scale factors",body))
body=r"""Under warming the bare-soil demand is $E_{0,\rm bare}=4.2(1+0.07\Delta T)\cdot\frac{0.35+0.65\cdot\frac12[1+\sin(2\pi(\mathrm{doy}-100)/365)]}{0.675}\,\mathrm{clip}(1-0.12(\rho-1);0.85,1.12)\sqrt{\gamma_y}$ mm d$^{-1}$. Find the demand on day 190 with $\Delta T=2$ K, rain scale $\rho=1$, $\gamma_y=1$."""
dd=190;val=4.2*(1+0.07*2)*(0.35+0.65*0.5*(1+math.sin(2*math.pi*(dd-100)/365)))/0.675
body+=f"\n\n\\textbf{{Solution.}} $4.2\\times1.14=4.788$; the seasonal weight is $0.35+0.325[1+\\sin(2\\pi\\,90/365)]=0.35+0.325(1+{math.sin(2*math.pi*90/365):.4f})={0.35+0.325*(1+math.sin(2*math.pi*90/365)):.4f}$, divided by $0.675$ gives ${(0.35+0.325*(1+math.sin(2*math.pi*90/365)))/0.675:.4f}$; the cloud factor is $\\mathrm{{clip}}(1,0.85,1.12)=1$ and $\\sqrt{{\\gamma_y}}=1$. So $E_{{0,\\rm bare}}={val:.2f}$ mm d$^{{-1}}$, which is {100*(val/(val/1.14)-1):.0f} per cent above the unwarmed value {val/1.14:.2f} mm d$^{{-1}}$ (a 7 per cent per kelvin increase, close to the Clausius--Clapeyron rate)."
w(ex("evaporation demand under warming",body))
open('/tmp/book/p2b.tex','w').write("\n".join(O))
