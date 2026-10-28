"""Removes dashes from the prose of the chapters: no em dash, no en dash, no spaced hyphen. Math, code, links and image paths are left alone.
Usage: python3 tools/nodash.py chapters/*.md   (rewrites in place; run tools/nodash.py --check to list what is left)"""
import re, sys, glob
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from nodash_scan import split
def fix_prose(c):
    c = c.replace('Soil–Water–Atmosphere–Field–Loop', 'Soil Water Atmosphere Field Loop')
    c = c.replace('[–]', '[1]')
    c = re.sub(r'(?m)^(#+ .*?) [—–] ', r'\1: ', c)
    c = re.sub(r'\|\s*[—–]\s*(?=\|)', '| n/a ', c)
    c = re.sub(r'\s+[—–]\s+', ', ', c)
    c = re.sub(r'—', ', ', c)
    c = re.sub(r'(?<=[\d\)%])–(?=[\d\(])', ' to ', c)
    def chain(m):
        parts = m.group(0).split('–')
        if parts[0][-1:].isdigit(): return ' to '.join(parts)
        return ', '.join(parts[:-1]) + ' and ' + parts[-1] if len(parts) > 2 else ' and '.join(parts)
    c = re.sub(r'[A-Za-z][\w]*(?:–[A-Za-z0-9][\w]*)+', chain, c)
    c = c.replace('–', ' to ')
    c = c.replace(' - ', ' minus ')
    return c
def run(files):
    for f in files:
        t = open(f, encoding='utf-8').read(); head = ''
        if t.startswith('---'): i = t.index('---', 3) + 3; head, t = t[:i], t[i:]
        t = ''.join(c if k == 'k' else fix_prose(c) for k, c in split(t))
        open(f, 'w', encoding='utf-8').write(head + t)
if __name__ == '__main__':
    if sys.argv[1:2] == ['--check']:
        import subprocess; print(subprocess.run(['python3', __file__.rsplit('/', 1)[0] + '/nodash_scan.py'], capture_output=True, text=True).stdout)
    else: run(sys.argv[1:])
