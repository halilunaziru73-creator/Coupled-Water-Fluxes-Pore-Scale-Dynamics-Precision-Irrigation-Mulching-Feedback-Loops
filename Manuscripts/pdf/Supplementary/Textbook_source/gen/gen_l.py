import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
from surf import saxton
from drip import *
import numpy as np
O=[];w=O.append
EM={'Online':dict(q=4,Se=0.75,D=16,H0=10,cv=0.07,x=0.5,ne=1,pc=False),'Inline':dict(q=2,Se=0.50,D=16,H0=10,cv=0.04,x=0.5,ne=1,pc=False),'Drip tape':dict(q=1,Se=0.20,D=16,H0=10,cv=0.08,x=0.6,ne=2,pc=False),'PC':dict(q=2,Se=0.60,D=16,H0=15,cv=0.03,x=0.5,ne=1,pc=True)}
def Eu(cv,ne,qmin,qbar): return min(1,max(0.3,(1-1.27*cv/math.sqrt(ne))*qmin/qbar))
w(r"""\chapter{Drip irrigation design}\label{ch:drip}
\markboth{Drip design}{Drip design}
\textbf{After this chapter you can} solve the flow and head along an emitter lateral, compute the emission uniformity, size the wetted bulb from the soil, evaluate the efficiencies over the spread of emitters, and size the pipes, pump and season of a drip system.

\section{Depth per irrigation}
By default the depth is the crop need over the interval capped by what the root zone holds at the trigger: $Z_n=\min\{Z_n^{\rm DSS},\max(4,ET_{\rm pk}\Delta t)\}$ mm, with $ET_{\rm pk}=\mathrm{clip}\{\max_d\frac15\sum_{j=0}^{4}(E_{d+j}+T_{d+j});2.5,9\}$ mm d$^{-1}$.
""")
body=r"""The five-day mean of $E+T$ peaks at $6.4$ mm d$^{-1}$ in the season of the loam. Find $ET_{\rm pk}$, and $Z_n$ for irrigation every 1, 2, 3 and 5 days with $Z_n^{\rm DSS}=73.3$ mm.

\textbf{Solution.} $ET_{\rm pk}=\mathrm{clip}(6.4;2.5,9)=6.4$. $Z_n=\min\{73.3,\max(4,6.4\Delta t)\}$: $\Delta t=1$: $6.4$ mm; $2$: $12.8$; $3$: $19.2$; $5$: $32.0$ mm. All are below the root-zone limit 73.3 mm, so the crop need decides. At the default $\Delta t=2$ d the depth is 12.8 mm, which is what a drip line must deliver at each irrigation."""
w(ex("depth per irrigation",body))
w(r"""\section{Lateral hydraulics}
A lateral of length $L_L$ has $N=\mathrm{round}(L_L/S_e)$ intervals and $N+1$ emitters. The friction loss in the segment feeding emitter $j$ is the Hazen--Williams loss $h_{f,j}=\dfrac{10.67\,S_eQ_j^{1.852}}{C^{1.852}D^{4.871}}$ with $C=140$ and $Q_j=\sum_{i\ge j+1}q_i$ (m$^3$ s$^{-1}$); the head is $h_j=h_{j-1}-h_{f,j-1}$ with $h_0=H_0$; the emitter law is $q_j=q(h_j/H_0)^x$ (non-compensating), or for the pressure-compensating emitter $q_j=q[1+0.04(h_j-H_0)/H_0]$ above $H_{\min}=8$ m and $q(\max(h_j,0.1)/H_{\min})^{0.5}$ below it. Flows and heads depend on each other: the pair is iterated from the uniform start (three plain substitution passes, then the flows averaged with the previous pass) until the largest relative change is below $10^{-7}$.
""")
# hand-check for tiny lateral first
body=r"""Hand-solve a lateral with three emitters ($N=2$): online emitter $q=4$ L h$^{-1}$ at $H_0=10$ m, $x=0.5$, $S_e=0.75$ m, $D=16$ mm, $C=140$. Do the first pass of the iteration and the check of the loss.

\textbf{Solution.} Start with $q_j=4$ L h$^{-1}$ $=1.111\times10^{-6}$ m$^3$ s$^{-1}$ at every emitter. The segment before emitter 1 carries $Q=q_1+q_2=2.222\times10^{-6}$ m$^3$ s$^{-1}$: $h_f=10.67(0.75)(2.222\times10^{-6})^{1.852}/(140^{1.852}\times0.016^{4.871})$. Compute: $(2.222\times10^{-6})^{1.852}=e^{1.852\ln(2.222\times10^{-6})}=e^{1.852\times(-13.017)}=e^{-24.11}=3.4\times10^{-11}$; $140^{1.852}=e^{1.852\times4.9416}=e^{9.152}=9{,}420$; $0.016^{4.871}=e^{4.871\times(-4.1352)}=e^{-20.14}=1.8\times10^{-9}$. So $h_f=8.0\times3.4\times10^{-11}/(9420\times1.8\times10^{-9})=2.7\times10^{-10}/1.7\times10^{-5}=1.6\times10^{-5}$ m: a negligible loss, so $q_1\approx q_0$ and the three emitters are the same at this length. Short laterals are uniform; the loss grows with the square of the length (flow) times length (pipe) so that it is of order $L^{2.852}$."""
w(ex("hand pass of a short lateral",body))
rows=[]
q,h,it=lateral(100,0.75,16,10,4.0,0.5)
# iteration table: replicate
def lat_iter(LL,Se,D_mm,H0,q_lh,x,maxit=12):
    N=int(round(LL/Se));D=D_mm/1000;qj=np.full(N+1,q_lh,float);out=[]
    for it in range(maxit):
        qm3=qj/3600/1000;h=np.empty(N+1);h[0]=H0
        for j in range(1,N+1): h[j]=max(h[j-1]-hw(Se,qm3[j:].sum(),D),0.5)
        qn=q_lh*(np.maximum(h,0)/H0)**x
        qn2=qn if it<3 else 0.5*(qn+qj)
        err=np.max(np.abs(qn2-qj)/qj);out.append((it+1,qn2.mean(),qn2.min(),h[-1],err));qj=qn2
    return out
for r_ in lat_iter(100,0.75,16,10,4.0,0.5)[:10]:
    rows.append([r_[0],f"{r_[1]:.4f}",f"{r_[2]:.4f}",f"{r_[3]:.3f}",f"{r_[4]:.2e}"])
body=f"""Solve a lateral of $L_L=100$ m with the online emitter ($q=4$ L h$^{{-1}}$, $S_e=0.75$ m, $x=0.5$, $H_0=10$ m, $D=16$ mm): the head at the far end, $\\bar q$, $q_{{\\min}}$ and the number of passes.

\\textbf{{Solution.}} $N=\\mathrm{{round}}(100/0.75)=133$ intervals and $134$ emitters. At the start the segment at the inlet carries all 134 emitters: $Q=134\\times1.111\\times10^{{-6}}=1.489\\times10^{{-4}}$ m$^3$ s$^{{-1}}$, and the loss of its first 0.75 m is $h_f={hw(0.75,134*4/3.6e6,0.016):.5f}$ m. Summing the losses along the lateral lowers the head, which lowers the flows, which lowers the losses: Table~\\ref{{tab:latiter}} lists the first ten passes (the first three are plain substitution). The iteration converges (to $10^{{-7}}$) after {it} passes to $\\bar q={q.mean():.4f}$ L h$^{{-1}}$, $q_{{\\min}}={q.min():.4f}$ L h$^{{-1}}$ at the last emitter and an end head $H_{{\\rm end}}={h[-1]:.3f}$ m. The loss along the lateral is $h_f=H_0-H_{{\\rm end}}={10-h[-1]:.2f}$ m, {100*(10-h[-1])/10:.1f} per cent of the inlet head (the warning level is 20 per cent)."""
body+=tab(["Pass","$\\bar q$ (L/h)","$q_{\\min}$ (L/h)","$H_{\\rm end}$ (m)","max change"],rows,"Convergence of the lateral solution.","tab:latiter")
w(ex("flow and head along a 100 m lateral",body))
w(r"""\section{Emission uniformity}
\begin{equation}E_u=\mathrm{clip}\Bigl\{\Bigl(1-\frac{1.27c_v}{\sqrt{n_e}}\Bigr)\frac{q_{\min}}{\bar q};0.3,1\Bigr\},\qquad\sigma_q=\sqrt{c_v^2+\sigma_P^2},\ \sigma_P^2=\frac1{N+1}\sum_j\Bigl(\frac{q_j}{\bar q}-1\Bigr)^2.\end{equation}
""")
rows=[]
for nm,e in EM.items():
    q,h,it=lateral(100,e['Se'],e['D'],e['H0'],e['q'],e['x'],pc=e['pc'])
    eu=Eu(e['cv'],e['ne'],q.min(),q.mean());sP=math.sqrt(np.mean((q/q.mean()-1)**2));sq=math.sqrt(e['cv']**2+sP**2)
    rows.append([nm,e['q'],e['Se'],f"{(e['H0']-h[-1])/e['H0']*100:.1f}",f"{q.min()/q.mean():.3f}",f"{eu*100:.1f}",f"{sq:.3f}"])
body=r"""Compute the emission uniformity of the four emitter types of the application (Table 12.1 of the manual: online, inline, drip tape and pressure-compensating) on a lateral of 100 m, with $D=16$ mm.

\textbf{Solution.} Solve each lateral as above, then apply the clip formula. For the online emitter: $(1-1.27(0.07)/\sqrt1)=0.911$, $q_{\min}/\bar q=3.672/3.759=0.977$, so $E_u=0.911\times0.977=0.890$, $89$ per cent. Table~\ref{tab:eu} gives the four."""
body+=tab(["Emitter","$q$ (L/h)","$S_e$ (m)","Head loss (\\%)","$q_{\\min}/\\bar q$","$E_u$ (\\%)","$\\sigma_q$"],rows,"Uniformity of four emitters on a 100 m lateral.","tab:eu")
body+=r"""\textbf{Reading.} The drip tape (many small emitters: $2\times$ per plant and $S_e=0.2$ m) flows 1 L h$^{-1}$ each, but the 500 emitters on 100 m make the lateral carry 0.14 L s$^{-1}$; its head loss ($13.8$ per cent) is comparable to that of the online emitter. The manufacturing term is the larger part of the non-uniformity for the compensating emitter, whose hydraulic variation is tiny."""
w(ex("emission uniformity of four emitters",body))
rows=[]
for L in [50,100,150,200,250,300]:
    q,h,it=lateral(L,0.75,16,10,4.0,0.5);qp,hp,_=lateral(L,0.6,16,15,2.0,0.5,pc=True)
    rows.append([L,f"{(10-h[-1])/10*100:.1f}",f"{q.min()/q.mean():.3f}",f"{(15-hp[-1])/15*100:.1f}",f"{qp.min()/qp.mean():.3f}"])
body=r"""Find how the head loss and the flow ratio $q_{\min}/\bar q$ of the online emitter (D 16 mm) and the pressure-compensating emitter change with the lateral length 50 to 300 m, and where the 20 per cent loss warning appears.

\textbf{Solution.} Table~\ref{tab:long} lists the solutions. For the online emitter the loss rises from a few per cent at 50 m to tens of per cent at 300 m, since the loss goes as $L^{2.852}$ in a uniform pipe; the flow ratio falls by roughly half that percentage, because $q\propto h^{0.5}$ (a 10 per cent head loss costs about 5 per cent of flow). The compensating emitter keeps $q_{\min}/\bar q$ near 1 until the head falls below $H_{\min}=8$ m. (Beyond about 250 m the head reaches the application's floor of 0.5 m, which is why the loss column stops growing; such a lateral is outside the design rule.)"""
body+=tab(["$L_L$ (m)","online loss (\\%)","online $q_{\\min}/\\bar q$","PC loss (\\%)","PC $q_{\\min}/\\bar q$"],rows,"Effect of lateral length.","tab:long")
w(ex("how long can the lateral be",body))
# bulb
w(r"""\section{The wetted bulb}
The soil stores $\Delta\theta=\max\{0.03,f_T(\theta_{fc}-\theta_{wp})\}$. The bulb below the emitter is a half-ellipsoid of horizontal radius $r$ and lower semi-axis $ar$, with a short upper half of semi-axis $ur$, $u=0.6$: $\rho(z)=r\sqrt{1-\zeta^2}$ with $\zeta=(z-z_d)/(ar)$ below the emitter and $(z_d-z)/(ur)$ above it. The aspect ratio follows the soil,
\begin{equation}a=\mathrm{clip}\Bigl\{\Bigl[0.7+1.6\Bigl(\frac{K_s}{K_s+15}\Bigr)^{1.1}\Bigr]\sqrt{\mathrm{clip}(2/q;0.7,1.4)};0.75,2.4\Bigr\},\end{equation}
and the radius is found by bisection so that $\int\pi\rho(z)^2dz=V\cdot10^6/\Delta\theta$ mm$^3$ ($V$ in litres).
""")
rows=[]
for sid in IDS:
    nm,a_,n_,awc,sa,si,cl=SOIL[sid];s=saxton(sa/100,cl/100,1.5)
    fT=0.45;dth=max(0.03,fT*(s['th33']-s['th1500']))
    for_q=4.0
    a=min(2.4,max(0.75,(0.7+1.6*(s['Ks']/(s['Ks']+15))**1.1)*math.sqrt(min(1.4,max(0.7,2/for_q)))))
    rows.append([sid,nm,f"{s['Ks']:.1f}",f"{dth:.3f}",f"{a:.2f}"])
s=saxton(0.40,0.20,1.5);dth=max(0.03,0.468*(s['th33']-s['th1500']))
a=min(2.4,max(0.75,(0.7+1.6*(s['Ks']/(s['Ks']+15))**1.1)*math.sqrt(0.7)))
Vl=1.0;Vw=Vl*1e6/dth;zd=250.0;r=bulb_radius(Vw,a,0.6,zd)
body=f"""(a) Compute the shape factor $a$ for the ten soils at $q=4$ L h$^{{-1}}$ (the manual quotes about 2.1 for sand, 1.9 sandy loam, 1.3 to 1.4 for loam and silt loam, 0.9 to 1.0 for clay loam and silty clay loam). (b) For the loam with a buried emitter at $z_d=250$ mm delivering 1 litre, find the wetted radius.

\\textbf{{Solution (a).}} For the loam: $K_s/(K_s+15)=12.07/27.07=0.446$; $0.446^{{1.1}}=0.4115$; $0.7+1.6\\times0.4115=1.358$; $\\sqrt{{\\mathrm{{clip}}(2/4;0.7,1.4)}}=\\sqrt{{0.7}}=0.8367$; $a=1.358\\times0.8367=1.136$. For all soils see Table~\\ref{{tab:aspect}}; with $q=4$ L h$^{{-1}}$ the factor $\\sqrt{{0.7}}$ lowers $a$ by 16 per cent relative to $q=2$, so the values here are lower than the manual's typical figures, which correspond to 2 L h$^{{-1}}$ ($\\sqrt{{1}}=1$). A larger emitter flow spreads the bulb sideways.

\\textbf{{Solution (b).}} $\\Delta\\theta=\\max\\{{0.03,0.468({s['th33']:.4f}-{s['th1500']:.4f})\\}}={dth:.4f}$. The wetted volume is $V_w=1\\times10^6/{dth:.4f}={Vw:.3e}$ mm$^3$ (about {Vw/1e6:.1f} litres of soil). Bisection on $r$ in $[5,3500]$ mm over 38 steps until the volume of revolution equals $V_w$ gives $r={r:.0f}$ mm (lower semi-axis $ar={a*r:.0f}$ mm, upper $0.6r={0.6*r:.0f}$ mm). The bulb is buried at 250 mm, so the upper part reaches {250-0.6*r:.0f} mm """+("(it reaches the surface and is truncated there)" if 250-0.6*r<0 else "(below the surface)")+f"."
body+=tab(["ID","Soil","$K_s$ (mm/h)","$\\Delta\\theta$","$a$ at $q=4$"],rows,"Wetting-bulb aspect ratio from the soil.","tab:aspect")
w(ex("the shape and size of the bulb",body))
# efficiencies
def one(Zn,Se,Sl,q,qbar_ratio,cv,t_mode='auto',zd=250.0,a_=1.136,dth_=0.0645,Rmax=920.0,E0=3.0,Eu_=0.89,t=None):
    qbar=q*qbar_ratio;sP=0.03;sq=math.sqrt(cv**2+sP**2)
    Vreq=Zn*Se*Sl
    if t is None: t=min(96,max(0.05,Vreq/(qbar*Eu_)))
    r=drip_eff(qbar,sq,t,Zn,Se,Sl,a_,0.6,zd,dth_,Rmax,E0)
    return t,r
t_,r_=one(12.8,0.75,1.0,4.0,0.94,0.07)
rows=[]
for z,x in zip([-1.28,-0.52,0,0.52,1.28],r_['res']):
    rows.append([z,f"{x['V']:.2f}",f"{x['r']:.0f}",f"{x['Vdp']:.3f}",f"{x['Vev']:.3f}",f"{x['Vroot']:.2f}",f"{x['Vst']:.2f}",f"{x['Vex']:.2f}"])
body=f"""Evaluate the efficiencies of a drip system on the loam: online emitter ($q=4$ L h$^{{-1}}$, $\\bar q=0.94q=3.76$), $S_e=0.75$ m, laterals $S_l=1.0$ m (cereal), buried at 250 mm, $Z_n=12.8$ mm, root zone $R_{{\\max}}=920$ mm, $E_0=3$ mm d$^{{-1}}$, $E_u=0.89$, $\\sigma_q=\\sqrt{{0.07^2+0.03^2}}=0.076$ (assumed $\\sigma_P=0.03$).

\\textbf{{Solution.}} 1. Water required per emitter: $V_{{req}}=Z_nS_eS_l=12.8\\times0.75\\times1.0={r_['Vreq']:.2f}$ L (1 mm over 1 m$^2$ is 1 L). 2. Automatic run time: $t=V_{{req}}/(\\bar qE_u)={r_['Vreq']:.2f}/(3.76\\times0.89)={t_:.2f}$ h. 3. Mean delivery $\\bar V=\\bar qt={3.76*t_:.2f}$ L. 4. Five emitters at the normal quantiles $z=-1.28,-0.52,0,0.52,1.28$ deliver $V_i=\\bar V(1+\\sigma_qz_i)$ (Table~\\ref{{tab:quant}}); for each the bulb radius, the part below $R_{{\\max}}$, the evaporation $V_{{ev}}=\\min\\{{0.5V,\\pi\\rho(0)^2\\times10^{{-6}}\\times2E_0\\}}$ and the root water follow Equations (12.10) to (12.15). 5. Storage $V_{{st,i}}=\\min(V_{{root,i}},V_{{req}})$ and the excess $V_{{ex,i}}$. 6. Averages over the five: $E_a={r_['Ea']:.3f}$, $E_s={r_['Es']:.3f}$, $DP={r_['DP']:.3f}$, $EV={r_['EV']:.3f}$; $E_a+DP+EV={r_['Ea']+r_['DP']+r_['EV']:.3f}$. Gross depth $Z_{{gross}}=\\bar V/(S_eS_l)={r_['Zgross']:.1f}$ mm."""
body+=tab(["$z$","$V$ (L)","$r$ (mm)","$V_{dp}$","$V_{ev}$","$V_{root}$","$V_{st}$","$V_{ex}$"],rows,"Five representative emitters.","tab:quant")
body+=r"""\textbf{Reading.} The drier emitters ($z<0$) deliver less than the need, so $E_s<1$; the wetter ones deliver more than the root zone accepts, and the excess is counted with deep percolation. This is why $E_a<1$ even with no water below the root zone: the spread of emitters alone costs efficiency."""
w(ex("efficiencies over the spread of emitters",body))
# sand vs loam, surface vs buried
rows=[]
for sid,fT,depth in [('S06',0.468,250),('S06',0.468,0),('S06',0.468,550),('S03',0.842,250),('S03',0.842,0)]:
    nm,a_,n_,awc,sa,si,cl=SOIL[sid];sx=saxton(sa/100,cl/100,1.5);dth=max(0.03,fT*(sx['th33']-sx['th1500']))
    a=min(2.4,max(0.75,(0.7+1.6*(sx['Ks']/(sx['Ks']+15))**1.1)*math.sqrt(0.7)))
    t,r=one(12.8,0.75,1.0,4.0,0.94,0.07,zd=float(depth),a_=a,dth_=dth)
    rows.append([nm,"surface" if depth==0 else f"{depth//10} cm",f"{t:.2f}",f"{r['Ea']:.3f}",f"{r['Es']:.3f}",f"{r['DP']:.3f}",f"{r['EV']:.3f}"])
body=r"""Compare the same drip system on the loam and on the sand ($f_T=0.842$) and with the emitter at the surface, 25 cm and 55 cm.

\textbf{Solution.} Recompute the bulb for each case (Table~\ref{tab:place}). With a surface line the half-spherical bulb exposes the largest wet patch and evaporation takes about 30 per cent of the water; the buried lines lose none. For the three buried depths the bulb stays inside the 92 cm root zone, so the only loss is the excess delivered by the wetter emitters (DP $=0.11$), and the result is the same in the two soils at the same delivery and run time; the soil changes the bulb shape, not the efficiency, for this small depth."""
body+=tab(["Soil","Emitter depth","$t$ (h)","$E_a$","$E_s$","DP","EV"],rows,"Efficiency by soil and placement.","tab:place")
w(ex("soil and placement",body))
# layout
Af=1.0;LL=100;Sl=1.0;Qs=30
q,h,it=lateral(LL,0.75,16,10,4.0,0.5);Qlat=len(q)*q.mean()/3600
Wf=1e4*Af/LL;NL=int(Wf//Sl);nzone=math.ceil(NL*Qlat/Qs);nl=math.ceil(NL/nzone);Qz=nl*Qlat
series=[32,40,50,63,75,90,110,125,160,200,250,315]
Dsel=None
for D in series:
    v=4*Qz/1000/(math.pi*(D/1000)**2)
    if v<=1.5: Dsel=D;break
Lsm=nl*Sl;Lm=120
Dm=Dsel
hsm=0.4*10.67*Lsm*(Qz/1000)**1.852/(140**1.852*(Dsel/1000)**4.871);hm=10.67*Lm*(Qz/1000)**1.852/(140**1.852*(Dm/1000)**4.871)
TDH=12+10+hsm+hm+9;P=9.81*(Qz/1000)*TDH/0.65
body=f"""Lay out 1 ha of the loam with laterals of $L_L=100$ m, $S_l=1.0$ m, farm supply $Q_s=30$ L s$^{{-1}}$, mainline $L_m=120$ m, lift 12 m, inlet head $H_0=10$ m. Find the number of laterals, zones, the zone flow, the pipe diameter, the head losses, the total dynamic head and the pump power.

\\textbf{{Solution.}} $W_f=10^4A_f/L_L=10^4/100=100$ m; $N_L=\\lfloor W_f/S_l\\rfloor=100$ laterals. Each carries $134\\bar q/3600={Qlat:.4f}$ L s$^{{-1}}$ ($\\bar q={q.mean():.3f}$ L h$^{{-1}}$), so all together {NL*Qlat:.2f} L s$^{{-1}}$. Zones: $n_{{zone}}=\\lceil N_LQ_{{lat}}/Q_s\\rceil=\\lceil{NL*Qlat:.2f}/30\\rceil={nzone}$; laterals per zone $n_l=\\lceil100/{nzone}\\rceil={nl}$; zone flow $Q_z=n_lQ_{{lat}}={Qz:.2f}$ L s$^{{-1}}$. Pipe: the smallest diameter of the series with $v=4Q_z/(\\pi D^2)\\le1.5$ m s$^{{-1}}$ is $D={Dsel}$ mm ($v={4*Qz/1000/(math.pi*(Dsel/1000)**2):.2f}$ m s$^{{-1}}$). Submain length $L_{{sm}}=n_lS_l={Lsm:.0f}$ m; the submain loss is 0.4 of the full Hazen--Williams loss, $h_{{f,sm}}={hsm:.2f}$ m, and the mainline loss $h_{{f,m}}={hm:.2f}$ m. TDH $=z_{{lift}}+H_0+h_{{f,sm}}+h_{{f,m}}+9=12+10+{hsm:.2f}+{hm:.2f}+9={TDH:.1f}$ m. Pump power $P=9.81(Q_z/1000)\\,TDH/0.65={P:.2f}$ kW. Pipe per hectare: $(N_LL_L+L_{{sm}})/A_f={NL*LL+Lsm:.0f}$ m."""
w(ex("layout, pipes and pump of one hectare",body))
Zn=12.8;Zg=r_['Zgross'];nev=150/Zn;Zs=nev*Zg;qha=4*1e4/(3600*0.75*1.0)
nset=math.ceil(qha*Af/Qs);tr=nset*t_;Hp=nev*tr;Ek=Hp*P
body=f"""Season and farm for the same system with a net seasonal irrigation $y_I=150$ mm and $Z_n=12.8$ mm.

\\textbf{{Solution.}} $n_{{ev}}=y_I/Z_n=150/12.8={nev:.1f}$ events; gross depth $Z_{{gross}}={Zg:.1f}$ mm per event; $Z_{{season}}=n_{{ev}}Z_{{gross}}={Zs:.0f}$ mm ($={10*Zs:.0f}$ m$^3$ ha$^{{-1}}$). Flow per hectare $q_{{ha}}=q\\times10^4/(3600S_eS_l)=4\\times10^4/(3600\\times0.75\\times1.0)={qha:.2f}$ L s$^{{-1}}$ ha$^{{-1}}$; sets $n_{{set}}=\\lceil q_{{ha}}A_f/Q_s\\rceil=\\lceil{qha:.2f}/30\\rceil={nset}$; round time $t_{{round}}={nset}\\times{t_:.2f}={tr:.2f}$ h; pumping hours $H_{{pump}}=n_{{ev}}t_{{round}}={Hp:.0f}$ h; energy $E_{{kWh}}={Hp:.0f}\\times{P:.2f}={Ek:.0f}$ kWh."""
w(ex("season and farm of the drip system",body))
open('/tmp/book/p2l.tex','w').write("\n".join(O))
