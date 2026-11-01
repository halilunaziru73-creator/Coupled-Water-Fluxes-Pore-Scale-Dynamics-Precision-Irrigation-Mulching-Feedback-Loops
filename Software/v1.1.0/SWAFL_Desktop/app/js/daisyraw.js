/* Daisy workbench: the raw output of Daisy. Every file that Daisy wrote in a run, exactly as written and never touched by SWAFL
   (the .dlf logs, the .csv files, daisy.log), with a download button for each, one .zip for the outputs, one .zip with the set-up as well,
   and the folder on the computer where the desktop app keeps the whole run. */
'use strict';
window.DaisyRaw = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const size = n => n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n > 1e3 ? Math.round(n / 1e3) + ' kB' : n + ' B';
  const save = (name, text, mime) => { const b = new Blob([text], { type: mime || 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = SWAFLDate.name(name); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const sane = t => String(t || 'run').replace(/[^A-Za-z0-9._-]+/g, '_');
  // a short description of a log for the list: what it is and how many rows and columns it has
  const WHAT = { 'Annual-Harvest': 'one row per harvest: yield, stress days, nitrogen content', 'Annual-FWater': 'water balance of the field, one row per season (1 April)', 'Annual-FWater_100cm': 'the same, down to 100 cm', 'Annual-SWater': 'water balance of the soil surface per season', 'Annual-FN': 'nitrogen balance of the field per season', 'Annual-FN_100cm': 'the same, down to 100 cm', 'Annual-Tracer': 'balance of the chemical per season', 'Daily-CropProduction': 'crop development, leaf area, dry matter and stress, every day', 'Daily-FWater': 'water balance of the field, every day', 'Daily-SWater': 'water balance of the soil surface, every day', 'Daily-FN': 'nitrogen balance of the field, every day', 'Daily-Tracer': 'balance of the chemical, every day', 'Daily-Theta': 'volumetric water content in every soil layer, every day', 'Daily-pF': 'soil water suction (pF) in every layer, every day', 'Daily-SNO3': 'nitrate in the soil solution in every layer, every day', 'Daily-Tracer_conc': 'concentration of the chemical in every layer, every day', 'daisy': 'the messages of Daisy while it ran (warnings, errors)' };
  const describe = n => { const m = String(n).replace(/\.(dlf|csv|log)$/i, ''); return WHAT[m] || (/\.csv$/i.test(n) ? 'a table written by the run' : 'a Daisy log'); };
  const filesOf = run => Object.keys(run.raw || run.rawIndex || {}).sort();
  const sizeOf = (r, n) => r.raw ? r.raw[n].length : (r.rawIndex[n] || 0);
  // the text of a file: kept in memory (scenarios) or read from the run folder on the computer (experiments)
  // the files the person edited in the viewer (key: run id | file name); they replace the text Daisy wrote in every save, and the text as
  // written by Daisy is kept next to them in the .zip (outputs/_as_written_by_Daisy/)
  const EDIT = {}, ek = (r, n) => String(r.id || r.label) + '|' + n;
  const get = async (r, n) => { if (EDIT[ek(r, n)] != null) return EDIT[ek(r, n)]; return getOrig(r, n); };
  const getOrig = async (r, n) => { if (r.raw && r.raw[n] != null) return r.raw[n]; if (r.saved && window.swafl && window.swafl.daisyReadFile) return await window.swafl.daisyReadFile(r.saved.replace(/[\\/]+$/, '') + '/Run/' + n); return null; };
  // the HTML of the panel for one or several runs; bind() makes its buttons work
  function html(runs, opt) {
    opt = opt || {}; runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!runs.length) return '';
    const desk = !!(window.swafl && window.swafl.isDesktop), root = runs.find(r => r.saved), folder = root ? (opt.folder || root.saved) : '';
    let h = '<div class="dzpan dzraw"><h3 style="margin:0 0 4px">The raw output of Daisy</h3><p class="pnote" style="margin:0 0 6px">These are the files exactly as Daisy wrote them, before any figure or summary of SWAFL: SWAFL has not changed a number in them. Each .dlf file is a table with tab separated columns (the header lines name the log, and the two lines above the numbers give each column and its unit). Open them in Excel or any text editor, read them in R with <i>daisyrVis::read_dlf</i> or in Python with <i>daisypy-io</i>, or use them in any other program. The figures above are drawn from these files and nothing else, so each figure can be checked against them.</p>';
    if (folder) h += '<p style="margin:4px 0"><b>Kept on this computer:</b> <code>' + esc(folder) + '</code> ' + (desk ? '<button class="btn" data-raw-open="' + esc(opt.folder ? opt.folder : root.saved) + '">Open the folder</button>' : '') + '<br><span class="pnote">The folder holds, for every run, <code>Run/</code> with the logs and daisy.log and the set-up that produced them (Runfile.dai and the files it includes), so the run can be repeated with any Daisy 7.1 or checked later. It stays there until you delete it.</span></p>';
    else if (desk) h += '<p class="pnote" style="margin:4px 0">The run folder could not be kept on this computer' + (runs[0].savedError ? ' (' + esc(runs[0].savedError) + ')' : '') + '; the buttons below still give every file.</p>';
    h += '<div class="dzrow"><button class="btn pri" data-raw-zip="out">Download all raw outputs (.zip)</button><button class="btn" data-raw-zip="all">Download outputs and set-up (.zip)</button></div>';
    h += '<div style="overflow:auto;max-height:340px"><table class="dzt"><tr><th>Run</th><th>File</th><th>What it holds</th><th>Rows</th><th>Columns</th><th>Size</th><th></th></tr>';
    runs.forEach((r, i) => filesOf(r).forEach((n, fi, all) => { const parsed = r.logs && r.logs[(window.DaisyScen && window.DaisyScen.logKey ? window.DaisyScen.logKey(n) : '') || n.replace(/\.dlf$/i, '').replace(/^r\d+[-_]/, '')]; h += '<tr>' + (fi === 0 ? '<td rowspan="' + all.length + '" style="vertical-align:top;max-width:280px;background:#f6f8fa"><b>' + esc(r.id || '') + '</b><br><span class="pnote">' + esc(r.label || '') + '</span></td>' : '') + '<td><code>' + esc(n) + '</code></td><td>' + esc(describe(n)) + '</td><td>' + (parsed ? parsed.n : '') + '</td><td>' + (parsed ? parsed.cols.length : '') + '</td><td>' + size(sizeOf(r, n)) + '</td><td style="white-space:nowrap"><button class="btn pri" data-ra-ed="' + i + '|' + esc(n) + '">View / edit</button> <button class="btn" data-raw-file="' + i + '|' + esc(n) + '">Download</button></td></tr>'; }));
    return h + '</table></div></div>';
  }
  function bind(host, runs, opt) {
    runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!host) return; opt = opt || {};
    host.querySelectorAll('[data-raw-open]').forEach(b => b.onclick = async () => { try { await window.swafl.daisyOpenFolder(b.dataset.rawOpen); } catch (e) { } });
    host.querySelectorAll('[data-ra-ed]').forEach(b => b.onclick = () => { const k = b.dataset.raEd.indexOf('|'); openEditor(runs, +b.dataset.raEd.slice(0, k), b.dataset.raEd.slice(k + 1), host); });
    host.querySelectorAll('[data-raw-file]').forEach(b => b.onclick = async () => { const k = b.dataset.rawFile.indexOf('|'), r = runs[+b.dataset.rawFile.slice(0, k)], n = b.dataset.rawFile.slice(k + 1), t = r ? await get(r, n) : null; if (t != null) save((runs.length > 1 ? sane(r.id) + '_' : '') + n, t, /\.csv$/i.test(n) ? 'text/csv' : 'text/plain'); });
    host.querySelectorAll('[data-raw-zip]').forEach(b => b.onclick = async () => {
      if (!window.DaisyExp || !window.DaisyExp.zip) return; const all = b.dataset.rawZip === 'all', f = {};
      for (const r of runs) { const d = (opt.name || 'daisy') + '/' + sane(r.id || r.label) + '/'; for (const n of filesOf(r)) { const t = await get(r, n); if (t != null) f[d + 'outputs/' + n] = t; } if (all) { const s = r.setup || {}; Object.keys(s).forEach(n => { f[d + 'setup/' + n] = s[n]; }); if (!r.setup && r.runfile) f[d + 'setup/Run/Runfile.dai'] = r.runfile; } }
      f[(opt.name || 'daisy') + '/README.txt'] = 'Raw output of Daisy 7.1.14, exactly as written by the program.\r\n\r\noutputs/  the log files of each run (.dlf tables with tab separated columns, .csv, daisy.log)\r\nsetup/    the files that were given to Daisy (Run/Runfile.dai and the files it includes; weather and soil of the run)\r\n\r\nTo repeat a run: put the setup folder in an empty folder and run  daisy-bin.exe Run/Runfile.dai  from the Run folder with a Daisy 7.1 installation.\r\nEvery .dlf starts with header lines (VERSION, LOGFILE, RUN, SIM, ...), then a line of dashes, the column names, the units, and the numbers.\r\n';
      const z = window.DaisyExp.zip(f), blob = new Blob([z], { type: 'application/zip' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = SWAFLDate.name((opt.name || 'daisy') + (all ? '-outputs-and-setup.zip' : '-raw-outputs.zip')); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
  }
  // every raw file of the runs as a map { path: text }, under root/<run>/outputs and root/<run>/setup
  async function collect(runs, root, setup) { const f = {}; runs = (runs || []).filter(r => r && (r.raw || r.rawIndex || r.saved)); for (const r of runs) { const d = root + '/' + sane(r.id || r.label) + '/'; for (const n of filesOf(r)) { const t = await get(r, n); if (t != null) f[d + 'outputs/' + n] = t; } if (setup) { const s = r.setup || {}; Object.keys(s).forEach(n => { f[d + 'setup/' + n] = s[n]; }); if (!r.setup && r.runfile) f[d + 'setup/Run/Runfile.dai'] = r.runfile; } } return f; }
  /* every run of an experiment, each a collapsible group with its files; tick what to save, or save everything, in one .zip */
  const typeOf = n => String(n).replace(/^r\d+[-_]/, '').replace(/^.*[\\/]/, '');
  function htmlAll(runs, opt) {
    opt = opt || {}; runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!runs.length) return ''; const desk = !!(window.swafl && window.swafl.isDesktop), types = []; let total = 0, nf = 0;
    runs.forEach(r => filesOf(r).forEach(n => { const t = typeOf(n); if (types.indexOf(t) < 0) types.push(t); total += sizeOf(r, n) || 0; nf++; })); types.sort();
    let h = '<div class="dzraw"><p class="pnote" style="margin:0 0 6px">Every file Daisy wrote, for every one of the ' + runs.length + ' runs (' + nf + ' files, ' + size(total) + '), exactly as written. Open a run to see its files; tick the files to save, or choose a kind of file for every run at once.' + (opt.folder ? ' They are kept on this computer in <code>' + esc(opt.folder) + '</code>' + (desk ? ' <button class="btn" data-ra="open">Open the folder</button>' : '') + '.' : '') + '</p>';
    h += '<div class="dzrow" style="flex-wrap:wrap;gap:4px 10px"><button class="btn" data-ra="all">Tick all</button><button class="btn" data-ra="none">Tick none</button><label>Tick this file in every run</label><select data-ra="type"><option value="">choose a file</option>' + types.map(t => '<option>' + esc(t) + '</option>').join('') + '</select>' +
      '<label><input type="checkbox" data-ra="setup" checked> with the set-up of each run</label>' + (opt.extra ? '<label title="Save everything always includes them"><input type="checkbox" data-ra="extra"> with the outputs of the experiment (figures at 300 dpi, tables, README)</label>' : '') + '</div>';
    h += '<div class="dzrow">' + (opt.view ? '<button class="btn pri" data-ra="view">View and edit all the Daisy outputs (full screen)</button>' : '') + '<button class="btn pri" data-ra="savesel">Save the ticked files (.zip)</button><button class="btn" data-ra="saveall">Save everything (.zip)</button><span class="pnote" data-ra="st"></span></div>';
    runs.forEach((r, i) => { const fl = filesOf(r), sz = fl.reduce((a, n) => a + (sizeOf(r, n) || 0), 0), lb = opt.label ? opt.label(r) : r.label;
      h += '<details class="dzgrp"><summary><input type="checkbox" data-rr="' + i + '" title="tick every file of this run"> <b>' + esc(r.id || 'run ' + (i + 1)) + '</b> ' + esc(lb || '') + ' <span class="pnote">' + fl.length + ' files, ' + size(sz) + '</span></summary><div><table class="dzt" style="font-size:12px;table-layout:auto"><tr><th></th><th>File</th><th>What it holds</th><th>Rows</th><th>Size</th><th>Open, edit, download</th></tr>' +
        fl.map(n => { const d = r.logs && r.logs[typeOf(n).replace(/\.dlf$/i, '')]; return '<tr><td><input type="checkbox" data-rf="' + i + '|' + esc(n) + '"></td><td><code>' + esc(n) + '</code></td><td>' + esc(describe(typeOf(n))) + '</td><td>' + (d ? d.n : '') + '</td><td>' + size(sizeOf(r, n) || 0) + '</td><td style="white-space:nowrap"><button class="btn pri" data-ra-ed="' + i + '|' + esc(n) + '" title="Open the file in a full-screen editor (Notepad++ style): view, find, edit, keep the changes">View / edit</button> <button class="btn" data-raw-file="' + i + '|' + esc(n) + '">Download</button> <span class="pnote" data-ra-mark="' + i + '|' + esc(n) + '">' + (EDIT[ek(r, n)] != null ? 'edited' : '') + '</span></td></tr>'; }).join('') + '</table></div></details>'; });
    return h + '</div>';
  }
  function bindAll(host, runs, opt) {
    opt = opt || {}; runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!host) return; const q = k => host.querySelector('[data-ra="' + k + '"]'), boxes = () => Array.from(host.querySelectorAll('[data-rf]')), stt = q('st');
    bind(host, runs, opt);
    if (q('open')) q('open').onclick = async () => { try { await window.swafl.daisyOpenFolder(opt.folder); } catch (e) { } };
    q('all').onclick = () => boxes().forEach(b => { b.checked = true; }); q('none').onclick = () => { boxes().forEach(b => { b.checked = false; }); host.querySelectorAll('[data-rr]').forEach(b => { b.checked = false; }); };
    q('type').onchange = e => { const t = e.target.value; if (!t) return; boxes().forEach(b => { const n = b.dataset.rf.slice(b.dataset.rf.indexOf('|') + 1); if (typeOf(n) === t) b.checked = true; }); stt.textContent = boxes().filter(b => b.checked).length + ' files ticked'; };
    host.querySelectorAll('[data-rr]').forEach(b => { b.onclick = ev => ev.stopPropagation(); b.onchange = () => host.querySelectorAll('[data-rf^="' + b.dataset.rr + '|"]').forEach(x => { x.checked = b.checked; }); });
    const save = async all => { if (!window.DaisyExp || !window.DaisyExp.zip) return; const f = {}, root = opt.name || 'experiment', pick = all ? null : new Set(boxes().filter(b => b.checked).map(b => b.dataset.rf)); if (pick && !pick.size) { stt.textContent = 'Tick at least one file.'; return; }
      stt.textContent = 'Reading the files...'; const setup = q('setup') && q('setup').checked;
      for (let i = 0; i < runs.length; i++) { const r = runs[i], d = root + '/Raw/' + sane(r.id || r.label) + '/'; let any = false; for (const n of filesOf(r)) { if (pick && !pick.has(i + '|' + n)) continue; const t = await get(r, n); if (t != null) { f[d + 'outputs/' + n] = t; any = true; if (EDIT[ek(r, n)] != null) { const o0 = await getOrig(r, n); if (o0 != null) f[d + 'outputs/_as_written_by_Daisy/' + n] = o0; } } } if (any && setup) { const s2 = r.setup || {}; Object.keys(s2).forEach(n => { f[d + 'setup/' + n] = s2[n]; }); if (!r.setup && r.runfile) f[d + 'setup/Run/Runfile.dai'] = r.runfile; } }
      if (opt.extra && (all || (q('extra') && q('extra').checked))) { stt.textContent = 'Drawing the figures...'; try { const x = await opt.extra(); Object.keys(x).forEach(k => { f[root + '/' + k] = x[k]; }); } catch (e) { } }
      f[root + '/README.txt'] = 'Outputs of the Daisy experiment ' + root + '\r\n\r\nRaw/<run>/outputs/  the files exactly as Daisy 7.1.14 wrote them (.dlf logs with tab separated columns, daisy.log)\r\nRaw/<run>/setup/    Runfile.dai and the files it includes, to repeat the run\r\nOutputs/            what SWAFL made from the runs: README, plan.json, design.csv, results.csv and every figure (PNG at 300 dpi with its numbers as CSV)\r\n';
      const z = window.DaisyExp.zip(f), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([z], { type: 'application/zip' })); a.download = SWAFLDate.name(root + (all ? '-everything.zip' : '-chosen-files.zip')); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); stt.textContent = Object.keys(f).length + ' files saved in one .zip.'; };
    if (q('view') && opt.view) q('view').onclick = ev => opt.view(ev);
    q('savesel').onclick = () => save(false); q('saveall').onclick = () => save(true);

  }
  /* the full-screen editor of the outputs of Daisy, in the style of Notepad++: a tab for every open file, line numbers, find, wrap, the
     columns of a .dlf in colour; Keep the changes (Ctrl+S) puts the edited text in place of the file in every save of this page, the text as
     Daisy wrote it is kept; Download this file saves it; on the desktop, Save into the run folder writes it to Edited/ in the folder of the run */
  const OPEN = [];
  function openEditor(runs, i, n, listHost) {
    if (!window.DaisyCode) return; let ov = document.getElementById('dzRawEd');
    if (!ov) { ov = document.createElement('div'); ov.id = 'dzRawEd'; ov.style.cssText = 'position:fixed;inset:0;z-index:100006;background:#f0f0f0;display:flex;flex-direction:column;font:12px Segoe UI,Tahoma,sans-serif';
      ov.innerHTML = '<div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:#dcdcdc;border-bottom:1px solid #a0a0a0"><b>Daisy outputs</b><span style="color:#555">view and edit before saving; Esc or Close returns</span><span style="flex:1"></span><button class="btn" data-ed="close">Close</button></div><div data-ed="tabs" style="display:flex;gap:2px;padding:4px 6px 0;background:#f0f0f0;border-bottom:1px solid #a0a0a0;overflow-x:auto;white-space:nowrap"></div><div data-ed="host" style="flex:1;min-height:0"></div>';
      document.body.appendChild(ov); ov.querySelector('[data-ed="close"]').onclick = () => close();
      ov._esc = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }; }
    const close = () => { document.removeEventListener('keydown', ov._esc, true); ov.remove(); OPEN.length = 0; };
    document.addEventListener('keydown', ov._esc, true);
    const key = i + '|' + n; if (!OPEN.some(o => o.key === key)) OPEN.push({ key, i, n }); show(key);
    async function show(k) {
      const o = OPEN.find(x => x.key === k), r = runs[o.i], tabs = ov.querySelector('[data-ed="tabs"]'), host = ov.querySelector('[data-ed="host"]');
      tabs.innerHTML = OPEN.map(x => { const rr = runs[x.i], on = x.key === k, ed = EDIT[ek(rr, x.n)] != null; return '<span data-tab="' + esc(x.key) + '" style="cursor:pointer;padding:3px 10px;border:1px solid #a0a0a0;border-bottom:0;border-radius:3px 3px 0 0;background:' + (on ? '#fff;font-weight:600' : '#e0e0e0') + '">' + (ed ? '<span style="color:#c00">●</span> ' : '') + esc((rr.id || '') + ' ' + x.n) + ' <b data-x="' + esc(x.key) + '" title="close this file" style="color:#888;margin-left:4px">×</b></span>'; }).join('');
      tabs.querySelectorAll('[data-tab]').forEach(t => t.onclick = e => { if (e.target.dataset.x) { const j = OPEN.findIndex(z => z.key === e.target.dataset.x); OPEN.splice(j, 1); if (!OPEN.length) { close(); return; } show(OPEN[Math.max(0, j - 1)].key); return; } show(t.dataset.tab); });
      host.innerHTML = '<div style="padding:20px;color:#555">Reading ' + esc(o.n) + '...</div>'; const text = await get(r, o.n); if (text == null) { host.innerHTML = '<div style="padding:20px">This file can be read only on the computer that ran it.</div>'; return; }
      const desk = !!(window.swafl && window.swafl.daisyWrite && r.saved), extra = [['Download this file', t => save0(sane(r.id || 'run') + '_' + o.n, t, /\.csv$/i.test(o.n) ? 'text/csv' : 'text/plain')]];
      if (EDIT[ek(r, o.n)] != null) extra.push(['Back to the text of Daisy', async () => { delete EDIT[ek(r, o.n)]; mark(listHost, o.i, o.n, ''); show(k); }]);
      if (desk) extra.push(['Save into the run folder', async t => { try { const w = await window.swafl.daisyWrite(r.saved, { ['Edited/' + o.n]: t }); alertBar(w && w.ok ? 'Written to ' + r.saved + (/[\\/]$/.test(r.saved) ? '' : '/') + 'Edited/' + o.n + ' (the file Daisy wrote is left as it was).' : 'Could not write: ' + ((w && w.err) || '')); } catch (e) { alertBar('Could not write: ' + e.message); } }]);
      window.DaisyCode.editor(host, { text, name: (r.id ? r.id + ' / ' : '') + o.n, theme: 'npp', extra, onSave: t => { EDIT[ek(r, o.n)] = t; mark(listHost, o.i, o.n, 'edited'); alertBar('Changes kept: every save on this page uses the edited ' + o.n + '; the text Daisy wrote is kept beside it in the .zip.'); show(k); } });
      const box = host.querySelector('.dzc'); if (box) { box.style.height = '100%'; box.style.borderRadius = '0'; } const fb = host.querySelector('[data-c="full"]'); if (fb) fb.style.display = 'none';
    }
    function alertBar(t) { let b = ov.querySelector('[data-ed="msg"]'); if (!b) { b = document.createElement('div'); b.dataset.ed = 'msg'; b.style.cssText = 'padding:3px 10px;background:#ffffe1;border-top:1px solid #c0c0c0'; ov.appendChild(b); } b.textContent = t; }
  }
  const save0 = (name, text, mime) => save(name, text, mime);
  const mark = (host, i, n, t) => { if (!host) return; const m = host.querySelector('[data-ra-mark="' + i + '|' + n.replace(/"/g, '\\"') + '"]'); if (m) m.textContent = t; };
  return { html, bind, describe, collect, htmlAll, bindAll, openEditor, edited: () => Object.keys(EDIT) };
})();
