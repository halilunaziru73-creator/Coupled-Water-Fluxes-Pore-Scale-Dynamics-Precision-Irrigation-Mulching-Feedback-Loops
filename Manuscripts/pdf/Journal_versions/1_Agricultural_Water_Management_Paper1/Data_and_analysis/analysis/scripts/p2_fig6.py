import json,numpy as np,matplotlib.pyplot as plt
from figstyle import *
A=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_laws2.json'))
fig,ax=plt.subplots(1,3,figsize=(10.5,3.1),gridspec_kw=dict(width_ratios=[1.3,0.9,1.1]))
S=sorted(A['comp16'],key=lambda s:-A['comp16'][s]['kappa'])
k=[A['comp16'][s]['kappa'] for s in S]
ax[0].bar(S,k,color='#0072B2');p=A['kappa16_pool'];ax[0].axhline(p['est'],color='#D55E00',lw=1.2);ax[0].axhspan(p['lo'],p['hi'],color='#D55E00',alpha=0.2)
ax[0].set_ylabel('Irrigation compensation $\\kappa$');ax[0].set_xlabel('Soil (E16 paired $P=0.5\\to1.5$)');ax[0].tick_params(axis='x',rotation=90);panel(ax[0],'a',-0.2)
ax[0].text(0.98,0.93,f"pooled {p['est']:.3f} [{p['lo']:.3f}, {p['hi']:.3f}]",transform=ax[0].transAxes,ha='right',fontsize=7,color='#D55E00')
L=A['comp_lattice'];lab=['E11','E12','E14'];w=[l['W_slope'] for l in L];e=[l['W_se'] for l in L]
ax[1].bar(lab,w,yerr=[1.96*x for x in e],color='#009E73',capsize=3);ax[1].set_ylabel('d$W$/d(rain) (S01 lattices)');ax[1].set_ylim(0,0.75);panel(ax[1],'b',-0.25)
kb=A['kap_by'];x=0;ticks=[];lbls=[]
for nm,key in [('$E_p$','fEp'),('$\\Delta T$','fT'),('trig.','fh'),('dose','fD')]:
    for lev,v in kb[key].items():
        ax[2].bar(x,v,color='#E69F00' if float(lev)==min(map(float,kb[key])) else '#CC79A7');ticks.append(x);lbls.append(f'{nm}\n{float(lev):g}');x+=1
    x+=0.5
ax[2].set_xticks(ticks);ax[2].set_xticklabels(lbls,fontsize=6.5);ax[2].set_ylabel('Mean $\\kappa$ by factor level');panel(ax[2],'c',-0.22)
fig.tight_layout();save(fig,'fig06_compensation','p2')
