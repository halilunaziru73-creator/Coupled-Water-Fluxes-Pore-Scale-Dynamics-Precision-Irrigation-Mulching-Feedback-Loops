"""Make every longtable of the supplements fit the text width: column widths given in cm are
rescaled to fractions of \\linewidth (minus the column separation), so the table is exactly as wide as the text."""
import re, sys, os, glob
def grab(s, i):  # balanced {...} starting at s[i]=='{'
    d = 0
    for j in range(i, len(s)):
        d += (s[j] == '{') - (s[j] == '}')
        if d == 0: return s[i + 1:j], j + 1
def fit_spec(spec):
    cm = [float(x) for x in re.findall(r'p\{([\d.]+)cm\}', spec)]
    if not cm: return spec
    tot = sum(cm)
    return re.sub(r'p\{([\d.]+)cm\}', lambda m: 'p{\\dimexpr %.4f\\linewidth-2\\tabcolsep\\relax}' % (float(m.group(1)) / tot), spec)
def fit(s):
    s = s.replace('\\texttt{Data/Comprehensive\\_Summary}', '\\nolinkurl{Data/Comprehensive_Summary}')
    out, i, key = [], 0, '\\begin{longtable}'
    while True:
        k = s.find(key, i)
        if k < 0: out.append(s[i:]); break
        j = k + len(key); spec, e = grab(s, j)
        out.append(s[i:j] + '{' + fit_spec(spec) + '}'); i = e
    return ''.join(out)
if __name__ == '__main__':
    TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../tex')
    for f in sys.argv[1:] or sorted(glob.glob(os.path.join(TEX, 's[1-4]_*.tex'))):
        s = open(f).read(); t = fit(s)
        if t != s: open(f, 'w').write(t); print('fitted', os.path.basename(f))
