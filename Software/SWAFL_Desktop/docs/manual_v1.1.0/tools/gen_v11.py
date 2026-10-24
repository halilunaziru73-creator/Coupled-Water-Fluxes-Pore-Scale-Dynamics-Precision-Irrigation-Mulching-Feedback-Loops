#!/usr/bin/env python3
"""Builds the SWAFL 1.1.0 manual (three volumes) from the chapters and from the screens captured by capture.js.
usage: python3 gen_v11.py <raw capture dir> [--images-only|--md-only]
The captures are the canvas drawings of every layer (full height, at the resolution of the app) and screenshots of
the window. The drawings are cut into page-size parts at their section headings (or at blank bands); every layer of
the atlas is followed by the full text of the equations it draws on."""
import json, os, re, sys, glob, subprocess, shutil
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.dirname(HERE)
RAW = sys.argv[1]; ONLY = sys.argv[2] if len(sys.argv) > 2 else ''
CH, IMG = M + '/chapters', M + '/images'
OLD = os.path.join(os.path.dirname(M), 'manual')
EQS = json.load(open(OLD + '/atlas_tools/eqs.json'))
meta = {}
for f in glob.glob(RAW + '/meta_*.json'): meta.update(json.load(open(f)))

ORDER = [('Irrigation design', [('sid', 'Surface irrigation design'), ('drip', 'Drip irrigation design'), ('spr', 'Sprinkler design and pipes'), ('farm', 'Virtual farm simulation')]),
         ('Irrigation control', [('v1', 'Sensor and trigger'), ('n1', 'Trigger law')]),
         ('Mulch and evaporation', [('v4', 'Mulch against bare soil'), ('v6', 'Mulch control'), ('e1', 'Evaporation physics'), ('n2', 'Fate of saved water'), ('n3', 'Regime map')]),
         ('Soil structure and tillage', [('v3', 'Tillage and structure'), ('v7', 'Soil hydraulic drivers'), ('r1', 'Root structure')]),
         ('Field water balance', [('field', 'Field balance'), ('spac', 'Soil, plant and air'), ('v2', 'Profile evolution')]),
         ('Seasonal data', [('yby', 'Reliability over 20 seasons'), ('wb2', 'Full water balance'), ('nb', 'Nitrogen budget')]),
         ('Crops', [('crop', 'Crop water requirement')]),
         ('Feedback loops', [('v5', 'Feedback loops')])]
NAME = {i: n for _, L in ORDER for i, n in L}
SOILS = ['S03_Sand', 'S04_LoamySand', 'S05_SandyLoam', 'S02_CoarseSand', 'S01_CoarseLoam', 'S06_Loam', 'S07_SiltLoam', 'S08_SandyClayLoam', 'S09_ClayLoam', 'S10_SiltyClayLoam']
SOILN = {'S03_Sand': 'Sand', 'S04_LoamySand': 'Loamy Sand', 'S05_SandyLoam': 'Sandy Loam', 'S02_CoarseSand': 'Coarse Sand', 'S01_CoarseLoam': 'Coarse Loam', 'S06_Loam': 'Loam', 'S07_SiltLoam': 'Silt Loam', 'S08_SandyClayLoam': 'Sandy Clay Loam', 'S09_ClayLoam': 'Clay Loam', 'S10_SiltyClayLoam': 'Silty Clay Loam'}

# ------------------------------------------------------------------ equations of each layer, from the reference of version 1.0
def layer_eqs():
    s = open(OLD + '/19_atlas.md').read(); out = {}
    hmap = {'S2 Surface irrigation design': 'sid', 'S3 Drip irrigation design': 'drip', 'S4 Sprinkler design and pipes': 'spr', 'Field balance': 'field', 'Soil, plant and air (S1)': 'spac', 'Profile evolution (V2)': 'v2', 'Sensor and trigger (V1)': 'v1', 'Trigger law (N1)': 'n1', 'Tillage and structure (V3)': 'v3', 'Soil hydraulic drivers (V7)': 'v7', 'Root structure (R1)': 'r1', 'Mulch against bare soil (V4)': 'v4', 'Mulch control (V6)': 'v6', 'Evaporation physics (E1)': 'e1', 'Fate of saved water (N2)': 'n2', 'Regime map (N3)': 'n3', 'Feedback loops (V5)': 'v5'}
    parts = re.split(r'^## (.+)$', s, flags=re.M)
    keys = sorted(EQS, key=lambda x: [int(a) for a in x.split('.')])
    def rng(a, b):
        A = [int(x) for x in a.split('.')]; B = [int(x) for x in b.split('.')]
        return [k for k in keys if A <= [int(x) for x in k.split('.')] <= B]
    for i in range(1, len(parts), 2):
        h = parts[i].strip(); body = parts[i + 1]; lid = hmap.get(h)
        if not lid: continue
        found = set()
        for m in re.finditer(r'Eqs?\.\s*\(?(\d+\.\d+)\)?(?:\s*(?:to|–|-|--)\s*\(?(\d+\.\d+)\)?)?', body):
            a, b = m.group(1), m.group(2)
            for k in (rng(a, b) if b else [a]):
                if k in EQS: found.add(k)
        out[lid] = sorted(found, key=lambda x: [int(a) for a in x.split('.')])
    # layers new in 1.1
    out['farm'] = ['5.3', '5.27'] + [k for k in ('11.16', '11.18', '11.19', '12.19', '13.11') if k in EQS]
    out['crop'] = [k for k in ('5.3', '5.26', '5.27') if k in EQS]
    out['yby'] = out['wb2'] = out['nb'] = [k for k in keys if k.startswith('5.') and int(k.split('.')[1]) <= 12]
    return out
EXTRA = {'farm': ['20.1', '20.2', '18.0', '14.6'], 'crop': ['21.1', '21.2', '21.3', '21.4', '21.5', '21.6', '21.7', '21.8', '21.9'], 'yby': ['22.1'], 'wb2': ['22.1'], 'nb': ['22.1'],
         'sid': ['18.0', '18.2', '14.6'], 'drip': ['18.0', '18.1', '18.2', '14.6'], 'spr': ['18.0', '18.1', '18.2', '14.6'], 'v1': ['6.4a'], 'v2': ['6.4a']}

def new_eqs():
    """equations added in 1.1, read from the chapters of this manual"""
    out = {}
    for f in sorted(glob.glob(CH + '/*.md')):
        s = open(f).read()
        for m in re.finditer(r'\$\$\n(.*?)\\tag\{([0-9a-z.]+)\}\n\$\$\n\n(\*Provenance[^\n]*)', s, flags=re.S):
            tag = m.group(2)
            if tag in EQS: continue
            out[tag] = {'body': m.group(1).rstrip() + '\n\\tag{' + tag + '}', 'prov': m.group(3), 'file': os.path.basename(f)}
    return out

def eq_block(k, NEQ):
    if k in EQS:
        e = EQS[k]; return '$$\n' + e['body'].strip() + '\n$$\n\n' + e['prov'].strip() + '\n'
    if k in NEQ:
        e = NEQ[k]; return '$$\n' + e['body'].strip() + '\n$$\n\n' + e['prov'].strip() + '\n'
    return ''

# ------------------------------------------------------------------ cutting the drawings
def load(name):
    im = Image.open(RAW + '/' + name + '.jpg').convert('RGB'); mt = meta.get(name, {}); return im, mt

def trim_bottom(a):
    rows = (np.abs(a.astype(int) - 255).sum(axis=2) > 30).sum(axis=1)
    nz = np.nonzero(rows > 2)[0]; return int(nz[-1]) + 8 if len(nz) else a.shape[0]

def cuts(name, ratio=1.32):
    im, mt = load(name); ss = mt.get('ss', 1) or 1; a = np.asarray(im); Hp = min(trim_bottom(a), a.shape[0]); Wp = a.shape[1]
    lim = int(Wp * ratio)
    heads = sorted([int((v[0] - 24) * ss) for v in (mt.get('sec') or {}).values() if v[0] > 30])
    ink = (np.abs(a.astype(int) - a[:, 8:9, :].astype(int)).sum(axis=2) > 40).sum(axis=1)
    out, y0 = [], 0
    while y0 < Hp - 10:
        end = y0 + lim
        if end >= Hp: out.append((y0, Hp)); break
        hs = [h for h in heads if y0 + lim * 0.4 < h <= end]
        if hs: y1 = hs[-1]
        else:
            seg = ink[int(y0 + lim * 0.6):end]
            if len(seg) > 6: win = np.convolve(seg, np.ones(6), 'same'); y1 = int(y0 + lim * 0.6) + int(len(win) - 1 - int(np.argmin(win[::-1])))
            else: y1 = end
            if y1 <= y0 + 20: y1 = end
        out.append((y0, y1)); y0 = y1
    secs = []
    for (u0, u1) in out:
        t = [k for k, v in sorted((mt.get('sec') or {}).items(), key=lambda kv: kv[1][0]) if u0 <= v[0] * ss < u1]
        secs.append(t)
    return im, out, secs

def save(im, box, dst, width=1100, q=72):
    c = im.crop((0, box[0], im.width, box[1]))
    if c.width > width: c = c.resize((width, max(1, round(c.height * width / c.width))), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True); c.save(dst, quality=q, optimize=True)

def pieces(name, sub, width=1100, q=72):
    if not os.path.exists(RAW + '/' + name + '.jpg'): return []
    im, bx, secs = cuts(name); res = []
    for i, b in enumerate(bx):
        fn = '%s/%s_p%d.jpg' % (sub, name, i + 1); save(im, b, IMG + '/' + fn, width, q); res.append((fn, secs[i]))
    return res

def sec_crop(name, prefix, dst):
    im, mt = load(name); ss = mt.get('ss', 1) or 1; S = sorted((mt.get('sec') or {}).items(), key=lambda kv: kv[1][0])
    for i, (k, v) in enumerate(S):
        if k.startswith(prefix):
            y0 = int((v[0] - 24) * ss); y1 = int((S[i + 1][1][0] - 24) * ss) if i + 1 < len(S) else trim_bottom(np.asarray(im))
            save(im, (y0, min(y1, y0 + int(im.width * 1.4))), IMG + '/' + dst); return True
    print('section not found', name, prefix); return False

def ui_images():
    os.makedirs(IMG + '/ui', exist_ok=True)
    for f in glob.glob(RAW + '/*.jpg'):
        b = os.path.basename(f)[:-4]
        if meta.get(b, {}).get('kind') == 'window' or b.startswith(('menu_', 'dlg_', 'wb_', 'dash_', 'gate_', 'farm_', 'farmgate_', 'picker_', 'w_')):
            im = Image.open(f).convert('RGB')
            if im.width > 1400: im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
            im.save(IMG + '/ui/' + b + '.jpg', quality=78, optimize=True)
    w = Image.open(RAW + '/w_start.jpg'); w.crop((1368, 64, 1600, 1000)).save(IMG + '/ui/w_start_props.jpg', quality=85)
    dd = glob.glob(RAW + '/drip_dims.png')
    if dd: Image.open(dd[0]).convert('RGB').resize((1400, 875)).save(IMG + '/ui/drip_dims.jpg', quality=78)
    if os.path.exists(RAW + '/d_farm_sid.jpg'):
        im, mt = load('d_farm_sid'); a = np.asarray(im); hb = trim_bottom(a); ss = mt.get('ss', 1) or 1
        save(im, (max(0, hb - int(776 * ss)), hb), IMG + '/ui/farm3d_sid.jpg', 1100, 80)

# ------------------------------------------------------------------ the crop table
def crop_labels():
    js = "const fs=require('fs');global.window={};eval(fs.readFileSync('%s','utf8'));const L=window.CROPLIB;const r={};for(const k in L.crops)r[k]=L.crops[k].label;r.cereal='Cereal/Oilseed (simulated rotation)';console.log(JSON.stringify(r))" % (os.path.join(M, '..', '..', 'app', 'engine', 'crops.js').replace('\\', '/'))
    return json.loads(subprocess.check_output(['node', '-e', js]).decode())

def crop_table():
    js = "const fs=require('fs');global.window={};eval(fs.readFileSync('%s','utf8'));const L=window.CROPLIB;const r=[];for(const k in L.crops){const c=L.crops[k];r.push([c.label,c.group,c.kcIni,c.kcMid,c.kcEnd,(c.stages||[]).join('/'),c.height,c.root,c.p,c.ky,c.habit,c.rootSrc||''])};console.log(JSON.stringify(r))" % (os.path.join(M, '..', '..', 'app', 'engine', 'crops.js').replace('\\', '/'))
    rows = json.loads(subprocess.check_output(['node', '-e', js]).decode())
    G = {'field': 'field crop', 'perennial': 'tree, vine or palm'}
    t = 'Table 21.2. The 48 crops of the library: crop coefficients, stage lengths (initial/development/mid/late, days), plant height (m), maximum rooting depth (cm), depletion fraction $p$ and yield response factor $K_y$ (— when not tabulated).\n\n| Crop | Group | $K_{c,ini}$ | $K_{c,mid}$ | $K_{c,end}$ | Stages (d) | Height (m) | Root (cm) | $p$ | $K_y$ |\n|:--|:--|--:|--:|--:|:--|--:|--:|--:|--:|\n'
    f = lambda v, d=2: '—' if v is None else (('%.' + str(d) + 'f') % v if isinstance(v, (int, float)) else str(v))
    for r in rows:
        t += '| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' % (r[0], G.get(r[1], r[1]), f(r[2]), f(r[3]), f(r[4]), r[5] or '—', f(r[6], 1), f(r[7], 0), f(r[8]), f(r[9]))
    return t

# ------------------------------------------------------------------ markdown
FRONT = open(CH + '/00_front.md').read()
def front(vol, title):
    s = FRONT.split('# About this manual {-}')[0]
    s = s.replace('Volume 1 of 3: installing, every window and control, every layer and design, the weather, the virtual farm, the crops, the reports, and the governing equations behind every output', title)
    return s.replace('toc-depth: 2', 'toc-depth: 2' if vol == 1 else 'toc-depth: 2')

def fig(fn, cap, w=100):
    return '![%s](images/%s){width=%d%%}\n\n' % (cap.replace('[', '(').replace(']', ')'), fn, w)

def layer_md(lid, prefix, sub, eqmap, NEQ, head='##', with_eq=True, wb=True, maxp=None):
    name = prefix + ('farm_sid' if lid == 'farm' else lid)
    md = ''
    if wb and os.path.exists(IMG + '/ui/wb_%s.jpg' % lid): md += fig('ui/wb_%s.jpg' % lid, NAME[lid] + ': the window with the layer open.')
    farms = ['farm_sid', 'farm_drip', 'farm_spr'] if lid == 'farm' else [lid]
    for fm in farms:
        P = pieces(prefix + fm, sub)
        if maxp: P = P[:maxp]
        if lid == 'farm': md += '%s# %s\n\n' % (head, {'farm_sid': 'The farm of the surface design', 'farm_drip': 'The farm of the drip design', 'farm_spr': 'The farm of the sprinkler design'}[fm])
        for i, (fn, secs) in enumerate(P):
            cap = '%s, part %d of %d' % (NAME[lid], i + 1, len(P)) + (': ' + '; '.join(secs) if secs else '') + '.'
            md += fig(fn, cap) + '\\newpage\n\n'
    if with_eq:
        ks = eqmap.get(lid, []) + EXTRA.get(lid, [])
        seen = []
        for k in ks:
            if k not in seen and (k in EQS or k in NEQ): seen.append(k)
        if seen:
            md += '%s# The equations of this layer\n\n' % head
            md += 'Every number and picture of the layer comes from the equations below (numbers as in Volume 1, with the chapter that explains each).\n\n'
            for k in seen:
                src = EQS[k]['file'] if k in EQS else NEQ[k]['file']
                md += '**Eq. %s** (Volume 1, %s)\n\n' % (k, re.sub(r'^\d+_', '', src).replace('.md', '').replace('_', ' '))
                md += eq_block(k, NEQ) + '\n'
            md += '\\newpage\n\n'
    return md

def build():
    eqmap = layer_eqs(); NEQ = new_eqs()
    # ---------- volume 1
    v1 = sorted(glob.glob(CH + '/[0-9]*.md'))
    out1 = M + '/vol1'; shutil.rmtree(out1, ignore_errors=True); os.makedirs(out1)
    for f in v1:
        s = open(f).read()
        if '{{CROPTABLE}}' in s: s = s.replace('{{CROPTABLE}}', crop_table())
        if '{{EQREF}}' in s:
            ref = ''; used = {}
            for lid, ks in eqmap.items():
                for k in ks + EXTRA.get(lid, []): used.setdefault(k, set()).add(NAME.get(lid, lid))
            keys = sorted(EQS, key=lambda x: [int(a) for a in x.split('.')])
            for k in keys:
                ref += '**Eq. %s** — %s%s\n\n' % (k, re.sub(r'^\d+_', '', EQS[k]['file']).replace('.md', '').replace('_', ' '), ('; used by: ' + ', '.join(sorted(used[k]))) if k in used else '')
                ref += eq_block(k, NEQ) + '\n'
            s = s.replace('{{EQREF}}', ref)
        open(out1 + '/' + os.path.basename(f), 'w').write(s)
    # ---------- volume 2: the atlas at the default settings
    md = front(2, 'Volume 2 of 3: screenshot atlas at the default settings — every screen, every menu and dialog, and every layer from top to bottom with the equations it draws on')
    md += '# About this volume {-}\n\nThis volume shows every screen of SWAFL Desktop 1.1.0 at the default settings (Coarse Loam, conventional tillage, the cereal/oilseed rotation, wheat-straw mulch of strength 1.0, surface irrigation, trigger −300 cm at 20 cm, the built-in weather record, the working date of the capture). Each layer is shown first in the window, then drawn from top to bottom and cut into page-size parts at its section headings; the caption of each part names the sections it holds. After the drawing, every equation that the layer draws on is printed in full with its provenance. The three designs are shown after their run, and the virtual farm is shown for each design on an irrigation day.\n\n\\newpage\n\n'
    md += '# The window\n\n## The workbench\n\n' + fig('ui/w_start.jpg', 'The workbench on start: Field balance for the working date.') + fig('ui/w_tree.jpg', 'The Layers panel with every group and layer expanded; each design lists its sections and its virtual farm.') + '\\newpage\n\n'
    md += '## The menus\n\n'
    for m in ['file', 'edit', 'view', 'tools', 'refresh', 'review', 'run', 'help']:
        md += fig('ui/menu_%s.jpg' % m, 'The %s menu.' % m.capitalize())
    md += '\\newpage\n\n## The dialogs\n\n'
    for d, c in [('dlg_weather_import', 'Import weather data.'), ('dlg_weather_online', 'Online weather for a location.'), ('dlg_report', 'Save report as PDF: choose the layers (all ticked).'), ('dlg_sketch', 'Field sketch to design.'), ('dlg_compare', 'The irrigation systems compared on this field.'), ('dlg_palette', 'The command palette (Ctrl+K).'), ('dlg_help', 'Help (F1).'), ('dlg_about', 'About SWAFL.'), ('picker_sid', 'The value window of a design input: exact value, unit and the list of the allowed range.')]:
        if os.path.exists(IMG + '/ui/%s.jpg' % d): md += fig('ui/%s.jpg' % d, c)
    md += '\\newpage\n\n## The Properties panel\n\n' + fig('ui/w_start_props.jpg', 'The Properties panel: Scenario, Soil and field, Mulch, Weather and climate, Irrigation, Nutrients, Design shortcuts.', 40)
    md += '## The dashboard\n\n'
    for lid in ['field', 'sid', 'drip', 'spr', 'crop']:
        for t in ['results', 'design', 'charts', 'messages']:
            if os.path.exists(IMG + '/ui/dash_%s_%s.jpg' % (lid, t)): md += fig('ui/dash_%s_%s.jpg' % (lid, t), 'The %s tab of the dashboard with %s open.' % (t.capitalize(), NAME[lid]))
        md += '\\newpage\n\n'
    md += '## Before a design runs\n\n'
    for lid in ['sid', 'drip', 'spr']:
        md += fig('ui/gate_%s.jpg' % lid, NAME[lid] + ' before its run: the inputs are set, the results wait for Run simulation.')
        md += fig('ui/farmgate_%s.jpg' % lid, 'The virtual farm of the ' + NAME[lid].lower() + ' before the design has run.')
    md += '\\newpage\n\n'
    for gname, L in ORDER:
        md += '# %s\n\n' % gname
        for lid, nm in L:
            md += '## %s\n\n' % nm + layer_md(lid, 'd_', 'layers', eqmap, NEQ, '##')
        if gname == 'Field water balance':
            for v, vn in [('years', 'all 20 years'), ('gen', 'the average year')]:
                P = pieces('d_field_' + v, 'layers')
                md += '## Field balance: %s\n\n' % vn
                for i, (fn, secs) in enumerate(P): md += fig(fn, 'Field balance, %s, part %d of %d.' % (vn, i + 1, len(P))) + '\\newpage\n\n'
    open(M + '/vol2.md', 'w').write(md)
    # chapter images used by volume 1
    for lid in ['sid', 'drip', 'spr', 'v1', 'n1', 'field', 'spac', 'v3', 'v5', 'v7', 'v4', 'e1', 'n3', 'crop', 'yby', 'wb2', 'nb']:
        pieces('d_' + lid, 'layers')
    for name, pre, dst in [('d_sid', 'Longitudinal section', 'sec/sid_longitudinal.jpg'), ('d_sid', 'Design table', 'sec/sid_design_table.jpg'), ('d_sid', 'Irrigation schedule', 'sec/sid_schedule.jpg'),
                           ('d_drip', 'Uniformity along the lateral', 'sec/drip_uniformity.jpg'), ('d_drip', 'Result for this design', 'sec/drip_result.jpg'), ('d_drip', 'Layout and infrastructure', 'sec/drip_layout.jpg'), ('d_drip', 'Design table', 'sec/drip_design_table.jpg'),
                           ('d_spr', 'Soil intake against', 'sec/spr_intake.jpg'), ('d_spr', 'Does your design pass', 'sec/spr_checks.jpg')]:
        sec_crop(name, pre, dst)
    # ---------- volume 3: by soil and by crop
    md = front(3, 'Volume 3 of 3: screenshot atlas by soil and by crop — every layer for each of the ten soils, the three designs and their virtual farms for each soil, and the crop water requirement of every crop')
    md += '# About this volume {-}\n\nEach chapter of the first part sets one of the ten soils in Properties and shows every layer, drawn from top to bottom, with the other settings at their defaults; the three irrigation designs are shown after their run with their inputs at the defaults, and the virtual farm of each design on an irrigation day. The equations of each layer are printed once, in Volume 2. The second part shows the crop water requirement for every crop of the library on the Coarse Loam.\n\n\\newpage\n\n'
    for s in SOILS:
        if not glob.glob(RAW + '/s_%s_*.jpg' % s): continue
        md += '# %s\n\n' % SOILN[s]
        for gname, L in ORDER:
            for lid, nm in L:
                nmf = 's_%s_' % s
                if lid == 'farm':
                    for fm, fl in [('farm_sid', 'surface'), ('farm_drip', 'drip'), ('farm_spr', 'sprinkler')]:
                        P = pieces(nmf + fm, 'soils/' + s, 1000, 68)
                        md += '## Virtual farm of the %s design (%s)\n\n' % (fl, SOILN[s])
                        for i, (fn, secs) in enumerate(P): md += fig(fn, 'Virtual farm, %s design, %s, part %d of %d.' % (fl, SOILN[s], i + 1, len(P))) + '\\newpage\n\n'
                    continue
                P = pieces(nmf + lid, 'soils/' + s, 1000, 68)
                if not P: continue
                md += '## %s (%s)\n\n' % (nm, SOILN[s])
                for i, (fn, secs) in enumerate(P):
                    md += fig(fn, '%s, %s, part %d of %d%s.' % (nm, SOILN[s], i + 1, len(P), (': ' + '; '.join(secs)) if secs else '')) + '\\newpage\n\n'
    LBL = crop_labels()
    md += '# The crop water requirement of every crop\n\n'
    for f in sorted(glob.glob(RAW + '/c_*_crop.jpg')):
        k = os.path.basename(f)[2:-9]
        P = pieces('c_%s_crop' % k, 'crops', 1000, 68)[:2]
        md += '## %s\n\n' % LBL.get(k, k)
        for i, (fn, secs) in enumerate(P): md += fig(fn, 'Crop water requirement, %s, part %d.' % (LBL.get(k, k), i + 1)) + '\\newpage\n\n'
    open(M + '/vol3.md', 'w').write(md)

if __name__ == '__main__':
    if ONLY != '--md-only': ui_images()
    build()
    print('done')
