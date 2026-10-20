import json,os,sys,glob
sys.path.insert(0,'/tmp/atlas')
import numpy as np
from PIL import Image
import annot,spec_full as S
M=glob.glob('/home/claude/coupled*/Software/SWAFL_Desktop/docs/manual')[0]
OUT=M+'/images/full'; os.makedirs(OUT,exist_ok=True)
for f in glob.glob(OUT+'/*'): os.remove(f)
meta=json.load(open('/tmp/atlas/full2/meta.json'))
exec(open('/tmp/atlas/desc_full.py').read())   # DESC, ORDER, PIECES
NAMES={'field':'Field balance','spac':'Soil, plant and air (S1)','v2':'Profile evolution (V2)','v1':'Sensor and trigger (V1)','n1':'Trigger law (N1)','v3':'Tillage and structure (V3)','v7':'Soil hydraulic drivers (V7)','r1':'Root structure (R1)','v4':'Mulch against bare soil (V4)','v6':'Mulch control (V6)','e1':'Evaporation physics (E1)','n2':'Fate of saved water (N2)','n3':'Regime map (N3)','v5':'Feedback loops (V5)'}
def load(p): return Image.open(p).convert('RGB')
def save(im,name,w=1100):
    im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS); im.save(f'{OUT}/{name}.jpg',quality=76,optimize=True)
def piece_img(sc,im,i):
    cuts=S.CUT[sc]; y0,y1=cuts[i],cuts[i+1]
    lo=y0 if i==0 else y0+40; hi=y1 if i==len(cuts)-2 else y1-40
    ms=[(x,y-y0,t) for x,y,t in S.F[sc] if lo<=y<hi]
    crop=im.crop((0,y0,im.width,min(y1,im.height)))
    return annot.annotate(crop,[(x,y) for x,y,t in ms],R=26,letters=(sc in S.LET)),[t for x,y,t in ms]
def changed(a,b,y0,y1):
    A=np.asarray(a.crop((0,y0,a.width,min(y1,a.height,b.height)))).astype(int); B=np.asarray(b.crop((0,y0,b.width,min(y1,a.height,b.height)))).astype(int)
    if A.shape!=B.shape: return 1.0
    return float((np.abs(A-B).max(axis=2)>28).mean())
def lab(sc,i): return (chr(65+i) if sc in S.LET else str(i+1))
out={}
for sc in ORDER:
    md=[]
    n=len(S.CUT[sc])-1
    base=load(f'/tmp/atlas/full2/{sc}_0.png')
    md.append(f"\n### The whole layer, part by part\n")
    md.append(f"The picture below is the complete drawing of the layer {NAMES[sc]}, which in the workbench is scrolled inside the drawing area; here it is shown from top to bottom in {n} part{'s' if n>1 else ''}, with the playback bar at its start. Each numbered arrow ends on the item that its entry names.\n")
    for i in range(n):
        o,leg=piece_img(sc,base,i)
        nm=f'{sc}_s0_p{i+1}'; save(o,nm)
        md.append(f"![{NAMES[sc]}, part {i+1} of {n}.](images/full/{nm}.jpg){{width=78%}}\n")
        md.append("\n**What the arrows point to.**\n\n"+"\n".join(f"- **{lab(sc,j)}** {t}" for j,t in enumerate(leg))+"\n")
    # playback states
    st=meta[sc]
    names={1:'a third of the way',2:'two thirds of the way',3:'the end'}
    blocks=[]
    for k in (1,2,3):
        im=load(f'/tmp/atlas/full2/{sc}_{k}.png')
        for i in range(n):
            y0,y1=S.CUT[sc][i],S.CUT[sc][i+1]
            if changed(base,im,y0,y1)>=0.025:
                o,_=piece_img(sc,im,i); nm=f'{sc}_s{k}_p{i+1}'; save(o,nm)
                blocks.append((k,i,nm))
    if blocks:
        md.append(f"\n### The layer through its playback\n")
        md.append(f"The playback bar runs the layer through time. The pictures below show the parts of the drawing that change, at a third of the run, at two thirds and at the end, with the same arrows and numbers as in the corresponding part above.\n")
        for k,i,nm in blocks:
            tx=st[k] if k<len(st) else ''
            md.append(f"![{NAMES[sc]}, part {i+1}, playback {names[k]} ({tx}).](images/full/{nm}.jpg){{width=70%}}\n")
    # interactive states
    ds=[(key,d) for (s,key),d in DESC.items() if s==sc]
    if ds:
        md.append(f"\n### The controls of the layer, one state at a time\n")
        md.append("Each picture below shows the layer after one control has been pressed or dragged, with the same arrows and numbers as in the corresponding part of the layer above. The caption names the control and what it does.\n")
        for key,d in ds:
            p=f'/tmp/atlas/full3/{sc}_{key}.png'
            if not os.path.exists(p): print('missing',sc,key); continue
            im=load(p); text,parts=d
            for i in parts:
                if i>=n: continue
                o,_=piece_img(sc,im,i); nm=f'{sc}_{key}_p{i+1}'; save(o,nm)
                md.append(f"![{NAMES[sc]}, part {i+1}. {text}](images/full/{nm}.jpg){{width=70%}}\n")
    out[sc]="\n".join(md)
json.dump(out,open('/tmp/atlas/full_md.json','w'))
print({k:len(v) for k,v in out.items()}, len(os.listdir(OUT)))
