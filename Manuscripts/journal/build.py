#!/usr/bin/env python3
"""Expands journal/src/*.tex into journal/*.tex and builds the PDFs.

A line  %%PULL <file in ../tex> <label> [side]  is replaced by the figure or table
environment of the original manuscript that carries that label, copied verbatim, so that
no number of a table or caption is retyped. 'side' turns a full-page landscape figure into
a sidewaysfigure. Usage: python3 build.py [name ...]   (default: all four)."""
import re, sys, subprocess, pathlib, shutil
J = pathlib.Path(__file__).resolve().parent
T = J.parent / 'tex'

def env_with_label(text, label):
    i = text.find('\\label{' + label + '}')
    if i < 0: raise SystemExit('label not found: ' + label)
    best = None
    for m in re.finditer(r'\\begin\{(figure|table)\*?\}', text[:i]):
        best = m
    if best is None: raise SystemExit('no environment around ' + label)
    kind = best.group(1)
    depth, j = 0, best.start()
    pat = re.compile(r'\\(begin|end)\{' + kind + r'\*?\}')
    for m in pat.finditer(text, best.start()):
        depth += 1 if m.group(1) == 'begin' else -1
        if depth == 0:
            j = m.end(); break
    return text[best.start():j]

def pull(line):
    parts = line.split()
    src, label, opts = parts[1], parts[2], parts[3:]
    block = env_with_label((T / src).read_text(encoding='utf-8'), label)
    block = re.sub(r'\\begin\{(figure|table)\}\[[^\]]*\]', r'\\begin{\1}[!htbp]', block, count=1)
    if 'side' in opts:
        block = block.replace('\\begin{figure}[!htbp]', '\\begin{sidewaysfigure}').replace('\\end{figure}', '\\end{sidewaysfigure}')
        block = re.sub(r'width=24\.6cm', r'width=0.97\\textheight', block)
    # references to sections of the long manuscripts do not exist in the journal versions
    block = re.sub(r'\s*\(Section~\\ref\{[^}]*\}\)', '', block)
    return block

def expand(name):
    s = (J / 'src' / (name + '.tex')).read_text(encoding='utf-8')
    numeric = 'authoryear' not in s.split('\n', 1)[0]
    out = []
    for line in s.split('\n'):
        if line.strip().startswith('%%PULL'):
            b = pull(line.strip())
            if numeric: b = re.sub(r'\\cite[tp]\{', r'\\cite{', b)
            out.append(b)
        else:
            out.append(line)
    (J / (name + '.tex')).write_text('\n'.join(out), encoding='utf-8')

def build(name):
    expand(name)
    run = lambda c: subprocess.run(c, cwd=J, capture_output=True, text=True)
    run(['xelatex', '-interaction=nonstopmode', name + '.tex'])
    b = run(['bibtex', name]); print(''.join(l + '\n' for l in b.stdout.split('\n') if 'Warning' in l or 'error' in l.lower())[:1500])
    run(['xelatex', '-interaction=nonstopmode', name + '.tex'])
    r = run(['xelatex', '-interaction=nonstopmode', name + '.tex'])
    issues = [l for l in r.stdout.split('\n') if l.startswith('!') or 'undefined' in l or 'Output written' in l]
    print(name, '\n'.join(issues[:30]))

if __name__ == '__main__':
    names = sys.argv[1:] or ['AWM_Paper1', 'AWM_Paper4', 'SoftwareX_SWAFL']
    for n in names: build(n)
