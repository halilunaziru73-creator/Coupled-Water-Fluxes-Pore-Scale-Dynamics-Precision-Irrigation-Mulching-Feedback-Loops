import math,numpy as np,matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.optimize import brentq
C=['#5E8C7F','#1B3B4B','#D9701E','#A8233A']
plt.rcParams.update({'font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.grid':True,'grid.alpha':.25,'figure.dpi':200})
F='/tmp/kh/fig/'
def save(n): plt.tight_layout();plt.savefig(F+n+'.png');plt.close()
def add(k,name,w,cap,part='proj'):
    p='/tmp/kh/extra/%s%02d.tex'%(part,k);s=open(p).read()
    if name in s: return
    open(p,'a').write('\n\\fig{%s}{%s}{%s}\n'%(name,w,cap))
# ch8: trigger comparison (season bucket)
rng=np.random.default_rng(5);days=125
ET0=(5.2+2.0*np.sin(np.linspace(0,math.pi,days))+rng.normal(0,0.5,days)).clip(1.5)
rain=np.where(rng.random(days)<0.12,rng.gamma(2.0,6.0,days),0.)
def kc(t):
    L1,L2,L3,L4=15,30,50,30;ki,km,ke=.3,1.2,.6
    if t<L1:return ki
    if t<L1+L2:return ki+(km-ki)*(t-L1)/L2
    if t<L1+L2+L3:return km
    return km+(ke-km)*min(1,(t-L1-L2-L3)/L4)
def run(tf,TAW=150.,p=.5):
    RAW=p*TAW;D=0;Ds=[];irr=0
    for i in range(days):
        Ks=1 if D<=RAW else max(0,(TAW-D)/(TAW-RAW));ea=Ks*kc(i)*ET0[i]
        D=D-rain[i]+ea
        if D<0:D=0
        if D>=tf*TAW: irr+=D;D=0
        Ds.append(D)
    return np.array(Ds),irr
fig,ax=plt.subplots(1,2,figsize=(10,3.8))
for tf,c in zip((0.3,0.5,0.8),C):
    D,irr=run(tf);ax[0].plot(D,color=c,label='trigger %.1f (%.0f mm)'%(tf,irr))
ax[0].axhline(75,color='k',ls='--',lw=.8);ax[0].text(2,79,'RAW = 75 mm',fontsize=9)
ax[0].set_xlabel('day of season');ax[0].set_ylabel('root-zone depletion $D$ (mm)');ax[0].legend(fontsize=9);ax[0].set_title('(a)',loc='left')
ax[1].bar(range(days),rain,color=C[1]);ax[1].set_xlabel('day of season');ax[1].set_ylabel('rainfall (mm)');ax[1].set_title('(b)',loc='left')
save('g8_bucket');add(8,'g8_bucket','0.95',r'Daily bucket for a 125-day maize season. (a) Depletion for three triggers, with the irrigation applied in brackets and the limit RAW. (b) The rainfall of the season.')
# ch9: evaporation by cover
t=np.linspace(0.2,30,300);a=3.5
fig,ax=plt.subplots(figsize=(6.5,4))
for (n,f,U),c in zip((('bare soil',0,9),('straw 3 t/ha',.4,8),('straw 6 t/ha',.6,7),('plastic film',.9,5)),C):
    t1=U/5;E=np.where(t<t1,5*t,U+a*(np.sqrt(t)-math.sqrt(t1)))*(1-f);ax.plot(t,E,color=c,label=n)
ax.set_xlabel('time after wetting (d)');ax.set_ylabel('cumulative evaporation $E$ (mm)');ax.legend()
save('g9_evap');add(9,'g9_evap','0.7',r'Cumulative evaporation after a wetting for four surface covers ($ET_0=5$ mm\,d$^{-1}$, $a=3.5$ mm\,d$^{-1/2}$).')
# ch10: WP vs CWSI
cult=[('G1',9.8,455,31.0),('G2',10.6,490,29.5),('G3',8.9,410,33.0),('G4',11.2,540,28.5),('G5',10.1,445,30.5)]
fig,ax=plt.subplots(1,2,figsize=(10,3.8))
for (n,y,et,T),c in zip(cult,C+[C[0]]):
    ax[0].scatter(et,y,s=70,color=C[3]);ax[0].annotate(n,(et,y),(4,4),textcoords='offset points')
    cw=(T-31)/7;ax[1].scatter(cw,y*1000/(et*10),s=70,color=C[1]);ax[1].annotate(n,(cw,y*1000/(et*10)),(4,4),textcoords='offset points')
ax[0].set_xlabel('seasonal evapotranspiration $ET_a$ (mm)');ax[0].set_ylabel('yield (Mg ha$^{-1}$)');ax[0].set_title('(a)',loc='left')
ax[1].set_xlabel('crop water stress index CWSI');ax[1].set_ylabel('water productivity (kg m$^{-3}$)');ax[1].set_title('(b)',loc='left')
save('g10_geno');add(10,'g10_geno','0.95',r'Five genotypes of the stress trial. (a) Yield against seasonal evapotranspiration. (b) Water productivity against the crop water stress index.')
# ch11: advance curves
k_,a_,f0=0.0040,0.55,0.0001;L=250.;r=.6
def adv_t(Q,x):
    A0=.010;sy=.77*A0;sz=(a_+r*(1-a_)+1)/((1+a_)*(1+r))
    g=lambda t:Q*60/1000*t-sy*x-(sz*k_*t**a_+f0*t*.5)*x
    return brentq(g,.5,8000)
fig,ax=plt.subplots(figsize=(6.5,4))
xs=np.linspace(10,L,25)
for q,c in zip((0.9,1.2,1.6,2.0),C): ax.plot([adv_t(q,x) for x in xs],xs,color=c,label='$q_0$ = %.1f L/s'%q)
ax.set_xlabel('advance time (min)');ax.set_ylabel('distance along furrow (m)');ax.legend()
save('g11_adv');add(11,'g11_adv','0.7',r'Advance of the water front along a 250-m furrow for four inflows, from the volume balance.')
# ch12: lateral pressure profile
def hw(Q,C_,D,L):
    Q/=1000;D/=1000;return 10.67*L*Q**1.852/(C_**1.852*D**4.871)
fig,ax=plt.subplots(1,2,figsize=(10,3.8));x=np.linspace(0,100,101)
for D,c in zip((14,16,18,20),C):
    Hs=[];qs=[]
    for xi in x:
        n=int((100-xi)/.5);Q=n*1.6/3600
        h=10-hw(Q,150,D,100)*0+0  # base
    # head profile: integrate loss
    H=[10.0]
    for i in range(1,len(x)):
        xi=x[i-1];n=int((100-xi)/.5);Q=n*1.6/3600;H.append(H[-1]-hw(Q,150,D,1.0))
    H=np.array(H);ax[0].plot(x,H,color=c,label='D = %d mm'%D);ax[1].plot(x,1.6*(H/10)**.5,color=c)
ax[0].set_xlabel('distance from inlet (m)');ax[0].set_ylabel('pressure head (m)');ax[0].legend(fontsize=9);ax[0].set_title('(a)',loc='left')
ax[1].set_xlabel('distance from inlet (m)');ax[1].set_ylabel('emitter discharge (L h$^{-1}$)');ax[1].set_title('(b)',loc='left')
save('g12_lat');add(12,'g12_lat','0.95',r'A 100-m drip lateral with 200 emitters. (a) Pressure head along the lateral for four diameters. (b) The resulting emitter discharge.')
# ch13: application pattern & CU
fig,ax=plt.subplots(figsize=(6.5,4));xx=np.linspace(0,1,100)
ax.plot(xx*14,1-xx**1.3,color=C[1],label='impact');ax.plot(xx*14,(.5+.5*xx)*(1-xx**6),color=C[2],label='rotating spray');ax.plot(xx*14,(.55+.45*xx)*(1-xx**5),color=C[3],label='micro-sprinkler')
ax.set_xlabel('distance from the sprinkler (m), $R=14$ m');ax.set_ylabel('relative application rate $\\hat p$');ax.legend()
save('g13_pat');add(13,'g13_pat','0.7',r'Radial application patterns of three sprinkler types, scaled to a wetted radius of 14 m.')
# ch14: water table profile
fig,ax=plt.subplots(figsize=(6.5,4));L=21;h=.5
xx=np.linspace(-L/2,L/2,100);ax.plot(xx,h*(1-(2*xx/L)**2)**1,color=C[1],label='water table')
ax.axhline(0,color=C[2],ls='--',label='drain level');ax.scatter([-L/2,L/2],[0,0],s=60,color=C[3],label='drains',zorder=3)
ax.set_xlabel('distance between drains (m), $L=21$ m');ax.set_ylabel('height above drain level (m)');ax.legend()
save('g14_wt');add(14,'g14_wt','0.7',r'Steady water table midway between two drains of spacing $L=21$ m (schematic elliptical shape, $h=0.5$ m).')
print('figs ok')
