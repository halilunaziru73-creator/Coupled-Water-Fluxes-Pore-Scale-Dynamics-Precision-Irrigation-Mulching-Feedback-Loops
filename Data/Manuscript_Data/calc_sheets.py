"""Calculated columns of the workbook as live Excel formulas, and native Excel charts drawn from them.
Called by make_workbook.py after eq_sheets.build().

1. All_runs_summary gets per-run formula columns (other evaporation, balance residual, differences from the rainfed
   twin, water productivities, trigger relative to the reach).
2. Baselines_E0: the rainfed baseline of every soil, read from the run table with SUMIFS.
3. The result sheets whose columns are algebraic functions of the data (R_p4_*, R_p1_table2, R_p3_ws61,
   D_N1_soil_specific_triggers) have those columns replaced by formulas that reproduce the script's numbers.
4. Column_Equations: every calculated column of every sheet, with its equation, the Excel formula of its first row,
   and, for the columns that are statistics computed by a script, the script and the method.
5. CH_P1 to CH_P4: chart sheets; each chart is drawn by Excel from formula columns, so changing an input redraws it."""
import openpyxl, re
from openpyxl.utils import get_column_letter as L
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.comments import Comment
from openpyxl.chart import ScatterChart, BarChart, LineChart, Reference, Series
from openpyxl.chart.shapes import GraphicalProperties
PAL = ['D55E00', '0072B2', '332288', '000000', '009E73', 'E69F00', 'CC79A7']
B = Font(bold=True); INP = PatternFill('solid', fgColor='FFF2CC'); OUT = PatternFill('solid', fgColor='E2EFDA'); H = PatternFill('solid', fgColor='DDEBF7')
SOILS = [('S01', 'S01_CoarseLoam', 'Coarse loam', 0.0961, 1.353), ('S02', 'S02_CoarseSand', 'Coarse sand', 0.0536, 1.60), ('S03', 'S03_Sand', 'Sand', 0.145, 2.68),
         ('S04', 'S04_LoamySand', 'Loamy sand', 0.124, 2.28), ('S05', 'S05_SandyLoam', 'Sandy loam', 0.075, 1.89), ('S06', 'S06_Loam', 'Loam', 0.036, 1.56),
         ('S07', 'S07_SiltLoam', 'Silt loam', 0.020, 1.41), ('S08', 'S08_SandyClayLoam', 'Sandy clay loam', 0.059, 1.48), ('S09', 'S09_ClayLoam', 'Clay loam', 0.019, 1.31),
         ('S10', 'S10_SiltyClayLoam', 'Silty clay loam', 0.010, 1.23)]
KS = {'S03': 712.8, 'S04': 350.2, 'S05': 106.1, 'S06': 24.96, 'S07': 6.24, 'S08': 31.44, 'S09': 6.24, 'S10': 1.68}
EQ = []   # (sheet, column, equation, excel formula of row 2 or method, kind)
def hdr(ws):
    return {str(ws.cell(1, j).value): j for j in range(1, ws.max_column + 1)}
def mark(ws, j, eq):
    c = ws.cell(1, j); c.fill = OUT; c.font = B; c.comment = Comment('Equation: ' + eq, 'SWAFL')
def setcol(ws, name, eq, f, kind='live formula', n=None, fmt=None):
    """Write formula f(r) into column `name` (created at the end if missing) for rows 2..n+1."""
    h = hdr(ws); j = h.get(name) or ws.max_column + 1; ws.cell(1, j, name); mark(ws, j, eq)
    n = n or ws.max_row - 1
    for r in range(2, n + 2):
        c = ws.cell(r, j, f(r)); c.fill = OUT
        if fmt: c.number_format = fmt
    EQ.append((ws.title, name, eq, ws.cell(2, j).value, kind)); return L(j)
def build(path, runs_cols, nruns):
    wb = openpyxl.load_workbook(path)
    col = {c: L(i + 1) for i, c in enumerate(runs_cols)}; last = nruns + 1
    RR = lambda c: "All_runs_summary!$%s$2:$%s$%d" % (col[c], col[c], last)
    # ---------------------------------------------------------------- 2. Baselines_E0
    bs = wb.create_sheet('Baselines_E0')
    bcols = ['rain_mm', 'irrigation_mm', 'ET_mm', 'transpiration_mm', 'soil_evap_mm', 'canopy_evap_mm', 'drainage_1m_mm', 'yield_Mg_ha', 'N_leached_kg_ha']
    for j, t in enumerate(['soil'] + bcols + ['other_evap_mm', 'balance_residual_mm'], 1): c = bs.cell(1, j, t); c.font = B; c.fill = H
    for i, s in enumerate(SOILS):
        r = i + 2; bs.cell(r, 1, s[1])
        for j, c in enumerate(bcols, 2):
            bs.cell(r, j, '=SUMIFS(%s,%s,"E0_Baselines",%s,$A%d,%s,"ok")' % (RR(c), RR('experiment'), RR('soil'), r, RR('status'))).fill = OUT
        bs.cell(r, 11, '=D{0}-E{0}-F{0}'.format(r)).fill = OUT; bs.cell(r, 12, '=B{0}+C{0}-D{0}-H{0}'.format(r)).fill = OUT
    for j, c in enumerate(bcols, 2): EQ.append(('Baselines_E0', c, 'X0(soil) = the value of X in the rainfed run (E0) of the soil', bs.cell(2, j).value, 'live formula'))
    EQ.append(('Baselines_E0', 'other_evap_mm', 'Eo0 = ET0 - T0 - Es0', bs.cell(2, 11).value, 'live formula'))
    EQ.append(('Baselines_E0', 'balance_residual_mm', 'P0 - ET0 - D0 = storage change and runoff of the rainfed run', bs.cell(2, 12).value, 'live formula'))
    bs.column_dimensions['A'].width = 20
    BX = lambda c: 'INDEX(Baselines_E0!$%s$2:$%s$11,MATCH(%s{0},Baselines_E0!$A$2:$A$11,0))' % (L(bcols.index(c) + 2), L(bcols.index(c) + 2), col['soil'])
    # ---------------------------------------------------------------- 1. per-run formula columns
    ws = wb['All_runs_summary']; c = col
    n = nruns
    setcol(ws, 'other_evap_mm', 'Eo = ET - T - Es (canopy, ponds, litter)', lambda r: '={1}{0}-{2}{0}-{3}{0}'.format(r, c['ET_mm'], c['transpiration_mm'], c['soil_evap_mm']), n=n)
    setcol(ws, 'balance_residual_mm', 'P + I - ET - D = storage change + runoff', lambda r: '={1}{0}+{2}{0}-{3}{0}-{4}{0}'.format(r, c['rain_mm'], c['irrigation_mm'], c['ET_mm'], c['drainage_1m_mm']), n=n)
    setcol(ws, 'T_share_of_ET', 'T / ET', lambda r: '=IF({1}{0}>0,{2}{0}/{1}{0},"")'.format(r, c['ET_mm'], c['transpiration_mm']), n=n, fmt='0.000')
    setcol(ws, 'WP_ET_kg_m3', 'WP = 100 Y / ET (Y in Mg/ha, ET in mm)', lambda r: '=IF({1}{0}>0,100*{2}{0}/{1}{0},"")'.format(r, c['ET_mm'], c['yield_Mg_ha']), n=n, fmt='0.00')
    for nm, src, eq in [('dT_mm', 'transpiration_mm', 'dT = T - T0 (T0 of the rainfed run of the same soil)'), ('dEs_mm', 'soil_evap_mm', 'dEs = Es - Es0'),
                        ('dET_mm', 'ET_mm', 'dET = ET - ET0'), ('dD_mm', 'drainage_1m_mm', 'dD = D - D0'), ('dY_Mg_ha', 'yield_Mg_ha', 'dY = Y - Y0'), ('dNL_kg_ha', 'N_leached_kg_ha', 'dNL = NL - NL0')]:
        setcol(ws, nm, eq, lambda r, s=src: ('={1}{0}-' + BX(s)).format(r, c[s]), n=n, fmt='0.0')
    h = hdr(ws); cT, cEs, cET, cD, cY = (L(h[k]) for k in ['dT_mm', 'dEs_mm', 'dET_mm', 'dD_mm', 'dY_Mg_ha'])
    setcol(ws, 'dEo_mm', 'dEo = dET - dT - dEs (extra other evaporation)', lambda r: '={1}{0}-{2}{0}-{3}{0}'.format(r, cET, cT, cEs), n=n, fmt='0.0')
    setcol(ws, 'dS_mm', 'dS = I - dET - dD (extra storage change and runoff)', lambda r: '={1}{0}-{2}{0}-{3}{0}'.format(r, c['irrigation_mm'], cET, cD), n=n, fmt='0.0')
    setcol(ws, 'IWP_kg_m3', 'IWP = 100 (Y - Y0) / I', lambda r: '=IF({1}{0}>0,100*{2}{0}/{1}{0},"")'.format(r, c['irrigation_mm'], cY), n=n, fmt='0.00')
    setcol(ws, 'trigger_cm', 'h_t = -(trigger potential), suction in cm', lambda r: '=IF({1}{0}="","",-{1}{0})'.format(r, c['set_trigger_potential_cm']), n=n)
    htc = L(hdr(ws)['trigger_cm'])
    setcol(ws, 'trigger_over_reach', 'x = h_t / h_c(soil), h_c from Eq. (4) in EQ_P4_reach', lambda r: '=IF({1}{0}="","",{1}{0}/INDEX(EQ_P4_reach!$G$6:$G$15,MATCH(LEFT({2}{0},3),EQ_P4_reach!$A$6:$A$15,0)))'.format(r, htc, c['soil']), n=n, fmt='0.000')
    A = lambda k: "All_runs_summary!$%s$2:$%s$%d" % (L(hdr(ws)[k]), L(hdr(ws)[k]), last)
    # ---------------------------------------------------------------- 3. result sheets as formulas
    t = wb['R_p4_tableA1_reach']
    setcol(t, 'reach_Eq4_cm', 'h_c = (1/alpha) (m^2/kappa)^(1/(2n + l(n-1))), m = 1 - 1/n; kappa and l in EQ_P4_reach!B2:B3',
           lambda r: '=(1/C{0})*((1-1/D{0})^2/EQ_P4_reach!$B$2)^(1/(2*D{0}+EQ_P4_reach!$B$3*(D{0}-1)))'.format(r), fmt='0')
    for nm, eq, method in [('reach_observed_low_cm', 'driest trigger of E2 with irrigation >= 5 mm/yr', 'p4_reach.py: largest set_trigger with irrigation_mm >= 5 in E2 (see R_p4_fig3_trigger_runs)'),
                           ('reach_observed_high_cm', 'next drier trigger of E2 (irrigation < 5 mm/yr)', 'p4_reach.py: smallest trigger above the low end with irrigation_mm < 5')]:
        EQ.append(('R_p4_tableA1_reach', nm, eq, method, 'from the runs by the script'))
    t = wb['R_p4_fig3_trigger_runs']
    setcol(t, 'trigger_over_reach', 'x = h_t / h_c', lambda r: '=B{0}/INDEX(R_p4_tableA1_reach!$H$2:$H$11,MATCH(LEFT(A{0},3),R_p4_tableA1_reach!$A$2:$A$11,0))'.format(r), fmt='0.000')
    setcol(t, 'Inorm', 'I / max(I of the soil in E2)', lambda r: '=C{0}/SUMPRODUCT(MAX(($A$2:$A${1}=A{0})*$C$2:$C${1}))'.format(r, t.max_row), fmt='0.000')
    t = wb['R_p4_fig4a_fate_by_soil']
    crit = lambda r: '%s,"E10_Amount_Timing_Soil",%s,INDEX(EQ_P4_fate!$B$6:$B$15,MATCH(A%d,EQ_P4_fate!$A$6:$A$15,0)),%s,">20",%s,"ok"' % (RR('experiment'), RR('soil'), r, RR('irrigation_mm'), RR('status'))
    for nm, k in [('transpired', 'dT_mm'), ('soil_evaporation', 'dEs_mm'), ('other_evaporation', 'dEo_mm'), ('drained', 'dD_mm'), ('storage_runoff', 'dS_mm')]:
        setcol(t, nm, 'eta = sum(%s) / sum(I) over the runs of E10 of the soil with I > 20 mm' % k, lambda r, k=k: '=SUMIFS(%s,%s)/SUMIFS(%s,%s)' % (A(k), crit(r), RR('irrigation_mm'), crit(r)), fmt='0.000')
    t = wb['R_p4_fig4b_fate_by_method']
    EXN = {'E4': 'E4_Methods', 'E15': 'E15_Method_Depth_Amount'}
    critm = lambda r: '%s,IF(A%d="E4","E4_Methods","E15_Method_Depth_Amount"),%s,B%d,%s,"ok"' % (RR('experiment'), r, RR('set_irrigation_method'), r, RR('status'))
    for nm, k in [('transpired', 'dT_mm'), ('soil_evaporation', 'dEs_mm'), ('other_evaporation', 'dEo_mm'), ('drained', 'dD_mm')]:
        setcol(t, nm, 'eta = sum(%s) / sum(I) over all runs of the experiment with this method' % k, lambda r, k=k: '=SUMIFS(%s,%s)/SUMIFS(%s,%s)' % (A(k), critm(r), RR('irrigation_mm'), critm(r)), fmt='0.000')
    t = wb['R_p4_fig5_dose']
    critd = lambda r: '%s,"E10_Amount_Timing_Soil",%s,INDEX(EQ_P4_fate!$B$6:$B$15,MATCH(A%d,EQ_P4_fate!$A$6:$A$15,0)),%s,">20",%s,"ok",%s,B%d' % (RR('experiment'), RR('soil'), r, RR('irrigation_mm'), RR('status'), RR('set_dose_mm_per_event'), r)
    for nm, k in [('drained', ['dD_mm']), ('transpired', ['dT_mm']), ('evaporated', ['dEs_mm', 'dEo_mm'])]:
        setcol(t, nm, 'eta = sum(%s) / sum(I), runs of E10 of the soil with this dose and I > 20 mm' % '+'.join(k),
               lambda r, k=k: '=(' + '+'.join('SUMIFS(%s,%s)' % (A(x), critd(r)) for x in k) + ')/SUMIFS(%s,%s)' % (RR('irrigation_mm'), critd(r)), fmt='0.000')
    for nm, method in [('fit_plateau', 'least squares fit of eta_D(d) = eta_inf (1 - exp(-d/d_D)) per soil (scipy curve_fit, p4_reach.py); Excel: Solver on column fit_residual'),
                       ('fit_dose_scale_mm', 'same fit, second parameter'), ('fit_R2', '1 - SS_res/SS_tot of the fit')]:
        EQ.append(('R_p4_fig5_dose', nm, 'parameter of the dose law', method, 'from the runs by the script'))
    setcol(t, 'fit_eta_D', 'eta_D(d) = eta_inf (1 - exp(-d/d_D))', lambda r: '=F{0}*(1-EXP(-B{0}/G{0}))'.format(r), fmt='0.000')
    setcol(t, 'fit_residual', 'observed - fitted', lambda r: '=C{0}-I{0}'.format(r), fmt='0.000')
    t = wb['R_p4_window']
    critw = lambda r: '%s,"E10_Amount_Timing_Soil",%s,A%d,%s,">20",%s,"ok"' % (RR('experiment'), RR('set_irrigation_window'), r, RR('irrigation_mm'), RR('status'))
    setcol(t, 'I', 'sum of irrigation of the irrigated runs (I > 20 mm) of E10 with this window', lambda r: '=SUMIFS(%s,%s)' % (RR('irrigation_mm'), critw(r)), fmt='0')
    setcol(t, 'etaT', 'eta_T = sum(dT)/sum(I) for the window', lambda r: '=SUMIFS(%s,%s)/D%d' % (A('dT_mm'), critw(r), r), fmt='0.000')
    setcol(t, 'etaD', 'eta_D = sum(dD)/sum(I) for the window', lambda r: '=SUMIFS(%s,%s)/D%d' % (A('dD_mm'), critw(r), r), fmt='0.000')
    t = wb['R_p1_table2']; hh = hdr(t); a_, n_ = L(hh['alpha']), L(hh['n'])
    se = lambda h: '(1+({a}{{0}}*%s)^{n}{{0}})^(-(1-1/{n}{{0}}))' % h
    setcol(t, 'Se100', 'Se(100 cm) = [1 + (100 alpha)^n]^-(1-1/n)', lambda r: ('=' + se(100).format(a=a_, n=n_)).format(r), fmt='0.0000')
    setcol(t, 'Se30', 'Se(30 cm)', lambda r: ('=' + se(30).format(a=a_, n=n_)).format(r), fmt='0.0000')
    s30 = L(hdr(t)['Se30'])
    setcol(t, 'logKr30', 'log10 Kr(30 cm), Kr = Se^0.5 [1 - (1 - Se^(1/m))^m]^2', lambda r: '=LOG10(SQRT({s}{0})*(1-(1-{s}{0}^(1/(1-1/{n}{0})))^(1-1/{n}{0}))^2+1E-12)'.format(r, s=s30, n=n_), fmt='0.000')
    setcol(t, 'm_ret', 'retained share = 1 - phi_D(E9)', lambda r: '=1-B{0}'.format(r), fmt='0.000')
    setcol(t, 'r_E16', 'recoverable share rho_R = 1 - psi_D(E16)', lambda r: '=1-F{0}'.format(r), fmt='0.000')
    setcol(t, 'r_E7', 'recoverable share = 1 - psi_D(E7)', lambda r: '=1-J{0}'.format(r), fmt='0.000')
    for sh in ['R_p1_table', 'R_p1_table2']:
        for nm, eq, method in [('phiD_E9', 'memory fate to drainage: pooled within-soil slope of dD on the storage release, E9', 'p1_core.py: within-group OLS slope (Excel: SLOPE over the E9 runs of the soil)'),
                               ('phiT_E9', 'memory fate to transpiration, E9', 'p1_core.py: within-group OLS slope'), ('phiE_E9', 'memory fate to soil evaporation, E9', 'p1_core.py: within-group OLS slope'),
                               ('capFC', 'storage at field capacity of the profile (mm)', 'p1_core.py: sum over layers of theta(100 cm) x thickness'),
                               ('psiD_E16', 'share of an evaporation saving lost to drainage, E16', 'p1_core.py: sum(dD)/sum(dE saved) over the mulch runs'),
                               ('psiI_E16', 'share recovered as reduced irrigation, E16', 'p1_core.py'), ('psiT_E16', 'share to transpiration, E16', 'p1_core.py'), ('dE16', 'evaporation saved (mm), E16', 'p1_core.py: Es0 - Es'),
                               ('psiD_E7', 'share lost to drainage, E7', 'p1_core.py'), ('psiI_E7', 'share recovered as irrigation, E7', 'p1_core.py'), ('spanE7', 'evaporation span (mm), E7', 'p1_core.py')]:
            if nm in hdr(wb[sh]): EQ.append((sh, nm, eq, method, 'from the runs by the script'))
    t = wb['R_p3_ws61']; setcol(t, 'err_pct', 'relative difference = |SWAFL - book| / book x 100', lambda r: '=ABS(D{0}-C{0})/C{0}*100'.format(r), fmt='0.0000')
    t = wb['D_N1_soil_specific_triggers']
    sv = lambda h: '(1+(INDEX(EQ_P2!$C$5:$C$14,MATCH(LEFT(A{0},3),EQ_P2!$A$5:$A$14,0))*%s)^INDEX(EQ_P2!$D$5:$D$14,MATCH(LEFT(A{0},3),EQ_P2!$A$5:$A$14,0)))^(-(1-1/INDEX(EQ_P2!$D$5:$D$14,MATCH(LEFT(A{0},3),EQ_P2!$A$5:$A$14,0))))' % h
    al = 'INDEX(EQ_P2!$C$5:$C$14,MATCH(LEFT(A{0},3),EQ_P2!$A$5:$A$14,0))'; nn = 'INDEX(EQ_P2!$D$5:$D$14,MATCH(LEFT(A{0},3),EQ_P2!$A$5:$A$14,0))'
    sst = '(%s-EQ_P2!$B$2*(%s-%s))' % (sv(100), sv(100), sv(15849))
    setcol(t, 'h_star', '(one-horizon closed form; the script averages f over the two horizons Ap 0-25 cm and Bt 25-100 cm and solves f = f* numerically, Results/08_Scripts/novel.py) h* = -(1/alpha) [Se*^(-1/m) - 1]^(1/n), Se* = Se(100) - f* [Se(100) - Se(15849)], f* in EQ_P2!B2',
           lambda r: ('=-(1/%s)*(%s^(-1/(1-1/%s))-1)^(1/%s)' % (al, sst, nn, nn)).format(r), fmt='0.0')
    setcol(t, 'f_at_300', 'f(300) = [Se(100) - Se(300)] / [Se(100) - Se(15849)]', lambda r: ('=(%s-%s)/(%s-%s)' % (sv(100), sv(300), sv(100), sv(15849))).format(r), fmt='0.000')
    # ---------------------------------------------------------------- 5. chart sheets
    charts(wb)
    # ---------------------------------------------------------------- 4. Column_Equations
    script_cols(wb)
    ce = wb.create_sheet('Column_Equations', 1)
    ce['A1'] = 'Every calculated column of the workbook: the equation, the Excel formula of its first row (live formulas, green headers with the equation as a comment), or, for statistics computed by a script, the script and the method. Inputs read from the Daisy runs are not listed.'
    ce['A1'].font = Font(italic=True)
    for j, t_ in enumerate(['Sheet', 'Column', 'Equation', 'Excel formula (row 2) or method', 'How it is computed'], 1): c_ = ce.cell(3, j, t_); c_.font = B; c_.fill = H
    for i, row in enumerate(EQ, 4):
        for j, v in enumerate(row, 1):
            c_ = ce.cell(i, j, (' ' + v) if (j == 4 and isinstance(v, str) and v.startswith('=')) else v); c_.alignment = Alignment(wrap_text=True, vertical='top')
            if j == 5 and v == 'live formula': c_.fill = OUT
    for k, w in zip('ABCDE', [24, 22, 60, 80, 22]): ce.column_dimensions[k].width = w
    wb.save(path)
    return len(EQ)
def script_cols(wb):
    """Columns of result sheets that are statistics of a script (regressions, bootstrap, fits): list them with the script."""
    done = {(s, c) for s, c, *_ in EQ}
    import os, glob
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
    srcs = {p: open(p, errors='ignore').read() for p in glob.glob(os.path.join(root, 'Manuscripts/reproducibility/**/*.py'), recursive=True)}
    for ws in wb.worksheets:
        if not re.match(r'^(R_|D_)', ws.title): continue
        stem = ws.title[2:]
        who = sorted({os.path.basename(p) for p, s in srcs.items() if stem in s and not p.endswith(('calc_sheets.py', 'make_workbook.py'))})[:3]
        for j in range(1, ws.max_column + 1):
            nm = str(ws.cell(1, j).value)
            if (ws.title, nm) in done or nm in ('soil', 'id', 'key', 'Unnamed: 0', 'experiment', 'method', 'window', 'law', 'lever', 'exp', 'out', 'irr', 'quantity'): continue
            EQ.append((ws.title, nm, 'value of the analysis written by the script', (', '.join(who) or 'see Table_Figure_Map') + (' (key/value: every key is one computed quantity)' if nm == 'value' else ''), 'computed by the script'))
def tbl(ws, r0, c0, head, rows):
    for j, t in enumerate(head): x = ws.cell(r0, c0 + j, t); x.font = B; x.fill = H
    for i, row in enumerate(rows, 1):
        for j, v in enumerate(row):
            x = ws.cell(r0 + i, c0 + j, v)
            if isinstance(v, str) and v.startswith('='): x.fill = OUT
            elif isinstance(v, (int, float)): x.fill = INP
def scat(title, xt, yt, logx=False, logy=False, w=16, h=9):
    ch = ScatterChart(); ch.title = title; ch.style = 13; ch.x_axis.title = xt; ch.y_axis.title = yt; ch.width, ch.height = w, h
    if logx: ch.x_axis.scaling.logBase = 10
    if logy: ch.y_axis.scaling.logBase = 10
    ch.x_axis.delete = False; ch.y_axis.delete = False
    return ch
def addser(ch, ws, xc, yc, r1, r2, name, line=True, marker=None):
    s = Series(Reference(ws, min_col=yc, min_row=r1, max_row=r2), Reference(ws, min_col=xc, min_row=r1, max_row=r2), title=name)
    col = PAL[len(ch.series) % len(PAL)]
    if not line: s.graphicalProperties.line.noFill = True
    else: s.graphicalProperties.line.solidFill = col; s.graphicalProperties.line.width = 22000
    if marker:
        s.marker.symbol = marker; s.marker.size = 7; s.marker.graphicalProperties = GraphicalProperties(solidFill=col); s.marker.graphicalProperties.line.solidFill = col
    else: s.marker.symbol = 'none'
    s.smooth = False; ch.series.append(s)
def charts(wb):
    # ======================= Paper 4
    ws = wb.create_sheet('CH_P4')
    ws['A1'] = 'Paper 4 charts. Every plotted column is a formula (green) of the inputs (yellow) or of the result sheets; change alpha, n or kappa in EQ_P4_reach and the charts redraw.'
    rows = []
    for k in range(41):
        r = 4 + k; hv = '=10^(%d/8)' % k
        f = lambda sid: ('INDEX(EQ_P4_reach!$C$6:$C$15,MATCH("%s",EQ_P4_reach!$A$6:$A$15,0))' % sid, 'INDEX(EQ_P4_reach!$D$6:$D$15,MATCH("%s",EQ_P4_reach!$A$6:$A$15,0))' % sid)
        def kr(sid):
            a, n = f(sid); se = '(1+(%s*A%d)^%s)^(-(1-1/%s))' % (a, r, n, n)
            return '=%s^EQ_P4_reach!$B$3*(1-(1-%s^(1/(1-1/%s)))^(1-1/%s))^2' % (se, se, n, n)
        rows.append([hv, kr('S03'), kr('S06'), kr('S10'), '=EQ_P4_reach!$B$2'])
    tbl(ws, 3, 1, ['h (cm)', 'Kr sand (S03)', 'Kr loam (S06)', 'Kr silty clay loam (S10)', 'kappa'], rows)
    ch = scat('Relative conductivity and the constant kappa: the reach is where a curve meets kappa', 'suction h (cm)', 'Kr', True, True)
    for j, nm in [(2, 'sand'), (3, 'loam'), (4, 'silty clay loam'), (5, 'kappa')]: addser(ch, ws, 1, j, 4, 44, nm)
    ch.y_axis.scaling.min = 1e-16; ch.y_axis.scaling.max = 1; ws.add_chart(ch, 'G3')
    rows = [['=EQ_P4_reach!D%d' % (6 + i), '=EQ_P4_reach!G%d' % (6 + i), '=EQ_P4_reach!J%d' % (6 + i), '=IF(EQ_P4_reach!K%d="inf",NA(),EQ_P4_reach!K%d)' % (6 + i, 6 + i), '=EQ_P4_reach!A%d' % (6 + i)] for i in range(10)]
    tbl(ws, 47, 1, ['n', 'h_c Eq. (4) (cm)', 'observed low (cm)', 'observed high (cm)', 'soil'], rows)
    ch = scat('Reach against n: Eq. (4) and the interval observed in E2', 'van Genuchten n', 'suction (cm)', False, True)
    addser(ch, ws, 1, 2, 48, 57, 'h_c, Eq. (4)', False, 'circle'); addser(ch, ws, 1, 3, 48, 57, 'observed low', False, 'triangle'); addser(ch, ws, 1, 4, 48, 57, 'observed high', False, 'square')
    ws.add_chart(ch, 'G22')
    t = wb['R_p4_fig4a_fate_by_soil']; nr = t.max_row
    bc = BarChart(); bc.type = 'col'; bc.grouping = 'stacked'; bc.overlap = 100; bc.title = 'Fate of an irrigation millimetre by soil (E10, live SUMIFS)'; bc.y_axis.title = 'share of irrigation'; bc.width, bc.height = 16, 9
    bc.add_data(Reference(t, min_col=2, max_col=6, min_row=1, max_row=nr), titles_from_data=True); bc.set_categories(Reference(t, min_col=1, min_row=2, max_row=nr))
    bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'G41')
    t = wb['R_p4_fig5_dose']; rr = [r for r in range(2, t.max_row + 1) if t.cell(r, 1).value == 'S06']
    if rr:
        ch = scat('Dose law of loam: observed (dots, live SUMIFS) and fitted Eq. (6) (line)', 'dose d (mm per event)', 'share drained eta_D')
        addser(ch, t, 2, 3, rr[0], rr[-1], 'observed', False, 'circle'); addser(ch, t, 2, 9, rr[0], rr[-1], 'fitted law'); ws.add_chart(ch, 'G60')
    t = wb['R_p4_fig3_trigger_runs']
    for k, (sid, anchor) in enumerate([('S03_Sand', 'G79'), ('S06_Loam', 'Q79')]):
        rr = [r for r in range(2, t.max_row + 1) if t.cell(r, 1).value == sid]
        ch = scat('E2, %s: irrigation against trigger (the reach ends irrigation)' % sid, 'trigger h_t (cm)', 'irrigation (mm/yr)', True, False, 12, 9)
        addser(ch, t, 2, 3, rr[0], rr[-1], sid, False, 'circle'); ws.add_chart(ch, anchor)
    # ======================= Paper 1
    ws = wb.create_sheet('CH_P1')
    ws['A1'] = 'Paper 1 charts. The rate-competition law phi_D = Ks/(Ks + q*) (Eq. 7) with q* in B2, against the memory fate phi_D of each soil (R_p1_table2).'
    ws['A2'], ws['B2'] = 'q* (cm/d)', 71.5; ws['B2'].fill = INP
    rows = [[k, KS[k], '=INDEX(R_p1_table2!$B$2:$B$11,MATCH("%s",R_p1_table2!$A$2:$A$11,0))' % k, '=B%d/(B%d+$B$2)' % (5 + i, 5 + i)] for i, k in enumerate(KS)]
    tbl(ws, 4, 1, ['soil', 'Ks (cm/d)', 'phi_D observed (E9)', 'phi_D law'], rows)
    rows = [['=10^(%d/8)' % k, '=A%d/(A%d+$B$2)' % (16 + k, 16 + k)] for k in range(0, 27)]
    tbl(ws, 15, 1, ['Ks grid (cm/d)', 'law'], rows)
    ch = scat('Rate-competition law: share of the memory lost to drainage', 'saturated conductivity Ks (cm/d)', 'phi_D', True)
    addser(ch, ws, 1, 2, 16, 42, 'phi_D = Ks/(Ks+q*)'); addser(ch, ws, 2, 3, 5, 12, 'observed (8 soils)', False, 'circle'); ws.add_chart(ch, 'F3')
    t = wb['R_p1_table2']; h = hdr(t)
    bc = BarChart(); bc.type = 'col'; bc.title = 'Recoverable share of an evaporation saving, 1 - psi_D (live formula)'; bc.width, bc.height = 16, 8
    bc.add_data(Reference(t, min_col=h['r_E16'], max_col=h['r_E16'], min_row=1, max_row=11), titles_from_data=True); bc.add_data(Reference(t, min_col=h['r_E7'], max_col=h['r_E7'], min_row=1, max_row=11), titles_from_data=True)
    bc.set_categories(Reference(t, min_col=1, min_row=2, max_row=11)); bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'F22')
    b = wb['Baselines_E0']
    bc = BarChart(); bc.type = 'col'; bc.grouping = 'stacked'; bc.overlap = 100; bc.title = 'Water balance of the rainfed baseline of each soil (E0, live SUMIFS)'; bc.y_axis.title = 'mm per year'; bc.width, bc.height = 16, 8
    for j in [5, 6, 11, 8]: bc.add_data(Reference(b, min_col=j, max_col=j, min_row=1, max_row=11), titles_from_data=True)
    bc.set_categories(Reference(b, min_col=1, min_row=2, max_row=11)); bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'F39')
    # ======================= Paper 2
    ws = wb.create_sheet('CH_P2')
    ws['A1'] = 'Paper 2 charts. Depletion f(h) = [Se(100) - Se(h)]/[Se(100) - Se(15849)] of three soils and the common critical depletion f* (EQ_P2!B2); the trigger suction h* of each soil.'
    rows = []
    for k in range(33):
        r = 4 + k
        def fdep(sid):
            a = 'INDEX(EQ_P2!$C$5:$C$14,MATCH("%s",EQ_P2!$A$5:$A$14,0))' % sid; n = 'INDEX(EQ_P2!$D$5:$D$14,MATCH("%s",EQ_P2!$A$5:$A$14,0))' % sid
            S = lambda h: '(1+(%s*%s)^%s)^(-(1-1/%s))' % (a, h, n, n)
            return '=(%s-%s)/(%s-%s)' % (S(100), S('A%d' % r), S(100), S(15849))
        rows.append(['=100*10^(%d/14)' % k, fdep('S03'), fdep('S06'), fdep('S10'), '=EQ_P2!$B$2'])
    tbl(ws, 3, 1, ['h (cm)', 'f sand', 'f loam', 'f silty clay loam', 'f*'], rows)
    ch = scat('Depletion against suction: the same f* is met at a different suction in each soil', 'suction h (cm)', 'depletion f', True)
    for j, nm in [(2, 'sand'), (3, 'loam'), (4, 'silty clay loam'), (5, 'f* = 0.45')]: addser(ch, ws, 1, j, 4, 36, nm)
    ws.add_chart(ch, 'G3')
    t = wb['D_N1_soil_specific_triggers']
    rows = [['=D_N1_soil_specific_triggers!A%d' % r, '=-D_N1_soil_specific_triggers!B%d' % r, '=D_N1_soil_specific_triggers!C%d' % r] for r in range(2, 12)]
    tbl(ws, 39, 1, ['soil', 'h* (cm) for f*', 'f at 300 cm'], rows)
    bc = BarChart(); bc.type = 'col'; bc.title = 'Soil-specific trigger h* for the common depletion f* (live formula)'; bc.y_axis.title = 'h* (cm)'; bc.width, bc.height = 16, 8
    bc.add_data(Reference(ws, min_col=2, max_col=2, min_row=39, max_row=49), titles_from_data=True); bc.set_categories(Reference(ws, min_col=1, min_row=40, max_row=49))
    bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'G22')
    bc = BarChart(); bc.type = 'col'; bc.title = 'Depletion reached by a 300 cm trigger in each soil'; bc.width, bc.height = 16, 8
    bc.add_data(Reference(ws, min_col=3, max_col=3, min_row=39, max_row=49), titles_from_data=True); bc.set_categories(Reference(ws, min_col=1, min_row=40, max_row=49))
    bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'G39')
    # ======================= Paper 3
    ws = wb.create_sheet('CH_P3')
    ws['A1'] = 'Paper 3 charts. FAO-56 crop coefficient through the season from the stage lengths and coefficients of EQ_P3 (B11:B17); run budget N = MIN(product of levels, B) for budgets 10 to 300; book against SWAFL (R_p3_ws61).'
    rows = []
    for k in range(0, 151, 5):
        r = 4 + k // 5; t_ = 'A%d' % r
        rows.append([k, '=IF({t}<EQ_P3!$B$14,EQ_P3!$B$11,IF({t}<EQ_P3!$B$14+EQ_P3!$B$15,EQ_P3!$B$11+(EQ_P3!$B$12-EQ_P3!$B$11)*({t}-EQ_P3!$B$14)/EQ_P3!$B$15,IF({t}<EQ_P3!$B$14+EQ_P3!$B$15+EQ_P3!$B$16,EQ_P3!$B$12,EQ_P3!$B$12+(EQ_P3!$B$13-EQ_P3!$B$12)*MIN(1,({t}-EQ_P3!$B$14-EQ_P3!$B$15-EQ_P3!$B$16)/EQ_P3!$B$17))))'.format(t=t_)])
    tbl(ws, 3, 1, ['day t', 'Kc(t)'], rows)
    ch = scat('FAO-56 crop coefficient through the season (live formula)', 'day of season', 'Kc'); addser(ch, ws, 1, 2, 4, 34, 'Kc(t)'); ws.add_chart(ch, 'E3')
    rows = [[b_, '=MIN(EQ_P3!$B$28*EQ_P3!$B$29*EQ_P3!$B$30,A%d)' % (38 + i)] for i, b_ in enumerate(range(10, 310, 20))]
    tbl(ws, 37, 1, ['budget B', 'runs N'], rows)
    ch = scat('Run budget: N = MIN(product of levels, B)', 'budget B', 'runs made N'); addser(ch, ws, 1, 2, 38, 37 + len(rows), 'N', True, 'circle'); ws.add_chart(ch, 'E21')
    t = wb['R_p3_ws61']
    bc = BarChart(); bc.type = 'col'; bc.title = 'Surface irrigation: textbook value against SWAFL'; bc.width, bc.height = 16, 8
    bc.add_data(Reference(t, min_col=3, max_col=4, min_row=1, max_row=t.max_row), titles_from_data=True); bc.set_categories(Reference(t, min_col=2, min_row=2, max_row=t.max_row))
    bc.x_axis.delete = False; bc.y_axis.delete = False; ws.add_chart(bc, 'E39')
