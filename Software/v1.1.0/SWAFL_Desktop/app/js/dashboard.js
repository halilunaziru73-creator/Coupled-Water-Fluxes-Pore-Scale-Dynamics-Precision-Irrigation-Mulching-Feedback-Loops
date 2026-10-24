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
  let dayCache = { key: '', D: null }, layerCache = { key: '', L: null }, n1Chart = null, N1T = null, v7Chart = null;
  function results(s) {
    const key = s.date + '|' + JSON.stringify(s.state) + '|' + s.year + '|' + ((s.wx && s.wx.key) || '');
    if (dayCache.key !== key) { dayCache = { key, D: E.day() }; }
    const D = dayCache.D, Y = D && D.year ? D.year : null;
    let h = '<div class="dwrap">';
    if (Layers.DESIGN.includes(s.scene)) h += SEC('dssnow', 'Soil water now: the film of this design', 'follows the film day by day', '<div id="dssNow" class="dssnow"><div class="dnote">Run the design: the film of the soil water appears at the end of the design, and this block follows it.</div></div>');
    // the key numbers of the open layer (the same lines as in the report), so every layer has its own results here
    { const lk = s.scene + '|' + key; if (layerCache.key !== lk) { let L = null; try { L = E.json("(function(){try{return reportNotes(currentScene,currentScene.id==='field'?(state.fview||'day'):null)}catch(e){return null}})()"); } catch (e) {} layerCache = { key: lk, L }; }
      if (s.scene === 'n1') { let N = null; try { N = E.json('n1Dash()'); } catch (e) {} if (N) { const f2 = v => (v == null || !isFinite(v)) ? '-' : (+v).toFixed(2), r = (a, b, c) => '<tr><td>' + a + '</td><td><b' + (c ? ' style="color:' + c + '"' : '') + '>' + b + '</b></td></tr>';
        const tick = q => '<li class="' + (q[0] ? 'ok' : 'no') + '"><span>' + (q[0] ? '&#10003;' : '&ndash;') + '</span><div><b>' + UI.esc(q[1]) + '</b><br><small>' + UI.esc(q[2]) + '</small></div></li>';
        h += SEC('layer', 'Trigger law: ' + UI.esc(N.soil), 'your soil only', '<table class="n1t">' +
          r('Soil', UI.esc(N.soil) + ' · sand ' + Math.round(N.sand) + ' %, clay ' + Math.round(N.clay) + ' %') +
          r('Water the soil holds', (+N.awc).toFixed(1) + ' mm per cm · ' + Math.round(N.taw) + ' mm in ' + N.roots + ' cm of roots') +
          r('Trigger (when to irrigate)', N.trigCm.toLocaleString('en-US') + ' cm suction · depletion ' + f2(N.fT), '#3F1D80') +
          r('Critical stress f*', f2(N.fstar) + ' = ' + N.critCm.toLocaleString('en-US') + ' cm suction', '#B01E14') +
          '<tr><td id="n1dL">Sensor</td><td><b id="n1dS">-</b></td></tr><tr><td>Next irrigation</td><td><b id="n1dN" style="color:#1565C0">-</b></td></tr><tr><td>Trigger reached</td><td><b id="n1dT" style="color:#3F1D80">-</b></td></tr><tr><td>Wilting point if no water comes</td><td><b id="n1dW" style="color:#B01E14">-</b></td></tr>' +
          r('Drying speed at the peak of the season', (N.rate * 100).toFixed(1) + ' % a day · crop uses ' + (+N.mm).toFixed(1) + ' mm a day') +
          r('From field capacity to the trigger', N.days != null ? Math.max(1, Math.round(N.days)) + ' days' : '-') +
          r('Yield', (+N.yield).toFixed(2) + ' ' + UI.esc(N.yUnit) + (N.rel != null ? ' · ' + Math.round(N.rel * 100) + ' % of the best trigger' : '')) +
          r('Irrigation · drainage', Math.round(N.irr) + ' · ' + Math.round(N.drain) + ' mm a year') + '</table>' +
          '<div class="chart"><canvas id="n1dc" style="height:230px"></canvas></div><div class="dnote" id="n1dCap">-</div>' +
          (N.rec != null ? '<div class="n1adv"><b>Choose f = ' + N.rec.toFixed(2) + '</b> · ' + UI.esc(N.why.replace(/^Advice for you: f = [0-9.]+,?\s*/, '').replace(/^because/, 'because')) + '</div>' : '') +
          (N.q50.length ? '<div class="n1q"><div><h5>Choose f = 0.50 if</h5><ul>' + N.q50.map(tick).join('') + '</ul></div><div><h5>Choose f = 0.45 if</h5><ul>' + N.q45.map(tick).join('') + '</ul></div></div>' : '') +
          '<div class="dnote">Click another soil in the drawing to see its numbers here.</div>');
        n1Chart = N.season; N1T = N.fT; } }
      else if (s.scene === 'v7') { let V = null; try { V = E.json('v7Dash()'); } catch (e) {} if (V) { const r = (a2, b2, c2) => '<tr><td>' + a2 + '</td><td><b' + (c2 ? ' style="color:' + c2 + '"' : '') + '>' + b2 + '</b></td></tr>', f1 = v => v == null || !isFinite(v) ? '-' : (+v).toFixed(1), sg = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);
        const mx = Math.max(...V.soils.map(q => Math.max(q.till, q.cons)), 1), bars = V.soils.map(q => '<div class="v7row' + (q.me ? ' me' : '') + '"><span class="v7n">' + UI.esc(q.n) + ' <small>' + q.clay + ' % clay</small></span><span class="v7b"><i class="t" style="width:' + (100 * q.till / mx).toFixed(1) + '%"></i><em>' + sg(q.till) + '</em><br><i class="c" style="width:' + (100 * q.cons / mx).toFixed(1) + '%"></i><em>' + sg(q.cons) + '</em></span></div>').join('');
        const tbl = '<table class="tbl v7g"><tr><th>Tillage</th>' + V.tcs.map((t, i) => '<th' + (i === V.ci ? ' class="on"' : '') + '>' + t + '</th>').join('') + '</tr>' + V.grid.map(g => '<tr' + (g.n === V.till ? ' class="on"' : '') + '><td>' + g.n + '</td>' + g.d.map((d, i) => '<td' + (i === V.ci && g.n === V.till ? ' class="me"' : '') + '>' + f1(d) + '</td>').join('') + '</tr>').join('') + '</table>';
        const lead = V.lead === 'none' ? 'neither driver' : V.lead, b0 = V.best[0], adv = V.lead === 'none' ? 'Drainage of this soil hardly moves with tillage or settling: choose the tillage for other reasons (fuel, erosion, weeds).' :
          (b0.n === V.till ? 'Your tillage, ' + V.till + ', already gives the least drainage (' + f1(b0.d) + ' mm a year) at this consolidation rate.' : 'Changing from ' + V.till + ' to ' + b0.n + ' tillage would cut drainage from ' + f1(V.drainNow) + ' to ' + f1(b0.d) + ' mm a year and nitrate leaching from ' + f1(V.nlNow) + ' to ' + f1(b0.nl) + ' kg N/ha, with a yield of ' + (+b0.y).toFixed(2) + ' against ' + (+V.yNow).toFixed(2) + ' Mg/ha.');
        h += SEC('layer', 'Soil hydraulic drivers: ' + UI.esc(V.soil), 'your soil and the ten soils', '<table class="n1t">' +
          r('Soil', UI.esc(V.soil) + ' · sand ' + V.sand + ' %, silt ' + V.silt + ' %, clay ' + V.clay + ' %') +
          r('Your settings', V.till + ' tillage · consolidation rate ' + V.tc + ' per day' + (V.pore != null ? ' · topsoil pore space ' + (+V.pore).toFixed(2) : '')) +
          r('Drainage below 1 m', f1(V.drainNow) + ' mm a year (range over all settings ' + f1(V.range[0]) + ' to ' + f1(V.range[1]) + ')', '#00695C') +
          r('Nitrate leaching', f1(V.nlNow) + ' kg N/ha a year', '#B01E14') +
          r('Yield · irrigation', (+V.yNow).toFixed(2) + ' Mg/ha · ' + f1(V.irrNow) + ' mm a year') +
          r('Effect of tillage', sg(V.effTill) + ' mm a year (conventional against no-till)', '#1B4FA0') +
          r('Effect of the consolidation rate', sg(V.effCons) + ' mm a year (fastest against slowest)', '#A8620F') +
          r('Leading driver', lead + ' · rank ' + V.rank + ' of 10 soils for sensitivity', '#12303A') + '</table>' +
          '<div class="chart"><canvas id="v7dc" style="height:220px"></canvas></div><div class="dnote">Drainage below 1 m of ' + UI.esc(V.soil.toLowerCase()) + ' (20-year mean of the simulations) against the consolidation rate, for the three tillage systems; the red line is your consolidation rate.</div>' +
          '<div class="dnote"><b>Drainage (mm a year) for every setting</b></div>' + tbl +
          '<div class="n1adv"><b>Leading driver: ' + UI.esc(lead) + '.</b> ' + UI.esc(V.why) + ' ' + UI.esc(adv) + '</div>' +
          '<div class="dnote"><b>The ten soils</b>, by clay content: <i class="v7k t"></i> tillage, <i class="v7k c"></i> consolidation rate (change of drainage, mm a year)</div><div class="v7list">' + bars + '</div>' +
          '<div class="dnote">Change the soil, the tillage or the consolidation rate in Properties to see their numbers here.</div>');
        v7Chart = V; } }
      else {
      const L = (Layers.DESIGN || []).includes(s.scene) && !runOn(s.scene) ? null : layerCache.L; if (L && L.length) h += SEC('layer', UI.esc(Layers.nameOf(s.scene) || 'This layer'), 'key numbers of this layer', '<ul class="dlist">' + L.map(l => '<li>' + UI.esc(l) + '</li>').join('') + '</ul>'); } }
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
    if (s.scene === 'n1') { n1Key = ''; n1Live(true); }
    if (s.scene === 'v7' && v7Chart) { const V = v7Chart, cv = document.getElementById('v7dc'); if (cv) xyChart(cv, { x: V.tcs.map((_, i) => i), xl: 'consolidation rate (per day)', yl: 'drainage (mm/yr)', ymin: 0, xstep: 1, xfmt: q => String(V.tcs[Math.round(q)]), series: V.grid.map((g, i) => ({ y: g.d, c: ['#1B4FA0', '#2E8B57', '#A8620F'][i], n: g.n + (g.n === V.till ? ' (yours)' : ''), w: g.n === V.till ? 3 : 1.8 })), marks: [{ x: V.ci, t: 'your rate', c: '#C00000', solid: true }] }); }
  }

  const DL = {
    sid: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'pct'], ['cu', 'Distribution uniformity CU', 'num', '%'], ['tco', 'Cut-off time', 'num', 'min'], ['tst', 'Time to fill the root zone', 'num', 'min'], ['tL', 'Advance time', 'num', 'min'], ['Vapp', 'Applied volume', 'num', 'm³'], ['Vreq', 'Required volume', 'num', 'm³'], ['Vdp', 'Deep percolation volume', 'num', 'm³'], ['Vro', 'Runoff volume', 'num', 'm³']],
    drip: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['Eu', 'Emission uniformity', 'pct'], ['dp', 'Deep percolation', 'pct'], ['Pw', 'Wetted fraction', 'pct'], ['gross', 'Gross application', 'num', 'mm'], ['t', 'Irrigation time', 'num', 'h'], ['V', 'Applied volume per emitter', 'num', 'L'], ['Vreq', 'Required volume per emitter', 'num', 'L']],
    spr: [['Ea', 'Application efficiency', 'pct'], ['Es', 'Storage efficiency', 'pct'], ['DU', 'Distribution uniformity DU', 'pct'], ['CU', 'Christiansen uniformity CU', 'pct'], ['dp', 'Deep percolation', 'pct'], ['ro', 'Runoff', 'pct'], ['gross', 'Gross application', 'num', 'mm'], ['I', 'Net application', 'num', 'mm'], ['T', 'Set time', 'num', 'min'], ['Q', 'Sprinkler discharge', 'num', 'L/min'], ['AR', 'Application rate', 'num', 'mm/h']]
  };
  const runOn = id => !!E.ev("(window.DESIGN_RUN&&DESIGN_RUN['" + id + "']&&DESIGN_RUN['" + id + "'].on)?1:0");
  const runBtns = id => '<div class="drun"><button class="btn prim" data-run="' + id + '">&#9654; Run simulation</button><button class="btn" data-best="' + id + '">Find the most efficient inputs</button></div>';
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
  // the trigger law follows the replay: date, sensor, next irrigation, trigger and wilting point, and the season chart on dates
  let n1Key = '', n1Timer = null;
  function n1Live(force) {
    const cv = document.getElementById('n1dc'); if (!cv) { if (n1Timer && !force) { clearInterval(n1Timer); n1Timer = null; } return; }
    if (!n1Timer) n1Timer = setInterval(() => { if (Layers.current && Layers.current() !== 'n1') { clearInterval(n1Timer); n1Timer = null; return; } n1Live(); }, 350);
    let V = null; try { V = E.json('n1Live()'); } catch (e) {} if (!V) return; const key = V.dd + '|' + V.fS.toFixed(3) + '|' + V.fT + '|' + V.soil + '|' + cv.clientWidth; if (key === n1Key && !force) return; n1Key = key;
    const set = (id, t) => { const e = document.getElementById(id); if (e && e.innerHTML !== t) e.innerHTML = t; }, dn = n => n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days';
    set('n1dL', 'Sensor at ' + V.z + ' cm on ' + UI.esc(V.date) + (V.play ? ' <small>(replay)</small>' : ''));
    set('n1dS', V.sensorCm.toLocaleString('en-US') + ' cm · depletion ' + (V.fS * 100).toFixed(0) + ' % · ' + (V.due ? '<span style="color:#B01E14">irrigate now</span>' : 'within the trigger'));
    set('n1dN', V.next ? UI.esc(V.next.date) + ' (' + dn(V.next.days) + ', ' + V.next.mm + ' mm)' : 'none in the next 12 months');
    set('n1dT', V.due ? 'reached: ' + (V.fS * 100).toFixed(0) + ' % against ' + (V.fT * 100).toFixed(0) + ' %' : V.trig ? UI.esc(V.trig.date) + ' (' + dn(V.trig.days) + ')' : 'about ' + V.trigDry + ' days of drying');
    set('n1dW', V.wilt ? UI.esc(V.wilt.date) + ' (' + dn(V.wilt.days) + ' at ' + (V.rate * 100).toFixed(1) + ' % a day' + (V.peak ? ', the speed of the peak of the season' : '') + ')' : '-');
    set('n1dCap', 'Depletion at the sensor (' + V.z + ' cm) through the season of ' + V.season.year + ', ' + UI.esc(V.season.start) + ' to ' + UI.esc(V.season.end) + ': 0 % is field capacity, 100 % the wilting point. Purple: the simulated sensor; dashed purple: the trigger; blue: irrigation days; red line: the replay date' + (V.inSeason ? '' : ' (outside the season: the replay date is ' + UI.esc(V.date) + ')') + '; dashed red: drying to the wilting point if no water comes.');
    const S = V.season, n = S.x.length, proj = S.x.map(() => NaN);
    if (V.inSeason && !V.due && V.wilt) for (let q = V.today; q < n; q++) { const v = V.fS * 100 + (q - V.today) * V.rate * 100; proj[q] = Math.min(100, v); if (v >= 100) break; }
    const marks = S.x.filter((q, i) => S.irr[i]).map(q => ({ x: q, t: '', c: '#1565C0' })).concat([{ y: V.fT * 100, t: 'trigger ' + (V.fT * 100).toFixed(0) + ' %', c: '#3F1D80' }]);
    if (V.inSeason) marks.push({ x: V.today, t: V.date.replace(/ \d{4}$/, ''), c: '#C00000', solid: true });
    if (V.next && V.next.q >= 0 && V.next.q < n && V.next.days > 0) marks.push({ x: V.next.q, t: 'next irrigation', c: '#1565C0' });
    if (V.inSeason && V.wilt && V.wilt.q < n && !V.due) marks.push({ x: V.wilt.q, t: 'wilting', c: '#B01E14' });
    xyChart(cv, { x: S.x, xl: 'date (season of ' + S.year + ')', yl: 'depletion at the sensor (%)', ymin: 0, ymax: 100, xfmt: q => S.lab[Math.max(0, Math.min(n - 1, Math.round(q)))], xstep: 15, yfmt: v => v === 0 ? '0 FC' : v === 100 ? '100 WP' : String(v),
      series: [{ y: S.y, c: '#8E24AA', n: 'sensor depletion', w: 2 }, { y: proj, c: '#C62828', n: 'if no water comes', w: 1.6, dash: [5, 4] }], marks });
  }
  function xyChart(cv, o) {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, w, h); c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
    c.font = '10px Tahoma,Arial';
    // the legend wraps onto as many lines as the width needs, and the plot starts below it
    const leg = []; { let lx = 50, ly = 0; o.series.forEach(s => { if (!s.n) return; const lw = 22 + c.measureText(s.n).width; if (lx + lw > w - 6 && lx > 50) { lx = 50; ly++; } leg.push([s, lx, ly]); lx += lw; }); }
    const nLeg = leg.length ? leg[leg.length - 1][2] + 1 : 0;
    const L = 46, R = 12, T = 10 + 13 * nLeg, B = 30, xs = o.x, all = o.series.flatMap(s => s.y.filter(v => isFinite(v)));
    const nice = (lo, hi, n) => { const raw = (hi - lo) / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw || 1))), m = raw / p, st = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; const out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-6; v += st) out.push(+v.toFixed(10)); return { out, st }; };
    const tf0 = (v, st) => { const d = Math.abs(st - Math.round(st)) < 1e-9 && st >= 1 ? 0 : Math.abs(st * 10 - Math.round(st * 10)) < 1e-9 ? 1 : 2; return d ? v.toFixed(d) : Math.round(v).toLocaleString('en-US'); };
    const tf = (v, st) => o.yfmt ? o.yfmt(v) : tf0(v, st);
    let ymx = o.ymax != null ? o.ymax : (Math.max(...all, 0) > 0 ? Math.max(...all) * 1.08 : 1), ymn = o.ymin != null ? o.ymin : Math.min(0, ...all);
    if (o.invert) [ymn, ymx] = [ymx, ymn];
    const xmn = Math.min(...xs), xmx = Math.max(...xs), X = v => L + (w - L - R) * (v - xmn) / ((xmx - xmn) || 1), Y = v => T + (h - T - B) * (1 - (v - ymn) / ((ymx - ymn) || 1));
    c.font = '10px Tahoma,Arial'; c.strokeStyle = '#E0E0E0'; c.fillStyle = '#404040'; c.lineWidth = 1;
    { const lo = Math.min(ymn, ymx), hi = Math.max(ymn, ymx), yt = nice(lo, hi, Math.max(2, Math.floor((h - T - B) / 32))); yt.out.forEach(v => { const y = Y(v); c.beginPath(); c.moveTo(L, y); c.lineTo(w - R, y); c.stroke(); c.textAlign = 'right'; c.fillText(tf(v, yt.st), L - 4, y + 3); }); }
    { const xt = o.xstep ? (() => { const px = (w - L - R) / ((xmx - xmn) || 1), st2 = [o.xstep, o.xstep * 2, o.xstep * 3, o.xstep * 4, o.xstep * 6].find(q => q * px >= 50) || o.xstep * 8, out = []; for (let v = xmn; v <= xmx + 1e-9; v += st2) out.push(v); return { out, st: st2 }; })() : nice(xmn, xmx, Math.max(2, Math.floor((w - L - R) / 52))); let last = -1e9; c.textAlign = 'center'; xt.out.forEach(v => { const x = X(v), t = o.xfmt ? o.xfmt(v) : o.xl === 'year' ? String(Math.round(v)) : tf0(v, xt.st), tw = c.measureText(t).width; if (x - tw / 2 < last + 4) return; c.fillText(t, Math.min(w - tw / 2 - 1, x), h - B + 13); last = x + tw / 2; }); }
    c.fillText(o.xl || '', L + (w - L - R) / 2, h - 4); c.save(); c.translate(10, T + (h - T - B) / 2); c.rotate(-Math.PI / 2); c.fillText(o.yl || '', 0, 0); c.restore();
    c.strokeStyle = '#808080'; c.strokeRect(L, T, w - L - R, h - T - B);
    c.save(); c.beginPath(); c.rect(L, T, w - L - R, h - T - B); c.clip();
    o.series.forEach(s => {
      c.strokeStyle = s.c; c.lineWidth = s.w || 2; c.setLineDash(s.dash || []);
      if (s.fill) { c.fillStyle = s.fill; c.beginPath(); xs.forEach((x, i) => { const yy = Y(s.y[i]); i ? c.lineTo(X(x), yy) : c.moveTo(X(x), yy); }); c.lineTo(X(xs[xs.length - 1]), Y(Math.max(ymn, 0))); c.lineTo(X(xs[0]), Y(Math.max(ymn, 0))); c.closePath(); c.fill(); }
      c.beginPath(); let pen = false; xs.forEach((x, i) => { const v = s.y[i]; if (!isFinite(v)) { pen = false; return; } const yy = Y(v); pen ? c.lineTo(X(x), yy) : c.moveTo(X(x), yy); pen = true; }); c.stroke(); c.setLineDash([]);
    });
    c.restore();
    (o.marks || []).forEach(m => { c.strokeStyle = m.c || '#C00000'; c.setLineDash(m.solid ? [] : [4, 3]); c.lineWidth = m.solid ? 2 : 1.2; c.beginPath(); if (m.x != null) { c.moveTo(X(m.x), T); c.lineTo(X(m.x), h - B); } else { c.moveTo(L, Y(m.y)); c.lineTo(w - R, Y(m.y)); } c.stroke(); c.setLineDash([]); c.fillStyle = m.c || '#C00000'; if (m.t) { const tw = c.measureText(m.t).width, right = m.x != null && X(m.x) + 3 + tw > w - R; const tx = m.x != null ? (right ? X(m.x) - 3 - tw : X(m.x) + 3) : w - R - 4 - tw, ty = m.x != null ? T + 11 + (o.marks.filter(q => q.t && q.x != null).indexOf(m) % 3) * 13 : Y(m.y) - 4; c.fillStyle = 'rgba(255,255,255,0.88)'; c.fillRect(tx - 2, ty - 10, tw + 4, 13); c.fillStyle = m.c || '#C00000'; c.textAlign = 'left'; c.fillText(m.t, tx, ty); } });
    // legend
    c.textAlign = 'left'; leg.forEach(([s, lx, ly]) => { c.fillStyle = s.c; c.fillRect(lx, 4 + ly * 13, 12, 3); c.fillStyle = '#000'; c.fillText(s.n, lx + 16, 9 + ly * 13); });
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
    xyChart(cv, { x: series[0].v.map((_, i) => (o.cal0 || 0) + i), xl: 'year', yl: o.yl || 'mm', series: series.map(s => ({ y: s.v, c: s.c, n: s.n, dash: s.dash ? [5, 3] : null, fill: o.bars && !s.dash ? s.c + '33' : null })), marks: o.marks });
  }
  // the seasonal layers: one chart per widget of the layer, with how each quantity varies over the twenty seasons
  function seasonCharts(id) {
    const D = E.json("layerSeries('" + id + "')"); if (!D || !D.charts) { setBody('<div class="dnote">Loading the seasons...</div>'); return; }
    const st = v => { const a = v.filter(q => q != null && isFinite(q)), n = a.length || 1, m = a.reduce((x, y) => x + y, 0) / n, s2 = a.sort((x, y) => x - y), p = f => s2[Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))))], sd = Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / n); return { m, p10: p(0.1), p90: p(0.9), cv: m ? sd / Math.abs(m) : 0, mn: s2[0], mx: s2[n - 1] }; };
    const f = v => (Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 10) / 10).toLocaleString('en-US');
    let h = '<div class="dnote">One chart for each part of the layer: the twenty seasons on the calendar of the working date. Dashed lines: rainfed.</div><div class="charts">';
    D.charts.forEach((c, i) => { const a = c.ser[0] ? st(c.ser[0].v.slice()) : null; h += CB('sc' + i, UI.esc(c.t) + ' (' + UI.esc(c.u) + ')', '<canvas id="scv' + i + '"></canvas>' + (a ? '<div class="dnote">' + UI.esc(c.ser[0].n) + ': mean ' + f(a.m) + ' ' + UI.esc(c.u) + ', 10–90 % ' + f(a.p10) + ' to ' + f(a.p90) + ', lowest ' + f(a.mn) + ', highest ' + f(a.mx) + ', varies by ' + Math.round(a.cv * 100) + ' % from year to year.</div>' : '')); });
    setBody(h + '</div>');
    clearTimeout(chartTimer); chartTimer = setTimeout(() => D.charts.forEach((c, i) => { const cv = document.getElementById('scv' + i); if (cv && c.ser.length) lineChart(cv, c.ser.map(q => ({ v: q.v.map(x => x == null ? NaN : x), c: q.c, n: q.n, dash: q.dash })), { bars: true, cal0: D.years[0], yl: c.u, marks: D.sel != null ? [{ x: D.years[0] + D.sel, t: String(D.years[0] + D.sel), c: '#C00000' }] : null }); }), 30);
  }
  function charts() {
    const s = E.snap; if (s && DL[s.scene]) { designCharts(s.scene); return; }
    if (s && ['yby', 'wb2', 'nb'].includes(s.scene)) { seasonCharts(s.scene); return; }
    if (!(document.getElementById('c1') && document.getElementById('c3') && body.querySelector('.charts')))   // the charts are redrawn in place: no flash
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
    if (tab === 'results') results(s); else if (tab === 'design') design(s); else if (tab === 'charts') { const k = s.scene + '|' + JSON.stringify(s.state) + '|' + (DL[s.scene] ? s.date : String(s.date || '').slice(0, 4)) + '|' + ((s.wx && s.wx.key) || '') + '|' + (DL[s.scene] ? runOn(s.scene) + E.ev('JSON.stringify(window.DESIGN_RUN)') + E.ev("JSON.stringify(typeof sidRun==='function'?[sidRun().Ea,drRun().Ea,spRun().Ea]:0)") : ''); if (k !== chartKey) { chartKey = k; charts(); } } else messages();
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
  });
  function pin() { if (!E.snap) return; baseline = JSON.parse(JSON.stringify(E.snap.ro)); UI.log('Baseline pinned'); UI.toast('Baseline pinned. Results now show changes against it.'); setTab('results'); }
  function clearPin() { baseline = null; UI.log('Baseline cleared'); render(); }

  E.on('snap', () => { if (tab !== 'messages') render(); });
  E.on('scene', () => { chartKey = ''; lastHtml = ''; render(); });
  document.addEventListener('swafl-log', () => { if (tab === 'messages') render(); });
  // the soil water of the day the film shows, with the next irrigation and the wilting point counted from that day
  const SYS = { sid: 'Surface', drip: 'Drip', spr: 'Sprinkler' };
  function dssLive() {
    const el = document.getElementById('dssNow'); if (!el || !E.snap || !Layers.DESIGN.includes(E.snap.scene)) return; let N = null; try { N = E.json('window.__DSSNOW||null'); } catch (e) {}
    let run = null; try { run = E.json("(function(){var R=window.DESIGN_RUN||{};return R['" + E.snap.scene + "']?!!R['" + E.snap.scene + "'].on:null})()"); } catch (e) {}
    if (!N || N.sys !== SYS[E.snap.scene] || run === false) { if (!el.dataset.empty) { el.dataset.empty = '1'; el.innerHTML = '<div class="dnote">Run the design: the film of the soil water appears at the end of the design, and this block follows it day by day.</div>'; } return; }
    let P = null, W2 = 'recorded weather of the simulations'; try { P = E.json('window.__PLANT||null'); const ws = E.json('wxStatus()') || {}; if (ws.src === 'online') W2 = 'online: ' + ws.name + ' (' + ws.years + ')'; else if (ws.src === 'file') W2 = 'file: ' + ws.name; } catch (e) {}
    el.dataset.empty = ''; const r = (a, b, c) => '<tr><td>' + a + '</td><td><b' + (c ? ' style="color:' + c + '"' : '') + '>' + b + '</b></td></tr>';
    const html = '<div class="dssday"><i style="background:' + N.col + '"></i><b>' + UI.esc(N.date) + '</b> · day ' + N.day + ' of ' + N.span + (N.paused ? ' · paused' : '') + '</div><table class="n1t">' +
      r('Crop', UI.esc(N.crop)) + r('Phase', UI.esc(N.phase)) +
      r('Water in the root zone', N.mm.toFixed(0) + ' of ' + N.taw.toFixed(0) + ' mm (' + N.pct + ' %)', '#0D47A1') +
      r('Sensor depletion', N.dep.toFixed(2) + ' (trigger ' + N.fT.toFixed(2) + ')', N.dep >= N.fT ? '#C62828' : '#1B5E20') +
      r('Next irrigation', N.next ? UI.esc(N.next) + (N.nextIn === 0 ? ' (today)' : ' (in ' + N.nextIn + ' day' + (N.nextIn === 1 ? '' : 's') + ')') + '<br><small>' + N.net.toFixed(0) + ' mm net, ' + N.gross.toFixed(0) + ' mm pumped</small>' : 'none in the record', '#1565C0') +
      r('Wilting point without irrigation', N.wilt ? UI.esc(N.wilt) + ' (in ' + N.wiltIn + ' days)' + (N.trig ? '<br><small>root zone at the trigger level ' + UI.esc(N.trig) + '</small>' : '') : 'not within 200 days', '#C62828') +
      (P ? r('When to plant ' + UI.esc(P.label.toLowerCase()), (P.none ? 'too cold in the open field; warmest window ' : '') + P.from + ' to ' + P.to + ' (best ' + P.best + ')<br><small>' + P.I + ' mm of irrigation a season; rain-fed ' + P.RYr + ' % of potential' + (P.cur ? '; your sowing ' + P.cur + ': ' + P.curI + ' mm' : '') + (P.temp ? '' : '; temperatures of Taastrup (recorded weather)') + '</small>', '#1B5E20') : '') +
      r('Weather', UI.esc(W2), W2.indexOf('recorded') === 0 ? '#8A5300' : '#1B5E20') + '</table>' + (N.note ? '<div class="dnote">' + UI.esc(N.note) + '</div>' : '');
    if (el.innerHTML !== html) el.innerHTML = html;
  }
  setInterval(dssLive, 400);
  setInterval(() => { if ((tab === 'design' || tab === 'charts') && E.snap && Layers.DESIGN.includes(E.snap.scene)) render(); }, 1000);
  return { tab: setTab, pin, clearPin, render, hasBaseline: () => !!baseline };
})();
