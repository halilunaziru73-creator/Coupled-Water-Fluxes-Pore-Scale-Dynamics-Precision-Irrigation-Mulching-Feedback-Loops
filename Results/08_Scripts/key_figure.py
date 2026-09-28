from common import *
import matplotlib.colors as mcolors
from matplotlib.gridspec import GridSpec
from scipy.stats import spearmanr

L = pd.read_csv("leverage.csv")
LEVS = ["Trigger", "Dose", "Sensor depth", "Method", "Mulch", "N/water pathway", "Soil structure"]
LEV_EXP = {"Trigger": "E2", "Dose": "E1", "Sensor depth": "E3", "Method": "E4", "Mulch": "E7", "N/water pathway": "E6", "Soil structure": "E5"}
OUTS = ["Yield", "IE", "Drainage fraction", "N-leaching fraction"]
TAW = pd.Series({s: taw_mm(s) for s in SOILS}); order = TAW.sort_values().index.tolist()          # coarse -> fine
nBt = pd.Series({s: G.SOILS[s]["Bt"]["n"] for s in SOILS})

fig = plt.figure(figsize=(22, 14.5))
gs = GridSpec(2, 6, figure=fig, height_ratios=[1.35, 1], width_ratios=[0.55, 1, 1, 1, 1, 0.08], hspace=0.42, wspace=0.12,
              left=0.06, right=0.97, top=0.88, bottom=0.08)
fig.suptitle("Soil pore structure gates management controllability: which lever moves which flux, on which soil",
             x=0.06, ha="left", fontsize=19, color=NAVY, weight="bold")
fig.text(0.06, 0.915, "Controllability = 10th–90th percentile range of an outcome across a lever's settings, as % of its median, per soil. "
         "Built from 1,480 valid runs of E1–E7 (10 soils × 7 levers); solver failures excluded; IE only where irrigation ≥ 20 mm/yr.",
         fontsize=11, color="#444")

# (a0) soil strip: TAW and pore-size index
a0 = fig.add_subplot(gs[0, 0]); y = np.arange(len(order))
a0.barh(y, TAW[order], color=[SOIL_COL[s] for s in order]); a0.set_yticks(y); a0.set_yticklabels([SOIL_LAB[s] for s in order])
a0.invert_yaxis(); a0.set_xlabel("TAW 0–100 cm (mm)"); a0.set_title("Soil (coarse → fine)", loc="left", fontsize=12)
for i, s in enumerate(order): a0.text(TAW[s] + 4, i, f"n={nBt[s]:.2f}", va="center", fontsize=8.5, color="#333")
a0.set_xlim(0, 300)

# (a1-a4) controllability heatmaps
norm = mcolors.LogNorm(vmin=1, vmax=320); cmap = plt.cm.magma_r.copy(); cmap.set_bad("#EEEEEE")
for k, o in enumerate(OUTS):
    a = fig.add_subplot(gs[0, 1 + k])
    M = L[L.out == o].pivot_table(index="soil", columns="lever", values="lev_pct").reindex(index=order, columns=LEVS)
    V = M.values.astype(float); Vp = np.where(V < 1, 1, V)
    im = a.imshow(np.ma.masked_invalid(Vp), cmap=cmap, norm=norm, aspect="auto")
    for (i, j), v in np.ndenumerate(V):
        if np.isfinite(v): a.text(j, i, f"{v:.0f}", ha="center", va="center", fontsize=8.5, color="white" if v > 40 else "#222")
        else: a.text(j, i, "n/a", ha="center", va="center", fontsize=7, color="#888")
    best = np.nanargmax(np.where(np.isfinite(V), V, -1), axis=1)
    for i, j in enumerate(best):
        if np.isfinite(V[i, j]): a.add_patch(plt.Rectangle((j - 0.5, i - 0.5), 1, 1, fill=False, ec="#00B4D8", lw=2.6))
    a.set_xticks(range(len(LEVS))); a.set_xticklabels([f"{l}\n({LEV_EXP[l]})" for l in LEVS], rotation=90, fontsize=9.5)
    a.set_yticks(range(len(order))); a.set_yticklabels([]); a.grid(False)
    a.set_title(f"({chr(97 + k)}) {o}", loc="left", fontsize=13)
cax = fig.add_subplot(gs[0, 5]); cb = fig.colorbar(im, cax=cax); cb.set_label("controllability (% of median, log scale)")
fig.text(0.06, 0.012, "cyan box = dominant lever for that soil and outcome · n/a = the lever never triggers irrigation on that soil",
         fontsize=10, color="#333")

# (b) gating relation: Spearman rho of controllability vs TAW
from matplotlib.gridspec import GridSpecFromSubplotSpec
gb = GridSpecFromSubplotSpec(1, 2, subplot_spec=gs[1, 0:6], width_ratios=[1.25, 1], wspace=0.22)
ab = fig.add_subplot(gb[0, 0])
R = pd.DataFrame(index=OUTS, columns=LEVS, dtype=float)
for o in OUTS:
    M = L[L.out == o].pivot_table(index="soil", columns="lever", values="lev_pct").reindex(SOILS)
    for l in LEVS:
        m = M[l].notna(); R.loc[o, l] = spearmanr(TAW[M.index[m]], M[l][m])[0] if m.sum() >= 5 else np.nan
im2 = ab.imshow(R.values.astype(float), cmap="RdBu_r", vmin=-1, vmax=1, aspect="auto")
for (i, j), v in np.ndenumerate(R.values.astype(float)):
    if np.isfinite(v): ab.text(j, i, f"{v:+.2f}", ha="center", va="center", fontsize=11, weight="bold" if abs(v) >= 0.7 else "normal",
                               color="white" if abs(v) > 0.6 else "#222")
ab.set_xticks(range(len(LEVS))); ab.set_xticklabels(LEVS, fontsize=10.5); ab.set_yticks(range(len(OUTS))); ab.set_yticklabels(OUTS, fontsize=10.5); ab.grid(False)
ab.set_title("(e) Gating law: rank correlation of controllability with soil available water (TAW), 10 soils", loc="left", fontsize=13)
c2 = fig.colorbar(im2, ax=ab, orientation="horizontal", pad=0.14, fraction=0.07, aspect=40); c2.set_label("Spearman ρ")

# (c) drainage controllability vs TAW for key levers
ac = fig.add_subplot(gb[0, 1])
M = L[L.out == "Drainage fraction"].pivot_table(index="soil", columns="lever", values="lev_pct").reindex(SOILS)
for l, c, mk in [("Trigger", RED, "o"), ("Method", METH_COL["Overhead"], "s"), ("Mulch", GREEN, "^"), ("Soil structure", "#8E44AD", "D")]:
    x, yv = TAW.values, M[l].values; m = np.isfinite(yv)
    ac.scatter(x[m], np.clip(yv[m], 0.5, None), color=c, marker=mk, s=70, label=f"{l} (ρ = {R.loc['Drainage fraction', l]:+.2f})", zorder=3)
    b = np.polyfit(x[m], np.log10(np.clip(yv[m], 0.5, None)), 1); xx = np.linspace(0, 230, 50); ac.plot(xx, 10 ** np.polyval(b, xx), color=c, lw=1.6, alpha=0.8)
ac.set_yscale("log"); ac.set_xlabel("TAW 0–100 cm (mm): coarse ← → fine pore structure"); ac.set_ylabel("drainage controllability (% of median)")
ac.set_title("(f) Management can steer drainage only where the soil can store water", loc="left", fontsize=13); ac.legend(fontsize=10, loc="lower right")
ac.annotate("coarse sands: irrigation levers\nbarely move drainage; only\nsoil structure and mulch act", xy=(10, 3), xytext=(25, 0.9), fontsize=9.5, color="#333",
            arrowprops=dict(arrowstyle="->", color="#777"))
ac.set_ylim(0.4, 700)

save(fig, "00_Key_Synthesis_Figure", "Soil_pore_structure_gates_management_controllability", "Soil pore structure gates management controllability",
     "Controllability of yield, IE, drainage and N-leaching fractions by seven management levers across ten soils, and its rank correlation with plant-available water.", "E1-E7")
fig2 = plt.gcf()
write_catalog("KEY"); R.to_csv(os.path.join(OUT, "07_Derived_Data_Tables", "controllability_rho_vs_TAW.csv"))
L.to_csv(os.path.join(OUT, "07_Derived_Data_Tables", "controllability_by_soil_lever_outcome.csv"), index=False); print(R.round(2))
