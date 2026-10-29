/* Scientific water figures of the Charts tab, drawn from the day by day simulation of the twenty seasons:
   (a) one season: evaporation, transpiration and canopy cover, with rain and irrigation as bars on an inverted axis;
   (b) the water of the root zone against its twenty-season range and the irrigation trigger, with the drainage as inverted bars;
   (c) the twenty seasons, year by year, with their means. */
'use strict';
window.SciFig = (() => {
  const FONT = 'Tahoma,Arial,sans-serif', MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], MST = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  const nice = (lo, hi, n) => { const raw = (hi - lo) / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw || 1))), m = raw / p, st = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p, out = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st * 1e-6; v += st) out.push(+v.toFixed(10)); return { out, st }; };
  const fmt = (v, st) => st >= 1 ? String(Math.round(v)) : st >= 0.1 ? v.toFixed(1) : v.toFixed(2);
  const setup = cv => { const dpr = Math.max(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; cv.width = w * dpr; cv.height = h * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr); c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); return { c, w, h }; };
  const q = (a, f) => { const b = a.filter(v => isFinite(v)).sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.max(0, Math.round(f * (b.length - 1))))] : NaN; };
  const slice = (A, y, dpy) => A.slice(y * dpy, (y + 1) * dpy);
  function legend(c, items, x, y, w) { c.font = '11px ' + FONT; c.textBaseline = 'middle'; let lx = x, ly = y; items.forEach(([col, name, kind]) => { const tw = c.measureText(name).width + 34; if (lx + tw > w - 8 && lx > x) { lx = x; ly += 15; } c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.2; c.setLineDash(kind === 'dot' ? [2, 2.5] : kind === 'dash' ? [5, 3] : []); if (kind === 'bar') c.fillRect(lx, ly - 5, 12, 10); else if (kind === 'band') { c.globalAlpha = 0.35; c.fillRect(lx, ly - 5, 22, 10); c.globalAlpha = 1; } else { c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 22, ly); c.stroke(); if (kind === 'mk') { c.fillStyle = '#fff'; c.beginPath(); c.arc(lx + 11, ly, 3, 0, 6.2832); c.fill(); c.stroke(); } } c.setLineDash([]); c.fillStyle = '#222'; c.textAlign = 'left'; c.fillText(name, lx + (kind === 'bar' ? 17 : 27), ly); lx += tw; }); return ly; }
  function axisL(c, X0, Y0, X1, Y1, lo, hi, title, fmtFn, grid) { const t = nice(lo, hi, Math.max(2, Math.floor((Y1 - Y0) / 34))); c.font = '11px ' + FONT; c.textAlign = 'right'; c.textBaseline = 'middle'; t.out.forEach(v => { const y = Y1 - (Y1 - Y0) * (v - lo) / ((hi - lo) || 1); if (grid) { c.strokeStyle = '#e4e6ea'; c.lineWidth = 1; c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); } c.fillStyle = '#333'; c.fillText(fmtFn ? fmtFn(v) : fmt(v, t.st), X0 - 5, y); }); c.save(); c.translate(X0 - 44, (Y0 + Y1) / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.font = 'bold 11px ' + FONT; c.fillStyle = '#111'; c.fillText(title, 0, 0); c.restore(); }
  function axisR(c, X1, Y0, Y1, top, h, hi, title, off, col, inv) { const t = nice(0, hi, 3); c.font = '11px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'middle'; t.out.forEach(v => { const y = inv ? top + h * v / hi : Y1 - (Y1 - Y0) * v / hi; c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(X1, y); c.lineTo(X1 + 4 + off * 0, y); c.stroke(); c.fillStyle = col; c.fillText(fmt(v, t.st), X1 + 7, y); }); c.save(); c.translate(X1 + 46, inv ? top + h / 2 : (Y0 + Y1) / 2); c.rotate(Math.PI / 2); c.textAlign = 'center'; c.font = 'bold 11px ' + FONT; c.fillStyle = col; c.fillText(title, 0, 0); c.restore(); }
  function months(c, X0, X1, Y0, Y1, labels) { c.strokeStyle = '#eceef1'; c.lineWidth = 1; MST.forEach((d, i) => { const x = X0 + (X1 - X0) * d / 365; c.beginPath(); c.moveTo(x, Y0); c.lineTo(x, Y1); c.stroke(); if (labels && i < 12) { c.fillStyle = '#333'; c.font = '11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(MON[i], X0 + (X1 - X0) * (d + MST[i + 1]) / 730, Y1 + 5); } }); }
  function frame(c, x0, y0, x1, y1, tag) { c.strokeStyle = '#666'; c.lineWidth = 1.2; c.strokeRect(x0, y0, x1 - x0, y1 - y0); c.fillStyle = '#111'; c.font = 'bold 13px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(tag, x0 + 6, y0 + 5); }
  function line(c, xs, ys, col, w, dash, marks) { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); let pen = false; xs.forEach((x, i) => { if (!isFinite(ys[i])) { pen = false; return; } pen ? c.lineTo(x, ys[i]) : c.moveTo(x, ys[i]); pen = true; }); c.stroke(); c.setLineDash([]); if (marks) { c.fillStyle = '#fff'; c.lineWidth = 1.5; xs.forEach((x, i) => { if (i % marks || !isFinite(ys[i])) return; c.beginPath(); c.arc(x, ys[i], 2.8, 0, 6.2832); c.fill(); c.stroke(); }); } }

  function daily(cv, D) {
    const S = setup(cv); if (!S) return; const { c, w, h } = S, n = D.dpy, y = D.sel, yr = D.cal0 + y;
    const L = 64, R = 118, X0 = L, X1 = w - R, xs = i => X0 + (X1 - X0) * (i + 0.5) / n, hA = Math.round((h - 100 - 26) * 0.6), hB = h - 100 - 26 - hA;
    const rain = slice(D.rain, y, n), irr = slice(D.irr, y, n), dr = slice(D.drain, y, n), E = slice(D.E, y, n), T = slice(D.T, y, n), cov = slice(D.cover, y, n), wf = slice(D.wf, y, n);
    const ET = E.map((v, i) => v + T[i]);
    const med = [], p10 = [], p90 = [], etm = []; for (let i = 0; i < n; i++) { const a = [], b = []; for (let k = 0; k < D.nyr; k++) { a.push(D.wf[k * n + i]); b.push(D.E[k * n + i] + D.T[k * n + i]); } med.push(q(a, 0.5)); p10.push(q(a, 0.1)); p90.push(q(a, 0.9)); etm.push(q(b, 0.5)); }
    const sm = (a, k) => a.map((_, i) => { let s = 0, m = 0; for (let j = Math.max(0, i - k); j <= Math.min(a.length - 1, i + k); j++) { s += a[j]; m++; } return s / m; });
    const etS = sm(etm, 7), medS = sm(med, 5), p10S = sm(p10, 5), p90S = sm(p90, 5);
    const lastLeg = legend(c, [['#00859B', 'Evaporation', 'mk'], ['#2E7D4F', 'Transpiration', 'mk'], ['#111', 'Evapotranspiration', 'line'], ['#8a8a8a', 'median of 20 seasons', 'dash'], ['#3a8a3a', 'canopy cover (right)', 'dot'], ['#6b7b8c', 'rain', 'bar'], ['#E08A1E', 'irrigation', 'bar']], 10, 14, w - 100);
    const A0 = 34 + (lastLeg - 14), A1 = A0 + hA - (lastLeg - 14), B0 = A1 + 26, B1 = B0 + hB;
    // (a)
    const etMax = Math.max(1, ...ET, ...etS) * 1.18, pMax = Math.max(5, ...rain.map((v, i) => v + irr[i])) * 1.05, topH = (A1 - A0) * 0.3;
    months(c, X0, X1, A0, A1, false); axisL(c, X0, A0, X1, A1, 0, etMax, 'Evapotranspiration (mm per day)', null, true);
    const px = i => X0 + (X1 - X0) * i / n, bw = Math.max(1, (X1 - X0) / n * 0.9);
    rain.forEach((v, i) => { if (v <= 0) return; c.fillStyle = 'rgba(70,95,120,0.85)'; c.fillRect(px(i), A0, bw, topH * v / pMax); });
    irr.forEach((v, i) => { if (v <= 0) return; c.fillStyle = 'rgba(224,138,30,0.95)'; c.fillRect(px(i), A0, bw, topH * v / pMax); });
    const Ya = v => A1 - (A1 - A0) * v / etMax;
    line(c, etS.map((_, i) => xs(i)), etS.map(Ya), '#8a8a8a', 1.6, [5, 3]);
    line(c, E.map((_, i) => xs(i)), E.map(Ya), '#00859B', 1.8, null, 9); line(c, T.map((_, i) => xs(i)), T.map(Ya), '#2E7D4F', 1.8, null, 9); line(c, ET.map((_, i) => xs(i)), ET.map(Ya), '#111', 1.1);
    line(c, cov.map((_, i) => xs(i)), cov.map(v => A1 - (A1 - A0) * 0.0 - (A1 - A0 - 6) * v), '#3a8a3a', 2, [2, 3]);
    frame(c, X0, A0, X1, A1, '(a) ' + yr); axisR(c, X1, A0, A1, A0, topH, pMax, 'Rain and irrigation (mm per day)', 0, '#465f78', true);
    { c.font = '11px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'middle'; [0, 0.5, 1].forEach(v => { const yy = A1 - (A1 - A0 - 6) * v; c.fillStyle = '#3a8a3a'; c.fillText(v.toFixed(1), X1 + 66, yy); }); c.save(); c.translate(X1 + 104, (A0 + A1) / 2 + 30); c.rotate(Math.PI / 2); c.textAlign = 'center'; c.font = 'bold 11px ' + FONT; c.fillStyle = '#3a8a3a'; c.fillText('Canopy cover (0 to 1)', 0, 0); c.restore(); }
    // (b)
    c.font = '11px ' + FONT; const wMax = 1.05, Yb = v => B1 - (B1 - B0) * v / wMax, dMax = Math.max(3, ...dr) * 1.1, topB = (B1 - B0) * 0.3;
    months(c, X0, X1, B0, B1, true); axisL(c, X0, B0, X1, B1, 0, wMax, 'Water in the root zone (share of available)', v => v.toFixed(1), true);
    c.fillStyle = 'rgba(100,150,210,0.22)'; c.beginPath(); p90S.forEach((v, i) => { i ? c.lineTo(xs(i), Yb(v)) : c.moveTo(xs(i), Yb(v)); }); for (let i = n - 1; i >= 0; i--) c.lineTo(xs(i), Yb(p10S[i])); c.closePath(); c.fill();
    dr.forEach((v, i) => { if (v <= 0.02) return; c.fillStyle = 'rgba(122,90,168,0.9)'; c.fillRect(px(i), B0, bw, topB * v / dMax); });
    line(c, medS.map((_, i) => xs(i)), medS.map(Yb), '#6a8fc0', 1.5, [5, 3]); line(c, wf.map((_, i) => xs(i)), wf.map(Yb), '#1F5FA8', 1.9, null, 9);
    { const tr = 1 - (D.trig || 0.5); c.strokeStyle = '#C00000'; c.lineWidth = 1.3; c.setLineDash([6, 3]); c.beginPath(); c.moveTo(X0, Yb(tr)); c.lineTo(X1, Yb(tr)); c.stroke(); c.setLineDash([]); c.fillStyle = '#C00000'; c.font = '11px ' + FONT; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText('irrigation trigger', X1 - 6, Yb(tr) - 2); }
    irr.forEach((v, i) => { if (v <= 0) return; c.fillStyle = '#E08A1E'; c.beginPath(); c.moveTo(xs(i), B1 - 2); c.lineTo(xs(i) - 4, B1 - 10); c.lineTo(xs(i) + 4, B1 - 10); c.closePath(); c.fill(); });
    frame(c, X0, B0, X1, B1, '(b)'); axisR(c, X1, B0, B1, B0, topB, dMax, 'Drainage (mm per day)', 0, '#5b3f86', true);
    legend(c, [['#1F5FA8', 'root-zone water in ' + yr, 'mk'], ['#6a8fc0', 'median of 20 seasons', 'dash'], ['rgb(100,150,210)', '10 to 90 % range', 'band'], ['#C00000', 'trigger', 'dash'], ['#7A5AA8', 'drainage (inverted)', 'bar'], ['#E08A1E', 'irrigation event', 'bar']], X0, B1 + 32, w);
    cv._csv = () => { const r = [['day', 'rain mm', 'irrigation mm', 'evaporation mm', 'transpiration mm', 'drainage mm', 'canopy cover', 'root-zone water share']]; for (let i = 0; i < n; i++) r.push([i + 1, rain[i], irr[i], E[i], T[i], dr[i], cov[i], wf[i]]); return r; };
  }

  function yearly(cv, D) {
    const S = setup(cv); if (!S) return; const { c, w, h } = S, n = D.dpy, ny = D.nyr, sum = (A, k) => { let s = 0; for (let i = k * n; i < (k + 1) * n; i++) s += A[i]; return s; };
    const R = [], I = [], Dr = [], ET = []; for (let k = 0; k < ny; k++) { R.push(sum(D.rain, k)); I.push(sum(D.irr, k)); Dr.push(sum(D.drain, k)); ET.push(sum(D.E, k) + sum(D.T, k)); }
    const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
    const lastLeg = legend(c, [['rgba(70,95,120,0.9)', 'rain', 'bar'], ['#E08A1E', 'irrigation', 'bar'], ['#7A5AA8', 'drainage', 'bar'], ['#2E7D4F', 'evapotranspiration', 'mk'], ['#555', 'mean of the 20 seasons', 'dash']], 10, 14, w);
    const L = 64, Rr = 20, T = 34 + (lastLeg - 14), B = 40, X0 = L, X1 = w - Rr, Y0 = T, Y1 = h - B, mx = Math.max(...R, ...I, ...Dr, ...ET) * 1.1, slot = (X1 - X0) / ny, bw = slot / 4.2;
    const Y = v => Y1 - (Y1 - Y0) * v / mx;
    axisL(c, X0, Y0, X1, Y1, 0, mx, 'Water per year (mm)', null, true);
    c.fillStyle = 'rgba(255,220,100,0.28)'; c.fillRect(X0 + slot * D.sel, Y0, slot, Y1 - Y0);
    const col = ['rgba(70,95,120,0.9)', '#E08A1E', '#7A5AA8']; [R, I, Dr].forEach((A, j) => A.forEach((v, k) => { c.fillStyle = col[j]; c.fillRect(X0 + slot * k + slot * 0.12 + j * bw, Y(v), bw - 1, Y1 - Y(v)); }));
    [[R, col[0]], [ET, '#2E7D4F']].forEach(([A, cc]) => { c.strokeStyle = cc; c.lineWidth = 1.2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(X0, Y(mean(A))); c.lineTo(X1, Y(mean(A))); c.stroke(); c.setLineDash([]); });
    line(c, ET.map((_, k) => X0 + slot * (k + 0.5)), ET.map(Y), '#2E7D4F', 2.2, null, 1);
    c.fillStyle = '#333'; c.font = '11px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'top'; for (let k = 0; k < ny; k += 2) c.fillText(String(D.cal0 + k), X0 + slot * (k + 0.5), Y1 + 5); c.font = 'bold 11px ' + FONT; c.fillText('year (the working season is shaded)', (X0 + X1) / 2, Y1 + 22);
    frame(c, X0, Y0, X1, Y1, '(c)');
    cv._csv = () => [['year', 'rain mm', 'irrigation mm', 'drainage mm', 'evapotranspiration mm']].concat(R.map((v, k) => [D.cal0 + k, v.toFixed(1), I[k].toFixed(1), Dr[k].toFixed(1), ET[k].toFixed(1)]));
  }
  return { daily, yearly };
})();
