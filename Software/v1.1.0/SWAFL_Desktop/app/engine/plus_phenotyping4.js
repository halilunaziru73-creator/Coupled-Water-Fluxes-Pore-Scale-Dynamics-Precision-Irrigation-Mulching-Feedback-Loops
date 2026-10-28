/* SWAFL 1.1 layer P1 Deterministic phenotyping (part 4): the drought outlook from the date of the toolbar.
   The plant is grown from sowing to the date on the weather that was recorded (or imported), then to maturity on the days of the forecast
   and on three futures made of years of the weather record (dry, typical, wet). Everything is computed by the model of plus_phenomodel.js. */
'use strict';
(function () {
  const U = window.PHUI; if (!U) return;
  const { BASE, PH, P, K, chip, mix, dateOf, N, cfgFor, envObj, keyOf, SECTIONS, sowDoy } = U;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, TF = K.TF, GRID = '#E6E2D6';
  const note = (txt, x, y, w, o) => sidWrap(txt, x, y, w, Object.assign({ s: 9.5, c: MUTE }, o || {}), 12.5);
  const endFrame = (x, y0, y, w) => { ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y0 + 0.5, w - 1, y - y0); };
  const DAY = 864e5, MONn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fdate = ms => { const d = new Date(ms); return d.getUTCDate() + ' ' + MONn[d.getUTCMonth()] + (d.getUTCFullYear() !== new Date(OUT.today).getUTCFullYear() ? ' ' + d.getUTCFullYear() : ''); };
  const SCN = [{ k: 'dry', t: 'Dry future', c: '#D93025' }, { k: 'typ', t: 'Typical future', c: '#2E7DE8' }, { k: 'wet', t: 'Wet future', c: '#2E8B57' }];
  const OUT = { today: Date.UTC(2026, 0, 1) };
  let CACHE = null;

  // ---------------------------------------------------------------- the date of the toolbar and the season it falls in
  function toolbarDate() {
    let v = ''; try { const e = document.getElementById('dssDate'); v = e && e.value; } catch (e) { }
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
    const t = new Date(); return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  }
  function season(D) {
    const sow = sowDoy(), y = new Date(D).getUTCFullYear(), st = yy => Date.UTC(yy, 0, 1) + sow * DAY;
    let Y = y; if (D < st(y) && D - st(y - 1) < N * DAY && D >= st(y - 1)) Y = y - 1;
    const start = st(Y), idx = Math.floor((D - start) / DAY);
    return { Y, start, idx, state: idx < 0 ? 'before' : (idx >= N ? 'after' : 'during') };
  }
  const jOf = ms => { const d = new Date(ms), y = d.getUTCFullYear(); let k = Math.round((ms - Date.UTC(y, 0, 1)) / DAY); const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; if (leap && k >= 59) k = k === 59 ? 58 : k - 1; return clamp(k, 0, 364); };

  // ---------------------------------------------------------------- the weather of the three futures
  function sources() {
    const W0 = window.WXD && window.WXD.on && window.WXD.rows && window.WXD.rows.length ? window.WXD : null;
    return W0;
  }
  function assemble(S, D) {
    const W0 = sources(), kinds = new Array(N).fill('model'), P_ = new Array(N), E_ = new Array(N), T_ = new Array(N);
    const out = { src: W0 ? (W0.src === 'online' ? 'online weather of ' + W0.name : 'weather file ' + W0.name) : 'the model weather of the project climate', nObs: 0, nFc: 0, nScn: 0, years: [], base: null };
    const baseW = P.weather(envObj(true), N); out.base = baseW;
    const byDay = new Map(); if (W0) W0.rows.forEach(r => byDay.set(r.d.getTime(), r));
    const lastRow = W0 ? W0.rows[W0.rows.length - 1].d.getTime() : 0;
    const given = new Array(N).fill(null);
    for (let k = 0; k < N; k++) { const ms = S.start + k * DAY, r = byDay.get(ms); if (r) given[k] = r; }
    // the future days that have no record: ranked analogue years of the weather in use
    const first = clamp(S.idx + 1, 0, N), fut = []; for (let k = first; k < N; k++) if (!given[k]) fut.push(k);
    let rank = null;
    if (W0 && W0.P && W0.years) { const NY = W0.years.length; const sums = []; for (let i = 0; i < NY; i++) { let s = 0; fut.forEach(k => { s += W0.P[i * 365 + jOf(S.start + k * DAY)] || 0; }); sums.push(s); }
      const ord = sums.map((v, i) => i).sort((a, b) => sums[a] - sums[b]); rank = { dry: ord[0], typ: ord[Math.floor(NY / 2)], wet: ord[NY - 1], sums, years: W0.years }; out.years = rank; }
    out.rank = rank;
    const fcMs = W0 && W0.fcStart != null ? W0.fcStart : null;
    const mk = key => {
      const f = { dry: 0.4, typ: 1, wet: 1.6 }[key], fe = { dry: 1.08, typ: 1, wet: 0.95 }[key];
      const rP = new Array(N), rE = new Array(N), rT = new Array(N), kd = new Array(N);
      for (let k = 0; k < N; k++) {
        const ms = S.start + k * DAY, r = given[k], j = jOf(ms), pastDay = ms <= D;
        let p = NaN, e = NaN, t = NaN, kind = 'scn';
        if (r) { p = r.P; e = r.ET0; t = isFinite(r.tmean) ? r.tmean : (isFinite(r.tmax) && isFinite(r.tmin) ? (r.tmax + r.tmin) / 2 : NaN); kind = pastDay ? 'obs' : 'fc'; }
        if (!isFinite(p) || !isFinite(e) || !isFinite(t)) {
          if (W0 && rank) { const i = pastDay ? rank.typ : rank[key]; if (!isFinite(p)) p = W0.P[i * 365 + j] || 0; if (!isFinite(e)) e = W0.ET0 ? W0.ET0[i * 365 + j] : NaN; if (!isFinite(t)) t = W0.Tclim ? W0.Tclim[j] : NaN; if (kind === 'scn' && pastDay) kind = 'fill'; }
          else { const q = baseW[k]; if (!isFinite(p)) p = q.P * (pastDay ? 1 : f); if (!isFinite(e)) e = q.et0 * (pastDay ? 1 : fe); if (!isFinite(t)) t = q.Tmean; if (kind === 'scn' && pastDay) kind = 'fill'; }
        }
        rP[k] = isFinite(p) ? p : 0; rE[k] = isFinite(e) ? e : null; rT[k] = isFinite(t) ? t : null; kd[k] = kind;
      }
      return { P: rP, E: rE, T: rT, kind: kd };
    };
    out.scn = { dry: mk('dry'), typ: mk('typ'), wet: mk('wet') };
    const kd = out.scn.typ.kind; out.nObs = kd.filter(x => x === 'obs').length; out.nFc = kd.filter(x => x === 'fc').length; out.nScn = kd.filter(x => x === 'scn').length; out.nFill = kd.filter(x => x === 'fill').length;
    return out;
  }
  function envFor(sc, S) {
    const e = Object.assign({}, envObj(true)), hasE = sc.E.every(v => v != null);
    e.realRain = sc.P; e.rainMode = 'project'; e.rainMult = 1; e.realT = sc.T.every(v => v != null) ? sc.T : null; e.realET0 = hasE ? sc.E : null; e.sow = sowDoy();
    if (window.WXD && window.WXD.on) e.dT = PH.xw;       // the imported days are the weather: only the warming set in the layer is added
    return e;
  }

  // water of the root zone: the layers the roots have reached, each weighted by the part of it that is reached (FAO-56, Allen et al., 1998)
  const PDEP = { maize: 0.55, sorghum: 0.55, wheat: 0.55, bean: 0.45 };
  const pFrac = () => PDEP[PH.sp] || 0.55;
  function rootZone(r, k) { const zr = Math.max(U.DZ * 0.5, r.Rdepth[k]); let taw = 0, av = 0; for (let i = 0; i < U.NL; i++) { const f = clamp((zr - i * U.DZ) / U.DZ, 0, 1); taw += f; av += f * r.w[k * U.NL + i]; } return taw > 0 ? av / taw : 1; }
  const ksFao = a => clamp(a / (1 - pFrac()), 0, 1);
  // a seven day mean of the ratio of transpiration to potential transpiration
  function smoothKs(r, k) { let s = 0, n = 0; for (let j = Math.max(0, k - 3); j <= Math.min(N - 1, k + 3); j++) { s += r.Ks[j]; n++; } return s / n; }

  // ---------------------------------------------------------------- the runs and their readings
  function compute() {
    const D = toolbarDate(), S = season(D), W0 = sources();
    const key = keyOf() + '|' + D + '|' + (W0 ? W0.key + '|' + W0.rows.length : 'model');
    if (CACHE && CACHE.key === key) return CACHE;
    const t0 = performance.now(), A = assemble(S, D), res = { key, D, S, A, runs: {} };
    OUT.today = D;
    SCN.forEach(s => {
      const sc = A.scn[s.k], env = envFor(sc, S), Wt = P.weather(env, N);
      const rf = P.run(Object.assign(cfgFor('rf', false), { env, weather: Wt })), pj = P.run(Object.assign(cfgFor('pj', false), { env, weather: Wt }));
      const bench = s.k === 'typ' ? P.run(Object.assign(cfgFor('bench', false), { env, weather: Wt })) : null;
      res.runs[s.k] = { rf, pj, bench, Wt };
    });
    res.bench = res.runs.typ.bench;
    const ti = clamp(S.idx, 0, N - 1), Yb = Math.max(1e-6, res.bench.Wg[N - 1]);
    res.sum = {};
    SCN.forEach(s => {
      const r = res.runs[s.k], rf = r.rf, pj = r.pj, a = Math.max(0, S.idx + 1), sc = A.scn[s.k];
      let sd = 0, first = -1, lo = 1, rain = 0, et0 = 0; for (let k = a; k < N; k++) { const av = rootZone(rf, k); if (av < 1 - pFrac()) { sd++; if (first < 0) first = k; } lo = Math.min(lo, av); rain += sc.P[k]; et0 += r.Wt[k].et0; }
      let ne = -1, nm = 0, nev = 0, nw = 0; for (let k = a; k < N; k++) if (pj.Ig[k] > 0) { nev++; nw += pj.Ig[k]; if (ne < 0) { ne = k; nm = pj.Ig[k]; } }
      let s14 = 0, e14 = 0; for (let k = a; k < Math.min(N, a + 14); k++) { s14 += sc.P[k]; e14 += r.Wt[k].et0; }
      const yrel = rf.Wg[N - 1] / Math.max(1e-6, pj.Wg[N - 1]);
      res.sum[s.k] = { stressDays: sd, firstStress: first, lowest: lo, rain, et0, ne, nm, nev, nw, p14: s14, e14, yRf: rf.Wg[N - 1], yPj: pj.Wg[N - 1], yrel, risk: yrel >= 0.9 ? 'low' : yrel >= 0.75 ? 'moderate' : yrel >= 0.5 ? 'high' : 'severe' };
    });
    res.ti = ti; res.ms = performance.now() - t0; CACHE = res; return res;
  }

  // ---------------------------------------------------------------- drawing
  function drawOutlook(y) {
    const w = W - 32, cx = 16, y0 = y; K.frame(cx, y, w, 24, 'Drought outlook from the date of the toolbar', 'the season to the date, then three futures'); y += 30;
    let R; try { R = compute(); } catch (e) { T('The outlook could not be computed: ' + e, cx + 12, y + 10, { s: 9.5, c: '#B3261E' }); console.error(e); endFrame(cx, y0, y + 24, w); return y + 34; }
    const S = R.S, A = R.A, ti = clamp(S.idx, 0, N - 1), when = fdate(R.D);
    const stTxt = S.state === 'before' ? 'The crop is not yet sown on this date; the whole season is a forecast.' : S.state === 'after' ? 'The season of this crop is over on this date; the whole season is a record.' : 'Day ' + S.idx + ' after emergence.';
    T('Date of the toolbar: ' + when + ' ' + new Date(R.D).getUTCFullYear() + '. ' + stTxt, cx + 12, y + 8, { s: 9.5, b: true }); y += 22;
    const srcTxt = !sources() ? 'Weather: the model weather of the project climate (no weather file or online weather is imported, so there are no recorded days and no forecast): ' + (S.idx + 1 > 0 ? Math.min(N, S.idx + 1) : 0) + ' days to the date, then the three futures with 0.4, 1 and 1.6 times the rain. Import a weather file or the online weather of the farm (Tools) to use the record and the forecast. Sown ' + dateOf(0) + '.' :
      'Weather: ' + A.src + '. Days of the season: ' + A.nObs + ' recorded' + (A.nFill ? ' (' + A.nFill + ' filled from a typical year)' : '') + ', ' + A.nFc + ' of forecast, ' + A.nScn + ' of the three futures' + (A.rank ? ' (years ' + A.rank.years[A.rank.dry] + ', ' + A.rank.years[A.rank.typ] + ' and ' + A.rank.years[A.rank.wet] + ' of the record: the driest, the median and the wettest rain of those days).' : '.') + ' Sown ' + dateOf(0) + '.';
    y += note(srcTxt, cx + 12, y, w - 24) * 12.5 + 4;
    let xx = cx + 12; xx += chip(xx, y, 'Show this date in the plant', false, () => { play.t = ti / (N - 1); play.on = false; }, 'moves the day of every section to the date of the toolbar'); xx += chip(xx, y, 'Start the drought pulse on this date', false, () => { PH.dr.onset = clamp(Math.max(10, ti), 10, 110); PH.dr.type = 'pulse'; }, 'the held-water drought of the layer begins on the date of the toolbar'); y += 28;
    // charts
    const gh = 96, gw = (w - 24 - 36) / 3, gy = y + 22, defs = [
      { t: 'Root zone water (% available)', f: (r, k) => rootZone(r.rf, k) * 100, lo: 0, hi: 100, dp: 0, ref: (1 - pFrac()) * 100, rl: 'stress below ' + Math.round((1 - pFrac()) * 100) },
      { t: 'Plant response (T / Tp, 7 d)', f: (r, k) => smoothKs(r.rf, k), lo: 0, hi: 1.05, dp: 2, ref: 0.8, rl: 'stress below 0.8' },
      { t: 'Rain from today (mm)', f: null, lo: 0, hi: 0, dp: 0 }];
    defs.forEach((d, i) => {
      const gx = cx + 12 + i * (gw + 18), X = k => gx + gw * k / (N - 1); let lo = d.lo, hi = d.hi, rs = null;
      if (!d.f) { rs = SCN.map(s => { let c = 0; return A.scn[s.k].P.map((p, k) => (k > ti ? (c += p) : 0)); }); hi = K.nice(Math.max(1, ...rs.map(q => q[N - 1])) * 1.05); }
      const Y = v => gy + gh - (v - lo) / (hi - lo) * gh;
      ctx.fillStyle = '#EEF3FA'; const f0 = clamp(ti + 1, 0, N - 1); let fe = f0; for (let k = f0; k < N; k++) if (A.scn.typ.kind[k] === 'fc') fe = k; if (fe > f0) { ctx.fillRect(X(f0), gy, X(fe) - X(f0), gh); }
      ctx.strokeStyle = GRID; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy + gh + 0.5); ctx.lineTo(gx + gw, gy + gh + 0.5); ctx.moveTo(gx, gy + 0.5); ctx.lineTo(gx + gw, gy + 0.5); ctx.stroke();
      if (d.ref) { ctx.strokeStyle = '#B8743A'; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(gx, Y(d.ref) + 0.5); ctx.lineTo(gx + gw, Y(d.ref) + 0.5); ctx.stroke(); ctx.setLineDash([]); T(d.rl, gx + 2, Y(d.ref) + 9, { s: 7.5, c: '#B8743A' }); }
      if (d.f) {
        ctx.strokeStyle = '#1B1F23'; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = 0; k <= Math.min(ti, N - 1); k++) { const v = d.f(R.runs.typ, k); k ? ctx.lineTo(X(k), Y(v)) : ctx.moveTo(X(k), Y(v)); } ctx.stroke();
        SCN.forEach(s => { ctx.strokeStyle = s.c; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = Math.max(0, ti); k < N; k++) { const v = d.f(R.runs[s.k], k); k === Math.max(0, ti) ? ctx.moveTo(X(k), Y(v)) : ctx.lineTo(X(k), Y(v)); } ctx.stroke(); });
      } else { SCN.forEach((s, i2) => { ctx.strokeStyle = s.c; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = Math.max(0, ti); k < N; k++) { k === Math.max(0, ti) ? ctx.moveTo(X(k), Y(rs[i2][k])) : ctx.lineTo(X(k), Y(rs[i2][k])); } ctx.stroke(); }); }
      ctx.strokeStyle = '#1B1F23'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(ti) + 0.5, gy); ctx.lineTo(X(ti) + 0.5, gy + gh); ctx.stroke(); ctx.setLineDash([]);
      T(d.t, gx, gy - 6, { s: 9, b: true }); T(fmt(hi, d.dp), gx - 3, gy + 8, { s: 7.5, c: MUTE, a: 'right' }); T(fmt(lo, d.dp), gx - 3, gy + gh, { s: 7.5, c: MUTE, a: 'right' });
      T(dateOf(0), gx, gy + gh + 11, { s: 7.5, c: MUTE }); T(dateOf(N - 1), gx + gw, gy + gh + 11, { s: 7.5, c: MUTE, a: 'right' }); T('today', X(ti) + 3, gy + gh + 11, { s: 7.5, b: true });
      U.scrub(gx, gy, gw, gh, gx, gw);
    });
    y = gy + gh + 22; K.legend([['#1B1F23', 'the season to the date'], ['#D93025', 'dry future'], ['#2E7DE8', 'typical future'], ['#2E8B57', 'wet future'], ['#DDE7F3', 'days of the forecast']], cx + 12, y); y += 12;
    // table
    const cols = [0, 0.2, 0.33, 0.45, 0.57, 0.68, 0.8, 0.9].map(f => cx + 12 + (w - 24) * f);
    ['future', 'rain mm', 'next 14 d', 'stress days', 'lowest %', 'grain g/m²', 'vs irrig.', 'risk'].forEach((h, k) => T(h, cols[k] + (k ? 0 : 0), y + 8, { s: 8.5, b: true }));
    y += 14; ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(cx + 12, y + 0.5); ctx.lineTo(cx + w - 12, y + 0.5); ctx.stroke(); y += 4;
    const rc = { low: '#1E8E3E', moderate: '#B8860B', high: '#D9622B', severe: '#B3261E' };
    SCN.forEach(s => { const m = R.sum[s.k]; ctx.fillStyle = s.c; ctx.fillRect(cols[0], y + 2, 8, 8); T(s.t, cols[0] + 13, y + 10, { s: 9.5, b: true });
      [fmt(m.rain), fmt(m.p14), String(m.stressDays), fmt(m.lowest * 100), fmt(m.yRf), fmt(m.yrel, 2)].forEach((v, k) => T(v, cols[k + 1], y + 10, { s: 9.5 })); T(m.risk, cols[7], y + 10, { s: 9.5, b: true, c: rc[m.risk] }); y += 15; });
    y += 4; y += note('Rainfed plant: rain to maturity, rain in the next 14 days, days with the root zone below the stress level, lowest root zone water, grain, share of the grain of the irrigated plant, risk.', cx + 12, y + 4, w - 24, { s: 8.5 }) * 12.5 + 10; T('Project irrigation under the same weather', cx + 12, y + 8, { s: 9.5, b: true }); y += 14;
    ['future', 'next watering', 'mm', 'waterings', 'water mm', 'grain g/m²', 'vs watered'].forEach((h, k) => T(h, cols[k], y + 8, { s: 8.5, b: true })); y += 14; ctx.beginPath(); ctx.moveTo(cx + 12, y + 0.5); ctx.lineTo(cx + w - 12, y + 0.5); ctx.stroke(); y += 4;
    SCN.forEach(s => { const m = R.sum[s.k]; ctx.fillStyle = s.c; ctx.fillRect(cols[0], y + 2, 8, 8); T(s.t, cols[0] + 13, y + 10, { s: 9.5, b: true });
      [m.ne >= 0 ? fdate(S.start + m.ne * DAY) : 'none', m.ne >= 0 ? fmt(m.nm) : '', String(m.nev), fmt(m.nw), fmt(m.yPj), fmt(m.yPj / Math.max(1e-6, R.bench.Wg[N - 1]), 2)].forEach((v, k) => T(v, cols[k + 1], y + 10, { s: 9.5 })); y += 15; });
    y += 6;
    const d = R.sum.dry, t = R.sum.typ, wt = R.sum.wet, bg = R.bench.Wg[N - 1];
    const txt = 'Reading: a plant held well watered would make ' + fmt(bg) + ' g/m² of grain on the typical weather, and the plant irrigated by the rule of the project ' + fmt(t.yPj) + ' g/m². Left to the rain, the plant makes ' + fmt(t.yRf) + ' g/m² (' + fmt(t.yrel * 100) + ' % of the irrigated plant of the same weather) on the typical future, ' + fmt(d.yRf) + ' g/m² (' + fmt(d.yrel * 100) + ' %) on the dry one and ' + fmt(wt.yRf) + ' g/m² (' + fmt(wt.yrel * 100) + ' %) on the wet one. ' +
      (S.state === 'after' ? 'The season is over, so the three futures are the same.' : (d.firstStress >= 0 ? 'On the dry future the root zone first falls below the stress level of ' + Math.round((1 - pFrac()) * 100) + ' % of its available water on ' + fdate(S.start + d.firstStress * DAY) + ' (readily available water of FAO-56). ' : 'The root zone stays above the stress level on the dry future. ') + 'In the next 14 days the weather in use brings ' + fmt(t.p14) + ' mm of rain against ' + fmt(t.e14) + ' mm of reference evapotranspiration. ') +
      (t.ne >= 0 ? 'The sensor rule of the project (' + (projTxt()) + ') would water next on ' + fdate(S.start + t.ne * DAY) + ' with ' + fmt(t.nm) + ' mm on the typical future.' : 'The sensor rule of the project would not water on the typical future.') +
      ' Risk classes by the share of the irrigated grain that the rain alone gives: low 90 % or more, moderate 75 to 90 %, high 50 to 75 %, severe below 50 %. The futures are real years of the record, not a forecast of the season beyond the days of the forecast. The grain depends on the root conductance of the model: use the fit to the SWAFL data first.';
    y += note(txt, cx + 12, y, w - 24) * 12.5 + 8; endFrame(cx, y0, y, w); return y + 10;
  }
  function projTxt() { try { const q = U.projObj(); return q.irr.method + ', trigger ' + Math.round(q.irr.trig) + ' cm, sensor ' + q.irr.z + ' cm'; } catch (e) { return 'the Properties panel'; } }

  const ie = SECTIONS.findIndex(q => q.id === 'data'); SECTIONS.splice(ie < 0 ? SECTIONS.length : ie, 0, { id: 'outlook', t: 'Drought outlook from the date of the toolbar', s: 'the season to the date, then a dry, a typical and a wet future', fn: drawOutlook });
  U.outlook = { compute, toolbarDate, season };
})();
