import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, numpy as np, pandas as pd, json, os, sys
H=os.path.dirname(os.path.abspath(__file__)); FG=H+'/../../figures/'
sys.path.insert(0,H+'/../analysis')
from figstyle import *
def sv(fig,name):
    fig.savefig(FG+name+'.pdf'); fig.savefig(FG+name+'.png',dpi=200); plt.close(fig)
# ---------- P4 fig 3: fidelity of the compact designs and run time
R=pd.read_csv(H+'/out_p4_fidelity.csv'); T=pd.read_csv(H+'/out_p4_runtime.csv')
fig,ax=plt.subplots(1,2,figsize=(7.4,3.2),gridspec_kw={'width_ratios':[1.1,1]})
g=R.groupby(['exp','factor']).rmse_pct.median().reset_index(); g['lab']=g.exp+' '+g.factor; g=g.sort_values('rmse_pct')
a=ax[0]; a.barh(range(len(g)),g.rmse_pct,color=OI[0]); a.set_yticks(range(len(g))); a.set_yticklabels(g.lab); a.set_xlabel('Interpolation error of the marginal curve\n(median RMSE, % of its range)')
a.axvline(R.rmse_pct.median(),color=OI[3],ls='--',lw=1); a.text(R.rmse_pct.median()+0.5,0.2,'median of all %d\ncurves: %.0f %%'%(len(R),R.rmse_pct.median()),color=OI[3],fontsize=6.5); panel(a,'a',-0.5)
b=ax[1]; t=T.dropna(subset=['gui']); x=np.arange(len(t)); b.bar(x-0.2,t.study_hours,0.4,color=OI[1],label='Study design (10 levels)'); b.bar(x+0.2,t.gui_hours,0.4,color=OI[0],label='Compact design of the workbench')
b.set_yscale('log'); b.set_xticks(x); b.set_xticklabels(t.exp,rotation=90); b.set_ylabel('Daisy run time (h)'); b.legend(frameon=False,loc='upper left',fontsize=6.3); panel(b,'b',-0.2)
fig.tight_layout(); sv(fig,'p4/fig03_fidelity')
# ---------- denitrification
J=json.load(open(H+'/out_p5_bridge_js.json')); A=np.array(J['deniArr'])
fig,ax=plt.subplots(1,2,figsize=(7.0,3.1))
for k,(col,lab,c) in enumerate([(1,'Workbench function (this release)',OI[0]),(2,'Form of the python extension (before the check)',OI[3])]):
    m=A[:,0]>0; ax[0].loglog(A[m,0],A[m,col],'.',ms=3,color=c,label=lab)
lo,hi=A[A[:,0]>0,0].min(),A[A[:,0]>0,0].max(); ax[0].plot([lo,hi],[lo,hi],'k-',lw=0.8); ax[0].set_xlabel('Daisy output stored in the test (N$_2$, units of the test)'); ax[0].set_ylabel('Function in the workbench'); ax[0].legend(frameon=False,fontsize=6,loc='upper left'); panel(ax[0],'a')
m=A[:,3]>0; r_new=np.abs(A[m,4]-A[m,3])/A[m,3]; r_old=np.abs(A[m,5]-A[m,3])/A[m,3]
ax[1].hist(np.log10(np.maximum(r_new,1e-17)),bins=25,color=OI[0],alpha=.85,label='this release'); ax[1].hist(np.log10(np.maximum(r_old,1e-17)),bins=25,color=OI[3],alpha=.85,label='before'); ax[1].set_xlabel('log$_{10}$ relative error of N$_2$O (792 rows)'); ax[1].set_ylabel('Rows'); ax[1].legend(frameon=False); panel(ax[1],'b')
fig.tight_layout(); sv(fig,'p4/fig05_denitrification')
# ---------- P5 economics
fig,ax=plt.subplots(1,2,figsize=(7.2,3.1))
S=pd.read_csv(H+'/out_p4_runtime.csv')
a=ax[0]; a.bar(S.exp,S.study_hours/24,color=OI[1]); a.set_ylabel('Daisy wall time of the study (days)'); a.tick_params(axis='x',rotation=90); a.text(0.02,0.93,'total %.1f days, 10,190 runs'%(S.study_hours.sum()/24),transform=a.transAxes,fontsize=7); panel(a,'a')
b=ax[1]; lab=['Study\n(Daisy)','Compact\ndesigns\n(Daisy)','Engine 1\n(10$^5$\nscenarios)']
v=[S.study_hours.sum()*3600, S.gui_hours.sum()*3600, 2.0]
b.bar(lab,v,color=[OI[1],OI[0],OI[2]]); b.set_yscale('log'); b.set_ylabel('Time (s)'); 
for i,vv in enumerate(v): b.text(i,vv*1.25,('%.1f days'%(vv/86400)) if vv>86400 else ('%.1f h'%(vv/3600) if vv>3600 else '%.0f s'%vv),ha='center',fontsize=7)
b.set_ylim(1,1e8); panel(b,'b'); fig.tight_layout(); sv(fig,'p5/fig04_economics')
# ---------- P6 phenotyping
P=pd.DataFrame(json.load(open(H+'/out_p6_pheno.json')))
fig,ax=plt.subplots(1,2,figsize=(7.2,3.3),sharey=True)
for a,cl,l in zip(ax,['warm','hot'],'ab'):
    q=P[P.clim==cl]; ww=q[q.tr=='ww'].set_index('geno'); dr=q[q.tr=='dr'].set_index('geno'); order=list(ww.index)
    x=np.arange(len(order)); a.bar(x-0.2,ww.loc[order,'grain'],0.4,color=OI[5],label='well-watered'); a.bar(x+0.2,dr.loc[order,'grain'],0.4,color=OI[3],label='drought pulse')
    a.set_xticks(x); a.set_xticklabels(order,rotation=60,ha='right'); a.set_title({'warm':'Warm season','hot':'Hot, dry season'}[cl],fontsize=8); panel(a,l)
ax[0].set_ylabel('Grain dry mass at maturity\n(model units)'); ax[0].legend(frameon=False,loc='lower left',fontsize=6.5); fig.tight_layout(); sv(fig,'p6/fig04_pheno')
# ---------- crops
C=json.load(open(H+'/out_p6_crops.json'))['curves']
fig,ax=plt.subplots(1,2,figsize=(7.2,2.9))
for k,(nm,v) in enumerate(C.items()):
    (ax[0] if nm in('wheat','maize','rice','tomato','potato') else ax[1]).plot(np.arange(365),v['kc'],color=OI[k%len(OI)],label=v['label'])
ax[0].set_ylabel('$K_c$'); 
for a,l in zip(ax,'ab'): a.set_xlabel('Day of year'); a.legend(frameon=False,fontsize=6.5); panel(a,l)
fig.tight_layout(); sv(fig,'p6/fig05_crops'); print('done')
# ---------- P4 Richards
RJ=json.load(open(H+'/out_p4_richards_js.json')); RR=json.load(open(H+'/out_p4_richards_ref.json'))
fig,ax=plt.subplots(1,3,figsize=(7.4,2.8))
for k,nm in enumerate(['sand','loam']):
    o=RJ['out'][nm]; dz=sorted(map(float,o)); v=[o[('%g'%d)]['drain'] for d in dz]
    ax[0].plot(dz,v,'o-',color=OI[k],label=nm.capitalize()); ax[0].axhline(RR[nm]['drain'],color=OI[k],ls='--',lw=0.9)
ax[0].set_xscale('log'); ax[0].set_xlabel('Node spacing (cm)'); ax[0].set_ylabel('Drainage below 1 m in 6 days (mm)'); ax[0].legend(frameon=False); panel(ax[0],'a')
for k,nm in enumerate(['sand','loam']):
    o=RJ['out'][nm]; dz=sorted(map(float,o)); v=[o[('%g'%d)]['storeEnd']-RR[nm]['storeEnd'] for d in dz]
    ax[1].plot(dz,v,'o-',color=OI[k],label=nm.capitalize())
ax[1].axhline(0,color='k',lw=0.6); ax[1].set_xscale('log'); ax[1].set_xlabel('Node spacing (cm)'); ax[1].set_ylabel('Final storage minus reference (mm)'); panel(ax[1],'b')
o=RJ['out']['siltclayloam']; dz=sorted(map(float,o)); 
ax[2].plot(dz,[o[('%g'%d)]['infil'] for d in dz],'o-',color=OI[3]); ax[2].set_xscale('log'); ax[2].set_xlabel('Node spacing (cm)'); ax[2].set_ylabel('Infiltration of 200 mm of rain (mm)',color=OI[3]); 
a2=ax[2].twinx(); a2.plot(dz,[o[('%g'%d)]['ms']/1000 for d in dz],'s--',color=OI[8]); a2.set_yscale('log'); a2.set_ylabel('Run time (s)',color=OI[8]); a2.spines['right'].set_visible(True); panel(ax[2],'c')
fig.tight_layout(); sv(fig,'p4/fig04_richards')
print('richards fig')
