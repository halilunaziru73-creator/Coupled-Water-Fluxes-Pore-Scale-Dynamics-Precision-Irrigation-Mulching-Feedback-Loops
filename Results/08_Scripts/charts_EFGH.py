from common import *
d = load_summary()
FE, FF, FG, FH = ("01_Charts_50/E_Evaporation_Mulching", "01_Charts_50/F_Nonlinear_Feedbacks",
                  "01_Charts_50/G_Nitrogen_Coupling", "01_Charts_50/H_Synthesis")
L01 = SOILS[0]

e7 = ok(d, "E7").copy(); ref = ok(d, "E2")[lambda x: x.trig == -300].set_index("soil")
for k in ["soil_evap_mm", "irrigation_mm", "yield_Mg_ha", "drainage_1m_mm", "other_evap_mm"]:
    e7[k + "_ref"] = e7.soil.map(ref[k]); e7[k.split("_")[0] + "_saved"] = e7[k + "_ref"] - e7[k]
e14 = ok(d, "E14").copy(); r14 = e14[e14.vff == 1.0].set_index(["cap", "P"])
for k in ["soil_evap_mm", "irrigation_mm", "drainage_1m_mm", "yield_Mg_ha"]:
    e14[k + "_ref"] = [r14[k].get((c, p), np.nan) for c, p in zip(e14.cap, e14.P)]
    e14[k.split("_")[0] + "_saved"] = e14[k + "_ref"] - e14[k]

# 32 ---- E7 heatmaps soil evaporation
fig, axs = plt.subplots(2, 5, figsize=(20, 7.6), sharex=True, sharey=True)
vmin, vmax = e7.soil_evap_mm.min(), e7.soil_evap_mm.max()
for a, s in zip(axs.flat, SOILS):
    p = e7[e7.soil == s].pivot_table(index="vff", columns="cap", values="soil_evap_mm")
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="YlOrBr", vmin=vmin, vmax=vmax)
    for (r, c), v in np.ndenumerate(p.values): a.text(c, r, f"{v:.0f}", ha="center", va="center", fontsize=8)
    a.set_title(f"{SOIL_LAB[s]} (no mulch: {ref.soil_evap_mm[s]:.0f})", loc="left", fontsize=9.5)
    a.set_xticks(range(len(p.columns))); a.set_xticklabels([f"{c:g}" for c in p.columns]); a.set_yticks(range(len(p.index))); a.set_yticklabels(p.index); a.grid(False)
for a in axs[1]: a.set_xlabel("interception capacity (mm)")
for a in axs[:, 0]: a.set_ylabel("vapour flux factor")
fig.colorbar(im, ax=axs, label="soil evaporation (mm/yr)", pad=0.01)
fig.suptitle("Mulch: soil evaporation for each vapour-flux factor × interception capacity, all soils (E7)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FE, "32_E7_mulch_soil_evaporation", "Mulch evaporation reduction × interception", "Soil evaporation (mm/yr); titles give the no-mulch value (E2, −300 cm).", "E7,E2")

# 33 ---- non-linearity of mulch effect
fig, ax = plt.subplots(1, 2, figsize=(14, 5.2))
for s in SOILS:
    z = e7[e7.soil == s].groupby("vff").soil_saved.mean(); ax[0].plot(1 - z.index, z.values, "o-", color=SOIL_COL[s], label=SOIL_LAB[s])
for P, c in zip([0.5, 0.8, 1.0, 1.2, 1.4], plt.cm.Blues(np.linspace(0.4, 1, 5))):
    z = e14[e14.P == P].groupby("vff").soil_saved.mean(); ax[1].plot(1 - z.index, z.values, "o-", color=c, label=f"rain × {P:g}")
    lin = z.iloc[0] * (1 - z.index) / (1 - z.index[0]); ax[1].plot(1 - z.index, lin, ":", color=c, lw=1)
ax[0].set_title("Evaporation saved vs mulch strength, per soil (E7)", loc="left"); ax[1].set_title("Curvature vs a linear response (dotted), coarse loam (E14)", loc="left")
for a in ax: a.set_xlabel("mulch strength = 1 − vapour flux factor"); a.set_ylabel("soil evaporation saved (mm/yr)")
ax[0].legend(fontsize=7.5, ncol=2); ax[1].legend(fontsize=8.5)
save(fig, FE, "33_Mulch_nonlinearity", "Non-linearity of the mulch effect", "Saved soil evaporation relative to no mulch; dotted lines = proportional (linear) response.", "E7,E14")

# 34 ---- E14 irrigation saved facets
fig, axs = plt.subplots(2, 5, figsize=(20, 7.6), sharex=True, sharey=True)
lim = np.nanpercentile(np.abs(e14.irrigation_saved), 98)
for a, P in zip(axs.flat, sorted(e14.P.unique())):
    p = e14[e14.P == P].pivot_table(index="vff", columns="cap", values="irrigation_saved")
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="RdBu", vmin=-lim, vmax=lim)
    a.set_title(f"rain × {P:g}", loc="left", fontsize=10.5); a.set_xticks(range(len(p.columns))); a.set_xticklabels([f"{c:g}" for c in p.columns], fontsize=7.5, rotation=60)
    a.set_yticks(range(len(p.index))); a.set_yticklabels([f"{v:g}" for v in p.index], fontsize=8); a.grid(False)
for a in axs[1]: a.set_xlabel("interception capacity (mm)")
for a in axs[:, 0]: a.set_ylabel("vapour flux factor")
fig.colorbar(im, ax=axs, label="irrigation saved vs no mulch (mm/yr)", pad=0.01)
fig.suptitle("Mulch × rainfall: irrigation saved (E14, coarse loam; blue = saving)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FE, "34_E14_mulch_rain_irrigation_saved", "Mulch × rain interaction", "Irrigation saved relative to vff = 1.0 at the same capacity and rain.", "E14")

# 35 ---- interception loss vs capacity
fig, ax = plt.subplots(1, 2, figsize=(14, 5))
for v, c in zip([0.1, 0.3, 0.5, 0.7, 0.9, 1.0], plt.cm.viridis(np.linspace(0, 0.95, 6))):
    z = e14[(e14.vff == v) & (e14.P == 1.0)].sort_values("cap"); ax[0].plot(z.cap, z.other_evap_mm, "o-", color=c, label=f"vff {v:g}")
for s in SOILS:
    z = e7[e7.soil == s].groupby("cap").other_evap_mm.mean(); ax[1].plot(z.index, z.values, "o-", color=SOIL_COL[s], label=SOIL_LAB[s])
for a in ax: a.set_xlabel("mulch interception capacity (mm)"); a.set_ylabel("ponded/snow/litter evaporation (mm/yr)")
ax[0].set_title("Coarse loam (E14, rain ×1)", loc="left"); ax[1].set_title("Per soil (E7, mean over vff)", loc="left"); fig.suptitle("Evaporation from the mulch layer rises with its interception capacity", x=0.02, ha="left", color=NAVY, weight="bold")
ax[0].legend(fontsize=8.5); ax[1].legend(fontsize=7.5, ncol=2)
save(fig, FE, "35_Interception_loss_vs_capacity", "Interception loss vs capacity", "Evaporation of water held in the mulch/litter layer (with ponded water and snow).", "E7,E14")

# 36 ---- mulch-irrigation substitution
fig, ax = plt.subplots(1, 2, figsize=(14, 5.2))
z = e7.dropna(subset=["soil_saved", "irrigation_saved"])
for s in SOILS:
    q = z[z.soil == s]; ax[0].scatter(q.soil_saved, q.irrigation_saved, color=SOIL_COL[s], s=30, label=SOIL_LAB[s])
b = np.polyfit(z.soil_saved, z.irrigation_saved, 1); xx = np.linspace(z.soil_saved.min(), z.soil_saved.max(), 10)
ax[0].plot(xx, np.polyval(b, xx), "k--", label=f"slope {b[0]:.2f}"); ax[0].plot(xx, xx, color="#999", lw=1, label="1:1")
q = e14.dropna(subset=["soil_saved", "irrigation_saved"]); sc = ax[1].scatter(q.soil_saved, q.irrigation_saved, c=q.P, cmap="Blues", s=14)
fig.colorbar(sc, ax=ax[1], label="rain scale"); b2 = np.polyfit(q.soil_saved, q.irrigation_saved, 1); xx = np.linspace(q.soil_saved.min(), q.soil_saved.max(), 10)
ax[1].plot(xx, np.polyval(b2, xx), "k--", label=f"slope {b2[0]:.2f}"); ax[1].plot(xx, xx, color="#999", lw=1, label="1:1")
for a in ax: a.set_xlabel("soil evaporation saved (mm/yr)"); a.set_ylabel("irrigation saved (mm/yr)"); a.legend(fontsize=8)
ax[0].set_title("E7 (vs no mulch), all soils", loc="left"); ax[1].set_title("E14 (vs vff 1.0), coarse loam", loc="left")
fig.suptitle("Mulch–irrigation substitution: slope < 1 means part of the saved water drains or is transpired instead", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FE, "36_Mulch_irrigation_substitution", "Mulch–irrigation substitution", "Irrigation saved per mm of soil evaporation saved; 1:1 line for reference.", "E7,E14")

# 37 ---- EpFactor response
e11 = ok(d, "E11")
fig, ax = plt.subplots(1, 2, figsize=(14, 5))
for dT, c in zip(sorted(e11.dT.unique()), plt.cm.coolwarm(np.linspace(0, 1, 10))):
    z = e11[(e11.dT == dT) & (e11.P == 1.0)].sort_values("Ep")
    ax[0].plot(z.Ep, z.soil_evap_mm, "o-", color=c, ms=3, label=f"{dT:+g} °C"); ax[1].plot(z.Ep, z.irrigation_mm, "o-", color=c, ms=3)
ax[0].set_ylabel("soil evaporation (mm/yr)"); ax[1].set_ylabel("irrigation (mm/yr)")
for a in ax: a.set_xlabel("soil evaporation factor EpFactor")
ax[0].legend(fontsize=8, ncol=2, title="temperature"); ax[0].set_title("Soil evaporation", loc="left"); ax[1].set_title("Irrigation demand", loc="left")
fig.suptitle("Evaporation control through the soil evaporation factor, by temperature (E11, rain ×1)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FE, "37_EpFactor_response", "Soil evaporation factor response", "E11 lines per temperature shift at normal rain.", "E11")

# 38 ---- mulch benefit by soil
strong = e7[(e7.vff == 0.1) & (e7.cap == 4)].set_index("soil").reindex(SOILS)
fig, ax = plt.subplots(1, 3, figsize=(16, 4.8)); lab = [SOIL_LAB[s] for s in SOILS]; col = [SOIL_COL[s] for s in SOILS]
for a, k, t in zip(ax, ["soil_saved", "irrigation_saved", "yield_saved"], ["soil evaporation saved (mm/yr)", "irrigation saved (mm/yr)", "yield change (Mg/ha)"]):
    v = strong[k] if k != "yield_saved" else -strong[k]; a.barh(lab, v, color=col); a.set_xlabel(t); a.axvline(0, color="#999", lw=0.8); a.invert_yaxis()
for a in ax[1:]: a.set_yticklabels([])
fig.suptitle("Strong mulch (vff 0.1, 4 mm) vs no mulch, per soil (E7 vs E2)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FE, "38_Mulch_benefit_by_soil", "Mulch benefit by soil", "Differences between the strongest mulch and the unmulched reference.", "E7,E2")

# ================================================================= F non-linear feedbacks
# 39 ---- response surfaces temp x rain
fig, ax = plt.subplots(1, 3, figsize=(17, 4.9))
for a, k, cm in zip(ax, ["yield_Mg_ha", "irrigation_mm", "drainage_1m_mm"], ["YlGn", "YlOrRd", "Blues"]):
    p = e11[e11.Ep == 0.6].pivot_table(index="dT", columns="P", values=k)
    cf = a.contourf(p.columns, p.index, p.values, 14, cmap=cm); cs = a.contour(p.columns, p.index, p.values, 7, colors="k", linewidths=0.5)
    a.clabel(cs, fontsize=7, fmt="%.1f" if k == "yield_Mg_ha" else "%.0f"); fig.colorbar(cf, ax=a, pad=0.01)
    a.set_xlabel("rain scale"); a.set_ylabel("temperature shift (°C)"); a.set_title(k.replace("_Mg_ha", " (Mg/ha)").replace("_mm", " (mm/yr)").replace("_1m", " 1 m"), loc="left")
fig.suptitle("Temperature × rainfall response surfaces (E11, EpFactor 0.6, coarse loam, irrigated)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FF, "39_Temp_rain_response_surfaces", "Temperature × rain response surfaces", "Filled contours of yield, irrigation and drainage.", "E11")

# 40 ---- threshold detection (piecewise linear)
def piecewise(x, y):
    best = None
    for bp in np.linspace(np.quantile(x, 0.15), np.quantile(x, 0.85), 60):
        X = np.column_stack([np.ones_like(x), x, np.clip(x - bp, 0, None)]); c, res, *_ = np.linalg.lstsq(X, y, rcond=None)
        sse = ((X @ c - y) ** 2).sum()
        if best is None or sse < best[0]: best = (sse, bp, c)
    return best
fig, ax = plt.subplots(1, 3, figsize=(17, 5))
cases = [(ok(d, "E14"), "P", "drainage_1m_mm", "E14: rain scale → drainage", "rain scale"),
         (ok(d, "E12")[lambda x: x.z == 20], "P", "irrigation_mm", "E12: rain scale → irrigation (sensor 20 cm)", "rain scale"),
         (ok(d, "E9"), "trig", "yield_Mg_ha", "E9: initial suction → season yield", "initial suction (log10 cm)")]
for a, (z, xk, yk, t, xl) in zip(ax, cases):
    x = np.log10(-z[xk].values) if xk == "trig" else z[xk].values; y = z[yk].values; m = np.isfinite(x) & np.isfinite(y)
    a.scatter(x[m], y[m], s=6, alpha=0.3, color=SKY); sse, bp, c = piecewise(x[m], y[m])
    xx = np.linspace(x[m].min(), x[m].max(), 100); a.plot(xx, c[0] + c[1] * xx + c[2] * np.clip(xx - bp, 0, None), color=RED, lw=2.4)
    a.axvline(bp, color=RED, ls=":"); a.text(bp, a.get_ylim()[1] * 0.95, f" breakpoint {bp:.2f}\n slopes {c[1]:.1f} → {c[1] + c[2]:.1f}", color=RED, fontsize=8.5, va="top")
    a.set_title(t, loc="left", fontsize=11); a.set_xlabel(xl); a.set_ylabel(yk.replace("_", " "))
fig.suptitle("Threshold detection: two-segment regressions reveal non-linear breakpoints", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FF, "40_Threshold_breakpoints", "Threshold detection", "Grid-search two-segment linear fits; red dotted line = breakpoint.", "E9,E12,E14")

# 41 ---- elasticities
def elast(z, xk, yk, logx=True):
    g = z.groupby(xk)[yk].mean().dropna(); g = g[(g > 0)]
    if len(g) < 3: return np.nan
    x = np.log(np.abs(g.index.values.astype(float))) if logx else g.index.values.astype(float)
    return np.polyfit(x, np.log(g.values), 1)[0]
drivers = [("Rain (E11)", ok(d, "E11"), "P", True), ("Temperature °C (E11, semi-el.)", ok(d, "E11"), "dT", False),
           ("Soil evap. factor (E11)", ok(d, "E11"), "Ep", True), ("Trigger suction (E12)", ok(d, "E12"), "trig", True),
           ("Sensor depth (E12)", ok(d, "E12"), "z", True), ("Mulch vapour factor (E14)", ok(d, "E14"), "vff", True),
           ("Interception cap. (E14)", ok(d, "E14"), "cap", True), ("Amount/event (E10)", ok(d, "E10"), "amt_mm", True),
           ("Rooting depth (E15)", ok(d, "E15"), "root", True), ("N rate (E13)", ok(d, "E13")[lambda x: x.wstrat == "W04_Surf300"], "Nrate", True)]
outs = [("irrigation_mm", "Irrigation"), ("drainage_1m_mm", "Drainage"), ("soil_evap_mm", "Soil evap."), ("transpiration_mm", "Transpiration"),
        ("yield_Mg_ha", "Yield"), ("N_leached_kg_ha", "N leaching")]
EL = pd.DataFrame([[elast(z, xk, yk, lg) for yk, _ in outs] for _, z, xk, lg in drivers], index=[n for n, *_ in drivers], columns=[o for _, o in outs])
EL.to_csv(os.path.join(OUT, "_elasticities.csv"))
fig, ax = plt.subplots(figsize=(12, 6.4)); lim = np.nanpercentile(np.abs(EL.values), 95)
im = ax.imshow(EL.values, cmap="RdBu_r", vmin=-lim, vmax=lim, aspect="auto")
for (r, c), v in np.ndenumerate(EL.values):
    if np.isfinite(v): ax.text(c, r, f"{v:+.2f}", ha="center", va="center", fontsize=9, color="white" if abs(v) > lim * 0.6 else "k")
ax.set_xticks(range(len(EL.columns))); ax.set_xticklabels(EL.columns); ax.set_yticks(range(len(EL))); ax.set_yticklabels(EL.index); ax.grid(False)
fig.colorbar(im, ax=ax, label="elasticity (d ln output / d ln driver)", pad=0.01)
ax.set_title("Elasticities: % change in each flux per 1 % change in each driver (temperature: per °C)", loc="left")
save(fig, FF, "41_Elasticity_matrix", "Elasticities", "Log-log slopes of factor-level means (temperature is a semi-elasticity per °C).", "E10-E15")

# 42 ---- two-way interaction plots
fig, ax = plt.subplots(1, 3, figsize=(17, 5))
for a, (z, xk, gk, yk, t, gl) in zip(ax, [(ok(d, "E11")[lambda x: x.P == 1], "dT", "Ep", "irrigation_mm", "Temperature × soil evaporation factor (E11)", "Ep"),
                                         (ok(d, "E12")[lambda x: x.z == 20], "trig", "P", "irrigation_mm", "Trigger × rain (E12, sensor 20 cm)", "rain"),
                                         (ok(d, "E14")[lambda x: x.cap == 2], "vff", "P", "irrigation_mm", "Mulch × rain (E14, capacity 2 mm)", "rain")]):
    lev = sorted(z[gk].unique()); cols = plt.cm.viridis(np.linspace(0, 0.95, len(lev)))
    for v, c in zip(lev, cols):
        q = z[z[gk] == v].groupby(xk)[yk].mean(); x = -q.index if xk == "trig" else q.index
        a.plot(x, q.values, "o-", ms=3, color=c, label=f"{gl} {v:g}")
    if xk == "trig": a.set_xscale("log")
    a.set_title(t, loc="left", fontsize=11); a.set_xlabel({"dT": "temperature shift (°C)", "trig": "trigger suction (cm)", "vff": "vapour flux factor"}[xk]); a.set_ylabel("irrigation (mm/yr)")
    a.legend(fontsize=7, ncol=2)
fig.suptitle("Two-way interactions: non-parallel lines = the effect of one driver depends on the other", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FF, "42_Two_way_interactions", "Two-way interaction plots", "Mean irrigation for each pair of drivers.", "E11,E12,E14")

# 43 ---- E8 intensity x moisture
e8 = ok(d, "E8")
fig, ax = plt.subplots(1, 3, figsize=(17, 5))
for a, k, cm in zip(ax[:2], ["yield_Mg_ha", "drainage_1m_mm"], ["YlGn", "Blues"]):
    p = e8.pivot_table(index="trig", columns="P", values=k).sort_index(ascending=False)
    im = a.imshow(p.values, aspect="auto", cmap=cm, origin="lower"); fig.colorbar(im, ax=a, pad=0.01)
    a.set_xticks(range(len(p.columns))); a.set_xticklabels([f"{c:g}" for c in p.columns]); a.set_yticks(range(len(p.index))); a.set_yticklabels([int(-v) for v in p.index]); a.grid(False)
    a.set_xlabel("rain scale"); a.set_ylabel("initial suction (cm)"); a.set_title(k.split("_")[0].capitalize() + " (mean over intensities)", loc="left")
g = e8.groupby("intensity")[["yield_Mg_ha", "drainage_1m_mm", "soil_evap_mm"]].mean()
g.index = [i.split("_")[1] for i in g.index]; x = np.arange(len(g))
ax[2].bar(x - 0.2, g.drainage_1m_mm, 0.4, color=NAVY, label="drainage"); ax[2].bar(x + 0.2, g.soil_evap_mm, 0.4, color="#C0A16B", label="soil evaporation")
a2 = ax[2].twinx(); a2.plot(x, g.yield_Mg_ha, "o-", color=GREEN, label="yield"); a2.set_ylabel("yield (Mg/ha)", color=GREEN); a2.grid(False)
ax[2].set_xticks(x); ax[2].set_xticklabels(g.index, rotation=45); ax[2].set_ylabel("mm per season"); ax[2].legend(fontsize=8.5, loc="upper left")
ax[2].set_title("Rain intensity (hours per rain day)", loc="left")
fig.suptitle("Rainfall amount × intensity × initial soil moisture, season 1985 (E8, coarse loam, rainfed)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FF, "43_E8_intensity_moisture", "Rain intensity × starting moisture", "Heatmaps averaged over intensity; right panel averaged over rain and moisture.", "E8")

# 44 ---- E9 soil x moisture x rain
e9 = ok(d, "E9")
fig, axs = plt.subplots(2, 5, figsize=(20, 7.6), sharex=True, sharey=True)
for a, s in zip(axs.flat, SOILS):
    p = e9[e9.soil == s].pivot_table(index="trig", columns="P", values="yield_Mg_ha").sort_index(ascending=False)
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="YlGn", vmin=0, vmax=e9.yield_Mg_ha.quantile(.98))
    a.set_title(SOIL_LAB[s], loc="left", fontsize=10.5); a.set_xticks(range(len(p.columns))); a.set_xticklabels([f"{c:g}" for c in p.columns], fontsize=7.5, rotation=60)
    a.set_yticks(range(len(p.index))); a.set_yticklabels([int(-v) for v in p.index], fontsize=8); a.grid(False)
for a in axs[1]: a.set_xlabel("rain scale")
for a in axs[:, 0]: a.set_ylabel("initial suction (cm)")
fig.colorbar(im, ax=axs, label="season yield (Mg DM/ha)", pad=0.01)
fig.suptitle("Soil texture × initial moisture × rainfall: spring-barley yield, season 1985 (E9, rainfed)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FF, "44_E9_soil_moisture_rain", "Soil × initial moisture × rain", "1,000 single-season runs.", "E9")

# 45 ---- feedback phase diagram
fig, ax = plt.subplots(1, 3, figsize=(17, 5.2), sharey=True)
for a, (rid, t) in zip(ax, [(f"E0_{L01}_Rainfed", "Rainfed"), (f"E2_{L01}_h300", "Irrigated −300 cm"), (f"E7_{L01}_vff0.1_cap4mm", "Irrigated + strong mulch")]):
    h = dlf(rid, "Daily-h.dlf"); sw = dlf(rid, "Daily-SWater.dlf"); m = (h.date >= "1994-04-01") & (h.date <= "1994-09-15")
    pf = np.log10(np.clip(-at_depth(h, "h @", -20.0), 1, None))[m.values]
    et = sw["Actual Evapotranspiration"].rolling(7, min_periods=1).mean().values[:len(h)][m.values]
    sc = a.scatter(pf, et, c=np.arange(len(pf)), cmap="plasma", s=14); a.plot(pf, et, color="#999", lw=0.6)
    a.axvline(np.log10(300), color=RED, ls=":"); a.set_title(t, loc="left"); a.set_xlabel("pF at 20 cm")
ax[0].set_ylabel("actual ET (mm/day, 7-day mean)"); fig.colorbar(sc, ax=ax, label="day (Apr→Sep 1994)", pad=0.01)
fig.suptitle("Feedback phase diagrams: soil water state vs atmospheric flux through one season (coarse loam)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FF, "45_Feedback_phase_diagram", "Feedback phase diagram", "Daily trajectories of pF at the sensor vs actual ET.", "E0,E2,E7 daily")

# ================================================================= G nitrogen
e13 = ok(d, "E13"); ws = sorted(e13.wstrat.dropna().unique())
fig, ax = plt.subplots(1, 3, figsize=(17, 5))
for w, c in zip(ws, plt.cm.tab10(np.linspace(0, 1, 10))):
    g = e13[e13.wstrat == w].groupby("Nrate")[["NLF", "PFPn_kg_kg", "yield_Mg_ha"]].mean()
    ax[0].plot(g.index, g.NLF * 100, "o-", color=c, label=w[4:]); ax[1].plot(g.index, g.PFPn_kg_kg, "o-", color=c); ax[2].plot(g.index, g.yield_Mg_ha, "o-", color=c)
for a, t in zip(ax, ["N leaching fraction (%)", "PFPn (kg DM/kg N)", "yield (Mg/ha)"]): a.set_xlabel("N rate (% of course rate)"); a.set_ylabel(t)
ax[0].legend(fontsize=8, ncol=2); fig.suptitle("N rate × water strategy, mean of 10 soils (E13)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FG, "46_E13_N_rate_water_strategy", "N rate × water strategy", "Means over soils for each of 10 water strategies.", "E13")

e6 = ok(d, "E6"); e6 = e6[e6.e6strat.notna()]; st = ["Full", "Deficit600", "Deficit1000", "Drip", "DripDeficit600"]
fig, ax = plt.subplots(1, 2, figsize=(15, 5)); x = np.arange(len(st)); w = 0.2
for i, (n, c) in enumerate(zip([100, 80, 60, 40], ["#1B4F72", "#2E86C1", "#85C1E9", "#D6EAF8"])):
    g = e6[e6.Nrate == n].groupby("e6strat")[["NLF", "yield_Mg_ha"]].agg(["mean", "std"]).reindex(st)
    ax[0].bar(x + (i - 1.5) * w, g[("NLF", "mean")] * 100, w, yerr=g[("NLF", "std")] * 100, color=c, ec=NAVY, capsize=2, label=f"N {n} %")
    ax[1].bar(x + (i - 1.5) * w, g[("yield_Mg_ha", "mean")], w, yerr=g[("yield_Mg_ha", "std")], color=c, ec=NAVY, capsize=2)
for a, t in zip(ax, ["N leaching fraction (%)", "yield (Mg/ha)"]): a.set_xticks(x); a.set_xticklabels(st); a.set_ylabel(t)
ax[0].legend(ncol=4, loc="upper center", bbox_to_anchor=(0.5, 1.12), fontsize=9); fig.subplots_adjust(top=0.8); fig.suptitle("Mediterranean pathways (Bologna 1994–2005): N rate × water strategy, mean ± SD over soils (E6)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FG, "47_E6_Mediterranean_pathways", "Mediterranean pathways", "Bars = means over 10 soils; whiskers = SD.", "E6")

nz = pd.concat([ok(d, "E6"), ok(d, "E13")]); nz = nz[(nz.drainage_1m_mm > 1)]; nz["c"] = nz.N_leached_kg_ha / nz.drainage_1m_mm * 100
fig, ax = plt.subplots(figsize=(12, 6))
for s in SOILS:
    q = nz[nz.soil == s]; ax.scatter(q.drainage_1m_mm, q.c.clip(lower=0.1), s=12, alpha=0.6, color=SOIL_COL[s], label=SOIL_LAB[s])
ax.set_xscale("log"); ax.set_yscale("log"); ax.axhline(11.3, color=RED, ls="--"); ax.text(nz.drainage_1m_mm.min() * 1.05, 12.8, "EU drinking-water limit (50 mg NO₃/L = 11.3 mg N/L)", color=RED, fontsize=9)
ax.set_xlabel("drainage below 1 m (mm/yr)"); ax.set_ylabel("drainage nitrate-N concentration (mg N/L)"); ax.legend(ncol=2, fontsize=8)
ax.set_title("Dilution vs flushing: drainage concentration against drainage volume (E6 + E13)", loc="left")
save(fig, FG, "48_Drainage_concentration", "Drainage nitrate concentration", "c = N leached / drainage × 100; log axes; dashed = EU nitrate limit.", "E6,E13")

# ================================================================= H synthesis
e16 = ok(d, "E16").copy(); f = e16.treatment
e16["Pb"] = f.str.contains("_P1.5_") | f.str.contains("CoolWet"); e16["Tb"] = f.str.contains("_T6_") | f.str.contains("HotDry") | f.str.contains("Extreme")
fig, ax = plt.subplots(1, 2, figsize=(19, 6.4), gridspec_kw={"width_ratios": [1.35, 1]})
data = [e16[e16.soil == s].yield_Mg_ha.values for s in SOILS]
bp = ax[0].boxplot(data, patch_artist=True, widths=0.6, medianprops=dict(color="k"))
for b_, s in zip(bp["boxes"], SOILS): b_.set_facecolor(SOIL_COL[s])
ax[0].set_xticklabels([SOIL_LAB[s].replace(" ", "\n") for s in SOILS], fontsize=9); ax[0].set_ylabel("yield (Mg/ha)")
ax[0].set_title("Yield range across 77 edge cases per soil (E16)", loc="left")
fact = e16[e16.case.str[1:].astype(int) <= 64].copy(); fact = fact.assign(
    rain=fact.treatment.str.contains("_P1.5_"), temp=fact.treatment.str.contains("_T6_"), trigger=fact.treatment.str.contains("_h2000_"),
    dose=fact.treatment.str.contains("_D30_"), N=fact.treatment.str.contains("_N150_"), Ep=fact.treatment.str.contains("_Ep1.2"))
rows = []
for k in ["rain", "temp", "trigger", "dose", "N", "Ep"]:
    for o in ["yield_Mg_ha", "irrigation_mm", "drainage_1m_mm", "N_leached_kg_ha"]:
        hi, lo = fact[fact[k]][o].mean(), fact[~fact[k]][o].mean(); rows.append((k, o, (hi - lo) / abs(fact[o].mean()) * 100))
T = pd.DataFrame(rows, columns=["factor", "out", "effect"]).pivot(index="factor", columns="out", values="effect")
T = T.loc[T.abs().max(axis=1).sort_values().index]; y = np.arange(len(T)); w = 0.2
labs = {"rain": "rain ×0.5 → ×1.5", "temp": "+2 → +6 °C", "trigger": "trigger −50 → −2000 cm", "dose": "dose 1.2 → 30 mm", "N": "N 25 → 150 %", "Ep": "EpFactor 0.3 → 1.2"}
for i, (o, c) in enumerate(zip(T.columns, [NAVY, "#E67E22", GREEN, RED])): ax[1].barh(y + (i - 1.5) * w, T[o], w, color=c, label=o.replace("_", " "))
ax[1].set_yticks(y); ax[1].set_yticklabels([labs[k] for k in T.index]); ax[1].axvline(0, color="#999"); ax[1].set_xlabel("main effect (% of mean)")
ax[1].legend(fontsize=8, loc="lower right"); ax[1].set_title("Tornado: main effects, 2⁶ factorial edge cases", loc="left")
fig.subplots_adjust(wspace=0.42)
save(fig, FH, "49_Edge_cases_and_tornado", "Edge-case robustness and factor ranking", "Left: 77 cases per soil; right: main effects (high − low level) from the 64-case factorial, as % of the mean.", "E16")

all_ = ok(d); all_ = all_[all_.irrigation_mm >= 20].dropna(subset=["IE_kg_m3", "DPF", "NLF"])
pts = all_[["IE_kg_m3", "DPF", "NLF"]].values; eff = np.ones(len(pts), bool)
for i in range(len(pts)):
    if eff[i]:
        dom = (pts[:, 0] >= pts[i, 0]) & (pts[:, 1] <= pts[i, 1]) & (pts[:, 2] <= pts[i, 2]) & ((pts[:, 0] > pts[i, 0]) | (pts[:, 1] < pts[i, 1]) | (pts[:, 2] < pts[i, 2]))
        if dom.any(): eff[i] = False
all_["pareto"] = eff; all_[all_.pareto].to_csv(os.path.join(OUT, "_pareto_runs.csv"), index=False)
fig, ax = plt.subplots(1, 2, figsize=(17, 6.4))
for s in SOILS:
    q = all_[all_.soil == s]; ax[0].scatter(q.DPF * 100, q.IE_kg_m3, s=6, alpha=0.35, color=SOIL_COL[s], label=SOIL_LAB[s])
p = all_[all_.pareto]; ax[0].scatter(p.DPF * 100, p.IE_kg_m3, s=40, facecolor="none", edgecolor="k", lw=1.2, label=f"Pareto-optimal ({len(p)})")
ax[0].set_xlabel("deep percolation fraction (%)"); ax[0].set_ylabel("IE (kg DM/m³)"); ax[0].legend(fontsize=7.5, ncol=2, markerscale=2)
ax[0].set_title(f"Trade-off space, {len(all_):,} irrigated runs", loc="left")
top = p.groupby("experiment").size().sort_values(); ax[1].barh([e.split("_")[0] for e in top.index], top.values, color=SKY)
for i, (e, v) in enumerate(top.items()): ax[1].text(v + 0.5, i, e.split("_", 1)[1].replace("_", " "), va="center", fontsize=8.5)
ax[1].set_xlim(0, top.max() * 1.9)
ax[1].set_xlabel("number of Pareto-optimal runs"); ax[1].set_title("Which experiments reach the front", loc="left")
fig.suptitle("Synthesis: maximise IE while minimising drainage and N-leaching fractions (3-objective Pareto front)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FH, "50_Pareto_tradeoff", "Trade-off (Pareto) front", "Non-dominated runs for (max IE, min DPF, min NLF), irrigation ≥ 20 mm/yr.", "All")

write_catalog("EFGH"); print("EFGH done", len(CATALOG), "pareto", int(eff.sum()))
