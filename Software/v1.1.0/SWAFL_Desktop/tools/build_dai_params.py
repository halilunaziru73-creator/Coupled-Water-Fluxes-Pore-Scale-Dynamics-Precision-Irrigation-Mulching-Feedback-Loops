"""Index of the parameters ${name} and placeholders {name} of the bundled Daisy set-up files, for the Placeholders panel of
   the set-up editor: what each one means (from its declare line), its default, the values the files give it, and the
   names that a set-up can refer to (columns, crops, chemicals, biopores, horizons, organic matter).
   python3 tools/build_dai_params.py  ->  app/data/daisy/daiparams.json"""
import os, re, json, glob
H = os.path.dirname(os.path.abspath(__file__)) + '/..'; D = H + '/app/data/daisy/dai'
files = sorted(glob.glob(D + '/**/*.dai', recursive=True))
ph, decl, vals, defs = set(), {}, {}, {}
STR = r'"((?:[^"\\]|\\.)*)"'
for f in files:
    t = open(f, encoding='utf-8', errors='replace').read(); rel = os.path.relpath(f, D)
    for m in re.finditer(r'\$?\{([A-Za-z_]\w*)\}', t): ph.add(m.group(1))
    for m in re.finditer(r'\(declare\s+([A-Za-z_]\w*)\s+([A-Za-z_]\w*)\s+' + STR, t, re.S):
        n = m.group(1); d = decl.setdefault(n, {'type': m.group(2), 'doc': re.sub(r'\s+', ' ', m.group(3).replace('\\"', '"').replace('\\\n', ' ')).strip(), 'files': []})
        if rel not in d['files']: d['files'].append(rel)
    for m in re.finditer(r'\(def([a-z_]+)\s+(?:' + STR + r'|([A-Za-z_][\w\-.+]*))', t):
        k, n = m.group(1), m.group(2) if m.group(2) is not None else m.group(3)
        lst = defs.setdefault(k, [])
        if n not in lst: lst.append(n)
ph = sorted(ph)
for n in ph:
    for f in files:
        t = open(f, encoding='utf-8', errors='replace').read()
        for m in re.finditer(r'\(' + re.escape(n) + r'\s+(?:' + STR + r'|(-?[\d.]+(?:[eE][-+]?\d+)?)(?:\s*\[([^\]]*)\])?)\s*\)', t):
            v = m.group(1) if m.group(1) is not None else m.group(2) + (' [' + m.group(3) + ']' if m.group(3) else '')
            if '${' in v or len(v) > 60: continue
            lst = vals.setdefault(n, [])
            if v not in lst: lst.append(v)
        if re.search(r'\(' + re.escape(n) + r'\s+\((cond|value|dimension|apply)\b', t): decl.setdefault(n, {'type': 'string', 'doc': '', 'files': []})['auto'] = True
keep = {k: sorted(v, key=str.lower)[:400] for k, v in defs.items() if k in ('column', 'crop', 'chemical', 'biopore', 'horizon', 'am', 'irrigate', 'weather', 'log', 'summary')}
out = {'placeholders': ph, 'declare': {k: decl[k] for k in decl if k in ph}, 'values': vals, 'defs': keep}
open(H + '/app/data/daisy/daiparams.json', 'w').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(len(ph), 'placeholders;', len(out['declare']), 'declared;', {k: len(v) for k, v in keep.items()})
# every attribute of the Daisy reference manual by its name (meaning, unit, model), read when a placeholder stands for one
R = H + '/app/data/daisy/ref'; A = {}
for f in sorted(glob.glob(R + '/ch*.json')):
    c = json.load(open(f))
    for s in [dict(c, id=str(c['n']), name=c['title'])] + c.get('sections', []):
        for a in s.get('attrs', []):
            n = re.sub(r'\s+', '_', (a.get('name') or '').strip());
            if not n: continue
            lst = A.setdefault(n, [])
            if len(lst) < 3: lst.append([re.sub(r'\s+', ' ', a.get('doc', ''))[:220], a.get('unit', ''), a.get('type', '')[:60], str(s.get('id', '')) + ' ' + str(s.get('name', ''))])
open(H + '/app/data/daisy/refattrs.json', 'w').write(json.dumps(A, ensure_ascii=False, separators=(',', ':')))
print(len(A), 'attributes of the reference manual')
