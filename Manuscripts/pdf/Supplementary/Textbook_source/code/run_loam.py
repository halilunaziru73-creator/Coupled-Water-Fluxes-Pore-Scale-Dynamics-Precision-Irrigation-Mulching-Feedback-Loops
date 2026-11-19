import numpy as np, json
import richards as R
a,n,ths,thr,Ks=0.036,1.56,0.43,0.078,24.96
p=R.run(a,n,ths,thr,Ks,L=100.,N=200,T=0.5,dt=2e-4)
out={}
for t,(z,th,psi) in sorted(p.items()):
    th0=th[-1];dz=100/200
    I=float(np.sum(th-th0)*dz);mid=(th.max()+th0)/2;front=float(z[np.where(th<mid)[0][0]])
    out[str(t)]=dict(I=I,front=front,z=z.tolist(),th=th.tolist(),th0=float(th0))
    print(t,round(I,2),front,'Ks t',round(Ks*t,2))
json.dump(out,open('loam.json','w'))
