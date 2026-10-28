/* SWAFL 1.1 data layers built on the year-by-year Daisy output (peryear.js) and the crop library (crops.js):
   Y1 Year by year (reliability), W1 Full water balance, N4 Nitrogen budget, C1 Crop water requirement. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined') return;
  // the 20 simulated seasons are shown on the calendar of the working date, as everywhere in the program
  const YRS = () => Array.from({ length: 20 }, (_, i) => String((typeof CAL0 !== 'undefined' ? CAL0 : 1980) + i));
  const fmt = (v, d) => v == null || !isFinite(v) ? '–' : v.toFixed(d == null ? 0 : d);
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) * (v - m)))); };
  const pct = (a, q) => { const s = a.slice().sort((x, y) => x - y), i = (s.length - 1) * q, lo = Math.floor(i); return s[lo] + (s[Math.min(s.length - 1, lo + 1)] - s[lo]) * (i - lo); };
  const CROPCOL = { 'Spring Barley': '#C8A24A', 'Winter Barley': '#B08A3A', 'Winter Rape': '#E2C83A', 'Winter Wheat': '#A8742E' };
  const PANEL = '#FFFFFF', GRID = '#E6E2D6', HEAD = '#1B1F23';
  const yearNow = () => { try { return clampN(yearOf(fclock.kd()), 0, NYR - 1); } catch (e) { return 14; } };
  const setYear = y => { try { fclock.day = y * DPY + 150; fclock.pause = 0; fclock.mem = []; } catch (e) {} };

  // the Daisy run that matches the current settings (each experiment varies one control around the irrigated baseline)
  window.pickRun = function () {
    const P = window.PERYEAR; if (!P) return null;
    const s = state.soil, R = P.runs, vff = VFF_VALUES[state.vffIdx], cap = CAP_VALUES[state.capIdx], tc = TC_VALUES[state.tcIdx], z = Z_VALUES[state.zIdx], trig = Math.abs(trigAbsFor(s));
    const has = id => R[id] ? { id, r: R[id] } : null;
    let pick = null, why = '';
    if (vff < 0.95) { const vs = [0.1, 0.3, 0.5, 0.7, 0.9], vn = vs.reduce((b, v) => Math.abs(v - vff) < Math.abs(b - vff) ? v : b, vs[0]); pick = has('E7_' + s + '_vff' + vn + '_cap' + (cap === 0.5 ? '0.5' : String(cap).replace('.0', '')) + 'mm'); why = 'mulch strength ' + vn + ', capacity ' + cap + ' mm'; }
    if (!pick && state.method !== 'M02_Surface') { pick = has('E4_' + s + '_' + state.method); why = ((METHODS.find(m => m.k === state.method) || {}).label || state.method) + ''; }
    if (!pick && trig !== 300) { const hs = [...new Set(Object.values(R).filter(r => r.exp === 'E2' && r.soil === s).map(r => +r.tr.slice(1)))]; const hn = hs.reduce((b, v) => Math.abs(Math.log(v / trig)) < Math.abs(Math.log(b / trig)) ? v : b, hs[0] || 300); pick = has('E2_' + s + '_h' + hn); why = 'trigger −' + hn + ' cm at 20 cm, surface irrigation'; }
    if (!pick && z !== 20) { pick = has('E3_' + s + '_z' + z + 'cm'); why = 'sensor at ' + z + ' cm'; }
    if (!pick) { pick = has('E5_' + s + '_' + state.till + '_tc' + tc + '_Irrigated'); why = TILL_LABELS[state.till] + ' tillage, consolidation ' + tc + ' per day, the baseline'; }
    if (!pick) { pick = has('E2_' + s + '_h300'); why = 'trigger −300 cm at 20 cm, surface irrigation'; }
    if (!pick) return null;
    pick.why = why; pick.rainfed = R['E0_' + s + '_Rainfed'] || null; return pick;
  };
  // the crop of the twenty seasons: the crop of interest (the crop chosen for the project) or the long crop (a tree, vine or palm that stays
  // in the field all year); every control of the project (soil, structure, salt, weather, trigger, method, mulch) feeds the same daily balance
  window.yrKey = function () { const L = window.CROPLIB; if (state.yrCrop === 'long' && L) return L.crops[state.longCrop] ? state.longCrop : 'olive'; return state.crop; };
  window.yrLabel = function () { const k = yrKey(), c = CROPS[k]; return (c && c.label || k) + (state.yrCrop === 'long' ? ' (long crop)' : ' (crop of interest)'); };
  window.cropYearFactor = function () {          // year-by-year irrigation factor of the chosen library crop against the cereal rotation (FAO-56)
    if (!window.CROPLIB || !CROPLIB.crops[yrKey()]) return null;
    const c = CWB(yrKey()), r = CWB('__ref'); return c.I.map((v, y) => r.I[y] > 5 ? v / r.I[y] : null);
  };

  // The Daisy run carries the year-to-year pattern of the setting it simulates. Controls that its experiment does not
  // vary (crop, rainfall, warming, nitrogen rate) are applied by the response of the annual model to each of them, so that
  // the 20-year mean of every series equals the annual result at your settings and every control moves the years.
  // the series of each widget of the seasonal layers, for the charts of the dashboard: one chart per widget
  window.layerSeries = function (id) {
    const pk = pickRun(); if (!pk) return null; const r = adjRun(pk), rf = adjRun(pk, true), Y = YRS().map(Number), g = k => (r[k] || []).map(v => v == null ? null : +(+v).toFixed(3)), gf = k => rf ? (rf[k] || []).map(v => v == null ? null : +(+v).toFixed(3)) : null;
    const S = (n, k, c) => ({ n, v: g(k), c }), F = (n, k, c) => rf ? { n, v: gf(k), c, dash: true } : null, sum = (ks) => r[ks[0]].map((_, i) => +ks.reduce((a, k) => a + (r[k] && r[k][i] || 0), 0).toFixed(3));
    const C = (t, u, ser) => ({ t, u, ser: ser.filter(Boolean) });
    let out = [];
    if (id === 'yby') out = [C('Irrigation', 'mm', [S('irrigated', 'I', '#2E7DE8')]), C('Drainage below 1 m', 'mm', [S('irrigated', 'D', '#5AA0E1'), F('rainfed', 'D', '#1B1F23')]), C(r.lib ? 'Relative yield' : 'Grain yield', r.lib ? '%' : 'Mg/ha', [S('irrigated', 'Y', '#B8862E'), F('rainfed', 'Y', '#1B1F23')]), C('Nitrate leaching below 1 m', 'kg N/ha', [S('irrigated', 'NL', '#8E5A2A')]), C('Evapotranspiration', 'mm', [S('irrigated', 'ET', '#E8912D')]), C('Days of crop water stress', 'days', [S('irrigated', 'WS', '#D93025'), F('rainfed', 'WS', '#1B1F23')]), C('Salt in the root zone (ECe)', 'dS/m', [{ n: 'season mean', v: r.EC.map(v => +v.toFixed(2)), c: '#8E7A2A' }]), C('Wilting point of the season', '% by volume', [{ n: 'season mean', v: r.WPm.map(v => +v.toFixed(2)), c: '#B23A2E' }])];
    else if (id === 'wb2') out = [C('Rain and irrigation', 'mm', [S('rain', 'P', '#5AA0E1'), S('irrigation', 'I', '#2E7DE8')]), C('Transpiration and soil evaporation', 'mm', [S('transpiration', 'T', '#2E8B57'), S('soil evaporation', 'Es', '#C77D1A')]), C('Other evaporation', 'mm', [{ n: 'canopy, litter, ponds, snow', v: sum(['Ec', 'El', 'Ep', 'Esn']), c: '#8A8F98' }]), C('Drainage below 1 m', 'mm', [S('all', 'D', '#3A5FCD'), S('through biopores', 'Dbio', '#7FAFD0')]), C('Surface runoff', 'mm', [S('runoff', 'RO', '#B8743A')])];
    else if (id === 'nb') out = [C('Nitrogen supplied', 'kg N/ha', [S('fertiliser', 'Nfert', '#2E8B57'), S('mineralised', 'Nmin', '#8E5A2A')]), C('Nitrogen taken up by the crop', 'kg N/ha', [S('uptake', 'Nup', '#B8862E')]), C('Nitrogen lost', 'kg N/ha', [S('leaching', 'NL', '#3A5FCD'), S('volatilisation', 'Nvol', '#C77D1A'), S('denitrification', 'Nden', '#7A5AA8')])];
    return { years: Y, charts: out, sel: (typeof yearNow === 'function' ? yearNow() : null) };
  };
  const adjRun0 = function (pk, rainfed) {
    const r0 = rainfed ? pk.rainfed : pk.r; if (!r0) return null;
    const vff = VFF_VALUES[state.vffIdx], rain = RAIN_VALUES[state.rainIdx], dT = TEMP_VALUES[state.tempIdx], nR = NRATE_VALUES[state.nIdx] / 100;
    const ref = model(vff, 1.0, { noCrop: true, tempIdx: TEMP_VALUES.indexOf(0), nIdx: NRATE_VALUES.indexOf(100) }), cur = model(vff, rain);
    const lib = !!(CROPS[state.crop] && CROPS[state.crop].lib), q = (a, b) => Math.abs(b) > 1e-6 ? clampN(a / b, 0, 6) : 1;
    const c = lib ? CWB(state.crop, { rainfed: !!rainfed }) : null, cr = lib ? CWB('__ref', { rainfed: !!rainfed }) : null;
    const fT = q(cur.transp, ref.transp), fEs = q(cur.evap, ref.evap), fO = q(cur.other, ref.other), fNL = q(cur.nl, ref.nl), fY = lib ? q(c.mean.RY, cr.mean.RY) : q(cur.yield, ref.yield);
    const fE0 = 1 + 0.035 * dT, fK = lib ? q(c.mean.ETc, cr.mean.ETc) : 1;
    const o = { crop: r0.crop }, mp = (k, g) => { o[k] = (r0[k] || []).map((v, i) => v == null ? v : g(v, i)); };
    mp('P', v => v * rain);
    if (rainfed) mp('I', () => 0);
    else if (lib && cr.mean.I > 5) { const raw = r0.I.map((v, i) => v * (cr.I[i] > 5 ? c.I[i] / cr.I[i] : c.mean.I / cr.mean.I)), m = mean(raw); mp('I', (v, i) => m > 0 ? raw[i] * cur.irr / m : 0); }
    else { const fI = q(cur.irr, ref.irr); mp('I', v => v * fI); }
    const mD = mean(r0.D), dD = cur.drain - ref.drain;
    mp('D', v => mD > 5 && ref.drain > 5 && cur.drain > 0 ? v * cur.drain / ref.drain : v + dD);
    mp('Dbio', (v, i) => r0.D[i] > 1e-6 ? v * o.D[i] / r0.D[i] : v);
    mp('T', v => v * fT); mp('Es', v => v * fEs); ['Ec', 'El', 'Ep', 'Esn'].forEach(k => mp(k, v => v * fO));
    mp('ET', (v, i) => o.T[i] + o.Es[i] + o.Ec[i] + o.El[i] + o.Ep[i] + o.Esn[i] + (v - (r0.T[i] + r0.Es[i] + r0.Ec[i] + r0.El[i] + r0.Ep[i] + r0.Esn[i])));
    mp('ET0', v => v * fE0); mp('PET', v => v * fE0 * fK); mp('PT', v => v * fE0 * fK);
    mp('RO', v => v * rain * rain);
    mp('Imat', (v, i) => { const a = r0.P[i] + r0.I[i]; return a > 0 ? v * (o.P[i] + o.I[i]) / a : v; }); mp('Imac', (v, i) => { const a = r0.P[i] + r0.I[i]; return a > 0 ? v * (o.P[i] + o.I[i]) / a : v; });
    mp('NL', v => v * fNL); mp('Nfert', v => v * nR); mp('Nvol', v => v * nR); mp('Nden', v => v * Math.sqrt(nR)); mp('Nmin', v => v); mp('Nup', v => v * fY);
    o.EC = lib ? c.EC.slice() : new Array(20).fill(+state.salt0 || 0); o.WPm = lib ? c.WP.map(v => v * 100) : new Array(20).fill(0); o.FCm = lib ? c.FC.map(v => v * 100) : new Array(20).fill(0); o.tol = lib ? c.tol : null;
    if (lib) { const ry = c.RY, k = cur.yield / Math.max(1e-6, 100 * c.mean.RY); mp('Y', (v, i) => 100 * ry[i] * k); mp('WS', (v, i) => c.stress[i]); }
    else { mp('Y', v => v * fY); mp('WS', v => v); }
    ['stem', 'leaf'].forEach(k => mp(k, v => v * fY)); mp('HI', v => v);
    if (lib) {          // the crop of the twenty seasons: the daily FAO-56 balance of that crop on this soil, structure, salt, weather, trigger, method and mulch, season by season
      for (let i = 0; i < 20; i++) { o.I[i] = c.I[i]; o.P[i] = c.P[i]; o.D[i] = c.DP[i]; o.RO[i] = c.RO[i]; const ks = ['T', 'Es', 'Ec', 'El', 'Ep', 'Esn'], tot = ks.reduce((s, k) => s + o[k][i], 0) || 1, f = c.ETa[i] / tot; ks.forEach(k => { o[k][i] *= f; }); o.ET[i] = c.ETa[i]; o.Y[i] = 100 * c.RY[i]; o.WS[i] = c.stress[i]; }
      mp('Dbio', (v, i) => r0.D[i] > 1e-6 ? v * o.D[i] / r0.D[i] : v);
    }
    const notes = []; if (Math.abs(rain - 1) > 1e-6) notes.push('rainfall ×' + rain.toFixed(1)); if (Math.abs(dT) > 1e-6) notes.push((dT > 0 ? '+' : '') + dT.toFixed(1) + ' °C'); if (Math.abs(nR - 1) > 1e-6) notes.push('nitrogen ' + Math.round(nR * 100) + ' %'); if (lib) notes.push(CROPS[state.crop].label.toLowerCase() + ' (crop coefficients)');
    o.yUnit = lib ? '% of potential' : 'Mg/ha'; o.lib = lib; o.notes = notes; return o;
  };
  // the adjustments run with the crop of the twenty seasons in place of the project crop, so the whole model answers for that crop
  window.adjRun = function (pk, rainfed) { const k = yrKey(); if (k === state.crop) return adjRun0(pk, rainfed); const s = state.crop; state.crop = k; try { return adjRun0(pk, rainfed); } finally { state.crop = s; } };
  const adjText = (pk, r) => 'The simulated seasons of ' + pk.why.charAt(0).toLowerCase() + pk.why.slice(1) + (r.notes.length ? '; set to your ' + r.notes.join(', ') : '');

  // ------------------------------------------------------------------ small chart kit
  function frame(x, y, w, h, title, sub) {
    ctx.fillStyle = PANEL; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = '#ECE9E0'; ctx.fillRect(x + 1, y + 1, w - 2, 20); ctx.strokeStyle = '#D2CEC2'; ctx.beginPath(); ctx.moveTo(x, y + 21.5); ctx.lineTo(x + w, y + 21.5); ctx.stroke();
    ctx.font = 'bold 11px sans-serif'; const tw = Math.min(w * 0.62, ctx.measureText(title).width); TF(title, x + 8, y + 15, w * 0.62, { s: 11, b: true, c: HEAD }); if (sub) TF(sub, x + w - 8, y + 15, w - tw - 28, { s: 9, c: MUTE, a: 'right' });
  }
  function yAxis(x0, y0, w, h, lo, hi, unit, ticks) {
    ctx.strokeStyle = GRID; ctx.lineWidth = 1; const n = ticks || 4;
    for (let i = 0; i <= n; i++) { const v = lo + (hi - lo) * i / n, y = y0 + h - h * i / n; ctx.beginPath(); ctx.moveTo(x0, y + 0.5); ctx.lineTo(x0 + w, y + 0.5); ctx.stroke(); T(fmt(v, Math.abs(hi - lo) < 5 ? 1 : 0), x0 - 4, y + 3, { s: 8.5, c: MUTE, a: 'right' }); }
    if (unit) T(unit, x0 - 4, y0 - 5, { s: 8.5, c: MUTE, a: 'right' });
  }
  const nice = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(q => f <= q + 1e-9) || 10) * p; };
  // text that shrinks to fit its width (down to 7 px), then is shortened
  const TF = (txt, x, y, maxW, o) => { if (typeof maxW === 'object') { o = maxW; maxW = null; } if (maxW == null) maxW = W - x - 12; o = Object.assign({}, o || {}); let sz = o.s || 11; ctx.font = (o.b ? 'bold ' : '') + sz + 'px sans-serif'; while (ctx.measureText(txt).width > maxW && sz > 7) { sz -= 0.5; ctx.font = (o.b ? 'bold ' : '') + sz + 'px sans-serif'; } let t = txt; while (ctx.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2); if (t !== txt) t = t.slice(0, -1) + '…'; o.s = sz; T(t, x, y, o); };
  function yearBars(x, y, w, h, vals, o) {
    o = o || {}; const n = vals.length, vmin = Math.min(0, ...vals, ...(o.extra || []).filter(v => v != null)), lo = o.lo != null ? o.lo : (vmin > -0.06 * Math.max(...vals.map(Math.abs), 1) ? 0 : -nice(-vmin)), hi = nice(Math.max(o.hiMin || 0, ...vals.map(Math.abs), ...(o.extra || []).filter(v => v != null)) * 1.05);
    const x0 = x + 42, y0 = y + 30, ww = w - 54, hh = h - 64; yAxis(x0, y0, ww, hh, lo, hi, o.unit);
    const bw = ww / n, sel = yearNow(), m = mean(vals), p10 = pct(vals, 0.1), p90 = pct(vals, 0.9), Y = v => y0 + hh - (v - lo) / (hi - lo) * hh;
    ctx.fillStyle = 'rgba(46,125,232,0.08)'; ctx.fillRect(x0, Y(p90), ww, Y(p10) - Y(p90));
    vals.forEach((v, i) => {
      const bx = x0 + i * bw + bw * 0.15, top = Y(Math.max(v, 0)), bot = Y(Math.min(v, 0));
      ctx.fillStyle = i === sel ? '#D93025' : (o.colors ? o.colors[i] : (o.col || '#2E7DE8')); ctx.fillRect(bx, top, bw * 0.7, Math.max(1, bot - top));
      if (o.overlay && o.overlay[i] != null) { ctx.fillStyle = '#1B1F23'; ctx.beginPath(); ctx.arc(bx + bw * 0.35, Math.max(y0 + 3, Math.min(y0 + hh - 3, Y(o.overlay[i]))), 2.6, 0, Math.PI * 2); ctx.fill(); }
      if (o.line && o.line[i] != null) { ctx.strokeStyle = '#7B2FA8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - bw * 0.1, Y(o.line[i])); ctx.lineTo(bx + bw * 0.8, Y(o.line[i])); ctx.stroke(); }
      hot(bx, y0, bw * 0.7, hh, () => setYear(i), YRS()[i] + ': ' + fmt(v, o.dec) + ' ' + (o.unit || ''));
      if (i % 4 === 0 || i === n - 1) T(YRS()[i] || '', bx + bw * 0.35, y0 + hh + 12, { s: 8, c: MUTE, a: 'center' });
    });
    ctx.strokeStyle = '#1B1F23'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, Y(m)); ctx.lineTo(x0 + ww, Y(m)); ctx.stroke(); ctx.setLineDash([]);
    const cv = m !== 0 ? sd(vals) / Math.abs(m) : 0;
    TF('mean ' + fmt(m, o.dec) + ' · 10–90 %: ' + fmt(p10, o.dec) + ' to ' + fmt(p90, o.dec) + ' · variation ' + fmt(cv * 100) + ' %', x + 8, y + h - 10, w - 16, { s: 9.5, c: INK });
    return { m, p10, p90, cv };
  }
  function legend(items, x, y) { let xx = x; items.forEach(([c, t]) => { ctx.font = '9.5px sans-serif'; if (xx > x && xx + ctx.measureText(t).width + 16 > W - 40) { xx = x; y += 14; } ctx.fillStyle = c; ctx.fillRect(xx, y - 8, 10, 10); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.strokeRect(xx + 0.5, y - 7.5, 9, 9); T(t, xx + 14, y + 1, { s: 9.5 }); ctx.font = '9.5px sans-serif'; xx += ctx.measureText(t).width + 30; }); return y; }
  function header(title, sub, y) { TF(title, 16, y + 18, W - 32, { s: 16, b: true, c: HEAD }); if (sub) TF(sub, 16, y + 36, W - 32, { s: 10.5, c: MUTE }); return y + 48; }
  function badge(txt, x, y, col) { ctx.font = 'bold 9px sans-serif'; const w = ctx.measureText(txt).width + 10; ctx.fillStyle = col || '#1E8E3E'; rrect(x, y - 10, w, 14, 7); ctx.fill(); T(txt, x + 5, y + 1, { s: 9, b: true, c: '#fff' }); return w; }
  const noData = (y) => { T('Loading the year-by-year results...', 16, y + 30, { s: 12, c: MUTE }); return y + 60; };

  // ================================================================== Y1 Year by year
  function drawYby() {
    paper(); let y = header('Year by year: how reliable is this setting?', DATA.soil_labels[state.soil] + ' · ' + yrLabel() + ' · 20 seasons, ' + YRS()[0] + ' to ' + YRS()[19] + ' (on the calendar of the working date)', 4);
    const pk = pickRun(); if (!pk) { noData(y); return; }
    const r = adjRun(pk), rf = adjRun(pk, true);
    let bx = 16 + badge('YOUR DATA', 16, y, '#1E8E3E') + 8; { const nl = sidWrap(adjText(pk, r) + '. The red bar is the year on the clock; click a bar to go to that year.', bx, y + 1, W - 16 - bx, { s: 9.5, c: INK }, 13); y += 14 + 13 * Math.max(0, (nl || 1) - 1); }
    const cw = (W - 44) / 2, ph = 214, cols = r.lib ? r.crop.map(() => '#B8862E') : r.crop.map(c => CROPCOL[c] || '#8A8F98');
    const P = [
      ['Irrigation', 'mm per year', r.I, { col: '#2E7DE8', unit: 'mm' }],
      ['Drainage below 1 m', 'mm per year · black dots: rainfed', r.D, { col: '#5AA0E1', unit: 'mm', overlay: rf ? rf.D : null, extra: rf ? rf.D : [] }],
      [r.lib ? 'Relative yield' : 'Grain yield', (r.lib ? '% of potential' : 'Mg dry matter per ha') + ' · black dots: rainfed', r.Y, { colors: cols, unit: r.lib ? '%' : 'Mg/ha', dec: r.lib ? 0 : 2, overlay: rf ? rf.Y : null, extra: rf ? rf.Y : [] }],
      ['Nitrate leaching below 1 m', 'kg N per ha per year', r.NL, { col: '#8E5A2A', unit: 'kg N', dec: 1 }],
      ['Evapotranspiration', 'mm per year', r.ET, { col: '#E8912D', unit: 'mm' }],
      ['Days of crop water stress', 'days per season', r.WS, { col: '#D93025', unit: 'days', dec: 1, overlay: rf ? rf.WS : null, extra: rf ? rf.WS : [] }],
      ['Salt in the root zone (ECe)', r.tol ? 'dS/m, season mean · yield falls above ' + r.tol.th + ' dS/m' : 'dS/m, season mean', r.EC, { col: '#8E7A2A', unit: 'dS/m', dec: 1 }],
      ['Wilting point of the season', '% by volume, season mean: rises with the salt', r.WPm, { col: '#B23A2E', unit: '%', dec: 1 }],
    ];
    const st = {};
    P.forEach((p, i) => { const x = 16 + (i % 2) * (cw + 12), yy = y + 6 + Math.floor(i / 2) * (ph + 10); frame(x, yy, cw, ph, p[0], p[1]); st[p[0]] = yearBars(x, yy, cw, ph, p[2].map(v => v == null ? 0 : v), p[3]); });
    y += 6 + 4 * (ph + 10);
    legend(r.lib ? [['#B8862E', yrLabel()]] : Object.entries(CROPCOL).map(([k, c]) => [c, k]), 16, y + 8); y += 22;
    // reliability summary
    frame(16, y, W - 32, 150, 'Reliability of this setting over the 20 seasons', 'from the yearly values above');
    const I = r.I, D = r.D, Yv = r.Y, NL = r.NL, mI = mean(I), mY = mean(Yv);
    const rows = [
      ['Irrigation needed in a dry year (9 years in 10 need less)', fmt(pct(I, 0.9)) + ' mm', 'against ' + fmt(mI) + ' mm in an average year'],
      ['Years that need 20 % more irrigation than average', I.filter(v => v > 1.2 * mI).length + ' of 20', 'plan pump, labour and water rights for these'],
      ['Years with more than 50 mm drainage below the roots', D.filter(v => v > 50).length + ' of 20', 'water and nitrate lost to groundwater'],
      ['Years with a yield below 80 % of the average', Yv.filter(v => v < 0.8 * mY).length + ' of 20', 'yield risk at this setting'],
      ['Nitrate leaching in the worst year', fmt(Math.max(...NL), 1) + ' kg N/ha', 'mean ' + fmt(mean(NL), 1) + ' kg N/ha'],
    ];
    rows.forEach((q, i) => { const yy = y + 40 + i * 21; if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(17, yy - 14, W - 34, 21); } T(q[0], 26, yy, { s: 10.5 }); T(q[1], W * 0.62, yy, { s: 10.5, b: true, a: 'right' }); TF(q[2], W * 0.64, yy, { s: 10, c: MUTE }); });
    y += 160;
    // exceedance curve of irrigation
    frame(16, y, W - 32, 220, 'How often a given irrigation is exceeded', 'the 20 seasons sorted from wettest to driest');
    const srt = I.slice().sort((a, b) => b - a), x0 = 70, y0 = y + 34, ww = W - 32 - 76, hh = 150, hi = nice(Math.max(...srt) * 1.05) || 1;
    yAxis(x0, y0, ww, hh, 0, hi, 'mm');
    ctx.strokeStyle = '#2E7DE8'; ctx.lineWidth = 2.4; ctx.beginPath(); srt.forEach((v, i) => { const xx = x0 + ww * (i + 0.5) / srt.length, yy = y0 + hh - v / hi * hh; if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }); ctx.stroke();
    srt.forEach((v, i) => { const xx = x0 + ww * (i + 0.5) / srt.length, yy = y0 + hh - v / hi * hh; ctx.fillStyle = '#2E7DE8'; ctx.beginPath(); ctx.arc(xx, yy, 3, 0, Math.PI * 2); ctx.fill(); });
    [0.1, 0.5, 0.9].forEach(q => { const xx = x0 + ww * q; ctx.strokeStyle = '#B9B4A6'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + hh); ctx.stroke(); ctx.setLineDash([]); T(Math.round(q * 100) + ' % of years exceed', xx, y0 + hh + 14, { s: 9, c: MUTE, a: 'center' }); });
    y += 230;
    return y;
  }

  // ================================================================== W1 Full water balance
  const WBC = { P: '#1F66C8', I: '#2E9EDB', T: '#2E9E4F', Es: '#E8912D', Ec: '#8ACB5A', El: '#B07A3A', Ep: '#5FC3E8', Esn: '#C9D6E8', D: '#2E4F8A', RO: '#7A5AC9' };
  function drawWb2() {
    paper(); let y = header('Full water balance, year by year', DATA.soil_labels[state.soil] + ' · every term of the simulated balance, including evaporation from litter, ponded water and snow', 4);
    const pk = pickRun(); if (!pk) { noData(y); return; }
    const r = adjRun(pk); badge('YOUR DATA', 16, y, '#1E8E3E'); { const nl = sidWrap(adjText(pk, r) + '.', 96, y + 1, W - 112, { s: 9.5, c: INK }, 13); y += 16 + 13 * Math.max(0, (nl || 1) - 1); }
    const n = 20, x0 = 64, ww = W - 32 - 80, hh = 300, top = y + 34;
    frame(16, y, W - 32, hh + 108, 'Where the water comes from (up) and where it goes (down)', 'mm per year');
    let hi = 0; for (let i = 0; i < n; i++) hi = Math.max(hi, r.P[i] + r.I[i], r.T[i] + r.Es[i] + r.Ec[i] + r.El[i] + r.Ep[i] + r.Esn[i] + Math.max(0, r.D[i]) + r.RO[i]); hi = nice(hi * 1.05);
    const mid = top + hh / 2, sc = (hh / 2) / hi, bw = ww / n;
    ctx.strokeStyle = GRID; [-1, -0.5, 0, 0.5, 1].forEach(f => { const yy = mid - f * hh / 2; ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x0 + ww, yy + 0.5); ctx.stroke(); T(fmt(Math.abs(f * hi)), x0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); });
    const sel = yearNow();
    for (let i = 0; i < n; i++) {
      const bx = x0 + i * bw + bw * 0.14, w = bw * 0.72; let up = mid, dn = mid;
      [['P', r.P[i]], ['I', r.I[i]]].forEach(([k, v]) => { const hgt = v * sc; ctx.fillStyle = WBC[k]; ctx.fillRect(bx, up - hgt, w, hgt); up -= hgt; });
      [['T', r.T[i]], ['Es', r.Es[i]], ['Ec', r.Ec[i]], ['El', r.El[i]], ['Ep', r.Ep[i]], ['Esn', r.Esn[i]], ['D', Math.max(0, r.D[i])], ['RO', r.RO[i]]].forEach(([k, v]) => { const hgt = v * sc; ctx.fillStyle = WBC[k]; ctx.fillRect(bx, dn, w, hgt); dn += hgt; });
      if (i === sel) { ctx.strokeStyle = '#D93025'; ctx.lineWidth = 2; ctx.strokeRect(bx - 2, up - 2, w + 4, dn - up + 4); }
      hot(bx, top, w, hh, () => setYear(i), YRS()[i]);
      if (i % 4 === 0 || i === n - 1) T(YRS()[i], bx + w / 2, top + hh + 14, { s: 8, c: MUTE, a: 'center' });
    }
    legend([[WBC.P, 'Precipitation'], [WBC.I, 'Irrigation'], [WBC.T, 'Transpiration'], [WBC.Es, 'Soil evaporation'], [WBC.Ec, 'Canopy (intercepted)']], x0 - 40, top + hh + 40);
    legend([[WBC.El, 'Litter / mulch'], [WBC.Ep, 'Ponded water'], [WBC.Esn, 'Snow'], [WBC.D, 'Drainage below 1 m'], [WBC.RO, 'Surface runoff']], x0 - 40, top + hh + 60);
    y += hh + 118;
    // 20-year mean partition and the closure of ET
    const M = k => mean(r[k]), et = M('ET'), parts = [['Transpiration', M('T'), WBC.T], ['Soil evaporation', M('Es'), WBC.Es], ['Canopy (intercepted)', M('Ec'), WBC.Ec], ['Litter / mulch', M('El'), WBC.El], ['Ponded water', M('Ep'), WBC.Ep], ['Snow', M('Esn'), WBC.Esn]];
    const sum = parts.reduce((a, p) => a + p[1], 0);
    frame(16, y, W - 32, 150, 'Evapotranspiration split into all its parts (20-year mean)', 'the parts add up to the simulated ET');
    let xx = 30; const bwid = W - 32 - 28; parts.forEach(p => { const w = bwid * p[1] / Math.max(1, sum); ctx.fillStyle = p[2]; ctx.fillRect(xx, y + 34, w, 30); if (w > 70) T(fmt(p[1]) + ' mm', xx + w / 2, y + 53, { s: 10, b: true, c: '#fff', a: 'center' }); xx += w; });
    parts.forEach((p, i) => T(p[0] + ': ' + fmt(p[1]) + ' mm (' + fmt(100 * p[1] / et) + ' %)', 30 + (i % 3) * ((W - 60) / 3), y + 88 + Math.floor(i / 3) * 18, { s: 10 }));
    TF('Sum of the parts ' + fmt(sum) + ' mm against simulated ET ' + fmt(et) + ' mm (difference ' + fmt(Math.abs(sum - et), 1) + ' mm). Evaporation from litter, ponded water and snow is ' + fmt(100 * (M('El') + M('Ep') + M('Esn')) / et) + ' % of ET.', 30, y + 136, { s: 10, b: true });
    y += 160;
    // atmosphere: demand against what the field delivered
    frame(16, y, W - 32, 252, 'The atmosphere: reference demand, potential and actual evapotranspiration', 'mm per year');
    const a0 = 64, aw = W - 32 - 80, ah = 160, at = y + 34, ahi = nice(Math.max(...r.ET0, ...r.PET) * 1.05);
    yAxis(a0, at, aw, ah, 0, ahi, 'mm');
    [['ET0', '#D93025', 'Reference evapotranspiration', 2], ['PET', '#E8912D', 'Potential evapotranspiration of this field', 5], ['ET', '#2E9E4F', 'Actual evapotranspiration', 2], ['PT', '#7B2FA8', 'Potential transpiration', 5], ['T', '#1E6B4A', 'Actual transpiration', 2]].forEach(([k, c, l, lw]) => {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.setLineDash(lw > 3 ? [8, 5] : []); ctx.beginPath(); r[k].forEach((v, i) => { const xx2 = a0 + aw * (i + 0.5) / 20, yy = at + ah - v / ahi * ah; if (i) ctx.lineTo(xx2, yy); else ctx.moveTo(xx2, yy); }); ctx.stroke(); ctx.setLineDash([]); });
    legend([['#D93025', 'Reference ET'], ['#E8912D', 'Potential ET'], ['#2E9E4F', 'Actual ET'], ['#7B2FA8', 'Potential transpiration'], ['#1E6B4A', 'Actual transpiration']], a0, at + ah + 26);
    TF('On average the field delivers ' + fmt(100 * M('ET') / M('PET')) + ' % of its potential evapotranspiration and the crop ' + fmt(100 * M('T') / Math.max(1, M('PT'))) + ' % of its potential transpiration.', a0, at + ah + 44, { s: 10, b: true });
    y += 262;
    // infiltration path
    frame(16, y, W - 32, 92, 'How the water enters and leaves the soil', '20-year means');
    const inf = M('Imat') + M('Imac');
    TF('Infiltration through the soil matrix ' + fmt(M('Imat')) + ' mm, through macropores ' + fmt(M('Imac')) + ' mm (' + fmt(100 * M('Imac') / Math.max(1, inf)) + ' % of infiltration)', 30, y + 44, { s: 10.5 });
    TF('Drainage below 1 m ' + fmt(M('D'), 1) + ' mm, of which through biopores ' + fmt(M('Dbio'), 1) + ' mm; surface runoff ' + fmt(M('RO'), 1) + ' mm', 30, y + 66, { s: 10.5 });
    return y + 100;
  }

  // ================================================================== N4 Nitrogen budget
  function drawNb() {
    paper(); let y = header('Nitrogen budget, year by year', DATA.soil_labels[state.soil] + ' · fertiliser and soil supply against crop uptake and losses', 4);
    const pk = pickRun(); if (!pk) { noData(y); return; }
    const r = adjRun(pk); badge('YOUR DATA', 16, y, '#1E8E3E'); { const nl = sidWrap(adjText(pk, r) + '.', 96, y + 1, W - 112, { s: 9.5, c: INK }, 13); y += 16 + 13 * Math.max(0, (nl || 1) - 1); }
    const NC = { fert: '#5B2FA8', min: '#9B7FD6', up: '#2E9E4F', NL: '#8E5A2A', den: '#E8912D', vol: '#B9B4A6' };
    const n = 20, x0 = 64, ww = W - 32 - 80, hh = 280, top = y + 34;
    frame(16, y, W - 32, hh + 100, 'Supply (up) against uptake and losses (down)', 'kg N per ha per year');
    let hi = 0; for (let i = 0; i < n; i++) hi = Math.max(hi, r.Nfert[i] + r.Nmin[i], r.Nup[i] + r.NL[i] + r.Nden[i] + r.Nvol[i]); hi = nice(hi * 1.05);
    const mid = top + hh / 2, sc = (hh / 2) / hi, bw = ww / n, sel = yearNow();
    ctx.strokeStyle = GRID; [-1, -0.5, 0, 0.5, 1].forEach(f => { const yy = mid - f * hh / 2; ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x0 + ww, yy + 0.5); ctx.stroke(); T(fmt(Math.abs(f * hi)), x0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); });
    for (let i = 0; i < n; i++) {
      const bx = x0 + i * bw + bw * 0.14, w = bw * 0.72; let up = mid, dn = mid;
      [['fert', r.Nfert[i]], ['min', r.Nmin[i]]].forEach(([k, v]) => { const hgt = Math.max(0, v) * sc; ctx.fillStyle = NC[k]; ctx.fillRect(bx, up - hgt, w, hgt); up -= hgt; });
      [['up', r.Nup[i]], ['NL', r.NL[i]], ['den', r.Nden[i]], ['vol', r.Nvol[i]]].forEach(([k, v]) => { const hgt = Math.max(0, v) * sc; ctx.fillStyle = NC[k]; ctx.fillRect(bx, dn, w, hgt); dn += hgt; });
      if (i === sel) { ctx.strokeStyle = '#D93025'; ctx.lineWidth = 2; ctx.strokeRect(bx - 2, up - 2, w + 4, dn - up + 4); }
      hot(bx, top, w, hh, () => setYear(i), YRS()[i]); if (i % 4 === 0 || i === n - 1) T(YRS()[i], bx + w / 2, top + hh + 14, { s: 8, c: MUTE, a: 'center' });
    }
    legend([[NC.fert, 'Fertiliser'], [NC.min, 'Mineralisation'], [NC.up, 'Crop uptake'], [NC.NL, 'Leaching below 1 m'], [NC.den, 'Denitrification'], [NC.vol, 'Volatilisation']], x0 - 40, top + hh + 46);
    y += hh + 110;
    const M = k => mean(r[k]), sup = M('Nfert') + M('Nmin');
    frame(16, y, W - 32, 112, 'Nitrogen use (20-year mean)', '');
    TF('Supply ' + fmt(sup) + ' kg N/ha (fertiliser ' + fmt(M('Nfert')) + ', mineralisation ' + fmt(M('Nmin')) + ')', 30, y + 44, { s: 10.5 });
    TF('Crop uptake ' + fmt(M('Nup')) + ' kg N/ha = ' + fmt(100 * M('Nup') / Math.max(1, sup)) + ' % of supply; leaching ' + fmt(M('NL'), 1) + ', denitrification ' + fmt(M('Nden'), 1) + ', volatilisation ' + fmt(M('Nvol'), 1) + ' kg N/ha', 30, y + 66, { s: 10.5 });
    TF('Nitrogen lost by leaching: ' + fmt(100 * M('NL') / Math.max(1, M('Nfert'))) + ' % of the fertiliser', 30, y + 88, { s: 10.5, b: true });
    y += 122;
    // leaching against drainage, the 20 years
    frame(16, y, W - 32, 270, 'Nitrate goes where the water goes', 'each dot is one season: drainage below 1 m against nitrate leached');
    const D = r.D, L = r.NL, sx0 = 70, sw = W - 32 - 90, st0 = y + 34, sh = 170, dx = nice(Math.max(...D, 1) * 1.05), lx = nice(Math.max(...L, 1) * 1.05), dmin = Math.min(0, ...D);
    yAxis(sx0, st0, sw, sh, 0, lx, 'kg N'); { const stp = nice((dx - dmin) / 5); for (let v = Math.ceil(dmin / stp) * stp; v <= dx + 1e-9; v += stp) T(fmt(v), sx0 + (v - dmin) / (dx - dmin) * sw, st0 + sh + 14, { s: 8.5, c: MUTE, a: 'center' }); } T('drainage (mm)', sx0 + sw / 2, st0 + sh + 28, { s: 9, c: MUTE, a: 'center' });
    const mx = mean(D), my = mean(L); let sxy = 0, sxx = 0; D.forEach((d, i) => { sxy += (d - mx) * (L[i] - my); sxx += (d - mx) * (d - mx); }); const sl = sxx > 0 ? sxy / sxx : 0;
    const X = d => sx0 + (d - dmin) / (dx - dmin) * sw, Yv = v => st0 + sh - v / lx * sh;
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(X(dmin), Yv(Math.max(0, my + sl * (dmin - mx)))); ctx.lineTo(X(dx), Yv(Math.max(0, my + sl * (dx - mx)))); ctx.stroke(); ctx.setLineDash([]);
    D.forEach((d, i) => { ctx.fillStyle = i === sel ? '#D93025' : '#8E5A2A'; ctx.beginPath(); ctx.arc(X(d), Yv(L[i]), 4, 0, Math.PI * 2); ctx.fill(); hot(X(d) - 5, Yv(L[i]) - 5, 10, 10, () => setYear(i), YRS()[i] + ': ' + fmt(d) + ' mm, ' + fmt(L[i], 1) + ' kg N'); });
    TF('Across these seasons each extra millimetre of drainage carries ' + fmt(sl, 2) + ' kg N/ha of nitrate.', sx0, y + 258, { s: 10.5, b: true });
    return y + 280;
  }

  // ================================================================== C1 Crop water requirement
  const CUI = { year: null };
  function drawCrop() {
    paper(); let y = header('Crop water requirement', DATA.soil_labels[state.soil] + ' · choose the crop in Settings (Crop) · crop coefficients, growth stages, rooting depth and yield response of each crop', 4);
    const lib = window.CROPLIB, key = lib.crops[state.crop] ? state.crop : 'wheat', pp = lib.params(key, state.densIdx, state.plantDoy), c = CWB(key, { daily: true }), dly = c.daily;
    if (!lib.crops[state.crop]) { badge('NOTE', 16, y, '#8A8F98'); TF('The cereal rotation is selected: the curves below show wheat. Pick any crop in Settings to see its own.', 60, y + 1, { s: 10 }); y += 18; }
    // controls drawn on the canvas: density, planting date
    let cx = 16; const btn = (t, on, fn, tip) => { ctx.font = 'bold 10px sans-serif'; const w = ctx.measureText(t).width + 18; if (cx + w > W - 12) { cx = 16; y += 28; } ctx.fillStyle = on ? '#2E7DE8' : '#F2F0EA'; ctx.strokeStyle = on ? '#1B5FC0' : '#B9B4A6'; ctx.lineWidth = 1; ctx.fillRect(cx, y, w, 22); ctx.strokeRect(cx + 0.5, y + 0.5, w - 1, 21); T(t, cx + w / 2, y + 15, { s: 10, b: true, c: on ? '#fff' : INK, a: 'center' }); hot(cx, y, w, 22, fn, tip); cx += w + 6; };
    T(pp.label, 16, y + 15, { s: 13, b: true, c: '#2F7F3E' }); ctx.font = 'bold 13px sans-serif'; cx = 24 + ctx.measureText(pp.label).width;
    if (pp.c.group === 'perennial') pp.c.densities.forEach((d, i) => btn(d[0], (state.densIdx == null ? Math.floor((pp.c.densities.length - 1) / 2) : state.densIdx) === i, () => { state.densIdx = i; refresh(); }, 'planting density / training: ground cover ' + d[1] + ', height ' + d[2] + ' m'));
    else { btn('Plant 2 weeks earlier', false, () => { state.plantDoy = clampN(state.plantDoy - 14, 60, 250); refresh(); }); btn('Plant 2 weeks later', false, () => { state.plantDoy = clampN(state.plantDoy + 14, 60, 250); refresh(); }); T('planted ' + dateStr(pp.sow), cx + 4, y + 15, { s: 10.5, b: true }); }
    y += 32;
    // tiles
    // the irrigation, water use, drainage and yield shown here are the results of the whole program at your settings
    // (Daisy, transferred to the crop), so they follow every control: soil, tillage, consolidation, mulch, rain, warming,
    // method, trigger, sensor depth and nitrogen; the crop curves and the root-zone depletion are the FAO-56 balance
    const cur = current, isL = !!(CROPS[state.crop] && CROPS[state.crop].lib), gSel = c.mean.I > 1 ? cur.irr / c.mean.I : 1;
    const mNo = model(VFF_VALUES[state.vffIdx], RAIN_VALUES[state.rainIdx], { noCrop: true }), rref = CWB('__ref'), gI = rref.mean.I > 1 ? mNo.irr / rref.mean.I : 1;
    const nRef = model(VFF_VALUES[state.vffIdx], RAIN_VALUES[state.rainIdx], { noCrop: true, nIdx: NRATE_VALUES.indexOf(100) }), gN = nRef.yield > 0 ? clampN(mNo.yield / nRef.yield, 0, 1.5) : 1;
    const tiles = [['Crop water need (ETc)', fmt(c.mean.ETc) + ' mm/yr', 'Kc x reference ET, whole year'], ['Water the crop uses', fmt(cur.transp + cur.evap) + ' mm/yr', 'transpiration ' + fmt(cur.transp) + ' + soil evaporation ' + fmt(cur.evap)], ['Net irrigation', fmt(cur.irr * c.effApp) + ' mm/yr', 'reaching the root zone'], ['Gross irrigation', fmt(cur.irr) + ' mm/yr', 'at ' + fmt(100 * c.effApp) + ' % application efficiency'], ['Irrigations', fmt(c.mean.ev * gSel, 1) + ' per year', 'trigger at ' + fmt(100 * c.fT) + ' % depletion'], isL ? ['Relative yield', fmt(cur.yield) + ' %', 'Ky ' + (pp.ky == null ? 'assumed 1.0' : pp.ky.toFixed(2)) + (gN < 0.999 ? ', nitrogen-limited' : '')] : ['Yield', fmt(cur.yield, 2) + ' Mg/ha', 'Cereal rotation'], ['Drainage below 1 m', fmt(cur.drain) + ' mm/yr', 'nitrate leached ' + fmt(cur.nl, 1) + ' kg N/ha'], ['Stress days', fmt(c.mean.stress, 1) + ' per season', 'soil water below the readily available']];
    const tw = (W - 32 - 3 * 8) / 4;
    tiles.forEach((t, i) => { const x = 16 + (i % 4) * (tw + 8), yy = y + Math.floor(i / 4) * 66; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, yy, tw, 58); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(x + 0.5, yy + 0.5, tw - 1, 57); ctx.fillStyle = '#2E7DE8'; ctx.fillRect(x, yy, 3, 58); T(t[0], x + 10, yy + 16, { s: 9.5, c: MUTE }); T(t[1], x + 10, yy + 36, { s: 15, b: true }); TF(t[2], x + 10, yy + 51, tw - 16, { s: 8.8, c: MUTE }); });
    y += 140;
    // Kc curve and daily ETc
    frame(16, y, W - 32, 230, 'Crop coefficient through the year and the daily water need', 'Kc (left) · ETc in mm per day (right)');
    const kc = lib.kcCurve(pp), x0 = 60, ww = W - 32 - 100, top = y + 36, hh = 150, yr = yearNow(), MON0 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    yAxis(x0, top, ww, hh, 0, 1.4, 'Kc', 7);
    const et0y = d => dly.ETc[yr * DPY + d] / Math.max(0.05, (kc[d] > 0.01 ? kc[d] : 0.25));
    // stage bands
    if (pp.habit !== 'evergreen') { let s0 = pp.sow; const nm = ['initial', 'develop.', 'mid-season', 'late'], col = ['#F4EFE0', '#E8F2DC', '#D6ECCB', '#F0E6D0']; pp.st.forEach((L, i) => { const xa = x0 + ww * s0 / 365, xb = x0 + ww * Math.min(365, s0 + L) / 365; ctx.fillStyle = col[i]; ctx.fillRect(xa, top, xb - xa, hh); ctx.font = '8px sans-serif'; if (ctx.measureText(nm[i]).width < xb - xa - 2) T(nm[i], (xa + xb) / 2, top + 11 + (i % 2) * 10, { s: 8, c: MUTE, a: 'center' }); s0 += L; }); }
    ctx.strokeStyle = '#2E9E4F'; ctx.lineWidth = 2.6; ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = top + hh - kc[d] / 1.4 * hh; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    let emax = 0; for (let d = 0; d < 365; d++) emax = Math.max(emax, dly.ETc[yr * DPY + d]); emax = Math.max(2, Math.ceil(emax * 1.1));
    ctx.strokeStyle = '#E8912D'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = top + hh - dly.ETc[yr * DPY + d] / emax * hh; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    for (let v = 0; v <= emax; v += emax > 8 ? 2 : 1) T(fmt(v), x0 + ww + 6, top + hh - hh * v / emax + 3, { s: 8.5, c: '#E8912D' });
    MON0.forEach((d, i) => T(MON[i], x0 + ww * (d + 15) / 365, top + hh + 14, { s: 8.5, c: MUTE, a: 'center' }));
    legend([['#2E9E4F', 'Kc: ini ' + pp.kcIni.toFixed(2) + ', mid ' + pp.kcMid.toFixed(2) + ', end ' + pp.kcEnd.toFixed(2)], ['#E8912D', 'ETc of ' + YRS()[yr] + ' (mm per day)']], x0, top + hh + 34);
    y += 240;
    // root-zone depletion of the selected year
    frame(16, y, W - 32, 260, 'Root-zone water and the irrigation schedule, ' + YRS()[yr], 'depletion below field capacity, mm · blue bars: irrigation · grey bars: rain');
    const t2 = y + 36, h2 = 170; let dmax = 0; for (let d = 0; d < 365; d++) dmax = Math.max(dmax, dly.TAW[yr * DPY + d]); dmax = nice(dmax * 1.05) || 1;
    for (let i = 0; i <= 4; i++) { const yy = t2 + h2 * i / 4; ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x0 + ww, yy + 0.5); ctx.stroke(); T(fmt(dmax * i / 4), x0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); } T('field capacity', x0 + ww - 4, t2 + 10, { s: 8.5, c: MUTE, a: 'right' }); T('mm below field capacity', x0 + 4, t2 - 5, { s: 8.5, c: MUTE });
    ctx.fillStyle = 'rgba(217,48,37,0.10)'; ctx.beginPath(); ctx.moveTo(x0, t2 + h2); for (let d = 0; d < 365; d++) ctx.lineTo(x0 + ww * d / 365, t2 + dly.RAW[yr * DPY + d] / dmax * h2); ctx.lineTo(x0 + ww, t2 + h2); ctx.closePath();
    ctx.strokeStyle = '#D93025'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = t2 + dly.RAW[yr * DPY + d] / dmax * h2; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.strokeStyle = '#5B2FA8'; ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = t2 + c.fT * dly.TAW[yr * DPY + d] / dmax * h2; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.strokeStyle = '#1B1F23'; ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = t2 + dly.TAW[yr * DPY + d] / dmax * h2; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 2; ctx.beginPath(); for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, yy = t2 + dly.Dr[yr * DPY + d] / dmax * h2; if (d) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    let pm = 1; for (let d = 0; d < 365; d++) pm = Math.max(pm, dly.P[yr * DPY + d], dly.I[yr * DPY + d] * gSel);
    for (let d = 0; d < 365; d++) { const xx = x0 + ww * d / 365, pr = dly.P[yr * DPY + d], ir = dly.I[yr * DPY + d] * gSel; if (pr > 0.2) { ctx.fillStyle = '#9AA3AE'; ctx.fillRect(xx, t2, Math.max(1, ww / 365), pr / pm * 40); } if (ir > 0) { ctx.fillStyle = '#2E7DE8'; ctx.fillRect(xx - 1, t2, 3, ir / pm * 40); } }
    MON0.forEach((d, i) => T(MON[i], x0 + ww * (d + 15) / 365, t2 + h2 + 14, { s: 8.5, c: MUTE, a: 'center' }));
    legend([['#8E5A2A', 'depletion of the root zone'], ['#5B2FA8', 'trigger (' + fmt(100 * c.fT) + ' % of available water)'], ['#D93025', 'readily available water (stress beyond)'], ['#1B1F23', 'total available water']], x0, t2 + h2 + 34);
    y += 270;
    // every crop for this soil
    const keys = lib.FIELD.concat(lib.PERENNIAL), rows = keys.map(k => { const o = CWB(k); return [k, lib.params(k, null, state.plantDoy).label, o.mean.ETc, o.mean.In * gI, o.mean.ev * gI, o.mean.RY * gN]; }).sort((a, b) => b[3] - a[3]);
    const rh = 19, th = 40 + rows.length * rh; frame(16, y, W - 32, th, 'Every crop in the library on this soil', 'net irrigation, highest first · tap a row to choose the crop');
    const cols = [30, W * 0.42, W * 0.58, W * 0.74, W * 0.9]; T('Crop', cols[0], y + 36, { s: 9.5, b: true, c: MUTE }); T('ETc (mm/yr)', cols[1], y + 36, { s: 9.5, b: true, c: MUTE, a: 'right' }); T('Net irrigation (mm/yr)', cols[2], y + 36, { s: 9.5, b: true, c: MUTE, a: 'right' }); T('Irrigations per year', cols[3], y + 36, { s: 9.5, b: true, c: MUTE, a: 'right' }); T('Relative yield', cols[4], y + 36, { s: 9.5, b: true, c: MUTE, a: 'right' });
    const imax = Math.max(...rows.map(r => r[3]), 1);
    rows.forEach((r, i) => { const yy = y + 40 + (i + 1) * rh - 4; if (r[0] === key) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 14, W - 34, rh); } else if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(17, yy - 14, W - 34, rh); }
      ctx.fillStyle = 'rgba(46,125,232,0.18)'; ctx.fillRect(cols[1] + 12, yy - 11, (cols[2] - cols[1] - 60) * r[3] / imax, 12);
      T(r[1], cols[0], yy, { s: 10 }); T(fmt(r[2]), cols[1], yy, { s: 10, a: 'right' }); T(fmt(r[3]), cols[2], yy, { s: 10, b: true, a: 'right' }); T(fmt(r[4], 1), cols[3], yy, { s: 10, a: 'right' }); T(fmt(100 * r[5]) + ' %', cols[4], yy, { s: 10, a: 'right' });
      hot(17, yy - 14, W - 34, rh, () => applyState({ crop: r[0] }), 'choose ' + r[1]); });
    return y + th + 10;
  }

  // ------------------------------------------------------------------ register the four views
  // the list of views of the web explorer is built before these layers are added, so each layer gets its button in its group
  const GRPN = { yby: 'Year by year', wb2: 'Year by year', nb: 'Year by year', crop: 'Crops', chem: 'Chemicals', dsum: 'Daisy decision support' };
  function sceneButton(sc) {
    const bar = document.getElementById('sceneBar'); if (!bar || bar.querySelector('[data-scene="' + sc.id + '"]')) return;
    const b = document.createElement('div'), mm = sc.label.match(/^([A-Z]\d)\s+(.*)$/); b.className = 'scenebtn'; b.innerHTML = '<span class="no">' + (mm ? mm[1] : '') + '</span><span>' + (mm ? mm[2] : sc.label) + '</span>'; b.style.setProperty('--sc', sc.color); b.dataset.scene = sc.id; b.title = sc.title || ''; b.onclick = () => switchScene(sc);
    const h = Array.from(bar.querySelectorAll('.scenegrp')).find(x => x.textContent === GRPN[sc.id]); if (!h) { bar.appendChild(b); return; }
    let n = h.nextSibling; while (n && !(n.classList && n.classList.contains('scenegrp'))) n = n.nextSibling; bar.insertBefore(b, n);
  }
  const add = (id, label, color, draw, title, insight) => { if (SCENES.some(s => s.id === id)) return; SCENES.push({ id, label, color, h: 1200, interactive: true, onDown: p => hotDown(p), onMove: p => { hotMove(p); return false; }, onLeave: () => { hotUi.hover = null; }, draw, title, legend: [], insight }); };
  add('yby', 'Y1 Year by year', '#2E7DE8', drawYby, 'Year by year: reliability of the current setting over 20 seasons', 'Twenty seasons of real weather: the spread between years is as important as the average for planning water, labour and nitrogen.');
  add('wb2', 'W1 Full water balance', '#1F66C8', drawWb2, 'Every term of the simulated water balance, year by year', 'With evaporation from litter, ponded water and snow included, the parts of evapotranspiration add up to the simulated total.');
  add('nb', 'N4 Nitrogen budget', '#8E5A2A', drawNb, 'Nitrogen supply, uptake and losses, year by year', 'Nitrate leaching follows drainage: the wet years carry most of the nitrogen lost below the roots.');
  add('crop', 'C1 Crop water requirement', '#2F7F3E', drawCrop, 'Crop coefficients, daily water need and the irrigation schedule of the chosen crop', 'Each crop has its own season, crop coefficient and rooting depth: the same soil and weather give very different irrigation needs.');
  { const c1 = SCENES.find(s => s.id === 'crop'); if (c1) c1.h = 1760; }   // its full height from the first frame (the schedule fills in as the daily model runs)
  // peryear.js is large: load it after the engine has started
  if (!window.PERYEAR) { const sc = document.createElement('script'); sc.src = 'peryear.js'; sc.onload = () => { try { refresh(); } catch (e) {} }; document.body.appendChild(sc); }
  SCENES.forEach(sc => { if (GRPN[sc.id]) { try { sceneButton(sc); } catch (e) { } } });
  window.PLUSKIT = { frame, yAxis, nice, TF, legend, header, badge, fmt, mean, sd, add, YRS, sceneButton };   // the chart kit, used by plus_daisy.js
})();
