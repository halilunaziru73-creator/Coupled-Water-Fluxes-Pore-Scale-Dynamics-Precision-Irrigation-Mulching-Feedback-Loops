/* SWAFL 1.1 layer P1 Deterministic phenotyping (part 1): state, controls, the twin view of plants and roots, root scans, time series.
   The model is plus_phenomodel.js; part 2 (plus_phenotyping2.js) adds water, carbon, soil, prediction, traits and data.
   Everything drawn here is computed by the model from the settings of the layer and of the project (soil, tillage, weather, crop). */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || !window.PLUSKIT || !window.PHENO) return;
  const K = window.PLUSKIT, P = window.PHENO, HEAD = '#1B1F23', GRID = '#E6E2D6', NAVY = '#1B3A6B';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, TF = K.TF, N = 140, NL = P.NL, DZ = P.DZ, ZMAX = P.ZMAX;
  const CMAP = { maize: 'maize', sorghum: 'sorghum', pearlmillet: 'sorghum', wheat: 'wheat', rice: 'wheat', cereal: 'wheat', soybean: 'bean', cowpea: 'bean', greengram: 'bean', chickpea: 'bean', groundnut: 'bean', tomato: 'bean', mustard: 'bean' };
  const CLIM = { project: { Tm: 8.5, Tamp: 8.2, sow: 0, t: 'Project climate (cool, humid)' }, warm: { Tm: 15.5, Tamp: 9.5, sow: -10, t: 'Warm season' }, hot: { Tm: 23, Tamp: 8.5, sow: -35, t: 'Hot, dry season' } };
  const PH = {
    anim: { on: false, t0: 0, dur: 14 }, secY: {}, sp: CMAP[typeof state !== 'undefined' ? state.crop : 'cereal'] || 'wheat', follow: true, ref: 'pj', gid: 'ref', g: Object.assign({}, P.GENO[0]), clim: 'project', rain: 'none', dr: { type: 'pulse', onset: 45, len: 35, sev: 15, rainOut: true },
    view: 'rgb', set: 'shoot', trt: 'dr', rot: 0.45, xw: 0, area: null, yv: 'D95', ovr: { rue: 1, dpsi: 0, sg: 0 }, sw: { rue: 1, kte: 1, qG: 1 }, cmp: null, fitMsg: '', open: {}, ran: false, ranKey: '', why: '', obs: null, run: null, key: '', lastRun: 0, drag: null, dragging: false, last: 0, panel: { key: '', items: [], busy: false }, job: null, msg: ''
  };
  const SL = [], SCR = [], ROT = { x: 0, y: 0, w: 0, h: 0 }, TS = { x: 0, y: 0, w: 0, h: 0 };
  const scrub = (x, y, w, h, x0, w0) => { SCR.push({ x, y, w, h, x0, w0 }); hot(x, y, w, h, () => { }, 'click or drag to move the day'); };
  const mix = (a, b, t) => { const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)], x = p(a), y = p(b); t = clamp(t, 0, 1); return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',') + ')'; };
  const PAL = ['#2c3e9e', '#2f78c9', '#3fb0c4', '#6cc57e', '#c8d94b', '#f2b134', '#e8602c', '#b3171f', '#ffffff'];
  const pal = t => { t = clamp(t, 0, 1) * (PAL.length - 2); const i = Math.min(PAL.length - 3, Math.floor(t)); return mix(PAL[i], PAL[i + 1], t - i); };
  const wcol = f => mix('#C9A65E', '#2E6FBF', clamp(f, 0, 1));
  const day = () => clamp(Math.round(play.t * (N - 1)), 0, N - 1);
  const DAYMS = 864e5;
  const projSow = () => Math.max(60, (typeof state !== 'undefined' && isFinite(state.plantDoy) && state.plantDoy != null ? state.plantDoy : P.SP[PH.sp].sow) + CLIM[PH.clim].sow);
  // the first day of the season, in ms: the planting day of the project (the season that holds the date of the toolbar), or the date of the toolbar itself
  function startMs() {
    const D = dKey(), y = new Date(D).getUTCFullYear(), sw = projSow(), st = yy => Date.UTC(yy, 0, 1) + sw * DAYMS; let Y = y; if (D < st(y) && D >= st(y - 1) && D - st(y - 1) < N * DAYMS) Y = y - 1;
    const inSeason = D >= st(Y) && D < st(Y) + N * DAYMS, m = PH.sowMode || 'date';
    if (m === 'date' || (m === 'auto' && !inSeason)) return D; return st(Y);
  }
  const sowDoy = () => { const d = new Date(startMs()), y = d.getUTCFullYear(); let k = Math.round((startMs() - Date.UTC(y, 0, 1)) / DAYMS); const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; if (leap && k >= 59) k = k === 59 ? 58 : k - 1; return Math.min(364, Math.max(0, k)); };
  const dateOf = d => { const dt = new Date(startMs() + d * DAYMS); return dt.getUTCDate() + ' ' + MON[dt.getUTCMonth()]; };
  const dateOfY = d => { const dt = new Date(startMs() + d * DAYMS); return dt.getUTCDate() + ' ' + MON[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear(); };
  // the labels of a time axis are dates; the date of the toolbar is marked on every chart
  const yearAxis = () => PH.axis === 'year';
  // the map from a day of the season to the x of a chart: the season itself, or the whole calendar year from January to December
  function xmap(x0, ww) {
    let f; if (!yearAxis()) f = k => x0 + ww * k / (N - 1); else { const s = startMs(), y0 = Date.UTC(new Date(s).getUTCFullYear(), 0, 1), off = Math.round((s - y0) / DAYMS), span = Math.max(365, off + N); f = k => x0 + ww * (off + k) / (span - 1); }
    f.x0 = x0; f.x1 = x0 + ww; f.sx = f(0); f.sw = f(N - 1) - f(0); return f;
  }
  function axisDates(X, yAxis, x0, ww, o) {
    o = o || {};
    if (yearAxis()) { const s = startMs(), y = new Date(s).getUTCFullYear(), step = ww < 220 ? 3 : ww < 400 ? 2 : 1, wide = ww >= 400; let lastX = -1e9;
      for (let m = 0; m < 24; m += step) { const ms = Date.UTC(y, m, 1), k = (ms - s) / DAYMS, xx = X(k); if (xx < x0 - 1 || xx > x0 + ww - 14) continue; ctx.strokeStyle = '#D8D3C6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx + 0.5, yAxis); ctx.lineTo(xx + 0.5, yAxis + 4); ctx.stroke(); T(MON[m % 12] + (m === 0 || m === 12 ? ' ' + (wide ? (y + Math.floor(m / 12)) : String(y + Math.floor(m / 12)).slice(2)) : ''), xx + 2, yAxis + 12, { s: 8, c: MUTE }); }
      return; }
    const n = o.n || 5, yr = new Date(startMs()).getUTCFullYear(); for (let i = 0; i <= n; i++) { const t = Math.round(i * (N - 1) / n), dt = new Date(startMs() + t * DAYMS); T(dt.getUTCDate() + ' ' + MON[dt.getUTCMonth()] + (i === 0 || dt.getUTCFullYear() !== yr && i === n ? ' ' + String(dt.getUTCFullYear()).slice(2) : ''), X(t), yAxis + 12, { s: 8.5, c: MUTE, a: i === 0 ? 'left' : i === n ? 'right' : 'center' }); } }
  function todayMark(X, top, hh) { try { const q = window.PHUI.outlook.season(dKey()); const xx = X(q.idx); if (yearAxis() ? (xx < X.x0 - 1 || xx > X.x1 + 1) : (q.idx < 0 || q.idx >= N)) return; ctx.strokeStyle = '#0A246A'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(xx + 0.5, top); ctx.lineTo(xx + 0.5, top + hh); ctx.stroke(); ctx.fillStyle = '#0A246A'; ctx.beginPath(); ctx.moveTo(xx - 4, top - 1); ctx.lineTo(xx + 5, top - 1); ctx.lineTo(xx + 0.5, top + 5); ctx.closePath(); ctx.fill(); } catch (e) { } }
  const KIND = { maize: 'maize', millet: 'sorghum', sorghum: 'sorghum', rice: 'wheat', wheat: 'wheat', cassava: 'bean', yam: 'bean', cowpea: 'bean', legume: 'bean', soybean: 'bean', groundnut: 'bean', cotton: 'bean', mustard: 'bean', vegetable: 'bean' };   // the archetype of the model that is nearest to the crop of the library
  const projSpecies = () => { if (CMAP[state.crop]) return CMAP[state.crop]; const c = window.CROPLIB && CROPLIB.crops && CROPLIB.crops[state.crop]; if (c) return KIND[c.kind] || (c.group === 'perennial' ? 'bean' : 'wheat'); return 'wheat'; };
  const applyPreset = id => { const g = P.GENO.find(x => x.id === id) || P.GENO[0]; PH.gid = g.id; PH.g = Object.assign({}, g, { psi50: P.SP[PH.sp].psi50 + g.dpsi }); };
  PH.g.psi50 = P.SP[PH.sp].psi50;

  // ---------------------------------------------------------------- inputs of the run: the project (soil, tillage, weather) and the layer
  const soilTabs = {};
  function soilObj() {
    const s = state.soil, tx = DATA.texture[s]; if (!soilTabs[s]) soilTabs[s] = P.soilTable(VGE[s]);
    return { tab: soilTabs[s], awc: AWC[s], clay: tx.clay, sand: tx.sand, till: state.till, tc: TC_VALUES[state.tcIdx], key: s };
  }
  function effGeno() { const g = Object.assign({}, PH.g); g.rue = (g.rue || 1) * PH.ovr.rue; g.psi50 = (g.psi50 == null ? P.SP[PH.sp].psi50 : g.psi50) + PH.ovr.dpsi; g.dpsi = g.psi50 - P.SP[PH.sp].psi50; g.SG = clamp(g.SG + PH.ovr.sg, 0, 0.95); return g; }
  // ---------------------------------------------------------------- the project: every control of the Properties panel that reaches the plant
  const RN = () => ({ ww: 'well-watered', pj: 'project irrigation', rf: 'rainfed' })[PH.ref] || 'well-watered', RNc = () => { const t = RN(); return t.charAt(0).toUpperCase() + t.slice(1); };
  const IRR = { M01_Overhead: { eff: 0.75, dmax: 35, minInt: 2 }, M02_Surface: { eff: 0.60, dmax: 60, minInt: 3 } }, IRR_DRIP = { eff: 0.90, dmax: 10, minInt: 1 };
  function libCrop() { try { const pp = window.CROPLIB && CROPLIB.params ? CROPLIB.params(state.crop, state.densIdx, state.plantDoy) : null; if (!pp) return null; const o = {}; if (pp.height > 0.15) o.Hmax = Math.round(clamp(pp.height * 100, 25, 600)); if (pp.kcMid > 0.3) o.Kcb = Math.round(clamp(pp.kcMid - 0.05, 0.55, 1.25) * 100) / 100; if (pp.root > 10) o.zRoot = Math.round(clamp(pp.root, 30, P.ZMAX)); return { o, pp }; } catch (e) { return null; } }
  function nResponse() {   // the relative response of the SWAFL Daisy runs to the nitrogen rate, for the soil of the project (E13: yield at each rate against 100 kg N per ha)
    const rows = ((DATA.e13 || {})[state.soil] || []).filter(r => isFinite(r.k) && isFinite(r.yield)).sort((a, b) => a.k - b.k), rate = NRATE_VALUES[state.nIdx]; if (rows.length < 2) return { f: 1, rate, y: null };
    const at = x => { if (x <= rows[0].k) return rows[0].yield; for (let i = 1; i < rows.length; i++) if (x <= rows[i].k) { const a = rows[i - 1], b = rows[i]; return a.yield + (b.yield - a.yield) * (x - a.k) / Math.max(1e-9, b.k - a.k); } return rows[rows.length - 1].yield; };
    const y100 = at(100); return { f: y100 > 0.05 ? clamp(at(rate) / y100, 0.2, 1.3) : 1, rate, y: at(rate), y100 };
  }
  function projObj() {
    const m = METHODS.find(q => q.k === state.method) || METHODS[0], base = IRR[m.k] || IRR_DRIP, nr = nResponse(), st = typeof saltTol === 'function' ? saltTol(state.crop) : { th: 2, sl: 10 };
    let trig = 300; try { trig = Math.abs(trigAbsFor(state.soil)); } catch (e) { }
    return { vff: VFF_VALUES[state.vffIdx], cap: CAP_VALUES[state.capIdx], fN: nr.f, nRate: nr.rate, salt: { ec0: clamp(+state.salt0 || 0, 0, 25), ecw: clamp(+state.ecw || 0, 0, 12), th: st.th, sl: st.sl }, irr: { trig, z: Z_VALUES[state.zIdx], minInt: base.minInt, dmax: base.dmax, eff: base.eff, drip: m.mid || 0, method: m.label } };
  }
  const clockTxt = () => { const D = dKey(), t = new Date(), td = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()), d = new Date(D), p2 = v => (v < 10 ? '0' : '') + v; return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + (D === td ? ', ' + p2(t.getHours()) + ':' + p2(t.getMinutes()) : ''); };
  // the year of the weather that holds the season of the date of the toolbar (else the year of the clock of the engine)
  function ySeason(W0) { try { const q = window.PHUI.outlook.season(dKey()); const i = W0 && W0.years ? W0.years.indexOf(q.Y) : -1; if (i >= 0) return i; } catch (e) { } return typeof yearNow === 'function' ? yearNow() : 0; }
  function envObj(rainOn, noCal) {
    const cl = CLIM[PH.clim], dT = TEMP_VALUES[state.tempIdx] + PH.xw, rm = RAIN_VALUES[state.rainIdx], mode = rainOn ? 'project' : PH.rain, W0 = window.WXD && window.WXD.on ? window.WXD : null; let real = null, realT = null, realE = null;
    if (W0 && W0.rows && !noCal) { try { const A = window.PHUI.outlook.arrays(); if (A) { if (mode === 'project') real = A.P; if (A.T.every(v => v != null)) realT = A.T; if (A.E.every(v => v != null)) realE = A.E; return { sow: sowDoy(), Tm: cl.Tm, Tamp: cl.Tamp, dT: PH.xw, rain: DATA.rain_base, rainMult: 1, rainMode: mode, realRain: real, realT, realET0: realE, lat: 55.7 }; } } catch (e) { console.error(e); } }
    if (mode === 'project' && W0 && W0.P) { try { const y = ySeason(W0), sw = sowDoy(); real = Array.from({ length: N }, (_, k) => W0.P[y * 365 + (sw + k) % 365] || 0); } catch (e) { real = null; } }
    if (W0) { try { const y = ySeason(W0), sw = sowDoy(); if (W0.Tclim) realT = Array.from({ length: N }, (_, k) => W0.Tclim[(sw + k) % 365]); if (W0.hasE && W0.ET0) realE = Array.from({ length: N }, (_, k) => W0.ET0[y * 365 + (sw + k) % 365]); } catch (e) { } }
    return { sow: sowDoy(), Tm: cl.Tm, Tamp: cl.Tamp, dT, rain: DATA.rain_base * (PH.clim === 'hot' ? 0.45 : PH.clim === 'warm' ? 0.7 : 1), rainMult: real ? 1 : rm, rainMode: mode, realRain: real, realT, realET0: realE, lat: 55.7 };
  }
  const dKey = () => { try { return window.PHUI.outlook.toolbarDate(); } catch (e) { return 0; } };
  const keyOf = wd => JSON.stringify([wd === false ? 0 : dKey(), PH.sowMode, state.soil, state.till, state.tcIdx, state.tempIdx, state.rainIdx, PH.sp, PH.g, PH.clim, PH.rain, PH.dr, PH.xw, PH.area, PH.ovr, PH.ref, PH.sw, state.crop, state.densIdx, state.plantDoy, state.vffIdx, state.capIdx, state.nIdx, state.method, state.zIdx, state.trigIdx, state.trigMode, state.trigF, state.salt0, state.ecw, state.areaHa, window.WXD && window.WXD.on ? window.WXD.key : 'rec', (function () { try { return Math.round(trigAbsFor(state.soil)); } catch (e) { return 0; } })()]);
  function cfgFor(tr, store, geno) {
    const tt = tr === 'ww' ? PH.ref : (tr === 'bench' ? 'ww' : tr), wet = tt === 'pj' || tt === 'rf', env = envObj(wet), lc = libCrop(), sw = PH.sw || { rue: 1, kte: 1 };
    const cp = Object.assign({}, lc ? lc.o : {}); if (sw.rue !== 1 || sw.kte !== 1) { const sp0 = P.SP[PH.sp]; cp.RUE = sp0.RUE * sw.rue; cp.kte = sp0.kte * sw.kte; }
    const W2 = wet ? (PH.Wr && PH.WrKey === PH.keyW ? PH.Wr : (PH.Wr = P.weather(env, N))) : PH.W;
    return { species: PH.sp, geno: geno || effGeno(), env, soil: Object.assign(soilObj(), { qG: 0.1 * (sw.qG || 1) }), N, treatment: tt, drought: PH.dr, store, area: PH.area || undefined, weather: W2, proj: projObj(), cropP: Object.keys(cp).length ? cp : null };
  }
  function ensureRun() {
    const k = keyOf(); if (PH.key === k && PH.run) return; const now = performance.now(); if (PH.run && PH.dragging && now - PH.lastRun < 160) return;
    try { const env = envObj(false); PH.W = P.weather(env, N); PH.Wr = P.weather(envObj(true), N); PH.keyW = k; PH.WrKey = k; PH.run = { ww: P.run(cfgFor('ww', true)), dr: P.run(cfgFor('dr', true)) }; PH.key = k; PH.msg = ''; } catch (e) { PH.msg = String(e); console.error('phenotyping', e); }
    PH.lastRun = performance.now(); PH.cache = null;
  }
  const R = t => PH.run && PH.run[t];
  const regimeShade = () => { const o = PH.dr.onset, L = PH.dr.len, h = Math.round(L / 2); if (PH.dr.type === 'none') return []; if (PH.dr.type === 'pulse') return [[o, o + h, '#F6D9A8', '1st stress'], [o + h, o + L, '#EDB36A', '2nd stress'], [o + L, N - 1, '#D3DDF3', 'recovery']]; if (PH.dr.type === 'terminal') return [[o, N - 1, '#EDB36A', 'no water']]; const per = Math.max(3, Math.round(L / 2)), out = []; for (let s = o; s < N - 1; s += 2 * per) { out.push([s, Math.min(N - 1, s + per), '#F6D9A8', 'stress']); out.push([Math.min(N - 1, s + per), Math.min(N - 1, s + 2 * per), '#D3DDF3', 'recovery']); } return out; };

  // ---------------------------------------------------------------- controls
  const chip = (x, y, text, on, fn, tip) => { ctx.font = '10.5px sans-serif'; const w = ctx.measureText(text).width + 16; ctx.fillStyle = on ? NAVY : '#EFEDE5'; rrect(x, y, w, 22, 11); ctx.fill(); ctx.strokeStyle = on ? NAVY : '#B9B4A6'; ctx.lineWidth = 1; ctx.stroke(); T(text, x + w / 2, y + 15, { s: 10.5, c: on ? '#fff' : INK, a: 'center' }); hot(x, y, w, 22, fn, tip); return w + 6; };
  function chipRow(label, items, cur, set, x, y, wMax) {
    T(label, x, y + 15, { s: 9.5, b: true, c: MUTE }); let xx = x + 74; ctx.font = '10.5px sans-serif';
    items.forEach(it => { const w = ctx.measureText(it.t).width + 22; if (xx + w > x + wMax) { xx = x + 74; y += 26; } xx += chip(xx, y, it.t, cur === it.k, () => set(it.k), it.tip || it.t); });
    return y + 28;
  }
  function slider(x, y, w, label, min, max, val, txt, set) {
    T(label, x, y + 9, { s: 9.5, c: MUTE }); T(txt, x + w, y + 9, { s: 9.5, b: true, a: 'right' }); const ty = y + 20, f = clamp((val - min) / (max - min), 0, 1);
    ctx.fillStyle = '#DCD8CC'; ctx.fillRect(x, ty, w, 4); ctx.fillStyle = NAVY; ctx.fillRect(x, ty, w * f, 4); ctx.fillStyle = '#fff'; ctx.strokeStyle = NAVY; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + w * f, ty + 2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    SL.push({ x: x - 7, y: y + 6, w: w + 14, h: 28, min, max, set, x0: x, w0: w }); hot(x - 7, y + 6, w + 14, 28, () => { }, 'drag to change');
  }
  const slVal = (s, px) => s.min + clamp((px - s.x0) / s.w0, 0, 1) * (s.max - s.min);
  function customize() { PH.gid = 'custom'; }

  const MULCH_NAMES = () => { const o = {}; try { MULCHES.forEach(m => { o[m.k] = m.label; }); } catch (e) { } return o; };
  // the crops of the library, in a box that scrolls (mouse wheel, bar at the right, or the buttons): the crop chosen is the crop of the project
  const CBOX = { x: 0, y: 0, w: 0, h: 0, rows: 0, vis: 3 };
  function cropList(x, y, ww) {
    const keys = Object.keys(CROPS), RH = 26, VIS = 3, bx = x + 74, bw = ww - 74; T('Crop', x, y + 15, { s: 9.5, b: true, c: MUTE });
    ctx.font = '10.5px sans-serif'; const rows = []; let cur = [], xx = 0; keys.forEach(k => { const t = (CROPS[k].label || k), w = ctx.measureText(t).width + 22; if (xx + w > bw - 24) { rows.push(cur); cur = []; xx = 0; } cur.push({ k, t, w }); xx += w + 6; }); if (cur.length) rows.push(cur);
    const vis = Math.min(VIS, rows.length), maxR = Math.max(0, rows.length - vis); PH.cropRow = clamp(PH.cropRow || 0, 0, maxR);
    const sel = rows.findIndex(r => r.some(q => q.k === state.crop)); if (PH.cropSeen !== state.crop) { PH.cropSeen = state.crop; if (sel >= 0 && (sel < PH.cropRow || sel >= PH.cropRow + vis)) PH.cropRow = clamp(sel, 0, maxR); }
    Object.assign(CBOX, { x: bx, y, w: bw, h: vis * RH, rows: rows.length, vis, maxR });
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 3, y - 2, bw + 3, vis * RH + 4); ctx.strokeStyle = '#7A7A7A'; ctx.lineWidth = 1; ctx.strokeRect(bx - 2.5, y - 1.5, bw + 2, vis * RH + 3);
    for (let r = 0; r < vis; r++) { let cx2 = bx; (rows[PH.cropRow + r] || []).forEach(q => { cx2 += chip(cx2, y + r * RH + 1, q.t, state.crop === q.k, () => { applyState({ crop: q.k }); }, 'the crop of the project (' + P.SP[(CMAP[q.k] || (() => { const c = window.CROPLIB && CROPLIB.crops[q.k]; return c ? (KIND[c.kind] || (c.group === 'perennial' ? 'bean' : 'wheat')) : 'wheat'; })())].name.toLowerCase() + ' model)'); }); }
    if (maxR > 0) { const tx = bx + bw - 14, th = vis * RH, thumb = Math.max(18, th * vis / rows.length), ty = y + (th - thumb) * PH.cropRow / maxR; ctx.fillStyle = '#D4D0C8'; ctx.fillRect(tx, y, 14, th); ctx.fillStyle = '#F4F2EC'; ctx.fillRect(tx + 1, ty, 12, thumb); ctx.strokeStyle = '#404040'; ctx.strokeRect(tx + 0.5, ty + 0.5, 12, thumb - 1); CBOX.bar = { x: tx, y, w: 14, h: th, thumb }; hot(tx, y, 14, th, () => { }, 'scroll the crops'); } else CBOX.bar = null;
    T(keys.length + ' crops of the library · scroll with the wheel or the bar · modelled as ' + P.SP[projSpecies()].name.toLowerCase(), bx, y + vis * RH + 14, { s: 8.5, c: MUTE });
    return y + vis * RH + 24;
  }
  function drawControls(y) {
    const w = W - 32, sp = P.SP[PH.sp], g = PH.g, cx = 16, y00 = y; K.frame(cx, y, w, 24, 'Set up the experiment', 'every control re-runs the model; the project supplies soil, tillage, weather and the crop'); y += 30;
    const x0 = cx + 8, ww = w - 16;
    T('Project: ' + DATA.soil_labels[state.soil] + ', ' + TILL_LABELS[state.till].toLowerCase() + ' tillage (consolidation ' + TC_VALUES[state.tcIdx] + ' per day), crop ' + ((CROPS[state.crop] || {}).label || state.crop) + ', warming ' + (TEMP_VALUES[state.tempIdx] >= 0 ? '+' : '') + TEMP_VALUES[state.tempIdx] + ' °C, rain ×' + RAIN_VALUES[state.rainIdx], x0, y + 8, { s: 9.5, c: MUTE });
    y += 18;
    y = cropList(x0, y, ww);
    y = chipRow('Modelled as', Object.keys(P.SP).map(k => ({ k, t: P.SP[k].name, tip: 'model ' + P.SP[k].name.toLowerCase() + (k === projSpecies() ? ' (the nearest to the crop of the project)' : '') })), PH.sp, k => { PH.sp = k; PH.follow = false; PH.area = null; applyPreset(PH.gid === 'custom' ? 'ref' : PH.gid); }, x0, y, ww);
    y = chipRow('Genotype', P.GENO.map(g => ({ k: g.id, t: g.name })).concat(PH.gid === 'custom' ? [{ k: 'custom', t: 'Custom' }] : []), PH.gid, k => { if (k !== 'custom') applyPreset(k); }, x0, y, ww);
    y = chipRow('Drought', [{ k: 'pulse', t: 'Pulse and recovery', tip: 'set-point of the water in the root zone: 1st stress, 2nd stress (two thirds of it), then rewatering, as in the pot experiments' }, { k: 'terminal', t: 'Terminal', tip: 'no water from the onset to the end' }, { k: 'inter', t: 'Intermittent', tip: 'cycles of stress and rewatering' }, { k: 'none', t: 'No stress (control only)' }], PH.dr.type, k => { PH.dr.type = k; }, x0, y, ww);
    y = chipRow('Season starts', [{ k: 'date', t: 'On the date of the toolbar', tip: 'day 0 of every figure is the date shown in the toolbar; change the date and every figure starts again from it' }, { k: 'project', t: 'Planting day of the project', tip: 'the day of the year set in the Properties panel' }, { k: 'auto', t: 'Automatic', tip: 'the planting day of the project when the date of the toolbar falls in that season, otherwise the date of the toolbar' }], PH.sowMode || 'date', k => { PH.sowMode = k; }, x0, y, ww);
    y = chipRow('Time axis', [{ k: 'season', t: 'The season', tip: 'the 140 days of the plant' }, { k: 'year', t: 'The whole year, January to December', tip: 'the calendar year of the season, with the date of the toolbar marked' }], PH.axis || 'season', k => { PH.axis = k; }, x0, y, ww);
    y = chipRow('Climate', Object.keys(CLIM).map(k => ({ k, t: CLIM[k].t })), PH.clim, k => { PH.clim = k; }, x0, y, ww);
    y = chipRow('Rain', [{ k: 'none', t: 'Excluded (rain-out shelter)' }, { k: 'project', t: 'Project rain' + (window.WXD && window.WXD.on ? ' (imported days)' : '') }], PH.rain, k => { PH.rain = k; }, x0, y, ww);
    y = chipRow('Left plant', [{ k: 'pj', t: 'Project irrigation', tip: 'watered by the sensor, trigger and method of the Properties panel, with its mulch, nitrogen and salt' }, { k: 'ww', t: 'Well-watered bench', tip: 'water held at the field capacity, as in a pot experiment' }, { k: 'rf', t: 'Rainfed', tip: 'only the rain of the project' }], PH.ref, k => { PH.ref = k; }, x0, y, ww);
    // sliders in two columns
    const two = ww > 520, cw2 = two ? (ww - 24) / 2 : ww, col = i => two ? x0 + (i % 2) * (cw2 + 24) : x0, row = i => y + (two ? Math.floor(i / 2) : i) * 36; let i = 0;
    const S = (lab, mn, mx, v, txt, set) => { slider(col(i), row(i), cw2, lab, mn, mx, v, txt, set); i++; };
    S('Drought starts (day after emergence)', 10, 110, PH.dr.onset, 'day ' + PH.dr.onset + ' (' + dateOf(PH.dr.onset) + ')', v => { PH.dr.onset = Math.round(v); });
    S('Length of the stress (days)', 6, 60, PH.dr.len, PH.dr.len + ' days', v => { PH.dr.len = Math.round(v); });
    S('Water held in the stress (% of plant-available)', 5, 70, PH.dr.sev, PH.dr.sev + ' %', v => { PH.dr.sev = Math.round(v); });
    S('Extra warming (°C, on top of the project)', -2, 6, PH.xw, (PH.xw >= 0 ? '+' : '') + PH.xw.toFixed(1) + ' °C', v => { PH.xw = Math.round(v * 2) / 2; });
    S('Root angle of the axes (° from vertical)', 12, 80, g.angle, Math.round(g.angle) + '°', v => { g.angle = Math.round(v); customize(); });
    S('Lateral root density (× genotype)', 0.2, 2.5, g.lat, '×' + g.lat.toFixed(2), v => { g.lat = Math.round(v * 20) / 20; customize(); });
    S('Root vigour (growth rate of the axes)', 0.5, 1.6, g.axr, '×' + g.axr.toFixed(2), v => { g.axr = Math.round(v * 20) / 20; customize(); });
    S('Carbon share to roots (× normal)', 0.5, 1.8, g.rootC, '×' + g.rootC.toFixed(2), v => { g.rootC = Math.round(v * 20) / 20; customize(); });
    S('Stay-green (delay of senescence)', 0, 0.9, g.SG, g.SG.toFixed(2), v => { g.SG = Math.round(v * 20) / 20; customize(); });
    S('Stomata close at leaf potential (MPa)', -2.4, -0.5, g.psi50 == null ? sp.psi50 : g.psi50, (g.psi50 == null ? sp.psi50 : g.psi50).toFixed(2), v => { g.psi50 = Math.round(v * 20) / 20; customize(); });
    S('Osmotic adjustment (MPa)', 0, 1, g.OA, g.OA.toFixed(2), v => { g.OA = Math.round(v * 20) / 20; customize(); });
    S('Growing area per plant (cm²)', 80, 1500, PH.area || sp.A, Math.round(PH.area || sp.A) + ' cm²', v => { PH.area = Math.round(v / 10) * 10; });
    y += Math.ceil(i / (two ? 2 : 1)) * 36 + 8; ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, y00 + 0.5, w - 1, y - y00);
    return y + 10;
  }

  // ---------------------------------------------------------------- the shoot of one plant: side view, true geometry of the leaves of the model
  function tcolor(dT) { return pal((dT + 4) / 14); }
  function leafColor(L, view, res, d) {
    if (view === 'thermal') { const Ta = res.Ta[d], Tg = res.Tc[d], Td = res.phi[d]; return pal((((L.gf * Tg + (1 - L.gf) * Td) - Ta) + 4) / 14); }
    if (view === 'xray' || view === 'soil') return view === 'xray' ? 'rgba(210,214,220,0.55)' : mix('#3E8E41', '#B79A3E', 1 - L.gf);
    return L.gf > 0.98 ? '#3F9A44' : mix('#8C6B2C', '#3F9A44', Math.pow(L.gf, 0.7) * 0.9 + (L.gf > 0.5 ? 0.1 : 0));
  }
  function drawShoot(res, d, xc, yg, s, view, rot, c2) {
    if (window.PHREAL && view !== 'xray' && view !== 'soil') return PHREAL.shoot(c2 || ctx, P, res, d, xc, yg, s, view, rot, leafColor);
    const g = P.leaves(res, d, rot), H = res.H[d] * s; ctx.save();
    ctx.strokeStyle = view === 'xray' ? 'rgba(220,224,230,0.7)' : '#5E8F3C'; ctx.lineWidth = Math.max(1.5, Math.min(5, res.H[d] * s * 0.03)); ctx.beginPath(); ctx.moveTo(xc, yg); ctx.lineTo(xc, yg - H); ctx.stroke();
    const order = g.leaves.slice().sort((a, b) => Math.sin(a.az) - Math.sin(b.az));
    order.forEach(L => {
      const ya = yg - L.hgt * s, dx = L.reach * Math.cos(L.az) * s * 1.0, rise = L.len * Math.sin(L.elev) * s * 0.8, wmax = Math.max(1, L.len * (res.sp.ar) * s * 0.5 * L.wr), tipx = xc + dx, tipy = ya - rise * 0.55 + L.len * s * 0.18 * (1 - 0.5 * L.gf);
      const cxp = xc + dx * 0.4, cyp = ya - rise; const pts = [], N0 = 9;
      for (let i = 0; i <= N0; i++) { const t = i / N0, mt = 1 - t, px = mt * mt * xc + 2 * mt * t * cxp + t * t * tipx, py = mt * mt * ya + 2 * mt * t * cyp + t * t * tipy, hw = wmax * Math.sin(Math.PI * Math.pow(Math.max(t, 0.02), 0.7)); pts.push([px, py, hw]); }
      ctx.fillStyle = leafColor(L, view, res, d); ctx.beginPath(); pts.forEach((q, i) => { i ? ctx.lineTo(q[0], q[1] - q[2]) : ctx.moveTo(q[0], q[1] - q[2]); }); for (let i = N0; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + pts[i][2]); ctx.closePath(); ctx.fill();
      if (view !== 'thermal') { ctx.strokeStyle = view === 'xray' ? 'rgba(255,255,255,0.35)' : 'rgba(30,70,30,0.35)'; ctx.lineWidth = 0.7; ctx.beginPath(); pts.forEach((q, i) => { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); }
    });
    ctx.restore(); return g;
  }
  // ---------------------------------------------------------------- the roots of one plant in the column: segments grown up to the day, turned by the rotation of the view
  function drawRoots(res, d, xc, yTop, sx, sy, rot, mode, ctx2) {
    const sg = res.segs; if (!sg) return; const c = ctx2 || ctx; if (!res._cnt) { const cnt = new Int32Array(N + 1); for (let i = 0; i < sg.n; i++) cnt[sg.d[i] + 1]++; for (let k = 1; k <= N; k++) cnt[k] += cnt[k - 1]; res._cnt = cnt; }
    const n = res._cnt[Math.min(N, d + 1)], cr = Math.cos(rot), sr = Math.sin(rot), paths = [new Path2D(), new Path2D(), new Path2D()];
    for (let i = 0; i < n; i++) { const o = sg.o[i], p = paths[o], xa = (sg.x0[i] * cr + sg.z0[i] * sr) * sx + xc, xb = (sg.x1[i] * cr + sg.z1[i] * sr) * sx + xc; p.moveTo(xa, yTop + sg.y0[i] * sy); p.lineTo(xb, yTop + sg.y1[i] * sy); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    const sty = { rgb: [['#F4E6C0', 1.7], ['#E8D3A2', 0.9], ['#DCC48E', 0.55]], xray: [['rgba(255,255,255,0.95)', 1.5], ['rgba(235,235,240,0.7)', 0.8], ['rgba(220,220,230,0.5)', 0.5]], orange: [['#E8832A', 1.9], ['#F0A04A', 1.0], ['#F4B66B', 0.6]], soil: [['#2B2B2B', 1.6], ['#3A3A3A', 0.9], ['#4A4A4A', 0.55]], thermal: [['rgba(40,40,40,0.5)', 1.3], ['rgba(40,40,40,0.35)', 0.7], ['rgba(40,40,40,0.25)', 0.5]] }[mode] || [];
    for (let o = 2; o >= 0; o--) { c.strokeStyle = sty[o][0]; c.lineWidth = sty[o][1]; c.stroke(paths[o]); }
  }
  function column(x, y, cw, ch, bg, rimTop) { // a cylinder seen from the side
    ctx.fillStyle = bg; ctx.fillRect(x, y, cw, ch); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
    if (rimTop) { ctx.beginPath(); ctx.ellipse(x + cw / 2, y, cw / 2, 5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.stroke(); }
  }
  function soilFill(res, d, x, y, cw, ch, view) {
    const dz = ch / NL; const tx = DATA.texture[state.soil], base = tx.color || '#C9A76B';
    for (let i = 0; i < NL; i++) {
      const f = res.w[d * NL + i];
      ctx.fillStyle = view === 'soil' ? wcol(f) : view === 'xray' ? mix('#2A2D33', '#4A515C', f) : view === 'thermal' ? mix('#5B4A38', '#4A5C6E', f) : mix(mix(base, '#6A4B2C', 0.5), '#4A3520', f * 0.55);
      ctx.fillRect(x, y + i * dz, cw, dz + 0.5);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; for (let i = 1; i < NL; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * dz + 0.5); ctx.lineTo(x + cw, y + i * dz + 0.5); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.strokeRect(x + 0.5, y + 0.5, cw - 1, ch - 1);
  }
  const VIEWS = [{ k: 'rgb', t: 'Camera (RGB)', tip: 'what a visible-light camera and a rhizotron window see' }, { k: 'thermal', t: 'Thermal camera', tip: 'canopy temperature from the energy balance of each leaf' }, { k: 'xray', t: 'X-ray tomography', tip: 'roots as a scanner shows them' }, { k: 'soil', t: 'Soil water', tip: 'relative plant-available water of each layer' }];
  function thermalBar(x, y, w) { for (let i = 0; i < w; i++) { ctx.fillStyle = pal(i / w); ctx.fillRect(x + i, y, 1, 7); } T('−4 K', x, y + 18, { s: 8.5, c: MUTE }); T('+10 K above air', x + w, y + 18, { s: 8.5, c: MUTE, a: 'right' }); }

  function drawTwin(y) {
    const w = W - 32, cx = 16, d = day(), sp = P.SP[PH.sp]; const SH = 318, ZH = 200, hh = 76 + SH + ZH + 36; K.frame(cx, y, w, hh, 'Plant and roots, side by side', 'day ' + d + ' after emergence (' + dateOf(d) + ') · drag to turn · ' + (play.on ? 'playing' : 'paused'));
    let yy = y + 28, xx = cx + 8; VIEWS.forEach(v => { xx += chip(xx, yy, v.t, PH.view === v.k, () => { PH.view = v.k; }, v.tip); });
    yy += 30; const colw = (w - 24) / 2, view = PH.view, rot = PH.rot; ROT.x = cx; ROT.y = yy; ROT.w = w; ROT.h = SH + ZH + 36;
    ['ww', 'dr'].forEach((tr, ci) => {
      const res = R(tr); if (!res) return; const x0 = cx + 8 + ci * (colw + 8), xc = x0 + colw / 2; ctx.fillStyle = view === 'xray' ? '#15181D' : '#F6F4EE'; ctx.fillRect(x0, yy, colw, SH + ZH + 34); ctx.strokeStyle = '#D2CEC2'; ctx.strokeRect(x0 + 0.5, yy + 0.5, colw - 1, SH + ZH + 33); ctx.fillStyle = view === 'xray' ? '#15181D' : '#FFFFFF'; ctx.fillRect(x0 + 1, yy + 22, colw - 2, 60);
      const lab = tr === 'ww' ? RNc() : 'Drought', col = tr === 'ww' ? '#1B1F23' : '#D93025'; ctx.fillStyle = col; ctx.fillRect(x0, yy, 4, 22); T(lab, x0 + 10, yy + 15, { s: 11, b: true, c: view === 'xray' ? '#E8EAEE' : col });
      const tg = res.tgt[d]; T((res.tr === 'pj' ? 'irrigated ' + fmt(res.totals.Ig) + ' mm (' + res.nIrr + ' events)' : res.tr === 'rf' ? 'rain only' : 'water ' + fmt(res.tgt[d] * 100) + ' % set') + ' · soil ' + fmt(100 * res.store[d] / res.awcT) + ' %', x0 + colw - 8, yy + 15, { s: 9, c: view === 'xray' ? '#AEB4BD' : MUTE, a: 'right' });
      const BAND = 82, gy = yy + 26 + SH - 18, s = (gy - (yy + BAND + 6)) / (Math.max(R('ww').H[N - 1], R('dr').H[N - 1], 10) * 1.12);
      // the shoot and, in the thermal view, its temperature
      if (view === 'thermal') { ctx.fillStyle = '#F0F2F6'; ctx.fillRect(x0 + 1, yy + 23, colw - 2, SH - 17); }
      else if (view !== 'xray') { const sk = ctx.createLinearGradient(0, yy + BAND, 0, gy + 6); sk.addColorStop(0, '#F3F6EE'); sk.addColorStop(1, '#E4EBD9'); ctx.fillStyle = sk; ctx.fillRect(x0 + 1, yy + BAND, colw - 2, gy + 6 - (yy + BAND)); }
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + 1, yy + BAND, colw - 2, gy + 10 - (yy + BAND)); ctx.clip();
      const geo = drawShoot(res, d, xc, gy, s, view, rot); ctx.restore();
      // ground and soil column
      const CW = Math.min(colw - 36, 150), zx = xc - CW / 2, zy = gy + 6, sy = (ZH - 8) / ZMAX, sx = (CW / 2 - 4) / res.Rpot; column(zx, zy, CW, ZH - 8, '#333', false); soilFill(res, d, zx, zy, CW, ZH - 8, view);
      drawRoots(res, d, xc, zy, sx, sy, rot, view === 'xray' ? 'xray' : view === 'soil' ? 'soil' : view === 'thermal' ? 'thermal' : 'rgb');
      ctx.strokeStyle = view === 'xray' ? '#6A717C' : '#6B5B3E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 6, gy + 6); ctx.lineTo(x0 + colw - 6, gy + 6); ctx.stroke();
      for (let k = 1; k < 4; k++) T(k * 30 + ' cm', zx - 4, zy + k * 30 * sy + 3, { s: 8, c: view === 'xray' ? '#8A919B' : MUTE, a: 'right' });
      const sh_ = view === 'xray' ? '#C9CED6' : '#33414F';
      const txt = ['height ' + fmt(res.H[d]) + ' cm · shoot area ' + fmt(res.PSA[d]) + ' cm²', 'solidity ' + fmt(res.solid[d] * 100) + ' % · senescent ' + fmt(res.SI[d]) + ' % · LAI ' + fmt(res.LAIg[d], 1), 'canopy ' + fmt(Math.abs(res.CTD[d]), 1) + ' K ' + (res.CTD[d] >= 0 ? 'cooler' : 'warmer') + ' than air · RWC ' + fmt(res.RWC[d] * 100) + ' %', 'roots ' + fmt(res.Lroot[d] / 100, 1) + ' m · depth ' + fmt(res.Rdepth[d]) + ' cm · D95 ' + fmt(res.D95[d]) + ' cm'];
      for (let i = 0; i < 4; i++) TF(txt[i], x0 + 8, yy + 38 + i * 12.5, colw - 16, { s: 9.5, c: sh_ });
    });
    if (view === 'thermal') thermalBar(cx + w - 190, y + 33, 120);
    T('the width of the soil column is enlarged', cx + 12, y + hh - 6, { s: 8.5, c: MUTE });
    const p0 = ROT; hot(p0.x, p0.y, p0.w, p0.h, () => { }, 'drag to turn the plants');
    return y + hh + 10;
  }

  // ---------------------------------------------------------------- scans of the roots at four dates (as in the root tomography figures), cached
  function drawStrip(y) {
    const w = W - 32, cx = 16, hh = 384; K.frame(cx, y, w, hh, 'Root scans through the season', (PH.trt === 'ww' ? RN() : 'drought') + ' plant · top: scanner image · bottom: reconstruction · turn with the mouse above');
    let xx = cx + 8; xx += chip(xx, y + 28, RNc(), PH.trt === 'ww', () => { PH.trt = 'ww'; }, 'show the plant of the left column'); chip(xx, y + 28, 'Drought', PH.trt === 'dr', () => { PH.trt = 'dr'; }, 'show the plant under drought');
    const res = R(PH.trt); if (!res) return y + hh + 10; const days = [0.25, 0.5, 0.75, 1].map(f => Math.round(f * (N - 1))), cw = (w - 16) / 4, ZH = 120, rq = Math.round(PH.rot / 0.26);
    const key = PH.key + PH.trt + rq; if (!PH.cache || PH.cache.key !== key) { PH.cache = { key, cv: [] }; }
    days.forEach((dd, i) => {
      const x0 = cx + 8 + i * cw, wid = cw - 10, CW = Math.min(wid - 20, 78); let pair = PH.cache.cv[i];
      if (!pair) {
        pair = []; for (let m = 0; m < 2; m++) { const cv = document.createElement('canvas'); cv.width = Math.ceil(wid); cv.height = ZH + 14; const c = cv.getContext('2d'); c.fillStyle = m ? '#B9BCC2' : '#0A0B0D'; c.fillRect(0, 0, cv.width, cv.height);
          const zx = (wid - CW) / 2; if (m) { c.fillStyle = '#9EA2A9'; c.fillRect(zx, 8, CW, ZH - 4); c.strokeStyle = '#6F737A'; c.strokeRect(zx + 0.5, 8.5, CW - 1, ZH - 5); }
          drawRoots(res, dd, wid / 2, 8, (CW / 2 - 3) / res.Rpot, (ZH - 4) / ZMAX, PH.rot, m ? 'orange' : 'xray', c); pair.push(cv); }
        PH.cache.cv[i] = pair;
      }
      const oy = y + 78; ctx.drawImage(pair[0], x0, oy); ctx.drawImage(pair[1], x0, oy + ZH + 18); ctx.strokeStyle = '#6A6E75'; ctx.strokeRect(x0 + 0.5, oy + 0.5, wid - 1, ZH + 13); ctx.strokeRect(x0 + 0.5, oy + ZH + 18.5, wid - 1, ZH + 13);
      T('day ' + dd + ' (' + dateOf(dd) + ')', x0 + 2, oy - 5, { s: 9.5, b: true }); TF(fmt(res.Lroot[dd] / 100, 1) + ' m of root, depth ' + fmt(res.Rdepth[dd]) + ' cm', x0 + 2, oy + 2 * ZH + 46, wid, { s: 9, c: MUTE });
      hot(x0, oy, wid, 2 * ZH + 30, () => { play.t = dd / (N - 1); play.on = false; }, 'jump to day ' + dd);
    });
    return y + hh + 10;
  }

  // ---------------------------------------------------------------- time series like the figures of the phenotyping platforms: one row per trait, well-watered against drought
  const SETS = {
    shoot: [{ t: 'Plant height', u: 'cm', f: r => r.H }, { t: 'Projected shoot area', u: 'cm²', f: r => r.PSA }, { t: 'Shoot solidity (area / convex hull)', u: '%', f: r => r.solid, s: 100 }, { t: 'Senescence index', u: '%', f: r => r.SI }],
    water: [{ t: 'Leaf relative water content', u: '%', f: r => r.RWC, s: 100 }, { t: 'Leaf water potential, midday', u: 'MPa', f: r => r.psiL }, { t: 'Canopy temperature depression (air minus canopy)', u: 'K', f: r => r.CTD }, { t: 'Crop water stress index', u: '0 to 1', f: r => r.CWSI }],
    carbon: [{ t: 'Net assimilation (biomass gained per day)', u: 'g/m²/d', f: r => r.dW }, { t: 'Share of the carbon sent to the roots', u: '%', f: r => r.fr, s: 100 }, { t: 'Root : shoot ratio (dry mass)', u: '', f: r => Array.from(r.Wr, (v, i) => v / Math.max(0.01, r.Wl[i] + r.Ws[i] + r.Wg[i])) }, { t: 'Green leaf area index', u: 'm²/m²', f: r => r.LAIg }],
    roots: [{ t: 'Root depth (deepest tip)', u: 'cm', f: r => r.Rdepth }, { t: 'Root length of the plant', u: 'm', f: r => r.Lroot, s: 0.01 }, { t: 'Root growth per day', u: 'cm/d', f: r => r.dL }, { t: 'Depth of 95 % of the root length', u: 'cm', f: r => r.D95 }]
  };
  const SETN = [{ k: 'shoot', t: 'Shoot (as in the imaging platforms)' }, { k: 'water', t: 'Water status' }, { k: 'carbon', t: 'Carbon' }, { k: 'roots', t: 'Roots' }];
  const OBSK = { 'Plant height': 'height', 'Projected shoot area': 'area', 'Shoot solidity (area / convex hull)': 'solidity', 'Senescence index': 'senescence', 'Leaf relative water content': 'rwc', 'Canopy temperature depression (air minus canopy)': 'ctd' };
  function seriesVals(row, res) { const v = row.f(res), s = row.s == null ? 1 : row.s, out = new Array(N); for (let i = 0; i < N; i++) out[i] = v[i] * s; return out; }
  function drawSeries(y) {
    const w = W - 32, cx = 16, rows = SETS[PH.set], rh = 92, hh = 84 + rows.length * rh; K.frame(cx, y, w, hh, 'Traits through time: ' + RN() + ' against drought', 'click or drag on a chart to move the day');
    let xx = cx + 8; SETN.forEach(s => { xx += chip(xx, y + 28, s.t, PH.set === s.k, () => { PH.set = s.k; }, 'show ' + s.t.toLowerCase()); });
    const x0 = cx + 62, ww = w - 62 - 14, d = day(); TS.x = x0; TS.w = ww; TS.y = y + 58; TS.h = rows.length * rh;
    const shade = regimeShade();
    rows.forEach((row, ri) => {
      const top = y + 62 + ri * rh, hgt = rh - 26, a = seriesVals(row, R('ww')), b = seriesVals(row, R('dr'));
      let mn = Infinity, mx = -Infinity; [a, b].forEach(q => q.forEach(v => { if (isFinite(v)) { mn = Math.min(mn, v); mx = Math.max(mx, v); } }));
      const obsK = OBSK[row.t], obs = PH.obs && obsK && PH.obs.cols.includes(obsK) ? PH.obs.rows.filter(o => isFinite(o[obsK])) : [];
      obs.forEach(o => { mn = Math.min(mn, o[obsK]); mx = Math.max(mx, o[obsK]); });
      if (!isFinite(mn)) { mn = 0; mx = 1; } const pad = (mx - mn) * 0.08 + 1e-9, nonneg = mn >= 0; mn -= pad; mx += pad; if (nonneg && mn < 0) mn = 0;
      const X = xmap(x0, ww), Y = v => top + hgt - (v - mn) / (mx - mn) * hgt;
      shade.forEach(s => { ctx.fillStyle = s[2]; ctx.fillRect(X(s[0]), top, X(s[1]) - X(s[0]), hgt); });
      ctx.strokeStyle = GRID; ctx.lineWidth = 1; for (let g = 0; g <= 3; g++) { const yy = top + hgt * g / 3; ctx.beginPath(); ctx.moveTo(x0, yy + 0.5); ctx.lineTo(x0 + ww, yy + 0.5); ctx.stroke(); T(fmt(mx - (mx - mn) * g / 3, mx - mn < 5 ? 2 : (mx - mn < 50 ? 1 : 0)), x0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); }
      TF(row.t + (row.u ? ' (' + row.u + ')' : ''), x0 + 4, top + 10, ww - 10, { s: 9.5, b: true });
      [[a, '#1B1F23'], [b, '#D93025']].forEach(([q, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); let st = false; for (let i = 0; i < N; i++) { if (!isFinite(q[i])) { st = false; continue; } st ? ctx.lineTo(X(i), Y(q[i])) : ctx.moveTo(X(i), Y(q[i])); st = true; } ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(d), Y(q[d]), 3.4, 0, Math.PI * 2); ctx.fill(); });
      obs.forEach(o => { ctx.fillStyle = o.trt === 'dr' ? '#D93025' : '#1B1F23'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(X(o.day) - 3, Y(o[obsK]) - 3, 6, 6); ctx.fill(); ctx.stroke(); });
      ctx.strokeStyle = '#2E7DE8'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d) + 0.5, top); ctx.lineTo(X(d) + 0.5, top + hgt); ctx.stroke(); ctx.setLineDash([]); todayMark(X, top, hgt);
      if (ri === rows.length - 1) { axisDates(X, top + hgt, x0, ww); }
      { const lt = fmt(a[d], mx - mn < 5 ? 2 : 1) + ' / ' + fmt(b[d], mx - mn < 5 ? 2 : 1); ctx.font = 'bold 9px sans-serif'; const lw = ctx.measureText(lt).width + 8; ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fillRect(x0 + ww - lw - 2, top + 1, lw, 13); T(lt, x0 + ww - 6, top + 11, { s: 9, b: true, c: '#33414F', a: 'right' }); }
    });
    K.legend([['#1B1F23', RN()], ['#D93025', 'drought']].concat(shade.length ? [['#F6D9A8', 'stress'], ['#D3DDF3', 'recovery']] : []).concat(PH.obs ? [['#888', 'square: your observations']] : []), cx + 10, y + hh - 10);
    hot(TS.x, TS.y, TS.w, TS.h, () => { }, 'click or drag to move the day');
    return y + hh + 10;
  }

  // ---------------------------------------------------------------- draw of the whole layer
  const SECTIONS = [];
  const PREF = '       ';
  function chevron(x, y, open) { ctx.fillStyle = '#1B3A6B'; ctx.beginPath(); if (open) { ctx.moveTo(x, y + 8); ctx.lineTo(x + 10, y + 8); ctx.lineTo(x + 5, y + 15); } else { ctx.moveTo(x + 2, y + 5); ctx.lineTo(x + 2, y + 17); ctx.lineTo(x + 9, y + 11); } ctx.closePath(); ctx.fill(); }
  function runBar(y, ranNow) {
    let xx = 16; const c1 = ranNow ? 'Run again' : '▶  Run simulation'; ctx.font = 'bold 11px sans-serif'; const bw = ctx.measureText(c1).width + 28;
    ctx.fillStyle = '#0A246A'; ctx.fillRect(xx, y, bw, 26); ctx.fillStyle = '#3A6EA5'; ctx.fillRect(xx, y, bw, 2); ctx.fillRect(xx, y, 2, 26); ctx.fillStyle = '#000'; ctx.fillRect(xx, y + 24, bw, 2); ctx.fillRect(xx + bw - 2, y, 2, 26); T(c1, xx + bw / 2, y + 17, { s: 11, b: true, c: '#fff', a: 'center' }); hot(xx, y, bw, 26, runNow, 'compute the plants with the controls above and the Properties panel'); xx += bw + 10;
    if (ranNow) { xx += chip(xx, y + 2, 'Collapse all', false, () => { SECTIONS_ALL().forEach(q => { PH.open[q.id] = false; }); }, 'close every section to its title'); xx += chip(xx, y + 2, 'Expand all', false, () => { PH.open = {}; }, 'open every section'); }
    return y + 34;
  }
  // the day shown when the layer opens: the date of the toolbar when it falls in the season, else the middle of the season
  function startT() { try { const q = window.PHUI.outlook.season(window.PHUI.outlook.toolbarDate()); if (q.idx >= 0 && q.idx < N) return q.idx / (N - 1); } catch (e) { } return 0.5; }
  function runNow() { PH.ran = true; PH.why = ''; PH.key = ''; PH.ranKey = ''; PH.lastDate = dKey(); ensureRun(); PH.ranKey = keyOf(false); play.t = startT(); play.on = false; }
  const SECTIONS_ALL = () => BASE.concat(SECTIONS);
  const BASE = [{ id: 'ctl', t: 'Set up the experiment', s: 'every control re-runs the model; the project supplies soil, tillage, weather and the crop', fn: drawControls }, { id: 'twin', t: 'Plant and roots, side by side', s: 'drag to turn', fn: drawTwin }, { id: 'scans', t: 'Root scans through the season', s: 'scanner image and reconstruction', fn: drawStrip }, { id: 'series', t: 'Traits through time', s: 'click or drag on a chart to move the day', fn: drawSeries }];
  function drawPh() {
    paper(); const now = performance.now(); if (PH.anim && PH.anim.on) { const dt = Math.min(0.12, (now - PH.anim.t0) / 1000); PH.anim.t0 = now; play.on = false; play.t = Math.min(1, play.t + dt / PH.anim.dur); if (play.t >= 1) PH.anim.on = false; PH.last = now; } if (now - PH.last > 700) { play.t = startT(); play.on = false; PH.firstTouch = now; } PH.last = now; SL.length = 0; SCR.length = 0;
    if (PH.follow && PH.sp !== projSpecies()) { PH.sp = projSpecies(); applyPreset(PH.gid === 'custom' ? 'ref' : PH.gid); PH.area = null; }
    const gate = !window.__REPORTING && !window.__NORUNGATE; if (!gate && !PH.ran) { PH.ran = true; PH.ranKey = ''; }
    if (PH.keepRan) { PH.keepRan = false; if (PH.ran) PH.ranKey = keyOf(false); }
    if (gate && PH.ran && PH.ranKey && PH.ranKey !== keyOf(false)) { PH.ran = false; PH.why = 'controls changed'; }
    { const dk = dKey(); if (PH.lastDate == null) PH.lastDate = dk; if (PH.lastDate !== dk) { PH.lastDate = dk; if (PH.ran) { play.t = startT(); PH.anim.on = false; } } }
    if (PH.ran) ensureRun();
    let y = K.header('Deterministic phenotyping', 'Equation-based simulation of plant structure and function under drought · same inputs always give the same plant · soil, tillage, weather and crop from the project', 4);
    const lc = libCrop(), cl = window.CROPLIB && CROPLIB.crops[state.crop];
    K.badge(PH.ran ? 'MODEL RUN' : 'NOT RUN', 16, y, PH.ran ? '#1E8E3E' : '#B8743A'); { const hn = sidWrap('Date ' + clockTxt() + ' (the model steps by whole days) · crop ' + ((CROPS[state.crop] || cl || {}).label || state.crop) + ' (modelled as ' + P.SP[PH.sp].name.toLowerCase() + ') sown ' + dateOf(0) + ', ' + CLIM[PH.clim].t.toLowerCase() + ', genotype ' + (PH.gid === 'custom' ? 'custom' : (P.GENO.find(g => g.id === PH.gid) || {}).name) + ' · soil ' + (DATA.soil_labels[state.soil] || state.soil) + ', ' + (TILL_LABELS[state.till] || state.till).toLowerCase() + ' tillage', 92, y + 11, W - 108, { s: 9.5, c: MUTE }, 12.5); y += Math.max(1, hn) * 12.5 + 10; }
    if (!PH.ran) {
      y = drawControls(y); y = runBar(y + 2, false);
      const bw = Math.min(W - 32, 560), bx = 16, by = y + 4, bh = 118; ctx.fillStyle = '#D4D0C8'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by, 1, bh); ctx.fillStyle = '#404040'; ctx.fillRect(bx, by + bh - 1, bw, 1); ctx.fillRect(bx + bw - 1, by, 1, bh);
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#0A246A'); g.addColorStop(0.7, '#3A6EA5'); g.addColorStop(1, '#A6CAF0'); ctx.fillStyle = g; ctx.fillRect(bx + 3, by + 3, bw - 6, 20); T('Run the simulation', bx + 10, by + 17, { s: 11, b: true, c: '#FFFFFF' });
      sidWrap(PH.why ? 'The ' + PH.why + ': the plants, roots, water, carbon and traits wait for a new run.' : 'Set the crop, genotype, drought and the controls of the Properties panel, then press Run simulation above. The plants, roots, water, carbon, traits and the comparison with the SWAFL data are computed only from your settings.', bx + 14, by + 42, bw - 28, { s: 10, c: '#000' }, 13);
      try { const h = Math.ceil(by + bh + 30); if (Math.abs(currentScene.h - h) > 4) { currentScene.h = h; setCanvasH(h); } } catch (e) { }
      return;
    }
    if (!PH.run) { T(PH.msg ? 'The model could not run: ' + PH.msg : 'Preparing the run...', 16, y + 24, { s: 12, c: MUTE }); return; }
    PH.secY = {}; SECTIONS_ALL().forEach(sec => {
      PH.secY[sec.id] = y; const y0 = y, open = PH.open[sec.id] !== false, tog = () => { PH.open[sec.id] = !open; };
      if (!open) { K.frame(16, y, W - 32, 24, PREF + sec.t, sec.s || ''); chevron(24, y, false); hot(16, y, W - 32, 24, tog, 'open this section'); y += 34; return; }
      const of = K.frame; let first = true; K.frame = function () { const a = Array.prototype.slice.call(arguments); if (first && a[1] === y0) { a[4] = PREF + a[4]; first = false; } return of.apply(this, a); };
      try { y = sec.fn(y); } catch (e) { console.error('dph section', sec.id, e); T('A section could not be drawn: ' + e.message, 16, y + 16, { s: 10, c: '#D93025' }); y += 30; } finally { K.frame = of; }
      chevron(24, y0, true); hot(16, y0, W - 32, 24, tog, 'close this section');
      if (sec.id === 'ctl') y = runBar(y, true);
    });
    try { if (Math.abs(currentScene.h - (y + 20)) > 4) { currentScene.h = Math.ceil(y + 20); setCanvasH(currentScene.h); } } catch (e) { }
    jobStep(); panelStep();
  }
  // ---------------------------------------------------------------- pointer: sliders, turning, scrubbing
  canvas.addEventListener('wheel', e => { try { if (currentScene.id !== 'dph' || !CBOX.rows || CBOX.maxR < 1) return; const r = canvas.getBoundingClientRect(), px = (e.clientX - r.left) * canvas.width / r.width, py = (e.clientY - r.top) * canvas.height / r.height; if (px >= CBOX.x - 3 && px <= CBOX.x + CBOX.w && py >= CBOX.y - 2 && py <= CBOX.y + CBOX.h + 2) { const n = clamp((PH.cropRow || 0) + (e.deltaY > 0 ? 1 : -1), 0, CBOX.maxR); if (n !== PH.cropRow) { PH.cropRow = n; e.preventDefault(); } else if (n > 0 && n < CBOX.maxR) e.preventDefault(); } } catch (x) { } }, { passive: false });
  function onDown(p) {
    if (CBOX.bar && p.x >= CBOX.bar.x && p.x <= CBOX.bar.x + CBOX.bar.w && p.y >= CBOX.bar.y && p.y <= CBOX.bar.y + CBOX.bar.h) { PH.drag = { t: 'cb' }; PH.cropRow = clamp(Math.round((p.y - CBOX.bar.y) / CBOX.bar.h * (CBOX.maxR + 1) - 0.5), 0, CBOX.maxR); return true; }
    for (const s of SL) if (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h) { PH.drag = { t: 'sl', s }; PH.dragging = true; s.set(slVal(s, p.x)); return true; }
    for (const q of SCR) if (p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h) { PH.drag = { t: 'sc', q }; play.t = clamp((p.x - q.x0) / q.w0, 0, 1); play.on = false; return true; }
    if (p.x >= TS.x && p.x <= TS.x + TS.w && p.y >= TS.y && p.y <= TS.y + TS.h) { PH.drag = { t: 'ts' }; play.t = clamp((p.x - TS.x) / TS.w, 0, 1); play.on = false; return true; }
    const hs = hotAt(p); if (hs && hs.tip !== 'drag to turn the plants') { hs.fn(p); return true; }
    if (p.x >= ROT.x && p.x <= ROT.x + ROT.w && p.y >= ROT.y && p.y <= ROT.y + ROT.h) { PH.drag = { t: 'rot', x0: p.x, r0: PH.rot }; return true; }
    return false;
  }
  function onMove(p) {
    const dg = PH.drag; if (!dg) { hotMove(p); return false; }
    if (dg.t === 'cb') { PH.cropRow = clamp(Math.round((p.y - CBOX.bar.y) / CBOX.bar.h * (CBOX.maxR + 1) - 0.5), 0, CBOX.maxR); return true; }
    if (dg.t === 'sl') { dg.s.set(slVal(dg.s, p.x)); return true; } if (dg.t === 'ts') { play.t = clamp((p.x - TS.x) / TS.w, 0, 1); return true; } if (dg.t === 'sc') { play.t = clamp((p.x - dg.q.x0) / dg.q.w0, 0, 1); return true; } if (dg.t === 'rot') { PH.rot = dg.r0 + (p.x - dg.x0) * 0.012; return true; } return false;
  }
  function onUp() { PH.drag = null; PH.dragging = false; }
  // background jobs (genotype panel, calibration) run one step per frame; part 2 fills these
  let jobStep = () => { }, panelStep = () => { };
  window.PHUI = { xmap, yearAxis, dateOfY, axisDates, todayMark, startMs, clockTxt, leafColor, drawRoots, drawShoot, BASE, SCR, scrub, runNow, RN, RNc, projObj, nResponse, libCrop, PH, P, K, SECTIONS, chip, chipRow, slider, SL, mix, pal, wcol, day, dateOf, R, N, NL, DZ, ZMAX, CLIM, effGeno, cfgFor, ensureRun, keyOf, seriesVals, SETS, OBSK, regimeShade, sowDoy, envObj, soilObj, setJob: f => { jobStep = f; }, setPanel: f => { panelStep = f; }, redraw: () => { PH.key = ''; } };
  K.add('dph', 'P1 Deterministic phenotyping', '#2F7F3E', drawPh, 'Deterministic phenotyping: plants, roots, water and carbon under drought, from equations', 'Roots, leaves, water and carbon are linked: a change in root angle, stay-green, stomata or soil structure moves every trait at once, and the traits seen above ground reveal what the roots do below.');
  const sc = SCENES.find(s => s.id === 'dph'); if (sc) { sc.play = true; sc.dur = 40; sc.h = 3600; sc.onDown = onDown; sc.onMove = onMove; sc.onUp = onUp; sc.onLeave = () => { hotUi.hover = null; }; }
  // the button of the web explorer, in the group of the soil
  (function place() {
    const s = SCENES.find(x => x.id === 'dph'), bar = document.getElementById('sceneBar'); if (!s || !bar || bar.querySelector('[data-scene="dph"]')) return;
    const b = document.createElement('div'); b.className = 'scenebtn'; b.innerHTML = '<span class="no">P1</span><span>Deterministic phenotyping</span>'; b.style.setProperty('--sc', s.color); b.dataset.scene = 'dph'; b.title = s.title; b.onclick = () => switchScene(s);
    const h = document.createElement('div'); h.className = 'scenegrp'; h.textContent = 'Phenotyping'; bar.appendChild(h); bar.appendChild(b);
  })();
})();
