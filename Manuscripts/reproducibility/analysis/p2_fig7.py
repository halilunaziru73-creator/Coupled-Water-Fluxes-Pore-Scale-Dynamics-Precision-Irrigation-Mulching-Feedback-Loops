import pandas as pd,numpy as np,matplotlib.pyplot as plt,sys
sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import SOIL_N,SOIL_L,VG
from figstyle import *
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl');D=D[~D.experiment.str.startswith(('E8_','E9_'))]
order=sorted(SOIL_N,key=lambda s:-VG[s][1])
cols=[('transpiration_mm','Transpiration','#009E73'),('soil_evap_mm','Soil evaporation','#0072B2'),('canopy_evap_mm','Canopy evaporation','#56B4E9'),('R','Unattributed $R$','#E69F00'),('drainage_1m_mm','Drainage','#D55E00')]
rows=[];
for s in order:
    g=D[D.s==s];tot=g.W.mean()
    rows.append([g[c].mean()/tot for c,_,_ in cols]+[len(g)])
R=np.array(rows)
fig,ax=plt.subplots(1,3,figsize=(10.5,3.3),gridspec_kw=dict(width_ratios=[1.5,0.8,0.8]))
b=np.zeros(len(order))
for j,(c,l,col) in enumerate(cols): ax[0].bar(order,R[:,j],bottom=b,color=col,label=l);b+=R[:,j]
ax[0].set_ylabel('Share of water input $W$');ax[0].set_xlabel('Soil (ordered by decreasing $n$)');ax[0].legend(ncol=3,frameon=False,loc='upper center',bbox_to_anchor=(0.5,-0.28),fontsize=6.5);panel(ax[0],'a',-0.14)
ax[0].tick_params(axis='x',rotation=90)
ax[1].bar(order,R[:,5],color='#7F7F7F');ax[1].set_ylabel('Valid runs (E8, E9 excl.)');ax[1].tick_params(axis='x',rotation=90);panel(ax[1],'b',-0.3)
sh=[(D[D.s==s].R/D[D.s==s].ET_mm).median() for s in order]
ax[2].bar(order,sh,color='#E69F00');ax[2].set_ylabel('Median $R/\\mathit{ET}$');ax[2].tick_params(axis='x',rotation=90);panel(ax[2],'c',-0.3)
fig.tight_layout();save(fig,'fig07_fates_by_soil','p2')
print(np.round(R,3));print(np.round(sh,3))
