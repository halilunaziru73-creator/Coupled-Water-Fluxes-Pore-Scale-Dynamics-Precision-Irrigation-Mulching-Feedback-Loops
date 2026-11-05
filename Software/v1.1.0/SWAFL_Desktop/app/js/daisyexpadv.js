/* Daisy workbench: advanced figures of one experiment, for a paper.
   Interactions: how much of the spread of the results each factor explains alone (diagonal) and how much two factors explain together beyond
   their separate effects (off the diagonal), as one matrix you can click; the interaction plot of any pair of factors, both ways round, with the
   lowest and highest run in each cell; and the same interaction through the year (the effect of one factor on a daily quantity, for each level
   of another factor, matched run to run).
   Time series: the quantity of every run as a strip (one row per run, one column per day of the year, runs ranked by the result), and the
   running total of every run, each line coloured by the final result so that the day on which the runs part can be read.
   Every figure has the toolbar of every figure (titles, picture at 300 or 600 dpi, the numbers) and is drawn again from the runs when anything changes. */
'use strict';
window.DaisyExpAdv = (() => {
  const P = () => window.DaisyPlot, X = () => window.DaisyExp, IO = () => window.DaisyIO, FK = () => window.DaisyFigKit, TS = () => window.DaisyExpTS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FONT = '"Segoe UI", Arial, sans-serif', NAVY = '#154378', INK = '#222', GRID = '#e3e6ea';
  const mean = a => { a = a.filter(isFinite); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN; };
  const pct = (a, p) => { a = a.filter(isFinite).sort((x, y) => x - y); if (!a.length) return NaN; const k = (a.length - 1) * p, i = Math.floor(k); return i + 1 < a.length ? a[i] + (a[i + 1] - a[i]) * (k - i) : a[i]; };
  const short = s => String(s || '').replace(/ \(.*/, '').replace(/, factor.*/, '');
  const fv = r => r.val || r.f || {}, same = (a, b) => String(a) === String(b);
  const pc = v => !isFinite(v) ? '-' : v < 5e-5 ? '0 %' : (v * 100 < 0.1 ? (v * 100).toFixed(2) : (v * 100).toFixed(1)) + ' %';
  const num = (v, d) => v == null || !isFinite(v) ? '-' : Math.abs(v) >= 1000 ? String(Math.round(v)) : (+v.toPrecision(d || 3)).toString();
  const doyOf = t => { const d = new Date(t); return Math.round((t - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5); };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MSTART = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const TIMECOL = /^(year|month|mday|day|hour|minute|second|date|time)$/i;
  const PRIO = [/^LAI$/, /WSOrg|yield/i, /^DS$/, /evapotranspiration|^Ea$|actual_evap/i, /transpiration/i, /soil.?evap/i, /percolation|matrix.?water|leach|drain/i, /NCrop|uptake/i, /NO3|nitrate/i, /stress/i, /^Theta$/i, /irrigation/i];
  const SU = u => window.SciText ? window.SciText.unit(u) : u;
  const memo = { st: {} };
  if (!document.getElementById('dzadvCss')) { const t = document.createElement('style'); t.id = 'dzadvCss'; t.textContent = '.dzadv .dzrow{gap:4px 8px;flex-wrap:wrap}.dzadv label{margin-left:8px;font-weight:600}.dzadv .dzrow>b{margin-right:8px}.dzadv .dzrow>.pnote{margin-left:6px}.dzadv-tip{position:fixed;z-index:9999;background:#fffffff2;border:1px solid #154378;border-radius:5px;padding:4px 8px;font:12px "Segoe UI",Arial,sans-serif;pointer-events:none;box-shadow:0 2px 8px #0003;max-width:300px}'; document.head.appendChild(t); }
  let tip = null; const showTip = (e, html) => { if (!tip) { tip = document.createElement('div'); tip.className = 'dzadv-tip'; document.body.appendChild(tip); } tip.innerHTML = html; tip.style.display = 'block'; tip.style.left = Math.min(window.innerWidth - 310, e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
  const hideTip = () => { if (tip) tip.style.display = 'none'; };
  const ramp = (t) => P().ramp('viridis', Math.max(0, Math.min(1, t)));
  const axisTicks = (lo, hi, n) => P().nice(lo, hi, n || 5);

  // ---- interaction numbers ---------------------------------------------------------------
  // share of the variance of the runs explained by factor f alone (diagonal) and by the pair beyond the separate effects (interaction)
  function variance(rows, fids, resp) {
    const R = rows.filter(r => !r.reference && isFinite(r.r[resp])), N = R.length, gm = mean(R.map(r => r.r[resp])), tot = R.reduce((s, r) => s + Math.pow(r.r[resp] - gm, 2), 0) || 1e-12;
    const lv = f => X().levels(R, f), cell = (f, g, x, y) => R.filter(r => same(fv(r)[f], x) && (g == null || same(fv(r)[g], y))).map(r => r.r[resp]);
    const main = {}; fids.forEach(f => { main[f] = lv(f).reduce((s, x) => { const v = cell(f, null, x); return s + v.length * Math.pow(mean(v) - gm, 2); }, 0) / tot; });
    const inter = {}; for (let i = 0; i < fids.length; i++) for (let j = i + 1; j < fids.length; j++) { const f = fids[i], g = fids[j]; let ss = 0;
      lv(f).forEach(x => lv(g).forEach(y => { const v = cell(f, g, x, y); if (!v.length) return; const mf = mean(cell(f, null, x)), mg = mean(cell(g, null, y)); ss += v.length * Math.pow(mean(v) - mf - mg + gm, 2); })); inter[f + '|' + g] = inter[g + '|' + f] = ss / tot; }
    return { main, inter, N, gm, tot };
  }

  function mount(host, c) {
    if (!host) return; const rows = (c.rows || []).filter(r => r && r.r), X_ = X(), runs = (c.runs || []).filter(r => r && r.logs);
    const multi = (c.fids || []).filter(f => f !== 'run' && X_.levels(rows.filter(r => !r.reference), f).length > 1);
    const resp = c.resp, rname = short(c.rlabel(resp)), runit = SU((X_.RESP.find(q => q.id === resp) || {}).unit || '');
    const key = (c.key || 'own') + '|' + multi.join(','), S = memo.st[key] || (memo.st[key] = {});
    const V = multi.length >= 2 ? variance(rows, multi, resp) : null;
    if (V && (!S.a || multi.indexOf(S.a) < 0 || multi.indexOf(S.b) < 0 || S.a === S.b)) { let best = null; for (let i = 0; i < multi.length; i++) for (let j = i + 1; j < multi.length; j++) { const v = V.inter[multi[i] + '|' + multi[j]]; if (!best || v > best.v) best = { v, a: multi[i], b: multi[j] }; } S.a = best.a; S.b = best.b; }
    // the daily quantities of the runs
    const logs = {}; runs.forEach(r => Object.keys(r.logs).forEach(k => { const d = r.logs[k]; if (d && d.n && d.cols && !logs[k]) logs[k] = d; }));
    const isDaily = (name, d) => /daily|hourly/i.test(name) || (d.time && d.n > 60 && (d.time[d.n - 1] - d.time[0]) / Math.max(1, d.n - 1) < 3 * 864e5);
    let qs = []; Object.keys(logs).forEach(n => { const d = logs[n]; if (!d.time || !isDaily(n, d)) return; const dc = IO().depthColumns(d), depth = new Set(); Object.keys(dc).forEach(v => dc[v].forEach(q => depth.add(q.j)));
      d.cols.forEach((col, j) => { if (TIMECOL.test(col) || depth.has(j)) return; const y = d.data[j]; if (!y || !y.some(v => isFinite(v) && v !== 0)) return; qs.push({ id: n + '::' + col, log: n, col, unit: SU(d.units && d.units[col] || '') }); }); });
    const pr = q => { const i = PRIO.findIndex(r => r.test(q.col)); return i < 0 ? 50 : i; }; qs = qs.map((q, i) => ({ q, i })).sort((a, b) => pr(a.q) - pr(b.q) || a.i - b.i).map(x => x.q);
    if (!S.q || !qs.some(q => q.id === S.q)) S.q = qs.length ? qs[0].id : null; if (!S.mode) S.mode = 'value';
    const Q = qs.find(q => q.id === S.q), qname = Q ? (Q.col.replace(/_/g, ' ') + (Q.unit ? ' (' + Q.unit + ')' : '')) : '';
    const opt = (v, t, cur) => '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
    const fopt = cur => multi.map(f => opt(f, short(c.flabel(f)), cur)).join('');
    let h = '<div class="dzadv">';
    if (V) h += '<div class="dzpan"><div class="dzrow"><b>Interaction map of the factors</b><span class="pnote">for ' + esc(rname.toLowerCase()) + '</span></div><p class="pnote">Each cell is the share of the variance of the results of the ' + V.N + ' runs. Diagonal: what a factor explains alone. Off the diagonal: what two factors explain together beyond their separate effects (an interaction: the effect of one depends on the level of the other). Darker means more. Click a cell to open its interaction plot below.</p><div data-adv="mapwrap"><canvas data-adv="map"></canvas></div></div>';
    if (V) h += '<div class="dzpan dzfig" data-xf="adv_ip"><div class="dzrow"><b>Interaction plot</b><label>Factor on the axis</label><select data-adv="a">' + fopt(S.a) + '</select><label>One line for each value of</label><select data-adv="b">' + fopt(S.b) + '</select><button class="btn" data-adv="swap" title="Swap the two factors">&#8646;</button></div><p class="pnote" data-adv="ipnote"></p><div><canvas data-adv="ip"></canvas></div></div>';
    if (Q) {
      h += '<div class="dzpan"><div class="dzrow"><b>Through the year</b><label>Quantity</label><select data-adv="q" style="max-width:320px">' + qs.slice(0, 200).map(q => opt(q.id, q.col.replace(/_/g, ' ') + (q.unit ? ' (' + q.unit + ')' : '') + '  ·  ' + q.log, S.q)).join('') + '</select><label>Show</label><select data-adv="mode">' + opt('value', 'the value, day by day', S.mode) + opt('cum', 'the running total', S.mode) + '</select><span class="pnote">The day of the year is the mean of all the seasons of the runs.</span></div></div>';
      if (V) h += '<div class="dzpan dzfig" data-xf="adv_eff"><div class="dzrow"><b>Effect of a factor through the year, for each level of another</b></div><p class="pnote" data-adv="effnote"></p><div><canvas data-adv="eff"></canvas></div></div>';
      h += '<div class="dzpan dzfig" data-xf="adv_race"><div class="dzrow"><b>Every run through the year</b></div><p class="pnote" data-adv="racenote"></p><div><canvas data-adv="race"></canvas></div></div>';
      h += '<div class="dzpan dzfig" data-xf="adv_strip"><div class="dzrow"><b>Runs against days</b></div><p class="pnote" data-adv="stripnote"></p><div><canvas data-adv="strip"></canvas></div></div>';
    }
    h += '</div>'; host.innerHTML = h;
    const $ = k => host.querySelector('[data-adv="' + k + '"]'), card = id => host.querySelector('[data-xf="' + id + '"]');
    if (!V && !Q) { host.innerHTML = '<p class="pnote">The advanced figures need at least two factors that differ between the runs, or runs with daily logs.</p>'; return; }

    // ---- series of a run through the year (mean of the seasons) ----
    const cache = {}; const seriesOf = r => { const k = r.id + '|' + S.q; if (cache[k]) return cache[k]; const d = r.logs[Q.log]; let out = null;
      if (d && d.time) { const j = d.cols.indexOf(Q.col), y = j >= 0 ? d.data[j] : null; if (y) { const sum = new Float64Array(366), cnt = new Float64Array(366); for (let i = 0; i < d.n; i++) if (isFinite(y[i])) { const k2 = Math.min(365, doyOf(d.time[i])); sum[k2] += y[i]; cnt[k2]++; } out = Array.from(sum, (s, i) => cnt[i] ? s / cnt[i] : NaN); } }
      return (cache[k] = out); };
    const prep = a => { if (!a) return a; if (S.mode !== 'cum') return a; let s = 0; return a.map(v => { if (isFinite(v)) s += v; return isFinite(v) ? s : NaN; }); };
    const rowOf = r => rows.find(q => q.id === r.id);
    const rr = r => { const q = rowOf(r); return q ? q.r[resp] : NaN; };
    const yTitle = () => (S.mode === 'cum' ? 'Running total of ' : '') + (Q ? Q.col.replace(/_/g, ' ') : '') + (Q && Q.unit ? ' (' + Q.unit + ')' : '');
    const doyAxis = (g, L, T, pw, ph) => { g.font = '11px ' + FONT; g.fillStyle = '#444'; g.strokeStyle = GRID; g.textAlign = 'center'; MSTART.forEach((d, i) => { const x = L + d / 365 * pw; g.beginPath(); g.moveTo(x + .5, T); g.lineTo(x + .5, T + ph); g.stroke(); g.fillText(MON[i], x + 365 / 12 / 365 * pw / 2, T + ph + 15); }); };
    const frameOf = (cv, o, hh) => P().frame(cv, Object.assign({}, o), hh);
    const yAxis = (g, nn, L, T, pw, ph, Y, label) => { g.font = '11px ' + FONT; g.textAlign = 'right'; g.fillStyle = '#444'; nn.t.forEach(t => { const yy = Y(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(L, yy + .5); g.lineTo(L + pw, yy + .5); g.stroke(); g.fillText(+t.toPrecision(6), L - 6, yy + 4); }); if (label) { g.save(); g.translate(14, T + ph / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = INK; g.font = '12px ' + FONT; g.fillText(label, 0, 0); g.restore(); } };
    const frameBox = (g, L, T, pw, ph) => { g.strokeStyle = '#333'; g.lineWidth = 1; g.strokeRect(L + .5, T + .5, pw - 1, ph - 1); };
    const lname = (f, v) => c.lname ? c.lname(f, v) : String(v);

    // ---- 1 the interaction map ----
    function drawMap() {
      const cv = $('map'); if (!cv || !V) return; const n = multi.length, F = frameOf(cv, { title: 'Share of the variance of ' + rname.toLowerCase() + ' explained, by factor and by pair' }, 60 + 56 * n + 90), { g, w } = F;
      g.font = '12px ' + FONT; const labs = multi.map(f => short(c.flabel(f))), Lw = Math.min(220, Math.max.apply(null, labs.map(l => g.measureText(l).width)) + 14), T = F.top + 8 + 70, cw = Math.min(110, (w - Lw - 110) / n), ch = 52;
      const vals = []; multi.forEach((f, i) => multi.forEach((g2, j) => vals.push(i === j ? V.main[f] : V.inter[f + '|' + g2]))); const hi = Math.max(0.05, Math.max.apply(null, vals));
      cv._cells = [];
      multi.forEach((f, i) => { g.save(); g.translate(Lw + i * cw + cw / 2 + 4, T - 6); g.rotate(-Math.PI / 4); g.textAlign = 'left'; g.fillStyle = INK; g.font = '11.5px ' + FONT; g.fillText(labs[i].length > 26 ? labs[i].slice(0, 25) + '…' : labs[i], 0, 0); g.restore(); });
      multi.forEach((f, j) => { g.textAlign = 'right'; g.fillStyle = INK; g.font = '12px ' + FONT; g.fillText(labs[j].length > 30 ? labs[j].slice(0, 29) + '…' : labs[j], Lw - 8, T + j * ch + ch / 2 + 4);
        multi.forEach((f2, i) => { if (i > j) return; const v = i === j ? V.main[f] : V.inter[f + '|' + f2], t = v / hi, x = Lw + i * cw, y = T + j * ch; g.fillStyle = i === j ? P().ramp('blues', 0.12 + 0.8 * t) : P().ramp('ylorrd', 0.1 + 0.85 * t); g.fillRect(x, y, cw - 2, ch - 2);
          if (i !== j && ((S.a === f && S.b === f2) || (S.a === f2 && S.b === f))) { g.strokeStyle = NAVY; g.lineWidth = 2.5; g.strokeRect(x + 1, y + 1, cw - 4, ch - 4); }
          g.fillStyle = t > 0.62 ? '#fff' : '#111'; g.textAlign = 'center'; g.font = 'bold 13px ' + FONT; g.fillText(pc(v), x + cw / 2 - 1, y + ch / 2 + 5); cv._cells.push({ x, y, w: cw - 2, h: ch - 2, f, g2: f2, i, j, v }); }); });
      // legend
      const lx = Lw + n * cw + 20, ly = T; for (let k = 0; k < 100; k++) { g.fillStyle = P().ramp('ylorrd', 0.1 + 0.85 * (1 - k / 99)); g.fillRect(lx, ly + k * 1.4, 14, 1.5); } g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(pc(hi), lx + 20, ly + 8); g.fillText('0', lx + 20, ly + 142); g.fillText('blue: alone', lx, ly + 164); g.fillText('red: together', lx, ly + 178);
      cv.onclick = e => { const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) * (cv.clientWidth ? parseFloat(cv.style.width) / cv.clientWidth : 1), y = (e.clientY - b.top) * (cv.clientHeight ? parseFloat(cv.style.height) / cv.clientHeight : 1); const hit = cv._cells.find(q => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h); if (hit && hit.i !== hit.j) { S.a = hit.g2; S.b = hit.f; $('a').value = S.a; $('b').value = S.b; drawMap(); drawIP(); drawEff(); card('adv_ip').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } };
      cv.style.cursor = 'pointer'; cv.onmousemove = e => { const b = cv.getBoundingClientRect(), k = parseFloat(cv.style.width) / (cv.clientWidth || 1), x = (e.clientX - b.left) * k, y = (e.clientY - b.top) * k, hit = cv._cells.find(q => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h); if (hit) showTip(e, hit.i === hit.j ? '<b>' + esc(short(c.flabel(hit.f))) + '</b><br>explains ' + num(hit.v * 100, 3) + ' % of the variance alone' : '<b>' + esc(short(c.flabel(hit.f))) + ' with ' + esc(short(c.flabel(hit.g2))) + '</b><br>interaction: ' + num(hit.v * 100, 3) + ' % of the variance<br><i>click to plot it</i>'); else hideTip(); }; cv.onmouseleave = hideTip;
      cv._csv = () => { const o = [['factor', 'with factor', 'share of the variance (%)']]; multi.forEach(f => { o.push([short(c.flabel(f)), '(alone)', V.main[f] * 100]); }); multi.forEach((f, i) => multi.forEach((g2, j) => { if (j > i) o.push([short(c.flabel(f)), short(c.flabel(g2)), V.inter[f + '|' + g2] * 100]); })); return o; };
    }

    // ---- 2 the interaction plot, both ways round ----
    function drawIP() {
      const cv = $('ip'); if (!cv || !V) return; const pair = [[S.a, S.b], [S.b, S.a]], R = rows.filter(q => !q.reference && isFinite(q.r[resp]));
      const F = frameOf(cv, { title: short(c.flabel(S.a)) + ' with ' + short(c.flabel(S.b)) + ': ' + rname.toLowerCase() }, 360), { g, w, h } = F; let all = []; R.forEach(q => all.push(q.r[resp])); const nn = axisTicks(Math.min.apply(null, all), Math.max.apply(null, all), 5);
      const gap = 56, PW = (w - 80 - gap) / 2, T = F.top + 14, PH = h - T - 70; cv._pts = [];
      pair.forEach(([fa, fb], pi) => { const L = 66 + pi * (PW + gap), xs = X().levels(R, fa), bs = Y_levels(fb), Y = v => T + PH - (v - nn.lo) / (nn.hi - nn.lo || 1) * PH, XX = i => L + (xs.length === 1 ? PW / 2 : 30 + i / (xs.length - 1) * (PW - 60));
        yAxis(g, nn, L, T, PW, PH, Y, pi === 0 ? rname + (runit ? ' (' + runit + ')' : '') : ''); frameBox(g, L, T, PW, PH); g.fillStyle = '#111'; g.font = 'bold 16px ' + FONT; g.textAlign = 'left'; g.fillText('(' + 'ab'[pi] + ')', L - 56, T - 2);
        xs.forEach((x, i) => { g.fillStyle = '#444'; g.font = '11px ' + FONT; g.textAlign = 'center'; const t = lname(fa, x); g.fillText(t.length > 16 ? t.slice(0, 15) + '…' : t, XX(i), T + PH + 15); });
        g.fillStyle = INK; g.font = '12px ' + FONT; g.textAlign = 'center'; g.fillText(short(c.flabel(fa)), L + PW / 2, T + PH + 34);
        bs.forEach((b, bi) => { const col = bs.length > 2 && bs.every(v => typeof v === 'number') ? ramp(0.08 + 0.8 * bi / (bs.length - 1)) : P().OKI[bi % 8], pts = []; xs.forEach((x, i) => { const v = R.filter(q => same(fv(q)[fa], x) && same(fv(q)[fb], b)).map(q => q.r[resp]); if (v.length) pts.push({ x: XX(i), y: Y(mean(v)), lo: Y(Math.min.apply(null, v)), hi: Y(Math.max.apply(null, v)), m: mean(v), n: v.length, xl: lname(fa, x), bl: lname(fb, b), mn: Math.min.apply(null, v), mx: Math.max.apply(null, v) }); });
          g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 2; g.globalAlpha = 1; g.beginPath(); pts.forEach((p, k) => k ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.stroke();
          pts.forEach(p => { if (p.n > 1) { g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.x, p.lo); g.lineTo(p.x, p.hi); g.stroke(); g.beginPath(); g.moveTo(p.x - 4, p.lo); g.lineTo(p.x + 4, p.lo); g.moveTo(p.x - 4, p.hi); g.lineTo(p.x + 4, p.hi); g.stroke(); } g.beginPath(); g.arc(p.x, p.y, 4.2, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); g.strokeStyle = col; cv._pts.push(p); }); });
        // legend of the lines under the panel
        let lx = L, ly = T + PH + 52; g.font = '11.5px ' + FONT; bs.forEach((b, bi) => { const col = bs.length > 2 && bs.every(v => typeof v === 'number') ? ramp(0.08 + 0.8 * bi / (bs.length - 1)) : P().OKI[bi % 8], t = lname(fb, b), tw = g.measureText(t).width + 30; if (lx + tw > L + PW) { lx = L; ly += 16; } g.fillStyle = col; g.fillRect(lx, ly - 8, 16, 3); g.fillStyle = INK; g.textAlign = 'left'; g.fillText(t, lx + 20, ly - 2); lx += tw + 8; }); });
      cv.onmousemove = e => { const b = cv.getBoundingClientRect(), k = parseFloat(cv.style.width) / (cv.clientWidth || 1), x = (e.clientX - b.left) * k, y = (e.clientY - b.top) * k; let best = null; cv._pts.forEach(p => { const d = Math.hypot(p.x - x, p.y - y); if (d < 14 && (!best || d < best.d)) best = { d, p }; }); if (best) showTip(e, '<b>' + esc(best.p.xl) + '</b> with <b>' + esc(best.p.bl) + '</b><br>mean ' + num(best.p.m, 4) + ' ' + esc(runit) + '<br>' + best.p.n + ' run' + (best.p.n === 1 ? '' : 's') + (best.p.n > 1 ? ', ' + num(best.p.mn, 4) + ' to ' + num(best.p.mx, 4) : '')); else hideTip(); }; cv.onmouseleave = hideTip;
      const iv = V.inter[S.a + '|' + S.b]; const nt = $('ipnote'); if (nt) nt.textContent = 'Mean of ' + rname + ' for each pair of values, the other factors averaged; the whisker runs from the lowest to the highest run. Lines that are not parallel mean an interaction. Here the pair explains ' + pc(iv) + ' of the variance beyond the separate effects (' + short(c.flabel(S.a)) + ' alone ' + pc(V.main[S.a]) + ', ' + short(c.flabel(S.b)) + ' alone ' + pc(V.main[S.b]) + '). Panel (b) shows the same numbers with the factors swapped.';
      cv._csv = () => { const o = [['factor on the axis', 'value', 'factor of the lines', 'value', 'mean', 'lowest', 'highest', 'runs']]; cv._pts.forEach(p => o.push([short(c.flabel(S.a)), p.xl, short(c.flabel(S.b)), p.bl, p.m, p.mn, p.mx, p.n])); return o; };
    }
    function Y_levels(f) { return X().levels(rows.filter(q => !q.reference), f); }

    // ---- 3 the effect of a factor through the year, for each level of another ----
    function drawEff() {
      const cv = $('eff'); if (!cv || !V || !Q) return; const fa = S.a, fb = S.b, R = runs.filter(r => { const q = rowOf(r); return q && !q.reference; }), ls = Y_levels(fa), lo = ls[0], hi = ls[ls.length - 1], bs = Y_levels(fb);
      const F = frameOf(cv, { title: 'Effect of ' + short(c.flabel(fa)).toLowerCase() + ' on ' + (Q.col.replace(/_/g, ' ')) + ', through the year' }, 380), { g, w, h } = F; const T = F.top + 14, L = 70, PW = w - L - 20, PH = h - T - 64;
      const others = multi.filter(f => f !== fa && f !== fb), curves = [];
      bs.forEach((b, bi) => { const diffs = []; R.filter(r => same(fv(rowOf(r))[fa], hi) && same(fv(rowOf(r))[fb], b)).forEach(r => { const mate = R.find(r2 => same(fv(rowOf(r2))[fa], lo) && same(fv(rowOf(r2))[fb], b) && others.every(o => same(fv(rowOf(r))[o], fv(rowOf(r2))[o]))); if (!mate) return; const s1 = prep(seriesOf(r)), s0 = prep(seriesOf(mate)); if (s1 && s0) diffs.push(s1.map((v, i) => v - s0[i])); });
        if (!diffs.length) return; const m = [], l = [], u = []; for (let i = 0; i < 366; i++) { const col = diffs.map(d => d[i]).filter(isFinite); m.push(col.length ? mean(col) : NaN); l.push(col.length > 2 ? pct(col, .1) : NaN); u.push(col.length > 2 ? pct(col, .9) : NaN); } curves.push({ b, m, l, u, n: diffs.length, col: bs.length > 2 && bs.every(v => typeof v === 'number') ? ramp(0.08 + 0.8 * bi / (bs.length - 1)) : P().OKI[bi % 8] }); });
      if (!curves.length) { g.fillStyle = '#666'; g.font = '13px ' + FONT; g.fillText('No pair of runs differs only in ' + short(c.flabel(fa)).toLowerCase() + ' here, so no matched effect can be drawn.', 20, T + 30); const nt0 = $('effnote'); if (nt0) nt0.textContent = ''; return; }
      let y0 = 0, y1 = 0; curves.forEach(q => q.m.concat(q.l, q.u).forEach(v => { if (isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); } })); const nn = axisTicks(y0, y1, 5), Y = v => T + PH - (v - nn.lo) / (nn.hi - nn.lo || 1) * PH, XX = d => L + d / 365 * PW;
      yAxis(g, nn, L, T, PW, PH, Y, (S.mode === 'cum' ? 'Difference in the running total' : 'Difference') + (Q.unit ? ' (' + Q.unit + ')' : '')); doyAxis(g, L, T, PW, PH);
      g.strokeStyle = '#999'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(L, Y(0) + .5); g.lineTo(L + PW, Y(0) + .5); g.stroke(); g.setLineDash([]);
      curves.forEach(q => { g.fillStyle = P().hexA ? P().hexA(q.col, 0.16) : q.col; g.globalAlpha = 1; g.beginPath(); let st = false; for (let i = 0; i < 366; i++) if (isFinite(q.u[i])) { g[st ? 'lineTo' : 'moveTo'](XX(i), Y(q.u[i])); st = true; } for (let i = 365; i >= 0; i--) if (isFinite(q.l[i])) g.lineTo(XX(i), Y(q.l[i])); g.closePath(); g.fill(); });
      curves.forEach(q => { g.strokeStyle = q.col; g.lineWidth = 2.2; g.beginPath(); let st = false; q.m.forEach((v, i) => { if (!isFinite(v)) { st = false; return; } g[st ? 'lineTo' : 'moveTo'](XX(i), Y(v)); st = true; }); g.stroke(); });
      frameBox(g, L, T, PW, PH); let lx = L, ly = T + PH + 38; g.font = '12px ' + FONT; g.fillStyle = INK; g.textAlign = 'left'; g.fillText(short(c.flabel(fb)) + ':', lx, ly); lx += g.measureText(short(c.flabel(fb)) + ':').width + 10; curves.forEach(q => { const t = lname(fb, q.b) + ' (' + q.n + ')'; g.fillStyle = q.col; g.fillRect(lx, ly - 8, 16, 3.5); g.fillStyle = INK; g.fillText(t, lx + 20, ly); lx += g.measureText(t).width + 40; });
      cv.onmousemove = e => { const b = cv.getBoundingClientRect(), k = parseFloat(cv.style.width) / (cv.clientWidth || 1), x = (e.clientX - b.left) * k; if (x < L || x > L + PW) { hideTip(); return; } const d = Math.round((x - L) / PW * 365); showTip(e, '<b>' + MON[MSTART.filter(m => m <= d).length - 1] + ' ' + (d - MSTART[MSTART.filter(m => m <= d).length - 1] + 1) + '</b> (day ' + d + ')<br>' + curves.map(q => '<span style="color:' + q.col + '">&#9632;</span> ' + esc(lname(fb, q.b)) + ': ' + num(q.m[d], 3)).join('<br>')); }; cv.onmouseleave = hideTip;
      const nt = $('effnote'); if (nt) nt.textContent = 'For each value of ' + short(c.flabel(fb)).toLowerCase() + ' (a line): ' + qname + ' of the runs at ' + short(c.flabel(fa)).toLowerCase() + ' ' + lname(fa, hi) + ' minus the run that differs only in having ' + lname(fa, lo) + ' (matched pairs, all other factors equal); line: mean of the pairs, band: 10 to 90 % of them. Lines that part show that the effect of ' + short(c.flabel(fa)).toLowerCase() + ' depends on ' + short(c.flabel(fb)).toLowerCase() + ' and on which days.';
      cv._csv = () => { const o = [['day of the year'].concat(curves.map(q => lname(fb, q.b)))]; for (let i = 0; i < 366; i++) o.push([i].concat(curves.map(q => q.m[i]))); return o; };
    }

    // ---- 4 every run through the year, coloured by the final result ----
    function drawRace() {
      const cv = $('race'); if (!cv || !Q) return; const R = runs.map(r => ({ r, s: prep(seriesOf(r)), v: rr(r), ref: !!(rowOf(r) || {}).reference })).filter(q => q.s && isFinite(q.v));
      if (!R.length) { const F0 = frameOf(cv, {}, 80); F0.g.fillStyle = '#666'; F0.g.font = '13px ' + FONT; F0.g.fillText('No daily values of this quantity.', 20, 50); return; }
      const F = frameOf(cv, { title: yTitle() + ': every run, coloured by ' + rname.toLowerCase() }, 400), { g, w, h } = F; const T = F.top + 14, L = 70, R_ = 90, PW = w - L - R_, PH = h - T - 46;
      let y0 = Infinity, y1 = -Infinity; R.forEach(q => q.s.forEach(v => { if (isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); } })); const nn = axisTicks(Math.min(0, y0), y1, 5), Y = v => T + PH - (v - nn.lo) / (nn.hi - nn.lo || 1) * PH, XX = d => L + d / 365 * PW;
      const vmin = Math.min.apply(null, R.map(q => q.v)), vmax = Math.max.apply(null, R.map(q => q.v)), col = v => ramp(vmax > vmin ? (v - vmin) / (vmax - vmin) : .5);
      yAxis(g, nn, L, T, PW, PH, Y, yTitle()); doyAxis(g, L, T, PW, PH);
      const ord = R.slice().sort((a, b) => a.v - b.v); cv._lines = ord;
      ord.forEach(q => { g.strokeStyle = col(q.v); g.globalAlpha = R.length > 30 ? .55 : .85; g.lineWidth = q.ref ? 2.6 : 1.4; if (q.ref) g.setLineDash([6, 3]); g.beginPath(); let st = false; q.s.forEach((v, i) => { if (!isFinite(v)) { st = false; return; } g[st ? 'lineTo' : 'moveTo'](XX(i), Y(v)); st = true; }); g.stroke(); g.setLineDash([]); }); g.globalAlpha = 1;
      const lab = (q, t, dy) => { let last = 365; for (; last > 0 && !isFinite(q.s[last]); last--); g.fillStyle = '#111'; g.font = 'bold 11.5px ' + FONT; g.textAlign = 'right'; g.fillText(t, XX(last) - 6, Y(q.s[last]) + (dy || 0)); g.strokeStyle = '#111'; g.lineWidth = 2.2; g.beginPath(); let st = false; q.s.forEach((v, i) => { if (!isFinite(v)) { st = false; return; } g[st ? 'lineTo' : 'moveTo'](XX(i), Y(v)); st = true; }); g.globalAlpha = .9; g.stroke(); g.globalAlpha = 1; };
      lab(ord[ord.length - 1], 'highest', -10); lab(ord[0], 'lowest', 16);
      frameBox(g, L, T, PW, PH); const bx = L + PW + 36, by = T + 10, bh = PH - 20; for (let k = 0; k < bh; k++) { g.fillStyle = ramp(1 - k / bh); g.fillRect(bx, by + k, 12, 1.5); } g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(num(vmax, 3), bx + 16, by + 8); g.fillText(num(vmin, 3), bx + 16, by + bh); g.save(); g.translate(bx + 38, by + bh / 2); g.rotate(Math.PI / 2); g.textAlign = 'center'; g.fillText(rname + (runit ? ' (' + runit + ')' : ''), 0, 0); g.restore();
      cv.onmousemove = e => { const b = cv.getBoundingClientRect(), k = parseFloat(cv.style.width) / (cv.clientWidth || 1), x = (e.clientX - b.left) * k, y = (e.clientY - b.top) * k; if (x < L || x > L + PW) { hideTip(); return; } const d = Math.max(0, Math.min(365, Math.round((x - L) / PW * 365))); let best = null; cv._lines.forEach(q => { const v = q.s[d]; if (!isFinite(v)) return; const dd = Math.abs(Y(v) - y); if (dd < 10 && (!best || dd < best.dd)) best = { dd, q, v }; }); if (best) showTip(e, '<b>' + esc(best.q.r.label || best.q.r.id) + '</b><br>' + esc(qname) + ' on day ' + d + ': ' + num(best.v, 4) + '<br>' + esc(rname) + ': ' + num(best.q.v, 4) + ' ' + esc(runit)); else hideTip(); }; cv.onmouseleave = hideTip;
      const nt = $('racenote'); if (nt) nt.textContent = (S.mode === 'cum' ? 'The running total' : 'The value') + ' of ' + qname + ' day by day, one line for each of the ' + R.length + ' runs (mean of the seasons of the run), coloured by ' + rname.toLowerCase() + ' at the end of the run: from dark purple (lowest) to yellow (highest). The two black lines are the lowest and the highest run. Where the colours part, the runs part.' + (R.some(q => q.ref) ? ' Dashed: the reference run.' : '');
      cv._csv = () => { const o = [['day of the year'].concat(R.map(q => q.r.id))]; for (let i = 0; i < 366; i++) o.push([i].concat(R.map(q => q.s[i]))); return o; };
    }

    // ---- 5 runs against days ----
    function drawStrip() {
      const cv = $('strip'); if (!cv || !Q) return; let R = runs.map(r => ({ r, s: prep(seriesOf(r)), v: rr(r), ref: !!(rowOf(r) || {}).reference })).filter(q => q.s && isFinite(q.v)).sort((a, b) => b.v - a.v);
      if (!R.length) { const F0 = frameOf(cv, {}, 80); F0.g.fillStyle = '#666'; F0.g.font = '13px ' + FONT; F0.g.fillText('No daily values of this quantity.', 20, 50); return; }
      const MAXR = 70, thin = R.length > MAXR; if (thin) { const k = R.length / MAXR; R = Array.from({ length: MAXR }, (_, i) => R[Math.floor(i * k)]); }
      const rh = Math.max(7, Math.min(20, 520 / R.length)), F = frameOf(cv, { title: yTitle() + ': every run on every day' }, F_h(R.length, rh)), { g, w } = F; const T = F.top + 16, Lw = Math.min(300, w * .34), Rw = 130, PW = w - Lw - Rw - 70, PH = R.length * rh;
      const data = R.map(q => q.s); let lo = Infinity, hi = -Infinity; data.forEach(s => s.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } })); if (!(hi > lo)) hi = lo + 1;
      const px = PW / 366; data.forEach((s, j) => { for (let i = 0; i < 366; i++) { const v = s[i]; if (!isFinite(v)) continue; g.fillStyle = ramp((v - lo) / (hi - lo)); g.fillRect(Lw + i * px, T + j * rh, Math.ceil(px) + .5, rh - 0.6); } });
      g.font = Math.min(11.5, rh + 2) + 'px ' + FONT; g.textAlign = 'right'; R.forEach((q, j) => { const rw = rowOf(q.r), t = rw && X().shortLabel ? X().shortLabel(rw.val, rw.reference) : (q.r.label || q.r.id); g.fillStyle = q.ref ? NAVY : INK; g.fillText(t.length > 46 ? t.slice(0, 45) + '…' : t, Lw - 6, T + j * rh + rh / 2 + 4); });
      const vlo = Math.min.apply(null, R.map(q => q.v)), vhi = Math.max.apply(null, R.map(q => q.v)); R.forEach((q, j) => { const bw = (q.v - Math.min(0, vlo)) / ((vhi - Math.min(0, vlo)) || 1) * Rw; g.fillStyle = q.ref ? NAVY : '#8c9bb0'; g.fillRect(Lw + PW + 14, T + j * rh + 1, Math.max(1, bw), rh - 2); });
      g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(rname + (runit ? ' (' + runit + ')' : ''), Lw + PW + 14, T - 6);
      g.strokeStyle = GRID; g.fillStyle = '#444'; g.textAlign = 'center'; MSTART.forEach((d, i) => { const x = Lw + d * px; g.beginPath(); g.moveTo(x + .5, T + PH); g.lineTo(x + .5, T + PH + 4); g.strokeStyle = '#333'; g.stroke(); g.fillText(MON[i], x + 365 / 12 * px / 2, T + PH + 17); }); frameBox(g, Lw, T, PW, PH);
      const bx = Lw, by = T + PH + 30; for (let k = 0; k < PW; k++) { g.fillStyle = ramp(k / PW); g.fillRect(bx + k, by, 1.5, 9); } g.fillStyle = INK; g.textAlign = 'left'; g.fillText(num(lo, 3), bx, by + 22); g.textAlign = 'right'; g.fillText(num(hi, 3) + '  ' + (Q.unit || ''), bx + PW, by + 22);
      cv._geo = { Lw, T, rh, px, R }; cv.onmousemove = e => { const b = cv.getBoundingClientRect(), k = parseFloat(cv.style.width) / (cv.clientWidth || 1), x = (e.clientX - b.left) * k, y = (e.clientY - b.top) * k, j = Math.floor((y - T) / rh), d = Math.floor((x - Lw) / px); if (j < 0 || j >= R.length || d < 0 || d > 365) { hideTip(); return; } const v = R[j].s[d]; showTip(e, '<b>' + esc(R[j].r.label || R[j].r.id) + '</b><br>day ' + d + ' (' + MON[MSTART.filter(m => m <= d).length - 1] + '): ' + num(v, 4) + ' ' + esc(Q.unit) + '<br>' + esc(rname) + ': ' + num(R[j].v, 4) + ' ' + esc(runit)); }; cv.onmouseleave = hideTip;
      const nt = $('stripnote'); if (nt) nt.textContent = 'One row for each run' + (thin ? ' (every ' + (Math.round(runs.length / MAXR * 10) / 10) + 'th run of the ' + runs.length + ' ranked runs)' : '') + ', ranked from the highest to the lowest ' + rname.toLowerCase() + ' (bars on the right); one column for each day of the year, colour = ' + qname + (S.mode === 'cum' ? ' (running total)' : '') + '. Stripes that run across the rows show an effect that comes in the same days in many runs.';
      cv._csv = () => { const o = [['run', rname].concat(Array.from({ length: 366 }, (_, i) => 'day ' + i))]; R.forEach(q => o.push([q.r.label || q.r.id, q.v].concat(q.s))); return o; };
    }
    function F_h(n, rh) { return 16 + 40 + n * rh + 80; }

    const draws = { adv_ip: drawIP, adv_eff: drawEff, adv_race: drawRace, adv_strip: drawStrip }, all = () => { try { drawMap(); } catch (e) { console.warn('adv map', e); } Object.keys(draws).forEach(k => { if (card(k)) try { draws[k](); } catch (e) { console.warn(k, e); } }); };
    // figures are drawn as they come into view
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.target._go) { e.target._go(); io.unobserve(e.target); } }), { rootMargin: '500px' }) : null;
    const attach = (id, fn, name) => { const cd = card(id); if (!cd) return; cd._go = () => { try { fn(); } catch (e) { console.warn(id, e); } }; if (FK()) FK().attach(cd, { name: 'experiment-' + name, redraw: () => { try { fn(); } catch (e) { } } }); if (io) io.observe(cd); else cd._go(); };
    const mapCard = $('map') && $('map').closest('.dzpan'); if (mapCard) { mapCard.classList.add('dzfig'); mapCard.dataset.xf = 'adv_map'; mapCard._go = () => { try { drawMap(); } catch (e) { console.warn(e); } }; if (FK()) FK().attach(mapCard, { name: 'experiment-interaction-map', redraw: () => { try { drawMap(); } catch (e) { } } }); if (io) io.observe(mapCard); else mapCard._go(); }
    attach('adv_ip', drawIP, 'interaction-plot'); attach('adv_eff', drawEff, 'effect-through-the-year'); attach('adv_race', drawRace, 'runs-through-the-year'); attach('adv_strip', drawStrip, 'runs-against-days');
    const on = (k, fn) => { const e = $(k); if (e) e.onchange = fn; };
    on('a', e => { S.a = e.target.value; if (S.a === S.b) { S.b = multi.find(f => f !== S.a); $('b').value = S.b; } drawMap(); drawIP(); drawEff(); }); on('b', e => { S.b = e.target.value; if (S.a === S.b) { S.a = multi.find(f => f !== S.b); $('a').value = S.a; } drawMap(); drawIP(); drawEff(); });
    if ($('swap')) $('swap').onclick = () => { const t = S.a; S.a = S.b; S.b = t; $('a').value = S.a; $('b').value = S.b; drawMap(); drawIP(); drawEff(); };
    on('q', e => { S.q = e.target.value; mount(host, c); }); on('mode', e => { S.mode = e.target.value; mount(host, c); });
    return { redo: { adv_map: drawMap, adv_ip: drawIP, adv_eff: drawEff, adv_race: drawRace, adv_strip: drawStrip }, drawAll: () => host.querySelectorAll('.dzfig').forEach(cd => { if (cd._go) { cd._go(); cd._go = null; } }) };
  }
  return { mount, variance };
})();
