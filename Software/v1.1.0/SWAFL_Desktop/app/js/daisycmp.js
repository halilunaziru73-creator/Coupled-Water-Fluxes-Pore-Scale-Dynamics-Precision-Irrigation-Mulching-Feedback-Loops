/* Daisy workbench, Run comparison: two runs side by side, in plain words.
   1) Choose run A and run B (the logs of two runs, or a run and measurements). The rows are matched by date (by row when there are no dates).
   2) The verdict says at once whether the runs are identical, differ only below the smallest meaningful level (SML) of Daisy's test suite,
      or differ; the table gives every quantity: its SML, the means of A and B, the mean difference (B - A, and in % of A), the root mean
      square difference, the largest difference and its date, the correlation r and the Nash-Sutcliffe efficiency of B against A.
   3) Click a quantity to draw its figures: A and B over time, the difference B - A with the SML band, and B against A with the 1:1 line.
   Double-blind comparison: the program hides which run is which (X and Y, drawn at random, sealed with a fingerprint shown at the start),
   shows the figures and the numbers under those letters only, and lets you record your judgement for each quantity before anything is
   revealed; when a measured log is given, the program also judges each quantity by the error against the measurements, without seeing the
   names either. Reveal then shows who was X and Y, your judgement, the program's, and how often they agree. */
'use strict';
(() => {
  const D = typeof DaisyUI !== 'undefined' ? DaisyUI : window.DaisyUI; if (!D) return; const IO = window.DaisyIO, P = () => window.DaisyPlot, FK = () => window.DaisyFigKit, esc = D.esc;
  const $ = id => document.getElementById('dzC' + id), fmt = (v, d) => P() ? P().fmt(v, d == null ? 3 : d) : String(v), dstr = t => new Date(t).toISOString().slice(0, 10);
  const TIMECOL = /^(year|month|mday|day|hour|minute|second|date|time)$/i;
  const st = { res: null, sel: null, blind: null };
  // rows of a and b at the same date (or the same row)
  function align(a, b) { const ia = [], ib = []; if (a.time && b.time) { const m = new Map(); b.time.forEach((t, i) => m.set(Math.round(t / 6e4), i)); a.time.forEach((t, i) => { const j = m.get(Math.round(t / 6e4)); if (j != null) { ia.push(i); ib.push(j); } }); } else { const n = Math.min(a.n, b.n); for (let i = 0; i < n; i++) { ia.push(i); ib.push(i); } } return { ia, ib, byDate: !!(a.time && b.time) }; }
  function metrics(x, y) { let n = 0, sx = 0, sy = 0; for (let i = 0; i < x.length; i++) if (isFinite(x[i]) && isFinite(y[i])) { n++; sx += x[i]; sy += y[i]; } if (!n) return null; const mx = sx / n, my = sy / n; let sxx = 0, syy = 0, sxy = 0, se = 0, mxd = 0, ai = -1;
    for (let i = 0; i < x.length; i++) if (isFinite(x[i]) && isFinite(y[i])) { const dx = x[i] - mx, dy = y[i] - my, e = y[i] - x[i]; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; se += e * e; if (Math.abs(e) > mxd) { mxd = Math.abs(e); ai = i; } }
    return { n, mA: mx, mB: my, bias: my - mx, pct: Math.abs(mx) > 1e-12 ? (my - mx) / Math.abs(mx) * 100 : NaN, rmse: Math.sqrt(se / n), maxd: mxd, ai, r: sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : (se === 0 ? 1 : NaN), nse: sxx > 0 ? 1 - se / sxx : (se === 0 ? 1 : NaN) }; }
  function compare(a, b, o) {
    const al = align(a, b), sml = IO.smlFor(a.header, a.units), rows = [], cols = a.cols.filter(c => !TIMECOL.test(c) && b.cols.indexOf(c) >= 0), onlyA = a.cols.filter(c => !TIMECOL.test(c) && b.cols.indexOf(c) < 0), onlyB = b.cols.filter(c => !TIMECOL.test(c) && a.cols.indexOf(c) < 0);
    cols.forEach(c => { const va = IO.col(a, c), vb = IO.col(b, c), x = al.ia.map(i => va[i]), y = al.ib.map(i => vb[i]), m = metrics(x, y); if (!m) return; const s = sml[c.replace(/\s*@.*$/, '')], lim = s != null ? s : o.precision;
      const verdict = m.maxd <= o.precision || (s != null && m.maxd < o.identThr * s) ? 'identical' : m.maxd <= lim ? 'similar' : 'different';
      rows.push(Object.assign({}, m, { c, unit: a.units[c] || '', sml: s != null ? s : null, verdict, at: m.ai >= 0 && m.maxd > 0 ? (al.byDate ? dstr(a.time[al.ia[m.ai]]) : 'row ' + al.ia[m.ai]) : '' })); });
    const hdr = []; const skip = new Set(['VERSION', 'RUN', 'SIMFILE', 'SIM', 'dlf-def-location', 'info', 'LOGFILE']); new Set(Object.keys(a.header).concat(Object.keys(b.header))).forEach(k => { if (!skip.has(k) && JSON.stringify(a.header[k]) !== JSON.stringify(b.header[k])) hdr.push(k + ': ' + (a.header[k] == null ? '-' : a.header[k]) + ' / ' + (b.header[k] == null ? '-' : b.header[k])); });
    const cnt = k => rows.filter(r => r.verdict === k).length;
    return { a, b, al, rows, onlyA, onlyB, hdr, nI: cnt('identical'), nS: cnt('similar'), nD: cnt('different') };
  }
  const CHIP = { identical: ['#1a7f37', 'identical'], similar: ['#2563a6', 'below the meaningful level'], different: ['#b3261e', 'different'] };
  const chip = v => '<span style="display:inline-block;padding:0 7px;border-radius:9px;font-size:11px;color:#fff;background:' + CHIP[v][0] + '">' + CHIP[v][1] + '</span>';
  function html() {
    return '<div class="dzhelp"><b>Compare two runs, in plain words.</b> 1) Choose run A and run B: the logs of two runs (for example two scenarios, or the same set-up before and after a change), or a run and a table of measurements. 2) Read the verdict and the table: every quantity of the two logs, matched date by date. 3) Click a quantity to see its figures. The <i>smallest meaningful level</i> (SML) is the difference below which Daisy\'s own test suite counts two values as the same. Use the double-blind comparison below to judge two runs without knowing which is which.</div>' +
      '<div class="dzrow"><label>Run A</label>' + D.logSel('CA') + '<button class="btn" id="dzCSwap" title="Swap A and B">&#8646;</button><label>Run B</label>' + D.logSel('CB') + '<button class="btn pri" id="dzCRun">Compare</button><button class="btn" id="dzCBat">Compare same-named logs of two folders</button><span id="dzCst" class="pnote"></span></div>' +
      '<details class="pnote"><summary>Tolerances</summary><div class="dzrow"><label>Equal below (absolute, for quantities without an SML)</label><input id="dzCPr" value="1e-8" size="7"><label>Identical below this share of the SML</label><input id="dzCId" value="0.001" size="6"></div></details>' +
      '<div id="dzCout"></div><h3 style="margin:16px 0 4px">Double-blind comparison</h3><div id="dzCbl"></div>';
  }
  const opt = () => ({ precision: parseFloat(($('Pr') || {}).value) || 1e-8, identThr: parseFloat(($('Id') || {}).value) || 0.001 });
  function verdictHtml(R, na, nb) {
    const tot = R.rows.length, kind = R.nD ? 'different' : R.nS ? 'similar' : 'identical', col = CHIP[kind][0];
    const big = R.rows.filter(r => r.verdict === 'different').sort((p, q) => (isFinite(q.pct) ? Math.abs(q.pct) : 1e9) - (isFinite(p.pct) ? Math.abs(p.pct) : 1e9)).slice(0, 3);
    const say = kind === 'identical' ? 'The two runs give the same values for every quantity.' : kind === 'similar' ? 'The two runs differ only below the smallest meaningful level: for practical purposes they are the same.' : R.nD + ' of the ' + tot + ' quantities differ by more than the smallest meaningful level' + (big.length ? '; the largest relative differences are ' + big.map(r => r.c + ' (' + (isFinite(r.pct) ? (r.pct > 0 ? '+' : '') + r.pct.toFixed(1) + ' %' : 'mean ' + fmt(r.mA) + ' in A, ' + fmt(r.mB) + ' ' + r.unit + ' in B') + ')').join(', ') : '') + '.';
    return '<div style="border-left:6px solid ' + col + ';background:#fff;padding:8px 12px;margin:8px 0"><div style="font-size:15px;font-weight:700;color:' + col + '">' + (kind === 'identical' ? 'Identical' : kind === 'similar' ? 'The same within the meaningful level' : 'Different') + '</div><div>' + esc(say) + '</div>' +
      '<div class="pnote" style="margin-top:4px">A: ' + esc(na) + ' &nbsp; B: ' + esc(nb) + ' &middot; ' + R.al.ia.length + ' ' + (R.al.byDate ? 'dates in common' : 'rows (no dates, matched by row)') + ' &middot; ' + tot + ' quantities: ' + R.nI + ' identical, ' + R.nS + ' below the meaningful level, ' + R.nD + ' different</div>' +
      (R.onlyA.length || R.onlyB.length ? '<div class="pnote">Only in A: ' + esc(R.onlyA.join(', ') || 'none') + '. Only in B: ' + esc(R.onlyB.join(', ') || 'none') + '.</div>' : '') + (R.hdr.length ? '<details class="pnote"><summary>' + R.hdr.length + ' header entries differ</summary>' + R.hdr.map(esc).join('<br>') + '</details>' : '') + '</div>';
  }
  function table(R) {
    const rows = R.rows.slice().sort((p, q) => ({ different: 0, similar: 1, identical: 2 }[p.verdict] - { different: 0, similar: 1, identical: 2 }[q.verdict]) || (isFinite(q.pct) ? Math.abs(q.pct) : 1e9) - (isFinite(p.pct) ? Math.abs(p.pct) : 1e9));
    return '<div class="dzrow"><label>Show</label><select id="dzCfil"><option value="all">every quantity</option><option value="different">only the different ones</option></select><span class="pnote">Click a row to draw its figures. B - A: positive when B is larger.</span></div><div style="overflow:auto;max-height:420px"><table class="dzt" style="font-size:12px"><tr><th>Quantity</th><th>Unit</th><th>Verdict</th><th>SML</th><th>Mean A</th><th>Mean B</th><th>B - A</th><th>B - A (%)</th><th>RMS difference</th><th>Largest difference (when)</th><th>r</th><th>NSE of B on A</th></tr>' +
      rows.map(r => '<tr data-c="' + esc(r.c) + '" data-v="' + r.verdict + '" style="cursor:pointer' + (st.sel === r.c ? ';background:#fff4c2' : '') + '"><td><b>' + esc(r.c) + '</b></td><td>' + esc(r.unit) + '</td><td>' + chip(r.verdict) + '</td><td>' + (r.sml != null ? fmt(r.sml) : '-') + '</td><td>' + fmt(r.mA) + '</td><td>' + fmt(r.mB) + '</td><td>' + fmt(r.bias) + '</td><td>' + (isFinite(r.pct) ? r.pct.toFixed(2) : '-') + '</td><td>' + fmt(r.rmse) + '</td><td>' + fmt(r.maxd) + (r.at ? ' (' + r.at + ')' : '') + '</td><td>' + (isFinite(r.r) ? r.r.toFixed(4) : '-') + '</td><td>' + (isFinite(r.nse) ? r.nse.toFixed(4) : '-') + '</td></tr>').join('') + '</table></div>';
  }
  // the three figures of one quantity: A and B, the difference with the SML band, B against A
  function figures(host, R, c, la, lb, title) {
    host.innerHTML = ''; const a = R.a, b = R.b, al = R.al, va = IO.col(a, c), vb = IO.col(b, c), x = al.ia.map(i => al.byDate ? a.time[i] : i), ya = al.ia.map(i => va[i]), yb = al.ib.map(i => vb[i]), dif = ya.map((v, i) => yb[i] - v), row = R.rows.find(r => r.c === c) || {}, u = row.unit || '';
    const mk = (t, cap, fn) => { const el = document.createElement('div'); el.className = 'dzpan dzfig'; el.style.cssText = 'margin:8px 0;padding:8px 10px;background:#fff'; el.innerHTML = '<div class="dzrow"><b>' + esc(t) + '</b><span style="flex:1"></span></div><canvas style="display:block;width:100%"></canvas><div class="pnote">' + cap + '</div>'; host.appendChild(el); const cv = el.querySelector('canvas'), dr = () => fn(cv); dr(); if (FK()) FK().attach(el, { name: 'compare-' + c.replace(/\W+/g, '_') + '-' + host.children.length, redraw: dr }); };
    mk((title || c) + ': ' + la + ' and ' + lb, esc(la) + ' (blue) and ' + esc(lb) + ' (orange, dashed) at the same dates. Where the lines lie on top of each other the runs agree.', cv => P().line(cv, [{ name: la, x, y: ya, lw: 2.2 }, { name: lb, x, y: yb, dash: [6, 4], lw: 1.8 }], { title: c, time: al.byDate, xt: al.byDate ? 'Date' : 'Row', yt: u || 'model units', h: 290 }));
    const s = row.sml; mk('Difference ' + lb + ' - ' + la, 'Positive when ' + esc(lb) + ' is larger. ' + (s != null ? 'The shaded band is the smallest meaningful level (' + fmt(s) + ' ' + esc(u) + '): inside it the difference does not matter.' : 'This quantity has no smallest meaningful level in Daisy\'s test suite.') + ' RMS difference ' + fmt(row.rmse) + ', mean difference ' + fmt(row.bias) + ' ' + esc(u) + '.',
      cv => P().line(cv, [{ name: lb + ' - ' + la, x, y: dif, color: '#7a3db8', lw: 1.6 }], { title: 'Difference of ' + c, time: al.byDate, xt: al.byDate ? 'Date' : 'Row', yt: u ? 'difference (' + u + ')' : 'difference', h: 250, hlines: [{ y: 0, color: '#444', dash: [] }], bands: s != null ? [{ x, lo: x.map(() => -s), hi: x.map(() => s), color: 'rgba(26,127,55,0.16)' }] : [] }));
    let lo = Infinity, hi = -Infinity; ya.concat(yb).forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    mk(lb + ' against ' + la, 'Every date is one point; on the grey 1:1 line the two runs agree. r = ' + (isFinite(row.r) ? row.r.toFixed(4) : '-') + ', Nash-Sutcliffe efficiency of ' + esc(lb) + ' on ' + esc(la) + ' = ' + (isFinite(row.nse) ? row.nse.toFixed(4) : '-') + ' (1 is perfect agreement).',
      cv => P().line(cv, [{ name: '1:1', x: [lo, hi], y: [lo, hi], color: '#999', dash: [4, 3], lw: 1.2 }, { name: 'dates', x: ya, y: yb, pts: true, line: false, r: 2, color: '#0072B2' }], { title: lb + ' against ' + la + ': ' + c, xt: la + (u ? ' (' + u + ')' : ''), yt: lb + (u ? ' (' + u + ')' : ''), h: 330 }));
  }
  function render(R, na, nb) {
    const out = $('out'); st.res = R; out.innerHTML = verdictHtml(R, na, nb) + (R.rows.length ? table(R) : '<div class="warnbox">The two logs have no quantity in common.</div>') + '<div id="dzCfig"></div>';
    const fil = $('fil'); const wire = () => { out.querySelectorAll('tr[data-c]').forEach(tr => { tr.style.display = fil && fil.value === 'different' && tr.dataset.v !== 'different' ? 'none' : ''; tr.onclick = () => { st.sel = tr.dataset.c; out.querySelectorAll('tr[data-c]').forEach(t => t.style.background = t === tr ? '#fff4c2' : ''); figures($('fig'), R, st.sel, 'A', 'B'); $('fig').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }; }); };
    if (fil) fil.onchange = wire; wire();
    const first = (R.rows.find(r => r.c === st.sel) || R.rows.find(r => r.verdict === 'different') || R.rows[0]); if (first) { st.sel = first.c; figures($('fig'), R, first.c, 'A', 'B'); out.querySelectorAll('tr[data-c]').forEach(t => t.style.background = t.dataset.c === first.c ? '#fff4c2' : ''); }
  }
  // ---------------------------------------------------------------- double-blind
  async function seal(s) { try { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(h)).slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join(''); } catch (e) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h.toString(16); } }
  function blindHtml() {
    const ns = D.names();
    return '<div class="dzhelp"><b>Judge two runs without knowing which is which.</b> 1) Choose the two runs and, if you have them, the measurements to judge against. 2) Press <i>Start</i>: the program puts the runs behind the letters X and Y at random and shows a fingerprint of the hidden key, so it cannot be changed later. Neither the figures nor the numbers show the names, and the quantities come in a random order. 3) For each quantity, record which run you judge better (or no difference). With measurements, the program judges too, by the error against them, also without the names. 4) Press <i>Reveal</i> to see who was X and Y, the two judgements and how often they agree.</div>' +
      '<div class="dzrow"><label>Run 1</label>' + D.logSel('CB1') + '<label>Run 2</label>' + D.logSel('CB2') + '<label>Measured (optional)</label><select id="dzCBm"><option value="">none</option>' + ns.map(n => '<option>' + esc(n) + '</option>').join('') + '</select><button class="btn pri" id="dzCBgo">Start</button></div><div id="dzCBout"></div>';
  }
  async function blindStart() {
    const n1 = $('B1').value, n2 = $('B2').value, nm = $('Bm').value; if (!n1 || !n2 || n1 === n2) { D.note('Cst', 'Choose two different runs for the blind comparison.', 1); return; }
    const flip = crypto.getRandomValues(new Uint8Array(1))[0] & 1, salt = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16)).join(''), X = flip ? n2 : n1, Y = flip ? n1 : n2;
    const R = compare(D.S.logs[X], D.S.logs[Y], opt()); const order = R.rows.map(r => r.c).filter(c => R.rows.find(r => r.c === c).verdict !== 'identical'); for (let i = order.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [order[i], order[j]] = [order[j], order[i]]; }
    let obs = null; if (nm) { const M = D.S.logs[nm]; obs = {}; order.forEach(c => { if (M.cols.indexOf(c) < 0) return; const ax = align(M, D.S.logs[X]), ay = align(M, D.S.logs[Y]), vm = IO.col(M, c), ex = metrics(ax.ia.map(i => vm[i]), ax.ib.map(i => IO.col(D.S.logs[X], c)[i])), ey = metrics(ay.ia.map(i => vm[i]), ay.ib.map(i => IO.col(D.S.logs[Y], c)[i])); if (ex && ey) obs[c] = { x: ex.rmse, y: ey.rmse, n: ex.n }; }); }
    st.blind = { X, Y, key: 'X=' + X + ';Y=' + Y + ';salt=' + salt, fp: await seal('X=' + X + ';Y=' + Y + ';salt=' + salt), R, order, obs, judge: {}, k: 0, revealed: false };
    blindRender();
  }
  function blindRender() {
    const B = st.blind, out = $('Bout'); if (!B) return; const done = Object.keys(B.judge).length;
    if (!B.order.length) { out.innerHTML = '<div class="okbox" style="padding:6px 10px">Every quantity is identical in the two runs: there is nothing to judge.</div>'; return; }
    const c = B.order[B.k], ob = B.obs && B.obs[c];
    out.innerHTML = '<div class="dzpan" style="background:#fff;padding:8px 10px"><div class="dzrow"><b>Sealed key, fingerprint ' + B.fp + '</b><span class="pnote">The names behind X and Y are hidden; this fingerprint of the key is shown again when they are revealed.</span></div>' +
      '<div class="dzrow"><button class="btn" id="dzCBprev"' + (B.k ? '' : ' disabled') + '>&#9664;</button><b>Quantity ' + (B.k + 1) + ' of ' + B.order.length + ': ' + esc(c) + '</b><button class="btn" id="dzCBnext"' + (B.k < B.order.length - 1 ? '' : ' disabled') + '>&#9654;</button><span class="pnote">' + done + ' judged</span></div>' +
      (ob ? '<div class="pnote">Against the measurements (' + ob.n + ' dates): RMS error of X ' + fmt(ob.x) + ', of Y ' + fmt(ob.y) + '.</div>' : '') +
      '<div class="dzrow"><label>My judgement for ' + esc(c) + '</label>' + [['X', 'X is better'], ['Y', 'Y is better'], ['=', 'no real difference']].map(q => '<button class="btn' + (B.judge[c] === q[0] ? ' pri' : '') + '" data-j="' + q[0] + '">' + q[1] + '</button>').join('') + '<span style="flex:1"></span><button class="btn pri" id="dzCBrev"' + (done ? '' : ' disabled') + '>Reveal</button></div><div id="dzCBfig"></div><div id="dzCBres"></div></div>';
    figures($('Bfig'), B.R, c, 'X', 'Y', c);
    out.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { B.judge[c] = b.dataset.j; if (B.k < B.order.length - 1) B.k++; blindRender(); });
    $('Bprev').onclick = () => { B.k--; blindRender(); }; $('Bnext').onclick = () => { B.k++; blindRender(); }; $('Brev').onclick = blindReveal;
    if (B.revealed) blindReveal();
  }
  async function blindReveal() {
    const B = st.blind; B.revealed = true; const ok = (await seal(B.key)) === B.fp, name = j => j === 'X' ? B.X : j === 'Y' ? B.Y : 'no difference';
    const prog = c => { const ob = B.obs && B.obs[c]; if (!ob) return null; const tol = 0.02 * Math.max(ob.x, ob.y); return Math.abs(ob.x - ob.y) <= tol ? '=' : ob.x < ob.y ? 'X' : 'Y'; };
    let agree = 0, both = 0; const rows = B.order.filter(c => B.judge[c]).map(c => { const p = prog(c); if (p) { both++; if (p === B.judge[c]) agree++; } return '<tr><td>' + esc(c) + '</td><td>' + esc(name(B.judge[c])) + '</td><td>' + (p ? esc(name(p)) : '-') + '</td><td>' + (p ? (p === B.judge[c] ? 'agree' : 'disagree') : '') + '</td></tr>'; });
    const cnt = { X: 0, Y: 0, '=': 0 }; Object.values(B.judge).forEach(j => cnt[j]++);
    $('Bres').innerHTML = '<div style="border-left:6px solid #154378;padding:6px 10px;margin-top:8px;background:#f4f7fb"><b>Revealed.</b> X was <b>' + esc(B.X) + '</b>, Y was <b>' + esc(B.Y) + '</b>. Key fingerprint ' + B.fp + (ok ? ' (checked: the key was not changed)' : ' (does NOT match)') + '.<br>You judged ' + Object.keys(B.judge).length + ' quantities: ' + esc(B.X) + ' better ' + cnt.X + ', ' + esc(B.Y) + ' better ' + cnt.Y + ', no real difference ' + cnt['='] + '.' + (both ? ' The program judged ' + both + ' of them by the error against the measurements; you agree on ' + agree + ' (' + Math.round(agree / both * 100) + ' %).' : '') +
      '<table class="dzt" style="font-size:12px;margin-top:6px"><tr><th>Quantity</th><th>Your judgement</th><th>Program (against measurements)</th><th></th></tr>' + rows.join('') + '</table><button class="btn" id="dzCBcsv">Save the judgements (CSV)</button></div>';
    $('Bcsv').onclick = () => D.download('blind-comparison.csv', 'quantity,your_judgement,program_judgement,X,Y,fingerprint\n' + B.order.filter(c => B.judge[c]).map(c => [c, name(B.judge[c]), prog(c) ? name(prog(c)) : '', B.X, B.Y, B.fp].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv');
  }
  function bind() {
    const ns = D.names(); if (ns.length > 1 && $('A').value === $('B').value) $('B').value = ns[1];
    const run = () => { const na = $('A').value, nb = $('B').value, a = D.S.logs[na], b = D.S.logs[nb]; if (!a || !b) { $('out').innerHTML = '<div class="pnote" style="margin:8px 0">Load two logs first: in <i>Log plots</i> use the output of your runs, or add files there. Then choose them as A and B.</div>'; return; } try { render(compare(a, b, opt()), na, nb); D.note('Cst', na === nb ? 'A and B are the same log: choose another one as B.' : ''); } catch (e) { D.note('Cst', e.message, 1); } };
    $('Run').onclick = run; $('A').onchange = run; $('B').onchange = run; $('Swap').onclick = () => { const t = $('A').value; $('A').value = $('B').value; $('B').value = t; run(); };
    $('Bat').onclick = () => { const by = {}; ns.forEach(k => { const b = k.replace(/.*\//, ''), f = k.indexOf('/') > 0 ? k.split('/')[0] : ''; (by[b] = by[b] || []).push({ k, f }); }); let h = '<table class="dzt" style="font-size:12px"><tr><th>Log</th><th>A</th><th>B</th><th>Verdict</th><th>Identical / below SML / different</th></tr>', n = 0;
      Object.keys(by).forEach(b => { const g = by[b]; for (let i = 1; i < g.length; i++) if (g[0].f !== g[i].f) { n++; const R = compare(D.S.logs[g[0].k], D.S.logs[g[i].k], opt()), v = R.nD ? 'different' : R.nS ? 'similar' : 'identical'; h += '<tr><td>' + esc(b) + '</td><td>' + esc(g[0].f) + '</td><td>' + esc(g[i].f) + '</td><td>' + chip(v) + '</td><td>' + R.nI + ' / ' + R.nS + ' / ' + R.nD + '</td></tr>'; } });
      $('out').innerHTML = n ? h + '</table>' : '<div class="pnote">Load two folders that hold logs with the same names (Log plots, Add a folder).</div>'; D.note('Cst', n + ' pair(s) compared.'); };
    $('bl').innerHTML = blindHtml(); if (ns.length > 1) $('B2').value = ns[1]; $('Bgo').onclick = () => blindStart().catch(e => D.note('Cst', e.message, 1)); if (st.blind && st.blind.order) blindRender();
    if (ns.length) run(); else if (D.loadBundled) D.loadBundled('daily-water-flux.dlf').then(() => { D.refreshSelects(); run(); }).catch(() => run());
  }
  D.register('compare', { html, bind });
  window.DaisyCmp = { compare, metrics, align };
})();
