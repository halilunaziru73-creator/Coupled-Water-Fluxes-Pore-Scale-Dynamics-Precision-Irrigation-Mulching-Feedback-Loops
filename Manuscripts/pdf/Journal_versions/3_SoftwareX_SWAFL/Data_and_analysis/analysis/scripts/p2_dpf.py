import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings, itertools; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from sklearn.model_selection import GroupKFold
from sklearn.ensemble import HistGradientBoostingRegressor as GB
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); out={}
D['Ep_']=D.Ep.fillna(1.0); D['P_']=D.P.fillna(1.0); D['dT_']=D.dT.fillna(0.0)
D['n']=D.s.map(lambda s:VG[s][1]); D['alpha']=D.s.map(lambda s:VG[s][0]); D['TAW']=D.s.map(TAW)
D['mulch']=D.vff.fillna(0)*D.cap.fillna(0)
D['dpf']=(D.drainage_1m_mm/D.W).clip(lower=1e-4)
D['y']=np.log(D.dpf)  # log-DPF
# dimensionless library
L={'lnW_TAW':np.log(D.W/D.TAW),'lnEp':np.log(D.Ep_),'lnP':np.log(D.P_),'dT':D.dT_,'n':D.n,'lnalpha':np.log(D.alpha),'lnTAW':np.log(D.TAW),
   'Ifrac':D.irrigation_mm/D.W,'lnW':np.log(D.W),'mulch':D.mulch,'lnRfrac':np.log(D.R/D.W),'lnTfrac':np.log(D.transpiration_mm/D.W)}
X=pd.DataFrame(L); y=D.y.values; g=D.experiment.values; gs=D.s.values
def cvr(cols,groups,k):
    Xm=sm.add_constant(X[cols].values); p=np.zeros(len(y))
    for tr,te in GroupKFold(k).split(Xm,y,groups): p[te]=Xm[te]@np.linalg.lstsq(Xm[tr],y[tr],rcond=None)[0]
    return p
def score(p): return 1-((p-y)**2).sum()/((y-y.mean())**2).sum()
for lab,lib in [('exogenous',['lnW_TAW','lnEp','lnP','dT','n','lnalpha','lnTAW','Ifrac','lnW','mulch']),('with_partition',list(X.columns))]:
    sel=[]; best=-9; hist=[]
    while True:
        c=[(score(cvr(sel+[a],g,17)),a) for a in lib if a not in sel]
        if not c: break
        s,a=max(c)
        if s>best+0.003: best=s; sel.append(a); hist.append((a,float(s)))
        else: break
    p1=cvr(sel,g,17); p2=cvr(sel,gs,10)
    m=sm.OLS(y,sm.add_constant(X[sel])).fit()
    print(lab,hist,'LOEO %.3f LOSO %.3f in-sample %.3f'%(score(p1),score(p2),m.rsquared)); print(m.params.round(3).to_dict())
    out[lab]=dict(terms=sel,hist=hist,loeo=float(score(p1)),loso=float(score(p2)),r2=float(m.rsquared),coef=m.params.to_dict(),se=m.bse.to_dict())
    pg=np.zeros(len(y))
    for tr,te in GroupKFold(17).split(X,y,g): pg[te]=GB(max_iter=250,random_state=0).fit(X[lib].values[tr],y[tr]).predict(X[lib].values[te])
    out[lab]['gbm_loeo']=float(score(pg)); print('GBM LOEO',score(pg))
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_dpf.json','w'),indent=1,default=float)
