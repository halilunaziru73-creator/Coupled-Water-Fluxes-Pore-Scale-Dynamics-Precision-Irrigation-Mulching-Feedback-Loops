/* Precision maps of the demarcated field.
   1. Variable-rate irrigation (VRI): every monitoring zone of the Sentinel-2 season runs its own FAO-56 daily balance with its
      soil (SoilGrids), its observed cover, and the roots, trigger, crop, past irrigations and weather of the SWAFL model: its own
      dates and depths. The prescription exports as GeoJSON and CSV for a VRI controller.
   2. Ephemeral gullies: the terrain of the field and its surroundings from open elevation tiles (AWS Terrain Tiles, Terrarium,
      from SRTM, Copernicus and national lidar where available), smoothed, sinks filled (priority flood), D8 flow directions and
      upslope area; ephemeral gullies start where the slope and the contributing area pass the topographic threshold of
      cultivated fields S = 0.025 A^-0.4 (Vandaele et al., 1996) and run down the flow lines. The satellite photo is searched for
      linear features with a Hessian ridge and valley filter (computer vision, Frangi et al., 1998) along the predicted lines:
      a line with such a feature is marked as seen in the photo.
   3. Soil loss (RUSLE): A = R K LS C P, with R from the annual rain (Renard and Freimund, 1994), K from the soil texture and
      organic carbon (EPIC, Sharpley and Williams, 1990), LS from the upslope area and slope (Moore and Wilson, 1992), C from NDVI
      (van der Knijff et al., 1999) and P = 1 (no conservation practice) unless chosen. */
'use strict';
const FieldPrec = (() => {
  const rad = Math.PI / 180, P = { vri: null, ero: null, pal: 'spectral', nz: 5, adj: {} };
  const H = () => FieldMap._h, F = () => FieldMap._h.F;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PAL = { spectral: [[94, 79, 162], [50, 136, 189], [102, 194, 165], [171, 221, 164], [230, 245, 152], [254, 224, 139], [253, 174, 97], [244, 109, 67], [213, 62, 79]], turbo: [[48, 18, 59], [70, 107, 227], [40, 187, 236], [49, 242, 153], [164, 252, 60], [237, 207, 58], [251, 126, 33], [203, 42, 5], [122, 4, 3]], ylgnbu: [[255, 255, 217], [199, 233, 180], [127, 205, 187], [65, 182, 196], [29, 145, 192], [34, 94, 168], [12, 44, 132]], blues: [[247, 251, 255], [198, 219, 239], [107, 174, 214], [33, 113, 181], [8, 48, 107]], viridis: [[253, 231, 37], [94, 201, 98], [33, 145, 140], [59, 82, 139], [68, 1, 84]], ryb: [[215, 48, 39], [252, 141, 89], [254, 224, 144], [145, 191, 219], [69, 117, 180]], greens: [[247, 252, 245], [199, 233, 192], [116, 196, 118], [35, 139, 69], [0, 68, 27]] };
  const palAt = (name, t) => { const A = PAL[name] || PAL.blues; t = Math.max(0, Math.min(1, t)) * (A.length - 1); const i = Math.min(A.length - 2, Math.floor(t)), f = t - i; return A[i].map((c, q) => Math.round(c + (A[i + 1][q] - c) * f)); };

  // ------------------------------------------------------------------ 1. variable-rate irrigation, simulated zone by zone
  // The zones are the monitoring zones of the Sentinel-2 season (or, with one date only, classes of the index of that date). Each
  // zone is run through the FAO-56 daily root-zone balance from 45 days before the start of the decision to 60 days after, with
  // its own soil (SoilGrids at the zone, nearest SWAFL soil and its available water), its own crop cover (the crop development of
  // the SWAFL daily model scaled by the zone's observed cover, density coefficient of Allen and Pereira, 2009), the roots and the
  // trigger of the SWAFL model, the past irrigations of the model, and the reference ET and rain of the weather in use, with its
  // forecast. As in the SWAFL daily model, a zone is irrigated when its crop covers more than a fifth of the ground and its
  // depletion reaches the trigger; the irrigation refills the root zone. Each zone gets its own irrigation dates and depths.
  const fcOf = ndvi => Math.max(0, Math.min(1, (ndvi - 0.15) / 0.7));
  function nearestSoil(B, so) { let b = null, bd = Infinity; B.soils.forEach(r => { if (r[2] == null) return; const d = Math.hypot(r[2] - so.sand, r[3] - so.clay); if (d < bd) { bd = d; b = r; } }); return b; }
  async function vri(st) {
    const Fm = F(), h = H(), ts = FieldMon.ts; let B; try { B = E.json('vriBase(60,45)'); } catch (e) {} if (!B) throw new Error('the simulation is not ready');
    let G, zl, Z, how;
    if (ts) { G = ts.G; zl = ts.zone; Z = ts.Z.map(z => ({ r: z.r, ha: z.ha, pct: z.pct, ndvi: z.last.ndvi, ndmi: z.last.ndmi, ctr: z.ctr, cells: z.n })); how = 'monitoring zones of ' + ts.S.length + ' Sentinel-2 scenes (' + ts.S[0].date + ' to ' + ts.S[ts.S.length - 1].date + ')'; }
    else if (Fm.res) { const R = Fm.res, k = R.keys.includes('NDVI') ? 'NDVI' : R.keys.includes('VARI') ? 'VARI' : R.keys[0], v = R.vals[R.keys.indexOf(k)], w = R.keys.includes('NDWI') ? R.vals[R.keys.indexOf('NDWI')] : null; G = R.G;
      const toN = x => k === 'VARI' ? 0.15 + (x + 0.1) / 0.6 * 0.7 : x, srt = Array.from(v).filter(isFinite).sort((a, b) => a - b), nz = P.nz, br = []; for (let q = 1; q < nz; q++) br.push(srt[Math.floor(q / nz * (srt.length - 1))]);
      zl = new Int8Array(v.length).fill(-1); const acc = Array.from({ length: nz }, () => ({ n: 0, s: 0, w: 0, nw: 0, cx: 0, cy: 0 }));
      for (let i = 0; i < v.length; i++) { if (!isFinite(v[i])) continue; let z = 0; while (z < br.length && v[i] > br[z]) z++; zl[i] = z; const a = acc[z]; a.n++; a.s += toN(v[i]); if (w && isFinite(w[i])) { a.w += w[i]; a.nw++; } a.cx += i % G.nx; a.cy += Math.floor(i / G.nx); }
      const tot = acc.reduce((a, b) => a + b.n, 0), A = h.areaM2(Fm.pts) / 1e4; Z = acc.map((a, r) => ({ r, ha: a.n / tot * A, pct: a.n / tot * 100, ndvi: a.n ? a.s / a.n : NaN, ndmi: a.nw ? a.w / a.nw : NaN, ctr: a.n ? G.ll(a.cx / a.n, a.cy / a.n) : null, cells: a.n }));
      how = 'classes of ' + k + ' of ' + R.date + ' (one date: read the season for monitoring zones)'; }
    else throw new Error('compute the indices of the field or read the season first');
    // the soil of each zone
    for (const z of Z) { z.awc = B.awc; z.soil = B.soil + ' (project)'; z.soilSrc = 'project';
      if (z.ctr) { try { st && (st.textContent = 'Soil of zone ' + (z.r + 1) + ' (SoilGrids)...'); const so = await FieldSite.soilAt(z.ctr), nb = nearestSoil(B, so); if (nb) { z.awc = nb[4]; z.soil = so.cls + ' → ' + nb[1]; z.soilSrc = 'SoilGrids'; z.sand = so.sand; z.clay = so.clay; } } catch (e) {} } }
    // the observed cover of each zone against the field (area-weighted), to scale the crop development of the model
    const fcF = Z.reduce((a, z) => a + fcOf(z.ndvi) * z.ha, 0) / Math.max(1e-6, Z.reduce((a, z) => a + z.ha, 0));
    const n = B.dates.length, s0 = B.spin, Ea = Math.max(0.3, B.Ea || 0.75);
    Z.forEach(z => { const rz = fcF > 0.02 ? fcOf(z.ndvi) / fcF : 1; z.ratio = rz;
      let Dr = Math.max(0, B.depSpin) * z.awc * B.rd[0]; const ev = [], kcs = []; let Dr0 = null;
      for (let q = 0; q < n; q++) { const TAW = z.awc * B.rd[q], fc = Math.min(1, B.cover[q] * rz), Kd = Math.min(1, 1.5 * fc, Math.sqrt(fc)), Kc = B.live[q] ? B.kcIni + (B.kcMid - B.kcIni) * Kd : 0.25, p = B.p0;
        if (Dr > TAW) Dr = TAW; const ks = Dr > p * TAW ? Math.max(0, (TAW - Dr) / ((1 - p) * TAW)) : 1, P2 = B.rain[q], ro = P2 > 35 ? (P2 - 35) * 0.3 : 0;
        Dr = Dr + Kc * B.et0[q] * ks - (P2 - ro); if (Dr < 0) Dr = 0;
        if (q < s0) { if (B.irr[q] > 0) Dr = Math.max(0, Dr - B.irr[q]); } else { if (q === s0) { Dr0 = Dr; z.kcNow = Kc; } if (B.live[q] && fc > 0.2 && Dr >= B.fT * TAW && TAW > 1) { ev.push({ q: q - s0, date: B.dates[q], net: Dr }); Dr = 0; } }
        kcs.push(Kc); }
      z.dep0 = Dr0 / Math.max(1, z.awc * B.rd[s0]); z.events = ev; z.next = ev[0] || null; z.netSum = ev.reduce((a, e) => a + e.net, 0); });
    // zone depths: the depth of the next irrigation of each zone (editable)
    Z.forEach(z => { const key = Z.length + ':' + z.r; z.depth = P.adj[key] != null ? P.adj[key] : z.next ? Math.round(z.next.net * 2) / 2 : 0; });
    const A = h.areaM2(Fm.pts) / 1e4, net = Z.reduce((a, z) => a + z.depth * z.ha * 10, 0), season = Z.reduce((a, z) => a + z.netSum * z.ha * 10, 0);
    const uniDepth = B.simNext.length ? B.simNext[0][1] : 0, uni = uniDepth * A * 10;
    return { G, zl, Z, nz: Z.length, B, how, Ea, net, gross: net / Ea, uni, uniGross: uni / Ea, seasonNet: season, A, fcF };
  }
  const zoneCol = (V, z) => palAt(P.pal, V.nz > 1 ? z / (V.nz - 1) : 0.5);

  // ------------------------------------------------------------------ 2 and 3. terrain, gullies and soil loss
  const TT = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/';
  const mx = (lon, z) => (lon + 180) / 360 * 256 * 2 ** z, my = (lat, z) => (1 - Math.log(Math.tan(lat * rad) + 1 / Math.cos(lat * rad)) / Math.PI) / 2 * 256 * 2 ** z;
  const ilat = (y, z) => Math.atan(Math.sinh(Math.PI - 2 * Math.PI * y / (256 * 2 ** z))) / rad, ilon = (x, z) => x / (256 * 2 ** z) * 360 - 180;
  async function dem(s, w, n, e) {
    let z = 15; while (z > 10 && (mx(e, z) - mx(w, z) > 700 || my(s, z) - my(n, z) > 700)) z--;
    const x0 = Math.floor(mx(w, z)), y0 = Math.floor(my(n, z)), x1 = Math.ceil(mx(e, z)), y1 = Math.ceil(my(s, z)), W = x1 - x0, Hh = y1 - y0;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const c = cv.getContext('2d', { willReadFrequently: true }); let ok = 0;
    const jobs = []; for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x1 - 1) / 256); tx++) for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y1 - 1) / 256); ty++)
      jobs.push(new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; const t = setTimeout(res, 15000); im.onload = () => { clearTimeout(t); c.drawImage(im, tx * 256 - x0, ty * 256 - y0); ok++; res(); }; im.onerror = () => { clearTimeout(t); res(); }; im.src = TT + z + '/' + tx + '/' + ty + '.png'; }));
    await Promise.all(jobs); if (!ok) throw new Error('the elevation tiles cannot be reached (no internet connection)');
    let d; try { d = c.getImageData(0, 0, W, Hh).data; } catch (e) { throw new Error('the elevation tiles cannot be read'); }
    const Z = new Float32Array(W * Hh); for (let i = 0; i < W * Hh; i++) Z[i] = d[i * 4] * 256 + d[i * 4 + 1] + d[i * 4 + 2] / 256 - 32768;
    const mpp = 156543.03392 * Math.cos((s + n) / 2 * rad) / 2 ** z;
    return { Z, W, H: Hh, z, mpp, ll: (x, y) => [ilat(y + y0, z), ilon(x + x0, z)], px: (lat, lon) => [mx(lon, z) - x0, my(lat, z) - y0], bounds: [[ilat(y1, z), ilon(x0, z)], [ilat(y0, z), ilon(x1, z)]] };
  }
  function smooth(Z, W, Hh) { const k = [1, 4, 6, 4, 1], o = new Float32Array(Z.length), t = new Float32Array(Z.length);
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0, w = 0; for (let q = -2; q <= 2; q++) { const xx = x + q; if (xx < 0 || xx >= W) continue; s += Z[y * W + xx] * k[q + 2]; w += k[q + 2]; } t[y * W + x] = s / w; }
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0, w = 0; for (let q = -2; q <= 2; q++) { const yy = y + q; if (yy < 0 || yy >= Hh) continue; s += t[yy * W + x] * k[q + 2]; w += k[q + 2]; } o[y * W + x] = s / w; } return o; }
  function fill(Z, W, Hh) {   // priority-flood depression filling (Barnes et al., 2014), with a small gradient so every cell drains
    const F2 = Float32Array.from(Z), done = new Uint8Array(W * Hh), heap = [], push = (v, i) => { heap.push([v, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } },
      pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    for (let x = 0; x < W; x++) { push(F2[x], x); done[x] = 1; const b = (Hh - 1) * W + x; push(F2[b], b); done[b] = 1; } for (let y = 1; y < Hh - 1; y++) { const a = y * W, b = y * W + W - 1; push(F2[a], a); done[a] = 1; push(F2[b], b); done[b] = 1; }
    while (heap.length) { const [v, i] = pop(), x = i % W, y = (i / W) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const j = yy * W + xx; if (done[j]) continue; done[j] = 1; if (F2[j] <= v) F2[j] = v + 1e-4; push(F2[j], j); } }
    return F2;
  }
  function flow(Z, W, Hh, cell) {   // D8 directions, upslope area (m²) and the local slope (m/m)
    const N = W * Hh, dir = new Int32Array(N).fill(-1), A = new Float64Array(N).fill(cell * cell), S = new Float32Array(N), ord = Array.from({ length: N }, (_, i) => i).sort((a, b) => Z[b] - Z[a]);
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let best = 0, bj = -1; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const j = yy * W + xx, g = (Z[i] - Z[j]) / (cell * Math.hypot(dx, dy)); if (g > best) { best = g; bj = j; } } dir[i] = bj;
      const zx = (Z[y * W + Math.min(W - 1, x + 1)] - Z[y * W + Math.max(0, x - 1)]) / (cell * (Math.min(W - 1, x + 1) - Math.max(0, x - 1) || 1)), zy = (Z[Math.min(Hh - 1, y + 1) * W + x] - Z[Math.max(0, y - 1) * W + x]) / (cell * (Math.min(Hh - 1, y + 1) - Math.max(0, y - 1) || 1)); S[i] = Math.hypot(zx, zy); }
    for (const i of ord) if (dir[i] >= 0) A[dir[i]] += A[i];
    return { dir, A, S };
  }
  // the Hessian ridge and valley filter of the photo (largest eigenvalue magnitude at two scales, Frangi-style line measure)
  function lineness(img, W, Hh) {
    const L = new Float32Array(W * Hh); for (let i = 0; i < W * Hh; i++) L[i] = (0.299 * img.data[i * 4] + 0.587 * img.data[i * 4 + 1] + 0.114 * img.data[i * 4 + 2]) / 255;
    const out = new Float32Array(W * Hh);
    for (const sg of [1.5, 3]) { const r = Math.ceil(3 * sg), k = []; let ks = 0; for (let q = -r; q <= r; q++) { const v = Math.exp(-q * q / (2 * sg * sg)); k.push(v); ks += v; } k.forEach((v, q) => { k[q] = v / ks; });
      const t = new Float32Array(W * Hh), g = new Float32Array(W * Hh); for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0; for (let q = -r; q <= r; q++) s += L[y * W + Math.max(0, Math.min(W - 1, x + q))] * k[q + r]; t[y * W + x] = s; }
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0; for (let q = -r; q <= r; q++) s += t[Math.max(0, Math.min(Hh - 1, y + q)) * W + x] * k[q + r]; g[y * W + x] = s; }
      for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, dxx = g[i + 1] - 2 * g[i] + g[i - 1], dyy = g[i + W] - 2 * g[i] + g[i - W], dxy = (g[i + W + 1] - g[i + W - 1] - g[i - W + 1] + g[i - W - 1]) / 4, tr = dxx + dyy, de = Math.sqrt(Math.max(0, (dxx - dyy) ** 2 + 4 * dxy * dxy)), l1 = (tr + de) / 2, l2 = (tr - de) / 2, a = Math.abs(l1) > Math.abs(l2) ? l1 : l2, b2 = Math.abs(l1) > Math.abs(l2) ? l2 : l1;
        const Rb = Math.abs(b2) / (Math.abs(a) + 1e-9), Sv = Math.hypot(l1, l2), v = Math.exp(-Rb * Rb / 0.5) * (1 - Math.exp(-Sv * Sv / (2 * 0.0004))) * sg * sg; if (v > out[i]) out[i] = v; } }
    return out;
  }
  async function erosion(st) {
    const Fm = F(), h = H(), ts = FieldMon.ts; if (Fm.pts.length < 3) throw new Error('demarcate the field first');
    const lats = Fm.pts.map(p => p[0]), lons = Fm.pts.map(p => p[1]), c0 = h.centroid(Fm.pts), bufLat = 250 / 110540, bufLon = 250 / (111320 * Math.cos(c0[0] * rad));
    st && (st.textContent = 'Reading the terrain (open elevation tiles)...');
    const D = await dem(Math.min(...lats) - bufLat, Math.min(...lons) - bufLon, Math.max(...lats) + bufLat, Math.max(...lons) + bufLon), cell = D.mpp;
    st && (st.textContent = 'Terrain analysis: smoothing, filling sinks, flow directions and upslope area of ' + (D.W * D.H).toLocaleString('en-US') + ' cells...'); await new Promise(r => setTimeout(r, 20));
    const Zs = smooth(D.Z, D.W, D.H), Zf = fill(Zs, D.W, D.H), FL = flow(Zf, D.W, D.H, cell), N = D.W * D.H, ins = new Uint8Array(N);
    for (let y = 0; y < D.H; y++) for (let x = 0; x < D.W; x++) { const ll = D.ll(x + 0.5, y + 0.5); if (h.inside(ll[0], ll[1], Fm.pts)) ins[y * D.W + x] = 1; }
    const gi = new Float32Array(N); for (let i = 0; i < N; i++) gi[i] = FL.S[i] * Math.pow(FL.A[i] / 1e4, 0.4) / 0.025;
    const onG = new Uint8Array(N); for (let i = 0; i < N; i++) if (ins[i] && gi[i] >= 1 && FL.A[i] >= 1000) { let j = i, k = 0; while (j >= 0 && k++ < 2000 && ins[j] && !onG[j]) { onG[j] = 1; j = FL.dir[j]; } }
    const lines = [], used = new Uint8Array(N), heads = [];
    for (let i = 0; i < N; i++) if (onG[i]) { let up = false; const x = i % D.W, y = (i / D.W) | 0; for (let dy = -1; dy <= 1 && !up; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= D.W || yy >= D.H) continue; const j = yy * D.W + xx; if (onG[j] && FL.dir[j] === i) { up = true; break; } } if (!up) heads.push(i); }
    heads.forEach(hd => { const pts = []; let j = hd, len = 0, k = 0; while (j >= 0 && onG[j] && k++ < 3000) { pts.push(j); if (used[j]) break; used[j] = 1; const nj = FL.dir[j]; if (nj >= 0) len += cell * Math.hypot((nj % D.W) - (j % D.W), ((nj / D.W) | 0) - ((j / D.W) | 0)); j = nj; } if (len >= 3 * cell) lines.push({ cells: pts, len, A: FL.A[pts[pts.length - 1]], Ahead: FL.A[pts[0]], S: pts.reduce((a, q) => a + FL.S[q], 0) / pts.length }); });
    // the soil: SoilGrids at the field (texture and organic carbon), else the SWAFL soil
    let soil = Fm.site && Fm.site.soil ? Fm.site.soil : null, soilSrc = soil ? 'SoilGrids' : '';
    if (!soil) { try { st && (st.textContent = 'Soil of the field (SoilGrids)...'); soil = await FieldSite.soilAt(c0); soilSrc = 'SoilGrids'; } catch (e) { try { const t = E.json('DATA.texture[state.soil]'); soil = { sand: t.sand, silt: t.silt, clay: t.clay, soc: NaN, cls: E.json('DATA.soil_labels[state.soil]').toLowerCase() }; soilSrc = 'SWAFL soil (SoilGrids not reached)'; } catch (e2) {} } }
    // the rain: the daily series of the weather in use (20 years); the erosivity of each month from the daily rains of 12.7 mm and more
    const RS = E.json('rainSeries()'), PR = RS.P, ny = RS.years, Pa = PR.reduce((a, b) => a + b, 0) / ny, mOf = k => Math.min(11, Math.floor((k % RS.dpy) / 30.42));
    const Rf = Pa <= 850 ? 0.0483 * Math.pow(Pa, 1.61) : 587.8 - 1.219 * Pa + 0.004105 * Pa * Pa, em = new Array(12).fill(0); PR.forEach((v, k) => { if (v >= 12.7) em[mOf(k)] += Math.pow(v, 1.81); }); const emS = em.reduce((a, b) => a + b, 0) || 1, Rm = em.map(v => Rf * v / emS);
    // the cover of each month: the Sentinel-2 scene nearest the middle of the month, cell by cell; else the crop cover of the SWAFL model
    let B = null; try { B = E.json('vriBase(1,0)'); } catch (e) {}
    const monthNDVI = (lat, lon) => { const out = new Array(12).fill(NaN);
      if (ts) { const G = ts.G, l = h.local([lat, lon], G.o), i = Math.floor((l[0] - G.x0) / G.cell), j = Math.floor((G.y1 - l[1]) / G.cell); if (i >= 0 && j >= 0 && i < G.nx && j < G.ny) { const q = j * G.nx + i; for (let m = 0; m < 12; m++) { let best = null, bd = 99; ts.S.forEach(s => { const d = new Date(s.date), dm = Math.abs(((d.getUTCMonth() + d.getUTCDate() / 31) - (m + 0.5) + 18) % 12 - 6); if (isFinite(s.ndvi[q]) && dm < bd) { bd = dm; best = s.ndvi[q]; } }); out[m] = bd <= 1.6 ? best : NaN; } } }
      if (B) for (let m = 0; m < 12; m++) if (!isFinite(out[m])) { let rel = 1; if (Fm.res && Fm.res.keys.includes('NDVI')) { const v = h.valueAt('NDVI', lat, lon), mean = Fm.res.S.NDVI ? Fm.res.S.NDVI.mean : NaN; if (isFinite(v) && mean > 0.05) rel = v / mean; } out[m] = Math.max(0.05, Math.min(0.9, (0.15 + 0.7 * B.coverMonth[m]) * rel)); }
      return out; };
    const Cof = nd => Math.max(0.001, Math.min(1, Math.exp(-2 * nd / Math.max(0.05, 1 - nd))));
    const K = soil ? epicK(soil.sand, soil.silt, soil.clay, isFinite(soil.soc) ? soil.soc / 10 * 0.1 : 1.2) : 0.03, Pf = P.practice || 1, loss = new Float32Array(N).fill(NaN), Cf = new Float32Array(N).fill(NaN);
    const fieldM = new Array(12).fill(0); let nIn = 0;
    for (let i = 0; i < N; i++) { if (!ins[i]) continue; const ll = D.ll((i % D.W) + 0.5, ((i / D.W) | 0) + 0.5), nm = monthNDVI(ll[0], ll[1]); let Ce = 0; for (let m = 0; m < 12; m++) { Ce += Rm[m] * Cof(nm[m]) / Rf; fieldM[m] += nm[m]; } nIn++;
      const As = FL.A[i] / cell, sb = Math.sin(Math.atan(FL.S[i])), LS = Math.pow(As / 22.13, 0.4) * Math.pow(sb / 0.0896, 1.3); Cf[i] = Ce; loss[i] = Rf * K * LS * Ce * Pf; }
    const ndviM = fieldM.map(v => v / Math.max(1, nIn));
    // runoff of every day of the rain series on this soil and this cover (SCS curve number, TR-55 row crops in good condition, bare soil when NDVI < 0.3)
    const hsg = !soil ? 'B' : soil.sand > 70 ? 'A' : soil.clay > 40 ? 'D' : soil.clay > 27 || soil.sand < 20 ? 'C' : 'B', CNc = { A: 67, B: 78, C: 85, D: 89 }[hsg], CNb = { A: 77, B: 86, C: 91, D: 94 }[hsg];
    const Q = (Pd, CN) => { const Sr = 25400 / CN - 254; return Pd > 0.2 * Sr ? (Pd - 0.2 * Sr) ** 2 / (Pd + 0.8 * Sr) : 0; };
    const qm = new Array(12).fill(0), ev10 = new Array(12).fill(0); let Qmax = 0, Pmax = 0, kmax = 0; PR.forEach((v, k) => { const m = mOf(k), q = Q(v, ndviM[m] < 0.3 ? CNb : CNc); qm[m] += q / ny; if (q >= 10) ev10[m] += 1 / ny; if (v > Pmax) { Pmax = v; kmax = k; Qmax = q; } });
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], win = MON.map((n, m) => ({ m, n, R: Rm[m], ndvi: ndviM[m], q: qm[m], ev: ev10[m] })).filter(x => x.ndvi < 0.35 && x.R > Rf / 24).sort((a, b) => b.R - a.R);
    lines.forEach(l => { l.vmax = Qmax / 1000 * l.Ahead; l.vEnd = Qmax / 1000 * l.A; });
    // the evidence of the crop along each gully: Sentinel-2 cells along the line, against the field over the season
    if (ts) lines.forEach(l => { let a = 0, n = 0; l.cells.forEach(q => { const ll = D.ll((q % D.W) + 0.5, ((q / D.W) | 0) + 0.5), G = ts.G, lc = h.local(ll, G.o), i = Math.floor((lc[0] - G.x0) / G.cell), j = Math.floor((G.y1 - lc[1]) / G.cell); if (i < 0 || j < 0 || i >= G.nx || j >= G.ny) return; const v = ts.stab[j * G.nx + i]; if (isFinite(v)) { a += v; n++; } }); l.s2 = n ? a / n : NaN; l.s2seen = n && a / n < -0.5; });
    // the photo: linear features along the predicted gullies (Hessian ridge and valley filter)
    let photo = null; try { st && (st.textContent = 'Searching the satellite photo for linear erosion features (Hessian ridge and valley filter)...'); const Mo = await FieldSite.mosaic(D.bounds[0][0], D.bounds[0][1], D.bounds[1][0], D.bounds[1][1], 1400, 18); const Lm = lineness(Mo.img, Mo.W, Mo.H);
      let mean = 0, n = 0; for (let i = 0; i < Lm.length; i += 7) { mean += Lm[i]; n++; } mean /= n || 1; let sd = 0; for (let i = 0; i < Lm.length; i += 7) sd += (Lm[i] - mean) ** 2; sd = Math.sqrt(sd / (n || 1)) || 1e-6;
      lines.forEach(l => { let hit = 0; l.cells.forEach(q => { const ll = D.ll((q % D.W) + 0.5, ((q / D.W) | 0) + 0.5), p = Mo.px(ll[0], ll[1]), r2 = Math.max(2, Math.round(cell / Mo.mpp)); let best = 0; for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) { const xx = Math.round(p[0]) + dx, yy = Math.round(p[1]) + dy; if (xx < 0 || yy < 0 || xx >= Mo.W || yy >= Mo.H) continue; best = Math.max(best, Lm[yy * Mo.W + xx]); } if ((best - mean) / sd > 2) hit++; }); l.photo = hit / l.cells.length; l.seen = l.photo >= 0.4; });
      photo = { mpp: Mo.mpp, z: Mo.z }; } catch (e) { photo = { err: e.message }; }
    const inside = []; for (let i = 0; i < N; i++) if (ins[i]) inside.push(i);
    const lv = inside.map(i => loss[i]).filter(isFinite).sort((a, b) => a - b), A = h.areaM2(Fm.pts) / 1e4, meanLoss = lv.reduce((a, b) => a + b, 0) / (lv.length || 1), zIn = inside.map(i => D.Z[i]), slopes = inside.map(i => FL.S[i] * 100).sort((a, b) => a - b);
    const kDate = k => { const y = RS.y0 + Math.floor(k / RS.dpy), d = new Date(Date.UTC(y, 0, 1 + (k % RS.dpy))); return d.toISOString().slice(0, 10); };
    P.ero = { D, FL, Zf, gi, ins, lines, loss, Cf, photo, rain: Pa, rainSrc: RS.src, Rf, Rm, K, soil, soilSrc, Pf, A, meanLoss, total: meanLoss * A, p90: lv[Math.floor(lv.length * 0.9)] || 0, hiPct: inside.filter(i => gi[i] >= 1).length / inside.length * 100, modPct: inside.filter(i => gi[i] >= 0.5 && gi[i] < 1).length / inside.length * 100,
      relief: Math.max(...zIn) - Math.min(...zIn), slopeMean: slopes.reduce((a, b) => a + b, 0) / (slopes.length || 1), slopeMax: slopes[slopes.length - 1] || 0, cell, gLen: lines.reduce((a, l) => a + l.len, 0), seen: lines.filter(l => l.seen).length, s2seen: lines.filter(l => l.s2seen).length,
      hsg, CNc, CNb, qm, ev10, Qyear: qm.reduce((a, b) => a + b, 0), events: ev10.reduce((a, b) => a + b, 0), Pmax, Qmax, maxDate: kDate(kmax), win, ndviM, coverSrc: ts ? 'the Sentinel-2 scenes of ' + ts.S[0].date + ' to ' + ts.S[ts.S.length - 1].date + ' (crop model where a month has no scene)' : 'the crop cover of the SWAFL daily model' + (Fm.res && Fm.res.keys.includes('NDVI') ? ' scaled by the NDVI of ' + Fm.res.date : '') };
    return P.ero;
  }
  function epicK(sa, si, cl, oc) {   // EPIC soil erodibility (Sharpley and Williams, 1990), t ha h / (ha MJ mm)
    const sn = 1 - sa / 100, fs = 0.2 + 0.3 * Math.exp(-0.0256 * sa * (1 - si / 100)), fcs = Math.pow(si / Math.max(1, cl + si), 0.3), fo = 1 - 0.25 * oc / (oc + Math.exp(3.72 - 2.95 * oc)), fh = 1 - 0.7 * sn / (sn + Math.exp(-5.51 + 22.9 * sn));
    return fs * fcs * fo * fh * 0.1317;
  }


  // ------------------------------------------------------------------ pictures of the maps (canvas in the grid of each map, cut to the field)
  function canvasVRI(V, byDate) { const G = V.G, cv = document.createElement('canvas'), sc = Math.max(1, Math.min(24, 1400 / Math.max(G.nx, G.ny))); cv.width = Math.round(G.nx * sc); cv.height = Math.round(G.ny * sc); const c = cv.getContext('2d');
    const dmax = Math.max(1, ...V.Z.map(z => z.next ? z.next.q : 0));
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const r = V.zl[j * G.nx + i]; if (r < 0) continue; const z = V.Z[r]; const col = byDate ? (z.next ? palAt('ryb', z.next.q / dmax) : [200, 200, 200]) : !z.next ? [200, 200, 200] : zoneCol(V, depthRank(V, r)); c.fillStyle = 'rgb(' + col.join(',') + ')'; c.fillRect(Math.floor(i * sc), Math.floor(j * sc), Math.ceil(sc) + 1, Math.ceil(sc) + 1); }
    clipTo(c, p => { const l = H().local(p, G.o); return [(l[0] - G.x0) / G.cell * sc, (G.y1 - l[1]) / G.cell * sc]; }); return { cv, bounds: [[G.sw[0], G.sw[1]], [G.ne[0], G.ne[1]]] }; }
  const depthRank = (V, r) => { const o = V.Z.map(z => z.depth).slice().sort((a, b) => a - b); return Math.max(0, o.indexOf(V.Z[r].depth)) + (o.filter(x => x === V.Z[r].depth).length > 1 ? 0 : 0); };
  function canvasDEM(kind) { const E2 = P.ero, D = E2.D, cv = document.createElement('canvas'), sc = Math.max(1, Math.min(6, 1400 / Math.max(D.W, D.H))); cv.width = D.W * sc; cv.height = D.H * sc; const c = cv.getContext('2d'), im = c.createImageData(D.W, D.H);
    for (let i = 0; i < D.W * D.H; i++) { if (!E2.ins[i]) continue; let col; if (kind === 'gully') { const g = E2.gi[i]; col = g >= 1 ? [215, 48, 39] : g >= 0.5 ? [252, 141, 89] : g >= 0.25 ? [254, 224, 139] : [26, 152, 80]; } else { const v = E2.loss[i]; col = !isFinite(v) ? [200, 200, 200] : v < 2 ? [26, 152, 80] : v < 5 ? [166, 217, 106] : v < 10 ? [254, 224, 139] : v < 20 ? [252, 141, 89] : [215, 48, 39]; } im.data.set([col[0], col[1], col[2], 215], i * 4); }
    const t = document.createElement('canvas'); t.width = D.W; t.height = D.H; t.getContext('2d').putImageData(im, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(t, 0, 0, D.W * sc, D.H * sc);
    if (kind === 'gully') E2.lines.forEach(l => { const path = () => { c.beginPath(); l.cells.forEach((q, k) => { const x = ((q % D.W) + 0.5) * sc, y = (((q / D.W) | 0) + 0.5) * sc; k ? c.lineTo(x, y) : c.moveTo(x, y); }); }; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = Math.max(4, sc * 1.6); c.setLineDash([]); path(); c.stroke();
      c.strokeStyle = l.seen || l.s2seen ? '#4A0072' : '#8B0000'; c.lineWidth = Math.max(2, sc * 0.9); c.setLineDash(l.seen || l.s2seen ? [] : [6, 3]); path(); c.stroke(); c.setLineDash([]); });
    clipTo(c, p => { const q = D.px(p[0], p[1]); return [q[0] * sc, q[1] * sc]; }); return { cv, bounds: D.bounds }; }
  function clipTo(c, P2) { c.globalCompositeOperation = 'destination-in'; c.beginPath(); F().pts.forEach((p, i) => { const q = P2(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over'; }
  const MONV = { mchange: 1, mtrend: 1, mstab: 1, mzone: 1 };
  const GEO = v => typeof FieldGeo !== 'undefined' && FieldGeo.VIEWS[v];
  function picture(view) { if (GEO(view)) { const p = FieldGeo.picture(view); return p; } if (MONV[view]) return FieldMon.picture(view); if ((view === 'vri' || view === 'vridate') && P.vri) return canvasVRI(P.vri, view === 'vridate'); if ((view === 'gully' || view === 'rusle') && P.ero) return canvasDEM(view); return null; }
  function layer(view) { const pic = picture(view); return pic ? L.imageOverlay(pic.cv.toDataURL(), pic.bounds, { opacity: 0.85, interactive: false }) : null; }
  function has(view) { if (GEO(view)) return FieldGeo.has(view); if (MONV[view]) return FieldMon.has(view); return view === 'vri' || view === 'vridate' ? !!P.vri : (view === 'gully' || view === 'rusle') ? !!P.ero : false; }
  function at(view, lat, lon) {
    if (GEO(view)) return FieldGeo.at(view, lat, lon);
    if (MONV[view]) return FieldMon.at(view, lat, lon);
    if ((view === 'vri' || view === 'vridate') && P.vri) { const V = P.vri, G = V.G, l = H().local([lat, lon], G.o), i = Math.floor((l[0] - G.x0) / G.cell), j = Math.floor((G.y1 - l[1]) / G.cell); if (i < 0 || j < 0 || i >= G.nx || j >= G.ny) return ''; const r = V.zl[j * G.nx + i]; if (r < 0) return ''; const z = V.Z[r]; return 'zone ' + (r + 1) + ': next irrigation ' + (z.next ? z.next.date + ', ' + z.depth.toFixed(1) + ' mm net' : 'none in 60 days') + ' · ' + z.soil + ' · NDVI ' + (+z.ndvi).toFixed(2); }
    if (P.ero) { const D = P.ero.D, p = D.px(lat, lon), i = Math.floor(p[1]) * D.W + Math.floor(p[0]); if (p[0] < 0 || p[1] < 0 || p[0] >= D.W || p[1] >= D.H || !P.ero.ins[i]) return ''; const E2 = P.ero;
      return 'elevation ' + D.Z[i].toFixed(1) + ' m · slope ' + (E2.FL.S[i] * 100).toFixed(1) + ' % · upslope area ' + (E2.FL.A[i] / 1e4).toFixed(2) + ' ha · gully index ' + E2.gi[i].toFixed(2) + (E2.gi[i] >= 1 ? ' (gully likely)' : '') + ' · C ' + (isFinite(E2.Cf[i]) ? E2.Cf[i].toFixed(3) : '-') + ' · soil loss ' + (isFinite(E2.loss[i]) ? E2.loss[i].toFixed(1) : '-') + ' t/ha/yr'; }
    return '';
  }
  function legend(view) {
    if (GEO(view)) return FieldGeo.legend(view);
    if (MONV[view]) return FieldMon.legend(view);
    if (view === 'vri' && P.vri) { const V = P.vri; return '<div class="fmchip">Next irrigation of each zone · net mm</div><table>' + V.Z.map((z, i) => '<tr><td><i style="background:rgb(' + (z.next ? zoneCol(V, depthRank(V, i)) : [200, 200, 200]).join(',') + ')"></i></td><td>zone ' + (i + 1) + '</td><td><b>' + (z.next ? z.depth.toFixed(1) + ' mm' : 'none') + '</b></td><td>' + (z.next ? z.next.date.replace(/ \d{4}$/, '') : '–') + '</td><td>' + z.ha.toFixed(2) + ' ha</td></tr>').join('') + '</table><div class="fmmean">' + Math.round(V.gross).toLocaleString('en-US') + ' m³ pumped at the next irrigations</div>'; }
    if (view === 'vridate' && P.vri) { const V = P.vri; return '<div class="fmchip">Date of the next irrigation of each zone</div><table>' + V.Z.map((z, i) => '<tr><td><i style="background:rgb(' + (z.next ? palAt('ryb', z.next.q / Math.max(1, ...V.Z.map(x => x.next ? x.next.q : 0))) : [200, 200, 200]).join(',') + ')"></i></td><td>zone ' + (i + 1) + '</td><td><b>' + (z.next ? z.next.date : 'none in 60 days') + '</b></td><td>' + (z.next ? 'day ' + z.next.q : '') + '</td></tr>').join('') + '</table>'; }
    if (view === 'gully' && P.ero) return '<div class="fmchip">Ephemeral gully risk · S·A<sup>0.4</sup> / 0.025</div><table>' + [['#D73027', '≥ 1: gully likely'], ['#FC8D59', '0.5 to 1: moderate'], ['#FEE08B', '0.25 to 0.5: low'], ['#1A9850', '< 0.25: very low']].map(q => '<tr><td><i style="background:' + q[0] + '"></i></td><td>' + q[1] + '</td></tr>').join('') + '<tr><td><i style="background:#8B0000;height:3px"></i></td><td>predicted gully</td></tr><tr><td><i style="background:#4A0072;height:3px"></i></td><td>predicted and seen (photo or crop)</td></tr></table>';
    if (view === 'rusle' && P.ero) return '<div class="fmchip">Soil loss (RUSLE) · t/ha/yr</div><table>' + [['#1A9850', '< 2 (tolerable)'], ['#A6D96A', '2 to 5'], ['#FEE08B', '5 to 10'], ['#FC8D59', '10 to 20'], ['#D73027', '> 20']].map(q => '<tr><td><i style="background:' + q[0] + '"></i></td><td>' + q[1] + '</td></tr>').join('') + '</table><div class="fmmean">field mean ' + P.ero.meanLoss.toFixed(1) + ' t/ha/yr</div>';
    return '';
  }

  // ------------------------------------------------------------------ the panel
  function panel() {
    const el = document.getElementById('fmPrecRes'); if (!el) return; let h = '';
    if (P.vri) { const V = P.vri, B = V.B, MON = d => d;
      h += '<div class="fmzt"><b>Variable-rate irrigation, simulated zone by zone</b><div class="pnote">Zones: ' + esc(V.how) + '. Each zone runs the FAO-56 daily balance with its own soil and observed cover, the roots, trigger, crop and past irrigations of the SWAFL model (' + esc(B.crop) + ', ' + esc(B.method) + '), and the ' + esc(B.src) + ' from ' + esc(B.date0) + '.' + (B.note ? ' ' + esc(B.note) : '') + '</div>' +
        '<div class="fmrow"><label>Zones ' + (FieldMon.ts ? '(set in the season above)' : '<select id="fpNz">' + [3, 4, 5, 6, 7].map(n => '<option' + (n === P.nz ? ' selected' : '') + '>' + n + '</option>').join('') + '</select>') + '</label><label>Colours <select id="fpPal">' + [['spectral', 'Spectral (rainbow)'], ['turbo', 'Turbo'], ['ylgnbu', 'Yellow-green-blue'], ['blues', 'Blues'], ['viridis', 'Viridis'], ['ryb', 'Red to blue'], ['greens', 'Greens']].map(q => '<option value="' + q[0] + '"' + (q[0] === P.pal ? ' selected' : '') + '>' + q[1] + '</option>').join('') + '</select></label><label>Map <select id="fpVw"><option value="vri">depth of the next irrigation</option><option value="vridate">date of the next irrigation</option></select></label></div>' +
        '<table class="tbl fmtab"><tr><th></th><th>Zone</th><th>Soil (AWC)</th><th>Cover now</th><th>Water now</th><th>Next irrigation</th><th>In 60 days</th><th></th></tr>' + V.Z.map((z, i) => '<tr><td><i style="display:inline-block;width:14px;height:10px;border:1px solid #666;background:rgb(' + (z.next ? zoneCol(V, depthRank(V, i)) : [200, 200, 200]).join(',') + ')"></i></td><td>' + (i + 1) + '<br><small>' + z.ha.toFixed(2) + ' ha</small></td><td><small>' + esc(z.soil) + '<br>' + z.awc.toFixed(1) + ' mm/cm</small></td><td>NDVI ' + (+z.ndvi).toFixed(2) + (isFinite(z.ndmi) ? '<br><small>NDMI ' + (+z.ndmi).toFixed(2) + '</small>' : '') + '<br><small>Kc ' + (z.kcNow != null ? z.kcNow.toFixed(2) : '–') + '</small></td><td>' + Math.round((1 - z.dep0) * 100) + ' % left</td><td><b>' + (z.next ? z.next.date + '</b><br>' + z.depth.toFixed(1) + ' mm net, ' + (z.depth / V.Ea).toFixed(1) + ' gross' : 'none</b><br><small>crop cover under a fifth of the ground in the next 60 days</small>') + '</td><td>' + z.events.length + ' × · ' + Math.round(z.netSum) + ' mm</td><td><button class="btn" data-dz="' + i + ':-0.5">−</button><button class="btn" data-dz="' + i + ':0.5">+</button></td></tr>').join('') + '</table>' +
        '<div class="fmadv">' + esc(vriAdvice(V)) + '</div><div class="fmrow"><button class="btn" id="fpGJ">Prescription GeoJSON</button><button class="btn" id="fpCSV">Zones and dates CSV</button></div></div>'; }
    if (P.ero) { const E2 = P.ero, MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      h += '<div class="fmzt"><b>Ephemeral gullies and soil loss</b> <small>(terrain ' + E2.cell.toFixed(1) + ' m cells, zoom ' + E2.D.z + '; rain: ' + esc(E2.rainSrc) + '; soil: ' + esc(E2.soilSrc) + ')</small><table class="tbl fmtab">' +
        '<tr><td>Terrain of the field</td><td>relief ' + E2.relief.toFixed(1) + ' m · slope mean ' + E2.slopeMean.toFixed(1) + ' %, max ' + E2.slopeMax.toFixed(1) + ' %</td></tr>' +
        '<tr><td>Runoff of the rain</td><td>' + Math.round(E2.Qyear) + ' mm a year (curve number ' + E2.CNc + ' cropped, ' + E2.CNb + ' bare, soil group ' + E2.hsg + '); <b>' + E2.events.toFixed(1) + '</b> runoff events of 10 mm or more a year; largest rain ' + Math.round(E2.Pmax) + ' mm on ' + E2.maxDate + ' → ' + Math.round(E2.Qmax) + ' mm runoff</td></tr>' +
        '<tr><td>Gully risk</td><td><b>' + E2.hiPct.toFixed(1) + ' %</b> of the field above the threshold, ' + E2.modPct.toFixed(1) + ' % moderate</td></tr>' +
        '<tr><td>Predicted gullies</td><td><b>' + E2.lines.length + '</b>, ' + Math.round(E2.gLen) + ' m in all' + (E2.photo && !E2.photo.err ? '; ' + E2.seen + ' with a linear feature in the photo' : '') + (FieldMon.ts ? '; ' + E2.s2seen + ' with a weaker crop along them in Sentinel-2' : '') + '</td></tr>' +
        '<tr><td>Soil loss (RUSLE)</td><td><b>' + E2.meanLoss.toFixed(1) + ' t/ha/yr</b> mean, 10 % of the field above ' + E2.p90.toFixed(1) + ' · ' + Math.round(E2.total).toLocaleString('en-US') + ' t/yr from the field</td></tr>' +
        '<tr><td>Factors</td><td>R ' + Math.round(E2.Rf) + ' (rain ' + Math.round(E2.rain) + ' mm/yr) · K ' + E2.K.toFixed(3) + (E2.soil ? ' (' + esc(E2.soil.cls) + ')' : '') + ' · C month by month from ' + esc(E2.coverSrc) + ' · P <select id="fpP"><option value="1">1 (none)</option><option value="0.6">0.6 contour tillage</option><option value="0.3">0.3 contour strips</option><option value="0.15">0.15 terraces</option></select></td></tr></table>' +
        '<table class="tbl fmtab v7g"><tr><th>Month</th>' + MON.map(m => '<th>' + m + '</th>').join('') + '</tr><tr><td>Erosivity %</td>' + E2.Rm.map(v => '<td>' + Math.round(v / E2.Rf * 100) + '</td>').join('') + '</tr><tr><td>NDVI</td>' + E2.ndviM.map(v => '<td' + (v < 0.3 ? ' class="me"' : '') + '>' + v.toFixed(2) + '</td>').join('') + '</tr><tr><td>Runoff mm</td>' + E2.qm.map(v => '<td>' + v.toFixed(0) + '</td>').join('') + '</tr></table>' +
        '<div class="fmadv">' + esc(eroAdvice(E2)) + '</div><div class="fmrow"><button class="btn" id="fpG">Show gullies</button><button class="btn" id="fpR">Show soil loss</button><button class="btn" id="fpGJG">Gullies GeoJSON</button></div></div>'; }
    el.innerHTML = h;
    const $ = id => document.getElementById(id), redo = async () => { try { P.vri = await vri(); } catch (e) { UI.toast(e.message); } panel(); H().refresh(H().F.view === 'vridate' ? 'vridate' : 'vri'); };
    if (P.vri) { if ($('fpNz')) $('fpNz').onchange = e => { P.nz = +e.target.value; P.adj = {}; redo(); }; $('fpPal').onchange = e => { P.pal = e.target.value; panel(); H().refresh('vri'); }; $('fpVw').value = H().F.view === 'vridate' ? 'vridate' : 'vri'; $('fpVw').onchange = e => H().refresh(e.target.value);
      el.querySelectorAll('[data-dz]').forEach(b => b.onclick = () => { const [z, d] = b.dataset.dz.split(':'), k = P.vri.nz + ':' + z; P.adj[k] = Math.max(0, +(P.vri.Z[+z].depth + +d).toFixed(1)); redo(); });
      $('fpGJ').onclick = exportVRI; $('fpCSV').onclick = exportVRIcsv; }
    if (P.ero) { $('fpP').value = String(P.practice || 1); $('fpP').onchange = e => { P.practice = +e.target.value; for (let i = 0; i < P.ero.loss.length; i++) if (isFinite(P.ero.loss[i])) P.ero.loss[i] = P.ero.loss[i] / P.ero.Pf * P.practice; P.ero.meanLoss = P.ero.meanLoss / P.ero.Pf * P.practice; P.ero.total = P.ero.meanLoss * P.ero.A; P.ero.p90 = P.ero.p90 / P.ero.Pf * P.practice; P.ero.Pf = P.practice; panel(); H().refresh('rusle'); };
      $('fpG').onclick = () => H().refresh('gully'); $('fpR').onclick = () => H().refresh('rusle'); $('fpGJG').onclick = exportGullies; }
  }
  function vriAdvice(V) {
    const Z = V.Z.filter(z => z.next).sort((a, b) => a.next.q - b.next.q), t = [];
    if (!Z.length) return 'No zone reaches its trigger in the next 60 days with this weather.';
    const f = Z[0], l = Z[Z.length - 1]; t.push('Zone ' + (f.r + 1) + ' (' + f.soil.split(' → ').pop() + ', NDVI ' + (+f.ndvi).toFixed(2) + ') needs water first, on ' + f.next.date + ' (' + f.depth.toFixed(1) + ' mm net)' + (l !== f ? '; zone ' + (l.r + 1) + ' last, on ' + l.next.date + ' (' + l.depth.toFixed(1) + ' mm)' : '') + '.');
    if (V.B.simNext.length) t.push('The SWAFL model of the whole field irrigates ' + V.B.simNext[0][1] + ' mm on ' + V.B.simNext[0][0] + ': one uniform depth would pump ' + Math.round(V.uniGross).toLocaleString('en-US') + ' m³ against ' + Math.round(V.gross).toLocaleString('en-US') + ' m³ zone by zone.');
    t.push('Over the next 60 days the zones need ' + Math.round(V.seasonNet).toLocaleString('en-US') + ' m³ net in all.');
    return t.join(' ');
  }
  function eroAdvice(E2) {
    const t = [], MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (E2.win.length) t.push('The risk window is ' + E2.win.slice(0, 3).map(w => MON[w.m] + ' (' + Math.round(w.R / E2.Rf * 100) + ' % of the erosive rain on NDVI ' + w.ndvi.toFixed(2) + ')').join(', ') + ': the soil is bare when the heavy rains come; a cover crop or residue then cuts the loss most.');
    if (E2.lines.length) t.push(E2.lines.length + ' ephemeral gull' + (E2.lines.length === 1 ? 'y' : 'ies') + ' (' + Math.round(E2.gLen) + ' m): the largest rain of the record (' + Math.round(E2.Pmax) + ' mm, ' + E2.maxDate + ') sends about ' + Math.round(Math.max(...E2.lines.map(l => l.vEnd))).toLocaleString('en-US') + ' m³ of runoff down the biggest one. Grass these thalwegs as waterways, and do not run furrows or tramlines down them.');
    else t.push('No flow line passes the gully threshold inside the field.');
    t.push(E2.meanLoss > 10 ? 'The soil loss is high (' + E2.meanLoss.toFixed(1) + ' t/ha/yr): keep the soil covered in the risk window, till across the slope, and avoid surface irrigation on the steep parts.' : E2.meanLoss > 2 ? 'The soil loss is above the tolerable 2 t/ha/yr on part of the field: residue and contour tillage bring it down.' : 'The soil loss is within the tolerable 2 t/ha/yr.');
    if (E2.events >= 1) t.push(E2.events.toFixed(1) + ' runoff events of 10 mm or more a year: ' + (E2.hsg === 'C' || E2.hsg === 'D' ? 'this slowly draining soil sheds water quickly.' : 'keep the infiltration up with organic matter and no compaction.'));
    return t.join(' ');
  }
  // ------------------------------------------------------------------ exports
  function exportVRI() { const V = P.vri; if (!V) return; const G = V.G, feats = [];
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const r = V.zl[j * G.nx + i]; if (r < 0) continue; const z = V.Z[r], o = G.o, x0 = G.x0 + i * G.cell, y1 = G.y1 - j * G.cell, ring = [[x0, y1], [x0 + G.cell, y1], [x0 + G.cell, y1 - G.cell], [x0, y1 - G.cell], [x0, y1]].map(q => { const ll = H().unlocal(q, o); return [+ll[1].toFixed(7), +ll[0].toFixed(7)]; });
      feats.push({ type: 'Feature', properties: { zone: r + 1, date: z.next ? z.next.date : null, rate_mm: +z.depth.toFixed(1), gross_mm: +(z.depth / V.Ea).toFixed(1), rate_m3_ha: +(z.depth * 10).toFixed(1), awc_mm_cm: z.awc, ndvi: +(+z.ndvi).toFixed(3) }, geometry: { type: 'Polygon', coordinates: [ring] } }); }
    UI.saveFile('SWAFL_VRI_prescription_' + new Date().toISOString().slice(0, 10) + '.geojson', JSON.stringify({ type: 'FeatureCollection', name: 'SWAFL variable-rate irrigation', crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } }, properties: { author: F().author, zones: V.how, weather: V.B.src, efficiency: V.Ea, cell_m: G.cell }, features: feats }), false, 'application/geo+json'); }
  function exportVRIcsv() { const V = P.vri; if (!V) return; let t = 'zone,area_ha,soil,awc_mm_cm,ndvi,ndmi,kc_now,water_left_pct,next_date,net_mm,gross_mm,irrigations_60d,net_60d_mm\n' + V.Z.map((z, i) => [i + 1, z.ha.toFixed(3), '"' + z.soil + '"', z.awc, (+z.ndvi).toFixed(3), isFinite(z.ndmi) ? (+z.ndmi).toFixed(3) : '', z.kcNow != null ? z.kcNow.toFixed(2) : '', Math.round((1 - z.dep0) * 100), z.next ? z.next.date : '', z.depth.toFixed(1), (z.depth / V.Ea).toFixed(1), z.events.length, Math.round(z.netSum)].join(',')).join('\n') + '\n\nzone,date,net_mm\n';
    V.Z.forEach((z, i) => z.events.forEach(e => { t += (i + 1) + ',' + e.date + ',' + e.net.toFixed(1) + '\n'; })); UI.saveFile('SWAFL_VRI_zones_' + new Date().toISOString().slice(0, 10) + '.csv', t, false, 'text/csv'); }
  function exportGullies() { const E2 = P.ero; if (!E2) return; const D = E2.D; UI.saveFile('SWAFL_gullies_' + new Date().toISOString().slice(0, 10) + '.geojson', JSON.stringify({ type: 'FeatureCollection', features: E2.lines.map((l, k) => ({ type: 'Feature', properties: { id: k + 1, length_m: Math.round(l.len), upslope_ha: +(l.A / 1e4).toFixed(2), mean_slope_pct: +(l.S * 100).toFixed(1), runoff_largest_rain_m3: Math.round(l.vEnd), seen_in_photo: !!l.seen, weaker_crop_sentinel2: !!l.s2seen }, geometry: { type: 'LineString', coordinates: l.cells.map(q => { const ll = D.ll((q % D.W) + 0.5, ((q / D.W) | 0) + 0.5); return [+ll[1].toFixed(7), +ll[0].toFixed(7)]; }) } })) }), false, 'application/geo+json'); }

  async function runVRI() { const st = document.getElementById('fmPrecSt'); try { P.adj = {}; P.vri = await vri(st); st.textContent = 'Variable-rate irrigation simulated for ' + P.vri.nz + ' zones.'; panel(); H().refresh('vri'); } catch (e) { st.innerHTML = '<b style="color:#B01E14">' + esc(e.message) + '</b>'; } }
  async function runEro() { const st = document.getElementById('fmPrecSt'); try { await erosion(st); st.textContent = 'Terrain, runoff, gullies and soil loss computed.'; panel(); H().refresh('gully'); } catch (e) { st.innerHTML = '<b style="color:#B01E14">' + esc(/Failed to fetch|NetworkError/i.test(e.message) ? 'no internet connection' : e.message) + '</b>'; } }
  return { _k: { dem, smooth, fill, flow }, runVRI, runEro, panel, layer, picture, has, at, legend, reset: () => { P.vri = null; P.ero = null; P.adj = {}; if (typeof FieldGeo !== 'undefined') FieldGeo.reset(); }, _P: P, _vri: vri, _ero: erosion };
})();
