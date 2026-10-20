import pandas as pd,numpy as np,matplotlib.pyplot as plt
from figstyle import *
r=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_e11.pkl')
pv=r.pivot(index='dT',columns='P',values='psiD')
fig,ax=plt.subplots(1,3,figsize=(10.5,3.2),gridspec_kw=dict(width_ratios=[1.25,1,1]))
im=ax[0].imshow(pv.values,origin='lower',aspect='auto',cmap='viridis',extent=[0.45,1.45,-1.25,3.75])
ax[0].set_xlabel('Rain scale $P$');ax[0].set_ylabel('Warming $\\Delta T$ (°C)')
cb=fig.colorbar(im,ax=ax[0],pad=0.02);cb.set_label('$\\psi_D$ (S01)')
cs=ax[0].contour(pv.columns,pv.index,pv.values,levels=[0.1,0.2,0.3,0.4,0.5],colors='white',linewidths=0.8)
ax[0].clabel(cs,fmt='%.1f',fontsize=6.5)
panel(ax[0],'a',-0.2)
cm=plt.cm.viridis
for i,dt in enumerate(pv.index[::2]): ax[1].plot(pv.columns,pv.loc[dt],marker='o',ms=3,color=cm(i/5),label=f'{dt:+.1f}')
ax[1].set_xlabel('Rain scale $P$');ax[1].set_ylabel('$\\psi_D$');ax[1].legend(title='$\\Delta T$ (°C)',frameon=False,ncol=2);panel(ax[1],'b',-0.22)
for i,P in enumerate(pv.columns[::2]): ax[2].plot(pv.index,pv[P],marker='o',ms=3,color=plt.cm.plasma(i/5),label=f'{P:.1f}')
ax[2].set_xlabel('Warming $\\Delta T$ (°C)');ax[2].set_ylabel('$\\psi_D$');ax[2].legend(title='$P$',frameon=False,ncol=2);panel(ax[2],'c',-0.22)
fig.tight_layout();save(fig,'fig11_e11_surface','p1')
