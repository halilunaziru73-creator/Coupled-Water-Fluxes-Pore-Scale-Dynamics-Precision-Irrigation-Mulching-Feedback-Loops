import sys, json; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
from scipy import stats
rng=np.random.default_rng(7)
T=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table.csv',index_col=0)
def Se(h,a,n): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(h,a,n): m=1-1/n; s=Se(h,a,n); return np.sqrt(s)*(1-(1-s**(1/m))**m)**2
T['TAW']=pd.Series(TAW); T['n']=pd.Series({s:VG[s][1] for s in SOIL_N}); T['alpha']=pd.Series({s:VG[s][0] for s in SOIL_N})
T['Se100']=[Se(100,*VG[s]) for s in SOIL_N]; T['Se30']=[Se(30,*VG[s]) for s in SOIL_N]
T['logKr30']=[np.log10(Kr(30,*VG[s])+1e-12) for s in SOIL_N]
# recoverability index (retained share) and memory retention
T['m_ret']=1-T.phiD_E9; T['r_E16']=1-T.psiD_E16; T['r_E7']=1-T.psiD_E7
y='psiD_E16'
res={}
for p in ['phiD_E9','capFC','TAW','n','alpha','Se100','Se30','logKr30']:
    r=stats.spearmanr(T[p],T[y]); res[p]=(r.statistic,r.pvalue)
    print('%-9s vs psiD_E16: rho=%.2f p=%.4f ; vs psiD_E7: rho=%.2f'%(p,r.statistic,r.pvalue,stats.spearmanr(T[p],T.psiD_E7).statistic))
# partial Spearman controlling TAW (rank residuals)
def partial(x,yv,z):
    rx,ry,rz=[stats.rankdata(v) for v in (x,yv,z)]
    ex=rx-np.polyval(np.polyfit(rz,rx,1),rz); ey=ry-np.polyval(np.polyfit(rz,ry,1),rz)
    r=np.corrcoef(ex,ey)[0,1]; n=len(x); t=r*np.sqrt((n-3)/(1-r*r)); p=2*stats.t.sf(abs(t),n-3); return r,p
for tgt in ['psiD_E16','psiD_E7']:
    print('partial phiD|TAW ->',tgt,partial(T.phiD_E9,T[tgt],T.TAW), ' partial TAW|phiD:',partial(T.TAW,T[tgt],T.phiD_E9))
# permutation test (Monte Carlo) for Spearman phiD vs psiD
obs=stats.spearmanr(T.phiD_E9,T.psiD_E16).statistic; cnt=0; N=200000
a=stats.rankdata(T.phiD_E9); b=stats.rankdata(T.psiD_E16)
for i in range(N):
    if np.corrcoef(a,rng.permutation(b))[0,1]>=obs: cnt+=1
print('perm p (one-sided) %.5f'%((cnt+1)/(N+1)))
# LOSO linear prediction of psiD_E16 using single predictors, robust (Theil-Sen)
def loso(pred,tgt,data=T):
    err=[]
    for s in data.index:
        tr=data.drop(s); sl,ic,_,_=stats.theilslopes(tr[tgt],tr[pred]); err.append(data.loc[s,tgt]-(ic+sl*data.loc[s,pred]))
    err=np.array(err); return np.sqrt((err**2).mean()), np.median(np.abs(err))
base=T.psiD_E16.std()
print('sd of target',base)
for p in ['phiD_E9','capFC','TAW','n','Se100','logKr30']:
    print('LOSO RMSE',p,['%.3f'%v for v in loso(p,'psiD_E16')], 'E7:',['%.3f'%v for v in loso(p,'psiD_E7')])
# sensitivity: exclude sand S03 (tiny E7 dE), exclude each soil influence on rho
infl={}
for s in SOIL_N:
    t=T.drop(s); infl[s]=stats.spearmanr(t.phiD_E9,t.psiD_E16).statistic
print('rho drop-one:',{k:round(v,2) for k,v in infl.items()})
# bootstrap propagation of within-soil uncertainty
J=json.load(open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_core.json'))
# approximate normal draws from CIs
def draw(ci,pt): lo,hi=ci; sd=(hi-lo)/3.92; return rng.normal(pt,sd)
rhos=[]
for b in range(5000):
    x=[draw(J['memory'][s]['ci']['drainage_1m_mm'],J['memory'][s]['fD']) for s in SOIL_N]; yv=[draw(J['rec16'][s]['ci']['psiD'],J['rec16'][s]['psiD']) for s in SOIL_N]
    rhos.append(stats.spearmanr(x,yv).statistic)
print('rho with measurement noise: median %.2f, 95%% [%.2f,%.2f]'%(np.median(rhos),*np.percentile(rhos,[2.5,97.5])))
# soil-bootstrap CI
rb=[]
for b in range(5000):
    ix=rng.integers(0,10,10)
    if len(set(ix))<4: continue
    rb.append(stats.spearmanr(T.phiD_E9.values[ix],T.psiD_E16.values[ix]).statistic)
rb=np.array(rb); rb=rb[~np.isnan(rb)]; print('soil bootstrap 95%% CI rho [%.2f, %.2f]'%tuple(np.percentile(rb,[2.5,97.5])))
T.to_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv')
