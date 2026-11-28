"""Shared helpers for the expansion of the textbook (gen/plus_*.py).
Every number printed in an example, an exercise answer or a drawing is computed here, so the text and the
answers agree.  LaTeX is written with <<name>> placeholders (T(...)) so that braces need no escaping."""
import math, os, re

HERE = os.path.dirname(os.path.abspath(__file__)); EXTRA = os.path.join(os.path.dirname(HERE), 'extra')
SOILS = {  # id: (name, alpha 1/cm, n, theta_r, theta_s, Ks cm/d)   (theta and Ks: typical values of the texture class)
    'S01': ('Coarse loam', 0.0961, 1.353, 0.06, 0.41, 25.0), 'S02': ('Coarse sand', 0.0536, 1.60, 0.04, 0.38, 300.0),
    'S03': ('Sand', 0.145, 2.68, 0.045, 0.43, 712.8), 'S04': ('Loamy sand', 0.124, 2.28, 0.057, 0.41, 350.2),
    'S05': ('Sandy loam', 0.075, 1.89, 0.065, 0.41, 106.1), 'S06': ('Loam', 0.036, 1.56, 0.078, 0.43, 24.96),
    'S07': ('Silt loam', 0.020, 1.41, 0.067, 0.45, 10.8), 'S08': ('Sandy clay loam', 0.059, 1.48, 0.10, 0.39, 31.44),
    'S09': ('Clay loam', 0.019, 1.31, 0.095, 0.41, 6.24), 'S10': ('Silty clay loam', 0.010, 1.23, 0.089, 0.43, 1.68)}
KAPPA = 3.47e-10; SIG = 0.0728; RHO = 1000.0; G = 9.81

def m_(n): return 1 - 1 / n
def Se(h, a, n): return (1 + (a * h) ** n) ** (-m_(n))
def theta(h, s):
    _, a, n, tr, ts, _ = SOILS[s]; return tr + (ts - tr) * Se(h, a, n)
def Kr(h, a, n, l=0.5):
    m = m_(n); se = Se(h, a, n); return se ** l * (1 - (1 - se ** (1 / m)) ** m) ** 2
def hc(a, n, kap=KAPPA, l=0.5):
    m = m_(n); return (m * m / kap) ** (1 / (2 * n + l * (n - 1))) / a
def cap_h(r_m): return 2 * SIG / (RHO * G * r_m)            # m of water for radius r (m)
def cap_r(h_m): return 2 * SIG / (RHO * G * h_m)            # m

def f(x, d=3):
    """format a number for print: d significant digits, LaTeX power of ten when needed"""
    if x == 0: return '0'
    e = int(math.floor(math.log10(abs(x))))
    if -3 <= e <= 5:
        dec = max(0, d - 1 - e); s = '%.*f' % (dec, x)
        if '.' in s and dec > 0: pass
        if abs(x) >= 1e4: s = '{:,.0f}'.format(x).replace(',', '\\,')
        return s
    mant = x / 10 ** e; return '%.*f\\times10^{%d}' % (d - 1, mant, e)
def fm(x, d=3): return '$' + f(x, d) + '$'

def T(s, **k):
    for a, b in k.items(): s = s.replace('<<' + a + '>>', str(b))
    left = re.findall(r'<<\w+>>', s)
    if left: raise ValueError('unfilled ' + ', '.join(left))
    return s

# -------------------------------------------------------------- drawings
def axes(x0, x1, y0, y1, W=7.0, H=4.2, xlab='', ylab='', xt=(), yt=(), logx=False, logy=False):
    """returns (tikz-string, mapper) for a plot area W x H (cm)"""
    tx = (lambda v: math.log10(v)) if logx else (lambda v: v); ty = (lambda v: math.log10(v)) if logy else (lambda v: v)
    X0, X1, Y0, Y1 = tx(x0), tx(x1), ty(y0), ty(y1)
    mp = lambda x, y: ((tx(x) - X0) / (X1 - X0) * W, (ty(y) - Y0) / (Y1 - Y0) * H)
    s = ['\\draw[axis] (0,0)--(%.2f,0);\\draw[axis] (0,0)--(0,%.2f);' % (W + 0.4, H + 0.4)]
    for v, t in xt:
        X, _ = mp(v, y0); s.append('\\draw[ln] (%.3f,0)--(%.3f,-0.1);\\node[lab,below] at (%.3f,-0.1) {%s};' % (X, X, X, t))
    for v, t in yt:
        _, Y = mp(x0, v); s.append('\\draw[ln] (0,%.3f)--(-0.1,%.3f);\\node[lab,left] at (-0.1,%.3f) {%s};' % (Y, Y, Y, t))
    s.append('\\node[lab,below] at (%.2f,-0.6) {%s};' % (W / 2, xlab))
    s.append('\\node[lab,rotate=90] at (-1.05,%.2f) {%s};' % (H / 2, ylab))
    return '\n'.join(s), mp

def curve(mp, xs, fn, style='crv', clip=None):
    pts = []
    for x in xs:
        try: y = fn(x)
        except (ValueError, ZeroDivisionError, OverflowError): continue
        X, Y = mp(x, y)
        if clip and not (clip[0] <= Y <= clip[1]): continue
        pts.append('(%.3f,%.3f)' % (X, Y))
    return '\\draw[%s,smooth] plot coordinates {%s};' % (style, ' '.join(pts))

def logspace(a, b, n): return [10 ** (math.log10(a) + (math.log10(b) - math.log10(a)) * i / (n - 1)) for i in range(n)]
def linspace(a, b, n): return [a + (b - a) * i / (n - 1) for i in range(n)]

def kfig(cap, body): return '\\begin{kfig}{%s}\n%s\n\\end{kfig}\n' % (cap, body)

def write(name, text):
    p = os.path.join(EXTRA, name + '.tex'); open(p, 'w').write(text); return p
