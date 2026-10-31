"""Reads the text of the Daisy Program Reference Manual (pdftotext -layout) and writes app/data/daisy/ref/:
   index.json  = parts, chapters (number, title, part, models with counts), bibliography file name
   chNNN.json  = one chapter: intro, sections {id,name,desc,used,sig,attrs[{name,type,unit,kind,doc}],text}
   biblio.json = the reference list.
   python3 tools/build_reference.py ref.txt"""
import re, sys, json, os
H = os.path.dirname(os.path.abspath(__file__)) + '/../app/data/daisy/ref'; os.makedirs(H, exist_ok=True)
raw = open(sys.argv[1], errors='ignore').read().replace('\f', '\n')
L = raw.split('\n')
# ---- clean page furniture
out = []
for l in L:
    s = l.strip()
    if re.fullmatch(r'\d{1,3}', s): continue                                  # page number alone
    if re.match(r'^\d{1,3}\s+CHAPTER \d+\. ', s) or re.match(r'^\d{1,3}\s+(CONTENTS|BIBLIOGRAPHY)', s): continue
    if re.match(r'^\d+\.\d+(\.\d+)?\.\s+.+\s+\d{1,3}$', s): continue         # "8.4. AOM-SLOW   55"
    if re.match(r'^(CONTENTS|CHAPTER \d+\.).*\s\d{1,3}$', s): continue
    out.append(l.rstrip())
# find the start of the body (first "Chapter 1" after the contents) and of the bibliography
def idx(pred, start=0):
    for i in range(start, len(out)):
        if pred(out[i]): return i
    return len(out)
iBody = idx(lambda l: l.strip() == 'Chapter 1', 400)
iBib = len(out) - 1
for i in range(len(out) - 1, iBody, -1):
    if out[i].strip() == 'Bibliography': iBib = i; break
body = out[iBody:iBib]
# ---- split chapters
ch = []; cur = None; i = 0
while i < len(body):
    m = re.fullmatch(r'Chapter (\d+)', body[i].strip())
    if m:
        j = i + 1
        while j < len(body) and not body[j].strip(): j += 1
        cur = {'n': int(m.group(1)), 'title': body[j].strip(), 'lines': []}; ch.append(cur); i = j + 1; continue
    if cur is not None: cur['lines'].append(body[i])
    i += 1
PARTS = {1: 'I  The Framework', 7: 'II  The Components'}
KIND = re.compile(r'^(Optional |)(Parameter|State variable|Log variable|Const|Constant|Fixed|Submodel|Component)|^(Parameter|State variable|Log variable)', re.I)
ATTR = re.compile(r'^(\s{4,8})(\S[^:]{0,60}?)\s*:\s+(\S.*)$')
JUNK = re.compile(r'^\s*[-+0-9.eE]+(\s+[-+0-9.eE]+)*\s*$')
def clean_block(lines):
    r = []; blank = 0
    for l in lines:
        if JUNK.match(l) or re.match(r'^\s*\(?\d+(\.\d+)? *\[', l) and False: continue
        if not l.strip():
            blank += 1
            if blank > 1: continue
        else: blank = 0
        r.append(l)
    return '\n'.join(r).strip()
BUL = '\u0088'
HDR = re.compile(r'^\s{2,9}(?:[\u0088\u2022\u00b7]\s*)?(\S[^:\n]{0,70}?)\s*:\s+((?:number|string|integer|boolean|plf|submodel|fixed|file|time)\b.*|.*\bcomponent\b.*|.*\(see chapter.*|.*\[.*\].*)$')
KINDW = re.compile(r'^(Optional |)(parameter|state variable|log variable|const|submodel|fixed|component)\b|^(Parameter|State variable|Log variable|Const)', re.I)
LOGH = re.compile(r'^\s*(Log Variables|Table columns.*:)\s*$')
def parse_attrs(lines):
    attrs = []; k = 0; n = len(lines); inlog = False   # after a "Log Variables" heading the variables carry no kind line of their own
    def ishdr(i):
        if i >= n: return None
        l = lines[i]
        if l.lstrip().startswith(('(', '<', ';')): return None
        m = HDR.match(l)
        if m and (m.group(1).strip().lstrip(BUL).strip() == 'Value description' or ']' in m.group(1) or '. ' in m.group(1)): return None   # a line of the description, not a new attribute
        return m
    while k < n:
        if LOGH.match(lines[k]): inlog = 'Table column (written in the log file)' if 'Table' in lines[k] else 'Log variable'; k += 1; continue
        m = ishdr(k)
        if m:
            name = m.group(1).strip().lstrip(BUL).strip(); rest = m.group(2).strip()
            u = re.search(r'\[([^\]]*)\]', rest); unit = u.group(1).strip() if u else ''
            k += 1; kind = ''
            while k < n and not lines[k].strip(): k += 1
            if k < n and KINDW.match(lines[k].strip()): kind = lines[k].strip(); k += 1
            d = []
            while k < n and not ishdr(k) and not LOGH.match(lines[k]): d.append(lines[k]); k += 1
            if not kind and inlog: kind = inlog
            if not kind and re.search(r'\bcomponent\b', rest): kind = 'Component'               # arrays and single components carry no kind line in the manual
            if not kind and re.match(r'(submodel|fixed)\b', rest): kind = 'Submodel'
            attrs.append({'name': name, 'type': rest, 'unit': unit, 'kind': kind, 'doc': re.sub(r'\n{2,}', '\n', clean_block(d)).replace(BUL, '')})
        else: k += 1
    return attrs
def split_sections(c):
    n = c['n']; secs = []; intro = []; cur = None
    pat = re.compile(r'^(%d(?:\.\d+){1,2})\s{2,}(\S.*)$' % n)
    for l in c['lines']:
        m = pat.match(l.strip()) if not l.startswith('   ') or True else None
        m = pat.match(l)
        if m: cur = {'id': m.group(1), 'name': m.group(2).strip(), 'lines': []}; secs.append(cur); continue
        (cur['lines'] if cur else intro).append(l)
    return clean_block(intro), secs
res = []
for c in ch:
    intro, secs = split_sections(c)
    sections = []
    for s in secs:
        t = '\n'.join(s['lines']); lines = s['lines']
        # signature: from first line starting with '<' to the line holding the closing '>'
        sig = ''; a = next((k for k, l in enumerate(lines) if l.strip().startswith('<')), None)
        sigend = a
        if a is not None:
            k = a; depth = 0
            while k < len(lines):
                depth += lines[k].count('<') - lines[k].count('>')
                if depth <= 0 or '>' in lines[k] and lines[k].rstrip().endswith('>'): break
                k += 1
            sigend = k; sig = '\n'.join(x.rstrip() for x in lines[a:k + 1])
        # a model without a signature (summary columns, for example) still lists its variables: they start at the first attribute line
        f0 = None if a is not None else next((k for k, l in enumerate(lines) if HDR.match(l) and not l.lstrip().startswith(('(', '<', ';'))), None)
        desc_lines = lines[:a] if a is not None else (lines[:f0] if f0 is not None else lines)
        if f0 is not None:   # include the "Table columns:" heading that announces them
            h0 = next((k for k in range(f0 - 1, -1, -1) if LOGH.match(lines[k])), None)
            if h0 is not None: desc_lines = lines[:h0]; f0 = h0
        desc = clean_block(desc_lines)
        used = ''; mu = re.search(r'Used by (.*?)(?:\n\s*\n|$)', desc, re.S)
        if mu: used = re.sub(r'\s+', ' ', mu.group(1)).strip(); desc = (desc[:mu.start()] + desc[mu.end():]).strip()
        attrs = parse_attrs(lines[sigend + 1:] if sigend is not None else (lines[f0:] if f0 is not None else []))
        sections.append({'id': s['id'], 'name': s['name'], 'desc': re.sub(r'[ \t]+\n', '\n', desc), 'used': used, 'sig': sig, 'attrs': attrs, 'text': clean_block(lines)})
    # component-level signature/log variables of a library chapter sit in the intro
    il = intro.split('\n'); ia = next((k for k, l in enumerate(il) if l.strip().startswith('<')), None)
    cattrs = parse_attrs(il[ia:] if ia is not None else il)
    res.append({'n': c['n'], 'title': c['title'], 'part': 'I' if c['n'] < 7 else 'II', 'intro': intro, 'attrs': cattrs, 'sections': sections})
idxj = []
for c in res:
    json.dump(c, open('%s/ch%03d.json' % (H, c['n']), 'w'), ensure_ascii=False, separators=(',', ':'))
    idxj.append({'n': c['n'], 'title': c['title'], 'part': c['part'], 'models': [[s['id'], s['name'], len(s['attrs'])] for s in c['sections']]})
bib = clean_block(out[iBib + 1:])
refs = re.split(r'\n(?=\[[^\]]+\] )', bib)
json.dump(refs, open(H + '/biblio.json', 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump({'title': 'Daisy Program Reference Manual', 'author': 'Per Abrahamsen', 'date': 'August 31, 2026', 'parts': [{'id': 'I', 'title': 'The Framework', 'from': 1, 'to': 6}, {'id': 'II', 'title': 'The Components', 'from': 7, 'to': len(res)}], 'chapters': idxj, 'refs': len(refs)}, open(H + '/index.json', 'w'), ensure_ascii=False, separators=(',', ':'))
na = sum(len(s['attrs']) for c in res for s in c['sections']); ns = sum(len(c['sections']) for c in res)
print(len(res), 'chapters', ns, 'sections', na, 'attributes', len(refs), 'references')
