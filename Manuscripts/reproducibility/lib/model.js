// ===== S3 Drip / S4 Sprinkler: models =====
const IRM = (function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // ---------- drip ----------
  const DKIND = { online: { label: 'Online emitter', cv: 0.07, x: 0.5, ne: 1, Hmin: 0, q: 4, Se: 0.75, D: 16 }, inline: { label: 'Inline emitter', cv: 0.04, x: 0.5, ne: 1, Hmin: 0, q: 2, Se: 0.5, D: 16 }, tape: { label: 'Drip tape', cv: 0.08, x: 0.6, ne: 2, Hmin: 0, q: 1, Se: 0.2, D: 16 }, pc: { label: 'Pressure-compensating', cv: 0.03, x: 0.05, ne: 1, Hmin: 8, q: 2, Se: 0.6, D: 16 } };
  function latProfile(kind, q, Se, LL, H0, D) {
    const k = DKIND[kind], N = Math.max(2, Math.round(LL / Se)), C = 140, Dm = D / 1000, step = Math.max(1, Math.floor(N / 60)), qs = [], hs = [], xs = [];
    // head along the lateral: loss in each segment from the flow still to be delivered downstream (Hazen-Williams)
    let H = H0, rem = 0; const qj = new Array(N + 1); const hj = new Array(N + 1);
    const flow = j => { const hh = hj[j], r = hh / H0; return k.Hmin ? (hh >= k.Hmin ? q * (1 + 0.04 * (hh - H0) / H0) : q * Math.pow(Math.max(hh, 0.1) / k.Hmin, 0.5)) : q * Math.pow(Math.max(r, 0.01), k.x); };
    // iterate: flows depend on heads which depend on flows
    for (let j = 0; j <= N; j++) { hj[j] = H0; qj[j] = q; }
    for (let it = 0; it < 4; it++) {
      const down = new Array(N + 2).fill(0); for (let j = N; j >= 0; j--) down[j] = down[j + 1] + qj[j];
      let h = H0; for (let j = 0; j <= N; j++) { hj[j] = Math.max(h, 0.5); const Qs = down[j + 1] / 3.6e6; h -= 10.67 * Se * Math.pow(Qs, 1.852) / (Math.pow(C, 1.852) * Math.pow(Dm, 4.871)); }
      for (let j = 0; j <= N; j++) qj[j] = flow(j);
    }
    let sum = 0, mn = 1e9; for (let j = 0; j <= N; j++) { sum += qj[j]; mn = Math.min(mn, qj[j]); }
    const qa = sum / (N + 1); let v = 0; for (let j = 0; j <= N; j++) v += Math.pow(qj[j] / qa - 1, 2); const sdP = Math.sqrt(v / (N + 1));
    for (let j = 0; j <= N; j += step) { xs.push(j * Se); qs.push(qj[j] / q); hs.push(hj[j]); }
    const Eu = clamp((1 - 1.27 * k.cv / Math.sqrt(k.ne)) * (mn / qa), 0.3, 1);
    return { N, qa, qmin: mn, hf: H0 - hj[N], Hend: hj[N], Eu, sd: Math.sqrt(k.cv * k.cv + sdP * sdP), xs, qs, hs, Q: N * qa / 3600 };
  }
  // shape of the wetted volume around an emitter at depth zd (mm): a half-ellipsoid below it (semi-axes r, a*r) and a short one above (u*r)
  function shape(r, a, zd, u) { return z => { if (z < 0) return 0; const dz = z >= zd ? (z - zd) / (a * r) : (zd - z) / (u * r); return dz >= 1 ? 0 : r * Math.sqrt(1 - dz * dz); }; }
  function bulbInt(r, a, zd, u, Rm, two) {
    const f = shape(r, a, zd, u), z0 = Math.max(0, zd - u * r), z1 = zd + a * r, n = 56, dz = (z1 - z0) / n; let vol = 0, below = 0;
    for (let i = 0; i < n; i++) { const z = z0 + (i + 0.5) * dz, rho = f(z), w = two ? 2 * rho * dz : Math.PI * rho * rho * dz; vol += w; if (z > Rm) below += w; }
    return { vol, below, rs: f(0.001), z1 };
  }
  function solveR(Vw, a, zd, u, Rm, two) { let lo = 5, hi = 3500; for (let i = 0; i < 38; i++) { const m = (lo + hi) / 2; if (bulbInt(m, a, zd, u, Rm, two).vol < Vw) lo = m; else hi = m; } return (lo + hi) / 2; }
  // one emitter delivering V litres. returns the wetted bulb and where its water went
  function bulb(V, c) {
    const dth = c.dth, two = c.Se < 0.34 || c.two, Vw = two ? V * 1e6 / (c.Se * 1000) / dth : V * 1e6 / dth;
    let r = solveR(Vw, c.a, c.zd, 0.6, c.Rm, two); const B = bulbInt(r, c.a, c.zd, 0.6, c.Rm, two);
    if (!two && 2 * r > c.Se * 1000 * 1.0 && c.Se < 1.2) { r = solveR(V * 1e6 / (c.Se * 1000) / dth, c.a, c.zd, 0.6, c.Rm, true); return bulb2(V, c, r); }
    const below = V * B.below / B.vol, area = B.rs > 0 ? Math.PI * B.rs * B.rs / 1e6 : 0, ev = Math.min(0.5 * V, area * c.E0 * 2 * (c.zd > 0 ? 1 : 1));
    return { r, zb: c.zd + c.a * r, below, ev, rs: B.rs, two: false, u: 0.6 };
  }
  function bulb2(V, c, r) { const B = bulbInt(r, c.a, c.zd, 0.6, c.Rm, true), below = V * B.below / B.vol, area = B.rs > 0 ? 2 * B.rs / 1000 * c.Se : 0, ev = Math.min(0.5 * V, area * c.E0 * 2); return { r, zb: c.zd + c.a * r, below, ev, rs: B.rs, two: true, u: 0.6 }; }
  const QZ = [-1.28, -0.52, 0, 0.52, 1.28];
  function drip(o) {
    const kind = o.kind, K = DKIND[kind], lat = latProfile(kind, o.q, o.Se, o.LL, o.H0, o.D), Ae = o.Se * o.Sl, Vreq = o.Zn * Ae;
    const lam = Math.max(40, o.psi), aspect = clamp(1 + 0.6 * Math.log10(1 + o.ks / (o.q * 1e6 / (2 * Math.PI * lam * lam))), 1, 1.9);
    const c = { dth: Math.max(0.03, o.fT * (o.fc - o.wp)), a: aspect, zd: o.dep * 10, Rm: o.Rmax * 10, Se: o.Se, E0: o.E0 };
    const run = t => {
      const V = lat.qa * t, quant = QZ.map(z => { const Vi = Math.max(0.02 * V, V * (1 + lat.sd * z)), b = bulb(Vi, c), root = Vi - b.below - b.ev, stored = Math.min(root, Vreq); return Object.assign(b, { V: Vi, stored, excess: root - stored, z }); });
      const m = f => quant.reduce((s, q) => s + f(q), 0) / quant.length, Vm = m(q => q.V);
      return { t, V, quant, Ea: m(q => q.stored) / Vm, Es: m(q => q.stored) / Vreq, dp: m(q => q.below + q.excess) / Vm, ev: m(q => q.ev) / Vm, b: quant[2] };
    };
    let t = o.t; if (t == null) t = clamp(Vreq / (lat.qa * lat.Eu), 0.05, 96);
    const R = run(t); const b = R.b; const Pw = clamp(2 * b.r / 1000 / o.Sl, 0, 1);
    return Object.assign(R, { lat, Ae, Vreq, aspect, Pw, Eu: lat.Eu, gross: R.V / Ae, kind, dth: c.dth, c, two: b.two });
  }
  function dripAt(R, tau) { const V = R.lat.qa * tau; return bulb(Math.max(1e-3, V), R.c); }

  // ---------- sprinklers ----------
  const STYPE = {
    impact: { label: 'Impact sprinkler', cR: 1.15, m: 1.3, F: 1, dr: [2.4, 8, 0.1], pr: [200, 500, 10], d: 4.4, P: 300, Ss: 12, Sl: 18, ssr: [6, 30, 1], slr: [6, 36, 1], Sd: 0 },
    spray: { label: 'Rotating spray', cR: 0.8, m: 'ring', F: 1.6, dr: [1.5, 5, 0.1], pr: [70, 250, 5], d: 3.2, P: 170, Ss: 6, Sl: 6, ssr: [3, 15, 0.5], slr: [3, 15, 0.5], Sd: 0 },
    micro: { label: 'Micro-sprinkler', cR: 0.7, m: 'ring2', F: 0.7, dr: [0.8, 2.5, 0.05], pr: [100, 250, 5], d: 1.3, P: 180, Ss: 3, Sl: 3, ssr: [1.5, 8, 0.25], slr: [1.5, 8, 0.25], Sd: 0 },
    gun: { label: 'Big gun', cR: 0.95, m: 1.0, F: 1.3, dr: [10, 25, 0.5], pr: [350, 700, 10], d: 16, P: 500, Ss: 30, Sl: 36, ssr: [20, 80, 1], slr: [20, 90, 1], Sd: 0 }
  };
  const pHat = (type, x) => { if (x >= 1) return 0; const m = STYPE[type].m; if (m === 'ring') return (0.5 + 0.5 * x) * (1 - Math.pow(x, 6)); if (m === 'ring2') return (0.55 + 0.45 * x) * (1 - Math.pow(x, 5)); return 1 - Math.pow(x, m); };
  const angF = a => a == null ? 1 : Math.pow(Math.max(0.05, Math.sin(3.1 * a * Math.PI / 180)) / 0.9763, 0.45);   // range against trajectory angle: peaks near 29 degrees, 1 at the 25 degree default
  function nozzle(o) { const h = o.P / 9.81, A = Math.PI * Math.pow(o.d / 2000, 2), q = 0.95 * A * Math.sqrt(2 * 9.81 * h) * 60000, R = STYPE[o.type].cR * Math.sqrt(o.d * h) * angF(o.alpha); return { q, R, h }; }
  const _pat = {};
  function pattern(o) {
    const nz = nozzle(o), key = [o.type, nz.q.toFixed(2), nz.R.toFixed(2), o.u.toFixed(1)].join('|'); if (_pat[key]) return _pat[key]; if (Object.keys(_pat).length > 40) for (const k in _pat) delete _pat[k];
    const R = nz.R, ext = 1.4 * R, n = 45, hh = 2 * ext / (n - 1), g = new Float32Array(n * n), sh = 0.03 * o.u * R; let tot = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = -ext + i * hh - sh, y = -ext + j * hh, r = Math.hypot(x, y), th = Math.atan2(y, x), Re = R * clamp(1 + 0.022 * o.u * Math.cos(th), 0.7, 1.4), v = pHat(o.type, r / Re); g[j * n + i] = v; tot += v * hh * hh; }
    const s = nz.q / tot; for (let i = 0; i < g.length; i++) g[i] *= s;      // mm/min: 1 mm over 1 m2 is 1 L
    return (_pat[key] = { g, n, hh, ext, R, q: nz.q });
  }
  const look = (P, x, y) => { const fx = (x + P.ext) / P.hh, fy = (y + P.ext) / P.hh; if (fx < 0 || fy < 0 || fx >= P.n - 1 || fy >= P.n - 1) return 0; const i = fx | 0, j = fy | 0, ax = fx - i, ay = fy - j, g = P.g, n = P.n; return (g[j * n + i] * (1 - ax) + g[j * n + i + 1] * ax) * (1 - ay) + (g[(j + 1) * n + i] * (1 - ax) + g[(j + 1) * n + i + 1] * ax) * ay; };
  function field(o, nx, ny) {                       // application rate (mm/min, gross, at the sprinkler) at points in one repeating cell
    const P = pattern(o), rows = o.tri ? 2 : 1, cells = new Float32Array(nx * ny), ri = Math.ceil(P.ext / o.Ss) + 1, rj = Math.ceil(P.ext / o.Sl) + 1;
    for (let b = 0; b < ny; b++) for (let a = 0; a < nx; a++) { const x = (a + 0.5) / nx * o.Ss, y = (b + 0.5) / ny * o.Sl * rows; let s = 0;
      for (let j = -rj; j <= rows - 1 + rj; j++) { const off = o.tri && ((j % 2) + 2) % 2 ? o.Ss / 2 : 0; for (let i = -ri; i <= ri + 1; i++) s += look(P, x - (i * o.Ss + off), y - j * o.Sl); } cells[b * nx + a] = s; }
    return { cells, nx, ny, P };
  }
  const WD = (o, Tair) => clamp((1.2 + 0.5 * o.u + 0.04 * o.u * o.u) * STYPE[o.type].F * Math.pow(o.P / 250, 0.7) * (1 + 0.025 * (Tair - 20)) * (o.alpha == null ? 1 : 0.6 + 0.4 * Math.sin(o.alpha * Math.PI / 180) / 0.4226), 0.5, 45) / 100;
  // water balance at a point: rate a (mm/min) for T min, Kostiakov intake K t^A (K in mm), depression storage Sd (mm)
  function point(a, T, K, A, Sd) { const sup = a * T; let F = sup; if (a > 0) { const tp = Math.pow(a / K, 1 / (A - 1)); if (T > tp) F = K * Math.pow(T, A); } const R = sup - F, ro = Math.max(0, R - Sd); return { I: sup - ro, ro, sup }; }
  function sprinkler(o) {
    const nx = 14, ny = o.tri ? 24 : 14, f = field(o, nx, ny), P = f.P, Tair = o.Tair, wdel = WD(o, Tair), K = o.K * 1000, A = o.A, Sd = Math.max(0, o.Sd) / (1 + 0.25 * o.S), n = nx * ny;
    let sum = 0; for (let i = 0; i < n; i++) sum += f.cells[i]; const mean = sum / n;                       // mm/min gross
    let dev = 0; for (let i = 0; i < n; i++) dev += Math.abs(f.cells[i] - mean); const CU = 1 - dev / n / mean;
    const nz = nozzle(o), AR = mean * 60, area = o.Ss * o.Sl * (o.tri ? 1 : 1);
    const run = T => { let sI = 0, sRo = 0; const arr = new Float32Array(n), ar = new Float32Array(n);
      let icS = 0; for (let i = 0; i < n; i++) { const a = f.cells[i] * (1 - wdel), p = point(a, T, K, A, Sd), ic = Math.min(p.I, o.intc || 0); arr[i] = p.I - ic; ar[i] = a; sI += p.I - ic; sRo += p.ro; icS += ic; }
      const sorted = Array.from(arr).sort((x, y) => x - y), lq = sorted.slice(0, Math.max(1, Math.floor(n / 4))).reduce((s, v) => s + v, 0) / Math.max(1, Math.floor(n / 4));
      let st = 0, ex = 0; for (let i = 0; i < n; i++) { st += Math.min(arr[i], o.Zn); ex += Math.max(0, arr[i] - o.Zn); }
      const gross = mean * T; return { T, arr, ar, gross, I: sI / n, ro: sRo / n, st: st / n, ex: ex / n, lq, Ea: st / n / gross, Es: st / n / o.Zn, DU: lq / (sI / n), wd: wdel * gross + icS / n, icd: icS / n, rod: sRo / n, dpd: ex / n }; };
    let T = o.T; if (T == null) { let lo = 1, hi = 2400; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (run(m).lq < o.Zn) lo = m; else hi = m; } T = hi; }
    const R = run(T); const g = R.gross;
    return Object.assign(R, { nz, P, CU, AR, wdel, f, nx, ny, K, A, Sd, Q: nz.q, Ae: area, wdTot: R.wd / g, fr: { st: R.st / g, dp: R.ex / g, ro: R.ro / g, wd: R.wd / g }, dp: R.ex / g, ro: R.ro / g });
  }
  return { clamp, shape, bulb, DKIND, drip, dripAt, latProfile, STYPE, angF, nozzle, pattern, field, sprinkler, point, WD };
})();
if (typeof module !== 'undefined') module.exports = IRM;
