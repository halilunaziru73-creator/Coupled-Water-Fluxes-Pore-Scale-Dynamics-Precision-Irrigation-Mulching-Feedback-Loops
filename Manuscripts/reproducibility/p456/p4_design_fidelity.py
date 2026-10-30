"""P4: how much of the full-study information survives in the compact designs of the Daisy workbench?
For each (experiment, factor) the marginal mean of five responses is computed from the full ensemble (study levels), then
reconstructed by linear interpolation between the marginals at the compact-design levels (nearest study level to each preset level).
Reported: interpolation RMSE as % of the marginal range, and the run-count / run-time ratio compact vs study."""
import pandas as pd, numpy as np, json, sys, os
H=os.path.dirname(os.path.abspath(__file__))
d=pd.read_csv(H+'/../data/daisy_ensemble.csv.gz'); d=d[d.valid==1]
S=pd.read_csv('/home/claude/cwf/Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz',usecols=['experiment','run_id','run_seconds'],low_memory=False)
d=d.merge(S[['run_id','run_seconds']],on='run_id',how='left')
PRESET={ # exp: {ens column: preset levels (study units)}
 'E2':{'trig':[-100,-150,-300,-800,-1500,-3000]},
 'E3':{'z':[10,20,30,40,60,100]},
 'E1':{'amt_mm':[6,12,24,36]},
 'E9':{'trig':[-100,-300,-800,-1500],'P':[0.6,0.8,1,1.2]},
 'E10':{'amt_mm':[10,20,30]},
 'E11':{'dT':[0,1,2,3],'P':[0.6,0.8,1,1.2]},
 'E12':{'z':[10,30,60],'trig':[-150,-300,-800],'P':[0.7,1,1.3]},
 'E15':{'amt_mm':[10,20,30],'root':[45,90,135]},
}
RESP=['yield_Mg_ha','irrigation_mm','drainage_1m_mm','IE_kg_m3','N_leached_kg_ha']
rows=[]
for e,fs in PRESET.items():
    x=d[(d.exp==e)]
    x=x[~x.treatment.str.contains('Rainfed',case=False,na=False)]
    for f,lev in fs.items():
        if f not in x or x[f].notna().sum()==0: continue
        L=np.sort(x[f].dropna().unique())
        if len(L)<5: continue
        sel=sorted({L[np.argmin(abs(L-v))] for v in lev})
        if len(sel)<3: continue
        for r in RESP:
            m=x.groupby(f)[r].mean()
            if m.isna().all(): continue
            rng=m.max()-m.min()
            if rng<=1e-9: continue
            tr=(lambda v:np.log10(-np.asarray(v,float))) if f=='trig' else (lambda v:np.asarray(v,float))
            ip=np.interp(tr(m.index.values),tr(sel)[::-1] if f=='trig' else tr(sel),(m.loc[sel].values[::-1] if f=='trig' else m.loc[sel].values))
            rmse=np.sqrt(np.mean((ip-m.values)**2)); mx=np.max(abs(ip-m.values))
            rows.append(dict(exp=e,factor=f,resp=r,levels_study=len(L),levels_compact=len(sel),rmse_pct=100*rmse/rng,max_pct=100*mx/rng))
R=pd.DataFrame(rows); R.to_csv(H+'/out_p4_fidelity.csv',index=False)
print(R.groupby('resp')[['rmse_pct','max_pct']].agg(['median','max']).round(2))
print('overall median rmse %.2f%%, 90th pct %.2f%%, max %.2f%%, n=%d'%(R.rmse_pct.median(),R.rmse_pct.quantile(.9),R.rmse_pct.max(),len(R)))
print(R.groupby(['exp','factor']).rmse_pct.median().round(2))
# run counts and run time, compact vs study
G=json.load(open(H+'/out_p4_design.json'))
S2=pd.read_csv('/home/claude/cwf/Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz',usecols=['experiment','run_seconds'],low_memory=False)
tab=[]
for g in G:
    e=g['id']; x=S2[S2.experiment.str.startswith(e+'_')]; n=len(x); sec=x.run_seconds.sum(); med=x.run_seconds.median()
    tab.append(dict(exp=e,name=g['name'],study=n,study_hours=sec/3600,gui=g.get('gui'),gui_hours=(g['gui']*med/3600 if g.get('gui') else None)))
T=pd.DataFrame(tab); T.to_csv(H+'/out_p4_runtime.csv',index=False); print(T.round(1).to_string())
print('total study days',S2.run_seconds.sum()/86400)
