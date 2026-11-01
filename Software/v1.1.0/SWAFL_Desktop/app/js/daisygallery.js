/* Daisy workbench, Log plots: the figures of every result, each one a figure of its own.
   For one log, or for every loaded log, the program draws one independent figure per quantity group (the columns that share a unit),
   an annual figure when the log covers several years, and a depth-time map for every depth variable. Each figure has its own title,
   axis texts with units, legend, a caption that says what it shows, the key numbers (mean, smallest, largest and when, total), and its
   own controls: the kind of line (line, steps, area, cumulative), zoom by dragging across the figure (double-click shows everything again),
   values under the cursor, full screen, titles to edit, and saving as a picture (screen, 300 or 600 dpi) or as a table. */
'use strict';
window.DaisyGallery = (() => {
  const D = () => (typeof DaisyUI !== 'undefined' ? DaisyUI : window.DaisyUI), IO = () => window.DaisyIO, P = () => window.DaisyPlot, FK = () => window.DaisyFigKit;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dstr = t => new Date(t).toISOString().slice(0, 10), fmt = (v, d) => P() ? P().fmt(v, d == null ? 3 : d) : (+v).toFixed(3);
  const TIMECOL = /^(year|month|mday|day|hour|minute|second|date|time)$/i;
  const MAXFIG = 80;
  const flux = (log, u) => /daily|hourly|annual|flux|balance/i.test(log) && /(mm|kg|g|Mg|t)\b/.test(u) && !/(cm3|\/cm|content|%|°|dg C|pF)/i.test(u);
  // the figures of one log: [{ kind, title, cols, unit, log }]
  function plan(name, d) {
    const out = [], dc = IO().depthColumns(d), depth = new Set(), short = name.replace(/.*\//, '').replace(/\.\w+$/, '');
    Object.keys(dc).forEach(v => { dc[v].forEach(c => depth.add(d.cols[c.j])); out.push({ kind: 'heat', title: v + ' over depth and time', v, log: name, short }); });
    const groups = {};
    d.cols.forEach((c, j) => { if (TIMECOL.test(c) || depth.has(c)) return; const y = d.data[j]; if (!y.some(isFinite)) return; if (!y.some(v => isFinite(v) && v !== 0)) { (groups.__zero = groups.__zero || []).push(c); return; } const u = d.units[c] || ''; (groups[u] = groups[u] || []).push(c); });
    Object.keys(groups).filter(u => u !== '__zero').forEach(u => { const cs = groups[u], step = cs.length <= 8 ? 1 : 4; for (let k = 0; k < cs.length; k += step) { const part = cs.slice(k, k + step); out.push({ kind: 'ts', title: part.join(', '), cols: part, unit: u, log: name, short }); } });   // one quantity per figure, so that no line hides another; long logs four at a time
    if (d.time && d.n > 1 && new Date(d.time[d.n - 1]).getUTCFullYear() > new Date(d.time[0]).getUTCFullYear()) Object.keys(groups).filter(u => u !== '__zero' && flux(name, u)).forEach(u => out.push({ kind: 'ann', title: 'Annual totals in ' + u, cols: groups[u].slice(0, 6), unit: u, log: name, short }));
    return { figs: out, zeros: groups.__zero || [] };
  }
  // key numbers of a column inside the rows ix
  function stats(d, c, ix) { const v = IO().col(d, c); let n = 0, s = 0, lo = Infinity, hi = -Infinity, ilo = -1, ihi = -1; ix.forEach(i => { const x = v[i]; if (!isFinite(x)) return; n++; s += x; if (x < lo) { lo = x; ilo = i; } if (x > hi) { hi = x; ihi = i; } }); return { n, mean: n ? s / n : NaN, sum: s, lo, hi, tlo: ilo, thi: ihi }; }
  function card(host, f, d, num) {
    const el = document.createElement('div'); el.className = 'dzpan dzfig dzgal'; el.style.cssText = 'margin:10px 0;padding:8px 10px;background:#fff';
    const ctl = f.kind === 'ts' ? '<label style="font-size:12px">Draw as <select data-g="mode"><option value="line">lines</option><option value="step">steps</option><option value="area">areas</option><option value="cum">cumulative sums</option><option value="pts">points</option></select></label><label style="font-size:12px"><input type="checkbox" data-g="zero"> axis from zero</label>' : f.kind === 'heat' ? '<label style="font-size:12px">Colours <select data-g="pal"><option value="">automatic</option><option value="viridis">viridis</option><option value="blues">blues</option><option value="ylorrd">yellow-red</option><option value="ylgn">yellow-green</option><option value="pf">suction (pF)</option></select></label>' : '';
    el.innerHTML = '<div class="dzrow"><b>Figure ' + num + '. ' + esc(f.title) + '</b><span class="pnote" style="margin-left:6px">' + esc(f.short) + '</span><span style="flex:1"></span></div>' +
      '<div class="dzrow" style="gap:10px">' + ctl + (f.kind !== 'heat' ? '<span class="pnote">Drag across the figure to zoom in time; double-click to see all of it again. The values under the cursor are shown below.</span>' : '') + '</div>' +
      '<div><canvas style="display:block;width:100%;cursor:crosshair"></canvas></div><div class="dzro pnote" data-g="ro"></div><div data-g="cap" style="font-size:12.5px;color:#333;margin-top:4px"></div><div data-g="num"></div>';
    host.appendChild(el); const cv = el.querySelector('canvas'), st = { range: null };
    const rows = () => { const all = d.data[0].map((_, i) => i); if (!st.range || !d.time) return all; return all.filter(i => d.time[i] >= st.range[0] && d.time[i] <= st.range[1]); };
    const draw = () => {
      const ix = rows(), mode = (el.querySelector('[data-g="mode"]') || {}).value || 'line', zero = (el.querySelector('[data-g="zero"]') || {}).checked, span = d.time && ix.length ? dstr(d.time[ix[0]]) + ' to ' + dstr(d.time[ix[ix.length - 1]]) : ix.length + ' rows';
      if (f.kind === 'heat') { const L = IO().depthLong(d, f.v), pal = (el.querySelector('[data-g="pal"]') || {}).value || ({ Theta: 'blues', h: 'pf', T: 'ylorrd' }[f.v] || 'viridis'); P().heat(cv, L.t, L.z, L.v, { title: f.title, time: !!d.time, unit: f.v + (L.unit ? ' [' + L.unit + ']' : ''), pal, h: 320 });
        let lo = Infinity, hi = -Infinity; L.v.forEach(x => { if (isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }); const zs = Array.from(new Set(L.z)).sort((a, b) => b - a);
        el.querySelector('[data-g="cap"]').innerHTML = '<b>What it shows.</b> ' + esc(f.v) + (L.unit ? ' (' + esc(L.unit) + ')' : '') + ' in every layer of the soil from ' + fmt(zs[0], 1) + ' to ' + fmt(zs[zs.length - 1], 1) + ' cm, through ' + span + ': time runs from left to right, depth downwards, and the colour is the value. Values from ' + fmt(lo) + ' to ' + fmt(hi) + '. Written by Daisy in ' + esc(f.short) + '.'; el.querySelector('[data-g="num"]').innerHTML = ''; return; }
      if (f.kind === 'ann') { const yrs = {}; f.cols.forEach(c => { const a = IO().annual(d, c); Object.keys(a).forEach(y => { (yrs[y] = yrs[y] || {})[c] = a[y].s; }); }); const ys = Object.keys(yrs).map(Number).sort((a, b) => a - b);
        P().line(cv, f.cols.map(c => ({ name: c, x: ys, y: ys.map(y => yrs[y][c]), bars: f.cols.length === 1, pts: f.cols.length > 1, line: f.cols.length > 1 })), { title: f.title, xint: true, zero: true, xt: 'Year', yt: 'annual total (' + f.unit + ')', h: 300 });
        el.querySelector('[data-g="cap"]').innerHTML = '<b>What it shows.</b> The sum of each day of every calendar year of ' + esc(f.cols.join(', ')) + ' (' + esc(f.unit) + '), ' + ys[0] + ' to ' + ys[ys.length - 1] + '. A partial first or last year has a smaller sum.';
        el.querySelector('[data-g="num"]').innerHTML = '<table class="dzt" style="font-size:12px;margin-top:4px"><tr><th>Column</th><th>Mean of the years</th><th>Driest or lowest year</th><th>Wettest or highest year</th></tr>' + f.cols.map(c => { const v = ys.map(y => yrs[y][c]), m = v.reduce((a, b) => a + b, 0) / v.length, il = v.indexOf(Math.min(...v)), ih = v.indexOf(Math.max(...v)); return '<tr><td>' + esc(c) + '</td><td>' + fmt(m) + '</td><td>' + fmt(v[il]) + ' (' + ys[il] + ')</td><td>' + fmt(v[ih]) + ' (' + ys[ih] + ')</td></tr>'; }).join('') + '</table>'; return; }
      const x = ix.map(i => d.time ? d.time[i] : i), ser = f.cols.map(c => { const v = IO().col(d, c); let acc = 0; const y = ix.map(i => { const q = v[i]; if (mode === 'cum') { if (isFinite(q)) acc += q; return acc; } return q; }); return { name: c + (f.unit ? ' [' + f.unit + ']' : ''), x, y, step: mode === 'step', area: mode === 'area', pts: mode === 'pts', line: mode !== 'pts', r: 1.8 }; });
      P().line(cv, ser, { title: f.title + (mode === 'cum' ? ' (cumulative)' : ''), time: !!d.time, zero, xt: d.time ? 'Date' : 'Row', yt: (mode === 'cum' ? 'cumulative ' : '') + (f.unit || 'model units'), h: 300 });
      const S = f.cols.map(c => [c, stats(d, c, ix)]);
      el.querySelector('[data-g="cap"]').innerHTML = '<b>What it shows.</b> ' + esc(f.cols.join(', ')) + ' (' + esc(f.unit || 'no unit given') + ') written by Daisy in ' + esc(f.short) + ', ' + span + (st.range ? ' (zoomed: double-click to see all)' : '') + '. ' + (mode === 'cum' ? 'Each line adds up the values from the first date, so its end is the total of the period.' : 'Each line is one column of the log.');
      el.querySelector('[data-g="num"]').innerHTML = '<table class="dzt" style="font-size:12px;margin-top:4px"><tr><th>Column</th><th>Mean</th><th>Smallest</th><th>Largest</th><th>Sum of the period</th></tr>' + S.map(([c, s]) => '<tr><td>' + esc(c) + '</td><td>' + fmt(s.mean) + '</td><td>' + fmt(s.lo) + (d.time && s.tlo >= 0 ? ' (' + dstr(d.time[s.tlo]) + ')' : '') + '</td><td>' + fmt(s.hi) + (d.time && s.thi >= 0 ? ' (' + dstr(d.time[s.thi]) + ')' : '') + '</td><td>' + fmt(s.sum) + '</td></tr>').join('') + '</table>';
    };
    el.querySelectorAll('[data-g="mode"],[data-g="zero"],[data-g="pal"]').forEach(e => e.onchange = draw);
    // zoom: drag across the time axis
    let x0 = null; const tOf = ev => { const g = cv._geo; if (!g) return null; const r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) * (cv.width / r.width) / (window.devicePixelRatio || 1); return g.x0 + (Math.max(g.L, Math.min(g.L + g.pw, ev.clientX - r.left)) - g.L) / g.pw * (g.x1 - g.x0); };
    if (f.kind === 'ts' && d.time) { cv.addEventListener('mousedown', e => { x0 = tOf(e); }); cv.addEventListener('mouseup', e => { const x1 = tOf(e); if (x0 != null && x1 != null && Math.abs(x1 - x0) > 864e5 * 2) { st.range = [Math.min(x0, x1), Math.max(x0, x1)]; draw(); } x0 = null; }); cv.addEventListener('dblclick', () => { st.range = null; draw(); }); }
    cv.addEventListener('mousemove', () => { const r = el.querySelector('[data-g="ro"]'); if (r) r.textContent = cv.title || ''; });
    try { draw(); } catch (e) { el.querySelector('[data-g="cap"]').textContent = 'Not drawn: ' + e.message; }
    if (FK()) FK().attach(el, { name: 'daisy-' + f.short + '-' + num, redraw: draw });
    return el;
  }
  function mount(host) {
    if (!host) return; const names = D().names();
    host.innerHTML = '<div class="dzhelp"><b>Every result as a figure of its own.</b> Choose a log, or all of them, and press <i>Make the figures</i>. Each quantity group (the columns that share a unit) becomes one figure, with an annual figure for several years and a depth-time map for every depth variable. Every figure stands alone: its title, axes with units, legend, a caption that says what it shows and its key numbers, and its own buttons to change the drawing, zoom, show it on the whole screen, edit its texts and save it as a picture or a table.</div>' +
      '<div class="dzrow"><label>Figures of</label><select id="dzGsel"><option value="*">every loaded log (' + names.length + ')</option>' + names.map(n => '<option>' + esc(n) + '</option>').join('') + '</select><button class="btn pri" id="dzGgo"' + (names.length ? '' : ' disabled') + '>Make the figures</button><span id="dzGst" class="pnote">' + (names.length ? '' : 'Load logs above (or use the output of your runs) first.') + '</span></div><div id="dzGout"></div>';
    const sel = host.querySelector('#dzGsel'); if (names.length === 1) sel.value = names[0]; else { const cur = document.getElementById('dzPLog'); if (cur && cur.value) sel.value = cur.value; }
    host.querySelector('#dzGgo').onclick = () => {
      const out = host.querySelector('#dzGout'), st = host.querySelector('#dzGst'), list = sel.value === '*' ? D().names() : [sel.value]; out.innerHTML = ''; let n = 0, skipped = 0; const zeroNote = [];
      list.forEach(name => { const d = D().S.logs[name]; if (!d || !d.cols) return; const pl = plan(name, d); if (pl.zeros.length) zeroNote.push(name.replace(/.*\//, '') + ': ' + pl.zeros.join(', '));
        if (list.length > 1) { const h = document.createElement('h4'); h.style.cssText = 'margin:14px 0 2px;color:#154378'; h.textContent = name; out.appendChild(h); }
        pl.figs.forEach(f => { if (n >= MAXFIG) { skipped++; return; } n++; card(out, f, d, n); }); });
      if (FK() && n) FK().bar(out, { name: 'daisy-results' });
      if (zeroNote.length) out.insertAdjacentHTML('beforeend', '<details class="pnote" style="margin-top:6px"><summary>Columns left out because they are zero throughout</summary>' + zeroNote.map(esc).join('<br>') + '</details>');
      st.textContent = n + ' figure' + (n === 1 ? '' : 's') + ' made' + (skipped ? '; ' + skipped + ' more not drawn (choose one log to see them)' : '') + '.';
    };
  }
  return { mount, plan };
})();
