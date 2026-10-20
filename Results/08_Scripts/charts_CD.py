from common import *
from matplotlib.sankey import Sankey
from scipy.optimize import curve_fit

d = load_summary()
FC, FD = "01_Charts_50/C_Coupled_Water_Fluxes", "01_Charts_50/D_Irrigation_Control"
L01, S02 = SOILS[0], SOILS[1]

def daily_pack(rid):
    fw = dlf(rid, "Daily-FWater.dlf"); sw = dlf(rid, "Daily-SWater.dlf"); h = dlf(rid, "Daily-h.dlf")
    q = dlf(rid, "Daily-WaterFlux.dlf"); cp = dlf(rid, "Daily-CropProduction.dlf")
    out = fw[["date", "Precipitation", "Irrigation"]].copy()
    for c in ["Actual transpiration", "Evaporation of soil water", "Evaporation from canopy", "Evaporation from ponded water",
              "Surface runoff", "Reference evapotranspiration (dry)"]:
        out[c] = sw[c].values[:len(out)]
    out["h20"] = at_depth(h, "h @", -20.0)[:len(out)]
    qq = pd.Series(-at_depth(q, "q @", -100.0), index=q.date)
    out["drain"] = out.date.map(qq).fillna(0).values
    out["LAI"] = cp["LAI"].values[:len(out)]
    return out

# 14 ---- flux Sankey
fig = plt.figure(figsize=(15, 6.2))
for k, (s, lab) in enumerate([(L01, "Coarse loam"), (S02, "Coarse sand")]):
    r = d[(d.run_id == f"E2_{s}_h300")].iloc[0]
    ins = [r.rain_mm, r.irrigation_mm]; outs = [r.transpiration_mm, r.soil_evap_mm, r.canopy_evap_mm, r.other_evap_mm, r.drainage_1m_mm]
    resid = sum(ins) - sum(outs)
    ax = fig.add_subplot(1, 2, k + 1, xticks=[], yticks=[]); ax.axis("off")
    sk = Sankey(ax=ax, scale=1 / 900, offset=0.25, head_angle=120, format="%.0f", unit=" mm", gap=0.35)
    sk.add(flows=ins + [-v for v in outs] + ([-resid] if abs(resid) > 3 else []),
           labels=["rain", "irrigation", "transpiration", "soil evap.", "canopy evap.", "ponded/snow/litter evap.", "drainage 1 m"] +
           (["storage/runoff"] if abs(resid) > 3 else []),
           orientations=[1, -1, 0, 1, -1, 1, -1] + ([-1] if abs(resid) > 3 else []),
           pathlengths=[0.4, 0.4, 0.5, 0.35, 1.25, 0.85, 0.4] + ([0.7] if abs(resid) > 3 else []), fc="#DCEBF7", ec=NAVY)
    dg = sk.finish()
    for t in dg[0].texts: t.set_fontsize(9.5)
    ax.set_title(f"{lab} (E2, surface irrigation, −300 cm), mm/yr", loc="left", pad=26)
fig.suptitle("Coupled water fluxes: Sankey of the 20-year mean annual balance", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=14)
save(fig, FC, "14_Flux_Sankey_loam_sand", "Water-flux Sankey, loam vs sand", "Mean annual inputs (rain, irrigation) and outputs (T, E, interception, other evaporation, drainage) from E2 at the course trigger.", "E2")

# 15 ---- E/T split through the season with LAI
PK = {"rain": daily_pack(f"E0_{L01}_Rainfed"), "irr": daily_pack(f"E2_{L01}_h300"), "mulch": daily_pack(f"E7_{L01}_vff0.1_cap4mm")}
fig, ax = plt.subplots(3, 1, figsize=(14, 9), sharex=True)
for a, (k, lab) in zip(ax, [("rain", "Rainfed (E0)"), ("irr", "Irrigated, surface, −300 cm (E2)"), ("mulch", "Irrigated + strong mulch (E7, vff 0.1)")]):
    x = PK[k]; m = (x.date >= "1994-03-15") & (x.date <= "1994-09-30"); x = x[m]
    T, E = x["Actual transpiration"].rolling(7, min_periods=1).mean(), x["Evaporation of soil water"].rolling(7, min_periods=1).mean()
    a.stackplot(x.date, T, E, colors=[GREEN, "#C0A16B"], labels=["transpiration", "soil evaporation"], alpha=0.9)
    a2 = a.twinx(); a2.plot(x.date, x.LAI, color=NAVY, lw=2, label="LAI"); a2.set_ylabel("LAI", color=NAVY); a2.grid(False); a2.set_ylim(0, 7)
    sh = E.sum() / (E.sum() + T.sum()); a.set_title(f"{lab} — soil evaporation = {sh:.0%} of E+T", loc="left", fontsize=11)
    a.set_ylabel("mm/day (7-day mean)"); a.legend(loc="upper left", fontsize=8.5)
fig.suptitle("Evaporation–transpiration partitioning through the 1994 season (coarse loam)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FC, "15_E_T_partitioning_season", "Seasonal E/T partitioning", "Daily transpiration and soil evaporation (7-day means) with LAI, rainfed vs irrigated vs mulched.", "E0,E2,E7 daily")

# 16 ---- daily drainage vs rain, driest and wettest year
x = PK["irr"]; x["y"] = x.date.dt.year; ann = x.groupby("y").Precipitation.sum().loc[1981:1999]
dry, wet = ann.idxmin(), ann.idxmax()
fig, ax = plt.subplots(2, 1, figsize=(14, 7.5), sharey=True)
for a, yr in zip(ax, [dry, wet]):
    z = x[x.y == yr]; a.bar(z.date, z.Precipitation, color=SKY, width=1, label="rain"); a.bar(z.date, z.Irrigation, color="#E67E22", width=1, bottom=z.Precipitation, label="irrigation")
    a2 = a.twinx(); a2.fill_between(z.date, 0, z.drain, color=NAVY, alpha=0.55, label="drainage at 1 m"); a2.set_ylabel("drainage (mm/day)", color=NAVY)
    a2.grid(False); a2.set_ylim(0, max(1, x.drain.max()) * 1.05); a2.invert_yaxis()
    a.set_title(f"{yr}: {ann[yr]:.0f} mm rain, {z.drain.sum():.0f} mm drainage, {z.Irrigation.sum():.0f} mm irrigation", loc="left", fontsize=11)
    a.set_ylabel("rain + irrigation (mm/day)"); a.legend(loc="upper left", fontsize=8.5)
fig.suptitle(f"Rain pulses and drainage response at 1 m: driest ({dry}) vs wettest ({wet}) year, coarse loam, E2 −300 cm", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=12.5)
save(fig, FC, "16_Daily_drainage_vs_rain", "Daily drainage vs rain events", "Daily rain and irrigation (bars, top) and drainage at 1 m (shaded, inverted) in the driest and wettest years.", "E2 daily")

# 17 ---- cumulative fluxes by method
fig, ax = plt.subplots(1, 3, figsize=(15, 4.8), sharex=True)
for m, c in [("M01_Overhead", METH_COL["Overhead"]), ("M02_Surface", METH_COL["Surface"]), ("M04_Drip10-20cm", METH_COL["Drip"]), ("M10_Drip50-60cm", "#145A32")]:
    z = daily_pack(f"E4_{L01}_{m}")
    for a, k in zip(ax, ["Irrigation", "drain", "Evaporation from canopy"]): a.plot(z.date, z[k].cumsum(), color=c, lw=2, label=m[4:])
for a, t in zip(ax, ["Cumulative irrigation", "Cumulative drainage below 1 m", "Cumulative canopy evaporation"]):
    a.set_title(t, loc="left", fontsize=11); a.set_ylabel("mm")
ax[0].legend(fontsize=8.5); fig.suptitle("20-year cumulative fluxes by irrigation method (coarse loam, E4)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FC, "17_Cumulative_fluxes_by_method", "Cumulative fluxes by method", "Cumulative irrigation, drainage and canopy evaporation 1980–2000 for four methods.", "E4 daily")

# 18 ---- water partitioning by method x soil
e4 = ok(d, "E4"); meths = sorted(e4.method.unique())
fig, axs = plt.subplots(2, 5, figsize=(20, 8), sharey=True); comps = [("transpiration_mm", GREEN), ("soil_evap_mm", "#C0A16B"),
                                                                      ("canopy_evap_mm", SKY), ("other_evap_mm", "#B8C4CE"), ("drainage_1m_mm", NAVY)]
for a, s in zip(axs.flat, SOILS):
    z = e4[e4.soil == s].set_index("method").reindex(meths); btm = np.zeros(len(meths))
    for k, c in comps:
        v = z[k].fillna(0).clip(lower=0).values; a.bar(range(len(meths)), v, bottom=btm, color=c, width=0.8); btm += v
    a.plot(range(len(meths)), z.irrigation_mm, "k.", ms=7)
    a.set_title(SOIL_LAB[s], loc="left", fontsize=10.5); a.set_xticks(range(len(meths)))
    a.set_xticklabels([m[4:].replace("Drip", "D").replace("cm", "") for m in meths], rotation=70, fontsize=7.5)
    miss = z.transpiration_mm.isna()
    for i in np.where(miss)[0]: a.text(i, 30, "✗", color=RED, ha="center", fontsize=12)
axs[0, 0].set_ylabel("mm/yr"); axs[1, 0].set_ylabel("mm/yr")
from matplotlib.patches import Patch
fig.legend([Patch(color=c) for _, c in comps] + [plt.Line2D([], [], color="k", marker=".", ls="")],
           ["transpiration", "soil evap.", "canopy evap.", "ponded/snow/litter evap.", "drainage 1 m", "irrigation"], ncol=6, loc="lower center")
fig.suptitle("Water partitioning by irrigation method for every soil (E4; ✗ = solver failure excluded)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
fig.subplots_adjust(bottom=0.16, hspace=0.45)
save(fig, FC, "18_Partitioning_method_x_soil", "Partitioning by method × soil", "Stacked mean annual fluxes for 10 methods in all 10 soils; dots = irrigation.", "E4")

# 19 ---- drip depth vs drainage fraction and soil evaporation
drip = e4[e4.method.str.contains("Drip")].copy()
drip["mid"] = drip.method.str.extract(r"Drip(\d+)-(\d+)").astype(float).mean(axis=1)
fig, ax = plt.subplots(1, 3, figsize=(15, 4.8))
for s in SOILS:
    z = drip[drip.soil == s].sort_values("mid")
    ax[0].plot(z.mid, z.DPF * 100, "o-", color=SOIL_COL[s], label=SOIL_LAB[s]); ax[1].plot(z.mid, z.soil_evap_mm, "o-", color=SOIL_COL[s])
e15 = ok(d, "E15"); e15d = e15[e15.method.str.contains("Drip", na=False)].copy()
e15d["mid"] = e15d.method.str.extract(r"Drip(\d+)-(\d+)").astype(float).mean(axis=1)
p = e15d.groupby(["mid", "root"]).DPF.mean().unstack()
for rd in [30, 60, 90, 150]:
    ax[2].plot(p.index, p[rd] * 100, "o-", label=f"rooting {rd} cm", color=plt.cm.viridis(rd / 180))
ax[0].set_ylabel("drainage fraction (%)"); ax[1].set_ylabel("soil evaporation (mm/yr)"); ax[2].set_ylabel("drainage fraction (%)")
for a in ax: a.set_xlabel("drip depth, box centre (cm)")
ax[0].set_title("Drip depth → drainage (E4)", loc="left"); ax[1].set_title("Drip depth → soil evaporation (E4)", loc="left")
ax[2].set_title("Drip depth × rooting depth (E15, loam)", loc="left"); ax[0].legend(fontsize=7.5, ncol=2); ax[2].legend(fontsize=8.5)
save(fig, FC, "19_Drip_depth_drainage_evap", "Drip depth vs drainage and evaporation", "E4 lines per soil; E15 averaged over the 10 amounts per rooting depth.", "E4,E15")

# 20 ---- E15 faceted heatmaps IE
fig, axs = plt.subplots(2, 5, figsize=(20, 8), sharex=True, sharey=True); ms = sorted(e15.method.unique())
vmin, vmax = e15.IE_kg_m3.quantile(0.02), e15.IE_kg_m3.quantile(0.98)
for a, m in zip(axs.flat, ms):
    p = e15[e15.method == m].pivot_table(index="root", columns="amt_mm", values="IE_kg_m3")
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="viridis", vmin=vmin, vmax=vmax)
    a.set_title(m[4:], loc="left", fontsize=10.5); a.set_xticks(range(len(p.columns))); a.set_xticklabels([f"{v:g}" for v in p.columns], fontsize=7.5, rotation=60)
    a.set_yticks(range(len(p.index))); a.set_yticklabels([int(v) for v in p.index], fontsize=8); a.grid(False)
for a in axs[1]: a.set_xlabel("mm per event")
for a in axs[:, 0]: a.set_ylabel("max rooting depth (cm)")
fig.colorbar(im, ax=axs, label="IE (kg DM/m³)", pad=0.01)
fig.suptitle("Irrigation efficiency: method × rooting depth × amount (E15, coarse loam)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FC, "20_E15_method_depth_amount_IE", "Method × rooting depth × amount", "IE for 1,000 runs; each panel one application method.", "E15")

# 21 ---- annual drainage vs annual rain
fig, ax = plt.subplots(1, 2, figsize=(14, 5.4))
for s in SOILS:
    py = per_year(f"E0_{s}_Rainfed"); ax[0].scatter(py.P, py.D, s=18, color=SOIL_COL[s], label=SOIL_LAB[s])
    b = np.polyfit(py.P, py.D, 1); xx = np.linspace(py.P.min(), py.P.max(), 10); ax[0].plot(xx, np.polyval(b, xx), color=SOIL_COL[s], lw=1)
for s, lab in [(L01, "Coarse loam"), (S02, "Coarse sand")]:
    py = per_year(f"E2_{s}_h300"); ax[1].scatter(py.P + py.I, py.D, s=26, color=SOIL_COL[s], label=lab)
    b = np.polyfit(py.P + py.I, py.D, 1); xx = np.linspace((py.P + py.I).min(), (py.P + py.I).max(), 10)
    ax[1].plot(xx, np.polyval(b, xx), color=SOIL_COL[s]); ax[1].text(xx[-1], np.polyval(b, xx[-1]), f" slope {b[0]:.2f}", color=SOIL_COL[s])
ax[0].set_xlabel("annual rain (mm)"); ax[0].set_ylabel("annual drainage below 1 m (mm)"); ax[0].set_title("Rainfed, every year × soil (E0)", loc="left")
ax[1].set_xlabel("annual rain + irrigation (mm)"); ax[1].set_title("Irrigated at −300 cm (E2)", loc="left"); ax[0].legend(fontsize=7.5, ncol=2); ax[1].legend()
save(fig, FC, "21_Annual_drainage_vs_rain", "Annual drainage vs water input", "One point per year; lines = linear fits per soil.", "E0,E2 per year")

# 22 ---- profile pressure-head evolution
fig, ax = plt.subplots(2, 1, figsize=(14, 7.5), sharex=True)
for a, (s, lab) in zip(ax, [(L01, "Coarse loam"), (S02, "Coarse sand")]):
    h = dlf(f"E2_{s}_h300", "Daily-h.dlf"); m = (h.date >= "1994-03-01") & (h.date <= "1994-10-31"); h = h[m]
    cols, z = profile_cols(h, "h @"); sel = z >= -150
    v = np.log10(np.clip(-h[np.array(cols)[sel]].values, 1, None)).T
    im = a.pcolormesh(h.date, z[sel], v, cmap="RdYlBu_r", vmin=1, vmax=4.3, shading="auto")
    a.contour(h.date, z[sel], v, levels=[np.log10(300)], colors="k", linewidths=1)
    a.axhline(-20, color="white", ls="--", lw=1); a.set_ylabel("depth (cm)"); a.set_title(f"{lab}: pF through the 1994 season (black contour = −300 cm trigger)", loc="left", fontsize=11)
fig.colorbar(im, ax=ax, label="pF = log₁₀ suction", pad=0.01)
save(fig, FC, "22_Profile_pF_heatmap_1994", "Profile pressure-head evolution", "Depth × date pF with the trigger iso-line; dashed line = sensor depth.", "E2 daily")

# 23 ---- year-to-year variability
trigs = ["h50", "h100", "h300", "h500", "h600", "h1000", "h3000", "h5000", "h10000"]
fig, ax = plt.subplots(2, 3, figsize=(16, 8))
for row, (runs, labs, name) in enumerate([([f"E2_{L01}_{t}" for t in trigs], [t.replace("h", "−") for t in trigs], "trigger (cm)"),
                                          ([f"E4_{L01}_{m}" for m in meths], [m[4:].replace("Drip", "D").replace("cm", "") for m in meths], "method")]):
    P = [per_year(r) for r in runs]
    for a, k, t in zip(ax[row], ["yield_", "I", "D"], ["yield (Mg/ha)", "irrigation (mm)", "drainage (mm)"]):
        bp = a.boxplot([p[k] for p in P], patch_artist=True, widths=0.6, medianprops=dict(color="k"))
        for b_, c in zip(bp["boxes"], plt.cm.viridis(np.linspace(0.15, 0.9, len(P)))): b_.set_facecolor(c)
        a.set_xticklabels(labs, rotation=60, fontsize=8); a.set_ylabel(t); a.set_title(f"{t.split(' (')[0].capitalize()} by {name}", loc="left", fontsize=11)
fig.suptitle("Year-to-year variability over 20 harvests (coarse loam; E2 triggers, E4 methods)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
fig.tight_layout()
save(fig, FC, "23_Interannual_variability", "Year-to-year variability", "Boxplots across the 20 harvest years for each trigger and method.", "E2,E4 per year")

# ================================================================= D: irrigation control
# 24 ---- sensor suction time series (widget)
fig, ax = plt.subplots(2, 1, figsize=(14, 7.5), sharex=True)
for a, (s, lab) in zip(ax, [(L01, "Coarse loam"), (S02, "Coarse sand")]):
    for rid, c, l in [(f"E0_{s}_Rainfed", METH_COL["Rainfed"], "rainfed"), (f"E2_{s}_h300", METH_COL["Surface"], "irrigated −300 cm")]:
        z = daily_pack(rid); m = (z.date >= "1994-04-01") & (z.date <= "1994-09-30"); z = z[m]
        a.semilogy(z.date, np.clip(-z.h20, 1, None), color=c, lw=2, label=l)
        if "E2" in rid: a.bar(z.date, np.where(z.Irrigation > 0, 20, np.nan), bottom=10, width=1, color="#E67E22", alpha=0.35, label="irrigation day")
    a.axhline(300, color=RED, ls="--", lw=1.6, label="trigger 300 cm"); a.set_ylabel("suction at 20 cm (cm)"); a.set_ylim(10, 3e4)
    a.set_title(lab, loc="left"); a.legend(ncol=4, fontsize=8.5, loc="upper left")
fig.suptitle("The tensiometer signal that switches irrigation, 1994 season", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FD, "24_Sensor_suction_1994", "Sensor suction time series", "Daily suction at 20 cm (log) with the trigger and irrigation days.", "E0,E2 daily")

# 25 ---- trigger response
e2 = ok(d, "E2")
fig, ax = plt.subplots(1, 3, figsize=(16, 4.8))
for s in SOILS:
    z = e2[e2.soil == s].sort_values("trig")
    for a, k in zip(ax, ["irrigation_mm", "yield_Mg_ha", "IE_kg_m3"]): a.plot(-z.trig, z[k], "o-", ms=3.5, color=SOIL_COL[s], label=SOIL_LAB[s])
for a, t in zip(ax, ["irrigation (mm/yr)", "yield (Mg DM/ha)", "IE (kg/m³)"]):
    a.set_xscale("log"); a.set_xlabel("trigger suction (cm, log)"); a.set_ylabel(t); a.axvline(300, color=RED, ls=":")
ax[0].legend(fontsize=7.5, ncol=2); fig.suptitle("Trigger threshold response for 10 soils (E2)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FD, "25_Trigger_response", "Trigger pressure response", "Irrigation, yield and IE vs trigger for each soil.", "E2")

# 26 ---- sensor depth response
e3 = ok(d, "E3")
fig, ax = plt.subplots(1, 3, figsize=(16, 4.8))
for s in SOILS:
    z = e3[e3.soil == s].sort_values("z")
    for a, k in zip(ax, ["irrigation_events", "irrigation_mm", "IE_kg_m3"]): a.plot(z.z, z[k], "o-", ms=3.5, color=SOIL_COL[s], label=SOIL_LAB[s])
for a, t in zip(ax, ["irrigation events (20 yr)", "irrigation (mm/yr)", "IE (kg/m³)"]): a.set_xlabel("sensor depth (cm)"); a.set_ylabel(t)
ax[0].legend(fontsize=7.5, ncol=2); fig.suptitle("Sensor installation depth response (E3, trigger −300 cm)", x=0.02, ha="left", color=NAVY, weight="bold")
save(fig, FD, "26_Sensor_depth_response", "Sensor depth response", "Events, irrigation and IE vs sensor depth per soil.", "E3")

# 27 ---- E12 faceted heatmaps
e12 = ok(d, "E12")
fig, axs = plt.subplots(2, 5, figsize=(20, 8), sharex=True, sharey=True)
vmin, vmax = e12.irrigation_mm.min(), e12.irrigation_mm.max()
for a, P in zip(axs.flat, sorted(e12.P.unique())):
    p = e12[e12.P == P].pivot_table(index="z", columns="trig", values="irrigation_mm")
    p = p[sorted(p.columns, reverse=True)]
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="YlOrRd", vmin=vmin, vmax=vmax)
    cs = a.contour(p.values, levels=[100, 200, 300], colors="k", linewidths=0.7); a.clabel(cs, fontsize=7, fmt="%d")
    a.set_title(f"rain × {P:g}", loc="left", fontsize=10.5); a.set_xticks(range(len(p.columns))); a.set_xticklabels([int(-c) for c in p.columns], rotation=70, fontsize=7.5)
    a.set_yticks(range(len(p.index))); a.set_yticklabels([int(v) for v in p.index], fontsize=8); a.grid(False)
for a in axs[1]: a.set_xlabel("trigger suction (cm)")
for a in axs[:, 0]: a.set_ylabel("sensor depth (cm)")
fig.colorbar(im, ax=axs, label="irrigation (mm/yr)", pad=0.01)
fig.suptitle("Sensor depth × trigger × rainfall: irrigation demand (E12, coarse loam; contours 100/200/300 mm)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FD, "27_E12_depth_trigger_rain", "Sensor depth × trigger × rain", "1,000 runs; each panel one rainfall scaling.", "E12")

# 28 ---- E1 dose x duration
e1 = ok(d, "E1")
fig, axs = plt.subplots(2, 10, figsize=(24, 6.2), sharex=True, sharey=True)
for j, s in enumerate(SOILS):
    for i, (k, cm) in enumerate([("IE_kg_m3", "viridis"), ("DPF", "Blues")]):
        p = e1[e1.soil == s].pivot_table(index="dose_mm", columns="dur_h", values=k)
        a = axs[i, j]; lim = (e1[k].quantile(.02), e1[k].quantile(.98))
        im = a.imshow(p.values, origin="lower", aspect="auto", cmap=cm, vmin=lim[0], vmax=lim[1])
        for (r, c), v in np.ndenumerate(p.values):
            if np.isfinite(v): a.text(c, r, f"{v:.2f}" if k == "IE_kg_m3" else f"{v*100:.0f}", ha="center", va="center", fontsize=6.5)
        a.set_xticks(range(len(p.columns))); a.set_xticklabels([int(c) for c in p.columns], fontsize=7); a.set_yticks(range(len(p.index)))
        a.set_yticklabels([f"{v:g}" for v in p.index], fontsize=7); a.grid(False)
        if i == 0: a.set_title(SOIL_LAB[s], fontsize=9.5, loc="left")
axs[0, 0].set_ylabel("IE (kg/m³)\ndose (mm)"); axs[1, 0].set_ylabel("DPF (%)\ndose (mm)")
for a in axs[1]: a.set_xlabel("duration (h)", fontsize=8)
fig.suptitle("Irrigation dose × duration: efficiency (top) and drainage fraction (bottom), all soils (E1)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FD, "28_E1_dose_duration", "Dose × duration", "IE and DPF per soil for 4 doses × 5 durations.", "E1")

# 29 ---- E10 amount x window
e10 = ok(d, "E10"); wins = sorted(e10.window.dropna().unique())
fig, axs = plt.subplots(2, 5, figsize=(20, 8.4), sharex=True, sharey=True)
vmin, vmax = e10.IE_kg_m3.quantile(.02), e10.IE_kg_m3.quantile(.98)
for a, s in zip(axs.flat, SOILS):
    p = e10[e10.soil == s].pivot_table(index="amt_mm", columns="window", values="IE_kg_m3").reindex(columns=wins)
    im = a.imshow(p.values, origin="lower", aspect="auto", cmap="viridis", vmin=vmin, vmax=vmax)
    a.set_title(SOIL_LAB[s], loc="left", fontsize=10.5); a.set_xticks(range(len(wins))); a.set_xticklabels([w[4:] for w in wins], rotation=90, fontsize=7)
    a.set_yticks(range(len(p.index))); a.set_yticklabels([f"{v:g}" for v in p.index], fontsize=8); a.grid(False)
for a in axs[:, 0]: a.set_ylabel("mm per event")
fig.colorbar(im, ax=axs, label="IE (kg DM/m³)", pad=0.01)
fig.suptitle("Irrigation amount × timing window, all soils (E10; blank = solver failure)", x=0.02, ha="left", color=NAVY, weight="bold", fontsize=13)
save(fig, FD, "29_E10_amount_timing", "Amount × timing window", "IE per soil; x = irrigation window, y = amount per event.", "E10")

# 30 ---- irrigation production function
irr = pd.concat([ok(d, e) for e in ["E1", "E2", "E3", "E4", "E10"]]); irr = irr[irr.irrigation_mm > 0]
fig, ax = plt.subplots(figsize=(13, 6.2))
f = lambda I, y0, a, b: y0 + a * (1 - np.exp(-I / b)); rows = []
for s in SOILS:
    z = irr[irr.soil == s]; y0 = ok(d, "E0").set_index("soil").yield_Mg_ha[s]
    ax.scatter(z.irrigation_mm, z.yield_Mg_ha, s=10, alpha=0.45, color=SOIL_COL[s])
    try:
        pp, _ = curve_fit(lambda I, a, b: f(I, y0, a, b), z.irrigation_mm, z.yield_Mg_ha, p0=[4, 100], maxfev=20000)
        xx = np.linspace(0, z.irrigation_mm.max(), 100); ax.plot(xx, f(xx, y0, *pp), color=SOIL_COL[s], lw=2.2, label=f"{SOIL_LAB[s]}: +{pp[0]:.1f} Mg/ha, b={pp[1]:.0f} mm")
        rows.append((s, y0, *pp))
    except RuntimeError:
        pass
ax.set_xlabel("irrigation (mm/yr)"); ax.set_ylabel("yield (Mg DM/ha)"); ax.legend(fontsize=8, ncol=2, loc="lower right")
ax.set_title("Irrigation production functions (E1–E4, E10): y = y₀ + a(1 − e^(−I/b)); b = irrigation giving 63 % of the gain", loc="left", fontsize=11.5)
save(fig, FD, "30_Irrigation_production_function", "Irrigation production function", "All irrigated runs; saturating fits anchored at each soil's rainfed yield.", "E1-E4,E10")
pd.DataFrame(rows, columns=["soil", "y0", "a_gain", "b_mm"]).to_csv(os.path.join(OUT, "_production_function_fits.csv"), index=False)

# 31 ---- irrigation events per year by trigger
ev = {}
for t in trigs:
    z = daily_pack(f"E2_{L01}_{t}"); z["y"] = z.date.dt.year; on = (z.Irrigation > 0) & (z.Irrigation.shift(1).fillna(0) == 0)
    ev[t.replace("h", "−")] = z[on].groupby("y").size().reindex(range(1980, 2000), fill_value=0)
E = pd.DataFrame(ev).T
fig, ax = plt.subplots(figsize=(14, 4.8)); im = ax.imshow(E.values, aspect="auto", cmap="magma_r")
for (r, c), v in np.ndenumerate(E.values): ax.text(c, r, int(v), ha="center", va="center", fontsize=7.5, color="white" if v > E.values.max() * 0.6 else "k")
ax.set_xticks(range(20)); ax.set_xticklabels(E.columns, rotation=60); ax.set_yticks(range(len(E))); ax.set_yticklabels(E.index); ax.grid(False)
ax.set_ylabel("trigger (cm)"); fig.colorbar(im, ax=ax, label="irrigation events", pad=0.01)
ax.set_title("Irrigation events per year for each trigger (coarse loam, E2)", loc="left")
save(fig, FD, "31_Events_per_year_by_trigger", "Irrigation events per year", "Number of irrigation starts per calendar year.", "E2 daily")

write_catalog("CD"); print("CD done", len(CATALOG))
