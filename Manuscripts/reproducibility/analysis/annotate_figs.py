"""Numbered callouts on every figure of the four articles, in the style of the SWAFL manual. Vector figures get a callout on each
panel letter (read from the PDF text layer); screen captures get callouts on the headings and controls read by OCR (tesseract).
Writes Manuscripts/figures/annot/<paper>_<label>_<k>.png and Manuscripts/results/annot_<paper>.json."""
import os, re, json, subprocess, tempfile, glob
from PIL import Image, ImageDraw, ImageFont, ImageOps
from wordfreq import zipf_frequency
DOMAIN = {'ndvi', 'gndvi', 'evi', 'savi', 'ndwi', 'ndre', 'daisy', 'swafl', 'rusle', 'soilgrids', 'sentinel', 'evapotranspiration', 'phenotyping', 'dss', 'csv', 'kpa', 'dlf', 'dai', 'leaflet', 'sprinkler', 'sprinklers', 'lateral', 'laterals', 'emitter', 'emitters', 'mulch', 'mulched', 'tillage', 'drainage', 'infiltration', 'zaria', 'tensiometer', 'kc', 'etc', 'loam', 'wetting', 'subsoil', 'agronomy'}
STOP = {'the', 'of', 'a', 'at', 'and', 'to', 'in', 'with', 'are', 'has', 'is', 'on', 'for', 'by', 'or', 'an', 'its', 'this', 'that', 'from', 'as'}
def clean(t):
    t = re.sub(r'^[^A-Za-z0-9(]+', '', t); t = re.sub(r'^(?:[A-Za-z]|\d)\s+(?=[A-Z])', '', t).strip(' .,;:')
    if t.count('(') != t.count(')'): return None
    ws = [w.lower() for w in re.findall(r'[A-Za-z]+', t)]
    if not ws or ws[-1] in STOP or ws[0] in STOP or sum(w not in STOP for w in ws) < 1: return None
    toks = re.findall(r"[A-Za-z]+", t)
    if not toks or re.search(r"[|_\[\]{}~\u2018\u2019@#]", t): return None
    for w in toks:
        if len(w) >= 3 and w.lower() not in DOMAIN and zipf_frequency(w.lower(), 'en') < 3.0: return None
    return t
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')); M = os.path.join(ROOT, 'Manuscripts'); TEX = os.path.join(M, 'tex')
OUT = os.path.join(M, 'figures/annot'); os.makedirs(OUT, exist_ok=True)
RED = (179, 38, 30)
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: FONT = ImageFont.load_default()
def expand(f):
    s = open(os.path.join(TEX, f)).read()
    def inc(m):
        n = m.group(1) if m.group(1).endswith('.tex') else m.group(1) + '.tex'
        return expand(n) if n != 'pre.tex' and os.path.exists(os.path.join(TEX, n)) else ''
    return re.sub(r'\\input\{([^}]+)\}', inc, s)
def raster(path):
    if path.endswith('.pdf'):
        d = tempfile.mkdtemp(); subprocess.run(['pdftoppm', '-r', '110', '-png', '-singlefile', path, os.path.join(d, 'x')], check=True)
        return Image.open(os.path.join(d, 'x.png')).convert('RGB'), 110 / 72
    im = Image.open(path).convert('RGB')
    if im.width > 1700: k = 1700 / im.width; im = im.resize((1700, int(im.height * k)))
    return im, None
def panel_anchors(pdf, scale):
    txt = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
    words = [(m.group(5), float(m.group(1)), float(m.group(2))) for m in re.finditer(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', txt)]
    found = {}
    for w, x, y in words:
        if re.fullmatch(r'[a-l]', w) and w not in found: found[w] = (x * scale, y * scale)
    out = []
    for ch in 'abcdefghijkl':
        if ch in found: out.append(('panel', ch, found[ch]))
        else: break
    return out
def ocr_anchors(im, k=6):
    d = tempfile.mkdtemp(); p = os.path.join(d, 'x.png'); g = ImageOps.grayscale(im); g = g.resize((int(g.width * 1.6), int(g.height * 1.6))); g.save(p); f = 1.6
    tsv = subprocess.run(['tesseract', p, 'stdout', '--psm', '11', 'tsv'], capture_output=True, text=True).stdout.splitlines()[1:]
    lines = {}
    for r in tsv:
        c = r.split('\t')
        if len(c) < 12 or not c[11].strip(): continue
        try: conf = float(c[10])
        except ValueError: continue
        if conf < 75: continue
        key = (c[2], c[3], c[4]); x, y, w, h = [int(int(v) / f) for v in c[6:10]]
        L = lines.setdefault(key, {'w': [], 'x': x, 'y': y, 'h': h})
        L['w'].append(c[11]); L['x'] = min(L['x'], x); L['y'] = min(L['y'], y); L['h'] = max(L['h'], h)
    cand = []
    for L in lines.values():
        t = ' '.join(L['w']).strip(' :|-')
        t = clean(t) if t else None
        if t and 5 <= len(t) <= 42 and 1 <= len(L['w']) <= 6 and re.search(r'[A-Za-z]{3}', t) and sum(ch.isalpha() or ch == ' ' for ch in t) / len(t) > 0.75:
            cand.append((t, (L['x'], L['y'] + L['h'] / 2), L['h']))
    cand.sort(key=lambda c: -c[2])
    chosen = []
    for t, xy, h in cand:   # spread the callouts over the picture
        if all((xy[0] - q[2][0]) ** 2 + (xy[1] - q[2][1]) ** 2 > (0.18 * max(im.size)) ** 2 for q in chosen) and all(t.lower() != q[1].lower() for q in chosen):
            chosen.append(('text', t, xy))
        if len(chosen) >= k: break
    return sorted(chosen, key=lambda q: (round(q[2][1] / 120), q[2][0]))
def draw(im, anchors):
    dr = ImageDraw.Draw(im); r = 13
    for n, (_, _, (x, y)) in enumerate(anchors, 1):
        cx = max(r + 2, x - 26); cy = max(r + 2, y - 22)
        if abs(cx - x) < 4 and abs(cy - y) < 4: cx = x + 24
        dr.line([(cx, cy), (x, y)], fill=RED, width=2)
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill='white', outline=RED, width=3)
        t = str(n); bw = dr.textlength(t, font=FONT); dr.text((cx - bw / 2, cy - 9), t, fill=RED, font=FONT)
    return im
for p in ['p1', 'p2', 'p3', 'p4']:
    src = expand(p + '.tex'); res = {}
    for env in re.finditer(r'\\begin\{figure\}(.*?)\\end\{figure\}', src, re.S):
        b = env.group(1); m = re.search(r'\\label\{(fig:[^}]+)\}', b)
        if not m: continue
        L = m.group(1); files = re.findall(r'\\includegraphics(?:\[[^]]*\])?\{([^}]+)\}', b)
        if p == 'p4' and L != 'fig:soft': continue      # Paper 4 data figures carry hand-placed callouts (p4_reach.py, p4_concept.py)
        items = []
        for k, g in enumerate(files):
            path = g.replace('\\figdir', os.path.join(M, 'figures'))
            if not os.path.exists(path): continue
            im, scale = raster(path)
            anchors = panel_anchors(path, scale) if path.endswith('.pdf') else []
            if not anchors: anchors = ocr_anchors(im, 6 if len(files) == 1 else 4)
            if not anchors: continue
            out = os.path.join(OUT, '%s_%s_%d.png' % (p, L.replace(':', '-'), k)); draw(im, anchors).save(out)
            items.append({'file': os.path.relpath(out, TEX), 'labels': [{'kind': a[0], 'text': a[1]} for a in anchors]})
        res[L] = items
    json.dump(res, open(os.path.join(M, 'results/annot_%s.json' % p), 'w'), indent=1)
    print(p, len(res), 'figures', sum(len(v) for v in res.values()), 'images', sum(len(i['labels']) for v in res.values() for i in v), 'labels')
