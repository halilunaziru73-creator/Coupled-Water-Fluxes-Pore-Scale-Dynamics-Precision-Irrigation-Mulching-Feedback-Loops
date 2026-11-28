import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
import json
from matplotlib import cm
Tn=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
order=sorted(SOIL_N,key=lambda s:-VG[s][1])   # high n (coarse) -> low n (fine)
col={s:cm.viridis(i/9) for i,s in enumerate(order)}
def Se(h,a,n): m=1-1/n; return (1+(a*h)**n)**(-m)
def Kr(h,a,n): m=1-1/n; s=Se(h,a,n); return np.sqrt(s)*(1-(1-s**(1/m))**m)**2
# ---- Fig 2: hydraulic properties
fig,ax=plt.subplots(2,2,figsize=(7.2,5.6)); h=np.logspace(0,4.4,400)
for s in order:
    a,n=VG[s]; lab=f"{s} {SOIL_L[s]}"
    ax[0,0].plot(h,Se(h,a,n),color=col[s],label=lab); ax[0,1].semilogy(h,Kr(h,a,n),color=col[s])
    # pore-size distribution: r = 0.149/h cm -> r in um = 1490/h ; density dSe/dlog10 r
    r=1490/h; dS=-np.gradient(Se(h,a,n),np.log10(h)); ax[1,0].plot(r,dS,color=col[s])
ax[0,0].set_xscale('log'); ax[0,0].set_xlabel('Suction $|h|$ (cm)'); ax[0,0].set_ylabel('Effective saturation $S_e$'); panel(ax[0,0],'a')
ax[0,1].set_xscale('log'); ax[0,1].set_xlabel('Suction $|h|$ (cm)'); ax[0,1].set_ylabel('Relative conductivity $K_r$'); ax[0,1].set_ylim(1e-10,1.3); panel(ax[0,1],'b')
ax[1,0].set_xscale('log'); ax[1,0].set_xlabel('Equivalent pore radius $r$ ($\\mu$m)'); ax[1,0].set_ylabel('Pore-size density $-\\mathrm{d}S_e/\\mathrm{d}\\log_{10}r$'); ax[1,0].invert_xaxis(); panel(ax[1,0],'c')
ns=[VG[s][1] for s in SOIL_N]; k30=[np.log10(Kr(30,*VG[s])) for s in SOIL_N]
sc=ax[1,1].scatter(ns,k30,c=[col[s] for s in SOIL_N],s=38,edgecolor='#333',linewidth=0.5,zorder=3)
for s,x,y in zip(SOIL_N,ns,k30): ax[1,1].annotate(s,(x,y),xytext=(3,3),textcoords='offset points',fontsize=6.5)
ax[1,1].set_xlabel('van Genuchten $n$'); ax[1,1].set_ylabel('$\\log_{10}K_r$ at $|h|=30$ cm'); panel(ax[1,1],'d')
h_,l_=ax[0,0].get_legend_handles_labels(); fig.legend(h_,l_,loc='lower center',ncol=5,frameon=False,fontsize=6.5,bbox_to_anchor=(0.5,-0.06))
fig.tight_layout(rect=(0,0.02,1,1)); save(fig,'fig02_hydraulics','p1')
# ---- Fig 3: E9 memory grid
x9=e9(); fig,axs=plt.subplots(2,5,figsize=(7.4,3.9),sharex=True)
Pcol=cm.plasma(np.linspace(0.05,0.85,5))
for ax,s in zip(axs.ravel(),order):
    g=x9[x9.s==s]; Ps=sorted(g.P.unique()); 
    for i,P in enumerate(Ps):
        gp=g[g.P==P].sort_values('h0'); ax.plot(gp.h0,gp.draw,marker='o',ms=2.2,lw=0.9,color=cm.plasma(0.05+0.8*i/(len(Ps)-1)),label=f'{P:g}' if s==order[0] else None)
    ax.set_xscale('log'); ax.set_title(f"{s} {SOIL_L[s]}  (n={VG[s][1]:.2f})",fontsize=6.8)
for ax in axs[1]: ax.set_xlabel('Initial suction $h_0$ (cm)')
fig.supylabel('Storage release $\\bar R$ (mm yr$^{-1}$)',x=0.0,fontsize=8.5)
for i,ax in enumerate(axs.ravel()): panel(ax,'abcdefghij'[i],x=-0.22 if i%5==0 else -0.12,y=1.16)
h_,l_=axs[0,0].get_legend_handles_labels(); fig.legend(h_,l_,loc='lower center',ncol=10,frameon=False,fontsize=6,bbox_to_anchor=(0.5,-0.04),title='Rain scale $P$',title_fontsize=6.5)
fig.tight_layout(rect=(0,0.04,1,1)); save(fig,'fig03_memory_grid','p1')
print('ok')
