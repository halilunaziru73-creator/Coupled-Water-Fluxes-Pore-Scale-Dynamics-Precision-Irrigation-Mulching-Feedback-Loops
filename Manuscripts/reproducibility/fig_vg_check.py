"""Figure: one Daisy 7.1.14 run of the loam, as written by SWAFL 1.1.0, with the van Genuchten-Mualem parameters of every
horizon as given (baseline) and scaled (K_sat x4, alpha x2, n-1 x1.3, theta_s x1.1, l +1). Reads the Daily-FWater logs of both runs.
usage: python fig_vg_check.py BASE_Daily-FWater.dlf SCALED_Daily-FWater.dlf out.pdf"""
import sys, numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, datetime as dt
def read(f):
    L=open(f,encoding='latin-1').read().split('\n'); k=next(i for i,l in enumerate(L) if l.startswith('----')); cols=L[k+1].split('\t'); rows=[l.split('\t') for l in L[k+3:] if l.strip()]
    A={c:np.array([float(r[j]) if r[j] not in ('','-') else np.nan for r in rows]) for j,c in enumerate(cols)}
    A['t']=[dt.date(int(r[0]),int(r[1]),int(r[2])) for r in rows]; return A
B,S=read(sys.argv[1]),read(sys.argv[2]); OK=['#0072B2','#D55E00']
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8,'axes.spines.top':False,'axes.spines.right':False})
fig,ax=plt.subplots(1,3,figsize=(7.2,2.5),gridspec_kw={'width_ratios':[1.6,1.6,1.1]})
for a,col,lab in [(ax[0],'Matrix percolation','Cumulative matrix percolation (mm)'),(ax[1],'Actual evapotranspiration','Cumulative actual ET (mm)')]:
    for d,c,n in [(B,OK[0],'as given'),(S,OK[1],'scaled')]: a.plot(d['t'],np.nancumsum(d[col]),color=c,lw=1.5,label=n)
    a.set_ylabel(lab); import matplotlib.dates as md; a.xaxis.set_major_locator(md.MonthLocator(bymonth=[1,7])); a.xaxis.set_major_formatter(md.DateFormatter('%b %Y')); a.tick_params(axis='x',rotation=0,labelsize=7)
ax[0].legend(frameon=False,title='hydraulic parameters',title_fontsize=7)
names=['Percolation','Actual ET','Runoff']; cols=['Matrix percolation','Actual evapotranspiration','Runoff']; x=np.arange(3)
b=[np.nansum(B[c]) for c in cols]; s=[np.nansum(S[c]) for c in cols]
ax[2].bar(x-0.18,b,0.36,color=OK[0]); ax[2].bar(x+0.18,s,0.36,color=OK[1]); ax[2].set_xticks(x); ax[2].set_xticklabels(names,rotation=20); ax[2].set_ylabel('Total of the run (mm)')
for i in range(3): ax[2].text(x[i],max(s[i],b[i])+25,f'{s[i]-b[i]:+.0f} mm'.replace('-','\u2212'),ha='center',fontsize=7,color='#333')
for a,l in zip(ax,'abc'): a.text(-0.16,1.04,l,transform=a.transAxes,fontweight='bold',fontsize=10)
fig.tight_layout(); fig.savefig(sys.argv[3]); print([round(v,1) for v in b],[round(v,1) for v in s])
