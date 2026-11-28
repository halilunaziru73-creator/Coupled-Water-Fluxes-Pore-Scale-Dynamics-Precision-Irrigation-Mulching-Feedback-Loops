"""Writes, next to each journal article, the folder Data_and_analysis: the data behind every figure and table of
the article, the scripts that made them, and a script that redraws every figure from the data alone.

    python3 data_package.py          (after build.py, which writes the .aux files with the figure numbers)

For each article:
  Data_and_analysis/README.md                       what each figure and table shows, which file holds its data, which script made it
  Data_and_analysis/figures/Figure_N_<name>.csv     every point drawn in the figure (long format, one row per point)
  Data_and_analysis/figures/Figure_N_<name>_*.csv   the result tables the figure was drawn from (when there are any)
  Data_and_analysis/tables/Table_N_<name>.csv       every table of the article as CSV
  Data_and_analysis/replot_from_csv.py              redraws every figure from the CSV files alone (no model, no other data)
  Data_and_analysis/analysis/...                    the original analysis: Daisy ensemble, scripts, run_original.sh

The point data of the figures were recorded while the original figure scripts ran
(Manuscripts/reproducibility/plotdata/sitecustomize.py) and are archived in Manuscripts/results/plotdata."""
import os, re, csv, glob, json, shutil, textwrap
import numpy as np, pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
MS = os.path.dirname(HERE); REP = os.path.join(MS, 'reproducibility'); RES = os.path.join(MS, 'results')
PLOT = os.path.join(RES, 'plotdata'); PKG = os.path.join(MS, 'pdf', 'Journal_versions')

# ------------------------------------------------------------------ where every figure comes from
SRC = {   # figure file -> (script that draws it, result files it reads)
    'fig01_framework_A4': ('analysis/p1_fig1_new.py', []),
    'fig04_fates': ('analysis/p1_figs_b.py', ['p1_core.json', 'p1_table.csv']),
    'fig05_predictors': ('analysis/p1_figs_b.py', ['p1_core.json', 'p1_table2.csv']),
    'fig06_mechanism': ('analysis/p1_figs_b.py', ['p1_rate_law.json', 'p1_mech.json']),
    'fig08_replication': ('analysis/p1_figs_c.py', ['p1_rank.json']),
    'fig07_modifiers': ('analysis/p1_figs_c.py', ['p1_modifiers.json']),
    'fig11_e11_surface': ('analysis/p1_figs_e.py', []),
    'fig02_invariants': ('analysis/p2_figs.py', ['p2_a.json', 'p2_laws.json']),
    'fig03_hidden_term': ('analysis/p2_figs.py', ['p2_R.json']),
    'fig05_ET_law': ('analysis/p2_figs2.py', ['p2_et.json', 'p2_etlaw.json']),
    'fig1_concept': ('analysis/p4_concept.py', []),
    'fig2_curves_reach': ('analysis/p4_reach.py', ['p4_tableA1_reach.csv']),
    'fig3_trigger_reach': ('analysis/p4_reach.py', ['p4_fig3_trigger_runs.csv', 'p4_tableA1_reach.csv']),
    'fig6_kappa': ('analysis/p4_kappa.py', ['p4_fig6a_reach_vs_kappa.csv', 'p4_fig6b_misfit.csv', 'p4_tableA1_reach.csv']),
    'fig4_marginal_fate': ('analysis/p4_reach.py', ['p4_fig4a_fate_by_soil.csv', 'p4_fig4b_fate_by_method.csv']),
    'fig5_dose': ('analysis/p4_reach.py', ['p4_fig5_dose.csv']),
    'fig01_architecture_A4': ('(diagram drawn by hand in analysis/p3_figs.py style; no data)', []),
    'fig03_ws_verification': ('analysis/p3_figs.py', ['p3_surface.json', 'p3_ws61.csv']),
    'fig05_engine1_heldout': ('analysis/p3_figs.py', ['e12.json', 'e12_pred.json']),
}
NODATA = {'fig01_framework_A4': 'conceptual diagram (no data)', 'fig1_concept': 'conceptual diagram; its numbers (reach 199 cm and 9 000 cm, fates of E10) are those of Figures 2, 3 and 5',
          'fig01_architecture_A4': 'architecture diagram (no data)', 'fig2_main_window': 'screenshot of the program', 'fig3_scheduling_layers': 'screenshots of the program',
          'fig4_design_layers': 'screenshots of the program', 'fig6_daisy_workbench': 'screenshots of the program'}
ARTICLES = [('AWM_Paper1', '1_Agricultural_Water_Management_Paper1', 'p1'), ('AWM_Paper4', '2_Agricultural_Water_Management_Paper4', 'p4'),
            ('SoftwareX_SWAFL', '3_SoftwareX_SWAFL', 'sx')]

# ------------------------------------------------------------------ LaTeX to plain text
MACROS = {}; REFS = {}
def plain(s):
    for k, v in MACROS.items(): s = s.replace('\\' + k, v)
    s = re.sub(r'(?<!\\)%.*', '', s)
    for a, b in [(r'\,', ' '), (r'\;', ' '), (r'\!', ''), ('~', ' '), (r'\%', '%'), (r'\&', '&'), (r'\_', '_'), ('``', '"'), ("''", '"'),
                 (r'\times', '×'), (r'\pm', '±'), (r'\le', '≤'), (r'\ge', '≥'), (r'\approx', '≈'), (r'\infty', '∞'), (r'\to', '→'), (r'\cdot', '·'),
                 (r'\alpha', 'α'), (r'\kappa', 'κ'), (r'\phi', 'φ'), (r'\psi', 'ψ'), (r'\theta', 'θ'), (r'\eta', 'η'), (r'\rho', 'ρ'), (r'\tau', 'τ'),
                 (r'\Delta', 'Δ'), (r'\lambda', 'λ'), (r'\ell', 'ℓ'), (r'\sigma', 'σ'), (r'\mu', 'μ'), (r'\beta', 'β'), (r'\gamma', 'γ'), (r'\omega', 'ω'),
                 (r'\Omega', 'Ω'), (r'\ast', '*'), (r'--', '–'), (r'\htr', 'h_t'), (r'\log', 'log'), (r'\exp', 'exp'), (r'\ln', 'ln'), (r'\hc', 'h_c'), (r'\ET', 'ET')]:
        s = s.replace(a, b)
    s = re.sub(r'\\multicolumn\{\d+\}\{[^}]*\}', '', s); s = re.sub(r'\\multirow\{[^}]*\}\{[^}]*\}', '', s)
    s = re.sub(r'\\(?:cref|Cref|ref|eqref)\{([^}]*)\}', lambda m: ', '.join(('Eq. (%s)' if k.startswith('eq:') else ('Fig. %s' if k.startswith('fig:') else 'Table %s')) % REFS.get(k, '?')
                                                                         for k in m.group(1).split(',')), s)
    s = re.sub(r'\\(?:cite[tp]?|citealt|citealp)\{([^}]*)\}', r'[\1]', s)
    s = re.sub(r'\\(?:textbf|textit|emph|mathrm|text|textsc|mathit|mathbf|texttt|operatorname|bm|boldsymbol|underline|textsuperscript|mathcal)\{([^{}]*)\}', r'\1', s)
    s = re.sub(r'\\[a-zA-Z]+\*?(\[[^\]]*\])?', '', s)
    s = s.replace('$', '').replace('{', '').replace('}', '')
    return ' '.join(s.split())

def env_blocks(tex, env):
    return [(m.start(), m.group(0)) for m in re.finditer(r'\\begin\{%s\*?\}.*?\\end\{%s\*?\}' % (env, env), tex, re.S)]

def labels(aux):
    L = {}
    for m in re.finditer(r'\\newlabel\{((?:fig|tab|eq):[^}@]+)\}\{\{([^}]*)\}', open(aux).read()): L[m.group(1)] = m.group(2)
    REFS.clear(); REFS.update(L); return L

def captions(block):
    out, i = [], block.find('\\caption{')
    while i >= 0:
        j, d = i + 9, 1
        while d and j < len(block): d += {'{': 1, '}': -1}.get(block[j], 0); j += 1
        out.append(block[i + 9:j - 1]); i = block.find('\\caption{', j)
    return out

def caption(block):
    i = block.find('\\caption{');
    if i < 0: return ''
    j, d = i + 9, 1
    while d and j < len(block): d += {'{': 1, '}': -1}.get(block[j], 0); j += 1
    return block[i + 9:j - 1]

def table_rows(block):
    out = []
    for tab in re.findall(r'\\begin\{(?:tabular|tabularx|tabulary)\}.*?\\end\{(?:tabular|tabularx|tabulary)\}', block, re.S):
        body = re.sub(r'^\\begin\{tabular[xy]?\}(\{[^}]*\})?\{(?:[^{}]|\{[^{}]*\})*\}', '', tab, count=1)
        body = re.sub(r'\\end\{tabular[xy]?\}$', '', body)
        body = re.sub(r'\\(?:toprule|midrule|bottomrule|hline|addlinespace|cmidrule(?:\([^)]*\))?\{[^}]*\})', '', body)
        for row in re.split(r'\\\\(?:\[[^\]]*\])?', body):
            cells = [plain(c) for c in re.split(r'(?<!\\)&', row)]
            if any(cells): out.append(cells)
    return out

def slug(s, n=48):
    return re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')[:n].rstrip('_')

# ------------------------------------------------------------------ extra data computed for figures drawn from formulas
def fig2_curves():
    A = pd.read_csv(os.path.join(RES, 'p4_tableA1_reach.csv')); kap = json.load(open(os.path.join(RES, 'p4_numbers.json')))['kappa']
    h = np.logspace(0, 5.3, 160); rows = []
    for _, r in A.iterrows():
        m = 1 - 1 / r.n; se = (1 + (r.alpha_1_per_cm * h) ** r.n) ** (-m); kr = se ** 0.5 * (1 - (1 - se ** (1 / m)) ** m) ** 2
        rows += [dict(soil=r.id, name=r.soil, suction_cm=x, Se=y, Kr=z) for x, y, z in zip(h, se, kr)]
    d = pd.DataFrame(rows); d.attrs['note'] = 'kappa = %.4g' % kap; return d

def build(art, folder, key):
    tex = open(os.path.join(HERE, art + '.tex')).read(); L = labels(os.path.join(HERE, art + '.aux'))
    MACROS.clear(); MACROS.update({m.group(1): m.group(2) for m in re.finditer(r'\\newcommand\{?\\(\w+)\}?\{([^{}]*)\}', tex + open(os.path.join(HERE, 'jmacros.tex')).read())})
    out = os.path.join(PKG, folder, 'Data_and_analysis'); shutil.rmtree(out, ignore_errors=True)
    for d in ['figures', 'tables']: os.makedirs(os.path.join(out, d))
    figs, tabs = [], []
    # figures (sidewaysfigure too), in the order of their numbers
    blocks = env_blocks(tex, 'figure') + env_blocks(tex, 'sidewaysfigure')
    for _, b in sorted(blocks):
        lab = re.search(r'\\label\{(fig:[^}]*)\}', b); num = L.get(lab.group(1), '?') if lab else '?'
        files = [os.path.splitext(os.path.basename(f))[0] for f in re.findall(r'\\includegraphics(?:\[[^\]]*\])?\{([^}]*)\}', b)]
        caps = captions(b); cap = plain(caps[-1]) if caps else ''; subs = [plain(c) for c in caps[:-1]]; rec = []
        for k, f in enumerate(files):
            part = '' if len(files) == 1 else chr(ord('a') + k)
            stem = 'Figure_%s%s_%s' % (num, part, slug(f.replace('_A4', '')))
            src = os.path.join(PLOT, f.replace('_A4', '') + '.csv')
            entry = dict(file=f, part=part, csv=None, extra=[], script=SRC.get(f, ('', []))[0], note=NODATA.get(f, ''), sub=subs[k] if len(subs) == len(files) else '')
            if os.path.exists(src) and sum(1 for _ in open(src)) > 1:
                shutil.copy(src, os.path.join(out, 'figures', stem + '.csv')); entry['csv'] = stem + '.csv'
            for r in SRC.get(f, ('', []))[1]:
                if os.path.exists(os.path.join(RES, r)):
                    shutil.copy(os.path.join(RES, r), os.path.join(out, 'figures', stem + '__' + r)); entry['extra'].append(stem + '__' + r)
            if f == 'fig2_curves_reach':
                d = fig2_curves(); d.to_csv(os.path.join(out, 'figures', stem + '.csv'), index=False, float_format='%.6g'); entry['csv'] = stem + '.csv'
                entry['note'] = 'curves (a, b) computed from α and n of Table A.4 with Eqs. 1-2; circles and panel c: column reach_Eq4_cm of Table A.4'
            if f == 'fig5_dose' and not entry['csv']: entry['note'] = 'drawn from the result table below'
            if f in ('fig3_trigger_reach', 'fig4_marginal_fate') and not entry['csv']: entry['note'] = 'drawn from the result tables below'
            rec.append(entry)
        figs.append(dict(num=num, label=lab.group(1) if lab else '', caption=cap, parts=rec))
    # tables
    last = 0
    for pos, b in sorted(env_blocks(tex, 'table')):
        lab = re.search(r'\\label\{(tab:[^}]*)\}', b)
        num = L.get(lab.group(1)) if lab else None
        rows = table_rows(b); cap = plain(caption(b))
        if not cap:                                     # an unnumbered table under a heading (code and software metadata of SoftwareX)
            hd = re.findall(r'\\section\*?\{([^}]*)\}', tex[:pos]); cap = hd[-1] if hd else 'table'
            num = '–'; name = '%s.csv' % slug(cap, 40)
        else:
            if num is None: num = str(last + 1)
            if num.isdigit(): last = int(num)
            name = 'Table_%s_%s.csv' % (num, slug(cap, 40) or 'table')
        with open(os.path.join(out, 'tables', name), 'w', newline='') as fh:
            w = csv.writer(fh)
            for r in rows: w.writerow(r)
        tabs.append(dict(num=num, caption=cap, csv=name, rows=len(rows)))
    # the original analysis, to run everything again from the Daisy ensemble
    A = os.path.join(out, 'analysis'); os.makedirs(A)
    shutil.copytree(os.path.join(REP, 'analysis'), os.path.join(A, 'scripts'), ignore=shutil.ignore_patterns('__pycache__'))
    for f in ['load.py', 'make_data.py', 'requirements.txt', 'compare_results.py']: shutil.copy(os.path.join(REP, f), A)
    shutil.copytree(os.path.join(REP, 'data'), os.path.join(A, 'data')); shutil.copytree(os.path.join(REP, 'intermediates'), os.path.join(A, 'intermediates'))
    shutil.copytree(os.path.join(REP, 'plotdata'), os.path.join(A, 'plotdata'), ignore=shutil.ignore_patterns('__pycache__'))
    os.makedirs(os.path.join(A, 'results'))
    for f in glob.glob(os.path.join(RES, '*.*')): shutil.copy(f, os.path.join(A, 'results'))
    open(os.path.join(A, 'run_original.sh'), 'w').write(RUN[key])
    shutil.copy(os.path.join(HERE, 'replot_from_csv.py'), out)
    open(os.path.join(out, 'README.md'), 'w').write(readme(art, figs, tabs, key))
    return figs, tabs

RUN = {
 'p1': '''#!/bin/sh
# Runs the original analysis of this article again from the Daisy ensemble (data/daisy_ensemble.csv.gz, 10 190 runs).
# Writes into ./work; every figure is redrawn in work/fig and its point data in work/plotdata.  About 10 minutes.
set -e; cd "$(dirname "$0")"; W="$PWD/work"; mkdir -p "$W/out" "$W/analysis" "$W/fig/p1" "$W/fig/p2" "$W/fig/p3" "$W/plotdata"
cp scripts/*.py "$W/analysis/"; cp load.py "$W/"; cp intermediates/* "$W/out/"
export SWAFL_MS="$W" PYTHONHASHSEED=0 OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MPLBACKEND=Agg PLOTDATA_DIR="$W/plotdata" PYTHONPATH="$PWD/plotdata"
python3 make_data.py
for s in p1_core p1_stats p1_mech p1_omega p1_rate_law p1_figs_a p1_figs_b p1_figs_c p1_figs_d p1_figs_e p1_fig1_new p2_a p2_laws p2_R p2_et p2_dpf p2_figs p2_figs2; do
  python3 "$W/analysis/$s.py" > "$W/out/log_$s.txt" 2>&1 && echo "ok $s" || echo "FAILED $s (see work/out/log_$s.txt)"; done
python3 compare_results.py "$W/out" results 1e-6 | tail -3     # the regenerated numbers against the archived numbers of the article
''',
 'p4': '''#!/bin/sh
# The reach and the fate of irrigation water: the result tables in results/ (p4_*.csv, p4_numbers.json) were computed by
# scripts/p4_reach.py from the Daisy ensemble; the figure of kappa (Figure 4) is redrawn here from them.
set -e; cd "$(dirname "$0")"; mkdir -p work/plotdata
export MPLBACKEND=Agg PLOTDATA_DIR="$PWD/work/plotdata" PYTHONPATH="$PWD/plotdata"
python3 - <<'EOF'
import runpy, os, sys
# p4_kappa.py reads ../../results relative to the repository; point it at the copy in this folder
src = open('scripts/p4_kappa.py').read().replace("ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))", "ROOT = None")
src = src.replace("RES = os.path.join(ROOT, 'Manuscripts/results'); OUT = os.path.join(ROOT, 'Manuscripts/figures/paper4')", "RES = 'results'; OUT = 'work'")
exec(compile(src, 'p4_kappa.py', 'exec'))
EOF
echo "work/fig6_kappa.pdf and work/plotdata/fig6_kappa.csv written"
''',
 'sx': '''#!/bin/sh
# The verification figure (Figure 5) of the software article is drawn by scripts/p3_figs.py from the results of the
# verification runs of the engine (results/p3_*.json, e12*.json), which come from Manuscripts/reproducibility/p3_js (Node.js).
set -e; cd "$(dirname "$0")"; W="$PWD/work"; mkdir -p "$W/out" "$W/fig/p3" "$W/plotdata"; cp intermediates/* "$W/out/"; cp -f results/* "$W/out/"
export SWAFL_MS="$W" MPLBACKEND=Agg PLOTDATA_DIR="$W/plotdata" PYTHONPATH="$PWD/plotdata"
python3 scripts/p3_figs.py > work/log_p3_figs.txt 2>&1 || true   # its last figures (montages of screenshots) are not part of this article
ls work/fig/p3/fig03_ws_verification.pdf work/fig/p3/fig05_engine1_heldout.pdf && echo "Figure 5a and 5b redrawn in work/fig/p3, their point data in work/plotdata"
'''}

def readme(art, figs, tabs, key):
    title = {'p1': 'Soil hydraulic memory, the recoverability of evaporation savings and the closure of the water balance (Agricultural Water Management)',
             'p4': 'The reach of suction-triggered irrigation and the marginal fate of irrigation water (Agricultural Water Management)',
             'sx': 'SWAFL: an open desktop application for equation-traceable irrigation scheduling and design with a graphical interface to the Daisy model (SoftwareX)'}[key]
    s = ['# Data and analysis of the article', '', '*%s*' % title, '',
         'Every figure and table of the article can be traced here to the numbers it shows.', '',
         '* `figures/Figure_N_*.csv`: every point drawn in Figure N, one row per point, with the panel, its title, the axis labels, the kind of mark '
         '(line, scatter, bar, error bar, band, cell of a map), the series name and the values (`x`, `y`, `y_low`/`y_high` for bars, error bars and bands; '
         '`x_category`/`y_category` give the label of a categorical axis, e.g. the soil). The rows were recorded while the original script drew the figure, so they are exactly what is plotted.',
         '* `figures/Figure_N_*__<result file>`: the result tables the figure was drawn from.',
         '* `tables/Table_N_*.csv`: every table of the article.',
         '* `replot_from_csv.py`: redraws every figure from the CSV files alone into `replot/` (`python3 replot_from_csv.py`; needs pandas and matplotlib).',
         '* `analysis/`: the original analysis: the Daisy ensemble (`data/daisy_ensemble.csv.gz`, 10 190 runs, 10 041 valid), all scripts, the archived results and `run_original.sh`, which runs it again.', '',
         '## Figures', '', '| Figure | What it shows | Data | Made by |', '|---|---|---|---|']
    for f in figs:
        for p in f['parts']:
            data = ', '.join('`figures/%s`' % x for x in ([p['csv']] if p['csv'] else []) + p['extra']) or '–'
            if p['note']: data = (data + '; ' if data != '–' else '') + p['note']
            c0 = ('(%s) %s' % (p['part'], p['sub'])) if p['sub'] else f['caption']
            cap = c0 if len(c0) < 260 else c0[:257].rsplit(' ', 1)[0] + ' …'
            s.append('| %s%s | %s | %s | `%s` |' % (f['num'], p['part'], cap.replace('|', '/'), data, p['script'] or '–'))
    s += ['', '## Tables', '', '| Table | Caption | Data |', '|---|---|---|']
    for t in tabs:
        cap = t['caption'] if len(t['caption']) < 200 else t['caption'][:197].rsplit(' ', 1)[0] + ' …'
        s.append('| %s | %s | `tables/%s` (%d rows) |' % (t['num'], cap.replace('|', '/'), t['csv'], t['rows']))
    s += ['', '## Running the analysis again', '', '```', 'cd analysis', 'python3 -m pip install -r requirements.txt', 'sh run_original.sh', '```', '',
          'Seeds are fixed (see `scripts/` and `Manuscripts/reproducibility/README_REPRODUCE.md` of the repository), so the numbers come out the same as in `analysis/results`.', '']
    return '\n'.join(s)

if __name__ == '__main__':
    for art, folder, key in ARTICLES:
        f, t = build(art, folder, key)
        print('%-16s %2d figures (%d with point data), %2d tables' % (art, len(f), sum(1 for x in f for p in x['parts'] if p['csv'] or p['extra']), len(t)))
