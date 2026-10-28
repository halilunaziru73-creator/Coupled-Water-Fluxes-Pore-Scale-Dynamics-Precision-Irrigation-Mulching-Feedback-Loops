/* Daisy workbench: the annual results of a Daisy run (yield, water, nitrogen and chemical fate, season by season) in the form the decision-support layers of the SWAFL project use.
   The same code makes the bundled results (tools/build_daisy_dss.js) and the results of the run you have just made, so the two are always comparable. */
'use strict';
(function (root) {
  const D = {};
  // a Daisy log file as text -> { names, rows }; used by the build tool, the browser uses D.fromLog with the logs the workbench has read
  D.parseDlf = function (t) {
    const L = String(t).split('\n'), i = L.findIndex(l => /^year\t/.test(l)); if (i < 0) return null; const names = L[i].split('\t').map(s => s.trim()), rows = [];
    for (let k = i + 2; k < L.length; k++) { if (!L[k].trim()) continue; rows.push(L[k].split('\t').map((x, j) => names[j] === 'crop' ? x.trim() : +x)); }
    return { names, rows };
  };
  // a log read by DaisyIO (cols, data, str) -> { names, rows }
  D.fromLog = function (d) {
    if (!d) return null; const rows = []; for (let r = 0; r < d.n; r++) rows.push(d.cols.map((c, j) => (d.str && d.str[c]) ? d.str[c][r] : d.data[j][r])); return { names: d.cols, rows };
  };
  const col = (d, n) => d.names.indexOf(n), r2 = (v, k) => +(+v).toFixed(k == null ? 3 : k);
  const sumCols = (d, row, ns) => ns.reduce((a, n) => { const j = col(d, n); return a + (j >= 0 && isFinite(row[j]) ? row[j] : 0); }, 0);
  // get(name) returns the log called name (Annual-Harvest, Annual-FWater, Annual-FWater_100cm, Annual-FN, Annual-FN_100cm, Annual-Tracer, Daily-Tracer_conc) as { names, rows } or null
  D.summarise = function (get, withChem) {
    const out = {}, H = get('Annual-Harvest'), W = get('Annual-FWater'), W1 = get('Annual-FWater_100cm') || W, N = get('Annual-FN'), N1 = get('Annual-FN_100cm') || N, T = get('Annual-Tracer');
    if (H) out.harvest = H.rows.map(r => [r[0], r[col(H, 'crop')], r2(r[col(H, 'sorg_DM')], 3), r2(r[col(H, 'WStress')], 2), r2(r[col(H, 'NStress')], 2)]);
    const seas = d => d.rows.slice(1);   // the first line is written at the start of the output, not a season
    if (W) { out.year = seas(W).map(r => r[0]); out.P = seas(W).map(r => r2(sumCols(W, r, ['Precipitation']), 1)); out.I = seas(W).map(r => r2(sumCols(W, r, ['Irrigation']), 1)); out.ETa = seas(W).map(r => r2(sumCols(W, r, ['Actual evapotranspiration']), 1)); out.ETp = seas(W).map(r => r2(sumCols(W, r, ['Potential evapotranspiration']), 1)); out.Ro = seas(W).map(r => r2(sumCols(W, r, ['Runoff']), 1)); }
    if (W1) out.D = seas(W1).map(r => r2(sumCols(W1, r, ['Matrix percolation', 'Biopore percolation']), 1));
    if (N) { out.Nfert = seas(N).map(r => r2(sumCols(N, r, ['Min-Surface-Fertilizer', 'Min-Soil-Fertilizer', 'Org-Fertilizer']), 1)); out.Nup = seas(N).map(r => r2(sumCols(N, r, ['Crop-Uptake']), 1)); out.Nden = seas(N).map(r => r2(sumCols(N, r, (col(N, 'Denitrification') >= 0 ? ['Denitrification'] : ['NO3-Denitrification', 'N2O-Denitrification']).concat(['N2O-Nitrification'])), 2)); out.Nvol = seas(N).map(r => r2(sumCols(N, r, ['Volatilization']), 2)); out.Nmin = seas(N).map(r => r2(sumCols(N, r, ['Mineralization']), 1)); out.Ndep = seas(N).map(r => r2(sumCols(N, r, ['Deposition']), 1)); }
    if (N1) out.NL = seas(N1).map(r => r2(sumCols(N1, r, ['Matrix-Leaching', 'Biopore-Leaching']), 2));
    if (T && withChem) {
      out.chem = { spray: seas(T).map(r => r2(sumCols(T, r, ['Spray']) / 1000, 3)), uptake: seas(T).map(r => r2(sumCols(T, r, ['Uptake']) / 1000, 3)), decay: seas(T).map(r => r2(sumCols(T, r, ['Soil Decompose', 'Surface Decompose', 'Litter Decompose']) / 1000, 3)), leach: seas(T).map(r => r2(sumCols(T, r, ['Leak matrix', 'Leak biopores', 'Soil drain', 'Biopore drain']) / 1000, 4)), runoff: seas(T).map(r => r2(sumCols(T, r, ['Runoff']) / 1000, 4)), stock: seas(T).map(r => r2(sumCols(T, r, ['Soil', 'Biopores']) / 1000, 3)), harvest: seas(T).map(r => r2(sumCols(T, r, ['Harvest', 'Dissipate']) / 1000, 3)) };   // kg per ha
      const C = get('Daily-Tracer_conc');
      if (C) { const dep = C.names.slice(4).map(n => -parseFloat(n.replace('C @ ', ''))), nD = dep.length, mean = new Array(nD).fill(0), max = new Array(nD).fill(0); C.rows.slice(1).forEach(r => { for (let j = 0; j < nD; j++) { const v = r[4 + j]; mean[j] += v; if (v > max[j]) max[j] = v; } }); const n = Math.max(1, C.rows.length - 1); out.chem.prof = { depth: dep, mean: mean.map(v => +(v / n).toPrecision(3)), max: max.map(v => +v.toPrecision(3)) }; }
    }
    return out;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.DaisySum = D;
})(typeof window !== 'undefined' ? window : globalThis);
