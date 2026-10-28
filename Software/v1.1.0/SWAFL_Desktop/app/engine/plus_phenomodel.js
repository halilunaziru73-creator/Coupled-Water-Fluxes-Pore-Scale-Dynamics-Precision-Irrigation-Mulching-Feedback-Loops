/* SWAFL 1.1 Deterministic phenotyping: the model (no drawing, no random numbers).
   One run grows a plant for N days after emergence in a soil column, day by day, and returns every trait of the day.
   Same inputs always give the same plant (deterministic). The forms of the equations come from the literature:
     light interception  Monsi and Saeki (1953), biomass  Monteith (1977), transpiration limit  Tanner and Sinclair (1983),
     reference ET  FAO-56 Penman-Monteith (Allen et al., 1998), soil water  van Genuchten (1980), root water uptake  Feddes et al. (1978) and Gardner (1960),
     leaf water  van den Honert (1948), pressure-volume curve, expansion  Lockhart (1965), stomata  Jarvis (1976),
     canopy temperature and CWSI  Jackson et al. (1981), root growth  rule-based after ArchiSimple (Pages et al., 2014), carbon  functional equilibrium (Brouwer, 1963; Davidson, 1969).
   The books on phenotyping (Lorence and Medina-Jimenez, 2022; Panguluri and Kumar, 2013) define the traits that are read out:
   projected shoot area, convex hull and compactness (solidity), stay-green and senescence, canopy temperature depression, relative water content, root angle, depth and length. */
'use strict';
(function (root) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PI = Math.PI, D2R = PI / 180;
  const es = T => 0.6108 * Math.exp(17.27 * T / (T + 237.3));
  const dEs = T => 4098 * es(T) / ((T + 237.3) * (T + 237.3));

  // ---------------------------------------------------------------- species (typical literature values; the layer shows them)
  const SP = {
    maize: { name: 'Maize', c4: true, Tb: 8, Tc: [8, 30, 42], gddLeaf: 42, nLeaf: 16, anth: 750, mat: 1250, RUE: 3.4, k: 0.62, kte: 10, Hmax: 230, rH: 0.085, SLA: 0.021, Kcb: 1.15, SRL: 1200, LAImax: 5.5, A: 700, psi50: -1.3, psiPi: -1.1, rtlp: 0.80, ar: 0.11, fr0: 0.45, frA: 0.07, sow: 130, hull: 165,
      ax: { n0: 2, nMax: 12, gdd: 50, e0: 3.0, th: 42, g: 0.08, ang1: 75, rho1: 0.9, e1: 1.0, max1: 14, rho2: 0.45, e2: 0.5, max2: 2.5, tap: false } },
    sorghum: { name: 'Sorghum', c4: true, Tb: 8, Tc: [8, 30, 42], gddLeaf: 46, nLeaf: 18, anth: 800, mat: 1350, RUE: 3.2, k: 0.55, kte: 9.5, Hmax: 170, rH: 0.08, SLA: 0.020, Kcb: 1.0, SRL: 1300, LAImax: 5, A: 500, psi50: -1.7, psiPi: -1.3, rtlp: 0.78, ar: 0.10, fr0: 0.46, frA: 0.08, sow: 135, hull: 165,
      ax: { n0: 2, nMax: 10, gdd: 55, e0: 3.0, th: 35, g: 0.09, ang1: 75, rho1: 1.1, e1: 1.1, max1: 15, rho2: 0.5, e2: 0.5, max2: 2.5, tap: false } },
    wheat: { name: 'Wheat', c4: false, Tb: 0, Tc: [0, 20, 35], gddLeaf: 95, nLeaf: 8, anth: 800, mat: 1350, RUE: 2.8, k: 0.5, kte: 6, Hmax: 90, rH: 0.075, SLA: 0.024, Kcb: 1.1, SRL: 1600, LAImax: 6, A: 150, psi50: -1.6, psiPi: -1.3, rtlp: 0.80, ar: 0.045, fr0: 0.42, frA: 0.07, sow: 95, hull: 160,
      ax: { n0: 3, nMax: 9, gdd: 80, e0: 2.6, th: 40, g: 0.07, ang1: 75, rho1: 1.6, e1: 0.9, max1: 10, rho2: 0.6, e2: 0.4, max2: 2.0, tap: false } },
    bean: { name: 'Common bean', c4: false, Tb: 10, Tc: [10, 25, 38], gddLeaf: 60, nLeaf: 12, anth: 500, mat: 950, RUE: 2.2, k: 0.65, kte: 5.5, Hmax: 55, rH: 0.09, SLA: 0.030, Kcb: 1.05, SRL: 1400, LAImax: 4, A: 300, psi50: -1.0, psiPi: -1.0, rtlp: 0.82, ar: 0.65, fr0: 0.38, frA: 0.07, sow: 130, hull: 137.5,
      ax: { n0: 1, nMax: 5, gdd: 60, e0: 2.5, th: 8, g: 0.12, ang1: 70, rho1: 2.0, e1: 1.3, max1: 22, rho2: 0.8, e2: 0.6, max2: 3.0, tap: true } }
  };
  // ---------------------------------------------------------------- genotypes: the traits a phenotyping platform reads (angle, branching, stay-green, stomata, osmotic adjustment, carbon to roots)
  const GENO = [
    { id: 'ref', name: 'Reference', angle: 42, lat: 1, axr: 1, SG: 0.2, dpsi: 0, OA: 0.2, rpl: 0.22, rootC: 1, rue: 1, hyd: 0.5, roll: 0.5 },
    { id: 'deep', name: 'Deep rooting', angle: 24, lat: 0.7, axr: 1.25, SG: 0.2, dpsi: 0, OA: 0.2, rpl: 0.22, rootC: 1.15, rue: 1, hyd: 0.8, roll: 0.5 },
    { id: 'shallow', name: 'Shallow, dense', angle: 64, lat: 1.5, axr: 0.85, SG: 0.2, dpsi: 0, OA: 0.2, rpl: 0.22, rootC: 1, rue: 1, hyd: 0.3, roll: 0.5 },
    { id: 'stay', name: 'Stay-green', angle: 42, lat: 1, axr: 1, SG: 0.75, dpsi: 0, OA: 0.2, rpl: 0.22, rootC: 1, rue: 1, hyd: 0.5, roll: 0.5 },
    { id: 'saver', name: 'Water saver', angle: 42, lat: 1, axr: 1, SG: 0.2, dpsi: 0.5, OA: 0.1, rpl: 0.30, rootC: 1, rue: 0.97, hyd: 0.5, roll: 0.8 },
    { id: 'spender', name: 'Water spender', angle: 42, lat: 1, axr: 1, SG: 0.2, dpsi: -0.5, OA: 0, rpl: 0.18, rootC: 1, rue: 1.03, hyd: 0.5, roll: 0.2 },
    { id: 'osm', name: 'Osmotic adjuster', angle: 42, lat: 1, axr: 1, SG: 0.2, dpsi: 0, OA: 0.75, rpl: 0.22, rootC: 1, rue: 1, hyd: 0.5, roll: 0.5 }
  ];

  // ---------------------------------------------------------------- weather: a deterministic season of the project climate (sums of sines for the weather of the days)
  function ra(doy, lat) {
    const phi = lat * D2R, dr = 1 + 0.033 * Math.cos(2 * PI * doy / 365), dl = 0.409 * Math.sin(2 * PI * doy / 365 - 1.39), ws = Math.acos(clamp(-Math.tan(phi) * Math.tan(dl), -1, 1));
    return { Ra: 24 * 60 / PI * 0.0820 * dr * (ws * Math.sin(phi) * Math.sin(dl) + Math.cos(phi) * Math.cos(dl) * Math.sin(ws)), N: 24 * ws / PI };
  }
  function weather(env, N) {
    const out = []; const lat = env.lat == null ? 55.7 : env.lat, Tm = env.Tm == null ? 8.5 : env.Tm, Ta = env.Tamp == null ? 8.2 : env.Tamp, dT = env.dT || 0;
    const rawRain = [], rm = [];
    for (let d = 0; d < N; d++) { const s = Math.sin(2 * PI * d / 4.3 + 0.2) + 0.8 * Math.sin(2 * PI * d / 7.7 + 1.9) + 0.6 * Math.sin(2 * PI * d / 12.1 + 3.3); rawRain.push(Math.max(0, s - 1.15)); }
    let sumRaw = rawRain.reduce((a, b) => a + b, 0) || 1, sumMean = 0;
    for (let d = 0; d < N; d++) { const doy = (env.sow + d) % 365; rm.push((env.rain || 464) / 365 * (1 + 0.35 * Math.sin(2 * PI * (doy - 140) / 365))); sumMean += rm[d]; }
    for (let d = 0; d < N; d++) {
      const doy = (env.sow + d) % 365, nn = clamp(0.5 + 0.3 * Math.sin(2 * PI * d / 5.3 + 1.1) + 0.2 * Math.sin(2 * PI * d / 9.1 + 0.3) + 0.08 * Math.sin(2 * PI * d / 2.9 + 2), 0.05, 0.95);
      const syn = 2.6 * Math.sin(2 * PI * d / 6.1 + 0.7) + 1.8 * Math.sin(2 * PI * d / 11.3 + 2.1) + 1.2 * Math.sin(2 * PI * d / 19.7 + 4.0);
      const Tmean = Tm + Ta * Math.sin(2 * PI * (doy - 110) / 365) + syn + dT, dtr = 3 + 8 * nn, Tmax = Tmean + 0.5 * dtr, Tmin = Tmean - 0.5 * dtr;
      const R = ra(doy, lat), Rs = R.Ra * (0.25 + 0.5 * nn), Tdew = Tmin - 3.0 + 0.4 * dT, ea = es(Tdew), esm = 0.5 * (es(Tmax) + es(Tmin)), u2 = 2.6 + 0.8 * Math.sin(2 * PI * d / 4.7 + 0.5);
      const Rns = 0.77 * Rs, Rso = 0.75 * R.Ra, Rnl = 4.903e-9 * 0.5 * (Math.pow(Tmax + 273.16, 4) + Math.pow(Tmin + 273.16, 4)) * (0.34 - 0.14 * Math.sqrt(ea)) * (1.35 * Math.min(Rs / Rso, 1) - 0.35), Rn = Rns - Rnl;
      const del = dEs(Tmean), gam = 0.000665 * 101.3, et0 = Math.max(0, (0.408 * del * Rn + gam * 900 / (Tmean + 273) * u2 * (esm - ea)) / (del + gam * (1 + 0.34 * u2)));
      const Td = 0.65 * Tmax + 0.35 * Tmin, vpd = Math.max(0.1, es(Td) - ea);
      let P = 0; if (env.rainMode !== 'none') { P = env.realRain ? (env.realRain[d] || 0) * (env.rainMult || 1) : rawRain[d] / sumRaw * sumMean * (env.rainMult || 1); }
      out.push({ Tmean, Tmax, Tmin, Rs, ea, vpd, u2, et0, P, N: R.N, nn, Rn });
    }
    return out;
  }

  // ---------------------------------------------------------------- soil: van Genuchten retention and Mualem conductivity on a table of depletion (0 field capacity, 1 wilting point), and the structure of the tilled soil
  const NL = 8, DZ = 15, ZMAX = NL * DZ;
  function soilTable(vg) {
    const a = vg[0], n = vg[1], m = 1 - 1 / n, S = h => Math.pow(1 + Math.pow(a * Math.max(h, 1), n), -m), s100 = S(100), s15 = S(15849), M = 200, h = [], kr = [];
    for (let i = 0; i <= M; i++) { const f = i / M; let lo = 0, hi = 4.6; for (let j = 0; j < 50; j++) { const mid = (lo + hi) / 2, ff = (s100 - S(Math.pow(10, mid))) / (s100 - s15); if (ff < f) lo = mid; else hi = mid; } const hh = Math.pow(10, (lo + hi) / 2); h.push(hh); const se = S(hh); kr.push(Math.sqrt(se) * Math.pow(1 - Math.pow(1 - Math.pow(se, 1 / m), m), 2)); }
    const k0 = kr[0] || 1; for (let i = 0; i <= M; i++) kr[i] = Math.min(1, kr[i] / k0);   // relative to the conductivity at field capacity
    return { M, h, kr };
  }
  const lut = (tab, arr, f) => { const x = clamp(f, 0, 1) * tab.M, i = Math.min(tab.M - 1, Math.floor(x)), t = x - i; return arr[i] * (1 - t) + arr[i + 1] * t; };
  // bulk density of every layer on the day: the tilled topsoil settles with the consolidation rate (V3), a pan sits under conventional tillage
  function bulkDensity(soil, d) {
    const clay = soil.clay, top = 1.50 - 0.004 * clay, tilled = { conv: 1.10, reduced: 1.22, notill: 1.38 }[soil.till] || 1.10, tc = soil.tc || 0.005, out = [];
    const pan = { conv: 0.07, reduced: 0.035, notill: 0 }[soil.till] || 0;
    for (let i = 0; i < NL; i++) {
      const z = (i + 0.5) * DZ;
      if (z <= 25) out.push(top - (top - tilled) * Math.exp(-tc * (d + (soil.age || 0))) * (z <= 15 ? 1 : 0.6));
      else if (z <= 40) out.push(top + 0.08 + pan);
      else out.push(top + 0.08 + 0.02 * (z - 40) / 80);
    }
    return out;
  }
  // penetration resistance (MPa) from bulk density and dryness, and the relative elongation of a root tip that meets it
  const strength = (bd, srel) => 0.5 * Math.exp(4.5 * (bd - 1.3)) * (1 + 1.0 * (1 - clamp(srel, 0, 1)));
  const relElong = Q => 1 / (1 + Math.pow(Q / 2.5, 3));

  // ---------------------------------------------------------------- the daily run
  function run(cfg) {
    const sp = SP[cfg.species], G = cfg.geno, env = cfg.env, N = cfg.N || 140, store = !!cfg.store, tr = cfg.treatment, dr = cfg.drought || { type: 'none' };
    const soil = cfg.soil, tab = soil.tab, awcL = soil.awc * DZ, A = cfg.area || sp.A, Rpot = Math.sqrt(A / PI), W = cfg.weather || weather(env, N);
    const R = { N, sp, G, A, Rpot, day: [], W };
    const ser = k => (R[k] = new Float32Array(N));
    ['Tc', 'Ta', 'CTD', 'CWSI', 'gs', 'psiL', 'RWC', 'turg', 'Tp', 'T', 'Es', 'I', 'P', 'drain', 'store', 'dW', 'dWr', 'dL', 'fl', 'fs', 'fr', 'fg', 'Wl', 'Ws', 'Wr', 'Wg', 'Wres', 'LAIg', 'LAIs', 'SI', 'H', 'PSA', 'hullA', 'solid', 'cal', 'nLeaf', 'Lroot', 'Rdepth', 'D50', 'D95', 'rs', 'phi', 'Ks', 'stage', 'gdd', 'tgt', 'RLmax', 'Fint', 'AE', 'roll', 'fE', 'Ts'].forEach(ser);
    R.w = new Float32Array(N * NL); R.up = new Float32Array(N * NL); R.Lz = new Float32Array(N * NL); R.Q = new Float32Array(N * NL); R.bd = new Float32Array(N * NL);
    const w = new Float32Array(NL).fill(awcL * 0.95), Lz = new Float64Array(NL);
    let inbound = 0, lostG = 0, gdd = 0, gEff = 0, ldd = 0, Wl = 1.2, Ws = 0.5, Wr = 0.8, Wg = 0, Wres = 28, LAIg = 0.05, LAIs = 0, H = 3, Hs = 0, Ts = W[0].Tmean, Ue = 0, t2 = 0, st1 = true, pool = 0, gsPrev = 1, Lall = 0, OAs = 0, stressMem = 0, matured = false;
    const senRate = G.SG;
    // root system: tips, with the vertices of the path so that laterals sit where the parent has grown
    const tips = []; let nid = 0; const segs = store ? { x0: [], y0: [], z0: [], x1: [], y1: [], z1: [], d: [], o: [] } : null;
    const axA = sp.ax, nAxMax = Math.max(1, Math.round(axA.nMax * (G.nAx || 1))), thAx = G.angle;
    function newTip(ord, par, x, y, z, dx, dy, dz, azim, gsa, e0, maxLen, born) {
      const n = Math.hypot(dx, dy, dz) || 1; const t = { id: nid++, ord, par, x, y, z, dx: dx / n, dy: dy / n, dz: dz / n, az: azim, gsa, e0, maxLen, born, len: 0, active: true, nextLat: 0, vx: [x], vy: [y], vz: [z], vc: [0] };
      t.nextLat = ord === 0 ? 2.5 : (ord === 1 ? 1.0 : 1e9); tips.push(t); return t;
    }
    // first axes: the seed root
    const axStart = j => { const az = j * 137.5 * D2R, th = j === 0 ? (axA.tap ? 6 : 10) * D2R : (thAx + 3 * Math.floor(j / 2)) * D2R; return { az, th }; };
    const first = axStart(0); newTip(0, -1, 0, 0, 0, Math.sin(first.th) * Math.cos(first.az), Math.cos(first.th), Math.sin(first.th) * Math.sin(first.az), first.az, first.th, axA.e0 * (G.axr || 1), 1e9, 0);
    let axBorn = 1; Lz[0] = 40; Lz[1] = 14; Lall = 54;
    const wCol = f => f; // placeholder for readability
    const feddes = (h, tp) => { const h3 = tp >= 5 ? 300 : (tp <= 1 ? 600 : 600 - (tp - 1) / 4 * 300), h4 = 15849; return h <= 100 ? 1 : (h <= h3 ? 1 : (h >= h4 ? 0 : (h4 - h) / (h4 - h3))); };
    const psiPV = (RWC, pi0, rtlp) => { const P = RWC > rtlp ? -pi0 * (RWC - rtlp) / (1 - rtlp) : 0; return pi0 / RWC + P; };
    const rwcFrom = (psi, pi0, rtlp) => { if (psi >= 0) return 1; let lo = 0.35, hi = 1; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (psiPV(m, pi0, rtlp) < psi) lo = m; else hi = m; } return 0.5 * (lo + hi); };
    const target = d => { // water supplied by the experiment as a fraction of the plant-available water of the whole column
      if (tr === 'ww' || dr.type === 'none') return 1; const o = dr.onset, L = dr.len, L1 = Math.round(L / 2), phi = dr.sev / 100;
      if (dr.type === 'pulse') return d < o ? 1 : d < o + L1 ? phi : d < o + L ? phi * 0.67 : 1;
      if (dr.type === 'terminal') return d < o ? 1 : 0;
      if (dr.type === 'inter') { if (d < o) return 1; const per = Math.max(3, Math.round(L / 2)); return ((d - o) % (2 * per)) < per ? phi : 1; }
      return 1;
    };
    const sheltered = d => tr === 'dr' && dr.type !== 'none' && (dr.rainOut !== false) && d >= dr.onset && (dr.type !== 'pulse' || d < dr.onset + dr.len) && (dr.type !== 'inter' || true);
    const infil = (j, amt) => { let a = amt, dr0 = 0; w[j] += a; for (let i = j; i < NL; i++) { if (w[i] > awcL) { const ex = w[i] - awcL; w[i] = awcL; if (i === NL - 1) dr0 += ex; else w[i + 1] += ex; } else break; } return dr0; };
    let tot = { P: 0, I: 0, T: 0, Es: 0, dr: 0 };
    for (let d = 0; d < N; d++) {
      const wx = W[d]; R.Ta[d] = wx.Tmean; Ts += (wx.Tmean - Ts) / 4; R.Ts[d] = Ts;
      // temperature responses: development (degree days), growth (beta function), roots (Q10)
      const dg = Math.max(0, Math.min(wx.Tmean, sp.Tc[1] + 6) - sp.Tb); gdd += dg; R.gdd[d] = gdd;
      const Td = 0.65 * wx.Tmax + 0.35 * wx.Tmin, [T0, T1, T2] = sp.Tc, fT = Td <= T0 || Td >= T2 ? 0 : Math.pow((T2 - Td) / (T2 - T1), (T2 - T1) / (T2 - T1)) * Math.pow((Td - T0) / (T1 - T0), (T1 - T0) / (T2 - T1));
      const fTr = clamp(Math.pow(2, (Ts - 20) / 10), 0.05, 1.8);
      const stage = gdd < sp.anth ? gdd / sp.anth : 1 + (gdd - sp.anth) / (sp.mat - sp.anth); R.stage[d] = stage; if (stage >= 2) matured = true;
      // water supply of the day (experiment, rain), soil evaporation, drainage
      let I = 0, P = 0, drain = 0; const sumW = () => { let s = 0; for (let i = 0; i < NL; i++) s += w[i]; return s; };
      if (!sheltered(d) && wx.P > 0) { P = wx.P; drain += infil(0, P); }
      const tg = target(d); R.tgt[d] = tg; const awcT = awcL * NL; let rw = 0, rwa = 0; for (let i = 0; i < NL; i++) { const q = Lz[i] + 0.02 * Lz[0] + 1; rw += q * w[i]; rwa += q * awcL; }   // the experiment holds the water of the root zone (weighted by the roots) at the set-point, like weighing the pot
      if (tg > rw / rwa + 0.01) { I = Math.min(tg * awcT - sumW(), (tg - rw / rwa) * awcT); if (I > 0.05) drain += infil(0, I); else I = 0; }
      const fi = 1 - Math.exp(-sp.k * (LAIg + 0.3 * LAIs)), Kcb = Math.min(sp.Kcb, 1.0 * sp.Kcb * fi + 0.0);
      const Tp = wx.et0 * Math.min(1.25, sp.Kcb * fi * 1.0), Ep = wx.et0 * (1 - fi) * 0.9;
      // evaporation of the soil (Ritchie, two stages)
      const U0 = 6 + 0.05 * soil.clay * 1.2, alp = 3.5 + 0.02 * soil.clay;
      if (P + I > 0) { const inp = P + I; Ue = Math.max(0, Ue - inp); if (Ue < U0) { st1 = true; t2 = 0; } }
      let Es = 0; if (st1) { Es = Ep; if (Ue + Es >= U0) { st1 = false; t2 = 1; Es = Math.max(0, U0 - Ue); } Ue += Es; } else { t2++; Es = Math.min(Ep, alp * (Math.sqrt(t2) - Math.sqrt(t2 - 1))); Ue += Es; }
      { let left = Es, got = 0; for (const [i, wt] of [[0, 0.7], [1, 0.3]]) { const take = Math.min(left * wt + 1e-9, Math.max(0, w[i] - 0.02 * awcL)); w[i] -= take; got += take; } Es = got; }
      // roots: length per cm2 of ground in every layer, penetration resistance, uptake with the Feddes reduction and the conductivity of the soil (Gardner, Mualem)
      const bd = bulkDensity(soil, d), Rl = new Float64Array(NL); let Lsum = 0; for (let i = 0; i < NL; i++) { Rl[i] = Lz[i] / A; Lsum += Rl[i]; }
      const frel = new Float64Array(NL), hh = new Float64Array(NL), kr = new Float64Array(NL), psiS = new Float64Array(NL);
      for (let i = 0; i < NL; i++) { frel[i] = clamp(1 - w[i] / awcL, 0, 1); hh[i] = lut(tab, tab.h, frel[i]); kr[i] = lut(tab, tab.kr, frel[i]); psiS[i] = -hh[i] * 9.80665e-5; R.Q[d * NL + i] = strength(bd[i], w[i] / awcL); R.bd[d * NL + i] = bd[i]; }
      // uptake: every layer is a conductance (root length x fine roots x conductivity of the soil, Gardner, Mualem); the root collar potential is the one that gives the transpiration that the stomata ask for
      const FINE = soil.fine || 4, qG = soil.qG || 0.05, Gi = new Float64Array(NL), S = new Float64Array(NL); let Gs = 0, Gp = 0; for (let i = 0; i < NL; i++) { Gi[i] = Rl[i] * FINE * qG * 10 * kr[i]; Gs += Gi[i]; Gp += Gi[i] * psiS[i]; }
      const psiPre = Gs > 1e-9 ? Gp / Gs : psiS[0], PSIMIN = -2.5;
      const flux = pr => { let t = 0; for (let i = 0; i < NL; i++) t += Math.min(w[i], Math.max(0, Gi[i] * (psiS[i] - pr))); return t; };
      let gs = gsPrev, psiL = 0, Tact = 0, psiR = psiPre;
      const LAIu = Math.max(0.3, LAIg), pi0 = sp.psiPi - G.OA * Math.min(1, OAs), psi50 = sp.psi50 + G.dpsi;
      const g0 = psi => 1 / (1 + Math.exp(-4.5 * (psi - psi50)));
      for (let it = 0; it < 6; it++) {
        const Td_ = Tp * gs; let lo = PSIMIN, hi = 0;
        if (flux(PSIMIN) <= Td_) psiR = PSIMIN; else { for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); if (flux(m) > Td_) lo = m; else hi = m; } psiR = 0.5 * (lo + hi); }
        Tact = 0; for (let i = 0; i < NL; i++) { S[i] = Math.min(w[i], Math.max(0, Gi[i] * (psiS[i] - psiR))); Tact += S[i]; }
        psiL = psiR - G.rpl * (Tact / LAIu); if (Tact < 1e-6) psiL = psiPre;
        const gn = clamp(g0(psiL) / g0(-0.2), 0, 1); gs = 0.5 * gs + 0.5 * gn;
      }
      const psiSe = psiPre;
      gsPrev = gs; for (let i = 0; i < NL; i++) { w[i] = Math.max(0, w[i] - S[i]); R.up[d * NL + i] = S[i]; }
      // plant water status: relative water content and turgor from the pressure-volume curve of the leaf
      const RWC = rwcFrom(psiL, pi0, sp.rtlp), RWCn = rwcFrom(psiSe, pi0, sp.rtlp), turg = RWC > sp.rtlp ? (RWC - sp.rtlp) / (1 - sp.rtlp) : 0, turgN = RWCn > sp.rtlp ? (RWCn - sp.rtlp) / (1 - sp.rtlp) : 0, Y = 0.25, fE = clamp((turgN - Y) / (1 - Y), 0, 1);   // cells grow at night, at the predawn water potential of the soil
      OAs += (0.05 * (1 - Math.min(1, Tact / Math.max(0.05, Tp))) - 0.01 * OAs); OAs = clamp(OAs, 0, 1);
      // canopy temperature (Jackson et al., 1981): energy balance with the canopy resistance of the stomata
      const Ta = wx.Tmean + 0.35 * (wx.Tmax - wx.Tmean) * 2, Rmid = Math.PI / 2 * wx.Rs * 1e6 / (wx.N * 3600), Rn = Math.max(0, 0.77 * Rmid - 70) * 0.9, ra_ = 30 * Math.sqrt(2.6 / Math.max(0.5, wx.u2)), rcMin = 80, laiE = 1;   // a leaf in the image: boundary layer and stomata of the leaf
      const del = dEs(Ta), gam = 0.066, rhoCp = 1200, vpd = Math.max(0.1, es(Ta) - wx.ea), rc = rcMin / (Math.max(0.03, gs) * laiE), rcp = rcMin / laiE;
      const dTf = rcc => { const gst = gam * (1 + rcc / ra_); return (ra_ * Rn / rhoCp) * gst / (del + gst) - vpd / (del + gst); };
      const dTc = dTf(rc), dTll = dTf(rcp), dTul = ra_ * Rn / rhoCp, cw = clamp((dTc - dTll) / Math.max(0.2, dTul - dTll), 0, 1);
      // biomass: light (Monteith) against the water it can transpire (Tanner and Sinclair); seed reserve at the start
      const PAR = 0.48 * wx.Rs, Apot = sp.RUE * G.rue * fT * PAR * fi, vpdD = wx.vpd, TEcap = sp.kte / Math.max(0.3, vpdD) * Tact;
      let dW = Math.min(Apot, TEcap), seed = Wres * 0.07; Wres -= seed; dW += seed; if (stage >= 2) dW = 0;
      // partition: leaves and stems share what is left after the roots (functional equilibrium: more to the roots when water is short) and the grain
      const frd = sp.fr0 + (sp.frA - sp.fr0) * clamp(stage, 0, 1), wStress = clamp(1 - Tact / Math.max(0.05, Tp), 0, 1), fr = clamp(frd * G.rootC * (1 + 0.9 * wStress), 0.03, 0.7);
      const fg = stage < 1 ? 0 : clamp(0.85 * (stage - 1) / 0.12, 0, 0.85) * (stage < 2 ? 1 : 0), shoot = Math.max(0, 1 - fr - fg), lshare = clamp(0.72 - 0.62 * clamp(stage, 0, 1.0), 0.08, 0.72);
      let fl = shoot * lshare, fs = shoot - fl;
      // leaf area: carbon makes area at the specific leaf area, the turgor of the cells (Lockhart) limits the expansion; the extra carbon is kept in the stem
      const dLc = sp.SLA * fl * dW, rg = 0.0117 * dg, dLp = stage < 1 ? Math.max(0.0003, rg * LAIg * (1 - LAIg / sp.LAImax)) * fE : 0, dLAI = Math.min(dLc, dLp * 1.0 + 0.0002);
      const used = sp.SLA > 0 ? dLAI / sp.SLA : 0, extra = Math.max(0, fl * dW - used); fl = dW > 0 ? used / dW : 0; fs = dW > 0 ? Math.max(0, 1 - fl - fr - fg) : 0;
      Wl += used; Ws += fs * dW; Wr += fr * dW; Wg += fg * dW;
      // senescence: development (delayed by stay-green) plus water stress; the dead area is kept
      const dev = stage < 1 ? 0.0015 : 0.004 + 0.05 * Math.pow(clamp(stage - 1, 0, 1), 1.5), strR = 0.035 * Math.pow(wStress, 1.2) + 0.12 * clamp((0.78 - RWC) / 0.15, 0, 1);
      const sen = LAIg * clamp((dev * (1 - senRate) + strR * (1 - 0.6 * senRate)) * (stage < 1 ? 1 : 1), 0, 0.25);
      LAIg = Math.max(0.01, LAIg + dLAI - sen); LAIs = Math.max(0, LAIs + sen * 0.97 - 0.004 * LAIs);
      if (stage >= 2) { Wl *= 0.999; }
      // height: logistic elongation by temperature and turgor
      if (stage < 1.05) { gEff += dg * fE; lostG += dg * (1 - fE); } const rHg = Math.log(sp.Hmax / 3 - 1) / (0.6 * sp.anth), Hm = sp.Hmax * clamp(1 - 0.9 * lostG / (0.75 * sp.anth), 0.45, 1); H = clamp(Hm / (1 + (Hm / 3 - 1) * Math.exp(-rHg * gEff)), 3, sp.Hmax);   // shorter stems when the cells did not expand   // stem length by the thermal time that the turgor allowed
      // leaf development clock slows with the turgor
      ldd += Math.max(0, Math.min(wx.Tmean, sp.Tc[1] + 6) - sp.Tb) * (0.35 + 0.65 * Math.sqrt(fE)); const nL = clamp(Math.floor(ldd / sp.gddLeaf) + 2, 2, Math.round(sp.nLeaf * 1.0));
      // roots: the carbon of the roots (with a delay of one day) sets how much new root can be made
      const dWr = fr * dW; pool += inbound; inbound = dWr * (A / 1e4) * sp.SRL; const supply = pool;   // the carbon of the roots arrives one day after it is made
      while (axBorn < nAxMax && (axBorn - 1) * axA.gdd * 0.7 + axA.gdd <= gdd) {
        const s = axStart(axBorn); newTip(0, -1, 0, 0, 0, Math.sin(s.th) * Math.cos(s.az), Math.cos(s.th), Math.sin(s.th) * Math.sin(s.az), s.az, s.th, axA.e0 * (G.axr || 1) * (1 - 0.03 * axBorn), 1e9, d); axBorn++;
      }
      // potential growth of every tip
      const fW = i => clamp((w[i] / awcL - 0.06) / 0.5, 0.05, 1), act = [], pot = []; let demand = 0;
      const stopAx = stage > 1.45, ageF = stage > 1 ? Math.max(0.2, 1 - (stage - 1) * 1.6) : 1; const layerOf = y => clamp(Math.floor(y / DZ), 0, NL - 1);
      for (const t of tips) {
        if (!t.active) continue; if (t.ord === 0 && stopAx) { t.active = false; continue; }
        const li = layerOf(t.y), fQ = relElong(R.Q[d * NL + li]), mult = t.ord === 0 ? 1 : (t.ord === 1 ? 1 : 1), sp_ = t.e0 * fTr * fQ * fW(li) * ageF;
        act.push(t); pot.push(sp_); demand += sp_;
      }
      const have = Math.min(supply, demand * 1.0), c = demand > 0 ? clamp(supply / demand, 0, 1) : 1; pool = Math.max(0, supply - demand) * 0.75;
      R.rs[d] = c; let newL = 0;
      for (let k = 0; k < act.length; k++) {
        const t = act[k], step = pot[k] * c; if (step <= 1e-4) continue;
        // direction: gravitropism towards the set-point angle, water-seeking, a small wobble of the soil
        const gk = t.ord === 0 ? axA.g : 0.045, th = t.gsa; let tx = Math.sin(th) * Math.cos(t.az), ty = Math.cos(th), tz = Math.sin(th) * Math.sin(t.az);
        if (t.ord > 0) { const f = clamp(t.len / 12, 0, 1); tx = tx * (1 - 0.4 * f); ty = ty * (1 + 0.5 * f); }
        let dx = t.dx + gk * step * (tx - t.dx), dy = t.dy + gk * step * (ty - t.dy), dz = t.dz + gk * step * (tz - t.dz);
        const li = layerOf(t.y), lj = Math.min(NL - 1, li + 1), dW_ = (w[lj] / awcL - w[li] / awcL); dy += G.hyd * 0.6 * dW_ * step * 0.2;
        const wb = 0.06 * Math.sin(0.43 * t.len + t.id * 1.7); dx += wb * step * Math.cos(t.az + 1.3); dz += wb * step * Math.sin(t.az + 1.3);
        let n = Math.hypot(dx, dy, dz) || 1; dx /= n; dy /= n; dz /= n;
        let nx = t.x + dx * step, ny = t.y + dy * step, nz = t.z + dz * step; const rr = Math.hypot(nx, nz);
        if (rr > Rpot * 0.97) { const f = Rpot * 0.97 / rr, ux = nx / rr, uz = nz / rr; nx *= f; nz *= f; const rad = dx * ux + dz * uz; if (rad > 0) { dx -= rad * ux; dz -= rad * uz; dy += 0.25; n = Math.hypot(dx, dy, dz) || 1; dx /= n; dy /= n; dz /= n; } }
        if (ny >= ZMAX - 0.5) { ny = ZMAX - 0.5; t.active = false; }
        const L = Math.hypot(nx - t.x, ny - t.y, nz - t.z); if (store) { segs.x0.push(t.x); segs.y0.push(t.y); segs.z0.push(t.z); segs.x1.push(nx); segs.y1.push(ny); segs.z1.push(nz); segs.d.push(d); segs.o.push(t.ord); }
        Lz[layerOf(0.5 * (t.y + ny))] += L; newL += L; t.x = nx; t.y = ny; t.z = nz; t.dx = dx; t.dy = dy; t.dz = dz; t.len += L; t.vx.push(nx); t.vy.push(ny); t.vz.push(nz); t.vc.push(t.len);
        if (t.ord > 0 && t.len >= t.maxLen) t.active = false;
        // laterals: at the density of the genotype, a few days behind the tip
        if (t.ord < 2) {
          const rho = (t.ord === 0 ? axA.rho1 : axA.rho2) * (G.lat || 1) * (0.3 + 0.7 * Math.exp(-t.y / 55)), gap = 1 / Math.max(0.05, rho), zone = t.e0 * 2.0;   // fewer laterals deeper
          while (t.len - zone >= t.nextLat && tips.length < 5200) {
            const pos = t.nextLat; t.nextLat += gap; let q = 1; while (q < t.vc.length - 1 && t.vc[q] < pos) q++; const f0 = (pos - t.vc[q - 1]) / Math.max(1e-6, t.vc[q] - t.vc[q - 1]);
            const px = t.vx[q - 1] + f0 * (t.vx[q] - t.vx[q - 1]), py = t.vy[q - 1] + f0 * (t.vy[q] - t.vy[q - 1]), pz = t.vz[q - 1] + f0 * (t.vz[q] - t.vz[q - 1]);
            const phi = (t.id * 1.9 + Math.round(pos / gap) * 2.4), be = (axA.ang1 + (t.ord === 1 ? 5 : 0)) * D2R, ux = Math.cos(phi), uz = Math.sin(phi);
            // a unit vector perpendicular to the parent
            let ax_ = -t.dz, az_ = t.dx; const nn = Math.hypot(ax_, az_) || 1; ax_ /= nn; az_ /= nn; const bx = t.dy * az_, bz = -t.dy * ax_, by = t.dz * ax_ - t.dx * az_;
            const px2 = Math.cos(be) * t.dx + Math.sin(be) * (Math.cos(phi) * ax_ + Math.sin(phi) * bx), py2 = Math.cos(be) * t.dy + Math.sin(be) * (Math.sin(phi) * by), pz2 = Math.cos(be) * t.dz + Math.sin(be) * (Math.cos(phi) * az_ + Math.sin(phi) * bz);
            const az2 = Math.atan2(pz2, px2), e2 = t.ord === 0 ? axA.e1 : axA.e2, mx = t.ord === 0 ? axA.max1 : axA.max2; if (py < ZMAX - 3) newTip(t.ord + 1, t.id, px, py, pz, px2, Math.abs(py2) < 0.1 ? 0.25 : py2, pz2, az2, (t.ord === 0 ? 62 : 70) * D2R, e2, mx * (0.7 + 0.3 * Math.sin(1.3 * t.id + pos)), d);
          }
        }
      }
      Lall += newL;
      // root depth, depth of 50 and 95 percent of the root length
      let zr = 0; for (const t of tips) if (t.y > zr) zr = t.y; let cum = 0, d50 = 0, d95 = 0; const Ltot = Lz.reduce((a, b) => a + b, 0) || 1; for (let i = 0; i < NL; i++) { cum += Lz[i]; if (!d50 && cum >= 0.5 * Ltot) d50 = (i + 1) * DZ - DZ * (cum - 0.5 * Ltot) / Math.max(1e-9, Lz[i]); if (!d95 && cum >= 0.95 * Ltot) d95 = (i + 1) * DZ - DZ * (cum - 0.95 * Ltot) / Math.max(1e-9, Lz[i]); }
      // record
      R.Tp[d] = Tp; R.T[d] = Tact; R.Es[d] = Es; R.I[d] = I; R.P[d] = P; R.drain[d] = drain; R.store[d] = sumW(); R.dW[d] = dW; R.dWr[d] = dWr; R.dL[d] = newL; R.fl[d] = fl; R.fs[d] = fs; R.fr[d] = fr; R.fg[d] = fg;
      R.Wl[d] = Wl; R.Ws[d] = Ws; R.Wr[d] = Wr; R.Wg[d] = Wg; R.Wres[d] = Wres; R.LAIg[d] = LAIg; R.LAIs[d] = LAIs; R.SI[d] = 100 * LAIs / Math.max(1e-6, LAIg + LAIs); R.H[d] = H; R.nLeaf[d] = nL;
      R.gs[d] = gs; R.psiL[d] = psiL; R.RWC[d] = RWC; R.turg[d] = turg; R.fE[d] = fE; R.Tc[d] = Ta + dTc; R.CTD[d] = -dTc; R.CWSI[d] = cw; R.Ks[d] = Tp > 1e-4 ? Tact / Tp : 1; R.Lroot[d] = Ltot; R.Rdepth[d] = zr; R.D50[d] = d50; R.D95[d] = d95; R.Fint[d] = fi; R.AE[d] = Apot; R.phi[d] = Ta + dTul;
      R.roll[d] = clamp((0.9 - RWC) / 0.2, 0, 1) * (0.4 + G.roll);
      for (let i = 0; i < NL; i++) { R.w[d * NL + i] = w[i] / awcL; R.Lz[d * NL + i] = Lz[i]; }
      tot.P += P; tot.I += I; tot.T += Tact; tot.Es += Es; tot.dr += drain;
    }
    // shoot geometry of every day (leaves, projected area, convex hull, solidity): what an image of the plant would give
    for (let d = 0; d < N; d++) { const g = leaves(R, d); R.PSA[d] = g.psa; R.hullA[d] = g.hull; R.solid[d] = g.solid; R.cal[d] = g.caliper; }
    R.totals = tot; R.store0 = awcL * NL * 0.95; R.segs = segs ? { n: segs.d.length, x0: Float32Array.from(segs.x0), y0: Float32Array.from(segs.y0), z0: Float32Array.from(segs.z0), x1: Float32Array.from(segs.x1), y1: Float32Array.from(segs.y1), z1: Float32Array.from(segs.z1), d: Int16Array.from(segs.d), o: Uint8Array.from(segs.o) } : null;
    R.nTips = tips.length; R.Ltotal = Lall; R.awcT = awcL * NL;
    return R;
  }

  // ---------------------------------------------------------------- the leaves of the plant on one day
  function hullArea(pts) {
    if (pts.length < 3) return 0; const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    const up = []; for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    const h = lo.slice(0, -1).concat(up.slice(0, -1)); let a = 0; for (let i = 0; i < h.length; i++) { const j = (i + 1) % h.length; a += h[i][0] * h[j][1] - h[j][0] * h[i][1]; } return { area: Math.abs(a) / 2, pts: h };
  }
  function leaves(R, d, rot) {
    const sp = R.sp, n = Math.max(2, Math.round(R.nLeaf[d])), A = R.A, tot = (R.LAIg[d] + R.LAIs[d]) * A, ldd = d; rot = rot || 0;
    const wts = []; let sw = 0; for (let j = 0; j < n; j++) { const age = Math.min(1, (n - j) / 3.2), shape = Math.pow(Math.sin(PI * (0.12 + 0.78 * (j + 0.5) / sp.nLeaf)), 1.4), wj = shape * (j === n - 1 ? 0.35 : (j === n - 2 ? 0.75 : 1)) * (0.35 + 0.65 * age); wts.push(wj); sw += wj; }
    const L = []; let senLeft = R.LAIs[d] * A; const roll = R.roll[d]; const pts = [[0, 0]]; let proj = 0, cal = 0;
    for (let j = 0; j < n; j++) {
      const a = tot * wts[j] / sw, len = Math.sqrt(a / (0.72 * sp.ar)), sj = Math.min(a, senLeft); senLeft -= sj; const gf = a > 0 ? 1 - sj / a : 1;
      const elev = clamp((72 - 38 * j / sp.nLeaf - 14 * (1 - gf) + 9 * roll) * D2R, 0.15, 1.45), az = j * sp.hull * D2R + rot, reach = len * Math.cos(elev) * (0.85 - 0.12 * (j / sp.nLeaf)), hgt = R.H[d] * (0.14 + 0.78 * (j + 0.5) / n);
      const wr = 1 - 0.5 * roll; proj += a * Math.cos(elev) * wr; L.push({ j, a, len, gf, elev, az, reach, hgt, wr });
      const x = reach * Math.cos(az), y = reach * Math.sin(az), hw = 0.5 * len * sp.ar * wr * 0.9, nx = -Math.sin(az) * hw, ny = Math.cos(az) * hw; pts.push([x, y]); pts.push([0.55 * x + nx, 0.55 * y + ny]); pts.push([0.55 * x - nx, 0.55 * y - ny]); pts.push([0.5 * nx, 0.5 * ny]); pts.push([-0.5 * nx, -0.5 * ny]); cal = Math.max(cal, 2 * reach);
    }
    const hl = hullArea(pts), ha = hl ? hl.area : 0, solid = ha > 5 ? 1 - Math.exp(-proj / ha) : NaN, psa = ha > 5 ? ha * solid : proj;
    return { leaves: L, psa, hull: ha, solid, caliper: cal, hullPts: hl ? hl.pts : [] };
  }

  const api = { SP, GENO, NL, DZ, ZMAX, weather, soilTable, bulkDensity, strength, relElong, run, leaves, es, dEs };
  root.PHENO = api; if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
