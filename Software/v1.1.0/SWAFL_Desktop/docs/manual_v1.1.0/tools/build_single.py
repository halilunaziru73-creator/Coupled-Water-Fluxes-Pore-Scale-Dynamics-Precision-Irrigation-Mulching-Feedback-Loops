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
B = M + '/build'; shutil.rmtree(B, ignore_errors=True); os.makedirs(B)
for f in sorted(glob.glob(M + '/chapters/*.md')):
    s = open(f).read()
    if '{{CROPTABLE}}' in s: s = s.replace('{{CROPTABLE}}', crop_table())
    if '{{EQREF}}' in s: s = s.replace('{{EQREF}}', eqref())
    open(B + '/' + os.path.basename(f), 'w').write(typo(s))
print('chapters', len(glob.glob(B + '/*.md')))
