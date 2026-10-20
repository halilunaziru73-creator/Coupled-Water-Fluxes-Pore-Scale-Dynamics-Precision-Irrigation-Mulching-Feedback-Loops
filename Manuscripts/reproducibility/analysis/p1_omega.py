import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
import json
from scipy import stats
e=e16(); f=['fP','fT','fh','fD','fN']
lo=e[e.fEp==0.3].set_index(['s']+f); hi=e[e.fEp==1.2].set_index(['s']+f)
j=lo.join(hi,lsuffix='_lo',rsuffix='_hi',how='inner')
j['dEnt']=j.Ent_lo-j.Ent_hi  # savings when Ep low? sign check below
j['dDr']=j.drainage_1m_mm_hi-j.drainage_1m_mm_lo
j['dET']=j.ET_mm_hi-j.ET_mm_lo
j['dEnt']=j.Ent_hi-j.Ent_lo
j['dTr']=j.transpiration_mm_hi-j.transpiration_mm_lo
j['dStor']=(j.draw_hi-j.draw_lo)
j=j.reset_index()
print(len(j)); print(j.groupby('s')[['dEnt','dDr','dTr','dStor']].mean().round(1))
# psi_D = -dDr/dEnt (extra evaporation costs drainage)
j['psi']=-j.dDr/j.dEnt
out={}
for fac in f:
    g=j[j.dEnt.abs()>5].groupby(['s',fac]).apply(lambda x:-x.dDr.sum()/x.dEnt.sum()).unstack()
    print(fac);print(g.round(2))
    out[fac]=g.round(3).to_dict()
j.to_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_pairs.pkl')
# Omega = psi_D / (psi at reference); warming effect on psi
a=j[j.dEnt.abs()>5].groupby(['s','fT']).apply(lambda x:-x.dDr.sum()/x.dEnt.sum()).unstack()
print(a.round(2)); 
