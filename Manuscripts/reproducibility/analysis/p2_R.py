import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from sklearn.model_selection import GroupKFold
from sklearn.ensemble import HistGradientBoostingRegressor as GB
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); out={}
D['Ep_']=D.Ep.fillna(1.0); D['P_']=D.P.fillna(1.0); D['dT_']=D.dT.fillna(0.0); D['vff_']=D.vff.fillna(0); D['cap_']=D.cap.fillna(0)
D['lnR']=np.log(D.R); D['lnEp']=np.log(D.Ep_); D['lnP']=np.log(D.P_); D['lnW']=np.log(D.W); D['lnI']=np.log1p(D.irrigation_mm)
D['lnrain']=np.log(D.rain_mm)
D['mulch']=D.vff_*D.cap_
print(D.groupby('experiment')[['Ep_','P_','dT_']].agg(lambda x:x.nunique()).T)
# candidate terms
T={'lnEp':D.lnEp,'lnP':D.lnP,'dT':D.dT_,'lnrain':D.lnrain,'lnI':D.lnI,'mulch':D.mulch,'cap':D.cap_,'vff':D.vff_,
   'lnTAW':np.log(D.s.map(TAW)),'n':D.s.map(lambda s:VG[s][1]),'lnalpha':np.log(D.s.map(lambda s:VG[s][0]))}
X=pd.DataFrame(T)
# forward stepwise by LOEO RMSE
y=D.lnR.values; g=D.experiment.values
def cv(cols):
    Xm=sm.add_constant(X[cols].values); errs=[]
    for tr,te in GroupKFold(17).split(Xm,y,g):
        b=np.linalg.lstsq(Xm[tr],y[tr],rcond=None)[0]; errs.append(((Xm[te]@b-y[te])**2))
    e=np.concatenate(errs); return np.sqrt(e.mean())
sel=[]; best=1e9; path=[]
while True:
    cand=[(cv(sel+[c]),c) for c in X.columns if c not in sel]
    if not cand: break
    s,c=min(cand)
    if s<best-0.002: best=s; sel.append(c); path.append((c,float(s))); print(c,round(s,4))
    else: break
m=sm.OLS(y,sm.add_constant(X[sel])).fit(); print(m.summary().tables[1]); print('R2',m.rsquared)
out['R_model']=dict(terms=sel,coef=m.params.to_dict(),se=m.bse.to_dict(),r2=float(m.rsquared),path=path,loeo_rmse_ln=float(best))
# back-transformed performance LOEO and GBM comparisons
def cvpred(model_fn,Xm):
    p=np.zeros(len(y))
    for tr,te in GroupKFold(17).split(Xm,y,g): p[te]=model_fn(Xm[tr],y[tr],Xm[te])
    return p
lin=lambda a,b,c: sm.add_constant(c,has_constant='add')@np.linalg.lstsq(sm.add_constant(a,has_constant='add'),b,rcond=None)[0]
pl=cvpred(lin,X[sel].values); 
gbf=lambda a,b,c: GB(max_iter=200,random_state=0).fit(a,b).predict(c)
pg=cvpred(gbf,X.values)
pg_sel=cvpred(gbf,X[sel].values)
R=D.R.values
for name,p in [('sparse',pl),('GBM_all',pg),('GBM_sel',pg_sel)]:
    pr=np.exp(p); print(name,'LOEO R2 (mm) %.3f RMSE %.1f mm; R2(ln) %.3f'%(1-((pr-R)**2).sum()/((R-R.mean())**2).sum(),np.sqrt(((pr-R)**2).mean()),1-((p-y)**2).sum()/((y-y.mean())**2).sum()))
    out['R_'+name]=dict(R2=float(1-((pr-R)**2).sum()/((R-R.mean())**2).sum()),rmse=float(np.sqrt(((pr-R)**2).mean())),R2ln=float(1-((p-y)**2).sum()/((y-y.mean())**2).sum()))
# LOSO
g2=D.s.values
p=np.zeros(len(y))
for tr,te in GroupKFold(10).split(X,y,g2): p[te]=lin(X[sel].values[tr],y[tr],X[sel].values[te])
out['R_sparse_LOSO_R2ln']=float(1-((p-y)**2).sum()/((y-y.mean())**2).sum()); print('LOSO R2ln',out['R_sparse_LOSO_R2ln'])
D['R_pred']=np.exp(pl)
D[['experiment','s','R','R_pred','Ep_','P_','dT_']].to_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_Rpred.pkl')
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_R.json','w'),indent=1,default=float)
