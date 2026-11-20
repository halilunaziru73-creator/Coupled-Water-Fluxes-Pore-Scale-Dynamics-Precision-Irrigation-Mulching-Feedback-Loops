import math,sys
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
from surf import soilpar
TYPES={'Impact':dict(cR=1.35,F=1.0,d=4.4,P=300,Ss=12,Sl=18),
       'Rotating spray':dict(cR=0.80,F=1.6,d=3.2,P=170,Ss=6,Sl=6),
       'Micro-sprinkler':dict(cR=0.70,F=0.7,d=1.3,P=180,Ss=3,Sl=3),
       'Big gun':dict(cR=0.95,F=1.3,d=16,P=500,Ss=30,Sl=36)}
def sdeff(Sd,S): return max(0,Sd)/(1+0.25*S)
def qnoz(d,P):
    h=P/9.81;An=math.pi*(d/2000)**2
    return 0.95*An*math.sqrt(2*9.81*h)*6e4
def falpha(a): return (max(0.05,math.sin(math.radians(3.1*a)))/0.9763)**0.45
def Rwet(typ,d,P,a):
    h=P/9.81;return TYPES[typ]['cR']*math.sqrt(d)*math.sqrt(h)*falpha(a)
def shape(typ,x):
    if x>=1: return 0.0
    if typ in('Impact',): return 1-x**1.3
    if typ=='Big gun': return 1-x
    if typ=='Rotating spray': return (0.5+0.5*x)*(1-x**6)
    return (0.55+0.45*x)*(1-x**5)
def pattern(typ,R,q,u,n=45):
    """returns function p(x,y) in mm/min, wind along +x"""
    ax=np.linspace(-1.4*R,1.4*R,n);dA=(ax[1]-ax[0])**2
    def raw(X,Y):
        sh=0.03*u*R
        Xr=X-sh;r=np.hypot(Xr,Y);c=np.where(r>0,Xr/np.maximum(r,1e-12),1.0)
        Re=R*np.clip(1+0.022*u*c,0.7,1.4);x=r/Re
        out=np.zeros_like(x)
        for idx,v in np.ndenumerate(x): out[idx]=shape(typ,v)
        return out
    XX,YY=np.meshgrid(ax,ax);vol=raw(XX,YY).sum()*dA
    sc=q/vol
    return (lambda X,Y: raw(X,Y)*sc),sc,vol
def overlap(typ,R,q,u,Ss,Sl,tri=False):
    p,sc,vol=pattern(typ,R,q,u)
    nx,ny=(14,24) if tri else (14,14)
    Ly=2*Sl if tri else Sl
    xs=(np.arange(nx)+0.5)*Ss/nx;ys=(np.arange(ny)+0.5)*Ly/ny
    X,Y=np.meshgrid(xs,ys);a=np.zeros_like(X)
    for i in range(-6,7):
        for j in range(-6,7):
            xi=i*Ss;yi=j*Sl
            if tri and j%2: xi+=Ss/2
            a+=p(X-xi,Y-yi)
    return a
def wdrift(typ,u,P,Ta,alpha):
    F=TYPES[typ]['F']
    v=(1.2+0.5*u+0.04*u*u)*F*(P/250)**0.7*(1+0.025*(Ta-20))*(0.6+0.4*math.sin(math.radians(alpha))/0.4226)
    return min(45,max(0.5,v))/100
def ponding(a_eff,K,A,T,Sd):
    tp=(a_eff/K)**(1/(A-1))
    sup=a_eff*T
    F=sup if T<=tp else K*T**A
    R=sup-F;RO=max(0,R-Sd);I=sup-RO
    return tp,sup,I,RO
def cells(a,typ,Ts,wd,K,A,Sd,Iint,T):
    Zk=[];ROk=[];Ick=[];
    for ak in a.ravel():
        ae=max(ak*(1-wd),1e-9)
        tp,sup,I,RO=ponding(ae,K,A,T,Sd)
        Ic=min(I,Iint);Zk.append(I-Ic);ROk.append(RO);Ick.append(Ic)
    return np.array(Zk),np.array(ROk),np.array(Ick)
def effs(a,wd,K,A,Sd,Iint,T,Zn):
    Zk,RO,Ic=cells(a,None,None,wd,K,A,Sd,Iint,T)
    gross=a.mean()*T;n=len(Zk)
    srt=np.sort(Zk);q=max(1,n//4);Z25=srt[:q].mean()
    Ea=np.minimum(Zk,Zn).mean()/gross;Es=np.minimum(Zk,Zn).mean()/Zn
    DU=Z25/Zk.mean() if Zk.mean()>0 else 0
    DP=np.maximum(Zk-Zn,0).mean()/gross;ROf=RO.mean()/gross;WD=wd+Ic.mean()/gross
    return dict(Ea=Ea,Es=Es,DU=DU,DP=DP,RO=ROf,WD=WD,Z25=Z25,gross=gross,Zk=Zk,Zmean=Zk.mean())
def autoT(a,wd,K,A,Sd,Iint,Zn):
    lo,hi=1.0,2400.0
    def z25(T):
        Zk,_,_=cells(a,None,None,wd,K,A,Sd,Iint,T);s=np.sort(Zk);return s[:max(1,len(s)//4)].mean()
    if z25(hi)<Zn: return hi
    for _ in range(18):
        m=(lo+hi)/2
        if z25(m)>=Zn: hi=m
        else: lo=m
    return hi
TAB133=[('Deep coarse sandy soils',[50,38,25,13]),('Coarse sandy, compact layer below',[38,25,19,10]),('Deep sandy loam',[25,20,15,10]),('Sandy loam, compact layer below',[19,13,10,8]),('Deep silt loam',[13,10,8,5]),('Silt loam, compact layer below',[8,6,4,2.5]),('Clay or clay loam, strong structure',[4,2.5,2,1.5])]
ROW={'S02':0,'S03':0,'S04':0,'S05':2,'S01':2,'S06':4,'S07':4,'S08':5,'S09':6,'S10':6}
def maxrate(sid,slope,compact=False):
    r=ROW[sid]
    if compact and r%2==0: r+=1
    c=0 if slope<=5 else 1 if slope<=8 else 2 if slope<=12 else 3
    return TAB133[r][1][c],r,c
def blasius(Q,D): return 0.472*Q**1.75/D**4.75
DSER=[46.4,58,63,65.8,75,84.9,100]
if __name__=='__main__':
    sp=soilpar('S06',0.468);K=sp['k']*1000;A=sp['A']
    typ='Impact';d=4.4;P=300;al=25
    q=qnoz(d,P);R=Rwet(typ,d,P,al);print(q,R,falpha(al))
    a=overlap(typ,R,q,3.0,12,18);print(a.mean()*60,1-np.abs(a-a.mean()).sum()/a.size/a.mean())
    wd=wdrift(typ,3,P,24,al);print(wd,K,A)
