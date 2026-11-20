from sprk import *
sp=soilpar('S06',0.468);K=sp['k']*1000;A=sp['A']
Sd=sdeff(5,1);print('Sdeff',Sd)
def run(typ,d,P,al,u,Ss,Sl,tri,Zn,K=K,A=A,Sd=Sd,Iint=3.0,Ta=24):
    q=qnoz(d,P);R=Rwet(typ,d,P,al);a=overlap(typ,R,q,u,Ss,Sl,tri)
    wd=wdrift(typ,u,P,Ta,al);T=autoT(a,wd,K,A,Sd,Iint,Zn);e=effs(a,wd,K,A,Sd,Iint,T,Zn)
    CU=1-np.abs(a-a.mean()).sum()/a.size/a.mean()
    return dict(q=q,R=R,AR=60*a.mean(),CU=CU,wd=wd,T=T,**e)
for u in (0,3,6,9):
    r=run('Impact',4.4,300,25,u,12,18,False,30);print(u,{k:round(v,3) for k,v in r.items() if k not in('Zk',)})
for t,v in TYPES.items():
    r=run(t,v['d'],v['P'],25,3,v['Ss'],v['Sl'],False,30);print(t,{k:round(x,3) for k,x in r.items() if k!='Zk'})
