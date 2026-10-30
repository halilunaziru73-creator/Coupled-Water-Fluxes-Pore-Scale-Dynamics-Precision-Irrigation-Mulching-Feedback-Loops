"""Schematic figures of the suite paper (architecture, workbench, bridge), drawn in the style of the Daisy process map."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from pm_style import *
import pm_style
H=os.path.dirname(os.path.abspath(__file__)); FG=H+'/../../figures/'
def save(fig,name): fig.savefig(FG+name+'.pdf'); fig.savefig(FG+name+'.png',dpi=200); plt.close(fig)

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
