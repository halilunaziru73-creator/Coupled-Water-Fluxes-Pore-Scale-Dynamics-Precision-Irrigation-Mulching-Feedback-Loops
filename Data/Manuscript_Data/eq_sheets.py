"""Equation sheets of the workbook: the equations of the four papers written as live Excel formulas, connected to the
data sheets (All_runs_summary, R_p1_table2, R_p4_tableA1_reach). Called by make_workbook.py after the data sheets are written."""
import openpyxl
from openpyxl.utils import get_column_letter as L
from openpyxl.styles import Font, PatternFill, Alignment
B = Font(bold=True); INP = PatternFill('solid', fgColor='FFF2CC'); OUT = PatternFill('solid', fgColor='E2EFDA'); H = PatternFill('solid', fgColor='DDEBF7')
SOILS = [('S01', 'S01_CoarseLoam', 'Coarse loam', 0.0961, 1.353, 130), ('S02', 'S02_CoarseSand', 'Coarse sand', 0.0536, 1.60, 105), ('S03', 'S03_Sand', 'Sand', 0.145, 2.68, 60),
         ('S04', 'S04_LoamySand', 'Loamy sand', 0.124, 2.28, 75), ('S05', 'S05_SandyLoam', 'Sandy loam', 0.075, 1.89, 95), ('S06', 'S06_Loam', 'Loam', 0.036, 1.56, 150),
         ('S07', 'S07_SiltLoam', 'Silt loam', 0.020, 1.41, 220), ('S08', 'S08_SandyClayLoam', 'Sandy clay loam', 0.059, 1.48, 160), ('S09', 'S09_ClayLoam', 'Clay loam', 0.019, 1.31, 175), ('S10', 'S10_SiltyClayLoam', 'Silty clay loam', 0.010, 1.23, 195)]
KS = {'S03': 712.8, 'S04': 350.2, 'S05': 106.1, 'S06': 24.96, 'S07': 6.24, 'S08': 31.44, 'S09': 6.24, 'S10': 1.68}
def head(ws, r, vals):
    for j, v in enumerate(vals, 1): c = ws.cell(r, j, v); c.font = B; c.fill = H; c.alignment = Alignment(wrap_text=True, vertical='top')
def note(ws, r, text): ws.cell(r, 1, text).font = Font(italic=True, color='555555')
def build(path, runs_cols, nruns):
    wb = openpyxl.load_workbook(path)
    col = {c: L(i + 1) for i, c in enumerate(runs_cols)}; last = nruns + 1
    R = lambda c: "All_runs_summary!$%s$2:$%s$%d" % (col[c], col[c], last)
    IDX = []
    # ------------------------------------------------------------------ Paper 4: the reach
    ws = wb.create_sheet('EQ_P4_reach')
    ws['A1'] = 'Paper 4. The reach of a suction trigger, Eq. (4): h_c = (1/alpha) * (m^2/kappa)^(1/(2n + l(n-1))). Yellow cells are inputs; green cells are formulas. Change kappa or l and every column follows.'; ws['A1'].font = B
    ws['A2'], ws['B2'] = 'kappa (fitted constant)', 3.4698558e-10; ws['A3'], ws['B3'] = 'l (Mualem connectivity)', 0.5
    for c in ('B2', 'B3'): ws[c].fill = INP
    ws['B2'].number_format = '0.00E+00'
    head(ws, 5, ['id', 'soil', 'alpha (1/cm)', 'n', 'm = 1-1/n', 'exponent 2n+l(n-1)', 'reach h_c (cm), Eq. (4)', 'Se(h_c), Eq. (1)', 'Kr(h_c), Eq. (2) (equals kappa)', 'observed low (cm)', 'observed high (cm)', 'inside the interval?', 'error (decades)', 'trigger 300 cm beyond reach?'])
    for i, (sid, sk, lab, a, n, taw) in enumerate(SOILS):
        r = 6 + i; ws.cell(r, 1, sid); ws.cell(r, 2, lab); ws.cell(r, 3, a).fill = INP; ws.cell(r, 4, n).fill = INP
        ws.cell(r, 5, '=1-1/D%d' % r); ws.cell(r, 6, '=2*D%d+$B$3*(D%d-1)' % (r, r))
        ws.cell(r, 7, '=(1/C%d)*(E%d^2/$B$2)^(1/F%d)' % (r, r, r))
        ws.cell(r, 8, '=(1+(C%d*G%d)^D%d)^(-E%d)' % (r, r, r, r))
        ws.cell(r, 9, '=H%d^$B$3*(1-(1-H%d^(1/E%d))^E%d)^2' % (r, r, r, r))
        ws.cell(r, 10, '=INDEX(R_p4_tableA1_reach!$F$2:$F$11,MATCH(A%d,R_p4_tableA1_reach!$A$2:$A$11,0))' % r)
        ws.cell(r, 11, '=INDEX(R_p4_tableA1_reach!$G$2:$G$11,MATCH(A%d,R_p4_tableA1_reach!$A$2:$A$11,0))' % r)
        ws.cell(r, 12, '=IF(AND(G%d>=J%d,OR(K%d="inf",G%d<=K%d)),"yes","no")' % (r, r, r, r, r))
        ws.cell(r, 13, '=IF(G%d<J%d,LOG10(J%d)-LOG10(G%d),IF(AND(K%d<>"inf",G%d>K%d),LOG10(G%d)-LOG10(K%d),0))' % ((r,) * 9))
        ws.cell(r, 14, '=IF(300>G%d/2,"yes: keep the trigger below "&ROUND(G%d/2,0)&" cm","no")' % (r, r))
        for j in range(5, 15): ws.cell(r, j).fill = OUT
        ws.cell(r, 9).number_format = '0.00E+00'; ws.cell(r, 7).number_format = '0'
    ws.cell(17, 1, 'root-mean-square error (decades)'); ws.cell(17, 13, '=SQRT(SUMSQ(M6:M15)/10)').fill = OUT
    note(ws, 19, 'Observed intervals come from experiment E2 (sheet R_p4_tableA1_reach): the driest trigger that brings at least 5 mm/yr of irrigation, and the next drier one ("inf" = even 10 000 cm fires).')
    IDX += [('Paper 4', 'Eq. (1) retention S_e(h)', 'EQ_P4_reach!H6:H15', '=(1+(alpha*h)^n)^(-m)'), ('Paper 4', 'Eq. (2) relative conductivity K_r', 'EQ_P4_reach!I6:I15', '=Se^l*(1-(1-Se^(1/m))^m)^2'),
            ('Paper 4', 'Eq. (4) reach of a trigger h_c', 'EQ_P4_reach!G6:G15', '=(1/alpha)*(m^2/kappa)^(1/(2n+l(n-1)))')]
    # ------------------------------------------------------------------ Paper 4: the marginal fate, from the runs themselves
    ws = wb.create_sheet('EQ_P4_fate')
    ws['A1'] = 'Paper 4. Marginal fate of irrigation, Eq. (5): eta_X = sum(X - X0) / sum(I), over the irrigated runs (I > 20 mm) of E10, X0 = the rainfed baseline (E0) of the same soil. Every cell reads the run table (sheet All_runs_summary) with SUMIFS.'; ws['A1'].font = B
    ws['A2'], ws['B2'] = 'experiment', 'E10_Amount_Timing_Soil'; ws['A3'], ws['B3'] = 'minimum irrigation (mm)', 20
    for c in ('B2', 'B3'): ws[c].fill = INP
    head(ws, 5, ['id', 'soil key', 'runs', 'sum I (mm)', 'T0', 'Es0', 'ET0', 'D0', 'eta_T transpired', 'eta_Es soil evaporation', 'eta_Eo other evaporation', 'eta_D drained', 'eta_S storage and runoff (= 1 - sum)'])
    crit = lambda r: '%s,$B$2,%s,$B%d,%s,">"&$B$3,%s,"ok"' % (R('experiment'), R('soil'), r, R('irrigation_mm'), R('status'))
    base = lambda c, r: 'SUMIFS(%s,%s,"E0_Baselines",%s,$B%d)' % (R(c), R('experiment'), R('soil'), r)
    for i, (sid, sk, lab, a, n, taw) in enumerate(SOILS):
        r = 6 + i; ws.cell(r, 1, sid); ws.cell(r, 2, sk)
        ws.cell(r, 3, '=COUNTIFS(%s)' % crit(r)); ws.cell(r, 4, '=SUMIFS(%s,%s)' % (R('irrigation_mm'), crit(r)))
        for j, c in zip(range(5, 9), ['transpiration_mm', 'soil_evap_mm', 'ET_mm', 'drainage_1m_mm']): ws.cell(r, j, '=' + base(c, r))
        S = lambda c: 'SUMIFS(%s,%s)' % (R(c), crit(r))
        ws.cell(r, 9, '=IF(C{0}=0,"no irrigated run",({1}-C{0}*E{0})/D{0})'.format(r, S('transpiration_mm')))
        ws.cell(r, 10, '=IF(C{0}=0,"",({1}-C{0}*F{0})/D{0})'.format(r, S('soil_evap_mm')))
        ws.cell(r, 11, '=IF(C{0}=0,"",(({1}-{2}-{3})-C{0}*(G{0}-E{0}-F{0}))/D{0})'.format(r, S('ET_mm'), S('transpiration_mm'), S('soil_evap_mm')))
        ws.cell(r, 12, '=IF(C{0}=0,"",({1}-C{0}*H{0})/D{0})'.format(r, S('drainage_1m_mm')))
        ws.cell(r, 13, '=IF(C{0}=0,"",1-I{0}-J{0}-K{0}-L{0})'.format(r))
        for j in range(3, 14): ws.cell(r, j).fill = OUT
    note(ws, 17, 'Change B2 to E4_Methods or E15_Method_Depth_Amount, or the threshold in B3, to recompute the shares for another experiment. Sand and loamy sand show "no irrigated run": the 300 cm trigger of E10 is beyond their reach.')
    IDX.append(('Paper 4', 'Eq. (5) marginal fate eta_X', 'EQ_P4_fate!I6:M15', '=(SUMIFS(X,...)-COUNTIFS(...)*X0)/SUMIFS(I,...)'))
    # ------------------------------------------------------------------ Paper 4: the dose law
    ws = wb.create_sheet('EQ_P4_dose')
    ws['A1'] = 'Paper 4. Dose law, Eq. (6): eta_D(d) = eta_inf * (1 - EXP(-d/d_D)). Observed drained share per dose from the runs of E10 (all windows), fitted curve from the two parameters of each soil.'; ws['A1'].font = B
    doses = [1, 2, 3, 4, 6, 8, 10, 15, 20, 30]
    head(ws, 3, ['id', 'soil key', 'eta_inf (plateau)', 'd_D (mm)'] + sum([['obs d=%g' % d, 'fit d=%g' % d] for d in doses], []))
    fits = {'S01': (0.109, 4.425), 'S02': (0.445, 3.234), 'S05': (0.102, 5.21), 'S06': (0.197, 3.887), 'S07': (0.194, 4.106), 'S08': (0.19, 3.85), 'S09': (0.204, 4.388), 'S10': (0.183, 3.394)}
    r = 4
    for sid, sk, lab, a, n, taw in SOILS:
        if sid not in fits: continue
        ws.cell(r, 1, sid); ws.cell(r, 2, sk); ws.cell(r, 3, fits[sid][0]).fill = INP; ws.cell(r, 4, fits[sid][1]).fill = INP
        for k, d in enumerate(doses):
            cr = '%s,"E10_Amount_Timing_Soil",%s,$B%d,%s,%g,%s,">20",%s,"ok"' % (R('experiment'), R('soil'), r, R('set_dose_mm_per_event'), d, R('irrigation_mm'), R('status'))
            b0 = 'SUMIFS(%s,%s,"E0_Baselines",%s,$B%d)' % (R('drainage_1m_mm'), R('experiment'), R('soil'), r)
            o = ws.cell(r, 5 + 2 * k, '=IFERROR((SUMIFS(%s,%s)-COUNTIFS(%s)*%s)/SUMIFS(%s,%s),"")' % (R('drainage_1m_mm'), cr, cr, b0, R('irrigation_mm'), cr)); o.fill = OUT
            ws.cell(r, 6 + 2 * k, '=$C%d*(1-EXP(-%g/$D%d))' % (r, d, r)).fill = OUT
        r += 1
    IDX.append(('Paper 4', 'Eq. (6) dose law eta_D(d)', 'EQ_P4_dose!F4:X11', '=eta_inf*(1-EXP(-d/d_D))'))
    # ------------------------------------------------------------------ Paper 1
    ws = wb.create_sheet('EQ_P1')
    ws['A1'] = 'Paper 1. Retention (Eq. 1), the rate-competition law phi_D = Ks/(Ks+q*) (Eq. 7) and the recoverable share rho_R = 1 - psi_D (Eq. 6). phi_D and psi_D come from sheet R_p1_table2 (made by the analysis scripts).'; ws['A1'].font = B
    ws['A2'], ws['B2'] = 'q* (cm/d), fitted', 71.5; ws['B2'].fill = INP
    head(ws, 4, ['id', 'soil', 'alpha', 'n', 'm', 'Se(100 cm), Eq. (1)', 'Ks literature (cm/d)', 'phi_D observed (E9)', 'phi_D = Ks/(Ks+q*)', 'residual', 'psi_D (E16)', 'rho_R = 1 - psi_D', 'psi_D (E7)', 'rho_R (E7)', 'storage release R = ET + D - P - I, mean of E9 (mm/yr)'])
    for i, (sid, sk, lab, a, n, taw) in enumerate(SOILS):
        r = 5 + i; ws.cell(r, 1, sid); ws.cell(r, 2, lab); ws.cell(r, 3, a).fill = INP; ws.cell(r, 4, n).fill = INP
        ws.cell(r, 5, '=1-1/D%d' % r); ws.cell(r, 6, '=(1+(C%d*100)^D%d)^(-E%d)' % (r, r, r))
        if sid in KS: ws.cell(r, 7, KS[sid]).fill = INP
        ws.cell(r, 8, '=INDEX(R_p1_table2!$B$2:$B$11,MATCH(A%d,R_p1_table2!$A$2:$A$11,0))' % r)
        ws.cell(r, 9, '=IF(G%d="","no literature Ks",G%d/(G%d+$B$2))' % (r, r, r)); ws.cell(r, 10, '=IF(ISNUMBER(I%d),I%d-H%d,"")' % (r, r, r))
        ws.cell(r, 11, '=INDEX(R_p1_table2!$F$2:$F$11,MATCH(A%d,R_p1_table2!$A$2:$A$11,0))' % r); ws.cell(r, 12, '=1-K%d' % r)
        ws.cell(r, 13, '=INDEX(R_p1_table2!$J$2:$J$11,MATCH(A%d,R_p1_table2!$A$2:$A$11,0))' % r); ws.cell(r, 14, '=1-M%d' % r)
        cr = '%s,"E9_Soil_Moisture_Rain",%s,"%s",%s,"ok"' % (R('experiment'), R('soil'), sk, R('status'))
        ws.cell(r, 15, '=AVERAGEIFS(%s,%s)+AVERAGEIFS(%s,%s)-AVERAGEIFS(%s,%s)-AVERAGEIFS(%s,%s)' % (R('ET_mm'), cr, R('drainage_1m_mm'), cr, R('rain_mm'), cr, R('irrigation_mm'), cr))
        for j in (5, 6, 8, 9, 10, 11, 12, 13, 14, 15): ws.cell(r, j).fill = OUT
    ws.cell(16, 1, 'RMSE of the law (8 soils)'); ws.cell(16, 10, '=SQRT(SUMSQ(J5:J14)/COUNT(J5:J14))').fill = OUT
    IDX += [('Paper 1', 'Eq. (1) retention at 100 cm', 'EQ_P1!F5:F14', '=(1+(alpha*100)^n)^(-m)'), ('Paper 1', 'Eq. (7) rate-competition law', 'EQ_P1!I5:I14', '=Ks/(Ks+q*)'),
            ('Paper 1', 'Eq. (6) recoverable share', 'EQ_P1!L5:L14, N5:N14', '=1-psi_D'), ('Paper 1', 'Eq. (4) storage release', 'EQ_P1!O5:O14', '=ET+D-P-I')]
    # ------------------------------------------------------------------ Paper 2
    ws = wb.create_sheet('EQ_P2')
    ws['A1'] = 'Paper 2. Trigger law (depletion and its inverse), capillary radius, air water potential, interception store, Kostiakov intake, Hazen-Williams with the Christiansen factor, nozzle discharge. Inputs yellow, formulas green.'; ws['A1'].font = B
    ws['A2'], ws['B2'] = 'critical depletion f*', 0.45; ws['B2'].fill = INP
    head(ws, 4, ['id', 'soil', 'alpha', 'n', 'm', 'Se(100)', 'Se(15 849)', 'Se at f*', 'trigger h* (cm) = inverse of Eq. 6.3', 'depletion at 300 cm', 'share of available water used at 300 cm (%)'])
    for i, (sid, sk, lab, a, n, taw) in enumerate(SOILS):
        r = 5 + i; ws.cell(r, 1, sid); ws.cell(r, 2, lab); ws.cell(r, 3, a).fill = INP; ws.cell(r, 4, n).fill = INP
        ws.cell(r, 5, '=1-1/D%d' % r); ws.cell(r, 6, '=(1+(C%d*100)^D%d)^(-E%d)' % (r, r, r)); ws.cell(r, 7, '=(1+(C%d*15849)^D%d)^(-E%d)' % (r, r, r))
        ws.cell(r, 8, '=F%d-$B$2*(F%d-G%d)' % (r, r, r)); ws.cell(r, 9, '=(1/C%d)*(H%d^(-1/E%d)-1)^(1/D%d)' % (r, r, r, r))
        ws.cell(r, 10, '=(F%d-(1+(C%d*300)^D%d)^(-E%d))/(F%d-G%d)' % (r, r, r, r, r, r)); ws.cell(r, 11, '=100*MAX(0,MIN(1,J%d))' % r)
        for j in range(5, 12): ws.cell(r, j).fill = OUT
    rows = [('capillary radius r_c (cm) at h (cm)', 'h', 300, '=0.149/B{r}'), ('air water potential (MPa) at RH', 'RH', 0.6, '=135.3*LN(B{r})'),
            ('interception store I_c (mm): mean rain mu0 and throughfall fraction r', 'mu0 (mm)', 4.5, '=B{r}*LN(1/0.9)'),
            ('Kostiakov intake Z (m): k=0.006, A=0.4, tau (min)', 'tau', 120, '=0.006*B{r}^0.4'),
            ('Christiansen factor F_c for N outlets', 'N', 50, '=1/2.852+1/(2*B{r})+SQRT(0.852)/(6*B{r}^2)'),
            ('Hazen-Williams loss (m) of a 100 m lateral, Q0 = 0.0005 m3/s, D = 0.016 m, C = 140, with F_c', 'L (m)', 100, '=(1/2.852+1/(2*50)+SQRT(0.852)/(6*50^2))*10.67*B{r}*0.0005^1.852/(140^1.852*0.016^4.871)'),
            ('nozzle discharge (L/min): diameter 4 mm, head h_n (m)', 'h_n', 30, '=0.95*PI()*0.004^2/4*SQRT(2*9.81*B{r})*60000')]
    head(ws, 17, ['equation', 'input', 'value', 'result'])
    for k, (t, i_, v, f) in enumerate(rows):
        r = 18 + k; ws.cell(r, 1, t); ws.cell(r, 2, v).fill = INP; ws.cell(r, 3, i_); ws.cell(r, 4, f.format(r=r)).fill = OUT
    IDX += [('Paper 2', 'Eq. 6.3 trigger suction h* from f*', 'EQ_P2!I5:I14', '=(1/alpha)*(Se*^(-1/m)-1)^(1/n)'), ('Paper 2', 'depletion at a trigger', 'EQ_P2!J5:J14', '=(Se100-Se(h))/(Se100-SeWP)'),
            ('Paper 2', 'capillary radius, Kelvin, interception, Kostiakov, Christiansen, Hazen-Williams, nozzle', 'EQ_P2!D18:D24', 'see sheet')]
    # ------------------------------------------------------------------ Paper 3
    ws = wb.create_sheet('EQ_P3')
    ws['A1'] = 'Paper 3. Spectral indices, the FAO-56 crop coefficient, soil loss, wetness index, run budget and the N2O split. Inputs yellow, formulas green.'; ws['A1'].font = B
    rows = [('reflectance near infrared', 0.28, None), ('reflectance red', 0.11, None), ('reflectance blue', 0.06, None), ('reflectance green', 0.09, None),
            ('NDVI = (N-R)/(N+R)', None, '=(B2-B3)/(B2+B3)'), ('EVI = 2.5(N-R)/(N+6R-7.5B+1)', None, '=2.5*(B2-B3)/(B2+6*B3-7.5*B4+1)'), ('SAVI = 1.5(N-R)/(N+R+0.5)', None, '=1.5*(B2-B3)/(B2+B3+0.5)'),
            ('GNDVI = (N-G)/(N+G)', None, '=(B2-B5)/(B2+B5)'),
            ('day of season t', 70, None), ('Kini', 0.4, None), ('Kmid', 1.15, None), ('Kend', 0.4, None), ('L1 initial (d)', 30, None), ('L2 development (d)', 40, None), ('L3 mid (d)', 50, None), ('L4 late (d)', 30, None),
            ('Kc(t), FAO-56 piecewise linear', None, '=IF(B10<B14,B11,IF(B10<B14+B15,B11+(B12-B11)*(B10-B14)/B15,IF(B10<B14+B15+B16,B12,B12+(B13-B12)*MIN(1,(B10-B14-B15-B16)/B17))))'),
            ('RUSLE R', 450, None), ('K', 0.03, None), ('LS', 0.4, None), ('C', 0.3, None), ('P', 1, None), ('soil loss A = R K LS C P (t/ha/yr)', None, '=B19*B20*B21*B22*B23'),
            ('specific upslope area a (m)', 250, None), ('slope beta (degrees)', 1.9, None), ('wetness index ln(a/tan beta)', None, '=LN(B25/TAN(RADIANS(B26)))'),
            ('levels of factor 1', 4, None), ('levels of factor 2', 10, None), ('levels of factor 3', 5, None), ('run budget set by the user', 60, None), ('runs made = MIN(product, budget)', None, '=MIN(B28*B29*B30,B31)'),
            ('denitrification D (kg N/ha)', 12, None), ('ratio r = N2/N2O', 4, None), ('N2O = D/(1+r)', None, '=B33/(1+B34)'), ('N2 = D/(1+1/r)', None, '=B33/(1+1/B34)')]
    for k, (t, v, f) in enumerate(rows):
        r = 2 + k; ws.cell(r, 1, t)
        if f: c = ws.cell(r, 2, f); c.fill = OUT
        else: c = ws.cell(r, 2, v); c.fill = INP
    IDX += [('Paper 3', 'spectral indices', 'EQ_P3!B6:B9', '=(N-R)/(N+R) ...'), ('Paper 3', 'FAO-56 Kc(t)', 'EQ_P3!B18', 'IF chain'), ('Paper 3', 'RUSLE', 'EQ_P3!B24', '=R*K*LS*C*P'),
            ('Paper 3', 'wetness index', 'EQ_P3!B27', '=LN(a/TAN(beta))'), ('Paper 3', 'run budget', 'EQ_P3!B32', '=MIN(product,budget)'), ('Paper 3', 'N2O split', 'EQ_P3!B35:B36', '=D/(1+r)')]
    # ------------------------------------------------------------------ index
    ws = wb.create_sheet('Equations', 1)
    ws['A1'] = 'The equations of the four papers as live Excel formulas. Yellow cells of each EQ_ sheet are inputs, green cells are formulas; the EQ_P4_fate, EQ_P4_dose and EQ_P1 sheets read the run table directly, so they are connected to the data.'; ws['A1'].font = B
    head(ws, 3, ['Paper', 'Equation', 'Where (sheet and cells)', 'Symbolic form', 'Excel formula of the first cell (as written in the sheet)'])
    for k, row in enumerate(IDX):
        for j, v in enumerate(row, 1): ws.cell(4 + k, j, (' ' + v[1:]) if (j == 4 and isinstance(v, str) and v.startswith('=')) else v)
        try:
            sh, rng = row[2].split('!'); first = rng.split(':')[0]; f = wb[sh][first].value
            ws.cell(4 + k, 5, (' ' + f) if isinstance(f, str) and f.startswith('=') else f)
        except Exception: pass
    for w in wb.worksheets:
        if w.title.startswith('EQ_') or w.title == 'Equations':
            for j in range(1, 30): w.column_dimensions[L(j)].width = 16
            w.column_dimensions['A'].width = 34; w.freeze_panes = None
    wb.save(path)
