/* Dashboard: live results, design results, yearly charts and the message log. */
'use strict';
const Dash = (() => {
  const body = document.getElementById('dashBody'), tabs = document.getElementById('dashTabs');
  let tab = 'results', baseline = null, chartTimer = null;
  const RO = [   // key, label, colour class, which direction is "better" (+1 higher, -1 lower, 0 neutral)
    ['evap', 'Soil evaporation', '', -1], ['transp', 'Transpiration', 't1', 0], ['et', 'Evapotranspiration', 't1', 0], ['drain', 'Drainage', 't2', -1],
    ['irr', 'Irrigation', 't3', -1], ['yield', 'Yield', 't4', 1], ['ie', 'Irrigation efficiency', 't4', 1], ['nl', 'Nitrogen leaching', 't2', -1], ['rain', 'Rainfall', '', 0], ['baseIrr', 'Irrigation without mulch', 't3', 0]
  ];
  const num = t => { const m = String(t || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };

  function results(s) {
    let h = '<div class="dnote">' + UI.esc(Layers.nameOf(s.scene)) + ' &middot; ' + (baseline ? 'changes are shown against the pinned baseline' : 'pin a baseline to see every change against it') + '</div><div class="kgrid">';
    RO.forEach(r => {
      const v = s.ro[r[0]], n = num(v); let d = '';
      if (baseline && !isNaN(n) && !isNaN(num(baseline[r[0]]))) {
        const diff = n - num(baseline[r[0]]), cls = Math.abs(diff) < 1e-9 ? 'eq' : (r[3] === 0 ? 'eq' : ((diff > 0) === (r[3] > 0) ? 'up' : 'dn'));
        d = '<div class="kd ' + cls + '">' + (diff > 0 ? '&#9650; +' : diff < 0 ? '&#9660; ' : '= ') + (Math.abs(diff) < 1e-9 ? 'no change' : (Math.round(diff * 100) / 100)) + '</div>';
      }
      h += '<div class="kpi ' + r[2] + '"><div class="kl">' + r[1] + '</div><div class="kv">' + UI.esc(v || '...') + '</div>' + d + '</div>';
    });
    body.innerHTML = h + '</div>';
  }

  const DL = {
    sid: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'pct'], ['cu', 'Distribution uniformity CU', 'num', '%'], ['tco', 'Cut-off time', 'num', 'min'], ['tst', 'Time to fill the root zone', 'num', 'min'], ['tL', 'Advance time', 'num', 'min'], ['Vapp', 'Applied volume', 'num'], ['Vreq', 'Required volume', 'num'], ['Vdp', 'Deep percolation volume', 'num'], ['Vro', 'Runoff volume', 'num']],
    drip: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['Eu', 'Emission uniformity', 'pct'], ['dp', 'Deep percolation', 'pct'], ['Pw', 'Wetted fraction', 'pct'], ['gross', 'Gross application', 'num', 'mm'], ['t', 'Irrigation time', 'num', 'h'], ['V', 'Applied volume', 'num'], ['Vreq', 'Required volume', 'num']],
    spr: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['DU', 'Distribution uniformity DU', 'pct'], ['CU', 'Christiansen uniformity CU', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'num'], ['gross', 'Gross application', 'num', 'mm'], ['I', 'Net application', 'num', 'mm'], ['T', 'Set time', 'num', 'min'], ['Q', 'Sprinkler discharge', 'num'], ['AR', 'Application rate', 'num']]
  };
  function design(s) {
    const id = s.scene;
    if (!DL[id]) { body.innerHTML = '<div class="dnote">The Design tab shows efficiencies, uniformity, times and volumes of the irrigation system you are designing. Open <b>Surface irrigation design</b>, <b>Drip irrigation design</b> or <b>Sprinkler design and pipes</b> in the Layers panel.</div>'; return; }
    const R = E.design(id); if (!R) return;
    let h = '<div class="dnote">' + UI.esc(Layers.nameOf(id)) + ' &middot; live results of the layout drawn above</div><div class="kgrid">';
    DL[id].forEach((r, i) => {
      if (R[r[0]] === undefined) return;
      const v = R[r[0]], txt = r[2] === 'pct' ? (v * 100).toFixed(1) + ' %' : (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)) + (r[3] ? ' ' + r[3] : '');
      h += '<div class="kpi ' + ['', 't1', 't2', 't3', 't4'][i % 5] + '"><div class="kl">' + r[1] + '</div><div class="kv">' + txt + '</div></div>';
    });
    body.innerHTML = h + '</div>';
  }

  function lineChart(cv, series, o) {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h);
    const L = 40, R = 8, T = 8, B = 20, all = series.flatMap(s => s.v), mx = Math.max(...all, 1e-9) * 1.08, mn = o.zero ? 0 : Math.min(...all) * 0.95, n = series[0].v.length;
    c.font = '10.5px Segoe UI,Arial'; c.strokeStyle = '#D5E1EE'; c.fillStyle = '#5A7490'; c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = T + (h - T - B) * i / 4, val = mx - (mx - mn) * i / 4; c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke(); c.textAlign = 'right'; c.fillText(val >= 100 ? val.toFixed(0) : val.toFixed(1), L - 4, y + 3); }
    const X = i => L + (w - L - R) * (o.bars ? (i + 0.5) / n : i / Math.max(1, n - 1)), Y = v => T + (h - T - B) * (1 - (v - mn) / (mx - mn || 1));
    c.textAlign = 'center'; for (let i = 0; i < n; i += Math.ceil(n / 10)) c.fillText(String(i + 1), X(i), h - 6);
    series.forEach((s, k) => {
      c.strokeStyle = c.fillStyle = s.c;
      if (o.bars) { const bw = (w - L - R) / n * 0.7 / series.length; s.v.forEach((v, i) => { c.fillRect(X(i) - bw * series.length / 2 + k * bw, Y(v), bw, Y(mn) - Y(v)); }); }
      else { c.lineWidth = 2; c.beginPath(); s.v.forEach((v, i) => { i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)); }); c.stroke(); }
    });
    c.textAlign = 'left'; series.forEach((s, k) => { if (!s.n) return; c.fillStyle = s.c; c.fillRect(L + 6 + k * 120, 10, 10, 3); c.fillStyle = '#16304A'; c.fillText(s.n, L + 20 + k * 120, 15); });
  }
  function charts() {
    body.innerHTML = '<div class="dnote">Twenty weather years for the current settings (year number on the horizontal axis, millimetres per year).</div><div class="charts"><div class="chart"><h4>Rainfall and irrigation</h4><canvas id="c1"></canvas></div><div class="chart"><h4>Drainage below the root zone</h4><canvas id="c2"></canvas></div><div class="chart"><h4>Evaporation and transpiration</h4><canvas id="c3"></canvas></div></div>';
    clearTimeout(chartTimer); chartTimer = setTimeout(() => {
      const S = E.season(); if (!S || !document.getElementById('c1')) return;
      lineChart(document.getElementById('c1'), [{ v: S.yR, c: '#5AA0E1', n: 'Rain' }, { v: S.yI, c: '#C77D1A', n: 'Irrigation' }], { bars: true, zero: true });
      lineChart(document.getElementById('c2'), [{ v: S.yD, c: '#7A5AA8' }], { bars: true, zero: true });
      lineChart(document.getElementById('c3'), [{ v: S.yE, c: '#00859B', n: 'Evaporation' }, { v: S.yT, c: '#2E7D4F', n: 'Transpiration' }], { zero: true });
    }, 30);
  }
  function messages() {
    body.innerHTML = UI.logs.slice().reverse().map(l => '<div class="logline ' + (l.level === 'err' ? 'err' : l.level === 'warn' ? 'warn' : '') + '"><span class="tm">' + l.t + '</span>' + UI.esc(l.msg) + '</div>').join('') || '<div class="dnote">No messages yet.</div>';
  }
  function render() {
    const s = E.snap; if (!s) return;
    if (tab === 'results') results(s); else if (tab === 'design') design(s); else if (tab === 'charts') charts(); else messages();
  }
  function setTab(t) { tab = t; tabs.querySelectorAll('button[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === t)); render(); }
  tabs.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tab) setTab(b.dataset.tab); else if (b.dataset.act === 'pinBaseline') pin(); else if (b.dataset.act === 'clearBaseline') clearPin();
  });
  function pin() { if (!E.snap) return; baseline = JSON.parse(JSON.stringify(E.snap.ro)); UI.log('Baseline pinned'); UI.toast('Baseline pinned. Results now show changes against it.'); setTab('results'); }
  function clearPin() { baseline = null; UI.log('Baseline cleared'); render(); }

  E.on('snap', () => { if (tab !== 'charts' && tab !== 'messages') render(); });
  E.on('state', () => { if (tab === 'charts') render(); });
  E.on('scene', () => { if (tab === 'charts') render(); });
  document.addEventListener('swafl-log', () => { if (tab === 'messages') render(); });
  setInterval(() => { if (tab === 'design' && E.snap && Layers.DESIGN.includes(E.snap.scene)) render(); }, 1200);
  return { tab: setTab, pin, clearPin, render, hasBaseline: () => !!baseline };
})();
