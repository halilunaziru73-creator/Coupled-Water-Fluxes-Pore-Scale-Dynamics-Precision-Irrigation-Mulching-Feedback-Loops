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
  E.PROC_F = { precip: ['bio'], temp: ['bio', 'temp'], radscale: ['bio'], season: ['bio'], station: ['bio'], bio: ['bio'], irrig: ['bio', 'surf'], mm: ['bio', 'surf'], hours: ['bio', 'surf'], flux: ['bio', 'surf'], method: ['bio', 'surf', 'water'], dripdepth: ['water'], window: ['bio'], limit: ['bio'], trig: ['water'], z: ['water'], soil: ['water', 'pore'], root: ['crop', 'water'], till: ['om', 'water', 'pore'], tc: ['water', 'pore'], nfac: ['no3', 'nh4'], ntype: ['no3', 'nh4'], ntime: ['no3', 'nh4'], koc: ['water'], half: ['water'], vff: ['surf'], cap: ['surf'], ep: ['surf'] };
  E.PROC_R = { yield: ['crop'], irr: ['bio'], aet: ['surf', 'crop'], perc: ['water', 'drain'], leach: ['no3'], den: ['deni'], IE: ['crop', 'bio'], IWUE: ['crop', 'bio'], DPF: ['water', 'drain'], PFPn: ['crop', 'no3'], NLF: ['no3'], wstress: ['photo'], nstress: ['photo'], run: ['surf'], upt: ['crop', 'no3'], vol: ['nh4'], rain: ['bio'], fert: ['no3'] };
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
  E.autoFigs = function (factors, resp) {
    const fs = (factors || []).map(f => typeof f === 'string' ? E.factor(f) : E.factor(f.id)).filter(Boolean), num = fs.filter(f => f.kind === 'num'), cat = fs.filter(f => f.kind !== 'num'), has = id => fs.some(f => f.id === id), out = [];
    const rs = has('nfac') ? ['yield', 'leach', 'NLF'] : fs.some(f => f.irr || f.id === 'irrig') ? ['yield', 'irr', 'perc', 'IE'] : ['yield', 'perc', 'aet'];
    const xf = num.slice().sort((a, b) => b.levels.length - a.levels.length)[0], rest = fs.filter(f => f !== xf);
    if (xf) rs.forEach(r => out.push({ k: 'lines', x: xf.id, c: rest[0] && rest[0].id, p: rest[1] && rest[1].id, r }));
    else if (cat[0]) rs.forEach(r => out.push({ k: 'bars', x: cat[0].id, c: cat[1] && cat[1].id, r }));
    if (num.length >= 2) out.push({ k: 'surface', x: num[0].id, y: num[1].id, p: fs.filter(f => f !== num[0] && f !== num[1])[0] && fs.filter(f => f !== num[0] && f !== num[1])[0].id, r: rs[1] || rs[0] });
    if (fs.length) out.push({ k: 'partition', x: (xf || fs[0]).id, p: rest[0] && rest[0].id });
    if (has('nfac')) out.push({ k: 'nfate', x: 'nfac', p: rest.find(f => f.id !== 'nfac') && rest.find(f => f.id !== 'nfac').id });
    if (fs.length >= 3) out.push({ k: 'effects', r: rs[0] });
    return out;
  };
  // the figures of an experiment: the entry of the study, or the automatic ones
  E.figsFor = function (presetId, factors) { const s = presetId && SPEC[presetId]; const f = s && s.figs && s.figs.length ? s.figs : E.autoFigs(factors); return f.map((x, i) => Object.assign({ id: 'f' + (i + 1) }, x)); };
  // marks for the process map: which processes the experiment changes (orange) and which it measures (blue)
  E.procMarks = function (factors, figs, resp) {
    const F = {}, R = {}, fl = []; (factors || []).forEach(f => { const id = typeof f === 'string' ? f : f.id, ps = E.PROC_F[id] || (E.factor(id) && E.factor(id).param ? ['water'] : []); if (ps.length) fl.push({ id, ps }); ps.forEach(p => { (F[p] = F[p] || []).push(id); }); });
    const rs = new Set((resp || []).concat((figs || []).map(f => f.r).filter(Boolean))); const rl = []; rs.forEach(r => { (E.PROC_R[r] || []).forEach(p => { (R[p] = R[p] || []).push(r); }); rl.push(r); });
    return { F, R, factors: fl, resp: rl };
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = E;
})(typeof window !== 'undefined' ? window : globalThis);
