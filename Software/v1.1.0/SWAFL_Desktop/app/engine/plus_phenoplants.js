/* SWAFL 1.1 layer P1 Deterministic phenotyping: life-like drawing of the shoot of the model plant.
   The plant is drawn from the same numbers the model gives (leaf areas, leaf angles, height, senescence, leaf rolling, grain mass),
   with shaded blades, a midrib and veins, leaf sheaths and nodes on the stem, and the ear, spike, panicle or pods of the species.
   It is a rendering of the simulation, not a photograph. */
'use strict';
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hex = h => { if (h[0] === 'r') { const m = h.match(/[\d.]+/g); return [+m[0], +m[1], +m[2]]; } const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgb = a => 'rgb(' + Math.round(clamp(a[0], 0, 255)) + ',' + Math.round(clamp(a[1], 0, 255)) + ',' + Math.round(clamp(a[2], 0, 255)) + ')';
  const mixc = (a, b, t) => { const x = hex(a), y = hex(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); };
  const lit = (a, k) => { const x = hex(a); return rgb(k >= 0 ? [x[0] + (255 - x[0]) * k, x[1] + (255 - x[1]) * k, x[2] + (255 - x[2]) * k] : [x[0] * (1 + k), x[1] * (1 + k), x[2] * (1 + k)]); };
  const GREEN = { maize: '#3E8A2C', sorghum: '#4B9034', wheat: '#6E9F3A', bean: '#3F8C3A' };
  const bez = (t, a, c, b) => { const m = 1 - t; return m * m * a + 2 * m * t * c + t * t * b; };

  // one blade: the centre line is a quadratic curve from the stem to the tip; the width is a function of the distance along it
  function blade(c, sp, kind, L, geo, o) {
    const { xc, ya, tipx, tipy, cxp, cyp, wmax } = geo, N0 = 18, pts = [];
    for (let i = 0; i <= N0; i++) {
      const t = i / N0, px = bez(t, xc, cxp, tipx), py = bez(t, ya, cyp, tipy); let w;
      if (kind === 'bean') w = wmax * 1.7 * Math.pow(Math.sin(Math.PI * clamp(t, 0.02, 1)), 0.62) * (t < 0.3 ? 0.35 : 1);
      else { w = wmax * Math.pow(Math.sin(Math.PI * Math.pow(Math.max(t, 0.015), 0.5)), 0.9) * (1 - 0.35 * t); if (kind === 'maize') w *= 1 + 0.07 * Math.sin(t * 26 + L.j * 1.7) * t; }
      pts.push([px, py, w]);
    }
    // normals of the centre line, so that the width is taken across the blade, not up the page
    const nrm = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N0, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; });
    const edge = (sg) => pts.map((p, i) => [p[0] + sg * nrm[i][0] * p[2], p[1] + sg * nrm[i][1] * p[2]]);
    const e1 = edge(1), e2 = edge(-1);
    const g = c.createLinearGradient(xc, ya, tipx, tipy), base = o.leaf, gf = clamp(L.gf, 0, 1);
    if (o.flat) { c.fillStyle = o.flat; } else {
      g.addColorStop(0, lit(base, -0.30)); g.addColorStop(Math.min(0.45, gf * 0.5), base); g.addColorStop(Math.max(0.05, gf * 0.92), lit(base, 0.14));
      if (gf < 0.98) { g.addColorStop(Math.min(0.97, gf), '#C9BA4C'); g.addColorStop(1, '#8A6A34'); }
      c.fillStyle = g;
    }
    if (o.shadow) { c.shadowColor = 'rgba(25,45,15,0.35)'; c.shadowBlur = 3; c.shadowOffsetX = 1.2; c.shadowOffsetY = 1.8; }
    c.beginPath(); e1.forEach((q, i) => { i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); for (let i = N0; i >= 0; i--) c.lineTo(e2[i][0], e2[i][1]); c.closePath(); c.fill();
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
    if (o.flat) return;
    // the half of the blade on the far side of the midrib is lighter (light comes from the upper left)
    c.fillStyle = 'rgba(255,255,255,0.10)'; c.beginPath(); pts.forEach((p, i) => { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); for (let i = N0; i >= 0; i--) c.lineTo(e1[i][0], e1[i][1]); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,50,15,0.38)'; c.lineWidth = 0.6; c.beginPath(); e1.forEach((q, i) => { i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); c.beginPath(); e2.forEach((q, i) => { i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke();
    // midrib and veins
    c.strokeStyle = mixc(base, '#F3F7D8', 0.55); c.lineWidth = Math.max(0.6, wmax * 0.16); c.beginPath(); for (let i = 0; i <= N0 - 2; i++) { const p = pts[i]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
    if (wmax > 2.2) { c.strokeStyle = 'rgba(25,60,20,0.22)'; c.lineWidth = 0.5; for (const f of [-0.55, 0.55]) { c.beginPath(); for (let i = 1; i <= N0 - 3; i++) { const p = pts[i], q = [p[0] + f * nrm[i][0] * p[2], p[1] + f * nrm[i][1] * p[2]]; i > 1 ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } c.stroke(); } }
  }
  // bean: a petiole and three leaflets
  function trifoliate(c, L, geo, o) {
    const { xc, ya, tipx, tipy, cxp, cyp, wmax } = geo, jx = bez(0.5, xc, cxp, tipx), jy = bez(0.5, ya, cyp, tipy);
    c.strokeStyle = mixc(o.leaf, '#E8F0B8', 0.25); c.lineWidth = 1.1; c.beginPath(); c.moveTo(xc, ya); c.quadraticCurveTo(cxp, cyp, jx, jy); c.stroke();
    const ang = Math.atan2(tipy - jy, tipx - jx), len = Math.hypot(tipx - jx, tipy - jy) * 1.05 + 4, wd = Math.max(2.5, wmax * 1.5);
    [[0, 1, 1], [-0.85, 0.78, 0.9], [0.85, 0.78, 0.9]].forEach(q => {
      c.save(); c.translate(jx, jy); c.rotate(ang + q[0]); const ln = len * q[1], w2 = wd * q[2];
      const g = c.createLinearGradient(0, 0, ln, 0), gf = clamp(L.gf, 0, 1); if (o.flat) c.fillStyle = o.flat; else { g.addColorStop(0, lit(o.leaf, -0.28)); g.addColorStop(Math.max(0.1, gf * 0.9), lit(o.leaf, 0.1)); if (gf < 0.98) { g.addColorStop(Math.min(0.97, gf), '#C9BA4C'); g.addColorStop(1, '#8A6A34'); } c.fillStyle = g; }
      if (o.shadow) { c.shadowColor = 'rgba(25,45,15,0.35)'; c.shadowBlur = 3; c.shadowOffsetX = 1; c.shadowOffsetY = 1.6; }
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(ln * 0.2, -w2 * 1.1, ln * 0.75, -w2 * 0.95, ln, 0); c.bezierCurveTo(ln * 0.75, w2 * 0.95, ln * 0.2, w2 * 1.1, 0, 0); c.closePath(); c.fill(); c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
      if (!o.flat) { c.strokeStyle = mixc(o.leaf, '#F3F7D8', 0.5); c.lineWidth = 0.7; c.beginPath(); c.moveTo(0, 0); c.lineTo(ln * 0.95, 0); c.stroke(); c.strokeStyle = 'rgba(25,60,20,0.25)'; c.lineWidth = 0.5; for (let k = 1; k <= 3; k++) { const x = ln * k / 4.2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + ln * 0.12, -w2 * 0.7 * (1 - k / 5)); c.moveTo(x, 0); c.lineTo(x + ln * 0.12, w2 * 0.7 * (1 - k / 5)); c.stroke(); } }
      c.restore();
    });
  }
  // the organ of the grain
  function organ(c, kind, res, d, xc, yg, s, o) {
    const sp = res.sp, Hs = res.H[d] * s, Wgm = Math.max(1, res.Wg[N_() - 1] || 1), gfrac = clamp(res.Wg[d] / Wgm, 0, 1), has = res.Wg[d] > 0.3, full = res.nLeaf[d] >= sp.nLeaf * 0.93;
    if (kind === 'maize') {
      if (full) { c.strokeStyle = '#D6C676'; c.lineWidth = Math.max(0.8, Hs * 0.004); for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(xc, yg - Hs); c.quadraticCurveTo(xc + k * Hs * 0.03, yg - Hs - Hs * 0.07, xc + k * Hs * 0.055, yg - Hs - Hs * 0.04 + Math.abs(k) * Hs * 0.012); c.stroke(); } }
      if (has) { const ey = yg - Hs * 0.55, el = Hs * (0.07 + 0.11 * gfrac), ew = Hs * (0.022 + 0.03 * gfrac); c.save(); c.translate(xc + Hs * 0.02, ey); c.rotate(0.55); const g = c.createLinearGradient(-ew, 0, ew, 0); g.addColorStop(0, lit(mixc('#9DBF5A', '#D9C98A', gfrac), -0.12)); g.addColorStop(1, lit(mixc('#9DBF5A', '#D9C98A', gfrac), 0.15)); c.fillStyle = g; c.beginPath(); c.ellipse(0, -el / 2, ew, el / 2, 0, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(80,60,20,0.35)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, -el); c.lineTo(0, 0); c.stroke(); c.restore(); }
    } else if (kind === 'wheat' || kind === 'sorghum') {
      if (!full) return; const hx = xc, hy = yg - Hs;
      if (kind === 'wheat') { const sl = Hs * 0.17, sw = Math.max(1.6, Hs * 0.022), col = mixc('#8DB24A', '#D9B85A', gfrac); c.fillStyle = col; c.strokeStyle = 'rgba(90,70,20,0.45)'; c.lineWidth = 0.5; for (let k = 0; k < 9; k++) { const yy = hy - sl * (k / 8.5), side = k % 2 ? 1 : -1; c.beginPath(); c.ellipse(hx + side * sw * 0.45, yy, sw * 0.5, sl / 17, side * 0.3, 0, 6.3); c.fill(); c.stroke(); c.strokeStyle = mixc('#A8C070', '#D8C070', gfrac); c.lineWidth = 0.5; c.beginPath(); c.moveTo(hx + side * sw * 0.7, yy); c.lineTo(hx + side * sw * 0.7 + side * sl * 0.12, yy - sl * 0.32); c.stroke(); c.strokeStyle = 'rgba(90,70,20,0.45)'; } }
      else { const pl = Hs * 0.15, pw = Hs * 0.045, col = mixc('#7FA343', '#A4502D', gfrac); const g = c.createRadialGradient(hx - pw * 0.3, hy - pl * 0.6, 1, hx, hy - pl * 0.5, pl); g.addColorStop(0, lit(col, 0.2)); g.addColorStop(1, lit(col, -0.25)); c.fillStyle = g; c.beginPath(); c.ellipse(hx, hy - pl / 2, pw, pl / 2, 0, 0, 6.3); c.fill(); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 26; k++) { const a = k * 2.399, r = Math.sqrt(k / 26); c.beginPath(); c.arc(hx + Math.cos(a) * pw * r * 0.85, hy - pl / 2 + Math.sin(a) * pl * 0.46 * r, Math.max(0.5, pw * 0.1), 0, 6.3); c.fill(); } }
    } else if (kind === 'bean' && has) {
      const col = mixc('#7DB64C', '#D7C58A', gfrac); for (let k = 0; k < 4; k++) { const hy = yg - Hs * (0.45 + 0.1 * k), side = k % 2 ? 1 : -1, pl = Hs * (0.08 + 0.12 * gfrac); c.save(); c.translate(xc, hy); c.rotate(side * (0.5 + 0.1 * k)); c.strokeStyle = lit(col, -0.2); c.lineWidth = Math.max(1.4, Hs * 0.014); c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(side * pl * 0.1, pl * 0.5, side * pl * 0.05, pl); c.stroke(); c.strokeStyle = col; c.lineWidth = Math.max(0.8, Hs * 0.009); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(side * pl * 0.1, pl * 0.5, side * pl * 0.05, pl); c.stroke(); c.restore(); }
    }
  }
  const N_ = () => 140;

  // the whole shoot. opts: { shadow, flat }.  Returns the geometry of the leaves (as the model's own), for the caller.
  function shoot(c, P, res, d, xc, yg, s, view, rot, leafColor) {
    if (res.sp.name === 'Wheat') { [[-0.075, 0.8, 0.9], [0.08, 0.86, -0.7]].forEach(q => { c.save(); c.translate(xc + q[0] * res.H[d] * s, yg); c.scale(q[1], q[1]); c.translate(-xc, -yg); one(c, P, res, d, xc, yg, s, view, rot + q[2], leafColor); c.restore(); }); }
    return one(c, P, res, d, xc, yg, s, view, rot, leafColor);
  }
  function one(c, P, res, d, xc, yg, s, view, rot, leafColor) {
    const sp = res.sp, g = P.leaves(res, d, rot), H = res.H[d] * s, kind = res.sp.name === 'Common bean' ? 'bean' : res.sp.name === 'Wheat' ? 'wheat' : res.sp.name === 'Sorghum' ? 'sorghum' : 'maize';
    const thermal = view === 'thermal', leaf0 = GREEN[kind], wilt = clamp((0.88 - res.RWC[d]) / 0.25, 0, 1), leaf = mixc(leaf0, '#9AA45A', wilt * 0.6), shadow = !thermal;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    // a little shadow on the ground
    if (!thermal) { const rg = c.createRadialGradient(xc, yg + 2, 1, xc, yg + 2, Math.max(8, H * 0.2)); rg.addColorStop(0, 'rgba(30,20,10,0.35)'); rg.addColorStop(1, 'rgba(30,20,10,0)'); c.fillStyle = rg; c.beginPath(); c.ellipse(xc, yg + 2, Math.max(8, H * 0.2), Math.max(2.5, H * 0.03), 0, 0, 6.3); c.fill(); }
    // stem
    const sw0 = Math.max(1.2, Math.min(kind === 'wheat' ? 2.2 : 4.2, H * (kind === 'wheat' ? 0.012 : 0.02))), sw1 = sw0 * 0.5;
    const sg = c.createLinearGradient(xc - sw0, 0, xc + sw0, 0); const sc0 = thermal ? '#6A8A5A' : mixc(leaf, '#C8D88A', 0.25); sg.addColorStop(0, lit(sc0, -0.28)); sg.addColorStop(0.45, lit(sc0, 0.18)); sg.addColorStop(1, lit(sc0, -0.2));
    c.fillStyle = thermal ? 'rgba(90,110,90,0.8)' : sg; c.beginPath(); c.moveTo(xc - sw0, yg); c.lineTo(xc - sw1, yg - H); c.lineTo(xc + sw1, yg - H); c.lineTo(xc + sw0, yg); c.closePath(); c.fill();
    if (!thermal && H > 30) { c.strokeStyle = 'rgba(30,60,20,0.35)'; c.lineWidth = 0.7; const nn = Math.max(3, Math.round(sp.nLeaf * 0.4)); for (let k = 1; k <= nn; k++) { const t = k / (nn + 1), yy = yg - H * t, ww = sw0 + (sw1 - sw0) * t; c.beginPath(); c.moveTo(xc - ww, yy); c.lineTo(xc + ww, yy); c.stroke(); } }
    const order = g.leaves.slice().sort((a, b) => Math.sin(a.az) - Math.sin(b.az));
    order.forEach(L => {
      const ya = yg - L.hgt * s, dx = L.reach * Math.cos(L.az) * s * (kind === 'maize' || kind === 'sorghum' ? 1.45 : 1), rise = L.len * Math.sin(L.elev) * s * 0.8, wmax = Math.max(1.3, L.len * sp.ar * s * 0.5 * L.wr);
      const wiltDrop = wilt * L.len * s * 0.14, tipx = xc + dx, tipy = ya - rise * 0.55 + L.len * s * 0.18 * (1 - 0.5 * L.gf) + wiltDrop, cxp = xc + dx * 0.4, cyp = ya - rise;
      const back = Math.sin(L.az) < 0, col = back ? lit(leaf, -0.14) : leaf, geo = { xc, ya, tipx, tipy, cxp, cyp, wmax };
      if (kind !== 'bean' && !thermal) { const sh = Math.min(H * 0.06, 3 + L.len * s * 0.05); c.fillStyle = lit(col, -0.05); c.beginPath(); c.moveTo(xc - sw0 * 0.9, ya + 1); c.lineTo(xc - sw0 * 0.8, ya - sh); c.lineTo(xc + sw0 * 0.8, ya - sh); c.lineTo(xc + sw0 * 0.9, ya + 1); c.closePath(); c.fill(); }
      const o = { leaf: col, shadow, flat: thermal ? leafColor(L, view, res, d) : null };
      if (kind === 'bean') trifoliate(c, L, geo, o); else blade(c, sp, kind, L, geo, o);
    });
    if (!thermal) organ(c, kind, res, d, xc, yg, s, {});
    c.restore(); return g;
  }
  window.PHREAL = { shoot };
})();
