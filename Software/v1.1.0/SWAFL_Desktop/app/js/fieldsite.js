/* The real field, read from open data after it is demarcated on the map.
   1. Image analysis (computer vision) of the real satellite photo of the field (Esri World Imagery): every pixel is
      described by its colour and texture (excess green, VARI, brightness, saturation, blueness, local variation), the
      pixels are grouped by k-means clustering and each group is named by rules (dense or sparse vegetation, bare soil,
      water, buildings and roads, shadow); a 3 x 3 majority filter cleans the map. The visible-band vegetation indices
      VARI, GLI, ExG and NGRDI are computed from the same pixels.
   2. The site: water features around the field from OpenStreetMap (rivers, canals, streams, lakes, ponds, reservoirs,
      wells, boreholes, springs, through the Overpass API), possible water bodies seen in the photo around the field, the
      ground elevation (Copernicus 90 m DEM through the Open-Meteo elevation API) for the slope of the field and the lift
      from each source, and the soil texture of the field (ISRIC SoilGrids 250 m).
   3. Suggestions: where to take the water from, and which irrigation system suits the field, with the reasons. */
'use strict';
const FieldSite = (() => {
  const rad = Math.PI / 180, ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
  const CLS = [['Dense vegetation', '#1B7837'], ['Sparse vegetation', '#A6D96A'], ['Bare soil', '#C8A26B'], ['Water', '#2C7FB8'], ['Buildings, roads, hard surfaces', '#7B3294'], ['Shadow or very dark', '#3A3A3A']];
  let H = null;   // helpers of FieldMap
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------------ the satellite photo of an area (Web Mercator tiles)
  const mx = (lon, z) => (lon + 180) / 360 * 256 * 2 ** z, my = (lat, z) => (1 - Math.log(Math.tan(lat * rad) + 1 / Math.cos(lat * rad)) / Math.PI) / 2 * 256 * 2 ** z;
  const ilat = (y, z) => Math.atan(Math.sinh(Math.PI - 2 * Math.PI * y / (256 * 2 ** z))) / rad, ilon = (x, z) => x / (256 * 2 ** z) * 360 - 180;
  async function mosaic(s, w, n, e, maxPx, zmax) {
    let z = zmax || 19; while (z > 3 && (mx(e, z) - mx(w, z) > maxPx || my(s, z) - my(n, z) > maxPx)) z--;
    const x0 = Math.floor(mx(w, z)), y0 = Math.floor(my(n, z)), x1 = Math.ceil(mx(e, z)), y1 = Math.ceil(my(s, z)), W = x1 - x0, Hh = y1 - y0;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; const c = cv.getContext('2d', { willReadFrequently: true }); let ok = 0, tried = 0;
    const jobs = []; for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x1 - 1) / 256); tx++) for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y1 - 1) / 256); ty++) { tried++;
      jobs.push(new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; const t = setTimeout(res, 15000); im.onload = () => { clearTimeout(t); c.drawImage(im, tx * 256 - x0, ty * 256 - y0); ok++; res(); }; im.onerror = () => { clearTimeout(t); res(); }; im.src = ESRI + z + '/' + ty + '/' + tx; })); }
    await Promise.all(jobs);
    if (!ok) throw new Error('the satellite photo cannot be reached (no internet connection)');
    // tiles with no imagery ("map data not yet available": one flat colour) are left out; with too many, a coarser zoom is used
    let blank = 0; try { for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x1 - 1) / 256); tx++) for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y1 - 1) / 256); ty++) { const ax = Math.max(0, tx * 256 - x0), ay = Math.max(0, ty * 256 - y0), bw = Math.min(W, tx * 256 + 256 - x0) - ax, bh = Math.min(Hh, ty * 256 + 256 - y0) - ay; if (bw < 2 || bh < 2) continue;
      const d = c.getImageData(ax, ay, bw, bh).data; let s1 = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 7) { const v = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; s1 += v; s2 += v * v; n++; } if (n && Math.sqrt(Math.max(0, s2 / n - (s1 / n) ** 2)) < 2.5) { c.clearRect(ax, ay, bw, bh); blank++; } } } catch (e) {}
    if (blank > tried * 0.4 && z > 15) return mosaic(s, w, n, e, maxPx, z - 2);
    let img; try { img = c.getImageData(0, 0, W, Hh); } catch (e) { throw new Error('the satellite photo cannot be read (permission of the image server)'); }
    const mpp = 156543.03392 * Math.cos((s + n) / 2 * rad) / 2 ** z;
    return { cv, img, W, H: Hh, z, mpp, ok, tried, px: (lat, lon) => [mx(lon, z) - x0, my(lat, z) - y0], ll: (x, y) => [ilat(y + y0, z), ilon(x + x0, z)], bounds: [[ilat(y1, z), ilon(x0, z)], [ilat(y0, z), ilon(x1, z)]] };
  }

  // ------------------------------------------------------------------ computer vision: features, k-means, rules, majority filter
  function features(img, W, Hh) {
    const d = img.data, N = W * Hh, f = { L: new Float32Array(N), S: new Float32Array(N), exg: new Float32Array(N), vari: new Float32Array(N), blu: new Float32Array(N), tex: new Float32Array(N), gli: new Float32Array(N), ngrdi: new Float32Array(N), ok: new Uint8Array(N) };
    for (let i = 0; i < N; i++) { const R = d[i * 4] / 255, G = d[i * 4 + 1] / 255, B = d[i * 4 + 2] / 255, A = d[i * 4 + 3]; if (A < 200) continue; f.ok[i] = 1;
      const sum = R + G + B + 1e-6, mx2 = Math.max(R, G, B), mn = Math.min(R, G, B); f.L[i] = 0.299 * R + 0.587 * G + 0.114 * B; f.S[i] = mx2 > 0 ? (mx2 - mn) / mx2 : 0;
      f.exg[i] = (2 * G - R - B) / sum; const dv = G + R - B; f.vari[i] = Math.abs(dv) < 0.02 ? 0 : Math.max(-1, Math.min(1, (G - R) / dv)); f.blu[i] = B - (R + G) / 2;
      f.gli[i] = (2 * G - R - B) / (2 * G + R + B + 1e-6); f.ngrdi[i] = (G - R) / (G + R + 1e-6); }
    // texture: standard deviation of the brightness in a 5 x 5 window (integral images)
    const I = new Float64Array((W + 1) * (Hh + 1)), I2 = new Float64Array((W + 1) * (Hh + 1));
    for (let y = 0; y < Hh; y++) { let a = 0, b = 0; for (let x = 0; x < W; x++) { const v = f.L[y * W + x]; a += v; b += v * v; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + a; I2[(y + 1) * (W + 1) + x + 1] = I2[y * (W + 1) + x + 1] + b; } }
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const xa = Math.max(0, x - 2), xb = Math.min(W, x + 3), ya = Math.max(0, y - 2), yb = Math.min(Hh, y + 3), n = (xb - xa) * (yb - ya), at = (A2, yy, xx) => A2[yy * (W + 1) + xx];
      const s1 = at(I, yb, xb) - at(I, ya, xb) - at(I, yb, xa) + at(I, ya, xa), s2 = at(I2, yb, xb) - at(I2, ya, xb) - at(I2, yb, xa) + at(I2, ya, xa); f.tex[y * W + x] = Math.sqrt(Math.max(0, s2 / n - (s1 / n) ** 2)); }
    return f;
  }
  function kmeans(f, N, K, seed) {
    const keys = ['L', 'S', 'exg', 'vari', 'blu', 'tex'], idx = []; for (let i = 0; i < N; i++) if (f.ok[i]) idx.push(i);
    let s = seed || 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, step = Math.max(1, Math.floor(idx.length / 16000)), smp = idx.filter((_, j) => j % step === 0);
    const mu = keys.map(k => smp.reduce((a, i) => a + f[k][i], 0) / smp.length), sd = keys.map((k, q) => Math.sqrt(smp.reduce((a, i) => a + (f[k][i] - mu[q]) ** 2, 0) / smp.length) || 1);
    const vec = i => keys.map((k, q) => (f[k][i] - mu[q]) / sd[q]), X = smp.map(vec), d2 = (a, b) => { let t = 0; for (let q = 0; q < a.length; q++) t += (a[q] - b[q]) ** 2; return t; };
    const C = [X[Math.floor(rnd() * X.length)]]; while (C.length < K) { const D = X.map(x => Math.min(...C.map(c => d2(x, c)))), tot = D.reduce((a, b) => a + b, 0); let r = rnd() * tot, j = 0; while (j < D.length - 1 && (r -= D[j]) > 0) j++; C.push(X[j]); }
    for (let it = 0; it < 14; it++) { const sum = C.map(() => new Array(keys.length).fill(0)), cnt = new Array(K).fill(0);
      X.forEach(x => { let b = 0, bd = Infinity; C.forEach((c, j) => { const dd = d2(x, c); if (dd < bd) { bd = dd; b = j; } }); cnt[b]++; x.forEach((v, q) => { sum[b][q] += v; }); });
      C.forEach((c, j) => { if (cnt[j]) C[j] = sum[j].map(v => v / cnt[j]); }); }
    const raw = C.map(c => { const o = {}; keys.forEach((k, q) => { o[k] = c[q] * sd[q] + mu[q]; }); return o; });
    const lab = raw.map(nameCluster), out = new Int8Array(N).fill(-1);
    for (let i = 0; i < N; i++) { if (!f.ok[i]) continue; const x = vec(i); let b = 0, bd = Infinity; for (let j = 0; j < K; j++) { const dd = d2(x, C[j]); if (dd < bd) { bd = dd; b = j; } } out[i] = lab[b]; }
    return { cls: out, centres: raw, labels: lab };
  }
  function nameCluster(c) {   // the rules that name a group of pixels from its mean colour and texture
    if (c.L < 0.1) return 5;
    if (c.blu > 0.025 && c.exg < 0.03 && c.L < 0.55) return 3;
    if (c.L < 0.2 && c.exg < 0.02 && c.tex < 0.03 && c.blu > -0.035) return 3;
    if (c.exg > 0.085 || c.vari > 0.16) return 0;
    if (c.exg > 0.035 || c.vari > 0.05) return 1;
    if ((c.S < 0.13 && c.L > 0.45) || (c.tex > 0.075 && c.S < 0.2)) return 4;
    return 2;
  }
  function majority(cls, W, Hh) { const out = new Int8Array(cls.length); for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const o = y * W + x; if (cls[o] < 0) { out[o] = -1; continue; } const n = [0, 0, 0, 0, 0, 0]; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const v = cls[yy * W + xx]; if (v >= 0) n[v]++; } let b = cls[o]; for (let k = 0; k < 6; k++) if (n[k] > n[b]) b = k; out[o] = b; } return out; }

  // ------------------------------------------------------------------ the field read from its photo
  async function readField(F, st) {
    const lats = F.pts.map(p => p[0]), lons = F.pts.map(p => p[1]), pa = (Math.max(...lats) - Math.min(...lats)) * 0.12 + 2e-4, pb = (Math.max(...lons) - Math.min(...lons)) * 0.12 + 2e-4;
    st && (st.textContent = 'Reading the satellite photo of the field...');
    const M = await mosaic(Math.min(...lats) - pa, Math.min(...lons) - pb, Math.max(...lats) + pa, Math.max(...lons) + pb, 1700, 19);
    st && (st.textContent = 'Image analysis: colours, texture and clustering of ' + (M.W * M.H).toLocaleString('en-US') + ' pixels...'); await new Promise(r => setTimeout(r, 20));
    const f = features(M.img, M.W, M.H), km = kmeans(f, M.W * M.H, 7, 11), cls = majority(km.cls, M.W, M.H);
    // the field mask in the photo
    const mk = document.createElement('canvas'); mk.width = M.W; mk.height = M.H; const mc = mk.getContext('2d'); mc.beginPath(); F.pts.forEach((p, i) => { const q = M.px(p[0], p[1]); i ? mc.lineTo(q[0], q[1]) : mc.moveTo(q[0], q[1]); }); mc.closePath(); mc.fill(); const mask = mc.getImageData(0, 0, M.W, M.H).data;
    // the land cover picture (cut to the field) and its shares
    const out = document.createElement('canvas'); out.width = M.W; out.height = M.H; const oc = out.getContext('2d'), im = oc.createImageData(M.W, M.H), cnt = [0, 0, 0, 0, 0, 0]; let tot = 0;
    const rgb = CLS.map(c => [1, 3, 5].map(i => parseInt(c[1].substr(i, 2), 16)));
    for (let i = 0; i < M.W * M.H; i++) { if (mask[i * 4 + 3] < 128 || cls[i] < 0) continue; const k = cls[i]; cnt[k]++; tot++; im.data.set([rgb[k][0], rgb[k][1], rgb[k][2], 255], i * 4); }
    oc.putImageData(im, 0, 0);
    const A = H.areaM2(F.pts), shares = cnt.map((n, k) => ({ k, name: CLS[k][0], col: CLS[k][1], pct: tot ? n / tot * 100 : 0, ha: tot ? n / tot * A / 1e4 : 0 }));
    // the visible-band indices on the grid of the field (mean of the photo pixels in each cell)
    const G = H.grid(Math.max(1.5, M.mpp)), keys = ['VARI', 'GLI', 'ExG', 'NGRDI'], src = [f.vari, f.gli, f.exg, f.ngrdi], sum = keys.map(() => new Float64Array(G.nx * G.ny)), n = new Uint32Array(G.nx * G.ny);
    for (let y = 0; y < M.H; y++) for (let x = 0; x < M.W; x++) { const i = y * M.W + x; if (mask[i * 4 + 3] < 128 || !f.ok[i] || cls[i] === 5) continue; const ll = M.ll(x + 0.5, y + 0.5), l = H.local(ll, G.o), gi = Math.floor((l[0] - G.x0) / G.cell), gj = Math.floor((G.y1 - l[1]) / G.cell); if (gi < 0 || gj < 0 || gi >= G.nx || gj >= G.ny) continue; const o = gj * G.nx + gi; n[o]++; src.forEach((a, q) => { sum[q][o] += a[i]; }); }
    const vals = keys.map((k, q) => { const v = new Float32Array(G.nx * G.ny).fill(NaN); for (let o = 0; o < v.length; o++) if (n[o]) v[o] = sum[q][o] / n[o]; return v; });
    const cv = { cls, clsAt: (la, lo) => { const q = M.px(la, lo), x = Math.floor(q[0]), y = Math.floor(q[1]); return x < 0 || y < 0 || x >= M.W || y >= M.H ? -1 : cls[y * M.W + x]; }, url: out.toDataURL(), bounds: M.bounds, shares, z: M.z, mpp: M.mpp, tiles: M.ok + ' of ' + M.tried, pixels: tot, centres: km.centres.map((c, i) => Object.assign({ label: CLS[km.labels[i]][0] }, c)) };
    const res = H.pack(G, vals, { photo: true, src: 'Satellite photo of the field (Esri World Imagery, about ' + M.mpp.toFixed(1) + ' m per pixel, zoom ' + M.z + '; the capture date of the photo varies by place). Visible-band indices from the red, green and blue of ' + tot.toLocaleString('en-US') + ' pixels inside the outline; shadows left out.', date: 'photo', note: 'Indices read from the real satellite photo (' + tot.toLocaleString('en-US') + ' pixels). The photo has no near-infrared band: NDVI, EVI, SAVI, NDRE and NDWI need Sentinel-2.' }, keys);
    return { res, cv };
  }

  // ------------------------------------------------------------------ the site from open data
  async function getJSON(url, opt, ms) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms || 30000); try { const r = await fetch(url, Object.assign({ signal: ac.signal }, opt || {})); if (!r.ok) throw new Error('answer ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
  async function osmWater(c, R) {
    const a = '(around:' + R + ',' + c[0].toFixed(6) + ',' + c[1].toFixed(6) + ')';
    const q = '[out:json][timeout:25];(way["waterway"~"^(river|stream|canal|ditch|drain|brook)$"]' + a + ';way["natural"="water"]' + a + ';relation["natural"="water"]' + a + ';way["landuse"="reservoir"]' + a + ';way["water"]' + a + ';node["man_made"~"^(water_well|borehole|water_tower|reservoir_covered)$"]' + a + ';node["natural"="spring"]' + a + ';node["amenity"="water_point"]' + a + ';node["pump"]' + a + ';);out tags geom 400;';
    const j = await getJSON('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, 40000);
    return j.elements || [];
  }
  function srcType(t) {
    if (t.waterway) return t.waterway === 'brook' ? 'stream' : t.waterway;
    if (t.man_made === 'water_well' || t.man_made === 'borehole' || t.pump || t.amenity === 'water_point') return t.man_made === 'borehole' ? 'borehole' : 'well';
    if (t.natural === 'spring') return 'spring'; if (t.landuse === 'reservoir' || t.water === 'reservoir') return 'reservoir';
    if (t.water === 'river' || t.water === 'canal') return t.water; if (t.water === 'pond' || t.water === 'basin') return 'pond'; if (t.water === 'lake') return 'lake'; return t.natural === 'water' ? 'pond or lake' : 'water';
  }
  function nearest(F, pts) {   // the nearest point of a feature to the field edge (or the field itself), and its distance (m)
    const o = H.centroid(F.pts), P = F.pts.map(p => H.local(p, o)); let best = { d: Infinity, p: null };
    pts.forEach(q => { if (H.inside(q[0], q[1], F.pts)) { best = { d: 0, p: q }; return; } const l = H.local(q, o); for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((l[0] - a[0]) * dx + (l[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))), d = Math.hypot(l[0] - a[0] - t * dx, l[1] - a[1] - t * dy); if (d < best.d) best = { d, p: q, e: H.unlocal([a[0] + t * dx, a[1] + t * dy], o) }; } });
    return best;
  }
  const bearing = (a, b) => { const y = Math.sin((b[1] - a[1]) * rad) * Math.cos(b[0] * rad), x = Math.cos(a[0] * rad) * Math.sin(b[0] * rad) - Math.sin(a[0] * rad) * Math.cos(b[0] * rad) * Math.cos((b[1] - a[1]) * rad), br = (Math.atan2(y, x) / rad + 360) % 360; return ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(br / 45) % 8]; };
  async function elevations(pts) { const out = []; for (let i = 0; i < pts.length; i += 90) { const ch = pts.slice(i, i + 90), j = await getJSON('https://api.open-meteo.com/v1/elevation?latitude=' + ch.map(p => p[0].toFixed(5)).join(',') + '&longitude=' + ch.map(p => p[1].toFixed(5)).join(','), null, 20000); out.push(...(j.elevation || [])); } return out; }
  async function soilGrids(c) {
    const j = await getJSON('https://rest.isric.org/soilgrids/v2.0/properties/query?lon=' + c[1].toFixed(5) + '&lat=' + c[0].toFixed(5) + '&property=sand&property=clay&property=silt&property=soc&depth=0-5cm&depth=15-30cm&depth=30-60cm&value=mean', null, 30000);
    const L = {}; (j.properties && j.properties.layers || []).forEach(l => { L[l.name] = l.depths.map(d => d.values.mean); });
    const avg = a => { const v = (a || []).filter(x => x != null); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : NaN; };
    const sand = avg(L.sand) / 10, clay = avg(L.clay) / 10, silt = avg(L.silt) / 10, soc = avg(L.soc) / 10;   // g/kg to %; soc dg/kg to g/kg
    if (!isFinite(sand) || !isFinite(clay)) throw new Error('no soil data at this point (water, town or rock?)');
    return { sand, clay, silt, soc, cls: texClass(sand, clay, silt) };
  }
  function texClass(sa, cl, si) {   // USDA texture triangle
    if (si + 1.5 * cl < 15) return 'sand'; if (si + 1.5 * cl < 30) return 'loamy sand';
    if ((cl >= 7 && cl < 20 && sa > 52 && si + 2 * cl >= 30) || (cl < 7 && si < 50 && si + 2 * cl >= 30)) return 'sandy loam';
    if (cl >= 7 && cl < 27 && si >= 28 && si < 50 && sa <= 52) return 'loam'; if ((si >= 50 && cl >= 12 && cl < 27) || (si >= 50 && si < 80 && cl < 12)) return 'silt loam'; if (si >= 80 && cl < 12) return 'silt';
    if (cl >= 20 && cl < 35 && si < 28 && sa > 45) return 'sandy clay loam'; if (cl >= 27 && cl < 40 && sa > 20 && sa <= 45) return 'clay loam'; if (cl >= 27 && cl < 40 && sa <= 20) return 'silty clay loam';
    if (cl >= 35 && sa > 45) return 'sandy clay'; if (cl >= 40 && si >= 40) return 'silty clay'; return 'clay';
  }
  function planeFit(P) {   // z = a + b x + c y by least squares: slope (%) and the direction the ground falls to
    const n = P.length; if (n < 3) return null; let sx = 0, sy = 0, sz = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0; P.forEach(([x, y, z]) => { sx += x; sy += y; sz += z; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; });
    const mx2 = sx / n, my2 = sy / n, mz = sz / n, Sxx = sxx - n * mx2 * mx2, Syy = syy - n * my2 * my2, Sxy = sxy - n * mx2 * my2, Sxz = sxz - n * mx2 * mz, Syz = syz - n * my2 * mz, D = Sxx * Syy - Sxy * Sxy; if (Math.abs(D) < 1e-9) return null;
    const b = (Sxz * Syy - Syz * Sxy) / D, c = (Syz * Sxx - Sxz * Sxy) / D, br = (Math.atan2(-b, -c) / rad + 360) % 360;
    return { slope: Math.hypot(b, c) * 100, to: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(br / 45) % 8] };
  }
  // water bodies seen in the photo around the field (connected groups of water pixels)
  async function photoWater(F) {
    const c = H.centroid(F.pts), R = 1500, dLat = R / 110540, dLon = R / (111320 * Math.cos(c[0] * rad));
    const M = await mosaic(c[0] - dLat, c[1] - dLon, c[0] + dLat, c[1] + dLon, 1100, 17), f = features(M.img, M.W, M.H), km = kmeans(f, M.W * M.H, 7, 5), cls = majority(km.cls, M.W, M.H);
    const seen = new Uint8Array(M.W * M.H), out = [], minPx = Math.max(12, 600 / (M.mpp * M.mpp));
    for (let i = 0; i < cls.length; i++) { if (cls[i] !== 3 || seen[i]) continue; const st = [i], mem = []; seen[i] = 1; while (st.length) { const o = st.pop(); mem.push(o); const x = o % M.W, y = (o / M.W) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= M.W || yy >= M.H) return; const q = yy * M.W + xx; if (!seen[q] && cls[q] === 3) { seen[q] = 1; st.push(q); } }); }
      if (mem.length < minPx) continue; let sx = 0, sy = 0; mem.forEach(o => { sx += o % M.W; sy += (o / M.W) | 0; }); const step = Math.max(1, Math.floor(mem.length / 300)), pts = mem.filter((_, j) => j % step === 0).map(o => M.ll(o % M.W + 0.5, ((o / M.W) | 0) + 0.5));
      out.push({ type: 'water seen in the photo', name: '', area: mem.length * M.mpp * M.mpp, pts, centre: M.ll(sx / mem.length, sy / mem.length), photo: true }); }
    return out.sort((a, b) => b.area - a.area).slice(0, 12);
  }

  async function analyse(F, st) {
    const c = H.centroid(F.pts), log = [], say = t => { st && (st.textContent = t); };
    say('Reading the water features, the elevation and the soil of the site from open data...');
    const [osm, soil, pw] = await Promise.allSettled([osmWater(c, 3000), soilGrids(c), photoWater(F)]);
    const srcs = [];
    if (osm.status === 'fulfilled') osm.value.forEach(e => { const t = e.tags || {}, ty = srcType(t); let pts = []; if (e.type === 'node') pts = [[e.lat, e.lon]]; else if (e.geometry) pts = e.geometry.filter(Boolean).map(g => [g.lat, g.lon]); else if (e.members) e.members.forEach(m => (m.geometry || []).forEach(g => pts.push([g.lat, g.lon]))); if (!pts.length) return; srcs.push({ type: ty, name: t.name || '', tags: t, pts, osm: e.type + '/' + e.id, seasonal: t.intermittent === 'yes' || t.seasonal === 'yes' }); });
    else log.push('OpenStreetMap water features: ' + osm.reason.message);
    if (pw.status === 'fulfilled') pw.value.forEach(w => { if (!srcs.some(s => s.pts.some(p => Math.hypot((p[0] - w.centre[0]) * 110540, (p[1] - w.centre[1]) * 111320 * Math.cos(c[0] * rad)) < 60))) srcs.push(w); });
    else log.push('Water in the photo: ' + pw.reason.message);
    srcs.forEach(s => { const nb = nearest(F, s.pts); s.d = nb.d; s.at = nb.p; s.edge = nb.e || nb.p; s.dir = s.d > 0 ? bearing(c, s.at) : 'inside the field'; });
    // one record per named river or canal (its nearest part), the nearest 14 in all
    const seenName = {}, list = srcs.sort((a, b) => a.d - b.d).filter(s => { const k = s.name ? s.type + '|' + s.name : null; if (k && seenName[k]) return false; if (k) seenName[k] = 1; return true; }).slice(0, 14);
    // elevations: a grid over the field and the nearest point of each source
    const o = c, xyF = [], lats = F.pts.map(p => p[0]), lons = F.pts.map(p => p[1]);
    for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const p = [Math.min(...lats) + (Math.max(...lats) - Math.min(...lats)) * i / 6, Math.min(...lons) + (Math.max(...lons) - Math.min(...lons)) * j / 6]; if (H.inside(p[0], p[1], F.pts)) xyF.push(p); }
    F.pts.forEach(p => xyF.push(p)); xyF.push(c);
    let topo = null; try { say('Reading the ground elevation (Copernicus DEM)...'); const ev = await elevations(xyF.concat(list.map(s => s.at))), ef = ev.slice(0, xyF.length); const P = xyF.map((p, i) => { const l = H.local(p, o); return [l[0], l[1], ef[i]]; }).filter(q => isFinite(q[2]));
      const pf = planeFit(P); topo = { min: Math.min(...ef), max: Math.max(...ef), mean: ef.reduce((a, b) => a + b, 0) / ef.length, slope: pf ? pf.slope : NaN, to: pf ? pf.to : '' }; list.forEach((s, i) => { s.z = ev[xyF.length + i]; s.lift = isFinite(s.z) ? topo.max - s.z : NaN; }); }
    catch (e) { log.push('Elevation: ' + e.message); }
    if (soil.status !== 'fulfilled') log.push('SoilGrids soil: ' + soil.reason.message);
    const S = { osmOk: osm.status === 'fulfilled', centre: c, sources: list, topo, soil: soil.status === 'fulfilled' ? soil.value : null, log, when: new Date().toISOString() };
    S.water = rankSources(S); S.systems = rankSystems(F, S); return S;
  }

  // ------------------------------------------------------------------ suggestions
  const BASE = { river: 92, canal: 90, reservoir: 86, lake: 82, 'pond or lake': 72, pond: 62, spring: 60, stream: 58, borehole: 74, well: 70, ditch: 42, drain: 30, 'water seen in the photo': 50, water: 55, water_tower: 40 };
  function rankSources(S) {
    const out = S.sources.map(s => { let sc = BASE[s.type] != null ? BASE[s.type] : 50; const why = [];
      if (s.seasonal) { sc -= 30; why.push('mapped as seasonal: it may run dry in the dry season'); }
      sc -= Math.min(45, s.d / 60); why.push(s.d > 0 ? Math.round(s.d) + ' m from the field (' + s.dir + '): about ' + Math.round(s.d * 1.1) + ' m of mainline' : 'inside the field');
      if (isFinite(s.lift) && !/well|borehole/.test(s.type)) { if (s.lift > 0) { sc -= Math.min(20, s.lift * 0.8); why.push('lift about ' + s.lift.toFixed(0) + ' m to the highest point of the field'); } else why.push('the source lies ' + (-s.lift).toFixed(0) + ' m above the highest point: water can flow by gravity'); }
      if (s.type === 'drain' || s.type === 'ditch') why.push('drainage water: test its salinity before use');
      if (s.type === 'well' || s.type === 'borehole') why.push('groundwater is used here; the depth of the water table is not mapped: ask the local drillers or the borehole records');
      if (s.photo) why.push('seen in the photo only (' + Math.round(s.area).toLocaleString('en-US') + ' m²): check on the ground that it is open water');
      if (s.type === 'reservoir' || s.type === 'canal') why.push('ask the water authority for an allocation');
      return Object.assign({}, s, { score: Math.max(0, Math.round(sc)), why }); }).sort((a, b) => b.score - a.score);
    const surf = out.find(s => !/well|borehole/.test(s.type) && s.d < 1500 && s.score >= 45);
    let advice;
    if (!S.osmOk && !out.length) advice = 'The water features around the field could not be read (no internet connection?). Connect to the internet and press Analyse the site again.';
    else if (surf) advice = 'Take the water from ' + label(surf) + ', ' + Math.round(surf.d) + ' m ' + surf.dir + ' of the field' + (isFinite(surf.lift) ? (surf.lift > 0 ? ', with a pump lifting about ' + surf.lift.toFixed(0) + ' m' : ', by gravity') : '') + '.';
    else if (out.some(s => /well|borehole/.test(s.type))) advice = 'No reliable surface water within 1.5 km. Wells or boreholes are mapped nearby, so groundwater is likely: drill a borehole at the edge of the field nearest the inlet.';
    else advice = 'No water source is mapped within 3 km. A borehole is the usual choice: have a hydrogeological survey made first; rain-water harvesting into a farm pond can add to it.';
    return { list: out, advice, best: surf || out.find(s => /well|borehole/.test(s.type)) || null };
  }
  const label = s => (s.name ? s.name + ' (' + s.type + ')' : 'the ' + s.type);
  function rankSystems(F, S) {
    let eng = null; try { eng = E.json("(function(){var c=CROPS[state.crop]||{},t=DATA.texture[state.soil]||{},r={crop:c.label||state.crop,soil:DATA.soil_labels[state.soil],sand:t.sand,clay:t.clay};try{r.sid=sidRun().Ea;r.drip=drRun().Ea;r.spr=spRun().Ea}catch(e){}return r})()"); } catch (e) {}
    const A = H.areaM2(F.pts) / 1e4, P = H.perim(F.pts), comp = 4 * Math.PI * A * 1e4 / (P * P), sl = S.topo && isFinite(S.topo.slope) ? S.topo.slope : NaN, relief = S.topo ? S.topo.max - S.topo.min : NaN;
    const sand = S.soil ? S.soil.sand : eng && eng.sand, clay = S.soil ? S.soil.clay : eng && eng.clay, crop = (eng && eng.crop || '').toLowerCase();
    const best = S.water && S.water.best, surfaceWater = best && !/well|borehole/.test(best.type) && best.d < 1500, gw = !surfaceWater;
    const cereal = /wheat|barley|rice|oat|rye|sorghum|millet|alfalfa|grass|pasture|clover/.test(crop), row = /maize|corn|cotton|potato|tomato|onion|pepper|bean|soy|vegetable|sugar|beet|cassava|groundnut|peanut/.test(crop), tree = /orchard|citrus|olive|vine|grape|mango|apple|banana|date|coffee|tea|cocoa/.test(crop);
    const cover = F.cv ? F.cv.shares : null, built = cover ? cover[4].pct : 0, sys = [];
    const add = (id, sub, name, base, rules) => { let s = base; const why = []; rules.forEach(([c2, d, t]) => { if (c2) { s += d; why.push((d > 0 ? '+ ' : '− ') + t); } }); sys.push({ id, sub, name, score: Math.max(0, Math.min(100, Math.round(s))), why, Ea: eng ? eng[id] : null }); };
    const L = isFinite(sl);
    add('sid', 'basin', 'Basin (level basins)', 62, [[L && sl <= 0.3, 14, 'the ground is nearly level (' + sl.toFixed(2) + ' %)'], [L && sl > 1, -40, 'slope ' + sl.toFixed(1) + ' %: basins need level ground'], [L && sl > 0.3 && sl <= 1, -12, 'some levelling needed (' + sl.toFixed(2) + ' %)'], [clay >= 35, 10, 'clay soil holds the water in the basin'], [sand >= 65, -35, 'sandy soil: the water sinks near the inlet (deep percolation)'], [surfaceWater, 10, 'large surface water supply nearby'], [gw, -15, 'only groundwater: basins need large flows'], [/rice/.test(crop), 15, 'rice grows in basins'], [tree, 5, 'orchards are often basin irrigated'], [comp < 0.55, -8, 'irregular field shape']]);
    add('sid', 'border', 'Border strips', 60, [[L && sl >= 0.1 && sl <= 2, 12, 'slope ' + sl.toFixed(2) + ' % suits borders (0.1–2 %)'], [L && sl > 2, -35, 'slope ' + sl.toFixed(1) + ' %: too steep for borders'], [sand >= 65, -30, 'sandy soil: high intake'], [clay >= 20 && clay < 45, 6, 'loam to clay loam soil'], [cereal, 10, 'close-growing crop (' + crop + ')'], [surfaceWater, 10, 'large surface water supply nearby'], [gw, -15, 'only groundwater'], [comp < 0.55, -10, 'irregular field shape'], [L && relief > 3 && A < 10, -8, 'relief of ' + relief.toFixed(1) + ' m: land levelling needed']]);
    add('sid', 'furrow', 'Furrows', 60, [[L && sl >= 0.2 && sl <= 3, 12, 'slope ' + sl.toFixed(2) + ' % suits furrows (0.2–3 %)'], [L && sl > 3, -30, 'slope ' + sl.toFixed(1) + ' %: erosion along the furrows'], [sand >= 65, -28, 'sandy soil: high intake'], [row, 12, 'row crop (' + crop + ')'], [cereal, -12, 'close-growing crop: furrows do not suit it'], [surfaceWater, 8, 'surface water supply nearby'], [gw, -10, 'only groundwater'], [comp < 0.55, -8, 'irregular field shape']]);
    add('spr', null, 'Sprinklers', 64, [[L && sl > 2 && sl <= 15, 10, 'slope ' + sl.toFixed(1) + ' %: sprinklers work on rolling ground'], [L && sl > 20, -25, 'slope ' + sl.toFixed(0) + ' %: runoff and uneven pressure'], [sand >= 50, 10, 'sandy or light soil'], [clay >= 45, -12, 'heavy clay takes water slowly: keep the rate low'], [cereal, 8, 'close-growing crop (' + crop + ')'], [tree, -12, 'tall trees block the jets'], [comp < 0.55, 8, 'irregular field shape: sprinklers adapt to it'], [gw, 5, 'moderate flows from a borehole are enough'], [L && sl <= 0.3 && surfaceWater && clay >= 20, -8, 'level field with plenty of surface water: surface irrigation is cheaper']]);
    add('drip', null, 'Drip', 58, [[sand >= 50, 12, 'sandy or light soil: drip keeps the water in the root zone'], [gw, 15, 'water is scarce or pumped from a borehole: drip saves the most water'], [L && sl > 3, 10, 'slope ' + sl.toFixed(1) + ' %: drip works on any slope'], [row || tree, 14, (tree ? 'orchard or vine' : 'row crop') + ' (' + crop + ')'], [cereal, -22, 'close-growing crop (' + crop + '): drip lines in every row are costly'], [A > 50, -6, 'large field: the cost per hectare is high'], [built > 15, -4, 'buildings or hard surfaces cover ' + built.toFixed(0) + ' % of the outline']]);
    sys.sort((a, b) => b.score - a.score); if (!isFinite(sl) || !S.soil) sys.forEach(x => x.why.push('(' + [!isFinite(sl) ? 'the slope' : '', !S.soil ? 'the soil of the site' : ''].filter(Boolean).join(' and ') + ' could not be read: the score is incomplete)'));
    return { list: sys, area: A, comp, slope: sl, relief, sand, clay, crop, surfaceWater };
  }
  return { init: h => { H = h; }, readField, analyse, CLS, mosaic, soilAt: c => soilGrids(c) };
})();
