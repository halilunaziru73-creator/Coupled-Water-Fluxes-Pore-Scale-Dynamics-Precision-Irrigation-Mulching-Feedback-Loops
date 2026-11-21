import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from lib import *
import numpy as np
from sidport import saxton,psiF,gaF,fitK
exec(open('/tmp/kh/gen/x40.py').read().split("files={}")[0].split("OUT=")[1].join(["OUT=",""]) if False else "")
OUT='/tmp/kh/extra/'
def T(_s,**v):
    for k,x in v.items(): _s=_s.replace('<<%s>>'%k,x if isinstance(x,str) else ('%g'%x))
    return _s
def f(x,d=2): return ('%.'+str(d)+'f')%x
def X(title,stmt,steps): return '\\exbox{%s}{%s}\\sol\n%s\n\n'%(title,stmt,''.join('\\ans '+s+'\n' for s in steps))
def hd(t): return '\\subsection{%s}\n'%t
def vg(a,n,thr,ths,h): return thr+(ths-thr)*Se(a,n,h)
TEX={'S01':(45,20),'S02':(88,4),'S03':(92,3),'S04':(82,6),'S05':(65,10),'S06':(40,20),'S07':(20,15),'S08':(55,30),'S09':(30,35),'S10':(10,35)}
def ch1():
    sid='S06';nm,a,n=SOIL[sid][:3];thr,ths=0.05,0.43;m=1-1/n
    st=[T(r"Van Genuchten parameters of the loam: $\alpha=<<a>>$ cm$^{-1}$, $n=<<n>>$, so $m=1-1/n=<<m>>$; $\theta_r=0.05$, $\theta_s=0.43$",a=a,n=n,m=f(m,3))]
    for h in (10,33,100,330,1000,15849):
        s=Se(a,n,h);st.append(T(r"At $h=<<h>>$ cm: $S_e=[1+(\alpha h)^n]^{-m}=<<se>>$; $\theta=\theta_r+(\theta_s-\theta_r)S_e=<<th>>$; $K_r=<<kr>>$",h=h,se=f(s,4),th=f(vg(a,n,thr,ths,h),4),kr='%.3g'%Kr(a,n,h)))
    fc=vg(a,n,thr,ths,330);wp=vg(a,n,thr,ths,15849)
    st+=[T(r"Field capacity (33 kPa) $\theta_{fc}=<<a>>$ and wilting point (1500 kPa) $\theta_{wp}=<<b>>$, so the available water is $\theta_{fc}-\theta_{wp}=<<c>>$ m$^3$\,m$^{-3}$",a=f(fc,4),b=f(wp,4),c=f(fc-wp,4)),
     T(r"For a root zone of 0.8 m: total available water $TAW=1000(\theta_{fc}-\theta_{wp})Z_r=<<t>>$ mm",t=f(1000*(fc-wp)*.8,0)),
     T(r"Readily available water with depletion fraction $p=0.5$: $RAW=pTAW=<<r>>$ mm; at that point the suction is the trigger of Chapter~3",r=f(.5*1000*(fc-wp)*.8,0))]
    return hd('Complete characterisation of the loam')+X('Retention, conductivity and storage of a loam',r"Characterise the loam S06 completely: find $S_e$, $\theta$ and $K_r$ at six suctions, then the water held between field capacity and wilting, and the total and readily available water of a root zone 0.8 m deep.",st)
def ch2():
    sid='S06';nm,a,n=SOIL[sid][:3];Ks=12.1*24/10  # cm/d
    st=[T(r"Saturated conductivity of the loam $K_s=12.1$ mm\,h$^{-1}$ $=<<k>>$ cm\,d$^{-1}$",k=f(Ks,1))]
    for h1,h2,dz in ((100,330,30),(330,1000,30),(100,200,60)):
        hm=math.sqrt(h1*h2);kr=Kr(a,n,hm);K=Ks*kr
        grad=((h2-h1)/dz)  # suction diff over distance: gradient of head = (h2-h1)/dz -1 sign
        qd=K*(grad-1)
        st.append(T(r"Layer between suctions $<<h1>>$ and $<<h2>>$ cm, $\Delta z=<<dz>>$ cm: geometric mean suction $<<hm>>$ cm, $K_r=<<kr>>$, $K=<<K>>$ cm\,d$^{-1}$; hydraulic gradient $(h_2-h_1)/\Delta z-1=<<g>>$; flux $q=-K\,dH/dz=<<q>>$ cm\,d$^{-1}$ (<<dir>>)",h1=h1,h2=h2,dz=dz,hm=f(hm,0),kr='%.3g'%kr,K='%.3g'%K,g=f(grad-1,2),q='%.3g'%abs(qd),dir='upward' if qd>0 else 'downward'))
    st.append(r"The gradient exceeds 1 in the dry layers, so the water moves up toward the roots and surface, and is less than 1 where the profile drains; the sign of $(h_2-h_1)/\Delta z-1$ decides the direction")
    return hd('Complete calculation of flux in a layered profile')+X('Darcy flux between three layers of a loam',r"A loam profile has suctions of 100, 330 and 1000 cm at depths 30 cm apart. Find the conductivity of each layer from the van Genuchten model, the gradient and the flux (Darcy--Buckingham), and decide the direction of flow.",st)
def ch3():
    st=[r"The trigger is the suction at which the readily available water has been used up; for the soil it is found by bisection on $\log_{10}h$ of the depletion function $f(h)=\dfrac{S_e(100)-S_e(h)}{S_e(100)-S_e(15849)}$ until it equals the trigger fraction"]
    sid='S06';nm,a,n=SOIL[sid][:3];tr=[]
    h=hof(a,n,.5,tr)
    for k,mid,hh,fv in tr:
        st.append(T(r"Step <<k>>: $\log_{10}h=<<m>>$, $h=<<h>>$ cm, $f=<<f>>$ <<c>> 0.5",k=k,m=f(mid,4),h=f(hh,0),f=f(fv,4),c='$<$' if fv<.5 else '$\\ge$'))
    st.append(T(r"After 60 halvings the trigger suction of the loam at 50 per cent depletion is $h_{50}=<<h>>$ cm",h=f(h,0)))
    for sid_ in ('S02','S06','S10'):
        nm_,a_,n_=SOIL[sid_][:3];st.append(T(r"Soil <<s>> (<<nm>>): $h_{50}=<<h>>$ cm; at 30 per cent $<<h3>>$ cm; at 70 per cent $<<h7>>$ cm",s=sid_,nm=nm_,h=f(hof(a_,n_,.5),0),h3=f(hof(a_,n_,.3),0),h7=f(hof(a_,n_,.7),0)))
    return hd('Complete calculation of a trigger suction')+X('Trigger suction by bisection',r"Find the suction at which the loam S06 has lost 50 per cent of its readily available water, showing the first eight bisection steps, and compare three soils at three trigger fractions.",st)
def ch4():
    obs=np.array([0.82,1.40,2.35,3.10,3.95,4.70,5.20,6.10]);mod=np.array([0.75,1.55,2.20,3.30,3.80,4.95,5.00,6.30])
    r=mod-obs;N=len(obs);rmse=math.sqrt((r**2).mean());bias=r.mean();nse=1-((obs-mod)**2).sum()/((obs-obs.mean())**2).sum()
    cc=np.corrcoef(obs,mod)[0,1]
    st=[T(r"Data (observed, modelled): "+', '.join('(%.2f, %.2f)'%(o,m) for o,m in zip(obs,mod))+" mm\\,d$^{-1}$"),
     T(r"Residuals $e_i=M_i-O_i$: "+', '.join('%.2f'%x for x in r)),
     T(r"Bias $=\frac{1}{N}\sum e_i=<<b>>$ mm\,d$^{-1}$",b=f(bias,3)),
     T(r"$\sum e_i^2=<<s>>$, so $RMSE=\sqrt{\sum e_i^2/N}=<<r>>$ mm\,d$^{-1}$",s=f((r**2).sum(),3),r=f(rmse,3)),
     T(r"Mean of the observations $\bar O=<<o>>$; $\sum(O_i-\bar O)^2=<<v>>$; Nash--Sutcliffe $NSE=1-\sum e_i^2/\sum(O_i-\bar O)^2=<<n>>$",o=f(obs.mean(),3),v=f(((obs-obs.mean())**2).sum(),3),n=f(nse,4)),
     T(r"Correlation $r=<<c>>$, coefficient of determination $r^2=<<c2>>$",c=f(cc,4),c2=f(cc*cc,4)),
     T(r"Relative error $RMSE/\bar O=<<p>>$ per cent; a model with $NSE>0.9$ and a bias below 5 per cent of the mean is judged good for this purpose",p=f(rmse/obs.mean()*100,1)),
     T(r"Water-balance audit: inputs $P+I=<<i>>$ mm, outputs $ET+D+\Delta S=<<o>>$ mm, closure error $<<e>>$ mm ($<<p>>$ per cent of input)",i=f(412+180,0),o=f(371+138+79,0),e=f(412+180-371-138-79,0),p=f((412+180-371-138-79)/(412+180)*100,1))]
    return hd('Complete audit of a simulation')+X('Statistics and balance closure of a model run',r"A model and a lysimeter gave eight daily evapotranspiration values. Compute the residuals, the bias, the RMSE, the Nash--Sutcliffe efficiency and the correlation, and audit a season's water balance (precipitation 412 mm, irrigation 180 mm, ET 371 mm, drainage 138 mm, storage change 79 mm).",st)
def ch5():
    T_=26.;Rn=15.2;G=0.;u2=2.1;RH=45;z=100
    es=0.6108*math.exp(17.27*T_/(T_+237.3));ea=es*RH/100;D=es-ea
    Dl=4098*es/(T_+237.3)**2;P=101.3*((293-0.0065*z)/293)**5.26;g=0.000665*P
    ET0=(0.408*Dl*(Rn-G)+g*900/(T_+273)*u2*D)/(Dl+g*(1+0.34*u2))
    Kcb=1.10;Ke=0.10;Kc=Kcb+Ke;ETc=Kc*ET0;TAW=140;p=.5;Dr=90;ks=(TAW-Dr)/((1-p)*TAW)
    st=[T(r"Saturation vapour pressure $e_s=0.6108\exp[17.27T/(T+237.3)]=<<a>>$ kPa; actual $e_a=e_sRH/100=<<b>>$ kPa; deficit $D=<<c>>$ kPa",a=f(es,3),b=f(ea,3),c=f(D,3)),
     T(r"Slope of the saturation curve $\Delta=4098e_s/(T+237.3)^2=<<d>>$ kPa\,K$^{-1}$",d=f(Dl,4)),
     T(r"Pressure at 100 m: $P=101.3[(293-0.0065z)/293]^{5.26}=<<p>>$ kPa; psychrometric constant $\gamma=0.000665P=<<g>>$ kPa\,K$^{-1}$",p=f(P,1),g=f(g,4)),
     T(r"Penman--Monteith: $ET_0=\dfrac{0.408\Delta(R_n-G)+\gamma\frac{900}{T+273}u_2D}{\Delta+\gamma(1+0.34u_2)}$ with $R_n=15.2$ MJ\,m$^{-2}$\,d$^{-1}$, $u_2=2.1$ m\,s$^{-1}$ gives $ET_0=<<e>>$ mm\,d$^{-1}$",e=f(ET0,2)),
     T(r"Dual crop coefficient at mid-season: $K_{cb}=1.10$, $K_e=0.10$, so $K_c=<<k>>$ and $ET_c=K_cET_0=<<e>>$ mm\,d$^{-1}$ without stress",k=f(Kc,2),e=f(ETc,2)),
     T(r"Stress: $TAW=140$ mm, $p=0.5$, depletion $D_r=90$ mm; $RAW=<<r>>$ mm; since $D_r>RAW$, $K_s=(TAW-D_r)/[(1-p)TAW]=<<k>>$",r=f(p*TAW,0),k=f(ks,3)),
     T(r"Actual evapotranspiration $ET_a=(K_sK_{cb}+K_e)ET_0=<<e>>$ mm\,d$^{-1}$, a reduction of <<r>> per cent",e=f((ks*Kcb+Ke)*ET0,2),r=f((1-(ks*Kcb+Ke)/Kc)*100,0)),
     T(r"Relative yield by Doorenbos--Kassam with $K_y=1.25$: $1-Y/Y_m=K_y(1-ET_a/ET_c)=<<y>>$, i.e. a yield loss of <<yl>> per cent if this stress lasts all season",y=f(1.25*(1-(ks*Kcb+Ke)/Kc),3),yl=f(125*(1-(ks*Kcb+Ke)/Kc),1))]
    return hd('Complete calculation of evapotranspiration and stress')+X('Reference ET, crop ET, stress and yield',r"On a day with mean temperature 26$^\circ$C, relative humidity 45 per cent, net radiation 15.2 MJ\,m$^{-2}$\,d$^{-1}$, wind 2.1 m\,s$^{-1}$ at 2 m and altitude 100 m, find $ET_0$, then $ET_c$ and the actual ET of a crop at mid-season ($K_{cb}=1.10$, $K_e=0.10$) whose root zone holds $TAW=140$ mm and is depleted by 90 mm, and the resulting yield loss.",st)
def ch6():
    ETc=6.2;eff=.85;Zn=45
    st=[T(r"Peak crop need $ET_c=6.2$ mm\,d$^{-1}$; net application $Z_n=45$ mm (trigger of 50 per cent of 90 mm TAW)"),
     T(r"Interval $=Z_n/ET_c=45/6.2=<<i>>$ d; adopt 7 days",i=f(45/6.2,1)),
     T(r"Net depth every 7 days $=6.2\times7=<<n>>$ mm",n=f(6.2*7,1)),
     T(r"Gross depth with application efficiency 0.85 and a leaching fraction $LR=0.10$: $Z_g=Z_n/[E_a(1-LR)]=<<g>>$ mm",g=f(6.2*7/(.85*.9),1)),
     T(r"Gross volume per irrigation for 40 ha: $10Z_gA=<<v>>$ m$^3$",v=f(10*6.2*7/(.85*.9)*40,0)),
     T(r"System capacity needed to irrigate 40 ha in 6 days of 20 h: $Q=V/(6\times20\times3600)\times1000=<<q>>$ L\,s$^{-1}$",q=f(10*6.2*7/(.85*.9)*40/(6*20*3600)*1000,1)),
     T(r"Seasonal depth over 150 days: $ET_c$ mean 5.0 mm\,d$^{-1}$ gives $5.0\times150/(0.85\times0.9)=<<s>>$ mm, or <<sv>> m$^3$ for 40 ha",s=f(5*150/(.85*.9),0),sv=f(5*150/(.85*.9)*10*40,0))]
    return hd('Complete calculation of a system capacity')+X('Net and gross requirement, interval and capacity',r"A 40 ha farm has a peak crop requirement of 6.2 mm\,d$^{-1}$, a net application of 45 mm, an application efficiency of 85 per cent and a leaching requirement of 10 per cent. Find the interval, the gross depth and volume, the system capacity for a 6-day cycle of 20 h days, and the seasonal volume.",st)
def ch7():
    st=[r"The layers form a chain: soil $\to$ crop $\to$ weather $\to$ design $\to$ field; each layer passes numbers to the next",
     T(r"Soil layer: loam S06, $\theta_{33}-\theta_{1500}$ gives TAW $=<<t>>$ mm in a 0.8 m root zone",t=f(1000*.8*(vg(SOIL['S06'][1],SOIL['S06'][2],.05,.43,330)-vg(SOIL['S06'][1],SOIL['S06'][2],.05,.43,15849)),0)),
     r"Crop layer: depletion fraction 0.5 gives $RAW$ and the trigger suction (Chapter~3)",
     r"Weather layer: $ET_0$ and $K_c$ give the daily demand (Chapter~5)",
     r"Design layer: the interval and gross depth give the capacity (Chapter~6)",
     r"Field layer: the surface, drip, sprinkler or drainage layers turn the capacity into a layout (Chapters~11--14)"]
    return ''
def ch8():
    # bucket engine step by step: 10 days
    TAW=140.;p=.5;Dr=40.;ET0=[5.2,5.6,6.0,5.8,6.1,6.4,5.9,4.8,5.0,5.5];Pr=[0,0,0,0,0,0,12,3,0,0];Kc=1.1
    st=[r"Initial depletion $D_0=40$ mm, $TAW=140$ mm, $RAW=pTAW=70$ mm, $K_c=1.1$; irrigation of 40 mm is added when $D_r>RAW$"]
    D=Dr
    for i,(e,pr) in enumerate(zip(ET0,Pr),1):
        ks=1. if D<=p*TAW else (TAW-D)/((1-p)*TAW);et=ks*Kc*e;Dn=D+et-pr;irr=0
        if Dn>p*TAW: irr=40;Dn-=irr
        Dn=max(0,min(TAW,Dn))
        st.append(T(r"Day <<i>>: $D=<<d>>$ mm, $K_s=<<ks>>$, $ET_a=K_sK_cET_0=<<et>>$, $P=<<p>>$ mm; irrigation <<ir>> mm; $D_{new}=<<dn>>$ mm",i=i,d=f(D,1),ks=f(ks,2),et=f(et,2),p=pr,ir=irr,dn=f(Dn,1)));D=Dn
    return hd('Ten days of the bucket engine')+X('Daily bucket engine step by step',r"Run the daily bucket engine for ten days with $TAW=140$ mm, $p=0.5$, $K_c=1.1$, the given $ET_0$ and rain, an initial depletion of 40 mm and a rule that irrigates 40 mm whenever the depletion passes $RAW$.",st)
def ch9():
    st=[]
    for nm,Ks_,k in (('bare soil',1.0,0.0),('straw mulch 5 t/ha',1.0,0.28),('plastic film',1.0,0.55)):
        E0=4.5;E=E0*(1-k);st.append(T(r"Evaporation from <<nm>>: potential $E_0=4.5$ mm\,d$^{-1}$, mulch reduction factor $<<k>>$, so $E=E_0(1-k)=<<e>>$ mm\,d$^{-1}$; over a 10-day drying spell $<<t>>$ mm, saving $<<s>>$ mm",nm=nm,k=f(k,2),e=f(E,2),t=f(E*10,1),s=f(E0*10-E*10,1)))
    st+=[T(r"Stage-1 evaporation (Ritchie) ends when $U=REW=9$ mm; with $E=4.5$ it lasts $9/4.5=<<a>>$ d on bare soil and $9/3.24=<<b>>$ d under straw",a=f(9/4.5,1),b=f(9/(4.5*.72),1)),
     T(r"Tillage: raising the porosity from 0.43 to 0.49 raises $K_s$ by the Kozeny--Carman ratio $\left[\frac{0.49^3/(1-0.49)^2}{0.43^3/(1-0.43)^2}\right]=<<r>>$",r=f((0.49**3/(1-.49)**2)/(0.43**3/(1-.43)**2),2)),
     T(r"Feedback loop: lower evaporation $\to$ wetter surface $\to$ longer interval; with a mulch saving of $<<s>>$ mm per 10 days the interval of 7 days becomes 8.3 days for the same TAW",s=f(4.5*10-4.5*.72*10,1))]
    return hd('Complete calculation of a mulch benefit')+X('Mulch, tillage and the feedback loop',r"Compare the evaporation under bare soil, straw mulch (28 per cent reduction) and plastic film (55 per cent) over a 10-day spell, find the length of stage-1 drying, the change of $K_s$ from tillage, and the feedback on the irrigation interval.",st)
def ch10():
    rng=np.random.default_rng(3)
    P=np.array([[0,0,0],[2,0,0],[0,3,0],[0,0,4],[2,3,0],[2,0,4],[0,3,4],[2,3,4.]])
    th=math.radians(25);R=np.array([[math.cos(th),-math.sin(th),0],[math.sin(th),math.cos(th),0],[0,0,1]]);t=np.array([1.5,-0.7,0.4])
    Q=P@R.T+t
    Pc=P-P.mean(0);Qc=Q-Q.mean(0);H=Pc.T@Qc;U,S,Vt=np.linalg.svd(H);Rr=Vt.T@U.T
    if np.linalg.det(Rr)<0: Vt[-1]*=-1;Rr=Vt.T@U.T
    tr=Q.mean(0)-Rr@P.mean(0);ang=math.degrees(math.atan2(Rr[1,0],Rr[0,0]))
    vol=2*3*4
    st=[T(r"Eight corner points $P_i$ of a box 2 $\times$ 3 $\times$ 4 cm are scanned in a second pose $Q_i=RP_i+t$ with $R$ a rotation of 25$^\circ$ about $z$ and $t=(1.5,-0.7,0.4)$"),
     T(r"Centroids: $\bar P=(<<a>>)$, $\bar Q=(<<b>>)$",a=', '.join(f(x,2) for x in P.mean(0)),b=', '.join(f(x,3) for x in Q.mean(0))),
     T(r"Cross-covariance $H=\sum(P_i-\bar P)(Q_i-\bar Q)^{T}$ has singular values $<<s>>$",s=', '.join(f(x,2) for x in S)),
     T(r"Rotation from the SVD $H=U\Sigma V^T$: $R=VU^T$ gives an angle $\arctan(R_{21}/R_{11})=<<a>>^\circ$ (true $25^\circ$) and $\det R=<<d>>$",a=f(ang,3),d=f(np.linalg.det(Rr),3)),
     T(r"Translation $t=\bar Q-R\bar P=(<<t>>)$",t=', '.join(f(x,3) for x in tr)),
     T(r"Residual of the registration $\sqrt{\frac{1}{N}\sum|RP_i+t-Q_i|^2}=<<r>>$ cm",r='%.1e'%math.sqrt((((P@Rr.T+tr)-Q)**2).sum(1).mean())),
     T(r"Voxel volume: with voxels of 0.5 cm, the box contains $4\times6\times8=192$ voxels of 0.125 cm$^3$, giving $192\times0.125=<<v>>$ cm$^3$ (true <<v>> cm$^3$)",v=vol)]
    return hd('Complete registration and volume of a scan')+X('Registration by SVD and voxel volume',r"A box 2 $\times$ 3 $\times$ 4 cm is scanned in a second pose. Recover the rigid motion by the SVD method, check the residual, and find the volume by voxel counting.",st)
for n,fn in ((1,ch1),(2,ch2),(3,ch3),(4,ch4),(5,ch5),(6,ch6),(8,ch8),(9,ch9),(10,ch10)):
    open(OUT+'long%02d.tex'%n,'w').write(fn())
print('ok')
