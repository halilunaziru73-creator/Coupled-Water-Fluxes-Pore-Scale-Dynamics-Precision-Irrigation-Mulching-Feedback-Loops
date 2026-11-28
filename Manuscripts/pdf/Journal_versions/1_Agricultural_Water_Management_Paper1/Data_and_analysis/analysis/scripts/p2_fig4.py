import sys;sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
import pandas as pd,numpy as np,matplotlib.pyplot as plt,json,warnings;warnings.filterwarnings('ignore')
from load import VG,TAW
from figstyle import *
from sklearn.decomposition import PCA
from scipy import stats
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl')
cols=['transpiration_mm','soil_evap_mm','canopy_evap_mm','R','drainage_1m_mm']
def clr(c):
    p=D[cols].clip(lower=c);F=p.div(p.sum(axis=1),axis=0);L=np.log(F);return L.sub(L.mean(axis=1),axis=0)
clips=[1e-3,0.1,1,5,10];res={}
for c in clips:
    p=PCA(4).fit(clr(c).values);res[c]=p.explained_variance_ratio_.tolist()
C=clr(1.0);pca=PCA(3).fit(C.values);Z=pca.transform(C.values)
n_=D.s.map(lambda s:VG[s][1]);w=np.log(D.W/D.s.map(TAW))
cor=[stats.spearmanr(Z[:,0],w).statistic,stats.spearmanr(Z[:,0],n_).statistic,stats.spearmanr(Z[:,0],D.drainage_1m_mm/D.W).statistic]
print(cor,pca.components_.round(2),pca.explained_variance_ratio_)
json.dump(dict(sens={str(k):v for k,v in res.items()},clip1_evr=pca.explained_variance_ratio_.tolist(),clip1_load=pca.components_.tolist(),cor_PC1=cor),open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_pca_sens.json','w'))
fig,axs=plt.subplots(1,3,figsize=(10.5,3.3),gridspec_kw=dict(width_ratios=[1.1,1.1,1]))
ax=axs[0];x=np.arange(len(clips));wd=0.26
for k,(col,l) in enumerate(zip(['#0072B2','#E69F00','#009E73'],['PC1','PC2','PC3'])): ax.bar(x+(k-1)*wd,[100*res[c][k] for c in clips],wd,color=col,label=l)
ax.set_xticks(x);ax.set_xticklabels(['$10^{-3}$','0.1','1','5','10']);ax.set_xlabel('Zero-replacement floor (mm yr$^{-1}$)');ax.set_ylabel('Variance explained (%)');ax.legend(frameon=False,ncol=3);panel(ax,'a',-0.2)
ax=axs[1];sc=ax.scatter(Z[:,0],Z[:,1],c=w,s=2,cmap='viridis',alpha=0.6);cb=fig.colorbar(sc,ax=ax);cb.set_label('$\\ln(W/\\mathrm{TAW})$',fontsize=7)
ax.set_xlabel('PC1');ax.set_ylabel('PC2');panel(ax,'b',-0.2)
ax=axs[2];load=pca.components_[:2].T;names=['T','$E_s$','$E_c$','R','D']
for i,nm in enumerate(names): ax.arrow(0,0,load[i,0],load[i,1],head_width=0.03,color='#D55E00',length_includes_head=True);ax.text(load[i,0]*1.15,load[i,1]*1.15,nm,fontsize=8,ha='center')
ax.set_xlim(-0.7,1.1);ax.set_ylim(-0.9,1.0);ax.set_xlabel('PC1 loading (1 mm floor)');ax.set_ylabel('PC2 loading');ax.axhline(0,color='#ccc',lw=0.5);ax.axvline(0,color='#ccc',lw=0.5);panel(ax,'c',-0.2)
fig.tight_layout();save(fig,'fig04_manifold','p2')
