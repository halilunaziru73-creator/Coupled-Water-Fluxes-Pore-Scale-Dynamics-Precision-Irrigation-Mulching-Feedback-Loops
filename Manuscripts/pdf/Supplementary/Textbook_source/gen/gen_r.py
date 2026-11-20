import sys,math
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from math import erfc,exp,log,sqrt
from lib import *
from rich import *
import eng2
O=[];w=O.append
def T(_s,**kw):
    for k,v in kw.items(): _s=_s.replace('@'+k+'@',str(v))
    return _s
p=vg_params('S06')
w(r"""\chapter{The Daisy workbench: governing equations worked}\label{ch:daisy}
\markboth{Daisy equations}{Daisy equations}
\textbf{After this chapter you can} evaluate the van Genuchten--Mualem functions, solve the Richards equation for a soil column by an implicit finite-volume scheme with Picard iteration and check its mass balance, distribute root uptake, partition the evaporative demand, compute the damping of the soil temperature wave, move and retard a solute, decay organic matter with limiting factors and compute mineralisation, nitrification and denitrification, run a simple crop assimilation chain, and calibrate a retention curve by three optimisers.

The Daisy workbench runs the Daisy 7.1.14 model and draws its results. Where the workbench computes by itself (the tabs Soil column, Process curves and Calibration) the forms below are the ones it uses; where Daisy computes (Scenarios and Experiments) they are the standard forms of the Daisy reference manual. This chapter works the forms with explicit numbers; it does not re-run Daisy, so no number here is a Daisy output. The soil is the loam of the ensemble with illustrative van Genuchten parameters: $\alpha=0.036$ cm$^{-1}$, $n=1.56$, $\theta_s=%s$ (Saxton and Rawls), $\theta_r=0.02$, $K_s=%s$ cm d$^{-1}$, $l=0.5$.
"""%(fx(p['ths'],3),fx(p['Ks'],1)))
w(r"\section{Retention and conductivity}"+"\n"+r"""With $m=1-1/n$,
\begin{equation}S_e=[1+(\alpha|h|)^n]^{-m},\quad\theta(h)=\theta_r+(\theta_s-\theta_r)S_e,\quad K(h)=K_sS_e^{\,l}\big[1-(1-S_e^{1/m})^m\big]^2.\end{equation}
Field capacity is read at $h=-100$ cm, the wilting point at $-15{,}000$ cm; the available water of a horizon is $\theta_{FC}-\theta_{WP}$.
""")
hs=[-10,-33,-100,-330,-1000,-5000,-15000]
rows=[[h,fx(float(theta(np.array(h*1.0),p)),4),fx(float(Kf(np.array(h*1.0),p)),5)] for h in hs]
w(tab(["$h$ (cm)","$\\theta$","$K$ (cm/d)"],rows,"Retention and conductivity of the loam.","tab:vg"))
m=1-1/p['n'];Se=(1+(p['a']*100)**p['n'])**(-m)
body=T(r"""Evaluate $\theta$ and $K$ at $h=-100$ cm and the available water.

\textbf{Solution.} $m=1-1/1.56=@m@$. $\alpha|h|=0.036\times100=3.6$; $3.6^{1.56}=@x@$; $S_e=(1+@x@)^{-@m@}=@Se@$. $\theta=0.02+(@ths@-0.02)\times@Se@=@th@$. $K=@Ks@\times@Se@^{0.5}\times[1-(1-@Se@^{1/@m@})^{@m@}]^2$: $@Se@^{1/@m@}=@S2@$; $(1-@S2@)^{@m@}=@S3@$; bracket $=@S4@$, squared $@S5@$; $K=@Ks@\times@S6@\times@S5@=@K@$ cm d$^{-1}$. At $-15{,}000$ cm, $\theta=@wp@$, so the available water is $@th@-@wp@=@awc@$ cm$^3$cm$^{-3}$ ($@awcmm@$ mm per 10 cm).""",m=fx(m,4),x=fx(3.6**p['n'],3),Se=fx(Se,4),ths=fx(p['ths'],3),th=fx(float(theta(np.array(-100.0),p)),4),Ks=fx(p['Ks'],2),S2=fx(Se**(1/m),4),S3=fx((1-Se**(1/m))**m,4),S4=fx(1-(1-Se**(1/m))**m,4),S5=fx((1-(1-Se**(1/m))**m)**2,5),S6=fx(Se**0.5,4),K=fx(float(Kf(np.array(-100.0),p)),4),wp=fx(float(theta(np.array(-15000.0),p)),4),awc=fx(float(theta(np.array(-100.0),p)-theta(np.array(-15000.0),p)),4),awcmm=fx(100*float(theta(np.array(-100.0),p)-theta(np.array(-15000.0),p)),1))
w(ex("one point of the curves",body))
# Richards
w(r"\section{The Richards equation and the soil-column solver}"+"\n"+r"""With $z$ downward the Darcy flux is $q=K(h)(1-\partial h/\partial z)$ and
\begin{equation}\frac{\partial\theta}{\partial t}=\frac{\partial}{\partial z}\Big[K(h)\Big(\frac{\partial h}{\partial z}-1\Big)\Big]-S(z,t).\end{equation}
The workbench solves it by an implicit finite-volume scheme with the mass-conserving modified Picard iteration of Celia et al.\ (1990): in each cell, with $k$ the iteration and $n$ the old time level,
\begin{equation}C(h^k)\frac{h^{k+1}-h^k}{\Delta t}+\frac{\theta(h^k)-\theta^n}{\Delta t}=\frac1{\Delta z}\Big[K_{i+1/2}\Big(\frac{h_{i+1}^{k+1}-h_i^{k+1}}{\Delta z}-1\Big)-K_{i-1/2}\Big(\frac{h_i^{k+1}-h_{i-1}^{k+1}}{\Delta z}-1\Big)\Big],\end{equation}
with $C=d\theta/dh$ and the interface conductivity the arithmetic mean of the two cells. The top boundary is a rain flux, the bottom a free drain ($q=K(h_N)$), a closed bottom or a groundwater table. The step is halved when the iteration does not converge. (The formula is exactly the one coded for this chapter, so its numbers can be reproduced.)
""")
rr=solve(p,flux=lambda t:3.0 if t<=1.0 else 0.0,tend=10,out_times=(1,3,10))
z=(np.arange(50)+0.5)*2
idxs=[2,7,15,25,40,49]
rows=[[fx(z[i],0)]+[fx(float(theta(rr['outs'][t][0],p)[i]),3) for t in (1,3,10)] for i in idxs]
w(tab(["depth (cm)","$\\theta$ day 1","day 3","day 10"],rows,"Water content of the loam column after a 30 mm rain in one day (initial $h=-300$ cm, $\\theta=%s$).".replace('%s',fx(float(theta(np.array(-300.0),p)),3)),"tab:richprof"))
Qin,Qout,dS=rr['Qin'],rr['Qout'],rr['dS']
body=T(r"""A 100 cm column (50 cells of 2 cm) starts at $h=-300$ cm everywhere, receives 3 cm of rain in the first day and then none, with a free-drain bottom. Check the mass balance over 10 days and read the wetting front.

\textbf{Solution.} Inflow $=3.000$ cm. Drainage out of the bottom $=@qo@$ cm. The storage rose from the initial content to the final content by $\Delta S=@ds@$ cm. Residual $=Q_{\rm in}-Q_{\rm out}-\Delta S=@res@$ cm, @rp@\% of the inflow: the scheme conserves mass to the tolerance of the iteration (0.001 cm of head). The run took @steps@ steps and @it@ Picard iterations. Table~\ref{tab:richprof} shows the front: at day 1 the top 10 cm hold the rain and the profile below is still at its initial $\theta=0.128$; the wetted layer then spreads downward under gravity and capillarity, so by day 10 the water content at 30 cm has risen from 0.128 to @t10@ and the surface has drained from @t1@ to @t10s@. Essentially no water has left the column (@qo@ cm out of 3 cm): the 30 mm event is stored within the top metre of this loam, as the field capacity argument predicts (the rain is smaller than the available-water deficit of the profile).""",qo=fx(Qout,4),ds=fx(dS,4),res=fx(Qin-Qout-dS,5),rp=fx(100*abs(Qin-Qout-dS)/Qin,4),steps=rr['steps'],it=rr['iters'],t10=fx(float(theta(rr['outs'][10][0],p)[15]),3),t1=fx(float(theta(rr['outs'][1][0],p)[2]),3),t10s=fx(float(theta(rr['outs'][10][0],p)[2]),3))
w(ex("an infiltration event in the soil column",body))
# a larger rain with drainage
rr2=solve(p,h0=-100.0,flux=lambda t:5.0 if t<=6.0 else 0.0,tend=15,out_times=(15,))
body=T(r"""Start the column at field capacity ($h=-100$ cm, $\theta=@th0@$) and apply 5 cm d$^{-1}$ for six days (30 cm in all, a wet spell; the flux stays below $K_s=@Ks@$ cm d$^{-1}$, so the top boundary can be a flux). Run 15 days. What leaves the bottom?

\textbf{Solution.} $Q_{\rm in}=@qi@$ cm. $Q_{\rm out}=@qo@$ cm drained below 1 m (@pc@\% of the rain), $\Delta S=@ds@$ cm stored, residual $@res@$ cm. At field capacity the profile can still take @cap@ cm before it is saturated, so the first part of the spell is stored, and from then on the rain drains. Compare the Engine~2 bucket (Chapter~\ref{ch:e2}), which passes the excess to the next layer within the day: the Richards solution releases the water gradually, which is the main difference the Daisy workbench is there to show.""",th0=fx(float(theta(np.array(-100.0),p)),3),Ks=fx(p['Ks'],1),qi=fx(rr2['Qin'],3),qo=fx(rr2['Qout'],3),ds=fx(rr2['dS'],3),res=fx(rr2['Qin']-rr2['Qout']-rr2['dS'],5),pc=fx(100*rr2['Qout']/rr2['Qin'],0),cap=fx(100*(p['ths']-float(theta(np.array(-100.0),p))),1))
w(ex("a wet spell on a profile at field capacity",body))
# Feddes
w(r"\section{Root uptake}"+"\n"+r"""The potential transpiration $E_p$ is spread over the roots in proportion to root density, $S_p(z)=E_p\,\rho(z)/\int\rho\,dz$, and reduced by a stress factor $\alpha_s(h)$ that is 1 in the comfortable range of the pressure head and falls to 0 near saturation and toward the wilting point: $S(z)=\alpha_s(h)S_p(z)$. For the worked example, $\alpha_s$ is the piecewise-linear Feddes function with breakpoints $h_1=-10$, $h_2=-25$, $h_3=-500$, $h_4=-15{,}000$ cm (illustrative values; the library gives the ones of each crop).
""")
def alf(h):
    if h>=-10 or h<=-15000: return 0.0
    if h>-25: return (-10-h)/(-10+25)
    if h>=-500: return 1.0
    return (h+15000)/(15000-500)
layers=[(0,20,-200,0.50),(20,50,-700,0.30),(50,100,-4000,0.20)]
Ep=5.0;S=[]
for a,b,h,fr in layers:
    S.append(Ep*fr*alf(h))
rows=[[f"{a}--{b}",fx(fr,2),h,fx(alf(h),3),fx(Ep*fr,2),fx(Ep*fr*alf(h),2)] for (a,b,h,fr) in layers]
w(tab(["layer (cm)","root fraction","$h$ (cm)","$\\alpha_s$","$S_p$ (mm/d)","$S$ (mm/d)"],rows,"Root uptake for $E_p=5$ mm d$^{-1}$.","tab:feddes"))
body=T(r"""Find the transpiration of Table~\ref{tab:feddes}.

\textbf{Solution.} The top layer is in the comfortable range ($-25>-200\ge-500$, so $\alpha_s=1$): $S=5\times0.50\times1=2.50$ mm d$^{-1}$. The second layer, $h=-700$, lies in the falling branch: $\alpha_s=(-700+15000)/(15000-500)=@a2@$, $S=1.5\times@a2@=@s2@$. The deep layer, $h=-4000$: $\alpha_s=@a3@$, $S=1.0\times@a3@=@s3@$. Total $T=@T@$ mm d$^{-1}$, that is @r@\% of $E_p$; the shortfall $@sh@$ mm d$^{-1}$ is the stress. The crop takes the water from where it is easiest: the wet top layer carries most of the uptake.""",a2=fx(alf(-700),3),s2=fx(S[1],2),a3=fx(alf(-4000),3),s3=fx(S[2],2),T=fx(sum(S),2),r=fx(100*sum(S)/Ep,1),sh=fx(Ep-sum(S),2))
w(ex("uptake from three layers",body))
# balance
r1=eng2.run('S06',300,P=600.,Eyr=170.,Tyr=230.,Ibar=150.,seed=1);L=r1['log']
Eo=sum(x[2]-x[3] for x in L);resid=r1['P']+r1['I']-Eo-r1['E']-r1['T']-r1['D']-(r1['S1']-r1['S0'])
w(r"\section{The water balance and the Mass balance tab}"+"\n"+r"""The tab checks $P+I=E_s+E_i+T+D+R+\Delta S$ on any log: rain, irrigation, soil evaporation, evaporation of intercepted water, transpiration, drainage, runoff and storage change. The residual should be small compared with the largest term.
""")
body=T(r"""Check the balance of the Engine~2 loam year (Chapter~\ref{ch:dash}): $P=@P@$, $I=@I@$, $E_i=@Ei@$ (interception), $E_s=@E@$, $T=@T@$, $D=@D@$, $R=0$, $\Delta S=@ds@$ mm.

\textbf{Solution.} Inputs $P+I=@in@$ mm. Outputs plus storage $=@Ei@+@E@+@T@+@D@+@ds@=@out@$ mm. Residual $=@res@$ mm, relative to the largest term (rain, @P@ mm) $@rel@\%$. A balance like this passes the test; a bucket model that loses water in rounding would show a residual of several mm.""",P=fx(r1['P'],1),I=fx(r1['I'],1),Ei=fx(Eo,1),E=fx(r1['E'],1),T=fx(r1['T'],1),D=fx(r1['D'],1),ds=fx(r1['S1']-r1['S0'],1),res=fx(resid,6),rel=fx(100*abs(resid)/r1['P'],6),**{'in':fx(r1['P']+r1['I'],1),'out':fx(Eo+r1['E']+r1['T']+r1['D']+r1['S1']-r1['S0'],1)})
w(ex("the mass balance test",body))
# demand partition
w(r"\section{Evaporative demand and the canopy}"+"\n"+r"""The reference rate is Penman--Monteith (Chapter~\ref{ch:weather}); the crop's potential rate is $ET_c=K_cET_0$. The canopy shares the demand with the light that reaches the soil, $\exp(-k\,\mathrm{LAI})$ (Beer--Lambert with extinction coefficient $k$): the soil evaporation is $E_p\,e^{-k\mathrm{LAI}}$ and the transpiration $E_p(1-e^{-k\mathrm{LAI}})$.
""")
rows=[[la,fx(exp(-0.5*la),3),fx(1-exp(-0.5*la),3),fx(5*exp(-0.5*la),2),fx(5*(1-exp(-0.5*la)),2)] for la in (0,0.5,1,2,3,4,5)]
w(tab(["LAI","$e^{-kLAI}$","share to $T$","$E$ (mm/d)","$T$ (mm/d)"],rows,"Partition of a demand of 5 mm d$^{-1}$, $k=0.5$.","tab:beer"))
body=T(r"""A cereal has LAI = 3 and $k=0.5$, $ET_0=6$ mm d$^{-1}$, $K_c=1.1$. Find $E$ and $T$.

\textbf{Solution.} $E_p=1.1\times6=6.6$ mm d$^{-1}$. $e^{-0.5\times3}=@e@$. $E=6.6\times@e@=@E@$ mm d$^{-1}$; $T=6.6\times(1-@e@)=@T@$ mm d$^{-1}$. The cover intercepts @c@\% of the light, so @c@\% of the demand is transpiration. At LAI = 0.5 (a young crop) the same demand is only @y@\% transpiration, which is why the early season loses water mostly by soil evaporation.""",e=fx(exp(-1.5),3),E=fx(6.6*exp(-1.5),2),T=fx(6.6*(1-exp(-1.5)),2),c=fx(100*(1-exp(-1.5)),0),y=fx(100*(1-exp(-0.25)),0))
w(ex("sharing the demand",body))
# heat
w(r"\section{Soil heat}"+"\n"+r"""Heat moves by conduction (and with the water flux): $C_h\,\partial T/\partial t=\partial(\lambda\,\partial T/\partial z)/\partial z-C_wq\,\partial T/\partial z+L_f\,\partial\theta_i/\partial t$. For a sinusoidal surface temperature of angular frequency $\omega$ and no flow, the solution is a wave that damps and lags with depth,
\begin{equation}T(z,t)=\bar T+A_0e^{-z/d_T}\sin(\omega t-z/d_T),\qquad d_T=\sqrt{2D/\omega},\quad D=\lambda/C_h.\end{equation}
""")
lam=1.2;Ch=2.2e6;Dh=lam/Ch
def dT(per): return math.sqrt(2*Dh/(2*math.pi/per))
rows=[]
for nm,per in (("daily",86400.0),("annual",365*86400.0)):
    d=dT(per);rows.append([nm,fx(d,3)]+[fx(100*exp(-z/d),1) for z in (0.1,0.5,1.0,2.0)]+[fx(0.5*per/ (2*math.pi)*(0.5/d)/3600/24,1) if False else fx((0.5/d)*per/(2*math.pi)/86400,1)])
w(tab(["wave","$d_T$ (m)","amp. at 0.1 m (\\%)","0.5 m","1 m","2 m","lag at 0.5 m (d)"],rows,"Damping of the temperature wave ($\\lambda=1.2$ W m$^{-1}$K$^{-1}$, $C_h=2.2$ MJ m$^{-3}$K$^{-1}$).","tab:heat"))
body=T(r"""The mean annual temperature is 12$^\circ$C with an annual amplitude of 10 K at the surface. Find the amplitude and the time of the maximum at 1 m.

\textbf{Solution.} $D=\lambda/C_h=1.2/(2.2\times10^6)=@D@$ m$^2$ s$^{-1}$. $\omega=2\pi/(365\times86400)=@om@$ s$^{-1}$. $d_T=\sqrt{2D/\omega}=@d@$ m. At $z=1$ m: amplitude $=10e^{-1/@d@}=@a@$ K, phase lag $z/d_T=@ph@$ rad $=@lag@$ days. So at 1 m the temperature varies by $12\pm@a@$ K and is about @lag@ days behind the surface maximum. For the daily wave $d_T=@dd@$ m: at 0.5 m the daily amplitude is only $@dd5@\%$ of the surface value, which is why the factors of biological rates at depth do not follow the weather.""",D=f"{Dh:.3e}",om=f"{2*math.pi/(365*86400):.3e}",d=fx(dT(365*86400.0),2),a=fx(10*exp(-1/dT(365*86400.0)),2),ph=fx(1/dT(365*86400.0),3),lag=fx((1/dT(365*86400.0))*365/(2*math.pi),0),dd=fx(dT(86400.0),3),dd5=fx(100*exp(-0.5/dT(86400.0)),2))
w(ex("damping with depth",body))
# solute
w(r"\section{Solute transport and sorption}"+"\n"+r"""A solute is carried by the water and spread by dispersion with sorption: $\partial(\theta c+\rho_bs)/\partial t=\partial(\theta D\,\partial c/\partial z)/\partial z-\partial(qc)/\partial z-\mu(\theta c+\rho_bs)-U$, with $s=K_dc$ (linear sorption), $D=\lambda_d|q|/\theta+D_m\tau$ and, for a pesticide, $K_d=K_{OC}f_{OC}$. Dividing by $\theta$ gives the retardation factor and the front velocity
\begin{equation}R=1+\frac{\rho_bK_d}{\theta},\qquad v=\frac q\theta,\qquad v_c=\frac vR.\end{equation}
""")
body=T(r"""Compare a mobile tracer with a pesticide: $K_{OC}=100$ L kg$^{-1}$, $f_{OC}=0.012$, $\rho_b=1.4$ kg L$^{-1}$, $\theta=0.30$, steady flux $q=0.5$ cm d$^{-1}$, half-life 40 d. Find $R$, the depth of the front after 60 d, and the fraction left.

\textbf{Solution.} $K_d=100\times0.012=1.2$ L kg$^{-1}$. $R=1+1.4\times1.2/0.30=@R@$. $v=0.5/0.30=@v@$ cm d$^{-1}$. After 60 d the tracer front is at $z=vt=@zt@$ cm; the pesticide front at $vt/R=@zp@$ cm. First-order decay: $\mu=\ln2/40=@mu@$ d$^{-1}$, fraction left $=e^{-\mu t}=@f@$ (@fp@\%). The pesticide is retarded by a factor @R@ and has decayed to @fp@\% before the front has moved even @zp@ cm: sorption plus decay is what protects the groundwater, while the tracer moves @zt@ cm.""",R=fx(1+1.4*1.2/0.3,2),v=fx(0.5/0.3,3),zt=fx(0.5/0.3*60,0),zp=fx(0.5/0.3*60/(1+1.4*1.2/0.3),1),mu=fx(math.log(2)/40,4),f=fx(math.exp(-math.log(2)/40*60),3),fp=fx(100*math.exp(-math.log(2)/40*60),1))
w(ex("retardation and decay",body))
# Ogata-Banks
def ob(z,t,v,D):
    return 0.5*(erfc((z-v*t)/(2*sqrt(D*t)))+exp(v*z/D)*erfc((z+v*t)/(2*sqrt(D*t))))
q=0.5;th=0.3;lamd=5.0;v_=q/th;Dd=lamd*v_  # cm2/d
Rr=1+1.4*1.2/0.3
rows=[[z,fx(ob(z,60,v_,Dd),3),fx(ob(z,60,v_/Rr,Dd/Rr),3)] for z in (10,20,30,40,50,60,80,100)]
w(r"""With a continuous source the analytic solution of the convection--dispersion equation without decay (Ogata and Banks) is
\begin{equation}\frac{c}{c_0}=\frac12\Big[\mathrm{erfc}\frac{z-vt}{2\sqrt{Dt}}+e^{vz/D}\mathrm{erfc}\frac{z+vt}{2\sqrt{Dt}}\Big],\end{equation}
with $v\to v/R$ and $D\to D/R$ for the sorbed solute.
""")
w(tab(["depth (cm)","$c/c_0$ tracer","$c/c_0$ pesticide (no decay)"],rows,"Concentration after 60 d ($\\lambda_d=5$ cm, $D=\\lambda_dv$).","tab:ob"))
w(T(r"""\begin{example}{reading the breakthrough profile}
Table~\ref{tab:ob} shows the tracer front where $c/c_0=0.5$ near $z=vt=@zt@$ cm (the profile is symmetric about it, widened by the dispersion $\sqrt{2Dt}=@sg@$ cm), and the pesticide profile confined to the top @zp@ cm, to which the numbers $0.5$ at $z\approx vt/R$ correspond. Neglecting dispersion would give a sharp step; the spread is what makes a small fraction of the pesticide reach deeper than the front, which matters for the drinking-water criterion.
\end{example}
""",zt=fx(v_*60,0),sg=fx(sqrt(2*Dd*60),1),zp=fx(v_*60/Rr,0)))
# SOM
w(r"\section{Organic matter, mineralisation and nitrification}"+"\n"+r"""Each pool decays by first-order kinetics modified by temperature and moisture, with part of the decayed carbon built into other pools (efficiency $E$) and the rest released as CO$_2$:
\begin{equation}\frac{dC_i}{dt}=-k_if_T(T)f_\theta(h)C_i+\sum_jE_{ji}k_jf_Tf_\theta C_j+\text{inputs},\qquad f_T=Q_{10}^{(T-T_{\rm ref})/10}.\end{equation}
The nitrogen follows from the carbon-to-nitrogen ratios: if $N$ is released by the source pool faster than the receiving pool needs, ammonium is mineralised; otherwise ammonium is immobilised. Nitrification saturates with ammonium: $r_{nit}=f_Tf_\theta V_{\max}[\mathrm{NH}_4^+]/(K_m+[\mathrm{NH}_4^+])$.
""")
k=0.01;Tsoil=20;Tref=10;Q10=2.0;ftv=Q10**((Tsoil-Tref)/10);fth=0.8
Cs=2000.0;E_=0.6;CNs=40;CNt=8
dec=k*ftv*fth*Cs
body=T(r"""A straw pool holds $C=2000$ kg C ha$^{-1}$ with C:N $=40$, decay rate $k=0.01$ d$^{-1}$ at $T_{\rm ref}=10^\circ$C, $Q_{10}=2$, soil at 20$^\circ$C, moisture factor $f_\theta=0.8$; efficiency $E=0.6$ into a microbial pool with C:N $=8$. Find the decay, CO$_2$ and the nitrogen exchange for one day.

\textbf{Solution.} $f_T=2^{(20-10)/10}=@ft@$. Decay $=0.01\times@ft@\times0.8\times2000=@dec@$ kg C ha$^{-1}$ d$^{-1}$. Built into the microbes: $0.6\times@dec@=@bu@$; released as CO$_2$: $@co2@$. Nitrogen released by the straw: $@dec@/40=@ns@$ kg N; nitrogen needed by the microbes: $@bu@/8=@nn@$ kg N. Balance $=@ns@-@nn@=@net@$ kg N ha$^{-1}$ d$^{-1}$: negative, so ammonium is \emph{immobilised}. Straw with a C:N of 40 takes mineral N from the soil until the pool has decayed enough for its C:N to fall. The break-even C:N of the source is $C{:}N=8/0.6=@be@$.""",ft=fx(ftv,2),dec=fx(dec,2),bu=fx(E_*dec,2),co2=fx((1-E_)*dec,2),ns=fx(dec/CNs,3),nn=fx(E_*dec/CNt,3),net=fx(dec/CNs-E_*dec/CNt,3),be=fx(CNt/E_,1))
w(ex("immobilisation by straw",body))
rows=[[nh,fx(0.8*1.5*nh/(2+nh),3)] for nh in (0.5,1,2,5,10,20)]
w(tab(["{[}NH$_4^+${]} (mg/L)","$r_{nit}$ (mg L$^{-1}$d$^{-1}$)"],rows,"Nitrification with $V_{\\max}=1.5$ mg L$^{-1}$d$^{-1}$, $K_m=2$ mg L$^{-1}$, $f_T=1$, $f_\\theta=0.8$.","tab:nit"))
body=T(r"""From Table~\ref{tab:nit}, at what ammonium concentration is the rate half of its maximum, and what is the maximum?

\textbf{Solution.} At $[\mathrm{NH}_4^+]=K_m$ the rate is $\frac12V_{\max}f_Tf_\theta$, so the half-rate concentration is 2 mg L$^{-1}$; the maximum is $1.5\times0.8=1.2$ mg L$^{-1}$d$^{-1}$, approached at high concentration (20 mg L$^{-1}$ gives @r@, $91\%$ of it).""",r=fx(0.8*1.5*20/22,3))
w(ex("Michaelis--Menten",body))
# denitrification
w(r"\subsection*{Denitrification and nitrous oxide}"+"\n"+r"""The potential rate follows the CO$_2$ produced, $r_{pot}=f_T(\alpha_F\mathrm{CO}_2^{\rm fast}+\alpha(\mathrm{CO}_2-\mathrm{CO}_2^{\rm fast}))$; it is limited by the water-filled pore space (a rising function of WFPS, 0 at 40\% and 1 at 90\%) and by nitrate; the gas is split by $f_r=\mathrm{N_2/N_2O}$: $\mathrm{N_2O}=r_{act}/(1+f_r)$, $\mathrm{N_2}=r_{act}/(1+1/f_r)$. In the example the WFPS function is taken linear between 40 and 90\% (the shape is not given in the manual; the library function may differ).
""")
def fw(wf): return min(1,max(0,(wf-40)/50))
rows=[[wf,fx(fw(wf),2),fx(fw(wf)*0.6,3)] for wf in (30,40,50,60,70,80,90,100)]
w(tab(["WFPS (\\%)","$f_w$ (linear)","$r_{act}$ (kg N/ha/d), $r_{pot}=0.6$"],rows,"Water limitation of denitrification.","tab:wfps"))
body=T(r"""At WFPS = 70\% the potential rate is 0.6 kg N ha$^{-1}$d$^{-1}$, nitrate is not limiting, and $f_r=4$ (assumed). Split the gas.

\textbf{Solution.} $f_w=(70-40)/50=0.6$; $r_{act}=0.6\times0.6=0.36$ kg N ha$^{-1}$d$^{-1}$. N$_2$O $=0.36/(1+4)=@n2o@$; N$_2=0.36/(1+0.25)=@n2@$; the sum is $@s@=r_{act}$. If a wetter soil lowers nothing else but raises $f_w$ to 1 and $f_r$ falls to 1 (more N$_2$O per unit), the N$_2$O rises to $0.6/2=0.30$: wetting makes the loss larger \emph{and} dirtier.""",n2o=fx(0.36/5,3),n2=fx(0.36/1.25,3),s=fx(0.36/5+0.36/1.25,3))
w(ex("splitting the denitrified nitrogen",body))
# crop
w(r"\section{The crop: light, assimilates and growth}"+"\n"+r"""Absorbed light is $I_a=I_0(1-e^{-k\,\mathrm{LAI}})$; the gross assimilation of a leaf layer is $A=A_{\max}(1-e^{-\varepsilon I/A_{\max}})$; maintenance respiration is $R_m=\sum_or_of_TW_o$ with a $Q_{10}$ temperature factor; the rest is partitioned among the organs by fractions that depend on the development stage DS (0 at emergence, 1 at flowering, 2 at maturity); DS advances with the temperature sum.
""")
body=T(r"""A canopy has LAI = 4, $k=0.6$, incident light $I_0=40$ mol m$^{-2}$d$^{-1}$ (about 18 MJ m$^{-2}$d$^{-1}$ of global radiation in the PAR range), $A_{\max}=1.2$ g CH$_2$O m$^{-2}$h$^{-1}$ per unit of leaf, $\varepsilon=0.012$ in the same units per unit of light. Illustrate the saturating response and the light absorbed.

\textbf{Solution.} $I_a=40(1-e^{-0.6\times4})=40\times(1-@e@)=@Ia@$ mol m$^{-2}$ d$^{-1}$ (@fr@\% intercepted). The assimilation response of a leaf layer at three light levels: $A(I=20)=1.2(1-e^{-0.012\times20/1.2})=@a1@$, $A(100)=@a2@$, $A(500)=@a3@$ g m$^{-2}$h$^{-1}$: it rises almost linearly at low light and saturates toward $A_{\max}=1.2$. Water stress, temperature, senescence and leaf nitrogen multiply $A$ by factors below 1, so a stressed crop is on a lower curve, not a different shape.""",e=fx(exp(-2.4),3),Ia=fx(40*(1-exp(-2.4)),1),fr=fx(100*(1-exp(-2.4)),0),a1=fx(1.2*(1-exp(-0.012*20/1.2)),3),a2=fx(1.2*(1-exp(-0.012*100/1.2)),3),a3=fx(1.2*(1-exp(-0.012*500/1.2)),3))
w(ex("light interception and assimilation",body))
body=T(r"""Maintenance respiration of the organs: root 150, stem 300, leaf 250, storage 100 g dry matter m$^{-2}$ with rates $r_o=0.015,0.010,0.030,0.003$ g g$^{-1}$d$^{-1}$ at 25$^\circ$C, $Q_{10}=2$; find $R_m$ at 25 and 15$^\circ$C.

\textbf{Solution.} At 25$^\circ$C: $150\times0.015+300\times0.010+250\times0.030+100\times0.003=2.25+3.00+7.50+0.30=@r25@$ g m$^{-2}$d$^{-1}$. At 15$^\circ$C: $f_T=2^{-1}=0.5$, $R_m=@r15@$. A cooler night saves half the maintenance cost, which is why a warm night is costly for the yield of a cereal in the model.""",r25=fx(2.25+3.0+7.5+0.3,2),r15=fx(0.5*(2.25+3.0+7.5+0.3),2))
w(ex("maintenance respiration",body))
# calibration
w(r"\section{Calibration with three optimisers}"+"\n"+r"""The tab Calibration minimises the loss $\mathrm{MSE}=\frac1n\sum(y_i-\hat y_i)^2$. To work it, ``measured'' retention data are generated from the loam ($\alpha=0.036$, $n=1.56$) at nine pressure heads with a fixed pseudo-random error of $\pm0.005$ cm$^3$cm$^{-3}$; the loam's $\theta_s$ and $\theta_r$ are held fixed; $\alpha$ and $n$ are the unknowns. Three optimisers are compared: a grid search, a random search and the Nelder--Mead simplex.
""")
from scipy.optimize import minimize
rng=np.random.default_rng(11)
hh=np.array([-10,-30,-60,-100,-300,-1000,-3000,-8000,-15000.0])
thm=theta(hh,p)+rng.uniform(-0.005,0.005,len(hh))
def mse(x):
    a,n=x
    if a<=0 or n<=1.01: return 1e9
    q=dict(p);q['a']=a;q['n']=n;return float(np.mean((theta(hh,q)-thm)**2))
grid_a=np.linspace(0.01,0.08,29);grid_n=np.linspace(1.2,2.0,33)
best=min(((mse((a,n)),a,n) for a in grid_a for n in grid_n))
nev_g=len(grid_a)*len(grid_n)
rngr=np.random.default_rng(5);bs=(1e9,0,0)
for _ in range(1000):
    a=rngr.uniform(0.01,0.08);n=rngr.uniform(1.2,2.0);v=mse((a,n))
    if v<bs[0]: bs=(v,a,n)
nm=minimize(mse,[0.02,1.3],method='Nelder-Mead',options=dict(xatol=1e-6,fatol=1e-14,maxiter=400))
rows=[["Grid ($29\\times33$)",nev_g,fx(best[1],4),fx(best[2],3),f"{best[0]:.3e}"],["Random (1000)",1000,fx(bs[1],4),fx(bs[2],3),f"{bs[0]:.3e}"],["Nelder--Mead",nm.nfev,fx(nm.x[0],4),fx(nm.x[1],3),f"{nm.fun:.3e}"],["true",'-',"0.0360","1.560",f"{mse((0.036,1.56)):.3e}"]]
w(tab(["Optimiser","evaluations","$\\alpha$","$n$","MSE"],rows,"Calibration of $\\alpha$ and $n$ on nine noisy retention data.","tab:calib"))
body=T(r"""Compare the three optimisers in Table~\ref{tab:calib}.

\textbf{Solution.} The data have an error of up to 0.005, so the noise variance is $0.005^2/3=@v@$; the true parameters give an MSE of $@mt@$. The grid finds $(\alpha,n)=(@ga@,@gn@)$ with MSE $@gm@$ after @ng@ evaluations; the random search is a little worse for the same effort order; Nelder--Mead converges to $(@na@,@nn@)$ with MSE $@nm@$ in only @nf@ evaluations. All three land near the true values: the retention data constrain $\alpha$ and $n$ well, but the grid is limited by its spacing and the random search by luck, while the simplex uses the shape of the loss surface. @tail@""",v=f"{0.005**2/3:.2e}",mt=f"{mse((0.036,1.56)):.2e}",ga=fx(best[1],4),gn=fx(best[2],3),gm=f"{best[0]:.2e}",ng=nev_g,na=fx(nm.x[0],4),nn=fx(nm.x[1],3),nm=f"{nm.fun:.2e}",nf=nm.nfev,tail=("The fitted MSE is below the true-parameter MSE: with nine points the fit absorbs part of the noise, a reminder that a low loss does not prove the parameters are right." if nm.fun<mse((0.036,1.56)) else "The fitted MSE is not below that of the true parameters here, so the noise, not the optimiser, limits the fit."))
w(ex("three optimisers",body))
w(r"""\section{Summary}
\begin{itemize}
\item van Genuchten--Mualem $\theta(h)$, $K(h)$; Richards equation by an implicit, mass-conserving Picard scheme; the balance $P+I=E_s+E_i+T+D+R+\Delta S$ closes to the tolerance.
\item Root uptake $S=\alpha_s(h)S_p$; demand shared by $e^{-k\mathrm{LAI}}$; heat damped by $e^{-z/d_T}$.
\item Solutes: retardation $R=1+\rho_bK_d/\theta$, decay $e^{-\mu t}$, the Ogata--Banks profile.
\item Organic matter: $k f_Tf_\theta C$, efficiency $E$, immobilisation when C:N $>$ the break-even $C{:}N_{\rm target}/E$; nitrification saturates; denitrification is limited by WFPS and split between N$_2$O and N$_2$.
\item Crop: $I_a=I_0(1-e^{-kLAI})$, saturating assimilation, $Q_{10}$ respiration; calibration by MSE.
\end{itemize}
\textit{Not covered here:} the 107 reference topics, the 69 experiment factors and the 43 best combinations of the workbench (they are tables of Daisy parameters and runs, not equations), and the glossary; these remain for a later edition.
""")
open('/tmp/book/p2r.tex','w').write("\n".join(O))
print(rr['Qin'],rr['Qout'],rr['dS'],rr2['Qout'],rr2['dS'],resid,best,bs,nm.x,nm.fun,nm.nfev)
