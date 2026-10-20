import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from sklearn.model_selection import GroupKFold
from sklearn.ensemble import HistGradientBoostingRegressor as GB
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); out={}
D['Ep_']=D.Ep.fillna(1.0); D['P_']=D.P.fillna(1.0); D['dT_']=D.dT.fillna(0.0)
D['n']=D.s.map(lambda s:VG[s][1]); D['TAW']=D.s.map(TAW); D['alpha']=D.s.map(lambda s:VG[s][0])
D['mulch']=D.vff.fillna(0)*D.cap.fillna(0)
L={'lnrain':np.log(D.rain_mm),'lnI1':np.log1p(D.irrigation_mm),'lnW':np.log(D.W),'lnEp':np.log(D.Ep_),'dT':D.dT_,'n':D.n,'lnTAW':np.log(D.TAW),'lnalpha':np.log(D.alpha),'mulch':D.mulch,'Ifrac':D.irrigation_mm/D.W,'lnW_TAW':np.log(D.W/D.TAW)}
X=pd.DataFrame(L); g=D.experiment.values; gs=D.s.values
def run(target,yv,lib,tag):
    y=yv
    def cvp(cols,groups,k):
        Xm=sm.add_constant(X[cols].values); p=np.zeros(len(y))
        for tr,te in GroupKFold(k).split(Xm,y,groups): p[te]=Xm[te]@np.linalg.lstsq(Xm[tr],y[tr],rcond=None)[0]
        return p
    sc=lambda p:1-((p-y)**2).sum()/((y-y.mean())**2).sum()
    sel=[];best=-9;hist=[]
    while True:
        c=[(sc(cvp(sel+[a],g,17)),a) for a in lib if a not in sel]
        if not c:break
        s,a=max(c)
        if s>best+0.003: best=s;sel.append(a);hist.append((a,float(s)))
        else:break
    m=sm.OLS(y,sm.add_constant(X[sel])).fit()
    pg=np.zeros(len(y)); pgs=np.zeros(len(y))
    for tr,te in GroupKFold(17).split(X,y,g): pg[te]=GB(max_iter=250,random_state=0).fit(X[lib].values[tr],y[tr]).predict(X[lib].values[te])
    for tr,te in GroupKFold(10).split(X,y,gs): pgs[te]=GB(max_iter=250,random_state=0).fit(X[lib].values[tr],y[tr]).predict(X[lib].values[te])
    r=dict(terms=sel,hist=hist,loeo=float(sc(cvp(sel,g,17))),loso=float(sc(cvp(sel,gs,10))),r2=float(m.rsquared),coef=m.params.to_dict(),se=m.bse.to_dict(),gbm_loeo=float(sc(pg)),gbm_loso=float(sc(pgs)),
           rmse_loeo=float(np.sqrt(((cvp(sel,g,17)-y)**2).mean())))
    print(tag,r['terms'],'sparse LOEO %.3f LOSO %.3f | GBM LOEO %.3f LOSO %.3f'%(r['loeo'],r['loso'],r['gbm_loeo'],r['gbm_loso'])); print(m.params.round(3).to_dict())
    out[tag]=r
lib=['lnrain','lnI1','lnW','lnEp','dT','n','lnTAW','lnalpha','mulch','Ifrac','lnW_TAW']
run('ET',np.log(D.ET_mm.values),lib,'lnET')
run('T',np.log(D.transpiration_mm.values),lib,'lnT')
run('Es',np.log(D.soil_evap_mm.values),lib,'lnEs')
run('Ec',np.log(D.canopy_evap_mm.values),lib,'lnEc')
run('yield',np.log(D.yield_Mg_ha.clip(lower=0.05).values),lib,'lnY')
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_et.json','w'),indent=1,default=float)
