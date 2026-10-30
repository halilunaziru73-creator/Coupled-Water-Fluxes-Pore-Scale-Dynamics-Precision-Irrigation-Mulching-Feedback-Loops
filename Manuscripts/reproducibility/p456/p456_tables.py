import pandas as pd, json, os
H=os.path.dirname(os.path.abspath(__file__)); TX=H+'/../../tex/'
T=pd.read_csv(H+'/out_p4_runtime.csv')
L=[r'\begin{table}[H]\centering\small',r'\caption{The 17 experiments of the study and their prepared designs in the workbench. Hours are the sum of the Daisy wall-clock run times of the study (\texttt{run\_seconds}) and the estimate for the compact design (runs $\times$ the median run time of the experiment). The experiments marked $-$ are not offered as designs; their published runs are bundled.}\label{tab:designs}',
 r'\begin{tabular}{llrrrr}\toprule','Experiment & Question & Study runs & Study (h) & Compact runs & Compact (h)\\\\\\midrule']
for _,r in T.iterrows():
    g='$-$' if pd.isna(r.gui) else '%d'%r.gui; gh='$-$' if pd.isna(r.gui_hours) else '%.1f'%r.gui_hours
    L.append('%s & %s & %d & %.1f & %s & %s\\\\'%(r.exp,r['name'].replace('&','\\&'),r.study,r.study_hours,g,gh))
L.append(r'\midrule Total & & %d & %.0f & %d & %.1f\\\bottomrule\end{tabular}\end{table}'%(T.study.sum(),T.study_hours.sum(),T.gui.sum(),T.gui_hours.sum()))
open(TX+'p4_designs.tex','w').write('\n'.join(L))
# Richards table
R=json.load(open(H+'/out_p4_richards_js.json')); RR=json.load(open(H+'/out_p4_richards_ref.json'))
L=[r'\begin{table}[H]\centering\small',r'\caption{The Richards solver of the workbench against an independent reference (method of lines, scipy BDF, 0.5\,cm nodes). A 100\,cm column, initial suction 300\,cm, 200\,mm of rain on day 1, five dry days, free drainage. $D$ is the drainage below 1\,m and $S$ the final storage in mm, for the reference (ref) and the workbench (wb, 0.5\,cm nodes); the spread (mm) is the range over node spacings of 4, 2, 1 and 0.5\,cm.}\label{tab:richards}',
 r'\begin{tabular}{lrrrrr}\toprule','Soil & $D_{\\mathrm{ref}}$ & $D_{\\mathrm{wb}}$ & Spread & $S_{\\mathrm{ref}}$ & $S_{\\mathrm{wb}}$\\\\\\midrule']
for nm,lab in [('sand','Sand'),('loam','Loam')]:
    o=R['out'][nm]; v=[o[k]['drain'] for k in o]
    L.append('%s & %.2f & %.2f & %.2f & %.2f & %.2f\\\\'%(lab,RR[nm]['drain'],o['0.5']['drain'],max(v)-min(v),RR[nm]['storeEnd'],o['0.5']['storeEnd']))
L.append(r'\bottomrule\end{tabular}\end{table}')
open(TX+'p4_richards.tex','w').write('\n'.join(L))
# P6 crop and pheno tables
C=json.load(open(H+'/out_p6_crops.json')); P=pd.DataFrame(json.load(open(H+'/out_p6_pheno.json')))
L=[r'\begin{table}[H]\centering\small',r'\caption{Deterministic phenotyping layer: maize in a warm and in a hot, dry season, seven genotypes, well-watered bench against a drought pulse (onset day 40, 28 days, 30\,\% of the plant-available water, rain-out shelter). Grain dry mass in model units; the penalty is the loss by the drought.}\label{tab:pheno}',
 r'\begin{tabular}{lrrrrrr}\toprule',r' & \multicolumn{3}{c}{Warm season} & \multicolumn{3}{c}{Hot, dry season}\\\cmidrule(lr){2-4}\cmidrule(lr){5-7}','Genotype & Well-watered & Drought & Loss (\\%) & Well-watered & Drought & Loss (\\%)\\\\\\midrule']
for g in P.geno.unique():
    row=[g.replace('&','\\&')]
    for cl in ['warm','hot']:
        a=P[(P.geno==g)&(P.clim==cl)&(P.tr=='ww')].grain.iloc[0]; b=P[(P.geno==g)&(P.clim==cl)&(P.tr=='dr')].grain.iloc[0]
        row+=['%.0f'%a,'%.0f'%b,'%.0f'%(100*(a-b)/a)]
    L.append(' & '.join(row)+'\\\\')
L.append(r'\bottomrule\end{tabular}\end{table}')
open(TX+'p6_pheno.tex','w').write('\n'.join(L))
print('tables ok')
