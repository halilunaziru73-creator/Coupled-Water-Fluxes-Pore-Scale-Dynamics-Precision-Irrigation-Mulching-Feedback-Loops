import sys, json; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
from load import *
from scipy import stats, optimize
T=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
def Se(h,a,n): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(h,a,n): m=1-1/n; s=Se(h,a,n); return np.sqrt(s)*(1-(1-s**(1/m))**m)**2
KS={'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}   # Carsel & Parrish (1988), cm/d
soils=list(KS)
y=T.loc[soils,'phiD_E9'].values
def model(par,hs=None):
    lh,lq=par; h=10**lh; q=10**lq
    K=np.array([KS[s]*Kr(h,*VG[s]) for s in soils]); return K/(K+q)
def loss(par): return ((model(par)-y)**2).sum()
best=None
for lh0 in np.linspace(0.8,2.2,8):
    for lq0 in np.linspace(-3,1,9):
        r=optimize.minimize(loss,[lh0,lq0],method='Nelder-Mead')
        if best is None or r.fun<best.fun: best=r
print('best h*=%.1f cm  q=%.4f cm/d (=%.3f mm/d) SSE=%.3f'%(10**best.x[0],10**best.x[1],10**best.x[1]*10,best.fun))
p=model(best.x); print(np.round(p,2),np.round(y,2)); print('R2',1-((p-y)**2).sum()/((y-y.mean())**2).sum(), 'spearman',stats.spearmanr(p,y).statistic)
# LOO on soils
pe=[]
for k,s in enumerate(soils):
    tr=[t for t in soils if t!=s]; yy=T.loc[tr,'phiD_E9'].values
    def lo(par):
        lh,lq=par; h=10**lh; q=10**lq; K=np.array([KS[t]*Kr(h,*VG[t]) for t in tr]); return ((K/(K+q)-yy)**2).sum()
    bb=None
    for lh0 in np.linspace(0.8,2.2,6):
        for lq0 in np.linspace(-3,1,7):
            r=optimize.minimize(lo,[lh0,lq0],method='Nelder-Mead')
            if bb is None or r.fun<bb.fun: bb=r
    h=10**bb.x[0]; q=10**bb.x[1]; K=KS[s]*Kr(h,*VG[s]); pe.append(K/(K+q))
pe=np.array(pe); print('LOO pred',np.round(pe,2)); print('LOO RMSE %.3f, R2 %.2f'%(np.sqrt(((pe-y)**2).mean()),1-((pe-y)**2).sum()/((y-y.mean())**2).sum()))
# n-only logistic baseline LOO
pn=[]
nn=np.array([VG[s][1] for s in soils])
for k,s in enumerate(soils):
    tr=[i for i in range(len(soils)) if i!=k]
    f=lambda par,x: 1/(1+np.exp(-(par[0]+par[1]*x)))
    r=optimize.least_squares(lambda par: f(par,nn[tr])-y[tr],[-3,2]); pn.append(f(r.x,nn[k]))
pn=np.array(pn); print('n-logistic LOO RMSE %.3f'%np.sqrt(((pn-y)**2).mean()))
json.dump(dict(hstar=10**best.x[0],q=10**best.x[1],pred=p.tolist(),loo=pe.tolist(),soils=soils),open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_mech.json','w'))
