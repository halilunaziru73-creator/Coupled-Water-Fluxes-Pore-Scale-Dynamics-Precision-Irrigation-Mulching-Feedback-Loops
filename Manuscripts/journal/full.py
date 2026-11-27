#!/usr/bin/env python3
"""Supplementary Material S1 of the journal articles: the COMPLETE text of the manuscripts.

The articles themselves (src/ -> build.py) are kept within the limits of the journals; everything else is
published, complete and in the order of the article, in this Supplementary Material S1.

Each full manuscript in ../tex (the source of the PDFs in ../pdf) is taken as it is, every section, list of
symbols, figure, table and appendix in the same order, and only its format is changed: the Elsevier
elsarticle class, the journal front matter (title, author, abstract, highlights, keywords), the Elsevier
names of the declarations and the reference style of the journal. Papers 2 and 3 are merged section by
section into one software paper, with every sentence of both.

    python3 full.py            # writes and builds the three Supplementary Material S1 files
"""
import re, subprocess, pathlib
J = pathlib.Path(__file__).resolve().parent
T = J.parent / 'tex'
rd = lambda f: (T / f).read_text(encoding='utf-8')

WHAT = 'This supplement gives the complete text of the study, every section, the list of symbols, every figure, table, equation and appendix, in the order of the article. The article presents the main line within the length of the journal; the sections here carry the full derivations, analyses, figures and tables to which the article refers.'

HIGHLIGHTS = {'AWM_Paper1.tex': ['Drainage share of released soil storage ranged from 0.02 to 0.85 across ten soils', 'A one-parameter rate-competition law predicted it for held-out soils', 'Warming raised and wetter climates lowered the recoverable evaporation saving', 'Reported ET components omitted an unattributed term of 30\\% of ET', 'Judged on soil evaporation alone, the drainage share erred in 6 of 10 soils'], 'AWM_Paper4.tex': ['A closed form gives the reach of a suction trigger from van Genuchten parameters', 'It predicted the reach of held-out soils within a factor of 2.3', 'Common 300 cm triggers never fired on sand and loamy sand, leaving crops rainfed', 'Of each irrigation millimetre, 38\\% was transpired, 44\\% evaporated, 16\\% drained', 'The drained share rose with dose on a soil-independent scale of about 4 mm']}

METADATA = '\\section*{Code metadata}\n\\begin{table}[H]\\centering\\small\n\\begin{tabularx}{\\textwidth}{lp{5.2cm}X}\n\\toprule\nNr. & Code metadata description & Metadata\\\\\\midrule\nC1 & Current code version & v1.1.0\\\\\nC2 & Permanent link to code/repository used for this code version & \\url{\\repourl}\\\\\nC3 & Permanent link to Reproducible Capsule & Not available; all checks re-run from \\texttt{Manuscripts/reproducibility}\\\\\nC4 & Legal Code License & MIT; Daisy is distributed under its own licence\\\\\nC5 & Code versioning system used & git\\\\\nC6 & Software code languages, tools, and services used & JavaScript (Electron, Node.js), HTML/CSS; Python for the verification scripts; Daisy 7.1.14\\\\\nC7 & Compilation requirements, operating environments \\& dependencies & Node.js and Electron (build); Leaflet and geotiff.js and Daisy 7.1.14 for Windows (bundled); runs on Windows, macOS, Linux and in a web browser\\\\\nC8 & If available, link to developer documentation/manual & \\url{\\manualurl}\\\\\nC9 & Support email for questions & halilunaziru73@gmail.com\\\\\\bottomrule\n\\end{tabularx}\n\\end{table}\n\n\\section*{Software metadata}\n\\begin{table}[H]\\centering\\small\n\\begin{tabularx}{\\textwidth}{lp{5.2cm}X}\n\\toprule\nNr. & Software metadata description & Metadata\\\\\\midrule\nS1 & Current software version & 1.1.0\\\\\nS2 & Permanent link to executables of this version & \\url{\\exeurl}\\\\\nS3 & Permanent link to Reproducible Capsule & Not available\\\\\nS4 & Legal Software License & MIT (source); end-user licence for the compiled application\\\\\nS5 & Computing platforms/Operating Systems & Microsoft Windows (portable executable with Daisy); macOS and Linux (Electron); any modern web browser (everything except running Daisy)\\\\\nS6 & Installation requirements \\& dependencies & None for the Windows executable (no installation, administrator rights or network)\\\\\nS7 & If available, link to user manual & \\url{\\manualurl}\\\\\nS8 & Support email for questions & halilunaziru73@gmail.com\\\\\\bottomrule\n\\end{tabularx}\n\\end{table}\n\n'

# ---------------------------------------------------------------- preamble
def preamble(cls_opts):
    keep = []
    for l in rd('pre.tex').split('\n'):
        if l.startswith('\\documentclass') or 'natbib' in l \
           or l.startswith('\\bibliographystyle') or 'fancyhdr' in l or l.startswith('\\pagestyle') \
           or l.startswith('\\setlength{\\headheight}') or l.startswith('\\titleformat{\\section') \
           or l.startswith('\\titleformat{\\subsection') or l.startswith('\\titleformat{\\subsubsection'):
            continue
        keep.append('\\usepackage[pass]{geometry}' if l.startswith('\\usepackage[margin') else l)
    p = '\\documentclass[%s]{elsarticle}\n' % cls_opts + '\n'.join(keep)
    p += '\n\\makeatletter\\def\\input@path{{../tex/}}\\makeatother\n'
    p += '\\crefname{figure}{Fig.}{Figs.}\\Crefname{figure}{Fig.}{Figs.}\n'
    return p

def parts(name):
    s = rd(name)
    pre_extra = s.split('\\input{pre.tex}', 1)[1].split('\\begin{document}', 1)[0]
    pre_extra = re.sub(r'\\hypersetup\{[^\n]*\}\n?', '', pre_extra)
    title = re.search(r'pdftitle=\{([^}]*)\}', s).group(1)
    tp = s.split('\\begin{titlepage}', 1)[1].split('\\end{titlepage}', 1)[0]
    abstract = re.search(r'\\noindent (.*?)\n\n\\medskip\\noindent \\textbf\{Keywords\.\}', tp, re.S).group(1).strip()
    keywords = re.search(r'\\textbf\{Keywords\.\}\s*(.*?)\\par\}', tp, re.S).group(1).strip()
    body = s.split('\\end{titlepage}', 1)[1].split('\\bibliography{refs}', 1)[0]
    app = s.split('\\appendix', 1)[1].split('\\end{document}', 1)[0] if '\\appendix' in s else ''
    return dict(pre=pre_extra, title=title, abstract=abstract, keywords=keywords, body=body, app=app, src=s)

def elsevier_backmatter(b):
    b = b.replace('\\section*{Author contributions}', '\\section*{CRediT authorship contribution statement}')
    b = b.replace('\\section*{Competing interests}', '\\section*{Declaration of competing interest}')
    return b

def front(title, abstract, highlights, keywords, extra=''):
    kw = ' \\sep '.join(k.strip() for k in keywords.rstrip('.').split(';') if k.strip())
    hl = ('\\begin{highlights}\n' + '\n'.join('\\item ' + h for h in highlights) + '\n\\end{highlights}\n') if highlights else ''
    return ('\\begin{frontmatter}\n\\title{%s}\n' % title +
            '\\author[aua,upna]{Naziru Halilu\\corref{cor1}}\n\\ead{halilunaziru73@gmail.com}\n'
            '\\cortext[cor1]{Corresponding author. ORCID: 0009-0006-2324-9599.}\n'
            '\\affiliation[aua]{organization={Agricultural University of Athens},city={Athens},country={Greece}}\n'
            '\\affiliation[upna]{organization={Public University of Navarre},city={Pamplona},country={Spain}}\n'
            '\\begin{abstract}\n%s\n\\end{abstract}\n%s\\begin{keyword}\n%s\n\\end{keyword}\n\\end{frontmatter}\n%s' %
            (abstract, hl, kw, extra))

def journal_doc(pre, title, fm, body, app, bst):
    return (pre + '\\hypersetup{pdftitle={%s},pdfauthor={Naziru Halilu}}\n' % title.replace('--', '-') +
            '\\begin{document}\n' + fm + '\n\\linenumbers\n' + body +
            ('\n\\appendix\n' + app if app.strip() else '') +
            '\n\\bibliographystyle{%s}\n\\bibliography{../tex/refs}\n\\end{document}\n' % bst)

def highlights_of(name):
    return HIGHLIGHTS[name]


def supp(doc, out, title, what):
    """Turn a complete journal document into Supplementary Material S1 (S-numbered, no front matter)."""
    doc = doc.replace('\\documentclass[review,12pt,authoryear]', '\\documentclass[preprint,12pt,authoryear]')
    doc = re.sub(r'\\journal\{[^}]*\}', r'\\journal{Supplementary Material}', doc)
    block = ('\\renewcommand{\\thesection}{S\\arabic{section}}\\renewcommand{\\thefigure}{S\\arabic{figure}}'
             '\\renewcommand{\\thetable}{S\\arabic{table}}\\renewcommand{\\theequation}{S\\arabic{equation}}\n'
             '\\begin{center}{\\Large\\bfseries Supplementary Material S1}\\\\[6pt]{\\large\\bfseries %s}\\\\[8pt]'
             'Naziru Halilu\\\\[2pt]{\\small Agricultural University of Athens, Greece; Public University of Navarre, Spain}\\end{center}\n'
             '\\noindent\\textit{%s}\n\\bigskip\n' % (title, what))
    doc = re.sub(r'\\begin\{frontmatter\}.*?\\linenumbers\n', lambda m: block, doc, count=1, flags=re.S)
    (J / out).write_text(doc, encoding='utf-8')

# ---------------------------------------------------------------- Papers 1 and 4 (Agricultural Water Management)
def awm(src, out, hl_src):
    P = parts(src)
    body = elsevier_backmatter(P['body'])
    body = re.sub(r'^\\linenumbers\s*', '', body.lstrip())
    pre = preamble('review,12pt,authoryear') + P['pre'] + '\\journal{Agricultural Water Management}\n'
    doc = journal_doc(pre, P['title'], front(P['title'], P['abstract'], highlights_of(hl_src), P['keywords']),
                      body, P['app'], 'elsarticle-harv')
    supp(doc, 'Supplementary_' + out, P['title'], WHAT)

# ---------------------------------------------------------------- Papers 2 and 3 merged (SoftwareX)
def inline(text, seen=None):
    """Inline \\input{x.tex} of the manuscript folder so that labels can be renamed."""
    def rep(m):
        f = m.group(1) if m.group(1).endswith('.tex') else m.group(1) + '.tex'
        if f == 'pre.tex' or not (T / f).exists(): return m.group(0)
        return inline(rd(f))
    return re.sub(r'\\input\{([^}]*)\}', rep, text)

def secs(body):
    """Split a body into (heading, text) blocks at \\section."""
    out, cur, head = [], [], None
    for line in body.split('\n'):
        if re.match(r'\\section\*?\{', line):
            out.append((head, '\n'.join(cur))); cur = []; head = line
        cur.append(line)
    out.append((head, '\n'.join(cur)))
    return out

def merged():
    A, B = parts('p2.tex'), parts('p3.tex')
    a_body, b_body, b_app = inline(A['body']), inline(B['body']), inline(B['app'])
    a_app = inline(A['app'])
    # labels of Paper 3 that also exist in Paper 2 get a prefix, in Paper 3 only
    la = set(re.findall(r'\\label\{([^}]*)\}', a_body + a_app))
    lb = set(re.findall(r'\\label\{([^}]*)\}', b_body + b_app))
    clash = la & lb
    def rename(t):
        t = re.sub(r'\\label\{([^}]*)\}', lambda m: '\\label{w:' + m.group(1) + '}' if m.group(1) in clash else m.group(0), t)
        def refs(m):
            keys = [('w:' + k if k in clash else k) for k in m.group(2).split(',')]
            return m.group(1) + '{' + ','.join(keys) + '}'
        return re.sub(r'(\\(?:[cC]ref|ref|eqref|autoref|pageref|nameref))\{([^}]*)\}', refs, t)
    b_body, b_app = rename(b_body), rename(b_app)
    SA, SB = secs(a_body), secs(b_body)
    getA = lambda h: next(t for hh, t in SA if hh and h in hh)
    getB = lambda h: next(t for hh, t in SB if hh and h in hh)
    strip_head = lambda t: t.split('\n', 1)[1] if t.startswith('\\section') else t
    demote = lambda t: re.sub(r'\\subsection\{', r'\\subsubsection{', t)
    # every numbered section of Paper 2 in its order; the matching section of Paper 3 follows inside it
    lead = getA('{List of symbols}')
    body = [lead]
    sub = {'{Materials and methods}': ('The Daisy workbench, the bridge and the field case', 'sec:wbmethods'),
           '{Results}': ('The Daisy workbench, the bridge and the field case', 'sec:wbresults'),
           '{Discussion}': ('The Daisy workbench and the bridge', 'sec:wbdisc')}
    for hh, t in SA:
        if not hh or hh.startswith('\\section*'): continue
        key = next((k for k in ('{Introduction}', '{Materials and methods}', '{Results}', '{Discussion}', '{Conclusions}') if k in hh), None)
        if key is None:
            body.append(t); continue
        tb = strip_head(getB(key))
        if key in sub:
            title, lab = sub[key]
            body.append(t + '\n\\subsection{%s}\\label{%s}\n' % (title, lab) + demote(tb))
        else:
            body.append(t + '\n' + tb)
    # end matter: Paper 2's, with the statements of Paper 3 added where they differ
    end_a = [t for hh, t in SA if hh and hh.startswith('\\section*') and 'List of symbols' not in hh]
    end_b = {hh: t for hh, t in SB if hh and hh.startswith('\\section*')}
    end = []
    for t in end_a:
        h = t.split('\n', 1)[0]
        extra = ''
        for hb, tb in end_b.items():
            if hb == h and strip_head(tb).strip() != strip_head(t).strip():
                extra = '\n' + strip_head(tb)
        if h.startswith('\\section*{Software and data availability}'):
            extra = '\n' + strip_head(end_b.get('\\section*{Software and data availability}', ''))
        end.append(t + extra)
    if '\\section*{Acknowledgements}' in end_b:
        end.append(end_b['\\section*{Acknowledgements}'])
    body.append(elsevier_backmatter('\n'.join(end)))
    title = 'SWAFL Desktop: equation-traceable irrigation scheduling and design with a graphical workbench for the Daisy model'
    abstract = A['abstract'] + ' ' + B['abstract']
    keywords = A['keywords'].rstrip('.') + '; ' + '; '.join(k for k in B['keywords'].rstrip('.').split('; ') if k.strip() not in A['keywords'])
    meta = METADATA
    pre = preamble('preprint,12pt') + A['pre'] + B['pre'] + '\\journal{SoftwareX}\n'
    app = a_app + '\n' + b_app
    doc = journal_doc(pre, title, front(title, abstract, None, keywords, meta), '\n'.join(body), app, 'elsarticle-num')
    doc = re.sub(r'\\cite(?:[tp]|alt|alp)\{', r'\\cite{', doc)       # numbered references
    supp(doc, 'Supplementary_SoftwareX_SWAFL.tex', title, WHAT + ' Papers 2 and 3 of the series are merged section by section, with every sentence of both.')
    return clash

def build(n):
    run = lambda c: subprocess.run(c, cwd=J, capture_output=True, text=True)
    for c in (['xelatex', '-interaction=nonstopmode', n + '.tex'], ['bibtex', n],
              ['xelatex', '-interaction=nonstopmode', n + '.tex'], ['xelatex', '-interaction=nonstopmode', n + '.tex']):
        r = run(c)
    issues = [l for l in r.stdout.split('\n') if l.startswith('!') or 'undefined' in l or 'multiply' in l or 'Output written' in l]
    print(n, '\n  '.join(sorted(set(issues))[:25]))

if __name__ == '__main__':
    awm('p1.tex', 'AWM_Paper1.tex', 'AWM_Paper1.tex')
    awm('p4.tex', 'AWM_Paper4.tex', 'AWM_Paper4.tex')
    c = merged(); print('labels of Paper 3 renamed:', len(c))
    for n in ('AWM_Paper1', 'AWM_Paper4', 'SoftwareX_SWAFL'): build('Supplementary_' + n)
