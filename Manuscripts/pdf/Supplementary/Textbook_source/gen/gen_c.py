import sys,math,csv
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import eng2, numpy as np, pandas as pd
O=[];w=O.append
R='../../../../results/'
# ================= Chapter control
w(r"""\chapter{Irrigation control layers: sensor, trigger and trigger law}\label{ch:ctrl}
\markboth{Irrigation control}{Irrigation control}
\textbf{After this chapter you can} count the days beyond a trigger, apply the delta method that moves a stored suction record to another soil, express any trigger as a depletion, compute how fast a soil dries, and decide between the depletion triggers $f=0.50$ and $f=0.45$.

\section{Sensor and trigger}
A simulated tensiometer records the suction $h$ at the sensor depth every day. For year $y$ the layer counts the growing-season days (183 from 1 April) beyond the trigger $h_T$:
\begin{equation}N_y(h_T)=\#\{d\in\text{season}_y:h_d>h_T\},\qquad X=100\Bigl(1-\frac{\bar N_{\rm irr}}{\bar N_{\rm rainfed}}\Bigr),\ \bar N=\frac1{20}\sum_yN_y.\end{equation}
""")
body=r"""The layer prints: ``Irrigated: 85 of 183 days beyond 300 cm. Rainfed: 168 of 183 days beyond. Irrigation removes 39 \%.'' The 39 per cent is a 20-year mean while 85 and 168 are for the year drawn. (a) Verify the arithmetic for the year drawn. (b) If the rainfed 20-year mean is $\bar N_{\rm rainfed}=168$, what is the irrigated mean?

\textbf{Solution.} (a) For the year drawn, $X=100(1-85/168)=49.4$ per cent, which differs from the printed 39 per cent because $X$ uses the 20-year means, not one year. (b) $39=100(1-\bar N_{\rm irr}/168)$ gives $\bar N_{\rm irr}=168\times0.61=102.5$ days. So in an average year the irrigated sensor is beyond the trigger on 102 of 183 days against 168 rainfed. The year drawn is wetter than average for the irrigated trace by $102.5-85=17.5$ days.

\textbf{Reading.} A trigger of $-300$ cm does not mean ``never beyond 300 cm'': irrigation starts \emph{after} the sensor crosses the trigger, the dose is applied once per event, and the suction rises again between events."""
w(ex("days beyond the trigger",body))
# delta method
nm,a,n,*_=SOIL['S06']
dif=[0.02,0.03,0.05,0.06,0.04,0.03,0.02]
fref=0.30
fn=fref+sum(dif)/7
hn=hof(a,n,fn)
body=r"""When the settings differ from the stored ones, the record is moved by the delta method
\begin{equation}h^{\rm x}_d=h_{\rm soil}\Bigl(f_{\rm ref}(h^{\rm rec}_d)+\frac17\sum_{q=-3}^{3}\bigl[f^{\rm set}_{d+q}-f^{\rm std}_{d+q}\bigr]\Bigr).\end{equation}
Suppose on day $d$ the stored record has $h^{\rm rec}=100$ cm in the reference soil (Coarse loam, depletion $f_{\rm ref}=f(100)$ in that soil) and the target soil is the loam S06. The seven-day differences $f^{\rm set}-f^{\rm std}$ of the sensor layer (the daily model run at your settings minus at standard settings) are $0.02,0.03,0.05,0.06,0.04,0.03,0.02$. Compute the moved suction. (Assume that the stored record is at $f_{\rm ref}=0.30$.)

\textbf{Solution.} The mean difference is $(0.02+0.03+0.05+0.06+0.04+0.03+0.02)/7=0.25/7=0.0357$. The new depletion is $0.30+0.0357=0.3357$. Convert it to a suction in the loam by inverting Equation~(\ref{eq:fdep}) by bisection: """+f"$h^{{\\rm x}}={hn:.0f}$ cm."+f" The same depletion $0.30$ would be $h={hof(a,n,.30):.0f}$ cm in the loam. The settings therefore raise the suction at the sensor from {hof(a,n,.30):.0f} to {hn:.0f} cm, an increase of {100*(hn/hof(a,n,.30)-1):.0f} per cent for a depletion change of 0.036. Because suction is steep in depletion, a small change in depletion is a large change in suction."
w(ex("the delta method",body))
# trigger law
w(r"""\section{Trigger law}
The suction at which a soil reaches a chosen depletion is $h(f)=\{h:f(h)=f\}$ (Equation~\ref{eq:fdep} inverted), the net irrigation per event is $Z_n=f\cdot\mathrm{AWC}\cdot R_{\max}$, and the relative yield at a trigger is
\begin{equation}Y_{\rm rel}(h_T)=\frac{Y(h_T)}{\max_hY(h)}\quad(\text{data-driven, run set E2}).\end{equation}
""")
d=pd.read_csv(R+'p4_fig3_trigger_runs.csv')
rows=[]
for sid in ['S06','S03','S10']:
    nm,a,n,*_=SOIL[sid]
    x=d[d.soil.str.startswith(sid)].sort_values('trigger_cm')
    ymax=x.yield_Mg_ha.max()
    for _,r in x[x.trigger_cm.isin([50,100,200,300,500,1000,3000])].iterrows():
        rows.append([sid,int(r.trigger_cm),f"{fdep(a,n,r.trigger_cm):.3f}",f"{r.irrigation_mm:.0f}",f"{r.yield_Mg_ha:.2f}",f"{r.yield_Mg_ha/ymax:.3f}"])
body=r"""Use the archived E2 trigger runs to compute, for three soils, the depletion at each trigger and the relative yield, and find the largest trigger with $Y_{\rm rel}\ge0.95$.

\textbf{Solution.} For each soil take $Y_{\max}$ as the largest yield over its triggers, and evaluate $f(h_T)$ with Equation~(\ref{eq:fdep}). Table~\ref{tab:yrel} lists the result."""
body+=tab(["Soil","Trigger (cm)","$f$","Irrigation (mm)","Yield (Mg/ha)","$Y_{\\rm rel}$"],rows,"Archived trigger runs (E2): depletion at the trigger, irrigation, yield and relative yield.","tab:yrel")
# find 0.95 thresholds
msg=""
for sid in ['S06','S03','S10']:
    nm,a,n,*_=SOIL[sid]
    x=d[d.soil.str.startswith(sid)].sort_values('trigger_cm');ymax=x.yield_Mg_ha.max()
    ok=x[x.yield_Mg_ha/ymax>=0.95]
    t=ok.trigger_cm.max()
    msg+=f"{nm}: the largest trigger with $Y_{{\\rm rel}}\\ge0.95$ is {t:.0f} cm, $f={fdep(a,n,t):.2f}$. "
body+="\n"+msg+r"""

\textbf{Reading.} In suction the thresholds differ by a large factor between soils; in depletion they cluster near $f^*\approx0.45$ (the study's soil-independent value; 5 per cent yield loss), which is the content of the trigger law. The statement is data-driven for one crop, one weather series and a sensor at 20 cm."""
w(ex("relative yield against trigger depletion",body))
# drying time
rows=[];ETc=3.5;zr=90.0
for sid in IDS:
    nm,a,n,awc,*_=SOIL[sid]
    f=0.45;TAW=awc*zr*10/10  # mm per cm * cm
    rs=ETc/TAW;t=f/rs
    rows.append([sid,nm,f"{awc}",f"{TAW:.0f}",f"{100*rs:.1f}",f"{t:.1f}"])
body=r"""Every soil is compared on the same crop demand $ET_c$; only the water held differs:
\begin{equation}r_s=\frac{ET_c}{\mathrm{TAW}_s},\quad\mathrm{TAW}_s=\mathrm{AWC}_sz_r,\quad t_{{\rm trig},s}=\frac{f_{{\rm trig},s}}{r_s}.\end{equation}
Take $ET_c=3.5$ mm d$^{-1}$ (assumed peak-season value), $z_r=90$ cm and $f_{\rm trig}=0.45$. Compute $r_s$ in per cent per day and the days to the trigger for the ten soils.

\textbf{Solution.} For the sand, $\mathrm{TAW}=0.6\times90=54$ mm, $r=3.5/54=0.0648$, that is $6.5$ per cent per day, and $t=0.45/0.0648=6.9$ days. For the coarse loam, $\mathrm{TAW}=1.5\times90=135$ mm, $r=2.6$ per cent per day and $t=17.4$ days. These agree with the application text (about 7 days for sand and 18 days for coarse loam). Table~\ref{tab:dry} gives all ten soils."""
body+=tab(["ID","Soil","AWC","TAW (mm)","$100r_s$ (\\%/d)","Days to trigger"],rows,"Speed of depletion and days from field capacity to the trigger $f=0.45$ (assumed $ET_c=3.5$ mm d$^{-1}$, $z_r=90$ cm).","tab:dry")
body+=r"""\textbf{Reading.} The coarse sand dries fastest (smallest AWC, 0.5 mm cm$^{-1}$) and the silt loam slowest (AWC 2.0): a four-fold spread in the interval between irrigations, from 5.8 to 23 days. A sprinkler round that takes three days is long compared with the 5.8 days of the coarse sand but short compared with the 23 days of the silt loam, which is why the f=0.45 advice for coarse soils exists."""
w(ex("how fast each soil dries",body))
# decision
body=r"""The application advises $f=0.45$ if any of the following holds: a round of the design takes more than 2 days; the soil is sandy (sand $\ge60$ per cent or AWC $\le0.9$ mm cm$^{-1}$); the crop is at $\ge85$ per cent cover (critical stage). Otherwise $f=0.50$. Decide for three cases.

\textbf{Case A:} maize on the loam (sand 40 per cent, AWC 1.7), drip system, round 1.5 days, date with cover 60 per cent. No $f=0.45$ condition holds (round $\le2$ d, sand $<60$, AWC $>0.9$, cover $<85$ per cent), so the advice is $f=0.50$. In suction, $f=0.50$ in the loam is $h="""+f"{hof(SOIL['S06'][1],SOIL['S06'][2],.5):.0f}"+r"""$ cm.

\textbf{Case B:} same field but a sprinkler round of 3.5 days. The round exceeds 2 days, so the advice is $f=0.45$ ($h="""+f"{hof(SOIL['S06'][1],SOIL['S06'][2],.45):.0f}"+r"""$ cm): the field must be triggered earlier because the last block is irrigated 3.5 days after the first, and during that time depletion advances by $3.5\times r_s$. With $r_s=3.5/153=2.3$ per cent per day (loam, $\mathrm{TAW}=1.7\times90=153$ mm) the last block gains $0.08$ in depletion, so starting at $0.45$ the last block reaches $0.53$, just above $0.50$.

\textbf{Case C:} sand (92 per cent sand), drip, round 1 day. The soil is sandy, so $f=0.45$ ($h=143$ cm)."""
w(ex("choosing between f = 0.50 and f = 0.45",body))
body=r"""The Dashboard tile ``Sensor / trigger'' reads $0.02/0.38$ for the coarse loam on a date. Interpret it and find the suction of the sensor and the days to irrigation at $r=2.6$ per cent per day.

\textbf{Solution.} The first number is the present depletion of the sensor layer ($f=0.02$, almost field capacity); the second is the trigger depletion $f_T=f(300\text{ cm})=0.38$ of the coarse loam. Irrigation is due when the first reaches the second. The sensor suction is $h(0.02)="""+f"{hof(SOIL['S01'][1],SOIL['S01'][2],0.02):.0f}"+r""" cm$, close to the field capacity of 100 cm. At $r=0.026$ d$^{-1}$ the soil needs $(0.38-0.02)/0.026=13.8$ days without rain to reach the trigger."""
w(ex("reading the sensor tile",body))
open('/tmp/book/p2c.tex','w').write("\n".join(O))
