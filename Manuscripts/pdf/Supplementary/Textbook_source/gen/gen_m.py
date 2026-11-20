import sys,math
sys.path.insert(0,'/tmp/book/gen')
from sprk import *
O=[];w=O.append
def T(s,**kw):
    for k,v in kw.items(): s=s.replace('@'+k+'@',str(v))
    return s
sp=soilpar('S06',0.468);K=sp['k']*1000;A=sp['A']
def run(typ,d,P,al,u,Ss,Sl,tri,Zn,K=K,A=A,Sd=4.0,Iint=3.0,Ta=24,T0=None):
    q=qnoz(d,P);R=Rwet(typ,d,P,al);a=overlap(typ,R,q,u,Ss,Sl,tri)
    wd=wdrift(typ,u,P,Ta,al);Tm=T0 or autoT(a,wd,K,A,Sd,Iint,Zn);e=effs(a,wd,K,A,Sd,Iint,Tm,Zn)
    CU=1-np.abs(a-a.mean()).sum()/a.size/a.mean()
    return dict(q=q,R=R,AR=60*a.mean(),CU=CU,wd=wd,T=Tm,a=a,**e)
def sc(r,Zn): return min(r['Ea'],1)-2.5*max(0,0.9-r['Es'])
Zn=30.0
base=run('Impact',4.4,300,25,3,12,18,False,Zn)
w(r"""\chapter{Sprinkler irrigation design}\label{ch:sprinkler}
\markboth{Sprinkler design}{Sprinkler design}
\textbf{After this chapter you can} compute the discharge and the reach of a nozzle, build the overlapped spray pattern of a sprinkler grid and its uniformity, estimate drift loss and ponding, close the water partition, look up the allowed application rate, size the laterals and the pump, and read the ten textbook checks of the layer.
""")
# ---- 1 nozzle
w(r"\section{Nozzle discharge}"+"\n"+r"""The pressure head of the nozzle is $h=P/9.81$ (m, $P$ in kPa) and the discharge follows the orifice law with coefficient 0.95,
\begin{equation}q=0.95A_n\sqrt{2gh}\times6\times10^4\ \ (\mathrm{L\,min^{-1}}),\qquad A_n=\pi\left(\frac{d}{2000}\right)^2\ \mathrm{m^2}.\end{equation}
The factor $6\times10^4$ converts m$^3$ s$^{-1}$ to L min$^{-1}$. Because $q\propto d^2\sqrt P$, doubling the nozzle diameter quadruples the discharge, and doubling the pressure raises it by only 41\%.
""")
h=300/9.81;An=math.pi*(4.4/2000)**2;v=math.sqrt(2*9.81*h)
body=T(r"""The default impact sprinkler has $d=4.4$ mm and $P=300$ kPa. Find $q$.

\textbf{Solution.} $h=300/9.81=@h@$ m. $A_n=\pi(4.4/2000)^2=@An@\times10^{-5}$ m$^2$. $\sqrt{2gh}=\sqrt{2\times9.81\times@h@}=@v@$ m s$^{-1}$. So $q=0.95\times@An@\times10^{-5}\times@v@\times6\times10^4=@q@$ L min$^{-1}$ ($=@qh@$ m$^3$ h$^{-1}$)."""
,h=fx(h,2),An=fx(An*1e5,3),v=fx(v,2),q=fx(qnoz(4.4,300),2),qh=fx(qnoz(4.4,300)*0.06,3))
w(ex("discharge of one nozzle",body))
ds=[2.4,3.2,4.0,4.4,5.0,6.0]
Ps=[200,250,300,400,500]
rows=[[fx(d,1)]+[fx(qnoz(d,P),1) for P in Ps] for d in ds]
w(tab(["$d$ (mm)"]+[f"{P} kPa" for P in Ps],rows,"Discharge $q$ (L min$^{-1}$) of an impact nozzle, Eq.~(13.2).","tab:qnoz"))
body=T(r"""Using Table~\ref{tab:qnoz}, a farmer wants to keep a 4.4 mm nozzle but cut the discharge by one quarter. What pressure is needed?

\textbf{Solution.} $q\propto\sqrt P$, so $q_2/q_1=\sqrt{P_2/P_1}=0.75$ gives $P_2/P_1=0.5625$, $P_2=0.5625\times300=@P@$ kPa. Check with the table: $q(4.4,169)$ is $@q@$ L min$^{-1}$, which is $@r@\%$ of 21.2. The price of the lower pressure is a smaller reach (next section) and a coarser drop.""",P=fx(168.75,0),q=fx(qnoz(4.4,168.75),2),r=fx(100*qnoz(4.4,168.75)/qnoz(4.4,300),1))
w(ex("a lower discharge from the same nozzle",body))
# ---- 2 radius
w(r"\section{Wetted radius}"+"\n"+r"""The reach of a sprinkler is an empirical range law,
\begin{equation}R=c_R\sqrt d\sqrt h\,f_\alpha(\alpha),\qquad f_\alpha=\left[\frac{\max\{0.05,\sin(3.1\alpha)\}}{0.9763}\right]^{0.45},\end{equation}
with $d$ in mm, $h$ in m and the angle in degrees. The coefficient $c_R$ is 1.35 for the impact sprinkler (the Keller and Bliesner value), 0.80 for the rotating spray, 0.70 for the micro-sprinkler and 0.95 for the big gun; Table~\ref{tab:types} lists the defaults of the four types. The angle function equals 1 at $\alpha=25^\circ$ and peaks near $29^\circ$.
""")
rows=[[t,fx(v['d'],1),v['P'],fx(v['Ss'],0),fx(v['Sl'],0),fx(v['cR'],2),fx(v['F'],1),fx(qnoz(v['d'],v['P']),1),fx(Rwet(t,v['d'],v['P'],25),1)] for t,v in TYPES.items()]
w(tab(["Type","$d$","$P$","$S_s$","$S_l$","$c_R$","$F$","$q$ (L/min)","$R$ (m)"],rows,"The four sprinkler types at their defaults ($\\alpha=25^\\circ$): discharge and wetted radius.","tab:types",spec="lrrrrrrrr"))
body=T(r"""Find the radius of the default impact sprinkler at $\alpha=25^\circ$ and at $\alpha=15^\circ$, and say which angle is the better for reach.

\textbf{Solution.} $h=@h@$ m, $\sqrt d=\sqrt{4.4}=@sd@$, $\sqrt h=@sh@$. At $25^\circ$: $\sin77.5^\circ=0.9763$ so $f_\alpha=1$ and $R=1.35\times@sd@\times@sh@=@R1@$ m. At $15^\circ$: $\sin46.5^\circ=@s15@$; $f_\alpha=(@s15@/0.9763)^{0.45}=@f15@$, so $R=@R15@$ m. At $29^\circ$: $\sin89.9^\circ=0.99999$, $f_\alpha=@f29@$, $R=@R29@$ m. The angle changes the reach by only a few per cent between $20^\circ$ and $30^\circ$, which is why the default $25^\circ$ is near the optimum, and a flat jet (low $\alpha$) shortens the reach but also lowers the drift (next sections).""",
h=fx(h,2),sd=fx(math.sqrt(4.4),3),sh=fx(math.sqrt(h),3),R1=fx(Rwet('Impact',4.4,300,25),2),s15=fx(math.sin(math.radians(46.5)),4),f15=fx(falpha(15),4),R15=fx(Rwet('Impact',4.4,300,15),2),R29=fx(Rwet('Impact',4.4,300,29),2),f29=fx(falpha(29),4))
w(ex("reach and trajectory angle",body))
rows=[[a,fx(falpha(a),3),fx(Rwet('Impact',4.4,300,a),1),fx(wdrift('Impact',3,300,24,a)*100,1)] for a in (8,12,15,20,25,29,35,45)]
w(tab(["$\\alpha$ (deg)","$f_\\alpha$","$R$ (m)","$w_d$ (\\%) at 3 m/s"],rows,"Angle function, reach and drift of the impact sprinkler.","tab:angle"))
w(r"""\begin{keybox}
At $\alpha=45^\circ$ the term $\sin(3.1\alpha)=\sin139.5^\circ=0.65$ has already fallen, and for $\alpha\gtrsim32^\circ$ the sine is declining: the angle function is a deliberate engineered shape, not a measured one. Table~\ref{tab:angle} shows the drift rising with the angle, since steeper jets stay longer in the air.
\end{keybox}""")
# ---- 3 profile & wind
w(r"\section{The single-sprinkler pattern and wind}"+"\n"+r"""With $x=r/R_e$ the shape of the deposit is
\begin{equation}\hat p(x)=\begin{cases}1-x^{1.3}&\text{impact}\\1-x&\text{big gun}\\(0.5+0.5x)(1-x^6)&\text{rotating spray}\\(0.55+0.45x)(1-x^5)&\text{micro-sprinkler}\end{cases}\qquad\hat p=0\ (x\ge1).\end{equation}
Wind stretches the radius downwind and moves the centre, $R_e(\theta)=R\,\mathrm{clip}\{1+0.022u\cos\theta;0.7,1.4\}$ and shift $=0.03uR$. The final pattern $p=s\hat p$ is scaled by a constant $s$ so that the volume deposited per minute equals the discharge, $\iint p\,dA=q$ (with $p$ in mm min$^{-1}$, since 1 mm over 1 m$^2$ is 1 L).
""")
q0=qnoz(4.4,300);R0=Rwet('Impact',4.4,300,25)
p0=q0/(2*math.pi*R0**2*(0.5-1/3.3))
pf,scl,vol=pattern('Impact',R0,q0,0.0)
body=T(r"""For no wind, find the exact peak application rate of the impact pattern, check it against the 45$\times$45 grid used by the layer, and give the rate at half the radius.

\textbf{Solution.} Volume of $\hat p=1-x^{m}$: $\iint\hat p\,dA=2\pi R^2\int_0^1(1-x^{m})x\,dx=2\pi R^2\left(\tfrac12-\tfrac1{m+2}\right)$. With $m=1.3$: $\tfrac12-\tfrac1{3.3}=@c@$. $R=@R@$ m, so volume $=2\pi\times@R2@\times@c@=@V@$ m$^2$. The peak rate is $s=q/V=@q@/@V@=@p0@$ mm min$^{-1}$ $=@p60@$ mm h$^{-1}$. The numerical grid gives $s=@sg@$ mm min$^{-1}$, differing by @dev@\% (the 45$\times$45 grid places the centre at a corner of four cells). At $x=0.5$: $p=@p0@\times(1-0.5^{1.3})=@ph@$ mm min$^{-1}$, i.e.\ @ph60@ mm h$^{-1}$.""",
c=fx(0.5-1/3.3,5),R=fx(R0,2),R2=fx(R0**2,1),V=fx(2*math.pi*R0**2*(0.5-1/3.3),1),q=fx(q0,2),p0=fx(p0,4),p60=fx(p0*60,2),sg=fx(scl,4),dev=fx(100*(scl-p0)/p0,1),ph=fx(p0*(1-0.5**1.3),4),ph60=fx(60*p0*(1-0.5**1.3),2))
w(ex("peak rate of a single sprinkler",body))
# wind example
u=6.0
body=T(r"""At wind speed $u=@u@$ m s$^{-1}$ find the downwind, upwind and crosswind radii of the impact pattern and the shift of its centre.

\textbf{Solution.} Downwind ($\theta=0$): $R_e=@R@\times(1+0.022\times@u@)=@R@\times@fd@=@Rd@$ m. Upwind ($\theta=180^\circ$): $R_e=@R@\times@fu@=@Ru@$ m. Crosswind ($\theta=90^\circ$): $R_e=R=@R@$ m. The shift of the centre is $0.03\times@u@\times@R@=@sh@$ m downwind. The elongation is +@pd@\% downwind and $-$@pu@\% upwind; the clip (0.7 to 1.4) would act only above $13.6$ m s$^{-1}$ upwind and $18.2$ m s$^{-1}$ downwind.""",u=u,R=fx(R0,2),fd=fx(1+0.022*u,3),Rd=fx(R0*(1+0.022*u),2),fu=fx(1-0.022*u,3),Ru=fx(R0*(1-0.022*u),2),sh=fx(0.03*u*R0,2),pd=fx(2.2*u,1),pu=fx(2.2*u,1))
w(ex("wind distortion of the reach",body))
# ---- 4 overlap
w(r"\section{Overlap and the coefficient of uniformity}"+"\n"+r"""On a grid with spacings $S_s$ along the lateral and $S_l$ between laterals the rate at a point is the sum over neighbouring sprinklers, $a(x,y)=\sum_{ij}p(x-x_{ij},y-y_{ij})$, evaluated on a $14\times14$ grid of the repeating cell ($14\times24$ of the $S_s\times2S_l$ cell for the triangular layout, where each second lateral is shifted by $S_s/2$). The mean rate is $\mathrm{AR}=60\bar a$ mm h$^{-1}$ and the Christiansen coefficient is
\begin{equation}\mathrm{CU}=1-\frac{\sum_k|a_k-\bar a|}{n\bar a}.\end{equation}
Because every drop of the discharge lands somewhere in the repeating cell, the mean rate does not depend on the pattern at all: $\mathrm{AR}=60q/(S_sS_l)$.
""")
body=T(r"""Compute $\mathrm{AR}$ for the default impact layout ($12\times18$ m, $q=@q@$ L min$^{-1}$) and compare with the sum from the overlap grid.

\textbf{Solution.} $\mathrm{AR}=60\times@q@/(12\times18)=@ar@$ mm h$^{-1}$. The summed grid gives @arn@ mm h$^{-1}$ (wind 3 m s$^{-1}$), the same to within 0.1\%, which confirms the volume normalisation. The layer then compares this rate with the largest rate the soil allows (Section~\ref{sec:maxrate}).""",q=fx(q0,2),ar=fx(60*q0/216,3),arn=fx(base['AR'],3))
w(ex("mean application rate",body))
rows=[]
for Ss in (6,9,12,15,18,21,24):
    r=run('Impact',4.4,300,25,3,Ss,18,False,Zn)
    rows.append([Ss,fx(100*Ss/R0,0),fx(r['AR'],1),fx(100*r['CU'],1),fx(r['T'],0),fx(100*r['Ea'],1)])
w(tab(["$S_s$ (m)","$S_s/R$ (\\%)","AR (mm/h)","CU (\\%)","$T$ (min)","$E_a$ (\\%)"],rows,"Spacing along the lateral for the impact sprinkler ($S_l=18$ m, 3 m s$^{-1}$, $Z_n=30$ mm, loam).","tab:ssweep"))
cuS=[run('Impact',4.4,300,25,3,Ss,18,False,Zn)['CU'] for Ss in (6,9,12,15,18,21,24)]
body=T(r"""Using Table~\ref{tab:ssweep}, what is the widest spacing along the lateral that still gives CU $\ge85\%$, and does it satisfy the rule $S_s\le kR$ of the ten checks (Section~\ref{sec:checks})?

\textbf{Solution.} CU is @c1@\% at $S_s=6$ m, @c12@\% at 12 m, @c18@\% at 18 m and @c24@\% at 24 m. The last spacing at or above 85\% is @sbest@ m. The wind factor for $u=3$ m s$^{-1}$ ($W=10.8$ km h$^{-1}$) is $k=0.9$, so the rule allows $S_s\le0.9\times@R@=@lim@$ m. A pattern can therefore keep CU above 85\% at a spacing the rule rejects, or the reverse; the layer reports both and lets the person decide.""",c1=fx(100*cuS[0],1),c12=fx(100*cuS[2],1),c18=fx(100*cuS[4],1),c24=fx(100*cuS[6],1),sbest=max([s for s,c in zip((6,9,12,15,18,21,24),cuS) if c>=0.85] or [0]),R=fx(R0,1),lim=fx(0.9*R0,1))
w(ex("spacing and uniformity",body))
rows=[]
for tri in (False,True):
    r=run('Impact',4.4,300,25,3,12,18,tri,Zn);rows.append(["Triangular" if tri else "Square",fx(r['AR'],2),fx(100*r['CU'],1),fx(100*r['DU'],1),fx(r['T'],0),fx(100*r['Ea'],1)])
w(tab(["Layout","AR","CU (\\%)","DU (\\%)","$T$ (min)","$E_a$ (\\%)"],rows,"Square against triangular layout, impact sprinkler at $12\\times18$ m, 3 m s$^{-1}$.","tab:tri"))
rows=[]
for u in (0,3,6,9,12):
    r=run('Impact',4.4,300,25,u,12,18,False,Zn);rows.append([u,fx(r['AR'],2),fx(100*r['CU'],1),fx(100*r['wd'],1)])
w(tab(["$u$ (m/s)","AR","CU (\\%)","$w_d$ (\\%)"],rows,"Effect of wind on the overlapped pattern of the default impact layout.","tab:wind"))
w(r"""\begin{keybox}
In Table~\ref{tab:wind} the computed CU does \emph{not} fall as the wind rises: in this model wind only stretches and shifts every pattern in the same direction, so the superposition stays nearly uniform on a repeating cell, while the drift loss $w_d$ and the run time grow. Field experience says the opposite (wind spoils uniformity). The layer's wind rule therefore enters through the spacing limit $S_s\le kR$ and the drift loss, not through CU, and this is a known limitation of the layer.
\end{keybox}""")
# ---- 5 drift
w(r"\section{Drift and evaporation loss}"+"\n"+r"""\begin{equation}w_d=\frac1{100}\mathrm{clip}\Big\{(1.2+0.5u+0.04u^2)\,F\left(\frac P{250}\right)^{0.7}\![1+0.025(T_a-20)]\Big[0.6+0.4\frac{\sin\alpha}{0.4226}\Big];0.5,45\Big\}\end{equation}
where $F$ is the type factor (impact 1.0, spray 1.6, micro 0.7, gun 1.3), $P$ in kPa, $u$ in m s$^{-1}$ and $T_a=24^\circ$C$+\Delta T$. The form is plausible (loss rises with wind, pressure and temperature, and falls with a flatter jet), but the coefficients are engineered, not fitted.
""")
a1=(1.2+1.5+0.36);body=T(r"""Find $w_d$ for the default impact sprinkler at $u=3$ m s$^{-1}$, $T_a=24^\circ$C.

\textbf{Solution.} Wind term $1.2+0.5\times3+0.04\times9=@wt@$. Pressure term $(300/250)^{0.7}=@pt@$. Temperature term $1+0.025\times4=1.1$. Angle term $0.6+0.4\sin25^\circ/0.4226=0.6+0.4\times@sa@/0.4226=@at@$ (since $\sin25^\circ=0.4226$ the bracket is exactly 1). Then $@wt@\times1.0\times@pt@\times1.1\times1=@v@$ per cent, within the clip, so $w_d=@wd@$ (@wd100@\%). Compare the same sprinkler at 9 m s$^{-1}$: $1.2+4.5+3.24=8.94$, $w_d=@w9@\%$.""",wt=fx(a1,2),pt=fx((300/250)**0.7,4),sa=fx(math.sin(math.radians(25)),4),at=fx(1.0,3),v=fx(a1*(300/250)**0.7*1.1,3),wd=fx(wdrift('Impact',3,300,24,25),4),wd100=fx(100*wdrift('Impact',3,300,24,25),2),w9=fx(100*wdrift('Impact',9,300,24,25),1))
w(ex("drift loss",body))
rows=[]
for t,vv in TYPES.items():
    rows.append([t]+[fx(100*wdrift(t,u,vv['P'],24,25),1) for u in (0,3,6,9)])
w(tab(["Type","0 m/s","3 m/s","6 m/s","9 m/s"],rows,"Drift loss $w_d$ (\\%) of the four types at their default pressures, $\\alpha=25^\\circ$, $T_a=24^\\circ$C.","tab:wd"))
# ---- 6 ponding
w(r"\section{Intake, ponding and runoff}\label{sec:pond}"+"\n"+r"""The soil takes water by the Kostiakov law $F=Kt^A$ with $K=1000k$ mm min$^{-A}$ (Chapter~\ref{ch:surf}). At a point receiving $a_e=a(1-w_d)$ mm min$^{-1}$ the surface ponds when the rate exceeds the intake rate, $a_e=Kt^{A-1}$, which gives
\begin{equation}t_p=(a_e/K)^{1/(A-1)},\qquad F=\begin{cases}\mathrm{sup}=a_eT&T\le t_p\\KT^A&T>t_p\end{cases},\quad \mathrm{RO}=\max\{0,\,\mathrm{sup}-F-S_{d,\rm eff}\},\ I=\mathrm{sup}-\mathrm{RO}.\end{equation}
Surface storage is reduced by slope, $S_{d,\rm eff}=\max(0,S_d)/(1+0.25S)$ ($S$ in \%). The canopy and mulch keep $I_c=\min\{I,I_{\rm int}\}$, $I_{\rm int}=0.6\,\mathrm{CAP}[\text{mulch}]+1.2\,\mathrm{LAI}$, which evaporates and never reaches the soil. The depth that reaches the soil is $Z_k=I-I_c$.
""")
body=T(r"""Conventional tillage gives $S_d=5$ mm on a 1\% slope. A loam under maize with LAI = 2.5 and no mulch is irrigated at the mean rate of the default impact layout. Find $S_{d,\rm eff}$, $I_{\rm int}$, the intake coefficients and the ponding time.

\textbf{Solution.} $S_{d,\rm eff}=5/(1+0.25\times1)=@sd@$ mm. $I_{\rm int}=1.2\times2.5=3.0$ mm (no mulch term). The loam's Kostiakov law (Chapter~\ref{ch:surf}) has $k=@k@$ m min$^{-A}$ and $A=@A@$, so $K=@K@$ mm min$^{-A}$. The applied rate is $a_e=@ae@\,(1-@wd@)=@aee@$ mm min$^{-1}$ ($@arr@$ mm h$^{-1}$ after drift). Then $t_p=(@aee@/@K@)^{1/(@A@-1)}=@ratio@^{@ex@}=@tp@$ min. A set is about @T@ min long, so $T<t_p$ and the whole supply infiltrates: RO = 0. The loam takes this sprinkler with a wide margin.""",sd=fx(sdeff(5,1),2),k=fx(sp['k'],6),A=fx(A,3),K=fx(K,3),ae=fx(base['AR']/60,4),wd=fx(base['wd'],4),aee=fx(base['AR']/60*(1-base['wd']),4),arr=fx(base['AR']*(1-base['wd']),2),ratio=fx(base['AR']/60*(1-base['wd'])/K,4),ex=fx(1/(A-1),3),tp=fx((base['AR']/60*(1-base['wd'])/K)**(1/(A-1)),0),T=fx(base['T'],0))
w(ex("ponding time on the loam",body))
# soil sweep
rows=[];soilres={}
for sid in IDS:
    spp=soilpar(sid,0.468);Ks_=spp['k']*1000;As_=spp['A'];nm=SOIL[sid][0]
    for typ in ('Impact','Rotating spray'):
        v=TYPES[typ];r=run(typ,v['d'],v['P'],25,3,v['Ss'],v['Sl'],False,Zn,K=Ks_,A=As_)
        ae=r['AR']/60*(1-r['wd']);tp=(ae/Ks_)**(1/(As_-1))
        mr=maxrate(sid,1)[0]
        soilres[(sid,typ)]=(r,tp,mr)
        rows.append([nm,typ,fx(Ks_,2),fx(As_,3),fx(r['AR'],1),fx(mr,0),(fx(tp,0) if tp<1e5 else r'$>10^5$'),fx(r['T'],0),fx(100*r['RO'],1),fx(100*r['Ea'],1)])
w(tab(["Soil","Sprinkler","$K$","$A$","AR","Max","$t_p$","$T$","RO\\%","$E_a$\\%"],rows,"Default impact and rotating-spray layouts on the ten soils ($Z_n=30$ mm, 1\\% slope, $u=3$ m s$^{-1}$, $S_d=4$ mm effective, LAI 2.5). Max is the allowed rate of Table~\\ref{tab:maxrate}.","tab:sprsoils",spec="llrrrrrrrr"))
fail=[(SOIL[s][0],t) for (s,t),(r,tp,mr) in soilres.items() if r['RO']>0.005]
nfail=len(fail)
w(r"""\begin{keybox}
Table~\ref{tab:sprsoils} shows where the ponding rule bites: runoff appears only on the soils whose intake coefficient is small enough that $t_p$ falls below the run time. In """+str(nfail)+r""" of the 20 soil--sprinkler pairs the run produces runoff above 0.5\% of the gross depth. The allowed-rate column is a second, independent screen from the sprinkler manuals; the two screens do not always agree, because Table~\ref{tab:maxrate} is a tabulated rule of thumb while $t_p$ uses the soil's computed intake.
\end{keybox}""")
# worst case example S10
sidw=max(IDS,key=lambda s:soilres[(s,'Rotating spray')][0]['RO'])
rw,tpw,mrw=soilres[(sidw,'Rotating spray')]
body=T(r"""Take the soil with the most runoff in Table~\ref{tab:sprsoils} (@nm@) under the rotating spray. Show how the water partition closes.

\textbf{Solution.} AR = @ar@ mm h$^{-1}$ against the table limit @mr@ mm h$^{-1}$; $w_d=@wd@\%$; run time $T=@T@$ min (automatic); $t_p=@tp@$ min. The partition of the gross depth @g@ mm: $E_a=@Ea@\%$, deep percolation $@DP@\%$, runoff $@RO@\%$, drift plus interception $@WD@\%$. Sum: $@Ea@+@DP@+@RO@+@WD@=@sum@\%$. The partition always closes because every millimetre discharged is either lost to drift, retained by the canopy, run off, stored, or drained.""",nm=SOIL[sidw][0],ar=fx(rw['AR'],1),mr=fx(mrw,1),wd=fx(100*rw['wd'],1),T=fx(rw['T'],0),tp=fx(tpw,0),g=fx(rw['gross'],1),Ea=fx(100*rw['Ea'],1),DP=fx(100*rw['DP'],1),RO=fx(100*rw['RO'],1),WD=fx(100*rw['WD'],1),sum=fx(100*(rw['Ea']+rw['DP']+rw['RO']+rw['WD']),1))
w(ex("a partition that closes on the worst soil",body))
# ---- 7 efficiencies
w(r"\section{Efficiencies and run time}"+"\n"+r"""With $Z_k$ the depth reaching the soil at cell $k$ and $\mathrm{gross}=\bar aT$ the mean depth discharged,
\begin{equation}E_a=\frac{\overline{\min(Z_k,Z_n)}}{\mathrm{gross}},\ E_s=\frac{\overline{\min(Z_k,Z_n)}}{Z_n},\ \mathrm{DU}=\frac{Z_{25}}{\bar Z},\ \mathrm{DP}=\frac{\overline{\max(Z_k-Z_n,0)}}{\mathrm{gross}},\ \mathrm{RO}=\frac{\overline{\mathrm{RO}_k}}{\mathrm{gross}},\ \mathrm{WD}=w_d+\frac{\overline{I_c}}{\mathrm{gross}},\end{equation}
where $Z_{25}$ is the mean of the lowest quarter of $Z_k$. The automatic run time is the smallest $T\in[1,2400]$ min with $Z_{25}(T)\ge Z_n$, found by 18 bisection steps.
""")
Zk=base['Zk']
body=T(r"""For the default layout on the loam ($Z_n=30$ mm) the layer finds $T=@T@$ min. Verify the efficiencies by hand from the summary of the cells.

\textbf{Solution.} Gross depth $=\bar aT=@arm@\times@T@=@g@$ mm ($\bar a=@ar@$ mm h$^{-1}$). After drift ($w_d=@wd@\%$) the supply is $@sup@$ mm and the canopy retains $I_c=3.0$ mm, leaving a mean $\bar Z=@zm@$ mm at the soil. The lowest-quarter mean is $Z_{25}=@z25@$ mm, equal to $Z_n$ as required by Eq.~(13.12), so the run was solved correctly. Then $\mathrm{DU}=@z25@/@zm@=@du@\%$. Because every cell receives at least about $Z_n$, $E_s=@Es@\%$ and $E_a=\overline{\min}/\mathrm{gross}=@Ea@\%$. DP $=@DP@\%$, WD $=@wd@+3.0/@g@=@WD@\%$ and RO $=0$. Sum: $@Ea@+@DP@+0+@WD@=@sum@\%$.""",T=fx(base['T'],0),arm=fx(base['AR']/60,4),g=fx(base['gross'],2),ar=fx(base['AR'],2),wd=fx(100*base['wd'],1),sup=fx(base['gross']*(1-base['wd']),2),zm=fx(base['Zmean'],2),z25=fx(base['Z25'],2),du=fx(100*base['DU'],1),Es=fx(100*base['Es'],1),Ea=fx(100*base['Ea'],1),DP=fx(100*base['DP'],1),WD=fx(100*base['WD'],1),sum=fx(100*(base['Ea']+base['DP']+base['WD']),1))
w(ex("the water partition of the default layout",body))
rows=[]
for t,vv in TYPES.items():
    r=run(t,vv['d'],vv['P'],25,3,vv['Ss'],vv['Sl'],False,Zn);rows.append([t,fx(r['q'],1),fx(r['R'],1),fx(r['AR'],1),fx(100*r['CU'],1),fx(100*r['wd'],1),fx(r['T'],0),fx(100*r['Ea'],1),fx(100*r['DP'],1),fx(100*r['WD'],1)])
w(tab(["Type","$q$","$R$","AR","CU","$w_d$","$T$","$E_a$","DP","WD"],rows,"The four sprinklers on the loam at their default settings ($Z_n=30$ mm, 3 m s$^{-1}$).","tab:fourtypes",spec="lrrrrrrrrr"))
rtypes={t:run(t,vv['d'],vv['P'],25,3,vv['Ss'],vv['Sl'],False,Zn) for t,vv in TYPES.items()}
best=max(rtypes,key=lambda t:rtypes[t]['Ea']);worst=min(rtypes,key=lambda t:rtypes[t]['Ea'])
body=T(r"""Using Table~\ref{tab:fourtypes}, which type gives the best $E_a$ on the loam, and what limits the worst?

\textbf{Solution.} The best is the @best@ ($E_a=@eb@\%$, CU $@cb@\%$); the worst is the @worst@ ($E_a=@ew@\%$, CU $@cw@\%$). For the worst, the pattern of a rotating spray is a ring that peaks away from the centre ($\hat p=(0.5+0.5x)(1-x^6)$ with a reach $R$ of only about 6 m against a 6 m spacing in both directions), so the overlap is incomplete; its low CU turns into deep percolation under the wet spots (DP $=@dpw@\%$) because the driest quarter must still receive $Z_n$. Uniformity, not the drift, controls $E_a$ here.""",best=best,worst=worst,eb=fx(100*rtypes[best]['Ea'],1),cb=fx(100*rtypes[best]['CU'],1),ew=fx(100*rtypes[worst]['Ea'],1),cw=fx(100*rtypes[worst]['CU'],1),dpw=fx(100*rtypes[worst]['DP'],1))
w(ex("comparing the four types",body))
# ---- 8 max rate
w(r"\section{Maximum allowable application rate}\label{sec:maxrate}"+"\n"+r"""The allowed rate (mm h$^{-1}$) is read from Table~\ref{tab:maxrate} by soil group and slope class; the ten soils are assigned to rows (coarse sand, sand, loamy sand $\to$ 1; sandy loam, coarse loam $\to$ 3; loam, silt loam $\to$ 5; sandy clay loam $\to$ 6; clay loam, silty clay loam $\to$ 7), and a compact layer moves an odd row to the next one.
""")
rows=[[n]+[fx(x,1 if x<10 and x!=int(x) else 0) for x in v] for n,v in TAB133]
w(tab(["Soil group","0--5\\%","5--8\\%","8--12\\%","12--16\\%"],rows,"Maximum application rate (mm h$^{-1}$) by soil and slope (Keller and Bliesner).","tab:maxrate",spec="lrrrr"))
ex_=[('S06',1,False),('S06',6,False),('S06',6,True),('S09',2,False),('S02',10,False)]
rr=[(s,sl,c,maxrate(s,sl,c)) for s,sl,c in ex_]
lines="".join(T(r"\item @nm@, slope @sl@\%%@cp@: row @row@ ``@gr@'', column @col@: @m@ mm h$^{-1}$."+"\n",nm=SOIL[s][0],sl=sl,cp=(", compact layer" if c else ""),row=m[1]+1,gr=TAB133[m[1]][0],col=m[2]+1,m=fx(m[0],1)) for s,sl,c,m in rr).replace('%%','')
body=r"Read the allowed rate for five cases."+"\n\n"+r"\textbf{Solution.}"+"\n"+r"\begin{itemize}"+"\n"+lines+r"\end{itemize}"+"\n"+T(r"The default impact layout has AR $=@ar@$ mm h$^{-1}$ (and the loam at 1\% allows @m1@), so it passes. The same loam on a 6\% slope with a compact layer drops to @m3@ mm h$^{-1}$: the default 5.9 mm h$^{-1}$ still passes, but the rotating spray (AR $=@sp@$) fails.",ar=fx(base['AR'],1),m1=fx(rr[0][3][0],0),m3=fx(rr[2][3][0],0),sp=fx(rtypes['Rotating spray']['AR'],1))
w(ex("looking up the allowed rate",body))
# ---- 9 ten checks
w(r"\section{The ten textbook checks}\label{sec:checks}"+"\n"+r"""With $h_s=P/9.81$, $q_h=0.06q$ (m$^3$ h$^{-1}$), $W=3.6u$ (km h$^{-1}$) and wind factor $k=1,0.9,0.8,0.7$ for $W\le5.5$, $\le13$, $\le22$, $>22$:
\begin{equation}S_s\le kR,\quad S_l\le1.5R,\quad L_y=\frac{10^4A_f}{L_x},\quad N=\lfloor L_x/S_s\rfloor,\quad N_m=\lfloor L_y/S_l\rfloor,\end{equation}
\begin{equation}t_{\rm set}=\frac{Z_{\rm gross}}{\mathrm{AR}},\quad n_{\rm sets/day}=\left\lfloor\frac{h_{\rm op}}{t_{\rm set}}\right\rfloor,\quad T_{\rm int}=\max\left(1,\left\lfloor\frac{Z_n}{ET_{\rm pk}}\right\rfloor\right),\quad N_d(n)=\left\lceil\frac{N_m}{n\,n_{\rm sets/day}}\right\rceil,\quad Q_{\rm in}(n)=nNq_h.\end{equation}
The program picks the smallest $n$ ($1\ldots4$ laterals at once) with $N_d\le T_{\rm int}$ and $Q_{\rm in}\le3.6Q_s$ (m$^3$ h$^{-1}$, $Q_s$ in L s$^{-1}$).
""")
Af=5;Qs=40;LL=150;Lm=120;lift=12;hop=16;ETpk=6.4;Ss,Sl=12,18
hs=300/9.81;qh=0.06*q0;W=3.6*3;kw=0.9
Ly=1e4*Af/LL;N=int(LL//Ss);Nm=int(Ly//Sl);tset=base['gross']/base['AR'];nsd=int(hop//tset);Tint=max(1,int(Zn//ETpk))
sel=None;nd={}
for n in range(1,5):
    nd[n]=math.ceil(Nm/(n*nsd));Q=n*N*qh
    if sel is None and nd[n]<=Tint and Q<=3.6*Qs: sel=n
if sel is None: sel=4
rows=[[n,nd[n],fx(n*N*qh,1),"yes" if nd[n]<=Tint else "no","yes" if n*N*qh<=3.6*Qs else "no"] for n in range(1,5)]
body=T(r"""Farm: $A_f=5$ ha, $Q_s=40$ L s$^{-1}$, $L_L=150$ m, $h_{\rm op}=16$ h d$^{-1}$, $ET_{\rm pk}=6.4$ mm d$^{-1}$, $Z_n=30$ mm; default impact layout, $u=3$ m s$^{-1}$. Find the layout and the number of laterals to run at once.

\textbf{Solution.} $h_s=@hs@$ m, $q_h=0.06\times@q@=@qh@$ m$^3$ h$^{-1}$, $W=10.8$ km h$^{-1}$ so $k=0.9$. Spacing: $S_s=12\le0.9\times@R@=@lim@$ (OK) and $S_l=18\le1.5\times@R@=@lim2@$ (OK). $L_y=10^4\times5/150=@Ly@$ m; $N=\lfloor150/12\rfloor=@N@$ sprinklers per lateral; $N_m=\lfloor@Ly@/18\rfloor=@Nm@$ lateral positions. $t_{\rm set}=@g@/@ar@=@ts@$ h, so $n_{\rm sets/day}=\lfloor16/@ts@\rfloor=@nsd@$; $T_{\rm int}=\lfloor30/6.4\rfloor=@Tint@$ d. Table~\ref{tab:nlat} gives $N_d$ and $Q_{\rm in}$; the supply limit is $3.6\times40=144$ m$^3$ h$^{-1}$. The smallest $n$ meeting both is $n=@sel@$.""",hs=fx(hs,2),q=fx(q0,2),qh=fx(qh,3),R=fx(R0,2),lim=fx(kw*R0,1),lim2=fx(1.5*R0,1),Ly=fx(Ly,1),N=N,Nm=Nm,g=fx(base['gross'],2),ar=fx(base['AR'],2),ts=fx(tset,2),nsd=nsd,Tint=Tint,sel=sel)
w(ex("how many laterals run at once",body))
w(tab(["$n$","$N_d$ (days)","$Q_{\\rm in}$ (m$^3$/h)","$N_d\\le T_{\\rm int}$","$Q_{\\rm in}\\le144$"],rows,"Laterals running together for the farm of the worked example.","tab:nlat"))
# pipes
def lat_pipe(Qlat,Nn,Lx,Ss_,hs_):
    F=1/2.75+1/(2*Nn)
    for D in DSER:
        hf=1.1*F*blasius(Qlat,D)*(Lx-Ss_/2)
        if hf<=0.2*hs_: return D,hf,F
    return DSER[-1],hf,F
QL=1000*N*qh
D_lat,hf_lat,Fc=lat_pipe(QL,N,LL,Ss,hs)
Qm=sel*QL;Lmain=Ly-Sl/2
Dm=next((D for D in DSER if D>=D_lat and blasius(Qm,D)<0.05),DSER[-1])
Jm=blasius(Qm,Dm);Hman=lift+Jm*Lm+Jm*Lmain+hs+0.75*hf_lat
CV=1000*(Qm/3.6e6)*Hman/(75*0.75);kW=0.7355*CV
trs=[]
for D in DSER:
    trs.append([fx(D,1),fx(blasius(QL,D),5),fx(1.1*Fc*blasius(QL,D)*(LL-Ss/2),2),fx(100*1.1*Fc*blasius(QL,D)*(LL-Ss/2)/hs,1)])
w(r"\section{Pipes, head and pump (Blasius form)}"+"\n"+r"""For smooth plastic pipe the friction gradient is $J=0.472Q^{1.75}/D^{4.75}$ (m m$^{-1}$, $Q$ in L h$^{-1}$, $D$ in mm). With the Christiansen factor $F=1/2.75+1/(2N)$ for $N$ equal outlets and a 10\% allowance for fittings, the lateral takes the smallest internal diameter in $\{46.4,58,63,65.8,75,84.9,100\}$ mm for which
\begin{equation}h_{f,\rm lat}=1.1FJ(Q_L,D)(L_x-S_s/2)\le0.2h_s,\qquad Q_L=1000Nq_h.\end{equation}
The mainline has $Q_m=nQ_L$ and length $L_y-S_l/2$ and takes the smallest diameter not below the lateral's with $J<0.05$ m m$^{-1}$. The head and the pump are
\begin{equation}H_{\rm man}=z_{\rm lift}+JL_{\rm conv}+JL_{\rm main}+h_s+0.75h_{f,\rm lat},\qquad P_{\rm CV}=\frac{1000(Q_m/3.6\times10^6)H_{\rm man}}{75\eta},\ \eta=0.75,\ P_{\rm kW}=0.7355P_{\rm CV}.\end{equation}
""")
w(tab(["$D$ (mm)","$J$ (m/m)","$h_f$ (m)","$h_f/h_s$ (\\%)"],trs,"Lateral loss for each standard diameter, $Q_L=@QL@$ L h$^{-1}$, $N=@N@$ outlets.".replace('@QL@',fx(QL,0)).replace('@N@',str(N)),"tab:latD"))
body=T(r"""Size the lateral, mainline and pump of the farm above.

\textbf{Solution.} $Q_L=1000\times@N@\times@qh@=@QL@$ L h$^{-1}$. The Christiansen factor is $F=1/2.75+1/(2\times@N@)=@F@$. The allowed loss is $0.2h_s=0.2\times@hs@=@al@$ m. Table~\ref{tab:latD} shows the first diameter with $h_f\le@al@$ m is $D=@Dl@$ mm ($h_f=@hf@$ m, @pc@\% of $h_s$). Mainline: $Q_m=@sel@\times@QL@=@Qm@$ L h$^{-1}$; the first diameter not below @Dl@ mm with $J<0.05$ is $D=@Dm@$ mm ($J=@Jm@$ m m$^{-1}$). Head: $H_{\rm man}=12+@Jm@\times120+@Jm@\times@Lmain@+@hs@+0.75\times@hf@=@H@$ m. Pump: $P_{\rm CV}=1000\times(@Qm@/3.6\times10^6)\times@H@/(75\times0.75)=@CV@$ CV $=@kW@$ kW.""",N=N,qh=fx(qh,3),QL=fx(QL,0),F=fx(Fc,4),hs=fx(hs,2),al=fx(0.2*hs,2),Dl=fx(D_lat,1),hf=fx(hf_lat,2),pc=fx(100*hf_lat/hs,1),sel=sel,Qm=fx(Qm,0),Dm=fx(Dm,1),Jm=fx(Jm,5),Lmain=fx(Lmain,1),H=fx(Hman,2),CV=fx(CV,2),kW=fx(kW,2))
w(ex("lateral, mainline and pump",body))
# ---- 10 optimiser
w(r"\section{The design table and sensitivity}"+"\n"+r"""The optimiser maximises the score $\min(E_a,1)-2.5\max(0,0.9-E_s)$ over ten moves (pressure, spacing along the lateral, run time, nozzle, spacing between laterals, run time, pressure, layout, run time, spacing along the lateral); a move is accepted only if the score rises by more than 0.002. For pressure, nozzle and spacings the candidates are nine equally spaced values over the range of Table~\ref{tab:types}'s type; for the run time $T_0\times\{0.6,0.7,0.8,0.9,1,1.1,1.25\}$.
""")
cands=[200+37.5*i for i in range(9)]
rows=[];b0=sc(base,Zn)
for Pc in cands:
    Pr=round(Pc/10)*10;r=run('Impact',4.4,Pr,25,3,12,18,False,Zn)
    rows.append([Pr,fx(r['R'],1),fx(100*r['CU'],1),fx(r['T'],0),fx(100*r['Ea'],1),fx(sc(r,Zn),4),fx(sc(r,Zn)-b0,4)])
w(tab(["$P$ (kPa)","$R$","CU (\\%)","$T$","$E_a$ (\\%)","Score","$\\Delta$"],rows,"First move of the optimiser: nine pressures from 200 to 500 kPa (rounded to 10) for the default impact layout; $\\Delta$ is the change from the default score.","tab:optP"))
bestP=max(rows,key=lambda r:float(r[5]))
body=T(r"""Read the first move from Table~\ref{tab:optP}: which pressure does it choose, and is the gain accepted?

\textbf{Solution.} The default (300 kPa) scores @b0@. The highest score in the table is @sb@ at @Pb@ kPa, a change of @d@. A move is accepted only if the gain exceeds 0.002; here the gain is @d@, so it is @acc@. The reason is that raising the pressure widens the reach (and so the overlap) while it also raises the drift loss; the two nearly cancel in $E_a$ when $E_s\approx100\%$ and the score equals $E_a$.""",b0=fx(b0,4),sb=bestP[5],Pb=bestP[0],d=bestP[6],acc="accepted" if float(bestP[6])>0.002 else "rejected")
w(ex("first optimiser move",body))
def sens(**kw):
    p=dict(K=K,A=A,u=3,P=300,d=4.4,Ss=12,Sl=18,Zn=30.0,Sd=4.0)
    p.update(kw);return run('Impact',p['d'],p['P'],25,p['u'],p['Ss'],p['Sl'],False,p['Zn'],K=p['K'],A=p['A'],Sd=p['Sd'])
S=[("Intake $k$",lambda f:sens(K=K*f),0.8,1.2),("Wind",lambda f:sens(u=3*f),0.5,1.5),("Pressure",lambda f:sens(P=300*f),0.8,1.2),("Nozzle",lambda f:sens(d=4.4*f),0.85,1.15),("$S_s$",lambda f:sens(Ss=12*f),0.8,1.2),("$S_l$",lambda f:sens(Sl=18*f),0.8,1.2),("$Z_n$",lambda f:sens(Zn=30*f),0.75,1.25),("Slope (via $S_d$)",lambda f:sens(Sd=sdeff(5,1*f)),0.5,1.5)]
rows=[]
for nm,fn,lo,hi in S:
    a=fn(lo);b=fn(hi);rows.append([nm,fx(lo,2),fx(100*a['Ea'],1),fx(hi,2),fx(100*b['Ea'],1),fx(100*(b['Ea']-a['Ea']),1)])
w(tab(["Input","low factor","$E_a$ (\\%)","high factor","$E_a$ (\\%)","change (pp)"],rows,"Sensitivity of $E_a$ (base "+fx(100*base['Ea'],1)+"\\%) to the eight inputs of the layer.","tab:sens"))
w(r"""\begin{keybox}
In Table~\ref{tab:sens} the soil intake and the slope change nothing, because on the loam no point ponds, so runoff is zero in every case; the drivers are the spacings, the nozzle and the pressure (which change uniformity and the run time) and the depth $Z_n$ (a larger depth dilutes the fixed canopy loss). On a soil that ponds, intake and slope become the dominant inputs.
\end{keybox}""")
# ---- 11 season
Iy=211.68
nev=Iy/Zn;nsp=round(1e4*Af/(Ss*Sl));Qtot=nsp*q0/60;nset=math.ceil(Qtot/Qs);tround=nset*base['T']/60
grossS=base['gross']*nev
body=T(r"""The season of the loam at trigger $-300$ cm needs $I_y=211.68$ mm of irrigation (Manuscript~4, Fig.~3 data: 6.123 Mg ha$^{-1}$). For the 5 ha farm above, find the number of irrigations, the sprinklers, the sets, the round time and the gross water.

\textbf{Solution.} $n_{\rm ev}=I_y/Z_n=211.68/30=@nev@\approx@nev2@$ irrigations. Sprinklers: $n_{\rm sp}=\mathrm{round}(10^4\times5/(12\times18))=@nsp@$. Total flow $Q_{\rm tot}=@nsp@\times@q@/60=@Qt@$ L s$^{-1}$; with $Q_s=40$ L s$^{-1}$ the farm needs $n_{\rm set}=\lceil@Qt@/40\rceil=@nset@$ sets. Round time $t_{\rm round}=@nset@\times@T@/60=@tr@$ h. Gross depth per irrigation $=@g@$ mm; gross per season $=@nev@\times@g@=@gs@$ mm, i.e.\ $10\times@gs@=@gv@$ m$^3$ ha$^{-1}$. The gross is larger than the net $I_y$ because only $E_a=@Ea@\%$ of the discharge reaches the root zone usefully.""",nev=fx(nev,2),nev2=int(round(nev)),nsp=nsp,q=fx(q0,2),Qt=fx(Qtot,1),nset=nset,T=fx(base['T'],0),tr=fx(tround,1),g=fx(base['gross'],1),gs=fx(grossS,0),gv=fx(10*grossS,0),Ea=fx(100*base['Ea'],1))
w(ex("sets and water for the season",body))
# ---- 12 systems
w(r"\section{Kinds of system}"+"\n"+r"""The layer draws five systems to scale: solid-set (fixed laterals, $E_a$ typically 70--75\%), hand-move (70--75\%), centre pivot (65--70\%), linear-move (65--70\%) and travelling gun (65--70\%). A bar locates the design's $E_a$ against the range of the chosen system. The default impact layout reaches """+fx(100*base['Ea'],0)+r"""\% on the loam in the model, which lies above the ranges quoted for fixed systems: the model counts no leakage, no pipe-end effect and no pressure variation along the lateral, so the figure is an upper estimate for a well-managed set.

\section{Summary of the sprinkler layer}
\begin{itemize}
\item Discharge $q\propto d^2\sqrt P$ (13.2); reach $R=c_R\sqrt{dh}f_\alpha$ (13.3).
\item Single-sprinkler pattern from $\hat p(x)$ with a wind stretch (13.4--13.5), overlapped on the grid and scored by CU (13.6--13.7); AR $=60q/(S_sS_l)$ exactly.
\item Drift $w_d$ (13.8), ponding time $t_p=(a_e/K)^{1/(A-1)}$ (13.9), canopy retention (13.10), a closed partition $E_a+\mathrm{DP}+\mathrm{RO}+\mathrm{WD}=1$ (13.11).
\item Run time by bisection (13.12), allowed rate from Table 13.3, ten checks (13.13--13.16), Blasius pipes and pump (13.17--13.20).
\end{itemize}
""")
open('/tmp/book/p2m.tex','w').write("\n".join(O))
print(sel,D_lat,Dm,round(Hman,2),round(CV,2),round(kW,2),nfail,best,worst,bestP[:1],bestP[5],bestP[6])
