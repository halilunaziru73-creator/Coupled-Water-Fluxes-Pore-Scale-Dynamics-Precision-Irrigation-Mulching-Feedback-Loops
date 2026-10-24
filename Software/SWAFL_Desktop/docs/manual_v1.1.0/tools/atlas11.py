"""Builds the screenshot atlas of the 1.1.0 manual from the atlas of 1.0: same chapters, sections, captions, arrow
legends and equations; every picture replaced by the same screen of version 1.1, with each arrow moved to the item it
named in 1.0 (found by the text drawn next to it). Screens new in 1.1 are added with arrows on their headings.
usage: python3 atlas11.py <manual_v1.1.0 dir>"""
import json, re, os, sys, glob, math, shutil
import numpy as np
from PIL import Image
import annot
import spec_atlas as SP, spec_full as SF

MAN = sys.argv[1]; IMG = MAN + '/images/atlas11'; os.makedirs(IMG, exist_ok=True)
RAW = 'new_raw'; OLD = json.load(open('old_anchors.json'))
OLDMD = open(os.path.join(os.path.dirname(MAN), 'manual', '19_atlas.md')).read()
norm = lambda s: re.sub(r'\s+', ' ', re.sub(r'[-+−]?\d[\d.,]*', '#', s)).strip().lower()
words = lambda s: set(w for w in re.findall(r'[a-z]{3,}', s.lower()))
_meta = {}
def meta(name):
    if name not in _meta: _meta[name] = json.load(open('%s/%s.json' % (RAW, name)))
    return _meta[name]
STATS = {'kept': 0, 'lost': 0}

STOP = set('that this with from which their there these those where when what into onto over under than then they them your each every also only more most less least shown shows show here used uses using value values layer drawing picture button buttons part parts given gives give gives eqs equation equations engine annual daily mean year years soil'.split())
def kw(desc):
    head = re.split(r'[:;(]', desc)[0]
    return [w for w in re.findall(r'[a-z]{4,}', head.lower()) if w not in STOP]
def relocate(A, M, region=None):
    """new position (logical px) of the item an arrow of 1.0 pointed to: the text of version 1.1 that names it (by the
    words of its legend and the text it was drawn next to in 1.0); else the 1.0 anchor moved with its text"""
    if not A: return None
    K = kw(A.get('desc', '')); inr0 = (lambda b: region[0] <= (b['y0'] + b['y1']) / 2 <= region[1]) if region else (lambda b: True)
    best = None
    for b in M['texts']:
        if not inr0(b): continue
        wb = set(re.findall(r'[a-z]{4,}', b['t'].lower()))
        sc = (sum(1 for w in K if w in wb or any(x.startswith(w[:5]) for x in wb)) / max(1, len(K))) if K else 0
        if norm(b['t']) == A['n'] and len(re.findall(r'[a-z]', A['n'])) >= 3: sc += 0.6
        if sc > 0 and (best is None or sc > best[0] or (sc == best[0] and b['y0'] < best[1]['y0'])): best = (sc, b)
    if best and best[0] >= 0.34:
        b = best[1]; same = norm(b['t']) == A['n']
        if same and A['dist'] < 20:
            s = M['W'] / A['W']; return (min(max((b['x0'] + b['x1']) / 2 + A['dx'] * s, 4), M['W'] - 4), (b['y0'] + b['y1']) / 2 + A['dy'] * s)
        return ((b['x0'] + min(b['x1'], b['x0'] + 70)) / 2, (b['y0'] + b['y1']) / 2)
    T = M['texts']; s = M['W'] / A['W']
    cands = [b for b in T if norm(b['t']) == A['n']]
    if not cands:
        wa = words(A['t'])
        if len(wa) >= 1:
            sc = []
            for b in T:
                wb = words(b['t'])
                if not wb: continue
                j = len(wa & wb) / len(wa | wb)
                if j >= 0.5: sc.append((j, b))
            if sc:
                m = max(j for j, _ in sc); cands = [b for j, b in sc if j == m]
    if not cands: return None
    cands = sorted(cands, key=lambda b: (b['y0'], b['x0']))
    inr = (lambda b: region[0] <= (b['y0'] + b['y1']) / 2 <= region[1]) if region else (lambda b: True)
    pick = None
    if len(cands) == A.get('nocc', 1): pick = cands[min(A['occ'], len(cands) - 1)]
    if pick is None or not inr(pick):
        cr = [b for b in cands if inr(b)]
        if cr: pick = cr[min(A['occ'], len(cr) - 1)] if len(cr) > 1 else cr[0]
        elif pick is None: pick = cands[min(A['occ'], len(cands) - 1)]
    cx, cy = (pick['x0'] + pick['x1']) / 2, (pick['y0'] + pick['y1']) / 2
    dx, dy = A['dx'] * s, A['dy'] * s
    if A['dist'] > 50: dx, dy = dx * 0.6, dy * 0.6        # an item drawn away from any text: keep the direction, shorten the reach
    x, y = cx + dx, cy + dy
    return (min(max(x, 4), M['W'] - 4), y)

def trim_bottom(a):
    rows = (np.abs(a.astype(int) - 255).sum(axis=2) > 30).sum(axis=1)
    nz = np.nonzero(rows > 2)[0]; return int(nz[-1]) + 8 if len(nz) else a.shape[0]

def render(name, region, marks, out, R=None, letters=False, width=1240):
    """crop the logical region of a captured drawing, put the numbered arrows on it, save"""
    M = meta(name); im = Image.open('%s/%s.jpg' % (RAW, name)).convert('RGB'); k = im.width / M['W']
    y0, y1 = region; Hc = trim_bottom(np.asarray(im)) / k; y1 = min(y1, Hc)
    c = im.crop((0, int(y0 * k), im.width, int(y1 * k)))
    pts = [((x) * k, (y - y0) * k) for (x, y) in marks]
    if pts: c = annot.annotate(c, pts, S=2, R=R or int(11 * k), letters=letters)
    if c.width > width: c = c.resize((width, int(c.height * width / c.width)), Image.LANCZOS)
    c.save(IMG + '/' + out, quality=80, optimize=True); return out

def sections(M): return sorted(M['sec'].items(), key=lambda kv: kv[1][0])
def find_section(M, label):
    S = sections(M); L = label.lower()
    for i, (k, v) in enumerate(S):
        if k.lower().startswith(L[:28]) or L.startswith(k.lower()[:28]):
            y1 = S[i + 1][1][0] - 26 if i + 1 < len(S) else M['H']
            return (max(0, v[0] - 30), y1)
    return None

def cuts(M, ratio=1.15):
    """page-size parts of a full drawing, cut at section headings or at blank bands"""
    im = None; W = M['W']; H = M['H']; lim = W * ratio; heads = [v[0] - 28 for _, v in sections(M) if v[0] > 40]
    texts = sorted(M['texts'], key=lambda b: b['y0']); out = []; y0 = 0
    def gap_near(end):
        occ = np.zeros(int(H) + 2)
        for b in texts: occ[max(0, int(b['y0'])):int(b['y1']) + 1] = 1
        lo = int(y0 + lim * 0.6); seg = occ[lo:int(end)]
        idx = np.nonzero(seg == 0)[0]
        return lo + idx[-1] if len(idx) else end
    while y0 < H - 20:
        end = y0 + lim
        if end >= H: out.append((y0, H)); break
        hs = [h for h in heads if y0 + lim * 0.45 < h <= end]
        y1 = hs[-1] if hs else gap_near(end)
        if y1 <= y0 + 40: y1 = end
        out.append((y0, y1)); y0 = y1
    return out

# ------------------------------------------------------------------ the drawing-area screens
def draw_screen(name):
    o = OLD['draw'].get(name)
    if not o: return None, []
    sc = o['scene']; M = meta('L_' + sc)
    if o['sec']: region = find_section(M, o['label'])
    else:
        S = sections(M); first = S[0][1][0] - 30 if S else M['W'] * 1.1
        region = (0, min(first, M['W'] * 1.3) if sc in ('sid', 'drip', 'spr') else M['W'] * 1.0)
    if not region: return None, []
    marks, kept = [], []
    for A in o['anchors']:
        p = relocate(A, M, region)
        if p and region[0] - 5 <= p[1] <= region[1] + 5: marks.append(p); kept.append(A['desc']); STATS['kept'] += 1
        else: STATS['lost'] += 1
    fn = render('L_' + sc, region, marks, name + '_draw.jpg', letters=name in SP.LETTERS)
    return fn, kept

# ------------------------------------------------------------------ the full drawings, part by part, and their states
FULL = {}
def full_layer(sc):
    M = meta('L_' + sc); C = cuts(M); o = OLD['full'][sc]; parts = []
    P = [relocate(A, M) for A in o['anchors']]
    for i, (y0, y1) in enumerate(C):
        marks = [(p, A['desc']) for p, A in zip(P, o['anchors']) if p and y0 <= p[1] < y1]
        STATS['kept'] += len(marks)
        fn = render('L_' + sc, (y0, y1), [m[0] for m in marks], '%s_s0_p%d.jpg' % (sc, i + 1), letters=sc in SF.LET, R=24)
        parts.append((fn, [m[1] for m in marks], (y0, y1)))
    STATS['lost'] += sum(1 for p in P if not p)
    FULL[sc] = dict(parts=parts, P=P); return parts

def state_image(sc, cap, part_old):
    """a playback or control state: the part of the new drawing that holds the control (or the same part number)"""
    if not os.path.exists('%s/%s.json' % (RAW, cap)): return None
    M = meta(cap); C = cuts(meta('L_' + sc)); o = OLD['full'][sc]
    part = min(part_old, len(C)) - 1
    note = ' '.join(M.get('note') or [])
    if note:
        hit = [b for b in M['texts'] if norm(b['t']) and norm(b['t']) in norm(note)]
        if hit:
            yc = (hit[0]['y0'] + hit[0]['y1']) / 2
            for i, (y0, y1) in enumerate(C):
                if y0 <= yc < y1: part = i; break
    y0, y1 = C[part]
    P = [relocate(A, M) for A in o['anchors']]
    marks = [p for p in P if p and y0 <= p[1] < y1]
    return render(cap, (y0, y1), marks, '%s_p%d.jpg' % (cap, part + 1), letters=sc in SF.LET, R=24), part + 1

# ------------------------------------------------------------------ screens new in 1.1: arrows on the headings and frames
def new_layer(name, label, max_marks=8):
    M = meta(name); C = cuts(M); parts = []
    big = sorted([b for b in M['texts'] if len(re.findall(r'[A-Za-z]', b['t'])) >= 8 and (b['y1'] - b['y0']) >= 9], key=lambda b: (b['y0'], b['x0']))
    for i, (y0, y1) in enumerate(C):
        sel = []
        for b in big:
            yc = (b['y0'] + b['y1']) / 2
            if y0 <= yc < y1 and all(abs(yc - (q['y0'] + q['y1']) / 2) > 40 for q in sel): sel.append(b)
            if len(sel) >= max_marks: break
        marks = [((b['x0'] + min(b['x1'], b['x0'] + 120)) / 2, (b['y0'] + b['y1']) / 2) for b in sel]
        fn = render(name, (y0, y1), marks, '%s_p%d.jpg' % (name, i + 1), R=24)
        parts.append((fn, [b['t'].strip() for b in sel]))
    return parts

# ------------------------------------------------------------------ the text: 1.0 atlas, rewritten for 1.1
CODES = r'\((?:S[1-4]|V[1-7]|N[1-4]|E1|R1)\)'
def fix_text(s):
    s = re.sub(r'^(##+ )(?:S[1-4]|V[1-7]|N[1-4]|E1|R1) ', r'\1', s, flags=re.M)
    s = re.sub(r' ' + CODES, '', s)
    s = re.sub(r'\b(?:S[1-4]|V[1-7]|N[1-4]|E1|R1) (Surface irrigation design|Drip irrigation design|Sprinkler design and pipes)', r'\1', s)
    R = [('the Daisy simulations of the ten soils', 'the simulations of the ten soils'), ('YOUR DATA badge', 'SIMULATED badge'), ('the run of the Daisy model', 'the simulated run'),
         ('slider', 'value box'), ('Sliders', 'Value boxes'), ('the year strip', 'the year in Properties'), ('year button', 'year'), ('Press Play', 'Press Run simulation')]
    for a, b in R: s = s.replace(a, b)
    return s

def legend(items, letters=False):
    if not items: return '*No arrow on this picture: the items named in version 1.0 are drawn elsewhere in version 1.1 (see the other parts).*\n\n'
    return ''.join('- **%s** %s\n' % (chr(65 + i) if letters else i + 1, fix_text(t)) for i, t in enumerate(items)) + '\n'

def build():
    for f in glob.glob(RAW + '/ui/*.jpg'): shutil.copy(f, IMG + '/ui_' + os.path.basename(f))
    lines = OLDMD.split('\n'); out = []; i = 0
    pending = None          # legend to put in place of the next arrow list
    cur_full = None; part_no = 0
    while i < len(lines):
        L = lines[i]
        m = re.match(r'!\[(.*)\]\(images/(atlas|full)/([^)]+)\)(\{[^}]*\})?', L)
        if m:
            cap, kind, fn, attr = m.group(1), m.group(2), m.group(3), m.group(4) or ''
            cap = fix_text(cap); base = fn[:-4]
            if kind == 'atlas' and base.startswith('u'):
                nb = {'u06_properties_1': 'u06_properties_page', 'u06_properties_2': None, 'u06_properties_3': None}.get(base, base)
                if nb is None: i += 1; continue
                if os.path.exists(IMG + '/ui_' + nb + '.jpg'): out.append('![%s](images/atlas11/ui_%s.jpg)%s' % (cap, nb, attr))
                i += 1; continue
            if kind == 'atlas' and base.endswith('_full'):
                sc = re.match(r'\d+_([a-z0-9]+)', base).group(1)
                out.append('![%s](images/atlas11/ui_wb_%s.jpg)%s' % (cap, sc, attr)); i += 1; continue
            if kind == 'atlas' and base.endswith('_draw'):
                name = base[:-5]; f2, kept = draw_screen(name)
                if f2:
                    out.append('![%s](images/atlas11/%s)%s' % (cap, f2, attr)); pending = (kept, name in SP.LETTERS)
                else: pending = 'skip'
                i += 1; continue
            if kind == 'full':
                mm = re.match(r'([a-z0-9]+)_(.+)_p(\d+)$', base); sc, st, pno = mm.group(1), mm.group(2), int(mm.group(3))
                if st == 's0':
                    if sc not in FULL: full_layer(sc)
                    parts = FULL[sc]['parts']
                    if pno == 1:
                        n = len(parts)
                        for j, (fnp, items, _) in enumerate(parts):
                            out.append('![%s, part %d of %d.](images/atlas11/%s)%s' % (fix_text(cap.split(', part')[0]), j + 1, n, fnp, attr))
                            out.append(''); out.append('**What the arrows point to.**'); out.append(''); out.append(legend(items, sc in SF.LET))
                    # skip the old legend that follows this picture
                    i += 1
                    while i < len(lines) and not re.match(r'!\[|#', lines[i]):
                        i += 1
                    continue
                if re.fullmatch(r's[123]', st): cap_name = 'P_%s_%s' % (sc, st[1])
                else: cap_name = 'S_%s_%s' % (sc, st)
                r = state_image(sc, cap_name, pno)
                if r:
                    fnp, pn = r; cap2 = re.sub(r', part \d+', ', part %d' % pn, cap)
                    if cap_name.startswith('P_'):
                        note = (meta(cap_name).get('note') or [''])[0]
                        if note: cap2 = re.sub(r'\(([^)]*)\)\.?$', '(' + note.replace('Playing: ', '') + ').', cap2) if '(' in cap2 else cap2
                    out.append('![%s](images/atlas11/%s)%s' % (cap2, fnp, attr))
                i += 1; continue
        if pending is not None and re.match(r'- \*\*[0-9A-Z]+\*\* ', L):
            while i < len(lines) and re.match(r'- \*\*[0-9A-Z]+\*\* ', lines[i]): i += 1
            if pending != 'skip': out.append(legend(*pending).rstrip('\n'))
            pending = None; continue
        if L.startswith('The picture below is the complete drawing of the layer'):
            L = re.sub(r'in \d+ parts?', 'in several parts', L)
        out.append(fix_text(L)); i += 1
    md = '\n'.join(out)
    md = md.replace('# Screenshot atlas: every screen with its governing equations', '# Screenshot atlas: every screen with its governing equations')
    return md

def new_screens():
    md = '\n\n## Screens added in version 1.1\n\nThe screens below are new in version 1.1. The numbered arrows point to the headings of each part; the chapters named in each caption explain the screen and its equations.\n\n'
    for nm, title, ch in [('ui_u14_design_before_run', 'A design before its run', 'Chapter 18'), ('ui_u15_value_window', 'The value window of a design input', 'Chapter 18'), ('ui_u09_weather_import', 'Import weather data', 'Chapter 19'),
                          ('ui_u10_weather_online', 'Online weather for a location', 'Chapter 19'), ('ui_u11_report', 'Save report as PDF: choose the layers', 'Chapter 23'), ('ui_u12_sketch', 'Field sketch to design', 'Chapter 18'),
                          ('ui_u13_compare', 'The irrigation systems compared on this field', 'Chapter 18'), ('ui_u16_farm_before_run', 'The virtual farm before its design has run', 'Chapter 20'),
                          ('ui_u05_dash_charts', 'The Charts tab of a design after its run', 'Chapter 14')]:
        if os.path.exists(IMG + '/' + nm + '.jpg'): md += '### %s\n\n![%s (%s).](images/atlas11/%s.jpg){width=100%%}\n\n' % (title, title, ch, nm)
    for nm, title, txt in [('ui_u05_dash_results', 'Dashboard: the Results tab', 'The results at the working date and the 20-year averages at your inputs. Click a block header to fold or unfold it (Chapter 14).'),
                           ('ui_u05_dash_design', 'Dashboard: the Design tab', 'The results of the last run of the open design: efficiencies, depths, times, the pump or the gate and the warnings of the run (Chapters 11 to 13 and 18).'),
                           ('ui_u05_dash_charts_field', 'Dashboard: the Charts tab of the Field balance', 'The yearly charts of the twenty seasons; every chart can be folded (Chapter 14).'),
                           ('ui_u05_dash_messages', 'Dashboard: the Messages tab', 'The warnings first, then all messages of the session (Chapter 14).'),
                           ('ui_wb_sid', 'The surface irrigation design after its run', 'The whole workbench with the surface design open after Run simulation (Chapters 11 and 18).'),
                           ('ui_wb_drip', 'The drip irrigation design after its run', 'The whole workbench with the drip design open after Run simulation (Chapters 12 and 18).'),
                           ('ui_wb_spr', 'The sprinkler design after its run', 'The whole workbench with the sprinkler design open after Run simulation (Chapters 13 and 18).')]:
        if os.path.exists(IMG + '/' + nm + '.jpg'): md += '\\newpage\n\n### %s\n\n%s\n\n![%s.](images/atlas11/%s.jpg){width=100%%}\n\n' % (title, txt, title, nm)
    for nm, title, ch, eqs in [('L_farm_sid', 'Virtual farm simulation: the surface design', 'Chapter 20', '20.1, 20.2'), ('L_farm_drip', 'Virtual farm simulation: the drip design', 'Chapter 20', '20.1, 20.2'),
                               ('L_farm_spr', 'Virtual farm simulation: the sprinkler design', 'Chapter 20', '20.1, 20.2'), ('L_crop', 'Crop water requirement', 'Chapter 21', '21.1 to 21.9'),
                               ('L_yby', 'Reliability over 20 seasons', 'Chapter 22', '22.1'), ('L_wb2', 'Full water balance', 'Chapter 22', '22.1'), ('L_nb', 'Nitrogen budget', 'Chapter 22', '22.1')]:
        md += '\\newpage\n\n### %s\n\n' % title
        sc = nm[2:]
        wb = 'ui_wb_farm' if sc.startswith('farm') else 'ui_wb_' + sc
        if os.path.exists(IMG + '/' + wb + '.jpg') and sc != 'farm_drip' and sc != 'farm_spr': md += '![%s: the whole workbench.](images/atlas11/%s.jpg){width=100%%}\n\n' % (title, wb)
        md += 'The drawing of the layer from top to bottom. It is explained in %s; its equations are Eqs. %s.\n\n' % (ch, eqs)
        P = new_layer(nm, title)
        for j, (fn, items) in enumerate(P):
            md += '![%s, part %d of %d.](images/atlas11/%s){width=78%%}\n\n**What the arrows point to.**\n\n%s' % (title, j + 1, len(P), fn, ''.join('- **%d** The heading or label *%s*.\n' % (q + 1, t.replace('*', '')) for q, t in enumerate(items)) + '\n')
    return md

if __name__ == '__main__':
    md = build()
    k = md.index('## Reverse index')
    md = md[:k] + new_screens() + '\n\\newpage\n\n' + md[k:]
    open(MAN + '/chapters/25_atlas.md', 'w').write(md)
    print(STATS, len(glob.glob(IMG + '/*.jpg')), 'images')
