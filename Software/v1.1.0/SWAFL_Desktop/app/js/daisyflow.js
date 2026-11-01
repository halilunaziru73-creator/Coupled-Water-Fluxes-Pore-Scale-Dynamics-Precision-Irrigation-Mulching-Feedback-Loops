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
    ['exp', 'Experiments', 'Design your own set of runs from the factors of the model, or load a ready one.'],
    ['scen', 'Scenarios', 'Or choose a ready-made question and run it.'],
    ['proc', 'Processes', 'See the processes behind the results.'],
    ['plot', 'Plot', 'Load your own files or use the output of your runs, then plot any quantity.'],
    ['balance', 'Mass balance', 'Check that inputs, outputs and content agree.'],
    ['compare', 'Compare and test', 'Compare two logs, two whole runs or many runs (Experiments, Scenarios, folders), blind or open.'],
    ['dss', 'To the SWAFL project', 'Take the results to the layers of the SWAFL project, which turn them into decisions.']
  ];
  const TOOLS = { manual: 'The SWAFL manual', editor: 'Set-up editor', build: 'Model builder', richards: 'Soil column', deni: 'Process curves', calib: 'Calibrate', docs: 'Model and documentation', refman: 'Reference manual', learn: 'Learn the Daisy files' };
  const F = { last: 'data' };
  window.DaisyFlow = F; F.PATH = PATH;
  const idx = t => PATH.findIndex(p => p[0] === t);
  // what to do on each tab, in three short steps (shown under the bar; Hide tips folds them for every tab)
  const HELP = {
    data: ['Choose the weather: built-in, a Daisy station, a file, or the online weather of your place.', 'Tick My soil and type your soil layers if you know them; otherwise the built-in soils are used.', 'Press Next.'],
    library: ['Look through the soils, crops and fertilisers Daisy knows.', 'Click one to read its values.', 'You can skip this step: press Next.'],
    scen: ['Pick the question closest to yours (water, nitrogen, climate, chemical or soil).', 'Press Run (in the desktop app Daisy runs on your computer).', 'Read the figures that appear, then press Next.'],
    exp: ['Write what you want to find out, or press Load this experiment on a ready one.', 'Check what changes and the values tested; remove or add rows.', 'Press Run all (desktop) or Save the experiment folder to run it anywhere.'],
    proc: ['Click a box of the process map (rain, soil water, roots, nitrogen...).', 'Read what Daisy does there and see its figures from your run.', 'Press Next to plot any quantity.'],
    plot: ['Load your Daisy logs or use the runs you just made.', 'Choose the quantity and the runs to plot.', 'Save the figure or the numbers.'],
    balance: ['Choose a run.', 'Read whether inputs, outputs and the change of content agree.', 'A large error means the set-up needs a look.'],
    compare: ['Choose two runs.', 'See where they differ by more than the smallest meaningful level.', 'Press Next to take the results to the SWAFL layers.'],
    dss: ['Read which SWAFL layer answers your question.', 'Press its button: the layer opens with your Daisy results.', 'Decide in the layer (decision table, reliability, nitrogen budget...).'],
    editor: ['Choose a Daisy set-up file, or open one from your computer.', 'Change the text; brackets and quotes are checked as you type.', 'Download it or run it (desktop).'],
    build: ['Choose the component and the model.', 'Fill in the values (the ticked rows must be given) and tick the logs you want.', 'Open it in the set-up editor, add it to your file, or save it.'],
    richards: ['Choose the soil layers and the weather.', 'Press Run the column.', 'Watch the water move down the profile day by day.'],
    deni: ['Choose a process (denitrification, N2O...).', 'Move the inputs.', 'Read how the response curve changes.'],
    calib: ['Load observed data and a run.', 'Choose the parameters to fit.', 'Press Calibrate and read the best values.'],
    refman: ['Click a chapter on the left, or search a word.', 'Read the models and every parameter.', 'Press Fill in a form for this model to build it without typing.'],
    manual: ['Search a word, or press a chapter.', 'Press a section: the manual opens at its page.', 'Every tab has its own Manual button on this bar.'],
    learn: ['Read the lessons in order: the folder, the grammar, then each file of the sample experiment.', 'Open any file in the set-up editor, or download the whole sample as a zip.', 'Load the results of the sample and compare its two runs.'],
    docs: ['Read what Daisy is and how to install it.', 'Follow the links to the papers and the code.', 'Come back to the guided path when ready.']
  };
  const tipsOff = () => { try { return localStorage.getItem('swafl.dz.tips') === 'off'; } catch (e) { return false; } };
  const tipLine = tab => { const h = HELP[tab]; if (!h) return ''; if (tipsOff()) return '<div class="dztips off"><a href="#" id="dzTipsOn">Show what to do here</a></div>'; return '<div class="dztips"><b>What to do here</b>' + h.map((t, i) => '<span><i>' + (i + 1) + '</i>' + esc(t) + '</span>').join('') + '<a href="#" id="dzTipsOff" title="Hide these tips on every tab">Hide tips</a></div>'; };
  // the tab buttons: the number of the step on the tabs of the guided path, and a sentence on what each tab is for
  const TIP = Object.assign({}, ...PATH.map(p => ({ [p[0]]: p[2] })), { manual: 'The manual of SWAFL inside the program: every section at its page.', learn: 'How a Daisy experiment is made, file by file, with a complete sample to download.', editor: 'Edit any Daisy set-up file (.dai) as text.', build: 'Build any Daisy model from a form: no typing in the Daisy language.', richards: 'A soil column solved with the Richards equation, without Daisy.', deni: 'Response curves of the processes of Daisy.', calib: 'Fit parameters to observed data.', refman: 'The Daisy reference manual, every model and parameter.', docs: 'What Daisy is, installation, papers.' });
  F.decorate = function () { document.querySelectorAll('.dztabs button[data-t]').forEach(b => { if (b.__dec) return; b.__dec = true; const t = b.dataset.t, i = idx(t); if (TIP[t]) b.title = TIP[t]; if (i >= 0) b.insertAdjacentHTML('afterbegin', '<span class="dzsn">' + (i + 1) + '</span>'); }); };
  // the bar above the tab: where you are, what to do, Back and Next
  F.bar = function (tab) { setTimeout(F.decorate, 0); return F.bar0(tab) + tipLine(tab); };
  const manB = tab => { const M = window.SWAFLManual, sx = M && M.idx ? M.forTab(tab) : null; return '<button class="btn" id="dzFMan" data-mp="' + (sx ? sx.page : 0) + '" title="' + esc(sx ? 'The manual: ' + sx.title + ', page ' + sx.page : 'The manual') + '">&#128214; Manual' + (sx ? ' p. ' + sx.page : '') + '</button>'; };
  F.bar0 = function (tab) {
    const i = idx(tab);
    if (i < 0) { const nm = TOOLS[tab] || tab; return '<div class="dzflow"><span class="dzstep">Tool</span><span class="dzwhat"><b>' + esc(nm) + '</b>: a tool outside the guided path.</span><span style="flex:1"></span>' + manB(tab) + '<button class="btn" id="dzFBackPath">Back to the guided path</button></div>'; }
    F.last = tab; const p = PATH[i], n = PATH.length;
    return '<div class="dzflow"><span class="dzstep">Step ' + (i + 1) + ' of ' + n + '</span><span class="dzwhat"><b>' + esc(p[1]) + '</b>: ' + esc(p[2]) + '</span><span style="flex:1"></span>' + manB(tab) + (i > 0 ? '<button class="btn" id="dzFBack">&#9664; Back: ' + esc(PATH[i - 1][1]) + '</button>' : '') + (i < n - 1 ? '<button class="btn pri" id="dzFNext">Next: ' + esc(PATH[i + 1][1]) + ' &#9654;</button>' : '<button class="btn pri" id="dzFOpen" title="Open the layer of the SWAFL project that matches your question">Open in the SWAFL project &#9654;</button>') + '</div>';
  };
  F.bind = function (tab) {
    const i = idx(tab), go = id => D.show(id), el = id => document.getElementById(id);
    if (el('dzFBack')) el('dzFBack').onclick = () => go(PATH[i - 1][0]); if (el('dzFNext')) el('dzFNext').onclick = () => go(PATH[i + 1][0]);
    const set = v => { try { localStorage.setItem('swafl.dz.tips', v); } catch (e) { } go(tab); };
    if (el('dzTipsOff')) el('dzTipsOff').onclick = e => { e.preventDefault(); set('off'); }; if (el('dzTipsOn')) el('dzTipsOn').onclick = e => { e.preventDefault(); set('on'); };
    if (el('dzFMan')) el('dzFMan').onclick = () => { if (window.SWAFLManual) window.SWAFLManual.open(+el('dzFMan').dataset.mp || 0); };
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
      L.scenario = sc.id; L.theme = sc.theme || (SC.LIST.find(x => x.id === sc.id) || {}).theme || ''; L.title = sc.title || sc.id; L.label = 'weather ' + wx + '; soil ' + soilName + '; years ' + o.start + ' to ' + o.stop; L.soil = SOILMAP[String(o.soil)] || null; L.when = new Date().toISOString();
      const chem = sc.id === 'chemical' || sc.theme === 'Chemicals'; ok.forEach(r => { const get = n => window.DaisySum.fromLog(r.logs[n]); const s = window.DaisySum.summarise(get, chem || !!r.logs['Annual-Tracer'] && !!(r.options && (r.options.chem || r.options.koc || r.options.half))); L.runs[r.id] = s; const op = r.options || {}; L.meta[r.id] = { label: r.label, sc: sc.title || sc.id, theme: sc.theme || '', chem: op.chem ? String(op.chem).split('|')[0] : (op.koc || op.half ? 'tracer K_OC ' + (op.koc || 0) + ', half-life ' + (op.half || 0) + ' d' : ''), irrig: String(op.irrig), nfac: op.nfac, precip: op.precip, temp: op.temp }; });
      F.push();
    } catch (e) { console.warn('the runs could not be passed to the SWAFL project:', e); }
  };
  F.push = function () { try { const w = (typeof E !== 'undefined') && E.win; if (w) { w.DAISYLIVE = { label: F.live.label, runs: F.live.runs, meta: F.live.meta, soil: F.live.soil }; if (typeof w.refresh === 'function') w.refresh(); } } catch (e) { } };
  // the layer that answers the question you ran last
  const MATCH = { irrigation: [['dsum', 'Daisy decision table', 'Yield, water and nitrate of the rainfed and irrigated crops, answer by answer, with the gain of irrigation on every soil.'], ['dwb', 'Daisy water balance', 'Where the rain and the irrigation go: evapotranspiration, drainage, runoff, water productivity, every run side by side.'], ['dyr', 'Yield risk and limiting factor', 'How likely each yield is, and whether water or nitrogen limits it.'], ['yby', 'Reliability over 20 seasons', 'How steady the irrigation need and the yield are from year to year.'], ['wb2', 'Full water balance', 'Every term of the water balance, season by season.'], ['v1', 'Sensor and trigger', 'The trigger that starts the irrigation.']],
    nitrogen: [['dsum', 'Daisy decision table', 'What half the fertiliser or 30 per cent more does to yield and to nitrate.'], ['dnb', 'Daisy nitrogen balance', 'Nitrogen in and out, use efficiency, surplus and losses, every run side by side.'], ['dyr', 'Yield risk and limiting factor', 'Water stress against nitrogen stress, season by season.'], ['nb', 'Nitrogen budget', 'Supply, uptake and losses of nitrogen, season by season.']],
    climate: [['dsum', 'Daisy decision table', 'Warmer, drier and wetter climates side by side.'], ['dyr', 'Yield risk and limiting factor', 'How the bad seasons change with the climate.'], ['dwb', 'Daisy water balance', 'Evapotranspiration and drainage in each climate.'], ['yby', 'Reliability over 20 seasons', 'The spread between seasons.']],
    chemical: [['chem', 'Chemical fate (Daisy runs)', 'Decay, crop uptake, leaching, runoff and what stays in the soil, with the ranking of the soils.']],
    soil: [['v7', 'Soil hydraulic drivers', 'How the soil holds and moves water.'], ['v2', 'Profile evolution', 'Water through the soil profile in the season.'], ['dsum', 'Daisy decision table', 'The same questions on each soil of the project.']],
    own: [['dsum', 'Daisy decision table', 'The runs of your own set-up next to the bundled ones, when their names match.']] };
  // the layers that read the Daisy runs, and the questions each one answers
  const DL = [['dsum', 'D1 Decision table', 'What irrigation, nitrogen and climate do to yield, water and nitrate, answer by answer.', r => r.harvest], ['dwb', 'D2 Water balance', 'Rain and irrigation against evapotranspiration, drainage and runoff; water productivity.', r => r.P], ['dnb', 'D3 Nitrogen balance', 'Fertiliser, deposition and mineralisation against uptake, leaching, denitrification and ammonia.', r => r.Nup], ['dyr', 'D4 Yield risk and limiting factor', 'How likely each yield is; water stress against nitrogen stress.', r => r.harvest],
    ['dchx', 'D5 Chemicals and drinking water', 'The share of a pesticide, PFAS or tracer that leaves the root zone and its concentration against 0.1 µg/L.', r => r.chem], ['dtrd', 'D6 Trade-offs and the best edge', 'Yield against nitrate, water and N2O for every run; the Pareto front and a ranking with your weights.', r => r.harvest && r.NL], ['dirr', 'D7 The return of irrigation', 'Yield response to irrigation, the amount that pays at your price ratio and where each millimetre goes.', r => r.I], ['dghg', 'D8 Nitrous oxide and gaseous nitrogen', 'N2O from nitrification and denitrification, ammonia, the emission factor and CO2-equivalents.', r => r.N2O], ['chem', 'C2 Chemical fate', 'Decay, uptake, leaching, runoff and what stays in the soil, season by season.', r => r.chem]];
  const THEME = { Water: ['dirr', 'dwb', 'dtrd', 'dyr', 'dsum'], Nitrogen: ['dnb', 'dghg', 'dtrd', 'dyr', 'dsum'], Soil: ['dwb', 'dnb', 'dtrd', 'v7', 'v2'], 'Crop and climate': ['dyr', 'dwb', 'dtrd', 'dsum', 'yby'], Chemicals: ['dchx', 'chem', 'dwb'], Experiment: ['dtrd', 'dwb', 'dnb', 'dyr', 'dghg'] };
  F.suggest = () => { const sc = F.live.scenario, sco = SC.LIST.find(x => x.id === sc), th = F.live.theme || (sco && sco.theme); return th && THEME[th] ? THEME[th][0] : (MATCH[sc] || MATCH.irrigation)[0][0]; };
  const close = () => { try { UI.closeModal(); } catch (e) { } };
  F.toLayer = function (id) {
    try { if (F.live.soil && typeof E !== 'undefined' && E.win && E.win.applyState) E.win.applyState({ soil: F.live.soil }); } catch (e) { }
    F.push(); close(); setTimeout(() => { try { Layers.open(id); } catch (e) { UI.log('SWAFL project: ' + e.message); } }, 150);
  };
  // ---------------------------------------------------------------- the last tab
  function html() {
    const L = F.live, ks = Object.keys(L.runs), have = ks.length, th = L.theme, sugg = th && THEME[th] ? THEME[th] : [], LG = (typeof Layers !== 'undefined' && Layers.GROUPS) || [];
    let h = '<h3 style="margin:2px 0 6px">Take the results to the SWAFL project</h3><p class="pnote">Daisy calculates; the SWAFL project decides. The layers below read your Daisy runs and turn them into decisions for the field: a table of answers, a balance, a risk, a limit, a trade-off. ' + (have ? 'The ' + have + ' run' + (have === 1 ? '' : 's') + ' made in this session ' + (have === 1 ? 'is' : 'are') + ' passed to the layers (last: <b>' + esc(L.title || L.scenario || '') + '</b>; ' + esc(L.label) + ').' : 'You have not run anything yet: run a question in <a href="#" data-goto="scen">Scenarios</a> or an experiment in <a href="#" data-goto="exp">Experiments</a>; every run is passed on.') + '</p>';
    // 1 the layers of the Daisy runs
    h += '<div class="dzthm"><b>Layers that read your Daisy runs</b> <span class="pnote">' + DL.length + ' layers · the number is how many of your runs each one can show</span></div><div class="dzcards">' + DL.map(d => { const n = ks.filter(k => { try { return !!d[3](L.runs[k]); } catch (e) { return false; } }).length, on = sugg.indexOf(d[0]) >= 0; return '<div class="dzpan" style="margin:0;' + (on ? 'border:2px solid #1E8E3E' : '') + '"><div class="dzrow" style="margin:0"><b>' + esc(d[1]) + '</b><span style="flex:1"></span><span class="dzchip" style="background:' + (n ? '#1E8E3E' : '#9aa3ad') + ';color:#fff">' + n + ' run' + (n === 1 ? '' : 's') + '</span></div><div class="pnote" style="font-size:12px;margin:4px 0">' + esc(d[2]) + (on ? ' <b style="color:#1E8E3E">Answers your last question.</b>' : '') + '</div><button class="btn' + (on || n ? ' pri' : '') + '" data-layer="' + d[0] + '">Open ' + esc(d[1].replace(/^\w+\s/, '')) + ' &#9654;</button></div>'; }).join('') + '</div>';
    // 2 which layers answer which kind of question
    h += '<div class="dzthm"><b>Which layer answers which question</b></div><div class="dzcards">' + Object.keys(THEME).map(t => '<div class="dzpan" style="margin:0"><h4 style="margin:0 0 4px">' + esc(t) + (t === th ? ' <span class="pnote" style="color:#1E8E3E">(your last run)</span>' : '') + '</h4>' + THEME[t].map(id => { const d = DL.find(x => x[0] === id), nm = d ? d[1] : (typeof Layers !== 'undefined' ? Layers.nameOf(id) : id); return '<div style="margin:3px 0"><button class="btn" data-layer="' + id + '">' + esc(nm) + ' &#9654;</button></div>'; }).join('') + '<div class="pnote" style="font-size:11.5px">Questions: ' + esc(SC.LIST.filter(x => x.theme === t).map(x => x.title.replace(/[?:].*$/, '')).join(' · ') || (t === 'Experiment' ? 'your own designs in Experiments' : '')) + '</div></div>').join('') + '</div>';
    // 3 every layer of the SWAFL project
    h += '<div class="dzthm"><b>Every layer of the SWAFL project</b> <span class="pnote">' + LG.reduce((a, g) => a + g.items.length, 0) + ' layers in ' + LG.length + ' groups · they use the same soil and the weather of the project; the layers above use your Daisy runs</span></div><div class="dzcards">' + LG.map(g => '<div class="dzpan" style="margin:0"><h4 style="margin:0 0 4px">' + esc(g.name) + '</h4>' + g.items.map(it => '<div style="margin:2px 0"><button class="btn" data-layer="' + it[0] + '" style="text-align:left">' + (it[2] ? '<b>' + esc(it[2]) + '</b> ' : '') + esc(it[1]) + ' &#9654;</button></div>').join('') + '</div>').join('') + '</div>';
    h += '<div class="dzpan"><h4 style="margin:0 0 4px">The weather of the SWAFL project</h4><p class="pnote">The SWAFL project has its own weather (benchmark, a file of yours, or online weather of a place). In the weather strip of Scenarios, Experiments and Processes choose <i>Weather of the SWAFL project</i> to run Daisy on the same record, or bring online weather into both in <a href="#" data-goto="weather">Weather stations</a>.</p></div>';
    h += '<p class="pnote">After the SWAFL layers you can return here at any time: the Daisy model group of the Layers panel opens every tab of this workbench and every layer above.</p>';
    return h;
  }
  function bind() { document.querySelectorAll('#dzBody [data-layer]').forEach(b => b.onclick = () => F.toLayer(b.dataset.layer)); document.querySelectorAll('#dzBody [data-goto]').forEach(a => a.onclick = e => { e.preventDefault(); D.show(a.dataset.goto); }); }
  D.register('dss', { html, bind });
  const css = '.dzthm{margin:10px 0 0;padding:3px 8px;border-left:4px solid #1B3A6B;background:#eef3fa;font-size:13px}.dzflow{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:6px 10px;margin:0 0 8px;background:#eef3fa;border:1px solid #c3d0e4;border-radius:6px}.dzstep{background:#1B3A6B;color:#fff;border-radius:11px;padding:2px 10px;font-size:12px;white-space:nowrap}.dzwhat{font-size:13px;flex:1 1 280px}.dzcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin:8px 0}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
})();
