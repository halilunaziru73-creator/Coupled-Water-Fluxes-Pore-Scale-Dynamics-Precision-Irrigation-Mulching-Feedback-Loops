#!/usr/bin/env python3
"""Make editable Word (.docx) versions of the papers and supplements from their LaTeX source with pandoc.
Equations become real Word equations; citations are resolved from refs.bib; figures are embedded.
Usage: python3 make_docx.py OUTDIR [p1 p2 ... s5]   (needs pandoc >= 3.1)"""
import os, re, shutil, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
out = os.path.abspath(sys.argv[1]); names = sys.argv[2:] or ['p1','p2','p3','p4','s1','s2','s3','s4','s5']
os.makedirs(out, exist_ok=True)
SUB = [(r'\\Bigl|\\biggl|\\Biggl|\\bigl', r'\\left'), (r'\\Bigr|\\biggr|\\Biggr|\\bigr', r'\\right'),
       (r'\\label\{[^}]*\}', ''), (r'\\allowbreak|\\,|\;|\\:|\\!', ' '), (r'\\\s*\n\s*\\right', r'\\right')]
tmp = tempfile.mkdtemp()
for f in os.listdir(HERE):
    if f.endswith(('.tex', '.bib', '.bst', '.sty')):
        s = open(os.path.join(HERE, f), encoding='utf8', errors='ignore').read()
        if f.endswith('.tex'):
            def fix(m):
                t = m.group(0)
                for a, b in SUB: t = re.sub(a, b, t)
                return t
            s = re.sub(r'\\begin\{(equation|align|aligned|gather|multline|eqnarray)\*?\}.*?\\end\{\1\*?\}', fix, s, flags=re.S)
            s = re.sub(r'\$[^$\n]+\$', fix, s)
        open(os.path.join(tmp, f), 'w', encoding='utf8').write(s)
for n in names:
    cmd = ['pandoc', os.path.join(tmp, n + '.tex'), '-f', 'latex', '-t', 'docx', '--citeproc', '--bibliography=' + os.path.join(tmp, 'refs.bib'),
           '--resource-path=' + ':'.join([tmp, os.path.join(HERE, '..', 'figures'), os.path.join(HERE, '..', 'figures', 'paper4'), os.path.join(HERE, '..', 'figures', 'p1')]),
           '-o', os.path.join(out, n + '.docx')]
    r = subprocess.run(cmd, capture_output=True, text=True)
    bad = r.stderr.count('Could not convert TeX math')
    print(n, 'ok' if r.returncode == 0 else 'FAILED', 'equations kept as TeX text:', bad)
shutil.rmtree(tmp)
