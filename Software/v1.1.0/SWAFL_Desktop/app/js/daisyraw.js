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
  const get = async (r, n) => { if (r.raw && r.raw[n] != null) return r.raw[n]; if (r.saved && window.swafl && window.swafl.daisyReadFile) return await window.swafl.daisyReadFile(r.saved.replace(/[\\/]+$/, '') + '/Run/' + n); return null; };
  // the HTML of the panel for one or several runs; bind() makes its buttons work
  function html(runs, opt) {
    opt = opt || {}; runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!runs.length) return '';
    const desk = !!(window.swafl && window.swafl.isDesktop), root = runs.find(r => r.saved), folder = root ? (opt.folder || root.saved) : '';
    let h = '<div class="dzpan dzraw"><h3 style="margin:0 0 4px">The raw output of Daisy</h3><p class="pnote" style="margin:0 0 6px">These are the files exactly as Daisy wrote them, before any figure or summary of SWAFL: SWAFL has not changed a number in them. Each .dlf file is a table with tab separated columns (the header lines name the log, and the two lines above the numbers give each column and its unit). Open them in Excel or any text editor, read them in R with <i>daisyrVis::read_dlf</i> or in Python with <i>daisypy-io</i>, or use them in any other program. The figures above are drawn from these files and nothing else, so each figure can be checked against them.</p>';
    if (folder) h += '<p style="margin:4px 0"><b>Kept on this computer:</b> <code>' + esc(folder) + '</code> ' + (desk ? '<button class="btn" data-raw-open="' + esc(opt.folder ? opt.folder : root.saved) + '">Open the folder</button>' : '') + '<br><span class="pnote">The folder holds, for every run, <code>Run/</code> with the logs and daisy.log and the set-up that produced them (Runfile.dai and the files it includes), so the run can be repeated with any Daisy 7.1 or checked later. It stays there until you delete it.</span></p>';
    else if (desk) h += '<p class="pnote" style="margin:4px 0">The run folder could not be kept on this computer' + (runs[0].savedError ? ' (' + esc(runs[0].savedError) + ')' : '') + '; the buttons below still give every file.</p>';
    h += '<div class="dzrow"><button class="btn pri" data-raw-zip="out">Download all raw outputs (.zip)</button><button class="btn" data-raw-zip="all">Download outputs and set-up (.zip)</button></div>';
    h += '<div style="overflow:auto;max-height:340px"><table class="dzt"><tr><th>Run</th><th>File</th><th>What it holds</th><th>Rows</th><th>Columns</th><th>Size</th><th></th></tr>';
    runs.forEach((r, i) => filesOf(r).forEach(n => { const parsed = r.logs && r.logs[(window.DaisyScen && window.DaisyScen.logKey ? window.DaisyScen.logKey(n) : '')]; h += '<tr><td>' + esc(r.label || r.id) + '</td><td><code>' + esc(n) + '</code></td><td>' + esc(describe(n)) + '</td><td>' + (parsed ? parsed.n : '') + '</td><td>' + (parsed ? parsed.cols.length : '') + '</td><td>' + size(sizeOf(r, n)) + '</td><td><button class="btn" data-raw-file="' + i + '|' + esc(n) + '">Download</button></td></tr>'; }));
    return h + '</table></div></div>';
  }
  function bind(host, runs, opt) {
    runs = runs.filter(r => r && (r.raw || r.rawIndex || r.saved)); if (!host) return; opt = opt || {};
    host.querySelectorAll('[data-raw-open]').forEach(b => b.onclick = async () => { try { await window.swafl.daisyOpenFolder(b.dataset.rawOpen); } catch (e) { } });
    host.querySelectorAll('[data-raw-file]').forEach(b => b.onclick = async () => { const k = b.dataset.rawFile.indexOf('|'), r = runs[+b.dataset.rawFile.slice(0, k)], n = b.dataset.rawFile.slice(k + 1), t = r ? await get(r, n) : null; if (t != null) save((runs.length > 1 ? sane(r.id) + '_' : '') + n, t, /\.csv$/i.test(n) ? 'text/csv' : 'text/plain'); });
    host.querySelectorAll('[data-raw-zip]').forEach(b => b.onclick = async () => {
      if (!window.DaisyExp || !window.DaisyExp.zip) return; const all = b.dataset.rawZip === 'all', f = {};
      for (const r of runs) { const d = (opt.name || 'daisy') + '/' + sane(r.id || r.label) + '/'; for (const n of filesOf(r)) { const t = await get(r, n); if (t != null) f[d + 'outputs/' + n] = t; } if (all) { const s = r.setup || {}; Object.keys(s).forEach(n => { f[d + 'setup/' + n] = s[n]; }); if (!r.setup && r.runfile) f[d + 'setup/Run/Runfile.dai'] = r.runfile; } }
      f[(opt.name || 'daisy') + '/README.txt'] = 'Raw output of Daisy 7.1.14, exactly as written by the program.\r\n\r\noutputs/  the log files of each run (.dlf tables with tab separated columns, .csv, daisy.log)\r\nsetup/    the files that were given to Daisy (Run/Runfile.dai and the files it includes; weather and soil of the run)\r\n\r\nTo repeat a run: put the setup folder in an empty folder and run  daisy-bin.exe Run/Runfile.dai  from the Run folder with a Daisy 7.1 installation.\r\nEvery .dlf starts with header lines (VERSION, LOGFILE, RUN, SIM, ...), then a line of dashes, the column names, the units, and the numbers.\r\n';
      const z = window.DaisyExp.zip(f), blob = new Blob([z], { type: 'application/zip' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = SWAFLDate.name((opt.name || 'daisy') + (all ? '-outputs-and-setup.zip' : '-raw-outputs.zip')); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
  }
  return { html, bind, describe };
})();
