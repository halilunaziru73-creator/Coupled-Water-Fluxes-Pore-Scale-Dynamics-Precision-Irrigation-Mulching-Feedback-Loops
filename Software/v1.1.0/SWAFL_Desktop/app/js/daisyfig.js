/* Daisy figures: turns the logs of one or several Daisy runs into the standard figures of a Daisy analysis (yield, water balance, soil water,
   nitrogen budget, chemical fate, comparison of runs). Charts are drawn with the helpers of daisyui.js. */
'use strict';
const DaisyFig = (() => {
  const IO = window.DaisyIO, U = () => DaisyUI.kit;
  const CROPCOL = { 'Spring Barley': '#E69F00', 'Winter Barley': '#56B4E9', 'Winter Rape': '#F0E442', 'Winter Wheat': '#009E73' };
  const col = (d, n) => { if (!d) return null; const j = IO.colIndex(d, n); return j < 0 ? null : d.data[j]; };
  const sum = (d, names, r) => names.reduce((s, n) => { const c = col(d, n); return s + (c && isFinite(c[r]) ? c[r] : 0); }, 0);
  const has = (d, names) => names.some(n => col(d, n));
  const mean = a => { const v = (a || []).filter(isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
  const seasonRows = d => { const rows = []; for (let r = 1; r < d.n; r++) rows.push(r); return rows; };   // the first log line is written at the start of the output, not a season
  const yr = (d, r) => d.time ? new Date(d.time[r]).getUTCFullYear() : r;
  const seasonOf = (d, r) => yr(d, r) - 1;

  // per-run key numbers
  function stats(run) {
    const L = run.logs, o = {}, H = L['Annual-Harvest'], W = L['Annual-FWater'], W1 = L['Annual-FWater_100cm'] || W, N = L['Annual-FN'], N1 = L['Annual-FN_100cm'] || N, T = L['Annual-Tracer'];
    if (H) { const s = col(H, 'sorg_DM'); o.yield = mean(s); o.wstress = mean(col(H, 'WStress')); o.nstress = mean(col(H, 'NStress')); o.wpet = mean(col(H, 'WP_ET')); o.hi = mean(col(H, 'HI')); o.byCrop = {}; const cr = H.str && H.str.crop; if (cr) cr.forEach((c, i) => { if (isFinite(s[i])) (o.byCrop[c] = o.byCrop[c] || []).push(s[i]); }); Object.keys(o.byCrop).forEach(k => o.byCrop[k] = mean(o.byCrop[k])); }
    if (W) { const rows = seasonRows(W); const m = (d, names) => mean(rows.map(r => sum(d, names, r))); o.rain = m(W, ['Precipitation']); o.irr = m(W, ['Irrigation']); o.aet = m(W, ['Actual evapotranspiration']); o.pet = m(W, ['Potential evapotranspiration']); o.run = m(W, ['Runoff']); const r1 = seasonRows(W1); o.perc = mean(r1.map(r => sum(W1, ['Matrix percolation', 'Biopore percolation'], r))); }
    if (N) { const rows = seasonRows(N), f = (d, names) => mean(rows.map(r => sum(d, names, r))); o.fert = f(N, ['Min-Surface-Fertilizer', 'Min-Soil-Fertilizer', 'Org-Fertilizer']); o.dep = f(N, ['Deposition']); o.upt = f(N, ['Crop-Uptake']); o.den = f(N, gasN(N)); o.vol = f(N, ['Volatilization']); o.min = f(N, ['Mineralization']); o.leach = mean(seasonRows(N1).map(r => sum(N1, ['Matrix-Leaching', 'Biopore-Leaching'], r))); }
    if (T) { const rows = seasonRows(T); o.tSpray = mean(rows.map(r => sum(T, ['Spray'], r))); o.tLeach = mean(rows.map(r => sum(T, ['Leak matrix', 'Leak biopores', 'Soil drain', 'Biopore drain'], r))); o.tDec = mean(rows.map(r => sum(T, ['Soil Decompose', 'Surface Decompose', 'Litter Decompose'], r))); o.tUpt = mean(rows.map(r => sum(T, ['Uptake'], r))); const last = rows[rows.length - 1]; o.tStock = last != null ? sum(T, ['Soil', 'Biopores'], last) : NaN; }
    return o;
  }
  // gaseous nitrogen losses: denitrification (the column of Daisy 7 is called Denitrification) and the N2O of nitrification
  const gasN = d => (col(d, 'Denitrification') ? ['Denitrification'] : ['NO3-Denitrification', 'N2O-Denitrification']).concat(['N2O-Nitrification']);
  // the efficiency indices: yield and irrigation in mm, nitrogen in kg N/ha, 1 mm = 10 m3/ha
  function indices(runs) {
    const S = runs.map(stats), ref = S.find(s => isFinite(s.yield) && !(s.irr > 1));
    return runs.map((r, i) => { const s = S[i], inp = (s.rain || 0) + (s.irr || 0);
      return { IE: s.irr > 5 ? s.yield * 1000 / (s.irr * 10) : NaN, IWUE: ref && s !== ref && s.irr > 5 ? (s.yield - ref.yield) * 1000 / (s.irr * 10) : NaN, DPF: inp > 0 && isFinite(s.perc) ? 100 * s.perc / inp : NaN, PFPn: s.fert > 1 ? s.yield * 1000 / s.fert : NaN, NLF: s.fert > 1 && isFinite(s.leach) ? 100 * s.leach / s.fert : NaN }; });
  }
  const INDEX = [['IE', 'Irrigation efficiency: yield per irrigation applied', 'kg m-3'], ['IWUE', 'Irrigation water use efficiency: yield gain over rainfed per irrigation', 'kg m-3'], ['DPF', 'Deep percolation fraction: drainage below 1 m per (irrigation + rain)', '%'], ['PFPn', 'Nitrogen efficiency (PFPn): yield per nitrogen applied', 'kg DM per kg N'], ['NLF', 'Nitrogen leaching fraction: nitrate leached below 1 m per nitrogen applied', '%']];
  const f1 = (v, d) => isFinite(v) ? (+v).toFixed(d == null ? 1 : d) : '-';
  function summaryTable(runs, tracer) {
    const IX = indices(runs), S = runs.map((r, i) => ({ r, s: Object.assign(stats(r), IX[i]) })), row = (lab, fn, d) => '<tr><td>' + lab + '</td>' + S.map(x => '<td>' + f1(fn(x.s), d) + '</td>').join('') + '</tr>';
    return '<table class="dzt"><tr><th>Mean per season</th>' + S.map(x => '<th>' + x.r.label + '</th>').join('') + '</tr>' + row('Grain / storage organ yield (Mg DM/ha)', s => s.yield, 2) + row('Water-stress days at harvest (d)', s => s.wstress, 1) + row('Nitrogen-stress days at harvest (d)', s => s.nstress, 1) + row('Rain (mm)', s => s.rain, 0) + row('Irrigation (mm)', s => s.irr, 0) + row('Actual evapotranspiration (mm)', s => s.aet, 0) + row('Percolation below 100 cm (mm)', s => s.perc, 0) +
      row('Nitrogen fertiliser (kg N/ha)', s => s.fert, 0) + row('Crop nitrogen uptake (kg N/ha)', s => s.upt, 0) + row('Nitrate leached below 100 cm (kg N/ha)', s => s.leach, 1) + row('Gaseous N loss: denitrification and N2O (kg N/ha)', s => s.den, 1) + INDEX.filter(q => IX.some(v => isFinite(v[q[0]]))).map(q => row(q[1].split(':')[0] + ' (' + q[2] + ')', s => s[q[0]], 2)).join('') + (tracer && S.some(x => isFinite(x.s.tSpray)) ? row('Chemical sprayed (g/ha)', s => s.tSpray, 0) + row('Chemical leached below 200 cm (g/ha)', s => s.tLeach, 2) : '') + '</table>';
  }

  // grouped and stacked bars: drawn by the plotting engine (daisyplot.js)
  const groupBars = (cv, cats, series, o) => window.DaisyPlot.groupBars(cv, cats, series, o);
  const stackBars = (cv, xs, parts, o) => window.DaisyPlot.stackBars(cv, xs, parts, o);

  // ------------------------------------------------------------------ the figures
  const need = (run, keys) => keys.every(k => run.logs[k]);
  const heat = (cv, d, v, o) => { const Lg = IO.depthLong(d, v); if (!Lg) return; U().heat(cv, Lg.t, Lg.z, Lg.v, Object.assign({ time: true, unit: o.unit, h: 300 }, o)); };
  const unitOf = (d, c, dflt) => { const j = IO.colIndex(d, c); const u = j < 0 ? '' : d.units[d.cols[j]]; return u || dflt || ''; };
  const heatUnit = (d, v, dflt) => { const dc = IO.depthColumns(d)[v]; return (dc && d.units[dc[0].c]) || dflt || ''; };
  const seasonLab = d => 'Season starting 1 April (year)';
  function lib(runs, sc) {
    const F = [], one = i => runs[i] || runs[0];
    const single = (id, title, keys, note, draw, n) => F.push({ id, title, keys, note, n: typeof n === 'function' ? n(one(0)) : (n || 1), single: true, draw });
    const multi = (id, title, keys, note, draw, n) => F.push({ id, title, keys, note, n: typeof n === 'function' ? n() : (n || 1), single: false, draw });
    const label = r => r.label || r.id;
    single('yield', 'Yield of each crop, season by season', ['Annual-Harvest'], 'Storage-organ dry matter at harvest (grain, rape seed), coloured by crop; below, the storage organ against the stem, harvest by harvest (Annual-Harvest.dlf).', (cvs, run) => {
      const d = run.logs['Annual-Harvest'], s = col(d, 'sorg_DM') || [], st = col(d, 'stem_DM'), cr = (d.str && d.str.crop) || [], xs = [], vals = [], stem = [];
      for (let r = 0; r < d.n; r++) { xs.push(yr(d, r) + ''); vals.push(isFinite(s[r]) ? s[r] : 0); stem.push(st ? st[r] : NaN); }
      const crops = Array.from(new Set(cr)); const parts = crops.length ? crops.map(c => ({ name: c, color: CROPCOL[c], vals: vals.map((v, i) => cr[i] === c ? v : 0) })) : [{ name: 'Storage organ', vals }];
      stackBars(cvs[0], xs, parts, { title: 'Storage organ dry matter at harvest', yt: 'Dry matter (Mg ha-1)', xt: 'Harvest year', h: 300 });
      const x = d.time ? d.data[IO.colIndex(d, 'year')] : xs.map(Number);
      U().line(cvs[1], [{ name: 'Storage organ DM', x, y: s, pts: true, line: true, color: '#D55E00' }].concat(st ? [{ name: 'Stem DM', x, y: stem, pts: true, line: true, color: '#0072B2' }] : []), { title: 'Storage organ and stem dry matter over time', xt: 'Year', yt: 'Dry matter (Mg ha-1)', zero: true, xint: true, h: 290 }); }, 2);
    single('water', 'Annual water balance', ['Annual-FWater'], 'Water entering the field (bars) against what leaves as evapotranspiration and drainage (lines). Seasons run from 1 April to 31 March; percolation is the water leaving the soil below 100 cm (Annual-FWater.dlf).', (cvs, run) => {
      const d = run.logs['Annual-FWater'], d1 = run.logs['Annual-FWater_100cm'] || d, rows = seasonRows(d), x = rows.map(r => seasonOf(d, r) + ''), rows1 = seasonRows(d1);
      stackBars(cvs[0], x, [{ name: 'Rain', color: '#0072B2', vals: rows.map(r => sum(d, ['Precipitation'], r)) }, { name: 'Irrigation', color: '#56B4E9', vals: rows.map(r => sum(d, ['Irrigation'], r)) }],
        { title: 'Annual water balance', yt: 'Water (mm per season)', xt: 'Season starting 1 April', h: 320, lines: [{ name: 'Actual evapotranspiration', color: '#D55E00', vals: rows.map(r => sum(d, ['Actual evapotranspiration'], r)) }, { name: 'Potential evapotranspiration', color: '#E69F00', dash: [5, 4], vals: rows.map(r => sum(d, ['Potential evapotranspiration'], r)) }, { name: 'Percolation below 100 cm', color: '#009E73', vals: rows1.map(r => sum(d1, ['Matrix percolation', 'Biopore percolation'], r)) }] }); });
    single('dailyWater', 'Cumulative water fluxes through the run', ['Daily-FWater'], 'Running totals of rain, irrigation and evapotranspiration over the whole simulation, day by day. The gap between inflow and outflow is the water drained or stored (Daily-FWater.dlf).', (cvs, run) => {
      const d = run.logs['Daily-FWater'], x = d.time || d.data[0].map((_, i) => i), cum = n => { const c = col(d, n); if (!c) return null; let a = 0; return c.map(v => (a += isFinite(v) ? v : 0)); };
      const S = [['Precipitation', 'Rain', '#0072B2'], ['Irrigation', 'Irrigation', '#56B4E9'], ['Actual evapotranspiration', 'Actual evapotranspiration', '#D55E00'], ['Potential evapotranspiration', 'Potential evapotranspiration', '#E69F00']].map(a => { const y = cum(a[0]); return y && y[y.length - 1] > 0 ? { name: a[1], x, y, color: a[2], dash: a[0].startsWith('Potential') ? [5, 4] : null } : null; }).filter(Boolean);
      U().line(cvs[0], S, { title: 'Cumulative water fluxes', time: !!d.time, xt: d.time ? 'Year' : 'Day', yt: 'Water (mm, running total)', zero: true, h: 320 }); });
    single('theta', 'Water content through the soil profile', ['Daily-Theta'], 'Volumetric water content by depth and day: dry spells, wetting fronts and the effect of irrigation (Daily-Theta.dlf).', (cvs, run) => { const d = run.logs['Daily-Theta']; heat(cvs[0], d, 'Theta', { title: 'Soil water content', unit: heatUnit(d, 'Theta', 'cm3 cm-3'), pal: 'blues', time: true, h: 330 }); });
    single('pf', 'Soil water suction (pF)', ['Daily-pF'], 'pF is the logarithm of the suction in cm of water. Field capacity is near pF 2 and the wilting point at pF 4.2; the warm colours are dry soil (Daily-pF.dlf).', (cvs, run) => { const d = run.logs['Daily-pF']; heat(cvs[0], d, 'h', { title: 'Soil water suction', unit: 'pF', pal: 'pf', lo: 0, hi: 5, time: true, h: 330, marks: [{ v: 2, label: 'FC' }, { v: 4.2, label: 'WP' }] }); });
    single('crop', 'Crop growth: leaf area, stress and dry matter', ['Daily-CropProduction'], 'Leaf area index, the water and nitrogen stress (0 = none, 1 = no production) and the dry matter of the plant parts through the rotation (Daily-CropProduction.dlf).', (cvs, run) => {
      const d = run.logs['Daily-CropProduction'], x = d.time || d.data[0].map((_, i) => i), tm = !!d.time;
      U().line(cvs[0], [{ name: 'Leaf area index', x, y: col(d, 'LAI') || [], color: '#009E73' }], { title: 'Leaf area index', time: tm, xt: tm ? 'Year' : 'Day', zero: true, yt: 'LAI (m2 m-2)', h: 250, noLegend: true });
      const ws = col(d, 'water_stress'), ns = col(d, 'nitrogen_stress'), ser = []; if (ws) ser.push({ name: 'Water stress', x, y: ws, color: '#0072B2' }); if (ns) ser.push({ name: 'Nitrogen stress', x, y: ns, color: '#D55E00' });
      U().line(cvs[1], ser, { title: 'Crop stress (0 = none, 1 = no production)', time: tm, xt: tm ? 'Year' : 'Day', yt: 'Stress factor (-)', ylo: 0, yhi: 1, h: 250 });
      if (cvs[2]) { const P = [['WSOrg', 'Storage organ', '#D55E00'], ['WStem', 'Stem', '#0072B2'], ['WLeaf', 'Leaves', '#009E73'], ['WRoot', 'Roots', '#CC79A7']].map(a => { const y = col(d, a[0]); return y ? { name: a[1], x, y, color: a[2] } : null; }).filter(Boolean); U().line(cvs[2], P, { title: 'Dry matter of the plant parts', time: tm, xt: tm ? 'Year' : 'Day', zero: true, yt: 'Dry matter (Mg ha-1)', h: 270, empty: 'The crop log has no dry-matter columns.' }); } }, run0 => { const d = run0.logs['Daily-CropProduction']; return d && (col(d, 'WSOrg') || col(d, 'WLeaf')) ? 3 : 2; });
    single('nbudget', 'Where does the nitrogen go?', ['Annual-FN'], 'Fate of the mineral nitrogen each season (bars) against the fertiliser applied (line). Leaching is below 100 cm (Annual-FN.dlf).', (cvs, run) => {
      const d = run.logs['Annual-FN'], d1 = run.logs['Annual-FN_100cm'] || d, rows = seasonRows(d), xs = rows.map(r => seasonOf(d, r) + ''), rows1 = seasonRows(d1);
      stackBars(cvs[0], xs, [{ name: 'Crop uptake', color: '#009E73', vals: rows.map(r => sum(d, ['Crop-Uptake'], r)) }, { name: 'Leaching below 100 cm', color: '#0072B2', vals: rows1.map(r => sum(d1, ['Matrix-Leaching', 'Biopore-Leaching'], r)) }, { name: 'Gaseous loss (denitrification, N2O)', color: '#D55E00', vals: rows.map(r => sum(d, gasN(d), r)) }, { name: 'Volatilisation', color: '#CC79A7', vals: rows.map(r => sum(d, ['Volatilization'], r)) }],
        { title: 'Fate of the nitrogen', yt: 'Nitrogen (kg N ha-1 per season)', xt: 'Season starting 1 April', h: 320, lines: [{ name: 'Fertiliser applied', color: '#000000', vals: rows.map(r => sum(d, ['Min-Surface-Fertilizer', 'Min-Soil-Fertilizer', 'Org-Fertilizer'], r)) }, { name: 'Mineralisation', color: '#E69F00', dash: [5, 4], vals: rows.map(r => sum(d, ['Mineralization'], r)) }] }); });
    single('no3', 'Nitrate in the soil solution', ['Daily-SNO3'], 'Nitrate concentration by depth and day; the pulse after each fertiliser dressing moves down with the drainage water (Daily-SNO3.dlf).', (cvs, run) => { const d = run.logs['Daily-SNO3']; heat(cvs[0], d, 'C', { title: 'Nitrate in the soil solution', unit: heatUnit(d, 'C', 'mg l-1'), pal: 'ylgn', time: true, h: 330 }); });
    single('tracer', 'Fate of the chemical, season by season', ['Annual-Tracer'], 'What happens to the sprayed amount: leaching below 200 cm, degradation, plant uptake, and what remains in the soil at the end of the season (Annual-Tracer.dlf).', (cvs, run) => {
      const d = run.logs['Annual-Tracer'], rows = seasonRows(d), xs = rows.map(r => seasonOf(d, r) + ''); stackBars(cvs[0], xs, [{ name: 'Leached', color: '#0072B2', vals: rows.map(r => sum(d, ['Leak matrix', 'Leak biopores', 'Soil drain', 'Biopore drain'], r)) }, { name: 'Degraded in soil', color: '#D55E00', vals: rows.map(r => sum(d, ['Soil Decompose', 'Surface Decompose', 'Litter Decompose'], r)) }, { name: 'Taken up by the crop', color: '#009E73', vals: rows.map(r => sum(d, ['Uptake'], r)) }],
        { title: 'Fate of the chemical', yt: 'Chemical (g ha-1 per season)', xt: 'Season starting 1 April', h: 320, lines: [{ name: 'Sprayed', color: '#000000', vals: rows.map(r => sum(d, ['Spray'], r)) }] }); });
    single('tracerProf', 'Chemical concentration through the soil profile', ['Daily-Tracer_conc'], 'Concentration by depth and day. A mobile chemical travels down with the water; a sorbing one stays near the surface (Daily-Tracer_conc.dlf).', (cvs, run) => { const d = run.logs['Daily-Tracer_conc']; heat(cvs[0], d, 'C', { title: 'Chemical in the soil solution', unit: heatUnit(d, 'C', 'mg l-1'), pal: 'ylorrd', time: true, h: 330 }); });
    multi('cmpYield', 'Yield by crop: runs compared', ['Annual-Harvest'], 'Mean storage-organ dry matter per crop.', cvs => {
      const S = runs.map(stats), crops = Array.from(new Set([].concat(...S.map(s => Object.keys(s.byCrop || {}))))); groupBars(cvs[0], crops.concat(['All crops']), runs.map((r, i) => ({ name: label(r), vals: crops.map(c => (S[i].byCrop || {})[c]).concat([S[i].yield]) })), { title: 'Yield by crop', yt: 'Dry matter (Mg ha-1)', legend: true, h: 320 }); });
    multi('cmpWater', 'Water balance: runs compared', ['Annual-FWater'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Rain', 'Irrigation', 'Actual evapotranspiration', 'Percolation below 100 cm', 'Runoff']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: label(r), vals: [S[i].rain, S[i].irr, S[i].aet, S[i].perc, S[i].run] })), { title: 'Water balance', yt: 'Water (mm per season)', legend: true, h: 320 }); });
    multi('cmpN', 'Nitrogen: runs compared', ['Annual-FN'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Fertiliser', 'Crop uptake', 'Leaching below 100 cm', 'Gaseous loss', 'Mineralisation']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: label(r), vals: [S[i].fert, S[i].upt, S[i].leach, S[i].den, S[i].min] })), { title: 'Nitrogen balance', yt: 'Nitrogen (kg N ha-1 per season)', legend: true, h: 320 }); });
    multi('nresp', 'Response to the nitrogen rate', ['Annual-FN', 'Annual-Harvest'], 'Yield and nitrate leaching against the nitrogen applied: the point where extra fertiliser stops paying while leaching keeps rising.', cvs => {
      const P = runs.map(r => ({ r, s: stats(r) })).filter(p => isFinite(p.s.fert)).sort((a, b) => a.s.fert - b.s.fert); const x = P.map(p => p.s.fert);
      U().line(cvs[0], [{ name: 'Yield', x, y: P.map(p => p.s.yield), pts: true, line: true, color: '#009E73', r: 4 }], { title: 'Yield against the nitrogen applied', xt: 'Nitrogen applied (kg N ha-1 per season)', yt: 'Dry matter (Mg ha-1)', h: 260, zero: true, noLegend: true });
      U().line(cvs[1], [{ name: 'Nitrate leached', x, y: P.map(p => p.s.leach), pts: true, line: true, color: '#0072B2', r: 4 }, { name: 'Denitrification', x, y: P.map(p => p.s.den), pts: true, line: true, color: '#D55E00', r: 4 }], { title: 'Losses against the nitrogen applied', xt: 'Nitrogen applied (kg N ha-1 per season)', yt: 'Nitrogen (kg N ha-1)', h: 280, zero: true }); }, 2);
    multi('indices', 'Efficiency indices: runs compared', ['Annual-FWater'], 'Irrigation efficiency and irrigation water use efficiency (kg of yield per m3 of irrigation water), the deep percolation fraction, the nitrogen efficiency PFPn (kg DM per kg N applied) and the nitrate leaching fraction. An index is shown only when the runs have what it needs (irrigation, a rainfed run, fertiliser).', cvs => {
      const IX = indices(runs), act = INDEX.filter(q => IX.some(v => isFinite(v[q[0]]))); act.forEach((q, k) => { if (cvs[k]) groupBars(cvs[k], runs.map(label), [{ name: q[1], vals: IX.map(v => v[q[0]]), color: window.DaisyPlot.OKI[k % 8] }], { title: q[1], yt: q[2], panel: 'abcdef'[k], h: 250 }); }); }, () => Math.max(1, INDEX.filter(q => indices(runs).some(v => isFinite(v[q[0]]))).length));
    multi('cmpTracer', 'Chemical fate: runs compared', ['Annual-Tracer'], 'Mean per season.', cvs => {
      const S = runs.map(stats), cats = ['Sprayed', 'Leached below 200 cm', 'Degraded', 'Plant uptake']; groupBars(cvs[0], cats, runs.map((r, i) => ({ name: label(r), vals: [S[i].tSpray, S[i].tLeach, S[i].tDec, S[i].tUpt] })), { title: 'Chemical fate', yt: 'Chemical (g ha-1 per season)', legend: true, h: 320 }); });
    multi('cmpYieldSeries', 'Yield through the years: runs compared', ['Annual-Harvest'], 'Storage-organ dry matter at each harvest.', cvs => {
      U().line(cvs[0], runs.map((r, i) => { const d = r.logs['Annual-Harvest'], s = col(d, 'sorg_DM'); return { name: label(r), x: d.data[IO.colIndex(d, 'year')] || d.data[0], y: s || [], pts: true, line: true, r: 3 }; }), { title: 'Storage organ dry matter over time', xt: 'Year', yt: 'Dry matter (Mg ha-1)', h: 300, zero: true, xint: true }); });
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
