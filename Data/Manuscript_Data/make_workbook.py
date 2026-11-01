"""Build SWAFL_Manuscripts_Data.xlsx and README.md: the data used in the four papers and, for every table and
figure of each paper, the script that makes it, its input and its output.  Run from the repository root or anywhere:
    python3 Data/Manuscript_Data/make_workbook.py
Needs pandas and openpyxl. Reads the manuscript sources (Manuscripts/tex), their .aux files (built PDFs) for the
numbers and captions, the scripts in Manuscripts/reproducibility, the results in Manuscripts/results and the data in Data/."""
import os, re, json, glob
import pandas as pd
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
TEX = os.path.join(ROOT, 'Manuscripts/tex'); RES = os.path.join(ROOT, 'Manuscripts/results')
PAPERS = {'p1': 'Paper 1 - Soil hydraulic memory and water-balance closure', 'p2': 'Paper 2 - Soil-water-atmosphere modelling for irrigation',
          'p3': 'Paper 3 - SWAFL Desktop suite, Daisy workbench and bridge', 'p4': 'Paper 4 - Reach of a suction trigger and fate of irrigation'}
SCRIPTS = [p for p in glob.glob(os.path.join(ROOT, 'Manuscripts/**/*'), recursive=True) if p.endswith(('.py', '.js', '.sh')) and '/tex/' not in p and 'vendor' not in p and 'node_modules' not in p and not p.endswith('.min.js')]
SRC = {p: open(p, errors='ignore').read() for p in SCRIPTS}
rel = lambda p: os.path.relpath(p, ROOT)
def expand(f):
    s = open(os.path.join(TEX, f), errors='ignore').read()
    return re.sub(r'\\input\{([^}]+)\}', lambda m: expand(m.group(1) if m.group(1).endswith('.tex') else m.group(1) + '.tex') if os.path.exists(os.path.join(TEX, m.group(1) if m.group(1).endswith('.tex') else m.group(1) + '.tex')) else '', s)
def plain(t):
    t = re.sub(r'\\(cref|Cref|ref|citep|citet|cite)\{[^}]*\}', '', t); t = re.sub(r'\$[^$]*\$', '', t)
    t = re.sub(r'\\[a-zA-Z]+\*?(\[[^]]*\])?', '', t); t = t.replace('{', '').replace('}', '').replace('~', ' ').replace('\\', '')
    return re.sub(r'\s+', ' ', t).strip()
def auxlabels(p):
    out = {}
    a = os.path.join(TEX, p + '.aux')
    if os.path.exists(a):
        for m in re.finditer(r'\\newlabel\{((?:fig|tab):[^}]+)\}\{\{([^}]*)\}\{([^}]*)\}', open(a, errors='ignore').read()): out[m.group(1)] = (m.group(2), m.group(3))
    return out
def script_for(stem):
    for st in [stem, re.sub(r'_A4$', '', stem), re.sub(r'^fig\d+[a-z]?_', '', stem)]:
        hits = [rel(p) for p, s in SRC.items() if st in s and not p.endswith('make_workbook.py')]
        if hits: return sorted(set(hits), key=len)[:3]
    return []
RTXT = {}
for f in glob.glob(os.path.join(RES, '*')) + glob.glob(os.path.join(ROOT, 'Manuscripts/reproducibility/intermediates/*')) + glob.glob(os.path.join(ROOT, 'Results/07_Derived_Data_Tables/*.csv')):
    try: RTXT[f] = open(f, errors='ignore').read()
    except Exception: pass
def source_of_numbers(body):
    nums = set(re.findall(r'(?<![\d.])-?\d+\.\d{2,}', re.sub(r'\\caption\{.*?\}', '', body)))
    if len(nums) < 3: return None, 0
    best = max(RTXT, key=lambda f: sum(1 for x in nums if x in RTXT[f]))
    hits = sum(1 for x in nums if x in RTXT[best]); return (best if hits >= 3 and hits >= 0.3 * len(nums) else None), hits
DESCR = ('notation', 'exp', 'soils', 'lib', 'hyp', 'drivers', 'mgmt', 'compartments', 'controls', 'expuse', 'daisyvars', 'layers', 'match', 'planner', 'routes', 'richardssoils', 'novelty', 'soilsP2', 'soilsP3', 'laws')
A = 'Manuscripts/reproducibility/analysis/'; R = 'Manuscripts/results/'
P4 = {'tab:laws': ('Table written by the script', [A + 'p4_reach.py'], R + 'p4_table2_laws.csv (sheet R_p4_table2_laws)'),
      'tab:novelty': ('Descriptive table (claims and the evidence cited in the text); no computation', [], ''),
      'fig:curves': ('Figure drawn by the script from the input data', [A + 'p4_reach.py'], 'Manuscripts/figures/paper4/fig2_curves_reach.pdf; data ' + R + 'p4_tableA1_reach.csv'),
      'fig:trigger': ('Figure drawn by the script from the input data', [A + 'p4_reach.py'], 'Manuscripts/figures/paper4/fig3_trigger_reach.pdf; data ' + R + 'p4_fig3_trigger_runs.csv, p4_tableA1_reach.csv'),
      'fig:fate': ('Figure drawn by the script from the input data', [A + 'p4_reach.py'], 'Manuscripts/figures/paper4/fig4_marginal_fate.pdf; data ' + R + 'p4_fig4a_fate_by_soil.csv, p4_fig4b_fate_by_method.csv'),
      'fig:dose': ('Figure drawn by the script from the input data', [A + 'p4_reach.py'], 'Manuscripts/figures/paper4/fig5_dose.pdf; data ' + R + 'p4_fig5_dose.csv'),
      'fig:concept': ('Schematic drawn by the script with numbers from the results', [A + 'p4_concept.py'], 'Manuscripts/figures/paper4/fig1_concept.pdf; numbers ' + R + 'p4_numbers.json'),
      'tab:reachall': ('Table written by the script', [A + 'p4_reach.py'], R + 'p4_tableA1_reach.csv (sheet R_p4_tableA1_reach)'),
      'tab:repro4': ('Descriptive table (this map in short); no computation', [], ''),
      'fig:soft': ('Screen capture of SWAFL Desktop 1.1.0 (not regenerated)', [], 'Manuscripts/figures/shots_jpg/real_trigger_law.jpg; zaria_matric_potential.jpg; wb_step3_experiments.jpg')}
rows = []
for p, title in PAPERS.items():
    s = expand(p + '.tex'); lab = auxlabels(p)
    # repro appendix rows: label -> script text
    rep = {}
    for row in re.findall(r'\n([^\n]*?(?:\\ref|\\cref)\{[^\n]*?)\\\\', s):
        cells = row.split('&')
        if len(cells) >= 2:
            for L in re.findall(r'(?:ref|cref)\{([^}]+)\}', cells[0]):
                for l in L.split(','): rep.setdefault(l.strip(), []).append(plain('&'.join(cells[1:])))
    for env in re.finditer(r'\\begin\{(figure|table|longtable)\}(.*?)\\end\{\1\}', s, re.S):
        body = env.group(2); lm = re.search(r'\\label\{((?:fig|tab):[^}]+)\}', body)
        if not lm: continue
        L = lm.group(1); kind = 'Figure' if L.startswith('fig') else 'Table'
        cap = re.search(r'\\caption\{(.*)', body, re.S); cap = plain(cap.group(1))[:240] if cap else ''
        num, page = lab.get(L, ('', ''))
        gfx = re.findall(r'\\includegraphics(?:\[[^]]*\])?\{([^}]+)\}', body)
        inputs = re.findall(r'\\input\{([^}]+)\}', body)
        script, inp, outp, how = [], '', '', ''
        if gfx:
            files = [g.replace('\\figdir', 'Manuscripts/figures') for g in gfx]; outp = '; '.join(files)
            for g in gfx:
                if 'shots' not in g: script += script_for(os.path.splitext(os.path.basename(g))[0])
            if script: how = 'Figure drawn by the script from the input data'
            elif all(g.endswith(('.jpg', '.png')) for g in gfx): how = 'Screen capture of SWAFL Desktop 1.1.0 (not regenerated)'
            else: how = 'Schematic drawn for the paper (no data)'
        if kind == 'Table':
            if 'tab:data' == L: script = ['Manuscripts/reproducibility/analysis/data_overview.py']; how = 'Table written by the script (tex/data_table.tex)'
            elif inputs: script = script_for(inputs[0]); how = 'Table file written by the script'
            else:
                src, nh = source_of_numbers(body)
                if src:
                    script = script_for(os.path.splitext(os.path.basename(src))[0]) or []; outp = rel(src)
                    how = 'Table typed from the result file (%d of its numbers found there)' % nh
                elif L.split(':')[1] in DESCR or L.split(':')[1].startswith(DESCR): how = 'Descriptive table (definitions, design, parameters or tests); no computation'
                else: how = 'Table typed in the manuscript from the result files of the script'
        if L in rep: script = script + [t for r in rep[L] for t in re.findall(r'[\w./-]+\.(?:py|js|sh)', r)]
        if p == 'p4' and L in P4: how, script, outp = P4[L]
        if any(w in how for w in ('Screen', 'Descriptive', 'Schematic drawn for')): inp = ''
        elif 'Data/Comprehensive' in body or 'Comprehensive' in ' '.join(script) or p == 'p4': inp = 'Data/Comprehensive_Summary/00_summary_all_simulations.csv.gz'
        elif not inp and how and 'Screen' not in how and 'Descriptive' not in how and 'Schematic' not in how: inp = 'Data/daisy_ensemble.csv.gz (10 190 runs)'
        rows.append({'Paper': title, 'Item': kind + ' ' + num, 'Page (PDF)': page, 'Label': L, 'Caption (start)': cap, 'How it is made': how or 'Table typed in the manuscript',
                     'Script(s)': '; '.join(x for x in dict.fromkeys(script) if not any(y != x and y.endswith('/' + x) for y in script)) or ('-' if ('Screen' in how or 'Descriptive' in how or 'Schematic' in how) else '(see the reproducibility appendix of the paper)'), 'Input data': inp, 'Output / figure file': outp})
MAP = pd.DataFrame(rows)
# ---------------------------------------------------------------- workbook
D = os.path.join(ROOT, 'Data'); CS = os.path.join(D, 'Comprehensive_Summary')
sheets = {}
sheets['README'] = pd.DataFrame({'Item': ['What', 'Papers', 'Sheets', 'Run data', 'Derived results', 'Rebuild', 'Units'], 'Description': [
    'The data used in the four manuscripts of the project, and how every table and figure is made.',
    '; '.join(PAPERS.values()),
    'Table_Figure_Map: every table and figure of each paper with its script, input and output. Experiments: one row per Daisy experiment. Ensemble_runs: the run table of Papers 1-3. All_runs_summary: the one-row-per-run summary of all 10 190 runs (Paper 4 and the data table of all papers). R_*: the result files of the analysis scripts (Manuscripts/results), one sheet each; JSON files are flattened to key/value rows. D_*: derived tables of Results/07_Derived_Data_Tables.',
    'Data/daisy_ensemble.csv.gz and Data/Comprehensive_Summary/*.csv.gz (every log of every run, per experiment, too large for one workbook: use the CSV files).',
    'Manuscripts/results (written by the scripts of Manuscripts/reproducibility); Results/07_Derived_Data_Tables (derive_tables.py).',
    'python3 Data/Manuscript_Data/make_workbook.py (after building the PDFs, so the table and figure numbers are current).',
    'Fluxes in mm per year (20-year means 1980-1999), yield in Mg/ha, nitrogen in kg N/ha per year, suction in cm, unless a column says otherwise.']})
sheets['Table_Figure_Map'] = MAP
sheets['Experiments'] = pd.read_csv(os.path.join(CS, '00_SUMMARY_ALL_EXPERIMENTS.csv.gz'))
sheets['Ensemble_runs'] = pd.read_csv(os.path.join(D, 'daisy_ensemble.csv.gz'))
allr = pd.read_csv(os.path.join(CS, '00_summary_all_simulations.csv.gz'), low_memory=False)
sheets['All_runs_summary'] = allr.drop(columns=[c for c in ['folder', 'done_marker', 'output_files', 'file_read_problems', 'SIMFILE'] if c in allr.columns])
def flat(o, k=''):
    if isinstance(o, dict):
        for kk, v in o.items(): yield from flat(v, (k + '.' if k else '') + str(kk))
    elif isinstance(o, list) and o and all(not isinstance(x, (dict, list)) for x in o) and len(o) <= 60: yield k, ', '.join(map(str, o))
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from flat(v, k + '[%d]' % i)
    else: yield k, o
used = set()
def sname(base):
    n = re.sub(r'[\[\]\*\?/\\:]', '_', base)[:31]; i = 2
    while n in used: n = n[:28] + '_%d' % i; i += 1
    used.add(n); return n
for k in list(sheets): used.add(k)
for f in sorted(glob.glob(os.path.join(RES, '*'))):
    b = os.path.splitext(os.path.basename(f))[0]
    try:
        df = pd.read_csv(f) if f.endswith('.csv') else pd.DataFrame(list(flat(json.load(open(f)))), columns=['key', 'value']) if f.endswith('.json') else None
    except Exception: df = None
    if df is not None: sheets[sname('R_' + b)] = df.head(200000)
for f in sorted(glob.glob(os.path.join(ROOT, 'Results/07_Derived_Data_Tables/*.csv'))):
    sheets[sname('D_' + os.path.splitext(os.path.basename(f))[0])] = pd.read_csv(f)
out = os.path.join(HERE, 'SWAFL_Manuscripts_Data.xlsx')
with pd.ExcelWriter(out, engine='openpyxl') as w:
    for n, df in sheets.items(): df.to_excel(w, sheet_name=n, index=False)
    for n in w.sheets:
        ws = w.sheets[n]; ws.freeze_panes = 'A2'
        for col in ws.columns:
            L = max((len(str(c.value)) if c.value is not None else 0) for c in list(col)[:200]); ws.column_dimensions[col[0].column_letter].width = min(60, max(9, L + 2))
# ---------------------------------------------------------------- README.md
md = ['# The data of the four manuscripts', '', 'This folder holds [`SWAFL_Manuscripts_Data.xlsx`](SWAFL_Manuscripts_Data.xlsx), one Excel workbook with the data used in all four papers, and this map of how every table and figure is made. Both are written by [`make_workbook.py`](make_workbook.py).', '',
      '| Sheet | Content |', '|:--|:--|', '| `Table_Figure_Map` | every table and figure of each paper: script, input, output (the tables below) |', '| `Experiments` | one row per Daisy experiment (`Data/Comprehensive_Summary/00_SUMMARY_ALL_EXPERIMENTS.csv.gz`) |',
      '| `Ensemble_runs` | the run table of Papers 1 to 3 (`Data/daisy_ensemble.csv.gz`, 10 190 runs) |', '| `All_runs_summary` | one row per run with the settings read from each set-up file (`00_summary_all_simulations.csv.gz`; Paper 4 and the data table of all papers) |',
      '| `R_*` | each result file of the analysis scripts (`Manuscripts/results`); JSON flattened to key and value |', '| `D_*` | the derived tables of `Results/07_Derived_Data_Tables` |', '',
      'The analysis scripts are in [`Manuscripts/reproducibility`](../../Manuscripts/reproducibility); `run_all.sh` there regenerates the results of Papers 1 to 3, and `analysis/p4_reach.py` and `analysis/data_overview.py` those of Paper 4 and of the data table and figure shared by all four papers. Screen captures of the software are not regenerated.', '']
for p, title in PAPERS.items():
    md += ['## ' + title, '', '| Item | How it is made | Script(s) | Input | Output |', '|:--|:--|:--|:--|:--|']
    for _, r in MAP[MAP.Paper == title].iterrows():
        md.append('| %s | %s | %s | %s | %s |' % (r.Item, r['How it is made'], r['Script(s)'].replace('|', '/'), r['Input data'], r['Output / figure file'].replace('Manuscripts/figures/', '')))
    md.append('')
open(os.path.join(HERE, 'README.md'), 'w').write('\n'.join(md) + '\n')
print(out, len(sheets), 'sheets;', len(MAP), 'tables and figures mapped'); print(MAP.groupby('Paper')['Item'].count())
print((MAP['Script(s)'].str.startswith('(none')).groupby(MAP.Paper).sum())
