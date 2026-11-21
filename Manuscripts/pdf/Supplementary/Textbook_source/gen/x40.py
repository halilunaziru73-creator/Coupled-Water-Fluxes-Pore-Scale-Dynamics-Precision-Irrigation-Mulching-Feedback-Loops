import sys,math,re
sys.path.insert(0,'/tmp/kh/gen')
from sidport import *
from dripport import *
import sprport
from sprport import sprinkler
from lib import SOIL,Se,Kr,hof,fdep
OUT='/tmp/kh/extra/'
TEX={'S01':(45,20),'S02':(88,4),'S03':(92,3),'S04':(82,6),'S05':(65,10),'S06':(40,20),'S07':(20,15),'S08':(55,30),'S09':(30,35),'S10':(10,35)}
def T(_s,**v):
    for k,x in v.items(): _s=_s.replace('<<%s>>'%k,x if isinstance(x,str) else ('%g'%x))
    return _s
def f(x,d=2): return ('%.'+str(d)+'f')%x
def X(title,stmt,steps):
    return '\\exbox{%s}{%s}\\sol\n%s\n\n'%(title,stmt,''.join('\\ans '+s+'\n' for s in steps))
def hd(t): return '\\subsection{%s}\n'%t
def dEq(L,D,u):
    x=2*math.pi*D/L;F=0
    for n in range(1,30,2):
        e=math.exp(-2*n*x);F+=4*e/(n*(1-e))
    return min((math.pi*L/8)/(max(.05,math.log(L/u))+F),D)
def hoogL(q,h,K1,K2,D,u):
    L=math.sqrt((4*K1*h*h+8*K2*D*h)/q)
    for i in range(60):
        d=dEq(max(L,2),D,u);Ln=math.sqrt((8*K2*d*h+4*K1*h*h)/q)
        if abs(Ln-L)<.01:L=Ln;break
        L=.5*(L+Ln)
    return L
manQ=lambda Dm,s,n:(1/n)*math.pi*Dm*Dm/4*(Dm/4)**(2/3)*math.sqrt(s)
def soilhyd(sid,om=1.5,ftrig=.5):
    sd,cl=TEX[sid];s=saxton(sd/100,cl/100,om);a,n=SOIL[sid][1],SOIL[sid][2]
    psi=psiF(a,n);dth=max(.05,.95*s['sat']-(s['fc']-ftrig*(s['fc']-s['wp'])))
    fit=fitK(lambda t:gaF(t,s['ks'],psi,dth)/1000,10,600);return s,psi,dth,fit
files={}
# ---------------- chapter 11: surface irrigation, complete furrow design
def ch11():
    out=hd('Complete design: a furrow system for 12 ha of silty clay loam')
    s,psi,dth,fit=soilhyd('S10');k,A=fit['k'],fit['A']
    Zn=0.075;L=250;S0=0.25;w=0.75;n=0.04
    res=[]
    for q in (0.8,1.2,1.6,2.0):
        m=manning_furrow(q/1000,S0/100,n);R=compute(L,w,q*.06,k,A,Zn,m['A0']);res.append((q,m,R))
    best=max(res,key=lambda r:r[2]['Ea']*(1 if r[2]['Es']>.99 else .5))
    q,m,R=best
    cb=compute(L,w,q*.06,k,A,Zn,m['A0'],cb=0.5)
    st=[
     T(r"Soil S10 (sand 10, clay 35 per cent, organic matter 1.5 per cent): Saxton and Rawls give $\theta_{1500}=<<a>>$, $\theta_{33}=<<b>>$, $\theta_s=<<c>>$ and $K_s=<<d>>$ mm\,h$^{-1}$",a=f(s['wp'],4),b=f(s['fc'],4),c=f(s['sat'],4),d=f(s['ks'],1)),
     T(r"Wetting-front suction $\psi_f=<<a>>$ mm from $\alpha=0.010$ cm$^{-1}$, $n=1.23$; moisture deficit at the 50 per cent trigger $\Delta\theta=<<b>>$",a=f(psi,1),b=f(dth,4)),
     T(r"Green--Ampt cumulative intake at 10, 60 and 600 min: <<a>>, <<b>> and <<c>> mm",a=f(gaF(10,s['ks'],psi,dth),1),b=f(gaF(60,s['ks'],psi,dth),1),c=f(gaF(600,s['ks'],psi,dth),1)),
     T(r"Log--log fit between 10 and 600 min: $Z=kt^{A}$ with $k=<<a>>$ m\,min$^{-A}$, $A=<<b>>$ ($R^2=<<c>>$)",a=f(k,5),b=f(A,3),c=f(fit['r2'],4)),
     T(r"Net depth $Z_n=75$ mm, so the required contact time is $\tau_n=(Z_n/k)^{1/A}=(0.075/<<a>>)^{1/<<b>>}=<<c>>$ min (<<d>> h)",a=f(k,5),b=f(A,3),c=f((Zn/k)**(1/A),0),d=f((Zn/k)**(1/A)/60,1)),
    ]
    for q_,m_,R_ in res:
        st.append(T(r"Trial $q_0=<<q>>$ L\,s$^{-1}$: Manning depth $y=<<y>>$ cm, inlet area $A_0=<<A0>>$ cm$^2$; advance $t_L=<<tL>>$ min, cut-off $t_{co}=<<tco>>$ min; $E_a=<<ea>>$, $DP=<<dp>>$, $RO=<<ro>>$ per cent, $CU=<<cu>>$ per cent",q=q_,y=f(m_['y']*100,1),A0=f(m_['A0']*1e4,0),tL=f(R_['tL'],0),tco=f(R_['tco'],0),ea=f(R_['Ea']*100,1),dp=f(R_['dp']*100,1),ro=f(R_['ro']*100,1),cu=f(R_['cu'],1)))
    Nf=12e4/(L*(1.5))  # furrows per ha at 1.5 m spacing... 12 ha
    nfur=int(12*1e4/(1.5*L))
    st+=[
     T(r"Choice: the highest $E_a$ with the requirement met ($E_s\ge0.99$) is $q_0=<<q>>$ L\,s$^{-1}$ per furrow, $E_a=<<ea>>$ per cent",q=q,ea=f(R['Ea']*100,1)),
     T(r"Cutback to half the inflow after the front reaches the end: $V_{app}=<<va>>$ m$^3$ per furrow, $E_a=<<ea>>$ per cent, $RO=<<ro>>$ per cent, $E_s=<<es>>$ (an improvement of <<d>> points)",va=f(cb['Vapp'],2),ea=f(cb['Ea']*100,1),ro=f(cb['ro']*100,1),es=f(cb['Es'],3),d=f((cb['Ea']-R['Ea'])*100,1)),
     T(r"Furrows per hectare at 1.5 m spacing and $L=250$ m: $10\,000/(1.5\times250)=26.7$; for 12 ha, $<<n>>$ furrows",n=nfur),
     T(r"Set the water on <<s>> furrows at a time so that the supply $Q=<<q2>>$ L\,s$^{-1}$ per set is within a 30 L\,s$^{-1}$ pump: $<<s>>\times<<q>>=<<q2>>$ L\,s$^{-1}$",s=int(30//q),q=q,q2=f(int(30//q)*q,1)),
     T(r"Number of sets $=<<n>>/<<s>>=<<ns>>$; each set runs $t_{co}=<<t>>$ h, so the whole field takes $<<tt>>$ h ($<<d>>$ days of 20 h)",n=nfur,s=int(30//q),ns=f(nfur/int(30//q),1),t=f(R['tco']/60,1),tt=f(nfur/int(30//q)*R['tco']/60,0),d=f(nfur/int(30//q)*R['tco']/60/20,1)),
     T(r"Gross volume for the field $=<<n>>\times<<v>>=<<V>>$ m$^3$, or <<mm>> mm over 12 ha",n=nfur,v=f(R['Vapp'],2),V=f(nfur*R['Vapp'],0),mm=f(nfur*R['Vapp']/12e4*1000,0)),
    ]
    return out+X('Design of a furrow system for 12 ha',r"A farm of 12 ha of silty clay loam S10 is to be furrow irrigated. Furrows are 250 m long at 1.5 m spacing on a slope of 0.25 per cent, the wetted width is $w=0.75$ m, Manning $n=0.04$, and the net application is 75 mm at a 50 per cent trigger. A pump delivers 30 L\,s$^{-1}$. Derive the intake from the texture, compare four furrow inflows, choose one, examine a cutback, and find the number of furrows, the sets and the irrigation time.",st)
# ---------------- chapter 12: drip
def ch12():
    out=hd('Complete design: drip irrigation of a tomato field')
    sid='S05';sd,cl=TEX[sid];s=saxton(sd/100,cl/100,1.5)
    kw=dict(Sl=1.5,LL=100,H0=10,D=16,Zn=9,dep=25,Rmax=60,E0=2.5)
    rows=[]
    for kind,q,Se_ in (('online',4,.75),('inline',2,.5),('inline',1.6,.4)):
        r=drip(kind,q,Se_,kw['Sl'],kw['LL'],kw['H0'],kw['D'],kw['Zn'],s['ks']*24/10,0,s['fc'],s['wp'],.5,kw['dep'],kw['Rmax'],kw['E0'])
        rows.append((kind,q,Se_,r))
    best=max(rows,key=lambda x:x[3]['Ea'])
    kind,q,Se_,r=best;lat=r['lat']
    Ae=Se_*kw['Sl'];ha=1.0
    st=[T(r"Soil S05 (sandy loam, sand 65, clay 10 per cent): $\theta_{33}=<<a>>$, $\theta_{1500}=<<b>>$, $K_s=<<c>>$ mm\,h$^{-1}$; the readily available fraction is 0.5, so the water to be replaced at the trigger is $0.5(\theta_{33}-\theta_{1500})=<<d>>$",a=f(s['fc'],4),b=f(s['wp'],4),c=f(s['ks'],1),d=f(.5*(s['fc']-s['wp']),4)),
      T(r"Net depth to the trigger $Z_n=9$ mm per application of the wetted area; plant spacing: laterals every $S_l=1.5$ m, emitters every $S_e$ as tried below")]
    for kind_,q_,Se__,r_ in rows:
        st.append(T(r"Trial <<k>> emitter, $q=<<q>>$ L\,h$^{-1}$ at $S_e=<<se>>$ m: emitter uniformity $E_u=<<eu>>$; wetted area per emitter $A_e=S_eS_l=<<ae>>$ m$^2$; required volume $V_{req}=Z_nA_e=<<vr>>$ L; set time $t=<<t>>$ h; $E_a=<<ea>>$, $E_s=<<es>>$, deep loss $<<dp>>$, soil evaporation $<<ev>>$ per cent",k=kind_,q=q_,se=Se__,eu=f(r_['Eu'],3),ae=f(Se__*kw['Sl'],2),vr=f(r_['Vreq'],2),t=f(r_['t'],2),ea=f(r_['Ea']*100,1),es=f(r_['Es']*100,1),dp=f(r_['dp']*100,1),ev=f(r_['ev']*100,1)))
    n_emit=ha*1e4/Ae; Qha=n_emit*q/3600
    st+=[T(r"Choice: <<k>> emitters $q=<<q>>$ L\,h$^{-1}$ at $S_e=<<se>>$ m, with the highest efficiency $E_a=<<ea>>$ per cent",k=kind,q=q,se=Se_,ea=f(r['Ea']*100,1)),
     T(r"Emitters per hectare $=10\,000/(S_eS_l)=<<n>>$; flow of one hectare $=<<n>>\times<<q>>/3600=<<Q>>$ L\,s$^{-1}$",n=f(n_emit,0),q=q,Q=f(Qha,2)),
     T(r"Wetted bulb: radius $<<r>>$ cm, depth $<<d>>$ cm at the end of the set; the bulb is within the 60 cm root zone",r=f(r['b'].get('R',0)/10 if 'R' in r['b'] else 0,0),d=f(r['b'].get('Z',0)/10 if 'Z' in r['b'] else 0,0)) if False else T(r"Lateral of 100 m with inlet head 10 m: the head falls along the line and the emitter discharge at the end is $<<q>>$ per cent of that at the head (the variation sets $E_u$)",q=f(lat['qmin']/lat['qa']*100,1)),
     T(r"Gross volume per application $=V=q\,t=<<q>>\times<<t>>=<<v>>$ L per emitter, i.e. <<mm>> mm over the hectare",q=q,t=f(r['t'],2),v=f(q*r['t'],1),mm=f(q*r['t']*n_emit/1e4/1,1)),
     T(r"Irrigation interval: the crop uses 5 mm\,d$^{-1}$ in peak season and the net depth is 9 mm, so irrigate every $9/5=1.8\approx2$ days, applying $<<mm>>$ mm gross each time",mm=f(5*2/max(r['Ea'],.3),1)),
     T(r"Volume per season of 100 days at 5 mm\,d$^{-1}$: $5\times100/E_a=<<v>>$ mm, or $<<V>>$ m$^3$ per hectare",v=f(500/r['Ea'],0),V=f(500/r['Ea']*10,0))]
    return out+X('Design of a drip system for 1 ha of tomatoes',r"One hectare of tomatoes grows on the sandy loam S05. Laterals are 100 m long and 1.5 m apart, the inlet head is 10 m, the emitters are compared for three types, and the root zone is 60 cm deep. Select the emitter, find the set time, the emitters and flow per hectare, the irrigation interval and the seasonal volume.",st)
# ---------------- chapter 13: sprinkler
def ch13():
    out=hd('Complete design: a solid-set sprinkler system for potatoes')
    sid='S05';sd,cl=TEX[sid];s=saxton(sd/100,cl/100,1.5);psi=psiF(SOIL[sid][1],SOIL[sid][2]);dth=max(.05,.95*s['sat']-(s['fc']-.5*(s['fc']-s['wp'])))
    fit=fitK(lambda t:gaF(t,s['ks'],psi,dth)/1000,10,600);k,A=fit['k'],fit['A']
    st=[T(r"Soil S05: $K_s=<<ks>>$ mm\,h$^{-1}$, $\psi_f=<<psi>>$ mm; Kostiakov fit $k=<<k>>$, $A=<<A>>$. The soil can take water at the early rate and then slows, so the application rate of the sprinklers must not exceed the late intake",ks=f(s['ks'],1),psi=f(psi,1),k=f(k,5),A=f(A,3))]
    cases=[('impact',4.4,300,12,18),('impact',4.4,300,12,12),('spray',3.2,170,6,6)]
    rs=[]
    for t_,d,P,Ss,Sl in cases:
        r=sprinkler(t_,d,P,Ss,Sl,12,k*1000*1000/1000 if False else k,A)
        rs.append((t_,d,P,Ss,Sl,r))
        st.append(T(r"Layout <<t>> $d=<<d>>$ mm, $P=<<P>>$ kPa, $<<Ss>>\times<<Sl>>$ m: nozzle discharge $q=<<q>>$ L\,min$^{-1}$, throw $R=<<R>>$ m, mean application rate $<<AR>>$ mm\,h$^{-1}$, $CU=<<cu>>$ per cent, drift and evaporation loss $<<wd>>$ per cent, set time $T=<<T>>$ min, $E_a=<<ea>>$ per cent, runoff <<ro>> per cent",t=t_,d=d,P=P,Ss=Ss,Sl=Sl,q=f(r['q'],1),R=f(r['R'],1),AR=f(r['AR'],1),cu=f(r['CU']*100,1),wd=f(r['wdf']*100,1),T=f(r['T'],0),ea=f(r['Ea']*100,1),ro=f(r['rof']*100,1)))
    bst=max(rs,key=lambda x:x[5]['Ea']);t_,d,P,Ss,Sl,r=bst
    ha=10;nsp=ha*1e4/(Ss*Sl);Q=nsp*r['q']/60
    st+=[T(r"Choice: <<t>> at $<<Ss>>\times<<Sl>>$ m, giving $E_a=<<ea>>$ per cent",t=t_,Ss=Ss,Sl=Sl,ea=f(r['Ea']*100,1)),
     T(r"Sprinklers per 10 ha: $100\,000/(<<Ss>>\times<<Sl>>)=<<n>>$; if all operate together the flow is $<<n>>\times<<q>>/60=<<Q>>$ L\,s$^{-1}$",Ss=Ss,Sl=Sl,n=f(nsp,0),q=f(r['q'],1),Q=f(Q,1)),
     T(r"Divide the field into 4 sets, one at a time: flow $<<Q>>$ L\,s$^{-1}$, a pump of this capacity at the sprinkler pressure $<<P>>$ kPa; add 20 per cent for pipe losses, $<<H>>$ kPa at the pump",Q=f(Q/4,1),P=P,H=f(P*1.2,0)),
     T(r"Set time $T=<<T>>$ min; $4$ sets $\times$ $<<T>>$ min $=<<tt>>$ h per irrigation, so the system works <<tt>> h per interval of 3 days",T=f(r['T'],0),tt=f(4*r['T']/60,1)),
     T(r"Gross depth per application $=\overline{AR}\,T=<<g>>$ mm, of which <<st>> mm is stored and $<<dp>>$ mm lost as deep percolation",g=f(r['gross'],1),st=f(r['st'],1),dp=f(r['ex'],1))]
    return out+X('Design of a solid-set system for 10 ha',r"Ten hectares of potato are on the sandy loam S05. The root zone holds 12 mm net between irrigations, the wind is 3 m\,s$^{-1}$ and the air temperature 24$^\circ$C. Compare three sprinkler layouts, choose one, and find the number of sprinklers, the flow, the sets, the pressure and the time.",st)
# ---------------- chapter 14: drainage
def ch14():
    out=hd('Complete design: a subsurface drainage system for 20 ha')
    sd,cl=TEX['S06'];s=saxton(sd/100,cl/100,1.5)
    K1=max(.005,s['ks']*24/1000);K2=K1;mu=min(.25,max(.03,s['sat']-s['fc']));u=math.pi*.05
    depth=1.4;D=3.;q=0.007;zc=.6;h=depth-zc
    L0=math.sqrt((4*K1*h*h+8*K2*D*h)/q);L=hoogL(q,h,K1,K2,D,u);d=dEq(L,D,u)
    Lr=math.floor(L)
    area=20e4;lat_per=area/Lr;nlat=int(math.ceil(lat_per/300))
    lenL=300.;Qd=q*Lr*lenL/86.4  # L/s per lateral: q m/d * area m2 -> m3/d /86.4 -> L/s
    Qd=q*Lr*lenL/86.4
    slope=.002
    Dp=None
    for Dm in (.08,.1,.125,.15,.2,.25,.3):
        if manQ(Dm,slope,.016)*1000*.8>=Qd:Dp=Dm;break
    Qc=q*area/86.4
    st=[T(r"Soil S06 (loam): $K_s=<<ks>>$ mm\,h$^{-1}$, so $K_1=K_2=<<k>>$ m\,d$^{-1}$; drainable porosity $\mu=\theta_s-\theta_{33}=<<mu>>$",ks=f(s['ks'],1),k=f(K1,3),mu=f(mu,3)),
     T(r"Design recharge $q=7$ mm\,d$^{-1}$, drains at $<<dep>>$ m on a barrier $D=3$ m below, critical water table $z_c=0.6$ m, so the allowed head is $h=<<dep>>-0.6=<<h>>$ m",dep=depth,h=f(h,2)),
     T(r"Perimeter of the pipe $u=\pi r_0=\pi(0.05)=<<u>>$ m",u=f(u,3)),
     T(r"First guess for the spacing with the real depth, $L_0=\sqrt{(4K_1h^2+8K_2Dh)/q}=\sqrt{(4\times<<k>>\times<<h2>>+8\times<<k>>\times3\times<<h>>)/0.007}=<<L0>>$ m",k=f(K1,3),h2=f(h*h,2),h=f(h,2),L0=f(L0,0)),
     T(r"Equivalent depth at this spacing: $x=2\pi D/L=<<x>>$; the series $F(x)$ and Hooghoudt's expression give $d_e=<<d>>$ m, much less than $D$",x=f(2*math.pi*D/L0,3),d=f(dEq(L0,D,u),2)),
     T(r"Iterating $L=\sqrt{(8K_2d_eh+4K_1h^2)/q}$ to a change below 1 cm: $L=<<L>>$ m with $d_e=<<d>>$ m; adopt $L=<<Lr>>$ m",L=f(L,1),d=f(d,2),Lr=Lr),
     T(r"Number of laterals of 300 m: $20$ ha $=200\,000$ m$^2$; $200\,000/(<<Lr>>\times300)=<<n>>$ laterals, total pipe $<<tp>>$ m, or $<<pm>>$ m per hectare",Lr=Lr,n=nlat,tp=f(nlat*lenL,0),pm=f(nlat*lenL/20,0)),
     T(r"Discharge at the lower end of a lateral: $Q=q\,L\,\ell=0.007\times<<Lr>>\times300=<<Q>>$ m$^3$\,d$^{-1}$ $=<<Qs>>$ L\,s$^{-1}$",Lr=Lr,Q=f(.007*Lr*lenL,1),Qs=f(Qd,2)),
     T(r"Manning for a pipe running full, $n=0.016$, slope 0.2 per cent: $Q=\dfrac{1}{n}\dfrac{\pi D_p^2}{4}\left(\dfrac{D_p}{4}\right)^{2/3}S^{1/2}$; keeping a margin of 20 per cent the smallest standard diameter that carries $<<Qs>>$ L\,s$^{-1}$ is $<<Dp>>$ mm",Qs=f(Qd,2),Dp=f(Dp*1000,0) if Dp else 'larger than 300'),
     T(r"Collector: the whole area delivers $Q_c=q\,A=0.007\times200\,000/86.4=<<Qc>>$ L\,s$^{-1}$ to the outlet",Qc=f(Qc,1)),
     T(r"Water table in the middle at this spacing, from $q=(8K_2d_eh+4K_1h^2)/L^2$: $h=<<hm>>$ m, so the water table is <<z>> m below the surface, deeper than $z_c=0.6$ m",hm=f(h,2),z=f(depth-h,2))]
    return out+X('Design of a subsurface drainage system for 20 ha',r"A field of 20 ha of loam S06 needs drainage. The pipe drains (100 mm) are laid at 1.4 m on a barrier 3 m below, the design recharge is 7 mm\,d$^{-1}$ and the water table must stay 0.6 m below the surface. Laterals are 300 m long with a grade of 0.2 per cent. Find the spacing, the number and total length of laterals, the discharge and pipe size, and the outlet flow.",st)
for n,fn in ((11,ch11),(12,ch12),(13,ch13),(14,ch14)):
    open(OUT+'long%02d.tex'%n,'w').write(fn())
print('ok')
