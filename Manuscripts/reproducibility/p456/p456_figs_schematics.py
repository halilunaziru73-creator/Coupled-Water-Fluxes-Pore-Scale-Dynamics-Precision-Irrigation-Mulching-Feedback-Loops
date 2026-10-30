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


# ---- process-map style (as the Daisy process map): serif, pastel blue/green/beige/brown, thin lines, legend
SER='Liberation Serif'
DB='#BFD3EA'; DBE='#4A6FA5'; DG='#BEE3A0'; DGE='#5E8F3A'; DBG='#E3DAC3'; DBGE='#8C7F5A'; DBR='#C98A1E'; DBRE='#7A5210'; DK='#222222'
def pbox(ax,x,y,w,h,s,fc=DB,ec=DBE,fs=7,bold=True,two=None,ls='-'):
    ax.add_patch(patches.Rectangle((x,y),w,h,fc=fc,ec=ec,lw=0.9,ls=ls,zorder=3))
    if two: ax.add_patch(patches.Rectangle((x,y),w/2,h,fc=two,ec='none',zorder=3.5)); ax.add_patch(patches.Rectangle((x,y),w,h,fc='none',ec=ec,lw=0.9,zorder=3.6))
    ax.text(x+w/2,y+h/2,s,ha='center',va='center',fontsize=fs,fontfamily=SER,fontweight='bold' if bold else 'normal',color=DK,zorder=6,linespacing=1.12)
def hbox(ax,x,y,w,h,head,body,fs=6.6,hh=5.2):
    ax.add_patch(patches.Rectangle((x,y),w,h,fc='#EBD3A1',ec=DBRE,lw=0.9,zorder=3))
    ax.add_patch(patches.Rectangle((x,y+h-hh),w,hh,fc=DBR,ec=DBRE,lw=0.9,zorder=3.5))
    ax.text(x+w/2,y+h-hh/2,head,ha='center',va='center',fontsize=fs+0.4,fontfamily=SER,fontweight='bold',color=DK,zorder=6)
    ax.text(x+w/2,y+(h-hh)/2,body,ha='center',va='center',fontsize=fs-0.2,fontfamily=SER,color=DK,zorder=6,linespacing=1.15)
def parrow(ax,p,q,kind='solid',both=False):
    ls={'solid':'-','dash':(0,(4,2)),'dot':(0,(1,2))}[kind]
    ax.add_patch(patches.FancyArrowPatch(p,q,arrowstyle='<|-|>' if both else '-|>',mutation_scale=7,lw=0.8,color=DK,ls=ls,zorder=5,shrinkA=0,shrinkB=0))
def ptext(ax,x,y,s,fs=6.6,ha='center',st='italic',c=DK): ax.text(x,y,s,fontsize=fs,fontfamily=SER,color=c,ha=ha,va='center',style=st,zorder=7)
def legend(ax,x,y):
    items=[('solid','Data and results'),('dash','Outputs'),('dot','Information exchange')]
    for k,(kd,t) in enumerate(items):
        yy=y-k*4.6
        ax.plot([x,x+12],[yy,yy],color=DK,lw=0.8,ls={'solid':'-','dash':(0,(4,2)),'dot':(0,(1,2))}[kd],zorder=5)
        ptext(ax,x+14,yy,t,fs=6.2,ha='left',st='normal')
def frame(ax,w,h):
    ax.add_patch(patches.Rectangle((1,1),w-2,h-2,fc='white',ec='#B9B9B9',lw=0.8,zorder=0))

# ---------------- P4 Fig 1: the workbench (process-map style)
fig,ax=canvas(200,124,(9.4,5.8)); frame(ax,200,124)
ptext(ax,6,119,'Organisation of the Daisy workbench',fs=8.5,ha='left',st='normal'); 
# model development below the dotted line
ax.plot([3,197],[34,34],color='#666666',lw=0.8,ls=(0,(1,2)),zorder=2); ptext(ax,6,36.5,'Model development (works before Daisy is started)',fs=6.4,ha='left')
for i,t in enumerate(['Set-up editor\n(.dai)','Soil column\n(Richards)','Response curves','Calibration\n(3 optimisers)']):
    pbox(ax,8+i*31,14,28,14,t,fc=DG,ec=DGE,fs=6.4)
# process structure (top left)
pbox(ax,8,92,50,16,'Process structure\nprocess map: 14 processes,\n76 components',fc=DG,ec=DGE,fs=6.8)
# input data
pbox(ax,8,56,50,26,'Input data\nweather and site\nparameter library (soils,\ncrops, fertilisers)',fc=DB,ec=DBE,fs=6.8)
# experiments
pbox(ax,70,56,52,36,'Experiments and scenarios\n17 prepared experiments\n(compact designs)\nown factorial designs\n(53 factors)\n5 scenarios + AI plan',fc=DG,ec=DGE,fs=6.8)
# daisy
hbox(ax,134,56,60,36,'Daisy 7.1.14','bundled for Windows\nruns the set-ups\nwrites the logs',fs=7.2,hh=7)
# results and decision
pbox(ax,134,98,60,14,'Results and analysis\nlog plots, mass balance,\nrun comparison',fc=DBG,ec=DBGE,fs=6.8)
pbox(ax,134,38,60,12,'Decision support\nto the SWAFL layers (chem, dsum, ...)',fc=DB,ec=DBE,fs=6.6)
parrow(ax,(58,69),(70,69)); parrow(ax,(122,74),(134,74)); ptext(ax,128,78,'.dai',fs=6)
parrow(ax,(164,92),(164,98)); ptext(ax,172,95,'.dlf',fs=6)
parrow(ax,(164,56),(164,50),'dash'); parrow(ax,(33,92),(33,82),'dot',both=True)
parrow(ax,(96,28),(96,56),'dot',both=True); 
ptext(ax,70,100,'set-up files (.dai) go to Daisy, logs (.dlf) are read back',fs=6.4,ha='left')
legend(ax,136,26)
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

# ---------------- P6 Fig 1: the system (process-map style)
fig,ax=canvas(200,150,(9.4,7.0)); frame(ax,200,150)
ptext(ax,6,145,'Architecture of SWAFL Desktop',fs=8.5,ha='left',st='normal')
# inputs (dashed frame)
ax.add_patch(patches.Rectangle((5,114),190,26,fc='none',ec=DK,lw=0.8,ls=(0,(4,2)),zorder=2)); ptext(ax,8,137,'Open data and the user\'s own data',fs=6.4,ha='left')
ins=['Field outline\n(sketch tool)','Satellite scenes\n(Sentinel-2)','Water sources\nand roads (OSM)','Terrain\n(Copernicus DEM)','Soil\n(SoilGrids)','Weather: five sources,\nany date 1980 to 2100']
for i,t in enumerate(ins): pbox(ax,8+i*31.3,117,29,15,t,fc=DBG,ec=DBGE,fs=6.2)
# tools of the real field
tools=['Field sketch\nand zones','Vegetation indices\nand image analysis','Terrain, gullies,\nsoil loss, sensors','Zone-by-zone irrigation,\nreport, prescriptions']
for i,t in enumerate(tools): pbox(ax,8+i*47.5,91,44,15,t,fc=DG,ec=DGE,fs=6.6)
ptext(ax,8,109.5,'Tools of the real field',fs=6.4,ha='left')
for i in range(4): parrow(ax,(30+i*47.5,117),(30+i*47.5,106))
# project
pbox(ax,8,72,184,11,'One project: soil, crop, weather, mulch, irrigation and working date, shared by every layer',fc=DBG,ec=DBGE,fs=7)
for i in range(4): parrow(ax,(30+i*47.5,91),(30+i*47.5,83),both=True)
# layers
pbox(ax,8,40,44,25,'Irrigation design\nsurface, drip, sprinkler;\nschedule and when\nto irrigate',fc=DB,ec=DBE,fs=6.6)
pbox(ax,56,40,50,25,'Decision layers (22)\ntrigger and sensor, mulch,\nsoil structure, water balance,\nseasons, feedback loops',fc=DB,ec=DBE,fs=6.6)
pbox(ax,110,40,44,25,'Deterministic phenotyping\nplant, roots, drought\noutlook',fc=DG,ec=DGE,fs=6.6)
pbox(ax,158,40,34,25,'Crop library\n48 crops (Kc curves,\nroots, depletion, Ky)',fc=DG,ec=DGE,fs=6.4)
for x in (30,81,132,175): parrow(ax,(x,72),(x,65),both=True)
# engines
hbox(ax,8,12,56,20,'Engine 1','annual meta-model of\n10,190 Daisy runs',fs=6.6)
hbox(ax,68,12,56,20,'Engine 2 and design modules','daily 40-layer water balance;\nclosed-form surface, drip,\nsprinkler modules',fs=6.4)
hbox(ax,128,12,64,20,'Daisy workbench','17 experiments, process map, soil column,\ncalibration; runs read back as decisions',fs=6.4)
for x in (36,96,160): parrow(ax,(x,40),(x,32),'dot',both=True)
ax.plot([3,197],[8,8],color='#666666',lw=0.8,ls=(0,(1,2)),zorder=2)
ptext(ax,6,4.2,'Outputs: field report (PDF), CSV and pictures, .swafl projects, prescription maps (GeoJSON, CSV)',fs=6.2,ha='left',st='normal')
legend(ax,150,4.6+9.2) if False else None

fig.savefig(FG+'p6/fig01_system.pdf'); fig.savefig(FG+'p6/fig01_system.png',dpi=200); plt.close(fig)
print('ok')
