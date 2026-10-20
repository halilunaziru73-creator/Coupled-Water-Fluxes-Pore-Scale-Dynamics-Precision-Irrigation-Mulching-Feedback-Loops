import json,re,glob,os,sys
M=os.path.expanduser('/home/claude/coupled-water-fluxes-pore-scale-dynamics-precision-irrigation-mulching-feedback-loops/Software/SWAFL_Desktop/docs/manual')
eqs=json.load(open('/tmp/atlas/eqs.json'))
sys.path.insert(0,'/tmp/atlas')
import spec_atlas as SP
meta=json.load(open('/tmp/atlas/meta2.json') if os.path.exists('/tmp/atlas/meta2.json') else open('/tmp/atlas/meta.json'))
key=lambda x:[int(a) for a in x.split('.')]
txt={f:open(f'{M}/{f}').read() for f in map(os.path.basename,glob.glob(M+'/[0-9]*.md'))}
def section_text(f,h2):
    s=txt[f]; m=re.search(r'^## '+re.escape(h2)+r'.*$',s,re.M)
    if not m: raise SystemExit('no h2 '+h2+' in '+f)
    n=re.search(r'^## ',s[m.end():],re.M)
    return s[m.start():m.end()+(n.start() if n else len(s))]
def expand(t):
    out=set()
    for m in re.finditer(r'(?<![\d.])(\d{1,2})\.(\d{1,2})(?:\s*(?:--|–|-)\s*(?:(\d{1,2})\.)?(\d{1,2}))?(?![\d])',t):
        a,b,c,d=m.groups()
        lo=int(b); hi=int(d) if d else lo
        if c and int(c)!=int(a): continue
        for k in range(lo,hi+1):
            kk=f'{a}.{k}'
            if kk in eqs: out.add(kk)
    return out
def eqs_for(f,h2s,extra=()):
    s=set(extra)
    for h in h2s:
        t=section_text(f,h)
        defined={k for k,v in eqs.items() if v['file']==f and v['h2']==h}
        # referenced: only in sentences mentioning Eq / (n.m)
        refs=set()
        for m in re.finditer(r'(Eqs?\.?\s*\(?[\d.,\s–\-and()]+|\(\d{1,2}\.\d{1,2}\)|Eqs?\.\s*\d[\d.]*(?:\s*(?:--|–)\s*\d[\d.]*)?)',t):
            refs|=expand(m.group(0))
        s|=defined|refs
    return sorted(s,key=key)
# scene mapping: (file,[h2],extra)
S={}
S['field']=('07_field.md',['Field balance (the home layer)'],[f'5.{i}' for i in range(13,26)])
S['spac']=('07_field.md',['Soil, plant and air (S1)'],[])
S['v2']=('07_field.md',['Profile evolution (V2)'],['5.17'])
S['v1']=('06_control.md',['Sensor and trigger (V1)'],[])
S['n1']=('06_control.md',['Trigger law (N1)'],[])
S['v3']=('08_structure.md',['Tillage and structure (V3)'],[])
S['v7']=('08_structure.md',['Soil hydraulic drivers (V7)'],[])
S['r1']=('08_structure.md',['Root structure (R1)'],[])
S['v4']=('09_mulch.md',['Mulch against bare soil (V4)'],[])
S['v6']=('09_mulch.md',['Mulch control (V6)'],[])
S['e1']=('09_mulch.md',['Evaporation physics (E1)'],[])
S['n2']=('09_mulch.md',['Fate of saved water (N2)'],[])
S['n3']=('09_mulch.md',['Regime map (N3)'],[])
S['v5']=('10_loops.md',['How the seven effects are computed'],[])
def hs(f): return re.findall(r'^## (.*)$',txt[f],re.M)
def H(f,*starts):
    out=[]
    for st in starts:
        c=[h for h in hs(f) if h.startswith(st)]
        if not c: raise SystemExit('no h2 starting '+st+' in '+f)
        out+=c[:1]
    return out
SEC={}
f='11_surface.md'
SEC['sid']={
'':H(f,'Inputs','Intake from your soil','Inlet flow area','Advance'),
'Layout':H(f,'Inputs','Advance','Inlet flow'),
'Longitudinal':H(f,'Cut-off','Advance'),
'Hydrograph':H(f,'Hydrograph'),
'Cross-section':H(f,'Cross-section','Intake from your soil'),
'Advance and':H(f,'Advance','Cut-off'),
'Infiltrated depth':H(f,'Cut-off'),
'Performance':H(f,'Volumes'),
'Design table':H(f,'The design table','Best inflow'),
'What the efficiency':H(f,'Sensitivity'),
'What this means':H(f,'Season and farm'),
'Irrigation schedule':H(f,'Irrigation schedule'),
'Intervals':H(f,'Irrigation schedule','Season and farm')}
f='12_drip.md'
SEC['drip']={
'':H(f,'Inputs','Lateral','The wetted','Spread'),
'Soil moisture':H(f,'The wetted'),
'Uniformity':H(f,'Lateral','Spread'),
'How the wetted':H(f,'The wetted'),
'Result':H(f,'Spread'),
'Layout':H(f,'Layout'),
'Design table':H(f,'The design table'),
'What the efficiency':H(f,'Sensitivity'),
'What this means':H(f,'Season and farm'),
'Irrigation schedule':H(f,'Season and farm'),
'Intervals':H(f,'Season and farm')}
f='13_sprinkler.md'
SEC['spr']={
'':H(f,'Inputs','Nozzle','The spray','The soil intake'),
'Layout in plan':H(f,'The spray'),
'Along the lateral':H(f,'The soil intake','Efficiencies'),
'Soil intake':H(f,'The soil intake'),
'Result':H(f,'Efficiencies'),
'Does your design':H(f,'The ten'),
'Kinds':H(f,'Kinds'),
'The sprinkler':H(f,'Nozzle'),
'The jet':H(f,'Nozzle','Wind drift'),
'The water pattern':H(f,'The spray'),
'Layouts':H(f,'The spray'),
'What wind':H(f,'Wind drift','Maximum'),
'Catch-can':H(f,'The spray'),
'Soil water as':H(f,'Efficiencies','Season'),
'Pipes':H(f,'Layout'),
'Layout and infra':H(f,'Layout'),
'Design table':H(f,'The design table'),
'What the efficiency':H(f,'The design table'),
'What this means':H(f,'Season'),
'Irrigation schedule':H(f,'Season'),
'Intervals':H(f,'Season')}
FN={'sid':'11_surface.md','drip':'12_drip.md','spr':'13_sprinkler.md'}
NAME={'field':'Field balance','sid':'S2 Surface irrigation design','drip':'S3 Drip irrigation design','spr':'S4 Sprinkler design and pipes'}
def pick(sc,sec):
    if sc in S:
        f,h,e=S[sc]; return eqs_for(f,h,e)
    d=SEC[sc]
    k=''
    if sec:
        for kk in d:
            if kk and sec.lower().startswith(kk.lower()): k=kk;break
        else: k=''
    return eqs_for(FN[sc],d[k])
def chapter(k):
    return {'04':'Dates','05':'The two computing engines','06':'Irrigation control layers','07':'Field water balance layers','08':'Soil structure and tillage layers','09':'Mulch and evaporation layers','10':'Feedback loops','11':'Surface irrigation design','12':'Drip irrigation design','13':'Sprinkler design','14':'The Dashboard'}[eqs[k]['file'][:2]]
def render(k):
    e=eqs[k]
    return f"$$\n{e['body']}\n$$\n\n{e['prov']}\n" if e['prov'] else f"$$\n{e['body']}\n$$\n"
LAY={'field':'Field water balance','spac':'Field water balance','v2':'Field water balance','v1':'Irrigation control','n1':'Irrigation control','v3':'Soil structure and tillage','v7':'Soil structure and tillage','r1':'Soil structure and tillage','v4':'Mulch and evaporation','v6':'Mulch and evaporation','e1':'Mulch and evaporation','n2':'Mulch and evaporation','n3':'Mulch and evaporation','v5':'Feedback loops','sid':'Irrigation design','drip':'Irrigation design','spr':'Irrigation design'}
TITLE={'field':'Field balance','spac':'Soil, plant and air (S1)','v2':'Profile evolution (V2)','v1':'Sensor and trigger (V1)','n1':'Trigger law (N1)','v3':'Tillage and structure (V3)','v7':'Soil hydraulic drivers (V7)','r1':'Root structure (R1)','v4':'Mulch against bare soil (V4)','v6':'Mulch control (V6)','e1':'Evaporation physics (E1)','n2':'Fate of saved water (N2)','n3':'Regime map (N3)','v5':'Feedback loops (V5)'}

def legend_ui(name):
    L=SP.U.get(name)
    if not L: return ''
    o="\n**What the arrows point to.**\n\n"
    for i,it in enumerate(L):
        lab,t=(it if isinstance(it,tuple) else (None,it))
        if lab is None: lab=str(i+1) if name not in ('u01_workbench',) else chr(65+i)
        o+=f"- **{lab}** {t}\n"
    return o+"\n"
def legend_sc(name):
    L=SP.D.get(name,[])
    o="\n**What the arrows point to.** The dashed outlines in the whole-workbench picture mark the layer chosen in the Layers panel (**L**), the drawing (**D**), the Dashboard (**R**) and the controls in Properties (**C**). In the drawing, each numbered arrow ends on the item it names.\n\n"
    for i,(x,y,t) in enumerate(L):
        lab=chr(65+i) if name in SP.LETTERS else str(i+1)
        o+=f"- **{lab}** {t}\n"
    return o+"\n"
def W(n):
    if n.startswith(('u00','u01','u03','u07','u08')): return '100%'
    if 'menu' in n: return '75%'
    if n.startswith('u05') or n=='u04_toolbox': return '42%'
    return '60%'
UI=[('u00_welcome','The welcome dialog','Shown on first start; it carries no equations.',[]),
('u01_workbench','The workbench','Layers (left), drawing area (centre), Dashboard (below and right of the drawing) and Properties (right). The date shown in the toolbar sets the whole workbench to that day.',['4.1','4.2']),
]
for t in ['file','edit','view','tools','refresh','review','run','help']:
    UI.append((f'u02_menu_{t}',f'The {t.capitalize()} menu','Menu commands. Every command is described in the chapter "The window: a guided tour", section "Menu bar reference"; the commands that run the engines are those of the Run and Refresh menus.',[]))
UI+=[('u03_palette','The command palette (Ctrl+K)','Searches every layer, control and tool by name.',[]),
('u04_toolbox','The Processing Toolbox','Simulation, ready-made cases, irrigation design, compare and review, export.',[]),
('u07_toolbar','The toolbar','Run, restart, 20-year run, refresh, baseline, picture, focus, search and the Date control (Eqs. 4.1, 4.2).',['4.1','4.2']),
('u08_statusbar','The status bar','The current layer, date, soil, tillage, mulch and irrigation method.',[]),
('u05_dash_results','The Dashboard, Results tab','Working day, next 14 days, whole year and 20-year averages.',eqs_for('14_dashboard.md',['Results'])),
('u05_dash_design','The Dashboard, Design tab','Results of the open design layer.',eqs_for('14_dashboard.md',['Design'])),
('u05_dash_charts','The Dashboard, Charts tab','Yearly charts and the pinned baseline.',eqs_for('14_dashboard.md',['Charts'])),
('u05_dash_messages','The Dashboard, Messages tab','Plain-language messages.',eqs_for('14_dashboard.md',['Messages'])),
('u06_properties','The Properties panel','Every control; the equations are those that the controls move.',eqs_for('03_controls.md',[h for h in hs('03_controls.md')]))]
index={}
FULL=json.load(open('/tmp/atlas/full_md.json')) if os.path.exists('/tmp/atlas/full_md.json') else {}
out=[]
out.append("""# Screenshot atlas: every screen with its governing equations

This part of the manual shows every screen of the workbench, one after another, each accompanied by the equations that produce what it displays. The screenshots were taken from the SWAFL workbench itself (the window in `app/index.html`) with the default settings (Coarse Loam, conventional tillage, cereal/oilseed rotation, wheat-straw mulch of strength 1.0, Surface irrigation, typical year). For each screen the first picture is the whole workbench and the second is the drawing area at higher magnification. For the fourteen single layers, whose drawing is longer than the drawing area and is scrolled inside it, the pictures of the whole drawing from top to bottom follow, together with its playback states and with one picture for each control that changes the drawing (every mulch material, every zoom and view of the soil section, every irrigation layout, every day button, and so on). Every picture carries numbered arrows, each ending on the item that its legend entry names. Below the pictures every equation that the screen draws on is printed in full, with its number, the chapter that explains it and its provenance label, so that no number on a screen is without its equation. A reverse index at the end lists, for each of the 134 numbered equations, the screens that use it.

Equation numbers are those of the chapters (for example Eq. 5.4 is the fourth equation of the chapter on the engines). The symbols are defined where the equation first appears; the *Where explained* line gives that place.
""")
out.append("\n## The window and its controls\n")
for name,title,desc,ks in UI:
    if not os.path.exists(f'/tmp/atlas/img/{name}.jpg'): continue
    for k in ks: index.setdefault(k,[]).append(title)
    if name=='u06_properties':
        out.append(f"\n### {title}\n\n{desc}\n\n"+" ".join(f"![{title}, part {i+1} of 3.](images/atlas/u06_properties_{i+1}.jpg){{width=31%}}" for i in range(3))+"\n")
        out.append(legend_ui(name))
    elif name=='u04_toolbox':
        out.append(f"\n### {title}\n\n{desc}\n\n![{title}.](images/atlas/u04_toolbox_page.jpg){{width=48%}}\n"); out.append(legend_ui(name))
    else:
        out.append(f"\n### {title}\n\n{desc}\n\n![{title}.](images/atlas/{name}.jpg){{width={W(name)}}}\n"); out.append(legend_ui(name))
    if ks:
        out.append("**Equations behind this screen.** "+", ".join("Eq. "+k for k in ks)+".\n")
        for k in ks:
            e=eqs[k]; out.append(f"\n*Eq. {k}. Where explained: chapter \"{chapter(k)}\", section \"{e['h3'] or e['h2']}\".*\n\n"+render(k))
    out.append("\n\\newpage\n")
prev=None
for m in meta:
    sc,sec,lbl,name=m['scene'],m['sec'],m['label'],m['name']
    lay=LAY.get(sc)
    if sc in ('sid','drip','spr'):
        if prev!=sc: out.append(f"\n## {NAME[sc]}\n"); 
        title = (lbl if sec else 'The whole layer: inputs and overview')
        if sec: title=sec
    else:
        out.append(f"\n## {TITLE[sc]}\n"); title='The screen'
    prev=sc
    ks=pick(sc,sec)
    for k in ks: index.setdefault(k,[]).append(f"{TITLE.get(sc,NAME.get(sc))}" + (f" / {lbl}" if sec else ''))
    if sc in ('sid','drip','spr'): out.append(f"\n### {title}\n")
    out.append(f"![{(TITLE.get(sc) or NAME[sc])}{(' / '+lbl) if sec else ''}: the whole workbench.](images/atlas/{name}_full.jpg){{width=100%}}\n")
    out.append(f"![{(TITLE.get(sc) or NAME[sc])}{(' / '+lbl) if sec else ''}: the drawing area.](images/atlas/{name}_draw.jpg){{width=70%}}\n")
    out.append(legend_sc(name))
    out.append("**Equations behind this screen.** "+(", ".join("Eq. "+k for k in ks) if ks else "none (the screen shows stored results)")+".\n")
    for k in ks:
        e=eqs[k]
        out.append(f"\n*Eq. {k}. Where explained: chapter \"{chapter(k)}\", section \"{e['h3'] or e['h2']}\".*\n\n"+render(k))
    if sc in FULL: out.append(FULL[sc])
    out.append("\n\\newpage\n")
# reverse index
out.append("\n## Reverse index: where each equation appears on screen\n")
out.append("| Equation | Explained in chapter | Screens that use it |\n|:--|:--|:----------|\n")
for k in sorted(eqs,key=key):
    sc=sorted(set(index.get(k,[])))
    out.append(f"| {k} | {chapter(k)} | {'; '.join(sc) if sc else 'defined in the text; used by the screens through the equations above'} |\n")
open('/tmp/atlas/19_atlas.md','w').write("\n".join(out))
json.dump({k:v for k,v in index.items()},open('/tmp/atlas/index.json','w'),indent=1)
print(len(index),'equations used of',len(eqs),'; missing',sorted(set(eqs)-set(index),key=key))
