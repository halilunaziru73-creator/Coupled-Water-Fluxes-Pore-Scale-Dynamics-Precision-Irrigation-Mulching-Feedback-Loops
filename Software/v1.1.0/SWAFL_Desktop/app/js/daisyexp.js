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
    { id: 'root', key: 'root', label: 'Maximum rooting depth', unit: 'cm', kind: 'num', levels: [30, 60, 90, 120, 150], range: [20, 200], words: ['root', 'rooting depth', 'roots'] },
    { id: 'soil', key: 'soil', label: 'Soil', unit: '', kind: 'cat', levels: ['usda:sand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:clayloam'], words: ['soil', 'soils', 'texture', 'sand', 'loam', 'clay', 'silt'] },
    { id: 'station', key: 'station', label: 'Weather station', unit: '', kind: 'cat', levels: ['course', 'it-bologna', 'dk-foulum'], words: ['station', 'site', 'location', 'climate of', 'bologna', 'foulum', 'jyndevad', 'valecov', 'jadwisin', 'bratislava', 'taastrup', 'mediterranean'] },
    { id: 'till', key: 'till', label: 'Tillage', unit: '', kind: 'cat', levels: ['plowing', 'rotavation', 'none'], words: ['tillage', 'plough', 'plow', 'plowing', 'ploughing', 'rotavat', 'no-till', 'no till', 'cultivation'] },
    { id: 'ntype', key: 'ntype', label: 'Type of mineral fertiliser', unit: '', kind: 'cat', levels: ['N25S', 'AmmoniumNitrate', 'Ammonia', 'Nitrate'], words: ['fertiliser type', 'fertilizer type', 'ammonium nitrate', 'ammonia', 'urea', 'form of nitrogen'] },
    { id: 'ntime', key: 'ntime', label: 'Fertiliser date, shift in days', unit: 'days', kind: 'num', levels: [-14, 0, 14, 28], range: [-60, 60], words: ['fertiliser timing', 'fertilizer timing', 'when to fertili', 'split application', 'delay the fertili'] },
    { id: 'bio', key: 'bio', label: 'Evapotranspiration model', unit: '', kind: 'cat', levels: ['auto', 'default'], names: { auto: 'FAO56', default: 'Daisy energy balance' }, words: ['evapotranspiration model', 'penman', 'fao56', 'bioclimate', 'energy balance'] },
    { id: 'radscale', key: 'radscale', label: 'Radiation, factor on the weather', unit: '', kind: 'num', levels: [0.9, 1, 1.1], range: [0.5, 1.5], words: ['radiation', 'cloud', 'sunshine', 'solar'] },
    { id: 'flux', key: 'flux', label: 'Irrigation intensity (constant flux)', unit: 'mm/h', kind: 'num', levels: [0.05, 0.1, 0.5, 2], range: [0.01, 20], irr: 1, words: ['flux', 'intensity', 'mm per hour', 'mm/h', 'constant depth'] },
    { id: 'koc', key: 'koc', label: 'Sorption of the chemical, K_OC', unit: 'L/kg', kind: 'num', levels: [0, 50, 100, 500], range: [0, 5000], words: ['sorption', 'koc', 'pesticide', 'chemical', 'tracer', 'herbicide'] },
    { id: 'half', key: 'half', label: 'Half-life of the chemical', unit: 'days', kind: 'num', levels: [0, 15, 30, 90], range: [0, 2000], words: ['half-life', 'half life', 'degradation', 'decay', 'persistence'] }
  ];
  E.FACTORS = F; E.factor = id => F.find(x => x.id === id);
  const IRR_ONLY = new Set(F.filter(f => f.irr).map(f => f.id));
  const nameOf = (f, v) => f.kind === 'set' ? v.label : f.names && f.names[v] ? f.names[v] : f.id === 'soil' ? (v === 'loam' ? 'Course loam' : v === 'sand' ? 'Course sand' : String(v).indexOf('usda:') === 0 ? S.USDA[String(v).slice(5)][0] + ' (USDA)' : v === 'user' ? 'My soil' : v) : f.id === 'station' ? (S.OPTIONS[f.key].opts.find(o => o[0] === v) || [0, v])[1].replace(/ \(.*/, '') : f.kind === 'num' ? v + (f.unit ? ' ' + f.unit : '') : String(v);
  E.levelName = nameOf;
  // a factor plus the levels chosen: { id, levels:[value or {label,set}] }
  E.norm = function (fs) { return (fs || []).map(x => { const f = E.factor(x.id); if (!f) throw new Error('unknown factor ' + x.id); const lv = (x.levels && x.levels.length ? x.levels : f.levels).map(v => f.kind === 'set' && typeof v === 'string' ? f.levels.find(l => l.label === v) || f.levels[0] : v); return { id: f.id, f, levels: lv }; }); };

  // ------------------------------------------------------------------ designs
  function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* plan: { factors:[{id, levels}], design:'factorial'|'oat'|'paired', base:{options}, max, seed, reference:bool }
     returns { runs:[{id,label,set,level:{factorId:label},val:{factorId:value}}], total, thinned } */
  E.design = function (plan) {
    const fs = E.norm(plan.factors), design = plan.design || 'factorial', max = plan.max || 200; let combos = [];
    const mk = (pick) => { const set = {}, level = {}, val = {}; pick.forEach((lv, i) => { const f = fs[i].f; if (lv === undefined) return; if (f.kind === 'set') Object.assign(set, lv.set); else set[f.key] = lv; level[f.id] = nameOf(f, lv); val[f.id] = f.kind === 'set' ? lv.label : lv; }); return { set, level, val }; };
    if (!fs.length) combos = [mk([])];
    else if (design === 'oat') { const baseIdx = fs.map(x => 0); fs.forEach((x, i) => x.levels.forEach((lv, j) => { const p = fs.map(() => undefined); p[i] = lv; combos.push(mk(p)); })); }
    else if (design === 'paired') { const n = Math.max.apply(null, fs.map(x => x.levels.length)); for (let j = 0; j < n; j++) combos.push(mk(fs.map(x => x.levels[Math.min(j, x.levels.length - 1)]))); }
    else { combos = [[]]; fs.forEach(x => { const nx = []; combos.forEach(c => x.levels.forEach(lv => nx.push(c.concat([lv])))); combos = nx; }); combos = combos.map(mk); }
    const total = combos.length; let thinned = false;
    if (total > max) { const r = rng(plan.seed || 7), idx = combos.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } const keep = idx.slice(0, max).sort((a, b) => a - b); combos = keep.map(i => combos[i]); thinned = true; }
    const needsIrr = fs.some(x => IRR_ONLY.has(x.id)), hasIrr = fs.some(x => x.id === 'irrig'), base = plan.base || {};
    const runs = combos.map((c, i) => { const set = Object.assign({}, c.set); if (needsIrr && !hasIrr && base.irrig !== '0') set.irrig = '1'; const lab = Object.keys(c.level).map(k => E.factor(k).label.replace(/ \(.*/, '').replace(/, factor.*/, '') + ' ' + c.level[k]).join(', ') || 'Baseline'; return { id: 'r' + String(i + 1).padStart(3, '0'), label: lab, set, level: c.level, val: c.val }; });
    if (plan.reference !== false && needsIrr && !hasIrr) runs.unshift({ id: 'r000', label: 'Rainfed reference', set: { irrig: '0' }, level: {}, val: {}, reference: true });
    return { runs, total, thinned, factors: fs.map(x => ({ id: x.id, label: x.f.label, unit: x.f.unit, kind: x.f.kind, levels: x.levels.map(v => x.f.kind === 'set' ? v.label : v) })) };
  };

  // ------------------------------------------------------------------ the 17 experiments of the SWAFL study
  const SOIL8 = ['loam', 'sand', 'usda:sand', 'usda:loamysand', 'usda:sandyloam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam', 'usda:siltyclayloam'];
  E.PRESETS = [
    { id: 'E0', name: 'Baselines', ens: 'E0_Baselines', ask: 'Rainfed baseline of every soil', plan: { design: 'factorial', factors: [{ id: 'soil', levels: SOIL8 }], base: { irrig: '0' } } },
    { id: 'E1', name: 'Dose and duration', ens: 'E1_Doses', ask: 'Irrigation dose by duration', plan: { design: 'factorial', factors: [{ id: 'mm', levels: [6, 12, 24, 36] }, { id: 'hours', levels: [3, 6, 12, 24] }] } },
    { id: 'E2', name: 'Trigger pressure', ens: 'E2_TriggerPressure', ask: 'Irrigation trigger suction', plan: { design: 'factorial', factors: [{ id: 'trig', levels: [-100, -150, -300, -800, -1500, -3000] }, { id: 'soil', levels: ['usda:sand', 'loam', 'usda:siltloam'] }] } },
    { id: 'E3', name: 'Sensor depth', ens: 'E3_SensorDepth', ask: 'Depth of the soil moisture sensor', plan: { design: 'factorial', factors: [{ id: 'z', levels: [10, 20, 30, 40, 60, 100] }, { id: 'soil', levels: ['usda:sand', 'loam', 'usda:siltloam'] }] } },
    { id: 'E4', name: 'Methods', ens: 'E4_Methods', ask: 'Overhead, surface and drip at three depths', plan: { design: 'factorial', factors: [{ id: 'method', levels: ['overhead', 'surface'] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] }, extra: [{ id: 'dripdepth' }] },
    { id: 'E5', name: 'Soil structure dynamics (SHP)', ens: 'E5_SHP_Dynamics', ask: 'Tillage system by structural consolidation rate', unsupported: 'needs the Daisy soil-structure (SHP) files of the study; use its published runs below' },
    { id: 'E6', name: 'Mediterranean pollution', ens: 'E6_Mediterranean_Pollution', ask: 'Nitrogen rate by water strategy, Bologna climate', plan: { design: 'factorial', factors: [{ id: 'nfac', levels: [0.4, 0.6, 0.8, 1] }, { id: 'limit', levels: [0, 120, 240] }], base: { station: 'it-bologna', start: 1996, stop: 2003 } } },
    { id: 'E7', name: 'Mulching', ens: 'E7_Mulching', ask: 'Mulch vapour flux factor by interception capacity', unsupported: 'the mulch (litter) parameters are not in the course crop files; use the published runs below' },
    { id: 'E8', name: 'Rain intensity and moisture', ens: 'E8_Rain_Intensity_Moisture', ask: 'Rain intensity by initial soil moisture', unsupported: 'needs hourly rain and an initial-moisture state; use the published runs below' },
    { id: 'E9', name: 'Soil moisture and rain', ens: 'E9_Soil_Moisture_Rain', ask: 'Trigger suction by rain scale by soil', plan: { design: 'factorial', factors: [{ id: 'trig', levels: [-100, -300, -800, -1500] }, { id: 'precip', levels: [0.6, 0.8, 1, 1.2] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E10', name: 'Amount, timing and soil', ens: 'E10_Amount_Timing_Soil', ask: 'Irrigation amount per event by timing window by soil', plan: { design: 'factorial', factors: [{ id: 'mm', levels: [10, 20, 30] }, { id: 'window', levels: ['Apr 1 - Oct 1', 'May 1 - Oct 1', 'Jun 1 - Oct 1'] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E11', name: 'Temperature, evaporation, rain', ens: 'E11_Temp_Evap_Rain', ask: 'Temperature shift by rain scale', plan: { design: 'factorial', factors: [{ id: 'temp', levels: [0, 1, 2, 3] }, { id: 'precip', levels: [0.6, 0.8, 1, 1.2] }] }, note: 'the soil-evaporation factor of the study is not a free parameter in the course crop files' },
    { id: 'E12', name: 'Sensor, trigger, rain', ens: 'E12_Sensor_Trigger_Rain', ask: 'Sensor depth by trigger by rain scale', plan: { design: 'factorial', factors: [{ id: 'z', levels: [10, 30, 60] }, { id: 'trig', levels: [-150, -300, -800] }, { id: 'precip', levels: [0.7, 1, 1.3] }] } },
    { id: 'E13', name: 'N, water, soil', ens: 'E13_N_Water_Soil', ask: 'Nitrogen rate by water strategy by soil', plan: { design: 'factorial', factors: [{ id: 'nfac', levels: [0.4, 0.7, 1, 1.3] }, { id: 'limit', levels: [0, 100, 300] }, { id: 'soil', levels: ['usda:sand', 'loam'] }] } },
    { id: 'E14', name: 'Mulch and rain', ens: 'E14_Mulch_Rain', ask: 'Mulch factors by rain scale', unsupported: 'the mulch (litter) parameters are not in the course crop files; use the published runs below' },
    { id: 'E15', name: 'Method, depth, amount', ens: 'E15_Method_Depth_Amount', ask: 'Irrigation method by rooting depth by amount', plan: { design: 'factorial', factors: [{ id: 'method', levels: ['overhead', 'surface', 'drip'] }, { id: 'root', levels: [45, 90, 135] }, { id: 'mm', levels: [10, 20, 30] }] } },
    { id: 'E16', name: 'Edge cases', ens: 'E16_Edge_Cases', ask: 'Stress-tested corners of rain, temperature, trigger and nitrogen', plan: { design: 'factorial', factors: [{ id: 'precip', levels: [0.5, 1.5] }, { id: 'temp', levels: [0, 2] }, { id: 'trig', levels: [-2000, -50] }, { id: 'nfac', levels: [0.2, 1.3] }] } }
  ];
  E.PRESETS.find(p => p.id === 'E4').plan.factors = [{ id: 'dripdepth', levels: ['drip 5-10 cm', 'drip 10-20 cm', 'drip 20-30 cm'] }, { id: 'soil', levels: ['usda:sand', 'loam'] }];

  // ------------------------------------------------------------------ responses
  E.RESP = [
    { id: 'yield', label: 'Yield', unit: 'Mg DM/ha', good: 1 }, { id: 'irr', label: 'Irrigation', unit: 'mm/season', good: -1 }, { id: 'aet', label: 'Evapotranspiration', unit: 'mm/season', good: 0 },
    { id: 'perc', label: 'Percolation below 100 cm', unit: 'mm/season', good: -1 }, { id: 'leach', label: 'Nitrate leached below 100 cm', unit: 'kg N/ha/season', good: -1 }, { id: 'den', label: 'Denitrification', unit: 'kg N/ha/season', good: -1 },
    { id: 'IE', label: 'Irrigation efficiency', unit: 'kg grain per m3', good: 1 }, { id: 'rain', label: 'Rain', unit: 'mm/season', good: 0 },
    { id: 'wstress', label: 'Water-stress days at harvest', unit: 'days', good: -1 }, { id: 'nstress', label: 'Nitrogen-stress days at harvest', unit: 'days', good: -1 },
    { id: 'IWUE', label: 'Irrigation water-use efficiency (yield gain over the rainfed reference per mm)', unit: 'kg DM per ha per mm', good: 1 }, { id: 'DPF', label: 'Deep-percolation fraction of rain + irrigation', unit: '%', good: -1 },
    { id: 'PFPn', label: 'Partial factor productivity of nitrogen', unit: 'kg DM per kg N', good: 1 }, { id: 'NLF', label: 'Nitrate leached as a share of N applied', unit: '%', good: -1 }
  ];
  E.respOf = function (st) { const r = { yield: st.yield, irr: st.irr, aet: st.aet, perc: st.perc, leach: st.leach, den: st.den, rain: st.rain }; r.IE = st.irr > 5 ? st.yield * 1000 / (st.irr * 10) : NaN; r.wstress = st.wstress; r.nstress = st.nstress;
    const inp = (st.rain || 0) + (st.irr || 0); r.DPF = inp > 0 && isFinite(st.perc) ? 100 * st.perc / inp : NaN; r.PFPn = st.fert > 1 ? st.yield * 1000 / st.fert : NaN; r.NLF = st.fert > 1 && isFinite(st.leach) ? 100 * st.leach / st.fert : NaN; r.IWUE = NaN; return r; };
  /* the indices that need a rainfed run of the same soil and weather: the yield gain per mm of irrigation water */
  E.indices = function (rows) {
    const refs = rows.filter(x => x.reference && isFinite(x.r.yield)); if (!refs.length) return;
    rows.forEach(x => { if (x.reference) return; const ref = refs.find(q => q.f.soil === x.f.soil && q.f.precip === x.f.precip && q.f.temp === x.f.temp) || refs[0], irr = x.r.irr; x.r.IWUE = irr > 5 ? (x.r.yield - ref.r.yield) * 1000 / irr : NaN; });
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
  E.marginal = function (rows, fid, resp) { return E.levels(rows, fid).map(l => { const v = rows.filter(r => fv(r)[fid] === l).map(r => r.r[resp]).filter(isFinite); return { level: l, mean: mean(v), n: v.length, min: v.length ? Math.min.apply(null, v) : NaN, max: v.length ? Math.max.apply(null, v) : NaN }; }); };
  E.grid = function (rows, f1, f2, resp) { const xs = E.levels(rows, f1), ys = E.levels(rows, f2), z = ys.map(y => xs.map(x => mean(rows.filter(r => fv(r)[f1] === x && fv(r)[f2] === y).map(r => r.r[resp])))); return { xs, ys, z }; };
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
  E.folder = function (jobs, commonFiles, plan) {
    const out = {}, seen = {}; const put = (dir, base, text) => { const k = dir + '|' + text.length + '|' + hash(text); if (seen[k]) return seen[k]; let n = base, i = 1; while (out[dir + '/' + n] != null) { n = base.replace(/(\.[^.]+)$/, '_' + (++i) + '$1'); } out[dir + '/' + n] = text; seen[k] = n; return n; };
    function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 ^ s.charCodeAt(i)) >>> 0; return h.toString(36); }
    ['annual', 'season', 'light', 'full'].forEach(l => { out['OutputLog_' + l + '.dai'] = S.logFilter(commonFiles['OutputLog.dai'], l); });
    const ids = [];
    jobs.forEach(({ run, job }) => {
      let rf = job.files['Run/Runfile.dai'];
      const map = (re, dir, name) => { rf = rf.replace(re, (m, p1) => { const t = job.files['Common/' + p1]; if (t == null) return m; const nm = put(dir, p1, t); return m.replace('../Common/' + p1, '../../' + dir + '/' + nm); }); };
      map(/\.\.\/Common\/(ArableFarmRotation\.dai)/, 'crops'); map(/\.\.\/Common\/(ResFarm\.dai)/, 'soils'); map(/\.\.\/Common\/(UserSoil\.dai)/, 'soils');
      rf = rf.replace(/\.\.\/Common\/(Station\.dwf|UserWeather\.dwf)/, (m, p1) => { const t = job.files['Common/' + p1], nm = put('weather', (job.options.station && p1 === 'Station.dwf' ? job.options.station : 'UserWeather') + '.dwf', t); return '../../weather/' + nm; });
      rf = rf.replace(/\.\.\/Common\/Daily-1965-2000\.dwf/, () => { const nm = put('weather', 'Daily-1965-2000.dwf', commonFiles['Daily-1965-2000.dwf'] || ''); return '../../weather/' + nm; });
      const lg = (job.options && job.options.log) || 'light'; rf = rf.replace('../Common/OutputLog.dai', '../../OutputLog_' + lg + '.dai');
      out['runs/' + run.id + '/Runfile.dai'] = rf; ids.push(run.id);
    });
    out['run_all.sh'] = '#!/bin/sh\n# runs every simulation of this experiment with the Daisy program (daisy must be on the PATH)\nfor d in runs/*/; do (cd "$d" && daisy Runfile.dai); done\n';
    out['run_all.bat'] = '@echo off\r\nrem runs every simulation of this experiment with the Daisy program (daisy.exe must be on the PATH)\r\nfor /d %%d in (runs\\*) do (pushd "%%d" && daisy Runfile.dai && popd)\r\n';
    out['plan.json'] = JSON.stringify(plan || {}, null, 1);
    out['README.txt'] = 'SWAFL experiment folder. ' + ids.length + ' simulations of Daisy 7.1.14.\r\ncrops/  crop and management files   soils/  soil horizons   weather/  daily weather   OutputLog_*.dai  which logs are written (annual, season, light, full)\r\nruns/<id>/Runfile.dai  one simulation each; run_all.sh or run_all.bat runs them all.\r\nThe logs (.dlf) are written next to each Runfile and can be loaded into the SWAFL Daisy workbench (Files) for the figures.\r\n';
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
