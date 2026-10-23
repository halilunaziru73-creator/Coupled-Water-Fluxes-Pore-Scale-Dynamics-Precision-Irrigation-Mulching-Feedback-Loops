/* SWAFL 1.1  F1 Virtual farm: the irrigation system from the water source to the plants, run on the predicted
   schedule of the daily model. The gate or valve opens on the days the daily model irrigates (sensor at the
   trigger), the water travels source - pump - filter - main - valve - laterals / furrows / sprinklers - plants,
   and the losses (runoff, deep percolation, evaporation and drift) are those of the current design layers.
   Everything follows the controls: soil, crop, irrigation system, trigger, sensor depth, mulch, rain and warming. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined') return;
  const FM = { auto: false, rec: null, recT: 0, sys: null, t0: performance.now() };
  window.__FARM = FM;
  const SYS = [['furrow', 'Furrow'], ['basin', 'Basin'], ['border', 'Border strip'], ['sprinkler', 'Sprinkler'], ['drip', 'Surface drip'], ['sdi', 'Subsurface drip']];
  const sysNow = () => { const m = state.method; if (m === 'M01_Overhead') return 'sprinkler'; if (/Drip/.test(m)) { const mid = (METHODS.find(q => q.k === m) || {}).mid || 0; return mid >= 30 ? 'sdi' : 'drip'; } return (typeof SP !== 'undefined' && (SP.lay === 'basin' || SP.lay === 'border')) ? SP.lay : 'furrow'; };
  const setSys = k => { try { autoPause(); } catch (e) {} if (k === 'sdi') applyState({ method: 'M09_Drip40-50cm' }); else if (k === 'drip') applyState({ method: 'M04_Drip10-20cm' }); else spSetLayout(k); };
  const tnow = () => (performance.now() - FM.t0) / 1000;
  const lerp = (a, b, f) => a + (b - a) * f;
  const fmt = (v, d) => (v == null || !isFinite(v)) ? '–' : v.toFixed(d || 0);

  // ------------------------------------------------------------------ losses of the current design
  function design(sys) {
    try {
      if (sys === 'sprinkler') { const R = spRun(); return { Ea: R.Ea, dp: R.dp || 0, ro: R.ro || 0, ev: R.wdTot || R.wdel || 0, hours: R.T ? R.T / 60 : null, label: 'S4 sprinkler design', CU: R.CU }; }
      if (sys === 'drip' || sys === 'sdi') { const R = drRun(); return { Ea: R.Ea, dp: R.dp || 0, ro: 0, ev: R.ev || 0, hours: R.t, label: 'S3 drip design', CU: R.Eu }; }
      const R = sysDesign(sys); return { Ea: R.Ea, dp: R.dp || 0, ro: R.ro || 0, ev: 0, hours: R.tco ? R.tco / 60 : null, label: 'S2 surface design (' + sys + ', best inflow ' + R.q.toFixed(2) + ' L/s)', r: R.r, CU: R.cu / 100 };
    } catch (e) { return { Ea: 0.6, dp: 0.28, ro: 0.12, ev: 0, hours: null, label: 'typical' }; }
  }

  // surface subtype shown on the farm: its own layout and the inflow with the best application x storage efficiency
  const _sd = {};
  function sysDesign(sys) {
    const d = SIDDEF[sys] || SIDDEF.border, key = [sys, state.soil, Math.round(seasonSim().fTrig * 100), SID.cut, SID.om].join('|'); if (_sd[key]) return _sd[key];
    const base = sys === SID.sys ? {} : { sys, L: d.L, S: d.S, n: d.n }, qmax = sys === 'furrow' ? Math.min(d.qr[1], 0.04 / (base.S || SID.S) * 1000 / 60) : d.qr[1];
    let best = null, be = -1; for (let i = 0; i <= 16; i++) { const q = d.qr[0] + (qmax - d.qr[0]) * i / 16, R = sidRun(Object.assign({}, base, { qLs: q }), 1), sc = R.Ea * R.Es; if (sc > be) { be = sc; best = Object.assign({ q }, R); } }
    return (_sd[key] = best);
  }
  // ------------------------------------------------------------------ the next irrigations predicted by the daily model
  function schedule(sim, kd, n) { const out = []; for (let d = kd; d < ND && out.length < n; d++) if (sim.irr[d] > 0) out.push(d); return out; }

  // ------------------------------------------------------------------ small isometric plants (one per kind)
  function miniPlant(x, y, s, kind, cov, rand, decid) {
    const g = Math.max(0.15, cov), hh = s * g;
    const stem = (x0, y0, x1, y1, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
    if (['tree', 'citrus', 'olive', 'bush', 'cocoa'].includes(kind)) {
      const r = s * (kind === 'bush' ? 0.32 : 0.45), col = kind === 'olive' ? '#87A275' : kind === 'citrus' ? '#2E7A3A' : kind === 'cocoa' ? '#2A6A32' : '#4E9A3A';
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(x + r * 0.4, y + 1, r * 1.1, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      stem(x, y, x, y - s * 0.42, Math.max(1.5, s * 0.07), '#6B4A2E');
      if (decid && cov < 0.25) { for (let k = 0; k < 6; k++) stem(x, y - s * 0.42, x + (rand() - 0.5) * r * 2, y - s * 0.42 - r * (0.6 + rand() * 0.8), 1, '#7A5A3A'); return; }
      for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 3 ? col : shade(col, -22); ctx.beginPath(); ctx.arc(x + (rand() - 0.5) * r * 1.2, y - s * 0.42 - r * (0.5 + rand() * 0.6), r * (0.45 + rand() * 0.3), 0, Math.PI * 2); ctx.fill(); }
      if (kind === 'citrus') for (let k = 0; k < 4; k++) { ctx.fillStyle = '#F08A1A'; ctx.beginPath(); ctx.arc(x + (rand() - 0.5) * r * 1.4, y - s * 0.42 - r * (0.3 + rand() * 0.8), Math.max(1.2, s * 0.05), 0, Math.PI * 2); ctx.fill(); }
      if (kind === 'bush') for (let k = 0; k < 4; k++) { ctx.fillStyle = '#3A4FA8'; ctx.beginPath(); ctx.arc(x + (rand() - 0.5) * r * 1.4, y - s * 0.4 - r * rand(), 1.4, 0, Math.PI * 2); ctx.fill(); }
      return;
    }
    if (kind === 'palm' || kind === 'papaya') { const ht = s * (kind === 'palm' ? 1.3 : 0.9); stem(x, y, x + 2, y - ht, Math.max(2, s * 0.08), '#8A6A45'); for (let k = 0; k < 7; k++) { const a = -Math.PI * (0.08 + 0.84 * k / 6); stem(x + 2, y - ht, x + 2 + Math.cos(a) * s * 0.5, y - ht + Math.sin(a) * s * 0.2 + s * 0.15, 2, '#3E8A3A'); } return; }
    if (kind === 'vine' || kind === 'hop' || kind === 'yam') { const ht = s * (kind === 'hop' ? 1.4 : kind === 'yam' ? 0.6 : 0.75); stem(x, y, x, y - ht, 1.6, '#7A6A55'); stem(x - s * 0.5, y - ht * 0.9, x + s * 0.5, y - ht * 0.9 - 3, 0.8, '#8A8A8A'); const leafy = !(decid && cov < 0.25); for (let k = 0; k < 5; k++) { ctx.fillStyle = leafy ? (k % 2 ? '#4E9A3A' : '#3E8A32') : 'rgba(122,90,58,0.55)'; ctx.beginPath(); ctx.ellipse(x + (k - 2) * s * 0.18, y - ht * (0.78 + 0.05 * (k % 2)), s * 0.16 * (leafy ? g + 0.3 : 0.6), ht * 0.16, 0, 0, Math.PI * 2); ctx.fill(); } if (leafy && kind === 'vine' && g > 0.6) for (let k = 0; k < 2; k++) { ctx.fillStyle = '#5A2E6A'; ctx.beginPath(); ctx.arc(x + (k - 0.5) * s * 0.3, y - ht * 0.62, 1.8, 0, Math.PI * 2); ctx.fill(); } return; }
    if (kind === 'cassava') { for (let k = -1; k <= 1; k++) stem(x, y, x + k * s * 0.08, y - hh * 0.9, 1.2, '#8A6A55'); ctx.fillStyle = '#3E8A3A'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + (k - 1.5) * s * 0.12, y - hh * (0.85 + 0.08 * (k % 2)), s * 0.12 * g + 1, 0, Math.PI * 2); ctx.fill(); } return; }
    if (kind === 'maize' || kind === 'millet' || kind === 'sorghum') { stem(x, y, x, y - hh * 1.25, 1.6, '#4E8A2C'); for (let k = 0; k < 4; k++) { const ly = y - hh * (0.3 + k * 0.22), sd = k % 2 ? 1 : -1; stem(x, ly, x + sd * s * 0.28 * g, ly + 2, 1.4, '#5FA83F'); } if (g > 0.7) { ctx.fillStyle = kind === 'maize' ? '#E9C85A' : kind === 'sorghum' ? '#A0482A' : '#8E7A45'; ctx.fillRect(x - 1, y - hh * 1.32, 2, 5); } return; }
    if (['legume', 'soybean', 'groundnut', 'cotton', 'vegetable', 'cowpea'].includes(kind)) { const r = s * 0.28 * g + 1.5; ctx.fillStyle = kind === 'vegetable' ? '#5FB04A' : '#4E9A3A'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.7, r * 1.1, r * 0.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r, r * 0.5, r * 0.3, 0, 0, Math.PI * 2); ctx.fill(); if (kind === 'cotton' && g > 0.7) for (let k = 0; k < 3; k++) { ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + (rand() - 0.5) * r * 1.6, y - r * (0.4 + rand()), 1.3, 0, Math.PI * 2); ctx.fill(); } return; }
    // grasses: cereal, wheat, rice, mustard
    const col = kind === 'mustard' && g > 0.75 ? '#E8CF3A' : g > 0.85 && kind !== 'rice' ? '#C9B25A' : '#5FA83F';
    for (let k = -2; k <= 2; k++) stem(x, y, x + k * s * 0.07, y - hh * (0.8 + 0.08 * (2 - Math.abs(k))), 1.1, col);
  }
  const kindOf = () => { const c = window.CROPLIB && CROPLIB.crops[state.crop]; return c ? c.kind : state.crop === 'cereal' ? 'wheat' : state.crop; };
  const isDecid = () => { const c = window.CROPLIB && CROPLIB.crops[state.crop]; return !!(c && c.habit === 'deciduous'); };

  // ------------------------------------------------------------------ the farmer
  function farmer(x, y, walk, turning, t) {
    const leg = walk ? Math.sin(t * 9) * 5 : 0, arm = turning ? Math.sin(t * 6) * 0.9 : 0.2;
    ctx.strokeStyle = '#2B2B2B'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x - 4 + leg * 0.6, y); ctx.moveTo(x, y - 18); ctx.lineTo(x + 4 - leg * 0.6, y); ctx.stroke();
    ctx.fillStyle = '#2F5F9E'; rrect(x - 6, y - 34, 12, 18, 3); ctx.fill();
    ctx.strokeStyle = '#2F5F9E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 5, y - 30); ctx.lineTo(x + 13, y - 26 - arm * 6); ctx.moveTo(x - 5, y - 30); ctx.lineTo(x - 10, y - 22 + arm * 4); ctx.stroke();
    ctx.fillStyle = '#C89070'; ctx.beginPath(); ctx.arc(x, y - 39, 4.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C9A24A'; ctx.beginPath(); ctx.ellipse(x, y - 43, 9, 2.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 4.5, y - 48, 9, 5);
    ctx.lineCap = 'butt';
  }

  // ------------------------------------------------------------------ the scene
  function drawFarm() {
    try { stepField(); } catch (e) {}
    if (!FM.jumped) { FM.jumped = true; try { const sm = seasonSim(), k0 = fclock.kd(), nx = schedule(sm, k0, 1); if (sm && nx.length && nx[0] - k0 > 30) { fclock.day = nx[0] - 3; fclock.pause = 0; fclock.mem = []; } else if (sm && !nx.length) { const nx2 = schedule(sm, 0, 1); if (nx2.length) { fclock.day = nx2[0] - 3; fclock.mem = []; } } } catch (e) {} }
    try { const ww = wantW(); if (canvas.width !== ww) setCanvasW(ww); } catch (e) {}
    paper();
    const sim = seasonSim(); if (!sim) { T('Running the daily model...', 20, 40, { s: 13, c: MUTE }); return; }
    const kd = fclock.kd(), doy = kd % DPY, sys = sysNow(), D = design(sys), t = tnow(), soil = state.soil, tex = DATA.texture[soil];
    const irrToday = sim.irr[kd] > 0, fd = fclock.fd ? fclock.fd() : 0, phase = irrToday ? clampN(fd, 0, 1) : 0;
    const open = irrToday && phase > 0.06 && phase < 0.78, flowF = open ? clampN((phase - 0.06) / 0.64, 0, 1) : (irrToday && phase >= 0.78 ? 1 : 0);
    const cov = sim.cover[kd] || 0, kind = kindOf(), decid = isDecid(), cr = (typeof IRCROP !== 'undefined' && IRCROP[state.crop]) || { row: 0.5, h: 50 };
    const rain = sim.rain[kd] || 0, meth = METHODS.find(q => q.k === state.method) || METHODS[0];
    // ---- title and controls
    T('Virtual farm: irrigation from the water source to the plants', 16, 24, { s: 16, b: true });
    T(DATA.soil_labels[soil] + ' · ' + (CROPS[state.crop] || {}).label + ' · ' + dateStr(kd) + ' ' + (1980 + yearOf(kd)) + ' · the valve follows the schedule predicted by the daily model', 16, 42, { s: 10.5, c: MUTE });
    let bx = 16, by = 52;
    const btn = (txt, on, fn, tip, col) => { ctx.font = 'bold 10.5px sans-serif'; const w = ctx.measureText(txt).width + 20; if (bx + w > W - 12) { bx = 16; by += 30; } const g = ctx.createLinearGradient(0, by, 0, by + 24); g.addColorStop(0, on ? (col || '#3B82D6') : '#FDFDFB'); g.addColorStop(1, on ? shade(col || '#3B82D6', -18) : '#E4E1D8'); ctx.fillStyle = g; ctx.fillRect(bx, by, w, 24); ctx.strokeStyle = on ? shade(col || '#3B82D6', -35) : '#9C978A'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, w - 1, 23); T(txt, bx + w / 2, by + 16, { s: 10.5, b: true, a: 'center', c: on ? '#fff' : '#1B1F23' }); hot(bx, by, w, 24, fn, tip); bx += w + 5; };
    SYS.forEach(([k, l]) => btn(l, sys === k, () => setSys(k), 'run the farm with ' + l.toLowerCase()));
    bx += 12; btn('Farmer opens the valve', !FM.auto, () => { FM.auto = false; }, 'manual operation on the predicted schedule', '#2E7D32'); btn('Automatic controller', FM.auto, () => { FM.auto = true; }, 'sensor-driven controller and solenoid valve', '#2E7D32');
    bx += 12; btn(FM.rec ? 'Recording ' + Math.max(0, Math.ceil(20 - (t - FM.recT))) + ' s' : 'Record video (20 s)', !!FM.rec, () => recordVideo(), 'save a 20-second video of the farm', '#C62828');
    // ---- geometry of the farm block (isometric)
    const top = by + 40, sceneH = 540, ox = W * 0.33, oy = top + sceneH - 150, U = { x: W * 0.43, y: -190 }, V = { x: W * 0.22, y: 92 };
    const P = (u, v) => ({ x: ox + u * U.x + v * V.x, y: oy + u * U.y + v * V.y });
    // sky, weather and horizon
    const wet = rain > 1, sky = ctx.createLinearGradient(0, top, 0, top + sceneH); sky.addColorStop(0, wet ? '#8E9AA8' : '#7FB6E6'); sky.addColorStop(0.55, wet ? '#C4CCD4' : '#D7EAF7'); sky.addColorStop(1, '#EFE9D8');
    ctx.fillStyle = sky; ctx.fillRect(0, top, W, sceneH);
    if (!wet) { const sx = W * 0.86, sy = top + 54; const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 46); sg.addColorStop(0, 'rgba(255,236,150,1)'); sg.addColorStop(1, 'rgba(255,236,150,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, 46, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFD34D'; ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill(); }
    for (let k = 0; k < (wet ? 6 : 3); k++) { const cx = ((k * 230 + t * 12) % (W + 200)) - 100, cy = top + 40 + (k % 3) * 22; ctx.fillStyle = wet ? 'rgba(110,120,132,0.85)' : 'rgba(255,255,255,0.9)'; [[0, 0, 26], [22, -8, 22], [44, 0, 24], [20, 6, 22]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); ctx.fill(); }); }
    ctx.fillStyle = '#9DB98A'; ctx.beginPath(); ctx.moveTo(0, top + 190); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, top + 182 - 18 * Math.sin(x / 170) - 10 * Math.sin(x / 61)); ctx.lineTo(W, top + 260); ctx.lineTo(0, top + 260); ctx.fill();
    ctx.fillStyle = '#B9C98E'; ctx.fillRect(0, top + 230, W, sceneH - 230);
    if (wet) { ctx.strokeStyle = 'rgba(90,120,170,0.45)'; ctx.lineWidth = 1; for (let k = 0; k < 160; k++) { const rx = (k * 97 + t * 220) % W, ry = top + ((k * 53 + t * 380) % (sceneH - 20)); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 9); ctx.stroke(); } }
    // field surface
    const soilC = tex.color || '#8B6A4A', c00 = P(0, 0), c10 = P(1, 0), c11 = P(1, 1), c01 = P(0, 1);
    ctx.fillStyle = shade(soilC, -8); ctx.beginPath(); ctx.moveTo(c00.x, c00.y); ctx.lineTo(c10.x, c10.y); ctx.lineTo(c11.x, c11.y); ctx.lineTo(c01.x, c01.y); ctx.closePath(); ctx.fill();
    // side faces (thickness) to show the profile edge
    ctx.fillStyle = shade(soilC, -30); ctx.beginPath(); ctx.moveTo(c00.x, c00.y); ctx.lineTo(c01.x, c01.y); ctx.lineTo(c01.x, c01.y + 26); ctx.lineTo(c00.x, c00.y + 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(soilC, -42); ctx.beginPath(); ctx.moveTo(c01.x, c01.y); ctx.lineTo(c11.x, c11.y); ctx.lineTo(c11.x, c11.y + 26); ctx.lineTo(c01.x, c01.y + 26); ctx.closePath(); ctx.fill();
    // mulch cover
    const vff = VFF_VALUES[state.vffIdx]; if (vff < 0.95) { ctx.fillStyle = 'rgba(214,190,120,' + (0.25 + 0.5 * (1 - vff)) + ')'; ctx.beginPath(); ctx.moveTo(c00.x, c00.y); ctx.lineTo(c10.x, c10.y); ctx.lineTo(c11.x, c11.y); ctx.lineTo(c01.x, c01.y); ctx.closePath(); ctx.fill(); }
    // rows
    const per = window.CROPLIB && CROPLIB.crops[state.crop] && CROPLIB.crops[state.crop].group === 'perennial';
    const nRows = per ? 7 : sys === 'basin' ? 10 : 14, plantsPerRow = per ? 9 : 26;
    const surf = sys === 'furrow' || sys === 'basin' || sys === 'border';
    // furrow / border / basin water on the surface
    const D2 = design(sys), rAdv = D2.r || 0.6, adv = flowF > 0 ? Math.min(1, Math.pow(flowF / 0.75, 1 / Math.max(0.3, rAdv))) : 0, recess = irrToday && phase > 0.78 ? clampN((phase - 0.78) / 0.22, 0, 1) : 0;
    for (let i = 0; i < nRows; i++) {
      const v = (i + 0.5) / nRows, a = P(0, v), b = P(1, v);
      if (sys === 'furrow') { ctx.strokeStyle = shade(soilC, -40); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.strokeStyle = shade(soilC, 18); ctx.lineWidth = 1.5; const a2 = P(0, v + 0.5 / nRows), b2 = P(1, v + 0.5 / nRows); ctx.beginPath(); ctx.moveTo(a2.x, a2.y); ctx.lineTo(b2.x, b2.y); ctx.stroke(); }
      if (surf && adv > 0) {
        const uw = adv * (1 - recess * 0.6), alpha = 0.75 * (1 - recess * 0.7);
        if (sys === 'furrow') { const e = P(uw, v); const g = ctx.createLinearGradient(a.x, a.y, e.x, e.y); g.addColorStop(0, 'rgba(46,125,232,' + alpha + ')'); g.addColorStop(1, 'rgba(120,180,240,' + alpha * 0.8 + ')'); ctx.strokeStyle = g; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); ctx.stroke(); ctx.strokeStyle = 'rgba(210,235,255,' + alpha * 0.7 + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y - 1.5); ctx.lineTo(e.x, e.y - 1.5); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(e.x, e.y, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      if (sys === 'drip' || sys === 'sdi') { ctx.strokeStyle = sys === 'sdi' ? 'rgba(30,30,30,0.25)' : '#1E1E1E'; ctx.lineWidth = sys === 'sdi' ? 1 : 2; if (sys === 'sdi') ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); }
    }
    if ((sys === 'basin' || sys === 'border') && adv > 0) {
      const uw = adv * (1 - recess * 0.5), alpha = 0.55 * (1 - recess * 0.7), q0 = P(0, 0), q1 = P(uw, 0), q2 = P(uw, 1), q3 = P(0, 1);
      const g = ctx.createLinearGradient(q0.x, q0.y, q1.x, q1.y); g.addColorStop(0, 'rgba(46,125,232,' + alpha + ')'); g.addColorStop(1, 'rgba(140,190,240,' + alpha * 0.7 + ')');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.lineTo(q3.x, q3.y); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 30; k++) { const u = ((k * 0.137 + t * 0.05) % 1) * uw, vv = (k * 0.291) % 1, p = P(u, vv); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x - 5, p.y); ctx.lineTo(p.x + 5, p.y - 1); ctx.stroke(); }
      if (sys === 'basin') { ctx.strokeStyle = shade(soilC, -45); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c00.x, c00.y); ctx.lineTo(c10.x, c10.y); ctx.lineTo(c11.x, c11.y); ctx.lineTo(c01.x, c01.y); ctx.closePath(); ctx.stroke(); }
    }
    // tail-water ditch (surface): runoff at the field end
    if (surf) { const tA = P(1, 0), tB = P(1, 1); ctx.strokeStyle = shade(soilC, -55); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(tA.x, tA.y); ctx.lineTo(tB.x, tB.y); ctx.stroke(); if (adv >= 0.999 && D.ro > 0.01) { ctx.strokeStyle = 'rgba(46,125,232,' + clampN(0.3 + D.ro, 0.3, 0.9) + ')'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(tA.x, tA.y); ctx.lineTo(tB.x, tB.y); ctx.stroke(); T('runoff ' + fmt(100 * D.ro) + ' %', tB.x + 8, tB.y + 4, { s: 10, b: true, c: '#1B4F9C' }); } }
    // plants (back to front)
    const rand = seededRandom(hashStr(state.crop + soil) + 3), pts = [];
    for (let i = 0; i < nRows; i++) for (let j = 0; j < plantsPerRow; j++) { const v = (i + (sys === 'furrow' ? 1 : 0.5)) / nRows, u = (j + 0.5 + (rand() - 0.5) * 0.3) / plantsPerRow; if (sys === 'furrow' && i === nRows - 1) continue; pts.push([P(u, v), u, v]); }
    pts.sort((a, b) => a[0].y - b[0].y);
    const ps = per ? 34 : clampN(cr.h * 0.38, 10, 30);
    pts.forEach(([p, u, v]) => { miniPlant(p.x, p.y, ps * (0.85 + 0.3 * (1 - v)), kind, per ? Math.max(cov, decid ? cov : 0.6) : cov, rand, decid); });
    // sprinklers
    if (sys === 'sprinkler') {
      const nx = 4, ny = 3;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const p = P((i + 0.5) / nx, (j + 0.5) / ny); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 34); ctx.stroke(); ctx.fillStyle = '#C62828'; ctx.fillRect(p.x - 3, p.y - 38, 6, 5);
        if (open) { const ang = t * 2.2 + i + j; for (let k = 0; k < 26; k++) { const f = ((k / 26) + t * 0.9) % 1, a = ang + (k % 5) * 0.12, rr = f * 70; const xx = p.x + Math.cos(a) * rr * 1.3, yy = p.y - 36 + Math.sin(a) * rr * 0.45 - Math.sin(f * Math.PI) * 26; ctx.fillStyle = 'rgba(90,160,230,' + (0.85 - f * 0.6) + ')'; ctx.beginPath(); ctx.arc(xx, yy, 1.6, 0, Math.PI * 2); ctx.fill(); }
          for (let k = 0; k < 7; k++) { const f = ((k / 7) + t * 0.35) % 1; ctx.fillStyle = 'rgba(225,238,250,' + (0.32 - f * 0.3) + ')'; ctx.beginPath(); ctx.arc(p.x + 20 + f * 90, p.y - 50 - f * 24, 3 + f * 5, 0, Math.PI * 2); ctx.fill(); } }
      }
      if (open) T('wind drift and evaporation ' + fmt(100 * D.ev, 1) + ' %', P(0.95, 0.15).x, P(0.95, 0.15).y - 70, { s: 10, b: true, c: '#3A5A7A' });
    }
    // drip emitters
    if ((sys === 'drip') && open) { for (let i = 0; i < nRows; i++) for (let j = 0; j < 14; j++) { const p = P((j + 0.5) / 14, (i + 0.5) / nRows), f = (t * 1.3 + i * 0.37 + j * 0.21) % 1; ctx.fillStyle = 'rgba(46,125,232,0.85)'; ctx.beginPath(); ctx.arc(p.x, p.y - 4 + f * 4, 1.7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(46,90,160,' + (0.15 + 0.3 * flowF) + ')'; ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 4 + 8 * flowF, 2 + 3 * flowF, 0, 0, Math.PI * 2); ctx.fill(); } }
    if (sys === 'sdi' && open) { for (let i = 0; i < nRows; i++) { const a = P(0, (i + 0.5) / nRows), b = P(1, (i + 0.5) / nRows); ctx.strokeStyle = 'rgba(46,90,160,' + (0.12 + 0.25 * flowF) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
    // ---- infrastructure at the head of the field
    const head0 = P(0, -0.08), head1 = P(0, 1.02), src = { x: c00.x - W * 0.29, y: c00.y - 26 };
    const flowDash = (pts2, w, col, on) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts2.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); if (on) { ctx.strokeStyle = 'rgba(160,210,255,0.95)'; ctx.lineWidth = Math.max(1.5, w * 0.4); ctx.setLineDash([7, 9]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); pts2.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; } };
    const valve = { x: head0.x + 34, y: head0.y + 6 };
    if (surf) {
      // canal with a lifting gate, then the head ditch along the field with siphons / outlets into each row
      flowDash([{ x: src.x - 60, y: src.y + 30 }, { x: valve.x, y: valve.y }], 12, '#5A7FA8', open || irrToday);
      flowDash([valve, head1], 9, '#6E8FB8', open);
      ctx.fillStyle = '#7A7468'; ctx.fillRect(valve.x - 14, valve.y - 30, 6, 34); ctx.fillRect(valve.x + 8, valve.y - 30, 6, 34);
      const lift = open ? 14 * Math.min(1, (phase - 0.06) / 0.05) : 0; ctx.fillStyle = '#4A4A4A'; ctx.fillRect(valve.x - 8, valve.y - 18 - lift, 16, 18); ctx.fillStyle = '#9A9A9A'; ctx.fillRect(valve.x - 2, valve.y - 34 - lift, 4, 18);
      if (open) for (let i = 0; i < nRows; i++) { const q = P(0, (i + (sys === 'furrow' ? 0 : 0.5)) / nRows); ctx.strokeStyle = '#3A3A3A'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(q.x - 6, q.y - 4); ctx.quadraticCurveTo(q.x - 2, q.y - 14, q.x + 3, q.y - 2); ctx.stroke(); }
      T('canal from the reservoir', Math.max(8, src.x - 40), src.y + 52, { s: 10, b: true, c: '#2E4F7A' });
    } else {
      // well, pump, filters, fertiliser tank, main line, control valve, sub-main and laterals
      ctx.fillStyle = '#7C8A96'; ctx.beginPath(); ctx.ellipse(src.x, src.y + 10, 26, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3F6E9E'; ctx.beginPath(); ctx.ellipse(src.x, src.y + 8, 20, 7, 0, 0, Math.PI * 2); ctx.fill(); T('well', src.x, src.y + 34, { s: 10, b: true, a: 'center', c: '#2E4F7A' });
      const pump = { x: src.x + 88, y: src.y + 2 }; ctx.fillStyle = '#2E5C9E'; rrect(pump.x - 14, pump.y - 12, 28, 20, 4); ctx.fill(); ctx.fillStyle = '#1B3F70'; ctx.beginPath(); ctx.arc(pump.x + 16, pump.y - 2, 8, 0, Math.PI * 2); ctx.fill(); if (open) { ctx.strokeStyle = '#9BC4F0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pump.x + 16, pump.y - 2, 5, t * 8, t * 8 + 4); ctx.stroke(); } T('pump', pump.x, pump.y + 22, { s: 9.5, b: true, a: 'center' });
      const filt = { x: pump.x + 86, y: pump.y - 2 }; for (let k = 0; k < (sys === 'sprinkler' ? 1 : 3); k++) { ctx.fillStyle = sys === 'sprinkler' ? '#6A7A88' : '#C62828'; rrect(filt.x - 6 + k * 13, filt.y - 22, 11, 26, 5); ctx.fill(); } T(sys === 'sprinkler' ? 'screen filter' : 'sand and disc filters', filt.x + 12, filt.y + 16, { s: 9.5, b: true, a: 'center' });
      if (sys !== 'sprinkler') { ctx.fillStyle = '#F2F2EE'; ctx.strokeStyle = '#888'; rrect(filt.x + 34, filt.y - 30, 18, 26, 4); ctx.fill(); ctx.stroke(); T('fertiliser', filt.x + 43, filt.y - 34, { s: 8.5, a: 'center', c: MUTE }); }
      flowDash([{ x: src.x + 18, y: src.y + 4 }, { x: pump.x - 14, y: pump.y }, { x: filt.x - 6, y: filt.y }, { x: valve.x, y: valve.y }], 7, '#3E5A78', open);
      flowDash([valve, head1], 6, '#4A6A8A', open);
      if (sys !== 'sdi') for (let i = 0; i < nRows; i++) { if (sys === 'sprinkler') break; const a = P(0, (i + 0.5) / nRows), b = P(1, (i + 0.5) / nRows); if (open) { ctx.strokeStyle = 'rgba(160,210,255,0.9)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 8]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; } }
      if (sys === 'sprinkler') { for (let j = 0; j < 3; j++) { const a = P(0, (j + 0.5) / 3), b = P(1, (j + 0.5) / 3); flowDash([a, b], 3, '#5A5A5A', open); } }
      // control valve
      ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.arc(valve.x, valve.y - 4, 9, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#1B1B1B'; ctx.lineWidth = 2; const ang = open ? Math.min(1, (phase - 0.06) / 0.05) * Math.PI / 2 : irrToday && phase >= 0.78 ? 0 : 0; ctx.beginPath(); ctx.moveTo(valve.x - 8 * Math.cos(ang), valve.y - 18 - 8 * Math.sin(ang)); ctx.lineTo(valve.x + 8 * Math.cos(ang), valve.y - 18 + 8 * Math.sin(ang)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(valve.x, valve.y - 13); ctx.lineTo(valve.x, valve.y - 18); ctx.stroke();
    }
    // operator or controller
    if (FM.auto) {
      const cb = { x: valve.x - 46, y: valve.y + 62 }; ctx.fillStyle = '#E8E6E0'; ctx.strokeStyle = '#6A6A6A'; ctx.lineWidth = 1; ctx.fillRect(cb.x - 14, cb.y - 40, 28, 36); ctx.strokeRect(cb.x - 14.5, cb.y - 40.5, 29, 37); ctx.fillStyle = '#1B2B1B'; ctx.fillRect(cb.x - 10, cb.y - 36, 20, 12); ctx.fillStyle = open ? '#3CF070' : '#F0503C'; ctx.beginPath(); ctx.arc(cb.x, cb.y - 14, 3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(cb.x, cb.y - 40); ctx.lineTo(cb.x, cb.y - 56); ctx.stroke(); ctx.beginPath(); ctx.arc(cb.x, cb.y - 58, 2.5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#6A4A2A'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cb.x, cb.y - 4); ctx.lineTo(c00.x + 30, c00.y + 10); ctx.stroke(); ctx.setLineDash([]);
      T(open ? 'AUTO: sensor at trigger, valve open' : 'AUTO: waiting for the sensor', cb.x, cb.y - 66, { s: 9.5, b: true, a: 'center', c: open ? '#1E7A2E' : '#6A6A6A' });
    } else {
      const home = { x: valve.x - 70, y: valve.y + 78 }, atValve = { x: valve.x - 16, y: valve.y + 10 }; let fx = home.x, fy = home.y, walking = false, turning = false;
      if (irrToday) { const g = phase < 0.03 ? phase / 0.03 : phase < 0.1 ? 1 : phase < 0.7 ? 1 - Math.min(1, (phase - 0.1) / 0.03) : phase < 0.74 ? (phase - 0.7) / 0.04 : phase < 0.8 ? 1 : 1 - Math.min(1, (phase - 0.8) / 0.04); fx = lerp(home.x, atValve.x, g); fy = lerp(home.y, atValve.y, g); walking = (phase < 0.03) || (phase > 0.1 && phase < 0.13) || (phase > 0.7 && phase < 0.74) || (phase > 0.8 && phase < 0.84); turning = (phase > 0.04 && phase < 0.1) || (phase > 0.74 && phase < 0.8); }
      ctx.fillStyle = '#B8A07A'; ctx.fillRect(home.x - 28, home.y - 30, 34, 30); ctx.fillStyle = '#8A4A2A'; ctx.beginPath(); ctx.moveTo(home.x - 32, home.y - 30); ctx.lineTo(home.x - 11, home.y - 46); ctx.lineTo(home.x + 10, home.y - 30); ctx.fill();
      farmer(fx, fy, walking, turning, t);
      if (turning) T(phase < 0.5 ? 'opening the valve' : 'closing the valve', fx, fy - 54, { s: 9.5, b: true, a: 'center', c: '#1E4F8A' });
    }
    // schedule board at the valve
    const sch = schedule(sim, kd, 4), bw2 = 240, bh2 = 98, bxx = Math.min(W - bw2 - 16, valve.x + 60), byy = top + 12;
    ctx.fillStyle = 'rgba(255,255,250,0.96)'; ctx.fillRect(bxx, byy, bw2, bh2); ctx.strokeStyle = '#6A6A6A'; ctx.lineWidth = 1; ctx.strokeRect(bxx + 0.5, byy + 0.5, bw2 - 1, bh2 - 1);
    ctx.fillStyle = open ? '#2E7D32' : '#5A6270'; ctx.fillRect(bxx, byy, bw2, 18); T((surf ? 'GATE' : 'VALVE') + ' · ' + (open ? 'OPEN' : irrToday && phase >= 0.78 ? 'CLOSED (event done)' : 'CLOSED'), bxx + 8, byy + 13, { s: 10, b: true, c: '#fff' });
    T('Predicted irrigations (daily model)', bxx + 8, byy + 32, { s: 9.5, b: true });
    sch.forEach((d, i) => T(dateStr(d) + ' ' + (1980 + yearOf(d)) + '   ' + fmt(sim.irr[d]) + ' mm' + (D.hours ? '   ' + fmt(D.hours * sim.irr[d] / Math.max(1, sim.dose), 1) + ' h open' : '') + (d === kd ? '   ← today' : ''), bxx + 8, byy + 48 + i * 13, { s: 9.5, c: d === kd ? '#1E7A2E' : INK }));
    if (!sch.length) T('no more irrigation in this record', bxx + 8, byy + 48, { s: 9.5, c: MUTE });
    hot(bxx, byy, bw2, bh2, () => { if (sch.length) { fclock.day = sch[0] + 0.001; fclock.pause = 0; fclock.mem = []; } }, 'jump to the next irrigation');
    // ---- cross-section through the field: plants, roots, the wetting of the soil and the losses
    let y = top + sceneH + 14;
    const plantPx = per ? 175 : clampN(cr.h * 0.62 * 1.35, 46, 120), depthPx = 2.1, sx = 16, sw = W - 32, ground = y + 28 + plantPx, sh = 28 + plantPx + 100 * depthPx + 8;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx, y, sw, sh); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(sx + 0.5, y + 0.5, sw - 1, sh - 1);
    ctx.fillStyle = '#ECE9E0'; ctx.fillRect(sx + 1, y + 1, sw - 2, 20); T('Cross-section through the field: where the water goes in the soil (layer water from the daily model)', sx + 8, y + 15, { s: 11, b: true });
    const sg = ctx.createLinearGradient(0, ground, 0, ground + 100 * depthPx); sg.addColorStop(0, shade(soilC, 4)); sg.addColorStop(1, shade(soilC, -28)); ctx.fillStyle = sg; ctx.fillRect(sx + 1, ground, sw - 2, 100 * depthPx);
    const grain = seededRandom(hashStr(soil) + 11); for (let k = 0; k < 900; k++) { ctx.fillStyle = 'rgba(0,0,0,' + (0.05 + 0.1 * grain()) + ')'; ctx.fillRect(sx + 1 + grain() * (sw - 2), ground + grain() * 100 * depthPx, 1.5 + grain() * (tex.sand > 60 ? 2.5 : 1), 1.5); }
    // layer water content: before (yesterday) and after (today) the event, revealed down to the front as the event proceeds
    const sNow = sim.s[kd], sPrev = sim.s[Math.max(0, kd - 1)], front = irrToday ? (sim.front[kd] || 30) * Math.min(1, flowF * 1.2) : 0;
    for (let i = 0; i < NLAY; i++) { const z = i * DZ, v = (irrToday && z <= front) ? sNow[i] : (irrToday ? sPrev[i] : sNow[i]); ctx.fillStyle = 'rgba(30,100,210,' + clampN(v * 0.55, 0, 0.6) + ')'; ctx.fillRect(sx + 1, ground + z * depthPx, sw - 2, DZ * depthPx + 0.5); }
    // drip and subsurface drip: wetted bulbs around the emitters
    if ((sys === 'drip' || sys === 'sdi') && irrToday) { const zc = sys === 'sdi' ? (meth.mid || 45) : 3; for (let k = 0; k < 7; k++) { const ex = sx + sw * (k + 0.5) / 7, g = ctx.createRadialGradient(ex, ground + zc * depthPx, 2, ex, ground + zc * depthPx, 70 * flowF + 4); g.addColorStop(0, 'rgba(30,90,200,0.55)'); g.addColorStop(1, 'rgba(30,90,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ex, ground + zc * depthPx + 10 * flowF, 60 * flowF + 4, 75 * flowF + 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#1E1E1E'; ctx.beginPath(); ctx.arc(ex, ground + zc * depthPx, 3, 0, Math.PI * 2); ctx.fill(); } }
    if (sys === 'furrow') for (let k = 0; k < 8; k++) { const fx2 = sx + sw * (k + 0.5) / 8; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(fx2 - 22, ground); ctx.lineTo(fx2, ground + 14); ctx.lineTo(fx2 + 22, ground); ctx.fill(); if (irrToday && open) { ctx.fillStyle = 'rgba(46,125,232,0.7)'; ctx.beginPath(); ctx.moveTo(fx2 - 13, ground + 6); ctx.lineTo(fx2, ground + 14); ctx.lineTo(fx2 + 13, ground + 6); ctx.fill(); } }
    // plants with their roots
    const rootCm = sim.rd ? sim.rd[kd] : 40; ctx.save(); ctx.beginPath(); ctx.rect(sx + 1, y + 22, sw - 2, sh - 23); ctx.clip();
    if (cov > 0.03 || per) cropPlants(sx + sw / 2, ground, per ? plantPx * 0.85 / 1.8 / 1.15 : clampN(cr.h * 0.62, 26, 70), (sw - 80) / (per ? 4 : 9), 9, rootCm, depthPx, 7); ctx.restore();
    // depth scale, sensor, trigger
    for (let z = 0; z <= 100; z += 25) { const yy = ground + z * depthPx; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(sx + 1, yy); ctx.lineTo(sx + 40, yy); ctx.stroke(); ctx.setLineDash([]); T(z + ' cm', sx + 6, yy - 2, { s: 8.5, c: '#fff' }); }
    const zS = Z_VALUES[state.zIdx], ySn = ground + zS * depthPx, sIdx = clampN(Math.round(zS / DZ), 0, NLAY - 1), dep = 1 - sNow[sIdx];
    ctx.fillStyle = '#FFD34D'; ctx.strokeStyle = '#1B1F23'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx + sw - 70, ySn, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx + sw - 70, ySn - 6); ctx.lineTo(sx + sw - 70, ground - 20); ctx.stroke();
    { ctx.font = 'bold 9.5px sans-serif'; const lt = 'sensor ' + zS + ' cm: ' + fmt(100 * dep) + ' % depleted · trigger ' + fmt(100 * (sim.fTrig || 0)) + ' %', lw = ctx.measureText(lt).width + 10; ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(sx + sw - 84 - lw, ySn - 9, lw, 15); T(lt, sx + sw - 79 - lw, ySn + 2, { s: 9.5, b: true, c: dep >= (sim.fTrig || 1) ? '#C62828' : INK }); }
    // losses: deep percolation below 1 m and evaporation from the surface
    const dr = sim.drain[kd] || 0; if (dr > 0.05) for (let k = 0; k < 6; k++) { const ax = sx + sw * (k + 0.5) / 6, ay = ground + 100 * depthPx - 18 + ((t * 30 + k * 7) % 14); ctx.fillStyle = '#1B4F9C'; ctx.beginPath(); ctx.moveTo(ax, ay + 10); ctx.lineTo(ax - 5, ay); ctx.lineTo(ax + 5, ay); ctx.fill(); }
    T('drainage below 1 m today ' + fmt(dr, 1) + ' mm', sx + 50, ground + 100 * depthPx - 4, { s: 9.5, b: true, c: '#fff' });
    y += sh + 12;
    // ---- charts: the predicted schedule at the gate and the fate of this irrigation
    const cw = (sw - 12) * 0.62, ch = 230;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx, y, cw, ch); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(sx + 0.5, y + 0.5, cw - 1, ch - 1); ctx.fillStyle = '#ECE9E0'; ctx.fillRect(sx + 1, y + 1, cw - 2, 20); T('Predicted schedule at the ' + (surf ? 'gate' : 'valve') + ': the next 30 days', sx + 8, y + 15, { s: 11, b: true });
    const x0 = sx + 46, ww = cw - 62, t0 = y + 36, hh = ch - 80, n = 30, d0 = kd; let pm = 5; for (let k = 0; k < n; k++) { const d = Math.min(ND - 1, d0 + k); pm = Math.max(pm, sim.rain[d], sim.irr[d]); } pm = Math.ceil(pm / 5) * 5;
    for (let i = 0; i <= 4; i++) { const yy = t0 + hh - hh * i / 4; ctx.strokeStyle = '#E6E2D6'; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + ww, yy); ctx.stroke(); T(fmt(pm * i / 4), x0 - 4, yy + 3, { s: 8.5, c: MUTE, a: 'right' }); } T('mm', x0 - 4, t0 - 5, { s: 8.5, c: MUTE, a: 'right' });
    for (let k = 0; k < n; k++) { const d = Math.min(ND - 1, d0 + k), bxk = x0 + ww * k / n, bwk = ww / n * 0.8; if (sim.irr[d] > 0) { ctx.fillStyle = 'rgba(46,125,50,0.12)'; ctx.fillRect(bxk, t0, bwk, hh); } ctx.fillStyle = '#9AA3AE'; ctx.fillRect(bxk, t0 + hh - sim.rain[d] / pm * hh, bwk * 0.45, sim.rain[d] / pm * hh); ctx.fillStyle = '#2E7DE8'; ctx.fillRect(bxk + bwk * 0.45, t0 + hh - sim.irr[d] / pm * hh, bwk * 0.55, sim.irr[d] / pm * hh); if (k % 5 === 0) T(dateStr(d), bxk, t0 + hh + 12, { s: 8.5, c: MUTE }); }
    ctx.strokeStyle = '#8E5A2A'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < n; k++) { const d = Math.min(ND - 1, d0 + k), dp = 1 - sim.s[d][sIdx], xx = x0 + ww * (k + 0.4) / n, yy = t0 + hh - dp * hh; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
    ctx.strokeStyle = '#5B2FA8'; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, t0 + hh - (sim.fTrig || 0) * hh); ctx.lineTo(x0 + ww, t0 + hh - (sim.fTrig || 0) * hh); ctx.stroke(); ctx.setLineDash([]);
    [['#9AA3AE', 'rain'], ['#2E7DE8', 'irrigation'], ['#8E5A2A', 'sensor depletion (0 to 1 of the axis)'], ['#5B2FA8', 'trigger'], ['rgba(46,125,50,0.35)', 'gate or valve open']].reduce((xx, [c, l]) => { ctx.fillStyle = c; ctx.fillRect(xx, y + ch - 20, 10, 10); T(l, xx + 14, y + ch - 11, { s: 9 }); ctx.font = '9px sans-serif'; return xx + ctx.measureText(l).width + 30; }, x0);
    // fate of the water of the current (or next) irrigation
    const fx0 = sx + cw + 12, fw = sw - cw - 12, nd2 = irrToday ? kd : (sch[0] != null ? sch[0] : kd), gross = sim.irr[nd2] || 0;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(fx0, y, fw, ch); ctx.strokeStyle = '#B9B4A6'; ctx.strokeRect(fx0 + 0.5, y + 0.5, fw - 1, ch - 1); ctx.fillStyle = '#ECE9E0'; ctx.fillRect(fx0 + 1, y + 1, fw - 2, 20); T((irrToday ? 'This irrigation' : 'Next irrigation') + ': where the water goes', fx0 + 8, y + 15, { s: 11, b: true });
    const parts = [['stored in the root zone', D.Ea, '#2E9E4F'], ['deep percolation', D.dp, '#1B4F9C'], ['surface runoff', D.ro, '#7A5AC9'], ['evaporation and drift', D.ev, '#E8912D']].filter(p => p[1] > 0.0005), tot = parts.reduce((a, p) => a + p[1], 0) || 1;
    let xx2 = fx0 + 12; const bwid = fw - 24; parts.forEach(p => { const w = bwid * p[1] / tot; ctx.fillStyle = p[2]; ctx.fillRect(xx2, y + 34, w, 26); xx2 += w; });
    parts.forEach((p, i) => { T(p[0] + ': ' + fmt(100 * p[1] / tot) + ' %  (' + fmt(gross * p[1] / tot, 1) + ' mm)', fx0 + 26, y + 82 + i * 18, { s: 10 }); ctx.fillStyle = p[2]; ctx.fillRect(fx0 + 12, y + 73 + i * 18, 9, 9); });
    T('Gross depth ' + fmt(gross, 1) + ' mm on ' + dateStr(nd2) + (D.hours ? ' · open ' + fmt(D.hours * gross / Math.max(1, sim.dose), 1) + ' h' : ''), fx0 + 12, y + ch - 46, { s: 10, b: true });
    T('Shares from the ' + D.label + (D.CU ? ' (uniformity ' + fmt(100 * D.CU) + ' %)' : '') + '; change the design there.', fx0 + 12, y + ch - 28, { s: 9, c: MUTE });
    if (surf && D.Ea < 0.4) T('Low efficiency: most water runs off the field end. Shorten the cut-off or reduce the inflow in S2.', fx0 + 12, y + ch - 12, { s: 9, b: true, c: '#C62828' });
    y += ch + 10;
    if (FM.rec && t - FM.recT > 20.2) stopVideo();
  }

  // ------------------------------------------------------------------ 20-second video of the farm (WebM, saved with the Save dialog)
  function recordVideo() {
    if (FM.rec) return stopVideo(); if (!canvas.captureStream || typeof MediaRecorder === 'undefined') { alertMsg('Video recording is not available in this browser.'); return; }
    const st = canvas.captureStream(30), mt = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
    const rec = new MediaRecorder(st, { mimeType: mt, videoBitsPerSecond: 6e6 }), chunks = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = async () => { const blob = new Blob(chunks, { type: 'video/webm' }), buf = new Uint8Array(await blob.arrayBuffer()); saveBytes('SWAFL_virtual_farm_' + new Date().toISOString().slice(0, 10) + '.webm', buf, 'video/webm'); };
    FM.rec = rec; FM.recT = tnow(); rec.start(500);
    try { if (!fclock.on) { fclock.on = true; } const nx = schedule(seasonSim(), fclock.kd(), 1); if (nx.length) { fclock.day = Math.max(0, nx[0] - 2); fclock.pause = 0; fclock.mem = []; } } catch (e) {}
  }
  function stopVideo() { try { FM.rec.stop(); } catch (e) {} FM.rec = null; }
  function alertMsg(m) { try { const el = document.getElementById('playLabel'); if (el) el.textContent = m; } catch (e) {} }

  SCENES.push({ id: 'farm', label: 'F1 Virtual farm', color: '#2E7D32', h: 1200, wide: 1180, fieldBar: true, interactive: true,
    onDown: p => hotDown(p), onMove: p => { hotMove(p); return false; }, onLeave: () => { hotUi.hover = null; },
    draw: () => drawFarm(), title: 'Virtual farm: the irrigation system from the source to the plants, on the predicted schedule',
    legend: [['#2E7DE8', 'Irrigation water'], ['#9AA3AE', 'Rain'], ['#1B4F9C', 'Deep percolation'], ['#7A5AC9', 'Runoff'], ['#E8912D', 'Evaporation and drift']],
    insight: 'The valve opens on the days the sensor reaches the trigger: the same schedule, losses and soil water as the rest of the explorer, seen as a working farm.' });
})();
