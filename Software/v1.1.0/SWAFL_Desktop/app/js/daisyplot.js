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
  function nice(lo, hi, n) { if (!(hi > lo)) { hi = lo + 1; } const s = (hi - lo) / (n || 5), m = Math.pow(10, Math.floor(Math.log10(s))), f = s / m, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * m, a = Math.floor(lo / st + 1e-9) * st, t = []; for (let v = a, k = 0; k < 80; v += st, k++) { t.push(Math.abs(v) < st * 1e-6 ? 0 : +v.toPrecision(12)); if (v >= hi - st * 1e-9) break; } return { lo: t[0], hi: t[t.length - 1], t, st }; }
  const dec = st => st >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(st) - 1e-9));

  // canvas of the right size, the title and the subtitle; returns the drawing context and the free area
  function frame(cv, o, hDefault) {
    const par = cv.parentNode, w = Math.max(360, (par ? par.clientWidth : 800) - 4), h = o.h || hDefault || 300, r = Math.max(3, window.devicePixelRatio || 1) * (API.exportScale || 1);
    cv.width = Math.round(w * r); cv.height = Math.round(h * r); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.textBaseline = 'alphabetic';
    // texts the person edited (Titles button of the figure) replace the ones of the program; the program's own are kept to restore them
    cv.dataset.autoTitle = o.title || cv.dataset.title || ''; cv.dataset.autoX = o.xt || ''; cv.dataset.autoY = o.yt || '';
    if (cv.dataset.customX != null) o.xt = cv.dataset.customX; if (cv.dataset.customY != null) o.yt = cv.dataset.customY;
    let top = 10; const title = cv.dataset.customTitle != null ? cv.dataset.customTitle : (o.title || cv.dataset.title || ''), pl = o.panel || cv.dataset.panel || '', tx = pl ? 34 : 12;
    if (pl) { g.font = 'bold 22px ' + FONT; g.fillStyle = '#111'; g.textAlign = 'left'; g.fillText(pl, 8, 26); top = 32; }
    if (title) { g.font = 'bold 14px ' + FONT; g.fillStyle = NAVY; g.textAlign = 'left'; g.fillText(title, tx, 22); top = 32; }
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
    if (yrs >= 1.6) { const room = Math.max(2, Math.floor(pw / 46)); let step = 1; [1, 2, 5, 10, 20, 50].some(q => { step = q; return yrs / q <= room; }); for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) { const t = Date.UTC(y, 0, 1); if (t >= x0 - 1 && t <= x1 + 1) out.push({ t, lab: String(y) }); } if (out.length < 2) { for (let y = y0; y <= y1 + 1; y++) { const t = Date.UTC(y, 0, 1); if (t >= x0 && t <= x1) out.push({ t, lab: String(y) }); } } if (out.length >= 2) return out; out.length = 0; }
    const months = (x1 - x0) / 2.63e9, step = months > 9 ? 3 : months > 4 ? 2 : 1; let d = new Date(Date.UTC(new Date(x0).getUTCFullYear(), new Date(x0).getUTCMonth(), 1)); if (+d < x0) d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    for (; +d <= x1; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + step, 1))) out.push({ t: +d, lab: MON[d.getUTCMonth()] + (d.getUTCMonth() === 0 || !out.length ? ' ' + d.getUTCFullYear() : '') });
    if (out.length < 2) { out.length = 0; const n = Math.max(2, Math.min(6, Math.floor(pw / 90))); for (let k = 0; k <= n; k++) { const t = x0 + (x1 - x0) * k / n, d = new Date(t); out.push({ t, lab: d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + (k === 0 ? ' ' + d.getUTCFullYear() : '') }); } }
    return out;
  }

  // a vertical colour bar with its ticks; b = { title, lo, hi, pal, ticks:[{v,label}] }
  function colourbar(g, x, y, w, h, b) {
    const LU = lut(b.pal || 'viridis'), grd = g.createLinearGradient(0, y + h, 0, y); for (let i = 0; i <= 8; i++) grd.addColorStop(i / 8, rgb(LU, i / 8));
    g.fillStyle = grd; g.fillRect(x, y, w, h); g.strokeStyle = AXIS; g.lineWidth = 1; g.strokeRect(x, y, w, h); g.fillStyle = INK; g.textAlign = 'left'; g.font = '11px ' + FONT; { const wd = String(b.title || '').split(' '), ls = []; let cur = ''; wd.forEach(w => { if ((cur + ' ' + w).trim().length > 15 && cur) { ls.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) ls.push(cur); ls.forEach((t, i) => g.fillText(t, x - 2, y - 6 - (ls.length - 1 - i) * 12)); }
    g.fillStyle = AXIS; (b.ticks || [{ v: b.lo, label: fmt(b.lo) }, { v: b.hi, label: fmt(b.hi) }]).forEach(t => { const yy = y + h - (t.v - b.lo) / ((b.hi - b.lo) || 1) * h; g.beginPath(); g.moveTo(x + w, yy); g.lineTo(x + w + 3, yy); g.stroke(); g.fillText(t.label, x + w + 6, yy + 4); });
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
    const yl = ny.t.map(v => fmt(v, dec(ny.st || (ny.t[1] - ny.t[0]) || 1))), L = Math.round(measureW(g, yl) + 44), R = o.cbar ? 100 : 16, items = series.map((s, k) => ({ name: s.name, color: s.color || OKI[k % OKI.length], kind: s.bars ? 'box' : s.pts && !s.line ? 'pts' : s.pts ? 'pts' : 'line' }));
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
    if (o.cbar) colourbar(g, L + pw + 20, T + 8, 13, Math.max(60, ph - 16), o.cbar);
    if (!o.noLegend) legend(g, items, w, T + ph + (o.xt ? 56 : 38), o);
    cv._csv = () => { const rows = [['series', o.time ? 'date' : 'x', 'value']]; series.forEach(q => q.x.forEach((x, i) => { if (isFinite(x) && isFinite(q.y[i])) rows.push([q.name || '', o.time ? dstr(x) : x, q.y[i]]); })); return rows; };
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
    o = o || {}; cv._csv = () => { const rows = [['category'].concat(series.map(q => q.name || 'value'))]; cats.forEach((c, i) => rows.push([c].concat(series.map(q => q.vals[i])))); return rows; }; series = series.map((s, k) => Object.assign({ color: OKI[k % OKI.length] }, s)); let hi = 0, lo = 0; series.forEach(s => s.vals.concat(s.hi || [], s.lo || []).forEach(v => { if (isFinite(v)) { hi = Math.max(hi, v); lo = Math.min(lo, v); } }));
    const items = series.map(s => ({ name: series.length > 1 || o.legend ? s.name : '', color: s.color, kind: 'box' })), Q = barFrame(cv, o, cats, hi * 1.08, lo, items, true), { g, L, pw, Y } = Q, gw = pw / cats.length, bw = Math.min(46, gw * 0.82 / series.length);
    if (!series.some(s => s.vals.some(isFinite))) { g.fillStyle = '#666'; g.textAlign = 'left'; g.fillText('No values to draw.', L + 10, Q.T + 30); return; }
    cats.forEach((c, i) => { const x0 = L + i * gw + (gw - bw * series.length) / 2; series.forEach((s, k) => { const v = s.vals[i]; if (!isFinite(v)) return; g.fillStyle = s.color; g.fillRect(x0 + k * bw, Math.min(Y(0), Y(v)), bw - 1, Math.abs(Y(v) - Y(0))); if (s.lo && s.hi && isFinite(s.lo[i]) && isFinite(s.hi[i])) { const cx = x0 + k * bw + (bw - 1) / 2; g.strokeStyle = '#222'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, Y(s.lo[i])); g.lineTo(cx, Y(s.hi[i])); g.moveTo(cx - 4, Y(s.lo[i])); g.lineTo(cx + 4, Y(s.lo[i])); g.moveTo(cx - 4, Y(s.hi[i])); g.lineTo(cx + 4, Y(s.hi[i])); g.stroke(); g.lineWidth = 1; } if (series.length * cats.length <= 28 && !(s.lo && s.hi)) { g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'center'; g.fillText(fmt(v, hi > 50 ? 0 : 2), x0 + k * bw + bw / 2, Y(v) + (v >= 0 ? -4 : 12)); g.font = '12px ' + FONT; } }); });
    barAxes(Q, cats, o, 1); legend(g, items, Q.w, Q.legY, o);
  }
  function stackBars(cv, xs, parts, o) {
    o = o || {}; cv._csv = () => { const rows = [['x'].concat(parts.map(q => q.name))]; xs.forEach((x, i) => rows.push([x].concat(parts.map(q => q.vals[i])))); return rows; }; parts = parts.map((p, k) => Object.assign({ color: OKI[k % OKI.length] }, p)); const lines = (o.lines || []).concat(o.line ? [o.line] : []).map((l, k) => Object.assign({ color: ['#111', '#D55E00', '#0072B2'][k % 3] }, l)); let hi = 0;
    xs.forEach((x, i) => { hi = Math.max(hi, parts.reduce((s, p) => s + (isFinite(p.vals[i]) ? Math.max(0, p.vals[i]) : 0), 0)); lines.forEach(l => { if (isFinite(l.vals[i])) hi = Math.max(hi, l.vals[i]); }); });
    const items = parts.map(p => ({ name: p.name, color: p.color, kind: 'box' })).concat(lines.map(l => ({ name: l.name, color: l.color, kind: 'pts' }))), Q = barFrame(cv, o, xs, hi * 1.06, 0, items, true), { g, L, pw, Y } = Q, gw = pw / xs.length, bw = Math.max(3, Math.min(60, gw * 0.7));
    xs.forEach((x, i) => { let acc = 0; parts.forEach(p => { const v = isFinite(p.vals[i]) ? Math.max(0, p.vals[i]) : 0; g.fillStyle = p.color; g.fillRect(L + i * gw + (gw - bw) / 2, Y(acc + v), bw, Y(acc) - Y(acc + v)); acc += v; }); });
    lines.forEach(l => { g.strokeStyle = l.color; g.fillStyle = l.color; g.lineWidth = 2; if (l.dash) g.setLineDash(l.dash); g.beginPath(); let on = false; xs.forEach((x, i) => { const v = l.vals[i]; if (!isFinite(v)) { on = false; return; } const px = L + (i + 0.5) * gw; on ? g.lineTo(px, Y(v)) : g.moveTo(px, Y(v)); on = true; }); g.stroke(); g.setLineDash([]); xs.forEach((x, i) => { const v = l.vals[i]; if (isFinite(v)) { g.beginPath(); g.arc(L + (i + 0.5) * gw, Y(v), 3, 0, 7); g.fill(); } }); g.lineWidth = 1; });
    barAxes(Q, xs, o, xs.length > 30 ? Math.ceil(xs.length / 30) : 1); legend(g, items, Q.w, Q.legY, o);
  }

  // ------------------------------------------------------------------------------------------------ depth against time, as an image with a colour bar
  function heat(cv, tt, zz, vv, o) {
    o = o || {}; cv._csv = () => { const rows = [['time', 'depth_cm', 'value']]; for (let k = 0; k < vv.length; k++) if (isFinite(vv[k])) rows.push([o.time ? dstr(tt[k]) : tt[k], zz[k], vv[k]]); return rows; }; const F = frame(cv, o, 320), { g, w, h, r } = F, ts = Array.from(new Set(tt)).sort((a, b) => a - b), zs = Array.from(new Set(zz)).sort((a, b) => b - a);   // zs from the shallowest (about 0) to the deepest (most negative)
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
    o = o || {}; const n = labels.length, rowH = 30, F = frame(cv, Object.assign({}, o, { h: (o.h || 0) || 86 + n * rowH }), 200), { g, w, h } = F; g.font = '12px ' + FONT;
    const L = Math.min(260, Math.round(measureW(g, labels) + 18)), R = 150, T = F.top + 4, pw = w - L - R, mx0 = Math.max.apply(null, vals.filter(isFinite).concat([0])), flat = mx0 < 1e-9, mx = flat ? 1 : mx0, nn = nice(0, mx, 5), X = v => L + v / nn.hi * pw;
    g.strokeStyle = GRID; g.fillStyle = AXIS; g.textAlign = 'center'; nn.t.forEach(v => { g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), T + n * rowH); g.stroke(); g.fillText(fmt(v, dec(nn.st)), X(v), T + n * rowH + 16); });
    labels.forEach((lab, i) => { const y = T + i * rowH + 4, v = vals[i]; g.fillStyle = (o.colors && o.colors[i]) || OKI[0]; if (isFinite(v)) g.fillRect(L, y, Math.max(1.5, X(v) - L), rowH - 10); g.fillStyle = INK; g.textAlign = 'right'; g.fillText(fitT(g, lab, L - 12), L - 8, y + 14); if (o.notes && o.notes[i]) { g.textAlign = 'left'; g.fillStyle = '#555'; g.font = '11.5px ' + FONT; g.fillText(o.notes[i], (isFinite(v) ? X(v) : L) + 6, y + 14); g.font = '12px ' + FONT; } });
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
  // a response over two numeric factors: a smooth coloured surface, white contour lines with their values, the tested combinations as dots, and a colour bar.
  // xs and ys ascending, Z[iy][ix]; o = { title, panel, xt, yt, unit, pal, levels, h, dots }
  function surface(cv, xs, ys, Z, o) {
    o = o || {}; const F = frame(cv, o, 340), { g, w, h } = F; let lo = Infinity, hi = -Infinity; Z.forEach(row => row.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }));
    if (!isFinite(lo)) { g.fillStyle = '#666'; g.textAlign = 'left'; g.fillText('No values to draw.', 60, F.top + 40); return; }
    const nn = nice(lo, hi === lo ? lo + 1 : hi, 6); lo = Math.min(lo, nn.lo); hi = Math.max(hi, nn.hi);
    const L = 58, R = 96, T = F.top, B = 48, pw = w - L - R, ph = h - T - B, x0 = xs[0], x1 = xs[xs.length - 1] === x0 ? x0 + 1 : xs[xs.length - 1], y0 = ys[0], y1 = ys[ys.length - 1] === y0 ? y0 + 1 : ys[ys.length - 1];
    const xp = v => L + (v - x0) / (x1 - x0) * pw, yp = v => T + ph - (v - y0) / (y1 - y0) * ph, LU = lut(o.pal || 'viridis');
    const NX = 96, NY = 72, G = [], at = (ix, iy) => { const v = Z[iy] && Z[iy][ix]; return isFinite(v) ? v : NaN; };
    for (let j = 0; j < NY; j++) { const yv = y0 + (y1 - y0) * j / (NY - 1); let jy = 0; while (jy < ys.length - 2 && yv > ys[jy + 1]) jy++; const fy = ys.length > 1 ? (yv - ys[jy]) / ((ys[jy + 1] - ys[jy]) || 1) : 0, row = [];
      for (let i = 0; i < NX; i++) { const xv = x0 + (x1 - x0) * i / (NX - 1); let ix = 0; while (ix < xs.length - 2 && xv > xs[ix + 1]) ix++; const fx = xs.length > 1 ? (xv - xs[ix]) / ((xs[ix + 1] - xs[ix]) || 1) : 0, ix2 = Math.min(xs.length - 1, ix + 1), jy2 = Math.min(ys.length - 1, jy + 1);
        row.push((at(ix, jy) * (1 - fx) + at(ix2, jy) * fx) * (1 - fy) + (at(ix, jy2) * (1 - fx) + at(ix2, jy2) * fx) * fy); } G.push(row); }
    const off = document.createElement('canvas'); off.width = NX; off.height = NY; const og = off.getContext('2d'), img = og.createImageData(NX, NY);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const v = G[NY - 1 - j][i], k = (j * NX + i) * 4; if (!isFinite(v)) { img.data[k] = img.data[k + 1] = img.data[k + 2] = 238; img.data[k + 3] = 255; continue; } const c = LU[Math.max(0, Math.min(255, Math.round((v - lo) / (hi - lo || 1) * 255)))]; img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255; }
    og.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(off, L, T, pw, ph);
    const lv = nice(lo, hi, o.levels || 6).t.filter(v => v > lo + (hi - lo) * 0.04 && v < hi - (hi - lo) * 0.04), px = i => L + i / (NX - 1) * pw, py = j => T + ph - j / (NY - 1) * ph;
    g.save(); g.beginPath(); g.rect(L, T, pw, ph); g.clip(); g.lineWidth = 1.3; g.font = 'bold 11px ' + FONT; g.textAlign = 'center';
    lv.forEach(Lv => { const segs = [];
      for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) { const a = G[j][i], b = G[j][i + 1], c = G[j + 1][i + 1], d = G[j + 1][i]; if (![a, b, c, d].every(isFinite)) continue; const idx = (a > Lv ? 8 : 0) | (b > Lv ? 4 : 0) | (c > Lv ? 2 : 0) | (d > Lv ? 1 : 0); if (idx === 0 || idx === 15) continue;
        const t = (p, q) => (Lv - p) / ((q - p) || 1e-12), E1 = () => [i + t(a, b), j], E2 = () => [i + 1, j + t(b, c)], E3 = () => [i + t(d, c), j + 1], E4 = () => [i, j + t(a, d)];
        const TB = { 1: [E4, E3], 2: [E3, E2], 3: [E4, E2], 4: [E1, E2], 5: [E1, E4, E3, E2], 6: [E1, E3], 7: [E1, E4], 8: [E1, E4], 9: [E1, E3], 10: [E1, E2, E4, E3], 11: [E1, E2], 12: [E4, E2], 13: [E3, E2], 14: [E4, E3] }[idx]; if (!TB) continue; for (let m = 0; m < TB.length; m += 2) segs.push([TB[m](), TB[m + 1]()]); }
      g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineWidth = 1.3; g.beginPath(); segs.forEach(s2 => { g.moveTo(px(s2[0][0]), py(s2[0][1])); g.lineTo(px(s2[1][0]), py(s2[1][1])); }); g.stroke();
      if (segs.length > 14) { let best = null, bd = -1; segs.forEach((s2, k) => { if (k % 5) return; const cx = px((s2[0][0] + s2[1][0]) / 2), cy = py((s2[0][1] + s2[1][1]) / 2), d = Math.min(cx - L, L + pw - cx, cy - T, T + ph - cy); if (d > bd && d > 16) { bd = d; best = [cx, cy]; } });
        if (best) { const t = fmt(Lv, dec(nn.st || 1)); g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 3; g.strokeText(t, best[0], best[1] + 4); g.fillStyle = 'rgba(0,0,0,0.78)'; g.fillText(t, best[0], best[1] + 4); } } });
    if (o.dots !== false) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 0.8; xs.forEach(xv => ys.forEach(yv => { g.beginPath(); g.arc(xp(xv), yp(yv), 2.4, 0, 7); g.fill(); g.stroke(); })); }
    g.restore(); g.strokeStyle = AXIS; g.lineWidth = 1; g.beginPath(); g.moveTo(L, T); g.lineTo(L, T + ph); g.lineTo(L + pw, T + ph); g.stroke(); g.font = '12px ' + FONT; g.fillStyle = AXIS;
    g.textAlign = 'center'; (xs.length <= 8 ? xs : nice(x0, x1, 6).t.filter(v => v >= x0 && v <= x1)).forEach(v => { g.beginPath(); g.moveTo(xp(v), T + ph); g.lineTo(xp(v), T + ph + 4); g.stroke(); g.fillText(fmt(v, 3), xp(v), T + ph + 17); });
    g.textAlign = 'right'; (ys.length <= 8 ? ys : nice(y0, y1, 6).t.filter(v => v >= y0 && v <= y1)).forEach(v => { g.beginPath(); g.moveTo(L - 4, yp(v)); g.lineTo(L, yp(v)); g.stroke(); g.fillText(fmt(v, 3), L - 7, yp(v) + 4); });
    g.fillStyle = INK; g.textAlign = 'center'; g.fillText(o.xt || '', L + pw / 2, T + ph + 38); yTitle(g, o.yt, 14, T, ph);
    colourbar(g, L + pw + 22, T + 14, 13, Math.max(60, ph - 28), { title: o.unit || '', lo, hi, pal: o.pal || 'viridis', ticks: nice(lo, hi, 5).t.filter(v => v >= lo && v <= hi).map(v => ({ v, label: fmt(v, dec(nn.st || 1)) })) });
    cv._csv = () => { const rows = [['x', 'y', 'value']]; ys.forEach((yv, j) => xs.forEach((xv, i) => { if (isFinite(Z[j][i])) rows.push([xv, yv, Z[j][i]]); })); return rows; };
  }
  // ---------------------------------------------------------------- figures of experiments in the style of journals: facet strips, light panels, error bars
  const STRIP = '#e9ebee', PANEL = '#fbfbfc';
  const fitT = (g, t, w) => { t = String(t); if (g.measureText(t).width <= w) return t; while (t.length > 3 && g.measureText(t + '…').width > w) t = t.slice(0, -1); return t + '…'; };
  const strip = (g, x, y, w, t) => { g.fillStyle = STRIP; g.fillRect(x, y, w, 20); g.fillStyle = INK; g.font = '600 12px ' + FONT; g.textAlign = 'center'; g.fillText(fitT(g, t, w - 8), x + w / 2, y + 14); g.font = '12px ' + FONT; };
  /* every run of an experiment, one row each, with one panel per result (a dot chart): rows [{label, ref, vals:[...]}], cols [{title, unit, color}] */
  function dotrows(cv, rows, cols, o) {
    o = o || {}; const n = rows.length, rh = n > 40 ? 15 : 20, F = frame(cv, Object.assign({}, o, { h: (o.top0 || 40) + 64 + n * rh + (o.title ? 10 : 0) }), 300), { g, w } = F; g.font = '12px ' + FONT;
    cv._csv = () => [['run'].concat(cols.map(c => c.title + (c.unit ? ' (' + c.unit + ')' : '')))].concat(rows.map(r => [r.label].concat(r.vals)));
    const LW = Math.min(o.labelW || 300, Math.max(120, measureW(g, rows.map(r => r.label)) + 14)), T = F.top + 6, gap = 10, pw = (w - LW - 14 - gap * (cols.length - 1)) / cols.length, ph = n * rh + 6;
    rows.forEach((r, i) => { const y = T + 22 + i * rh + rh / 2 + 4; g.fillStyle = r.ref ? '#777' : INK; g.textAlign = 'right'; g.font = (r.bold ? '600 ' : '') + (n > 40 ? 11 : 12) + 'px ' + FONT; g.fillText(fitT(g, r.label, LW - 8), LW - 6, y); });
    cols.forEach((c, k) => { const x0 = LW + k * (pw + gap), v = rows.map(r => r.vals[k]).filter(isFinite); strip(g, x0, T, pw, c.title + (c.unit ? ' (' + c.unit + ')' : ''));
      g.fillStyle = PANEL; g.fillRect(x0, T + 22, pw, ph); g.strokeStyle = '#c9ced6'; g.strokeRect(x0 + 0.5, T + 22.5, pw - 1, ph - 1); if (!v.length) return;
      let lo = Math.min.apply(null, v), hi = Math.max.apply(null, v); if (lo >= 0 && lo < 0.4 * hi) lo = 0; if (hi === lo) { hi += Math.abs(hi) * 0.1 || 1; lo -= Math.abs(lo) * 0.1 || 0; } const nn = nice(lo >= 0 ? Math.max(0, lo - (hi - lo) * 0.04) : lo - (hi - lo) * 0.04, hi + (hi - lo) * 0.04, 4), X = q => x0 + 8 + (q - nn.lo) / (nn.hi - nn.lo) * (pw - 16);
      g.textAlign = 'center'; g.font = '11px ' + FONT; nn.t.forEach(t => { const xx = X(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(xx + 0.5, T + 22); g.lineTo(xx + 0.5, T + 22 + ph); g.stroke(); g.fillStyle = AXIS; g.fillText(fmt(t, dec(nn.st)), xx, T + 22 + ph + 14); });
      rows.forEach((r, i) => { const q = r.vals[k], y = T + 22 + i * rh + rh / 2 + 3; g.strokeStyle = '#dfe3e8'; g.setLineDash([1, 3]); g.beginPath(); g.moveTo(x0 + 2, y); g.lineTo(x0 + pw - 2, y); g.stroke(); g.setLineDash([]); if (!isFinite(q)) return;
        g.beginPath(); g.arc(X(q), y, rh > 15 ? 4.6 : 3.6, 0, 7); if (r.ref) { g.fillStyle = '#fff'; g.fill(); g.strokeStyle = c.color; g.lineWidth = 1.6; g.stroke(); g.lineWidth = 1; } else { g.fillStyle = c.color; g.fill(); g.strokeStyle = '#fff'; g.stroke(); } });
      const m = v.reduce((a, b) => a + b, 0) / v.length; g.strokeStyle = '#555'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(X(m), T + 22); g.lineTo(X(m), T + 22 + ph); g.stroke(); g.setLineDash([]); });
    g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(o.foot || 'Each row is one run (one combination of the values). Dashed line: the mean of the runs.' + (rows.some(r => r.ref) ? ' Open circles: rainfed references.' : ''), 8, T + 22 + ph + 34);
  }
  /* the main effect of every factor: the mean of the runs at each level with its standard error and the number of runs, one panel per factor, one y scale */
  function facets(cv, panels, o) {
    o = o || {}; const per = Math.min(panels.length, o.cols || 3), nr = Math.ceil(panels.length / per), PH = 190, F = frame(cv, Object.assign({}, o, { h: (o.title ? 44 : 20) + nr * (PH + 76) + 30 }), 300), { g, w } = F;
    cv._csv = () => { const out = [['factor', 'level', 'mean', 'standard error', 'runs']]; panels.forEach(p => p.xs.forEach((x, i) => out.push([p.title, x, p.m[i], p.se[i], p.n[i]]))); return out; };
    const all = []; panels.forEach(p => p.m.forEach((m, i) => { if (isFinite(m)) { all.push(m + (isFinite(p.se[i]) ? p.se[i] : 0)); all.push(m - (isFinite(p.se[i]) ? p.se[i] : 0)); } })); if (!all.length) return;
    let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all); if (lo >= 0 && lo < 0.35 * hi) lo = 0; const nn = nice(lo >= 0 ? Math.max(0, lo - (hi - lo) * 0.06) : lo - (hi - lo) * 0.06, hi + (hi - lo) * 0.08, 4), grand = o.grand;
    const LM = 58, gap = 14, pw = (w - LM - 12 - gap * (per - 1)) / per;
    panels.forEach((p, k) => { const col = k % per, row = Math.floor(k / per), x0 = LM + col * (pw + gap), y0 = F.top + 6 + row * (PH + 76), Y = q => y0 + 22 + PH - (q - nn.lo) / (nn.hi - nn.lo) * PH, nx = p.xs.length, X = i => x0 + (i + 0.5) * pw / nx;
      strip(g, x0, y0, pw, p.title); g.fillStyle = PANEL; g.fillRect(x0, y0 + 22, pw, PH); g.strokeStyle = '#c9ced6'; g.strokeRect(x0 + 0.5, y0 + 22.5, pw - 1, PH - 1);
      g.font = '11px ' + FONT; nn.t.forEach(t => { const yy = Y(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(x0, yy + 0.5); g.lineTo(x0 + pw, yy + 0.5); g.stroke(); if (col === 0) { g.fillStyle = AXIS; g.textAlign = 'right'; g.fillText(fmt(t, dec(nn.st)), x0 - 5, yy + 4); } });
      if (isFinite(grand)) { g.strokeStyle = '#888'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x0, Y(grand)); g.lineTo(x0 + pw, Y(grand)); g.stroke(); g.setLineDash([]); }
      if (p.numeric && nx > 1) { g.strokeStyle = p.color || OKI[0]; g.lineWidth = 1.6; g.beginPath(); let on = false; p.m.forEach((m, i) => { if (!isFinite(m)) return; on ? g.lineTo(X(i), Y(m)) : g.moveTo(X(i), Y(m)); on = true; }); g.stroke(); g.lineWidth = 1; }
      p.m.forEach((m, i) => { if (!isFinite(m)) return; const e = p.se[i]; if (isFinite(e) && e > 0) { g.strokeStyle = '#333'; g.beginPath(); g.moveTo(X(i), Y(m - e)); g.lineTo(X(i), Y(m + e)); g.moveTo(X(i) - 4, Y(m - e)); g.lineTo(X(i) + 4, Y(m - e)); g.moveTo(X(i) - 4, Y(m + e)); g.lineTo(X(i) + 4, Y(m + e)); g.stroke(); }
        g.beginPath(); g.arc(X(i), Y(m), 4.8, 0, 7); g.fillStyle = p.color || OKI[0]; g.fill(); g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#666'; g.textAlign = 'center'; g.font = '10px ' + FONT; g.fillText('n = ' + p.n[i], X(i), y0 + 22 + PH + 27); });
      g.fillStyle = INK; g.font = '11px ' + FONT; g.textAlign = 'center'; const step = Math.max(1, Math.ceil(nx * 46 / pw)); p.xs.forEach((x, i) => { if (i % step === 0) g.fillText(fitT(g, x, pw / nx * step - 2), X(i), y0 + 22 + PH + 14); });
      if (p.xt) { g.fillStyle = '#555'; g.fillText(fitT(g, p.xt, pw), x0 + pw / 2, y0 + 22 + PH + 42); } });
    yTitle(g, o.yt, 14, F.top + 28, nr * (PH + 76) - 64);
    g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(o.foot || 'Points: the mean of the runs at each level, bars: one standard error, n: the number of runs. Dashed line: the mean of all runs.', 8, F.h - 8);
  }
  /* one stacked bar for each run: rows [{label, ref}], parts [{name, color, vals}] */
  function runStacks(cv, labels, parts, o) {
    o = o || {}; const n = labels.length, rh = n > 40 ? 15 : 20, F = frame(cv, Object.assign({}, o, { h: (o.title ? 44 : 20) + 70 + n * rh }), 300), { g, w } = F;
    cv._csv = () => [['run'].concat(parts.map(p => p.name))].concat(labels.map((l, i) => [l].concat(parts.map(p => p.vals[i]))));
    g.font = '12px ' + FONT; const LW = Math.min(300, Math.max(120, measureW(g, labels) + 14)), T = F.top + 6, pw = w - LW - 20, tot = labels.map((_, i) => parts.reduce((a, p) => a + Math.max(0, p.vals[i] || 0), 0)), nn = nice(0, Math.max.apply(null, tot.concat([1])) * 1.04, 5), X = q => LW + q / nn.hi * pw;
    g.fillStyle = PANEL; g.fillRect(LW, T, pw, n * rh + 4); nn.t.forEach(t => { g.strokeStyle = GRID; g.beginPath(); g.moveTo(X(t) + 0.5, T); g.lineTo(X(t) + 0.5, T + n * rh + 4); g.stroke(); g.fillStyle = AXIS; g.textAlign = 'center'; g.font = '11px ' + FONT; g.fillText(fmt(t, dec(nn.st)), X(t), T + n * rh + 18); });
    labels.forEach((l, i) => { const y = T + 2 + i * rh; g.fillStyle = INK; g.textAlign = 'right'; g.font = (n > 40 ? 11 : 12) + 'px ' + FONT; g.fillText(fitT(g, l, LW - 8), LW - 6, y + rh * 0.7); let x = LW; parts.forEach(p => { const v = Math.max(0, p.vals[i] || 0), ww = v / nn.hi * pw; g.fillStyle = p.color; g.fillRect(x, y + 2, ww, rh - 5); x += ww; }); });
    if (o.xt) { g.fillStyle = INK; g.textAlign = 'center'; g.font = '12px ' + FONT; g.fillText(o.xt, LW + pw / 2, T + n * rh + 34); }
    legend(g, parts.map(p => ({ name: p.name, color: p.color, kind: 'box' })), w, T + n * rh + 54, o);
  }
  /* small multiples of time series, journal style: panels [{title, series:[{name, color, x[], m[], lo[], hi[], pts, dash}]}], one y scale for all panels,
     a shaded band (lo to hi) under every line, the legend once under the panels. o.xkind: 'doy' (months of the year), 'time' (dates), 'num' (years or numbers) */
  const hexA = (c, a) => { if (/^rgb\(/.test(c || '')) return c.replace('rgb(', 'rgba(').replace(')', ',' + a + ')'); const m = /^#?([0-9a-f]{6})$/i.exec(c || ''); if (!m) return c; const n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  function ribbons(cv, panels, o) {
    o = o || {}; panels = panels.filter(p => p.series && p.series.some(s => s.x && s.x.length)); if (!panels.length) return;
    const np = panels.length, per = Math.min(np, o.cols || (np >= 5 ? 3 : np === 4 ? 2 : np)), nr = Math.ceil(np / per), PH = o.ph || (np === 1 ? 250 : per === 1 ? 200 : 180);
    const names = [], items = []; panels.forEach(p => p.series.forEach(s => { if (s.name && names.indexOf(s.name) < 0) { names.push(s.name); items.push({ name: s.name, color: s.color, kind: s.pts ? 'pts' : 'line' }); } }));
    const g0 = cv.getContext('2d'), wGuess = Math.max(360, (cv.parentNode ? cv.parentNode.clientWidth : 800) - 4), lh = names.length > 1 ? legend(g0, items, wGuess, 0, {}, true) : 0;
    const F = frame(cv, Object.assign({}, o, { h: (o.title ? 44 : 18) + nr * (PH + 44) + lh + 36 }), 300), { g, w } = F;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; panels.forEach(p => p.series.forEach(s => s.x.forEach((x, i) => { if (!isFinite(x)) return; x0 = Math.min(x0, x); x1 = Math.max(x1, x); [s.m[i], s.lo ? s.lo[i] : NaN, s.hi ? s.hi[i] : NaN].forEach(v => { if (isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); } }); })));
    if (!isFinite(y0)) return; if (o.xkind === 'doy') { x0 = 0; x1 = 365; } if (x1 <= x0) x1 = x0 + 1; if (y0 >= 0 && y0 < 0.3 * y1) y0 = 0; const nn0 = nice(y0 >= 0 ? Math.max(0, y0 - (y1 - y0) * 0.04) : y0 - (y1 - y0) * 0.04, y1 + (y1 - y0) * 0.06 || 1, 4);
    g.font = '11px ' + FONT; const LM = Math.round(Math.max(30, measureW(g, nn0.t.map(t => fmt(t, dec(nn0.st))))) + 30), gap = o.freeY ? LM - 8 : 12, pw = (w - LM - 12 - gap * (per - 1)) / per;
    const nnOf = p => { let a1 = Infinity, b1 = -Infinity; p.series.forEach(s => s.x.forEach((x, i) => [s.m[i], s.lo ? s.lo[i] : NaN, s.hi ? s.hi[i] : NaN].forEach(v => { if (isFinite(v)) { a1 = Math.min(a1, v); b1 = Math.max(b1, v); } }))); if (!isFinite(a1)) return nn0; if (a1 >= 0 && a1 < 0.3 * b1) a1 = 0; return nice(a1 >= 0 ? Math.max(0, a1 - (b1 - a1) * 0.04) : a1 - (b1 - a1) * 0.04, b1 + (b1 - a1) * 0.06 || 1, 4); };
    cv._csv = () => { const out = [['panel', 'series', o.xkind === 'time' ? 'date' : o.xkind === 'doy' ? 'day of year' : 'x', 'mean', 'low', 'high']]; panels.forEach(p => p.series.forEach(s => s.x.forEach((x, i) => out.push([p.title || '', s.name || '', o.xkind === 'time' ? new Date(x).toISOString().slice(0, 10) : x, s.m[i], s.lo ? s.lo[i] : '', s.hi ? s.hi[i] : ''])))); return out; };
    const ticks = pw2 => { if (o.xkind === 'doy') { const md = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; return md.map((d, k) => ({ t: d, lab: pw2 < 260 ? MON[k][0] : MON[k] })); } if (o.xkind === 'time') { const yrs = (x1 - x0) / 3.156e10; if (yrs >= 1.2 && yrs < 6) { const out = [], step = pw2 / (yrs * 4) > 34 ? 3 : 6; for (let y = new Date(x0).getUTCFullYear(); y <= new Date(x1).getUTCFullYear(); y++) for (let m = 0; m < 12; m += step) { const t = Date.UTC(y, m, 1); if (t >= x0 && t <= x1) out.push({ t, lab: m === 0 ? String(y) : MON[m].slice(0, pw2 / (yrs * 12 / step) > 30 ? 3 : 1) }); } return out; } return timeTicks(x0, x1, pw2).map(q => ({ t: q.t, lab: q.lab })); } const ints = panels.every(p => p.series.every(s2 => s2.x.every(x => Math.abs(x - Math.round(x)) < 1e-9))); const n2 = nice(x0, x1, Math.max(2, Math.min(8, Math.floor(pw2 / 60)))); if (ints && n2.st < 1) { const out = [], stp = Math.max(1, Math.ceil((x1 - x0) / Math.max(2, Math.floor(pw2 / 50)))); for (let t = Math.ceil(x0); t <= x1; t += stp) out.push({ t, lab: String(t) }); return out; } return n2.t.filter(t => t >= x0 - 1e-9 && t <= x1 + 1e-9).map(t => ({ t, lab: fmt(t, dec(n2.st)) })); };
    panels.forEach((p, k) => { const nn = o.freeY ? nnOf(p) : nn0, col = k % per, row = Math.floor(k / per), px = LM + col * (pw + gap), py = F.top + 6 + row * (PH + 44), top = py + (p.title ? 22 : 0), ph = PH - (p.title ? 22 : 0);
      const X = x => px + (x - x0) / (x1 - x0) * pw, Y = v => top + ph - (v - nn.lo) / (nn.hi - nn.lo) * ph;
      if (p.title) strip(g, px, py, pw, p.title); g.fillStyle = '#fff'; g.fillRect(px, top, pw, ph);
      g.font = '11px ' + FONT; nn.t.forEach(t => { const yy = Y(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(px, yy + 0.5); g.lineTo(px + pw, yy + 0.5); g.stroke(); g.strokeStyle = AXIS; g.beginPath(); g.moveTo(px, yy + 0.5); g.lineTo(px + 4, yy + 0.5); g.stroke(); if (col === 0 || o.freeY) { g.fillStyle = AXIS; g.textAlign = 'right'; g.fillText(fmt(t, dec(nn.st)), px - 5, yy + 4); } });
      const tk = ticks(pw); g.textAlign = 'center'; tk.forEach(q => { const xx = X(q.t); if (xx < px - 1 || xx > px + pw + 1) return; const edge = col < per - 1 && k + 1 < np && xx > px + pw - 14; g.strokeStyle = GRID; g.beginPath(); g.moveTo(xx + 0.5, top); g.lineTo(xx + 0.5, top + ph); g.stroke(); g.strokeStyle = AXIS; g.beginPath(); g.moveTo(xx + 0.5, top + ph); g.lineTo(xx + 0.5, top + ph - 4); g.stroke(); g.fillStyle = AXIS; if (!edge) g.fillText(q.lab, xx + (o.xkind === 'doy' ? pw / 24 : 0), top + ph + 14); });
      g.save(); g.beginPath(); g.rect(px, top, pw, ph); g.clip();
      p.series.forEach(s => { if (!s.lo || !s.hi) return; g.fillStyle = hexA(s.color, s.alpha || 0.16); g.beginPath(); let on = false; s.x.forEach((x, i) => { if (!isFinite(s.hi[i])) return; on ? g.lineTo(X(x), Y(s.hi[i])) : g.moveTo(X(x), Y(s.hi[i])); on = true; }); for (let i = s.x.length - 1; i >= 0; i--) if (isFinite(s.lo[i])) g.lineTo(X(s.x[i]), Y(s.lo[i])); g.closePath(); g.fill(); });
      p.series.forEach(s => { g.strokeStyle = s.color; g.lineWidth = s.lw || 1.7; g.setLineDash(s.dash || []); g.beginPath(); let on = false; s.x.forEach((x, i) => { const v = s.m[i]; if (!isFinite(v)) { on = false; return; } on ? g.lineTo(X(x), Y(v)) : g.moveTo(X(x), Y(v)); on = true; }); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
        if (s.pts) s.x.forEach((x, i) => { const v = s.m[i]; if (!isFinite(v)) return; g.beginPath(); g.arc(X(x), Y(v), 3.4, 0, 7); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = s.color; g.lineWidth = 1.6; g.stroke(); g.lineWidth = 1; }); });
      g.restore(); g.strokeStyle = '#333'; g.lineWidth = 1; g.strokeRect(px + 0.5, top + 0.5, pw - 1, ph - 1);
      if (p.letter) { g.font = 'bold 13px ' + FONT; g.fillStyle = '#111'; g.textAlign = 'left'; g.fillText(p.letter, px + 6, top + 16); } });
    yTitle(g, o.yt, 13, F.top + 6, nr * (PH + 44) - 44); g.fillStyle = INK; g.font = '12px ' + FONT; g.textAlign = 'center'; if (o.xt) g.fillText(o.xt, LM + (w - LM - 12) / 2, F.top + 6 + nr * (PH + 44) + 2);
    if (names.length > 1) legend(g, items, w, F.top + 6 + nr * (PH + 44) + 22, {}); if (o.foot) { g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(o.foot, 8, F.h - 8); }
  }
  /* depth profiles, journal style: depth downwards on the y axis, the value on the x axis; panels [{title, series:[{name, color, z[], v[], lo[], hi[]}]}] */
  function profiles(cv, panels, o) {
    o = o || {}; panels = panels.filter(p => p.series && p.series.some(s => s.z && s.z.length)); if (!panels.length) return;
    const np = panels.length, per = Math.min(np, o.cols || 4), nr = Math.ceil(np / per), PH = o.ph || 260, items = []; panels.forEach(p => p.series.forEach(s => { if (s.name && !items.some(i => i.name === s.name)) items.push({ name: s.name, color: s.color, kind: 'pts' }); }));
    const lh = items.length > 1 ? legend(cv.getContext('2d'), items, Math.max(360, (cv.parentNode ? cv.parentNode.clientWidth : 800) - 4), 0, {}, true) : 0, F = frame(cv, Object.assign({}, o, { h: (o.title ? 44 : 18) + nr * (PH + 46) + lh + 30 }), 300), { g, w } = F;
    let v0 = Infinity, v1 = -Infinity, z1 = 0; panels.forEach(p => p.series.forEach(s => s.z.forEach((z, i) => { z1 = Math.max(z1, Math.abs(z)); [s.v[i], s.lo ? s.lo[i] : NaN, s.hi ? s.hi[i] : NaN].forEach(v => { if (isFinite(v)) { v0 = Math.min(v0, v); v1 = Math.max(v1, v); } }); })));
    if (!isFinite(v0)) return; if (v0 >= 0 && v0 < 0.3 * v1) v0 = 0; const nv = nice(v0, v1 > v0 ? v1 : v0 + 1, 4), nz = nice(0, z1 || 1, 5), LM = 52, gap = 14, pw = (w - LM - 12 - gap * (per - 1)) / per;
    cv._csv = () => { const out = [['panel', 'series', 'depth (cm)', 'value', 'low', 'high']]; panels.forEach(p => p.series.forEach(s => s.z.forEach((z, i) => out.push([p.title || '', s.name || '', z, s.v[i], s.lo ? s.lo[i] : '', s.hi ? s.hi[i] : ''])))); return out; };
    panels.forEach((p, k) => { const col = k % per, row = Math.floor(k / per), px = LM + col * (pw + gap), py = F.top + 6 + row * (PH + 46), top = py + 22, ph = PH - 22, X = v => px + (v - nv.lo) / (nv.hi - nv.lo) * pw, Y = z => top + Math.abs(z) / nz.hi * ph;
      strip(g, px, py, pw, p.title || ''); g.fillStyle = '#fff'; g.fillRect(px, top, pw, ph); g.font = '11px ' + FONT;
      nz.t.forEach(t => { const yy = Y(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(px, yy + 0.5); g.lineTo(px + pw, yy + 0.5); g.stroke(); if (col === 0) { g.fillStyle = AXIS; g.textAlign = 'right'; g.fillText(fmt(t, 0), px - 5, yy + 4); } });
      nv.t.forEach(t => { const xx = X(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(xx + 0.5, top); g.lineTo(xx + 0.5, top + ph); g.stroke(); g.fillStyle = AXIS; g.textAlign = 'center'; g.fillText(fmt(t, dec(nv.st)), xx, top + ph + 14); });
      g.save(); g.beginPath(); g.rect(px, top, pw, ph); g.clip();
      p.series.forEach(s => { if (s.lo && s.hi) { g.fillStyle = hexA(s.color, 0.15); g.beginPath(); s.z.forEach((z, i) => i ? g.lineTo(X(s.hi[i]), Y(z)) : g.moveTo(X(s.hi[i]), Y(z))); for (let i = s.z.length - 1; i >= 0; i--) g.lineTo(X(s.lo[i]), Y(s.z[i])); g.closePath(); g.fill(); }
        g.strokeStyle = s.color; g.lineWidth = 1.7; g.beginPath(); s.z.forEach((z, i) => i ? g.lineTo(X(s.v[i]), Y(z)) : g.moveTo(X(s.v[i]), Y(z))); g.stroke(); g.lineWidth = 1; s.z.forEach((z, i) => { if (!isFinite(s.v[i])) return; g.beginPath(); g.arc(X(s.v[i]), Y(z), 2.8, 0, 7); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = s.color; g.stroke(); }); });
      g.restore(); g.strokeStyle = '#333'; g.strokeRect(px + 0.5, top + 0.5, pw - 1, ph - 1); });
    yTitle(g, 'Depth (cm)', 13, F.top + 28, nr * (PH + 46) - 46); g.fillStyle = INK; g.font = '12px ' + FONT; g.textAlign = 'center'; if (o.xt) g.fillText(o.xt, LM + (w - LM - 12) / 2, F.top + 6 + nr * (PH + 46) + 2);
    if (items.length > 1) legend(g, items, w, F.top + 6 + nr * (PH + 46) + 22, {});
  }
  /* ---------------------------------------------------------------- more figures of scientific papers (box, violin, histogram, scatter with fit,
     anomaly bars, calendar heat map, stacked areas); each one: frame, nice axes, legend, numbers behind it as CSV (cv._csv) */
  const q_ = (s, p) => { if (!s.length) return NaN; const k = (s.length - 1) * p, i = Math.floor(k); return i + 1 < s.length ? s[i] + (s[i + 1] - s[i]) * (k - i) : s[i]; };
  const axisY = (g, nn, L, T, pw, ph, Y) => { g.font = '11px ' + FONT; g.textAlign = 'right'; nn.t.forEach(t => { const yy = Y(t); g.strokeStyle = GRID; g.beginPath(); g.moveTo(L, yy + 0.5); g.lineTo(L + pw, yy + 0.5); g.stroke(); g.fillStyle = AXIS; g.fillText(fmt(t, dec(nn.st)), L - 6, yy + 4); }); };
  const boxFrame = (g, L, T, pw, ph) => { g.strokeStyle = '#333'; g.lineWidth = 1; g.strokeRect(L + 0.5, T + 0.5, pw - 1, ph - 1); };
  // groups [{name, v:[...], color}]; o.violin draws the density shape, o.yt, o.xt
  function boxes(cv, groups, o) {
    o = o || {}; groups = groups.filter(gr => gr.v && gr.v.some(isFinite)); const F = frame(cv, o, 340), { g, w, h } = F; if (!groups.length) return;
    const all = []; groups.forEach(gr => { gr.s = gr.v.filter(isFinite).sort((a, b) => a - b); gr.s.forEach(x => all.push(x)); });
    const nn = nice(Math.min.apply(null, all), Math.max.apply(null, all), 5); g.font = '11px ' + FONT;
    const L = Math.round(measureW(g, nn.t.map(t => fmt(t, dec(nn.st)))) + 46), T = F.top + 8, B = 58, pw = w - L - 16, ph = h - T - B, Y = v => T + ph - (v - nn.lo) / (nn.hi - nn.lo) * ph, cw = pw / groups.length;
    cv._csv = () => [['group', 'n', 'minimum', '5 %', '25 %', 'median', 'mean', '75 %', '95 %', 'maximum']].concat(groups.map(gr => [gr.name, gr.s.length, gr.s[0], q_(gr.s, .05), q_(gr.s, .25), q_(gr.s, .5), gr.s.reduce((a, b) => a + b, 0) / gr.s.length, q_(gr.s, .75), q_(gr.s, .95), gr.s[gr.s.length - 1]]));
    axisY(g, nn, L, T, pw, ph, Y);
    groups.forEach((gr, i) => { const c = gr.color || OKI[i % OKI.length], cx = L + (i + 0.5) * cw, bw = Math.min(46, cw * 0.42), s = gr.s, a = q_(s, .25), m = q_(s, .5), b = q_(s, .75), lo = q_(s, .05), hi = q_(s, .95), mean = s.reduce((x, y) => x + y, 0) / s.length;
      if (o.violin && s.length > 4) { const sd = Math.sqrt(s.reduce((x, y) => x + (y - mean) * (y - mean), 0) / (s.length - 1)) || 1, bwk = 1.06 * sd * Math.pow(s.length, -0.2), ys = [], N = 60, step = Math.max(1, Math.floor(s.length / 400)); let mx = 0;
        for (let k = 0; k <= N; k++) { const y = s[0] + (s[s.length - 1] - s[0]) * k / N; let d = 0; for (let j = 0; j < s.length; j += step) { const z = (y - s[j]) / bwk; d += Math.exp(-0.5 * z * z); } ys.push([y, d]); mx = Math.max(mx, d); }
        g.fillStyle = hexA(c, 0.28); g.strokeStyle = c; g.beginPath(); ys.forEach(([y, d], k) => { const xx = cx + d / mx * cw * 0.42; k ? g.lineTo(xx, Y(y)) : g.moveTo(xx, Y(y)); }); for (let k = ys.length - 1; k >= 0; k--) g.lineTo(cx - ys[k][1] / mx * cw * 0.42, Y(ys[k][0])); g.closePath(); g.fill(); g.stroke(); }
      const bw2 = o.violin ? Math.min(14, bw * 0.4) : bw; g.strokeStyle = '#333'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, Y(lo)); g.lineTo(cx, Y(a)); g.moveTo(cx, Y(b)); g.lineTo(cx, Y(hi)); g.moveTo(cx - bw2 / 3, Y(lo)); g.lineTo(cx + bw2 / 3, Y(lo)); g.moveTo(cx - bw2 / 3, Y(hi)); g.lineTo(cx + bw2 / 3, Y(hi)); g.stroke();
      g.fillStyle = o.violin ? '#fff' : hexA(c, 0.55); g.fillRect(cx - bw2 / 2, Y(b), bw2, Y(a) - Y(b)); g.strokeRect(cx - bw2 / 2 + 0.5, Y(b) + 0.5, bw2 - 1, Y(a) - Y(b)); g.lineWidth = 2.2; g.strokeStyle = o.violin ? c : '#111'; g.beginPath(); g.moveTo(cx - bw2 / 2, Y(m)); g.lineTo(cx + bw2 / 2, Y(m)); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.beginPath(); g.arc(cx, Y(mean), 3, 0, 7); g.fill(); g.stroke();
      g.fillStyle = INK; g.textAlign = 'center'; g.font = '11px ' + FONT; g.fillText(fitT(g, gr.name, cw - 4), cx, T + ph + 16); g.fillStyle = '#777'; g.font = '10px ' + FONT; g.fillText('n = ' + s.length, cx, T + ph + 30); });
    boxFrame(g, L, T, pw, ph); yTitle(g, o.yt, 14, T, ph); g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText(o.foot || ('Box: 25 to 75 %, line: median, dot: mean, whiskers: 5 to 95 %' + (o.violin ? '; shape: the density of the values' : '') + '.'), 8, h - 8);
  }
  // series [{name, v:[...], color}]: shared bins, bars half transparent, the density as a line
  function hist(cv, series, o) {
    o = o || {}; series = series.filter(s => s.v && s.v.some(isFinite)); const F = frame(cv, o, 320), { g, w, h } = F; if (!series.length) return; const all = []; series.forEach(s => { s.s = s.v.filter(isFinite); s.s.forEach(x => all.push(x)); });
    const lo = Math.min.apply(null, all), hi = Math.max.apply(null, all) + 1e-12, nb = Math.max(8, Math.min(40, Math.round(Math.sqrt(all.length / series.length) * 1.5))), bwid = (hi - lo) / nb;
    series.forEach(s => { s.c = new Array(nb).fill(0); s.s.forEach(x => { s.c[Math.min(nb - 1, Math.floor((x - lo) / bwid))]++; }); s.f = s.c.map(c => 100 * c / s.s.length); });
    const ymax = Math.max.apply(null, series.map(s => Math.max.apply(null, s.f))), ny = nice(0, ymax * 1.08, 5), nx = nice(lo, hi, 6); g.font = '11px ' + FONT;
    const L = Math.round(measureW(g, ny.t.map(t => fmt(t, dec(ny.st)))) + 46), items = series.map((s, k) => ({ name: s.name, color: s.color || OKI[k % OKI.length], kind: 'box' })), lh = series.length > 1 ? legend(g, items, w, 0, o, true) : 0, T = F.top + 8, B = 46 + lh, pw = w - L - 16, ph = h - T - B, X = v => L + (v - nx.lo) / (nx.hi - nx.lo) * pw, Y = v => T + ph - v / ny.hi * ph;
    cv._csv = () => [['bin from', 'bin to'].concat(series.map(s => s.name + ' (% of values)'))].concat(Array.from({ length: nb }, (_, i) => [lo + i * bwid, lo + (i + 1) * bwid].concat(series.map(s => s.f[i]))));
    axisY(g, ny, L, T, pw, ph, Y); g.textAlign = 'center'; nx.t.forEach(t => { if (t < nx.lo - 1e-9 || t > nx.hi + 1e-9) return; g.fillStyle = AXIS; g.fillText(fmt(t, dec(nx.st)), X(t), T + ph + 15); });
    series.forEach((s, k) => { const c = s.color || OKI[k % OKI.length]; g.fillStyle = hexA(c, series.length > 1 ? 0.4 : 0.6); g.strokeStyle = c; s.f.forEach((f, i) => { const x0 = X(lo + i * bwid), x1 = X(lo + (i + 1) * bwid); g.fillRect(x0 + 0.5, Y(f), Math.max(1, x1 - x0 - 1), Y(0) - Y(f)); });
      const mean = s.s.reduce((a, b) => a + b, 0) / s.s.length, sd = Math.sqrt(s.s.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, s.s.length - 1)) || bwid, bk = 1.06 * sd * Math.pow(s.s.length, -0.2), step = Math.max(1, Math.floor(s.s.length / 500));
      g.lineWidth = 2; g.beginPath(); for (let k2 = 0; k2 <= 120; k2++) { const x = lo + (hi - lo) * k2 / 120; let d = 0, n = 0; for (let j = 0; j < s.s.length; j += step) { const z = (x - s.s[j]) / bk; d += Math.exp(-0.5 * z * z); n++; } const pct = d / n / (bk * Math.sqrt(2 * Math.PI)) * bwid * 100; k2 ? g.lineTo(X(x), Y(pct)) : g.moveTo(X(x), Y(pct)); } g.stroke(); g.lineWidth = 1;
      g.setLineDash([4, 3]); g.beginPath(); g.moveTo(X(mean), T); g.lineTo(X(mean), T + ph); g.stroke(); g.setLineDash([]); });
    boxFrame(g, L, T, pw, ph); yTitle(g, 'Share of the values (%)', 14, T, ph); g.fillStyle = INK; g.textAlign = 'center'; g.font = '12px ' + FONT; if (o.xt) g.fillText(o.xt, L + pw / 2, T + ph + 32); if (series.length > 1) legend(g, items, w, T + ph + 50, o);
  }
  // x[], y[]: points, the least-squares line with its equation, R2, RMSE and n; o.oneToOne draws the 1:1 line
  function scatfit(cv, x, y, o) {
    o = o || {}; const P = []; x.forEach((v, i) => { if (isFinite(v) && isFinite(y[i])) P.push([v, y[i]]); }); const F = frame(cv, o, 380), { g, w, h } = F; if (P.length < 2) return;
    const n = P.length, mx = P.reduce((a, p) => a + p[0], 0) / n, my = P.reduce((a, p) => a + p[1], 0) / n, sxx = P.reduce((a, p) => a + (p[0] - mx) * (p[0] - mx), 0), sxy = P.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0), syy = P.reduce((a, p) => a + (p[1] - my) * (p[1] - my), 0), b = sxx ? sxy / sxx : 0, a0 = my - b * mx, r2 = sxx && syy ? sxy * sxy / (sxx * syy) : NaN, rmse = Math.sqrt(P.reduce((s, p) => s + Math.pow(p[1] - (a0 + b * p[0]), 2), 0) / n);
    let xs = P.map(p => p[0]), ys = P.map(p => p[1]), xl = Math.min.apply(null, xs), xh = Math.max.apply(null, xs), yl = Math.min.apply(null, ys), yh = Math.max.apply(null, ys); if (o.oneToOne) { xl = yl = Math.min(xl, yl); xh = yh = Math.max(xh, yh); }
    const nx = nice(xl, xh, 6), ny = nice(yl, yh, 6); g.font = '11px ' + FONT; const L = Math.round(measureW(g, ny.t.map(t => fmt(t, dec(ny.st)))) + 46), T = F.top + 8, B = 48, pw = w - L - 16, ph = h - T - B, X = v => L + (v - nx.lo) / (nx.hi - nx.lo) * pw, Y = v => T + ph - (v - ny.lo) / (ny.hi - ny.lo) * ph;
    cv._csv = () => [[o.xt || 'x', o.yt || 'y']].concat(P); axisY(g, ny, L, T, pw, ph, Y); g.textAlign = 'center'; nx.t.forEach(t => { g.strokeStyle = GRID; g.beginPath(); g.moveTo(X(t) + 0.5, T); g.lineTo(X(t) + 0.5, T + ph); g.stroke(); g.fillStyle = AXIS; g.fillText(fmt(t, dec(nx.st)), X(t), T + ph + 15); });
    g.save(); g.beginPath(); g.rect(L, T, pw, ph); g.clip(); const step = Math.max(1, Math.floor(n / 4000)); g.fillStyle = hexA(o.color || OKI[0], n > 800 ? 0.35 : 0.7); for (let i = 0; i < n; i += step) { g.beginPath(); g.arc(X(P[i][0]), Y(P[i][1]), n > 800 ? 2 : 3.2, 0, 7); g.fill(); }
    if (o.oneToOne) { g.strokeStyle = '#777'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(X(nx.lo), Y(nx.lo)); g.lineTo(X(nx.hi), Y(nx.hi)); g.stroke(); g.setLineDash([]); }
    g.strokeStyle = '#D55E00'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(nx.lo), Y(a0 + b * nx.lo)); g.lineTo(X(nx.hi), Y(a0 + b * nx.hi)); g.stroke(); g.lineWidth = 1; g.restore();
    const lines = ['y = ' + fmt(a0, 3) + (b >= 0 ? ' + ' : ' − ') + fmt(Math.abs(b), 3) + ' x', 'R² = ' + (isFinite(r2) ? r2.toFixed(3) : 'n/a') + '   RMSE = ' + fmt(rmse, 3) + '   n = ' + n]; g.font = '12px ' + FONT; const tw = Math.max.apply(null, lines.map(t => g.measureText(t).width)) + 16;
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(L + 8, T + 8, tw, 40); g.strokeStyle = '#bbb'; g.strokeRect(L + 8.5, T + 8.5, tw, 40); g.fillStyle = INK; g.textAlign = 'left'; lines.forEach((t, i) => g.fillText(t, L + 16, T + 24 + i * 16));
    boxFrame(g, L, T, pw, ph); yTitle(g, o.yt, 14, T, ph); g.fillStyle = INK; g.textAlign = 'center'; if (o.xt) g.fillText(o.xt, L + pw / 2, T + ph + 34);
    g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText('Red: the least-squares line' + (o.oneToOne ? '; dashed: the 1:1 line' : '') + '.', 8, h - 6);
  }
  // labels[], v[]: bars above (blue) and below (red) the mean of all values, which is the zero line
  function anomaly(cv, labels, v, o) {
    o = o || {}; const F = frame(cv, o, 320), { g, w, h } = F, f = v.filter(isFinite); if (!f.length) return; const m = f.reduce((a, b) => a + b, 0) / f.length, d = v.map(x => isFinite(x) ? x - m : NaN), dd = d.filter(isFinite), lim = Math.max.apply(null, dd.map(Math.abs)) || 1, ny = nice(-lim, lim, 6);
    g.font = '11px ' + FONT; const L = Math.round(measureW(g, ny.t.map(t => fmt(t, dec(ny.st)))) + 46), T = F.top + 8, B = 50, pw = w - L - 16, ph = h - T - B, Y = q => T + ph - (q - ny.lo) / (ny.hi - ny.lo) * ph, bw = pw / v.length;
    cv._csv = () => [['period', 'value', 'difference from the mean (' + fmt(m, 3) + ')']].concat(labels.map((l, i) => [l, v[i], d[i]])); axisY(g, ny, L, T, pw, ph, Y);
    d.forEach((x, i) => { if (!isFinite(x)) return; g.fillStyle = x >= 0 ? '#2166AC' : '#B2182B'; const y0 = Y(0), y1 = Y(x); g.fillRect(L + i * bw + bw * 0.12, Math.min(y0, y1), Math.max(1, bw * 0.76), Math.abs(y1 - y0)); });
    g.strokeStyle = '#111'; g.beginPath(); g.moveTo(L, Y(0) + 0.5); g.lineTo(L + pw, Y(0) + 0.5); g.stroke();
    const every = Math.max(1, Math.ceil(labels.length * 46 / pw)); g.fillStyle = AXIS; g.textAlign = 'center'; labels.forEach((l, i) => { if (i % every === 0) g.fillText(String(l), L + (i + 0.5) * bw, T + ph + 15); });
    boxFrame(g, L, T, pw, ph); yTitle(g, o.yt, 14, T, ph); g.fillStyle = INK; g.font = '12px ' + FONT; if (o.xt) g.fillText(o.xt, L + pw / 2, T + ph + 32); g.fillStyle = '#555'; g.font = '11px ' + FONT; g.textAlign = 'left'; g.fillText('Blue: above the mean of all ' + (o.unitName || 'periods') + ' (' + fmt(m, 3) + '), red: below it.', 8, h - 6);
  }
  // years[], M[year index][day of year 0..365]: one row per year, one column per day, the colour is the value
  function calendar(cv, years, M, o) {
    o = o || {}; const F = frame(cv, Object.assign({}, o, { h: o.h || Math.max(260, F0(years.length)) }), 300), { g, w, h, r } = F; function F0(n) { return 90 + n * 16 + 50; } let lo = Infinity, hi = -Infinity; M.forEach(row => row.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } })); if (!isFinite(lo)) return;
    const nn = nice(lo, hi > lo ? hi : lo + 1, 5), L = 52, R = 92, T = F.top + 8, B = 40, pw = w - L - R, ph = h - T - B, rh = ph / years.length, cwid = pw / 366, LU = lut(o.pal || 'viridis');
    cv._csv = () => [['year'].concat(Array.from({ length: 366 }, (_, i) => 'day ' + (i + 1)))].concat(years.map((y, k) => [y].concat(M[k])));
    years.forEach((y, k) => { M[k].forEach((v, d) => { if (!isFinite(v)) return; g.fillStyle = rgb(LU, (v - nn.lo) / (nn.hi - nn.lo)); g.fillRect(L + d * cwid, T + k * rh, Math.ceil(cwid) + 0.5, Math.ceil(rh)); }); g.fillStyle = AXIS; g.textAlign = 'right'; g.font = '11px ' + FONT; if (years.length < 30 || k % Math.ceil(years.length / 25) === 0) g.fillText(String(y), L - 6, T + (k + 0.5) * rh + 4); });
    const md = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; g.textAlign = 'center'; md.forEach((d, k) => { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.moveTo(L + d * cwid + 0.5, T); g.lineTo(L + d * cwid + 0.5, T + ph); g.stroke(); g.fillStyle = AXIS; g.fillText(MON[k], L + (d + 15) * cwid, T + ph + 15); });
    boxFrame(g, L, T, pw, ph); colourbar(g, L + pw + 14, T, 14, ph, { title: o.unit || '', lo: nn.lo, hi: nn.hi, pal: o.pal || 'viridis', ticks: nn.t.map(t => ({ v: t, label: fmt(t, dec(nn.st)) })) });
  }
  // x[] (time), series [{name, y[], color}]: areas stacked from the first series up
  function stack(cv, x, series, o) {
    o = o || {}; const F = frame(cv, o, 330), { g, w, h } = F; if (!x.length || !series.length) return; const cum = x.map(() => 0), tops = series.map(s => x.map((_, i) => (cum[i] += Math.max(0, isFinite(s.y[i]) ? s.y[i] : 0)))), ny = nice(0, Math.max.apply(null, cum) || 1, 5);
    g.font = '11px ' + FONT; const items = series.map((s, k) => ({ name: s.name, color: s.color || OKI[k % OKI.length], kind: 'box' })), lh = legend(g, items, w, 0, o, true), L = Math.round(measureW(g, ny.t.map(t => fmt(t, dec(ny.st)))) + 46), T = F.top + 8, B = 46 + lh, pw = w - L - 16, ph = h - T - B, x0 = x[0], x1 = x[x.length - 1] > x0 ? x[x.length - 1] : x0 + 1, X = v => L + (v - x0) / (x1 - x0) * pw, Y = v => T + ph - v / ny.hi * ph;
    cv._csv = () => [['date'].concat(series.map(s => s.name))].concat(x.map((t, i) => [o.time ? new Date(t).toISOString().slice(0, 10) : t].concat(series.map(s => s.y[i])))); axisY(g, ny, L, T, pw, ph, Y);
    for (let k = series.length - 1; k >= 0; k--) { g.fillStyle = hexA(items[k].color, 0.85); g.beginPath(); x.forEach((t, i) => i ? g.lineTo(X(t), Y(tops[k][i])) : g.moveTo(X(t), Y(tops[k][i]))); for (let i = x.length - 1; i >= 0; i--) g.lineTo(X(x[i]), Y(k ? tops[k - 1][i] : 0)); g.closePath(); g.fill(); }
    g.fillStyle = AXIS; g.textAlign = 'center'; (o.time ? timeTicks(x0, x1, pw) : nice(x0, x1, 6).t.map(t => ({ t, lab: fmt(t) }))).forEach(k => { if (k.t >= x0 && k.t <= x1) g.fillText(k.lab, X(k.t), T + ph + 15); });
    boxFrame(g, L, T, pw, ph); yTitle(g, o.yt, 14, T, ph); g.fillStyle = INK; g.font = '12px ' + FONT; if (o.xt) g.fillText(o.xt, L + pw / 2, T + ph + 32); legend(g, items, w, T + ph + 50, o);
  }
  const API = { boxes, hist, scatfit, anomaly, calendar, stack, ribbons, profiles, hexA, dotrows, facets, runStacks, line, surface, colourbar, ramp: (name, t) => rgb(lut(name), t), heat, hbars, matrix, groupBars, stackBars, nice, fmt, OKI, PAL, frame, legend, exportScale: 1 };
  return API;
})();
