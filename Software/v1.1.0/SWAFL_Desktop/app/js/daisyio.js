/* Daisy file input and output, ported from the daisy-model tools:
   daisypy-io (dai, dlf), daisy-r-tools (read_dlf, subset_dlf, mass_balance, depth_wide_to_long, daisy_time_to_timestamp),
   daisypy-test (compare with the smallest meaningful level) and daisy-vscode (syntax of .dai files).
   Works in the browser (global DaisyIO) and in node (module.exports) so the same code builds the bundled library. */
(function (root) {
  'use strict';
  const DaisyIO = {};

  // ------------------------------------------------------------------ DLF: Daisy log files
  // header lines, a line of dashes, the column names (tab separated), the units line, then the numbers
  DaisyIO.readDlf = function (text, name) {
    const lines = String(text).replace(/\r/g, '').split('\n'); let i = 0; const header = {};
    for (; i < lines.length; i++) {
      const row = lines[i].trim(); if (/^-{10,}/.test(row)) { i++; break; } if (!row) continue;
      if (/^dlf-/i.test(row)) { header.info = row; const m = row.match(/dlf-([0-9]+\.[0-9]+)\s*--\s*([^(]+)(?:\((.*)\))?/i); if (m) { header['dlf-version'] = m[1]; header['dlf-component'] = m[2].trim(); header['dlf-def-location'] = m[3] ? m[3].trim() : 'builtin'; } continue; }
      const k = row.indexOf(':'); if (k < 0) continue; const key = row.slice(0, k).trim(), val = row.slice(k + 1).trim();
      if (key in header) { if (Array.isArray(header[key])) header[key].push(val); else header[key] = [header[key], val]; } else header[key] = val;
    }
    const cols = (lines[i++] || '').replace(/\n$/, '').split('\t').map(s => s.trim()), uraw = (lines[i++] || '').split('\t').map(s => s.trim()), units = {};
    // the units line can be shorter than the names line when the first columns have no unit: right-align it
    const off = cols.length - uraw.length; cols.forEach((c, j) => { units[c] = j - off >= 0 ? uraw[j - off] || '' : ''; });
    const data = cols.map(() => []), rawc = cols.map(() => []); for (; i < lines.length; i++) { const ln = lines[i]; if (!ln.trim()) continue; const p = ln.split('\t'); cols.forEach((c, j) => { rawc[j].push((p[j] || '').trim()); const v = parseFloat(p[j]); data[j].push(isFinite(v) ? v : (p[j] != null && /^(nan|na|\.)$/i.test(p[j].trim()) ? NaN : (p[j] === '' || p[j] == null ? NaN : v))); }); }
    const d = { name: name || header.LOGFILE || 'log', header, units, cols, data, n: data[0] ? data[0].length : 0, str: {} }; cols.forEach((c, j) => { if (data[j].some(isNaN) && rawc[j].some(x => x !== '' && !/^(nan|na|\.)$/i.test(x) && isNaN(parseFloat(x)))) d.str[c] = rawc[j]; }); DaisyIO.addTime(d); return d;
  };
  const nz = c => String(c).toLowerCase().replace(/[\s_-]+/g, '');
  DaisyIO.colIndex = (d, c) => { let j = d.cols.indexOf(c); if (j < 0) j = d.cols.findIndex(x => nz(x) === nz(c)); return j; };
  DaisyIO.col = (d, c) => { const j = DaisyIO.colIndex(d, c); return j < 0 ? d.data[0].map(() => NaN) : d.data[j]; };
  // year, month, mday, hour columns to a time stamp (ms since 1970, UTC), like daisy_time_to_timestamp in daisy-r-tools
  DaisyIO.addTime = function (d) {
    const ix = k => d.cols.findIndex(c => c.toLowerCase() === k), y = ix('year'), mo = ix('month'), md = ix('mday'), h = ix('hour');
    if (y < 0) { d.time = null; return d; } d.time = d.data[y].map((yy, r) => Date.UTC(yy, mo >= 0 ? d.data[mo][r] - 1 : 0, md >= 0 ? d.data[md][r] : 1, h >= 0 ? d.data[h][r] : 0)); return d;
  };
  DaisyIO.writeDlf = function (d, sep) {
    sep = sep || '\t'; let o = ''; if (d.header) Object.keys(d.header).forEach(k => { if (k === 'info') o += d.header[k] + '\n\n'; else [].concat(d.header[k]).forEach(v => { o += k + ': ' + v + '\n'; }); });
    o += '--------------------\n' + d.cols.join(sep) + '\n' + d.cols.map(c => d.units[c] || '').join(sep) + '\n'; for (let r = 0; r < d.n; r++) o += d.cols.map((c, j) => d.data[j][r]).join(sep) + '\n'; return o;
  };
  // keep the rows between two dates (ms) and/or the listed columns (subset_dlf)
  DaisyIO.subsetDlf = function (d, from, to, cols) {
    const keep = []; for (let r = 0; r < d.n; r++) { const t = d.time ? d.time[r] : r; if ((from == null || t >= from) && (to == null || t <= to)) keep.push(r); }
    const ci = d.cols.map((c, j) => j).filter(j => !cols || cols.includes(d.cols[j]) || /^(year|month|mday|hour)$/i.test(d.cols[j]));
    const o = { name: d.name, header: d.header, units: d.units, cols: ci.map(j => d.cols[j]), data: ci.map(j => keep.map(r => d.data[j][r])), n: keep.length }; DaisyIO.addTime(o); return o;
  };
  // columns like "q @ -5.5" are one variable at several depths: list them, or turn them into long form (depth_wide_to_long)
  DaisyIO.depthColumns = function (d) {
    const g = {}; d.cols.forEach((c, j) => { const m = c.match(/^(.+?)\s*@\s*(-?[0-9.]+)\s*$/); if (m) (g[m[1].trim()] = g[m[1].trim()] || []).push({ j, z: parseFloat(m[2]), c }); });
    Object.keys(g).forEach(k => g[k].sort((a, b) => b.z - a.z)); return g;
  };
  DaisyIO.depthLong = function (d, v) { const dc = DaisyIO.depthColumns(d)[v]; if (!dc) return null; const t = [], z = [], q = []; for (let r = 0; r < d.n; r++) dc.forEach(c => { t.push(d.time ? d.time[r] : r); z.push(c.z); q.push(d.data[c.j][r]); }); return { t, z, v: q, unit: d.units[dc[0].c] || '' }; };
  // mass balance of input, output and content columns (mass_balance and mass_balance_summary)
  DaisyIO.massBalance = function (d, input, output, content, useInit) {
    useInit = useInit !== false; const cs = (names, r) => names.reduce((s, c) => s + (DaisyIO.col(d, c)[r] || 0), 0), n = d.n, inS = [], outS = [], conS = [], bal = []; let ai = 0, ao = 0; const c0 = n ? cs(content, 0) : 0;
    for (let r = 0; r < n; r++) { ai += cs(input, r); ao += cs(output, r); const c = cs(content, r) - (useInit ? c0 : 0); inS.push(ai); outS.push(ao); conS.push(c); bal.push(c + ao - ai); }
    const sum = names => { const o = {}; let t = 0; names.forEach(c => { const s = DaisyIO.col(d, c).reduce((a, b) => a + (isFinite(b) ? b : 0), 0); o[c] = s; t += s; }); o.Total = t; return o; };
    const Ci = cs(content, 0), Cf = n ? cs(content, n - 1) : 0, I = sum(input), O = sum(output);
    const mean = bal.reduce((a, b) => a + b, 0) / (n || 1), sd = Math.sqrt(bal.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, n - 1));
    return { inS, outS, conS, bal, mean, sd, summary: { Inputs: I, Outputs: O, InitialContent: Ci, FinalContent: Cf, Balance: { Input: I.Total, Output: O.Total, InOutChange: O.Total - I.Total, ContentChange: Cf - Ci, Balance: (Cf - Ci) + (O.Total - I.Total) } } };
  };
  // annual sums and means, for the bar plots of annual values
  DaisyIO.annual = function (d, c) { const v = DaisyIO.col(d, c), o = {}; if (!d.time) return o; v.forEach((x, r) => { const y = new Date(d.time[r]).getUTCFullYear(); (o[y] = o[y] || { s: 0, n: 0, mx: -Infinity, mn: Infinity, last: NaN }); if (isFinite(x)) { o[y].s += x; o[y].n++; o[y].mx = Math.max(o[y].mx, x); o[y].mn = Math.min(o[y].mn, x); o[y].last = x; } }); return o; };


  // ------------------------------------------------------------------ CSV (measured data, targets of the calibration)
  DaisyIO.readCsv = function (text, name) {
    const L = String(text).replace(/\r/g, '').split('\n').filter(x => x.trim()); if (!L.length) return { name, header: {}, units: {}, cols: [], data: [], n: 0, time: null };
    const sep = (L[0].match(/;/g) || []).length > (L[0].match(/,/g) || []).length ? ';' : (L[0].includes('\t') ? '\t' : ','), cols = L[0].split(sep).map(s => s.trim().replace(/^"|"$/g, '')), data = cols.map(() => []), dt = [];
    for (let i = 1; i < L.length; i++) { const p = L[i].split(sep); cols.forEach((c, j) => { const v = (p[j] || '').trim().replace(/^"|"$/g, ''); const f = parseFloat(v); data[j].push(isFinite(f) && /^-?[0-9.eE+-]+$/.test(v) ? f : NaN); if (j === 0) dt[i - 1] = v; }); }
    const d = { name: name || 'table', header: {}, units: {}, cols, data, n: data[0].length, raw: L.slice(1).map(l => l.split(sep).map(s => s.trim().replace(/^"|"$/g, ''))) };
    DaisyIO.addTime(d); if (!d.time) { const k = cols.findIndex(c => /^(time|date|datetime|timestamp)$/i.test(c)); if (k >= 0) { const t = d.raw.map(r => Date.parse(String(r[k]).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(r[k]) ? '' : 'Z'))); if (t.every(isFinite)) d.time = t; } } return d;
  };

  // ------------------------------------------------------------------ comparison with the smallest meaningful level (daisypy-test)
  // the smallest differences that matter, per log component and column (from the .toml definitions of daisypy-test)
  DaisyIO.SML = { 'Field water': { Precipitation: 1, Irrigation: 1, 'Potential evapotranspiration': 1, 'Actual evapotranspiration': 1, 'Matrix percolation': 1, 'Biopore percolation': 1, 'Matrix drain flow': 1, 'Biopore drain flow': 1, Runoff: 1, 'Biopore water': 1, 'Soil matrix water': 1, 'Surface water': 1 }, Crop: { DS: 0.01, Height: 1, LAI: 0.01, Depth: 1, WLeaf: 100, WDead: 100, WStem: 100, WSOrg: 100, WRoot: 100, Fixated: 1, NLeaf: 1, NDead: 1, NStem: 1, NSOrg: 1, NRoot: 1, water_stress: 0.01, nitrogen_stress: 0.01, Phenology: 1 } };
  // compare two logs: differences inside the SML are "similar", below a thousandth of it "identical"
  DaisyIO.compareDlf = function (a, b, o) {
    o = o || {}; const prec = o.precision != null ? o.precision : 1e-8, thr = o.identThr != null ? o.identThr : 0.001, comp = (a.header['dlf-component'] || ''), sml = Object.assign({}, DaisyIO.SML[comp] || {}, o.sml || {});
    const skip = new Set(['VERSION', 'RUN', 'SIMFILE', 'SIM', 'dlf-def-location', 'info', 'LOGFILE']), out = { errors: [], notSimilar: [], notIdentical: [], columns: [], rows: Math.min(a.n, b.n), same: true };
    const hk = new Set(Object.keys(a.header).concat(Object.keys(b.header))); hk.forEach(k => { if (skip.has(k)) return; const x = JSON.stringify(a.header[k]), y = JSON.stringify(b.header[k]); if (x !== y) out.notSimilar.push('header ' + k + ': ' + x + ' against ' + y); });
    if (a.cols.join('|') !== b.cols.join('|')) out.notSimilar.push('the columns differ: ' + a.cols.length + ' against ' + b.cols.length);
    if (a.n !== b.n) out.notSimilar.push('the number of rows differs: ' + a.n + ' against ' + b.n);
    if (!out.notSimilar.length) a.cols.forEach((c, j) => { let mx = 0, at = -1, nd = 0, nns = 0; const s = sml[c.replace(/\s*@.*$/, '')]; for (let r = 0; r < a.n; r++) { const x = a.data[j][r], y = b.data[j][r]; if (!(isFinite(x) || isFinite(y))) continue; const df = Math.abs(x - y); if (df > prec || !(df <= prec)) { nd++; if (df > mx || !isFinite(df)) { mx = df; at = r; } if (s != null ? df > s : df > prec) nns++; } }
      out.columns.push({ c, unit: a.units[c] || '', sml: s != null ? s : null, nDiff: nd, nNotSimilar: nns, maxDiff: mx, at, identical: nd === 0 || (s != null ? mx < thr * s : mx < thr * prec), similar: nns === 0 }); if (nns) out.notSimilar.push(c + ': ' + nns + ' values differ by more than ' + (s != null ? 'the smallest meaningful level ' + s + ' ' + (a.units[c] || '') : prec) + ' (largest ' + mx.toPrecision(4) + (at >= 0 && a.time ? ' on ' + new Date(a.time[at]).toISOString().slice(0, 10) : '') + ')'); else if (nd) out.notIdentical.push(c + ': ' + nd + ' values differ, all inside the smallest meaningful level (largest ' + mx.toPrecision(3) + ')'); });
    out.same = !out.notSimilar.length; out.identical = out.same && !out.notIdentical.length; return out;
  };

  // ------------------------------------------------------------------ DAI: Daisy set-up files (a LISP-like language)
  // tokens: ( ) comments ;..., quoted strings, units [..], numbers, identifiers, placeholders {name}
  DaisyIO.tokenizeDai = function (s) {
    const T = []; let i = 0; const n = s.length;
    while (i < n) { const c = s[i];
      if (c === '\n' || c === ' ' || c === '\t' || c === '\r') { let j = i; while (j < n && ' \t\r\n'.includes(s[j])) j++; T.push({ t: 'ws', v: s.slice(i, j), i }); i = j; continue; }
      if (c === ';') { let j = i; while (j < n && s[j] !== '\n') j++; T.push({ t: 'comment', v: s.slice(i, j), i }); i = j; continue; }
      if (c === '(' || c === ')') { T.push({ t: c, v: c, i }); i++; continue; }
      if (c === '"') { let j = i + 1; while (j < n && s[j] !== '"') { if (s[j] === '\\') j++; j++; } T.push({ t: 'str', v: s.slice(i, j + 1), i }); i = j + 1; continue; }
      if (c === '[') { let j = i; while (j < n && s[j] !== ']') j++; T.push({ t: 'unit', v: s.slice(i, j + 1), i }); i = j + 1; continue; }
      if (c === '{') { let j = i; while (j < n && s[j] !== '}') j++; T.push({ t: 'placeholder', v: s.slice(i, j + 1), i }); i = j + 1; continue; }
      let j = i; while (j < n && !' \t\r\n()";[{'.includes(s[j])) j++; if (j === i) j = i + 1; const w = s.slice(i, j); T.push({ t: /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/.test(w) ? 'num' : 'id', v: w, i }); i = j; }
    return T;
  };
  // the tree: { t: 'list', v: [...] } with atoms { t: 'id' | 'num' | 'str' | 'unit' | 'placeholder', v }, comments kept as { t: 'comment' }
  DaisyIO.parseDai = function (text) {
    const tk = DaisyIO.tokenizeDai(text).filter(x => x.t !== 'ws'); let p = 0; const errors = [];
    const line = i => text.slice(0, i).split('\n').length;
    function item() { const x = tk[p++]; if (x.t === '(') { const L = { t: 'list', v: [], line: line(x.i) }; while (p < tk.length && tk[p].t !== ')') L.v.push(item()); if (p >= tk.length) errors.push('line ' + L.line + ': a ( is not closed'); else p++; return L; } if (x.t === ')') { errors.push('line ' + line(x.i) + ': a ) without a matching ('); return { t: 'comment', v: ')' }; } return { t: x.t, v: x.v, line: line(x.i) }; }
    const top = []; while (p < tk.length) top.push(item()); return { top, errors };
  };
  DaisyIO.formatDai = function (ast) {
    const atom = x => x.v; const one = x => x.t === 'list' ? '(' + x.v.filter(y => y.t !== 'comment').map(one).join(' ') + ')' : atom(x);
    function fmt(x, ind) { if (x.t !== 'list') return atom(x); const flat = one(x); if (flat.length + ind < 90 && !x.v.some(y => y.t === 'comment')) return flat; const pad = ' '.repeat(ind + 2); let o = '(' + (x.v[0] ? (x.v[0].t === 'list' ? fmt(x.v[0], ind + 1) : atom(x.v[0])) : ''); for (let k = 1; k < x.v.length; k++) { const y = x.v[k]; if (y.t === 'comment') o += ' ' + y.v; else o += '\n' + pad + fmt(y, ind + 2); } return o + ')'; }
    return ast.top.map(x => x.t === 'comment' ? x.v : fmt(x, 0)).join('\n') + '\n';
  };
  // every definition: (defcrop name parent ...), (defhorizon ...) and so on
  DaisyIO.definitions = function (ast) { return ast.top.filter(x => x.t === 'list' && x.v[0] && /^def/.test(x.v[0].v)).map(x => ({ kind: x.v[0].v.slice(3), name: x.v[1] && x.v[1].t !== 'list' ? x.v[1].v : '', parent: x.v[2] && x.v[2].t !== 'list' ? x.v[2].v : '', node: x, line: x.line })); };
  // a number from a body entry: (clay 3.9 [%]) gives 3.9
  DaisyIO.param = function (node, key) { const e = node.v.find(y => y.t === 'list' && y.v[0] && y.v[0].v === key); if (!e) return null; const a = e.v[1]; return a && a.t === 'num' ? parseFloat(a.v) : a ? a.v : null; };
  DaisyIO.paramNode = function (node, key) { return node.v.find(y => y.t === 'list' && y.v[0] && y.v[0].v === key) || null; };
  // placeholders {name} of a template file are filled with values: the way daisypy-optim writes its trial files
  DaisyIO.fillTemplate = (text, vals) => String(text).replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m, k) => (k in vals ? vals[k] : m));
  DaisyIO.placeholders = text => Array.from(new Set((String(text).match(/\{[A-Za-z_][A-Za-z0-9_]*\}/g) || []).map(x => x.slice(1, -1))));
  // colour classes for the editor: the same groups as the syntax of the daisy-vscode extension
  DaisyIO.DAI_KEYWORDS = ['input', 'run', 'directory', 'path', 'install_directory', 'allow_old_units', 'ui', 'def', 'file'];
  DaisyIO.highlightDai = function (text) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); let depthFirst = false, o = '', prev = null;
    DaisyIO.tokenizeDai(text).forEach(x => { let cls = ''; if (x.t === 'comment') cls = 'dcm'; else if (x.t === 'str') cls = 'dst'; else if (x.t === 'num') cls = 'dnu'; else if (x.t === 'unit') cls = 'dun'; else if (x.t === 'placeholder') cls = 'dph'; else if (x.t === 'id') { if (/^def[a-z_]*$/.test(x.v)) cls = 'ddf'; else if (prev && prev.t === '(' ) cls = DaisyIO.DAI_KEYWORDS.includes(x.v) ? 'dkw' : 'dfn'; else if (/^(true|false)$/.test(x.v)) cls = 'dkw'; } if (x.t !== 'ws') prev = x; o += cls ? '<span class="' + cls + '">' + esc(x.v) + '</span>' : esc(x.v); });
    return o;
  };

  // ------------------------------------------------------------------ DWF: Daisy weather files
  DaisyIO.readDwf = function (text, name) {
    const L = String(text).replace(/\r/g, '').split('\n'); const meta = {}; let i = 0;
    for (; i < L.length; i++) { const s = L[i].trim(); if (/^-{5,}/.test(s)) { i++; break; } if (!s || s[0] === '#' || /^dwf-/i.test(s)) continue; const k = s.indexOf(':'); if (k > 0) meta[s.slice(0, k).trim()] = s.slice(k + 1).trim(); }
    const cols = (L[i++] || '').split(/\s+/).filter(Boolean), units = (L[i++] || '').split(/\s+/).filter(Boolean), data = cols.map(() => []);
    for (; i < L.length; i++) { const p = L[i].trim().split(/\s+/); if (p.length < 3 || !isFinite(parseFloat(p[0]))) continue; cols.forEach((c, j) => data[j].push(parseFloat(p[j]))); }
    const d = { name: name || meta.Station || 'weather', header: meta, units: Object.fromEntries(cols.map((c, j) => [c, units[j] || ''])), cols, data, n: data[0] ? data[0].length : 0 }; DaisyIO.addTime(d); return d;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DaisyIO; else root.DaisyIO = DaisyIO;
})(typeof window !== 'undefined' ? window : globalThis);
