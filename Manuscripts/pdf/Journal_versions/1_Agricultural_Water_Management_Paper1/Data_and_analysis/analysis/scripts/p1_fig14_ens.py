import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json
OI2=['#0072B2','#009E73','#D55E00','#CC79A7','#E69F00']
e5=d[d.experiment.str.startswith('E5_')].copy(); t=e5.treatment.str.extract(r'^(conv|notill)_tc([\d.]+)_(Irrigated|Rainfed)$'); e5['till']=t[0]; e5['tc']=t[1].astype(float); e5['reg']=t[2]
fig,axs=plt.subplots(1,3,figsize=(7.4,2.7)); ax=axs[0]
e7=d[(d.experiment.str.startswith('E7_'))&(d.cap==2.0)]; S=SOIL_N; x=np.arange(10); w=0.38
lo=e7[e7.vff==0.9].set_index('s'); hi=e7[e7.vff==0.3].set_index('s')
dE=(lo.soil_evap_mm-hi.soil_evap_mm).reindex(S); dD=(hi.drainage_1m_mm-lo.drainage_1m_mm).reindex(S); dI=(lo.irrigation_mm-hi.irrigation_mm).reindex(S)
ax.bar(x-w/2,dE,w,color='#888',label='soil evaporation saved'); ax.bar(x+w/2,dI,w,color=OI2[0],label='irrigation saved'); ax.bar(x+w/2,dD,w,bottom=np.where(dI>0,dI,0),color=OI2[2],label='extra drainage')
ax.set_xticks(x); ax.set_xticklabels(S,rotation=90,fontsize=6.5); ax.set_ylabel('mm yr$^{-1}$'); ax.set_ylim(-10,110); ax.legend(frameon=False,fontsize=5.5,loc='upper right',ncol=1); panel(ax,'a',x=-0.22)
ax=axs[1]; r=e5[(e5.reg=='Rainfed')]; tcs=sorted(r.tc.unique())
for s,c in zip(['S06','S08','S09','S10'],OI2):
    c1=[r[(r.s==s)&(r.till=='conv')&(r.tc==u)].drainage_1m_mm.mean() for u in tcs]; nt=r[(r.s==s)&(r.till=='notill')].drainage_1m_mm.mean()
    ax.plot(tcs,c1,'o-',ms=3,color=c,label=s); ax.axhline(nt,color=c,ls=':',lw=.8)
ax.set_xscale('log'); ax.set_xlabel('Consolidation rate $\\tau_c$ (d$^{-1}$)'); ax.set_ylabel('Drainage (mm yr$^{-1}$)'); ax.legend(frameon=False,fontsize=6,ncol=2); panel(ax,'b',x=-0.22)
ax=axs[2]; rr=e5[(e5.reg=='Rainfed')&(e5.till=='conv')]; 
off=[rr[(rr.s==s)&(rr.tc==0.001)].drainage_1m_mm.mean()-e5[(e5.reg=='Rainfed')&(e5.till=='notill')&(e5.s==s)].drainage_1m_mm.mean() for s in S]
sp=[rr[(rr.s==s)&(rr.tc==0.02)].drainage_1m_mm.mean()-rr[(rr.s==s)&(rr.tc==0.001)].drainage_1m_mm.mean() for s in S]
ax.bar(x-w/2,off,w,color=OI2[3],label='tillage vs no-till ($\\tau_c$=0.001)'); ax.bar(x+w/2,sp,w,color=OI2[1],label='effect of $\\tau_c$ (0.02 vs 0.001)')
ax.axhline(0,color='#444',lw=.6); ax.set_xticks(x); ax.set_xticklabels(S,rotation=90,fontsize=6.5); ax.set_ylabel('$\\Delta$ drainage (mm yr$^{-1}$)'); ax.legend(frameon=False,fontsize=5.5,loc='upper left'); panel(ax,'c',x=-0.22)
fig.tight_layout(); save(fig,'fig14_ensemble_structure','p1')
res=dict(dE=dE.round(1).to_dict(),dD=dD.round(1).to_dict(),dI=dI.round(1).to_dict(),tillage_offset=dict(zip(S,np.round(off,2))),tc_effect=dict(zip(S,np.round(sp,2))))
json.dump(res,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_ens_structure.json','w'),indent=1); print(json.dumps(res))
