"""Writes chapters/31b_daisy_learn.md from the sample experiment (app/data/daisy/tutorial/MyFirstExperiment) and the labels of
   the Learn tab (app/js/daisylearn.js), so the manual and the program always show the same files and the same labels."""
import json, os, subprocess
H = os.path.dirname(os.path.abspath(__file__)); M = os.path.dirname(H); APP = os.path.join(M, '..', '..', 'app'); T = os.path.join(APP, 'data', 'daisy', 'tutorial', 'MyFirstExperiment')
js = ("global.window=global;global.DaisyUI={esc:s=>s,register(){}};global.DaisyIO={};require(%s);console.log(JSON.stringify({L:window.DaisyLearn.LESSONS,E:window.DaisyLearn.ERR}))" % json.dumps(os.path.join(APP, 'js', 'daisylearn.js')))
D = json.loads(subprocess.check_output(['node', '-e', js]).decode()); L = {l['id']: l for l in D['L']}
import re
plain = lambda s: re.sub(r'</?(b|i|code)>', lambda m: '**' if m.group(1) == 'b' else '*' if m.group(1) == 'i' else '`', s).replace('&#9664;', '').replace('&#9654;', '')
def listing(text, lab, title):
    lines = text.replace('\r', '').split('\n'); at = {}
    for k, l in enumerate(lab or []):
        for j, x in enumerate(lines):
            if l[0] in x and j not in at: at[j] = k + 1; break
    out = [x + ('   ;<%d>' % at[j] if j in at else '') for j, x in enumerate(lines)]
    s = '```lisp\n' + '\n'.join(out).rstrip() + '\n```\n\n'
    if lab: s += 'Table: The labels of %s.\n\n| Label | Where | What it does |\n|:--:|:--|:--|\n' % title + ''.join('| <%d> | `%s` | %s |\n' % (k + 1, l[0].split('\t')[0].replace('|', '\\|'), l[1].replace('|', '\\|')) for k, l in enumerate(lab)) + '\n'
    return s
rd = lambda p: open(os.path.join(T, p), encoding='utf-8').read()
o = []
o.append('# Learn the Daisy files: Common, .dai files and a sample experiment {#daisy-learn}\n')
o.append('This chapter teaches how a Daisy experiment is made by hand, file by file, with a complete sample experiment that you can download from the program (*Daisy model, Documentation, Learn the Daisy files, Download the sample experiment*). Every file is printed in full. The labels `;<1>`, `;<2>` ... at the ends of the lines are explained in the table under each file; in the program the same labels are drawn as orange numbers. The sample has two runs, spring barley without and with irrigation, on the Taastrup weather of 1990 to 1996. Both were run with Daisy 7.1.14 for this manual: each finishes with a water balance error of 0.0 mm, and their logs come with the sample.\n')
o.append('The grammar follows chapters 2 to 6 of the Daisy Program Reference Manual (concepts, nomenclature, the file parser, log files and error messages). The program also has the whole reference manual (*Reference manual* tab) and the Model builder, which writes any definition from a form.\n')
o.append('## How a Daisy experiment is laid out\n\n' + plain(L['tree']['intro']) + '\n')
o.append('```text\nMyFirstExperiment/                  <1> the experiment folder\n  Common/                           <2> what every run reads\n    my-soil.dai                     <3> soil horizons and the soil column\n    my-management.dai               <4> crop, fertiliser, tillage and irrigation\n    my-logs.dai                     <5> which results are written\n    Daily-1965-2000.dwf             <6> the daily weather\n  run-rainfed/                      <7> run 1\n    run.dai                             reads Common, sets weather, column, management, period\n    Annual-Harvest.dlf, Daily-Theta.dlf ...  <8> the logs Daisy writes here\n  run-irrigated/                        run 2: the same, with irrigation (one line differs)\n    run.dai\n    *.dlf\n```\n\n')
o.append('Table: The parts of an experiment folder.\n\n| Label | Part | What it is |\n|:--:|:--|:--|\n| <1> | MyFirstExperiment/ | One folder for the experiment. Give it a name without spaces. |\n| <2> | Common/ | The files every run shares. A run reads them with `(path "../Common" &old)`. |\n| <3> | my-soil.dai | Soil: `defhorizon` for each layer and `defcolumn` for the profile. |\n| <4> | my-management.dai | Management: `defaction` for the season, the fertiliser and the irrigation. |\n| <5> | my-logs.dai | The output list: which logs, when, into which .dlf file. |\n| <6> | *.dwf | The weather, a Daisy weather file. SWAFL writes one from online weather or from your own file in Input data. |\n| <7> | run-rainfed/run.dai | One run: the only file in its folder before it runs. |\n| <8> | *.dlf | The logs: tables of results with a header, read by Log plots, Mass balance and Run comparison. |\n\n')
o.append('### Making an experiment, step by step\n\n1. Make the folder `MyFirstExperiment` with a folder `Common` inside it.\n2. Write the soil, `Common/my-soil.dai`: copy the file below, or build the horizons in the Model builder (component *horizon*) and the column (component *column*) and press *Save as .dai*.\n3. Write the management, `Common/my-management.dai`, and the logs, `Common/my-logs.dai`.\n4. Put a weather file in `Common`: the bundled one, one written by *Input data* from the online weather of your place, or your own.\n5. Make a folder for each run with its `run.dai`. Copy the folder and change one line for each new run.\n6. Run Daisy in each run folder (below), load the folders in *Log plots* and compare two runs in *Run comparison*.\n\nThe *Experiments* tab writes such a folder for you from a design (factors and their levels) and runs it; the next section shows what it writes.\n\n')
o.append('## The grammar of a .dai file\n\n' + plain(L['gram']['intro']) + '\n\n' + listing(L['gram']['code'], L['gram']['lab'], 'the grammar example'))
o.append('Table: The kinds of value (reference manual, chapter 4).\n\n| Kind | Written as | Example |\n|:--|:--|:--|\n| number | a number and its unit in square brackets; `[]` for a fraction | `(K_sat 0.5 [cm/h])`, `(clay 0.12 [])` |\n| integer | a whole number | `(time 1990 1 1)` |\n| boolean | `true` or `false` | `(topsoil true)` |\n| string | text in double quotes | `(description "Ploughed topsoil")` |\n| PLF | pairs of numbers: a piecewise linear function | `(water_factor (0.8 0.0) (0.9 0.2) (1.0 1.0))` |\n| list | several values or brackets in one attribute | `(horizons (-30 [cm] "My Ap") (-100 [cm] "My Bt"))` |\n| component | the name of a model, with its own attributes in brackets | `(hydraulic hypres (topsoil true))` |\n| definition | `def` + component, a new name, the model it builds on, then the attributes | `(defhorizon "My C" "My Bt" (humus 0.005 []))` |\n\n')
for k, (lid, f) in enumerate([('soil', 'Common/my-soil.dai'), ('mgmt', 'Common/my-management.dai'), ('logs', 'Common/my-logs.dai')]):
    l = L[lid]; o.append('## %s\n\n%s\n\n' % (l['t'].split('. ', 1)[1], plain(l['intro'])) + listing(rd(f), l['lab'], f))
l = L['wx']; wx = '\n'.join(rd('Common/Daily-1965-2000.dwf').replace('\r', '').split('\n')[:32]) + '\n... (one line per day follows)'
o.append('## %s\n\n%s\n\n' % (l['t'].split('. ', 1)[1], plain(l['intro'])) + listing(wx, l['lab'], 'the weather file').replace('```lisp', '```text'))
o.append('Any daily weather can be written in this form. *Input data* writes a .dwf file from the online weather of a place (Open-Meteo, ERA5) or from a table of your own (CSV or Excel with date, rain, minimum and maximum temperature and radiation); the Daisy stations of the program are .dwf files too.\n\n')
l = L['run']; o.append('## %s\n\n%s\n\n' % (l['t'].split('. ', 1)[1], plain(l['intro'])) + listing(rd('run-rainfed/run.dai'), l['lab'], 'run-rainfed/run.dai'))
o.append('The irrigated run is the same file with two lines changed: its description and the manager, `(manager activity (repeat SBarley_irrigated))`. Making a new run is copying a run folder and changing what the run is about.\n\n')
o.append('## Run it and read the results\n\n' + plain(L['go']['intro']) + '\n\n- Windows: open a command window in `run-rainfed` and type `"C:\\Program Files\\Daisy\\bin\\daisy.cmd" run.dai`, then the same in `run-irrigated`.\n- SWAFL desktop: open `run.dai` in the set-up editor and press *Run Daisy*, or let the Experiments tab write and run the folders.\n- Daisy prints its progress and, at the end, the water balance of the whole run, `Balance (= In - Out - Increase) = 0.0 [mm]`.\n\n')
# results table from the logs of the sample
def dlf(p):
    L2 = rd(p).replace('\r', '').split('\n'); i = [k for k, x in enumerate(L2) if x.startswith('year')][0]; h = L2[i].split('\t'); return h, [x.split('\t') for x in L2[i + 2:] if x.strip()]
hr, rr = dlf('run-rainfed/Annual-Harvest.dlf'); hi, ri = dlf('run-irrigated/Annual-Harvest.dlf'); wr = dlf('run-rainfed/Annual-FWater.dlf'); wi = dlf('run-irrigated/Annual-FWater.dlf')
col = lambda h, r, n: r[h.index(n)]
o.append('Table: What the two runs of the sample give (Daisy 7.1.14). Yield: dry matter of the grain at harvest; the water terms are the seasons from 1 April, from Annual-FWater.dlf.\n\n| Season | Yield rainfed, Mg/ha | Yield irrigated, Mg/ha | Irrigation, mm | Evapotranspiration rainfed, mm | Evapotranspiration irrigated, mm | Percolation rainfed, mm | Percolation irrigated, mm |\n|:--|--:|--:|--:|--:|--:|--:|--:|\n')
for a, b in zip(rr, ri): pass
yrs = {}
for r in rr: yrs.setdefault(r[0], {})['yr'] = float(col(hr, r, 'sorg_DM'))
for r in ri: yrs.setdefault(r[0], {})['yi'] = float(col(hi, r, 'sorg_DM'))
for r in wr[1][1:]: yrs.setdefault(str(int(r[0]) - 1), {}).update(er=float(col(wr[0], r, 'Actual evapotranspiration')), pr=float(col(wr[0], r, 'Matrix percolation')))
for r in wi[1][1:]: yrs.setdefault(str(int(r[0]) - 1), {}).update(ei=float(col(wi[0], r, 'Actual evapotranspiration')), pi=float(col(wi[0], r, 'Matrix percolation')), I=float(col(wi[0], r, 'Irrigation')))
f = lambda d, k, n=0: ('%.' + str(n) + 'f') % d[k] if k in d else ''
for y in sorted(yrs):
    d = yrs[y]
    if 'yr' not in d or 'I' not in d: continue
    o.append('| %s | %s | %s | %s | %s | %s | %s | %s |\n' % (y, f(d, 'yr', 2), f(d, 'yi', 2), f(d, 'I'), f(d, 'er'), f(d, 'ei'), f(d, 'pr'), f(d, 'pi')))
o.append('\nIn this wet climate the irrigation (120 to 180 mm a season) raises evapotranspiration a little but mostly drains through the soil: the percolation below the root zone roughly doubles, while the yield hardly changes. This is the kind of answer an experiment gives. *Load the logs of both runs* in the Learn tab puts the fourteen logs in *Log plots*; *Load them and compare the two runs* opens *Run comparison* with the two water balances (section [Run comparison](#daisy-compare)).\n\n')
o.append('## When Daisy stops: messages and what to do\n\n' + plain(L['err']['intro']) + ' Each message gives the file, the line and the column (`run.dai:14:42`).\n\nTable: Daisy messages, why they come and what to do. Every message was written by Daisy 7.1.14 on the sample with one deliberate mistake.\n\n| Daisy says | Why | What to do |\n|:--|:--|:--|\n' + ''.join('| `%s` | %s | %s |\n' % (e[0].replace('|', '\\|'), e[1].replace('|', '\\|'), e[2].replace('|', '\\|')) for e in D['E']) + '\nDaisy also writes every message into `daisy.log` in the run folder. Warnings (such as a value it cannot convert) do not stop the run but should be read.\n\n')
l = L['tpl']; o.append('## Templates: one file, many runs\n\n' + plain(l['intro']) + '\n\n' + listing(l['code'], l['lab'], 'the template') + 'The set-up editor lists the placeholders of a file in its *Placeholders* panel, says what each one means when it stands for an attribute of the reference manual, and fills them in; *Calibration* fills them for every trial of the search.\n\n')
o.append('''## The Common folder that the Experiments tab writes

The Experiments and Scenarios tabs write the same kind of folder, so it can be run anywhere and read by hand. The folder of one experiment holds:

```text
MyExperiment/
  Common/
    ArableFarmRotation.dai   the rotation: spring barley, winter barley, winter rape, winter wheat,
                             with the fertiliser and the tensiometer irrigation of the design
    ResFarm.dai              the soils of the project (horizons and columns)
    OutputLog.dai            the logs every run writes (annual and daily)
    UserSoil.dai             your own soil horizons, when you gave them in Input data
    <weather>.dwf            the weather of the runs
    <library files>          the files of the Daisy library a design uses (a crop, a fertiliser,
                             a horizon, a chemical, a management action or a program), copied
                             with the files they read in turn
  <run name>/run.dai         one folder for each run of the design
```

and the `run.dai` of each run has this form (the values are those of the run):

```lisp
;; SWAFL scenario "Irrigation", variant "Irrigated"
(input file "../Common/ArableFarmRotation.dai")
(input file "../Common/ResFarm.dai")
(input file "../Common/OutputLog.dai")
;; the Daisy library used by this run
(path "../Common" &old)
(input file "winterwheat.dai")
(defunit [kWh/d/m^2] SIfactor (mass 1)(time -3)(factor 41.67))
(weather default "../Common/Daily-1965-2000.dwf"
  (PrecipCorrect 1)
  (TempOffset 0))
(description "Irrigation - Irrigated")
(log_prefix "irrigated-")
(manager activity
  (repeat "A_F_R"))
(defcolumn "SWAFL column" "ResFarm column"
  (Bioclimate FAO56_daily))
(column "SWAFL column")
(time 1990 01 01)
(stop 2010 04 1)
(activate_output (after 1991 03 31 23))
;; logs of the Daisy library added to this run
(output &old ("Soil Water Content"))
```

`PrecipCorrect` and `TempOffset` scale the rain and shift the temperature of the weather (the climate factors of a design); `(defcolumn "SWAFL column" "ResFarm column" ...)` builds the column of the run on a column of the project and changes only what the run is about; `(output &old (...))` adds a log to the output list of OutputLog.dai. The Experiments chapter lists every factor and the line it writes.

## A checklist before you run

- Every bracket is closed: the set-up editor says *Brackets and quotes are balanced*.
- Every name you use is defined in a file that is read: crops in crop.dai, fertilisers in fertilizer.dai, tillage in tillage.dai, your own in Common.
- Units are written as the reference manual gives them, and the units of the weather file are known (or defined with `defunit`).
- Clay, silt and sand of each horizon add up to 1; the lowest horizon reaches the bottom of the column.
- `time` is before `stop`, and `activate_output` leaves a year of warm-up.
- The output list writes what you want to read: the annual balances for the water and nitrogen budgets, the daily logs for figures through time.
''')
open(os.path.join(M, 'chapters', '31b_daisy_learn.md'), 'w', encoding='utf-8').write('\n'.join(o))
print('written', sum(len(x) for x in o), 'characters')
