"""Writes, for each supplement, the sections that explain every term of the author's equations (sN_terms.tex), how each table of
the article is produced (sN_tabs.tex) and how to read every figure (sN_figs.tex). Captions and numbers are taken from the article."""
import os, re, sys
import pandas as pd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from explain_terms import TERMS
from explain_figs import FIG, GENERIC_SHOT
ROOT = os.path.abspath(os.path.join(HERE, '../../..')); TEX = os.path.join(ROOT, 'Manuscripts/tex')
MAP = pd.read_excel(os.path.join(ROOT, 'Data/Manuscript_Data/SWAFL_Manuscripts_Data.xlsx'), 'Table_Figure_Map')
PAP = {'p1': 'Paper 1', 'p2': 'Paper 2', 'p3': 'Paper 3', 'p4': 'Paper 4'}
TABNOTE = {
 'p4:tab:data4': 'One row per experiment used. The script counts the runs of each experiment in the summary of all runs, keeps those with status ok, lists the factors that take more than one value, and averages yield, irrigation, drainage, ET, nitrate leaching and Daisy run time over the valid runs.',
 'p4:tab:laws': 'One row per candidate law. For each law the script finds the constant(s) that minimise the squared distance (in decades) between the predicted reach and the observed interval of every soil; it then removes each soil in turn, refits, and records the error on the removed soil. ``Inside'' counts the soils predicted within their interval; ``worst factor'' is $10$ to the largest error.',
 'p4:tab:reachall': 'One row per soil: the van~Genuchten parameters, the observed interval of the reach from experiment E2 (driest trigger that still irrigates at least 5\\,mm a year, and the next drier one), the reach from \\cref{eq:hc} with the fitted $\\kappa$, and the yields at a 300\\,cm trigger, without irrigation and with the best trigger. The same table is live in sheet \\texttt{EQ\\_P4\\_reach}.',
 'p4:tab:novelty': 'A descriptive table: each row sets a contribution against prior work and names the figure or number that supports it.'}
def resolve(text, lab):
    def rep(m):
        out = []
        for l in m.group(2).split(','):
            l = l.strip(); n = lab.get(l)
            if not n: out.append('?'); continue
            pre = 'Eq.~(%s)' % n if l.startswith('eq') else 'Fig.~%s' % n if l.startswith('fig') else 'Table~%s' % n if l.startswith('tab') else 'Section~%s' % n
            out.append(pre)
        return ' and '.join(out) + ' of the article'
    text = re.sub(r'\\([cC]ref|ref)\{([^}]*)\}', rep, text)
    return re.sub(r'\\label\{[^}]*\}', '', text)
def expand(f):
    s = open(os.path.join(TEX, f)).read()
    def inc(m):
        n = m.group(1) if m.group(1).endswith('.tex') else m.group(1) + '.tex'
        return expand(n) if n != 'pre.tex' and os.path.exists(os.path.join(TEX, n)) else ''
    return re.sub(r'\\input\{([^}]+)\}', inc, s)
CAP = r'\\caption\{((?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*)\}'
for p in ['p1', 'p2', 'p3', 'p4']:
    s = 's' + p[1]; src = expand(p + '.tex')
    lab = {m.group(1): m.group(2) for m in re.finditer(r'\\newlabel\{([^}]+)\}\{\{([^}]*)\}', open(os.path.join(TEX, p + '.aux')).read())}
    mp = MAP[MAP.Paper.str.startswith(PAP[p])].set_index('Label')
    def made(L):
        if L not in mp.index: return ''
        r = mp.loc[L]; sc = str(r['Script(s)']); io = str(r['Input data']) if str(r['Input data']) != 'nan' else ''
        t = '\\textbf{How it is made.} ' + str(r['How it is made']).replace('_', '\\_') + '.'
        if sc not in ('-', 'nan', ''): t += ' Script: \\nolinkurl{%s}.' % sc.split(';')[0].strip()
        if io: t += ' Input: \\nolinkurl{%s}.' % io.split(' ')[0]
        return t
    # ---------------- terms
    out = []
    for title, rows in TERMS.get(s, []):
        out.append('\\subsection*{%s}' % title)
        out.append('{\\small\\begin{longtable}{>{\\raggedright\\arraybackslash}p{2.2cm}>{\\raggedright\\arraybackslash}p{4.8cm}>{\\raggedright\\arraybackslash}p{1.4cm}>{\\raggedright\\arraybackslash}p{3.2cm}>{\\raggedright\\arraybackslash}p{3.6cm}}\\toprule Term & What it means & Unit & Where the value comes from & When it rises\\\\\\midrule\\endhead')
        for r in rows: out.append(' & '.join(r) + '\\\\')
        out.append('\\bottomrule\\end{longtable}}')
    open(os.path.join(TEX, s + '_terms.tex'), 'w').write('\n'.join(out) + '\n')
    # ---------------- tables
    out = []
    for env in re.finditer(r'\\begin\{(table|longtable)\}(.*?)\\end\{\1\}', src, re.S):
        b = env.group(2); m = re.search(r'\\label\{(tab:[^}]+)\}', b)
        if not m: continue
        L = m.group(1); n = lab.get(L, '?'); c = re.search(CAP, b); cap = resolve(c.group(1), lab) if c else ''
        out.append('\\paragraph{Table %s of the article.} \\emph{%s}' % (n, cap))
        note = TABNOTE.get(p + ':' + L)
        if note: out.append('\\textbf{How the output is produced.} ' + resolve(note, lab))
        out.append(made(L))
    open(os.path.join(TEX, s + '_tabs.tex'), 'w').write('\n\n'.join(out) + '\n')
    # ---------------- figures
    out = []
    for env in re.finditer(r'\\begin\{figure\}(.*?)\\end\{figure\}', src, re.S):
        b = env.group(1); m = re.search(r'\\label\{(fig:[^}]+)\}', b)
        if not m: continue
        L = m.group(1); n = lab.get(L, '?'); caps = [resolve(c, lab) for c in re.findall(CAP, b)]
        main = caps[-1] if caps else ''; subs = caps[:-1]
        read, why = FIG.get(p + ':' + L, GENERIC_SHOT)
        out.append('\\subsection*{Figure %s of the article}' % n)
        out.append('\\textbf{What it shows.} ' + main + (' Panels: ' + ' '.join('(%s) %s' % (chr(97 + i), x.rstrip('.') + '.') for i, x in enumerate(subs)) if subs else ''))
        out.append('\\textbf{How to read the labels, symbols and colours.} ' + resolve(read, lab))
        out.append('\\textbf{What affects it, and why it happens.} ' + resolve(why, lab))
        out.append(made(L))
    open(os.path.join(TEX, s + '_figs.tex'), 'w').write('\n\n'.join(out) + '\n')
    print(s, 'figures', len(re.findall(r'\\begin\{figure\}', src)), 'tables', len(re.findall(r'\\begin\{(?:table|longtable)\}', src)))
