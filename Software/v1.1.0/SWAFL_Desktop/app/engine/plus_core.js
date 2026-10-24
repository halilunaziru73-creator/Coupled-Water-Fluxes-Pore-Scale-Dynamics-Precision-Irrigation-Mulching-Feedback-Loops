/* SWAFL 1.1 core additions, loaded after the engine:
   1. every view grows to fit what it draws, so nothing is cut off when scrolling;
   2. F1 opens the manual;
   3. the crop library: crop calendar, canopy, roots and drawing for every crop, and the transfer of the Daisy
      simulations (cereal rotation) to the chosen crop with an FAO-56 crop-coefficient water balance;
   4. a daily FAO-56 root-zone water balance (CWB) shared by the crop, reliability and farm views. */
'use strict';
(function () {
  const LIB = window.CROPLIB; if (!LIB || typeof SCENES === 'undefined') return;

  // ------------------------------------------------------------------ 1. views grow to fit their drawing
  const C2 = CanvasRenderingContext2D.prototype, FIT = { on: false, max: 0, who: "" }; window.__FIT = FIT;
  const yOf = (c, x, y) => { const m = c.getTransform(); return (m.b * x + m.d * y + m.f) / (window.__SS || 1); };
  const track = (name, ys) => { const o = C2[name]; C2[name] = function () { if (FIT.on && this.canvas === canvas) { const v = ys(this, arguments); if (v > FIT.max) { FIT.max = v; FIT.who = name + " " + Array.from(arguments).slice(1, 5).map(a => typeof a === "number" ? Math.round(a) : typeof a).join(","); } } return o.apply(this, arguments); }; };
  track('fillText', (c, a) => yOf(c, a[1], a[2]) + 6);
  const bg = (c, a) => (a[1] + a[3] >= c.canvas.height - 2) || (a[3] >= c.canvas.height * 0.8);     // a background filling the canvas is not content
  track('fillRect', (c, a) => bg(c, a) ? -1 : yOf(c, a[0], a[1] + a[3]));
  track('strokeRect', (c, a) => bg(c, a) ? -1 : yOf(c, a[0], a[1] + a[3]));
  track('rect', (c, a) => bg(c, a) ? -1 : yOf(c, a[0], a[1] + a[3]));
  track('drawImage', (c, a) => a.length >= 5 ? yOf(c, a.length >= 9 ? a[5] : a[1], (a.length >= 9 ? a[6] + a[8] : a[2] + a[4])) : yOf(c, a[1], a[2] + (a[0].height || 0)));
  track('arc', (c, a) => yOf(c, a[0], a[1] + a[2]));
  track('lineTo', (c, a) => yOf(c, a[0], a[1]));
  let fitFrame = 0;
  const wrapDraw = sc => {
    if (!sc || sc._fitWrapped || typeof sc.draw !== 'function' || ['sid', 'drip', 'spr', 'v7'].includes(sc.id)) return; const od = sc.draw; sc._fitWrapped = true;   // the design views size themselves
    sc.draw = function () {
      const measure = (fitFrame++ % 20) === 0 && canvas.height < 9000;
      if (measure) { FIT.on = true; FIT.max = 0; }
      try { return od.apply(this, arguments); }
      finally {
        if (measure) {
          FIT.on = false;
          const need = Math.ceil(FIT.max + 28);
          if (sc._h0 == null) sc._h0 = sc.h || 640;
          const want = Math.max(sc._h0 > 900 ? 600 : sc._h0, need);
          // grow at once; shrink only after a control changed (never while an animation runs), so the view never flickers
          const key = JSON.stringify(state) + '|' + innerWidth; const changed = sc._fitKey !== key;
          if (currentScene === sc && need < 9000 && (want > canvas.height || (changed && want < canvas.height - 120))) { sc.h = want; setCanvasH(want);
            // a view that draws only what fits is measured again at once, so it reaches its full height in one frame, not in steps
            for (let it = 0; it < 10; it++) { FIT.on = true; FIT.max = 0; try { od.apply(this, arguments); } catch (e) {} FIT.on = false; const n2 = Math.ceil(FIT.max + 28); if (n2 <= canvas.height || n2 >= 9000) break; sc.h = n2; setCanvasH(n2); } }
          if (want <= canvas.height) sc._fitKey = key;
        }
      }
    };
  };
  SCENES.forEach(wrapDraw);
  const oPush = SCENES.push.bind(SCENES); SCENES.push = function () { const r = oPush.apply(null, arguments); [...arguments].forEach(wrapDraw); return r; };

  // a view can ask for a wider drawing (higher resolution), e.g. the virtual farm
  const oWant = wantW; wantW = function () { const sc = currentScene; if (sc && sc.wide) { const pw = (canvas.parentElement && canvas.parentElement.clientWidth) || sc.wide; return Math.round(clampN(pw - 4, 640, sc.wide)); } return oWant.apply(this, arguments); };
  addEventListener('resize', () => { try { if (currentScene && currentScene.wide) setCanvasW(wantW()); } catch (e) {} });

  // ------------------------------------------------------------------ 2. F1 opens the manual
  window.openManual = function () {
    try { const host = window.parent && window.parent.swafl; if (host && host.openManual) return host.openManual(); } catch (e) {}
    try { if (window.swafl && window.swafl.openManual) return window.swafl.openManual(); } catch (e) {}
    window.open(window.SWAFL_MANUAL_URL || '../../docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf', '_blank');   // the manual of the current version, beside the app (also on the online site)
  };
  addEventListener('keydown', e => { if (e.key === 'F1') { e.preventDefault(); e.stopPropagation(); openManual(); } }, true);

  // ------------------------------------------------------------------ 3. crop library in the engine
  const isLib = k => !!LIB.crops[k];
  if (state.densIdx == null) state.densIdx = null;
  if (state.plantDoy == null) state.plantDoy = 120;
  const KINDROW = { rice: [0.2, 45], maize: [0.75, 90], millet: [0.45, 85], legume: [0.45, 35], soybean: [0.45, 45], groundnut: [0.45, 30], cotton: [0.9, 70],
                    wheat: [0.2, 55], mustard: [0.45, 70], vine: [2.5, 95], bush: [1.5, 75], hop: [3.0, 140], citrus: [5.0, 120], olive: [6.0, 120], tree: [4.5, 130], palm: [8.0, 150], papaya: [2.5, 110], sorghum: [0.75, 90], cassava: [1.0, 90], yam: [1.0, 80], cowpea: [0.6, 35], cocoa: [3.0, 110], vegetable: [0.75, 38] };
  for (const k in LIB.crops) {
    const c = LIB.crops[k];
    CROPS[k] = { label: c.label, factor: 1, unit: '% of potential', lib: true, kind: c.kind, group: c.group };
    try { if (typeof IRCROP !== 'undefined') { const r = KINDROW[c.kind] || [0.5, 50]; IRCROP[k] = { row: r[0], h: r[1] }; } } catch (e) {}
  }
  window.cropParams = (k) => LIB.params(k || state.crop, state.densIdx, state.plantDoy);

  // crop calendar of the daily model for library crops
  const oWindows = windowsFor, oCover = coverAt;
  windowsFor = function (crop) {
    if (!isLib(crop)) return oWindows(crop);
    const pp = LIB.params(crop, state.densIdx, state.plantDoy), w = [], [a, b, m] = pp.st;
    for (let y = 0; y < NYR; y++) {
      if (pp.habit === 'evergreen') w.push({ name: pp.c.label.toLowerCase(), sow: y * DPY, harv: y * DPY + DPY - 1, winter: false, mid: y * DPY + a + b / 2, peak: y * DPY + DPY - 1, lib: pp });
      else { for (const yy of (y === 0 && pp.sow + pp.len > DPY ? [-1, 0] : [y])) { const s0 = yy * DPY + pp.sow; w.push({ name: pp.c.label.toLowerCase(), sow: s0, harv: Math.min(s0 + pp.len, ND - 1), winter: false, mid: s0 + a + b / 2, peak: s0 + a + b + m, lib: pp }); } }
    }
    return w;
  };
  coverAt = function (d, w) {
    if (!w || !w.lib) return oCover(d, w);
    if (d < w.sow || d > w.harv) return 0;
    const pp = w.lib, kc = LIB.kcCurve(pp)[((d % DPY) + DPY) % DPY], top = Math.max(pp.kcMid, 0.3);
    if (pp.group === 'perennial' || pp.habit !== 'annual') return clampN(pp.fc * (0.55 + 0.45 * kc / top), 0.03, 1);
    return clampN((kc - 0.12) / Math.max(0.2, top - 0.12), 0.02, 1) * pp.fc;
  };

  // ------------------------------------------------------------------ 4. FAO-56 daily root-zone water balance
  // Daily reference evapotranspiration: Daisy's reference ET of each year (these runs' weather), spread over the year with
  // the seasonal weight of the daily model. Daily rain: Daisy's precipitation of each year, on 28 % wet days.
  const wE = doy => 0.35 + 0.65 * 0.5 * (1 + Math.sin(2 * Math.PI * (doy - 100) / DPY)); let wEs = 0; for (let k = 0; k < DPY; k++) wEs += wE(k);
  function yearlyForcing() {
    const P = window.PERYEAR; let et0 = null, pr = null;
    if (P) { const r = P.runs['E0_' + state.soil + '_Rainfed']; if (r) { et0 = r.ET0.slice(); pr = r.P.slice(); } }
    if (!et0) { et0 = new Array(NYR).fill(878); pr = new Array(NYR).fill(464); }
    const g = RAIN_VALUES[state.rainIdx], dT = TEMP_VALUES[state.tempIdx];
    return { et0: et0.map(v => v * (1 + 0.035 * dT)), pr: pr.map(v => v * g), real: !!P };
  }
  const _cwb = {};
  // the daily forcing of the farm for a run of days: reference ET and rain of the weather in use (online or file with its forecast,
  // or the recorded weather of the simulations), the same series the daily model and the crop balance use
  window.dailyForcing = function (k0, n) {
    const f = yearlyForcing(), WX = (window.WXD && WXD.on) ? WXD : null, sim = seasonSim(), wxP = WX ? RAIN_VALUES[state.rainIdx] / (WX.rainRef || 1) : 1, wxE = WX ? 1 + 0.035 * (TEMP_VALUES[state.tempIdx] - (WX.dTref || 0)) : 1;
    const et0 = [], rain = []; for (let q = 0; q < n; q++) { const k = Math.min(ND - 1, k0 + q), y = Math.min(NYR - 1, Math.floor(k / DPY)), doy = k - y * DPY; et0.push(WX ? WX.ET0[k] * wxE : f.et0[y] * wE(doy) / wEs); rain.push(WX ? WX.P[k] * wxP : (sim.rain[k] || 0)); }
    return { et0, rain, src: WX ? (WX.src === 'online' ? 'online weather of ' + WX.name : 'weather file ' + WX.name) : 'recorded weather of the simulations', fcStart: WX && WX.fcStart || null };
  };
  // the whole daily rain series in use (20 years): for the erosivity of the rain
  window.rainSeries = function () { const WX = (window.WXD && WXD.on) ? WXD : null, sim = seasonSim(), wxP = WX ? RAIN_VALUES[state.rainIdx] / (WX.rainRef || 1) : 1, P = new Float32Array(ND); for (let k = 0; k < ND; k++) P[k] = WX ? WX.P[k] * wxP : (sim.rain[k] || 0); return { P: Array.from(P), years: NYR, dpy: DPY, src: WX ? (WX.src === 'online' ? 'online weather of ' + WX.name : 'weather file ' + WX.name) : 'recorded weather of the simulations', y0: WX ? WX.y0 : 1980 }; };
  window.CWB = function (cropKey, opt) {
    opt = opt || {};
    const pp = cropKey === '__ref' ? null : LIB.params(cropKey, opt.densIdx != null ? opt.densIdx : state.densIdx, opt.plantDoy != null ? opt.plantDoy : state.plantDoy);
    const meth = opt.method || state.method, effApp = meth === 'M01_Overhead' ? 0.75 : /Drip/.test(meth) ? 0.90 : 0.60;
    const f = yearlyForcing(), soil = state.soil, trig = trigAbsFor(soil), fT = opt.fT != null ? opt.fT : clampN(depletionAt(soil, trig), 0.05, 0.95);
    const key = [cropKey, opt.densIdx, opt.plantDoy, state.densIdx, state.plantDoy, soil, meth, fT.toFixed(3), state.rainIdx, state.tempIdx, f.real, !!opt.daily, !!opt.rainfed, (window.WXD && WXD.on) ? WXD.key : 'rec'].join('|');
    if (_cwb[key]) return _cwb[key];
    let kc, rootMax, p0, ky, fcS;
    if (pp) { kc = LIB.kcCurve(pp); rootMax = Math.min(pp.root, 100); p0 = pp.p; ky = pp.ky; fcS = pp.fc; }
    else {                                                   // reference: the cereal rotation of the Daisy runs (FAO-56 small grains, 0.3 / 1.15 / 0.25)
      const w = oWindows('cereal'); kc = new Float32Array(ND); rootMax = 95; p0 = 0.55; ky = 1.05; fcS = 0.9;
      for (const x of w) for (let d = Math.max(0, x.sow); d <= Math.min(ND - 1, x.harv); d++) kc[d] = 0.3 + 0.85 * oCover(d, x);
    }
    const awc = AWC[soil], rand = seededRandom(hashStr(soil) + 4242), out = { I: [], In: [], ETc: [], ETa: [], DP: [], RO: [], P: [], ev: [], stress: [], RY: [] };
    const daily = opt.daily ? { Dr: new Float32Array(ND), TAW: new Float32Array(ND), RAW: new Float32Array(ND), I: new Float32Array(ND), P: new Float32Array(ND), ETc: new Float32Array(ND), ETa: new Float32Array(ND), kc: new Float32Array(ND), DP: new Float32Array(ND) } : null;
    let Dr = 0;
    for (let y = 0; y < NYR; y++) {
      const rainDays = []; let tot = 0; for (let d = 0; d < DPY; d++) { const r = rand() < 0.28 ? -Math.log(Math.max(1e-6, rand())) : 0; rainDays.push(r); tot += r; }
      const sc = tot > 0 ? f.pr[y] / tot : 0, WX = (window.WXD && WXD.on) ? WXD : null, wxP = WX ? RAIN_VALUES[state.rainIdx] / (WX.rainRef || 1) : 1, wxE = WX ? 1 + 0.035 * (TEMP_VALUES[state.tempIdx] - (WX.dTref || 0)) : 1;
      let I = 0, In = 0, ETc = 0, ETa = 0, DP = 0, RO = 0, Pt = 0, ev = 0, st = 0, sETc = 0, sETa = 0;
      for (let d = 0; d < DPY; d++) {
        const k = y * DPY + d, doy = d, e0 = WX ? WX.ET0[k] * wxE : f.et0[y] * wE(doy) / wEs;
        const kcd = pp ? kc[doy] : kc[k], inSeason = kcd > 0.01;
        const kcEff = inSeason ? kcd : 0.25;                                     // bare soil outside the season
        const zr = inSeason ? (pp && pp.group === 'perennial' ? rootMax : clampN(15 + (rootMax - 15) * Math.min(1, kcd / Math.max(0.3, (pp ? pp.kcMid : 1.15)) * 1.15), 15, rootMax)) : 15;
        const TAW = awc * zr, p = clampN(p0 + 0.04 * (5 - kcEff * e0), 0.1, 0.8), RAW = p * TAW;
        if (Dr > TAW) Dr = TAW;
        const P = WX ? WX.P[k] * wxP : rainDays[d] * sc; let ro = 0;
        if (pp && pp.c && pp.c.ponded && inSeason) ro = 0;                       // rice is bunded: no runoff
        else if (P > 35) ro = (P - 35) * 0.3;
        const ks = Dr > RAW ? clampN((TAW - Dr) / Math.max(1e-6, (1 - p) * TAW), 0, 1) : 1;
        const etc = kcEff * e0, eta = etc * (inSeason ? ks : 1);
        Dr = Dr - (P - ro) + eta; let dp = 0; if (Dr < 0) { dp = -Dr; Dr = 0; }
        let irr = 0;
        if (inSeason && Dr >= fT * TAW && !opt.rainfed) { irr = Dr; Dr = 0; ev++; }   // refill the root zone to field capacity
        I += irr / effApp; In += irr; ETc += etc; ETa += eta; DP += dp + (irr / effApp - irr) * (/Drip/.test(meth) ? 0.4 : 0.55); RO += ro + (irr / effApp - irr) * (/Drip/.test(meth) ? 0.1 : meth === 'M01_Overhead' ? 0.2 : 0.3); Pt += P;
        if (inSeason) { sETc += etc; sETa += eta; if (ks < 0.999) st++; }
        if (daily) { daily.Dr[k] = Dr; daily.TAW[k] = TAW; daily.RAW[k] = RAW; daily.I[k] = irr / effApp; daily.P[k] = P; daily.ETc[k] = etc; daily.ETa[k] = eta; daily.kc[k] = kcd; daily.DP[k] = dp; }
      }
      out.I.push(I); out.In.push(In); out.ETc.push(ETc); out.ETa.push(ETa); out.DP.push(DP); out.RO.push(RO); out.P.push(Pt); out.ev.push(ev); out.stress.push(st);
      out.RY.push(sETc > 0 ? clampN(1 - (ky == null ? 1 : ky) * (1 - sETa / sETc), 0, 1) : 1);
    }
    const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
    out.mean = { I: mean(out.I), In: mean(out.In), ETc: mean(out.ETc), ETa: mean(out.ETa), DP: mean(out.DP), RO: mean(out.RO), P: mean(out.P), ev: mean(out.ev), stress: mean(out.stress), RY: mean(out.RY) };
    out.pp = pp; out.fc = fcS; out.daily = daily; out.effApp = effApp; out.fT = fT; out.real = f.real; out.kySrc = pp ? (pp.ky == null ? 'assumed 1.0 (not tabulated)' : 'tabulated') : 'tabulated';
    _cwb[key] = out; return out;
  };

  // transfer of the Daisy result (cereal rotation) to a library crop, by the ratio of the two FAO-56 balances
  const oModel = model;
  model = function (vff, rain, ov) {
    const m = oModel.apply(this, arguments);
    if (!isLib(state.crop) || (ov && ov.noCrop)) return m;
    try {
      const c = CWB(state.crop), r = CWB('__ref'), o = Object.assign({}, m);
      const rI = r.mean.I > 5 ? c.mean.I / r.mean.I : 1;
      o.irr = r.mean.I > 5 ? m.irr * clampN(rI, 0, 4) : c.mean.I;
      o.transp = m.transp * clampN((c.mean.ETa / Math.max(1, c.mean.ETc)) * c.mean.ETc / Math.max(1, r.mean.ETc) * (c.fc / r.fc) ** 0.3, 0.2, 3);
      o.evap = m.evap * clampN((1 - 0.7 * c.fc) / (1 - 0.7 * r.fc), 0.6, 1.6);
      o.drain = Math.max(m.drain > 0 ? 0.2 * m.drain : m.drain, m.drain + (c.mean.DP - r.mean.DP) * 0.5);   // never below a fifth of the simulated drainage
      o.et = clampN(m.rain + o.irr - o.drain - (m.store || 0), 50, 5000);
      // share the evaporative remainder between soil evaporation and the other evaporation terms (ponded water, litter,
      // snow) in proportion to their targets, so the balance closes without inflating either term
      o.transp = Math.min(o.transp, 0.9 * o.et);
      { const oT = (m.other || 0) * o.et / Math.max(1, m.et), rem = Math.max(0, o.et - o.transp), f = rem / Math.max(1, o.evap + oT);
        o.evap *= f; o.other = oT * f; }
      o.nl = m.nl * (o.drain + 5) / (m.drain + 5);
      o.yield = 100 * c.mean.RY; o.ie = m.ie * (c.mean.RY / Math.max(0.05, r.mean.RY)) * (m.irr / Math.max(1, o.irr));   // cereal-equivalent water productivity
      o.cropModel = { crop: state.crop, ratio: rI, RY: c.mean.RY, kySrc: c.kySrc };
      return o;
    } catch (e) { console.warn('crop transfer', e); return m; }
  };

  // ------------------------------------------------------------------ crop drawings (every view that draws plants)
  const oPlants = cropPlants;
  const leaf = (x, y, rx, ry, a, f, s) => { ctx.fillStyle = f; ctx.strokeStyle = s || 'rgba(30,60,20,0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };
  const stem = (x0, y0, x1, y1, w, c) => { ctx.strokeStyle = c || '#4C7A2E'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  function crown(px, top, r, base, rand, col, fruit) {
    for (let k = 0; k < 14; k++) { const a = rand() * Math.PI * 2, rr = r * (0.35 + 0.65 * rand()); ctx.fillStyle = k % 3 ? col : shade(col, -18); ctx.beginPath(); ctx.arc(px + Math.cos(a) * rr * 0.9, top + r + Math.sin(a) * rr * 0.75, r * (0.38 + 0.2 * rand()), 0, Math.PI * 2); ctx.fill(); }
    if (fruit) for (let k = 0; k < 7; k++) { const a = rand() * Math.PI * 2, rr = r * 0.75 * rand(); ctx.fillStyle = fruit; ctx.beginPath(); ctx.arc(px + Math.cos(a) * rr, top + r + Math.sin(a) * rr * 0.7, Math.max(1.6, r * 0.09), 0, Math.PI * 2); ctx.fill(); }
  }
  cropPlants = function (cx, ground, h, spread, n, rootCm, pxPerCm, seedBase) {
    if (!isLib(state.crop)) return oPlants.apply(this, arguments);
    const c = LIB.crops[state.crop], kind = c.kind, rand = seededRandom(seedBase || 77), per = c.group === 'perennial';
    const nn = per ? Math.max(1, Math.round(n / 3)) : n, sp = per ? spread * n / nn : spread;
    for (let i = 0; i < nn && rootCm > 0; i++) {
      const px = cx + (i - (nn - 1) / 2) * sp, rd = Math.min(rootCm, c.root) * pxPerCm * (0.8 + rand() * 0.25);
      ctx.strokeStyle = 'rgba(92,60,34,0.85)'; ctx.lineWidth = per ? 2 : 1.4;
      for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(px, ground); ctx.quadraticCurveTo(px + k * (per ? 9 : 5), ground + rd * 0.5, px + k * (per ? 18 : 11) + (rand() - 0.5) * 8, ground + rd * (0.75 + 0.25 * rand())); ctx.stroke(); }
    }
    for (let i = 0; i < nn; i++) {
      const px = cx + (i - (nn - 1) / 2) * sp, hh = h * (0.9 + rand() * 0.2) * (per ? 1.8 : 1);
      if (kind === 'rice') { for (let k = -3; k <= 3; k++) { stem(px, ground, px + k * 3.5, ground - hh * (0.75 + 0.05 * Math.abs(k)), 1.3, '#5E9E3A'); } ctx.fillStyle = '#D8B85A'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(px + k * 4 + 2, ground - hh * 0.8, 1.8, 6, 0.4, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'maize') { stem(px, ground, px, ground - hh * 1.25, 3, '#4E8A2C'); for (let k = 0; k < 6; k++) { const ly = ground - hh * (0.2 + k * 0.17), sd = k % 2 ? 1 : -1; ctx.strokeStyle = '#5FA83F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, ly); ctx.quadraticCurveTo(px + sd * 16, ly - 10, px + sd * 26, ly + 6); ctx.stroke(); } leaf(px + 5, ground - hh * 0.55, 3.5, 9, 0.3, '#E9C85A', '#9A7A20'); ctx.strokeStyle = '#C8A24A'; ctx.lineWidth = 1; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(px, ground - hh * 1.25); ctx.lineTo(px + k * 4, ground - hh * 1.36); ctx.stroke(); } }
      else if (kind === 'sorghum') { stem(px, ground, px, ground - hh * 1.15, 2.6, '#5A8F33'); for (let k = 0; k < 5; k++) { const ly = ground - hh * (0.2 + k * 0.17), sd = k % 2 ? 1 : -1; ctx.strokeStyle = '#6AAE45'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(px, ly); ctx.quadraticCurveTo(px + sd * 14, ly - 9, px + sd * 23, ly + 5); ctx.stroke(); } ctx.fillStyle = '#A0482A'; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(px + (rand() - 0.5) * 7, ground - hh * 1.2 - k * 2.2, 2.4, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'cassava') { for (let k = -1; k <= 1; k++) stem(px, ground, px + k * 5, ground - hh * 1.1, 2.4, '#8A6A55'); for (let k = 0; k < 4; k++) { const lx = px + (k - 1.5) * 9, ly = ground - hh * (0.8 + 0.1 * (k % 2)); for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * 0.55; leaf(lx + Math.cos(a) * 6, ly + Math.sin(a) * 6, 6, 2, a, '#3E8A3A'); } } ctx.fillStyle = '#8A5A3A'; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(px + k * 7, ground + 8, 3, 9, k * 0.4, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'yam') { const ht = hh * 1.3; stem(px + 6, ground, px + 6, ground - ht, 2, '#8A7A60'); ctx.strokeStyle = '#4C7A2E'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px, ground); for (let k = 1; k <= 12; k++) ctx.lineTo(px + 6 + Math.sin(k * 1.3) * 5, ground - ht * k / 12); ctx.stroke(); for (let k = 0; k < 7; k++) leaf(px + 6 + (k % 2 ? 7 : -7), ground - ht * (0.2 + k * 0.11), 6, 4.5, k % 2 ? -0.4 : 0.4, '#4E9A3A'); ctx.fillStyle = '#7A5030'; ctx.beginPath(); ctx.ellipse(px, ground + 12, 6, 11, 0.1, 0, Math.PI * 2); ctx.fill(); }
      else if (kind === 'cowpea') { stem(px, ground, px, ground - hh * 0.8, 1.6, '#4C7A2E'); for (let k = 0; k < 5; k++) { const ly = ground - hh * (0.15 + k * 0.15); [-1, 1].forEach(sd => leaf(px + sd * 9, ly - 2, 7, 4.5, sd * -0.4, '#5BA544')); } for (let k = 0; k < 3; k++) { ctx.strokeStyle = '#8A9A3A'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(px + (k - 1) * 6, ground - hh * 0.55); ctx.quadraticCurveTo(px + (k - 1) * 9, ground - hh * 0.35, px + (k - 1) * 12, ground - hh * 0.3); ctx.stroke(); } }
      else if (kind === 'cocoa') { const ht = hh * 1.0, r = Math.max(12, hh * 0.4); ctx.fillStyle = '#6B4A2E'; ctx.fillRect(px - 2.5, ground - ht * 0.6, 5, ht * 0.6); crown(px, ground - ht - r * 0.5, r, ground, rand, '#2A6A32', null); ctx.fillStyle = '#C8782A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(px + (k % 2 ? 4 : -4), ground - ht * (0.25 + k * 0.08), 2.6, 5, 0, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'vegetable') { const key = c.key; if (key === 'onion') { for (let k = -2; k <= 2; k++) stem(px + k * 2, ground - 4, px + k * 4, ground - hh * (0.9 + 0.05 * Math.abs(k)), 1.6, '#5E9E3A'); ctx.fillStyle = '#C9A06A'; ctx.beginPath(); ctx.ellipse(px, ground - 3, 7, 6, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (key === 'cabbage') { for (let k = 0; k < 8; k++) { const a = -Math.PI * k / 7; leaf(px + Math.cos(a) * 12, ground - 6 + Math.sin(a) * 6, 8, 5, a, '#7FB86A'); } ctx.fillStyle = '#A8D48A'; ctx.beginPath(); ctx.arc(px, ground - hh * 0.45, Math.max(6, hh * 0.32), 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(40,80,30,0.6)'; ctx.stroke(); }
        else { stem(px, ground, px, ground - hh * 0.95, 2, '#4C7A2E'); for (let k = 0; k < 6; k++) { const ly = ground - hh * (0.15 + k * 0.14); leaf(px + (k % 2 ? 8 : -8), ly, 7, 4, k % 2 ? -0.5 : 0.5, '#4E9A3A'); } const fr = { tomato: '#D9342A', pepper: '#C8302A', potato: '#F2F2F2' }[key] || '#D9342A'; for (let k = 0; k < (key === 'potato' ? 5 : 4); k++) { ctx.fillStyle = fr; ctx.beginPath(); ctx.arc(px + (rand() - 0.5) * 16, ground - hh * (0.35 + rand() * 0.5), key === 'potato' ? 2 : 3.2, 0, Math.PI * 2); ctx.fill(); } if (key === 'potato') { ctx.fillStyle = '#B8865A'; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(px + k * 8, ground + 9 + Math.abs(k) * 3, 5, 4, 0, 0, Math.PI * 2); ctx.fill(); } } } }
      else if (kind === 'millet') { stem(px, ground, px, ground - hh * 1.2, 2.2, '#5A8F33'); for (let k = 0; k < 4; k++) { const ly = ground - hh * (0.25 + k * 0.2), sd = k % 2 ? 1 : -1; ctx.strokeStyle = '#6AAE45'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, ly); ctx.quadraticCurveTo(px + sd * 12, ly - 8, px + sd * 20, ly + 4); ctx.stroke(); } leaf(px, ground - hh * 1.32, 3, 11, 0, '#8E7A45', '#5A4A20'); }
      else if (kind === 'wheat') { stem(px, ground, px, ground - hh, 2, '#5C8E34'); for (let k = 0; k < 4; k++) { const ly = ground - hh * (0.3 + k * 0.17), sd = k % 2 ? 1 : -1; ctx.strokeStyle = '#6AAE45'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px, ly); ctx.quadraticCurveTo(px + sd * 10, ly - 7, px + sd * 16, ly + 3); ctx.stroke(); } ctx.fillStyle = '#D9B25A'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(px + (k % 2 ? 2 : -2), ground - hh - 3 - k * 3, 2.2, 3, 0, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'mustard') { stem(px, ground, px, ground - hh * 1.1, 1.8, '#5E9A3C'); for (let k = 0; k < 4; k++) leaf(px + (k % 2 ? 7 : -7), ground - hh * (0.15 + k * 0.15), 7, 3.5, k % 2 ? -0.5 : 0.5, '#6DB84A'); for (let k = 0; k < 9; k++) { ctx.fillStyle = '#F2D23A'; ctx.beginPath(); ctx.arc(px + (rand() - 0.5) * 16, ground - hh * (1.0 + rand() * 0.15), 2.2, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'cotton') { stem(px, ground, px, ground - hh, 2.4, '#6A5A2E'); for (let k = 0; k < 7; k++) { const ly = ground - hh * (0.25 + k * 0.1), sd = k % 2 ? 1 : -1; leaf(px + sd * 10, ly, 7, 5, 0, '#5C9E3E'); } for (let k = 0; k < 5; k++) { ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#B8B0A0'; ctx.beginPath(); ctx.arc(px + (rand() - 0.5) * 22, ground - hh * (0.4 + rand() * 0.55), 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
      else if (kind === 'groundnut') { for (let k = 0; k < 9; k++) { const a = -Math.PI * (0.1 + 0.8 * k / 8); leaf(px + Math.cos(a) * 11, ground - 4 + Math.sin(a) * hh * 0.45, 4.6, 3, a, '#5FAE48'); } ctx.fillStyle = '#F0C03A'; ctx.beginPath(); ctx.arc(px, ground - hh * 0.4, 2.2, 0, Math.PI * 2); ctx.fill(); }
      else if (kind === 'legume' || kind === 'soybean') { stem(px, ground, px, ground - hh * 0.85, 1.8, '#4C7A2E'); for (let k = 0; k < 5; k++) { const ly = ground - hh * (0.15 + k * 0.16); [-1, 1].forEach(sd => leaf(px + sd * 8, ly - 2, 7, 4, sd * -0.5, kind === 'soybean' ? '#4E9A3A' : '#6DB84A')); } for (let k = 0; k < 3; k++) leaf(px + (k % 2 ? 6 : -6), ground - hh * (0.35 + k * 0.17) + 6, 2.4, 7, 0.3, kind === 'soybean' ? '#A88E50' : '#7E9A3C'); }
      else if (kind === 'vine' || kind === 'hop') { const ht = kind === 'hop' ? hh * 1.6 : hh * 0.9; stem(px - sp * 0.45, ground, px - sp * 0.45, ground - ht - 6, 2, '#7A6A55'); stem(px + sp * 0.45, ground, px + sp * 0.45, ground - ht - 6, 2, '#7A6A55'); ctx.strokeStyle = '#8A8A8A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px - sp * 0.5, ground - ht); ctx.lineTo(px + sp * 0.5, ground - ht); ctx.stroke(); stem(px, ground, px, ground - ht, 3.2, '#6B4A2E'); for (let k = 0; k < 10; k++) leaf(px + (rand() - 0.5) * sp * 0.9, ground - ht + (rand() - 0.6) * 14, 6, 4.5, rand(), kind === 'hop' ? '#7CB84A' : '#4E9A3A'); if (kind === 'vine') for (let k = 0; k < 4; k++) { ctx.fillStyle = c.key === 'kiwi' ? '#8A6A3A' : '#5A2E6A'; ctx.beginPath(); ctx.arc(px + (rand() - 0.5) * sp * 0.6, ground - ht + 8 + rand() * 6, 3, 0, Math.PI * 2); ctx.fill(); } }
      else if (kind === 'bush') { stem(px, ground, px, ground - hh * 0.5, 2.5, '#6B4A2E'); crown(px, ground - hh * 1.0, hh * 0.32, ground, rand, '#3E8A3A', '#3A4FA8'); }
      else if (kind === 'palm' || kind === 'papaya') { const ht = kind === 'papaya' ? hh * 1.2 : hh * 1.9; stem(px, ground, px + 3, ground - ht, kind === 'papaya' ? 4 : 6, '#8A6A45'); for (let k = 0; k < 9; k++) { const a = -Math.PI * (0.05 + 0.9 * k / 8); ctx.strokeStyle = '#3E8A3A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + 3, ground - ht); ctx.quadraticCurveTo(px + 3 + Math.cos(a) * 22, ground - ht + Math.sin(a) * 22, px + 3 + Math.cos(a) * 36, ground - ht + Math.sin(a) * 8 + 16); ctx.stroke(); } ctx.fillStyle = kind === 'papaya' ? '#E59A2E' : '#8A5A2A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(px + (k - 1.5) * 4, ground - ht + 6, 3, 0, Math.PI * 2); ctx.fill(); } }
      else { const evg = c.habit === 'evergreen', col = kind === 'olive' ? '#7C9A6A' : evg ? '#2F7A3A' : '#4E9A3A', fr = kind === 'citrus' ? (c.key === 'avocado' ? '#3A5A2A' : c.key === 'mango' ? '#E8A23A' : '#F08A1A') : kind === 'olive' ? '#3A3A2A' : { apple: '#D9342A', cherry: '#A0102A', peach: '#F2A060', apricot: '#F2A040', pear: '#C8C84A', pomegranate: '#B8202A', persimmon: '#F07A20', fig: '#6A3A5A' }[c.key] || null;
        const ht = hh * 1.15, r = Math.max(12, hh * 0.42); ctx.fillStyle = '#6B4A2E'; ctx.fillRect(px - 2.5, ground - ht * 0.55, 5, ht * 0.55); crown(px, ground - ht - r * 0.6, r, ground, rand, col, fr); }
    }
  };

  // ------------------------------------------------------------------ provenance ribbon for transferred results
  window.cropNote = function () {
    if (!isLib(state.crop)) return null; const pp = cropParams(), c = CWB(state.crop);
    return pp.label + ': Cereal results transferred with FAO-56 crop coefficients (Kc ' + pp.kcIni.toFixed(2) + ' / ' + pp.kcMid.toFixed(2) + ' / ' + pp.kcEnd.toFixed(2) + '); yield as % of potential (Ky ' + (c.pp.ky == null ? 'assumed 1.0' : c.pp.ky.toFixed(2)) + ')';
  };
  setInterval(() => { try { const n = cropNote(), el = document.getElementById('cropNoteBar'); if (n) { let e = el; if (!e) { e = document.createElement('div'); e.id = 'cropNoteBar'; const pc = document.getElementById('proCenter') || document.body; pc.insertBefore(e, pc.firstChild); } e.textContent = n; e.style.display = ''; } else if (el) el.style.display = 'none'; } catch (e) {} }, 600);
  try { refresh(); } catch (e) {}
})();

/* crop selector of the web explorer (all simulated and library crops, grouped) and migration of projects saved with the
   former crop categories: legume -> soybean, vegetable -> tomato */
(function () {
  if (typeof applyState !== 'function' || !window.CROPLIB) return;
  const MIG = { legume: 'soybean', vegetable: 'tomato' };
  const oApply = applyState;
  applyState = function (o) { if (o && o.crop && !CROPS[o.crop]) o.crop = MIG[o.crop] || 'cereal'; return oApply.apply(this, arguments); };
  if (!CROPS[state.crop]) state.crop = MIG[state.crop] || 'cereal';
  const box = document.getElementById('cropBtns'); if (!box) return;
  const L = CROPLIB.crops, groups = [['Simulated', ['cereal']],
    ['Staple food crops', ['cassava', 'yam', 'rice', 'maize', 'sorghum', 'pearlmillet', 'cowpea', 'wheat', 'potato']],
    ['Cash and oil crops', ['groundnut', 'soybean', 'cotton', 'mustard', 'greengram', 'chickpea', 'oilpalm', 'cocoa']],
    ['Vegetables', ['tomato', 'onion', 'cabbage', 'pepper']],
    ['Trees, vines and palms', Object.keys(L).filter(k => L[k].group === 'perennial' && !['oilpalm', 'cocoa'].includes(k))]];
  const used = new Set(groups.flatMap(g => g[1])); const rest = Object.keys(L).filter(k => !used.has(k)); if (rest.length) groups.push(['Other field crops', rest]);
  const sel = document.createElement('select'); sel.id = 'cropSel'; sel.style.cssText = 'width:100%;padding:4px;font:inherit';
  groups.forEach(([g, ks]) => { const og = document.createElement('optgroup'); og.label = g; ks.filter(k => CROPS[k]).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = CROPS[k].label; og.appendChild(o); }); if (og.children.length) sel.appendChild(og); });
  sel.onchange = () => applyState({ crop: sel.value });
  box.innerHTML = ''; box.appendChild(sel); box.style.display = 'block';
  setInterval(() => { if (sel.value !== state.crop && document.activeElement !== sel) sel.value = state.crop; }, 500);
  window.CROP_GROUPS = groups;
})();
