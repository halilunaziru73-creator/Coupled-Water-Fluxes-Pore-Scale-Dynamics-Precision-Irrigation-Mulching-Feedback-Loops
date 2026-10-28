/* Daisy scenarios: what the user wants to find out, the options that matter for it, and the Daisy set-up that is written for each variant.
   The base is the arable rotation of the Daisy course (spring and winter barley, winter rape, winter wheat on the ResFarm soil with free drainage,
   daily weather 1965-2000). Pure functions, so the same code builds the job in the browser and in the node tool that made the bundled example runs. */
(function (root) {
  'use strict';
  const S = {};
  const USDA = { sand: ['Sand', 92, 5, 3, 1.55], loamysand: ['Loamy sand', 82, 12, 6, 1.5], sandyloam: ['Sandy loam', 65, 25, 10, 1.45], loam: ['Loam', 40, 40, 20, 1.4], siltloam: ['Silt loam', 20, 65, 15, 1.35], sandyclayloam: ['Sandy clay loam', 60, 13, 27, 1.45], clayloam: ['Clay loam', 33, 34, 33, 1.35], siltyclayloam: ['Silty clay loam', 10, 56, 34, 1.3] };
  S.USDA = USDA;   // class representative sand, silt and clay (%) of the USDA texture classes
  const SOILS = [['loam', 'Loam (built-in profile)'], ['sand', 'Sand (built-in profile)']].concat(Object.keys(USDA).map(k => ['usda:' + k, USDA[k][0] + ' (USDA class, HYPRES)']));
  S.STATIONS = [{ id: 'course', label: 'Taastrup, Denmark (built-in, 1965-2000)', first: 1965, last: 2000 }, { id: 'dk-taastrup', noWind: true, label: 'Taastrup, Denmark (Daisy sample, 1963-2007)', first: 1963, last: 2007 }, { id: 'dk-foulum', noWind: true, label: 'Foulum, Denmark (1990-2003)', first: 1990, last: 2003 }, { id: 'dk-jyndevad', label: 'Jyndevad, Denmark (1997-2004)', first: 1997, last: 2004 }, { id: 'it-bologna', noWind: true, label: 'Bologna, Italy (1994-2004)', first: 1994, last: 2004 }, { id: 'cz-valecov', label: 'Valecov, Czechia (1991-2004)', first: 1991, last: 2004 }, { id: 'pl-jadwisin', label: 'Jadwisin, Poland (1992-2005)', first: 1992, last: 2005 }, { id: 'sk-bratislava', label: 'Bratislava, Slovakia (1990-2005)', first: 1990, last: 2005 }];
  S.station = id => S.STATIONS.find(x => x.id === id) || S.STATIONS[0];
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
    station: { label: 'Weather of', type: 'select', opts: [] },
    method: { label: 'Irrigation method', type: 'select', opts: [['overhead', 'overhead sprinkler'], ['surface', 'surface (flood or furrow)'], ['drip', 'drip, below the surface']] },
    z: { label: 'Sensor depth (cm)', type: 'number', min: 5, max: 100, step: 5 },
    hours: { label: 'Duration of one irrigation (hours)', type: 'number', min: 1, max: 48, step: 1 },
    dfrom: { label: 'Drip from depth (cm)', type: 'number', min: 2, max: 60, step: 1 },
    dto: { label: 'Drip to depth (cm)', type: 'number', min: 4, max: 80, step: 1 },
    limit: { label: 'Water limit per crop season (mm, 0 = none)', type: 'number', min: 0, max: 1000, step: 25 },
    w1: { label: 'Irrigation window opens (month-day)', type: 'text' },
    w2: { label: 'Irrigation window closes (month-day)', type: 'text' },
    root: { label: 'Maximum rooting depth (cm, 0 = soil default)', type: 'number', min: 0, max: 200, step: 5 },
    koc: { label: 'Sorption of the chemical, K_OC (L/kg)', type: 'number', min: 0, max: 5000, step: 10 },
    half: { label: 'Half-life of the chemical in soil (days, 0 = none)', type: 'number', min: 0, max: 2000, step: 5 },
    flux: { label: 'Application rate of irrigation (mm/h, 0 = from dose and duration)', type: 'number', min: 0, max: 20, step: 0.05 },
    waitd: { label: 'Days between irrigations', type: 'number', min: 1, max: 7, step: 1 },
    spin: { label: 'Warm-up years before the results are counted', type: 'number', min: 1, max: 15, step: 1 },
    till: { label: 'Tillage before sowing', type: 'select', opts: [['plowing', 'plowing'], ['rotavation', 'rotavation (mix to 15 cm)'], ['disk_harrowing', 'disk harrowing (mix to 10 cm)'], ['stubble_cultivation', 'stubble cultivation (mix to 8 cm)'], ['none', 'no tillage']] },
    ntype: { label: 'Fertiliser', type: 'select', opts: [['N25S', 'N25S (default)'], ['AmmoniumNitrate', 'ammonium nitrate'], ['CalciumNitrate', 'calcium nitrate'], ['Nitrate', 'nitrate'], ['Ammonia', 'ammonia']] },
    ntime: { label: 'Fertiliser dates moved by (days)', type: 'number', min: -21, max: 28, step: 7 },
    bio: { label: 'Evapotranspiration model (Bioclimate)', type: 'select', opts: [['auto', 'FAO56 reference evapotranspiration'], ['default', 'Daisy default (energy balance; needs wind and vapour pressure)']] },
    radscale: { label: 'Global radiation, scale', type: 'number', min: 0.5, max: 1.5, step: 0.05 },
    pmonths: { label: 'Rain scale per month (12 numbers, Jan to Dec; blank = none)', type: 'text' }
  };
  S.OPTIONS.station.opts = S.STATIONS.map(x => [x.id, x.label]);
  S.DEFAULTS = { soil: 'loam', station: 'course', start: 1980, stop: 2000, precip: 1, temp: 0, nfac: 1, irrig: '0', method: 'overhead', trig: -300, z: 20, mm: 30, hours: 3, dfrom: 10, dto: 20, limit: 0, w1: '04-01', w2: '10-01', root: 0, koc: 0, half: 0, flux: 0, patch: '', waitd: 2, spin: 1, till: 'plowing', ntype: 'N25S', ntime: 0, bio: 'auto', radscale: 1, pmonths: '' };

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
  S.norm = function (o) { const r = Object.assign({}, S.DEFAULTS, o || {}), st0 = S.station(r.station), lo = r.userWx ? r.userWx.first + 1 : st0.first + 1, hi = r.userWx ? r.userWx.last : st0.last; r.start = Math.round(S.num(r.start, 1980)); r.stop = Math.round(S.num(r.stop, 2000)); if (r.start < lo) r.start = lo; if (r.stop > hi) r.stop = hi; if (r.stop < r.start + 2) r.start = Math.max(lo, r.stop - 2); if (r.stop < r.start + 2) r.stop = r.start + 2; if (r.stop < r.start + 1) r.start = Math.max(lo, r.stop - 2); r.irrig = String(r.irrig === true ? '1' : r.irrig === false ? '0' : r.irrig); return r; };
  // files: { 'ArableFarmRotation.dai', 'ArableFarmRotation_withirrigation.dai', 'ResFarm.dai', 'OutputLog.dai' } texts of the bundled common folder
  S.buildJob = function (scId, options, variantId, files) {
    const sc = S.LIST.find(x => x.id === scId) || {}, vr = (((options && options._variants) || sc.variants || []).find(v => v.id === variantId) || { set: {} }), o = S.norm(Object.assign({}, options, vr.set)), pre = (variantId || 'run') + '-';
    let rot = o.irrig === '1' ? files['ArableFarmRotation_withirrigation.dai'] : files['ArableFarmRotation.dai'];
    if (rot == null) throw new Error('the rotation file is missing');
    if (o.nfac !== 1) rot = rot.replace(/\(weight\s+(\d+(?:\.\d+)?)\s*\[kg N\/ha\]\)/g, (m, w) => '(weight ' + (+(parseFloat(w) * o.nfac).toFixed(1)) + ' [kg N/ha])');
    if (o.till && o.till !== 'plowing') rot = rot.replace(/\(plowing\)/g, o.till === 'none' ? '' : '(' + o.till + ')');
    if (o.ntype && o.ntype !== 'N25S') rot = rot.replace(/\(N25S\s+/g, '(' + o.ntype + ' ');
    if (S.num(o.ntime, 0)) { const dn = Math.round(S.num(o.ntime, 0)); rot = rot.replace(/\(wait_mm_dd\s+(\d{1,2})\s+(\d{1,2})\)\s*\(fertilize/g, (m, a, b) => { const d = new Date(Date.UTC(2001, +a - 1, +b) + dn * 864e5); return '(wait_mm_dd ' + (d.getUTCMonth() + 1) + ' ' + d.getUTCDate() + ')(fertilize'; }); }
    rot = rot.replace(/K_OC\s+[\d.]+\s*\[L\/kg\]/, 'K_OC ' + S.num(o.koc, 0) + ' [L/kg]').replace(/decompose_rate\s+[\d.eE+-]+\s*\[h\^-1\]/, 'decompose_rate ' + (S.num(o.half, 0) > 0 ? (Math.LN2 / (24 * S.num(o.half, 0))).toExponential(5) : '0') + ' [h^-1]');
    if (o.irrig === '1') {
      const mm = Math.max(1, S.num(o.mm, 30)); let hrs = Math.max(1, Math.round(S.num(o.hours, 3))); if (S.num(o.flux, 0) > 0) hrs = Math.max(1, Math.round(mm / S.num(o.flux, 0))); if (mm / hrs > 20) hrs = Math.ceil(mm / 20);   // Daisy solves the water flow better with a moderate rate
      const rate = +(mm / hrs).toFixed(3), z = Math.max(1, Math.round(S.num(o.z, 20))), md = v => { const m = String(v || '').match(/^(\d{1,2})[-\/.](\d{1,2})$/); return m ? [+m[1], +m[2]] : null; }, a1 = md(o.w1) || [4, 1], a2 = md(o.w2) || [10, 1];
      const how = o.method === 'surface' ? '(irrigate_surface ' + rate + ' [mm/h] (hours ' + hrs + '))' : o.method === 'drip' ? '(irrigate_subsoil ' + rate + ' [mm/h] (hours ' + hrs + ') (from -' + Math.min(S.num(o.dfrom, 10), S.num(o.dto, 20)) + ' [cm]) (to -' + Math.max(S.num(o.dfrom, 10) + 1, S.num(o.dto, 20)) + ' [cm]))' : '(irrigate_overhead ' + rate + ' [mm/h] (hours ' + hrs + '))';
      const act = '(defaction irrigate_30_tensiometer_overhead activity\n  ;; SWAFL: tensiometer-triggered irrigation, ' + o.method + ', ' + mm + ' mm per event\n  (wait (and (after_mm_dd ' + a1[0] + ' ' + a1[1] + ')\n             (before_mm_dd ' + a2[0] + ' ' + a2[1] + ')\n             (not (soil_water_pressure_above (height -' + z + ' [cm]) (potential ' + Math.round(S.num(o.trig, -300)) + ' [cm])))))\n  ' + how + '\n  (wait_days ' + Math.max(1, Math.round(S.num(o.waitd, 2))) + '))';
      const re = /\(defaction irrigate_30_tensiometer_overhead activity[\s\S]*?\(wait_days\s+\d+\)\s*\)/; if (!re.test(rot)) throw new Error('the irrigation action was not found in the rotation file'); rot = rot.replace(re, () => act);
      const lim = S.num(o.limit, 0); if (lim > 0) { const k = Math.max(1, Math.round(lim / mm)); rot = rot.replace(/\(repeat irrigate_30_tensiometer_overhead\)/g, '(activity' + ' irrigate_30_tensiometer_overhead'.repeat(k) + ')'); }
    }
    let soilTxt = files["ResFarm.dai"]; if (String(o.soil).indexOf('usda:') === 0) o.userSoil = S.usdaSoil(String(o.soil).slice(5)); const useSoil = (o.soil === 'user' || String(o.soil).indexOf('usda:') === 0) && o.userSoil; if (S.num(o.root, 0) > 0) soilTxt = soilTxt.replace(/\(MaxRootingDepth\s+\d+(?:\.\d+)?\s*\[cm\]\)/g, '(MaxRootingDepth ' + Math.round(S.num(o.root, 0)) + ' [cm])'); const stn = (!o.userWx && o.station && o.station !== 'course') ? o.station : null; const col = useSoil ? 'SWAFL user column' : o.soil === "sand" ? "ResFarm_sand column" : "ResFarm 1D; Free drainage", wxFile = o.userWx ? '../Common/UserWeather.dwf' : stn ? '../Common/Station.dwf' : '../Common/Daily-1965-2000.dwf';
    const pp = S.patchParts(o), bioIn = pp.bio, patchRest = pp.rest;
    const run = ';; SWAFL scenario "' + (sc.title || scId) + '", variant "' + (vr.label || variantId) + '"\n(input file "../Common/ArableFarmRotation.dai")\n(input file "../Common/ResFarm.dai")\n(input file "../Common/OutputLog.dai")\n' + (useSoil ? '(input file "../Common/UserSoil.dai")\n' : '') + '\n' +
      '(defunit [kWh/d/m^2] SIfactor (mass 1)(time -3)(factor 41.67))\n(weather default "' + wxFile + '"\n  (PrecipCorrect ' + S.num(o.precip, 1) + ')\n  (TempOffset ' + S.num(o.temp, 0) + ')' + (S.num(o.radscale, 1) !== 1 ? '\n  (GlobRadScale ' + S.num(o.radscale, 1) + ')' : '') + (/^\s*(-?[\d.]+[\s,]+){11}-?[\d.]+\s*$/.test(String(o.pmonths || '')) ? '\n  (PrecipScale ' + String(o.pmonths).trim().split(/[\s,]+/).join(' ') + ')' : '') + ')\n' +
      '(description "' + (sc.title || scId).replace(/"/g, "'") + ' - ' + (vr.label || variantId).replace(/"/g, "'") + '")\n(log_prefix "' + pre + '")\n\n(manager activity\n  (repeat "A_F_R"))\n\n' +
      '(defcolumn "SWAFL column" "' + col + '"\n  (Bioclimate ' + ((stn && S.station(stn).noWind) || o.bio === 'default' ? 'default' : 'FAO56_daily') + bioIn + ')' + (patchRest ? '\n  ;; parameters from the Daisy reference\n  ' + patchRest.split(/\n/).join('\n  ') : '') + ')\n(column "SWAFL column")\n\n(time ' + o.start + ' 01 01)\n(stop ' + o.stop + ' 04 1)\n(activate_output (after ' + (Math.min(o.stop - 1, o.start + Math.max(1, Math.round(S.num(o.spin, 1))))) + ' 03 31 23))\n';
    return { scenario: scId, variant: variantId, label: vr.label || variantId, options: o, prefix: pre, main: 'Run/Runfile.dai', files: Object.assign({ 'Common/ArableFarmRotation.dai': rot, 'Common/ResFarm.dai': soilTxt, 'Run/Runfile.dai': run }, o.log && S.logFilter ? { 'Common/OutputLog.dai': S.logFilter(files['OutputLog.dai'], o.log) } : {}, o.userWx ? { 'Common/UserWeather.dwf': o.userWx.text } : {}, stn ? { 'Common/Station.dwf': (function () { const t = files['weather/' + stn + '.dwf']; if (t == null) throw new Error('the weather file of ' + stn + ' was not loaded'); return t; })() } : {}, useSoil ? { 'Common/UserSoil.dai': S.soilDai(o.userSoil, S.num(o.root, 0)).text } : {}), years: o.stop - o.start };
  };

  // ------------------------------------------------------------------ the user's own data, converted for Daisy
  const DAY = 86400000, utc = (y, m, d) => Date.UTC(y, m - 1, d), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
  const doy = t => { const d = new Date(t); return Math.round((t - Date.UTC(d.getUTCFullYear(), 0, 1)) / DAY) + 1; };
  // FAO-56 extraterrestrial radiation (MJ/m2/d) for latitude (deg) and day of year
  S.Ra = (lat, j) => { const p = lat * Math.PI / 180, dr = 1 + 0.033 * Math.cos(2 * Math.PI * j / 365), de = 0.409 * Math.sin(2 * Math.PI * j / 365 - 1.39), ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(p) * Math.tan(de)))); return 24 * 60 / Math.PI * 0.0820 * dr * (ws * Math.sin(p) * Math.sin(de) + Math.cos(p) * Math.cos(de) * Math.sin(ws)); };
  const es = T => 6.108 * Math.exp(17.27 * T / (T + 237.3));   // hPa
  function parseDate(s) {
    s = String(s == null ? '' : s).trim().replace(/"/g, ''); if (!s) return NaN; let m;
    if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) return utc(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{4})(\d{2})(\d{2})$/))) return utc(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/))) { const a = +m[1], b = +m[2]; return a > 12 ? utc(+m[3], b, a) : b > 12 ? utc(+m[3], a, b) : utc(+m[3], b, a); } // day first when ambiguous
    return NaN;
  }
  // t: a table from DaisyIO.readCsv ({cols, raw}). Finds the columns by their names and returns daily rows in the units Daisy wants.
  S.rowsFromTable = function (t, opt) {
    opt = opt || {}; const cols = t.cols.map(c => String(c).trim()), idx = re => cols.findIndex(c => re.test(c)), notes = [], use = {};
    const iDate = idx(/^(date|datum|time|datetime|day|timestamp)$/i), iY = idx(/^(year|yr|jahr|aar|år)$/i), iM = idx(/^(month|mon|mth|mo|monat)$/i), iD = idx(/^(day|dd|dom|dag)$/i), iJ = idx(/^(doy|yday|jday|julian)$/i);
    const iP = idx(/^(precip\w*|prec\w*|rain\w*|rr|p|ppt|nedb\w*|pr|rf)(\b|_|\(|\[| )/i), iTn = idx(/^(t_?min\w*|tmin\w*|tn|min_?t\w*|temp_?min\w*|t2m_?min|mintemp\w*)(\b|_|\(| )/i), iTx = idx(/^(t_?max\w*|tmax\w*|tx|max_?t\w*|temp_?max\w*|t2m_?max|maxtemp\w*)(\b|_|\(| )/i), iTm = idx(/^(t_?mean|tmean|tavg|t_?avg|tair|t_?air|tm|temp\w*|t2m|t|ta)(\b|_|\(| )/i);
    const iR = idx(/^(glob\w*|rad\w*|srad|rs|solar\w*|sw_?\w*|shortwave\w*|g_?rad)(\b|_|\(| )/i), iE = idx(/^(et0|eto|et_?0|refevap\w*|ref_?et\w*|pet|evap\w*|et)(\b|_|\(| )/i), iW = idx(/^(wind\w*|ws|u2|windspeed)(\b|_|\(| )/i), iV = idx(/^(vap\w*|ea|e_?a|vp|vapour\w*|vapor\w*)(\b|_|\(| )/i), iH = idx(/^(rh\w*|humid\w*|relhum\w*)(\b|_|\(| )/i);
    if (iP < 0) throw new Error('no rainfall column was found (name it Precip, Rain or P, in mm per day)');
    if (iTn < 0 && iTx < 0 && iTm < 0) throw new Error('no temperature column was found (T_min and T_max, or Tmean, in degrees C)');
    const dateAt = i => { if (iDate >= 0 && !(iY >= 0 && iM >= 0)) return parseDate(t.raw[i][iDate]); if (iY >= 0 && iM >= 0 && iD >= 0) return utc(Math.round(t.data[iY][i]), Math.round(t.data[iM][i]), Math.round(t.data[iD][i])); if (iY >= 0 && iJ >= 0) return utc(Math.round(t.data[iY][i]), 1, 1) + (Math.round(t.data[iJ][i]) - 1) * DAY; if (iDate >= 0) return parseDate(t.raw[i][iDate]); return NaN; };
    if (iDate < 0 && !(iY >= 0 && iM >= 0 && iD >= 0) && !(iY >= 0 && iJ >= 0)) throw new Error('no date was found (a Date column, or Year, Month and Day columns)');
    const rU = opt.radUnit || guessRad(t.data[iR >= 0 ? iR : 0], iR >= 0), num = (i, k) => (k >= 0 && isFinite(t.data[k][i]) ? t.data[k][i] : NaN), rows = [];
    for (let i = 0; i < t.n; i++) { const d = dateAt(i); if (!isFinite(d)) continue; let rad = num(i, iR); if (isFinite(rad)) rad = rU === 'MJ' ? rad / 3.6 : rU === 'W' ? rad * 0.024 : rad; let vp = num(i, iV); if (isFinite(vp) && opt.vpUnit === 'kPa') vp *= 10;
      const tn = num(i, iTn), tx = num(i, iTx), tm = num(i, iTm); let rh = num(i, iH); let tn2 = isFinite(tn) ? tn : tm, tx2 = isFinite(tx) ? tx : tm; if (!isFinite(vp) && isFinite(rh) && isFinite(tx2) && isFinite(tn2)) vp = rh / 100 * es((tx2 + tn2) / 2);
      rows.push({ t: d, P: num(i, iP), tn: tn2, tx: tx2, rad, et0: num(i, iE), wind: num(i, iW), vp }); }
    const nm = k => k >= 0 ? cols[k] : null; use.date = iDate >= 0 ? cols[iDate] : 'Year/Month/Day'; use.precip = nm(iP); use.tmin = nm(iTn >= 0 ? iTn : iTm); use.tmax = nm(iTx >= 0 ? iTx : iTm); use.radiation = nm(iR); use.et0 = nm(iE); use.wind = nm(iW); use.vapour = nm(iV >= 0 ? iV : iH);
    if (iTn < 0 || iTx < 0) notes.push('only a mean temperature was found: it is used for both T_min and T_max, so radiation and reference evapotranspiration cannot be derived from the temperature range and must be in the file');
    return { rows, use, notes, radUnit: iR >= 0 ? rU : null };
  };
  function guessRad(v, has) { if (!has) return 'kWh'; const a = v.filter(isFinite); if (!a.length) return 'kWh'; const mx = Math.max.apply(null, a.slice(0, 100000)); return mx > 70 ? 'W' : mx > 14 ? 'MJ' : 'kWh'; }
  // rows of the SWAFL project weather ({d, P, ET0, tmax, tmin})

  /* parameters of the Daisy reference put into the run: the text of o.patch plus every option p_<Attribute>__<name> (set by the experiment engine).
     A Bioclimate entry is merged into the Bioclimate block the run already has, the other entries are added to the column. */
  S.patchParts = function (o) {
    const groups = {}, lines = [];
    Object.keys(o).forEach(k => { const m = k.match(/^p_([A-Za-z]+)~([^~]*)~(.+)$/); if (m && o[k] !== '' && o[k] != null && isFinite(o[k])) { const key = m[1] + ' ' + m[2], g = groups[key] = groups[key] || []; g.push('(' + m[3] + ' ' + o[k] + ')'); } });
    Object.keys(groups).forEach(key => { const a = key.split(' ')[0], md = key.slice(a.length + 1); lines.push('(' + a + (md ? ' ' + md : '') + ' ' + groups[key].join(' ') + ')'); });
    String(o.patch || '').split(/\n/).forEach(l => { if (l.trim()) lines.push(l.trim()); });
    let bio = ''; const rest = [];
    lines.forEach(l => { const m = l.match(/^\(Bioclimate\s+(?:[A-Za-z0-9_]+\s+)?(\(.*\))\)$/); if (m) bio += ' ' + m[1]; else rest.push(l); });
    return { bio, rest: rest.join('\n') };
  };
  S.rowsFromProject = function (w) { return { rows: (w || []).map(r => ({ t: r.d instanceof Date ? Date.UTC(r.d.getUTCFullYear(), r.d.getUTCMonth(), r.d.getUTCDate()) : +r.d, P: r.P, tn: r.tmin, tx: r.tmax, rad: NaN, et0: r.ET0, wind: NaN, vp: NaN })), use: { date: 'SWAFL project weather', precip: 'rain', tmin: 'T_min', tmax: 'T_max', et0: 'reference ET' }, notes: [] }; };
  // rows -> the Daisy weather file. meta: { name, lat, lon, elev }. Gaps: only whole calendar years that are complete are written; temperature gaps up to 3 days are bridged.
  S.makeDwf = function (src, meta) {
    meta = meta || {}; const lat = S.num(meta.lat, NaN), lon = S.num(meta.lon, 10), elev = S.num(meta.elev, 50), notes = (src.notes || []).slice(), map = new Map();
    src.rows.forEach(r => { if (isFinite(r.t)) map.set(Math.floor(r.t / DAY) * DAY, r); });
    if (!map.size) throw new Error('no dated rows were read');
    const ts = Array.from(map.keys()).sort((a, b) => a - b), y0 = new Date(ts[0]).getUTCFullYear(), y1 = new Date(ts[ts.length - 1]).getUTCFullYear(), years = [], bridged = { n: 0 };
    const full = {};
    for (let y = y0; y <= y1; y++) { const a = utc(y, 1, 1), n = (utc(y + 1, 1, 1) - a) / DAY, days = []; let ok = true, gapRun = 0, bad = 0;
      for (let k = 0; k < n; k++) { const r = map.get(a + k * DAY); days.push(r ? Object.assign({}, r) : null); if (!r || !isFinite(r.P)) { ok = false; break; } }
      if (!ok) continue;
      // temperature gaps
      for (const key of ['tn', 'tx']) { let i = 0; while (i < n) { if (isFinite(days[i][key])) { i++; continue; } let j = i; while (j < n && !isFinite(days[j][key])) j++; const len = j - i; if (len > 3 || i === 0 || j >= n) { bad++; break; } for (let q = i; q < j; q++) days[q][key] = days[i - 1][key] + (days[j][key] - days[i - 1][key]) * (q - i + 1) / (len + 1); bridged.n += len; i = j; } if (bad) break; }
      if (bad) continue; full[y] = days; }
    const ys = Object.keys(full).map(Number).sort((a, b) => a - b); if (!ys.length) throw new Error('no complete calendar year (every day with rain and temperature) was found; gaps longer than 3 days in temperature, or any day without rain, exclude a year');
    let best = [], cur = []; ys.forEach(y => { if (cur.length && y === cur[cur.length - 1] + 1) cur.push(y); else cur = [y]; if (cur.length > best.length) best = cur.slice(); });
    if (best.length < 4) throw new Error('at least four consecutive complete years are needed (Daisy starts one year after the weather file begins); the longest run is ' + best.length + ' year(s)');
    const dropped = ys.length - best.length + (y1 - y0 + 1 - ys.length); if (dropped > 0) notes.push(dropped + ' year(s) with gaps were left out; the file covers ' + best[0] + ' to ' + best[best.length - 1] + ' without a break');
    if (bridged.n) notes.push(bridged.n + ' day(s) of temperature were bridged by straight lines between the neighbouring days');
    const derived = { rad: 0, et0: 0, wind: 0, vp: 0 }, lines = [], tm = [];
    for (const y of best) full[y].forEach((r, k) => { const t = utc(y, 1, 1) + k * DAY, j = k + 1, tmean = (r.tn + r.tx) / 2; tm.push([j, tmean]); const dT = Math.max(0.5, r.tx - r.tn);
      let rad = r.rad; if (!isFinite(rad)) { if (!isFinite(lat)) throw new Error('radiation is not in the data: give the latitude of the site so that it can be derived from the temperature range'); if (!(r.tx > r.tn)) throw new Error('radiation is not in the data and T_min equals T_max, so it cannot be derived'); rad = 0.16 * Math.sqrt(dT) * S.Ra(lat, j) / 3.6; derived.rad++; }
      let et = r.et0; if (!isFinite(et)) { if (!isFinite(lat)) throw new Error('reference evapotranspiration is not in the data: give the latitude so that it can be derived (Hargreaves)'); et = Math.max(0, 0.0023 * (tmean + 17.8) * Math.sqrt(dT) * 0.408 * S.Ra(lat, j)); derived.et0++; }
      let wind = r.wind; if (!isFinite(wind)) { wind = 2; derived.wind++; } let vp = r.vp; if (!isFinite(vp)) { vp = es(r.tn); derived.vp++; }
      lines.push([y, new Date(t).getUTCMonth() + 1, new Date(t).getUTCDate(), f2(r.P), f2(r.tn), f2(r.tx), f2(vp), f2(wind), f2(rad), f2(et)].join('\t')); });
    const n = lines.length; if (derived.rad) notes.push('global radiation was derived from the temperature range (Hargreaves) for ' + derived.rad + ' days'); if (derived.et0) notes.push('reference evapotranspiration was derived from the temperatures (Hargreaves) for ' + derived.et0 + ' days'); if (derived.wind) notes.push('wind speed is not in the data: 2 m/s is used'); if (derived.vp) notes.push('vapour pressure is not in the data: it is taken as the saturation pressure at T_min');
    let sT = 0; tm.forEach(a => sT += a[1]); const Tavg = sT / tm.length; let c1 = 0, s1 = 0, nA = 0; tm.forEach(a => { c1 += a[1] * Math.cos(2 * Math.PI * a[0] / 365.25); s1 += a[1] * Math.sin(2 * Math.PI * a[0] / 365.25); nA++; }); const amp = 2 * Math.hypot(c1, s1) / nA, maxd = Math.round(((Math.atan2(s1, c1) / (2 * Math.PI) * 365.25) + 365.25) % 365.25);
    const head = 'dwf-0.0 -- ' + String(meta.name || 'SWAFL user weather').replace(/[\r\n]/g, ' ') + '\n\n# General information about the station itself.\nStation: ' + String(meta.name || 'SWAFL user weather').replace(/[^\w .\-]/g, '_') + '\nElevation: ' + Math.round(elev) + ' m\nLongitude: ' + Math.abs(lon).toFixed(2) + ' dg' + (lon >= 0 ? 'East' : 'West') + '\nLatitude: ' + (isFinite(lat) ? Math.abs(lat).toFixed(2) : '50.00') + ' dg' + (!isFinite(lat) || lat >= 0 ? 'North' : 'South') + '\nTimeZone: ' + Math.round(lon / 15) * 15 + ' dg' + (lon >= 0 ? 'East' : 'West') + '\n\n# Information about the measurement conditions.\nSurface: reference\nScreenHeight: 2.0 m\n\n# General information about the available data.\nBegin: ' + best[0] + '-01-01\nEnd:   ' + best[best.length - 1] + '-12-31\nTimestep: 24 hours\n\n# Fixed deposit values (Daisy default values).\nNH4WetDep: 0.9 ppm\nNH4DryDep: 2.2 kgN/ha/year\nNO3WetDep: 0.6 ppm\nNO3DryDep: 1.1 kgN/ha/year\n\nTAverage: ' + f2(Tavg) + ' dgC\nTAmplitude: ' + f2(amp) + ' dgC\nMaxTDay: ' + maxd + ' yday\n\n' + '-------------------------------------------------------------------------------------\nYear\tMonth\tDay\tPrecip\tT_min\tT_max\tVapPres\tWind\tGlobRad\tRefEvap\nyear\tmonth\tday\tmm/d\tdgC\tdgC\thPa\tm/s\tkWh/d/m^2\tmm/d\n';
    notes.push('nitrogen deposition is the Daisy default (0.9 ppm NH4 and 0.6 ppm NO3 in rain, plus dry deposition), not measured at your site');
    let sP = 0; lines.forEach(l => sP += parseFloat(l.split('\t')[3])); return { text: head + lines.join('\n') + '\n', first: best[0], last: best[best.length - 1], years: best.length, days: n, name: meta.name || 'user weather', Pmean: sP / best.length, Tmean: Tavg, notes, use: src.use || {}, derived };
  };

  // soil horizons: [{ bottom (cm, positive), sand, silt, clay (%), humus (%), bd (g/cm3) }]. Hydraulic properties by the HYPRES pedotransfer function of Daisy (topsoil flag for the first horizon).
  S.soilDai = function (u, rootCm) {
    const hz = (u && u.horizons || []).filter(h => isFinite(h.bottom)); if (!hz.length) throw new Error('give at least one soil horizon');
    let prev = 0; const out = [], names = [];
    hz.forEach((h, i) => { if (!(h.bottom > prev)) throw new Error('horizon ' + (i + 1) + ': the lower depth must be deeper than the one above'); prev = h.bottom;
      let sa = S.num(h.sand, NaN), si = S.num(h.silt, NaN), cl = S.num(h.clay, NaN); if (![sa, si, cl].every(isFinite)) throw new Error('horizon ' + (i + 1) + ': sand, silt and clay are needed (in %)'); const tot = sa + si + cl; if (tot < 95 || tot > 105) throw new Error('horizon ' + (i + 1) + ': sand + silt + clay is ' + tot.toFixed(1) + ' %, it must be about 100 %'); sa /= tot; si /= tot; cl /= tot;
      const hu = S.num(h.humus, 1) / 100, bd = S.num(h.bd, 1.5); if (!(hu >= 0 && hu < 0.5)) throw new Error('horizon ' + (i + 1) + ': humus must be between 0 and 50 %'); if (!(bd > 0.6 && bd < 2)) throw new Error('horizon ' + (i + 1) + ': dry bulk density must be between 0.6 and 2 g/cm3');
      const nm = 'SWAFL user H' + (i + 1); names.push([nm, h.bottom]);
      out.push('(defhorizon "' + nm + '" USDA3\n  (description "to ' + h.bottom + ' cm")\n  (clay ' + cl.toFixed(4) + ' [])(silt ' + si.toFixed(4) + ' [])(sand ' + sa.toFixed(4) + ' [])(humus ' + hu.toFixed(4) + ' [])\n  (dry_bulk_density ' + bd + ' [g/cm^3])\n  (C_per_N 11.0 [g C/g N])\n  (hydraulic hypres (topsoil ' + (i === 0 ? 'true' : 'false') + ')))\n'); });
    const last = hz[hz.length - 1].bottom; if (last < 100) throw new Error('the lowest horizon must reach at least 100 cm; extend the last row');
    const col = '(defcolumn "SWAFL user column" default\n  (Soil (MaxRootingDepth ' + (rootCm > 0 ? Math.round(rootCm) : Math.min(150, last)) + ' [cm])\n        (border -100 [cm])\n        (horizons ' + names.map(n => '(-' + n[1] + ' [cm] "' + n[0] + '")').join('\n                  ') + '))\n  (Movement vertical (Tertiary none))\n  (Groundwater deep)\n  (OrganicMatter original (init (input 3000 [kg C/ha/y]) (end -25 [cm])))\n  (Chemistry original\n    (combine (N (reaction nitrification (denitrification (water_factor (0.8 0.0) (0.9 0.2) (1.0 1.0))))) ("Trace List"))))\n';
    return { text: ';; SWAFL: soil horizons entered by the user; hydraulic properties from the HYPRES pedotransfer function\n' + out.join('\n') + '\n' + col, n: hz.length };
  };
  // a soil of one USDA texture class down the profile (humus falls with depth); Daisy takes the water properties from HYPRES
  S.usdaSoil = function (id) { const c = S.USDA[id]; if (!c) throw new Error('unknown soil class ' + id); return { horizons: [{ bottom: 30, sand: c[1], silt: c[2], clay: c[3], humus: 2, bd: c[4] }, { bottom: 80, sand: c[1], silt: c[2], clay: c[3], humus: 0.8, bd: +(c[4] + 0.05).toFixed(2) }, { bottom: 200, sand: c[1], silt: c[2], clay: c[3], humus: 0.3, bd: +(c[4] + 0.1).toFixed(2) }], texture: c[0] }; };
  // a soil table in text (csv): columns depth (lower limit, cm), sand, silt, clay, humus (%), bd (g/cm3)
  S.soilFromTable = function (t) {
    const c = t.cols.map(x => String(x).toLowerCase()), f = re => c.findIndex(x => re.test(x)), iD = f(/depth|bottom|lower|to|dybde/), iS = f(/^sand/), iSi = f(/^silt/), iC = f(/^clay|^ler/), iH = f(/humus|organic|^om|^soc|^oc/), iB = f(/bulk|^bd|density|rho/);
    if (iD < 0 || iS < 0 || iSi < 0 || iC < 0) throw new Error('the soil table needs the columns depth (lower limit in cm), sand, silt and clay (%)');
    return { horizons: Array.from({ length: t.n }, (_, i) => ({ bottom: Math.abs(t.data[iD][i]), sand: t.data[iS][i], silt: t.data[iSi][i], clay: t.data[iC][i], humus: iH >= 0 ? t.data[iH][i] : 1.5, bd: iB >= 0 ? t.data[iB][i] : 1.5 })).filter(h => isFinite(h.bottom)).sort((a, b) => a.bottom - b.bottom) };
  };
  S.COMMON = ['ArableFarmRotation.dai', 'ArableFarmRotation_withirrigation.dai', 'ResFarm.dai', 'OutputLog.dai'];
  // the logs the figures use, and how to name them whatever the prefix
  S.logKey = n => { const m = String(n).match(/(Annual-Harvest|Annual-FWater_100cm|Annual-FWater|Annual-SWater|Annual-FN_100cm|Annual-FN|Annual-Tracer|Daily-CropProduction|Daily-FWater|Daily-SWater|Daily-FN|Daily-Theta|Daily-pF|Daily-h|Daily-SNO3|Daily-Tracer_conc|Daily-Tracer|Daily-WaterFlux|Daily-SoilWater|Daily-SurfaceWater|Daily-SoilTemp|Daily-SoilIce|Daily-OM|Daily-CarbonBalance|Daily-Denitrification|Daily-NH4|Daily-BioporeFlux|Daily-MatrixFlux|Daily-Bioclimate|Daily-Photosynthesis|Daily-DrainSink|Daily-Snow|Soil-Tracer)\.dlf/i); return m ? m[1] : null; };
  if (typeof module !== 'undefined' && module.exports) module.exports = S; else root.DaisyScen = S;
})(typeof window !== 'undefined' ? window : globalThis);
