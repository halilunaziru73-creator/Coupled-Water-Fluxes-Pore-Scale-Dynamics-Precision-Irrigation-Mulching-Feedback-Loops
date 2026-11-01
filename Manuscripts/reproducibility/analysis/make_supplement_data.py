"""Writes the data and map sections of the four supplements (Manuscripts/tex/sN_data.tex, sN_map.tex) from the result
files of the analyses and from the map of Data/Manuscript_Data/SWAFL_Manuscripts_Data.xlsx."""
import os, re, json, glob
import pandas as pd
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')); M = os.path.join(ROOT, 'Manuscripts'); TEX = os.path.join(M, 'tex')
FILES = {'s1': sorted(glob.glob(M + '/results/p1_*')) + sorted(glob.glob(M + '/results/p2_*')),
         's2': [M + '/results/' + f for f in ['p3_swa_vars.json', 'p3_e1_sens.json', 'p3_l_sens.json', 'p3_e2_closure.json', 'p3_e2_grid.json', 'p3_bench.json', 'p3_surface.json', 'p3_surface_shipped.json', 'p3_border.json', 'p3_sprinkler.json', 'p3_drip_swafl.json', 'p3_drip_bands2.json', 'p3_ws61.csv', 'fao_out.json', 'spr_out.json', 'drip_out.json', 'e12.json', 'e12_pred.json']],
         's3': sorted(glob.glob(M + '/reproducibility/p456/out_*')),
         's4': [M + '/results/' + f for f in ['p4_tableA1_reach.csv', 'p4_table2_laws.csv', 'p4_fig4a_fate_by_soil.csv', 'p4_fig4b_fate_by_method.csv', 'p4_window.csv', 'p4_fig5_dose.csv', 'p4_fig3_trigger_runs.csv', 'p4_numbers.json']]}
PAPER = {'s1': 'Paper 1', 's2': 'Paper 2', 's3': 'Paper 3', 's4': 'Paper 4'}
CAP = 220
def esc(x):
    x = str(x)
    for a, b in [('\\', '/'), ('&', '\\&'), ('%', '\\%'), ('$', '\\$'), ('#', '\\#'), ('_', '\\_'), ('{', '('), ('}', ')'), ('~', '-'), ('^', '\\^{}')]: x = x.replace(a, b)
    return x
def fmt(v, L=None):
    if isinstance(v, float): return ('%.4g' % v)
    return esc(str(v)[:L] if L else v)
def flat(o, k=''):
    if isinstance(o, dict):
        for kk, v in o.items(): yield from flat(v, (k + '.' if k else '') + str(kk))
    elif isinstance(o, list) and all(not isinstance(x, (dict, list)) for x in o):
        yield k, ', '.join(fmt(x) for x in o[:12]) + (' ... (%d values)' % len(o) if len(o) > 12 else '')
    elif isinstance(o, list):
        for i, v in enumerate(o): yield from flat(v, k + '[%d]' % i)
    else: yield k, o
def table_tex(df, title, src, sheet):
    n = len(df); df = df.head(CAP); cols = list(df.columns)[:9]
    spec = 'l' * len(cols)
    out = ['\\subsection*{%s}' % esc(title), '\\noindent\\small Source: \\nolinkurl{%s}; %d rows%s. Workbook sheet \\texttt{%s}.\\par' % (src, n, (', first %d shown' % CAP) if n > CAP else '', esc(sheet)),
           '{\\scriptsize\\setlength{\\tabcolsep}{3pt}\\begin{longtable}{%s}' % spec, '\\toprule', ' & '.join('\\textbf{%s}' % esc(str(c)[:22]) for c in cols) + '\\\\\\midrule\\endhead']
    for _, r in df.iterrows(): out.append('{}' + ' & '.join(fmt(r[c], 46) for c in cols) + '\\\\')
    out += ['\\bottomrule', '\\end{longtable}}']
    return '\n'.join(out)
for s, files in FILES.items():
    parts = []
    for f in files:
        if not os.path.exists(f): continue
        b = os.path.basename(f); st = os.path.splitext(b)[0]; src = os.path.relpath(f, ROOT)
        sheet = ('R_' + st)[:31]
        try:
            if f.endswith('.csv'): df = pd.read_csv(f)
            elif f.endswith('.json'): df = pd.DataFrame(list(flat(json.load(open(f)))), columns=['quantity', 'value'])
            else: continue
        except Exception as e: continue
        if f.endswith('.json'):
            df['quantity'] = df['quantity'].astype(str); df['value'] = df['value'].map(lambda v: fmt(v, 150))
            parts.append('\\subsection*{%s}\n\\noindent\\small Source: \\nolinkurl{%s}; %d values%s.%s\\par\n{\\scriptsize\\begin{longtable}{p{7.2cm}p{8.6cm}}\\toprule\\textbf{quantity} & \\textbf{value}\\\\\\midrule\\endhead\n%s\n\\bottomrule\\end{longtable}}' % (
                esc(b), src, len(df), (', first %d shown' % CAP) if len(df) > CAP else '', (' Workbook sheet \\texttt{%s}.' % esc(sheet)) if '/results/' in f else '',
                '\n'.join('{}%s & %s\\\\' % (esc(str(q)[:80]), v) for q, v in df.head(CAP).values)))
        else: parts.append(table_tex(df, b, src, sheet if '/results/' in f else '(CSV file)'))
    open(os.path.join(TEX, s + '_data.tex'), 'w').write('\n\n'.join(parts) + '\n')
    m = pd.read_excel(os.path.join(ROOT, 'Data/Manuscript_Data/SWAFL_Manuscripts_Data.xlsx'), 'Table_Figure_Map'); m = m[m.Paper.str.startswith(PAPER[s])]
    rows = ['{\\scriptsize\\begin{longtable}{p{1.5cm}p{3.6cm}p{5.0cm}p{5.6cm}}\\toprule\\textbf{Item} & \\textbf{How it is made} & \\textbf{Script(s)} & \\textbf{Input and output}\\\\\\midrule\\endhead']
    for _, r in m.iterrows():
        io = '; '.join(x for x in [str(r['Input data']) if str(r['Input data']) != 'nan' else '', str(r['Output / figure file']) if str(r['Output / figure file']) != 'nan' else ''] if x)
        rows.append('{}%s & %s & %s & %s\\\\' % (esc(r.Item), esc(r['How it is made']), esc(r['Script(s)']).replace(';', '; '), esc(io).replace(';', '; ')))
    rows.append('\\bottomrule\\end{longtable}}')
    open(os.path.join(TEX, s + '_map.tex'), 'w').write('\n'.join(rows) + '\n')
    print(s, len(parts), 'data blocks,', len(m), 'items mapped')
