import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
import p_style as S
S.use_fig1_palette()
from p_style import *
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'
fig=S.setup(130,95,6.1)
ax=S.ax
S.bands(130,95,58,ylow=11,atm=(50,93.2))
# driving variables (imposed changes)
ax.add_patch(patches.FancyBboxPatch((60,80),68,10.5,boxstyle='round,pad=0,rounding_size=1.0',fc='white',ec=DRV,lw=1.3,ls=(0,(4,2.5)),zorder=3))
txt(94,92.6,'Driving variables: imposed climate change',FS-0.6)
for xx,tt in [(66.5,'evaporation\nfactor (E16)'),(79.5,'warming\n$\\Delta T$ (E11)'),(93,'mulch $\\phi$,\ncapacity (E7)'),(107,'rainfall scale\n(E14)'),(121,'nitrogen supply\n(E13, control)')]: txt(xx,85.2,tt,FS-1.9)
# SHP drivers
chip(2,79,38,90.5,'Drivers of soil hydraulic properties','texture · organic matter · tillage\nconsolidation $\\tau_c$ (E5)',fs=FS-1.0)
sbox(2,66,38,76,'Pore network\nvan Genuchten $n$, $K_s$',fc=BEI,two=(0.09,OCH),fs=FS-0.6)
flow([(20,80),(20,76)])
hexa(44,66,80,76,'Rate competition\n$\\phi_D=K_s/(K_s+q^*)$',fs=FS-0.8)
flow([(38,71),(44,71)],'info')
# root-zone storage
stipple(2,14,34,50)
lab(18,45,'Root-zone water',fs=FS+0.2); lab(18,39.5,'antecedent state\ninitial suction $h_0$ (E9)',fs=FS-1.2)
lab(18,32,'memory fates $\\phi$',fs=FS-1.0,c='#444444'); lab(18,25.5,'trigger $h^*$, sensor depth\n(E2, E3); method (E4)',fs=FS-1.6,c='#444444')
for x,t in [(7,'Soil\nevaporation'),(18,'Transpiration'),(29,'Other\nevaporation')]:
    flow([(x,50),(x,56)],'out'); lab(x,60.4,t,fs=FS-1.4)
circ(40,28,4.2,'Drain',fs=FS-1.5); flow([(34,28),(35.8,28)])
flow([(40,23.8),(40,11.5)],'out'); lab(47,16.5,'drainage $\\phi_D$',fs=FS-1.0,ha='left')
# evaporative loss and offsets
sbox(66,44,98,54,'Evaporative loss\n(baseline $E$)',fs=FS-0.6)
flow([(90,80),(90,54)]); lab(98,68,'imposed\nchange',fs=FS-1.2)
circ(74,31,4.2,'Drain',fs=FS-1.5)
sbox(83,26,99,35,'Irrigation',fs=FS-0.8)
sbox(102,26,121,35,'Transpiration',fc=BEI,two=(0.5,GRN),fs=FS-0.8)
flow([(72,44),(73,35.2)]); flow([(91,44),(91,35)]); flow([(98,49),(111.5,49),(111.5,35)])
lab(82,40,'offsets $\\psi$ (E16, E7)',fs=FS-1.3)
flow([(74,26.8),(74,11.5)],'out'); lab(76,16.5,'lost: $\\psi_D$',fs=FS-1.1,ha='left')
sbox(83,12,126,22.5,'Recoverable fraction  $1-\\psi_D$\nstays in the root zone, is transpired\nor avoids irrigation',fc=LG,fs=FS-0.9,r=1.5)
flow([(91,26),(91,22.5)]); flow([(111.5,26),(111.5,22.5)])
# information: rate competition law to both drainage fates
flow([(55,66),(55,31),(44.2,29.5)],'info'); flow([(66,66),(64,66),(64,31),(69.8,31)],'info') if False else flow([(64,66),(64,31),(69.8,31)],'info')
lab(60,50.5,'$q^*=71.5$ cm d$^{-1}$',fs=FS-1.4)
dot(60,70.5,1) if False else None
# climate effect
lab(104,60.5,'warming raises, wetter climate\nlowers $1-\\psi_D$',fs=FS-1.4,c=RED)
legend(2,0.6,128,9.6)
S.finish_a4(fig,130,95)
fig.savefig(FG+'p1/fig01_framework.png',dpi=420,facecolor='white'); fig.savefig(FG+'p1/fig01_framework.pdf',facecolor='white')
print('ok')
