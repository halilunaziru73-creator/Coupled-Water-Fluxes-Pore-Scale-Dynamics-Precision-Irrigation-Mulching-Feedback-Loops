"""Lays out the solutions of the worked examples in the manner of a classic engineering textbook: every equation
of a working (an inline $...$ with an equals sign and some length) is set on its own centred line, as in
'We know that ...  [equation]  ... Ans.'. Only the solution part of each example is touched (from \\sol to the next
example, section, banner or exercise block); tables, the Given line and short symbols stay inline.
Idempotent: a converted equation is already a display and is not seen again."""
import re, os, sys, glob
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
END = re.compile(r'\\exbox|\\section|\\subsection|\\banner|\\backhead|\\dykband|\\chapter|\\begin\{kfig\}|\\fig\{|\\appfig|\\begin\{figure\}|\\begin\{table\}|\\begin\{keybox\}|\\begin\{daisybox\}|\\subhd\{')
SKIP = re.compile(r'\\begin\{(tabular|longtable|table|enumerate|itemize|align|equation|array|cases|minipage)\}.*?\\end\{\1\}|\\givenline\{(?:[^{}]|\{[^{}]*\})*\}|\\\[.*?\\\]|\$\$.*?\$\$', re.S)
INL = re.compile(r'(?<![\\$])\$([^$]+?)\$(?!\$)')

def convert_solution(s):
    # protect regions that must stay as they are
    keep = []
    def prot(m): keep.append(m.group(0)); return '\x00%d\x00' % (len(keep) - 1)
    s = SKIP.sub(prot, s)
    n = [0]
    def disp(m):
        x = m.group(1)
        if '=' not in x or len(x) < 26 or '&' in x or '\\\\' in x or x.count('=') == 1 and len(x) < 34: return m.group(0)
        n[0] += 1
        return '\\[' + x.strip() + '\\]'
    s = INL.sub(disp, s)
    s = re.sub('\x00(\\d+)\x00', lambda m: keep[int(m.group(1))], s)
    # the unit that follows a result goes onto the line of the result: "= 62.5 m  Ans."
    UNIT = r'(?:mm|cm|m|km|kg|g|Mg|ha|d|h|s|min|kPa|MPa|Pa|L|mg|N|W|MJ|DM|CO|nm|yr|K|per\s+cent|\$\\mu\$m|\$[\^_]\{?-?\d+\}?\$|\$\^\\circ\$C?|\\,)'
    s = re.sub(r'\\\]\s*(' + UNIT + r'(?:\s*' + UNIT + r')*)(?=\s*(?:[.,;:)]|\\[a-z]+|$|\n))', lambda m: '\\ \\text{' + m.group(1).strip() + '}\\]', s)
    # an "Ans." that now follows a display goes onto the display line, as in the reference layout
    s = re.sub(r'\\\]\s*([.,;]?)\s*\\finans', lambda m: '\\quad\\text{\\finans}\\]', s)
    s = re.sub(r'\\\]\s*[.:;,]\s*', '\\]\n', s)
    # numbers printed by a program as 5.455e-07 are written as 5.455\times10^{-7}
    s = re.sub(r'(\\\[.*?\\\]|\$[^$]*\$)', lambda m: re.sub(r'(\d)e([+-]?)0*(\d+)', lambda q: q.group(1) + '\\times10^{' + ('-' if q.group(2) == '-' else '') + q.group(3) + '}', m.group(0)), s, flags=re.S)
    # the label of each part of a working stands out in magenta: (a), (b) ... or 1., 2. ...
    s = re.sub(r'(\\ans|\\par\\noindent)\s+\((\w)\)\s', lambda m: m.group(1) + ' {\\bfseries\\itshape\\color{khmag}(' + m.group(2) + ')}\\ ', s)
    s = re.sub(r'(\\ans|\\par\\noindent)\s+(\d{1,2})\.\s', lambda m: m.group(1) + ' {\\bfseries\\color{khmag}' + m.group(2) + '.}\\ ', s)
    s = re.sub(r'(\\\]\n)(\d{1,2})\.\s', lambda m: m.group(1) + '\\par\\indent{\\bfseries\\color{khmag}' + m.group(2) + '.}\\ ', s)
    s = re.sub(r'\n\n(\d{1,2})\.\s', lambda m: '\n\n{\\bfseries\\color{khmag}' + m.group(1) + '.}\\ ', s)
    return s, n[0]

def process(path):
    t = open(path).read(); out = []; i = 0; total = 0
    for m in re.finditer(r'\\sol\b', t):
        if m.start() < i: continue
        e = END.search(t, m.end()); j = e.start() if e else len(t)
        out.append(t[i:m.end()]); seg, k = convert_solution(t[m.end():j]); out.append(seg); total += k; i = j
    out.append(t[i:]); new = ''.join(out)
    if new != t: open(path, 'w').write(new)
    return total

if __name__ == '__main__':
    files = [os.path.join(D, f) for f in ['chpore.tex'] + ['ch%02d.tex' % i for i in range(1, 23)]] + sorted(glob.glob(os.path.join(D, 'extra', '*.tex')))
    tot = 0
    for f in files:
        k = process(f); tot += k
        if k: print('%-22s %4d equations set on their own line' % (os.path.basename(f), k))
    print('total', tot)
