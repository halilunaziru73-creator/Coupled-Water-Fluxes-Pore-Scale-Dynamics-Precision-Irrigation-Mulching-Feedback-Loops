import math,numpy as np
def hw(Se,Q,D,C=140): return 10.67*Se*Q**1.852/(C**1.852*D**4.871)
def lateral(LL,Se,D_mm,H0,q_lh,x,pc=False,Hmin=8.0):
    N=int(round(LL/Se));D=D_mm/1000;q0=q_lh
    qj=np.full(N+1,q0,float);hj=np.full(N+1,H0,float)
    def qf(h):
        if pc:
            return np.where(h>=Hmin,q0*(1+0.04*(h-H0)/H0),q0*(np.maximum(h,0.1)/Hmin)**0.5)
        return q0*(np.maximum(h,0)/H0)**x
    for it in range(500):
        # flows Q_j for segment feeding emitter j: sum of q_i for i>=j+1 ... segment index 0..N-1
        qm3=qj/3600/1000
        Qseg=np.cumsum(qm3[::-1])[::-1]  # Q into segment before emitter j = sum_{i>=j}
        h=np.empty(N+1);h[0]=H0
        for j in range(1,N+1):
            Q=qm3[j:].sum()
            h[j]=max(h[j-1]-hw(Se,Q,D),0.5) if j>1 or True else h[j-1]
        qn=qf(h)
        if it>=3: qn=0.5*(qn+qj)
        err=np.max(np.abs(qn-qj)/np.maximum(qj,1e-12));qj=qn;hj=h
        if err<1e-7: break
    return qj,hj,it+1
def bulb_radius(Vw_mm3,a,u,zd,upper_cut=True):
    zs=np.linspace(0,3500+zd,56*1+1) # coarse; use analytic with surface truncation via fine integration
    def vol(r):
        z=np.linspace(max(0,zd-u*r),zd+a*r,2001)
        zeta=np.where(z>=zd,(z-zd)/(a*r),(zd-z)/(u*r))
        rho=r*np.sqrt(np.maximum(1-zeta**2,0))
        return np.trapezoid(np.pi*rho**2,z)
    lo,hi=5.0,3500.0
    for _ in range(38):
        mid=(lo+hi)/2
        if vol(mid)<Vw_mm3: lo=mid
        else: hi=mid
    return (lo+hi)/2
def rho_fn(r,a,u,zd):
    def rho(z):
        zeta=(z-zd)/(a*r) if z>=zd else (zd-z)/(u*r)
        return r*math.sqrt(max(1-zeta**2,0))
    return rho
def drip_eff(qbar,sigq,t,Zn,Se,Sl,a,u,zd_mm,dth,Rmax_mm,E0):
    Vreq=Zn*Se*Sl;zq=[-1.28,-0.52,0,0.52,1.28];res=[]
    for z in zq:
        V=max(0.02*qbar*t,qbar*t*(1+sigq*z))
        Vw=V*1e6/dth
        r=bulb_radius(Vw,a,u,zd_mm);rho=rho_fn(r,a,u,zd_mm)
        zz=np.linspace(max(0,zd_mm-u*r),zd_mm+a*r,2001);vals=np.array([math.pi*rho(x)**2 for x in zz])
        tot=np.trapezoid(vals,zz);below=np.trapezoid(np.where(zz>Rmax_mm,vals,0),zz)
        Vdp=V*below/tot
        Vev=min(0.5*V,math.pi*rho(0)**2*1e-6*2*E0)
        Vroot=V-Vdp-Vev;Vst=min(Vroot,Vreq);Vex=Vroot-Vst
        res.append(dict(V=V,r=r,Vdp=Vdp,Vev=Vev,Vroot=Vroot,Vst=Vst,Vex=Vex))
    mV=np.mean([x['V'] for x in res])
    Ea=np.mean([x['Vst'] for x in res])/mV;Es=np.mean([x['Vst'] for x in res])/Vreq
    DP=np.mean([x['Vdp']+x['Vex'] for x in res])/mV;EV=np.mean([x['Vev'] for x in res])/mV
    return dict(res=res,Ea=Ea,Es=Es,DP=DP,EV=EV,Vreq=Vreq,Zgross=qbar*t/(Se*Sl))
