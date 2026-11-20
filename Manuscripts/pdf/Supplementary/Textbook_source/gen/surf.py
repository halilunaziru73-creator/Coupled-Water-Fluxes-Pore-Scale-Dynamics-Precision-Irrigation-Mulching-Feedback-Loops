import math,sys
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
def saxton(S,C,OM):
    t1500=-0.024*S+0.487*C+0.006*OM+0.005*S*OM-0.013*C*OM+0.068*S*C+0.031
    th1500=t1500+(0.14*t1500-0.02)
    t33=-0.251*S+0.195*C+0.011*OM+0.006*S*OM-0.027*C*OM+0.452*S*C+0.299
    th33=t33+(1.283*t33**2-0.374*t33-0.015)
    ts33=0.278*S+0.034*C+0.022*OM-0.018*S*OM-0.027*C*OM-0.584*S*C+0.078
    ts33=ts33+(0.636*ts33-0.107)
    ths=th33+ts33-0.097*S+0.043
    B=(math.log(1500)-math.log(33))/(math.log(th33)-math.log(th1500))
    lam=1/B
    Ks=1930*(ths-th33)**(3-lam)
    return dict(t1500=t1500,th1500=th1500,t33=t33,th33=th33,ts33=ts33,ths=ths,B=B,lam=lam,Ks=Ks)
def psif(a,n):
    m=1-1/n;return 10/a*(0.046*m+2.07*m**2+19.5*m**3)/(1+4.7*m+16*m**2)
def GA(t,Ks,pf,dth):
    # t min ; returns F mm ; Newton
    c=pf*dth;rhs=Ks*t/60
    F=max(rhs,math.sqrt(2*c*rhs))
    for _ in range(60):
        g=F-c*math.log(1+F/c)-rhs;dg=1-1/(1+F/c)
        F2=F-g/dg
        if abs(F2-F)<1e-10: F=F2;break
        F=F2
    return F
def kost(Ks,pf,dth):
    taus=np.geomspace(10,600,25);F=np.array([GA(t,Ks,pf,dth) for t in taus])
    x=np.log(taus);y=np.log(F/1000);A=((x-x.mean())*(y-y.mean())).sum()/((x-x.mean())**2).sum()
    lk=y.mean()-A*x.mean();R2=((x-x.mean())*(y-y.mean())).sum()**2/(((x-x.mean())**2).sum()*((y-y.mean())**2).sum())
    return math.exp(lk),A,R2
def manning_furrow(q_ls,S,n,z=1.0):
    Q=q_ls/1000;S=max(S,1e-4)
    lo,hi=1e-4,2.0
    for _ in range(60):
        y=(lo+hi)/2;A=z*y*y;P=2*y*math.sqrt(1+z*z);Qc=A*(A/P)**(2/3)*math.sqrt(S)/n
        if Qc<Q: lo=y
        else: hi=y
    y=(lo+hi)/2;return y,z*y*y
def manning_sheet(q_m2s,S,n):
    y=(q_m2s*n/math.sqrt(S))**0.6;return y,y
def design(L,S,q,n,w,k,A,Zn,furrow=True,cut='Es1',cb=1.0,tco_in=None,Ks=None):
    """k in m/min^A, A, Zn in m. q in L/s per furrow (or per m width)"""
    if furrow: y,A0=manning_furrow(q,S/100,n)
    else: y,A0=manning_sheet(q/1000,S/100,n)
    Qm=q*60/1000  # m3/min
    sy=0.8
    def xof(t,sz): return Qm*t/(sy*A0+sz*k*t**A*w)
    def tof(x,sz):
        lo,hi=1e-6,1e7
        for _ in range(100):
            mid=math.sqrt(lo*hi)
            if xof(mid,sz)<x: lo=mid
            else: hi=mid
        return math.sqrt(lo*hi)
    sz=0.8
    for _ in range(10):
        tL=tof(L,sz);tH=tof(L/2,sz);r=math.log(2)/math.log(tL/tH)
        sz=(A+r*(1-A)+1)/((1+A)*(1+r))
    tL=tof(L,sz);tH=tof(L/2,sz);r=math.log(2)/math.log(tL/tH)
    tst=(Zn/k)**(1/A)
    if tco_in is None:
        tco=tL+tst if cut=='Es1' else tof(0.85*L,sz)+tst
    else: tco=tco_in
    reached=tco>=tL
    N=300;xs=np.linspace(0,L,N+1)
    tx=np.array([0.0]+[tof(x,sz) for x in xs[1:]])
    Z=np.where(tco>tx,k*np.maximum(tco-tx,0)**A,0.0)
    Vapp=Qm*tco if cb>=1 else Qm*tL+cb*Qm*(tco-tL)
    Vreq=Zn*L*w
    tr=np.trapezoid
    Vinf=w*tr(Z,xs);Vst=w*tr(np.minimum(Z,Zn),xs);Vdp=w*tr(np.maximum(Z-Zn,0),xs);Vdf=w*tr(np.maximum(Zn-Z,0),xs)
    Vro=max(Vapp-Vinf,0)
    Zb=Z.mean()
    CU=100*(1-np.abs(Z-Zb).sum()/((N+1)*Zb)) if Zb>0 else 0
    return dict(y=y,A0=A0,r=r,sz=sz,tL=tL,tst=tst,tco=tco,Z0=Z[0],ZL=Z[-1],Vapp=Vapp,Vreq=Vreq,Vinf=Vinf,Vst=Vst,Vdp=Vdp,Vdf=Vdf,Vro=Vro,Ea=Vst/Vapp,Es=Vst/Vreq,DP=Vdp/Vapp,RO=Vro/Vapp,CU=CU,reached=reached,xs=xs,Z=Z,tx=tx)
def soilpar(sid,fT,OM=1.5):
    nm,a,n,awc,sa,si,cl=SOIL[sid]
    s=saxton(sa/100,cl/100,OM);pf=psif(a,n)
    th0=s['th33']-fT*(s['th33']-s['th1500']);dth=max(0.05,0.95*s['ths']-th0)
    k,A,R2=kost(s['Ks'],pf,dth)
    return dict(sax=s,pf=pf,th0=th0,dth=dth,k=k,A=A,R2=R2)
if __name__=='__main__':
    sp=soilpar('S06',0.468);print({k:v for k,v in sp.items() if k!='sax'},sp['sax'])
    Zn=0.0733
    d=design(180,0.30,1.2,0.04,0.75,sp['k'],sp['A'],Zn)
    print({k:(round(v,4) if isinstance(v,float) else v) for k,v in d.items() if k not in('xs','Z','tx')})
