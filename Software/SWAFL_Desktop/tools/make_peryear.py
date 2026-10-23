"""Build the year-by-year tables that SWAFL Desktop embeds, from the comprehensive Daisy extraction.

Input : Data/Comprehensive_Summary/Exx_*.csv.gz (every balance date and harvest of every simulation)
Output: app/engine/peryear.js  (window.PERYEAR = {...}), compact JSON with one array per run and variable
        tools/peryear_check.txt  (20-year means recomputed from the yearly values against the run table)

Balance years run from 1 April to 1 April (20 complete years, 1980/81 to 1999/2000). A harvest in year Y is
matched with the balance that closes on 1 April of year Y+1, as in the extraction script of the dataset.
Usage: python3 tools/make_peryear.py <repo root>
"""
import sys, os, json, gzip
import numpy as np, pandas as pd

ROOT = sys.argv[1]
SRC = os.path.join(ROOT, 'Data', 'Comprehensive_Summary')
OUT = os.path.join(ROOT, 'Software', 'SWAFL_Desktop', 'app', 'engine', 'peryear.js')
CHK = os.path.join(ROOT, 'Software', 'SWAFL_Desktop', 'tools', 'peryear_check.txt')

# experiments embedded in the software (all ten soils): baselines, trigger, sensor depth, method, tillage/structure, mulch
EXPS = ['E00_Baselines', 'E02_TriggerPressure', 'E03_SensorDepth', 'E04_Methods', 'E05_SHP_Dynamics', 'E07_Mulching']

S = 'Annual-SWater | '; F = 'Annual-FWater_100cm | '; N = 'Annual-FN_100cm | '; NT = 'Annual-FN | '; HV = 'Annual-Harvest | '
VARS = {   # key: (label, unit, function of the balance row)
    'P':    lambda r: r[S + 'rain [mm]'] + r[S + 'snow [mm]'],
    'I':    lambda r: r['Annual-FWater | Irrigation [mm]'],                    # all methods, incl. drip below the surface
    'ET0':  lambda r: r[S + 'Reference evapotranspiration (dry) [mm]'],
    'PET':  lambda r: r[S + 'Potential evapotranspiration [mm]'],
    'ET':   lambda r: r[S + 'Actual Evapotranspiration [mm]'],
    'PT':   lambda r: r[S + 'Potential transpiration [mm]'],
    'T':    lambda r: r[S + 'Actual transpiration [mm]'],
    'Ec':   lambda r: r[S + 'Evaporation from canopy [mm]'],
    'El':   lambda r: r[S + 'Evaporation from litter [mm]'],
    'Ep':   lambda r: r[S + 'Evaporation from ponded water [mm]'],
    'Esn':  lambda r: r[S + 'Evaporation from snow [mm]'],
    'Es':   lambda r: r[S + 'Evaporation of soil water [mm]'],
    'RO':   lambda r: r[S + 'Surface runoff [mm]'],
    'Imat': lambda r: r[S + 'Matrix infiltration [mm]'],
    'Imac': lambda r: r[S + 'Macropore infiltration [mm]'],
    'D':    lambda r: r[F + 'Matrix percolation [mm]'] + r[F + 'Biopore percolation [mm]'],
    'Dbio': lambda r: r[F + 'Biopore percolation [mm]'],
    'NL':   lambda r: r[N + 'Matrix-Leaching [kg N/ha]'] + r[N + 'Biopore-Leaching [kg N/ha]'],
    'Nmin': lambda r: r[NT + 'Mineralization [kg N/ha]'],
    'Nup':  lambda r: r[NT + 'Crop-Uptake [kg N/ha]'],
    'Nden': lambda r: r[NT + 'NO3-Denitrification [kg N/ha]'] + r[NT + 'N2O-Denitrification [kg N/ha]'],
    'Nvol': lambda r: r[NT + 'Volatilization [kg N/ha]'],
    'Nfert':lambda r: r[NT + 'Min-Surface-Fertilizer [kg N/ha]'] + r[NT + 'Min-Soil-Fertilizer [kg N/ha]'] + r[NT + 'Org-Fertilizer [kg N/ha]'],
}
HARV = {'Y': HV + 'sorg_DM [Mg DM/ha]', 'stem': HV + 'stem_DM [Mg DM/ha]', 'leaf': HV + 'leaf_DM [Mg DM/ha]', 'HI': HV + 'HI',
        'WS': HV + 'WStress [d]', 'NS': HV + 'NStress [d]', 'WP': HV + 'WP_ET [kg/m^3]'}
DEC = {'Y': 3, 'stem': 2, 'leaf': 2, 'HI': 3, 'WS': 1, 'NS': 1, 'WP': 2}

def per_run(g):
    g = g.sort_values('date')
    bal = g[g['files_with_values_on_this_date'].fillna('').str.contains('Annual-SWater')]
    bal = bal[(bal['month'] == 4) & (bal['year'] >= 1981)].iloc[:20]   # balances closing on 1 April 1981 ... 2000 (1980-04-01 closes a 3-month start-up period)
    hv = g[g['files_with_values_on_this_date'].fillna('') == 'Annual-Harvest'].iloc[:20]
    if len(bal) != 20 or len(hv) != 20: return None
    INT = {'P', 'I', 'ET0', 'PET', 'ET', 'PT', 'T', 'Imat', 'Imac'}            # large fluxes to whole mm, the rest to 0.1
    rec = {k: [(int(round(float(f(r)))) if k in INT else round(float(f(r)), 1)) for _, r in bal.iterrows()] for k, f in VARS.items()}
    for k, c in HARV.items(): rec[k] = [round(float(v), DEC[k]) if pd.notna(v) else None for v in hv[c]]
    rec['crop'] = [str(v) for v in hv[HV + 'crop']]
    return rec

summ = pd.read_csv(os.path.join(SRC, '00_summary_all_simulations.csv.gz'), low_memory=False).set_index('run_id')
out = {'years': [f'{y}/{(y + 1) % 100:02d}' for y in range(1980, 2000)], 'runs': {}}
lines = []
for e in EXPS:
    d = pd.read_csv(os.path.join(SRC, e + '.csv.gz'), low_memory=False)
    d = d[d.status == 'ok']
    n = 0; worst = {}
    for rid, g in d.groupby('run_id', sort=False):
        rec = per_run(g)
        if rec is None: continue
        s = summ.loc[rid]
        if str(s.status) != 'ok': continue
        # check the yearly values against the 20-year means of the run table
        for k, col in [('P', 'rain_mm'), ('I', 'irrigation_mm'), ('ET', 'ET_mm'), ('T', 'transpiration_mm'), ('Es', 'soil_evap_mm'),
                       ('Ec', 'canopy_evap_mm'), ('D', 'drainage_1m_mm'), ('NL', 'N_leached_kg_ha'), ('Y', 'yield_Mg_ha')]:
            m = np.mean([v for v in rec[k] if v is not None]); ref = float(s[col])
            worst[k] = max(worst.get(k, 0), abs(m - ref) / max(1.0, abs(ref)))
        rec['soil'] = s.soil; rec['tr'] = s.treatment; rec['exp'] = 'E' + str(int(e[1:3]))
        out['runs'][rid] = rec; n += 1
    lines.append(f'{e:28s} runs {n:4d}   largest relative difference of 20-year means: ' + ', '.join(f'{k} {v:.1e}' for k, v in worst.items()))
    print(lines[-1], flush=True)
js = 'window.PERYEAR=' + json.dumps(out, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
open(CHK, 'w').write('\n'.join(lines) + '\n')
print('wrote', OUT, round(len(js) / 1e6, 2), 'MB')
