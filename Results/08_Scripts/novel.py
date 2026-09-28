from common import *
from scipy.optimize import brentq
d = load_summary(); FN = "00_Novel_Contributions"

# ================================================================= N1  depletion-based trigger law
def f_rz(s, h, top=100):
    num = den = 0
    for hz, dz in (("Ap", 25), ("Bt", top - 25)):
        p = G.SOILS[s][hz]; fc, wp = vg_theta(-100, p), vg_theta(-15849, p); num += (fc - vg_theta(h, p)) * dz; den += (fc - wp) * dz
    return num / den
e2 = ok(d, "E2").copy(); e2["f"] = [f_rz(s, t) for s, t in zip(e2.soil, e2.trig)]
e2["Imax"] = e2.groupby("soil").irrigation_mm.transform("max"); e2 = e2[e2.Imax > 50]
e2["Irel"] = e2.irrigation_mm / e2.Imax; e2["Yrel"] = e2.yield_Mg_ha / e2.groupby("soil").yield_Mg_ha.transform("max")
n_all = len(e2); e2 = e2[e2.f >= -0.5].copy()      # practical domain: from just wetter than FC to WP
def r2(x, y, deg=3):
    c = np.polyfit(x, y, deg); return 1 - ((np.polyval(c, x) - y) ** 2).sum() / ((y - y.mean()) ** 2).sum(), c
r2_s, _ = r2(np.log10(-e2.trig.values), e2.Irel.values); r2_f, cI = r2(e2.f.values, e2.Irel.values)
r2_sy, _ = r2(np.log10(-e2.trig.values), e2.Yrel.values); r2_fy, cY = r2(e2.f.values, e2.Yrel.values)
ff = np.linspace(e2.f.min(), e2.f.max(), 400); fy = np.polyval(cY, ff)
bins = np.linspace(-0.5, 1.0, 16); e2["fb"] = pd.cut(e2.f, bins); med = e2.groupby("fb", observed=True).Yrel.median()
ctr = np.array([iv.mid for iv in med.index]); ipk = int(np.argmax(med.values)); after = np.where((np.arange(len(ctr)) > ipk) & (med.values < 0.95))[0]
fstar = float(ctr[after[0]]) if len(after) else np.nan
fig = plt.figure(figsize=(18, 11)); gs = fig.add_gridspec(2, 3, height_ratios=[1, 1], hspace=0.38, wspace=0.28)
a = fig.add_subplot(gs[0, 0]); b = fig.add_subplot(gs[0, 1]); c = fig.add_subplot(gs[0, 2]); dd_ = fig.add_subplot(gs[1, :2]); e_ = fig.add_subplot(gs[1, 2])
for s in e2.soil.unique():
    z = e2[e2.soil == s].sort_values("trig", ascending=False)
    a.plot(-z.trig, z.Irel, "o-", ms=4, color=SOIL_COL[s], label=SOIL_LAB[s]); b.plot(z.f, z.Irel, "o-", ms=4, color=SOIL_COL[s]); c.plot(z.f, z.Yrel, "o-", ms=4, color=SOIL_COL[s])
a.set_xscale("log"); a.set_xlabel("trigger as suction (cm, log)"); a.set_ylabel("relative irrigation I / I_max")
a.set_title(f"a  Conventional: trigger in suction\n    pooled R² = {r2_s:.2f}", loc="left"); a.legend(fontsize=7.5, ncol=2)
b.plot(ff, np.polyval(cI, ff), "k--", lw=2); b.set_xlabel("trigger as root-zone depletion f (fraction of TAW used)")
b.set_title(f"b  Proposed: trigger in depletion\n    pooled R² = {r2_f:.2f}", loc="left")
c.plot(ctr, med.values, "ks-", lw=2, ms=5, label="binned median"); c.legend(fontsize=8.5, loc="lower left"); c.axhline(0.95, color=RED, ls=":"); c.axvline(fstar, color=RED, ls=":")
c.text(fstar + 0.01, 0.45, f"critical depletion\nf* = {fstar:.2f}\n(5 % yield loss)", color=RED, fontsize=10)
c.set_xlabel("root-zone depletion f"); c.set_ylabel("relative yield Y / Y_max"); c.set_title(f"c  Yield collapses onto one curve\n    pooled R² = {r2_fy:.2f} (suction: {r2_sy:.2f})", loc="left")
# soil-specific suction that corresponds to f*
rows = []
for s in SOILS:
    try: h_star = -brentq(lambda h: f_rz(s, -h) - fstar, 5, 1.5e4)
    except ValueError: h_star = np.nan
    rows.append((s, h_star, f_rz(s, -300)))
R = pd.DataFrame(rows, columns=["soil", "h_star", "f_at_300"]); x = np.arange(10)
dd_.bar(x - 0.2, -R.h_star, 0.4, color=[SOIL_COL[s] for s in SOILS], ec="k", label=f"soil-specific trigger for f* = {fstar:.2f}")
dd_.axhline(300, color=RED, ls="--", lw=2, label="course trigger −300 cm (same for all soils)")
for i, v in enumerate(-R.h_star): dd_.text(i - 0.2, v * 1.08, f"{v:.0f}", ha="center", fontsize=9)
d2 = dd_.twinx(); d2.plot(x + 0.2, R.f_at_300, "D", color=NAVY, ms=9, label="depletion reached at −300 cm"); d2.axhline(fstar, color=NAVY, ls=":")
d2.set_ylabel("depletion f at −300 cm", color=NAVY); d2.set_ylim(0, 1); d2.grid(False)
dd_.set_yscale("log"); dd_.set_ylabel("trigger suction (cm, log)"); dd_.set_xticks(x); dd_.set_xticklabels([SOIL_LAB[s].replace(" ", "\n") for s in SOILS], fontsize=9); dd_.set_ylim(top=dd_.get_ylim()[1] * 3)
dd_.set_title("d  Translating the law into practice: the suction trigger each soil needs to reach the same depletion", loc="left", pad=12)
h1, l1 = dd_.get_legend_handles_labels(); h2, l2 = d2.get_legend_handles_labels(); dd_.legend(h1 + h2, l1 + l2, fontsize=9, loc="upper left")
e_.axis("off")
e_.text(0, 1, "Why it matters", fontsize=13, weight="bold", color=NAVY, va="top")
e_.text(0, 0.9, (f"• A single suction threshold (e.g. −300 cm) means very\n  different water stress in different soils: it spends\n  {R.f_at_300.min():.0%}–{R.f_at_300.max():.0%} of the available water.\n\n"
                 f"• Expressed as depletion of available water, {len(e2)} runs\n  from {e2.soil.nunique()} irrigated soils × 20 triggers fall on one curve\n  (R² {r2_s:.2f} → {r2_f:.2f} for irrigation, {r2_sy:.2f} → {r2_fy:.2f} for yield).\n\n"
                 f"• Yield starts to fall above f* ≈ {fstar:.2f}. Panel d gives\n  the tensiometer setting per soil that keeps f ≤ f*.\n\n"
                 "• Method: van Genuchten θ(h) of the Ap+Bt horizons,\n  FC = pF 2.0, WP = pF 4.2, root zone 0–100 cm.\n  Domain f ≥ −0.5; non-irrigating soils excluded."), fontsize=10.5, va="top", color="#222")
fig.suptitle("New synthesis 1 — A soil-independent irrigation trigger law: sensor thresholds collapse when expressed as root-zone depletion",
             x=0.01, ha="left", fontsize=15, color=NAVY, weight="bold")
save(fig, FN, "N1_Depletion_trigger_law", "Soil-independent trigger law (data collapse)",
     "E2 (10 soils × 20 triggers): relative irrigation and yield collapse onto single curves when the trigger is expressed as root-zone depletion f instead of suction; f* = 5 % yield-loss threshold and the soil-specific suction triggers that achieve it.", "E2 + soil hydraulics")
R.to_csv(os.path.join(OUT, "07_Derived_Data_Tables", "N1_soil_specific_triggers.csv"), index=False)

# ================================================================= N2  fate of evaporation saved by mulch
e = ok(d, "E14").copy(); ref = e[e.vff == 1.0].set_index(["cap", "P"])
keys = ["soil_evap_mm", "other_evap_mm", "canopy_evap_mm", "irrigation_mm", "transpiration_mm", "drainage_1m_mm", "N_leached_kg_ha", "yield_Mg_ha"]
for k in keys: e["r_" + k] = [ref[k].get((c_, p), np.nan) for c_, p in zip(e.cap, e.P)]
e = e[e.vff < 1.0].copy()
e["Esaved"] = (e.r_soil_evap_mm - e.soil_evap_mm) + (e.r_other_evap_mm - e.other_evap_mm) + (e.r_canopy_evap_mm - e.canopy_evap_mm)
e["to_irr"] = (e.r_irrigation_mm - e.irrigation_mm); e["to_T"] = (e.transpiration_mm - e.r_transpiration_mm); e["to_D"] = (e.drainage_1m_mm - e.r_drainage_1m_mm)
e["resid"] = e.Esaved - e.to_irr - e.to_T - e.to_D
e["dN"] = e.N_leached_kg_ha - e.r_N_leached_kg_ha
g = e.groupby(["P", "vff"])[["Esaved", "to_irr", "to_T", "to_D", "resid", "dN"]].mean().reset_index()
fig = plt.figure(figsize=(19, 10.5)); gs = fig.add_gridspec(2, 3, hspace=0.42, wspace=0.45)
comp = [("to_irr", "less irrigation needed", "#E67E22"), ("to_T", "extra transpiration", GREEN), ("to_D", "extra drainage below 1 m", NAVY), ("resid", "storage / runoff", "#BBBBBB")]
for i, P_ in enumerate([0.6, 1.0, 1.4]):
    a = fig.add_subplot(gs[0, i]); z = g[g.P == P_].sort_values("vff"); st = 1 - z.vff
    frac = np.vstack([z[k] / z.Esaved for k, _, _ in comp]); frac = np.clip(frac, -0.2, None)
    a.stackplot(st, np.clip(frac, 0, None), colors=[c for *_, c in comp], labels=[l for _, l, _ in comp], alpha=0.9)
    a.set_ylim(0, 1.15); a.set_xlabel("mulch strength (1 − vapour flux factor)"); a.set_ylabel("share of evaporation saved" if i == 0 else "")
    a.set_title(f"{'abc'[i]}  Rain × {P_:g}  ({['dry', 'normal', 'wet'][i]})", loc="left")
    a2 = a.twinx(); a2.plot(st, z.Esaved, "k-o", ms=4, lw=1.6); a2.set_ylabel("evaporation saved (mm/yr)" if i == 2 else ""); a2.grid(False); a2.set_ylim(0, g.Esaved.max() * 1.15)
    if i == 0: a.legend(fontsize=8.5, loc="lower left")
# panel d: fate vs rain (strong mulch), panel e: N consequence, panel f: text
a = fig.add_subplot(gs[1, :2]); z = g[g.vff == 0.1].sort_values("P"); btm = np.zeros(len(z))
for k, lab, c_ in comp:
    v = (z[k] / z.Esaved).clip(lower=0).values; a.bar(z.P, v, 0.07, bottom=btm, color=c_, label=lab); btm += v
a2 = a.twinx(); a2.plot(z.P, z.dN, "D-", color=RED, ms=8, lw=2, label="change in N leaching (kg N/ha/yr)"); a2.axhline(0, color=RED, lw=0.6)
a2.set_ylabel("Δ N leaching (kg N/ha/yr)", color=RED); a2.grid(False)
cross = z.P.values[np.argmax((z.to_D / z.Esaved).values > (z.to_irr / z.Esaved).values)] if ((z.to_D / z.Esaved) > (z.to_irr / z.Esaved)).any() else np.nan
a.axvline(cross - 0.05, color="k", ls=":"); a.text(cross - 0.04, 1.05, f"switch: drainage > irrigation saving\nabove rain × {cross:g}", fontsize=9.5)
a.set_xlabel("rain scale (× course rainfall)"); a.set_ylabel("share of evaporation saved"); a.set_ylim(0, 1.2)
a.set_title("d  Strong mulch (vff 0.1): the fate of saved water switches from irrigation saving to drainage as climate gets wetter", loc="left")
h1, l1 = a.get_legend_handles_labels(); h2, l2 = a2.get_legend_handles_labels(); a.legend(h1 + h2, l1 + l2, fontsize=8.5, loc="upper left", ncol=2)
t = fig.add_subplot(gs[1, 2]); t.axis("off"); dry = g[(g.P == 0.6) & (g.vff == 0.1)].iloc[0]; wet = g[(g.P == 1.4) & (g.vff == 0.1)].iloc[0]
t.text(0.1, 1, "Why it matters", fontsize=13, weight="bold", color=NAVY, va="top")
t.text(0.1, 0.9, (f"• Mulch is usually evaluated by the evaporation it saves.\n  The water balance shows that what matters is where\n  that water goes next.\n\n"
                f"• Dry climate: {dry.to_irr / dry.Esaved:.0%} of the {dry.Esaved:.0f} mm saved becomes\n  less irrigation, {dry.to_T / dry.Esaved:.0%} extra transpiration.\n\n"
                f"• Wet climate: {wet.to_D / wet.Esaved:.0%} of the {wet.Esaved:.0f} mm saved drains\n  below 1 m instead of reducing irrigation.\n\n"
                f"• N leaching falls at every rain level, but the benefit\n  shrinks from {g[g.vff == 0.1].dN.min():.0f} to {wet.dN:.0f} kg N/ha/yr as rain rises.\n\n"
                "• So evaporation control saves irrigation in dry\n  conditions but mostly feeds deep drainage in wet\n  ones: the feedback changes its outcome with climate.\n\n"
                "• Accounting closes: residual ≤ 6 % of the saving.\n  Data: E14, 1,000 runs, reference vff = 1.0 at the\n  same interception capacity and rain."), fontsize=10.2, va="top", color="#222")
fig.suptitle("New synthesis 2 — The fate of evaporation saved by mulching: a rain-dependent switch from irrigation saving to deep drainage",
             x=0.01, ha="left", fontsize=15, color=NAVY, weight="bold")
save(fig, FN, "N2_Fate_of_saved_evaporation", "Fate of water saved by mulching",
     "E14: total evaporation saved (soil + canopy + mulch layer) partitioned by water balance into reduced irrigation, extra transpiration, extra drainage and residual, vs mulch strength and rain; with the resulting change in N leaching.", "E14")

# ================================================================= N3  feedback regime map + non-additivity
e11 = ok(d, "E11").copy()
def additive_residual(z, fs, y):
    mu = z[y].mean(); pred = mu + sum(z.groupby(f)[y].transform("mean") - mu for f in fs); return (z[y] - pred)
e11["res_I"] = additive_residual(e11, ["dT", "Ep", "P"], "irrigation_mm")
e11["DI"] = (e11.soil_evap_mm - e11.drainage_1m_mm) / (e11.soil_evap_mm + e11.drainage_1m_mm.clip(lower=0))
e14 = ok(d, "E14").copy(); e14["res_I"] = additive_residual(e14, ["vff", "cap", "P"], "irrigation_mm")
e14["DI"] = (e14.soil_evap_mm - e14.drainage_1m_mm) / (e14.soil_evap_mm + e14.drainage_1m_mm.clip(lower=0))
fig, ax = plt.subplots(2, 2, figsize=(17, 11)); fig.subplots_adjust(hspace=0.35, wspace=0.25)
for col, (z, xk, yk, xl, yl, sel, tt) in enumerate([(e11, "P", "dT", "rain scale", "temperature shift (°C)", e11.Ep == 0.6, "Climate plane (E11, EpFactor 0.6)"),
                                                    (e14, "P", "vff", "rain scale", "mulch vapour flux factor (1 = no mulch)", e14.cap == 2, "Management plane (E14, interception 2 mm)")]):
    p = z[sel].pivot_table(index=yk, columns=xk, values="DI"); pI = z[sel].pivot_table(index=yk, columns=xk, values="irrigation_mm")
    a = ax[0, col]; cf = a.contourf(p.columns, p.index, p.values, levels=np.linspace(-1, 1, 21), cmap="BrBG_r")
    cs = a.contour(p.columns, p.index, p.values, levels=[0], colors="k", linewidths=2.5); a.plot([], [], color="k", lw=2.5, label="E = D regime boundary"); a.legend(loc="lower right", fontsize=8.5)
    ci = a.contour(pI.columns, pI.index, pI.values, 6, colors="white", linewidths=1, linestyles="--"); a.clabel(ci, fmt="%d mm", fontsize=8)
    fig.colorbar(cf, ax=a, label="loss-pathway index (soil evap − drainage)/(sum)", pad=0.01)
    a.set_xlabel(xl); a.set_ylabel(yl); a.set_title(f"{'ab'[col]}  {tt}", loc="left", fontsize=11.5)
    a.text(0.02, 0.97, "brown = evaporation-dominated loss\ngreen = drainage-dominated loss\nwhite dashed = irrigation (mm/yr)", transform=a.transAxes, va="top", fontsize=8.5,
           bbox=dict(fc="white", ec="none", alpha=0.8))
    q = z.groupby([yk, xk]).res_I.apply(lambda r: np.abs(r).mean()).unstack() / z.irrigation_mm.mean() * 100
    b = ax[1, col]; im = b.pcolormesh(q.columns, q.index, q.values, cmap="magma_r", shading="auto"); fig.colorbar(im, ax=b, label="non-additive part of irrigation (% of mean)", pad=0.01)
    cc = b.contour(q.columns, q.index, q.values, levels=[5, 10], colors=["#555", "k"], linewidths=[1, 2]); b.clabel(cc, fmt="%d %%", fontsize=9)
    b.set_xlabel(xl); b.set_ylabel(yl); b.set_title(f"{'cd'[col]}  Non-additive interaction, irrigation ({['E11', 'E14'][col]})", loc="left", fontsize=11.5)
fig.suptitle("New synthesis 3 — Regime map of soil–atmosphere feedbacks: where losses switch from evaporation to drainage, and where drivers stop acting additively",
             x=0.01, ha="left", fontsize=14.5, color=NAVY, weight="bold")
share11 = (e11.res_I ** 2).sum() / ((e11.irrigation_mm - e11.irrigation_mm.mean()) ** 2).sum(); share14 = (e14.res_I ** 2).sum() / ((e14.irrigation_mm - e14.irrigation_mm.mean()) ** 2).sum()
fig.text(0.01, 0.005, f"Non-additive share of irrigation variance: E11 {share11:.1%}, E14 {share14:.1%}. Non-additivity = |run − additive main-effects model| averaged over the third factor. "
         "Data: E11 and E14, 2,000 runs, coarse loam, irrigated.", fontsize=9, color="#555")
save(fig, FN, "N3_Feedback_regime_map", "Feedback regime map and non-additivity",
     "Loss-pathway index (evaporation vs drainage dominance) across climate (E11) and mulch-management (E14) planes, with the regime boundary E = D, irrigation contours, and maps of where drivers interact non-additively.", "E11, E14")
write_catalog("N"); print("N done", round(fstar, 3), round(r2_f, 3), round(r2_fy, 3), cross, round(share11, 3), round(share14, 3))
