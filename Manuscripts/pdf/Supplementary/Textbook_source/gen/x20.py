import sys,math
sys.path.insert(0,'/tmp/kh/gen')
from h import *
from lib import SOIL,Se,Kr,fdep,hof
from scipy.optimize import brentq
IDS=sorted(SOIL)
V=dict(trig=.5,seed=5,E0=5.0,Z=60,q=2.0,noz=(4.8,350),q14=.007,h14=.5,i=14.0)
# typical class values (Rawls et al. 1983): Ks mm/h, wetting-front suction mm, drainable porosity, hydrologic group
PR={'S01':(13,110,.34,'B'),'S02':(120,49,.38,'A'),'S03':(210,49,.38,'A'),'S04':(61,61,.37,'A'),'S05':(26,110,.35,'B'),
'S06':(13,89,.32,'B'),'S07':(6.8,170,.35,'C'),'S08':(4.3,219,.30,'C'),'S09':(2.3,209,.31,'D'),'S10':(1.5,273,.30,'D')}
CN={'A':65,'B':75,'C':82,'D':87}
def nm(s): return SOIL[s][0]
def taw(s,zr=60): return SOIL[s][3]*zr          # mm
def reach(s,kap=3.5e-10,l=.5):
    a,n=SOIL[s][1],SOIL[s][2];m=1-1/n;E=2*n+l*(n-1);return (1/a)*(m*m/kap)**(1/E),E
def gat(s,i):  # Green-Ampt ponding time (h) for rate i mm/h
    Ks,psi,dth,_=PR[s]
    return Ks*psi*dth/(i*(i-Ks)) if i>Ks else None
def ga_time(s,Z):  # hours to infiltrate Z mm, Green-Ampt
    Ks,psi,dth,_=PR[s];c=psi*dth
    f=lambda t:Z-c*math.log(1+Z/c)-Ks*t   # implicit F - c ln(1+F/c)=Ks t
    return (Z-c*math.log(1+Z/c))/Ks
def ssoil(s,stg,days=125,p=.5,trig=.5,Ky=1.28,seed=5):
    rng=np.random.default_rng(seed);ET0=(5.2+2.0*np.sin(np.linspace(0,math.pi,days))+rng.normal(0,.5,days)).clip(1.5)
    rain=np.where(rng.random(days)<.12,rng.gamma(2.0,6.0,days),0.)
    TAW=taw(s);RAW=p*TAW;D=0;I=0;dr=0;eta=0;etc=0;n=0
    def kc(t):
        L1,L2,L3,L4=15,30,50,30
        return .3 if t<L1 else .3+.9*(t-L1)/L2 if t<L1+L2 else 1.2 if t<L1+L2+L3 else 1.2-.6*min(1,(t-L1-L2-L3)/L4)
    for i in range(days):
        Ks=1 if D<=RAW else max(0,(TAW-D)/(TAW-RAW));e=Ks*kc(i)*ET0[i];etc+=kc(i)*ET0[i];eta+=e
        D=D-rain[i]+e
        if D<0: dr+=-D;D=0
        if stg and D>=trig*TAW: I+=D;n+=1;D=0
    return dict(P=rain.sum(),I=I,ET=eta,ETc=etc,D=dr,n=n,dS=-D,Y=1-Ky*(1-eta/etc),ET0=ET0.sum())
def soilblock(k,title,fn,intro=''):
    s=''
    if intro: s+=P(intro)
    for i,sid in enumerate(IDS):
        stmt,sol=fn(sid);s+=ex(stmt,sol,'%s: %s (%s)'%(title,nm(sid),sid))
    return s
D=lambda s,**k:ssoil(s,True,trig=V['trig'],seed=V['seed'],**k)
gens={}
# ---- 1
def f1(s):
    a,n=SOIL[s][1],SOIL[s][2];m=1-1/n;fc=Se(a,n,100);wp=Se(a,n,15849);h5=hof(a,n,.5)
    return (r"%s (S%s): $\alpha=%.4f$ cm$^{-1}$, $n=%.3f$, AWC $=%.1f$ mm\,cm$^{-1}$. Find $m$, $S_e$ at field capacity ($h=100$ cm) and wilting point ($h=15\,849$ cm), the suction at half depletion, and TAW, RAW ($p=0.5$) and the days of supply at $ET_c=5$ mm\,d$^{-1}$ for a root zone of 0.6 m."%(nm(s),s[1:],a,n,SOIL[s][3]),
     r"$m=1-1/%.3f=%.3f$ \ans $S_e(100)=[1+(%.4f\times100)^{%.3f}]^{-%.3f}=%.3f$; $S_e(15\,849)=%.4f$ \ans Half depletion is $f=0.5$, found by bisection of Eq.~(\ref{eq:fdep}): $h_{0.5}=%.0f$ cm \ans $TAW=%.1f\times600/10\ldots=%.0f$ mm, i.e.\ $%.2f\times60$ cm; $RAW=0.5\times%.0f=%.0f$ mm \ans Supply: $RAW/ET_c=%.0f/5=%.1f$ days \ans"%(n,m,a,n,m,fc,wp,h5,SOIL[s][3],taw(s),SOIL[s][3],taw(s),taw(s)/2,taw(s)/2,taw(s)/10))
# ---- 2
def f2(s):
    a,n=SOIL[s][1],SOIL[s][2];Ks=PR[s][0]*24/10
    K1=Ks*Kr(a,n,100);K3=Ks*Kr(a,n,300);K10=Ks*Kr(a,n,1000)
    return (r"%s: $K_s=%.1f$ cm\,d$^{-1}$ (typical for the class), $\alpha=%.4f$, $n=%.3f$. Find $K(h)$ at 100, 300 and 1000 cm suction and the steady upward flux between $h=300$ cm at 0.4 m and $h=100$ cm at 0 m, using Darcy's law $q=K(\Delta h/\Delta z-1)$ with the geometric mean of $K$."%(nm(s),Ks,a,n),
     r"$K_r(100)=%.3g$, $K_r(300)=%.3g$, $K_r(1000)=%.3g$ \ans $K=%.3g$, $%.3g$, $%.3g$ cm\,d$^{-1}$ \ans Geometric mean of the two ends: $\bar K=\sqrt{%.3g\times%.3g}=%.3g$ cm\,d$^{-1}$ \ans Gradient: $\Delta h/\Delta z=(300-100)/40=5.0$, so $q=%.3g\times(5.0-1)=%.3g$ cm\,d$^{-1}$ \ans The flux is %s."%(Kr(a,n,100),Kr(a,n,300),Kr(a,n,1000),K1,K3,K10,K1,K3,math.sqrt(K1*K3),math.sqrt(K1*K3),math.sqrt(K1*K3)*4,'enough to matter for a crop' if math.sqrt(K1*K3)*4>.1 else 'negligible against the demand of a crop (0.5 cm per day)'))
# ---- 3
def f3(s):
    a,n=SOIL[s][1],SOIL[s][2];m=1-1/n;hc,E=reach(s);r=taw(s)*.5/5
    return (r"%s: $\alpha=%.4f$ cm$^{-1}$, $n=%.3f$, $\ell=0.5$, $\kappa=3.5\times10^{-10}$. Compute the exponent $E$, the reach $h_c$ and the product $\alpha h_c$, and say whether a trigger at $h_T=300$ cm can fire."%(nm(s),a,n),
     r"$m=%.3f$; $E=2n+\ell(n-1)=2(%.3f)+0.5(%.3f)=%.3f$ \ans $m^2/\kappa=%.3f/(3.5\times10^{-10})=%.3g$ \ans $h_c=\frac{1}{%.4f}(%.3g)^{1/%.3f}=%.0f$ cm \ans $\alpha h_c=%.0f$ \ans A trigger of 300 cm is %s the reach of %.0f cm: %s \ans"%(m,n,n-1,E,m*m,m*m/3.5e-10,a,m*m/3.5e-10,E,hc,a*hc,'below' if 300<hc else 'beyond',hc,'it can fire and irrigation will follow' if 300<hc else 'the soil cannot supply the demand before it, so the crop stresses first'))
# ---- 4
def f4(s):
    r=D(s)
    return (r"%s: run the 125-day maize season (seeded weather, $P=%.0f$ mm, $\Sigma ET_0=%.0f$ mm) on a root zone of 0.6 m ($TAW=%.0f$ mm), irrigating the whole depletion when it reaches %.0f per cent of TAW. Audit the balance."%(nm(s),r['P'],r['ET0'],taw(s),100*V['trig']),
     r"The bucket gives $ET_a=%.0f$ mm, $I=%.0f$ mm in %d events, drainage $D=%.0f$ mm \ans Balance: $P+I=%.0f+%.0f=%.0f$ mm; $ET+D=%.0f+%.0f=%.0f$ mm \ans Storage change $\Delta S=%.0f$ mm; residual $=%.1f$ mm \ans The closure is %s (limit $\pm1$ mm)."%(r['ET'],r['I'],r['n'],r['D'],r['P'],r['I'],r['P']+r['I'],r['ET'],r['D'],r['ET']+r['D'],r['dS'],r['P']+r['I']-r['ET']-r['D']-r['dS'],'satisfied' ))
# ---- 5
def f5(s):
    r=D(s);rr=ssoil(s,False,seed=V['seed'])
    return (r"%s: with $K_y=1.28$, $Y_m=11.5$ Mg\,ha$^{-1}$, compare the irrigated and rainfed seasons (125 d, $TAW=%.0f$ mm) and give the yield, the water productivity and the irrigation water productivity."%(nm(s),taw(s)),
     r"Irrigated: $ET_a/ET_c=%.0f/%.0f=%.3f$, $Y=11.5\,[1-1.28(1-%.3f)]=%.2f$ Mg\,ha$^{-1}$ \ans Rainfed: $ET_a/ET_c=%.3f$, $Y=%.2f$ \ans $WP=Y/ET_a=%.2f$ kg\,m$^{-3}$ (irrigated) \ans Gain $%.2f$ Mg\,ha$^{-1}$ for %.0f mm of irrigation: $IWP=%.2f$ kg\,m$^{-3}$ \ans"%(r['ET'],r['ETc'],r['ET']/r['ETc'],r['ET']/r['ETc'],11.5*r['Y'],rr['ET']/rr['ETc'],11.5*rr['Y'],11.5*r['Y']*100/r['ET']/10,11.5*(r['Y']-rr['Y']),r['I'],11.5*(r['Y']-rr['Y'])*100/max(r['I'],1)/10))
# ---- 6
def f6(s):
    Ks,psi,dth,g=PR[s];i=V['i'];tp=gat(s,i)
    return (r"%s: a sprinkler system applies $i=%.0f$ mm\,h$^{-1}$. With $K_s=%.1f$ mm\,h$^{-1}$, $\psi_f=%.0f$ mm and $\Delta\theta=%.2f$ (class values), find whether ponding occurs, the time of ponding and the cumulative infiltration at that time (Green--Ampt)."%(nm(s),i,Ks,psi,dth),
     (r"Since $i=%.0f>K_s=%.1f$, ponding occurs. $t_p=K_s\psi_f\Delta\theta/[i(i-K_s)]=%.1f\times%.0f\times%.2f/[%.0f\times%.1f]=%.2f$ h \ans $F_p=i\,t_p=%.0f\times%.2f=%.1f$ mm \ans After ponding the surplus runs off or must be stored; the rate should be lowered or the set shortened."%(i,Ks,Ks,psi,dth,i,i-Ks,tp,i,tp,i*tp) if tp else r"Since $i=%.0f\le K_s=%.1f$ mm\,h$^{-1}$ the soil takes all the water at the surface: no ponding at any time \ans The limit is the nozzle, not the soil; the system can be run for any set time without runoff \ans"%(i,Ks)))
# ---- 7
def f7(s):
    TAW=taw(s);RAW=TAW/2;T=max(1,math.floor(RAW/6.5));d=T*6.5/0.8;Q=10*40*(T*6.5)/(0.75*T*20)
    return (r"%s: size the irrigation interval and system capacity of a 40-ha maize farm at peak $ET_c=6.5$ mm\,d$^{-1}$, root zone 0.6 m, $p=0.5$, $E_a=0.75$, working 20 h per day."%nm(s),
     r"$TAW=%.0f$ mm, $RAW=%.0f$ mm \ans Interval $T=\lfloor RAW/ET_c\rfloor=\lfloor%.1f\rfloor=%d$ d \ans Net depth $T\,ET_c=%.1f$ mm; gross $=%.1f/0.75=%.1f$ mm \ans Capacity $Q=10Ad/(E_aTh)=10\times40\times%.1f/(0.75\times%d\times20)=%.0f$ m$^3$\,h$^{-1}$ ($%.0f$ L\,s$^{-1}$) \ans"%(TAW,RAW,RAW/6.5,T,T*6.5,T*6.5,T*6.5/.75,T*6.5,T,Q,Q/3.6))
# ---- 8
def f8(s):
    CNs=CN[PR[s][3]];S=25400/CNs-254;Ia=.2*S;Q=(60-Ia)**2/(60-Ia+S) if 60>Ia else 0
    r=D(s)
    return (r"%s (hydrologic group %s, $CN=%d$): a storm of 60 mm falls on the soil. Find the runoff, the effective rainfall and the share that fills the bucket of $TAW=%.0f$ mm if the profile was at 50 per cent depletion."%(nm(s),PR[s][3],CNs,taw(s)),
     r"$S=25\,400/%d-254=%.1f$ mm; $I_a=0.2S=%.1f$ mm \ans $Q=(60-%.1f)^2/(60-%.1f+%.1f)=%.1f$ mm \ans Effective rain $60-%.1f=%.1f$ mm \ans The bucket holds $RAW=%.0f$ mm of room, so %s: drainage %.1f mm \ans"%(CNs,S,Ia,Ia,Ia,S,Q,Q,60-Q,taw(s)/2,'it absorbs all' if 60-Q<=taw(s)/2 else 'it overfills',max(0,60-Q-taw(s)/2)))
# ---- 9
def f9(s):
    U={'A':6,'B':9,'C':10,'D':12}[PR[s][3]];a={'A':3.0,'B':3.5,'C':4.0,'D':4.5}[PR[s][3]];E0=V['E0'];t1=U/E0
    Eb=U+a*(math.sqrt(30)-math.sqrt(t1));Es=Eb*.4
    return (r"%s (class %s: $U=%d$ mm, $a=%.1f$ mm\,d$^{-1/2}$ assumed): find the stage-one duration and the thirty-day evaporation after a wetting, bare and under straw at 6 t\,ha$^{-1}$ ($f_c=0.6$), at $ET_0=%.1f$ mm\,d$^{-1}$."%(nm(s),PR[s][3],U,a,E0),
     r"$t_1=U/ET_0=%d/%.1f=%.1f$ d \ans Bare: $E_{30}=U+a(\sqrt{30}-\sqrt{t_1})=%d+%.1f(%.3f-%.3f)=%.1f$ mm \ans Under straw: $(1-0.6)\times%.1f=%.1f$ mm \ans Saving %.1f mm (%.0f per cent) \ans"%(U,E0,t1,U,a,math.sqrt(30),math.sqrt(t1),Eb,Eb,Es,Eb-Es,100*(Eb-Es)/Eb))
# ---- 10
def f10(s):
    r=D(s);y=11.5*r['Y']
    return (r"%s: genotype G4 with $Y_m=11.5$ Mg\,ha$^{-1}$, $K_y=1.28$ is grown in the 125-day season on $TAW=%.0f$ mm. Find the relative yield, the yield, the water productivity and the biomass if the harvest index is 0.43."%(nm(s),taw(s)),
     r"$ET_a/ET_c=%.0f/%.0f=%.3f$; $Y/Y_m=1-1.28(1-%.3f)=%.3f$ \ans $Y=%.2f$ Mg\,ha$^{-1}$ \ans $WP=%.2f$ kg\,m$^{-3}$ \ans Biomass $B=Y/HI=%.2f/0.43=%.1f$ Mg\,ha$^{-1}$ \ans"%(r['ET'],r['ETc'],r['ET']/r['ETc'],r['ET']/r['ETc'],r['Y'],y,y*100/r['ET']/10,y,y/.43))
# ---- 11
def f11(s):
    Ks,psi,dth,g=PR[s];Z=V['Z'];t=ga_time(s,Z)
    return (r"%s: furrow irrigation must infiltrate a net depth $Z=%d$ mm. With Green--Ampt ($K_s=%.1f$ mm\,h$^{-1}$, $\psi_f=%.0f$ mm, $\Delta\theta=%.2f$) find the required opportunity time and judge whether the soil suits furrows."%(nm(s),Z,Ks,psi,dth),
     r"$c=\psi_f\Delta\theta=%.0f\times%.2f=%.1f$ mm \ans $F-c\ln(1+F/c)=K_st$ with $F=%d$: $%d-%.1f\ln(1+%d/%.1f)=%.2f$ mm \ans $t=%.2f/%.1f=%.2f$ h ($%.0f$ min) \ans %s \ans"%(psi,dth,psi*dth,Z,Z,psi*dth,Z,psi*dth,Z-psi*dth*math.log(1+Z/(psi*dth)),Z-psi*dth*math.log(1+Z/(psi*dth)),Ks,t,t*60,'With a short opportunity time the furrow must be short or the flow large, or a basin used; the intake is high.' if t<2 else 'The opportunity time is long: furrows of moderate length with a small stream are suitable.'))
# ---- 12
def f12(s):
    Ks=PR[s][0]*24/10;q=V['q']
    a=min(2.4,max(.75,(0.7+1.6*(Ks/(Ks+15))**1.1)*math.sqrt(min(1.4,max(.7,2/q)))))
    Se_=min(1.5,1.6*a) # emitter spacing for 80% overlap
    return (r"%s ($K_s=%.1f$ cm\,d$^{-1}$): an emitter delivers $q=%.1f$ L\,h$^{-1}$. Find the wetted radius from the empirical relation of the application, the emitter spacing that overlaps the bulbs, and the number of emitters per hectare at a lateral spacing of 1.5 m."%(nm(s),Ks,q),
     r"$K_s/(K_s+15)=%.3f$; $0.7+1.6\times%.3f^{1.1}=%.3f$ \ans $\sqrt{\mathrm{clip}(2/q)}=%.3f$, so $a=%.2f$ m (limits 0.75 to 2.4 m) \ans Spacing for overlap $S_e=1.6a=%.2f$ m, taken as %.2f m \ans Emitters per hectare: $10^4/(1.5\times%.2f)=%.0f$ \ans"%(Ks/(Ks+15),Ks/(Ks+15),.7+1.6*(Ks/(Ks+15))**1.1,math.sqrt(min(1.4,max(.7,2/q))),a,1.6*a,Se_,Se_,1e4/(1.5*Se_)))
# ---- 13
def f13(s):
    Ks=PR[s][0];d,Pk=V['noz'];q=.95*math.pi*(d/2000)**2*math.sqrt(2*9.81*Pk/9.81)*6e4  # P kPa -> h=P/9.81 m
    q=.95*math.pi*(d/2000)**2*math.sqrt(2*9.81*(Pk/9.81))*6e4
    rate=q*60/(12*18)  # mm/h
    tp=gat(s,rate)
    return (r"%s ($K_s=%.1f$ mm\,h$^{-1}$): a %.1f-mm nozzle at %d kPa works on a $12\times18$ m spacing. Find the discharge, the application rate and whether runoff will occur."%(nm(s),Ks,d,Pk),
     r"$h=350/9.81=%.1f$ m; $q=0.95\pi(%.1f/2000)^2\sqrt{2\times9.81\times%.1f}\times6\times10^4=%.1f$ L\,min$^{-1}$ \ans $r=q\times60/(S_lS_m)=%.1f\times60/216=%.1f$ mm\,h$^{-1}$ \ans %s \ans"%(Pk/9.81,Pk/9.81,d,q,q,rate,(r"The rate exceeds $K_s$: ponding after $%.1f$ h; sets longer than that run off, so use a smaller nozzle or a wider spacing."%tp if tp else r"The rate is below $K_s$, so no runoff.")))
# ---- 14
def f14(s):
    K2=PR[s][0]*24/1000;K1=1.2*K2;h=V['h14'];q=V['q14'];d=3.0
    L=brentq(lambda L:(8*K2*d*h+4*K1*h*h)/L**2-q,1,800)
    return (r"%s ($K_2=%.3f$ m\,d$^{-1}$ from the class value, $K_1=1.2K_2$): a drain system must remove $q=%.0f$ mm\,d$^{-1}$ with $h=%.1f$ m and an equivalent depth $d=3$ m. Find the drain spacing and the length of pipe per hectare."%(nm(s),K2,q*1000,h),
     r"$8K_2dh=8\times%.3f\times3\times%.1f=%.3f$; $4K_1h^2=4\times%.3f\times%.2f=%.3f$ \ans $L^2=(%.3f+%.3f)/%.3f=%.0f$, $L=%.0f$ m \ans Pipe: $10^4/L=%.0f$ m\,ha$^{-1}$ \ans %s"%(K2,h,8*K2*3*h,K1,h*h,4*K1*h*h,8*K2*3*h,4*K1*h*h,q,(8*K2*3*h+4*K1*h*h)/q,L,1e4/L,'The soil is slow: spacing is narrow and the cost high.' if L<20 else 'The soil is permeable: a wide spacing is possible.'))
fns={1:f1,2:f2,3:f3,4:f4,5:f5,6:f6,7:f7,8:f8,9:f9,10:f10,11:f11,12:f12,13:f13,14:f14}
intro={1:r"The ten soils of the ensemble differ widely in their retention. This section works one question on each of them, so that the reader can see how the same formulas give different answers.",
2:r"The steady flux between two depths depends on the conductivity at the suction in between. This section computes it for each of the ten soils.",
3:r"The reach of the trigger decides whether irrigation can be scheduled by suction. The calculation of Eq.~(\ref{eq:reach}) is repeated for each soil.",
4:r"A season of the bucket is run on each soil and the balance audited, as the application does.",
5:r"The same season is irrigated and left rainfed on every soil, to show how the soil decides the gain.",
6:r"Whether a sprinkler rate produces runoff depends on the intake of the soil; Green--Ampt is used.",
7:r"The same 40-ha farm is sized on each of the ten soils: the soil fixes the interval and, with it, the capacity.",
8:r"Runoff by the curve number and the fate of the rain are computed for a storm of 60 mm on each soil.",
9:r"Thirty days of evaporation after a wetting are computed for each soil, bare and under straw.",
10:r"A single genotype is grown on every soil: the soil changes the water it can use.",
11:r"The time to infiltrate a furrow irrigation is computed for each soil by Green--Ampt.",
12:r"The wetted radius, and with it the spacing of emitters, depends on the soil.",
13:r"The same nozzle and spacing are tested on each soil.",
14:r"The drain spacing for a fixed discharge is computed for each of the ten soils."}
VARS=[('',dict()),(' (second scenario)',dict(trig=.4,seed=11,E0=3.5,Z=40,q=1.2,noz=(4.0,300),q14=.004,h14=.4,i=10.0)),(' (third scenario)',dict(trig=.7,seed=23,E0=7.0,Z=90,q=4.0,noz=(5.6,400),q14=.010,h14=.6,i=20.0))]
if __name__=='__main__':
  for vi,(tag,vv) in enumerate(VARS):
    V.update(dict(trig=.5,seed=5,E0=5.0,Z=60,q=2.0,noz=(4.8,350),q14=.007,h14=.5,i=14.0));V.update(vv)
    for k in range(1,15):
        b=sec('Worked solutions on the ten soils'+tag)+soilblock(k,'Ten-soil example %d%s'%(k,'abc'[vi]),fns[k],intro[k] if vi==0 else r"The same questions are repeated for different working conditions, to show how the answer moves with them.")
        write(k,'ten' if vi==0 else 'ten%s'%('x' if vi==1 else 'y'),b)
  print('ok20')
