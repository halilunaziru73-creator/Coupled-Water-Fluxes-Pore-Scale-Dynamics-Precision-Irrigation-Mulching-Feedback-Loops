/* S5 Drainage design: subsurface pipe drains, open ditches and controlled drainage for the soil, crop and irrigation design in use.
   Equations (Jha, Drainage Engineering; FAO Irrigation and Drainage Paper 9 "Drainage of irrigated lands"; Skaggs, Agricultural Drainage; Vlotman, Modern Land Drainage):
   - Hooghoudt (1940), steady flow: q L^2 = 8 K2 d h + 4 K1 h^2, with the equivalent depth d of Moody and van Beers (the exact series, not the table);
   - Glover and Dumm, falling water table: L^2 = pi^2 K d t / (mu ln(1.16 h0 / ht));
   - Manning for the pipes, Rhoades for the leaching requirement, Sieben SEW30 for the excess water.
   The recharge is the deep percolation of the DSS day by day (rain, and the irrigation applied and lost by the design in use). */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || typeof sidSlider !== 'function') return;
  const DN = { type: 'pipe', basis: 'steady', depth: 1.2, D: 3, Ksub: 1, tdraw: 5, Lf: 300, Wf: 200, slope: 0.15, Lauto: true, L: 40, qauto: true, q: 6, zauto: true, zc: 0.5, gate: 0, bw: 0.6, Ece: 3, touch(k) { if (k === 'L') this.Lauto = false; if (k === 'q') this.qauto = false; if (k === 'zc') this.zauto = false; } };
  const DNC = { key: '', val: null }, PIPES = [80, 100, 125, 160, 200, 250, 315, 400, 500], NMAN = 0.016, NDIT = 0.03;
  const DNCOL = { soil1: '#8A6A4A', soil2: '#B89A72', barrier: '#8D949B', water: '#4A90C8', wt: '#1F6FB5', pipe: '#2B2F33', ok: '#14532D', warn: '#8A5A00', bad: '#B91C1C', gate: '#C0803A' };
  // ---------- hydraulics ----------
  function dEq(L, D, u) {   // equivalent depth of Hooghoudt, exact solution (Moody; van Beers): u = wetted perimeter of the drain (pi r0 for a pipe running half full)
    const x = 2 * Math.PI * D / L; let F = 0; for (let n = 1; n <= 29; n += 2) { const e = Math.exp(-2 * n * x); F += 4 * e / (n * (1 - e)); }
    const d = (Math.PI * L / 8) / (Math.max(0.05, Math.log(L / u)) + F); return Math.min(d, D);
  }
  function hooghoudtL(q, h, K1, K2, D, u) {   // spacing for the discharge q (m/d) and the head h (m) of the water table midway above the drain level
    if (h <= 0 || q <= 0) return 0; let L = Math.sqrt((4 * K1 * h * h + 8 * K2 * D * h) / q); for (let i = 0; i < 60; i++) { const d = dEq(Math.max(L, 2), D, u), Ln = Math.sqrt((8 * K2 * d * h + 4 * K1 * h * h) / q); if (Math.abs(Ln - L) < 0.01) { L = Ln; break; } L = 0.5 * (L + Ln); } return L;
  }
  function glover(K1, K2, mu, D, u, h0, ht, t) {   // L from the time t (days) to lower the water table from h0 to ht above the drain level
    if (ht <= 0 || h0 <= ht) return 0; let L = 30; for (let i = 0; i < 60; i++) { const d = dEq(Math.max(L, 2), D, u), hm = 0.5 * (h0 + ht), K = (K1 * hm + K2 * d) / (hm + d), Ln = Math.PI * Math.sqrt(K * d * t / (mu * Math.log(1.16 * h0 / ht))); if (Math.abs(Ln - L) < 0.01) { L = Ln; break; } L = 0.5 * (L + Ln); } return L;
  }
  const hMid = (q, L, K1, K2, d) => { const a = 4 * K1, b = 8 * K2 * d, c = -q * L * L; return a > 0 ? (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a) : -c / b; };   // water table height midway, from the Hooghoudt equation
  const qOut = (h, L, K1, K2, d) => h > 0 ? (8 * K2 * d * h + 4 * K1 * h * h) / (L * L) : 0;
  const manQ = (Dm, s, n) => (1 / n) * Math.PI * Dm * Dm / 4 * Math.pow(Dm / 4, 2 / 3) * Math.sqrt(s);   // full pipe, m3/s (D in m)
  const pipeFor = (Q, s, f) => { for (const D of PIPES) if (manQ(D / 1000, s, NMAN) * (f || 0.8) >= Q) return D; return PIPES[PIPES.length - 1]; };
  // ---------- the design in use ----------
  function dnDes() {
    const k = typeof designOfMethod === 'function' ? designOfMethod() : 'sid'; let R = null; try { R = k === 'drip' ? drRun() : k === 'spr' ? spRun() : sidRun(); } catch (e) { }
    return { k, name: { sid: 'surface irrigation', drip: 'drip irrigation', spr: 'sprinklers' }[k], Ea: R && R.Ea > 0 ? clampN(R.Ea, 0.2, 0.98) : (k === 'drip' ? 0.9 : k === 'spr' ? 0.75 : 0.6), dpf: R && isFinite(R.dp) ? clampN(R.dp, 0, 0.9) : (k === 'drip' ? 0.05 : k === 'spr' ? 0.1 : 0.25) };
  }
  function soilK(soil) { const tex = DATA.texture[soil], s = SIDM.saxton(tex.sand / 100, tex.clay / 100, SID.om); return s.ks * 24 / 1000; }   // saturated conductivity, m/day
  function dnRun(C) {
    const des = dnDes(), P = C.plan, S = P && P.season, th = irTh(C), key = JSON.stringify([DN.type, DN.basis, DN.depth, DN.D, DN.Ksub, DN.tdraw, DN.Lf, DN.Wf, DN.slope, DN.Lauto ? 0 : DN.L, DN.qauto ? 0 : DN.q, DN.zauto ? 0 : DN.zc, DN.gate, DN.bw, DN.Ece, state.soil, state.crop, des.Ea, des.dpf, SID.om, state.ecw, Math.round(C.Rmax)]);
    if (DNC.key === key && DNC.plan === P) return DNC.val; const o = {};
    const K1 = Math.max(0.005, soilK(state.soil)), K2 = Math.max(0.003, K1 * DN.Ksub), mu = clampN(th.sat - th.fc, 0.03, 0.25);
    const ditch = DN.type === 'ditch', r0 = 0.5 * PIPES[1] / 1000, Dw = 0.3, u = ditch ? DN.bw + 2 * Dw * Math.sqrt(1 + 1.5 * 1.5) : Math.PI * r0;
    const n = S && S.dpA ? S.dpA.length : 0, Rd = []; for (let i = 0; i < n; i++) Rd.push(((S.dpA[i] || 0) + (S.iA[i] || 0) / des.Ea * des.dpf) / 1000);   // recharge, m/day
    const mean3 = Rd.map((v, i) => { let a = 0, c = 0; for (let j = Math.max(0, i - 2); j <= i; j++) { a += Rd[j]; c++; } return a / c; }), srt = mean3.slice().sort((a, b) => a - b), p95 = srt.length ? srt[Math.min(srt.length - 1, Math.floor(0.95 * srt.length))] : 0.004;
    const qdes = DN.qauto ? clampN(p95 * 1000, 2, 25) : DN.q, zc = DN.zauto ? clampN(0.3 + C.Rmax / 100 * 0.4, 0.4, 0.9) : DN.zc, hAllow = DN.depth - zc;
    const Ls = hAllow > 0.02 ? hooghoudtL(qdes / 1000, hAllow, K1, K2, DN.D, u) : 0, Lu = hAllow > 0.02 ? glover(K1, K2, mu, DN.D, u, DN.depth - 0.1, hAllow, DN.tdraw) : 0;
    const Ld = DN.basis === 'steady' ? Ls : DN.basis === 'falling' ? Lu : (Ls && Lu ? Math.min(Ls, Lu) : Ls || Lu);
    const L = clampN(DN.Lauto ? Math.max(5, Math.floor(Ld)) : DN.L, 5, 200), d = dEq(L, DN.D, u), hD = hMid(qdes / 1000, L, K1, K2, d);
    // the water table day by day: dh/dt = (recharge - outflow(h - gate)) / mu
    const run = g => { const wt = [], qo = []; let h = Math.min(DN.depth, g + 0.15), tot = 0, ro = 0, days = 0, sew = 0, dMax = 0; for (let i = 0; i < n; i++) { let ot = 0; for (let k = 0; k < 6; k++) { const q = qOut(h - g, L, K1, K2, d); h += (Rd[i] - q) / mu / 6; ot += q / 6; if (h > DN.depth) { ro += (h - DN.depth) * mu; h = DN.depth; } if (h < 0) h = 0; } const z = DN.depth - h; wt.push(z); qo.push(ot * 1000); tot += ot * 1000; if (z < zc) days++; if (z < 0.3) sew += (0.3 - z) * 100; dMax = Math.max(dMax, ot * 1000); } return { wt, qo, tot, ro: ro * 1000, days, sew, dMax }; };
    const gate = DN.type === 'gate' ? DN.gate : 0, free = run(0), ctrl = run(gate);
    // pipes and structures
    const Af = DN.Lf * DN.Wf / 1e4, NL = Math.max(1, Math.floor(DN.Wf / L) + 1), Ql = qdes / 1000 * L * DN.Lf / 86400, Qc = qdes / 1000 * DN.Lf * DN.Wf / 86400, s = DN.slope / 100;
    const Dl = pipeFor(Ql, s, 0.8), Dc = pipeFor(Qc, Math.max(s, 0.001), 0.8), Qcap = manQ(Dl / 1000, s, NMAN), Lmax = Math.min(1500, Qcap * 0.8 / (qdes / 1000 * L / 86400)), vl = Qcap / (Math.PI * Dl * Dl / 4e6);
    const mm = ditch ? DN.bw + 2 * DN.depth * 1.5 : 0, trench = NL * DN.Lf * (ditch ? (DN.bw + DN.depth * 1.5) * DN.depth : 0.5 * DN.depth), pm = ditch ? 0 : (NL * DN.Lf + DN.Wf), perHa = pm / Math.max(0.01, Af);
    // salinity: leaching requirement of Rhoades, LR = ECw / (5 ECe - ECw)
    const ECw = clampN(+state.ecw || 0, 0, 12), LR = ECw > 0 ? clampN(ECw / Math.max(0.1, 5 * DN.Ece - ECw), 0, 0.9) : 0, leachNeed = LR * (S ? S.In : 0) / Math.max(0.05, 1 - LR);
    const rain = S ? S.pA.reduce((a, b) => a + b, 0) : 0, irr = S ? S.iA.reduce((a, b) => a + b, 0) : 0, rech = Rd.reduce((a, b) => a + b, 0) * 1000;
    const gmax = Math.max(0, hAllow - hD); Object.assign(o, { gmax, des, K1, K2, mu, u, r0, n, Rd, p95, qdes, zc, hAllow, Ls, Lu, L, d, hD, free, ctrl, gate, Af, NL, Ql, Qc, Dl, Dc, Qcap, Lmax, vl, trench, pm, perHa, mm, ECw, LR, leachNeed, rain, irr, rech, ditch, s, th });
    DNC.key = key; DNC.plan = P; DNC.val = o; return o;
  }
  // ---------- drawing helpers ----------
  const f1 = (v, d) => isFinite(v) ? v.toFixed(d == null ? 1 : d) : '—', tone = (ok, w) => ok ? DNCOL.ok : w ? DNCOL.warn : DNCOL.bad;
  function soilFill(x, y, w, h, col, hatch) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); if (hatch) { ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; for (let i = -h; i < w; i += 7) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke(); } } }
  function crossSection(x, y, w, h, R, C, mode, t) {   // mode 'free' or 'gate': to scale in metres, two drains at the edges, the water table midway
    const Dv = Math.min(DN.D, 2.2), zmax = DN.depth + Dv + 0.25, py = v => y + 16 + v / zmax * (h - 34), px = v => x + 8 + v / R.L * (w - 16), g = mode === 'gate' ? R.gate : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.fillStyle = '#EAF3FA'; ctx.fillRect(x, y, w, h);
    const clay = DATA.texture[state.soil].clay / 100, top = clay > 0.35 ? '#7A5A3E' : clay > 0.2 ? DNCOL.soil1 : '#A98B63', sub = clay > 0.35 ? '#A98763' : DNCOL.soil2;
    soilFill(x, py(0), w, py(DN.depth) - py(0), top); soilFill(x, py(DN.depth), w, py(DN.depth + Dv) - py(DN.depth), sub); soilFill(x, py(DN.depth + Dv), w, y + h - py(DN.depth + Dv), DNCOL.barrier, true);
    // the saturated zone: the water table midway from Hooghoudt, the curve between the drains
    const hh = (g + (mode === 'gate' ? 0 : 0)) + hMid(R.qdes / 1000, R.L, R.K1, R.K2, R.d) * clampN(t, 0, 1), Hm = Math.max(0, hh), pts = [];
    for (let i = 0; i <= 60; i++) { const xr = i / 60, s = Math.pow(4 * xr * (1 - xr), 0.65); pts.push([px(xr * R.L), py(DN.depth - (g + (Hm - g) * s))]); }
    ctx.globalAlpha = 0.5; ctx.fillStyle = DNCOL.water; ctx.beginPath(); ctx.moveTo(x, y + h); pts.forEach((q, i) => ctx.lineTo(q[0], q[1])); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = DNCOL.wt; ctx.lineWidth = 2.2; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke();
    // the critical depth of the crop, the drain level and the roots
    const yc = py(R.zc); ctx.strokeStyle = DNCOL.bad; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, yc); ctx.lineTo(x + w, yc); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 5; i++) { const cx = x + w * (0.1 + 0.2 * i), rz = Math.min(C.Rmax / 100, DN.depth); ctx.strokeStyle = '#3F8F4B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, py(0)); ctx.lineTo(cx, py(0) - 22); ctx.moveTo(cx, py(0) - 12); ctx.lineTo(cx - 7, py(0) - 22); ctx.moveTo(cx, py(0) - 12); ctx.lineTo(cx + 7, py(0) - 22); ctx.stroke(); ctx.strokeStyle = 'rgba(245,235,200,0.85)'; ctx.lineWidth = 1; for (const k of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(cx, py(0)); ctx.quadraticCurveTo(cx + k * 6, py(rz * 0.5), cx + k * 14, py(rz)); ctx.stroke(); } }
    // the drains at both edges: pipe with its gravel envelope, or the ditch
    const rr = Math.max(5, R.r0 * (w - 16) / R.L * 3.2 + 4);
    [0, 1].forEach(i => { const cx = px(i * R.L), cy = py(DN.depth); if (R.ditch) { const bw = R.u * 0.0 + DN.bw, tw = bw + 2 * 1.5 * 1.0; ctx.fillStyle = '#EAF3FA'; ctx.beginPath(); ctx.moveTo(cx - tw / R.L * (w - 16) / 2, py(DN.depth - 1.0)); ctx.lineTo(cx + tw / R.L * (w - 16) / 2, py(DN.depth - 1.0)); ctx.lineTo(cx + bw / R.L * (w - 16) / 2, cy + 6); ctx.lineTo(cx - bw / R.L * (w - 16) / 2, cy + 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = DNCOL.water; ctx.fillRect(cx - bw / R.L * (w - 16) / 2 - 2, cy - 4, bw / R.L * (w - 16) + 4, 10); } else { ctx.fillStyle = '#D8D2BE'; ctx.beginPath(); ctx.arc(cx, cy, rr + 4, 0, 6.2832); ctx.fill(); ctx.fillStyle = DNCOL.pipe; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.fill(); ctx.strokeStyle = '#6B7177'; ctx.lineWidth = 1; for (let a = -3; a <= 3; a++) { ctx.beginPath(); ctx.arc(cx, cy, rr - 1.5, a * 0.9 - 0.2, a * 0.9 + 0.2); ctx.stroke(); } ctx.fillStyle = DNCOL.water; ctx.beginPath(); ctx.arc(cx, cy + rr * 0.35, rr * 0.55, 0, Math.PI); ctx.fill(); } });
    ctx.restore(); ctx.strokeStyle = '#B9C0C7'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    // the control structure on the right bank, for the gate
    if (mode === 'gate') { const sx = x + w - 30, sy0 = py(0) - 6, sy1 = py(DN.depth) + 8; ctx.fillStyle = '#E8E4D6'; ctx.fillRect(sx, sy0, 22, sy1 - sy0); ctx.strokeStyle = '#4B5057'; ctx.lineWidth = 1.5; ctx.strokeRect(sx, sy0, 22, sy1 - sy0); const yg = py(DN.depth - g); ctx.fillStyle = DNCOL.gate; ctx.fillRect(sx + 1, yg, 20, sy1 - yg - 1); ctx.fillStyle = 'rgba(74,144,200,0.75)'; ctx.fillRect(sx + 3, py(DN.depth - g - R.hD * 0.0) - 2, 16, 2); T('gate ' + f1(g, 2) + ' m', sx - 4, yg - 3, { s: 8.8, b: true, c: '#7A4A12', a: 'right' }); }
    return { px, py, zmax };
  }
  function labelXS(x, y, w, R, C, mode, t) {
    const g = mode === 'gate' ? R.gate : 0, Hm = Math.max(0, g + hMid(R.qdes / 1000, R.L, R.K1, R.K2, R.d) * clampN(t, 0, 1)), wtd = DN.depth - Hm;
    const Dv = Math.min(DN.D, 2.2), zmax = DN.depth + Dv + 0.25, py = v => y + 16 + v / zmax * (170 - 34);
    pill('critical depth ' + f1(R.zc, 2) + ' m', x + 6, py(R.zc) - 4, { s: 8.8, b: true, c: DNCOL.bad }); pill('drain level ' + f1(DN.depth, 2) + ' m', x + 6, py(DN.depth) - 12, { s: 8.8, b: true, c: '#12303A' });
    pill('water table midway ' + f1(wtd, 2) + ' m deep' + (wtd < R.zc ? ' (too shallow)' : ''), x + w / 2 - 70, py(wtd) - 5, { s: 9, b: true, c: wtd < R.zc ? DNCOL.bad : DNCOL.wt });
    return wtd;
  }
  function planView(x, y, w, h, R, t) {   // to scale: the field, the laterals, the collector, the outlet and the receiving ditch
    const sc = Math.min((w - 70) / DN.Lf, (h - 24) / DN.Wf), fw = DN.Lf * sc, fh = DN.Wf * sc, fx = x + 20, fy = y + 6;
    ctx.fillStyle = '#EEF3E2'; ctx.fillRect(fx, fy, fw, fh); ctx.strokeStyle = '#6A7A52'; ctx.lineWidth = 1.5; ctx.strokeRect(fx + 0.5, fy + 0.5, fw, fh);
    const nshow = Math.min(R.NL, 60), step = R.NL / nshow; ctx.lineWidth = R.ditch ? 3 : 1.6; ctx.strokeStyle = R.ditch ? '#4A90C8' : DNCOL.pipe;
    for (let i = 0; i < nshow; i++) { const yy = fy + Math.min(fh - 1, i * step * R.L * sc + 2); ctx.beginPath(); ctx.moveTo(fx, yy); ctx.lineTo(fx + fw, yy); ctx.stroke(); }
    const run = clampN(t * 1.4, 0, 1); ctx.strokeStyle = '#1F6FB5'; ctx.lineWidth = 1; for (let i = 0; i < nshow; i += Math.max(1, Math.floor(nshow / 12))) { const yy = fy + Math.min(fh - 1, i * step * R.L * sc + 2); for (let a = 0; a < 5; a++) { const ax = fx + fw * (((a / 5 + run) % 1)); ctx.beginPath(); ctx.moveTo(ax, yy - 2); ctx.lineTo(ax + 6, yy); ctx.lineTo(ax, yy + 2); ctx.stroke(); } }
    ctx.strokeStyle = '#12303A'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(fx + fw, fy); ctx.lineTo(fx + fw, fy + fh); ctx.stroke();
    const ox = fx + fw + 4, oy = fy + fh / 2; ctx.fillStyle = '#E8E4D6'; ctx.fillRect(ox, oy - 8, 14, 16); ctx.strokeStyle = '#4B5057'; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy - 8, 14, 16); ctx.fillStyle = R.gate > 0 ? DNCOL.gate : '#9AA3AE'; ctx.fillRect(ox + 2, oy - 2, 10, 8);
    ctx.fillStyle = '#9CC7E6'; ctx.fillRect(ox + 22, fy - 2, 18, fh + 4); ctx.strokeStyle = '#4A90C8'; ctx.strokeRect(ox + 22.5, fy - 1.5, 18, fh + 4); T('ditch', ox + 31, fy + fh + 14, { s: 8.8, b: true, a: 'center', c: '#1F6FB5' });
    ctx.strokeStyle = '#12303A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx, fy + fh + 10); ctx.lineTo(fx + fw, fy + fh + 10); ctx.stroke(); T('lateral ' + irF(DN.Lf) + ' m', fx + fw / 2, fy + fh + 21, { s: 9, a: 'center', c: '#374151' });
    ctx.save(); ctx.translate(fx - 10, fy + fh / 2); ctx.rotate(-Math.PI / 2); T('width ' + irF(DN.Wf) + ' m: ' + R.NL + ' laterals every ' + irF(R.L) + ' m', 0, 0, { s: 9, a: 'center', c: '#374151' }); ctx.restore();
    T('collector ' + R.Dc + ' mm', fx + fw - 4, fy + 10, { s: 8.8, b: true, a: 'right', c: '#12303A' }); 
    return fx + fw + 60;
  }
  function series(ax, arr, col, wd, f) { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); arr.forEach((v, i) => { const px = ax.sx(i), py = ax.sy(f ? f(v) : v); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); }
  // ---------- the layer ----------
  function drawDRN() {
    fdApply(); irFit('drn'); paper(); SIDW = []; SIDCUR = DN; const C = irCtx(), R = dnRun(C), des = R.des, t = play.t, S = C.plan && C.plan.season; IRLAB = 'water table rising to its design level: ' + irF(clampN(t, 0, 1) * 100) + ' %';
    irHead(C, 'Drainage design: spacing, pipes and controlled drainage', 'recharge of the DSS (rain and the water lost by ' + des.name + ': efficiency ' + irF(des.Ea * 100) + ' %), Hooghoudt, Glover-Dumm and Manning');
    irCtl(96);
    sidRow('Drain type', 152, [['Pipe drain', DN.type === 'pipe', () => { DN.type = 'pipe'; DN.gate = 0; }, 'Perforated corrugated pipe in a trench with an envelope'], ['Pipe with control gate', DN.type === 'gate', () => { DN.type = 'gate'; if (DN.gate <= 0) DN.gate = clampN(Math.round(Math.max(0, R.gmax) * 0.5 / 0.05) * 0.05, 0.1, 0.9); }, 'A gate in the control chamber holds the water table up: controlled drainage'], ['Open ditch', DN.type === 'ditch', () => { DN.type = 'ditch'; DN.gate = 0; }, 'Open field drains: wider spacing but they take land']]);
    sidRow('Design basis', 180, [['Steady flow (Hooghoudt)', DN.basis === 'steady', () => { DN.basis = 'steady'; }, 'The drains remove the design recharge with the water table held at its allowed height'], ['Falling water table (Glover-Dumm)', DN.basis === 'falling', () => { DN.basis = 'falling'; }, 'After a wet spell the water table must fall to the allowed depth within the drainage time'], ['Both: the closer spacing', DN.basis === 'both', () => { DN.basis = 'both'; }, 'Satisfy the steady and the falling water table criteria']]);
    sidRow('Spacing', 208, [['Automatic from the design', DN.Lauto, () => { DN.Lauto = true; }, 'Spacing calculated for the soil, crop and irrigation'], ['Manual', !DN.Lauto, () => { DN.Lauto = false; DN.L = R.L; }, 'Choose the spacing yourself']]);
    sidRow('Design flow', 236, [['From the DSS recharge', DN.qauto, () => { DN.qauto = true; }, 'The 95th percentile of the 3-day mean deep percolation of the season'], ['Manual', !DN.qauto, () => { DN.qauto = false; DN.q = +R.qdes.toFixed(1); }, 'Type a drainage coefficient yourself']]);
    const cx1 = 16, cx2 = 322, cw = 282; let y = 280;
    sidSlider('depth', 'Drain depth below the surface (m)', cx1, y, cw, [0.6, 2.4, 0.05], DN.depth, v => v.toFixed(2) + ' m');
    sidSlider('D', 'Barrier below the drain level, D (m)', cx1, y + 31, cw, [0.3, 12, 0.1], DN.D, v => v.toFixed(1) + ' m');
    sidSlider('Ksub', 'Subsoil conductivity (× topsoil)', cx1, y + 62, cw, [0.1, 3, 0.05], DN.Ksub, v => '× ' + v.toFixed(2));
    sidSlider('tdraw', 'Time to lower the water table (days)', cx1, y + 93, cw, [1, 10, 0.5], DN.tdraw, v => v.toFixed(1) + ' d', DN.basis === 'steady');
    sidSlider('Lf', 'Field length = lateral length (m)', cx1, y + 124, cw, [50, 1000, 10], DN.Lf, v => irF(v) + ' m');
    sidSlider('Wf', 'Field width (m)', cx1, y + 155, cw, [50, 800, 10], DN.Wf, v => irF(v) + ' m');
    sidSlider('slope', 'Pipe slope (%)', cx1, y + 186, cw, [0.02, 1, 0.01], DN.slope, v => v.toFixed(2) + ' %');
    sidSlider('zc', 'Water table must stay below (m)' + (DN.zauto ? ' · from the crop roots' : ''), cx2, y, cw, [0.3, 1.2, 0.05], DN.zauto ? R.zc : DN.zc, v => v.toFixed(2) + ' m', DN.zauto); hot(cx2, y - 10, 200, 12, () => { DN.zauto = true; }, 'Back to the depth from the root zone of the crop');
    sidSlider('L', 'Drain spacing L (m)' + (DN.Lauto ? ' · automatic' : ''), cx2, y + 31, cw, [5, 200, 1], DN.Lauto ? R.L : DN.L, v => irF(v) + ' m', DN.Lauto);
    sidSlider('q', 'Design discharge q (mm/day)' + (DN.qauto ? ' · from the DSS' : ''), cx2, y + 62, cw, [1, 25, 0.5], DN.qauto ? R.qdes : DN.q, v => v.toFixed(1) + ' mm/d', DN.qauto);
    sidSlider('gate', 'Gate height above the pipe (m)' + (DN.type === 'gate' ? ' \u00b7 at most ' + f1(R.gmax, 2) + ' m' : ''), cx2, y + 93, cw, [0, 0.9, 0.05], DN.gate, v => v.toFixed(2) + ' m', DN.type !== 'gate');
    sidSlider('bw', 'Ditch bottom width (m)', cx2, y + 124, cw, [0.3, 2, 0.1], DN.bw, v => v.toFixed(1) + ' m', DN.type !== 'ditch');
    sidSlider('Ece', 'Salt tolerance of the crop, ECe (dS/m)', cx2, y + 155, cw, [1, 10, 0.5], DN.Ece, v => v.toFixed(1) + ' dS/m');
    SIDCUR = IRX; sidSlider('lift', 'Water lift, source to field (m)', cx2, y + 186, cw, [0, 60, 1], IRX.lift, v => irF(v) + ' m'); SIDCUR = DN;
    y = 516;
    // 1. recharge
    sidHead('Recharge: the water the drains must remove, day by day', y, 'Deep percolation of the DSS season: rain and the part of the irrigation that is lost, from ' + des.name);
    const ax = sidAxes(70, y + 38, 360, 120, 0, Math.max(10, R.n), 0, Math.max(10, Math.ceil(Math.max(R.p95 * 1000 * 1.6, ...R.Rd.map(v => v * 1000)))), 'day of the season', 'recharge (mm/day)', 5, 4);
    ctx.fillStyle = IRC.dp; R.Rd.forEach((v, i) => { const bw = Math.max(1, ax.w / Math.max(1, R.n) - 0.5); ctx.fillRect(ax.sx(i), ax.sy(v * 1000), bw, ax.y + ax.h - ax.sy(v * 1000)); });
    ctx.strokeStyle = DNCOL.bad; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ax.x, ax.sy(R.qdes)); ctx.lineTo(ax.x + ax.w, ax.sy(R.qdes)); ctx.stroke(); ctx.setLineDash([]); pill('design discharge ' + f1(R.qdes) + ' mm/d', ax.x + 6, ax.sy(R.qdes) - 5, { s: 8.8, b: true, c: DNCOL.bad });
    sidHover(ax, v => { const i = clampN(Math.round(v), 0, R.n - 1); return ['day ' + (i + 1), 'recharge ' + f1(R.Rd[i] * 1000) + ' mm', 'rain ' + f1(S.pA[i]) + ' mm', 'irrigation ' + f1(S.iA[i]) + ' mm']; });
    irRows2(440, y + 50, [['Rain in the season', irF(R.rain) + ' mm'], ['Net irrigation', irF(R.irr) + ' mm'], ['Efficiency of the design', irF(des.Ea * 100) + ' %'], ['Applied water that percolates', irF(des.dpf * 100) + ' %'], ['Recharge of the season', irF(R.rech) + ' mm'], ['Design discharge (P95)', f1(R.qdes) + ' mm/d']]);
    y += 208;
    // 2. spacing
    sidHead('Spacing: Hooghoudt for the steady flow and Glover-Dumm for the falling water table', y, 'The spacing that holds the water table ' + f1(R.zc, 2) + ' m below the surface with the drains at ' + f1(DN.depth, 2) + ' m');
    const qs = []; for (let q = 1; q <= 20; q += 0.5) qs.push(q); const curve = dz => qs.map(q => { const h = dz - R.zc; return h > 0.02 ? hooghoudtL(q / 1000, h, R.K1, R.K2, DN.D, R.u) : 0; });
    const c0 = curve(DN.depth), c1 = curve(DN.depth - 0.3), c2 = curve(DN.depth + 0.3), ymax = Math.max(20, Math.ceil(Math.max(...c2, R.L * 1.2) / 10) * 10), ax2 = sidAxes(70, y + 38, 360, 130, 1, 20, 0, ymax, 'design discharge q (mm/day)', 'drain spacing L (m)', 6, 4);
    [[c1, '#8A5A00', 1.4, '0.3 m shallower'], [c2, IRC.st, 1.4, '0.3 m deeper'], [c0, IRC.ac, 2.4, 'drains at ' + f1(DN.depth, 2) + ' m']].forEach(([c, col, wd]) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); let st = false; qs.forEach((q, i) => { if (!c[i]) return; const px = ax2.sx(q), py = ax2.sy(Math.min(c[i], ymax)); st ? ctx.lineTo(px, py) : ctx.moveTo(px, py); st = true; }); ctx.stroke(); });
    ctx.fillStyle = DNCOL.bad; ctx.beginPath(); ctx.arc(ax2.sx(clampN(R.qdes, 1, 20)), ax2.sy(Math.min(R.L, ymax)), 5, 0, 6.2832); ctx.fill(); pill('your design: L = ' + irF(R.L) + ' m', ax2.sx(clampN(R.qdes, 1, 20)) + 8, ax2.sy(Math.min(R.L, ymax)) - 6, { s: 9, b: true, c: DNCOL.bad });
    irLeg([[IRC.st, 'drains 0.3 m deeper'], [IRC.ac, 'at the chosen depth'], ['#8A5A00', 'drains 0.3 m shallower']], 70, y + 212);
    sidHover(ax2, v => { const h = DN.depth - R.zc; return ['q ' + f1(v) + ' mm/d', 'L ' + irF(h > 0.02 ? hooghoudtL(v / 1000, h, R.K1, R.K2, DN.D, R.u) : 0) + ' m']; });
    irRows2(440, y + 50, [['K above / below', f1(R.K1, 2) + ' / ' + f1(R.K2, 2) + ' m/d'], ['Drainable porosity', f1(R.mu, 3)], ['Equivalent depth d', f1(R.d, 2) + ' m'], ['Allowed head h', f1(R.hAllow, 2) + ' m'], ['L steady (Hooghoudt)', R.Ls ? irF(R.Ls) + ' m' : 'none'], ['L falling (Glover-Dumm)', R.Lu ? irF(R.Lu) + ' m' : 'none'], ['Spacing used', irF(R.L) + ' m'], ['Head midway at q', f1(R.hD, 2) + ' m']]);
    y += 238;
    if (R.hAllow <= 0.02) { ctx.fillStyle = '#FDECEA'; ctx.strokeStyle = DNCOL.bad; ctx.lineWidth = 1; rrect(14, y - 8, W - 28, 34, 6); ctx.fill(); ctx.stroke(); sidWrap('Warning: the drains are at ' + f1(DN.depth, 2) + ' m, not deeper than the depth the water table must keep (' + f1(R.zc, 2) + ' m). No spacing can hold the water table down: lay the drains deeper or accept a shallower water table.', 24, y + 6, W - 48, { s: 9.4, b: true, c: '#8B1A12' }, 12); y += 36; }
    // 3. cross-sections
    sidHead('Cross-section between two drains: free drainage and controlled drainage', y, 'To scale. Run simulation: the water table rises to its level at the design discharge. Blue is the saturated soil, the red dashed line the depth the crop needs');
    const pw = (W - 28 - 12) / 2, ph = 170, py0 = y + 36; const xa = 14, xb = 14 + pw + 12;
    crossSection(xa, py0, pw, ph, R, C, 'free', t); const wa = labelXS(xa, py0, pw, R, C, 'free', t); T('Free drainage \u00b7 K above the drain ' + f1(R.K1, 2) + ' m/d, below ' + f1(R.K2, 2) + ' m/d', xa + pw / 2, py0 + ph + 14, { s: 9.6, b: true, a: 'center', c: IRC.ink });
    const mode2 = DN.type === 'gate' ? 'gate' : 'free'; crossSection(xb, py0, pw, ph, R, C, mode2, t); const wb = labelXS(xb, py0, pw, R, C, mode2, t); T(DN.type === 'gate' ? 'Controlled drainage: gate raised ' + f1(R.gate, 2) + ' m' : DN.type === 'ditch' ? 'Open ditch' : 'Pipe drain (the same, no gate)', xb + pw / 2, py0 + ph + 14, { s: 10, b: true, a: 'center', c: IRC.ink });
    y = py0 + ph + 36;
    // 4. the season
    sidHead('The water table through the season', y, 'Daily balance: recharge in, outflow through the drains at the water table height above the outlet');
    const nn = Math.max(10, R.n), ax3 = sidAxes(70, y + 38, 360, 140, 0, nn, 0, Math.ceil((DN.depth + 0.3) * 10) / 10, 'day of the season', 'depth of the water table (m)', 5, 4);
    ctx.save(); ctx.beginPath(); ctx.rect(ax3.x, ax3.y, ax3.w, ax3.h); ctx.clip(); ctx.fillStyle = 'rgba(192,80,58,0.10)'; ctx.fillRect(ax3.x, ax3.sy(0), ax3.w, ax3.sy(R.zc) - ax3.sy(0)); ctx.restore();
    const yD = v => (v);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = DNCOL.pipe; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ax3.x, ax3.sy(DN.depth)); ctx.lineTo(ax3.x + ax3.w, ax3.sy(DN.depth)); ctx.stroke(); ctx.strokeStyle = DNCOL.bad; ctx.beginPath(); ctx.moveTo(ax3.x, ax3.sy(R.zc)); ctx.lineTo(ax3.x + ax3.w, ax3.sy(R.zc)); ctx.stroke(); ctx.setLineDash([]);
    const upto = Math.ceil(clampN(t * 1.0, 0, 1) * R.n);
    if (DN.type === 'gate') series({ sx: ax3.sx, sy: ax3.sy }, R.free.wt.slice(0, upto), '#8A5A00', 1.4); series({ sx: ax3.sx, sy: ax3.sy }, R.ctrl.wt.slice(0, upto), DNCOL.wt, 2);
    pill('drain level ' + f1(DN.depth, 2) + ' m', ax3.x + ax3.w - 96, ax3.sy(DN.depth) - 5, { s: 8.8, b: true, c: '#12303A' }); pill('critical depth ' + f1(R.zc, 2) + ' m', ax3.x + 6, ax3.sy(R.zc) - 5, { s: 8.8, b: true, c: DNCOL.bad });
    sidHover(ax3, v => { const i = clampN(Math.round(v), 0, R.n - 1); const L2 = ['day ' + (i + 1), 'water table ' + f1(R.ctrl.wt[i], 2) + ' m deep', 'outflow ' + f1(R.ctrl.qo[i]) + ' mm/d']; if (DN.type === 'gate') L2.push('free drainage ' + f1(R.free.wt[i], 2) + ' m'); return L2; });
    irLeg(DN.type === 'gate' ? [[DNCOL.wt, 'with the gate'], ['#8A5A00', 'free drainage']] : [[DNCOL.wt, 'water table']], 70, y + 205);
    const cp = DN.type === 'gate', ctrl = R.ctrl, fr = R.free, red = fr.tot > 0 ? 1 - ctrl.tot / fr.tot : 0;
    irRows2(440, y + 50, [['Days too wet (of ' + R.n + ')', irF(ctrl.days) + (cp ? ', free ' + irF(fr.days) : '')], ['SEW30 (cm days)', irF(ctrl.sew) + (cp ? ' (free: ' + irF(fr.sew) + ')' : '')], ['Drained in the season', irF(ctrl.tot) + ' mm' + (cp ? ', free ' + irF(fr.tot) : '')], ['Largest outflow', f1(ctrl.dMax) + ' mm/d'], ['Surface runoff (soil full)', irF(ctrl.ro) + ' mm'], cp ? ['Held in the soil by the gate', irF(R.mu * R.gate * 1000) + ' mm'] : ['Leaching requirement', irF(R.LR * 100) + ' %'], ['Water needed for salt', irF(R.leachNeed) + ' mm']]);
    y += 224;
    // the flow chart
    const mx = Math.max(5, Math.ceil(Math.max(fr.dMax, R.qdes * 1.1)));
    const ax4 = sidAxes(70, y + 8, 360, 100, 0, nn, 0, mx, 'day of the season', 'drain outflow (mm/day)', 5, 4);
    series({ sx: ax4.sx, sy: ax4.sy }, ctrl.qo.slice(0, upto), IRC.ac, 2); if (cp) series({ sx: ax4.sx, sy: ax4.sy }, fr.qo.slice(0, upto), '#8A5A00', 1.2);
    ctx.strokeStyle = DNCOL.bad; ctx.setLineDash([5, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ax4.x, ax4.sy(R.qdes)); ctx.lineTo(ax4.x + ax4.w, ax4.sy(R.qdes)); ctx.stroke(); ctx.setLineDash([]); pill('design ' + f1(R.qdes) + ' mm/d', ax4.x + 6, ax4.sy(R.qdes) - 5, { s: 8.8, b: true, c: DNCOL.bad });
    sidHover(ax4, v => { const i = clampN(Math.round(v), 0, R.n - 1); return ['day ' + (i + 1), 'outflow ' + f1(ctrl.qo[i]) + ' mm/d']; });
    y += 150;
    // 5. infrastructure
    sidHead('Layout and infrastructure: laterals, collector, control chamber and outlet', y, 'To scale. Run simulation: the water moves along the laterals to the collector. Pipes sized with Manning (n ' + NMAN + ', corrugated), running at most 80 % full');
    const ph2 = Math.min(200, 60 + DN.Wf * 0.3); planView(24, y + 44, 440, ph2, R, t);
    const ok1 = R.Lmax >= DN.Lf, ok2 = R.vl >= 0.3;
    irRows2(500, y + 50, [['Laterals', R.NL + ' × ' + irF(DN.Lf) + ' m'], ['Lateral flow', f1(R.Ql * 1000, 2) + ' L/s'], ['Lateral pipe', R.Dl + ' mm'], ['Longest lateral', irF(R.Lmax) + ' m' + (ok1 ? '' : ' (short)')], ['Pipe speed', f1(R.vl, 2) + ' m/s' + (ok2 ? '' : ' low')], ['Collector flow', f1(R.Qc * 1000, 1) + ' L/s'], ['Collector pipe', R.Dc + ' mm'], ['Trench volume', irF(R.trench) + ' m³'], [R.ditch ? 'Land taken' : 'Pipe laid', R.ditch ? f1(R.mm / R.L * 100, 1) + ' %' : irF(R.pm) + ' m'], ['Outlet', DN.type === 'gate' ? 'gate ' + f1(R.gate, 2) + ' m' : 'free']]);
    y += 34 + Math.max(ph2, 210) + 22;
    // 6. what the soil changes
    sidHead('What the soil changes: the same drains in every soil of the program', y, 'Spacing at your design discharge and depth, with the conductivity of each soil (Saxton and Rawls)');
    const soils = Object.keys(DATA.soil_labels).slice(0, 14), rowH = 18, hx = 16; const hdr = [['Soil', 22], ['Ks m/d', 300], ['d m', 370], ['L steady m', 440], ['Pipe m/ha', 520]];
    ctx.fillStyle = '#ECEFF1'; ctx.fillRect(14, y + 26, W - 28, 18); hdr.forEach(h => T(h[0], h[1], y + 39, { s: 9, b: true, c: IRC.ink }));
    soils.forEach((sn, i) => { const yy = y + 44 + i * rowH, K = Math.max(0.005, soilK(sn)), K2 = Math.max(0.003, K * DN.Ksub), h = DN.depth - R.zc, Ls = h > 0.02 ? hooghoudtL(R.qdes / 1000, h, K, K2, DN.D, R.u) : 0, cur = sn === state.soil; ctx.fillStyle = cur ? '#E6F4F7' : i % 2 ? '#F6F7F5' : '#fff'; ctx.fillRect(14, yy, W - 28, rowH); if (cur) { ctx.strokeStyle = IRC.ac; ctx.lineWidth = 1.2; ctx.strokeRect(14.5, yy + 0.5, W - 29, rowH - 1); }
      const vals = [DATA.soil_labels[sn], f1(K, 2), f1(dEq(Math.max(5, Ls || 20), DN.D, R.u), 2), Ls ? irF(Ls) : '—', Ls ? irF(10000 / Math.floor(Ls)) : '—']; vals.forEach((v, j) => T(v, hdr[j][1], yy + 13, { s: 9.2, b: cur, c: cur ? IRC.ac : '#374151' })); hot(14, yy, W - 28, rowH, () => { applyState({ soil: sn }); }, 'Use this soil in the whole program'); });
    y += 44 + soils.length * rowH + 16;
    // 7. result tiles
    sidHead('Result for this design', y, ''); const tw = (W - 28 - 20) / 3, ty = y + 14;
    irTile(14, ty, tw, 'Drain spacing', irF(R.L) + ' m', IRC.ac, f1(R.perHa < 1e5 ? R.perHa : 0, 0) + ' m/ha'); irTile(14 + tw + 10, ty, tw, 'Drainage coefficient', f1(R.qdes) + ' mm/d', IRC.dp, f1(R.qdes * 10, 0) + ' m³/ha/d');
    irTile(14 + 2 * (tw + 10), ty, tw, 'Water table midway', f1(DN.depth - R.hD - R.gate, 2) + ' m deep', DN.depth - R.hD - R.gate >= R.zc ? IRC.st : IRC.df, DN.depth - R.hD - R.gate >= R.zc ? 'meets ' + f1(R.zc, 2) + ' m' : 'short of ' + f1(R.zc, 2) + ' m');
    irTile(14, ty + 62, tw, 'Days too wet', irF(ctrl.days) + ' of ' + R.n, ctrl.days <= 0.03 * R.n ? IRC.st : IRC.df); irTile(14 + tw + 10, ty + 62, tw, 'Drained in the season', irF(ctrl.tot) + ' mm', IRC.dp, irF(ctrl.tot * 10) + ' m³/ha'); irTile(14 + 2 * (tw + 10), ty + 62, tw, 'Lateral pipe', R.Dl + ' mm', ok1 ? IRC.st : IRC.df, 'collector ' + R.Dc + ' mm');
    y = ty + 134;
    // 8. meaning
    sidHead('What this means for the farm', y, 'The soil sets the conductivity, the crop sets the depth, the irrigation design sets the recharge');
    y = irRows(y + 34, [['Soil, crop and irrigation in use', C.sName + ', ' + ((CROPS[state.crop] || {}).label || state.crop) + ', ' + des.name + ' (Ea ' + irF(des.Ea * 100) + ' %)'], ['Water table to be kept below', f1(R.zc, 2) + ' m (roots reach ' + irF(C.Rmax) + ' cm)'], ['Drained water per hectare', irF(ctrl.tot * 10) + ' m³ in the season'], ['Salt balance', R.ECw > 0 ? 'water of ' + f1(R.ECw, 1) + ' dS/m needs ' + irF(R.LR * 100) + ' % leaching = ' + irF(R.leachNeed) + ' mm' : 'irrigation water without salt: no leaching requirement'], ['Total field', f1(R.Af, 1) + ' ha, ' + R.NL + ' laterals every ' + irF(R.L) + ' m']]);
    const adv = []; if (R.hAllow <= 0.02) adv.push('Lay the drains deeper than ' + f1(R.zc, 2) + ' m, or the water table will stay in the roots.'); if (!ok1) adv.push('The laterals are longer than the pipe can carry (' + irF(R.Lmax) + ' m): use a larger pipe, a steeper slope or a collector in the middle of the field.'); if (!ok2) adv.push('The flow speed is below 0.3 m/s: silt will settle. Use a steeper slope.'); if (des.k === 'sid' && des.dpf > 0.3) adv.push('Surface irrigation loses ' + irF(des.dpf * 100) + ' % of the water to deep percolation: a better design reduces the drainage needed.'); if (DN.type === 'gate' && DN.gate > R.gmax + 0.01) adv.push('The gate is higher than the ' + f1(R.gmax, 2) + ' m at which the water table still stays ' + f1(R.zc, 2) + ' m below the surface: the crop roots will be waterlogged. Lower the gate.'); if (DN.type === 'gate' && DN.gate > 0) adv.push('Raise the gate after sowing and lower it before a wet spell and before harvest. At ' + f1(R.gate, 2) + ' m it holds ' + irF(R.mu * R.gate * 1000) + ' mm of water in the soil; the water table stays below the crop up to a gate of ' + f1(R.gmax, 2) + ' m.'); if (R.ECw > 0 && ctrl.tot < R.leachNeed) adv.push('The drains remove less water (' + irF(ctrl.tot) + ' mm) than the leaching requirement (' + irF(R.leachNeed) + ' mm): salt will build up.');
    if (!adv.length) adv.push('The design holds the water table below the roots with these pipes: ' + R.NL + ' laterals every ' + irF(R.L) + ' m, ' + R.Dl + ' mm.'); adv.forEach(a => { const n = sidWrap(a, 24, y + 12, W - 48, { s: 9.6, b: true, c: '#12303A' }, 13); y += 14 + 13 * Math.max(0, n - 1); }); y += 20;
    return y;
  }
  SCENES.push({ id: 'drn', label: 'S5 Drainage', color: '#2F6F8F', play: true, dur: 14, h: 4300, interactive: true,
    onDown: p => sidDown(p), onMove: p => { SID.hv = p; if (SID.drag) { sidSet(SID.drag, p); return true; } return false; }, onUp: () => { SID.drag = null; }, onLeave: () => { SID.drag = null; SID.hv = null; },
    draw: () => { IREND.drn = drawDRN(); }, title: 'Drainage design: spacing, depth, pipes and controlled drainage for your soil, crop and irrigation',
    legend: [['#1F6FB5', 'Water table'], ['#2B2F33', 'Drain pipe'], ['#C0803A', 'Control gate'], ['#C0503A', 'Depth the crop needs']],
    insight: 'Your soil sets how fast the water moves to the drains, your crop sets how deep the water table must stay, and your irrigation design sets how much water the drains must remove.' });
  window.drnKey = () => JSON.stringify([DN, window.SID, window.DRP, window.SPR, window.IRX, state.method]);
  if (window.designWrap) window.designWrap('drn');
  window.drnDash = () => { const C = irCtx(), R = dnRun(C), c = R.ctrl, f1b = (v, d) => isFinite(v) ? v.toFixed(d == null ? 1 : d) : '-', okL = R.Lmax >= DN.Lf;
    return { soil: C.sName, rows: [['Drain type', { pipe: 'pipe drain', gate: 'pipe with control gate', ditch: 'open ditch' }[DN.type]], ['Irrigation design', R.des.name + ', Ea ' + Math.round(R.des.Ea * 100) + ' %'], ['Recharge of the season', Math.round(R.rech) + ' mm'], ['Design discharge', f1b(R.qdes) + ' mm/d'], ['Water table to stay below', f1b(R.zc, 2) + ' m'], ['Drain depth', f1b(DN.depth, 2) + ' m'], ['Drain spacing', Math.round(R.L) + ' m (steady ' + (R.Ls ? Math.round(R.Ls) : '-') + ' m, falling ' + (R.Lu ? Math.round(R.Lu) : '-') + ' m)'], ['Water table midway', f1b(DN.depth - R.hD - R.gate, 2) + ' m deep'], ['Days too wet', c.days + ' of ' + R.n], ['SEW30', Math.round(c.sew) + ' cm days'], ['Drained', Math.round(c.tot) + ' mm'], ['Laterals', R.NL + ' of ' + Math.round(DN.Lf) + ' m, ' + R.Dl + ' mm'], ['Collector', R.Dc + ' mm'], ['Pipe per hectare', Math.round(R.perHa) + ' m/ha'], ['Leaching requirement', Math.round(R.LR * 100) + ' %']], checks: [[DN.depth - R.hD - R.gate >= R.zc - 0.005, 'Water table kept below the roots', 'midway ' + f1b(DN.depth - R.hD - R.gate, 2) + ' m, needed ' + f1b(R.zc, 2) + ' m'], [okL, 'Lateral pipe long enough', 'longest lateral ' + Math.round(R.Lmax) + ' m, field ' + Math.round(DN.Lf) + ' m'], [R.vl >= 0.3, 'Pipe speed keeps the pipe clean', f1b(R.vl, 2) + ' m/s when full'], [c.days <= 0.03 * R.n, 'Few days too wet', c.days + ' of ' + R.n]] }; };
  window.DRN = { DN, run: () => dnRun(irCtx()), dEq, hooghoudtL, glover };
})();
