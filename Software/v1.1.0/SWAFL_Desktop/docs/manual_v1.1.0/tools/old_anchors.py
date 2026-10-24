"""Run on the version-1.0 program (port 5180): for every arrow of the 1.0 atlas, find the text drawn nearest to the point
it marks (its anchor), and for every control state of the atlas, the control that was clicked. Output: old_anchors.json"""
import json, re, sys, math
from playwright.sync_api import sync_playwright
import spec_atlas as SP, spec_full as SF
from textjs import TEXTJS
exec(open('plan3.py').read().split("if __name__")[0].replace("import capstates", ""))   # plan

def slug(s): return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')[:40]
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[-+−]?\d[\d.,]*', '#', s)).strip().lower()
def anchor(T, p, desc):
    best = None
    for i, b in enumerate(T['texts']):
        dx = max(b['x0'] - p[0], 0, p[0] - b['x1']); dy = max(b['y0'] - p[1], 0, p[1] - b['y1']); d = math.hypot(dx, dy)
        letters = len(re.findall(r'[A-Za-z]', b['t']))
        sc = d + (25 if letters < 2 else 0) + (8 if letters < 4 else 0)
        if best is None or sc < best[0]: best = (sc, i, d)
    if best is None: return None
    b = T['texts'][best[1]]; n = norm(b['t'])
    same = sorted([j for j, q in enumerate(T['texts']) if norm(q['t']) == n], key=lambda j: (T['texts'][j]['y0'], T['texts'][j]['x0']))
    cx, cy = (b['x0'] + b['x1']) / 2, (b['y0'] + b['y1']) / 2
    return dict(t=b['t'], n=n, occ=same.index(best[1]), nocc=len(same), dx=p[0] - cx, dy=p[1] - cy, dist=best[2], px=p[0], py=p[1], desc=desc, W=T['W'])
def hs_at(T, p):
    hs = [h for h in T['hs'] if h['x'] <= p[0] <= h['x'] + h['w'] and h['y'] <= p[1] <= h['y'] + h['h']]
    if not hs: return None
    h = min(hs, key=lambda h: h['w'] * h['h'])
    inside = [b for b in T['texts'] if h['x'] - 2 <= (b['x0'] + b['x1']) / 2 <= h['x'] + h['w'] + 2 and h['y'] - 2 <= (b['y0'] + b['y1']) / 2 <= h['y'] + h['h'] + 2]
    return dict(tip=h['tip'], label=' '.join(b['t'] for b in inside)[:80], rx=(p[0] - h['x']) / max(1, h['w']), ry=(p[1] - h['y']) / max(1, h['h']))

out = {'draw': {}, 'full': {}, 'states': []}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--no-sandbox'])
    # ------------------------------------------------ the drawing-area screens (1440 x 810, as the 1.0 atlas)
    ctx = b.new_context(viewport={'width': 1440, 'height': 810}, device_scale_factor=2); pg = ctx.new_page()
    pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(5000)
    try: pg.get_by_role('button', name='Start', exact=True).click(timeout=3000); pg.wait_for_timeout(800)
    except Exception: pass
    pg.click('[data-act=expandAll]'); pg.wait_for_timeout(500)
    items = pg.evaluate("Array.from(document.querySelectorAll('#layerTree [data-scene]')).map(e=>[e.dataset.scene,e.dataset.sec||'',e.querySelector('.lbl').textContent.trim()])")
    for i, (sc, sec, lbl) in enumerate(items):
        name = f"{i:02d}_{sc}" + (('_' + slug(lbl)) if sec else '')
        if name not in SP.D: continue
        sel = '#layerTree [data-scene="%s"]' % sc + ('[data-sec="%s"]' % sec.replace('"', '\\"') if sec else ':not([data-sec])')
        pg.click(sel, timeout=5000); pg.wait_for_timeout(1800); pg.mouse.move(5, 5)
        f = [f for f in pg.frames if f != pg.main_frame][0]; f.evaluate(TEXTJS)
        er = pg.evaluate("(()=>{const r=document.querySelector('#engineHost').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()")
        ifr = pg.evaluate("(()=>{const r=document.querySelector('#engineHost iframe').getBoundingClientRect();return {x:r.x,y:r.y}})()")
        cv = f.evaluate("__cvrect()"); T = f.evaluate("__texts()")
        A = []
        for x, y, t in SP.D[name]:
            sx, sy = er['x'] + er['w'] * x / 100, er['y'] + er['h'] * y / 100
            lx = (sx - ifr['x'] - cv['x']) * cv['W'] / cv['w']; ly = (sy - ifr['y'] - cv['y']) * cv['H'] / cv['h']
            A.append(anchor(T, (lx, ly), t))
        # where the visible drawing area sits on the canvas, to place the new screenshot the same way
        vis = dict(top=(er['y'] - ifr['y'] - cv['y']) * cv['H'] / cv['h'], bottom=(er['y'] + er['h'] - ifr['y'] - cv['y']) * cv['H'] / cv['h'])
        out['draw'][name] = dict(scene=sc, sec=sec, label=lbl, anchors=A, vis=vis); print(name, len(A), flush=True)
    ctx.close()
    # ------------------------------------------------ full-height drawings and their control states (1600 x 3200)
    ctx = b.new_context(viewport={'width': 1600, 'height': 3200}, device_scale_factor=2); pg = ctx.new_page()
    def openl(sc):
        pg.goto('http://127.0.0.1:5180/index.html'); pg.wait_for_timeout(3500)
        try: pg.get_by_role('button', name='Start', exact=True).click(timeout=2500); pg.wait_for_timeout(400)
        except Exception: pass
        pg.click('[data-act=expandAll]'); pg.wait_for_timeout(200)
        pg.click('#layerTree [data-scene="%s"]:not([data-sec])' % sc); pg.wait_for_timeout(2300)
        f = [f for f in pg.frames if f != pg.main_frame][0]
        if f.evaluate("document.getElementById('playBtn').textContent.trim()") == 'Pause': f.click('#playBtn'); pg.wait_for_timeout(300)
        f.evaluate("(v)=>{const r=document.getElementById('playRange');r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}))}", 0); pg.wait_for_timeout(600)
        f.evaluate(TEXTJS); return f
    for sc in SF.F:
        f = openl(sc); cv = f.evaluate("__cvrect()"); T = f.evaluate("__texts()")
        k = cv['W'] / cv['w']           # logical px per css px; the 1.0 images were 2 device px per css px
        A = [anchor(T, (x / 2 * k, y / 2 * k), t) for (x, y, t, *_r) in SF.F[sc]]
        cuts = [c / 2 * k for c in SF.CUT[sc]]
        out['full'][sc] = dict(anchors=A, cuts=cuts, W=cv['W'], H=cv['H']); print('full', sc, len(A), flush=True)
    for sc, key, actions in plan:
        f = openl(sc); cv = f.evaluate("__cvrect()"); k = cv['W'] / cv['w']; T = f.evaluate("__texts()"); rec = []
        class NS(dict): pass
        def click(px, py):
            p = (px / 2 * k, py / 2 * k); rec.append(dict(a='click', hs=hs_at(T, p), anchor=anchor(T, p, ''), p=p))
        def drag(x0, y0, x1, y1):
            p0 = (x0 / 2 * k, y0 / 2 * k); p1 = (x1 / 2 * k, y1 / 2 * k)
            rec.append(dict(a='drag', hs=hs_at(T, p0), anchor=anchor(T, p0, ''), p0=p0, p1=p1, W=T['W']))
        ns = dict(click=click, drag=drag, rng=lambda v: rec.append(dict(a='rng', v=v)), btn=lambda t: rec.append(dict(a='btn', t=t)), js=lambda c: rec.append(dict(a='js', c=c)), wait=lambda ms: None)
        for a in actions: a(ns)
        out['states'].append(dict(scene=sc, key=key, rec=rec)); print('state', sc, key, rec[-1].get('hs'), flush=True)
    b.close()
json.dump(out, open('old_anchors.json', 'w'), indent=1)
