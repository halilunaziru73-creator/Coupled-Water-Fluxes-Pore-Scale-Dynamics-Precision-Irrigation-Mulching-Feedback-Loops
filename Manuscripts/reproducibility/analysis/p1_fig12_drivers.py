import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+''); sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
from load import *; from figstyle import *
from matplotlib import patches
Tn=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
KS={'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}
q=71.5
fig=plt.figure(figsize=(6.4,3.7)); ax=fig.add_axes([0.07,0.13,0.40,0.80]); bx=fig.add_axes([0.52,0.02,0.47,0.94]); bx.axis('off'); bx.set_xlim(0,10); bx.set_ylim(0,10)
k=np.logspace(0,3.1,200); ax.plot(k,k/(k+q),color='#0072B2',lw=1.6,label='$K_s/(K_s+q^{*})$, $q^{*}=71.5$ cm d$^{-1}$')
for s,v in KS.items():
    ax.scatter(v,Tn.loc[s,'phiD_E9'],color='#D55E00',s=22,zorder=3); ax.annotate(s,(v,Tn.loc[s,'phiD_E9']),xytext={'S06':(-16,5),'S07':(-17,2),'S09':(7,-11)}.get(s,(5,-8)),textcoords='offset points',fontsize=6)
ax.scatter([],[],color='#D55E00',s=22,label='Simulated $\\phi_D$ (E9)')
k0=20.
for f,c,lab in [(3,'#009E73','$K_s\\times3$'),(1/3,'#CC79A7','$K_s\\times1/3$')]:
    ax.annotate('',xy=(k0*f,k0*f/(k0*f+q)),xytext=(k0,k0/(k0+q)),arrowprops=dict(arrowstyle='-|>',color=c,lw=1.3))
    ax.text(k0*f*(1.1 if f>1 else 0.45),k0*f/(k0*f+q)+(0.0 if f>1 else 0.07),lab,color=c,fontsize=7,ha='center')
ax.set_xscale('log'); ax.set_xlabel('Saturated hydraulic conductivity $K_s$ (cm d$^{-1}$)'); ax.set_ylabel('Memory fate $\\phi_D$'); ax.set_ylim(-0.02,1.05)
ax.legend(frameon=False,fontsize=6.3,loc='upper left'); panel(ax,'a',x=-0.2)
def box(x,y,w,h,t,c,fs=5.4):
    bx.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.03,rounding_size=0.15',fc=c,ec='#444',lw=0.7)); bx.text(x+w/2,y+h/2,t,ha='center',va='center',fontsize=fs,linespacing=1.2)
def arr(x1,y1,x2,y2,c='#444'): bx.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>',color=c,lw=1.0))
box(0.1,6.9,3.1,2.9,'Drivers\ntexture, organic matter,\nstructure, tillage,\nroots, biopores,\nwetting--drying,\nfreezing, sealing, mulch','#D6EAF8')
box(3.9,6.9,2.5,2.9,'Hydraulic\nproperties\n$\\alpha,\\ n,\\ K_s,\\ K(h)$','#FCF3CF')
box(7.1,6.9,2.8,2.9,'Water fates\n$\\phi_D,\\ \\psi_D$\n(drainage, uptake,\nevaporation)','#D5F5E3')
box(0.1,2.4,3.1,2.9,'Plant\nroot depth, uptake,\nstomatal control,\nlitter and canopy','#E8DAEF')
box(3.9,2.4,2.5,2.9,'Atmosphere\nevaporative\ndemand, warming,\nrainfall','#FADBD8')
box(7.1,2.4,2.8,2.9,'Soil moisture\nstate and\nsurface energy\nbalance','#F4F6F7')
arr(3.25,8.3,3.85,8.3); arr(6.45,8.3,7.05,8.3); arr(8.5,6.85,8.5,5.35)
arr(7.05,3.85,6.45,3.85); arr(3.85,3.85,3.25,3.85); arr(1.65,5.35,1.65,6.85); arr(5.15,5.35,5.15,6.85)
bx.text(5,0.9,'Feedback loop: soil moisture state shapes uptake and\nsurface fluxes, which change drivers and hydraulic properties',ha='center',va='center',fontsize=6.4,style='italic')
bx.text(0.0,9.95,'b',fontsize=10,fontweight='bold',va='bottom')
save(fig,'fig12_drivers','p1')
