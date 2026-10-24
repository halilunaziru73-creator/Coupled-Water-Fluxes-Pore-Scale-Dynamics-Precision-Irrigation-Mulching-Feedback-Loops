/* Dashboard: live results, design results (after Run simulation), charts (design charts in the design layers, 20 years
   elsewhere) and the message log. Every block has a header that collapses and expands it. */
'use strict';
const Dash = (() => {
  const body = document.getElementById('dashBody'), tabs = document.getElementById('dashTabs');
  let lastHtml = '';
  const setBody = h => { if (h !== lastHtml) { const st = body.scrollTop; body.innerHTML = h; body.scrollTop = st; lastHtml = h; } };
  let tab = 'results', baseline = null, chartTimer = null, chartKey = '';
  const shut = {};                                   // collapsed blocks, remembered while the program runs
  const RO = [   // key, label, colour class, which direction is "better" (+1 higher, -1 lower, 0 neutral)
    ['evap', 'Soil evaporation', '', -1], ['transp', 'Transpiration', 't1', 0], ['et', 'Evapotranspiration', 't1', 0], ['drain', 'Drainage', 't2', -1],
    ['irr', 'Irrigation', 't3', -1], ['yield', 'Yield', 't4', 1], ['ie', 'Irrigation efficiency', 't4', 1], ['nl', 'Nitrogen leaching', 't2', -1], ['rain', 'Rainfall', '', 0], ['baseIrr', 'Irrigation without mulch', 't3', 0]
  ];
  const num = t => { const m = String(t || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  const f1 = v => (v === undefined || v === null || isNaN(v)) ? '-' : (Math.abs(v) >= 100 ? Math.round(v) : (Math.round(v * 10) / 10)).toString();
  const K = (l, v, u, c) => '<div class="kpi ' + (c || '') + '"><div class="kl">' + l + '</div><div class="kv">' + v + (u ? '<span class="ku">' + u + '</span>' : '') + '</div></div>';
  // a block: header with a twist arrow (click to hide or show), and its content
  const SEC = (id, title, sub, inner) => '<div class="dsec' + (shut[id] ? ' shut' : '') + '" data-sec="' + id + '"><h4 data-tog="' + id + '"><b><span class="tw">' + (shut[id] ? '&#9654;' : '&#9660;') + '</span>' + title + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</h4><div class="dsb"' + (shut[id] ? ' hidden' : '') + '>' + inner + '</div></div>';

  const CB = (k, title, inner) => SEC('ch-' + k, title, '', '<div class="chart">' + inner + '</div>');
  let dayCache = { key: '', D: null };
  function results(s) {
    const key = s.date + '|' + JSON.stringify(s.state) + '|' + s.year;
    if (dayCache.key !== key) { dayCache = { key, D: E.day() }; }
    const D = dayCache.D, Y = D && D.year ? D.year : null;
    let h = '<div class="dwrap">';
    if (D) {
      h += SEC('day', 'On ' + UI.esc(D.date), 'mm per day', '<div class="kgrid">' +
        K('Crop', UI.esc(D.crop), '', 't4') + K('Root depth', f1(D.rd), 'cm', 't4') + K('Sensor / trigger', (D.f || 0).toFixed(2) + ' / ' + (D.fT || 0).toFixed(2), '', 't3') +
        K('Rain', f1(D.rain), 'mm') + K('Irrigation', f1(D.irr), 'mm', 't3') + K('Soil evaporation', f1(D.evap), 'mm', 't1') + K('Transpiration', f1(D.tr), 'mm', 't1') + K('Drainage', f1(D.dr), 'mm', 't2') + '</div>');
      h += SEC('next', 'Next ' + D.N + ' days', D.fc ? 'with the weather forecast' : 'simulated from the weather record', '<div class="kgrid">' +
        K('Rain', f1(D.next.rain), 'mm') + K('Irrigation', f1(D.next.irr), 'mm', 't3') + K('Soil evaporation', f1(D.next.evap), 'mm', 't1') + K('Transpiration', f1(D.next.tr), 'mm', 't1') + K('Drainage', f1(D.next.dr), 'mm', 't2') + '</div>');
      if (Y && Y.y) h += SEC('year', 'Whole year ' + Y.y, UI.esc(Y.crop || ''), '<div class="kgrid">' +
        K('Rain', f1(Y.rain), 'mm') + K('Irrigation', f1(Y.irr), 'mm', 't3') + K('Other evaporation', f1(Y.int), 'mm') + K('Soil evaporation', f1(Y.evap), 'mm', 't1') + K('Transpiration', f1(Y.tr), 'mm', 't1') + K('Drainage', f1(Y.dr), 'mm', 't2') + K('Storage change', f1(Y.store), 'mm') + K('Deepest roots', f1(Y.rd), 'cm', 't4') + '</div>');
    }
    let g = '<div class="kgrid">';
    RO.forEach(r => {
      const v = s.ro[r[0]], n = num(v); let dd = '';
      if (baseline && !isNaN(n) && !isNaN(num(baseline[r[0]]))) {
        const diff = n - num(baseline[r[0]]), cls = Math.abs(diff) < 1e-9 ? 'eq' : (r[3] === 0 ? 'eq' : ((diff > 0) === (r[3] > 0) ? 'up' : 'dn'));
        dd = '<div class="kd ' + cls + '">' + (diff > 0 ? '&#9650; +' : diff < 0 ? '&#9660; ' : '= ') + (Math.abs(diff) < 1e-9 ? 'no change' : (Math.round(diff * 100) / 100)) + '</div>';
      }
      g += '<div class="kpi ' + r[2] + '"><div class="kl">' + r[1] + '</div><div class="kv">' + UI.esc(v || '...') + '</div>' + dd + '</div>';
    });
    h += SEC('avg', '20-year averages at these settings', baseline ? 'changes against the pinned baseline' : 'pin a baseline to compare', g + '</div>');
    setBody(h + '</div>');
  }

  const DL = {
    sid: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'pct'], ['cu', 'Distribution uniformity CU', 'num', '%'], ['tco', 'Cut-off time', 'num', 'min'], ['tst', 'Time to fill the root zone', 'num', 'min'], ['tL', 'Advance time', 'num', 'min'], ['Vapp', 'Applied volume', 'num', 'm³'], ['Vreq', 'Required volume', 'num', 'm³'], ['Vdp', 'Deep percolation volume', 'num', 'm³'], ['Vro', 'Runoff volume', 'num', 'm³']],
    drip: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['Eu', 'Emission uniformity', 'pct'], ['dp', 'Deep percolation', 'pct'], ['Pw', 'Wetted fraction', 'pct'], ['gross', 'Gross application', 'num', 'mm'], ['t', 'Irrigation time', 'num', 'h'], ['V', 'Applied volume per emitter', 'num', 'L'], ['Vreq', 'Required volume per emitter', 'num', 'L']],
    spr: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['DU', 'Distribution uniformity DU', 'pct'], ['CU', 'Christiansen uniformity CU', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'pct'], ['gross', 'Gross application', 'num', 'mm'], ['I', 'Net application', 'num', 'mm'], ['T', 'Set time', 'num', 'min'], ['Q', 'Sprinkler discharge', 'num', 'L/min'], ['AR', 'Application rate', 'num', 'mm/h']]
  };
  const runOn = id => !!E.ev("(window.DESIGN_RUN&&DESIGN_RUN['" + id + "']&&DESIGN_RUN['" + id + "'].on)?1:0");
  const runBtns = id => '<div class="drun"><button class="btn prim" data-run="' + id + '">&#9654; Run simulation</button><button class="btn" data-best="' + id + '">Find the most efficient inputs</button><button class="btn" data-farm="' + id + '">&#9654; Virtual farm simulation</button></div>';
  function design(s) {
    const id = s.scene;
    if (!DL[id]) { setBody('<div class="dnote">The Design tab shows efficiencies, uniformity, times and volumes of the irrigation system you are designing. Open <b>Surface irrigation design</b>, <b>Drip irrigation design</b> or <b>Sprinkler design and pipes</b> in the Layers panel.</div>'); return; }
    if (!runOn(id)) { setBody(SEC('dr-' + id, UI.esc(Layers.nameOf(id)), 'waiting for a run', '<div class="dnote">Set the inputs in the drawing (click a value box to type the exact value, with its unit), then press <b>Run simulation</b>. The results appear here after the run.</div>' + runBtns(id))); return; }
    const R = E.design(id); if (!R) return;
    let h = '<div class="kgrid">';
    DL[id].forEach((r, i) => {
      if (R[r[0]] === undefined) return;
      const v = R[r[0]], txt = r[2] === 'pct' ? (v * 100).toFixed(1) + ' %' : (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)) + (r[3] ? ' ' + r[3] : '');
      h += '<div class="kpi ' + ['', 't1', 't2', 't3', 't4'][i % 5] + '"><div class="kl">' + r[1] + '</div><div class="kv">' + txt + '</div></div>';
    });
    h += '</div>';
    if (id === 'sid') { const w = E.json("(function(){var R=sidRun();return {reach:!!R.reach,tco:R.tco,tL:R.tL,L:R.P.L}})()"); if (w && (!w.reach || w.tco > 2880)) h += '<div class="warnbox"><b>The stream does not reach the end of the field in a practical time</b> (advance ' + Math.round(w.tL) + ' min for ' + Math.round(w.L) + ' m). Shorten the run, raise the inflow, or choose drip or sprinklers: this soil takes the water in too fast for this surface layout.</div>'; }
    let best = ''; const B = bestCache[id];
    if (B) best = '<div class="best"><div><b>' + (B.same ? 'Already the most efficient:' : 'Most efficient inputs found:') + '</b> ' + UI.esc(B.txt) + '</div><div>Application efficiency ' + (B.Ea * 100).toFixed(1) + ' %, root zone filled ' + (B.Es * 100).toFixed(0) + ' %' + (B.dp != null ? ', deep percolation ' + (B.dp * 100).toFixed(1) + ' %' : '') + (B.ro != null ? ', runoff ' + (B.ro * 100).toFixed(1) + ' %' : '') + '</div>' + (B.same ? '' : '<button class="btn prim" data-apply="' + id + '">Apply these inputs and run</button>') + '</div>';
    else best = '<div class="best"><button class="btn" data-best="' + id + '">Find the most efficient inputs</button></div>';
    setBody('<div class="dwrap">' + SEC('dr-' + id, UI.esc(Layers.nameOf(id)), 'results of the last run', h) + SEC('db-' + id, 'Best combination for the highest efficiency', 'searched over the inputs that matter most', best) + SEC('dx-' + id, 'Run again', '', runBtns(id)) + '</div>');
  }
  const bestCache = {};

  // ------------------------------------------------------------------ charts
  function xyChart(cv, o) {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
    const L = 46, R = 10, T = 22, B = 30, xs = o.x, all = o.series.flatMap(s => s.y.filter(v => isFinite(v)));
    let ymx = o.ymax != null ? o.ymax : Math.max(...all, 1e-9) * 1.08, ymn = o.ymin != null ? o.ymin : Math.min(0, ...all);
    if (o.invert) [ymn, ymx] = [ymx, ymn];
    const xmn = Math.min(...xs), xmx = Math.max(...xs), X = v => L + (w - L - R) * (v - xmn) / ((xmx - xmn) || 1), Y = v => T + (h - T - B) * (1 - (v - ymn) / ((ymx - ymn) || 1));
    c.font = '10px Tahoma,Arial'; c.strokeStyle = '#E0E0E0'; c.fillStyle = '#404040'; c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const v = ymn + (ymx - ymn) * i / 4, y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke(); c.textAlign = 'right'; c.fillText(Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1), L - 4, y + 3); }
    c.textAlign = 'center'; for (let i = 0; i <= 5; i++) { const v = xmn + (xmx - xmn) * i / 5; c.fillText(Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1), X(v), h - B + 13); }
    c.fillText(o.xl || '', L + (w - L - R) / 2, h - 4); c.save(); c.translate(10, T + (h - T - B) / 2); c.rotate(-Math.PI / 2); c.fillText(o.yl || '', 0, 0); c.restore();
    c.strokeStyle = '#808080'; c.strokeRect(L, T, w - L - R, h - T - B);
    c.save(); c.beginPath(); c.rect(L, T, w - L - R, h - T - B); c.clip();
    o.series.forEach(s => {
      c.strokeStyle = s.c; c.lineWidth = s.w || 2; c.setLineDash(s.dash || []);
      if (s.fill) { c.fillStyle = s.fill; c.beginPath(); xs.forEach((x, i) => { const yy = Y(s.y[i]); i ? c.lineTo(X(x), yy) : c.moveTo(X(x), yy); }); c.lineTo(X(xs[xs.length - 1]), Y(Math.max(ymn, 0))); c.lineTo(X(xs[0]), Y(Math.max(ymn, 0))); c.closePath(); c.fill(); }
      c.beginPath(); xs.forEach((x, i) => { const yy = Y(s.y[i]); i ? c.lineTo(X(x), yy) : c.moveTo(X(x), yy); }); c.stroke(); c.setLineDash([]);
    });
    c.restore();
    (o.marks || []).forEach(m => { c.strokeStyle = m.c || '#C00000'; c.setLineDash([4, 3]); c.lineWidth = 1.2; c.beginPath(); if (m.x != null) { c.moveTo(X(m.x), T); c.lineTo(X(m.x), h - B); } else { c.moveTo(L, Y(m.y)); c.lineTo(w - R, Y(m.y)); } c.stroke(); c.setLineDash([]); c.fillStyle = m.c || '#C00000'; { const tw = c.measureText(m.t).width, right = m.x != null && X(m.x) + 3 + tw > w - R; const tx = m.x != null ? (right ? X(m.x) - 3 - tw : X(m.x) + 3) : w - R - 4 - tw, ty = m.x != null ? T + 11 + (o.marks.indexOf(m) % 2) * 12 : Y(m.y) - 4; c.fillStyle = 'rgba(255,255,255,0.88)'; c.fillRect(tx - 2, ty - 10, tw + 4, 13); c.fillStyle = m.c || '#C00000'; c.textAlign = 'left'; c.fillText(m.t, tx, ty); } });
    // legend
    let lx = L + 4; c.textAlign = 'left'; o.series.forEach(s => { if (!s.n) return; c.fillStyle = s.c; c.fillRect(lx, 8, 12, 3); c.fillStyle = '#000'; c.fillText(s.n, lx + 16, 13); lx += 22 + c.measureText(s.n).width; });
  }
  function fateBar(F) {
    const tot = F.reduce((a, q) => a + Math.max(0, q[1] || 0), 0) || 1, col = ['#2E8B57', '#3A5FCD', '#C77D1A', '#7FAFD0'];
    return '<div class="fate"><div class="fbar">' + F.map((q, i) => '<span style="width:' + (100 * Math.max(0, q[1] || 0) / tot).toFixed(2) + '%;background:' + col[i] + '" title="' + q[0] + '"></span>').join('') + '</div>' +
      F.map((q, i) => '<div class="fl"><i style="background:' + col[i] + '"></i>' + q[0] + ': <b>' + ((q[1] || 0) * 100).toFixed(1) + ' %</b></div>').join('') + '</div>';
  }
  function timeBars(cv, tt, u) {
    if (!cv) return; const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, hh = cv.clientHeight; if (!w || !hh) return; cv.width = w * dpr; cv.height = hh * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr); c.fillStyle = '#fff'; c.fillRect(0, 0, w, hh);
    const mx = Math.max(...tt.map(q => q[1]), 1e-9), bh = (hh - 20) / tt.length; c.font = '10.5px Tahoma,Arial'; c.textBaseline = 'alphabetic'; let lw = 0; tt.forEach(q => { lw = Math.max(lw, c.measureText(q[0]).width); }); const x0 = Math.min(lw + 12, w * 0.45);
    tt.forEach((q, i) => { const y = 10 + i * bh; c.fillStyle = '#000'; c.textAlign = 'left'; c.fillText(q[0], 4, y + bh / 2 + 3); const bw = Math.max(1, (w - x0 - 70) * q[1] / mx); c.fillStyle = ['#1F5FA8', '#2E8B57', '#C00000', '#7A5AA8', '#404040'][i % 5]; c.fillRect(x0, y + 3, bw, bh - 7); c.fillStyle = '#000'; c.fillText((q[1] >= 100 ? q[1].toFixed(0) : q[1].toFixed(1)) + ' ' + u, x0 + bw + 4, y + bh / 2 + 3); });
  }
  function hydZ(D) {
    const a = document.getElementById('dch'), b = document.getElementById('dct'); if (!D.ht || !D.ht.length) { if (a) a.parentNode.innerHTML = '<div class="dnote">Not available for this design.</div>'; return; }
    if (a) xyChart(a, { x: D.ht, xl: 'time from the start of the irrigation (h)', yl: 'L/s', series: [{ y: D.hq, c: '#1F5FA8', n: 'flow at the pump', w: 2.2, fill: 'rgba(31,95,168,0.15)' }], ymin: 0, ymax: D.Qz * 1.25 });
    if (b) timeBars(b, D.times, 'h');
  }
  function designCharts(id) {
    if (!runOn(id)) { setBody(SEC('ch-' + id, 'Design charts', 'waiting for a run', '<div class="dnote">The hydrograph, the advance and recession times, the depth along the field and where the water goes are drawn after <b>Run simulation</b>.</div>' + runBtns(id))); return; }
    const D = E.json("designCharts('" + id + "')"); if (!D) return;
    let h = '<div class="dwrap"><div class="charts">';
    if (id === 'sid') {
      h += '' + CB('dc1', 'Hydrograph: inflow, infiltration and runoff (' + D.unitQ + ')', '<canvas id="dc1"></canvas>') + '' +
        '' + CB('dc2', 'Advance, cut-off and recession along the field', '<canvas id="dc2"></canvas>') + '' +
        '' + CB('dc3', 'Infiltrated depth along the field against the required depth', '<canvas id="dc3"></canvas>') + '' +
        '' + CB('dc4', 'Times of the irrigation (min)', '<canvas id="dc4"></canvas>') + '';
    } else if (id === 'drip') {
      h += CB('dh', 'Hydrograph at the pump: the zones run one after the other (L/s)', '<canvas id="dch"></canvas>') + CB('dt', 'Times of the irrigation (h)', '<canvas id="dct"></canvas>') + CB('dc1', 'Pressure head along the lateral', '<canvas id="dc1"></canvas>') + CB('dc2', 'Emitter flow along the lateral', '<canvas id="dc2"></canvas>');
    } else {
      h += CB('dh', 'Hydrograph at the pump: the sets run one after the other (L/s)', '<canvas id="dch"></canvas>') + CB('dt', 'Times of the irrigation (h)', '<canvas id="dct"></canvas>') + CB('dc1', 'Soil intake rate against the application rate', '<canvas id="dc1"></canvas>') + CB('dc2', 'Depth caught at each point, sorted (uniformity)', '<canvas id="dc2"></canvas>');
    }
    h += CB('fate', 'Where the water goes', fateBar(D.fate)) + '</div></div>';
    body.innerHTML = h; lastHtml = '';
    setTimeout(() => {
      const g = i => document.getElementById('dc' + i); if (!g(1)) return;
      if (id === 'sid') {
        xyChart(g(1), { x: D.t, xl: 'time (min)', yl: 'L/s', series: [{ y: D.qin, c: '#1F5FA8', n: 'inflow', w: 2.4 }, { y: D.inf, c: '#2E8B57', n: 'infiltration', fill: 'rgba(46,139,87,0.25)' }, { y: D.ro, c: '#C77D1A', n: 'runoff', fill: 'rgba(199,125,26,0.25)' }], marks: [{ x: D.tL, t: 'tL ' + D.tL.toFixed(0), c: '#1F5FA8' }, { x: D.tco, t: 'cut-off ' + D.tco.toFixed(0), c: '#C00000' }] });
        xyChart(g(2), { x: D.xs, xl: 'distance from the inlet (m)', yl: 'time (min)', series: [{ y: D.adv, c: '#1F5FA8', n: 'advance', w: 2.4 }, { y: D.rec, c: '#7A5AA8', n: 'recession', w: 2.4, dash: [6, 3] }], marks: [{ y: D.tco, t: 'cut-off ' + D.tco.toFixed(0) + ' min', c: '#C00000' }] });
        xyChart(g(3), { x: D.xs, xl: 'distance from the inlet (m)', yl: 'mm', series: [{ y: D.Z, c: '#2E8B57', n: 'infiltrated depth', fill: 'rgba(46,139,87,0.2)', w: 2.2 }], marks: [{ y: D.Zn, t: 'required ' + D.Zn.toFixed(0) + ' mm', c: '#C00000' }] });
        const tt = [['tL advance', D.tL], ['ts fill root zone', D.tst], ['tco cut-off', D.tco], ['tr recession', D.tr], ['total', D.tco + D.tr]];
        timeBars(g(4), tt, 'min'); 
      } else if (id === 'drip') {
        hydZ(D); if (D.h.length) xyChart(g(1), { x: D.x, xl: 'distance along the lateral (m)', yl: 'head (m)', series: [{ y: D.h, c: '#1F5FA8', n: 'pressure head', w: 2.2 }] }); else g(1).parentNode.innerHTML += '<div class="dnote">Pressure profile not available for this emitter.</div>';
        if (D.q.length) xyChart(g(2), { x: D.x, xl: 'distance along the lateral (m)', yl: 'L/h', series: [{ y: D.q, c: '#2E8B57', n: 'emitter flow', w: 2.2 }] }); else g(2).parentNode.innerHTML += '<div class="dnote">Emission uniformity ' + ((D.Eu || 0) * 100).toFixed(1) + ' %.</div>';
      } else {
        hydZ(D); xyChart(g(1), { x: D.t, xl: 'time since the start (min)', yl: 'mm/h', series: [{ y: D.intake, c: '#7A5A3A', n: 'soil intake rate', w: 2.2 }, { y: D.rate, c: '#1F5FA8', n: 'application rate', w: 2.2, dash: [6, 3] }], ymax: Math.max(D.rate[0] * 3, 5) });
        if (D.catchSorted.length) xyChart(g(2), { x: D.catchSorted.map((_, i) => 100 * i / (D.catchSorted.length - 1)), xl: 'share of the field (%)', yl: 'mm', series: [{ y: D.catchSorted, c: '#1F5FA8', n: 'depth caught', w: 2.2, fill: 'rgba(31,95,168,0.15)' }] });
        else g(2).parentNode.innerHTML += '<div class="dnote">Christiansen uniformity ' + ((D.CU || 0) * 100).toFixed(1) + ' %, distribution uniformity ' + ((D.DU || 0) * 100).toFixed(1) + ' %.</div>';
      }
    }, 30);
  }
  function lineChart(cv, series, o) {
    xyChart(cv, { x: series[0].v.map((_, i) => (o.cal0 || 0) + i), xl: 'year', yl: 'mm', series: series.map(s => ({ y: s.v, c: s.c, n: s.n, fill: o.bars ? s.c + '33' : null })) });
  }
  function charts() {
    const s = E.snap; if (s && DL[s.scene]) { designCharts(s.scene); return; }
    body.innerHTML = '<div class="dnote">Twenty years around the working date (calendar years on the horizontal axis, millimetres per year).</div><div class="charts">' + CB('c1', 'Rainfall and irrigation', '<canvas id="c1"></canvas>') + '' + CB('c2', 'Drainage below the root zone', '<canvas id="c2"></canvas>') + '' + CB('c3', 'Evaporation and transpiration', '<canvas id="c3"></canvas>') + '</div>'; lastHtml = '';
    clearTimeout(chartTimer); chartTimer = setTimeout(() => {
      const S = E.season(); if (!S || !document.getElementById('c1')) return;
      lineChart(document.getElementById('c1'), [{ v: S.yR, c: '#5AA0E1', n: 'Rain' }, { v: S.yI, c: '#C77D1A', n: 'Irrigation' }], { bars: true, zero: true, cal0: S.cal0 });
      lineChart(document.getElementById('c2'), [{ v: S.yD, c: '#7A5AA8', n: 'Drainage' }], { bars: true, zero: true, cal0: S.cal0 });
      lineChart(document.getElementById('c3'), [{ v: S.yE, c: '#00859B', n: 'Evaporation' }, { v: S.yT, c: '#2E7D4F', n: 'Transpiration' }], { zero: true, cal0: S.cal0 });
    }, 30);
  }
  function messages() {
    const L = UI.logs.slice().reverse(), row = l => '<div class="logline ' + (l.level === 'err' ? 'err' : l.level === 'warn' ? 'warn' : '') + '"><span class="tm">' + l.t + '</span>' + UI.esc(l.msg) + '</div>', wn = L.filter(l => l.level === 'err' || l.level === 'warn');
    body.innerHTML = (wn.length ? SEC('m-warn', 'Warnings', wn.length + ' message' + (wn.length > 1 ? 's' : ''), wn.map(row).join('')) : '') + SEC('m-all', 'All messages', L.length + ' message' + (L.length === 1 ? '' : 's'), L.map(row).join('') || '<div class="dnote">No messages yet.</div>'); lastHtml = '';
  }
  function render() {
    const s = E.snap; if (!s) return;
    if (tab === 'results') results(s); else if (tab === 'design') design(s); else if (tab === 'charts') { const k = s.scene + '|' + JSON.stringify(s.state) + '|' + s.date + '|' + (DL[s.scene] ? runOn(s.scene) + E.ev('JSON.stringify(window.DESIGN_RUN)') + E.ev("JSON.stringify(typeof sidRun==='function'?[sidRun().Ea,drRun().Ea,spRun().Ea]:0)") : ''); if (k !== chartKey) { chartKey = k; charts(); } } else messages();
  }
  function setTab(t) { tab = t; lastHtml = ''; chartKey = ''; tabs.querySelectorAll('button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === t)); render(); }
  tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) setTab(b.dataset.tab); else if (b.dataset.act === 'pinBaseline') pin(); else if (b.dataset.act === 'clearBaseline') clearPin();
  });
  body.addEventListener('click', e => {
    const tg = e.target.closest('[data-tog]'); if (tg) { const id = tg.dataset.tog; shut[id] = !shut[id]; lastHtml = ''; const sec = tg.parentNode; sec.classList.toggle('shut', !!shut[id]); const b = sec.querySelector('.dsb'); if (b) b.hidden = !!shut[id]; const tw = tg.querySelector('.tw'); if (tw) tw.innerHTML = shut[id] ? '&#9654;' : '&#9660;'; if (!shut[id] && /^ch-/.test(id)) { chartKey = ''; render(); } return; }
    const r = e.target.closest('[data-run]'); if (r) { E.ev("runDesign('" + r.dataset.run + "')"); E.poll(true); UI.log('Design run: ' + Layers.nameOf(r.dataset.run)); lastHtml = ''; chartKey = ''; setTimeout(render, 60); return; }
    const bb = e.target.closest('[data-best]'); if (bb) { const id = bb.dataset.best; UI.toast('Searching the inputs for the highest efficiency...'); setTimeout(() => { bestCache[id] = E.json("designBest('" + id + "')"); if (bestCache[id]) UI.log('Most efficient inputs (' + Layers.nameOf(id) + '): ' + bestCache[id].txt); lastHtml = ''; if (tab !== 'design') setTab('design'); else render(); }, 30); return; }
    const ap = e.target.closest('[data-apply]'); if (ap) { E.ev("designApplyBest('" + ap.dataset.apply + "')"); E.poll(true); UI.log('Most efficient inputs applied and run'); lastHtml = ''; chartKey = ''; setTimeout(render, 80); return; }
    const fm = e.target.closest('[data-farm]'); if (fm) { Layers.openFarm(fm.dataset.farm); return; }
  });
  function pin() { if (!E.snap) return; baseline = JSON.parse(JSON.stringify(E.snap.ro)); UI.log('Baseline pinned'); UI.toast('Baseline pinned. Results now show changes against it.'); setTab('results'); }
  function clearPin() { baseline = null; UI.log('Baseline cleared'); render(); }

  E.on('snap', () => { if (tab !== 'messages') render(); });
  E.on('scene', () => { chartKey = ''; lastHtml = ''; render(); });
  document.addEventListener('swafl-log', () => { if (tab === 'messages') render(); });
  setInterval(() => { if ((tab === 'design' || tab === 'charts') && E.snap && Layers.DESIGN.includes(E.snap.scene)) render(); }, 1000);
  return { tab: setTab, pin, clearPin, render, hasBaseline: () => !!baseline };
})();
