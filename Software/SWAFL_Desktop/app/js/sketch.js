/* Field sketch: draw the field with the mouse (corners you can drag, sides you can type), place the water source and the
   inlet, choose the crop, the system and the pipe layout, answer the questions of each step, and the sketch becomes the
   inputs of the irrigation design, ready to run. Also the comparison of the three systems on the present field. */
'use strict';
const Sketch = (() => {
  const CW = 640, CH = 440, GRID = 32;                          // canvas and grid square (px)
  const SC = [1, 2, 5, 10, 20, 25, 50, 100];
  const S = {                                                   // the sketch and the answers, kept while the program runs
    pts: [], src: null, inlet: null, scale: 10, mode: 'field', step: 0,
    L: 150, Wd: 100, slope: 0.3, slopeDir: 'run',
    srcType: 'well', lift: 12, supply: 30, hours: 16,
    crop: null, row: 0.75, plant: 0.3,
    soil: null, pan: false,
    sys: 'drip', sub: 'border', dep: 0, kind: 'inline', sprSys: 'solid', sprType: 'impact', dir: 'length',
    intv: 2, sprSs: 12, sprSl: 18, auto: false
  };
  let cv = null, drag = null, hover = null, cursor = null, edit = null, LIST = null;
  const len = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const m = px => px * S.scale / GRID, px = mm => mm * GRID / S.scale;    // pixels <-> metres
  const snap = v => Math.round(v / (GRID / 4)) * (GRID / 4);
  const fmt = (v, d) => (isFinite(v) ? (+v).toFixed(d == null ? 0 : d) : '-');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------------ geometry of the field
  function geom() {
    const P = S.pts; if (P.length < 3) return null; let A = 0, per = 0, L = 0, ang = 0;
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], d = len(a, b); A += a.x * b.y - b.x * a.y; per += d; if (d > L) { L = d; ang = Math.atan2(b.y - a.y, b.x - a.x); } }
    if (S.dir === 'across') ang += Math.PI / 2;
    const ux = Math.cos(ang), uy = Math.sin(ang); let lo = 1e9, hi = -1e9, wlo = 1e9, whi = -1e9;
    P.forEach(p => { const s = p.x * ux + p.y * uy, t = -p.x * uy + p.y * ux; lo = Math.min(lo, s); hi = Math.max(hi, s); wlo = Math.min(wlo, t); whi = Math.max(whi, t); });
    const inl = S.inlet || nearestOnEdge(S.src || P[0]).p, main = S.src ? m(len(S.src, inl)) : 0;
    return { area: m(m(Math.abs(A) / 2)), perim: m(per), run: m(hi - lo), wid: m(whi - wlo), main, ux, uy, lo, hi, wlo, whi, inl };
  }
  function nearestOnEdge(q) {
    const P = S.pts; let best = { d: 1e9, p: P[0] || q, i: 0 };
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((q.x - a.x) * dx + (q.y - a.y) * dy) / L2)), p = { x: a.x + t * dx, y: a.y + t * dy }, d = len(p, q); if (d < best.d) best = { d, p, i }; }
    return best;
  }
  function inside(x, y) { const P = S.pts; let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; }
  function rectangle() {
    const Lp = px(S.L), Wp = px(S.Wd), k = Math.min(1, (CW - 120) / Lp, (CH - 110) / Wp);
    if (k < 1) { const ns = SC.find(v => px(S.L) * S.scale / v <= CW - 120 && px(S.Wd) * S.scale / v <= CH - 110) || 100; S.scale = Math.max(S.scale, ns); }
    const a = px(S.L), b = px(S.Wd), x0 = snap((CW - a) / 2), y0 = snap((CH - b) / 2 + 10);
    S.pts = [{ x: x0, y: y0 }, { x: x0 + a, y: y0 }, { x: x0 + a, y: y0 + b }, { x: x0, y: y0 + b }];
    if (!S.src) S.src = { x: Math.max(24, x0 - 70), y: y0 + b / 2 }; S.inlet = null;
  }

  // ------------------------------------------------------------------ drawing
  function draw() {
    if (!cv) return; const c = cv.getContext('2d'), w = CW, h = CH; c.setTransform(cv.width / CW, 0, 0, cv.height / CH, 0, 0);
    c.fillStyle = '#FBFBF8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#E6E4DC'; c.lineWidth = 1;
    for (let x = 0; x <= w; x += GRID) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); c.stroke(); }
    for (let y = 0; y <= h; y += GRID) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
    c.font = '11px Tahoma,Arial,sans-serif'; c.fillStyle = '#505050'; c.fillText('1 square = ' + S.scale + ' m', 8, h - 8);
    // scale bar
    { const bl = GRID * 2; c.strokeStyle = '#303030'; c.lineWidth = 2; c.beginPath(); c.moveTo(w - bl - 14, h - 12); c.lineTo(w - 14, h - 12); c.stroke(); c.fillStyle = '#303030'; c.textAlign = 'center'; c.fillText(2 * S.scale + ' m', w - 14 - bl / 2, h - 17); c.textAlign = 'left'; }
    const P = S.pts, g = geom();
    if (P.length) {
      c.fillStyle = 'rgba(126,170,90,0.20)'; c.strokeStyle = '#2E7D32'; c.lineWidth = 2; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); if (P.length > 2) c.closePath(); c.fill(); c.stroke();
    }
    if (g) layout(c, g);
    // corners and side lengths (click a length to type it)
    P.forEach((p, i) => { const on = hover && hover.t === 'pt' && hover.i === i; c.fillStyle = on ? '#C62828' : '#2E7D32'; c.beginPath(); c.arc(p.x, p.y, on ? 7 : 5, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); });
    if (P.length > 1) P.forEach((p, i) => { if (P.length < 3 && i === P.length - 1) return; const q = P[(i + 1) % P.length], t = fmt(m(len(p, q))) + ' m', [mx, my] = sideLab(i); c.font = 'bold 11px Tahoma,Arial,sans-serif'; const tw = c.measureText(t).width + 10; const on = hover && hover.t === 'side' && hover.i === i; c.fillStyle = on ? '#FFF4C2' : 'rgba(255,255,255,0.95)'; c.strokeStyle = on ? '#C62828' : '#9AA5B1'; c.lineWidth = 1; c.fillRect(mx - tw / 2, my - 9, tw, 18); c.strokeRect(mx - tw / 2 + 0.5, my - 8.5, tw - 1, 17); c.fillStyle = '#1B1F23'; c.textAlign = 'center'; c.fillText(t, mx, my + 4); c.textAlign = 'left'; });
    // water source and inlet
    if (S.src) { const on = hover && hover.t === 'src'; c.fillStyle = '#1F5FA8'; c.beginPath(); c.arc(S.src.x, S.src.y, on ? 11 : 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 10px Tahoma,Arial,sans-serif'; c.textAlign = 'center'; c.fillText('W', S.src.x, S.src.y + 3.5); c.fillStyle = '#1F5FA8'; c.font = 'bold 10px Tahoma,Arial,sans-serif'; c.fillText({ well: 'well', borehole: 'borehole', canal: 'canal', river: 'river', tank: 'pond or tank' }[S.srcType] || 'source', S.src.x, S.src.y + 22); c.textAlign = 'left'; }
    if (g && S.src) { const on = hover && hover.t === 'inlet'; c.fillStyle = '#F2C230'; c.strokeStyle = '#5A4500'; c.lineWidth = 1.5; c.beginPath(); c.rect(g.inl.x - (on ? 7 : 5), g.inl.y - (on ? 7 : 5), on ? 14 : 10, on ? 14 : 10); c.fill(); c.stroke(); }
    // the moving cursor: crosshair and its position in metres
    if (cursor && !drag) { c.strokeStyle = 'rgba(198,40,40,0.35)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(cursor.x, 0); c.lineTo(cursor.x, h); c.moveTo(0, cursor.y); c.lineTo(w, cursor.y); c.stroke(); c.setLineDash([]); }
    if (cursor) { const t = 'x ' + fmt(m(cursor.x)) + ' m · y ' + fmt(m(cursor.y)) + ' m'; c.font = '10px Tahoma,Arial,sans-serif'; const tw = c.measureText(t).width + 10, bx = Math.min(w - tw - 4, cursor.x + 12), by = Math.max(4, cursor.y - 24); c.fillStyle = 'rgba(27,31,35,0.85)'; c.fillRect(bx, by, tw, 16); c.fillStyle = '#fff'; c.fillText(t, bx + 5, by + 12); }
    if (!P.length) { c.fillStyle = '#505050'; c.font = '13px Tahoma,Arial,sans-serif'; c.textAlign = 'center'; c.fillText('Click to place the corners of your field, or use "Make a rectangle" on the right.', w / 2, h / 2 - 8); c.fillText('Drag a corner to move it; click a side length to type it exactly.', w / 2, h / 2 + 12); c.textAlign = 'left'; }
    info();
  }
  // the layout inside the field: furrows, borders or basins; drip laterals; sprinklers; submain, mainline and valves
  function layout(c, g) {
    const sysS = S.sys === 'sid' ? S.sub : S.sys, Pp = S.pts;
    c.save(); c.beginPath(); Pp.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); c.clip();
    const along = (t, s) => ({ x: s * g.ux - t * g.uy, y: s * g.uy + t * g.ux });
    let spM = sysS === 'drip' ? S.row : sysS === 'spr' ? S.sprSl : sysS === 'furrow' ? S.row : sysS === 'border' ? 10 : 20, sp = px(spM), k = Math.max(1, Math.ceil(5 / sp));
    if (sysS === 'basin') { const n = Math.max(1, Math.round(m(g.hi - g.lo) / 40)); c.strokeStyle = '#8A6A3A'; c.lineWidth = 2; for (let i = 1; i < n; i++) { const s = g.lo + (g.hi - g.lo) * i / n, a = along(g.wlo - 5, s), b = along(g.whi + 5, s); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } }
    c.lineWidth = sysS === 'drip' ? 1.2 : sysS === 'spr' ? 1.6 : 1.4; c.strokeStyle = sysS === 'drip' ? '#1F5FA8' : sysS === 'spr' ? '#3A6EA5' : sysS === 'furrow' ? '#6B4F2A' : '#8A6A3A';
    let n = 0; for (let t = g.wlo + sp / 2; t < g.whi; t += sp * k) { const a = along(t, g.lo - 5), b = along(t, g.hi + 5); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); n++; }
    if (sysS === 'spr') { const ss = px(S.sprSs), kk = Math.max(1, Math.ceil(6 / ss)); c.fillStyle = '#1F5FA8'; for (let t = g.wlo + sp / 2; t < g.whi; t += sp * k) for (let s = g.lo + ss / 2; s < g.hi; s += ss * kk) { const q = along(t, s); if (!inside(q.x, q.y)) continue; c.beginPath(); c.arc(q.x, q.y, 2.2, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(31,95,168,0.12)'; c.beginPath(); c.arc(q.x, q.y, ss * kk * 0.65, 0, Math.PI * 2); c.stroke(); } }
    c.restore();
    // submain (or head ditch) along the inlet end of the run, mainline from the source
    const sEnd = (g.inl.x * g.ux + g.inl.y * g.uy) - g.lo < g.hi - (g.inl.x * g.ux + g.inl.y * g.uy) ? g.lo : g.hi, a = along(g.wlo, sEnd), b = along(g.whi, sEnd);
    c.strokeStyle = S.sys === 'sid' ? '#3A7BD5' : '#0A246A'; c.lineWidth = S.sys === 'sid' ? 6 : 3.5; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    if (S.src) { c.strokeStyle = '#0A246A'; c.lineWidth = 3; c.setLineDash([8, 4]); c.beginPath(); c.moveTo(S.src.x, S.src.y); c.lineTo(g.inl.x, g.inl.y); c.stroke(); c.setLineDash([]); }
    const lab = (t, x, y, col) => { c.font = 'bold 10px Tahoma,Arial,sans-serif'; const tw = c.measureText(t).width + 8; c.fillStyle = 'rgba(255,255,255,0.92)'; c.fillRect(x - tw / 2, y - 10, tw, 15); c.fillStyle = col || '#0A246A'; c.textAlign = 'center'; c.fillText(t, x, y + 1); c.textAlign = 'left'; };
    if (S.src) { const dx = g.inl.x - S.src.x, dy = g.inl.y - S.src.y, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl, sg = ny > 0 ? -1 : 1; lab('mainline ' + fmt(g.main) + ' m', (S.src.x + g.inl.x) / 2 + nx * 16 * sg, (S.src.y + g.inl.y) / 2 + ny * 16 * sg + 4); }
    { const inw = sEnd === g.lo ? 1 : -1, ti = g.inl.x * -g.uy + g.inl.y * g.ux, t0 = g.wlo + (g.whi - g.wlo) * (ti < (g.wlo + g.whi) / 2 ? 0.86 : 0.14), q = along(t0, sEnd); lab((S.sys === 'sid' ? 'head ditch ' : 'submain ') + fmt(g.wid) + ' m', q.x + inw * 52 * g.ux, q.y + inw * 52 * g.uy + 4); }
    const mid = along((g.wlo + g.whi) / 2, (g.lo + g.hi) / 2);
    lab((S.sys === 'sid' ? (S.sub === 'furrow' ? 'furrows ' : S.sub === 'basin' ? 'basins, run ' : 'borders ') : sysS === 'drip' ? 'laterals ' : 'sprinkler laterals ') + fmt(g.run) + ' m', mid.x, mid.y, '#12303A');
  }
  // where the length of a side is written: just outside the field, on the middle of the side
  function sideLab(i) {
    const P = S.pts, a = P[i], b = P[(i + 1) % P.length], d = len(a, b) || 1; let nx = (b.y - a.y) / d, ny = -(b.x - a.x) / d, f = 0.5;
    if (S.src && P.length > 2 && S.inlet !== undefined) { const inl = S.inlet || nearestOnEdge(S.src).p; if (len(inl, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }) < 40) f = len(inl, a) > len(inl, b) ? 0.22 : 0.78; }
    const mx = a.x + (b.x - a.x) * f, my = a.y + (b.y - a.y) * f;
    if (P.length > 2 && inside(mx + nx * 4, my + ny * 4)) { nx = -nx; ny = -ny; } return P.length > 2 ? [mx + nx * 15, my + ny * 15] : [mx, my - 12];
  }
  function info() {
    const el = document.getElementById('skInfo'); if (!el) return; const g = geom();
    el.innerHTML = g ? '<b>' + fmt(g.area / 10000, 2) + ' ha</b> (' + Math.round(g.area).toLocaleString('en-US') + ' m²) · run ' + fmt(g.run) + ' m · width ' + fmt(g.wid) + ' m · perimeter ' + fmt(g.perim) + ' m' + (S.src ? ' · mainline ' + fmt(g.main) + ' m' : ' · place the water source') : 'Draw at least three corners.';
    const sm = document.getElementById('skSum'); if (sm) sm.innerHTML = summary();
  }

  // ------------------------------------------------------------------ the mouse: add, drag and type
  function at(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * CW / r.width, y: (e.clientY - r.top) * CH / r.height }; }
  function hit(p) {
    for (let i = 0; i < S.pts.length; i++) if (len(S.pts[i], p) < 9) return { t: 'pt', i };
    if (S.src && len(S.src, p) < 12) return { t: 'src' };
    const g = geom(); if (g && S.src && len(g.inl, p) < 9) return { t: 'inlet' };
    if (S.pts.length > 1) for (let i = 0; i < S.pts.length; i++) { if (S.pts.length < 3 && i === S.pts.length - 1) continue; const [lx, ly] = sideLab(i); if (Math.abs(lx - p.x) < 26 && Math.abs(ly - p.y) < 11) return { t: 'side', i }; }
    return null;
  }
  function wire() {
    cv.addEventListener('pointermove', e => {
      const p = at(e); cursor = p;
      if (drag) { const q = { x: Math.max(4, Math.min(CW - 4, snap(p.x))), y: Math.max(4, Math.min(CH - 4, snap(p.y))) }; if (drag.t === 'pt') S.pts[drag.i] = q; else if (drag.t === 'src') S.src = q; else if (drag.t === 'inlet') S.inlet = nearestOnEdge(p).p; }
      else { hover = hit(p); cv.style.cursor = hover ? (hover.t === 'side' ? 'text' : 'move') : 'crosshair'; }
      draw();
    });
    cv.addEventListener('pointerleave', () => { cursor = null; hover = null; draw(); });
    cv.addEventListener('pointerdown', e => {
      const p = at(e), h = hit(p); closeEdit();
      if (h && h.t === 'side') { openEdit(h.i); return; }
      if (h && h.t !== 'side') { drag = h; cv.setPointerCapture(e.pointerId); return; }
      const q = { x: snap(p.x), y: snap(p.y) };
      if (S.mode === 'src') { S.src = q; S.inlet = null; }
      else if (S.mode === 'inlet') { if (S.pts.length > 2) S.inlet = nearestOnEdge(p).p; }
      else { if (S.pts.length > 2) { const ne = nearestOnEdge(p); if (ne.d < 10) { S.pts.splice(ne.i + 1, 0, q); draw(); return; } } S.pts.push(q); S.inlet = null; }
      draw();
    });
    cv.addEventListener('pointerup', () => { drag = null; draw(); });
    cv.addEventListener('dblclick', e => { const h = hit(at(e)); if (h && h.t === 'pt' && S.pts.length > 3) { S.pts.splice(h.i, 1); S.inlet = null; draw(); } });
  }
  // type the exact length of a side: the second corner moves along the side
  function openEdit(i) {
    const a = S.pts[i], b = S.pts[(i + 1) % S.pts.length], r = cv.getBoundingClientRect(), host = cv.parentNode;
    edit = document.createElement('div'); edit.className = 'skEdit';
    edit.innerHTML = '<input type="number" step="any" min="0.1" value="' + fmt(m(len(a, b)), 1) + '"> m <button class="btn">Set</button>';
    host.style.position = 'relative'; host.appendChild(edit);
    const sx = r.width / CW; edit.style.left = Math.max(0, ((a.x + b.x) / 2) * sx - 70) + 'px'; edit.style.top = (((a.y + b.y) / 2) * sx + 12) + 'px';
    const inp = edit.querySelector('input'), go = () => { const v = parseFloat(inp.value); if (isFinite(v) && v > 0) { const d = len(a, b) || 1, k = px(v) / d, nb = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; if (nb.x < 0 || nb.y < 0 || nb.x > CW || nb.y > CH) { const ns = SC.find(s => s >= S.scale * Math.max(nb.x / CW, nb.y / CH, 1) * 1.1) || 100; const f = S.scale / ns; S.scale = ns; S.pts = S.pts.map(p => ({ x: p.x * f, y: p.y * f })); if (S.src) S.src = { x: S.src.x * f, y: S.src.y * f }; const sel = document.getElementById('skScale'); if (sel) sel.value = ns; return openAfter(i, v); } S.pts[(i + 1) % S.pts.length] = nb; S.inlet = null; } closeEdit(); draw(); };
    edit.querySelector('button').onclick = go; inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); if (e.key === 'Escape') closeEdit(); }); setTimeout(() => { inp.focus(); inp.select(); }, 10);
  }
  function openAfter(i, v) { closeEdit(); openEdit(i); const inp = edit && edit.querySelector('input'); if (inp) { inp.value = v; edit.querySelector('button').click(); } }
  function closeEdit() { if (edit) { edit.remove(); edit = null; } }

  // ------------------------------------------------------------------ the questions, step by step
  const STEPS = ['Field', 'Water', 'Crop', 'Soil', 'System', 'Running', 'Summary'];
  const opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(l) + '</option>';
  const num = (id, label, v, unit, st, note) => '<div class="pr"><label for="' + id + '">' + label + '</label><div class="skin"><input type="number" id="' + id + '" value="' + v + '" step="' + (st || 'any') + '"> <span>' + unit + '</span></div>' + (note ? '<div class="pnote">' + note + '</div>' : '') + '</div>';
  const sel = (id, label, opts, note) => '<div class="pr"><label for="' + id + '">' + label + '</label><select id="' + id + '">' + opts + '</select>' + (note ? '<div class="pnote">' + note + '</div>' : '') + '</div>';
  function stepHtml() {
    const s = S.step, L = LIST || { crops: [], soils: [] };
    if (s === 0) return '<h4>1. Your field</h4><p class="pnote">Draw the corners on the grid, or give the size and make a rectangle. Drag any corner to move it; click a side length to type it exactly; double-click a corner to remove it.</p>' +
      num('qL', 'Field length', S.L, 'm') + num('qW', 'Field width', S.Wd, 'm') + '<button class="btn" id="qRect">Make a rectangle of this size</button>' +
      num('qSlope', 'Ground slope', S.slope, '%', 0.05, 'Fall of the ground per 100 m.') + sel('qSlopeDir', 'The ground falls', opt('run', 'along the run (the length of the laterals or furrows)', S.slopeDir) + opt('across', 'across the run', S.slopeDir) + opt('level', 'nowhere: it is level', S.slopeDir));
    if (s === 1) return '<h4>2. The water</h4><p class="pnote">Choose "Water source" above the grid and click where the water is; drag the yellow inlet along the edge of the field to where the pipe or the canal enters.</p>' +
      sel('qSrc', 'Where does the water come from?', opt('well', 'a well', S.srcType) + opt('borehole', 'a borehole', S.srcType) + opt('canal', 'a canal', S.srcType) + opt('river', 'a river or stream', S.srcType) + opt('tank', 'a pond or a tank', S.srcType)) +
      num('qLift', 'How high must the water be lifted to the field?', S.lift, 'm', 0.5, 'From the water level to the field surface.') + num('qSup', 'How much water can the source give?', S.supply, 'L/s', 0.5, 'The pump or the canal share; 1 L/s = 3.6 m³/h.') + num('qHrs', 'How many hours a day can you irrigate?', S.hours, 'h', 0.5);
    if (s === 2) return '<h4>3. The crop</h4>' + sel('qCrop', 'Which crop will you grow?', L.crops.map(q => opt(q[0], q[1], S.crop)).join('')) +
      num('qRow', 'Distance between the rows', S.row, 'm', 0.05, 'Drip laterals follow the rows; furrows are spaced at the rows.') + num('qPlant', 'Distance between plants in a row', S.plant, 'm', 0.05, 'Drip emitters are spaced at the plants (or closer for a continuous wet strip).');
    if (s === 3) return '<h4>4. The soil</h4>' + sel('qSoil', 'What is the soil of the field?', L.soils.map(q => opt(q[0], q[1], S.soil)).join(''), 'The soil decides the intake, the water it holds and the wetted bulb.') +
      sel('qPan', 'Is there a hard or compact layer below the topsoil?', opt('no', 'no', S.pan ? 'yes' : 'no') + opt('yes', 'yes', S.pan ? 'yes' : 'no'), 'A compact layer lowers the rate the soil accepts (sprinklers).');
    if (s === 4) return '<h4>5. The irrigation system and the pipes</h4>' +
      sel('qSys', 'Which system?', opt('sid:border', 'Surface: border strips', S.sys + ':' + S.sub) + opt('sid:furrow', 'Surface: furrows', S.sys + ':' + S.sub) + opt('sid:basin', 'Surface: basins', S.sys + ':' + S.sub) + opt('drip:', 'Drip', S.sys === 'drip' ? 'drip:' : '') + opt('spr:', 'Sprinklers', S.sys === 'spr' ? 'spr:' : '')) +
      sel('qDir', 'Run the laterals (or furrows)', opt('length', 'along the length of the field', S.dir) + opt('across', 'across the field', S.dir), 'Longer laterals need fewer pipes but lose more pressure.') +
      (S.sys === 'drip' ? sel('qDep', 'Where do the laterals lie?', [[0, 'on the surface'], [15, 'buried 15 cm'], [25, 'buried 25 cm'], [45, 'buried 45 cm'], [55, 'buried 55 cm']].map(q => opt(q[0], q[1], S.dep)).join('')) + sel('qKind', 'Emitter', [['inline', 'inline emitters'], ['online', 'online emitters'], ['tape', 'drip tape'], ['pc', 'pressure-compensating']].map(q => opt(q[0], q[1], S.kind)).join('')) : '') +
      (S.sys === 'spr' ? sel('qSprSys', 'Sprinkler system', [['solid', 'solid-set'], ['hand', 'hand-move'], ['pivot', 'center pivot'], ['linear', 'linear-move'], ['gun', 'traveling gun']].map(q => opt(q[0], q[1], S.sprSys)).join('')) + sel('qSprType', 'Sprinkler', [['impact', 'impact sprinkler'], ['spray', 'rotating spray'], ['micro', 'micro-sprinkler'], ['gun', 'big gun']].map(q => opt(q[0], q[1], S.sprType)).join('')) + num('qSs', 'Spacing along the lateral', S.sprSs, 'm', 0.5) + num('qSl', 'Spacing between laterals', S.sprSl, 'm', 0.5) : '');
    if (s === 5) return '<h4>6. How you will run it</h4>' + (S.sys === 'drip' ? num('qIntv', 'Irrigate every', S.intv, 'days', 1) : '') +
      sel('qAuto', 'Who opens the valves?', opt('no', 'the farmer, on the predicted dates', S.auto ? 'yes' : 'no') + opt('yes', 'an automatic controller with the soil sensor', S.auto ? 'yes' : 'no')) + '<p class="pnote">The dates come from the soil sensor and the trigger in Properties; the design decides the depth and the time of each irrigation.</p>';
    return '<h4>7. Summary</h4><div id="skSum">' + summary() + '</div>';
  }
  function summary() {
    const g = geom(); if (!g) return '<p class="pnote">Draw the field first.</p>';
    const L = LIST || { crops: [], soils: [] }, cn = (L.crops.find(q => q[0] === S.crop) || [0, S.crop])[1], sn = (L.soils.find(q => q[0] === S.soil) || [0, S.soil])[1];
    const sysN = S.sys === 'sid' ? 'Surface irrigation: ' + ({ border: 'border strips', furrow: 'furrows', basin: 'basins' }[S.sub]) : S.sys === 'drip' ? 'Drip, laterals ' + (S.dep ? 'buried ' + S.dep + ' cm' : 'on the surface') : 'Sprinklers (' + S.sprSys + ', ' + S.sprType + ')';
    const nLat = S.sys === 'drip' ? Math.max(1, Math.floor(g.wid / S.row)) : S.sys === 'spr' ? Math.max(1, Math.floor(g.wid / S.sprSl)) : 0;
    const rows = [['Field', fmt(g.area / 10000, 2) + ' ha, run ' + fmt(g.run) + ' m × width ' + fmt(g.wid) + ' m, slope ' + fmt(S.slopeDir === 'level' ? 0 : S.slope, 2) + ' %'], ['Water', S.srcType + ', lift ' + fmt(S.lift, 1) + ' m, ' + fmt(S.supply, 1) + ' L/s, ' + fmt(S.hours, 1) + ' h a day'], ['Mainline', S.src ? fmt(g.main) + ' m from the source to the inlet' : 'place the water source'], ['Crop', cn + ', rows ' + fmt(S.row, 2) + ' m, plants ' + fmt(S.plant, 2) + ' m'], ['Soil', sn + (S.pan ? ', compact layer below' : '')], ['System', sysN], ['Layout', (S.sys === 'sid' ? 'run' : 'laterals') + ' ' + fmt(g.run) + ' m ' + (S.dir === 'length' ? 'along the length' : 'across the field') + (nLat ? ', about ' + nLat + ' laterals' : '')]];
    return '<table class="tbl" style="width:100%">' + rows.map(r => '<tr><td>' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>').join('') + '</table><p class="pnote">Press <b>Turn the sketch into the design</b>: the design layer opens with these inputs; check them and press Run simulation.</p>';
  }
  function readStep() {
    const v = id => { const e = document.getElementById(id); return e ? e.value : null; }, n = (id, d) => { const x = parseFloat(v(id)); return isFinite(x) ? x : d; };
    if (v('qL') != null) { S.L = Math.max(1, n('qL', S.L)); S.Wd = Math.max(1, n('qW', S.Wd)); S.slope = Math.max(0, n('qSlope', S.slope)); S.slopeDir = v('qSlopeDir'); }
    if (v('qSrc') != null) { S.srcType = v('qSrc'); S.lift = Math.max(0, n('qLift', S.lift)); S.supply = Math.max(0.1, n('qSup', S.supply)); S.hours = Math.max(1, Math.min(24, n('qHrs', S.hours))); }
    if (v('qCrop') != null) { S.crop = v('qCrop'); S.row = Math.max(0.05, n('qRow', S.row)); S.plant = Math.max(0.03, n('qPlant', S.plant)); }
    if (v('qSoil') != null) { S.soil = v('qSoil'); S.pan = v('qPan') === 'yes'; }
    if (v('qSys') != null) { const [a, b] = v('qSys').split(':'); S.sys = a; if (b) S.sub = b; S.dir = v('qDir') || S.dir; if (v('qDep') != null) { S.dep = +v('qDep'); S.kind = v('qKind'); } if (v('qSprSys') != null) { S.sprSys = v('qSprSys'); S.sprType = v('qSprType'); S.sprSs = Math.max(1, n('qSs', S.sprSs)); S.sprSl = Math.max(1, n('qSl', S.sprSl)); } }
    if (v('qAuto') != null) { S.auto = v('qAuto') === 'yes'; if (v('qIntv') != null) S.intv = Math.max(1, Math.round(n('qIntv', S.intv))); }
  }
  function showStep() {
    const host = document.getElementById('skQ'); if (!host) return; host.innerHTML = stepHtml();
    document.querySelectorAll('#skSteps button').forEach((b, i) => b.classList.toggle('on', i === S.step));
    host.querySelectorAll('input,select').forEach(el => el.addEventListener('change', () => { readStep(); if (el.id === 'qSys') showStep(); if (el.id === 'qCrop') { const r = (LIST.rows || {})[S.crop]; if (r) { S.row = r; const q = document.getElementById('qRow'); if (q) q.value = r; } } draw(); }));
    const rb = document.getElementById('qRect'); if (rb) rb.onclick = () => { readStep(); rectangle(); const s2 = document.getElementById('skScale'); if (s2) s2.value = S.scale; draw(); };
    document.getElementById('skBack').disabled = S.step === 0; document.getElementById('skNext').textContent = S.step === STEPS.length - 1 ? 'Back to the start' : 'Next question';
    draw();
  }

  // ------------------------------------------------------------------ the window
  function open() {
    LIST = E.json("({crops:Object.keys(CROPS).map(function(k){return [k,CROPS[k].label]}),soils:DATA.soils.map(function(k){return [k,DATA.soil_labels[k]]}),crop:state.crop,soil:state.soil,rows:Object.fromEntries(Object.keys(CROPS).map(function(k){var r=(typeof IRCROP!=='undefined'&&IRCROP[k])||{};return [k,Math.max(0.2,r.row||0.75)]})),sys:SID.sys,lift:IRX.lift,Qs:DRP.Qs})") || { crops: [], soils: [], rows: {} };
    if (!S.crop) { S.crop = LIST.crop; S.row = (LIST.rows || {})[S.crop] || S.row; } if (!S.soil) S.soil = LIST.soil;
    UI.modal({ title: 'Field sketch to design', icon: 'pipe', width: 'min(1120px,97vw)', html:
      '<div class="skwrap"><div class="skleft"><div class="skbar"><div class="seg" id="skMode"><button data-m="field"' + (S.mode === 'field' ? ' class="on"' : '') + '>Field corners</button><button data-m="src"' + (S.mode === 'src' ? ' class="on"' : '') + '>Water source</button><button data-m="inlet"' + (S.mode === 'inlet' ? ' class="on"' : '') + '>Inlet</button></div>' +
      '<button class="btn" id="skUndo">Undo corner</button><button class="btn" id="skClear">Clear</button><label>Grid square <select id="skScale">' + SC.map(v => '<option value="' + v + '"' + (v === S.scale ? ' selected' : '') + '>' + v + ' m</option>').join('') + '</select></label></div>' +
      '<div class="skcv"><canvas id="skCv" width="' + CW * 2 + '" height="' + CH * 2 + '"></canvas></div><div id="skInfo" class="skinfo"></div></div>' +
      '<div class="skright"><div class="seg skst" id="skSteps">' + STEPS.map((s, i) => '<button data-s="' + i + '">' + (i + 1) + '. ' + s + '</button>').join('') + '</div><div id="skQ" class="skq"></div>' +
      '<div class="skbtns"><button class="btn" id="skBack">Back</button><button class="btn" id="skNext">Next question</button></div></div></div>',
      buttons: [{ label: 'Turn the sketch into the design', pri: true, act: () => apply() }, { label: 'Close' }] });
    cv = document.getElementById('skCv'); wire();
    document.getElementById('skMode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.mode = b.dataset.m; document.querySelectorAll('#skMode button').forEach(x => x.classList.toggle('on', x === b)); });
    document.getElementById('skUndo').onclick = () => { S.pts.pop(); S.inlet = null; draw(); };
    document.getElementById('skClear').onclick = () => { S.pts = []; S.src = null; S.inlet = null; draw(); };
    document.getElementById('skScale').onchange = e => { const ns = +e.target.value, f = S.scale / ns; S.scale = ns; S.pts = S.pts.map(p => ({ x: p.x * f, y: p.y * f })); if (S.src) S.src = { x: S.src.x * f, y: S.src.y * f }; S.inlet = null; draw(); };
    document.getElementById('skSteps').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; readStep(); S.step = +b.dataset.s; showStep(); });
    document.getElementById('skBack').onclick = () => { readStep(); S.step = Math.max(0, S.step - 1); showStep(); };
    document.getElementById('skNext').onclick = () => { readStep(); S.step = S.step === STEPS.length - 1 ? 0 : S.step + 1; showStep(); };
    showStep();
  }
  function apply() {
    readStep(); const g = geom(); if (!g) { UI.toast('Draw the field first (at least three corners)'); return false; }
    const cl = (v, a, b) => Math.max(a, Math.min(b, v)), ha = Math.max(0.0001, g.area / 10000), slope = S.slopeDir === 'level' ? 0 : S.slope, run = Math.round(g.run), wid = Math.round(g.wid), main = Math.round(S.src ? g.main : 120);
    const st = {}; if (S.crop && S.crop !== LIST.crop) st.crop = S.crop; if (S.soil && S.soil !== LIST.soil) st.soil = S.soil;
    const id = S.sys, common = 'IRX.lift=' + cl(S.lift, 0, 500) + ';IRX.Lm=' + cl(main, 0, 10000) + ';IRX.src=' + JSON.stringify(S.srcType === 'canal' || S.srcType === 'river' ? 'canal' : S.srcType === 'tank' ? 'tank' : 'well') + ';SPD.top=' + cl(S.hours, 1, 24) + ';SPD.pan=' + (S.pan ? 'true' : 'false') + ';if(window.__FARM)__FARM.auto=' + (S.auto ? 'true' : 'false') + ';';
    let js;
    if (id === 'sid') { st.method = 'M02_Surface'; js = "(function(){sidSys('" + S.sub + "');SID.L=" + cl(run, 5, 3000) + ";SID.Wf=" + cl(wid, 1, 5000) + ";SID.S=" + cl(slope, 0.001, 10) + ";SID.Qs=" + cl(S.supply, 0.5, 2000) + (S.sub === 'furrow' ? ";SID.w=" + cl(S.row < 0.5 ? 0.75 : S.row, 0.3, 2.5) : '') + ";SID.preset=null;SID.autoQ=true;" + common + "})()"; }
    else if (id === 'drip') { const mm = { 15: 'M04_Drip10-20cm', 25: 'M06_Drip20-30cm', 45: 'M09_Drip40-50cm', 55: 'M10_Drip50-60cm' }[S.dep]; if (mm) st.method = mm;
      js = "(function(){DRP.LL=" + cl(run, 1, 1000) + ";DRP.Sl=" + cl(S.row, 0.1, 10) + ";DRP.Se=" + cl(S.plant, 0.05, 5) + ";DRP.Af=" + cl(+ha.toFixed(4), 0.0001, 10000) + ";DRP.Qs=" + cl(S.supply, 0.1, 2000) + ";DRP.intv=" + cl(S.intv, 1, 60) + ";DRP.kind=" + JSON.stringify(S.kind) + ";" + (S.dep ? "DRP.surf=false;DRP.dep=" + S.dep : "DRP.surf=true") + ";IRX.fd.drip={on:true,L:" + run + ",W:" + wid + "};" + common + "})()"; }
    else { st.method = 'M01_Overhead'; js = "(function(){SPR.Af=" + cl(+ha.toFixed(4), 0.001, 10000) + ";SPR.S=" + cl(slope, 0, 60) + ";SPR.Qs=" + cl(S.supply, 0.1, 5000) + ";SPR.Ss=" + cl(S.sprSs, 1, 120) + ";SPR.Sl=" + cl(S.sprSl, 1, 120) + ";SPR.type=" + JSON.stringify(S.sprType) + ";SPD.sys=" + JSON.stringify(S.sprSys) + ";IRX.LLs=" + cl(run, 5, 2000) + ";IRX.fd.spr={on:true,L:" + run + ",W:" + wid + "};" + common + "})()"; }
    if (Object.keys(st).length) E.set(st);
    // the crop and soil settle first (they set their own defaults), then the answers of the sketch are written over them
    const put = () => { E.ev(js); E.ev("window.DESIGN_RUN&&(DESIGN_RUN['" + id + "'].on=false,DESIGN_RUN['" + id + "'].why='field sketch applied')"); };
    put(); setTimeout(put, 400); setTimeout(put, 1200);
    UI.log('Field sketch applied to ' + Layers.nameOf(id) + ': ' + ha.toFixed(2) + ' ha, run ' + run + ' m, width ' + wid + ' m, mainline ' + main + ' m');
    Layers.open(id); UI.toast('Sketch applied: check the inputs and press Run simulation'); return true;
  }
  // the three systems side by side on the present field and soil
  function compare() {
    const R = E.json("(function(){var a=sidRun(),b=drRun(),c=spRun();return [['Surface (' + SID.sys + ')',a.Ea,a.Es,a.dp,a.ro,a.tco/60],['Drip',b.Ea,b.Es,b.dp,b.ev||0,b.t],['Sprinkler',c.Ea,c.Es,c.dp,c.ro,c.T/60]]})()");
    if (!R) { UI.toast('The designs are not ready yet'); return; }
    const p = v => (v * 100).toFixed(1) + ' %';
    UI.modal({ title: 'Irrigation systems compared on this field', icon: 'chart', width: 'min(640px,94vw)', html: '<table class="tbl" style="width:100%"><tr><th>System</th><th>Application efficiency</th><th>Root zone filled</th><th>Deep percolation</th><th>Runoff / evaporation</th><th>Time per irrigation</th></tr>' +
      R.map(r => '<tr><td>' + UI.esc(r[0]) + '</td><td><b>' + p(r[1]) + '</b></td><td>' + p(r[2]) + '</td><td>' + p(r[3]) + '</td><td>' + p(r[4]) + '</td><td>' + r[5].toFixed(1) + ' h</td></tr>').join('') + '</table><p class="pnote">Each system with the inputs it has now in its design layer, on the same soil, crop and trigger. Open a design layer to change them and run it.</p>' });
  }
  return { open, compare, _S: S };
})();
