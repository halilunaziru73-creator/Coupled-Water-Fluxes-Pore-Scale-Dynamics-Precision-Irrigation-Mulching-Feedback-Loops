/* SWAFL workbench: actions, menus, toolbar, history, project files, help, start-up. */
'use strict';
const REPO = 'https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops';
const DOCS = REPO + '/tree/main/Software/SWAFL_Desktop';
const VERSION = '1.0.0';

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
  focusSearch() { document.getElementById('tbSearch').focus(); }
};
function setName(n) { document.getElementById('projName').textContent = n; }
const vis = id => !document.getElementById(id).hidden;

/* ---------- menus ---------- */
const casesMenu = () => (E.metaData ? E.metaData.presets.filter(p => p[0] !== '').map(p => ({ label: p[1], act: () => Act.preset(p[0]) })) : []);
const MENUS = [
  { label: 'File', items: [
    { label: 'New project', icon: 'new', key: 'Ctrl+N', act: Act.newProject }, { label: 'Open project...', icon: 'open', key: 'Ctrl+O', act: Act.openProject }, { label: 'Save project...', icon: 'save', key: 'Ctrl+S', act: Act.saveProject }, { sep: 1 },
    { label: 'Export', icon: 'img', sub: [{ label: 'Picture of the window (PNG)', icon: 'img', key: 'Ctrl+E', act: Act.exportPNG }, { label: 'Yearly results (CSV)', icon: 'csv', act: Act.exportSeasonCSV }, { label: 'Design results (CSV)', icon: 'csv', act: Act.exportDesignCSV }] },
    { label: 'Print / save as PDF...', icon: 'print', key: 'Ctrl+P', act: Act.print }, { sep: 1 }, { label: 'Exit', icon: 'exit', key: 'Ctrl+Q', act: Act.exit }] },
  { label: 'Edit', items: [
    { label: 'Undo', icon: 'undo', key: 'Ctrl+Z', act: Act.undo, dis: () => Hist.i <= 0 }, { label: 'Redo', icon: 'redo', key: 'Ctrl+Y', act: Act.redo, dis: () => Hist.i >= Hist.stack.length - 1 }, { sep: 1 },
    { label: 'Reset all settings', icon: 'reset', act: Act.resetSettings }, { label: 'Copy settings as text', icon: 'copy', act: Act.copySettings }, { sep: 1 },
    { label: 'Pin results as baseline', icon: 'pin', key: 'Ctrl+B', act: () => Dash.pin() }, { label: 'Clear baseline', act: () => Dash.clearPin() }, { sep: 1 }, { label: 'Find a tool...', icon: 'search', key: 'Ctrl+F', act: Act.focusSearch }] },
  { label: 'View', items: () => [
    { label: 'Layers and Processing Toolbox', check: () => vis('leftDock'), act: () => Act.toggle('leftDock', 'splitLeft') }, { label: 'Properties', check: () => vis('rightDock'), act: () => Act.toggle('rightDock', 'splitRight') },
    { label: 'Dashboard', check: () => vis('dashDock'), act: () => Act.toggle('dashDock', 'splitDash') }, { sep: 1 },
    { label: 'Expand all layers', act: () => Layers.expandAll() }, { label: 'Collapse all layers', act: () => Layers.collapseAll() }, { sep: 1 }, { label: 'Full screen', key: 'F11', act: Act.fullscreen }] },
  { label: 'Tools', items: [
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
    { label: 'How to use SWAFL', icon: 'book', key: 'F1', act: Act.guide }, { label: 'Keyboard shortcuts', icon: 'key', act: Act.shortcuts }, { sep: 1 },
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
    B('help', 'Help', Act.guide, 'How to use SWAFL (F1)')];
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
function guideModal() {
  UI.modal({ title: 'How to use SWAFL', icon: 'book', width: 'min(780px,94vw)', html: `
  <h3>1. The window</h3>
  <p><b>Layers</b> (top left) list every view of the model. Click a layer to open it; the Irrigation design layers have sub-layers - click one to jump straight to that part of the drawing. <b>Processing Toolbox</b> (bottom left) holds ready-to-run tools - double-click one, or type in the search box. <b>Properties</b> (right) holds every input. The <b>Dashboard</b> (bottom) shows the results.</p>
  <h3>2. Run a simulation</h3>
  <p>Choose a <b>Ready-made case</b> in Properties (or File &rarr; Open project), then press <b>Run</b> (F5). The season plays day by day; drag the time slider under the picture to stop on any date. Change soil, mulch, rainfall, irrigation method and the picture and the Results tab update immediately.</p>
  <h3>3. Compare two settings</h3>
  <p>Press <b>Baseline</b> (Ctrl+B) to keep the current results, change a setting, and every result card shows the difference (green = better, red = worse).</p>
  <h3>4. Design an irrigation system</h3>
  <p>Open <b>Irrigation design</b> in Layers: <b>Surface</b> (border, furrow, basin layouts with the advance and recession drawing), <b>Drip</b> (emitters and laterals), <b>Sprinklers and pipes</b> (sprinkler layout, mainline, laterals and the pipe network). Use the view buttons above the drawing - <i>Simulation</i>, <i>Layout design</i>, <i>Pipes and infrastructure</i>, <i>Results</i> - to move between the parts. Click and drag inside the drawing to change lengths, spacing and times. The <b>Design</b> tab of the Dashboard lists efficiencies, uniformity, times and volumes. Use Tools &rarr; <i>Optimise surface layout</i> for the best surface design.</p>
  <h3>5. Save and share</h3>
  <p>File &rarr; <b>Save project</b> keeps all settings in a <code>.swafl</code> file. File &rarr; Export saves the picture (PNG) or numbers (CSV); Print makes a PDF.</p>
  <h3>6. More help</h3>
  <p>Model description, data and papers: ` + link(REPO, 'SWAFL repository on GitHub') + ` &middot; ` + link(DOCS, 'full user guide') + ` &middot; ` + link(REPO + '/issues', 'report a problem') + `.</p>`, buttons: [{ label: 'Open GitHub', act: () => { Act.github(); return false; } }, { label: 'Close', pri: true }] });
}
function shortcutsModal() {
  const R = [['Ctrl+N / O / S', 'New / open / save project'], ['Ctrl+Z / Ctrl+Y', 'Undo / redo a setting'], ['F5', 'Run or pause the season'], ['Shift+F5', 'Restart from day 1'], ['F6', 'Refresh display'], ['Ctrl+B', 'Pin results as baseline'], ['Ctrl+E', 'Save picture (PNG)'], ['Ctrl+P', 'Print / PDF'], ['Ctrl+F', 'Find a tool'], ['F1', 'Help'], ['F11', 'Full screen'], ['Ctrl+Q', 'Exit']];
  UI.modal({ title: 'Keyboard shortcuts', icon: 'key', width: 'min(520px,94vw)', html: '<table class="tbl">' + R.map(r => '<tr><td><span class="kbd">' + r[0] + '</span></td><td style="text-align:left">' + r[1] + '</td></tr>').join('') + '</table>' });
}
function aboutModal() {
  UI.modal({ title: 'About SWAFL', icon: 'info', width: 'min(560px,94vw)', html: '<div class="about"><img src="assets/logo.svg" width="96" height="96" alt=""><div><h3 style="margin:0">SWAFL ' + VERSION + '</h3><p>Soil Water, Atmosphere, Feedback and Layout workbench</p><p>Coupled water fluxes, pore-scale dynamics, precision irrigation and mulching feedback loops, with surface, drip and sprinkler design.</p><p>Built on 10,190 Daisy simulations across ten soils.<br>Author: Naziru Halilu</p><p>' + link(REPO, 'github.com/halilunaziru73-creator') + '</p></div></div>' });
}

/* ---------- keyboard ---------- */
function onKey(e) {
  const c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  const go = f => { e.preventDefault(); f(); };
  if (e.key === 'F5') go(e.shiftKey ? Act.restart : Act.togglePlay); else if (e.key === 'F6') go(Act.refresh); else if (e.key === 'F1') go(Act.guide); else if (e.key === 'F11') go(Act.fullscreen);
  else if (c && k === 'n') go(Act.newProject); else if (c && k === 'o') go(Act.openProject); else if (c && k === 's') go(Act.saveProject); else if (c && k === 'z') go(Act.undo); else if (c && k === 'y') go(Act.redo);
  else if (c && k === 'b') go(() => Dash.pin()); else if (c && k === 'e') go(Act.exportPNG); else if (c && k === 'p') go(Act.print); else if (c && k === 'f') go(Act.focusSearch); else if (c && k === 'q') go(Act.exit);
}
document.addEventListener('keydown', onKey);

/* ---------- start-up ---------- */
function updateStatus(s) {
  const st = s.state, M = E.metaData;
  document.getElementById('stScene').textContent = Layers.nameOf(s.scene);
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
}
E.on('snap', ({ s }) => { if (E.metaData) updateStatus(s); });
E.on('state', s => histPush(s));

UI.buildMenubar(MENUS); buildToolbar();
UI.hsplit(document.getElementById('splitLeft'), document.getElementById('leftDock'), 'left', 190, 520);
UI.hsplit(document.getElementById('splitRight'), document.getElementById('rightDock'), 'right', 220, 560);
UI.vsplit(document.getElementById('splitDash'), () => document.getElementById('dashDock'), 'up', 80, 560);
UI.vsplit(document.getElementById('splitLeftV'), () => document.getElementById('toolboxDock'), 'up', 80, 560);
document.getElementById('dashTabs').addEventListener('dblclick', e => { if (e.target.closest('button')) return; document.getElementById('dashDock').classList.toggle('min'); });
if (window.swafl) window.swafl.version().then(v => { document.getElementById('stVer').textContent = v; }).catch(() => {});
document.getElementById('engine').addEventListener('load', () => { if (bootedOnce) boot(true); });
boot();
