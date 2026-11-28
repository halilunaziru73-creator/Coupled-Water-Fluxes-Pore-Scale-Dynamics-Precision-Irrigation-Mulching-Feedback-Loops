import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json
from matplotlib import cm
from scipy import stats
J=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_core.json')); Tn=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
order=sorted(SOIL_N,key=lambda s:-VG[s][1]); col={s:cm.viridis(i/9) for i,s in enumerate(order)}
j=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_pairs.pkl')
# Fig 7: stratified psiD
fig,axs=plt.subplots(1,4,figsize=(7.6,2.6),sharey=True)
facs=[('fP','Rain scale $P$'),('fT','Warming (+°C)'),('fh','Trigger suction (cm)'),('fD','Dose (mm)')]
for ax,(f,lab),L in zip(axs,facs,'abcd'):
    g=j[j.dEnt.abs()>5].groupby(['s',f]).apply(lambda x:-x.dDr.sum()/x.dEnt.sum()).unstack()
    lv=list(g.columns)
    for s in order:
        if s in g.index and g.loc[s].notna().sum()==2: ax.plot(range(2),g.loc[s].values,marker='o',ms=3,color=col[s],lw=1)
    ax.set_xticks(range(2)); ax.set_xticklabels([f'{v:g}' for v in lv]); ax.set_xlabel(lab); ax.set_xlim(-0.3,1.3); panel(ax,L,x=-0.2)
axs[0].set_ylabel('$\\psi_D$ (drainage share of evaporation change)')
sm=cm.ScalarMappable(cmap='viridis',norm=plt.Normalize(1.23,2.68)); cb=fig.colorbar(sm,ax=axs,fraction=0.02,pad=0.01); cb.set_label('$n$',fontsize=7)
fig.savefig(__import__('os').environ.get('SWAFL_MS','.')+'/fig/p1/fig07_modifiers.png'); fig.savefig(__import__('os').environ.get('SWAFL_MS','.')+'/fig/p1/fig07_modifiers.pdf'); plt.close(fig)
# modifier statistics (paired Wilcoxon over soils)
out={}
for f in ['fP','fT','fh','fD','fN']:
    g=j[j.dEnt.abs()>5].groupby(['s',f]).apply(lambda x:-x.dDr.sum()/x.dEnt.sum()).unstack().dropna()
    d_=g.iloc[:,1]-g.iloc[:,0]; out[f]=dict(mean=float(d_.mean()),pos=int((d_>0).sum()),n=int(len(d_)),p=float(stats.wilcoxon(d_).pvalue))
print(out); json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_modifiers.json','w'))
# Fig 8: replication
fig,axs=plt.subplots(1,3,figsize=(7.4,2.6))
phi=Tn.phiD_E9; p16=Tn.psiD_E16; p7=Tn.psiD_E7
for ax,(a,b,la,lb),L in zip(axs,[(phi,p16,'$\\phi_D$ (E9)','$\\psi_D$ (E16)'),(phi,p7,'$\\phi_D$ (E9)','$\\psi_D$ (E7)'),(p16,p7,'$\\psi_D$ (E16)','$\\psi_D$ (E7)')],'abc'):
    for s in SOIL_N: ax.scatter(a[s],b[s],color=col[s],s=32,edgecolor='#333',linewidth=0.5,zorder=3)
    r=stats.spearmanr(a,b); ax.set_xlabel(la); ax.set_ylabel(lb); ax.text(0.05,0.88,f'$\\rho$={r.statistic:.2f}',transform=ax.transAxes,fontsize=7); panel(ax,L,x=-0.2)
fig.tight_layout(); save(fig,'fig08_replication','p1')
# Fig 9: recoverable water per 100 mm evaporation saving
fig,ax=plt.subplots(figsize=(4.2,2.8)); x=np.arange(10)
pD=np.array([min(1,Tn.loc[s,'phiD_E9']) for s in order]); 
ax.bar(x,100*(1-pD),color='#009E73',label='Retained in root zone / transpired / irrigation avoided'); ax.bar(x,100*pD,bottom=100*(1-pD),color='#D55E00',label='Lost to drainage')
ax.set_xticks(x); ax.set_xticklabels(order,rotation=90); ax.set_ylabel('mm per 100 mm of water retained (E9 basis)'); ax.legend(frameon=False,fontsize=6,loc='upper center',bbox_to_anchor=(0.5,-0.3))
save(fig,'fig09_recoverable','p1')
print('done')
