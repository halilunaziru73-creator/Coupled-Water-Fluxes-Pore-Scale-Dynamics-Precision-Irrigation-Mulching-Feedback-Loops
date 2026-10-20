// ===== S2 textbook design: Walker & Skogerboe (1987), Surface Irrigation: Theory and Practice, Chapter 6 (volume balance field design) =====
// Units follow the book: lengths m, times min, flows m3/min (per furrow, or per metre width for borders and basins),
// intake Z = k*tau^a + f0*tau in m3 per m of length (per furrow) or m3 per m2 (border, basin).
const WSB = (function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const Zin = (K, t) => K.k * Math.pow(t, K.a) + K.f0 * t;
  // Eq 6.5: Newton-Raphson for the intake opportunity time that infiltrates the required volume Zreq (Eq 6.1)
  function treq(K, Zreq) {
    if (!(Zreq > 0)) return 0;
    let T = 300; for (let i = 0; i < 80; i++) { const f = Zreq - Zin(K, T), d = K.a * K.k * Math.pow(T, K.a - 1) + K.f0, Tn = Math.max(T + f / d, 0.01); if (Math.abs(Tn - T) < 1e-7) { T = Tn; break; } T = Tn; }
    return T;
  }
  // flow shape: A^2 R^(4/3) = rho1 * A^rho2 (Eq 6.6). Furrows use fitted values, borders and basins use rho1 = 1, rho2 = 10/3.
  function shapeV(z) { return { rho1: Math.pow(z / (4 * (1 + z * z)), 2 / 3), rho2: 8 / 3 }; }
  const SH_WIDE = { rho1: 1, rho2: 10 / 3 };
  // Eq 6.7: inlet flow area (m2) for flow Q0 (m3/min); basin form Eq 6.40 when S0 is null
  function A0of(Q0, n, S0, sh, x) {
    if (S0 == null) return Math.pow(Q0 * Q0 * n * n * x / 3600, 0.23);
    return Math.pow(Q0 * Q0 * n * n / (3600 * Math.max(S0, 1e-6) * sh.rho1), 1 / sh.rho2);
  }
  // Eq 6.13: largest furrow stream (m3/min) whose inlet velocity does not exceed umax (m/min)
  function furrowQmax(umax, n, S0, sh) { return Math.pow(Math.pow(umax, sh.rho2) * n * n / (3600 * S0 * sh.rho1), 1 / (sh.rho2 - 2)); }
  const borderQmax = (S0, sod) => 0.01059 / Math.pow(S0, 0.75) * (sod ? 2 : 1);              // Eq 6.23 (Hart et al.), m3/min per m
  const borderQmin = (L, S0, n) => 0.000357 * L * Math.sqrt(S0) / n;                         // Eq 6.24
  const basinQmax = (vmax, n, L) => Math.pow(vmax * Math.pow(n * n * L / 7200, 0.23), 1.857); // Eq 6.43
  // Eqs 5.13, 5.14, 6.9, 6.10: time for the front to reach x, with the power-advance exponent r found from two points (L/2 and L)
  function advance(o) {
    const { Q0, L, K, n, S0, sh } = o, sy = o.sy == null ? 0.77 : o.sy, a = K.a;
    const A0 = x => A0of(Q0, n, S0, sh, x);
    let r = 0.5, tL = Infinity, th = Infinity, sz = 0;
    const front = (x, rr, szz) => {
      const f = t => Q0 * t - sy * A0(x) * x - szz * K.k * Math.pow(t, a) * x - K.f0 * t * x / (1 + rr);
      let hi = 5 * A0(x) * x / Q0 + 1; let n1 = 0; while (f(hi) < 0 && n1 < 60) { hi *= 2; n1++; } if (f(hi) < 0) return Infinity;
      let lo = 0; for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; } return (lo + hi) / 2;
    };
    for (let it = 0; it < 40; it++) {
      sz = (a + r * (1 - a) + 1) / ((1 + a) * (1 + r)); tL = front(L, r, sz); th = front(L / 2, r, sz);
      if (!isFinite(tL) || !isFinite(th)) return { tL: Infinity, r, sz, th, p: NaN, A0: A0(L), A0h: A0(L / 2) };
      const rn = Math.log(2) / Math.log(tL / th); if (Math.abs(rn - r) < 1e-5) { r = rn; break; } r = clamp(rn, 0.05, 0.99);
    }
    return { tL, th, r, sz, p: L / Math.pow(tL, r), A0: A0(L), A0h: A0(L / 2) };
  }
  // ---- furrows (Example 6.1 to 6.3 style) ----
  // option list: every whole number of sets that divides the furrows, flow = supply / furrows per set, within the erosive limit
  function furrowOptions(o) {
    const { Wf, w, Qs, L, K, n, S0, sh, Zdepth, umax } = o, N = Math.max(1, Math.round(Wf / w)), Zreq = Zdepth * w, Tq = treq(K, Zreq), Qmax = furrowQmax(umax, n, S0, sh), rows = [];
    for (let s = 1; s <= N && rows.length < 14; s++) {
      if (N % s) continue; const f = N / s, Q0 = Qs / f; if (Q0 > Qmax * 1.0001) continue;
      const ad = advance({ Q0, L, K, n, S0, sh, sy: o.sy }), tL = ad.tL, ok = isFinite(tL) && tL <= 1440 * (o.maxDays || 1), tco = Tq + tL, Ea = ok ? Zreq * L / (Q0 * tco) : NaN;
      rows.push({ sets: s, per: f, Q0, tL, treq: Tq, tco, Ea, ok, hours: ok ? s * tco / 60 : NaN, r: ad.r, A0: ad.A0 });
    }
    let best = null; rows.forEach(r => { if (r.ok && (!best || r.Ea > best.Ea)) best = r; });
    return { N, Zreq, Tq, Qmax, rows, best };
  }
  // flow that makes the advance take exactly tt minutes (bisection, advance time falls as flow rises)
  function flowForAdvance(o, tt, Qhi) {
    let lo = 1e-5, hi = Qhi; const t = q => advance(Object.assign({}, o, { Q0: q })).tL;
    if (!(t(hi) <= tt)) return { Q0: hi, capped: true, tL: t(hi) };
    for (let i = 0; i < 50; i++) { const m = Math.sqrt(lo * hi); if (t(m) > tt) lo = m; else hi = m; } return { Q0: hi, capped: false, tL: t(hi) };
  }
  // Eqs 6.15 to 6.18: two-bay cutback: advance at Q0 for tL = treq, then soak at Q0' = 1.1 f0 L for treq
  function furrowCutback(o) {
    const { Wf, w, Qs, L, K, n, S0, sh, Zdepth, umax } = o, N = Math.max(1, Math.round(Wf / w)), Zreq = Zdepth * w, Tq = treq(K, Zreq), Qmax = furrowQmax(umax, n, S0, sh);
    const fa = flowForAdvance({ L, K, n, S0, sh, sy: o.sy }, Tq, Qmax), Q0 = fa.Q0, Qc = 1.1 * K.f0 * L, tL = fa.capped ? fa.tL : Tq;
    const Ea = Zreq * L / (tL * (Q0 + Qc)), sets = []; let used = 0; for (let i = 0; i < 12 && used < N; i++) { const ni = i === 0 ? Qs / Q0 : (Qs - sets[i - 1] * Qc) / Q0; const c = Math.max(0, Math.min(Math.round(ni), N - used)); if (c <= 0) break; sets.push(c); used += c; }
    return { N, Zreq, Tq, Qmax, Q0, Qc, ratio: Qc / Q0, tL, tco: tL + Tq, Ea, capped: fa.capped, sets, covered: used };
  }
  // Eqs 6.19 to 6.22: tailwater reuse: advance in about 30 to 40 % of treq, runoff pumped back to the next set
  function furrowReuse(o, frac) {
    const { Wf, w, Qs, L, K, n, S0, sh, Zdepth, umax } = o, N = Math.max(1, Math.round(Wf / w)), Zreq = Zdepth * w, Tq = treq(K, Zreq), Qmax = furrowQmax(umax, n, S0, sh);
    const fa = flowForAdvance({ L, K, n, S0, sh, sy: o.sy }, (frac || 0.35) * Tq, Qmax), Q0 = o.Q0 != null ? o.Q0 : fa.Q0, ad = advance({ Q0, L, K, n, S0, sh, sy: o.sy });
    return reuseAt(Object.assign({}, o, { Q0, ad, Tq, Zreq, N, Qmax }));
  }
  function reuseAt(o) {
    const { Q0, ad, Tq, Zreq, N, L, K, Qs, Qmax } = o, tL = ad.tL, tco = Tq + tL; const M = 20; let V = 0, prev = Zin(K, tco);
    for (let i = 1; i <= M; i++) { const x = L * i / M, tx = Math.pow(x / ad.p, 1 / ad.r), tau = Math.max(tco - tx, 0), z = Zin(K, tau); V += (prev + z) / 2 * (L / M); prev = z; }
    const Vin = Q0 * tco, DPR = Math.max(0, (V - Zreq * L) / Vin), TWR = Math.max(0, (Vin - V) / Vin), Vtw = TWR * Vin, N1 = Math.floor(Qs / Q0), Vres = Vtw * N1, Qpb = Vres / tco, N2 = Math.floor((Qs + Qpb) / Q0);
    return { Q0, tL, treq: Tq, tco, Vin, Vinf: V, DPR, TWR, Ea: 1 - DPR, Vtw, N1, Vres, Qpb, N2, N, Qmax, frac: tL / Tq };
  }
  // ---- borders (Eqs 6.23 to 6.37) ----
  function borderCase(o, Q0) {
    const { L, S0, n, K, Zreq } = o, ad = advance({ Q0, L, K, n, S0, sh: SH_WIDE, sy: o.sy }), tL = ad.tL, Tq = treq(K, Zreq);
    if (!isFinite(tL)) return { Q0, tL: Infinity, ok: false, Tq };
    const y0 = A0of(Q0, n, S0, SH_WIDE), tr = Tq + tL, a = K.a;
    const Irate = T => (a * K.k / 2) * (Math.pow(T, a - 1) + Math.pow(Math.max(T - tL, 1e-6), a - 1)) + K.f0;
    const Sy = I => { const q = Math.max(Q0 - I * L, 1e-9); return Math.pow(q * n / (60 * Math.sqrt(S0)), 0.6) / L; };
    const dep = (I, S) => 0.095 * Math.pow(n, 0.47565) * Math.pow(S, 0.20735) * Math.pow(L, 0.6829) / (Math.pow(I, 0.52435) * Math.pow(S0, 0.237825));
    let T1 = tr, T2 = tr, I = 0, S = 0, hist = [];
    for (let i = 0; i < 40; i++) { I = Irate(T1); S = Sy(I); T2 = tr - dep(I, S); hist.push([T1, I, S, T2]); if (Math.abs(T2 - T1) < 0.05) break; T1 = T2; }
    const td = T2, Z0 = Zin(K, td); let tco, Ea, complete = Z0 >= Zreq, ZL = null, trec = tr;
    if (complete) { tco = td - y0 * L / (2 * Q0); Ea = Zreq * L / (Q0 * tco); }
    else {
      tco = Tq - y0 * L / (2 * Q0); I = (a * K.k / 2) * (Math.pow(Tq, a - 1) + Math.pow(Math.max(Tq - tL, 1e-6), a - 1)) + K.f0; S = Sy(I); trec = Tq + dep(I, S); ZL = Zin(K, trec - tL); Ea = Zreq * L / (Q0 * tco);
    }
    return { Q0, tL, tr, td, tco, Ea, y0, Z0, ZL, complete, ok: tco > 0 && isFinite(tco), Tq, r: ad.r, hist };
  }
  function borderOptions(o) {
    const Qa = Math.max(borderQmin(o.L, o.S0, o.n), 0.02), Qb = borderQmax(o.S0, o.sod), rows = []; const q0 = Math.min(Qa, Qb * 0.9), q1 = Qb;
    for (let i = 0; i < 14; i++) { const q = q0 * Math.pow(q1 / q0, i / 13), r = borderCase(o, q); r.Wb = o.Qs / q; r.nb = Math.max(1, Math.round(o.Wf / r.Wb)); rows.push(r); }
    let best = null; rows.forEach(r => { if (r.ok && r.Ea <= 1.0001 && (!best || r.Ea > best.Ea)) best = r; });
    // refine around the best by golden-section on log flow
    if (best) { let lo = best.Q0 / 1.25, hi = best.Q0 * 1.25, b2 = best; for (let i = 0; i < 24; i++) { const m1 = lo + (hi - lo) * 0.382, m2 = lo + (hi - lo) * 0.618, r1 = borderCase(o, m1), r2 = borderCase(o, m2); const e1 = r1.ok && r1.Ea <= 1 ? r1.Ea : -1, e2 = r2.ok && r2.Ea <= 1 ? r2.Ea : -1; if (e1 > e2) { hi = m2; if (e1 > b2.Ea) b2 = r1; } else { lo = m1; if (e2 > b2.Ea) b2 = r2; } } best = b2; }
    if (best) { best.Wb = o.Qs / best.Q0; best.nb = Math.max(1, Math.round(o.Wf / best.Wb)); }
    return { rows, best, Qmin: Qa, Qmax: Qb };
  }
  // ---- basins (Eqs 6.38 to 6.43) ----
  function basinCase(o, Q0) {
    const { L, n, K, Zreq } = o, ad = advance({ Q0, L, K, n, S0: null, sh: SH_WIDE, sy: o.sy }), tL = ad.tL, y0 = A0of(Q0, n, null, SH_WIDE, L), y0h = A0of(Q0, n, null, SH_WIDE, L / 2);
    if (!isFinite(tL)) return { Q0, tL: Infinity, ok: false };
    let tco = (Zreq * L - 0.8 * y0 * L) / Q0 + tL; if (tco < tL) tco = tL; const Ea = Zreq * L / (Q0 * tco);
    return { Q0, tL, tco, Ea, y0, y0h, ok: true, r: ad.r, Z0: Zin(K, tL) + 0.8 * y0 + Q0 * (tco - tL) / L };
  }
  function basinOptions(o) {
    const rows = []; for (let nb = 1; nb <= 12; nb++) { const Wb = o.Wf / nb; if (Wb < 5) break; const Q0 = o.Qs / Wb, r = basinCase(o, Q0); r.nb = nb; r.Wb = Wb; r.along = Math.max(1, Math.round((o.Lfield || o.L) / o.L)); r.hours = r.ok ? nb * r.along * r.tco / 60 : NaN; r.dike = r.y0h; rows.push(r); }
    let best = null; rows.forEach(r => { if (r.ok && r.Ea <= 1.0001 && (!best || r.Ea > best.Ea)) best = r; });
    return { rows, best, Qmax: basinQmax(o.vmax || 13, o.n, o.L) };
  }
  // ---- field indicators from Chapter 2 (Eqs 2.33 to 2.35) ----
  const ind = { DPR: (Vdp, Vap) => Vdp / Vap, TWR: (Vtw, Vap) => Vtw / Vap, Er: (Vst, Vpot) => Vst / Vpot };
  // ---- the book's own worked examples (inputs as printed, results as printed) ----
  const EXAMPLES = {
    furrowFirst: { name: 'Example 6.1 furrows, first irrigation', K: { k: 0.0028, a: 0.534, f0: 0.00022 }, sh: { rho1: 0.325, rho2: 2.734 }, n: 0.04, S0: 0.008, L: 200, w: 1.5, Wf: 720, Qs: 6, Zdepth: 0.1, umax: 13, sys: 'furrow' },
    furrowLater: { name: 'Example 6.1 furrows, later irrigations', K: { k: 0.0021, a: 0.331, f0: 0.00015 }, sh: { rho1: 0.325, rho2: 2.734 }, n: 0.04, S0: 0.008, L: 200, w: 1.5, Wf: 720, Qs: 6, Zdepth: 0.1, umax: 13, sys: 'furrow' },
    clayFirst: { name: 'Example 6.2 clay loam furrows, first irrigation', K: { k: 0.0036, a: 0.357, f0: 0.000046 }, sh: { rho1: 0.325, rho2: 2.734 }, n: 0.04, S0: 0.008, L: 200, w: 0.75, Wf: 720, Qs: 6, Zdepth: 0.1, umax: 8, sys: 'furrow' },
    clayLater: { name: 'Example 6.2 clay loam furrows, later irrigations', K: { k: 0.00383, a: 0.317, f0: 0.000035 }, sh: { rho1: 0.325, rho2: 2.734 }, n: 0.04, S0: 0.008, L: 200, w: 0.75, Wf: 720, Qs: 6, Zdepth: 0.1, umax: 8, sys: 'furrow' },
    borderFirst: { name: 'Example 6.4 border, first irrigation', K: { k: 0.0032, a: 0.49, f0: 0.000107 }, n: 0.04, S0: 0.001, L: 360, w: 1, Wf: 360, Qs: 8.64, Zdepth: 0.0525, sys: 'border' },
    borderLater: { name: 'Example 6.4 border, later irrigations', K: { k: 0.00327, a: 0.474, f0: 0.000098 }, n: 0.04, S0: 0.001, L: 360, w: 1, Wf: 360, Qs: 8.64, Zdepth: 0.0525, sys: 'border' },
    basinFirst: { name: 'Example 6.5 basin, first irrigation', K: { k: 0.0032, a: 0.49, f0: 0.000107 }, n: 0.04, S0: 0, L: 180, w: 1, Wf: 360, Qs: 12.6, Zdepth: 0.1, sys: 'basin' },
    basinLater: { name: 'Example 6.5 basin, later irrigations', K: { k: 0.00327, a: 0.474, f0: 0.000098 }, n: 0.04, S0: 0, L: 180, w: 1, Wf: 360, Qs: 12.6, Zdepth: 0.1, sys: 'basin' }
  };
  return { clamp, Zin, treq, shapeV, SH_WIDE, A0of, furrowQmax, borderQmax, borderQmin, basinQmax, advance, furrowOptions, flowForAdvance, furrowCutback, furrowReuse, reuseAt, borderCase, borderOptions, basinCase, basinOptions, ind, EXAMPLES };
})();
if (typeof module !== 'undefined') module.exports = WSB;
