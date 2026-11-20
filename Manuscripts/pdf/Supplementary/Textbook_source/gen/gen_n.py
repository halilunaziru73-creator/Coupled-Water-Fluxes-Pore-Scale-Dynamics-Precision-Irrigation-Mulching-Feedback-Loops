import sys,math
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
from surf import soilpar,saxton
import eng2
O=[];w=O.append
def T(_s,**kw):
    for k,v in kw.items(): _s=_s.replace('@'+k+'@',str(v))
    return _s
def Fx(x):
    return sum(4*math.exp(-2*n*x)/(n*(1-math.exp(-2*n*x))) for n in range(1,400,2))
def deq(L,D,u):
    x=2*math.pi*D/L
    d=(math.pi*L/8)/(math.log(L/u)+Fx(x))
    return min(d,D)
def hooghoudt(q,K1,K2,D,h,u,L0=30.0):
    L=L0;hist=[]
    for it in range(60):
        d=deq(L,D,u);Ln=math.sqrt((8*K2*d*h+4*K1*h*h)/q);hist.append((it+1,L,d,Ln))
        if abs(Ln-L)<1e-6: L=Ln;break
        L=Ln
    return L,deq(L,D,u),hist
def hhead(q,L,K1,K2,d):
    return (-8*K2*d+math.sqrt(64*K2**2*d**2+16*K1*q*L**2))/(8*K1)
def glover(K,d,t,mu,h0,ht): return math.sqrt(math.pi**2*K*d*t/(mu*math.log(1.16*h0/ht)))
def manning(D,s,n=0.016): return (1/n)*math.pi*D**2/4*(D/4)**(2/3)*math.sqrt(s)
sp=soilpar('S06',0.468);sax=sp['sax']
Ks=sax['Ks']*24/1000  # m/d
zd=1.4;Rmax=1.0;zc=min(0.9,max(0.4,0.3+0.4*Rmax));h=zd-zc;D=5.0;r0=0.05;u=math.pi*r0
w(r"""\chapter{Drainage design}\label{ch:drain}
\markboth{Drainage design}{Drainage design}
\textbf{After this chapter you can} compute the recharge that drains must carry, solve the Hooghoudt spacing with the exact equivalent depth, check it against the falling-water-table rule of Glover and Dumm, simulate the water table through a season, size the pipes by Manning, and compute the leaching requirement.

\section{The depth to be kept free}
The crop sets how deep the water table must stay: $z_c=0.3+0.4R_{\max}$ (m), bounded to 0.4--0.9 m, with $R_{\max}$ the rooting depth. The allowed head of the water table above the drain level, midway between the drains, is then $h=z_d-z_c$ (drain depth less $z_c$).
""")
body=T(r"""Maize roots to 1.0 m; drains lie 1.4 m deep. Find $z_c$ and $h$. Then repeat for a shallow-rooted crop ($R_{\max}=0.3$ m) and a deep one ($R_{\max}=1.8$ m).

\textbf{Solution.} Maize: $z_c=0.3+0.4\times1.0=0.70$ m, within 0.4--0.9, so $h=1.4-0.70=0.70$ m. Shallow crop: $0.3+0.12=0.42$ m, so $h=0.98$ m: the drains may let the water table rise higher between them. Deep crop: $0.3+0.72=1.02$ m, clipped to 0.9 m, so $h=0.50$ m. The deeper the roots, the closer the drains must be.""")
w(ex("the water table limit",body))
w(r"\section{Recharge and the design discharge}"+"\n"+r"""The recharge is the deep percolation of the daily balance plus the part of the applied irrigation lost to deep percolation by the irrigation design in use (DP times gross water, gross $=$ net$/E_a$). The design discharge $q$ is the 95th percentile of the three-day mean recharge of the season, between 2 and 25 mm d$^{-1}$.
""")
res=eng2.run('S06',300,P=900.,Eyr=170.,Tyr=230.,Ibar=150.,seed=3)
log=res['log'];Dd=np.array([x[5] for x in log]);irr=np.array([x[4] for x in log]);rain=np.array([x[2] for x in log])
dpfrac=0.060/0.820
rec=Dd+irr*dpfrac
m3=np.convolve(rec,np.ones(3)/3,mode='valid')
q95=np.percentile(m3,95);qd=min(25,max(2,q95))
w(T(r"""\begin{example}{design discharge from the daily balance}
The daily bucket model (Chapter~\ref{ch:e2}) of the loam is run for a wet year ($P=900$ mm, seed 3). It gives rainfall @P@ mm, irrigation @I@ mm, deep percolation @DD@ mm. The sprinkler layout of Chapter~\ref{ch:sprinkler} loses $\mathrm{DP}=6.0\%$ of the gross, $E_a=82\%$, so each irrigation adds $0.060/0.820=0.0732$ times its net depth to the recharge: $@ia@$ mm over the season. Total recharge $=@DD@+@ia@=@tot@$ mm. The three-day means have 95th percentile $@q95@$ mm d$^{-1}$, inside 2--25 mm d$^{-1}$, so $q=@qd@$ mm d$^{-1}=@qm@$ m d$^{-1}$.

\textbf{Reading.} By construction 5\% of the three-day windows carry more recharge than the design value; the drains are not sized for those.
\end{example}
""",P=fx(rain.sum(),0),I=fx(irr.sum(),0),DD=fx(Dd.sum(),0),ia=fx((irr*dpfrac).sum(),1),tot=fx(rec.sum(),0),q95=fx(q95,2),qd=fx(qd,2),qm=fx(qd/1000,5)))
# Hooghoudt
w(r"\section{Spacing: Hooghoudt with the exact equivalent depth}"+"\n"+r"""For steady flow, with recharge $q$ (m d$^{-1}$), water table height $h$ midway, conductivities $K_1$ above and $K_2$ below the drain, the spacing $L$ is
\begin{equation}qL^2=8K_2dh+4K_1h^2.\end{equation}
The equivalent depth $d$ replaces the real depth $D$ of the barrier below the drain because the flow converges radially on the drain; the layer solves the series of Moody and van Beers rather than reading a table:
\begin{equation}d=\frac{\pi L/8}{\ln(L/u)+F(x)},\quad F(x)=\sum_{n=1,3,5,\dots}\frac{4e^{-2nx}}{n(1-e^{-2nx})},\quad x=\frac{2\pi D}L,\quad d\le D,\end{equation}
with $u=\pi r_0$ the wetted perimeter of a pipe running half full. Because $d$ depends on $L$, the pair is iterated.
""")
K2=Ks*1.0
L,dd,hist=hooghoudt(qd/1000,Ks,K2,D,h,u)
rows=[[i,fx(Lc,3),fx(dc,3),fx(Ln,3)] for i,Lc,dc,Ln in hist[:8]]
w(tab(["Iteration","$L$ used (m)","$d$ (m)","$L$ new (m)"],rows,"Iteration of the spacing: $q=%s$ mm d$^{-1}$, $K_1=K_2=%s$ m d$^{-1}$, $D=5$ m, $h=0.70$ m, $r_0=0.05$ m."%(fx(qd,2),fx(Ks,3)),"tab:hoogit"))
x=2*math.pi*D/L
body=T(r"""Verify the converged spacing of Table~\ref{tab:hoogit}.

\textbf{Solution.} At $L=@L@$ m: $x=2\pi\times5/@L@=@x@$. $F(x)=4e^{-2x}/(1-e^{-2x})+\dots=@F@$ (the $n=1$ term dominates). $u=\pi\times0.05=0.1571$ m, $\ln(L/u)=\ln(@L@/0.1571)=@ln@$. Then $d=(\pi\times@L@/8)/(@ln@+@F@)=@num@/@den@=@d@$ m ($<D$). Check the spacing: $8K_2dh=8\times@K@\times@d@\times0.70=@a@$, $4K_1h^2=4\times@K@\times0.49=@b@$; sum $=@s@$; $L^2=@s@/@qm@=@L2@$, $L=@L@$ m. ({\it Without} the correction, using $d=D=5$ m, the spacing would be $\sqrt{(8\times@K@\times5\times0.7+@b@)/@qm@}=@Lw@$ m: the radial-flow correction matters.)""",L=fx(L,2),x=fx(x,3),F=fx(Fx(x),4),ln=fx(math.log(L/u),3),num=fx(math.pi*L/8,3),den=fx(math.log(L/u)+Fx(x),3),d=fx(dd,3),K=fx(Ks,3),a=fx(8*K2*dd*h,4),b=fx(4*Ks*h*h,4),s=fx(8*K2*dd*h+4*Ks*h*h,4),qm=fx(qd/1000,5),L2=fx(L**2,1),Lw=fx(math.sqrt((8*K2*5*h+4*Ks*h*h)/(qd/1000)),1))
w(ex("one converged step",body))
# soils
rows=[];sres={}
for sid in IDS:
    s_=soilpar(sid,0.468);K=s_['sax']['Ks']*24/1000;Ls,ds_,_=hooghoudt(qd/1000,K,K,D,h,u)
    sres[sid]=(K,Ls,ds_);rows.append([SOIL[sid][0],fx(K,3),fx(Ls,1),fx(ds_,2),fx(1e4/Ls,0)])
w(tab(["Soil","$K$ (m/d)","$L$ (m)","$d$ (m)","pipe (m/ha)"],rows,"The same drains in the ten soils: $q=%s$ mm d$^{-1}$, $z_d=1.4$ m, $h=0.70$ m, $D=5$ m, $K_2=K_1$ (Saxton--Rawls $K_s$)."%fx(qd,2),"tab:drsoils"))
Lmin=min(sres,key=lambda s:sres[s][1]);Lmax=max(sres,key=lambda s:sres[s][1])
w(r"\begin{keybox}Table~\ref{tab:drsoils} runs from "+fx(sres[Lmin][1],1)+" m ("+SOIL[Lmin][0]+") to "+fx(sres[Lmax][1],1)+r" m ("+SOIL[Lmax][0]+r"). The spacing scales roughly with $\sqrt K$ (a tenfold increase in $K$ gives a spacing about three times larger), so the pipe per hectare, $10^4/L$ metres, is the cost driver of a drainage scheme in the finer soils.\end{keybox}")
# Glover Dumm
mu=min(0.25,max(0.03,sax['ths']*0.95-sax['th33']))
t=3;h0=h;ht=0.3*h0 if False else 0.35
Kw=Ks;Lgd=glover(Kw,dd,t,mu,0.7,0.35)
body=T(r"""After a wet spell the water table must fall from $h_0=0.70$ m to $h_t=0.35$ m above the drain within $t=3$ d. The drainable porosity of the loam is $\mu=0.95\theta_s-\theta_{33}=@mu@$ (between 0.03 and 0.25). Find the spacing from $L^2=\pi^2Kdt/[\mu\ln(1.16h_0/h_t)]$ and compare with the steady value.

\textbf{Solution.} $\ln(1.16\times0.70/0.35)=\ln2.32=@ln@$. $L^2=\pi^2\times@K@\times@d@\times3/(@mu@\times@ln@)=@n@/@m@=@L2@$, $L=@Lg@$ m. The steady (Hooghoudt) spacing is @L0@ m, so the design takes the closer, $L=\min=@Lmin@$ m. (Using $d=@d@$ m from the steady solution; the layer iterates $d$ with $L$ in the same way.)""",mu=fx(mu,3),ln=fx(math.log(1.16*0.7/0.35),3),K=fx(Ks,3),d=fx(dd,3),n=fx(math.pi**2*Ks*dd*3,3),m=fx(mu*math.log(1.16*0.7/0.35),4),L2=fx(Lgd**2,1),Lg=fx(Lgd,1),L0=fx(L,1),Lmin=fx(min(L,Lgd),1))
w(ex("falling water table",body))
Lfin=min(L,Lgd)
# water table simulation
w(r"\section{The water table through the season}"+"\n"+r"""The daily balance is $\mu\,dh/dt=R-q_{\rm out}(h-g)$ with the outflow $q_{\rm out}(h)=(8K_2dh+4K_1h^2)/L^2$ (six sub-steps a day), $R$ the recharge of the day and $g$ the height of the control gate (zero for plain drains). The results are the days with the water table shallower than the crop needs, the $\mathrm{SEW}_{30}$ of Sieben (the sum over the days of $30-z$, in cm, when the water table is shallower than 30 cm), the drained water, the maximum outflow, and for the gate the water held, $\mu g$.
""")
def wt(L_,g=0.0,mu_=mu,K1=Ks,K2_=Ks,d_=dd,zd_=zd,zc_=zc):
    hh=0.0;zs=[];qo=[];drained=0
    for r in rec/1000:
        for _ in range(6):
            qout=(8*K2_*d_*max(hh-g,0)+4*K1*max(hh-g,0)**2)/L_**2
            hh=hh+(r/6-qout/6)/mu_;hh=max(0,min(hh,zd_));drained+=qout/6
        zs.append(zd_-hh);qo.append(qout)
    zs=np.array(zs);days=int((zs<zc_).sum());sew=float(np.maximum(0,30-zs*100)[zs<0.3].sum())
    return days,sew,drained*1000,max(qo)*1000,zs
rows=[]
for Lt in (Lfin,22.8,35.0,50.0,70.0):
    dys,sew,dr,qmx,_=wt(Lt);rows.append([fx(Lt,1),dys,fx(sew,0),fx(dr,0),fx(qmx,2)])
w(tab(["$L$ (m)","days $z<z_c$","SEW$_{30}$","drained (mm)","max outflow (mm/d)"],rows,"Water-table results for the wet-year recharge at four spacings ($d$ kept at the design value).","tab:wtsim"))
rows=[]
for g in (0.0,0.1,0.2,0.3):
    dys,sew,dr,qmx,_=wt(Lfin,g);rows.append([fx(g,2),dys,fx(sew,0),fx(dr,0),fx(mu*g*1000,1)])
w(tab(["gate $g$ (m)","days $z<z_c$","SEW$_{30}$","drained (mm)","water held $\\mu g$ (mm)"],rows,"Controlled drainage: gate height at the design spacing.","tab:gate"))
dg=wt(Lfin,0.0)[0]
body=T(r"""Table~\ref{tab:wtsim} and Table~\ref{tab:gate} come from the same recharge series. Read what they say about spacing and the gate.

\textbf{Solution.} At the design spacing $L=@L@$ m the water table is shallower than $z_c=0.70$ m on @dg@ day(s). Widening the spacing to 50 m raises that to @d2@ days (SEW$_{30}$ = @s2@) and to 70 m, @d3b@ days. A gate raised by 0.3 m holds $\mu g=@hold@$ mm in the soil (the loam's $\mu=@mu@$) and changes the number of days shallower than $z_c$ to @d3@. The gate saves water for the crop but costs aeration if it is raised beyond the largest height that keeps the water table below the crop; the layer displays that limit.""",L=fx(Lfin,1),dg=dg,d2=wt(50.0)[0],s2=fx(wt(50.0)[1],0),d3b=wt(70.0)[0],hold=fx(mu*0.3*1000,0),mu=fx(mu,3),d3=wt(Lfin,0.3)[0])
w(ex("spacing and gate in the season",body))
# pipes
w(r"\section{Pipes}"+"\n"+r"""Drain pipes are sized by the Manning equation for a full pipe,
\begin{equation}Q=\frac1n\,\frac{\pi D^2}4\left(\frac D4\right)^{2/3}s^{1/2},\quad n=0.016\ \text{(corrugated polyethylene)},\end{equation}
choosing the smallest standard size (80--500 mm) that carries the design flow at no more than 80\% of its capacity. The lateral flow is $qLL_{\rm lat}$ and the collector flow is $qA$. Silt settles when the full-pipe velocity is below 0.3 m s$^{-1}$.
""")
Lf=Lfin;Llat=min(400,200.0);qd_m=qd/1000;Qlat=qd_m*Lf*Llat/86400
sizes=[80,100,125,160,200,250,315,400,500]
s=0.002
rows=[]
for Dp in sizes:
    Q=manning(Dp/1000,s);rows.append([Dp,fx(Q*1000,2),fx(0.8*Q*1000,2),fx(Q/(math.pi*(Dp/1000)**2/4),2)])
w(tab(["$D$ (mm)","$Q_{\\rm full}$ (L/s)","$0.8Q$ (L/s)","$v$ (m/s)"],rows,"Manning capacity of corrugated pipe at slope 0.2\\%.","tab:pipe"))
Dsel=next((Dp for Dp in sizes if 0.8*manning(Dp/1000,s)>=Qlat),500)
A_=400*300/1e4;Qcol=qd_m*400*300/86400
Dcol=next((Dp for Dp in sizes if 0.8*manning(Dp/1000,s)>=Qcol),500)
body=T(r"""The field is 400 m $\times$ 300 m; laterals run 200 m at slope 0.2\%. Size the lateral and the collector.

\textbf{Solution.} The lateral drains a strip $L=@L@$ m wide and 200 m long: $Q=qLL_{\rm lat}=@qm@\times@L@\times200=@V@$ m$^3$ d$^{-1}=@Ql@$ L s$^{-1}$. With 80\% of capacity allowed, Table~\ref{tab:pipe} gives the smallest pipe whose $0.8Q$ exceeds @Ql@ L s$^{-1}$: $D=@Dsel@$ mm. The collector carries the whole 12 ha: $Q=qA=@qm@\times120{,}000=@Vc@$ m$^3$ d$^{-1}=@Qc@$ L s$^{-1}$, so $D=@Dcol@$ mm. The full-pipe speed of the lateral is @v@ m s$^{-1}$, @sil@ the silting limit of 0.3 m s$^{-1}$.""",L=fx(Lf,1),qm=fx(qd_m,5),V=fx(qd_m*Lf*200,2),Ql=fx(Qlat*1000,3),Dsel=Dsel,Vc=fx(qd_m*120000,1),Qc=fx(Qcol*1000,2),Dcol=Dcol,v=fx(manning(Dsel/1000,s)/(math.pi*(Dsel/1000)**2/4),2),sil="above" if manning(Dsel/1000,s)/(math.pi*(Dsel/1000)**2/4)>=0.3 else "below")
w(ex("pipes of the scheme",body))
# leaching
w(r"\section{Salt and the leaching requirement}"+"\n"+r"""The leaching requirement of Rhoades is $LR=EC_w/(5EC_e-EC_w)$, with $EC_w$ the salinity of the irrigation water and $EC_e$ the salinity of the saturation extract the crop tolerates (dS m$^{-1}$); the gross irrigation is $\mathrm{net}/(1-LR)$ when $LR$ is added to the need.
""")
rows=[[ece,fx(0.5,1),fx(0.5/(5*ece-0.5),4),fx(1.5,1),fx(1.5/(5*ece-1.5),4)] for ece in (1.5,3,6,10)]
w(tab(["$EC_e$","$EC_w$","$LR$","$EC_w$","$LR$"],rows,"Leaching requirement for two water qualities.","tab:lr"))
body=T(r"""Irrigation water of 1.5 dS m$^{-1}$ is applied to a crop that tolerates $EC_e=3$ dS m$^{-1}$ (a moderately sensitive crop), net need 211.68 mm. Find $LR$ and the gross.

\textbf{Solution.} $LR=1.5/(5\times3-1.5)=1.5/13.5=0.1111$. Gross $=211.68/(1-0.1111)=@g@$ mm: an extra @e@ mm, which must leave through the drains. For $EC_e=6$: $LR=1.5/28.5=0.0526$ and the extra is only @e6@ mm. The more tolerant the crop, the less water the drains have to carry away for salt.""",g=fx(211.68/(1-1.5/13.5),1),e=fx(211.68/(1-1.5/13.5)-211.68,1),e6=fx(211.68/(1-1.5/28.5)-211.68,1))
w(ex("leaching requirement",body))
w(r"""\section{Summary of the drainage layer}
\begin{itemize}
\item Depth limit $z_c=0.3+0.4R_{\max}$; allowed head $h=z_d-z_c$.
\item Design discharge $=$ 95th percentile of the three-day recharge (rain and irrigation losses).
\item Spacing: Hooghoudt with Moody--van Beers equivalent depth; Glover--Dumm for the falling table; the closer governs.
\item Season: $\mu\,dh/dt=R-q_{\rm out}(h-g)$; $\mathrm{SEW}_{30}$; gate holds $\mu g$.
\item Pipes by Manning at 80\% capacity; leaching $LR=EC_w/(5EC_e-EC_w)$.
\end{itemize}
""")
open('/tmp/book/p2n.tex','w').write("\n".join(O))
print(qd,Ks,L,dd,Lgd,mu,dg,[ (r[0],r[1]) for r in rows[:0]],Dsel,Dcol)
