"""Puts the manual together chapter by chapter, so that everything about one subject is in one chapter.

The sources in chapters/ stay as they are (tools/atlas11.py still writes 25_atlas.md); this script
  * moves every part of the screenshot atlas (25_atlas.md) to the chapter of its screen, as a section
    *Screens and equations: ...* at the end of that chapter (the reverse index goes to the appendices),
  * moves every part of the reference of the layers (22b_layer_reference.md) to the chapter of its layer,
    as a section *Reference of the ... layers*,
  * makes the volumetric phenotyping a part of Chapter 8 (with the deterministic phenotyping) and numbers the
    drainage design 13A, so that the number of every chapter is the number of its equations (Eq. 9.x in Chapter 9),
  * rewrites the chapter numbers named in the text to the new numbers.
Nothing is left out: check() counts every line of the sources in the result."""
import os, re

# ---------------------------------------------------------------- reading and cutting
def read(d, n):
    return open(os.path.join(d, n + '.md'), encoding='utf8').read()

def cut(text, level):
    """[(title, block)] at headings of the level (the text before the first heading has the title None)"""
    out, cur, title, code = [], [], None, False
    for L in text.split('\n'):
        if L.startswith('```'): code = not code
        m = None if code else re.match(r'^(#{%d}) (.*)$' % level, L)
        if m:
            out.append((title, '\n'.join(cur))); cur, title = [L], m.group(2).strip()
        else:
            cur.append(L)
    out.append((title, '\n'.join(cur)))
    return out

def demote(text, by=1):
    out, code = [], False
    for L in text.split('\n'):
        if L.startswith('```'): code = not code
        out.append(('#' * by + L) if (not code and re.match(r'^#{1,5} ', L)) else L)
    return '\n'.join(out)

def retitle(block, title):
    first, _, rest = block.partition('\n')
    return first.split(' ', 1)[0] + ' ' + title + '\n' + rest

# ---------------------------------------------------------------- the chapter numbers named in the text
# the text names the chapters by the numbering in which the atlas was Chapter 26 (written before the
# chapters were regrouped); the new number of each:
def new_number(n):
    if n == '13b': return '13A'
    k = int(n)
    if k <= 8: return str(k)
    if k == 9: return '8'          # volumetric phenotyping, now part of Chapter 8
    if k <= 25: return str(k - 1)
    if k == 26: raise ValueError('the atlas is no longer a chapter')
    return str(k - 2)              # the Daisy chapters

FIXED = [  # the places that named the atlas or the reference of the layers
    ('The numbered arrows are explained in the screenshot atlas (Chapter 26), under the same screen.',
     'The numbered arrows are explained in the section *Screens and equations* at the end of this chapter, under the same screen.'),
    ('The eight menus are pictured, opened, in the screenshot atlas (Chapter 26).',
     'The eight menus are pictured, opened, in the section *Screens and equations* at the end of this chapter.'),
    ('(the arrows point to the groups; Chapter 26)',
     '(the arrows point to the groups; the section *Screens and equations* at the end of this chapter)'),
    ('the drawn lengths and diameters pass to the design (Chapter 23b).',
     'the drawn lengths and diameters pass to the design (Chapter 18, section *Reference of the design layers*).'),
    ('**Reference of every layer**: Chapter 23b lists the controls, the Properties and the data sources of each layer.',
     '**Reference of every layer**: the section *Reference of the ... layers* in the chapter of each layer lists the controls, the Properties and the data sources of that layer (the Properties that every layer shares are in Chapter 3).'),
    ('Every choice is one screen of this atlas.', 'Every choice is one screen of the sections *Screens and equations*.'),
    ('(E2, E7, E13 and E14, Chapter 28)', '(E2, E7, E13 and E14, Chapter 5)'),
    ('Chapters 27 to 40', 'Chapters 25 to 39'), ('Chapters 27 to 39', 'Chapters 25 to 39'),
]
REF = re.compile(r'\b(Chapters?) (\d+[ab]?)((?:(?:, | to | and | or )\d+[ab]?)*)')

def renumber(s, host=None):
    for a, b in FIXED: s = s.replace(a, b)
    def one(m):
        if m.group(2) in ('25', '39') and m.group(1) == 'Chapters' and m.group(3) == ' to 39': return m.group(0)
        tail = re.sub(r'\d+[ab]?', lambda x: new_number(x.group(0)), m.group(3))
        return m.group(1) + ' ' + new_number(m.group(2)) + tail
    out = []
    for part in re.split(r'(Chapters 25 to 39)', s):   # the ranges already written in the new numbers
        out.append(part if part == 'Chapters 25 to 39' else REF.sub(one, part))
    s = ''.join(out)
    if host:
        s = s.replace('(Chapter %s)' % host, '(this chapter)')
        s = re.sub(r'\(Chapters %s and (\d+)\)' % re.escape(host), r'(this chapter and Chapter \1)', s)
        s = re.sub(r'(?<=[a-z,;(] )Chapter %s\b(?![.\d])' % re.escape(host), 'this chapter', s)
    return s

# ---------------------------------------------------------------- the front matter
FRONT_LIST = '''1. Chapters 1 to 3 install the program and explain the window and every control.
2. Chapters 4 and 5 explain the clock (dates) and the two computing engines that sit under every layer.
3. Chapters 6 to 10 document each *layer* of the Layers panel (irrigation control, the field water balance, soil structure and tillage with the two phenotyping layers, mulch and evaporation, feedback loops): what it designs or shows, how the picture is generated, and the governing equations.
4. Chapters 11 to 13 document the three irrigation design layers (surface, drip, sprinkler) in full, including the irrigation schedule and the "When to irrigate" message; Chapter 13A documents the drainage design.
5. Chapters 14 to 16 document the dashboard, step-by-step workflows, exports and troubleshooting.
6. Chapter 17 states the validity limits.
7. Chapters 18 to 24 document the additions of version 1.1: running a design and finding the most efficient inputs, weather data (your own file or the online weather of a place), the real field on the map (satellite indices, image analysis of the satellite photo, water sources and the choice of the irrigation system), the crop library and the crop water requirement, the seasonal data, the reports, and every change from version 1.0.
8. Each chapter holds everything about its subject: everything on surface irrigation, for example, is in Chapter 11. The chapter of a layer ends with the **Reference of the layers** (the controls on the layer, the Properties that move it, how it is generated and the data sources behind its numbers) and with the sections **Screens and equations**, the screenshots of that layer (every section of the three design layers, the menus, the toolbox, the Properties panel, the Dashboard and the dialogs of version 1.1) taken from the program itself, with every equation that the screen draws on printed under it, with its number, source chapter and provenance. A reverse index in the appendices gives, for every numbered equation, the screens that use it.
9. Chapters 25 to 39 document the Daisy workbench: the overview of its groups of tabs, the governing equations and guiding principles (the last sections of Chapter 25), every screen with numbered arrows (Input data with online weather, Experiments and scenarios, the 27 best combinations, Results and analysis with the figures of real Daisy runs, the guided path with Back and Next and its hand-over to the layers of the SWAFL project, Model development, Documentation), the 107 reference topics, the tested parameters, the factors and responses of the experiments, the Daisy library as it comes with the program, and the weather of the bundled stations.
10. The appendices give symbols, control value lists, data sets, the provenance ledger, the references, the reference of all numbered equations and the reverse index of the screens.
'''
FRONT_TABLE = '''| Start: install, window, controls, clock, engines | blue | 1 to 5 | `{\\color{swaflblue}\\iconfont ⚙ ▦ ☰ ◷ ⚛}`{=latex} |
| Layers of the field | green | 6 to 10 | `{\\color{partgreen}\\iconfont ☂ ⊞ ☷ ❦ ♻}`{=latex} |
| Irrigation and drainage design | teal | 11 to 13, 13A | `{\\color{partteal}\\iconfont ☔ ✚ ❄ ≋}`{=latex} |
| Outputs: dashboard, workflows, exports, limits, runs, reports | orange | 14 to 18, 23 | `{\\color{partorange}\\iconfont ▤ ✔ ✎ ⚠ ⚑}`{=latex} |
| Data: weather, the real field, crops, seasons | brown | 19 to 22 | `{\\color{partbrown}\\iconfont ☀ ⊞ ✿ ◷}`{=latex} |
| Reference: changes, appendices | grey | 24, appendices | `{\\color{partgrey}\\iconfont ★ ▦}`{=latex} |
| The Daisy workbench | purple | 25 to 39 | `{\\color{partpurple}\\iconfont ⚘ ☀ ❖ ⚖ ▤ ⚑ ⚙ ✎ ☰ ⚗ ❦ ☁ ⚠}`{=latex} |
'''

def front(s, atlas_intro):
    a = s.index('1. Chapters 1 to 3'); b = s.index('\n', s.index('10. The appendices')) + 1
    intro = atlas_intro.strip()
    intro = intro.replace('This part of the manual shows every screen of the workbench, one after another, each accompanied',
                          'The sections *Screens and equations* at the end of the chapters show every screen of the workbench, each in the chapter of its subject and each accompanied')
    intro = intro.replace('A reverse index at the end lists', 'A reverse index in the appendices lists')
    s = s[:a] + FRONT_LIST + '\n**Screens and equations.** ' + intro + '\n' + s[b:]
    a = s.index('| Start: install'); b = s.index('\n', s.index('| The Daisy workbench |')) + 1
    return s[:a] + FRONT_TABLE + s[b:]

# ---------------------------------------------------------------- the plan
def assemble(d):
    names = sorted(f[:-3] for f in os.listdir(d) if f.endswith('.md'))
    # the atlas: intro, topics (##) and the screens (###) of the window and of version 1.1
    at = cut(read(d, '25_atlas'), 2)
    atlas_intro = at[0][1].split('\n', 1)[1]                    # without the chapter title
    T = {t: b for t, b in at[1:]}
    used = set()
    def topic(t):
        used.add(t); return T[t]
    def items(t):
        used.add(t); parts = cut(T[t], 3); return parts[0][1], {a: b for a, b in parts[1:]}
    _, WIN = items('The window and its controls')
    v11_intro, V11 = items('Screens added in version 1.1')
    taken = set()
    def win(k): taken.add(('w', k)); return WIN[k]
    NEW11 = '\n\n*New in version 1.1.* The numbered arrows point to the headings of each part.\n'
    def v11(k):
        taken.add(('v', k)); h, _, rest = V11[k].partition('\n'); return h + NEW11 + rest
    def screens(title, blocks, lead=''):
        return '\n\n## Screens and equations: ' + title + '\n\n' + lead + '\n\n' + '\n\n'.join(blocks) + '\n'
    def atl(t, extra=()):
        """an atlas topic as a section of its chapter, with the screens of version 1.1 that belong to it"""
        b = topic(t)
        return '\n\n' + retitle(b, 'Screens and equations: ' + t) + '\n\n' + '\n\n'.join(v11(k) for k in extra) + '\n'
    # the reference of the layers
    rf = cut(read(d, '22b_layer_reference'), 2)
    ref_intro = rf[0][1].split('\n', 1)[1].strip()
    R = {t: b for t, b in rf[1:]}
    rused = set()
    def ref(t, title=None, level=2):
        rused.add(t); b = R[t]
        if title: b = retitle(b, title)
        if level == 3: b = demote(b)
        return '\n\n' + b + '\n'
    REF_LEAD = ('The reference of every layer gives, for each layer of the *Layers* panel, three things in the same order: the **controls** on the layer itself, '
                'the **Properties** that move it, and the **data sources** behind its numbers. It is the section *Reference of the ... layers* in the chapter of each layer; ')
    ref_intro_here = ref_intro.replace('This chapter gathers, for each layer of the *Layers* panel, three things in the same order: the **controls** on the layer itself, the **Properties** that move it, and the **data sources** behind its numbers. ', REF_LEAD + 'the Properties that every layer shares are below. ')

    C = {n: read(d, n) for n in names}
    W = lambda *ks: [win(k) for k in ks]
    plan = [
        ('00_front', front(C['00_front'], atlas_intro)),
        ('01_install', C['01_install']),
        ('02_window', C['02_window'] + screens('the window and its controls', W(
            'The welcome dialog', 'The workbench', 'The File menu', 'The Edit menu', 'The View menu', 'The Tools menu', 'The Refresh menu', 'The Review menu',
            'The Run menu', 'The Help menu', 'The command palette (Ctrl+K)', 'The Processing Toolbox', 'The toolbar', 'The status bar'))),
        ('03_controls', C['03_controls'] + '\n\n' + retitle(R['The Properties that every layer shares'], 'The Properties that every layer shares').replace(
            '## The Properties that every layer shares\n', '## The Properties that every layer shares\n\n' + ref_intro_here + '\n', 1)
            + screens('the Properties panel', W('The Properties panel'))),
        ('04_dates', C['04_dates']),
        ('05_engine', C['05_engine']),
        ('06_control', C['06_control'] + ref('Irrigation control: sensor and trigger, trigger law', 'Reference of the control layers: sensor and trigger, trigger law')
            + atl('Sensor and trigger') + atl('Trigger law')),
        ('07_field', C['07_field'] + ref('Field water balance: field balance, soil plant and air, profile evolution', 'Reference of the field water balance layers: field balance, soil plant and air, profile evolution')
            + atl('Field balance') + atl('Soil, plant and air') + atl('Profile evolution')),
        ('08_structure', C['08_structure'].replace('# Soil structure and tillage layers', '# Soil structure and tillage layers, and the phenotyping layers', 1)
            + ref('Soil structure and tillage: tillage and structure, soil hydraulic drivers, root structure', 'Reference of the soil structure layers: tillage and structure, soil hydraulic drivers, root structure')
            + atl('Tillage and structure') + atl('Soil hydraulic drivers') + atl('Root structure')
            + '\n\n' + C['08b_phenotyping'] + ref('Deterministic phenotyping', 'Reference of the deterministic phenotyping layer')
            + '\n\n' + demote(C['08c_volumetric']).replace('## Volumetric phenotyping\n', '## Volumetric phenotyping layer\n', 1)
            + ref('Volumetric phenotyping', 'Reference of the volumetric phenotyping layer')),
        ('09_mulch', C['09_mulch'] + ref('Mulch and evaporation: mulch against bare soil, mulch control, evaporation, fate of saved water, regime map',
                                         'Reference of the mulch and evaporation layers: mulch against bare soil, mulch control, evaporation, fate of saved water, regime map')
            + atl('Mulch against bare soil') + atl('Mulch control') + atl('Evaporation') + atl('Fate of saved water') + atl('Regime map')),
        ('10_loops', C['10_loops'] + ref('Feedback loops', 'Reference of the feedback loops layer') + atl('Feedback loops')),
        ('11_surface', C['11_surface'] + atl('Surface irrigation design', ['The surface irrigation design after its run'])),
        ('12_drip', C['12_drip'] + ref('Drip wetting by soil') + atl('Drip irrigation design', ['The drip irrigation design after its run'])),
        ('13_sprinkler', C['13_sprinkler'] + atl('Sprinkler design and pipes', ['The sprinkler design after its run'])),
        ('13b_drainage', '```{=latex}\n\\renewcommand{\\thechapter}{13A}\\renewcommand{\\theHchapter}{13A}\n```\n\n' + C['13b_drainage']),
        ('14_dashboard', '```{=latex}\n\\setcounter{chapter}{13}\\renewcommand{\\thechapter}{\\arabic{chapter}}\\renewcommand{\\theHchapter}{\\arabic{chapter}}\n```\n\n' + C['14_dashboard']
            + screens('the Dashboard', W('The Dashboard, Results tab', 'The Dashboard, Design tab', 'The Dashboard, Charts tab', 'The Dashboard, Messages tab')
                      + [v11(k) for k in ('Dashboard: the Results tab', 'Dashboard: the Design tab', 'The Charts tab of a design after its run', 'Dashboard: the Charts tab of the Field balance', 'Dashboard: the Messages tab')])),
        ('15_workflows', C['15_workflows']), ('16_exports', C['16_exports']), ('17_limits', C['17_limits']),
        ('18_runs', C['18_runs'] + ref('Irrigation design: surface, drip and sprinkler with pipes', 'Reference of the design layers: surface, drip and sprinkler with pipes')
            + ref('Ending a pipe in the field sketch', level=3)
            + screens('running a design', [v11(k) for k in ('A design before its run', 'The value window of a design input', 'Field sketch to design', 'The irrigation systems compared on this field')])),
        ('19_weather', C['19_weather'] + screens('weather data', [v11(k) for k in ('Import weather data', 'Online weather for a location')])),
        ('20_field', C['20_field'] + ref('Weather, field and map data', 'Reference of the data sources: weather, field and map data')),
        ('21_crops', C['21_crops'] + ref('Crops: crop water requirement', 'Reference of the crop layer: crop water requirement')
            + screens('crop water requirement', [v11('Crop water requirement')])),
        ('22_seasonal', C['22_seasonal'] + ref('Seasonal data: reliability over the seasons, full water balance, nitrogen budget', 'Reference of the seasonal layers: reliability over the seasons, full water balance, nitrogen budget')
            + screens('seasonal data', [v11(k) for k in ('Reliability over 20 seasons', 'Full water balance', 'Nitrogen budget')])),
        ('23_reports', C['23_reports'] + screens('reports', [v11('Save report as PDF: choose the layers')])),
        ('24_changes', C['24_changes']),
        ('26_daisy_overview', C['26_daisy_overview'] + ref('Daisy model workbench', 'Reference of the Daisy model workbench')),
    ] + [(n, C[n]) for n in names if n.startswith(('27', '28', '29', '3'))] + [
        ('90_appendices', C['90_appendices'] + '\n\n' + retitle(topic('Reverse index: where each equation appears on screen'),
            'Reverse index: where each equation appears on screen {-}') + '\n'),
    ]
    # the moved block of the Properties and the reference intro are counted as used
    rused.add('The Properties that every layer shares')
    # nothing may be left behind
    left = [t for t in T if t not in used] + [t for t in R if t not in rused] + \
           [k for k in WIN if ('w', k) not in taken] + [k for k in V11 if ('v', k) not in taken]
    if left: raise SystemExit('not placed: %r' % left)
    host = lambda n: {'13b_drainage': '13A'}.get(n, str(int(re.match(r'\d+', n).group(0))) if not n.startswith(('26', '27', '28', '29', '3', '9', '00')) else None)
    out = []
    for i, (n, s) in enumerate(plan):
        s = s if n == '00_front' else renumber(s, host(n))
        out.append(('%03d_%s' % (i, n), s))
    check(d, names, [s for _, s in out], v11_intro)
    return out

def check(d, names, texts, v11_intro):
    """every line of the sources is in the result (headings that were renamed and lines rewritten for the new numbers aside)"""
    def norm(L):
        for a, b in FIXED: L = L.replace(a, b)
        L = re.sub(r'^#+ ', '', L)
        L = re.sub(r'\bChapters? \d+[abA]?(?:(?:, | to | and | or )\d+[abA]?)*|\bthis chapter\b', 'CH', L)
        return L.strip()
    have = {}
    for L in '\n'.join(texts).split('\n'): k = norm(L); have[k] = have.get(k, 0) + 1
    miss = []
    for n in names:
        for L in read(d, n).split('\n'):
            if not L.strip() or L.startswith('#'): continue
            k = norm(L)
            if have.get(k, 0) > 0: have[k] -= 1
            else: miss.append((n, L[:120]))
    print('every line of the sources checked; lines given a new wording: %d' % len(miss))
    for m in miss: print('   ', m)
    if any(m[0] not in ('00_front', '22b_layer_reference', '25_atlas') for m in miss) or len(miss) > 16: raise SystemExit('lines lost')
