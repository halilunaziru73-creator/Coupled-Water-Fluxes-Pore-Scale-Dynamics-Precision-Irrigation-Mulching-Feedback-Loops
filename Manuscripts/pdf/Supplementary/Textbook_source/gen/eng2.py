import numpy as np, math, sys
sys.path.insert(0,'/tmp/book/gen')
from lib import *
def canopy_spring(d,dsow=100,dharv=225):
    dmid=dsow+50; dpk=dharv-50
    c=1/(1+math.exp(-(d-dmid)/13))
    if d>dpk: c*=max(0,1-(d-dpk)/(dharv-dpk))
    if d<dsow or d>dharv: return 0.0
    return c
def run(soil='S06',trig=300,P=600.,Eyr=170.,Tyr=230.,Ibar=150.,seed=1,kt=1.0,sensor=20.):
    nm,a,n,awc,sand,silt,clay=SOIL[soil]
    N=40;dz=2.5;Wmax=awc*dz
    rng=np.random.default_rng(seed)
    fT=fdep(a,n,trig)
    jS=int(round(sensor/dz))
    w=np.full(N,0.72*Wmax);S0=w.sum()
    Cbar=sum(canopy_spring(d) for d in range(365))/365
    wts=np.array([0.35+0.65*0.5*(1+math.sin(2*math.pi*(k-100)/364)) for k in range(365)])
    mu0=P/(0.28*365)
    Ic=mu0*math.log(1/0.9) # r=0.9 assumed
    Rmax=min(100,max(25,95*(0.85+0.3*sand/100)*(1+0.12*math.log10(trig/300))))
    Rd=3.0; U=np.zeros(N); log=[];irr_days=[];Itot=Dtot=Etot=Ttot=Ptot=0
    for d in range(365):
        _E0=Etot;_T0=Ttot
        c=canopy_spring(d)
        R=0.0
        if rng.random()<0.28: R=min(70,mu0*(-math.log(rng.random())))
        Tf=max(0,R-Ic); Tf=Tf if Tf>0.3 else 0.0
        irr=0.0
        # irrigation rule
        if c>0.2 and 95<=d<=250 and fT<0.995 and (1-w[jS]/Wmax)>=fT:
            dose=min(35,max(15,Ibar/10)); irr=dose
        inflow=Tf+irr
        w[0]+=inflow
        Dd=0
        for i in range(N):
            if w[i]>Wmax:
                ex_=w[i]-Wmax; w[i]=Wmax
                if i<N-1: w[i+1]+=ex_
                else: Dd=ex_
        # redistribution
        for i in range(N-1):
            q=0.08*(w[i+1]-w[i]); w[i]+=q; w[i+1]-=q
        # roots
        if c>0.04 and d<225:
            Rd=max(Rd,min(Rmax*np.clip((c-0.04)/0.96,0,1)**0.8,Rmax,Rd+1.7*(0.35+0.6)*1.0))
        z=(np.arange(N)+0.5)*dz
        lam=0.32
        rho=np.where(z<=Rd,np.exp(-z/(lam*Rd+8))*(0.45+0.9*w/Wmax),0.0)
        rho=rho/rho.sum() if rho.sum()>0 else rho
        # evaporation
        Ed=Eyr*wts[d]/wts.sum()*(1-0.3*c)
        for i,wt in enumerate([0.55,0.25,0.12,0.08]):
            take=min(Ed*wt,max(0,w[i]-0.05*Wmax)); w[i]-=take; Etot+=take
        Td=kt*Tyr*c/(Cbar*365)
        a_i=np.clip((w/Wmax-0.15)/0.6,0,1)
        den=(rho*a_i).sum()
        if den>0 and Td>0:
            q=Td*rho*a_i/den
            q=np.minimum(q,np.maximum(0,w-0.10*Wmax)); w-=q; Ttot+=q.sum(); U+=q
        Itot+=irr;Dtot+=Dd;Ptot+=R
        if irr>0: irr_days.append(d+1)
        log.append((d+1,c,R,Tf,irr,Dd,w[jS]/Wmax,Rd,Etot-_E0,Ttot-_T0))
    return dict(S0=S0,S1=w.sum(),U=U,fT=fT,Wmax=Wmax,jS=jS,Rmax=Rmax,Rd=Rd,I=Itot,D=Dtot,E=Etot,T=Ttot,P=Ptot,irr_days=irr_days,log=log,Cbar=Cbar,mu0=mu0,Ic=Ic)
if __name__=='__main__':
    for s in ['S06','S03']:
        r=run(s);print(s,{k:(round(v,3) if isinstance(v,float) else v) for k,v in r.items() if k not in('log',)})
