"""Draws the numbered arrows on the captured screens of the Daisy workbench and writes the JPEGs and a JSON index.
usage: python3 daisy_annotate.py   (reads build_shots/*.png and *.json, writes images/daisy11/*.jpg and build_shots/index.json)"""
import json, glob, os
from PIL import Image
import annot, math
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, '..', 'build_shots'); DST = os.path.join(HERE, '..', 'images', 'daisy11'); os.makedirs(DST, exist_ok=True)
idx = {}
for jf in sorted(glob.glob(SRC + '/*.json')):
    if jf.endswith('index.json'): continue
    m = json.load(open(jf)); im = Image.open(jf[:-5] + '.png').convert('RGB')
    G = np.asarray(im.convert('L'), dtype=np.int16); H, W = G.shape; R = 17 * 2 // 2
    def ink(cx, cy, r):
        x0, x1, y0, y1 = int(cx - r), int(cx + r), int(cy - r), int(cy + r)
        if x0 < 4 or y0 < 4 or x1 > W - 4 or y1 > H - 4: return 1e9
        a = G[y0:y1, x0:x1]; return float((np.abs(a - np.median(a)) > 35).mean())
    def inter(a, b, c, d):
        o = lambda p, q, r: (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        return o(a, c, d) * o(b, c, d) < 0 and o(a, b, c) * o(a, b, d) < 0
    placed = []; segs = []; marks = []
    for k in m['marks']:
        tx, ty = int(k['x']), int(k['y']); best = None
        for dist in (70, 110, 150, 200, 260, 330):
            for ang in range(0, 360, 20):
                bx, by = tx + dist * math.cos(math.radians(ang)), ty + dist * math.sin(math.radians(ang))
                sc = ink(bx, by, R + 6) * 100 + dist * 0.12
                if any(inter((bx, by), (tx, ty), a, b) for a, b in segs): sc += 60
                if any(math.hypot(px - bx, py - by) < 2.8 * R for px, py in placed): sc += 50
                # the line from the badge to the target should cross little ink
                n = 0; tot = 0
                for t in np.linspace(0.15, 0.85, 8): tot += ink(bx + (tx - bx) * t, by + (ty - by) * t, 5); n += 1
                sc += tot / n * 30
                if best is None or sc < best[0]: best = (sc, bx, by)
        placed.append((best[1], best[2])); segs.append(((best[1], best[2]), (tx, ty))); marks.append((tx, ty, (int(best[1] - tx), int(best[2] - ty))))
    out = annot.annotate(im, marks, S=2, R=17) if marks else im
    out.save(os.path.join(DST, m['id'] + '.jpg'), quality=80, optimize=True); idx[m['id']] = m
json.dump(idx, open(SRC + '/index.json', 'w'), indent=1); print(len(idx), 'screens')
