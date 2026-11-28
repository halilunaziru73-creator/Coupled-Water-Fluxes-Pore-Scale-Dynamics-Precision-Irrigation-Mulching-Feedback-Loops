import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json, warnings; warnings.filterwarnings('ignore'); from matplotlib import cm
import statsmodels.api as sm
from sklearn.model_selection import GroupKFold, LeaveOneGroupOut
from sklearn.ensemble import HistGradientBoostingRegressor as GB
from scipy import stats
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); E=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_et.json'))
CB='#0072B2'; CD='#D55E00'; CG='#009E73'
D['n']=D.s.map(lambda s:VG[s][1]); lnW=np.log(D.W); lnI1=np.log1p(D.irrigation_mm); y=np.log(D.ET_mm.values); g=D.experiment.values; gs=D.s.values
X=sm.add_constant(np.c_[lnW,D.n,lnI1])
def cvp(X,y,groups):
    p=np.zeros(len(y)); co=[]
    for tr,te in LeaveOneGroupOut().split(X,y,groups):
        b=np.linalg.lstsq(X[tr],y[tr],rcond=None)[0]; p[te]=X[te]@b; co.append(b)
    return p,np.array(co)
pE,cE=cvp(X,y,g); pS,cS=cvp(X,y,gs)
feat=['rain_mm','irrigation_mm','Ep','P','dT','n']; 
Dd=D.copy(); Dd['Ep']=Dd.Ep.fillna(1); Dd['P']=Dd.P.fillna(1); Dd['dT']=Dd.dT.fillna(0); Dd['mulch']=Dd.vff.fillna(0)*Dd.cap.fillna(0); Dd['lnTAW']=np.log(Dd.s.map(TAW)); Dd['lnalpha']=np.log(Dd.s.map(lambda s:VG[s][0]))
F=['rain_mm','irrigation_mm','W','Ep','dT','n','lnTAW','lnalpha','mulch']; Xg=Dd[F].values
def gb(groups):
    p=np.zeros(len(y))
    for tr,te in LeaveOneGroupOut().split(Xg,y,groups): p[te]=GB(max_iter=200,random_state=0).fit(Xg[tr],y[tr]).predict(Xg[te])
    return p
gE=gb(g); gS=gb(gs)
sc=lambda p:1-((p-y)**2).sum()/((y-y.mean())**2).sum()
print('sparse LOEO',sc(pE),'LOSO',sc(pS),'GBM LOEO',sc(gE),'LOSO',sc(gS))
res=dict(sparse_loeo=sc(pE),sparse_loso=sc(pS),gbm_loeo=sc(gE),gbm_loso=sc(gS),coef_mean=cE.mean(0).tolist(),coef_sd=cE.std(0).tolist(),coefS_mean=cS.mean(0).tolist(),coefS_sd=cS.std(0).tolist(),
  rmse_mm_loeo=float(np.sqrt(((np.exp(pE)-D.ET_mm.values)**2).mean())),mape_loeo=float(100*np.mean(np.abs(np.exp(pE)-D.ET_mm.values)/D.ET_mm.values)))
# per-experiment LOEO R2 / MAPE
rows=[]
for e in sorted(set(g)):
    m=g==e; o=D.ET_mm.values[m]; pr=np.exp(pE[m]); rows.append((e,m.sum(),100*np.mean(np.abs(pr-o)/o),np.mean(pr-o)))
res['by_exp']=rows
fig,axs=plt.subplots(2,3,figsize=(7.4,4.8))
for ax,p,t,L in zip(axs[0,:2],[pE,gE],['Sparse law (3 terms), LOEO','Gradient boosting, LOEO'],'ab'):
    ax.scatter(D.ET_mm,np.exp(p),s=1.5,alpha=0.3,color=CB); lim=[200,1100]; ax.plot(lim,lim,color='#999',lw=0.8); ax.set_xlim(lim); ax.set_ylim(lim); ax.set_xlabel('Daisy ET (mm yr$^{-1}$)'); ax.set_ylabel('Predicted ET'); ax.set_title(t+f'\n$R^2$(ln ET)={sc(p):.3f}',fontsize=7); panel(ax,L)
ax=axs[0,2]; names=['$\\ln W$','$n$','$\\ln(1+I)$']; cm_=cE[:,1:]; 
for i in range(3): ax.boxplot(cm_[:,i],positions=[i],widths=0.5,showfliers=True,flierprops=dict(markersize=2)); 
ax.set_xticks(range(3)); ax.set_xticklabels(names); ax.set_ylabel('Fitted coefficient across 17 LOEO folds'); panel(ax,'c')
ax=axs[1,0]; ex=[r[0] for r in rows]; ax.bar(range(len(ex)),[r[2] for r in rows],color='#9ecae1'); ax.set_xticks(range(len(ex))); ax.set_xticklabels([e.split('_')[0] for e in ex],rotation=90,fontsize=6); ax.set_ylabel('LOEO MAPE of ET (%)'); panel(ax,'d')
# law surface: ET vs W by soil n
ax=axs[1,1]; Wg=np.linspace(250,1100,100)
for n_,c_ in [(1.23,cm.viridis(1.0)),(1.6,cm.viridis(0.6)),(2.28,cm.viridis(0.25)),(2.68,cm.viridis(0.0))]:
    b=np.linalg.lstsq(X,y,rcond=None)[0]; ax.plot(Wg,np.exp(b[0]+b[1]*np.log(Wg)+b[2]*n_+b[3]*np.log1p(200)),color=c_,label=f'$n$={n_}')
ax.plot(Wg,Wg,color='#999',ls='--',lw=0.7); ax.set_xlabel('Water input $W$ (mm yr$^{-1}$)'); ax.set_ylabel('ET (mm yr$^{-1}$)'); ax.legend(frameon=False,fontsize=6); ax.set_title('Law at $I$=200 mm',fontsize=7); panel(ax,'e')
# closure-constrained drainage
Dp=D.W.values-np.exp(pE)-0  # D = W - ET - dS(=0)
ok=~D.experiment.isin(['E8_Rain_Intensity_Moisture','E9_Soil_Moisture_Rain']).values
o=D.drainage_1m_mm.values
ax=axs[1,2]; ax.scatter(o[ok],Dp[ok],s=1.5,alpha=0.3,color=CD); ax.plot([0,500],[0,500],color='#999',lw=0.8); ax.set_xlim(-20,500); ax.set_ylim(-300,500); ax.set_xlabel('Daisy drainage (mm yr$^{-1}$)'); ax.set_ylabel('$W-\\widehat{ET}$ (closure)'); 
r2=1-((Dp[ok]-o[ok])**2).sum()/((o[ok]-o[ok].mean())**2).sum(); rm=np.sqrt(((Dp[ok]-o[ok])**2).mean()); ax.set_title(f'Closure-derived drainage: $R^2$={r2:.2f}, RMSE={rm:.0f} mm',fontsize=6.5,loc='right'); panel(ax,'f',x=-0.22)
res['closureD']=dict(r2=float(r2),rmse=float(rm),n=int(ok.sum()),negshare=float((Dp[ok]<0).mean()))
fig.tight_layout(); save(fig,'fig05_ET_law','p2'); json.dump(res,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_etlaw.json','w'),default=float); print(res['closureD'],res['rmse_mm_loeo'],res['mape_loeo'])
