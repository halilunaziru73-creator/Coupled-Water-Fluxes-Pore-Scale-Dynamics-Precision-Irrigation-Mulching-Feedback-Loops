import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle
from scipy.special import erf
rng=np.random.default_rng(7)
navy='#0b1d3a'; gold='#c9a227'; blue='#1f5fa8'; mag='#b0156b'; teal='#1b8a8f'
# F1 modelled thin section
def section(fn,w=10,h=7,N=900):
    fig,ax=plt.subplots(figsize=(w,h),dpi=130)
    ax.add_patch(Rectangle((0,0),w,h,color='#0f2a52'))
    discs=[]
    tries=0
    while len(discs)<N and tries<400000:
        tries+=1
        r=np.exp(rng.normal(np.log(0.22),0.45)); r=min(max(r,0.06),0.6)
        x,y=rng.uniform(0,w),rng.uniform(0,h)
        ok=True
        for (a,b,c) in discs[-400:]:
            if (a-x)**2+(b-y)**2<(c+r)**2*0.97: ok=False;break
        if ok: discs.append((x,y,r))
    cols=['#d9b36c','#c99a52','#e6c68a','#b88a46']
    for x,y,r in discs: ax.add_patch(Circle((x,y),r,color=cols[rng.integers(4)],ec='#7a5a2a',lw=0.4))
    ax.set_xlim(0,w);ax.set_ylim(0,h);ax.axis('off');fig.tight_layout(pad=0)
    fig.savefig(fn,facecolor='#0f2a52');plt.close()
section('fig/op_pore.png',8,10,1500)
# F2 retention curve with pore domains
a,n=0.036,1.56;m=1-1/n;tr,ts=0.08,0.43
pF=np.linspace(-0.5,5,400);h=10**pF
th=tr+(ts-tr)/(1+(a*h)**n)**m
fig,ax=plt.subplots(figsize=(8,4.4),dpi=150)
ax.plot(pF,th,color=navy,lw=2.2)
for x0,x1,c,l in [(-0.5,2.0,'#7fb8e6','macropores\n(drain fast)'),(2.0,4.2,'#9bd3a0','mesopores\n(plant-available)'),(4.2,5.0,'#f0c27b','micropores\n(held tightly)')]:
    ax.axvspan(x0,x1,color=c,alpha=0.35,lw=0)
    ax.text((x0+x1)/2,0.07 if x0>0 else 0.07,l,ha='center',va='bottom',fontsize=9,color='#222')
ax.set_xlabel('suction, pF = log$_{10}h$ (h in cm)');ax.set_ylabel('water content $\\theta$ (m$^3$ m$^{-3}$)')
ax.set_xlim(-0.5,5);ax.set_ylim(0,0.46)
sec=ax.secondary_xaxis('top',functions=(lambda p:np.log10(0.149/10**p*1e4),lambda q:np.log10(0.149*1e4/10**q)))
sec.set_xlabel('equivalent pore radius, log$_{10}r$ ($\\mu$m)')
ax.axvline(2.0,color='k',ls=':',lw=0.8);ax.axvline(4.2,color='k',ls=':',lw=0.8)
fig.tight_layout();fig.savefig('fig/pore_domains.png');plt.close()
# F3 share of porosity vs share of flux (lognormal)
mu_,s=np.log(10),1.0
r=np.logspace(-1,3,400)
cdf=0.5*(1+erf((np.log(r)-mu_)/(s*np.sqrt(2))))
pdf=np.exp(-0.5*((np.log(r)-mu_)/s)**2)/(s*np.sqrt(2*np.pi))
flux=np.cumsum(pdf*r**2*np.gradient(np.log(r)));flux/=flux[-1]
fig,ax=plt.subplots(figsize=(7.6,4.2),dpi=150)
ax.semilogx(r,cdf,color=blue,lw=2.2,label='share of the pore volume in pores of radius $\\leq r$')
ax.semilogx(r,flux,color=mag,lw=2.2,label='share of the flow carried by pores of radius $\\leq r$')
ax.set_xlabel('pore radius $r$ ($\\mu$m)');ax.set_ylabel('cumulative share');ax.legend(fontsize=8,loc='upper left');ax.grid(alpha=0.25)
ax.axvline(10,color='k',ls=':',lw=0.8)
fig.tight_layout();fig.savefig('fig/pore_flux.png');plt.close()
# F4 capillary rise
fig,ax=plt.subplots(figsize=(7.4,4.6),dpi=150)
ax.add_patch(Rectangle((0,0),9,0.4,color='#7fb8e6',alpha=0.6))
data=[(1.5,'r = 0.5 mm','rise 2.97 cm',2.97,0.9),(4.5,'r = 0.05 mm','rise 29.7 cm',29.7,0.55),(7.5,'r = 5 $\\mu$m','rise 297 cm',297,0.3)]
for x,lab,riselab,hh,wd in data:
    hplot=np.log10(hh)*2.0+0.8
    ax.add_patch(Rectangle((x-wd/2,0),wd,hplot+0.4,fc='none',ec=navy,lw=1.6))
    ax.add_patch(Rectangle((x-wd/2+0.03,0),wd-0.06,hplot,color='#7fb8e6',alpha=0.8))
    ax.text(x,hplot+0.65,lab+'\n'+riselab,ha='center',fontsize=9)
ax.text(4.5,-0.5,'free water surface (heights drawn on a logarithmic scale)',ha='center',fontsize=8,color='#444')
ax.set_xlim(0,9);ax.set_ylim(-0.9,8.4);ax.axis('off')
fig.tight_layout();fig.savefig('fig/pore_rise.png');plt.close()
# F5 bundle: straight vs tortuous
fig,axs=plt.subplots(1,2,figsize=(8,3.2),dpi=150)
for ax in axs:
    ax.add_patch(Rectangle((0,0),6,4,fc='#f2e3c3',ec=navy,lw=1.4));ax.set_xlim(-0.2,6.2);ax.set_ylim(-0.2,4.2);ax.axis('off')
for yy in [0.8,1.8,2.8,3.6]: axs[0].plot([0,6],[yy,yy],color=blue,lw=4,solid_capstyle='butt')
axs[0].annotate('',xy=(6.1,0.1),xytext=(6.1,0.1));axs[0].set_title('(a) straight capillaries, $L_e=L$',fontsize=9)
for k,yy in enumerate([0.8,1.8,2.8,3.6]):
    x=np.linspace(0,6,200);y=yy+0.35*np.sin(2*np.pi*x/(1.4+0.3*k))
    axs[1].plot(x,y,color=blue,lw=4)
axs[1].set_title('(b) tortuous capillaries, $L_e=\\tau L$',fontsize=9)
fig.tight_layout();fig.savefig('fig/pore_tort.png');plt.close()
from PIL import Image
Image.open('fig/pore_domains.png').convert('RGB').save('fig/sh23.jpg',quality=85)
print('ok')
