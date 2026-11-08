/* The soil textural triangle (USDA classes), drawn here from the class rules, not copied from a picture.
   Click a point: the sand, silt and clay of that point and its textural class are shown, and the soil of the program that is
   nearest to it can be taken (SWAFL layers, Properties), or the exact percentages (Daisy, My soil).
   SoilTriangle.open({ title, soils:[{id,label,sand,silt,clay}], current:id, point:{sand,silt,clay}, mode:'soil'|'texture', onPick(r) }) */
'use strict';
window.SoilTriangle = (() => {
  // USDA classes from sand, silt and clay in % (the rules of the USDA soil survey manual)
  const classify = (sand, silt, clay) => {
    if (silt + 1.5 * clay < 15) return 'Sand';
    if (silt + 1.5 * clay >= 15 && silt + 2 * clay < 30) return 'Loamy sand';
    if ((clay >= 7 && clay < 20 && sand > 52 && silt + 2 * clay >= 30) || (clay < 7 && silt < 50 && silt + 2 * clay >= 30)) return 'Sandy loam';
    if (clay >= 7 && clay < 27 && silt >= 28 && silt < 50 && sand <= 52) return 'Loam';
    if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) return 'Silt loam';
    if (silt >= 80 && clay < 12) return 'Silt';
    if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) return 'Sandy clay loam';
    if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) return 'Clay loam';
    if (clay >= 27 && clay < 40 && sand <= 20) return 'Silty clay loam';
    if (clay >= 35 && sand > 45) return 'Sandy clay';
    if (clay >= 40 && silt >= 40) return 'Silty clay';
    if (clay >= 40 && sand <= 45 && silt < 40) return 'Clay';
    return 'Loam';
  };
  const CLASSES = ['Sand', 'Loamy sand', 'Sandy loam', 'Loam', 'Silt loam', 'Silt', 'Sandy clay loam', 'Clay loam', 'Silty clay loam', 'Sandy clay', 'Silty clay', 'Clay'];
  const FILL = ['#F3E3A0', '#EBD38C', '#E2C27C', '#C9B58A', '#B9C99A', '#A5C7B8', '#D9A98B', '#C28F7A', '#9FB2C4', '#D88E8E', '#8EA0C9', '#B9788A'];
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let ov = null;
  function close() { if (ov) { ov.remove(); ov = null; } document.removeEventListener('keydown', onKey, true); }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function open(o) {
    close(); o = o || {}; const soils = (o.soils || []).filter(s => isFinite(s.sand) && isFinite(s.silt) && isFinite(s.clay)), mode = o.mode || 'soil';
    ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(12,24,40,.55);display:flex;align-items:center;justify-content:center;font:13px/1.35 system-ui,Segoe UI,sans-serif';
    ov.innerHTML = '<div style="background:#F4F1E8;border:2px solid #0F3B63;box-shadow:0 8px 30px rgba(0,0,0,.4);max-width:96vw;max-height:96vh;overflow:auto;display:flex;flex-direction:column">' +
      '<div style="background:linear-gradient(90deg,#0F3B63,#2A6AA8);color:#fff;padding:6px 10px;font-weight:700;display:flex;align-items:center"><span>' + esc(o.title || 'Soil textural triangle') + '</span><span data-x style="margin-left:auto;cursor:pointer;padding:0 6px" title="Close (Esc)">&#10005;</span></div>' +
      '<div style="display:flex;gap:12px;padding:10px;flex-wrap:wrap"><div><canvas data-c style="display:block;cursor:crosshair;background:#fff;border:1px solid #9aa"></canvas></div>' +
      '<div style="width:250px;min-width:230px;font-weight:500;color:#0C2238"><div data-read style="background:#fff;border:1px solid #B9B4A6;padding:8px;min-height:92px"><b>Click in the triangle</b><br>Each point is one mixture of sand, silt and clay. The colours are the USDA textural classes' + (soils.length ? '; the numbered dots are the soils of the program.' : '.') + '</div>' +
      '<div style="margin:8px 0 0;font-weight:700">Type your own mixture (%)</div><div style="display:flex;gap:5px;align-items:center"><label>Sand <input data-in="0" type="number" min="0" max="100" step="1" style="width:52px"></label><label>Silt <input data-in="1" type="number" min="0" max="100" step="1" style="width:52px"></label><label>Clay <input data-in="2" type="number" min="0" max="100" step="1" style="width:52px"></label></div><div data-sum style="font-size:11px;color:#35506C">The third value is completed to 100 automatically and the point is placed on the triangle.</div>' +
      (soils.length ? '<div style="margin:8px 0 3px;font-weight:700">Soils of the program</div><div data-list style="display:flex;flex-direction:column;gap:3px"></div>' : '') +
      '<div style="margin-top:10px;display:flex;gap:6px"><button data-use class="btn pri" disabled style="font-weight:700">' + (mode === 'soil' ? 'Use this soil' : 'Use these percentages') + '</button><button data-cancel class="btn">Cancel</button></div></div></div></div>';
    document.body.appendChild(ov); document.addEventListener('keydown', onKey, true);
    ov.addEventListener('mousedown', e => { if (e.target === ov) close(); }); ov.querySelector('[data-x]').onclick = close; ov.querySelector('[data-cancel]').onclick = close;
    const cv = ov.querySelector('[data-c]'), W = Math.min(640, Math.floor(innerWidth * 0.9 - 40)), H = Math.round(W * 0.88), dpr = Math.max(2, window.devicePixelRatio || 1);
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    // geometry: top = 100 % clay, bottom left = 100 % sand, bottom right = 100 % silt
    const mL = 62, mR = 62, mT = 34, mB = 58, side = Math.min(W - mL - mR, (H - mT - mB) / (Math.sqrt(3) / 2)), tH = side * Math.sqrt(3) / 2, x0 = (W - side) / 2, yB = mT + tH + 4;
    const Vs = [x0, yB], Vz = [x0 + side, yB], Vc = [x0 + side / 2, yB - tH];
    const toXY = (sa, si, cl) => { const t = sa + si + cl || 100; sa /= t; si /= t; cl /= t; return [Vs[0] * sa + Vz[0] * si + Vc[0] * cl, Vs[1] * sa + Vz[1] * si + Vc[1] * cl]; };
    const fromXY = (x, y) => { const cl = (yB - y) / tH, sa = (x - Vz[0] - cl * (Vc[0] - Vz[0])) / (Vs[0] - Vz[0]), si = 1 - sa - cl; return [sa * 100, si * 100, cl * 100]; };
    const inside = (sa, si, cl) => sa >= -0.001 && si >= -0.001 && cl >= -0.001;
    // the coloured classes, class by class for every pixel of the triangle
    const px = 2, cw = Math.round(W * px), ch = Math.round(H * px), img = ctx.createImageData(cw, ch), idx = new Int8Array(cw * ch).fill(-1), cen = CLASSES.map(() => [0, 0, 0]);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const [sa, si, cl] = fromXY(i / px, j / px); if (!inside(sa / 100, si / 100, cl / 100)) continue; const k = CLASSES.indexOf(classify(sa, si, cl)); idx[j * cw + i] = k; const c = cen[k]; c[0] += i / px; c[1] += j / px; c[2]++; }
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const k = idx[j * cw + i]; if (k < 0) continue; const edge = (i + 1 < cw && idx[j * cw + i + 1] !== k) || (j + 1 < ch && idx[(j + 1) * cw + i] !== k) || (i > 0 && idx[j * cw + i - 1] !== k) || (j > 0 && idx[(j - 1) * cw + i] !== k); const c = hex(FILL[k]), q = (j * cw + i) * 4; img.data[q] = edge ? 60 : c[0]; img.data[q + 1] = edge ? 60 : c[1]; img.data[q + 2] = edge ? 60 : c[2]; img.data[q + 3] = 255; }
    const off = document.createElement('canvas'); off.width = cw; off.height = ch; off.getContext('2d').putImageData(img, 0, 0);
    const base = document.createElement('canvas'); base.width = W * dpr; base.height = H * dpr; const bx = base.getContext('2d'); bx.scale(dpr, dpr);
    bx.fillStyle = '#fff'; bx.fillRect(0, 0, W, H); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high'; bx.drawImage(off, 0, 0, W, H);
    // grid, ticks, labels
    bx.strokeStyle = 'rgba(30,30,30,.22)'; bx.lineWidth = 0.7; bx.font = '11px sans-serif'; bx.fillStyle = '#1B1F23';
    for (let v = 10; v <= 90; v += 10) {
      let a = toXY(100 - v, 0, v), b = toXY(0, 100 - v, v); bx.beginPath(); bx.moveTo(a[0], a[1]); bx.lineTo(b[0], b[1]); bx.stroke();   // clay: horizontal
      a = toXY(100 - v, v, 0); b = toXY(0, v, 100 - v); bx.beginPath(); bx.moveTo(a[0], a[1]); bx.lineTo(b[0], b[1]); bx.stroke();   // silt
      a = toXY(v, 100 - v, 0); b = toXY(v, 0, 100 - v); bx.beginPath(); bx.moveTo(a[0], a[1]); bx.lineTo(b[0], b[1]); bx.stroke(); }  // sand
    bx.strokeStyle = '#1B1F23'; bx.lineWidth = 1.6; bx.beginPath(); bx.moveTo(Vs[0], Vs[1]); bx.lineTo(Vz[0], Vz[1]); bx.lineTo(Vc[0], Vc[1]); bx.closePath(); bx.stroke(); bx.lineWidth = 1.2;
    for (let v = 0; v <= 100; v += 10) {
      let p = toXY(100 - v, 0, v); bx.beginPath(); bx.moveTo(p[0], p[1]); bx.lineTo(p[0] - 5, p[1]); bx.stroke(); bx.textAlign = 'right'; bx.textBaseline = 'middle'; bx.fillText(v, p[0] - 8, p[1]);          // clay on the left edge
      p = toXY(0, 100 - v, v); bx.beginPath(); bx.moveTo(p[0], p[1]); bx.lineTo(p[0] + 4, p[1] + 3); bx.stroke(); bx.textAlign = 'left'; bx.fillText(100 - v, p[0] + 8, p[1] + 3);                      // silt on the right edge, from the top down
      p = toXY(v, 100 - v, 0); bx.beginPath(); bx.moveTo(p[0], p[1]); bx.lineTo(p[0], p[1] + 5); bx.stroke(); bx.textAlign = 'center'; bx.textBaseline = 'top'; bx.fillText(v, p[0], p[1] + 8); }          // sand on the bottom, from the right to the left
    bx.font = 'bold 12px sans-serif'; bx.textBaseline = 'middle'; bx.textAlign = 'center'; bx.save(); bx.translate(Vs[0] + (Vc[0] - Vs[0]) / 2 - 40, Vs[1] + (Vc[1] - Vs[1]) / 2); bx.rotate(-Math.PI / 3); bx.fillText('Clay (%)', 0, 0); bx.restore();
    bx.save(); bx.translate(Vz[0] + (Vc[0] - Vz[0]) / 2 + 40, Vz[1] + (Vc[1] - Vz[1]) / 2); bx.rotate(Math.PI / 3); bx.fillText('Silt (%)', 0, 0); bx.restore(); bx.fillText('Sand (%)', (Vs[0] + Vz[0]) / 2, yB + 36);
    bx.font = '600 10.5px sans-serif'; bx.fillStyle = '#10243a'; CLASSES.forEach((n, k) => { const c = cen[k]; if (!c[2]) return; let tx = c[0] / c[2], ty = c[1] / c[2]; const words = n === 'Sandy clay loam' ? ['Sandy clay', 'loam'] : n === 'Silty clay loam' ? ['Silty clay', 'loam'] : n === 'Loamy sand' ? ['Loamy', 'sand'] : [n]; if (n === 'Sand') { tx -= 10; ty += 8; } if (n === 'Silt') ty += 4;
      words.forEach((w, i) => { bx.textAlign = 'center'; bx.fillText(w, tx, ty + (i - (words.length - 1) / 2) * 12); }); });
    // the soils of the program
    const state = { pt: null, soil: o.current || null }; const dotOf = s => toXY(s.sand, s.silt, s.clay);
    const nearest = (sa, si, cl) => { const cls = classify(sa, si, cl); let best = null, bd = 1e9; soils.forEach(s => { let d = Math.pow(s.sand - sa, 2) + Math.pow(s.silt - si, 2) + Math.pow(s.clay - cl, 2); if (classify(s.sand, s.silt, s.clay) === cls) d *= 0.35; if (d < bd) { bd = d; best = s; } }); return best; };
    const read = ov.querySelector('[data-read]'), use = ov.querySelector('[data-use]'), list = ov.querySelector('[data-list]');
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      soils.forEach((s, n) => { const p = dotOf(s), on = s.id === state.soil; ctx.beginPath(); ctx.arc(p[0], p[1], on ? 9 : 8, 0, 6.2832); ctx.fillStyle = on ? '#D93025' : '#0F3B63'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n + 1), p[0], p[1] + 0.5); });
      if (state.pt) { const p = toXY(state.pt[0], state.pt[1], state.pt[2]); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0] - 8, p[1]); ctx.lineTo(p[0] + 8, p[1]); ctx.moveTo(p[0], p[1] - 8); ctx.lineTo(p[0], p[1] + 8); ctx.stroke(); ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); }
    }
    function show(sa, si, cl, picked) {
      const cls = classify(sa, si, cl), s = soils.length ? nearest(sa, si, cl) : null;
      read.innerHTML = '<b>' + esc(cls) + '</b><br>Sand ' + Math.round(sa) + ' %, silt ' + Math.round(si) + ' %, clay ' + Math.round(cl) + ' %' + (mode === 'soil' && s ? '<br><span style="color:#14558C">The SWAFL layers will use the nearest soil: <b>' + esc(s.label) + '</b></span>' : '');
      fillIns(sa, si, cl); use.disabled = false; state.pick = { sand: Math.round(sa), silt: Math.round(si), clay: Math.round(cl), cls, soil: s }; if (mode === 'soil' && s) { state.soil = s.id; markList(); }
    }
    const ins = ov.querySelectorAll('[data-in]');
    function fillIns(sa, si, cl) { [sa, si, cl].forEach((v, i) => { if (ins[i] !== document.activeElement) ins[i].value = Math.round(v * 10) / 10; }); }
    ins.forEach((el, i) => el.addEventListener('input', () => {
      const v = ins.length ? [...ins].map(q => parseFloat(q.value)) : []; if (!isFinite(v[i])) return; v[i] = Math.max(0, Math.min(100, v[i]));
      let sa = v[0], si = v[1], cl = v[2];
      if (i === 0) { if (!isFinite(cl)) cl = 0; cl = Math.min(cl, 100 - sa); si = 100 - sa - cl; }
      else if (i === 2) { if (!isFinite(sa)) sa = 0; sa = Math.min(sa, 100 - cl); si = 100 - sa - cl; }
      else { if (!isFinite(cl)) cl = 0; cl = Math.min(cl, 100 - si); sa = 100 - si - cl; }
      ins.forEach((q, j) => { if (j !== i) q.value = Math.round([sa, si, cl][j] * 10) / 10; });
      state.pt = [sa, si, cl]; show(sa, si, cl, true); draw(); }));
    function markList() { if (!list) return; list.querySelectorAll('button').forEach(b => { const on = b.dataset.id === state.soil; b.style.background = on ? '#BBD6F0' : '#fff'; b.style.fontWeight = on ? '700' : '500'; }); }
    if (list) { soils.forEach(s => { const b = document.createElement('button'); b.dataset.id = s.id; b.style.cssText = 'text-align:left;border:1px solid #B9B4A6;padding:3px 6px;cursor:pointer;font:inherit;color:#0C2238'; b.innerHTML = '<b style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;border-radius:9px;background:#0F3B63;color:#fff;font-size:10px;margin-right:6px">' + (soils.indexOf(s) + 1) + '</b>' + esc(s.label) + ' <span style="color:#35506C;font-size:11px">' + Math.round(s.sand) + ' / ' + Math.round(s.silt) + ' / ' + Math.round(s.clay) + '</span>'; b.onclick = () => { state.pt = [s.sand, s.silt, s.clay]; state.soil = s.id; show(s.sand, s.silt, s.clay); state.soil = s.id; state.pick.soil = s; markList(); draw(); }; list.appendChild(b); }); markList(); }
    const at = e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H / r.height), [sa, si, cl] = fromXY(x, y); return inside(sa / 100, si / 100, cl / 100) ? [sa, si, cl] : null; };
    cv.addEventListener('click', e => { const p = at(e); if (!p) return; state.pt = p; show(p[0], p[1], p[2]); draw(); });
    cv.addEventListener('mousemove', e => { const p = at(e); cv.title = p ? classify(p[0], p[1], p[2]) + ': sand ' + Math.round(p[0]) + ', silt ' + Math.round(p[1]) + ', clay ' + Math.round(p[2]) + ' %' : ''; });
    use.onclick = () => { const r = state.pick; close(); if (r && o.onPick) o.onPick(r); };
    if (o.point) { state.pt = [o.point.sand, o.point.silt, o.point.clay]; show(o.point.sand, o.point.silt, o.point.clay); } else if (o.current) { const s = soils.find(q => q.id === o.current); if (s) { state.pt = [s.sand, s.silt, s.clay]; show(s.sand, s.silt, s.clay); use.disabled = true; } }
    draw(); return { close };
  }
  return { open, close, classify, CLASSES };
})();
