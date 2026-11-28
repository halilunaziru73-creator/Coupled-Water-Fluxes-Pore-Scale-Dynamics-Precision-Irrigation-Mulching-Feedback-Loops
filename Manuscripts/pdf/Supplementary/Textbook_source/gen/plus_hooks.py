"""Hooks the expansion files into the chapters (idempotent): extra/deepNN.tex before the closing material of the
chapter (summary, projects, exercises) and extra/moreNN.tex (further exercises, essays, SWAFL exercises) before the
closing SWAFL picture."""
import re, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in ['chpore'] + ['ch%02d' % i for i in range(1, 23)]:
    k = '00' if f == 'chpore' else f[2:]
    p = os.path.join(D, f + '.tex'); s = open(p).read()
    deep = '\\IfFileExists{extra/plus%s.tex}{\\input{extra/plus%s}}{}\n' % (k, k)
    more = '\\IfFileExists{extra/more%s.tex}{\\input{extra/more%s}}{}\n' % (k, k)
    if deep not in s:
        for pat in [r'^\\section\{Summary', r'^\\IfFileExists\{extra/app', r'^\\IfFileExists\{extra/proj', r'^\\backhead\{EXERCISES']:
            m = re.search(pat, s, re.M)
            if m: s = s[:m.start()] + deep + s[m.start():]; break
        else: raise SystemExit('no deep hook in ' + f)
    if more not in s:
        i = s.rindex('\\swaflvideo'); s = s[:i] + more + s[i:]
    open(p, 'w').write(s)
print('hooked')
