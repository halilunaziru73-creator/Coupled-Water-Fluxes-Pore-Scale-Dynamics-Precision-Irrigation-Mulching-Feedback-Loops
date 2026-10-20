"""Paper 1 core analysis: hydraulic memory (E9) vs recoverability of evaporation savings (E16, E7)."""
import sys, json; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
from scipy import stats
rng=np.random.default_rng(20261018)
def Se(h,a,n): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(h,a,n): m=1-1/n; s=Se(h,a,n); return np.sqrt(s)*(1-(1-s**(1/m))**m)**2

# ---------- A. memory: marginal fate of antecedent storage (E9) ----------
x9=e9(); x9['oth']=x9.ET_mm-x9.transpiration_mm-x9.soil_evap_mm
def fate_slopes(g, comps, x='draw'):
    """pooled-within-P regression slope of each component on storage release (all cells of one soil)"""
    out={}
    gd=g.copy()
    for c in comps:
        num=den=0.0
        for P,gp in gd.groupby('P'):
            xx=gp[x].values-gp[x].mean(); yy=gp[c].values-gp[c].mean()
            num+= (xx*yy).sum(); den+=(xx*xx).sum()
        out[c]=num/den
    return out
comps=['soil_evap_mm','transpiration_mm','drainage_1m_mm','oth']
memory={}
for s in SOIL_N:
    g=x9[x9.s==s]
    f=fate_slopes(g,comps)
    # bootstrap over h0 levels x P cells
    B=[]
    for b in range(1000):
        gi=g.iloc[rng.integers(0,len(g),len(g))]
        try: B.append(fate_slopes(gi,comps))
        except Exception: pass
    ci={c:(np.percentile([q[c] for q in B],2.5),np.percentile([q[c] for q in B],97.5)) for c in comps}
    g1=g[g.P==1.0]; ref=g1[g1.h0==1500].iloc[0]
    capFC=g1[g1.h0==100].iloc[0].draw-ref.draw; cap60=g1[g1.h0==60].iloc[0].draw-ref.draw
    memory[s]=dict(fE=f['soil_evap_mm'],fT=f['transpiration_mm'],fD=f['drainage_1m_mm'],fO=f['oth'],ci=ci,capFC=capFC,cap60=cap60,n=len(g))
# ---------- B. recoverability from E16 (evaporation factor contrast) ----------
f16=e16(); fac=['fP','fT','fh','fD','fN','fEp']
def paired(g,var,facname):
    oth=[c for c in fac if c!=facname]; p=g.pivot_table(index=oth,columns=facname,values=var).dropna()
    return (p.iloc[:,-1]-p.iloc[:,0])           # high level minus low level
rec16={}
for s in SOIL_N:
    g=f16[f16.s==s]
    C={v:paired(g,v,'fEp') for v in ['Ent','irrigation_mm','drainage_1m_mm','transpiration_mm','yield_Mg_ha','draw']}
    idx=C['Ent'].index
    def ratios(ix):
        dE=C['Ent'].loc[ix].sum()
        return dict(psiD=-C['drainage_1m_mm'].loc[ix].sum()/dE, psiI=C['irrigation_mm'].loc[ix].sum()/dE, psiT=-C['transpiration_mm'].loc[ix].sum()/dE, psiS=-C['draw'].loc[ix].sum()/dE, dE=dE/len(ix))
    base=ratios(idx); B=[]
    for b in range(1000):
        ix=idx[rng.integers(0,len(idx),len(idx))]
        B.append(ratios(ix))
    ci={k:(np.percentile([q[k] for q in B],2.5),np.percentile([q[k] for q in B],97.5)) for k in base}
    rec16[s]=dict(**base,ci=ci,n=len(idx))
# ---------- C. recoverability from E7 (mulch) ----------
e7=d[d.experiment=='E7_Mulching']
rec7={}
for s in SOIL_N:
    g=e7[e7.s==s]
    # regression of component on Ent across the 20 vff x cap cells (through slopes)
    r={}
    for k,v,sg in [('psiD','drainage_1m_mm',-1),('psiI','irrigation_mm',1),('psiT','transpiration_mm',-1)]:
        sl=np.polyfit(g.Ent,g[v],1)[0]; r[k]=sg*sl*(-1 if k!='psiI' else -1) if False else None
    sD=np.polyfit(g.Ent,g.drainage_1m_mm,1)[0]; sI=np.polyfit(g.Ent,g.irrigation_mm,1)[0]; sT=np.polyfit(g.Ent,g.transpiration_mm,1)[0]
    # Ent decreases with mulch -> loss of Ent: fate shares = -(dX/dEnt) for drainage & transpiration (they rise as Ent falls), +dI/dEnt for irrigation (falls as Ent falls)
    r=dict(psiD=-sD,psiI=sI,psiT=-sT,span=g.Ent.max()-g.Ent.min())
    B=[]
    for b in range(1000):
        gi=g.iloc[rng.integers(0,len(g),len(g))]
        if gi.Ent.std()<1e-6: continue
        B.append(dict(psiD=-np.polyfit(gi.Ent,gi.drainage_1m_mm,1)[0]))
    r['ciD']=(np.percentile([q['psiD'] for q in B],2.5),np.percentile([q['psiD'] for q in B],97.5))
    rec7[s]=r
out=dict(memory=memory,rec16=rec16,rec7=rec7)
json.dump(out,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_core.json','w'),default=float,indent=1)
T=pd.DataFrame({'phiD_E9':{s:memory[s]['fD'] for s in SOIL_N},'phiT_E9':{s:memory[s]['fT'] for s in SOIL_N},'phiE_E9':{s:memory[s]['fE'] for s in SOIL_N},'capFC':{s:memory[s]['capFC'] for s in SOIL_N},
 'psiD_E16':{s:rec16[s]['psiD'] for s in SOIL_N},'psiI_E16':{s:rec16[s]['psiI'] for s in SOIL_N},'psiT_E16':{s:rec16[s]['psiT'] for s in SOIL_N},'dE16':{s:rec16[s]['dE'] for s in SOIL_N},
 'psiD_E7':{s:rec7[s]['psiD'] for s in SOIL_N},'psiI_E7':{s:rec7[s]['psiI'] for s in SOIL_N},'spanE7':{s:rec7[s]['span'] for s in SOIL_N}})
print(T.round(3).to_string())
T.to_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table.csv')
for a,b in [('phiD_E9','psiD_E16'),('phiD_E9','psiD_E7'),('psiD_E16','psiD_E7'),('capFC','psiD_E16')]:
    r=stats.spearmanr(T[a],T[b]); k=stats.kendalltau(T[a],T[b]); print(a,b,'spearman %.2f p=%.4f  kendall %.2f p=%.4f'%(r.statistic,r.pvalue,k.statistic,k.pvalue))
