# 1-D Richards, h-based modified Picard (Celia et al. 1990), finite volume, implicit Euler, free drainage bottom, ponded top (h=0)
import numpy as np
from vg import *
def run(a,n,ths,thr,Ks,L=100.,N=100,h0=-1000.,T=1.0,dt=1e-3,tol=1e-6):
    # head psi=-h (cm, negative), time in days
    m=1-1/n; dz=L/N; z=(np.arange(N)+.5)*dz
    def th(psi): 
        out=np.where(psi<0,thr+(ths-thr)*(1+(a*np.abs(psi))**n)**(-m),ths);return out
    def K(psi):
        s=np.where(psi<0,(1+(a*np.abs(psi))**n)**(-m),1.0); return Ks*s**.5*(1-(1-s**(1/m))**m)**2
    def C(psi):
        ap=a*np.abs(psi); s=(1+ap**n)**(-m)
        return np.where(psi<0,(ths-thr)*a*m*n*ap**(n-1)*(1+ap**n)**(-m-1),1e-9)
    psi=np.full(N,h0); t=0.; prof={}
    out_times=[0.05,0.1,0.25,0.5]
    stored=[]
    while t<T-1e-12:
        d=min(dt,T-t); pn=psi.copy(); thn=th(psi); 
        for it in range(50):
            Kc=K(pn); Kf=np.sqrt(Kc[:-1]*Kc[1:])  # geometric mean between cells
            Kf=np.concatenate([[K(np.array([0.0]))[0]],Kf])  # top face at saturation (ponded)
            # build tridiagonal system: C*(dpsi)/dt*dz = flux in - flux out
            A=np.zeros((N,N)); b=np.zeros(N)
            Cn=C(pn)
            for i in range(N):
                top = 0 if i>0 else 1
                if i==0:
                    # flux from top boundary: q = Ktop*((0-psi_0)/(dz/2)+1)
                    ktop=Kf[0]; gtop=ktop/(dz/2)
                    A[i,i]+= gtop; b[i]+= gtop*0 + ktop
                else:
                    g=Kf[i]/dz; A[i,i]+=g; A[i,i-1]-=g; b[i]+=Kf[i]
                if i<N-1:
                    g=Kf[i+1]/dz; A[i,i]+=g; A[i,i+1]-=g; b[i]-=Kf[i+1]
                else:
                    b[i]-=K(pn[i:i+1])[0]  # free drainage gravity flux out
            # (Cn*dz/d)*(psi_new-pn)+ (th(pn)-thn)*dz/d + A psi_new = b ; modified Picard
            M=A+np.diag(Cn*dz/d)
            rhs=b+Cn*dz/d*pn-(th(pn)-thn)*dz/d
            pnew=np.linalg.solve(M,rhs)
            err=np.max(np.abs(pnew-pn)); pn=pnew
            if err<tol: break
        psi=pn; t+=d
        for ot in out_times:
            if abs(t-ot)<d/2 and ot not in prof: prof[ot]=(z.copy(),th(psi).copy(),psi.copy())
    return prof
if __name__=='__main__':
    import json
    res={}
    for name,(a,n,ths,thr,Ks) in {'sand':(0.145,2.68,0.43,0.045,712.8),'loam':(0.036,1.56,0.43,0.078,24.96)}.items():
        T=0.5 if name=='sand' else 1.0
        p=run(a,n,ths,thr,Ks,T=T,dt=2e-4 if name=='sand' else 5e-4)
        res[name]={str(k):[v[0].tolist(),v[1].tolist()] for k,v in p.items()}
        print(name,list(p.keys()))
    json.dump(res,open('rich.json','w'))
