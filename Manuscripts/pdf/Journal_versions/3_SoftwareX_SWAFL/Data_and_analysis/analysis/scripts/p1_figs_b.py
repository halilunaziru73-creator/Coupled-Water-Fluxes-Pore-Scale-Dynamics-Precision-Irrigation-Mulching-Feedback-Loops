import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json
from matplotlib import cm
from scipy import stats, optimize
J=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_core.json')); Tn=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
M=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_mech.json'))
order=sorted(SOIL_N,key=lambda s:-VG[s][1]); col={s:cm.viridis(i/9) for i,s in enumerate(order)}
KS={'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}
CD='#D55E00'; CB='#0072B2'; CG='#009E73'; CY='#E69F00'
# Fig 4: fate stacked bars
fig,ax=plt.subplots(1,3,figsize=(7.4,2.9))
x=np.arange(10)
fD=np.array([J['memory'][s]['fD'] for s in order]); fT=np.array([J['memory'][s]['fT'] for s in order]); fE=np.array([J['memory'][s]['fE'] for s in order]); fO=np.array([J['memory'][s]['fO'] for s in order])
ax[0].bar(x,fD,color=CD,label='Drainage'); ax[0].bar(x,fT,bottom=fD,color=CG,label='Transpiration'); ax[0].bar(x,fE,bottom=fD+fT,color=CB,label='Soil evaporation'); ax[0].bar(x,fO,bottom=fD+fT+fE,color=CY,label='Other evaporation')
ci=np.array([J['memory'][s]['ci']['drainage_1m_mm'] for s in order]); ax[0].errorbar(x,fD,yerr=[fD-ci[:,0],ci[:,1]-fD],fmt='none',ecolor='#333',capsize=1.5,lw=0.7)
ax[0].set_xticks(x); ax[0].set_xticklabels(order,rotation=90); ax[0].set_ylabel('Share of released\nstorage ($\\phi$)',fontsize=7); ax[0].set_title('E9: fate of antecedent storage',fontsize=8); ax[0].legend(frameon=False,fontsize=6,loc='upper center',bbox_to_anchor=(0.5,-0.28),ncol=2); ax[0].set_ylim(0,1.02); panel(ax[0],'a',x=-0.24)
pD=np.array([J['rec16'][s]['psiD'] for s in order]); pI=np.array([J['rec16'][s]['psiI'] for s in order]); pT=np.array([J['rec16'][s]['psiT'] for s in order]); pS=np.array([J['rec16'][s]['psiS'] for s in order])
w=0.38; ax[1].bar(x-w/2,pD,w,color=CD,label='Drainage $\\psi_D$'); ax[1].bar(x+w/2,pI,w,color=CB,label='Irrigation $\\psi_I$')
ci=np.array([J['rec16'][s]['ci']['psiD'] for s in order]); ax[1].errorbar(x-w/2,pD,yerr=[pD-ci[:,0],ci[:,1]-pD],fmt='none',ecolor='#333',capsize=1.5,lw=0.7)
ax[1].axhline(0,color='#666',lw=0.5); ax[1].set_xticks(x); ax[1].set_xticklabels(order,rotation=90); ax[1].set_ylabel('Fate per mm of\nextra evaporation',fontsize=7); ax[1].set_title('E16: evaporation-factor contrast',fontsize=8); ax[1].set_ylim(-0.5,2.0); ax[1].legend(frameon=False,fontsize=6,loc='upper right'); panel(ax[1],'b',x=-0.24)
m=np.array([J['rec7'][s]['psiD'] for s in order]); ci=np.array([J['rec7'][s]['ciD'] for s in order])
ax[2].bar(x,m,color=CD); ax[2].errorbar(x,m,yerr=[m-ci[:,0],ci[:,1]-m],fmt='none',ecolor='#333',capsize=1.5,lw=0.7)
ax[2].set_xticks(x); ax[2].set_xticklabels(order,rotation=90); ax[2].set_ylabel('Drainage share of\nmulch saving ($\\psi_D$)',fontsize=7); ax[2].set_title('E7: mulch contrast',fontsize=8); panel(ax[2],'c',x=-0.24)
fig.tight_layout(w_pad=1.4); save(fig,'fig04_fates','p1')
# Fig 5: predictors of phi_D
phi=Tn.phiD_E9
fig,axs=plt.subplots(2,2,figsize=(7.0,5.4))
preds=[('n','van Genuchten $n$'),('logK','$\\log_{10}K_s$ (cm d$^{-1}$, 8 soils)'),('TAW','TAW$_{100}$ (mm)'),('Se100','$S_e$ at 100 cm')]
for ax,(k,lab),L in zip(axs.ravel(),preds,'abcd'):
    if k=='logK': xs={s:np.log10(KS[s]) for s in KS}
    elif k=='n': xs={s:VG[s][1] for s in SOIL_N}
    elif k=='TAW': xs={s:TAW[s] for s in SOIL_N}
    else: xs={s:Tn.loc[s,'Se100'] for s in SOIL_N}
    ss=list(xs); xv=np.array([xs[s] for s in ss]); yv=np.array([phi[s] for s in ss])
    for s,a,b in zip(ss,xv,yv): ax.scatter(a,b,color=col[s],s=36,edgecolor='#333',linewidth=0.5,zorder=3); pass
    r=stats.spearmanr(xv,yv); ax.set_xlabel(lab); ax.set_ylabel('$\\phi_D$ (E9)'); panel(ax,L)
    ax.margins(x=0.12,y=0.12)
    ax.text(0.04 if r.statistic>0 else 0.96,0.95,f'Spearman $\\rho$={r.statistic:.2f}, n={len(ss)}',transform=ax.transAxes,fontsize=6.5,ha='left' if r.statistic>0 else 'right',va='top')
    fig.canvas.draw(); placed=[]
    pts=[ax.transData.transform((a,b)) for a,b in zip(xv,yv)]
    dpi=fig.dpi/72
    for s,(px,py) in sorted(zip(ss,pts),key=lambda t:-t[1][1]):
        for dx,dy in [(4,3),(4,-9),(-17,3),(-17,-9),(4,11),(-17,11),(4,-17)]:
            x0,y0=px+dx*dpi,py+dy*dpi; bb=(x0,y0,x0+16*dpi,y0+7*dpi)
            if all(bb[2]<q[0] or bb[0]>q[2] or bb[3]<q[1] or bb[1]>q[3] for q in placed) and all(not(bb[0]<=p[0]<=bb[2] and bb[1]<=p[1]<=bb[3]) for p in pts): break
        placed.append(bb); ax.annotate(s,(xv[ss.index(s)],yv[ss.index(s)]),xytext=(dx,dy),textcoords='offset points',fontsize=6)
fig.tight_layout(); save(fig,'fig05_predictors','p1')
# Fig 6: rate-competition
fig,axs=plt.subplots(1,3,figsize=(7.4,2.7))
K=np.array([KS[s] for s in KS]); y=np.array([phi[s] for s in KS]); q=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_rate_law.json'))['q_star_cm_d']
Kg=np.logspace(-0.2,3.1,200); ax=axs[0]; ax.semilogx(Kg,Kg/(Kg+q),color=CD,label='$\\phi_D=K_s/(K_s+q^*)$, $q^*$=71 cm d$^{-1}$')
for s in KS: ax.scatter(KS[s],phi[s],color=col[s],s=34,edgecolor='#333',linewidth=0.5,zorder=3)
for s,k_ in [('S01',2.1),('S02',25.8)]: ax.scatter(k_,phi[s],marker='x',color='#666',s=30,zorder=3); ax.annotate(s+' (implied)',(k_,phi[s]),xytext=(3,4),textcoords='offset points',fontsize=5.5)
ax.set_xlabel('$K_s$ (cm d$^{-1}$)'); ax.set_ylabel('$\\phi_D$'); ax.legend(frameon=False,fontsize=5.8,loc='upper left'); panel(ax,'a',x=-0.22)
f=lambda p,K: K/(K+10**p); pe=[]
for k in range(8):
    tr=[i for i in range(8) if i!=k]; rr=optimize.minimize_scalar(lambda p: ((f(p,K[tr])-y[tr])**2).sum(),bounds=(-2,4),method='bounded'); pe.append(f(rr.x,K[k]))
pe=np.array(pe); ax=axs[1]; ax.plot([0,1],[0,1],color='#999',lw=0.8,ls='--')
for s,a,b in zip(KS,y,pe): ax.scatter(a,b,color=col[s],s=34,edgecolor='#333',linewidth=0.5); ax.annotate(s,(a,b),xytext=(3,2),textcoords='offset points',fontsize=6)
rm=np.sqrt(((pe-y)**2).mean()); ax.set_xlabel('Observed $\\phi_D$'); ax.set_ylabel('Leave-one-soil-out prediction'); ax.text(0.05,0.88,f'RMSE={rm:.3f}',transform=ax.transAxes,fontsize=6.5); panel(ax,'b',x=-0.22)
# Fig6c: LOSO RMSE comparison from p1_stats (re-derive)
def loso(xv,yv,deg=1):
    e=[]
    for k in range(len(yv)):
        tr=[i for i in range(len(yv)) if i!=k]; c=np.polyfit(xv[tr],yv[tr],deg); e.append(np.clip(np.polyval(c,xv[k]),0,1)-yv[k])
    return np.sqrt(np.mean(np.square(e)))
allS=SOIL_N; yy=np.array([phi[s] for s in allS]); res={}
res['TAW']=loso(np.array([TAW[s] for s in allS],float),yy); res['$S_e$(100)']=loso(Tn.Se100.values,yy); res['$n$']=loso(np.array([VG[s][1] for s in allS]),yy)
res['$\\log K_s$*']=rm
res['mean only']=np.sqrt(np.mean([(yy[np.arange(10)!=k].mean()-yy[k])**2 for k in range(10)]))
ax=axs[2]; names=list(res); vals=[res[k] for k in names]; ax.barh(names,vals,color=[CB if '*' not in k else CD for k in names]); ax.set_xlabel('LOSO RMSE of $\\phi_D$'); ax.invert_yaxis(); panel(ax,'c',x=-0.3)
ax.text(0.98,0.04,'* 8 soils',transform=ax.transAxes,fontsize=6,ha='right')
fig.tight_layout(); save(fig,'fig06_mechanism','p1'); json.dump(res,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_loso_summary.json','w'))
print(res)
