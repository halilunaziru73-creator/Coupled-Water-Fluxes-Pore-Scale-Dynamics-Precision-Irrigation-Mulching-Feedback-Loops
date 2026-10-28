/* Daisy workbench, decision base from the Daisy reference manual (version 7.1.14, reference.pdf): what Daisy can vary in an irrigation, nitrogen, weather
   or soil experiment, with the section of the manual each choice comes from, and the combinations worth running first for the weather and soil of the user.
   No experiment of an earlier study is used here: the combinations are derived from the manual and from the data given. */
'use strict';
(() => {
  const R = {};
  // what the manual says, by section: names, parameters, units, defaults
  R.SOURCE = 'Daisy reference manual 7.1.14 (reference.pdf)';
  R.BASE = {
    irrigation: {
      methods: [{ id: 'overhead', sec: '15.19', text: 'irrigate overhead: irrigate the field from above, over the canopy' }, { id: 'surface', sec: '15.21', text: 'irrigate surface: irrigate directly on the soil surface, bypassing the canopy' }, { id: 'drip', sec: '15.20', text: 'irrigate subsoil: irrigate directly into a soil volume (from and to heights in cm)' }],
      params: { flux: { sec: '15.5, 15.18', unit: 'mm/h', def: 2, text: 'water application speed, default 2 mm/h' }, hours: { sec: '15.18', unit: 'h', text: 'irrigate this number of hours' }, days: { sec: '15.18', unit: 'd' }, temperature: { sec: '15.18', unit: 'dg C', text: 'temperature of the water, default air temperature' } },
      season: { sec: '15.5', text: 'the irrigation of a crop is tested between a from date and a to date, at a soil potential, with an amount in mm' }
    },
    triggers: [
      { id: 'pressure', sec: '28.39', cond: 'soil water pressure above', params: 'potential [cm], height [cm]', text: 'true when the soil at the height is wetter than the potential; used with not to irrigate when it is drier' },
      { id: 'content', sec: '28.38', cond: 'soil water content above', params: 'water [mm], from [cm], to [cm]', text: 'true when the layer holds more water than the amount' },
      { id: 'nitrogen', sec: '28.36', cond: 'soil inorganic N above', params: 'amount [kg N/ha], from, to' },
      { id: 'temperature', sec: '28.37', cond: 'soil temperature above', params: 'height [cm], temperature [dg C]' },
      { id: 'rain', sec: '28.12', cond: 'daily precipitation above', params: 'precipitation [mm]' },
      { id: 'crop', sec: '28.6, 28.8', cond: 'crop dm over, crop ds after', params: 'crop, weight [kg DM/ha] or development stage' }
    ],
    scheduling: { id: 'markvand', sec: '15.22', text: 'MARKVAND scheduling: a water budget of the root zone, with flux 2 mm/h by default' },
    fertiliser: { sec: '15.12', text: 'fertilize: the amount in kg N/ha, at a date or a condition' },
    soil: { sec: '47, 48.16', text: 'horizons with a hydraulic model, by default hypres from texture, humus and bulk density' },
    chemical: { sec: '23', text: 'sorption (K_OC) and decomposition (half-life) of a chemical' },
    weather: { sec: '25.7, 107.26', text: 'weather data: precipitation, air temperature, global radiation, reference evapotranspiration, optional wind and vapour pressure' }
  };
  // texture of the soil of the user, or of the course soils
  const sandy = ctx => ctx.sand != null ? ctx.sand >= 60 : ctx.soil === 'sand' || /sand/.test(String(ctx.soil || '')) && !/loam/.test(String(ctx.soil || ''));
  const clayey = ctx => ctx.clay != null ? ctx.clay >= 30 : /clay|silt/.test(String(ctx.soil || ''));
  const rootDepth = ctx => ctx.root || 100;

  // the combinations to run first; each is {id, title, why, ref, plan:{design, factors:[{id, levels}], base}, score}
  R.suggest = function (ctx) {
    ctx = ctx || {}; const P = ctx.Pmean, dry = P != null && P < 600, wet = P != null && P > 800, out = [];
    const soils = ctx.userSoil ? [] : [{ id: 'soil', levels: ['usda:sand', 'loam'] }];
    const trigs = sandy(ctx) ? [-100, -200, -400] : clayey(ctx) ? [-300, -600, -1200] : [-150, -300, -600];
    const zs = [10, 30, 60].filter(z => z <= rootDepth(ctx)).concat(rootDepth(ctx) < 60 ? [] : []);
    const wxNote = P != null ? ' The weather given has ' + Math.round(P) + ' mm of rain a year' + (ctx.Tmean != null ? ' and ' + ctx.Tmean.toFixed(1) + ' degC' : '') + '.' : '';
    out.push({ id: 'method', title: 'Overhead, surface or drip irrigation', ref: '15.19, 15.20, 15.21', score: dry ? 9 : 7,
      why: 'The manual has three ways to apply water: over the canopy, on the soil surface, and into a soil volume. Run the three with the same trigger and dose, so only the way of applying water differs.' + wxNote,
      plan: { design: 'factorial', factors: [{ id: 'method', levels: ['overhead', 'surface', 'drip'] }].concat(soils), base: { irrig: '1' } } });
    out.push({ id: 'trigger', title: 'When to irrigate: the trigger and the depth of the sensor', ref: '28.39, 15.5', score: dry ? 10 : 6,
      why: 'Irrigation starts when "soil water pressure above" is not true: the potential (cm) and the height (cm) are its two parameters. The potentials run from near field capacity to well before wilting for this soil texture; the depths stay inside the rooting depth of ' + rootDepth(ctx) + ' cm.' + wxNote,
      plan: { design: 'factorial', factors: [{ id: 'trig', levels: trigs }, { id: 'z', levels: zs.length ? zs : [10, 30] }].concat(soils), base: { irrig: '1' } } });
    out.push({ id: 'dose', title: 'How much and how fast: dose and duration', ref: '15.5, 15.18', score: 6,
      why: 'The water application speed is a parameter in mm/h (default 2 mm/h) and the irrigation lasts a number of hours. The pairs below keep the speed of the manual (2 mm/h) while the dose grows, so the answer is the effect of the dose and not of the speed.',
      plan: { design: 'paired', factors: [{ id: 'mm', levels: [10, 20, 30, 40] }, { id: 'hours', levels: [5, 10, 15, 20] }].concat(soils), base: { irrig: '1' } } });
    out.push({ id: 'window', title: 'The irrigation season and a limit on water', ref: '15.5', score: dry ? 8 : 5,
      why: 'The irrigation of a crop is tested between a from date and a to date and can be given an amount. Start dates and a seasonal limit show how much of the yield is bought by the first and the last irrigations.',
      plan: { design: 'factorial', factors: [{ id: 'window', levels: [{ label: 'Apr 1 - Oct 1', set: { w1: '04-01', w2: '10-01' } }, { label: 'May 1 - Oct 1', set: { w1: '05-01', w2: '10-01' } }, { label: 'Jun 1 - Sep 1', set: { w1: '06-01', w2: '09-01' } }] }, { id: 'limit', levels: [60, 120, 240] }].concat(soils), base: { irrig: '1' } } });
    out.push({ id: 'nitrogen', title: 'Nitrogen fertiliser, irrigated and rainfed', ref: '15.12', score: wet ? 10 : 6,
      why: 'Fertiliser is applied as an amount in kg N/ha. Scaling the rotation between half and one and a quarter of its dose, with and without irrigation, shows the dose where yield stops rising and the nitrate leached below the roots starts to climb.' + wxNote,
      plan: { design: 'factorial', factors: [{ id: 'nfac', levels: [0.5, 0.75, 1, 1.25] }, { id: 'irrig', levels: ['0', '1'] }].concat(soils), base: {} } });
    out.push({ id: 'climate', title: 'A drier, wetter or warmer year', ref: '25.7, 107.26', score: dry ? 7 : 6,
      why: 'The weather file gives precipitation and air temperature to every model of the column. Scaling the rain and adding a warming to the same record shows how much the yield and the water use move with the weather, with the soil and the management unchanged.' + wxNote,
      plan: { design: 'factorial', factors: [{ id: 'precip', levels: [0.8, 1, 1.2] }, { id: 'temp', levels: [0, 2] }].concat(soils), base: { irrig: '1' } } });
    if (!ctx.userSoil) out.push({ id: 'soils', title: 'Which soil needs the most water', ref: '47, 48.16', score: 5,
      why: 'A horizon gets its hydraulic properties from the hypres model by default, from the sand, silt, clay, humus and bulk density. Rainfed and irrigated runs on several textures show where irrigation pays.',
      plan: { design: 'factorial', factors: [{ id: 'soil', levels: ['usda:sand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:clayloam'] }, { id: 'irrig', levels: ['0', '1'] }], base: {} } });
    out.push({ id: 'flux', title: 'Slow or fast irrigation: a constant water flux', ref: '15.5, 15.18', score: dry ? 6 : 5,
      why: 'Daisy applies irrigation at a rate in mm/h, so a slow rate keeps the water in the topsoil and a fast one can run off or percolate. The rates below keep the same dose per irrigation, so only the speed of application differs.',
      plan: { design: 'factorial', factors: [{ id: 'flux', levels: [0.1, 0.5, 2] }].concat(soils), base: { irrig: '1' } } });
    out.push({ id: 'tillage', title: 'Tillage and the time and form of the fertiliser', ref: '15.3, 15.12', score: wet ? 7 : 4,
      why: 'The tillage action (plowing, rotavation, or none) mixes the residues and the topsoil; the fertiliser is taken from the fertilizer library by name, and the date can be moved. These three decide how much nitrate is exposed to leaching.' + wxNote,
      plan: { design: 'factorial', factors: [{ id: 'till', levels: ['plowing', 'rotavation', 'none'] }, { id: 'ntime', levels: [-14, 0, 14] }, { id: 'ntype', levels: ['N25S', 'AmmoniumNitrate', 'Ammonia'] }].concat(soils), base: {} } });
    out.push({ id: 'etmodel', title: 'Evapotranspiration model and radiation', ref: '25.7, 107.26', score: 4,
      why: 'Daisy can take the reference evapotranspiration from the weather file (FAO56) or compute it from the energy balance, and the radiation can be scaled. The runs show how much of the answer depends on that choice.',
      plan: { design: 'factorial', factors: [{ id: 'bio', levels: ['auto', 'default'] }, { id: 'radscale', levels: [0.9, 1, 1.1] }].concat(soils), base: {} } });
    out.push({ id: 'chemical', title: 'Sorption and half-life of a chemical', ref: '23', score: 4,
      why: 'A chemical has a sorption coefficient (K_OC, L/kg) and a decomposition rate; the two decide whether it stays in the topsoil or reaches the depth where it is counted as leached.',
      plan: { design: 'factorial', factors: [{ id: 'koc', levels: [0, 50, 500] }, { id: 'half', levels: [15, 90] }].concat(soils), base: {} } });
    return out.sort((a, b) => b.score - a.score);
  };

  // learn from the runs and propose the next ones: a ridge regression with squares and products of the numeric factors, fitted on the runs finished so far;
  // the next points are chosen on a grid between the tested levels where the fitted response is best and that are far from the points already run
  R.learn = function (rows, numFactors, resp, opt) {
    opt = opt || {}; const good = opt.good == null ? 1 : opt.good, nf = numFactors.length, n = rows.length;
    if (nf < 1 || n < nf + 2) return { ok: false, why: 'at least ' + (nf + 2) + ' finished runs are needed to learn from them' };
    const lo = numFactors.map(f => Math.min.apply(null, rows.map(r => r.val[f]))), hi = numFactors.map(f => Math.max.apply(null, rows.map(r => r.val[f])));
    const u = (r, k) => hi[k] === lo[k] ? 0 : 2 * (r.val[numFactors[k]] - lo[k]) / (hi[k] - lo[k]) - 1;
    const feat = x => { const f = [1]; x.forEach(v => f.push(v)); if (n >= 2 * nf + 3) x.forEach(v => f.push(v * v)); if (n >= 3 * nf + 4) for (let i = 0; i < nf; i++) for (let j = i + 1; j < nf; j++) f.push(x[i] * x[j]); return f; };
    const X = rows.map(r => feat(numFactors.map((_, k) => u(r, k)))), y = rows.map(r => r.r[resp]), m = X[0].length;
    const lam = 0.05, A = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i === j && i > 0 ? lam : 0))), b = Array(m).fill(0);
    X.forEach((x, k) => { for (let i = 0; i < m; i++) { b[i] += x[i] * y[k]; for (let j = 0; j < m; j++) A[i][j] += x[i] * x[j]; } });
    const w = solve(A, b); if (!w) return { ok: false, why: 'the runs do not separate the factors yet' };
    const pred = x => feat(x).reduce((s, v, i) => s + v * w[i], 0), ybar = y.reduce((a, c) => a + c, 0) / n, sst = y.reduce((s, v) => s + (v - ybar) * (v - ybar), 0) || 1, sse = X.reduce((s, x, k) => s + Math.pow(y[k] - pred(x.slice(1, 1 + nf)), 2), 0);
    const r2 = Math.max(0, 1 - sse / sst), pts = X.map((_, k) => numFactors.map((_, i) => u(rows[k], i)));
    const steps = nf === 1 ? 21 : nf === 2 ? 13 : 7, cand = []; const walk = (k, cur) => { if (k === nf) { cand.push(cur.slice()); return; } for (let s = 0; s < steps; s++) { cur[k] = -1 + 2 * s / (steps - 1); walk(k + 1, cur); } cur.pop && 0; }; walk(0, []);
    const dist = (a, c) => Math.sqrt(a.reduce((s, v, i) => s + (v - c[i]) * (v - c[i]), 0)), picked = [], k = opt.count || 4, ys = cand.map(c => good * pred(c)), ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    const near = pts.slice(); for (let t = 0; t < k; t++) { let best = -1, bs = -Infinity; cand.forEach((c, i) => { const d = near.length ? Math.min.apply(null, near.map(p => dist(p, c))) : 1; if (d < 0.12) return; const sc = (ys[i] - ymin) / ((ymax - ymin) || 1) + 0.6 * Math.min(1, d); if (sc > bs) { bs = sc; best = i; } }); if (best < 0) break; picked.push(cand[best]); near.push(cand[best]); }
    const val = c => { const o = {}; numFactors.forEach((f, i) => { o[f] = lo[i] + (c[i] + 1) / 2 * (hi[i] - lo[i]); }); return o; };
    return { ok: true, r2, n, terms: m, next: picked.map(c => ({ val: val(c), predicted: pred(c) })), best: (() => { let bi = 0; ys.forEach((v, i) => { if (v > ys[bi]) bi = i; }); return { val: val(cand[bi]), predicted: pred(cand[bi]) }; })() };
  };
  function solve(A, b) { const n = b.length, M = A.map((r, i) => r.concat([b[i]])); for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r; if (Math.abs(M[p][i]) < 1e-12) return null; [M[i], M[p]] = [M[p], M[i]]; for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; } } return M.map((r, i) => r[n] / r[i]); }
  if (typeof module !== 'undefined' && module.exports) module.exports = R; else window.DaisyRef = R;
})();
