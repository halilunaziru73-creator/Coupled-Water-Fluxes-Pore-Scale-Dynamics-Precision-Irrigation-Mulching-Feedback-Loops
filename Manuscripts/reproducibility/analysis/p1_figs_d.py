import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json
from matplotlib import cm, patches
from scipy import stats
Tn=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0); rng=np.random.default_rng(5)
# permutation + bootstrap of rank correlations
n=np.array([VG[s][1] for s in SOIL_N]); phi=Tn.phiD_E9.values; p16=Tn.psiD_E16.values; p7=Tn.psiD_E7.values
pairs={'$n$ vs $\\phi_D$':(n,phi),'$\\phi_D$ vs $\\psi_D$(E16)':(phi,p16),'$\\phi_D$ vs $\\psi_D$(E7)':(phi,p7),'$n$ vs $\\psi_D$(E16)':(n,p16),'$n$ vs $\\psi_D$(E7)':(n,p7)}
res={}; fig,axs=plt.subplots(1,2,figsize=(7.2,2.7))
null=np.array([stats.spearmanr(n,rng.permutation(phi)).statistic for _ in range(20000)]); obs=stats.spearmanr(n,phi).statistic
axs[0].hist(null,bins=50,color='#9ecae1'); axs[0].axvline(obs,color='#D55E00'); axs[0].axvline(-obs,color='#D55E00',ls=':'); axs[0].set_xlabel('Permuted Spearman $\\rho$ ($n$ vs $\\phi_D$)'); axs[0].set_ylabel('Count'); panel(axs[0],'a',x=-0.2)
print('obs',obs,'p two-sided',np.mean(np.abs(null)>=abs(obs)))
ypos=np.arange(len(pairs))
for i,(k,(a,b)) in enumerate(pairs.items()):
    o=stats.spearmanr(a,b).statistic; B=[]
    for _ in range(4000):
        ix=rng.integers(0,10,10)
        if len(set(a[ix]))<3 or len(set(b[ix]))<3: continue
        B.append(stats.spearmanr(a[ix],b[ix]).statistic)
    nl=[stats.spearmanr(a,rng.permutation(b)).statistic for _ in range(20000)]
    res[k]=dict(rho=float(o),lo=float(np.nanpercentile(B,2.5)),hi=float(np.nanpercentile(B,97.5)),p=float(np.mean(np.abs(nl)>=abs(o))))
    axs[1].errorbar(o,i,xerr=[[o-res[k]['lo']],[res[k]['hi']-o]],fmt='o',color='#0072B2',capsize=2,ms=4)
axs[1].set_yticks(ypos); axs[1].set_yticklabels(list(pairs)); axs[1].axvline(0,color='#999',lw=0.6); axs[1].set_xlabel('Spearman $\\rho$ (bootstrap 95% CI)'); axs[1].invert_yaxis(); panel(axs[1],'b',x=-0.45)
fig.tight_layout(); save(fig,'fig10_robustness','p1'); print(json.dumps(res,indent=0)); json.dump(res,open(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_rank.json','w'))
# Fig 1 schematic
fig,ax=plt.subplots(figsize=(7.4,3.0)); ax.axis('off'); ax.set_xlim(0,10); ax.set_ylim(0,4)
def box(x,y,w,h,t,c,fs=7.2): ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.03,rounding_size=0.12',fc=c,ec='#444',lw=0.8)); ax.text(x+w/2,y+h/2,t,ha='center',va='center',fontsize=fs,wrap=True)
def arr(x1,y1,x2,y2): ax.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>',color='#444',lw=1.1))
box(0.1,2.3,2.5,1.4,'Pore network\n(van Genuchten $n$, $K_s$;\nconnectivity of the\nconducting pore space)','#D6EAF8'); 
box(3.3,2.8,2.7,1.0,'Hydraulic memory\nImprint of antecedent state\n(initial suction $h_0$, E9)','#FCF3CF'); box(3.3,1.4,2.7,1.0,'Climate-induced evaporation\nloss and its offsets\n(evaporation factor, warming,\nmulch: E16, E7, E11, E14)','#FADBD8')
box(6.9,2.3,2.9,1.4,'Recoverability\n$1-\\psi_D$ : share of the water\nthat stays in the root zone,\nis transpired, or avoids irrigation','#D5F5E3')
box(0.1,0.1,9.7,0.9,'Quantities: $\\phi_D$ = drainage share of released antecedent storage;  $\\psi_D$ = drainage share of an evaporation change;  $q^*$ = hydraulic conductance scale (rate competition, Eq. 6)','#F4F6F7',6.8)
arr(2.7,3.0,3.25,3.3); arr(2.7,2.8,3.25,2.0); arr(6.1,3.3,6.85,3.1); arr(6.1,1.9,6.85,2.6)
ax.text(4.65,0.0,'',fontsize=1)
save(fig,'fig01_framework','p1')
