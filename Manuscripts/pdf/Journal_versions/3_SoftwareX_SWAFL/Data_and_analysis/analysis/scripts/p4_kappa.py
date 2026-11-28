"""Paper 4: how the single constant kappa of the closed form of the reach is determined (figure fig6_kappa).
Reads  Manuscripts/results/p4_tableA1_reach.csv  (van Genuchten alpha, n and the reach interval observed in experiment E2)
and    Manuscripts/results/p4_numbers.json        (fitted kappa, bootstrap interval).
Writes Manuscripts/figures/paper4/fig6_kappa.(pdf|png) and the plotted data
       Manuscripts/results/p4_fig6a_reach_vs_kappa.csv, p4_fig6b_misfit.csv."""
import os, json, numpy as np, pandas as pd
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
RES = os.path.join(ROOT, 'Manuscripts/results'); OUT = os.path.join(ROOT, 'Manuscripts/figures/paper4')
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8.5, 'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.linewidth': 0.7, 'xtick.major.width': 0.7, 'ytick.major.width': 0.7, 'legend.frameon': False,
                     'savefig.dpi': 300, 'axes.titlesize': 9, 'axes.titleweight': 'bold', 'axes.titlelocation': 'left'})
A = pd.read_csv(os.path.join(RES, 'p4_tableA1_reach.csv')).set_index('id')
N = json.load(open(os.path.join(RES, 'p4_numbers.json'))); KAP = N['kappa']; BOOT = N['constants']['kappa_boot_log10_ci95']
COL = dict(zip(A.index, ['#E69F00', '#56B4E9', '#D55E00', '#CC79A7', '#009E73', '#0072B2', '#999933', '#882255', '#44AA99', '#332288']))

def hc(kap, al, n, l=0.5):                      # Eq. (4): K_r(h_c) = kappa on the dry-end asymptote of Mualem
    m = 1 - 1 / n; return (m * m / kap) ** (1 / (2 * n + l * (n - 1))) / al
def miss(p, lo, hi):                            # decades outside the observed interval (0 inside)
    lp, x, y = np.log10(p), np.log10(lo), (np.log10(hi) if np.isfinite(hi) else 99.)
    return (x - lp) if lp < x else ((lp - y) if lp > y else 0.)
def misfit(lk, idx=None):
    idx = list(A.index) if idx is None else idx
    return sum(miss(hc(10 ** lk, A.loc[k].alpha_1_per_cm, A.loc[k].n), A.loc[k].reach_observed_low_cm, A.loc[k].reach_observed_high_cm) ** 2 for k in idx)

g = np.round(np.linspace(-11, -8, 301), 4)
# data of panel a: predicted reach of every soil for every trial kappa
ra = pd.DataFrame({'log10_kappa': g, **{k + '_reach_cm': [hc(10 ** x, A.loc[k].alpha_1_per_cm, A.loc[k].n) for x in g] for k in A.index}})
ra.to_csv(os.path.join(RES, 'p4_fig6a_reach_vs_kappa.csv'), index=False, float_format='%.6g')
# data of panel b: the misfit with all soils and with each soil left out
rb = pd.DataFrame({'log10_kappa': g, 'misfit_all_soils': [misfit(x) for x in g],
                   **{'misfit_without_' + k: [misfit(x, [j for j in A.index if j != k]) for x in g] for k in A.index}})
rb.to_csv(os.path.join(RES, 'p4_fig6b_misfit.csv'), index=False, float_format='%.6g')

lk = np.log10(KAP); L0 = misfit(lk)
fig, ax = plt.subplots(1, 2, figsize=(7.2, 3.1), constrained_layout=True)
a = ax[0]
XO = dict(zip(A.index, [-7.70, -7.62, -7.95, -7.95, -7.95, -7.86, -7.78, -7.95, -7.54, -7.46]))   # observed intervals side by side
for k in A.index:
    a.plot(g, ra[k + '_reach_cm'], color=COL[k], lw=1.2, label='%s %s' % (k, A.loc[k].soil))
    lo, hi = A.loc[k].reach_observed_low_cm, A.loc[k].reach_observed_high_cm
    if np.isfinite(hi): a.add_patch(plt.Rectangle((XO[k] - 0.035, lo), 0.07, hi - lo, color=COL[k], lw=0, clip_on=False))
    else: a.annotate('', xy=(XO[k], 3.2e5), xytext=(XO[k], lo), arrowprops=dict(arrowstyle='->', color=COL[k], lw=1.0), annotation_clip=False)
a.axvline(lk, color='k', lw=0.8, ls='--'); a.text(lk + 0.05, 75, r'$\log_{10}\kappa=%.2f$' % lk, fontsize=7.5)
a.set_yscale('log'); a.set_xlim(-11, -7.4); a.set_xticks([-11, -10, -9, -8]); a.set_ylim(60, 4e5)
a.set_xlabel(r'trial $\log_{10}\kappa$'); a.set_ylabel(r'predicted reach $h_c$ (cm), Eq. (4)')
a.set_title('a  Predicted reach against $\\kappa$')
a.axvspan(-8.0, -7.4, color='0.96', lw=0, zorder=0); a.text(-7.62, 2.2e3, 'observed\n(E2)', fontsize=6.3, ha='center', va='center', color='0.3')
b = ax[1]
b.axvspan(*BOOT, color='#e6e6e6', ec='0.6', lw=0.5, zorder=0, label='bootstrap 95 % interval')
for k in ['S03', 'S04', 'S05']:
    b.plot(g, rb['misfit_without_' + k], color=COL[k], lw=0.9, ls='--', label='without %s %s' % (k, A.loc[k].soil.lower()))
b.plot(g, rb.misfit_all_soils, color='#882255', lw=1.8, label='all ten soils')
b.plot([lk], [L0], 'o', color='#882255', mec='k', ms=6, zorder=5)
b.annotate('minimum %.3f\n$\\kappa=3.47\\times10^{-10}$' % L0, xy=(lk, L0), xytext=(-10.9, 0.95), fontsize=7.5,
           arrowprops=dict(arrowstyle='-', lw=0.7, color='k'))
b.set_xlim(-11, -8); b.set_ylim(0, 1.6); b.set_xlabel(r'trial $\log_{10}\kappa$'); b.set_ylabel('misfit (squared log error, summed; decades$^2$)')
b.set_title('b  The misfit, minimised'); b.legend(fontsize=6.6, loc='upper right')
h, l = a.get_legend_handles_labels()
fig.legend(h, l, loc='lower center', ncol=5, fontsize=6.5, bbox_to_anchor=(0.5, -0.12))
fig.savefig(os.path.join(OUT, 'fig6_kappa.pdf'), bbox_inches='tight'); fig.savefig(os.path.join(OUT, 'fig6_kappa.png'), bbox_inches='tight', dpi=200)
print('kappa %.3g  misfit at minimum %.3f  bootstrap %.2e to %.2e' % (KAP, L0, 10 ** BOOT[0], 10 ** BOOT[1]))
