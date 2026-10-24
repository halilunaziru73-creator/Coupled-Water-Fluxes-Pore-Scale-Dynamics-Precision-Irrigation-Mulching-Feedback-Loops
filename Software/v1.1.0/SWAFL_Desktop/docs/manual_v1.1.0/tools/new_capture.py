"""Captures the version-1.1 program (port 5199) for the manual: every layer drawn in full with the positions of all its
texts, the control states of the 1.0 atlas re-made on the new interface, and the window screens with their outlines.
usage: python3 new_capture.py canvas|states|ui   -> new_raw/"""
import json, re, sys, os, math, base64
from playwright.sync_api import sync_playwright
from textjs import TEXTJS
OUT = 'new_raw'; os.makedirs(OUT, exist_ok=True)
PART = sys.argv[1]
SCENES = ['sid', 'drip', 'spr', 'field', 'spac', 'v2', 'v1', 'n1', 'v3', 'v7', 'r1', 'v4', 'v6', 'e1', 'n2', 'n3', 'v5', 'yby', 'wb2', 'nb', 'crop']
DES = ['sid', 'drip', 'spr']
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[-+−]?\d[\d.,]*', '#', s)).strip().lower()
ANN = open('cap3.py').read().split("JS='''")[1].split("'''")[0] + r'''
window.__find=function(root,text){
  const R=(typeof root==='string'?document.querySelector(root):root); if(!R) return null;
  const clean=s=>(s||'').replace(/[\u25B6\u25BC\u25B2\u25BA]/g,'').replace(/\s+/g,' ').trim();
  const els=Array.from(R.querySelectorAll('*')).filter(e=>e.offsetParent!==null&&clean(e.textContent).startsWith(text));
  if(!els.length) return null; const e=els[els.length-1]; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
};'''
meta = json.load(open(OUT + '/meta.json')) if os.path.exists(OUT + '/meta.json') else {}

def start(pw, w=1600, h=1000, dsf=1):
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dsf); pg = ctx.new_page()
    pg.goto('http://127.0.0.1:5199/index.html'); pg.wait_for_timeout(6500)
    try: pg.get_by_role('button', name='Start', exact=True).click(timeout=2500); pg.wait_for_timeout(500)
    except Exception: pass
    pg.evaluate("document.querySelectorAll('#modalRoot .ov').forEach(o=>o.remove())")
    return b, pg

def frame(pg): return [f for f in pg.frames if f != pg.main_frame][0]

def open_scene(pg, sc, run=True):
    if sc.startswith('farm_'):
        d = sc[5:]; pg.evaluate("(d)=>Layers.openFarm(d)", d); pg.wait_for_timeout(1500)
        pg.evaluate("(d)=>E.ev(\"runDesign('\"+d+\"');play.on=false\")", d); pg.wait_for_timeout(800)
        pg.evaluate("()=>E.ev(\"fclock.day=(function(){var s=seasonSim();for(var d=fclock.kd();d<ND;d++)if(s.irr[d]>0)return d+0.45;return fclock.day})();fclock.pause=0;fclock.on=false\")"); pg.wait_for_timeout(600)
        return
    pg.evaluate("(s)=>Layers.open(s)", sc); pg.wait_for_timeout(1400)
    if sc in DES and run: pg.evaluate("(s)=>E.ev(\"runDesign('\"+s+\"');play.on=false;play.t=1\")", sc); pg.wait_for_timeout(900)
    pg.evaluate("()=>E.ev(\"if(SWEEPS[currentScene.id]){if(AUTO.snap){AUTO.busy=true;applyState(AUTO.snap);AUTO.busy=false;}AUTO.on=false;AUTO.snap=null;}\")"); pg.wait_for_timeout(500)
    f = frame(pg)
    try:
        if f.evaluate("document.getElementById('playBtn').textContent.trim()") == 'Pause': f.click('#playBtn'); pg.wait_for_timeout(300)
    except Exception: pass

def grab(pg, name, extra=None):
    f = frame(pg); f.evaluate(TEXTJS)
    r = f.evaluate("""()=>{window.__REPORTING=true; try{ if(['sid','drip','spr'].indexOf(currentScene.id)>=0) play.t=1; const T=__texts(); const u=canvas.toDataURL('image/jpeg',0.9);
        const sec=(window.__SEC||{})[currentScene.id]||{}; return {T:T,u:u,sec:sec,id:currentScene.id}; } finally { window.__REPORTING=false; } }""")
    open(OUT + '/' + name + '.jpg', 'wb').write(base64.b64decode(r['u'].split(',')[1]))
    m = dict(id=r['id'], W=r['T']['W'], H=r['T']['H'], k=r['T']['k'], texts=r['T']['texts'], hs=r['T']['hs'], sec=r['sec'])
    if extra: m.update(extra)
    json.dump(m, open(OUT + '/' + name + '.json', 'w')); print('grab', name, len(m['texts']), flush=True)

def set_range(pg, v):
    f = frame(pg); f.evaluate("(v)=>{const r=document.getElementById('playRange');r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}))}", v); pg.wait_for_timeout(700)

def find_hs(pg, label, tip, rx=0.5, ry=0.5):
    """the hot spot of the new drawing that carries the same label (or tooltip) as the one clicked in 1.0"""
    f = frame(pg); f.evaluate(TEXTJS); T = f.evaluate("()=>{window.__REPORTING=true;try{return __texts()}finally{window.__REPORTING=false}}")
    best = None
    for i, h in enumerate(T['hs']):
        inside = ' '.join(b['t'] for b in T['texts'] if h['x'] - 2 <= (b['x0'] + b['x1']) / 2 <= h['x'] + h['w'] + 2 and h['y'] - 2 <= (b['y0'] + b['y1']) / 2 <= h['y'] + h['h'] + 2)
        s = 0
        if label and norm(inside) == norm(label): s = 3
        elif label and norm(label) and norm(label) in norm(inside): s = 2
        elif tip and norm(h['tip']) == norm(tip): s = 2.5
        elif tip and h['tip'] and norm(tip)[:30] == norm(h['tip'])[:30]: s = 1
        if s and (best is None or s > best[0]): best = (s, i, h)
    return (best[1], best[2], T) if best else (None, None, T)

def click_hs(pg, i):
    frame(pg).evaluate("(i)=>{ try{ hotspots[i].fn({x:hotspots[i].x+hotspots[i].w/2,y:hotspots[i].y+hotspots[i].h/2}); }catch(e){} }", i); pg.wait_for_timeout(800)

def drag_hs(pg, h, dxl, dyl):
    f = frame(pg); cv = f.evaluate("__cvrect()"); ifr = pg.evaluate("(()=>{const r=document.querySelector('#engineHost iframe').getBoundingClientRect();return {x:r.x,y:r.y}})()")
    s = cv['w'] / cv['W']; x0 = ifr['x'] + cv['x'] + (h['x'] + h['w'] / 2) * s; y0 = ifr['y'] + cv['y'] + (h['y'] + h['h'] / 2) * s
    pg.mouse.move(x0, y0); pg.mouse.down()
    for k in range(1, 9): pg.mouse.move(x0 + dxl * s * k / 8, y0 + dyl * s * k / 8)
    pg.mouse.up(); pg.wait_for_timeout(800)

with sync_playwright() as pw:
    if PART == 'canvas':
        b, pg = start(pw, 1600, 1000, 2)
        for sc in SCENES + ['farm_sid', 'farm_drip', 'farm_spr']:
            open_scene(pg, sc); grab(pg, 'L_' + sc)
        for v, key in [('years', 'all20'), ('gen', 'avg')]:
            open_scene(pg, 'field'); pg.evaluate("(v)=>E.ev(\"state.fview='\"+v+\"'\")", v); pg.wait_for_timeout(700); grab(pg, 'S_field_' + key)
        pg.evaluate("()=>E.ev(\"state.fview='day'\")")
        b.close()
    if PART == 'states':
        OLD = json.load(open('old_anchors.json'))
        b, pg = start(pw, 1600, 1000, 2)
        for sc in ['field', 'spac', 'v2', 'v1', 'n1', 'v3', 'v7', 'r1', 'v4', 'v6', 'e1', 'n2', 'n3', 'v5']:
            if os.path.exists(OUT + '/P_%s_3.jpg' % sc): continue
            open_scene(pg, sc)
            for k, fr in [(1, 0.33), (2, 0.66), (3, 1.0)]:
                set_range(pg, 1000 * fr); lab = frame(pg).evaluate("(document.getElementById('playLabel')||{}).textContent||''")
                grab(pg, 'P_%s_%d' % (sc, k), dict(note=[lab]))
        for st in OLD['states']:
            sc, key = st['scene'], st['key']; name = 'S_%s_%s' % (sc, key)
            if os.path.exists(OUT + '/' + name + '.jpg') or (sc == 'field' and key in ('all20', 'avg')): continue
            pg.goto('http://127.0.0.1:5199/index.html'); pg.wait_for_timeout(5500); pg.evaluate("document.querySelectorAll('#modalRoot .ov').forEach(o=>o.remove())")
            open_scene(pg, sc); set_range(pg, 0); note = []
            if sc == 'v4':
                MU = {'wheat': 'straw', 'chips': 'chips', 'sawdust': 'sawdust', 'grass': 'grass', 'plastic': 'plastic'}
                set_range(pg, 1000)
                if key == 'bare': pg.evaluate("()=>E.set({vffIdx:9})")
                else: pg.evaluate("(m)=>E.setMulch(m)", MU[key])
                pg.wait_for_timeout(900); grab(pg, name, dict(note=['mulch ' + key])); continue
            for a in st['rec']:
                if a['a'] == 'rng': set_range(pg, a['v'])
                elif a['a'] == 'btn':
                    t = a['t']
                    if re.fullmatch(r'\d{4}', t): pg.evaluate("(y)=>E.setDate(y+'-07-01')", t); pg.wait_for_timeout(900); note.append('year ' + t)
                    else:
                        try: frame(pg).get_by_role('button', name=t, exact=True).first.click(timeout=3000); pg.wait_for_timeout(700); note.append(t)
                        except Exception as e: note.append('missing button ' + t)
                elif a['a'] in ('click', 'drag'):
                    hs = a.get('hs') or {}; i, h, T = find_hs(pg, hs.get('label', ''), hs.get('tip', ''))
                    if i is None: note.append('no control for ' + (hs.get('label') or hs.get('tip') or '?')); continue
                    if a['a'] == 'click': click_hs(pg, i)
                    else:
                        k = T['W'] / a['W']; drag_hs(pg, h, (a['p1'][0] - a['p0'][0]) * k, (a['p1'][1] - a['p0'][1]) * k)
                    note.append(hs.get('label') or hs.get('tip'))
            pg.mouse.move(2, 2); pg.wait_for_timeout(600)
            grab(pg, name, dict(note=note)); print(name, note, flush=True)
        b.close()
    if PART == 'ui':
        b, pg = start(pw, 1440, 810, 2)
        pg.add_script_tag(content=ANN); D = 'ui'
        os.makedirs(OUT + '/ui', exist_ok=True)
        def shot(n, **kw): pg.screenshot(path=f'{OUT}/ui/{n}.jpg', type='jpeg', quality=84, **kw); pg.evaluate("__clear()")
        def rect(sel): return pg.evaluate("(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}", sel)
        # welcome
        pg.evaluate("()=>{ try{ localStorage.clear(); }catch(e){} }"); pg.reload(); pg.wait_for_timeout(6000)
        try:
            r = pg.evaluate("(()=>{const b=Array.from(document.querySelectorAll('#modalRoot button')).find(e=>e.textContent.trim()==='Start');const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
            pg.add_script_tag(content=ANN); pg.evaluate("(a)=>window.__ann([{x:a.x,y:a.y,pref:[-110,-70]}],null,false)", r); shot('u00_welcome')
            pg.get_by_role('button', name='Start', exact=True).click(); pg.wait_for_timeout(800)
        except Exception as e: print('welcome', e); pg.add_script_tag(content=ANN)
        pg.evaluate("document.querySelectorAll('#modalRoot .ov').forEach(o=>o.remove())")
        pg.click('[data-act=expandAll]'); pg.wait_for_timeout(500)
        # one whole-workbench picture per layer, with the four outlines
        for sc in SCENES + ['farm']:
            if sc == 'farm': pg.evaluate("()=>Layers.openFarm('sid')"); pg.wait_for_timeout(1500); pg.evaluate("()=>E.ev(\"runDesign('sid');play.on=false\")"); pg.wait_for_timeout(1200)
            else:
                pg.evaluate("(s)=>Layers.open(s)", sc); pg.wait_for_timeout(1400)
                if sc in DES: pg.evaluate("(s)=>E.ev(\"runDesign('\"+s+\"');play.on=false;play.t=1\")", sc); pg.wait_for_timeout(1000)
            pg.mouse.move(5, 5)
            L = pg.evaluate("(()=>{const e=document.querySelector('#layerTree .tn.sel');if(!e)return null;e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()")
            pg.evaluate("()=>{__box('#layerTree .tn.sel');__box('#engineHost');__box('#dashDock');__box('#rightDock')}")
            ms = []
            if L: ms.append(dict(x=L['x'] + L['w'] - 6, y=L['y'] + L['h'] / 2, label='L', pref=[190, 0]))
            for lab, sel in [('D', '#engineHost'), ('R', '#dashDock'), ('C', '#rightDock')]:
                r = rect(sel); ms.append(dict(x=r['x'] + 22, y=r['y'] + 22, label=lab, nohead=True, pref=[0, 0]))
            pg.evaluate("(m)=>__ann(m,null,false)", ms); shot('wb_' + sc)
        # workbench with its six parts
        pg.evaluate("()=>Layers.open('field')"); pg.wait_for_timeout(1500); pg.mouse.move(5, 5)
        for s in ['#layerTree', '#toolboxDock', '#toolbar', '#engineHost', '#dashDock', '#rightDock']: pg.evaluate("(s)=>__box(s)", s)
        def c(r, dx=22, dy=22): return dict(x=r['x'] + dx, y=r['y'] + dy, nohead=True, pref=[0, 0])
        ms = [c(rect('#layersDock')), c(rect('#toolboxDock')), c(rect('#toolbar'), 12, 12), c(rect('#engineHost')), c(rect('#dashDock')), c(rect('#rightDock'))]
        pg.evaluate("(m)=>__ann(m,null,true)", ms); shot('u01_workbench')
        # menus
        n = pg.evaluate("document.querySelectorAll('#menus > *').length")
        for i in range(n):
            el = pg.query_selector_all('#menus > *')[i]; t = el.inner_text().strip(); bb = el.bounding_box()
            el.click(); pg.wait_for_timeout(500)
            ms = [dict(x=bb['x'] + bb['width'] / 2, y=bb['y'] + bb['height'] - 4, pref=[60, 90]), dict(x=bb['x'] + 90, y=bb['y'] + bb['height'] + 60, pref=[260, 40])]
            pg.evaluate("(m)=>__ann(m,null,false)", ms); shot('u02_menu_' + t.lower(), clip={'x': 0, 'y': 0, 'width': 760, 'height': 620})
            pg.keyboard.press('Escape'); pg.evaluate("()=>{document.querySelectorAll('.mbtn.open').forEach(b=>b.click())}"); pg.wait_for_timeout(250)
        # palette
        pg.keyboard.press('Control+k'); pg.wait_for_timeout(600)
        try:
            r = pg.evaluate("(()=>{const e=Array.from(document.querySelectorAll('input')).filter(e=>e.offsetParent&&e.placeholder)[0];const r=e.getBoundingClientRect();return {x:r.x+80,y:r.y+r.height/2}})()")
            pg.evaluate("(a)=>__ann([{x:a.x,y:a.y,pref:[-30,-90]}],null,false)", r)
        except Exception as e: print('palette', e)
        shot('u03_palette'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        # toolbox
        for t in pg.query_selector_all('#toolTree .tn'):
            try: t.click(timeout=300)
            except Exception: pass
        pg.wait_for_timeout(300); tb = rect('#toolboxDock'); ms = []
        for nm in ['Simulation', 'Ready-made cases', 'Irrigation design', 'Compare and review', 'Export']:
            r = pg.evaluate("(n)=>{const e=Array.from(document.querySelectorAll('#toolTree .tn')).find(e=>e.textContent.replace(/[▶▼]/g,'').trim().startsWith(n));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}", nm)
            if r: ms.append(dict(x=r['x'] + r['w'] - 30, y=r['y'] + r['h'] / 2, pref=[190, 0]))
        pg.evaluate("(m)=>__ann(m,null,false)", ms); shot('u04_toolbox_page', clip={'x': 0, 'y': tb['y'], 'width': tb['w'] + 260, 'height': tb['h']})
        # toolbar
        tbx = rect('#toolbar'); ms = []
        for key in ['Run or pause', 'Run the 20-year', 'Pin results', 'Surface irrigation design', 'Working date']:
            r = pg.evaluate("(k)=>{const e=Array.from(document.querySelectorAll('#toolbar *')).find(e=>((e.title||e.getAttribute('data-l')||'')).startsWith(k));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}", key)
            if r: ms.append(dict(x=r['x'], y=r['y'] + 10, pref=[0, 70]))
        pg.evaluate("(m)=>__ann(m,null,false)", ms); shot('u07_toolbar', clip={'x': 0, 'y': tbx['y'], 'width': 1440, 'height': tbx['h'] + 95})
        sb = rect('#statusbar'); ms = []
        for sel in ['#stScene', '#stDate', '#stCase']:
            r = rect(sel)
            if r: ms.append(dict(x=r['x'] + r['w'] / 2, y=r['y'] + 2, pref=[0, -70]))
        pg.evaluate("(m)=>__ann(m,null,false)", ms); shot('u08_statusbar', clip={'x': 0, 'y': sb['y'] - 95, 'width': 1440, 'height': sb['h'] + 95})
        # dashboard tabs
        def dash(tab, finders, name, scene='field'):
            pg.evaluate("(s)=>Layers.open(s)", scene); pg.wait_for_timeout(1300)
            if scene in DES: pg.evaluate("(s)=>E.ev(\"runDesign('\"+s+\"');play.on=false;play.t=1\")", scene); pg.wait_for_timeout(900)
            pg.click(f'#dashTabs [data-tab={tab}]'); pg.wait_for_timeout(1200); ms = []
            for fnd in finders:
                r = pg.evaluate("(a)=>window.__find(a[0],a[1])", ['#dashDock', fnd])
                if r: ms.append(dict(x=r['x'] + min(r['w'], 200) / 2, y=r['y'] + r['h'] / 2, pref=[130, 0]))
            tabr = rect(f'#dashTabs [data-tab={tab}]'); ms.append(dict(x=tabr['x'] + tabr['w'] / 2, y=tabr['y'] + tabr['h'] - 2, pref=[0, 80]))
            pg.evaluate("(a)=>__ann(a.m,a.r,false)", dict(m=ms, r=rect('#dashDock')))
            pg.query_selector('#dashDock').screenshot(path=f'{OUT}/ui/{name}.jpg', type='jpeg', quality=86); pg.evaluate("__clear()")
        dash('results', ['On ', 'Next 14', 'Whole year', '20-year'], 'u05_dash_results')
        dash('design', ['Key results', 'Most efficient', 'Already the most'], 'u05_dash_design', 'sid')
        dash('charts', ['Hydrograph', 'Times of the', 'Where the water'], 'u05_dash_charts', 'sid')
        dash('charts', ['Rainfall and irrigation', 'Drainage below', 'Evaporation and'], 'u05_dash_charts_field', 'field')
        dash('messages', ['All messages'], 'u05_dash_messages', 'field')
        pg.click('#dashTabs [data-tab=results]')
        # dialogs of release 1.1
        for nm, js, finders in [('u09_weather_import', 'WxUI.importFile()', ['Weather file', 'Latitude']), ('u10_weather_online', 'WxUI.online()', ['Place', 'Or the coordinates']),
                                ('u11_report', 'Act.report()', ['All layers', 'Irrigation design']), ('u12_sketch', "(function(){Sketch.open();document.getElementById('qRect').click();document.querySelector('#skSteps button[data-s=\"4\"]').click()})()", ['Field corners', 'Which system?', 'Next question']), ('u13_compare', 'Sketch.compare()', ['System', 'Application efficiency'])]:
            pg.evaluate(js); pg.wait_for_timeout(900); ms = []
            for fnd in finders:
                r = pg.evaluate("(a)=>window.__find(a[0],a[1])", ['#modalRoot', fnd])
                if r: ms.append(dict(x=r['x'] + min(r['w'], 160) / 2, y=r['y'] + r['h'] / 2, pref=[-120, -40]))
            pg.evaluate("(m)=>__ann(m,null,false)", ms); shot(nm)
            pg.evaluate("document.getElementById('modalRoot').innerHTML=''")
        # design before its run, the value window, the farm before its run
        pg.evaluate("()=>Layers.open('sid')"); pg.wait_for_timeout(1200); pg.evaluate("()=>E.ev(\"DESIGN_RUN.sid.on=false;DESIGN_RUN.sid.why=''\")"); pg.wait_for_timeout(900); pg.mouse.move(5, 5); shot('u14_design_before_run')
        pg.evaluate("()=>E.ev(\"(function(){var s=SIDW[0];if(s)sidDown({x:s.x+5,y:s.y})})()\")"); pg.wait_for_timeout(700); shot('u15_value_window'); pg.keyboard.press('Escape')
        pg.evaluate("()=>Layers.openFarm('drip')"); pg.wait_for_timeout(1300); pg.evaluate("()=>E.ev(\"DESIGN_RUN.drip.on=false\")"); pg.wait_for_timeout(900); shot('u16_farm_before_run')
        # properties
        pg.set_viewport_size({'width': 1440, 'height': 2600}); pg.wait_for_timeout(800)
        try: pg.click('[data-act=expandProps]')
        except Exception as e: print(e)
        pg.wait_for_timeout(600); rd = rect('#rightDock'); ms = []
        for nm in ['Scenario', 'Soil and field', 'Mulch', 'Weather and climate', 'Irrigation', 'Nutrients', 'Design shortcuts']:
            r = pg.evaluate("(n)=>{const e=Array.from(document.querySelectorAll('#props .pg')).map(g=>g.firstElementChild).find(h=>h&&h.textContent.replace(/[▼▶]/g,'').trim().startsWith(n));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}", nm)
            if r: ms.append(dict(x=r['x'] + r['w'] - 20, y=r['y'] + r['h'] / 2, pref=[-150, 0]))
        pg.evaluate("(m)=>__ann(m,null,false)", ms)
        pg.screenshot(path=f'{OUT}/ui/u06_properties_page.jpg', type='jpeg', quality=86, clip={'x': rd['x'] - 210, 'y': rd['y'], 'width': rd['w'] + 210, 'height': rd['h']}); pg.evaluate("__clear()")
        b.close()

if PART == 'fix':
    with sync_playwright() as pw:
        b, pg = start(pw, 1600, 1000, 2)
        FIX = [('spac', 'border', None, 'Border strip'), ('n1', 'trig07', "state.trigBy[state.soil]=0.70;refresh()", None), ('n1', 'trig025', "state.trigBy[state.soil]=0.25;refresh()", None),
               ('v3', 'dry', "MICRO.pF=4.2", None), ('v3', 'wet', "MICRO.pF=1.0", None), ('v7', 'sandyclay', "applyState({soil:'S08_SandyClayLoam'})", None)]
        for sc, key, js, lab in FIX:
            pg.goto('http://127.0.0.1:5199/index.html'); pg.wait_for_timeout(5500); pg.evaluate("document.querySelectorAll('#modalRoot .ov').forEach(o=>o.remove())")
            open_scene(pg, sc); set_range(pg, 1000 if sc == 'n1' else 0)
            if js: frame(pg).evaluate("(c)=>{eval(c)}", js); pg.wait_for_timeout(900); note = [key]
            else:
                i, h, T = find_hs(pg, lab, ''); note = [lab]
                if i is not None: click_hs(pg, i)
                else: note = ['no control ' + lab]
            set_range(pg, 1000) if sc == 'spac' else None
            grab(pg, 'S_%s_%s' % (sc, key), dict(note=note)); print(sc, key, note, flush=True)
        b.close()
