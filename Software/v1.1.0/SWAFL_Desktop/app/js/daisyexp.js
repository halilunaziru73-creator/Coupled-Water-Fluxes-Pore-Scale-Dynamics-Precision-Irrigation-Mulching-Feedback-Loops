/* Daisy experiments: the factors a user can vary, designs (one at a time, full factorial, paired), the 17 experiments E0-E16 of the SWAFL study,
   the summaries (main effects, interaction grids, sensitivity, trade-offs), the experiment folder (crops, soils, weather, OutputLog_*.dai) and a zip writer.
   Pure functions: the same code runs in the browser, in the desktop app and in node. */
(function (root) {
  'use strict';
  const E = {}, S = root.DaisyScen || (typeof require !== 'undefined' ? require('./daisyscen.js') : null);
  const soilOpts = () => S.OPTIONS.soil.opts.map(o => o[0]);

  // ------------------------------------------------------------------ factors
  // key: the scenario option it changes. levels: values offered by default. words: how a user may name it. irr: only has meaning with irrigation.
  const F = [
    { id: 'precip', key: 'precip', label: 'Rain, factor on the weather', unit: '', kind: 'num', levels: [0.6, 0.8, 1, 1.2, 1.4], range: [0.4, 1.6], words: ['rain', 'rainfall', 'precipitation', 'wetter', 'drier', 'dry year', 'wet year', 'drought'] },
    { id: 'temp', key: 'temp', label: 'Temperature shift', unit: 'C', kind: 'num', levels: [0, 1, 2, 3], range: [-4, 8], words: ['temperature', 'warming', 'warmer', 'hotter', 'cooler', 'climate change', 'heat'] },
    { id: 'nfac', key: 'nfac', label: 'Nitrogen fertiliser, factor on the rotation', unit: '', kind: 'num', levels: [0.4, 0.7, 1, 1.3], range: [0, 2], words: ['nitrogen', 'fertiliser', 'fertilizer', 'n rate', 'n dose', 'leaching', 'nitrate', 'pollution'] },
    { id: 'irrig', key: 'irrig', label: 'Irrigation', unit: '', kind: 'cat', levels: ['0', '1'], names: { '0': 'rainfed', '1': 'irrigated' }, words: ['irrigation', 'irrigate', 'irrigated', 'rainfed'] },
    { id: 'mm', key: 'mm', label: 'Water per irrigation', unit: 'mm', kind: 'num', levels: [10, 20, 30, 45], range: [2, 60], irr: 1, words: ['dose', 'amount', 'depth of water', 'mm per', 'water per irrigation'] },
    { id: 'hours', key: 'hours', label: 'Duration of one irrigation', unit: 'h', kind: 'num', levels: [3, 6, 12, 24], range: [1, 48], irr: 1, words: ['duration', 'hours', 'how long', 'slow', 'intensity'] },
    { id: 'trig', key: 'trig', label: 'Irrigation trigger (soil suction)', unit: 'cm', kind: 'num', levels: [-100, -200, -300, -600, -1000], range: [-10000, -50], irr: 1, words: ['trigger', 'threshold', 'suction', 'tensiometer', 'pressure', 'when to irrigate'] },
    { id: 'z', key: 'z', label: 'Sensor depth', unit: 'cm', kind: 'num', levels: [10, 20, 30, 50], range: [5, 100], irr: 1, words: ['sensor', 'sensor depth', 'probe', 'installation depth', 'where to put the sensor'] },
    { id: 'method', key: 'method', label: 'Irrigation method', unit: '', kind: 'cat', levels: ['overhead', 'surface', 'drip'], irr: 1, words: ['method', 'sprinkler', 'overhead', 'drip', 'surface irrigation', 'furrow', 'flood'] },
    { id: 'dripdepth', key: 'dfrom', label: 'Drip depth', unit: 'cm', kind: 'set', irr: 1, levels: [{ label: 'drip 5-10 cm', set: { method: 'drip', dfrom: 5, dto: 10 } }, { label: 'drip 10-20 cm', set: { method: 'drip', dfrom: 10, dto: 20 } }, { label: 'drip 15-25 cm', set: { method: 'drip', dfrom: 15, dto: 25 } }, { label: 'drip 20-30 cm', set: { method: 'drip', dfrom: 20, dto: 30 } }], words: ['drip depth', 'buried drip', 'subsurface drip'] },
    { id: 'limit', key: 'limit', label: 'Water limit per crop season', unit: 'mm', kind: 'num', levels: [0, 60, 120, 240], range: [0, 1000], irr: 1, words: ['limit', 'deficit', 'water limit', 'quota', 'restricted', 'scarce water', 'allowance'] },
    { id: 'window', key: 'w1', label: 'Irrigation window', unit: '', kind: 'set', irr: 1, levels: [{ label: 'Apr 1 - Oct 1', set: { w1: '04-01', w2: '10-01' } }, { label: 'May 1 - Oct 1', set: { w1: '05-01', w2: '10-01' } }, { label: 'Jun 1 - Oct 1', set: { w1: '06-01', w2: '10-01' } }, { label: 'Apr 1 - Jun 1', set: { w1: '04-01', w2: '06-01' } }], words: ['timing', 'window', 'season of irrigation', 'when in the season', 'start date'] },
    { id: 'vg_ks', key: 'vg_ks', label: 'Saturated hydraulic conductivity K_sat of every horizon (van Genuchten-Mualem), factor', unit: 'times the soil value', kind: 'num', levels: [0.25, 1, 4], range: [0.01, 100], words: ['ksat', 'k_sat', 'saturated conductivity', 'hydraulic conductivity', 'permeability', 'sensitivity'] },
    { id: 'vg_alpha', key: 'vg_alpha', label: 'van Genuchten alpha (inverse air-entry pressure) of every horizon, factor', unit: 'times the soil value', kind: 'num', levels: [0.5, 1, 2], range: [0.1, 10], words: ['alpha', 'van genuchten', 'air entry', 'retention curve', 'sensitivity'] },
    { id: 'vg_n', key: 'vg_n', label: 'van Genuchten n (pore-size distribution) of every horizon, factor on n - 1', unit: 'times the soil value', kind: 'num', levels: [0.7, 1, 1.3], range: [0.3, 2], words: ['van genuchten n', 'pore size distribution', 'retention curve', 'shape parameter', 'sensitivity'] },
    { id: 'vg_ts', key: 'vg_ts', label: 'Saturated water content Theta_sat (porosity) of every horizon, factor', unit: 'times the soil value', kind: 'num', levels: [0.9, 1, 1.1], range: [0.6, 1.5], words: ['theta_sat', 'porosity', 'saturated water content', 'sensitivity'] },
    { id: 'vg_l', key: 'vg_l', label: 'Mualem tortuosity l of every horizon, added', unit: 'added to the soil value', kind: 'num', levels: [-1, 0, 1], range: [-4, 4], words: ['tortuosity', 'mualem l', 'connectivity', 'sensitivity'] },
    { id: 'root', key: 'root', label: 'Maximum rooting depth', unit: 'cm', kind: 'num', levels: [30, 60, 90, 120, 150], range: [20, 200], words: ['root', 'rooting depth', 'roots'] },
    { id: 'soil', key: 'soil', label: 'Soil', unit: '', kind: 'cat', levels: ['usda:sand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:clayloam'], words: ['soil', 'soils', 'texture', 'sand', 'loam', 'clay', 'silt'] },
    { id: 'station', key: 'station', label: 'Weather station', unit: '', kind: 'cat', levels: ['course', 'it-bologna', 'dk-foulum'], words: ['station', 'site', 'location', 'climate of', 'bologna', 'foulum', 'jyndevad', 'valecov', 'jadwisin', 'bratislava', 'taastrup', 'mediterranean'] },
    { id: 'till', key: 'till', label: 'Tillage', unit: '', kind: 'cat', levels: ['plowing', 'rotavation', 'disk_harrowing', 'stubble_cultivation', 'none'], names: { plowing: 'plowing', rotavation: 'rotavation (15 cm)', disk_harrowing: 'disk harrowing (10 cm)', stubble_cultivation: 'stubble cultivation (8 cm)', none: 'no tillage' }, words: ['tillage', 'plough', 'plow', 'plowing', 'ploughing', 'rotavat', 'no-till', 'no till', 'cultivation'] },
    { id: 'tc', key: 'tc', label: 'Soil consolidation after tillage (time consolidation)', unit: 'per day', kind: 'num', levels: [0.001, 0.01, 0.02], range: [0.0005, 0.05], words: ['consolidation', 'time consolidation', 'soil structure', 'structure dynamics', 'wepp', 'shp', 'hydraulic properties in time', 'settling'] },
    { id: 'ntype', key: 'ntype', label: 'Type of mineral fertiliser', unit: '', kind: 'cat', levels: ['N25S', 'AmmoniumNitrate', 'Ammonia', 'Nitrate'], words: ['fertiliser type', 'fertilizer type', 'ammonium nitrate', 'ammonia', 'urea', 'form of nitrogen'] },
    { id: 'ntime', key: 'ntime', label: 'Fertiliser date, shift in days', unit: 'days', kind: 'num', levels: [-14, 0, 14, 28], range: [-60, 60], words: ['fertiliser timing', 'fertilizer timing', 'when to fertili', 'split application', 'delay the fertili'] },
    { id: 'bio', key: 'bio', label: 'Evapotranspiration model', unit: '', kind: 'cat', levels: ['auto', 'default'], names: { auto: 'FAO56', default: 'Daisy energy balance' }, words: ['evapotranspiration model', 'penman', 'fao56', 'bioclimate', 'energy balance'] },
    { id: 'radscale', key: 'radscale', label: 'Radiation, factor on the weather', unit: '', kind: 'num', levels: [0.9, 1, 1.1], range: [0.5, 1.5], words: ['radiation', 'cloud', 'sunshine', 'solar'] },
    { id: 'flux', key: 'flux', label: 'Irrigation intensity (constant flux)', unit: 'mm/h', kind: 'num', levels: [0.05, 0.1, 0.5, 2], range: [0.01, 20], irr: 1, words: ['flux', 'intensity', 'mm per hour', 'mm/h', 'constant depth'] },
    { id: 'season', key: 'pmonths', label: 'Seasonal rain pattern', unit: '', kind: 'set', levels: [{ label: 'dry summer (rain x0.7 Jun-Aug)', set: { pmonths: '1 1 1 1 1 0.7 0.7 0.7 1 1 1 1' } }, { label: 'dry spring (rain x0.7 Mar-May)', set: { pmonths: '1 1 0.7 0.7 0.7 1 1 1 1 1 1 1' } }, { label: 'wet winter (rain x1.3 Dec-Feb)', set: { pmonths: '1.3 1.3 1 1 1 1 1 1 1 1 1 1.3' } }], words: ['seasonal', 'dry summer', 'dry spring', 'wet winter', 'monthly rain', 'drought in summer'] },
    // more of what the Daisy reference lets a management do (chapter 15, the actions)
    { id: 'stub', key: 'stub', label: 'Stubble left at harvest (15.14)', unit: 'cm', kind: 'num', levels: [0, 8, 15, 30], range: [0, 60], words: ['stubble', 'stub', 'cutting height', 'harvest height', 'residue height'] },
    { id: 'straw', key: 'straw', label: 'Straw at harvest, left or removed (15.14)', unit: '', kind: 'cat', levels: ['asis', 'left', 'removed'], names: { asis: 'as in the farm rotation', left: 'straw left on the field', removed: 'straw removed' }, words: ['straw', 'residue', 'residues', 'stem and leaf', 'crop residue removal'] },
    { id: 'wtemp', key: 'wtemp', label: 'Temperature of the irrigation water (15.18)', unit: 'C', kind: 'num', levels: [5, 12, 20, 30], range: [0, 40], irr: 1, words: ['water temperature', 'cold water', 'warm water', 'temperature of the water', 'irrigation water temperature'] },
    { id: 'fdepth', key: 'fdepth', label: 'Depth the fertiliser is worked into (15.12, 15.13)', unit: 'cm', kind: 'num', levels: [0, 5, 10, 20], range: [0, 40], words: ['incorporate', 'incorporation', 'injection', 'inject', 'fertiliser depth', 'fertilizer depth', 'placement', 'broadcast'] },
    { id: 'nprec', key: 'nprec', label: 'Fertiliser by the soil nitrogen: target minus the mineral N in the soil (15.11)', unit: '', kind: 'cat', levels: ['off', 'on'], names: { off: 'fixed rate', on: 'target minus soil mineral N' }, words: ['precision fertili', 'target', 'soil mineral n', 'nmin', 'n-min', 'soil test', 'split application'] },
    { id: 'detain', key: 'detain', label: 'Surface detention capacity: ponding before runoff (15.40)', unit: 'mm', kind: 'num', levels: [0, 5, 15, 30], range: [0, 100], words: ['detention', 'ponding', 'runoff', 'run-off', 'surface storage', 'bunds', 'ridges'] },
    { id: 'koc', key: 'koc', label: 'Sorption of the chemical, K_OC', unit: 'L/kg', kind: 'num', levels: [0, 50, 100, 500], range: [0, 5000], words: ['sorption', 'koc', 'pesticide', 'chemical', 'tracer', 'herbicide'] },
    // the Daisy library, all of it: crops, chemicals, managements and programs (soil horizons are in Soil, fertilisers in Type of fertiliser)
    { id: 'cropone', key: 'cropone', lib: 1, label: 'Crop of the Daisy library, grown every year', unit: '', kind: 'cat', levels: [], words: ['crop of the library', 'any crop', 'grow every year', 'monoculture'] },
    { id: 'chem', key: 'chem', lib: 1, label: 'Chemical of the Daisy library (pesticide, PFAS, tracer)', unit: '', kind: 'cat', levels: [], words: ['pesticide', 'pfas', 'atrazine', 'bentazon', 'which chemical', 'herbicide'] },
    { id: 'mgmt', key: 'mgmt', lib: 1, label: 'Management of the Daisy library (whole managements and single operations)', unit: '', kind: 'cat', levels: [], words: ['management', 'managements', 'farm management', 'action'] },
    { id: 'prog', key: 'prog', lib: 1, label: 'Program of the Daisy library, run as it comes with Daisy', unit: '', kind: 'cat', levels: [], words: ['program', 'sample program', 'example run'] },
    { id: 'half', key: 'half', label: 'Half-life of the chemical', unit: 'days', kind: 'num', levels: [0, 15, 30, 90], range: [0, 2000], words: ['half-life', 'half life', 'degradation', 'decay', 'persistence'] }
  ];
  /* every parameter of the Daisy reference that was tested in Daisy (daisyparams.js) is a factor: its levels are fractions of the value the farm uses */
  const PARAMS = root.DaisyParams || (typeof require !== 'undefined' ? (() => { try { return require('./daisyparams.js'); } catch (e) { return []; } })() : []) || [];
  E.PARAMS = PARAMS;
  const pBase = q => q.farm != null ? q.farm : q.def, pRound = (q, v) => q.type === 'integer' ? Math.max(1, Math.round(v)) : +(+v).toPrecision(4);
  PARAMS.forEach(q => { const b = pBase(q), nm = q.name.toLowerCase(); if (!(b > 0)) return;
    F.push({ id: q.opt, key: q.opt, param: q, label: q.attr + (q.use ? ' ' + q.use : '') + ': ' + q.name + ' (Daisy reference, chapter ' + q.ch + ')', unit: q.unit, kind: 'num', levels: [0.5, 0.75, 1, 1.5, 2].map(f => pRound(q, b * f)).filter((v, i, a) => a.indexOf(v) === i), range: [0, pRound(q, b * 10)],
      words: [q.attr.toLowerCase() + ' ' + nm, q.key.toLowerCase() + ' of ' + q.attr.toLowerCase()].concat([nm, q.key.toLowerCase(), q.key.toLowerCase().replace(/_/g, ' ')].filter((w, i, a) => w.length >= 4 && a.indexOf(w) === i)) }); });
  E.FACTORS = F; E.factor = id => F.find(x => x.id === id);
  const IRR_ONLY = new Set(F.filter(f => f.irr).map(f => f.id));
  const libName = (f, v) => { const O = S.OPTIONS && S.OPTIONS[f.key], h = O && O.opts && O.opts.find(o => String(o[0]) === String(v)); return h ? h[1] : String(v).split('|')[0]; };
  const nameOf = (f, v) => f.lib || (f.id === 'ntype' && String(v).indexOf('|') > 0) || (f.id === 'soil' && String(v).indexOf('hzn:') === 0) || (f.id === 'mgmt') ? libName(f, v) : f.kind === 'set' ? v.label : f.names && f.names[v] ? f.names[v] : f.id === 'soil' ? (v === 'loam' ? 'Built-in loam' : v === 'sand' ? 'Built-in sand' : String(v).indexOf('usda:') === 0 ? S.USDA[String(v).slice(5)][0] + ' (USDA)' : String(v).indexOf('hz:') === 0 ? String(v).slice(3) + ' (Daisy horizon)' : v === 'user' ? 'My soil' : v) : f.id === 'station' ? (S.OPTIONS[f.key].opts.find(o => o[0] === v) || [0, v])[1].replace(/ \(.*/, '') : f.kind === 'num' ? v + (f.unit ? ' ' + f.unit : '') : String(v);
  E.levelName = nameOf;
  // a factor plus the levels chosen: { id, levels:[value or {label,set}] }
  E.norm = function (fs) { return (fs || []).map(x => { const f = E.factor(x.id); if (!f) throw new Error('unknown factor ' + x.id); const lv = (x.levels && x.levels.length ? x.levels : f.levels).map(v => f.kind === 'set' && typeof v === 'string' ? f.levels.find(l => l.label === v) || f.levels[0] : v); return { id: f.id, f, levels: lv }; }); };

  // ------------------------------------------------------------------ designs
  function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* plan: { factors:[{id, levels}], design:'factorial'|'oat'|'paired', base:{options}, max, seed, reference:bool }
     returns { runs:[{id,label,set,level:{factorId:label},val:{factorId:value}}], total, thinned } */
  E.PICKS = [['balanced', 'balanced: every value used about equally often', 'in a balanced way (every value used about equally often)'], ['random', 'at random (with the seed)', 'at random'], ['spread', 'evenly spaced through the list of combinations', 'evenly spaced through the list'], ['first', 'the first ones in the list, in order', 'as the first ones in the list']];
  E.design = function (plan) {
    const fs = E.norm(plan.factors), design = plan.design || 'factorial', max = Math.max(1, Math.round(plan.max || 200)), pickHow = plan.pick || 'balanced', seed = Math.round(plan.seed || 7); let combos = [];
    const mk = (pick) => { const set = {}, level = {}, val = {}; pick.forEach((lv, i) => { const f = fs[i].f; if (lv === undefined) return; if (f.kind === 'set') Object.assign(set, lv.set); else set[f.key] = lv; level[f.id] = nameOf(f, lv); val[f.id] = f.kind === 'set' ? lv.label : lv; }); return { set, level, val }; };
    const needsIrr = fs.some(x => IRR_ONLY.has(x.id)), hasIrr = fs.some(x => x.id === 'irrig'), base = plan.base || {};
    const irrKeys = new Set(), irrIds = fs.filter(x => IRR_ONLY.has(x.id)).map(x => x.id); fs.forEach(x => { if (IRR_ONLY.has(x.id)) { irrKeys.add(x.f.key); if (x.f.kind === 'set') x.levels.forEach(l => Object.keys((l && l.set) || {}).forEach(k => irrKeys.add(k))); } });
    const refOn = plan.reference !== false && needsIrr && !hasIrr, ctxIdx = fs.map((x, i) => IRR_ONLY.has(x.id) ? -1 : i).filter(i => i >= 0);
    // the combinations as lists of level numbers (undefined: the factor stays at the value of the farm); factorial ones are counted, not listed
    const L = fs.map(x => x.levels.length); let total, tupleAt, tuples = null;
    if (!fs.length) { tuples = [[]]; }
    else if (design === 'oat') { tuples = [fs.map(() => undefined)]; fs.forEach((x, i) => x.levels.forEach((lv, j) => { const p = fs.map(() => undefined); p[i] = j; tuples.push(p); })); }
    else if (design === 'paired') { const n = Math.max.apply(null, L); tuples = []; for (let j = 0; j < n; j++) tuples.push(L.map(l => Math.min(j, l - 1))); }
    if (tuples) { total = tuples.length; tupleAt = i => tuples[i]; }
    else { total = L.reduce((a, b) => a * b, 1); tupleAt = i => { const t = new Array(L.length); for (let k = L.length - 1; k >= 0; k--) { t[k] = i % L[k]; i = Math.floor(i / L[k]); } return t; }; }
    // how many runs a choice of combinations gives: rainfed runs that repeat are merged, and a rainfed reference is added for every soil and weather
    const runsOf = T => { const seenR = {}, ctx = {}; let n = 0; T.forEach(t => { const rainfed = hasIrr && irrIds.length && (() => { const i = fs.findIndex(x => x.id === 'irrig'); return t[i] !== undefined && String(fs[i].levels[t[i]]) === '0'; })();
      if (rainfed) { const key = JSON.stringify(t.map((v, i) => irrIds.indexOf(fs[i].id) >= 0 ? null : v)); if (seenR[key]) return; seenR[key] = 1; } n++; if (refOn) ctx[JSON.stringify(ctxIdx.map(i => t[i]))] = 1; }); return n + (refOn ? Object.keys(ctx).length : 0); };
    const r = rng(seed);
    // the ways of choosing k combinations out of many
    const choose = k => { if (k >= total) { const out = []; for (let i = 0; i < total; i++) out.push(tupleAt(i)); return out; }
      if (pickHow === 'first') { const out = []; for (let i = 0; i < k; i++) out.push(tupleAt(i)); return out; }
      if (pickHow === 'spread') { const out = []; for (let i = 0; i < k; i++) out.push(tupleAt(Math.round(i * (total - 1) / Math.max(1, k - 1)))); return out; }
      if (pickHow === 'random' || tuples) { const seen = new Set(), out = []; if (total <= 200000) { const idx = []; for (let i = 0; i < total; i++) idx.push(i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
          if (pickHow === 'random' || !tuples) return idx.slice(0, k).sort((a, b) => a - b).map(tupleAt);
          // oat / paired lists thinned in a balanced way: keep the order of the list, take every n-th
          return idx.slice(0, k).sort((a, b) => a - b).map(tupleAt); }
        while (out.length < k) { const i = Math.floor(r() * total); if (!seen.has(i)) { seen.add(i); out.push(i); } } return out.sort((a, b) => a - b).map(tupleAt); }
      // balanced (a Latin hypercube over the levels): each value of each factor appears in k/levels runs, the pairs of values are mixed at random, no combination twice
      const cols = L.map(l => { const c = []; for (let i = 0; i < k; i++) c.push(i % l); for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = c[i]; c[i] = c[j]; c[j] = t; } return c; });
      const key = t => t.join(','), seen = new Set(), out = [];
      for (let i = 0; i < k; i++) { let t = L.map((_, f) => cols[f][i]), tries = 0;
        while (seen.has(key(t)) && tries < 200) { const f = Math.floor(r() * L.length), j = i + 1 + Math.floor(r() * Math.max(1, k - i - 1)); if (j < k) { const a = cols[f][i]; cols[f][i] = cols[f][j]; cols[f][j] = a; } else cols[f][i] = Math.floor(r() * L[f]); t = L.map((_, g) => cols[g][i]); tries++; }
        if (!seen.has(key(t))) { seen.add(key(t)); out.push(t); } }
      return out.sort((a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }); };
    // the limit is the number of runs, the rainfed references included: fewer combinations are taken until the runs fit
    let k = Math.min(total, max), T = choose(k), nRuns = runsOf(T), guard = 0;
    while (nRuns > max && k > 1 && guard++ < 400) { k = Math.max(1, Math.min(k - 1, Math.floor(k * max / nRuns))); T = choose(k); nRuns = runsOf(T); }
    // then as many as still fit, so the number of runs is the one asked for whenever the combinations allow it
    const rnd = pickHow === 'balanced' || pickHow === 'random'; guard = 0;
    while (nRuns < max && guard++ < 120) { const kk = Math.min(total, k + (rnd ? guard % 3 : 1)); if (kk === k && !rnd) break; const T2 = choose(kk), n2 = runsOf(T2); if (n2 <= max && (n2 > nRuns || (n2 === nRuns && kk > k))) { k = kk; T = T2; nRuns = n2; } else if (!rnd && n2 > max) break; if (kk >= total && !rnd) break; }
    const thinned = T.length < total;
    combos = T.map(t => mk(t.map((j, i) => j === undefined ? undefined : fs[i].levels[j])));
    const limited = { max, chosen: combos.length, pick: pickHow, seed, total };
    // a rainfed run does not depend on any irrigation setting: those settings are taken out of it, so the same rainfed run is never made twice
    // and a rainfed run is never counted as a level of an irrigation factor (it would dilute the effect of that factor)
    if (hasIrr && irrIds.length) { const seenR = {}; combos = combos.filter(c => { if (String(c.set.irrig) !== '0') return true; irrKeys.forEach(k => { delete c.set[k]; }); irrIds.forEach(id => { delete c.level[id]; delete c.val[id]; }); const key = JSON.stringify([c.set, c.val]); if (seenR[key]) return false; seenR[key] = 1; return true; }); }
    const lab0 = lv => Object.keys(lv).map(k => E.factor(k).label.replace(/ \(.*/, '').replace(/, factor.*/, '') + ' ' + lv[k]).join(', ');
    const runs = combos.map((c, i) => { const set = Object.assign({}, c.set); if (needsIrr && !hasIrr && base.irrig !== '0') set.irrig = '1'; return { id: 'r' + String(i + 1).padStart(3, '0'), label: lab0(c.level) || 'Baseline', set, level: c.level, val: c.val }; });
    // one rainfed reference for every combination of the other factors (soil, rain, temperature...), so that the gain from irrigation is always set against the same soil and weather
    if (plan.reference !== false && needsIrr && !hasIrr) {
      const ctx = fs.filter(x => !IRR_ONLY.has(x.id)).map(x => x.id), seenR = {}, refs = [];
      combos.forEach(c => { const val = {}, level = {}; ctx.forEach(id => { if (c.val[id] !== undefined) { val[id] = c.val[id]; level[id] = c.level[id]; } }); const key = JSON.stringify(val); if (seenR[key]) return; seenR[key] = 1; const set = {}; Object.keys(c.set).forEach(k => { if (!irrKeys.has(k)) set[k] = c.set[k]; }); set.irrig = '0'; refs.push({ id: 'r' + String(refs.length).padStart(3, '0'), label: 'Rainfed reference' + (Object.keys(level).length ? ': ' + lab0(level) : ''), set, level, val, reference: true }); });
      runs.forEach(r => { r.id = 'r' + String(refs.length - 1 + parseInt(r.id.slice(1), 10)).padStart(3, '0'); }); runs.unshift.apply(runs, refs);
    }
    return { runs, total, thinned, limit: Object.assign(limited, { runs: runs.length, refs: runs.filter(q => q.reference).length }), factors: fs.map(x => ({ id: x.id, label: x.f.label, unit: x.f.unit, kind: x.f.kind, levels: x.levels.map(v => x.f.kind === 'set' ? v.label : v) })) };
  };

  // ------------------------------------------------------------------ the 17 experiments of the SWAFL study
  const SOIL8 = ['loam', 'sand', 'usda:sand', 'usda:loamysand', 'usda:sandyloam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam', 'usda:siltyclayloam'];
  E.PRESETS = [
    { id: 'E0', name: 'Baselines', ens: 'E0_Baselines', ask: 'Rainfed baseline of every soil', plan: { design: 'factorial', factors: [{ id: 'soil', levels: SOIL8 }], base: { irrig: '0' } } },
    { id: 'E1', name: 'Dose and duration', ens: 'E1_Doses', ask: 'Irrigation dose by duration', plan: { design: 'factorial', factors: [{ id: 'mm', levels: [6, 12, 24, 36] }, { id: 'hours', levels: [3, 6, 12, 24] }] } },
    { id: 'E2', name: 'Trigger pressure', ens: 'E2_TriggerPressure', ask: 'Irrigation trigger suction', plan: { design: 'factorial', factors: [{ id: 'trig', levels: [-100, -150, -300, -800, -1500, -3000] }, { id: 'soil', levels: ['usda:sand', 'loam', 'usda:siltloam'] }] } },
    { id: 'E3', name: 'Sensor depth', ens: 'E3_SensorDepth', ask: 'Depth of the soil moisture sensor', plan: { design: 'factorial', factors: [{ id: 'z', levels: [10, 20, 30, 40, 60, 100] }, { id: 'soil', levels: ['usda:sand', 'loam', 'usda:siltloam'] }] } },
    { id: 'E4', name: 'Methods', ens: 'E4_Methods', ask: 'Overhead, surface and drip at three depths', plan: { design: 'factorial', factors: [{ id: 'method', levels: ['overhead', 'surface'] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] }, extra: [{ id: 'dripdepth' }] },
    { id: 'E5', name: 'Soil structure dynamics (SHP)', ens: 'E5_SHP_Dynamics', ask: 'Tillage system by consolidation rate of the tilled topsoil, irrigated and rainfed', plan: { design: 'factorial', factors: [{ id: 'till', levels: ['plowing', 'rotavation', 'none'] }, { id: 'tc', levels: [0.001, 0.01, 0.02] }, { id: 'irrig', levels: ['0', '1'] }, { id: 'soil', levels: ['usda:sandyloam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam'] }], base: { precip: 0.7, temp: 2, start: 1980, stop: 1999, trig: -300, z: 20, mm: 2.4, flux: 0.1, hours: 24, waitd: 1 } } },
    { id: 'E6', name: 'Mediterranean pollution', ens: 'E6_Mediterranean_Pollution', ask: 'Nitrogen rate by soil, Bologna climate, 1994 to 2004', plan: { design: 'factorial', factors: [{ id: 'nfac', levels: [0.1, 0.4, 0.7, 1, 1.3, 1.5] }, { id: 'soil', levels: ['usda:sand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:clayloam'] }], base: { station: 'it-bologna', start: 1994, stop: 2004 } } },
    { id: 'E7', name: 'Mulching', ens: 'E7_Mulching', ask: 'Mulch vapour flux factor by interception capacity', unsupported: 'the mulch (litter) parameters are not in the crop files of the built-in farm; use the published runs below' },
    { id: 'E8', name: 'Rain intensity and moisture', ens: 'E8_Rain_Intensity_Moisture', ask: 'Rain intensity by initial soil moisture', unsupported: 'needs hourly rain and an initial-moisture state; use the published runs below' },
    { id: 'E9', name: 'Soil moisture and rain', ens: 'E9_Soil_Moisture_Rain', ask: 'Trigger suction by rain scale by soil', plan: { design: 'factorial', factors: [{ id: 'trig', levels: [-100, -300, -800, -1500] }, { id: 'precip', levels: [0.6, 0.8, 1, 1.2] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E10', name: 'Amount, timing and soil', ens: 'E10_Amount_Timing_Soil', ask: 'Irrigation amount per event by timing window by soil', plan: { design: 'factorial', factors: [{ id: 'mm', levels: [10, 20, 30] }, { id: 'window', levels: ['Apr 1 - Oct 1', 'May 1 - Oct 1', 'Jun 1 - Oct 1'] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E11', name: 'Temperature, evaporation, rain', ens: 'E11_Temp_Evap_Rain', ask: 'Temperature shift by rain scale', plan: { design: 'factorial', factors: [{ id: 'temp', levels: [0, 1, 2, 3] }, { id: 'precip', levels: [0.6, 0.8, 1, 1.2] }] }, note: 'the soil-evaporation factor of the study is not a free parameter in the crop files of the built-in farm' },
    { id: 'E12', name: 'Sensor, trigger, rain', ens: 'E12_Sensor_Trigger_Rain', ask: 'Sensor depth by trigger by rain scale', plan: { design: 'factorial', factors: [{ id: 'z', levels: [10, 30, 60] }, { id: 'trig', levels: [-150, -300, -800] }, { id: 'precip', levels: [0.7, 1, 1.3] }] } },
    { id: 'E13', name: 'N, water, soil', ens: 'E13_N_Water_Soil', ask: 'Nitrogen rate by water strategy by soil', plan: { design: 'factorial', factors: [{ id: 'nfac', levels: [0.4, 0.7, 1, 1.3] }, { id: 'limit', levels: [0, 100, 300] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E14', name: 'Mulch and rain', ens: 'E14_Mulch_Rain', ask: 'Mulch factors by rain scale', unsupported: 'the mulch (litter) parameters are not in the crop files of the built-in farm; use the published runs below' },
    { id: 'E15', name: 'Method, depth, amount', ens: 'E15_Method_Depth_Amount', ask: 'Irrigation method by rooting depth by amount', plan: { design: 'factorial', factors: [{ id: 'method', levels: ['overhead', 'surface', 'drip'] }, { id: 'root', levels: [45, 90, 135] }, { id: 'mm', levels: [10, 20, 30] }] } },
    { id: 'E16', name: 'Edge cases', ens: 'E16_Edge_Cases', ask: 'Stress-tested corners of rain, temperature, trigger and nitrogen', plan: { design: 'factorial', factors: [{ id: 'precip', levels: [0.5, 1.5] }, { id: 'temp', levels: [0, 2] }, { id: 'trig', levels: [-2000, -50] }, { id: 'nfac', levels: [0.2, 1.3] }] } }
  ];

  // the name of the folder of one run, as in the folders of the study (E5_S01_CoarseLoam_conv_tc0.001_Irrigated, E6_S05_SandyLoam_N100_Full)
  const TOK = {
    soil: v => { const s = String(v).replace(/^usda:/, ''); const m = S.USDA[s]; return m ? m[0].split(/[^A-Za-z]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') : s === 'loam' ? 'Loam' : s === 'sand' ? 'Sand' : s.replace(/[^A-Za-z0-9]+/g, ''); },
    till: v => ({ plowing: 'conv', rotavation: 'reduced', none: 'notill', disk_harrowing: 'disk', stubble_cultivation: 'stubble' })[v] || v, tc: v => 'tc' + v, irrig: v => String(v) === '1' ? 'Irrigated' : 'Rainfed', nfac: v => 'N' + Math.round(v * 100), precip: v => 'P' + v, temp: v => 'T' + (v >= 0 ? '+' : '') + v, trig: v => 'h' + Math.abs(v), z: v => 'z' + v, mm: v => 'mm' + v, hours: v => hours(v), method: v => v, root: v => 'root' + v, limit: v => 'lim' + v, flux: v => 'q' + v, station: v => String(v).replace(/^[a-z]{2}-/, ''), ntime: v => 'd' + (v >= 0 ? '+' : '') + v, ntype: v => v, bio: v => v === 'default' ? 'EB' : 'FAO56', radscale: v => 'R' + v, koc: v => 'Koc' + v, half: v => 'half' + v
  };
  function hours(v) { return v + 'h'; }
  E.runName = function (presetId, run, factors) {
    const parts = [presetId || 'X']; (factors || []).slice().sort((p, q) => (q.id === 'soil') - (p.id === 'soil')).forEach(f => { const v = run.val ? run.val[f.id] : undefined; if (v === undefined) return; const t = TOK[f.id] ? TOK[f.id](f.kind === 'set' ? v : v) : (f.id + String(v)); parts.push(String(t)); });
    if (run.reference) parts.push('Rainfed'); return parts.join('_').replace(/[^A-Za-z0-9._+-]+/g, '-').replace(/-+/g, '-').slice(0, 90);
  };
  // ------------------------------------------------------------------ responses
  E.RESP = [
    { id: 'yield', label: 'Yield', unit: 'Mg DM/ha', good: 1 }, { id: 'irr', label: 'Irrigation', unit: 'mm/season', good: -1 }, { id: 'aet', label: 'Evapotranspiration', unit: 'mm/season', good: 0 },
    { id: 'perc', label: 'Percolation below 100 cm', unit: 'mm/season', good: -1 }, { id: 'leach', label: 'Nitrate leached below 100 cm', unit: 'kg N/ha/season', good: -1 }, { id: 'den', label: 'Denitrification', unit: 'kg N/ha/season', good: -1 },
    { id: 'IE', label: 'Irrigation efficiency', unit: 'kg grain per m3', good: 1 }, { id: 'rain', label: 'Rain', unit: 'mm/season', good: 0 },
    { id: 'wstress', label: 'Water-stress days at harvest', unit: 'days', good: -1 }, { id: 'nstress', label: 'Nitrogen-stress days at harvest', unit: 'days', good: -1 },
    { id: 'IWUE', label: 'Irrigation water-use efficiency (yield gain over the rainfed reference per m3 of irrigation)', unit: 'kg per m3', good: 1 }, { id: 'DPF', label: 'Deep-percolation fraction of rain + irrigation', unit: '%', good: -1 },
    { id: 'PFPn', label: 'Partial factor productivity of nitrogen', unit: 'kg DM per kg N', good: 1 }, { id: 'NLF', label: 'Nitrate leached as a share of N applied', unit: '%', good: -1 },
    { id: 'run', label: 'Runoff', unit: 'mm/season', good: -1 }, { id: 'upt', label: 'Nitrogen taken up by the crop', unit: 'kg N/ha/season', good: 1 }, { id: 'vol', label: 'Ammonia volatilised', unit: 'kg N/ha/season', good: -1 }, { id: 'fert', label: 'Nitrogen applied', unit: 'kg N/ha/season', good: 0 },
    // efficiency indices from the literature (EU Nitrogen Expert Panel 2015; Dobermann 2005; Ladha et al. 2005; Doorenbos and Kassam 1979; Howell 2001)
    { id: 'NUE', label: 'Nitrogen use efficiency (crop uptake as a share of N input)', unit: '%', good: 1 }, { id: 'Nsurp', label: 'Nitrogen surplus (input minus crop uptake)', unit: 'kg N/ha/season', good: -1 },
    { id: 'NLoss', label: 'Reactive nitrogen lost (leached, denitrified, volatilised)', unit: 'kg N/ha/season', good: -1 }, { id: 'NLpY', label: 'Nitrate leached per tonne of yield', unit: 'kg N per Mg', good: -1 },
    { id: 'AEn', label: 'Agronomic efficiency of nitrogen (yield gain over the least fertilised run)', unit: 'kg DM per kg N', good: 1 }, { id: 'REn', label: 'Apparent nitrogen recovery (extra uptake over the least fertilised run)', unit: '%', good: 1 },
    { id: 'PEn', label: 'Physiological efficiency of nitrogen (yield gain per extra N taken up)', unit: 'kg DM per kg N', good: 1 },
    { id: 'WUE', label: 'Water-use efficiency (yield per m3 of evapotranspiration)', unit: 'kg per m3', good: 1 }, { id: 'WPtot', label: 'Yield per m3 of rain and irrigation', unit: 'kg per m3', good: 1 },
    { id: 'HI', label: 'Harvest index (storage organ over total dry matter)', unit: 'ratio', good: 1 }, { id: 'ETr', label: 'Relative evapotranspiration (actual over potential)', unit: 'ratio', good: 1 },
    { id: 'Cnc', label: 'Nitrate in the drainage (flow-weighted concentration)', unit: 'mg N/L', good: -1 }, { id: 'CLF', label: 'Chemical leached below 200 cm, share of the amount sprayed', unit: '%', good: -1 }, { id: 'CDF', label: 'Chemical degraded, share of the amount sprayed', unit: '%', good: 0 }
  ];
  E.respOf = function (st) { const r = { yield: st.yield, irr: st.irr, aet: st.aet, perc: st.perc, leach: st.leach, den: st.den, rain: st.rain, run: st.run, upt: st.upt, vol: st.vol, fert: st.fert }; r.IE = st.irr > 5 ? st.yield * 1000 / (st.irr * 10) : NaN; r.wstress = st.wstress; r.nstress = st.nstress;
    const inp = (st.rain || 0) + (st.irr || 0); r.DPF = inp > 0 && isFinite(st.perc) ? 100 * st.perc / inp : NaN; r.PFPn = st.fert > 1 ? st.yield * 1000 / st.fert : NaN; r.NLF = st.fert > 1 && isFinite(st.leach) ? 100 * st.leach / st.fert : NaN; r.IWUE = NaN;
    const nin = (st.fert || 0) + (st.dep || 0), fin = isFinite, wet = (st.rain || 0) + (st.irr || 0);
    r.NUE = nin > 1 && fin(st.upt) ? 100 * st.upt / nin : NaN; r.Nsurp = nin > 1 && fin(st.upt) ? nin - st.upt : NaN; r.NLoss = fin(st.leach) ? st.leach + (st.den || 0) + (st.vol || 0) : NaN; r.NLpY = st.yield > 0.05 && fin(st.leach) ? st.leach / st.yield : NaN;
    r.AEn = NaN; r.REn = NaN; r.PEn = NaN; r.WUE = st.aet > 5 ? st.yield * 100 / st.aet : NaN; r.WPtot = wet > 5 ? st.yield * 100 / wet : NaN; r.Cnc = st.perc > 5 && fin(st.leach) ? 100 * st.leach / st.perc : NaN; r.CLF = st.tSpray > 0 && fin(st.tLeach) ? 100 * st.tLeach / st.tSpray : NaN; r.CDF = st.tSpray > 0 && fin(st.tDec) ? 100 * st.tDec / st.tSpray : NaN; r.dep = st.dep; r.HI = st.hi; r.ETr = st.pet > 5 && st.aet > 0 ? st.aet / st.pet : NaN; return r; };
  /* the indices that need a rainfed run of the same soil and weather: the yield gain per mm of irrigation water */
  E.indices = function (rows) {
    // nitrogen indices against the least fertilised run (the control of the experiment): agronomic efficiency, apparent recovery, physiological efficiency
    { const ok = rows.filter(x => !x.reference && isFinite(x.r.fert) && isFinite(x.r.yield)); if (ok.length > 1) { const c = ok.reduce((a, b) => b.r.fert < a.r.fert ? b : a), F0 = c.r.fert, Y0 = c.r.yield, U0 = c.r.upt; ok.forEach(x => { const dF = x.r.fert - F0, dU = x.r.upt - U0; if (dF > 1) { x.r.AEn = (x.r.yield - Y0) * 1000 / dF; x.r.REn = isFinite(dU) ? 100 * dU / dF : NaN; } if (isFinite(dU) && dU > 1) x.r.PEn = (x.r.yield - Y0) * 1000 / dU; }); } }
    const refs = rows.filter(x => x.reference && isFinite(x.r.yield)); if (!refs.length) return;
    rows.forEach(x => { if (x.reference) return; const ref = refs.find(q => Object.keys(q.f).every(k => q.f[k] === x.f[k])) || refs[0], irr = x.r.irr; x.r.IWUE = irr > 5 ? (x.r.yield - ref.r.yield) * 1000 / (irr * 10) : NaN; });
  };
  // the table of the published runs, in the same shape
  E.ENS_FACTORS = { P: ['precip', 'Rain scale'], dT: ['temp', 'Temperature shift (C)'], Ep: ['ep', 'Soil evaporation factor'], trig: ['trig', 'Trigger suction (cm)'], z: ['z', 'Sensor depth (cm)'], amt_mm: ['mm', 'Water per irrigation (mm)'], vff: ['vff', 'Mulch vapour flux factor'], cap: ['cap', 'Mulch interception capacity (mm)'], Nrate: ['nrate', 'Nitrogen rate (kg N/ha)'], wstrat: ['wstrat', 'Water strategy'], root: ['root', 'Rooting depth (cm)'], soil: ['soil', 'Soil'] };
  E.ENS_RESP = { yield_Mg_ha: 'yield', irrigation_mm: 'irr', ET_mm: 'aet', drainage_1m_mm: 'perc', N_leached_kg_ha: 'leach', IE_kg_m3: 'IE', rain_mm: 'rain', transpiration_mm: 'transp', soil_evap_mm: 'sevap', water_stress_d: 'stress' };
  E.parseEnsemble = function (text) {
    const L = text.replace(/\r/g, '').split('\n'); const h = L[0].split(','), ix = n => h.indexOf(n), rows = [];
    for (let i = 1; i < L.length; i++) { if (!L[i]) continue; const p = L[i].split(','), g = n => p[ix(n)], row = { exp: g('exp'), id: g('run_id'), soil: (g('soil') || '').replace(/^S\d+_/, ''), treatment: g('treatment'), valid: +g('valid'), f: {}, r: {} };
      Object.keys(E.ENS_FACTORS).forEach(k => { const v = g(k); if (v !== '' && v != null) { const x = parseFloat(v); row.f[E.ENS_FACTORS[k][0]] = isFinite(x) && k !== 'wstrat' && k !== 'soil' ? x : (k === 'soil' ? row.soil : v); } });
      Object.keys(E.ENS_RESP).forEach(k => { const x = parseFloat(g(k)); row.r[E.ENS_RESP[k]] = isFinite(x) ? x : NaN; }); rows.push(row); }
    return rows;
  };

  // ------------------------------------------------------------------ summaries over rows [{ val|f:{factorId:value}, r:{resp} }]
  const fv = row => row.val || row.f || {}, num = x => typeof x === 'number' ? x : parseFloat(x);
  const mean = a => { const v = a.filter(isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
  const keyCmp = (a, b) => { const x = num(a), y = num(b); return isFinite(x) && isFinite(y) ? x - y : String(a).localeCompare(String(b)); };
  E.levels = (rows, fid) => Array.from(new Set(rows.map(r => fv(r)[fid]).filter(v => v !== undefined && v !== ''))).sort(keyCmp);
  E.marginal = function (rows, fid, resp) { rows = rows.filter(r => !r.reference); return E.levels(rows, fid).map(l => { const v = rows.filter(r => fv(r)[fid] === l).map(r => r.r[resp]).filter(isFinite); return { level: l, mean: mean(v), n: v.length, min: v.length ? Math.min.apply(null, v) : NaN, max: v.length ? Math.max.apply(null, v) : NaN }; }); };
  E.grid = function (rows, f1, f2, resp) { rows = rows.filter(r => !r.reference); const xs = E.levels(rows, f1), ys = E.levels(rows, f2), z = ys.map(y => xs.map(x => mean(rows.filter(r => fv(r)[f1] === x && fv(r)[f2] === y).map(r => r.r[resp])))); return { xs, ys, z }; };
  E.sensitivity = function (rows, fids, resp) { const out = fids.map(f => { const m = E.marginal(rows, f, resp).filter(x => isFinite(x.mean)); const vals = m.map(x => x.mean); return { id: f, range: vals.length > 1 ? Math.max.apply(null, vals) - Math.min.apply(null, vals) : 0, lo: vals.length ? Math.min.apply(null, vals) : NaN, hi: vals.length ? Math.max.apply(null, vals) : NaN, levels: m.length }; }); const tot = mean(rows.map(r => r.r[resp])); out.forEach(o => o.rel = isFinite(tot) && tot !== 0 ? o.range / Math.abs(tot) : NaN); return out.sort((a, b) => b.range - a.range); };
  E.pareto = function (rows, ax, ay) { // minimise ax, maximise ay
    const P = rows.filter(r => isFinite(r.r[ax]) && isFinite(r.r[ay])); return P.filter(a => !P.some(b => b !== a && b.r[ax] <= a.r[ax] && b.r[ay] >= a.r[ay] && (b.r[ax] < a.r[ax] || b.r[ay] > a.r[ay]))); };
  E.csv = function (rows, fids, resps) { const cols = ['run'].concat(fids, resps); const q = v => { const s = v == null || (typeof v === 'number' && !isFinite(v)) ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; return [cols.join(',')].concat(rows.map(r => [r.id || ''].concat(fids.map(f => fv(r)[f]), resps.map(k => r.r[k])).map(q).join(','))).join('\n') + '\n'; };

  // ------------------------------------------------------------------ the experiment folder
  // the logs of the process layers of Fig. 1 of the Daisy paper: snow, surface water, soil temperature and ice, organic matter pools, carbon balance, denitrification, ammonium, flow in matrix and biopores, bioclimate, photosynthesis, drains
  S.PROCESS_LOGS = [['Snow', 'Daily-Snow'], ['Surface water', 'Daily-SurfaceWater'], ['Soil Temperature', 'Daily-SoilTemp'], ['Soil Ice', 'Daily-SoilIce'], ['Organic Matter', 'Daily-OM'], ['Carbon Balance', 'Daily-CarbonBalance'], ['Denitrification', 'Daily-Denitrification'], ['Soil NH4-N Content', 'Daily-NH4'], ['Preferential Water Flux', 'Daily-BioporeFlux'], ['Matrix Water Flux', 'Daily-MatrixFlux'], ['Bioclimate', 'Daily-Bioclimate'], ['Crop Photosynthesis', 'Daily-Photosynthesis'], ['Drain Sink Water', 'Daily-DrainSink']];
  S.logFilter = function (txt, level) {
    if (level === 'process') return txt.replace(/\)\s*$/, '') + S.PROCESS_LOGS.map(p => '\n  ("' + p[0] + '" (when daily) (where "' + p[1] + '.dlf"))').join('') + '\n)\n';
    if (!level || level === 'full') return txt;
    const keep = { annual: /Annual-/, season: /Annual-(Harvest|FWater\.|FN\.)/, light: /Annual-|Daily-(CropProduction|FWater|Theta)/ }[level] || /Annual-/;
    const clean = txt.split('\n').map(l => l.replace(/;.*$/, '')).join('\n'), o = clean.indexOf('(output'); if (o < 0) return txt;
    let depth = 0, i = o, entries = [], start = -1; for (; i < clean.length; i++) { const c = clean[i]; if (c === '"') { const j = clean.indexOf('"', i + 1); i = j < 0 ? clean.length : j; continue; } if (c === '(') { depth++; if (depth === 2) start = i; } else if (c === ')') { if (depth === 2) entries.push(clean.slice(start, i + 1)); depth--; if (depth === 0) break; } }
    return clean.slice(0, 0) + clean.slice(0, o).replace(/\s+$/, '') + '\n(output\n' + entries.filter(e => keep.test(e)).map(e => '  ' + e.replace(/\s*\n\s*/g, ' ')).join('\n') + '\n)\n';
  };
  /* jobs: [{ run, job }] from DaisyScen.buildJob. Returns { 'path': text } laid out as crops/, soils/, weather/, OutputLog_*.dai, runs/<id>/Runfile.dai, run_all.sh */
  /* the experiment folder, laid out like a Daisy exercise: one numbered folder for each run with its own .dai file, a Common folder with
     the shared inputs, and a README that gives the design, what is kept the same, how to run, and where each index is found */
  const slug = (t, n) => String(t || '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, n || 40) || 'run';
  const SHORT = { precip: 'P', temp: 'T', nfac: 'N', mm: 'mm', hours: 'h', trig: 'trig', z: 'z', limit: 'lim', root: 'root', koc: 'Koc', half: 'half', ntime: 'ndate', radscale: 'rad', flux: 'flux' };
  /* a short name for a run, from the values of the factors: Loam_Overhead_N1.25 */
  E.shortName = function (run) {
    const parts = []; Object.keys(run.val || {}).forEach(id => { const q = E.partName(id, run.val[id]); if (q) parts.push(q); });
    if (run.reference) return 'Rainfed_reference' + (parts.length ? '_' + parts.join('_') : '');   // one reference for every soil and weather: its name says which
    return parts.join('_') || run.label || run.id; };
  /* a short name of a run for figures and tables, from its values: "-14 d · N×0.7 · Sand · +2 °C · rainfed" */
  const SL = { vg_ks: v => 'K_s × ' + v, vg_alpha: v => 'α × ' + v, vg_n: v => 'n × ' + v, vg_ts: v => 'θ_s × ' + v, vg_l: v => 'l ' + (v >= 0 ? '+ ' : '− ') + Math.abs(v), ntime: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' d', nfac: v => 'N × ' + v, precip: v => 'P × ' + v, temp: v => 'ΔT = ' + (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' °C', radscale: v => 'R_s × ' + v, mm: v => v + ' mm', hours: v => v + ' h', trig: v => v + ' cm', z: v => 'sensor ' + v + ' cm', limit: v => +v ? '≤ ' + v + ' mm' : 'no limit', root: v => 'roots ' + v + ' cm', koc: v => 'K_oc = ' + v + ' L kg⁻¹', half: v => 'DT_50 = ' + v + ' d', tc: v => 't_c = ' + v + ' d⁻¹', flux: v => v + ' mm h⁻¹', irrig: v => String(v) === '1' ? 'irrigated' : 'rainfed', stub: v => 'stubble ' + v + ' cm', wtemp: v => 'water ' + v + ' °C', fdepth: v => +v ? 'fertiliser to ' + v + ' cm' : 'fertiliser on the surface', detain: v => 'detention ' + v + ' mm' };
  E.shortLabel = function (val, reference) { const parts = Object.keys(val || {}).map(id => { const v = val[id]; if (v == null || v === 'undefined') return ''; if (SL[id] && !isNaN(+v)) return SL[id](+v); if (SL[id]) return SL[id](v); const F = E.factor(id); if (F && F.param) return F.param.key.replace(/_/g, ' ') + ' ' + v; const nm = F ? String(E.levelName(F, v && v.label ? v.label : v)) : String(v); return nm.replace(/\s*\((USDA|Daisy horizon|built-in[^)]*)\)/i, '').replace(/^Built-in /, '').replace(/\|.*$/, ''); }).filter(Boolean); return (reference ? 'rainfed ref. · ' : '') + (parts.join(' · ') || 'baseline'); };
  E.partName = function (id, v) { const F = E.factor(id); if (!F || v == null || v === 'undefined') return ''; if (F.lib || String(v).indexOf('|') > 0) return String(v).split('|')[0].replace(/^hzn?:/, ''); if (F.kind === 'num') return (SHORT[id] || (F.param ? F.param.key : id)) + v; if (F.kind === 'set') return String((v && v.label) || v); if (id === 'irrig') return v === '1' || v === 1 ? 'irrigated' : 'rainfed'; return String(E.levelName(F, v)).replace(/\s*\(.*\)/, ''); };
  /* what each part of a run file does, with its line numbers: the top-level forms of the .dai, in order */
  E.commonKind = function (f) { const b = String(f).split('/').pop();
    if (/Rotation|ArableFarmRotation/i.test(b)) return 'the crops and their management for every year: sowing, fertiliser (type, rate, date), tillage, the irrigation rule (trigger, sensor depth, dose, method) and harvest, with the chemical sprayed (defchemical) and the actions (defaction)';
    if (/ResFarm/i.test(b)) return 'the soil profile of the built-in farm (horizons and their hydraulics), the groundwater (aquitard) and the columns "ResFarm 1D; Free drainage" and "ResFarm_sand column"';
    if (/UserSoil/i.test(b)) return 'the soil of this run: its horizons (defhorizon) and the column "SWAFL user column" built from them';
    if (/OutputLog/i.test(b)) return 'the logs Daisy writes (yield, water and nitrogen balances, soil water, chemical), with their file names and how often';
    if (/\.dwf$/i.test(b)) return 'the weather: one line a day of rain, temperature, radiation and more'; return 'a file of the Daisy library (the copy in Common/ leaves out what the run already reads)'; };
  E.explainDai = function (t) {
    const out = [], n = t.length; let i = 0, line = 1, com = [];
    const lineAt = (from, to) => { let c = 0; for (let k = from; k < to; k++) if (t.charCodeAt(k) === 10) c++; return c; };
    const say = (a, b, txt) => out.push('  ' + (a === b ? 'line  ' + a : 'lines ' + a + '-' + b).padEnd(13) + ' ' + txt);
    while (i < n) { const c = t[i];
      if (c === '\n') { line++; i++; continue; } if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
      if (c === ';') { const e = t.indexOf('\n', i); com.push(line); i = e < 0 ? n : e; continue; }
      if (c !== '(') { i++; continue; }
      if (com.length) { say(com[0], com[com.length - 1], 'comments (Daisy skips every line that starts with ;): ' + (com[0] === 1 ? 'the run number, the values of this run and the years simulated' : 'notes')); com = []; }
      let d = 0, j = i, str = false; for (; j < n; j++) { const ch = t[j]; if (str) { if (ch === '\\') j++; else if (ch === '"') str = false; continue; } if (ch === '"') str = true; else if (ch === ';') { const e = t.indexOf('\n', j); j = e < 0 ? n : e - 1; } else if (ch === '(') d++; else if (ch === ')') { d--; if (!d) break; } }
      const form = t.slice(i, j + 1), head = (form.match(/^\(\s*([^\s()"]+)/) || [])[1] || '', l0 = line, l1 = line + lineAt(i, j); let x;
      if (head === 'input') { const f = (form.match(/"([^"]+)"/) || [])[1] || ''; x = '(input file "' + f.split('/').pop() + '"): reads ' + E.commonKind(f) + '.'; }
      else if (head === 'path') x = '(path "../Common" &old): Daisy looks for files in Common/ first, then in its own library.';
      else if (head === 'defunit') x = '(defunit [kWh/d/m^2] ...): defines the unit of the radiation column of the weather file, so Daisy can read it.';
      else if (head === 'weather') { const ps = (form.match(/\((PrecipCorrect|TempOffset|GlobRadScale)\s+[^)]*\)/g) || []).join(' '); x = '(weather default "...dwf"): the weather file of the run' + (ps ? ' and the factors applied to it: ' + ps + ' (rain x factor, temperature + offset, radiation x factor)' : '') + '.'; }
      else if (head === 'description') x = '(description ...): the text Daisy writes at the top of every log of this run.';
      else if (head === 'log_prefix') x = '(log_prefix ...): put before the name of every log, so the logs of the runs never mix.';
      else if (head === 'manager') x = '(manager activity (repeat "' + ((form.match(/repeat\s+"([^"]+)"/) || [])[1] || '') + '")): the management, repeated every year; it is defined in the rotation file.';
      else if (head === 'defcolumn') { const nm = form.match(/defcolumn\s+"([^"]+)"\s+"([^"]+)"/), inner = (form.match(/\n\s*\((?!Bioclimate)[A-Za-z_]+\s*\([^\n]*\)\)?/g) || []).map(q => { q = q.trim(); while ((q.match(/\)/g) || []).length > (q.match(/\(/g) || []).length) q = q.slice(0, -1); return q; }).filter(q => !/^\(Bioclimate/.test(q)); x = '(defcolumn' + (nm ? ' "' + nm[1] + '" "' + nm[2] + '"' : '') + '): the soil column of the run, made from the column ' + (nm ? '"' + nm[2] + '"' : '') + '; (Bioclimate ...) chooses the evapotranspiration model' + (/parameters from the Daisy reference/.test(form) ? '; after ";; parameters from the Daisy reference" come the values this run varies: ' + inner.join(' ') : '') + '.'; }
      else if (head === 'column') x = '(column ...): the column the simulation uses.';
      else if (head === 'time') x = '(time ' + ((form.match(/time\s+([^)]*)\)/) || [])[1] || '').trim() + '): the start of the simulation (year month day).';
      else if (head === 'stop') x = '(stop ' + ((form.match(/stop\s+([^)]*)\)/) || [])[1] || '').trim() + '): the end of the simulation.';
      else if (head === 'activate_output') x = '(activate_output (after ...)): the logs start after this date; the time before it is the warm-up of the soil.';
      else if (head === 'output') x = '(output ...): a log of the Daisy library written as well.';
      else if (head === 'run') x = '(run ...): runs a program of the Daisy library.';
      else x = '(' + head + ' ...): a setting of Daisy.';
      say(l0, l1, x); line = l1; i = j + 1; }
    if (com.length) say(com[0], com[com.length - 1], 'comments');
    return out; };
  // the names a file defines and the files it reads
  const defsOf = (t, kind) => { const re = new RegExp('\\(def' + kind + '\\s+(?:"([^"]+)"|([^\\s()"]+))', 'g'), o = []; let m; while ((m = re.exec(t || ''))) o.push(m[1] || m[2]); return o; };
  const inputsOf = t => { const o = []; String(t || '').split('\n').forEach(l => { if (/^\s*;/.test(l)) return; const m = l.match(/\(input\s+file\s+"([^"]+)"/); if (m) o.push(m[1]); }); return o; };
  /* how one run file was made, step by step, in plain words */
  E.howMade = function (run, fl, lm, nm) {
    const H = root.DaisyFactorHelp, o = [];
    o.push('  Step 1. You chose what changes and its values in the Experiments tab (saved in plan.json):');
    (fl || []).forEach(f => { const F = E.factor(f.id); o.push('            ' + ((F && F.label) || f.id).replace(/ \(Daisy reference.*\)$/, '') + ': ' + (f.levels || []).map(v => v && v.label ? v.label : F ? E.levelName(F, v) : v).join(', ')); });
    o.push('  Step 2. The workbench made the combinations of these values' + (lm && lm.total ? ' (' + lm.total.toLocaleString() + ')' : '') + (lm && lm.chosen < lm.total ? ' and chose ' + lm.chosen + ' of them ' + ((E.PICKS.find(q => q[0] === lm.pick) || [])[2] || '') + ' with seed ' + lm.seed : '') + '.',
      '          This run is one of them: ' + (run.label || 'the baseline') + '.',
      '  Step 3. It took the template of the built-in farm, the same for every run: the rotation of spring barley,',
      '          winter barley, winter rape and winter wheat on the farm soil, with the Taastrup weather (or your own).',
      '  Step 4. It wrote each value of this run where Daisy reads it:');
    Object.keys(run.val || {}).forEach(id => { const F = E.factor(id), h = H && F ? H.get(F) : null; o.push('            ' + ((F && F.label) || id).replace(/ \(Daisy reference.*\)$/, '') + ' = ' + (F ? E.levelName(F, run.val[id]) : run.val[id]) + (h && h.d ? '  ->  ' + h.d : '')); });
    if (!Object.keys(run.val || {}).length) o.push('            (no value changed: this is the baseline)');
    o.push('  Step 5. Files that are the same for several runs (weather, soil, rotation, output) went once into Common/,',
      '          named after the values they carry; this run file points to them with (input file "../Common/...").',
      '  Step 6. It added the comments at the top, the description and the log prefix "' + nm + '-", and saved the file as',
      '          ' + nm + '.dai in this folder.');
    return o; };
  /* how Daisy calls everything when it runs this file: a tree with the real names of this run */
  E.callTree = function (rf, nm, read) {
    const o = [], ins = inputsOf(rf).map(f => f.replace(/^\.\.\/Common\//, '')), last = (i, n) => i === n - 1 ? '`--' : '|--';
    o.push('  daisy ' + nm + '.dai', '   |');
    const steps = [];
    ins.forEach(f => { const t = read(f) || '', sub = [], k = E.commonKind(f).split(':')[0];
      inputsOf(t).forEach(x => sub.push('reads ' + x.split('/').pop() + ' (Daisy library)'));
      const ch = defsOf(t, 'chemical'); if (ch.length) sub.push('defines the chemical ' + ch.map(x => '"' + x + '"').join(', '));
      const ac = defsOf(t, 'action'); if (ac.length) sub.push('defines the actions ' + ac.map(x => '"' + x + '"').join(', '));
      const hz = defsOf(t, 'horizon'); if (hz.length) sub.push('defines the soil horizons ' + hz.slice(0, 6).map(x => '"' + x + '"').join(', ') + (hz.length > 6 ? ' ...' : ''));
      const co = defsOf(t, 'column'); if (co.length) sub.push('defines the columns ' + co.slice(0, 4).map(x => '"' + x + '"').join(', ') + (co.length > 4 ? ' ...' : ''));
      const lg = (t.match(/where\s+"([^"]+\.dlf)"/g) || []).map(x => x.match(/"([^"]+)"/)[1]); if (lg.length) sub.push('defines the logs ' + lg.slice(0, 5).join(', ') + (lg.length > 5 ? ' ... (' + lg.length + ' logs)' : ''));
      steps.push({ t: 'reads ../Common/' + f, sub }); });
    const w = rf.match(/\(weather\s+default\s+"([^"]+)"/); if (w) steps.push({ t: '(weather default "' + w[1].split('/').pop() + '"): the weather of every day', sub: [] });
    const dc = rf.match(/\(defcolumn\s+"([^"]+)"\s+"([^"]+)"/); if (dc) steps.push({ t: '(defcolumn "' + dc[1] + '" "' + dc[2] + '"): a column made from the column "' + dc[2] + '" defined above', sub: (rf.match(/;; parameters from the Daisy reference[\s\S]*?\n\s*\(column/) ? ['with the values this run varies (after ";; parameters from the Daisy reference")'] : []) });
    const mg = rf.match(/\(repeat\s+"([^"]+)"\)/); if (mg) steps.push({ t: '(manager ... (repeat "' + mg[1] + '")): calls the action "' + mg[1] + '" defined in the rotation, every year', sub: ['"' + mg[1] + '" calls in turn the actions of each crop: sowing, fertiliser, tillage, irrigation, harvest'] });
    const cl = rf.match(/\(column\s+"([^"]+)"\)/); if (cl) steps.push({ t: '(column "' + cl[1] + '"): calls the column defined above', sub: [] });
    const t0 = rf.match(/\(time\s+(\d{3,4}[^)]*)\)/), t1 = rf.match(/\(stop\s+(\d{3,4}[^)]*)\)/), ao = rf.match(/after\s+([^)]*)\)/);
    steps.push({ t: 'simulates hour by hour from ' + (t0 ? t0[1].trim() : '?') + ' to ' + (t1 ? t1[1].trim() : '?') + (ao ? ' (logs from ' + ao[1].trim() + ')' : ''), sub: ['writes ' + nm + '-<log>.dlf in this folder for every log defined above, and daisy.log'] });
    steps.forEach((s0, i) => { o.push('   ' + last(i, steps.length) + ' ' + s0.t); s0.sub.forEach((x, j) => o.push('   ' + (i === steps.length - 1 ? '   ' : '|  ') + '   ' + last(j, s0.sub.length) + ' ' + x)); });
    o.push('', '  Read it from top to bottom: a name must be defined before it is called, so the files in Common/ come first.');
    return o; };
  E.folder = function (jobs, commonFiles, info) {
    info = info || {}; const plan = info.plan || {}, out = {}, seen = {}, root = 'Experiment_' + slug(info.title || info.request || 'Daisy', 36);
    /* every file of Common/ gets a name that is specific to this experiment and says what makes it different:
       <Experiment>_<file>[_<the factor values it belongs to>].ext, so two experiments never share a name and no name is a bare number */
    const tag = slug(info.title || info.request || 'Daisy', 22), cropBase = job => { const cr = job.options && job.options.crops; if (!Array.isArray(cr) || !cr.length) return 'Rotation_4_built-in_crops.dai'; const nm = Array.from(new Set(cr.map(c => slug(c.label || c.c || c.name, 18)))); return (nm.length === 1 ? 'Crop_' : 'Rotation_') + slug(nm.join('-'), 44) + '.dai'; }, baseOf = (f, job) => /^ArableFarmRotation/.test(f) ? cropBase(job) : f === 'OutputLog.dai' && job.options && job.options.log ? 'OutputLog_' + job.options.log + '.dai' : f === 'Station.dwf' && job.options && job.options.station ? job.options.station + '.dwf' : f;
    function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
    const uses = [], textOf = (f, job) => { let t = job.files['Common/' + f]; return t == null ? commonFiles[f] : t; };
    jobs.forEach(({ run, job }, ji) => { (job.files['Run/Runfile.dai'].match(/\.\.\/Common\/[^"]+/g) || []).forEach(m => { const f = m.slice(10), t = textOf(f, job); if (t != null) uses.push({ f, base: baseOf(f, job), t, h: hash(t) + ':' + t.length, run, ji }); }); });
    const names = {}, usedBy = {};
    const groups = {}; uses.forEach(u => { (groups[u.base] = groups[u.base] || {})[u.h] = (groups[u.base][u.h] || []).concat([u]); });
    Object.keys(groups).forEach(base => {
      const vs = Object.keys(groups[base]), ext = (base.match(/(\.[^.]+)$/) || ['', ''])[1], stem = base.slice(0, base.length - ext.length);
      // factors whose value is the same inside each variant and differs between variants: these are what the variant is for
      const ids = Array.from(new Set([].concat.apply([], vs.map(h => [].concat.apply([], groups[base][h].map(u => Object.keys(u.run.val || {}))))))); const rel = vs.length > 1 ? ids.filter(id => { const seenV = new Set(); let ok = true; vs.forEach(h => { const vals = new Set(groups[base][h].map(u => JSON.stringify((u.run.val || {})[id]))); if (vals.size !== 1) ok = false; vals.forEach(x => seenV.add(x)); }); return ok && seenV.size > 1; }) : [];
      const taken = {}; vs.forEach((h, k) => {
        const u0 = groups[base][h][0]; let d = vs.length === 1 ? '' : rel.map(id => E.partName(id, (u0.run.val || {})[id])).filter(Boolean).join('_'); if (vs.length > 1 && !d) d = u0.run.reference ? 'rainfed_reference' : 'variant' + (k + 1);
        let nm = tag + '_' + stem + (d ? '_' + slug(d, 40) : '') + ext; if (taken[nm]) nm = tag + '_' + stem + '_' + slug(d, 34) + '_' + (k + 1) + ext; taken[nm] = 1; names[base + '|' + h] = nm; usedBy[nm] = groups[base][h].map(u => u.ji + 1); }); });
    const put = (base, text, f, job) => { const h = hash(text) + ':' + text.length, nm = names[base + '|' + h] || (tag + '_' + base); out[root + '/Common/' + nm] = text; return nm; };
    const dirs = [], files = {};
    jobs.forEach(({ run, job }, i) => {
      const no = String(i + (jobs.length > 99 ? 1000 : 100)).slice(1), nm = slug(E.shortName(run), 44), dir = no + '_' + nm; dirs.push({ dir, run, nm, job });
      let rf = job.files['Run/Runfile.dai'];
      // the files of the Daisy library that the run reads by their own name (through the path ../Common): copied as they are
      { const refd = new Set((rf.match(/\.\.\/Common\/[^"]+/g) || []).map(x => x.slice(10))); Object.keys(job.files).forEach(k => { if (k.indexOf('Common/') !== 0) return; const b = k.slice(7); if (!refd.has(b) && /\(path "\.\.\/Common" &old\)/.test(rf)) out[root + '/Common/' + b] = job.files[k]; }); }
      rf = rf.replace(/\.\.\/Common\/([^"]+)/g, (m, f) => {
        let text = job.files['Common/' + f]; if (text == null) text = commonFiles[f]; if (text == null) return m;
        return '../Common/' + put(baseOf(f, job), text, f, job); });
      rf = rf.replace(/^;; SWAFL scenario[^\n]*\n/, ';; Experiment run ' + no + ': ' + run.label + '\n' + (job.options && job.options.start ? ';; Simulated from 1 January ' + job.options.start + ' to 1 April ' + job.options.stop + (job.options.userWx ? ', with ' + (job.options.userWx.name || 'your weather') + ' (' + job.options.userWx.first + ' to ' + job.options.userWx.last + ')' : '') + '\n' : '')).replace(/\(description "[^"]*"\)/, '(description "' + String((info.request || 'Experiment') + ' - ' + run.label).replace(/"/g, "'") + '")').replace(/\(log_prefix "[^"]*"\)/, '(log_prefix "' + nm + '-")');
      out[root + '/' + dir + '/' + nm + '.dai'] = rf;
    });
    // a README in every run folder: what this run is, its place in the design, how its file is arranged and what its Common files hold
    { const fl0 = (info.plan && ((info.plan.plan && info.plan.plan.factors) || info.plan.factors)) || [], lm = info.limit || {}, ttl = info.title || info.request || 'Daisy experiment', first = {};
      const vName = (id, v) => { const F = E.factor(id); return F ? E.levelName(F, v && v.label ? v.label : v) : String(v); };
      dirs.forEach((d, i) => { const rf = out[root + '/' + d.dir + '/' + d.nm + '.dai'], R = [], run = d.run;
        R.push('RUN ' + d.dir.split('_')[0] + ' OF THE EXPERIMENT: ' + ttl, '='.repeat(64), '', run.label + (run.reference ? '  (rainfed reference)' : ''), '',
          'IN SHORT', '  ' + d.nm + '.dai is a text file that tells Daisy what to simulate: which soil, crops, weather and management.', '  It was written by the SWAFL workbench from the template of the farm, with the values of this run put in.', '  It reads the shared files in ../Common/, and Daisy writes its results (.dlf logs) into this folder.', '  The sections below show how it was made, how its parts call each other, and what every line does.', '');
        R.push('THE VALUES OF THIS RUN'); if (fl0.length) fl0.forEach(f => { const F = E.factor(f.id), v = (run.val || {})[f.id]; R.push('  ' + ((F && F.label) || f.id).padEnd(52) + ' ' + (v == null ? (run.reference && F && F.irr ? 'none (rainfed)' : 'the value of the farm (not varied in this run)') : vName(f.id, v))); }); else R.push('  one run, no factor varied');
        R.push('', 'ITS PLACE IN THE DESIGN', '  Run ' + (i + 1) + ' of ' + dirs.length + ' runs' + (lm.total ? ', made from ' + (lm.chosen || dirs.length) + ' of the ' + lm.total.toLocaleString() + ' combinations of the values' + (lm.chosen && lm.chosen < lm.total ? ' (chosen ' + ((E.PICKS.find(q => q[0] === lm.pick) || [])[2] || '') + ', seed ' + lm.seed + ')' : '') : '') + '.');
        if (run.reference) R.push('  A rainfed reference: the same soil and weather as the irrigated runs listed in the README of the experiment, without irrigation, so the gain of irrigation is measured against it.');
        else if (dirs.some(q => q.run.reference)) { const ctxv = Object.keys(run.val || {}).filter(id => !(E.factor(id) || {}).irr).map(id => vName(id, run.val[id])).join(', '); const rr = dirs.find(q => q.run.reference && Object.keys(q.run.val || {}).every(id => JSON.stringify(q.run.val[id]) === JSON.stringify((run.val || {})[id]))); R.push('  Its rainfed reference' + (ctxv ? ' (' + ctxv + ')' : '') + ': ' + (rr ? rr.dir : 'none') + '.'); }
        R.push('', 'THE FILES OF THIS FOLDER', '  ' + d.nm + '.dai'.padEnd(10) + '  the run file: open it with Daisy in this folder.', '  README_run.txt     this file.', '  After the run      the logs ' + d.nm + '-*.dlf and daisy.log are written here.');
        R.push('', 'HOW THIS .dai FILE WAS CREATED'); E.howMade(run, fl0, lm, d.nm).forEach(x => R.push(x));
        R.push('', 'HOW EVERYTHING IS CALLED WHEN DAISY RUNS IT'); E.callTree(rf, d.nm, f => out[root + '/Common/' + f]).forEach(x => R.push(x));
        R.push('', 'HOW THE RUN FILE IS ARRANGED (' + d.nm + '.dai, top to bottom)'); E.explainDai(rf).forEach(x => R.push(x));
        R.push('', '  The order matters: the files in Common/ are read first, because the column and the management use what they define;', '  then the weather, the column, the management and the dates; Daisy then simulates every hour from (time) to (stop).');
        R.push('', 'THE COMMON FILES THIS RUN READS'); (rf.match(/\.\.\/Common\/[^"]+/g) || []).forEach(m => { const f = m.slice(10), base = f.replace(/^[^_]+_[^_]+_[^_]+_[^_]+_/, ''), txt = out[root + '/Common/' + f];
          R.push('  ' + f, '      ' + E.commonKind(f) + '.'); const key = f.replace(/_(overhead|surface|drip|rainfed_reference|variant\d+)?[^/]*$/, ''); 
          const grp = Object.keys(usedBy).filter(n => n !== f && n.split('_').slice(0, 6).join('_') === f.split('_').slice(0, 6).join('_') && /\.dai$/.test(n));
          if (grp.length && txt != null) { const o = out[root + '/Common/' + grp[0]] || '', A = o.split('\n').map(z => z.trim()), B = txt.split('\n').map(z => z.trim()), sA = new Set(A), sB = new Set(B), dB = B.filter(z => z && !sA.has(z) && !/^;;/.test(z)).slice(0, 6), dA = A.filter(z => z && !sB.has(z) && !/^;;/.test(z)).slice(0, 6);
            if (dA.length || dB.length) { R.push('      what differs from ' + grp[0] + ':'); dA.forEach(z => R.push('        - ' + z.slice(0, 130))); dB.forEach(z => R.push('        + ' + z.slice(0, 130))); } } });
        R.push('', 'HOW TO RUN THIS RUN ALONE', '  Keep the folder of the experiment as it is (this run reads ../Common/).', '  Linux, macOS:  cd ' + d.dir + ' && daisy ' + d.nm + '.dai', '  Windows:       cd ' + d.dir + '  then  "C:\\Program Files\\Daisy\\bin\\daisy.cmd" ' + d.nm + '.dai', '  Or open ' + d.nm + '.dai in the Set-up editor of the SWAFL Daisy workbench and press Run Daisy.');
        out[root + '/' + d.dir + '/README_run.txt'] = R.join('\r\n') + '\r\n'; }); }
    const fl = (plan.plan && plan.plan.factors) || (plan.factors || []), base = (plan.plan && plan.plan.base) || plan.base || {}, ds = (plan.plan && plan.plan.design) || plan.design || 'factorial';
    const fname = f => { const F = E.factor(f.id); return F ? F.label : f.id; };
    const lvl = f => (f.levels || []).map(v => { const F = E.factor(f.id); return F ? E.levelName(F, v && v.label ? v.label : v) : v; }).join(', ');
    const ref = jobs.filter(j => j.run.reference).length, nRuns = jobs.length;
    const varied = {}; fl.forEach(f => { const F = E.factor(f.id); if (F) { varied[F.key] = 1; (F.kind === 'set' && F.levels[0] && F.levels[0].set ? Object.keys(F.levels[0].set) : []).forEach(k => { varied[k] = 1; }); } });
    const optLabel = (k, v) => { const O = S.OPTIONS && S.OPTIONS[k]; if (!O) return String(v); const hit = (O.opts || []).find(o => String(o[0]) === String(v)); return hit ? hit[1] : String(v); };
    const kept = Object.keys(base).filter(k => base[k] !== '' && base[k] != null && !varied[k] && k !== 'start' && k !== 'stop').map(k => '  ' + ((S.OPTIONS && S.OPTIONS[k] && S.OPTIONS[k].label) || k) + ': ' + optLabel(k, base[k])).join('\r\n');
    const keptAll = (kept ? kept + '\r\n' : '') + '  Simulation: 1 January ' + (info.years ? info.years.start : base.start || (S.DEFAULTS && S.DEFAULTS.start) || 1980) + ' to 1 April ' + (info.years ? info.years.stop : base.stop || (S.DEFAULTS && S.DEFAULTS.stop) || 2000) + (info.years && info.years.wx ? ' (weather: ' + info.years.name + ', ' + info.years.wx[0] + ' to ' + info.years.wx[1] + '; Daisy starts one year after the weather begins)' : '');
    const dsn = { factorial: 'all combinations of the levels', oat: 'one factor at a time, the others at their middle level', paired: 'the levels side by side' }[ds] || ds;
    const L = [];
    L.push('EXPERIMENT - ' + (info.request || 'Daisy experiment'), '='.repeat(60), '',
      'IN SHORT', '  This folder is one Daisy experiment: ' + nRuns + ' runs of the same farm that differ only in the values you chose.', '  Each run is one .dai file (a text file that tells Daisy what to simulate) in its own numbered folder.', '  The files the runs share are written once in Common/. Run run_all.bat (Windows) or run_all.sh (Linux, macOS).', '  Below: the design, how the runs were chosen, how a .dai file is created, how Daisy calls everything, and every line.', '',
      'Design: ' + (fl.length ? fl.map(f => fname(f) + ' (' + (f.levels || []).length + ' levels)').join(' x ') : 'one run') + ' = ' + (info.total || nRuns - ref).toLocaleString() + ' combinations; ' + (nRuns - ref) + ' runs' + (ref ? ' + ' + ref + ' rainfed reference' + (ref === 1 ? '' : 's') + ' = ' + nRuns + ' runs' : '') + '.', 'Combinations: ' + dsn + '.', 'Made by the SWAFL Daisy workbench for Daisy 7.1.14. Open the .dai of a run in its own folder with Daisy to run it.', '',
      'FOLDERS', '  Common/                  shared inputs (weather, soils, rotations, output); every file is named after this experiment and, where several versions exist, after the factor values it belongs to');
    dirs.forEach(d => L.push('  ' + d.dir.padEnd(34).slice(0, Math.max(34, d.dir.length + 1)) + ' ' + d.run.label + (d.run.reference ? '  (rainfed reference)' : '')));
    L.push('', 'COMMON FILES AND THE RUNS THAT USE THEM'); Object.keys(usedBy).sort().forEach(n => L.push('  ' + n.padEnd(60) + ' runs ' + (usedBy[n].length > 12 ? usedBy[n].slice(0, 12).join(', ') + ' ... (' + usedBy[n].length + ' runs)' : usedBy[n].join(', '))));
    L.push('', 'WHAT IS VARIED');
    fl.forEach(f => L.push('  ' + fname(f) + ': ' + lvl(f)));
    // how the runs were made: the combinations, the .dai of each run, and how the data reach every run
    { const lm = info.limit || {}, pk = (E.PICKS.find(q => q[0] === (lm.pick || plan.pick || 'balanced')) || ['', ''])[1], tot = info.total || lm.total || nRuns - ref, prod = fl.map(f => (f.levels || []).length);
      L.push('', 'HOW THE COMBINATIONS WERE MADE');
      if (ds === 'factorial') L.push('  Test every combination: every value of each factor with every value of the others,', '  ' + (prod.length ? prod.join(' x ') + ' = ' + tot.toLocaleString() : '1') + ' combinations.');
      else if (ds === 'oat') L.push('  Change one thing at a time: one run with every factor at the value of the farm, then one run for each value', '  of each factor with the others at the value of the farm: 1 + ' + prod.join(' + ') + ' = ' + tot + ' combinations.');
      else L.push('  Pair the values in order: the 1st value of every factor together, then the 2nd, and so on (' + tot + ' combinations;', '  a factor with fewer values keeps its last one).');
      L.push('  Number of runs set: ' + (lm.max || plan.max || nRuns) + ' (the rainfed references count as runs).');
      if (lm.chosen != null && lm.chosen < tot) L.push('  There were more combinations than runs, so ' + lm.chosen + ' of the ' + tot.toLocaleString() + ' were chosen ' + ((E.PICKS.find(q => q[0] === (lm.pick || 'balanced')) || [])[2] || '') + ', with seed ' + lm.seed + '.',
        lm.pick === 'balanced' ? '  Balanced choice (a Latin hypercube over the values): each value of each factor appears in about the same number of runs,\r\n  the values are mixed at random between the factors, and no combination is used twice.' : lm.pick === 'random' ? '  Random choice: every combination had the same chance; the same seed always gives the same runs.' : lm.pick === 'spread' ? '  Evenly spaced: combination 1, then every (' + tot + '/' + lm.chosen + ')-th of the list in the order of the factors above.' : '  The first combinations in the order of the factors above (the last factor changes fastest).',
        '  The same plan, seed and Daisy version always make the same folder (plan.json keeps all of it).');
      else L.push('  Every combination is run.');
      if (ref) L.push('  A rainfed reference (no irrigation, every other value the same) is added for every soil and weather of the irrigated runs,', '  so the gain from irrigation is always measured against the same soil and weather: ' + ref + ' reference run' + (ref === 1 ? '' : 's') + '.');
      L.push('  A rainfed run never depends on an irrigation setting, so rainfed runs that would repeat are made once.', '  runs.csv lists every run folder with its values.');
      L.push('', 'HOW EACH .dai FILE IS MADE',
        '  1. The SWAFL scenario writer (DaisyScen.buildJob) writes one run file per combination from the same template:',
        '     the weather, soil, rotation and output files are read with (input file "../Common/<name>"),',
        '     then (defprogram ...) sets the column, the crops and the management, and (run ...) starts the simulation.',
        '  2. Each value of a factor is written where Daisy reads it (see the lines below): a soil chooses the horizon file,',
        '     a fertiliser or rotation changes the rotation file, a parameter is written in the column or crop definition,',
        '     an irrigation setting changes the (irrigate ...) action of the management.',
        '  3. Files that are the same for several runs are written once in Common/ and named after the values they carry;',
        '     the run file points to them, so changing a Common file changes every run listed for it below.',
        '  4. The description and log_prefix of the run file give the run name, so the logs of every run carry it.');
      // the lines that change with each factor: two runs that differ in that factor only
      const runText = dirs.map(d => out[root + '/' + d.dir + '/' + d.nm + '.dai'] || ''), diffs = [];
      fl.forEach(f => { let pair = null; for (let a = 0; a < dirs.length && !pair; a++) for (let b = a + 1; b < dirs.length && !pair; b++) { const va = dirs[a].run.val || {}, vb = dirs[b].run.val || {}; if (dirs[a].run.reference || dirs[b].run.reference) continue; const ks = Array.from(new Set(Object.keys(va).concat(Object.keys(vb)))); const dif = ks.filter(k => JSON.stringify(va[k]) !== JSON.stringify(vb[k])); if (dif.length === 1 && dif[0] === f.id) pair = [a, b]; }
        if (!pair) return; const la = runText[pair[0]].split('\n').map(x => x.trim()), lb = runText[pair[1]].split('\n').map(x => x.trim()), sa = new Set(la), sb = new Set(lb);
        const ch = lb.filter(x => x && !sa.has(x) && !/^;;|description|log_prefix/.test(x)).slice(0, 6), was = la.filter(x => x && !sb.has(x) && !/^;;|description|log_prefix/.test(x)).slice(0, 6);
        diffs.push('  ' + fname(f) + ': run ' + dirs[pair[0]].dir + ' against run ' + dirs[pair[1]].dir);
        if (!ch.length && !was.length) diffs.push('     the run files are the same; the value is carried by the Common file the run points to.');
        was.forEach(x => diffs.push('     - ' + x.slice(0, 150))); ch.forEach(x => diffs.push('     + ' + x.slice(0, 150)));
        // a value carried by a Common file: the lines that differ inside the two files
        const inp = x => (x.match(/\(input file "\.\.\/Common\/([^"]+)"/) || [])[1];
        was.map(inp).filter(Boolean).forEach(fa => { const fb = ch.map(inp).filter(Boolean).find(n => n !== fa && n.split('_').slice(0, 4).join('_') === fa.split('_').slice(0, 4).join('_')) || ch.map(inp).filter(Boolean)[0]; if (!fb) return; const A = String(out[root + '/Common/' + fa] || '').split('\n').map(x => x.trim()), B = String(out[root + '/Common/' + fb] || '').split('\n').map(x => x.trim()), sA = new Set(A), sB = new Set(B);
          const dA = A.filter(x => x && !sB.has(x) && !/^;;/.test(x)).slice(0, 5), dB = B.filter(x => x && !sA.has(x) && !/^;;/.test(x)).slice(0, 5); if (!dA.length && !dB.length) return;
          diffs.push('     inside the Common file (' + fa.slice(0, 50) + (fa.length > 50 ? '...' : '') + ' against the other):'); dA.forEach(x => diffs.push('       - ' + x.slice(0, 140))); dB.forEach(x => diffs.push('       + ' + x.slice(0, 140))); }); });
      if (diffs.length) L.push('', 'WHERE EACH VALUE IS WRITTEN (lines of the run file that change when only this factor changes)'), diffs.forEach(x => L.push(x));
      L.push('', 'HOW THE DATA REACH EVERY RUN',
        '  Weather : the station or your own weather (My data, online or the SWAFL project) is written once as a .dwf in Common/;',
        '            every run reads it with (weather default "../Common/<name>.dwf"); a rain, temperature or radiation factor',
        '            is written as PrecipCorrect, TempOffset or GlobRadScale in the (weather ...) of the run file, so the .dwf never changes.',
        '  Soil    : the horizons and the column are written in Common/ (one file per soil) and read with (input file ...).',
        '  Crops   : the rotation (sowing, fertiliser, harvest, tillage) is one file per variant in Common/.',
        '  Output  : OutputLog_*.dai in Common/ says which logs Daisy writes; the logs are written in the folder of each run.',
        '  Paths   : all paths are relative (../Common/), so the folder can be moved or sent as it is.');
      const csv = ['run_folder,label,reference'.concat(fl.length ? ',' + fl.map(f => '"' + fname(f).replace(/"/g, "'") + '"').join(',') : '')];
      dirs.forEach(d => csv.push([d.dir, '"' + String(d.run.label).replace(/"/g, "'") + '"', d.run.reference ? 1 : 0].concat(fl.map(f => { const v = (d.run.val || {})[f.id]; return v == null ? '' : '"' + String(v && v.label ? v.label : v).replace(/"/g, "'") + '"'; })).join(',')));
      out[root + '/runs.csv'] = csv.join('\r\n') + '\r\n'; }
        { const d0 = dirs.find(q => !q.run.reference) || dirs[0];
      L.push('', 'HOW THE FOLDER AND THE CODE ARE ARRANGED', '  ' + root + '/', '  |-- README_*.txt        this file: the design and how everything is made', '  |-- plan.json           the plan (factors, levels, number of runs, way of choosing, seed): open it in Experiments to make the same folder again',
        '  |-- runs.csv            one line per run: its folder and the value of every factor', '  |-- run_all.sh, run_all.bat   run every run, one after the other', '  |-- Common/             the files the runs share, each written once', '  |-- 00_<name>/ ... ' + dirs[dirs.length - 1].dir.split('_')[0] + '_<name>/   one folder per run: <name>.dai and README_run.txt (what the run is and how its file is arranged)', '',
        '  Every run file has the same arrangement; run ' + d0.dir + ' as the example:'); if (d0) E.explainDai(out[root + '/' + d0.dir + '/' + d0.nm + '.dai'] || '').forEach(x => L.push(x));
      L.push('  Only the lines listed under WHERE EACH VALUE IS WRITTEN change from one run to the next.');
      L.push('', 'HOW A .dai FILE IS CREATED (run ' + d0.dir + ' as the example)'); E.howMade(d0.run, fl, info.limit, d0.nm).forEach(x => L.push(x));
      L.push('', 'HOW EVERYTHING IS CALLED WHEN DAISY RUNS A RUN FILE (run ' + d0.dir + ')'); E.callTree(out[root + '/' + d0.dir + '/' + d0.nm + '.dai'] || '', d0.nm, f => out[root + '/Common/' + f]).forEach(x => L.push(x)); }
    L.push('', 'WHAT IS KEPT THE SAME IN ALL RUNS', keptAll, '  Crops, fertiliser, weather, soil and output are identical unless listed above.', '',
      'HOW TO RUN', '  Keep the folder structure (the run files point to ../Common/).', '  Open each .dai in its own folder with Daisy and run, or run run_all.sh (Linux, macOS) or run_all.bat (Windows) here.', '  The output files (.dlf) are written into the folder of the run, prefixed with the run name.', '  Rename daisy.log if you want to keep the run-time information of a run.', '',
      'WHERE TO FIND DATA FOR THE INDEXES',
      '  Yield        : *Annual-Harvest.dlf, column sorg_DM [Mg DM/ha]',
      '  Water stress : *Annual-Harvest.dlf, column WStress [d]; nitrogen stress: NStress [d]',
      '  Irrigation   : *Annual-FWater_100cm.dlf, column Irrigation [mm]',
      '  Rainfall     : *Annual-FWater_100cm.dlf, column Precipitation [mm]',
      '  Drainage 1 m : *Annual-FWater_100cm.dlf, columns Matrix percolation and Biopore percolation [mm]',
      '  N leached 1m : *Annual-FN_100cm.dlf, columns Matrix-Leaching and Biopore-Leaching [kg N/ha]',
      '  N applied    : *Annual-FN.dlf, column Min-Surface-Fertilizer [kg N/ha] (and the rotation file)',
      '  Annual files are written each 1 April, so each row covers April to March.', '',
      '  Unit conversions:', '    yield kg/ha   = sorg_DM x 1000', '    water m3/ha   = mm x 10',
      '  Irrigation efficiency  = yield_kg/ha / (irrigation_mm x 10)        [kg/m3]',
      '  Irrigation WUE         = (yield_irr - yield_rainfed) / (irr_mm x 10) [kg/m3]',
      '  Deep percolation frac. = drainage_1m / (irrigation + rainfall)',
      '  PFPn                   = yield_kg/ha / N_applied',
      '  N leaching fraction    = N_leached_1m / N_applied',
      '', 'The SWAFL Daisy workbench (Files tab) reads these .dlf files and draws the figures and these indexes for you.');
    out[root + '/README_' + slug(info.title || info.request || 'experiment', 24) + '.txt'] = L.join('\r\n') + '\r\n';
    out[root + '/run_all.sh'] = '#!/bin/sh\n# runs every simulation of this experiment (daisy must be on the PATH)\nfor d in [0-9]*/; do (cd "$d" && for f in *.dai; do daisy "$f"; done); done\n';
    out[root + '/run_all.bat'] = '@echo off\r\nrem runs every simulation of this experiment (daisy.exe must be on the PATH)\r\nfor /d %%d in ([0-9]*) do (pushd "%%d" && for %%f in (*.dai) do daisy "%%f" & popd)\r\n';
    out[root + '/plan.json'] = JSON.stringify(info, null, 1);
    return out;
  };

  /* reads a zip file (stored or deflated) into { path: Uint8Array }; needs DecompressionStream (browsers, Electron, Node 18+) */
  E.unzip = async function (buf) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), out = {};
    let e = u8.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--; if (e < 0) throw new Error('this is not a zip file');
    const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true), dec = new TextDecoder();
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('the zip file is damaged');
      const meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true), name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
      p += 46 + nl + xl + cl; if (/\/$/.test(name) || /^__MACOSX\//.test(name)) continue;
      const lnl = dv.getUint16(off + 26, true), lxl = dv.getUint16(off + 28, true), st = off + 30 + lnl + lxl, raw = u8.subarray(st, st + csz);
      if (meth === 0) out[name] = raw.slice();
      else if (meth === 8) { if (typeof DecompressionStream === 'undefined') throw new Error('this browser cannot unpack zip files; use the desktop app'); out[name] = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); }
      else throw new Error('the zip file uses a compression this reader does not know (' + meth + ')');
    }
    return out;
  };
  // zip, stored without compression (works everywhere, no library)
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  E.zip = function (files) {
    const enc = new TextEncoder(), names = Object.keys(files), parts = [], cen = []; let off = 0;
    const u16 = v => [v & 255, v >>> 8 & 255], u32 = v => [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
    names.forEach(n => { const nb = enc.encode(n), db = typeof files[n] === 'string' ? enc.encode(files[n]) : files[n], c = crc32(db);
      const lh = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(db.length), u32(db.length), u16(nb.length), u16(0))); parts.push(lh, nb, db);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(db.length), u32(db.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb); off += lh.length + nb.length + db.length; });
    let csz = 0; cen.forEach(b => csz += b.length); const end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(names.length), u16(names.length), u32(csz), u32(off), u16(0)));
    const all = parts.concat(cen, [end]); let tot = 0; all.forEach(b => tot += b.length); const o = new Uint8Array(tot); let p = 0; all.forEach(b => { o.set(b, p); p += b.length; }); return o;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.DaisyExp = E;
})(typeof window !== 'undefined' ? window : globalThis);
