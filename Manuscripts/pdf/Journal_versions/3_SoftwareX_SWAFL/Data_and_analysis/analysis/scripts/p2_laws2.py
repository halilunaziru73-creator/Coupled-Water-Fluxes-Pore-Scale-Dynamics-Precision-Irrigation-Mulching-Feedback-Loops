import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
import statsmodels.api as sm
from scipy import stats
D=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl'); out={}
# --- compensation law (single-soil lattices)
rows=[]
for ex in ['E11_Temp_Evap_Rain','E12_Sensor_Trigger_Rain','E14_Mulch_Rain']:
    x=D[D.experiment==ex]
    X=sm.add_constant(x[['rain_mm']]); 
    r=dict(exp=ex,n=len(x))
    for t in ['irrigation_mm','ET_mm','drainage_1m_mm','W']:
        m=sm.OLS(x[t],X).fit(); r[t+'_slope']=m.params['rain_mm']; r[t+'_se']=m.bse['rain_mm']
    rows.append(r)
# E16 paired P effect per soil (all else equal)
e=e16(); f=['fT','fh','fD','fN','fEp']
lo=e[e.fP==0.5].set_index(['s']+f); hi=e[e.fP==1.5].set_index(['s']+f)
j=lo.join(hi,lsuffix='_lo',rsuffix='_hi',how='inner')
j['dRain']=j.rain_mm_hi-j.rain_mm_lo
for t in ['irrigation_mm','ET_mm','drainage_1m_mm']: j['d'+t]=j[t+'_hi']-j[t+'_lo']
j=j.reset_index()
comp16=j.groupby('s').apply(lambda x: pd.Series(dict(kappa=-x.dirrigation_mm.sum()/x.dRain.sum(),dET=x.dET_mm.sum()/x.dRain.sum(),dD=x.ddrainage_1m_mm.sum()/x.dRain.sum(),n=len(x))))
print(pd.DataFrame(rows).round(3)); print(comp16.round(3))
out['comp_lattice']=rows; out['comp16']=comp16.to_dict('index')
# bootstrap CI for E16 kappa pooled
def kap(x): return -x.dirrigation_mm.sum()/x.dRain.sum()
bs=[kap(j.sample(len(j),replace=True,random_state=i)) for i in range(500)]
out['kappa16_pool']=dict(est=kap(j),lo=float(np.percentile(bs,2.5)),hi=float(np.percentile(bs,97.5)))
print(out['kappa16_pool'])
# does compensation depend on Ep? on T? 
j['kap_pair']=-j.dirrigation_mm/j.dRain
print(j.groupby('fEp').kap_pair.mean().round(3).to_dict(), j.groupby('fT').kap_pair.mean().round(3).to_dict(),j.groupby('fh').kap_pair.mean().round(3).to_dict(),j.groupby('fD').kap_pair.mean().round(3).to_dict())
out['kap_by']={k:j.groupby(k).kap_pair.mean().round(4).to_dict() for k in ['fEp','fT','fh','fD']}
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_laws2.json','w'),indent=1,default=float)
j.to_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_pairsP.pkl')
