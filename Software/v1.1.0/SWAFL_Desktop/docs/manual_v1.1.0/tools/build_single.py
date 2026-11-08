"""Fills the crop table and the equation reference into the chapters and writes them to build/ for pandoc."""
import json, os, re, glob, subprocess, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.dirname(HERE)
EQS = json.load(open(os.path.join(HERE, 'eqs.json')))
def crop_table():
    js = "const fs=require('fs');global.window={};eval(fs.readFileSync('%s','utf8'));const L=window.CROPLIB;const r=[];for(const k in L.crops){const c=L.crops[k];r.push([c.label,c.group,c.kcIni,c.kcMid,c.kcEnd,(c.stages||[]).join('/'),c.height,c.root,c.p,c.ky])};console.log(JSON.stringify(r))" % os.path.join(M, '..', '..', 'app', 'engine', 'crops.js')
    rows = json.loads(subprocess.check_output(['node', '-e', js]).decode())
    G = {'field': 'field crop', 'perennial': 'tree, vine or palm'}
    f = lambda v, d=2: 'n/a' if v is None else (('%.' + str(d) + 'f') % v if isinstance(v, (int, float)) else str(v))
    t = 'Table 21.2. The 48 crops of the library: crop coefficients, stage lengths (initial/development/mid/late, days), plant height (m), maximum rooting depth (cm), depletion fraction $p$ and yield response factor $K_y$ (n/a when not tabulated).\n\n| Crop | Group | $K_{c,ini}$ | $K_{c,mid}$ | $K_{c,end}$ | Stages (d) | Height (m) | Root (cm) | $p$ | $K_y$ |\n|:--|:--|--:|--:|--:|:--|--:|--:|--:|--:|\n'
    for r in rows: t += '| %s | %s | %s | %s | %s | %s | %s | %s | %s | %s |\n' % (r[0], G.get(r[1], r[1]), f(r[2]), f(r[3]), f(r[4]), r[5] or 'n/a', f(r[6], 1), f(r[7], 0), f(r[8]), f(r[9]))
    return t
def eqref():
    keys = sorted(EQS, key=lambda x: [int(a) for a in x.split('.')]); out = ''
    for k in keys:
        e = EQS[k]; out += '**Eq. %s**: %s\n\n$$\n%s\n$$\n\n%s\n\n' % (k, re.sub(r'^\d+_', '', e['file']).replace('.md', '').replace('_', ' '), e['body'].strip(), e['prov'].strip())
    return out
sys_path = os.path.dirname(os.path.abspath(__file__)); import sys; sys.path.insert(0, sys_path)
from nodash_scan import split
def typo(s):
    """pandoc turns two hyphens into an en dash: number ranges become 'to', joined names keep one hyphen"""
    def f(m):
        a, b = m.group(1), m.group(2)
        return a + (' to ' if (re.search(r'\d', a) and re.search(r'\d', b)) else '-') + b
    return ''.join(c if k == 'k' else re.sub(r'([\w.)]+)--([\w.(]+)', f, c) for k, c in split(s))
def fitmath(s):
    """every display equation is set at its natural size, and shrunk to the width of the page when it is wider (no equation runs off the page)"""
    def one(m):
        body = m.group(1).strip(); tag = ''
        t = re.search(r'\\tag\{([^}]*)\}', body)
        if t: tag = t.group(1); body = (body[:t.start()] + body[t.end():]).strip()
        body = re.sub(r'\n\s*\n', '\n', body)
        return '\n```{=latex}\n\\fitmath{%s}{%s}\n```\n' % (tag, body)
    out = []
    for k, c in split(s):
        at_line = not out or out[-1].endswith('\n') or out[-1] == ''
        out.append(re.sub(r'^\$\$(.*?)\$\$$', one, c, flags=re.S) if k == 'k' and c.startswith('$$') and at_line else c)
    return ''.join(out)
# an icon and a colour for every chapter, by part of the manual: they lead the eye in the table of contents and on the chapter pages
PARTS = {'start': ('swaflblue', 'Start'), 'layer': ('partgreen', 'Layers'), 'design': ('partteal', 'Design'), 'out': ('partorange', 'Outputs'), 'data': ('partbrown', 'Data'), 'ref': ('partgrey', 'Reference'), 'daisy': ('partpurple', 'Daisy')}
ICON = {'01_install': ('start', '⚙'), '02_window': ('start', '▦'), '03_controls': ('start', '☰'), '04_dates': ('start', '◷'), '05_engine': ('start', '⚛'),
  '06_control': ('layer', '☂'), '07_field': ('layer', '⊞'), '08_structure': ('layer', '☷'), '08b_phenotyping': ('layer', '☘'), '09_mulch': ('layer', '❦'), '10_loops': ('layer', '♻'),
  '11_surface': ('design', '☔'), '12_drip': ('design', '✚'), '13_sprinkler': ('design', '❄'), '13b_drainage': ('design', '≋'),
  '14_dashboard': ('out', '▤'), '15_workflows': ('out', '✔'), '16_exports': ('out', '✎'), '17_limits': ('out', '⚠'), '18_runs': ('out', '⚑'),
  '19_weather': ('data', '☀'), '20_field': ('data', '⊞'), '21_crops': ('data', '✿'), '22_seasonal': ('data', '◷'), '22b_layer_reference': ('layer', '☷'), '23_reports': ('out', '✎'),
  '24_changes': ('ref', '★'), '25_atlas': ('ref', '▥'),
  '26_daisy_overview': ('daisy', '⚘'), '27_daisy_data': ('daisy', '☀'), '28_daisy_ask': ('daisy', '❖'), '29_daisy_combos': ('daisy', '⚖'), '30_daisy_results': ('daisy', '▤'), '30z_daisy_flow': ('daisy', '⚑'), '31_daisy_build': ('daisy', '⚙'), '31b_daisy_learn': ('daisy', '✎'),
  '32_daisy_topics': ('daisy', '☰'), '33_daisy_params': ('daisy', '⚗'), '34_daisy_factors': ('daisy', '⚖'), '35_daisy_library': ('daisy', '❦'), '36_daisy_stations': ('daisy', '☁'), '37_daisy_index': ('daisy', '☰'), '38_daisy_help': ('daisy', '⚠'), '90_appendices': ('ref', '▦')}
def icon(name, s):
    k = ICON.get(name)
    if not k: return s
    col, ch = PARTS[k[0]][0], k[1]
    rep = '# `\\texorpdfstring{\\chapicon{%s}{%s}}{}`{=latex}' % (col, ch)
    return re.sub(r'^# (?!.*\{-\})', lambda m: rep, s, count=1, flags=re.M)
B = M + '/build'; shutil.rmtree(B, ignore_errors=True); os.makedirs(B)
for f in sorted(glob.glob(M + '/chapters/*.md')):
    s = open(f).read()
    if '{{CROPTABLE}}' in s: s = s.replace('{{CROPTABLE}}', crop_table())
    if '{{EQREF}}' in s: s = s.replace('{{EQREF}}', eqref())
    open(B + '/' + os.path.basename(f), 'w').write(icon(os.path.basename(f)[:-3], fitmath(typo(s))))
print('chapters', len(glob.glob(B + '/*.md')))
