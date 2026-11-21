import math,numpy as np
ST={'impact':dict(l='Impact sprinkler',cR=1.35,m=1.3,F=1,dr=(2.4,8),pr=(200,500),d=4.4,P=300,Ss=12,Sl=18),
'spray':dict(l='Rotating spray',cR=.8,m='ring',F=1.6,dr=(1.5,5),pr=(70,250),d=3.2,P=170,Ss=6,Sl=6),
'micro':dict(l='Micro-sprinkler',cR=.7,m='ring2',F=.7,dr=(.8,2.5),pr=(100,250),d=1.3,P=180,Ss=3,Sl=3),
'gun':dict(l='Big gun',cR=.95,m=1.0,F=1.3,dr=(10,25),pr=(350,700),d=16,P=500,Ss=30,Sl=36)}
clamp=lambda v,a,b:max(a,min(b,v))
def phat(t,x):
    if x>=1:return 0.
    m=ST[t]['m']
    if m=='ring':return (.5+.5*x)*(1-x**6)
    if m=='ring2':return (.55+.45*x)*(1-x**5)
    return 1-x**m
def angF(a): return 1 if a is None else (max(.05,math.sin(3.1*a*math.pi/180))/.9763)**.45
def nozzle(t,d,P,alpha=25):
    h=P/9.81;A=math.pi*(d/2000)**2;q=.95*A*math.sqrt(2*9.81*h)*60000;R=ST[t]['cR']*math.sqrt(d*h)*angF(alpha);return q,R,h
def pattern(t,d,P,u,alpha=25):
    q,R,h=nozzle(t,d,P,alpha);ext=1.4*R;n=45;hh=2*ext/(n-1);sh=min(.03*u*R,R)
    xs=-ext+np.arange(n)*hh;X,Y=np.meshgrid(xs-sh,xs);r=np.hypot(X,Y);th=np.arctan2(Y,X)
    Re=R*np.clip(1+.022*u*np.cos(th),.7,1.4);g=np.vectorize(lambda rr,RR:phat(t,rr/RR))(r,Re)
    tot=g.sum()*hh*hh;g=g*q/tot;return dict(g=g,n=n,hh=hh,ext=ext,R=R,q=q)
def look(P,x,y):
    fx=(x+P['ext'])/P['hh'];fy=(y+P['ext'])/P['hh']
    if fx<0 or fy<0 or fx>=P['n']-1 or fy>=P['n']-1:return 0.
    i=int(fx);j=int(fy);ax=fx-i;ay=fy-j;g=P['g']
    return (g[j,i]*(1-ax)+g[j,i+1]*ax)*(1-ay)+(g[j+1,i]*(1-ax)+g[j+1,i+1]*ax)*ay
def field(t,d,P_,u,Ss,Sl,tri,alpha,nx=14,ny=None):
    ny=ny or (24 if tri else 14);P=pattern(t,d,P_,u,alpha);rows=2 if tri else 1
    ri=min(60,math.ceil(P['ext']/Ss)+1);rj=min(60,math.ceil(P['ext']/Sl)+1);cells=np.zeros((ny,nx))
    for b in range(ny):
        for a in range(nx):
            x=(a+.5)/nx*Ss;y=(b+.5)/ny*Sl*rows;s=0
            for j in range(-rj,rows+rj):
                off=Ss/2 if (tri and j%2) else 0
                for i in range(-ri,ri+2): s+=look(P,x-(i*Ss+off),y-j*Sl)
            cells[b,a]=s
    return cells,P
def WD(t,d,P,u,Tair,alpha=25):
    return clamp((1.2+.5*u+.04*u*u)*ST[t]['F']*(P/250)**.7*(1+.025*(Tair-20))*(0.6+.4*math.sin(alpha*math.pi/180)/.4226),.5,45)/100
def point(a,T,K,A,Sd):
    sup=a*T;F=sup
    if a>0:
        tp=(a/K)**(1/(A-1))
        if T>tp:F=K*T**A
    R=sup-F;ro=max(0,R-Sd);return sup-ro,ro,sup
def sprinkler(t,d,P,Ss,Sl,Zn,K,A,Sd=3.5,u=3,S=1,tri=False,alpha=25,Tair=24,T=None):
    cells,Pt=field(t,d,P,u,Ss,Sl,tri,alpha);mean=max(cells.mean(),1e-9);n=cells.size
    CU=1-abs(cells-mean).mean()/mean;wdel=WD(t,d,P,u,Tair,alpha);Sde=max(0,Sd)/(1+.25*S);Kk=K*1000
    q,R,h=nozzle(t,d,P,alpha);AR=mean*60
    def run(T):
        arr=np.zeros(n);ro_=0;sI=0
        for i,c in enumerate(cells.ravel()):
            a=c*(1-wdel);I,ro,sup=point(a,T,Kk,A,Sde);arr[i]=I;ro_+=ro;sI+=I
        srt=np.sort(arr);k=max(1,n//4);lq=srt[:k].mean()
        st=np.minimum(arr,Zn).sum()/n;ex=np.maximum(arr-Zn,0).sum()/n;gross=mean*T
        return dict(T=T,gross=gross,I=sI/n,ro=ro_/n,st=st,ex=ex,lq=lq,Ea=st/gross,Es=st/Zn,DU=lq/(sI/n) if sI>0 else 0,wd=wdel*gross,dpf=ex/gross,rof=ro_/n/gross,wdf=wdel)
    if T is None:
        lo,hi=1,2400
        for _ in range(18):
            m=(lo+hi)/2
            if run(m)['lq']<Zn:lo=m
            else:hi=m
        T=hi
    Rr=run(T);Rr.update(q=q,R=R,h=h,CU=CU,AR=AR,wdel=wdel);return Rr
