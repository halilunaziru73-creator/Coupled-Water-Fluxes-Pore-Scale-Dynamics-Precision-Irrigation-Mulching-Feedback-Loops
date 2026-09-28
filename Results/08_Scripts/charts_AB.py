from common import *
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.colors as mcolors

d = load_summary()
FA, FB = "01_Charts_50/A_System_Forcing_Baseline", "01_Charts_50/B_PoreScale_Structure"

# ---------------------------------------------------------------- effect sizes for the loop diagram
def slope(x, y):
    x, y = np.asarray(x, float), np.asarray(y, float); m = np.isfinite(x) & np.isfinite(y)
    return np.polyfit(x[m], y[m], 1)[0]
e11 = ok(d, "E11"); e14 = ok(d, "E14"); e12 = ok(d, "E12"); e13 = ok(d, "E13"); e1 = ok(d, "E1"); e10 = ok(d, "E10")
b = e11[(e11.P == 1.0) & (e11.Ep == 0.6)]
eff = {
 "T_irr": slope(b.dT, b.irrigation_mm),                                         # mm/yr per degC
 "T_ET": slope(b.dT, b.ET),
 "P_irr": slope(e11[(e11.dT == 0) & (e11.Ep == 0.6)].P * 100, e11[(e11.dT == 0) & (e11.Ep == 0.6)].irrigation_mm),  # per +1 % rain
 "Ep_Esoil": slope(e11[(e11.dT == 0) & (e11.P == 1)].Ep, e11[(e11.dT == 0) & (e11.P == 1)].soil_evap_mm) / 10,  # per +0.1 Ep
 "vff_Esoil": slope(e14[e14.P == 1].vff, e14[e14.P == 1].soil_evap_mm) / 10,     # per +0.1 vff
 "Esoil_irr": slope(e14[e14.P == 1].soil_evap_mm, e14[e14.P == 1].irrigation_mm),
 "trig_irr": slope(e12[(e12.z == 20) & (e12.P == 1)].trig / -100, e12[(e12.z == 20) & (e12.P == 1)].irrigation_mm),
 "irr_D": slope(pd.concat([e1, e10])[lambda x: x.soil == SOILS[0]].irrigation_mm,
                pd.concat([e1, e10])[lambda x: x.soil == SOILS[0]].drainage_1m_mm),
 "D_NL": slope(e13[e13.Nrate == 100].drainage_1m_mm, e13[e13.Nrate == 100].N_leached_kg_ha),
 "irr_Y": slope(e1[e1.soil == SOILS[0]].irrigation_mm, e1[e1.soil == SOILS[0]].yield_Mg_ha) * 100,
}
pd.Series(eff).to_csv(os.path.join(OUT, "_effect_sizes.csv"))

# 1 ---- causal loop diagram with data-derived effect sizes
fig, ax = plt.subplots(figsize=(14, 9)); ax.set_xlim(-0.3, 13.3); ax.set_ylim(-0.4, 8.6); ax.axis("off")
N = {"atm": (1.8, 7.3, "Atmospheric demand\n(temperature, ET₀)"), "rain": (6.5, 7.3, "Rainfall\n(amount, intensity)"),
     "irr": (11.2, 7.3, "Irrigation\n(trigger, dose, method)"), "theta": (6.5, 4.3, "Soil water θ, h\n(0–100 cm)"),
     "esoil": (1.8, 4.3, "Soil evaporation"), "mulch": (1.8, 1.3, "Mulch\n(vapour flux, interception)"),
     "tr": (11.2, 4.3, "Transpiration → yield"), "pores": (6.5, 1.3, "Pore structure\n(n, α, K(Se), tillage)"),
     "drain": (11.2, 2.0, "Drainage below 1 m"), "N": (11.2, 0.2, "Nitrate leaching")}
for k, (x, y, t) in N.items():
    ax.add_patch(FancyBboxPatch((x - 1.3, y - 0.45), 2.6, 0.9, boxstyle="round,pad=0.05,rounding_size=0.18",
                 fc={"theta": "#DCEBF7", "pores": "#EFE3D3", "mulch": "#E8F3E1"}.get(k, "white"), ec=NAVY, lw=1.6, zorder=3))
    ax.text(x, y, t, ha="center", va="center", fontsize=10.2, color=NAVY, weight="bold", zorder=4)
def arrow(a, b_, lab, sign, lxy, rad=0.0, ha="center"):
    (x1, y1, _), (x2, y2, _) = N[a], N[b_]; c = GREEN if sign == "+" else RED
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), connectionstyle=f"arc3,rad={rad}", arrowstyle="-|>",
                 mutation_scale=18, lw=2.2, color=c, shrinkA=34, shrinkB=34, zorder=2))
    ax.text(*lxy, f"{sign} {lab}", fontsize=8.8, ha=ha, va="center", color=c, zorder=5,
            bbox=dict(fc="white", ec=c, lw=0.6, alpha=0.95, boxstyle="round,pad=0.25"))
arrow("atm", "esoil", f"{eff['T_ET']:.0f} mm ET per °C", "+", (1.95, 5.8), ha="left")
arrow("atm", "irr", f"{eff['T_irr']:.0f} mm irrigation per °C", "+", (6.5, 8.35), rad=-0.13)
arrow("rain", "theta", "infiltration", "+", (6.35, 5.95), ha="right")
arrow("rain", "irr", f"{abs(eff['P_irr']):.1f} mm less per +1 % rain", "−", (8.85, 6.85))
arrow("irr", "theta", "wets root zone", "+", (9.55, 5.35), rad=-0.12)
arrow("theta", "irr", f"sensor feedback: {abs(eff['trig_irr']):.0f} mm less\nper 100 cm drier trigger", "−", (8.0, 6.1), rad=-0.12)
arrow("theta", "esoil", "wet surface", "+", (4.15, 4.62))
arrow("esoil", "theta", "dries topsoil", "−", (4.15, 3.45), rad=0.25)
arrow("mulch", "esoil", f"{eff['vff_Esoil']:.1f} mm per +0.1 vapour factor", "+", (1.95, 2.8), ha="left")
arrow("theta", "tr", "water supply", "+", (8.85, 4.62))
arrow("theta", "drain", "excess water", "+", (8.55, 3.05))
arrow("irr", "drain", f"{eff['irr_D']:.2f} mm per mm irrigated", "+", (12.75, 4.6), rad=-0.35)
arrow("pores", "theta", "retention (n, α)", "+", (6.65, 2.8), ha="left")
arrow("pores", "drain", "conductivity K", "+", (8.85, 1.35))
arrow("drain", "N", f"{eff['D_NL']:.2f} kg N per mm", "+", (12.6, 1.1))
ax.text(4.15, 5.35, "B1 balancing loop:\nevaporation ↔ soil water", fontsize=9, color="#555", ha="center", style="italic")
ax.text(10.1, 6.05, "B2", fontsize=10, color="#555", ha="center", style="italic", weight="bold")
ax.set_title("Soil–atmosphere feedback loops, quantified from the 10,190 Daisy runs", loc="left", fontsize=14)
ax.text(-0.2, -0.35, "Labels: linear effect sizes (regression slopes) from E11 temperature/rain/EpFactor, E14 mulch, E12 trigger, "
        "E1+E10 irrigation→drainage, E13 drainage→N (coarse loam unless stated). Green = positive link, red = negative.", fontsize=8.5, color="#555")
save(fig, FA, "01_Feedback_loop_diagram", "Feedback loops with data-derived effect sizes",
     "Causal-loop diagram; arrow labels are regression slopes from E11, E14, E12, E1/E10 and E13.", "E1,E10-E14")

# 2 ---- experiment design matrix
factors = ["soil", "P", "dT", "Ep", "trig", "z", "dose_mm", "dur_h", "amt_mm", "window", "method", "vff", "cap",
           "Nrate", "wstrat", "e6strat", "till", "tc", "water", "intensity", "root", "case"]
flab = ["Soil", "Rain scale", "Temperature", "Soil evap. factor", "Trigger / initial h", "Sensor depth", "Dose",
        "Duration", "Amount/event", "Timing window", "Method", "Mulch vapour factor", "Interception", "N rate",
        "Water strategy", "E6 strategy", "Tillage", "Consolidation", "Water regime", "Rain intensity", "Rooting depth", "Edge case"]
exps = sorted(d.exp.unique(), key=lambda e: int(e[1:]))
M = np.array([[d[d.exp == e][f].nunique() if f in d else 0 for f in factors] for e in exps], float)
M[M <= 1] = np.nan
fig, (a1, a2) = plt.subplots(1, 2, figsize=(15, 7), gridspec_kw={"width_ratios": [4.2, 1]})
im = a1.imshow(M, cmap="Blues", aspect="auto", vmin=0, vmax=20)
for i in range(len(exps)):
    for j in range(len(factors)):
        if np.isfinite(M[i, j]): a1.text(j, i, int(M[i, j]), ha="center", va="center", fontsize=8.5,
                                        color="white" if M[i, j] > 11 else NAVY)
a1.set_xticks(range(len(factors))); a1.set_xticklabels(flab, rotation=90); a1.set_yticks(range(len(exps)))
a1.set_yticklabels([f"{e}  {d[d.exp == e].experiment.iloc[0].split('_', 1)[1].replace('_', ' ')}" for e in exps])
a1.grid(False); a1.set_title("Factors varied (number of levels) in each experiment", loc="left")
cnt = d.groupby("exp").size().reindex(exps); fail = d.groupby("exp").failed.sum().reindex(exps)
a2.barh(range(len(exps)), cnt, color=SKY); a2.barh(range(len(exps)), fail, color=RED, label="solver failures")
for i, (c, f_) in enumerate(zip(cnt, fail)): a2.text(c + 20, i, f"{c}" + (f" ({int(f_)} ✗)" if f_ else ""), va="center", fontsize=8.5)
a2.invert_yaxis(); a2.set_yticks([]); a2.set_xlabel("simulations"); a2.set_title(f"Runs: {len(d):,}", loc="left"); a2.legend(loc="lower right")
a2.set_xlim(0, 1350)
save(fig, FA, "02_Experiment_design_matrix", "Experiment design matrix",
     "Number of levels of each factor per experiment (from the run names) and the number of simulations; red = runs excluded for solver failure.", "All")

# 3 ---- climate forcing
def weather(path):
    L = open(path, encoding="latin-1").read().replace("\r", "").split("\n")
    i = [k for k, l in enumerate(L) if l.startswith("-----")][0]
    return pd.read_csv(io.StringIO("\n".join([L[i + 1]] + [l for l in L[i + 3:] if l.strip()])), sep=r"\s+", on_bad_lines="skip").apply(pd.to_numeric, errors="coerce").dropna(subset=["Year"])
tw = weather("/home/claude/v2/Common/weather/Daily-1965-2000.dwf"); tw = tw[(tw.Year >= 1980) & (tw.Year <= 1999)]
tw["AirTemp"] = (tw.T_min + tw.T_max) / 2; ta = tw.groupby("Year").agg(P=("Precip", "sum"), T=("AirTemp", "mean"))
ta["P"] *= 0.7; ta["T"] += 2.0
sw = dlf("E0_S01_CoarseLoam_Rainfed", "Daily-SWater.dlf"); sw["y"] = sw.date.dt.year
et0 = sw.groupby("y")["Reference evapotranspiration (dry)"].sum()
bw = weather("/home/claude/v2/Common/weather/it-bologna.dwf"); ba = bw[(bw.Year >= 1995) & (bw.Year <= 2004)].groupby("Year").agg(P=("Precip", "sum"), T=("AirTemp", "mean"), E=("RefEvap", "sum"))
fig, ax = plt.subplots(1, 2, figsize=(15, 5.2), sharey=False); fig.subplots_adjust(wspace=0.38)
for a, (lab, yrs, P, E, T) in zip(ax, [("Taastrup (DK), 1980–1999 (course correction ×0.7, +2 °C)", ta.index, ta.P, et0.reindex(ta.index), ta["T"]),
                                       ("Bologna (IT), 1995–2004", ba.index, ba.P, ba.E, ba["T"])]):
    a.bar(yrs - 0.2, P, 0.4, color=SKY, label="rain (mm)"); a.bar(yrs + 0.2, E, 0.4, color="#E67E22", label="reference ET (mm)")
    a2 = a.twinx(); a2.plot(yrs, T, "o-", color=RED, label="mean temperature"); a2.set_ylabel("°C", color=RED); a2.grid(False)
    a2.spines["right"].set_visible(True)
    a.set_title(lab, loc="left", fontsize=11.5, y=1.07); a.set_ylabel("mm per year"); a.legend(loc="upper left", fontsize=8.5)
    a.set_xticks(list(yrs)[::2]); a.set_xticklabels([int(v) for v in list(yrs)[::2]])
    ar = (E / P).mean(); a.text(0.99, 0.97, f"mean aridity ET₀/P = {ar:.2f}", transform=a.transAxes, ha="right", va="top", fontsize=9)
save(fig, FA, "03_Climate_forcing", "Climate forcing", "Annual rain, reference ET and temperature for the two climates used (Taastrup: E0–E5, E7–E16; Bologna: E6).", "Weather files, E0")

# 4 ---- rainfed yields per year per soil
Y = {s: per_year(f"E0_{s}_Rainfed").set_index("year").yield_ for s in SOILS}
Ydf = pd.DataFrame(Y)
fig, (a1, a2) = plt.subplots(2, 1, figsize=(13, 9), gridspec_kw={"height_ratios": [1.4, 1], "hspace": 0.42})
for s in SOILS: a1.plot(Ydf.index, Ydf[s], "o-", ms=3.5, lw=1.6, color=SOIL_COL[s], label=SOIL_LAB[s])
crops = per_year("E0_S01_CoarseLoam_Rainfed").crop.str.replace("Winter ", "W.").str.replace("Spring ", "S.")
a1.set_ylabel("storage-organ yield (Mg DM/ha)"); a1.legend(ncol=5, fontsize=8.5); a1.set_xticks(Ydf.index)
a1.set_xticklabels([f"{y}\n{c}" for y, c in zip(Ydf.index, crops)], fontsize=7.5)
a1.set_title("Rainfed yields, every harvest 1980–1999, all 10 soils (E0)", loc="left")
im = a2.imshow(Ydf.T.values, aspect="auto", cmap="YlGn"); a2.set_yticks(range(10)); a2.set_yticklabels([SOIL_LAB[s] for s in SOILS])
a2.set_xticks(range(len(Ydf))); a2.set_xticklabels(Ydf.index, rotation=90); a2.grid(False); fig.colorbar(im, ax=a2, label="Mg DM/ha", pad=0.01)

save(fig, FA, "04_Rainfed_yields_all_years", "Rainfed yields per year and soil", "Harvest-by-harvest yields from the E0 baselines (re-run for per-year output; matches the user's runs within 0.4 %).", "E0")

# 5 ---- rainfed water balance per soil
e0 = ok(d, "E0").set_index("soil").reindex(SOILS)
fig, ax = plt.subplots(figsize=(13, 5.4)); x = np.arange(10); btm = np.zeros(10)
for k, lab, c in [("transpiration_mm", "transpiration", GREEN), ("soil_evap_mm", "soil evaporation", "#C0A16B"),
                  ("canopy_evap_mm", "canopy interception evap.", SKY), ("other_evap_mm", "ponded-water, snow & litter evap.", "#B8C4CE"),
                  ("drainage_1m_mm", "drainage below 1 m", NAVY)]:
    v = e0[k].clip(lower=0).values; ax.bar(x, v, 0.65, bottom=btm, color=c, label=lab)
    for i in range(10):
        if v[i] > 25: ax.text(x[i], btm[i] + v[i] / 2, f"{v[i]:.0f}", ha="center", va="center", color="white", fontsize=8)
    btm += v
ax.plot(x, e0.rain_mm, "k_", ms=28, mew=2, label="rain")
ax.set_xticks(x); ax.set_xticklabels([SOIL_LAB[s].replace(" ", "\n") for s in SOILS]); ax.set_ylabel("mm per year")
ax.legend(ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.22)); ax.set_title("Where rain goes without irrigation (E0, 20-year means)", loc="left")
save(fig, FA, "05_Rainfed_water_balance", "Rainfed water balance per soil", "Mean annual partitioning of rain in the 10 rainfed baselines.", "E0")

# ---------------------------------------------------------------- B: pore-scale proxies
h = -np.logspace(0, 5, 400); pF = np.log10(-h)
fig, ax = plt.subplots(1, 2, figsize=(14, 5.4), sharey=True)
for a, hz in zip(ax, ["Ap", "Bt"]):
    for s in SOILS: a.plot(pF, vg_theta(h, G.SOILS[s][hz]), color=SOIL_COL[s], lw=2, label=SOIL_LAB[s])
    for v, lab, c in [(2.0, "FC", NAVY), (np.log10(300), "trigger", RED), (4.2, "WP", "#6E4B2A")]:
        a.axvline(v, ls=":", color=c); a.text(v + 0.04, 0.005, lab, color=c, fontsize=9)
    a.set_xlabel("pF = log₁₀|h| (cm)"); a.set_title(f"Retention curves, {hz} horizon", loc="left")
ax[0].set_ylabel("θ (cm³/cm³)"); ax[1].legend(fontsize=8.5, ncol=2)
save(fig, FB, "06_Retention_curves", "Retention curves of the 10 soils", "van Genuchten θ(h) with field capacity (pF 2), the −300 cm trigger and wilting point (pF 4.2).", "Soil files")

fig, ax = plt.subplots(figsize=(12, 5.4))
for s in SOILS:
    p = G.SOILS[s]["Ap"]; th = vg_theta(h, p); dens = -np.gradient(th, pF)
    ax.plot(pF, dens, color=SOIL_COL[s], lw=2.2, label=SOIL_LAB[s]); ax.plot(pF[np.argmax(dens)], dens.max(), "o", color=SOIL_COL[s])
sec = ax.secondary_xaxis("top", functions=(lambda x: 0.149 / (10 ** x) * 1e4, lambda r: np.log10(0.149e4 / r)))
sec.set_xticks([1000, 100, 10, 1, 0.1]); sec.set_xticklabels(["1000", "100", "10", "1", "0.1"])
sec.set_xlabel("equivalent pore radius (µm, Young–Laplace r = 0.149/h)")
ax.set_xlabel("pF"); ax.set_ylabel("−dθ/dpF  (pore-volume density)"); ax.legend(ncol=2, fontsize=8.5)
ax.set_title("Pore-size distribution (Ap horizon): peak = dominant pore class", loc="left", pad=36)
save(fig, FB, "07_Pore_size_distribution", "Pore-size distribution", "Derivative of the retention curve (−dθ/dpF) for each soil; top axis converts suction to equivalent pore radius.", "Soil files")

fig, ax = plt.subplots(1, 2, figsize=(14, 5.2))
se = np.linspace(0.01, 1, 300)
for s in SOILS:
    p = G.SOILS[s]["Ap"]; m = 1 - 1 / p["n"]; K = p["ks"] * se ** p["l"] * (1 - (1 - se ** (1 / m)) ** m) ** 2
    ax[0].semilogy(se, K * 240, color=SOIL_COL[s], lw=2, label=SOIL_LAB[s]); ax[1].loglog(-h, vg_K(h, p) * 240, color=SOIL_COL[s], lw=2)
ax[0].set_xlabel("effective saturation Se (–)"); ax[0].set_ylabel("K (mm/day)"); ax[0].set_title("Conductivity vs saturation", loc="left")
ax[1].set_xlabel("suction |h| (cm)"); ax[1].set_title("Conductivity vs suction", loc="left"); ax[1].axvline(300, color=RED, ls=":")
ax[0].legend(fontsize=8, ncol=2)
for a in ax: a.set_ylim(1e-6, 1e5)
save(fig, FB, "08_Unsaturated_conductivity", "Unsaturated conductivity", "Mualem–van Genuchten K(Se) and K(h) (Ap horizon), mm/day; dotted line = trigger.", "Soil files")

fig, ax = plt.subplots(1, 3, figsize=(16, 4.8)); fig.subplots_adjust(wspace=0.42)
lab = [SOIL_LAB[s] for s in SOILS]; col = [SOIL_COL[s] for s in SOILS]
ax[0].barh(lab, [taw_mm(s) for s in SOILS], color=col); ax[0].set_xlabel("TAW 0–100 cm (mm)"); ax[0].set_title("Total available water", loc="left")
ax[1].barh(lab, [1 / G.SOILS[s]["Ap"]["a"] for s in SOILS], color=col); ax[1].set_xticks([0, 25, 50, 75, 100]); ax[1].set_xlabel("1/α (cm)"); ax[1].set_title("Air-entry suction", loc="left")
ax[2].barh(lab, [G.SOILS[s]["Ap"]["ks"] * 10 for s in SOILS], color=col); ax[2].set_xscale("log"); ax[2].set_xlabel("Ksat (mm/h, log)"); ax[2].set_title("Saturated conductivity", loc="left")
for a in ax[1:]: a.set_yticklabels([])
for a in ax: a.invert_yaxis()
save(fig, FB, "09_TAW_airentry_Ksat", "Available water, air entry and Ksat", "Soil-physical indicators computed from the hydraulic parameters of each soil.", "Soil files")

# 10 ---- topsoil structure over time (E5 daily log K)
TILL = {"conv": ("Conventional plough", "#8E44AD"), "reduced": ("Reduced tillage", "#E67E22"), "notill": ("No-till", GREEN)}
fig, ax = plt.subplots(2, 1, figsize=(14, 7.8), sharex=True); fig.subplots_adjust(hspace=0.32)
for t, (lab, c) in TILL.items():
    r = f"E5_S01_CoarseLoam_{t}_tc0.005_Irrigated"; k = dlf(r, "Daily-logK.dlf"); th = dlf(r, "Daily-Theta.dlf")
    kk = pd.Series(k["K @ -3.75"].values, index=k.date); tt = pd.Series(th["Theta @ -3.75"].values, index=th.date)
    ax[0].plot(kk.index, kk.rolling(30, min_periods=5).median(), color=c, lw=1.8, label=lab)
    ax[1].plot(tt.index, tt.rolling(30, min_periods=5).mean(), color=c, lw=1.6, label=lab)
ax[0].set_ylabel("log₁₀ K at 3.75 cm (30-day median)"); ax[1].set_ylabel("θ at 3.75 cm (30-day mean)")
ax[0].legend(ncol=3); ax[0].set_title("Topsoil hydraulic state over 20 years under three tillage systems (E5, coarse loam, irrigated, WEPP structure model)", loc="left")
save(fig, FB, "10_Topsoil_logK_theta_20yr", "Topsoil conductivity and water content over time", "Daily log10 K and θ at 3.75 cm (30-day rolling statistics), E5 re-runs.", "E5 daily")

# 11 ---- consolidation rate effects
e5 = ok(d, "E5"); base = e5[e5.tc == 0.001].set_index(["soil", "till", "water"])
e5 = e5.join(base[["yield_Mg_ha", "drainage_1m_mm", "irrigation_mm"]], on=["soil", "till", "water"], rsuffix="_b")
fig, ax = plt.subplots(1, 3, figsize=(15, 5.2)); fig.subplots_adjust(top=0.8, wspace=0.34)
for t, (lab, c) in TILL.items():
    g = e5[(e5.till == t) & (e5.water == "Irrigated")].groupby("tc")
    for a, k in zip(ax, ["yield_Mg_ha", "drainage_1m_mm", "irrigation_mm"]):
        m = g.apply(lambda x: (x[k] - x[k + "_b"]).mean()); sdev = g.apply(lambda x: (x[k] - x[k + "_b"]).std())
        a.errorbar(m.index, m.values, yerr=sdev.values, fmt="o-", color=c, capsize=3, label=lab)
for a, t in zip(ax, ["Δ yield (Mg/ha)", "Δ drainage (mm/yr)", "Δ irrigation (mm/yr)"]):
    a.set_xscale("log"); a.set_xlabel("time-consolidation rate (1/day)"); a.set_ylabel(t); a.axhline(0, color="#999", lw=0.8)
    a.set_xticks([0.001, 0.0025, 0.005, 0.01, 0.02]); a.set_xticklabels(["0.001", "0.0025", "0.005", "0.01", "0.02"], rotation=45); a.minorticks_off()
ax[0].legend(); fig.suptitle("Faster structural consolidation: change vs the slowest rate (mean ± SD over 10 soils, irrigated)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FB, "11_Consolidation_rate_effects", "Structural degradation rate effects", "E5: change in yield, drainage and irrigation relative to tc = 0.001/day, per tillage system.", "E5")

# 12 ---- tillage x water regime heatmaps per soil
fig, ax = plt.subplots(1, 2, figsize=(15, 5.4))
for a, k, cm, lab in zip(ax, ["drainage_1m_mm", "yield_Mg_ha"], ["Blues", "YlGn"], ["drainage (mm/yr)", "yield (Mg/ha)"]):
    p = ok(d, "E5").groupby(["soil", "till", "water"])[k].mean().unstack(["till", "water"]).reindex(SOILS)
    p = p[[(t, w) for w in ("Rainfed", "Irrigated") for t in ("conv", "reduced", "notill")]]
    im = a.imshow(p.values, cmap=cm, aspect="auto"); fig.colorbar(im, ax=a, label=lab, pad=0.01)
    for i in range(p.shape[0]):
        for j in range(p.shape[1]): a.text(j, i, f"{p.values[i, j]:.1f}" if k == "yield_Mg_ha" else f"{p.values[i, j]:.0f}", ha="center", va="center", fontsize=7.5)
    a.set_xticks(range(6)); a.set_xticklabels([f"{t}\n{w}" for t, w in p.columns], fontsize=8.5); a.set_yticks(range(10))
    a.set_yticklabels([SOIL_LAB[s] for s in SOILS]); a.grid(False); a.set_title(lab.split(" (")[0].capitalize() + " by tillage × water regime", loc="left")
save(fig, FB, "12_Tillage_water_heatmaps", "Tillage × water-regime interaction", "E5 means over the five consolidation rates.", "E5")

# 13 ---- wetting-drying loops theta vs h
fig, ax = plt.subplots(1, 3, figsize=(15, 4.8), sharey=True)
for a, (t, (lab, c)) in zip(ax, TILL.items()):
    r = f"E5_S01_CoarseLoam_{t}_tc0.005_Irrigated"; th = dlf(r, "Daily-Theta.dlf"); hh = dlf(r, "Daily-h.dlf")
    m = (th.date >= "1994-03-01") & (th.date <= "1994-10-31")
    x = np.log10(np.clip(-hh.loc[m, "h @ -3.75"].values, 1, None)); y = th.loc[m, "Theta @ -3.75"].values
    sc = a.scatter(x, y, c=np.arange(len(x)), cmap="viridis", s=12); a.plot(x, y, color=c, lw=0.7, alpha=0.6)
    a.set_title(lab, loc="left"); a.set_xlabel("pF at 3.75 cm")
ax[0].set_ylabel("θ at 3.75 cm"); fig.colorbar(sc, ax=ax, label="day of season (Mar→Oct 1994)", pad=0.01)
fig.suptitle("Wetting–drying trajectories in the topsoil: θ–pF paths drift as structure changes (E5)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FB, "13_Wetting_drying_loops", "Wetting–drying loops", "Daily θ vs pF at 3.75 cm through the 1994 season for each tillage system.", "E5 daily")

write_catalog("AB"); print("AB done", len(CATALOG)); print(pd.Series(eff).round(3).to_dict())
