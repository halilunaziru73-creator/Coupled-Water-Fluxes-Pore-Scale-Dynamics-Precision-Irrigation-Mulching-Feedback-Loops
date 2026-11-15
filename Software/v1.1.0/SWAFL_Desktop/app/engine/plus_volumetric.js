/* SWAFL 1.1 layer P2 Volumetric phenotyping.
   A virtual scanner looks at the plant of the Deterministic phenotyping layer (P1) the way a stereo-camera rig looks at a seedling on a turntable:
   every view is a point cloud with its own frame, the frames are joined with calibration spheres (self-registration, SR) and refined with the
   iterative closest point algorithm (ICP), and the volume, the crown width, the height, the leaf area and the leaves are measured from the joined cloud.
   Method after Wang et al. (2025, Frontiers in Plant Science 16:1642388: structure from motion and multi-view stereo, six views of 60 degrees, spheres, SR-ICP)
   and Zhu et al. (2018: pre-processing, clustering of the points of a leaf by their angle round the stem, surface of each leaf).
   Nothing here is random between runs: the plant, the scanner errors and the registration are computed from the project (soil, tillage, weather, irrigation,
   mulch, crop) through the plant of P1, so every control of the project moves the volume of the canopy. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || !window.PHUI || !window.PLUSKIT || !window.PHENO) return;
  const U = window.PHUI, K = window.PLUSKIT, P = window.PHENO, PH = U.PH, HEAD = '#1B1F23', MUTE = '#5A5F66', NAVY = '#1B3A6B', GRID = '#E6E2D6', INK = '#1B1F23';
  const TF = window.PLUSKIT.TF, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, D2R = Math.PI / 180, N = U.N;
  const VP = { trt: 'dr', nV: 6, reg: 'icp', fit: 'ransac', scal: true, noise: 0.8, vox: 0.6, rot: 0.6, col: 'natural', drag: null, cache: {}, jobs: [], ser: null, serKey: '', ranKey: '' };
  const SLd = [];                                    // the sliders of this layer
  const ROTB = { x: 0, y: 0, w: 0, h: 0 };
  // ---------------------------------------------------------------- numbers: seeded random draws (the same inputs always give the same scan)
  const rng = seed => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * r()); };
  const Rr = t => PH.run && PH.run[t];
  const trtName = t => t === 'ww' ? U.RNc() : 'Drought';

  // ---------------------------------------------------------------- 1. the plant as a cloud of surface points (the truth the scanner is compared with)
  function truthCloud(R, d) {
    const g = P.leaves(R, d, 0), L = g.leaves, H = Math.max(3, R.H[d]); let tot = 0; L.forEach(l => { tot += l.a; });
    const dens = clamp(5200 / Math.max(tot, 1), 0.12, 45), rand = rng(9173 + d * 31), X = [], Y = [], Z = [], KD = [], LF = [], ED = [];
    const rs = clamp(0.25 + H * 0.004, 0.3, 1.3), ns = Math.max(14, Math.round(H * 2.2));
    for (let i = 0; i < ns; i++) { const a = rand() * 6.2832, z = rand() * H * 0.97; X.push(rs * Math.cos(a)); Y.push(rs * Math.sin(a)); Z.push(z); KD.push(1); LF.push(-1); ED.push(0); }
    const prof = s => Math.pow(Math.sin(Math.PI * Math.pow(s, 0.85)), 0.9);
    let wsum = 0, nl = 0, lsum = 0;
    L.forEach(l => {
      const n = Math.max(8, Math.round(l.a * dens)), wid = 4 * l.a / (Math.PI * Math.max(l.len, 0.5)) * l.wr, Lb = Math.max(l.len, 0.5), ca = Math.cos(l.az), sa = Math.sin(l.az);
      const tab = [[0, 0, 0]]; let px = 0, pz = 0, pr = 0; const droop = (0.55 + 0.5 * (1 - l.gf)) * (l.elev < 1.0 ? 1 : 0.7);
      for (let i = 1; i <= 20; i++) { const s = i / 20, e = l.elev - droop * s * s * 1.1; pr += Math.cos(e) * Lb / 20; pz += Math.sin(e) * Lb / 20; tab.push([s, pr, pz]); }
      const at = s => { const f = clamp(s, 0, 1) * 20, i = Math.min(19, Math.floor(f)), q = f - i; return [tab[i][1] + (tab[i + 1][1] - tab[i][1]) * q, tab[i][2] + (tab[i + 1][2] - tab[i][2]) * q]; };
      let k = 0, guard = 0; while (k < n && guard++ < n * 8) { const s = rand(); if (rand() > prof(s)) continue; const t = (rand() * 2 - 1), q = at(s), half = 0.5 * wid * prof(s), z = l.hgt + q[1] - Math.abs(t) * half * 0.22;
        X.push(q[0] * ca - t * half * sa); Y.push(q[0] * sa + t * half * ca); Z.push(Math.max(0.2, z)); KD.push(0); LF.push(l.j); ED.push(Math.abs(t) > 0.85 ? 1 : 0); k++; }
      wsum += wid; lsum += Lb; nl++;
    });
    { let zm = 0; for (let i = 0; i < Z.length; i++) if (Z[i] > zm) zm = Z[i]; if (zm > 0) { const f = H / zm; for (let i = 0; i < Z.length; i++) Z[i] *= f; } }   // the top of the plant is the height of the model
    const n = X.length, c = { n, x: Float32Array.from(X), y: Float32Array.from(Y), z: Float32Array.from(Z), kd: Uint8Array.from(KD), lf: Int16Array.from(LF), ed: Uint8Array.from(ED) };
    c.H = H; c.area = tot; c.nLeaf = L.length; c.meanLen = nl ? lsum / nl : 0; c.meanWid = nl ? wsum / nl : 0; c.dens = dens; c.S = clamp(H / 60, 1, 4.2); return c;
  }
  // ---------------------------------------------------------------- 2. the rig: calibration spheres and cameras
  function rig(S) {
    const sp = [], R0 = 28 * S, rad = 3 * S; for (let i = 0; i < 6; i++) { const a = (30 + 60 * i) * D2R; sp.push({ x: R0 * Math.cos(a), y: R0 * Math.sin(a), z: (i % 2 ? 22 : 12) * S, a: 30 + 60 * i, r: rad }); }
    return { sp, R0, rad, cam: 22 * D2R };
  }
  const sees = (aSph, phi) => { let d = Math.abs(((aSph - phi) % 360 + 540) % 360 - 180); return d <= 110; };
  // a view of the plant: the points the camera sees (the nearest layer of each pixel), with the noise of the sensor, in the world frame
  function capture(T, phiDeg, seed, noiseCm) {
    const rand = rng(seed), ph = phiDeg * D2R, th = 22 * D2R, c = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)], e1 = [-Math.sin(ph), Math.cos(ph), 0], e2 = [-Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), Math.cos(th)];
    const cell = Math.max(0.35, 0.55 * VP.vox) * Math.sqrt(T.S) * 0.8, tol = 1.6 * cell, best = new Map(), U1 = new Float32Array(T.n), W1 = new Float32Array(T.n), DP = new Float32Array(T.n), key = new Int32Array(T.n);
    for (let i = 0; i < T.n; i++) { const x = T.x[i], y = T.y[i], z = T.z[i]; U1[i] = x * e1[0] + y * e1[1]; W1[i] = x * e2[0] + y * e2[1] + z * e2[2]; DP[i] = x * c[0] + y * c[1] + z * c[2]; const k = (Math.floor(U1[i] / cell) + 4096) * 8192 + (Math.floor(W1[i] / cell) + 4096); key[i] = k; const b = best.get(k); if (b === undefined || DP[i] > b) best.set(k, DP[i]); }
    const idx = []; for (let i = 0; i < T.n; i++) if (DP[i] >= best.get(key[i]) - tol) idx.push(i);
    const n = idx.length, o = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), src: Int32Array.from(idx) };
    for (let j = 0; j < n; j++) { const i = idx[j], s = noiseCm * (T.ed[i] ? 1.6 : 1) * (VP.nV === 1 ? 1.6 : 1); o.x[j] = T.x[i] + gauss(rand) * s; o.y[j] = T.y[i] + gauss(rand) * s; o.z[j] = T.z[i] + gauss(rand) * s; }
    return o;
  }
  // ---------------------------------------------------------------- 3. registration: spheres (SR), then ICP
  const apply = (t, x, y, z) => [t.c * x - t.s * y + t.tx, t.s * x + t.c * y + t.ty, z + t.tz];
  const compose = (a, b) => { const c = a.c * b.c - a.s * b.s, s = a.s * b.c + a.c * b.s, p = apply(a, b.tx, b.ty, b.tz); return { c, s, tx: p[0], ty: p[1], tz: p[2] }; };   // a after b
  const inverse = t => ({ c: t.c, s: -t.s, tx: -(t.c * t.tx + t.s * t.ty), ty: -(-t.s * t.tx + t.c * t.ty), tz: -t.tz });
  const ID = () => ({ c: 1, s: 0, tx: 0, ty: 0, tz: 0 });
  // rigid turn about the vertical axis plus a shift that takes the points A to the points B (least squares, the Procrustes problem in the horizontal plane)
  function procrustes(A, B) {
    const n = A.length; if (n < 2) return null; let ax = 0, ay = 0, az = 0, bx = 0, by = 0, bz = 0; for (let i = 0; i < n; i++) { ax += A[i][0]; ay += A[i][1]; az += A[i][2]; bx += B[i][0]; by += B[i][1]; bz += B[i][2]; }
    ax /= n; ay /= n; az /= n; bx /= n; by /= n; bz /= n; let sc = 0, ss = 0; for (let i = 0; i < n; i++) { const p = A[i][0] - ax, q = A[i][1] - ay, r = B[i][0] - bx, s = B[i][1] - by; sc += p * r + q * s; ss += p * s - q * r; }
    const th = Math.atan2(ss, sc), c = Math.cos(th), s = Math.sin(th); return { c, s, tx: bx - (c * ax - s * ay), ty: by - (s * ax + c * ay), tz: bz - az };
  }
  function grid(c, cs) { const m = new Map(); for (let i = 0; i < c.n; i++) { const k = (Math.floor(c.x[i] / cs) + 2048) * 4194304 + (Math.floor(c.y[i] / cs) + 2048) * 2048 + (Math.floor(c.z[i] / cs) + 1024); let a = m.get(k); if (!a) m.set(k, a = []); a.push(i); } return { m, cs }; }
  function nearest(g, c, x, y, z) { const cs = g.cs, ix = Math.floor(x / cs), iy = Math.floor(y / cs), iz = Math.floor(z / cs); let bd = 1e9, bi = -1; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) { const l = g.m.get((ix + a + 2048) * 4194304 + (iy + b + 2048) * 2048 + (iz + e + 1024)); if (l) for (let q = 0; q < l.length; q++) { const j = l[q], dx = c.x[j] - x, dy = c.y[j] - y, dz = c.z[j] - z, dd = dx * dx + dy * dy + dz * dz; if (dd < bd) { bd = dd; bi = j; } } } return bi < 0 ? null : [bi, Math.sqrt(bd)]; }
  function icp(src, tgt, S, its) {
    const cs = 2.2 * Math.sqrt(S), g = grid(tgt, cs), hist = []; let T = ID(); const step = Math.max(1, Math.floor(src.n / 450));
    for (let it = 0; it < its; it++) {
      const prs = []; for (let i = 0; i < src.n; i += step) { const p = apply(T, src.x[i], src.y[i], src.z[i]), q = nearest(g, tgt, p[0], p[1], p[2]); if (q) prs.push([p, q[0], q[1]]); }
      if (prs.length < 12) break; const ds = prs.map(a => a[2]).sort((a, b) => a - b), cut = ds[Math.floor(ds.length * 0.8)], keep = prs.filter(a => a[2] <= cut); let sq = 0; keep.forEach(a => { sq += a[2] * a[2]; }); hist.push(Math.sqrt(sq / keep.length) * 10);
      const dT = procrustes(keep.map(a => a[0]), keep.map(a => [tgt.x[a[1]], tgt.y[a[1]], tgt.z[a[1]]])); if (!dT) break; T = compose(dT, T); if (it > 1 && Math.abs(hist[it] - hist[it - 1]) < 0.002) break;
    }
    return { T, hist };
  }
  // ---------------------------------------------------------------- 4. the scan of one plant on one day
  const keyBase = () => { try { return U.keyOf(false) + '|' + JSON.stringify([VP.nV, VP.reg, VP.fit, VP.scal, VP.noise, VP.vox]); } catch (e) { return ''; } };
  function scan(trt, d, fast) {
    const R = Rr(trt); if (!R) return null; const ck = keyBase() + '|' + trt + '|' + d + '|' + (fast ? 1 : 0); if (VP.cache[ck]) return VP.cache[ck];
    const T = truthCloud(R, d), S = T.S, rg = rig(S), nV = VP.nV, noiseCm = VP.noise / 10 * Math.sqrt(S), rand = rng(5521 + d * 13 + nV), views = [], phis = [];
    for (let k = 0; k < nV; k++) phis.push(k * 360 / nV);
    // the frame of each view: scale (unknown without the pot calibration), a turn and a shift of its own
    const frames = phis.map((ph, k) => { const r2 = rng(777 + k * 101), sg = k === 0 ? 1 : 1 + (VP.scal ? 0.003 : 0.045) * (r2() * 2 - 1), t = k === 0 ? { x: 0, y: 0, z: 0 } : { x: (r2() * 2 - 1) * 9 * S, y: (r2() * 2 - 1) * 9 * S, z: (r2() * 2 - 1) * 3 * S }; return { ph, sg, t }; });
    const toView = (f, x, y, z) => { const c = Math.cos(-f.ph * D2R), s = Math.sin(-f.ph * D2R); return [f.sg * (c * x - s * y + f.t.x), f.sg * (s * x + c * y + f.t.y), f.sg * (z + f.t.z)]; };
    const sCen = (f, sph, r) => { const q = VP.fit === 'ransac' ? 0.1 * S : 0.38 * S, out = VP.fit === 'ransac' ? 0.01 : 0.18, p = toView(f, sph.x, sph.y, sph.z); const bad = r() < out ? (r() < .5 ? 1 : -1) * 1.4 * S : 0; return [p[0] + gauss(r) * q + bad, p[1] + gauss(r) * q + bad * 0.6, p[2] + gauss(r) * q]; };
    for (let k = 0; k < nV; k++) {
      const f = frames[k], cap = capture(T, f.ph, 4000 + d * 17 + k * 131, noiseCm), n = cap.n, cl = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), src: cap.src };
      for (let i = 0; i < n; i++) { const p = toView(f, cap.x[i], cap.y[i], cap.z[i]); cl.x[i] = p[0]; cl.y[i] = p[1]; cl.z[i] = p[2]; }
      const rs = rng(2048 + k * 97 + d), cen = rg.sp.map((s, i) => sees(s.a, f.ph) ? { i, c: sCen(f, s, rs) } : null).filter(Boolean); views.push({ k, f, cl, cen, n });
    }
    // self-registration: each view to the one before it, from the spheres both can see, then the chain back to view 0 (R0, R0 x R1, ...)
    const Tk = [ID()], info = [{ k: 0, nS: rg.sp.filter(s => sees(s.a, 0)).length, yaw: 0, tr: 0, ok: true, rmse: [] }];
    for (let k = 1; k < nV; k++) {
      const a = views[k], b = views[k - 1], com = a.cen.filter(p => b.cen.some(q => q.i === p.i)); let T1 = null, ok = false;
      if (VP.reg !== 'none' && com.length >= 3) { T1 = procrustes(com.map(p => p.c), com.map(p => b.cen.find(q => q.i === p.i).c)); ok = !!T1; }
      if (!T1) { const dl = (views[k].f.ph - views[k - 1].f.ph) * D2R; T1 = { c: Math.cos(dl), s: Math.sin(dl), tx: 0, ty: 0, tz: 0 }; }
      Tk.push(compose(Tk[k - 1], T1)); info.push({ k, nS: com.length, ok, yaw: 0, tr: 0, rmse: [] });
    }
    // the clouds in the frame of view 0; ICP puts each one onto the clouds already joined
    const mapped = views.map((v, k) => { const o = { n: v.n, x: new Float32Array(v.n), y: new Float32Array(v.n), z: new Float32Array(v.n), src: v.cl.src }; for (let i = 0; i < v.n; i++) { const p = apply(Tk[k], v.cl.x[i], v.cl.y[i], v.cl.z[i]); o.x[i] = p[0]; o.y[i] = p[1]; o.z[i] = p[2]; } return o; });
    const joined = [mapped[0]]; const its = fast ? 4 : 10;
    for (let k = 1; k < nV; k++) {
      let m = mapped[k];
      if (VP.reg === 'icp') { const tgt = merge(joined), r = icp(m, tgt, S, its); info[k].rmse = r.hist; const o = { n: m.n, x: new Float32Array(m.n), y: new Float32Array(m.n), z: new Float32Array(m.n), src: m.src }; for (let i = 0; i < m.n; i++) { const p = apply(r.T, m.x[i], m.y[i], m.z[i]); o.x[i] = p[0]; o.y[i] = p[1]; o.z[i] = p[2]; } m = o; mapped[k] = m; }
      joined.push(m);
    }
    // the error of each registration against the truth: the points of view k must lie on their true places
    mapped.forEach((m, k) => { let ex = 0, ey = 0, ez = 0, n = 0, yawA = 0; const cnt = Math.min(m.n, 400), st = Math.max(1, Math.floor(m.n / cnt)); for (let i = 0; i < m.n; i += st) { const s = m.src[i]; ex += m.x[i] - T.x[s]; ey += m.y[i] - T.y[s]; ez += m.z[i] - T.z[s]; n++; }
      info[k].tr = Math.hypot(ex / n, ey / n, ez / n) * 10; let num = 0, den = 0; for (let i = 0; i < m.n; i += st) { const s = m.src[i]; num += T.x[s] * m.y[i] - T.y[s] * m.x[i]; den += T.x[s] * m.x[i] + T.y[s] * m.y[i]; } info[k].yaw = Math.atan2(num, den) / D2R; });
    const ve = Math.min(VP.vox, Math.max(0.12, T.H / 45)), all = merge(mapped), vc = denoise(voxelise(all, ve, mapped), ve * 3.2, 2), single = mapped[0];
    const res = { trt, d, T, views, info, mapped, fused: vc, single, rg, traits: traitsOf(vc, T, R, d), c2c: c2c(vc, T), nV };
    const keys = Object.keys(VP.cache); if (keys.length > 60) delete VP.cache[keys[0]]; VP.cache[ck] = res; return res;
  }
  function merge(list) { let n = 0; list.forEach(c => { n += c.n; }); const o = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), v: new Uint8Array(n), src: new Int32Array(n) }; let p = 0; list.forEach((c, k) => { for (let i = 0; i < c.n; i++) { o.x[p] = c.x[i]; o.y[p] = c.y[i]; o.z[p] = c.z[i]; o.v[p] = k; o.src[p] = c.src ? c.src[i] : -1; p++; } }); return o; }
  // one point for each small cube: the overlap of the views is removed and the cloud keeps the size of the voxel
  function voxelise(c, vs, lists) { const m = new Map(); for (let i = 0; i < c.n; i++) { const k = (Math.floor(c.x[i] / vs) + 2048) * 4194304 + (Math.floor(c.y[i] / vs) + 2048) * 2048 + (Math.floor(c.z[i] / vs) + 1024); if (!m.has(k)) m.set(k, i); } const idx = Array.from(m.values()), n = idx.length, o = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), v: new Uint8Array(n), src: new Int32Array(n), vs }; idx.forEach((i, j) => { o.x[j] = c.x[i]; o.y[j] = c.y[i]; o.z[j] = c.z[i]; o.v[j] = c.v[i]; o.src[j] = c.src[i]; }); return o; }
  // pre-processing (Wang et al., 2025, section 2.3; Zhu et al., 2018, noise reduction): a point with too few neighbours is noise and is removed
  function denoise(c, r, k) {
    const g = grid(c, r), keep = []; for (let i = 0; i < c.n; i++) { const ix = Math.floor(c.x[i] / r), iy = Math.floor(c.y[i] / r), iz = Math.floor(c.z[i] / r); let cnt = 0; for (let a = -1; a <= 1 && cnt < k; a++) for (let b = -1; b <= 1 && cnt < k; b++) for (let e = -1; e <= 1 && cnt < k; e++) { const l = g.m.get((ix + a + 2048) * 4194304 + (iy + b + 2048) * 2048 + (iz + e + 1024)); if (l) for (let q = 0; q < l.length; q++) { const j = l[q]; if (j !== i && (c.x[j] - c.x[i]) ** 2 + (c.y[j] - c.y[i]) ** 2 + (c.z[j] - c.z[i]) ** 2 <= r * r) cnt++; } } if (cnt >= k) keep.push(i); }
    const n = keep.length, o = { n, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), v: new Uint8Array(n), src: new Int32Array(n), vs: c.vs, removed: c.n - n, before: c.n }; keep.forEach((i, j) => { o.x[j] = c.x[i]; o.y[j] = c.y[i]; o.z[j] = c.z[i]; o.v[j] = c.v[i]; o.src[j] = c.src[i]; }); return o;
  }
  function c2c(c, T) { const g = grid(T, 1.2), st = Math.max(1, Math.floor(c.n / 1500)), ds = []; c.err = new Float32Array(c.n); for (let i = 0; i < c.n; i += st) { const q = nearest(g, T, c.x[i], c.y[i], c.z[i]); const d = q ? q[1] : 3.6; ds.push(d * 10); c.err[i] = d * 10; } const m = ds.reduce((a, b) => a + b, 0) / Math.max(1, ds.length), sd = Math.sqrt(ds.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, ds.length)); return { mean: m, sd, n: ds.length }; }
  // ---------------------------------------------------------------- 5. the traits measured on the joined cloud
  function hull2(pts) { if (pts.length < 3) return pts.slice(); const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); } for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return lo.slice(0, -1).concat(up.slice(0, -1)); }
  // the hull of a slice without the 3 % of the points farthest from its centre (a few stray points would make the envelope too big)
  const hullT = pts => { if (pts.length < 20) return hull2(pts); const mx = pts.map(p => p[0]).sort((a, b) => a - b)[pts.length >> 1], my = pts.map(p => p[1]).sort((a, b) => a - b)[pts.length >> 1], d = pts.map(p => [Math.hypot(p[0] - mx, p[1] - my), p]).sort((a, b) => a[0] - b[0]); return hull2(d.slice(0, Math.ceil(d.length * 0.97)).map(q => q[1])); };
  const hullA = h => { let a = 0; for (let i = 0; i < h.length; i++) { const j = (i + 1) % h.length; a += h[i][0] * h[j][1] - h[j][0] * h[i][1]; } return Math.abs(a) / 2; };
  const feret = h => { let m = 0; for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) m = Math.max(m, Math.hypot(h[i][0] - h[j][0], h[i][1] - h[j][1])); return m; };
  // the points that touch each other (closer than the link): union-find on a hash grid
  function components(c, idx, link) {
    const n = idx.length, par = Int32Array.from({ length: n }, (_, i) => i), find = i => { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, g = new Map(), cs = link;
    const key = (a, b, d) => (a + 2048) * 4194304 + (b + 2048) * 2048 + (d + 1024); idx.forEach((j, l) => { const k = key(Math.floor(c.x[j] / cs), Math.floor(c.y[j] / cs), Math.floor(c.z[j] / cs)); let q = g.get(k); if (!q) g.set(k, q = []); q.push(l); });
    for (let l = 0; l < n; l++) { const j = idx[l], ix = Math.floor(c.x[j] / cs), iy = Math.floor(c.y[j] / cs), iz = Math.floor(c.z[j] / cs); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let e = -1; e <= 1; e++) { const q = g.get(key(ix + a, iy + b, iz + e)); if (q) for (let u = 0; u < q.length; u++) { const m = q[u]; if (m <= l) continue; const k2 = idx[m], dx = c.x[k2] - c.x[j], dy = c.y[k2] - c.y[j], dz = c.z[k2] - c.z[j]; if (dx * dx + dy * dy + dz * dz <= link * link) { const r1 = find(l), r2 = find(m); if (r1 !== r2) par[r1] = r2; } } } }
    const out = new Map(); for (let l = 0; l < n; l++) { const r = find(l); let q = out.get(r); if (!q) out.set(r, q = []); q.push(idx[l]); } return Array.from(out.values());
  }
  // length and width of a leaf from the two principal axes of its points (power iteration on the covariance)
  function pca(c, idx) {
    const n = idx.length; let mx = 0, my = 0, mz = 0; idx.forEach(j => { mx += c.x[j]; my += c.y[j]; mz += c.z[j]; }); mx /= n; my /= n; mz /= n; const C = [0, 0, 0, 0, 0, 0]; idx.forEach(j => { const a = c.x[j] - mx, b = c.y[j] - my, d = c.z[j] - mz; C[0] += a * a; C[1] += a * b; C[2] += a * d; C[3] += b * b; C[4] += b * d; C[5] += d * d; });
    const mul = (M, v) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[1] * v[0] + M[3] * v[1] + M[4] * v[2], M[2] * v[0] + M[4] * v[1] + M[5] * v[2]], nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    let e1 = [1, 0.3, 0.2]; for (let i = 0; i < 40; i++) e1 = nrm(mul(C, e1)); const l1 = e1[0] * mul(C, e1)[0] + e1[1] * mul(C, e1)[1] + e1[2] * mul(C, e1)[2]; const D = C.slice(); const M = [e1[0] * e1[0], e1[0] * e1[1], e1[0] * e1[2], e1[1] * e1[1], e1[1] * e1[2], e1[2] * e1[2]]; for (let i = 0; i < 6; i++) D[i] -= l1 * M[i];
    let e2 = nrm([0.2, 1, -0.4]); const dot = e2[0] * e1[0] + e2[1] * e1[1] + e2[2] * e1[2]; e2 = nrm([e2[0] - dot * e1[0], e2[1] - dot * e1[1], e2[2] - dot * e1[2]]); for (let i = 0; i < 40; i++) { e2 = nrm(mul(D, e2)); }
    const p1 = idx.map(j => (c.x[j] - mx) * e1[0] + (c.y[j] - my) * e1[1] + (c.z[j] - mz) * e1[2]).sort((a, b) => a - b), p2 = idx.map(j => (c.x[j] - mx) * e2[0] + (c.y[j] - my) * e2[1] + (c.z[j] - mz) * e2[2]).sort((a, b) => a - b), q = (a, f) => a[Math.min(a.length - 1, Math.floor(a.length * f))];
    return { len: (q(p1, 0.99) - q(p1, 0.01)) * 1.03, wid: (q(p2, 0.99) - q(p2, 0.01)) * 1.03 };
  }
  function traitsOf(c, T, R, d) {
    const vs = c.vs, n = c.n, H0 = T.H; if (n < 20) return { ok: false };
    const zs = Array.from(c.z).sort((a, b) => a - b), height = zs[Math.floor(n * 0.998)] - Math.max(0, zs[Math.floor(n * 0.002)] * 0);
    // the axis of the stem: the lowest points; leaves: points away from the axis
    const low = []; for (let i = 0; i < n; i++) if (c.z[i] < 0.22 * H0) low.push(i); let ax = 0, ay = 0; low.forEach(i => { ax += c.x[i]; ay += c.y[i]; }); if (low.length) { ax /= low.length; ay /= low.length; }
    const rS = clamp(1.5 + H0 * 0.006, 1.6, 3.2); const leaf = []; for (let i = 0; i < n; i++) if (Math.hypot(c.x[i] - ax, c.y[i] - ay) > rS && c.z[i] > 0.08 * H0) leaf.push(i);
    const hl = hull2(leaf.map(i => [c.x[i], c.y[i]])), crown = feret(hl), area = leaf.length * vs * vs / 1.5, cv = vs * 2.5, vset = new Set(); for (let i = 0; i < n; i++) vset.add((Math.floor(c.x[i] / cv) + 2048) * 4194304 + (Math.floor(c.y[i] / cv) + 2048) * 2048 + (Math.floor(c.z[i] / cv) + 1024)); const vox = vset.size * cv * cv * cv / 1000;
    // the volume of the envelope: the convex hull of each slice, summed
    const ds = Math.max(vs * 2, H0 / 30); let hv = 0; for (let z0 = 0; z0 < height; z0 += ds) { const pts = []; for (let i = 0; i < n; i++) if (c.z[i] >= z0 && c.z[i] < z0 + ds) pts.push([c.x[i], c.y[i]]); if (pts.length > 3) hv += hullA(hullT(pts)) * ds; } hv /= 1000;
    // the leaves: the angle round the stem (Zhu et al., 2018): a histogram, smoothed, the peaks are the leaves
    const nb = 72, hist = new Float32Array(nb); leaf.forEach(i => { const a = Math.atan2(c.y[i] - ay, c.x[i] - ax); hist[((Math.floor((a / Math.PI + 1) * nb / 2)) % nb + nb) % nb] += 1; });
    const sm = new Float32Array(nb); for (let b = 0; b < nb; b++) { let s = 0, w = 0; for (let q = -4; q <= 4; q++) { const g = Math.exp(-q * q / 4.5); s += hist[(b + q + nb) % nb] * g; w += g; } sm[b] = s / w; }
    const mx = Math.max(...sm, 1), peaks = []; for (let b = 0; b < nb; b++) { const l = sm[(b + nb - 1) % nb], r = sm[(b + 1) % nb]; if (sm[b] >= l && sm[b] > r && sm[b] > 0.2 * mx) { let lo = b, hi = b; for (let q = 1; q < 14; q++) { if (sm[(b - q + nb) % nb] <= sm[(lo + nb) % nb] && sm[(b - q + nb) % nb] < sm[b] * 0.8) lo = b - q; else if (sm[(b - q + nb) % nb] > sm[(lo + nb) % nb]) break; } peaks.push(b); } }
    // first the angle clusters (the peaks), then the shape clusters inside each: points that touch belong to one leaf (Zhu et al., 2018, the two-step clustering)
    const bord = peaks.map((b, i) => { const nx = peaks[(i + 1) % peaks.length]; let mn = b, mv = 1e9; for (let q = 1; q <= ((nx - b + nb) % nb || nb); q++) { const bb = (b + q) % nb; if (sm[bb] < mv) { mv = sm[bb]; mn = bb; } } return mn; });
    const clusters = peaks.length ? peaks.map((b, i) => { const pb = bord[(i + peaks.length - 1) % peaks.length], nb2 = bord[i]; return leaf.filter(j => { const bi = ((Math.floor((Math.atan2(c.y[j] - ay, c.x[j] - ax) / Math.PI + 1) * nb / 2)) % nb + nb) % nb; return pb <= nb2 ? (bi > pb && bi <= nb2) : (bi > pb || bi <= nb2); }); }) : [leaf];
    const lens = [], wids = [], leaves = []; clusters.forEach(cl => { components(c, cl, Math.max(1.9 * vs, 0.9)).forEach(cp => { if (cp.length < 10) return; const pc = pca(c, cp); if (pc) { leaves.push(cp); lens.push(pc.len); wids.push(pc.wid); } }); });
    const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
    return { ok: true, height, crown, vox, hv, area, lai: area / Math.max(R.A, 1), nLeaf: leaves.length, nPeaks: peaks.length, leafLen: mean(lens), leafWid: mean(wids), hist: sm, peaks, ax, ay, completeness: Math.min(1, n / Math.max(1, T.n * 0.35)) };
  }
  // the truth of the model for the same day, from the plant itself (no occlusion, no noise)
  function truthOf(trt, d) {
    const R = Rr(trt), T = truthCloud(R, d), vs = Math.min(VP.vox, Math.max(0.12, T.H / 45)); const m = new Set(), cv = vs * 2.5; for (let i = 0; i < T.n; i++) { const k = (Math.floor(T.x[i] / cv) + 2048) * 4194304 + (Math.floor(T.y[i] / cv) + 2048) * 2048 + (Math.floor(T.z[i] / cv) + 1024); m.add(k); }
    const hl = hull2(Array.from({ length: T.n }, (_, i) => T.kd[i] === 0 ? [T.x[i], T.y[i]] : null).filter(Boolean)), ds = Math.max(vs * 2, T.H / 30); let hv = 0; for (let z0 = 0; z0 < T.H * 1.2; z0 += ds) { const pts = []; for (let i = 0; i < T.n; i++) if (T.z[i] >= z0 && T.z[i] < z0 + ds) pts.push([T.x[i], T.y[i]]); if (pts.length > 3) hv += hullA(hullT(pts)) * ds; }
    return { height: R.H[d], crown: feret(hl), vox: m.size * cv * cv * cv / 1000, hv: hv / 1000, area: T.area, lai: T.area / Math.max(R.A, 1), nLeaf: T.nLeaf, leafLen: T.meanLen, leafWid: T.meanWid };
  }
  const TC = {}; const truth = (trt, d) => { const k = keyBase() + '|' + trt + '|' + d; if (!TC[k]) { const ks = Object.keys(TC); if (ks.length > 80) delete TC[ks[0]]; TC[k] = truthOf(trt, d); } return TC[k]; };
  // ---------------------------------------------------------------- 6. the season: a scan every 10 days, in the background, for both plants
  const SDAYS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130]; const serKey = () => keyBase();
  function serStep() {
    if (!PH.run) return; const k = serKey(); if (VP.serKey !== k) { VP.serKey = k; VP.ser = { ww: {}, dr: {}, n: 0 }; }
    const t0 = performance.now(); while (performance.now() - t0 < 18) { let did = false; for (const t of ['ww', 'dr']) for (const d of SDAYS) { if (VP.ser[t][d]) continue; const s = scan(t, d, true); VP.ser[t][d] = { s: s.traits, tr: truth(t, d), c2c: s.c2c }; VP.ser.n++; did = true; break; } if (!did) break; else if (performance.now() - t0 > 18) break; }
  }
  const serDone = () => VP.ser && VP.ser.n >= SDAYS.length * 2;
  // coefficient of determination of the scan against the model (1 - SSres / SStot), as in Wang et al. (2025)
  const r2 = (a, b) => { const n = a.length; if (n < 3) return NaN; const m = b.reduce((x, y) => x + y, 0) / n; let ss = 0, st = 0; for (let i = 0; i < n; i++) { ss += (a[i] - b[i]) * (a[i] - b[i]); st += (b[i] - m) * (b[i] - m); } return st > 0 ? 1 - ss / st : NaN; };
  // the series of the layer for the Dashboard
  window.VPH = { scan, truth, VP, serStep, SDAYS, series: trt => { const o = VP.ser && VP.ser[trt]; return o ? SDAYS.filter(d => o[d]).map(d => ({ d, s: o[d].s, t: o[d].tr })) : []; } };

  // ---------------------------------------------------------------- 7. drawing
  function chip(x, y, text, on, fn, tip) { return U.chip(x, y, text, on, fn, tip); }
  function frame(x, y, w, h, t, s) { K.frame(x, y, w, h, t, s); }
  function tableRow(y, cols, xs, o) { o = o || {}; cols.forEach((c, i) => T(String(c), xs[i], y, { s: o.s || 10, b: o.b, c: o.c || INK, a: i ? 'right' : 'left' })); }
  const hue = k => ['#1B3A6B', '#2E9E4F', '#D93025', '#E8A33D', '#8E3B8E', '#2b83ba'][k % 6];
  const errCol = e => U.pal(clamp(e / 12, 0, 1));
  // the oblique view of a cloud, turned about the vertical axis
  function drawCloud(c, x, y, w, h, o) {
    o = o || {}; ctx.save(); ctx.fillStyle = '#10151C'; ctx.fillRect(x, y, w, h); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (!c || !c.n) { T('no points', x + w / 2, y + h / 2, { s: 11, c: '#8A94A0', a: 'center' }); ctx.restore(); return; }
    const sc = o.sc || Math.min(w * 0.46 / Math.max(10, (o.R0 || 28) * 1.1), h * 0.84 / Math.max(10, o.ext || 60)), ca = Math.cos(VP.rot), sa = Math.sin(VP.rot), cx = x + w / 2, cy = o.sc ? Math.min(y + h - 22, y + h * 0.5 + 0.46 * (o.H || 60) * o.sc) : y + h - 22, tilt = 0.5, ord = []; const st = Math.max(1, Math.floor(c.n / 3600));
    for (let i = 0; i < c.n; i += st) { const xr = c.x[i] * ca - c.y[i] * sa, yr = c.x[i] * sa + c.y[i] * ca; ord.push([yr, xr, c.z[i], i]); } ord.sort((a, b) => a[0] - b[0]);
    // the ground ring and the six spheres
    ctx.strokeStyle = 'rgba(180,190,205,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, (o.R0 || 28) * sc, (o.R0 || 28) * sc * tilt, 0, 0, 6.283); ctx.stroke();
    (o.spheres || []).forEach(s => { const xr = s.x * ca - s.y * sa, yr = s.x * sa + s.y * ca, px = cx + xr * sc, py = cy + yr * sc * tilt - s.z * sc * 0.92, r = Math.max(3, s.r * sc); const g = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r); g.addColorStop(0, '#fff'); g.addColorStop(1, hue(s.i)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill(); });
    const H0 = o.H || 60; ord.forEach(q => { const i = q[3], px = cx + q[1] * sc, py = cy + q[0] * sc * tilt - q[2] * sc * 0.92; let col; if (VP.col === 'view') col = hue(c.v ? c.v[i] : 0); else if (VP.col === 'error' && c.err) col = errCol(c.err[i] || 0); else if (VP.col === 'height') col = U.pal(clamp(q[2] / H0, 0, 1) * 0.92); else { const hh = clamp(q[2] / H0, 0, 1), dp = clamp(0.5 + q[0] / (o.dep || 30) * 0.5, 0, 1), lt = 0.62 + 0.38 * dp, stem = c.kd && c.kd[i] === 1; col = stem ? 'rgb(' + Math.round(110 * lt) + ',' + Math.round(88 * lt) + ',' + Math.round(52 * lt) + ')' : 'rgb(' + Math.round((38 + 55 * hh) * lt) + ',' + Math.round((92 + 98 * hh) * lt) + ',' + Math.round((30 + 25 * hh) * lt) + ')'; } ctx.fillStyle = col; const ps = Math.max(2.2, Math.min(5, 0.45 * sc)); ctx.fillRect(px - ps / 2, py - ps / 2, ps, ps); });
    ctx.restore(); ROTB.x = Math.min(ROTB.x || x, x); }
  function drawRigTop(x, y, w, h, S, scn) {
    ctx.fillStyle = '#F4F2EA'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.42, ext = 28 * S * 1.9, sc = R / ext, T0 = scn ? scn.T : null;
    // the plant: the leaves seen from above (the direction and the reach of each leaf)
    const Rn = Rr(VP.trt), d = U.day(); if (Rn) { const g = P.leaves(Rn, d, 0); ctx.lineCap = 'round'; g.leaves.forEach(l => { const e = l.reach * sc, a = l.az; ctx.strokeStyle = l.gf > 0.55 ? '#3E8E41' : '#B8A04A'; ctx.lineWidth = Math.max(2, Math.sqrt(l.a) * 0.9 * sc * 0.6); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + e * Math.cos(a), cy + e * Math.sin(a)); ctx.stroke(); }); }
    ctx.fillStyle = '#3B2A1E'; ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, 5 * sc * S * 0.6), 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#8A8577'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(cx, cy, R * 0.96, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    const rg = rig(S); rg.sp.forEach((s, i) => { const px = cx + s.x * sc, py = cy - s.y * sc, r = Math.max(4, s.r * sc * 1.4); const g = ctx.createRadialGradient(px - r * 0.3, py - r * 0.3, 1, px, py, r); g.addColorStop(0, '#fff'); g.addColorStop(1, hue(i)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill(); });
    for (let k = 0; k < VP.nV; k++) { const ph = k * 360 / VP.nV, a = ph * D2R, px = cx + R * Math.cos(a), py = cy - R * Math.sin(a); rg.sp.forEach((s, i) => { if (sees(s.a, ph)) { ctx.strokeStyle = 'rgba(27,58,107,0.10)'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx + s.x * sc, cy - s.y * sc); ctx.stroke(); } });
      ctx.save(); ctx.translate(px, py); ctx.rotate(-a + Math.PI); ctx.fillStyle = k === 0 ? '#D93025' : NAVY; ctx.fillRect(-7, -5, 14, 10); ctx.fillStyle = '#9FB7D9'; ctx.fillRect(-9, -3, 3, 6); ctx.restore(); T(Math.round(ph) + '°', cx + (R + 17) * Math.cos(a), cy - (R + 17) * Math.sin(a) + 4, { s: 9.5, b: true, c: k === 0 ? '#D93025' : NAVY, a: 'center' }); }
    T('seen from above', x + 8, y + 14, { s: 9.5, c: MUTE, i: true }); }
  function drawRigSide(x, y, w, h, S) {
    ctx.fillStyle = '#F4F2EA'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    const Rn = Rr(VP.trt), d = U.day(), H = Rn ? Rn.H[d] : 60, gy = y + h - 22, sc = (h - 52) / Math.max(40, H * 1.25), cx = x + w * 0.42;
    ctx.fillStyle = '#C9B48A'; ctx.fillRect(x + 6, gy, w - 12, 5); ctx.fillStyle = '#4A3A2A'; ctx.fillRect(cx - 12, gy - 14, 24, 14);
    if (Rn) { const g = P.leaves(Rn, d, 0); ctx.strokeStyle = '#2F6B33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, gy - 14); ctx.lineTo(cx, gy - 14 - H * sc); ctx.stroke(); g.leaves.forEach(l => { const bx = cx, by = gy - 14 - l.hgt * sc, ex = bx + Math.cos(l.az) * l.reach * sc * 0.9, ey = by - Math.sin(l.elev) * l.len * sc * 0.8 + l.len * sc * 0.2; ctx.strokeStyle = l.gf > 0.55 ? '#4C9A4F' : '#B8A04A'; ctx.lineWidth = Math.max(2, Math.sqrt(l.a) * 0.5 * sc); ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex) / 2, by - Math.sin(l.elev) * l.len * sc * 0.6, ex, ey); ctx.stroke(); }); }
    const rg = rig(S); rg.sp.forEach((s, i) => { const px = cx + (i % 2 ? 1 : -1) * s.r * 0 + (i < 3 ? -1 : 1) * (22 + i * 3), py = gy - s.z * sc, r = Math.max(3.5, s.r * sc * 1.2); ctx.fillStyle = hue(i); ctx.beginPath(); ctx.arc(cx + (i < 3 ? -1 : 1) * (40 + (i % 3) * 18), gy - (s.z * sc) * 0.9 - 6, r, 0, 6.283); ctx.fill(); });
    const camx = x + w - 34; ctx.strokeStyle = NAVY; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(camx, gy); ctx.lineTo(camx, gy - (h - 60)); ctx.stroke();
    ctx.fillStyle = NAVY; const cy0 = gy - (h - 60) * 0.55; ctx.fillRect(camx - 14, cy0 - 6, 18, 12); ctx.strokeStyle = 'rgba(27,58,107,0.5)'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(camx - 14, cy0); ctx.lineTo(cx, gy - 14 - H * sc * 0.5); ctx.stroke(); ctx.setLineDash([]);
    TF('camera 22° above the plant', x + 8, y + 28, w * 0.55, { s: 9, c: NAVY }); T('seen from the side', x + 8, y + 14, { s: 9.5, c: MUTE, i: true }); T('plant height ' + fmt(H) + ' cm', x + w - 8, gy + 14, { s: 9.5, b: true, c: '#2F6B33', a: 'right' }); }
  function lineChart(x, y, w, h, title, sub, lo, hi, unit, series, xs) {
    frame(x, y, w, h, title, sub); const x0 = x + 44, y0 = y + 34, ww = w - 62, hh = h - 62; K.yAxis(x0, y0, ww, hh, lo, hi, unit, 4); const X = d => x0 + ww * d / (N - 1), Y = v => y0 + hh - hh * (v - lo) / Math.max(1e-9, hi - lo);
    [0, 35, 70, 105, 139].forEach(d => { T(U.dateOf(d), X(d), y0 + hh + 14, { s: 8.5, c: MUTE, a: 'center' }); });
    series.forEach(s => { if (s.line) { ctx.strokeStyle = s.c; ctx.lineWidth = s.w || 1.6; if (s.dash) ctx.setLineDash(s.dash); ctx.beginPath(); s.line.forEach((v, i) => { const px = X(i), py = Y(clamp(v, lo, hi)); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); ctx.setLineDash([]); } if (s.pts) s.pts.forEach(p => { ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(X(p[0]), Y(clamp(p[1], lo, hi)), 3.2, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }); });
    const dd = U.day(); ctx.strokeStyle = '#0A246A'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(dd), y0); ctx.lineTo(X(dd), y0 + hh); ctx.stroke(); ctx.setLineDash([]); }
  function scatter(x, y, w, h, title, a, b, unit) {   // scan (vertical) against the model (horizontal), the 1:1 line and R2
    frame(x, y, w, h, title, 'scan vs model'); const mx = Math.max(1e-6, ...a, ...b) * 1.08, x0 = x + 44, y0 = y + 32, ww = w - 62, hh = h - 58; K.yAxis(x0, y0, ww, hh, 0, mx, unit, 3);
    ctx.strokeStyle = '#8A8577'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, y0 + hh); ctx.lineTo(x0 + ww, y0); ctx.stroke(); ctx.setLineDash([]);
    a.forEach((v, i) => { ctx.fillStyle = i < a.length / 2 ? '#1B1F23' : '#D93025'; ctx.beginPath(); ctx.arc(x0 + ww * b[i] / mx, y0 + hh - hh * v / mx, 3, 0, 6.283); ctx.fill(); });
    const rr = r2(a, b); T('R² = ' + (isFinite(rr) ? fmt(rr, 3) : '–'), x0 + ww - 4, y0 + hh - 8, { s: 11, b: true, c: rr > 0.9 ? '#1E8E3E' : rr > 0.7 ? '#9A6A00' : '#B3261E', a: 'right' }); T('model', x0 + ww / 2, y + h - 8, { s: 9, c: MUTE, a: 'center' }); }
  // ---------------------------------------------------------------- the whole layer
  const sec = (y, t, s) => { ctx.fillStyle = '#E4E9F2'; ctx.fillRect(14, y, W - 28, 24); ctx.fillStyle = NAVY; ctx.fillRect(14, y, 4, 24); ctx.font = 'bold 12px sans-serif'; const w1 = ctx.measureText(t).width; T(t, 26, y + 16, { s: 12, b: true, c: NAVY }); if (s && W - 40 - w1 > 120) TF(s, 26 + w1 + 14, y + 16, W - 40 - w1 - 14, { s: 9.5, c: MUTE, i: true }); return y + 32; };
  function drawVph() {
    paper(); SLd.length = 0; U.syncSpecies(); U.ensureRun(); if (!PH.run) { K.header('Volumetric phenotyping', 'The plant of Deterministic phenotyping is needed first: press Run simulation.', 4); return; }
    serStep(); if (!VP.dayInit) { VP.dayInit = 1; const R0 = Rr(VP.trt); let hm = 0, dd = 0; R0.H.forEach(v => { if (v > hm) hm = v; }); for (let i = 0; i < R0.H.length; i++) if (R0.H[i] >= 0.9 * hm) { dd = i; break; } if (play) { play.t = clamp(dd / (N - 1), 0, 1); play.on = false; } }
    let y = K.header('Volumetric phenotyping', 'A virtual 3D scanner measures volume, crown, leaves and height of the plant of P1 · views, calibration spheres, SR-ICP', 4);
    const d = U.day(), Rn = Rr(VP.trt), R2 = Rr(VP.trt === 'ww' ? 'dr' : 'ww'), S = scan(VP.trt, d, !!(play && play.on)), S2 = scan(VP.trt === 'ww' ? 'dr' : 'ww', d, true), tt = S.traits, tr = truth(VP.trt, d), t2 = S2.traits, tr2 = truth(VP.trt === 'ww' ? 'dr' : 'ww', d);
    K.badge('MODEL RUN', 16, y, '#1E8E3E'); T('Day ' + d + ' (' + U.dateOfY(d) + ') · ' + ((window.CROPS && CROPS[state.crop] || {}).label || state.crop) + ' · plant shown: ' + trtName(VP.trt) + ' · ' + S.T.n + ' surface points on the plant, ' + S.fused.n + ' in the joined scan', 110, y + 11, { s: 10, c: MUTE }); y += 24;
    // ---- 1. controls
    y = sec(y, '1  Set up the scan', 'the plant, the soil and the weather come from the project and from P1');
    const cx0 = 16; let yy = y;
    yy = U.chipRow('Plant', [{ k: 'ww', t: U.RNc() }, { k: 'dr', t: 'Drought' }], VP.trt, v => { VP.trt = v; }, cx0, yy, W - 40);
    yy = U.chipRow('Views', [1, 2, 3, 4, 6].map(v => ({ k: v, t: v + (v === 1 ? ' view' : ' views'), tip: v === 6 ? 'six views of 60°, as in Wang et al. (2025)' : 'fewer views leave holes and cannot be registered' })), VP.nV, v => { VP.nV = v; }, cx0, yy, W - 40);
    yy = U.chipRow('Joining', [{ k: 'none', t: 'None', tip: 'the clouds are only turned by the angle of the arm' }, { k: 'sr', t: 'Spheres (SR)', tip: 'self-registration with the calibration spheres' }, { k: 'icp', t: 'Spheres + ICP', tip: 'coarse alignment with the spheres, then the iterative closest point' }], VP.reg, v => { VP.reg = v; }, cx0, yy, W - 40);
    yy = U.chipRow('Sphere fit', [{ k: 'ls', t: 'Least squares', tip: 'sensitive to the points that are not on the sphere' }, { k: 'ransac', t: 'Enhanced RANSAC', tip: 'dynamic threshold, many candidates, Levenberg-Marquardt at the end (Wang et al., 2025)' }], VP.fit, v => { VP.fit = v; }, cx0, yy, W - 40);
    yy = U.chipRow('Scale', [{ k: true, t: 'Calibrated on the pot', tip: 'the size of each cloud is set from the known pot diameter' }, { k: false, t: 'Not calibrated', tip: 'each view keeps the scale of its own reconstruction (up to 4.5 % off)' }], VP.scal, v => { VP.scal = v; }, cx0, yy, W - 40);
    const sw = Math.min(300, (W - 56) / 2); U.slider ? 0 : 0;
    const sl = (xx, yv, label, mn, mx, val, txt, set) => { T(label, xx, yv + 9, { s: 9.5, c: MUTE }); T(txt, xx + sw, yv + 9, { s: 9.5, b: true, a: 'right' }); const ty = yv + 20, f = clamp((val - mn) / (mx - mn), 0, 1); ctx.fillStyle = '#DCD8CC'; ctx.fillRect(xx, ty, sw, 4); ctx.fillStyle = NAVY; ctx.fillRect(xx, ty, sw * f, 4); ctx.fillStyle = '#fff'; ctx.strokeStyle = NAVY; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(xx + sw * f, ty + 2, 6, 0, 6.283); ctx.fill(); ctx.stroke(); SLd.push({ x: xx - 7, y: yv + 6, w: sw + 14, h: 28, min: mn, max: mx, set, x0: xx, w0: sw }); hot(xx - 7, yv + 6, sw + 14, 28, () => { }, 'drag to change'); };
    sl(16, yy, 'Sensor noise', 0.2, 3, VP.noise, fmt(VP.noise, 1) + ' mm', v => { VP.noise = Math.round(v * 10) / 10; }); sl(36 + sw, yy, 'Voxel size (the grain of the volume)', 0.3, 3, VP.vox, fmt(VP.vox, 1) + ' cm', v => { VP.vox = Math.round(v * 10) / 10; });
    yy += 40; sl(16, yy, 'Day of the season', 0, N - 1, d, 'day ' + d + ' · ' + U.dateOfY(d), v => { play.t = clamp(v / (N - 1), 0, 1); play.on = false; }); yy += 40;
    T('Every control re-scans the plant. The scan is deterministic: the same settings give the same cloud.', 16, yy + 4, { s: 9.5, i: true, c: MUTE }); y = yy + 18;
    // ---- 2. the rig
    y = sec(y, '2  The virtual rig', 'after Wang et al. (2025): a camera on a turning arm and six calibration spheres'); const rw = (W - 48) / 2, rh = 250;
    drawRigTop(16, y, rw, rh, S.T.S, S); drawRigSide(32 + rw, y, rw, rh, S.T.S); y += rh + 8;
    // per view: how much of the plant the camera sees
    frame(16, y, W - 32, 60 + S.nV * 20, 'What each view sees', 'points of the cloud that each camera takes, and the share of the whole plant'); S.views.forEach((v, k) => { const yy2 = y + 36 + k * 20, f = v.n / Math.max(1, S.T.n); T('view ' + (k + 1) + ' · ' + Math.round(v.f.ph) + '°', 30, yy2 + 10, { s: 10 }); ctx.fillStyle = '#EDEBE4'; ctx.fillRect(130, yy2, W - 130 - Math.max(150, W * 0.36) - 24, 12); ctx.fillStyle = hue(k); ctx.fillRect(130, yy2, (W - 130 - Math.max(150, W * 0.36) - 24) * clamp(f, 0, 1), 12); TF(v.n + ' points · ' + fmt(100 * f) + ' % of the plant · ' + v.cen.length + ' spheres', W - 28 - Math.max(150, W * 0.36) + 12, yy2 + 10, Math.max(150, W * 0.36) - 12, { s: 10 }); });
    y += 60 + S.nV * 20 + 8;
    // ---- 3. point clouds
    y = sec(y, '3  The point clouds', 'drag a cloud to turn it · one view, the joined views, the plant itself'); y = U.chipRow('Colour', [{ k: 'natural', t: 'natural colour' }, { k: 'height', t: 'by height' }, { k: 'view', t: 'by view' }, { k: 'error', t: 'by error against the plant' }], VP.col, v => { VP.col = v; }, 16, y, W - 40);
    const cw = (W - 56) / 3, ch = 300; let cr = 4; for (let i = 0; i < S.T.n; i += 3) cr = Math.max(cr, Math.hypot(S.T.x[i], S.T.y[i])); const fit = Math.min((W - 56) / 3 * 0.44 / cr, 300 * 0.8 / Math.max(S.T.H * 1.08, 6)), ext = Math.max(S.T.H * 0.9, 40), opt = { ext, sc: fit, dep: cr * 2, H: S.T.H, R0: S.rg.R0, spheres: S.rg.sp.map((s, i) => Object.assign({ i }, s)) };
    const one = { n: S.mapped[0].n, x: S.mapped[0].x, y: S.mapped[0].y, z: S.mapped[0].z, v: new Uint8Array(S.mapped[0].n), err: null };
    ROTB.x = 16; ROTB.y = y; ROTB.w = W - 32; ROTB.h = ch + 24;
    [[one, 'One view: ' + one.n + ' points'], [S.fused, 'Joined, ' + S.nV + ' view' + (S.nV > 1 ? 's' : '') + ': ' + S.fused.n], [S.T, 'The plant: ' + S.T.n + ' points']].forEach((q, i) => { const px = 16 + i * (cw + 12); TF(q[1], px, y + 10, cw, { s: 10, b: true }); const cc = i === 2 ? Object.assign({}, q[0], { v: new Uint8Array(q[0].n), err: null }) : q[0]; drawCloud(cc, px, y + 18, cw, ch, opt); }); hot(16, y + 18, W - 32, ch, () => { }, 'drag to turn the clouds');
    y += ch + 30; T('Distance of the joined cloud to the plant: ' + fmt(S.c2c.mean, 2) + ' mm on average (sd ' + fmt(S.c2c.sd, 2) + ' mm) · Wang et al. (2025) report 0.7 to 1.2 mm for their six-view scans.', 16, y, { s: 10, c: MUTE }); y += 22;
    // ---- 4. registration
    y = sec(y, '4  Joining the views', 'self-registration with the spheres, then ICP: the error of each view against the truth');
    const xs = [30, W * 0.27, W * 0.50, W * 0.64, W * 0.78, W - 30]; frame(16, y, W - 32, 62 + S.nV * 22 + 26, 'Registration of every view to view 1', VP.reg === 'none' ? 'no joining: the clouds are only turned' : VP.reg === 'sr' ? 'spheres only' : 'spheres, then ICP');
    tableRow(y + 38, ['View', 'Spheres', 'Transform', 'Turn °', 'Shift mm', 'ICP RMSE mm'], xs, { b: true, s: 9.5, c: MUTE });
    S.info.forEach((q, k) => { const yy3 = y + 58 + k * 22, ok = k === 0 || q.ok || VP.reg === 'none'; if (k % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(18, yy3 - 13, W - 36, 22); } tableRow(yy3, [(k + 1) + ' · ' + Math.round(S.views[k].f.ph) + '°', k === 0 ? '–' : q.nS, k === 0 ? 'reference' : VP.reg === 'none' ? 'angle only' : q.ok ? 'spheres' : 'failed: < 3', fmt(Math.abs(q.yaw), 2), fmt(q.tr, 1), q.rmse && q.rmse.length ? fmt(q.rmse[0], 1) + '→' + fmt(q.rmse[q.rmse.length - 1], 1) : '–'], xs, { s: 10, c: ok ? INK : '#B3261E' }); });
    const rms = S.info.slice(1).map(q => q.tr); TF(S.nV < 2 ? 'One view cannot see the back of the leaves: nothing to join.' : 'Mean shift error of the joined views: ' + fmt(rms.reduce((a, b) => a + b, 0) / Math.max(1, rms.length), 1) + ' mm. The chain R0, R0·R1, R0·R1·R2 … adds the error of each link, so the last views drift most (Wang et al., 2025, Fig. 4).', 28, y + 62 + S.nV * 22 + 4, W - 60, { s: 9.5, i: true, c: MUTE });
    y += 62 + S.nV * 22 + 38;
    // ---- 5. traits table
    y = sec(y, '5  Volume and form measured on the joined cloud', 'against the model of P1 for the same day');
    const rowsT = [['Plant height', 'cm', 'height', 1], ['Crown width (largest horizontal span)', 'cm', 'crown', 1], ['Canopy volume, occupied cubes', 'L', 'vox', 2], ['Canopy volume, hull of the slices', 'L', 'hv', 2], ['Leaf area of the plant', 'cm²', 'area', 0], ['Leaf area index (leaf area / ground area)', 'm²/m²', 'lai', 2], ['Number of leaves (angle clusters, then shapes)', '', 'nLeaf', 0], ['Mean leaf length', 'cm', 'leafLen', 1], ['Mean leaf width', 'cm', 'leafWid', 1]];
    const xt = [30, W * 0.42, W * 0.56, W * 0.68, W * 0.80, W - 28].map(v => v), th = 62 + rowsT.length * 22 + 24;
    frame(16, y, W - 32, th, 'Traits of the plant shown (' + (VP.trt === 'ww' ? 'project irrigation' : 'drought') + ')', 'scan = joined cloud · model = P1');
    T('Trait', 30, y + 38, { s: 9.5, b: true, c: MUTE }); ['Model', 'Scan', 'Error', VP.trt === 'ww' ? 'Drought scan' : 'Project scan', 'Ratio'].forEach((h, i) => T(h, [W * 0.56, W * 0.66, W * 0.75, W * 0.87, W - 30][i], y + 38, { s: 9.5, b: true, c: MUTE, a: 'right' }));
    rowsT.forEach((r, i) => { const yy4 = y + 58 + i * 22, mv = tr[r[2]], sv = tt[r[2]], ov = t2[r[2]], er = isFinite(mv) && mv ? 100 * (sv - mv) / mv : NaN; if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(18, yy4 - 13, W - 36, 22); } TF(r[0] + (r[1] ? ' (' + r[1] + ')' : ''), 30, yy4, W * 0.5 - 40, { s: 10 }); const dd2 = r[3] === 2 ? 2 : r[3]; const sc2 = r[2] === 'lai' ? 1 : 1;
      T(fmt(mv * sc2, dd2), W * 0.56, yy4, { s: 10, a: 'right' }); T(fmt(sv, dd2), W * 0.66, yy4, { s: 10, b: true, a: 'right' }); T(isFinite(er) ? (er > 0 ? '+' : '') + fmt(er, 1) + ' %' : '–', W * 0.75, yy4, { s: 10, c: Math.abs(er) < 10 ? '#1E8E3E' : Math.abs(er) < 25 ? '#9A6A00' : '#B3261E', a: 'right' }); T(fmt(ov, dd2), W * 0.87, yy4, { s: 10, a: 'right' }); T(isFinite(sv / ov) ? fmt(sv / ov, 2) : '–', W - 30, yy4, { s: 10, a: 'right' }); });
    TF('The leaf area is counted from the voxels of the surface (area ≈ voxels × size² / 1.5); the leaves are counted as the peaks of the histogram of the angle of the points round the stem (Zhu et al., 2018), and then split by shape; leaves that touch each other along the same angle are counted as one.', 28, y + 62 + rowsT.length * 22 + 4, W - 60, { s: 9.5, i: true, c: MUTE });
    y += th + 8;
    // ---- 6. volume profile and angle histogram
    y = sec(y, '6  Where the volume is', 'the leaf area over the height of the plant, and the leaves round the stem'); const bw2 = (W - 48) / 2, bh2 = 280; frame(16, y, bw2, bh2, 'Leaf area by height', 'cm² per layer, both plants');
    { const H0 = Math.max(S.T.H, S2.T.H), nl = 12, la = (sc) => { const a = new Float32Array(nl), c = sc.fused; for (let i = 0; i < c.n; i++) { if (Math.hypot(c.x[i] - sc.traits.ax, c.y[i] - sc.traits.ay) < 2) continue; const b = Math.min(nl - 1, Math.floor(c.z[i] / H0 * nl)); a[b] += c.vs * c.vs / 1.5; } return a; }, A1 = la(VP.trt === 'ww' ? S : S2), A2 = la(VP.trt === 'ww' ? S2 : S), mx = Math.max(...A1, ...A2, 1), x0 = 16 + 70, ww = bw2 - 100; for (let b = 0; b < nl; b++) { const yb = y + 34 + (nl - 1 - b) * ((bh2 - 54) / nl), hb = (bh2 - 54) / nl - 4; ctx.fillStyle = '#5A6068'; ctx.fillRect(x0, yb, ww * A1[b] / mx, hb / 2); ctx.fillStyle = '#E0665D'; ctx.fillRect(x0, yb + hb / 2, ww * A2[b] / mx, hb / 2); T(fmt(b * H0 / nl, H0 < 40 ? 1 : 0) + '–' + fmt((b + 1) * H0 / nl, H0 < 40 ? 1 : 0) + ' cm', x0 - 6, yb + hb / 2 + 3, { s: 8.5, c: MUTE, a: 'right' }); }
      K.legend([['#5A6068', 'Project irrigation'], ['#E0665D', 'Drought']], 40, y + bh2 - 8); }
    frame(32 + bw2, y, bw2, bh2, 'Leaves round the stem', 'angle θ, Zhu et al. (2018)');
    { const h = tt.hist, nb = h.length, mx = Math.max(...h, 1), x0 = 32 + bw2 + 24, ww = bw2 - 48, y0 = y + 52, hh = bh2 - 92; for (let b = 0; b < nb; b++) { ctx.fillStyle = tt.peaks.includes(b) ? '#D93025' : '#3A6EA5'; ctx.fillRect(x0 + ww * b / nb, y0 + hh - hh * h[b] / mx, Math.max(1, ww / nb - 1), hh * h[b] / mx); } ctx.strokeStyle = '#1B1F23'; ctx.beginPath(); ctx.moveTo(x0, y0 + hh + 0.5); ctx.lineTo(x0 + ww, y0 + hh + 0.5); ctx.stroke(); ['-180°', '-90°', '0°', '90°', '180°'].forEach((l, i) => T(l, x0 + ww * i / 4, y0 + hh + 14, { s: 8.5, c: MUTE, a: 'center' })); TF(tt.nPeaks + ' angle peaks → ' + tt.nLeaf + ' leaves by shape · model: ' + tr.nLeaf, x0, y + 34, ww, { s: 10, b: true, c: tt.nLeaf === tr.nLeaf ? '#1E8E3E' : '#9A6A00' }); }
    y += bh2 + 12;
    // ---- 7. the season
    y = sec(y, '7  Through the season', 'a scan every 10 days (' + (VP.ser ? VP.ser.n : 0) + ' of ' + SDAYS.length * 2 + ' done), the line is the model of P1');
    const pts = (t, f) => (VP.ser && VP.ser[t] ? SDAYS.filter(dx => VP.ser[t][dx]).map(dx => [dx, VP.ser[t][dx].s[f]]) : []);
    const hw = (W - 48) / 2, hc = 230; const wMax = Math.max(...Array.from(Rr('ww').H), ...Array.from(Rr('dr').H), 10) * 1.12;
    lineChart(16, y, hw, hc, 'Plant height', 'cm', 0, wMax, 'cm', [{ c: '#1B1F23', line: Array.from(Rr('ww').H) }, { c: '#D93025', line: Array.from(Rr('dr').H) }, { c: '#1B1F23', pts: pts('ww', 'height') }, { c: '#D93025', pts: pts('dr', 'height') }]);
    const cmax = Math.max(1, ...SDAYS.map(dx => VP.ser && VP.ser.ww[dx] ? VP.ser.ww[dx].s.crown : 0), ...SDAYS.map(dx => VP.ser && VP.ser.dr[dx] ? VP.ser.dr[dx].s.crown : 0)) * 1.15;
    lineChart(32 + hw, y, hw, hc, 'Crown width', 'cm · scan', 0, cmax, 'cm', [{ c: '#1B1F23', pts: pts('ww', 'crown'), line: null }, { c: '#D93025', pts: pts('dr', 'crown') }]); y += hc + 10;
    const vmax = Math.max(0.01, ...SDAYS.map(dx => VP.ser && VP.ser.ww[dx] ? VP.ser.ww[dx].s.hv : 0), ...SDAYS.map(dx => VP.ser && VP.ser.dr[dx] ? VP.ser.dr[dx].s.hv : 0)) * 1.15, amax = Math.max(1, ...SDAYS.map(dx => VP.ser && VP.ser.ww[dx] ? VP.ser.ww[dx].s.area : 0), ...SDAYS.map(dx => VP.ser && VP.ser.dr[dx] ? VP.ser.dr[dx].s.area : 0)) * 1.15;
    lineChart(16, y, hw, hc, 'Canopy volume (hull of the slices)', 'litres · scan', 0, vmax, 'L', [{ c: '#1B1F23', pts: pts('ww', 'hv') }, { c: '#D93025', pts: pts('dr', 'hv') }]);
    lineChart(32 + hw, y, hw, hc, 'Leaf area of the plant', 'cm² · scan', 0, amax, 'cm²', [{ c: '#1B1F23', pts: pts('ww', 'area') }, { c: '#D93025', pts: pts('dr', 'area') }]); y += hc + 10;
    K.legend([['#1B1F23', U.RNc()], ['#D93025', 'Drought']], 20, y + 6); y += 18;
    // the scan against the model: the R2 of Wang et al. (2025)
    if (serDone()) { const g = (f, k) => ['ww', 'dr'].flatMap(t => SDAYS.map(dx => VP.ser[t][dx][k][f])), sw3 = (W - 56) / 3; scatter(16, y, sw3, 230, 'Height', g('height', 's'), g('height', 'tr'), 'cm'); scatter(28 + sw3, y, sw3, 230, 'Crown width', g('crown', 's'), g('crown', 'tr'), 'cm'); scatter(40 + 2 * sw3, y, sw3, 230, 'Leaf area', g('area', 's'), g('area', 'tr'), 'cm²'); y += 240;
      T('Wang et al. (2025) found R² above 0.92 for plant height and crown width and 0.72 to 0.89 for leaf length and width against manual measurements. Here the reference is the plant of the model, black = ' + U.RNc() + ', red = drought.', 16, y + 6, { s: 9.5, i: true, c: MUTE }); y += 22; }
    else { T('Scanning the season in the background … ' + VP.ser.n + ' of ' + SDAYS.length * 2 + ' scans done.', 16, y + 14, { s: 11, b: true, c: '#9A6A00' }); y += 30; }
    // ---- 8. the connections
    y = sec(y, '8  What feeds this layer and what it feeds', 'every number below is read from the run of the project'); y = connections(y, S, S2, tt, t2, tr, tr2);
    try { const h = Math.ceil(y + 20); if (Math.abs(currentScene.h - h) > 4) { currentScene.h = h; setCanvasH(h); } } catch (e) { }
  }
  // the links of this layer with the rest of SWAFL
  function connections(y, S, S2, tt, t2, tr, tr2) {
    const Rw = Rr('ww'), Rd = Rr('dr'), d = U.day(), sum = (a, f) => { let s = 0; for (let i = 0; i < N; i++) s += a[i]; return s; }, tot = R => R.totals || {}, Tw = tot(Rw), Td = tot(Rd);
    const tex = DATA.texture[state.soil], vi = tt.hv > 0 && t2.hv > 0 ? (VP.trt === 'dr' ? tt.hv / t2.hv : t2.hv / tt.hv) : NaN, wue = Td.T > 0 ? (Td.T) / Math.max(0.001, t2.hv + tt.hv) : NaN;
    const rows = [
      ['Soil and tillage', ((DATA.soil_labels || {})[state.soil] || state.soil) + ' · ' + fmt(tex.sand) + ' % sand, ' + fmt(tex.clay) + ' % clay', 'fills the root zone: the water the roots can reach', 'v3'],
      ['Weather and irrigation', 'rain ' + fmt(Td.P) + ' mm · irrigation (project) ' + fmt(Tw.I) + ' mm · drought ' + fmt(Td.I) + ' mm', 'decides the stress of the plant', 'field'],
      ['Leaf water', 'leaf water potential at day ' + d + ': ' + fmt(Rn_(VP.trt).psiL[d], 2) + ' MPa · relative water content ' + fmt(100 * Rn_(VP.trt).RWC[d]) + ' %', 'rolling and ageing of the leaves', 'spac'],
      ['Leaf rolling', 'rolling ' + fmt(100 * Rn_(VP.trt).roll[d]) + ' % at day ' + d, 'narrows the crown: width ' + fmt(tt.crown) + ' cm, ratio drought / ' + U.RN() + ' = ' + (isFinite(tt.crown / t2.crown) ? fmt(VP.trt === 'dr' ? tt.crown / t2.crown : t2.crown / tt.crown, 2) : '–'), 'dph'],
      ['Volumetric stress index', isFinite(vi) ? fmt(vi, 2) + ' (canopy volume under drought / ' + U.RN() + ')' : '–', vi < 0.7 ? 'a strong signal: irrigate or relieve the stress' : vi < 0.9 ? 'a weak signal: watch the next days' : 'no signal from the volume', 'crop'],
      ['Transpiration per litre of canopy', isFinite(wue) ? fmt(wue, 1) + ' mm per litre of canopy volume (both plants)' : '–', 'the volume is the sink of the water of the project', 'yby']
    ];
    const rh = 38, th = 44 + rows.length * rh; frame(16, y, W - 32, th, 'The chain: soil → water → leaf → volume → decision', 'click a row to open the layer that feeds it');
    rows.forEach((r, i) => { const yy = y + 28 + i * rh; if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(18, yy, W - 36, rh); } T(r[0], 30, yy + 15, { s: 10.5, b: true, c: NAVY }); TF(r[1], 30, yy + 30, W * 0.52, { s: 10 }); TF(r[2], W * 0.58, yy + 22, W * 0.4 - 40, { s: 10, c: MUTE }); const sc = SCENES.find(s => s.id === r[4]); hot(18, yy, W - 36, rh, () => { if (sc) switchScene(sc); }, 'open ' + (sc ? sc.label : r[4])); });
    return y + th + 10;
  }
  const Rn_ = t => Rr(t);
  // ---------------------------------------------------------------- the mouse
  function onDown(p) {
    for (const s of SLd) if (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h) { VP.drag = { t: 'sl', s }; s.set(clamp(s.min + (s.max - s.min) * (p.x - s.x0) / s.w0, s.min, s.max)); return true; }
    const hs = hotAt(p); if (hs && hs.tip !== 'drag to turn the clouds') { hs.fn(p); return true; }
    if (p.x >= ROTB.x && p.x <= ROTB.x + ROTB.w && p.y >= ROTB.y && p.y <= ROTB.y + ROTB.h) { VP.drag = { t: 'rot', x0: p.x, r0: VP.rot }; return true; }
    return false;
  }
  function onMove(p) { const dg = VP.drag; if (!dg) { hotMove(p); return false; } if (dg.t === 'sl') { dg.s.set(clamp(dg.s.min + (dg.s.max - dg.s.min) * (p.x - dg.s.x0) / dg.s.w0, dg.s.min, dg.s.max)); return true; } if (dg.t === 'rot') { VP.rot = dg.r0 + (p.x - dg.x0) * 0.012; return true; } return false; }
  function onUp() { VP.drag = null; }
  K.add('vph', 'P2 Volumetric phenotyping', '#1E6F8E', drawVph, 'Volumetric phenotyping: a virtual 3D scanner measures volume, crown, leaves and height of the plant (point clouds, spheres, SR-ICP)', 'A plant seen from six sides is a plant seen whole: the clouds of the views are joined with calibration spheres and ICP, and the volume of the canopy follows the soil water, the weather and the irrigation of the project through the plant of P1.');
  const sc = SCENES.find(s => s.id === 'vph'); if (sc) { sc.play = true; sc.dur = 40; sc.h = 3800; sc.onDown = onDown; sc.onMove = onMove; sc.onUp = onUp; sc.onLeave = () => { hotUi.hover = null; }; }
  (function place() {
    const s = SCENES.find(x => x.id === 'vph'), bar = document.getElementById('sceneBar'); if (!s || !bar || bar.querySelector('[data-scene="vph"]')) return;
    const b = document.createElement('div'); b.className = 'scenebtn'; b.innerHTML = '<span class="no">P2</span><span>Volumetric phenotyping</span>'; b.style.setProperty('--sc', s.color); b.dataset.scene = 'vph'; b.title = s.title; b.onclick = () => switchScene(s);
    const dph = bar.querySelector('[data-scene="dph"]'); if (dph && dph.nextSibling) bar.insertBefore(b, dph.nextSibling); else bar.appendChild(b);
  })();
})();
