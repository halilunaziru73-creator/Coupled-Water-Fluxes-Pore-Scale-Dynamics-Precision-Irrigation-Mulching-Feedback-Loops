"""Paper 4: the reach of a suction trigger and the marginal fate of irrigation water.
Reads Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz (10 190 Daisy runs, 10 041 valid);
writes the figures to Manuscripts/figures/paper4 and the numbers to Manuscripts/results/p4_numbers.json."""
import json, os, numpy as np, pandas as pd
from scipy.optimize import minimize, curve_fit
from scipy.stats import spearmanr
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
OUT = os.path.join(ROOT, 'Manuscripts/figures/paper4'); os.makedirs(OUT, exist_ok=True)
RES = os.path.join(ROOT, 'Manuscripts/results/p4_numbers.json')
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8.5, 'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.linewidth': 0.7, 'xtick.major.width': 0.7, 'ytick.major.width': 0.7, 'legend.frameon': False,
                     'savefig.dpi': 300, 'axes.titlesize': 9, 'axes.titleweight': 'bold', 'axes.titlelocation': 'left'})
a = pd.read_csv(os.path.join(ROOT, 'Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz'), low_memory=False)
N_ALL, N_OK = len(a), int((a.status == 'ok').sum()); a = a[a.status == 'ok'].copy()
# soils: effective van Genuchten alpha (1/cm), n, TAW to 1 m (mm) (Paper 1, Table 2); literature Ks (cm/d, Carsel and Parrish 1988)
SO = pd.DataFrame({'soil': ['S01_CoarseLoam', 'S02_CoarseSand', 'S03_Sand', 'S04_LoamySand', 'S05_SandyLoam', 'S06_Loam', 'S07_SiltLoam', 'S08_SandyClayLoam', 'S09_ClayLoam', 'S10_SiltyClayLoam'],
                   'lab': ['Coarse loam', 'Coarse sand', 'Sand', 'Loamy sand', 'Sandy loam', 'Loam', 'Silt loam', 'Sandy clay loam', 'Clay loam', 'Silty clay loam'],
                   'al': [0.0961, 0.0536, 0.145, 0.124, 0.075, 0.036, 0.020, 0.059, 0.019, 0.010], 'n': [1.353, 1.60, 2.68, 2.28, 1.89, 1.56, 1.41, 1.48, 1.31, 1.23],
                   'taw': [130, 105, 60, 75, 95, 150, 220, 160, 175, 195]}).set_index('soil')
SO['m'] = 1 - 1 / SO.n
COL = dict(zip(SO.index, ['#E69F00', '#56B4E9', '#D55E00', '#CC79A7', '#009E73', '#0072B2', '#999933', '#882255', '#44AA99', '#332288']))
OFF2 = {'S01': (-14, 6), 'S08': (-4, -10), 'S06': (5, 2), 'S02': (5, -6)}
OFF3 = {'S01': (5, 6), 'S02': (-24, -3), 'S08': (-22, -9), 'S06': (5, -9), 'S07': (-20, -10), 'S09': (5, -10)}
SH = dict(zip(SO.index, ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10']))
Se = lambda h, al, n: (1 + (al * np.abs(h)) ** n) ** (-(1 - 1 / n))
def Kr(h, al, n, l=0.5):
    m = 1 - 1 / n; s = Se(h, al, n); return s ** l * (1 - (1 - s ** (1 / m)) ** m) ** 2
NUM = {'runs_total': N_ALL, 'runs_valid': N_OK}
# ------------------------------------------------------------------ 1. the reach of a suction trigger (E2)
e2 = a[a.experiment == 'E2_TriggerPressure'].copy(); e2['ht'] = -e2.set_trigger_potential_cm
NUM['E2_runs'] = len(e2)
FIRE = 5.0  # mm per year: a trigger "fires" when it brings at least 5 mm a year
br = {}
for s in SO.index:
    d = e2[e2.soil == s]; f = d.ht[d.irrigation_mm >= FIRE]; nf = d.ht[(d.irrigation_mm < FIRE) & (d.ht > f.max())]
    br[s] = (float(f.max()), float(nf.min()) if len(nf) else np.inf)
SO['lo'] = [br[s][0] for s in SO.index]; SO['hi'] = [br[s][1] for s in SO.index]
def hc_mualem(kap, al, n, l=0.5):   # K_r(h) ~ m^2 (alpha h)^-(2n + l(n-1)) for alpha h >> 1  ->  K_r(h_c) = kappa
    m = 1 - 1 / n; return (m * m / kap) ** (1 / (2 * n + l * (n - 1))) / al
def hc_pow(A, B, al, n): return A * (n - 1) ** (-B) / al
def hc_sc(S, al, n): m = 1 - 1 / n; return (S ** (-1 / m) - 1) ** (1 / n) / al
def ivl(p, lo, hi):
    lp, x, y = np.log10(p), np.log10(lo), (np.log10(hi) if np.isfinite(hi) else 99.)
    return (x - lp) if lp < x else ((lp - y) if lp > y else 0.)
MODELS = {'mualem': (lambda th, r: hc_mualem(10 ** th[0], r.al, r.n), [-9.]),
          'power': (lambda th, r: hc_pow(10 ** th[0], th[1], r.al, r.n), [1.8, 2.5]),
          'Sc': (lambda th, r: hc_sc(10 ** th[0], r.al, r.n), [-1.5])}
def fitm(name, idx):
    f, x0 = MODELS[name]; L = lambda th: sum(ivl(f(th, SO.loc[k]), SO.loc[k].lo, SO.loc[k].hi) ** 2 for k in idx)
    r = minimize(L, x0, method='Nelder-Mead', options={'xatol': 1e-5, 'fatol': 1e-8}); return r.x
REACH = {}
for name in MODELS:
    th = fitm(name, list(SO.index)); f = MODELS[name][0]
    lo = [];
    for k in SO.index:
        t = fitm(name, [j for j in SO.index if j != k]); lo.append(ivl(f(t, SO.loc[k]), SO.loc[k].lo, SO.loc[k].hi))
    lo = np.array(lo); REACH[name] = {'theta': [float(x) for x in th], 'loso_err_log10': [round(float(x), 3) for x in lo],
                                      'loso_rms_log10': float(np.sqrt(np.mean(lo ** 2))), 'loso_inside': int((lo == 0).sum()),
                                      'loso_max_factor': float(10 ** np.abs(lo).max()), 'pred': {SH[k]: float(f(th, SO.loc[k])) for k in SO.index}}
NUM['reach'] = REACH; kap = 10 ** REACH['mualem']['theta'][0]; NUM['kappa'] = kap
SO['hc'] = [hc_mualem(kap, r.al, r.n) for _, r in SO.iterrows()]
# reach of common triggers: which soils are blind to 300 and 600 cm
NUM['blind_300'] = [SH[k] for k in SO.index if SO.loc[k].hi <= 300]
NUM['yield_E2'] = {SH[s]: {'rainfed': float(a[(a.experiment == 'E0_Baselines') & (a.soil == s)].yield_Mg_ha.iloc[0]),
                           'best': float(e2[e2.soil == s].yield_Mg_ha.max()),
                           'at300': float(e2[(e2.soil == s) & (e2.ht == 300)].yield_Mg_ha.iloc[0]) if ((e2.soil == s) & (e2.ht == 300)).any() else None} for s in SO.index}
# collapse: irrigation against h_t / h_c
e2['x'] = e2.ht / e2.soil.map(SO.hc); e2['Inorm'] = e2.irrigation_mm / e2.soil.map(e2.groupby('soil').irrigation_mm.max())
def collapse_score(col):  # mean within-bin variance of Inorm across soils / total variance (lower is better)
    z = e2[[col, 'Inorm']].dropna(); bins = pd.qcut(np.log10(z[col]), 10, duplicates='drop'); return float(z.groupby(bins, observed=True).Inorm.var().mean() / z.Inorm.var())
NUM['collapse_raw_h'] = collapse_score('ht'); NUM['collapse_scaled'] = collapse_score('x')
rho = spearmanr(np.log10(e2.x), e2.Inorm); NUM['spearman_scaled'] = float(rho.correlation)
# ------------------------------------------------------------------ 2. marginal fate of irrigation (E10, E4, E15)
base = a[a.experiment == 'E0_Baselines'].set_index('soil')
a['oth'] = a.ET_mm - a.transpiration_mm - a.soil_evap_mm; base['oth'] = base.ET_mm - base.transpiration_mm - base.soil_evap_mm
for x, c in [('T', 'transpiration_mm'), ('E', 'soil_evap_mm'), ('O', 'oth'), ('D', 'drainage_1m_mm'), ('ET', 'ET_mm'), ('Y', 'yield_Mg_ha'), ('NL', 'N_leached_kg_ha')]:
    a['d' + x] = a[c] - a.soil.map(base[c])
a['dS'] = a.irrigation_mm - a.dET - a.dD
e10 = a[(a.experiment == 'E10_Amount_Timing_Soil')].copy(); NUM['E10_runs'] = len(e10); e10i = e10[e10.irrigation_mm > 20]
NUM['E10_runs_irrigated'] = len(e10i)
fate = e10i.groupby('soil')[['dT', 'dE', 'dO', 'dD', 'dS', 'irrigation_mm']].sum(); fate = fate[['dT', 'dE', 'dO', 'dD', 'dS']].div(fate.irrigation_mm, axis=0)
NUM['fate_E10'] = {SH[k]: {c: round(float(v), 3) for c, v in r.items()} for k, r in fate.iterrows()}
tot = e10i[['dT', 'dE', 'dO', 'dD', 'dS', 'irrigation_mm']].sum(); NUM['fate_E10_all'] = {c: round(float(tot[c] / tot.irrigation_mm), 3) for c in ['dT', 'dE', 'dO', 'dD', 'dS']}
# dose response per soil (all windows pooled)
DR = {}
satf = lambda d, inf, dd: inf * (1 - np.exp(-d / dd))
for s in fate.index:
    g = e10i[e10i.soil == s].groupby('set_dose_mm_per_event')[['dT', 'dE', 'dO', 'dD', 'irrigation_mm', 'dY']].sum()
    d = g.index.values.astype(float); eD = (g.dD / g.irrigation_mm).values; eT = (g.dT / g.irrigation_mm).values; eEO = ((g.dE + g.dO) / g.irrigation_mm).values
    try: (pi, pd_), _ = curve_fit(satf, d, eD, p0=[0.2, 4], bounds=([0, 0.1], [1, 100]))
    except Exception: pi, pd_ = np.nan, np.nan
    r2 = 1 - np.sum((eD - satf(d, pi, pd_)) ** 2) / np.sum((eD - eD.mean()) ** 2)
    sc = eT - eD   # transpired minus drained per mm: the dose that maximises it
    DR[s] = {'dose': d.tolist(), 'etaD': eD.tolist(), 'etaT': eT.tolist(), 'etaEO': eEO.tolist(), 'inf': float(pi), 'dD': float(pd_), 'r2': float(r2),
             'dose_maxT': float(d[np.argmax(eT)]), 'dose_best': float(d[np.argmax(sc)])}
NUM['dose'] = {SH[k]: {kk: (round(v, 3) if isinstance(v, float) else v) for kk, v in r.items() if kk not in ('dose', 'etaD', 'etaT', 'etaEO')} for k, r in DR.items()}
# predictors of the dose scale and the plateau
sk = [k for k in DR if np.isfinite(DR[k]['dD'])]
dfp = pd.DataFrame({'dD': [DR[k]['dD'] for k in sk], 'inf': [DR[k]['inf'] for k in sk], 'n': SO.loc[sk].n.values, 'taw': SO.loc[sk].taw.values,
                    'se100': [Se(100, SO.loc[k].al, SO.loc[k].n) for k in sk], 'dep300': [(Se(100, SO.loc[k].al, SO.loc[k].n) - Se(300, SO.loc[k].al, SO.loc[k].n)) / (Se(100, SO.loc[k].al, SO.loc[k].n) - Se(15849, SO.loc[k].al, SO.loc[k].n)) for k in sk]}, index=[SH[k] for k in sk])
dfp['store'] = dfp.dep300 * dfp.taw * 0.3   # mm of plant-available water emptied between 100 and 300 cm in the top 30 cm
NUM['dose_predictors'] = {c: {'rho_dD': float(spearmanr(dfp[c], dfp.dD).correlation), 'rho_inf': float(spearmanr(dfp[c], dfp['inf']).correlation)} for c in ['n', 'taw', 'se100', 'dep300', 'store']}
NUM['dose_table'] = dfp.round(4).to_dict(orient='index')
# methods (E4, all soils) and method x depth x amount (E15, coarse loam)
e4 = a[a.experiment == 'E4_Methods']; m4 = e4.groupby('set_irrigation_method')[['dT', 'dE', 'dO', 'dD', 'irrigation_mm', 'yield_Mg_ha']].sum()
NUM['methods_E4'] = {k: {c: round(float(r[c] / r.irrigation_mm), 3) for c in ['dT', 'dE', 'dO', 'dD']} for k, r in m4.iterrows()}
NUM['methods_E4_runs'] = len(e4)
e15 = a[a.experiment == 'E15_Method_Depth_Amount']; NUM['E15_runs'] = len(e15)
m15 = e15.groupby('set_irrigation_method')[['dT', 'dE', 'dO', 'dD', 'irrigation_mm']].sum()
NUM['methods_E15'] = {k: {c: round(float(r[c] / r.irrigation_mm), 3) for c in ['dT', 'dE', 'dO', 'dD']} for k, r in m15.iterrows()}
# window (timing) effect in E10: fate per window, pooled soils
w = e10i.groupby('set_irrigation_window')[['dT', 'dD', 'dE', 'dO', 'irrigation_mm', 'dY']].sum()
NUM['window'] = {k: {'etaT': round(float(r.dT / r.irrigation_mm), 3), 'etaD': round(float(r.dD / r.irrigation_mm), 3), 'I': round(float(r.irrigation_mm), 0)} for k, r in w.iterrows()}
# sensor depth (E3): does a deeper sensor extend the reach?  irrigation by depth, sands
e3 = a[a.experiment == 'E3_SensorDepth']; NUM['E3_runs'] = len(e3)
NUM['E3_sand_irrigation'] = {SH[s]: float(e3[e3.soil == s].irrigation_mm.max()) for s in ['S03_Sand', 'S04_LoamySand']}
# ------------------------------------------------------------------ figures
from p4_callouts import callout, store
CALL = {}
def save(fig, name):
    if name in CALL:
        fig.savefig(os.path.join(OUT, name + '.pdf'), bbox_inches=None if name.startswith('fig4') else 'tight'); fig.savefig(os.path.join(OUT, name + '.png'), bbox_inches='tight', dpi=200)
        labs = []
        for n, (ax, xy, off, text) in enumerate(CALL[name], 1): callout(ax, n, xy, off); labs.append(text)
        fig.savefig(os.path.join(OUT, name + '_annot.png'), bbox_inches='tight', dpi=170); store(name, labs, ROOT); plt.close(fig); return
    _save(fig, name)
def _save(fig, name):
    fig.savefig(os.path.join(OUT, name + '.pdf'), bbox_inches=None if name.startswith('fig4') else 'tight'); fig.savefig(os.path.join(OUT, name + '.png'), bbox_inches='tight', dpi=200); plt.close(fig)
# Fig 2: the curves and the reach
hh = np.logspace(0, 5.3, 400)
fig, ax = plt.subplots(1, 3, figsize=(7.2, 3.3), constrained_layout=True)
for k, r in SO.iterrows():
    ax[0].plot(hh, Se(hh, r.al, r.n), color=COL[k], lw=1.2, label='%s %s (n = %.2f)' % (SH[k], r.lab, r.n)); ax[1].plot(hh, Kr(hh, r.al, r.n), color=COL[k], lw=1.2)
    ax[0].plot([r.hc], [Se(r.hc, r.al, r.n)], 'o', ms=4, mfc='white', mec=COL[k], mew=1.2)
    ax[1].plot([r.hc], [Kr(r.hc, r.al, r.n)], 'o', ms=4, mfc='white', mec=COL[k], mew=1.2)
for x in ax[:2]: x.set_xscale('log'); x.set_xlabel('suction $h$ (cm)'); x.axvspan(50, 10000, color='0.92', zorder=0)
ax[0].set_ylabel('effective saturation $S_e$'); ax[0].set_title('a  Retention')
ax[1].set_yscale('log'); ax[1].set_ylim(1e-16, 1.5); ax[1].set_ylabel('relative conductivity $K_r$'); ax[1].set_title('b  Conductivity')
ax[1].axhline(kap, color='k', lw=0.8, ls='--'); ax[1].text(1.3, kap * 3, r'$\kappa$', fontsize=8)
for k, r in SO.iterrows(): ax[2].plot(r.n, r.hc, 'o', color=COL[k], ms=5); ax[2].annotate(SH[k], (r.n, r.hc), xytext=OFF2.get(SH[k], (4, -2)), textcoords='offset points', fontsize=6.5, color=COL[k])
nn = np.linspace(1.2, 2.75, 100)
for alv, ls in [(0.01, ':'), (0.05, '--'), (0.15, '-')]: ax[2].plot(nn, [hc_mualem(kap, alv, x) for x in nn], 'k', lw=0.8, ls=ls, label=r'$\alpha$ = %g cm$^{-1}$' % alv)
ax[2].set_yscale('log'); ax[2].set_xlabel('van Genuchten $n$'); ax[2].set_ylabel('reach $h_c$ (cm)'); ax[2].set_title('c  Reach of a trigger'); ax[2].legend(fontsize=6.5, loc='upper right')
ax[2].axhspan(50, 10000, color='0.92', zorder=0)
ax[1].plot([], [], 'o', mfc='white', mec='k', label='reach $h_c$'); h0, l0 = ax[0].get_legend_handles_labels(); h1, l1 = ax[1].get_legend_handles_labels()
fig.legend(h0 + h1, l0 + l1, fontsize=6.5, ncol=4, loc='outside lower center')
sd = SO.loc['S03_Sand']; sc = SO.loc['S10_SiltyClayLoam']; lo = SO.loc['S06_Loam']
CALL['fig2_curves_reach'] = [
 (ax[0], (25, float(Se(25, sd.al, sd.n))), (28, 18), 'Sand: its retention curve drops almost to zero within a few tens of centimetres of suction, because its pores are nearly all the same size (large n = 2.68).'),
 (ax[0], (3000, float(Se(3000, sc.al, sc.n))), (14, 26), 'Silty clay loam: the curve falls slowly over five decades of suction, because its pores span many sizes (small n = 1.23).'),
 (ax[1], (2, kap), (10, 22), 'The dashed line is the constant kappa = 3.47e-10: the relative conductivity at which a crop can no longer dry the soil at the sensor.'),
 (ax[1], (float(sd.hc), kap), (-26, -22), 'The reach of sand (199 cm) is where its conductivity curve crosses kappa; the steep curve crosses early.'),
 (ax[1], (float(sc.hc), kap), (-8, 30), 'The reach of silty clay loam (128 260 cm): its gentle curve crosses kappa only far in the dry range.'),
 (ax[2], (float(lo.n), float(lo.hc)), (26, 22), 'Each point is the reach of one soil from Eq. (4); the reach falls as n grows. The three lines are Eq. (4) for three values of alpha: a smaller alpha gives a longer reach.'),
 (ax[2], (2.5, 3000), (0, 0), 'Grey band: the range of triggers tested in the simulations (50 to 10 000 cm). Soils whose reach lies inside the band have a trigger beyond which irrigation stops.')]
save(fig, 'fig2_curves_reach')
# Fig 3: E2 trigger response raw and scaled, reach prediction, yield
fig, ax = plt.subplots(2, 2, figsize=(7.2, 5.6), constrained_layout=True)
for k in SO.index:
    d = e2[e2.soil == k].sort_values('ht')
    ax[0, 0].plot(d.ht, d.irrigation_mm, '-o', color=COL[k], ms=2.5, lw=1, label=SH[k] + ' ' + SO.loc[k].lab)
    ax[0, 1].plot(d.x, d.Inorm, '-o', color=COL[k], ms=2.5, lw=1)
    ax[1, 1].plot(d.ht, d.yield_Mg_ha, '-o', color=COL[k], ms=2.5, lw=1)
ax[0, 0].set_xscale('log'); ax[0, 0].set_xlabel('trigger suction $h_t$ (cm)'); ax[0, 0].set_ylabel('irrigation (mm yr$^{-1}$)'); ax[0, 0].set_title('a  Irrigation against the trigger')
h, l = ax[0, 0].get_legend_handles_labels(); fig.legend(h, l, fontsize=6.5, ncol=5, loc='outside lower center')
ax[0, 1].set_xscale('log'); ax[0, 1].axvline(1, color='k', lw=0.8, ls='--'); ax[0, 1].set_xlabel('$h_t/h_c$ (trigger over reach)'); ax[0, 1].set_ylabel('irrigation / soil maximum'); ax[0, 1].set_title('b  The same runs on the reach scale')
ax[0, 1].text(0.03, 0.04, 'within-bin variance: %.0f %% of total\n(on $h_t$ alone: %.0f %%)' % (100 * NUM['collapse_scaled'], 100 * NUM['collapse_raw_h']), transform=ax[0, 1].transAxes, fontsize=6.5)
for k, r in SO.iterrows():
    hi = r.hi if np.isfinite(r.hi) else 2e5
    ax[1, 0].plot([r.hc, r.hc], [r.lo, hi], color=COL[k], lw=3, alpha=0.6, solid_capstyle='butt')
    ax[1, 0].plot(r.hc, r.lo, 'o', color=COL[k], ms=3.5); ax[1, 0].annotate(SH[k], (r.hc, r.lo), xytext=OFF3.get(SH[k], (4, -6)), textcoords='offset points', fontsize=6.5, color=COL[k])
    if not np.isfinite(r.hi): ax[1, 0].annotate('', xy=(r.hc, 2e5), xytext=(r.hc, r.lo * 1.5), arrowprops=dict(arrowstyle='->', color=COL[k], lw=0.8))
lim = [40, 3e5]; ax[1, 0].plot(lim, lim, 'k', lw=0.7); ax[1, 0].fill_between(lim, [l / 2 for l in lim], [l * 2 for l in lim], color='0.9', zorder=0)
ax[1, 0].set_xscale('log'); ax[1, 0].set_yscale('log'); ax[1, 0].set_xlim(lim); ax[1, 0].set_ylim(lim)
ax[1, 0].set_xlabel('predicted reach $h_c$ (cm), Eq. (4)'); ax[1, 0].set_ylabel('observed reach interval (cm)'); ax[1, 0].set_title('c  Closed form against Daisy')
ax[1, 1].set_xscale('log'); ax[1, 1].set_xlabel('trigger suction $h_t$ (cm)'); ax[1, 1].set_ylabel('yield (Mg ha$^{-1}$)'); ax[1, 1].set_title('d  Yield: a trigger beyond the reach is rainfed')
s3 = e2[e2.soil == 'S03_Sand']; s10 = SO.loc['S10_SiltyClayLoam']
CALL['fig3_trigger_reach'] = [
 (ax[0, 0], (100, 6), (22, 26), 'Sand: irrigation falls to zero at 100 to 150 cm. Every drier trigger, including the common 300 cm, is never reached.'),
 (ax[0, 0], (10000, 95), (-22, 26), 'Silty clay loam still irrigates at 10 000 cm, because its conductivity fades slowly and the crop can keep drying the soil.'),
 (ax[0, 1], (1, 0.5), (22, 18), 'The dashed line is the reach (trigger / reach = 1). On this scaled axis every soil stops irrigating between 0.5 and 1.'),
 (ax[1, 0], (float(SO.loc['S03_Sand'].hc), 100), (26, 6), 'Sand: the bar is the observed interval (100 to 150 cm) and the dot its lower end; the prediction of Eq. (4) (199 cm) lies within a factor of two.'),
 (ax[1, 0], (float(s10.hc), 60000), (-28, 6), 'An arrow means that even the driest trigger tested (10 000 cm) still fired, so only a lower bound of the reach is known.'),
 (ax[1, 0], (300, 450), (-24, 22), 'Grey band: within a factor of two of the 1:1 line (black). Points in the band are predicted well.'),
 (ax[1, 1], (1000, 1.13), (0, 24), 'Sand beyond its reach: the yield stays at the rainfed value (1.13 Mg/ha) because the field is never irrigated.')]
save(fig, 'fig3_trigger_reach')
# Fig 4: marginal fate stacked bars per soil (E10) and per method (E4, E15)
order = [k for k in SO.sort_values('n', ascending=False).index if k in fate.index]
cats = [('dT', 'transpiration', '#009E73'), ('dE', 'soil evaporation', '#E69F00'), ('dO', 'other evaporation\n(canopy, ponds, litter)', '#F0E442'), ('dD', 'drainage below 1 m', '#0072B2'), ('dS', 'storage and runoff', '#BBBBBB')]
fig, ax = plt.subplots(1, 2, figsize=(7.2, 3.3), gridspec_kw={'width_ratios': [1.75, 1.25]})
fig.subplots_adjust(left=0.08, right=0.99, top=0.9, bottom=0.27, wspace=0.28)
lab = [SH[k] + '\nn=%.2f' % SO.loc[k].n for k in order]
bot = np.zeros(len(order))
for c, nm, cl in cats:
    v = fate.loc[order, c].values; ax[0].bar(range(len(order)), v, bottom=bot, color=cl, edgecolor='white', lw=0.5, width=0.78, label=nm)
    for i, (b0, x) in enumerate(zip(bot, v)):
        if x > 0.06: ax[0].text(i, b0 + x / 2, '%.2f' % x, ha='center', va='center', fontsize=6)
    bot += v
ax[0].set_xticks(range(len(order))); ax[0].set_xticklabels(lab, fontsize=6.3); ax[0].set_ylabel('share of each irrigation millimetre'); ax[0].set_ylim(0, 1.02)
ax[0].set_title('a  Soils (E10, %d irrigated runs)' % len(e10i))
mm = [('surface', 'E4'), ('overhead', 'E4'), ('subsoil', 'E4'), ('surface', 'E15'), ('overhead', 'E15'), ('subsoil', 'E15')]
pos = np.zeros(len(mm)); neg = np.zeros(len(mm))
for c, nm, cl in cats[:4]:
    v = np.array([NUM['methods_' + ex][k][c] for k, ex in mm]); b0 = np.where(v >= 0, pos, neg)
    ax[1].bar(range(len(mm)), v, bottom=b0, color=cl, edgecolor='white', lw=0.5, width=0.78)
    for i, (bb, x) in enumerate(zip(b0, v)):
        if abs(x) > 0.06: ax[1].text(i, bb + x / 2, '%.2f' % x, ha='center', va='center', fontsize=6)
    pos += np.where(v > 0, v, 0); neg += np.where(v < 0, v, 0)
ax[1].axhline(0, color='k', lw=0.6); ax[1].set_xticks(range(len(mm))); ax[1].set_xticklabels([k + '\n' + ex for k, ex in mm], fontsize=6.3); ax[1].set_title('b  Methods (E4 all soils; E15 coarse loam)')
ax[1].axvline(2.5, color='0.6', lw=0.6, ls=':'); ax[1].set_ylim(-0.12, 1.08)
h, l = ax[0].get_legend_handles_labels(); fig.legend(h, [x.replace('\n', ' ') for x in l], fontsize=6.6, loc='lower center', ncol=5, bbox_to_anchor=(0.5, 0.0))
CALL['fig4_marginal_fate'] = [
 (ax[0], (0, 0.32), (-22, -20), 'Sandy loam transpires the largest share of each irrigation millimetre (0.64): it holds the water near the roots and loses little to the surface.'),
 (ax[0], (1, 0.84), (22, 16), 'Coarse sand: drainage below 1 m is the largest single loss (0.32), because the soil passes extra water on before the crop can use it.'),
 (ax[1], (1, -0.04), (22, -10), 'Overhead irrigation: the transpired share is negative (-0.08). Water intercepted by the canopy evaporates with the energy that would have driven transpiration.'),
 (ax[1], (1, 0.5), (36, 22), 'Most of the overhead water (0.79) leaves as other evaporation: canopy interception, ponds and litter.'),
 (ax[1], (2, 0.84), (24, 30), 'Subsurface application transpires most (0.51) but also drains most (0.23), because it wets the profile from within.')]
save(fig, 'fig4_marginal_fate')
# Fig 5: dose response
fig, ax = plt.subplots(1, 3, figsize=(7.2, 3.2), constrained_layout=True)
dd = np.linspace(0.5, 31, 200)
for k in order:
    r = DR[k]; ax[0].plot(r['dose'], r['etaD'], 'o', color=COL[k], ms=3); ax[0].plot(dd, satf(dd, r['inf'], r['dD']), color=COL[k], lw=0.9)
    ax[1].plot(r['dose'], r['etaT'], '-o', color=COL[k], ms=2.5, lw=0.9); ax[2].plot(r['dose'], r['etaEO'], '-o', color=COL[k], ms=2.5, lw=0.9, label='%s %s' % (SH[k], SO.loc[k].lab))
for x, t, yl in zip(ax, ['a  Drained share', 'b  Transpired share', 'c  Evaporated share'], [r'share drained, $\eta_D$', r'share transpired, $\eta_T$', r'share evaporated, $\eta_E+\eta_O$']):
    x.set_xscale('log'); x.set_xlabel('dose per event (mm)'); x.set_ylabel(yl); x.set_title(t)
ax[0].plot([], [], 'k-', lw=0.9, label='fit, Eq. (6)'); ax[0].plot([], [], 'ko', ms=3, label='Daisy runs (E10)')
h0, l0 = ax[2].get_legend_handles_labels(); h1, l1 = ax[0].get_legend_handles_labels(); fig.legend(h0 + h1[-2:], l0 + l1[-2:], fontsize=6.5, ncol=5, loc='outside lower center')
for x in ax: x.set_ylim(bottom=0)
cs = DR['S02_CoarseSand']; lm = DR['S06_Loam']
CALL['fig5_dose'] = [
 (ax[0], (25, cs['inf']), (-20, 14), 'Plateau of coarse sand (0.45): the share of a large dose that drains. It is set by the soil, which passes water on fast.'),
 (ax[0], (1, 0.02), (16, 22), 'Doses of 1 to 2 mm hardly drain (0.01 to 0.09): they are used near the surface on the day they are applied.'),
 (ax[0], (lm['dD'], float(satf(lm['dD'], lm['inf'], lm['dD']))), (-22, 22), 'The dose scale d_D (about 4 mm in every soil): at d = d_D the drained share reaches 63 % of its plateau. It is about one day of crop water use.'),
 (ax[1], (15, 0.71), (14, -22), 'The transpired share rises with the dose and peaks at 15 to 20 mm, because less of a larger dose is lost from the wet surface.'),
 (ax[2], (1, 0.7), (22, -16), 'At 1 mm, 60 to 72 % of the dose evaporates: small doses trade drainage for evaporation.')]
save(fig, 'fig5_dose')
json.dump(NUM, open(RES, 'w'), indent=1, default=float)
print(json.dumps({k: NUM[k] for k in ['kappa', 'collapse_raw_h', 'collapse_scaled', 'spearman_scaled', 'fate_E10_all', 'methods_E4', 'methods_E15', 'blind_300']}, indent=1, default=float))
for nm, r in REACH.items(): print(nm, r['theta'], r['loso_rms_log10'], r['loso_inside'], r['loso_max_factor'], r['loso_err_log10'])
print(pd.DataFrame(NUM['dose']).T); print(NUM['dose_predictors']); print(NUM['window']); print(NUM['E3_sand_irrigation'])
# ------------------------------------------------------------------ tables of the paper as CSV (read by Data/Manuscript_Data/make_workbook.py)
RD = os.path.join(ROOT, 'Manuscripts/results')
t = SO[['lab', 'al', 'n', 'taw', 'lo', 'hi', 'hc']].copy(); t.index = [SH[k] for k in t.index]
t['yield_at_300'] = [NUM['yield_E2'][k]['at300'] for k in t.index]; t['yield_rainfed'] = [NUM['yield_E2'][k]['rainfed'] for k in t.index]; t['yield_best'] = [NUM['yield_E2'][k]['best'] for k in t.index]
t.rename(columns={'lab': 'soil', 'al': 'alpha_1_per_cm', 'n': 'n', 'taw': 'TAW_mm', 'lo': 'reach_observed_low_cm', 'hi': 'reach_observed_high_cm', 'hc': 'reach_Eq4_cm'}).to_csv(os.path.join(RD, 'p4_tableA1_reach.csv'), index_label='id')
pd.DataFrame([{'law': k, 'theta': ' '.join('%.4g' % x for x in v['theta']), 'loso_rmse_log10': v['loso_rmse_log10'] if 'loso_rmse_log10' in v else v['loso_rms_log10'], 'inside_of_10': v['loso_inside'], 'worst_factor': v['loso_max_factor']} for k, v in REACH.items()]).to_csv(os.path.join(RD, 'p4_table2_laws.csv'), index=False)
e2[['soil', 'ht', 'irrigation_mm', 'yield_Mg_ha', 'x', 'Inorm']].rename(columns={'ht': 'trigger_cm', 'x': 'trigger_over_reach'}).to_csv(os.path.join(RD, 'p4_fig3_trigger_runs.csv'), index=False)
f2 = fate.copy(); f2.index = [SH[k] for k in f2.index]; f2.columns = ['transpired', 'soil_evaporation', 'other_evaporation', 'drained', 'storage_runoff']; f2.to_csv(os.path.join(RD, 'p4_fig4a_fate_by_soil.csv'), index_label='soil')
pd.DataFrame([{'experiment': ex, 'method': k, **v} for ex in ['E4', 'E15'] for k, v in NUM['methods_' + ex].items()]).rename(columns={'dT': 'transpired', 'dE': 'soil_evaporation', 'dO': 'other_evaporation', 'dD': 'drained'}).to_csv(os.path.join(RD, 'p4_fig4b_fate_by_method.csv'), index=False)
pd.DataFrame([{'soil': SH[k], 'dose_mm': d, 'drained': a1, 'transpired': b1, 'evaporated': c1, 'fit_plateau': r['inf'], 'fit_dose_scale_mm': r['dD'], 'fit_R2': r['r2']} for k, r in DR.items() for d, a1, b1, c1 in zip(r['dose'], r['etaD'], r['etaT'], r['etaEO'])]).to_csv(os.path.join(RD, 'p4_fig5_dose.csv'), index=False)
pd.DataFrame([{'window': k, **v} for k, v in NUM['window'].items()]).to_csv(os.path.join(RD, 'p4_window.csv'), index=False)
