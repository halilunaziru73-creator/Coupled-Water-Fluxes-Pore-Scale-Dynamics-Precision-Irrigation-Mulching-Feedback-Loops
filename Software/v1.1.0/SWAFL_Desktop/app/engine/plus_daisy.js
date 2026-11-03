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
  // a label cut to the room it has (measured in the font it is written in), so no two labels ever run into each other
  const clipT = (t, maxW, sz, b) => { t = String(t == null ? '' : t); ctx.font = (b ? 'bold ' : '') + (sz || 10) + 'px sans-serif'; if (ctx.measureText(t).width <= maxW) return t; let lo = 0, hi = t.length; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ctx.measureText(t.slice(0, m) + '…').width <= maxW) lo = m; else hi = m - 1; } return t.slice(0, lo).replace(/[\s·,;]+$/, '') + '…'; };
  const chipW = t => { ctx.font = '10.5px sans-serif'; return ctx.measureText(t).width + 26; };
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
    const CK = () => Array.from(new Set(Object.keys(VARS).filter(k => getRun(k) && getRun(k).r.chem).concat(runKeys().filter(k => L().runs[k].chem)))); if (!getRun(CH.v) || !getRun(CH.v).r.chem) { const k0 = CK()[0]; if (k0) CH.v = k0; }
    const R = getRun(CH.v); if (!R || !R.r.chem) { waiting(y); return; }
    const r = R.r, c = r.chem, n = c.spray.length, labels = r.year.map(v => String(v - 1));
    y = source(y, [R]); y += 8;
    let cx = 16; CK().forEach(k => { const nm = clipT(VARS[k] || runLab(k), 280, 10.5, true); if (cx + chipW(nm) > W - 20) { cx = 16; y += 28; } cx += chip(cx, y, nm, CH.v === k, () => { CH.v = k; }, 'show ' + nm); }); y += 34;
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
    const rows = CK().map(k => ({ k, g: getRun(k) })).filter(q => q.g && q.g.r.chem);
    frame0(y, 70 + rows.length * 22, 'The chemicals you ran on this soil', 'mean of the seasons'); const cols = [30, W * 0.5, W * 0.64, W * 0.78, W - 24];
    ['Chemical', 'Leached, % of applied', 'Decayed, %', 'Taken up, %', 'Soil at end, kg/ha'].forEach((t, i) => TFx(t, i === 0 ? cols[0] : cols[i], y + 40, { s: 9, b: true, c: MUTE, a: i === 0 ? 'left' : 'right' }));
    rows.forEach((q, i) => { const cc = q.g.r.chem, ap = cc.spray.reduce((a, b) => a + b, 0), yy = y + 60 + i * 22, sel = q.k === CH.v; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 13, W - 34, 20); } T(clipT(SHORTV[q.k] || runLab(q.k), cols[1] - cols[0] - 60, 10, sel), cols[0], yy, { s: 10, b: sel }); [100 * cc.leach.reduce((a, b) => a + b, 0) / ap, 100 * cc.decay.reduce((a, b) => a + b, 0) / ap, 100 * cc.uptake.reduce((a, b) => a + b, 0) / ap, cc.stock[cc.stock.length - 1]].forEach((v, j) => T(fmt(v, j === 0 ? 2 : 1), cols[j + 1], yy, { s: 10, a: 'right', b: sel })); hot(17, yy - 13, W - 34, 20, () => { CH.v = q.k; }, 'show ' + VARS[q.k]); }); y += 80 + rows.length * 22;
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
  const runLab = k => (L() && L().meta && L().meta[k] && (L().meta[k].short || L().meta[k].label)) || RUNLAB[k] || k;
  const runLong = k => (L() && L().meta && L().meta[k] && L().meta[k].label) || runLab(k);
  function pickRun(y) { const ks = runKeys(); if (!ks.length) return null; if (!DS.k || ks.indexOf(DS.k) < 0) DS.k = ks.indexOf('rainfed') >= 0 ? 'rainfed' : ks[0]; let cx = 16; T('Run', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 34; ks.forEach(k => { if (cx > W - 140) { cx = 50; y += 28; } cx += chip(cx, y, runLab(k), DS.k === k, () => { DS.k = k; DS.yr = null; }, 'show the run ' + runLab(k)); }); return { r: L().runs[DS.k], y: y + 34 }; }
  const sum = a => (a || []).reduce((s, x) => s + (isFinite(x) ? x : 0), 0);
  const stressSeries = (r, j) => r.year.map(y => { const hs = (r.harvest || []).filter(h => h[0] === y - 1); return hs.length ? mean(hs.map(h => h[j])) : NaN; });
  const wstat = r => { const ys = yieldSeries(r), P = mean(r.P), I = mean(r.I), ETa = mean(r.ETa), ETp = mean(r.ETp), D = mean(r.D), Ro = mean(r.Ro), Y = mean(ys); return { P, I, ETa, ETp, D, Ro, dS: P + I - ETa - D - Ro, Y, WP: ETa > 0 ? Y * 1000 / (ETa * 10) : NaN, IWP: I > 0 ? Y * 1000 / ((P + I) * 10) : NaN, rel: ETp > 0 ? ETa / ETp : NaN }; };
  const nstat = r => { const F = mean(r.Nfert), Dp = mean(r.Ndep), Mi = mean(r.Nmin), U = mean(r.Nup), LN = mean(r.NL), De = mean(r.Nden), Vo = mean(r.Nvol); return { F, Dp, Mi, U, LN, De, Vo, NUE: F + Dp > 0 ? U / (F + Dp) : NaN, sur: F + Dp - U, loss: LN + De + Vo }; };
  const ystat = r => { const ys = yieldSeries(r).filter(isFinite).sort((a, b) => a - b), m = mean(ys), sdv = ys.length > 1 ? Math.sqrt(ys.reduce((s, v) => s + (v - m) ** 2, 0) / (ys.length - 1)) : NaN, q = f => ys.length ? ys[Math.min(ys.length - 1, Math.floor(f * (ys.length - 1)))] : NaN, ws = stressSeries(r, 3).filter(isFinite), ns = stressSeries(r, 4).filter(isFinite);
    return { m, cv: m > 0 ? sdv / m * 100 : NaN, p10: q(0.1), p50: q(0.5), p90: q(0.9), ys, W: mean(ws), N: mean(ns), wbad: ws.filter(v => v > 0.2).length / Math.max(1, ws.length), nbad: ns.filter(v => v > 0.2).length / Math.max(1, ns.length) }; };
  function runTable(y, title, sub, cols, row) { const ks = runKeys(), rh = 22, h = 74 + ks.length * rh, cx = cols.map((_, i) => i === 0 ? 30 : W * 0.34 + (W - 24 - W * 0.34) * (i / (cols.length - 1))); frame0(y, h, title, sub); cols.forEach((t, i) => TFx(t, cx[i], y + 40, { s: 8.5, b: true, c: MUTE, a: i ? 'right' : 'left' }));
    ks.forEach((k, i) => { const yy = y + 66 + i * rh, sel = k === DS.k; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 14, W - 34, 20); } T(clipT(runLab(k), cx[1] - cx[0] - 78, 10, sel), cx[0], yy, { s: 10, b: sel }); row(L().runs[k]).forEach((t, j) => T(t, cx[j + 1], yy, { s: 10, a: 'right', b: sel })); hot(17, yy - 14, W - 34, 20, () => { DS.k = k; }, 'show ' + runLong(k)); }); return y + h + 10; }
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
    K.legend(ks.map((k, i) => [SPEC[(i * 3) % 9], clipT(runLab(k), 220, 9.5)]), 62, y0 + hh + 46); y += 330;
    frame0(y, 300, 'Water stress and nitrogen stress, season by season', 'mean stress of the harvests of the season · 0 none, 1 full; the larger one limits the yield'); const ws = stressSeries(r, 3), ns = stressSeries(r, 4);
    groupBars(16, y, W - 32, 270, labels, [{ n: 'water stress', c: '#2b83ba', v: ws }, { n: 'nitrogen stress', c: '#c8861c', v: ns }], { unit: '' }); K.legend([['#2b83ba', 'water stress'], ['#c8861c', 'nitrogen stress']], 62, y + 290); y += 312;
    frame0(y, 152, 'The yield in numbers', 'all seasons of the run ' + runLab(DS.k));
    [['Mean yield ' + fmt(s.m, 2) + ' Mg/ha; in 9 seasons out of 10 at least ' + fmt(s.p10, 2) + ' Mg/ha; median ' + fmt(s.p50, 2) + '; in the best 10 % at least ' + fmt(s.p90, 2) + ' Mg/ha.'], ['Year-to-year variation (coefficient of variation): ' + fmt(s.cv) + ' %.'],
      ['Water stress above 0.2 in ' + fmt(100 * s.wbad) + ' % of the seasons, nitrogen stress above 0.2 in ' + fmt(100 * s.nbad) + ' % (mean stress ' + fmt(s.W, 2) + ' and ' + fmt(s.N, 2) + ').'], [s.W > s.N * 1.2 ? 'Water limits this crop more than nitrogen: irrigation or water-saving management come first.' : s.N > s.W * 1.2 ? 'Nitrogen limits this crop more than water: the fertiliser plan comes first.' : 'Water and nitrogen limit the crop about equally.']].forEach((q, i) => K.TF(q[0], 30, y + 44 + i * 24, { s: 10.5, b: i === 3 }));
    y += 162; y = runTable(y, 'Every run side by side', 'tap a run to show it', ['Run', 'Mean, Mg/ha', '9 in 10 at least', 'Variation, %', 'Water stress', 'Nitrogen stress', 'Water-limited seasons'], q => { const t = ystat(q); return [fmt(t.m, 2), fmt(t.p10, 2), fmt(t.cv), fmt(t.W, 2), fmt(t.N, 2), fmt(100 * t.wbad) + ' %']; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. Stress is the WStress and NStress of the harvest log: the share of the potential production lost.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }

  // ================================================================== D5 to D8: chemicals and drinking water, trade-offs, the return of irrigation, nitrous oxide
  // every figure reads the runs you made (Scenarios or Experiments); each layer lists all of them and you can pick any one
  const ok = v => isFinite(v);
  function hbarList(y, title, sub, rows, o) {   // rows: [{lab, v, c, txt, k}] horizontal bars; o.log for a log axis, o.lines [{v, lab, c}]
    o = o || {}; const rh = 24, h = 70 + rows.length * rh + (o.lines && o.lines.length ? 16 : 0); frame0(y, h, title, sub); if (!rows.length) { T('No run has these results yet.', 30, y + 50, { s: 10, c: MUTE }); return y + h + 10; }
    const lx = 30, bx = Math.min(300, W * 0.32), bw = W - 32 - bx - 190, vals = rows.map(r => r.v).filter(v => ok(v) && (!o.log || v > 0)).concat((o.lines || []).map(l => l.v));
    let lo = 0, hi = K.nice(Math.max(1e-9, ...vals) * 1.05); if (o.log) { lo = Math.floor(Math.log10(Math.max(1e-12, Math.min(...vals)))); hi = Math.ceil(Math.log10(Math.max(...vals))); if (hi <= lo) hi = lo + 1; lo = Math.max(lo, hi - 8); }
    const X = v => bx + (o.log ? (Math.log10(Math.max(v, Math.pow(10, lo))) - lo) / (hi - lo) : v / hi) * bw, top = y + 40;
    if (o.log) for (let e = lo; e <= hi; e++) { const xx = X(Math.pow(10, e)); ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(xx + 0.5, top - 4); ctx.lineTo(xx + 0.5, top + rows.length * rh); ctx.stroke(); T(e >= -2 && e <= 3 ? String(+Math.pow(10, e).toPrecision(1)) : '1e' + e, xx, top + rows.length * rh + 12, { s: 8.5, c: MUTE, a: 'center' }); }
    else for (let v = 0; v <= hi + 1e-12; v += K.nice(hi / 5)) { const xx = X(v); ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(xx + 0.5, top - 4); ctx.lineTo(xx + 0.5, top + rows.length * rh); ctx.stroke(); T(fmt(v, hi < 1 ? 3 : hi < 10 ? 1 : 0), xx, top + rows.length * rh + 12, { s: 8.5, c: MUTE, a: 'center' }); }
    rows.forEach((r, i) => { const yy = top + i * rh, sel = r.k && r.k === DS.k; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 2, W - 34, rh - 2); } T(clipT(r.lab, bx - lx - 10, 10, sel), lx, yy + 14, { s: 10, b: sel }); if (ok(r.v) && (!o.log || r.v > 0)) { ctx.fillStyle = r.c || '#2b83ba'; ctx.fillRect(bx, yy + 4, Math.max(2, X(r.v) - bx), rh - 10); } T(r.txt != null ? r.txt : fmt(r.v, 2), W - 24, yy + 14, { s: 10, a: 'right', b: sel }); if (r.k) hot(17, yy - 2, W - 34, rh - 2, () => { DS.k = r.k; }, 'show ' + r.lab); });
    (o.lines || []).forEach(l => { const xx = X(l.v); ctx.strokeStyle = l.c || '#B3261E'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(xx, top - 6); ctx.lineTo(xx, top + rows.length * rh); ctx.stroke(); ctx.setLineDash([]); T(l.lab, xx + 4, top + rows.length * rh + 26, { s: 9, b: true, c: l.c || '#B3261E' }); });
    if (o.unit) T(o.unit, bx + bw, y + 30, { s: 9, c: MUTE, a: 'right' }); return y + h + 10;
  }
  function scatter(y, h, title, sub, pts, o) {   // pts: [{x, y, r, c, lab, k}]; o: xt, yt, front (the best edge), lines
    o = o || {}; frame0(y, h, title, sub); const x0 = 76, ww = W - 32 - 120, y0 = y + 40, hh = h - 96, xs = pts.map(p => p.x).filter(ok), ys = pts.map(p => p.y).filter(ok); if (!xs.length) { T('No run has these results yet.', 30, y + 50, { s: 10, c: MUTE }); return y + h + 10; }
    const xlo = Math.min(0, ...xs), xhi = K.nice(Math.max(1e-9, ...xs) * 1.08), ymn = Math.min(...ys), ymx = Math.max(...ys), ylo = o.y0 != null ? o.y0 : (ymn > 0.4 * ymx ? Math.max(0, Math.floor((ymn - Math.max(ymx - ymn, 0.1 * ymx) * 0.6) * 10) / 10) : 0), yhi = ylo > 0 ? +(ymx + Math.max(ymx - ymn, 0.1 * ymx) * 0.25).toFixed(2) : K.nice(Math.max(1e-9, ...ys) * 1.08), X = v => x0 + (v - xlo) / (xhi - xlo) * ww, Y = v => y0 + hh - (v - ylo) / (yhi - ylo) * hh;
    K.yAxis(x0, y0, ww, hh, ylo, yhi, o.yt || ''); for (let v = xlo; v <= xhi + 1e-9; v += K.nice((xhi - xlo) / 5)) T(fmt(v, xhi < 5 ? 1 : 0), X(v), y0 + hh + 14, { s: 8.5, c: MUTE, a: 'center' }); T(o.xt || '', x0 + ww / 2, y0 + hh + 30, { s: 9.5, c: MUTE, a: 'center' });
    if (o.curve) { ctx.strokeStyle = '#555'; ctx.lineWidth = 1.6; ctx.setLineDash([6, 4]); ctx.beginPath(); o.curve.forEach((q, i) => { i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); }); ctx.stroke(); ctx.setLineDash([]); }
    if (o.front && o.front.length > 1) { ctx.strokeStyle = '#1E8E3E'; ctx.lineWidth = 2.4; ctx.beginPath(); o.front.forEach((p, i) => { i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y)); }); ctx.stroke(); }
    (o.vlines || []).forEach(l => { ctx.strokeStyle = l.c; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(l.v), y0); ctx.lineTo(X(l.v), y0 + hh); ctx.stroke(); ctx.setLineDash([]); T(l.lab, X(l.v) + 4, y0 + 12, { s: 9, b: true, c: l.c }); });
    const placed = [], hit = (a) => placed.some(b => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3]);
    pts.forEach(p => { if (ok(p.x) && ok(p.y)) placed.push([X(p.x) - (p.r || 6), Y(p.y) - (p.r || 6), 2 * (p.r || 6), 2 * (p.r || 6)]); });
    const tagAt = (p, rr, sel) => { const t = clipT(p.tag, 150, 9, sel); ctx.font = (sel ? 'bold ' : '') + '9px sans-serif'; const tw = ctx.measureText(t).width, px = X(p.x), py = Y(p.y), C = [[px + rr + 3, py - rr - 2], [px + rr + 3, py + rr + 9], [px - rr - 3 - tw, py - rr - 2], [px - rr - 3 - tw, py + rr + 9]];
      for (const c of C) { const bb = [c[0] - 1, c[1] - 9, tw + 2, 11]; if (bb[0] < x0 || bb[0] + bb[2] > x0 + ww + 110 || bb[1] < y0) continue; if (!hit(bb) || sel) { placed.push(bb); T(t, c[0], c[1], { s: 9, c: HEAD, b: sel }); return; } } };
    pts.slice().sort((a, b) => ((b.k && b.k === DS.k) ? 1 : 0) - ((a.k && a.k === DS.k) ? 1 : 0)).forEach(p => { if (!ok(p.x) || !ok(p.y)) return; const rr = p.r || 6, sel = p.k && p.k === DS.k; ctx.fillStyle = p.c || '#2b83ba'; ctx.globalAlpha = 0.78; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), rr, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = sel ? '#000' : '#fff'; ctx.lineWidth = sel ? 2.5 : 1.2; ctx.stroke();
      if (p.tag && (sel || p.front)) tagAt(p, rr, sel); hot(X(p.x) - rr, Y(p.y) - rr, 2 * rr, 2 * rr, () => { if (p.k) DS.k = p.k; }, (p.lab || '') + ': ' + fmt(p.x, 1) + ', ' + fmt(p.y, 2)); });
    return y + h + 10;
  }
  const allRuns = f => runKeys().filter(k => f ? f(L().runs[k]) : true);
  const metaOf = k => (L() && L().meta && L().meta[k]) || {};
  const pickFrom = (y, ks) => { if (!ks.length) return null; if (!DS.k || ks.indexOf(DS.k) < 0) DS.k = ks[0]; let cx = 16; T('Run', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 34; ks.forEach(k => { const lb = clipT(runLab(k), 300, 10.5, DS.k === k); if (cx + chipW(lb) > W - 20) { cx = 50; y += 28; } cx += chip(cx, y, lb, DS.k === k, () => { DS.k = k; DS.yr = null; }, 'show the run ' + runLong(k)); }); return y + 34; };
  const tot = a => (a || []).reduce((s, x) => s + (ok(x) ? x : 0), 0);
  const COLRUN = i => ['#2b83ba', '#d53e4f', '#4d9221', '#8E3B8E', '#E8912D', '#5aa6b4', '#c8861c', '#1B3A6B', '#b39ddb', '#8E5A2A'][i % 10];

  // ------------------------------------------------------------------ D5 chemical leaching against the drinking-water limit
  const CX = { rate: 1 };
  const chemStat = r => { const c = r.chem, n = c.spray.length, A = tot(c.spray), Lc = tot(c.leach), Dm = tot(r.D), conc = Dm > 0 ? Lc * 1e5 / Dm : NaN, perS = A / Math.max(1, n);   // µg/L: kg/ha over mm of water (1 mm on 1 ha = 10 000 L)
    const season = c.leach.map((l, i) => (r.D[i] > 0 ? l * 1e5 / r.D[i] : NaN)); return { A, Lc, Dm, frac: A > 0 ? Lc / A : NaN, conc, perS, season, dec: A > 0 ? tot(c.decay) / A : NaN, up: A > 0 ? tot(c.uptake) / A : NaN, ro: A > 0 ? tot(c.runoff) / A : NaN, left: A > 0 ? c.stock[n - 1] / A : NaN, harv: A > 0 ? tot(c.harvest) / A : NaN }; };
  const chemName = k => { const m = metaOf(k); return m.chem || runLab(k); };
  function drawCX() {
    paper(); let y = K.header('Chemicals in the water below the field: the drinking-water limit', texLabel() + ' · how much of a pesticide, PFAS or tracer leaves the root zone, and how its concentration in the drainage water compares with the limit of 0.1 µg per litre', 4);
    const ks = allRuns(r => r.chem && r.chem.spray && tot(r.chem.spray) > 0); if (!ks.length) { K.TF('Run a chemical question first: Daisy model, Scenarios, theme Chemicals (Pesticides of the Daisy library, PFAS, How strongly the chemical is held), or an experiment with a chemical. The layer then lists every chemical you ran.', 30, y + 20, { s: 10.5 }); waiting(y + 40); return; }
    y = source(y, []); y += 6; y = pickFrom(y, ks); const r = L().runs[DS.k], s = chemStat(r), sc = CX.rate / Math.max(1e-12, s.perS);
    let cx = 16; T('Dose of the product', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 124; [0.1, 0.25, 0.5, 1, 2].forEach(v => { if (cx > W - 150) { cx = 140; y += 28; } cx += chip(cx, y, v + ' kg/ha a season', CX.rate === v, () => { CX.rate = v; }, 'scale the results to this dose'); }); if (cx > W - 190) { cx = 140; y += 28; } cx += chip(cx, y, 'as run (' + fmt(s.perS, s.perS < 10 ? 2 : 0) + ' kg/ha)', CX.rate === s.perS, () => { CX.rate = s.perS; }, 'the dose of the Daisy run'); y += 30;
    sidWrap('With linear sorption and first-order decay, as in these runs, every amount leached grows in proportion to the dose: the results are scaled from the dose of the run to the dose you choose. The rotation of the built-in farm sprays at every fertilisation.', 30, y + 2, W - 60, { s: 9.5, c: MUTE }, 13); y += 34;
    // 1 the fingerprint of every run: where the chemical goes
    const parts = [['decayed', '#8E5A2A', 'dec'], ['taken up', '#2E9E4F', 'up'], ['harvested or dissipated', '#c8861c', 'harv'], ['runoff', '#2b83ba', 'ro'], ['leached', '#d53e4f', 'frac'], ['left in the soil', '#E8C547', 'left']], rh = 24, fh = 76 + ks.length * rh; frame0(y, fh, 'Where each chemical goes', 'share of all that was applied over the seasons · every run you made, tap one to show it');
    const bx = Math.min(300, W * 0.32), bw = W - 32 - bx - 30; ks.forEach((k, i) => { const q = chemStat(L().runs[k]), yy = y + 44 + i * rh, sel = k === DS.k; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 2, W - 34, rh - 2); } T(chemName(k).slice(0, 44), 30, yy + 14, { s: 10, b: sel }); let x = bx, sum0 = parts.reduce((a, p) => a + Math.max(0, q[p[2]] || 0), 0) || 1; parts.forEach(p => { const v = Math.max(0, q[p[2]] || 0) / sum0, w = v * bw; ctx.fillStyle = p[1]; ctx.fillRect(x, yy + 4, w, rh - 10); if (w > 34) T(fmt(100 * v, v < 0.1 ? 1 : 0) + ' %', x + w / 2, yy + 15, { s: 8.5, c: '#fff', a: 'center', b: true }); x += w; }); hot(17, yy - 2, W - 34, rh - 2, () => { DS.k = k; }, chemName(k) + ': leached ' + fmt(100 * q.frac, 3) + ' %'); });
    K.legend(parts.map(p => [p[1], p[0]]), 62, y + fh - 16); y += fh + 10;
    // 2 concentration against the limit, every run, at the chosen dose
    const rows = ks.map(k => { const q = chemStat(L().runs[k]), f = CX.rate / Math.max(1e-12, q.perS), c = q.conc * f, over = q.season.filter(v => ok(v) && v * f > 0.1).length; return { k, lab: chemName(k), v: c, c: c > 0.5 ? '#B3261E' : c > 0.1 ? '#E8912D' : c > 0.01 ? '#E8C547' : '#1E8E3E', txt: (ok(c) ? (c === 0 ? '0' : c < 0.001 ? c.toExponential(1) : fmt(c, c < 1 ? 3 : 1)) : 'n/a') + ' µg/L · ' + over + ' of ' + q.season.length + ' seasons over 0.1' }; }).sort((a, b) => (b.v || 0) - (a.v || 0));
    y = hbarList(y, 'Mean concentration in the water draining below the root zone', 'flow-weighted mean of all seasons at ' + fmt(CX.rate, 2) + ' kg/ha a season, µg per litre, log scale · red over 0.5, orange over 0.1 µg/L', rows, { log: true, lines: [{ v: 0.1, lab: '0.1 µg/L: limit for one pesticide (EU 2020/2184) and for the sum of 20 PFAS', c: '#B3261E' }], unit: 'µg/L' });
    // 3 season by season for the chosen run
    const ser = s.season.map(v => v * sc), labels = r.year.map(v => String(v - 1)); frame0(y, 300, 'Season by season: ' + chemName(DS.k), 'concentration in the drainage water at ' + fmt(CX.rate, 2) + ' kg/ha a season, µg per litre; the red line is 0.1 µg/L');
    const gb = groupBars(16, y, W - 32, 270, labels, [{ n: 'concentration', c: '#d53e4f', v: ser }], { unit: 'µg/L' }); if (gb.hi > 0.1) { const yy = gb.y0 + gb.hh - 0.1 / gb.hi * gb.hh; ctx.strokeStyle = '#B3261E'; ctx.setLineDash([5, 3]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gb.x0, yy); ctx.lineTo(gb.x0 + gb.ww, yy); ctx.stroke(); ctx.setLineDash([]); } y += 312;
    // 4 what it means
    const cS = s.conc * sc, worst = rows[0]; frame0(y, 150, 'What the results say', chemName(DS.k)); [
      'Over ' + r.year.length + ' seasons ' + fmt(100 * s.frac, s.frac < 0.001 ? 4 : 2) + ' % of what was applied left the root zone with ' + fmt(s.Dm / r.year.length) + ' mm of drainage a season; ' + fmt(100 * s.dec, 1) + ' % decayed and ' + fmt(100 * s.left, 1) + ' % is still in the soil at the end.',
      'At ' + fmt(CX.rate, 2) + ' kg/ha a season the mean concentration of the drainage water is ' + (cS < 0.001 ? cS.toExponential(1) : fmt(cS, 3)) + ' µg/L: ' + (cS > 0.1 ? fmt(cS / 0.1, 1) + ' times the limit of 0.1 µg/L.' : 'below the limit of 0.1 µg/L.') + ' Drainage water is not yet groundwater: dilution and further decay below the root zone usually lower it.',
      'Of all runs, ' + worst.lab + ' reaches the highest concentration. ' + (rows.filter(q => q.v > 0.1).length ? rows.filter(q => q.v > 0.1).length + ' of the ' + rows.length + ' runs exceed the limit at this dose.' : 'None of the runs exceeds the limit at this dose.')
    ].forEach((t, i) => sidWrap(t, 30, y + 44 + i * 34, W - 60, { s: 10.5, c: i === 1 ? (cS > 0.1 ? '#B3261E' : '#1E6B3A') : INK, b: i === 1 }, 14)); y += 160;
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench; the chemicals and their sorption and decay are those of the Daisy library. Drinking-water limits: Directive (EU) 2020/2184.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }

  // ------------------------------------------------------------------ D6 trade-offs: yield against nitrate, water and nitrous oxide, with the best edge
  const TW = { w: 'bal' }, WEIGHTS = { yield: ['Yield first', 1, 0.2, 0.1, 0.1], bal: ['Balanced', 1, 1, 0.5, 0.5], env: ['Environment first', 0.5, 1.5, 0.3, 1], water: ['Water saving', 0.8, 0.5, 1.5, 0.2] };
  const tstat = r => { const Y = mean(yieldSeries(r)), NL = mean(r.NL), I = mean(r.I), D = mean(r.D), N2O = r.N2O ? mean(r.N2O) : NaN, F = mean(r.Nfert), U = mean(r.Nup); return { Y, NL, I, D, N2O, NUE: F > 0 ? U / F : NaN }; };
  function front(P, better) { const s = P.slice().sort((a, b) => a.x - b.x), out = []; let best = -Infinity; s.forEach(p => { if (p.y > best + 1e-9) { out.push(p); best = p.y; } }); return out; }
  function drawTR() {
    paper(); let y = K.header('Trade-offs: yield against nitrate, water and nitrous oxide', texLabel() + ' · every run you made as one point; the green line is the best edge: no other run gives more yield for the same loss', 4);
    const ks = allRuns(r => r.harvest && r.NL); if (ks.length < 2) { K.TF('Run at least two answers of a question (Scenarios or Experiments) to compare them here.', 30, y + 20, { s: 10.5 }); waiting(y + 40); return; }
    y = source(y, []); y += 6; y = pickFrom(y, ks); const S0 = ks.map((k, i) => Object.assign({ k, i }, tstat(L().runs[k])));
    const P1 = S0.map(q => ({ x: q.NL, y: q.Y, r: 5 + Math.min(14, q.I / 15), c: COLRUN(q.i), lab: runLab(q.k), k: q.k, tag: runLab(q.k) })), F1 = front(P1); F1.forEach(p => { p.front = true; });
    y = scatter(y, 380, 'Yield against nitrate leached', 'mean of the seasons · the size of a dot is the irrigation · green: the best edge (more yield is only possible with more leaching)', P1, { xt: 'nitrate leached below 1 m (kg N/ha a year)', yt: 'Mg/ha', front: F1 });
    const P2 = S0.map(q => ({ x: q.I + q.D, y: q.Y, r: 7, c: COLRUN(q.i), lab: runLab(q.k), k: q.k, tag: runLab(q.k) })), F2 = front(P2); F2.forEach(p => { p.front = true; });
    y = scatter(y, 340, 'Yield against water used and lost', 'irrigation plus drainage below 1 m, mm a year', P2, { xt: 'irrigation + drainage (mm a year)', yt: 'Mg/ha', front: F2 });
    if (S0.some(q => ok(q.N2O))) { const P3 = S0.filter(q => ok(q.N2O)).map(q => ({ x: q.N2O, y: q.Y, r: 7, c: COLRUN(q.i), lab: runLab(q.k), k: q.k, tag: runLab(q.k) })); y = scatter(y, 320, 'Yield against nitrous oxide', 'N2O from nitrification and denitrification, kg N2O-N per ha a year', P3, { xt: 'N2O (kg N2O-N/ha a year)', yt: 'Mg/ha', front: front(P3) }); }
    // the ranking with the weights you choose
    let cx = 16; T('What matters most', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 116; Object.keys(WEIGHTS).forEach(w => { cx += chip(cx, y, WEIGHTS[w][0], TW.w === w, () => { TW.w = w; }, 'rank the runs with these weights'); }); y += 32;
    const Wt = WEIGHTS[TW.w], nz = (k, inv) => { const v = S0.map(q => q[k]).filter(ok), lo = Math.min(...v), hi = Math.max(...v); return q => !ok(q[k]) || hi - lo < 1e-12 ? 0.5 : inv ? (hi - q[k]) / (hi - lo) : (q[k] - lo) / (hi - lo); }, fY = nz('Y'), fN = nz('NL', 1), fW = nz('I', 1), fG = nz('N2O', 1);
    S0.forEach(q => { q.score = (Wt[1] * fY(q) + Wt[2] * fN(q) + Wt[3] * fW(q) + Wt[4] * fG(q)) / (Wt[1] + Wt[2] + Wt[3] + Wt[4]); q.onF = F1.some(p => p.k === q.k); }); const rk = S0.slice().sort((a, b) => b.score - a.score);
    y = hbarList(y, 'Ranking: ' + Wt[0], 'score 0 to 1 from yield (weight ' + Wt[1] + '), nitrate (' + Wt[2] + '), irrigation (' + Wt[3] + ') and N2O (' + Wt[4] + '); each scaled between the best and the worst run', rk.map(q => ({ k: q.k, lab: runLab(q.k) + (q.onF ? '  (best edge)' : ''), v: q.score, c: q.onF ? '#1E8E3E' : '#2b83ba', txt: fmt(q.score, 2) + ' · ' + fmt(q.Y, 2) + ' Mg/ha · ' + fmt(q.NL, 1) + ' kg N' })), {});
    const b = rk[0]; K.TF('With these weights the best run is ' + runLab(b.k) + ': ' + fmt(b.Y, 2) + ' Mg/ha, ' + fmt(b.NL, 1) + ' kg N/ha leached, ' + fmt(b.I) + ' mm irrigation' + (ok(b.N2O) ? ', ' + fmt(b.N2O, 2) + ' kg N2O-N/ha' : '') + '. Runs off the green edge are beaten on both counts by another run.', 30, y + 4, { s: 10.5, b: true, c: '#1E6B3A' }); y += 26;
    y = runTable(y, 'Every run side by side', 'means of the seasons · tap a run to show it', ['Run', 'Yield, Mg/ha', 'Nitrate, kg N/ha', 'Irrigation, mm', 'Drainage, mm', 'N2O, kg N/ha', 'NUE, %', 'Score'], q => { const t = tstat(q), sq = S0.find(z => L().runs[z.k] === q); return [fmt(t.Y, 2), fmt(t.NL, 1), fmt(t.I), fmt(t.D), ok(t.N2O) ? fmt(t.N2O, 2) : 'n/a', fmt(100 * t.NUE), sq ? fmt(sq.score, 2) : '']; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. The best edge (Pareto front) keeps the runs no other run beats in both yield and loss.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }

  // ------------------------------------------------------------------ D7 the return of irrigation: response curve, economic optimum, where the water goes
  const IR = { p: 0.005 };
  function drawIR() {
    paper(); let y = K.header('The return of irrigation: how much water pays, and where it goes', texLabel() + ' · the yield response to the water given, the amount that pays at your price ratio, and the share of each millimetre the crop really uses', 4);
    const ks = allRuns(r => r.harvest && r.I && r.P), S0 = ks.map((k, i) => ({ k, i, s: wstat(L().runs[k]) })), dry = S0.filter(q => q.s.I < 1), wet = S0.filter(q => q.s.I >= 1);
    if (!dry.length || !wet.length) { K.TF('Run a question with a rainfed run and at least one irrigated run: Scenarios, Water (any question), or an experiment with irrigation. The rainfed run is the reference.', 30, y + 20, { s: 10.5 }); waiting(y + 40); return; }
    y = source(y, []); y += 6; y = pickFrom(y, wet.map(q => q.k)); const refFor = k => dry.find(q => metaOf(q.k).sc && metaOf(q.k).sc === metaOf(k).sc) || dry[0], ref = refFor(DS.k), b = ref.s;
    // the response curve: yield against the irrigation given, with a quadratic fit
    const pts = S0.map(q => ({ x: q.s.I, y: q.s.Y, r: 7, c: q.s.I < 1 ? '#d53e4f' : COLRUN(q.i), lab: runLab(q.k), k: q.k, tag: runLab(q.k) })), X = pts.map(p => p.x), Yv = pts.map(p => p.y);
    let fitq = null; if (new Set(X.map(v => Math.round(v))).size >= 3) { const n = X.length, s = (f) => X.reduce((a, x, i) => a + f(x, Yv[i]), 0), M = [[n, s(x => x), s(x => x * x)], [s(x => x), s(x => x * x), s(x => x ** 3)], [s(x => x * x), s(x => x ** 3), s(x => x ** 4)]], v = [s((x, yy) => yy), s((x, yy) => x * yy), s((x, yy) => x * x * yy)];
      const det = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]), d0 = det(M); if (Math.abs(d0) > 1e-9) { const c = [0, 1, 2].map(j => det(M.map((row, i) => row.map((q, jj) => jj === j ? v[i] : q))) / d0); fitq = c; } }
    const Imax = Math.max(...X), curve = fitq ? Array.from({ length: 41 }, (_, i) => { const I = Imax * 1.1 * i / 40; return [I, fitq[0] + fitq[1] * I + fitq[2] * I * I]; }) : null;
    let opt = null; if (fitq && fitq[2] < 0) { opt = Math.max(0, (IR.p - fitq[1]) / (2 * fitq[2])); }
    let cx = 16; T('Price ratio', cx, y + 15, { s: 10, b: true, c: MUTE }); cx += 80; [[0, 'water free'], [0.002, '1 mm = 2 kg grain'], [0.005, '1 mm = 5 kg grain'], [0.01, '1 mm = 10 kg grain'], [0.02, '1 mm = 20 kg grain']].forEach(q => { cx += chip(cx, y, q[1], IR.p === q[0], () => { IR.p = q[0]; }, 'the cost of 1 mm of irrigation on 1 ha in kg of crop'); }); y += 32;
    y = scatter(y, 380, 'Yield response to irrigation', 'mean of the seasons · red: rainfed reference · dashed: quadratic fit' + (opt != null ? ' · the line marks the amount that pays at this price ratio' : ''), pts, { xt: 'irrigation (mm a year)', yt: 'Mg/ha', curve, vlines: opt != null && opt <= Imax * 1.1 ? [{ v: opt, lab: 'pays up to ' + fmt(opt) + ' mm', c: '#1E8E3E' }] : [], y0: Math.max(0, Math.floor(Math.min(...Yv) * 0.8)) });
    // where each millimetre goes
    const rows = wet.map(q => { const s = q.s, b = refFor(q.k).s, I = Math.max(1, s.I), dE = (s.ETa - b.ETa) / I, dD = (s.D - b.D) / I, dR = (s.Ro - b.Ro) / I; return { q, dE, dD, dR, rest: 1 - dE - dD - dR, gain: s.Y - b.Y, mwp: (s.Y - b.Y) * 100 / I }; });
    const rh = 24, fh = 78 + rows.length * rh; frame0(y, fh, 'Where each millimetre of irrigation goes', 'against the rainfed run of the same question: extra evapotranspiration (used by the crop), extra drainage, extra runoff, and the rest (stored in the soil)'); const bx = Math.min(300, W * 0.32), bw = W - 32 - bx - 150;
    const PART = [['used by the crop', '#2E9E4F', 'dE'], ['drained below 1 m', '#5aa6b4', 'dD'], ['runoff', '#d53e4f', 'dR'], ['stored in the soil', '#E8C547', 'rest']];
    rows.forEach((r0, i) => { const yy = y + 44 + i * rh, sel = r0.q.k === DS.k; if (sel) { ctx.fillStyle = '#FFF4C8'; ctx.fillRect(17, yy - 2, W - 34, rh - 2); } T(clipT(runLab(r0.q.k), bx - 40, 10, sel), 30, yy + 14, { s: 10, b: sel }); let x = bx; PART.forEach(p => { const v = Math.max(0, r0[p[2]]), w = Math.min(1, v) * bw; ctx.fillStyle = p[1]; ctx.fillRect(x, yy + 4, w, rh - 10); if (w > 30) T(fmt(100 * v) + ' %', x + w / 2, yy + 15, { s: 8.5, c: '#fff', a: 'center', b: true }); x += w; }); T(fmt(Math.abs(r0.mwp) < 0.05 ? 0 : r0.mwp, 1) + ' kg/m³ extra', W - 24, yy + 14, { s: 10, a: 'right', b: sel }); hot(17, yy - 2, W - 34, rh - 2, () => { DS.k = r0.q.k; }, runLab(r0.q.k)); });
    K.legend(PART.map(p => [p[1], p[0]]), 62, y + fh - 16); y += fh + 10;
    // season by season for the chosen run
    const R = L().runs[DS.k], Rb = L().runs[ref.k], yA = yieldSeries(R), yB = yieldSeries(Rb), labels = R.year.map(v => String(v - 1)), gain = yA.map((v, i) => v - yB[i]);
    frame0(y, 300, 'Season by season: ' + runLab(DS.k) + ' against ' + runLab(ref.k), 'gain in yield (Mg/ha, bars) and the irrigation given (mm, numbers above)'); const gb = groupBars(16, y, W - 32, 270, labels, [{ n: 'gain', c: '#2b83ba', v: gain.map(v => Math.max(0, v)) }], { unit: 'Mg/ha' }); labels.forEach((lb, i) => { if (i % 2) return; T(fmt(R.I[i]), gb.x0 + (i + 0.5) * gb.ww / labels.length, gb.y0 - 4, { s: 8, c: '#2b83ba', a: 'center' }); }); y += 312;
    const r1 = rows.find(q => q.q.k === DS.k) || rows[0], s1 = r1.q.s; frame0(y, 150, 'What the results say', runLab(DS.k)); [
      'Irrigation of ' + fmt(s1.I) + ' mm a year raises the yield by ' + fmt(r1.gain, 2) + ' Mg/ha (' + fmt(100 * r1.gain / (b.Y || 1), 1) + ' %): ' + fmt(r1.mwp, 1) + ' kg of dry matter for each m³ of irrigation water.',
      fmt(100 * r1.dE) + ' % of the irrigation is used by the crop as extra evapotranspiration, ' + fmt(100 * Math.max(0, r1.dD)) + ' % drains below 1 m and ' + fmt(100 * Math.max(0, r1.dR), 1) + ' % runs off.',
      opt != null ? 'The fitted response pays up to about ' + fmt(opt) + ' mm a year at a price of 1 mm = ' + fmt(IR.p * 1000) + ' kg of crop' + (opt < s1.I ? ': this run gives more than pays.' : '.') : fitq ? 'The fitted response is not curved downward, so no economic optimum is found within these runs: try more irrigation amounts (question How much water per irrigation, or Deficit irrigation).' : 'Run at least three irrigation amounts to fit the response curve.'
    ].forEach((t, i) => sidWrap(t, 30, y + 44 + i * 34, W - 60, { s: 10.5, c: i === 2 ? '#1E6B3A' : INK, b: i === 2 }, 14)); y += 160;
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. Marginal water productivity = extra yield / irrigation; the optimum is where the slope of the fitted curve equals the price ratio.', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }

  // ------------------------------------------------------------------ D8 nitrous oxide and the other gaseous nitrogen losses
  const GWP = 273, IPCC = 0.01;   // GWP100 of N2O (IPCC AR6, 2021); default direct emission factor EF1 (IPCC 2019 Refinement)
  const gstat = r => { const N2O = mean(r.N2O), F = mean(r.Nfert), Y = mean(yieldSeries(r)), co2 = N2O * 44 / 28 * GWP; return { N2O, Nd: mean(r.N2Od), Nn: mean(r.N2On), NH3: mean(r.Nvol), Den: mean(r.Nden), F, EF: F > 0 ? N2O / F : NaN, co2, ys: Y > 0 ? co2 / Y : NaN, Y }; };
  function drawGH() {
    paper(); let y = K.header('Nitrous oxide and the nitrogen lost to the air', texLabel() + ' · N2O from nitrification and denitrification, ammonia volatilised, the emission factor against the IPCC default and the climate cost per tonne of crop', 4);
    const ks = allRuns(r => r.N2O && r.N2O.length); if (!ks.length) { K.TF('Run any question in Scenarios or Experiments (Nitrogen questions show the most): the runs then carry N2O. Runs made before this version of SWAFL have no N2O column; run them again.', 30, y + 20, { s: 10.5 }); waiting(y + 40); return; }
    y = source(y, []); y += 6; y = pickFrom(y, ks); const r = L().runs[DS.k], s = gstat(r), labels = r.year.map(v => String(v - 1));
    frame0(y, 300, 'Nitrogen to the air, season by season', 'kg N per ha · N2O from denitrification and from nitrification, ammonia volatilised'); stackBars(16, y, W - 32, 270, labels, [{ n: 'N2O, denitrification', c: '#8E3B8E', v: r.N2Od }, { n: 'N2O, nitrification', c: '#b39ddb', v: r.N2On }, { n: 'NH3 volatilised', c: '#fee08b', v: r.Nvol }], { unit: 'kg N/ha' }); K.legend([['#8E3B8E', 'N2O from denitrification'], ['#b39ddb', 'N2O from nitrification'], ['#fee08b', 'ammonia volatilised']], 62, y + 290); y += 312;
    const S0 = ks.map((k, i) => Object.assign({ k, i }, gstat(L().runs[k])));
    y = hbarList(y, 'Emission factor of every run', 'N2O-N emitted per kg of fertiliser N, %; the dashed line is the IPCC default of 1 %', S0.filter(q => ok(q.EF)).map(q => ({ k: q.k, lab: runLab(q.k), v: 100 * q.EF, c: q.EF > IPCC ? '#B3261E' : '#2b83ba', txt: fmt(100 * q.EF, 2) + ' %' })), { lines: [{ v: 100 * IPCC, lab: 'IPCC default 1 %', c: '#B3261E' }], unit: '%' });
    y = hbarList(y, 'Climate cost of the N2O', 'kg CO2-equivalent per ha a year (N2O-N × 44/28 × 273); the text gives the cost per tonne of dry matter harvested', S0.map(q => ({ k: q.k, lab: runLab(q.k), v: q.co2, c: '#8E3B8E', txt: fmt(q.co2) + ' kg CO2e · ' + fmt(q.ys) + ' per Mg' })), { unit: 'kg CO2e/ha' });
    frame0(y, 150, 'What the results say', runLab(DS.k)); [
      'N2O: ' + fmt(s.N2O, 2) + ' kg N2O-N/ha a year (' + fmt(100 * s.Nd / (s.N2O || 1)) + ' % from denitrification), which is ' + fmt(s.co2) + ' kg CO2-equivalent per ha and ' + fmt(s.ys) + ' kg per Mg of dry matter.',
      ok(s.EF) ? 'Emission factor ' + fmt(100 * s.EF, 2) + ' % of the fertiliser nitrogen: ' + (s.EF > IPCC ? 'above' : 'below') + ' the IPCC default of 1 %. Ammonia volatilised: ' + fmt(s.NH3, 1) + ' kg N/ha a year.' : 'No mineral fertiliser in this run: the N2O comes from the soil nitrogen.',
      s.N2O > 2 ? 'High N2O: wet soil with nitrate drives denitrification. Less nitrogen at a time, no irrigation onto wet soil and good drainage lower it.' : 'N2O is moderate; nitrogen rate and wet periods after fertilisation are the main levers.'
    ].forEach((t, i) => sidWrap(t, 30, y + 44 + i * 34, W - 60, { s: 10.5, c: i === 2 ? '#9A6A00' : INK, b: i === 2 }, 14)); y += 160;
    y = runTable(y, 'Every run side by side', 'means of the seasons · tap a run to show it', ['Run', 'N2O, kg N/ha', 'from denitr., %', 'NH3, kg N/ha', 'Fertiliser, kg N/ha', 'EF, %', 'kg CO2e/ha', 'kg CO2e/Mg'], q => { const t = gstat(q); return [fmt(t.N2O, 2), fmt(100 * t.Nd / (t.N2O || 1)), fmt(t.NH3, 1), fmt(t.F), ok(t.EF) ? fmt(100 * t.EF, 2) : 'n/a', fmt(t.co2), fmt(t.ys)]; });
    T('Calculated with the Daisy model (Hansen et al., 2012) in the Daisy workbench. GWP100 of N2O = 273 (IPCC AR6, 2021); default emission factor EF1 = 1 % (IPCC 2019 Refinement).', 16, y + 8, { s: 9, i: true, c: MUTE }); fit(y + 20);
  }

  // the charts of the Dashboard for these layers
  const prevSeries = window.layerSeries;
  window.layerSeries = function (id) {
    if (['dchx', 'dtrd', 'dirr', 'dghg'].includes(id)) { const ks = runKeys(); if (!ks.length) return null; const k = DS.k && ks.includes(DS.k) ? DS.k : ks[0], r = L().runs[k], S2 = (n, v, c) => ({ n, v: (v || []).map(x => x == null || !isFinite(x) ? null : +(+x).toFixed(4)), c }), C2 = (t, u, ser) => ({ t: t + ' · ' + runLab(k), u, ser: ser.filter(Boolean) }), yrs = r.year.map(v => String(v - 1));
      if (id === 'dchx' && r.chem) return { years: yrs, sel: null, charts: [C2('Chemical leached', 'kg/ha', [S2('leached', r.chem.leach, '#d53e4f')]), C2('Concentration in the drainage water (dose of the run)', 'µg/L', [S2('concentration', r.chem.leach.map((l, i) => r.D[i] > 0 ? l * 1e5 / r.D[i] : null), '#B3261E')])] };
      if (id === 'dghg' && r.N2O) return { years: yrs, sel: null, charts: [C2('N2O', 'kg N/ha', [S2('denitrification', r.N2Od, '#8E3B8E'), S2('nitrification', r.N2On, '#b39ddb')]), C2('Ammonia volatilised', 'kg N/ha', [S2('NH3', r.Nvol, '#c9a400')])] };
      return { years: yrs, sel: null, charts: [C2('Yield', 'Mg/ha', [S2('yield', yieldSeries(r), '#4d9221')]), C2('Irrigation and drainage', 'mm', [S2('irrigation', r.I, '#2b83ba'), S2('drainage', r.D, '#5aa6b4')]), C2('Nitrate leached', 'kg N/ha', [S2('leached', r.NL, '#d53e4f')])] }; }
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
  K.add('dchx', 'D5 Chemicals and drinking water', '#B3261E', drawCX, 'How much of a pesticide, PFAS or tracer leaves the root zone, against the 0.1 µg/L limit', 'Sorption holds a chemical in the topsoil and decay removes it; what is left is carried down by the drainage water, where the drinking-water limit of 0.1 µg per litre applies.');
  K.add('dtrd', 'D6 Trade-offs and the best edge', '#1E8E3E', drawTR, 'Yield against nitrate, water and N2O for every run, with the Pareto front and a ranking', 'No run is best on everything: the best edge keeps the runs no other run beats on both yield and loss, and your weights rank them.');
  K.add('dirr', 'D7 The return of irrigation', '#2b83ba', drawIR, 'Yield response to irrigation, the amount that pays, and where each millimetre goes', 'Each extra millimetre brings less yield: the response curve, the price ratio and the share of the water the crop uses decide how much irrigation pays.');
  K.add('dghg', 'D8 Nitrous oxide and gaseous nitrogen', '#8E3B8E', drawGH, 'N2O from nitrification and denitrification, ammonia, the emission factor and CO2-equivalents', 'Nitrogen in wet soil is denitrified to N2O, a greenhouse gas 273 times stronger than CO2: the emission factor shows how much of the fertiliser ends in the air.');
  // the seasons of the Daisy layers carry on after the last simulated season, with the same climate trend as the other year-by-year layers
  { const base = window.layerSeries;
    window.layerSeries = function (id) {
      const D = base(id); if (!D || !['dwb', 'dnb', 'dyr', 'dirr', 'dghg', 'dchx'].includes(id) || !window.projN || !window.projN() || !D.years || D.years.length < 6) return D;
      const nO = D.years.length, n = window.projN(), F = window.projPlan(n, nO), y0 = +D.years[nO - 1];
      const fOf = (t, nm) => { const q = (t + ' ' + nm).toLowerCase(); return /irrigat/.test(q) ? 'I' : /drain|leach|runoff/.test(q) ? 'D' : /rain/.test(q) ? 'P' : /yield/.test(q) ? 'Y' : /evap|transp|uptake/.test(q) ? 'U' : /stress/.test(q) ? 'WS' : null; };
      D.charts.forEach(c => c.ser.forEach(q => { const f = fOf(c.t, q.n); q.v = q.v.concat(F.map(g => { const v = q.v[g.s]; return v == null || !isFinite(v) ? null : f ? +(v * g[f]).toFixed(3) : v; })); }));
      D.years = D.years.concat(F.map((_, j) => String(y0 + j + 1))); D.nObs = nO; D.nProj = n; D.note = window.projNote(); return D;
    }; }
  window.DAISYLAYERS = { ids: ['chem', 'dsum', 'dwb', 'dnb', 'dyr', 'dchx', 'dtrd', 'dirr', 'dghg'] };
})();
