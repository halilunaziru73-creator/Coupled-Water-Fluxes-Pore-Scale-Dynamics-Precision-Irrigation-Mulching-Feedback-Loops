"""Compare regenerated numerical outputs with the archived reference outputs shipped in ../results.
Usage: python compare_results.py <regenerated out/ dir> [reference dir] [rtol]
Exit status 0 if every shared numeric leaf agrees within rtol (default 1e-6)."""
import sys, os, json, math, glob
new = sys.argv[1]; ref = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'results')
rtol = float(sys.argv[3]) if len(sys.argv) > 3 else 1e-6
def leaves(x, p=''):
    if isinstance(x, dict):
        for k, v in x.items(): yield from leaves(v, f'{p}/{k}')
    elif isinstance(x, list):
        for i, v in enumerate(x): yield from leaves(v, f'{p}[{i}]')
    elif isinstance(x, (int, float)) and not isinstance(x, bool): yield p, float(x)
    else: yield p, x
SKIP = {'p3_bench.json'}   # wall-clock timings, machine dependent
bad = 0; nfile = 0; worst = (0.0, '')
for f in sorted(glob.glob(os.path.join(ref, '*.json'))):
    b = os.path.basename(f); g = os.path.join(new, b)
    if b in SKIP: continue
    if not os.path.exists(g): continue
    nfile += 1; A = dict(leaves(json.load(open(f)))); B = dict(leaves(json.load(open(g))))
    nb = 0; n = 0
    for k, v in A.items():
        n += 1
        if k not in B: nb += 1; continue
        w = B[k]
        if isinstance(v, float) and isinstance(w, float):
            if math.isnan(v) and math.isnan(w): continue
            d = abs(v - w) / max(abs(v), 1e-12)
            if d > worst[0]: worst = (d, f'{b}{k}')
            if d > rtol and abs(v - w) > 1e-9: nb += 1
        elif v != w: nb += 1
    print(f'{b:28s} {n:7d} values, {nb:5d} outside tolerance'); bad += nb
print(f'files compared: {nfile}; values outside rtol={rtol:g}: {bad}; largest relative deviation {worst[0]:.2e} ({worst[1]})')
sys.exit(1 if bad else 0)
