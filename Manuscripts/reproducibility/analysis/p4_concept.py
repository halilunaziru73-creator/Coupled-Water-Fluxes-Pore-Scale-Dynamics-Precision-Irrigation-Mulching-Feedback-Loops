"""Paper 4, Figure 1: the two questions in one picture (schematic; numbers from p4_numbers.json)."""
import os, json, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Circle
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')); N = json.load(open(os.path.join(ROOT, 'Manuscripts/results/p4_numbers.json')))
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8})
fig = plt.figure(figsize=(7.2, 3.4)); ax = fig.add_axes([0, 0, 0.56, 1]); ax.set_xlim(0, 10); ax.set_ylim(0, 6); ax.axis('off')
ax.add_patch(Rectangle((0, 4.6), 10, 1.4, color='#e8f2fb'))
ax.add_patch(Rectangle((0, 0), 10, 4.6, color='#c9a27a')); ax.add_patch(Rectangle((0, 0), 10, 1.0, color='#8c6a4f'))
for x in [2.2, 3.4, 4.6]:
    ax.plot([x, x], [4.6, 5.5], color='#2e7d32', lw=2.5); ax.plot([x - .35, x, x + .35], [5.25, 5.5, 5.25], color='#2e7d32', lw=2)
    for dx in [-.4, -.15, .15, .4]: ax.plot([x, x + dx], [4.6, 2.6 + abs(dx)], color='#f3e3c3', lw=1)
ax.add_patch(Circle((6.4, 3.75), 0.16, color='#1f3b73')); ax.text(6.65, 3.68, 'sensor 20 cm\nfires at $h_t$', fontsize=7, color='#1f3b73', va='center')
F = N['fate_E10_all']
def arr(x0, y0, x1, y1, c, t, w):
    ax.add_patch(FancyArrowPatch((x0, y0), (x1, y1), arrowstyle='-|>', mutation_scale=12, lw=1 + 8 * w, color=c)); return
ax.text(0.2, 5.75, 'irrigation 1 mm', fontsize=8, weight='bold', color='#0b5394')
arr(1.0, 5.6, 1.0, 4.75, '#0b5394', '', 0.3)
arr(3.4, 5.5, 3.4, 5.98, '#009E73', '', F['dT']); ax.text(3.55, 5.78, 'transpiration %.2f' % F['dT'], fontsize=7, color='#006b4f')
arr(7.6, 4.62, 7.6, 5.6, '#E69F00', '', F['dE']); ax.text(7.75, 5.25, 'soil evaporation %.2f' % F['dE'], fontsize=7, color='#9a6a00')
arr(9.0, 4.62, 9.0, 5.95, '#c7b800', '', F['dO']); ax.text(7.8, 5.8, 'other %.2f' % F['dO'], fontsize=7, color='#8a7f00')
arr(5.5, 1.3, 5.5, 0.15, '#0072B2', '', F['dD']); ax.text(5.7, 0.55, 'drainage below 1 m %.2f' % F['dD'], fontsize=7, color='white')
ax.text(0.2, 0.35, '1 m', color='white', fontsize=7)
ax.text(0.15, 2.3, 'Q2  Where does each\napplied millimetre go?\n(dose, method, window)', fontsize=8, weight='bold', color='#3b2a1a')
b = fig.add_axes([0.63, 0.17, 0.34, 0.72]); hh = np.logspace(0, 5, 300)
for al, n, c, nm in [(0.145, 2.68, '#D55E00', 'sand'), (0.036, 1.56, '#0072B2', 'loam'), (0.010, 1.23, '#332288', 'silty clay loam')]:
    m = 1 - 1 / n; se = (1 + (al * hh) ** n) ** (-m); b.plot(hh, se, color=c, lw=1.5, label=nm)
    hc = N['reach']['mualem']['pred'][{'sand': 'S03', 'loam': 'S06', 'silty clay loam': 'S10'}[nm]]
    if hc < 1e5: b.axvline(hc, color=c, lw=0.8, ls='--'); b.text(hc * 1.1, 0.92 if nm == 'sand' else 0.8, '$h_c$', color=c, fontsize=7)
b.axvspan(300, 600, color='0.85'); b.text(420, 1.03, 'usual triggers', fontsize=6.5, color='0.3', ha='center')
b.set_xscale('log'); b.set_xlabel('suction $h$ (cm)'); b.set_ylabel('$S_e$'); b.legend(fontsize=6.5, loc='lower left', frameon=False)
b.set_title('Q1  Which suction can a crop\nimpose at the sensor?', fontsize=8, weight='bold', loc='left')
for s in ['top', 'right']: b.spines[s].set_visible(False)
fig.savefig(os.path.join(ROOT, 'Manuscripts/figures/paper4/fig1_concept.pdf')); fig.savefig(os.path.join(ROOT, 'Manuscripts/figures/paper4/fig1_concept.png'), dpi=160)
