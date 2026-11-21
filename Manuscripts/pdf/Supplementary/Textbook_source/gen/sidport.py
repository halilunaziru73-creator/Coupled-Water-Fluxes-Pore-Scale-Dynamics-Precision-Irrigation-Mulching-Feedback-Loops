import math
def clamp(v,a,b): return max(a,min(b,v))
def manning_furrow(Q,S,n,z=1.0,D=0.25):
    S=max(S,1e-4)
    def q(y):
        A=z*y*y;P=2*y*math.sqrt(1+z*z);R=A/P;return A*R**(2/3)*math.sqrt(S)/n
    lo,hi=1e-4,D*3
    for _ in range(60):
        m=(lo+hi)/2
        if q(m)<Q: lo=m
        else: hi=m
    y=(lo+hi)/2;return dict(y=y,A0=z*y*y,top=2*z*y,over=y>D)
def manning_wide(q,S,n):
    S=max(S,1e-4);y=(q*n/math.sqrt(S))**0.6;return dict(y=y,A0=y)
def saxton(S,C,OM):
    t1500t=-0.024*S+0.487*C+0.006*OM+0.005*S*OM-0.013*C*OM+0.068*S*C+0.031;t1500=t1500t+(0.14*t1500t-0.02)
    t33t=-0.251*S+0.195*C+0.011*OM+0.006*S*OM-0.027*C*OM+0.452*S*C+0.299;t33=t33t+(1.283*t33t**2-0.374*t33t-0.015)
    ts33t=0.278*S+0.034*C+0.022*OM-0.018*S*OM-0.027*C*OM-0.584*S*C+0.078;ts33=ts33t+(0.636*ts33t-0.107)
    ts=t33+ts33-0.097*S+0.043;B=(math.log(1500)-math.log(33))/(math.log(t33)-math.log(t1500));lam=1/B
    return dict(fc=t33,wp=t1500,sat=ts,lam=lam,ks=1930*max(ts-t33,1e-4)**(3-lam))
def gaF(tmin,ks,psi,dth):
    pd=psi*dth;kt=ks*tmin/60;F=max(kt,math.sqrt(2*pd*kt))
    for _ in range(40):
        f=F-pd*math.log(1+F/pd)-kt;d=1-pd/(pd+F);nf=F-f/max(d,1e-6);F=nf if nf>0 else F/2
        if abs(nf-F)<1e-9:break
    return F
def psiF(alpha,n):
    m=1-1/n;return 10*(1/alpha)*(0.046*m+2.07*m*m+19.5*m**3)/(1+4.7*m+16*m*m)
def fitK(fn,t0,t1):
    xs=[];ys=[]
    for i in range(25):
        t=t0*(t1/t0)**(i/24);xs.append(math.log(t));ys.append(math.log(fn(t)))
    n=len(xs);mx=sum(xs)/n;my=sum(ys)/n
    sxy=sum((x-mx)*(y-my) for x,y in zip(xs,ys));sxx=sum((x-mx)**2 for x in xs);syy=sum((y-my)**2 for y in ys)
    a=sxy/sxx;return dict(k=math.exp(my-a*mx),A=a,r2=sxy*sxy/(sxx*syy))
def solveT(f,x):
    lo,hi=1e-6,1.0
    while f(hi)<x and hi<1e8: hi*=2
    if f(hi)<x: return float('inf')
    for _ in range(80):
        m=(lo+hi)/2
        if f(m)<x: lo=m
        else: hi=m
    return (lo+hi)/2
def compute(L,w,q,k,A,Zn,A0,sy=0.8,f0=0.0,cut='es1',tmanual=None,cb=1.0,N=300,tmax=2880):
    r=0.55
    Zf=lambda t:k*t**A+f0*t
    Vx=lambda t,s:q*t/(sy*A0+(s*k*t**A+f0*t/(1+r))*w)
    sz=0.8
    for _ in range(10):
        f=lambda t:Vx(t,sz);tL=solveT(f,L);th=solveT(f,L/2)
        if not math.isfinite(tL):break
        r=math.log(2)/math.log(tL/th);sz=(A+r*(1-A)+1)/((1+A)*(1+r))
    f=lambda t:Vx(t,sz);tL=solveT(f,L)
    R=dict(sz=sz,r=r,tL=tL)
    R['tst']=solveT(Zf,Zn) if f0>0 else (Zn/k)**(1/A)
    if cut=='r85': R['tco']=solveT(f,0.85*L)+R['tst']
    elif cut=='man': R['tco']=tmanual
    else: R['tco']=tL+R['tst']
    stall=not(tL<=tmax)
    if R['tco']>tmax and cut!='man': R['tco']=tmax
    tco=R['tco'];R['stall']=stall
    xs=[L*i/N for i in range(N+1)];tx=[solveT(f,x) if x>0 else 0 for x in xs]
    Z=[Zf(tco-t) if tco>t else 0 for t in tx]
    dx=L/N;Vinf=Vst=Vdp=0;mean=sum(Z)/(N+1)
    for i in range(N):
        for s in range(4):
            zz=Z[i]+(Z[i+1]-Z[i])*(s+.5)/4;Vst+=min(zz,Zn)*dx*w/4;Vdp+=max(zz-Zn,0)*dx*w/4
        Vinf+=(Z[i]+Z[i+1])/2*dx*w
    Vapp=q*tL+q*cb*(tco-tL) if (cb<1 and tco>tL) else q*tco
    Vreq=Zn*L*w
    R.update(Z0=Zf(tco),ZL=Zf(tco-tL) if tco>tL else 0,Vapp=Vapp,Vreq=Vreq,Vinf=Vinf,Vst=Vst,Vdp=Vdp,Vro=max(Vapp-Vinf,0))
    R['Ea']=Vst/Vapp;R['Es']=Vst/Vreq;R['dp']=Vdp/Vapp;R['ro']=R['Vro']/Vapp
    R['cu']=(1-sum(abs(z-mean) for z in Z)/(N+1)/mean)*100 if mean>0 else 0
    R['Z']=Z;R['xs']=xs;R['tx']=tx;R['mean']=mean
    return R
