import math,sys
sys.path.insert(0,'/tmp/book/gen')
import numpy as np
from lib import *
from surf import saxton
def vg_params(sid,thr=0.02):
    nm,a,n,awc,sa,si,cl=SOIL[sid];s=saxton(sa/100,cl/100,1.5)
    return dict(a=a,n=n,ths=s['ths'],thr=thr,Ks=s['Ks']*24/10.0,l=0.5)  # Ks cm/d
def theta(h,p):
    m=1-1/p['n'];Se=(1+(p['a']*np.abs(np.minimum(h,0)))**p['n'])**(-m)
    return p['thr']+(p['ths']-p['thr'])*Se
def Kf(h,p):
    m=1-1/p['n'];Se=(1+(p['a']*np.abs(np.minimum(h,0)))**p['n'])**(-m)
    return p['Ks']*Se**p['l']*(1-(1-Se**(1/m))**m)**2
def Cf(h,p):
    m=1-1/p['n'];hh=np.abs(np.minimum(h,-1e-6));ah=(p['a']*hh)**p['n']
    return (p['ths']-p['thr'])*m*p['n']*p['a']*(p['a']*hh)**(p['n']-1)*(1+ah)**(-m-1)
def solve(p,N=50,dz=2.0,h0=-300.0,flux=lambda t:0.0,tend=10.0,dtmax=0.05,dtmin=1e-4,tol=1e-3,out_times=()):
    h=np.full(N,h0);t=0.0;Qin=0.0;Qout=0.0;outs={}
    th0=theta(h,p).sum()*dz;it_tot=0;steps=0
    ot=sorted(out_times)
    while t<tend-1e-12:
        dt=min(dtmax,tend-t)
        for tt in ot:
            if t<tt<t+dt: dt=tt-t
        while True:
            hk=h.copy();thn=theta(h,p);conv=False
            for it in range(30):
                K=Kf(hk,p);Ki=0.5*(K[:-1]+K[1:])
                C=Cf(hk,p);thk=theta(hk,p)
                A=np.zeros((N,N));b=np.zeros(N)
                for i in range(N):
                    A[i,i]+=C[i]*dz/dt
                    b[i]+=C[i]*dz/dt*hk[i]-(thk[i]-thn[i])*dz/dt
                    if i>0:
                        A[i,i]+=Ki[i-1]/dz;A[i,i-1]-=Ki[i-1]/dz;b[i]-=Ki[i-1]
                    if i<N-1:
                        A[i,i]+=Ki[i]/dz;A[i,i+1]-=Ki[i]/dz;b[i]+=Ki[i]
                # top flux (downward, cm/d)
                q0=flux(t+dt);b[0]+=q0
                # bottom free drain q=K(h_N) 
                Kb=K[-1];b[-1]-=Kb
                hnew=np.linalg.solve(A,b)
                err=np.max(np.abs(hnew-hk));hk=hnew
                if err<tol: conv=True;break
            if conv: break
            dt/=2
            if dt<dtmin: conv=True;break
        h=hk;t+=dt;steps+=1;it_tot+=it+1
        Qin+=flux(t)*dt;Kb=Kf(h[-1:],p)[0];Qout+=Kb*dt
        for tt in ot:
            if abs(t-tt)<1e-9: outs[tt]=(h.copy(),Qin,Qout)
    th1=theta(h,p).sum()*dz
    return dict(h=h,Qin=Qin,Qout=Qout,dS=th1-th0,steps=steps,iters=it_tot,outs=outs)
if __name__=='__main__':
    p=vg_params('S06');print(p)
    r=solve(p,flux=lambda t:3.0 if t<=1.0 else 0.0,tend=10,out_times=(1,3,10))
    print(r['Qin'],r['Qout'],r['dS'],r['steps'],r['iters'])
    z=(np.arange(50)+0.5)*2
    for t,(h,qi,qo) in r['outs'].items(): print(t,[round(float(theta(h,p)[i]),3) for i in (2,7,15,25,40,49)],round(qi,3),round(qo,3))
