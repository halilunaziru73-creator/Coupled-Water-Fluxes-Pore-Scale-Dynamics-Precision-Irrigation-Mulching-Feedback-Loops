"""Arranges the end of every chapter in the order of the classic textbook:
EXERCISES -> FURTHER EXERCISES -> ESSAY QUESTIONS -> DO YOU KNOW ? -> OBJECTIVE TYPE QUESTIONS (ANSWERS)
-> EXERCISES IN SWAFL -> the picture that opens SWAFL.  Idempotent."""
import re, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in ['chpore'] + ['ch%02d' % i for i in range(1, 23)]:
    k = '00' if f == 'chpore' else f[2:]
    p = os.path.join(D, f + '.tex'); s = open(p).read()
    s = s.replace('\\IfFileExists{extra/more%s.tex}{\\input{extra/more%s}}{}\n' % (k, k), '')
    hx = '\\IfFileExists{extra/more%sx.tex}{\\input{extra/more%sx}}{}\n' % (k, k)
    hs = '\\IfFileExists{extra/more%ss.tex}{\\input{extra/more%ss}}{}\n' % (k, k)
    s = s.replace(hx, '').replace(hs, '')
    i = s.rindex('\\swaflvideo'); s = s[:i] + hs + s[i:]
    m = None
    for pat in [r'\\IfFileExists\{extra/dyk\d+', r'\\dykband\{DO YOU KNOW', r'\\IfFileExists\{extra/obj\d+', r'\\backhead\{OBJECTIVE']:
        m = re.search(pat, s)
        if m: break
    j = m.start() if m else s.index(hs)
    pre = '' if (j == 0 or s[j - 1] == '\n') else '\n'
    s = s[:j] + pre + hx + s[j:]
    open(p, 'w').write(s)
print('arranged')
