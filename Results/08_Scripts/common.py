"""Shared helpers for the results-analysis figure set."""
import glob, io, os, re, sys
import numpy as np, pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

RES = "/home/claude/up/res/results/summary_all.csv"      # the user's 10,190-run results
RUNS = "/home/claude/runs/experiments"                    # targeted re-runs (daily + per-year)
OUT = "Results"
sys.path.insert(0, "/home/claude/v2")
import generate_setups as G                                 # soil parameters, design lists

SOILS = list(G.SOILS)
SOIL_LAB = {s: s.split("_", 1)[1] for s in SOILS}
SOIL_LAB = {k: re.sub(r"(?<=[a-z])(?=[A-Z])", " ", v) for k, v in SOIL_LAB.items()}
SOIL_COL = dict(zip(SOILS, ["#8B5A2B", "#D4A017", "#F4D35E", "#E9A23B", "#C97C3D",
                            "#6B8E23", "#3A7D44", "#8E6C8A", "#5B6C9A", "#2F4858"]))
METH_COL = {"Rainfed": "#7F8C8D", "Overhead": "#2E86C1", "Surface": "#E67E22", "Drip": "#27AE60"}
NAVY, SKY, RED, GREEN = "#154378", "#5DADE2", "#C0392B", "#27AE60"

plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 10.5, "axes.titlesize": 12.5, "axes.titleweight": "bold",
    "axes.titlecolor": NAVY, "axes.labelsize": 10.5, "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "grid.color": "#E6E9EE", "grid.linewidth": 0.7, "legend.frameon": False,
    "figure.dpi": 110, "savefig.dpi": 220, "savefig.bbox": "tight", "axes.edgecolor": "#8a939c",
})

CATALOG = []
OVERLAPS = []

def text_overlaps(fig, pad=1.0):
    """Pairs of visible, non-empty text artists whose drawn boxes intersect."""
    import matplotlib.text as mtext
    fig.canvas.draw(); r = fig.canvas.get_renderer()
    all_tick, drawn = set(), set()
    for ax in fig.axes:
        for axis in (ax.xaxis, ax.yaxis):
            for tk in axis.get_major_ticks() + axis.get_minor_ticks():
                all_tick.update({id(tk.label1), id(tk.label2)})
            if not axis.get_visible() or not ax.get_visible() or not ax.axison: continue
            for tk in axis._update_ticks():
                if tk.label1.get_visible(): drawn.add(id(tk.label1))
                if tk.label2.get_visible(): drawn.add(id(tk.label2))
    items = []
    for t in fig.findobj(mtext.Text):
        if not t.get_visible() or not t.get_text().strip(): continue
        if id(t) in all_tick and id(t) not in drawn: continue
        try: bb = t.get_window_extent(r)
        except Exception: continue
        if bb.width < 1 or bb.height < 1: continue
        items.append((t, bb))
    hits = []
    for i in range(len(items)):
        ti, a = items[i]
        for j in range(i + 1, len(items)):
            tj, b = items[j]
            if a.x0 + pad < b.x1 and b.x0 + pad < a.x1 and a.y0 + pad < b.y1 and b.y0 + pad < a.y1:
                hits.append((ti.get_text()[:40], tj.get_text()[:40]))
    return hits

def save(fig, folder, name, title, caption, data):
    d = os.path.join(OUT, folder); os.makedirs(d, exist_ok=True)
    for a, b in text_overlaps(fig): OVERLAPS.append(dict(folder=folder, file=name, text_a=a, text_b=b))
    p = os.path.join(d, name + ".png"); fig.savefig(p); plt.close(fig)
    CATALOG.append(dict(folder=folder, file=name + ".png", title=title, caption=caption, data=data))
    return p

def write_catalog(tag):
    pd.DataFrame(CATALOG).to_csv(os.path.join(OUT, f"_catalog_{tag}.csv"), index=False)
    pd.DataFrame(OVERLAPS, columns=["folder", "file", "text_a", "text_b"]).to_csv(os.path.join(OUT, f"_overlaps_{tag}.csv"), index=False)
    print("overlapping text pairs:", len(OVERLAPS), "in", len({o['file'] for o in OVERLAPS}), "figures")

# ---------------------------------------------------------------- results table
def load_summary():
    d = pd.read_csv(RES)
    d["failed"] = d.status.str.contains("SOLVER_FAILURE", na=False)
    d["exp"] = d.experiment.str.extract(r"^(E\d+)")[0]
    d["soil_lab"] = d.soil.map(SOIL_LAB)
    d["soil_i"] = d.soil.map({s: i for i, s in enumerate(SOILS)})
    f = d.treatment.fillna("")
    num = lambda pat: pd.to_numeric(f.str.extract(pat)[0], errors="coerce")
    d["P"] = num(r"(?:^|_)P([\d.]+)(?:_|$)")                       # rain scale
    d["trig"] = -num(r"(?:^|_)h(\d+)(?:_|$)")                      # trigger or initial h (cm)
    d["z"] = num(r"(?:^|_)z(\d+)cm")
    d["dose_mm"] = num(r"(?:^|_)D([\d.]+)mm")
    d["dur_h"] = num(r"mm_(\d+)h$")
    d["amt_mm"] = num(r"(?:^|_)A([\d.]+)mm")
    d["vff"] = num(r"vff([\d.]+)")
    d["cap"] = num(r"cap([\d.]+)mm")
    d["dT"] = num(r"dT([+-]?[\d.]+)")
    d["Ep"] = num(r"Ep([\d.]+)")
    d["Nrate"] = num(r"(?:^|_)N(\d+)(?:_|$)")
    d["root"] = num(r"root(\d+)cm")
    d["tc"] = num(r"tc([\d.]+)")
    d["till"] = f.str.extract(r"^(conv|reduced|notill)_")[0]
    d["water"] = f.str.extract(r"_(Irrigated|Rainfed)$")[0]
    d["method"] = f.str.extract(r"(M\d\d_[A-Za-z0-9-]+?)(?:_root|$)")[0]
    d["intensity"] = f.str.extract(r"_(I\d\d_[a-z0-9]+)_")[0]
    d["window"] = f.str.extract(r"_(T\d\d_[A-Za-z0-9-]+)$")[0]
    d["wstrat"] = f.str.extract(r"_(W\d\d_[A-Za-z0-9_]+)$")[0]
    d["e6strat"] = f.str.extract(r"^N\d+_([A-Za-z0-9]+)$")[0]
    d["case"] = f.str.extract(r"^(C\d\d)")[0]
    small = d.irrigation_mm < 20                                     # IE/IWUE unstable for tiny irrigation
    d.loc[small, ["IE_kg_m3", "IWUE_kg_m3"]] = np.nan
    d["ET"] = d.ET_mm                                                # Daisy actual evapotranspiration
    d["other_evap_mm"] = (d.ET_mm - d.canopy_evap_mm - d.soil_evap_mm - d.transpiration_mm).clip(lower=0)
    d["E_share"] = 1 - d.transpiration_mm / d.ET_mm                  # evaporative share of ET
    d["WP_ET"] = d.yield_Mg_ha * 1000 / (d.ET_mm * 10)               # yield per m3 of ET
    return d

def ok(d, exp=None):
    x = d[~d.failed]
    return x[x.exp == exp] if exp else x

# ---------------------------------------------------------------- Daisy .dlf files
def read_dlf(path):
    L = open(path, encoding="latin-1").read().replace("\r", "").split("\n")
    i = [k for k, l in enumerate(L) if l.startswith("year")][0]
    return pd.read_csv(io.StringIO("\n".join([L[i]] + [l for l in L[i + 2:] if l.strip()])), sep="\t")

def run_dir(rid):
    h = glob.glob(os.path.join(RUNS, "*", rid)); return h[0] if h else None

def dlf(rid, suffix):
    d = run_dir(rid)
    f = glob.glob(os.path.join(d, f"*{suffix}")) if d else []
    if not f: return None
    df = read_dlf(f[0])
    day = "mday" if "mday" in df.columns else "day"
    df["date"] = pd.to_datetime(dict(year=df.year, month=df.month, day=df[day]), errors="coerce")
    return df

def profile_cols(df, prefix):
    cols = [c for c in df.columns if c.startswith(prefix)]
    z = np.array([float(c.split("@")[1]) for c in cols]); return cols, z

def at_depth(df, prefix, z0):
    cols, z = profile_cols(df, prefix); v = df[cols].values
    return np.array([np.interp(z0, z[::-1], r[::-1]) for r in v])

def per_year(rid):
    """Harvest-year table: yield, stress + the water/N balance of the following water year."""
    h = dlf(rid, "Annual-Harvest.dlf"); w = dlf(rid, "Annual-FWater_100cm.dlf")
    n = dlf(rid, "Annual-FN_100cm.dlf"); s = dlf(rid, "Annual-SWater.dlf")
    rows = []
    for _, r in h.iterrows():
        Y = int(r.year); wr = w[(w.year == Y + 1) & (w.month == 4)]
        if wr.empty: continue
        wr = wr.iloc[0]; nr = n[(n.year == Y + 1) & (n.month == 4)].iloc[0]; sr = s[(s.year == Y + 1) & (s.month == 4)].iloc[0]
        rows.append(dict(year=Y, crop=r.crop, yield_=r.sorg_DM, WStress=r.WStress, P=wr["Precipitation"],
                         I=wr["Irrigation"], D=wr["Matrix percolation"], NL=nr["Matrix-Leaching"],
                         Ecan=sr["Evaporation from canopy"], Esoil=sr["Evaporation of soil water"],
                         Tr=sr["Actual transpiration"]))
    return pd.DataFrame(rows)

# ---------------------------------------------------------------- soil hydraulics
def vg_theta(h, p):
    m = 1 - 1 / p["n"]; return p["tr"] + (p["ts"] - p["tr"]) / (1 + (p["a"] * np.abs(h)) ** p["n"]) ** m

def vg_K(h, p):
    m = 1 - 1 / p["n"]; se = 1 / (1 + (p["a"] * np.abs(h)) ** p["n"]) ** m
    return p["ks"] * se ** p["l"] * (1 - (1 - se ** (1 / m)) ** m) ** 2   # cm/h

def taw_mm(soil, top=100):
    s = G.SOILS[soil]; fc, wp = -100, -15849
    ap = (vg_theta(fc, s["Ap"]) - vg_theta(wp, s["Ap"])) * 25 * 10
    bt = (vg_theta(fc, s["Bt"]) - vg_theta(wp, s["Bt"])) * (top - 25) * 10
    return ap + bt
