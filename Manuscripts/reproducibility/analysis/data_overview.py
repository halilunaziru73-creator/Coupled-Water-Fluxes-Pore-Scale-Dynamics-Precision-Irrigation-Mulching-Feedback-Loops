"""The data behind the four papers: Data/Comprehensive_Summary (17 experiments, 10 190 Daisy runs).
Writes Manuscripts/figures/data/fig_data_overview.pdf and Manuscripts/tex/data_table.tex."""
import os, numpy as np, pandas as pd
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
D = os.path.join(ROOT, 'Data/Comprehensive_Summary/')
a = pd.read_csv(D + '00_summary_all_simulations.csv.gz', low_memory=False)
a['ok'] = a.status == 'ok'
order = ['E0_Baselines', 'E1_Doses', 'E2_TriggerPressure', 'E3_SensorDepth', 'E4_Methods', 'E5_SHP_Dynamics', 'E6_Mediterranean_Pollution', 'E7_Mulching', 'E8_Rain_Intensity_Moisture', 'E9_Soil_Moisture_Rain', 'E10_Amount_Timing_Soil', 'E11_Temp_Evap_Rain', 'E12_Sensor_Trigger_Rain', 'E13_N_Water_Soil', 'E14_Mulch_Rain', 'E15_Method_Depth_Amount', 'E16_Edge_Cases']
FILE = {e: 'E%02d_%s.csv.gz' % (int(e.split('_')[0][1:]), e.split('_', 1)[1]) for e in order}
FAC = ['soil', 'set_irrigation_method', 'set_irrigation_rate_mm_h', 'set_dose_mm_per_event', 'set_trigger_potential_cm', 'set_sensor_depth_cm', 'set_tillage', 'set_initial_h', 'set_irrigation_window', 'set_PrecipScale', 'set_TempOffset_C', 'set_N_rate_kg_ha', 'set_mulch_vapor_flux_factor', 'set_EpFactor', 'set_MaxRootingDepth_cm']
FN = {'soil': 'soil', 'set_irrigation_method': 'method', 'set_irrigation_rate_mm_h': 'rate', 'set_dose_mm_per_event': 'dose', 'set_trigger_potential_cm': 'trigger', 'set_sensor_depth_cm': 'sensor depth', 'set_tillage': 'tillage', 'set_initial_h': 'initial suction', 'set_irrigation_window': 'window', 'set_PrecipScale': 'rain scale', 'set_TempOffset_C': 'warming', 'set_N_rate_kg_ha': 'N rate', 'set_mulch_vapor_flux_factor': 'mulch', 'set_EpFactor': 'demand', 'set_MaxRootingDepth_cm': 'root depth'}
rows = []
for e in order:
    d = a[a.experiment == e]; v = d[d.ok]
    fac = [FN[c] for c in FAC if d[c].nunique() > 1]
    rows.append({'E': e.split('_')[0], 'name': e.split('_', 1)[1].replace('_', ' '), 'runs': len(d), 'valid': int(d.ok.sum()), 'fac': ', '.join(fac) if fac else 'soil only',
                 'Y': v.yield_Mg_ha.mean(), 'I': v.irrigation_mm.mean(), 'D': v.drainage_1m_mm.mean(), 'ET': v.ET_mm.mean(), 'NL': v.N_leached_kg_ha.mean(), 's': v.run_seconds.mean(), 'file': FILE[e]})
T = pd.DataFrame(rows)
tex = ['\\begin{table}[H]\\centering\\scriptsize', '\\caption{The data of this study: the 17 Daisy experiments of \\texttt{Data/Comprehensive\\_Summary} (%d runs, %d valid; 20 years, 1980--1999, of Taastrup weather). Means of the valid runs; $Y$ yield (Mg\\,ha$^{-1}$), $I$ irrigation, $D$ drainage at 1\\,m and $\\ET$ (mm\\,yr$^{-1}$), $N_L$ nitrate leached (kg\\,N\\,ha$^{-1}$\\,yr$^{-1}$), $t$ run time of Daisy (s). Every row is one file of the folder, linked.}' % (len(a), int(a.ok.sum())),
       '\\label{tab:data}', '\\setlength{\\tabcolsep}{3pt}', '\\begin{tabular}{@{}llrrp{3.5cm}rrrrrr@{}}', '\\toprule', 'Exp. & File & Runs & Valid & Factors varied & $Y$ & $I$ & $D$ & $\\ET$ & $N_L$ & $t$\\\\\\midrule']
for r in rows:
    url = '\\repourl/blob/main/Data/Comprehensive_Summary/' + r['file']
    tex.append('%s & \\href{%s}{\\texttt{%s}} & %d & %d & %s & %.2f & %.0f & %.0f & %.0f & %.0f & %.0f\\\\' % (r['E'], url, r['name'].replace('&', '\\&'), r['runs'], r['valid'], r['fac'], r['Y'], r['I'], r['D'], r['ET'], r['NL'], r['s']))
tex += ['\\bottomrule', '\\end{tabular}', '\\end{table}']
open(os.path.join(ROOT, 'Manuscripts/tex/data_table.tex'), 'w').write('\n'.join(tex) + '\n')
# figure: distributions per experiment
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 8, 'axes.spines.top': False, 'axes.spines.right': False, 'axes.titleweight': 'bold', 'axes.titlelocation': 'left', 'axes.titlesize': 8.5})
v = a[a.ok]; labs = [e.split('_')[0] for e in order]
fig, ax = plt.subplots(4, 1, figsize=(7.2, 7.4), sharex=True, constrained_layout=True)
for x, (c, t, col) in zip(ax, [('yield_Mg_ha', 'a  Yield (Mg ha$^{-1}$)', '#009E73'), ('irrigation_mm', 'b  Irrigation (mm yr$^{-1}$)', '#56B4E9'), ('drainage_1m_mm', 'c  Drainage below 1 m (mm yr$^{-1}$)', '#0072B2'), ('N_leached_kg_ha', 'd  Nitrate leached (kg N ha$^{-1}$ yr$^{-1}$)', '#D55E00')]):
    data = [v[v.experiment == e][c].dropna().values for e in order]
    p = x.violinplot(data, showextrema=False, widths=0.8)
    for b in p['bodies']: b.set_facecolor(col); b.set_alpha(0.35); b.set_edgecolor(col)
    x.boxplot(data, widths=0.18, showfliers=False, medianprops=dict(color='k', lw=1), boxprops=dict(lw=0.7), whiskerprops=dict(lw=0.7), capprops=dict(lw=0.7))
    x.set_title(t)
ax[-1].set_xticks(range(1, len(order) + 1)); ax[-1].set_xticklabels(['%s\n%d' % (l, (a.experiment == e).sum()) for l, e in zip(labs, order)], fontsize=7)
ax[-1].set_xlabel('experiment and number of runs')
fig.savefig(os.path.join(ROOT, 'Manuscripts/figures/data/fig_data_overview.pdf')); fig.savefig(os.path.join(ROOT, 'Manuscripts/figures/data/fig_data_overview.png'), dpi=150)
print(T[['E', 'runs', 'valid', 'fac', 's']].to_string())
