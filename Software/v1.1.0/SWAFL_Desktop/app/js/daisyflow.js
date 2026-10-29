/* Daisy workbench: the guided path and the hand-over to the SWAFL project.
   A Back and Next bar leads through the steps in the order of the work (your data, the question, the results, the plots), and the last step
   takes the results to the layers of the SWAFL project, which turn them into decisions for the field. The runs you have just made are passed to
   those layers (window.DAISYLIVE in the engine), so the layers show your weather and your soil instead of the bundled runs. */
'use strict';
(() => {
  const D = DaisyUI, esc = D.esc, SC = window.DaisyScen;
  // the steps of the path, with one plain sentence each; the tools (Build and test, Learn) are outside the path
  const PATH = [
    ['data', 'My data and weather', 'Set the weather and the soil of your site once, or look at a weather station or bring online weather of any place. Every simulation uses them.'],
    ['library', 'Library', 'Browse the soils, crops, fertilisers and chemicals of Daisy (you can skip this step).'],
    ['scen', 'Scenarios', 'Choose a question and run it.'],
    ['exp', 'Experiments', 'Or design your own set of runs from the factors of the model.'],
    ['proc', 'Processes', 'See the processes behind the results.'],
    ['plot', 'Plot', 'Load your own files or use the output of your runs, then plot any quantity.'],
    ['balance', 'Mass balance', 'Check that inputs, outputs and content agree.'],
    ['compare', 'Compare and test', 'Compare two runs against the smallest meaningful level.'],
    ['dss', 'To the SWAFL project', 'Take the results to the layers of the SWAFL project, which turn them into decisions.']
  ];
  const TOOLS = { editor: 'Set-up editor', richards: 'Soil column', deni: 'Process curves', calib: 'Calibrate', docs: 'Model and documentation' };
  const F = { last: 'data' };
  window.DaisyFlow = F; F.PATH = PATH;
  const idx = t => PATH.findIndex(p => p[0] === t);
  // the bar above the tab: where you are, what to do, Back and Next
  F.bar = function (tab) {
    const i = idx(tab);
    if (i < 0) { const nm = TOOLS[tab] || tab; return '<div class="dzflow"><span class="dzstep">Tool</span><span class="dzwhat"><b>' + esc(nm) + '</b>: a tool outside the guided path.</span><span style="flex:1"></span><button class="btn" id="dzFBackPath">Back to the guided path</button></div>'; }
    F.last = tab; const p = PATH[i], n = PATH.length;
    return '<div class="dzflow"><span class="dzstep">Step ' + (i + 1) + ' of ' + n + '</span><span class="dzwhat"><b>' + esc(p[1]) + '</b>: ' + esc(p[2]) + '</span><span style="flex:1"></span>' + (i > 0 ? '<button class="btn" id="dzFBack">&#9664; Back: ' + esc(PATH[i - 1][1]) + '</button>' : '') + (i < n - 1 ? '<button class="btn pri" id="dzFNext">Next: ' + esc(PATH[i + 1][1]) + ' &#9654;</button>' : '<button class="btn pri" id="dzFOpen" title="Open the layer of the SWAFL project that matches your question">Open in the SWAFL project &#9654;</button>') + '</div>';
  };
  F.bind = function (tab) {
    const i = idx(tab), go = id => D.show(id), el = id => document.getElementById(id);
    if (el('dzFBack')) el('dzFBack').onclick = () => go(PATH[i - 1][0]); if (el('dzFNext')) el('dzFNext').onclick = () => go(PATH[i + 1][0]);
    if (el('dzFBackPath')) el('dzFBackPath').onclick = () => go(F.last || 'data'); if (el('dzFOpen')) el('dzFOpen').onclick = () => F.toLayer(F.suggest());
  };
  // ---------------------------------------------------------------- the runs of the workbench, passed on to the layers
  const SOILMAP = { loam: 'S06_Loam', sand: 'S03_Sand', 'usda:sand': 'S03_Sand', 'usda:loamysand': 'S04_LoamySand', 'usda:sandyloam': 'S05_SandyLoam', 'usda:loam': 'S06_Loam', 'usda:siltloam': 'S07_SiltLoam', 'usda:sandyclayloam': 'S08_SandyClayLoam', 'usda:clayloam': 'S09_ClayLoam', 'usda:siltyclayloam': 'S10_SiltyClayLoam' };
  F.live = { scenario: null, label: '', soil: null, runs: {}, meta: {}, when: null };
  F.publish = function (sc, runs) {
    try {
      const L = F.live, ok = runs.filter(r => r && r.logs && r.logs['Annual-Harvest']); if (!ok.length) return;
      const o = ok[0].options || {}, wx = o.userWx ? o.userWx.name + ' ' + o.userWx.first + ' to ' + o.userWx.last : ((SC.station(o.station || 'course') || {}).label || 'built-in weather');
      const soilName = o.userSoil && o.soil !== 'user' ? String(o.soil) : o.userSoil ? 'your own soil table' : String(o.soil || 'loam');
      L.scenario = sc.id; L.label = 'weather ' + wx + '; soil ' + soilName + '; years ' + o.start + ' to ' + o.stop; L.soil = SOILMAP[String(o.soil)] || null; L.when = new Date().toISOString();
      ok.forEach(r => { const get = n => window.DaisySum.fromLog(r.logs[n]); const s = window.DaisySum.summarise(get, sc.id === 'chemical'); L.runs[r.id] = s; L.meta[r.id] = { irrig: String(r.options && r.options.irrig), nfac: r.options && r.options.nfac, precip: r.options && r.options.precip, temp: r.options && r.options.temp }; });
      F.push();
    } catch (e) { console.warn('the runs could not be passed to the SWAFL project:', e); }
  };
  F.push = function () { try { const w = (typeof E !== 'undefined') && E.win; if (w) { w.DAISYLIVE = { label: F.live.label, runs: F.live.runs, meta: F.live.meta, soil: F.live.soil }; if (typeof w.refresh === 'function') w.refresh(); } } catch (e) { } };
  // the layer that answers the question you ran last
  const MATCH = { irrigation: [['dsum', 'Daisy decision table', 'Yield, water and nitrate of the rainfed and irrigated crops, answer by answer, with the gain of irrigation on every soil.'], ['yby', 'Reliability over 20 seasons', 'How steady the irrigation need and the yield are from year to year.'], ['wb2', 'Full water balance', 'Every term of the water balance, season by season.'], ['v1', 'Sensor and trigger', 'The trigger that starts the irrigation.']],
    nitrogen: [['dsum', 'Daisy decision table', 'What half the fertiliser or 30 per cent more does to yield and to nitrate.'], ['nb', 'Nitrogen budget', 'Supply, uptake and losses of nitrogen, season by season.']],
    climate: [['dsum', 'Daisy decision table', 'Warmer, drier and wetter climates side by side.'], ['yby', 'Reliability over 20 seasons', 'The spread between seasons.']],
    chemical: [['chem', 'Chemical fate (Daisy runs)', 'Decay, crop uptake, leaching, runoff and what stays in the soil, with the ranking of the soils.']],
    soil: [['v7', 'Soil hydraulic drivers', 'How the soil holds and moves water.'], ['v2', 'Profile evolution', 'Water through the soil profile in the season.'], ['dsum', 'Daisy decision table', 'The same questions on each soil of the project.']],
    own: [['dsum', 'Daisy decision table', 'The runs of your own set-up next to the bundled ones, when their names match.']] };
  F.suggest = () => { const sc = F.live.scenario; return (MATCH[sc] || MATCH.irrigation)[0][0]; };
  const close = () => { try { UI.closeModal(); } catch (e) { } };
  F.toLayer = function (id) {
    try { if (F.live.soil && typeof E !== 'undefined' && E.win && E.win.applyState) E.win.applyState({ soil: F.live.soil }); } catch (e) { }
    F.push(); close(); setTimeout(() => { try { Layers.open(id); } catch (e) { UI.log('SWAFL project: ' + e.message); } }, 150);
  };
  // ---------------------------------------------------------------- the last tab
  function html() {
    const L = F.live, have = Object.keys(L.runs).length, sc = L.scenario, cards = [['irrigation', 'Irrigation: does it pay off?'], ['nitrogen', 'Nitrogen: how much fertiliser?'], ['climate', 'Climate: warmer, drier or wetter'], ['chemical', 'A chemical: sorption and degradation'], ['soil', 'Soil: how much does texture matter?']];
    let h = '<h3 style="margin:2px 0 6px">Take the results to the SWAFL project</h3><p class="pnote">Daisy calculates; the SWAFL project decides. Each layer below reads the same weather and soil as your Daisy runs and turns the results into a decision for the field: a table of answers, a budget, a risk, a design. ' + (have ? 'The runs you made in this session are passed to the layers, so they show your weather and your soil: <b>' + esc(L.label) + '</b>.' : 'You have not run a question yet, so the layers show the Daisy runs that come with the program, made on every soil of the project with the Taastrup weather. Run a question in <a href="#" data-goto="scen">Scenarios</a> to use your own weather and soil.') + '</p>';
    h += '<div class="dzcards">' + cards.map(c => { const ran = sc === c[0]; return '<div class="dzpan" style="margin:0"><h4 style="margin:0 0 4px">' + esc(c[1]) + '</h4><div class="pnote" style="margin-bottom:6px">' + (ran ? '<b style="color:#1E8E3E">You ran this question.</b>' : 'Not run yet: run it in Scenarios first.') + '</div>' + MATCH[c[0]].map(m => '<div style="margin:4px 0"><button class="btn' + (ran ? ' pri' : '') + '" data-layer="' + m[0] + '">' + esc(m[1]) + ' &#9654;</button><div class="pnote" style="font-size:12px">' + esc(m[2]) + '</div></div>').join('') + '</div>'; }).join('') + '</div>';
    h += '<div class="dzpan"><h4 style="margin:0 0 4px">The weather of the SWAFL project</h4><p class="pnote">The SWAFL project has its own weather (benchmark, a file of yours, or online weather of a place). In the weather strip of Scenarios, Experiments and Processes choose <i>Weather of the SWAFL project</i> to run Daisy on the same record, or bring online weather into both in <a href="#" data-goto="weather">Weather stations</a>.</p></div>';
    h += '<p class="pnote">After the SWAFL layers you can return here at any time: the Daisy model group of the Layers panel opens every tab of this workbench.</p>';
    return h;
  }
  function bind() { document.querySelectorAll('#dzBody [data-layer]').forEach(b => b.onclick = () => F.toLayer(b.dataset.layer)); document.querySelectorAll('#dzBody [data-goto]').forEach(a => a.onclick = e => { e.preventDefault(); D.show(a.dataset.goto); }); }
  D.register('dss', { html, bind });
  const css = '.dzflow{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 10px;margin:0 0 8px;background:#eef3fa;border:1px solid #c3d0e4;border-radius:6px}.dzstep{background:#1B3A6B;color:#fff;border-radius:11px;padding:2px 10px;font-size:12px;white-space:nowrap}.dzwhat{font-size:13px;flex:1 1 280px}.dzcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin:8px 0}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
