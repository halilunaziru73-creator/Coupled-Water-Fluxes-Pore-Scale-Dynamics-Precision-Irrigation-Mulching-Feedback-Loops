"""Figure 1 (architecture of the suite) and the workbench figure, drawn in the style of the Daisy process map.
Every arrow is a dependency found in the code of SWAFL Desktop 1.1.0 (app/js and app/engine): a module that calls a function
or reads a variable of another (for example fieldprec.js calls model(); weather.js sets WXD, which the daily model reads;
daisyflow.js writes DAISYLIVE, which plus_daisy.js reads; the workbench shell talks to the engine only through bridge.js)."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import pm_style
from pm_style import *
H=os.path.dirname(os.path.abspath(__file__)); FG=H+'/../../figures/'
def save(fig,name): fig.savefig(FG+name+'.pdf'); fig.savefig(FG+name+'.png',dpi=200); plt.close(fig)
pm_style.LW=1.5; pm_style.NOFILL=False
A=line
def dot(ax,x,y): ax.add_patch(patches.Circle((x,y),0.75,fc=DK,ec=DK,zorder=7))
def bar(ax,x,y,w,h,text,kind,fs=6.4):
    rbox(ax,x,y,w,h,'',kind,fs=fs); ax.text(x+w/2,y+h/2,text,rotation=90,ha='center',va='center',fontsize=fs,fontweight='bold',color=DK,zorder=6)

# =========================== Figure 1: the suite =================================
fig,ax=canvas(260,190,(10.2,7.46))
# inputs of the field tools
pill(ax,4,173,24,8,'Sentinel-2,\nEsri imagery',fs=5.2); pill(ax,31,173,26,8,'OpenStreetMap, SoilGrids,\nelevation tiles',fs=5.0)
FT=[('Field map, demarcation,\nSentinel-2 indices',154),('Image analysis, water\nsources, soil',138),('Terrain, flow, gullies,\nsensors, retention',122),('Monitoring zones\n(a year of scenes)',106),('Variable-rate irrigation,\nzones, field report',90)]
for t,y in FT: rbox(ax,4,y,46,12.5,t,'green',fs=5.4,two=0.2)
rbox(ax,4,68,46,12.5,'Field sketch\n(becomes design inputs)','green',fs=5.4,two=0.2)
A(ax,[(16,173),(16,166.5)])
for (t,y),(t2,y2) in zip(FT[:-1],FT[1:]): A(ax,[(27,y),(27,y2+12.5)],'thick')
A(ax,[(44,173),(44,170),(54.5,170)],arrow=False)
A(ax,[(52.5,170),(52.5,144.25),(50,144.25)]); A(ax,[(54.5,170),(54.5,128.25),(50,128.25)]); dot(ax,52.5,170); dot(ax,54.5,170)
# weather inputs (below the field tools)
pill(ax,4,46,26,9,'Weather file (CSV, XLSX,\nDWF, DLF, DAI)',fs=5.0); pill(ax,32,46,22,9,'Open-Meteo,\nDMI (online)',fs=5.0)
A(ax,[(17,55),(17,57.5),(64,57.5),(64,62)]); A(ax,[(43,55),(43,59.5),(60,59.5),(60,62)])
# project bar
bar(ax,58,62,12,100,'One project: state of the Properties panel and weather (WXD)','blue',fs=6.2)
# engines
ENG=[('Engine 1: model()\nannual meta-model, ensemble maps',140),('Engine 2: daily 40-layer\nwater balance (seasonSim)',122),('Crop water balance (CWB)\nFAO-56, crop library',104),('Per-year Daisy runs\n(20 seasons, pickRun)',86),('Phenotyping model\n(deterministic)',68)]
for t,y in ENG: rbox(ax,76,y,46,14,t,'brown',fs=5.4,two=0.2)
for t,y in ENG: A(ax,[(70,y+7),(76,y+7)])
A(ax,[(44.5,0),(44.5,0)],arrow=False) if False else None
# field tools use the engines (VRI calls model(), and the crop water balance)
A(ax,[(50,96.25),(54,96.25),(54,150)],'dashdot',arrow=False) if False else None
# layers
LAY=[('Process, mulch and regime layers\n(field, V1 to V7, E1, N1 to N3, R1)',140,14),('Design layers: surface, drip,\nsprinkler, plan, when to plant',122,14),('Seasonal layers\n(Y1, W1, N4, C1)',90,28),('Phenotyping layer P1\n(five parts)',68,14),('Daisy layers\n(C2, D1)',48,12)]
for t,y,h in LAY: rbox(ax,134,y,50,h,t,'blue',fs=5.2)
A(ax,[(122,147),(134,147)]); A(ax,[(122,129),(134,129)]); A(ax,[(122,111),(128,111),(128,106),(134,106)]); A(ax,[(122,93),(128,93),(128,98),(134,98)]); A(ax,[(122,75),(134,75)])
# cross links read in the code
A(ax,[(122,126),(126,126),(126,151),(134,151)],'dashdot'); dot(ax,126,126)       # Engine 2 profiles in the process layers
A(ax,[(122,142),(125,142),(125,133),(134,133)],'dashdot') if False else None
A(ax,[(122,108),(124,108),(124,125.5),(134,125.5)],'dashdot'); dot(ax,124,108)    # crop water balance in the design layers (plan)
A(ax,[(122,144),(130,144),(130,112),(134,112)],'dashdot'); dot(ax,130,144)         # model() in adjRun of the seasonal layers
# bridge and shell
bar(ax,190,46,12,128,'Bridge to the workbench (bridge.js)','beige',fs=6.2)
for t,y,h in LAY: A(ax,[(184,y+h/2),(190,y+h/2)],both=True)
SH=[('Properties panel,\nlayers tree, toolbox',150),('Dashboard: results,\ncharts, messages',128),('Outputs: pictures, CSV,\nreports, .swafl project',106),('Run gate\n(Run simulation)',84)]
for t,y in SH: rbox(ax,208,y,46,14,t,'beige',fs=5.4); A(ax,[(202,y+7),(208,y+7)],both=True)
A(ax,[(50,74.25),(58,74.25)])
A(ax,[(50,96.25),(58,96.25)],'dashdot',both=True)
A(ax,[(231,164),(231,172),(64,172),(64,162)],both=True)
# Daisy workbench
ax.add_patch(patches.Rectangle((4,4),250,36,fc='none',ec=DK,lw=0.9,ls=(0,(4,2)),zorder=2)); txt(ax,7,37,'Daisy workbench (js/daisy*.js)',fs=5.8,ha='left')
DW=[('Planner\n(offline reader,\nonline assistant)','green'),('Decision base,\nexperiments E0 to E16,\nscenarios','green'),('Daisy 7.1.14\n(.dai in, .dlf out)','brown'),('Parsers and\nannual summary\n(daisyio, daisysum)','green'),('Hand-over\n(daisyflow)\nDAISYLIVE','green'),('Figures, citation,\nraw files','beige')]
for i,(t_,k) in enumerate(DW): rbox(ax,8+i*41,8,36,24,t_,k,fs=5.3,two=0.2 if k=='brown' else None)
for i in range(5): A(ax,[(44+i*41,20),(49+i*41,20)])
A(ax,[(190,32),(190,42),(170,42),(170,48)]); ax.text(193,37.5,'DAISYLIVE',fontsize=5.2,style='italic',fontfamily='Liberation Serif',ha='left',va='center')
A(ax,[(108,32),(108,44),(66,44),(66,62)],'dashdot',both=True)
legend(ax,208,58,step=3.6,w=9,short=True)
hatch(ax,1.9,'(Not all connections between parts are shown)',x0=3,x1=257)
save(fig,'p6/fig01_system')

# =========================== Figure 4: the Daisy workbench =================================
fig,ax=canvas(224,146,(10.0,6.52))
pill(ax,4,129,52,10,'Weather: stations, own file,\nOpen-Meteo, DMI (daisyonline)',fs=5.2); pill(ax,60,129,52,10,'Soil horizons, crop library,\nparameters (32 tested in Daisy)',fs=5.2); pill(ax,116,129,40,10,'Your own set-up (.dai),\nset-up editor',fs=5.2)
CH=[('Planner (daisyai)\noffline reader,\nonline assistant',4,'green',None),('Decision base\n(daisyref, manual)\n54 factors, soils,\nstations',42,'beige',None),('Experiments\n(daisyexp, daisyscen)\nE0 to E16, designs,\nscenarios',80,'green',0.2),('Daisy 7.1.14\n(.dai in, .dlf out)\nbundled, Windows',118,'brown',0.2),('Parsers and annual\nsummary (daisyio,\ndaisysum)',156,'green',None)]
for t,x,k,tw in CH: rbox(ax,x,92,33,24,t,k,fs=5.2,two=tw)
for (t,x,k,tw),(t2,x2,k2,tw2) in zip(CH[1:-1],CH[2:]): A(ax,[(x+33,104),(x2,104)])
A(ax,[(37,104),(42,104)],'dot',both=True)
A(ax,[(37,98),(80,98)],arrow=False) if False else None
A(ax,[(151,104),(156,104)])
A(ax,[(37,110),(37,121),(96,121),(96,116)],'dot',arrow=False) if False else None
A(ax,[(37,92),(37,88),(96,88),(96,92)]) if False else None
# the plan goes to the experiments
A(ax,[(20.5,92),(20.5,87),(88,87),(88,92)],'dash') if False else None
A(ax,[(30,129),(30,123),(90,123),(90,116)]); A(ax,[(86,129),(86,116)]); A(ax,[(98,129),(98,123),(90,123)],arrow=False)
A(ax,[(136,129),(136,116)])
A(ax,[(30,123),(30,116)]) if False else None
# hand-over
rbox(ax,190,92,30,24,'Hand-over\n(daisyflow)\nDAISYLIVE','green',fs=5.3); A(ax,[(189,104),(190,104)])
rbox(ax,190,60,30,22,'SWAFL layers C2, D1,\ndashboard','blue',fs=5.3); A(ax,[(205,92),(205,82)]); ax.text(208,87,'DAISYLIVE',fontsize=5.2,style='italic',fontfamily='Liberation Serif',va='center')
# results row
rbox(ax,42,60,33,22,'Process map (daisyproc)\n14 processes,\n76 components','green',fs=5.2)
rbox(ax,80,60,33,22,'Figures of the\nexperiments\n(daisyexpfig, spec)','green',fs=5.2)
rbox(ax,118,60,33,22,'Raw files as Daisy\nwrote them\n(daisyraw)','beige',fs=5.2)
rbox(ax,156,60,33,22,'Figures, tables, citation\n(daisyfig, daisyplot,\ndaisyfigkit, daisycite)','green',fs=5.2)
A(ax,[(96,92),(96,82)],'dash'); A(ax,[(134,92),(134,82)],'dash'); A(ax,[(172,92),(172,82)])
A(ax,[(172,92),(185,92),(185,87),(190,87)],arrow=False) if False else None
A(ax,[(58,60),(58,54),(172,54),(172,60)]); A(ax,[(113,71),(118,71)],'dot',arrow=False)
A(ax,[(151,71),(156,71)],'dot',arrow=False) if False else None
A(ax,[(96,60),(96,54)],arrow=False)
# the figures also come back to the experiments tab
A(ax,[(78,92),(78,87),(58,87),(58,82)],'dot',arrow=False) if False else None
horizon(ax,46); txt(ax,220,49,'Model development (work before Daisy is started)',fs=5.6,ha='right')
for x,t in [(4,'Soil column\n(Richards, Daisy\nhorizon library)'),(60,'Response curves\n(retention, denitrification,\nPLF functions)'),(116,'Calibration\n(sequential, CMA-ES,\nBayesian)'),(172,'Parameter library\n(daisyparams, 32 tested)')]:
    rbox(ax,x,16,48,20,t,'green',fs=5.3,two=0.2)
A(ax,[(140,38),(140,44),(112,44)],arrow=False) if False else None
legend(ax,160,141,step=3.3,w=9)
A(ax,[(39.5,36),(39.5,125),(66,125),(66,129)],'dot',both=True)
A(ax,[(196,36),(196,46),(214,46),(214,134),(156,134)],'dot',both=True) if False else None
hatch(ax,2.8,'(Not all connections between parts are shown)',x0=3,x1=221)
save(fig,'p4/fig01_workbench')
print('ok')
