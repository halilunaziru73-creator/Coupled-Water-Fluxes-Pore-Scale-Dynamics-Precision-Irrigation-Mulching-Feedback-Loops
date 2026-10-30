"""Check the headline numbers printed in the three manuscripts against freshly regenerated outputs.
Usage: python audit_numbers.py <regenerated out/ dir>.  Each claim is (paper, text as printed, value computed, rounding).
A claim passes if the computed value, rounded as printed, equals the printed value."""
import sys, os, json
import numpy as np, pandas as pd
from scipy import stats
O = sys.argv[1] if len(sys.argv) > 1 else 'out'
J = lambda f: json.load(open(os.path.join(O, f)))
rate = J('p1_rate_law.json'); core = J('p1_core.json'); et = J('p2_et.json'); laws = J('p2_laws.json'); etl = J('p2_etlaw.json')
fd = [v['fD'] for v in core['memory'].values()]
r = pd.read_json(os.path.join(O, 'e12.json')); p = pd.DataFrame(json.load(open(os.path.join(O, 'e12_pred.json'))))
m = {'ET_mm':'et','irrigation_mm':'irr','drainage_1m_mm':'drain','yield_Mg_ha':'yield','transpiration_mm':'transp','soil_evap_mm':'evap','N_leached_kg_ha':'nl'}
rho = [stats.spearmanr(r[a], p[b]).statistic for a, b in m.items()]
cl = pd.DataFrame(J('p3_e2_closure.json')).relres.abs() * 100
w = pd.read_csv(os.path.join(O, 'p3_ws61.csv')).err_pct.abs() if os.path.exists(os.path.join(O, 'p3_ws61.csv')) else None
spr = J('p3_sprinkler.json')
d = pd.read_pickle(os.path.join(O, '..', 'data.pkl')) if os.path.exists(os.path.join(O, '..', 'data.pkl')) else None
C = [
 ('P1', 'q* = 71.5 cm/d', rate['q_star_cm_d'], 1), ('P1', 'R^2 = 0.971', rate['R2'], 3),
 ('P1', 'bootstrap 95% interval lower 58', rate['boot_ci95'][0], 0), ('P1', 'bootstrap 95% interval upper 105', rate['boot_ci95'][1], 0),
 ('P1', 'jackknife min 66', rate['jackknife_range'][0], 0), ('P1', 'jackknife max 80', rate['jackknife_range'][1], 0),
 ('P1', 'LOSO RMSE rate law 0.058', rate['loso_rmse_rate_law'], 3), ('P1', 'LOSO mean-only (8 soils) 0.338', rate['loso_8']['mean_only'], 3),
 ('P1', 'LOSO TAW (8) 0.088', rate['loso_8']['TAW'], 3), ('P1', 'LOSO Se100 (8) 0.064', rate['loso_8']['Se100'], 3), ('P1', 'LOSO n (8) 0.100', rate['loso_8']['n'], 3),
 ('P1', 'LOSO log10 Ks linear (8) 0.062', rate['loso_8']['log10Ks_linear'], 3), ('P1', 'LOSO mean-only (10) 0.318', rate['loso_10']['mean_only'], 3),
 ('P1', 'LOSO TAW (10) 0.183', rate['loso_10']['TAW'], 3), ('P1', 'LOSO Se100 (10) 0.136', rate['loso_10']['Se100'], 3), ('P1', 'LOSO n (10) 0.097', rate['loso_10']['n'], 3),
 ('P1', 'memory fate min 0.02', min(fd), 2), ('P1', 'memory fate max 0.85', max(fd), 2),
 ('P2', 'LOEO R^2 0.898', etl['sparse_loeo'], 3), ('P2', 'LOSO R^2 0.904', etl['sparse_loso'], 3), ('P2', 'in-sample R^2 0.908', et['lnET']['r2'], 3),
 ('P2', 'GBM LOEO 0.879 (same three inputs)', et['lnET']['gbm_loeo'], 3),
 ('P2', 'smallest singular value 5.9', laws['svd4']['sv'][-1], 1), ('P2', 'permuted smallest singular value 33.3', laws['svd4_perm_minSV'], 1),
 ('P3', 'Spearman rho minimum 0.64', min(rho), 2), ('P3', 'Spearman rho maximum 0.97', max(rho), 2),
 ('P3', 'Engine 2 closure median 0.1 % of inflow', cl.median(), 1), ('P3', 'Engine 2 closure maximum 0.7 %', cl.max(), 1),
 ('P3', 'sprinkler wetted diameter 28.98 m (corrected)', 2 * spr['nozzle']['R'], 2),
]
if w is not None: C += [('P3', 'surface: median |error| 0.08 %', w.median(), 2), ('P3', 'surface: maximum |error| 1.81 %', w.max(), 2)]
if d is not None: C += [('All', 'runs 10190', len(d), 0), ('All', 'valid runs 10041', int((d.valid == 1).sum()), 0), ('All', 'failed runs 149', int((d.valid != 1).sum()), 0)]
bad = 0
for paper, txt, val, nd in C:
    print(f'{paper:3s} {txt:52s} computed {val:12.4f}')
print(f'{len(C)} claims listed; inspect that each computed value rounds to the printed value (nd digits in script).')
import re
for paper, txt, val, nd in C:
    nums = re.findall(r'\d+\.?\d*', txt)
    target = float(re.findall(r'\d+\.?\d*', txt.replace('^2', '').replace('log10', '').replace('Se100', '').replace('(10)', '').replace('(8)', ''))[-1] if False else next(x for x in nums[::-1] if x not in ('2', '10', '8', '100')) if paper != 'All' else nums[-1])
    if round(val, nd) != round(target, nd): bad += 1; print('MISMATCH:', paper, txt, 'computed', round(val, nd + 2))
print('mismatches:', bad); sys.exit(1 if bad else 0)
