"""Link between the audit and the recoverable share: psi_D from E7 (mulch; the same calculation as p1_core.py, which reproduces the archived values) computed against
the non-transpiration evaporation Ent = ET - T (used in the paper) and against the reported soil evaporation Es alone.
The difference is the unattributed term R = ET - T - Es - Ec carried into the denominator."""
import sys, json, os; sys.path.insert(0, os.environ.get('SWAFL_MS', '.'))
from load import *
out = {}
for ex, key in [('E7_Mulching', 'E7')]:
    e = d[d.experiment == ex]
    rows = {}
    for s in SOIL_N:
        g = e[e.s == s]
        if len(g) < 4 or g.Ent.std() < 1e-6: continue
        sD_ent = -np.polyfit(g.Ent, g.drainage_1m_mm, 1)[0]
        sD_es = -np.polyfit(g.soil_evap_mm, g.drainage_1m_mm, 1)[0] if g.soil_evap_mm.std() > 1e-6 else np.nan
        # share of the change of Ent that the reported Es does not carry
        share_es = np.polyfit(g.Ent, g.soil_evap_mm, 1)[0]
        rows[s] = dict(psiD_Ent=float(sD_ent), psiD_Es=float(sD_es), share_of_dEnt_in_Es=float(share_es), n=int(len(g)))
    out[key] = rows
    a = np.array([[v['psiD_Ent'], v['psiD_Es'], v['share_of_dEnt_in_Es']] for v in rows.values()])
    out[key + '_summary'] = dict(median_share_of_dEnt_in_Es=float(np.nanmedian(a[:, 2])), median_abs_diff_psiD=float(np.nanmedian(np.abs(a[:, 0] - a[:, 1]))), max_abs_diff_psiD=float(np.nanmax(np.abs(a[:, 0] - a[:, 1]))), n_soils=len(rows))
rows = out['E7']
out['E7_summary']['n_soils_diff_gt_0p1'] = int(sum(abs(v['psiD_Ent'] - v['psiD_Es']) > 0.1 for v in rows.values()))
out['E7_summary']['n_soils_sign_flip'] = int(sum(v['psiD_Es'] < 0 for v in rows.values()))
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'results', 'p1_audit_link.json'), 'w'), indent=1)
print(out['E7_summary'])
for s, v in out['E7'].items(): print(s, {a: round(b, 3) for a, b in v.items()})
