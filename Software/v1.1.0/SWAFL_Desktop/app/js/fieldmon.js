/* Monitoring of the real field: the Sentinel-2 L2A scenes of the last twelve months over the demarcated field (one clear scene a
   month, the least cloudy), read cell by cell (10 m): NDVI and NDMI of every date, clouds and shadows removed with the scene
   classification. From the series: the curve of the field and of its parts, the change since the previous scene, the trend of the
   last scenes, how each part stood against the field on every date (stability), and the monitoring zones (cells that behaved alike
   over the season, k-means on their standardised NDVI series). The zones and their NDVI and NDMI feed the variable-rate irrigation
   and the erosion maps. */
'use strict';
const FieldMon = (() => {
  const M = { ts: null, nz: 4 };
  const H = () => FieldMap._h, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  async function readItem(it, G, cells, st, k) {
    const zone = it.epsg % 100, south = it.epsg > 32700, utm = cells.map(c => H().toUTM(c[2][0], c[2][1], zone, south)), ux = utm.map(u => u[0]), uy = utm.map(u => u[1]), bb = [Math.min(...ux) - 30, Math.min(...uy) - 30, Math.max(...ux) + 30, Math.max(...uy) + 30], band = {};
    for (const b of ['scl', 'red', 'nir', 'swir16']) { st && (st.textContent = 'Scene ' + (k + 1) + ': ' + it.date.slice(0, 10) + ', band ' + b + '...'); const tif = await GeoTIFF.fromUrl(it.href[b], { allowFullFile: true }), img = await tif.getImage(), [ox, oy] = img.getOrigin(), [rx, ry] = img.getResolution(), W = img.getWidth(), Hh = img.getHeight();
      const c0 = Math.max(0, Math.floor((bb[0] - ox) / rx)), c1 = Math.min(W, Math.ceil((bb[2] - ox) / rx) + 1), r0 = Math.max(0, Math.floor((bb[3] - oy) / ry)), r1 = Math.min(Hh, Math.ceil((bb[1] - oy) / ry) + 1); if (c1 <= c0 || r1 <= r0) return null;
      const ras = await img.readRasters({ window: [c0, r0, c1, r1], samples: [0], interleave: false }); band[b] = { d: ras[0], w: c1 - c0, h: r1 - r0, ox: ox + c0 * rx, oy: oy + r0 * ry, rx, ry };
      if (b === 'scl') { let clear = 0; utm.forEach(u => { const v = px(band.scl, u[0], u[1]); if (![0, 1, 3, 8, 9, 10, 11].includes(v)) clear++; }); if (clear < cells.length * 0.3) return null; } }
    const nd = new Float32Array(G.nx * G.ny).fill(NaN), nm = new Float32Array(G.nx * G.ny).fill(NaN); let ok = 0;
    cells.forEach((c, q) => { const u = utm[q], scl = px(band.scl, u[0], u[1]); if ([0, 1, 3, 8, 9, 10, 11].includes(scl)) return; const rf = b => { const v = px(band[b], u[0], u[1]); return v > 0 ? v * 0.0001 + it.off : NaN; }, r = rf('red'), n = rf('nir'), s = rf('swir16'); if (![r, n, s].every(isFinite)) return; nd[c[1] * G.nx + c[0]] = (n - r) / (n + r); nm[c[1] * G.nx + c[0]] = (n - s) / (n + s); ok++; });
    return ok ? { date: it.date.slice(0, 10), id: it.id, cloud: it.cloud, cat: it.cat, ndvi: nd, ndmi: nm, clear: ok / cells.length } : null;
  }
  const px = (b, x, y) => { const c = Math.floor((x - b.ox) / b.rx), r = Math.floor((y - b.oy) / b.ry); if (c < 0 || r < 0 || c >= b.w || r >= b.h) return NaN; const v = b.d[r * b.w + c]; return v === undefined ? NaN : v; };
  async function read(st) {
    const h = H(), F = h.F; if (F.pts.length < 3) throw new Error('demarcate the field first'); if (typeof GeoTIFF === 'undefined') throw new Error('the GeoTIFF reader did not load');
    const ring = F.pts.map(p => [p[1], p[0]]); ring.push(ring[0]); const end = new Date(), start = new Date(end - 365 * 864e5);
    st && (st.textContent = 'Searching the Sentinel-2 scenes of the last twelve months...');
    const items = await h.s2Search(ring, start, end, 60), byM = {}; items.forEach(x => { const m = x.date.slice(0, 7); if (!byM[m] || x.cloud < byM[m].cloud) byM[m] = x; });
    const pick = Object.values(byM).sort((a, b) => a.date < b.date ? -1 : 1).slice(-12); if (!pick.length) throw new Error('no Sentinel-2 scene over the field in the last twelve months');
    const G = h.grid(10), cells = []; for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const p = G.ll(i, j); if (h.inside(p[0], p[1], F.pts)) cells.push([i, j, p]); }
    const S = []; for (let k = 0; k < pick.length; k++) { try { const r = await readItem(pick[k], G, cells, st, k); if (r) S.push(r); } catch (e) {} }
    if (S.length < 2) throw new Error('fewer than two clear scenes over the field in the last twelve months');
    M.ts = derive(G, cells, S); return M.ts;
  }
  function derive(G, cells, S) {
    const N = G.nx * G.ny, D = S.length, mean = a => { let s = 0, n = 0; for (const v of a) if (isFinite(v)) { s += v; n++; } return n ? s / n : NaN; };
    const fm = S.map(s => ({ ndvi: mean(s.ndvi), ndmi: mean(s.ndmi) })), sd = S.map((s, d) => { let a = 0, n = 0; for (const v of s.ndvi) if (isFinite(v)) { a += (v - fm[d].ndvi) ** 2; n++; } return Math.sqrt(a / Math.max(1, n)) || 0.02; });
    // each cell against the field on every date: the standardised NDVI, its mean (stability), the last change and the trend
    const z = S.map((s, d) => Float32Array.from(s.ndvi, v => isFinite(v) ? (v - fm[d].ndvi) / sd[d] : NaN)), stab = new Float32Array(N).fill(NaN), chg = new Float32Array(N).fill(NaN), trend = new Float32Array(N).fill(NaN), last = new Float32Array(N).fill(NaN), lastM = new Float32Array(N).fill(NaN);
    const tDays = S.map(s => (new Date(s.date) - new Date(S[0].date)) / 864e5);
    for (let i = 0; i < N; i++) { let a = 0, n = 0; for (let d = 0; d < D; d++) if (isFinite(z[d][i])) { a += z[d][i]; n++; } if (n) stab[i] = a / n;
      const v = []; for (let d = 0; d < D; d++) if (isFinite(S[d].ndvi[i])) v.push(d); if (v.length) { last[i] = S[v[v.length - 1]].ndvi[i]; lastM[i] = S[v[v.length - 1]].ndmi[i]; }
      if (v.length >= 2) { const a2 = v[v.length - 2], b2 = v[v.length - 1]; chg[i] = S[b2].ndvi[i] - S[a2].ndvi[i]; }
      const w = v.slice(-3); if (w.length >= 2) { const xs = w.map(d => tDays[d]), ys = w.map(d => S[d].ndvi[i]), mx = xs.reduce((p, q) => p + q, 0) / xs.length, my = ys.reduce((p, q) => p + q, 0) / ys.length; let sxy = 0, sxx = 0; xs.forEach((x, q) => { sxy += (x - mx) * (ys[q] - my); sxx += (x - mx) ** 2; }); trend[i] = sxx ? sxy / sxx * 30 : NaN; } }
    const ts = { G, cells, S, fm, sd, z, stab, chg, trend, last, lastM, tDays };
    zone(ts, M.nz); return ts;
  }
  // monitoring zones: k-means on the standardised NDVI series of the cells (missing dates filled with the cell's mean), ordered weak to strong
  function zone(ts, k) {
    const { G, S, z, stab } = ts, N = G.nx * G.ny, D = S.length, idx = []; for (let i = 0; i < N; i++) if (isFinite(stab[i])) idx.push(i);
    const vec = i => z.map(a => isFinite(a[i]) ? a[i] : stab[i]); let C = []; const sorted = idx.slice().sort((a, b) => stab[a] - stab[b]); for (let q = 0; q < k; q++) C.push(vec(sorted[Math.floor((q + 0.5) / k * (sorted.length - 1))]));
    const lab = new Int8Array(N).fill(-1), d2 = (a, b) => { let t = 0; for (let q = 0; q < a.length; q++) t += (a[q] - b[q]) ** 2; return t; };
    for (let it = 0; it < 15; it++) { const sum = C.map(() => new Array(D).fill(0)), cnt = new Array(k).fill(0); idx.forEach(i => { const v = vec(i); let b = 0, bd = Infinity; C.forEach((c, q) => { const dd = d2(v, c); if (dd < bd) { bd = dd; b = q; } }); lab[i] = b; cnt[b]++; v.forEach((x, q) => { sum[b][q] += x; }); }); C = C.map((c, q) => cnt[q] ? sum[q].map(x => x / cnt[q]) : c); }
    const order = C.map((c, q) => [c.reduce((a, b) => a + b, 0) / D, q]).sort((a, b) => a[0] - b[0]).map(x => x[1]), rank = new Array(k); order.forEach((q, r) => { rank[q] = r; });
    const zl = new Int8Array(N).fill(-1); idx.forEach(i => { zl[i] = rank[lab[i]]; });
    const A = H().areaM2(H().F.pts) / 1e4, Z = Array.from({ length: k }, (_, r) => { const cs = idx.filter(i => zl[i] === r); const ser = S.map((s, d) => { let a = 0, n = 0, b = 0, m = 0; cs.forEach(i => { if (isFinite(s.ndvi[i])) { a += s.ndvi[i]; n++; } if (isFinite(s.ndmi[i])) { b += s.ndmi[i]; m++; } }); return { ndvi: n ? a / n : NaN, ndmi: m ? b / m : NaN }; });
      let cy = 0, cx = 0; cs.forEach(i => { cy += Math.floor(i / G.nx); cx += i % G.nx; }); const ctr = cs.length ? G.ll(cx / cs.length, cy / cs.length) : null;
      return { r, n: cs.length, ha: cs.length / idx.length * A, pct: cs.length / idx.length * 100, ser, ctr, stab: cs.reduce((a, i) => a + stab[i], 0) / Math.max(1, cs.length), last: ser.slice().reverse().find(x => isFinite(x.ndvi)) || {} }; });
    ts.zone = zl; ts.Z = Z; ts.k = k; return ts;
  }
  // ------------------------------------------------------------------ pictures and legends
  const div = v => { const t = Math.max(-1, Math.min(1, v)); return t < 0 ? [215 + (255 - 215) * (1 + t), 48 + (255 - 48) * (1 + t), 39 + (255 - 39) * (1 + t)].map(Math.round) : [255 - (255 - 26) * t, 255 - (255 - 152) * t, 255 - (255 - 80) * t].map(Math.round); };
  const ZC = ['#B2182B', '#EF8A62', '#FDDBC7', '#D1E5F0', '#67A9CF', '#2166AC', '#053061'];
  const zcol = (k, r) => { const pal = k <= 3 ? ['#D7301F', '#FEE08B', '#1A9850'] : k === 4 ? ['#D7301F', '#FC8D59', '#91CF60', '#1A9850'] : ['#D7301F', '#FC8D59', '#FEE08B', '#91CF60', '#1A9850', '#006837', '#004529']; return pal[Math.min(pal.length - 1, r)]; };
  const hex = c => [1, 3, 5].map(i => parseInt(c.substr(i, 2), 16));
  function picture(view) {
    const ts = M.ts; if (!ts) return null; const G = ts.G, cv = document.createElement('canvas'), sc = Math.max(1, Math.min(24, 1400 / Math.max(G.nx, G.ny))); cv.width = Math.round(G.nx * sc); cv.height = Math.round(G.ny * sc); const c = cv.getContext('2d');
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const q = j * G.nx + i; let col = null;
      if (view === 'mchange') { const v = ts.chg[q]; if (isFinite(v)) col = div(v / 0.2); } else if (view === 'mtrend') { const v = ts.trend[q]; if (isFinite(v)) col = div(v / 0.1); } else if (view === 'mstab') { const v = ts.stab[q]; if (isFinite(v)) col = div(v / 1.2); } else if (view === 'mzone') { const r = ts.zone[q]; if (r >= 0) col = hex(zcol(ts.k, r)); }
      if (!col) continue; c.fillStyle = 'rgb(' + col.join(',') + ')'; c.fillRect(Math.floor(i * sc), Math.floor(j * sc), Math.ceil(sc) + 1, Math.ceil(sc) + 1); }
    c.globalCompositeOperation = 'destination-in'; c.beginPath(); H().F.pts.forEach((p, i) => { const l = H().local(p, G.o), x = (l[0] - G.x0) / G.cell * sc, y = (G.y1 - l[1]) / G.cell * sc; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over';
    return { cv, bounds: [[G.sw[0], G.sw[1]], [G.ne[0], G.ne[1]]] };
  }
  function legend(view) {
    const ts = M.ts; if (!ts) return ''; const S = ts.S, a = S[S.length - 2], b = S[S.length - 1], grad = f => '<i class="fmgrad" style="background:linear-gradient(90deg,' + [-1, -0.5, 0, 0.5, 1].map((t, q) => 'rgb(' + div(t).join(',') + ') ' + q * 25 + '%').join(',') + ')"></i>';
    if (view === 'mchange') return '<div class="fmchip">NDVI change · ' + a.date + ' → ' + b.date + '</div>' + grad() + '<div class="fmends"><span>−0.2 decline</span><span>+0.2 growth</span></div><div class="fmmean">field mean ' + (ts.fm[S.length - 1].ndvi - ts.fm[S.length - 2].ndvi).toFixed(3) + '</div>';
    if (view === 'mtrend') return '<div class="fmchip">NDVI trend of the last scenes · per 30 days</div>' + grad() + '<div class="fmends"><span>−0.1 falling</span><span>+0.1 rising</span></div>';
    if (view === 'mstab') return '<div class="fmchip">Stability over ' + S.length + ' scenes · ' + S[0].date + ' to ' + b.date + '</div>' + grad() + '<div class="fmends"><span>always weaker</span><span>always stronger</span></div>';
    if (view === 'mzone') return '<div class="fmchip">Monitoring zones · ' + S.length + ' scenes</div><table>' + ts.Z.map(z => '<tr><td><i style="background:' + zcol(ts.k, z.r) + '"></i></td><td>zone ' + (z.r + 1) + '</td><td>NDVI ' + (+z.last.ndvi).toFixed(2) + '</td><td>' + z.ha.toFixed(2) + ' ha</td></tr>').join('') + '</table>';
    return '';
  }
  function at(view, lat, lon) { const ts = M.ts; if (!ts) return ''; const G = ts.G, l = H().local([lat, lon], G.o), i = Math.floor((l[0] - G.x0) / G.cell), j = Math.floor((G.y1 - l[1]) / G.cell); if (i < 0 || j < 0 || i >= G.nx || j >= G.ny) return ''; const q = j * G.nx + i; if (!isFinite(ts.stab[q])) return '';
    return 'NDVI ' + ts.S.map(s => isFinite(s.ndvi[q]) ? s.ndvi[q].toFixed(2) : '–').join(' → ') + ' · change ' + (isFinite(ts.chg[q]) ? ts.chg[q].toFixed(3) : '–') + ' · zone ' + (ts.zone[q] + 1); }
  // ------------------------------------------------------------------ the panel: the curves of the field and of the zones, the dates
  function panel() {
    const el = document.getElementById('fmMonRes'); if (!el) return; const ts = M.ts; if (!ts) { el.innerHTML = ''; return; }
    const S = ts.S, n = S.length, f = ts.fm, dl = f[n - 1].ndvi - f[n - 2].ndvi; let dec = 0, tot = 0; for (const v of ts.chg) if (isFinite(v)) { tot++; if (v < -0.05) dec++; }
    const weak = ts.Z[0], strong = ts.Z[ts.k - 1];
    el.innerHTML = '<div class="fmzt"><b>The season seen by Sentinel-2</b> <small>(' + n + ' clear scenes, ' + S[0].date + ' to ' + S[n - 1].date + ')</small><canvas id="fmMonC" style="width:100%;height:190px;display:block;background:#fff;border:1px solid #ccc;margin:4px 0"></canvas>' +
      '<div class="fmrow"><label>Monitoring zones <select id="fmMonK">' + [3, 4, 5, 6].map(k => '<option' + (k === ts.k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></label><label>Show <select id="fmMonV"><option value="mzone">monitoring zones</option><option value="mchange">change since the previous scene</option><option value="mtrend">trend of the last scenes</option><option value="mstab">stability over the season</option></select></label></div>' +
      '<table class="tbl fmtab"><tr><th>Date</th><th>Clear</th><th>NDVI</th><th>NDMI</th>' + ts.Z.map(z => '<th style="color:' + zcol(ts.k, z.r) + '">Z' + (z.r + 1) + '</th>').join('') + '</tr>' + S.map((s, d) => '<tr><td>' + s.date + '</td><td>' + Math.round(s.clear * 100) + ' %</td><td><b>' + f[d].ndvi.toFixed(3) + '</b></td><td>' + f[d].ndmi.toFixed(3) + '</td>' + ts.Z.map(z => '<td>' + (isFinite(z.ser[d].ndvi) ? z.ser[d].ndvi.toFixed(2) : '–') + '</td>').join('') + '</tr>').join('') + '</table>' +
      '<div class="fmadv">Since ' + S[n - 2].date + ' the field NDVI has ' + (dl >= 0 ? 'risen' : 'fallen') + ' by ' + Math.abs(dl).toFixed(3) + ' to ' + f[n - 1].ndvi.toFixed(3) + '; ' + Math.round(dec / Math.max(1, tot) * 100) + ' % of the field declined by more than 0.05. Zone 1 (' + weak.ha.toFixed(2) + ' ha) stood ' + Math.abs(weak.stab).toFixed(2) + ' standard deviations below the field over the season, zone ' + ts.k + ' (' + strong.ha.toFixed(2) + ' ha) ' + Math.abs(strong.stab).toFixed(2) + ' above: these zones are persistent, not one date.</div></div>';
    document.getElementById('fmMonK').onchange = e => { M.nz = +e.target.value; zone(ts, M.nz); panel(); H().refresh('mzone'); };
    const vs = document.getElementById('fmMonV'); vs.value = ['mchange', 'mtrend', 'mstab', 'mzone'].includes(H().F.view) ? H().F.view : 'mzone'; vs.onchange = e => H().refresh(e.target.value);
    chart(document.getElementById('fmMonC'), ts);
  }
  function chart(cv, ts) {
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; const c = cv.getContext('2d'); c.scale(dpr, dpr); c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    const S = ts.S, L = 38, R = 34, T = 18, B = 26, t0 = new Date(S[0].date).getTime(), t1 = new Date(S[S.length - 1].date).getTime(), X = d => L + (w - L - R) * (new Date(d).getTime() - t0) / Math.max(1, t1 - t0), Y = v => T + (h - T - B) * (1 - (v + 0.2) / 1.2);
    c.font = '10px Tahoma,Arial'; c.strokeStyle = '#E5E5E5'; c.fillStyle = '#444'; for (let v = -0.2; v <= 1.001; v += 0.2) { c.beginPath(); c.moveTo(L, Y(v)); c.lineTo(w - R, Y(v)); c.stroke(); c.textAlign = 'right'; c.fillText(v.toFixed(1), L - 4, Y(v) + 3); }
    c.textAlign = 'center'; S.forEach(s => { c.fillText(s.date.slice(5), X(s.date), h - B + 13); }); c.fillText('date of the scene', (L + w - R) / 2, h - 3);
    const line = (vals, col, wd, dash) => { c.strokeStyle = col; c.lineWidth = wd; c.setLineDash(dash || []); c.beginPath(); let pen = false; S.forEach((s, d) => { const v = vals[d]; if (!isFinite(v)) { pen = false; return; } pen ? c.lineTo(X(s.date), Y(v)) : c.moveTo(X(s.date), Y(v)); pen = true; }); c.stroke(); c.setLineDash([]); S.forEach((s, d) => { const v = vals[d]; if (isFinite(v)) { c.fillStyle = col; c.beginPath(); c.arc(X(s.date), Y(v), 2.5, 0, 6.283); c.fill(); } }); };
    ts.Z.forEach(z => line(z.ser.map(x => x.ndvi), zcol(ts.k, z.r), 1.4)); line(ts.fm.map(x => x.ndvi), '#111', 2.4); line(ts.fm.map(x => x.ndmi), '#1565C0', 2, [5, 3]);
    c.textAlign = 'left'; c.fillStyle = '#111'; c.fillText('— field NDVI', L + 4, 11); c.fillStyle = '#1565C0'; c.fillText('- - field NDMI', L + 90, 11); c.fillStyle = '#666'; c.fillText('thin: NDVI of each monitoring zone', L + 180, 11);
  }
  async function run() { const st = document.getElementById('fmPrecSt'); try { await read(st); st.textContent = 'Season read: ' + M.ts.S.length + ' clear Sentinel-2 scenes.'; panel(); H().refresh('mzone'); } catch (e) { st.innerHTML = '<b style="color:#B01E14">' + esc(/Failed to fetch|NetworkError/i.test(e.message) ? 'the satellite catalogue cannot be reached (no internet connection)' : e.message) + '</b>'; } }
  return { run, panel, picture, legend, at, has: v => !!M.ts && /^m(change|trend|stab|zone)$/.test(v), get ts() { return M.ts; }, reset: () => { M.ts = null; }, _M: M, _derive: derive };
})();
