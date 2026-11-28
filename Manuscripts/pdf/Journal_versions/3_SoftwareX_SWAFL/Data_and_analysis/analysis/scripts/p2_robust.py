"""Robustness of the three-term ET law (Paper 2, Results, compact ET law):
(a) cluster bootstrap over the 17 experiments of the LOEO R2 of the law against gradient boosting given the same
    three inputs (ln W, n, ln(1+I)); 2000 resamples, seed 0;
(b) the law refitted and validated without E8 and E9 (the two experiments that break storage closure):
    LOEO and LOSO R2, RMSE (mm) and MAPE of ET, the marginal contribution of the terms, and gradient boosting on the
    same three inputs;
(c) Table 1 (descriptive statistics) and the table of the unattributed term R by experiment.
Reads out/d2.pkl (from p2_a.py) and out/p2_et.json (selected terms); writes out/p2_robust.json."""
import sys, os; sys.path.insert(0, os.environ.get('SWAFL_MS', '.') + '')
from load import *
import json, warnings; warnings.filterwarnings('ignore')
from sklearn.model_selection import GroupKFold
from sklearn.ensemble import HistGradientBoostingRegressor as GB
MS = os.environ.get('SWAFL_MS', '.')
D0 = pd.read_pickle(MS + '/out/d2.pkl')
terms = json.load(open(MS + '/out/p2_et.json'))['lnET']['terms']


def design(D):
    D = D.reset_index(drop=True)
    X = pd.DataFrame({'lnW': np.log(D.W), 'n': D.s.map(lambda s: VG[s][1]), 'lnI1': np.log1p(D.irrigation_mm)})
    return D, X


def cv_law(X, y, groups, cols):
    Xm = np.column_stack([np.ones(len(y))] + [X[c].values for c in cols]); p = np.zeros(len(y))
    for tr, te in GroupKFold(len(np.unique(groups))).split(Xm, y, groups):
        p[te] = Xm[te] @ np.linalg.lstsq(Xm[tr], y[tr], rcond=None)[0]
    return p


def cv_gbm(X, y, groups, cols):
    p = np.zeros(len(y))
    for tr, te in GroupKFold(len(np.unique(groups))).split(X, y, groups):
        p[te] = GB(max_iter=250, random_state=0).fit(X[cols].values[tr], y[tr]).predict(X[cols].values[te])
    return p


r2 = lambda p, y: float(1 - ((p - y) ** 2).sum() / ((y - y.mean()) ** 2).sum())
out = {'terms': terms}

# (a) cluster bootstrap on all valid runs
D, X = design(D0); y = np.log(D.ET_mm.values); g = D.experiment.values
pl = cv_law(X, y, g, terms); pb = cv_gbm(X, y, g, terms)
exps = np.unique(g); idx = {e: np.where(g == e)[0] for e in exps}
rng = np.random.default_rng(0); diff = []
for _ in range(2000):
    ii = np.concatenate([idx[e] for e in rng.choice(exps, len(exps), replace=True)])
    diff.append(r2(pl[ii], y[ii]) - r2(pb[ii], y[ii]))
diff = np.array(diff)
out['bootstrap'] = dict(n_resamples=2000, law_loeo=r2(pl, y), gbm3_loeo=r2(pb, y), diff=r2(pl, y) - r2(pb, y),
                        diff_mean=float(diff.mean()), ci95=[float(np.percentile(diff, 2.5)), float(np.percentile(diff, 97.5))])

# (b) without E8 and E9
D, X = design(D0[~D0.experiment.str.startswith(('E8_', 'E9_'))]); y = np.log(D.ET_mm.values)
g = D.experiment.values; gs = D.s.values; ET = D.ET_mm.values
p = cv_law(X, y, g, terms); ps = cv_law(X, y, gs, terms)
steps = []
for k in range(1, len(terms) + 1):
    pk = cv_law(X, y, g, terms[:k]); steps.append(dict(terms=terms[:k], loeo=r2(pk, y), rmse_mm=float(np.sqrt(((np.exp(pk) - ET) ** 2).mean()))))
out['without_E8_E9'] = dict(n_runs=int(len(D)), n_experiments=int(len(np.unique(g))), loeo=r2(p, y), loso=r2(ps, y),
                            rmse_mm=float(np.sqrt(((np.exp(p) - ET) ** 2).mean())), mape_pct=float(100 * np.mean(np.abs(np.exp(p) - ET) / ET)),
                            steps=steps, gbm3_loeo=r2(cv_gbm(X, y, g, terms), y))
# (c) descriptive statistics of the fluxes (Table 1) and the unattributed term by experiment (Table tab:R)
D = D0.copy(); D['R'] = D.ET_mm - (D.transpiration_mm + D.soil_evap_mm + D.canopy_evap_mm)
out['table1'] = {c: dict(mean=float(D[c].mean()), sd=float(D[c].std()), q25=float(D[c].quantile(.25)), median=float(D[c].median()),
                          q75=float(D[c].quantile(.75))) for c in ['rain_mm', 'irrigation_mm', 'W', 'ET_mm', 'drainage_1m_mm', 'R']}
D['RET'] = D.R / D.ET_mm; D['dSW'] = (D.W - D.ET_mm - D.drainage_1m_mm) / D.W
out['R_by_experiment'] = {e: dict(runs=int(len(x)), R_median=float(x.R.median()), R_ET_median=float(x.RET.median()), dS_W_median=float(x.dSW.median()))
                          for e, x in D.groupby('experiment')}
json.dump(out, open(MS + '/out/p2_robust.json', 'w'), indent=1)
print(json.dumps(out, indent=1))
