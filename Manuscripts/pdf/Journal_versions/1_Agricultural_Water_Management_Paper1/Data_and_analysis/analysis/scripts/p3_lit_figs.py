import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from figstyle import *
import json, numpy as np
CB='#0072B2'; CD='#D55E00'; CG='#009E73'
O=__import__('os').environ.get('SWAFL_MS','.')+'/out/'
s=np.load(O+'drip_scatter.npy'); d=json.load(open(O+'drip_out.json'))['new']['rows']
fr=s[:,0]; old=np.maximum(100*s[:,1],1e-6); new=np.maximum(100*s[:,2],1e-6)
fig,axs=plt.subplots(1,2,figsize=(7.2,2.8)); ax=axs[0]
ax.semilogy(fr,old,'o',ms=2.5,color=CD,alpha=.7,label='four-pass solver (version 1)'); ax.semilogy(fr,new,'o',ms=2.5,color=CB,alpha=.7,label='converged solver (this version)')
ax.axvline(0.2,color='#666',ls='--',lw=.7); ax.axvline(0.6,color='#666',ls=':',lw=.7); ax.set_xlabel('$h_f/H_0$'); ax.set_ylabel('Relative difference in $h_f$ (%)'); ax.legend(loc='upper left',frameon=False,fontsize=6,bbox_to_anchor=(0.0,0.9)); panel(ax,'a',x=-0.2); ax.set_ylim(1e-6,200)
ax=axs[1]; it=np.array([r['iters'] for r in d]); hf=np.array([r['hfFrac'] for r in d]); cv=np.array([r['conv'] for r in d])
ax.semilogy(hf[cv],it[cv],'o',ms=2.5,color=CB,label='converged'); ax.semilogy(hf[~cv],it[~cv],'x',ms=3.5,color=CD,label='not converged (warning)')
ax.axvline(0.2,color='#666',ls='--',lw=.7); ax.text(0.21,250,'warning above 0.2',fontsize=6); ax.set_xlabel('$h_f/H_0$'); ax.set_ylabel('Iterations'); ax.legend(loc='upper left',frameon=False,fontsize=6); panel(ax,'b',x=-0.2)
fig.tight_layout(); save(fig,'fig07_drip','p3')
F=json.load(open(O+'fao_out.json')); sp=json.load(open(O+'spr_out.json'))['new']
fig,axs=plt.subplots(1,2,figsize=(7.2,2.8)); ax=axs[0]
pub=[r['ref'] for c in F for r in c['rows']]; sw=[r['adv'] for c in F for r in c['rows']]
ax.loglog(pub,sw,'o',ms=4,color=CB); ax.plot([.8,20],[.8,20],color='#999',lw=.8); ax.set_xlabel('Published advance time, FAO-45 (h)'); ax.set_ylabel('SWAFL advance time (h)'); panel(ax,'a',x=-0.2)
ax=axs[1]
for u,c,m in [(0,CB,'o'),(3,CD,'s')]:
    q=[x for x in sp['cu'] if x['u']==u]; ax.plot([x['ratio'] for x in q],[100*x['CU'] for x in q],m+'-',ms=3,color=c,label=f'wind {u} m s$^{{-1}}$')
ax.axvline(0.65,color='#666',ls='--',lw=.7); ax.axhline(85,color='#666',ls=':',lw=.7); ax.text(0.66,5,'65 % of $D_w$',fontsize=6); ax.set_xlabel('Spacing / wetted diameter'); ax.set_ylabel('Christiansen CU (%)'); ax.legend(frameon=False,fontsize=6); panel(ax,'b',x=-0.2); ax.set_ylim(0,100)
fig.tight_layout(); save(fig,'fig09_literature','p3')
