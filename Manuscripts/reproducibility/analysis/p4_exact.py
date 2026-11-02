"""Paper 4 supplement: graphs that show the exact points behind the worked numbers.
Each graph is written with numbered callouts (figures/paper4/ex_*.png) and a LaTeX block (tex/s4_ex_*.tex)
that lists what every label points to, the exact value and how it is computed from the data."""
import os, json, sys, numpy as np, pandas as pd
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from p4_callouts import callout
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
RES = os.path.join(ROOT, 'Manuscripts/results'); OUT = os.path.join(ROOT, 'Manuscripts/figures/paper4'); TEX = os.path.join(ROOT, 'Manuscripts/tex')
N = json.load(open(os.path.join(RES, 'p4_numbers.json'))); C = N['constants']; KAP = N['kappa']
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8})
A1 = pd.read_csv(os.path.join(RES, 'p4_tableA1_reach.csv')).set_index('id')
TR = pd.read_csv(os.path.join(RES, 'p4_fig3_trigger_runs.csv')); DO = pd.read_csv(os.path.join(RES, 'p4_fig5_dose.csv'))
SAND, LOAM = '#D55E00', '#0072B2'
def Se(h, al, n): return (1 + (al * h) ** n) ** (-(1 - 1 / n))
def Kr(h, al, n, l=0.5):
    m = 1 - 1 / n; s = Se(h, al, n); return s ** l * (1 - (1 - s ** (1 / m)) ** m) ** 2
def hc(kap, al, n, l=0.5): m = 1 - 1 / n; return (m * m / kap) ** (1 / (2 * n + l * (n - 1))) / al
BLOCKS = {}
def write(name, title, intro, labels, how, fig):
    fig.savefig(os.path.join(OUT, name + '.png'), dpi=170, bbox_inches='tight'); plt.close(fig)
    items = '\n'.join('\\item ' + t for t in labels)
    tex = ('\\subsection{%s}\n%s\n\\begin{center}\\includegraphics[width=0.92\\textwidth]{../figures/paper4/%s.png}\\end{center}\n'
           '\\textbf{What the numbered labels point to, with the exact values.}\n\\begin{enumerate}[nosep,label=\\protect\\circled{\\arabic*}]\n%s\n\\end{enumerate}\n'
           '\\textbf{How the exact points are obtained from the data.} %s\n') % (title, intro, name, items, how)
    open(os.path.join(TEX, 's4_' + name.replace('ex_', 'ex') + '.tex'), 'w').write(tex); BLOCKS[name] = labels
# ------------------------------------------------------------ 1. conductivity curves and the exact reach
s, l = A1.loc['S03'], A1.loc['S06']
hh = np.logspace(0, 5, 500)
fig, ax = plt.subplots(figsize=(6.6, 3.6))
for r, c, nm in [(s, SAND, 'sand (S03)'), (l, LOAM, 'loam (S06)')]:
    ax.plot(hh, Kr(hh, r.alpha_1_per_cm, r.n), color=c, lw=1.6, label=nm + ': exact Mualem $K_r$')
    m = 1 - 1 / r.n; E = 2 * r.n + 0.5 * (r.n - 1); hd = hh[r.alpha_1_per_cm * hh > 3]
    ax.plot(hd, m * m * (r.alpha_1_per_cm * hd) ** (-E), color=c, lw=0.9, ls=':', label=nm + ': dry-end line $m^2(\\alpha h)^{-E}$')
ax.axhline(KAP, color='k', lw=0.9, ls='--')
hs, hl = hc(KAP, s.alpha_1_per_cm, s.n), hc(KAP, l.alpha_1_per_cm, l.n)
ax.plot([hs], [KAP], 'o', color=SAND, ms=6, mec='k'); ax.plot([hl], [KAP], 'o', color=LOAM, ms=6, mec='k')
ax.axvline(hs, color=SAND, lw=0.7, ls='--'); ax.axvline(hl, color=LOAM, lw=0.7, ls='--')
ax.axvspan(300, 600, color='0.88', zorder=0)
ax.set_xscale('log'); ax.set_yscale('log'); ax.set_ylim(1e-16, 2); ax.set_xlabel('suction $h$ (cm)'); ax.set_ylabel('relative conductivity $K_r$')
ax.text(1.3, KAP * 4, '$\\kappa=3.47\\times10^{-10}$', fontsize=7.5)
ax.text(hs * 1.08, 1e-14, '%.0f cm' % hs, color=SAND, fontsize=7.5); ax.text(hl * 1.08, 1e-14, '%.0f cm' % hl, color=LOAM, fontsize=7.5)
ax.legend(fontsize=6.3, frameon=False, loc='lower left'); [ax.spines[k].set_visible(False) for k in ['top', 'right']]
ks = Kr(100, s.alpha_1_per_cm, s.n)
ax.plot([100], [ks], 's', color=SAND, ms=4)
L = [(ax, (hs, KAP), (-44, -26), 'Sand: the exact curve crosses the dashed line $K_r=\\kappa$ at $h_c=%.0f$\\,cm (dot). This is \\cref{eq:s-hc} with $\\alpha=0.145$, $n=2.68$, $\\ell=0.5$.' % hs),
     (ax, (hl, KAP), (24, 22), 'Loam: the crossing is at $h_c=%s$\\,cm, just below $10^4$\\,cm, with $\\alpha=0.036$, $n=1.56$.' % ('{:,.0f}'.format(hl).replace(',', '\\,'))),
     (ax, (100, ks), (-34, 14), 'Sand at field capacity (100\\,cm): $K_r=%.1f\\times10^{%d}$, a fraction of the saturated conductivity that is already tiny; the worked example of Part~2 of the guide.' % (ks / 10 ** np.floor(np.log10(ks)), int(np.floor(np.log10(ks))))),
     (ax, (2000, m * m * 0 + 1e-6 if False else (1 - 1 / l.n) ** 2 * (l.alpha_1_per_cm * 2000) ** (-(2 * l.n + 0.5 * (l.n - 1)))), (20, 18), 'Dotted lines: the dry-end straight line $m^2(\\alpha h)^{-E}$. It lies on the exact curve wherever $\\alpha h\\gg1$, which is why the closed form of the reach is accurate.'),
     (ax, (420, 1e-3), (24, 18), 'Grey band (300--600\\,cm): the usual triggers. They lie beyond the reach of sand and well inside the reach of loam.'),
     (ax, (3, KAP), (0, -20), 'The constant $\\kappa$: the relative conductivity below which a crop can no longer dry the soil at the sensor within a season; one value for all ten soils.')]
for n, (a_, xy, off, t) in enumerate(L, 1): callout(a_, n, xy, off)
write('ex_kr', 'Exact points: where the conductivity meets $\\kappa$',
      'This graph places the two worked examples of the guide on the curves. The reach is not read off by eye: it is the suction where the conductivity curve of the soil crosses the horizontal line $K_r=\\kappa$.',
      [t for *_, t in L],
      'The curves are the Mualem conductivity computed from $\\alpha$ and $n$ of each soil (Table~A1 of the article, \\nolinkurl{Manuscripts/results/p4_tableA1_reach.csv}). $\\kappa$ is the fitted constant of \\nolinkurl{p4_numbers.json} (key \\texttt{kappa}), obtained from experiment E2 as shown in the next graph. The two crossings are computed with \\cref{eq:s-hc}; the same numbers are in the workbook sheet \\texttt{EQ\\_P4\\_reach}, cells of S03 and S06.', fig)
# ------------------------------------------------------------ 2. the objective function of kappa
SO = A1.copy(); SO['lo'] = SO.reach_observed_low_cm; SO['hi'] = SO.reach_observed_high_cm.replace(np.inf, 1e99)
def ivl(p, lo, hi):
    lp, x, y = np.log10(p), np.log10(lo), np.log10(hi) if hi < 1e90 else 99.
    return (x - lp) if lp < x else ((lp - y) if lp > y else 0.)
def loss(lk, idx=None):
    idx = list(SO.index) if idx is None else idx
    return sum(ivl(hc(10 ** lk, SO.loc[k].alpha_1_per_cm, SO.loc[k].n), SO.loc[k].lo, SO.loc[k].hi) ** 2 for k in idx)
g = np.linspace(-12, -7, 401); Lg = np.array([loss(x) for x in g])
fig, ax = plt.subplots(figsize=(6.6, 3.3))
ax.plot(g, Lg, color='k', lw=1.6, label='all ten soils')
for k in ['S03', 'S04', 'S05']:
    idx = [j for j in SO.index if j != k]; ax.plot(g, [loss(x, idx) for x in g], lw=0.8, ls='--', label='without %s' % k)
lo, hi = C['kappa_boot_log10_ci95']; ax.axvspan(lo, hi, color='#fde3c8', zorder=0, label='bootstrap 95 % interval')
lk = np.log10(KAP)
_m = [(k, ivl(hc(KAP, SO.loc[k].alpha_1_per_cm, SO.loc[k].n), SO.loc[k].lo, SO.loc[k].hi)) for k in SO.index]
_m = [(k, e) for k, e in _m if e != 0]
MISS = '%d soils lie outside their interval: ' % len(_m) + ', '.join('%s by %.2f decade' % (k, abs(e)) for k, e in _m) + '; the other %d lie inside' % (10 - len(_m))
ax.plot([lk], [loss(lk)], 'o', color='#b2182b', ms=6, mec='k')
ax.set_xlabel('$\\log_{10}\\kappa$'); ax.set_ylabel('loss $L$ (decades$^2$)'); ax.set_ylim(0, max(1.5, loss(lk) * 6))
ax.legend(fontsize=6.5, frameon=False, loc='upper right'); [ax.spines[q].set_visible(False) for q in ['top', 'right']]
L = [(ax, (lk, loss(lk)), (-6, 30), 'The minimum: $\\log_{10}\\kappa=%.2f$, $\\kappa=3.47\\times10^{-10}$, loss $L=%.3f$\\,decades$^2$. At this value %s.' % (lk, loss(lk), MISS)),
     (ax, (lo, 0.05 * ax.get_ylim()[1]), (-26, 22), 'Left edge of the bootstrap interval, $\\kappa=%.1e$: resampling the ten soils with replacement 1\\,000 times and refitting.' % 10 ** lo),
     (ax, (hi, 0.05 * ax.get_ylim()[1]), (24, 22), 'Right edge, $\\kappa=%.1e$. The interval spans 1.5 decades, but the reach changes only by a factor 1.45 to 2.45 per decade of $\\kappa$.' % 10 ** hi),
     (ax, (-11.3, loss(-11.3)), (20, 10), 'Too small a $\\kappa$ puts every predicted reach too far into the dry range: the soils with a finite interval (sand, loamy sand, sandy loam) are missed and the loss rises.'),
     (ax, (-7.6, loss(-7.6)), (-24, 10), 'Too large a $\\kappa$ predicts reaches that are too short: soils whose triggers fire up to $10^4$\\,cm are missed.')]
for n, (a_, xy, off, t) in enumerate(L, 1): callout(a_, n, xy, off)
write('ex_kappa', 'Exact points: how the single constant $\\kappa$ is found',
      'The loss counts, for every soil, how many decades the predicted reach lies outside the interval observed in the simulations (zero when inside), squared and summed. The constant is the value of $\\kappa$ at the bottom of this curve.',
      [t for *_, t in L],
      'The observed intervals are the columns \\texttt{reach\\_observed\\_low\\_cm} and \\texttt{reach\\_observed\\_high\\_cm} of Table~A1, from experiment E2 (next graph). The predicted reach for each trial $\\kappa$ is \\cref{eq:s-hc}. The minimum was found with the Nelder--Mead method in \\nolinkurl{p4_reach.py} (function \\texttt{fitm}); the bootstrap and the curves without one soil are in \\nolinkurl{p4_numbers.json} under \\texttt{constants}. The flat bottom of the curve is why $\\kappa$ is uncertain by a decade while the reaches are not: every reach depends on $\\kappa$ only through the power $1/[2n+\\ell(n-1)]$.', fig)
# ------------------------------------------------------------ 3. experiment E2: irrigation against trigger
fig, axs = plt.subplots(1, 2, figsize=(7.0, 3.2), constrained_layout=True)
LL = []
for a_, sid, r, c, iv in [(axs[0], 'S03_Sand', s, SAND, (100, 150)), (axs[1], 'S06_Loam', l, LOAM, (5000, 10000))]:
    d = TR[TR.soil == sid].sort_values('trigger_cm'); a_.plot(d.trigger_cm, d.irrigation_mm, 'o-', color=c, ms=3.5, lw=1.1)
    a_.axhline(5, color='k', lw=0.8, ls='--'); a_.axvspan(*iv, color='#d9f0d3', zorder=0)
    h = hc(KAP, r.alpha_1_per_cm, r.n); a_.axvline(h, color=c, lw=1, ls='--')
    a_.set_xscale('log'); a_.set_xlabel('trigger suction $h_t$ (cm)'); a_.set_ylabel('irrigation (mm per year)'); a_.set_title(sid.replace('_', ' '), fontsize=8, loc='left', weight='bold')
    a_.set_yscale('symlog', linthresh=5); a_.set_ylim(0, d.irrigation_mm.max() * 1.6); [a_.spines[q].set_visible(False) for q in ['top', 'right']]
    last = d[d.irrigation_mm >= 5].iloc[-1]; nxt = d[(d.trigger_cm > last.trigger_cm)].iloc[0]
    LL.append((a_, d, h, last, nxt, iv))
a0, d0, h0, la0, nx0, _ = LL[0]; a1, d1, h1, la1, nx1, _ = LL[1]
L = [(a0, (la0.trigger_cm, la0.irrigation_mm), (22, 16), 'Sand, the driest trigger that still fires: %.0f\\,cm brings %.2f\\,mm a year, above the 5\\,mm line.' % (la0.trigger_cm, la0.irrigation_mm)),
     (a0, (nx0.trigger_cm, 0), (14, 26), 'Sand, the next trigger, %.0f\\,cm, brings %.1f\\,mm: it never fires. The observed reach lies between the two (green band, 100--150\\,cm).' % (nx0.trigger_cm, nx0.irrigation_mm)),
     (a0, (h0, 30), (22, 8), 'The reach predicted by the closed form, %.0f\\,cm (dashed): a third above the band, the largest miss among the soils with a finite interval.' % h0),
     (a0, (1500, 5), (0, 14), 'The 5\\,mm a year threshold that defines ``fires''; with 1, 10, 20 or 40\\,mm the fitted $\\kappa$ becomes 2.7, 7.3, 13 or 25 $\\times10^{-10}$.'),
     (a1, (la1.trigger_cm, la1.irrigation_mm), (-26, 16), 'Loam, the driest trigger that fires: %.0f\\,cm brings %.2f\\,mm a year.' % (la1.trigger_cm, la1.irrigation_mm)),
     (a1, (h1, 30), (-30, 10), 'Predicted reach of loam, %s\\,cm: inside the observed band 5\\,000--10\\,000\\,cm.' % '{:,.0f}'.format(h1).replace(',', '\\,')),
     (a1, (300, float(d1[d1.trigger_cm == 300].irrigation_mm.iloc[0])), (16, -18), 'Loam at the usual 300\\,cm trigger: %.0f\\,mm a year of irrigation, the trigger works.' % float(d1[d1.trigger_cm == 300].irrigation_mm.iloc[0]))]
for n, (a_, xy, off, t) in enumerate(L, 1): callout(a_, n, xy, off)
write('ex_e2', 'Exact points: the observed reach in experiment E2',
      'Experiment E2 runs the same crop rotation and weather with one suction trigger at a time. Each dot is one run: its trigger and the irrigation it brought per year.',
      [t for *_, t in L],
      'E2 is the experiment \\texttt{E2\\_TriggerPressure} of \\nolinkurl{Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz}: 10 soils $\\times$ %d triggers (20 to 10\\,000\\,cm), sensor at %s\\,cm, dose %s\\,mm, crop file \\texttt{%s}, weather Taastrup 1980--1999. For each soil the script \\nolinkurl{p4_reach.py} takes the column \\texttt{set\\_trigger\\_potential\\_cm} (sign changed) and \\texttt{irrigation\\_mm}; the largest trigger with at least 5\\,mm a year is the lower end of the interval, the next larger trigger the upper end. These points are in \\nolinkurl{p4_fig3_trigger_runs.csv}.' % (len(d0), C['E2_sensor_depth_cm'] if not isinstance(C['E2_sensor_depth_cm'], (list, dict)) else '20', C['E2_dose_mm'] if not isinstance(C['E2_dose_mm'], (list, dict)) else '2.4', 'crops\\_conv\\_N100.dai'), fig)
# ------------------------------------------------------------ 4. the fate of one irrigated run
I, dT, dD, dEs, dEo = 222.5, 75.4, 33.4, 82.4, 20.6; dS = I - dT - dD - dEs - dEo
parts = [('transpiration', dT, '#009E73'), ('soil evaporation', dEs, '#E69F00'), ('other evaporation', dEo, '#c7b800'), ('drainage', dD, '#0072B2'), ('storage and runoff', dS, '0.6')]
fig, ax = plt.subplots(figsize=(6.6, 2.4)); x0 = 0
for nm, v, c in parts:
    ax.barh([0], [v], left=x0, color=c, edgecolor='white', label=nm); ax.text(x0 + v / 2, 0 if v > 15 else -0.62, '%.1f mm\n$\\eta$=%.2f' % (v, v / I), ha='center', va='center', fontsize=6.3, color=('white' if c != '#c7b800' else 'k') if v > 15 else 'k'); x0 += v
ax.set_xlim(0, I * 1.02); ax.set_ylim(-0.9, 1.0); ax.legend(ncol=5, fontsize=6.3, frameon=False, loc='upper center', bbox_to_anchor=(0.5, 1.22)); ax.set_yticks([]); ax.set_xlabel('mm per year of the irrigated run in excess of the rainfed twin'); [ax.spines[q].set_visible(False) for q in ['top', 'right', 'left']]
L = [(ax, (dT / 2, 0.38), (0, 16), 'Transpiration: 223.0 $-$ 147.6 = 75.4\\,mm; $\\eta_T=75.4/222.5=0.34$.'),
     (ax, (dT + dEs / 2, 0.38), (0, 16), 'Soil evaporation: 82.4\\,mm more than the rainfed twin; $\\eta_{E_s}=0.37$, the largest share in this run because the surface is wetted every few days.'),
     (ax, (dT + dEs + dEo / 2, 0.38), (0, 16), 'Other evaporation (interception, ponds, litter): 20.6\\,mm; $\\eta_{E_o}=0.09$.'),
     (ax, (dT + dEs + dEo + dD / 2, 0.38), (0, 16), 'Drainage below 1\\,m: 39.5 $-$ 6.1 = 33.4\\,mm; $\\eta_D=0.15$.'),
     (ax, (I - dS / 2, 0.38), (6, 16), 'The rest, %.1f\\,mm, is the change of storage and runoff, obtained by difference so that the shares add to one.' % dS),
     (ax, (I, 0.4), (16, 6), 'The whole bar is the irrigation of the run, $I=222.5$\\,mm a year: one bar is one irrigated millimetre scaled up.')]
for n, (a_, xy, off, t) in enumerate(L, 1): callout(a_, n, xy, off)
write('ex_fate', 'Exact points: the fate of the irrigation of one run',
      'The worked example of the guide (coarse loam, dose 10\\,mm, April to October) drawn as one bar. Each segment is the difference between a flux of the irrigated run and the same flux of the rainfed run of the same soil and weather.',
      [t for *_, t in L],
      'The irrigated run is in experiment E10 and its rainfed twin in E0 (baseline of the same soil) of \\nolinkurl{00_summary_all_simulations.csv.gz}; the columns used are \\texttt{irrigation\\_mm}, \\texttt{transpiration\\_mm}, \\texttt{soil\\_evap\\_mm}, \\texttt{ET\\_mm} (other evaporation $=$ ET $-$ transpiration $-$ soil evaporation) and \\texttt{drainage\\_1m\\_mm}; storage and runoff are $I-\\Delta ET-\\Delta D$. The article pools all irrigated runs of E10 of a soil (irrigation above 20\\,mm a year) before dividing; the workbook sheet \\texttt{EQ\\_P4\\_fate} repeats the pooled calculation with SUMIFS formulas.', fig)
# ------------------------------------------------------------ 5. the dose law of loam
d = DO[DO.soil == 'S06']; einf, dd = float(d.fit_plateau.iloc[0]), float(d.fit_dose_scale_mm.iloc[0])
x = np.linspace(0, 32, 300); fig, ax = plt.subplots(figsize=(6.6, 3.2))
ax.plot(x, einf * (1 - np.exp(-x / dd)), color=LOAM, lw=1.6, label='fitted law $\\eta_D=\\eta_\\infty(1-e^{-d/d_D})$')
ax.plot(d.dose_mm, d.drained, 'o', color='k', ms=4, label='simulated share drained (loam, E10)')
ax.axhline(einf, color=LOAM, lw=0.8, ls='--'); ax.axvline(dd, color='0.5', lw=0.8, ls=':')
pts = [1, dd, 10, 30]
for p in pts: ax.plot([p], [einf * (1 - np.exp(-p / dd))], 's', color='#b2182b', ms=5)
ax.set_xlabel('dose $d$ (mm per application)'); ax.set_ylabel('share drained $\\eta_D$'); ax.set_ylim(0, 0.25); ax.legend(fontsize=6.5, frameon=False, loc='lower right'); [ax.spines[q].set_visible(False) for q in ['top', 'right']]
f = lambda p: einf * (1 - np.exp(-p / dd))
L = [(ax, (1, f(1)), (18, 16), '$d=1$\\,mm: $1-e^{-1/%.1f}=0.23$; $\\eta_D=%.3f$. A small dose is used the same day and almost nothing drains.' % (dd, f(1))),
     (ax, (dd, f(dd)), (-26, 16), '$d=d_D=%.1f$\\,mm: by definition $\\eta_D=\\eta_\\infty(1-e^{-1})=0.63\\,\\eta_\\infty=%.3f$.' % (dd, f(dd))),
     (ax, (10, f(10)), (10, -24), '$d=10$\\,mm: $\\eta_D=%.3f$, already 92\\,\\%% of the plateau.' % f(10)),
     (ax, (30, f(30)), (-14, -24), '$d=30$\\,mm: $\\eta_D=%.3f$, practically the plateau.' % f(30)),
     (ax, (22, einf), (0, 14), 'The plateau $\\eta_\\infty=%.3f$ of loam: the share of a large dose that drains, set by the race between drainage and uptake.' % einf)]
for n, (a_, xy, off, t) in enumerate(L, 1): callout(a_, n, xy, off)
write('ex_dose', 'Exact points: the dose law of loam',
      'The worked example of Part~8 of the guide on its curve: the share of each irrigation millimetre that drains, against the dose applied at each event.',
      [t for *_, t in L],
      'The black dots come from experiment E10 (\\texttt{E10\\_Amount\\_Timing\\_Soil}): the irrigated runs of loam are grouped by the dose per event (column \\texttt{set\\_dose\\_mm\\_per\\_event}, 1 to 30\\,mm, all irrigation windows pooled), and for each dose the summed extra drainage over the rainfed twin (E0) is divided by the summed irrigation. They are stored in \\nolinkurl{p4_fig5_dose.csv}. The curve is the least-squares fit of the two parameters $\\eta_\\infty$ and $d_D$ (\\texttt{scipy.optimize.curve\\_fit} in \\nolinkurl{p4_reach.py}); the fitted values and their standard errors are in \\nolinkurl{p4_numbers.json} under \\texttt{constants.dose\\_fit}. The workbook sheet \\texttt{EQ\\_P4\\_dose} evaluates the law at any dose.', fig)
json.dump(BLOCKS, open(os.path.join(RES, 'p4_exact_labels.json'), 'w'), indent=1)
print('written', list(BLOCKS))
