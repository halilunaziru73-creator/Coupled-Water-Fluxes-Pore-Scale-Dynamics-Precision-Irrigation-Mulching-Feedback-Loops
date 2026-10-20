"""Robustness of the ET law and of the closure term R to the exclusion of failed runs:
re-analysis with the most affected soil (S02) removed, and with S02 and S03 removed.
Reads the ensemble table produced by p2_a.py; writes out/p2_s02_excl.json."""
import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from sklearn.model_selection import GroupKFold
D0=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); ref=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_et.json'))['lnET']
terms=ref['terms']; out={'terms':terms,'full':{'loeo':ref['loeo'],'loso':ref['loso'],'coef':ref['coef']}}
def prep(D):
    D=D.copy(); D['Ep_']=D.Ep.fillna(1.0); D['dT_']=D.dT.fillna(0.0); D['n']=D.s.map(lambda s:VG[s][1]); D['TAW']=D.s.map(TAW)
    X=pd.DataFrame({'lnrain':np.log(D.rain_mm),'lnI1':np.log1p(D.irrigation_mm),'lnW':np.log(D.W),'lnEp':np.log(D.Ep_),'dT':D.dT_,'n':D.n,'lnTAW':np.log(D.TAW)})
    return D,X
for tag,drop in [('without_S02',['S02']),('without_S02_S03',['S02','S03'])]:
    D=D0[~D0.s.isin(drop)].reset_index(drop=True); D,X=prep(D)
    y=np.log(D.ET_mm.values); g=D.experiment.values; gs=D.s.values
    Xm=sm.add_constant(X[terms].values)
    def cv(groups):
        p=np.zeros(len(y)); ng=len(np.unique(groups))
        for tr,te in GroupKFold(ng).split(Xm,y,groups): p[te]=Xm[te]@np.linalg.lstsq(Xm[tr],y[tr],rcond=None)[0]
        return float(1-((p-y)**2).sum()/((y-y.mean())**2).sum())
    m=sm.OLS(y,Xm).fit()
    R=D.ET_mm-(D.transpiration_mm+D.soil_evap_mm+D.canopy_evap_mm)
    out[tag]=dict(n_runs=int(len(D)),loeo=cv(g),loso=cv(gs),coef=dict(zip(['const']+terms,[float(v) for v in m.params])),
                  R_mean=float(R.mean()),R_share_of_ET=float(R.sum()/D.ET_mm.sum()))
R=D0.ET_mm-(D0.transpiration_mm+D0.soil_evap_mm+D0.canopy_evap_mm); out['full']['R_mean']=float(R.mean()); out['full']['R_share_of_ET']=float(R.sum()/D0.ET_mm.sum())
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_s02_excl.json','w'),indent=1)
print(json.dumps(out,indent=1))
