/* Daisy scenarios: what the user wants to find out, the options that matter for it, and the Daisy set-up that is written for each variant.
   The base is the arable rotation of the Daisy course (spring and winter barley, winter rape, winter wheat on the ResFarm soil with free drainage,
   daily weather 1965-2000). Pure functions, so the same code builds the job in the browser and in the node tool that made the bundled example runs. */
(function (root) {
  'use strict';
  const S = {};
  const SOILS = [['loam', 'Loam (ResFarm loam)'], ['sand', 'Sand (ResFarm sand)']];
  S.OPTIONS = {
    soil: { label: 'Soil', type: 'select', opts: SOILS },
    start: { label: 'First year', type: 'number', min: 1965, max: 1995, step: 1 },
    stop: { label: 'Last year', type: 'number', min: 1970, max: 2000, step: 1 },
    precip: { label: 'Rain, factor on the weather file', type: 'number', min: 0.4, max: 1.6, step: 0.05 },
    temp: { label: 'Temperature offset (C)', type: 'number', min: -4, max: 8, step: 0.5 },
    nfac: { label: 'Nitrogen fertiliser, factor on the rotation', type: 'number', min: 0, max: 2, step: 0.05 },
    irrig: { label: 'Irrigation', type: 'select', opts: [['0', 'none (rainfed)'], ['1', 'tensiometer-triggered overhead']] },
    trig: { label: 'Irrigate when the potential at 20 cm drops below (cm)', type: 'number', min: -1000, max: -100, step: 25 },
    mm: { label: 'Water per irrigation (mm)', type: 'number', min: 5, max: 60, step: 5 },
    koc: { label: 'Sorption of the chemical, K_OC (L/kg)', type: 'number', min: 0, max: 5000, step: 10 },
    half: { label: 'Half-life of the chemical in soil (days, 0 = none)', type: 'number', min: 0, max: 2000, step: 5 }
  };
  S.DEFAULTS = { soil: 'loam', start: 1980, stop: 2000, precip: 1, temp: 0, nfac: 1, irrig: '0', trig: -300, mm: 30, koc: 0, half: 0 };

  S.LIST = [
    { id: 'irrigation', theme: 'Water', title: 'Irrigation: does it pay off, and what does it cost the soil?',
      question: 'How much water must be added, how much yield does it bring, and how much of it drains away?',
      opts: ['soil', 'trig', 'mm', 'precip', 'temp', 'start', 'stop'],
      variants: [{ id: 'rainfed', label: 'Rainfed', set: { irrig: '0' } }, { id: 'irrigated', label: 'Irrigated', set: { irrig: '1' } }],
      figs: ['yield', 'water', 'theta', 'pf', 'crop', 'cmpYield', 'cmpWater'] },
    { id: 'nitrogen', theme: 'Nitrogen', title: 'Nitrogen: how much fertiliser, how much leaching?',
      question: 'Where does the nitrogen go (crop, leaching, denitrification, soil) when the fertiliser rate changes, and what yield does each rate give?',
      opts: ['soil', 'irrig', 'precip', 'temp', 'start', 'stop'],
      variants: [{ id: 'n50', label: 'Half the fertiliser', set: { nfac: 0.5 } }, { id: 'n100', label: 'Standard fertiliser', set: { nfac: 1 } }, { id: 'n130', label: '30 % more fertiliser', set: { nfac: 1.3 } }],
      figs: ['yield', 'nbudget', 'no3', 'water', 'cmpYield', 'cmpN', 'nresp'] },
    { id: 'climate', theme: 'Crop and climate', title: 'Climate: warmer, drier or wetter',
      question: 'How do yield, evapotranspiration and drainage respond to a changed climate?',
      opts: ['soil', 'irrig', 'start', 'stop'],
      variants: [{ id: 'now', label: 'Weather file as it is', set: { precip: 1, temp: 0 } }, { id: 'warm', label: 'Warmer by 2 C', set: { precip: 1, temp: 2 } }, { id: 'dry', label: 'Drier (rain x 0.7)', set: { precip: 0.7, temp: 0 } }, { id: 'warmdry', label: 'Warmer and drier', set: { precip: 0.7, temp: 2 } }, { id: 'wet', label: 'Wetter (rain x 1.3)', set: { precip: 1.3, temp: 0 } }],
      figs: ['yield', 'water', 'crop', 'theta', 'cmpYield', 'cmpWater', 'cmpN'] },
    { id: 'chemical', theme: 'Chemicals', title: 'A pesticide or tracer: sorption and degradation',
      question: 'Does the chemical leave the root zone, how much stays in the soil, and how much does sorption and degradation change that?',
      opts: ['soil', 'precip', 'temp', 'start', 'stop'],
      variants: [{ id: 'mobile', label: 'Mobile tracer (no sorption, no decay)', set: { koc: 0, half: 0 } }, { id: 'sorb', label: 'Sorbing (K_OC 100)', set: { koc: 100, half: 0 } }, { id: 'decay', label: 'Sorbing and degrading (K_OC 100, half-life 30 d)', set: { koc: 100, half: 30 } }],
      figs: ['tracer', 'tracerProf', 'water', 'cmpTracer'] },
    { id: 'soil', theme: 'Soil', title: 'Soil: how much does texture matter?',
      question: 'The same crops and weather on sand and on loam: water holding, drainage, yield and nitrate.',
      opts: ['irrig', 'trig', 'mm', 'nfac', 'precip', 'temp', 'start', 'stop'],
      variants: [{ id: 'sand', label: 'Sand', set: { soil: 'sand' } }, { id: 'loam', label: 'Loam', set: { soil: 'loam' } }],
      figs: ['yield', 'water', 'theta', 'pf', 'no3', 'cmpYield', 'cmpWater', 'cmpN'] }
  ];

  // the lines of the Daisy set-up
  S.defaultsFor = sc => Object.assign({}, S.DEFAULTS, (sc && sc.defaults) || {});
  S.num = (v, d) => { const x = parseFloat(v); return isFinite(x) ? x : d; };
  S.norm = function (o) { const r = Object.assign({}, S.DEFAULTS, o || {}); r.start = Math.round(S.num(r.start, 1980)); r.stop = Math.round(S.num(r.stop, 2000)); if (r.stop < r.start + 2) r.stop = r.start + 2; if (r.stop > 2000) r.stop = 2000; if (r.start < 1965) r.start = 1965; r.irrig = String(r.irrig === true ? '1' : r.irrig === false ? '0' : r.irrig); return r; };
  // files: { 'ArableFarmRotation.dai', 'ArableFarmRotation_withirrigation.dai', 'ResFarm.dai', 'OutputLog.dai' } texts of the bundled common folder
  S.buildJob = function (scId, options, variantId, files) {
    const sc = S.LIST.find(x => x.id === scId) || {}, vr = ((sc.variants || []).find(v => v.id === variantId) || { set: {} }), o = S.norm(Object.assign({}, options, vr.set)), pre = (variantId || 'run') + '-';
    let rot = o.irrig === '1' ? files['ArableFarmRotation_withirrigation.dai'] : files['ArableFarmRotation.dai'];
    if (rot == null) throw new Error('the rotation file is missing');
    if (o.nfac !== 1) rot = rot.replace(/\(weight\s+(\d+(?:\.\d+)?)\s*\[kg N\/ha\]\)/g, (m, w) => '(weight ' + (+(parseFloat(w) * o.nfac).toFixed(1)) + ' [kg N/ha])');
    rot = rot.replace(/K_OC\s+[\d.]+\s*\[L\/kg\]/, 'K_OC ' + S.num(o.koc, 0) + ' [L/kg]').replace(/decompose_rate\s+[\d.eE+-]+\s*\[h\^-1\]/, 'decompose_rate ' + (S.num(o.half, 0) > 0 ? (Math.LN2 / (24 * S.num(o.half, 0))).toExponential(5) : '0') + ' [h^-1]');
    if (o.irrig === '1') { const hrs = Math.max(1, Math.round(S.num(o.mm, 30) / 10)); rot = rot.replace(/\(potential\s+-?\d+\s*\[cm\]\)/, '(potential ' + Math.round(S.num(o.trig, -300)) + ' [cm])').replace(/\(irrigate_overhead[^\n]*\)/, '(irrigate_overhead 10 [mm/h] (hours ' + hrs + '))').replace(/\(wait_days\s+1\)/, '(wait_days 2)'); }
    const soilTxt = files["ResFarm.dai"], col = o.soil === "sand" ? "ResFarm_sand column" : "ResFarm 1D; Free drainage";
    const run = ';; SWAFL scenario "' + (sc.title || scId) + '", variant "' + (vr.label || variantId) + '"\n(input file "../Common/ArableFarmRotation.dai")\n(input file "../Common/ResFarm.dai")\n(input file "../Common/OutputLog.dai")\n\n' +
      '(defunit [kWh/d/m^2] SIfactor (mass 1)(time -3)(factor 41.67))\n(weather default "../Common/Daily-1965-2000.dwf"\n  (PrecipCorrect ' + S.num(o.precip, 1) + ')\n  (TempOffset ' + S.num(o.temp, 0) + '))\n' +
      '(description "' + (sc.title || scId).replace(/"/g, "'") + ' - ' + (vr.label || variantId).replace(/"/g, "'") + '")\n(log_prefix "' + pre + '")\n\n(manager activity\n  (repeat "A_F_R"))\n\n' +
      '(defcolumn "SWAFL column" "' + col + '"\n  (Bioclimate FAO56_daily))\n(column "SWAFL column")\n\n(time ' + o.start + ' 01 01)\n(stop ' + o.stop + ' 04 1)\n(activate_output (after ' + (o.start + 1) + ' 03 31 23))\n';
    return { scenario: scId, variant: variantId, label: vr.label || variantId, options: o, prefix: pre, main: 'Run/Runfile.dai', files: { 'Common/ArableFarmRotation.dai': rot, 'Common/ResFarm.dai': soilTxt, 'Run/Runfile.dai': run }, years: o.stop - o.start };
  };
  S.COMMON = ['ArableFarmRotation.dai', 'ArableFarmRotation_withirrigation.dai', 'ResFarm.dai', 'OutputLog.dai'];
  // the logs the figures use, and how to name them whatever the prefix
  S.logKey = n => { const m = String(n).match(/(Annual-Harvest|Annual-FWater_100cm|Annual-FWater|Annual-SWater|Annual-FN_100cm|Annual-FN|Annual-Tracer|Daily-CropProduction|Daily-FWater|Daily-SWater|Daily-FN|Daily-Theta|Daily-pF|Daily-h|Daily-SNO3|Daily-Tracer_conc|Daily-Tracer|Daily-WaterFlux|Daily-SoilWater|Soil-Tracer)\.dlf/i); return m ? m[1] : null; };
  if (typeof module !== 'undefined' && module.exports) module.exports = S; else root.DaisyScen = S;
})(typeof window !== 'undefined' ? window : globalThis);
