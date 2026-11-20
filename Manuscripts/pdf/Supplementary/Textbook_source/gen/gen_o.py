import sys,math
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
from crop import *
import eng2
O=[];w=O.append
def T(_s,**kw):
    for k,v in kw.items(): _s=_s.replace('@'+k+'@',str(v))
    return _s
et0,rain=weather()
s_=SOIL['S06'];AWC=s_[3];fT=fdep(s_[1],s_[2],300)
w(r"""\chapter{Crop library and crop water requirement}\label{ch:crops}
\markboth{Crop water requirement}{Crop water requirement}
\textbf{After this chapter you can} build the four-stage crop-coefficient curve, turn it into a daily crop water need, grow the root zone, compute readily available water and the stress coefficient, run the FAO-56 daily balance with the trigger, convert net depths to gross by the method efficiency, estimate the relative yield from the yield response factor, and carry a library crop into the cereal-based annual model.

\textit{Illustrative climate used throughout.} The chapter uses a synthetic year so that every number can be reproduced: reference evapotranspiration $ET_0=4.0+2.0\sin[2\pi(d-100)/365]$ mm d$^{-1}$ with a small seeded noise (mean 4 mm d$^{-1}$, 1,460 mm per year), and rain on 25\% of the days with exponential depths of mean 8.2 mm (about 600 mm per year; seed 7). The soil is the loam with $\mathrm{AWC}=1.7$ mm cm$^{-1}$ and the trigger suction $-300$ cm, which corresponds to the depletion fraction $f_T=0.468$ of total available water (Eq.~5.3). Planting is on day 100.
""")
w(r"\section{The crop-coefficient curve}"+"\n"+r"""\begin{equation}K_c(t)=\begin{cases}K_{c,\rm ini}&t<L_1\\K_{c,\rm ini}+(K_{c,\rm mid}-K_{c,\rm ini})\dfrac{t-L_1}{L_2}&L_1\le t<L_1+L_2\\K_{c,\rm mid}&L_1+L_2\le t<L_1+L_2+L_3\\K_{c,\rm mid}+(K_{c,\rm end}-K_{c,\rm mid})\min\!\Big(1,\dfrac{t-L_1-L_2-L_3}{L_4}\Big)&\text{after}\end{cases}\end{equation}
with $t$ days after planting and stage lengths $L_1\ldots L_4$ (initial, development, mid-season, late). Outside the season the bare soil has $K_c=0.25$ (the FAO-56 single-coefficient curve).
""")
c=CROPS['Maize']
ts=[0,10,14,15,30,44,45,60,85,90,95,105]
rows=[[t,fx(kc_t(c,t),3)] for t in (0,10,15,30,44,45,60,85,90,95,104,105)]
body=T(r"""Maize: $K_{c,\rm ini}=0.30$, $K_{c,\rm mid}=1.20$, $K_{c,\rm end}=0.60$; stages $15/30/40/20$ d. Find $K_c$ at $t=10,\,30,\,60,\,95$ d.

\textbf{Solution.} $t=10<15$: $K_c=0.30$. $t=30$ lies in the development stage ($15\le30<45$): $K_c=0.30+0.90\times(30-15)/30=0.30+0.45=@k30@$. $t=60$ lies in the mid-season ($45\le60<85$): $K_c=1.20$. $t=95$ is in the late season ($85\le95<105$): $K_c=1.20+(0.60-1.20)\times(95-85)/20=1.20-0.30=@k95@$.""",k30=fx(kc_t(c,30),2),k95=fx(kc_t(c,95),2))
w(ex("reading the curve",body))
body=T(r"""The daily need is $ET_c=K_cET_0$. On a day with $ET_0=5.2$ mm d$^{-1}$ find $ET_c$ of maize at $t=30$ and $t=60$, and the total need of the development stage if $ET_0$ stays at 5.2.

\textbf{Solution.} $t=30$: $0.75\times5.2=3.90$ mm. $t=60$: $1.20\times5.2=6.24$ mm. The development stage covers $t=15\ldots44$, $K_c$ rising linearly from 0.30 to 1.20; its mean is 0.75 (the average of the end points), so the need is $30\times0.75\times5.2=@d@$ mm.""",d=fx(30*0.75*5.2,1))
w(ex("daily crop need",body))
# root and TAW
w(r"\section{Roots, total and readily available water, and stress}"+"\n"+r"""The roots of an annual crop grow with the canopy,
\begin{equation}z_r=\mathrm{clip}\Big(15+(R_{\max}-15)\min\Big(1,\frac{1.15K_c}{\max(0.3,K_{c,\rm mid})}\Big);\,15,R_{\max}\Big)\ \text{cm},\quad R_{\max}\le100,\end{equation}
and the total and readily available water follow FAO-56:
\begin{equation}\mathrm{TAW}=\mathrm{AWC}\,z_r,\quad p_d=\mathrm{clip}\{p+0.04(5-K_cET_0);0.1,0.8\},\quad \mathrm{RAW}=p_d\mathrm{TAW},\quad K_s=\begin{cases}1&D_r\le\mathrm{RAW}\\\dfrac{\mathrm{TAW}-D_r}{(1-p_d)\mathrm{TAW}}&D_r>\mathrm{RAW}\end{cases}\end{equation}
and $ET_a=K_sET_c$. The depletion $D_r$ changes by $D_{r,d}=D_{r,d-1}-(P_d-RO_d)+ET_{a,d}$ with $RO_d=0.3\max(0,P_d-35)$, and a negative $D_r$ drains below the roots. Irrigation refills the root zone to field capacity on the day the depletion reaches the trigger, $D_r\ge f_T\mathrm{TAW}$: the net depth is $I_n=D_r$ and the gross depth $I=I_n/E_{a,m}$ with $E_{a,m}=0.60$ (surface), 0.75 (overhead), 0.90 (drip).
""")
Rm=min(135,100)
def zr(Kc,km,Rm): return min(Rm,max(15,15+(Rm-15)*min(1,1.15*Kc/max(0.3,km))))
body=T(r"""Maize ($R_{\max}=135$ cm, capped at 100 cm by the model profile; $p=0.50$) on the loam (AWC $=1.7$ mm cm$^{-1}$). At $t=30$ ($K_c=0.75$) with $ET_0=5.2$ mm d$^{-1}$, find $z_r$, TAW, $p_d$, RAW, and $K_s$ when $D_r=40$ mm and when $D_r=55$ mm.

\textbf{Solution.} $1.15K_c/\max(0.3,1.20)=1.15\times0.75/1.20=0.719$; $z_r=15+85\times0.719=@zr@$ cm. TAW $=1.7\times@zr@=@taw@$ mm. $p_d=0.50+0.04(5-0.75\times5.2)=0.50+0.04\times1.1=@pd@$; RAW $=@pd@\times@taw@=@raw@$ mm. With $D_r=40\le$ RAW: $K_s=1$. With $D_r=55>$ RAW: $K_s=(@taw@-55)/((1-@pd@)\times@taw@)=@n@/@dn@=@ks@$.""",
zr=fx(zr(0.75,1.2,100),1),taw=fx(AWC*zr(0.75,1.2,100),1),pd=fx(0.5+0.04*(5-0.75*5.2),3),raw=fx((0.5+0.04*(5-0.75*5.2))*AWC*zr(0.75,1.2,100),1),
n=fx(AWC*zr(0.75,1.2,100)-55,1),dn=fx((1-(0.5+0.04*(5-0.75*5.2)))*AWC*zr(0.75,1.2,100),1),ks=fx((AWC*zr(0.75,1.2,100)-55)/((1-(0.5+0.04*(5-0.75*5.2)))*AWC*zr(0.75,1.2,100)),3))
w(ex("TAW, RAW and the stress coefficient",body))
rows=[]
for t in (0,10,20,30,45,60,85,104):
    Kc=kc_t(c,t);z=zr(Kc,1.2,100);pdv=min(0.8,max(0.1,0.5+0.04*(5-Kc*4.5)))
    rows.append([t,fx(Kc,2),fx(z,1),fx(AWC*z,1),fx(pdv,3),fx(pdv*AWC*z,1)])
w(tab(["$t$ (d)","$K_c$","$z_r$ (cm)","TAW (mm)","$p_d$","RAW (mm)"],rows,"Growth of the maize root zone on the loam ($ET_0=4.5$ mm d$^{-1}$ in $p_d$).","tab:roots"))
# season run maize
r=season('Maize',AWC,fT,et0,rain,100,'surface')
rows=[[k,fx(b,1),fx(inn/ 1,1) if False else fx(inn,1),fx(ii,1)] for k,inn,ii in [(a[0],a[1],a[2]) for a in r['irr']] for b in [0]]
rows=[[a[0],100+a[0],fx(a[1],1),fx(a[2],1)] for a in r['irr']]
w(r"\section{A season of maize}"+"\n"+r"""Running the balance day by day from planting gives the irrigations of the season. Table~\ref{tab:maizeirr} lists them for surface irrigation ($E_{a,m}=0.60$).
""")
w(tab(["day after planting","day of year","net $I_n$ (mm)","gross $I$ (mm)"],rows,"Irrigations of maize on the loam, trigger $-300$ cm, surface irrigation.","tab:maizeirr"))
# hand 3 days first irrigation window
first=r['irr'][0][0]
i0=first-3
body_rows=r['rows'][i0-1:first]
lines=[]
for rw in body_rows:
    k,Kc,E0,z,TAW,RAW,Ks,ETc,ETa,P,RO,Dr,In=rw
    lines.append(f"day {k}: $K_c={Kc:.3f}$, $ET_0={E0:.2f}$, $ET_c={ETc:.2f}$, $z_r={z:.1f}$, TAW $={TAW:.1f}$, RAW $={RAW:.1f}$, $K_s={Ks:.3f}$, $ET_a={ETa:.2f}$, $P={P:.1f}$, $D_r={Dr:.2f}$ mm, $I_n={In:.1f}$")
prev=r['rows'][i0-2][11] if i0-2>=0 else 0.0
body=T(r"""Follow the four days up to the first irrigation of Table~\ref{tab:maizeirr}.

\textbf{Solution.} The depletion on the day before is $D_r=@prev@$ mm. Each day: $D_r\leftarrow D_r-(P-RO)+ET_a$.
\begin{itemize}
@items@
\end{itemize}
The trigger depletion is $f_T\mathrm{TAW}=0.468\times@TAW@=@trig@$ mm. On the last day $D_r$ reaches that value, so the layer irrigates the net depth $I_n=D_r=@In@$ mm and the root zone returns to field capacity ($D_r=0$). The gross depth for surface irrigation is $@In@/0.60=@g@$ mm.""",
prev=fx(prev,2),items="\n".join(r"\item "+l for l in lines),TAW=fx(body_rows[-1][4],1),trig=fx(fT*body_rows[-1][4],1),In=fx(body_rows[-1][12],1),g=fx(body_rows[-1][12]/0.6,1))
w(ex("four days to an irrigation",body))
# method efficiencies
rows=[]
for m in ('surface','overhead','drip'):
    rm=season('Maize',AWC,fT,et0,rain,100,m);rows.append([m,fx(EFF[m],2),len(rm['irr']),fx(rm['In'],0),fx(rm['I'],0),fx(rm['I']-rm['In'],0)])
w(tab(["Method","$E_{a,m}$","irrigations","net (mm)","gross (mm)","lost (mm)"],rows,"The same season under three methods.","tab:method"))
body=T(r"""From Table~\ref{tab:method}, what does moving from surface to drip save in water per hectare?

\textbf{Solution.} Net need is the same in both (@n@ mm); gross falls from @gs@ mm to @gd@ mm, a saving of @sv@ mm $=@vol@$ m$^3$ ha$^{-1}$ (1 mm over 1 ha is 10 m$^3$). The saving is the difference of the losses: $@n@(1/0.60-1/0.90)=@chk@$ mm.""",n=fx(rows[0][3] if False else season('Maize',AWC,fT,et0,rain,100,'surface')['In'],0),gs=fx(season('Maize',AWC,fT,et0,rain,100,'surface')['I'],0),gd=fx(season('Maize',AWC,fT,et0,rain,100,'drip')['I'],0),sv=fx(season('Maize',AWC,fT,et0,rain,100,'surface')['I']-season('Maize',AWC,fT,et0,rain,100,'drip')['I'],0),vol=fx(10*(season('Maize',AWC,fT,et0,rain,100,'surface')['I']-season('Maize',AWC,fT,et0,rain,100,'drip')['I']),0),chk=fx(season('Maize',AWC,fT,et0,rain,100,'surface')['In']*(1/0.6-1/0.9),0))
w(ex("what the method saves",body))
# yield
w(r"\section{Relative yield}"+"\n"+r"""The relative yield of a season is the FAO-33 response
\begin{equation}Y_{\rm rel}=\mathrm{clip}\Big(1-K_y\Big(1-\frac{\sum ET_a}{\sum ET_c}\Big);0,1\Big),\end{equation}
with $K_y=1$ when the crop has no tabulated value.
""")
rows=[]
trs=[50,100,200,300,500,800,1500,5000,50000]
for tr in trs:
    f=fdep(s_[1],s_[2],tr);rs=season('Maize',AWC,f,et0,rain,100,'surface');rows.append([tr,fx(f,3),len(rs['irr']),fx(rs['I'],0),fx(rs['ETa'],0),fx(rs['ETa']/rs['ETc'],3),fx(rs['Yrel'],3)])
w(tab(["trigger (cm)","$f_T$","irrigations","gross (mm)","$\\sum ET_a$","$\\sum ET_a/\\sum ET_c$","$Y_{\\rm rel}$"],rows,"Maize on the loam at different triggers (surface irrigation, synthetic year).","tab:trig"))
rain_only=season('Maize',AWC,1.01,et0,rain,100,'surface',trigger=False)
body=T(r"""Compute $Y_{\rm rel}$ of maize with no irrigation, $K_y=1.28$.

\textbf{Solution.} With rain only, the season has $\sum ET_c=@c@$ mm and $\sum ET_a=@a@$ mm, so the ratio is $@r@$. $Y_{\rm rel}=1-1.28\times(1-@r@)=@y@$. A deficit of @d@\% of the crop need becomes a yield loss of @yl@\%, because $K_y>1$ (maize is sensitive). A tolerant crop such as groundnut ($K_y=0.70$) would lose only @yg@\% for the same deficit.""",c=fx(rain_only['ETc'],0),a=fx(rain_only['ETa'],0),r=fx(rain_only['ETa']/rain_only['ETc'],3),y=fx(rain_only['Yrel'],3),d=fx(100*(1-rain_only['ETa']/rain_only['ETc']),1),yl=fx(100*(1-rain_only['Yrel']),1),yg=fx(100*0.70*(1-rain_only['ETa']/rain_only['ETc']),1))
w(ex("rainfed maize",body))
w(r"\begin{keybox}Table~\ref{tab:trig} shows the same shape as the manuscript trigger experiment (Chapter~\ref{ch:e2}): yield is flat over a wide range of wet triggers, then falls as the trigger goes drier, while the gross irrigation falls overall (not strictly at every step, because a wetter trigger irrigates earlier and rain refills part of the root zone). At the wettest triggers ($f_T=0$) the rule irrigates every day, which is the model's limit of continuous irrigation. The numbers come from a synthetic climate, so they differ from the manuscript's; the shape is the point.\end{keybox}")
# library comparison
w(r"\section{Every crop on one soil}"+"\n"+r"""Table~\ref{tab:lib} runs the balance for twelve library crops of Table~21.2 of the manual on the same loam, weather, trigger ($-300$ cm) and method (surface), planting on day 100.
""")
rows=[]
lib={}
for cn in CROPS:
    if cn=='Reference': continue
    c_=CROPS[cn];rr=season(cn,AWC,fT,et0,rain,100,'surface');lib[cn]=rr
    rows.append([cn,fx(c_[0],2),fx(c_[1],2),fx(c_[2],2),rr['Lt'],fx(rr['ETc'],0),fx(rr['In'],0),len(rr['irr']),fx(c_[7],2),fx(rr['Yrel'],3)])
w(tab(["Crop","$K_{c,\\rm ini}$","$K_{c,\\rm mid}$","$K_{c,\\rm end}$","days","$\\sum ET_c$","net","irr.","$K_y$","$Y_{\\rm rel}$"],rows,"Twelve crops on the loam (synthetic year, surface method).","tab:lib",spec="lrrrrrrrrr"))
mx=max(lib,key=lambda k:lib[k]['ETc']);mn=min(lib,key=lambda k:lib[k]['ETc']);ly=min(lib,key=lambda k:lib[k]['Yrel'])
body=T(r"""Which crop needs the most water in Table~\ref{tab:lib}, which gets the most irrigations, and why can the two differ?

\textbf{Solution.} The largest seasonal need is @mx@ ($\sum ET_c=@emx@$ mm over @lmx@ days) and the smallest is @mn@ ($@emn@$ mm over @lmn@ days). Need follows the length of the season and the height of $K_c$; the number of irrigations follows the size of the root-zone reservoir instead: @mi@ gets the most irrigations (@nmi@), because its small TAW (shallow roots, $R_{\max}$ = @rmi@ cm) is used up quickly, even though its seasonal need is lower than the largest. The irrigation is also only the part of the need not met by rain and stored water, so it depends on when in the year the crop grows. The lowest relative yield is @ly@ ($Y_{\rm rel}=@yly@$), where the shallow roots and the small $p$ make the root zone run dry between irrigations at this trigger.""",mi=max(lib,key=lambda k:len(lib[k]['irr'])),nmi=len(lib[max(lib,key=lambda k:len(lib[k]['irr']))]['irr']),rmi=CROPS[max(lib,key=lambda k:len(lib[k]['irr']))][5],mx=mx,emx=fx(lib[mx]['ETc'],0),lmx=lib[mx]['Lt'],mn=mn,emn=fx(lib[mn]['ETc'],0),lmn=lib[mn]['Lt'],ly=ly,yly=fx(lib[ly]['Yrel'],3))
w(ex("comparing the crops",body))
# transfer to Engine 1/2 from reference
w(r"\section{Carrying a library crop into the cereal-based model}"+"\n"+r"""The annual model (Chapter~\ref{ch:e2}) is built from cereal runs. A library crop is transferred from it by the ratio of two runs of the balance above on the same soil, weather, trigger and method, one for the crop ($c$) and one for the cereal reference ($r$, small grains $K_c=0.30/1.15/0.25$). With $m$ the annual-model result of the cereal,
\begin{align}I&=\begin{cases}I_m\,\mathrm{clip}(I_c/I_r;0,4)&I_r>5\text{ mm}\\I_c&\text{otherwise}\end{cases}\\
T&=\min\Big(0.9ET,\;T_m\,\mathrm{clip}\Big(\frac{ET_{a,c}}{ET_{c,c}}\cdot\frac{ET_{c,c}}{ET_{c,r}}\Big(\frac{f_{c,c}}{f_{c,r}}\Big)^{0.3};0.2,3\Big)\Big),\qquad E^*=E_m\,\mathrm{clip}\Big(\frac{1-0.7f_{c,c}}{1-0.7f_{c,r}};0.6,1.6\Big)\\
D&=\max(0.2D_m,D_m+0.5(DP_c-DP_r)),\quad ET=\mathrm{clip}(P+I-D-\Delta S_m;50,5000),\quad N_L=N_{L,m}\frac{D+5}{D_m+5}.\end{align}
The remainder of the balance, $ET-T$, is shared between soil evaporation and the other evaporation terms in proportion to their targets ($E_{\rm other}^*=E_{{\rm other},m}ET/ET_m$).
""")
res=eng2.run('S06',300,P=600.,Eyr=170.,Tyr=230.,Ibar=150.,seed=1)
Pm=res['P'];Im=res['I'];Dm=res['D'];Em=res['E'];Tm=res['T'];dSm=0.0
ETm=Pm+Im-Dm-dSm;Eom=max(0,ETm-Tm-Em)
ref=season('Reference',AWC,fT,et0,rain,100,'surface');cr=season('Sorghum',AWC,fT,et0,rain,100,'surface')
fcc,fcr=0.80,0.85
Ic_,Ir_=cr['I'],ref['I']
Inew=Im*min(4,max(0,Ic_/Ir_)) if Ir_>5 else Ic_
ratio=(cr['ETa']/cr['ETc'])*(cr['ETc']/ref['ETc'])*(fcc/fcr)**0.3
Tnew_unc=Tm*min(3,max(0.2,ratio))
Dnew=max(0.2*Dm,Dm+0.5*(cr['DP']-ref['DP']))
ETnew=min(5000,max(50,Pm+Inew-Dnew-dSm))
Tnew=min(0.9*ETnew,Tnew_unc)
Estar=Em*min(1.6,max(0.6,(1-0.7*fcc)/(1-0.7*fcr)))
Eostar=Eom*ETnew/ETm
rest=ETnew-Tnew
Enew=Estar*rest/(Estar+Eostar);Eonew=Eostar*rest/(Estar+Eostar)
NLnew=40.0*(Dnew+5)/(Dm+5)
body=T(r"""The cereal model run of the loam (trigger $-300$ cm, 600 mm rain; Chapter~\ref{ch:e2}) gives $P=@P@$, $I_m=@Im@$, $D_m=@Dm@$, $E_m=@Em@$, $T_m=@Tm@$ mm, so $ET_m=P+I_m-D_m=@ETm@$ mm and $E_{{\rm other},m}=ET_m-T_m-E_m=@Eom@$ mm; assume $\Delta S_m=0$ and $N_{L,m}=40$ kg ha$^{-1}$. Transfer sorghum with ground covers $f_{c,c}=0.80$ and $f_{c,r}=0.85$ (assumed mid-season values). The balances of this chapter give: sorghum $I_c=@Ic@$ mm, $ET_{a,c}/ET_{c,c}=@ec@$, $ET_{c,c}=@etc@$ mm, $DP_c=@dpc@$ mm; reference $I_r=@Ir@$ mm, $ET_{c,r}=@etr@$ mm, $DP_r=@dpr@$ mm.

\textbf{Solution.} \emph{Irrigation:} $I=@Im@\times\mathrm{clip}(@Ic@/@Ir@)=@Im@\times@rat@=@In@$ mm. \emph{Drainage:} $D=\max(0.2\times@Dm@,@Dm@+0.5(@dpc@-@dpr@))=@Dn@$ mm. \emph{Evapotranspiration:} $ET=P+I-D=@P@+@In@-@Dn@=@ETn@$ mm. \emph{Transpiration:} ratio $=@ec@\times(@etc@/@etr@)\times(0.80/0.85)^{0.3}=@tr@$, so $T=\min(0.9\times@ETn@,\,@Tm@\times@tr@)=@Tn@$ mm. \emph{Evaporation:} $E^*=@Em@\times\mathrm{clip}((1-0.56)/(1-0.595))=@Em@\times@er@=@Es@$ mm, $E^*_{\rm other}=@Eom@\times@ETn@/@ETm@=@Eos@$ mm; sharing $ET-T=@rest@$ mm in that proportion gives $E=@Enw@$ and $E_{\rm other}=@Eonw@$ mm. Leaching: $N_L=40\times(@Dn@+5)/(@Dm@+5)=@NL@$ kg ha$^{-1}$. The balance closes: $T+E+E_{\rm other}=@chk@=ET$.""",
P=fx(Pm,0),Im=fx(Im,0),Dm=fx(Dm,0),Em=fx(Em,0),Tm=fx(Tm,0),ETm=fx(ETm,0),Eom=fx(Eom,0),Ic=fx(Ic_,0),ec=fx(cr['ETa']/cr['ETc'],3),etc=fx(cr['ETc'],0),dpc=fx(cr['DP'],0),Ir=fx(Ir_,0),etr=fx(ref['ETc'],0),dpr=fx(ref['DP'],0),rat=fx(Ic_/Ir_,3),In=fx(Inew,0),Dn=fx(Dnew,0),ETn=fx(ETnew,0),tr=fx(ratio,3),Tn=fx(Tnew,0),er=fx(min(1.6,max(0.6,(1-0.7*fcc)/(1-0.7*fcr))),3),Es=fx(Estar,0),Eos=fx(Eostar,0),rest=fx(rest,0),Enw=fx(Enew,0),Eonw=fx(Eonew,0),NL=fx(NLnew,1),chk=fx(Tnew+Enew+Eonew,0))
w(ex("transferring sorghum from the cereal result",body))
w(r"""\begin{keybox}These transfer rules are engineered, not measured: the clips (0.2--3, 0.6--1.6, 0--4) keep the result within the range in which the cereal simulation is informative, and the layer never gives a library crop the resolution of the cereal runs. The yield shown for a library crop is the relative yield of Equation 21.5, in per cent.\end{keybox}

\section{Summary of the crop layer}
\begin{itemize}
\item $K_c(t)$ in four stages; $ET_c=K_cET_0$; roots grow with the canopy.
\item TAW $=\mathrm{AWC}z_r$, RAW $=p_d$TAW with $p_d=p+0.04(5-K_cET_0)$; $K_s$ falls linearly below RAW.
\item The balance $D_r$ triggers irrigation at $f_T$TAW; gross $=$ net$/E_{a,m}$.
\item $Y_{\rm rel}=1-K_y(1-\sum ET_a/\sum ET_c)$.
\item A library crop enters the annual model by the ratio of its balance to the cereal reference.
\end{itemize}
""")
open('/tmp/book/p2o.tex','w').write("\n".join(O))
print(Pm,Im,Dm,Em,Tm,Inew,Dnew,ETnew,Tnew,Enew,Eonew,Ic_,Ir_,ratio)
