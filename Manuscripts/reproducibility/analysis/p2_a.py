import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json
d['R']=d.ET_mm-d.transpiration_mm-d.soil_evap_mm-d.canopy_evap_mm
d['W']=d.rain_mm+d.irrigation_mm
d['dS']=d.W-d.ET_mm-d.drainage_1m_mm
out={}
# 1. SVD invariant search on uncentred flux matrix
cols=['rain_mm','irrigation_mm','ET_mm','transpiration_mm','soil_evap_mm','canopy_evap_mm','drainage_1m_mm']
M=d[cols].values; sc=np.sqrt((M**2).mean(0)); Ms=M/sc
U,S,Vt=np.linalg.svd(Ms,full_matrices=False)
print('singular values',S.round(3))
res=[]
for k in range(1,4):
    v=Vt[-k]/sc; v=v/np.abs(v).max(); print('null',k,dict(zip(cols,v.round(3))), 'rel resid',(np.linalg.norm(Ms@Vt[-k])/np.linalg.norm(Ms)).round(4))
    res.append(dict(k=k,sv=float(S[-k]),vec=dict(zip(cols,[float(x) for x in v]))))
out['svd']=dict(sv=S.tolist(),null=res)
# sparse (thresholded) invariant candidates and their residuals
def relres(c):  # c dict col->coef
    r=sum(M[:,cols.index(k)]*v for k,v in c.items()); return float(np.sqrt((r**2).mean())), float(np.median(np.abs(r))), float(np.percentile(np.abs(r),95))
cand={'balance (W-ET-D)':{'rain_mm':1,'irrigation_mm':1,'ET_mm':-1,'drainage_1m_mm':-1},
      'ET partition (ET-T-Es-Ec)':{'ET_mm':1,'transpiration_mm':-1,'soil_evap_mm':-1,'canopy_evap_mm':-1}}
for k,c in cand.items(): out[k]=relres(c); print(k,out[k])
# relative balance residual by experiment & soil
d['dSrel']=d.dS/d.W
print(d.groupby('experiment').dSrel.agg(['mean','median',lambda x:x.abs().quantile(.95)]).round(3))
print(d.groupby('s').dS.agg(['mean','median']).round(1))
# 2. R share
d['Rshare']=d.R/d.ET_mm; print(d.Rshare.describe())
print(d.groupby('experiment').Rshare.mean().round(2))
# 3. partition manifold: compositional parts normalised by W
parts=d[['transpiration_mm','soil_evap_mm','canopy_evap_mm','R','drainage_1m_mm']].clip(lower=1e-3)
F=parts.div(parts.sum(1),axis=0)
L=np.log(F); clr=L.sub(L.mean(1),axis=0)
from sklearn.decomposition import PCA
p=PCA().fit(clr.values); print('clr PCA var',p.explained_variance_ratio_.round(4)); out['clrpca']=p.explained_variance_ratio_.tolist()
print('comp loadings');print(pd.DataFrame(p.components_[:3],columns=parts.columns).round(2))
out['clr_load']=pd.DataFrame(p.components_[:3],columns=parts.columns).round(3).to_dict()
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_a.json','w'),indent=1,default=float)
d.to_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl')
