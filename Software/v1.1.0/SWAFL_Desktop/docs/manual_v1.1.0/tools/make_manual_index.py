"""The index of the manual for the program: every chapter and section with its page in the PDF, written to app/data/manual_index.json.
The program opens the manual at the page of the screen in use. usage: python3 tools/make_manual_index.py (after build.sh)"""
import json, os, re, subprocess, glob
M = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf = os.path.join(M, 'SWAFL_Manual_v1.1.0.pdf')
pages = subprocess.check_output(['pdftotext', '-layout', pdf, '-']).decode('utf8', 'replace').split('\f')
norm = lambda t: re.sub(r'\s+', ' ', re.sub(r'[`*_{}\\$]|\{#[^}]*\}', '', t)).strip().lower()
heads = []
for f in sorted(glob.glob(os.path.join(M, 'build', '*.md'))):
    code = False
    for line in open(f, encoding='utf8'):
        if line.startswith('```'): code = not code; continue
        if code: continue
        m = re.match(r'^(#{1,3}) (.*)$', line.rstrip())
        if not m: continue
        t = re.sub(r'`[^`]*`\{=latex\}', '', m.group(2)); anchor = (re.search(r'\{#([\w-]+)\}', t) or [None, None])[1]; t = re.sub(r'\{[^}]*\}', '', t).strip()
        heads.append({'level': len(m.group(1)), 'title': t, 'id': anchor, 'file': os.path.basename(f)})
P = [norm(p) for p in pages]
# the table of contents takes the first pages: the search starts after it, and goes forward only
start = next((i for i, p in enumerate(P) if 'about this manual' in p and i > 5), 20)
k = start; out = []
for h in heads:
    key = norm(h['title'])[:60]
    if not key: continue
    for j in range(k, min(len(P), k + 400)):
        if key in P[j]: k = j; out.append(dict(h, page=j + 1)); break
json.dump({'pdf': 'SWAFL_Manual_v1.1.0.pdf', 'pages': len(pages) - 1, 'sections': out}, open(os.path.join(M, '..', '..', 'app', 'data', 'manual_index.json'), 'w'), ensure_ascii=False, indent=0)
print('sections', len(out), 'of', len(heads), 'pages', len(pages) - 1)
