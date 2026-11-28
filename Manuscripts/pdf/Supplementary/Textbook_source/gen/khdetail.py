r"""Writes the working of every worked example in the full manner of the classic engineering textbooks.
A line of working such as
        \[K_s=(\theta_s-\theta_{33})/\lambda=(0.43-0.27)/0.19=0.84\]
which states the formula and its numbers at once, becomes two steps:
        We know that
        \[K_s=(\theta_s-\theta_{33})/\lambda                   ...(i)\]
        Substituting the values in equation (i),
        \[K_s=(0.43-0.27)/0.19=0.84\]
The equations of a solution are numbered (i), (ii), ... from the start of each solution. A line that has no
symbolic part is left as it is. Idempotent: a numbered line is not split again."""
import re, os, glob, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from khstyle import END
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROM = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx']
STRIP = re.compile(r'\\text\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|\\(?:times|cdot|frac|dfrac|tfrac|sqrt|exp|ln|log|left|right|Bigl|Bigr|bigl|bigr|Big|big|max|min|quad|qquad|dots|ldots|pi|circ|mathrm|rm|operatorname|displaystyle)(?![A-Za-z])|\\[,;:! ]|\^\{?[-\d.]+\}?|_\{?[\d]+\}?')

def parts(x):
    out, d, cur = [], 0, ''
    for c in x:
        if c in '{(': d += 1
        elif c in '})': d -= 1
        if c == '=' and d == 0: out.append(cur); cur = ''
        else: cur += c
    out.append(cur); return out

def symbolic(p):
    q = STRIP.sub('', p)
    return bool(re.search(r'[A-Za-z]|\\[a-zA-Z]+', q))

def detail(seg):
    n = [0]; nums = {}
    def one(m):
        x = m.group(1)
        if '\\ti{' in x or '\\tag' in x or '\\begin' in x: return m.group(0)
        p = parts(x)
        if len(p) < 3 or not p[0].strip() or not symbolic(p[1]) or symbolic(p[2]): return m.group(0)
        if n[0] >= len(ROM): return m.group(0)
        r = ROM[n[0]]; n[0] += 1
        lhs = p[0].strip()
        before = seg[max(0, m.start() - 40):m.start()].rstrip()
        lead = '' if re.search(r'[A-Za-z,:]\s*$', before) and not before.endswith('\\ans') else '\\par\\indent We know that\n'
        return (lead + '\\[' + lhs + '=' + p[1].strip() + '\\ti{' + r + '}\\]\n'
                + 'Substituting the values in equation \\rfi{' + r + '},\n'
                + '\\[' + lhs + '=' + '='.join(q.strip() for q in p[2:]) + '\\]')
    out = re.sub(r'\\\[(.*?)\\\]', one, seg, flags=re.S)
    return out, n[0]

def process(path):
    t = open(path).read(); out = []; i = 0; total = 0
    for m in re.finditer(r'\\sol\b', t):
        if m.start() < i: continue
        e = END.search(t, m.end()); j = e.start() if e else len(t)
        seg = t[m.end():j]
        if '\\ti{' in seg: out.append(t[i:j]); i = j; continue          # already written in full
        out.append(t[i:m.end()]); s2, k = detail(seg); out.append(s2); total += k; i = j
    out.append(t[i:]); new = ''.join(out)
    if new != t: open(path, 'w').write(new)
    return total

if __name__ == '__main__':
    files = [os.path.join(D, f) for f in ['chpore.tex'] + ['ch%02d.tex' % i for i in range(1, 23)]] + sorted(glob.glob(os.path.join(D, 'extra', '*.tex')))
    tot = 0
    for f in files:
        k = process(f); tot += k
    print('formulas stated before their numbers:', tot)
