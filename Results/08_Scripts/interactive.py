from common import *
import plotly.graph_objects as go
from plotly.subplots import make_subplots

d = load_summary(); P = os.path.join(OUT, "04_Interactive_Charts"); os.makedirs(P, exist_ok=True)
L01, S02 = SOILS[0], SOILS[1]; pages = []
def write(fig, name, title, desc):
    fig.update_layout(template="plotly_white", font=dict(family="Arial", size=13), title=dict(text=title, font=dict(size=18, color=NAVY)))
    fig.write_html(os.path.join(P, name), include_plotlyjs="directory", full_html=True); pages.append((name, title, desc))

# 1 temperature x rain surfaces with EpFactor slider
e11 = ok(d, "E11"); Eps = sorted(e11.Ep.unique()); outs = [("irrigation_mm", "Irrigation (mm/yr)", "YlOrRd"), ("yield_Mg_ha", "Yield (Mg/ha)", "YlGn"), ("drainage_1m_mm", "Drainage (mm/yr)", "Blues")]
fig = make_subplots(rows=1, cols=3, specs=[[{"type": "surface"}] * 3], subplot_titles=[o[1] for o in outs])
for ep in Eps:
    for c, (k, t, cs) in enumerate(outs, 1):
        p = e11[e11.Ep == ep].pivot_table(index="dT", columns="P", values=k)
        fig.add_trace(go.Surface(x=p.columns, y=p.index, z=p.values, colorscale=cs, showscale=False, visible=(ep == 0.6),
                                 hovertemplate="rain ×%{x}<br>ΔT %{y} °C<br>" + t + " %{z:.2f}<extra></extra>"), 1, c)
steps = [dict(method="update", label=f"{ep:g}", args=[{"visible": [e == ep for e in Eps for _ in outs]}]) for ep in Eps]
fig.update_layout(sliders=[dict(active=Eps.index(0.6), steps=steps, currentvalue=dict(prefix="Soil evaporation factor EpFactor = "), pad=dict(t=30))], height=620)
for i in range(1, 4): fig.update_scenes(dict(xaxis_title="rain scale", yaxis_title="ΔT (°C)", zaxis_title=""), row=1, col=i)
write(fig, "01_E11_Temp_Rain_Evap_3D_surfaces.html", "E11: temperature × rain response surfaces (slider = soil evaporation factor)", "Rotate, zoom and move the slider.")

# 2 Pareto 3D explorer
a = ok(d); a = a[(a.irrigation_mm >= 20)].dropna(subset=["IE_kg_m3", "DPF", "NLF"]); par = set(pd.read_csv(os.path.join(OUT, "07_Derived_Data_Tables", "pareto_runs.csv")).run_id)
fig = go.Figure()
for s in SOILS:
    q = a[a.soil == s]
    fig.add_trace(go.Scatter3d(x=q.DPF * 100, y=q.NLF * 100, z=q.IE_kg_m3, mode="markers", name=SOIL_LAB[s], marker=dict(size=2.5, color=SOIL_COL[s], opacity=0.6),
                               text=q.run_id, hovertemplate="%{text}<br>DPF %{x:.1f} %<br>NLF %{y:.1f} %<br>IE %{z:.2f} kg/m³<extra></extra>"))
q = a[a.run_id.isin(par)]
fig.add_trace(go.Scatter3d(x=q.DPF * 100, y=q.NLF * 100, z=q.IE_kg_m3, mode="markers", name="Pareto-optimal", marker=dict(size=5, color="black", symbol="diamond"),
                           text=q.run_id, hovertemplate="%{text}<extra>Pareto</extra>"))
fig.update_layout(scene=dict(xaxis_title="drainage fraction (%)", yaxis_title="N leaching fraction (%)", zaxis_title="IE (kg/m³)"), height=720)
write(fig, "02_Pareto_tradeoff_3D.html", "Trade-off space of all irrigated runs (hover = run ID; black = Pareto-optimal)", "Click legend items to hide soils.")

# 3 E12 heatmap with rain slider
e12 = ok(d, "E12"); fig = go.Figure(); Ps = sorted(e12.P.unique())
for p_ in Ps:
    pv = e12[e12.P == p_].pivot_table(index="z", columns="trig", values="irrigation_mm"); pv = pv[sorted(pv.columns, reverse=True)]
    fig.add_trace(go.Heatmap(z=pv.values, x=[str(int(-c)) for c in pv.columns], y=[str(int(v)) for v in pv.index], colorscale="YlOrRd", zmin=e12.irrigation_mm.min(),
                             zmax=e12.irrigation_mm.max(), visible=(p_ == 1.0), colorbar=dict(title="mm/yr"),
                             hovertemplate="sensor %{y} cm<br>trigger %{x} cm<br>irrigation %{z:.0f} mm<extra></extra>"))
fig.update_layout(sliders=[dict(active=Ps.index(1.0), currentvalue=dict(prefix="rain scale = "), steps=[dict(method="update", label=f"{p_:g}", args=[{"visible": [q == p_ for q in Ps]}]) for p_ in Ps])],
                  xaxis_title="trigger suction (cm)", yaxis_title="sensor depth (cm)", height=600)
write(fig, "03_E12_Sensor_Trigger_Rain.html", "E12: irrigation demand, sensor depth × trigger (slider = rain)", "Coarse loam, surface irrigation.")

# 4 E14 mulch surface with rain slider
e14 = ok(d, "E14"); fig = go.Figure()
for p_ in Ps:
    pv = e14[e14.P == p_].pivot_table(index="vff", columns="cap", values="soil_evap_mm")
    fig.add_trace(go.Surface(x=pv.columns, y=pv.index, z=pv.values, colorscale="YlOrBr", visible=(p_ == 1.0), cmin=e14.soil_evap_mm.min(), cmax=e14.soil_evap_mm.max(),
                             hovertemplate="capacity %{x} mm<br>vff %{y}<br>soil evap %{z:.0f} mm<extra></extra>"))
fig.update_layout(sliders=[dict(active=Ps.index(1.0), currentvalue=dict(prefix="rain scale = "), steps=[dict(method="update", label=f"{p_:g}", args=[{"visible": [q == p_ for q in Ps]}]) for p_ in Ps])],
                  scene=dict(xaxis_title="interception capacity (mm)", yaxis_title="vapour flux factor", zaxis_title="soil evaporation (mm/yr)"), height=650)
write(fig, "04_E14_Mulch_3D_surface.html", "E14: soil evaporation under mulch (slider = rain)", "Coarse loam, surface irrigation.")

# 5 sensor widget, 20 years
fig = make_subplots(rows=2, cols=1, shared_xaxes=True, subplot_titles=["Coarse loam", "Coarse sand"], vertical_spacing=0.08)
for r_, s in enumerate([L01, S02], 1):
    for rid, name, c in [(f"E0_{s}_Rainfed", "rainfed", METH_COL["Rainfed"]), (f"E2_{s}_h300", "irrigated −300 cm", METH_COL["Surface"])]:
        h = dlf(rid, "Daily-h.dlf"); fig.add_trace(go.Scattergl(x=h.date, y=np.clip(-at_depth(h, "h @", -20.0), 1, None), name=f"{name}", line=dict(color=c, width=1.2),
                                                                showlegend=(r_ == 1)), r_, 1)
    fig.add_hline(y=300, line=dict(color=RED, dash="dash"), row=r_, col=1)
fig.update_yaxes(type="log", title="suction at 20 cm (cm)"); fig.update_xaxes(rangeslider=dict(visible=True), row=2, col=1)
fig.update_layout(height=760)
write(fig, "05_Sensor_widget_1980_2000.html", "Tensiometer widget: suction at 20 cm, 1980–2000 (drag the range slider)", "Red dashed line = irrigation trigger.")

# 6 profile animation 1994
frames, dates = [], None; prof = {}
for s in [L01, S02]:
    for rid, k in [(f"E0_{s}_Rainfed", "Rainfed"), (f"E2_{s}_h300", "Irrigated")]:
        h = dlf(rid, "Daily-h.dlf"); m = (h.date >= "1994-04-01") & (h.date <= "1994-09-30"); h = h[m]
        cols, z = profile_cols(h, "h @"); sel = z >= -150; prof[(s, k)] = (h.date.values, z[sel], np.clip(-h[np.array(cols)[sel]].values, 1, None)); dates = h.date.values
fig = make_subplots(rows=1, cols=2, subplot_titles=["Coarse loam", "Coarse sand"], shared_yaxes=True)
cc = {"Rainfed": METH_COL["Rainfed"], "Irrigated": METH_COL["Surface"]}
for c, s in enumerate([L01, S02], 1):
    for k in ["Rainfed", "Irrigated"]:
        dt, z, v = prof[(s, k)]; fig.add_trace(go.Scatter(x=v[0], y=z, mode="lines+markers", name=k, line=dict(color=cc[k]), showlegend=(c == 1)), 1, c)
    fig.add_vline(x=300, line=dict(color=RED, dash="dash"), row=1, col=c)
for i in range(0, len(dates), 2):
    frames.append(go.Frame(name=str(pd.Timestamp(dates[i]).date()), data=[go.Scatter(x=prof[(s, k)][2][i], y=prof[(s, k)][1]) for s in [L01, S02] for k in ["Rainfed", "Irrigated"]]))
fig.frames = frames
fig.update_xaxes(type="log", range=[0.5, 4.5], title="suction (cm)"); fig.update_yaxes(title="depth (cm)", row=1, col=1)
fig.update_layout(height=650, updatemenus=[dict(type="buttons", x=0.02, y=1.12, buttons=[dict(label="▶ Play", method="animate", args=[None, dict(frame=dict(duration=80, redraw=False), fromcurrent=True)]),
                                                                                       dict(label="❚❚ Pause", method="animate", args=[[None], dict(mode="immediate", frame=dict(duration=0))])])],
                  sliders=[dict(currentvalue=dict(prefix="date: "), steps=[dict(method="animate", label=f.name[5:], args=[[f.name], dict(mode="immediate", frame=dict(duration=0, redraw=False))]) for f in frames])])
write(fig, "06_Profile_animation_1994.html", "Pressure-head profiles through the 1994 season (press Play)", "Rainfed vs irrigated, loam vs sand.")

# 7 E9 soil selector
e9 = ok(d, "E9"); fig = go.Figure()
for s in SOILS:
    pv = e9[e9.soil == s].pivot_table(index="trig", columns="P", values="yield_Mg_ha").sort_index(ascending=False)
    fig.add_trace(go.Heatmap(z=pv.values, x=[f"{c:g}" for c in pv.columns], y=[str(int(-v)) for v in pv.index], colorscale="YlGn", zmin=0, zmax=e9.yield_Mg_ha.quantile(.98),
                             visible=(s == L01), colorbar=dict(title="Mg/ha"), hovertemplate="rain ×%{x}<br>initial suction %{y} cm<br>yield %{z:.2f}<extra></extra>"))
fig.update_layout(updatemenus=[dict(buttons=[dict(label=SOIL_LAB[s], method="update", args=[{"visible": [q == s for q in SOILS]}]) for s in SOILS], x=1.0, y=1.15)],
                  xaxis_title="rain scale", yaxis_title="initial suction (cm)", height=600)
write(fig, "07_E9_Soil_Moisture_Rain.html", "E9: season yield, initial moisture × rain (choose the soil)", "Single-season 1985 rainfed runs.")

# 8 parallel coordinates of all valid runs
v = ok(d).dropna(subset=["yield_Mg_ha"]).copy(); v["expn"] = v.exp.str[1:].astype(int)
fig = go.Figure(go.Parcoords(line=dict(color=v.expn, colorscale="Turbo", showscale=True, colorbar=dict(title="experiment")),
    dimensions=[dict(label="experiment", values=v.expn), dict(label="yield Mg/ha", values=v.yield_Mg_ha), dict(label="irrigation mm", values=v.irrigation_mm),
                dict(label="drainage mm", values=v.drainage_1m_mm), dict(label="soil evap mm", values=v.soil_evap_mm), dict(label="transpiration mm", values=v.transpiration_mm),
                dict(label="N leached kg/ha", values=v.N_leached_kg_ha), dict(label="water stress d", values=v.water_stress_d)]))
fig.update_layout(height=620)
write(fig, "08_All_runs_parallel_coordinates.html", "All 10,041 valid runs: drag along any axis to filter", "Brush ranges to find runs meeting several targets at once.")

# index
links = "\n".join(f'<li><a href="{n}">{t}</a><br><span>{s}</span></li>' for n, t, s in pages)
open(os.path.join(P, "index.html"), "w").write(f"""<!DOCTYPE html><html><head><meta charset="utf-8"><title>Interactive charts</title>
<style>body{{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#23302A}}h1{{color:#154378}}li{{margin:14px 0}}a{{color:#154378;font-weight:bold;font-size:17px}}span{{color:#666}}</style>
</head><body><h1>Interactive charts: coupled water fluxes, irrigation and mulch control</h1>
<p>Open any page in a browser (works offline; keep plotly.min.js in this folder).</p><ol>{links}</ol></body></html>""")
print("interactive done", len(pages))
