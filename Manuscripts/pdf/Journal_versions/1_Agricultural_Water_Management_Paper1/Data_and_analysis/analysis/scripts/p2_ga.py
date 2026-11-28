import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import VG
import p_style as S
from p_style import *
import pandas as pd, json
from sklearn.model_selection import GroupKFold
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'; O=__import__('os').environ.get('SWAFL_MS','.')+'/out/'
W,H=130,104
S.YLO=-14
fig=S.setup(W,H-S.YLO,6.1); ax=S.ax; ax.set_zorder(20)
S.bands(W,H,60.5,lx=37.5)
et=json.load(open(O+'p2_et.json')); lw=json.load(open(O+'p2_laws.json')); dp=json.load(open(O+'p2_dpf.json'))
# ---- data for parity (LOEO, three-term law)
D=pd.read_pickle(O+'d2.pkl'); D=D[D.valid.astype(bool)] if 'valid' in D else D
D=D.dropna(subset=['W','ET_mm','irrigation_mm','s']).copy(); D=D[(D.W>0)&(D.ET_mm>0)]
n=D.s.map(lambda s:VG[s][1]).values
X=np.c_[np.ones(len(D)),np.log(D.W.values),n,np.log1p(D.irrigation_mm.values)]; y=np.log(D.ET_mm.values); g=D.experiment.values
p=np.zeros(len(y))
for tr,te in GroupKFold(17).split(X,y,g): p[te]=X[te]@np.linalg.lstsq(X[tr],y[tr],rcond=None)[0]
r2=1-((p-y)**2).sum()/((y-y.mean())**2).sum()
# ---- above ground: variables + pipeline + outputs
chip(2,66,34,102,'Variables considered','atmosphere:\nrain $P$ · $\\Delta T$ · $E_p$\nwater: $I$ · ET · $T$ · $E_s$\n$D$ · $\\Delta S$\nsoil: $n$, $K_s$ · tillage\nmulch $\\phi$\ncrop: N · yield',fs=FS-0.9)
XS=[38,59,80,101]; WW=21
ST=['1  Linear\ninvariants','2  Hidden\nterms','3  Partition\nmanifold','4  Sparse\nlaws']
for x,t in zip(XS,ST): hexa(x,86,x+WW,102,t,fs=FS-0.5,d=2.4)
for i in range(3): flow([(XS[i]+WW,94),(XS[i+1],94)])
flow([(34,94),(38,94)],'info')
OU=['Water-balance law\nrecovered blindly','Unattributed ET:\n164 mm yr$^{-1}$ (30 %)','Compositional\nmanifold, 3 axes','ET law\nLOEO $R^2$ = 0.898']
for x,t in zip(XS,OU):
    sbox(x,66,x+WW,80,t,fc=LG,fs=FS-1.4,r=1.1); flow([(x+WW/2,86),(x+WW/2,80)])
txt(79.5,79.0,'',FS)
# ---- below ground: real pore section = Daisy ensemble (soil water model)
por,_=pore_pack(2,26,34,57,0.9,1.6,seed=21,fine=800)
flow([(8,67),(8,57.6)],'solid',lw=LW); flow([(26,57.6),(26,67)],'out',lw=LW)
lab(10,63.2,'$P$, $I$ in',fs=FS-1.6,ha='left'); lab(15,63.2,'',fs=FS-1.6); lab(28,63.2,'ET out',fs=FS-1.6,ha='left')
txt(18,23.4,'Daisy soil-water runs',FS-0.9)
lab(18,18.4,'10,041 valid runs · 17 experiments\n10 soils · 149 failed runs excluded\nflux data feed all four stages',fs=FS-1.7)
# panel (a) singular values
a=inset(fig,W,H,44,42,80,55.5)
sv=lw['svd4']['sv']; a.bar(range(4),sv,color=[HEX,HEX,HEX,RED],ec='black',lw=0.8,width=0.65)
a.axhline(lw['svd4_perm_minSV'],color=DRV,ls=(0,(3,2)),lw=1.1); 
a.set_xticks(range(4)); a.set_xticklabels(['1','2','3','4'],fontsize=5.4); a.set_xlabel('singular value rank',fontsize=5.6,fontweight='bold',labelpad=1); a.set_ylabel('value',fontsize=5.6,fontweight='bold',labelpad=1)
a.text(3.45,95,'smallest = 5.9 (null space)\ndashed: permutation null 33.3',fontsize=5.0,fontweight='bold',color=RED,ha='right')
txt(65.5,57.4,'Stage 1: conservation law found blindly',FS-1.3)
# panel (b) unattributed ET by irrigation method
b=inset(fig,W,H,92,42,127,55.5)
vals=[105,164,183]; b.bar(range(3),vals,color=[WAT,BEI,OCH],ec='black',lw=0.8,width=0.62)
b.set_xticks(range(3)); b.set_xticklabels(['subsurface\ndrip','all\nruns','surface'],fontsize=5.0,fontweight='bold')
for i,v in enumerate(vals): b.text(i,v+6,str(v),ha='center',fontsize=5.6,fontweight='bold')
b.set_ylim(0,225); b.set_ylabel('mm yr$^{-1}$',fontsize=5.6,fontweight='bold',labelpad=1)
txt(109.5,57.4,'Stage 2: the term that fails to close',FS-1.3)
# panel (c) parity
c=inset(fig,W,H,44,12,80,28)
idx=np.random.default_rng(1).choice(len(y),3500,replace=False)
c.scatter(np.exp(y[idx]),np.exp(p[idx]),s=1.6,color=DRV,alpha=0.35,lw=0)
m=np.exp([y.min(),y.max()]); c.plot(m,m,color='black',lw=0.9)
c.set_xlabel('simulated ET (mm yr$^{-1}$)',fontsize=5.6,fontweight='bold',labelpad=1); c.set_ylabel('predicted',fontsize=5.6,fontweight='bold',labelpad=1)
c.text(0.04,0.95,'ln ET = 2.50 + 0.646 ln W\n− 0.299 n + 0.029 ln(1+I)\nLOEO $R^2$ = %.3f'%r2,transform=c.transAxes,fontsize=5.0,fontweight='bold',va='top')
txt(65.5,31.6,'Stage 4: hand-checkable ET law',FS-1.3)
# panel (d) skill vs benchmark
d=inset(fig,W,H,92,12,127,28)
names=['ET','drainage\nfraction','soil\nevaporation']
sp=[et['lnET']['loeo'],dp['exogenous']['loeo'],et['lnEs']['loeo']]; gb=[et['lnET']['gbm_loeo'],dp['exogenous']['gbm_loeo'],et['lnEs']['gbm_loeo']]
xx=np.arange(3); d.bar(xx-0.2,sp,0.38,color=HEX,ec='black',lw=0.7,label='sparse law'); d.bar(xx+0.2,gb,0.38,color='#DDDDDD',ec='black',lw=0.7,label='gradient boosting')
for i in range(3): d.text(i-0.2,sp[i]+0.02,'%.2f'%sp[i],ha='center',fontsize=4.8,fontweight='bold'); d.text(i+0.2,gb[i]+0.02,'%.2f'%gb[i],ha='center',fontsize=4.8,fontweight='bold')
d.set_xticks(xx); d.set_xticklabels(names,fontsize=5.0,fontweight='bold'); d.set_ylim(0,1.25); d.set_yticks([0,0.5,1.0]); d.set_ylabel('LOEO $R^2$',fontsize=5.6,fontweight='bold',labelpad=1)
d.legend(fontsize=4.8,frameon=False,loc='upper right',ncol=2,handlelength=1,columnspacing=0.8,borderpad=0.1)
txt(109.5,31.6,'Stage 4: tested against benchmark',FS-1.3)
sbox(38,0.6,127,5.0,'an accounting gap and a validation protocol, not new physics',fc=LG,fs=FS-1.4,r=1.0)
# ---- relationships and reading order
flow([(34.6,48),(38.6,48)],'info')
flow([(81,48.5),(86,48.5)],'info')
flow([(81,20),(86,20)],'info')
for x,y,n in [(2.2,101.4,1),(2.2,56.4,2),(45.0,57.0,'A'),(90.4,57.0,'B'),(45.0,29.8,'C'),(90.4,29.8,'D')]: dot(x,y,n)
legend(2,-13.2,127,-3.4,chip_label='Input / control · red mark = reading order')
fig.savefig(FG+'p2/ga_p2.png',dpi=420,facecolor='white'); fig.savefig(FG+'p2/ga_p2.pdf',facecolor='white')
print('ok',round(r2,3),round(por,2))
