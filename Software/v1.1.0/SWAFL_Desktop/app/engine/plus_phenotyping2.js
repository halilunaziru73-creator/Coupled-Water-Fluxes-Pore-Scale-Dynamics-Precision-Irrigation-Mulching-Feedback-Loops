/* SWAFL 1.1 layer P1 Deterministic phenotyping (part 2): water and uptake, carbon and roots, what the roots meet in the soil,
   roots predicted from the plant above ground, the traits of the run, observations with calibration, and the equations. */
'use strict';
(function () {
  const U = window.PHUI; if (!U) return;
  const { BASE, scrub, runNow, RN, RNc, projObj, nResponse, libCrop, PH, P, K, SECTIONS, chip, chipRow, mix, pal, wcol, day, dateOf, R, N, NL, DZ, ZMAX, effGeno, cfgFor, keyOf, seriesVals, SETS, OBSK, regimeShade } = U;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, TF = K.TF, HEAD = '#1B1F23', GRID = '#E6E2D6', NAVY = '#1B3A6B';
  const sum = (a, i0, i1) => { let s = 0; for (let i = i0; i <= i1; i++) s += a[i]; return s; };
  const mean = (a, i0, i1) => sum(a, i0, i1) / Math.max(1, i1 - i0 + 1);
  const pear = (x, y) => { const n = x.length; if (n < 3) return NaN; const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN; };
  const linfit = (x, y) => { const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; } const b = sxx > 0 ? sxy / sxx : 0, r = pear(x, y); return { a: my - b * mx, b, r2: isFinite(r) ? r * r : 0 }; };
  const note = (txt, x, y, w, o) => sidWrap(txt, x, y, w, Object.assign({ s: 9.5, c: MUTE }, o || {}), 12.5);
  const frameH = (x, y, w, title, sub) => K.frame(x, y, w, 24, title, sub);
  const endFrame = (x, y0, y, w) => { ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y0 + 0.5, w - 1, y - y0); };

  // ================================================================== water of the column and the uptake of the roots
  function drawWater(y) {
    const w = W - 32, cx = 16, a = R('ww'), b = R('dr'), d = day(), y0 = y; frameH(cx, y, w, 'Water: demand, supply and where the roots take it', 'transpiration of the plant against the soil water of every layer');
    y += 32; const x0 = cx + 46, ww = w - 62, hh = 112, top = y + 6;
    // daily water use
    const mx = K.nice(Math.max(...a.Tp, ...b.Tp, 1) * 1.1), X = i => x0 + ww * i / (N - 1), Y = v => top + hh - v / mx * hh;
    regimeShade().forEach(s => { ctx.fillStyle = s[2]; ctx.fillRect(X(s[0]), top, X(s[1]) - X(s[0]), hh); });
    K.yAxis(x0, top, ww, hh, 0, mx, 'mm/day', 4);
    for (let i = 0; i < N; i++) { if (b.I[i] > 0.3) { ctx.fillStyle = 'rgba(46,125,232,0.55)'; ctx.fillRect(X(i) - 1, top, 2.4, Math.min(30, b.I[i] / mx * hh * 0.5)); } if (b.P[i] > 0.3) { ctx.fillStyle = 'rgba(120,130,145,0.55)'; ctx.fillRect(X(i) - 1, top + hh - Math.min(26, b.P[i] / mx * hh), 2.4, Math.min(26, b.P[i] / mx * hh)); } }
    const line = (arr, c, wd, dash) => { ctx.strokeStyle = c; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.beginPath(); for (let i = 0; i < N; i++) { const yy = Y(arr[i]); i ? ctx.lineTo(X(i), yy) : ctx.moveTo(X(i), yy); } ctx.stroke(); ctx.setLineDash([]); };
    line(a.Tp, '#8A94A3', 1.3, [4, 3]); line(a.T, '#1B1F23', 2); line(b.T, '#D93025', 2); line(b.Es, '#A8742E', 1.2);
    ctx.strokeStyle = '#2E7DE8'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d), top); ctx.lineTo(X(d), top + hh); ctx.stroke(); ctx.setLineDash([]);
    for (let t = 0; t <= N - 1; t += 20) T(String(t), X(t), top + hh + 12, { s: 8.5, c: MUTE, a: 'center' });
    K.legend([['#8A94A3', 'what the canopy asks (potential)'], ['#1B1F23', 'transpired, ' + RN()], ['#D93025', 'transpired, drought'], ['#A8742E', 'soil evaporation, drought'], ['rgba(46,125,232,0.7)', 'water applied'], ['rgba(120,130,145,0.7)', 'rain']], x0, top + hh + 30);
    y = top + hh + 52;
    // heat maps of the relative plant-available water, with the front of the roots
    const hw = (w - 24) / 2 - 76, ch = 14 * NL;
    [['ww', RNc(), a], ['dr', 'Drought', b]].forEach(([tr, lab, res], ci) => {
      const hx = cx + 12 + ci * (hw + 76 + 8) + 30, hy = y + 16; T(lab + ': plant-available water of every layer', hx - 30, y + 8, { s: 9.5, b: true, c: tr === 'dr' ? '#D93025' : '#1B1F23' });
      for (let i = 0; i < N; i++) for (let k = 0; k < NL; k++) { ctx.fillStyle = wcol(res.w[i * NL + k]); ctx.fillRect(hx + hw * i / N, hy + k * 14, hw / N + 0.6, 14.3); }
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < N; i++) { const yy = hy + res.Rdepth[i] / ZMAX * ch; i ? ctx.lineTo(hx + hw * i / N, yy) : ctx.moveTo(hx, yy); } ctx.stroke();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(hx + hw * d / N, hy); ctx.lineTo(hx + hw * d / N, hy + ch); ctx.stroke(); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(hx + 0.5, hy + 0.5, hw - 1, ch - 1);
      for (let k = 0; k <= 4; k++) T(String(k * 30), hx - 4, hy + k * 30 / ZMAX * ch + 3, { s: 8, c: MUTE, a: 'right' }); T('cm', hx - 4, hy - 3, { s: 8, c: MUTE, a: 'right' });
      // uptake of the day by layer
      let um = 0.01; for (let k = 0; k < NL; k++) um = Math.max(um, res.up[d * NL + k]); const ux = hx + hw + 4; for (let k = 0; k < NL; k++) { const v = res.up[d * NL + k]; ctx.fillStyle = '#2E9E4F'; ctx.fillRect(ux, hy + k * 14 + 2, Math.max(0.5, v / um * 26), 10); } T('uptake', ux, hy + ch + 11, { s: 8, c: MUTE });
      hot(hx, hy, hw, ch, p => { play.t = clamp((p.x - hx) / hw, 0, 1); play.on = false; }, 'click to move the day');
    });
    y += 16 + ch + 26; K.legend([['#C9A65E', 'dry (no available water)'], ['#2E6FBF', 'at field capacity'], ['#FFFFFF', 'deepest root']], cx + 12, y); y += 14;
    // totals
    const row = (lab, f) => { T(lab, cx + 12, y, { s: 9.5, c: MUTE }); T(f(a), cx + 270, y, { s: 9.5, b: true, a: 'right' }); T(f(b), cx + 370, y, { s: 9.5, b: true, c: '#D93025', a: 'right' }); y += 13; };
    T('Season total (mm)', cx + 12, y, { s: 9.5, b: true }); T(RN(), cx + 270, y, { s: 9, c: MUTE, a: 'right' }); T('drought', cx + 370, y, { s: 9, c: MUTE, a: 'right' }); y += 13;
    row('transpiration', r => fmt(r.totals.T)); row('soil evaporation', r => fmt(r.totals.Es)); row('water applied and rain', r => fmt(r.totals.I + r.totals.P)); row('drained below 1.2 m', r => fmt(r.totals.dr));
    const nt = note('Uptake of a layer is its conductance (root length, fine roots, conductivity of the soil) times the potential difference to the root collar (Gardner; Feddes). When the soil dries the conductivity falls, the leaf potential falls, the stomata close and the canopy warms: the same chain that the thermal camera and the leaf water content record.', cx + 12, y + 6, w - 24); y += 6 + nt * 12.5 + 8;
    endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== carbon: assimilation, allocation and the response of the roots
  function lagCorr(res) { const out = [], a = res.dW, r = res.dL, ma = (q, t) => { let s = 0, c = 0; for (let k = Math.max(0, t - 3); k <= Math.min(N - 1, t + 3); k++) { s += q[k]; c++; } return s / c; }; for (let lag = 0; lag <= 8; lag++) { const xs = [], ys = []; for (let t = 12 + lag; t < N - 5; t++) { if (res.stage[t] >= 1.4) break; xs.push(a[t - lag] - ma(a, t - lag)); ys.push(r[t] - ma(r, t)); } out.push(pear(xs, ys)); } return out; }   // day-to-day fluctuations around a seven-day mean, so the common trend does not hide the delay
  function drawCarbon(y) {
    const w = W - 32, cx = 16, a = R('ww'), b = R('dr'), d = day(), y0 = y; frameH(cx, y, w, 'Carbon: assimilation, allocation, root and shoot growth', 'what the leaves make, where it goes, and how the roots answer');
    y += 32; const cw = (w - 32) / 2, hh = 112; const COL = { Wl: '#4FA64F', Ws: '#A8B04A', Wr: '#8E5A2A', Wg: '#E2B53A' };
    [['ww', RNc(), a], ['dr', 'Drought', b]].forEach(([tr, lab, res], ci) => {
      const x0 = cx + 40 + ci * (cw + 16), top = y + 16; T(lab + ': dry mass of the plant parts (g/m²)', x0 - 30, y + 8, { s: 9.5, b: true, c: tr === 'dr' ? '#D93025' : '#1B1F23' });
      let mx = 10; for (let i = 0; i < N; i++) mx = Math.max(mx, res.Wl[i] + res.Ws[i] + res.Wr[i] + res.Wg[i]); mx = K.nice(mx * 1.05); K.yAxis(x0, top, cw - 24, hh, 0, mx, '', [4, 5, 2, 3].find(t => (mx / t) % 25 === 0 || (mx / t) % 10 === 0) || 4);
      const X = i => x0 + (cw - 24) * i / (N - 1), Y = v => top + hh - v / mx * hh, parts = ['Wr', 'Wl', 'Ws', 'Wg']; const base = new Float64Array(N);
      parts.forEach(k => { ctx.fillStyle = COL[k]; ctx.beginPath(); for (let i = 0; i < N; i++) { const yy = Y(base[i] + res[k][i]); i ? ctx.lineTo(X(i), yy) : ctx.moveTo(X(i), yy); } for (let i = N - 1; i >= 0; i--) ctx.lineTo(X(i), Y(base[i])); ctx.closePath(); ctx.fill(); for (let i = 0; i < N; i++) base[i] += res[k][i]; });
      ctx.strokeStyle = '#2E7DE8'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d), top); ctx.lineTo(X(d), top + hh); ctx.stroke(); ctx.setLineDash([]);
      for (let t = 0; t <= N - 1; t += 20) T(String(t), X(t), top + hh + 12, { s: 8.5, c: MUTE, a: 'center' });
      const sh = res.Wl[d] + res.Ws[d] + res.Wg[d]; TF('day ' + d + ': roots ' + fmt(res.Wr[d]) + ', leaves ' + fmt(res.Wl[d]) + ', stems ' + fmt(res.Ws[d]) + ', grain ' + fmt(res.Wg[d]) + ' · root : shoot ' + fmt(res.Wr[d] / Math.max(0.01, sh), 2), x0 - 30, top + hh + 28, cw - 8, { s: 9, c: '#33414F' });
    });
    y += 16 + hh + 38; K.legend([[COL.Wr, 'roots'], [COL.Wl, 'leaves'], [COL.Ws, 'stems and reserves'], [COL.Wg, 'grain']], cx + 12, y); y += 22;
    // assimilation against the growth of the roots, and the delay between them
    const x0 = cx + 40, hw = cw - 24, top = y + 18; T('Assimilation (bars) and root growth (line), drought plant', cx + 10, y + 4, { s: 9.5, b: true });
    let am = 1, rm = 1; for (let i = 0; i < N; i++) { am = Math.max(am, b.dW[i], a.dW[i]); rm = Math.max(rm, b.dL[i], a.dL[i]); } am = K.nice(am * 1.05); rm = K.nice(rm * 1.05); K.yAxis(x0, top, hw, hh, 0, am, 'g/m²/d', [4, 5, 2, 3].find(t => (am / t) % 25 === 0 || (am / t) % 10 === 0 || (am / t) % 5 === 0) || 4);
    for (let i = 0; i < N; i++) { const hgt = b.dW[i] / am * hh; ctx.fillStyle = 'rgba(79,166,79,0.55)'; ctx.fillRect(x0 + hw * i / N, top + hh - hgt, Math.max(1, hw / N - 0.5), hgt); }
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 1.8; ctx.beginPath(); for (let i = 0; i < N; i++) { const yy = top + hh - b.dL[i] / rm * hh; i ? ctx.lineTo(x0 + hw * i / (N - 1), yy) : ctx.moveTo(x0, yy); } ctx.stroke();
    T('root growth line: 0 to ' + fmt(rm) + ' cm/d', x0 + hw, top - 5, { s: 8.5, c: '#8E5A2A', a: 'right' }); ctx.strokeStyle = '#2E7DE8'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0 + hw * d / (N - 1), top); ctx.lineTo(x0 + hw * d / (N - 1), top + hh); ctx.stroke(); ctx.setLineDash([]);
    const x1 = x0 + hw + 56, bw = Math.max(80, w - (x1 - cx) - 24); T('Delay between assimilation and root growth', x1 - 4, y + 4, { s: 9.5, b: true });
    const ca = lagCorr(a), cb = lagCorr(b); K.yAxis(x1, top, bw, hh, -0.2, 1, '', 3);
    [[ca, '#1B1F23', 0], [cb, '#D93025', 1]].forEach(([cc, col, k]) => cc.forEach((v, i) => { if (!isFinite(v)) return; const bx = x1 + bw * (i + 0.12 + 0.38 * k) / 9, hgt = (clamp(v, -0.2, 1) + 0.2) / 1.2 * hh, z0 = top + hh - 0.2 / 1.2 * hh; ctx.fillStyle = col; ctx.fillRect(bx, Math.min(z0, top + hh - hgt), bw * 0.36 / 9 * 1.0 + 1, Math.abs(z0 - (top + hh - hgt))); }));
    for (let i = 0; i <= 8; i++) T(String(i), x1 + bw * (i + 0.5) / 9, top + hh + 12, { s: 8.5, c: MUTE, a: 'center' }); T('delay in days', x1 + bw, top + hh + 24, { s: 8.5, c: MUTE, a: 'right' });
    const best = cc => { let bi = 0; cc.forEach((v, i) => { if (isFinite(v) && (!isFinite(cc[bi]) || v > cc[bi])) bi = i; }); return bi; }, ba = best(ca), bb = best(cb);
    y = top + hh + 34; const nb = note('Bars: correlation of the daily fluctuation of root growth with the assimilation of the day that many days earlier. Best delay ' + ba + ' d (r = ' + fmt(ca[ba], 2) + ') ' + RN() + ' and ' + bb + ' d (r = ' + fmt(cb[bb], 2) + ') under drought: the carbon of the roots arrives one day after it is made, so the root system follows the leaves.', cx + 12, y, w - 24, { c: '#33414F' }); y += nb * 12.5 + 4;
    const nt = note('Allocation follows functional equilibrium: the root share rises when the water is short (Brouwer; Davidson), the stems keep what the leaf area cannot use, and grain filling takes the carbon after flowering. Leaf area is limited by the turgor of the growing cells (Lockhart) as well as by carbon.', cx + 12, y, w - 24); y += nt * 12.5 + 8;
    endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== soil structure and tillage: what the root tips meet
  function drawSoil(y) {
    const w = W - 32, cx = 16, a = R('ww'), b = R('dr'), d = day(), y0 = y, sp = P.SP[PH.sp]; frameH(cx, y, w, 'Soil structure and tillage: what the root tips meet', 'bulk density and penetration resistance by depth, and the root length that results');
    y += 32; const cw = (w - 32) / 3, hh = 8 * 20, top = y + 20; const bd = [], Qa = [], Qb = [], rea = [], reb = [];
    for (let k = 0; k < NL; k++) { bd.push(b.bd[d * NL + k]); Qa.push(a.Q[d * NL + k]); Qb.push(b.Q[d * NL + k]); rea.push(P.relElong(Qa[k])); reb.push(P.relElong(Qb[k])); }
    const panel = (i, title, f, lo, hi, unit, cols) => { const x0 = cx + 40 + i * (cw + 8), pw = cw - 54; T(title, x0 - 28, y + 10, { s: 9.5, b: true }); for (let k = 0; k <= 4; k++) { const yy = top + k * 30 / ZMAX * hh; ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x0 + pw, yy + 0.5); ctx.stroke(); T(String(k * 30), x0 - 4, yy + 3, { s: 8, c: MUTE, a: 'right' }); } T('cm', x0 - 4, top - 4, { s: 8, c: MUTE, a: 'right' }); T(fmt(lo, 1) + unit, x0, top + hh + 12, { s: 8, c: MUTE }); T(fmt(hi, 1) + unit, x0 + pw, top + hh + 12, { s: 8, c: MUTE, a: 'right' }); f(x0, pw, lo, hi); };
    panel(0, 'Bulk density (g/cm³)', (x0, pw, lo, hi) => { ctx.fillStyle = '#B08A5A'; bd.forEach((v, k) => { ctx.fillRect(x0, top + k * hh / NL + 2, (v - lo) / (hi - lo) * pw, hh / NL - 4); }); }, 1.0, 1.8, '');
    const qm = Math.max(3, ...Qa, ...Qb); panel(1, 'Penetration resistance (MPa)', (x0, pw, lo, hi) => { Qa.forEach((v, k) => { ctx.fillStyle = '#1B1F23'; ctx.fillRect(x0, top + k * hh / NL + 2, v / hi * pw, 7); }); Qb.forEach((v, k) => { ctx.fillStyle = '#D93025'; ctx.fillRect(x0, top + k * hh / NL + 10, v / hi * pw, 7); }); ctx.strokeStyle = '#555'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0 + 2 / hi * pw, top); ctx.lineTo(x0 + 2 / hi * pw, top + hh); ctx.stroke(); ctx.setLineDash([]); T('2 MPa', x0 + 2 / hi * pw + 3, top + 10, { s: 8, c: MUTE }); }, 0, K.nice(qm), '');
    panel(2, 'Root length density (cm per cm³)', (x0, pw, lo, hi) => { for (let k = 0; k < NL; k++) { const va = a.Lz[d * NL + k] / (a.A * DZ), vb = b.Lz[d * NL + k] / (b.A * DZ); ctx.fillStyle = '#1B1F23'; ctx.fillRect(x0, top + k * hh / NL + 2, va / hi * pw, 7); ctx.fillStyle = '#D93025'; ctx.fillRect(x0, top + k * hh / NL + 10, vb / hi * pw, 7); } [[a, '#1B1F23'], [b, '#D93025']].forEach(([res, c]) => { ctx.strokeStyle = c; ctx.setLineDash([4, 3]); const yy = top + res.D95[d] / ZMAX * hh; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + pw, yy); ctx.stroke(); ctx.setLineDash([]); }); }, 0, (() => { let m = 0.2; for (let k = 0; k < NL; k++) m = Math.max(m, a.Lz[d * NL + k] / (a.A * DZ), b.Lz[d * NL + k] / (b.A * DZ)); return K.nice(m); })(), '');
    y = top + hh + 22; K.legend([['#B08A5A', 'bulk density'], ['#1B1F23', RN()], ['#D93025', 'drought']], cx + 12, y); T('dashed: depth of 95 % of the root length', cx + 230, y + 1, { s: 9, c: MUTE }); y += 16;
    const tl = { conv: 'conventional tillage loosens the topsoil and leaves a plough pan below it', reduced: 'reduced tillage loosens the topsoil less and the pan is weaker', notill: 'no-till keeps the topsoil dense, with no pan made by tillage' }[state.till];
    const reTop = (rea[0] + rea[1]) / 2, rePan = rea[2], reDeep = rea[5];
    const nt = note('Tillage setting of the project: ' + tl + '. Settling uses the consolidation rate of the project (' + TC_VALUES[state.tcIdx] + ' per day). Relative root elongation today (' + RN() + '): ' + fmt(reTop * 100) + ' % in the topsoil, ' + fmt(rePan * 100) + ' % at 25 to 40 cm, ' + fmt(reDeep * 100) + ' % at 75 to 90 cm. Dry soil is harder, so the drought plant meets more resistance at the same density.', cx + 12, y + 4, w - 24); y += 4 + nt * 12.5 + 8;
    endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== roots from what is seen above ground: a panel of genotypes run under the same drought
  const GRIDG = []; [26, 44, 62].forEach(an => [0.8, 1.2].forEach(ax => [0.1, 0.7].forEach(sg => GRIDG.push({ angle: an, axr: ax, SG: sg }))));
  const YV = { D95: { t: 'depth of 95 % of the roots (cm)', f: r => r.D95[N - 1] }, L: { t: 'root length of the plant (m)', f: r => r.Lroot[N - 1] / 100 }, deep: { t: 'share of the roots below 60 cm (%)', f: r => { let s = 0, t = 0; for (let k = 0; k < NL; k++) { const v = r.Lz[(N - 1) * NL + k]; t += v; if (k >= 4) s += v; } return 100 * s / Math.max(1e-9, t); } }, grain: { t: 'grain or seed mass (g/m²)', f: r => r.Wg[N - 1] } };
  const PRED = [{ k: 'CTD', t: 'Canopy temperature depression (K)', f: r => r.CTD, c: '#C0392B' }, { k: 'SI', t: 'Senescence index (%)', f: r => r.SI, c: '#8E6B2A' }, { k: 'RWC', t: 'Leaf relative water content (%)', f: r => r.RWC, s: 100, c: '#2E7DE8' }, { k: 'PSA', t: 'Projected shoot area (cm²)', f: r => r.PSA, c: '#2E9E4F' }, { k: 'CWSI', t: 'Crop water stress index', f: r => r.CWSI, c: '#7B2FA8' }];
  function panelStep() {
    if (!PH.run || PH.dragging) return; const k = keyOf(), now = performance.now(); const p = PH.panel;
    if (p.key !== k && !p.busy) { if (now - PH.lastRun < 600) return; PH.panel = { key: k, items: GRIDG.map(g => Object.assign({}, g)), busy: true, i: 0, ph: 0, calc: null }; return; }
    if (!p.busy) return; const it = p.items[p.i]; if (!it) { p.busy = false; return; }
    const g0 = effGeno(); const g = Object.assign({}, g0, { angle: it.angle, axr: it.axr, SG: it.SG });
    try { if (p.ph === 0) { it.ww = P.run(Object.assign(cfgFor('ww', false), { geno: g })); p.ph = 1; } else { it.dr = P.run(Object.assign(cfgFor('dr', false), { geno: g })); p.ph = 0; p.i++; if (p.i >= p.items.length) p.busy = false; } } catch (e) { p.busy = false; console.error(e); }
  }
  U.setPanel(panelStep);
  function regressionAt(dd, pk, yk) { const items = PH.panel.items.filter(i => i.dr), pr = PRED.find(q => q.k === pk), xs = [], ys = []; items.forEach(i => { const v = pr.f(i.dr), s = pr.s || 1; let m = 0, c = 0; for (let t = Math.max(0, dd - 2); t <= Math.min(N - 1, dd + 2); t++) { m += v[t] * s; c++; } xs.push(m / c); ys.push(YV[yk].f(i.dr)); }); return { xs, ys, fit: linfit(xs, ys) }; }
  function drawAbove(y) {
    const w = W - 32, cx = 16, d = day(), y0 = y, p = PH.panel; frameH(cx, y, w, 'Roots from the plant above ground', 'twelve genotypes run under the same drought: how well do shoot traits tell what the roots did?');
    y += 30; let xx = cx + 10; T('Predict', xx, y + 15, { s: 9.5, b: true, c: MUTE }); xx += 52; Object.keys(YV).forEach(k => { xx += chip(xx, y, YV[k].t.split(' (')[0], PH.yv === k, () => { PH.yv = k; }, 'predict the ' + YV[k].t); }); y += 30;
    const done = p.items.filter(i => i.dr).length; if (!p.items.length || p.busy || done < p.items.length) { ctx.fillStyle = '#EFEDE5'; ctx.fillRect(cx + 10, y, w - 20, 16); ctx.fillStyle = '#2E9E4F'; ctx.fillRect(cx + 10, y, (w - 20) * done / Math.max(1, p.items.length), 16); T('running the genotypes ' + done + ' of ' + (p.items.length || GRIDG.length) + ' (angle of the roots, vigour, stay-green)...', cx + 16, y + 12, { s: 9.5, c: '#1B1F23' }); endFrame(cx, y0, y + 26, w); return y + 36; }
    const cw = (w - 36) / 2, hh = 120, sel = PRED.slice(0, 4); let rr = [];
    sel.forEach((pr, i) => {
      const gx = cx + 52 + (i % 2) * (cw + 12), gy = y + Math.floor(i / 2) * (hh + 46) + 18, pw = cw - 48, reg = regressionAt(d, pr.k, PH.yv), xs = reg.xs, ys = reg.ys;
      const xmn = Math.min(...xs), xmx = Math.max(...xs), ymn = Math.min(...ys), ymx = Math.max(...ys), px = (xmx - xmn) * 0.1 + 1e-6, py = (ymx - ymn) * 0.12 + 1e-6, X = v => gx + (v - (xmn - px)) / (xmx - xmn + 2 * px) * pw, Y = v => gy + hh - (v - (ymn - py)) / (ymx - ymn + 2 * py) * hh;
      T(pr.t, gx - 40, gy - 6, { s: 9.5, b: true }); ctx.strokeStyle = GRID; for (let k = 0; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(gx, gy + hh * k / 3 + 0.5); ctx.lineTo(gx + pw, gy + hh * k / 3 + 0.5); ctx.stroke(); T(fmt((ymn - py) + (ymx - ymn + 2 * py) * (1 - k / 3), ymx - ymn < 20 ? 1 : 0), gx - 4, gy + hh * k / 3 + 3, { s: 8, c: MUTE, a: 'right' }); }
      const xd = xmx - xmn < 0.5 ? 2 : xmx - xmn < 5 ? 1 : 0; T(fmt(xmn, xd), gx, gy + hh + 11, { s: 8, c: MUTE }); T(fmt(xmx, xd), gx + pw, gy + hh + 11, { s: 8, c: MUTE, a: 'right' });
      ctx.strokeStyle = pr.c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(xmn - px), Y(reg.fit.a + reg.fit.b * (xmn - px))); ctx.lineTo(X(xmx + px), Y(reg.fit.a + reg.fit.b * (xmx + px))); ctx.stroke();
      xs.forEach((v, k) => { ctx.fillStyle = mix('#9AA3AE', pr.c, 0.6); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(X(v), Y(ys[k]), 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      // the plant of the layer, estimated from its own shoot trait
      const cur = R('dr'), v = pr.f(cur), sc = pr.s || 1; let m = 0, c = 0; for (let t = Math.max(0, d - 2); t <= Math.min(N - 1, d + 2); t++) { m += v[t] * sc; c++; } const xv = m / c, yt = YV[PH.yv].f(cur), ye = reg.fit.a + reg.fit.b * xv;
      ctx.fillStyle = '#D93025'; ctx.beginPath(); ctx.moveTo(X(xv), Y(yt) - 6); ctx.lineTo(X(xv) + 5, Y(yt)); ctx.lineTo(X(xv), Y(yt) + 6); ctx.lineTo(X(xv) - 5, Y(yt)); ctx.closePath(); ctx.fill();
      T('r² = ' + fmt(reg.fit.r2, 2) + ' · slope ' + fmt(reg.fit.b, Math.abs(reg.fit.b) < 1 ? 2 : 1), gx + pw, gy - 6, { s: 9.5, b: true, c: pr.c, a: 'right' }); TF('your plant: estimated ' + fmt(ye, ymx < 20 ? 1 : 0) + ', model ' + fmt(yt, ymx < 20 ? 1 : 0), gx - 40, gy + hh + 24, cw, { s: 8.5, c: '#33414F' });
    });
    y += 2 * (hh + 46) + 6;
    // how the predictive power changes through the season
    const x0 = cx + 40, pw = w - 56, top = y + 18, h2 = 100; T('Share of the variation in the roots explained by each shoot trait, day by day (r²)', cx + 10, y + 8, { s: 9.5, b: true }); K.yAxis(x0, top, pw, h2, 0, 1, '', 4);
    const r2 = PRED.map(pr => Array.from({ length: N }, (_, t) => regressionAt(t, pr.k, PH.yv).fit.r2)); regimeShade().forEach(s => { ctx.fillStyle = s[2]; ctx.globalAlpha = 0.45; ctx.fillRect(x0 + pw * s[0] / (N - 1), top, pw * (s[1] - s[0]) / (N - 1), h2); ctx.globalAlpha = 1; });
    r2.forEach((arr, k) => { ctx.strokeStyle = PRED[k].c; ctx.lineWidth = 1.8; ctx.beginPath(); arr.forEach((v, t) => { const yy = top + h2 - v * h2; t ? ctx.lineTo(x0 + pw * t / (N - 1), yy) : ctx.moveTo(x0, yy); }); ctx.stroke(); });
    ctx.strokeStyle = '#2E7DE8'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0 + pw * d / (N - 1), top); ctx.lineTo(x0 + pw * d / (N - 1), top + h2); ctx.stroke(); ctx.setLineDash([]);
    for (let t = 0; t <= N - 1; t += 20) T(String(t), x0 + pw * t / (N - 1), top + h2 + 12, { s: 8.5, c: MUTE, a: 'center' }); hot(x0, top, pw, h2, pp => { play.t = clamp((pp.x - x0) / pw, 0, 1); play.on = false; }, 'click to move the day');
    y = top + h2 + 28; K.legend(PRED.map(q => [q.c, q.k]), cx + 12, y); y += 18;
    let bestK = 0; PRED.forEach((q, k) => { if (r2[k][d] > r2[bestK][d]) bestK = k; }); const nt = note('On day ' + d + ' the best shoot trait for the ' + YV[PH.yv].t + ' is ' + PRED[bestK].t.toLowerCase() + ' (r² = ' + fmt(r2[bestK][d], 2) + '). The measure is read from a window of five days around the day, as a camera or a thermal scan would be, and the lines show when in the drought each trait becomes informative. Twelve genotypes: angle of the root axes 26, 44, 62°, vigour ×0.8 or ×1.2, stay-green 0.1 or 0.7; all other traits as set above.', cx + 12, y, w - 24); y += nt * 12.5 + 10;
    // tolerance indices of the same panel
    const items = p.items.filter(i => i.dr && i.ww), Yw = items.map(i => i.ww.Wg[N - 1]), Yd = items.map(i => i.dr.Wg[N - 1]), mw = Yw.reduce((a, b) => a + b, 0) / Math.max(1, Yw.length), md = Yd.reduce((a, b) => a + b, 0) / Math.max(1, Yd.length);
    const rows = items.map((i, k) => ({ i, Yw: Yw[k], Yd: Yd[k], dsi: mw > 0 && md < mw ? (1 - Yd[k] / Math.max(1e-6, Yw[k])) / (1 - md / mw) : NaN, sti: Yw[k] * Yd[k] / Math.max(1e-6, mw * mw) })).sort((a, b) => b.sti - a.sti);
    T('Drought tolerance of the twelve genotypes (grain or seed mass)', cx + 10, y + 8, { s: 9.5, b: true }); y += 16; const cols = [cx + 12, cx + 200, cx + 280, cx + 360, cx + 440, cx + 520];
    ['genotype', RN(), 'drought', 'susceptibility', 'tolerance', ''].forEach((h, k) => T(h, cols[k] + (k ? 0 : 0), y + 8, { s: 8.5, b: true, c: MUTE })); y += 13;
    rows.slice(0, 6).forEach((r, k) => { if (k % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 13); } T('angle ' + r.i.angle + '°, vigour ×' + r.i.axr + ', stay-green ' + r.i.SG, cols[0], y + 9, { s: 9 }); T(fmt(r.Yw) + ' g/m²', cols[1], y + 9, { s: 9 }); T(fmt(r.Yd) + ' g/m²', cols[2], y + 9, { s: 9 }); T(isFinite(r.dsi) ? fmt(r.dsi, 2) : 'n/a', cols[3], y + 9, { s: 9 }); T(fmt(r.sti, 2), cols[4], y + 9, { s: 9, b: true }); y += 13; });
    y += 10; const nt2 = note('Susceptibility index (Fischer and Maurer, 1978) above 1 means a loss larger than the average; tolerance index (Fernandez, 1992) combines yield with and without stress. Both come from the runs of the panel, not from a table.', cx + 12, y, w - 24); y += nt2 * 12.5 + 8;
    endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== the traits of the run: quantified temporal changes
  function traits(res) {
    const o = {}, last = N - 1; o.H = res.H[last]; let pm = 0, pd = 0; for (let i = 0; i < N; i++) if (res.PSA[i] > pm) pm = res.PSA[i]; o.PSAmax = pm; for (let i = 0; i < N; i++) if (res.PSA[i] >= 0.5 * pm) { pd = i; break; } o.dPSA50 = pd;
    let rg = 0; for (let t = 4; t < N - 4; t++) { const g = (Math.log(Math.max(1, res.PSA[t + 3])) - Math.log(Math.max(1, res.PSA[t - 3]))) / 6; if (g > rg) rg = g; } o.RGR = rg;
    let am = 0; for (let i = 0; i < N; i++) am = Math.max(am, res.dW[i]); o.AGR = am; let lm = 0; for (let i = 0; i < N; i++) lm = Math.max(lm, res.LAIg[i]); o.LAI = lm;
    o.dSI50 = NaN; for (let i = 0; i < N; i++) if (res.SI[i] >= 50) { o.dSI50 = i; break; } o.AUCg = sum(res.LAIg, 0, N - 1);
    const dr = PH.dr; const a0 = dr.type === 'none' ? 0 : dr.onset, a1 = dr.type === 'none' || dr.type === 'terminal' ? N - 1 : Math.min(N - 1, dr.onset + dr.len); const wmin = (v, k) => { let m = Infinity; for (let i = Math.max(0, a0); i <= a1; i++) m = Math.min(m, v[i]); return m * k; }; o.RWCmin = wmin(res.RWC, 100); o.psiMin = wmin(res.psiL, 1); o.CWSImax = (() => { let m = 0; for (let i = Math.max(0, a0); i <= a1; i++) m = Math.max(m, res.CWSI[i]); return m; })(); o.CTDs = mean(res.CTD, a0, a1);
    o.T = res.totals.T; o.Es = res.totals.Es; o.In = res.totals.I + res.totals.P; o.Dr = res.totals.dr;
    const sh = res.Wl[last] + res.Ws[last] + res.Wg[last]; o.bio = sh + res.Wr[last]; o.grain = res.Wg[last]; o.HI = sh > 0 ? res.Wg[last] / sh : 0; o.TE = res.totals.T > 0 ? (o.bio - 0) / res.totals.T : 0; o.WUE = res.totals.T + res.totals.Es > 0 ? o.grain / (res.totals.T + res.totals.Es) : 0;
    o.Rd = res.Rdepth[last]; o.RL = res.Lroot[last] / 100; o.D50 = res.D50[last]; o.D95 = res.D95[last]; let s = 0, t = 0; for (let k = 0; k < NL; k++) { const v = res.Lz[last * NL + k]; t += v; if (k >= 4) s += v; } o.deep = 100 * s / Math.max(1e-9, t); o.RS = res.Wr[last] / Math.max(0.01, sh);
    return o;
  }
  U.traits = traits;
  const TROWS = [['Plant height at the end (cm)', 'H', 0], ['Largest projected shoot area (cm²)', 'PSAmax', 0], ['Day the shoot area reaches half of its largest', 'dPSA50', 0], ['Fastest relative growth of the shoot area (per day)', 'RGR', 3], ['Fastest biomass gain (g/m²/d)', 'AGR', 1], ['Largest green leaf area index', 'LAI', 2], ['Day half of the leaf area is senescent (stay-green)', 'dSI50', 0], ['Green leaf area over the season (m² d per m²)', 'AUCg', 0], ['Lowest leaf water content in the stress period (%)', 'RWCmin', 0], ['Lowest leaf water potential in the stress period (MPa)', 'psiMin', 2], ['Mean canopy temperature depression in the stress (K)', 'CTDs', 1], ['Highest crop water stress index in the stress period', 'CWSImax', 2], ['Transpiration (mm)', 'T', 0], ['Soil evaporation (mm)', 'Es', 0], ['Water applied and rain (mm)', 'In', 0], ['Total dry mass (g/m²)', 'bio', 0], ['Grain or seed mass (g/m²)', 'grain', 0], ['Harvest index', 'HI', 2], ['Transpiration efficiency (g dry mass per kg water)', 'TE', 1], ['Water use efficiency of the grain (g per kg)', 'WUE', 2], ['Root depth (cm)', 'Rd', 0], ['Root length (m per plant)', 'RL', 0], ['Depth of 50 % of the root length (cm)', 'D50', 0], ['Depth of 95 % of the root length (cm)', 'D95', 0], ['Roots below 60 cm (% of the length)', 'deep', 0], ['Root : shoot ratio at the end', 'RS', 2]];
  function drawTraits(y) {
    const w = W - 32, cx = 16, y0 = y, a = traits(R('ww')), b = traits(R('dr')); frameH(cx, y, w, 'Quantified traits of the run', 'the readouts that a phenotyping experiment reports, for the two treatments'); y += 30;
    const cols = [cx + 12, cx + w - 250, cx + w - 150, cx + w - 40]; ['trait', RN(), 'drought', 'change'].forEach((h, k) => T(h, cols[k], y + 8, { s: 8.5, b: true, c: MUTE, a: k ? 'right' : 'left' })); y += 13;
    TROWS.forEach((r, i) => { if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 14); } const va = a[r[1]], vb = b[r[1]]; TF(r[0], cols[0], y + 10, cols[1] - cols[0] - 70, { s: 9.5 }); T(isFinite(va) ? fmt(va, r[2]) : 'none', cols[1], y + 10, { s: 9.5, a: 'right' }); T(isFinite(vb) ? fmt(vb, r[2]) : 'none', cols[2], y + 10, { s: 9.5, b: true, c: '#D93025', a: 'right' }); if (isFinite(va) && isFinite(vb)) { const big = Math.abs(va) > 0.25 * Math.abs(vb) && Math.abs(va) > 1e-6, ch = big ? (vb - va) / Math.abs(va) * 100 : vb - va, txt = big ? (Math.abs(ch) < 0.5 ? '0 %' : (ch >= 0 ? '+' : '') + fmt(ch) + ' %') : (ch >= 0 ? '+' : '') + fmt(ch, Math.max(r[2], 1)); T(txt, cols[3], y + 10, { s: 9.5, c: Math.abs(vb - va) < 0.03 * Math.max(Math.abs(va), 1e-9) ? MUTE : (vb < va ? '#C0392B' : '#1E7E34'), a: 'right' }); } y += 14; });
    y += 6; endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== your observations: load, compare, calibrate, export
  const OBSMAP = { height: ['H', 1], area: ['PSA', 1], solidity: ['solid', 100], senescence: ['SI', 1], rwc: ['RWC', 100], ctd: ['CTD', 1] };
  function parseCsv(txt) {
    const lines = txt.replace(/^﻿/, '').trim().split(/\r?\n/).filter(l => l.trim()); if (lines.length < 2) throw new Error('the file has no rows'); const sep = lines[0].includes(';') ? ';' : (lines[0].includes('\t') ? '\t' : ','), head = lines[0].split(sep).map(s => s.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''));
    const ix = n => head.findIndex(h => n.includes(h)), di = ix(['day', 'days', 'dae', 'dpt', 'dap']), ti = ix(['treatment', 'trt', 'treat']); if (di < 0) throw new Error('a column "day" is needed');
    const ALI = { height: ['height', 'plantheight', 'heightcm'], area: ['area', 'psa', 'projectedarea', 'shootarea'], solidity: ['solidity', 'compactness'], senescence: ['senescence', 'si', 'senescenceindex'], rwc: ['rwc', 'relativewatercontent'], ctd: ['ctd', 'canopytemperaturedepression'] }, cols = []; const ci = {};
    Object.keys(ALI).forEach(k => { const j = head.findIndex(h => ALI[k].includes(h)); if (j >= 0) { ci[k] = j; cols.push(k); } }); if (!cols.length) throw new Error('no trait column found (height, area, solidity, senescence, rwc, ctd)');
    const rows = []; lines.slice(1).forEach(l => { const c = l.split(sep), o = { day: parseFloat(c[di]) }; const tv = ti >= 0 ? (c[ti] || '').trim().toLowerCase() : 'dr'; o.trt = /^(ww|control|well|wellwatered|c)$/.test(tv.replace(/[^a-z]/g, '')) ? 'ww' : 'dr'; cols.forEach(k => { let v = parseFloat(String(c[ci[k]]).replace(',', '.')); if ((k === 'solidity' || k === 'rwc') && v <= 1.5) v *= 100; o[k] = v; }); if (isFinite(o.day) && o.day >= 0 && o.day < N) rows.push(o); });
    return { cols, rows, n: rows.length };
  }
  function predOf(res, k, d) { const m = OBSMAP[k]; return res[m[0]][d] * (m[0] === 'solid' || m[0] === 'RWC' ? 100 : 1); }
  function metrics(runs) {
    if (!PH.obs) return []; const out = [];
    ['ww', 'dr'].forEach(tr => PH.obs.cols.forEach(k => { const pts = PH.obs.rows.filter(o => o.trt === tr && isFinite(o[k])); if (pts.length < 2) return; const ob = pts.map(o => o[k]), pr = pts.map(o => predOf(runs[tr], k, Math.round(o.day))), n = ob.length, mo = ob.reduce((a, b) => a + b, 0) / n; let se = 0, so = 0, bi = 0; for (let i = 0; i < n; i++) { se += (pr[i] - ob[i]) ** 2; so += (ob[i] - mo) ** 2; bi += pr[i] - ob[i]; } const r = pear(pr, ob); out.push({ tr, k, n, rmse: Math.sqrt(se / n), bias: bi / n, nse: so > 0 ? 1 - se / so : NaN, r2: isFinite(r) ? r * r : NaN }); }));
    return out;
  }
  function genoWith(th) { const g = Object.assign({}, PH.g), sp = P.SP[PH.sp]; g.rue = (g.rue || 1) * th.rue; g.psi50 = (g.psi50 == null ? sp.psi50 : g.psi50) + th.dpsi; g.dpsi = g.psi50 - sp.psi50; g.SG = clamp(g.SG + th.sg, 0, 0.95); return g; }
  function costOf(th) { const g = genoWith(th), runs = { ww: P.run(Object.assign(cfgFor('ww', false), { geno: g })), dr: P.run(Object.assign(cfgFor('dr', false), { geno: g })) }; let J = 0; PH.obs.cols.forEach(k => { const all = PH.obs.rows.map(o => o[k]).filter(isFinite), m = all.reduce((a, b) => a + b, 0) / Math.max(1, all.length), v = Math.max(all.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, all.length), (0.05 * Math.abs(m)) ** 2, 1e-6); PH.obs.rows.forEach(o => { if (!isFinite(o[k])) return; J += (predOf(runs[o.trt], k, Math.round(o.day)) - o[k]) ** 2 / v; }); }); return J; }
  function startCalib() {
    if (!PH.obs || PH.job) return; const th = { rue: PH.ovr.rue, dpsi: PH.ovr.dpsi, sg: PH.ovr.sg }; PH.job = { t: 'calib', th, best: Object.assign({}, th), J: null, J0: null, steps: { rue: 0.15, dpsi: 0.3, sg: 0.15 }, keys: ['rue', 'dpsi', 'sg'], pass: 0, pi: 0, dir: 1, tried: 0, evals: 0, max: 40, lim: { rue: [0.6, 1.5], dpsi: [-1.0, 1.0], sg: [-0.2, 0.7] } }; PH.msg = '';
  }
  function jobStep() {
    const j = PH.job; if (!j) return; if (j.t === 'swafl') return swStep(); if (j.J === null) { j.J = costOf(j.best); j.J0 = j.J; j.evals++; return; }
    const k = j.keys[j.pi], trial = Object.assign({}, j.best); trial[k] = clamp(trial[k] + j.dir * j.steps[k], j.lim[k][0], j.lim[k][1]); const Jt = costOf(trial); j.evals++;
    if (Jt < j.J - 1e-9) { j.J = Jt; j.best = trial; j.tried = 0; } else { j.dir = -j.dir; j.tried++; if (j.tried >= 2) { j.tried = 0; j.pi++; j.dir = 1; if (j.pi >= j.keys.length) { j.pi = 0; j.pass++; j.keys.forEach(q => { j.steps[q] *= 0.5; }); } } }
    if (j.pass >= 3 || j.evals >= j.max) { PH.ovr = { rue: j.best.rue, dpsi: j.best.dpsi, sg: j.best.sg }; PH.keepRan = true; PH.msg = 'Calibrated: the error fell from ' + fmt(j.J0, 1) + ' to ' + fmt(j.J, 1) + ' (sum of squared errors in units of the variance of each trait). Radiation use efficiency ×' + j.best.rue.toFixed(2) + ', stomatal threshold ' + (j.best.dpsi >= 0 ? '+' : '') + j.best.dpsi.toFixed(2) + ' MPa, stay-green ' + (j.best.sg >= 0 ? '+' : '') + j.best.sg.toFixed(2) + '.'; PH.job = null; }
  }
  U.setJob(jobStep);
  function loadFile() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.txt,.tsv'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { PH.obs = parseCsv(String(rd.result)); PH.obs.name = f.name; PH.msg = 'Loaded ' + PH.obs.n + ' observations from ' + f.name + '.'; } catch (e) { PH.obs = null; PH.msg = 'Could not read the file: ' + e.message; } }; rd.readAsText(f); }; inp.click();
  }
  function download(name, txt, type) { try { const b = new Blob([txt], { type: type || 'text/csv' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); } catch (e) { PH.msg = 'The download is not available here: ' + e.message; } }
  function exportCsv() {
    const rows = ['treatment,day,date,height_cm,shoot_area_cm2,solidity_pct,senescence_pct,rwc_pct,leaf_potential_MPa,ctd_K,cwsi,lai_green,assimilation_g_m2_d,root_share_pct,root_depth_cm,root_length_m,D95_cm,transpiration_mm,soil_evaporation_mm']; ['ww', 'dr'].forEach(tr => { const r = R(tr); for (let i = 0; i < N; i++) rows.push([tr, i, U.dateOf(i), r.H[i], r.PSA[i], r.solid[i] * 100, r.SI[i], r.RWC[i] * 100, r.psiL[i], r.CTD[i], r.CWSI[i], r.LAIg[i], r.dW[i], r.fr[i] * 100, r.Rdepth[i], r.Lroot[i] / 100, r.D95[i], r.T[i], r.Es[i]].map((v, k) => k < 3 ? v : (typeof v === 'number' ? +v.toFixed(4) : v)).join(',')); });
    download('deterministic_phenotyping_' + PH.sp + '_' + state.soil + '.csv', rows.join('\n'));
  }
  function template() { download('observations_template.csv', 'day,treatment,height,area,solidity,senescence,rwc,ctd\n20,ww,,,,,,\n20,dr,,,,,,\n'); }
  function drawData(y) {
    const w = W - 32, cx = 16, y0 = y; frameH(cx, y, w, 'Your measurements: compare, calibrate and export', 'bring experimental data to the model to parameterise and test it'); y += 30; let xx = cx + 10;
    xx += chip(xx, y, 'Load observations (CSV)', false, loadFile, 'columns: day, treatment (ww or dr), and any of height, area, solidity, senescence, rwc, ctd'); xx += chip(xx, y, PH.job ? 'Calibrating...' : 'Calibrate the model', !!PH.job, () => { startCalib(); }, 'adjust radiation use efficiency, the stomatal threshold and stay-green to your data');
    xx += chip(xx, y, 'Reset calibration', false, () => { PH.ovr = { rue: 1, dpsi: 0, sg: 0 }; PH.keepRan = true; PH.msg = 'The calibration was reset.'; }, 'back to the values of the genotype'); xx += chip(xx, y, 'Remove observations', false, () => { PH.obs = null; PH.msg = ''; }, 'clear the loaded data'); y += 28; xx = cx + 10;
    xx += chip(xx, y, 'Export the results (CSV)', false, exportCsv, 'daily traits of both treatments'); xx += chip(xx, y, 'Download a template', false, template, 'an empty file with the columns that are read'); y += 30;
    if (PH.job) { const j = PH.job; ctx.fillStyle = '#EFEDE5'; ctx.fillRect(cx + 10, y, w - 20, 14); ctx.fillStyle = '#2E9E4F'; ctx.fillRect(cx + 10, y, (w - 20) * Math.min(1, j.evals / j.max), 14); T('calibrating: run ' + j.evals + ' of at most ' + j.max, cx + 16, y + 11, { s: 9.5 }); y += 22; }
    if (PH.msg) { const n = note(PH.msg, cx + 12, y + 8, w - 24, { c: '#1B3A6B' }); y += n * 12.5 + 10; }
    if (!PH.obs) { const n = note('No observations are loaded, so the charts show the model alone. A file needs the column "day" (days after emergence), a column "treatment" with ww or dr, and any of height (cm), area (cm²), solidity, senescence (%), rwc, ctd (K). Your points then appear as squares in the time series, the table below gives the error, and the calibration finds the radiation use efficiency, stomatal threshold and stay-green that fit.', cx + 12, y + 8, w - 24); y += n * 12.5 + 12; }
    else {
      const M = metrics(PH.run), cols = [cx + 12, cx + 130, cx + 190, cx + 260, cx + 330, cx + 400]; T('Loaded: ' + PH.obs.name + ' (' + PH.obs.n + ' rows)', cx + 12, y + 8, { s: 9.5, b: true }); y += 16; ['trait', 'treatment', 'points', 'error (RMSE)', 'bias', 'efficiency (NSE)'].forEach((h, k) => T(h, cols[k], y + 8, { s: 8.5, b: true, c: MUTE })); y += 13;
      M.forEach((m, i) => { if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 13); } T(m.k, cols[0], y + 9, { s: 9 }); T(m.tr === 'ww' ? RN() : 'drought', cols[1], y + 9, { s: 9, c: m.tr === 'dr' ? '#D93025' : INK }); T(String(m.n), cols[2], y + 9, { s: 9 }); T(fmt(m.rmse, 2), cols[3], y + 9, { s: 9 }); T(fmt(m.bias, 2), cols[4], y + 9, { s: 9 }); T(isFinite(m.nse) ? fmt(m.nse, 2) : 'n/a', cols[5], y + 9, { s: 9, b: true }); y += 13; });
      y += 8;
    }
    T('Calibration now: radiation use ×' + PH.ovr.rue.toFixed(2) + ', stomatal threshold ' + (PH.ovr.dpsi >= 0 ? '+' : '') + PH.ovr.dpsi.toFixed(2) + ' MPa, stay-green ' + (PH.ovr.sg >= 0 ? '+' : '') + PH.ovr.sg.toFixed(2), cx + 12, y + 4, { s: 9, c: MUTE }); y += 16;
    endFrame(cx, y0, y, w); return y + 10;
  }


  // ================================================================== the SWAFL data: Daisy runs of the project against this plant
  const interp1 = (pts, x) => { pts = pts.slice().sort((a, b) => a[0] - b[0]); if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / Math.max(1e-9, b[0] - a[0]); } return pts[pts.length - 1][1]; };
  function swaflRef() {
    if (typeof current === 'undefined' || !current) return null; const c = current, soil = state.soil, vff = VFF_VALUES[state.vffIdx], cap = CAP_VALUES[state.capIdx];
    const e7 = ((DATA.e7 || {})[soil] || []).filter(r => Math.abs(r.cap - cap) < 1e-6), bare = (DATA.bare_evap || {})[soil];
    const mulch = e7.length > 1 && bare > 0 ? interp1(e7.map(r => [r.vff, r.soil_evap]).concat([[1, bare]]), vff) / bare : null;
    const maxY = (typeof MAPS !== 'undefined' && MAPS && MAPS.maxY && MAPS.maxY[soil]) || Math.max(...['e5', 'e2', 'e3', 'e4', 'e13'].flatMap(n => ((DATA[n] || {})[soil] || []).map(r => r.yield)));
    return { c, maxY, relY: c.yield / maxY, tShare: c.transp / Math.max(1, c.et), mulch };
  }
  const TRIGS = [100, 300, 600, 1000, 3000];
  function modelMetrics(th) {   // from the plant: the share of transpiration, the effect of the mulch on soil evaporation, and the relative yield at several trigger suctions (the E2 curve of the Daisy runs)
    const sp0 = P.SP[PH.sp], over = {}; if (th) { const b = cfgFor('ww', false).cropP || {}; over.cropP = Object.assign({}, b, { RUE: sp0.RUE * th.rue, kte: sp0.kte * th.kte }); }
    const withQ = c => { if (th) c.soil = Object.assign({}, c.soil, { qG: 0.1 * th.qG }); return c; };
    const mk = (tr, extra) => P.run(Object.assign(withQ(cfgFor(tr, false)), over, extra || {})), pr = projObj();
    const L = mk('ww'), B = mk('bench'), M0 = pr.vff >= 0.95 ? L : mk('ww', { proj: Object.assign({}, pr, { vff: 1, cap: 0 }) });
    const curve = TRIGS.map(tg => { const q = Object.assign({}, pr, { irr: Object.assign({}, pr.irr, { trig: tg }) }), R2 = mk('ww', { proj: q }); return [tg, R2.Wg[N - 1] / Math.max(1e-6, B.Wg[N - 1])]; });
    const t = L.totals; return { relY: L.Wg[N - 1] / Math.max(1e-6, B.Wg[N - 1]), tShare: t.T / Math.max(1e-6, t.T + t.Es + t.Ei), mulch: pr.vff >= 0.95 ? 1 : t.Es / Math.max(1e-6, M0.totals.Es), curve, L, B, grain: L.Wg[N - 1] };
  }
  const SWT = [['relY', 'Relative yield (share of the best yield of the soil)', 0.05], ['tShare', 'Transpiration share of evapotranspiration', 0.05], ['mulch', 'Soil evaporation under the mulch against bare soil', 0.07]];
  function daisyCurve() { const rows = ((DATA.e2 || {})[state.soil] || []).filter(r => isFinite(r.k) && isFinite(r.yield)).map(r => [Math.abs(r.k), r.yield]); if (rows.length < 3) return null; const y0 = Math.max(...rows.map(q => q[1])); return TRIGS.map(tg => [tg, interp1(rows, tg) / y0]); }
  function swCost(m, ref) { let J = 0; SWT.slice(1).forEach(q => { if (ref[q[0]] != null && isFinite(m[q[0]])) J += ((m[q[0]] - ref[q[0]]) / q[2]) ** 2; }); const dc = ref.curve; if (dc) m.curve.forEach((pt, i) => { J += ((pt[1] - dc[i][1]) / 0.05) ** 2; }); return J; }
  function startSwafl() { const ref = swaflRef(); if (!ref || PH.job) return; ref.curve = daisyCurve(); const th = { rue: 1, kte: 1, qG: 1 }; PH.job = { t: 'swafl', ref, th, best: Object.assign({}, th), J: null, J0: null, steps: { rue: 0.2, kte: 0.3, qG: 0.6 }, keys: ['rue', 'kte', 'qG'], pass: 0, pi: 0, dir: 1, tried: 0, evals: 0, max: 45, lim: { rue: [0.6, 1.6], kte: [0.5, 2.2], qG: [0.25, 4] } }; PH.fitMsg = ''; }
  U.startSwafl = startSwafl;
  function swStep() {
    const j = PH.job; try {
      if (j.J === null) { j.J = swCost(modelMetrics(j.best), j.ref); j.J0 = j.J; j.evals++; return; }
      const k = j.keys[j.pi], trial = Object.assign({}, j.best); trial[k] = clamp(trial[k] * (j.dir > 0 ? 1 + j.steps[k] : 1 / (1 + j.steps[k])), j.lim[k][0], j.lim[k][1]); const Jt = swCost(modelMetrics(trial), j.ref); j.evals++;
      if (Jt < j.J - 1e-9) { j.J = Jt; j.best = trial; j.tried = 0; } else { j.dir = -j.dir; j.tried++; if (j.tried >= 2) { j.tried = 0; j.pi++; j.dir = 1; if (j.pi >= j.keys.length) { j.pi = 0; j.pass++; j.keys.forEach(q => { j.steps[q] *= 0.5; }); } } }
    } catch (e) { PH.fitMsg = 'The fit stopped: ' + e.message; PH.job = null; return; }
    if (j.pass >= 3 || j.evals >= j.max) { PH.sw = { rue: j.best.rue, kte: j.best.kte, qG: j.best.qG }; PH.keepRan = true; PH.fitMsg = 'Fitted to the SWAFL data: radiation use ×' + j.best.rue.toFixed(2) + ', water use coefficient ×' + j.best.kte.toFixed(2) + ', root conductance ×' + j.best.qG.toFixed(2) + '. The misfit with the Daisy runs of this soil and these controls fell from ' + fmt(j.J0, 1) + ' to ' + fmt(j.J, 1) + ' (sum of squared differences in units of the tolerance of each quantity).'; PH.job = null; }
  }
  function miniLine(x, y, w, h, title, pts, cur, xl, yl, logx, extra) {
    T(title, x, y - 6, { s: 9, b: true }); if (!pts.length) return; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = 0, y1 = K.nice(Math.max(...ys) * 1.05); if (cur) { x0 = Math.min(x0, cur[0]); x1 = Math.max(x1, cur[0]); }
    const X = v => x + w * (logx ? (Math.log10(Math.max(1, v)) - Math.log10(Math.max(1, x0))) / Math.max(1e-9, Math.log10(Math.max(1, x1)) - Math.log10(Math.max(1, x0))) : (v - x0) / Math.max(1e-9, x1 - x0)), Y = v => y + h - h * (v - y0) / Math.max(1e-9, y1 - y0);
    K.yAxis(x, y, w, h, y0, y1, '', 3); const srt = pts.slice().sort((a, b) => a[0] - b[0]); ctx.strokeStyle = '#5E7A9A'; ctx.lineWidth = 1.6; ctx.beginPath(); srt.forEach((p, i) => { i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); }); ctx.stroke(); srt.forEach(p => { ctx.fillStyle = '#5E7A9A'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 2.2, 0, 7); ctx.fill(); });
    (extra || []).forEach(p => { ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 1.8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.4, 0, 7); ctx.fill(); ctx.stroke(); });
    if (cur) { ctx.fillStyle = '#D93025'; ctx.beginPath(); ctx.moveTo(X(cur[0]), Y(cur[1]) - 6); ctx.lineTo(X(cur[0]) + 5, Y(cur[1])); ctx.lineTo(X(cur[0]), Y(cur[1]) + 6); ctx.lineTo(X(cur[0]) - 5, Y(cur[1])); ctx.closePath(); ctx.fill(); }
    T(fmt(x0, 0), x, y + h + 11, { s: 8, c: MUTE }); T(fmt(x1, 0), x + w, y + h + 11, { s: 8, c: MUTE, a: 'right' }); T(xl, x + w / 2, y + h + 22, { s: 8.5, c: MUTE, a: 'center' }); T(yl, x - 4, y - 1, { s: 8, c: MUTE, a: 'right' });
  }
  function drawSwafl(y) {
    const w = W - 32, cx = 16, y0 = y, ref = swaflRef(); frameH(cx, y, w, 'SWAFL data: the Daisy runs of the project against this plant', 'the ensemble of 10,190 Daisy simulations (Data/Comprehensive_Summary) for this soil and these controls'); y += 30;
    let xx = cx + 10; xx += chip(xx, y, PH.job && PH.job.t === 'swafl' ? 'Fitting...' : 'Fit the plant to the SWAFL data', !!(PH.job && PH.job.t === 'swafl'), startSwafl, 'adjust the radiation use efficiency and the water use coefficient so that the three numbers below agree with the Daisy runs'); xx += chip(xx, y, 'Reset the fit', false, () => { PH.sw = { rue: 1, kte: 1, qG: 1 }; PH.keepRan = true; PH.fitMsg = 'The fit to the SWAFL data was reset.'; }, 'back to the constants of the species'); y += 28;
    if (PH.job && PH.job.t === 'swafl') { const j = PH.job; ctx.fillStyle = '#EFEDE5'; ctx.fillRect(cx + 10, y, w - 20, 14); ctx.fillStyle = '#2E9E4F'; ctx.fillRect(cx + 10, y, (w - 20) * Math.min(1, j.evals / j.max), 14); T('fitting: run ' + j.evals + ' of at most ' + j.max, cx + 16, y + 11, { s: 9.5 }); y += 22; }
    if (PH.fitMsg) { const n = note(PH.fitMsg, cx + 12, y + 8, w - 24, { c: '#1B3A6B' }); y += n * 12.5 + 8; }
    if (!ref) { const n = note('The Daisy results of the project are not available in this window.', cx + 12, y + 8, w - 24); y += n * 12.5 + 12; endFrame(cx, y0, y, w); return y + 10; }
    let m; try { const k = keyOf(); if (!PH.cmp || PH.cmp.key !== k) PH.cmp = { key: k, m: modelMetrics(null) }; m = PH.cmp.m; } catch (e) { m = null; }
    const cols = [cx + 12, cx + w - 250, cx + w - 160, cx + w - 70]; ['quantity (no dependence on the length of the season)', 'Daisy', 'this plant', 'difference'].forEach((h, k) => T(h, cols[k] + (k ? 0 : 0), y + 8, { s: 8.5, b: true, c: MUTE, a: k ? 'right' : 'left' })); y += 14;
    SWT.forEach((q, i) => { if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 15); } const vd = ref[q[0]], vm = m ? m[q[0]] : NaN; T(q[1], cols[0], y + 10, { s: 9.5 }); T(vd == null ? 'n/a' : fmt(vd, 2), cols[1] + 90, y + 10, { s: 9.5, a: 'right' }); T(isFinite(vm) ? fmt(vm, 2) : 'n/a', cols[2] + 90, y + 10, { s: 9.5, b: true, c: '#1B3A6B', a: 'right' }); if (vd != null && isFinite(vm)) { const dd = vm - vd; T((dd >= 0 ? '+' : '') + fmt(dd, 2), cols[3] + 60, y + 10, { s: 9.5, c: Math.abs(dd) < q[2] ? '#1E7E34' : '#C0392B', a: 'right' }); } y += 15; });
    y += 4;
    const c = ref.c, t = m ? m.L.totals : null; const abs = [['Yield (Mg/ha)', c.yield, m ? m.grain * 0.01 : NaN, 2], ['Transpiration (mm)', c.transp, t ? t.T : NaN, 0], ['Soil evaporation (mm)', c.evap, t ? t.Es : NaN, 0], ['Irrigation (mm)', c.irr, t ? t.Ig : NaN, 0], ['Drainage below the root zone (mm)', c.drain, t ? t.dr : NaN, 0]];
    T('Amounts: Daisy is the mean of 20 years of the crop of the runs; the plant is one season of the layer, so the periods differ and only the order of size is compared', cx + 12, y + 8, { s: 8.5, c: MUTE }); y += 14;
    abs.forEach((r, i) => { if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 15); } T(r[0], cols[0], y + 10, { s: 9.5 }); T(fmt(r[1], r[3]), cols[1] + 90, y + 10, { s: 9.5, a: 'right' }); T(isFinite(r[2]) ? fmt(r[2], r[3]) : 'n/a', cols[2] + 90, y + 10, { s: 9.5, b: true, c: '#1B3A6B', a: 'right' }); y += 15; });
    y += 12;
    // the SWAFL data behind the controls: nitrogen response, trigger suction, the ensemble of mulch and rain
    const cw = (w - 36 - 40) / 3, hh = 96, gy = y + 14; const soil = state.soil;
    const e13 = ((DATA.e13 || {})[soil] || []).filter(r => isFinite(r.k)).map(r => [r.k, r.yield]), nr = nResponse();
    miniLine(cx + 40, gy, cw, hh, 'Nitrogen (E13): yield against kg N/ha', e13, [nr.rate, nr.y == null ? 0 : nr.y], 'kg N per ha', 'Mg/ha');
    const e2 = ((DATA.e2 || {})[soil] || []).filter(r => isFinite(r.k)).map(r => [Math.abs(r.k), r.yield]), pj = projObj(); let cy2 = null; if (e2.length > 1) cy2 = interp1(e2, pj.irr.trig);
    const y0e = e2.length ? Math.max(...e2.map(q => q[1])) : 1; miniLine(cx + 40 + cw + 20, gy, cw, hh, 'Trigger (E2): green dots = this plant', e2, cy2 == null ? null : [pj.irr.trig, cy2], 'trigger suction (cm, log scale)', 'Mg/ha', true, m && m.curve ? m.curve.map(q => [q[0], q[1] * y0e]) : null);
    { const gx = cx + 40 + 2 * (cw + 20), pts = DATA.e14 || []; T('Mulch and rain (E14, 1000 runs)', gx, gy - 6, { s: 9, b: true }); if (pts.length) { const xs = pts.map(r => r.soil_evap), ys = pts.map(r => r.yield), x1 = K.nice(Math.max(...xs) * 1.05), y1 = K.nice(Math.max(...ys) * 1.05); K.yAxis(gx, gy, cw, hh, 0, y1, '', 3); pts.forEach(r => { ctx.fillStyle = 'rgba(94,122,154,0.35)'; ctx.fillRect(gx + cw * r.soil_evap / x1 - 1, gy + hh - hh * r.yield / y1 - 1, 2.4, 2.4); });
        let best = null, bd = 1e9; const vv = VFF_VALUES[state.vffIdx], rr = RAIN_VALUES[state.rainIdx], cc = CAP_VALUES[state.capIdx]; pts.forEach(r => { const dd = Math.abs(r.vff - vv) / 0.1 + Math.abs(r.rain - rr) / 0.1 + Math.abs(Math.log(r.cap / cc)); if (dd < bd) { bd = dd; best = r; } });
        if (best) { const px = gx + cw * best.soil_evap / x1, py = gy + hh - hh * best.yield / y1; ctx.fillStyle = '#D93025'; ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px + 5, py); ctx.lineTo(px, py + 6); ctx.lineTo(px - 5, py); ctx.closePath(); ctx.fill(); }
        T('0', gx, gy + hh + 11, { s: 8, c: MUTE }); T(fmt(x1, 0), gx + cw, gy + hh + 11, { s: 8, c: MUTE, a: 'right' }); T('soil evaporation (mm)', gx + cw / 2, gy + hh + 22, { s: 8.5, c: MUTE, a: 'center' }); T('Mg/ha', gx - 4, gy - 1, { s: 8, c: MUTE, a: 'right' }); } }
    y = gy + hh + 34;
    const n = note('Red diamond: the Daisy run nearest to the controls of the project. The nitrogen curve sets the nitrogen factor of the plant (yield at the rate against yield at 100 kg N per ha, ' + (nr.f).toFixed(2) + '), the mulch table of the Daisy runs gives the effect of the mulch on soil evaporation that the plant is checked against, and the trigger and sensor depth of the Properties panel irrigate the plant by the same rule as the Daisy runs. Fit: radiation use ×' + (PH.sw ? PH.sw.rue : 1).toFixed(2) + ', water use coefficient ×' + (PH.sw ? PH.sw.kte : 1).toFixed(2) + '.', cx + 12, y, w - 24); y += n * 12.5 + 10;
    endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== the equations
  SECTIONS.push({ id: 'water', t: 'Water: demand, supply and where the roots take it', s: 'transpiration of the plant against the soil water of every layer', fn: drawWater }, { id: 'carbon', t: 'Carbon: assimilation, allocation, root and shoot growth', s: 'what the leaves make, where it goes, and how the roots answer', fn: drawCarbon }, { id: 'soil', t: 'Soil structure and tillage: what the root tips meet', s: 'bulk density and penetration resistance by depth, and the root length that results', fn: drawSoil }, { id: 'above', t: 'Roots from the plant above ground', s: 'twelve genotypes under the same drought', fn: drawAbove }, { id: 'traits', t: 'Quantified traits of the run', s: 'the readouts of a phenotyping experiment', fn: drawTraits }, { id: 'swafl', t: 'SWAFL data: the Daisy runs of the project against this plant', s: 'the 10,190 Daisy simulations of the repository', fn: drawSwafl }, { id: 'data', t: 'Your measurements: compare, calibrate and export', s: 'bring experimental data to the model', fn: drawData });
})();
