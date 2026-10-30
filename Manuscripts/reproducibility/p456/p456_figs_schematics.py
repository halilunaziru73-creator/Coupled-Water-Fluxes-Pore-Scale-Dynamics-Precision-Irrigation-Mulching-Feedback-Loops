"""Schematic figures of the suite paper (architecture, workbench, bridge), drawn in the style of the Daisy process map."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from pm_style import *
import pm_style
H=os.path.dirname(os.path.abspath(__file__)); FG=H+'/../../figures/'
def save(fig,name): fig.savefig(FG+name+'.pdf'); fig.savefig(FG+name+'.png',dpi=200); plt.close(fig)

# ---- architecture of the suite
pm_style.NOFILL=True
fig,ax=canvas(200,152,(9.4,7.15))
pl=[(8,21,'Own files,\nsketch'),(31,21,'Water, roads\n(OSM)'),(62,30,'Sentinel-2\nscenes'),(103,21,'Terrain\n(Copernicus)'),(126,21,'Soil\n(SoilGrids)'),(157,30,'Weather,\nfive sources')]
for x,w,t in pl: pill(ax,x,140,w,8.5,t)
tools=[(8,'Field sketch\nand zones'),(55.5,'Vegetation indices,\nimage analysis'),(103,'Terrain, gullies,\nsoil loss, sensors'),(150.5,'Zone-by-zone irrigation,\nreport, prescriptions')]
for x,t in tools: rbox(ax,x,116,44,14,t,'green',fs=6.6,two=0.28)
for x,w,t in pl: line(ax,[(x+w/2,140),(x+w/2,130)])
rbox(ax,8,92,184,12,'One project: soil, crop, weather, mulch, irrigation and working date','blue',fs=7.6)
for x,t in tools:
    c=x+22; line(ax,[(c-4,116),(c-4,104)]); line(ax,[(c+4,104),(c+4,116)],'dot')
lay=[(8,44,'Irrigation design\nsurface, drip, sprinkler;\nschedule and when to irrigate','blue',None),(56,52,'Decision layers (22)\ntrigger and sensor, mulch, soil\nstructure, water balance,\nseasons, feedback loops','blue',None),(112,44,'Deterministic\nphenotyping\nplant, roots, drought','green',0.3),(160,32,'Crop library\n48 crops (Kc,\nroots, depletion, Ky)','green',0.3)]
for x,w,t,k,tw in lay: rbox(ax,x,62,w,19,t,k,fs=6.4,two=tw)
for x,w,t,k,tw in lay:
    c=x+w/2; line(ax,[(c-3,92),(c-3,81)]); line(ax,[(c+3,81),(c+3,92)],'dot')
horizon(ax,55); txt(ax,196,57.5,'Computing engines below',fs=5.8,ha='right')
eng=[(8,'Engine 1\nmeta-model of\n10,190 Daisy runs'),(55.5,'Engine 2\ndaily 40-layer\nwater balance'),(103,'Design modules\nsurface, drip,\nsprinkler'),(150.5,'Daisy workbench\n17 experiments,\nruns read back')]
for x,t in eng: rbox(ax,x,32,44,16,t,'brown',fs=6.4,two=0.30)
for (x,w,t,k,tw),(ex,_) in zip(lay,eng): line(ax,[(x+w/2,62),(x+w/2,52),(ex+22,52),(ex+22,48)],'dashdot',both=True)
bus=26
for ex,_ in eng: line(ax,[(ex+22,32),(ex+22,bus)],'dash',arrow=False)
ax.plot([30,172.5],[bus,bus],color=DK,lw=0.9,ls=(0,(3.5,2)),zorder=5); 
for i,(x,t) in enumerate([(8,'Field report\n(PDF)'),(40,'CSV and\npictures'),(72,'Prescription\nmaps (GeoJSON)'),(104,'.swafl\nproject')]): pass
for x,t in [(8,'Field report (PDF)'),(38,'CSV and pictures'),(68,'Prescription maps'),(98,'.swafl projects')]: pill(ax,x,10,27,7,t)
for cx in (21.5,51.5,81.5,111.5): line(ax,[(cx,bus),(cx,17)],'dash')
ax.plot([21.5,111.5],[bus,bus],color=DK,lw=0.9,ls=(0,(3.5,2)),zorder=5)
legend(ax,128,24)
hatch(ax,4,'(Not all connections between parts are shown)')
save(fig,'p6/fig01_system')

# ---- organisation of the workbench
fig,ax=canvas(200,142,(9.4,6.65))
pill(ax,8,126,27,8,'Weather and\nsite'); pill(ax,38,126,28,8,'Parameter library\n(soils, crops, fertilisers)',fs=5.4)
rbox(ax,8,100,58,20,'Input data','blue',fs=8.5); line(ax,[(21.5,126),(21.5,120)]); line(ax,[(52,126),(52,120)])
for x,w,t in [(76,24,'17 prepared\nexperiments'),(102,24,'Own factorial\ndesigns (53)'),(128,24,'5 scenarios\n+ AI plan')]: pill(ax,x,126,w,8,t,fs=5.5)
rbox(ax,76,100,76,20,'Experiments and scenarios','green',fs=8.5,two=0.25)
for cx in (88,114,140): line(ax,[(cx,126),(cx,120)])
line(ax,[(66,110),(76,110)],'thick')
rbox(ax,164,100,32,20,'Daisy 7.1.14\n(bundled, Windows)','brown',fs=7,two=0.3)
line(ax,[(152,110),(164,110)],'thick'); txt(ax,158,113.5,'.dai',fs=5.6)
rbox(ax,160,124,36,11,'Results and analysis\nlog plots, mass balance,\nrun comparison','beige',fs=5.9)
line(ax,[(180,120),(180,124)],'dash'); txt(ax,184.5,122,'.dlf',fs=5.6,ha='left')
rbox(ax,156,70,40,13,'Decision support\nto the SWAFL layers\n(chem, dsum, ...)','blue',fs=6.1)
line(ax,[(180,100),(180,83)],'dash')
rbox(ax,76,70,76,13,'Process structure','beige',fs=8); pill(ax,86,56,56,8,'Process map: 14 processes, 76 components',fs=5.6)
line(ax,[(114,70),(114,64)],'dot',arrow=False); line(ax,[(114,83),(114,100)],'dot',both=True)
horizon(ax,48); txt(ax,196,51,'Model development (outside the guided path)',fs=5.9,ha='right')
dev=[(8,'Set-up editor (.dai)'),(55.5,'Soil column (Richards)'),(103,'Response curves'),(150.5,'Calibration\n(3 optimisers)')]
for x,t in dev: rbox(ax,x,30,44,13,t,'green',fs=6.6,two=0.28)
line(ax,[(30,43),(30,100)],'dashdot',both=True)
legend(ax,8,22)
hatch(ax,3.2,'(The guided path runs from the input data to the hand-over; development tools work without Daisy)')
save(fig,'p4/fig01_workbench')

# ---- the bridge
pm_style.NOFILL=False
fig,ax=canvas(200,96,(9.4,4.5))
b=[(6,'Workbench\nscenario or\nexperiment','green'),(38,'Daisy 7.1.14\n(.dai set-up,\nweather, soil)','brown'),(70,'Logs (.dlf)\nAnnual-Harvest,\n-FWater, -FN, -Tracer','blue'),(102,'DaisyIO\nparser','green'),(134,'DaisySum\nsummarise()','green'),(166,'DAISYLIVE\n(in the engine)','brown')]
for x,t,k in b: rbox(ax,x,70,28,19,t,k,fs=6.2,two=0.28 if k!='blue' else None)
for x,t,k in b[:-1]: line(ax,[(x+28,79.5),(x+32,79.5)],'thick')
pill(ax,6,48,54,8,'Weather of the project (benchmark, file, online)',fs=5.5)
line(ax,[(33,56),(33,63),(52,63),(52,70)],'dash'); txt(ax,40,65.5,'return path',fs=5.6,ha='left')
rbox(ax,102,48,50,12,'SOILMAP\nDaisy soil to SWAFL soil (S03 to S10)','beige',fs=5.9)
rbox(ax,160,48,34,12,'MATCH\nquestion to layer','beige',fs=6.2)
line(ax,[(116,70),(116,60)],'dash'); line(ax,[(180,70),(180,60)])
txt(ax,66,52,'live results replace the bundled runs\nwhen a run exists; otherwise the layer\nsays "no Daisy run yet"',fs=5.8,ha='left')
bus=39
line(ax,[(127,48),(127,bus)],'dash',arrow=False); line(ax,[(177,48),(177,bus)],'dash',arrow=False)
ax.plot([24,177],[bus,bus],color=DK,lw=0.9,ls=(0,(3.5,2)),zorder=5); node(ax,127,bus)
outs=[(6,'dsum\nDaisy decision table'),(54,'chem\nfate of a chemical'),(102,'nb, yby, wb2\nbundled runs side by side'),(150,'v7, v2\nsoil of the run')]
for x,t in outs: pill(ax,x,22,44,9,t,fs=5.5); line(ax,[(x+22,bus),(x+22,31)],'dash')
rbox(ax,40,6,120,10,'Decision in the SWAFL layer: trigger, N rate, irrigate or not','blue',fs=7)
for x,t in outs: line(ax,[(x+22,22),(x+22,19),(100,19),(100,16)],'solid',arrow=(x==150)) if False else line(ax,[(x+22,22),(x+22,16)] if 40<=x+22<=160 else [(x+22,22),(x+22,19),(45 if x+22<40 else 155,19),(45 if x+22<40 else 155,16)])
save(fig,'p5/fig01_bridge')
print('ok')
