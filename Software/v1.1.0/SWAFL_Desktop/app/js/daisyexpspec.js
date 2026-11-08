/* Daisy experiments: what each experiment of the study asks, how it is designed, which figures answer it and which processes of Daisy it touches.
   Every experiment has its own design and its own figures. The figures are described, not drawn, here: daisyexpfig.js draws them from the results.
   A figure is { k: kind, x, c, p, y, r, t, where }:
     lines    response r against the numeric factor x, one line for each level of c (viridis when c is numeric), one panel (a, b, c...) for each level of p
     bars     response r for each level of x, one bar for each level of c
     surface  response r over the factors x and y as a coloured surface with contour lines, one panel for each level of p
     partition  where the water goes (evapotranspiration, drainage, runoff, storage) for each level of x, one panel for each level of p
     nfate      where the nitrogen goes (crop, leaching, denitrification, volatilisation) for each level of x, one panel for each level of p
     effects  response r at the lowest and the highest level of every factor (the main effects side by side)
     paired   response r, one line for each level of c across the levels of x (each soil one line: the paired change)
   where: { factorId: value } keeps only the runs with that value (for example the rainfed runs). */
(function (root) {
  'use strict';
  const E = root.DaisyExp || (typeof require !== 'undefined' ? require('./daisyexp.js') : null), SPEC = {};
  // what a factor changes in the processes of Fig. 1, and what a response measures
  E.PROC_F = { vg_ks: ['water', 'pore', 'no3'], vg_alpha: ['water'], vg_n: ['water'], vg_ts: ['water'], vg_l: ['water'], precip: ['bio'], temp: ['bio', 'temp'], radscale: ['bio'], season: ['bio'], station: ['bio'], bio: ['bio'], irrig: ['bio', 'surf'], mm: ['bio', 'surf'], hours: ['bio', 'surf'], flux: ['bio', 'surf'], method: ['bio', 'surf', 'water'], dripdepth: ['water'], window: ['bio'], limit: ['bio'], trig: ['water'], z: ['water'], soil: ['water', 'pore'], root: ['crop', 'water'], till: ['om', 'water', 'pore'], tc: ['water', 'pore'], nfac: ['no3', 'nh4'], ntype: ['no3', 'nh4'], ntime: ['no3', 'nh4'], koc: ['water'], half: ['water'], vff: ['surf'], cap: ['surf'], ep: ['surf'] };
  E.PROC_R = { yield: ['crop'], irr: ['bio'], aet: ['surf', 'crop'], perc: ['water', 'drain'], leach: ['no3'], den: ['deni'], IE: ['crop', 'bio'], IWUE: ['crop', 'bio'], DPF: ['water', 'drain'], PFPn: ['crop', 'no3'], NLF: ['no3'], wstress: ['photo'], nstress: ['photo'], run: ['surf'], upt: ['crop', 'no3'], vol: ['nh4'], rain: ['bio'], fert: ['no3'], NUE: ['crop', 'no3'], Nsurp: ['no3'], NLoss: ['no3', 'deni', 'nh4'], NLpY: ['no3'], AEn: ['crop', 'no3'], REn: ['crop', 'no3'], PEn: ['crop', 'no3'], WUE: ['crop', 'bio'], WPtot: ['crop', 'bio'], HI: ['crop'], ETr: ['surf', 'crop', 'bio'], Cnc: ['no3', 'drain'], CLF: ['pore', 'water'], CDF: ['om', 'temp'] };
  // the arrows between what changes and what is measured: the chain of causes of the experiment, in the words of the figure
  E.PROC_LINKS = { irrig: ['water'], mm: ['water'], hours: ['water'], flux: ['water'], method: ['water'], trig: ['water'], z: ['water'], window: ['water'], limit: ['water'], dripdepth: ['water'], precip: ['water'], temp: ['crop'], soil: ['water'], tc: ['water'], till: ['water'], root: ['water'], nfac: ['no3'], ntype: ['no3'], ntime: ['no3'] };

  const S = (id, o) => { SPEC[id] = o; };
  S('E0', { aim: 'How does each soil behave with no irrigation? These runs are the baseline against which every other experiment is read.', design: 'One rainfed run for each soil (the soil is the only factor).', study: '10 runs, one per soil', resp: ['yield', 'perc', 'leach'],
    figs: [{ k: 'bars', x: 'soil', r: 'yield' }, { k: 'bars', x: 'soil', r: 'perc' }, { k: 'partition', x: 'soil' }, { k: 'nfate', x: 'soil' }] });
  S('E1', { aim: 'How much water should one irrigation give, and how slowly should it be applied?', design: 'Water per irrigation (mm) crossed with the duration of one irrigation (h): every combination, plus one rainfed reference.', study: '189 valid runs',
    resp: ['yield', 'irr', 'perc', 'IE'], figs: [{ k: 'lines', x: 'mm', c: 'hours', r: 'yield' }, { k: 'lines', x: 'mm', c: 'hours', r: 'irr' }, { k: 'lines', x: 'mm', c: 'hours', r: 'perc' }, { k: 'surface', x: 'mm', y: 'hours', r: 'IE' }, { k: 'partition', x: 'mm' }] });
  S('E2', { aim: 'At which soil suction should irrigation start?', design: 'Trigger suction (cm) crossed with the soil: every combination, plus a rainfed reference for each soil.', study: '197 valid runs',
    resp: ['yield', 'irr', 'perc', 'IE'], figs: [{ k: 'lines', x: 'trig', c: 'soil', r: 'yield' }, { k: 'lines', x: 'trig', c: 'soil', r: 'irr' }, { k: 'lines', x: 'trig', c: 'soil', r: 'perc' }, { k: 'lines', x: 'trig', c: 'soil', r: 'IE' }, { k: 'partition', x: 'trig', p: 'soil' }] });
  S('E3', { aim: 'How deep should the soil moisture sensor be?', design: 'Sensor depth (cm) crossed with the soil: every combination, plus a rainfed reference for each soil.', study: '200 valid runs',
    resp: ['yield', 'irr', 'perc', 'IE'], figs: [{ k: 'lines', x: 'z', c: 'soil', r: 'yield' }, { k: 'lines', x: 'z', c: 'soil', r: 'irr' }, { k: 'lines', x: 'z', c: 'soil', r: 'perc' }, { k: 'lines', x: 'z', c: 'soil', r: 'IE' }, { k: 'partition', x: 'z', p: 'soil' }] });
  S('E4', { aim: 'Overhead, surface or drip irrigation, and how deep the drip line lies.', design: 'Irrigation method (or the depth of the drip line) crossed with the soil, plus a rainfed reference for each soil.', study: '96 valid runs',
    resp: ['yield', 'irr', 'perc', 'IE'], figs: [{ k: 'bars', x: 'method', c: 'soil', r: 'yield' }, { k: 'bars', x: 'method', c: 'soil', r: 'irr' }, { k: 'bars', x: 'method', c: 'soil', r: 'perc' }, { k: 'bars', x: 'method', c: 'soil', r: 'IE' }, { k: 'bars', x: 'dripdepth', c: 'soil', r: 'yield' }, { k: 'bars', x: 'dripdepth', c: 'soil', r: 'perc' }] });
  S('E5', { aim: 'Does the way the tilled topsoil settles change drainage and yield? Tillage system crossed with the consolidation rate of the tilled layer (Daisy WEPP hydraulic model, time_consolidation), irrigated and rainfed.', design: 'Tillage (plough, reduced, none) x consolidation rate (0.001, 0.01, 0.02 per day) x irrigated or rainfed x soil. Irrigation by tensiometer at 20 cm, trigger -300 cm. Weather of the course, rain x0.7, +2 C, 1980 to 1999.', study: '300 valid runs',
    resp: ['perc', 'yield', 'irr', 'aet'], figs: [{ k: 'lines', x: 'tc', c: 'till', p: 'soil', r: 'perc', where: { irrig: '0' }, t: 'Drainage below 1 m, rainfed' }, { k: 'lines', x: 'tc', c: 'till', p: 'soil', r: 'yield', where: { irrig: '1' }, t: 'Yield, irrigated' }, { k: 'bars', x: 'soil', c: 'till', r: 'perc', where: { irrig: '0' }, t: 'Effect of tillage on rainfed drainage' }, { k: 'bars', x: 'soil', c: 'tc', r: 'perc', where: { irrig: '0', till: 'plowing' }, t: 'Effect of the consolidation rate on rainfed drainage (plough)' }, { k: 'bars', x: 'irrig', c: 'till', r: 'yield' }, { k: 'partition', x: 'tc', p: 'soil', where: { irrig: '0' } }] });
  S('E6', { aim: 'How much nitrate leaves the root zone at each nitrogen rate in a Mediterranean climate, and what does the yield gain?', design: 'Nitrogen rate (factor on the rotation, 0.1 to 1.5 of the standard rate) x soil, Bologna weather 1994 to 2004, rotation of spring barley, winter barley, winter rape and winter wheat.', study: '193 valid runs',
    resp: ['yield', 'leach', 'NLF', 'PFPn'], figs: [{ k: 'lines', x: 'nfac', c: 'soil', r: 'yield' }, { k: 'lines', x: 'nfac', c: 'soil', r: 'leach' }, { k: 'lines', x: 'nfac', c: 'soil', r: 'NLF' }, { k: 'lines', x: 'nfac', c: 'soil', r: 'PFPn' }, { k: 'nfate', x: 'nfac', p: 'soil' }, { k: 'surface', x: 'nfac', y: 'soil', r: 'leach' }] });
  S('E7', { aim: 'How much does a mulch layer save in evaporation, and where does the saved water go?', design: 'Mulch vapour-flux factor (1 = bare soil) x mulch storage capacity (mm), 20 cells for each soil.', study: '200 valid runs', resp: ['aet', 'perc', 'irr'],
    figs: [{ k: 'lines', x: 'vff', c: 'cap', p: 'soil', r: 'aet' }, { k: 'lines', x: 'vff', c: 'cap', p: 'soil', r: 'perc' }, { k: 'surface', x: 'vff', y: 'cap', r: 'perc', p: 'soil' }] });
  S('E8', { aim: 'How do rain intensity and the moisture of the soil before the rain decide infiltration and runoff?', design: 'Rain intensity (the same rain spread over 1 to 24 hours, or observed hourly) x initial moisture, one season (1 March to 1 October 1985), coarse loam.', study: '1000 valid runs', resp: ['run', 'perc', 'aet'], figs: [] });
  S('E9', { aim: 'How long does the soil remember the wetness it had before: where does the water of a dry or wet start leave?', design: 'Trigger suction x rain scale x soil (initial suction x rain scale in the study).', study: '987 valid runs', resp: ['perc', 'aet', 'yield', 'irr'],
    figs: [{ k: 'lines', x: 'trig', c: 'precip', p: 'soil', r: 'perc' }, { k: 'surface', x: 'trig', y: 'precip', p: 'soil', r: 'perc' }, { k: 'lines', x: 'precip', c: 'trig', p: 'soil', r: 'yield' }, { k: 'partition', x: 'precip', p: 'soil' }] });
  S('E10', { aim: 'How much water per irrigation, and in which part of the season?', design: 'Water per irrigation (mm) x irrigation window x soil, plus a rainfed reference for each soil.', study: '954 valid runs', resp: ['yield', 'irr', 'perc', 'IE'],
    figs: [{ k: 'lines', x: 'mm', c: 'window', p: 'soil', r: 'yield' }, { k: 'lines', x: 'mm', c: 'window', p: 'soil', r: 'irr' }, { k: 'bars', x: 'window', c: 'mm', r: 'IE' }, { k: 'partition', x: 'window', p: 'soil' }] });
  S('E11', { aim: 'How do a warmer climate and a wetter or drier year change the drainage and the yield?', design: 'Temperature shift x rain scale (a finer 10 x 10 x 10 lattice with the soil-evaporation factor in the study).', study: '1000 valid runs', resp: ['perc', 'DPF', 'aet', 'yield'],
    figs: [{ k: 'surface', x: 'precip', y: 'temp', r: 'perc' }, { k: 'surface', x: 'precip', y: 'temp', r: 'DPF' }, { k: 'lines', x: 'precip', c: 'temp', r: 'perc' }, { k: 'lines', x: 'temp', c: 'precip', r: 'yield' }, { k: 'partition', x: 'precip' }] });
  S('E12', { aim: 'Sensor depth, trigger suction and rain together.', design: 'Sensor depth x trigger suction x rain scale, plus a rainfed reference for each rain scale.', study: '1000 valid runs', resp: ['yield', 'irr', 'perc', 'IE'],
    figs: [{ k: 'surface', x: 'trig', y: 'z', p: 'precip', r: 'irr' }, { k: 'lines', x: 'trig', c: 'z', p: 'precip', r: 'yield' }, { k: 'lines', x: 'trig', c: 'z', p: 'precip', r: 'perc' }, { k: 'bars', x: 'z', c: 'trig', r: 'IE' }] });
  S('E13', { aim: 'Nitrogen rate and water strategy together: what does water saving do to nitrate leaching?', design: 'Nitrogen rate x water limit per season x soil.', study: '975 valid runs', resp: ['yield', 'leach', 'NLF', 'PFPn'],
    figs: [{ k: 'lines', x: 'nfac', c: 'limit', p: 'soil', r: 'yield' }, { k: 'lines', x: 'nfac', c: 'limit', p: 'soil', r: 'leach' }, { k: 'nfate', x: 'nfac', p: 'soil' }, { k: 'surface', x: 'nfac', y: 'limit', p: 'soil', r: 'PFPn' }] });
  S('E14', { aim: 'Mulch cover and capacity under different rain.', design: 'Mulch cover x mulch capacity x rain scale, coarse loam.', study: '1000 valid runs', resp: ['aet', 'perc'], figs: [{ k: 'lines', x: 'vff', c: 'cap', p: 'precip', r: 'perc' }] });
  S('E15', { aim: 'Irrigation method, rooting depth and amount together.', design: 'Method x maximum rooting depth x water per irrigation.', study: '1000 valid runs', resp: ['yield', 'irr', 'perc', 'IE'],
    figs: [{ k: 'lines', x: 'mm', c: 'method', p: 'root', r: 'yield' }, { k: 'lines', x: 'mm', c: 'method', p: 'root', r: 'irr' }, { k: 'bars', x: 'root', c: 'method', r: 'IE' }, { k: 'partition', x: 'method', p: 'root' }] });
  S('E16', { aim: 'The corners of the space: what happens in the most extreme combinations of rain, temperature, trigger and nitrogen?', design: 'Two levels (a low and a high corner) of rain scale, temperature, trigger suction and nitrogen rate: all 16 corners, plus a rainfed reference.', study: '740 valid runs', resp: ['yield', 'perc', 'leach', 'irr'],
    figs: [{ k: 'effects', r: 'yield' }, { k: 'effects', r: 'perc' }, { k: 'effects', r: 'leach' }, { k: 'effects', r: 'irr' }] });
  E.SPEC = SPEC;

  // figures for an experiment that has no entry above (the user's own design): the factors take the roles of the axes
  // the results that each kind of factor moves: the figures of a factor are drawn on these, so that a factor never shows as a flat line
  const CHEM = ['koc', 'half', 'chem'], NFAC = ['nfac', 'ntype', 'ntime']; E.CHEM_F = CHEM;
  E.respFor = function (id) { id = id && id.id || id; const F = E.factor(id) || {}; if (CHEM.indexOf(id) >= 0) return ['CLF', 'CDF']; if (NFAC.indexOf(id) >= 0) return ['yield', 'leach', 'NLF']; if (F.irr || id === 'irrig') return ['yield', 'irr', 'perc', 'IE']; if (id === 'soil' || id === 'till' || id === 'tc' || /^vg_/.test(id)) return ['yield', 'perc', 'leach']; return ['yield', 'perc', 'aet']; };
  const idsOf = factors => (factors || []).map(f => typeof f === 'string' ? f : f.id).filter(id => E.factor(id));
  // the figures of one factor: every response it moves, the factor along the axis, another factor as colour and a third as panels
  function figsOne(id, all, nR) {
    const f = E.factor(id), n = all.length, i = all.indexOf(id), c = n > 1 ? all[(i + 1) % n] : undefined, p = n > 2 ? all[(i + 2) % n] : undefined, out = [];
    E.respFor(id).slice(0, nR || 3).forEach(r => out.push({ k: f.kind === 'num' ? 'lines' : 'bars', x: id, c, p, r }));
    return out;
  }
  E.autoFigs = function (factors, resp) {
    const ids = idsOf(factors), fs = ids.map(E.factor), out = [], n = ids.length, nR = n > 5 ? 1 : n > 3 ? 2 : 3, chem = ids.filter(id => CHEM.indexOf(id) >= 0), other = ids.filter(id => CHEM.indexOf(id) < 0), num = fs.filter(f => f.kind === 'num');
    ids.forEach(id => figsOne(id, ids, nR).forEach(g => out.push(g)));
    if (num.length >= 2) out.push({ k: 'surface', x: num[0].id, y: num[1].id, p: ids.find(id => id !== num[0].id && id !== num[1].id), r: E.respFor(num[0].id)[0] });
    if (other.length) out.push({ k: 'partition', x: other[0], p: other[1] });
    if (ids.some(id => NFAC.indexOf(id) >= 0)) out.push({ k: 'nfate', x: ids.find(id => NFAC.indexOf(id) >= 0), p: ids.find(id => NFAC.indexOf(id) < 0) });
    if (chem.length) out.push({ k: 'cfate', x: chem[0], p: ids.find(id => id !== chem[0]), c: undefined });
    if (n >= 3) { out.push({ k: 'effects', r: 'yield' }); if (chem.length) out.push({ k: 'effects', r: 'CLF' }); }
    return out;
  };
  // every factor of the experiment is on the axis, in the colours or in the panels of some figure; the chemical has its own results
  E.cover = function (figs, factors) {
    const ids = idsOf(factors), seen = new Set(); figs.forEach(g => [g.x, g.y, g.c, g.p].forEach(v => v && seen.add(v)));
    const out = figs.slice(); ids.filter(id => !seen.has(id)).forEach(id => figsOne(id, ids, 2).forEach(g => out.push(g)));
    if (ids.some(id => CHEM.indexOf(id) >= 0) && !out.some(g => g.k === 'cfate' || g.r === 'CLF' || g.r === 'CDF')) { const ch = ids.find(id => CHEM.indexOf(id) >= 0); out.push({ k: 'cfate', x: ch, p: ids.find(id => id !== ch) }); figsOne(ch, ids, 2).forEach(g => out.push(g)); }
    return out;
  };
  // the figures of an experiment: the entry of the study, or the automatic ones, and whatever factor they leave out
  E.figsFor = function (presetId, factors) { const s = presetId && SPEC[presetId]; const f = s && s.figs && s.figs.length ? s.figs : E.autoFigs(factors); return E.cover(f, factors).map((x, i) => Object.assign({ id: 'f' + (i + 1) }, x)); };
  // marks for the process map: which processes the experiment changes (orange) and which it measures (blue)
  E.procMarks = function (factors, figs, resp) {
    const F = {}, R = {}, fl = []; (factors || []).forEach(f => { const id = typeof f === 'string' ? f : f.id, ps = E.PROC_F[id] || (E.factor(id) && E.factor(id).param ? ['water'] : []); if (ps.length) fl.push({ id, ps }); ps.forEach(p => { (F[p] = F[p] || []).push(id); }); });
    const rs = new Set((resp || []).concat((figs || []).map(f => f.r).filter(Boolean))); const rl = []; rs.forEach(r => { (E.PROC_R[r] || []).forEach(p => { (R[p] = R[p] || []).push(r); }); rl.push(r); });
    return { F, R, factors: fl, resp: rl };
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
