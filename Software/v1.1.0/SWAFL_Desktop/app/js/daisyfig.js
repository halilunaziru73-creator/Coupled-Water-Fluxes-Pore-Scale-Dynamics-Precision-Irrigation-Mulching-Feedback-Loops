/* Daisy figures: turns the logs of one or several Daisy runs into the standard figures of a Daisy analysis (yield, water balance, soil water,
   nitrogen budget, chemical fate, comparison of runs). Charts are drawn with the helpers of daisyui.js. */
'use strict';
const DaisyFig = (() => {
  const IO = window.DaisyIO, U = () => DaisyUI.kit;
  const CROPCOL = { 'Spring Barley': '#E69F00', 'Winter Barley': '#56B4E9', 'Winter Rape': '#F0E442', 'Winter Wheat': '#009E73' };
  const col = (d, n) => { if (!d) return null; const j = IO.colIndex(d, n); return j < 0 ? null : d.data[j]; };
  const sum = (d, names, r) => names.reduce((s, n) => { const c = col(d, n); return s + (c && isFinite(c[r]) ? c[r] : 0); }, 0);
  const has = (d, names) => names.some(n => col(d, n));
  const mean = a => { const v = a.filter(isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
  const seasonRows = d => { const rows = []; for (let r = 1; r < d.n; r++) rows.push(r); return rows; };   // the first log line is written at the start of the output, not a season
  const yr = (d, r) => d.time ? new Date(d.time[r]).getUTCFullYear() : r;
  const seasonOf = (d, r) => yr(d, r) - 1;

  // per-run key numbers
  function stats(run) {
    const L = run.logs, o = {}, H = L['Annual-Harvest'], W = L['Annual-FWater'], W1 = L['Annual-FWater_100cm'] || W, N = L['Annual-FN'], N1 = L['Annual-FN_100cm'] || N, T = L['Annual-Tracer'];
    if (H) { const s = col(H, 'sorg_DM'); o.yield = mean(s); o.byCrop = {}; const cr = H.str && H.str.crop; if (cr) cr.forEach((c, i) => { if (isFinite(s[i])) (o.byCrop[c] = o.byCrop[c] || []).push(s[i]); }); Object.keys(o.byCrop).forEach(k => o.byCrop[k] = mean(o.byCrop[k])); }
    if (W) { const rows = seasonRows(W); const m = (d, names) => mean(rows.map(r => sum(d, names, r))); o.rain = m(W, ['Precipitation']); o.irr = m(W, ['Irrigation']); o.aet = m(W, ['Actual evapotranspiration']); o.pet = m(W, ['Potential evapotranspiration']); o.run = m(W, ['Runoff']); const r1 = seasonRows(W1); o.perc = mean(r1.map(r => sum(W1, ['Matrix percolation', 'Biopore percolation'], r))); }
    if (N) { const rows = seasonRows(N), f = (d, names) => mean(rows.map(r => sum(d, names, r))); o.fert = f(N, ['Min-Surface-Fertilizer', 'Min-Soil-Fertilizer', 'Org-Fertilizer']); o.dep = f(N, ['Deposition']); o.upt = f(N, ['Crop-Uptake']); o.den = f(N, ['NO3-Denitrification', 'N2O-Denitrification']); o.vol = f(N, ['Volatilization']); o.min = f(N, ['Mineralization']); o.leach = mean(seasonRows(N1).map(r => sum(N1, ['Matrix-Leaching', 'Biopore-Leaching'], r))); }
    if (T) { const rows = seasonRows(T); o.tSpray = mean(rows.map(r => sum(T, ['Spray'], r))); o.tLeach = mean(rows.map(r => sum(T, ['Leak matrix', 'Leak biopores', 'Soil drain', 'Biopore drain'], r))); o.tDec = mean(rows.map(r => sum(T, ['Soil Decompose', 'Surface Decompose', 'Litter Decompose'], r))); o.tUpt = mean(rows.map(r => sum(T, ['Uptake'], r))); const last = rows[rows.length - 1]; o.tStock = last != null ? sum(T, ['Soil', 'Biopores'], last) : NaN; }
    return o;
  }
  const f1 = (v, d) => isFinite(v) ? (+v).toFixed(d == null ? 1 : d) : '-';
  function summaryTable(runs, tracer) {
    const S = runs.map(r => ({ r, s: stats(r) })), row = (lab, fn, d) => '<tr><td>' + lab + '</td>' + S.map(x => '<td>' + f1(fn(x.s), d) + '</td>').join('') + '</tr>';
    return '<table class="dzt"><tr><th>Mean per season</th>' + S.map(x => '<th>' + x.r.label + '</th>').join('') + '</tr>' + row('Grain / storage organ yield (Mg DM/ha)', s => s.yield, 2) + row('Rain (mm)', s => s.rain, 0) + row('Irrigation (mm)', s => s.irr, 0) + row('Actual evapotranspiration (mm)', s => s.aet, 0) + row('Percolation below 100 cm (mm)', s => s.perc, 0) +
      row('Nitrogen fertiliser (kg N/ha)', s => s.fert, 0) + row('Crop nitrogen uptake (kg N/ha)', s => s.upt, 0) + row('Nitrate leached below 100 cm (kg N/ha)', s => s.leach, 1) + row('Denitrification incl. N2O (kg N/ha)', s => s.den, 1) + (tracer && S.some(x => isFinite(x.s.tSpray)) ? row('Chemical sprayed (g/ha)', s => s.tSpray, 0) + row('Chemical leached below 200 cm (g/ha)', s => s.tLeach, 2) : '') + '</table>';
  }

  // extra chart: grouped bars (categories on x, one bar per series)
  function groupBars(cv, cats, series, o) {
    o = o || {}; const K = U(), { g, w, h } = K.setup(cv, o.h || 280), L = 58, R = 12, T = 28, B = 46, pw = w - L - R, ph = h - T - B;
    let hi = 0, lo = 0; series.forEach(s => s.vals.forEach(v => { if (isFinite(v)) { hi = Math.max(hi, v); lo = Math.min(lo, v); } })); const ny = K.nice(lo, hi || 1, 5), Y = v => T + ph - (v - ny.lo) / (ny.hi - ny.lo) * ph;
    g.strokeStyle = '#e4e7ec'; g.fillStyle = '#555'; g.textAlign = 'right'; ny.t.forEach(v => { const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke(); g.fillText(K.fmt(v, 3), L - 5, y + 3); });
    const gw = pw / cats.length, bw = Math.min(46, gw * 0.8 / series.length); g.textAlign = 'center';
    cats.forEach((c, i) => { const x0 = L + i * gw + (gw - bw * series.length) / 2; series.forEach((s, k) => { const v = s.vals[i]; if (!isFinite(v)) return; g.fillStyle = s.color || K.OKI[k % K.OKI.length]; g.fillRect(x0 + k * bw, Math.min(Y(0), Y(v)), bw - 1, Math.abs(Y(v) - Y(0))); if (series.length * cats.length <= 24) { g.fillStyle = '#222'; g.fillText(K.fmt(v, 2), x0 + k * bw + bw / 2, Y(v) + (v >= 0 ? -3 : 11)); } }); g.fillStyle = '#333'; g.fillText(c, L + (i + 0.5) * gw, h - B + 14); });
    g.strokeStyle = '#333'; g.strokeRect(L, T, pw, ph); g.textAlign = 'left'; let lx = L; series.forEach((s, k) => { g.fillStyle = s.color || K.OKI[k % K.OKI.length]; g.fillRect(lx, 9, 12, 10); g.fillStyle = '#333'; g.fillText(s.name, lx + 16, 18); lx += 26 + g.measureText(s.name).width; });
    if (o.yt) { g.save(); g.translate(12, T + ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = '#333'; g.fillText(o.yt, 0, 0); g.restore(); }
  }
  // extra chart: stacked bars by season
  function stackBars(cv, xs, parts, o) {
    o = o || {}; const K = U(), { g, w, h } = K.setup(cv, o.h || 280), L = 58, R = 12, T = 28, B = 36, pw = w - L - R, ph = h - T - B; let hi = 0;
    xs.forEach((x, i) => { hi = Math.max(hi, parts.reduce((s, p) => s + (isFinite(p.vals[i]) ? p.vals[i] : 0), 0)); (o.line ? [o.line.vals[i]] : []).forEach(v => { if (isFinite(v)) hi = Math.max(hi, v); }); });
    const ny = K.nice(0, hi || 1, 5), Y = v => T + ph - v / ny.hi * ph; g.strokeStyle = '#e4e7ec'; g.fillStyle = '#555'; g.textAlign = 'right'; ny.t.forEach(v => { const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke(); g.fillText(K.fmt(v, 3), L - 5, y + 3); });
    const gw = pw / xs.length, bw = Math.max(3, gw * 0.7); g.textAlign = 'center';
    xs.forEach((x, i) => { let acc = 0; parts.forEach((p, k) => { const v = isFinite(p.vals[i]) ? Math.max(0, p.vals[i]) : 0; g.fillStyle = p.color || K.OKI[k % K.OKI.length]; g.fillRect(L + i * gw + (gw - bw) / 2, Y(acc + v), bw, Y(acc) - Y(acc + v)); acc += v; }); if (xs.length <= 24 || i % 2 === 0) { g.fillStyle = '#333'; g.fillText(String(x), L + (i + 0.5) * gw, h - B + 14); } });
    if (o.line) { g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); let on = false; xs.forEach((x, i) => { const v = o.line.vals[i]; if (!isFinite(v)) return; const px = L + (i + 0.5) * gw; on ? g.lineTo(px, Y(v)) : g.moveTo(px, Y(v)); on = true; }); g.stroke(); g.lineWidth = 1; }
    g.strokeStyle = '#333'; g.strokeRect(L, T, pw, ph); g.textAlign = 'left'; let lx = L; parts.concat(o.line ? [{ name: o.line.name, color: '#000' }] : []).forEach((p, k) => { g.fillStyle = p.color || K.OKI[k % K.OKI.length]; g.fillRect(lx, 9, 12, 10); g.fillStyle = '#333'; g.fillText(p.name, lx + 16, 18); lx += 26 + g.measureText(p.name).width; });
    if (o.yt) { g.save(); g.translate(12, T + ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = '#333'; g.fillText(o.yt, 0, 0); g.restore(); } if (o.xt) { g.fillStyle = '#333'; g.textAlign = 'center'; g.fillText(o.xt, L + pw / 2, h - 4); }
  }

  // ------------------------------------------------------------------ the figures
  const need = (run, keys) => keys.every(k => run.logs[k]);
  const heat = (cv, d, v, o) => { const Lg = IO.depthLong(d, v); if (!Lg) return; U().heat(cv, Lg.t, Lg.z, Lg.v, Object.assign({ time: true, unit: o.unit, yt: 'depth (cm)', h: 300 }, o)); };
  function lib(runs, sc) {
    const F = [], one = i => runs[i] || runs[0];
    const single = (id, title, keys, note, draw, n) => F.push({ id, title, keys, note, n: n || 1, single: true, draw });
    const multi = (id, title, keys, note, draw, n) => F.push({ id, title, keys, note, n: n || 1, single: false, draw });
    single('yield', 'Yield of each crop, season by season', ['Annual-Harvest'], 'Storage-organ dry matter at harvest (grain, rape seed). Colours are the crops of the rotation.', (cvs, run) => {
      const d = run.logs['Annual-Harvest'], s = col(d, 'sorg_DM'), cr = (d.str && d.str.crop) || [], xs = [], vals = []; for (let r = 0; r < d.n; r++) { xs.push(yr(d, r) + ''); vals.push(isFinite(s[r]) ? s[r] : 0); }
      const crops = Array.from(new Set(cr)); const parts = crops.length ? crops.map(c => ({ name: c, color: CROPCOL[c], vals: vals.map((v, i) => cr[i] === c ? v : 0) })) : [{ name: 'storage organ', vals }]; stackBars(cvs[0], xs, parts, { yt: 'Mg DM/ha', xt: 'harvest year' }); });
    single('water', 'Annual water balance', ['Annual-FWater'], 'Seasons run from 1 April to 31 March. Percolation is the water leaving the lowest soil layer.', (cvs, run) => {
      const d = run.logs['Annual-FWater'], d1 = run.logs['Annual-FWater_100cm'] || d, rows = seasonRows(d), x = rows.map(r => seasonOf(d, r)), rows1 = seasonRows(d1);
      const ser = [{ name: 'Rain', x, y: rows.map(r => sum(d, ['Precipitation'], r)), color: '#0072B2' }, { name: 'Irrigation', x, y: rows.map(r => sum(d, ['Irrigation'], r)), color: '#56B4E9' }, { name: 'Actual evapotranspiration', x, y: rows.map(r => sum(d, ['Actual evapotranspiration'], r)), color: '#D55E00' }, { name: 'Potential evapotranspiration', x, y: rows.map(r => sum(d, ['Potential evapotranspiration'], r)), color: '#E69F00', step: false }, { name: 'Percolation below 100 cm', x: rows1.map(r => seasonOf(d1, r)), y: rows1.map(r => sum(d1, ['Matrix percolation', 'Biopore percolation'], r)), color: '#009E73' }];
      U().line(cvs[0], ser.map(s => Object.assign({ pts: true, line: true, r: 2.4 }, s)), { zero: true, xt: 'season starting 1 April', yt: 'mm per season', h: 300 }); });
    single('theta', 'Water content through the soil profile', ['Daily-Theta'], 'Volumetric water content (cm3/cm3) by depth and day. Dry spells, wetting fronts and the effect of irrigation show as bands.', (cvs, run) => heat(cvs[0], run.logs['Daily-Theta'], 'Theta', { unit: 'water content' }));
    single('pf', 'Soil water suction (pF)', ['Daily-pF'], 'pF = log10 of the suction in cm. Field capacity is near pF 2, the wilting point at pF 4.2; red is dry.', (cvs, run) => heat(cvs[0], run.logs['Daily-pF'], 'h', { unit: 'pF', lo: 0, hi: 5 }));
    single('crop', 'Crop growth: leaf area and stress', ['Daily-CropProduction'], 'Leaf area index through the rotation, and the water and nitrogen stress factors (1 = no stress).', (cvs, run) => {
      const d = run.logs['Daily-CropProduction'], x = d.time || d.data[0].map((_, i) => i);
      U().line(cvs[0], [{ name: 'Leaf area index', x, y: col(d, 'LAI'), color: '#009E73' }], { time: !!d.time, zero: true, yt: 'm2/m2', h: 220 });
      const ws = col(d, 'water_stress'), ns = col(d, 'nitrogen_stress'), ser = []; if (ws) ser.push({ name: 'Water stress', x, y: ws, color: '#0072B2' }); if (ns) ser.push({ name: 'Nitrogen stress', x, y: ns, color: '#D55E00' }); U().line(cvs[1], ser, { time: !!d.time, yt: 'stress factor (1 = none)', h: 200, ylo: 0, yhi: 1.05 }); }, 2);
    single('nbudget', 'Where does the nitrogen go?', ['Annual-FN'], 'Fate of the mineral nitrogen each season (bars) against the fertiliser applied (line). Leaching is below 100 cm.', (cvs, run) => {
      const d = run.logs['Annual-FN'], d1 = run.logs['Annual-FN_100cm'] || d, rows = seasonRows(d), xs = rows.map(r => seasonOf(d, r)), rows1 = seasonRows(d1);
      stackBars(cvs[0], xs, [{ name: 'Crop uptake', color: '#009E73', vals: rows.map(r => sum(d, ['Crop-Uptake'], r)) }, { name: 'Leaching below 100 cm', color: '#0072B2', vals: rows1.map(r => sum(d1, ['Matrix-Leaching', 'Biopore-Leaching'], r)) }, { name: 'Denitrification (N2, N2O)', color: '#D55E00', vals: rows.map(r => sum(d, ['NO3-Denitrification', 'N2O-Denitrification'], r)) }, { name: 'Volatilisation', color: '#E69F00', vals: rows.map(r => sum(d, ['Volatilization'], r)) }], { yt: 'kg N/ha', xt: 'season starting 1 April', line: { name: 'Fertiliser applied', vals: rows.map(r => sum(d, ['Min-Surface-Fertilizer', 'Min-Soil-Fertilizer', 'Org-Fertilizer'], r)) } }); });
    single('no3', 'Nitrate in the soil solution', ['Daily-SNO3'], 'Nitrate concentration by depth and day; the pulse after each fertiliser dressing moves down with the drainage water.', (cvs, run) => heat(cvs[0], run.logs['Daily-SNO3'], 'C', { unit: 'mg N/l' }));
    single('tracer', 'Fate of the chemical, season by season', ['Annual-Tracer'], 'What happens to the sprayed amount: leaching below 200 cm, degradation, plant uptake, and what remains in the soil at the end of the season.', (cvs, run) => {
      const d = run.logs['Annual-Tracer'], rows = seasonRows(d), xs = rows.map(r => seasonOf(d, r)); stackBars(cvs[0], xs, [{ name: 'Leached', color: '#0072B2', vals: rows.map(r => sum(d, ['Leak matrix', 'Leak biopores', 'Soil drain', 'Biopore drain'], r)) }, { name: 'Degraded in soil', color: '#D55E00', vals: rows.map(r => sum(d, ['Soil Decompose', 'Surface Decompose', 'Litter Decompose'], r)) }, { name: 'Taken up by plants', color: '#009E73', vals: rows.map(r => sum(d, ['Uptake'], r)) }, { name: 'Left on harvest and canopy', color: '#E69F00', vals: rows.map(r => sum(d, ['Harvest', 'Dissipate'], r)) }], { yt: 'g/ha', xt: 'season starting 1 April', line: { name: 'Sprayed', vals: rows.map(r => sum(d, ['Spray'], r)) } }); });
    single('tracerProf', 'Chemical concentration through the soil profile', ['Daily-Tracer_conc'], 'Concentration by depth and day. A mobile chemical travels down with the water; a sorbing one stays near the surface.', (cvs, run) => heat(cvs[0], run.logs['Daily-Tracer_conc'], 'C', { unit: 'mg/l' }));
    multi('cmpYield', 'Yield by crop: runs compared', ['Annual-Harvest'], 'Mean storage-organ dry matter per crop.', cvs => {
      const S = runs.map(stats), crops = Array.from(new Set([].concat(...S.map(s => Object.keys(s.byCrop || {}))))); groupBars(cvs[0], crops.concat(['All crops']), runs.map((r, i) => ({ name: r.label, vals: crops.map(c => (S[i].byCrop || {})[c]).concat([S[i].yield]) })), { yt: 'Mg DM/ha' }); });
    multi('cmpWater', 'Water balance: runs compared', ['Annual-FWater'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Rain', 'Irrigation', 'Actual evapotranspiration', 'Percolation below 100 cm', 'Runoff']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: r.label, vals: [S[i].rain, S[i].irr, S[i].aet, S[i].perc, S[i].run] })), { yt: 'mm per season' }); });
    multi('cmpN', 'Nitrogen: runs compared', ['Annual-FN'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Fertiliser', 'Crop uptake', 'Leaching below 100 cm', 'Denitrification', 'Mineralisation']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: r.label, vals: [S[i].fert, S[i].upt, S[i].leach, S[i].den, S[i].min] })), { yt: 'kg N/ha per season' }); });
    multi('nresp', 'Response to the nitrogen rate', ['Annual-FN', 'Annual-Harvest'], 'Yield and nitrate leaching against the nitrogen applied: the point where extra fertiliser stops paying while leaching keeps rising.', cvs => {
      const P = runs.map(r => ({ r, s: stats(r) })).filter(p => isFinite(p.s.fert)).sort((a, b) => a.s.fert - b.s.fert); const x = P.map(p => p.s.fert);
      U().line(cvs[0], [{ name: 'Yield (Mg DM/ha)', x, y: P.map(p => p.s.yield), pts: true, line: true, color: '#009E73', r: 4 }], { xt: 'nitrogen applied (kg N/ha per season)', yt: 'Mg DM/ha', h: 220, zero: true });
      U().line(cvs[1], [{ name: 'Nitrate leached (kg N/ha)', x, y: P.map(p => p.s.leach), pts: true, line: true, color: '#0072B2', r: 4 }, { name: 'Denitrification (kg N/ha)', x, y: P.map(p => p.s.den), pts: true, line: true, color: '#D55E00', r: 4 }], { xt: 'nitrogen applied (kg N/ha per season)', yt: 'kg N/ha', h: 220, zero: true }); }, 2);
    multi('cmpTracer', 'Chemical fate: runs compared', ['Annual-Tracer'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Sprayed', 'Leached below 200 cm', 'Degraded', 'Plant uptake']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: r.label, vals: [S[i].tSpray, S[i].tLeach, S[i].tDec, S[i].tUpt] })), { yt: 'g/ha per season' }); });
    multi('cmpYieldSeries', 'Yield through the years: runs compared', ['Annual-Harvest'], 'Storage-organ dry matter at each harvest.', cvs => {
      U().line(cvs[0], runs.map((r, i) => { const d = r.logs['Annual-Harvest'], s = col(d, 'sorg_DM'); return { name: r.label, x: d.data[0], y: s, pts: true, line: true, r: 2.6 }; }), { xt: 'harvest year', yt: 'Mg DM/ha', h: 260, zero: true }); });
    return F;
  }
  // the figures of a scenario that the available logs can draw, then the extra generic ones
  function plan(sc, runs) {
    const all = lib(runs, sc), want = (sc && sc.figs) || [], out = []; const add = f => { if (out.some(x => x.id === f.id)) return; if (f.keys.every(k => runs.every(r => r.logs[k]) || (f.single && runs.some(r => r.logs[k])))) out.push(f); };
    want.forEach(id => { const f = all.find(x => x.id === id); if (f) add(f); }); if (runs.length > 1) { const y = all.find(x => x.id === 'cmpYieldSeries'); if (y) add(y); } all.forEach(f => { if (!want.length) add(f); });
    return out.filter(f => f.single ? runs.some(r => f.keys.every(k => r.logs[k])) : (runs.length > 1 && f.keys.every(k => runs.every(r => r.logs[k]))));
  }
  return { plan, stats, summaryTable, groupBars, stackBars, CROPCOL, col };
})();
