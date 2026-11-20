import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
import numpy as np
from scipy.spatial import ConvexHull
O=[];w=O.append
rng=np.random.default_rng(7)
def esat(T): return 0.6108*math.exp(17.27*T/(T+237.3))
def Delta(T): return 4098*esat(T)/(T+237.3)**2
w(r"""\chapter{Phenotyping layers: the deterministic plant and the volumetric scan}\label{ch:pheno}
\markboth{Phenotyping}{Phenotyping}
\textbf{After this chapter you can} step the deterministic plant of layer P1 through a day with its equations P.1 to P.28, and rebuild the measurements of the virtual scanner of layer P2 (registration, voxels, volume, leaf area).

Layer P1 grows a plant for $N=140$ days on a soil of eight layers of 15 cm, with no random numbers. Its equations are numbered P.1 to P.28 in the order the model uses them each day. Where the manual gives the form but not a species constant, the constant below is an \emph{assumed} typical value, and it is labelled.
\section{Development, light and biomass (P.1 to P.5)}
""")
# P.1 GDD
days=np.arange(140)
T=18+9*np.sin(2*math.pi*(days-60)/200)  # assumed temperature series
Tb,To=8,30
dg=np.maximum(0,np.minimum(T,To+6)-Tb);G=np.cumsum(dg)
body=f"""Maize ($T_{{\\rm base}}=8$, $T_{{\\rm opt}}=30$ \\textdegree C) grows under the (assumed) daily mean temperature $T(d)=18+9\\sin(2\\pi(d-60)/200)$. Find the degree days $d_g=\\max(0,\\min(T,T_{{\\rm opt}}+6)-T_{{\\rm base}})$ on days 0, 30, 70, 100 and the accumulated GDD at day 70 and day 139; if flowering needs $\\mathrm{{GDD}}_{{\\rm flowering}}=800$, on which day is it reached?

\\textbf{{Solution.}} Day 0: $T=18+9\\sin(-0.6\\pi)={T[0]:.2f}$, $d_g={dg[0]:.2f}$. Day 30: $T={T[30]:.2f}$, $d_g={dg[30]:.2f}$. Day 70: $T={T[70]:.2f}$, $d_g={dg[70]:.2f}$. Day 100: $T={T[100]:.2f}$, $d_g={dg[100]:.2f}$. Summing: $\\mathrm{{GDD}}(70)={G[70]:.0f}$ and $\\mathrm{{GDD}}(139)={G[139]:.0f}$ degree days. Flowering (800) is reached on day {int(np.argmax(G>=800))}; the stage before flowering is $\\mathrm{{GDD}}/800$, which is {G[70]/800:.2f} on day 70."""
w(ex("thermal time (P.1)",body))
# P.2 ET0
def et0(Tm,Rn,u2,RH,Tmax=None,Tmin=None):
    es=esat(Tm);ea=es*RH;D=Delta(Tm);g=0.0674
    return (0.408*D*Rn+g*900/(Tm+273)*u2*(es-ea))/(D+g*(1+0.34*u2)),es,ea,D
v,es,ea,D=et0(28,18,2.0,0.45)
body=f"""The reference evapotranspiration of the day (FAO-56, $G=0$) is $ET_0=\\dfrac{{0.408\\Delta R_n+\\gamma\\frac{{900}}{{T+273}}u_2(e_s-e_a)}}{{\\Delta+\\gamma(1+0.34u_2)}}$. For $T=28$ \\textdegree C, $R_n=18$ MJ m$^{{-2}}$ d$^{{-1}}$, $u_2=2$ m s$^{{-1}}$, $\\mathrm{{RH}}=45$ per cent and $\\gamma=0.0674$ kPa \\textdegree C$^{{-1}}$, compute it.

\\textbf{{Solution.}} $e_s=0.6108\\exp(17.27\\times28/265.3)={es:.3f}$ kPa; $e_a=0.45\\,e_s={ea:.3f}$ kPa; $\\Delta=4098\\,e_s/(T+237.3)^2={D:.4f}$ kPa \\textdegree C$^{{-1}}$. Radiation term: $0.408\\times{D:.4f}\\times18={0.408*D*18:.3f}$. Aerodynamic term: $0.0674\\times900/301\\times2\\times({es-ea:.3f})={0.0674*900/301*2*(es-ea):.3f}$. Denominator: ${D:.4f}+0.0674(1+0.68)={D+0.0674*1.68:.4f}$. So $ET_0={v:.2f}$ mm d$^{{-1}}$ (about {100*0.408*D*18/(D+0.0674*1.68)/v/1:.0f} per cent from radiation)."""
w(ex("reference evapotranspiration of the day (P.2)",body))
# P.3-P.5
k=0.55;RUE=3.0;PAR=10.0;fT=0.9;fN=0.95;fsal=1.0
rows=[]
for LAI in [0.5,1,2,3,4,5]:
    fi=1-math.exp(-k*LAI);dWr=RUE*fT*fN*fsal*PAR*fi
    rows.append([LAI,f"{fi:.3f}",f"{dWr:.2f}"])
Tact=3.5;kte=8.0;VPD=1.8 # kte in Pa; VPD kPa -> g per kg water ... dWwat = kte/VPD * Tact (g/m2 per mm): kte Pa=0.008 kPa ... 
dWw=(kte/ (VPD*1000))*1000*Tact # g m-2 : (kte/VPD) in g/kg of water -> per mm = kg/m2
body=r"""Take $k=0.55$, RUE $=3.0$ g MJ$^{-1}$ PAR (assumed), $f_T=0.90$, $f_N=0.95$, $f_{\rm sal}=1$, PAR $=10$ MJ m$^{-2}$. Compute the light interception $f_i=1-e^{-k\,\mathrm{LAI}}$ and the radiation-limited growth $dW_{\rm rad}=\mathrm{RUE}f_Tf_Nf_{\rm sal}\mathrm{PAR}\,f_i$ for LAI $=0.5,\dots,5$. Then the water-limited growth $dW_{\rm wat}=(k_{te}/\mathrm{VPD})T_{\rm act}$ for $k_{te}=8$ Pa, VPD $=1.8$ kPa, $T_{\rm act}=3.5$ mm.

\textbf{Solution.} For LAI $=3$: $f_i=1-e^{-1.65}=0.808$, so $dW_{\rm rad}=3.0\times0.9\times0.95\times10\times0.808=20.7$ g m$^{-2}$ d$^{-1}$. Table~\ref{tab:rad} gives the others. For the water limit, $k_{te}/\mathrm{VPD}=8\ \mathrm{Pa}/1800\ \mathrm{Pa}=0.00444$ kg dry matter per kg water, and 3.5 mm of transpiration is 3.5 kg m$^{-2}$, so $dW_{\rm wat}=0.00444\times3.5=0.01556$ kg m$^{-2}$ $=15.6$ g m$^{-2}$. Growth is the smaller of the two, $dW=\min(dW_{\rm rad},dW_{\rm wat})$: for LAI $\le2$ light is limiting ($\le""" 
body+=f"{RUE*fT*fN*fsal*PAR*(1-math.exp(-k*2)):.1f}"+r"""$ g m$^{-2}$ d$^{-1}$ at LAI 2), for LAI $\ge3$ the 15.6 g of water limits it."""
body+=tab(["LAI","$f_i$","$dW_{\\rm rad}$ (g m$^{-2}$ d$^{-1}$)"],rows,"Light interception and radiation-limited growth.","tab:rad")
w(ex("growth from light and from water (P.3 to P.5)",body))
w(r"""\section{Soil water, leaf water and stomata (P.6 to P.10)}""")
# P.8
def psi_of(RWC,pi0,tlp):
    P=-pi0*(RWC-tlp)/(1-tlp) if RWC>tlp else 0.0
    return pi0/RWC+P
pi0=-1.2;tlp=0.80
rows=[[f"{r:.2f}",f"{pi0/r:.3f}",f"{(-pi0*(r-tlp)/(1-tlp) if r>tlp else 0):.3f}",f"{psi_of(r,pi0,tlp):.3f}"] for r in [1.0,0.95,0.9,0.85,0.8,0.75,0.7]]
lo,hi=0.5,1.0
for _ in range(60):
    mid=(lo+hi)/2
    if psi_of(mid,pi0,tlp)<-1.5: lo=mid
    else: hi=mid
body=r"""$\psi=\pi_0/\mathrm{RWC}+P(\mathrm{RWC})$ with turgor $P(\mathrm{RWC})=-\pi_0(\mathrm{RWC}-\mathrm{RWC}_{\rm tlp})/(1-\mathrm{RWC}_{\rm tlp})$ above the turgor-loss point and $0$ below it. With $\pi_0=-1.2$ MPa and $\mathrm{RWC}_{\rm tlp}=0.80$ (assumed), tabulate $\psi$ against RWC and solve for the RWC at $\psi_{\rm leaf}=-1.5$ MPa. Also find $\psi_{\rm leaf}=\psi_{\rm root}-rT_{\rm act}/\mathrm{LAI}$ for $\psi_{\rm root}=-0.4$ MPa, $r=0.25$, $T_{\rm act}=4$ mm, LAI $=2$.

\textbf{Solution.} At RWC $=0.9$: $\pi=-1.2/0.9=-1.333$; $P=1.2(0.9-0.8)/0.2=0.6$; $\psi=-0.733$ MPa. Table~\ref{tab:rwc} gives the others. At $\psi=-1.5$ the bisection returns \textbf{RWC}"""
body+=f" $={0.5*(lo+hi):.3f}$ (exactly the turgor-loss point: there $P=0$ and $\\psi=\\pi_0/\\mathrm{{RWC}}=-1.2/0.8=-1.5$ MPa). Flow through the plant: $\\psi_{{\\rm leaf}}=-0.4-0.25\\times4/2=-0.9$ MPa, which corresponds to RWC $\\approx$ {0.5*(lo+hi):.2f}...".replace("$\\approx$ "+f"{0.5*(lo+hi):.2f}"+"...","$\\approx0.87$.")
body+=tab(["RWC","$\\pi_0/\\mathrm{RWC}$","$P$","$\\psi$ (MPa)"],rows,"Pressure--volume curve of the leaf.","tab:rwc")
w(ex("leaf water potential and relative water content (P.8)",body))
# fix: compute RWC at -0.9
lo2,hi2=0.8,1.0
for _ in range(60):
    mid=(lo2+hi2)/2
    if psi_of(mid,pi0,tlp)<-0.9: lo2=mid
    else: hi2=mid
O[-1]=O[-1].replace("$\\approx0.87$",f"$={0.5*(lo2+hi2):.3f}$")
# P.9 stomata
rows=[]
for psi in [-0.5,-1.0,-1.5,-2.0,-2.5]:
    r=[psi]
    for p50,b in [(-1.5,3.0),(-1.0,3.0),(-2.0,3.0)]:
        r.append(f"{1/(1+math.exp(-b*(psi-p50))):.3f}")
    rows.append(r)
body=r"""The stomatal opening is $g_s=1/[1+e^{-b(\psi_{\rm leaf}-\psi_{50})}]$. With steepness $b=3$ MPa$^{-1}$ (assumed), compute $g_s$ for $\psi_{\rm leaf}=-0.5,\dots,-2.5$ and three genotypes: $\psi_{50}=-1.5$ (standard), $-1.0$ (a water saver that closes early) and $-2.0$ (a spender).

\textbf{Solution.} For the standard genotype at $-1.0$ MPa: $g_s=1/(1+e^{-3(-1.0+1.5)})=1/(1+e^{-1.5})=0.818$. At $\psi_{50}$ the opening is exactly 0.5. Table~\ref{tab:gs} lists all; at $-1.5$ MPa the water saver has $g_s=1/(1+e^{1.5})=0.182$ against $0.5$ for the standard genotype, so its transpiration demand is cut to $36$ per cent of the standard one at that potential, which saves water but also growth."""
body+=tab(["$\\psi_{\\rm leaf}$","$\\psi_{50}=-1.5$","$\\psi_{50}=-1.0$","$\\psi_{50}=-2.0$"],rows,"Stomatal opening of three genotypes.","tab:gs")
w(ex("stomata (P.9)",body))
# P.10 expansion
body=r"""Expansion is $\frac1V\frac{dV}{dt}=\varphi\max(0,P-Y)$. With $\varphi=0.4$ d$^{-1}$ MPa$^{-1}$, yield threshold $Y=0.3$ MPa (assumed) and the turgor of the pressure--volume curve above ($P=0.9$ MPa at RWC 0.95$\ldots$ here use RWC $=0.9$, $P=0.6$ MPa; RWC $=0.85$, $P=0.3$ MPa), find the relative growth rate and the leaf-area doubling time.

\textbf{Solution.} RWC $0.95$: $P=1.2(0.15)/0.2=0.9$, rate $=0.4(0.9-0.3)=0.24$ d$^{-1}$, doubling time $\ln2/0.24=2.89$ d. RWC $0.90$: $0.4(0.6-0.3)=0.12$ d$^{-1}$, $5.78$ d. RWC $0.85$: $P=0.3=Y$, rate $0$: growth stops, although the leaf still holds $85$ per cent of its water and the stomata are partly open. Because turgor falls before photosynthesis does, area and height slow first."""
body=body.replace("$P=0.9$ MPa at RWC 0.95$\\ldots$ here use RWC $=0.9$, $P=0.6$ MPa; RWC $=0.85$, $P=0.3$ MPa","")
w(ex("expansion growth (P.10)",body))
# P.11 CWSI
Ta=30;Rn=400;ra=40;rho_cp=1200;gam=0.0674;D=Delta(Ta);VPD=2.0
def dT(rc):
    gs=gam*(1+rc/ra);return ra*Rn/rho_cp*gs/(D+gs)-VPD/(D+gs)
dlow=dT(0.0)  # fully transpiring: rc ~0
dup=dT(1e6)
rows=[]
for rc in [0,50,100,200,500]:
    d=dT(rc);rows.append([rc,f"{d:.2f}",f"{(d-dlow)/(dup-dlow):.3f}"])
body=f"""The canopy--air temperature difference is $T_c-T_a=\\dfrac{{r_aR_n}}{{\\rho c_p}}\\dfrac{{\\gamma^*}}{{\\Delta+\\gamma^*}}-\\dfrac{{\\mathrm{{VPD}}}}{{\\Delta+\\gamma^*}}$ with $\\gamma^*=\\gamma(1+r_c/r_a)$, and CWSI $=(dT-dT_{{\\rm low}})/(dT_{{\\rm up}}-dT_{{\\rm low}})$. Take $T_a=30$ \\textdegree C ($\\Delta={D:.4f}$ kPa K$^{{-1}}$), $R_n=400$ W m$^{{-2}}$, $r_a=40$ s m$^{{-1}}$, $\\rho c_p=1200$ J m$^{{-3}}$ K$^{{-1}}$, $\\mathrm{{VPD}}=2.0$ kPa, $\\gamma=0.0674$. Find $T_c-T_a$ for canopy resistances $r_c=0,50,100,200,500$ s m$^{{-1}}$ and the CWSI.

\\textbf{{Solution.}} Limits: a transpiring canopy ($r_c=0$, $\\gamma^*=\\gamma$): $dT_{{\\rm low}}={dlow:.2f}$ K; a non-transpiring one ($r_c\\to\\infty$, $\\gamma^*\\to\\infty$): $dT_{{\\rm up}}=r_aR_n/(\\rho c_p)={dup:.2f}$ K. For $r_c=100$: $\\gamma^*=0.0674\\times3.5=0.2359$, so $dT={ra*Rn/rho_cp:.2f}\\times0.2359/({D:.4f}+0.2359)-2.0/({D:.4f}+0.2359)={dT(100):.2f}$ K. Table~\\ref{{tab:cwsi}} lists the others. The canopy temperature depression is $T_a-T_c=-dT$, positive for a canopy cooler than the air."""
body+=tab(["$r_c$ (s m$^{-1}$)","$T_c-T_a$ (K)","CWSI"],rows,"Canopy temperature difference and stress index.","tab:cwsi")
w(ex("canopy temperature and CWSI (P.11)",body))
w(r"""\section{Carbon, roots and soil strength (P.12 to P.14)}""")
def fr(fr0,frA,stage,croot,ws): return min(0.7,max(0.03,(fr0+(frA-fr0)*stage)*croot*(1+0.9*ws)))
rows=[]
for stage in [0,0.5,1.0]:
    for Ta_,Tp in [(4.0,4.0),(3.0,4.0),(2.0,4.0)]:
        ws=1-Ta_/Tp;rows.append([stage,f"{Ta_/Tp:.2f}",f"{ws:.2f}",f"{fr(0.42,0.07,stage,1.0,ws):.3f}"])
body=r"""The share of new carbon that goes to the roots is $f_r=\mathrm{clip}\bigl[(f_{r0}+(f_{rA}-f_{r0})\,\mathrm{stage})\,c_{\rm root}(1+0.9w_s),\,0.03,\,0.7\bigr]$ with $w_s=1-T_{\rm act}/T_p$. Wheat: $f_{r0}=0.42$, $f_{rA}=0.07$. Take $c_{\rm root}=1$ and find $f_r$ at stage $0,0.5,1$ for $T_{\rm act}/T_p=1,0.75,0.5$.

\textbf{Solution.} Stage $0.5$ and $T_{\rm act}/T_p=0.75$: base $0.42+(0.07-0.42)(0.5)=0.245$; stress $w_s=0.25$, factor $1+0.225=1.225$; so $f_r=0.245\times1.225=0.300$. The results are in Table~\ref{tab:fr}. Water shortage raises the root share (up to 45 per cent more at $T_{\rm act}/T_p=0.5$) and the stage lowers it: functional equilibrium."""
body+=tab(["Stage","$T_{\\rm act}/T_p$","$w_s$","$f_r$"],rows,"Carbon share to roots.","tab:fr")
w(ex("carbon to the roots (P.12)",body))
rows=[]
for rb in [1.2,1.3,1.4,1.5,1.6,1.7]:
    for S in [0.9,0.6]:
        Q=0.5*math.exp(4.5*(rb-1.3))*(1+(1-S));rel=1/(1+(Q/2.5)**3)
        rows.append([rb,S,f"{Q:.3f}",f"{rel:.3f}"])
body=r"""Soil strength is $Q=0.5\,e^{4.5(\rho_b-1.3)}[1+(1-S)]$ (MPa) and the relative elongation is $e/e_0=1/[1+(Q/2.5)^3]$. Compute both for bulk densities $1.2$ to $1.7$ g cm$^{-3}$ at relative water content $S=0.9$ and $0.6$, and find the bulk density that halves the elongation at $S=0.6$.

\textbf{Solution.} For $\rho_b=1.5$, $S=0.6$: $Q=0.5e^{0.9}(1.4)=0.5(2.4596)(1.4)=1.722$ MPa; $e/e_0=1/(1+(0.6887)^3)=1/(1.3267)=0.754$. Table~\ref{tab:Q} lists the rest. Halving requires $Q=2.5$: $0.5e^{4.5(\rho_b-1.3)}(1.4)=2.5$, $e^{4.5(\rho_b-1.3)}=3.571$, $\rho_b-1.3=\ln3.571/4.5=0.2831$, so $\rho_b=1.583$ g cm$^{-3}$. Drying the soil to $S=0.6$ from $0.9$ raises $Q$ by 27 per cent (factor $1.4/1.1$), as strength rises when the soil dries."""
body+=tab(["$\\rho_b$","$S$","$Q$ (MPa)","$e/e_0$"],rows,"Soil strength and root elongation.","tab:Q")
w(ex("soil strength and root elongation (P.14)",body))
body=r"""Root tip elongation is $\dfrac{dl}{dt}=e_0\,2^{(T_s-20)/10}\Bigl(\dfrac e{e_0}\Bigr)f_wf_{\rm age}$ with $f_w=\mathrm{clip}\bigl((\theta_{\rm rel}-0.06)/0.5;0.05,1\bigr)$. For an axis with $e_0=2.5$ cm d$^{-1}$ at $T_s=16$ \textdegree C, $\theta_{\rm rel}=0.5$, $e/e_0=0.754$ and $f_{\rm age}=0.8$, find the elongation and the time to reach 60 cm.

\textbf{Solution.} Temperature factor $2^{-0.4}=0.758$; $f_w=(0.5-0.06)/0.5=0.88$. Elongation: $2.5\times0.758\times0.754\times0.88\times0.8=1.006$ cm d$^{-1}$, so a tip needs about 60 days to reach 60 cm at these conditions; in the wetter, looser soil ($e/e_0=1$, $f_w=1$, $T_s=20$) the same axis would need $60/(2.5\times0.8)=30$ days."""
w(ex("root elongation (P.13)",body))
w(r"""\section{Irrigation, mulch, nitrogen and salt in the plant (P.15 to P.19)}""")
body=r"""Irrigation (P.16): if the sensor suction $h_s\ge h_{\rm trig}$ and the minimum interval has passed, the root zone is refilled to field capacity, $d_{\rm net}=\min(\sum(\theta_{fc}-\theta_z)\Delta z,D_{\max})$, and the gross depth is $I=d_{\rm net}/E_a$. The sprinkler has minimum interval 2 d, $D_{\max}=35$ mm, $E_a=0.75$; surface 3 d, $60$ mm, $0.60$; drip 1 d, 10 mm, $0.90$. Eight layers of $\Delta z=15$ cm have deficits $\theta_{fc}-\theta_z=0.02,0.03,0.04,0.05,0.05,0.04,0.03,0.02$. Find the net and gross depth for each method.

\textbf{Solution.} The total deficit is $\sum(\theta_{fc}-\theta_z)\Delta z=15(0.02+0.03+0.04+0.05+0.05+0.04+0.03+0.02)=15(0.28)=4.2$ cm $=42$ mm. Sprinkler: $d_{\rm net}=\min(42,35)=35$ mm, $I=35/0.75=46.7$ mm. Surface: $\min(42,60)=42$ mm, $I=42/0.60=70$ mm. Drip: $\min(42,10)=10$ mm, $I=10/0.90=11.1$ mm per event (and the drip line waters only when the layer at the emitter depth is at least 12 per cent depleted). The surface method needs 70 mm per event against 46.7 for the sprinkler for the same deficit; a drip system needs about four small events to replace the same deficit."""
w(ex("project irrigation event (P.16)",body))
body=r"""Mulch (P.17) gives $E_p'=f_mE_p$ and $P'=\max(0,P-C_m)$. For $f_m=0.4$, $C_m=2$ mm and a day with $E_p=4.5$ mm and a rain event of $P=1.5$, $4$ and $12$ mm, find the soil evaporation and the effective rain.

\textbf{Solution.} $E_p'=0.4\times4.5=1.8$ mm. $P'=\max(0,1.5-2)=0$ for the 1.5 mm event (the mulch keeps all of it), $2.0$ mm for the 4 mm event, $10.0$ mm for the 12 mm. Over a season with many small events the interception can be substantial: if the rain of 90 events of mean depth 1.5 mm (135 mm) never exceeds $C_m$, none of it reaches the soil."""
w(ex("mulch (P.17)",body))
# P.19 salt ODE
V=2*100.0 # mm? assume PAW of column 100 mm -> V=200 mm... use consistent mm
def salt(I,ECw,P,D,days=60,C0=1.0,V=200.0):
    C=C0;out=[]
    for d in range(days):
        C+= (I*ECw+0.05*P-D*C/2)/V if False else (I*ECw+0.05*P*0 - D*C)/V
        out.append(C)
    return out
# steady state C*=I*ECw/D  (with 0.05P ignoring)
I_,D_,ECw_,P_=4.0,1.5,2.0,0.0
Cs=[1.0];V=200.0
for d in range(1,61):
    Cs.append(Cs[-1]+(I_*ECw_+0.05*P_-D_*Cs[-1])/V)
Css=(I_*ECw_)/D_
body=f"""The root-zone solution of volume $V$ (twice the plant-available water of the column) follows $V\\,dC/dt=I\\,EC_w+0.05P-DC$, $EC_e=C/2$, $f_{{\\rm sal}}=1-\\frac s{{100}}\\max(0,EC_e-EC_{{\\rm th}})$, $\\psi_{{\\rm soil}}\\leftarrow\\psi_{{\\rm soil}}-0.036EC_e$. With $V=200$ mm (assumed), a daily irrigation of $I=4$ mm of $EC_w=2$ dS m$^{{-1}}$, no rain, a drainage of $D=1.5$ mm d$^{{-1}}$ and an initial $C=1$, integrate by daily steps and find the steady state; for wheat ($EC_{{\\rm th}}=6$, $s=7.1$) compute $f_{{\\rm sal}}$.

\\textbf{{Solution.}} One step: $C_1=1+(4\\times2-1.5\\times1)/200=1.0325$. The steady state sets the right-hand side to zero: $C^*=I\\,EC_w/D=8/1.5={Css:.2f}$ dS m$^{{-1}}$, so $EC_e={Css/2:.2f}$. The relaxation time is $V/D=200/1.5=133$ days, so after 60 days $C={Cs[-1]:.2f}$ (the analytic $C(t)=C^*-(C^*-C_0)e^{{-Dt/V}}={Css-(Css-1)*math.exp(-D*60/V):.2f}$ agrees). At $C^*$, $EC_e={Css/2:.2f}$ is below the threshold 6, so $f_{{\\rm sal}}=1$ and the osmotic term is $-0.036\\times{Css/2:.2f}=-{0.036*Css/2:.3f}$ MPa. If the drainage is cut to $0.3$ mm d$^{{-1}}$: $C^*=26.7$, $EC_e=13.3$, $f_{{\\rm sal}}=1-0.071(13.3-6)={1-0.071*(13.33-6):.2f}$, a loss of {100*0.071*(13.33-6):.0f} per cent."""
w(ex("salt in the root zone (P.19)",body))
open('/tmp/book/p2h.tex','w').write("\n".join(O))
