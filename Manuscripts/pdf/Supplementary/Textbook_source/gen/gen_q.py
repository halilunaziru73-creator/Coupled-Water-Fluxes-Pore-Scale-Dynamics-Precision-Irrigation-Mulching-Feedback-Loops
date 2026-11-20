import sys,math
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
import eng2
O=[];w=O.append
def T(_s,**kw):
    for k,v in kw.items(): _s=_s.replace('@'+k+'@',str(v))
    return _s
def yr(seed,trig=300,P=600.,Ibar=150.):
    return eng2.run('S06',trig,P=P,Eyr=170.,Tyr=230.,Ibar=Ibar,seed=seed)
r1=yr(1);L=r1['log']
w(r"""\chapter{The Dashboard: how every number is produced}\label{ch:dash}
\markboth{Dashboard}{Dashboard}
\textbf{After this chapter you can} reproduce the blocks of the Results tab from the daily series of Engine~2, close the water balance of a year, compute the sums of the next 14 days, read the pinned-baseline differences with the right colour, and compute the reliability statistics of the Charts tab over twenty seasons.

The Dashboard recomputes from the engine every time the state, the date or the weather changes, so it adds no model of its own: every number is a read-out or a sum of the daily series $P_k,I_k,E_k,T_k,D_k$ of Engine~2 (Chapter~\ref{ch:e2}) and of the annual outputs of Engine~1. This chapter does the sums.

\section{Block 1: the working date}
On day index $k$ the tab shows $\mathrm{Rain}=P_k$, $\mathrm{Irr}=I_k$, $\mathrm{Evap}=E_k$, $\mathrm{Transp}=T_k$, $\mathrm{Drain}=D_k$ (mm d$^{-1}$), the sensor depletion $f$ and the trigger $f_T$ (irrigation fires when $f\ge f_T$).
""")
k=150
x=L[k-1]
body=T(r"""The loam at the trigger $-300$ cm (depletion $f_T=0.468$), the first synthetic year (seed 1), working date day @k@. Read the first block.

\textbf{Solution.} From the daily series: rain $P=@P@$ mm; rain reaching the soil after interception $@Tf@$ mm; irrigation $I=@I@$ mm; soil evaporation $E=@E@$ mm; transpiration $T=@T@$ mm; drainage $D=@D@$ mm; canopy cover $c=@c@$; the sensor layer holds @f@ of its capacity so its relative depletion is $f=1-@f@=@fd@$, @cmp@ the trigger $f_T=0.468$. Irrigation fires on a day when the sensor depletion has reached $f_T$ (Eq.~6.1).""",k=k,P=fx(x[2],1),Tf=fx(x[3],1),I=fx(x[4],1),E=fx(x[8],2),T=fx(x[9],2),D=fx(x[5],1),c=fx(x[1],2),f=fx(x[6],3),fd=fx(1-x[6],3),cmp="below" if 1-x[6]<0.468 else "at or above")
w(ex("one day of the dashboard",body))
w(r"\section{Block 2: the next 14 days}"+"\n"+r"""The sums over the following $N=14$ days are $\Sigma X=\sum_{j=1}^{14}X_{k+j}$ for $X\in\{P,I,E,T,D\}$. The bar says whether the days come from the weather record (the analogue year) or from the 16-day forecast when online weather is in use.
""")
nx=L[k:k+14]
S={nm:sum(z[idx] for z in nx) for nm,idx in (('P',2),('I',4),('E',8),('T',9),('D',5))}
body=T(r"""Sum days @a@ to @b@.

\textbf{Solution.} $\Sigma P=@P@$ mm, $\Sigma I=@I@$ mm, $\Sigma E=@E@$ mm, $\Sigma T=@T@$ mm, $\Sigma D=@D@$ mm. Evapotranspiration of the fortnight is $\Sigma E+\Sigma T=@ET@$ mm, a mean of $@m@$ mm d$^{-1}$. Without rain or irrigation the fortnight would draw @dr@ mm from storage (the model gives the actual change below).""",a=k+1,b=k+14,P=fx(S['P'],1),I=fx(S['I'],1),E=fx(S['E'],1),T=fx(S['T'],1),D=fx(S['D'],1),ET=fx(S['E']+S['T'],1),m=fx((S['E']+S['T'])/14,2),dr=fx(S['E']+S['T']-S['P']-S['I'],1))
w(ex("the next fortnight",body))
w(r"\section{Block 3: the whole year and its closure}"+"\n"+r"""For the calendar year the tab gives rain, irrigation, other evaporation (interception, litter, ponded water, snow), soil evaporation, transpiration, drainage and the storage change; the balance closes by the identity
\begin{equation}\Delta S=P+I-E_{\rm other}-E-T-D.\end{equation}
""")
Eo=sum(z[2]-z[3] for z in L);dS=r1['P']+r1['I']-Eo-r1['E']-r1['T']-r1['D']
rows=[["Rain $P$",fx(r1['P'],1)],["Irrigation $I$",fx(r1['I'],1)],["Other evaporation $E_{\\rm other}$",fx(Eo,1)],["Soil evaporation $E$",fx(r1['E'],1)],["Transpiration $T$",fx(r1['T'],1)],["Drainage $D$",fx(r1['D'],1)],["Storage change $\\Delta S$",fx(dS,1)],["Deepest roots (cm)",fx(max(z[7] for z in L),0)]]
w(tab(["Quantity","mm (year 1, loam, $-300$ cm)"],rows,"Block 3 of the Results tab.","tab:year"))
body=T(r"""Verify the closure of Table~\ref{tab:year}.

\textbf{Solution.} $\Delta S=P+I-E_{\rm other}-E-T-D=@P@+@I@-@Eo@-@E@-@T@-@D@=@dS@$ mm. Independently, the root-zone store of the 100 cm profile rose from @s0@ mm on 1 January to @s1@ mm on 31 December, a change of @ds@ mm. The two agree because $E_{\rm other}$ is, by construction, the rain that did not reach the soil: $E_{\rm other}=\sum(P_k-P_k^{\rm soil})=@Eo@$ mm.""",P=fx(r1['P'],1),I=fx(r1['I'],1),Eo=fx(Eo,1),E=fx(r1['E'],1),T=fx(r1['T'],1),D=fx(r1['D'],1),dS=fx(dS,1),s0=fx(r1['S0'],1),s1=fx(r1['S1'],1),ds=fx(r1['S1']-r1['S0'],1))
w(ex("closing the year",body))
# 20 seasons
ys=[yr(s) for s in range(1,21)]
def stat(v):
    v=np.array(v);return v.mean(),np.percentile(v,10),np.percentile(v,90),v.min(),v.max(),100*v.std(ddof=1)/v.mean() if v.mean()>0 else float('nan')
w(r"\section{Block 4 and the Charts tab: twenty seasons}"+"\n"+r"""Block 4 shows the 20-year averages of the annual model, and each chart has a line stating the mean, the 10--90\% range, the lowest and highest season and the variation between years. The variation is the coefficient of variation $\mathrm{CV}=100\,s/\bar x$ with $s$ the sample standard deviation.
""")
rows=[]
for nm,key in (("Rain",'P'),("Irrigation",'I'),("Drainage",'D'),("Soil evaporation",'E'),("Transpiration",'T')):
    m,p10,p90,mn,mx,cv=stat([y[key] for y in ys]);rows.append([nm,fx(m,0),fx(p10,0),fx(p90,0),fx(mn,0),fx(mx,0),fx(cv,0)])
w(tab(["Quantity","mean","10\\%","90\\%","lowest","highest","CV (\\%)"],rows,"Reliability over twenty synthetic seasons (seeds 1--20), loam, trigger $-300$ cm, mm per year.","tab:rel"))
m,p10,p90,mn,mx,cv=stat([y['I'] for y in ys])
dry=[i+1 for i,y in enumerate(ys) if y['I']==0]
body=T(r"""From Table~\ref{tab:rel} write the line under the irrigation chart.

\textbf{Solution.} ``Irrigation: mean @m@ mm; 10 to 90\% range @a@ to @b@ mm; lowest @mn@ mm, highest @mx@ mm; variation between years @cv@\%.'' The coefficient of variation is $100\times s/\bar x$ with $s=@s@$ mm and $\bar x=@m@$ mm. @txt@""",m=fx(m,0),a=fx(p10,0),b=fx(p90,0),mn=fx(mn,0),mx=fx(mx,0),cv=fx(cv,0),s=fx(np.std([y['I'] for y in ys],ddof=1),1),txt=("In "+str(len(dry))+" of the twenty seasons the crop was not irrigated at all (a rainfed season, drawn dashed on the chart).") if dry else "No season was rainfed in this sample.")
w(ex("the statistics line",body))
# pin
base=ys
alt=[yr(s,trig=1500) for s in range(1,21)]
def avg(L_,k): return np.mean([y[k] for y in L_])
rows=[]
good={'E':'lower','D':'lower','I':'lower','T':'neutral','P':'neutral'}
names={'E':'Soil evaporation','T':'Transpiration','D':'Drainage','I':'Irrigation','P':'Rain'}
for k in ('E','T','D','I','P'):
    a=avg(base,k);b=avg(alt,k);d=b-a
    if abs(d)<1e-9: sym="= no change";col="neutral"
    else:
        up=d>0;sym=("$\\blacktriangle$" if up else "$\\blacktriangledown$")
        col="neutral" if good[k]=='neutral' else ("worse (red)" if (up and good[k]=='lower') else "better (green)")
    rows.append([names[k],fx(a,1),fx(b,1),fx(d,1),sym,col])
w(r"\section{The pinned baseline}"+"\n"+r"""Press Pin and the tiles of Block 4 are stored; afterwards each tile shows $\Delta_i=x_i-x_i^{\rm pin}$ with $\blacktriangle$ for an increase, $\blacktriangledown$ for a decrease, green when the change is in the better direction, red when worse and ``= no change'' when $|\Delta_i|<10^{-9}$. Lower is better for soil evaporation, drainage, irrigation and nitrogen leaching; higher is better for yield and irrigation efficiency; transpiration, evapotranspiration and rainfall are neutral.
""")
w(tab(["Tile","pinned (-300 cm)","now (-1500 cm)","$\\Delta$","arrow","colour"],rows,"Pin at the trigger $-300$ cm, then move to $-1500$ cm (twenty-season means, mm per year).","tab:pin",spec="lrrrll"))
body=T(r"""Read the tiles of Table~\ref{tab:pin}.

\textbf{Solution.} Irrigation falls from @i0@ to @i1@ mm (@di@ mm): $\blacktriangledown$ and green, since less is better. Transpiration changes by @dt@ mm and is neutral (it carries no colour, because less transpiration may mean either less stress or a smaller crop). Drainage changes by @dd@ mm. A drier trigger therefore saves irrigation but the dashboard alone cannot say whether the saving is worth it: the yield tile (not computed here) must be read with it, as in Chapter~\ref{ch:ctrl}.""",i0=fx(avg(base,'I'),1),i1=fx(avg(alt,'I'),1),di=fx(avg(alt,'I')-avg(base,'I'),1),dt=fx(avg(alt,'T')-avg(base,'T'),1),dd=fx(avg(alt,'D')-avg(base,'D'),1))
w(ex("reading the pinned differences",body))
w(r"\section{The pump hydrograph of a design}"+"\n"+r"""For drip and sprinkler designs the pump hydrograph is the step series $Q_{\rm pump}(t)=Q_z$ for $t\in[0,n_zt_{\rm run})$ and 0 afterwards: the zones or sets run in turn.
""")
Qz=3.0*10.88/10.88*45.855/3.6  # placeholder replaced below
nz=6;trun=371/60;Qz_ls=12.7
body=T(r"""For the sprinkler farm of Chapter~\ref{ch:sprinkler} ($n=3$ laterals at once, set time $T=371$ min) the farm has $N_m=18$ lateral positions, so $n_z=\lceil18/3\rceil=@nz@$ sets. Find the step series.

\textbf{Solution.} The flow of one set is $Q_z=3\times12\times21.2$ L min$^{-1}=@Q@$ L min$^{-1}=@Qls@$ L s$^{-1}$ (3 laterals of 12 sprinklers). $t_{\rm run}=371/60=@tr@$ h. The pump runs at $Q_z$ for $n_zt_{\rm run}=@nzt@$ h, in steps of $@tr@$ h, and the volume is $Q_z\times n_zt_{\rm run}\times3.6=@V@$ m$^3$ (check: gross depth $\times$ area of the sets).""",nz=nz,Q=fx(3*12*21.23,0),Qls=fx(3*12*21.23/60,2),tr=fx(371/60,2),nzt=fx(nz*371/60,1),V=fx(3*12*21.23/60*nz*371/60*3.6,0))
w(ex("a pump hydrograph",body))
w(r"""\section{Summary}
Every Dashboard number is a read-out, a sum, a mean or a difference of the daily series: Block 1 reads day $k$; Block 2 sums 14 days; Block 3 closes $\Delta S=P+I-E_{\rm other}-E-T-D$; Block 4 and the charts use twenty seasons; the pin shows $\Delta=x-x^{\rm pin}$ with a colour by direction; the pump hydrograph is a step series. Because all of it comes from the same objects, the dashboard, the report and the CSV exports agree digit for digit.
""")
open('/tmp/book/p2q.tex','w').write("\n".join(O))
print(dS,r1['S1']-r1['S0'],cv,dry)
