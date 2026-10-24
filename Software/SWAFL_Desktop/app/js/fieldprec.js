/* Precision maps of the demarcated field.
   1. Variable-rate irrigation (VRI): the net depth of the farm's irrigation from the SWAFL simulation (the design in use, its
      trigger and roots), shared out over the field by the crop need read from the vegetation index (basal crop coefficient from
      NDVI) and by the canopy water status (NDWI): stronger or drier parts get more water, weak parts and non-crop ground
      (water, buildings, roads) less or none. The depths are grouped into management zones that the farmer can edit; the
      prescription exports as GeoJSON and CSV for a VRI controller.
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
  const rad = Math.PI / 180, P = { vri: null, ero: null, pal: 'blues', nz: 5, adj: {} };
  const H = () => FieldMap._h, F = () => FieldMap._h.F;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PAL = { blues: [[247, 251, 255], [198, 219, 239], [107, 174, 214], [33, 113, 181], [8, 48, 107]], viridis: [[253, 231, 37], [94, 201, 98], [33, 145, 140], [59, 82, 139], [68, 1, 84]], ryb: [[215, 48, 39], [252, 141, 89], [254, 224, 144], [145, 191, 219], [69, 117, 180]], greens: [[247, 252, 245], [199, 233, 192], [116, 196, 118], [35, 139, 69], [0, 68, 27]] };
  const palAt = (name, t) => { const A = PAL[name] || PAL.blues; t = Math.max(0, Math.min(1, t)) * (A.length - 1); const i = Math.min(A.length - 2, Math.floor(t)), f = t - i; return A[i].map((c, q) => Math.round(c + (A[i + 1][q] - c) * f)); };

  // ------------------------------------------------------------------ 1. variable-rate irrigation
  function simBase() {
    try { return E.json("(function(){var S=seasonSim(),N=window.__DSSNOW||null,m=state.method,Ea=null;try{Ea=m==='M01_Overhead'?spRun().Ea:/Drip/.test(m)?drRun().Ea:sidRun().Ea}catch(e){}var awc=AWC[state.soil]||1.5;return {Zn:awc*S.Rmax*S.fTrig,awc:awc,rd:S.Rmax,fT:S.fTrig,Ea:Ea||(m==='M01_Overhead'?0.75:/Drip/.test(m)?0.9:0.6),method:(METHODS.find(function(q){return q.k===m})||{}).label||m,crop:(CROPS[state.crop]||{}).label||state.crop,next:N&&N.next,net:N&&N.net,soil:DATA.soil_labels[state.soil]}})()"); } catch (e) { return null; }
  }
  function vri(opt) {
    const Fm = F(), R = Fm.res; if (!R) throw new Error('compute the indices of the field first');
    const B = simBase(); if (!B) throw new Error('the simulation is not ready');
    opt = Object.assign({ base: B.net || B.Zn, lo: 0.5, hi: 1.5, nz: P.nz }, opt || {});
    const G = R.G, N = G.nx * G.ny, keys = R.keys, vegK = keys.includes('NDVI') ? 'NDVI' : keys.includes('VARI') ? 'VARI' : keys[0], watK = keys.includes('NDWI') ? 'NDWI' : null;
    const veg = R.vals[keys.indexOf(vegK)], wat = watK ? R.vals[keys.indexOf(watK)] : null;
    const ndvi = v => vegK === 'NDVI' ? v : vegK === 'VARI' ? 0.15 + (v + 0.1) / 0.6 * 0.7 : v;      // VARI to an NDVI scale
    const kcb = v => Math.max(0.15, Math.min(1.2, 0.15 + (ndvi(v) - 0.15) / 0.7 * 1.0));             // basal crop coefficient from NDVI
    let sK = 0, n = 0, sW = 0, nW = 0; const wl = []; for (let i = 0; i < N; i++) if (isFinite(veg[i])) { sK += kcb(veg[i]); n++; if (wat && isFinite(wat[i])) { sW += wat[i]; nW++; wl.push(wat[i]); } }
    if (!n) throw new Error('no value of the index inside the field');
    const kM = sK / n, wM = nW ? sW / nW : 0, wSd = nW ? Math.sqrt(wl.reduce((a, v) => a + (v - wM) ** 2, 0) / nW) || 0.05 : 0.05;
    const cover = coverMask(G), dep = new Float32Array(N).fill(NaN);
    for (let i = 0; i < N; i++) { if (!isFinite(veg[i])) continue; if (cover && cover[i]) { dep[i] = 0; continue; }
      let f = kcb(veg[i]) / kM; if (wat && isFinite(wat[i])) f *= 1 + 0.35 * Math.max(-1.5, Math.min(1.5, (wM - wat[i]) / (2 * wSd)));
      dep[i] = opt.base * Math.max(opt.lo, Math.min(opt.hi, f)); }
    // zones: equal-count classes of the depth, then each zone gets its mean depth rounded to 0.5 mm (editable)
    const v = Array.from(dep).filter(x => isFinite(x) && x > 0).sort((a, b) => a - b), nz = Math.max(2, Math.min(7, opt.nz)), br = []; for (let z = 1; z < nz; z++) br.push(v[Math.floor(z / nz * (v.length - 1))]);
    const zone = new Int8Array(N).fill(-1), Z = Array.from({ length: nz }, () => ({ n: 0, s: 0 })); let off = 0;
    for (let i = 0; i < N; i++) { const d = dep[i]; if (!isFinite(d)) continue; if (d === 0) { zone[i] = nz; off++; continue; } let z = 0; while (z < br.length && d > br[z]) z++; zone[i] = z; Z[z].n++; Z[z].s += d; }
    const A = H().areaM2(Fm.pts), cells = v.length + off, zs = Z.map((q, z) => { const key = nz + ':' + z, mean = q.n ? q.s / q.n : 0, depth = P.adj[key] != null ? P.adj[key] : Math.round(mean * 2) / 2, ha = q.n / cells * A / 1e4; return { z, n: q.n, mean, depth, ha, pct: q.n / cells * 100 }; });
    const offHa = off / cells * A / 1e4, Ea = Math.max(0.3, B.Ea || 0.75), net = zs.reduce((a, q) => a + q.depth * q.ha * 10, 0), uni = opt.base * (A / 1e4 - offHa) * 10;
    return { G, dep, zone, zs, nz, offHa, base: opt.base, B, opt, vegK, watK, net, gross: net / Ea, uni, uniGross: uni / Ea, Ea, A };
  }
  function coverMask(G) {   // cells that are water, buildings or roads in the land cover read from the photo
    const cv = F().cv; if (!cv || !cv.cls) return null; const m = new Uint8Array(G.nx * G.ny);
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const ll = G.ll(i, j), k = cv.clsAt(ll[0], ll[1]); if (k === 3 || k === 4) m[j * G.nx + i] = 1; }
    return m;
  }
  const zoneCol = (V, z) => z >= V.nz ? [190, 190, 190] : palAt(P.pal, V.nz > 1 ? z / (V.nz - 1) : 0.5);

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
    const Fm = F(), h = H(); if (Fm.pts.length < 3) throw new Error('demarcate the field first');
    const lats = Fm.pts.map(p => p[0]), lons = Fm.pts.map(p => p[1]), c0 = h.centroid(Fm.pts), bufLat = 250 / 110540, bufLon = 250 / (111320 * Math.cos(c0[0] * rad));
    st && (st.textContent = 'Reading the terrain (open elevation tiles)...');
    const D = await dem(Math.min(...lats) - bufLat, Math.min(...lons) - bufLon, Math.max(...lats) + bufLat, Math.max(...lons) + bufLon), cell = D.mpp;
    st && (st.textContent = 'Terrain analysis: smoothing, filling sinks, flow directions and upslope area of ' + (D.W * D.H).toLocaleString('en-US') + ' cells...'); await new Promise(r => setTimeout(r, 20));
    const Zs = smooth(D.Z, D.W, D.H), Zf = fill(Zs, D.W, D.H), FL = flow(Zf, D.W, D.H, cell), N = D.W * D.H, ins = new Uint8Array(N);
    for (let y = 0; y < D.H; y++) for (let x = 0; x < D.W; x++) { const ll = D.ll(x + 0.5, y + 0.5); if (h.inside(ll[0], ll[1], Fm.pts)) ins[y * D.W + x] = 1; }
    // the topographic threshold of ephemeral gullies in cultivated fields: S >= 0.025 A^-0.4 (A in ha)
    const gi = new Float32Array(N); for (let i = 0; i < N; i++) gi[i] = FL.S[i] * Math.pow(FL.A[i] / 1e4, 0.4) / 0.025;
    // channels: from every cell where the threshold is passed (with at least 0.1 ha upslope), down the flow lines, inside the field
    const onG = new Uint8Array(N); for (let i = 0; i < N; i++) if (ins[i] && gi[i] >= 1 && FL.A[i] >= 1000) { let j = i, k = 0; while (j >= 0 && k++ < 2000 && ins[j] && !onG[j]) { onG[j] = 1; j = FL.dir[j]; } }
    // gullies: connected runs of channel cells, followed from their heads
    const lines = [], used = new Uint8Array(N);
    const heads = []; for (let i = 0; i < N; i++) if (onG[i]) { let up = false; const x = i % D.W, y = (i / D.W) | 0; for (let dy = -1; dy <= 1 && !up; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= D.W || yy >= D.H) continue; const j = yy * D.W + xx; if (onG[j] && FL.dir[j] === i) { up = true; break; } } if (!up) heads.push(i); }
    heads.forEach(hd => { const pts = []; let j = hd, len = 0, k = 0; while (j >= 0 && onG[j] && k++ < 3000) { pts.push(j); if (used[j]) break; used[j] = 1; const nj = FL.dir[j]; if (nj >= 0) len += cell * Math.hypot((nj % D.W) - (j % D.W), ((nj / D.W) | 0) - ((j / D.W) | 0)); j = nj; } if (len >= 3 * cell) lines.push({ cells: pts, len, A: FL.A[pts[pts.length - 1]], S: pts.reduce((a, q) => a + FL.S[q], 0) / pts.length }); });
    // the photo: linear features along the predicted gullies
    let photo = null; try { st && (st.textContent = 'Searching the satellite photo for linear erosion features (Hessian ridge and valley filter)...'); const M = await FieldSite.mosaic(D.bounds[0][0], D.bounds[0][1], D.bounds[1][0], D.bounds[1][1], 1400, 18); const Lm = lineness(M.img, M.W, M.H);
      let mean = 0, n = 0; for (let i = 0; i < Lm.length; i += 7) { mean += Lm[i]; n++; } mean /= n || 1; let sd = 0; for (let i = 0; i < Lm.length; i += 7) sd += (Lm[i] - mean) ** 2; sd = Math.sqrt(sd / (n || 1)) || 1e-6;
      lines.forEach(l => { let hit = 0; l.cells.forEach(q => { const ll = D.ll((q % D.W) + 0.5, ((q / D.W) | 0) + 0.5), p = M.px(ll[0], ll[1]), r2 = Math.max(2, Math.round(cell / M.mpp)); let best = 0; for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) { const xx = Math.round(p[0]) + dx, yy = Math.round(p[1]) + dy; if (xx < 0 || yy < 0 || xx >= M.W || yy >= M.H) continue; best = Math.max(best, Lm[yy * M.W + xx]); } if ((best - mean) / sd > 2) hit++; }); l.photo = hit / l.cells.length; l.seen = l.photo >= 0.4; });
      photo = { mpp: M.mpp, z: M.z }; } catch (e) { photo = { err: e.message }; }
    // RUSLE soil loss
    let rain = 600, soil = null, ndviOK = false; try { rain = E.json("(function(){var w=window.WXD&&WXD.on?WXD:null;return w?w.Pmean:model(VFF_VALUES[state.vffIdx],RAIN_VALUES[state.rainIdx]).rain})()") || rain; } catch (e) {}
    if (Fm.site && Fm.site.soil) soil = Fm.site.soil; else { try { const t = E.json('DATA.texture[state.soil]'); soil = { sand: t.sand, silt: t.silt, clay: t.clay, soc: 12, cls: E.json('DATA.soil_labels[state.soil]').toLowerCase() }; } catch (e) {} }
    const Rf = rain <= 850 ? 0.0483 * Math.pow(rain, 1.61) : 587.8 - 1.219 * rain + 0.004105 * rain * rain;
    const K = soil ? epicK(soil.sand, soil.silt, soil.clay, (soil.soc || 12) / 10 * 0.1) : 0.03;
    const Pf = P.practice || 1, loss = new Float32Array(N).fill(NaN), Cf = new Float32Array(N).fill(NaN);
    for (let i = 0; i < N; i++) { if (!ins[i]) continue; const ll = D.ll((i % D.W) + 0.5, ((i / D.W) | 0) + 0.5); let nd = NaN; if (Fm.res) { const k2 = Fm.res.keys.includes('NDVI') ? 'NDVI' : Fm.res.keys.includes('VARI') ? 'VARI' : null; if (k2) { nd = h.valueAt(k2, ll[0], ll[1]); if (k2 === 'VARI' && isFinite(nd)) nd = 0.15 + (nd + 0.1) / 0.6 * 0.7; } }
      const C = isFinite(nd) ? Math.max(0.001, Math.min(1, Math.exp(-2 * nd / Math.max(0.05, 1 - nd)))) : 0.35; if (isFinite(nd)) ndviOK = true;
      const As = FL.A[i] / cell, sb = Math.sin(Math.atan(FL.S[i])), LS = Math.pow(As / 22.13, 0.4) * Math.pow(sb / 0.0896, 1.3); Cf[i] = C; loss[i] = Rf * K * LS * C * Pf; }
    const inside = []; for (let i = 0; i < N; i++) if (ins[i]) inside.push(i);
    const lv = inside.map(i => loss[i]).filter(isFinite).sort((a, b) => a - b), A = h.areaM2(Fm.pts) / 1e4, meanLoss = lv.reduce((a, b) => a + b, 0) / (lv.length || 1);
    const hi = inside.filter(i => gi[i] >= 1).length, mod = inside.filter(i => gi[i] >= 0.5 && gi[i] < 1).length;
    const zIn = inside.map(i => D.Z[i]), slopes = inside.map(i => FL.S[i] * 100).sort((a, b) => a - b);
    P.ero = { D, FL, gi, ins, lines, loss, Cf, photo, rain, Rf, K, soil, Pf, ndviOK, A, meanLoss, total: meanLoss * A, p90: lv[Math.floor(lv.length * 0.9)] || 0, hiPct: hi / inside.length * 100, modPct: mod / inside.length * 100,
      relief: Math.max(...zIn) - Math.min(...zIn), slopeMean: slopes.reduce((a, b) => a + b, 0) / (slopes.length || 1), slopeMax: slopes[slopes.length - 1] || 0, cell, gLen: lines.reduce((a, l) => a + l.len, 0), seen: lines.filter(l => l.seen).length };
    return P.ero;
  }
  function epicK(sa, si, cl, oc) {   // EPIC soil erodibility (Sharpley and Williams, 1990), t ha h / (ha MJ mm)
    const sn = 1 - sa / 100, fs = 0.2 + 0.3 * Math.exp(-0.0256 * sa * (1 - si / 100)), fcs = Math.pow(si / Math.max(1, cl + si), 0.3), fo = 1 - 0.25 * oc / (oc + Math.exp(3.72 - 2.95 * oc)), fh = 1 - 0.7 * sn / (sn + Math.exp(-5.51 + 22.9 * sn));
    return fs * fcs * fo * fh * 0.1317;
  }

  // ------------------------------------------------------------------ pictures of the maps (canvas in the grid of each map, cut to the field)
  function canvasVRI(V) { const G = V.G, cv = document.createElement('canvas'), sc = Math.max(1, Math.min(24, 1400 / Math.max(G.nx, G.ny))); cv.width = Math.round(G.nx * sc); cv.height = Math.round(G.ny * sc); const c = cv.getContext('2d');
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const z = V.zone[j * G.nx + i]; if (z < 0) continue; const col = zoneCol(V, z); c.fillStyle = 'rgb(' + col.join(',') + ')'; c.fillRect(Math.floor(i * sc), Math.floor(j * sc), Math.ceil(sc) + 1, Math.ceil(sc) + 1); }
    clipTo(c, p => { const l = H().local(p, G.o); return [(l[0] - G.x0) / G.cell * sc, (G.y1 - l[1]) / G.cell * sc]; }); return { cv, bounds: [[G.sw[0], G.sw[1]], [G.ne[0], G.ne[1]]] }; }
  function canvasDEM(kind) { const E2 = P.ero, D = E2.D, cv = document.createElement('canvas'), sc = Math.max(1, Math.min(6, 1400 / Math.max(D.W, D.H))); cv.width = D.W * sc; cv.height = D.H * sc; const c = cv.getContext('2d'), im = c.createImageData(D.W, D.H);
    for (let i = 0; i < D.W * D.H; i++) { if (!E2.ins[i]) continue; let col; if (kind === 'gully') { const g = E2.gi[i]; col = g >= 1 ? [215, 48, 39] : g >= 0.5 ? [252, 141, 89] : g >= 0.25 ? [254, 224, 139] : [26, 152, 80]; } else { const v = E2.loss[i]; col = !isFinite(v) ? [200, 200, 200] : v < 2 ? [26, 152, 80] : v < 5 ? [166, 217, 106] : v < 10 ? [254, 224, 139] : v < 20 ? [252, 141, 89] : [215, 48, 39]; } im.data.set([col[0], col[1], col[2], 215], i * 4); }
    const t = document.createElement('canvas'); t.width = D.W; t.height = D.H; t.getContext('2d').putImageData(im, 0, 0); c.imageSmoothingEnabled = true; c.drawImage(t, 0, 0, D.W * sc, D.H * sc);
    if (kind === 'gully') E2.lines.forEach(l => { c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = Math.max(4, sc * 1.6); c.setLineDash([]); c.beginPath(); l.cells.forEach((q, k) => { const x = ((q % D.W) + 0.5) * sc, y = (((q / D.W) | 0) + 0.5) * sc; k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
      c.strokeStyle = l.seen ? '#4A0072' : '#8B0000'; c.lineWidth = Math.max(2, sc * 0.9); c.setLineDash(l.seen ? [] : [6, 3]); c.beginPath(); l.cells.forEach((q, k) => { const x = ((q % D.W) + 0.5) * sc, y = (((q / D.W) | 0) + 0.5) * sc; k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.setLineDash([]); });
    clipTo(c, p => { const q = D.px(p[0], p[1]); return [q[0] * sc, q[1] * sc]; }, kind === 'gully'); return { cv, bounds: D.bounds }; }
  function clipTo(c, P2, keepLines) { c.globalCompositeOperation = 'destination-in'; c.beginPath(); F().pts.forEach((p, i) => { const q = P2(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over'; }
  function picture(view) { if (view === 'vri' && P.vri) return canvasVRI(P.vri); if ((view === 'gully' || view === 'rusle') && P.ero) return canvasDEM(view); return null; }
  function layer(view) { const pic = picture(view); return pic ? L.imageOverlay(pic.cv.toDataURL(), pic.bounds, { opacity: 0.85, interactive: false }) : null; }
  function has(view) { return view === 'vri' ? !!P.vri : (view === 'gully' || view === 'rusle') ? !!P.ero : false; }
  function at(view, lat, lon) {
    if (view === 'vri' && P.vri) { const V = P.vri, G = V.G, l = H().local([lat, lon], G.o), i = Math.floor((l[0] - G.x0) / G.cell), j = Math.floor((G.y1 - l[1]) / G.cell); if (i < 0 || j < 0 || i >= G.nx || j >= G.ny) return ''; const z = V.zone[j * G.nx + i]; if (z < 0) return ''; return z >= V.nz ? 'no irrigation (water, building or road)' : 'VRI zone ' + (z + 1) + ': ' + V.zs[z].depth.toFixed(1) + ' mm net'; }
    if (P.ero) { const D = P.ero.D, p = D.px(lat, lon), i = Math.floor(p[1]) * D.W + Math.floor(p[0]); if (p[0] < 0 || p[1] < 0 || p[0] >= D.W || p[1] >= D.H || !P.ero.ins[i]) return ''; const E2 = P.ero;
      return 'elevation ' + D.Z[i].toFixed(1) + ' m · slope ' + (E2.FL.S[i] * 100).toFixed(1) + ' % · upslope area ' + (E2.FL.A[i] / 1e4).toFixed(2) + ' ha · gully index ' + E2.gi[i].toFixed(2) + (E2.gi[i] >= 1 ? ' (gully likely)' : '') + ' · soil loss ' + (isFinite(E2.loss[i]) ? E2.loss[i].toFixed(1) : '-') + ' t/ha/yr'; }
    return '';
  }
  function legend(view) {
    if (view === 'vri' && P.vri) { const V = P.vri; return '<div class="fmchip">Variable-rate irrigation · ' + V.nz + ' zones · net mm</div><table>' + V.zs.map((z, i) => '<tr><td><i style="background:rgb(' + zoneCol(V, i).join(',') + ')"></i></td><td>zone ' + (i + 1) + '</td><td><b>' + z.depth.toFixed(1) + ' mm</b></td><td>' + z.ha.toFixed(2) + ' ha</td></tr>').join('') + (V.offHa > 0.001 ? '<tr><td><i style="background:#BEBEBE"></i></td><td>off</td><td>0 mm</td><td>' + V.offHa.toFixed(2) + ' ha</td></tr>' : '') + '</table><div class="fmmean">' + Math.round(V.gross * 1).toLocaleString('en-US') + ' m³ pumped against ' + Math.round(V.uniGross).toLocaleString('en-US') + ' m³ uniform</div>'; }
    if (view === 'gully' && P.ero) return '<div class="fmchip">Ephemeral gully risk · S·A<sup>0.4</sup> / 0.025</div><table>' + [['#D73027', '≥ 1: gully likely'], ['#FC8D59', '0.5 to 1: moderate'], ['#FEE08B', '0.25 to 0.5: low'], ['#1A9850', '< 0.25: very low']].map(q => '<tr><td><i style="background:' + q[0] + '"></i></td><td>' + q[1] + '</td></tr>').join('') + '<tr><td><i style="background:#8B0000;height:3px"></i></td><td>predicted gully</td></tr><tr><td><i style="background:#4A0072;height:3px"></i></td><td>predicted and seen in the photo</td></tr></table>';
    if (view === 'rusle' && P.ero) return '<div class="fmchip">Soil loss (RUSLE) · t/ha/yr</div><table>' + [['#1A9850', '< 2 (tolerable)'], ['#A6D96A', '2 to 5'], ['#FEE08B', '5 to 10'], ['#FC8D59', '10 to 20'], ['#D73027', '> 20']].map(q => '<tr><td><i style="background:' + q[0] + '"></i></td><td>' + q[1] + '</td></tr>').join('') + '</table><div class="fmmean">field mean ' + P.ero.meanLoss.toFixed(1) + ' t/ha/yr</div>';
    return '';
  }

  // ------------------------------------------------------------------ the panel
  function panel() {
    const el = document.getElementById('fmPrecRes'); if (!el) return; let h = '';
    if (P.vri) { const V = P.vri, B = V.B, sav = V.uniGross - V.gross;
      h += '<div class="fmzt"><b>Variable-rate irrigation map</b> <small>(from ' + esc(V.vegK) + (V.watK ? ' and ' + esc(V.watK) : '') + ' of ' + esc(F().res.date) + ' and the SWAFL simulation)</small>' +
        '<div class="fmrow"><label>Zones <select id="fpNz">' + [3, 4, 5, 6, 7].map(n => '<option' + (n === V.nz ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label><label>Colours <select id="fpPal">' + [['blues', 'Blues'], ['viridis', 'Viridis'], ['ryb', 'Red to blue'], ['greens', 'Greens']].map(q => '<option value="' + q[0] + '"' + (q[0] === P.pal ? ' selected' : '') + '>' + q[1] + '</option>').join('') + '</select></label>' +
        '</div><div class="fprow">Base net depth <input id="fpBase" type="number" step="0.5" min="1" value="' + V.base.toFixed(1) + '"> mm · range <input id="fpLo" type="number" step="5" value="' + Math.round(V.opt.lo * 100) + '"> to <input id="fpHi" type="number" step="5" value="' + Math.round(V.opt.hi * 100) + '"> % of it</div>' +
        '<table class="tbl fmtab"><tr><th></th><th>Zone</th><th>Area</th><th>Net depth</th><th>Volume</th><th></th></tr>' + V.zs.map((z, i) => '<tr><td><i style="display:inline-block;width:14px;height:10px;border:1px solid #666;background:rgb(' + zoneCol(V, i).join(',') + ')"></i></td><td>' + (i + 1) + (i === 0 ? ' least' : i === V.nz - 1 ? ' most' : '') + '</td><td>' + z.ha.toFixed(2) + ' ha (' + z.pct.toFixed(0) + ' %)</td><td><b>' + z.depth.toFixed(1) + ' mm</b></td><td>' + Math.round(z.depth * z.ha * 10).toLocaleString('en-US') + ' m³</td><td><button class="btn" data-dz="' + i + ':-0.5">−</button><button class="btn" data-dz="' + i + ':0.5">+</button></td></tr>').join('') +
        (V.offHa > 0.001 ? '<tr><td><i style="display:inline-block;width:14px;height:10px;background:#BEBEBE"></i></td><td>off</td><td>' + V.offHa.toFixed(2) + ' ha</td><td>0 mm</td><td>water, buildings, roads</td><td></td></tr>' : '') + '</table>' +
        '<div class="fmadv">Base: ' + V.base.toFixed(1) + ' mm net per irrigation (' + (B.net ? 'the design in use, ' + esc(B.method) : 'roots ' + Math.round(B.rd) + ' cm × ' + B.awc.toFixed(1) + ' mm/cm × trigger ' + B.fT.toFixed(2)) + '), application efficiency ' + Math.round(V.Ea * 100) + ' %' + (B.next ? ', next irrigation ' + esc(B.next) : '') + '. Per irrigation the map pumps <b>' + Math.round(V.gross).toLocaleString('en-US') + ' m³</b> against ' + Math.round(V.uniGross).toLocaleString('en-US') + ' m³ with one uniform depth: ' + (sav >= 0 ? 'saving ' : 'adding ') + Math.round(Math.abs(sav)).toLocaleString('en-US') + ' m³ (' + Math.abs(sav / Math.max(1, V.uniGross) * 100).toFixed(0) + ' %).</div>' +
        '<div class="fmrow"><button class="btn" id="fpGJ">Prescription GeoJSON</button><button class="btn" id="fpCSV">Zones CSV</button><button class="btn" id="fpShow">Show on the map</button></div></div>'; }
    if (P.ero) { const E2 = P.ero;
      h += '<div class="fmzt"><b>Ephemeral gullies and soil loss</b> <small>(terrain ' + E2.cell.toFixed(1) + ' m cells, zoom ' + E2.D.z + ')</small><table class="tbl fmtab">' +
        '<tr><td>Terrain of the field</td><td>relief ' + E2.relief.toFixed(1) + ' m · slope mean ' + E2.slopeMean.toFixed(1) + ' %, max ' + E2.slopeMax.toFixed(1) + ' %</td></tr>' +
        '<tr><td>Gully risk</td><td><b>' + E2.hiPct.toFixed(1) + ' %</b> of the field above the threshold, ' + E2.modPct.toFixed(1) + ' % moderate</td></tr>' +
        '<tr><td>Predicted gullies</td><td><b>' + E2.lines.length + '</b>, ' + Math.round(E2.gLen) + ' m in all' + (E2.photo && !E2.photo.err ? '; <b>' + E2.seen + '</b> with a linear feature in the photo' : E2.photo && E2.photo.err ? '; photo not read (' + esc(E2.photo.err) + ')' : '') + '</td></tr>' +
        '<tr><td>Soil loss (RUSLE)</td><td><b>' + E2.meanLoss.toFixed(1) + ' t/ha/yr</b> mean, 10 % of the field above ' + E2.p90.toFixed(1) + ' · ' + Math.round(E2.total).toLocaleString('en-US') + ' t/yr from the field</td></tr>' +
        '<tr><td>Factors</td><td>R ' + Math.round(E2.Rf) + ' (rain ' + Math.round(E2.rain) + ' mm) · K ' + E2.K.toFixed(3) + (E2.soil ? ' (' + esc(E2.soil.cls) + ')' : '') + ' · C from ' + (E2.ndviOK ? 'the vegetation index' : 'a default 0.35') + ' · P <select id="fpP"><option value="1">1 (none)</option><option value="0.6">0.6 contour tillage</option><option value="0.3">0.3 contour strips</option><option value="0.15">0.15 terraces</option></select></td></tr></table>' +
        '<div class="fmadv">' + esc(eroAdvice(E2)) + '</div><div class="fmrow"><button class="btn" id="fpG">Show gullies</button><button class="btn" id="fpR">Show soil loss</button><button class="btn" id="fpGJG">Gullies GeoJSON</button></div></div>'; }
    el.innerHTML = h;
    const $ = id => document.getElementById(id), redo = () => { try { P.vri = vri({ base: +$('fpBase').value || P.vri.base, lo: (+$('fpLo').value || 50) / 100, hi: (+$('fpHi').value || 150) / 100, nz: P.nz }); } catch (e) { UI.toast(e.message); } panel(); FieldMap._h.refresh('vri'); };
    if (P.vri) { $('fpNz').onchange = e => { P.nz = +e.target.value; P.adj = {}; redo(); }; $('fpPal').onchange = e => { P.pal = e.target.value; panel(); FieldMap._h.refresh('vri'); }; ['fpBase', 'fpLo', 'fpHi'].forEach(id => $(id).onchange = () => { P.adj = {}; redo(); });
      el.querySelectorAll('[data-dz]').forEach(b => b.onclick = () => { const [z, d] = b.dataset.dz.split(':'), k = P.vri.nz + ':' + z; P.adj[k] = Math.max(0, +(P.vri.zs[+z].depth + +d).toFixed(1)); redo(); });
      $('fpGJ').onclick = exportVRI; $('fpCSV').onclick = exportVRIcsv; $('fpShow').onclick = () => FieldMap._h.refresh('vri'); }
    if (P.ero) { $('fpP').value = String(P.practice || 1); $('fpP').onchange = async e => { P.practice = +e.target.value; const sc = P.ero.Rf * P.ero.K; for (let i = 0; i < P.ero.loss.length; i++) if (isFinite(P.ero.loss[i])) P.ero.loss[i] = P.ero.loss[i] / P.ero.Pf * P.practice; P.ero.meanLoss = P.ero.meanLoss / P.ero.Pf * P.practice; P.ero.total = P.ero.meanLoss * P.ero.A; P.ero.p90 = P.ero.p90 / P.ero.Pf * P.practice; P.ero.Pf = P.practice; panel(); FieldMap._h.refresh('rusle'); };
      $('fpG').onclick = () => FieldMap._h.refresh('gully'); $('fpR').onclick = () => FieldMap._h.refresh('rusle'); $('fpGJG').onclick = exportGullies; }
  }
  function eroAdvice(E2) {
    const t = [];
    if (E2.lines.length) t.push(E2.lines.length + ' ephemeral gull' + (E2.lines.length === 1 ? 'y is' : 'ies are') + ' likely along the drawn flow lines (' + Math.round(E2.gLen) + ' m): keep these thalwegs under a grassed waterway, leave crop residue on them, and do not run furrows or tramlines down the slope there.');
    else t.push('No flow line passes the gully threshold inside the field.');
    if (E2.meanLoss > 10) t.push('The soil loss is high (' + E2.meanLoss.toFixed(1) + ' t/ha/yr): keep the soil covered (mulch, cover crop), till across the slope, and avoid irrigating by surface systems on the steep parts.');
    else if (E2.meanLoss > 2) t.push('The soil loss is above the tolerable 2 t/ha/yr on part of the field: residue and contour tillage bring it down.');
    else t.push('The soil loss is within the tolerable 2 t/ha/yr.');
    if (E2.slopeMax > 3) t.push('Slopes reach ' + E2.slopeMax.toFixed(1) + ' %: prefer drip or low-rate sprinklers to furrows on the steeper parts.');
    return t.join(' ');
  }
  // ------------------------------------------------------------------ exports
  function exportVRI() { const V = P.vri; if (!V) return; const G = V.G, feats = [];
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const z = V.zone[j * G.nx + i]; if (z < 0) continue; const o = G.o, x0 = G.x0 + i * G.cell, y1 = G.y1 - j * G.cell, ring = [[x0, y1], [x0 + G.cell, y1], [x0 + G.cell, y1 - G.cell], [x0, y1 - G.cell], [x0, y1]].map(q => { const ll = H().unlocal(q, o); return [+ll[1].toFixed(7), +ll[0].toFixed(7)]; });
      const d = z >= V.nz ? 0 : V.zs[z].depth; feats.push({ type: 'Feature', properties: { zone: z >= V.nz ? 0 : z + 1, rate_mm: +d.toFixed(1), rate_m3_ha: +(d * 10).toFixed(1), gross_mm: +(d / V.Ea).toFixed(1) }, geometry: { type: 'Polygon', coordinates: [ring] } }); }
    UI.saveFile('SWAFL_VRI_prescription_' + new Date().toISOString().slice(0, 10) + '.geojson', JSON.stringify({ type: 'FeatureCollection', name: 'SWAFL variable-rate irrigation', crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } }, properties: { author: F().author, base_mm: V.base, efficiency: V.Ea, cell_m: G.cell }, features: feats }), false, 'application/geo+json'); }
  function exportVRIcsv() { const V = P.vri; if (!V) return; let t = 'zone,area_ha,share_pct,net_mm,gross_mm,volume_m3\n' + V.zs.map((z, i) => [i + 1, z.ha.toFixed(3), z.pct.toFixed(1), z.depth.toFixed(1), (z.depth / V.Ea).toFixed(1), Math.round(z.depth * z.ha * 10)].join(',')).join('\n') + '\n'; if (V.offHa > 0.001) t += 'off,' + V.offHa.toFixed(3) + ',,0,0,0\n'; t += '\nbase_net_mm,' + V.base.toFixed(1) + '\nefficiency,' + V.Ea.toFixed(2) + '\ntotal_gross_m3,' + Math.round(V.gross) + '\nuniform_gross_m3,' + Math.round(V.uniGross) + '\n'; UI.saveFile('SWAFL_VRI_zones_' + new Date().toISOString().slice(0, 10) + '.csv', t, false, 'text/csv'); }
  function exportGullies() { const E2 = P.ero; if (!E2) return; const D = E2.D; UI.saveFile('SWAFL_gullies_' + new Date().toISOString().slice(0, 10) + '.geojson', JSON.stringify({ type: 'FeatureCollection', features: E2.lines.map((l, k) => ({ type: 'Feature', properties: { id: k + 1, length_m: Math.round(l.len), upslope_ha: +(l.A / 1e4).toFixed(2), mean_slope_pct: +(l.S * 100).toFixed(1), seen_in_photo: !!l.seen }, geometry: { type: 'LineString', coordinates: l.cells.map(q => { const ll = D.ll((q % D.W) + 0.5, ((q / D.W) | 0) + 0.5); return [+ll[1].toFixed(7), +ll[0].toFixed(7)]; }) } })) }), false, 'application/geo+json'); }

  async function runVRI() { const st = document.getElementById('fmPrecSt'); try { P.adj = {}; P.vri = vri({ nz: P.nz }); st.textContent = 'Variable-rate map made from ' + P.vri.vegK + (P.vri.watK ? ' and ' + P.vri.watK : '') + ' and the simulated depth.'; panel(); FieldMap._h.refresh('vri'); } catch (e) { st.innerHTML = '<b style="color:#B01E14">' + esc(e.message) + '</b>'; } }
  async function runEro() { const st = document.getElementById('fmPrecSt'); try { await erosion(st); st.textContent = 'Terrain, gullies and soil loss computed.'; panel(); FieldMap._h.refresh('gully'); } catch (e) { st.innerHTML = '<b style="color:#B01E14">' + esc(/Failed to fetch|NetworkError/i.test(e.message) ? 'no internet connection' : e.message) + '</b>'; } }
  return { runVRI, runEro, panel, layer, picture, has, at, legend, reset: () => { P.vri = null; P.ero = null; P.adj = {}; }, _P: P, _vri: vri, _ero: erosion };
})();
