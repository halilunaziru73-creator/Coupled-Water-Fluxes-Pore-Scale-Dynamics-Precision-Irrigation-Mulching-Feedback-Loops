"""Records the data of every figure a script draws, so each graph can be traced to numbers.

Put this folder first on PYTHONPATH (it is loaded automatically as `sitecustomize`) and set PLOTDATA_DIR.
Every call of Figure.savefig then also writes  <PLOTDATA_DIR>/<figure file name>.csv  in long format:
    panel, panel_title, x_label, y_label, kind, series, i, x, x_category, y, y_category, y_low, y_high, x_scale, y_scale
one row per plotted point (lines, markers, scatter, bars, error bars, shaded bands, images as cells);
x_category / y_category give the tick label at that position when the axis is categorical (soil names, etc.).
Nothing in the figure changes; the scripts run exactly as without it."""
import os, csv
try:
    import numpy as np
    import matplotlib
    from matplotlib.axes import Axes
    from matplotlib.figure import Figure
except Exception:          # matplotlib not used by this process
    Axes = None

if Axes is not None and os.environ.get('PLOTDATA_DIR'):
    REC = {}              # id(axes) -> list of records

    def _arr(v):
        try:
            a = np.asarray(v, dtype=float).ravel(); return a
        except Exception:
            try: return np.asarray([float(x) for x in v])
            except Exception: return None

    def _add(ax, kind, series, x, y, lo=None, hi=None):
        x, y = _arr(x), _arr(y)
        if y is None: return
        if x is None or len(x) != len(y): x = np.arange(len(y), dtype=float)
        lo = _arr(lo) if lo is not None else None; hi = _arr(hi) if hi is not None else None
        REC.setdefault(id(ax), (ax, []))[1].append((kind, str(series or ''), x, y, lo, hi))

    def wrap(name, fn):
        orig = getattr(Axes, name)
        def w(self, *a, **k):
            r = orig(self, *a, **k)
            try: fn(self, r, *a, **k)
            except Exception: pass
            return r
        w.__wrapped__ = orig; setattr(Axes, name, w)

    def _plot(ax, r, *a, **k):
        for ln in r: _add(ax, 'line', ln.get_label() if not ln.get_label().startswith('_') else '', ln.get_xdata(), ln.get_ydata())
    def _scatter(ax, r, x, y, *a, **k): _add(ax, 'scatter', k.get('label', ''), x, y)
    def _bar(ax, r, x, height, *a, **k):
        xs = [p.get_x() + p.get_width() / 2 for p in r.patches]; ys = [p.get_height() for p in r.patches]
        b0 = [p.get_y() for p in r.patches]; _add(ax, 'bar (y = height; low/high = bottom/top)', k.get('label', ''), xs, ys, b0, np.add(b0, ys))
    def _barh(ax, r, y, width, *a, **k):
        ys = [p.get_y() + p.get_height() / 2 for p in r.patches]; xs = [p.get_width() for p in r.patches]; l0 = [p.get_x() for p in r.patches]
        _add(ax, 'barh (x = length; low/high = left/right end)', k.get('label', ''), xs, ys, l0, np.add(l0, xs))
    def _err(ax, r, x, y, yerr=None, *a, **k):
        yerr = k.get('yerr', yerr)
        if yerr is None: _add(ax, 'errorbar', k.get('label', ''), x, y); return
        e = np.asarray(yerr, dtype=float); y_ = _arr(y)
        lo, hi = (y_ - e[0], y_ + e[1]) if e.ndim == 2 else (y_ - e, y_ + e)
        _add(ax, 'errorbar', k.get('label', ''), x, y_, lo, hi)
    def _fill(ax, r, x, y1, y2=0, *a, **k):
        x_ = _arr(x); y1_ = _arr(y1) * np.ones(len(x_)); y2_ = _arr(y2) * np.ones(len(x_))
        _add(ax, 'band', k.get('label', ''), x_, (y1_ + y2_) / 2, np.minimum(y1_, y2_), np.maximum(y1_, y2_))
    def _imshow(ax, r, X, *a, **k):
        A = np.asarray(X, dtype=float)
        if A.ndim == 2:
            i, j = np.indices(A.shape); _add(ax, 'cell(row=x,col=i)', '', i.ravel(), A.ravel(), j.ravel(), j.ravel())
    def _hist(ax, r, x, *a, **k):
        n, b = r[0], r[1]; n = np.atleast_2d(n)
        for row in n: _add(ax, 'histogram', k.get('label', ''), (b[:-1] + b[1:]) / 2, row)
    def _pcolor(ax, r, *a, **k):
        if len(a) >= 3:
            Z = np.asarray(a[2], dtype=float); i, j = np.indices(Z.shape); _add(ax, 'cell(row=x,col=i)', '', i.ravel(), Z.ravel(), j.ravel(), j.ravel())

    for n_, f_ in [('plot', _plot), ('scatter', _scatter), ('bar', _bar), ('barh', _barh), ('errorbar', _err),
                   ('fill_between', _fill), ('imshow', _imshow), ('hist', _hist), ('pcolormesh', _pcolor)]:
        try: wrap(n_, f_)
        except Exception: pass

    _save = Figure.savefig
    def savefig(self, fname, *a, **k):
        r = _save(self, fname, *a, **k)
        try:
            base = os.path.splitext(os.path.basename(str(fname)))[0]
            out = os.path.join(os.environ['PLOTDATA_DIR'], base + '.csv')
            if True:
                axes = [ax for ax in self.axes if id(ax) in REC]
                with open(out, 'w', newline='') as fh:
                    w = csv.writer(fh); w.writerow(['panel', 'panel_title', 'x_label', 'y_label', 'kind', 'series', 'i', 'x', 'x_category', 'y', 'y_category', 'y_low', 'y_high', 'x_scale', 'y_scale'])
                    for pi, ax in enumerate(self.axes):
                        if id(ax) not in REC: continue
                        cl = lambda z: ' '.join(str(z).split())
                        t = cl(ax.get_title() or ax.get_title(loc='left') or '')
                        def ticks(get, lab):
                            try: return {round(float(v), 6): cl(l.get_text()) for v, l in zip(get(), lab()) if l.get_text()}
                            except Exception: return {}
                        XT, YT = ticks(ax.get_xticks, ax.get_xticklabels), ticks(ax.get_yticks, ax.get_yticklabels)
                        num = lambda d: all(k.replace('−', '-').replace('.', '', 1).lstrip('-').replace('$', '').replace('{', '').replace('}', '').replace('^', '').replace('\\mathdefault', '').isdigit() for k in d.values())
                        if num(XT): XT = {}
                        if num(YT): YT = {}
                        for kind, ser, x, y, lo, hi in REC[id(ax)][1]:
                            for i in range(len(y)):
                                w.writerow([pi + 1, t, cl(ax.get_xlabel()), cl(ax.get_ylabel()), kind, cl(ser), i, '%.8g' % x[i], XT.get(round(float(x[i]), 6), ''), '%.8g' % y[i], YT.get(round(float(y[i]), 6), ''),
                                            '' if lo is None or i >= len(lo) else '%.8g' % lo[i], '' if hi is None or i >= len(hi) else '%.8g' % hi[i], ax.get_xscale(), ax.get_yscale()])
        except Exception as e:
            print('plotdata: could not write the data of', fname, e)
        return r
    Figure.savefig = savefig
