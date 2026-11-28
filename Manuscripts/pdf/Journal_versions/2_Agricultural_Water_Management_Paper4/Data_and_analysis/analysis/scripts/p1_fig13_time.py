import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
KS={'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}
q=71.5; phi=lambda k:k/(k+q)
fig,(ax,bx)=plt.subplots(1,2,figsize=(6.4,2.9),gridspec_kw={'width_ratios':[1,1.15]})
t=np.linspace(0,365,300)
for s,c in [('S05','#0072B2'),('S06','#009E73'),('S10','#D55E00')]:
    k0=KS[s]
    for tau,ls in [(0.005,'-'),(0.02,'--')]:
        ax.plot(t,phi(k0*(1+2*np.exp(-tau*t))),color=c,ls=ls,lw=1.4,label=f'$\\tau_c$={tau} d$^{{-1}}$' if s=='S06' else None)
    ax.axhline(phi(k0),color=c,lw=0.6,ls=':'); ax.text(368,phi(k0),s,color=c,fontsize=6.5,va='center')
ax.set_xlabel('Days after loosening'); ax.set_ylabel('Memory fate $\\phi_D$'); ax.set_xlim(0,395); ax.set_ylim(0,1)
ax.legend(frameon=False,fontsize=6,loc='center right'); panel(ax,'a',x=-0.2)
names=list(KS); x=np.arange(len(names)); w=0.26
for i,(m,c,l) in enumerate([(1/3,'#CC79A7','$K_s\\times1/3$'),(1,'#888888','baseline'),(3,'#009E73','$K_s\\times3$')]):
    bx.bar(x+(i-1)*w,[phi(KS[s]*m) for s in names],w,color=c,label=l)
bx.set_xticks(x); bx.set_xticklabels(names,fontsize=6.5); bx.set_ylabel('Memory fate $\\phi_D$'); bx.legend(frameon=False,fontsize=6,ncol=3,loc='upper center',bbox_to_anchor=(0.5,1.14)); panel(bx,'b',x=-0.2)
save(fig,'fig13_time_management','p1')
