"""Writes the chapters of the Daisy workbench part of the manual (26 to 36) from the captured screens (build_shots) and the data of the workbench (build_data)."""
import json, os, re
M = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda f: json.load(open(os.path.join(M, f), encoding='utf-8'))
IDX = J('build_shots/index.json'); CH = J('build_data/chapters.json'); PR = J('build_data/params.json'); FA = J('build_data/factors.json'); RS = J('build_data/resp.json')
SG = J('build_data/suggest.json'); SC = J('build_data/scen.json'); RM = J('build_data/refmap.json')
def cell(s): return re.sub(r'\s+', ' ', str(s if s not in (None, '') else 'n/a')).replace('|', '/').replace('\\', '/')
def scr(sid, n, cap=None):
    v = IDX[sid]; s = '### %s\n\n%s\n\n' % (v['title'], v['intro'])
    s += '![%s. Screen %s of the Daisy workbench.](images/daisy11/%s.jpg){width=100%% height=17cm}\n\n' % (cap or v['title'], n, sid)
    if v['marks']:
        s += '**What the arrows point to.**\n\n' + ''.join('%d. **%s.** %s\n' % (i + 1, m['t'], m['d']) for i, m in enumerate(v['marks'])) + '\n'
    return s + '\\newpage\n\n'
def ids(ch, sec=None): return sorted(k for k, v in IDX.items() if v['ch'] == ch and (sec is None or v['sec'] == sec))
out = {}; N = [0]
def S(sid):
    N[0] += 1; return scr(sid, N[0])
# 26 overview
t = '# The Daisy workbench: overview {#daisy-overview}\n\nThe Daisy workbench is the part of SWAFL that runs the Daisy 7.1.14 model, draws its results and tests it. It opens from the button Daisy model of the toolbar. The tabs are in five groups that follow what a person does: give the data, ask a question, look at the results, build and test, and learn.\n\n'
t += '| Group | Tab | What it is for |\n|:--|:--|:--|\n'
G = [('1 Your data', 'My data', 'Set the weather and the soil of the site once; every simulation uses them.'), ('1 Your data', 'Weather stations', 'Look at the stations bundled with Daisy and bring one into the data.'), ('1 Your data', 'Library', 'Read the horizons, crops, fertilisers and other entries of the Daisy library.'), ('1 Your data', 'Files', 'Collect logs, weather and set-up files from Daisy runs.'),
 ('2 Ask a question', 'Scenarios', 'Five ready questions about water, nitrogen, climate, a chemical and soil.'), ('2 Ask a question', 'Experiments', 'Design your own set of runs from 53 factors, or start from 27 best combinations.'),
 ('3 Look at results', 'Processes', 'A map of the model processes with the figures of each one.'), ('3 Look at results', 'Plot', 'Draw any column of a log.'), ('3 Look at results', 'Mass balance', 'Check that inputs, outputs and content agree.'), ('3 Look at results', 'Compare and test', 'Compare two logs against the smallest meaningful level.'),
 ('4 Build and test', 'Set-up editor', 'Edit and run a Daisy set-up file.'), ('4 Build and test', 'Soil column', 'Solve the Richards equation for a soil column.'), ('4 Build and test', 'Process curves', 'Draw any function of the Daisy library.'), ('4 Build and test', 'Calibrate', 'Search parameters with three optimisers.'), ('5 Learn', 'Model and documentation', 'The model, the questions and where each is answered, the downloads.')]
t += ''.join('| %s | %s | %s |\n' % g for g in G) + '\nThe chapters that follow take the groups in this order. Every screen is shown with numbered arrows; the list under it says what each arrow points to.\n\n**How the weather is chosen.** The weather of a run is chosen once in the strip at the top of the Scenarios, Experiments and Processes tabs, and its source is set in My data. The choices are the weather of the SWAFL project, the built-in Taastrup weather, one of the bundled stations, online weather of a place and a file of your own. All simulations then use that weather, so a figure and the project always agree.\n\n**What runs where.** The scenarios, experiments, set-up editor and calibration against the Daisy program need the desktop app with Daisy installed. The soil column, the process curves and the denitrification calibration run in the web version too. The figures of results that are drawn here come from real Daisy runs of the built-in farm for the years 1990 to 1993.\n\n'
out['26_daisy_overview.md'] = t
# 27 your data
t = '# Your data {#daisy-data}\n\nThe first group holds everything that describes the site: weather, soil and the files of earlier runs.\n\n'
for sid in ids('data'): t += S(sid)
t += '## The weather stations of Daisy\n\nThe stations that come with Daisy are listed here with the years that they cover. The first one is the built-in weather used when nothing else is chosen.\n\n| Station | Label | First year | Last year |\n|:--|:--|--:|--:|\n' + ''.join('| %s | %s | %s | %s |\n' % (cell(s['id']), cell(s['label']), s['first'], s['last']) for s in SC['stations']) + '\n'
out['27_daisy_data.md'] = t
# 28 ask a question
t = '# Ask a question {#daisy-ask}\n\nThe second group answers a question by running Daisy: five ready scenarios and a free design of experiments.\n\n## Scenarios\n\nEach scenario is a question about the built-in farm. Its runs differ only in the option that the question is about.\n\n'
t += '| Scenario | Question | Runs compared |\n|:--|:--|:--|\n' + ''.join('| %s | %s | %s |\n' % (cell(s['id']), cell(s['title']), cell('; '.join(v['label'] for v in s['variants']))) for s in SC['list']) + '\n'
t += '### The options of a scenario\n\n| Option | Meaning | Kind |\n|:--|:--|:--|\n' + ''.join('| %s | %s | %s |\n' % (cell(k), cell(v['label']), cell(v['type'])) for k, v in SC['options'].items()) + '\n\\newpage\n\n'
for sid in ids('ask', 'Scenarios'): t += S(sid)
t += '## Experiments\n\nExperiments is the free design. Runs are chosen from the factors, the plan is made as a one at a time, factorial, Latin hypercube or other design, and the runs are listed in order of preference.\n\n'
for sid in ids('ask', 'Experiments'): t += S(sid)
out['28_daisy_ask.md'] = t
# 29 the 27 combinations
t = '# The best combinations {#daisy-combos}\n\nStart from the Daisy reference offers 27 combinations of factors that the Daisy reference manual makes worth comparing. Each is shown as it opens in the Experiments tab, with the reason it is offered and the place of the reference manual where its parameters are described.\n\n'
by = {s['id']: s for s in SG}
for sid in ids('combos'):
    v = IDX[sid]; n = int(sid.split('_')[-1]); 
    t += S(sid)
t += '## All combinations in one table\n\n| Group | Combination | Reference | Why |\n|:--|:--|:--|:--|\n' + ''.join('| %s | %s | %s | %s |\n' % (cell(s['group']), cell(s['title']), cell(s['ref']), cell(s['why'])) for s in SG) + '\n'
t += '## The plan of each combination\n\n'
for s in SG:
    p = s['plan']; t += '### %s\n\nDesign: %s. Factors: %s.\n\n' % (s['title'], p.get('design', 'n/a'), '; '.join('%s with %s' % (f['id'], ', '.join(str(x) for x in f.get('levels', []))) for f in p.get('factors', [])) or 'none')
out['29_daisy_combos.md'] = t
# 30 results
t = '# Look at results {#daisy-results}\n\nThe third group draws what a run produced.\n\n## The five scenarios, with their results\n\nThe screens that follow were taken after a real Daisy run of each scenario on the built-in farm with the built-in Taastrup weather for the years 1990 to 1993. The figures are spectral: blue is low or wet and red is high or dry.\n\n'
for sc in ['irrigation', 'nitrogen', 'climate', 'chemical', 'soil']:
    t += '## Results of the %s scenario\n\n' % sc
    for sid in ids('results', sc): t += S(sid)
t += '## Processes, plots, balance and tests\n\n'
for sec in ['Processes', 'Plot', 'Mass balance', 'Compare and test']:
    for sid in ids('results', sec): t += S(sid)
out['30_daisy_results.md'] = t
# 31 build + learn
t = '# Build and test, and learn {#daisy-build}\n\nThe fourth group holds the tools that need no scenario, and the fifth explains the model.\n\n'
for sid in ids('build') + ids('learn'): t += S(sid)
out['31_daisy_build.md'] = t
# 32 topics
t = '# The 107 reference topics {#daisy-topics}\n\nThe Model and documentation tab and the references of the experiment combinations follow the 107 topics of the Daisy program reference manual. For each topic this chapter gives its purpose, its sections, and the questions of the workbench that touch it.\n\n'
combos_by_topic = {}
for s in SG:
    for r in re.findall(r'\b(\d+)\.\d+', s['ref']): combos_by_topic.setdefault(int(r), []).append(s['title'])
for c in CH:
    n = c['n']; t += '## Topic %d: %s\n\n%s\n\n' % (n, c['title'], c['intro'] or 'No introduction is given for this topic.')
    if c['sections']:
        t += '| Section | Name | What it covers | Components |\n|:--|:--|:--|:--|\n' + ''.join('| %s | %s | %s | %s |\n' % (cell(s['id']), cell(s['name']), cell(s['desc']), cell(', '.join(s['params']))) for s in c['sections']) + '\n'
    rel = RM['rel'].get(str(n)); mp = RM['map'].get(str(n))
    if rel: t += '**Related theme.** %s.\n\n' % rel['topic']
    if n in combos_by_topic: t += '**Combinations of the Experiments tab that use this topic.** ' + '; '.join(combos_by_topic[n]) + '.\n\n'
    pp = [p for p in PR if p['ch'] == n]
    if pp: t += '**Parameters that the workbench runs for this topic.** ' + ', '.join(p['name'] for p in pp) + '.\n\n'
out['32_daisy_topics.md'] = t
# 33 tested parameters
t = '# The tested parameters {#daisy-params}\n\nThirty two parameters of the Daisy reference are run by the workbench. Each was tested with the Daisy program before it was offered, and its default is the value of the program.\n\n'
for p in PR:
    t += '## %s of %s\n\n%s\n\n| Item | Value |\n|:--|:--|\n| Topic | %s |\n| Component | %s |\n| Key | %s |\n| Type | %s |\n| Unit | %s |\n| Default | %s |\n| Sensitivity run | %s |\n\n' % (p['name'].capitalize(), p['attr'], p['desc'], p['ch'], p['attr'], p['key'].replace('_', ' '), p['type'], cell(p['unit']), cell(p['def']), 'yes' if p['sens'] else 'no')
out['33_daisy_params.md'] = t
# 34 factors
t = '# The factors and responses of the Experiments tab {#daisy-factors}\n\nThe Experiments tab offers %d factors. Each has levels that are tried, a range that is accepted, and words that make the tab propose it when the question is typed in words. Fourteen responses are measured in every run.\n\n## Responses\n\n| Response | Unit | Better when |\n|:--|:--|:--|\n' % len(FA)
t += ''.join('| %s | %s | %s |\n' % (cell(r['label']), cell(r['unit']), {1: 'higher', -1: 'lower', 0: 'not ranked'}.get(r['good'], 'n/a')) for r in RS) + '\n## Factors\n\n'
for f in FA:
    t += '### %s\n\n| Item | Value |\n|:--|:--|\n| Key | %s |\n| Unit | %s |\n| Kind | %s |\n| Levels tried | %s |\n| Accepted range | %s |\n| Needs irrigation | %s |\n| Words | %s |\n\n' % (f['label'], f['key'], cell(f['unit']), f['kind'], cell(', '.join(str(x) for x in f.get('levels', []))), cell(' to '.join(str(x) for x in f.get('range', []))), 'yes' if f.get('irr') else 'no', cell(', '.join(f.get('words', []))))
out['34_daisy_factors.md'] = t

# 35 the library (real entries of the Daisy library bundled with the program)
LIB = json.load(open(os.path.join(M, '..', '..', 'app', 'data', 'daisy', 'library.json'), encoding='utf-8'))
def val(v):
    if isinstance(v, list):
        if v and all(isinstance(a, list) for a in v): return '; '.join('(' + ', '.join(str(x) for x in a) + ')' for a in v)
        return ', '.join(str(x) for x in v)
    if isinstance(v, dict): return ', '.join('%s %s' % (k, val(x)) for k, x in v.items())
    return str(v)
import math
def vg(h, pf):
    hy = h.get('hy') or {}
    if not hy or hy.get('model') != 'M_vG' or 'alpha' not in hy: return None
    if not all(isinstance(hy.get(q), (int, float)) for q in ('alpha', 'n', 'K_sat', 'Theta_sat')) or hy['n'] <= 1: return None
    a, n, ts, tr, l, ks = hy['alpha'], hy['n'], hy['Theta_sat'], hy.get('Theta_res') if isinstance(hy.get('Theta_res'), (int, float)) else 0, hy.get('l') if isinstance(hy.get('l'), (int, float)) else 0.5, hy['K_sat']
    suc = 10 ** pf; m = 1 - 1 / n; se = (1 + (a * suc) ** n) ** (-m); th = tr + (ts - tr) * se
    k = ks * se ** l * (1 - (1 - se ** (1 / m)) ** m) ** 2
    return th, k
t = '# The Daisy library {#daisy-library}\n\nThis chapter lists the entries of the Daisy library that come with the program and that the Library tab reads: %d horizons, %d crops, %d fertilisers, %d chemicals, %d actions, %d programs and %d log types. The values are those of the library files; nothing is estimated.\n\n' % tuple(len(LIB[k]) for k in ['horizons', 'crops', 'fertilizers', 'chemicals', 'actions', 'programs', 'logs'])
t += '## Soil horizons\n\nEach horizon has its texture, its organic matter and its hydraulic parameters. Hydraulics follow the van Genuchten and Mualem model: the water content is the residual content plus the range between saturated and residual content times the effective saturation, and the conductivity follows from the same parameters. The water content and the conductivity at six suctions are calculated from the parameters of the library with these equations, to show the shape of each horizon.\n\n'
t += '| Horizon | Parent | Clay % | Silt % | Sand % | Humus % | C/N | Bulk density |\n|:--|:--|--:|--:|--:|--:|--:|--:|\n' + ''.join('| %s | %s | %s | %s | %s | %s | %s | %s |\n' % tuple(cell(h.get(k)) for k in ['name', 'parent', 'clay', 'silt', 'sand', 'humus', 'CN', 'rho']) for h in LIB['horizons']) + '\n'
for h in LIB['horizons']:
    hy = h.get('hy') or {}; t += '### Horizon %s\n\nParent %s, defined in %s. Hydraulic model %s.\n\n| Parameter | Value |\n|:--|:--|\n' % (h['name'], cell(h.get('parent')), cell(h.get('file')), cell(hy.get('model'))) + ''.join('| %s | %s |\n' % (cell(k), cell(val(v))) for k, v in hy.items() if k != 'model') + '\n'
    rows = [(pf, vg(h, pf)) for pf in (0, 1, 2, 2.5, 3, 4.2)]
    if rows[0][1]: t += '| pF | Suction, cm | Water content, cm3 per cm3 | Conductivity, cm per h |\n|--:|--:|--:|--:|\n' + ''.join('| %s | %s | %.3f | %.3g |\n' % (pf, '%g' % (10 ** pf), r[0], r[1]) for pf, r in rows) + '\n'
t += '\\newpage\n\n## Fertilisers\n\n| Fertiliser | Parent | Dry matter | Total N | Total C | NH4 share | Volatilisation |\n|:--|:--|--:|--:|--:|--:|--:|\n' + ''.join('| %s | %s | %s | %s | %s | %s | %s |\n' % ((cell(f['name']), cell(f.get('parent'))) + tuple(cell((f.get('p') or {}).get(k)) for k in ['dry_matter_fraction', 'total_N_fraction', 'total_C_fraction', 'NH4_fraction', 'volatilization'])) for f in LIB['fertilizers']) + '\n'
t += '\\newpage\n\n## Chemicals\n\n' + ''.join('### Chemical %s\n\nParent %s, from %s.\n\n| Parameter | Value |\n|:--|:--|\n%s\n' % (c['name'], cell(c.get('parent')), cell(c.get('file')), ''.join('| %s | %s |\n' % (cell(k), cell(val(v))) for k, v in (c.get('p') or {}).items())) for c in LIB['chemicals'])
t += '\\newpage\n\n## Crops\n\n' + ''.join('')
for c in LIB['crops']:
    p = c.get('p') or {}; t += '### Crop %s\n\nParent %s, defined in %s. %s\n\n' % (c['name'], cell(c.get('parent')), cell(c.get('file')), cell(c.get('desc') or p.get('description') or '') if (c.get('desc') or p.get('description')) else '')
    for g, v in p.items():
        if isinstance(v, dict):
            t += '**%s**\n\n| Parameter | Value |\n|:--|:--|\n' % g + ''.join('| %s | %s |\n' % (cell(k), cell(val(x))) for k, x in v.items()) + '\n'
        elif g != 'description': t += '%s: %s.\n\n' % (g, cell(val(v)))
t += '\\newpage\n\n## Actions\n\nAn action is a management operation of a set-up: sowing, tillage, fertilising, irrigation and so on. The text of each action is shown as it is defined in the library.\n\n'
for a in LIB['actions']:
    t += '### Action %s\n\nParent %s, from %s.\n\n```\n%s\n```\n\n' % (a['name'], cell(a.get('parent')), cell(a.get('file')), (a.get('src') or '').strip())
for k, h in [('programs', 'Programs'), ('logs', 'Log types')]:
    t += '## %s\n\n| Name | Parent | File |\n|:--|:--|:--|\n' % h + ''.join('| %s | %s | %s |\n' % (cell(x['name']), cell(x.get('parent')), cell(x.get('file'))) for x in LIB[k]) + '\n'
out['35_daisy_library.md'] = t

# 36 the weather stations: header and yearly summaries calculated from the bundled .dwf files
import glob
WD = os.path.join(M, '..', '..', 'app', 'data', 'daisy', 'weather')
t = '# The weather of the bundled stations {#daisy-stations}\n\nThe stations of the Weather stations tab are described here from their files. Every number below is calculated from the daily values of the file: the sums of rain and reference evapotranspiration, the means of temperature and radiation, and the number of days.\n\n'
for f in sorted(glob.glob(WD + '/*.dwf')):
    txt = open(f, encoding='latin-1').read().split('\n'); hdr = {}; i = 0
    for i, ln in enumerate(txt):
        if ln.startswith('-----'): break
        if ':' in ln: k, v = ln.split(':', 1); hdr[k.strip()] = v.strip()
    cols = txt[i + 1].split(); rows = []
    for ln in txt[i + 3:]:
        q = ln.split()
        if len(q) == len(cols):
            try: rows.append(dict(zip(cols, [float(x) for x in q])))
            except ValueError: pass
    name = hdr.get('Station', os.path.basename(f)); t += '## %s\n\n| Item | Value |\n|:--|:--|\n| File | %s |\n' % (name, os.path.basename(f)) + ''.join('| %s | %s |\n' % (cell(k), cell(v)) for k, v in hdr.items() if k != 'Station') + '| Columns | %s |\n| Days | %d |\n\n' % (cell(', '.join(cols)), len(rows))
    yrs = sorted({int(r['Year']) for r in rows}); rc = 'Precip' if 'Precip' in cols else None; tc = 'AirTemp' if 'AirTemp' in cols else None; gc = 'GlobRad' if 'GlobRad' in cols else None; ec = 'RefEvap' if 'RefEvap' in cols else None
    t += '### Years of %s\n\n| Year | Days | Rain, mm | Mean temperature, C | Mean radiation, W per m2 | Reference evapotranspiration, mm |\n|--:|--:|--:|--:|--:|--:|\n' % name
    for y in yrs:
        R = [r for r in rows if int(r['Year']) == y]; m = lambda c: ('%.1f' % (sum(r[c] for r in R) / len(R))) if c else 'n/a'; sm = lambda c: ('%.0f' % sum(r[c] for r in R)) if c else 'n/a'
        t += '| %d | %d | %s | %s | %s | %s |\n' % (y, len(R), sm(rc), m(tc), m(gc), sm(ec))
    t += '\n### Months of %s\n\nThe mean of all years of the file.\n\n| Month | Rain, mm | Mean temperature, C | Mean radiation, W per m2 | Reference evapotranspiration, mm |\n|--:|--:|--:|--:|--:|\n' % name
    for mo in range(1, 13):
        R = [r for r in rows if int(r['Month']) == mo]
        if not R: continue
        n = len(yrs); a = lambda c, tot: ('%.1f' % (sum(r[c] for r in R) / (n if tot else len(R)))) if c else 'n/a'
        t += '| %d | %s | %s | %s | %s |\n' % (mo, a(rc, 1), a(tc, 0), a(gc, 0), a(ec, 1))
    t += '\n'
out['36_daisy_stations.md'] = t

# 37 alphabetical index of the components of the Daisy reference
rows = sorted(((n, c['n'], c['title'], sc['id'], sc['name']) for c in CH for sc in c['sections'] for n in sc['params']), key=lambda r: (r[0].lower(), r[1]))
t = '# Index of the components of the Daisy reference {#daisy-index}\n\nEvery component named in the sections of the 107 topics, in alphabetical order, with the topic and the section where the reference describes it. There are %d entries.\n\n| Component | Topic | Section | Section name |\n|:--|--:|:--|:--|\n' % len(rows)
t += ''.join('| %s | %d | %s | %s |\n' % (cell(r[0]), r[1], cell(r[3]), cell(r[4])) for r in rows)
out['37_daisy_index.md'] = t

CLEAN = lambda v: re.sub(r'[\x80-\x9f]', '', v)
for k, v in out.items(): open(os.path.join(M, 'chapters', k), 'w', encoding='utf-8').write(CLEAN(v).replace('~~', '/').replace('~', '/'))
print({k: len(v) for k, v in out.items()}, N[0], 'screens')
