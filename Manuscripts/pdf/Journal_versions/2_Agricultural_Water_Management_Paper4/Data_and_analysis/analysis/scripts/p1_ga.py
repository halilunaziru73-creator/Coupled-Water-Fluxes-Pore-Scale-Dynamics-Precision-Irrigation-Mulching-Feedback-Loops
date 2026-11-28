import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
import p_style as S
from p_style import *
import pandas as pd
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'
W,H=130,100
S.YLO=-14
fig=S.setup(W,H-S.YLO,6.1); ax=S.ax; ax.set_zorder(20)
S.bands(W,H,70.5,lx=77)
# ---- row 1: drivers and law
chip(2,76,60,98,'Driving variables','evaporation saving: mulch · residue · shade\nwarming $\\Delta T$ (+4 °C) · rainfall (0.5–1.5×)\nnitrogen supply (negative control)\n10 soils · 20-year weather · 17 experiments',fs=FS-0.6)
ax.text(31,78.4,'10,190 Daisy runs',fontsize=FS-1.2,ha='center',va='center',fontweight='bold',color=DRV,zorder=8)
hexa(66,76,126,98,'Hydraulic memory:  rate competition\n$\\phi_D=K_s/(K_s+q^{\\ast})$,  $q^{\\ast}$ = 71.5 cm d$^{-1}$\nsaved water stays in the root zone or drains',fs=FS-0.7,d=3.2)
flow([(60,87),(66,87)],'info')
# ---- row 2: real pore sections
por1,_=pore_pack(2,32,34,66,2.3,3.4,seed=5)
por2,_=pore_pack(38,32,70,66,0.8,1.5,seed=9,fine=1100)
txt(18,68.3,'Sand',FS-0.4,ha='center'); txt(54,68.3,'Silty clay loam',FS-0.4)
lab(18,29.6,'$K_s$ = 713 cm d$^{-1}$ · $\\phi_D$ = 0.85',fs=FS-1.5); lab(54,29.6,'$K_s$ = 1.7 cm d$^{-1}$ · $\\phi_D$ = 0.02',fs=FS-1.5)
# water entering and leaving
for x,k in [(7,'solid'),(43,'solid')]: flow([(x,74.5),(x,66.6)],k,lw=LW*(1.8 if x<30 else 0.7))
lab(11,72.6,'saved water',fs=FS-1.6,ha='left'); lab(47,72.6,'saved water',fs=FS-1.6,ha='left')
flow([(26,26.2),(26,22.0)],'out',lw=LW*1.8); flow([(62,26.2),(62,22.0)],'out',lw=LW*0.7)
lab(30,24.0,'drains: 85 %',fs=FS-1.4,c=RED,ha='left'); lab(66,24.0,'drains: 2 %',fs=FS-1.4,c=RED,ha='left')
# legend of the section
ax.add_patch(patches.Circle((3.6,57.5),0.0,fc='none')); 
# ---- row 2 right: law vs data
T=pd.read_csv(__import__('os').environ.get('SWAFL_MS','.')+'/out/p1_table2.csv',index_col=0)
KS={'S03':712.8,'S04':350.2,'S05':106.1,'S06':24.96,'S07':6.24,'S08':31.44,'S09':6.24,'S10':1.68}
a=inset(fig,W,H,87,36,127,65)
ks=np.logspace(-0.3,3.1,200); a.plot(ks,ks/(ks+71.5),color=RED,lw=1.4)
a.scatter([KS[s] for s in KS],[T.loc[s,'phiD_E9'] for s in KS],s=14,color=DRV,ec='black',lw=0.6,zorder=5)
for s in KS: a.annotate(s,(KS[s],T.loc[s,'phiD_E9']),xytext=({'S09':-14}.get(s,3),{'S05':-9,'S04':-6,'S07':-8,'S09':3,'S06':-8,'S08':3}.get(s,2)),textcoords='offset points',fontsize=4.6,fontweight='bold')
a.set_xscale('log'); a.set_ylim(-0.03,1.0); a.set_xlabel('saturated conductivity $K_s$ (cm d$^{-1}$)',fontsize=5.8,fontweight='bold',labelpad=1); a.set_ylabel('memory fate $\\phi_D$',fontsize=5.8,fontweight='bold',labelpad=1)
a.text(0.04,0.93,'LOSO RMSE 0.058\n(mean only: 0.338)',transform=a.transAxes,fontsize=5.4,fontweight='bold',va='top',color=RED)
txt(105.5,67.6,'Prediction for soils withheld from fitting',FS-1.0)
# ---- row 3: climate modifiers
txt(33,19.2,'Change in recoverable share $1-\\psi_D$',FS-0.9)
b=inset(fig,W,H,22,5,56,16)
labs=['+4 °C warming\n(10 of 10 soils)','rain 0.5→1.5×\n(9 of 9 soils)','nitrogen\n(control)']; val=[0.16,-0.42,0.0]
b.barh(range(3),val,color=[HEX,WAT,'#DDDDDD'],ec='black',lw=0.8,height=0.6); b.set_yticks(range(3)); b.set_yticklabels(labs,fontsize=5.0,fontweight='bold'); b.invert_yaxis(); b.axvline(0,color='black',lw=0.8)
b.set_xlim(-0.55,0.3)
for i,v in enumerate(val): b.text(v+(0.02 if v>=0 else -0.02),i,('%+.2f'%v) if v else '≈ 0',ha='left' if v>=0 else 'right',va='center',fontsize=5.6,fontweight='bold')
sbox(62,4,127,19,'Recoverable share = $1-\\psi_D$\nmulch saving drained: 0.30 (coarse loam) – 0.71 (sand)\nuse: soil-specific discount on evaporation-saving claims\nmodel-based hypothesis · lysimeter test specified',fc=LG,fs=FS-1.0,r=1.2)
flow([(31,28),(31,22)],'info',head=False) if False else None
legend(2,0.0,127,2.4) if False else None
# ---- relationships and reading order
flow([(106,76),(106,71.6)],'info',head=False) if False else None
flow([(123,76),(123,66.5)],'info'); lab(121.6,72.8,'law tested on 8 soils',fs=FS-1.7,c=DRV,ha='right')
flow([(70.5,50),(81.6,50)],'info'); lab(78.5,53.4,'one point\nper soil',fs=FS-1.7)
lab(2.5,24.0,'stays: 15 %',fs=FS-1.4,ha='left',c='#2E7D4F'); lab(60,24.0,'stays: 98 %',fs=FS-1.4,ha='right',c='#2E7D4F')
flow([(105,31.0),(105,19.8)],'info'); lab(113,27.2,'larger $K_s$ → larger\ndrained share',fs=FS-1.7)
flow([(56.4,10.5),(62,10.5)],'info')
for x,y,n in [(2.2,97.4,1),(66.4,97.4,2),(2.2,65.6,3),(38.2,65.6,3),(88.4,67.4,4),(16.6,19.2,5),(62.4,18.4,6)]: dot(x,y,n)
legend(2,-13.2,127,-3.4,chip_label='Driving variable · red number = reading order')
fig.savefig(FG+'p1/ga_p1.png',dpi=420,facecolor='white'); fig.savefig(FG+'p1/ga_p1.pdf',facecolor='white')
print('ok',round(por1,2),round(por2,2))
