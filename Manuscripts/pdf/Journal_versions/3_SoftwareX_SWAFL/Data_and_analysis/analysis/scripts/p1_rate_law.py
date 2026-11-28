"""Canonical computation of every rate-competition-law number quoted in Paper 1 (Section 'rate competition', Table LOSO).
phi_D = Ks/(Ks+q*), eight soils with literature Ks (Carsel & Parrish 1988); phi_D from E9 (p1_stats.py -> p1_table2.csv).
Writes out/p1_rate_law.json. Seeds are fixed."""
import sys, json, os
sys.path.insert(0, os.environ.get('SWAFL_MS', '.'))
from load import *
from scipy import optimize
root = os.environ.get('SWAFL_MS', '.')
Tn = pd.read_csv(root + '/out/p1_table2.csv', index_col=0); phi = Tn.phiD_E9
KS = {'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}   # cm/d
s8 = list(KS); K = np.array([KS[s] for s in s8]); y = np.array([phi[s] for s in s8])
f = lambda p, K: K / (K + 10**p)
def fit(K, y):
    r = optimize.minimize_scalar(lambda p: ((f(p, K) - y)**2).sum(), bounds=(-2, 4), method='bounded', options=dict(xatol=1e-10)); return r.x
p = fit(K, y); q = 10**p; pred = f(p, K)
R2 = 1 - ((pred - y)**2).sum() / ((y - y.mean())**2).sum()
rng = np.random.default_rng(2026)
bs = []
for _ in range(5000):
    ix = rng.integers(0, 8, 8)
    if len(set(ix)) < 3: continue
    bs.append(10**fit(K[ix], y[ix]))
jk = [10**fit(K[[i for i in range(8) if i != k]], y[[i for i in range(8) if i != k]]) for k in range(8)]
pe = np.array([f(fit(K[[i for i in range(8) if i != k]], y[[i for i in range(8) if i != k]]), K[k]) for k in range(8)])
def loso_lin(x, yv, clip=True):
    e = []
    for k in range(len(yv)):
        tr = [i for i in range(len(yv)) if i != k]; c = np.polyfit(x[tr], yv[tr], 1); v = np.polyval(c, x[k]); e.append((np.clip(v, 0, 1) if clip else v) - yv[k])
    return float(np.sqrt(np.mean(np.square(e))))
def loso_mean(yv): return float(np.sqrt(np.mean([(yv[np.arange(len(yv)) != k].mean() - yv[k])**2 for k in range(len(yv))])))
a10 = SOIL_N; y10 = np.array([phi[s] for s in a10])
res = dict(q_star_cm_d=float(q), R2=float(R2), boot_ci95=[float(np.percentile(bs, 2.5)), float(np.percentile(bs, 97.5))], n_boot=len(bs),
           jackknife_range=[float(min(jk)), float(max(jk))], loso_rmse_rate_law=float(np.sqrt(((pe - y)**2).mean())),
           loso_8={'mean_only': loso_mean(y), 'TAW': loso_lin(np.array([TAW[s] for s in s8], float), y), 'Se100': loso_lin(Tn.loc[s8, 'Se100'].values, y),
                   'n': loso_lin(np.array([VG[s][1] for s in s8]), y), 'log10Ks_linear': loso_lin(np.log10(K), y)},
           loso_10={'mean_only': loso_mean(y10), 'TAW': loso_lin(np.array([TAW[s] for s in a10], float), y10), 'Se100': loso_lin(Tn.loc[a10, 'Se100'].values, y10),
                    'n': loso_lin(np.array([VG[s][1] for s in a10]), y10)}, loo_pred=pe.tolist(), soils=s8)
json.dump(res, open(root + '/out/p1_rate_law.json', 'w'), indent=1); print(json.dumps(res, indent=1))
