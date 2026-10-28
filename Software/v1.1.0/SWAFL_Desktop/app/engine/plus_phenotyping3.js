/* SWAFL 1.1 layer P1 Deterministic phenotyping (part 3): the roots day by day, and the prediction of phenotype and genotype.
   Everything is computed by the model of plus_phenomodel.js from the controls of the layer and of the Properties panel. */
'use strict';
(function () {
  const U = window.PHUI; if (!U) return;
  const { BASE, scrub, RN, RNc, PH, P, K, chip, mix, day, dateOf, R, N, NL, DZ, cfgFor, effGeno, keyOf, SECTIONS } = U;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, TF = K.TF, GRID = '#E6E2D6', MUTE0 = '#6B7280';
  const note = (txt, x, y, w, o) => sidWrap(txt, x, y, w, Object.assign({ s: 9.5, c: MUTE }, o || {}), 12.5);
  const frameH = (x, y, w, title, sub) => K.frame(x, y, w, 24, title, sub);
  const endFrame = (x, y0, y, w) => { ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y0 + 0.5, w - 1, y - y0); };
  const sum = a => a.reduce((s, v) => s + v, 0);

  // ================================================================== the roots day by day: profile of the day and the time series that moves with it
  const RROWS = [
    { t: 'Root length of the plant', u: 'm', f: r => r.Lroot, s: 0.01 }, { t: 'Deepest root tip', u: 'cm', f: r => r.Rdepth },
    { t: 'Depth of 95 % (D95)', u: 'cm', f: r => r.D95 }, { t: 'Root growth per day', u: 'cm/d', f: r => r.dL },
    { t: 'Carbon share to the roots', u: '%', f: r => r.fr, s: 100 }, { t: 'Root : shoot ratio', u: '', f: r => Array.from(r.Wr, (v, i) => v / Math.max(1e-6, r.Wl[i] + r.Ws[i] + r.Wg[i])) }
  ];
  function drawRootDay(y) {
    const w = W - 32, cx = 16, d = day(), y0 = y, a = R('ww'), b = R('dr'); frameH(cx, y, w, 'Roots day by day', 'day ' + d + ' after emergence (' + dateOf(d) + '): the profile of the day and the roots through the season');
    y += 30; const pw = 150, hh = 218, px = cx + 44, top = y + 22;
    T('Root length density on this day (cm per cm³)', cx + 10, y + 8, { s: 9.5, b: true });
    let mx = 0.05; for (let i = 0; i < NL; i++) { mx = Math.max(mx, a.Lz[d * NL + i] / (a.A * DZ), b.Lz[d * NL + i] / (b.A * DZ)); } mx = K.nice(mx * 1.1);
    const dz = hh / NL; ctx.strokeStyle = GRID; ctx.lineWidth = 1; for (let g = 0; g <= 2; g++) { const gx = px + pw * g / 2; ctx.beginPath(); ctx.moveTo(gx + 0.5, top); ctx.lineTo(gx + 0.5, top + hh); ctx.stroke(); T(fmt(mx * g / 2, mx < 2 ? 2 : 1), gx, top + hh + 11, { s: 8, c: MUTE, a: 'center' }); }
    for (let i = 0; i < NL; i++) {
      T(String(i * DZ), px - 4, top + i * dz + 8, { s: 8, c: MUTE, a: 'right' });
      const va = a.Lz[d * NL + i] / (a.A * DZ), vb = b.Lz[d * NL + i] / (b.A * DZ), wa = a.w[d * NL + i];
      ctx.fillStyle = mix('#EDE3C8', '#7FB2E0', wa); ctx.fillRect(px, top + i * dz, 5, dz - 1);
      ctx.fillStyle = '#1B1F23'; ctx.fillRect(px + 7, top + i * dz + 2, Math.max(0, va / mx * (pw - 9)), dz / 2 - 2);
      ctx.fillStyle = '#D93025'; ctx.fillRect(px + 7, top + i * dz + dz / 2, Math.max(0, vb / mx * (pw - 9)), dz / 2 - 2);
    }
    [[a.D95[d], '#1B1F23'], [b.D95[d], '#D93025']].forEach(([v, c]) => { const yy = top + v / (NL * DZ) * hh; ctx.strokeStyle = c; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke(); ctx.setLineDash([]); });
    T('cm', px - 4, top - 3, { s: 8, c: MUTE, a: 'right' }); T('blue strip: water of the layer', px, top + hh + 24, { s: 8, c: MUTE }); T('dashed: depth of 95 % of the roots', px, top + hh + 35, { s: 8, c: MUTE });
    K.legend([['#1B1F23', RN()], ['#D93025', 'drought']], cx + 10, y + hh + 72);
    // the time series on the right: 2 columns x 3 rows, each with the moving marker, scrubbable
    const gx0 = px + pw + 24, gw = (w - (gx0 - cx) - 14 - 18) / 2, gh = 54;
    RROWS.forEach((row, i) => {
      const gx = gx0 + (i % 2) * (gw + 18), gy = y + 20 + Math.floor(i / 3 === 0 ? 0 : 0) + Math.floor(i / 2) * (gh + 26), va = U.seriesVals(row, a), vb = U.seriesVals(row, b);
      let lo = Infinity, hi = -Infinity; [va, vb].forEach(q => q.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } })); if (!isFinite(lo)) { lo = 0; hi = 1; } lo = Math.min(0, lo); hi = hi + (hi - lo) * 0.06 + 1e-9;
      const X = k => gx + gw * k / (N - 1), Y = v => gy + gh - (v - lo) / (hi - lo) * gh;
      U.regimeShade().forEach(s => { ctx.fillStyle = s[2]; ctx.globalAlpha = 0.55; ctx.fillRect(X(s[0]), gy, X(s[1]) - X(s[0]), gh); ctx.globalAlpha = 1; });
      ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(gx, gy + gh + 0.5); ctx.lineTo(gx + gw, gy + gh + 0.5); ctx.moveTo(gx, gy + 0.5); ctx.lineTo(gx + gw, gy + 0.5); ctx.stroke();
      [[va, '#1B1F23'], [vb, '#D93025']].forEach(([q, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = 0; k < N; k++) { k ? ctx.lineTo(X(k), Y(q[k])) : ctx.moveTo(X(k), Y(q[k])); } ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(d), Y(q[d]), 3, 0, 7); ctx.fill(); });
      ctx.strokeStyle = '#2E7DE8'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d) + 0.5, gy); ctx.lineTo(X(d) + 0.5, gy + gh); ctx.stroke(); ctx.setLineDash([]);
      const dp = hi - lo < 5 ? 2 : (hi - lo < 50 ? 1 : 0); T(row.t + (row.u ? ' (' + row.u + ')' : ''), gx, gy - 5, { s: 9, b: true }); T(fmt(va[d], dp) + ' / ' + fmt(vb[d], dp), gx + gw, gy - 5, { s: 9, b: true, a: 'right' });
      T(fmt(hi, dp), gx - 3, gy + 8, { s: 7.5, c: MUTE, a: 'right' }); T(fmt(lo, dp), gx - 3, gy + gh, { s: 7.5, c: MUTE, a: 'right' });
      scrub(gx, gy, gw, gh, gx, gw);
    });
    const yb = y + 20 + 3 * (gh + 26) + 4; T('days after emergence: 0 to ' + (N - 1) + ' · click or drag on any chart to move the day', gx0, yb, { s: 8.5, c: MUTE });
    y = Math.max(top + hh + 82, yb + 10);
    const rootsNow = 'On day ' + d + ' the ' + RN() + ' plant has ' + fmt(a.Lroot[d] / 100, 1) + ' m of root to ' + fmt(a.Rdepth[d]) + ' cm and the drought plant ' + fmt(b.Lroot[d] / 100, 1) + ' m to ' + fmt(b.Rdepth[d]) + ' cm. The root grows by ' + fmt(a.dL[d]) + ' and ' + fmt(b.dL[d]) + ' cm per day, with ' + fmt(a.fr[d] * 100) + ' and ' + fmt(b.fr[d] * 100) + ' % of the new carbon, so the shoot measurements of the same day (shoot area ' + fmt(a.PSA[d]) + ' and ' + fmt(b.PSA[d]) + ' cm², canopy temperature depression ' + fmt(a.CTD[d], 1) + ' and ' + fmt(b.CTD[d], 1) + ' K) can be read against the roots of that day.';
    const n = note(rootsNow, cx + 12, y, w - 24); y += n * 12.5 + 10; endFrame(cx, y0, y, w); return y + 10;
  }

  // ================================================================== phenotype and genotype: the presets run under this experiment, and the genotype called from the plant (or from your measurements)
  const GKEYS = [['H', r => r.H[N - 1]], ['PSA', r => Math.max(...r.PSA)], ['grain', r => r.Wg[N - 1]], ['D95', r => r.D95[N - 1]], ['L', r => r.Lroot[N - 1] / 100], ['WUE', r => r.Wg[N - 1] / Math.max(1, r.totals.T + r.totals.Es) * 10]];
  const presetGeno = i => { const sp = P.SP[PH.sp], g = Object.assign({}, P.GENO[i]); g.psi50 = sp.psi50 + g.dpsi + PH.ovr.dpsi; g.dpsi = g.psi50 - sp.psi50; g.rue = (g.rue || 1) * PH.ovr.rue; g.SG = clamp(g.SG + PH.ovr.sg, 0, 0.95); return g; };
  const SIG = [['PSA', r => r.PSA, 1], ['SI', r => r.SI, 1], ['RWC', r => r.RWC, 100], ['CTD', r => r.CTD, 1], ['H', r => r.H, 1]];
  const sigDays = []; for (let k = 18; k < N; k += 6) sigDays.push(k);
  function sigOf(res) { const o = {}; SIG.forEach(q => { const v = q[1](res); o[q[0]] = sigDays.map(k => v[k] * q[2]); }); return o; }
  function gcStep() {
    const k = keyOf(), G = PH.gen; if (G && G.key === k && G.i >= P.GENO.length) return; if (!G || G.key !== k) { if (PH.dragging) return; PH.gen = { key: k, i: 0, items: [] }; return; }
    const i = G.i, g = presetGeno(i);
    try { const a = P.run(Object.assign(cfgFor('ww', false), { geno: g })), b = P.run(Object.assign(cfgFor('dr', false), { geno: g })); G.items.push({ id: P.GENO[i].id, name: P.GENO[i].name, g, a, b, sig: sigOf(b) }); } catch (e) { G.items.push({ id: P.GENO[i].id, name: P.GENO[i].name, g, err: e.message }); }
    G.i++;
  }
  function target() {   // the plant to be called: the loaded measurements, else the drought plant of the layer
    if (PH.obs) { const o = {}; ['PSA:area', 'SI:senescence', 'RWC:rwc', 'CTD:ctd', 'H:height'].forEach(s => { const [k, c] = s.split(':'); if (PH.obs.cols.includes(c)) o[k] = PH.obs.rows.filter(r => r.trt === 'dr' && isFinite(r[c])).map(r => [Math.round(r.day), c === 'rwc' ? r[c] : r[c]]); }); return { src: 'your measurements', obs: o }; }
    return { src: 'the drought plant of the layer (its genotype hidden)', sig: sigOf(R('dr')) };
  }
  function distance(item, T0) {
    let s = 0, n = 0;
    if (T0.sig) SIG.forEach(q => { const t = T0.sig[q[0]], p = item.sig[q[0]]; const sd = Math.max(1e-6, Math.sqrt(sum(t.map(v => (v - sum(t) / t.length) ** 2)) / t.length), 0.03 * Math.abs(sum(t) / t.length)); t.forEach((v, j) => { s += ((p[j] - v) / sd) ** 2; n++; }); });
    else Object.keys(T0.obs).forEach(k => { const q = SIG.find(z => z[0] === k), arr = T0.obs[k]; if (!arr.length) return; const mu = sum(arr.map(z => z[1])) / arr.length, sd = Math.max(1e-6, Math.sqrt(sum(arr.map(z => (z[1] - mu) ** 2)) / arr.length), 0.05 * Math.abs(mu)), pv = q[1](item.b); arr.forEach(z => { s += ((pv[clamp(z[0], 0, N - 1)] * q[2] - z[1]) / sd) ** 2; n++; }); });
    return n ? s / n : NaN;
  }
  function drawGenome(y) {
    const w = W - 32, cx = 16, y0 = y; frameH(cx, y, w, 'Phenotype and genotype: prediction', 'each genotype of the library run in this experiment, and the genotype called from the plant above ground'); y += 30;
    gcStep(); const G = PH.gen, items = G ? G.items.filter(i => i.b) : [];
    if (!G || G.i < P.GENO.length) { ctx.fillStyle = '#EFEDE5'; ctx.fillRect(cx + 10, y, w - 20, 16); ctx.fillStyle = '#2E9E4F'; ctx.fillRect(cx + 10, y, (w - 20) * (G ? G.i / P.GENO.length : 0), 16); T('running the genotypes: ' + (G ? G.i : 0) + ' of ' + P.GENO.length, cx + 16, y + 12, { s: 9.5 }); y += 24; }
    if (items.length) {
      T('1. Predicted phenotype of each genotype (left plant ' + RN() + ', right drought)', cx + 10, y + 8, { s: 9.5, b: true }); y += 16;
      const cols = [cx + 12, cx + 205, cx + 265, cx + 330, cx + 390, cx + 450, cx + 515, cx + 572]; ['genotype', 'height cm', 'shoot cm²', 'grain g/m²', 'D95 cm', 'roots m', 'WUE g/kg', 'tolerance'].forEach((h, k) => T(h, cols[k], y + 8, { s: 8.5, b: true, c: MUTE, a: k ? 'right' : 'left' })); y += 13;
      const rows = items.map(it => ({ it, grainA: it.a.Wg[N - 1], grainB: it.b.Wg[N - 1] })); const mxg = Math.max(...rows.map(r => r.grainA), 1);
      rows.forEach((r, i) => {
        if (i % 2) { ctx.fillStyle = '#F6F4EE'; ctx.fillRect(cx + 6, y - 1, w - 12, 15); } const cur = r.it.id === PH.gid; T(r.it.name + (cur ? ' (chosen)' : ''), cols[0], y + 10, { s: 9.5, b: cur });
        const vv = [GKEYS[0][1](r.it.b), GKEYS[1][1](r.it.b), r.grainB, GKEYS[3][1](r.it.b), GKEYS[4][1](r.it.b), GKEYS[5][1](r.it.b)], dp = [0, 0, 0, 0, 0, 2]; vv.forEach((v, k) => T(fmt(v, dp[k]), cols[k + 1], y + 10, { s: 9.5, c: k === 2 ? '#D93025' : '#1B1F23', b: k === 2, a: 'right' }));
        const tol = r.grainA > 0 ? r.grainB / r.grainA : NaN; T(isFinite(tol) ? fmt(tol, 2) : 'n/a', cols[7], y + 10, { s: 9.5, b: true, a: 'right' }); y += 15;
      });
      y += 4; const best = rows.slice().sort((p, q) => q.grainB - p.grainB)[0], deep = rows.slice().sort((p, q) => q.it.b.D95[N - 1] - p.it.b.D95[N - 1])[0];
      y += note('Under this drought the genotype with the most grain is ' + best.it.name.toLowerCase() + ' (' + fmt(best.grainB) + ' g/m²), and the deepest roots (D95 ' + fmt(deep.it.b.D95[N - 1]) + ' cm) belong to ' + deep.it.name.toLowerCase() + '. Tolerance is the grain under drought divided by the grain of the left plant.', cx + 12, y + 6, w - 24) * 12.5 + 14;
      // the genotype called
      if (G.i >= P.GENO.length) {
        const T0 = target(), sc = items.map(it => ({ it, d: distance(it, T0) })).filter(q => isFinite(q.d)), mn = Math.min(...sc.map(q => q.d)); const tau = 0.03 + 0.25 * mn; sc.forEach(q => { q.p = Math.exp(-(q.d - mn) / tau); }); const sp = sum(sc.map(q => q.p)); sc.forEach(q => { q.p /= sp; }); sc.sort((p, q) => q.p - p.p);
        T('2. Genotype called from ' + T0.src, cx + 10, y + 8, { s: 9.5, b: true }); y += 18;
        sc.forEach((q, i) => { const bw = (w - 220) * q.p; ctx.fillStyle = i === 0 ? '#2E7D32' : '#9AA7B5'; ctx.fillRect(cx + 150, y + 1, Math.max(1, bw), 11); T(q.it.name, cx + 12, y + 10, { s: 9.5, b: i === 0 }); T(fmt(q.p * 100) + ' %', cx + 154 + bw, y + 10, { s: 9, c: MUTE }); y += 15; });
        y += 8; const top = sc[0], g = top.it.g; y += 4;
        y += note('Called: ' + top.it.name.toLowerCase() + ' (' + fmt(top.p * 100) + ' % of the weight; the distance is the mean squared difference of five traits in units of their spread over the season, ' + fmt(top.d, 2) + '). Its genetic constants: root angle ' + g.angle + ' degrees, lateral density ×' + g.lat + ', stay-green ' + g.SG.toFixed(2) + ', stomata close at ' + g.psi50.toFixed(2) + ' MPa, osmotic adjustment ' + g.OA.toFixed(2) + ' MPa, carbon to roots ×' + g.rootC + '. Predicted below ground for that genotype: roots to ' + fmt(top.it.b.D95[N - 1]) + ' cm (D95), ' + fmt(top.it.b.Lroot[N - 1] / 100) + ' m of root length and ' + fmt(top.it.b.Wg[N - 1]) + ' g/m² of grain under this drought.', cx + 12, y, w - 24) * 12.5 + 8;
        if (!PH.obs) y += note('Without measurements the layer treats the drought plant as an unknown and tests whether the shoot traits alone identify its genotype. Load measurements (day, treatment dr and any of height, area, senescence, rwc, ctd) in the section Your measurements and the call is made from them.', cx + 12, y, w - 24, { c: '#4B5563' }) * 12.5 + 8;
      }
    }
    endFrame(cx, y0, y, w); return y + 10;
  }
  // sections: the roots of the day after the twin view, the prediction after the genotype panel
  const it = BASE.findIndex(q => q.id === 'twin'); BASE.splice(it + 1, 0, { id: 'rootday', t: 'Roots day by day', s: 'the profile of the day and the roots through the season', fn: drawRootDay });
  const ia = SECTIONS.findIndex(q => q.id === 'above'); SECTIONS.splice(ia + 1, 0, { id: 'genome', t: 'Phenotype and genotype: prediction', s: 'each genotype of the library in this experiment, and the genotype called from the plant', fn: drawGenome });
})();
