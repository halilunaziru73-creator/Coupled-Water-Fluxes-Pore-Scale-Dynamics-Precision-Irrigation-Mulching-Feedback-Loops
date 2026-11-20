import math,sys
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
CROPS={ # name:(kini,kmid,kend,(L1,L2,L3,L4),h,Rmax,p,Ky)
'Maize':(0.30,1.20,0.60,(15,30,40,20),1.5,135,0.50,1.28),
'Wheat':(0.40,1.15,0.41,(20,30,45,25),0.9,150,0.50,1.05),
'Sorghum':(0.30,1.05,0.45,(20,35,40,30),1.8,150,0.55,0.90),
'Soybean':(0.40,1.10,0.50,(20,30,45,25),0.8,95,0.50,1.07),
'Groundnut':(0.40,1.05,0.60,(20,35,40,25),0.5,100,0.50,0.70),
'Cotton':(0.40,1.10,0.50,(30,45,65,50),1.2,135,0.60,1.05),
'Tomato':(0.60,1.10,1.00,(30,40,40,25),0.6,120,0.40,1.20),
'Potato':(0.50,1.10,0.40,(25,30,45,30),0.6,60,0.40,1.10),
'Onion':(0.70,1.05,0.70,(15,25,70,40),0.5,60,0.30,1.18),
'Cabbage':(0.70,1.05,1.00,(40,60,50,15),0.4,50,0.35,0.95),
'Reference':(0.30,1.15,0.25,(20,30,45,25),0.9,150,0.50,1.05),
'Cassava':(0.30,1.00,0.60,(20,40,90,60),1.0,65,0.50,1.0)}
EFF={'surface':0.60,'overhead':0.75,'drip':0.90}
def kc_t(c,t):
    ki,km,ke,(L1,L2,L3,L4)=c[0],c[1],c[2],c[3]
    if t<0: return 0.25
    if t<L1: return ki
    if t<L1+L2: return ki+(km-ki)*(t-L1)/L2
    if t<L1+L2+L3: return km
    if t<L1+L2+L3+L4: return km+(ke-km)*min(1,(t-L1-L2-L3)/L4)
    return 0.25
def weather(seed=7,years=1,P=600.,E0=4.0,amp=2.0):
    rng=np.random.default_rng(seed);n=365*years
    d=np.arange(n)
    et0=np.maximum(0.8,E0+amp*np.sin(2*np.pi*(d-100)/365)+rng.normal(0,0.35,n))
    mu=P/(0.25*365)
    rain=np.where(rng.random(n)<0.25,rng.exponential(mu,n),0.0)
    return et0,rain
def season(cname,AWC,fT,et0,rain,plant=100,method='surface',trigger=True,Dr0=0.0,Rmax_cap=100):
    c=CROPS[cname];ki,km,ke,(L1,L2,L3,L4),h,Rm,p,Ky=c;Rm=min(Rm,Rmax_cap)
    Lt=L1+L2+L3+L4;Dr=Dr0;rows=[];irr=[]
    sETa=sETc=0.0;DP=0.0;Ea_m=EFF[method];Itot=0
    for k in range(Lt):
        d=plant+k;Kc=kc_t(c,k);E0=et0[d];P=rain[d]
        zr=min(Rm,max(15,15+(Rm-15)*min(1,1.15*Kc/max(0.3,km))))
        TAW=AWC*zr;pd=min(0.8,max(0.1,p+0.04*(5-Kc*E0)));RAW=pd*TAW
        ETc=Kc*E0
        Ks=1.0 if Dr<=RAW else max(0,(TAW-Dr)/((1-pd)*TAW))
        ETa=Ks*ETc;RO=0.3*max(0,P-35)
        Dr=Dr-(P-RO)+ETa;dr=0.0
        if Dr<0: dr=-Dr;Dr=0.0;DP+=dr
        I=0.0;In=0.0
        if trigger and Dr>=fT*TAW:
            In=Dr;I=In/Ea_m;Dr=0.0;irr.append((k+1,In,I));Itot+=I
        sETa+=ETa;sETc+=ETc
        rows.append((k+1,Kc,E0,zr,TAW,RAW,Ks,ETc,ETa,P,RO,Dr,In))
    Yrel=min(1,max(0,1-Ky*(1-sETa/sETc)))
    return dict(DP=DP,rows=rows,irr=irr,ETa=sETa,ETc=sETc,Yrel=Yrel,I=Itot,In=sum(x[1] for x in irr),Lt=Lt)
