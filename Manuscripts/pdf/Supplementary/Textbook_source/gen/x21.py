import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from x20 import *
CR=[('Maize',1.20,1.25,100,.55,11.5,1.7,.75,.25,125),('Wheat',1.15,1.15,120,.55,8.0,6.0,.20,.05,150),('Cotton',1.15,.85,110,.65,4.5,7.7,1.0,.15,180),
('Tomato',1.15,1.05,70,.40,75.0,2.5,1.5,.5,135),('Potato',1.15,1.10,50,.35,40.0,1.7,.75,.3,130),('Soybean',1.15,.85,60,.50,3.5,5.0,.50,.05,130),
('Sugar beet',1.20,1.00,90,.55,60.0,7.0,.50,.2,180),('Sunflower',1.10,.95,80,.45,3.0,4.8,.75,.3,125),('Onion',1.05,1.10,35,.30,50.0,1.2,.40,.1,150),('Alfalfa',1.15,1.10,100,.55,15.0,2.0,.20,.05,100)]
S='S06';A=SOIL[S][3];ET0=5.5
def c1(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;TAW=A*zr/10*10/10*1;TAW=A*zr;RAW=p*TAW
    return (r"%s grows on the loam S06 (AWC %.1f mm\,cm$^{-1}$) with a root zone of %d cm and a depletion fraction $p=%.2f$. Find TAW, RAW and the days between irrigations at its mid-season demand $K_{c}=%.2f$, $ET_0=%.1f$ mm\,d$^{-1}$."%(n,A,zr,p,km,ET0),
     r"$TAW=\mathrm{AWC}\,z_r=%.1f\times%d=%.0f$ mm \ans $RAW=p\,TAW=%.2f\times%.0f=%.0f$ mm \ans $ET_c=K_cET_0=%.2f\times%.1f=%.2f$ mm\,d$^{-1}$ \ans Interval $=RAW/ET_c=%.0f/%.2f=%.1f$ d \ans"%(A,zr,TAW,p,TAW,RAW,km,ET0,km*ET0,RAW,km*ET0,RAW/(km*ET0)))
def c2(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;Tp=km*ET0;w=[.4,.3,.2,.1]
    return (r"%s: potential transpiration $T_p=K_cET_0=%.2f\times%.1f$ mm\,d$^{-1}$ is shared between four layers by the root-density weights 0.40, 0.30, 0.20, 0.10. The layer stress factors are $\alpha=1,\ 1,\ 0.6,\ 0.2$. Find the uptake of each layer and the actual transpiration."%(n,km,ET0),
     r"$T_p=%.2f$ mm\,d$^{-1}$ \ans Potential uptake $S_p=0.40T_p,\ldots=%.2f,\ %.2f,\ %.2f,\ %.2f$ mm\,d$^{-1}$ \ans Actual uptake $S=\alpha S_p=%.2f,\ %.2f,\ %.2f,\ %.2f$ \ans $T_a=\sum S=%.2f$ mm\,d$^{-1}$, a ratio $T_a/T_p=%.2f$ \ans"%(Tp,*[x*Tp for x in w],*[a*x*Tp for a,x in zip((1,1,.6,.2),w)],sum(a*x*Tp for a,x in zip((1,1,.6,.2),w)),sum(a*x for a,x in zip((1,1,.6,.2),w))))
def c3(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;TAW=A*zr;RAW=p*TAW;t=RAW/(km*ET0)
    return (r"%s on the loam S06: the trigger fires at the depletion fraction $p=%.2f$. Using the demand $r=ET_c/TAW$ and $t_{\rm trig}=p/r$, find the time from full profile to the trigger and the number of irrigations in a season of %d days."%(n,p,L),
     r"$TAW=%.1f\times%d=%.0f$ mm; $r=%.2f\times%.1f/%.0f=%.4f$ d$^{-1}$ \ans $t_{\rm trig}=%.2f/%.4f=%.1f$ d \ans Irrigations $\approx%d/%.1f=%.0f$ \ans"%(A,zr,TAW,km,ET0,TAW,km*ET0/TAW,p,km*ET0/TAW,t,L,t,L/t))
def c4(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;ETc=km*ET0*L*.8
    return (r"%s: the seasonal crop evapotranspiration is $\Sigma ET_c\approx0.8K_{c,mid}ET_0L$ for $L=%d$ days; rain is 280 mm and the effective share is 0.75. Find the net irrigation requirement and audit the balance with drainage 20 mm and runoff 15 mm."%(n,L),
     r"$\Sigma ET_c=0.8\times%.2f\times%.1f\times%d=%.0f$ mm \ans Effective rain $0.75\times280=210$ mm \ans $NIR=ET_c-P_e=%.0f-210=%.0f$ mm \ans Balance: $P+I=280+%.0f=%.0f$; $ET+D+Q=%.0f+20+15=%.0f$ \ans Residual %.0f mm (change of storage) \ans"%(km,ET0,L,ETc,ETc,ETc-210,ETc-210,280+ETc-210,ETc,ETc+35,280+ETc-210-ETc-35))
def c5(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;d=.2;Wm=km*ET0*L*.8*10  # m3/ha at full ET
    sav=d*Wm
    return (r"%s ($K_y=%.2f$, $Y_m=%.1f$ Mg\,ha$^{-1}$): a deficit of 20 per cent of the seasonal evapotranspiration occurs ($\Sigma ET_m\approx%.0f$ mm). Find the relative and absolute yield, the loss, and compare the value of the water saved (0.12 per m$^3$) with the grain lost (250 per Mg)."%(n,ky,ym,Wm/10),
     r"$Y/Y_m=1-K_y(1-ET_a/ET_m)=1-%.2f\times0.20=%.3f$ \ans $Y=%.3f\times%.1f=%.2f$ Mg\,ha$^{-1}$ \ans Loss $=%.2f$ Mg\,ha$^{-1}$, worth %.0f per ha \ans Water saved $=0.2\times%.0f=%.0f$ m$^3$\,ha$^{-1}$, worth %.0f per ha \ans %s"%(ky,1-ky*d,1-ky*d,ym,ym*(1-ky*d),ym*ky*d,ym*ky*d*250,Wm,sav,0.12*sav,'The saving pays.' if 0.12*sav>ym*ky*d*250 else 'The grain lost is worth more than the water saved: the deficit does not pay at these prices.'))
def c6(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;etc=km*ET0;Ea=.75
    return (r"%s: find the peak crop evapotranspiration, the gross depth per day and the continuous flow per hectare for $E_a=0.75$ and $ET_0=%.1f$ mm\,d$^{-1}$."%(n,ET0),
     r"$ET_c=%.2f\times%.1f=%.2f$ mm\,d$^{-1}$ \ans Gross $=%.2f/0.75=%.2f$ mm\,d$^{-1}$ \ans Flow $=10\times%.2f/24\,\mathrm{m^3\,h^{-1}\,ha^{-1}}=%.2f$ m$^3$\,h$^{-1}$, i.e.\ $%.2f$ L\,s$^{-1}$\,ha$^{-1}$ \ans"%(km,ET0,etc,etc,etc/Ea,etc/Ea,10*etc/Ea/24,10*etc/Ea/24/3.6))
def c7(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;TAW=A*zr;RAW=p*TAW;T=max(1,int(RAW/(km*ET0)));d=T*km*ET0
    return (r"%s on 10 ha of the loam S06: design the interval, the gross depth and the flow to irrigate in 20 h\,d$^{-1}$ at $E_a=0.80$."%n,
     r"$RAW=%.0f$ mm; $T=\lfloor%.0f/%.2f\rfloor=%d$ d \ans Net depth $%.1f$ mm; gross $%.1f$ mm \ans $Q=10Ad/(E_aTh)=10\times10\times%.1f/(0.8\times%d\times20)=%.1f$ m$^3$\,h$^{-1}$ ($%.1f$ L\,s$^{-1}$) \ans"%(RAW,RAW,km*ET0,T,d,d/.8,d,T,10*10*d/(.8*T*20),10*10*d/(.8*T*20)/3.6))
def c8(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;TAW=A*zr;RAW=p*TAW;e=km*ET0;d0=RAW/e;D=RAW
    for _ in range(5):
        Ks=max(0,(TAW-D)/(TAW-RAW));D+=Ks*e
    Ks5=max(0,(TAW-D)/(TAW-RAW))
    return (r"%s: a full bucket ($D=0$) drains by evapotranspiration at $K_cET_0=%.2f$ mm\,d$^{-1}$ with no rain. After how many days does $K_s$ fall below 1, and what are $D$ and $K_s$ five days later?"%(n,e),
     r"$TAW=%.0f$, $RAW=%.0f$ mm \ans $D$ reaches RAW after $%.1f$ d \ans Then each day $D\leftarrow D+K_sK_cET_0$ with $K_s=(TAW-D)/(TAW-RAW)$; after five days $D=%.1f$ mm \ans $K_s=%.2f$ \ans"%(TAW,RAW,d0,D,Ks5))
def c9(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;ke=.25
    return (r"%s: split $K_c=%.2f$ into basal $K_{cb}=%.2f$ and an evaporation part $K_e=%.2f$ of a bare wet soil; a straw mulch (6 t\,ha$^{-1}$) reduces $K_e$ by 60 per cent. Find the daily saving and the saving over %d days if the soil is wet one day in three."%(n,km,km-ke,ke,L),
     r"$K_e=%.2f$; under mulch $0.40\times%.2f=%.2f$ \ans Daily saving $=0.60\times%.2f\times%.1f=%.2f$ mm\,d$^{-1}$ \ans Over the season: $%.2f\times%d/3=%.0f$ mm \ans"%(ke,ke,.4*ke,ke,ET0,.6*ke*ET0,.6*ke*ET0,L,.6*ke*ET0*L/3))
def c10(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;ETs=km*ET0*L*.8
    return (r"%s: with $Y_m=%.1f$ Mg\,ha$^{-1}$ and a seasonal $ET_c\approx%.0f$ mm find the potential water productivity and the harvest index implied by a biomass of 2.4 times the yield."%(n,ym,ETs),
     r"$WP=Y_m/ET_c=%.1f\times1000/(%.0f\times10)=%.2f$ kg\,m$^{-3}$ \ans $B=2.4\times%.1f=%.1f$ Mg\,ha$^{-1}$; $HI=Y/B=1/2.4=0.42$ \ans $TE=B/T$ with $T\approx0.8ET_c$: $%.1f\times1000/(0.8\times%.0f\times10)=%.2f$ kg\,m$^{-3}$ \ans"%(ym,ETs,ym*100/ETs,ym,2.4*ym,2.4*ym,ETs,2.4*ym*100/(.8*ETs)))
def c11(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;sp=row if row>0.25 else .75;q=min(3.0,0.63/0.2)
    return (r"%s: furrows are at the row spacing of %.2f m on a slope of 0.2 per cent. Find the number of furrows per hectare for 200-m runs, the Criddle limit of the stream and the hectare flow if one furrow is irrigated at a time per 20 furrows."%(n,sp),
     r"Furrows per hectare: $10^4/(%.2f\times200)=%.0f$ \ans Criddle: $q_{max}=0.63/S_0(\%%)=0.63/0.2=%.2f$ L\,s$^{-1}$ per furrow \ans 20 furrows together carry $20\times%.2f=%.0f$ L\,s$^{-1}$ \ans"%(sp,1e4/(sp*200),q,q,20*q))
def c12(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;sp=row if row>.25 else .75;pl_=max(pl,.15);V=km*ET0*sp*pl_*.8
    return (r"%s: drip irrigation with plants at %.2f m along rows %.2f m apart, one emitter per plant of 2 L\,h$^{-1}$, $K_r=0.8$ ground cover. Find the plants per hectare, the daily water per plant and the run time."%(n,pl_,sp),
     r"Plants per hectare $10^4/(%.2f\times%.2f)=%.0f$ \ans $V=K_cET_0\,K_r\,S_pS_r=%.2f\times%.1f\times0.8\times%.2f\times%.2f=%.2f$ L per plant per day \ans Run time $V/q=%.2f/2=%.2f$ h \ans"%(pl_,sp,1e4/(pl_*sp),km,ET0,pl_,sp,V,V,V/2))
def c13(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;gross=km*ET0*3/.75
    return (r"%s: a solid-set sprinkler system with $r=7.6$ mm\,h$^{-1}$ irrigates every 3 days at $E_a=0.75$. Find the gross depth, the set time and the number of sets per 20-h day."%n,
     r"Net depth $3\times%.2f=%.1f$ mm; gross $%.1f/0.75=%.1f$ mm \ans $t_{\rm set}=%.1f/7.6=%.1f$ h \ans Sets per day $\lfloor20/%.1f\rfloor=%d$ \ans"%(km*ET0,3*km*ET0,3*km*ET0,gross,gross,gross/7.6,gross/7.6,int(20/(gross/7.6))))
def c14(c):
    n,km,ky,zr,p,ym,ece,row,pl,L=c;LR=1.5/(5*ece-1.5)
    return (r"%s (threshold $EC_e=%.1f$ dS\,m$^{-1}$): the irrigation water has $EC_w=1.5$ dS\,m$^{-1}$. Find the leaching requirement and the gross depth for a net requirement of 450 mm."%(n,ece),
     r"$LR=EC_w/(5EC_e-EC_w)=1.5/(5\times%.1f-1.5)=%.3f$ \ans Gross $=450/(1-LR)=450/%.3f=%.0f$ mm \ans Extra water for leaching $%.0f$ mm \ans"%(ece,LR,1-LR,450/(1-LR),450/(1-LR)-450))
fb={1:c1,2:c2,3:c3,4:c4,5:c5,6:c6,7:c7,8:c8,9:c9,10:c10,11:c11,12:c12,13:c13,14:c14}
for vi,(e0,tag,fn) in enumerate(((5.5,'',''),(4.0,' (cool climate)','x'),(7.5,' (hot climate)','y'))):
  ET0=e0
  globals()['ET0']=e0
  for k in range(1,15):
    b=sec('Worked solutions on ten crops'+tag)+P(r"The ten crops of the library differ in their demand, their roots and their sensitivity. The same type of question is answered for each of them at $ET_0=%.1f$ mm\,d$^{-1}$; the data are typical values of the crops (Doorenbos--Kassam and FAO 56)."%e0)
    for c in CR:
        stmt,sol=fb[k](c);b+=ex(stmt,sol,'Crop example %d%s: %s'%(k,'abc'[vi],c[0]))
    write(k,'tenb'+fn,b)
print('ok21')
