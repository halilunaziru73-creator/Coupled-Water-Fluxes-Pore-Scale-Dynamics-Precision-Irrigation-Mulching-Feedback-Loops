/* SWAFL workbench: actions, menus, toolbar, history, project files, help, start-up. */
'use strict';
const REPO = 'https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops';
const DOCS = REPO + '/tree/main/Software/v1.1.0/SWAFL_Desktop';
const VERSION = '1.1.0';

/* ---------- undo / redo of settings ---------- */
const Hist = { stack: [], i: -1, busy: false };
function histPush(s) {
  if (Hist.busy) return; const j = JSON.stringify({ state: s.state, year: s.year, date: s.date });
  if (Hist.stack[Hist.i] === j) return; Hist.stack = Hist.stack.slice(0, Hist.i + 1); Hist.stack.push(j); if (Hist.stack.length > 120) Hist.stack.shift(); Hist.i = Hist.stack.length - 1;
}
function histApply(j) { const o = JSON.parse(j); Hist.busy = true; E.set(o.state); E.setMulch(o.state.mulchType); if (o.year) E.setYear(o.year); setTimeout(() => { Hist.busy = false; }, 800); }

/* ---------- actions (menus, toolbar and toolbox all call these) ---------- */
const Act = {
  newProject() { E.reset(); Hist.stack = []; Hist.i = -1; histPush(E.snap); setName('Untitled project'); UI.log('New project: settings reset to default'); Layers.open('field'); },
  async openProject() {
    const f = await UI.pickFileText(); if (!f) return;
    try { const o = JSON.parse(f.data); if (o.app !== 'SWAFL') throw new Error('not a SWAFL project'); E.set(o.state); E.setMulch(o.state.mulchType); if (o.year) E.setYear(o.year); if (o.date) E.setDate(o.date); Layers.open(o.scene || 'field'); setName(f.name); UI.log('Opened project ' + f.name); }
    catch (e) { UI.log('Could not open project: ' + e.message, 'err'); UI.modal({ title: 'Open project', html: '<p>This file is not a SWAFL project file.</p>' }); }
  },
  saveProject() { const s = E.snap; const o = { app: 'SWAFL', version: VERSION, saved: new Date().toISOString(), scene: s.scene, state: s.state, year: s.year, date: s.date }; UI.saveFile('SWAFL_project.swafl', JSON.stringify(o, null, 2), false, 'application/json').then(ok => { if (ok) setName('SWAFL_project.swafl'); }); },
  exportPNG() { const d = E.canvasPNG(); if (!d) return; UI.saveFile('SWAFL_' + E.snap.scene + '.png', d.split(',')[1], true, 'image/png'); },
  exportSeasonCSV() {
    const S = E.season(); if (!S) return; const s = E.snap.state;
    let c = '# SWAFL yearly results\n# soil=' + s.soil + ', tillage=' + s.till + ', crop=' + s.crop + ', mulch=' + s.mulchType + ', method=' + s.method + '\nYear,Rain_mm,Irrigation_mm,Drainage_mm,Evaporation_mm,Transpiration_mm\n';
    S.yI.forEach((_, i) => { c += [i + 1, S.yR[i], S.yI[i], S.yD[i], S.yE[i], S.yT[i]].map(v => typeof v === 'number' ? +v.toFixed(2) : v).join(',') + '\n'; });
    UI.saveFile('SWAFL_yearly_results.csv', c, false, 'text/csv');
  },
  exportDesignCSV() {
    const R = E.design(E.snap.scene); if (!R) { UI.toast('Open a design layer first'); return; }
    let c = 'Quantity,Value\n'; Object.keys(R).forEach(k => { c += k + ',' + (typeof R[k] === 'number' ? +R[k].toFixed(4) : R[k]) + '\n'; });
    UI.saveFile('SWAFL_design_' + E.snap.scene + '.csv', c, false, 'text/csv');
  },
  print() { E.print(); },
  // the whole report, every layer, built end to end and saved where the user chooses
  // first the user ticks the layers to put in the report (all are ticked to start with)
  report() {
    const w = E.win; if (!w || typeof w.buildReport !== 'function') { UI.toast('The report is not available yet'); return; }
    const G = Layers.GROUPS.map(g => [g.name, g.items.map(it => [it[0], it[1]])]);
    const html = '<p>Tick the layers to save in the PDF. Each layer gets your inputs, its key numbers and its full drawing; long drawings continue on the next pages.</p>' +
      '<label class="rpall"><input type="checkbox" id="rpAll" checked> <b>All layers</b></label><div class="rpgrid">' +
      G.map(([gn, its], gi) => '<div class="rpg"><label><input type="checkbox" class="rpG" data-g="' + gi + '" checked> <b>' + UI.esc(gn) + '</b></label>' + its.map(([id, nm]) => '<label class="rpi"><input type="checkbox" class="rpI" data-g="' + gi + '" value="' + id + '" checked> ' + UI.esc(nm) + '</label>').join('') + '</div>').join('') + '</div><div id="rpCount" class="pnote"></div>';
    const root = UI.modal({ title: 'Save report as PDF', icon: 'print', width: 'min(760px,96vw)', html, buttons: [{ label: 'Make the PDF', pri: true, act: () => { const ids = [...root.querySelectorAll('.rpI:checked')].map(b => b.value); if (!ids.length) { root.querySelector('#rpCount').textContent = 'Tick at least one layer.'; return false; } setTimeout(() => Act.reportBuild(ids), 30); } }, { label: 'Cancel' }] });
    const I = () => [...root.querySelectorAll('.rpI')], cnt = () => { const n = I().filter(b => b.checked).length; root.querySelector('#rpCount').textContent = n + ' of ' + I().length + ' layers ticked'; root.querySelector('#rpAll').checked = n === I().length; root.querySelectorAll('.rpG').forEach(g => { const m = I().filter(b => b.dataset.g === g.dataset.g); g.checked = m.every(b => b.checked); g.indeterminate = !g.checked && m.some(b => b.checked); }); };
    root.querySelector('#rpAll').addEventListener('change', e => { I().forEach(b => { b.checked = e.target.checked; }); cnt(); });
    root.querySelectorAll('.rpG').forEach(g => g.addEventListener('change', () => { I().filter(b => b.dataset.g === g.dataset.g).forEach(b => { b.checked = g.checked; }); cnt(); }));
    I().forEach(b => b.addEventListener('change', cnt)); cnt();
  },
  reportBuild(ids) {
    const w = E.win, keep = E.snap ? E.snap.scene : 'field';
    const all = E.json('SCENES.map(function(s){return s.id})') || []; ids = all.filter(id => ids.includes(id));
    UI.modal({ title: 'Full report (PDF)', icon: 'print', html: '<p><b>Building the report: ' + ids.length + ' layer' + (ids.length === 1 ? '' : 's') + ', with your inputs, the results at these inputs and the key numbers and pictures of every layer.</b></p><p>This takes a few seconds. You choose where to save it when it is ready.</p>', buttons: [] });
    UI.log('Building the full report (' + ids.length + ' layers)');
    setTimeout(async () => {
      let bytes = null, err = null;
      try { w.__REPORTING = true; const t0 = performance.now(); bytes = w.buildReport(ids, (ids.length === all.length ? 'Full report, ' : 'Report, ') + (E.snap ? E.snap.dateLbl : '')); UI.log('Report built: ' + Math.round(bytes.length / 1024) + ' kB in ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s'); }
      catch (e) { err = e; } finally { w.__REPORTING = false; try { E.scene(keep); } catch (e2) {} }
      UI.closeModal && UI.closeModal(); document.getElementById('modalRoot').innerHTML = '';
      if (err || !bytes) { UI.log('Report failed: ' + (err ? err.message : 'no data'), 'err'); UI.modal({ title: 'Full report', html: '<p>The report could not be built: ' + UI.esc(err ? err.message : 'no data') + '</p>' }); return; }
      const soil = E.snap && E.snap.state ? E.snap.state.soil.replace(/^S\d+_/, '') : 'field', nm = 'SWAFL_full_report_' + soil + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
      try { const r = await w.saveBytes(nm, bytes, 'application/pdf'); if (r && r.ok === false) UI.log('Report not saved (cancelled)', 'warn'); else { UI.log('Full report saved' + (r && r.path ? ': ' + r.path : '')); UI.toast('Full report saved'); } } catch (e) { UI.log('Could not save the report: ' + e.message, 'err'); }
    }, 80);
  },
  reportChoose() { Act.report(); },
  manual() { if (window.swafl && window.swafl.openManual) { window.swafl.openManual(); return; } window.open(window.SWAFL_MANUAL_URL || '../docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf', '_blank'); },
  undo() { if (Hist.i > 0) { Hist.i--; histApply(Hist.stack[Hist.i]); } },
  redo() { if (Hist.i < Hist.stack.length - 1) { Hist.i++; histApply(Hist.stack[Hist.i]); } },
  resetSettings() { E.reset(); UI.log('Settings reset to default'); },
  copySettings() { const t = JSON.stringify(E.snap.state, null, 2); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => UI.toast('Settings copied'), () => UI.modal({ title: 'Settings', html: '<pre>' + UI.esc(t) + '</pre>' })); },
  togglePlay() { E.togglePlay(); UI.log(E.snap && E.snap.playOn ? 'Run paused' : 'Run started'); },
  restart() { E.restart(); UI.log('Season restarted'); },
  runSeason() { Dash.tab('charts'); UI.log('Ran the 20-year season simulation'); },
  preset(v) { E.preset(v); const p = E.metaData.presets.find(x => x[0] === String(v)); UI.log('Ready-made case: ' + (p ? p[1] : v)); },
  optimise() { Layers.open('sid'); setTimeout(() => { const ok = E.optimiseSurface(); UI.log(ok ? 'Surface layout optimised' : 'Optimiser not available', ok ? 'info' : 'warn'); UI.toast(ok ? 'Best surface layout applied' : 'Optimiser not available'); Dash.tab('design'); }, 350); },
  refresh() { E.redraw(); Layers.render(); Props.update(E.snap); Dash.render(); UI.log('View refreshed'); UI.toast('Refreshed'); },
  reloadEngine() { UI.log('Reloading simulation engine...'); document.getElementById('loading').classList.remove('gone'); E.ready = false; document.getElementById('engine').contentWindow.location.reload(); boot(true); },
  guide() { guideModal(); }, shortcuts() { shortcutsModal(); }, about() { aboutModal(); },
  github() { UI.openExternal(REPO); }, docs() { UI.openExternal(DOCS); }, issues() { UI.openExternal(REPO + '/issues'); },
  exit() { if (window.swafl) window.swafl.quit(); else window.close(); },
  fullscreen() { if (window.swafl) window.swafl.toggleFullscreen(); else if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); },
  toggle(id, ...extra) { const el = document.getElementById(id); el.hidden = !el.hidden; el.style.display = el.hidden ? 'none' : ''; extra.forEach(x => { document.getElementById(x).style.display = el.hidden ? 'none' : ''; }); },
  focus() { document.body.classList.toggle('focus'); setTimeout(() => E.ev('window.__fit&&window.__fit()'), 60); UI.toast(document.body.classList.contains('focus') ? 'Focus view: press F9 to bring the panels back' : 'Panels restored'); },
  fit(m) { Act.fitMode = m; E.setFit(m); UI.log(m === 'window' ? 'Drawing fitted to the window' : 'Drawing at full width (scroll)'); },
  fitMode: 'window',
  focusSearch() { document.getElementById('tbSearch').focus(); }
};
function setName(n) { document.getElementById('projName').textContent = n; }
const vis = id => !document.getElementById(id).hidden;

/* ---------- menus ---------- */
const casesMenu = () => (E.metaData ? E.metaData.presets.filter(p => p[0] !== '').map(p => ({ label: p[1], act: () => Act.preset(p[0]) })) : []);
const MENUS = [
  { label: 'File', items: () => { return [
    { label: 'Import weather data (CSV, Excel, DWF, DLF, DAI)...', icon: 'open', act: () => WxUI.importFile() }, { label: 'Online weather for a location...', icon: 'search', act: () => WxUI.online() }, { sep: 1 }, { label: 'New project', icon: 'new', key: 'Ctrl+N', act: Act.newProject }, { label: 'Open project...', icon: 'open', key: 'Ctrl+O', act: Act.openProject }, { label: 'Save project...', icon: 'save', key: 'Ctrl+S', act: Act.saveProject }, { sep: 1 },
    { label: 'Export', icon: 'img', sub: [{ label: 'Picture of the window (PNG)', icon: 'img', key: 'Ctrl+E', act: Act.exportPNG }, { label: 'Yearly results (CSV)', icon: 'csv', act: Act.exportSeasonCSV }, { label: 'Design results (CSV)', icon: 'csv', act: Act.exportDesignCSV }] },
    { label: 'Save report as PDF (choose the layers)...', icon: 'print', key: 'Ctrl+Shift+P', act: Act.report }, { label: 'Print / save this view as PDF...', icon: 'print', key: 'Ctrl+P', act: Act.print }, { sep: 1 }, { label: 'Exit', icon: 'exit', key: 'Ctrl+Q', act: Act.exit }]; } },
  { label: 'Edit', items: [
    { label: 'Undo', icon: 'undo', key: 'Ctrl+Z', act: Act.undo, dis: () => Hist.i <= 0 }, { label: 'Redo', icon: 'redo', key: 'Ctrl+Y', act: Act.redo, dis: () => Hist.i >= Hist.stack.length - 1 }, { sep: 1 },
    { label: 'Reset all settings', icon: 'reset', act: Act.resetSettings }, { label: 'Copy settings as text', icon: 'copy', act: Act.copySettings }, { sep: 1 },
    { label: 'Pin results as baseline', icon: 'pin', key: 'Ctrl+B', act: () => Dash.pin() }, { label: 'Clear baseline', act: () => Dash.clearPin() }, { sep: 1 }, { label: 'Find a tool...', icon: 'search', key: 'Ctrl+F', act: Act.focusSearch }] },
  { label: 'View', items: () => [
    { label: 'Design layouts', icon: 'pipe', sub: [{ label: 'Surface irrigation: layout in plan', act: () => Layers.open('sid', E.json("Object.keys((window.__SEC||{}).sid||{}).find(function(k){return /^Layout in plan/.test(k)})||''") || undefined) },
      { label: 'Drip: layout and infrastructure', act: () => Layers.open('drip', E.json("Object.keys((window.__SEC||{}).drip||{}).find(function(k){return /^Layout and infrastructure/.test(k)})||''") || undefined) },
      { label: 'Sprinklers: layout in plan', act: () => Layers.open('spr', E.json("Object.keys((window.__SEC||{}).spr||{}).find(function(k){return /^Layout in plan/.test(k)})||''") || undefined) },
      { label: 'Sprinklers: layout and infrastructure', act: () => Layers.open('spr', E.json("Object.keys((window.__SEC||{}).spr||{}).find(function(k){return /^Layout and infrastructure/.test(k)})||''") || undefined) }] },
    { label: 'Field sketch to design...', icon: 'field', act: () => Sketch.open() }, { sep: 1 },
    { label: 'Layers and Processing Toolbox', check: () => vis('leftDock'), act: () => Act.toggle('leftDock', 'splitLeft') }, { label: 'Properties', check: () => vis('rightDock'), act: () => Act.toggle('rightDock', 'splitRight') },
    { label: 'Dashboard', check: () => vis('dashDock'), act: () => Act.toggle('dashDock', 'splitDash') }, { sep: 1 },
    { label: 'Fit drawing to window', check: () => Act.fitMode === 'window', act: () => Act.fit('window') }, { label: 'Drawing at full width (scroll)', check: () => Act.fitMode === 'width', act: () => Act.fit('width') }, { label: 'Focus view (hide panels)', key: 'F9', act: Act.focus }, { sep: 1 },
    { label: 'Expand all layers', act: () => Layers.expandAll() }, { label: 'Collapse all layers', act: () => Layers.collapseAll() }, { sep: 1 }, { label: 'Full screen', key: 'F11', act: Act.fullscreen }] },
  { label: 'Tools', items: [
    { label: 'Field sketch to design...', icon: 'field', act: () => Sketch.open() }, { label: 'Field on the map: satellite, indices, report...', icon: 'search', act: () => FieldMap.open() }, { label: 'Compare the irrigation systems on this field', icon: 'chart', act: () => Sketch.compare() },
    { label: 'Find the most efficient design inputs', icon: 'gear', act: () => { const id = Layers.DESIGN.includes(Layers.current()) ? Layers.current() : 'sid'; Layers.open(id); setTimeout(() => { E.ev("designApplyBest('" + id + "')"); E.poll(true); Dash.tab('design'); UI.log('Most efficient inputs applied and run: ' + Layers.nameOf(id)); }, 400); } },
    { label: 'Import weather data...', icon: 'open', act: () => WxUI.importFile() }, { label: 'Online weather for a location...', icon: 'cloud', act: () => WxUI.online() }, { sep: 1 },
    { label: 'Ready-made cases', icon: 'layers', sub: casesMenu },
    { label: 'Irrigation design', icon: 'pipe', sub: [{ label: 'Surface irrigation design', act: () => Layers.open('sid') }, { label: 'Drip irrigation design', act: () => Layers.open('drip') }, { label: 'Sprinkler design and pipes', act: () => Layers.open('spr') }, { sep: 1 }, { label: 'Optimise surface layout', act: Act.optimise }] },
    { label: 'Irrigation method', icon: 'drop', sub: () => (E.metaData ? E.metaData.methods.map(m => ({ label: m[1], check: () => E.snap && E.snap.state.method === m[0], act: () => E.set({ method: m[0] }) })) : []) },
    { label: 'Mulch material', icon: 'layers', sub: () => (E.metaData ? E.metaData.mulches.map(m => ({ label: m[1], check: () => E.snap && E.snap.state.mulchType === m[0], act: () => E.setMulch(m[0]) })) : []) }, { sep: 1 },
    { label: 'Run 20-year season simulation', icon: 'chart', act: Act.runSeason }, { label: 'Find a tool...', icon: 'search', act: Act.focusSearch }] },
  { label: 'Refresh', items: [
    { label: 'Refresh display', icon: 'refresh', key: 'F6', act: Act.refresh }, { label: 'Reload simulation engine', act: Act.reloadEngine }, { label: 'Clear message log', act: () => { UI.logs.length = 0; Dash.render(); } }] },
  { label: 'Review', items: [
    { label: 'Results dashboard', icon: 'chart', act: () => Dash.tab('results') }, { label: 'Design results', icon: 'pipe', act: () => Dash.tab('design') }, { label: 'Yearly charts', icon: 'chart', act: () => Dash.tab('charts') }, { label: 'Messages', icon: 'doc', act: () => Dash.tab('messages') }, { sep: 1 },
    { label: 'Pin results as baseline', icon: 'pin', key: 'Ctrl+B', act: () => Dash.pin() }, { label: 'Clear baseline', act: () => Dash.clearPin() }, { sep: 1 }, { label: 'Go to top of the drawing', act: () => E.scrollTop() }] },
  { label: 'Run', items: [
    { label: 'Run / pause the season', icon: 'play', key: 'F5', act: Act.togglePlay }, { label: 'Restart from day 1', icon: 'restart', key: 'Shift+F5', act: Act.restart }, { label: '20-year season simulation', icon: 'chart', act: Act.runSeason }, { sep: 1 },
    { label: 'Optimise surface layout', icon: 'run', act: Act.optimise }, { label: 'Ready-made cases', sub: casesMenu }] },
  { label: 'Help', items: [
    { label: 'Manual (PDF)', icon: 'book', key: 'F1', act: Act.manual }, { label: 'How to use SWAFL', icon: 'book', act: Act.guide }, { label: 'Troubleshooting (running the app)', icon: 'bug', act: () => guideModal('trouble') }, { label: 'Keyboard shortcuts', icon: 'key', act: Act.shortcuts }, { sep: 1 },
    { label: 'SWAFL on GitHub (repository)', icon: 'github', act: Act.github }, { label: 'Full documentation on GitHub', icon: 'book', act: Act.docs }, { label: 'Report a problem', icon: 'bug', act: Act.issues }, { sep: 1 }, { label: 'About SWAFL', icon: 'info', act: Act.about }] }
];

/* ---------- toolbar ---------- */
function buildToolbar() {
  const B = (icon, label, act, tip, cls) => ({ icon, label, act, tip, cls });
  const items = [B('new', '', Act.newProject, 'New project (Ctrl+N)'), B('open', '', Act.openProject, 'Open project (Ctrl+O)'), B('save', '', Act.saveProject, 'Save project (Ctrl+S)'), 0,
    B('undo', '', Act.undo, 'Undo (Ctrl+Z)'), B('redo', '', Act.redo, 'Redo (Ctrl+Y)'), 0,
    B('play', 'Run', Act.togglePlay, 'Run or pause the season (F5)', 'run'), B('restart', 'Restart', Act.restart, 'Restart from day 1 (Shift+F5)'), B('chart', '20-year run', Act.runSeason, 'Run the 20-year season simulation'), 0,
    B('refresh', 'Refresh', Act.refresh, 'Refresh display (F6)'), B('pin', 'Baseline', () => Dash.pin(), 'Pin results as baseline (Ctrl+B)'), B('img', 'Picture', Act.exportPNG, 'Save a picture of the window'), B('csv', 'Results', Act.exportSeasonCSV, 'Save yearly results (CSV)'), 0,
    B('pipe', 'Surface', () => Layers.open('sid'), 'Surface irrigation design'), B('drop', 'Drip', () => Layers.open('drip'), 'Drip irrigation design'), B('sprinkler', 'Sprinklers', () => Layers.open('spr'), 'Sprinkler design and pipes'), 0,
    B('fit', 'Focus', Act.focus, 'Focus view: hide the panels to see the whole drawing (F9)'), B('search', 'Search', () => Palette.open(), 'Find anything: layers, tools, dates (Ctrl+K)'), B('print', 'Report', Act.report, 'Save the full report as PDF (Ctrl+Shift+P)'), B('book', 'Manual', Act.manual, 'Open the manual (F1)')];
  const tb = document.getElementById('toolbar'); tb.innerHTML = '';
  items.splice(items.length - 1, 0, 0, 'date');
  items.forEach(it => {
    if (!it) { const s = document.createElement('div'); s.className = 'tbsep'; tb.appendChild(s); return; }
    if (it === 'date') {
      const w = document.createElement('div'); w.className = 'tb'; w.style.cursor = 'default'; w.title = 'Working date: the whole workbench moves to this date (1980 to 2100). 1980-1999 is the baseline record; later dates are projected from it.';
      w.innerHTML = UI.icon('sun') + '<span style="display:inline">Date</span><input type="date" id="tbDate" min="1980-01-01" max="2100-12-31" class="tbsel" style="width:130px"><button class="btn" id="tbToday" style="height:22px;padding:0 8px">Today</button>';
      tb.appendChild(w);
      const di = w.querySelector('#tbDate'); di.onchange = () => { if (di.value) { E.setDate(di.value); UI.log('Working date set to ' + di.value); } };
      w.querySelector('#tbToday').onclick = () => { const t = new Date(), p = n => String(n).padStart(2, '0'); const v = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()); di.value = v; E.setDate(v); UI.log('Working date set to today'); };
      return; }
    const b = document.createElement('button'); b.className = 'tb ' + (it.cls || ''); b.title = it.tip; b.innerHTML = UI.icon(it.icon) + (it.label ? '<span>' + it.label + '</span>' : ''); b.onclick = it.act; b.dataset.l = it.label; tb.appendChild(b);
  });
}

/* ---------- help windows ---------- */
function link(u, t) { return '<a data-url="' + u + '">' + t + '</a>'; }
function guideModal(start) {
  const S = (id, t, body) => '<h3 id="g-' + id + '">' + t + '</h3>' + body;
  const html = '<p><b>Jump to:</b> <a data-go="quick">Quick start</a> &middot; <a data-go="win">The window</a> &middot; <a data-go="date">Working date</a> &middot; <a data-go="sim">Run a simulation</a> &middot; <a data-go="design">Irrigation design</a> &middot; <a data-go="files">Files</a> &middot; <a data-go="install">Install and run</a> &middot; <a data-go="trouble">Troubleshooting</a></p>' +
  S('quick', '1. Quick start', '<ol><li>Open the <b>Layers</b> panel (top left) and click the arrow next to a group, for example <i>Field water balance</i>, then click <i>Field balance</i>.</li><li>Press <b>Run</b> on the toolbar (or <span class="kbd">F5</span>) to play the season. Press it again to pause.</li><li>Change anything in <b>Properties</b> (right): soil, mulch, rainfall, irrigation method. The picture and the <b>Dashboard</b> (bottom) update at once.</li><li>Type a date in the toolbar <b>Date</b> box, or press <b>Today</b>. Everything moves to that date.</li></ol>') +
  S('win', '2. The window', '<ul><li><b>Menu bar</b>: File, Edit, View, Tools, Refresh, Review, Run, Help.</li><li><b>Layers</b> (left, top): groups are closed until you open them. Click a layer to open it in a tab. Layers under <i>Irrigation design</i> have sub-layers: click one to jump to that part of the drawing.</li><li><b>Processing Toolbox</b> (left, bottom): groups are closed until opened. Type in the search box and double-click a tool to run it.</li><li><b>Simulation window</b> (centre): tabs, view buttons (for design layers: Layout design, Simulation, Pipes and pump, Results...), the drawing, the play bar and the Year strip. Scroll the Year strip sideways from 1980 to 2100 and click a year.</li><li><b>Properties</b> (right): every input in groups. Click a group title to fold it.</li><li><b>Dashboard</b> (bottom): <i>Results</i> for the working date, <i>Design</i>, <i>Charts</i>, <i>Messages</i>. Drag the thin bar above it to resize, press <b>Larger</b> to enlarge it, double-click its tab bar to fold it.</li></ul>') +
  S('date', '3. Working date: today, 2050 or any date', '<p>The <b>Date</b> box in the toolbar (also in Properties) accepts any date from 1980 to 2100. The status bar, the drawings, the Year strip and the Dashboard all show that date. <b>1980-1999</b> is the real baseline record. Dates from 2000 to 2100, including today, are projected from a baseline weather year: choose <i>typical</i>, <i>dry</i>, <i>wet</i> or a single year in Properties &rarr; Scenario &rarr; Weather year. Projections are not forecasts.</p>') +
  S('sim', '4. Run a simulation', '<ol><li>Pick a <b>Ready-made case</b> (Properties &rarr; Scenario or Tools &rarr; Ready-made cases).</li><li>Set soil, tillage, crop, mulch, climate, irrigation method, trigger and nitrogen in Properties.</li><li>Press <b>Run</b>; drag the slider under the picture to any day.</li><li>Press <b>Baseline</b> (<span class="kbd">Ctrl+B</span>), change a setting, and the Dashboard shows the change (green better, red worse).</li><li>Press <b>20-year run</b> to see yearly charts.</li></ol>') +
  S('design', '5. Irrigation design (layout, pipes, results)', '<p>Open <b>Irrigation design</b> in Layers: <b>Surface</b> (layout, advance and recession, hydrograph, performance), <b>Drip</b> (emitters, laterals, layout and infrastructure), <b>Sprinklers and pipes</b> (layout, sprinkler and jet, overlap, pipe sizing, pump and hydraulic grade line, infrastructure layout, design checks). Use the view buttons above the drawing to jump between parts. Click and drag inside the drawing to change lengths, spacing and times. The Dashboard <b>Design</b> tab lists efficiencies, uniformity, times and volumes. <i>Tools &rarr; Optimise surface layout</i> applies the best surface design.</p>') +
  S('files', '6. Save, open, export, print', '<p><b>File &rarr; Save project</b> stores all settings in a <code>.swafl</code> file; <b>Open project</b> restores it. <b>File &rarr; Export</b> saves the picture (PNG) or the numbers (CSV). <b>Print</b> makes a PDF.</p>') +
  S('install', '7. Download, install and run (Windows)', '<p><b>Easiest: download the ready-made app.</b> Open <a href="#" data-url="https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/releases/latest/download/SWAFL.exe">SWAFL.exe (Windows, 180 MB)</a> in your browser, save it and double-click it. If Windows shows a SmartScreen warning, click More info, then Run anyway.</p><p><b>Or build it: one paste in VS Code</b> (Node.js LTS and Git installed; restart VS Code after installing). Open Terminal, New Terminal and paste:</p><pre style="user-select:all;background:#EAF0F7;padding:8px;border-radius:4px;white-space:pre-wrap">git clone https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops.git\ncd Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops\\Software\\v1.1.0\\SWAFL_Desktop\nnpm.cmd install\nnpm.cmd run get-app</pre><p>It downloads SWAFL, builds <code>SWAFL.exe</code>, copies it to the Desktop and starts it. Afterwards no code is needed: double-click <b>SWAFL</b>. Use <code>npm.cmd</code> so PowerShell never blocks it.</p><p><b>Or from the zip:</b> download <code>SWAFL_Desktop.zip</code> from the Software folder of the GitHub repository, extract it, open the inner folder that contains <code>package.json</code> in VS Code, then run <code>npm.cmd install</code> and <code>npm.cmd run get-app</code>.</p><p>Update later: <code>git pull</code>, then <code>npm.cmd run get-app</code>. No install at all: open the online workbench in any browser: <a href="#" data-url="https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/SWAFL_Desktop/app/index.html?v=1.1.0">SWAFL online</a> (no server or Node needed).</p>') +
  S('trouble', '8. Troubleshooting', '<table class="tbl"><tr><th>Problem</th><th style="text-align:left">Fix</th></tr>' +
  '<tr><td>&ldquo;running scripts is disabled&rdquo; in PowerShell</td><td style="text-align:left">Use a <b>Command Prompt</b> terminal, or run <code>Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned</code>, or type <code>cmd /c npm install</code>.</td></tr>' +
  '<tr><td><code>npm</code> is not recognised</td><td style="text-align:left">Install Node.js, then close and reopen VS Code.</td></tr>' +
  '<tr><td>ENOENT &hellip; package.json not found</td><td style="text-align:left">You are in the wrong folder. The zip makes a folder inside a folder: <code>cd</code> into the one that shows <code>package.json</code>.</td></tr>' +
  '<tr><td>Install or build is slow or fails inside OneDrive</td><td style="text-align:left">Copy the project to <code>C:\\SWAFL_Desktop</code> and run it there.</td></tr>' +
  '<tr><td>&ldquo;Windows protected your PC&rdquo;</td><td style="text-align:left">Click <b>More info &rarr; Run anyway</b> (the app is not code-signed).</td></tr>' +
  '<tr><td>Build error about symbolic links or permissions</td><td style="text-align:left">Turn on Windows <b>Developer Mode</b> or run the terminal as Administrator, then repeat <code>npm run get-app</code>.</td></tr>' +
  '<tr><td>Download of Electron fails</td><td style="text-align:left">Check internet or VPN/firewall, delete the <code>node_modules</code> folder and run <code>npm install</code> again.</td></tr>' +
  '<tr><td>White or empty window</td><td style="text-align:left">Wait 10 seconds (the engine loads), then <i>Refresh &rarr; Reload simulation engine</i>. Close any second SWAFL window.</td></tr>' +
  '<tr><td>No results in the Dashboard</td><td style="text-align:left">Press the <b>Larger</b> button on the Dashboard tab bar, or drag the bar above it upward. Choose the <i>Results</i> tab.</td></tr>' +
  '<tr><td>The app feels slow</td><td style="text-align:left">Pause the run (F5), close other heavy programs, fold the Dashboard when not needed, and avoid very large windows on old laptops.</td></tr>' +
  '<tr><td>Date shows old years</td><td style="text-align:left">Press <b>Today</b>, or type the date again in the toolbar Date box.</td></tr>' +
  '<tr><td>Still stuck</td><td style="text-align:left">Open Help &rarr; Report a problem and describe what you did and what you saw (a screenshot helps).</td></tr></table>') +
  '<p>More: ' + link(REPO, 'SWAFL repository on GitHub') + ' &middot; ' + link(DOCS, 'full documentation') + ' &middot; ' + link(REPO + '/issues', 'report a problem') + '</p>';
  const r = UI.modal({ title: 'How to use SWAFL', icon: 'book', width: 'min(900px,95vw)', html, buttons: [{ label: 'Open GitHub', act: () => { Act.github(); return false; } }, { label: 'Close', pri: true }] });
  r.querySelectorAll('a[data-go]').forEach(a => a.addEventListener('click', () => { const el = r.querySelector('#g-' + a.dataset.go); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  if (start) { const el = r.querySelector('#g-' + start); if (el) setTimeout(() => el.scrollIntoView(), 30); }
}
function shortcutsModal() {
  const R = [['Ctrl+K','Search everything: layers, tools, a year or date'], ['Ctrl+N / O / S', 'New / open / save project'], ['Ctrl+Z / Ctrl+Y', 'Undo / redo a setting'], ['F5', 'Run or pause the season'], ['Shift+F5', 'Restart from day 1'], ['F6', 'Refresh display'], ['Ctrl+B', 'Pin results as baseline'], ['Ctrl+E', 'Save picture (PNG)'], ['Ctrl+P', 'Print / PDF'], ['Ctrl+F', 'Find a tool'], ['F1', 'Manual (PDF)'], ['Ctrl+Shift+P', 'Save the full report as PDF'], ['F9', 'Focus view (hide panels)'], ['F11', 'Full screen'], ['Ctrl+Q', 'Exit']];
  UI.modal({ title: 'Keyboard shortcuts', icon: 'key', width: 'min(520px,94vw)', html: '<table class="tbl">' + R.map(r => '<tr><td><span class="kbd">' + r[0] + '</span></td><td style="text-align:left">' + r[1] + '</td></tr>').join('') + '</table>' });
}
function aboutModal() {
  UI.modal({ title: 'About SWAFL', icon: 'info', width: 'min(560px,94vw)', html: '<div class="about"><img src="assets/logo.svg" width="96" height="96" alt=""><div><h3 style="margin:0">SWAFL ' + VERSION + '</h3><p>Soil Water, Atmosphere, Feedback and Layout workbench</p><p>Coupled water fluxes, pore-scale dynamics, precision irrigation and mulching feedback loops, with surface, drip and sprinkler design.</p><p>Built on 10,190 simulations across ten soils.<br>Author: Naziru Halilu</p><p>' + link(REPO, 'github.com/halilunaziru73-creator') + '</p></div></div>' });
}

/* ---------- keyboard ---------- */
function onKey(e) {
  const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  const go = f => { e.preventDefault(); f(); };
  if (e.key === 'F5') go(e.shiftKey ? Act.restart : Act.togglePlay); else if (e.key === 'F6') go(Act.refresh); else if (e.key === 'F1') go(Act.manual); else if (e.key === 'F11') go(Act.fullscreen); else if (e.key === 'F9') go(Act.focus);
  else if (c && k === 'n') go(Act.newProject); else if (c && k === 'o') go(Act.openProject); else if (c && k === 's') go(Act.saveProject); else if (c && k === 'z') go(Act.undo); else if (c && k === 'y') go(Act.redo);
  else if (c && k === 'b') go(() => Dash.pin()); else if (c && k === 'e') go(Act.exportPNG); else if (c && e.shiftKey && k === 'p') go(Act.report); else if (c && k === 'p') go(Act.print); else if (c && k === 'f') go(Act.focusSearch); else if (c && k === 'q') go(Act.exit);
}
document.addEventListener('keydown', onKey);

/* ---------- start-up ---------- */
function updateStatus(s) {
  const st = s.state, M = E.metaData;
  document.getElementById('stScene').textContent = Layers.started() ? Layers.nameOf(s.scene) : 'No layer open';
  document.getElementById('stCase').textContent = [M.soilLabels[st.soil] || st.soil, M.tills[st.till], (M.mulches.find(m => m[0] === st.mulchType) || [])[1], (M.methods.find(m => m[0] === st.method) || [])[1]].filter(Boolean).join('  |  ');
  document.getElementById('stDate').textContent = s.dateLbl || '';
  const td = document.getElementById('tbDate'); if (td && s.date && document.activeElement !== td && td.value !== s.date) td.value = s.date;
  document.getElementById('stPlay').textContent = s.playOn ? 'Running' : 'Paused';
  const rb = document.querySelector('#toolbar .tb.run'); if (rb) rb.innerHTML = UI.icon(s.playOn ? 'pause' : 'play') + '<span>' + (s.playOn ? 'Pause' : 'Run') + '</span>';
}
let bootedOnce = false;
async function boot(again) {
  const ok = await E.start();
  if (!ok) { UI.log('The simulation engine did not start', 'err'); document.querySelector('#loading div').textContent = 'The simulation engine did not start. Use Refresh > Reload simulation engine.'; return; }
  E.metaData = E.meta();
  try { E.win.addEventListener('keydown', onKey); } catch (e) {}
  Toolbox.render(); Props.build(); Layers.render(); Layers.renderTabs(); Layers.renderViewBar();
  E.poll(true); histPush(E.snap);
  document.getElementById('loading').classList.add('gone');
  if (!bootedOnce) { bootedOnce = true; UI.log('SWAFL ' + VERSION + ' started. Simulation engine ready.'); }
  Dash.render();
  let deep = null; try { const m = /[#&?](?:open|layer)=([a-z0-9]+)/i.exec(location.hash + location.search); if (m) deep = m[1]; } catch (e) {}
  if (deep) setTimeout(() => { try { Layers.open(deep); } catch (e) {} }, 300);   // links like index.html#open=n1 land straight on a layer (n1 = Irrigation trigger law)
  try { if (!deep && !localStorage.getItem('swafl.welcome')) { localStorage.setItem('swafl.welcome', '1'); welcome(); } } catch (e) {}
}
function welcome() { UI.modal({ title: 'Welcome to SWAFL', icon: 'info', width: 'min(620px,94vw)', html: '<div class="about"><img src="assets/logo.svg" width="84" height="84" alt=""><div><p><b>Start in three clicks</b></p><ol><li>Open a group in <b>Layers</b> (left) and click a layer.</li><li>Press <b>Run</b> in the toolbar.</li><li>Change the <b>Date</b> in the toolbar: the whole workbench moves to that date, today or up to 2100.</li></ol><p>Results are in the <b>Dashboard</b> at the bottom. Press <b>F1</b> for the full manual; <b>File &rarr; Save full report as PDF</b> saves the report of every layer. New: <b>Crops</b>, <b>Year by year</b> and the <b>field on the map</b> (Tools).</p></div></div>', buttons: [{ label: 'Open the guide', act: () => { setTimeout(guideModal, 50); } }, { label: 'Start', pri: true }] }); }
E.on('snap', ({ s }) => { if (E.metaData) updateStatus(s); });
E.on('state', s => histPush(s));

UI.buildMenubar(MENUS); buildToolbar();
UI.hsplit(document.getElementById('splitLeft'), document.getElementById('leftDock'), 'left', 190, 520);
UI.hsplit(document.getElementById('splitRight'), document.getElementById('rightDock'), 'right', 220, 560);
UI.hsplit(document.getElementById('splitDash'), document.getElementById('dashDock'), 'right', 300, 900);
UI.vsplit(document.getElementById('splitLeftV'), () => document.getElementById('toolboxDock'), 'up', 80, 560);
document.querySelector('#dashTabs [data-act=maxDash]').onclick = e => { const d = document.getElementById('dashDock'); d.style.width = ''; d.classList.toggle('max'); e.target.textContent = d.classList.contains('max') ? 'Smaller' : 'Wider'; };
if (window.swafl) window.swafl.version().then(v => { document.getElementById('stVer').textContent = v; }).catch(() => {});
document.getElementById('engine').addEventListener('load', () => { if (bootedOnce) boot(true); });
boot();

/* remember panel sizes between sessions */
try {
  const KEY = 'swafl.layout', ids = ['leftDock', 'rightDock', 'dashDock'];
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  ids.forEach(i => { if (saved[i]) document.getElementById(i).style.width = saved[i]; });
  window.addEventListener('beforeunload', () => { const o = {}; ids.forEach(i => { const w = document.getElementById(i).style.width; if (w) o[i] = w; }); localStorage.setItem(KEY, JSON.stringify(o)); });
} catch (e) {}
