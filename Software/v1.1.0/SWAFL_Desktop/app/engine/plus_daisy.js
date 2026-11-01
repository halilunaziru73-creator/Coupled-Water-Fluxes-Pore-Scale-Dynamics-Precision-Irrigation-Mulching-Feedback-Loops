/* SWAFL 1.1 decision-support layers on Daisy output:
   C2 Chemical fate (what happens to a chemical applied to the field: decay, crop uptake, leaching, runoff, what stays in the soil) and
   D1 Daisy decision table (what irrigation, the nitrogen rate and the climate do to yield, water and nitrate).
   Data: window.DAISYLIVE, the runs just made in the Daisy workbench. Nothing is drawn without a run. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || !window.PLUSKIT) return;
  const K = window.PLUSKIT, HEAD = '#1B1F23', PANEL = '#FFFFFF', GRID = '#E6E2D6';
  const SPEC = ['#2b83ba', '#5aa6b4', '#8fcfa6', '#c4e6a8', '#ffffbf', '#fee08b', '#fdae61', '#f46d43', '#d53e4f'];
  const mean = a => { const v = (a || []).filter(isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN; };
  const fmt = (v, d) => v == null || !isFinite(v) ? 'n/a' : (+v).toFixed(d == null ? 0 : d);
  const CH = { v: 'sorb', yr: null }, DD = {};
  const SHORTV = { mobile: 'Mobile tracer', sorb: 'Sorbing, K_OC 100', decay: 'Sorbing and degrading' };
  const VARS = { mobile: 'Mobile tracer (no sorption, no decay)', sorb: 'Sorbing (K_OC 100)', decay: 'Sorbing and degrading (K_OC 100, half-life 30 days)' };
  const ALIAS = { n100: 'rainfed', now: 'rainfed' };
  const D = () => null, L = () => window.DAISYLIVE;   // no bundled runs: a figure is drawn only from a run made in the Daisy workbench
  // a run: the one you made in the workbench if there is one for it, else the bundled run of the soil of the project
  function getRun(v) {
    const live = L(); const k = ALIAS[v] || v;
    if (live && live.runs && (live.runs[v] || live.runs[k])) return { r: live.runs[v] || live.runs[k], src: 'your run', label: live.label || '' };
    const d = D(); if (!d) return null; const r = d.runs[state.soil + '__' + k]; return r ? { r, src: 'bundled', label: d.weather } : null;
  }
  const texLabel = () => { const t = DATA.texture[state.soil]; return DATA.soil_labels[state.soil] + ' (' + t.sand + ' % sand, ' + t.silt + ' % silt, ' + t.clay + ' % clay)'; };
  const seasonLabel = i => String((D() ? D().first : 1979) + i);
  const yieldSeries = r => { if (!r || !r.harvest || !r.year) return []; return r.year.map(y => { const hs = r.harvest.filter(h => h[0] === y - 1); return hs.length ? hs.reduce((s, h) => s + h[2], 0) : NaN; }); };
  const cropSeries = r => r.year.map(y => { const hs = (r.harvest || []).filter(h => h[0] === y - 1); return hs.length ? hs[0][1] : ''; });
  const waiting = y => { K.header('No Daisy run yet', 'It appears when its question is run: Daisy model, Scenarios, Run.', y); return y + 60; };
  function fit(y) { try { if (Math.abs(currentScene.h - (y + 24)) > 4) { currentScene.h = Math.ceil(y + 24); setCanvasH(currentScene.h); } } catch (e) { } }
  function stackBars(x, y, w, h, labels, parts, o) {   // parts: [{n, c, v:[...]}] stacked upward
    o = o || {}; const n = labels.length, tot = labels.map((_, i) => parts.reduce((s, p) => s + Math.max(0, p.v[i] || 0), 0)), hi = K.nice(Math.max(o.hiMin || 0, ...tot) * 1.05), x0 = x + 48, y0 = y + 28, ww = w - 60, hh = h - 62;
    K.yAxis(x0, y0, ww, hh, 0, hi, o.unit); const bw = ww / n;
    labels.forEach((lb, i) => { const bx = x0 + i * bw + bw * 0.14; let top = y0 + hh; parts.forEach(p => { const v = Math.max(0, p.v[i] || 0), hgt = v / hi * hh; ctx.fillStyle = p.c; ctx.fillRect(bx, top - hgt, bw * 0.72, hgt); top -= hgt; });
      if (o.mark && o.mark[i] != null) { const yy = y0 + hh - o.mark[i] / hi * hh; ctx.strokeStyle = HEAD; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 2, yy); ctx.lineTo(bx + bw * 0.72 + 2, yy); ctx.stroke(); }
      hot(bx, y0, bw * 0.72, hh, () => { CH.yr = i; }, lb + ': ' + parts.map(p => p.n + ' ' + fmt(p.v[i], hi < 5 ? 2 : 1)).join(', ')); if (i % 3 === 0 || i === n - 1) T(lb, bx + bw * 0.36, y0 + hh + 12, { s: 8, c: MUTE, a: 'center' }); });
    return { x0, y0, ww, hh, hi };
  }
  function groupBars(x, y, w, h, labels, series, o) {
    o = o || {}; const n = labels.length, all = [].concat(...series.map(s => s.v.filter(isFinite))), hi = K.nice(Math.max(1, ...all) * 1.05), x0 = x + 48, y0 = y + 28, ww = w - 60, hh = h - 62; K.yAxis(x0, y0, ww, hh, 0, hi, o.unit); const bw = ww / n, m = series.length;
    labels.forEach((lb, i) => { series.forEach((s, k) => { const v = s.v[i]; if (!isFinite(v)) return; const bx = x0 + i * bw + bw * 0.1 + k * bw * 0.8 / m, hgt = v / hi * hh; ctx.fillStyle = s.c; ctx.fillRect(bx, y0 + hh - hgt, bw * 0.8 / m, hgt); hot(bx, y0, bw * 0.8 / m, hh, () => { }, lb + ' ' + s.n + ': ' + fmt(v, hi < 5 ? 2 : 1) + ' ' + (o.unit || '')); }); if (i % 3 === 0 || i === n - 1) T(lb, x0 + i * bw + bw / 2, y0 + hh + 12, { s: 8, c: MUTE, a: 'center' }); });
    return { x0, y0, ww, hh, hi };
  }
  const chip = (x, y, text, on, fn, tip) => { ctx.font = '10.5px sans-serif'; const w = ctx.measureText(text).width + 18; ctx.fillStyle = on ? '#1B3A6B' : '#EFEDE5'; rrect(x, y, w, 22, 11); ctx.fill(); ctx.strokeStyle = on ? '#1B3A6B' : '#B9B4A6'; ctx.stroke(); T(text, x + 9, y + 15, { s: 10.5, c: on ? '#fff' : HEAD, b: on }); hot(x, y, w, 22, fn, tip); return w + 8; };
  function source(y, runs) {
    K.badge('YOUR DAISY RUN', 16, y, '#1E8E3E');
    const txt = 'Daisy 7.1.14, run in the Daisy workbench: ' + ((L() && L().label) || 'your weather and soil') + '. Items for which you have not run the question are left out.';
    const nl = sidWrap(txt, 130, y + 1, W - 146, { s: 9.5, c: INK }, 13); return y + 18 + 13 * Math.max(0, (nl || 1) - 1);
  }
  // ================================================================== C2 Chemical fate
  function drawChem() {
    paper(); let y = K.header('Fate of a chemical in the field, season by season', texLabel() + ' · what happens to a pesticide or tracer applied to the crops: decay, crop uptake, leaching below 2 m, runoff and what stays in the soil', 4);
    if (!D() && !L()) { waiting(y); return; }
    if (!getRun(CH.v)) { const k0 = Object.keys(VARS).find(k => getRun(k)); if (k0) CH.v = k0; }
    const R = getRun(CH.v); if (!R || !R.r.chem) { waiting(y); return; }
    const r = R.r, c = r.chem, n = c.spray.length, labels = r.year.map(v => String(v - 1));
    y = source(y, [R]); y += 8;
    let cx = 16; Object.keys(VARS).forEach(k => { cx += chip(cx, y, VARS[k], CH.v === k, () => { CH.v = k; }, 'show ' + VARS[k]); }); y += 34;
    const tot = i => c.spray[i] + (i ? c.stock[i - 1] : 0);
    frame0(y, 300, 'Where the chemical goes in each season', 'kg per ha · the season runs from April to April');
    const pa = [{ n: 'decayed', c: '#8E5A2A', v: c.decay }, { n: 'taken up by the crop', c: '#2E9E4F', v: c.uptake }, { n: 'leached below 2 m', c: '#d53e4f', v: c.leach }, { n: 'runoff', c: '#2b83ba', v: c.runoff }, { n: 'left in the soil', c: '#E8C547', v: c.stock }];
    stackBars(16, y, W - 32, 270, labels, pa, { unit: 'kg/ha', mark: c.spray.map((v, i) => tot(i)) });
    K.legend(pa.map(p => [p.c, p.n]).concat([[HEAD, 'applied plus what was already in the soil']]), 62, y + 290); y += 312;
    const sp = mean(c.spray), M = k => mean(c[k]), end = c.stock[n - 1], applied = c.spray.reduce((a, b) => a + b, 0), leached = c.leach.reduce((a, b) => a + b, 0), decayed = c.decay.reduce((a, b) => a + b, 0), upt = c.uptake.reduce((a, b) => a + b, 0), ro = c.runoff.reduce((a, b) => a + b, 0);
    frame0(y, 150, 'What happened to the chemical over ' + n + ' seasons', 'sum of all seasons');
    K.TF('Applied ' + fmt(applied) + ' kg/ha in total (' + fmt(sp) + ' kg/ha per season on average).', 30, y + 44, { s: 10.5 });
    K.TF('Decayed ' + fmt(100 * decayed / applied) + ' %, taken up by the crop ' + fmt(100 * upt / applied, 1) + ' %, runoff ' + fmt(100 * ro / applied, 2) + ' %, leached below 2 m ' + fmt(100 * leached / applied, 2) + ' % (' + fmt(leached, 2) + ' kg/ha), still in the soil ' + fmt(end, 1) + ' kg/ha.', 30, y + 66, { s: 10.5 });
    const verdict = leached / applied > 0.02 ? 'Leaching is a risk: more than 2 % of what was applied has passed below 2 m.' : leached / applied > 0.002 ? 'Some leaching: between 0.2 and 2 % has passed below 2 m.' : 'Little leaching: less than 0.2 % has passed below 2 m.';
    K.TF(verdict, 30, y + 92, { s: 11, b: true, c: leached / applied > 0.02 ? '#B3261E' : leached / applied > 0.002 ? '#9A6A00' : '#1E6B3A' });
    K.TF('A mobile tracer is not sorbed and does not decay, so it measures how fast water carries a solute; sorption holds the chemical back, and decay removes it.', 30, y + 116, { s: 9.5, c: MUTE }); y += 160;
    // leaching against drainage
    frame0(y, 290, 'A chemical goes where the water goes', 'each dot is one season: drainage below 1 m against the chemical leached');
    const D1 = r.D, L1 = c.leach, sx0 = 70, sw = W - 32 - 90, st0 = y + 34, sh = 190, dx = K.nice(Math.max(...D1, 1) * 1.05), lx = K.nice(Math.max(...L1, 0.001) * 1.05);
    K.yAxis(sx0, st0, sw, sh, 0, lx, 'kg/ha'); for (let v = 0; v <= dx + 1e-9; v += K.nice(dx / 5)) T(fmt(v), sx0 + v / dx * sw, st0 + sh + 14, { s: 8.5, c: MUTE, a: 'center' }); T('drainage below 1 m (mm)', sx0 + sw / 2, st0 + sh + 28, { s: 9, c: MUTE, a: 'center' });
    D1.forEach((d, i) => { const X = sx0 + d / dx * sw, Yv = st0 + sh - L1[i] / lx * sh; ctx.fillStyle = i === CH.yr ? '#D93025' : '#d53e4f'; ctx.beginPath(); ctx.arc(X, Yv, 4, 0, 7); ctx.fill(); hot(X - 5, Yv - 5, 10, 10, () => { CH.yr = i; }, labels[i] + ': ' + fmt(d) + ' mm, ' + fmt(L1[i], 3) + ' kg/ha'); }); y += 300;
    // depth profile
    if (c.prof) {
      frame0(y, 330, 'Where the chemical sits in the soil', 'concentration of the soil solution against depth: mean of all days and the largest value (mg per litre, log scale)');
      const P = c.prof, px0 = 70, pw = W - 32 - 100, pt = y + 34, ph = 250, zmax = Math.max(...P.depth), vals = P.mean.concat(P.max).filter(v => v > 0), lo = Math.floor(Math.log10(Math.min(...vals))) , hi2 = Math.ceil(Math.log10(Math.max(...vals))), LO = Math.max(lo, hi2 - 9);
      for (let e = LO; e <= hi2; e++) { const xx = px0 + (e - LO) / (hi2 - LO || 1) * pw; ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(xx + 0.5, pt); ctx.lineTo(xx + 0.5, pt + ph); ctx.stroke(); T('1e' + e, xx, pt + ph + 14, { s: 8.5, c: MUTE, a: 'center' }); }
      for (let z = 0; z <= zmax; z += 50) { const yy = pt + z / zmax * ph; ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(px0, yy + 0.5); ctx.lineTo(px0 + pw, yy + 0.5); ctx.stroke(); T(String(z), px0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); } T('depth (cm)', px0 - 4, pt - 6, { s: 8.5, c: MUTE, a: 'right' });
      [['max', '#d53e4f', 'largest'], ['mean', '#2b83ba', 'mean']].forEach(([k, col, nm]) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); let on = false; P.depth.forEach((z, j) => { const v = P[k][j]; if (!(v > 0)) return; const xx = px0 + (Math.max(LO, Math.log10(v)) - LO) / (hi2 - LO || 1) * pw, yy = pt + z / zmax * ph; if (!on) { ctx.moveTo(xx, yy); on = true; } else ctx.lineTo(xx, yy); }); ctx.stroke(); });
      K.legend([['#d53e4f', 'largest concentration'], ['#2b83ba', 'mean concentration']], px0, pt + ph + 34); y += 340;
    }
    // the three chemicals and the ten soils
    const rows = Object.keys(VARS).map(k => ({ k, g: getRun(k) })).filter(q => q.g && q.g.r.chem);
    frame0(y, 70 + rows.length * 22, 'The three chemicals on this soil', 'mean of the seasons'); const cols = [30, W * 0.5, W * 0.64, W * 0.78, W - 24];
    ['Chemical', 'Leached, % of applied', 'Decayed, %', 'Taken up, %', 'Soil at end, kg/ha'].forEach((t, i) => TFx(t, i === 0 ? cols[0] : cols[i], y + 40, { s: 9, b: true, c: MUTE, a: i === 0 ? 'left' : 'right' }));
    rows.forEach((q, i) => { const cc = q.g.r.chem, ap = cc.spray.reduce((a, b) => a + b, 0), yy = y + 60 + i * 22, sel = q.k === CH.v; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 13, W - 34, 20); } T(SHORTV[q.k], cols[0], yy, { s: 10, b: sel }); [100 * cc.leach.reduce((a, b) => a + b, 0) / ap, 100 * cc.decay.reduce((a, b) => a + b, 0) / ap, 100 * cc.uptake.reduce((a, b) => a + b, 0) / ap, cc.stock[cc.stock.length - 1]].forEach((v, j) => T(fmt(v, j === 0 ? 2 : 1), cols[j + 1], yy, { s: 10, a: 'right', b: sel })); hot(17, yy - 13, W - 34, 20, () => { CH.v = q.k; }, 'show ' + VARS[q.k]); }); y += 80 + rows.length * 22;
    // leaching in the ten soils (bundled runs)
    if (D()) {
      const soils = DATA.soils.map(s => { const q = D().runs[s + '__' + CH.v]; if (!q || !q.chem) return null; const ap = q.chem.spray.reduce((a, b) => a + b, 0); return { s, v: 100 * q.chem.leach.reduce((a, b) => a + b, 0) / ap, d: mean(q.D) }; }).filter(Boolean).sort((a, b) => b.v - a.v);
      const hh = 70 + soils.length * 21; frame0(y, hh, 'Which soils leak the chemical most', VARS[CH.v] + ' · bundled runs, leached below 2 m as % of applied · tap a soil to choose it'); const mx = Math.max(...soils.map(q => q.v), 0.01);
      soils.forEach((q, i) => { const yy = y + 52 + i * 21; if (q.s === state.soil) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 13, W - 34, 20); } T(DATA.soil_labels[q.s], 30, yy, { s: 10, b: q.s === state.soil }); const bw = (W - 64 - 230) * q.v / mx; ctx.fillStyle = SPEC[8 - Math.min(8, Math.round(8 * q.v / mx))]; ctx.fillRect(190, yy - 10, Math.max(1, bw), 13); T(fmt(q.v, 2) + ' %  ·  drainage ' + fmt(q.d) + ' mm', 196 + bw, yy, { s: 9.5 }); hot(17, yy - 13, W - 34, 20, () => applyState({ soil: q.s }), 'choose ' + DATA.soil_labels[q.s]); });
      y += hh + 10;
    }
    T('Calculated with the Daisy model (Hansen et al., 2012; Holbak et al., 2026). The weather is the Taastrup record unless you ran your own in the Daisy workbench.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }
  const frame0 = (y, h, t, s) => K.frame(16, y, W - 32, h, t, s);
  // ================================================================== D1 Daisy decision table
  const ROWS = [['Water', [['rainfed', 'Rainfed'], ['irrigated', 'Irrigated (tensiometer)']]], ['Nitrogen', [['n50', 'Half the fertiliser'], ['rainfed', 'Standard fertiliser'], ['n130', '30 % more fertiliser']]], ['Climate', [['rainfed', 'Weather as it is'], ['warm', 'Warmer by 2 degrees C'], ['dry', 'Drier, rain x 0.7'], ['warmdry', 'Warmer and drier'], ['wet', 'Wetter, rain x 1.3']]]];
  const stat = r => { const ys = yieldSeries(r); return { y: mean(ys), I: mean(r.I), ETa: mean(r.ETa), D: mean(r.D), Nf: mean(r.Nfert), Nu: mean(r.Nup), NL: mean(r.NL), Nd: mean(r.Nden) }; };
  function drawDd() {
    paper(); let y = K.header('Daisy decision table', texLabel() + ' · what irrigation, the nitrogen rate and the climate do to yield, water and nitrate, from Daisy runs on the soil of this project', 4);
    if (!D() && !L()) { waiting(y); return; }
    const base = getRun('rainfed') || getRun('n100') || getRun('now'); if (!base) { waiting(y); return; }
    const need = ['rainfed', 'irrigated', 'n50', 'n130', 'warm', 'dry', 'warmdry', 'wet'].map(getRun).filter(Boolean); y = source(y, need); y += 8;
    const b = stat(base.r), cols = ['Yield, Mg/ha', 'Change, %', 'Irrigation, mm', 'Evapotr., mm', 'Drainage, mm', 'Nitrate lost, kg N/ha', 'N uptake, kg N/ha'], cx = [W * 0.385, W * 0.465, W * 0.55, W * 0.65, W * 0.75, W * 0.87, W - 24];
    const rows = []; ROWS.forEach(g => { rows.push({ head: g[0] }); g[1].forEach(q => { const R = getRun(q[0]); if (R) rows.push({ k: q[0], lab: q[1], R, s: stat(R.r) }); }); });
    const rh = 22, th = 74 + rows.length * rh; frame0(y, th, 'Every question, one row for each answer', '20-season means · colour: green better, red worse than the standard run'); const hy = y + 40; cols.forEach((t, i) => TFx(t, cx[i], hy, { s: 8.5, b: true, c: MUTE, a: 'right' }));
    const chg = (v, ref, good) => { const d = (v - ref) / (Math.abs(ref) || 1); return d * good; };
    rows.forEach((q, i) => { const yy = y + 58 + (i + 1) * rh - 6; if (q.head) { ctx.fillStyle = '#ECE9E0'; ctx.fillRect(17, yy - 14, W - 34, rh); T(q.head, 30, yy, { s: 10.5, b: true, c: HEAD }); return; }
      const s = q.s, d = 100 * (s.y - b.y) / (b.y || 1); T(q.lab, 30, yy, { s: 10 });
      const vals = [s.y, d, s.I, s.ETa, s.D, s.NL, s.Nu], goods = [1, 1, 0, 0, 0, -1, 1], refs = [b.y, 0, b.I, b.ETa, b.D, b.NL, b.Nu];
      vals.forEach((v, j) => { const c0 = goods[j] ? chg(v, refs[j], goods[j]) : 0; if (goods[j] && Math.abs(c0) > 0.02 && q.k !== 'rainfed') { ctx.fillStyle = c0 > 0 ? 'rgba(26,152,80,' + Math.min(0.45, Math.abs(c0)) + ')' : 'rgba(215,48,39,' + Math.min(0.45, Math.abs(c0)) + ')'; ctx.fillRect(cx[j] - 54, yy - 12, 58, 17); } T(fmt(v, j === 0 ? 2 : j === 1 ? 1 : j === 5 ? 1 : 0), cx[j], yy, { s: 10, a: 'right', b: j === 0 }); }); });
    y += th + 10;
    // verdicts
    const I = getRun('irrigated'), vd = []; if (I) { const s = stat(I.r), dy = s.y - b.y; vd.push('Irrigation: ' + (dy > 0.05 ? 'raises the yield by ' + fmt(dy, 2) + ' Mg/ha (' + fmt(100 * dy / b.y, 1) + ' %) for ' + fmt(s.I) + ' mm of water a year, which is ' + fmt(dy * 1000 / Math.max(1, s.I), 1) + ' kg of dry matter per mm' : 'does not raise the yield on this soil (change ' + fmt(dy, 2) + ' Mg/ha, ' + fmt(100 * dy / b.y, 1) + ' %) although ' + fmt(s.I) + ' mm of water a year is applied') + '; drainage changes by ' + fmt(s.D - b.D) + ' mm and nitrate leaching by ' + fmt(s.NL - b.NL, 1) + ' kg N/ha.'); }
    const n5 = getRun('n50'), n13 = getRun('n130'); if (n5 && n13) { const a = stat(n5.r), c = stat(n13.r); vd.push('Nitrogen: half the fertiliser changes the yield by ' + fmt(100 * (a.y - b.y) / b.y, 1) + ' % and the nitrate leached by ' + fmt(a.NL - b.NL, 1) + ' kg N/ha; 30 % more changes the yield by ' + fmt(100 * (c.y - b.y) / b.y, 1) + ' % and the nitrate leached by ' + fmt(c.NL - b.NL, 1) + ' kg N/ha.'); }
    const w = getRun('warm'), dr = getRun('dry'); if (w && dr) { const a = stat(w.r), c = stat(dr.r); vd.push('Climate: 2 degrees of warming changes the yield by ' + fmt(100 * (a.y - b.y) / b.y, 1) + ' % and evapotranspiration by ' + fmt(a.ETa - b.ETa) + ' mm; 30 % less rain changes the yield by ' + fmt(100 * (c.y - b.y) / b.y, 1) + ' % and the drainage by ' + fmt(c.D - b.D) + ' mm.'); }
    frame0(y, 40 + vd.length * 44, 'What the table says', 'for ' + DATA.soil_labels[state.soil]); vd.forEach((t, i) => sidWrap(t, 30, y + 44 + i * 44, W - 60, { s: 10.5, c: INK }, 14)); y += 50 + vd.length * 44;
    // year by year
    const R0 = base.r, labels = R0.year.map(v => String(v - 1)); frame0(y, 290, 'Yield season by season', 'Mg dry matter per ha · rainfed against irrigated');
    const sr = [{ n: 'rainfed', c: '#d53e4f', v: yieldSeries(R0) }]; if (I) sr.push({ n: 'irrigated', c: '#2b83ba', v: yieldSeries(I.r) }); groupBars(16, y, W - 32, 260, labels, sr, { unit: 'Mg/ha' }); K.legend(sr.map(s => [s.c, s.n]), 62, y + 276); y += 300;
    frame0(y, 290, 'Water season by season', 'mm per year · rain, irrigation and drainage below 1 m'); const wr = [{ n: 'rain', c: '#8fcfa6', v: R0.P }, { n: 'drainage (rainfed)', c: '#5aa6b4', v: R0.D }]; if (I) wr.push({ n: 'irrigation', c: '#2b83ba', v: I.r.I }); groupBars(16, y, W - 32, 260, labels, wr, { unit: 'mm' }); K.legend(wr.map(s => [s.c, s.n]), 62, y + 276); y += 300;
    // the ten soils
    if (D()) { const soils = DATA.soils.map(s => { const a = D().runs[s + '__rainfed'], c = D().runs[s + '__irrigated']; if (!a || !c) return null; const ya = mean(yieldSeries(a)), yc = mean(yieldSeries(c)); return { s, ya, g: yc - ya, I: mean(c.I), D: mean(a.D), NL: mean(a.NL) }; }).filter(Boolean).sort((a, b) => b.g - a.g);
      const hh = 78 + soils.length * 21; frame0(y, hh, 'Which soils gain most from irrigation', 'bundled runs · tap a soil to choose it'); ['Soil', 'Rainfed yield, Mg/ha', 'Irrigation gain, Mg/ha', 'Water, mm', 'Drainage rainfed, mm', 'Nitrate lost, kg N/ha'].forEach((t, i) => TFx(t, [30, W * 0.46, W * 0.6, W * 0.7, W * 0.83, W - 24][i], y + 40, { s: 8.5, b: true, c: MUTE, a: i ? 'right' : 'left' }));
      soils.forEach((q, i) => { const yy = y + 62 + i * 21; if (q.s === state.soil) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 13, W - 34, 20); } T(DATA.soil_labels[q.s], 30, yy, { s: 10, b: q.s === state.soil }); [fmt(q.ya, 2), fmt(q.g, 2), fmt(q.I), fmt(q.D), fmt(q.NL, 1)].forEach((t, j) => T(t, [W * 0.46, W * 0.6, W * 0.7, W * 0.83, W - 24][j], yy, { s: 10, a: 'right', b: q.s === state.soil })); hot(17, yy - 13, W - 34, 20, () => applyState({ soil: q.s }), 'choose ' + DATA.soil_labels[q.s]); }); y += hh + 10; }
    T('Calculated with the Daisy model (Hansen et al., 2012; Holbak et al., 2026), built-in farm rotation: spring barley, winter barley, winter rape, winter wheat.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }
  const TFx = (t, x, y, o) => { let sz = o.s || 9; ctx.font = (o.b ? 'bold ' : '') + sz + 'px sans-serif'; const parts = String(t).split(', '); if (parts.length > 1) { T(parts[0] + ',', x, y - 6, o); T(parts[1], x, y + 5, o); } else T(t, x, y, o); };


  // ================================================================== D2, D3, D4: the balances and the risk of your Daisy runs
  // every run you made in the workbench can be chosen; the table at the end puts all of them side by side
  const DS = { k: null, yr: null }, RUNLAB = { rainfed: 'Rainfed', irrigated: 'Irrigated', n50: 'Half the fertiliser', n130: '30 % more fertiliser', warm: 'Warmer by 2 °C', dry: 'Drier (rain × 0.7)', warmdry: 'Warmer and drier', wet: 'Wetter (rain × 1.3)', mobile: 'Mobile tracer', sorb: 'Sorbing chemical', decay: 'Sorbing and degrading' };
  const runKeys = () => { const l = L(); return l && l.runs ? Object.keys(l.runs).filter(k => l.runs[k] && l.runs[k].year) : []; };
  const runLab = k => RUNLAB[k] || k;
  function pickRun(y) { const ks = runKeys(); if (!ks.length) return null; if (!DS.k || ks.indexOf(DS.k) < 0) DS.k = ks.indexOf('rainfed') >= 0 ? 'rainfed' : ks[0]; let cx = 16; T('Run', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 34; ks.forEach(k => { if (cx > W - 140) { cx = 50; y += 28; } cx += chip(cx, y, runLab(k), DS.k === k, () => { DS.k = k; DS.yr = null; }, 'show the run ' + runLab(k)); }); return { r: L().runs[DS.k], y: y + 34 }; }
  const sum = a => (a || []).reduce((s, x) => s + (isFinite(x) ? x : 0), 0);
  const stressSeries = (r, j) => r.year.map(y => { const hs = (r.harvest || []).filter(h => h[0] === y - 1); return hs.length ? mean(hs.map(h => h[j])) : NaN; });
  const wstat = r => { const ys = yieldSeries(r), P = mean(r.P), I = mean(r.I), ETa = mean(r.ETa), ETp = mean(r.ETp), D = mean(r.D), Ro = mean(r.Ro), Y = mean(ys); return { P, I, ETa, ETp, D, Ro, dS: P + I - ETa - D - Ro, Y, WP: ETa > 0 ? Y * 1000 / (ETa * 10) : NaN, IWP: I > 0 ? Y * 1000 / ((P + I) * 10) : NaN, rel: ETp > 0 ? ETa / ETp : NaN }; };
  const nstat = r => { const F = mean(r.Nfert), Dp = mean(r.Ndep), Mi = mean(r.Nmin), U = mean(r.Nup), LN = mean(r.NL), De = mean(r.Nden), Vo = mean(r.Nvol); return { F, Dp, Mi, U, LN, De, Vo, NUE: F + Dp > 0 ? U / (F + Dp) : NaN, sur: F + Dp - U, loss: LN + De + Vo }; };
  const ystat = r => { const ys = yieldSeries(r).filter(isFinite).sort((a, b) => a - b), m = mean(ys), sdv = ys.length > 1 ? Math.sqrt(ys.reduce((s, v) => s + (v - m) ** 2, 0) / (ys.length - 1)) : NaN, q = f => ys.length ? ys[Math.min(ys.length - 1, Math.floor(f * (ys.length - 1)))] : NaN, ws = stressSeries(r, 3).filter(isFinite), ns = stressSeries(r, 4).filter(isFinite);
    return { m, cv: m > 0 ? sdv / m * 100 : NaN, p10: q(0.1), p50: q(0.5), p90: q(0.9), ys, W: mean(ws), N: mean(ns), wbad: ws.filter(v => v > 0.2).length / Math.max(1, ws.length), nbad: ns.filter(v => v > 0.2).length / Math.max(1, ns.length) }; };
  function runTable(y, title, sub, cols, row) { const ks = runKeys(), rh = 22, h = 74 + ks.length * rh, cx = cols.map((_, i) => i === 0 ? 30 : W * 0.34 + (W - 24 - W * 0.34) * (i / (cols.length - 1))); frame0(y, h, title, sub); cols.forEach((t, i) => TFx(t, cx[i], y + 40, { s: 8.5, b: true, c: MUTE, a: i ? 'right' : 'left' }));
    ks.forEach((k, i) => { const yy = y + 66 + i * rh, sel = k === DS.k; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 14, W - 34, 20); } T(runLab(k), cx[0], yy, { s: 10, b: sel }); row(L().runs[k]).forEach((t, j) => T(t, cx[j + 1], yy, { s: 10, a: 'right', b: sel })); hot(17, yy - 14, W - 34, 20, () => { DS.k = k; }, 'show ' + runLab(k)); }); return y + h + 10; }
  function drawWB() {
    paper(); let y = K.header('Water balance of your Daisy runs', texLabel() + ' · where the rain and the irrigation go, season by season: evapotranspiration, drainage below 1 m, runoff and the change of the water in the soil', 4);
    if (!L()) { waiting(y); return; } const R = pickRun(y); if (!R || !R.r.P) { waiting(y); return; } y = source(R.y, []); y += 8; const r = R.r, labels = r.year.map(v => String(v - 1)), s = wstat(r);
    frame0(y, 300, 'Water in and water out, season by season', 'mm · left bar of each season: what comes in; right bar: what leaves'); const wIn = [{ n: 'rain', c: '#8fcfa6', v: r.P }, { n: 'irrigation', c: '#2b83ba', v: r.I }], wOut = [{ n: 'evapotranspiration', c: '#fdae61', v: r.ETa }, { n: 'drainage below 1 m', c: '#5aa6b4', v: r.D }, { n: 'runoff', c: '#d53e4f', v: r.Ro }];
    const lab2 = [], parts = wIn.map(p => ({ n: p.n, c: p.c, v: [] })).concat(wOut.map(p => ({ n: p.n, c: p.c, v: [] }))); labels.forEach((lb, i) => { lab2.push(lb, ''); wIn.forEach((p, k) => parts[k].v.push(p.v[i] || 0, 0)); wOut.forEach((p, k) => parts[wIn.length + k].v.push(0, p.v[i] || 0)); });
    stackBars(16, y, W - 32, 270, lab2, parts, { unit: 'mm' }); K.legend(wIn.concat(wOut).map(p => [p.c, p.n]), 62, y + 290); y += 312;
    frame0(y, 176, 'The water balance in numbers', 'mean of ' + r.year.length + ' seasons, mm per season');
    [['Rain ' + fmt(s.P) + ' mm + irrigation ' + fmt(s.I) + ' mm = ' + fmt(s.P + s.I) + ' mm in.', INK], ['Evapotranspiration ' + fmt(s.ETa) + ' mm (' + fmt(100 * s.ETa / (s.P + s.I)) + ' %), drainage below 1 m ' + fmt(s.D) + ' mm (' + fmt(100 * s.D / (s.P + s.I)) + ' %), runoff ' + fmt(s.Ro) + ' mm (' + fmt(100 * s.Ro / (s.P + s.I), 1) + ' %).', INK],
      ['Change of the water in the soil and the crop: ' + fmt(s.dS, 1) + ' mm per season (the rest of the balance).', MUTE], ['The crop used ' + fmt(100 * s.rel) + ' % of the water it could have used (actual against potential evapotranspiration, ' + fmt(s.ETp) + ' mm).', INK],
      ['Water productivity: ' + fmt(s.WP, 2) + ' kg of dry matter per m³ evapotranspired' + (s.I > 0 ? '; ' + fmt(s.IWP, 2) + ' kg per m³ of rain and irrigation' : '') + '.', INK]].forEach((q, i) => K.TF(q[0], 30, y + 44 + i * 24, { s: 10.5, c: q[1] }));
    y += 186; const big = s.D > s.ETa * 0.6 ? 'Much of the water drains below the roots: it carries nitrate with it. Smaller, more frequent irrigations or a cover crop keep it in the root zone.' : s.rel < 0.8 ? 'The crop is short of water: it uses less than 80 % of what it could. Irrigation in the dry spells pays off here.' : 'Most of the water is used by the crop; drainage is moderate.';
    K.TF(big, 30, y, { s: 11, b: true, c: s.D > s.ETa * 0.6 ? '#9A6A00' : s.rel < 0.8 ? '#B3261E' : '#1E6B3A' }); y += 20;
    y = runTable(y, 'Every run side by side', 'means of the seasons · tap a run to show it', ['Run', 'Rain, mm', 'Irrigation, mm', 'Evapotr., mm', 'Drainage, mm', 'Runoff, mm', 'ETa / ETp', 'kg DM per m³'], q => { const t = wstat(q); return [fmt(t.P), fmt(t.I), fmt(t.ETa), fmt(t.D), fmt(t.Ro, 1), fmt(t.rel, 2), fmt(t.WP, 2)]; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. Drainage is the percolation through the matrix and the biopores at 1 m.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }
  function drawNB() {
    paper(); let y = K.header('Nitrogen balance of your Daisy runs', texLabel() + ' · what comes in (fertiliser, deposition, mineralisation) and where it goes (crop, leaching, denitrification, ammonia), season by season', 4);
    if (!L()) { waiting(y); return; } const R = pickRun(y); if (!R || !R.r.Nup) { waiting(y); return; } y = source(R.y, []); y += 8; const r = R.r, labels = r.year.map(v => String(v - 1)), s = nstat(r);
    frame0(y, 300, 'Nitrogen in, season by season', 'kg N per ha · the black mark is what the crop took up'); stackBars(16, y, W - 32, 270, labels, [{ n: 'fertiliser', c: '#8E3B8E', v: r.Nfert }, { n: 'deposition', c: '#b39ddb', v: r.Ndep }, { n: 'mineralisation', c: '#c8861c', v: r.Nmin }], { unit: 'kg N/ha', mark: r.Nup }); K.legend([['#8E3B8E', 'fertiliser'], ['#b39ddb', 'deposition'], ['#c8861c', 'mineralisation'], [HEAD, 'crop uptake']], 62, y + 290); y += 312;
    frame0(y, 300, 'Nitrogen lost, season by season', 'kg N per ha · leaching below 1 m, denitrification and ammonia volatilisation'); stackBars(16, y, W - 32, 270, labels, [{ n: 'leached', c: '#d53e4f', v: r.NL }, { n: 'denitrified', c: '#5aa6b4', v: r.Nden }, { n: 'volatilised', c: '#fee08b', v: r.Nvol }], { unit: 'kg N/ha' }); K.legend([['#d53e4f', 'leached below 1 m'], ['#5aa6b4', 'denitrified (N2, N2O)'], ['#fee08b', 'ammonia volatilised']], 62, y + 290); y += 312;
    frame0(y, 152, 'The nitrogen balance in numbers', 'mean of ' + r.year.length + ' seasons, kg N per ha');
    [['In: fertiliser ' + fmt(s.F) + ', deposition ' + fmt(s.Dp) + ', mineralisation from the soil organic matter ' + fmt(s.Mi) + '.'], ['Out: crop uptake ' + fmt(s.U) + ', leached ' + fmt(s.LN, 1) + ', denitrified ' + fmt(s.De, 1) + ', volatilised ' + fmt(s.Vo, 1) + ' (losses ' + fmt(s.loss, 1) + ').'],
      ['Nitrogen use efficiency (uptake against fertiliser and deposition): ' + fmt(100 * s.NUE) + ' %. Surplus (fertiliser and deposition minus uptake): ' + fmt(s.sur) + ' kg N/ha.'], ['Leaching for each kg of fertiliser: ' + fmt(s.F > 0 ? s.LN / s.F : NaN, 2) + ' kg N.']].forEach((q, i) => K.TF(q[0], 30, y + 44 + i * 24, { s: 10.5 }));
    y += 162; K.TF(s.LN > 40 ? 'Nitrate leaching is high (more than 40 kg N/ha a year): less or split fertiliser, a catch crop, and no drainage-causing irrigation.' : s.LN > 20 ? 'Nitrate leaching is moderate (20 to 40 kg N/ha a year).' : 'Nitrate leaching is low (under 20 kg N/ha a year).', 30, y, { s: 11, b: true, c: s.LN > 40 ? '#B3261E' : s.LN > 20 ? '#9A6A00' : '#1E6B3A' }); y += 20;
    y = runTable(y, 'Every run side by side', 'means of the seasons, kg N per ha · tap a run to show it', ['Run', 'Fertiliser', 'Uptake', 'Leached', 'Denitrified', 'Volatilised', 'NUE, %', 'Surplus'], q => { const t = nstat(q); return [fmt(t.F), fmt(t.U), fmt(t.LN, 1), fmt(t.De, 1), fmt(t.Vo, 1), fmt(100 * t.NUE), fmt(t.sur)]; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. Leaching is the nitrate through the matrix and the biopores at 1 m.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }
  function drawYR() {
    paper(); let y = K.header('Yield risk and what limits the crop', texLabel() + ' · how often the yield falls short, and whether water or nitrogen holds it back, from your Daisy runs', 4);
    if (!L()) { waiting(y); return; } const R = pickRun(y); if (!R || !R.r.harvest) { waiting(y); return; } y = source(R.y, []); y += 8; const r = R.r, labels = r.year.map(v => String(v - 1)), s = ystat(r);
    // exceedance: the share of the seasons with at least this yield, every run
    frame0(y, 320, 'How likely is a yield?', 'the share of the seasons in which the yield reaches at least the value on the axis · each line is one run'); const ks = runKeys(), x0 = 70, ww = W - 32 - 110, y0 = y + 36, hh = 220, all = [].concat(...ks.map(k => ystat(L().runs[k]).ys)), hi = K.nice(Math.max(1, ...all) * 1.05);
    K.yAxis(x0, y0, ww, hh, 0, hi, 'Mg/ha'); [0, 25, 50, 75, 100].forEach(p => { T(p + ' %', x0 + p / 100 * ww, y0 + hh + 14, { s: 8.5, c: MUTE, a: 'center' }); }); T('share of seasons with at least this yield', x0 + ww / 2, y0 + hh + 28, { s: 9, c: MUTE, a: 'center' });
    ks.forEach((k, i) => { const v = ystat(L().runs[k]).ys.slice().sort((a, b) => b - a), n = v.length; if (!n) return; ctx.strokeStyle = SPEC[(i * 3) % 9]; ctx.lineWidth = k === DS.k ? 3 : 1.5; ctx.beginPath(); v.forEach((q, j) => { const X = x0 + (n > 1 ? j / (n - 1) : 0.5) * ww, Yv = y0 + hh - q / hi * hh; j ? ctx.lineTo(X, Yv) : ctx.moveTo(X, Yv); }); ctx.stroke(); });
    K.legend(ks.map((k, i) => [SPEC[(i * 3) % 9], runLab(k)]), 62, y0 + hh + 46); y += 330;
    frame0(y, 300, 'Water stress and nitrogen stress, season by season', 'mean stress of the harvests of the season · 0 none, 1 full; the larger one limits the yield'); const ws = stressSeries(r, 3), ns = stressSeries(r, 4);
    groupBars(16, y, W - 32, 270, labels, [{ n: 'water stress', c: '#2b83ba', v: ws }, { n: 'nitrogen stress', c: '#c8861c', v: ns }], { unit: '' }); K.legend([['#2b83ba', 'water stress'], ['#c8861c', 'nitrogen stress']], 62, y + 290); y += 312;
    frame0(y, 152, 'The yield in numbers', 'all seasons of the run ' + runLab(DS.k));
    [['Mean yield ' + fmt(s.m, 2) + ' Mg/ha; in 9 seasons out of 10 at least ' + fmt(s.p10, 2) + ' Mg/ha; median ' + fmt(s.p50, 2) + '; in the best 10 % at least ' + fmt(s.p90, 2) + ' Mg/ha.'], ['Year-to-year variation (coefficient of variation): ' + fmt(s.cv) + ' %.'],
      ['Water stress above 0.2 in ' + fmt(100 * s.wbad) + ' % of the seasons, nitrogen stress above 0.2 in ' + fmt(100 * s.nbad) + ' % (mean stress ' + fmt(s.W, 2) + ' and ' + fmt(s.N, 2) + ').'], [s.W > s.N * 1.2 ? 'Water limits this crop more than nitrogen: irrigation or water-saving management come first.' : s.N > s.W * 1.2 ? 'Nitrogen limits this crop more than water: the fertiliser plan comes first.' : 'Water and nitrogen limit the crop about equally.']].forEach((q, i) => K.TF(q[0], 30, y + 44 + i * 24, { s: 10.5, b: i === 3 }));
    y += 162; y = runTable(y, 'Every run side by side', 'tap a run to show it', ['Run', 'Mean, Mg/ha', '9 in 10 at least', 'Variation, %', 'Water stress', 'Nitrogen stress', 'Water-limited seasons'], q => { const t = ystat(q); return [fmt(t.m, 2), fmt(t.p10, 2), fmt(t.cv), fmt(t.W, 2), fmt(t.N, 2), fmt(100 * t.wbad) + ' %']; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. Stress is the WStress and NStress of the harvest log: the share of the potential production lost.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }
  // the charts of the Dashboard for these layers
  const prevSeries = window.layerSeries;
  window.layerSeries = function (id) {
    if (['dwb', 'dnb', 'dyr'].includes(id)) { const ks = runKeys(); if (!ks.length) return null; const k = DS.k && ks.includes(DS.k) ? DS.k : ks[0], r = L().runs[k], S2 = (n, v, c) => ({ n, v: (v || []).map(x => x == null || !isFinite(x) ? null : +(+x).toFixed(3)), c }), C2 = (t, u, ser) => ({ t: t + ' · ' + runLab(k), u, ser: ser.filter(Boolean) }), yrs = r.year.map(v => String(v - 1));
      if (id === 'dwb') return { years: yrs, sel: null, charts: [C2('Water in', 'mm', [S2('rain', r.P, '#8fcfa6'), S2('irrigation', r.I, '#2b83ba')]), C2('Evapotranspiration', 'mm', [S2('actual', r.ETa, '#fdae61'), S2('potential', r.ETp, '#999')]), C2('Drainage and runoff', 'mm', [S2('drainage below 1 m', r.D, '#5aa6b4'), S2('runoff', r.Ro, '#d53e4f')])] };
      if (id === 'dnb') return { years: yrs, sel: null, charts: [C2('Nitrogen in', 'kg N/ha', [S2('fertiliser', r.Nfert, '#8E3B8E'), S2('mineralisation', r.Nmin, '#c8861c')]), C2('Crop uptake', 'kg N/ha', [S2('uptake', r.Nup, '#2E9E4F')]), C2('Nitrogen lost', 'kg N/ha', [S2('leached', r.NL, '#d53e4f'), S2('denitrified', r.Nden, '#5aa6b4'), S2('volatilised', r.Nvol, '#c9a400')])] };
      return { years: yrs, sel: null, charts: [C2('Yield', 'Mg/ha', [S2('yield', yieldSeries(r), '#4d9221')]), C2('Water and nitrogen stress', '', [S2('water', stressSeries(r, 3), '#2b83ba'), S2('nitrogen', stressSeries(r, 4), '#c8861c')])] }; }
    if (id !== 'chem' && id !== 'dsum') return prevSeries ? prevSeries(id) : null;
    if (!D() && !L()) return null; const S = (n, v, c, dash) => ({ n, v: (v || []).map(x => x == null || !isFinite(x) ? null : +(+x).toFixed(3)), c, dash }), C = (t, u, ser) => ({ t, u, ser: ser.filter(Boolean) });
    if (id === 'chem') { const R = getRun(CH.v); if (!R || !R.r.chem) return null; const c = R.r.chem; return { years: R.r.year.map(v => String(v - 1)), sel: CH.yr, charts: [C('Chemical applied', 'kg/ha', [S('applied', c.spray, '#8E3B8E')]), C('Chemical decayed and taken up', 'kg/ha', [S('decayed', c.decay, '#8E5A2A'), S('taken up', c.uptake, '#2E9E4F')]), C('Chemical leached below 2 m', 'kg/ha', [S('leached', c.leach, '#d53e4f'), S('runoff', c.runoff, '#2b83ba')]), C('Chemical left in the soil', 'kg/ha', [S('in the soil', c.stock, '#E8C547')])] }; }
    const a = getRun('rainfed'), b = getRun('irrigated'); if (!a) return null; const r = a.r; return { years: r.year.map(v => String(v - 1)), sel: null, charts: [C('Yield', 'Mg/ha', [S('rainfed', yieldSeries(r), '#d53e4f'), b && S('irrigated', yieldSeries(b.r), '#2b83ba')]), C('Rain and irrigation', 'mm', [S('rain', r.P, '#8fcfa6'), b && S('irrigation', b.r.I, '#2b83ba')]), C('Drainage below 1 m', 'mm', [S('rainfed', r.D, '#5aa6b4'), b && S('irrigated', b.r.D, '#2b83ba')]), C('Nitrate leached below 1 m', 'kg N/ha', [S('rainfed', r.NL, '#8E5A2A'), b && S('irrigated', b.r.NL, '#E8912D')])] };
  };
  K.add('chem', 'C2 Chemical fate', '#8E3B8E', drawChem, 'Fate of a chemical in the field: decay, uptake, leaching, runoff and what stays', 'A chemical applied to the field is broken down, taken up, held by the soil or carried down by the water: sorption and decay decide how much leaves the root zone.');
  K.add('dsum', 'D1 Daisy decision table', '#1B3A6B', drawDd, 'What irrigation, nitrogen and climate do to yield, water and nitrate (Daisy)', 'Each choice moves yield, water and nitrate together: the table puts every answer of the Daisy questions side by side for the soil of the project.');
  K.add('dwb', 'D2 Daisy water balance', '#2b83ba', drawWB, 'Where the rain and the irrigation go in your Daisy runs', 'Rain and irrigation leave as evapotranspiration, drainage or runoff: the balance shows how much the crop really uses and how much is lost below the roots.');
  K.add('dnb', 'D3 Daisy nitrogen balance', '#8E3B8E', drawNB, 'Nitrogen in and out of the field in your Daisy runs', 'Fertiliser, deposition and mineralisation feed the crop; what the crop does not take up is leached, denitrified or volatilised.');
  K.add('dyr', 'D4 Yield risk and limiting factor', '#4d9221', drawYR, 'How likely each yield is and whether water or nitrogen limits it', 'The mean yield hides the bad seasons: the exceedance curve and the stress of each season show the risk and what to manage first.');
  window.DAISYLAYERS = { ids: ['chem', 'dsum', 'dwb', 'dnb', 'dyr'] };
})();
