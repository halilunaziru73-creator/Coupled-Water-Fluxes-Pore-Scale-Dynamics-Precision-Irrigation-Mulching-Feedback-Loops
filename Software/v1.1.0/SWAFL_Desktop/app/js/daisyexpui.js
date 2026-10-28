/* Daisy workbench, Experiments tab: write in your own words what you want to find out; a plan of runs comes back; run it in a batch or one by one
   (desktop app with Daisy) or explore the 10 190 published runs of the study (works offline anywhere); figures are drawn from the results. */
'use strict';
(() => {
  const R = window.DaisyRef, D = DaisyUI, IO = window.DaisyIO, SC = window.DaisyScen, X = window.DaisyExp, AI = window.DaisyAI, esc = D.esc, K = () => D.kit;
  const $ = id => document.getElementById('dzX' + id);
  const st = { text: '', res: null, factors: [], base: {}, design: 'factorial', max: 40, log: 'annual', useMy: true, rows: [], runs: [], source: 'daisy', preset: null, ens: null, resp: 'yield', jobs: 4, stop: false, running: false, key: '', model: '', ai: false, responses: [] };
  try { st.key = localStorage.getItem('swafl.ai.key') || ''; st.ai = !!st.key; } catch (e) { }
  const EXAMPLES = ['How do the trigger suction (-100 to -800 cm) and the sensor depth (10, 30 and 60 cm) change irrigation and yield on sand and loam?', 'Compare overhead, surface and drip irrigation on a sandy loam with Bologna weather for 10 years', 'What if the rain is 20% less and it is 2 degrees warmer? Does irrigation pay off?', 'How much nitrogen should I apply? Nitrate leaching on all soils, from 40 to 100 percent', 'A water limit of 100, 200 and 300 mm per season: effect on yield and water use efficiency', 'Effect of mulch on evaporation'];
  const flabel = id => { const f = X.factor(id); if (f) return f.label.replace(/, factor.*/, '') + (f.unit ? ' (' + f.unit + ')' : ''); const e = Object.keys(X.ENS_FACTORS).find(k => X.ENS_FACTORS[k][0] === id); return e ? X.ENS_FACTORS[e][1] : id; };
  const rlabel = id => { const r = X.RESP.find(x => x.id === id); return r ? r.label + ' (' + r.unit + ')' : id; };
  const lname = (fid, v) => { const f = X.factor(fid); if (!f || typeof v === 'object') return String(v && v.label || v); return X.levelName(f, v); };
  const ctx = () => { const m = window.DaisyScenUI ? window.DaisyScenUI.my() : {}; return { hasUserWx: !!(m && m.wxMode !== 'course' && m.wx), hasUserSoil: !!(m && m.soilOn) }; };

  // ------------------------------------------------------------------ page
  function html(arg) {
    if (arg && arg !== st.arg) { st.arg = arg; setTimeout(() => { const g = R.suggest(refCtx()).find(x => x.id === arg); if (g) useSuggestion(g); }, 30); }
    const desk = D.isDesk();
    return (window.DaisyScenUI ? window.DaisyScenUI.strip() : '') + '<div class="dzpan"><h3 style="margin:0">Experiments: say what you want to find out</h3>' +
      '<p class="pnote">Write it in your own words: what to vary, on which soil and weather, what to look at. The planner turns it into a set of Daisy runs, asks what is still open, runs them in a batch or one by one, and draws the figures. ' + (desk ? '' : 'This is the web version: Daisy itself runs in the desktop app; here you can plan, save the experiment folder, and explore the 10 190 published runs of the study.') + '</p>' +
      '<textarea id="dzXText" rows="3" style="width:100%;box-sizing:border-box" placeholder="For example: how do the irrigation trigger and the sensor depth change yield and water use on sand and loam?">' + esc(st.text) + '</textarea>' +
      '<div class="dzrow"><button class="btn pri" id="dzXGo">Understand my request</button><label title="Without a key the built-in planner works fully offline. With a key, an online AI reads the request first, and each plan it gives is checked against what Daisy can vary."><input type="checkbox" id="dzXAi"' + (st.ai ? ' checked' : '') + '> online AI (machine learning)</label><input type="password" id="dzXKey" placeholder="access key" value="' + esc(st.key) + '" style="width:150px;' + (st.ai ? '' : 'display:none') + '"></div>' +
      '<div id="dzXSug"></div><div id="dzXChap"></div>' +
      '<div class="pnote">Examples: ' + EXAMPLES.map((e, i) => '<a href="#" data-ex="' + i + '">' + esc(e.length > 58 ? e.slice(0, 56) + '...' : e) + '</a>').join(' &middot; ') + '</div></div>' +
      '<div id="dzXPlan"></div><div id="dzXRunBox"></div><div id="dzXRes"></div>';
  }


  // ------------------------------------------------------------------ combinations from the Daisy reference
  function refCtx() {
    const m = window.DaisyScenUI ? window.DaisyScenUI.my() : {}, c = { userSoil: !!(m && m.soilOn) };
    if (m && m.wxMode !== 'course' && m.wx) { c.Pmean = m.wx.Pmean; c.Tmean = m.wx.Tmean; }
    if (c.userSoil && m.soil && m.soil.horizons && m.soil.horizons[0]) { const h = m.soil.horizons[0]; c.sand = +h.sand; c.clay = +h.clay; }
    c.root = +(st.base && st.base.root) || undefined; return c;
  }
  function showSuggestions() {
    const box = $('Sug'); if (!box) return; const list = R.suggest(refCtx());
    box.innerHTML = '<div class="dzpan"><b>Best combinations to start with</b> <span class="pnote">worked out from the ' + esc(R.SOURCE) + ' and from the weather and soil given (' + (refCtx().Pmean != null ? 'your weather, ' + Math.round(refCtx().Pmean) + ' mm of rain a year' : 'the course weather') + '); the first is the most useful here. Nothing is taken from earlier experiments.</span>' +
      list.slice(0, 6).map((g, i) => '<div class="dzrow" style="align-items:flex-start;margin-top:6px"><button class="btn' + (i === 0 ? ' pri' : '') + '" data-sug="' + g.id + '" style="min-width:210px;text-align:left">' + esc(g.title) + '</button><span class="pnote" style="flex:1">' + esc(g.why) + ' <i>Manual section ' + esc(g.ref) + '.</i></span></div>').join('') + '</div>';
    box.querySelectorAll('[data-sug]').forEach(b => b.onclick = () => useSuggestion(list.find(x => x.id === b.dataset.sug)));
  }

  // ------------------------------------------------------------------ chapter by chapter of the Daisy reference manual
  const PART = n => n <= 6 ? 'Part I, the framework' : n <= 106 ? 'Part II, the components' : 'Appendix';
  function showChapters() {
    const box = $('Chap'); const CH = window.DaisyChapters; if (!box || !CH) return; if (st.chap == null) st.chap = 1;
    const map = R.CHAPTER_MAP, all = R.suggest(Object.assign(refCtx(), { userSoil: false })), n = st.chap, c = CH.find(x => x.n === n) || CH[0], ids = (map[c.n] || []), items = ids.map(i => all.find(x => x.id === i)).filter(Boolean), hasX = k => map[k] || (X.PARAMS || []).some(q => q.ch === k), nRun = CH.filter(x => hasX(x.n)).length;
    let h = '<details class="dzpan"' + (st.chapOpen ? ' open' : '') + '><summary><b>Chapter by chapter of the Daisy reference</b> <span class="pnote">' + CH.length + ' chapters of the manual (31 August 2026); ' + nRun + ' of them have something that can be varied and run here. Choose a chapter, read what it covers, and load its experiments.</span></summary>';
    h += '<div class="dzrow"><button class="btn" id="dzXChPrev">&laquo; previous</button><select id="dzXChSel" style="max-width:340px">' + CH.map(x => '<option value="' + x.n + '"' + (x.n === n ? ' selected' : '') + '>' + x.n + '. ' + esc(x.title) + (hasX(x.n) ? ' *' : '') + '</option>').join('') + '</select><button class="btn" id="dzXChNext">next &raquo;</button><span class="pnote">* has experiments here &middot; ' + esc(PART(n)) + '</span></div>';
    h += '<div style="margin-top:6px"><b>Chapter ' + c.n + ': ' + esc(c.title) + '</b> <span class="pnote">' + c.sections.length + ' model' + (c.sections.length === 1 ? '' : 's') + ' listed</span><p class="pnote" style="margin:4px 0">' + esc(c.intro) + '</p></div>';
    if (items.length) h += '<div><b>Experiments from this chapter</b>' + items.map(g => '<div class="dzrow" style="align-items:flex-start;margin-top:6px"><button class="btn pri" data-chsug="' + g.id + '" style="min-width:210px;text-align:left">Load: ' + esc(g.title) + '</button><span class="pnote" style="flex:1">' + esc(g.why) + ' <i>Manual section ' + esc(g.ref) + '.</i></span></div>').join('') + '</div>';
    else if (ids.length) h += '<div class="pnote">The experiment for this chapter needs a soil of the course or a soil that is not your own; it is not offered while "My soil" is in use.</div>';
    else h += '<div class="pnote"><b>No experiment from this chapter yet.</b> ' + (c.n <= 6 ? 'This chapter describes how the manual, the setup files and the logs work; it has no process to vary.' : 'Daisy accepts the parameters listed below in a setup file, but this app does not change them in a run, so there is nothing to load. Nothing is made up for it.') + '</div>';
    const prs = (X.PARAMS || []).filter(q => q.ch === c.n && X.factor(q.opt));
    if (prs.length) h += '<div style="margin-top:6px"><b>Parameters of this chapter you can vary</b> <span class="pnote">each was tested in Daisy: tick one or several and press the button, and the runs are generated. Levels are fractions of the value the farm uses.</span>' +
      prs.map(q => { const b = q.farm != null ? q.farm : q.def; return '<div class="dzrow" style="align-items:flex-start;margin-top:4px"><label style="min-width:230px"><input type="checkbox" data-chpar="' + esc(q.opt) + '"> <b>' + esc(q.name) + '</b> <span class="pnote">' + esc(q.unit || '') + '</span></label><span class="pnote" style="flex:1">' + esc(q.desc) + ' <i>' + esc(q.use || 'the standard model') + (q.farm != null ? '; the farm uses ' + q.farm : '; manual default ' + q.def) + '. ' + (q.use === 'aquitard' ? 'Applies to the loam profile; the sand profile has free drainage. ' : '') + (q.sens ? 'Changed yield, water or nitrogen in the test.' : 'No change in yield, water or nitrogen seen in the test, only in the process it belongs to.') + '</i></span></div>'; }).join('') +
      '<div class="dzrow"><button class="btn pri" id="dzXChPar">Make the experiment from the ticked parameters</button><span class="pnote">With two or more ticked, every combination of their levels is run.</span></div></div>';
    if (c.sections.length) h += '<details style="margin-top:6px"><summary class="pnote">The models of this chapter and their parameters</summary><div style="max-height:260px;overflow:auto;font-size:12px">' + c.sections.map(x => '<div style="margin:3px 0"><b>' + esc(x.id) + ' ' + esc(x.name) + '</b> ' + esc(x.desc) + (x.params.length ? ' <span class="pnote">(' + esc(x.params.join(', ')) + ')</span>' : '') + '</div>').join('') + '</div></details>';
    box.innerHTML = h + '</details>';
    const go = k => { st.chap = Math.max(1, Math.min(CH[CH.length - 1].n, k)); st.chapOpen = true; showChapters(); };
    $('ChSel').onchange = ev => go(+ev.target.value); $('ChPrev').onclick = () => go(n - 1); $('ChNext').onclick = () => go(n + 1); box.querySelector('details').ontoggle = ev => { st.chapOpen = ev.target.open; };
    const pb = $('ChPar'); if (pb) pb.onclick = () => { const ids = [].slice.call(box.querySelectorAll('[data-chpar]:checked')).map(i => i.dataset.chpar); if (!ids.length) { pb.nextSibling.textContent = 'Tick at least one parameter first.'; return; } st.chapOpen = true;
      const fs = ids.map(id => ({ id, levels: X.factor(id).levels.slice(0, ids.length > 2 ? 2 : ids.length > 1 ? 3 : 5) })), ttl = ids.map(id => X.factor(id).param.name).join(' and ');
      useSuggestion({ id: 'param', title: 'Vary ' + ttl, why: 'Chapter ' + c.n + ' (' + c.title + ') of the Daisy reference lists ' + (ids.length > 1 ? 'these parameters' : 'this parameter') + '. Each level is a fraction of the value the farm uses, so the runs show how much the results depend on ' + (ids.length > 1 ? 'them' : 'it') + '.', ref: String(c.n), plan: { design: 'factorial', factors: fs, base: {} } }); };
    box.querySelectorAll('[data-chsug]').forEach(b => b.onclick = () => { const g = items.find(x => x.id === b.dataset.chsug); st.chapOpen = true; useSuggestion(g); });
  }
  function useSuggestion(g) {
    if (!g) return; st.text = g.title; const t = $('Text'); if (t) t.value = g.title; const plan = { factors: g.plan.factors.map(f => ({ id: f.id, levels: f.levels.slice() })), base: Object.assign({}, g.plan.base), design: g.plan.design };
    adopt({ plan, understood: [g.title + '. ' + g.why + ' (manual section ' + g.ref + ')'], questions: [], engine: 'reference' });
  }

  // ------------------------------------------------------------------ plan
  function adopt(r) {
    st.res = r; st.factors = r.plan.factors.map(f => ({ id: f.id, levels: f.levels.slice() })); st.base = Object.assign({}, r.plan.base); st.design = r.plan.design || 'factorial'; st.responses = (r.plan.responses || []).slice(); st.resp = st.responses[0] || 'yield'; st.source = 'daisy'; st.preset = null; renderPlan();
  }
  async function understand() {
    st.text = $('Text').value; const box = $('Plan'); box.innerHTML = '<div class="dzpan pnote">Reading your request...</div>';
    st.key = $('Key').value.trim(); st.ai = $('Ai').checked; try { localStorage.setItem('swafl.ai.key', st.ai ? st.key : ''); } catch (e) { }
    const r = await AI.plan(st.text, ctx(), { key: st.ai ? st.key : '', online: navigator.onLine !== false }); adopt(r);
  }
  function usePreset(p) {
    st.text = p.id + ': ' + p.ask; const t = $('Text'); if (t) t.value = st.text; st.res = { plan: p.plan || { factors: [], base: {} }, understood: ['experiment ' + p.id + ' (' + p.name + ') of the study: ' + p.ask + (p.note ? ' (' + p.note + ')' : '')], questions: p.unsupported ? [{ id: 'unsup', text: p.id + ' ' + p.name + ': ' + p.unsupported + '.', options: [], preset: p.id }] : [], engine: 'study' };
    st.factors = ((p.plan && p.plan.factors) || []).map(f => ({ id: f.id, levels: f.levels.slice() })); st.base = Object.assign({}, p.plan && p.plan.base); st.design = (p.plan && p.plan.design) || 'factorial'; st.responses = ['yield', 'irr', 'leach', 'perc']; st.resp = 'yield'; st.preset = p; st.source = p.unsupported || !D.isDesk() ? 'ens' : 'daisy'; renderPlan();
  }
  const factorRow = (f, i) => {
    const F = X.factor(f.id); let cell;
    if (F.kind === 'num') cell = '<input type="text" data-lv="' + i + '" value="' + f.levels.join(', ') + '" style="width:220px"> <span class="pnote">' + esc(F.unit) + ' &middot; allowed ' + (F.range ? F.range[0] + ' to ' + F.range[1] : '') + '</span>';
    else { const all = F.kind === 'set' ? F.levels.map(l => l.label) : F.id === 'soil' ? SC.OPTIONS.soil.opts.map(o => o[0]) : F.id === 'station' ? SC.STATIONS.map(s => s.id) : F.levels; cell = all.map(v => '<label style="margin-right:8px;white-space:nowrap"><input type="checkbox" data-lc="' + i + '" value="' + esc(v) + '"' + (f.levels.some(l => (l.label || l) === v) ? ' checked' : '') + '> ' + esc(F.kind === 'set' ? v : X.levelName(F, v)) + '</label>').join(''); }
    return '<tr><td><b>' + esc(flabel(f.id).replace(/ \(.*/, '')) + '</b>' + (F.irr ? '<div class="pnote">needs irrigation</div>' : '') + '</td><td>' + cell + '</td><td><button class="btn" data-fdel="' + i + '">remove</button></td></tr>';
  };
  function readPlanInputs() {
    document.querySelectorAll('#dzXPlan [data-lv]').forEach(i => { const f = st.factors[+i.dataset.lv], F = X.factor(f.id); const v = i.value.split(/[,;]\s*|\s+/).map(parseFloat).filter(isFinite); if (v.length) f.levels = F.range ? v.map(x => Math.min(F.range[1], Math.max(F.range[0], x))) : v; });
    const byI = {}; document.querySelectorAll('#dzXPlan [data-lc]').forEach(i => { if (i.checked) (byI[i.dataset.lc] = byI[i.dataset.lc] || []).push(i.value); }); Object.keys(byI).forEach(k => { st.factors[+k].levels = byI[k]; });
    document.querySelectorAll('#dzXPlan [data-b]').forEach(i => { const k = i.dataset.b; if (i.type === 'number') { const v = parseFloat(i.value); if (isFinite(v)) st.base[k] = v; } else st.base[k] = i.value; });
    const d = $('Design'); if (d) st.design = d.value; const m = $('Max'); if (m) st.max = Math.max(1, parseInt(m.value) || 40); const l = $('Log'); if (l) st.log = l.value; const u = $('UseMy'); if (u) st.useMy = u.checked; const j = $('Jobs'); if (j) st.jobs = Math.max(1, parseInt(j.value) || 4);
  }
  function currentPlan() { return { factors: st.factors.map(f => ({ id: f.id, levels: f.levels })), design: st.design, base: st.base, max: st.max, seed: 7 }; }
  function optionsFor(run) {
    const yrs = AI.years(st.base), o = Object.assign({}, st.base, { start: yrs.start, stop: yrs.stop, log: st.log }, run.set); delete o.nyears;
    if (st.useMy && window.DaisyScenUI) { const m = window.DaisyScenUI.my(); if (m.wxMode !== 'course' && m.wx) { o.userWx = m.wx; const lo = m.wx.first + 1; o.start = Math.max(o.start, lo); o.stop = Math.min(Math.max(o.stop, o.start + 2), m.wx.last); } if (m.soilOn && !st.factors.some(f => f.id === 'soil') && !run.set.soil) { o.userSoil = m.soil; o.soil = 'user'; } }
    return o;
  }
  function renderPlan() {
    const r = st.res, box = $('Plan'); if (!box || !r) return; const ens = st.preset && st.preset.ens;
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">' + esc(r.plan.title || 'Plan') + '</h3><span class="dzchip">' + (r.engine === 'AI' ? 'planned by the online AI, checked against the catalogue' : r.engine === 'reference' ? 'from the Daisy reference manual and your data' : r.engine === 'study' ? 'experiment of the study' : 'built-in planner') + '</span></div>';
    if (r.aiError || (r.fallback && false)) h += '<p class="pnote">The online AI could not be used (' + esc(r.aiError) + '); the built-in planner answered.</p>';
    if (r.understood.length) h += '<p><b>What I understood</b></p><ul style="margin:0 0 6px 18px">' + r.understood.map(u => '<li>' + esc(u) + '</li>').join('') + '</ul>';
    if (r.notes && r.notes.length) h += '<p class="pnote">' + r.notes.map(esc).join('; ') + '</p>';
    if (r.questions.length) { h += '<p><b>What I still need to know</b></p>'; r.questions.forEach((q, i) => { h += '<div class="dzq"><span>' + esc(q.text) + '</span> ' + (q.options || []).map((o, k) => '<button class="btn" data-q="' + i + ':' + k + '">' + esc(o) + '</button>').join(' ') + '</div>'; }); }
    h += '</div>';
    if (st.factors.length || ens) {
      h += '<div class="dzpan"><b>The experiment</b>' + (st.factors.length ? '<table class="dztab" style="width:100%">' + '<tr><th>Factor</th><th>Levels</th><th></th></tr>' + st.factors.map(factorRow).join('') + '</table>' : '') +
        '<div class="dzrow"><label>Add a factor</label><select id="dzXAdd"><option value="">choose...</option>' + X.FACTORS.filter(f => !st.factors.some(x => x.id === f.id)).map(f => '<option value="' + f.id + '">' + esc(flabel(f.id)) + '</option>').join('') + '</select>' +
        '<label>Design</label><select id="dzXDesign">' + [['factorial', 'all combinations'], ['oat', 'one factor at a time'], ['paired', 'levels side by side']].map(d => '<option value="' + d[0] + '"' + (st.design === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select><label>at most</label><input type="number" id="dzXMax" value="' + st.max + '" min="1" max="2000" style="width:70px"><label>runs</label></div>' +
        '<div class="dzrow"><label>Weather</label><select data-b="station"' + (st.factors.some(f => f.id === 'station') ? ' disabled' : '') + '>' + SC.STATIONS.map(s => '<option value="' + s.id + '"' + ((st.base.station || 'course') === s.id ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') + '</select>' +
        '<label>Soil</label><select data-b="soil"' + (st.factors.some(f => f.id === 'soil') ? ' disabled' : '') + '>' + SC.OPTIONS.soil.opts.map(o => '<option value="' + o[0] + '"' + ((st.base.soil || 'loam') === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>' +
        '<label>Years</label><input type="number" data-b="start" value="' + (AI.years(st.base).start) + '" style="width:70px"> to <input type="number" data-b="stop" value="' + (AI.years(st.base).stop) + '" style="width:70px">' +
        '<label>Logs kept</label><select id="dzXLog">' + [['annual', 'annual only (fast, many runs)'], ['season', 'annual and harvest'], ['light', 'annual and daily crop, water, soil water (for the single-run figures)'], ['full', 'everything'], ['process', 'all process logs of Fig. 1 (snow, heat, ice, carbon, N2O, flows)']].map(d => '<option value="' + d[0] + '"' + (st.log === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select></div>' +
        '<div class="dzrow"><label><input type="checkbox" id="dzXUseMy"' + (st.useMy ? ' checked' : '') + '> use my weather and my soil (My data, Scenarios tab) when they are set</label></div><div id="dzXCount" class="pnote"></div>' +
        '<div class="dzrow"><button class="btn pri" id="dzXBatch">Run in a batch</button><label>in parallel</label><input type="number" id="dzXJobs" value="' + st.jobs + '" min="1" max="16" style="width:55px"><button class="btn" id="dzXSeq">Run one at a time</button><button class="btn" id="dzXZip">Save the experiment folder (.zip)</button><button class="btn" id="dzXPlanSave">Save the plan (.json)</button>' + (ens ? '<button class="btn" id="dzXEns">Show the published runs of ' + esc(st.preset.id) + ' (offline)</button>' : '') + '<span id="dzXst" class="pnote"></span></div></div>';
    } else if (!r.questions.length) h += '';
    box.innerHTML = h; bindPlan(); count();
  }
  function count() {
    const e = $('Count'); if (!e) return; readPlanInputs();
    try { const d = X.design(currentPlan()), yrs = AI.years(st.base), sec = Math.max(1, d.runs.length) * (yrs.stop - yrs.start) * 3.2 / Math.max(1, st.jobs); e.innerHTML = '<b>' + d.runs.length + ' runs</b>' + (d.thinned ? ' (a spread of ' + d.total + ' combinations, chosen at random with a fixed seed)' : '') + ', each of ' + (yrs.stop - yrs.start) + ' years; about ' + (sec < 90 ? Math.round(sec) + ' seconds' : Math.round(sec / 60) + ' minutes') + ' on a computer running ' + st.jobs + ' at a time.' + (st.factors.some(f => X.factor(f.id).irr) && d.runs.some(r => r.reference) ? ' A rainfed reference run is added.' : ''); } catch (x) { e.innerHTML = '<span style="color:#b3261e">' + esc(x.message) + '</span>'; }
  }
  function bindPlan() {
    const box = $('Plan'); box.querySelectorAll('[data-q]').forEach(b => b.onclick = () => answer(b.dataset.q));
    box.querySelectorAll('[data-fdel]').forEach(b => b.onclick = () => { readPlanInputs(); st.factors.splice(+b.dataset.fdel, 1); renderPlan(); });
    const add = $('Add'); if (add) add.onchange = () => { readPlanInputs(); if (add.value) { const f = X.factor(add.value); st.factors.push({ id: f.id, levels: f.levels.map(v => typeof v === 'object' ? v.label : v).slice() }); renderPlan(); } };
    box.querySelectorAll('input,select').forEach(i => { if (i.id !== 'dzXAdd') i.onchange = () => { readPlanInputs(); count(); }; });
    const b = $('Batch'); if (b) b.onclick = () => run(false); const s = $('Seq'); if (s) s.onclick = () => run(true); const z = $('Zip'); if (z) z.onclick = saveZip; const p = $('PlanSave'); if (p) p.onclick = () => { readPlanInputs(); D.download('daisy-experiment-plan.json', JSON.stringify({ request: st.text, plan: currentPlan(), responses: st.responses }, null, 1), 'application/json'); };
    const e = $('Ens'); if (e) e.onclick = () => showEnsemble();
    const q0 = (st.res.questions || []).find(q => q.preset); if (q0 && !st.factors.length) { /* nothing else to show */ }
  }
  function answer(code) {
    const [i, k] = code.split(':').map(Number), q = st.res.questions[i], o = (q.options || [])[k] || ''; readPlanInputs();
    if (q.preset && /published/i.test(o)) { const p = X.PRESETS.find(x => x.id === (o.match(/E\d+/) || [q.preset])[0]); st.preset = p; st.source = 'ens'; showEnsemble(); return; }
    if (q.key === 'years') { st.base.nyears = parseInt(o); delete st.base.start; delete st.base.stop; }
    else if (q.key === 'soil') { if (/eight/i.test(o)) { st.factors = st.factors.filter(f => f.id !== 'soil'); st.factors.push({ id: 'soil', levels: ['usda:sand', 'usda:loamysand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam', 'usda:siltyclayloam'] }); } else st.base.soil = /sand/i.test(o) ? 'sand' : 'loam'; }
    else if (q.key === 'station') { st.base.station = /bologna/i.test(o) ? 'it-bologna' : /foulum/i.test(o) ? 'dk-foulum' : /valecov/i.test(o) ? 'cz-valecov' : 'course'; }
    else if (q.id === 'factor') { const map = { 'Irrigation': ['trig', 'z'], 'Nitrogen': ['nfac'], 'Rain and': ['precip', 'temp'], 'Soil': ['soil'], 'Rooting': ['root'], 'A chemical': ['koc', 'half'] }; Object.keys(map).forEach(key => { if (o.indexOf(key) === 0) map[key].forEach(id => { if (!st.factors.some(f => f.id === id)) { const F = X.factor(id); st.factors.push({ id, levels: F.levels.slice() }); } }); }); }
    st.res.questions.splice(i, 1); renderPlan();
  }
  // ------------------------------------------------------------------ the experiment folder
  async function commonFiles() { const f = {}; for (const n of SC.COMMON) f[n] = await D.getText('scenarios/common/' + n); f['Daily-1965-2000.dwf'] = await D.getText('scenarios/common/Daily-1965-2000.dwf'); return f; }
  async function stationFiles(files, ids) { for (const id of ids) if (id && id !== 'course') files['weather/' + id + '.dwf'] = await D.getText('weather/' + id + '.dwf'); }
  async function buildJobs(design, files) { const stIds = Array.from(new Set(design.runs.map(r => (r.set.station || st.base.station || 'course')))); await stationFiles(files, stIds); return design.runs.map(run => ({ run, job: SC.buildJob('exp', optionsFor(run), run.id, files) })); }
  async function saveZip() {
    try { readPlanInputs(); const design = X.design(currentPlan()), files = await commonFiles(), jobs = await buildJobs(design, files); const tree = X.folder(jobs, files, { request: st.text, plan: currentPlan(), design: design.factors }); const z = X.zip(tree); const b = new Blob([z], { type: 'application/zip' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'daisy-experiment.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); D.note('Xst', 'Saved ' + Object.keys(tree).length + ' files: ' + design.runs.length + ' runs with crops, soils, weather and OutputLog files.'); }
    catch (e) { D.note('Xst', esc(e.message), 1); }
  }
  // ------------------------------------------------------------------ running
  async function run(seq, override) {
    if (st.running) { st.stop = true; D.note('Xst', 'Stopping after the runs that have started...'); return; }
    try {
      readPlanInputs(); if (!D.isDesk() || !window.swafl || !window.swafl.daisyJob) { D.note('Xst', 'Daisy itself runs in the desktop app. Here you can save the experiment folder (.zip) and run it anywhere, or explore the published runs.', 1); return; }
      let info = await window.swafl.daisyInfo(); if (!info.found) info = await window.swafl.daisyChoose(); if (!info.found) throw new Error('No Daisy program chosen. Install Daisy 7.1.14 (Model and documentation tab).');
      const design = override || X.design(currentPlan()), files = await commonFiles(), jobs = await buildJobs(design, files), fids = override ? st.fids : design.factors.map(f => f.id);
      if (!override) { st.rows = []; st.runs = []; st.design0 = design; } else st.design0 = { runs: st.design0.runs.concat(design.runs), factors: st.design0.factors }; st.fids = fids; st.source = 'daisy'; st.running = true; st.stop = false; $('Batch').textContent = 'Stop'; const box = $('RunBox');
      box.innerHTML = '<div class="dzpan"><b id="dzXProg">0 of ' + jobs.length + ' runs</b> <div id="dzXBar" style="height:8px;background:#e4e7ec;border-radius:4px;margin:6px 0"><div id="dzXBarIn" style="height:8px;width:0;background:#2b83ba;border-radius:4px"></div></div><div id="dzXList" class="pnote" style="max-height:120px;overflow:auto"></div></div>';
      let next = 0, done = 0, fail = 0; const t0 = Date.now(), nPar = seq ? 1 : st.jobs, lastDraw = { t: 0 };
      const work = async () => { while (next < jobs.length && !st.stop) { const { run: rn, job } = jobs[next++]; job.copyBundle = true; let r; try { r = await window.swafl.daisyJob(job); } catch (e) { r = { code: -1, err: e.message, logs: {} }; }
        const logs = {}; Object.keys(r.logs || {}).forEach(n => { const k = SC.logKey(n); if (k) { try { const d = IO.readDlf(r.logs[n], n); if (d.n) logs[k] = d; } catch (e) { } } });
        done++; if (!logs['Annual-Harvest']) { fail++; $('List').innerHTML += '<div style="color:#b3261e">' + esc(rn.id) + ' ' + esc(rn.label) + ': Daisy gave no results (code ' + r.code + '): ' + esc(((r.err || r.out || '') + '').split('\n').filter(l => /error/i.test(l)).slice(0, 1).join(' ') || 'see the set-up') + '</div>'; }
        else { const sx = DaisyFig.stats({ logs }); st.rows.push({ id: rn.id, label: rn.label, val: rn.val, f: rn.val, r: X.respOf(sx), reference: !!rn.reference }); st.runs.push({ id: rn.id, label: rn.label, logs, options: job.options }); }
        const pct = Math.round(done / jobs.length * 100); $('Prog').textContent = done + ' of ' + jobs.length + ' runs' + (fail ? ', ' + fail + ' without results' : '') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'; $('BarIn').style.width = pct + '%';
        if (Date.now() - lastDraw.t > 2500 && st.rows.length >= 3) { lastDraw.t = Date.now(); drawResults(); } } };
      await Promise.all(Array.from({ length: nPar }, work)); st.running = false; $('Batch').textContent = 'Run in a batch'; if (!st.rows.length) throw new Error('none of the runs gave results; see the messages above'); drawResults(); D.note('Xst', st.stop ? 'Stopped: ' + st.rows.length + ' runs finished.' : 'Finished ' + st.rows.length + ' runs in ' + Math.round((Date.now() - t0) / 1000) + ' s.');
    } catch (e) { st.running = false; const b = $('Batch'); if (b) b.textContent = 'Run in a batch'; D.note('Xst', esc(e.message), 1); }
  }
  // ------------------------------------------------------------------ the published runs of the study
  async function loadEns() {
    if (st.ens) return st.ens; D.note('Xst', 'Reading the 10 190 published runs...');
    const res = await fetch('data/daisy/ensemble.csv.gz'); if (!res.ok) throw new Error('the table of published runs was not found'); let text;
    if (typeof DecompressionStream !== 'undefined') text = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).text(); else throw new Error('this browser cannot unpack the table; use the desktop app');
    st.ens = X.parseEnsemble(text); return st.ens;
  }
  async function showEnsemble() {
    try { const rows = await loadEns(), p = st.preset; const sel = rows.filter(r => r.exp === p.id && r.valid === 1); if (!sel.length) throw new Error('no published runs for ' + p.id);
      const fids = Object.keys(sel[0].f).filter(k => sel.some(r => r.f[k] !== undefined && r.f[k] !== '' && !(typeof r.f[k] === 'number' && !isFinite(r.f[k]))) && E_has(sel, k)); st.rows = sel.map(r => ({ id: r.id, label: r.treatment, val: r.f, f: r.f, r: r.r })); st.runs = []; st.fids = fids; st.source = 'ens'; st.responses = ['yield', 'irr', 'leach', 'perc']; st.resp = 'yield'; $('RunBox').innerHTML = '<div class="dzpan pnote">Published runs of ' + esc(p.id + ' ' + p.name) + ' (' + sel.length + ' valid runs, ten soils, 20 years of Taastrup weather, 1980 to 1999). Daily detail of single runs is in the Zenodo archive; the figures below use the run means.</div>'; drawResults(); D.note('Xst', ''); }
    catch (e) { D.note('Xst', esc(e.message), 1); }
  }
  const E_has = (rows, k) => new Set(rows.map(r => r.f[k])).size > 1;

  // ------------------------------------------------------------------ figures
  const SPEC = () => K().SPEC, OKI = () => K().OKI;
  function drawResults() {
    const host = $('Res'); if (!host) return; if (st.runs[0] && st.runs[0].options) DaisyCite.ctx = DaisyCite.describe(st.runs[0].options, SC); const rows = st.rows, fids = st.fids || []; if (!rows.length) { host.innerHTML = ''; return; }
    X.indices(rows);
    const resps = X.RESP.filter(r => rows.some(x => isFinite(x.r[r.id]))).map(r => r.id), resp = resps.indexOf(st.resp) >= 0 ? st.resp : resps[0], numF = fids.filter(f => rows.every(r => typeof r.f[f] === 'number' || r.reference || r.f[f] === undefined) && X.levels(rows, f).length > 1), multi = fids.filter(f => X.levels(rows, f).length > 1);
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">Results</h3><span class="pnote">' + rows.length + ' runs' + (st.source === 'ens' ? ' (published)' : '') + '</span><span style="flex:1"></span><label>Look at</label><select id="dzXResp">' + resps.map(r => '<option value="' + r + '"' + (r === resp ? ' selected' : '') + '>' + esc(rlabel(r)) + '</option>').join('') + '</select><button class="btn" id="dzXCsv">Table (CSV)</button><button class="btn" id="dzXRep">Report (HTML)</button></div>' + keyNumbers(rows, resp) + '</div>';
    const fig = (id, title, note, n) => '<div class="dzpan dzfig" data-xf="' + id + '"><div class="dzrow"><b>' + esc(title) + '</b><span style="flex:1"></span><button class="btn" data-xpng="' + id + '">Picture (PNG)</button></div><p class="pnote">' + esc(note) + '</p>' + Array.from({ length: n || 1 }, (_, k) => '<div><canvas data-xc="' + id + '_' + k + '"></canvas></div>').join('') + '</div>';
    if (multi.length) h += fig('tor', 'Which factor matters most for ' + rlabel(resp).replace(/ \(.*/, '').toLowerCase(), 'The range of the mean response between the lowest and highest level of each factor, the other factors averaged. Longer bar = bigger influence.');
    multi.forEach((f, i) => { h += fig('me' + i, 'Effect of ' + flabel(f).replace(/ \(.*/, '').toLowerCase() + ' on ' + rlabel(resp).replace(/ \(.*/, '').toLowerCase(), 'Mean over all other factors (line or bar), with the lowest and highest run at each level (whiskers).'); });
    if (multi.length >= 2) h += fig('heat', 'Interaction: ' + flabel(multi[0]).replace(/ \(.*/, '') + ' with ' + flabel(multi[1]).replace(/ \(.*/, ''), 'Mean of ' + rlabel(resp) + ' in each combination; the other factors are averaged. Colours run from low (blue) to high (red).');
    if (rows.some(r => isFinite(r.r.irr)) && rows.some(r => isFinite(r.r.yield))) h += fig('trade', 'Trade-off: yield against irrigation water', 'Each point is one run. The line joins the runs that no other run beats on both counts (least water, most yield).');
    if (rows.some(r => isFinite(r.r.leach)) && rows.some(r => isFinite(r.r.yield))) h += fig('trade2', 'Trade-off: yield against nitrate leached', 'Each point is one run; the line joins the best runs (least leaching, most yield).');
    if (st.runs.length) h += '<div class="dzpan"><div class="dzrow"><b>One run in detail</b><select id="dzXOne">' + st.runs.map((r, i) => '<option value="' + i + '">' + esc(r.id + ' ' + r.label) + '</option>').join('') + '</select><span class="pnote">the standard Daisy figures of that run (the daily ones need the logs set to "annual and daily...")</span></div><div id="dzXOneFigs"></div></div>';
    h += learnCard(rows, fids, resp);
    host.innerHTML = h; bindLearn(rows, fids, resp); $('Resp').onchange = e => { st.resp = e.target.value; drawResults(); }; $('Csv').onclick = () => D.download('daisy-experiment.csv', X.csv(rows, fids, X.RESP.map(r => r.id).filter(r => resps.indexOf(r) >= 0)), 'text/csv'); $('Rep').onclick = () => report(resp);
    host.querySelectorAll('[data-xpng]').forEach(b => b.onclick = () => { const c = host.querySelector('[data-xc="' + b.dataset.xpng + '_0"]'); if (c) DaisyCite.png(c, 'daisy-' + b.dataset.xpng + '.png'); });
    const cv = id => host.querySelector('[data-xc="' + id + '_0"]'); const tryDraw = (id, fn) => { try { const c = cv(id); if (c) fn(c); } catch (e) { const p = host.querySelector('[data-xf="' + id + '"]'); if (p) p.insertAdjacentHTML('beforeend', '<span style="color:#b3261e">could not be drawn: ' + esc(e.message) + '</span>'); console.warn(id, e); } };
    tryDraw('tor', c => tornado(c, rows, multi, resp)); multi.forEach((f, i) => tryDraw('me' + i, c => mainEffect(c, rows, f, resp))); tryDraw('heat', c => heat(c, rows, multi[0], multi[1], resp)); tryDraw('trade', c => trade(c, rows, 'irr', 'yield', multi[0])); tryDraw('trade2', c => trade(c, rows, 'leach', 'yield', multi[0]));
    const one = $('One'); if (one) { const dr = () => oneRun(st.runs[+one.value]); one.onchange = dr; dr(); }
  }

  // ------------------------------------------------------------------ iteration: learn from the runs so far and propose the next ones
  function learnCard(rows, fids, resp) {
    const nums = fids.filter(f => X.factor(f) && X.factor(f).kind === 'num' && X.levels(rows, f).length > 1 && rows.every(r => r.reference || typeof r.f[f] === 'number'));
    if (!nums.length || !st.design0 || st.source !== 'daisy') return '';
    return '<div class="dzpan"><div class="dzrow"><b>Iterate: learn from these runs</b><span class="pnote" style="flex:1">A regression model is fitted on the finished runs (squares and products of ' + nums.map(f => esc(flabel(f).replace(/ \(.*/, ''))).join(', ') + '), and the next runs are placed between the levels already run where the model expects the best ' + esc(rlabel(resp).replace(/ \(.*/, '').toLowerCase()) + ' and where no run exists yet. Run them, and repeat.</span><button class="btn" id="dzXLearn">Learn and propose the next runs</button></div><div id="dzXLearnOut"></div></div>';
  }
  function bindLearn(rows, fids, resp) {
    const b = $('Learn'); if (!b) return; const nums = fids.filter(f => X.factor(f) && X.factor(f).kind === 'num' && X.levels(rows, f).length > 1 && rows.every(r => r.reference || typeof r.f[f] === 'number'));
    b.onclick = () => {
      const out = $('LearnOut'), good = (X.RESP.find(r => r.id === resp) || {}).good || 1, data = rows.filter(r => !r.reference && isFinite(r.r[resp])), cats = fids.filter(f => nums.indexOf(f) < 0);
      const groups = {}; data.forEach(r => { const k = cats.map(f => String(r.f[f])).join('|'); (groups[k] = groups[k] || []).push(r); });
      let key = null, best = -Infinity; Object.keys(groups).forEach(k => { const g = groups[k]; if (g.length < nums.length + 2) return; const m = g.reduce((a, r) => a + r.r[resp], 0) / g.length * (good === 0 ? 1 : good); if (m > best) { best = m; key = k; } });
      if (key == null) { out.innerHTML = '<p class="pnote" style="color:#b3261e">There are too few runs for each combination of ' + (cats.length ? cats.map(f => esc(flabel(f).replace(/ \(.*/, ''))).join(' and ') : 'the factors') + ' to learn from: ' + (nums.length + 2) + ' or more are needed in one combination.</p>'; return; }
      const g = groups[key], L = R.learn(g, nums, resp, { good: good === 0 ? 1 : good, count: 4 }); if (!L.ok) { out.innerHTML = '<p class="pnote" style="color:#b3261e">' + esc(L.why) + '</p>'; return; }
      const tpl = st.design0.runs.find(r => r.id === g[0].id) || st.design0.runs[0], rd = (f, v) => { const k = X.factor(f).key; return k === 'nfac' || k === 'precip' || k === 'temp' ? Math.round(v * 100) / 100 : Math.round(v); };
      const mk = (val, i) => { const set = Object.assign({}, tpl.set), v = Object.assign({}, g[0].f); nums.forEach(f => { const x = rd(f, val[f]); set[X.factor(f).key] = x; v[f] = x; }); return { id: 'L' + (st.iter = (st.iter || 0) + 1), label: 'Learned: ' + nums.map(f => flabel(f).replace(/ \(.*/, '') + ' ' + v[f]).join(', '), set, level: {}, val: v }; };
      const cand = L.next.map(n => ({ n, run: mk(n.val) }));
      out.innerHTML = '<p>The model explains <b>' + Math.round(L.r2 * 100) + '%</b> of the variation of ' + esc(rlabel(resp)) + ' in ' + L.n + ' runs' + (cats.length ? ' (' + cats.map(f => esc(lname(f, g[0].f[f]))).join(', ') + ')' : '') + '. It expects the best value near ' + nums.map(f => esc(flabel(f).replace(/ \(.*/, '')) + ' <b>' + rd(f, L.best.val[f]) + '</b>').join(', ') + ' (' + K().fmt(L.best.predicted, 3) + '). Next runs:</p><table class="dzt"><tr>' + nums.map(f => '<th>' + esc(flabel(f)) + '</th>').join('') + '<th>expected ' + esc(rlabel(resp).replace(/ \(.*/, '').toLowerCase()) + '</th></tr>' + cand.map(c => '<tr>' + nums.map(f => '<td>' + c.run.val[f] + '</td>').join('') + '<td>' + K().fmt(c.n.predicted, 3) + '</td></tr>').join('') + '</table><div class="dzrow"><button class="btn pri" id="dzXLearnRun">Run these ' + cand.length + ' runs and add them</button>' + (L.r2 < 0.6 ? '<span class="pnote" style="color:#b3261e">the fit is weak: more runs spread over the range will help more than these.</span>' : '') + '</div>';
      $('LearnRun').onclick = () => run(false, { runs: cand.map(c => c.run), factors: st.design0.factors, total: cand.length });
    };
  }

  function keyNumbers(rows, resp) {
    const v = rows.map(r => r.r[resp]).filter(isFinite); if (!v.length) return ''; const mean = v.reduce((a, b) => a + b, 0) / v.length, lo = rows.reduce((a, r) => isFinite(r.r[resp]) && (!a || r.r[resp] < a.r[resp]) ? r : a, null), hi = rows.reduce((a, r) => isFinite(r.r[resp]) && (!a || r.r[resp] > a.r[resp]) ? r : a, null);
    return '<p>' + esc(rlabel(resp)) + ': mean <b>' + K().fmt(mean, 3) + '</b>; lowest <b>' + K().fmt(lo.r[resp], 3) + '</b> (' + esc(lo.label) + '); highest <b>' + K().fmt(hi.r[resp], 3) + '</b> (' + esc(hi.label) + ').</p>';
  }
  function frame(cv, h, L, R, T, B) { const k = K(), s = k.setup(cv, h), w = s.w; return { g: s.g, w, h, L: L || 58, R: R || 14, T: T || 16, B: B || 40, pw: w - (L || 58) - (R || 14), ph: h - (T || 16) - (B || 40) }; }
  function tornado(cv, rows, fids, resp) {
    const S = X.sensitivity(rows, fids, resp), fr = frame(cv, 40 + S.length * 34, 190, 20, 12, 30), g = fr.g, mx = Math.max.apply(null, S.map(s => s.range)) || 1, k = K();
    g.font = '12px Segoe UI, Arial'; S.forEach((s, i) => { const y = fr.T + i * 34 + 4, wd = s.range / mx * fr.pw * 0.55; g.fillStyle = k.OKI[0]; g.fillRect(fr.L, y, Math.max(1, wd), 22); g.fillStyle = '#222'; g.textAlign = 'right'; g.fillText(flabel(s.id).replace(/ \(.*/, ''), fr.L - 8, y + 15); g.textAlign = 'left'; g.fillText(k.fmt(s.range, 3) + '  (' + k.fmt(s.lo, 3) + ' to ' + k.fmt(s.hi, 3) + ')', fr.L + wd + 6, y + 15); });
    g.fillStyle = '#555'; g.textAlign = 'center'; g.fillText('range of the mean ' + rlabel(resp), fr.L + fr.pw / 2, fr.h - 8);
  }
  function mainEffect(cv, rows, fid, resp) {
    const M = X.marginal(rows, fid, resp), k = K(), numeric = M.every(m => typeof m.level === 'number') && M.length > 2;
    if (numeric) { const x = M.map(m => m.level); k.line(cv, [{ name: 'maximum', x, y: M.map(m => m.max), color: '#9ecae1', line: true, pts: false, dash: true }, { name: 'minimum', x, y: M.map(m => m.min), color: '#9ecae1', line: true, pts: false, dash: true }, { name: 'mean', x, y: M.map(m => m.mean), color: k.OKI[1], line: true, pts: true, r: 4 }], { h: 260, xt: flabel(fid), yt: rlabel(resp) }); }
    else DaisyFig.groupBars(cv, M.map(m => lname(fid, m.level)), [{ name: 'mean of ' + rlabel(resp).replace(/ \(.*/, ''), vals: M.map(m => m.mean), color: k.OKI[0] }], { h: 260, yt: rlabel(resp) });
  }
  function heat(cv, rows, f1, f2, resp) {
    const G = X.grid(rows, f1, f2, resp), k = K(), nx = G.xs.length, ny = G.ys.length, fr = frame(cv, Math.min(520, 90 + ny * 34), 130, 130, 14, 56), g = fr.g; let lo = Infinity, hi = -Infinity; G.z.forEach(r => r.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } })); if (!isFinite(lo)) return; const cw = fr.pw / nx, ch = fr.ph / ny, sp = k.SPEC;
    g.font = '11px Segoe UI, Arial'; G.ys.forEach((y, j) => G.xs.forEach((x, i) => { const v = G.z[j][i]; if (!isFinite(v)) return; const t = (v - lo) / (hi - lo || 1); g.fillStyle = sp[Math.round(t * (sp.length - 1))]; g.fillRect(fr.L + i * cw, fr.T + (ny - 1 - j) * ch, cw - 1, ch - 1); g.fillStyle = t > 0.8 || t < 0.12 ? '#fff' : '#111'; g.textAlign = 'center'; g.fillText(k.fmt(v, 3), fr.L + (i + 0.5) * cw, fr.T + (ny - 1 - j + 0.5) * ch + 4); }));
    g.fillStyle = '#333'; g.textAlign = 'center'; G.xs.forEach((x, i) => g.fillText(lname(f1, x), fr.L + (i + 0.5) * cw, fr.h - fr.B + 16)); g.textAlign = 'right'; G.ys.forEach((y, j) => g.fillText(lname(f2, y), fr.L - 6, fr.T + (ny - 1 - j + 0.5) * ch + 4)); g.textAlign = 'center'; g.fillText(flabel(f1), fr.L + fr.pw / 2, fr.h - 10);
    g.save(); g.translate(14, fr.T + fr.ph / 2); g.rotate(-Math.PI / 2); g.fillText(flabel(f2), 0, 0); g.restore(); const bx = fr.L + fr.pw + 24; for (let i = 0; i < 40; i++) { g.fillStyle = sp[Math.round((1 - i / 39) * (sp.length - 1))]; g.fillRect(bx, fr.T + i * fr.ph / 40, 16, fr.ph / 40 + 1); } g.fillStyle = '#333'; g.textAlign = 'left'; g.fillText(k.fmt(hi, 3), bx + 22, fr.T + 8); g.fillText(k.fmt(lo, 3), bx + 22, fr.T + fr.ph);
  }
  function trade(cv, rows, ax, ay, fid) {
    const k = K(), pts = rows.filter(r => isFinite(r.r[ax]) && isFinite(r.r[ay])); if (!pts.length) return; const lv = fid ? X.levels(pts, fid) : [null], groups = lv.map((l, i) => ({ name: l == null ? 'runs' : lname(fid, l), x: [], y: [], color: k.OKI[i % k.OKI.length], pts: true, line: false, r: 4 }));
    pts.forEach(r => { const gi = fid ? lv.indexOf(r.f[fid]) : 0; if (gi >= 0) { groups[gi].x.push(r.r[ax]); groups[gi].y.push(r.r[ay]); } });
    const P = X.pareto(pts, ax, ay).sort((a, b) => a.r[ax] - b.r[ax]); const ser = groups.filter(g => g.x.length).slice(0, 12).concat([{ name: 'best runs', x: P.map(r => r.r[ax]), y: P.map(r => r.r[ay]), color: '#222', line: true, pts: false }]);
    k.line(cv, ser, { h: 320, xt: rlabel(ax), yt: rlabel(ay) });
  }
  function oneRun(run) {
    const host = $('OneFigs'); if (!host || !run) return; host.innerHTML = ''; const sc = { id: 'exp', figs: ['yield', 'water', 'theta', 'crop', 'nbudget'] }, plan = DaisyFig.plan(sc, [run]);
    plan.forEach((f, i) => { const d = document.createElement('div'); d.className = 'dzpan dzfig'; d.innerHTML = '<b>' + esc(f.title) + '</b><p class="pnote">' + esc(f.note) + '</p>' + Array.from({ length: f.n }, (_, k) => '<div><canvas data-oc="' + i + '_' + k + '"></canvas></div>').join(''); host.appendChild(d); try { f.draw(Array.from(d.querySelectorAll('canvas')), run); } catch (e) { d.insertAdjacentHTML('beforeend', '<span class="pnote">not drawn: ' + esc(e.message) + '</span>'); } });
    if (!plan.length) host.innerHTML = '<span class="pnote">This run kept no logs the standard figures use. Choose "annual and daily ..." under Logs kept.</span>';
  }
  function report(resp) {
    const host = $('Res'), imgs = Array.from(host.querySelectorAll('.dzfig[data-xf]')).map(el => '<h2>' + el.querySelector('b').textContent + '</h2><p>' + el.querySelector('p').textContent + '</p>' + Array.from(el.querySelectorAll('canvas')).map(c => '<img src="' + c.toDataURL('image/png') + '" style="max-width:100%"><p style="font-size:12px;color:#555"><i>' + esc(c.dataset.cite || DaisyCite.caption('')) + '</i></p>').join('')).join('') + DaisyCite.refsHtml();
    const fids = st.fids || [], rows = st.rows, tab = '<table><tr><th>run</th>' + fids.map(f => '<th>' + esc(flabel(f)) + '</th>').join('') + X.RESP.map(r => '<th>' + esc(r.label) + '</th>').join('') + '</tr>' + rows.slice(0, 300).map(r => '<tr><td>' + esc(r.id) + '</td>' + fids.map(f => '<td>' + esc(r.f[f] === undefined ? '' : r.f[f]) + '</td>').join('') + X.RESP.map(q => '<td>' + (isFinite(r.r[q.id]) ? K().fmt(r.r[q.id], 3) : '') + '</td>').join('') + '</tr>').join('') + '</table>';
    D.download('daisy-experiment-report.html', '<!doctype html><meta charset="utf-8"><title>Daisy experiment</title><style>body{font:14px Segoe UI,Arial;max-width:1000px;margin:20px auto;padding:0 14px}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #ccc;padding:2px 6px}th{background:#eef1f5}h2{margin-top:26px}</style><h1>' + esc((st.res && st.res.plan.title) || 'Daisy experiment') + '</h1><p>' + esc(st.text) + '</p><p>' + rows.length + ' runs of Daisy 7.1.14' + (st.source === 'ens' ? ' (the published runs of the study)' : '') + '.</p>' + imgs + '<h2>All runs</h2>' + tab, 'text/html');
  }
  function bind() {
    $('Go').onclick = () => understand(); showSuggestions(); showChapters(); if (window.DaisyScenUI) window.DaisyScenUI.bindStrip();
    $('Ai').onchange = e => { $('Key').style.display = e.target.checked ? '' : 'none'; };
    document.querySelectorAll('[data-ex]').forEach(a => a.onclick = ev => { ev.preventDefault(); $('Text').value = EXAMPLES[+a.dataset.ex]; understand(); });
    $('Text').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) understand(); };
    if (st.res) renderPlan(); if (st.rows.length) drawResults();
  }
  window.DaisyExpUI = { runs: () => st.runs };
  D.register('exp', { html, bind });
})();
