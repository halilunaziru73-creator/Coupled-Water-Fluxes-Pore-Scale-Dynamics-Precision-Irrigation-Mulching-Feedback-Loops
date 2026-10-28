/* The planner of the Daisy workbench: a person writes in their own words what they want to find out, and a plan comes back (factors, levels,
   design, weather, soil, years, what to look at, and the questions that remain). Two engines produce the same plan:
   1. a built-in reader that works offline, anywhere;
   2. an online AI (Claude) that is given the catalogue of what Daisy can vary and must answer with a plan in the same JSON; its answer is checked
      against the catalogue (unknown factors are dropped, values are kept inside their ranges) and the built-in reader is used if it fails. */
(function (root) {
  'use strict';
  const A = {}, S = root.DaisyScen || (typeof require !== 'undefined' ? require('./daisyscen.js') : null), X = root.DaisyExp || (typeof require !== 'undefined' ? require('./daisyexp.js') : null);
  const SOILWORDS = [['silty clay loam', 'usda:siltyclayloam'], ['sandy clay loam', 'usda:sandyclayloam'], ['silt loam', 'usda:siltloam'], ['clay loam', 'usda:clayloam'], ['sandy loam', 'usda:sandyloam'], ['loamy sand', 'usda:loamysand'], ['course loam', 'loam'], ['coarse loam', 'usda:sandyloam'], ['coarse sand', 'sand'], ['resfarm sand', 'sand'], ['sand', 'usda:sand'], ['loam', 'loam']];
  const STAT = [['bologna', 'it-bologna'], ['mediterranean', 'it-bologna'], ['italy', 'it-bologna'], ['foulum', 'dk-foulum'], ['jyndevad', 'dk-jyndevad'], ['valecov', 'cz-valecov'], ['czech', 'cz-valecov'], ['jadwisin', 'pl-jadwisin'], ['poland', 'pl-jadwisin'], ['bratislava', 'sk-bratislava'], ['slovak', 'sk-bratislava'], ['taastrup', 'course'], ['denmark', 'course'], ['danish', 'course']];
  const NUM = '-?\\d+(?:[.,]\\d+)?';
  const toN = s => parseFloat(String(s).replace(',', '.'));
  function nums(str) { const out = []; String(str).replace(new RegExp('(' + NUM + ')', 'g'), (m, a) => { out.push(toN(a)); return m; }); return out; }
  function steps(a, b, st, nDefault) { if (b < a) { const t = a; a = b; b = t; } const n = st > 0 ? Math.round((b - a) / st) : (nDefault || 4); const k = Math.max(1, Math.min(12, st > 0 ? n : nDefault || 4)); const out = []; for (let i = 0; i <= k; i++) out.push(+(a + (b - a) * i / k).toFixed(4)); return out; }
  const UNIT = { trig: 'cm|hpa|kpa', z: 'cm', root: 'cm', mm: 'mm', limit: 'mm', hours: 'h|hr|hrs|hours?', temp: '°c|°|degrees?|deg|c', precip: '%|percent|x|times', nfac: '%|percent|kg n', koc: 'l/kg|l kg', half: 'days?|d' };
  const niceStep = r => { const m = Math.pow(10, Math.floor(Math.log10(r))), f = r / m; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * m; };
  function rangeLevels(a, b, st) { if (b < a) { const t = a; a = b; b = t; } const step = st > 0 ? st : niceStep((b - a) / 4), out = []; for (let v = a; v <= b + step * 1e-6 && out.length < 14; v += step) out.push(+v.toFixed(4)); if (out[out.length - 1] < b - step * 0.3) out.push(b); return out; }
  // quantities with units in the text: "10, 30 and 60 cm", "-100 to -800 cm", "20 %", "2 degrees"
  function quantities(text) {
    const out = [], re = new RegExp('((?:' + NUM + ')(?:\\s*(?:,|and|or|to|through|until)\\s*(?:' + NUM + '))*(?:\\s*-\\s*\\d+(?:[.,]\\d+)?)?)\\s*(?:\\(?\\s*)?(%|percent|°\\s*c|°|degrees?|deg\\b|mm|cm|hpa|kpa|hours?|hrs?|h\\b|days?|x\\b|times|c\\b|l/kg|kg n)', 'g'); let m;
    while ((m = re.exec(text))) { const body = m[1], isRange = /\bto\b|through|until|\d\s*-\s*\d/.test(body); let v = nums(body.replace(/(\d)\s*-\s*(\d)/, '$1 to $2')); const stepM = text.slice(m.index + m[0].length, m.index + m[0].length + 40).match(/(?:in steps of|step of|every|steps of)\s*(\d+(?:[.,]\d+)?)/); const u = m[2].replace(/\s+/g, ''); out.push({ at: m.index, end: m.index + m[0].length, nums: v, range: isRange && v.length === 2, step: stepM ? toN(stepM[1]) : 0, unit: u }); }
    return out;
  }
  const unitOk = (fid, u) => new RegExp('^(' + (UNIT[fid] || '$^') + ')$', 'i').test(u) || (fid === 'temp' && /^(c|°c|°|deg|degrees?)$/i.test(u));
  function levelsOf(q, f) { let lv = q.range ? rangeLevels(q.nums[0], q.nums[1], q.step) : q.nums.slice(0, 10); if (f.id === 'precip' || f.id === 'nfac') { if (/%|percent/.test(q.unit)) lv = lv.map(v => v / 100); } if (f.id === 'trig') lv = lv.map(v => v > 0 ? -v : v); return Array.from(new Set(lv)); }
  function clampLevels(f, lv) { if (f.kind !== 'num' || !f.range) return lv; return lv.map(v => Math.min(f.range[1], Math.max(f.range[0], v))).filter((v, i, a) => a.indexOf(v) === i); }
  const find = (t, words) => { let best = -1, w = ''; words.forEach(x => { const re = new RegExp('(^|[^a-z])' + x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z])'); const m = re.exec(t); if (m && (best < 0 || x.length > w.length)) { best = m.index + m[1].length + x.length; w = x; } }); return best < 0 ? null : { at: best, word: w }; };

  /* ctx: { hasUserSoil, hasUserWx, start, stop } */
  // the first and last year of a plan: written years, or N years from the first year the weather allows
  A.years = function (base) { const st = S.station((base || {}).station || 'course'), o = S.norm(Object.assign({}, base)); if (base && base.nyears && !base.start) { o.start = Math.max(st.first + 1, o.start); const a = Math.min(Math.max(st.first + 1, 1980 > st.last - 3 ? st.first + 1 : 1980), st.last - 3); o.start = a; o.stop = Math.min(st.last, a + base.nyears); } return { start: o.start, stop: o.stop }; };
  A.parse = function (raw, ctx) {
    ctx = ctx || {}; const text = ' ' + String(raw || '').toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ') + ' ', understood = [], questions = [], plan = { factors: [], design: 'factorial', base: {}, responses: [], title: '' };
    if (!text.trim()) return { plan, understood, questions: [{ id: 'what', text: 'What do you want to find out? Describe it in your own words, or choose an experiment of the study.', options: [] }], engine: 'built-in' };
    // a named experiment of the study: "E12" or "experiment 12"
    const pe = text.match(/\be\s?(\d{1,2})\b/) || text.match(/experiment\s+(\d{1,2})\b/);
    if (pe) { const P = X.PRESETS.find(p => p.id === 'E' + (+pe[1])); if (P && P.plan) { plan.factors = JSON.parse(JSON.stringify(P.plan.factors)); plan.design = P.plan.design || 'factorial'; plan.base = Object.assign({}, P.plan.base); plan.title = P.id + ' ' + P.name; understood.push('experiment ' + P.id + ' (' + P.name + '): ' + P.ask); } else if (P) { plan.title = P.id + ' ' + P.name; questions.push({ id: 'unsup', text: P.id + ' ' + P.name + ' ' + P.unsupported + '. Do you want the published runs of this experiment instead?', options: ['Show the published runs of ' + P.id] , preset: P.id }); } }
    // weather station
    for (const [w, id] of STAT) { if (text.indexOf(w) >= 0) { plan.base.station = id; understood.push('weather of ' + S.station(id).label); break; } }
    if (/my (own )?(weather|data|file)|uploaded weather|my weather/.test(text)) { if (ctx.hasUserWx) understood.push('your own weather file'); else questions.push({ id: 'wx', text: 'You mention your own weather. Load the file under My data in the Scenarios tab (CSV, TXT or DWF), then come back here.', options: [] }); }
    // years
    let m = text.match(/(19[6-9]\d|200\d)\s*(?:-|to|until|through)\s*(19[6-9]\d|200\d)/); if (m) { plan.base.start = +m[1]; plan.base.stop = +m[2]; understood.push('years ' + m[1] + ' to ' + m[2]); }
    else { m = text.match(/(\d{1,2})\s*[- ]?years?\b/); if (m && +m[1] >= 3 && +m[1] <= 35 && !/rain|dry year|wet year/.test(m[0])) { plan.base.nyears = +m[1]; understood.push(m[1] + ' simulated years'); } }
    // soils
    const soils = []; let tt = text; SOILWORDS.forEach(([w, id]) => { if (tt.indexOf(w) >= 0) { if (soils.indexOf(id) < 0) soils.push(id); tt = tt.split(w).join(' ~ '); } });
    if (/all (the )?soils|every soil|ten soils|10 soils|each soil|all textures|different soils/.test(text)) { plan.factors.push({ id: 'soil', levels: ['usda:sand', 'usda:loamysand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam', 'usda:siltyclayloam'] }); understood.push('eight soil textures'); }
    else if (/my (own )?soil/.test(text) && ctx.hasUserSoil) { plan.base.soil = 'user'; understood.push('your own soil table'); }
    else if (soils.length > 1) { plan.factors.push({ id: 'soil', levels: soils }); understood.push('soils: ' + soils.map(s => X.levelName(X.factor('soil'), s)).join(', ')); }
    else if (soils.length === 1) { plan.base.soil = soils[0]; understood.push('soil: ' + X.levelName(X.factor('soil'), soils[0])); }
    // temperature, rain and nitrogen written as plain changes: "20 % less rain", "warmer by 2 degrees", "half the nitrogen", "double"
    const add = (id, lv, why) => { let f = plan.factors.find(x => x.id === id); if (!f) { plan.factors.push({ id, levels: lv }); } else f.levels = lv; understood.push(why); };
    const pct = text.match(/(\d{1,2})\s*%\s*(less|more|drier|wetter|lower|higher|reduction|increase)\s*(rain|precip|rainfall)?/) || text.match(/(rain|rainfall|precip\w*)\s+(?:reduced|reduction|increased|up|down|lower|higher)\s+by\s+(\d{1,2})\s*%/);
    // factors by their words
    const hits = []; X.FACTORS.forEach(f => { if (f.id === 'soil' || f.id === 'station') return; const h = find(text, f.words.concat([f.label.toLowerCase()])); if (h) hits.push({ f, at: h.at, start: h.at - h.word.length }); });
    const qs = quantities(text), owned = {};
    qs.forEach(q => { let best = null, bd = 1e9; hits.forEach(h => { if (!unitOk(h.f.id, q.unit) || owned[h.f.id]) return; const dBefore = q.at - h.at, dAfter = h.start - q.end; const d = dBefore >= -2 ? (dBefore <= 70 ? dBefore : 1e8) : (dAfter >= 0 && dAfter <= 25 ? dAfter + 40 : 1e9); if (d < bd) { bd = d; best = h; } }); if (best && bd < 1e8) owned[best.f.id] = q; });
    hits.forEach(h => { const f = h.f; if (plan.factors.find(x => x.id === f.id)) return;
      let lv = null; if (owned[f.id]) lv = clampLevels(f, levelsOf(owned[f.id], f));
      if ((f.id === 'precip' || f.id === 'nfac') && owned[f.id] && /%|percent/.test(owned[f.id].unit) && owned[f.id].nums.length === 1 && !owned[f.id].range) { const q = owned[f.id], p = q.nums[0] / 100, ctxs = text.slice(Math.max(0, q.at - 25), q.end + 25); if (/less|lower|reduc|drier|fewer|decreas|cut|minus|down/.test(ctxs)) lv = [1, +(1 - p).toFixed(2)]; else if (/more|higher|increas|wetter|extra|plus|up\b/.test(ctxs)) lv = [1, +(1 + p).toFixed(2)]; }
      if (f.id === 'precip' && !lv && pct) { const p = +(pct[1].match(/\d/) ? pct[1] : pct[2]) / 100, less = /less|drier|lower|reduc|down/.test(pct[0]); lv = [1, +(less ? 1 - p : 1 + p).toFixed(2)]; }
      if (f.id === 'precip' && !lv && /(drought|dry year|drier)/.test(text)) lv = [1, 0.7]; if (f.id === 'precip' && !lv && /(wet year|wetter)/.test(text)) lv = [1, 1.3];
      if (f.id === 'temp' && lv && lv.length === 1) lv = [0, lv[0]]; if (f.id === 'precip' && lv && lv.length === 1) lv = [1, lv[0]];
      if (f.id === 'nfac') { if (/no (nitrogen|fertili[sz]er)|zero (nitrogen|fertili[sz]er)|unfertili[sz]ed/.test(text)) lv = [0, 1]; else if (/half (the )?(nitrogen|fertili[sz]er|n )/.test(text)) lv = [0.5, 1]; else if (/(double|twice)/.test(text)) lv = [1, 2]; }
      if (f.kind === 'cat') {
        if (f.id === 'irrig') { const a = /rainfed|rain-fed|no irrigation|without irrigation/.test(text), b = /\birrigat/.test(text); if (a && b || /(does|should|worth|benefit|pay|effect|impact|compar|need|how much|versus|vs\b)/.test(text) && b) lv = ['0', '1']; else if (b) { plan.base.irrig = '1'; understood.push('irrigation on'); return; } else return; }
        if (f.id === 'method') { const found = ['overhead', 'sprinkler', 'surface', 'furrow', 'flood', 'drip'].filter(w => text.indexOf(w) >= 0).map(w => w === 'sprinkler' ? 'overhead' : (w === 'furrow' || w === 'flood') ? 'surface' : w); lv = Array.from(new Set(found)); if (lv.length < 2) lv = ['overhead', 'surface', 'drip']; }
      }
      if (f.kind === 'set' && f.id === 'dripdepth' && !/drip/.test(text)) return;
      if (f.id === 'window' && !/timing|window|start date|begin|from (april|may|june)|until|season of/.test(text)) return;
      if (f.id === 'nfac' && !lv && !/(vary|rate|dose|how much|compare|different|levels|effect|response|leach|pollut)/.test(text)) return;
      if (f.id === 'mm' && !lv && !/dose|amount/.test(text)) return;
      if (lv && lv.length === 1 && f.kind === 'num') { plan.base[f.key] = lv[0]; understood.push(f.label.replace(/, factor.*/, '') + ' fixed at ' + lv[0] + (f.unit ? ' ' + f.unit : '')); return; }
      plan.factors.push({ id: f.id, levels: lv || f.levels }); understood.push(f.label.replace(/, factor.*/, '') + ': ' + (lv ? lv.map(v => typeof v === 'object' ? v.label : X.levelName(f, v)).join(', ') : 'standard levels ' + f.levels.map(v => typeof v === 'object' ? v.label : v).join(', ')));
    });
    if (!plan.factors.length && /mulch|litter|tillage|consolidat|\bshp\b|rain intensity|initial (soil )?moisture|initial suction|soil evaporation factor/.test(text)) { const c = /mulch|litter/.test(text) ? ['E7', 'E14'] : /tillage|consolidat|shp/.test(text) ? ['E5'] : ['E8']; questions.push({ id: 'unsup', text: 'Daisy can simulate this, but the parameters of it (mulch, soil structure, initial moisture or rain intensity) are not in the crop files of the built-in farm that SWAFL runs. The published runs of the study cover it (' + c.join(', ') + '). Do you want to explore those?', options: c.map(x => 'Show the published runs of ' + x), preset: c[0] }); }
    // if the soil words listed several soils but the words named irrigation too etc. fine; drop nothing
    // design
    if (/one at a time|one-at-a-time|one factor at a time/.test(text)) plan.design = 'oat'; else if (/factorial|all combinations|every combination|interaction/.test(text)) plan.design = 'factorial'; else if (plan.factors.length > 3) { plan.design = 'oat'; understood.push('more than three factors: one factor at a time (say "all combinations" for the full design)'); }
    // what to look at
    const R = []; [['yield', /yield|production|harvest|grain/], ['irr', /irrigation (use|amount|need|water)|water use|water saving|how much water|water.use efficiency/], ['leach', /leach|nitrate|pollut|nitrogen loss|groundwater/], ['perc', /percolat|drain|recharge/], ['aet', /evapotranspir|\bet\b/], ['den', /denitrif|n2o|nitrous/], ['IE', /efficien|wue|per m3|per cubic/]].forEach(([id, re]) => { if (re.test(text)) R.push(id); });
    plan.responses = R.length ? (R.indexOf('yield') < 0 ? ['yield'].concat(R) : R) : ['yield', 'irr', 'leach', 'perc'];
    // questions that remain
    if (!plan.factors.length && !plan.title && !questions.some(q => q.id === 'unsup')) { questions.push({ id: 'factor', text: 'I could not tell what you want to vary. Choose one or more:', options: ['Irrigation (trigger, dose, method, sensor depth)', 'Nitrogen rate', 'Rain and temperature (climate)', 'Soil texture', 'Rooting depth', 'A chemical (sorption, half-life)'], multi: true }); }
    if (plan.factors.some(f => X.factor(f.id).irr) && !plan.base.start && !plan.base.stop) questions.push({ id: 'years', text: 'How many years should each run cover? More years give steadier means but take longer (about 3 seconds a year for each run).', options: ['5 years', '10 years', '20 years'], key: 'years' });
    if (!plan.base.soil && !plan.factors.some(f => f.id === 'soil') && !ctx.hasUserSoil) questions.push({ id: 'soil', text: 'On which soil? The built-in loam is used unless you choose.', options: ['Built-in loam', 'Built-in sand', 'Eight soil textures'], key: 'soil' });
    if (!plan.base.station && !ctx.hasUserWx) questions.push({ id: 'wx', text: 'Which weather? Taastrup, Denmark (built-in) is used unless you choose; you can also load your own file under My data.', options: ['Taastrup (built-in)', 'Bologna, Italy', 'Foulum, Denmark', 'Valecov, Czechia'], key: 'station' });
    plan.title = plan.title || (plan.factors.length ? 'Effect of ' + plan.factors.map(f => X.factor(f.id).label.replace(/, factor.*| \(.*/, '').toLowerCase()).join(', ') : 'Experiment');
    return { plan, understood, questions, engine: 'built-in' };
  };

  // ------------------------------------------------------------------ online AI
  A.catalogue = function () {
    return JSON.stringify({
      factors: X.FACTORS.map(f => ({ id: f.id, label: f.label, unit: f.unit, kind: f.kind, needs_irrigation: !!f.irr, range: f.range || null, default_levels: f.levels.map(v => typeof v === 'object' ? v.label : v), meaning: f.words.slice(0, 5).join(', ') })),
      soils: S.OPTIONS.soil.opts.map(o => o[0]), stations: S.STATIONS.map(s => ({ id: s.id, label: s.label, years: s.first + '-' + s.last })),
      responses: X.RESP.map(r => ({ id: r.id, label: r.label })), designs: ['factorial', 'oat', 'paired'], experiments_of_the_study: X.PRESETS.map(p => ({ id: p.id, name: p.name, supported_by_daisy_runs: !p.unsupported }))
    });
  };
  A.systemPrompt = function () {
    return 'You plan Daisy (soil-plant-atmosphere model, version 7.1.14) simulation experiments for SWAFL, from a person\'s own words. The simulated system is the built-in arable rotation of the Daisy model (spring barley, winter barley, winter rape, winter wheat) on a chosen soil with daily weather. You may only use the factors, soils, stations and responses of this catalogue:\n' + A.catalogue() + '\nAnswer with ONE JSON object and nothing else: {"title":string,"factors":[{"id":string,"levels":[numbers or strings from the catalogue]}],"design":"factorial|oat|paired","base":{"soil":string,"station":string,"start":year,"stop":year,"irrig":"0|1"},"responses":[ids],"explanation":string (two sentences, plain words),"questions":[{"text":string,"options":[string]}]}. Keep each factor to 2-6 levels and the whole design under 60 runs unless the person asks for more. Put into "questions" only what you truly need to ask; if the person asks for something Daisy cannot vary in this catalogue, say so in "explanation" and plan the closest thing. Negative numbers for the trigger suction (cm).';
  };
  A.validate = function (obj, ctx) {
    const plan = { factors: [], design: ['factorial', 'oat', 'paired'].indexOf(obj.design) >= 0 ? obj.design : 'factorial', base: {}, responses: (obj.responses || []).filter(r => X.RESP.some(q => q.id === r)), title: String(obj.title || 'Experiment').slice(0, 120) }, notes = [];
    (obj.factors || []).forEach(f => { const F = X.factor(f.id); if (!F) { notes.push('unknown factor "' + f.id + '" left out'); return; } let lv = (f.levels || []).slice(0, 10); if (F.kind === 'num') lv = clampLevels(F, lv.map(Number).filter(isFinite)); else if (F.kind === 'cat') { const ok = F.id === 'soil' ? S.OPTIONS.soil.opts.map(o => o[0]) : F.id === 'station' ? S.STATIONS.map(s => s.id) : F.levels; lv = lv.map(String).filter(v => ok.indexOf(v) >= 0); } else lv = lv.filter(v => F.levels.some(l => l.label === (v.label || v))).map(v => v.label || v); if (!lv.length) lv = F.levels.map(v => typeof v === 'object' ? v.label : v); plan.factors.push({ id: F.id, levels: lv }); });
    const b = obj.base || {}; if (b.soil && (S.OPTIONS.soil.opts.some(o => o[0] === b.soil) || b.soil === 'user')) plan.base.soil = b.soil; if (b.station && S.STATIONS.some(s => s.id === b.station)) plan.base.station = b.station; if (isFinite(+b.start)) plan.base.start = Math.round(+b.start); if (isFinite(+b.stop)) plan.base.stop = Math.round(+b.stop); if (b.irrig === '1' || b.irrig === '0') plan.base.irrig = b.irrig;
    if (!plan.responses.length) plan.responses = ['yield', 'irr', 'leach', 'perc'];
    return { plan, understood: obj.explanation ? [String(obj.explanation)] : [], notes, questions: (obj.questions || []).slice(0, 4).map((q, i) => ({ id: 'ai' + i, text: String(q.text || ''), options: (q.options || []).map(String).slice(0, 6) })).filter(q => q.text), engine: 'AI' };
  };
  A.askClaude = async function (text, ctx, key, model) {
    if (!key) throw new Error('no key');
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify({ model: model || 'claude-sonnet-5-5', max_tokens: 1800, system: A.systemPrompt(), messages: [{ role: 'user', content: String(text).slice(0, 4000) + '\n\n(Context: ' + JSON.stringify({ own_weather_loaded: !!(ctx && ctx.hasUserWx), own_soil_table_loaded: !!(ctx && ctx.hasUserSoil) }) + ')' }] }) });
    if (!r.ok) throw new Error('the AI service answered ' + r.status);
    const j = await r.json(), t = ((j.content || []).find(c => c.type === 'text') || {}).text || ''; const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('the AI did not return a plan'); return A.validate(JSON.parse(m[0]), ctx);
  };
  // the way in: the AI when a key is given and the network answers, otherwise the built-in reader
  A.plan = async function (text, ctx, opt) {
    opt = opt || {}; const base = A.parse(text, ctx);
    if (opt.key && opt.online !== false) { try { const r = await A.askClaude(text, ctx, opt.key, opt.model); if (r.plan.factors.length || r.questions.length) { r.fallback = base; return r; } } catch (e) { base.aiError = e.message; } }
    return base;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = A; else root.DaisyAI = A;
})(typeof window !== 'undefined' ? window : globalThis);
