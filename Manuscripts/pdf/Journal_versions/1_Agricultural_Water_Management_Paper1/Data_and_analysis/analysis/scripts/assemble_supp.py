"""Assemble each supplement by topic: everything about one result (the contribution, its worked numbers, the graphs
with exact points, the figures of the article that show it, the derivations and the reasons) sits under one heading.
Reads the building blocks sN_contrib, sN_guide, sN_deriv, sN_why, sN_figs (and s4_ex*.tex) and writes sN_topics.tex;
the skeleton sN.tex inputs it. Any block not assigned to a topic is placed in a final section, so nothing is lost."""
import os, re
TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../tex')
rd = lambda f: open(os.path.join(TEX, f)).read()
PLAN = {
 's4': [("The reach of a suction trigger", "How far a crop can dry the soil at the sensor, why the limit exists, how the single constant $\\kappa$ is found from experiment E2, and how the closed form is checked.",
         dict(contrib=[1, 2, 3], guide=[1, 2, 3, 4, 5, 6], extra=['s4_exkr', 's4_exkappa', 's4_constkey', 's4_exe2'], figs=[1, 2, 3], deriv=[1, 2, 3, 4, 5], why=[1, 2, 3])),
        ("The fate of an irrigation millimetre", "Where each applied millimetre goes, computed from irrigated runs and their rainfed twins, by soil, method and season.",
         dict(contrib=[4, 6], guide=[7], extra=['s4_exfate'], figs=[4], deriv=[6], why=[4, 5, 8])),
        ("The dose law", "How the share of a dose that drains grows with the size of the dose, and why the dose scale is nearly the same in every soil.",
         dict(contrib=[5], guide=[8], extra=['s4_exdose'], figs=[5], deriv=[7], why=[6, 7])),
        ("When the lag of a sensor matters", "The non-equilibrium criterion for a suction trigger.", dict(contrib=[7], guide=[9], deriv=[8])),
        ("The trigger law in the software", "The screens of the software that apply the results, with the equations behind every number shown.", dict(figs=[6]))],
 's1': [("The soils, the experiments and the data", "The soil hydraulic functions and the experiments from which every number of the article is computed.", dict(figs=[2, 3, 4], deriv=[1])),
        ("Hydraulic memory and its rate law", "How much of the water stored at the start of a season leaves by drainage, transpiration or evaporation, and the one-parameter law that predicts it.",
         dict(contrib=[1, 2], guide=[1, 2, 3, 4], extra=['s1_constkey'], figs=[6, 7, 17, 8, 9, 11, 21, 22, 23], deriv=[2, 3, 5], why=[1, 2])),
        ("The recoverable share of an evaporation saving", "What becomes of water saved from evaporation by a lower evaporation factor or a mulch.",
         dict(contrib=[3], guide=[5], figs=[10, 12, 13, 24, 20, 19], deriv=[4, 9], why=[3, 4, 7])),
        ("The model's own water balance", "The balance found in the runs without being told, and the evaporation the model does not attribute.",
         dict(contrib=[4], guide=[6, 7], figs=[1, 14, 15, 16, 5], deriv=[6, 7], why=[5])),
        ("A compact law for evapotranspiration", "The sparse law found in log-ratio coordinates.", dict(contrib=[5], figs=[18], deriv=[8], why=[6]))],
 's2': [("Soil-specific triggers from one depletion", "How one critical depletion becomes a different suction trigger in every soil.",
         dict(contrib=[1], guide=[1, 2], figs=[2, 4, 14, 15, 30, 6], deriv=[2, 3], why=[1, 7])),
        ("Rainfall and interception", "The interception store of the daily model and the drainage that follows rain.", dict(contrib=[2], guide=[3], figs=[9, 16, 17], deriv=[8], why=[2])),
        ("Evaporation and the soil--plant--atmosphere path", "The two stages of soil evaporation and the water potential from the soil to the air.",
         dict(contrib=[3], figs=[8, 18, 31, 5, 19, 20], deriv=[4, 5, 6, 7], why=[3, 4, 5])),
        ("The model, its equations and its views", "The architecture, the ledger of equations and the result views.", dict(contrib=[4], figs=[1, 3, 12, 13, 28, 29], deriv=[1], why=[6])),
        ("Infiltration and surface irrigation", "Green--Ampt infiltration and the advance of water in a furrow.", dict(contrib=[5], guide=[4, 5], figs=[7, 11, 21, 22], deriv=[9, 10])),
        ("Drip and sprinkler irrigation", "Friction in a lateral, uniformity and nozzle discharge.", dict(guide=[6, 7], figs=[10, 23, 24, 25, 26, 27], deriv=[11, 12, 13]))],
 's3': [("The rule of origin and the bridge to Daisy", "How every number shown can be traced to a Daisy run.", dict(contrib=[1], guide=[8], figs=[1, 12, 17, 8, 18], why=[1, 2, 7])),
        ("Experiments within a run budget", "Designs that test every level of every factor within the budget the user sets.", dict(contrib=[2], guide=[6], figs=[13, 16], deriv=[9], why=[3])),
        ("Root causes of failed runs", "The classes of Daisy failures and what to do about each.", dict(contrib=[3], figs=[20, 19], why=[6])),
        ("The soil column and its hydraulic factors", "The Richards equation of the column and the factors that rewrite every horizon.", dict(contrib=[4], figs=[14, 9], deriv=[4], why=[4])),
        ("Nitrogen and the denitrification split", "The nitrogen budget and the defect found in a shared function.", dict(contrib=[5], guide=[7], figs=[15], deriv=[5, 6], why=[5])),
        ("Maps of the field", "Vegetation indices, crop coefficient, water balance, terrain, wetness and soil loss of every map cell.",
         dict(guide=[1, 2, 3, 4, 5], figs=[2, 3, 4, 5, 6, 7, 10, 11, 21, 22], deriv=[1, 2, 3, 7, 8]))]}
DATA_GUIDE = {'s1': 8, 's2': 8, 's3': None, 's4': 10}
def split(text, pat):
    """Split text at every match of pat; returns intro and list of (title, block)."""
    ms = list(re.finditer(pat, text, re.M)); intro = text[:ms[0].start()] if ms else text; out = []
    for i, m in enumerate(ms): out.append((m.group(1), text[m.end():ms[i + 1].start() if i + 1 < len(ms) else len(text)]))
    return intro, out
def fixrefs(s, t):
    if s == 's1':
        t = t.replace('Contribution~1, Section~S2.1', 'Contribution~1'); t = re.sub(r'\bS[23]\.(\d+)', r'\\ref{der:s1:\1}', t)
    if s == 's2': t = re.sub(r'\bS2\.(\d+)', r'\\ref{der:s2:\1}', t); t = t.replace('Most derivations of Section~S2', 'Most derivations of this supplement')
    if s == 's3': t = t.replace('The derivations of Section~S2', 'The derivations of this supplement')
    if s == 's4': t = re.sub(r'\bS3\.(\d+)', r'\\ref{der:s4:\1}', t)
    return t
def build(s):
    cst = rd(s + '_const.tex'); m = re.search(r'^\\subsection\{Every other constant', cst, re.M)
    if m:
        open(os.path.join(TEX, s + '_constkey.tex'), 'w').write(cst[:m.start()]); open(os.path.join(TEX, s + '_constrest.tex'), 'w').write(cst[m.start():])
    else: open(os.path.join(TEX, s + '_constrest.tex'), 'w').write(cst)
    _, con = split(rd(s + '_contrib.tex'), r'^\\subsection\{(Contribution \d+[^\n]*)\}\s*$')
    gi, gd = split(rd(s + '_guide.tex'), r'^\\subsection\{(\d+\. [^\n]*)\}\s*$')
    di, dd = split(rd(s + '_deriv.tex'), r'^\\subsection\{([^\n]*)\}\s*$')
    _, wy = split(rd(s + '_why.tex'), r'^\\paragraph\{([^}]*)\}')
    _, fg = split(rd(s + '_figs.tex'), r'^\\subsection\*\{(Figure \d+ of the article)\}\s*$')
    used = {'c': set(), 'g': set(), 'd': set(), 'w': set(), 'f': set()}
    out = []
    def put_con(k):
        t, b = con[k - 1]; used['c'].add(k); out.append('\\subsection{%s}\\label{con:%s:%d}%s' % (t, s, k, b))
    def put_g(k):
        t, b = gd[k - 1]; used['g'].add(k); num, rest = t.split('. ', 1)
        out.append('\\subsection{Worked numbers, part %s: %s}%s' % (num, rest, b))
    def put_d(k):
        t, b = dd[k - 1]; used['d'].add(k); out.append('\\subsection{Derivation: %s}\\label{der:%s:%d}%s' % (t, s, k, b))
    def put_f(n):
        for t, b in fg:
            if t == 'Figure %d of the article' % n: used['f'].add(n); out.append('\\subsection{Reading %s}%s' % (t, b)); return
    def put_w(ks):
        ks = [k for k in ks if k <= len(wy)]
        if not ks: return
        for k in ks: used['w'].add(k)
        out.append('\\subsection{Why it happens}\n' + '\n'.join('\\paragraph{%s}%s' % wy[k - 1] for k in ks))
    for title, intro, P in PLAN[s]:
        out.append('\\section{%s}\n%s\n' % (title, intro))
        for k in P.get('contrib', []): put_con(k)
        for k in P.get('guide', []): put_g(k)
        for f in P.get('extra', []):
            if os.path.exists(os.path.join(TEX, f + '.tex')): out.append('\\input{%s.tex}' % f)
        for n in P.get('figs', []): put_f(n)
        for k in P.get('deriv', []): put_d(k)
        put_w(P.get('why', []))
    left = ([('c', k) for k in range(1, len(con) + 1) if k not in used['c']] + [('g', k) for k in range(1, len(gd) + 1) if k not in used['g'] and k != DATA_GUIDE[s]] +
            [('d', k) for k in range(1, len(dd) + 1) if k not in used['d']] + [('f', int(re.search(r'\d+', t).group())) for t, _ in fg if int(re.search(r'\d+', t).group()) not in used['f']] +
            [('w', k) for k in range(1, len(wy) + 1) if k not in used['w']])
    if left:
        out.append('\\section{Other figures and derivations of the article}\nItems that serve several results at once.\n')
        for kind, k in left:
            {'c': put_con, 'g': put_g, 'd': put_d, 'f': put_f}.get(kind, lambda k: put_w([k]))(k)
    body = fixrefs(s, '\n'.join(out))
    open(os.path.join(TEX, s + '_topics.tex'), 'w').write(body + '\n')
    org = ('Each of the following sections gathers everything about one result of the article under one heading: the problem and the author\'s contribution with its pinpointed equation, '
           'the worked numbers that can be checked on a calculator or in the workbook, graphs that mark the exact points, the figures of the article with their numbered labels, '
           'the derivations, and why it happens. The terms, the constants, the tables, the path from the data to every result, the data themselves and the origin of every item follow at the end. ')
    open(os.path.join(TEX, s + '_org.tex'), 'w').write(org + fixrefs(s, di.strip()) + '\n')
    rg = gd[DATA_GUIDE[s] - 1][1] if DATA_GUIDE[s] else ''
    open(os.path.join(TEX, s + '_repro.tex'), 'w').write(fixrefs(s, rg.strip()) + '\n')
    print(s, 'topics', len(PLAN[s]), 'left over', left)
if __name__ == '__main__':
    for s in ['s1', 's2', 's3', 's4']: build(s)
