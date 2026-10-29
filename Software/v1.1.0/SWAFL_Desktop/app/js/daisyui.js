/* Daisy workbench: collects Daisy files (logs, weather, set-up files, library), plots and tests them, edits .dai files,
   runs a Richards-equation soil column from the Daisy horizon library, calibrates parameters, and brings Daisy / DMI weather into SWAFL.
   Needs daisyio.js (formats) and daisycalc.js (hydraulics, Richards, denitrification, optimisers, DMI). */
'use strict';
const DaisyUI = (() => {
  const IO = window.DaisyIO, CA = window.DaisyCalc, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const OKI = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9', '#7a6f00', '#444444'];
  const SPEC = ['#2b83ba', '#5aa6b4', '#8fcfa6', '#c4e6a8', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f'];
  // the tabs follow what a person does: ask a question, give the data, look at the results, build and calibrate, learn
  const GROUPS = [['Start', [['start', 'Start here']]], ['1 Your data', [['data', 'My data'], ['weather', 'Weather stations'], ['library', 'Library'], ['files', 'Files']]], ['2 Experiments', [['exp', 'Experiments'], ['scen', '↳ Scenarios']]], ['3 Look at results', [['proc', 'Processes'], ['plot', 'Plot'], ['balance', 'Mass balance'], ['compare', 'Compare and test']]], ['4 Decide in the SWAFL project', [['dss', 'To the SWAFL project']]], ['Tools: build and test', [['editor', 'Set-up editor'], ['richards', 'Soil column'], ['deni', 'Process curves'], ['calib', 'Calibrate']]], ['Tools: learn', [['docs', 'Model and documentation']]]];
  const TABS = GROUPS.reduce((a, g) => a.concat(g[1]), []);
  const S = { logs: {}, tab: 'start', lib: null, idx: null, rich: null, anim: null, cal: null, dai: '', kind: 'horizons', txt: {} };
  const $ = id => document.getElementById('dz' + id);
  const isDesk = () => !!(window.swafl && window.swafl.isDesktop);
  const fmt = (v, d) => v == null || !isFinite(v) ? '-' : (Math.abs(v) >= 1e5 || (v !== 0 && Math.abs(v) < 1e-3) ? v.toExponential(2) : (+v).toFixed(d == null ? 3 : d).replace(/\.?0+$/, ''));
  const dstr = t => new Date(t).toISOString().slice(0, 10);
  const note = (id, m, bad) => { const e = $(id); if (e) { e.innerHTML = m; e.style.color = bad ? '#b3261e' : ''; } };

  // ---------------------------------------------------------------- data access
  async function getText(path) { if (S.txt[path]) return S.txt[path]; const r = await fetch('data/daisy/' + path); if (!r.ok) throw new Error(path + ': HTTP ' + r.status); return (S.txt[path] = await r.text()); }
  async function getIdx() { return S.idx || (S.idx = JSON.parse(await getText('index.json'))); }
  async function getLib() { return S.lib || (S.lib = JSON.parse(await getText('library.json'))); }
  function addLog(d, as) { const nm = as || d.name; d.name = nm; S.logs[nm] = d; return nm; }
  function parseAny(name, text) { if (/\.csv$/i.test(name)) return IO.readCsv(text, name); if (/\.dwf$/i.test(name)) { const w = IO.readDwf(text, name); return w; } return IO.readDlf(text, name); }
  const buf = t => new TextEncoder().encode(t).buffer;
  const names = () => Object.keys(S.logs);
  const sel = (id, arr, cur, attr) => '<select id="dz' + id + '" ' + (attr || '') + '>' + arr.map(a => { const v = Array.isArray(a) ? a[0] : a, l = Array.isArray(a) ? a[1] : a; return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
  const logSel = (id, cur) => sel(id, names().length ? names() : [''], cur);
  const download = (name, text, mime) => { const b = new Blob([text], { type: mime || 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = SWAFLDate.name(name); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };

  // ---------------------------------------------------------------- canvas charts
  function setup(cv, h) { const w = Math.max(320, cv.parentNode.clientWidth - 4), r = Math.max(2, window.devicePixelRatio || 1); cv.width = w * r; cv.height = h * r; cv.style.width = w + 'px'; cv.style.height = h + 'px'; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.clearRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.font = '11px Segoe UI, Arial, sans-serif'; return { g, w, h }; }
  function nice(lo, hi, n) { if (!(hi > lo)) { hi = lo + 1; } const s = (hi - lo) / (n || 5), m = Math.pow(10, Math.floor(Math.log10(s))), f = s / m, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m, a = Math.floor(lo / st) * st, t = []; for (let v = a, k = 0; k < 60; v += st, k++) { t.push(+v.toPrecision(12)); if (v >= hi - st * 1e-9) break; } return { lo: t[0], hi: t[t.length - 1], t }; }
  function lineChart(cv, series, o) { if (window.DaisyPlot) return window.DaisyPlot.line(cv, series, o); return lineChart0(cv, series, o); }
  function lineChart0(cv, series, o) {
    o = o || {}; const { g, w, h } = setup(cv, o.h || 280), L = 58, R = 12, T = o.noLegend ? 12 : 26, B = 36, pw = w - L - R, ph = h - T - B;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    series.forEach(s => s.x.forEach((x, i) => { const y = s.y[i]; if (isFinite(x) && isFinite(y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }));
    (o.hlines || []).forEach(l => { if (l.y < y0) y0 = l.y; if (l.y > y1) y1 = l.y; });
    if (!isFinite(x0)) { g.fillStyle = '#666'; g.fillText('Nothing to draw.', L, T + 20); return null; }
    if (o.zero && y0 > 0) y0 = 0; const ny = nice(y0, y1, 5); if (o.ylo != null) ny.lo = o.ylo; if (o.yhi != null) ny.hi = o.yhi; if (x1 <= x0) x1 = x0 + 1;
    const X = x => L + (x - x0) / (x1 - x0) * pw, Y = y => T + ph - (y - ny.lo) / (ny.hi - ny.lo) * ph;
    g.strokeStyle = '#e4e7ec'; g.fillStyle = '#555'; g.lineWidth = 1; g.textAlign = 'right';
    ny.t.forEach(v => { if (v < ny.lo - 1e-9 || v > ny.hi + 1e-9) return; const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(w - R, y); g.stroke(); g.fillText(fmt(v, 3), L - 5, y + 3); });
    g.textAlign = 'center'; const tm = o.time, nx = nice(x0, x1, Math.max(3, Math.floor(pw / 90)));
    if (tm) { const yrs = (x1 - x0) / 3.15e10; let step = yrs > 12 ? 5 : yrs > 5 ? 2 : yrs > 1.5 ? 1 : 0; if (step) { const y_a = new Date(x0).getUTCFullYear(), y_b = new Date(x1).getUTCFullYear(); for (let yy = y_a; yy <= y_b + 1; yy += step) { const t = Date.UTC(yy, 0, 1); if (t < x0 || t > x1) continue; g.beginPath(); g.moveTo(X(t), T); g.lineTo(X(t), T + ph); g.stroke(); g.fillText(String(yy), X(t), h - B + 14); } } else { for (let k = 0; k <= 5; k++) { const t = x0 + (x1 - x0) * k / 5; g.fillText(dstr(t).slice(2), X(t), h - B + 14); } } }
    else nx.t.forEach(v => { if (v < x0 - 1e-9 || v > x1 + 1e-9) return; g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), T + ph); g.stroke(); g.fillText(fmt(v, 2), X(v), h - B + 14); });
    g.strokeStyle = '#333'; g.strokeRect(L, T, pw, ph);
    g.fillStyle = '#333'; g.textAlign = 'center'; if (o.xt) g.fillText(o.xt, L + pw / 2, h - 6); if (o.yt) { g.save(); g.translate(12, T + ph / 2); g.rotate(-Math.PI / 2); g.fillText(o.yt, 0, 0); g.restore(); }
    g.save(); g.beginPath(); g.rect(L, T, pw, ph); g.clip();
    (o.hlines || []).forEach(l => { g.strokeStyle = l.color || '#999'; g.setLineDash(l.dash || [5, 4]); g.beginPath(); g.moveTo(L, Y(l.y)); g.lineTo(w - R, Y(l.y)); g.stroke(); g.setLineDash([]); });
    series.forEach((s, k) => {
      const c = s.color || OKI[k % OKI.length]; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = s.lw || 1.6;
      if (s.bars) { const bw = Math.max(2, pw / s.x.length * 0.7); s.x.forEach((x, i) => { if (isFinite(s.y[i])) g.fillRect(X(x) - bw / 2, Math.min(Y(0), Y(s.y[i])), bw, Math.abs(Y(s.y[i]) - Y(0))); }); return; }
      if (!s.pts || s.line) { g.beginPath(); let on = false; s.x.forEach((x, i) => { const y = s.y[i]; if (!isFinite(x) || !isFinite(y)) { on = false; return; } if (!on) { g.moveTo(X(x), Y(y)); on = true; } else if (s.step) { g.lineTo(X(x), Y(s.y[i - 1])); g.lineTo(X(x), Y(y)); } else g.lineTo(X(x), Y(y)); }); g.stroke(); }
      if (s.pts) s.x.forEach((x, i) => { if (isFinite(x) && isFinite(s.y[i])) { g.beginPath(); g.arc(X(x), Y(s.y[i]), s.r || 2.6, 0, 7); g.fill(); } });
    });
    g.restore();
    if (!o.noLegend) { g.textAlign = 'left'; let lx = L; series.forEach((s, k) => { if (!s.name) return; const c = s.color || OKI[k % OKI.length]; g.fillStyle = c; g.fillRect(lx, 8, 14, 4); g.fillStyle = '#333'; g.fillText(s.name, lx + 18, 13); lx += 26 + g.measureText(s.name).width; }); }
    const geo = { X, Y, x0, x1, L, T, pw, ph, series, tm }; cv._geo = geo;
    if (!cv._hov) { cv._hov = 1; cv.addEventListener('mousemove', e => { const gg = cv._geo; if (!gg) return; const r = cv.getBoundingClientRect(), mx = (e.clientX - r.left); if (mx < gg.L || mx > gg.L + gg.pw) return; const xv = gg.x0 + (mx - gg.L) / gg.pw * (gg.x1 - gg.x0); let tip = (gg.tm ? dstr(xv) : fmt(xv, 3)) + ' | '; gg.series.forEach(s => { let b = -1, bd = Infinity; s.x.forEach((x, i) => { const dd = Math.abs(x - xv); if (dd < bd && isFinite(s.y[i])) { bd = dd; b = i; } }); if (b >= 0) tip += (s.name || 'y') + ' ' + fmt(s.y[b], 4) + '  '; }); cv.title = tip; const ro = cv.parentNode.querySelector('.dzro'); if (ro) ro.textContent = tip; }); }
    return geo;
  }
  const rampAt = (v, lo, hi, n) => { n = n || 8; const k = Math.max(0, Math.min(n - 1, Math.floor((v - lo) / (hi - lo || 1) * n))); return SPEC[Math.round(k / (n - 1) * (SPEC.length - 1))]; };
  function heatChart(cv, tt, zz, vv, o) { if (window.DaisyPlot) return window.DaisyPlot.heat(cv, tt, zz, vv, o); return heatChart0(cv, tt, zz, vv, o); }
  function heatChart0(cv, tt, zz, vv, o) {
    o = o || {}; const { g, w, h } = setup(cv, o.h || 300), L = 58, R = 130, T = 12, B = 34, pw = w - L - R, ph = h - T - B;
    const ts = Array.from(new Set(tt)).sort((a, b) => a - b), zs = Array.from(new Set(zz)).sort((a, b) => b - a), ti = new Map(ts.map((t, i) => [t, i])), zi = new Map(zs.map((z, i) => [z, i]));
    if (!ts.length || !zs.length) { g.fillText('Nothing to draw.', L, 30); return; }
    let lo = Infinity, hi = -Infinity; vv.forEach(v => { if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }); if (o.lo != null) lo = o.lo; if (o.hi != null) hi = o.hi; const nn = nice(lo, hi, 8), NC = Math.max(2, Math.min(9, nn.t.length - 1)); lo = nn.lo; hi = nn.hi;
    const cw = pw / ts.length, zmin = Math.min.apply(null, zs), zmax = Math.max.apply(null, zs), zy = z => T + (zmax - z) / (zmax - zmin || 1) * ph;
    const cls = v => Math.max(0, Math.min(NC - 1, Math.floor((v - lo) / (hi - lo || 1) * NC)));
    for (let k = 0; k < vv.length; k++) { const v = vv[k]; if (!isFinite(v)) continue; const a = ti.get(tt[k]), b = zi.get(zz[k]); const yA = zy(zs[b]), yB = b + 1 < zs.length ? zy(zs[b + 1]) : zy(zs[b]) + 6, yT = b > 0 ? zy(zs[b - 1]) : zy(zs[b]) - 6; g.fillStyle = SPEC[Math.round(cls(v) / (NC - 1) * (SPEC.length - 1))]; const y0 = (yA + yT) / 2 + (b === 0 ? 3 : 0), y1 = (yA + yB) / 2; g.fillRect(L + a * cw, Math.min(y0, y1), Math.max(1, cw + 0.6), Math.abs(y1 - y0) + 0.6); }
    g.strokeStyle = '#333'; g.strokeRect(L, T, pw, ph); g.fillStyle = '#333'; g.textAlign = 'right'; nice(zmin, zmax, 6).t.forEach(z => { if (z < zmin || z > zmax) return; g.fillText(String(z), L - 4, zy(z) + 3); }); g.textAlign = 'center';
    const hasT = o.time; for (let k = 0; k <= 5; k++) { const i = Math.min(ts.length - 1, Math.round((ts.length - 1) * k / 5)); g.fillText(hasT ? dstr(ts[i]).slice(2) : String(Math.round(ts[i])), L + (i + 0.5) * cw, h - B + 14); }
    g.save(); g.translate(12, T + ph / 2); g.rotate(-Math.PI / 2); g.fillText(o.yt || 'depth (cm)', 0, 0); g.restore();
    g.textAlign = 'left'; g.fillText(o.unit || '', w - R + 14, T + 8); for (let k = 0; k < NC; k++) { const y = T + 14 + (NC - 1 - k) * 22; g.fillStyle = SPEC[Math.round(k / (NC - 1) * (SPEC.length - 1))]; g.fillRect(w - R + 14, y, 22, 18); g.strokeStyle = '#333'; g.strokeRect(w - R + 14, y, 22, 18); g.fillStyle = '#222'; g.fillText(fmt(lo + (hi - lo) * k / NC, 3) + ' to ' + fmt(lo + (hi - lo) * (k + 1) / NC, 3), w - R + 40, y + 13); }
  }
  const savePng = (cv, name) => window.DaisyCite ? window.DaisyCite.png(cv, name) : cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = SWAFLDate.name(name); a.click(); });
  const csvOf = (cols, rows) => cols.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');

  // ---------------------------------------------------------------- tab: files
  function tFiles() {
    return '<p class="pnote">Collect Daisy output logs (.dlf), weather (.dwf), tables (.csv) and set-up files (.dai). Everything loaded here is available to the plots, the mass balance, the comparison, the calibration and the soil column.</p>' +
      '<div class="dzrow"><button class="btn" id="dzAddB">Add files...</button><button class="btn" id="dzAddF">Add a folder...</button><button class="btn" id="dzAllB">Load all bundled examples</button><span id="dzFst" class="pnote"></span></div>' +
      '<input type="file" id="dzIn" multiple hidden accept=".dlf,.csv,.dwf,.txt,.dai,.dk"><input type="file" id="dzInF" webkitdirectory multiple hidden>' +
      '<div id="dzDrop" class="dzdrop">Drop Daisy files or a folder here</div>' +
      '<h4>Bundled examples (from the daisy-model repositories)</h4><div id="dzBund" class="pnote">Loading the list...</div>' +
      '<h4>Loaded logs</h4><div id="dzReg"></div>';
  }
  async function readFiles(files) {
    let n = 0, bad = 0; const dai = [];
    for (const f of files) {
      const nm = f.webkitRelativePath || f.name; if (/\.dai$/i.test(f.name)) { S.dai = await f.text(); S.daiName = f.name; dai.push(f.name); continue; }
      if (!/\.(dlf|csv|dwf|txt)$/i.test(f.name)) continue;
      try { const d = parseAny(f.name, await f.text()); if (d.n) { addLog(d, nm.length > 50 ? f.name : nm); n++; } else bad++; } catch (e) { bad++; }
    }
    note('Fst', n + ' file(s) read' + (dai.length ? ', set-up loaded into the editor: ' + dai.join(', ') : '') + (bad ? ', ' + bad + ' could not be read' : '') + '.', !n && !dai.length); regList(); refreshSelects();
  }
  function regList() {
    const e = $('Reg'); if (!e) return; const ns = names();
    e.innerHTML = ns.length ? '<table class="dzt"><tr><th>Name</th><th>Rows</th><th>Columns</th><th>Period</th><th></th></tr>' + ns.map(k => { const d = S.logs[k]; return '<tr><td>' + esc(k) + '</td><td>' + d.n + '</td><td>' + d.cols.length + '</td><td>' + (d.time && d.n ? dstr(d.time[0]) + ' to ' + dstr(d.time[d.n - 1]) : '-') + '</td><td><a href="#" data-dl="' + esc(k) + '">save</a> &nbsp; <a href="#" data-rm="' + esc(k) + '">remove</a></td></tr>'; }).join('') + '</table>' : '<div class="pnote">Nothing loaded yet.</div>';
    e.querySelectorAll('[data-rm]').forEach(a => a.onclick = ev => { ev.preventDefault(); delete S.logs[a.dataset.rm]; regList(); refreshSelects(); });
    e.querySelectorAll('[data-dl]').forEach(a => a.onclick = ev => { ev.preventDefault(); const d = S.logs[a.dataset.dl]; download(a.dataset.dl.replace(/.*\//, '').replace(/\.\w+$/, '') + '.dlf', IO.writeDlf(d)); });
  }
  async function loadBundled(file) { const d = parseAny(file, await getText('dlf/' + file)); addLog(d, file); return d; }
  async function bFiles() {
    const f = $('In'); $('AddB').onclick = () => f.click(); $('AddF').onclick = () => $('InF').click(); f.onchange = () => readFiles(Array.from(f.files)); $('InF').onchange = () => readFiles(Array.from($('InF').files));
    const dr = $('Drop'); ['dragover', 'dragenter'].forEach(k => dr.addEventListener(k, e => { e.preventDefault(); dr.classList.add('on'); })); dr.addEventListener('dragleave', () => dr.classList.remove('on'));
    dr.addEventListener('drop', async e => { e.preventDefault(); dr.classList.remove('on'); const items = e.dataTransfer.items, fl = []; const walk = async en => { if (en.isFile) await new Promise(r => en.file(x => { fl.push(x); r(); })); else if (en.isDirectory) { const rd = en.createReader(); let ch; do { ch = await new Promise(r => rd.readEntries(r)); for (const c of ch) await walk(c); } while (ch.length); } }; if (items && items[0] && items[0].webkitGetAsEntry) { for (const it of items) { const en = it.webkitGetAsEntry(); if (en) await walk(en); } } else Array.from(e.dataTransfer.files).forEach(x => fl.push(x)); readFiles(fl); });
    $('AllB').onclick = async () => { note('Fst', 'Reading the bundled examples...'); const ix = await getIdx(); let n = 0; for (const d of ix.dlf) { try { await loadBundled(d.file); n++; } catch (e) {} } note('Fst', n + ' bundled logs read.'); regList(); refreshSelects(); };
    try { const ix = await getIdx(); $('Bund').innerHTML = '<table class="dzt">' + ix.dlf.map(d => '<tr><td>' + esc(d.file) + '</td><td>' + esc(d.desc) + '</td><td><a href="#" data-b="' + esc(d.file) + '">load</a></td></tr>').join('') + '</table>'; $('Bund').querySelectorAll('[data-b]').forEach(a => a.onclick = async ev => { ev.preventDefault(); try { await loadBundled(a.dataset.b); note('Fst', a.dataset.b + ' read.'); regList(); refreshSelects(); } catch (e) { note('Fst', e.message, 1); } }); } catch (e) { note('Bund', 'The bundled examples could not be listed: ' + esc(e.message), 1); }
    regList();
  }
  function refreshSelects() { ['PLog', 'BLog', 'CA', 'CB', 'CTgt'].forEach(id => { const e = $(id); if (!e) return; const cur = e.value; e.innerHTML = (names().length ? names() : ['']).map(n => '<option' + (n === cur ? ' selected' : '') + '>' + esc(n) + '</option>').join(''); e.dispatchEvent(new Event('change')); }); }

  // ---------------------------------------------------------------- tab: plot
  function tPlot() {
    return '<div class="dzrow"><label>Log</label>' + logSel('PLog') + '<label>View</label>' + sel('PMode', [['ts', 'Time series'], ['ann', 'Annual values'], ['heat', 'Depth profile through time'], ['prof', 'Profile at a date (animate)']]) + '<label>From</label><input id="dzPFrom" type="date"><label>To</label><input id="dzPTo" type="date"></div>' +
      '<div class="dzrow"><label>Columns</label><select id="dzPCols" multiple size="6" style="min-width:230px"></select><div><label><input type="checkbox" id="dzPStep"> steps</label><br><label><input type="checkbox" id="dzPZero"> start at zero</label><br><label id="dzPAggL" hidden>Annual<br>' + sel('PAgg', [['s', 'sum'], ['m', 'mean'], ['mx', 'maximum'], ['mn', 'minimum']]) + '</label></div>' +
      '<div id="dzPSl" hidden style="flex:1;min-width:220px"><label>Date <span id="dzPSd"></span></label><input id="dzPSlide" type="range" min="0" max="0" value="0" style="width:100%"><button class="btn" id="dzPPlay">Play</button></div></div>' +
      '<div class="dzrow"><button class="btn pri" id="dzPDraw">Draw</button><button class="btn" id="dzPPng">Picture (PNG)</button><button class="btn" id="dzPCsv">Table (CSV)</button><span id="dzPst" class="pnote"></span></div>' +
      '<div><canvas id="dzPcv"></canvas><div class="dzro pnote">Move over the chart to read the values.</div></div>';
  }
  function bPlot() {
    const fill = () => { const d = S.logs[$('PLog').value], m = $('PMode').value, c = $('PCols'); if (!d) { c.innerHTML = ''; return; } let list; if (m === 'heat' || m === 'prof') list = Object.keys(IO.depthColumns(d)); else list = d.cols.filter((x, j) => !/^(year|month|mday|day|hour|minute|date|time)$/i.test(x) && d.data[j].some(isFinite)); c.multiple = !(m === 'heat' || m === 'prof'); c.innerHTML = list.map((x, i) => '<option' + (i === 0 || (m === 'ts' && i < 2 && list.length < 5) ? ' selected' : '') + '>' + esc(x) + '</option>').join(''); $('PAggL').hidden = m !== 'ann'; $('PSl').hidden = m !== 'prof'; if (d.time && d.n) { $('PFrom').value = dstr(d.time[0]); $('PTo').value = dstr(d.time[d.n - 1]); } };
    $('PLog').onchange = fill; $('PMode').onchange = () => { fill(); draw(); }; fill();
    const rng = d => { const f = $('PFrom').value ? Date.parse($('PFrom').value) : -Infinity, t = $('PTo').value ? Date.parse($('PTo').value) + 86399999 : Infinity; return d.time ? d.time.map((x, i) => x >= f && x <= t ? i : -1).filter(i => i >= 0) : d.data[0].map((_, i) => i); };
    function draw() {
      const d = S.logs[$('PLog').value]; if (!d) { note('Pst', 'Load a log in Files first.', 1); return; } const m = $('PMode').value, cols = Array.from($('PCols').selectedOptions).map(o => o.value), cv = $('Pcv'); S.plotCsv = null; if (!cols.length) { note('Pst', 'Choose a column.', 1); return; }
      const ix = rng(d); if (m === 'ts') {
        const x = ix.map(i => d.time ? d.time[i] : i), ser = cols.map((c, k) => ({ name: c + (d.units[c] ? ' [' + d.units[c] + ']' : ''), x, y: ix.map(i => IO.col(d, c)[i]), step: $('PStep').checked }));
        const us = Array.from(new Set(cols.map(c => d.units[c] || ''))); lineChart(cv, ser, { title: (cols.length === 1 ? cols[0] : 'Time series') + ' of ' + (d.name || 'the log'), time: !!d.time, zero: $('PZero').checked, xt: d.time ? 'Date' : 'Row', yt: us.length === 1 ? (us[0] || '') : '' }); S.plotCsv = csvOf([d.time ? 'date' : 'row'].concat(cols), ix.map(i => [d.time ? dstr(d.time[i]) : i].concat(cols.map(c => IO.col(d, c)[i])))); note('Pst', ix.length + ' rows.');
      } else if (m === 'ann') {
        if (!d.time) { note('Pst', 'This log has no dates, so annual values cannot be formed.', 1); return; }
        const ag = $('PAgg').value, ser = cols.map((c, k) => { const a = IO.annual(d, c), ys = Object.keys(a).map(Number).sort(); const sub = ys.filter(y => y >= new Date(d.time[ix[0]]).getUTCFullYear() && y <= new Date(d.time[ix[ix.length - 1]]).getUTCFullYear()); const val = y => { const o = a[y]; return ag === 's' ? o.s : ag === 'm' ? o.s / o.n : ag === 'mx' ? o.mx : o.mn; }; return { name: c, x: sub, y: sub.map(val), bars: cols.length === 1, pts: cols.length > 1, line: cols.length > 1 }; });
        lineChart(cv, ser, { title: 'Annual values of ' + (d.name || 'the log'), xint: true, zero: true, xt: 'Year', yt: { s: 'annual sum', m: 'annual mean', mx: 'annual maximum', mn: 'annual minimum' }[ag] }); S.plotCsv = csvOf(['year'].concat(cols), ser[0].x.map((y, i) => [y].concat(ser.map(s => s.y[i])))); note('Pst', ser[0].x.length + ' years.');
      } else {
        const v = cols[0], L = IO.depthLong(d, v); if (!L) { note('Pst', 'This log has no depth columns (names like "q @ -5.5").', 1); return; }
        if (m === 'heat') { const keep = []; L.t.forEach((t, k) => { if (!d.time || (t >= (d.time[ix[0]] || -Infinity) && t <= (d.time[ix[ix.length - 1]] || Infinity))) keep.push(k); }); heatChart(cv, keep.map(k => L.t[k]), keep.map(k => L.z[k]), keep.map(k => L.v[k]), { title: v + ' of ' + (d.name || 'the log'), time: !!d.time, unit: v + (L.unit ? ' [' + L.unit + ']' : '') }); note('Pst', keep.length + ' cells.'); }
        else { const dc = IO.depthColumns(d)[v], sl = $('PSlide'); sl.max = ix.length - 1; if (+sl.value > ix.length - 1) sl.value = 0; const k = ix[+sl.value] || 0; $('PSd').textContent = d.time ? dstr(d.time[k]) : 'row ' + k; const zs = dc.map(c => c.z), vs = dc.map(c => d.data[c.j][k]); let lo = Infinity, hi = -Infinity; dc.forEach(c => d.data[c.j].forEach(x => { if (isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } })); lineChart(cv, [{ name: v + ' at ' + $('PSd').textContent, x: vs, y: zs, pts: true, line: true }], { ylo: Math.min.apply(null, zs), yhi: 0, xt: v + (L.unit ? ' [' + L.unit + ']' : ''), yt: 'depth (cm)', noLegend: false }); S.plotCsv = csvOf(['depth_cm', v], zs.map((z, i) => [z, vs[i]])); }
      }
    }
    $('PDraw').onclick = draw; $('PSlide').oninput = draw; $('PPng').onclick = () => savePng($('Pcv'), 'daisy-plot.png'); $('PCsv').onclick = () => { if (!S.plotCsv) draw(); if (S.plotCsv) download('daisy-plot.csv', S.plotCsv, 'text/csv'); };
    $('PPlay').onclick = () => { if (S.anim) { clearInterval(S.anim); S.anim = null; $('PPlay').textContent = 'Play'; return; } $('PPlay').textContent = 'Stop'; S.anim = setInterval(() => { const sl = $('PSlide'); if (!sl) { clearInterval(S.anim); S.anim = null; return; } sl.value = (+sl.value + 1) % (+sl.max + 1); draw(); }, 120); };
    if (names().length) draw();
    else { note('Pst', 'No log is loaded yet, so the bundled example log of the water flux is loaded for you. Run a scenario or an experiment, or load your own logs in Files, to plot those.'); loadBundled('daily-water-flux.dlf').then(() => { refreshSelects(); fill(); const c = $('PCols'); if (c && c.options.length > 1) { Array.from(c.options).forEach((o, i) => { o.selected = i < 3; }); } draw(); }).catch(e => note('Pst', esc(e.message), 1)); }
  }

  // ---------------------------------------------------------------- tab: mass balance
  const PRE = { 'soil-chemical-110cm.dlf': { i: ['In-Matrix', 'In-Biopores', 'External', 'Transform', 'Tillage'], o: ['Decompose', 'Leak-Matrix', 'Leak-Biopores', 'Drain-Soil', 'Drain-Biopores', 'Uptake'], c: ['Content', 'Biopores'] } };
  function tBalance() {
    return '<p class="pnote">Input, output and content columns of a Daisy log. The balance (content + outputs - inputs) should stay at zero; the control chart shows its mean and the 2 and 3 standard-deviation limits, as in the Daisy balance plots.</p>' +
      '<div class="dzrow"><label>Log</label>' + logSel('BLog') + '<button class="btn" id="dzBGuess">Choose columns</button><label><input type="checkbox" id="dzBInit" checked> subtract initial content</label></div>' +
      '<div class="dzrow"><div><label>Inputs</label><br><select id="dzBI" multiple size="7"></select></div><div><label>Outputs</label><br><select id="dzBO" multiple size="7"></select></div><div><label>Content</label><br><select id="dzBC" multiple size="7"></select></div></div>' +
      '<div class="dzrow"><button class="btn pri" id="dzBRun">Balance</button><button class="btn" id="dzBPng">Picture (PNG)</button><span id="dzBst" class="pnote"></span></div><canvas id="dzBcv1"></canvas><canvas id="dzBcv2"></canvas><div id="dzBsum"></div>';
  }
  function bBalance() {
    const num = d => d.cols.filter((c, j) => !/^(year|month|mday|day|hour|minute)$/i.test(c) && d.data[j].some(isFinite));
    const fill = () => { const d = S.logs[$('BLog').value]; ['BI', 'BO', 'BC'].forEach(id => { $(id).innerHTML = d ? num(d).map(c => '<option>' + esc(c) + '</option>').join('') : ''; }); guess(); };
    const guess = () => { const d = S.logs[$('BLog').value]; if (!d) return; const key = $('BLog').value.replace(/.*\//, ''), p = PRE[key]; const pick = (id, arr, re) => { Array.from($(id).options).forEach(o => { o.selected = arr ? arr.includes(o.value) : re.test(o.value); }); }; pick('BI', p && p.i, /(fertil|deposit|seed|^in[- ]|residu|irrig|org-)/i); pick('BO', p && p.o, /(leach|uptake|denit|volat|loss|drain|harvest|runoff|leak|emission)/i); pick('BC', p && p.c, /(content|storage|stock)/i); };
    $('BLog').onchange = fill; $('BGuess').onclick = guess; fill();
    $('BRun').onclick = () => {
      const d = S.logs[$('BLog').value]; if (!d) { note('Bst', 'Load a log in Files first.', 1); return; } const g = id => Array.from($(id).selectedOptions).map(o => o.value); const I = g('BI'), O = g('BO'), C = g('BC'); if (!I.length && !O.length && !C.length) { note('Bst', 'Choose input, output and content columns.', 1); return; }
      const m = IO.massBalance(d, I, O, C, $('BInit').checked), x = d.time || m.bal.map((_, i) => i);
      lineChart($('Bcv1'), [{ name: 'inputs (cumulative)', x, y: m.inS }, { name: 'outputs (cumulative)', x, y: m.outS }, { name: 'content change', x, y: m.conS }], { time: !!d.time, yt: 'amount' });
      const hl = [{ y: 0, color: '#009E73', dash: [2, 3] }, { y: m.mean, color: '#444', dash: [] }, { y: m.mean + 2 * m.sd, color: '#E69F00' }, { y: m.mean - 2 * m.sd, color: '#E69F00' }, { y: m.mean + 3 * m.sd, color: '#D55E00' }, { y: m.mean - 3 * m.sd, color: '#D55E00' }];
      lineChart($('Bcv2'), [{ name: 'balance (content + out - in)', x, y: m.bal, color: '#0072B2' }], { time: !!d.time, hlines: hl, yt: 'balance error' });
      const sm = m.summary, row = (a, v) => '<tr><td>' + a + '</td><td>' + fmt(v, 4) + '</td></tr>', blk = (t, o) => '<tr><th colspan="2">' + t + '</th></tr>' + Object.keys(o).map(k => row(esc(k), o[k])).join('');
      $('Bsum').innerHTML = '<table class="dzt" style="max-width:520px">' + blk('Inputs', sm.Inputs) + blk('Outputs', sm.Outputs) + '<tr><th colspan="2">Content</th></tr>' + row('Initial', sm.InitialContent) + row('Final', sm.FinalContent) + blk('Balance', sm.Balance) + '<tr><th colspan="2">Balance error</th></tr>' + row('Mean', m.mean) + row('Standard deviation', m.sd) + row('Largest absolute', Math.max.apply(null, m.bal.map(Math.abs))) + '</table>';
      note('Bst', d.n + ' rows. Orange lines: mean +/- 2 sd; red lines: mean +/- 3 sd.');
    };
    $('BPng').onclick = () => savePng($('Bcv2'), 'daisy-balance.png');
  }

  // ---------------------------------------------------------------- tab: compare
  function tCompare() {
    return '<p class="pnote">Two logs are compared column by column against the smallest meaningful level (SML) of each quantity, as Daisy\'s own test suite does. Differences below the level count as identical.</p>' +
      '<div class="dzrow"><label>Log A</label>' + logSel('CA') + '<label>Log B</label>' + logSel('CB') + '<label>Precision</label><input id="dzCPr" value="1e-8" size="7"><label>Identical below</label><input id="dzCId" value="0.001" size="6"><button class="btn pri" id="dzCRun">Compare</button></div>' +
      '<div class="dzrow"><button class="btn" id="dzCBat">Batch: compare same-named logs from different folders</button><span id="dzCst" class="pnote"></span></div><div id="dzCout"></div>';
  }
  function cmpHtml(r, a, b) {
    const ok = r.same; return '<div class="' + (ok ? 'okbox' : 'warnbox') + '" style="padding:6px 10px;margin:6px 0"><b>' + esc(a) + ' &harr; ' + esc(b) + '</b>: ' + (r.identical ? 'identical' : ok ? 'similar (differences below the meaningful level)' : 'NOT similar') + '</div>' +
      (r.errors.length ? '<ul>' + r.errors.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul>' : '') + (r.notSimilar.length ? '<div><b>Not similar</b><ul>' + r.notSimilar.slice(0, 40).map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></div>' : '') + (r.notIdentical.length ? '<details><summary>' + r.notIdentical.length + ' small differences</summary><ul>' + r.notIdentical.slice(0, 60).map(e => '<li>' + esc(e) + '</li>').join('') + '</ul></details>' : '');
  }
  function bCompare() {
    const opt = () => ({ precision: parseFloat($('CPr').value) || 1e-8, identThr: parseFloat($('CId').value) || 0.001 });
    $('CRun').onclick = () => { const a = S.logs[$('CA').value], b = S.logs[$('CB').value]; if (!a || !b) { note('Cst', 'Load two logs in Files first.', 1); return; } try { $('Cout').innerHTML = cmpHtml(IO.compareDlf(a, b, opt()), a.name, b.name); note('Cst', ''); } catch (e) { note('Cst', e.message, 1); } };
    $('CBat').onclick = () => { const by = {}; names().forEach(k => { const b = k.replace(/.*\//, ''), f = k.indexOf('/') > 0 ? k.split('/')[0] : ''; (by[b] = by[b] || []).push({ k, f }); }); let h = '', n = 0; Object.keys(by).forEach(b => { const g = by[b]; for (let i = 1; i < g.length; i++) if (g[0].f !== g[i].f) { n++; try { h += cmpHtml(IO.compareDlf(S.logs[g[0].k], S.logs[g[i].k], opt()), g[0].k, g[i].k); } catch (e) { h += '<div class="warnbox">' + esc(g[0].k + ' / ' + g[i].k + ': ' + e.message) + '</div>'; } } }); $('Cout').innerHTML = h || '<div class="pnote">Load two folders (Files &rarr; Add a folder) that hold logs with the same names.</div>'; note('Cst', n + ' pair(s) compared.'); };
  }

  // ---------------------------------------------------------------- tab: editor
  function tEditor() {
    return '<div class="dzrow"><label>Open</label><select id="dzEs"><option value="">bundled set-up file...</option></select><button class="btn" id="dzEopen">Open file...</button><input type="file" id="dzEin" accept=".dai,.txt" hidden><button class="btn" id="dzEfmt">Tidy layout</button><button class="btn" id="dzEsave">Download</button><button class="btn" id="dzErun">Run Daisy</button><span id="dzEst" class="pnote"></span></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><div style="flex:3;min-width:360px"><div class="dzed"><pre id="dzEhl" aria-hidden="true"></pre><textarea id="dzEt" spellcheck="false" wrap="off"></textarea></div><div id="dzEerr" style="margin-top:4px"></div></div><div style="flex:1;min-width:210px"><b>Outline</b><div id="dzEol" class="dzol"></div><div id="dzEph"></div></div></div>';
  }
  async function bEditor() {
    const t = $('Et'), hl = $('Ehl'); t.value = S.dai || ''; const sync = () => { hl.innerHTML = IO.highlightDai(t.value) + '\n'; hl.scrollTop = t.scrollTop; hl.scrollLeft = t.scrollLeft; };
    const analyse = () => { S.dai = t.value; sync(); let ast; try { ast = IO.parseDai(t.value); } catch (e) { ast = { top: [], errors: [e.message] }; } $('Eerr').innerHTML = ast.errors.length ? '<div class="warnbox">' + ast.errors.slice(0, 8).map(esc).join('<br>') + '</div>' : (t.value.trim() ? '<div class="okbox" style="padding:4px 8px">Brackets and quotes are balanced.</div>' : '');
      const defs = IO.definitions(ast), rows = []; ast.top.forEach(x => { if (x.t === 'list' && x.v[0] && !/^def/.test(x.v[0].v)) rows.push({ kind: x.v[0].v, name: x.v[1] && x.v[1].t !== 'list' ? x.v[1].v : '', line: x.line }); }); defs.forEach(d => rows.push({ kind: 'def' + d.kind, name: d.name + (d.parent ? ' &larr; ' + d.parent : ''), line: d.line, raw: 1 }));
      rows.sort((a, b) => a.line - b.line); $('Eol').innerHTML = rows.map(r => '<div class="dzol-i" data-l="' + r.line + '"><span class="dzk">' + esc(r.kind) + '</span> ' + (r.raw ? r.name : esc(r.name)) + '</div>').join('') || '<span class="pnote">No definitions.</span>';
      $('Eol').querySelectorAll('[data-l]').forEach(e => e.onclick = () => { const ln = +e.dataset.l; const lines = t.value.split('\n'); let pos = 0; for (let i = 0; i < ln - 1 && i < lines.length; i++) pos += lines[i].length + 1; t.focus(); t.setSelectionRange(pos, pos + (lines[ln - 1] || '').length); t.scrollTop = Math.max(0, (ln - 4) * 15); sync(); });
      const ph = IO.placeholders(t.value); $('Eph').innerHTML = ph.length ? '<b>Placeholders</b><div class="pnote">Give each a value and download the filled set-up.</div>' + ph.map(p => '<div class="dzrow"><label style="min-width:80px">' + esc(p) + '</label><input data-ph="' + esc(p) + '" size="9"></div>').join('') + '<button class="btn" id="dzEfill">Download filled file</button>' : '';
      const fb = $('Efill'); if (fb) fb.onclick = () => { const v = {}; $('Eph').querySelectorAll('[data-ph]').forEach(i => { if (i.value !== '') v[i.dataset.ph] = i.value; }); download((S.daiName || 'setup').replace(/\.dai$/, '') + '-filled.dai', IO.fillTemplate(t.value, v)); }; };
    t.addEventListener('input', analyse); t.addEventListener('scroll', sync);
    try { const ix = await getIdx(); const es = $('Es'); ix.dai.forEach(d => { const o = document.createElement('option'); o.value = d.file; o.textContent = d.file + ' - ' + d.desc; es.appendChild(o); }); es.onchange = async () => { if (!es.value) return; t.value = await getText('dai/' + es.value); S.daiName = es.value; analyse(); note('Est', es.value + ' opened.'); }; } catch (e) {}
    $('Eopen').onclick = () => $('Ein').click(); $('Ein').onchange = async () => { const f = $('Ein').files[0]; if (f) { t.value = await f.text(); S.daiName = f.name; analyse(); note('Est', f.name + ' opened.'); } };
    $('Efmt').onclick = () => { const a = IO.parseDai(t.value); if (a.errors.length) { note('Est', 'Fix the bracket errors first.', 1); return; } t.value = IO.formatDai(a); analyse(); note('Est', 'Layout tidied.'); };
    $('Esave').onclick = () => download(S.daiName || 'setup.dai', t.value);
    $('Erun').onclick = async () => { if (!isDesk() || !window.swafl.daisyJob) { note('Est', 'Running Daisy needs the desktop app and the Daisy program on your computer. The soil column runs without Daisy, and logs of a run elsewhere can be loaded in the Files tab.', 1); return; } note('Est', 'Running Daisy...'); try { let info = await window.swafl.daisyInfo(); if (!info.found) info = await window.swafl.daisyChoose(); if (!info.found) { note('Est', 'No Daisy program chosen. Daisy comes with SWAFL (the folder daisy next to the program); if it is missing, unzip the whole SWAFL zip again.', 1); return; } const nm = (S.daiName || 'setup.dai').replace(/[^\w.\-]/g, '_'), r = await window.swafl.daisyJob({ main: 'Run/' + nm, files: { ['Run/' + nm]: t.value } }); const lg = Object.keys(r.logs || {}).filter(k => /\.dlf$/i.test(k)); note('Est', 'Daisy finished with code ' + r.code + ' in ' + Math.round(r.seconds || 0) + ' s. ' + lg.length + ' log(s) read into the file list.', r.code !== 0); lg.forEach(k => { try { const d = parseAny(k, r.logs[k]); if (d.n) addLog(d, 'run/' + k); } catch (e) {} }); if (r.code !== 0 || r.err) $('Eerr').innerHTML = '<pre class="dzpre">' + esc((r.err || r.out || '').slice(-2500)) + '</pre>'; refreshSelects(); regList(); } catch (e) { note('Est', e.message, 1); } };
    analyse();
  }

  // ---------------------------------------------------------------- tab: library
  const KINDS = [['horizons', 'Soil horizons'], ['crops', 'Crops'], ['fertilizers', 'Fertilisers'], ['chemicals', 'Chemicals'], ['actions', 'Management actions'], ['programs', 'Programs'], ['logs', 'Log types']];
  function tLibrary() { return '<p class="pnote">The Daisy library files read in full: soil horizons with their van Genuchten hydraulics, crops, fertilisers, chemicals and management actions. Pick a soil horizon to see its retention and conductivity curves and use it in the soil column.</p><div class="dzrow">' + sel('LK', KINDS, S.kind) + '<input id="dzLQ" placeholder="search by name" size="22"><span id="dzLst" class="pnote"></span></div><div style="display:flex;gap:10px;flex-wrap:wrap"><div id="dzLl" class="dzlist"></div><div id="dzLd" style="flex:1;min-width:300px"></div></div>'; }
  const hzP = hz => CA.fromHorizon(hz);
  function texture(c, s, sa) { if (c == null) return ''; if (c >= 40) return 'clay'; if (sa >= 85 && c < 10) return 'sand'; if (sa >= 70 && c < 15) return 'loamy sand'; if (s >= 80 && c < 12) return 'silt'; if (c >= 27) return s >= 40 ? 'silty clay loam' : sa >= 45 ? 'sandy clay loam' : 'clay loam'; if (c >= 20 && sa >= 45) return 'sandy clay loam'; if (s >= 50 || (s >= 50 && c < 27)) return 'silt loam'; if (sa >= 52) return 'sandy loam'; return 'loam'; }
  async function bLibrary() {
    const lib = await getLib(), kind = () => $('LK').value;
    const list = () => {
      S.kind = kind(); const q = $('LQ').value.toLowerCase(), arr = lib[S.kind].filter(x => !q || (x.name + ' ' + (x.parent || '')).toLowerCase().includes(q)); note('Lst', arr.length + ' of ' + lib[S.kind].length);
      $('Ll').innerHTML = arr.slice(0, 400).map((x, i) => '<div class="dzol-i" data-i="' + lib[S.kind].indexOf(x) + '"><b>' + esc(x.name) + '</b> <span class="pnote">' + esc(x.parent || '') + '</span>' + (S.kind === 'horizons' && x.hy ? '<span class="pnote"> ' + texture(x.clay, x.silt, x.sand) + '</span>' : '') + '</div>').join('');
      $('Ll').querySelectorAll('[data-i]').forEach(e => e.onclick = () => { $('Ll').querySelectorAll('.sel').forEach(z => z.classList.remove('sel')); e.classList.add('sel'); detail(lib[S.kind][+e.dataset.i]); });
    };
    function detail(x) {
      const d = $('Ld'); if (S.kind === 'horizons') {
        const p = hzP(x); if (!p) { d.innerHTML = '<b>' + esc(x.name) + '</b><p class="pnote">This horizon has no van Genuchten parameters.</p>'; return; }
        const f = CA.fcwp(p), tex = texture(x.clay, x.silt, x.sand);
        d.innerHTML = '<h4>' + esc(x.name) + ' <span class="pnote">(' + esc(x.parent || '') + ', ' + esc(x.file) + ')</span></h4><table class="dzt"><tr><td>Clay / silt / sand (%)</td><td>' + [x.clay, x.silt, x.sand].map(v => fmt(v, 1)).join(' / ') + '</td></tr><tr><td>Humus (%), C/N, bulk density</td><td>' + [x.humus, x.CN, x.rho].map(v => fmt(v, 2)).join(' / ') + '</td></tr><tr><td>alpha, n, l</td><td>' + [p.alpha, p.n, p.l].map(v => fmt(v, 4)).join(' / ') + '</td></tr><tr><td>Saturated conductivity</td><td>' + fmt(p.Ks, 4) + ' cm/h</td></tr><tr><td>Saturation / residual</td><td>' + fmt(p.Ths, 3) + ' / ' + fmt(p.Thr, 3) + '</td></tr><tr><td>Field capacity (-100 cm)</td><td>' + fmt(f.fc, 3) + '</td></tr><tr><td>Wilting point (-15000 cm)</td><td>' + fmt(f.wp, 3) + '</td></tr><tr><td><b>Available water</b></td><td><b>' + fmt(f.aw, 3) + '</b> (' + fmt(f.aw * 1000, 0) + ' mm per m)</td></tr></table>' +
          '<canvas id="dzLc1"></canvas><canvas id="dzLc2"></canvas><div class="dzrow"><label>SWAFL soil</label><select id="dzLsoil"></select><button class="btn" id="dzLuse">Use as the soil of the simulation</button><span id="dzLus" class="pnote"></span></div>';
        const rc = CA.retentionCurve(p, 80), H = CA.hydraulics(p); lineChart($('Lc1'), [{ name: 'water content', x: rc.map(r => r.pF), y: rc.map(r => r.theta) }], { xt: 'pF (log10 of suction in cm)', yt: 'water content', h: 220, hlines: [{ y: f.fc, color: '#009E73' }, { y: f.wp, color: '#D55E00' }] });
        lineChart($('Lc2'), [{ name: 'conductivity (cm/h, log10)', x: rc.map(r => r.pF), y: rc.map(r => Math.log10(Math.max(1e-12, H.K(r.h)))), color: '#CC79A7' }], { xt: 'pF', yt: 'log10 K (cm/h)', h: 220 });
        const M = E.metaData || {}, soils = M.soils || [], lab = k => (M.soilLabels && M.soilLabels[k]) || k, kw = { 'clay': /clay/i, 'sand': /sand/i, 'loamy sand': /sand/i, 'silt': /silt/i, 'silt loam': /silt|loam/i, 'loam': /loam/i, 'sandy loam': /sand|loam/i, 'clay loam': /clay|loam/i, 'sandy clay loam': /loam|clay/i, 'silty clay loam': /silt|clay/i }[tex] || /loam/i, best = soils.find(k => kw.test(lab(k))) || soils[0];
        $('Lsoil').innerHTML = soils.map(k => '<option value="' + esc(k) + '"' + (k === best ? ' selected' : '') + '>' + esc(lab(k)) + '</option>').join(''); note('Lus', 'Texture ' + tex + ': nearest SWAFL soil preselected.');
        $('Luse').onclick = () => { try { E.set({ soil: $('Lsoil').value }); note('Lus', 'Soil set to ' + esc(lab($('Lsoil').value)) + '. The dashboard and the layers follow.'); UI.log('Daisy horizon ' + x.name + ' (' + tex + ') mapped to SWAFL soil ' + lab($('Lsoil').value)); } catch (e) { note('Lus', e.message, 1); } };
        S.pick = x;
      } else if (S.kind === 'crops') {
        const rows = []; const flat = (o, pre) => Object.keys(o).forEach(k => { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, pre + k + '.'); else rows.push([pre + k, Array.isArray(v) ? JSON.stringify(v) : v]); }); flat(x.p || {}, '');
        d.innerHTML = '<h4>' + esc(x.name) + ' <span class="pnote">(' + esc(x.parent || '') + ', ' + esc(x.file) + ')</span></h4><p class="pnote">' + esc(x.desc || '') + '</p><table class="dzt">' + rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(String(r[1]).slice(0, 220)) + '</td></tr>').join('') + '</table>';
        const dv = (x.p || {}).Devel; if (dv && dv.TempEff1) { d.innerHTML += '<canvas id="dzLc1"></canvas>'; const te = dv.TempEff1; lineChart($('Lc1'), [{ name: 'temperature effect on development', x: te.map(a => a[0]), y: te.map(a => a[1]), pts: true, line: true }], { xt: 'temperature (C)', yt: 'effect', h: 200 }); }
      } else if (S.kind === 'actions' || S.kind === 'programs' || S.kind === 'logs') {
        d.innerHTML = '<h4>' + esc(x.name) + ' <span class="pnote">(' + esc(x.parent || '') + ', ' + esc(x.file) + ')</span></h4>' + (x.src ? '<pre class="dzpre">' + IO.highlightDai(x.src) + '</pre><button class="btn" id="dzLed">Open in the set-up editor</button>' : '<p class="pnote">Defined in ' + esc(x.file) + '.</p>'); const b = $('Led'); if (b) b.onclick = () => { S.dai = x.src; S.daiName = x.name + '.dai'; show('editor'); };
      } else {
        const rows = []; const flat = (o, pre) => Object.keys(o || {}).forEach(k => { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, pre + k + '.'); else rows.push([pre + k, Array.isArray(v) ? JSON.stringify(v) : v]); }); flat(x.p, ''); d.innerHTML = '<h4>' + esc(x.name) + ' <span class="pnote">(' + esc(x.parent || '') + ', ' + esc(x.file) + ')</span></h4><table class="dzt">' + rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(String(r[1]).slice(0, 220)) + '</td></tr>').join('') + '</table>';
      }
    }
    $('LK').onchange = () => { list(); $('Ld').innerHTML = ''; }; $('LQ').oninput = list; list();
  }

  // ---------------------------------------------------------------- tab: soil column (Richards)
  function tRichards() {
    return '<p class="pnote">A vertical soil column solved with the Richards equation, with van Genuchten and Mualem hydraulics of the chosen Daisy horizons, root uptake by the Feddes stress function and a free, closed or groundwater-table lower boundary. The weather comes from the SWAFL season, a Daisy weather station or your own values.</p>' +
      '<div class="dzrow"><b>Layers</b> ' + [1, 2, 3].map(i => '<span><select id="dzRH' + i + '"></select> to <input id="dzRD' + i + '" size="3" value="' + [30, 70, 120][i - 1] + '"> cm</span>').join(' ') + '</div>' +
      '<div class="dzrow"><label>Weather</label>' + sel('RSrc', [['swafl', 'SWAFL season (rain, ET0, crop cover)'], ['daisy', 'Daisy weather station'], ['manual', 'Own values'], ['log', 'Weather file from Files']]) + '<span id="dzRSx"></span></div>' +
      '<div class="dzrow"><label>Days</label><input id="dzRDays" size="4" value="120"><label>Start day</label><input id="dzRS0" size="4" value="0"><label>Start wetness</label><input id="dzRIn" size="4" value="0.7"><label>Lower boundary</label>' + sel('RBot', [['free', 'Free drainage'], ['closed', 'Closed'], ['table', 'Groundwater table at (cm)']]) + '<input id="dzRTab" size="5" value="150"><label>Node spacing (cm)</label><input id="dzRDz" size="3" value="2"></div>' +
      '<div class="dzrow"><button class="btn pri" id="dzRRun">Run the column</button><button class="btn" id="dzRStop">Stop</button><button class="btn" id="dzRReg">Keep the water contents as a log</button><button class="btn" id="dzRPng">Picture (PNG)</button><span id="dzRst" class="pnote"></span></div>' +
      '<div id="dzRpr" class="dzbar"><i></i></div><canvas id="dzRcv1"></canvas><div class="dzrow"><label>Series at depth (cm)</label><input id="dzRZ" size="4" value="20"></div><canvas id="dzRcv2"></canvas><canvas id="dzRcv3"></canvas><div id="dzRsum"></div>';
  }
  async function forcing() {
    const src = $('RSrc').value, n = Math.max(2, Math.min(730, parseInt($('RDays').value) || 120)), s0 = Math.max(0, parseInt($('RS0').value) || 0);
    if (src === 'swafl') {
      const P = E.json("(function(){var p=irPlan({});var A=function(a){return Array.prototype.slice.call(a||[])};return {P:A(p.P),ETc:A(p.ETc),KC:A(p.KC),ZR:A(p.ZR),et0:A(p.F&&p.F.et0),kcIni:p.kcIni,kcMid:p.kcMid,n:(p.P||[]).length}})()");
      if (!P || !P.n) throw new Error('the SWAFL season is not available yet');
      const rain = [], Es = [], Tp = [], zr = []; for (let k = 0; k < n; k++) { const i = Math.min(P.n - 1, s0 + k), kc = P.KC[i] || 0, cov = Math.max(0, Math.min(1, ((kc - (P.kcIni || 0.3)) / Math.max(0.05, (P.kcMid || 1.1) - (P.kcIni || 0.3))))), et0 = P.et0[i] != null ? P.et0[i] : (kc ? P.ETc[i] / kc : 3); rain.push(P.P[i] || 0); Tp.push((P.ETc[i] || 0) * cov); Es.push(et0 * (1 - cov) * 0.8); zr.push(Math.max(10, P.ZR[i] || 30)); }
      return { rain, Es, Tp, zr, label: 'SWAFL season, day ' + s0 + ' to ' + (s0 + n) };
    }
    if (src === 'daisy' || src === 'log') {
      let w; if (src === 'daisy') w = IO.readDwf(await getText('weather/' + $('RSt').value), $('RSt').value); else w = S.logs[$('RSt').value]; if (!w) throw new Error('no weather chosen');
      const pr = IO.col(w, w.cols.find(c => /^(precip|rain|precipitation|nedboer)$/i.test(c)) || 'Precip'), ev = IO.col(w, w.cols.find(c => /^(refevap|et0|eto|pet)$/i.test(c)) || 'RefEvap'); const rain = [], Es = [], Tp = [], zr = [];
      const cov = k => Math.max(0, Math.min(1, Math.sin(Math.PI * k / Math.max(2, n)) * 1.05));
      for (let k = 0; k < n; k++) { const i = Math.min(w.n - 1, s0 + k); rain.push(pr[i] || 0); const e = ev[i] || 2; Tp.push(e * 1.05 * cov(k)); Es.push(e * (1 - cov(k)) * 0.8); zr.push(20 + 60 * Math.min(1, k / (n * 0.5))); }
      return { rain, Es, Tp, zr, label: (src === 'daisy' ? $('RSt').value : w.name) + (w.time ? ' from ' + dstr(w.time[Math.min(w.n - 1, s0)]) : '') + ', crop cover as a half sine' };
    }
    const r = parseFloat($('RMr').value) || 0, ev = parseFloat($('RMe').value) || 0, ev2 = (parseFloat($('RMt').value) || 0), every = Math.max(1, parseInt($('RMn').value) || 7);
    const rain = [], Es = [], Tp = [], zr = []; for (let k = 0; k < n; k++) { rain.push(k % every === 0 ? r : 0); Es.push(ev * 0.3); Tp.push(ev2); zr.push(60); } return { rain, Es, Tp, zr, label: 'own values' };
  }
  async function bRichards() {
    const lib = await getLib(), hz = lib.horizons.filter(h => h.hy && h.hy.alpha); const o = hz.map((h, i) => '<option value="' + lib.horizons.indexOf(h) + '">' + esc(h.name + ' (' + texture(h.clay, h.silt, h.sand) + ')') + '</option>').join('');
    const pre = ['Ap_JB4', 'Bt_JB4', 'C_JB4']; [1, 2, 3].forEach(i => { $('RH' + i).innerHTML = o; const k = hz.findIndex(h => h.name === pre[i - 1]); $('RH' + i).value = String(lib.horizons.indexOf(hz[k >= 0 ? k : Math.min(hz.length - 1, i * 5)])); });
    const srcx = async () => { const v = $('RSrc').value, e = $('RSx'); if (v === 'daisy') { const ix = await getIdx(); e.innerHTML = sel('RSt', ix.weather.map(w => [w.file, w.name.replace(/\t.*/, '') + ' ' + w.from.slice(0, 4) + '-' + w.to.slice(0, 4)])); } else if (v === 'log') e.innerHTML = logSel('RSt'); else if (v === 'manual') e.innerHTML = 'rain <input id="dzRMr" size="3" value="12"> mm every <input id="dzRMn" size="2" value="7"> days, ET0 <input id="dzRMe" size="3" value="4"> mm/day, transpiration <input id="dzRMt" size="3" value="3"> mm/day'; else e.innerHTML = ''; }; $('RSrc').onchange = srcx; srcx();
    let stop = false; $('RStop').onclick = () => { stop = true; };
    $('RRun').onclick = async () => {
      try {
        stop = false; note('Rst', 'Preparing...'); const F = await forcing(); const layers = []; let prev = 0; [1, 2, 3].forEach(i => { const dp = parseFloat($('RD' + i).value); const h = lib.horizons[+$('RH' + i).value], p = hzP(h); if (p && dp > prev) { layers.push({ depth: dp, hy: p, name: h.name }); prev = dp; } }); if (!layers.length) throw new Error('give the layer depths in increasing order');
        const dz = Math.max(1, parseFloat($('RDz').value) || 2), bt = $('RBot').value, bo = { type: bt, depth: parseFloat($('RTab').value) || 150 };
        const gen = CA.richardsGen({ layers, days: F.rain.length, rain: F.rain, Es: F.Es, Tp: F.Tp, zr: F.zr, init: parseFloat($('RIn').value), bottom: bo, dz }); let t0 = performance.now(), res; $('Rpr').firstChild.style.width = '0%';
        const step = () => { if (stop) { note('Rst', 'Stopped.', 1); return; } const t1 = performance.now(); let r; try { while (performance.now() - t1 < 40) { r = gen.next(); if (r.done) break; if (r.value && r.value.day != null) { /* progress */ } } } catch (e) { note('Rst', e.message, 1); return; } const pr = gen.progress ? gen.progress : null; if (r && r.done) { done(r.value, F, layers); return; } $('Rpr').firstChild.style.width = (r && typeof r.value === 'number' ? Math.round(100 * (r.value + 1) / F.rain.length) : 0) + '%'; note('Rst', 'Solving the column... ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s'); setTimeout(step, 0); };
        step();
      } catch (e) { note('Rst', e.message, 1); }
    };
    function done(R, F, layers) {
      S.rich = { R, F, layers }; $('Rpr').firstChild.style.width = '100%'; const N = R.days; const tt = [], zz = [], vv = []; R.theta.forEach((row, d) => row.forEach((v, i) => { tt.push(d); zz.push(R.x[i]); vv.push(v); }));
      heatChart($('Rcv1'), tt, zz.map(z => -z), vv, { title: 'Water content of the soil column', unit: 'water content', pal: 'blues', xt: 'Day of the run', h: 320 }); series();
      const sum = a => a.reduce((s, v) => s + v, 0), dS = R.store[R.store.length - 1] - R.store[0], rainT = sum(F.rain), bal = rainT - sum(R.runoff) - sum(R.evap) - sum(R.transp) - sum(R.drain) - dS;
      $('Rsum').innerHTML = '<table class="dzt" style="max-width:520px"><tr><th colspan="2">Water balance of the column, ' + esc(F.label) + '</th></tr>' + [['Rain', rainT], ['Infiltration', sum(R.infil)], ['Runoff', sum(R.runoff)], ['Soil evaporation', sum(R.evap)], ['Transpiration', sum(R.transp)], ['Drainage at the bottom', sum(R.drain)], ['Change in stored water', dS], ['Balance error', bal], ['Largest daily error', Math.max.apply(null, R.err.map(Math.abs))], ['Picard iterations per day', sum(R.iters) / N]].map(r => '<tr><td>' + r[0] + '</td><td>' + fmt(r[1], 2) + (r[0].indexOf('iter') < 0 ? ' mm' : '') + '</td></tr>').join('') + '</table>'; note('Rst', 'Done: ' + N + ' days, ' + R.x.length + ' nodes.');
    }
    function series() { const q = S.rich; if (!q) return; const R = q.R, z = parseFloat($('RZ').value) || 20; let ni = 0, bd = Infinity; R.x.forEach((x, i) => { if (Math.abs(x - z) < bd) { bd = Math.abs(x - z); ni = i; } }); const lay = q.layers.find(L => R.x[ni] <= L.depth) || q.layers[q.layers.length - 1], H = CA.hydraulics(lay.hy), f = CA.fcwp(lay.hy), d = R.theta.map((r, i) => i), th = R.theta.map(r => r[ni]);
      lineChart($('Rcv2'), [{ name: 'water content at ' + R.x[ni] + ' cm', x: d, y: th }], { title: 'Water content at ' + R.x[ni] + ' cm, with field capacity, wilting point and saturation', xt: 'Day of the run', yt: 'Water content (cm3 cm-3)', noLegend: true, h: 260, hlines: [{ y: f.fc, color: '#009E73', label: 'field capacity' }, { y: f.wp, color: '#D55E00', label: 'wilting point' }, { y: f.sat, color: '#0072B2', label: 'saturation' }] });
      lineChart($('Rcv3'), [{ name: 'water flows (mm/day)', x: d, y: R.drain, color: '#0072B2' }, { name: 'transpiration', x: d, y: R.transp, color: '#009E73' }, { name: 'soil evaporation', x: d, y: R.evap, color: '#E69F00' }, { name: 'rain', x: d, y: q.F.rain, color: '#888', bars: false, step: true }], { title: 'Water flows of the column', xt: 'Day of the run', yt: 'Water (mm per day)', h: 280, zero: true }); }
    $('RZ').onchange = series; $('RPng').onclick = () => savePng([$('Rcv1'), $('Rcv2'), $('Rcv3')], 'daisy-column.png');
    if (!S.rich) setTimeout(() => { const b = $('RRun'); if (b && !S.rich) b.click(); }, 400);   // the column is drawn at once, never an empty page
    $('RReg').onclick = () => { const q = S.rich; if (!q) { note('Rst', 'Run the column first.', 1); return; } const R = q.R, cols = ['day'].concat(R.x.map(x => 'theta @ -' + x)), d = { name: 'column-theta', header: {}, units: {}, cols, data: cols.map(() => []), n: R.days, time: null }; cols.forEach(c => d.units[c] = c === 'day' ? '' : 'cm3/cm3'); R.theta.forEach((row, i) => { d.data[0].push(i); row.forEach((v, j) => d.data[j + 1].push(v)); }); addLog(d, 'column-theta'); note('Rst', 'Kept as the log "column-theta": plot it or use it in the calibration.'); refreshSelects(); };
  }

  // ---------------------------------------------------------------- tab: calibrate
  function tCalib() {
    return '<p class="pnote">Parameters are searched with the optimisers of daisypy-optim: sequential greedy search, CMA-ES and Bayesian optimisation (Gaussian process, expected improvement). Each trial is one model run, so the search can be followed live.</p>' +
      '<div class="dzrow"><label>Problem</label>' + sel('KP', [['deni', 'Denitrification function against Daisy results (792 cases)'], ['rich', 'Soil column hydraulics against measured water content'], ['tmpl', 'Daisy program with the set-up template (desktop)']]) + '<label>Method</label>' + sel('KM', [['seq', 'Sequential'], ['cma', 'CMA-ES'], ['bay', 'Bayesian']]) + '<label>Loss</label>' + sel('KL', [['mse', 'mean squared error'], ['mae', 'mean absolute error'], ['ssd', 'sum of squares']]) + '<label>Runs</label><input id="dzKB" size="3" value="60"></div>' +
      '<div id="dzKx" class="dzrow"></div><div class="dzrow"><button class="btn pri" id="dzKGo">Start</button><button class="btn" id="dzKStop">Stop</button><span id="dzKst" class="pnote"></span></div><canvas id="dzKcv1"></canvas><canvas id="dzKcv2"></canvas><div id="dzKtab"></div>';
  }
  async function bCalib() {
    const prob = () => $('KP').value;
    const extra = () => { const p = prob(), e = $('Kx'); if (p === 'deni') e.innerHTML = '<span class="pnote">The denitrification function written in Python for Daisy is a close copy, not an exact one. The search fits its slow and fast rate constants, nitrate rate, a temperature factor (fT) and the N2O/N2 split factor (frS) to the 792 results of Daisy. It starts at the Python values, where the relative loss is 0.30.</span>'; else if (p === 'rich') e.innerHTML = '<label>Measured log</label>' + logSel('CTgt') + '<label>column</label><select id="dzKcol"></select><label>depth (cm)</label><input id="dzKz" size="4" value="20"><label>horizon</label><select id="dzKh"></select><label>rain mm/day every N days</label><input id="dzKr" size="3" value="10"><input id="dzKn" size="2" value="7"><label>transpiration mm/day</label><input id="dzKt" size="3" value="3"> <span class="pnote">The row number is the day. Fits alpha, n and the saturated conductivity.</span>'; else e.innerHTML = '<span class="pnote">Uses the set-up in the editor: its {placeholders} are the parameters (bounds are asked below); the log column is compared with the target log.</span><label>Target log</label>' + logSel('CTgt') + '<label>column</label><select id="dzKcol"></select><label>Daisy log file</label><input id="dzKf" size="14" value="field_nitrogen.dlf"><div id="dzKph" style="width:100%"></div>'; const phs = IO.placeholders(S.dai || ''); const kp = $('Kph'); if (kp) kp.innerHTML = phs.length ? '<b>Bounds of the placeholders</b> ' + phs.map((n, i) => esc(n) + ' <input id="dzKlo' + i + '" size="5" placeholder="lowest"> to <input id="dzKhi' + i + '" size="5" placeholder="highest">').join(' &nbsp; ') : '<span class="pnote">Open a set-up with {placeholders} in the editor first.</span>'; const tl = $('CTgt'); const fc = () => { const d = S.logs[tl && tl.value], c = $('Kcol'); if (c) c.innerHTML = d ? d.cols.filter((x, j) => d.data[j].some(isFinite)).map(x => '<option>' + esc(x) + '</option>').join('') : ''; }; if (tl) { tl.onchange = fc; fc(); } };
    $('KP').onchange = extra; extra();
    if (names().indexOf('optim-measured-field-nitrogen.csv') < 0) { try { const d = IO.readCsv(await getText('dlf/optim-measured-field-nitrogen.csv'), 'optim-measured-field-nitrogen.csv'); addLog(d); } catch (e) {} }
    let stop = false; $('KStop').onclick = () => { stop = true; };
    $('KGo').onclick = async () => {
      stop = false; const p = prob(), B = Math.max(5, parseInt($('KB').value) || 60), lossF = CA.loss[$('KL').value]; let ps, f, extraPlot = null;
      try {
        if (p === 'deni') {
          const d = IO.readCsv(await getText('dlf/denitrification-args-and-targets.csv'), 'deni'), rows = []; for (let r = 0; r < d.n; r++) { const a = {}; d.cols.forEach((c, j) => a[c] = d.data[j][r]); rows.push(a); }
          const tn = rows.map(r => r.N2O_deni), t2 = rows.map(r => r.N2_deni), vn = Math.max(1e-30, tn.reduce((s, v) => s + v * v, 0) / tn.length), v2 = Math.max(1e-30, t2.reduce((s, v) => s + v * v, 0) / t2.length);
          ps = [{ name: 'alpha', lo: 1e-5, hi: 1e-3, init: 1e-4, log: true }, { name: 'alphaF', lo: 0.01, hi: 0.3, init: 0.053, log: true }, { name: 'Kd', lo: 0.004, hi: 0.1, init: 0.0208, log: true }, { name: 'fT', lo: 0.3, hi: 4, init: 1, log: true }, { name: 'frS', lo: 0.5, hi: 2, init: 1, log: true }];
          f = x => { const m1 = [], m2 = []; rows.forEach(r => { const y = CA.denitrification(Object.assign({}, r, x)); m1.push(y['N2O-Denit']); m2.push(y['N2-Denit']); }); return lossF(m1, tn) / vn + lossF(m2, t2) / v2; };
          extraPlot = x => { const m1 = [], m2 = []; rows.forEach(r => { const y = CA.denitrification(Object.assign({}, r, x)); m1.push(y['N2O-Denit']); m2.push(y['N2-Denit']); }); return { obs: tn.concat(t2), mod: m1.concat(m2), un: 'N2O and N2 denitrification' }; };
        } else if (p === 'rich') {
          const d = S.logs[$('CTgt').value], col = $('Kcol').value; if (!d) throw new Error('load the measured water contents in Files'); const lib = await getLib(), h = lib.horizons[+(await pickHz())], base = hzP(h), z = parseFloat($('Kz').value) || 20, obs = IO.col(d, col), N = Math.min(d.n, 365), rain = [], Tp = [], Es = [], zr = []; for (let k = 0; k < N; k++) { rain.push(k % (parseInt($('Kn').value) || 7) === 0 ? parseFloat($('Kr').value) || 0 : 0); Tp.push(parseFloat($('Kt').value) || 0); Es.push(1); zr.push(40); }
          const y0 = obs.find(isFinite) || 0.3; ps = [{ name: 'alpha', lo: base.alpha / 5, hi: base.alpha * 5, init: base.alpha, log: true }, { name: 'n', lo: 1.1, hi: Math.max(3, base.n * 1.6), init: base.n }, { name: 'Ks', lo: base.Ks / 20, hi: base.Ks * 20, init: base.Ks, log: true }];
          const run = x => { const hy = Object.assign({}, base, { alpha: x.alpha, n: x.n, Ks: x.Ks }); const R = CA.richards({ layers: [{ depth: 100, hy }], days: N, rain, Es, Tp, zr, init: 0.7, bottom: { type: 'free' }, dz: 4 }); const i = Math.round(z / 4); return R.theta.map(r => r[Math.min(i, r.length - 1)]); };
          f = x => lossF(run(x), obs.slice(0, N)); extraPlot = x => ({ obs: obs.slice(0, N), mod: run(x), un: 'water content', series: 1 });
        } else {
          if (!isDesk() || !window.swafl.daisyJob) throw new Error('this needs the desktop app and the Daisy program');
          const text = S.dai, ph = IO.placeholders(text); if (!ph.length) throw new Error('the set-up editor has no {placeholders}: put {name} where a parameter goes'); const d = S.logs[$('CTgt').value], col = $('Kcol').value; if (!d) throw new Error('load the target log'); const tgt = IO.col(d, col);
          ps = ph.map((n, i) => { const lo = parseFloat($('Klo' + i).value), hi = parseFloat($('Khi' + i).value); if (!(hi > lo)) throw new Error('give the lowest and highest value of ' + n); return { name: n, lo, hi, init: (lo + hi) / 2 }; });
          f = async x => { const r = await window.swafl.daisyJob({ main: 'Run/trial.dai', files: { 'Run/trial.dai': IO.fillTemplate(text, x) } }); if (r.code === -2) throw new Error('no Daisy program found'); const lg = r.logs && r.logs[$('Kf').value]; if (!lg) return Infinity; const m = IO.col(IO.readDlf(lg, 'trial'), col); return lossF(m, tgt); };
        }
      } catch (e) { note('Kst', e.message, 1); return; }
      const samples = [], bestHist = []; let best = Infinity, bestX = null; note('Kst', 'Searching...');
      const wrap = async x => { const y = await f(x); if (y < best) { best = y; bestX = x; } samples.push(y); bestHist.push(best); if (samples.length % 3 === 0 || samples.length === 1) { const ix = samples.map((_, i) => i + 1); lineChart($('Kcv1'), [{ name: 'loss of each run', x: ix, y: samples.map(v => Math.log10(Math.max(1e-30, v))), pts: true, color: '#999' }, { name: 'best so far', x: ix, y: bestHist.map(v => Math.log10(Math.max(1e-30, v))), color: '#D55E00', step: true }], { xt: 'run', yt: 'log10 loss', h: 220 }); note('Kst', samples.length + ' runs, best loss ' + fmt(best, 4)); await new Promise(r => setTimeout(r, 0)); } if (stop) throw new Error('stopped'); return y; };
      try { const opt = { budget: B, cancel: () => stop }; const fn = { seq: CA.optSequential, cma: CA.optCMA, bay: CA.optBayes }[$('KM').value]; const R = await fn(ps, wrap, opt); bestX = R.x; best = R.y; } catch (e) { if (e.message !== 'stopped') { note('Kst', e.message, 1); return; } }
      if (!bestX) return; const tb = '<table class="dzt" style="max-width:560px"><tr><th>Parameter</th><th>Start</th><th>Best</th></tr>' + ps.map(q => '<tr><td>' + q.name + '</td><td>' + fmt(q.init, 5) + '</td><td><b>' + fmt(bestX[q.name], 5) + '</b></td></tr>').join('') + '<tr><td>Loss</td><td></td><td>' + fmt(best, 5) + '</td></tr></table>'; $('Ktab').innerHTML = tb;
      if (extraPlot) { const e = extraPlot(bestX); if (e.series) lineChart($('Kcv2'), [{ name: 'measured', x: e.obs.map((_, i) => i), y: e.obs, pts: true, color: '#444' }, { name: 'model with the best parameters', x: e.mod.map((_, i) => i), y: e.mod, color: '#D55E00' }], { xt: 'day', yt: e.un, h: 240 }); else lineChart($('Kcv2'), [{ name: 'Daisy against model', x: e.obs, y: e.mod, pts: true, r: 1.6, color: '#0072B2' }, { name: '1:1', x: [Math.min.apply(null, e.obs), Math.max.apply(null, e.obs)], y: [Math.min.apply(null, e.obs), Math.max.apply(null, e.obs)], color: '#999' }], { xt: 'Daisy result (' + e.un + ')', yt: 'model', h: 240 }); }
      note('Kst', samples.length + ' runs, best loss ' + fmt(best, 5) + '.');
    };
    async function pickHz() { const lib = await getLib(); const e = $('Kh'); if (!e.options.length) { lib.horizons.forEach((h, i) => { if (h.hy && h.hy.alpha) { const o = document.createElement('option'); o.value = i; o.textContent = h.name; e.appendChild(o); } }); } return e.value; }
    const kp = $('KP'); kp.addEventListener('change', () => { if (kp.value === 'rich') setTimeout(pickHz, 0); }); if (kp.value === 'rich') pickHz();
  }

  // ---------------------------------------------------------------- tab: weather
  function tWeather() {
    return '<p class="pnote">Weather from Daisy stations or from the Danish Meteorological Institute becomes the SWAFL weather, so the whole simulation runs on measured data.</p>' +
      '<h4>Daisy weather stations (bundled)</h4><div class="dzrow"><select id="dzWSt"></select><label>Latitude</label><input id="dzWLat" size="5" value="55"><button class="btn pri" id="dzWUse">Use as SWAFL weather</button><button class="btn" id="dzWAdd">Add to the log list</button><span id="dzWst" class="pnote"></span></div><div class="dzfig"><canvas id="dzWcv"></canvas><div id="dzWcap" class="dzcite" style="font:11px Segoe UI,Arial;color:#555;margin:2px 0 6px"></div></div>' +
      '<h4>Online weather of a place (no key needed)</h4><p class="pnote">Daily rain, temperatures, radiation and reference evapotranspiration of any place on Earth, from the Open-Meteo archive (ERA5 based), checked before use. Complete years only; ask for at least six years.</p><div class="dzrow"><label>Place</label><input id="dzWOPlace" size="22" placeholder="town, village or farm"><button class="btn" id="dzWOFind">Find</button><select id="dzWOHits" style="display:none"></select><label>Latitude</label><input id="dzWOLat" size="6"><label>Longitude</label><input id="dzWOLon" size="6"><label>From year</label><input id="dzWOY0" type="number" size="5" style="width:5.5em" value="2010"><label>To year</label><input id="dzWOY1" type="number" style="width:5.5em" value="' + (new Date().getUTCFullYear() - 1) + '"></div><div class="dzrow"><button class="btn pri" id="dzWOGet">Get the weather and show it</button><button class="btn" id="dzWOUse">Use as SWAFL weather</button><button class="btn" id="dzWODz">Use in the Daisy runs</button><button class="btn" id="dzWOAdd">Add to the log list</button><span id="dzWOst" class="pnote"></span></div>' +
      '<h4>DMI open data (needs your own free API key from dmiapi.govcloud.dk)</h4><div class="dzrow"><label>Key</label><input id="dzWKey" type="password" size="30" placeholder="api-key"><label>Latitude</label><input id="dzWLa2" size="6" value="55.67"><label>Longitude</label><input id="dzWLo2" size="6" value="12.30"><label>From</label><input id="dzWF" type="date" value="2023-01-01"><label>To</label><input id="dzWT" type="date" value="2023-12-31"><button class="btn pri" id="dzWDmi">Fetch and use</button><span id="dzWst2" class="pnote"></span></div>' +
      '<h4>Groundwater (HIP) as the lower boundary of the soil column</h4><div class="dzrow"><input type="file" id="dzWHip" accept=".csv,.txt,.nc"><span id="dzWst3" class="pnote">A table with a date column and a head or depth-to-water column in metres, or a NetCDF file.</span></div>';
  }

  // Figure 1 of the weather tab: numbered title, the source and the references under it, and the same text burnt into the saved picture
  function figWx(title, source, keys) {
    const cv = $('Wcv'), cap = $('Wcap'); if (!cv || !cap) return; 
    cap.innerHTML = '';
  }
  async function bWeatherOnline() {
    const hits = []; let last = null; const lat = () => parseFloat($('WOLat').value), lon = () => parseFloat($('WOLon').value);
    $('WOFind').onclick = async () => { const q = $('WOPlace').value.trim(); if (!q) return; note('WOst', 'Looking for ' + esc(q) + '...'); try { const r = await window.DaisyOnline.geocode(q); if (!r.length) throw new Error('no place of that name was found; try another spelling'); hits.length = 0; r.forEach(x => hits.push(x)); const h = $('WOHits'); h.innerHTML = r.map((x, i) => '<option value="' + i + '">' + esc(x.label) + '</option>').join(''); h.style.display = r.length > 1 ? '' : 'none'; const pick = () => { const x = hits[+h.value]; $('WOLat').value = x.lat.toFixed(3); $('WOLon').value = x.lon.toFixed(3); last = null; note('WOst', esc(x.label) + (x.elev != null ? ', ' + Math.round(x.elev) + ' m' : '') + '. Choose the years and press Get the weather.'); }; h.onchange = pick; pick(); } catch (e) { note('WOst', esc(e.message), 1); } };
    const get = async () => {
      if (!(isFinite(lat()) && isFinite(lon()))) throw new Error('find the place first, or type the latitude and longitude'); const y0 = +$('WOY0').value, y1 = +$('WOY1').value; note('WOst', 'Reading the weather service...');
      let src; try { src = await window.DaisyOnline.fetchDaily(lat(), lon(), y0, y1); } catch (e) { throw new Error(/Failed to fetch|NetworkError|Load failed|network/i.test(e.message) ? 'no connection to the weather service (' + e.message + '). Use a weather file or a bundled station instead, or try again online.' : e.message); }
      const R = src.rows, name = ($('WOPlace').value.trim() || 'online') + ' ' + lat().toFixed(2) + 'N ' + lon().toFixed(2) + 'E'; last = { src, name, y0: src.years[0], y1: src.years[1] };
      const ys = {}; R.forEach(r => { const y = new Date(r.t).getUTCFullYear(); (ys[y] = ys[y] || { s: 0, n: 0 }); ys[y].s += r.P; ys[y].n++; }); const yy = Object.keys(ys).map(Number).sort();
      lineChart($('Wcv'), [{ name: 'annual rain (mm)', x: yy, y: yy.map(y => ys[y].s), bars: true }], { zero: true, h: 200, xt: 'year' });
      figWx('Annual rain at ' + name + ', ' + last.y0 + ' to ' + last.y1 + ' (' + src.stats.days + ' days; mean ' + Math.round(src.stats.Pmean) + ' mm a year, mean temperature ' + src.stats.Tmean.toFixed(1) + ' degrees C).', 'Source: Open-Meteo archive (Zippenfenig, 2023), based on the ERA5 reanalysis (Hersbach et al., 2020)' + (src.stats.fixed.length ? '; checks: ' + src.stats.fixed.join(', ') : '; checks: no gaps or impossible values') + '.', ['openmeteo', 'era5', 'daisy']);
      note('WOst', 'Read ' + src.stats.days + ' days, ' + last.y0 + ' to ' + last.y1 + '. Figure 1 shows the annual rain.'); return last;
    };
    const csv = L => 'date,tmean,rain,radiation,et0\n' + L.src.rows.map(r => [new Date(r.t).toISOString().slice(0, 10), ((r.tn + r.tx) / 2).toFixed(2), r.P.toFixed(2), isFinite(r.rad) ? r.rad.toFixed(2) : '', isFinite(r.et0) ? r.et0.toFixed(2) : ''].join(',')).join('\n');
    $('WOGet').onclick = async () => { try { await get(); } catch (e) { note('WOst', esc(e.message), 1); } };
    $('WOUse').onclick = async () => { try { const L = last || await get(); await E.win.wxImport('online-' + L.name.replace(/[^\w.]+/g, '_') + '.csv', buf(csv(L)), lat()); E.poll(true); try { Props.build(); Props.update(E.snap); Dash.render(); } catch (e) { } note('WOst', 'The weather of ' + esc(L.name) + ' (' + L.src.stats.days + ' days) is now the weather of SWAFL.'); UI.log('Online weather ' + L.name + ' imported'); } catch (e) { note('WOst', 'Could not use it: ' + esc(e.message), 1); } };
    $('WODz').onclick = async () => { try { if (!window.DaisyScenUI) throw new Error('the Daisy scenarios are not loaded'); const m = window.DaisyScenUI.my(); m.lat = +lat().toFixed(3); m.lon = +lon().toFixed(3); await window.DaisyScenUI.online($('WOPlace').value.trim(), +$('WOY0').value, +$('WOY1').value); note('WOst', 'The Daisy runs now use this online weather (see the weather strip of Scenarios, Experiments and Processes).'); } catch (e) { note('WOst', esc(e.message), 1); } };
    $('WOAdd').onclick = async () => { try { const L = last || await get(); const d = IO.readCsv(csv(L), 'online-' + L.name.replace(/[^\w.]+/g, '_') + '.csv'); addLog(d); refreshSelects(); note('WOst', 'Added to the log list as ' + esc(d.name) + '.'); } catch (e) { note('WOst', esc(e.message), 1); } };
  }
  async function bWeather() {
    bWeatherOnline();
    const ix = await getIdx(), st = $('WSt'); ix.weather.forEach(w => { const o = document.createElement('option'); o.value = w.file; o.textContent = w.name.replace(/\t.*/, '') + ' (' + w.from.slice(0, 4) + ' to ' + w.to.slice(0, 4) + ', ' + w.n + ' days)'; o.dataset.lat = parseFloat(w.lat); st.appendChild(o); });
    const draw = async () => { try { const w = IO.readDwf(await getText('weather/' + st.value), st.value), a = IO.annual(w, w.cols.find(c => /^precip/i.test(c)) || 'Precip'), ys = Object.keys(a).map(Number).filter(y => a[y].n > 300).sort(); lineChart($('Wcv'), [{ name: 'annual rain (mm)', x: ys, y: ys.map(y => a[y].s), bars: true }], { zero: true, h: 200, xt: 'year' }); const o = st.selectedOptions[0]; if (o && o.dataset.lat) $('WLat').value = o.dataset.lat; const nm = o ? o.textContent.replace(/ \(.*$/, '') : st.value; figWx('Annual rain at the Daisy weather station ' + nm + ', ' + ys[0] + ' to ' + ys[ys.length - 1] + ' (years with more than 300 days of data; rain summed over each calendar year).', 'Source: the Daisy sample weather file ' + st.value + ' of the daisy-model repository (Hansen et al., 2012; Holbak et al., 2026).', ['daisy', 'holbak']); } catch (e) { note('Wst', e.message, 1); } };
    st.onchange = draw; draw();
    $('WUse').onclick = async () => { try { note('Wst', 'Reading the station...'); const text = await getText('weather/' + st.value); await E.win.wxImport(st.value, buf(text), parseFloat($('WLat').value)); E.poll(true); try { Props.build(); Props.update(E.snap); Dash.render(); } catch (e) {} note('Wst', st.value + ' is now the weather of SWAFL (set in the weather source of the dashboard).'); UI.log('Daisy weather station ' + st.value + ' imported'); } catch (e) { note('Wst', 'Could not use it: ' + esc(e.message), 1); } };
    $('WAdd').onclick = async () => { try { const w = IO.readDwf(await getText('weather/' + st.value), st.value); addLog(w, st.value); refreshSelects(); note('Wst', 'Added to the log list.'); } catch (e) { note('Wst', e.message, 1); } };
    $('WDmi').onclick = async () => {
      const key = $('WKey').value.trim(); if (!key) { note('Wst2', 'Type your DMI API key.', 1); return; } const dmi = CA.DMI(key, 'metObs'), dc = CA.DMI('' + key, 'climateData'); const fetcher = isDesk() && window.swafl.httpGet ? async u => { const r = await window.swafl.httpGet(u); return { ok: r.status < 300, status: r.status, json: async () => JSON.parse(r.body) }; } : null;
      try {
        note('Wst2', 'Listing DMI stations...'); const stn = await dc.stations(10000, fetcher), lat = parseFloat($('WLa2').value), lon = parseFloat($('WLo2').value), best = dc.closest(stn, lat, lon, []); if (!best) throw new Error('no station found'); const sid = best.properties.stationId, nm = best.properties.name || sid;
        note('Wst2', 'Nearest station: ' + nm + '. Fetching daily values...'); const P = CA.DMI_PARAMS, f = $('WF').value + 'T00:00:00Z', t = $('WT').value + 'T23:59:59Z', get = async par => { const o = await dc.climate({ parameter: par, station: sid, from: f, to: t, res: 'day' }, fetcher); const m = {}; o.forEach(x => { const p = x.properties; m[String(p.from).slice(0, 10)] = p.value; }); return m; };
        const T = await get(P.tmean), Pr = await get(P.precip), Ra = await get(P.rad).catch(() => ({})), Pe = await get(P.pet).catch(() => ({})); const days = Object.keys(T).sort(); if (!days.length) throw new Error('DMI returned no daily values for this period and station');
        const csv = 'date,tmean,rain,radiation,et0\n' + days.map(d => [d, T[d], Pr[d] != null ? Pr[d] : 0, Ra[d] != null ? Ra[d] : '', Pe[d] != null ? Pe[d] : ''].join(',')).join('\n'); await E.win.wxImport('dmi-' + sid + '.csv', buf(csv), lat); E.poll(true); try { Props.build(); Props.update(E.snap); Dash.render(); } catch (e) {}
        const d = IO.readCsv(csv, 'dmi-' + sid + '.csv'); addLog(d); refreshSelects(); note('Wst2', 'DMI ' + nm + ': ' + days.length + ' days are now the SWAFL weather.'); UI.log('DMI station ' + nm + ' (' + sid + ') imported');
      } catch (e) { note('Wst2', 'DMI: ' + esc(e.message) + (/fetch|Failed|NetworkError/i.test(e.message) ? ' (the browser may block the request; the desktop app sends it for you)' : ''), 1); }
    };
    $('WHip').onchange = async () => {
      const f = $('WHip').files[0]; if (!f) return; try {
        if (/\.nc$/i.test(f.name)) { if (!window.netcdfjs) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/netcdfjs@3.0.0/dist/netcdfjs.min.js'; s.onload = res; s.onerror = () => rej(new Error('the NetCDF reader could not be loaded without internet; export the cell to CSV instead')); document.head.appendChild(s); }); const R = new window.netcdfjs(await f.arrayBuffer()); note('Wst3', 'NetCDF variables: ' + R.variables.map(v => v.name).join(', ') + '. Export one cell to CSV (date, head) to use it here.', 1); return; }
        const d = IO.readCsv(await f.text(), f.name), jc = d.cols.findIndex((c, j) => j > 0 && d.data[j].some(isFinite)); if (jc < 0) throw new Error('no numeric column'); const v = d.data[jc].filter(isFinite), m = v.reduce((s, x) => s + x, 0) / v.length; S.hip = d.data[jc]; $('RTab') && ($('RTab').value = Math.round(Math.abs(m) * 100)); addLog(d, 'groundwater-' + f.name); refreshSelects(); note('Wst3', d.n + ' values, mean ' + fmt(m, 2) + ' m. Choose "Groundwater table" in the soil column; its depth starts at the mean.');
      } catch (e) { note('Wst3', e.message, 1); }
    };
  }

  // ---------------------------------------------------------------- tab: denitrification
  function tDeni() {
    return '<p class="pnote">The Daisy denitrification function (from python-extensions): water-filled pore space, carbon dioxide production and nitrate set the N2O and N2 emission.</p><div class="dzrow">' +
      [['Theta', 'water content', 0.33], ['Theta_sat', 'saturation', 0.43], ['NO3', 'nitrate (g N/cm3 soil)', 3e-6], ['rho_b', 'bulk density (g/cm3)', 1.4], ['CO2_C', 'CO2-C', 1e-7], ['CO2_C_fast', 'fast CO2-C', 5e-8], ['h', 'pressure head (cm)', -60], ['fT', 'temperature factor', 1]].map(a => '<div><label>' + a[1] + '</label><br><input data-d="' + a[0] + '" size="9" value="' + a[2] + '"></div>').join('') + '</div><div id="dzNout"></div><canvas id="dzNcv"></canvas>';
  }
  function bDeni() {
    const get = () => { const a = {}; document.querySelectorAll('#modalRoot [data-d]').forEach(i => a[i.dataset.d] = parseFloat(i.value)); return a; };
    const calc = () => { const a = get(), y = CA.denitrification(a); $('Nout').innerHTML = '<table class="dzt" style="max-width:420px">' + [['Water-filled pore space', y.wfps], ['Water factor', y.fw], ['Potential denitrification', y['Potential-Denit']], ['Actual denitrification', y['Actual-Denit']], ['N2O emission', y['N2O-Denit']], ['N2 emission', y['N2-Denit']]].map(r => '<tr><td>' + r[0] + '</td><td>' + fmt(r[1], 5) + '</td></tr>').join('') + '</table>'; const w = [], n2o = [], n2 = []; for (let t = 0.3 * a.Theta_sat; t <= a.Theta_sat + 1e-9; t += a.Theta_sat * 0.01) { const r = CA.denitrification(Object.assign({}, a, { Theta: t })); w.push(t / a.Theta_sat); n2o.push(r['N2O-Denit']); n2.push(r['N2-Denit']); } lineChart($('Ncv'), [{ name: 'N2O', x: w, y: n2o }, { name: 'N2', x: w, y: n2 }], { xt: 'water-filled pore space', yt: 'emission', h: 240, zero: true }); };
    document.querySelectorAll('#modalRoot [data-d]').forEach(i => i.oninput = calc); calc();
  }

  // ---------------------------------------------------------------- shell
  const CSS = '.mfull .dzw{height:calc((100vh / var(--us,1) - 150px) / var(--mz,1))}.dzw{height:min(74vh,720px);overflow:auto;padding:2px 4px}.dztabs{display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid #c9ced6;margin-bottom:8px}.dztg{display:flex;flex-direction:column;gap:2px}.dztg>span{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#6b7686;font-weight:600;padding:0 2px}.dztg>div{display:flex;gap:2px;flex-wrap:wrap}.dztabs button{border:1px solid #c9ced6;border-bottom:0;background:#eef1f5;padding:5px 11px;cursor:pointer;border-radius:4px 4px 0 0;font:inherit}.dztabs button.on{background:#fff;font-weight:600;color:#0057a8}.dzrow{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin:6px 0}.dzrow label{font-size:12px;color:#444}.dzt{border-collapse:collapse;font-size:12px}.dzt td,.dzt th{border:1px solid #d5d9e0;padding:2px 7px;text-align:left}.dzt th{background:#eef1f5}.dzdrop{border:2px dashed #9aa6b6;border-radius:6px;padding:14px;text-align:center;color:#556;margin:6px 0}.dzdrop.on{background:#e8f2ff;border-color:#0072B2}.dzed{position:relative;height:340px;border:1px solid #9aa6b6;background:#fff}.dzed pre,.dzed textarea{position:absolute;inset:0;margin:0;padding:6px;font:12px/15px Consolas,monospace;white-space:pre;overflow:auto;border:0;box-sizing:border-box}.dzed pre{pointer-events:none;color:#222}.dzed textarea{background:transparent;color:transparent;caret-color:#000;resize:none;outline:0}.dzol{max-height:250px;overflow:auto;border:1px solid #d5d9e0;font-size:12px}.dzol-i{padding:2px 6px;cursor:pointer;border-bottom:1px solid #eef1f5}.dzol-i:hover,.dzol-i.sel{background:#e8f2ff}.dzk{color:#0057a8;font-weight:600}.dzlist{width:300px;max-height:460px;overflow:auto;border:1px solid #d5d9e0}.dzpre{background:#f6f8fa;border:1px solid #d5d9e0;padding:6px;max-height:340px;overflow:auto;font:11px/14px Consolas,monospace;white-space:pre}.dzbar{height:6px;background:#e4e7ec;border-radius:3px;margin:4px 0}.dzbar i{display:block;height:100%;width:0;background:#0072B2;border-radius:3px}.dzw canvas{display:block;max-width:100%;margin:6px 0}.dcm{color:#6a737d}.dst{color:#0a7d3b}.dnu{color:#b45f06}.dun{color:#8250df}.dph{color:#cf222e;font-weight:600}.ddf{color:#0057a8;font-weight:600}.dkw{color:#0057a8}.dfn{color:#8250df}.dzro{min-height:16px}';
  const BIND = { files: bFiles, plot: bPlot, balance: bBalance, compare: bCompare, editor: bEditor, library: bLibrary, richards: bRichards, calib: bCalib, weather: bWeather, deni: bDeni };
  const HTML = { files: tFiles, plot: tPlot, balance: tBalance, compare: tCompare, editor: tEditor, library: tLibrary, richards: tRichards, calib: tCalib, weather: tWeather, deni: tDeni };
  const EXT = {};
  function show(tab, arg) {
    if (S.anim) { clearInterval(S.anim); S.anim = null; } S.tab = tab; const host = document.getElementById('dzBody'); if (!host) return;
    document.querySelectorAll('.dztabs button').forEach(b => b.classList.toggle('on', b.dataset.t === tab)); const X = EXT[tab]; host.innerHTML = (window.DaisyFlow ? window.DaisyFlow.bar(tab) : '') + (X ? X.html(arg) : HTML[tab]()); if (window.DaisyFlow) window.DaisyFlow.bind(tab); const r = X ? X.bind(arg) : BIND[tab](); if (r && r.catch) r.catch(e => { host.insertAdjacentHTML('afterbegin', '<div class="warnbox">' + esc(e.message) + '</div>'); console.warn(e); });
  }
  function open(tab) {
    let arg = ''; if (String(tab).indexOf(':') > 0) { arg = tab.split(':')[1]; tab = tab.split(':')[0]; }
    if (!document.getElementById('dzCss')) { const st = document.createElement('style'); st.id = 'dzCss'; st.textContent = CSS; document.head.appendChild(st); }
    UI.modal({ title: 'Daisy model: scenarios, runs, figures, tests and calibration', icon: 'chart', width: 'min(1180px,96vw)', full: true, html: '<div class="dztabs">' + GROUPS.map(g => '<div class="dztg" data-g="' + esc(g[0]) + '"><span>' + g[0] + '</span><div>' + g[1].map(t => '<button data-t="' + t[0] + '">' + t[1] + '</button>').join('') + '</div></div>').join('') + '</div><div class="dzw" id="dzBody"></div>' });
    try { const mm = document.querySelector('#modalRoot .modal'); if (mm) mm.classList.add('dzmodal'); } catch (e) { }
    document.querySelectorAll('.dztabs button').forEach(b => b.onclick = () => show(b.dataset.t)); if (window.DaisyCite) { if (S.mo) S.mo.disconnect(); S.mo = window.DaisyCite.attach(document.getElementById('dzBody')); } show(HTML[tab] || EXT[tab] ? tab : S.tab, arg); if (window.DaisyStart) window.DaisyStart.applyMode();
  }
  const kit = { setup, nice, OKI, SPEC, fmt, heat: heatChart, line: lineChart, savePng };
  return { open, TABS, state: S, loadBundled, chart: lineChart, kit, S, EXT, register: (id, x) => { EXT[id] = x; }, addLog, names, refreshSelects, regList, note, esc, getText, getIdx, isDesk, show, download, parseAny, buf, sel, logSel, csvOf, dstr };
})();
