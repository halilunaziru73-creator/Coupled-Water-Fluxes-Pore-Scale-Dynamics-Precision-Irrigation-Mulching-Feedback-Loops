"""Redraws every figure of the article from its CSV file alone (figures/Figure_N_*.csv), into replot/.
The drawings are plain (no styling); they show that every mark of the published figure is in the data.
    python3 replot_from_csv.py            (needs pandas and matplotlib)"""
import os, glob, math
import pandas as pd
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'replot'); os.makedirs(OUT, exist_ok=True)
COLS = ['panel', 'panel_title', 'x_label', 'y_label', 'kind', 'series', 'i', 'x', 'y']

def draw(path):
    d = pd.read_csv(path, keep_default_na=False, low_memory=False)
    d = d[d.y.astype(str) != '']; d['x'] = pd.to_numeric(d.x, errors='coerce'); d['y'] = pd.to_numeric(d.y, errors='coerce')
    for c in ['y_low', 'y_high']: d[c] = pd.to_numeric(d.get(c, ''), errors='coerce')
    panels = sorted(d.panel.unique()); n = len(panels); nc = min(3, n); nr = math.ceil(n / nc)
    fig, axs = plt.subplots(nr, nc, figsize=(4.2 * nc, 3.2 * nr), squeeze=False)
    for ax, p in zip(axs.flat, panels):
        q = d[d.panel == p]; r0 = q.iloc[0]
        for (kind, ser), s in q.groupby(['kind', 'series'], sort=False):
            lab = ser or None
            if kind == 'line': ax.plot(s.x, s.y, lw=1, label=lab)
            elif kind in ('scatter', 'errorbar'):
                ax.plot(s.x, s.y, 'o', ms=2.5, label=lab)
                if s.y_low.notna().any(): ax.vlines(s.x, s.y_low, s.y_high, lw=0.6)
            elif kind.startswith('bar ('): ax.bar(s.x, s.y, bottom=s.y_low.fillna(0), width=0.8, label=lab, alpha=0.8)
            elif kind.startswith('barh'): ax.barh(s.y, s.x, left=s.y_low.fillna(0), label=lab, alpha=0.8)
            elif kind == 'band': ax.fill_between(s.x, s.y_low, s.y_high, alpha=0.25, label=lab)
            elif kind == 'histogram': ax.bar(s.x, s.y, width=(s.x.diff().median() or 1), alpha=0.6, label=lab)
            elif kind.startswith('cell'):
                piv = s.pivot_table(index='x', columns='y_low', values='y'); ax.imshow(piv.values, aspect='auto', origin='upper')
        xc = q[q.x_category.astype(str) != ''][['x', 'x_category']].drop_duplicates() if 'x_category' in q else []
        if len(xc): ax.set_xticks(xc.x); ax.set_xticklabels(xc.x_category, rotation=60, fontsize=6)
        yc = q[q.y_category.astype(str) != ''][['y', 'y_category']].drop_duplicates() if 'y_category' in q else []
        if len(yc): ax.set_yticks(yc.y); ax.set_yticklabels(yc.y_category, fontsize=6)
        for axis, col in [('x', 'x_scale'), ('y', 'y_scale')]:
            if col in q and str(r0[col]) in ('log', 'symlog'):
                try: getattr(ax, 'set_%sscale' % axis)(r0[col])
                except Exception: pass
        ax.set_title(str(r0.panel_title)[:60], fontsize=8, loc='left'); ax.set_xlabel(str(r0.x_label)[:70], fontsize=7); ax.set_ylabel(str(r0.y_label)[:70], fontsize=7)
        ax.tick_params(labelsize=6)
        if q.series.astype(str).str.len().gt(0).any() and q.series.nunique() <= 12: ax.legend(fontsize=5, frameon=False)
    for ax in list(axs.flat)[n:]: ax.axis('off')
    fig.suptitle(os.path.basename(path)[:-4].replace('_', ' '), fontsize=9); fig.tight_layout()
    out = os.path.join(OUT, os.path.basename(path)[:-4] + '.png'); fig.savefig(out, dpi=110); plt.close(fig); return out

if __name__ == '__main__':
    for f in sorted(glob.glob(os.path.join(HERE, 'figures', 'Figure_*.csv'))):
        if '__' in os.path.basename(f): continue          # result tables, not point data
        head = open(f).readline()
        if not head.startswith('panel,'): continue
        print('redrawn', os.path.relpath(draw(f), HERE))
