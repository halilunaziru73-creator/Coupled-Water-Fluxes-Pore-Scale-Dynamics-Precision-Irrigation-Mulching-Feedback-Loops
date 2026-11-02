"""Writes, for each supplement, the sections that explain every term of the author's equations (sN_terms.tex), how each table of
the article is produced (sN_tabs.tex) and how to read every figure (sN_figs.tex). Captions and numbers are taken from the article."""
import os, re, sys
import pandas as pd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from explain_terms import TERMS
from explain_figs import FIG, GENERIC_SHOT
ROOT = os.path.abspath(os.path.join(HERE, '../../..')); TEX = os.path.join(ROOT, 'Manuscripts/tex')
import json
CALL4 = json.load(open(os.path.join(ROOT, 'Manuscripts/results/p4_callouts.json')))
MEAN = [(r'View Run Daisy Help|^SWAFL', 'the menu bar of the program (file, view, run, Daisy, help)'), (r'Next 14 days', 'the decision for the next 14 days, from the soil water of the day'),
 (r'^Output', 'the output bar of the layer: title and caption of the picture, save the picture, full screen, numbers as CSV'), (r'Choose a case', 'the ready-made cases of the Properties panel'),
 (r'Import weather|Online weather|Change weather|Weather and climate', 'the weather of the project: built-in record, a file of the user or online weather of any place'),
 (r'Irrigation design|Drip irrigation design|Sprinkler', 'the irrigation-design group of the Layers tree and its layers'), (r'Field balance|water balance', 'the field water balance: inputs, outputs and storage of the root zone'),
 (r'Every layer|zip', 'saves every layer of the project as pictures in one archive'), (r'trigger', 'the suction (or depletion) at which irrigation starts'),
 (r'Daisy', 'the Daisy model and its workbench'), (r'Precipitation|rain', 'rain, from the weather of the project'), (r'[Dd]rainage', 'water leaving the root zone below 1 m'),
 (r'[Ee]vaporation', 'evaporation from the soil (and, where stated, from mulch or canopy)'), (r'Mulch|mulch', 'the surface cover and its effect on evaporation'),
 (r'NDVI|GNDVI|indices|Bands', 'satellite indices of the vegetation computed from the Sentinel-2 bands'), (r'Export|report', 'export of the field report and its maps'),
 (r'Next step|Next question|Back', 'moves to the next or previous step of the guided path'), (r'Water sources|water from', 'the ranked sources of irrigation water near the field'),
 (r'Soil|soil|Loam|Sand|Clay', 'the soil of the project, which every layer uses'), (r'[Cc]rop|Wheat|wheat|Cereal', 'the crop of the project and its stage'),
 (r'Root|root', 'the roots: depth, density and uptake'), (r'Sensor|sensor', 'the soil-water sensor: its depth and reading'), (r'mm per day|per day', 'a rate in millimetres per day'),
 (r'Regime map', 'where a mulch saves water and where the saving drains'), (r'Feedback', 'the feedback loops between climate, management, soil water, crop and nitrogen')]
def meaning(t):
    for pat, m in MEAN:
        if re.search(pat, t): return m
    return 'a heading or control of this screen; the caption above says which layer it belongs to'
def panels(cap):
    return {m.group(1): m.group(2).strip(' ;,.') for m in re.finditer(r'\(([a-l])\)\s*(.*?)(?=\s*\([a-l]\)|$)', cap)}
ANN = {p: json.load(open(os.path.join(ROOT, 'Manuscripts/results/annot_%s.json' % p))) for p in ['p1', 'p2', 'p3', 'p4']}
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
def files_of(b): return re.findall(r'\\includegraphics(?:\[[^]]*\])?\{([^}]+)\}', b)
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
        pan = panels(main)
        imgs = []
        if p == 'p4' and L != 'fig:soft':
            for g in files_of(b):
                stem = os.path.splitext(os.path.basename(g))[0]
                if stem in CALL4: imgs.append(('../figures/paper4/%s_annot.png' % stem, [('call', t) for t in CALL4[stem]]))
        else:
            for it in ANN[p].get(L, []): imgs.append((it['file'], [(l['kind'], l['text']) for l in it['labels']]))
        if not imgs:
            for g in files_of(b): imgs.append((g.replace('\\figdir', '../figures'), []))
        for k, (f, labs) in enumerate(imgs):
            out.append('\\begin{center}\\includegraphics[width=\\textwidth,height=0.42\\textheight,keepaspectratio]{%s}\\end{center}' % f)
            if labs:
                head = '\\textbf{What the numbered labels point to%s.}' % ((' (picture %d of %d%s)' % (k + 1, len(imgs), ': ' + subs[k] if k < len(subs) else '')) if len(imgs) > 1 else '')
                items = []
                for kind, t in labs:
                    if kind == 'call': items.append(t.replace('d_D', '$d_D$').replace('%', '\\%').replace('kappa = 3.47e-10', 'KAPPAVAL').replace('kappa', '$\\kappa$').replace('alpha', '$\\alpha$').replace('KAPPAVAL', '$\\kappa=3.47\\times10^{-10}$'))
                    elif kind == 'panel': items.append('Panel (%s): %s.' % (t, pan[t].rstrip('.') if t in pan and pan[t].count('$') % 2 == 0 and pan[t].count('{') == pan[t].count('}') else 'see the caption above'))
                    else: items.append('``%s\'\': %s.' % (t.replace('%', '\\%').replace('&', '\\&').replace('#', '\\#').replace('$', '\\$').replace('_', '\\_'), meaning(t)))
                out.append(head + '\n\\begin{enumerate}[nosep,label=\\protect\\circled{\\arabic*}]\n' + '\n'.join('\\item ' + x for x in items) + '\n\\end{enumerate}')
        out.append('\\textbf{What it shows.} ' + main + (' Panels: ' + ' '.join('(%s) %s' % (chr(97 + i), x.rstrip('.') + '.') for i, x in enumerate(subs)) if subs else ''))
        out.append('\\textbf{How to read the labels, symbols and colours.} ' + resolve(read, lab))
        out.append('\\textbf{What affects it, and why it happens.} ' + resolve(why, lab))
        out.append(made(L))
    open(os.path.join(TEX, s + '_figs.tex'), 'w').write('\n\n'.join(out) + '\n')
    print(s, 'figures', len(re.findall(r'\\begin\{figure\}', src)), 'tables', len(re.findall(r'\\begin\{(?:table|longtable)\}', src)))
