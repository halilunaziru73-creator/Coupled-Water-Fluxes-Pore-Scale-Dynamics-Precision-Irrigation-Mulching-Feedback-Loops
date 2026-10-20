import sys; sys.path.insert(0,__import__('os').environ.get('SWAFL_MS','.')+'/analysis')
import p_style as S
S.use_fig1_palette()
from p_style import *
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'
fig=S.setup(130,88,6.1)
ax=S.ax
# data store
stipple(2,32,26,60)
lab(14,55,'Daisy ensemble',fs=FS-0.2); lab(14,46,'10,041 valid runs\n17 experiments\n10 soils',fs=FS-1.0)
flow([(14.7,66.4),(14.7,60)])
flow([(14,32),(14,24)],'out'); lab(14,19.5,'149 failed\nruns excluded',fs=FS-1.4)
S.bands(130,88,64.2)
chip(2,66.4,27.5,86.6,'Variables considered','atmosphere: rain $P$, $\\Delta T$, $E_p$\nwater: $I$, ET, $T$, $E_s$, $D$, $\\Delta S$\nsoil: $n$, $K_s$, tillage, mulch $\\phi$\ncrop: N supply, yield',fs=FS-1.8)
# stages
XS=[30,55,80,105]; W_=22
ST=[('1  Linear\ninvariants','null space of the\nflux matrix;\nbootstrap'),('2  Hidden\nterms','residual of the\nET partition\nand its drivers'),('3  Partition\nmanifold','compositional\n(clr) PCA of\nwater fates'),('4  Sparse\nlaws','forward selection\nover a dimension-\nless library')]
for x,(t,d) in zip(XS,ST):
    hexa(x,38,x+W_,60,'',fs=FS,d=2.6)
    txt(x+W_/2,55.2,t,FS-0.9); txt(x+W_/2,45.6,d,FS-1.6,c='#222222')
flow([(26,46),(28.5,46),(28.5,49),(30,49)])
for i in range(3): flow([(XS[i]+W_,49),(XS[i+1],49)])
# outputs (green results)
OU=['Conservation\nlaw\n(positive control)','Hidden term\nin the ET\nbalance','Manifold\ndimension','Compact equations\nwith uncertainty and\ndomain of validity']
for x,t in zip(XS,OU):
    sbox(x,68,x+W_,80,t,fc=LG,fs=FS-1.5,r=1.2); flow([(x+W_/2,60),(x+W_/2,68)])
txt(66,84.2,'OUTPUTS',FS-0.4,c='#8B5A3C')
# controls (chips)
chip(29,18,53,27.5,'Permutation null','column-permuted flux matrix',fs=FS-1.3)
chip(56,18,80,27.5,'Physical checks','mass closure · sign · bounds',fs=FS-1.3)
chip(83,18,105,27.5,'Benchmark','gradient boosting',fs=FS-1.3)
chip(108,18,128,27.5,'LOSO and LOEO','soil or experiment held out',fs=FS-1.5)
flow([(41,27.5),(41,38)],'info'); flow([(62,27.5),(62,38)],'info'); flow([(72,27.5),(84,38)],'info'); flow([(100,27.5),(109,38)],'info'); flow([(113,27.5),(116,38)],'info'); flow([(118,27.5),(122,38)],'info')
flow([(94,27.5),(110,36),(110,38)],'info',head=False) if False else None
txt(80,30.2,'CONTROLS',FS-0.4,c=DRV)
# positive control feedback
flow([(41,60),(41,64),(10,64),(10,64.4)],'loop',head=False) if False else None
lab(67.5,66.2,'stage 1 recovers the known balance (positive control)',fs=FS-1.6,c=RED) if False else None
legend(2,0.8,128,9.8,chip_label='Control or validation step')
S.finish_a4(fig,130,88)
fig.savefig(FG+'p2/fig01_pipeline.png',dpi=420,facecolor='white'); fig.savefig(FG+'p2/fig01_pipeline.pdf',facecolor='white')
print('ok')
