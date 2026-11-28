import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'')
exec(open(__import__('os').environ.get('SWAFL_MS','.')+'/analysis/p2_et.py').read().split("def run(")[0])
import json
lib=['lnrain','lnI1','lnW','lnEp','dT','n','lnTAW','lnalpha','mulch','Ifrac','lnW_TAW']
y=np.log(D.ET_mm.values); Xv=sm.add_constant(X[lib]); 
def fit_pred(cols,tr,te):
    A=sm.add_constant(X[cols].values); return A[te]@np.linalg.lstsq(A[tr],y[tr],rcond=None)[0]
def select(tr):
    gi=g[tr]; k=len(set(gi)); sel=[];best=-9
    def cv(cols):
        p=np.zeros(len(tr)); A=sm.add_constant(X[cols].values)[tr]; yt=y[tr]
        for a,b in GroupKFold(k).split(A,yt,gi): p[b]=A[b]@np.linalg.lstsq(A[a],yt[a],rcond=None)[0]
        return 1-((p-yt)**2).sum()/((yt-yt.mean())**2).sum()
    while True:
        c=[(cv(sel+[a]),a) for a in lib if a not in sel]
        if not c:break
        s,a=max(c)
        if s>best+0.003: best=s;sel.append(a)
        else:break
    return sel
P=np.zeros(len(y)); sels=[]
for e in sorted(set(g)):
    te=np.where(g==e)[0]; tr=np.where(g!=e)[0]; s=select(tr); sels.append(s); P[te]=fit_pred(s,tr,te)
r2=1-((P-y)**2).sum()/((y-y.mean())**2).sum()
from collections import Counter
print('nested LOEO R2 %.3f'%r2, Counter(map(tuple,map(sorted,sels))).most_common(4))
per=[1-((P[g==e]-y[g==e])**2).sum()/max(((y[g==e]-y[g==e].mean())**2).sum(),1e-9) for e in sorted(set(g))]
json.dump(dict(r2=float(r2),sets=[list(s) for s in sels]),open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p2_nested.json','w'))
