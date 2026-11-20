import sys,math
sys.path.insert(0,'/tmp/book/gen')
from lib import *
from surf import *
import gen_j
from gen_j import sp,sax,run,score,Zn,base
import numpy as np
O=[];w=O.append
d=run()
w(r"""\section{Advance: the volume balance}
For an inflow $Q$ (m$^3$ min$^{-1}$) the front position solves $Qt=\sigma_yA_0x+\sigma_zkt^AwX$, hence
\begin{equation}x(t)=\frac{Qt}{\sigma_yA_0+\sigma_zk\,t^{A}\,w},\qquad\sigma_z=\frac{A+r(1-A)+1}{(1+A)(1+r)},\qquad r=\frac{\ln2}{\ln(t_L/t_{L/2})},\end{equation}
with $\sigma_y=0.8$. The exponent $r$ is found by iterating ten times from $\sigma_z=0.8$, using the times $t_L$ and $t_{L/2}$ at which the front reaches $L$ and $L/2$.
""")
# iteration table
A=sp['A'];k=sp['k'];Qm=1.2*60/1000;A0=d['A0'];wv=0.75;L=180
def xof(t,sz): return Qm*t/(0.8*A0+sz*k*t**A*wv)
def tof(x,sz):
    lo,hi=1e-6,1e7
    for _ in range(100):
        mid=math.sqrt(lo*hi)
        if xof(mid,sz)<x: lo=mid
        else: hi=mid
    return math.sqrt(lo*hi)
sz=0.8;rows=[]
for it in range(1,11):
    tL=tof(L,sz);tH=tof(L/2,sz);r=math.log(2)/math.log(tL/tH);szn=(A+r*(1-A)+1)/((1+A)*(1+r))
    rows.append([it,f"{sz:.4f}",f"{tL:.2f}",f"{tH:.2f}",f"{r:.4f}",f"{szn:.4f}"]);sz=szn
body=f"""Find the advance of the front in the furrow field of this chapter. Inflow $Q=1.2$ L s$^{{-1}}$ $=0.072$ m$^3$ min$^{{-1}}$, $A_0={A0:.5f}$ m$^2$, $k={k:.6f}$, $A={A:.4f}$, $w=0.75$ m, $L=180$ m.

\\textbf{{Solution.}} Start with $\\sigma_z=0.8$. Solve $x(t)=L$ and $x(t)=L/2$ by bisection on $t$ (Equation above), then $r=\\ln2/\\ln(t_L/t_{{L/2}})$ and the new $\\sigma_z$. Table~\\ref{{tab:iterr}} shows the ten iterations; the converged values are $\\sigma_z={d['sz']:.4f}$, $r={d['r']:.4f}$. The advance time to the end is $t_L={d['tL']:.1f}$ min ({d['tL']/60:.2f} h)."""
body+=tab(["Iter.","$\\sigma_z$ (in)","$t_L$ (min)","$t_{L/2}$ (min)","$r$","$\\sigma_z$ (out)"],rows,"Iteration for the advance exponent.","tab:iterr")
body+=f"\\textbf{{Check by hand at the converged $\\sigma_z$.}} $x(t_L)=0.072({d['tL']:.1f})/(0.8\\times{A0:.5f}+{d['sz']:.4f}\\times{k:.6f}\\times{d['tL']:.1f}^{{{A:.4f}}}\\times0.75)={Qm*d['tL']/(0.8*A0+d['sz']*k*d['tL']**A*0.75):.1f}$ m, which equals $L=180$ m."
w(ex("the advance of the front",body))
rows=[]
for xx in [20,45,90,135,180]:
    t=tof(xx,d['sz']);rows.append([xx,f"{t:.1f}",f"{t/60:.2f}"])
body=r"""Give the advance times to 20, 45, 90, 135 and 180 m, and check that the advance follows $x=pt^r$.

\textbf{Solution.} Solve $x(t)=x$ at the converged $\sigma_z$ (Table~\ref{tab:adv}). The ratio of the times for $x=90$ and $x=180$ is """+f"{tof(90,d['sz'])/tof(180,d['sz']):.3f}"+f" and $2^{{-1/r}}=2^{{-1/{d['r']:.4f}}}={2**(-1/d['r']):.3f}$: the two agree, because $r$ was derived from exactly these two times. Between 20 and 45 m the same exponent gives $t_{{45}}/t_{{20}}=({45/20:.3f})^{{1/r}}={(45/20)**(1/d['r']):.2f}$ against the computed {tof(45,d['sz'])/tof(20,d['sz']):.2f}; the power law is an approximation of the volume balance, good in the middle of the field."
body+=tab(["$x$ (m)","$t_x$ (min)","$t_x$ (h)"],rows,"Advance times.","tab:adv")
w(ex("advance table",body))
# cutoff & efficiencies
w(r"""\section{Cut-off, depths and efficiencies}
The time to infiltrate the required depth is $t_{st}=(Z_n/k)^{1/A}$; the cut-off time is $t_L+t_{st}$ (``$E_s=1$'': the tail receives exactly $Z_n$), or $t_x(0.85L)+t_{st}$, or manual. The infiltrated depth is $Z(x)=k[t_{co}-t_x(x)]^A$ with $Z_0=kt_{co}^A$ at the inlet and $Z_L=k(t_{co}-t_L)^A$ at the tail. The volumes are $V_{app}=Qt_{co}$, $V_{req}=Z_nLw$, $V_{inf}=w\int Z\,dx$, $V_{st}=w\int\min(Z,Z_n)dx$, $V_{dp}=w\int\max(Z-Z_n,0)dx$, $V_{ro}=\max(V_{app}-V_{inf},0)$, and
\begin{equation}E_a=\frac{V_{st}}{V_{app}},\ E_s=\frac{V_{st}}{V_{req}},\ DP=\frac{V_{dp}}{V_{app}},\ RO=\frac{V_{ro}}{V_{app}},\ CU=100\Bigl(1-\frac1{N+1}\sum_{i=0}^N\frac{|Z_i-\bar Z|}{\bar Z}\Bigr)\%.\end{equation}
""")
body=f"""Compute the cut-off, depths, volumes and efficiencies of the design.

\\textbf{{Solution.}} 1. Opportunity time to infiltrate $Z_n$: $t_{{st}}=(0.0733/{k:.6f})^{{1/{A:.4f}}}=({0.0733/k:.2f})^{{{1/A:.4f}}}={d['tst']:.1f}$ min. 2. Cut-off $t_{{co}}=t_L+t_{{st}}={d['tL']:.1f}+{d['tst']:.1f}={d['tco']:.1f}$ min ({d['tco']/60:.2f} h). 3. Inlet depth $Z_0=k t_{{co}}^A={d['Z0']*1000:.1f}$ mm; tail depth $Z_L=k(t_{{co}}-t_L)^A={d['ZL']*1000:.1f}$ mm ($=Z_n$ by construction). 4. Volumes (per furrow): $V_{{app}}=0.072\\times{d['tco']:.1f}={d['Vapp']:.3f}$ m$^3$; $V_{{req}}=0.0733\\times180\\times0.75={d['Vreq']:.3f}$ m$^3$; trapezoidal integration with $N=300$ gives $V_{{inf}}={d['Vinf']:.3f}$, $V_{{st}}={d['Vst']:.3f}$, $V_{{dp}}={d['Vdp']:.3f}$, $V_{{df}}={d['Vdf']:.3f}$ and runoff $V_{{ro}}={d['Vro']:.3f}$ m$^3$. 5. Efficiencies: $E_a={d['Ea']:.3f}$, $E_s={d['Es']:.3f}$, $DP={d['DP']:.3f}$, $RO={d['RO']:.3f}$, $CU={d['CU']:.1f}$ per cent. \\textbf{{Closure:}} $E_a+DP+RO={d['Ea']+d['DP']+d['RO']:.4f}$."""
body+=f"\n\n\\textbf{{Reading.}} The tail gets exactly the required depth ($E_s=1$), the field is very uniform ($CU={d['CU']:.0f}$), but {100*d['RO']:.0f} per cent of the water runs off the end because the front advances for only {d['tL']:.0f} minutes of the {d['tco']:.0f}: with no cutback the long soaking time lets the stream run to waste. The application prints this as the closed balance of the irrigation, and the design table below tries to recover it."
w(ex("cut-off, depths and efficiencies",body))
# straight-line profile
body=f"""The lecture method replaces $Z(x)$ by the straight line between $Z_0$ and $Z_L$. Compare the line with the exact curve at $x=0.25L,0.5L,0.75L$ and find the distance $X=L(Z_0-Z_n)/(Z_0-Z_L)$ at which the line crosses $Z_n$.

\\textbf{{Solution.}} Exact: $Z(x)=k[t_{{co}}-t_x(x)]^A$. Line: $Z_0+(Z_L-Z_0)x/L$ with $Z_0={d['Z0']*1000:.1f}$ and $Z_L={d['ZL']*1000:.1f}$ mm."""
rows=[]
for fr in [0.25,0.5,0.75]:
    xx=fr*L;t=tof(xx,d['sz']);ze=k*(d['tco']-t)**A*1000;zl=(d['Z0']+(d['ZL']-d['Z0'])*fr)*1000
    rows.append([f"{xx:.0f}",f"{t:.1f}",f"{ze:.1f}",f"{zl:.1f}",f"{ze-zl:+.2f}"])
body+=tab(["$x$ (m)","$t_x$ (min)","exact (mm)","line (mm)","exact$-$line"],rows,"Exact and straight-line infiltrated depth.","tab:line")
body+=f"\nThe line crosses $Z_n$ at the tail: $X=180({d['Z0']*1000:.1f}-73.3)/({d['Z0']*1000:.1f}-{d['ZL']*1000:.1f})=180$ m, because $Z_L=Z_n$. The exact curve lies slightly below the line (it is convex), so the straight-line method slightly overestimates the infiltrated depth and the deep percolation."
w(ex("exact depth against the straight line",body))
# best inflow
S_=0.30;qmax=min(4.0,0.04/S_*1000/60);qs=np.linspace(0.2,qmax,25)
res=[]
for q in qs:
    dd=run(q=float(q));res.append((q,dd['Ea'],dd['Es'],dd['Ea']*dd['Es'],dd['tL'],dd['tco']))
best=max(res,key=lambda r:r[3])
rows=[[f"{r[0]:.3f}",f"{r[1]:.3f}",f"{r[2]:.3f}",f"{r[3]:.3f}",f"{r[4]:.0f}",f"{r[5]:.0f}"] for r in res[::2]]
body=f"""In \\emph{{Your soil}} mode the inflow is the one among 25 equally spaced values between $q_{{\\min}}=0.2$ and $q_{{\\max}}$ that maximises $E_aE_s$, where for a furrow $q_{{\\max}}=\\min\\{{q_{{\\max}}^{{\\rm sys}},\\frac{{0.04}}S\\frac{{1000}}{{60}}\\}}$ L s$^{{-1}}$ ($S$ in per cent; the non-erosive stream, close to $0.67/S$). Find it for $S=0.30$ per cent.

\\textbf{{Solution.}} $\\frac{{0.04}}{{0.30}}\\times\\frac{{1000}}{{60}}={0.04/0.3*1000/60:.2f}$ L s$^{{-1}}$, below the system limit of 4, so $q_{{\\max}}={qmax:.2f}$ L s$^{{-1}}$ and the grid has step $({qmax:.2f}-0.2)/24={(qmax-0.2)/24:.4f}$. Evaluating the design at each value (Table~\\ref{{tab:qbest}} lists every second one) gives the maximum of $E_aE_s$ at $q={best[0]:.3f}$ L s$^{{-1}}$ with $E_a={best[1]:.3f}$ and $E_s={best[2]:.3f}$ ($E_aE_s={best[3]:.3f}$)."""
body+=tab(["$q$ (L/s)","$E_a$","$E_s$","$E_aE_s$","$t_L$ (min)","$t_{co}$ (min)"],rows,"Efficiency against inflow (no cutback, $E_s=1$ cut-off).","tab:qbest")
body+=r"""\textbf{Reading.} A larger stream advances faster, shortens $t_L$ and therefore the soaking time of the inlet, so deep percolation falls; but more of it reaches the tail and runs off. The optimum balances the two losses."""
w(ex("the best inflow",body))
# design table search
def sc(dd,cb): return score(dd,cb)
cur=dict(q=float(best[0]),L=180,cb=1.0);dcur=run(**cur);scur=sc(dcur,1.0)
log=[("start",cur.copy(),dcur,scur)]
def tryset(par,cands,name):
    global cur,dcur,scur
    bestc=None
    for cnd in cands:
        c2=dict(cur);c2.update(cnd)
        for mult in ([None] if name=='cutoff' else [0.62,0.74,0.85,0.92,1.0,1.02]):
            c3=dict(c2)
            if mult is not None: 
                base_d=run(**{k:v for k,v in c2.items() if k!='tco'});c3['tco']=base_d['tco']*mult
            dd=run(**c3);s=sc(dd,c3.get('cb',1.0))
            if bestc is None or s>bestc[0]: bestc=(s,c3,dd)
    if bestc and bestc[0]>scur+0.003:
        cur,dcur,scur=bestc[1],bestc[2],bestc[0];log.append((name,cur.copy(),dcur,scur));return True
    return False
tco0=lambda: run(**{k:v for k,v in cur.items() if k!='tco'})['tco']
moves=['cutoff','inflow','cutback','length','cutoff','cutback','inflow','length','cutoff','cutback']
for mv in moves:
    if mv=='cutoff':
        t0=dcur['tco'];cands=[{'tco':t0*mm} for mm in [0.5,0.58,0.66,0.74,0.8,0.85,0.9,0.95,1,1.05,1.1,1.2]]
        # direct (no inner mult)
        bestc=None
        for cnd in cands:
            c3=dict(cur);c3.update(cnd);dd=run(**c3);s=sc(dd,c3.get('cb',1.0))
            if bestc is None or s>bestc[0]: bestc=(s,c3,dd)
        if bestc[0]>scur+0.003: cur,dcur,scur=bestc[1],bestc[2],bestc[0];log.append((mv,cur.copy(),dcur,scur))
    elif mv=='inflow': tryset('q',[{'q':float(v)} for v in np.geomspace(0.2,qmax,12)],mv)
    elif mv=='cutback': tryset('cb',[{'cb':v} for v in [1,0.85,0.7,0.6,0.5,0.4,0.3,0.25,0.2]],mv)
    else: tryset('L',[{'L':int(round(v/5)*5)} for v in np.geomspace(60,min(400,1.5*180),11)],mv)
    if dcur['Ea']>=0.85 and dcur['Es']>=0.80: break
rows=[[nm,f"{c['q']:.2f}",c['L'],c.get('cb',1.0),f"{dd['tco']:.0f}",f"{dd['Ea']:.3f}",f"{dd['Es']:.3f}",f"{dd['DP']:.3f}",f"{dd['RO']:.3f}",f"{s:+.3f}"] for nm,c,dd,s in log]
body=r"""The design table moves one variable at a time (cut-off, inflow, cutback, length, \dots), keeping a candidate only if the score
\begin{equation}\mathrm{score}=\min(E_a,1)-3\max(0,0.8-E_s)-3[cb<1]\max(0,0.05-RO)-5\max(0,E_a-1)\end{equation}
improves by more than $0.003$. The target is $E_a\ge85$ per cent with $E_s\ge80$ per cent. Start from the best-inflow design and run the search.

\textbf{Solution.} The score of the start is $E_a-3\max(0,0.8-E_s)=""" + f"{log[0][2]['Ea']:.3f}-0={log[0][3]:.3f}$. Each accepted move is listed in Table~\\ref{{tab:dtable}}. "
body+=tab(["Move","$q$","$L$","cutback","$t_{co}$","$E_a$","$E_s$","DP","RO","score"],rows,"Accepted moves of the design table (loam, furrow).","tab:dtable")
fin=log[-1]
body+=f"The search ends with $E_a={fin[2]['Ea']:.3f}$, $E_s={fin[2]['Es']:.3f}$, DP$={fin[2]['DP']:.3f}$, RO$={fin[2]['RO']:.3f}$"+(" and meets the target." if fin[2]['Ea']>=0.85 and fin[2]['Es']>=0.8 else f" and does \\emph{{not}} reach $E_a\\ge0.85$ with $E_s\\ge0.80$; the layer would then say so and suggest a shorter field, tailwater reuse, drip or sprinklers.")
w(ex("the design table",body))
# tornado
fin_cfg=fin[1];base_cfg=dict(fin_cfg)
def evalcfg(k_mult=1,A_mult=1,q_mult=1,L_mult=1,Zn_mult=1,n_mult=1,S_mult=1):
    cfg=dict(base_cfg);L=cfg['L']*L_mult;q=cfg['q']*q_mult
    dd=design(L,0.30*S_mult,q,0.04*n_mult,0.75,sp['k']*k_mult,min(0.95,sp['A']*A_mult),Zn*Zn_mult,cb=cfg.get('cb',1.0),tco_in=cfg.get('tco'))
    return dd['Ea']
e0=evalcfg()
rows=[];tor=[]
for nm,kw,pl in [("Intake $k$",'k_mult',0.2),("Intake $A$",'A_mult',0.1),("Inflow $q$",'q_mult',0.2),("Length $L$",'L_mult',0.2),("Required depth $Z_n$",'Zn_mult',0.2),("Roughness $n$",'n_mult',0.3),("Slope $S$",'S_mult',0.3)]:
    lo=evalcfg(**{kw:1-pl})-e0;hi=evalcfg(**{kw:1+pl})-e0
    tor.append((max(abs(lo),abs(hi))*100,nm,pl,lo*100,hi*100))
tor.sort(reverse=True)
rows=[[nm,f"$\\pm${int(pl*100)}\\%",f"{lo:+.1f}",f"{hi:+.1f}",f"{mx:.1f}"] for mx,nm,pl,lo,hi in tor]
body=f"""Each of seven inputs is moved down and up while the others are held (cut-off fixed at the design's value), and the change of $E_a$ is reported in percentage points, sorted by the larger absolute change. Compute it around the final design ($E_a={e0:.3f}$).

\\textbf{{Solution.}} For the intake coefficient $k$ ($\\pm20$ per cent) the design is re-run with $0.8k$ and $1.2k$; $E_a$ changes by the amounts of Table~\\ref{{tab:torn}}. The printed value is $\\max(|\\Delta E_a^-|,|\\Delta E_a^+|)$."""
body+=tab(["Input","Perturbation","$\\Delta E_a^-$ (pts)","$\\Delta E_a^+$ (pts)","max"],rows,"Local sensitivity of the application efficiency.","tab:torn")
body+=f"\nThe ranking is {', '.join(r[1] for r in tor[:3])} first: those are the inputs around which a design should be tested. The test is local to this layout and not a global importance."
w(ex("tornado chart",body))
# season and farm
Zg=fin[2]['Vapp']/(fin[1]['L']*0.75)*1000
nev=150/73.3;Zs=nev*Zg;N0M=30/fin[1]['q'];units=120/0.75;nsets=max(1,math.ceil(units/N0M));Ttot=nsets*fin[2]['tco']/60
body=f"""Season and farm (Equation 11.24 of the application): with the net irrigation $\\sum I=150$ mm of the working year, $Z_n=73.3$ mm, farm supply $Q_s=30$ L s$^{{-1}}$, field width $W_f=120$ m, find the number of events, the gross depth, the seasonal depth, the number of furrows run at once, the number of sets and the pumping time.

\\textbf{{Solution.}} $n_{{ev}}=150/73.3={nev:.2f}$ events (rounded, about {round(nev)}). Gross depth per event $Z_g=V_{{app}}/(Lw)\\times1000={fin[2]['Vapp']:.3f}/({fin[1]['L']}\\times0.75)\\times1000={Zg:.1f}$ mm; $Z_{{season}}=n_{{ev}}Z_g={Zs:.0f}$ mm, that is ${10*Zs:.0f}$ m$^3$ ha$^{{-1}}$. Furrows at once: $N_{{0M}}=Q_s/q=30/{fin[1]['q']:.2f}={N0M:.1f}$; units: $N_{{units}}=W_f/w=120/0.75=160$; sets: $N_{{sets}}=\\max(1,\\lceil160/{N0M:.1f}\\rceil)={nsets}$; total set time $T_{{tot}}={nsets}\\times{fin[2]['tco']:.0f}/60={Ttot:.1f}$ h per round, so the season pumps $n_{{ev}}T_{{tot}}={nev*Ttot:.0f}$ hours."""
w(ex("season and farm",body))
# sand failure
sps=soilpar('S03',0.842)
Zns=0.0505
ds=design(180,0.30,1.2,0.04,0.75,sps['k'],sps['A'],Zns,tco_in=2880)
# x max
body=f"""A furrow in the sand S03 ($f_T=0.842$, $Z_n=50.5$ mm) with the same layout. Find its intake and what happens to the advance.

\\textbf{{Solution.}} Pedotransfer: $K_s={sps['sax']['Ks']:.0f}$ mm h$^{{-1}}$, $\\psi_f={sps['pf']:.0f}$ mm, $\\Delta\\theta={sps['dth']:.3f}$, Kostiakov $k={sps['k']*1000:.2f}$ mm min$^{{-A}}$, $A={sps['A']:.3f}$ ($R^2={sps['R2']:.3f}$). Intake after 60 minutes: $Z(60)={sps['k']*60**sps['A']*1000:.0f}$ mm, against ${sp['k']*60**sp['A']*1000:.0f}$ mm for the loam. With $Q=0.072$ m$^3$ min$^{{-1}}$ the stream supplies $0.072\\times60=4.3$ m$^3$ per hour, and the soil absorbs {sps['k']*60**sps['A']*0.75*1000/1000:.2f} m$^3$ per metre of furrow in the first hour, so the front reaches only about {4.32/(sps['k']*60**sps['A']*0.75+0.8*ds['A0']):.0f} m in the first hour; the volume balance gives the advance exponent, and the run does not reach 180 m within a realistic time: the application limits a set to 48 h ($t_{{co}}=2880$ min), and the front then stands at """
# xmax at 2880
xmax=Qm*2880/(0.8*ds['A0']+0.8*sps['k']*2880**sps['A']*0.75)
body+=f"$x_{{\\max}}={xmax:.0f}$ m. The part beyond gets no water: the layer warns ``the stream does not reach the end'' and recommends a larger inflow or a shorter run. At $q=4$ L s$^{{-1}}$ (the system limit) the front would reach "
d4=design(180,0.30,4.0,0.04,0.75,sps['k'],sps['A'],Zns)
body+=f"{(4*60/1000)*2880/(0.8*d4['A0']+0.8*sps['k']*2880**sps['A']*0.75):.0f}"+f" m in 48 h (with $\\sigma_z=0.8$ assumed); with the converged exponent the front reaches 180 m after $t_L={d4['tL']:.0f}$ min ({d4['tL']/60:.1f} h), and the required soaking time adds $t_{{st}}={d4['tst']:.0f}$ min, so that $t_{{co}}={d4['tco']:.0f}$ min and the efficiency is $E_a={d4['Ea']:.2f}$ with ${100*d4['RO']:.0f}$ per cent runoff. Even at the largest inflow the sand loses nearly all of the water to deep percolation at this length; shorter runs, drip or sprinklers are better, which is what the design table would suggest."
w(ex("surface irrigation in the sand",body))
# hydrograph
dd=fin[2]
w(r"""\section{The hydrograph}
The hydrograph divides the inflow into infiltration $I(t)$, runoff $R(t)$ and storage. The cumulative infiltration of the field is $V_c(t)=w\sum_ik[\min(t,t_{co})-\bar t_{x,i}]^A\Delta x\cdot s_c$ for the intervals already wetted, scaled by $s_c=V_{inf}/V_c(t_{co})$; $R(t)=\max\{0,q-I(t)\}$ while $t_L\le t\le t_{co}$; after cut-off the surface recedes triangularly, $R(t)=\frac{2V_s}{t_r}\bigl(1-\frac{t-t_{co}}{t_r}\bigr)$ for $t_{co}<t<t_{co}+t_r$, with $t_r=\max\{4,\min(0.3t_{co},0.25\max(t_L,10))\}$ min.
""")
Lf=fin[1]['L'];qq=fin[1]['q'];tcoF=dd['tco'];tLF=dd['tL']
xs=np.linspace(0,Lf,301);xm=(xs[1:]+xs[:-1])/2
sz=dd['sz']
Qm2=qq*60/1000
def tof2(x):
    lo,hi=1e-6,1e7
    for _ in range(100):
        mid=math.sqrt(lo*hi)
        A0_=dd['A0']
        if Qm2*mid/(0.8*A0_+sz*k*mid**A*0.75)<x: lo=mid
        else: hi=mid
    return math.sqrt(lo*hi)
txm=np.array([tof2(x) for x in xm]);dx=xs[1]-xs[0]
def Vc(t):
    return 0.75*np.sum(k*np.maximum(np.minimum(t,tcoF)-txm,0)**A*dx)
sc_=dd['Vinf']/Vc(tcoF) if Vc(tcoF)>0 else 1
rows=[]
for t in [tLF*0.5,tLF,tLF*1.5,tcoF*0.5,tcoF,tcoF+10]:
    Ivol=(Vc(t+0.5)-Vc(t-0.5))*sc_  # m3/min
    I_ls=Ivol/60*1000
    R=max(0,qq-I_ls) if tLF<=t<=tcoF else 0
    rows.append([f"{t:.0f}",f"{Vc(t)*sc_:.3f}",f"{I_ls:.2f}",f"{R:.2f}"])
body=f"""Build the hydrograph of the final design ($L={Lf}$ m, $q={qq:.2f}$ L s$^{{-1}}$, $t_L={tLF:.0f}$ min, $t_{{co}}={tcoF:.0f}$ min): the scale factor $s_c$, the infiltration and runoff rates at several times, and the recession.

\\textbf{{Solution.}} Divide the field into 300 intervals and take for each the mid-point advance time $\\bar t_{{x,i}}$. The unscaled cumulative infiltration at cut-off is $V_c(t_{{co}})={Vc(tcoF):.3f}$ m$^3$ while the design's $V_{{inf}}={dd['Vinf']:.3f}$, so $s_c={sc_:.4f}$. The rate is $I(t)=s_c\\,dV_c/dt$ (central difference, converted to L s$^{{-1}}$) and the runoff is $R=\\max\\{{0,q-I\\}}$ between $t_L$ and $t_{{co}}$ (Table~\\ref{{tab:hydro}})."""
body+=tab(["$t$ (min)","$V_c$ (m$^3$)","$I$ (L/s)","$R$ (L/s)"],rows,"Hydrograph of one furrow.","tab:hydro")
Vs=max(0,dd['Vapp']-dd['Vinf']-0)  # approx (runoff integral small if cb)
tr_=max(4,min(0.3*tcoF,0.25*max(tLF,10)))
body+=f"After cut-off the water left on the surface (an upper bound, $V_s\\le V_{{app}}-V_{{inf}}={dd['Vapp']-dd['Vinf']:.3f}$ m$^3$ minus the runoff already gone) drains in a triangle of duration $t_r=\\max\\{{4,\\min(0.3t_{{co}},0.25\\max(t_L,10))\\}}={tr_:.1f}$ min, so its peak is $2V_s/t_r$; the triangle conserves the volume $V_s$ by construction (its area is $\\frac12\\cdot\\frac{{2V_s}}{{t_r}}t_r=V_s$)."
w(ex("hydrograph",body))
open('/tmp/book/p2k.tex','w').write("\n".join(O))
