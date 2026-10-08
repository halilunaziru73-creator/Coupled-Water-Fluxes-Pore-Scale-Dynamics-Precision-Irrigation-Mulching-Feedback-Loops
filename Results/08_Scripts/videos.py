import sys
from common import *
from matplotlib.animation import FuncAnimation, FFMpegWriter
V = os.path.join(OUT, "05_Videos"); os.makedirs(V, exist_ok=True); L01, S02 = SOILS[0], SOILS[1]
W = lambda fps: FFMpegWriter(fps=fps, bitrate=2800, extra_args=["-pix_fmt", "yuv420p", "-vcodec", "libx264"])
def season(rid, fn, a="1994-04-01", b="1994-09-30"):
    x = dlf(rid, fn); return x[(x.date >= a) & (x.date <= b)].reset_index(drop=True)

def v1():   # sensor + irrigation, loam vs sand
    fig, axs = plt.subplots(2, 1, figsize=(12.8, 7.2), sharex=True); fig.subplots_adjust(top=0.88, hspace=0.3)
    fig.suptitle("Tensiometer at 20 cm and irrigation response, 1994", x=0.03, ha="left", fontsize=18, color=NAVY, weight="bold")
    L = {}
    for a, s, lab in zip(axs, [L01, S02], ["Coarse loam", "Coarse sand"]):
        hR, hI = season(f"E0_{s}_Rainfed", "Daily-h.dlf"), season(f"E2_{s}_h300", "Daily-h.dlf"); fw = season(f"E2_{s}_h300", "Daily-FWater.dlf")
        sR, sI = np.clip(-at_depth(hR, "h @", -20.0), 1, None), np.clip(-at_depth(hI, "h @", -20.0), 1, None)
        a.set_yscale("log"); a.set_ylim(10, 3e4); a.set_xlim(hI.date.iloc[0], hI.date.iloc[-1]); a.axhline(300, color=RED, ls="--"); a.set_title(lab, loc="left")
        a.set_ylabel("suction (cm)"); lr, = a.plot([], [], color=METH_COL["Rainfed"], lw=2, label="rainfed"); li, = a.plot([], [], color=METH_COL["Surface"], lw=2.4, label="irrigated −300 cm")
        a.legend(loc="upper left"); t = a.text(0.99, 0.92, "", transform=a.transAxes, ha="right", fontsize=11)
        L[s] = (hI.date, sR, sI, fw.Irrigation.values, lr, li, t)
    date = fig.text(0.97, 0.93, "", ha="right", fontsize=16, color=NAVY, weight="bold")
    def up(k):
        for s, (dt, sR, sI, I, lr, li, t) in L.items():
            lr.set_data(dt[:k + 1], sR[:k + 1]); li.set_data(dt[:k + 1], sI[:k + 1]); t.set_text(f"irrigation so far: {I[:k + 1].sum():.0f} mm")
        date.set_text(pd.Timestamp(L[L01][0].iloc[k]).strftime("%d %b %Y"))
    n = len(L[L01][0]); FuncAnimation(fig, up, frames=list(range(n)) + [n - 1] * 20).save(os.path.join(V, "V1_Sensor_and_irrigation_1994.mp4"), writer=W(15)); plt.close(fig)

def v2():   # profiles
    fig, axs = plt.subplots(1, 2, figsize=(12.8, 7.2), sharey=True); fig.subplots_adjust(top=0.86)
    fig.suptitle("Soil pressure-head profiles, rainfed vs irrigated, 1994", x=0.03, ha="left", fontsize=18, color=NAVY, weight="bold")
    D = {}
    for a, s, lab in zip(axs, [L01, S02], ["Coarse loam", "Coarse sand"]):
        a.set_xscale("log"); a.set_xlim(3, 3e4); a.set_ylim(-150, 0); a.axvline(300, color=RED, ls="--"); a.axhline(-20, color="#555", ls=":")
        a.axhspan(-100, -150, color="#E3E8EF", alpha=0.5); a.set_title(lab, loc="left"); a.set_xlabel("suction (cm, log)")
        for rid, c, l in [(f"E0_{s}_Rainfed", METH_COL["Rainfed"], "rainfed"), (f"E2_{s}_h300", METH_COL["Surface"], "irrigated")]:
            h = season(rid, "Daily-h.dlf"); cols, z = profile_cols(h, "h @"); sel = z >= -150
            ln, = a.plot([], [], "o-", ms=3.5, color=c, lw=2.2, label=l); D[(s, l)] = (np.clip(-h[np.array(cols)[sel]].values, 1, None), z[sel], ln)
        a.legend(loc="lower left")
    axs[0].set_ylabel("depth (cm)"); dts = season(f"E2_{L01}_h300", "Daily-h.dlf").date
    date = fig.text(0.97, 0.9, "", ha="right", fontsize=16, color=NAVY, weight="bold")
    def up(k):
        for (v, z, ln) in D.values(): ln.set_data(v[k], z)
        date.set_text(pd.Timestamp(dts.iloc[k]).strftime("%d %b %Y"))
    FuncAnimation(fig, up, frames=list(range(len(dts))) + [len(dts) - 1] * 20).save(os.path.join(V, "V2_Profiles_1994.mp4"), writer=W(15)); plt.close(fig)

def v3():   # tillage structure over 20 years
    fig, ax = plt.subplots(figsize=(12.8, 7.2)); fig.subplots_adjust(top=0.86)
    fig.suptitle("Topsoil conductivity under three tillage systems, 1980–2000 (E5)", x=0.03, ha="left", fontsize=18, color=NAVY, weight="bold")
    S = {}
    for t, lab, c in [("conv", "Conventional plough", "#8E44AD"), ("reduced", "Reduced tillage", "#E67E22"), ("notill", "No-till", GREEN)]:
        k = dlf(f"E5_{L01}_{t}_tc0.005_Irrigated", "Daily-logK.dlf"); s = pd.Series(k["K @ -3.75"].values, index=k.date).rolling(30, min_periods=5).median().resample("7D").last()
        ln, = ax.plot([], [], color=c, lw=2.2, label=lab); S[t] = (s, ln)
    s0 = S["conv"][0]; ax.set_xlim(s0.index[0], s0.index[-1]); ax.set_ylim(min(v[0].min() for v in S.values()) - 0.1, max(v[0].max() for v in S.values()) + 0.1)
    ax.set_ylabel("log₁₀ K at 3.75 cm (30-day median)"); ax.legend(loc="upper left"); yr = fig.text(0.97, 0.9, "", ha="right", fontsize=18, color=NAVY, weight="bold")
    def up(i):
        for s, ln in S.values(): ln.set_data(s.index[:i + 1], s.values[:i + 1])
        yr.set_text(str(s0.index[i].year))
    FuncAnimation(fig, up, frames=list(range(0, len(s0), 2)) + [len(s0) - 1] * 20).save(os.path.join(V, "V3_Tillage_structure_20yr.mp4"), writer=W(15)); plt.close(fig)

def v4():   # mulch race
    fig, ax = plt.subplots(1, 2, figsize=(12.8, 7.2)); fig.subplots_adjust(top=0.85, wspace=0.3)
    fig.suptitle("Mulch vs bare soil: soil evaporation and irrigation through 1994", x=0.03, ha="left", fontsize=18, color=NAVY, weight="bold")
    R = [(f"E2_{L01}_h300", "bare, irrigated", "#8C6D46"), (f"E7_{L01}_vff0.9_cap0.5mm", "weak mulch", "#E67E22"), (f"E7_{L01}_vff0.1_cap4mm", "strong mulch", GREEN)]
    Z = []
    for rid, lab, c in R:
        sw = season(rid, "Daily-SWater.dlf", "1994-03-01", "1994-10-31"); fw = season(rid, "Daily-FWater.dlf", "1994-03-01", "1994-10-31")
        a, = ax[0].plot([], [], color=c, lw=2.6, label=lab); b, = ax[1].plot([], [], color=c, lw=2.6, label=lab)
        Z.append((sw.date, sw["Evaporation of soil water"].cumsum().values, fw.Irrigation.cumsum().values, a, b))
    for a_, t in zip(ax, ["cumulative soil evaporation (mm)", "cumulative irrigation (mm)"]):
        a_.set_xlim(Z[0][0].iloc[0], Z[0][0].iloc[-1]); a_.set_ylabel(t); a_.legend(loc="upper left"); a_.tick_params(axis="x", rotation=30)
    ax[0].set_ylim(0, max(z[1].max() for z in Z) * 1.1); ax[1].set_ylim(0, max(z[2].max() for z in Z) * 1.1)
    date = fig.text(0.97, 0.9, "", ha="right", fontsize=16, color=NAVY, weight="bold")
    def up(k):
        for dt, e, i, a, b in Z: a.set_data(dt[:k + 1], e[:k + 1]); b.set_data(dt[:k + 1], i[:k + 1])
        date.set_text(pd.Timestamp(Z[0][0].iloc[k]).strftime("%d %b %Y"))
    n = len(Z[0][0]); FuncAnimation(fig, up, frames=list(range(0, n, 2)) + [n - 1] * 20).save(os.path.join(V, "V4_Mulch_vs_bare_1994.mp4"), writer=W(15)); plt.close(fig)

def v5():   # feedback phase trajectories
    fig, axs = plt.subplots(1, 3, figsize=(12.8, 7.2), sharey=True); fig.subplots_adjust(top=0.84)
    fig.suptitle("Soil–atmosphere feedback trajectories: pF at the sensor vs actual ET, 1994", x=0.03, ha="left", fontsize=17, color=NAVY, weight="bold")
    T = []
    for a, (rid, lab) in zip(axs, [(f"E0_{L01}_Rainfed", "Rainfed"), (f"E2_{L01}_h300", "Irrigated"), (f"E7_{L01}_vff0.1_cap4mm", "Irrigated + mulch")]):
        h = season(rid, "Daily-h.dlf"); sw = season(rid, "Daily-SWater.dlf"); pf = np.log10(np.clip(-at_depth(h, "h @", -20.0), 1, None))
        et = sw["Actual Evapotranspiration"].rolling(7, min_periods=1).mean().values[:len(pf)]
        a.set_xlim(1.4, 4.4); a.set_ylim(0, 6); a.axvline(np.log10(300), color=RED, ls=":"); a.set_title(lab, loc="left"); a.set_xlabel("pF at 20 cm")
        tr, = a.plot([], [], color="#bbb", lw=1); pt, = a.plot([], [], "o", ms=12, color=NAVY); T.append((pf, et, tr, pt))
    axs[0].set_ylabel("actual ET (mm/day)"); dts = season(f"E0_{L01}_Rainfed", "Daily-h.dlf").date
    date = fig.text(0.97, 0.9, "", ha="right", fontsize=16, color=NAVY, weight="bold")
    def up(k):
        for pf, et, tr, pt in T: tr.set_data(pf[:k + 1], et[:k + 1]); pt.set_data([pf[k]], [et[k]])
        date.set_text(pd.Timestamp(dts.iloc[k]).strftime("%d %b %Y"))
    n = min(len(t[0]) for t in T); FuncAnimation(fig, up, frames=list(range(n)) + [n - 1] * 20).save(os.path.join(V, "V5_Feedback_trajectories_1994.mp4"), writer=W(15)); plt.close(fig)

for name in sys.argv[1:]: globals()[name](); print("done", name)
