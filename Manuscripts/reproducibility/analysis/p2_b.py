import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
d=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/d2.pkl')
from sklearn.ensemble import HistGradientBoostingRegressor as GB
from sklearn.model_selection import GroupKFold, cross_val_predict
d['alpha']=d.s.map(lambda s:VG[s][0]); d['n']=d.s.map(lambda s:VG[s][1]); d['TAW']=d.s.map(TAW)
d['Wfrac_irr']=d.irrigation_mm/d.W
d['Ep_']=d.Ep.fillna(1.0); d['P_']=d.P.fillna(1.0); d['dT_']=d.dT.fillna(0)
feats=['alpha','n','TAW','rain_mm','irrigation_mm','Ep_','P_','dT_','Nrate']
d['Nrate']=d.Nrate.fillna(0)
d['dpf']=d.drainage_1m_mm/d.W
for tgt in ['dpf','ET_mm','yield_Mg_ha']:
    y=d[tgt].values
    for gname,g in [('LOSO',d.s.values),('LOEO',d.experiment.values)]:
        p=cross_val_predict(GB(max_iter=200,random_state=0),d[feats].values,y,groups=g,cv=GroupKFold(10))
        print(tgt,gname,'R2 %.3f RMSE %.3f'%(1-((p-y)**2).sum()/((y-y.mean())**2).sum(),np.sqrt(((p-y)**2).mean())))
