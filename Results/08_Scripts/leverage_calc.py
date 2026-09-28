from common import *
d = load_summary()
LEV = [("E1", "Dose"), ("E2", "Trigger"), ("E3", "Sensor depth"), ("E4", "Method"), ("E5", "Soil structure"), ("E6", "N/water pathway"), ("E7", "Mulch")]
OUTS = [("yield_Mg_ha", "Yield"), ("IE_kg_m3", "IE"), ("DPF", "Drainage fraction"), ("NLF", "N-leaching fraction")]
rows = []
for e, lev in LEV:
    z = ok(d, e)
    if e == "E5": z = z[z.water == "Irrigated"]
    if e == "E6": z = z[z.e6strat.notna()]
    for s in SOILS:
        q = z[z.soil == s]
        for o, ol in OUTS:
            v = q[o].dropna()
            if len(v) < 4 or v.median() == 0: rng = np.nan
            else: rng = (v.quantile(0.9) - v.quantile(0.1)) / abs(v.median()) * 100
            rows.append(dict(lever=lev, exp=e, soil=s, out=ol, lev_pct=rng, n=len(v)))
L = pd.DataFrame(rows); L.to_csv("leverage.csv", index=False)
props = pd.DataFrame({s: dict(n_Bt=G.SOILS[s]["Bt"]["n"], logKs=np.log10(G.SOILS[s]["Ap"]["ks"]), TAW=taw_mm(s), inv_a=1 / G.SOILS[s]["Ap"]["a"]) for s in SOILS}).T
print(props.round(2))
P = L.pivot_table(index="soil", columns=["out", "lever"], values="lev_pct").reindex(SOILS)
pd.set_option("display.width", 250); pd.set_option("display.max_columns", 40)
for o in ["Yield", "IE", "Drainage fraction", "N-leaching fraction"]: print(o); print(P[o].round(0))
from scipy.stats import spearmanr
print("rho vs TAW:")
for o in ["Yield", "IE", "Drainage fraction", "N-leaching fraction"]:
    print(o, {lv: round(spearmanr(props.TAW, P[o][lv], nan_policy="omit")[0], 2) for lv in P[o].columns})
