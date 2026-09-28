import sys
from common import *
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from matplotlib.animation import FuncAnimation, FFMpegWriter
import matplotlib.colors as mcolors
D3 = os.path.join(OUT, "06_3D_Project"); os.makedirs(D3, exist_ok=True); L01, S02 = SOILS[0], SOILS[1]
CASES = [(f"E2_{L01}_h300", "Coarse loam\nbare, irrigated", 0.0, False), (f"E2_{S02}_h300", "Coarse sand\nbare, irrigated", 2.2, False),
         (f"E7_{L01}_vff0.1_cap4mm", "Coarse loam\nstrong mulch", 4.4, True)]
EDGES = np.array([0, -5, -10, -15, -20, -30, -40, -55, -70, -85, -100, -125, -150])
A, B = "1994-04-01", "1994-09-30"
cmap = plt.cm.RdYlBu_r; norm = mcolors.Normalize(1.0, 4.2)

def load(rid):
    h = dlf(rid, "Daily-h.dlf"); m = (h.date >= A) & (h.date <= B); h = h[m].reset_index(drop=True)
    cols, z = profile_cols(h, "h @"); vals = h[cols].values
    mids = (EDGES[:-1] + EDGES[1:]) / 2
    pf = np.array([[np.log10(max(1, -np.interp(zz, z[::-1], row[::-1]))) for zz in mids] for row in vals])
    fw = dlf(rid, "Daily-FWater.dlf"); sw = dlf(rid, "Daily-SWater.dlf"); cp = dlf(rid, "Daily-CropProduction.dlf"); q = dlf(rid, "Daily-WaterFlux.dlf")
    sel = lambda x: x[(x.date >= A) & (x.date <= B)].reset_index(drop=True)
    fw, sw, cp = sel(fw), sel(sw), sel(cp); qq = sel(q); dr = -at_depth(qq, "q @", -100.0)
    sm = lambda s: pd.Series(np.asarray(s, float)).rolling(7, min_periods=1).mean().values
    n = min(len(h), len(fw), len(sw), len(cp), len(dr))
    return dict(date=h.date[:n], pf=pf[:n], rain=sm(fw.Precipitation)[:n], irr=sm(fw.Irrigation)[:n], et=sm(sw["Actual Evapotranspiration"])[:n],
                drain=sm(dr)[:n], lai=cp.LAI.values[:n], root=np.abs(cp.Depth.values[:n]), cumI=fw.Irrigation.cumsum().values[:n])
DATA = [load(r) for r, *_ in CASES]

def cuboid(x0, x1, y0, y1, z0, z1):
    v = np.array([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]])
    f = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]]
    return [[v[i] for i in face] for face in f]

def mp4():
    fig = plt.figure(figsize=(12.8, 7.2)); ax = fig.add_subplot(111, projection="3d"); fig.subplots_adjust(0, 0, 1, 0.9)
    n = len(DATA[0]["date"]); frames = list(range(0, n, 2))
    def draw(k):
        ax.cla(); ax.set_axis_off(); ax.set_xlim(-0.6, 5.8); ax.set_ylim(-1.5, 2.5); ax.set_zlim(-190, 120); ax.set_box_aspect((2.2, 1.2, 1.9))
        ax.view_init(elev=16, azim=-78 + 24 * k / n)
        for (rid, lab, x0, mulch), D in zip(CASES, DATA):
            for j in range(len(EDGES) - 1):
                col = cmap(norm(D["pf"][k, j])); z0, z1 = EDGES[j + 1] * 1.0, EDGES[j] * 1.0
                ax.add_collection3d(Poly3DCollection(cuboid(x0, x0 + 1.2, 0, 1, z0, z1), facecolors=col, edgecolors=(1, 1, 1, 0.35), linewidths=0.3, alpha=0.95))
            if mulch: ax.add_collection3d(Poly3DCollection(cuboid(x0, x0 + 1.2, 0, 1, 0, 4), facecolors="#C8A165", edgecolors="#8B6B3D", alpha=0.95))
            ax.plot([x0 + 1.0], [-0.02], [-20], "o", color="red", ms=8, zorder=20)
            h_c = 18 * D["lai"][k]; rd = D["root"][k]
            for dx in (0.25, 0.6, 0.95):
                if h_c > 1: ax.plot([x0 + dx] * 2, [0.5] * 2, [4, 4 + h_c], color="#2E8B57", lw=3)
                if rd > 1: ax.plot([x0 + dx] * 2, [0.5] * 2, [0, -min(rd, 150)], color="#6E4B2A", lw=1.4, alpha=0.8)
            sc = 14
            def bar(x, z0, dz, c, up):
                if abs(dz) < 1: return
                ax.plot([x, x], [0.5, 0.5], [z0, z0 + dz], color=c, lw=4, solid_capstyle="butt", zorder=15)
                ax.plot([x], [0.5], [z0 + dz], "^" if up else "v", color=c, ms=9, zorder=16)
            bar(x0 + 0.3, 115, -sc * D["rain"][k], SKY, False)
            bar(x0 + 0.9, 115, -sc * D["irr"][k], "#E67E22", False)
            bar(x0 + 0.6, 45 + 18 * D["lai"][k], sc * D["et"][k], GREEN, True)
            bar(x0 + 0.6, -152, -sc * 6 * max(D["drain"][k], 0), NAVY, False)
            ax.text(x0 + 0.6, -1.2, -185, lab, ha="center", fontsize=10, color=NAVY, weight="bold")
            ax.text(x0 + 0.6, -1.2, 95, f"irrigation {D['cumI'][k]:.0f} mm", ha="center", fontsize=9, color="#E67E22")
        fig.suptitle(f"Project in 3D — soil columns coloured by daily pF, fluxes to scale    {pd.Timestamp(DATA[0]['date'].iloc[k]).strftime('%d %b %Y')}",
                     x=0.02, ha="left", fontsize=15, color=NAVY, weight="bold")
    sm_ = plt.cm.ScalarMappable(cmap=cmap, norm=norm); cb = fig.colorbar(sm_, ax=ax, shrink=0.5, pad=0.0, location="left"); cb.set_label("pF (log₁₀ suction)")
    fig.text(0.78, 0.06, "arrows: blue rain · orange irrigation\ngreen ET · navy drainage (×6)\nred dot = 20 cm sensor · brown = roots", fontsize=9.5, color="#333")
    FuncAnimation(fig, draw, frames=frames + [frames[-1]] * 15).save(os.path.join(D3, "3D_Project_animation_1994.mp4"),
        writer=FFMpegWriter(fps=12, bitrate=3500, extra_args=["-pix_fmt", "yuv420p", "-vcodec", "libx264"])); plt.close(fig)

def html():
    import plotly.graph_objects as go
    n = len(DATA[0]["date"]); steps = list(range(0, n, 3))
    def mesh(x0, pfrow):
        X, Y, Z, I, J, K, C = [], [], [], [], [], [], []
        for j in range(len(EDGES) - 1):
            b = len(X); z0, z1 = EDGES[j + 1], EDGES[j]
            for (x, y, z) in [(x0, 0, z0), (x0 + 1.2, 0, z0), (x0 + 1.2, 1, z0), (x0, 1, z0), (x0, 0, z1), (x0 + 1.2, 0, z1), (x0 + 1.2, 1, z1), (x0, 1, z1)]:
                X.append(x); Y.append(y); Z.append(z)
            for t in [(0, 1, 2), (0, 2, 3), (4, 5, 6), (4, 6, 7), (0, 1, 5), (0, 5, 4), (2, 3, 7), (2, 7, 6), (1, 2, 6), (1, 6, 5), (0, 3, 7), (0, 7, 4)]:
                I.append(b + t[0]); J.append(b + t[1]); K.append(b + t[2]); C.append(pfrow[j])
        return X, Y, Z, I, J, K, C
    def traces(k):
        tr = []
        for (rid, lab, x0, mulch), D in zip(CASES, DATA):
            X, Y, Z, I, J, K, C = mesh(x0, D["pf"][k])
            tr.append(go.Mesh3d(x=X, y=Y, z=Z, i=I, j=J, k=K, intensity=C, intensitymode="cell", colorscale="RdYlBu_r", cmin=1, cmax=4.2,
                                showscale=(x0 == 0), colorbar=dict(title="pF"), name=lab.replace("\n", " "), flatshading=True))
            tr.append(go.Scatter3d(x=[x0 + 0.6, x0 + 0.6], y=[0.5, 0.5], z=[4, 4 + 18 * D["lai"][k]], mode="lines", line=dict(color="#2E8B57", width=12), showlegend=False))
            tr.append(go.Scatter3d(x=[x0 + 0.6, x0 + 0.6], y=[0.5, 0.5], z=[0, -min(D["root"][k], 150)], mode="lines", line=dict(color="#6E4B2A", width=5), showlegend=False))
            tr.append(go.Scatter3d(x=[x0 + 0.6], y=[0.5], z=[-20], mode="markers", marker=dict(size=6, color="red"), showlegend=False))
        return tr
    fig = go.Figure(traces(steps[0]), frames=[go.Frame(data=traces(k), name=str(pd.Timestamp(DATA[0]["date"].iloc[k]).date())) for k in steps])
    for (rid, lab, x0, mulch) in CASES:
        fig.add_trace(go.Scatter3d(x=[x0 + 0.6], y=[-0.8], z=[-175], mode="text", text=[lab.replace("\n", " · ")], showlegend=False))
    fig.update_layout(template="plotly_white", height=760, title="Project in 3D: soil columns coloured by daily pF, canopy (green), roots (brown), sensor (red) — 1994",
                      scene=dict(xaxis=dict(visible=False), yaxis=dict(visible=False), zaxis=dict(title="depth / height (cm)"), aspectmode="manual", aspectratio=dict(x=2.2, y=0.8, z=1.6)),
                      updatemenus=[dict(type="buttons", x=0.02, y=1.0, buttons=[dict(label="▶ Play", method="animate", args=[None, dict(frame=dict(duration=150, redraw=True), fromcurrent=True)]),
                                                                              dict(label="❚❚ Pause", method="animate", args=[[None], dict(mode="immediate")])])],
                      sliders=[dict(currentvalue=dict(prefix="date: "), steps=[dict(method="animate", label=f.name[5:], args=[[f.name], dict(mode="immediate", frame=dict(duration=0, redraw=True))]) for f in fig.frames])])
    fig.write_html(os.path.join(D3, "3D_Project_interactive.html"), include_plotlyjs="directory")

for a in sys.argv[1:]: globals()[a](); print("done", a)
