/* Daisy computations in the browser:
   - van Genuchten and Mualem soil hydraulics of the Daisy horizons and a 1-D Richards equation solver (the empty daisy-model/richards-equation repository)
   - the Daisy denitrification function (daisy-model/python-extensions)
   - parameter optimisers: sequential, CMA-ES and Bayesian (the methods of daisy-model/daisypy-optim)
   - the DMI open data client and the closest station (daisy-model/tools, python-dmi-open-data, geodaisy)
   Works in the browser (global DaisyCalc) and in node (module.exports). */
(function (root) {
  'use strict';
  const C = {};
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // ------------------------------------------------------------------ soil hydraulics: van Genuchten retention, Mualem conductivity
  // p: { alpha (1/cm), n, Ks (cm/h), Ths, Thr, l }  Daisy gives K_sat in cm/h, alpha in 1/cm and head in cm
  C.hydraulics = function (p) {
    const al = p.alpha, n = p.n, m = 1 - 1 / n, ths = p.Ths, thr = p.Thr || 0, Ks = (p.Ks || 1) * 24, l = p.l != null ? p.l : 0.5;   // Ks in cm/day
    const Se = h => h >= 0 ? 1 : Math.pow(1 + Math.pow(al * -h, n), -m);
    const theta = h => thr + (ths - thr) * Se(h);
    const K = h => { const s = Se(h); if (s >= 1) return Ks; const a = 1 - Math.pow(1 - Math.pow(s, 1 / m), m); return Ks * Math.pow(s, l) * a * a; };
    const Cap = h => { if (h >= 0) return 1e-6; const s = Se(h), sm = Math.pow(s, 1 / m); return Math.max(1e-9, al * m / (1 - m) * (ths - thr) * sm * Math.pow(1 - sm, m)); };
    // the head at a given water content (inverse of the retention curve)
    const head = th => { const s = clamp((th - thr) / (ths - thr), 1e-9, 1); if (s >= 1) return 0; return -Math.pow(Math.pow(s, -1 / m) - 1, 1 / n) / al; };
    return { Se, theta, K, C: Cap, head, p, Ks };
  };
  // field capacity (-100 cm as in Daisy), wilting point (-15000 cm) and available water of a horizon
  C.fcwp = function (p) { const H = C.hydraulics(p); const fc = H.theta(-100), wp = H.theta(-15000); return { fc, wp, aw: fc - wp, sat: p.Ths, H }; };
  C.retentionCurve = function (p, n) { const H = C.hydraulics(p), o = []; n = n || 60; for (let i = 0; i <= n; i++) { const pF = -0.5 + 5.2 * i / n, h = -Math.pow(10, pF); o.push({ pF, h, theta: H.theta(h), K: H.K(h) }); } return o; };
  // a Daisy horizon (library.json) to the parameters above
  C.fromHorizon = function (hz) { const y = hz.hy; if (!y || !y.alpha) return null; return { alpha: y.alpha, n: y.n, Ks: y.K_sat, Ths: y.Theta_sat, Thr: y.Theta_res || 0, l: y.l }; };

  // ------------------------------------------------------------------ Richards equation, one dimension, vertical
  // mixed form, implicit in time, finite volumes on nodes, Picard iteration with the mass-conserving capacity term (Celia et al. 1990).
  // x is the depth below the surface (cm, down), h the pressure head (cm), downward flux q = K (1 - dh/dx).
  // layers: [{ depth (cm, bottom of the layer), hy: {alpha, n, Ks, Ths, Thr, l} }]
  // forcing per day: rain (mm), Es (mm/day, soil evaporation demand), Tp (mm/day, potential transpiration), zr (cm, rooting depth)
  C.richardsGen = function* (o) {
    const dz = o.dz || 2, zmax = o.layers[o.layers.length - 1].depth, N = Math.round(zmax / dz) + 1, days = o.days, rain = o.rain || [], Es = o.Es || [], Tp = o.Tp || [], zrD = o.zr || [];
    const x = new Float64Array(N); for (let i = 0; i < N; i++) x[i] = i * dz;
    const Hs = o.layers.map(L => C.hydraulics(L.hy)), LI = Array.from(x, xx => { for (let k = 0; k < o.layers.length; k++) if (xx <= o.layers[k].depth + 1e-9) return k; return o.layers.length - 1; }), hy = i => Hs[LI[i]];
    const bottom = o.bottom || { type: 'free' }, hair = -1e4, V = i => (i === 0 || i === N - 1) ? dz / 2 : dz;
    let h = new Float64Array(N); for (let i = 0; i < N; i++) { const f = C.fcwp(hy(i).p); h[i] = o.h0 != null ? (Array.isArray(o.h0) ? o.h0[i] : o.h0) : hy(i).head(f.wp + clamp(o.init != null ? o.init : 0.7, 0, 1.2) * (f.fc - f.wp)); }
    if (bottom.type === 'table') { const hb = bottom.depth - x[N - 1]; if (hb > -1e5) for (let i = N - 1; i >= 0; i--) if (h[i] < -(x[N - 1] - x[i])) { /* keep: the profile above the table starts as given */ } h[N - 1] = hb; }
    const feddes = hh => { const a = -hh; if (a < 25) return clamp(a / 25, 0, 1); if (a <= 500) return 1; if (a >= 15000) return 0; return 1 - (a - 500) / 14500; };
    const thetaAll = hh => { const t = new Float64Array(N); for (let i = 0; i < N; i++) t[i] = hy(i).theta(hh[i]); return t; };
    const store = hh => { const t = thetaAll(hh); let s = 0; for (let i = 0; i < N; i++) s += t[i] * V(i); return s * 10; };   // mm
    const out = { x: Array.from(x), days, theta: [], h: [], infil: [], runoff: [], evap: [], transp: [], drain: [], store: [], err: [], iters: [], layers: o.layers };
    let dtc = 0.02, totIt = 0;
    for (let day = 0; day < days; day++) {
      const P = (rain[day] || 0) / 10, E = (Es[day] || 0) / 10, T = (Tp[day] || 0) / 10, zr = Math.max(5, zrD[day] != null ? zrD[day] : 40), S0 = store(h);
      const w = new Float64Array(N); let ws = 0; for (let i = 0; i < N; i++) { w[i] = x[i] < zr ? 1 - x[i] / zr : 0; ws += w[i] * V(i); }
      let t = 0, infil = 0, ro = 0, ev = 0, tr = 0, dr = 0, nit = 0, it0 = 0;
      while (t < 1 - 1e-9) {
        let dt = Math.min(dtc, 1 - t), done = false, tries = 0, noPond = false;
        while (!done) {
          tries++; const hn = Float64Array.from(h), tn = thetaAll(h); let conv = false, ponded = false, dried = false, last = null;
          for (let it = 0; it < 40; it++) {
            const a = new Float64Array(N), b = new Float64Array(N), c = new Float64Array(N), d = new Float64Array(N), K = new Float64Array(N), Cc = new Float64Array(N), th = new Float64Array(N), S = new Float64Array(N);
            for (let i = 0; i < N; i++) { const H = hy(i); K[i] = H.K(hn[i]); Cc[i] = H.C(hn[i]); th[i] = H.theta(hn[i]); }
            if (T > 0 && ws > 0) for (let i = 0; i < N; i++) S[i] = w[i] / ws * T * feddes(hn[i]);
            for (let i = 0; i < N; i++) {
              const Km = i > 0 ? 0.5 * (K[i] + K[i - 1]) : 0, Kp = i < N - 1 ? 0.5 * (K[i] + K[i + 1]) : 0, Vi = V(i);
              a[i] = i > 0 ? -Km / dz : 0; c[i] = i < N - 1 ? -Kp / dz : 0; b[i] = Vi * Cc[i] / dt + (Km + Kp) / dz;
              d[i] = Vi * Cc[i] * hn[i] / dt - Vi * (th[i] - tn[i]) / dt - S[i] * Vi;
              if (i === 0) d[i] += (P - E) - Kp; else if (i === N - 1) { d[i] += Km - (bottom.type === 'free' ? K[i] : 0); } else d[i] += Km - Kp;
            }
            if (ponded) { a[0] = 0; c[0] = 0; b[0] = 1; d[0] = 0; } else if (dried) { a[0] = 0; c[0] = 0; b[0] = 1; d[0] = hair; }
            if (bottom.type === 'table') { a[N - 1] = 0; c[N - 1] = 0; b[N - 1] = 1; d[N - 1] = bottom.depth - x[N - 1]; }
            const hh = thomas(a, b, c, d); let md = 0; const th2 = thetaAll(hh); for (let i = 0; i < N; i++) { md = Math.max(md, Math.abs(th2[i] - th[i])); }
            for (let i = 0; i < N; i++) hn[i] = clamp(hh[i], -1e6, 0.5 * dz > 0 ? 50 : 0); nit++;
            last = { K, Cc, th: th2, S };
            // surface conditions: flux limited by infiltration capacity (h = 0) or by the air-dry soil
            if (!ponded && hn[0] > 0) { if (noPond) hn[0] = 0; else { ponded = true; continue; } }
            if (!dried && !ponded && hn[0] < hair && (P - E) < 0) { dried = true; continue; }
            if (md < (o.tol || 2e-7)) { conv = true; break; }
          }
          if (!conv && dt > 2e-6) { dt *= 0.3; if (tries > 25) done = true; continue; }
          // accept the step: the fluxes from the balance of the nodes
          const K = last.K, th2 = thetaAll(hn);
          if (ponded && !noPond) { const q0c = V(0) * (th2[0] - tn[0]) / dt + (T > 0 && ws > 0 ? w[0] / ws * T * feddes(hn[0]) * V(0) : 0) + 0.5 * (K[0] + K[1]) * (1 - (hn[1] - hn[0]) / dz); if (q0c > (P - E) + 1e-7) { noPond = true; continue; } } let uptake = 0; if (T > 0 && ws > 0) for (let i = 0; i < N; i++) uptake += w[i] / ws * T * feddes(hn[i]) * V(i);
          const q0 = V(0) * (th2[0] - tn[0]) / dt + (T > 0 && ws > 0 ? w[0] / ws * T * feddes(hn[0]) * V(0) : 0) + 0.5 * (K[0] + K[1]) * (1 - (hn[1] - hn[0]) / dz);     // net downward flux at the surface, cm/day
          let qb = 0; if (bottom.type === 'free') qb = hy(N - 1).K(hn[N - 1]); else if (bottom.type === 'table') { const Kk = 0.5 * (K[N - 1] + K[N - 2]); qb = Kk * (1 - (hn[N - 1] - hn[N - 2]) / dz) - V(N - 1) * (th2[N - 1] - tn[N - 1]) / dt - (T > 0 && ws > 0 ? w[N - 1] / ws * T * feddes(hn[N - 1]) * V(N - 1) : 0); }
          // surface: rain P and demand E; what is not taken in runs off, what the dry soil cannot give is not evaporated
          let eAct = E, run = 0; if (ponded) run = Math.max(0, (P - E) - q0); if (dried) eAct = Math.max(0, P - q0);
          infil += Math.max(0, P - run) * dt; ro += run * dt; ev += eAct * dt; tr += uptake * dt; dr += Math.max(0, qb) * dt;
          h = Float64Array.from(hn); t += dt; done = true; if (nit - it0 <= 5) dtc = Math.min(0.12, dt * 1.3); else if (nit - it0 > 10) dtc = Math.max(1e-5, dt * 0.6); else dtc = dt; it0 = nit;
        }
      }
      const Sn = store(h); out.theta.push(Array.from(thetaAll(h), v => +v.toFixed(4))); out.h.push(Array.from(h, v => +v.toFixed(1)));
      out.infil.push(+(infil * 10).toFixed(3)); out.runoff.push(+(ro * 10).toFixed(3)); out.evap.push(+(ev * 10).toFixed(3)); out.transp.push(+(tr * 10).toFixed(3)); out.drain.push(+(dr * 10).toFixed(3)); out.store.push(+Sn.toFixed(2));
      out.err.push(+(Sn - S0 - (infil - ev - tr - dr) * 10).toFixed(3)); out.iters.push(nit); totIt += nit; if (o.onDay) o.onDay(day, days); yield day;
    }
    out.totalIterations = totIt; return out;
  };
  C.richards = o => { const g = C.richardsGen(o); let r; while (!(r = g.next()).done); return r.value; };
  function thomas(a, b, c, d) { const n = b.length, cp = new Float64Array(n), dp = new Float64Array(n); cp[0] = c[0] / b[0]; dp[0] = d[0] / b[0]; for (let i = 1; i < n; i++) { const m = b[i] - a[i] * cp[i - 1]; cp[i] = c[i] / m; dp[i] = (d[i] - a[i] * dp[i - 1]) / m; } const r = new Float64Array(n); r[n - 1] = dp[n - 1]; for (let i = n - 2; i >= 0; i--) r[i] = dp[i] - cp[i] * r[i + 1]; return r; }

  // ------------------------------------------------------------------ denitrification, as in the Daisy default model
  const plf = (xs, ys, x0) => { if (x0 <= xs[0]) return ys[0]; if (x0 >= xs[xs.length - 1]) return ys[ys.length - 1]; for (let i = 1; i < xs.length; i++) if (x0 <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x0 - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
  C.pressureResponse = h => { if (h >= 0) return 0.6; const pF = Math.log10(-h); if (pF <= 0) return 0.6; if (pF <= 1.5) return 0.6 + 0.4 * pF / 1.5; if (pF <= 2.5) return 1; if (pF <= 6.5) return 1 - (pF - 2.5) / 4; return 0; };
  C.denitrification = function (a) {
    const wfps = a.Theta / a.Theta_sat, fw = plf([0, 0.4, 0.5, 0.57, 0.64, 0.71, 0.76, 0.81, 0.85, 0.9, 1], [0, 0.01, 0.07, 0.17, 0.32, 0.51, 0.66, 0.79, 0.9, 1, 1], wfps);
    // Daisy passes the reaction CO2 values that are already corrected for the pressure response (c' = 0.6 c / hc); the regulation by CO2 uses the uncorrected value c = c' hc / 0.6.
    // a.rawCO2 = true: the values given are the uncorrected ones and the correction is applied here (the form of the python extension).
    const hc = C.pressureResponse(a.h); let CO2 = a.CO2_C, CO2f = a.CO2_C_fast, CO2mass;
    if (a.rawCO2 && hc !== 0) { CO2mass = a.CO2_C * 0.001 * 30 * 1e8 * 24; CO2f = CO2f / hc * 0.6; CO2 = CO2 / hc * 0.6; } else CO2mass = (hc !== 0 ? a.CO2_C * hc / 0.6 : a.CO2_C) * 0.001 * 30 * 1e8 * 24;
    const alpha = a.alpha != null ? a.alpha : 0.0001, alphaF = a.alphaF != null ? a.alphaF : 0.05302701196829458, Kd = a.Kd != null ? a.Kd : 0.020833, fT = a.fT != null ? a.fT : 1;
    const potF = fT * alphaF * CO2f, potS = fT * alpha * (CO2 - CO2f), pot = potF + potS, rateF = fw * potF, rateS = fw * potS;
    const act = Math.min(rateS, Kd * a.NO3) + Math.min(rateF, Kd * a.NO3), no3m = a.NO3 / a.rho_b * 1e6;
    const frNO3 = (1 - (0.5 + Math.atan(Math.PI * 0.01 * (no3m - 190)) / Math.PI)) * 25, frCO2 = 13 + 30.78 * Math.atan(Math.PI * 0.07 * (CO2mass - 13)) / Math.PI, frW = 1.4 / Math.pow(13, 17 / Math.pow(13, 2.2 * wfps)), fr = Math.min(frNO3, frCO2) * frW * (a.frS != null ? a.frS : 1);
    return { 'N2O-Denit': act / (1 + fr), 'N2-Denit': act / (1 + 1 / fr), NO3: -act, 'Actual-Denit': act, 'Potential-Denit': pot, wfps, fw };
  };

  // ------------------------------------------------------------------ optimisers (daisypy-optim): sequential, CMA-ES, Bayesian
  // params: [{ name, lo, hi, init, log, values? }]  f(x: {name: value}) returns the loss (number or promise)
  C.loss = { mse: (a, t) => { let s = 0, n = 0; a.forEach((v, i) => { if (isFinite(v) && isFinite(t[i])) { s += (v - t[i]) * (v - t[i]); n++; } }); return n ? s / n : Infinity; }, mae: (a, t) => { let s = 0, n = 0; a.forEach((v, i) => { if (isFinite(v) && isFinite(t[i])) { s += Math.abs(v - t[i]); n++; } }); return n ? s / n : Infinity; }, ssd: (a, t) => { let s = 0; a.forEach((v, i) => { if (isFinite(v) && isFinite(t[i])) s += (v - t[i]) * (v - t[i]); }); return s; } };
  const toX = (p, u) => p.values ? p.values[Math.min(p.values.length - 1, Math.floor(u * p.values.length))] : (p.log ? Math.exp(Math.log(p.lo) + u * (Math.log(p.hi) - Math.log(p.lo))) : p.lo + u * (p.hi - p.lo));
  const toU = (p, v) => p.values ? p.values.indexOf(v) / Math.max(1, p.values.length - 1) : (p.log ? (Math.log(v) - Math.log(p.lo)) / (Math.log(p.hi) - Math.log(p.lo)) : (v - p.lo) / (p.hi - p.lo));
  const mk = (ps, u) => { const o = {}; ps.forEach((p, i) => { o[p.name] = toX(p, clamp(u[i], 0, 1)); }); return o; };
  let seed = 42; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  C.seed = s => { seed = s >>> 0; };
  // sequential: every continuous parameter gets a few values; each in turn is changed from the current set, the single change that gains most is kept, repeat until no gain
  C.optSequential = async function (ps, f, o) {
    o = o || {}; const ns = o.samples || 3, tried = new Map(), hist = []; let cur = ps.map(p => p.init != null ? toU(p, p.init) : 0.5), fixed = new Set(); let evals = 0;
    const ev = async u => { const k = u.map(v => v.toFixed(5)).join(','); if (tried.has(k)) return tried.get(k); const x = mk(ps, u), y = await f(x); evals++; tried.set(k, y); hist.push({ x, y, i: evals }); if (o.onSample) o.onSample({ x, y, i: evals }); return y; };
    let best = await ev(cur); let step = 0;
    while (fixed.size < ps.length && !(o.budget && evals >= o.budget) && !(o.cancel && o.cancel())) {
      step++; let bi = -1, bv = best, bu = null;
      for (let i = 0; i < ps.length; i++) { if (fixed.has(i)) continue; const grid = ps[i].values ? ps[i].values.map((v, k) => k / Math.max(1, ps[i].values.length - 1)) : Array.from({ length: ns }, (_, k) => (k + 0.5) / ns); let imp = false;
        for (const g of grid) { if (Math.abs(g - cur[i]) < 1e-9) continue; const u = cur.slice(); u[i] = ps[i].values ? g : g; const y = await ev(u); if (y < bv) { bv = y; bi = i; bu = u; imp = true; } if (o.budget && evals >= o.budget) break; }
        if (!imp) fixed.add(i); }
      if (bi < 0) break; cur = bu; best = bv; fixed.add(bi); if (o.onStep) o.onStep({ step, best, x: mk(ps, cur) });
    }
    return { x: mk(ps, cur), y: best, hist, evals };
  };
  // CMA-ES (full covariance, rank-mu and rank-one updates) in the unit cube
  C.optCMA = async function (ps, f, o) {
    o = o || {}; const n = ps.length, lam = o.popsize || (4 + Math.floor(3 * Math.log(n))), mu = Math.floor(lam / 2), hist = []; let evals = 0, sigma = o.sigma || 0.3, m = ps.map(p => p.init != null ? toU(p, p.init) : 0.5);
    let wts = Array.from({ length: mu }, (_, i) => Math.log(mu + 0.5) - Math.log(i + 1)); const ws = wts.reduce((a, b) => a + b, 0); wts = wts.map(w => w / ws); const mueff = 1 / wts.reduce((a, w) => a + w * w, 0);
    const cc = (4 + mueff / n) / (n + 4 + 2 * mueff / n), cs = (mueff + 2) / (n + mueff + 5), c1 = 2 / ((n + 1.3) * (n + 1.3) + mueff), cmu = Math.min(1 - c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) * (n + 2) + mueff)), damps = 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (n + 1)) - 1) + cs, chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));
    let pc = new Array(n).fill(0), psg = new Array(n).fill(0), B = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0)), D = new Array(n).fill(1), Cm = B.map(r => r.slice()), best = { y: Infinity, x: null }, gen = 0;
    const eigen = M => { // Jacobi eigen decomposition of a symmetric matrix
      const A = M.map(r => r.slice()), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0)); for (let sw = 0; sw < 60; sw++) { let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j]; if (off < 1e-20) break; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) { if (Math.abs(A[p][q]) < 1e-14) continue; const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c; for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; } for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; } for (let k = 0; k < n; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; } } } return { d: A.map((r, i) => Math.sqrt(Math.max(1e-20, r[i]))), V }; };
    while (!(o.budget && evals >= o.budget) && !(o.cancel && o.cancel()) && gen < (o.maxGen || 200)) {
      gen++; const pop = []; for (let k = 0; k < lam; k++) { const z = Array.from({ length: n }, gauss), y = B.map((row, i) => row.reduce((s, b, j) => s + b * D[j] * z[j], 0)), u = m.map((mi, i) => clamp(mi + sigma * y[i], 0, 1)), x = mk(ps, u), fy = await f(x); evals++; hist.push({ x, y: fy, i: evals }); if (o.onSample) o.onSample({ x, y: fy, i: evals, gen }); pop.push({ z, y, u, fy }); if (fy < best.y) best = { y: fy, x }; }
      pop.sort((a, b) => a.fy - b.fy); const old = m.slice(); m = m.map((_, i) => pop.slice(0, mu).reduce((s, p, k) => s + wts[k] * p.u[i], 0)); const yw = m.map((v, i) => (v - old[i]) / sigma);
      // invsqrtC * yw
      const t1 = B.map((_, j) => B.reduce((s, row, i) => s + row[j] * yw[i], 0) / D[j]), iy = B.map(row => row.reduce((s, b, j) => s + b * t1[j], 0));
      psg = psg.map((v, i) => (1 - cs) * v + Math.sqrt(cs * (2 - cs) * mueff) * iy[i]); const nps = Math.sqrt(psg.reduce((s, v) => s + v * v, 0)), hs = nps / Math.sqrt(1 - Math.pow(1 - cs, 2 * gen)) / chiN < 1.4 + 2 / (n + 1) ? 1 : 0;
      pc = pc.map((v, i) => (1 - cc) * v + hs * Math.sqrt(cc * (2 - cc) * mueff) * yw[i]);
      Cm = Cm.map((row, i) => row.map((v, j) => (1 - c1 - cmu) * v + c1 * (pc[i] * pc[j] + (1 - hs) * cc * (2 - cc) * v) + cmu * pop.slice(0, mu).reduce((s, p, k) => s + wts[k] * p.y[i] * p.y[j], 0)));
      sigma *= Math.exp((cs / damps) * (nps / chiN - 1)); sigma = clamp(sigma, 1e-6, 1); const E = eigen(Cm); D = E.d; B = E.V; if (o.onStep) o.onStep({ step: gen, best: best.y, x: best.x, sigma });
      if (sigma < 1e-4) break;
    }
    return { x: best.x, y: best.y, hist, evals };
  };
  // Bayesian: Gaussian process with a squared-exponential kernel, next point by expected improvement on random candidates
  C.optBayes = async function (ps, f, o) {
    o = o || {}; const n = ps.length, hist = [], X = [], Y = []; const budget = o.budget || 30, n0 = Math.max(3, Math.min(8, n * 2)); let evals = 0, best = { y: Infinity, x: null };
    const run = async u => { const x = mk(ps, u), y = await f(x); evals++; X.push(u); Y.push(y); hist.push({ x, y, i: evals }); if (o.onSample) o.onSample({ x, y, i: evals }); if (y < best.y) best = { y, x }; };
    await run(ps.map(p => p.init != null ? toU(p, p.init) : 0.5)); for (let i = 1; i < n0; i++) await run(ps.map(() => rnd()));
    const cdf = z => 0.5 * (1 + erf(z / Math.SQRT2)), pdf = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    while (evals < budget && !(o.cancel && o.cancel())) {
      const mu0 = Y.reduce((a, b) => a + b, 0) / Y.length, sd0 = Math.sqrt(Y.reduce((a, b) => a + (b - mu0) * (b - mu0), 0) / Y.length) || 1, yn = Y.map(v => (v - mu0) / sd0), ls = 0.35, k = (a, b) => Math.exp(-a.reduce((s, v, i) => s + (v - b[i]) * (v - b[i]), 0) / (2 * ls * ls)), m = X.length, K = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => k(X[i], X[j]) + (i === j ? 1e-4 : 0)));
      // Cholesky
      const L = Array.from({ length: m }, () => new Array(m).fill(0)); for (let i = 0; i < m; i++) for (let j = 0; j <= i; j++) { let s = K[i][j]; for (let q = 0; q < j; q++) s -= L[i][q] * L[j][q]; L[i][j] = i === j ? Math.sqrt(Math.max(1e-10, s)) : s / L[j][j]; }
      const solve = b => { const z = new Array(m); for (let i = 0; i < m; i++) { let s = b[i]; for (let q = 0; q < i; q++) s -= L[i][q] * z[q]; z[i] = s / L[i][i]; } const r = new Array(m); for (let i = m - 1; i >= 0; i--) { let s = z[i]; for (let q = i + 1; q < m; q++) s -= L[q][i] * r[q]; r[i] = s / L[i][i]; } return r; }, al = solve(yn), fb = Math.min(...yn); let bu = null, be = -1;
      for (let c = 0; c < 400; c++) { const u = c < 300 ? ps.map(() => rnd()) : ps.map((_, i) => clamp(toU(ps[i], best.x[ps[i].name]) + 0.08 * gauss(), 0, 1)), ks = X.map(xx => k(u, xx)), mean = ks.reduce((s, v, i) => s + v * al[i], 0), v = solve(ks), vr = Math.max(1e-9, 1 - ks.reduce((s, q, i) => s + q * v[i], 0)), sd = Math.sqrt(vr), z = (fb - mean) / sd, ei = (fb - mean) * cdf(z) + sd * pdf(z); if (ei > be) { be = ei; bu = u; } }
      await run(bu); if (o.onStep) o.onStep({ step: evals, best: best.y, x: best.x });
    }
    return { x: best.x, y: best.y, hist, evals };
  };

  // ------------------------------------------------------------------ DMI open data (climateData and metObs), key typed by the user
  C.DMI = function (key, api) {
    const base = 'https://dmigw.govcloud.dk/v2/' + (api || 'metObs');
    async function q(service, params, fetcher) { const u = new URL(base + '/' + service); Object.entries(Object.assign({ 'api-key': key }, params)).forEach(([k, v]) => { if (v != null && v !== '') u.searchParams.set(k, v); }); const r = await (fetcher || fetch)(u.toString()); if (!r.ok) { let m = ''; try { m = (await r.json()).message || ''; } catch (e) {} throw new Error('DMI answered ' + r.status + (m ? ': ' + m : '')); } return r.json(); }
    const hav = (a, b, c, d) => { const R = 6371, t = x => x * Math.PI / 180, dl = t(c - a), dn = t(d - b), s = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); };
    return {
      stations: async (limit, fetcher) => (await q('collections/station/items', { limit: limit || 10000 }, fetcher)).features || [],
      observations: async (p, fetcher) => (await q('collections/observation/items', { parameterId: p.parameter, stationId: p.station, datetime: p.from + '/' + p.to, limit: p.limit || 10000, offset: p.offset || 0 }, fetcher)).features || [],
      climate: async (p, fetcher) => (await q('collections/stationValue/items', { parameterId: p.parameter, stationId: p.station, datetime: p.from + '/' + p.to, timeResolution: p.res || 'day', limit: p.limit || 10000, offset: p.offset || 0 }, fetcher)).features || [],
      // the station that is nearest to a point and measures the wanted parameters
      closest: (stations, lat, lon, pars) => { let b = null, bd = Infinity; stations.forEach(s => { const g = s.geometry && s.geometry.coordinates; if (!g) return; const pr = s.properties || {}; if (pars && pars.length && pr.parameterId && !pars.every(p => pr.parameterId.includes(p))) return; if (pr.status && pr.status !== 'Active') return; const d = hav(lat, lon, g[1], g[0]); if (d < bd) { bd = d; b = { station: s, km: d }; } }); return b; },
      hav
    };
  };
  // DMI daily climate parameters: mean temperature, precipitation, global radiation, potential evaporation
  C.DMI_PARAMS = { tmean: 'mean_temp', tmax: 'mean_daily_max_temp', tmin: 'mean_daily_min_temp', precip: 'acc_precip', rad: 'mean_radiation', pet: 'acc_potential_evaporation' };

  if (typeof module !== 'undefined' && module.exports) module.exports = C; else root.DaisyCalc = C;
})(typeof window !== 'undefined' ? window : globalThis);
