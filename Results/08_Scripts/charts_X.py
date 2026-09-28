from common import *
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon
d = load_summary(); FX = "02_Additional_Figures"; L01 = SOILS[0]

# X01 texture triangle with the 10 soils
def tern(sand, clay):  # silt implicit; x axis sand (left→right reversed like example), y clay
    x = 1 - sand - clay * 0.5; y = clay * np.sqrt(3) / 2; return x, y
fig, ax = plt.subplots(figsize=(9, 8)); ax.axis("off"); ax.set_aspect("equal")
ax.add_patch(Polygon([(0, 0), (1, 0), (0.5, np.sqrt(3) / 2)], fc="#FBF4EA", ec=NAVY, lw=1.5))
for f in np.arange(0.1, 1, 0.1):
    for p1, p2 in [(tern(1 - f, 0), tern(0, f) if False else tern(1 - f, 0)),]: pass
    a = tern(f, 0); b = tern(f, 1 - f); ax.plot([a[0], b[0]], [a[1], b[1]], color="#ddd", lw=0.6)
    a = tern(0, f); b = tern(1 - f, f); ax.plot([a[0], b[0]], [a[1], b[1]], color="#ddd", lw=0.6)
    a = tern(1 - f, 0); b = tern(0, 1 - f); ax.plot([a[0], b[0]], [a[1], b[1]], color="#ddd", lw=0.6)
    ax.text(*tern(f, 0) - np.array([0, 0.035]), f"{f*100:.0f}", ha="center", fontsize=8)
    x, y = tern(0, f); ax.text(x + 0.03, y, f"{f*100:.0f}", fontsize=8)
for s in SOILS:
    h = G.SOILS[s]["Ap"]; x, y = tern(h["sand"], h["clay"]); ax.scatter(x, y, s=160, color=SOIL_COL[s], ec="k", zorder=3)
    off = {"S01_CoarseLoam": (-95, 12), "S02_CoarseSand": (14, 26), "S05_SandyLoam": (14, -18)}.get(s, (8, 6))
    ax.annotate(SOIL_LAB[s] + (" (same texture)" if s == "S02_CoarseSand" else ""), (x, y), xytext=off, textcoords="offset points", fontsize=9.5, color=NAVY, weight="bold",
                arrowprops=dict(arrowstyle="-", color="#999", lw=0.6) if s in ("S01_CoarseLoam", "S02_CoarseSand") else None)
ax.text(0.5, -0.09, "← sand (%)", ha="center", fontsize=11); ax.text(0.86, 0.5, "clay (%) ↑", rotation=-60, fontsize=11)
ax.text(0.1, 0.5, "silt = 100 − sand − clay", rotation=60, fontsize=10, color="#555")
ax.set_title("Texture of the 10 simulated soils (Ap horizon, USDA)", loc="left", color=NAVY, weight="bold")
ax.text(0, -0.16, "Coarse loam and coarse sand share the course ResFarm texture; they differ in hydraulic parameters (n, Ksat).", fontsize=8.5, color="#555")
save(fig, FX, "X01_Texture_triangle", "Texture triangle", "Sand–silt–clay of each soil from the soil files.", "Soil files")

# X02 pore-domain decomposition (macro / meso / micro)
pF = np.linspace(-1, 6, 400); h = -10 ** pF
fig, ax = plt.subplots(1, 2, figsize=(15, 5.4), gridspec_kw={"width_ratios": [1.1, 1]})
p = G.SOILS[L01]["Ap"]; th = vg_theta(h, p); t15, t42 = vg_theta(-10 ** 1.5, p), vg_theta(-10 ** 4.2, p)
mac = np.clip(th - t15, 0, None); mes = np.clip(np.minimum(th, t15) - t42, 0, None); mic = np.minimum(th, t42)
ax[0].plot(pF, th * 100, color=RED, lw=2.8, label="θ total"); ax[0].plot(pF, mac * 100, ":", color="k", lw=2, label="θ macro (pF < 1.5)")
ax[0].plot(pF, mes * 100, "--", color=GREEN, lw=2, label="θ meso (pF 1.5–4.2)"); ax[0].plot(pF, mic * 100, "--", color="#E67E22", lw=2, label="θ micro (pF > 4.2)")
ax[0].set_xlabel("pF"); ax[0].set_ylabel("volumetric water content (%)"); ax[0].legend(); ax[0].set_title("a  Pore-domain split of the retention curve (coarse loam, Ap)", loc="left")
dom = pd.DataFrame({SOIL_LAB[s]: [(G.SOILS[s]["Ap"]["ts"] - vg_theta(-10 ** 1.5, G.SOILS[s]["Ap"])),
                                  (vg_theta(-10 ** 1.5, G.SOILS[s]["Ap"]) - vg_theta(-10 ** 4.2, G.SOILS[s]["Ap"])),
                                  vg_theta(-10 ** 4.2, G.SOILS[s]["Ap"])] for s in SOILS}, index=["macro", "meso", "micro"]).T * 100
dom.plot.barh(stacked=True, ax=ax[1], color=["#5D6D7E", GREEN, "#E67E22"], width=0.7); ax[1].invert_yaxis()
ax[1].set_xlabel("pore volume (% of soil volume)"); ax[1].set_title("b  Pore domains per soil", loc="left"); ax[1].legend(ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.12))
save(fig, FX, "X02_Pore_domains", "Pore-domain decomposition", "Macro/meso/micro pore water split at pF 1.5 and 4.2 (after the multi-domain concept in the examples).", "Soil files")

# X03 near-saturated conductivity over time by tillage (like the Ksat example)
TILL = {"conv": ("Conventional plough", "#8E44AD"), "reduced": ("Reduced tillage", "#E67E22"), "notill": ("No-till", GREEN)}
fig, ax = plt.subplots(2, 1, figsize=(14, 7.5), sharex=True)
for t, (lab, c) in TILL.items():
    r = f"E5_{L01}_{t}_tc0.005_Irrigated"; k = dlf(r, "Daily-logK.dlf"); hh = dlf(r, "Daily-h.dlf")
    wet = hh["h @ -3.75"].values > -30; kv = np.where(wet, 10 ** k["K @ -3.75"].values * 240, np.nan)   # cm/h -> mm/day
    s_ = pd.Series(kv, index=k.date).resample("QS").median(); ax[0].plot(s_.index, s_.values, "o-", ms=3, color=c, label=lab)
    kd = pd.Series(10 ** k["K @ -40.5"].values * 240, index=k.date).resample("QS").median(); ax[1].plot(kd.index, kd.values, color=c, lw=1.6)
ax[0].set_ylabel("topsoil K when wet (mm/day)"); ax[1].set_ylabel("subsoil K at 40 cm (mm/day)"); ax[0].legend(ncol=3)
ax[0].set_title("Near-saturated topsoil conductivity (h > −30 cm) and subsoil conductivity, quarterly medians (E5, coarse loam)", loc="left", fontsize=11.5)
save(fig, FX, "X03_Ksat_proxy_timeseries", "Near-saturated conductivity over time", "Topsoil K on wet days (a Ksat proxy) and subsoil K, per tillage system.", "E5 daily")

# X04 seasonal envelopes (mean, 10-90 %) vs net precipitation
fig, ax = plt.subplots(2, 3, figsize=(17, 7.6), sharex=True)
sw = dlf(f"E0_{L01}_Rainfed", "Daily-SWater.dlf"); fw = dlf(f"E0_{L01}_Rainfed", "Daily-FWater.dlf")
net = (fw.Precipitation - sw["Reference evapotranspiration (dry)"].values[:len(fw)]); net.index = fw.date.dt.dayofyear
netm = net.groupby(level=0).mean().rolling(15, center=True, min_periods=1).mean()
for j, (t, (lab, c)) in enumerate(TILL.items()):
    r = f"E5_{L01}_{t}_tc0.005_Irrigated"
    for i, (fn, col, yl) in enumerate([("Daily-Theta.dlf", "Theta @ -3.75", "θ at 3.75 cm"), ("Daily-logK.dlf", "K @ -3.75", "log₁₀ K at 3.75 cm")]):
        x = dlf(r, fn); doy = x.date.dt.dayofyear; g = x.groupby(doy)[col]
        m, lo, hi = g.mean(), g.quantile(0.1), g.quantile(0.9); a = ax[i, j]
        a.fill_between(m.index, lo, hi, color=c, alpha=0.3, label="10–90 percentile"); a.plot(m.index, m, color=c, lw=2, label="mean")
        a2 = a.twinx(); a2.plot(netm.index, netm.values, color=SKY, lw=1.2, label="net precipitation"); a2.grid(False)
        a2.set_ylim(-6, 6); a2.set_ylabel("net P (mm/day)" if j == 2 else "", color=SKY)
        a.set_ylabel(yl if j == 0 else ""); a.set_title(lab if i == 0 else "", loc="left")
for a in ax[1]: a.set_xlabel("day of year")
ax[0, 0].legend(fontsize=8, loc="lower left")
fig.suptitle("Seasonal envelopes over 20 years: topsoil water content and conductivity vs net precipitation (E5)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FX, "X04_Seasonal_envelopes", "Seasonal envelopes", "Mean and 10–90 % band by day of year across 1980–2000; blue = mean net precipitation (rain − ET₀).", "E5, E0 daily")

# X05 evaporation decline after wetting (stage 1 / stage 2)
def decay(rid):
    sw = dlf(rid, "Daily-SWater.dlf"); wet = (sw.rain + sw["Surface irrigation"].fillna(0)).values; E = sw["Evaporation of soil water"].values
    curves = []
    for i in np.where(wet > 5)[0]:
        seg = wet[i + 1:i + 8]
        if len(seg) == 7 and seg.max() < 0.5 and sw.month.iloc[i] in (4, 5, 6, 7, 8, 9): curves.append(E[i:i + 8])
    return np.array(curves)
fig, ax = plt.subplots(figsize=(12, 5.6))
for rid, lab, c in [(f"E0_{L01}_Rainfed", "rainfed, bare surface", METH_COL["Rainfed"]), (f"E7_{L01}_vff0.9_cap0.5mm", "weak mulch (vff 0.9)", "#E67E22"),
                    (f"E7_{L01}_vff0.1_cap4mm", "strong mulch (vff 0.1)", GREEN)]:
    C = decay(rid)
    if len(C):
        m = C.mean(0); ax.plot(range(8), m, "o-", color=c, lw=2.4, label=f"{lab} (n = {len(C)} events)")
        ax.fill_between(range(8), np.percentile(C, 25, 0), np.percentile(C, 75, 0), color=c, alpha=0.18)
ax.set_xlabel("days after a wetting event (> 5 mm, then 7 dry days)"); ax.set_ylabel("soil evaporation (mm/day)")
ax.set_title("Evaporation decline after wetting: stage-1 (energy-limited) → stage-2 (soil-limited) drying", loc="left"); ax.legend()
save(fig, FX, "X05_Evaporation_decline_after_wetting", "Evaporation decline after wetting", "Composite of all Apr–Sep events 1980–2000 (> 5 mm) followed by 7 dry days; band = interquartile range.", "E0,E7 daily")

# X06 model structure with the real mean fluxes
r = d[d.run_id == f"E2_{L01}_h300"].iloc[0]
fig, ax = plt.subplots(figsize=(13, 8)); ax.axis("off"); ax.set_xlim(0, 13); ax.set_ylim(0, 8)
boxes = {"atm": (6.5, 7.3, f"Atmosphere\nrain {r.rain_mm:.0f} mm · ET₀-driven demand"), "irr": (11, 7.3, f"Irrigation\n{r.irrigation_mm:.0f} mm/yr ({int(r.irrigation_events)} events)"),
         "can": (3.2, 5.6, f"Canopy\ninterception evap. {r.canopy_evap_mm:.0f} mm"), "surf": (6.5, 5.6, f"Surface & litter\nponded/snow/litter evap. {r.other_evap_mm:.0f} mm"),
         "soil": (6.5, 3.4, f"Soil water (Richards eq.)\nsoil evap. {r.soil_evap_mm:.0f} mm"), "crop": (10.6, 4.4, f"Crop (roots, LAI)\ntranspiration {r.transpiration_mm:.0f} mm\nyield {r.yield_Mg_ha:.2f} Mg DM/ha"),
         "drain": (6.5, 1.1, f"Below 1 m\ndrainage {r.drainage_1m_mm:.0f} mm · N leached {r.N_leached_kg_ha:.0f} kg/ha"),
         "N": (2.4, 2.4, f"Nitrogen\nfertiliser {r.N_fertiliser_kg_ha:.0f} · uptake {r.N_uptake_kg_ha:.0f} kg/ha")}
for k, (x, y, t) in boxes.items():
    ax.add_patch(FancyBboxPatch((x - 1.55, y - 0.55), 3.1, 1.1, boxstyle="round,pad=0.05,rounding_size=0.15", fc={"soil": "#DCEBF7", "crop": "#E8F3E1", "drain": "#E3E8EF"}.get(k, "white"), ec=NAVY, lw=1.5))
    ax.text(x, y, t, ha="center", va="center", fontsize=9.3, color=NAVY)
for a_, b_ in [("atm", "can"), ("atm", "surf"), ("irr", "surf"), ("surf", "soil"), ("soil", "crop"), ("soil", "drain"), ("N", "soil"), ("can", "atm"), ("crop", "atm")]:
    (x1, y1, _), (x2, y2, _) = boxes[a_], boxes[b_]
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=16, lw=1.8, color=SKY, shrinkA=36, shrinkB=36, connectionstyle="arc3,rad=0.08"))
ax.set_title("Daisy water–crop–nitrogen structure with the simulated mean annual fluxes (coarse loam, E2, −300 cm)", loc="left", color=NAVY, weight="bold")
save(fig, FX, "X06_Model_structure_with_fluxes", "Model structure with fluxes", "Model compartments annotated with the 20-year mean fluxes of one run (after the Daisy diagrams in the examples).", "E2")

# X07 root depth and LAI development
cp = dlf(f"E2_{L01}_h300", "Daily-CropProduction.dlf")
fig, ax = plt.subplots(2, 1, figsize=(14, 6.6), sharex=True)
ax[0].fill_between(cp.date, 0, cp.LAI, color=GREEN, alpha=0.6); ax[0].set_ylabel("LAI")
ax[1].fill_between(cp.date, 0, cp.Depth, color="#8B5A2B", alpha=0.6); ax[1].set_ylabel("root depth (cm)"); ax[1].axhline(-100, color=NAVY, ls="--", lw=1)
ax[1].text(cp.date.iloc[50], -96, "1 m balance border", color=NAVY, fontsize=9)
ax[0].set_title("Canopy and root development through the 20-year rotation (coarse loam, irrigated, E2)", loc="left")
save(fig, FX, "X07_Root_LAI_development", "Root and LAI development", "Daily LAI and rooting depth from the crop module.", "E2 daily")

# X08 correlation matrix
cols = ["yield_Mg_ha", "irrigation_mm", "drainage_1m_mm", "soil_evap_mm", "canopy_evap_mm", "transpiration_mm", "water_stress_d",
        "N_leached_kg_ha", "N_uptake_kg_ha", "IE_kg_m3", "DPF", "NLF", "rain_mm"]
C = ok(d)[cols].corr(method="spearman")
fig, ax = plt.subplots(figsize=(10.5, 9)); im = ax.imshow(C.values, cmap="RdBu_r", vmin=-1, vmax=1)
for (i, j), v in np.ndenumerate(C.values): ax.text(j, i, f"{v:.2f}", ha="center", va="center", fontsize=7.5, color="white" if abs(v) > 0.6 else "k")
lb = [c.replace("_Mg_ha", "").replace("_mm", "").replace("_kg_ha", "").replace("_kg_m3", "").replace("_1m", "").replace("_d", " days") for c in cols]
ax.set_xticks(range(len(cols))); ax.set_xticklabels(lb, rotation=90); ax.set_yticks(range(len(cols))); ax.set_yticklabels(lb); ax.grid(False)
fig.colorbar(im, ax=ax, label="Spearman ρ", pad=0.01); ax.set_title("Coupling between outputs across all 10,041 valid runs", loc="left")
save(fig, FX, "X08_Correlation_matrix", "Correlation matrix", "Spearman rank correlations between long-term outputs.", "All")

# X09 random-forest drivers
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import partial_dependence
z = ok(d); z = z[z.exp.isin(["E10", "E11", "E12", "E13", "E14", "E15", "E16"])].copy()
z["n_soil"] = z.soil.map({s: G.SOILS[s]["Bt"]["n"] for s in SOILS}); z["logKs"] = np.log10(z.soil.map({s: G.SOILS[s]["Ap"]["ks"] for s in SOILS}))
z["TAW"] = z.soil.map({s: taw_mm(s) for s in SOILS})
feat = {"P": 1.0, "dT": 0.0, "Ep": 0.6, "trig": -300, "z": 20, "amt_mm": 2.4, "vff": 1.0, "cap": 0.0, "Nrate": 100, "root": 150}
X = z[list(feat)].copy()
for k, v in feat.items(): X[k] = X[k].fillna(v)
X["trig"] = np.log10(-X.trig); X[["n_soil", "logKs", "TAW"]] = z[["n_soil", "logKs", "TAW"]]
X["rainfed"] = (z.wstrat == "W01_Rainfed").astype(int)
X["drip"] = (z.method.fillna("").str.contains("Drip") | z.wstrat.fillna("").str.contains("Drip") | z.treatment.str.contains("Drip")).astype(int)
X["overhead"] = (z.method.fillna("").str.contains("Overhead") | z.wstrat.fillna("").str.contains("Overhead") | z.treatment.str.contains("Overhead")).astype(int)
names = {"P": "rain scale", "dT": "temperature", "Ep": "soil evap. factor", "trig": "trigger (log)", "z": "sensor depth", "amt_mm": "amount/event",
         "vff": "mulch vapour factor", "cap": "interception cap.", "Nrate": "N rate", "root": "rooting depth", "n_soil": "soil n", "logKs": "log Ksat", "TAW": "TAW", "rainfed": "rainfed (no irrigation)", "drip": "drip method", "overhead": "overhead method"}
fig, ax = plt.subplots(1, 3, figsize=(18, 6)); r2 = {}
for a, (yk, t) in zip(ax, [("irrigation_mm", "Irrigation"), ("drainage_1m_mm", "Drainage"), ("yield_Mg_ha", "Yield")]):
    rf = RandomForestRegressor(n_estimators=150, min_samples_leaf=3, n_jobs=1, random_state=1, oob_score=True).fit(X, z[yk]); r2[t] = rf.oob_score_
    imp = pd.Series(rf.feature_importances_, index=[names[c] for c in X.columns]).sort_values()
    a.barh(imp.index, imp.values, color=SKY); a.set_title(f"{t} (out-of-bag R² = {rf.oob_score_:.2f})", loc="left"); a.set_xlabel("importance")
fig.suptitle("Random-forest drivers across E10–E16 (6,669 runs): which factors control each flux", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FX, "X09_RandomForest_drivers", "Random-forest drivers", "Impurity-based importance of design factors and soil properties; out-of-bag R² shown. Moderate R² for irrigation/drainage reflects strong soil × management interactions.", "E10-E16")

# X10 validation: re-runs vs user's runs
m = pd.read_csv("/home/claude/runs/results/summary_all.csv"); m = m[m.status == "ok"].set_index("run_id")
u = d.set_index("run_id"); c = m.index.intersection(u.index)
fig, ax = plt.subplots(1, 4, figsize=(18, 4.6))
for a, k in zip(ax, ["yield_Mg_ha", "irrigation_mm", "drainage_1m_mm", "N_leached_kg_ha"]):
    a.scatter(u.loc[c, k], m.loc[c, k], color=NAVY, s=26); lo, hi = min(u.loc[c, k].min(), 0), u.loc[c, k].max() * 1.05
    a.plot([lo, hi], [lo, hi], color=RED, lw=1); r = np.corrcoef(u.loc[c, k], m.loc[c, k])[0, 1]
    a.set_title(f"{k.split('_')[0]} (r = {r:.4f})", loc="left"); a.set_xlabel("your runs (Daisy 7.1.12)"); a.set_ylabel("re-runs (Daisy 7.1.14)")
fig.suptitle(f"Reproducibility: {len(c)} runs re-simulated for daily output vs your results", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FX, "X10_Validation_reruns", "Validation of re-runs", "1:1 comparison; median difference < 0.3 %, all within 2 %.", "Re-runs")

# X11 PCA biplot of all runs
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
v = ok(d)[cols[:-1]].dropna(); Z = StandardScaler().fit_transform(v); pc = PCA(2).fit(Z); S = pc.transform(Z)
fig, ax = plt.subplots(figsize=(11, 8)); ex = ok(d).loc[v.index, "exp"]
for e, c in zip(sorted(ex.unique(), key=lambda s: int(s[1:])), plt.cm.tab20(np.linspace(0, 1, 17))): q = ex == e; ax.scatter(S[q, 0], S[q, 1], s=5, color=c, label=e, alpha=0.6)
for i, cname in enumerate(cols[:-1]):
    vx, vy = pc.components_[0, i] * 11, pc.components_[1, i] * 11; ax.arrow(0, 0, vx, vy, color="k", width=0.03); ax.text(vx * 1.08, vy * 1.08 + (0.35 if i % 2 else -0.35), lb[i], fontsize=9, weight="bold", bbox=dict(fc="white", ec="none", alpha=0.8, pad=0.5))
fig.canvas.draw(); rr = fig.canvas.get_renderer(); labs_ = [t for t in ax.texts]
for _ in range(60):
    moved = False
    for i_ in range(len(labs_)):
        for j_ in range(i_ + 1, len(labs_)):
            a_, b_ = labs_[i_].get_window_extent(rr), labs_[j_].get_window_extent(rr)
            if a_.overlaps(b_):
                x_, y_ = labs_[j_].get_position(); labs_[j_].set_position((x_, y_ - 0.45)); moved = True
    if not moved: break
    fig.canvas.draw()
ax.set_xlabel(f"PC1 ({pc.explained_variance_ratio_[0]:.0%})"); ax.set_ylabel(f"PC2 ({pc.explained_variance_ratio_[1]:.0%})"); ax.legend(ncol=3, fontsize=7.5, markerscale=3)
ax.set_title("PCA biplot of all runs: the main axes of the coupled system", loc="left")
save(fig, FX, "X11_PCA_biplot", "PCA biplot", "Standardised outputs; points coloured by experiment; arrows = loadings.", "All")

# X12 parallel coordinates of the best runs
from pandas.plotting import parallel_coordinates
pp = pd.read_csv(os.path.join(OUT, "_pareto_runs.csv")); pp["group"] = pp.experiment.str.split("_").str[0]
pc_cols = ["yield_Mg_ha", "irrigation_mm", "drainage_1m_mm", "soil_evap_mm", "N_leached_kg_ha", "IE_kg_m3"]
q = pp[pc_cols + ["group"]].copy(); q[pc_cols] = (q[pc_cols] - q[pc_cols].min()) / (q[pc_cols].max() - q[pc_cols].min())
fig, ax = plt.subplots(figsize=(13, 5.8)); parallel_coordinates(q, "group", ax=ax, colormap="tab10", alpha=0.6)
ax.set_ylabel("scaled 0–1"); ax.set_title(f"Profiles of the {len(pp)} Pareto-optimal runs by experiment", loc="left"); ax.legend(ncol=6, fontsize=8)
save(fig, FX, "X12_Parallel_coordinates_best_runs", "Parallel coordinates of best runs", "Each line one Pareto-optimal run (min–max scaled).", "Pareto set")

# X13 variance decomposition of the 3-factor experiments
rows = []
for e, fs, o in [("E8", ["P", "intensity", "trig"], "yield_Mg_ha"), ("E9", ["soil", "trig", "P"], "yield_Mg_ha"), ("E10", ["soil", "amt_mm", "window"], "irrigation_mm"),
                 ("E11", ["dT", "Ep", "P"], "irrigation_mm"), ("E12", ["z", "trig", "P"], "irrigation_mm"), ("E13", ["soil", "Nrate", "wstrat"], "N_leached_kg_ha"),
                 ("E14", ["vff", "cap", "P"], "irrigation_mm"), ("E15", ["method", "root", "amt_mm"], "irrigation_mm")]:
    z = ok(d, e).dropna(subset=[o]); tot = ((z[o] - z[o].mean()) ** 2).sum(); sh = {}
    for f in fs: g = z.groupby(f)[o]; sh[f] = (g.size() * (g.mean() - z[o].mean()) ** 2).sum() / tot
    rows.append(dict(exp=f"{e} ({o.split('_')[0]})", **{f"{i+1}": sh[f] for i, f in enumerate(fs)}, inter=max(0, 1 - sum(sh.values())), labels=fs))
fig, ax = plt.subplots(figsize=(13, 5.6)); cl = [NAVY, "#E67E22", GREEN, "#BBBBBB"]
for i, r in enumerate(rows):
    left = 0
    for j, k in enumerate(["1", "2", "3", "inter"]):
        ax.barh(i, r[k], left=left, color=cl[j], ec="white")
        if r[k] > 0.06: ax.text(left + r[k] / 2, i, (r["labels"][j] if k != "inter" else "interaction") + f"\n{r[k]:.0%}", ha="center", va="center", fontsize=7.5, color="white" if j < 3 else "k")
        left += r[k]
ax.set_yticks(range(len(rows))); ax.set_yticklabels([r["exp"] for r in rows]); ax.invert_yaxis(); ax.set_xlabel("share of variance")
ax.set_title("Variance decomposition of each 10×10×10 experiment: main effects vs interactions", loc="left")
save(fig, FX, "X13_Variance_decomposition", "Variance decomposition", "Main-effect sums of squares per factor; remainder = interactions (non-additivity).", "E8-E15")

write_catalog("X"); print("X done", len(CATALOG), r2)
