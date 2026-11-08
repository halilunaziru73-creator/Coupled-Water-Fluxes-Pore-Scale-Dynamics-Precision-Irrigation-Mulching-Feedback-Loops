/* CAD tools for the field sketch: draw (line, polyline, rectangle, circle, arc, text, dimension), modify (move, copy, rotate,
   mirror, scale, offset, trim, corner, explode, array, erase), object snaps (end, middle, centre, intersection, nearest, grid),
   ortho and polar tracking, layers, a command line (type a length, length<angle, @dx,dy, or a command such as L, PL, REC, C, M, CO),
   grips to drag the points of a selected object, DXF save and open, and "use as": a drawn shape becomes the field, an area to
   irrigate, a no-irrigation zone, a greenhouse, a bed or a pipe of the design. Units are metres; the drawing is kept with the sketch. */
'use strict';
const SketchCAD = (() => {
  let A = null, host = null, keys = false;
  const TAU = Math.PI * 2, D = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const C = {
    tool: 'sel', st: {}, sel: new Set(), snap: { end: 1, int: 1, mid: 1, cen: 1, near: 1, grid: 1 }, ortho: 0, polar: 0, layer: '0', cur: null, offD: 2,
    win: null, drag: null, meas: null, msg: '', shift: false,
    layers: [{ n: '0', c: '#1B1F23', on: 1 }, { n: 'Pipes', c: '#1565C0', on: 1 }, { n: 'Dimensions', c: '#C62828', on: 1 }, { n: 'Text', c: '#6A1B9A', on: 1 }, { n: 'Construction', c: '#8A8F98', on: 1, dash: 1 }]
  };
  const M = v => A.m(v), P = v => A.px(v), z1 = () => 1 / A.V.z;
  const f = (v, d) => (+v).toFixed(d == null ? 2 : d).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const cad = () => (A.S.cad = A.S.cad || []);
  const lay = n => C.layers.find(l => l.n === n) || C.layers[0];
  const vis = e => lay(e.l).on;
  const clone = o => JSON.parse(JSON.stringify(o));

  // ------------------------------------------------------------------ geometry
  const arcInfo = e => {
    const a = e.a, b = e.b, c = e.c, d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)); if (Math.abs(d) < 1e-9) return null;
    const A2 = a.x * a.x + a.y * a.y, B2 = b.x * b.x + b.y * b.y, C2 = c.x * c.x + c.y * c.y,
      x = (A2 * (b.y - c.y) + B2 * (c.y - a.y) + C2 * (a.y - b.y)) / d, y = (A2 * (c.x - b.x) + B2 * (a.x - c.x) + C2 * (b.x - a.x)) / d,
      a0 = Math.atan2(a.y - y, a.x - x), a1 = Math.atan2(b.y - y, b.x - x), a2 = Math.atan2(c.y - y, c.x - x), nz = v => ((v % TAU) + TAU) % TAU, d1 = nz(a1 - a0), d2 = nz(a2 - a0), inc = d1 < d2;
    return { x, y, r: Math.hypot(a.x - x, a.y - y), a0, a2, inc, sw: inc ? d2 : d2 - TAU };
  };
  const arcPts = (e, n) => { const i = arcInfo(e); if (!i) return [e.a, e.b, e.c]; const o = []; for (let k = 0; k <= n; k++) { const t = i.a0 + i.sw * k / n; o.push({ x: i.x + i.r * Math.cos(t), y: i.y + i.r * Math.sin(t) }); } return o; };
  const circPts = (c, r, n) => { const o = []; for (let k = 0; k <= n; k++) o.push({ x: c.x + r * Math.cos(TAU * k / n), y: c.y + r * Math.sin(TAU * k / n) }); return o; };
  const txtBox = e => { const w = String(e.s).length * e.h * 0.58, p = e.p; return [{ x: p.x, y: p.y - e.h }, { x: p.x + w, y: p.y - e.h }, { x: p.x + w, y: p.y }, { x: p.x, y: p.y }, { x: p.x, y: p.y - e.h }]; };
  const poly = e => e.k === 'line' ? [e.a, e.b] : e.k === 'pl' ? (e.closed ? e.pts.concat([e.pts[0]]) : e.pts) : e.k === 'rect' ? [e.a, { x: e.b.x, y: e.a.y }, e.b, { x: e.a.x, y: e.b.y }, e.a] :
    e.k === 'circ' ? circPts(e.c, e.r, 48) : e.k === 'arc' ? arcPts(e, 32) : e.k === 'dim' ? dimPoly(e) : e.k === 'txt' ? txtBox(e) : [];
  const dimGeo = e => { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, off = e.o ? (e.o.x - e.a.x) * nx + (e.o.y - e.a.y) * ny : 12 / A.V.z; return { L, ux, uy, nx, ny, off, a2: { x: e.a.x + nx * off, y: e.a.y + ny * off }, b2: { x: e.b.x + nx * off, y: e.b.y + ny * off } }; };
  const dimPoly = e => { const g = dimGeo(e); return [e.a, g.a2, g.b2, e.b]; };
  const segs = e => { const p = poly(e), o = []; if (e.k === 'txt') return o; for (let i = 1; i < p.length; i++) o.push([p[i - 1], p[i]]); return o; };
  const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)); return { d: Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy), t, x: a.x + t * dx, y: a.y + t * dy }; };
  const segInt = (a, b, c, d) => { const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: d.x - c.x, y: d.y - c.y }, den = r.x * s.y - r.y * s.x; if (Math.abs(den) < 1e-9) return null; const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den, u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den; return { x: a.x + t * r.x, y: a.y + t * r.y, t, u }; };
  const bbox = e => { const p = poly(e); let x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18; p.forEach(q => { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }); return { x0, y0, x1, y1 }; };
  const distTo = (e, p) => { if (e.k === 'txt') { const b = bbox(e); return p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1 ? 0 : 1e9; } let d = 1e18; segs(e).forEach(s => { d = Math.min(d, segDist(p, s[0], s[1]).d); }); return d; };
  function pick(p) { const r = 7 * z1(); let best = -1, bd = r; const L = cad(); for (let i = L.length - 1; i >= 0; i--) { if (!vis(L[i])) continue; const d = distTo(L[i], p); if (d < bd) { bd = d; best = i; } } return best; }

  // a copy of an object with every point moved by fn (sc: scale factor for radii and text height)
  const mapE = (e, fn, sc, keep) => {
    const n = clone(e);
    if (n.k === 'line' || n.k === 'dim') { n.a = fn(e.a); n.b = fn(e.b); if (e.o) n.o = fn(e.o); }
    else if (n.k === 'pl') n.pts = e.pts.map(fn);
    else if (n.k === 'rect') { if (sc || keep) { n.a = fn(e.a); n.b = fn(e.b); } else { n.k = 'pl'; n.closed = true; n.pts = poly(e).slice(0, 4).map(fn); delete n.a; delete n.b; } }
    else if (n.k === 'circ') { n.c = fn(e.c); if (sc) n.r = e.r * sc; }
    else if (n.k === 'arc') { n.a = fn(e.a); n.b = fn(e.b); n.c = fn(e.c); }
    else if (n.k === 'txt') { n.p = fn(e.p); if (sc) n.h = e.h * sc; }
    return n;
  };
  const gripsOf = e => {
    const g = (p, set) => ({ p, set });
    if (e.k === 'line' || e.k === 'dim') { const o = [g(e.a, q => { e.a = q; }), g(e.b, q => { e.b = q; })]; if (e.k === 'dim') { const d = dimGeo(e); o.push(g({ x: (d.a2.x + d.b2.x) / 2, y: (d.a2.y + d.b2.y) / 2 }, q => { e.o = q; })); } return o; }
    if (e.k === 'pl') return e.pts.map((p, i) => g(p, q => { e.pts[i] = q; }));
    if (e.k === 'rect') return [g(e.a, q => { e.a = q; }), g(e.b, q => { e.b = q; }), g({ x: e.b.x, y: e.a.y }, q => { e.b.x = q.x; e.a.y = q.y; }), g({ x: e.a.x, y: e.b.y }, q => { e.a.x = q.x; e.b.y = q.y; })];
    if (e.k === 'circ') return [g(e.c, q => { e.c = q; }), g({ x: e.c.x + e.r, y: e.c.y }, q => { e.r = Math.max(1, D(e.c, q)); })];
    if (e.k === 'arc') return [g(e.a, q => { e.a = q; }), g(e.b, q => { e.b = q; }), g(e.c, q => { e.c = q; })];
    if (e.k === 'txt') return [g(e.p, q => { e.p = q; })];
    return [];
  };

  // ------------------------------------------------------------------ snapping
  function nearSegs(p, r) { const o = []; cad().forEach(e => { if (!vis(e)) return; segs(e).forEach(s => { const x0 = Math.min(s[0].x, s[1].x) - r, x1 = Math.max(s[0].x, s[1].x) + r, y0 = Math.min(s[0].y, s[1].y) - r, y1 = Math.max(s[0].y, s[1].y) + r; if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) o.push(s); }); }); return o; }
  function cands(p, r) {
    const out = { end: [], mid: [], cen: [], int: [], near: [] }, add = (k, q) => { if (Math.abs(q.x - p.x) < r && Math.abs(q.y - p.y) < r) out[k].push(q); }, S = A.S;
    S.pts.forEach(q => add('end', q)); if (S.src) add('end', S.src); S.objs.forEach(o => (o.pts || []).forEach(q => add('end', q)));
    cad().forEach(e => {
      if (!vis(e)) return;
      if (e.k === 'line' || e.k === 'dim') { add('end', e.a); add('end', e.b); add('mid', { x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 }); }
      else if (e.k === 'pl') { e.pts.forEach((q, i) => { add('end', q); const n = e.pts[i + 1] || (e.closed ? e.pts[0] : null); if (n) add('mid', { x: (q.x + n.x) / 2, y: (q.y + n.y) / 2 }); }); }
      else if (e.k === 'rect') { const c4 = poly(e); for (let i = 0; i < 4; i++) { add('end', c4[i]); add('mid', { x: (c4[i].x + c4[i + 1].x) / 2, y: (c4[i].y + c4[i + 1].y) / 2 }); } add('cen', { x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2 }); }
      else if (e.k === 'circ') { add('cen', e.c); add('end', { x: e.c.x + e.r, y: e.c.y }); add('end', { x: e.c.x - e.r, y: e.c.y }); add('end', { x: e.c.x, y: e.c.y + e.r }); add('end', { x: e.c.x, y: e.c.y - e.r }); }
      else if (e.k === 'arc') { add('end', e.a); add('end', e.c); const i = arcInfo(e); if (i) add('cen', i); }
      else if (e.k === 'txt') add('end', e.p);
    });
    const ns = nearSegs(p, r * 2).slice(0, 40); for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const q = segInt(ns[i][0], ns[i][1], ns[j][0], ns[j][1]); if (q && q.t >= 0 && q.t <= 1 && q.u >= 0 && q.u <= 1) add('int', q); }
    return out;
  }
  function track(p, ev) {
    const r = 10 * z1(), gs = A.GRID / 4; C.shift = !!(ev && ev.shiftKey); let best = null;
    if (C.win) C.win.b = p;
    const cs = cands(p, r);
    for (const k of ['end', 'int', 'mid', 'cen']) { if (!C.snap[k]) continue; let bd = r; cs[k].forEach(c => { const d = D(c, p); if (d <= bd) { bd = d; best = { x: c.x, y: c.y, t: k }; } }); if (best) break; }
    if (!best && C.snap.near) { let bd = r, bq = null; nearSegs(p, r).forEach(s => { const q = segDist(p, s[0], s[1]); if (q.d < bd) { bd = q.d; bq = { x: q.x, y: q.y, t: 'near' }; } }); if (bq) best = bq; }
    let q = best || (C.snap.grid ? { x: Math.round(p.x / gs) * gs, y: Math.round(p.y / gs) * gs, t: 'grid' } : { x: p.x, y: p.y, t: null });
    const base = C.st && C.st.base;
    if (!best && base) {
      if (C.ortho || C.shift) { if (Math.abs(p.x - base.x) >= Math.abs(p.y - base.y)) q = { x: q.x, y: base.y, t: 'ortho' }; else q = { x: base.x, y: q.y, t: 'ortho' }; }
      else if (C.polar) { const dx = p.x - base.x, dy = p.y - base.y, ang = Math.atan2(-dy, dx) * 180 / Math.PI, k = Math.round(ang / 15) * 15; if (Math.abs(ang - k) < 4 && D(base, p) > 6) { const d = Math.round(D(base, p) / gs) * gs, a = k * Math.PI / 180; q = { x: base.x + d * Math.cos(a), y: base.y - d * Math.sin(a), t: 'polar', ang: k }; } }
    }
    C.cur = q;
    if (C.drag) { const d = C.drag; d.moved = true; d.g.set({ x: q.x, y: q.y }); }
    const el = document.getElementById('skCadXY'); if (el) el.textContent = 'X ' + f(M(q.x), 2) + ' m   Y ' + f(-M(q.y), 2) + ' m' + (q.t && q.t !== 'grid' ? '   (' + ({ end: 'endpoint', mid: 'midpoint', cen: 'centre', int: 'intersection', near: 'nearest', ortho: 'ortho', polar: 'polar ' + q.ang + '°' }[q.t] || q.t) + ')' : '');
    return q;
  }

  // ------------------------------------------------------------------ typed input
  function parsePt(s, base, rel) {
    s = String(s).trim(); let r;
    if ((r = s.match(/^@?\s*(-?[\d.]+)\s*<\s*(-?[\d.]+)$/)) && base) { const d = P(+r[1]), a = +r[2] * Math.PI / 180; return { x: base.x + d * Math.cos(a), y: base.y - d * Math.sin(a) }; }
    if ((r = s.match(/^(@?)\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)$/))) { if ((r[1] || rel) && base) return { x: base.x + P(+r[2]), y: base.y - P(+r[3]) }; if (!rel) return { x: P(+r[2]), y: -P(+r[3]) }; }
    if ((r = s.match(/^(-?[\d.]+)$/)) && base && C.cur) { const d = P(+r[1]), L = D(base, C.cur) || 1; return { x: base.x + (C.cur.x - base.x) / L * d, y: base.y + (C.cur.y - base.y) / L * d }; }
    return null;
  }
  const put = e => { A.pushH(); e.l = e.k === 'dim' ? 'Dimensions' : e.k === 'txt' ? 'Text' : C.layer; cad().push(e); };
  const msg = t => { C.msg = t || ''; status(); };
  const MODS = { move: 1, copy: 1, rotate: 1, mirror: 1, scale: 1, array: 1, erase: 1 };
  const same = (a, b) => a && b && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
  function eachSel(fn) { const L = cad(); C.sel.forEach(e => { const i = L.indexOf(e); if (i >= 0) fn(e, i, L); }); }
  function replaceSel(map) { A.pushH(); const L = cad(), ns = new Set(); L.forEach((e, i) => { if (C.sel.has(e)) { const n = map(e); L[i] = n; ns.add(n); } }); C.sel = ns; }
  function copySel(map) { A.pushH(); const L = cad(), ns = []; [...C.sel].forEach(e => { const n = map(e); L.push(n); ns.push(n); }); return ns; }
  const ghost = (c, fn, sc) => { c.save(); c.globalAlpha = 0.45; [...C.sel].forEach(e => { const n = mapE(e, fn, sc, 1); c.strokeStyle = '#1E6FE0'; c.lineWidth = 1.4 * z1(); if (n.k === 'txt') { c.fillStyle = '#1E6FE0'; c.font = n.h + 'px Tahoma'; c.fillText(n.s, n.p.x, n.p.y); } else if (n.k === 'dim') { c.beginPath(); dimPoly(n).forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.stroke(); } else { pathE(c, n); c.stroke(); } }); c.restore(); };
  const offPoly = (pts, closed, d, side) => {
    const n = pts.length, out = [], seg = i => { const a = pts[i], b = pts[(i + 1) % n], L = D(a, b) || 1; return { a, b, nx: -(b.y - a.y) / L * side, ny: (b.x - a.x) / L * side }; };
    const cnt = closed ? n : n - 1; const S2 = []; for (let i = 0; i < cnt; i++) S2.push(seg(i));
    const sh = (s, k) => ({ a: { x: s.a.x + s.nx * d, y: s.a.y + s.ny * d }, b: { x: s.b.x + s.nx * d, y: s.b.y + s.ny * d } });
    for (let i = 0; i < n; i++) {
      const prev = closed ? S2[(i - 1 + cnt) % cnt] : S2[i - 1], next = closed ? S2[i % cnt] : S2[i];
      if (!prev) { out.push(sh(next).a); continue; } if (!next) { out.push(sh(prev).b); continue; }
      const A1 = sh(prev), B1 = sh(next), q = segInt(A1.a, A1.b, B1.a, B1.b); out.push(q && Math.hypot(q.x - pts[i].x, q.y - pts[i].y) < d * 6 ? { x: q.x, y: q.y } : { x: B1.a.x, y: B1.a.y });
    }
    return out;
  };
  function offsetE(e, d, p) {
    if (e.k === 'line') { const L = D(e.a, e.b) || 1, nx = -(e.b.y - e.a.y) / L, ny = (e.b.x - e.a.x) / L, s = ((p.x - e.a.x) * nx + (p.y - e.a.y) * ny) >= 0 ? 1 : -1; return mapE(e, q => ({ x: q.x + nx * s * d, y: q.y + ny * s * d })); }
    if (e.k === 'circ') { const r = D(e.c, p) > e.r ? e.r + d : e.r - d; if (r < 1) return null; const n = clone(e); n.r = r; return n; }
    if (e.k === 'rect') { const x0 = Math.min(e.a.x, e.b.x), x1 = Math.max(e.a.x, e.b.x), y0 = Math.min(e.a.y, e.b.y), y1 = Math.max(e.a.y, e.b.y), out = !(p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1), k = out ? d : -d; if (x1 - x0 + 2 * k <= 1 || y1 - y0 + 2 * k <= 1) return null; const n = clone(e); n.a = { x: x0 - k, y: y0 - k }; n.b = { x: x1 + k, y: y1 + k }; return n; }
    if (e.k === 'pl') { let bd = 1e18, bs = 1; for (let i = 0; i + 1 < e.pts.length + (e.closed ? 1 : 0); i++) { const a = e.pts[i], b = e.pts[(i + 1) % e.pts.length], q = segDist(p, a, b), L = D(a, b) || 1; if (q.d < bd) { bd = q.d; bs = (((p.x - a.x) * -(b.y - a.y) + (p.y - a.y) * (b.x - a.x)) / L) >= 0 ? 1 : -1; } } const n = clone(e); n.pts = offPoly(e.pts, e.closed, d, bs); return n; }
    if (e.k === 'arc') { const i = arcInfo(e); if (!i) return null; const r = D(i, p) > i.r ? i.r + d : i.r - d; if (r < 1) return null; const k = r / i.r; return mapE(e, q => ({ x: i.x + (q.x - i.x) * k, y: i.y + (q.y - i.y) * k })); }
    return null;
  }
  function doTrim(p) {
    const L = cad(), i = pick(p); if (i < 0) return msg('Click on a line to trim it'); const e = L[i]; if (e.k !== 'line') return msg('Trim works on straight lines: use Explode first for shapes');
    const a = e.a, b = e.b, ts = [], Ln = D(a, b) || 1, tp = segDist(p, a, b).t;
    L.forEach(o => { if (o === e || !vis(o)) return; segs(o).forEach(s => { const q = segInt(a, b, s[0], s[1]); if (q && q.t > 1e-4 && q.t < 1 - 1e-4 && q.u >= -1e-6 && q.u <= 1 + 1e-6) ts.push(q.t); }); });
    const lo = ts.filter(t => t < tp).sort((x, y) => y - x)[0], hi = ts.filter(t => t > tp).sort((x, y) => x - y)[0], at = t => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    A.pushH(); const rep = [];
    if (lo == null && hi == null) { /* no cutting edge: the whole line goes */ }
    else { if (lo != null) rep.push({ k: 'line', a: a, b: at(lo), l: e.l }); if (hi != null) rep.push({ k: 'line', a: at(hi), b: b, l: e.l }); }
    L.splice(i, 1, ...rep); C.sel.delete(e); void Ln; msg('Trimmed');
  }
  function doCorner(st, p) {
    const L = cad(), i = pick(p); if (i < 0 || L[i].k !== 'line') return msg('Click on a straight line');
    if (!st.e1) { st.e1 = L[i]; msg('Now the second line'); return; }
    const e1 = st.e1, e2 = L[i]; if (e1 === e2) return; const q = segInt(e1.a, e1.b, e2.a, e2.b); if (!q) { msg('The two lines are parallel'); st.e1 = null; return; }
    A.pushH(); [e1, e2].forEach(e => { if (D(e.a, q) < D(e.b, q)) e.a = { x: q.x, y: q.y }; else e.b = { x: q.x, y: q.y }; }); st.e1 = null; msg('Corner made');
  }
  function doExplode(p) { const L = cad(), i = pick(p); if (i < 0) return; const e = L[i]; if (e.k !== 'rect' && e.k !== 'pl') return msg('Only rectangles and polylines are exploded'); const pp = poly(e), r = []; for (let k = 1; k < pp.length; k++) r.push({ k: 'line', a: { x: pp[k - 1].x, y: pp[k - 1].y }, b: { x: pp[k].x, y: pp[k].y }, l: e.l }); A.pushH(); L.splice(i, 1, ...r); C.sel.delete(e); msg('Exploded into ' + r.length + ' lines'); }
  function doErase() { if (!C.sel.size) return; A.pushH(); const n = C.sel.size; A.S.cad = cad().filter(e => !C.sel.has(e)); C.sel = new Set(); msg(n + ' object' + (n > 1 ? 's' : '') + ' erased'); }

  // ------------------------------------------------------------------ tools
  const TOOLS = {
    sel: { prompt: () => 'Click an object, or drag a window (left to right: whole objects inside; right to left: objects it touches). Drag a blue square to change a point. Delete erases.' },
    line: {
      prompt: st => st.a ? 'Next point: click, or type a length (toward the cursor), length<angle, @dx,dy. Enter finishes.' : 'First point: click, or type x,y in metres.',
      click(p) { const st = C.st; if (!st.a) { st.a = p; st.base = p; } else if (!same(st.a, p)) { put({ k: 'line', a: st.a, b: p }); st.a = p; st.base = p; } },
      input(s) { const q = parsePt(s, C.st.a); if (!q) return false; this.click(q); }, enter() { start('line'); },
      prev(c, p) { const a = C.st.a; if (a) { c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(p.x, p.y); c.stroke(); } }
    },
    pline: {
      prompt: st => st.pts && st.pts.length ? 'Next point: click or type a length, length<angle, @dx,dy. C closes the shape, Enter or double-click finishes.' : 'First point: click, or type x,y in metres.',
      click(p) { const st = C.st; st.pts = st.pts || []; if (st.pts.length && same(st.pts[st.pts.length - 1], p)) return; st.pts.push(p); st.base = p; },
      input(s) { const st = C.st; if (/^c(lose)?$/i.test(s) && st.pts && st.pts.length > 2) { put({ k: 'pl', pts: st.pts, closed: true }); start('pline'); return; } const q = parsePt(s, st.pts && st.pts[st.pts.length - 1]); if (!q) return false; this.click(q); },
      enter() { const st = C.st; if (st.pts && st.pts.length > 1) put({ k: 'pl', pts: st.pts, closed: false }); start('pline'); }, dbl() { this.enter(); },
      prev(c, p) { const s = C.st.pts; if (s && s.length) { c.beginPath(); s.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.lineTo(p.x, p.y); c.stroke(); } }
    },
    rect: {
      prompt: st => st.a ? 'Opposite corner: click, or type width,height in metres.' : 'First corner: click, or type x,y in metres.',
      click(p) { const st = C.st; if (!st.a) { st.a = p; st.base = p; } else if (Math.abs(p.x - st.a.x) > 1 && Math.abs(p.y - st.a.y) > 1) { put({ k: 'rect', a: st.a, b: p }); start('rect'); } },
      input(s) { const st = C.st, r = s.match(/^\s*(-?[\d.]+)\s*[,x ]\s*(-?[\d.]+)\s*$/); if (st.a && r) { this.click({ x: st.a.x + P(+r[1]), y: st.a.y - P(+r[2]) }); return; } const q = parsePt(s, st.a); if (!q) return false; this.click(q); }, enter() { start('rect'); },
      prev(c, p) { const a = C.st.a; if (a) { c.strokeRect(a.x, a.y, p.x - a.x, p.y - a.y); } }
    },
    circle: {
      prompt: st => st.c ? 'Radius: click, or type the radius in metres (D12 for a diameter of 12 m).' : 'Centre: click, or type x,y in metres.',
      click(p) { const st = C.st; if (!st.c) { st.c = p; st.base = p; } else if (D(st.c, p) > 1) { put({ k: 'circ', c: st.c, r: D(st.c, p) }); start('circle'); } },
      input(s) { const st = C.st; if (st.c) { let r = s.match(/^d\s*([\d.]+)$/i); if (r) { put({ k: 'circ', c: st.c, r: P(+r[1]) / 2 }); start('circle'); return; } r = s.match(/^([\d.]+)$/); if (r && +r[1] > 0) { put({ k: 'circ', c: st.c, r: P(+r[1]) }); start('circle'); return; } return false; } const q = parsePt(s, null); if (!q) return false; this.click(q); }, enter() { start('circle'); },
      prev(c, p) { const o = C.st.c; if (o) { c.beginPath(); c.arc(o.x, o.y, D(o, p), 0, TAU); c.stroke(); } }
    },
    arc: {
      prompt: st => ['Start point of the arc: click.', 'A point on the arc: click.', 'End point of the arc: click.'][(st.pts || []).length],
      click(p) { const st = C.st; st.pts = st.pts || []; if (st.pts.length && same(st.pts[st.pts.length - 1], p)) return; st.pts.push(p); st.base = p; if (st.pts.length === 3) { put({ k: 'arc', a: st.pts[0], b: st.pts[1], c: st.pts[2] }); start('arc'); } },
      input(s) { const q = parsePt(s, C.st.base); if (!q) return false; this.click(q); }, enter() { start('arc'); },
      prev(c, p) { const s = C.st.pts || []; if (s.length === 1) { c.beginPath(); c.moveTo(s[0].x, s[0].y); c.lineTo(p.x, p.y); c.stroke(); } else if (s.length === 2) { pathE(c, { k: 'arc', a: s[0], b: s[1], c: p }); c.stroke(); } }
    },
    dim: {
      prompt: st => ['First point to measure: click (it snaps to corners and ends).', 'Second point: click.', 'Where the dimension line goes: click, or type the distance in metres.'][st.pts ? st.pts.length : 0],
      click(p) { const st = C.st; st.pts = st.pts || []; if (st.pts.length === 2 && !same(st.pts[0], st.pts[1])) { put({ k: 'dim', a: st.pts[0], b: st.pts[1], o: p }); start('dim'); return; } if (st.pts.length < 2) { if (st.pts.length && same(st.pts[0], p)) return; st.pts.push(p); st.base = p; } },
      input(s) { const st = C.st; if (st.pts && st.pts.length === 2 && /^-?[\d.]+$/.test(s)) { const g = dimGeo({ a: st.pts[0], b: st.pts[1] }), d = P(+s); put({ k: 'dim', a: st.pts[0], b: st.pts[1], o: { x: st.pts[0].x + g.nx * d, y: st.pts[0].y + g.ny * d } }); start('dim'); return; } const q = parsePt(s, st.base); if (!q) return false; this.click(q); }, enter() { start('dim'); },
      prev(c, p) { const s = C.st.pts || []; if (s.length === 1) { c.beginPath(); c.moveTo(s[0].x, s[0].y); c.lineTo(p.x, p.y); c.stroke(); } else if (s.length === 2) { const e = { k: 'dim', a: s[0], b: s[1], o: p }; dimDraw(c, e); } }
    },
    txt: {
      prompt: st => st.p ? 'Type the text and press Enter.' : 'Where does the text go? Click.',
      click(p) { C.st.p = p; setTimeout(() => { const i = document.getElementById('skCadIn'); if (i) i.focus(); }, 0); },
      input(s) { const st = C.st; if (!st.p) { const q = parsePt(s, null); if (!q) return false; this.click(q); return; } put({ k: 'txt', p: st.p, s: s, h: 13 * z1() }); start('txt'); }, enter() { start('txt'); },
      prev(c, p) { const q = C.st.p || p; c.save(); c.fillStyle = '#6A1B9A'; c.font = 13 * z1() + 'px Tahoma'; c.fillText(C.st.p ? '|' : 'Text', q.x, q.y); c.restore(); }
    },
    move: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : st.stage === 1 ? 'Base point: click.' : 'Move to: click, or type a distance, dx,dy or length<angle.',
      click(p) { const st = C.st; if (st.stage === 1) { st.base = p; st.stage = 2; } else if (st.stage === 2) this.go(p); },
      go(p) { const b = C.st.base, dx = p.x - b.x, dy = p.y - b.y; replaceSel(e => mapE(e, q => ({ x: q.x + dx, y: q.y + dy }), 0, 1)); start('sel', 1); msg('Moved ' + f(M(Math.hypot(dx, dy))) + ' m'); },
      input(s) { const st = C.st; if (st.stage !== 2) return false; const q = parsePt(s, st.base, true); if (!q) return false; this.go(q); },
      prev(c, p) { const b = C.st.base; if (C.st.stage === 2) ghost(c, q => ({ x: q.x + p.x - b.x, y: q.y + p.y - b.y })); }
    },
    copy: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : st.stage === 1 ? 'Base point: click.' : 'Copy to: click (again for more copies), or type a distance, dx,dy or length<angle. Enter ends.',
      click(p) { const st = C.st; if (st.stage === 1) { st.base = p; st.stage = 2; } else if (st.stage === 2) this.go(p); },
      go(p) { const b = C.st.base, dx = p.x - b.x, dy = p.y - b.y; copySel(e => mapE(e, q => ({ x: q.x + dx, y: q.y + dy }), 0, 1)); msg('Copied'); },
      input(s) { const st = C.st; if (st.stage !== 2) return false; const q = parsePt(s, st.base, true); if (!q) return false; this.go(q); },
      prev(c, p) { const b = C.st.base; if (C.st.stage === 2) ghost(c, q => ({ x: q.x + p.x - b.x, y: q.y + p.y - b.y })); }
    },
    rotate: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : st.stage === 1 ? 'Centre of the rotation: click.' : 'Angle: click the direction, or type degrees (positive turns counter-clockwise).',
      click(p) { const st = C.st; if (st.stage === 1) { st.base = p; st.stage = 2; } else if (st.stage === 2) this.go(Math.atan2(p.y - st.base.y, p.x - st.base.x)); },
      go(th) { const b = C.st.base, co = Math.cos(th), si = Math.sin(th); replaceSel(e => mapE(e, q => ({ x: b.x + (q.x - b.x) * co - (q.y - b.y) * si, y: b.y + (q.x - b.x) * si + (q.y - b.y) * co }))); start('sel', 1); msg('Rotated'); },
      input(s) { if (C.st.stage !== 2 || !/^-?[\d.]+$/.test(s)) return false; this.go(-(+s) * Math.PI / 180); },
      prev(c, p) { const st = C.st; if (st.stage === 2) { const th = Math.atan2(p.y - st.base.y, p.x - st.base.x), co = Math.cos(th), si = Math.sin(th), b = st.base; ghost(c, q => ({ x: b.x + (q.x - b.x) * co - (q.y - b.y) * si, y: b.y + (q.x - b.x) * si + (q.y - b.y) * co })); } }
    },
    mirror: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : st.stage === 1 ? 'First point of the mirror line: click.' : 'Second point of the mirror line: click. The original stays.',
      click(p) { const st = C.st; if (st.stage === 1) { st.base = p; st.stage = 2; } else if (st.stage === 2 && !same(st.base, p)) this.go(p); },
      go(p) { const a = C.st.base, dx = p.x - a.x, dy = p.y - a.y, L2 = dx * dx + dy * dy; copySel(e => mapE(e, q => { const t = ((q.x - a.x) * dx + (q.y - a.y) * dy) / L2, fx = a.x + t * dx, fy = a.y + t * dy; return { x: 2 * fx - q.x, y: 2 * fy - q.y }; })); start('sel', 1); msg('Mirrored'); },
      input(s) { const st = C.st; if (st.stage === 0) return false; const q = parsePt(s, st.base); if (!q) return false; this.click(q); },
      prev(c, p) { const st = C.st; if (st.stage === 2) { c.save(); c.setLineDash([6 * z1(), 4 * z1()]); c.beginPath(); c.moveTo(st.base.x, st.base.y); c.lineTo(p.x, p.y); c.stroke(); c.restore(); } }
    },
    scale: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : st.stage === 1 ? 'Base point (stays in place): click.' : 'Scale factor: type a number (2 doubles the size, 0.5 halves it), then Enter.',
      click(p) { const st = C.st; if (st.stage === 1) { st.base = p; st.stage = 2; } },
      input(s) { const st = C.st; if (st.stage !== 2 || !/^[\d.]+$/.test(s) || !(+s > 0)) return false; const k = +s, b = st.base; replaceSel(e => mapE(e, q => ({ x: b.x + (q.x - b.x) * k, y: b.y + (q.y - b.y) * k }), k)); start('sel', 1); msg('Scaled by ' + f(k, 3)); },
      prev() { }
    },
    array: {
      prompt: st => st.stage === 0 ? 'Select the objects (click or drag a window), then Enter.' : 'Type rows,columns,row spacing,column spacing in metres, for example 3,5,2,0.75, then Enter.',
      click() { },
      input(s) { const r = s.match(/^\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(-?[\d.]+)\s*[, ]\s*(-?[\d.]+)\s*$/); if (C.st.stage !== 1 || !r) return false; const nr = +r[1], nc = +r[2], dr = P(+r[3]), dc = P(+r[4]); if (nr * nc > 5000) { msg('That is more than 5000 copies'); return; } A.pushH(); const L = cad(), base = [...C.sel]; for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) { if (!i && !j) continue; base.forEach(e => L.push(mapE(e, q => ({ x: q.x + j * dc, y: q.y - i * dr }), 0, 1))); } start('sel', 1); msg(nr * nc - 1 + ' copies made'); },
      prev() { }
    },
    erase: { prompt: () => 'Select the objects (click or drag a window), then Enter.', click() { }, input() { return false; } },
    offset: {
      prompt: st => st.e ? 'Click the side to offset to.' : 'Offset distance ' + f(M(P(C.offD)) , 2) + ' m (type a new one and Enter). Click the object to offset.',
      click(p) { const st = C.st, L = cad(); if (!st.e) { const i = pick(p); if (i >= 0) { st.e = L[i]; } else msg('Click on a line, rectangle, circle or polyline'); return; } const n = offsetE(st.e, P(C.offD), p); if (n) { A.pushH(); n.l = st.e.l; L.push(n); } else msg('That offset does not fit'); st.e = null; },
      input(s) { if (!/^[\d.]+$/.test(s) || !(+s > 0)) return false; C.offD = +s; msg('Offset distance ' + s + ' m'); }, enter() { start('sel'); },
      prev(c, p) { const st = C.st; if (st.e) { const n = offsetE(st.e, P(C.offD), p); if (n) { c.save(); c.globalAlpha = 0.6; pathE(c, n); c.stroke(); c.restore(); } } }
    },
    trim: { prompt: () => 'Click the part of a line to remove: it is cut at the nearest lines that cross it.', click(p) { doTrim(p); }, enter() { start('sel'); } },
    fillet: { prompt: st => st.e1 ? 'Click the second line.' : 'Make a sharp corner: click the first line.', click(p) { doCorner(C.st, p); }, enter() { start('sel'); } },
    explode: { prompt: () => 'Click a rectangle or polyline to break it into lines.', click(p) { doExplode(p); }, enter() { start('sel'); } },
    dist: {
      prompt: st => st.a ? 'Second point: click.' : 'Distance: click the first point.',
      click(p) { const st = C.st; if (!st.a) { st.a = p; st.base = p; C.meas = null; } else { const dx = M(p.x - st.a.x), dy = -M(p.y - st.a.y), d = Math.hypot(dx, dy); C.meas = { a: st.a, b: p }; msg('Distance ' + f(d) + ' m · angle ' + f(Math.atan2(dy, dx) * 180 / Math.PI, 1) + '° · dx ' + f(dx) + ' m · dy ' + f(dy) + ' m'); st.a = null; st.base = null; } },
      prev(c, p) { const a = C.st.a; if (a) { c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(p.x, p.y); c.stroke(); } }
    },
    area: {
      prompt: st => st.pts && st.pts.length ? 'Next corner: click. Enter shows the area.' : 'Area: click the corners of the shape.',
      click(p) { const st = C.st; st.pts = st.pts || []; if (st.pts.length && same(st.pts[st.pts.length - 1], p)) return; st.pts.push(p); st.base = p; },
      enter() { const s = C.st.pts || []; if (s.length > 2) { let a = 0, pr = 0; s.forEach((q, i) => { const n = s[(i + 1) % s.length]; a += q.x * n.y - n.x * q.y; pr += D(q, n); }); a = M(M(Math.abs(a) / 2)); C.meas = { poly: s }; msg('Area ' + f(a) + ' m² (' + f(a / 10000, 4) + ' ha) · perimeter ' + f(M(pr)) + ' m'); } start('area'); },
      dbl() { this.enter(); },
      prev(c, p) { const s = C.st.pts || []; if (s.length) { c.beginPath(); s.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.lineTo(p.x, p.y); c.closePath(); c.stroke(); } }
    }
  };
  const ALIAS = { l: 'line', line: 'line', pl: 'pline', pline: 'pline', polyline: 'pline', rec: 'rect', rect: 'rect', rectangle: 'rect', c: 'circle', circle: 'circle', a: 'arc', arc: 'arc', d: 'dim', dim: 'dim', dimension: 'dim', t: 'txt', text: 'txt', dt: 'txt',
    m: 'move', move: 'move', co: 'copy', cp: 'copy', copy: 'copy', ro: 'rotate', rotate: 'rotate', mi: 'mirror', mirror: 'mirror', sc: 'scale', scale: 'scale', o: 'offset', offset: 'offset', tr: 'trim', trim: 'trim', f: 'fillet', fillet: 'fillet', x: 'explode', explode: 'explode',
    ar: 'array', array: 'array', e: 'erase', erase: 'erase', di: 'dist', dist: 'dist', distance: 'dist', aa: 'area', area: 'area', s: 'sel', sel: 'sel', select: 'sel' };

  function start(t, keepSel) {
    if (!TOOLS[t]) return; C.tool = t; A.S.mode = 'cad:' + t; A.S.rect = null; if (A.finishCur) A.finishCur(); C.win = null; C.drag = null;
    C.st = { stage: MODS[t] ? (C.sel.size ? 1 : 0) : 0 }; if (!keepSel && !MODS[t] && t !== 'sel') { /* keep selection for later */ }
    if (t === 'sel' && !keepSel) { /* nothing */ }
    if (t === 'erase' && C.sel.size) { doErase(); C.tool = 'sel'; A.S.mode = 'cad:sel'; C.st = { stage: 0 }; }
    document.querySelectorAll('#skMode button').forEach(b => b.classList.remove('on')); const pd = document.getElementById('skPdL'); if (pd) pd.style.display = 'none';
    sync(); status(); A.draw();
  }
  function enter() {
    const T = TOOLS[C.tool], st = C.st;
    if (MODS[C.tool] && st.stage === 0) { if (!C.sel.size) { msg('Select something first'); return; } if (C.tool === 'erase') { doErase(); start('sel'); A.draw(); return; } st.stage = 1; status(); A.draw(); return; }
    if (T.enter) T.enter(); else if (C.tool === 'sel') { C.sel = new Set(); } else start('sel'); A.draw(); status();
  }
  function cancel() { if (C.tool === 'sel') { C.sel = new Set(); C.win = null; } else start('sel'); msg(''); A.draw(); }
  function cmd(s) {
    s = String(s || '').trim(); if (!s) { enter(); return; }
    const T = TOOLS[C.tool]; if (T.input && T.input(s) !== false) { msg(C.msg); A.draw(); status(); return; }
    const al = ALIAS[s.toLowerCase()]; if (al) { start(al); return; }
    if (/^u(ndo)?$/i.test(s)) { A.undo(); return; } if (/^(z|zoom|fit)$/i.test(s)) { fitAll(); return; } msg('Not understood: ' + s);
  }

  // ------------------------------------------------------------------ the mouse
  function down(raw, ev) {
    const p = track(raw, ev), st = C.st;
    if (C.tool === 'sel' || (MODS[C.tool] && st.stage === 0)) {
      if (C.tool === 'sel' && C.sel.size === 1) { const e = [...C.sel][0], gr = gripsOf(e).find(g => D(g.p, raw) < 9 * z1()); if (gr) { A.pushH(); C.drag = { e, g: gr, moved: false }; return; } }
      const i = pick(raw), L = cad();
      if (i >= 0) { const e = L[i]; if (ev && ev.shiftKey) { if (C.sel.has(e)) C.sel.delete(e); else C.sel.add(e); } else if (MODS[C.tool]) C.sel.add(e); else C.sel = new Set([e]); }
      else C.win = { a: raw, b: raw, add: !!(ev && ev.shiftKey) || !!MODS[C.tool] };
      status(); A.draw(); return;
    }
    const T = TOOLS[C.tool]; if (T.click) T.click(p, raw); A.draw(); status();
  }
  function up() {
    if (C.drag) { C.drag = null; A.draw(); return; }
    if (C.win) {
      const w = C.win; C.win = null; const sx = Math.abs(w.b.x - w.a.x) * A.V.z, sy = Math.abs(w.b.y - w.a.y) * A.V.z;
      if (sx > 4 || sy > 4) { const x0 = Math.min(w.a.x, w.b.x), x1 = Math.max(w.a.x, w.b.x), y0 = Math.min(w.a.y, w.b.y), y1 = Math.max(w.a.y, w.b.y), cross = w.b.x < w.a.x; if (!w.add) C.sel = new Set(); cad().forEach(e => { if (!vis(e)) return; const b = bbox(e), inn = b.x0 >= x0 && b.x1 <= x1 && b.y0 >= y0 && b.y1 <= y1, tch = !(b.x1 < x0 || b.x0 > x1 || b.y1 < y0 || b.y0 > y1); if (cross ? tch : inn) C.sel.add(e); }); }
      else if (!w.add) C.sel = new Set();
      status();
    }
    A.draw();
  }
  function dbl() { const T = TOOLS[C.tool]; if (T && T.dbl) { T.dbl(); A.draw(); status(); } }

  // ------------------------------------------------------------------ drawing
  function pathE(c, e) {
    c.beginPath();
    if (e.k === 'line') { c.moveTo(e.a.x, e.a.y); c.lineTo(e.b.x, e.b.y); }
    else if (e.k === 'pl') { e.pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); if (e.closed) c.closePath(); }
    else if (e.k === 'rect') c.rect(Math.min(e.a.x, e.b.x), Math.min(e.a.y, e.b.y), Math.abs(e.b.x - e.a.x), Math.abs(e.b.y - e.a.y));
    else if (e.k === 'circ') c.arc(e.c.x, e.c.y, e.r, 0, TAU);
    else if (e.k === 'arc') { const i = arcInfo(e); if (i) c.arc(i.x, i.y, i.r, i.a0, i.a2, !i.inc); else { c.moveTo(e.a.x, e.a.y); c.lineTo(e.c.x, e.c.y); } }
  }
  function dimDraw(c, e) {
    const z = z1(), g = dimGeo(e), s = Math.sign(g.off) || 1, ov = 4 * z, tk = 4 * z;
    c.beginPath(); [[e.a, g.a2], [e.b, g.b2]].forEach(([p0, p1]) => { c.moveTo(p0.x + g.nx * s * 2 * z, p0.y + g.ny * s * 2 * z); c.lineTo(p1.x + g.nx * s * ov, p1.y + g.ny * s * ov); });
    c.moveTo(g.a2.x, g.a2.y); c.lineTo(g.b2.x, g.b2.y); [g.a2, g.b2].forEach(q => { c.moveTo(q.x - (g.ux + g.nx) * tk, q.y - (g.uy + g.ny) * tk); c.lineTo(q.x + (g.ux + g.nx) * tk, q.y + (g.uy + g.ny) * tk); }); c.stroke();
    c.save(); c.translate((g.a2.x + g.b2.x) / 2, (g.a2.y + g.b2.y) / 2); let ang = Math.atan2(g.uy, g.ux); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI; c.rotate(ang); c.font = 'bold ' + 11 * z + 'px Tahoma,Arial,sans-serif'; c.textAlign = 'center'; c.fillStyle = c.strokeStyle; c.fillText(f(M(g.L)) + ' m', 0, -3 * z); c.restore();
  }
  function drawE(c, e, L, sel) {
    const z = z1(); c.save(); c.strokeStyle = sel ? '#1E6FE0' : L.c; c.fillStyle = c.strokeStyle; c.lineWidth = (sel ? 2.4 : 1.6) * z; c.lineJoin = 'round'; if (L.dash) c.setLineDash([6 * z, 4 * z]);
    if (e.k === 'txt') { c.font = e.h + 'px Tahoma,Arial,sans-serif'; c.fillText(e.s, e.p.x, e.p.y); } else if (e.k === 'dim') dimDraw(c, e); else { pathE(c, e); c.stroke(); }
    c.restore();
  }
  function draw() {
    if (!A || !A.cv || !document.body.contains(A.cv)) return; const cv = A.cv, c = cv.getContext('2d'), k0 = cv.width / A.CW, V = A.V, z = V.z, zz = 1 / z, T = TOOLS[C.tool];
    c.setTransform(k0 * z, 0, 0, k0 * z, -V.x * k0 * z, -V.y * k0 * z);
    cad().forEach(e => { if (vis(e)) drawE(c, e, lay(e.l), C.sel.has(e)); });
    if (C.sel.size && C.sel.size <= 40) { c.fillStyle = '#fff'; c.strokeStyle = '#1E6FE0'; c.lineWidth = 1.2 * zz; C.sel.forEach(e => gripsOf(e).forEach(g => { c.beginPath(); c.rect(g.p.x - 4 * zz, g.p.y - 4 * zz, 8 * zz, 8 * zz); c.fill(); c.stroke(); })); }
    if (C.meas) { c.save(); c.strokeStyle = '#E65100'; c.lineWidth = 2 * zz; c.setLineDash([5 * zz, 3 * zz]); c.beginPath(); if (C.meas.poly) { C.meas.poly.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.closePath(); c.fillStyle = 'rgba(230,81,0,0.10)'; c.fill(); } else { c.moveTo(C.meas.a.x, C.meas.a.y); c.lineTo(C.meas.b.x, C.meas.b.y); } c.stroke(); c.restore(); }
    const q = C.cur;
    if (C.win) { const w = C.win; c.save(); const cross = w.b.x < w.a.x; c.strokeStyle = cross ? '#2E7D32' : '#1E6FE0'; c.fillStyle = cross ? 'rgba(46,125,50,0.10)' : 'rgba(30,111,224,0.10)'; c.lineWidth = 1 * zz; if (cross) c.setLineDash([4 * zz, 3 * zz]); c.fillRect(w.a.x, w.a.y, w.b.x - w.a.x, w.b.y - w.a.y); c.strokeRect(w.a.x, w.a.y, w.b.x - w.a.x, w.b.y - w.a.y); c.restore(); }
    if (q && T && T.prev && !C.win && !C.drag) { c.save(); c.strokeStyle = lay(C.layer).c; c.lineWidth = 1.4 * zz; c.setLineDash([5 * zz, 3 * zz]); try { T.prev(c, q); } catch (x) { } c.restore(); }
    if (q && q.t && q.t !== 'grid') {
      c.save(); c.strokeStyle = q.t === 'ortho' || q.t === 'polar' ? '#8E24AA' : '#E65100'; c.lineWidth = 2 * zz; const s = 6 * zz; c.beginPath();
      if (q.t === 'end') c.rect(q.x - s, q.y - s, 2 * s, 2 * s); else if (q.t === 'mid') { c.moveTo(q.x, q.y - s); c.lineTo(q.x + s, q.y + s); c.lineTo(q.x - s, q.y + s); c.closePath(); } else if (q.t === 'cen') c.arc(q.x, q.y, s, 0, TAU); else if (q.t === 'int') { c.moveTo(q.x - s, q.y - s); c.lineTo(q.x + s, q.y + s); c.moveTo(q.x + s, q.y - s); c.lineTo(q.x - s, q.y + s); } else if (q.t === 'near') { c.moveTo(q.x - s, q.y - s); c.lineTo(q.x + s, q.y - s); c.lineTo(q.x - s, q.y + s); c.lineTo(q.x + s, q.y + s); } else if (q.t === 'polar' || q.t === 'ortho') { const b = C.st.base; if (b) { c.setLineDash([4 * zz, 4 * zz]); c.moveTo(b.x, b.y); c.lineTo(q.x, q.y); } }
      c.stroke(); c.restore();
    }
    // live length and angle next to the cursor
    c.setTransform(k0, 0, 0, k0, 0, 0); const b = C.st && C.st.base;
    if (q && b && C.tool !== 'sel' && !C.win) { const sp = { x: (q.x - V.x) * z, y: (q.y - V.y) * z }, dx = M(q.x - b.x), dy = -M(q.y - b.y), t = f(Math.hypot(dx, dy)) + ' m  ' + f(Math.atan2(dy, dx) * 180 / Math.PI, 1) + '°'; c.font = 'bold 10.5px Tahoma,Arial,sans-serif'; const tw = c.measureText(t).width + 10, bx = Math.min(A.CW - tw - 4, sp.x + 14), by = Math.max(14, sp.y - 16); c.fillStyle = 'rgba(255,253,235,0.95)'; c.strokeStyle = '#B9B4A6'; c.lineWidth = 1; c.fillRect(bx, by - 11, tw, 16); c.strokeRect(bx + 0.5, by - 10.5, tw - 1, 15); c.fillStyle = '#12303A'; c.fillText(t, bx + 5, by + 1); }
  }

  // ------------------------------------------------------------------ the window of the tools
  function status() {
    const el = document.getElementById('skCadMsg'); if (!el) return; const T = TOOLS[C.tool], st = C.st;
    el.innerHTML = '<b>' + ({ sel: 'Select', line: 'Line', pline: 'Polyline', rect: 'Rectangle', circle: 'Circle', arc: 'Arc', dim: 'Dimension', txt: 'Text', move: 'Move', copy: 'Copy', rotate: 'Rotate', mirror: 'Mirror', scale: 'Scale', offset: 'Offset', trim: 'Trim', fillet: 'Corner', explode: 'Explode', array: 'Array', erase: 'Erase', dist: 'Distance', area: 'Area' }[C.tool]) + ':</b> ' + esc(T.prompt(st)) + (C.msg ? '<br><span class="skcadm">' + esc(C.msg) + '</span>' : '') + (C.sel.size ? '<br><span class="skcadm">' + C.sel.size + ' selected</span>' : '');
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function sync() {
    if (!host) return; host.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', A.S.mode === 'cad:' + b.dataset.t));
    const set = (id, on) => { const b = host.querySelector('#' + id); if (b) b.classList.toggle('on', !!on); }; set('skCadOrtho', C.ortho); set('skCadPolar', C.polar); set('skCadSnap', Object.values(C.snap).some(v => v));
  }
  function layersHtml() {
    return C.layers.map((l, i) => '<div class="skcadl"><input type="checkbox" data-lv="' + i + '"' + (l.on ? ' checked' : '') + ' title="Show or hide"><input type="color" data-lc="' + i + '" value="' + l.c + '"><label><input type="radio" name="skCadLay" data-ll="' + i + '"' + (l.n === C.layer ? ' checked' : '') + '> ' + esc(l.n) + '</label></div>').join('') + '<div class="skcadl"><input type="text" id="skCadNL" placeholder="New layer" style="width:110px"><button class="btn" id="skCadAL">Add</button></div>';
  }
  function css() {
    if (document.getElementById('skCadCss')) return; const s = document.createElement('style'); s.id = 'skCadCss';
    s.textContent = '.skcad{border-top:1px solid #C9C5B8;margin-top:6px;padding-top:5px;font:11px Tahoma,Arial,sans-serif}.skcad .grp{display:inline-flex;flex-wrap:wrap;gap:2px;align-items:center;margin:0 8px 3px 0}.skcad .grp>i{font-style:normal;color:#6a6a6a;margin-right:3px;font-size:10px;text-transform:uppercase;letter-spacing:.04em}.skcad button{font:11px Tahoma,Arial,sans-serif;padding:2px 7px;border:1px solid #B9B4A6;background:#F4F2EA;border-radius:3px;cursor:pointer}.skcad button.on{background:#1E3A6E;color:#fff;border-color:#1E3A6E}.skcad button:hover{border-color:#1E6FE0}.skcad #skCadIn{width:240px;padding:2px 5px;font:12px Consolas,monospace;border:1px solid #1E6FE0;border-radius:3px}.skcadm{color:#8a4b00}.skcad .skcadl{display:flex;gap:6px;align-items:center;margin:2px 0}.skcad details{display:inline-block;vertical-align:top;margin-right:8px}.skcad details>summary{cursor:pointer;display:inline;padding:2px 7px;border:1px solid #B9B4A6;background:#F4F2EA;border-radius:3px}.skcad .pop{position:absolute;z-index:5;background:#fff;border:1px solid #888;padding:6px 8px;box-shadow:0 2px 8px rgba(0,0,0,.25)}#skCadMsg{min-height:30px;margin:3px 0;line-height:1.35}';
    document.head.appendChild(s);
  }
  function mount(h) {
    host = h; css(); if (!A.S.cad) A.S.cad = [];
    const B = (t, l, tip) => '<button data-t="' + t + '" title="' + esc(tip) + '">' + l + '</button>';
    h.innerHTML = '<div class="skcad"><div>' +
      '<span class="grp"><i>CAD</i>' + B('sel', 'Select', 'Pick objects, or drag a window. Drag the blue squares of a selected object to change it.') + '</span>' +
      '<span class="grp"><i>Draw</i>' + B('line', 'Line', 'L: lines, chained') + B('pline', 'Polyline', 'PL: connected lines; C closes the shape') + B('rect', 'Rectangle', 'REC: two corners, or type width,height') + B('circle', 'Circle', 'C: centre and radius') + B('arc', 'Arc', 'A: three points') + B('txt', 'Text', 'T: a note on the drawing') + B('dim', 'Dimension', 'D: a measured dimension line') + '</span>' +
      '<span class="grp"><i>Modify</i>' + B('move', 'Move', 'M') + B('copy', 'Copy', 'CO') + B('rotate', 'Rotate', 'RO') + B('mirror', 'Mirror', 'MI') + B('scale', 'Scale', 'SC') + B('offset', 'Offset', 'O: a parallel copy at a distance') + B('trim', 'Trim', 'TR: cut a line at the lines that cross it') + B('fillet', 'Corner', 'F: join two lines in a sharp corner') + B('explode', 'Explode', 'X: break a rectangle or polyline into lines') + B('array', 'Array', 'AR: rows and columns of copies') + B('erase', 'Erase', 'E, or the Delete key') + '</span>' +
      '<span class="grp"><i>Inquiry</i>' + B('dist', 'Distance', 'DI: distance and angle between two points') + B('area', 'Area', 'AA: area and perimeter of a shape') + '</span>' +
      '<span class="grp"><i>Help</i><button id="skCadSnap" title="Object snap (F3): endpoints, middles, centres, crossings, nearest point, grid" class="on">Snap F3</button><button id="skCadOrtho" title="Ortho (F8): only horizontal and vertical. Holding Shift does the same.">Ortho F8</button><button id="skCadPolar" title="Polar: lines click to every 15 degrees">Polar</button>' +
      '<details id="skCadSD"><summary title="Which points to snap to">Snaps</summary><div class="pop">' + [['end', 'Endpoint'], ['mid', 'Midpoint'], ['cen', 'Centre'], ['int', 'Intersection'], ['near', 'Nearest on a line'], ['grid', 'Grid']].map(q => '<div class="skcadl"><label><input type="checkbox" data-sn="' + q[0] + '"' + (C.snap[q[0]] ? ' checked' : '') + '> ' + q[1] + '</label></div>').join('') + '</div></details>' +
      '<details id="skCadLD"><summary title="Layers: hide, colour, choose where new objects go">Layers</summary><div class="pop" id="skCadLP">' + layersHtml() + '</div></details></span>' +
      '</div><div><input id="skCadIn" placeholder="Command or distance, then Enter" autocomplete="off" spellcheck="false"> <span id="skCadXY" style="color:#555;font-family:Consolas,monospace"></span></div><div id="skCadMsg"></div>' +
      '<div><span class="grp"><i>Use the selected shape as</i><select id="skCadUse"><option value="">choose...</option><option value="field">the field</option><option value="irr">an area to irrigate</option><option value="noirr">a no-irrigation zone</option><option value="gh">a greenhouse</option><option value="bed">a plant bed</option><option value="main">the mainline</option><option value="sub">a submain</option><option value="lat">a lateral pipe</option></select> <button id="skCadGo">Use it</button></span>' +
      '<span class="grp"><button id="skCadSave" title="Save the drawing as a DXF file for AutoCAD, in metres">Save DXF</button><button id="skCadOpen" title="Open a DXF file (lines, polylines, circles, arcs, text)">Open DXF</button><button id="skCadFit" title="Show the whole drawing">Zoom all</button><input type="file" id="skCadFile" accept=".dxf" style="display:none"></span></div></div>';
    const inp = h.querySelector('#skCadIn');
    h.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; if (b.dataset.t) { start(b.dataset.t); return; }
      if (b.id === 'skCadSnap') { const on = !Object.values(C.snap).some(v => v); Object.keys(C.snap).forEach(k => { C.snap[k] = on ? 1 : 0; }); h.querySelectorAll('[data-sn]').forEach(x => { x.checked = on; }); sync(); }
      else if (b.id === 'skCadOrtho') { C.ortho = C.ortho ? 0 : 1; if (C.ortho) C.polar = 0; sync(); } else if (b.id === 'skCadPolar') { C.polar = C.polar ? 0 : 1; if (C.polar) C.ortho = 0; sync(); }
      else if (b.id === 'skCadGo') useAs(h.querySelector('#skCadUse').value); else if (b.id === 'skCadSave') saveDxf(); else if (b.id === 'skCadOpen') h.querySelector('#skCadFile').click(); else if (b.id === 'skCadFit') fitAll();
      else if (b.id === 'skCadAL') { const n = (h.querySelector('#skCadNL').value || '').trim(); if (n && !C.layers.some(l => l.n === n)) { C.layers.push({ n, c: '#' + ((Math.random() * 0x777777 + 0x222222) | 0).toString(16).padStart(6, '0'), on: 1 }); C.layer = n; h.querySelector('#skCadLP').innerHTML = layersHtml(); } }
    });
    h.addEventListener('change', e => {
      const t = e.target; if (t.dataset.sn) { C.snap[t.dataset.sn] = t.checked ? 1 : 0; sync(); } else if (t.dataset.lv != null) { C.layers[+t.dataset.lv].on = t.checked ? 1 : 0; A.draw(); } else if (t.dataset.lc != null) { C.layers[+t.dataset.lc].c = t.value; A.draw(); } else if (t.dataset.ll != null) C.layer = C.layers[+t.dataset.ll].n;
      else if (t.id === 'skCadFile' && t.files[0]) { const r = new FileReader(); r.onload = () => openDxf(String(r.result)); r.readAsText(t.files[0]); t.value = ''; }
    });
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { const v = inp.value; inp.value = ''; cmd(v); } else if (e.key === 'Escape') { inp.value = ''; inp.blur(); cancel(); } });
    if (!keys) { keys = true; document.addEventListener('keydown', onKey, true); }
    if (String(A.S.mode).indexOf('cad:') === 0) start(A.S.mode.slice(4)); else { sync(); status(); }
  }
  function onKey(e) {
    if (!A || !document.getElementById('skCv') || String(A.S.mode).indexOf('cad:') !== 0) return; const tg = (e.target || {}).tagName || ''; if (/INPUT|SELECT|TEXTAREA/.test(tg)) return;
    if (e.key === 'Escape') { if (C.tool !== 'sel' || C.sel.size || C.win || C.drag || C.msg) { cancel(); e.preventDefault(); e.stopPropagation(); } } else if (e.key === 'Enter' || e.key === ' ') { enter(); e.preventDefault(); } else if (e.key === 'Delete' || e.key === 'Backspace') { if (C.sel.size) { doErase(); A.draw(); status(); e.preventDefault(); } }
    else if (e.key === 'F8') { C.ortho = C.ortho ? 0 : 1; if (C.ortho) C.polar = 0; sync(); e.preventDefault(); } else if (e.key === 'F3') { const on = !Object.values(C.snap).some(v => v); Object.keys(C.snap).forEach(k => { C.snap[k] = on ? 1 : 0; }); sync(); e.preventDefault(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { C.sel = new Set(cad().filter(vis)); status(); A.draw(); e.preventDefault(); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { const i = document.getElementById('skCadIn'); if (i) i.focus(); }
  }

  // ------------------------------------------------------------------ the drawing becomes the design
  function useAs(kind) {
    if (!kind) { msg('Choose what the selected shape should become'); return; } const es = [...C.sel]; if (!es.length) { msg('Select a shape first'); return; }
    const S = A.S; let n = 0, cx = 0;
    const take = [];
    es.forEach(e => {
      const closed = e.k === 'rect' || e.k === 'circ' || (e.k === 'pl' && e.closed), pts = e.k === 'rect' ? poly(e).slice(0, 4) : e.k === 'pl' ? e.pts : e.k === 'line' ? [e.a, e.b] : e.k === 'circ' ? circPts(e.c, e.r, 24).slice(0, 24) : e.k === 'arc' ? arcPts(e, 12) : null;
      if (!pts) return; const cp = pts.map(q => ({ x: q.x, y: q.y }));
      if (kind === 'field') { if (!closed || cx) return; take.push(() => { S.pts = cp; S.inlet = null; }); cx++; }
      else if (kind === 'irr' || kind === 'noirr') { if (!closed) return; take.push(() => S.objs.push({ t: kind, pts: cp })); }
      else if (kind === 'gh' || kind === 'bed') { if (!closed || cp.length !== 4) return; take.push(() => S.objs.push({ t: kind, pts: cp })); }
      else { if (closed) return; take.push(() => S.objs.push({ t: kind, pts: cp, dia: (S.pd && S.pd[kind]) || undefined })); }
      n++; C.sel.delete(e); S._cadGone = (S._cadGone || []).concat([e]);
    });
    if (!n) { msg(kind === 'main' || kind === 'sub' || kind === 'lat' ? 'A pipe needs an open line or polyline' : kind === 'gh' || kind === 'bed' ? 'This needs a rectangle (four corners)' : 'This needs a closed shape'); return; }
    A.pushH(); take.forEach(fn => fn()); const gone = S._cadGone; delete S._cadGone; S.cad = cad().filter(e => gone.indexOf(e) < 0); msg(n + ' shape' + (n > 1 ? 's' : '') + ' used'); A.draw(); A.info && A.info();
  }
  function fitAll() {
    const pts = []; cad().forEach(e => { if (vis(e)) poly(e).forEach(q => pts.push(q)); }); A.S.pts.forEach(q => pts.push(q)); if (A.S.src) pts.push(A.S.src);
    if (pts.length < 2) { A.V.z = 1; A.V.x = 0; A.V.y = 0; A.draw(); return; }
    const xs = pts.map(q => q.x), ys = pts.map(q => q.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), V = A.V;
    V.z = Math.max(0.05, Math.min(12, Math.min((A.CW - 60) / Math.max(1, x1 - x0), (A.CH - 60) / Math.max(1, y1 - y0)))); V.x = (x0 + x1) / 2 - A.CW / 2 / V.z; V.y = (y0 + y1) / 2 - A.CH / 2 / V.z; A.draw();
  }

  // ------------------------------------------------------------------ DXF
  function dxfText() {
    const L = [], g = (c, v) => { L.push(String(c), String(v)); }, X = x => (+M(x)).toFixed(4), Y = y => (-M(y)).toFixed(4), S = A.S;
    const line = (a, b, l) => { g(0, 'LINE'); g(8, l); g(10, X(a.x)); g(20, Y(a.y)); g(30, 0); g(11, X(b.x)); g(21, Y(b.y)); g(31, 0); };
    const pl = (pts, closed, l) => { g(0, 'LWPOLYLINE'); g(8, l); g(90, pts.length); g(70, closed ? 1 : 0); pts.forEach(p => { g(10, X(p.x)); g(20, Y(p.y)); }); };
    const circ = (c, r, l) => { g(0, 'CIRCLE'); g(8, l); g(10, X(c.x)); g(20, Y(c.y)); g(30, 0); g(40, (+M(r)).toFixed(4)); };
    const text = (p, s, h, l) => { g(0, 'TEXT'); g(8, l); g(10, X(p.x)); g(20, Y(p.y)); g(30, 0); g(40, (+M(h)).toFixed(4)); g(1, s); };
    g(0, 'SECTION'); g(2, 'HEADER'); g(9, '$INSUNITS'); g(70, 6); g(0, 'ENDSEC'); g(0, 'SECTION'); g(2, 'ENTITIES');
    if (S.pts.length > 2) pl(S.pts, true, 'FIELD'); if (S.src) circ(S.src, 6, 'WATER SOURCE');
    S.objs.forEach(o => { const nm = (o.t || 'OBJECT').toUpperCase(); if (o.pts.length === 1) circ(o.pts[0], 4, nm); else pl(o.pts, ['gh', 'bed', 'irr', 'noirr'].indexOf(o.t) >= 0, nm); });
    cad().forEach(e => {
      const l = (e.l || '0').toUpperCase();
      if (e.k === 'line') line(e.a, e.b, l); else if (e.k === 'pl') pl(e.pts, e.closed, l); else if (e.k === 'rect') pl(poly(e).slice(0, 4), true, l); else if (e.k === 'circ') circ(e.c, e.r, l); else if (e.k === 'txt') text(e.p, e.s, e.h, l);
      else if (e.k === 'arc') { const i = arcInfo(e); if (i) { const dg = v => ((-v * 180 / Math.PI) % 360 + 360) % 360, s0 = i.inc ? dg(i.a2) : dg(i.a0), s1 = i.inc ? dg(i.a0) : dg(i.a2); g(0, 'ARC'); g(8, l); g(10, X(i.x)); g(20, Y(i.y)); g(30, 0); g(40, (+M(i.r)).toFixed(4)); g(50, s0.toFixed(4)); g(51, s1.toFixed(4)); } }
      else if (e.k === 'dim') { const d = dimGeo(e); line(e.a, d.a2, l); line(e.b, d.b2, l); line(d.a2, d.b2, l); text({ x: (d.a2.x + d.b2.x) / 2, y: (d.a2.y + d.b2.y) / 2 }, f(M(d.L)) + ' m', 11 * z1(), l); }
    });
    g(0, 'ENDSEC'); g(0, 'EOF'); return L.join('\n') + '\n';
  }
  function saveDxf() {
    const t = dxfText(), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'application/dxf' })); a.download = (window.SWAFLDate ? SWAFLDate.name('field-sketch.dxf') : 'field-sketch.dxf'); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); msg('DXF saved in metres: ' + cad().length + ' drawn objects, the field and the objects of the design');
  }
  function parseDxf(text) {
    const t = text.split(/\r?\n/).map(s => s.trim()), ents = []; let cur = null;
    for (let i = 0; i + 1 < t.length; i += 2) { const code = +t[i], val = t[i + 1]; if (code === 0) { if (cur) ents.push(cur); cur = { type: val, v: [] }; } else if (cur) cur.v.push([code, val]); }
    if (cur) ents.push(cur); const out = [];
    const num = (e, c, k) => { const a = e.v.filter(p => p[0] === c); return a.length ? parseFloat(a[k || 0][1]) : NaN; }, str = (e, c) => { const a = e.v.find(p => p[0] === c); return a ? a[1] : ''; };
    let pol = null;
    ents.forEach(e => {
      const l = str(e, 8) || '0';
      if (e.type === 'LINE') out.push({ k: 'line', a: { x: num(e, 10), y: num(e, 20) }, b: { x: num(e, 11), y: num(e, 21) }, l });
      else if (e.type === 'LWPOLYLINE') { const pts = []; let cx = null; e.v.forEach(p => { if (p[0] === 10) cx = parseFloat(p[1]); else if (p[0] === 20 && cx != null) { pts.push({ x: cx, y: parseFloat(p[1]) }); cx = null; } }); if (pts.length > 1) out.push({ k: 'pl', pts, closed: (parseInt(str(e, 70)) & 1) === 1, l }); }
      else if (e.type === 'POLYLINE') pol = { k: 'pl', pts: [], closed: (parseInt(str(e, 70)) & 1) === 1, l };
      else if (e.type === 'VERTEX' && pol) pol.pts.push({ x: num(e, 10), y: num(e, 20) });
      else if (e.type === 'SEQEND' && pol) { if (pol.pts.length > 1) out.push(pol); pol = null; }
      else if (e.type === 'CIRCLE') out.push({ k: 'circ', c: { x: num(e, 10), y: num(e, 20) }, r: num(e, 40), l });
      else if (e.type === 'ARC') { const cx = num(e, 10), cy = num(e, 20), r = num(e, 40), s0 = num(e, 50) * Math.PI / 180; let s1 = num(e, 51) * Math.PI / 180; while (s1 <= s0) s1 += TAU; const at = a => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); out.push({ k: 'arc', a: at(s0), b: at((s0 + s1) / 2), c: at(s1), l }); }
      else if (e.type === 'TEXT' || e.type === 'MTEXT') out.push({ k: 'txt', p: { x: num(e, 10), y: num(e, 20) }, s: str(e, 1).replace(/\\P/g, ' ').replace(/\{[^}]*;|\}/g, ''), h: num(e, 40) || 1, l });
    });
    return out.filter(e => { const p = poly(e); return p.length && p.every(q => isFinite(q.x) && isFinite(q.y)); });
  }
  function openDxf(text) {
    let es; try { es = parseDxf(text); } catch (x) { msg('This DXF file could not be read'); return; } if (!es.length) { msg('No lines, polylines, circles, arcs or text found in this file'); return; }
    let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18; es.forEach(e => poly(e).forEach(q => { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }));
    const ext = Math.max(x1 - x0, y1 - y0), k = ext > 5000 ? 0.001 : 1, cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2, ox = A.CW / 2, oy = A.CH / 2;
    const mp = q => ({ x: ox + P((q.x - cxm) * k), y: oy - P((q.y - cym) * k) });
    A.pushH(); es.forEach(e => { const n = mapE(e, mp, k); if (n.k === 'circ') n.r = P(e.r * k); if (n.k === 'txt') n.h = P(e.h * k); if (!C.layers.some(l => l.n === e.l)) C.layers.push({ n: e.l, c: '#455A64', on: 1 }); cad().push(n); });
    const lp = host && host.querySelector('#skCadLP'); if (lp) lp.innerHTML = layersHtml(); fitAll(); msg(es.length + ' objects opened' + (k === 0.001 ? ' (the file looked like millimetres, so it was scaled to metres)' : ' in metres'));
  }

  const reset = () => { C.sel = new Set(); C.st = { stage: 0 }; C.win = null; C.drag = null; C.meas = null; };
  return { init: api => { A = api; }, mount, track, down, up, dbl, draw, sync, start, cmd, enter, cancel, reset, fitAll, parseDxf, dxfText, count: () => cad().length, _C: C };
})();
window.SketchCAD = SketchCAD;
