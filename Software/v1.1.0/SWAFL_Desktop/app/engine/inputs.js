/* SWAFL 1.1 design inputs and runs.
   1. Every numeric input of the three irrigation designs is a value box: a click opens a picker with the exact value, its unit
      (m or km, L/s or m3/h, ha or m2 ...) and a drop-down of values across the allowed range.
   2. The crop of the design layers is a drop-down, not a row of buttons.
   3. A design is computed only when the user presses Run simulation; after any change of an input the results wait for the
      next Run, so nothing moves or flickers while the inputs are being set.
   4. The best combination of the inputs for the highest application efficiency (root zone filled) is searched on request.
   5. designCharts(id) returns the series of the design charts (hydrograph, advance and recession, depth along the field,
      fate of the water) for the workbench. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || typeof sidSlider !== 'function') return;
  const DES = ['sid', 'drip', 'spr'];
  // yield unit of the crop: Mg/ha for the simulated cereal, % of the potential for the library crops
  window.yU = () => (CROPS[state.crop] && CROPS[state.crop].lib) ? '% points' : 'Mg/ha'; window.yD = () => (CROPS[state.crop] && CROPS[state.crop].lib) ? 1 : 2;
  // one background and one accent for every layer: white sheets and the navy of the workbench
  // labels in pills never sit on top of each other: a pill that would overlap one already drawn moves down
  let PILLS = [];
  if (typeof sidPill === 'function') { const oPill = sidPill; sidPill = function (txt, x, y, bg) { ctx.font = 'bold 9px sans-serif'; const w = ctx.measureText(txt).width + 8; let yy = y; for (let k = 0; k < 6; k++) { const hit = PILLS.find(r => x < r.x + r.w && x + w > r.x && yy - 10 < r.y + 3 && yy + 3 > r.y - 10); if (!hit) break; yy = hit.y + 15; } PILLS.push({ x, y: yy, w }); return oPill(txt, x, yy, bg); }; }
  paper = function () { PILLS = []; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, W - 1, H - 1); };
  // no text runs past the edge of the sheet: it shrinks (to 7.5 px) and is then shortened with an ellipsis
  const oT = T;
  T = function (txt, x, y, o) {
    o = o || {}; const M0 = ctx.getTransform(), ss = window.__SS || 1, M = { a: M0.a / ss, b: M0.b, c: M0.c, e: M0.e / ss };   // in sheet units (the app draws at a finer resolution)
    if (typeof txt === 'string' && txt.length > 3 && Math.abs(M.b) < 1e-9 && Math.abs(M.c) < 1e-9 && M.a > 0) {
      const X = M.a * x + M.e, a = o.a || 'left', avail = (a === 'left' ? (W - 4 - X) : a === 'right' ? (X - 4) : 2 * Math.min(X - 4, W - 4 - X)) / M.a;
      let sz = o.s || 11; const font = s2 => (o.i ? 'italic ' : '') + (o.b ? 'bold ' : '') + s2 + 'px ' + (o.f || 'sans-serif');
      ctx.font = font(sz);
      if (avail > 20 && ctx.measureText(txt).width > avail) {
        while (sz > 7.5 && ctx.measureText(txt).width > avail) { sz -= 0.5; ctx.font = font(sz); }
        const fw = ctx.measureText(txt).width, sheet = (W - 8) / M.a;
        if (fw > avail && fw <= sheet) {   // the whole text fits on the sheet: move it inwards rather than cut it
          if (a === 'left') x -= (fw - avail); else if (a === 'right') x += (fw - avail); else { const cx = X / M.a; x = Math.max(4 / M.a + fw / 2, Math.min((W - 4) / M.a - fw / 2, x)); }
        } else { let t = txt; while (t.length > 4 && ctx.measureText(t + '…').width > avail) t = t.slice(0, -1);
          if (t !== txt) txt = t.replace(/[\s,;:·]+$/, '') + '…'; }
        o = Object.assign({}, o, { s: sz });
      }
    }
    return oT(txt, x, y, o);
  };
  // plants stay inside their picture: an optional ninth argument gives the top of the frame, and a crop too tall for it is drawn
  // shorter (its height is estimated from the drawing of each crop kind: palms, trees and maize stand well above the given height)
  if (typeof cropPlants === 'function') {
    const oCP = cropPlants, KF = { rice: 1.0, maize: 1.45, sorghum: 1.3, cassava: 1.3, yam: 1.4, cowpea: 1.0, cocoa: 1.5, vegetable: 1.05, millet: 1.5, wheat: 1.15, mustard: 1.3, cotton: 1.15, groundnut: 0.6, legume: 1.0, soybean: 1.0, vine: 1.05, hop: 1.75, bush: 1.45, palm: 2.15, papaya: 1.45, citrus: 1.65, olive: 1.65, tree: 1.65 };
    cropPlants = function (cx, ground, h, spread, n, rootCm, pxPerCm, seedBase, ceil) {
      if (ceil != null && isFinite(ceil) && h > 0) {
        const c = window.CROPLIB && CROPLIB.crops[state.crop], f = c ? (KF[c.kind] != null ? KF[c.kind] : 1.65) * (c.group === 'perennial' ? 1.8 : 1) : (state.crop === 'vegetable' ? 0.55 : 1.0);
        const add = c ? 8 : 14, avail = ground - ceil, need = f * 1.1 * h + add;
        if (need > avail) h = Math.max(3, (avail - add) / (f * 1.1));
      }
      return oCP.call(this, cx, ground, h, spread, n, rootCm, pxPerCm, seedBase);
    };
  }
  try { SIDC.ac = '#0A246A'; SIDC.ink = '#000000'; IRC.ac = '#0A246A'; IRC.ink = '#000000'; } catch (e) {}
  const OBJ = () => ({ sid: SID, drip: DRP, spr: SPR });
  const RUN = { sid: { on: false, st: '', why: '' }, drip: { on: false, st: '', why: '' }, spr: { on: false, st: '', why: '' } };
  const BEST = {};
  // Sensor-triggered Daisy runs that never irrigate at the reference setting (the sand and loamy sand at -300 cm): the
  // irrigation of another trigger, sensor depth or method is added as its simulated amount (a ratio to zero is undefined)
  if (typeof model === 'function' && typeof rowAt === 'function') {
    const oModel = model;
    model = function (vff, rain, ov) {
      const o = oModel.apply(this, arguments); try {
        const S = ov ? Object.assign({}, state, ov) : state; let add = 0;
        [[MAPS.e2[S.soil], TRIG_VALUES[S.trigIdx], -300], [MAPS.e3[S.soil], Z_VALUES[S.zIdx], 20], [MAPS.e4[S.soil], S.method, 'M02_Surface']].forEach(([map, k, k0]) => { const c = map && rowAt(map, k), b = map && rowAt(map, k0); if (c && b && b.irrigation < 1 && c.irrigation > b.irrigation) add += c.irrigation - b.irrigation; });
        if (add > 0) { const r = Object.assign({}, o); r.irr += add; r.store = r.rain + r.irr - r.et - r.drain; r.ie = r.irr > 1 ? r.yield * 100 / r.irr : 0; return r; }
      } catch (e) {}
      return o;
    };
  }
  window.DESIGN_RUN = RUN; window.DESIGN_BEST = BEST;
  const curId = () => (currentScene && DES.includes(currentScene.id)) ? currentScene.id : null;
  const reporting = () => !!window.__REPORTING;
  const invalidate = (why) => { const id = curId(); if (id && RUN[id].on) { RUN[id].on = false; RUN[id].why = why || 'inputs changed'; } BEST[id || ''] = null; };
  window.designInvalidate = invalidate;

  // ------------------------------------------------------------------ units of the value boxes
  const UNITS = [
    [/\(m\/s\)/, [['m/s', 1], ['km/h', 1 / 3.6]]],
    [/\(L\/s/, [['L/s', 1], ['m³/h', 1 / 3.6], ['L/min', 1 / 60]]],
    [/\(L\/h\)/, [['L/h', 1], ['L/s', 3600]]],
    [/\(ha\)/, [['ha', 1], ['m²', 1e-4], ['acre', 0.404686]]],
    [/\(kPa\)/, [['kPa', 1], ['bar', 100], ['m of water', 9.80665], ['psi', 6.89476]]],
    [/\(min\)/, [['min', 1], ['h', 60]]],
    [/\(h\)/, [['h', 1], ['min', 1 / 60]]],
    [/\(mm\)/, [['mm', 1], ['cm', 10]]],
    [/spacing.*\(m\)|Se \(m\)|Sl \(m\)/i, [['m', 1], ['cm', 0.01]]],
    [/head.*\(m\)|pressure.*\(m\)/i, [['m', 1], ['kPa', 1 / 9.80665], ['bar', 100 / 9.80665], ['ft', 0.3048]]],
    [/hours per day/i, [['h', 1]]],
    [/\(m\)/, [['m', 1], ['km', 1000], ['ft', 0.3048]]],
    [/\(%\)/, [['%', 1]]],
    [/\(°\)/, [['°', 1]]],
    [/\(days\)/, [['days', 1]]]
  ];
  const unitsFor = label => { for (const [re, u] of UNITS) if (re.test(label)) return u; return [['', 1]]; };
  const nice = v => { const a = Math.abs(v); return a >= 100 ? +v.toFixed(0) : a >= 10 ? +v.toFixed(1) : a >= 1 ? +v.toFixed(2) : +v.toFixed(3); };

  // ------------------------------------------------------------------ the picker
  const css = document.createElement('style');
  css.textContent = `html body #swPick{display:block !important;visibility:visible !important}
    #swPick{position:fixed;z-index:80;background:#D4D0C8;font:11px Tahoma,Verdana,sans-serif;color:#000;min-width:270px;max-width:340px;
    box-shadow:inset -1px -1px #404040,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #DFDFDF,3px 3px 0 rgba(0,0,0,.3);padding:3px}
    #swPick .h{background:linear-gradient(90deg,#0A246A,#3A6EA5 70%,#A6CAF0);color:#fff;font-weight:bold;padding:3px 6px;margin-bottom:6px}
    #swPick .r{display:flex;gap:6px;align-items:center;margin:4px 6px}
    #swPick input,#swPick select{font:inherit;background:#fff;border:0;box-shadow:inset 1px 1px #808080,inset -1px -1px #fff,inset 2px 2px #404040,inset -2px -2px #D4D0C8;padding:3px 4px}
    #swPick input{width:110px} #swPick select.list{width:100%} #swPick .note{color:#404040;margin:2px 6px 6px}
    #swPick button{font:inherit;background:#D4D0C8;border:0;box-shadow:inset -1px -1px #404040,inset 1px 1px #fff,inset -2px -2px #808080,inset 2px 2px #DFDFDF;padding:3px 14px;min-width:70px}
    #swPick button:active{box-shadow:inset 1px 1px #808080,inset -1px -1px #fff}
    #swPick .b{display:flex;gap:6px;justify-content:flex-end;margin:6px}`;
  document.head.appendChild(css);
  let PK = null;
  function closePick() { if (PK) { PK.remove(); PK = null; } }
  function place(el, cx, cy) { document.body.appendChild(el); const r = el.getBoundingClientRect(); el.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, cx)) + 'px'; el.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, cy)) + 'px'; }
  const toClient = (x, y) => { const r = canvas.getBoundingClientRect(), s = r.width / canvas.width; return [r.left + x * s, r.top + y * s]; };
  // a numeric value: exact entry with units, or a value from the range
  // what a farmer may type: any value within the physical limits of the system (the list below covers the usual range)
  const LIM = {
    sid: { L: [5, 3000], S: [0.001, 10], qLs: [0.01, 300], n: [0.01, 0.6], cb: [0.1, 1], Zn: [5, 400], Qs: [0.5, 2000], Wf: [1, 5000], om: [0, 20] },
    drip: { Se: [0.05, 5], Sl: [0.1, 10], q: [0.1, 100], LL: [1, 1000], H0: [0.5, 100], D: [4, 110], intv: [1, 60], Zn: [0.5, 300], Af: [0.0001, 10000], Qs: [0.1, 2000], Lm: [0, 10000], lift: [0, 500] },
    spr: { S: [0, 60], u: [0, 30], Sd: [0, 100], d: [1, 40], P: [50, 1200], alpha: [0, 60], Ss: [1, 120], Sl: [1, 120], Zn: [1, 300], top: [1, 24], Af: [0.001, 10000], Qs: [0.1, 5000], LLs: [5, 2000], Lm: [0, 10000], lift: [0, 500] } };
  function pickNumber(w) {
    closePick(); const U = unitsFor(w.label), cur = w.cur, lo = w.rng[0], hi = w.rng[1], st = w.rng[2] || (hi - lo) / 100, PL = (LIM[curId()] || {})[w.key], plo = PL ? Math.min(PL[0], lo) : lo, phi = PL ? Math.max(PL[1], hi) : hi;
    const el = document.createElement('div'); el.id = 'swPick'; PK = el;
    const vals = []; for (let i = 0; i <= 12; i++) { let v = lo + (hi - lo) * i / 12; v = Math.round(v / st) * st; if (!vals.some(q => Math.abs(q - v) < st / 2)) vals.push(+v.toFixed(6)); }
    el.innerHTML = '<div class="h">' + (w.label || 'Value').replace(/</g, '&lt;') + '</div>' +
      '<div class="r"><label style="width:70px">Exact value</label><input id="pkV" type="number" step="any"><select id="pkU">' + U.map((u, i) => '<option value="' + i + '">' + u[0] + '</option>').join('') + '</select></div>' +
      '<div class="r"><label style="width:70px">Or choose</label><select id="pkL" class="list"><option value="">from the range...</option>' + vals.map(v => '<option value="' + v + '">' + nice(v) + ' ' + U[0][0] + '</option>').join('') + '</select></div>' +
      '<div class="note">Type any value from ' + nice(plo) + ' to ' + nice(phi) + ' ' + U[0][0] + ' (the physical limits); the list covers the usual range, ' + nice(lo) + ' to ' + nice(hi) + '. The design is computed when you press Run simulation.</div>' +
      '<div class="b"><button id="pkOk">OK</button><button id="pkNo">Cancel</button></div>';
    const [cx, cy] = toClient(w.bx, w.by + w.bh + 2); place(el, cx, cy);
    const iv = el.querySelector('#pkV'), iu = el.querySelector('#pkU'), il = el.querySelector('#pkL');
    iv.value = +(+cur).toFixed(4); iu.onchange = () => { const f = U[+iu.value][1]; iv.value = nice(cur / f); };
    il.onchange = () => { if (il.value !== '') { iu.value = '0'; iv.value = il.value; } };
    const ok = () => { const raw = parseFloat(String(iv.value).replace(',', '.')); if (!isFinite(raw)) { iv.focus(); return; } let v = raw * U[+iu.value][1]; v = clampN(v, plo, phi); w.set(v); closePick(); invalidate('inputs changed'); try { refresh(); } catch (e) {} };
    el.querySelector('#pkOk').onclick = ok; el.querySelector('#pkNo').onclick = closePick;
    iv.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') closePick(); });
    setTimeout(() => { iv.focus(); iv.select(); }, 20);
  }
  // a choice from a list (with groups)
  function pickList(title, groups, cur, onSet, cx, cy) {
    closePick(); const el = document.createElement('div'); el.id = 'swPick'; PK = el;
    el.innerHTML = '<div class="h">' + title + '</div><div class="r"><select id="pkS" class="list" size="12">' + groups.map(g => (g[0] ? '<optgroup label="' + g[0] + '">' : '') + g[1].map(o => '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>').join('') + (g[0] ? '</optgroup>' : '')).join('') + '</select></div><div class="b"><button id="pkOk">OK</button><button id="pkNo">Cancel</button></div>';
    place(el, cx, cy); const s = el.querySelector('#pkS');
    const ok = () => { if (s.value) { onSet(s.value); invalidate('inputs changed'); } closePick(); };
    el.querySelector('#pkOk').onclick = ok; el.querySelector('#pkNo').onclick = closePick; s.ondblclick = ok; s.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') closePick(); });
    setTimeout(() => s.focus(), 20);
  }
  window.pickList = pickList;
  addEventListener('mousedown', e => { if (PK && !PK.contains(e.target)) closePick(); }, true);

  // ------------------------------------------------------------------ value boxes instead of sliders
  const box = (x, y, w, h, dis) => {
    ctx.fillStyle = dis ? '#ECE9D8' : '#FFFFFF'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#808080'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y, 1, h); ctx.fillStyle = '#404040'; ctx.fillRect(x + 1, y + 1, w - 2, 1); ctx.fillRect(x + 1, y + 1, 1, h - 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h - 1, w, 1); ctx.fillRect(x + w - 1, y, 1, h);
  };
  const dropBtn = (x, y, h) => { ctx.fillStyle = '#D4D0C8'; ctx.fillRect(x, y, 16, h); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 16, 1); ctx.fillRect(x, y, 1, h); ctx.fillStyle = '#808080'; ctx.fillRect(x, y + h - 1, 16, 1); ctx.fillRect(x + 15, y, 1, h);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x + 4, y + h / 2 - 2); ctx.lineTo(x + 12, y + h / 2 - 2); ctx.lineTo(x + 8, y + h / 2 + 2); ctx.closePath(); ctx.fill(); };
  sidSlider = function (key, label, x, y, w, rng, val, fmt, dis, sub) {
    T(label, x, y, { s: 9.5, b: true, c: dis ? '#808080' : '#000000' });
    const by = y + 4, bh = 18; box(x, by, w, bh, dis); T(typedOf(SIDCUR, key) ? exactFmt(fmt(val), val, rng) : fmt(val), x + 6, by + 13, { s: 10, b: true, c: dis ? '#808080' : '#0A246A' });
    if (!dis) dropBtn(x + w - 18, by + 1, bh - 2);
    const obj = SIDCUR;
    if (!dis) SIDW.push({ key, x, w, y: by + bh / 2, rng, sub, obj, field: true, label: label || (key === 'Zn' ? 'Required depth Zn (mm)' : key), cur: val, bx: x, by, bw: w, bh });
  };
  // the box shows the value as typed (2.13 stays 2.13), not rounded to the decimals of the old slider label
  const exactFmt = (t, val, rng) => { if (typeof t !== 'string' || typeof val !== 'number' || !isFinite(val)) return t; const m = t.match(/-?\d+(?:\.\d+)?/); if (!m) return t; const n = parseFloat(m[0]), d = (m[0].split('.')[1] || '').length, ex = +val.toFixed(4);
    if (n === ex || Math.abs(n - val) > 0.5001 * Math.pow(10, -d) || String(ex).length > 9) return t; return t.slice(0, m.index) + String(ex) + t.slice(m.index + m[0].length); };
  // values the user typed are shown as typed; values set by the program keep the decimals of their label
  const TYPED = new WeakMap(), typedOf = (o, k) => !!(o && TYPED.get(o) && TYPED.get(o).has(k));
  const setField = (s, v) => { if (!TYPED.get(s.obj)) TYPED.set(s.obj, new Set()); TYPED.get(s.obj).add(s.key); s.obj[s.key] = +(v * (s.scale || 1)).toFixed(6); if (s.obj === SID) { if (s.key === 'qLs') SID.autoQ = false; if (s.key === 'tman') SID.cut = 'man'; sidTouch(s.key); } else if (s.obj.touch) s.obj.touch(s.key); };
  const oSidDown = sidDown;
  sidDown = function (p) {
    const id0 = curId(), lim = id0 && !RUN[id0].on ? inputsEnd(id0) : 1e9;
    for (const s of SIDW) if (s.field && s.by < lim && p.x >= s.bx && p.x <= s.bx + s.bw && p.y >= s.by - 14 && p.y <= s.by + s.bh) { pickNumber(Object.assign({}, s, { set: v => setField(s, v) })); return true; }
    return false;   // no dragging of values
  };
  // the explorer's crop and mulch in the drip and sprinkler designs: the crop is a drop-down
  if (typeof irCtl === 'function') {
    irCtl = function (y) {
      if (_irCropSeen !== state.crop) { if (_irCropSeen != null) { DRP.Sl = (CROPS[state.crop] && CROPS[state.crop].kind === 'vegetable') ? 1.5 : 1.0; } _irCropSeen = state.crop; }
      const vff = VFF_VALUES[state.vffIdx], curM = vff >= 0.95 ? 'none' : state.mulchType;
      T('Crop', 16, y + 15, { s: 9, b: true, c: MUTE });
      const x0 = 92, w = W - 14 - x0; box(x0, y + 2, w, 20, false); T((CROPS[state.crop] || {}).label || state.crop, x0 + 6, y + 16, { s: 10, b: true, c: '#0A246A' }); dropBtn(x0 + w - 18, y + 3, 18);
      hot(x0, y + 2, w, 20, () => { const [cx, cy] = toClient(x0, y + 24); const G = (window.CROP_GROUPS || [['Crops', Object.keys(CROPS)]]).map(g => [g[0], g[1].filter(k => CROPS[k]).map(k => [k, CROPS[k].label])]); pickList('Crop', G, state.crop, k => applyState({ crop: k }), cx, cy); }, 'Changes the crop in the whole program: roots, water need, season');
      sidRow('Mulch', y + 28, IRMUL.map(q => [q[1], curM === q[0], () => setMulch(q[0]), 'Cover on the soil: less evaporation, interception of sprays']));
      return y + 56;
    };
  }
  // chips (system, intake, cutoff, emitter ...) are inputs too: a click changes the design and waits for Run
  const oChip = sidChip;
  sidChip = function (x, y, w, h, label, on, fn, tip) { return oChip(x, y, w, h, label, on, function () { const r = fn.apply(this, arguments); invalidate('inputs changed'); return r; }, tip); };

  // ------------------------------------------------------------------ Run simulation
  // the inputs that change a design result (the irrigation method of the annual model does not)
  const stateKey = () => JSON.stringify(Object.assign({}, state, { method: 0, n1Prev: 0 })) + '|' + (typeof dss !== 'undefined' ? dss.mode : '');
  window.designStateKey = () => stateKey();
  function runDesign(id) { id = id || curId(); if (!id) return; RUN[id].on = true; RUN[id].st = stateKey(); RUN[id].why = ''; play.t = 0; play.hold = 0; play.on = true; const pb = document.getElementById('playBtn'); if (pb) pb.textContent = 'Pause'; try { BEST[id] = bestFor(id); } catch (e) { BEST[id] = null; } }
  window.runDesign = runDesign;
  const btn3d = (x, y, w, h, label, prim) => { ctx.fillStyle = prim ? '#0A246A' : '#D4D0C8'; ctx.fillRect(x, y, w, h); ctx.fillStyle = prim ? '#3A6EA5' : '#FFFFFF'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h); ctx.fillStyle = prim ? '#000' : '#404040'; ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x + w - 2, y, 2, h); T(label, x + w / 2, y + h / 2 + 4.5, { s: 12, b: true, a: 'center', c: prim ? '#FFFFFF' : '#000' }); };
  DES.forEach(id => {
    const sc = SCENES.find(s => s.id === id); if (!sc || sc._runWrapped) return; sc._runWrapped = true; const od = sc.draw;
    sc.draw = function () {
      const R = RUN[id];
      if (R.on && R.st !== stateKey()) { R.on = false; R.why = 'the settings in Properties changed'; }
      if (!R.on && !reporting()) { play.on = false; play.t = 0; play.hold = 0; }
      const out = od.apply(this, arguments);
      // after a run the simulation keeps playing, and starts again at the end of the season, until Pause is pressed
      if (!R.on && !reporting()) {
        const inEnd = inputsEnd(id);
        hotspots.splice(0, hotspots.length, ...hotspots.filter(h => h.y + h.h <= inEnd));
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1, inEnd, W - 2, H - inEnd - 1);
        const bw = Math.min(W - 40, 520), bx = (W - bw) / 2, by = inEnd + 18, bh = 150;
        ctx.fillStyle = '#D4D0C8'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by, 1, bh); ctx.fillStyle = '#404040'; ctx.fillRect(bx, by + bh - 1, bw, 1); ctx.fillRect(bx + bw - 1, by, 1, bh);
        const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#0A246A'); g.addColorStop(0.7, '#3A6EA5'); g.addColorStop(1, '#A6CAF0'); ctx.fillStyle = g; ctx.fillRect(bx + 3, by + 3, bw - 6, 20);
        T('Run the design', bx + 10, by + 17, { s: 11, b: true, c: '#FFFFFF' });
        T(R.why ? 'The ' + R.why + ': the results wait for a new run.' : 'Set the inputs above (click a value box to type the exact value), then run.', bx + 14, by + 46, { s: 10.5, c: '#000' });
        T('The results, charts and design table follow the run.', bx + 14, by + 64, { s: 10, c: '#404040' });
        btn3d(bx + 14, by + 82, 190, 34, '▶  Run simulation', true); hot(bx + 14, by + 82, 190, 34, () => runDesign(id), 'compute this design with the inputs above');
        btn3d(bx + 216, by + 82, 250, 34, 'Find the most efficient inputs', false); hot(bx + 216, by + 82, 250, 34, () => { BEST[id] = bestFor(id); applyBest(id); runDesign(id); }, 'search the inputs for the highest application efficiency, apply them and run');
        T('Results are hidden until the run, so nothing changes while you type.', bx + 14, by + 136, { s: 9, i: true, c: '#404040' });
        const pb = document.getElementById('playBtn'); if (pb && pb.textContent !== 'Run simulation') pb.textContent = 'Run simulation';
      }
      return out;
    };
  });
  // where the inputs end: the first result heading of the layer
  function inputsEnd(id) { const sec = (window.__SEC || {})[id] || {}; let m = 1e9; for (const k in sec) m = Math.min(m, sec[k][0]); if (m < 1e9) return Math.max(200, m - 20); let e = 0; SIDW.forEach(s => { e = Math.max(e, (s.by || s.y) + (s.bh || 10)); }); return Math.max(e + 26, 300); }
  window.designInputsEnd = inputsEnd;
  // the Play button of the design layers is the Run button
  const pb = document.getElementById('playBtn');
  if (pb) pb.addEventListener('click', e => { const id = curId(); if (id && !RUN[id].on) { e.stopImmediatePropagation(); e.preventDefault(); runDesign(id); } }, true);
  // opening a design layer never starts it
  const oSwitch = switchScene;
  switchScene = function (sc) { const r = oSwitch.apply(this, arguments); try { if (sc && DES.includes(sc.id) && !RUN[sc.id].on) { play.on = false; play.t = 0; } } catch (e) {} return r; };

  // ------------------------------------------------------------------ the most efficient combination of the inputs
  const score = R => (R && isFinite(R.Ea) ? R.Ea : 0) - Math.max(0, 0.95 - (R && isFinite(R.Es) ? R.Es : 0)) * 3;
  function bestFor(id) {
    const t0 = performance.now(); let best = null;
    if (id === 'sid') {
      const d = SIDDEF[SID.sys], keep = { cut: SID.cut, tman: SID.tman }; const qs = []; for (let i = 0; i <= 10; i++) qs.push(+(d.qr[0] * Math.pow(d.qr[1] / d.qr[0], i / 10)).toFixed(2));
      const Ls = [1, 2, 3, 4].map(n => ({ n, L: Math.round(SID.L / n) })).filter(v => v.n === 1 || v.L >= d.Lr[0]);
      outer: for (const { n, L } of Ls) for (const cut of ['es1', 'r85']) for (const cb of [1, 0.75, 0.5]) for (const q of qs) {
        SID.cut = cut; let R; try { R = sidRun({ qLs: q, cb, L }, 2); } catch (e) { continue; }
        const sc = score(R); if (!best || sc > best.sc) best = { sc, set: { qLs: q, cut, cb, L }, Ea: R.Ea, Es: R.Es, dp: R.dp, ro: R.ro, tco: R.tco, txt: (n > 1 ? 'run length ' + L + ' m (the field split into ' + n + ' runs), ' : 'run length ' + L + ' m, ') + 'inflow ' + q.toFixed(2) + ' L/s, cutoff ' + (cut === 'es1' ? 'when the tail is filled' : 'at 85 % of the length') + ', cutback ' + (cb >= 1 ? 'none' : Math.round(cb * 100) + ' % of the inflow') };
        if (performance.now() - t0 > 3500) break outer;
      }
      SID.cut = keep.cut; SID.tman = keep.tman;
    } else if (id === 'drip') {
      for (const q of [1, 1.6, 2, 3, 4, 8]) for (const Se of [0.3, 0.5, 0.75, 1]) for (const intv of [1, 2, 3, 4]) {
        let R; try { R = drRun({ q, Se, intv }); } catch (e) { continue; }
        const sc = score(R) + (R.Eu || 0) * 0.05; if (!best || sc > best.sc) best = { sc, set: { q, Se, intv }, Ea: R.Ea, Es: R.Es, dp: R.dp, Eu: R.Eu, t: R.t, txt: 'emitter flow ' + q + ' L/h, emitter spacing ' + Se + ' m, irrigate every ' + intv + ' day' + (intv > 1 ? 's' : '') + ' (run time ' + R.t.toFixed(1) + ' h)' };
        if (performance.now() - t0 > 2500) break;
      }
    } else if (id === 'spr') {
      const ST = IRM.STYPE[SPR.type] || {}, dr = ST.dr || [SPR.d * 0.6, SPR.d * 1.6], pr = ST.pr || [SPR.P * 0.7, SPR.P * 1.4];
      const ds = [0, 0.25, 0.5, 0.75, 1].map(f => +(dr[0] + (dr[1] - dr[0]) * f).toFixed(1)), ps = [0, 0.33, 0.67, 1].map(f => Math.round(pr[0] + (pr[1] - pr[0]) * f));
      for (const d of ds) for (const P of ps) {
        let R0; try { R0 = spRun({ d, P }); } catch (e) { continue; } const Rw = R0.nz && R0.nz.R ? R0.nz.R : 10;
        for (const f of [0.4, 0.45, 0.5, 0.55, 0.6, 0.65]) { const Ss = +(Math.max(3, Math.round(2 * Rw * f))).toFixed(0), Sl = Ss; let R; try { R = spRun({ d, P, Ss, Sl }); } catch (e) { continue; }
          const sc = score(R) + (R.CU || 0) * 0.05 - (R.ro || 0) * 2; if (!best || sc > best.sc) best = { sc, set: { d, P, Ss, Sl }, Ea: R.Ea, Es: R.Es, dp: R.dp, CU: R.CU, txt: 'nozzle ' + d + ' mm at ' + P + ' kPa, spacing ' + Ss + ' × ' + Sl + ' m (wetted radius ' + Rw.toFixed(1) + ' m)' }; }
        if (performance.now() - t0 > 2500) break;
      }
    }
    // the present inputs compete too: a combination is recommended only when it beats them
    try { const R = id === 'sid' ? sidRun() : id === 'drip' ? drRun() : spRun(); const sc = score(R) + (id === 'drip' ? (R.Eu || 0) * 0.05 : id === 'spr' ? (R.CU || 0) * 0.05 - (R.ro || 0) * 2 : 0);
      if (!best || sc >= best.sc - 1e-9) best = { sc, same: true, set: {}, Ea: R.Ea, Es: R.Es, dp: R.dp, ro: R.ro, CU: R.CU, Eu: R.Eu, txt: 'your present inputs: none of the combinations tried does better' }; } catch (e) {}
    if (best) best.ms = Math.round(performance.now() - t0);
    return best;
  }
  function applyBest(id) { const b = BEST[id]; if (!b) return false; const o = OBJ()[id]; Object.assign(o, b.set); if (id === 'sid') { SID.autoQ = false; SID.preset = null; } return true; }
  window.designBest = id => { const b = BEST[id] || (BEST[id] = bestFor(id)); return b ? { same: !!b.same, txt: b.txt, Ea: b.Ea, Es: b.Es, dp: b.dp, ro: b.ro, CU: b.CU, Eu: b.Eu } : null; };
  window.designApplyBest = id => { if (!BEST[id]) BEST[id] = bestFor(id); applyBest(id); runDesign(id); try { refresh(); } catch (e) {} return true; };

  // ------------------------------------------------------------------ chart series for the workbench
  // the zones (drip) or sets (sprinklers) run one after the other, each for the run time: flow at the pump against time
  function zoneHyd(kind, R, o, tRun, intv) {
    let G; try { G = irSystem(kind, R, o); } catch (e) { return { hq: [], ht: [], times: [] }; }
    const nz = G.zones, ht = [], hq = []; for (let z = 0; z < nz; z++) { ht.push(z * tRun, z * tRun, (z + 1) * tRun); hq.push(z ? G.Qz : 0, G.Qz, G.Qz); } ht.push(nz * tRun, nz * tRun + tRun * 0.05); hq.push(0, 0);
    const times = [[kind === 'drip' ? 'run time of a zone' : 'set time', tRun], [kind === 'drip' ? 'whole field (' + nz + ' zones)' : 'whole field (' + nz + ' sets)', nz * tRun]];
    if (intv) times.push(['irrigation interval', intv * 24]);
    return { ht, hq, times, zones: nz, Qz: G.Qz };
  }
  window.designCharts = function (id) {
    if (id === 'sid') {
      const R = sidRun(), P = R.P, H = sidHyd(R), cv = v => v * 1000 / 60, n = H.t.length;
      let tr = 0; for (let i = n - 1; i >= 0; i--) if (H.t[i] > R.tco && H.Ro[i] > 1e-9) { tr = H.t[i] - R.tco; break; }
      const xs = [], adv = [], rec = [], opp = [], Z = [];
      for (let i = 0; i <= 40; i++) { const x = P.L * i / 40, ta = Math.min(R.txf(x), 1e6), trx = R.tco + tr * (P.L > 0 ? x / P.L : 0); xs.push(x); adv.push(ta); rec.push(Math.max(trx, Math.min(ta, R.tco))); opp.push(Math.max(0, Math.max(trx, ta) - ta)); Z.push(P.k * Math.pow(Math.max(0, R.tco - ta), P.A) * 1000); }
      return { kind: 'sid', t: H.t, qin: H.Qin.map(cv), inf: H.I.map(cv), ro: H.Ro.map(cv), xs, adv, rec, opp, Z, Zn: P.Zn * 1000, tL: R.tL, tst: R.tst, tco: R.tco, tr, L: P.L,
        fate: [['Stored in the root zone', R.Ea], ['Deep percolation', R.dp], ['Runoff', R.ro]], unitQ: SID.sys === 'furrow' ? 'L/s per furrow' : 'L/s per m width' };
    }
    if (id === 'drip') {
      const R = drRun(), lat = R.lat || {}, o = R.o;
      const pick = (obj, names) => { for (const n of names) if (obj && Array.isArray(obj[n])) return obj[n]; for (const n of names) if (obj && obj[n] && obj[n].length) return Array.from(obj[n]); return null; };
      const h = pick(lat, ['h', 'H', 'head', 'hs']), q = pick(lat, ['q', 'Q', 'flow', 'qs']), x = pick(lat, ['x', 'xs']);
      return { kind: 'drip', x: x || (h ? h.map((_, i) => i * (o.LL || 100) / Math.max(1, h.length - 1)) : []), h: h || [], q: q || [], fate: [['Stored in the root zone', R.Ea], ['Deep percolation', R.dp], ['Evaporation', R.ev || 0]], Eu: R.Eu, t: R.t, Pw: R.Pw, gross: R.gross, ...zoneHyd('drip', R, o, R.t, o.intv) };
    }
    if (id === 'spr') {
      const R = spRun(), o = R.o, AR = R.AR, K = R.K, A = R.A, T0 = R.T, ts = [], ir = [], ar = [];
      for (let i = 1; i <= 60; i++) { const t = T0 * i / 60; ts.push(t); ir.push(K * A * Math.pow(t, A - 1) * 60); ar.push(AR); }
      const f = R.f && R.f.length ? R.f : null, prof = [];
      if (R.arr && R.arr.length) { const a = Array.from(R.arr); a.sort((p, q2) => p - q2); for (let i = 0; i < 20; i++) prof.push(a[Math.floor(i / 19 * (a.length - 1))]); }
      return { kind: 'spr', t: ts, intake: ir, rate: ar, fate: [['Stored in the root zone', R.Ea], ['Deep percolation', R.dp], ['Runoff', R.ro], ['Wind drift and evaporation', R.wdTot || 0]], CU: R.CU, DU: R.DU, catchSorted: prof, T: T0, ...zoneHyd('spr', R, o, T0 / 60, null) };
    }
    return null;
  };
})();

/* Speed: every frame paints only the part of the sheet that is on the screen (the drawing code still runs whole, so
   positions, heights and hot spots stay the same); the report and pictures paint the whole sheet. */
(function () {
  if (typeof SCENES === 'undefined') return;
  const visible = () => {
    if (window.__REPORTING || document.hidden) return null; const r = canvas.getBoundingClientRect(); if (!r.height) return null;
    const s = canvas.height / r.height, top = Math.max(0, -r.top) * s, bot = Math.min(r.height, innerHeight - r.top) * s;
    if (bot - top >= canvas.height - 2) return null; return [Math.max(0, top - 40), Math.min(canvas.height, bot + 40)];
  };
  SCENES.forEach(sc => {
    if (!sc || sc._clipWrapped || typeof sc.draw !== 'function') return; sc._clipWrapped = true; const od = sc.draw;
    sc.draw = function () { const v = visible(); if (!v) return od.apply(this, arguments); ctx.save(); ctx.beginPath(); ctx.rect(0, v[0], W, v[1] - v[0]); ctx.clip(); try { return od.apply(this, arguments); } finally { ctx.restore(); } };
  });
  // pictures of the sheet (save picture, print, report) are always of the whole sheet
  const full = () => { const k = window.__REPORTING; window.__REPORTING = true; try { ctx.clearRect(0, 0, W, H); hotspots.length = 0; currentScene.draw(); } catch (e) {} finally { window.__REPORTING = k; } };
  const oURL = canvas.toDataURL.bind(canvas), oBlob = canvas.toBlob.bind(canvas);
  canvas.toDataURL = function () { full(); return oURL.apply(null, arguments); };
  canvas.toBlob = function () { full(); return oBlob.apply(null, arguments); };
  addEventListener('beforeprint', full);
  if (typeof buildReport === 'function') { const ob = buildReport; buildReport = function () { const k = window.__REPORTING; window.__REPORTING = true; try { return ob.apply(this, arguments); } finally { window.__REPORTING = k; } }; }
})();

/* The virtual farm runs its own clock and shows the system of the design it was opened from: on leaving it, the working
   date and the irrigation method of the project come back to what they were. */
(function () {
  if (typeof switchScene !== 'function') return;
  const oSw = switchScene;
  switchScene = function (sc) {
    const id = sc && sc.id ? sc.id : sc, prev = (typeof currentScene !== 'undefined' && currentScene) ? currentScene.id : null;
    if (id === 'farm' && prev !== 'farm' && !window.__farmPrev) window.__farmPrev = { m: state.method, d: fclock.day };
    const r = oSw.apply(this, arguments);
    if (prev !== id) try { const pl = document.getElementById('playLabel'); if (pl) pl.textContent = ''; } catch (e) {}
    if (prev === 'farm' && id !== 'farm' && window.__farmPrev) { const p = window.__farmPrev; window.__farmPrev = null; try { fclock.day = p.d; fclock.mem = []; if (p.m && p.m !== state.method) applyState({ method: p.m }); } catch (e) {} }
    return r;
  };
})();
/* Labels in pills are drawn after the arrows and pictures of a layer, so no arrow covers a label; a pill that would
   sit on another pill moves down. */
(function () {
  if (typeof pill !== 'function' || typeof pillBox !== 'function') return;
  let Q = null; const oPill = pill;
  pill = function (txt, x, y, o) {
    if (!Q) return oPill(txt, x, y, o);
    o = o || {}; ctx.font = (o.b ? 'bold ' : '') + (o.s || 10.5) + 'px sans-serif'; const w = ctx.measureText(txt).width + 10, xx = o.a === 'right' ? x - w : o.a === 'center' ? x - w / 2 : x;
    Q.push([txt, x, y, o, xx, w]); return { x: xx, y: y - 11, w, h: 16 };
  };
  const flush = () => { const q = Q; Q = null; const done = []; q.forEach(([txt, x, y, o, xx, w]) => { let yy = y; for (let k = 0; k < 6; k++) { const hit = done.find(r => xx < r.x + r.w && xx + w > r.x && yy - 11 < r.y + 16 && yy + 5 > r.y); if (!hit) break; yy = hit.y + 16 + 11 + 1; } done.push({ x: xx, y: yy - 11, w }); oPill(txt, x, yy, o); }); };
  const SKIP = { sid: 1, drip: 1, spr: 1, farm: 1 };
  SCENES.forEach(sc => { if (SKIP[sc.id] || sc._pillWrap || typeof sc.draw !== 'function') return; sc._pillWrap = true; const od = sc.draw; sc.draw = function () { Q = []; let r; try { r = od.apply(this, arguments); } finally { if (Q) flush(); } return r; }; });
})();
/* Layer names without their internal codes (S2, V5, C1 ...): the names alone are shown everywhere. */
(function () { try { const NM = { sid: 'Surface irrigation design', drip: 'Drip irrigation design', spr: 'Sprinkler design and pipes', farm: 'Virtual farm simulation', v1: 'Sensor and trigger', n1: 'Trigger law', v4: 'Mulch against bare soil', v6: 'Mulch control', e1: 'Evaporation physics', n2: 'Fate of saved water', n3: 'Regime map', v3: 'Tillage and structure', v7: 'Soil hydraulic drivers', r1: 'Root structure', dph: 'Deterministic phenotyping', field: 'Field balance', spac: 'Soil, plant and air', v2: 'Profile evolution', yby: 'Reliability over 20 seasons', wb2: 'Full water balance', nb: 'Nitrogen budget', chem: 'Chemical fate', dsum: 'Daisy decision table', crop: 'Crop water requirement', v5: 'Feedback loops' };
    const fix = s => { if (s && typeof s.label === 'string') s.label = NM[s.id] || s.label.replace(/^[A-Z]\d{1,2}\s+/, ''); }; SCENES.forEach(fix); const oP = SCENES.push.bind(SCENES); SCENES.push = function () { [...arguments].forEach(fix); return oP.apply(null, arguments); }; } catch (e) {} })();
