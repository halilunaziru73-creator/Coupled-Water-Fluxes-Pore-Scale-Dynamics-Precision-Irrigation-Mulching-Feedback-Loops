"""Re-derive every table in Results/07_Derived_Data_Tables from the raw Daisy run table, step by step,
and check each re-derived value against the archived CSV.

Usage (from the repository root):
    python3 Results/07_Derived_Data_Tables/derive_tables.py            # derive and compare
    python3 Results/07_Derived_Data_Tables/derive_tables.py --write    # also write *_rederived.csv next to the originals

Input  : Data/daisy_ensemble.csv.gz  (10 190 Daisy runs, one row per run, 32 columns; see README.md here)
Output : a comparison report (and, with --write, the re-derived tables)
Needs  : Python >= 3.10, numpy, pandas, scipy

Every step mirrors the original figure scripts in Results/08_Scripts (file and line given in each block),
but reads the archived run table instead of the original summary_all.csv. The only inputs that are not in the
run table are the effective van Genuchten pairs (alpha, n) of the ten soils (Paper 3, Table 7) and the
rank order of the plant-available water of each soil (TAW), both listed below.
"""
import os, sys
import numpy as np, pandas as pd
from scipy.optimize import brentq, curve_fit
from scipy.stats import spearmanr

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW = os.path.join(ROOT, "Data", "daisy_ensemble.csv.gz")
SOILS = ["S01_CoarseLoam", "S02_CoarseSand", "S03_Sand", "S04_LoamySand", "S05_SandyLoam",
         "S06_Loam", "S07_SiltLoam", "S08_SandyClayLoam", "S09_ClayLoam", "S10_SiltyClayLoam"]
# effective van Genuchten (alpha [1/cm], n [-]) used by SWAFL Desktop (Paper 3, Table 7)
VG = {"S01_CoarseLoam": (0.0961264, 1.35323), "S02_CoarseSand": (0.0535783, 1.59999), "S03_Sand": (0.145, 2.68),
      "S04_LoamySand": (0.124, 2.28), "S05_SandyLoam": (0.075, 1.89), "S06_Loam": (0.036, 1.56),
      "S07_SiltLoam": (0.02, 1.41), "S08_SandyClayLoam": (0.059, 1.48), "S09_ClayLoam": (0.019, 1.31),
      "S10_SiltyClayLoam": (0.01, 1.23)}
# rank (1 = smallest) of the plant-available water of the 0-100 cm profile, theta(100 cm) - theta(15 849 cm) summed over the
# Daisy Ap (0-25 cm) and Bt (25-100 cm) horizons, as computed by taw_mm() in the original key_figure.py. Spearman's rho
# uses only this rank order. (It differs from the rounded TAW of the project documentation in Paper 1, Table 3, which
# places coarse sand below coarse loam; the horizon-integrated values order S08 and S02 below S06 and S01.)
TAW = {"S03_Sand": 1, "S04_LoamySand": 2, "S05_SandyLoam": 3, "S08_SandyClayLoam": 4, "S02_CoarseSand": 5,
       "S06_Loam": 6, "S01_CoarseLoam": 7, "S09_ClayLoam": 8, "S10_SiltyClayLoam": 9, "S07_SiltLoam": 10}


# ------------------------------------------------------------------ step 0: raw table -> analysis table
def load():
    d = pd.read_csv(RAW)
    d["failed"] = d.valid != 1                                  # 149 numerical (solver) failures, excluded everywhere
    t = d.treatment.fillna("")
    d["water"] = t.str.extract(r"_(Irrigated|Rainfed)$")[0]     # E5: irrigated or rainfed partner
    d["e6strat"] = t.str.extract(r"^N\d+_([A-Za-z0-9]+)$")[0]   # E6: N/water pathway (baseline rows -> NaN)
    small = d.irrigation_mm < 20                                # IE is not interpreted below 20 mm/yr of irrigation
    d.loc[small, "IE_kg_m3"] = np.nan
    return d

def ok(d, e=None):
    x = d[~d.failed]
    return x[x.exp == e] if e else x

def slope(x, y):
    x, y = np.asarray(x, float), np.asarray(y, float); m = np.isfinite(x) & np.isfinite(y)
    return np.polyfit(x[m], y[m], 1)[0]


# ------------------------------------------------------------------ 1. effect_sizes.csv (08_Scripts/charts_AB.py, l. 9-27)
def effect_sizes(d):
    e11, e14, e12, e13, e1, e10 = (ok(d, e) for e in ["E11", "E14", "E12", "E13", "E1", "E10"])
    b = e11[(e11.P == 1.0) & (e11.Ep == 0.6)]                  # E11 at unscaled rain, soil-evaporation factor 0.6
    r0 = e11[(e11.dT == 0) & (e11.Ep == 0.6)]
    p1 = e11[(e11.dT == 0) & (e11.P == 1)]
    m14 = e14[e14.P == 1]
    e12b = e12[(e12.z == 20) & (e12.P == 1)]
    e110 = pd.concat([e1, e10]); e110 = e110[e110.soil == SOILS[0]]
    e13b = e13[e13.Nrate == 100]
    e1s = e1[e1.soil == SOILS[0]]
    return pd.Series({
        "T_irr": slope(b.dT, b.irrigation_mm),                       # mm/yr irrigation per +1 degC (E11)
        "T_ET": slope(b.dT, b.ET_mm),                                # mm/yr ET per +1 degC (E11)
        "P_irr": slope(r0.P * 100, r0.irrigation_mm),                # mm/yr irrigation per +1 % rain (E11)
        "Ep_Esoil": slope(p1.Ep, p1.soil_evap_mm) / 10,              # mm/yr soil evaporation per +0.1 evaporation factor (E11)
        "vff_Esoil": slope(m14.vff, m14.soil_evap_mm) / 10,          # mm/yr soil evaporation per +0.1 vapour-flux factor (E14)
        "Esoil_irr": slope(m14.soil_evap_mm, m14.irrigation_mm),     # mm irrigation per mm soil evaporation (E14)
        "trig_irr": slope(e12b.trig / -100, e12b.irrigation_mm),     # mm/yr irrigation per 100 cm drier trigger (E12)
        "irr_D": slope(e110.irrigation_mm, e110.drainage_1m_mm),     # mm drainage per mm irrigation (E1+E10, coarse loam)
        "D_NL": slope(e13b.drainage_1m_mm, e13b.N_leached_kg_ha),    # kg N/ha per mm drainage (E13, N 100 %)
        "irr_Y": slope(e1s.irrigation_mm, e1s.yield_Mg_ha) * 100,    # Mg/ha per 100 mm irrigation (E1, coarse loam)
    })


# ------------------------------------------------------------------ 2. elasticities.csv (08_Scripts/charts_EFGH.py, l. 135-149)
def elasticities(d):
    def elast(z, xk, yk, logx=True):
        g = z.groupby(xk)[yk].mean().dropna(); g = g[g > 0]       # mean of the output at each factor level
        if len(g) < 3: return np.nan
        x = np.log(np.abs(g.index.values.astype(float))) if logx else g.index.values.astype(float)
        return np.polyfit(x, np.log(g.values), 1)[0]               # slope of ln(output) on ln(driver) (or on driver)
    e13 = ok(d, "E13"); e13 = e13[e13.wstrat == "W04_Surf300"]
    drivers = [("Rain (E11)", ok(d, "E11"), "P", True), ("Temperature °C (E11, semi-el.)", ok(d, "E11"), "dT", False),
               ("Soil evap. factor (E11)", ok(d, "E11"), "Ep", True), ("Trigger suction (E12)", ok(d, "E12"), "trig", True),
               ("Sensor depth (E12)", ok(d, "E12"), "z", True), ("Mulch vapour factor (E14)", ok(d, "E14"), "vff", True),
               ("Interception cap. (E14)", ok(d, "E14"), "cap", True), ("Amount/event (E10)", ok(d, "E10"), "amt_mm", True),
               ("Rooting depth (E15)", ok(d, "E15"), "root", True), ("N rate (E13)", e13, "Nrate", True)]
    outs = [("irrigation_mm", "Irrigation"), ("drainage_1m_mm", "Drainage"), ("soil_evap_mm", "Soil evap."),
            ("transpiration_mm", "Transpiration"), ("yield_Mg_ha", "Yield"), ("N_leached_kg_ha", "N leaching")]
    return pd.DataFrame([[elast(z, xk, yk, lg) for yk, _ in outs] for _, z, xk, lg in drivers],
                        index=[n for n, *_ in drivers], columns=[o for _, o in outs])


# ------------------------------------------------------------------ 3. pareto_runs.csv (08_Scripts/charts_EFGH.py, l. 272-277)
def pareto(d):
    a = ok(d); a = a[a.irrigation_mm >= 20].dropna(subset=["IE_kg_m3", "DPF", "NLF"])
    P = a[["IE_kg_m3", "DPF", "NLF"]].values; keep = np.ones(len(P), bool)
    for i in range(len(P)):                                         # a run is kept if no other run has IE >=, DPF <= and NLF <=
        if keep[i]:                                                 # with at least one strict inequality
            dom = (P[:, 0] >= P[i, 0]) & (P[:, 1] <= P[i, 1]) & (P[:, 2] <= P[i, 2]) & \
                  ((P[:, 0] > P[i, 0]) | (P[:, 1] < P[i, 1]) | (P[:, 2] < P[i, 2]))
            if dom.any(): keep[i] = False
    return a[keep]


# ------------------------------------------------------------------ 4. production_function_fits.csv (08_Scripts/charts_CD.py, l. 252-268)
def production_fits(d):
    irr = pd.concat([ok(d, e) for e in ["E1", "E2", "E3", "E4", "E10"]]); irr = irr[irr.irrigation_mm > 0]
    y0s = ok(d, "E0").set_index("soil").yield_Mg_ha               # rainfed yield of each soil (E0) anchors the curve
    rows = []
    for s in SOILS:
        z = irr[irr.soil == s]; y0 = y0s[s]
        f = lambda I, a, b: y0 + a * (1 - np.exp(-I / b))          # Y = y0 + a (1 - exp(-I/b))
        try:
            (a, b), _ = curve_fit(f, z.irrigation_mm, z.yield_Mg_ha, p0=[4, 100], maxfev=20000)
            rows.append((s, y0, a, b))
        except RuntimeError:
            pass
    return pd.DataFrame(rows, columns=["soil", "y0", "a_gain", "b_mm"])


# ------------------------------------------------------------------ 5. controllability_by_soil_lever_outcome.csv (08_Scripts/leverage_calc.py)
LEV = [("E1", "Dose"), ("E2", "Trigger"), ("E3", "Sensor depth"), ("E4", "Method"), ("E5", "Soil structure"),
       ("E6", "N/water pathway"), ("E7", "Mulch")]
OUTS = [("yield_Mg_ha", "Yield"), ("IE_kg_m3", "IE"), ("DPF", "Drainage fraction"), ("NLF", "N-leaching fraction")]

def controllability(d):
    rows = []
    for e, lev in LEV:
        z = ok(d, e)
        if e == "E5": z = z[z.water == "Irrigated"]                 # structure lever: irrigated partners only
        if e == "E6": z = z[z.e6strat.notna()]                      # pathway lever: the 20 N x water strategies
        for s in SOILS:
            q = z[z.soil == s]
            for o, ol in OUTS:
                v = q[o].dropna()
                rng = np.nan if (len(v) < 4 or v.median() == 0) else (v.quantile(0.9) - v.quantile(0.1)) / abs(v.median()) * 100
                rows.append(dict(lever=lev, exp=e, soil=s, out=ol, lev_pct=rng, n=len(v)))
    return pd.DataFrame(rows)


# ------------------------------------------------------------------ 6. controllability_rho_vs_TAW.csv (08_Scripts/key_figure.py, l. 53-82)
def rho_vs_taw(L):
    levs = ["Trigger", "Dose", "Sensor depth", "Method", "Mulch", "N/water pathway", "Soil structure"]
    outs = ["Yield", "IE", "Drainage fraction", "N-leaching fraction"]
    P = L.pivot_table(index="soil", columns=["out", "lever"], values="lev_pct").reindex(SOILS)
    taw = pd.Series(TAW).reindex(SOILS)
    R = pd.DataFrame(index=outs, columns=levs, dtype=float)
    for o in outs:
        for lv in levs:
            R.loc[o, lv] = spearmanr(taw, P[o][lv], nan_policy="omit")[0]
    return R


# ------------------------------------------------------------------ 7. N1_soil_specific_triggers.csv (08_Scripts/novel.py, l. 5-60)
def n1_triggers():
    Se = lambda h, a, n: (1 + (a * abs(h)) ** n) ** -(1 - 1 / n)                       # van Genuchten effective saturation
    f = lambda s, h: (Se(100, *VG[s]) - Se(h, *VG[s])) / (Se(100, *VG[s]) - Se(15849, *VG[s]))   # depletion of plant-available water
    fstar = 0.45                                                                        # critical depletion (5 % yield loss, E2)
    rows = [(s, -brentq(lambda h: f(s, h) - fstar, 5, 1.5e4), f(s, 300)) for s in SOILS]
    return pd.DataFrame(rows, columns=["soil", "h_star", "f_at_300"])


# ------------------------------------------------------------------ comparison
def compare(name, new, old, key=None, tol=1e-6):
    if key is not None:
        new = new.set_index(key); old = old.set_index(key)
    old = old.reindex(index=new.index, columns=new.columns)
    a, b = new.to_numpy(float), old.to_numpy(float)
    both = np.isfinite(a) & np.isfinite(b)
    rel = np.abs(a - b)[both] / np.maximum(np.abs(b[both]), 1e-12)
    worst = rel.max() if rel.size else 0.0
    nan_mismatch = int((np.isfinite(a) != np.isfinite(b)).sum())
    status = "ok" if worst <= tol and nan_mismatch == 0 else "DIFFERS"
    print(f"{status:8s}{name:45s} cells {both.sum():5d}  max rel. diff {worst:.2e}  NaN mismatches {nan_mismatch}")
    return status == "ok"


if __name__ == "__main__":
    d = load(); W = "--write" in sys.argv
    old = lambda f, **k: pd.read_csv(os.path.join(HERE, f), **k)
    res = []
    es = effect_sizes(d)
    res.append(compare("effect_sizes.csv", es.to_frame("0"), old("effect_sizes.csv", index_col=0)))
    el = elasticities(d)
    res.append(compare("elasticities.csv", el, old("elasticities.csv", index_col=0)))
    pr = pareto(d); po = old("pareto_runs.csv")
    same = set(pr.run_id) == set(po.run_id)
    print(f"{'ok' if same else 'DIFFERS':8s}{'pareto_runs.csv (set of run_id)':45s} runs {len(pr)} re-derived, {len(po)} archived")
    res.append(same)
    res.append(compare("pareto_runs.csv (IE, DPF, NLF of each run)", pr[["run_id", "IE_kg_m3", "DPF", "NLF"]],
                       po[["run_id", "IE_kg_m3", "DPF", "NLF"]], key="run_id", tol=1e-3))
    pf = production_fits(d)
    res.append(compare("production_function_fits.csv", pf, old("production_function_fits.csv"), key="soil", tol=1e-4))
    L = controllability(d)
    res.append(compare("controllability_by_soil_lever_outcome.csv", L, old("controllability_by_soil_lever_outcome.csv"),
                       key=["lever", "exp", "soil", "out"]))
    R = rho_vs_taw(L)
    res.append(compare("controllability_rho_vs_TAW.csv", R, old("controllability_rho_vs_TAW.csv", index_col=0)))
    n1 = n1_triggers()
    res.append(compare("N1_soil_specific_triggers.csv", n1, old("N1_soil_specific_triggers.csv"), key="soil", tol=1e-4))
    if W:
        es.to_frame("0").to_csv(os.path.join(HERE, "effect_sizes_rederived.csv"))
        el.to_csv(os.path.join(HERE, "elasticities_rederived.csv"))
        pr.to_csv(os.path.join(HERE, "pareto_runs_rederived.csv"), index=False)
        pf.to_csv(os.path.join(HERE, "production_function_fits_rederived.csv"), index=False)
        L.to_csv(os.path.join(HERE, "controllability_by_soil_lever_outcome_rederived.csv"), index=False)
        R.to_csv(os.path.join(HERE, "controllability_rho_vs_TAW_rederived.csv"))
        n1.to_csv(os.path.join(HERE, "N1_soil_specific_triggers_rederived.csv"), index=False)
    print(f"{sum(res)} of {len(res)} checks agree with the archived tables")
    sys.exit(0 if all(res) else 1)
