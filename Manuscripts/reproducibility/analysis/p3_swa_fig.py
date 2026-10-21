import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
# Paper 3, Figure 2: soil-water-atmosphere variables of the ten soils (input: out/p3_swa_vars.json from p3_js/swa_vars.js)
from figstyle import *
import json, numpy as np
R=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p3_swa_vars.json'))
ID=[r['soil'][:3] for r in R]; x=np.arange(len(R))
CB,CO,CG,CR,CP,CS='#0072B2','#E69F00','#009E73','#D55E00','#CC79A7','#56B4E9'
SEL={'S03':(CO,'Sand'),'S01':(CB,'Coarse loam'),'S10':(CP,'Silty clay loam')}
fig,ax=plt.subplots(2,3,figsize=(7.4,5.4)); ax=ax.ravel()
# (a) retention curves
h=np.logspace(0,5,300)
for r in R:
    q=r['hyd']; m=1-1/q['n']; th=q['thetaR']+(q['thetaS']-q['thetaR'])*(1+(q['alpha']*h)**q['n'])**(-m)
    s=r['soil'][:3]; c,lab=SEL.get(s,('#BBBBBB',None)); ax[0].plot(h,th,color=c,lw=1.5 if lab else 0.8,label=lab,zorder=3 if lab else 1)
for hv,t in ((100,'FC'),(15849,'WP')): ax[0].axvline(hv,color='#888',ls=':',lw=0.8); ax[0].text(hv*1.15,0.47,t,fontsize=6.5,color='#555')
ax[0].set_xscale('log'); ax[0].set_xlabel('Suction $h$ (cm)'); ax[0].set_ylabel(r'Water content $\theta$ (–)'); ax[0].set_ylim(0,0.5)
ax[0].legend(frameon=False,fontsize=6.3,loc='lower left'); panel(ax[0],'a')
# (b) annual balance: sinks stacked, inputs as markers
T=np.array([r['e1']['transp'] for r in R]); E=np.array([r['e1']['evap'] for r in R]); O=np.array([r['e1']['other'] for r in R]); D=np.array([r['e1']['drain'] for r in R])
W=np.array([r['e1']['rain']+r['e1']['irr'] for r in R])
b0=np.zeros(len(R))
for v,c,l in ((T,CG,'$T$'),(E,CO,'$E$'),(O,CS,r'$E_{\mathrm{oth}}$'),(D,CB,'$D$')): ax[1].bar(x,v,0.7,bottom=b0,color=c,label=l); b0=b0+v
ax[1].plot(x,W,'k_',ms=9,mew=1.6,label='$P+I$')
ax[1].set_xticks(x); ax[1].set_xticklabels(ID,rotation=90,fontsize=6.5); ax[1].set_ylabel('mm yr$^{-1}$'); ax[1].set_ylim(0,1050)
ax[1].legend(frameon=False,fontsize=6,ncol=3,loc='upper left',columnspacing=0.8,handlelength=1.2); panel(ax[1],'b')
# (c) two-stage evaporation, cumulative loss at the season-mean demand
t=np.linspace(0,24,300)
for r in R:
    s=r['soil'][:3]
    if s not in SEL: continue
    v=r['evap']; t1=v['t1']; Q=np.where(t<=t1,v['e0']*t,v['Q1']+2*v['e0']*v['tau']*(np.sqrt(1+(t-t1)/v['tau'])-1))
    c,lab=SEL[s]; ax[2].plot(t,Q,color=c,label=f"{lab}: $t_1$ = {t1:.1f} d"); ax[2].plot([t1],[v['Q1']],'o',color=c,ms=3.5)
ax[2].set_xlabel('Days after wetting'); ax[2].set_ylabel('Cumulative loss $Q$ (mm)'); ax[2].legend(frameon=False,fontsize=6.2,loc='lower right'); panel(ax[2],'c')
# (d) uptake by depth
z=(np.arange(40)+0.5)*2.5
for r in R:
    s=r['soil'][:3]
    if s not in SEL: continue
    u=np.array(r['e2']['uptakeProfile']); c,lab=SEL[s]
    ax[3].plot(u/2.5,z,color=c,label=lab); ax[3].axhline(r['e2']['z90'],color=c,ls=':',lw=0.8)
ax[3].invert_yaxis(); ax[3].set_xlabel('Root water uptake (mm yr$^{-1}$ cm$^{-1}$)'); ax[3].set_ylabel('Depth (cm)'); ax[3].legend(frameon=False,fontsize=6.3,loc='lower right'); panel(ax[3],'d')
# (e) water potential along the soil-plant path
for k,(key,c,l,mk) in enumerate((('psiRZ',CB,r'$\psi_{\mathrm{RZ}}$ root zone','o'),('psiRoot',CO,r'$\psi_{\mathrm{root}}$','s'),('psiLeaf',CG,r'$\psi_{\mathrm{leaf}}$','D'))):
    ax[4].plot(x+(k-1)*0.22,[r['spac'][key] for r in R],mk,color=c,ms=3.6,ls='none',label=l)
ax[4].axhline(-1.6,color=CR,ls='--',lw=0.8); ax[4].text(-0.4,-1.56,'stomata closing below this line',fontsize=5.8,color=CR,ha='left',va='bottom')
ax[4].set_xticks(x); ax[4].set_xticklabels(ID,rotation=90,fontsize=6.5); ax[4].set_ylabel(r'Water potential $\psi$ (MPa)'); ax[4].set_ylim(-2.6,0.1)
ax[4].legend(frameon=False,fontsize=6,loc='center left',bbox_to_anchor=(0.0,0.62),ncol=1); panel(ax[4],'e')
# (f) fate of the evaporation saved by straw mulch
b0=np.zeros(len(R))
for key,c,l in (('fI',CB,'less irrigation'),('fD',CR,'more drainage'),('fT',CG,'more transpiration'),('fRest',CS,'storage and other')):
    v=np.array([r['mulch'][key] for r in R]); ax[5].bar(x,v,0.7,bottom=b0,color=c,label=l); b0=b0+v
ax[5].set_xticks(x); ax[5].set_xticklabels(ID,rotation=90,fontsize=6.5); ax[5].set_ylabel('Share of evaporation saved (–)'); ax[5].set_ylim(0,1.45)
ax[5].legend(frameon=False,fontsize=5.9,ncol=2,loc='upper left',columnspacing=0.8,handlelength=1.2); panel(ax[5],'f')
fig.tight_layout(w_pad=1.2,h_pad=1.0)
save(fig,'fig04_swa_state','p3')
