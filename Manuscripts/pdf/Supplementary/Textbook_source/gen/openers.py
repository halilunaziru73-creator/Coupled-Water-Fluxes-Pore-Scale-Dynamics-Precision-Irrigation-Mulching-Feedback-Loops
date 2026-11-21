import math,numpy as np,matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle,Rectangle,Polygon,FancyArrowPatch
from lib import SOIL,Se,Kr
C=['#5E8C7F','#1B3B4B','#D9701E','#A8233A','#C7A0CA','#E6A58F']
plt.rcParams.update({'font.size':13,'axes.spines.top':False,'axes.spines.right':False,'axes.grid':True,'grid.alpha':.25})
F='/tmp/kh/fig/'
def new(): 
    f=plt.figure(figsize=(5.6,5.6));return f,f.add_axes([.16,.14,.78,.78])
def done(k,f): f.savefig(F+'op%02d.png'%k,dpi=100,facecolor='white');plt.close(f)
def lab(ax,x,y,t=None): ax.set_xlabel(x);ax.set_ylabel(y)
h=np.logspace(0,4.2,200)
# 1 retention curves
f,ax=new()
for s,c in (('S03',C[0]),('S06',C[1]),('S10',C[3])):
    n,a=SOIL[s][2],SOIL[s][1];ax.semilogx(h,Se(a,n,h),color=c,lw=2.4,label=SOIL[s][0])
lab(ax,'suction $h$ (cm)','effective saturation $S_e$');ax.legend(fontsize=11);ax.set_title('Water retention',fontsize=14);done(1,f)
# 2 wetting front profiles
f,ax=new();z=np.linspace(0,100,200)
for t,fr,c in ((1,10,C[0]),(3,20,C[1]),(6,32,C[2]),(12,48,C[3])):
    th=np.where(z<fr,0.43-0.02*np.exp(-(fr-z)/6)*0+0.0,0.12);th=0.43/(1+np.exp((z-fr)/1.5))+0.12*(1-1/(1+np.exp((z-fr)/1.5)))
    ax.plot(th,z,color=c,lw=2.4,label='$t$ = %d h'%t)
ax.invert_yaxis();lab(ax,'water content $\\theta$ (m$^3$ m$^{-3}$)','depth (cm)');ax.legend(fontsize=11);ax.set_title('Wetting front',fontsize=14);done(2,f)
# 3 reach
f,ax=new();hh=np.logspace(1,5,200)
for s,c in (('S03',C[0]),('S06',C[1]),('S10',C[3])):
    n,a=SOIL[s][2],SOIL[s][1];ax.loglog(hh,[Kr(a,n,x) for x in hh],color=c,lw=2.4,label=SOIL[s][0])
ax.axhline(3.5e-10,color='k',ls='--',lw=1);ax.text(12,6e-10,'demand $\\kappa$',fontsize=11)
ax.set_ylim(1e-20,2);lab(ax,'suction $h$ (cm)','relative conductivity $K_r$');ax.legend(fontsize=10,loc='lower left');ax.set_title('The reach of a trigger',fontsize=14);done(3,f)
# 4 balance bars
f,ax=new();names=['P','I','ET','D','Q','$\\Delta S$'];vals=[380,240,520,70,10,20];cols=[C[1],C[0],C[2],C[3],C[4],C[5]]
ax.bar(names,[380,240,-520,-70,-10,-20],color=cols);ax.axhline(0,color='k',lw=1);lab(ax,'term of the balance','depth (mm per season)');ax.set_title('Closing the balance',fontsize=14);done(4,f)
# 5 Kc
f,ax=new();d=np.arange(0,126)
def kc(t):
    L1,L2,L3,L4=15,30,50,30
    return .3 if t<L1 else .3+.9*(t-L1)/L2 if t<L1+L2 else 1.2 if t<L1+L2+L3 else 1.2-.6*min(1,(t-L1-L2-L3)/L4)
ax.plot(d,[kc(t) for t in d],color=C[0],lw=2.8)
for x,t in ((7,'initial'),(30,'develop.'),(70,'mid'),(110,'late')): ax.text(x,.08,t,ha='center',fontsize=11)
for x in (15,45,95): ax.axvline(x,color='grey',ls=':')
lab(ax,'day of season','crop coefficient $K_c$');ax.set_ylim(0,1.5);ax.set_title('Four stages of a crop',fontsize=14);done(5,f)
# 6 field with sprinkler circles
f,ax=new();ax.set_aspect('equal');ax.grid(False)
for i in range(4):
    for j in range(3):
        ax.add_patch(Circle((i*12+6,j*18+9),13,color=C[0],alpha=.25));ax.plot(i*12+6,j*18+9,'o',color=C[3],ms=5)
ax.set_xlim(-8,56);ax.set_ylim(-6,62);lab(ax,'distance along lateral (m)','distance between laterals (m)');ax.set_title('Sprinkler overlap, 12 × 18 m',fontsize=14);done(6,f)
# 7 layers stack
f,ax=new();ax.axis('off')
L=['Field sketch','Soil and weather','Simulation (Daisy)','Irrigation control','Mulch, structure','Design: surface, drip, sprinkler','Drainage and salinity','Balance and dashboard']
for i,t in enumerate(L):
    ax.add_patch(Rectangle((.05,.88-i*.115),.9,.095,color=[C[0],C[1],C[2],C[3],C[0],C[1],C[2],C[3]][i],alpha=.85));ax.text(.5,.928-i*.115,t,color='w',ha='center',va='center',fontsize=12,weight='bold')
ax.set_xlim(0,1);ax.set_ylim(0,1);ax.set_title('Layers of the application',fontsize=14);done(7,f)
# 8 bucket
f,ax=new();ax.axis('off');ax.add_patch(Rectangle((.3,.2),.4,.5,fill=False,lw=2.5,color=C[1]));ax.add_patch(Rectangle((.3,.2),.4,.3,color=C[0],alpha=.55))
ax.annotate('',(.5,.72),(.5,.95),arrowprops=dict(arrowstyle='->',color=C[1],lw=2));ax.text(.5,.97,'rain + irrigation',ha='center',fontsize=12)
ax.annotate('',(.95,.8),(.7,.6),arrowprops=dict(arrowstyle='->',color=C[2],lw=2));ax.text(.82,.82,'$ET_a$',fontsize=13)
ax.annotate('',(.5,.04),(.5,.2),arrowprops=dict(arrowstyle='->',color=C[3],lw=2));ax.text(.55,.08,'drainage',fontsize=12)
ax.text(.5,.35,'TAW',ha='center',fontsize=13,color='w');ax.axhline(.5,xmin=.3,xmax=.7,color='k',ls='--');ax.text(.72,.5,'RAW',fontsize=11)
ax.set_xlim(0,1);ax.set_ylim(0,1);ax.set_title('The tipping bucket',fontsize=14);done(8,f)
# 9 mulch evaporation
f,ax=new();t=np.linspace(.2,30,200)
for (n,fc,U),c in zip((('bare',0,9),('straw',.6,7),('film',.9,5)),C):
    t1=U/5;ax.plot(t,np.where(t<t1,5*t,U+3.5*(np.sqrt(t)-math.sqrt(t1)))*(1-fc),color=c,lw=2.4,label=n)
lab(ax,'days after wetting','cumulative evaporation (mm)');ax.legend(fontsize=11);ax.set_title('Mulch and evaporation',fontsize=14);done(9,f)
# 10 phenotyping
f,ax=new();x=np.array([410,445,455,490,540]);y=np.array([8.9,10.1,9.8,10.6,11.2])
ax.scatter(x,y,s=110,color=C[3]);[ax.annotate('G%d'%i,(a,b),(6,6),textcoords='offset points') for i,(a,b) in enumerate(zip(x,y),1)]
lab(ax,'evapotranspiration $ET_a$ (mm)','yield (Mg ha$^{-1}$)');ax.set_title('Genotypes under stress',fontsize=14);done(10,f)
# 11 furrow
f,ax=new();ax.grid(False);xs=np.linspace(0,250,100)
ax.fill_between(xs,0,-0.6-0.0*xs,color='#C9A27A',alpha=.5);ax.plot(xs,0.05*np.sin(xs/20)*0,color=C[1],lw=3)
for q,c in ((1,C[0]),(2,C[3])): ax.plot(xs,-(0.55*(1-xs/250)**.6)*q*.5-0.02,color=c,lw=2.5,label='$q_0$ = %d L/s'%q)
ax.set_xlabel('distance along furrow (m)');ax.set_ylabel('infiltrated depth (relative)');ax.legend(fontsize=11);ax.set_title('Furrow and intake',fontsize=14);done(11,f)
# 12 bulb
f,ax=new();ax.set_aspect('equal');ax.grid(False)
for r,c in ((.25,C[3]),(.45,C[2]),(.65,C[0]),(.85,C[1])): ax.add_patch(matplotlib.patches.Wedge((0,0),r,180,360,color=c,alpha=.55))
ax.plot(0,0,'v',color='k',ms=10);ax.text(.04,.05,'emitter',fontsize=11);ax.set_xlim(-1,1);ax.set_ylim(-1,.2);lab(ax,'horizontal distance (m)','depth (m)');ax.set_title('Wetted bulb',fontsize=14);done(12,f)
# 13 pattern circles
f,ax=new();ax.set_aspect('equal');ax.grid(False)
for r,c in ((14,C[1]),(10,C[0]),(5,C[3])): ax.add_patch(Circle((0,0),r,fill=False,lw=2.4,color=c))
ax.plot(0,0,'o',color='k');ax.set_xlim(-16,16);ax.set_ylim(-16,16);lab(ax,'distance (m)','distance (m)');ax.set_title('Sprinkler throw',fontsize=14);done(13,f)
# 14 drains
f,ax=new();x=np.linspace(-10.5,10.5,100);ax.fill_between(x,-2.5,-6,color='#999',alpha=.5);ax.text(0,-4.5,'impermeable barrier',ha='center',fontsize=11)
ax.plot(x,-1.3+0.5*(1-(x/10.5)**2),color=C[1],lw=2.6,label='water table');ax.scatter([-10.5,10.5],[-1.8,-1.8],color=C[3],s=90,label='drains',zorder=3)
ax.set_xlabel('distance (m)');ax.set_ylabel('elevation (m)');ax.legend(fontsize=11);ax.set_ylim(-6,0.5);ax.set_title('Drain spacing',fontsize=14);done(14,f)
# 15 ten soils
f,ax=new()
for i,s in enumerate(sorted(SOIL)): ax.semilogx(h,Se(SOIL[s][1],SOIL[s][2],h),color=plt.cm.viridis(i/9),lw=1.8)
lab(ax,'suction $h$ (cm)','effective saturation $S_e$');ax.set_title('Ten soils',fontsize=14);done(15,f)
print('ok')
