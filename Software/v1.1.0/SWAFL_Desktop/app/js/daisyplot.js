/* Daisy workbench: the plotting engine for every figure, in the style of a journal figure (the ggplot2 theme_bw look of the daisyrVis
   exercises and the figures of the SWAFL repository): white panel, light grid, axes at the left and bottom only, colour-blind safe colours,
   bold navy title at the top left, legend below the panel, a colour bar for the depth-time maps, a tick for every year on a time axis.
   Nothing but the title, the axes, the legend and the data is drawn: no citation, no caption. */
'use strict';
window.DaisyPlot = (() => {
  const FONT = '"Segoe UI", Arial, sans-serif', NAVY = '#154378', INK = '#222', GRID = '#e3e6ea', AXIS = '#444';
  const OKI = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9', '#7a6f00', '#444444'];
  const PAL = {
    viridis: ['#440154', '#472d7b', '#3b528b', '#2c728e', '#21918c', '#28ae80', '#5ec962', '#addc30', '#fde725'],
    blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    ylorrd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    ylgn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    pf: ['#08306b', '#2171b5', '#6baed6', '#c6dbef', '#ffffcc', '#fed976', '#fd8d3c', '#e31a1c', '#800026']
  };
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const lut = name => { const P = (PAL[name] || PAL.viridis).map(hex), out = []; for (let i = 0; i < 256; i++) { const x = i / 255 * (P.length - 1), k = Math.min(P.length - 2, Math.floor(x)), f = x - k; out.push(P[k].map((v, j) => Math.round(v + (P[k + 1][j] - v) * f))); } return out; };
  const rgb = (L, t) => 'rgb(' + L[Math.max(0, Math.min(255, Math.round(t * 255)))].join(',') + ')';
  const fmt = (v, d) => v == null || !isFinite(v) ? '-' : (Math.abs(v) >= 1e5 && Math.abs(v) < 1e9 ? String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : Math.abs(v) >= 1e9 || (v !== 0 && Math.abs(v) < 1e-3) ? v.toExponential(1) : (t => t.indexOf('.') >= 0 ? t.replace(/\.?0+$/, '') : t)((+v).toFixed(d == null ? 3 : d)));
  const dstr = t => new Date(t).toISOString().slice(0, 10);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function nice(lo, hi, n) { if (!(hi > lo)) { hi = lo + 1; } const s = (hi - lo) / (n || 5), m = Math.pow(10, Math.floor(Math.log10(s))), f = s / m, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m, a = Math.floor(lo / st + 1e-9) * st, t = []; for (let v = a, k = 0; k < 80; v += st, k++) { t.push(+v.toPrecision(12)); if (v >= hi - st * 1e-9) break; } return { lo: t[0], hi: t[t.length - 1], t, st }; }
  const dec = st => st >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(st) - 1e-9));

  // canvas of the right size, the title and the subtitle; returns the drawing context and the free area
  function frame(cv, o, hDefault) {
    const par = cv.parentNode, w = Math.max(360, (par ? par.clientWidth : 800) - 4), h = o.h || hDefault || 300, r = Math.max(1, window.devicePixelRatio || 1);
    cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.textBaseline = 'alphabetic';
    let top = 10; const title = o.title || cv.dataset.title || '';
    if (title) { g.font = 'bold 14px ' + FONT; g.fillStyle = NAVY; g.textAlign = 'left'; g.fillText(title, 12, 22); top = 32; }
    if (o.sub) { g.font = '11.5px ' + FONT; g.fillStyle = '#666'; g.fillText(o.sub, 12, top + 8); top += 16; }
    g.font = '12px ' + FONT; return { g, w, h, top, r };
  }
  function legend(g, items, w, y, o, dry) {   // items [{name,color,kind}] in rows centred below the panel; returns the height used
    items = items.filter(i => i.name); if (!items.length) return 0; g.font = '12px ' + FONT; const W = items.map(i => g.measureText(i.name).width + 34), rows = []; let cur = [], cw = 0;
    items.forEach((it, k) => { if (cur.length && cw + W[k] > w - 24) { rows.push({ it: cur, w: cw }); cur = []; cw = 0; } cur.push([it, W[k]]); cw += W[k]; }); rows.push({ it: cur, w: cw });
    if (dry) return rows.length * 18 + 4;
    rows.forEach((row, ri) => { let x = (w - row.w) / 2, yy = y + ri * 18; row.it.forEach(([it, ww]) => { g.fillStyle = it.color; g.strokeStyle = it.color; if (it.kind === 'box') g.fillRect(x, yy - 9, 12, 10); else { g.lineWidth = 2; g.beginPath(); g.moveTo(x, yy - 4); g.lineTo(x + 14, yy - 4); g.stroke(); if (it.kind === 'pts') { g.beginPath(); g.arc(x + 7, yy - 4, 3, 0, 7); g.fill(); } g.lineWidth = 1; } g.fillStyle = INK; g.textAlign = 'left'; g.fillText(it.name, x + 19, yy); x += ww; }); });
    return rows.length * 18 + 4;
  }
  const yTitle = (g, t, x, y0, ph) => { if (!t) return; g.save(); g.translate(x, y0 + ph / 2); g.rotate(-Math.PI / 2); g.fillStyle = INK; g.textAlign = 'center'; g.font = '12px ' + FONT; g.fillText(t, 0, 0); g.restore(); };
  const measureW = (g, labs) => Math.max.apply(null, labs.map(l => g.measureText(l).width));

  // the time axis: a tick for every year (every second, fifth... year when there are many), months when the span is short
  function timeTicks(x0, x1, pw) {
    const yrs = (x1 - x0) / 3.156e10, out = [], y0 = new Date(x0).getUTCFullYear(), y1 = new Date(x1).getUTCFullYear();
    if (yrs >= 1.6) { const step = yrs > 40 ? 10 : yrs > 20 ? 5 : yrs > 11 ? 2 : 1; for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) { const t = Date.UTC(y, 0, 1); if (t >= x0 - 1 && t <= x1 + 1) out.push({ t, lab: String(y) }); } if (out.length < 2) { for (let y = y0; y <= y1 + 1; y++) { const t = Date.UTC(y, 0, 1); if (t >= x0 && t <= x1) out.push({ t, lab: String(y) }); } } return out; }
    const months = (x1 - x0) / 2.63e9, step = months > 9 ? 3 : months > 4 ? 2 : 1; let d = new Date(Date.UTC(new Date(x0).getUTCFullYear(), new Date(x0).getUTCMonth(), 1)); if (+d < x0) d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    for (; +d <= x1; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + step, 1))) out.push({ t: +d, lab: MON[d.getUTCMonth()] + (d.getUTCMonth() === 0 || !out.length ? ' ' + d.getUTCFullYear() : '') });
    if (out.length < 2) { out.length = 0; const n = Math.max(2, Math.min(6, Math.floor(pw / 90))); for (let k = 0; k <= n; k++) { const t = x0 + (x1 - x0) * k / n, d = new Date(t); out.push({ t, lab: d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + (k === 0 ? ' ' + d.getUTCFullYear() : '') }); } }
    return out;
  }

  // ------------------------------------------------------------------------------------------------ line, points, step, bars, area
  function line(cv, series, o) {
    o = o || {}; series = (series || []).filter(s => s && s.x && s.y); const F = frame(cv, o, 300), { g, w, h } = F;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    series.forEach(s => s.x.forEach((x, i) => { const y = s.y[i]; if (isFinite(x) && isFinite(y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }));
    (o.hlines || []).forEach(l => { if (l.y < y0) y0 = l.y; if (l.y > y1) y1 = l.y; });
    (o.bands || []).forEach(b => b.x.forEach((x, i) => { if (isFinite(x) && isFinite(b.lo[i]) && isFinite(b.hi[i])) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, b.lo[i]); y1 = Math.max(y1, b.hi[i]); } }));
    if (!isFinite(x0)) { g.fillStyle = '#666'; g.textAlign = 'left'; g.fillText(o.empty || 'This log holds no values for this figure.', 60, F.top + 40); cv._geo = null; return null; }
    if (series.some(s => s.bars) && y0 > 0) y0 = 0; if (o.zero && y0 > 0) y0 = 0;
    let ny = nice(y0, y1 === y0 ? y0 + 1 : y1, 5); if (o.ylo != null) ny = Object.assign(nice(o.ylo, o.yhi != null ? o.yhi : ny.hi, 5), { lo: o.ylo }); if (o.yhi != null) ny.hi = o.yhi; if (o.ylo != null || o.yhi != null) ny.t = nice(ny.lo, ny.hi, 5).t.filter(v => v >= ny.lo - 1e-9 && v <= ny.hi + 1e-9);
    if (!o.time && x1 > x0 && (o.xint || series.some(s => s.pts))) { const pd = (x1 - x0) * 0.04; x0 -= pd; x1 += pd; }
    if (x1 <= x0) { x0 -= 0.5; x1 += 0.5; if (o.time) { x0 -= 432e5; x1 += 432e5; } }
    const yl = ny.t.map(v => fmt(v, dec(ny.st || (ny.t[1] - ny.t[0]) || 1))), L = Math.round(measureW(g, yl) + 44), R = 16, items = series.map((s, k) => ({ name: s.name, color: s.color || OKI[k % OKI.length], kind: s.bars ? 'box' : s.pts && !s.line ? 'pts' : s.pts ? 'pts' : 'line' }));
    const legH = o.noLegend ? 0 : legend(g, items, w, 0, o, true) + 4, B = o.noLegend ? (o.xt ? 42 : 24) : (o.xt ? 56 : 38) + legH - 14, T = F.top, pw = w - L - R, ph = h - T - B;
    // when the legend needs more rows than planned the canvas is drawn again, taller
    const X = x => L + (x - x0) / (x1 - x0) * pw, Y = y => T + ph - (y - ny.lo) / (ny.hi - ny.lo) * ph;
    g.lineWidth = 1; g.strokeStyle = GRID; g.font = '12px ' + FONT; g.fillStyle = AXIS; g.textAlign = 'right';
    ny.t.forEach((v, k) => { const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(L + pw, y); g.stroke(); g.fillText(yl[k], L - 7, y + 4); });
    g.textAlign = 'center'; const xt = [];
    if (o.time) timeTicks(x0, x1, pw).forEach(k => xt.push([X(k.t), k.lab]));
    else { const nx = nice(x0, x1, Math.max(3, Math.floor(pw / 70))), integer = o.xint || (x1 - x0 >= 3 && Math.abs(x0 - Math.round(x0)) < 1e-9 && nx.st >= 1 && nx.st === Math.round(nx.st)); if (o.xint && x1 - x0 < 40) { for (let v = Math.ceil(x0); v <= x1; v += Math.max(1, Math.ceil((x1 - x0) / Math.floor(pw / 46)))) xt.push([X(v), String(v)]); } else nx.t.forEach(v => { if (v >= x0 - 1e-9 && v <= x1 + 1e-9) xt.push([X(v), fmt(v, integer ? 0 : dec(nx.st))]); }); }
    xt.forEach(([px, lab]) => { g.strokeStyle = GRID; g.beginPath(); g.moveTo(px, T); g.lineTo(px, T + ph); g.stroke(); g.strokeStyle = AXIS; g.beginPath(); g.moveTo(px, T + ph); g.lineTo(px, T + ph + 4); g.stroke(); g.fillStyle = AXIS; g.fillText(lab, px, T + ph + 17); });
    g.strokeStyle = AXIS; g.lineWidth = 1; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + ph); g.lineTo(L + pw, T + ph); g.stroke();
    if (o.xt) { g.fillStyle = INK; g.textAlign = 'center'; g.fillText(o.xt, L + pw / 2, T + ph + 36); } yTitle(g, o.yt, 14, T, ph);
    g.save(); g.beginPath(); g.rect(L - 1, T - 1, pw + 2, ph + 2); g.clip();
    (o.bands || []).forEach(b => { g.fillStyle = b.color || 'rgba(0,114,178,0.15)'; g.beginPath(); b.x.forEach((x, i) => { if (isFinite(b.hi[i])) g.lineTo(X(x), Y(b.hi[i])); }); for (let i = b.x.length - 1; i >= 0; i--) if (isFinite(b.lo[i])) g.lineTo(X(b.x[i]), Y(b.lo[i])); g.closePath(); g.fill(); });
    (o.vspans || []).forEach(v => { g.fillStyle = v.color || 'rgba(0,114,178,0.08)'; g.fillRect(X(v.x0), T, X(v.x1) - X(v.x0), ph); });
    (o.hlines || []).forEach(l => { g.strokeStyle = l.color || '#888'; g.setLineDash(l.dash || [5, 4]); g.beginPath(); g.moveTo(L, Y(l.y)); g.lineTo(L + pw, Y(l.y)); g.stroke(); g.setLineDash([]); if (l.label) { g.fillStyle = l.color || '#666'; g.textAlign = 'right'; g.font = '11px ' + FONT; g.fillText(l.label, L + pw - 4, Y(l.y) - 4); g.font = '12px ' + FONT; } });
    series.forEach((s, k) => {
      const c = s.color || OKI[k % OKI.length]; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = s.lw || 1.8;
      if (s.bars) { const n = s.x.length, bw = Math.max(1.5, Math.min(40, pw / Math.max(1, n) * 0.72)); s.x.forEach((x, i) => { if (isFinite(s.y[i])) g.fillRect(X(x) - bw / 2, Math.min(Y(0), Y(s.y[i])), bw, Math.abs(Y(s.y[i]) - Y(0))); }); return; }
      if (s.area) { g.globalAlpha = 0.18; g.beginPath(); let st = null; s.x.forEach((x, i) => { if (!isFinite(s.y[i])) return; if (st == null) { g.moveTo(X(x), Y(Math.max(ny.lo, 0))); st = x; } g.lineTo(X(x), Y(s.y[i])); }); if (st != null) { g.lineTo(X(s.x[s.x.length - 1]), Y(Math.max(ny.lo, 0))); g.closePath(); g.fill(); } g.globalAlpha = 1; }
      if (!s.pts || s.line) { if (s.dash) g.setLineDash(s.dash); g.beginPath(); let on = false; s.x.forEach((x, i) => { const y = s.y[i]; if (!isFinite(x) || !isFinite(y)) { on = false; return; } if (!on) { g.moveTo(X(x), Y(y)); on = true; } else if (s.step) { g.lineTo(X(x), Y(s.y[i - 1])); g.lineTo(X(x), Y(y)); } else g.lineTo(X(x), Y(y)); }); g.stroke(); g.setLineDash([]); }
      if (s.pts) s.x.forEach((x, i) => { if (isFinite(x) && isFinite(s.y[i])) { g.beginPath(); g.arc(X(x), Y(s.y[i]), s.r || 3, 0, 7); g.fill(); } });
    });
    g.restore(); g.lineWidth = 1;
    if (!o.noLegend) legend(g, items, w, T + ph + (o.xt ? 56 : 38), o);
    const geo = { X, Y, x0, x1, L, T, pw, ph, series, tm: !!o.time }; cv._geo = geo; hover(cv); return geo;
  }
  function hover(cv) {
    if (cv._hov) return; cv._hov = 1;
    cv.addEventListener('mousemove', e => { const gg = cv._geo; if (!gg) return; const r = cv.getBoundingClientRect(), mx = e.clientX - r.left; if (mx < gg.L || mx > gg.L + gg.pw) return; const xv = gg.x0 + (mx - gg.L) / gg.pw * (gg.x1 - gg.x0); let tip = (gg.tm ? dstr(xv) : fmt(xv, 3)) + ' | ';
      gg.series.forEach(s => { let b = -1, bd = Infinity; s.x.forEach((x, i) => { const dd = Math.abs(x - xv); if (dd < bd && isFinite(s.y[i])) { bd = dd; b = i; } }); if (b >= 0) tip += (s.name || 'y') + ' ' + fmt(s.y[b], 4) + '  '; }); cv.title = tip; const ro = cv.parentNode && cv.parentNode.querySelector('.dzro'); if (ro) ro.textContent = tip; });
  }

  // ------------------------------------------------------------------------------------------------ bars: grouped (dodged) and stacked
  function barFrame(cv, o, cats, hi, lo, items, labelsLong) {
    const F = frame(cv, o, 300), { g, w, h } = F, ny = nice(Math.min(0, lo), hi > 0 ? hi : 1, 5), yl = ny.t.map(v => fmt(v, dec(ny.st)));
    const L = Math.round(measureW(g, yl) + 44), R = 16, legH = legend(g, items, w, 0, o, true) + 4, longest = labelsLong ? measureW(g, cats.map(String)) : 0, rot = longest > (w - L - R) / cats.length - 6, labelsH = rot ? Math.min(110, longest * 0.72 + 16) : 24, legBase = labelsH + (o.xt ? 18 : 0) + 14, B = legBase + legH - 14, T = F.top, pw = w - L - R, ph = h - T - B;
    const Y = v => T + ph - (v - ny.lo) / (ny.hi - ny.lo) * ph; g.strokeStyle = GRID; g.fillStyle = AXIS; g.textAlign = 'right'; g.lineWidth = 1;
    ny.t.forEach((v, k) => { const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(L + pw, y); g.stroke(); g.fillText(yl[k], L - 7, y + 4); });
    return { g, w, h, L, R, T, B, pw, ph, Y, ny, rot, labelsH, legY: T + ph + legBase };
  }
  function barAxes(Q, cats, o, every) {
    const { g, L, T, pw, ph, Y, ny } = Q, gw = pw / cats.length; g.strokeStyle = AXIS; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + ph); g.lineTo(L + pw, T + ph); g.stroke(); g.beginPath(); g.moveTo(L, Y(0)); g.lineTo(L + pw, Y(0)); g.stroke();
    g.fillStyle = AXIS; cats.forEach((c, i) => { if (every > 1 && i % every) return; const x = L + (i + 0.5) * gw; if (Q.rot) { g.save(); g.translate(x + 4, T + ph + 10); g.rotate(-Math.PI / 4); g.textAlign = 'right'; g.fillText(String(c), 0, 0); g.restore(); } else { g.textAlign = 'center'; g.fillText(String(c), x, T + ph + 17); } });
    if (o.xt) { g.fillStyle = INK; g.textAlign = 'center'; g.fillText(o.xt, L + pw / 2, T + ph + Q.labelsH + 12); } yTitle(g, o.yt, 14, T, ph);
  }
  function groupBars(cv, cats, series, o) {
    o = o || {}; series = series.map((s, k) => Object.assign({ color: OKI[k % OKI.length] }, s)); let hi = 0, lo = 0; series.forEach(s => s.vals.concat(s.hi || [], s.lo || []).forEach(v => { if (isFinite(v)) { hi = Math.max(hi, v); lo = Math.min(lo, v); } }));
    const items = series.map(s => ({ name: series.length > 1 || o.legend ? s.name : '', color: s.color, kind: 'box' })), Q = barFrame(cv, o, cats, hi * 1.08, lo, items, true), { g, L, pw, Y } = Q, gw = pw / cats.length, bw = Math.min(46, gw * 0.82 / series.length);
    if (!series.some(s => s.vals.some(isFinite))) { g.fillStyle = '#666'; g.textAlign = 'left'; g.fillText('No values to draw.', L + 10, Q.T + 30); return; }
    cats.forEach((c, i) => { const x0 = L + i * gw + (gw - bw * series.length) / 2; series.forEach((s, k) => { const v = s.vals[i]; if (!isFinite(v)) return; g.fillStyle = s.color; g.fillRect(x0 + k * bw, Math.min(Y(0), Y(v)), bw - 1, Math.abs(Y(v) - Y(0))); if (s.lo && s.hi && isFinite(s.lo[i]) && isFinite(s.hi[i])) { const cx = x0 + k * bw + (bw - 1) / 2; g.strokeStyle = '#222'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, Y(s.lo[i])); g.lineTo(cx, Y(s.hi[i])); g.moveTo(cx - 4, Y(s.lo[i])); g.lineTo(cx + 4, Y(s.lo[i])); g.moveTo(cx - 4, Y(s.hi[i])); g.lineTo(cx + 4, Y(s.hi[i])); g.stroke(); g.lineWidth = 1; } if (series.length * cats.length <= 28 && !(s.lo && s.hi)) { g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'center'; g.fillText(fmt(v, hi > 50 ? 0 : 2), x0 + k * bw + bw / 2, Y(v) + (v >= 0 ? -4 : 12)); g.font = '12px ' + FONT; } }); });
    barAxes(Q, cats, o, 1); legend(g, items, Q.w, Q.legY, o);
  }
  function stackBars(cv, xs, parts, o) {
    o = o || {}; parts = parts.map((p, k) => Object.assign({ color: OKI[k % OKI.length] }, p)); const lines = (o.lines || []).concat(o.line ? [o.line] : []).map((l, k) => Object.assign({ color: ['#111', '#D55E00', '#0072B2'][k % 3] }, l)); let hi = 0;
    xs.forEach((x, i) => { hi = Math.max(hi, parts.reduce((s, p) => s + (isFinite(p.vals[i]) ? Math.max(0, p.vals[i]) : 0), 0)); lines.forEach(l => { if (isFinite(l.vals[i])) hi = Math.max(hi, l.vals[i]); }); });
    const items = parts.map(p => ({ name: p.name, color: p.color, kind: 'box' })).concat(lines.map(l => ({ name: l.name, color: l.color, kind: 'pts' }))), Q = barFrame(cv, o, xs, hi * 1.06, 0, items, true), { g, L, pw, Y } = Q, gw = pw / xs.length, bw = Math.max(3, Math.min(60, gw * 0.7));
    xs.forEach((x, i) => { let acc = 0; parts.forEach(p => { const v = isFinite(p.vals[i]) ? Math.max(0, p.vals[i]) : 0; g.fillStyle = p.color; g.fillRect(L + i * gw + (gw - bw) / 2, Y(acc + v), bw, Y(acc) - Y(acc + v)); acc += v; }); });
    lines.forEach(l => { g.strokeStyle = l.color; g.fillStyle = l.color; g.lineWidth = 2; if (l.dash) g.setLineDash(l.dash); g.beginPath(); let on = false; xs.forEach((x, i) => { const v = l.vals[i]; if (!isFinite(v)) { on = false; return; } const px = L + (i + 0.5) * gw; on ? g.lineTo(px, Y(v)) : g.moveTo(px, Y(v)); on = true; }); g.stroke(); g.setLineDash([]); xs.forEach((x, i) => { const v = l.vals[i]; if (isFinite(v)) { g.beginPath(); g.arc(L + (i + 0.5) * gw, Y(v), 3, 0, 7); g.fill(); } }); g.lineWidth = 1; });
    barAxes(Q, xs, o, xs.length > 30 ? Math.ceil(xs.length / 30) : 1); legend(g, items, Q.w, Q.legY, o);
  }

  // ------------------------------------------------------------------------------------------------ depth against time, as an image with a colour bar
  function heat(cv, tt, zz, vv, o) {
    o = o || {}; const F = frame(cv, o, 320), { g, w, h, r } = F, ts = Array.from(new Set(tt)).sort((a, b) => a - b), zs = Array.from(new Set(zz)).sort((a, b) => b - a);   // zs from the shallowest (about 0) to the deepest (most negative)
    if (!ts.length || !zs.length) { g.fillStyle = '#666'; g.fillText('This log holds no values for this figure.', 60, F.top + 40); return; }
    let lo = Infinity, hi = -Infinity; vv.forEach(v => { if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }); if (!isFinite(lo)) { g.fillStyle = '#666'; g.fillText('This log holds no values for this figure.', 60, F.top + 40); return; }
    if (o.lo != null) lo = o.lo; if (o.hi != null) hi = o.hi; const nn = nice(lo, hi === lo ? lo + 1 : hi, 6); if (o.lo == null) lo = nn.lo; if (o.hi == null) hi = nn.hi;
    const L = 56, R = 92, T = F.top, B = 46 + (o.xt ? 0 : 0), pw = w - L - R, ph = h - T - B, t0 = ts[0], t1 = ts[ts.length - 1] === t0 ? t0 + 864e5 : ts[ts.length - 1];
    const ti = new Map(ts.map((t, i) => [t, i])), zi = new Map(zs.map((z, i) => [z, i])), nz = zs.length, M = new Float32Array(ts.length * nz).fill(NaN);
    for (let k = 0; k < vv.length; k++) { const a = ti.get(tt[k]), b = zi.get(zz[k]); if (a != null && b != null) M[a * nz + b] = vv[k]; }
    const depth = zs.map(z => -z), top = 0, bot = depth[nz - 1] + (nz > 1 ? (depth[nz - 1] - depth[nz - 2]) / 2 : 5), edges = []; for (let k = 0; k < nz; k++) edges.push(k === nz - 1 ? bot : (depth[k] + depth[k + 1]) / 2);
    const IW = Math.max(2, Math.round(pw * r)), IH = Math.max(2, Math.round(ph * r)), off = document.createElement('canvas'); off.width = IW; off.height = IH; const og = off.getContext('2d'), img = og.createImageData(IW, IH), LUT = lut(o.pal);
    const colT = new Int32Array(IW); for (let px = 0; px < IW; px++) { const t = t0 + (px + 0.5) / IW * (t1 - t0); let a = 0, b = ts.length - 1; while (a < b) { const m = (a + b) >> 1; if (ts[m] < t) a = m + 1; else b = m; } colT[px] = (a > 0 && Math.abs(ts[a - 1] - t) < Math.abs(ts[a] - t)) ? a - 1 : a; }
    const rowZ = new Int32Array(IH); for (let py = 0; py < IH; py++) { const d = top + (py + 0.5) / IH * (bot - top); let k = 0; while (k < nz - 1 && d > edges[k]) k++; rowZ[py] = k; }
    for (let py = 0; py < IH; py++) for (let px = 0; px < IW; px++) { const v = M[colT[px] * nz + rowZ[py]], o4 = (py * IW + px) * 4; if (!isFinite(v)) { img.data[o4] = img.data[o4 + 1] = img.data[o4 + 2] = 240; img.data[o4 + 3] = 255; continue; } const c = LUT[Math.max(0, Math.min(255, Math.round((v - lo) / (hi - lo || 1) * 255)))]; img.data[o4] = c[0]; img.data[o4 + 1] = c[1]; img.data[o4 + 2] = c[2]; img.data[o4 + 3] = 255; }
    og.putImageData(img, 0, 0); g.imageSmoothingEnabled = false; g.drawImage(off, L, T, pw, ph);
    const X = t => L + (t - t0) / (t1 - t0) * pw, Y = d => T + (d - top) / (bot - top) * ph; g.font = '12px ' + FONT; g.fillStyle = AXIS; g.strokeStyle = AXIS; g.lineWidth = 1;
    g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + ph); g.lineTo(L + pw, T + ph); g.stroke(); g.textAlign = 'right'; const dn = nice(0, bot, 6); dn.t.forEach(d => { if (d > bot + 1e-9) return; g.beginPath(); g.moveTo(L - 4, Y(d)); g.lineTo(L, Y(d)); g.stroke(); g.fillText(fmt(d, 0), L - 7, Y(d) + 4); });
    g.textAlign = 'center'; if (o.time) timeTicks(t0, t1, pw).forEach(k => { g.beginPath(); g.moveTo(X(k.t), T + ph); g.lineTo(X(k.t), T + ph + 4); g.stroke(); g.fillText(k.lab, X(k.t), T + ph + 17); }); else nice(t0, t1, 6).t.forEach(v => { if (v >= t0 && v <= t1) g.fillText(fmt(v, 0), X(v), T + ph + 17); });
    g.fillStyle = INK; g.fillText(o.xt || (o.time ? 'Year' : ''), L + pw / 2, T + ph + 38); yTitle(g, o.yt || 'Depth below the surface (cm)', 14, T, ph);
    const cx = L + pw + 18, cw = 14, cy = T + 14, ch = Math.max(60, ph - 28), grd = g.createLinearGradient(0, cy + ch, 0, cy); for (let i = 0; i <= 8; i++) { const c = LUT[Math.round(i / 8 * 255)]; grd.addColorStop(i / 8, 'rgb(' + c.join(',') + ')'); }
    g.fillStyle = grd; g.fillRect(cx, cy, cw, ch); g.strokeStyle = AXIS; g.strokeRect(cx, cy, cw, ch); g.fillStyle = INK; g.textAlign = 'left'; g.font = '11.5px ' + FONT; g.fillText(o.unit || '', cx - 2, cy - 5);
    const cb = nice(lo, hi, 5), CY = v => cy + ch - (v - lo) / (hi - lo || 1) * ch; g.fillStyle = AXIS; cb.t.forEach(v => { if (v < lo - 1e-9 || v > hi + 1e-9) return; g.beginPath(); g.moveTo(cx + cw, CY(v)); g.lineTo(cx + cw + 3, CY(v)); g.stroke(); g.fillText(fmt(v, dec(cb.st)), cx + cw + 6, CY(v) + 4); });
    (o.marks || []).forEach(m => { if (m.v < lo || m.v > hi) return; g.strokeStyle = '#000'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx - 4, CY(m.v)); g.lineTo(cx + cw + 3, CY(m.v)); g.stroke(); g.fillStyle = '#000'; g.font = 'bold 10.5px ' + FONT; g.fillText(m.label, cx + cw + 6 + (cb.t.some(v => Math.abs(CY(v) - CY(m.v)) < 9) ? 22 : 0), CY(m.v) + 4); g.font = '11.5px ' + FONT; });
    cv._geo = null;
  }

  // horizontal bars with the value written at the end (sensitivity, ranking)
  function hbars(cv, labels, vals, o) {
    o = o || {}; const n = labels.length, rowH = 30, F = frame(cv, Object.assign({}, o, { h: (o.h || 0) || 70 + n * rowH }), 200), { g, w, h } = F; g.font = '12px ' + FONT;
    const L = Math.min(260, Math.round(measureW(g, labels) + 18)), R = 150, T = F.top + 4, pw = w - L - R, mx0 = Math.max.apply(null, vals.filter(isFinite).concat([0])), flat = mx0 < 1e-9, mx = flat ? 1 : mx0, nn = nice(0, mx, 5), X = v => L + v / nn.hi * pw;
    g.strokeStyle = GRID; g.fillStyle = AXIS; g.textAlign = 'center'; nn.t.forEach(v => { g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), T + n * rowH); g.stroke(); g.fillText(fmt(v, dec(nn.st)), X(v), T + n * rowH + 16); });
    labels.forEach((lab, i) => { const y = T + i * rowH + 4, v = vals[i]; g.fillStyle = (o.colors && o.colors[i]) || OKI[0]; if (isFinite(v)) g.fillRect(L, y, Math.max(1.5, X(v) - L), rowH - 10); g.fillStyle = INK; g.textAlign = 'right'; g.fillText(lab, L - 8, y + 14); if (o.notes && o.notes[i]) { g.textAlign = 'left'; g.fillStyle = '#555'; g.font = '11.5px ' + FONT; g.fillText(o.notes[i], (isFinite(v) ? X(v) : L) + 6, y + 14); g.font = '12px ' + FONT; } });
    g.strokeStyle = AXIS; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + n * rowH); g.lineTo(L + pw, T + n * rowH); g.stroke(); if (flat) { g.fillStyle = '#b3261e'; g.textAlign = 'left'; g.fillText('The factors made no difference in these runs (all runs gave the same value).', L + 10, T + n * rowH / 2); }
    if (o.xt) { g.fillStyle = INK; g.textAlign = 'center'; g.fillText(o.xt, L + pw / 2, T + n * rowH + 34); }
  }
  // a grid of cells with the value written in each (interaction of two factors)
  function matrix(cv, xl, yl, z, o) {
    o = o || {}; const nx = xl.length, ny = yl.length, F = frame(cv, Object.assign({}, o, { h: o.h || Math.min(520, 120 + ny * 36) }), 300), { g, w, h } = F; g.font = '12px ' + FONT; let lo = Infinity, hi = -Infinity; z.forEach(r => r.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (!isFinite(lo)) { g.fillStyle = '#666'; g.fillText('No values to draw.', 60, F.top + 40); return; } const LU = lut(o.pal || 'viridis'), L = Math.round(measureW(g, yl.map(String)) + 52), R = 96, T = F.top + 2, B = 48, pw = w - L - R, ph = h - T - B, cw = pw / nx, ch = ph / ny;
    yl.forEach((y, j) => xl.forEach((x, i) => { const v = z[j][i], px = L + i * cw, py = T + (ny - 1 - j) * ch; if (!isFinite(v)) { g.fillStyle = '#f0f0f0'; g.fillRect(px, py, cw - 1, ch - 1); return; } const t = (v - lo) / (hi - lo || 1); g.fillStyle = rgb(LU, t); g.fillRect(px, py, cw - 1, ch - 1); g.fillStyle = t > 0.62 && (o.pal || 'viridis') !== 'viridis' ? '#111' : t > 0.55 ? '#111' : '#fff'; g.textAlign = 'center'; g.fillText(fmt(v, 3), px + cw / 2, py + ch / 2 + 4); }));
    g.fillStyle = AXIS; g.textAlign = 'center'; xl.forEach((x, i) => g.fillText(String(x), L + (i + 0.5) * cw, T + ph + 16)); g.textAlign = 'right'; yl.forEach((y, j) => g.fillText(String(y), L - 7, T + (ny - 1 - j + 0.5) * ch + 4));
    g.fillStyle = INK; g.textAlign = 'center'; g.fillText(o.xt || '', L + pw / 2, T + ph + 36); yTitle(g, o.yt, 14, T, ph);
    const cx = L + pw + 20, cy = T, chh = ph, grd = g.createLinearGradient(0, cy + chh, 0, cy); for (let i = 0; i <= 8; i++) grd.addColorStop(i / 8, rgb(LU, i / 8)); g.fillStyle = grd; g.fillRect(cx, cy, 14, chh); g.strokeStyle = AXIS; g.strokeRect(cx, cy, 14, chh);
    const cb = nice(lo, hi, 5); g.fillStyle = AXIS; g.textAlign = 'left'; cb.t.forEach(v => { if (v < lo || v > hi) return; const y = cy + chh - (v - lo) / (hi - lo || 1) * chh; g.beginPath(); g.moveTo(cx + 14, y); g.lineTo(cx + 17, y); g.stroke(); g.fillText(fmt(v, dec(cb.st)), cx + 21, y + 4); }); g.fillStyle = INK; g.font = '11.5px ' + FONT; g.fillText(o.unit || '', cx - 2, cy - 6);
  }
  return { line, heat, hbars, matrix, groupBars, stackBars, nice, fmt, OKI, PAL, frame, legend };
})();
