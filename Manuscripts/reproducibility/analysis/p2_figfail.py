import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
import pandas as pd, numpy as np
from figstyle import *
d=pd.read_pickle(__import__('os').environ.get('SWAFL_MS','.')+'/data.pkl'); d['s']=d.soil.str[:3]; d['f']=d.valid!=1
fig,ax=plt.subplots(2,2,figsize=(6.4,5.0)); a,b,c,e=ax.ravel()
g=d.groupby('s').f.agg(['sum','count']); r=100*g['sum']/g['count']
a.bar(range(10),r.values,color=['#D55E00' if v>0 else '#999' for v in r.values])
for i,(v,n) in enumerate(zip(r.values,g['sum'].values)): a.text(i,v+0.8,str(n) if n else '0',ha='center',fontsize=6.5)
a.set_xticks(range(10)); a.set_xticklabels(r.index,fontsize=6.5); a.set_ylabel('Failed runs (%)'); a.set_ylim(0,30); panel(a,'a',x=-0.2)
s2=d[d.s=='S02']; x=s2[s2.experiment=='E10_Amount_Timing_Soil'].groupby('amt_mm').f.mean()*100
b.bar(range(len(x)),x.values,color='#0072B2'); b.set_xticks(range(len(x))); b.set_xticklabels([f'{v:g}' for v in x.index],fontsize=6.5)
b.set_xlabel('Irrigation depth per event, S02 (mm)'); b.set_ylabel('Failed runs (%)'); panel(b,'b',x=-0.2)
y=s2[s2.P.notna()].groupby('P').f.agg(['mean','count']); 
c.bar(range(len(y)),100*y['mean'].values,color='#009E73'); c.set_xticks(range(len(y))); c.set_xticklabels([f'{v:g}' for v in y.index],fontsize=6.5)
c.set_xlabel('Rain scale, S02'); c.set_ylabel('Failed runs (%)'); panel(c,'c',x=-0.2)
bins=np.linspace(-900,300,60)
v=d[~d.f].drainage_1m_mm.clip(-900,300); f=d[d.f].drainage_1m_mm.clip(-900,300)
e.hist(v,bins=bins,color='#999',alpha=.7,density=True,label=f'valid (n={len(v):,})'); e.hist(f,bins=bins,color='#D55E00',alpha=.7,density=True,label=f'failed (n={len(f)})')
e.axvline(0,color='k',lw=.6); e.set_xlabel('Annual drainage at 1 m (mm; clipped at $-900$ and 300)'); e.set_ylabel('Density'); e.legend(frameon=False,fontsize=6.5); panel(e,'d',x=-0.2)
fig.tight_layout(); save(fig,'figS_failed','p2')
