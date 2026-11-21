import math
def clamp(v,a,b): return max(a,min(b,v))
DK={'online':dict(l='Online emitter',cv=.07,x=.5,ne=1,Hmin=0,q=4,Se=.75,D=16),'inline':dict(l='Inline emitter',cv=.04,x=.5,ne=1,Hmin=0,q=2,Se=.5,D=16),
'tape':dict(l='Drip tape',cv=.08,x=.6,ne=2,Hmin=0,q=1,Se=.2,D=16),'pcas':dict(l='PC AS dripper',cv=.03,x=0,ne=1,Hmin=5.1,q=2,Se=.5,D=13.7),
'pclc':dict(l='PC LCNL dripper',cv=.03,x=0,ne=1,Hmin=10.2,q=2,Se=.5,D=13.7),'pchc':dict(l='PC HCNL dripper',cv=.03,x=0,ne=1,Hmin=14.3,q=3,Se=.5,D=13.7)}
def latprofile(kind,q,Se,LL,H0,D):
    k=DK[kind];N=max(2,round(LL/Se));C=140;Dm=D/1000
    qj=[q]*(N+1);hj=[H0]*(N+1)
    def flow(j):
        hh=hj[j];r=hh/H0
        if k['Hmin']: return q*(1+0.04*(hh-H0)/H0) if hh>=k['Hmin'] else q*max(hh,0.1)/k['Hmin']**1 if False else (q*(1+0.04*(hh-H0)/H0) if hh>=k['Hmin'] else q*(max(hh,.1)/k['Hmin'])**.5)
        return q*max(r,.01)**k['x']
    for it in range(500):
        down=[0]*(N+2)
        for j in range(N,-1,-1): down[j]=down[j+1]+qj[j]
        h=H0
        for j in range(N+1):
            hj[j]=max(h,.5);Qs=down[j+1]/3.6e6;h-=10.67*Se*Qs**1.852/(C**1.852*Dm**4.871)
        dmax=0
        for j in range(N+1):
            qn=flow(j);nv=qn if it<4 else .5*(qj[j]+qn);dmax=max(dmax,abs(nv-qj[j])/q);qj[j]=nv
        if it>=3 and dmax<1e-7:break
    qa=sum(qj)/(N+1);mn=min(qj);sdP=math.sqrt(sum((x/qa-1)**2 for x in qj)/(N+1))
    Eu=clamp((1-1.27*k['cv']/math.sqrt(k['ne']))*(mn/qa),.3,1)
    return dict(N=N,qa=qa,qmin=mn,hf=H0-hj[N],Hend=hj[N],Eu=Eu,sd=math.sqrt(k['cv']**2+sdP**2),hfFrac=(H0-hj[N])/H0,Q=N*qa/3600,qj=qj,hj=hj)
def shape(r,a,zd,u):
    def f(z):
        if z<0:return 0
        dz=(z-zd)/(a*r) if z>=zd else (zd-z)/(u*r)
        return 0 if dz>=1 else r*math.sqrt(1-dz*dz)
    return f
def bulbint(r,a,zd,u,Rm,two):
    f=shape(r,a,zd,u);z0=max(0,zd-u*r);z1=zd+a*r;n=56;dz=(z1-z0)/n;vol=below=0
    for i in range(n):
        z=z0+(i+.5)*dz;rho=f(z);w=2*rho*dz if two else math.pi*rho*rho*dz;vol+=w
        if z>Rm:below+=w
    return dict(vol=vol,below=below,rs=f(.001),z1=z1)
def solveR(Vw,a,zd,u,Rm,two):
    lo,hi=5,3500
    for i in range(38):
        m=(lo+hi)/2
        if bulbint(m,a,zd,u,Rm,two)['vol']<Vw:lo=m
        else:hi=m
    return (lo+hi)/2
def bulb(V,c):
    dth=c['dth'];two=c['Se']<.34 or c.get('two',False)
    Vw=V*1e6/(c['Se']*1000)/dth if two else V*1e6/dth
    r=solveR(Vw,c['a'],c['zd'],.6,c['Rm'],two);B=bulbint(r,c['a'],c['zd'],.6,c['Rm'],two)
    if (not two) and 2*r>c['Se']*1000 and c['Se']<1.2:
        r=solveR(V*1e6/(c['Se']*1000)/dth,c['a'],c['zd'],.6,c['Rm'],True);B=bulbint(r,c['a'],c['zd'],.6,c['Rm'],True);two=True
        area=2*B['rs']/1000*c['Se'] if B['rs']>0 else 0
    else: area=math.pi*B['rs']**2/1e6 if B['rs']>0 else 0
    below=V*B['below']/B['vol'];ev=min(.5*V,area*c['E0']*2)
    return dict(r=r,zb=c['zd']+c['a']*r,below=below,ev=ev,rs=B['rs'],two=two)
QZ=[-1.28,-.52,0,.52,1.28]
def drip(kind,q,Se,Sl,LL,H0,D,Zn,ks,psi,fc,wp,fT,dep,Rmax,E0,t=None):
    K=DK[kind];lat=latprofile(kind,q,Se,LL,H0,D);Ae=Se*Sl;Vreq=Zn*Ae
    aspect=clamp((.7+1.6*(ks/(ks+15))**1.1)*math.sqrt(clamp(2/max(.5,q),.7,1.4)),.75,2.4)
    c=dict(dth=max(.03,fT*(fc-wp)),a=aspect,zd=dep*10,Rm=Rmax*10,Se=Se,E0=E0)
    if t is None: t=clamp(Vreq/(lat['qa']*lat['Eu']),.05,96)
    V=lat['qa']*t;quant=[]
    for z in QZ:
        Vi=max(.02*V,V*(1+lat['sd']*z));b=bulb(Vi,c);root=Vi-b['below']-b['ev'];st=min(root,Vreq);b.update(V=Vi,stored=st,excess=root-st);quant.append(b)
    m=lambda f:sum(f(x) for x in quant)/len(quant);Vm=m(lambda x:x['V'])
    return dict(t=t,V=V,Ea=m(lambda x:x['stored'])/Vm,Es=m(lambda x:x['stored'])/Vreq,dp=m(lambda x:x['below']+x['excess'])/Vm,ev=m(lambda x:x['ev'])/Vm,b=quant[2],lat=lat,Ae=Ae,Vreq=Vreq,aspect=aspect,Eu=lat['Eu'],gross=V/Ae)
