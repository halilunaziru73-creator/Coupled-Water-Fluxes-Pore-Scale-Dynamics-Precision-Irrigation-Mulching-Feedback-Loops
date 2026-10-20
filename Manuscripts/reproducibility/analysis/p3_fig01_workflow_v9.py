import numpy as np, matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import patches
plt.rcParams.update({'font.family':'Carlito','mathtext.fontset':'custom','mathtext.rm':'Carlito','mathtext.it':'Carlito:italic','mathtext.bf':'Carlito:bold','mathtext.fallback':'stixsans'})
FG=__import__('os').environ.get('SWAFL_MS','.')+'/fig/'
W,H=200,143
fig=plt.figure(figsize=(11,11*H/W),facecolor='white'); ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,W); ax.set_ylim(0,H); ax.axis('off')
BLK='#000000'; GRY='#8c8c8c'; RED='#B7410E'
WAT='#F4B6CB'; GRN='#F6A247'; BEI='#DDC6AE'; OCH='#CC6B45'; HEX='#D8C7EA'; LG='#FBDDB9'
FS=8.0; LW=1.5
# ---------------- faint crop and root illustration (as in the Daisy schematic)
rng=np.random.default_rng(3)
pass
for dx,ph in [(-3,0),(0,1),(3,2)]:
    ys=np.linspace(72,120,40); xs=96+dx+1.2*np.sin(ys/9+ph)
    ax.plot(xs,ys,color='#E39A52',lw=1.6,alpha=0.35,zorder=0.4)
for yl,sd in [(82,1),(92,-1),(102,1),(110,-1),(118,1)]:
    t=np.linspace(0,1,20); ax.plot(96+sd*(t*14),yl+8*t-14*t**2*0.9,color='#E39A52',lw=2.0,alpha=0.30,zorder=0.4)
for i in range(7):
    ax.add_patch(patches.Ellipse((96+(i%2*2-1)*1.6,121+i*1.4),2.2,4.2,angle=(i%2*2-1)*18,fc='#F2C48D',ec='none',alpha=0.45,zorder=0.4))
for k in range(26):
    x0=96+rng.uniform(-3,3); t=np.linspace(0,1,25); L=rng.uniform(10,48); sd=rng.uniform(-1,1)
    ax.plot(x0+sd*14*t**1.3+np.sin(t*6+k)*0.9,72-L*t,color='#B7410E',lw=0.8,alpha=0.22,zorder=0.4)
# ---------------- clear demarcation of the soil (white background kept)
ax.set_xlim(0,W); ax.set_ylim(0,H)
ax.plot([-5,205],[72,72],color='#B98A4E',lw=2.8,alpha=0.85,zorder=0.5,solid_capstyle='butt')
ax.text(3,74.4,'soil surface',fontsize=7.5,ha='left',va='center',color='#8A6A3E',fontweight='bold',style='italic',zorder=0.6)
ax.text(3,69.4,'soil',fontsize=7.5,ha='left',va='center',color='#8A6A3E',fontweight='bold',zorder=0.6)
# ---------------- primitives
def txt(x,y,s,fs=FS,ha='center',va='center',c=BLK,**k): ax.text(x,y,s,fontsize=fs,ha=ha,va=va,fontweight='bold',color=c,zorder=8,linespacing=1.12,**k)
def sbox(x0,y0,x1,y1,s,fc=WAT,fs=FS,two=None,r=1.5,lw=1.6,ec=BLK,ls='-'):
    ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc=fc,ec=ec,lw=lw,ls=ls,zorder=3))
    if two:
        ax.add_patch(patches.FancyBboxPatch((x0,y0),(x1-x0)*two[0],y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc=two[1],ec='none',zorder=3.2))
        ax.add_patch(patches.FancyBboxPatch((x0,y0),x1-x0,y1-y0,boxstyle=f'round,pad=0,rounding_size={r}',fc='none',ec=ec,lw=lw,zorder=3.4))
    txt((x0+x1)/2,(y0+y1)/2,s,fs)
def hexa(x0,y0,x1,y1,s,fc=HEX,fs=FS-0.4):
    d=min(2.4,(y1-y0)/2)
    pts=[(x0,(y0+y1)/2),(x0+d,y1),(x1-d,y1),(x1,(y0+y1)/2),(x1-d,y0),(x0+d,y0)]
    ax.add_patch(patches.Polygon(pts,closed=True,fc=fc,ec=BLK,lw=1.4,zorder=3)); txt((x0+x1)/2,(y0+y1)/2,s,fs)
def circ(x,y,r,s='',fc=WAT,fs=FS):
    ax.add_patch(patches.Circle((x,y),r,fc=fc,ec=BLK,lw=1.4,zorder=3)); 
    if s: txt(x,y,s,fs)
def flow(pts,kind='solid',lw=LW,ms=9,head=True):
    col={'solid':BLK,'out':BLK,'info':BLK,'grey':GRY,'greyd':GRY,'loop':RED}[kind]
    ls={'solid':'-','out':(0,(4,2.6)),'info':(0,(1,2.2)),'grey':'-','greyd':(0,(4.5,2.8)),'loop':(0,(4,2.4))}[kind]
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    ax.plot(xs[:-1] if len(pts)>2 else [xs[0],xs[1]],ys[:-1] if len(pts)>2 else [ys[0],ys[1]],color=col,lw=lw,ls=ls,zorder=6,solid_capstyle='butt') if True else None
    if len(pts)>2: ax.plot(xs[-2:],ys[-2:],color=col,lw=lw,ls=ls,zorder=6,solid_capstyle='butt')
    if head:
        (x1,y1),(x2,y2)=pts[-2],pts[-1]
        ax.annotate('',xy=(x2,y2),xytext=(x1,y1),arrowprops=dict(arrowstyle='-|>,head_width=0.22,head_length=0.5',color=col,lw=0.1,shrinkA=0,shrinkB=0,mutation_scale=ms*1.3),zorder=7)
def dot(x,y,n):
    ax.add_patch(patches.Circle((x,y),1.7,fc=RED,ec='white',lw=0.9,zorder=9)); ax.text(x,y-0.05,str(n),fontsize=7.4,color='white',ha='center',va='center',zorder=10,fontweight='bold')
def lab(x,y,s,fs=FS-0.6,ha='center',c=BLK,**k): ax.text(x,y,s,fontsize=fs,ha=ha,va='center',fontweight='bold',color=c,zorder=8,linespacing=1.1,bbox=dict(fc='white',ec='none',pad=0.4,alpha=0.85),**k)
# ================= DRIVING VARIABLES (dashed box, as Daisy)
ax.add_patch(patches.FancyBboxPatch((126,129),62,8.6,boxstyle='round,pad=0,rounding_size=1.2',fc='white',ec='#7B4FA0',lw=1.5,ls=(0,(4,2.5)),zorder=3))
txt(157,139.3,'Driving variables',FS)
txt(138,133.3,'Rain $P=P_{base}\\rho$\n& irrigation $I$',FS-0.8); txt(160,133.3,'Temperature $\\Delta T$\nradiation, RH',FS-1.0); txt(177,133.3,'Wind $u$\nvapour deficit',FS-0.9)
# rain node and water cascade (blue = water)
circ(57,131.5,1.4,fc='#7B4FA0')
flow([(126,134.5),(57,134.5),(57,132.9)])
lab(70,136.3,'Rainfall',c=BLK)
# intercepted water
sbox(64,111,86,118,'Intercepted water\n$I_c$',fs=FS-0.4)
flow([(57,131.5),(75,131.5),(75,118)]) ; 
flow([(75,111),(75,88),(53.2,88),(53.2,80)]); lab(64,90.5,'Drip off',fs=FS-0.6)
flow([(57,130),(57,94),(49.5,94),(49.5,80)]); lab(61.5,100,'Throughfall',fs=FS-0.6,ha='left')
flow([(80,118),(80,127)],'out'); lab(80,129.2,'Evaporation')
# mulch (litter water)
sbox(33,74.8,56,80,'Mulch water  (cap., $\\phi$)',fs=FS-0.6,r=0.9)
flow([(40,80),(40,92)],'out'); lab(40,94.2,'Evaporation')
# surface water
sbox(26,67.2,48,72.6,'Surface water',fs=FS-0.4,r=0.9)
flow([(44,74.8),(44,72.6)]); lab(52.5,73.6,'Percolation',ha='left',fs=FS-1.4) if False else None
flow([(31,72.6),(31,84)],'out'); lab(26.8,85.8,'Evaporation')
flow([(26,69.9),(20,69.9)],'out'); lab(17.5,72.2,'Runoff')
# soil water column (stippled)
ax.add_patch(patches.Rectangle((19.5,15),29.8,47.7,fc='#FBE4EC',ec='none',zorder=2))
_r=np.random.default_rng(7); ax.scatter(_r.uniform(20,49,520),_r.uniform(15.6,62.2,520),s=0.9,color='#D07FA3',zorder=2.2,lw=0)
ax.add_patch(patches.Rectangle((19.5,15),29.8,47.7,fc='none',ec=BLK,lw=1.6,zorder=3))
lab(34.4,53,'Soil water',fs=FS+0.8); lab(34.4,46.8,'40-layer cascade\nand redistribution',fs=FS-0.8); lab(34.4,40.2,'$q_i=0.08\\,(w_{i+1}-w_i)$',fs=FS-1.0)
lab(34.4,32.2,'Solute transport:\nN advected with\ndrainage',fs=FS-1.0)
flow([(24,67.2),(24,62.7)]); lab(15,64.5,'Infiltration',ha='center')
flow([(33,62.7),(33,67.2)]); lab(41.6,65.0,'Soil evaporation $E_d$',ha='left',fs=FS-1.0) if False else None
circ(49.3,25.5,4.4,'Drain\n$D$',fs=FS-1.2)
flow([(37,15),(37,3.4)],'out'); lab(28.5,10.2,'Percolation',fs=FS-0.6)
# groundwater strip
ax.add_patch(patches.Rectangle((-3,0),206,2.4,fc='white',ec='none',hatch='//////',zorder=1)); ax.add_patch(patches.Rectangle((-3,0),206,2.4,fc='none',ec='#C77AA0',lw=0.0,zorder=1))
ax.add_patch(patches.Rectangle((-3,0),206,2.4,fc=(0.78,0.48,0.63,0.25),ec='none',zorder=0.9))
lab(100,1.2,'groundwater',fs=FS-1.6,c='#7B4FA0')
# ================= CROP (green = crop; two-tone = C + N)
sbox(99,118.5,114,125.5,'Yield\n(storage organ)',fc=BEI,two=(0.55,GRN),fs=FS-0.6)
flow([(106.5,125.5),(106.5,129.5)],'out'); lab(113.5,128,'Harvest')
hexa(99,103,115,111,'Canopy cover $c$\nLAI',fs=FS-0.8)
sbox(93,62,115,68.7,'Root zone  $R_{max}$',fc=BEI,two=(0.55,GRN),fs=FS-0.6)
flow([(95.5,68.7),(95.5,129)],'out'); lab(91,124,'Transpiration\n$T_d=k_t T_{yr}c/\\bar C$',ha='right',fs=FS-0.8)
flow([(49.3,55),(101,55),(101,62)]); lab(76,52.8,'Water uptake (root-weighted)',fs=FS-0.9)
flow([(106.5,111),(106.5,118.5)],'info')
# nitrogen (beige)
sbox(62,36.5,80,43.5,'Mineral N\n(nitrate)',fc=BEI,fs=FS-0.6)
sbox(60,80.5,77,87,'N fertiliser\nrate',fc=BEI,fs=FS-0.6)
flow([(68.5,80.5),(68.5,43.5)]); lab(72.4,76.8,'Fertilisation',ha='left',fs=FS-0.9) if False else None
flow([(80,40),(108,40),(108,62)]); lab(94,41.6,'N uptake',fs=FS-0.9)
flow([(71,36.5),(71,3.4)],'out'); lab(69,12,'Leaching\n$\\kappa_N D$',ha='right',fs=FS-0.9)
flow([(62,40),(56.0,40),(56.0,26.6),(53.7,26.6)],'out')
# ================= ENGINES / INFORMATION (hexagons, as Photosynthesis block)
hexa(128,108,152,116,'Engine 2\ndaily step',fs=FS-0.4)
hexa(126,119,154,127,'Engine 1\nannual targets',fs=FS-0.6)
hexa(126,96.5,154,104.5,'Calibrate $k_t$ (6 %),\nscale $S$, close $P+I-D$',fs=FS-1.2)
flow([(140,119),(140,116)]); flow([(140,108),(140,104.5)],'solid')
for yy,s in [(121.5,'Evaporative demand\n$E_0$ (T, RH, $R_n$)'),(113,'Wind $u$\ncanopy catch'),(104.5,'Trigger $h^*$\nsensor depth')]:
    hexa(166,yy-3.2,190,yy+3.2,s,fs=FS-1.2); flow([(166,yy),(152.8 if yy!=121.5 else 154.5,yy if yy==113 else yy)],'info',head=True) if False else None
flow([(166,121.5),(154,121.5)],'info') ; flow([(166,113),(152,113)],'info'); flow([(166,104.5),(154,100.5)],'info')
flow([(128,112),(115,108.5)],'info'); lab(121.5,112.8,'$c$, $E_0$',fs=FS-1.2) if False else None
flow([(126,100.5),(96.5,100.5)],'greyd')
# ================= SOIL STATE (ochre = soil structure / hydraulics)
sbox(124,83.5,149,90.5,'Ten soils\nSaxton–Rawls $\\theta_s,K_s$',fc=BEI,fs=FS-1.0)
sbox(157,83.5,184,90.5,'Retention $\\theta(\\psi)$\nand $K(\\psi)$',fc=OCH,two=(0.35,BEI),fs=FS-0.8) if False else sbox(157,83.5,184,90.5,'Retention $\\theta(\\psi)$\nand $K(\\psi)$',fc=BEI,fs=FS-0.8)
sbox(124,71.5,149,78.5,'Structure state\ntillage, consolidation',fc=BEI,two=(0.4,OCH),fs=FS-1.0)
sbox(157,71.5,184,78.5,'Hydraulic memory\n$\\phi_D=K_s/(K_s+q^*)$',fc=BEI,two=(0.4,OCH),fs=FS-1.2)
flow([(149,87),(157,87)]); flow([(149,75),(157,75)]); flow([(170.5,78.5),(170.5,83.5)])
flow([(170.5,90.5),(170.5,94.2),(120,94.2),(120,33),(49.3,33)],'greyd'); 
flow([(170.5,71.5),(170.5,68),(120,68)],'greyd',head=False)
lab(84,34.6,'$K,\\theta,\\phi_D$ (information)',fs=FS-1.2)
# ================= IRRIGATION CONTROL AND DESIGN
hexa(126,53,152,59.5,'Suction $\\psi\\geq h^*$ ?',fs=FS-0.8)
hexa(160,53,192,59.5,'Plan depth $Z_n$ = clip$(f_T$AWC$R_{max}$; 25, 150) mm',fs=FS-1.6)
flow([(49.3,59.6),(126,56.6)],'info'); lab(68,60.9,'suction at sensor depth',fs=FS-1.2) if False else None
flow([(152,56.3),(160,56.3)]); lab(156,58.6,'Yes',fs=FS-1.0)
flow([(192,56.3),(197.6,56.3),(197.6,134.5),(188,134.5)],'loop'); lab(194.5,95,'applied $I$',fs=FS-0.9,c=RED,rotation=90)
hexa(126,34,142,41,'Method\nchosen ?',fs=FS-1.2)
flow([(176,53),(176,50.2),(134,50.2),(134,41)])
SB=[(40.6,49.2,'SURFACE  Green–Ampt, Manning,\nvolume balance, $f_0$'),(31.6,40.0,'DRIP  Hazen–Williams, $E_u$,\nbulb, head'),(22.6,31.0,'SPRINKLER  orifice, range,\nCU, runoff')]
for (y0,y1,s) in SB:
    sbox(148,y0,171.5,y1,s.replace('  ','\n',1),fc=LG,fs=FS-2.1,r=1.0); flow([(145.5,(y0+y1)/2),(148,(y0+y1)/2)])
ax.plot([145.5,145.5],[27,45],color=BLK,lw=LW,zorder=6); flow([(142,37.5),(145.5,37.5)],head=False)
ax.plot([174,174],[27,45],color=BLK,lw=LW,zorder=6)
for (y0,y1,s) in SB: ax.plot([171.5,174],[(y0+y1)/2]*2,color=BLK,lw=LW,zorder=6)
flow([(174,36),(182,36)])
hexa(182,32,197,40,'Ten design\nchecks ?',fs=FS-1.4)
flow([(189.5,32),(189.5,29.5)])
sbox(176,6.5,198.5,29.5,'',fc=LG,r=1.6)
txt(187.2,27.3,'SIMULATION RESULTS',FS-1.9)
txt(187.2,22.0,'yield · ET · drainage\nN leaching · schedule\ndesign $D$, spacing, nozzle',FS-2.0)
ax.plot([178,196.5],[17.2,17.2],color=BLK,lw=0.8,zorder=6)
txt(187.2,11.7,'verified: surface 0.08 %,\nFAO-45 3 %, sprinkler +1 %\ndrip $3\\times10^{-7}$\nEngine 1 $\\rho_s$ 0.64–0.97\nEngine 2 closure 0.1 % (median)',FS-2.1)
# design-input chip
ax.add_patch(patches.FancyBboxPatch((120,24.2),22.5,8.4,boxstyle='round,pad=0,rounding_size=1.0',fc='white',ec='#7B4FA0',lw=1.3,ls=(0,(4,2.5)),zorder=3))
txt(131.2,30.6,'Design inputs',FS-1.3,c='#7B4FA0'); txt(131.2,26.7,'$L$, $S_0$, $n$, $q$ · $S_e$, $D$\n$d$, $P$, $S_s$, $A_f$, $Q_s$',FS-2.2)
# ================= STRUCTURE FEEDBACK (red) and loops
flow([(53.7,23.8),(122,23.8),(122,75),(124,75)],'loop')
# ================= LOOP LIST (extra feature)
ax.add_patch(patches.FancyBboxPatch((1,104),29,34.5,boxstyle='round,pad=0,rounding_size=1.2',fc='white',ec=RED,lw=1.3,ls=(0,(4,2.5)),zorder=3))
txt(15.5,136,'Feedback loops',FS-0.8,c=RED)
LP=['$\\Delta T$ → yield, irrigation','rain → drainage, irrigation','mulch → evaporation','trigger → irrigation, yield','drainage → N leaching','N rate → leaching, yield','consolidation → drainage']
for i,t in enumerate(LP):
    y=131.4-i*3.9; dot(4.0,y,i+1); ax.text(6.8,y,t,fontsize=FS-1.6,ha='left',va='center',fontweight='bold',zorder=8)
dot(147,134.5,1); dot(62.5,131.8,2); dot(57.5,80.2,3); dot(121,56.3,4); dot(71,22,5); dot(68.5,62,6); dot(100,24.7,7)
# ================= LEGEND (as Daisy, extended)
ax.add_patch(patches.FancyBboxPatch((82,4.2),88,17,boxstyle='round,pad=0,rounding_size=1.0',fc='white',ec='#444444',lw=0.9,zorder=3))
items=[('solid','Inputs and movement of water, N and matter'),('out','Outputs from the system'),('info','Exchange of information within modules'),('greyd','Exchange of information between modules'),('loop','Feedback loop (numbered circles)')]
for i,(k,t) in enumerate(items):
    y=19.2-i*2.75; flow([(84,y),(94,y)],k,head=False,lw=1.3); ax.text(95.5,y,t,fontsize=FS-1.8,ha='left',va='center',fontweight='bold',zorder=8)
for j,(c,t) in enumerate([(WAT,'water'),(GRN,'crop'),(BEI,'nitrogen'),(OCH,'soil state'),(HEX,'process / information')]):
    y=19.2-j*2.75; ax.add_patch(patches.Rectangle((141,y-0.95),3.6,1.9,fc=c,ec=BLK,lw=0.8,zorder=6)); ax.text(145.8,y,t,fontsize=FS-1.8,ha='left',va='center',fontweight='bold',zorder=8)
ex=(H*297/210-W)/2; ax.set_xlim(-ex,W+ex); fig.set_size_inches(11,11*210/297)
fig.savefig(FG+'p3/fig01_architecture.png',dpi=420,facecolor='white'); fig.savefig(FG+'p3/fig01_architecture.pdf',facecolor='white')
print('ok')
