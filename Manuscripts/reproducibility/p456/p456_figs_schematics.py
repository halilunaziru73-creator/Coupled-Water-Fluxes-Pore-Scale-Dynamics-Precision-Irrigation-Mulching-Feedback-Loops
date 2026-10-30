"""Schematic figures of P4, P5, P6 (architecture diagrams)."""
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, os
from matplotlib import patches
H=os.path.dirname(os.path.abspath(__file__)); FG=H+'/../../figures/'
plt.rcParams.update({'font.family':'DejaVu Sans','pdf.fonttype':42})
WAT='#F4B6CB'; GRN='#F6A247'; BEI='#DDC6AE'; OCH='#CC6B45'; HEX='#D8C7EA'; LG='#FBDDB9'; RED='#B7410E'; BLK='#222222'
def canvas(w,h,size):
    fig=plt.figure(figsize=size); ax=fig.add_axes([0,0,1,1]); ax.set_xlim(0,w); ax.set_ylim(0,h); ax.axis('off'); return fig,ax
def box(ax,x,y,w,h,s,fc=WAT,fs=8,bold=True,ls='-',r=1.2):
    ax.add_patch(patches.FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={r}',fc=fc,ec=BLK,lw=1.2,ls=ls,zorder=3))
    ax.text(x+w/2,y+h/2,s,ha='center',va='center',fontsize=fs,fontweight='bold' if bold else 'normal',color=BLK,zorder=5,linespacing=1.15)
def arrow(ax,p,q,ls='-',c=BLK,lw=1.3,style='-|>'):
    ax.add_patch(patches.FancyArrowPatch(p,q,arrowstyle=style,mutation_scale=9,lw=lw,color=c,ls=ls,zorder=6,shrinkA=0,shrinkB=0))
def lab(ax,x,y,s,fs=7,c=BLK,ha='center',st='italic'): ax.text(x,y,s,fontsize=fs,color=c,ha=ha,va='center',style=st,zorder=7)
def title(ax,x,y,s): ax.text(x,y,s,fontsize=8.5,fontweight='bold',color=RED,ha='left',va='center')

# ---------------- P4 Fig 1: the workbench
fig,ax=canvas(160,100,(9,5.6))
ax.add_patch(patches.FancyBboxPatch((1,1),158,98,boxstyle='round,pad=0,rounding_size=1.5',fc='none',ec='#888888',lw=1,ls='--'))
ax.text(80,95,'Daisy workbench (SWAFL 1.1.0)',ha='center',fontsize=10,fontweight='bold',color=BLK)
cols=[('Input data',WAT,['Weather and site','Parameter library\n(soils, crops, fertilisers)']),
      ('Experiments and\nscenarios',GRN,['17 prepared experiments\n(compact designs)','Own factorial designs\n(53 factors)','5 scenarios + AI plan']),
      ('Process structure',BEI,['Process map\n(14 processes,\n76 components)']),
      ('Results and analysis',OCH,['Log plots','Mass balance','Run comparison']),
      ('Decision support',HEX,['To the SWAFL layers\n(chem, dsum, ...)']),
      ('Model development',LG,['Set-up editor (.dai)','Soil column (Richards)','Response curves','Calibration\n(3 optimisers)'])]
x=3
for name,c,items in cols:
    box(ax,x,76,24,12,name,fc=c,fs=7.2)
    for k,it in enumerate(items):
        box(ax,x,64-k*14,24,11.5,it,fc='white',fs=6.2,bold=False); 

    x+=26
box(ax,3,6,154,12,'Daisy 7.1.14 (bundled, Windows)  -  runs the set-ups; its logs (.dlf) are read back by the workbench',fc='#EEEEEE',fs=7.5)
arrow(ax,(80,18),(80,26),style='<|-|>')
lab(ax,98,22,'set-up files (.dai) down, logs (.dlf) up',fs=6.8)
fig.savefig(FG+'p4/fig01_workbench.pdf'); fig.savefig(FG+'p4/fig01_workbench.png',dpi=200); plt.close(fig)

# ---------------- P5 Fig 1: the bridge
fig,ax=canvas(170,92,(9.5,5.2))
title(ax,2,88,'From a Daisy run to a decision in the SWAFL layers')
box(ax,2,60,24,16,'Workbench\nscenario or\nexperiment',fc=GRN,fs=7.5)
box(ax,32,60,24,16,'Daisy 7.1.14\n(.dai set-up,\nweather, soil)',fc=BEI,fs=7.5)
box(ax,62,60,24,16,'Logs (.dlf)\nAnnual-Harvest,\n-FWater, -FN,\n-Tracer',fc=WAT,fs=7)
box(ax,92,60,24,16,'DaisyIO\nparser',fc=HEX,fs=7.5)
box(ax,122,60,24,16,'DaisySum\nsummarise()',fc=HEX,fs=7.5)
box(ax,148,60,20,16,'DAISYLIVE\n(in engine)',fc=OCH,fs=7.5)
for a in [26,56,86,116,146]: arrow(ax,(a,68),(a+6,68))
box(ax,92,30,36,16,'SOILMAP\nDaisy soil -> SWAFL soil\n(S03..S10)',fc=LG,fs=7)
box(ax,134,30,34,16,'MATCH\nquestion -> layer',fc=LG,fs=7.5)
arrow(ax,(158,60),(158,46)); arrow(ax,(110,60),(110,46),ls='--')
box(ax,2,2,32,16,'dsum\nDaisy decision table',fc=WAT,fs=7.5); box(ax,38,2,32,16,'chem\nFate of a chemical',fc=WAT,fs=7.5)
box(ax,74,2,32,16,'nb, yby, wb2\n(bundled runs side\nby side)',fc=WAT,fs=7); box(ax,110,2,28,16,'v7, v2\n(soil of the run)',fc=WAT,fs=7.5)
box(ax,142,2,26,16,'Decision:\ntrigger, N rate,\nirrigate or not',fc=GRN,fs=7)
for xx in [18,54,90,124]: arrow(ax,(xx,32 if xx>100 else 30),(xx,18))
ax.plot([18,124],[30,30],color=BLK,lw=1.2,zorder=2); ax.plot([158,158],[30,30])
arrow(ax,(134,38),(124,30)); lab(ax,66,44,'live results replace the bundled runs\nwhen a run exists; otherwise the layer says\n"no Daisy run yet"',fs=6.8,ha='center')
box(ax,2,36,36,12,'Weather of the SWAFL project\n(benchmark, file, online)',fc='white',fs=6.5,bold=False,ls='--')
arrow(ax,(14,48),(14,60),ls='--',c=RED); lab(ax,24,53,'return path',c=RED,fs=6.5,ha='left')
fig.savefig(FG+'p5/fig01_bridge.pdf'); fig.savefig(FG+'p5/fig01_bridge.png',dpi=200); plt.close(fig)

# ---------------- P6 Fig 1: the system
fig,ax=canvas(170,110,(9.5,6.1))
title(ax,2,106,'SWAFL Desktop 1.1.0')
box(ax,2,84,166,16,'Field and site:  sketch tool  -  satellite indices (Sentinel-2)  -  image analysis  -  water sources (OSM)  -  terrain (Copernicus DEM)  -  soil (SoilGrids)  -  zones and variable-rate maps',fc=LG,fs=6.8)
box(ax,2,50,40,28,'Irrigation design\nsurface, drip,\nsprinkler;\nschedule and\nwhen to irrigate',fc=WAT,fs=7)
box(ax,46,50,40,28,'Decision layers (22)\ntrigger and sensor,\nmulch, soil structure,\nwater balance, seasons,\nfeedback loops',fc=WAT,fs=7)
box(ax,90,50,36,28,'Deterministic\nphenotyping\n(plant, roots, drought\noutlook)',fc=GRN,fs=7)
box(ax,130,50,38,28,'Crop library\n48 crops\n(Kc curves, roots,\ndepletion, Ky)',fc=BEI,fs=7)
box(ax,2,22,82,22,'Engines:  Engine 1 (annual meta-model of 10,190 Daisy runs)\n          Engine 2 (daily 40-layer water balance)\n          closed-form surface, drip, sprinkler modules',fc=HEX,fs=6.8)
box(ax,88,22,80,22,'Daisy workbench:  17 experiments, process map, soil column,\ncalibration, runs read back as decisions (dsum, chem)',fc=OCH,fs=6.8)
box(ax,2,2,166,14,'Outputs:  field report (PDF)  -  CSV and pictures  -  .swafl projects  -  prescription maps (GeoJSON, CSV)  -  online weather, any date 1980 to 2100',fc='#EEEEEE',fs=6.8)
for xx in [22,66,108,149]: arrow(ax,(xx,84),(xx,78),style='<|-|>')
for xx in [22,66,108,149]: arrow(ax,(xx,50),(xx,44),style='<|-|>')
fig.savefig(FG+'p6/fig01_system.pdf'); fig.savefig(FG+'p6/fig01_system.png',dpi=200); plt.close(fig)
print('ok')
