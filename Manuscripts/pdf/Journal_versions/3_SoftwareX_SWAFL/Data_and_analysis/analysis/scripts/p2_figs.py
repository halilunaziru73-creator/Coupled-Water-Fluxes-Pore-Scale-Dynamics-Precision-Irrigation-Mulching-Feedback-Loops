import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from matplotlib import cm, patches
from sklearn.model_selection import GroupKFold
from sklearn.ensemble import HistGradientBoostingRegressor as GB
from sklearn.decomposition import PCA
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); A=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_a.json')); A.update(json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_laws.json'))); LW=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_laws.json')) if False else None
CB='#0072B2'; CD='#D55E00'; CG='#009E73'; CY='#E69F00'
short={'E0_Baselines':'E0','E10_Amount_Timing_Soil':'E10','E11_Temp_Evap_Rain':'E11','E12_Sensor_Trigger_Rain':'E12','E13_N_Water_Soil':'E13','E14_Mulch_Rain':'E14','E15_Method_Depth_Amount':'E15','E16_Edge_Cases':'E16','E1_Doses':'E1','E2_TriggerPressure':'E2','E3_SensorDepth':'E3','E4_Methods':'E4','E5_SHP_Dynamics':'E5','E6_Mediterranean_Pollution':'E6','E7_Mulching':'E7','E8_Rain_Intensity_Moisture':'E8','E9_Soil_Moisture_Rain':'E9'}
D['ex']=D.experiment.map(short); eorder=['E0','E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13','E14','E15','E16']
# ---- Fig 1 pipeline
fig,ax=plt.subplots(figsize=(7.4,2.7)); ax.axis('off'); ax.set_xlim(0,10); ax.set_ylim(0,3.6)
def box(x,y,w,h,t,c,fs=6.8): ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.03,rounding_size=0.1',fc=c,ec='#444',lw=0.8)); ax.text(x+w/2,y+h/2,t,ha='center',va='center',fontsize=fs)
def arr(x1,y1,x2,y2): ax.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>',color='#444',lw=1))
box(0.05,1.2,1.6,1.4,'10,041 valid\nDaisy runs\n17 experiments\n10 soils','#D6EAF8'); 
steps=[('1  Linear invariants\nnull space of the flux\nmatrix (SVD, bootstrap,\npermutation control)','#FCF3CF'),('2  Hidden terms\nresidual of the ET\npartition and its\ndrivers','#FADBD8'),('3  Partition manifold\ncompositional (clr) PCA\nof water fates','#E8DAEF'),('4  Sparse laws\nforward selection over\ndimensionless library;\nLOSO and LOEO','#D5F5E3')]
for i,(t,c) in enumerate(steps): box(2.1+i*1.95,1.2,1.75,1.4,t,c); arr(1.7 if i==0 else 2.1+i*1.95-0.2,1.9,2.1+i*1.95-0.02,1.9)
box(2.1,0.05,7.55,0.7,'Controls: column-permutation null, leave-one-soil-out (LOSO), leave-one-experiment-out (LOEO), gradient-boosting benchmark, physical-consistency checks (mass closure, sign, bounds)','#F4F6F7',6.5)
box(2.1,2.9,7.55,0.6,'Outputs: conservation law (positive control), hidden term, manifold dimension, compact equations with uncertainty and stated domain of validity','#F4F6F7',6.5)
save(fig,'fig01_pipeline','p2')
# ---- Fig 2 SVD & closure
fig,axs=plt.subplots(2,2,figsize=(7.2,5.4))
sv=np.array(A['svd']['sv']); ax=axs[0,0]; ax.semilogy(range(1,8),sv,'o-',color=CB,label='real flux matrix'); 
rng=np.random.default_rng(1); cols=['rain_mm','irrigation_mm','ET_mm','transpiration_mm','soil_evap_mm','canopy_evap_mm','drainage_1m_mm']; M=D[cols].values; Mp=np.column_stack([rng.permutation(M[:,j]) for j in range(7)]); sc=np.sqrt((Mp**2).mean(0)); svp=np.linalg.svd(Mp/sc,compute_uv=False)
ax.semilogy(range(1,8),svp,'s--',color='#999',label='columns permuted'); ax.set_xlabel('Singular-value index'); ax.set_ylabel('Singular value'); ax.legend(frameon=False); panel(ax,'a')
ax=axs[0,1]; lab=['Rain','Irrigation','ET','Drainage']; v=np.array(A['svd4']['vec']); lo=np.array(A['svd4']['lo']); hi=np.array(A['svd4']['hi']); y=np.arange(4)
ax.errorbar(v,y,xerr=[v-lo,hi-v],fmt='o',color=CB,capsize=3); ax.axvline(1,color='#bbb',lw=0.6,ls=':'); ax.axvline(-1,color='#bbb',lw=0.6,ls=':'); ax.set_yticks(y); ax.set_yticklabels(lab); ax.set_xlabel('Coefficient of the smallest right singular vector\n(scaled so that $c_{ET}=-1$)'); ax.invert_yaxis(); panel(ax,'b')
ax=axs[1,0]; data=[(D[D.ex==e].dS/D[D.ex==e].W).values for e in eorder]; bp=ax.boxplot(data,showfliers=False,patch_artist=True,widths=0.6)
for p_,e in zip(bp['boxes'],eorder): p_.set_facecolor(CD if e in('E8','E9') else '#9ecae1'); p_.set_edgecolor('#444')
ax.axhline(0,color='#666',lw=0.6); ax.set_xticks(range(1,18)); ax.set_xticklabels(eorder,rotation=90); ax.set_ylabel('Storage residual $\\Delta S/W$'); ax.set_ylim(-0.6,0.5); panel(ax,'c')
ax=axs[1,1]; data=[(D[D.ex==e].R/D[D.ex==e].ET_mm).values for e in eorder]; bp=ax.boxplot(data,showfliers=False,patch_artist=True,widths=0.6)
for p_ in bp['boxes']: p_.set_facecolor('#F5CBA7'); p_.set_edgecolor('#444')
ax.set_xticks(range(1,18)); ax.set_xticklabels(eorder,rotation=90); ax.set_ylabel('Unattributed share of ET, $R/ET$'); panel(ax,'d')
fig.tight_layout(); save(fig,'fig02_invariants','p2')
# ---- Fig 3 hidden term by method
fig,axs=plt.subplots(1,2,figsize=(7.2,2.8))
x=D[D.experiment=='E4_Methods'].copy(); x['m']=x.treatment.str.replace('_',' ')
g=x.groupby('treatment')[['R','canopy_evap_mm','soil_evap_mm','irrigation_mm']].mean(); lab=[t.split('_')[0]+' '+t.split('_')[1] for t in g.index]
xx=np.arange(len(g)); ax=axs[0]; ax.bar(xx,g.R,color=CD,label='Unattributed $R$'); ax.bar(xx,g.canopy_evap_mm,bottom=g.R,color=CG,label='Canopy evaporation'); ax.set_xticks(xx); ax.set_xticklabels(lab,rotation=90,fontsize=6); ax.set_ylabel('mm yr$^{-1}$'); ax.legend(frameon=False,fontsize=6); panel(ax,'a',x=-0.2)
ax=axs[1]; e0=D[D.experiment=='E0_Baselines']; e9=D[D.experiment=='E9_Soil_Moisture_Rain']
ax.scatter(e9.rain_mm,e9.R,s=2,color='#9ecae1',alpha=0.5,label='E9 rainfed'); ax.scatter(e0.rain_mm,e0.R,s=30,color=CD,marker='D',label='E0 baselines (10 soils)')
b=np.polyfit(e9.rain_mm,e9.R,1); xs=np.linspace(e9.rain_mm.min(),e9.rain_mm.max(),10); ax.plot(xs,np.polyval(b,xs),color=CB,lw=1.2,label=f'$R$={b[1]:.0f}+{b[0]:.3f} rain (E9)')
ax.set_xlabel('Annual rain (mm)'); ax.set_ylabel('Unattributed term $R$ (mm yr$^{-1}$)'); ax.legend(frameon=False,fontsize=6); panel(ax,'b',x=-0.24)
fig.tight_layout(); save(fig,'fig03_hidden_term','p2'); print('R~rain E9',b)
# ---- Fig 4 clr PCA
parts=D[['transpiration_mm','soil_evap_mm','canopy_evap_mm','R','drainage_1m_mm']].clip(lower=1e-3); F=parts.div(parts.sum(axis=1),axis=0); L=np.log(F); clr=L.sub(L.mean(axis=1),axis=0)
pca=PCA(3).fit(clr.values); Z=pca.transform(clr.values)
fig,axs=plt.subplots(1,3,figsize=(7.4,2.6))
ax=axs[0]; ax.bar(range(1,4),100*pca.explained_variance_ratio_,color=CB); ax.set_xlabel('Component'); ax.set_ylabel('Variance explained (%)'); ax.set_xticks([1,2,3]); panel(ax,'a',x=-0.22)
for i,v in enumerate(100*pca.explained_variance_ratio_): ax.text(i+1,v+1,f'{v:.1f}',ha='center',fontsize=6.5)
n_=D.s.map(lambda s:VG[s][1]); ax=axs[1]; sc=ax.scatter(Z[:,0],Z[:,1],c=np.log(D.W/D.s.map(TAW)),s=2,cmap='viridis',alpha=0.6); cb=fig.colorbar(sc,ax=ax); cb.set_label('$\\ln(W/\\mathrm{TAW})$',fontsize=6.5)
ax.set_xlabel('PC1'); ax.set_ylabel('PC2'); panel(ax,'b',x=-0.22)
ax=axs[2]; load=pca.components_[:2].T; names=['T','Es','Ec','R','D']; 
for i,nm in enumerate(names): ax.arrow(0,0,load[i,0],load[i,1],head_width=0.03,color=CD); ax.text(load[i,0]*1.12,load[i,1]*1.12,nm,fontsize=7,ha='center')
ax.set_xlim(-0.7,1.0); ax.set_ylim(-0.8,1.0); ax.set_xlabel('PC1 loading'); ax.set_ylabel('PC2 loading'); ax.axhline(0,color='#ccc',lw=0.5); ax.axvline(0,color='#ccc',lw=0.5); panel(ax,'c',x=-0.22)
fig.tight_layout(); save(fig,'fig04_manifold','p2')
r_pc1=[stats.spearmanr(Z[:,0],f).statistic for f in [np.log(D.W/D.s.map(TAW)),n_,np.log(D.irrigation_mm+1)]] if False else None
from scipy import stats
print('PC1 corr with lnW/TAW, n, lnI:',[round(stats.spearmanr(Z[:,0],f).statistic,3) for f in [np.log(D.W/D.s.map(TAW)),n_,np.log1p(D.irrigation_mm)]])
json.dump(dict(evr=pca.explained_variance_ratio_.tolist(),load=pca.components_[:3].tolist()),open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_pca.json','w'))
