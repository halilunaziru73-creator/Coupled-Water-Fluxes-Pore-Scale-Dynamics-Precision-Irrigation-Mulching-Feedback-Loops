import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from scipy import stats
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); out={}
rng=np.random.default_rng(1)
# ---- 1. SVD bootstrap on the 4-flux subsystem and 7-flux system
cols=['rain_mm','irrigation_mm','ET_mm','drainage_1m_mm']
def nullvec(M):
    sc=np.sqrt((M**2).mean(0)); U,S,Vt=np.linalg.svd(M/sc,full_matrices=False); v=Vt[-1]/sc; v=v/v[2]*-1; return v,S
v,S=nullvec(D[cols].values); print('4-flux null',v.round(3),S.round(2))
B=[]
for b in range(500):
    i=rng.integers(0,len(D),len(D)); B.append(nullvec(D[cols].values[i])[0])
B=np.array(B); out['svd4']=dict(vec=v.tolist(),lo=np.percentile(B,2.5,0).tolist(),hi=np.percentile(B,97.5,0).tolist(),sv=S.tolist())
print('CI',np.percentile(B,2.5,0).round(3),np.percentile(B,97.5,0).round(3))
# null control: column-wise permutation
Mp=D[cols].values.copy(); 
for j in range(4): Mp[:,j]=rng.permutation(Mp[:,j])
out['svd4_perm_minSV']=float(nullvec(Mp)[1][-1]); print('perm minSV',out['svd4_perm_minSV'],'real',S[-1])
# subsets excluding E8/E9 (non-stationary initial conditions)
ok=~D.experiment.isin(['E8_Rain_Intensity_Moisture','E9_Soil_Moisture_Rain'])
v2,S2=nullvec(D.loc[ok,cols].values); print('without E8/E9',v2.round(4),S2.round(2)); out['svd4_noE89']=dict(vec=v2.tolist(),sv=S2.tolist())
# closure stats
D['dSrel']=D.dS/D.W
out['closure']=dict(all_median_abs=float(D.dSrel.abs().median()),p95=float(D.dSrel.abs().quantile(.95)),
   noE89_median=float(D.loc[ok,'dSrel'].abs().median()),noE89_p95=float(D.loc[ok,'dSrel'].abs().quantile(.95)),
   E89_median=float(D.loc[~ok,'dSrel'].abs().median()))
print(out['closure'])
# ---- 2. compensation law
rows=[]
for ex in ['E11_Temp_Evap_Rain','E12_Sensor_Trigger_Rain','E14_Mulch_Rain']:
    e=D[D.experiment==ex]
    for lab,x in [(ex,e)]:
        b=np.polyfit(x.rain_mm,x.irrigation_mm,1)[0]; bet=np.polyfit(x.rain_mm,x.ET_mm,1)[0]; bd=np.polyfit(x.rain_mm,x.drainage_1m_mm,1)[0]
        rows.append(dict(exp=ex,soil='S01',dI_dP=b,dET_dP=bet,dD_dP=bd,n=len(x)))
e16=e16() if False else None
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_laws.json','w'),indent=1,default=float)
