/* Field sketch: draw the outline of the field and mark the water source; the sketch becomes the inputs of the
   irrigation designs (run length, width, area, lateral and mainline lengths), ready to run. Also the comparison of the
   three irrigation systems on the present field. */
'use strict';
const Sketch = (() => {
  let pts = [], src = null, mode = 'field', scale = 10;   // metres per grid square
  const SC = [2, 5, 10, 20, 25, 50, 100];
  const len = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function geom() {
    if (pts.length < 3) return null; let A = 0, P = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; A += a.x * b.y - b.x * a.y; P += len(a, b); }
    A = Math.abs(A) / 2; let L = 0, ang = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], d = len(a, b); if (d > L) { L = d; ang = Math.atan2(b.y - a.y, b.x - a.x); } }
    const ux = Math.cos(ang), uy = Math.sin(ang); let lo = 1e9, hi = -1e9, wlo = 1e9, whi = -1e9; pts.forEach(p => { const s = p.x * ux + p.y * uy, t = -p.x * uy + p.y * ux; lo = Math.min(lo, s); hi = Math.max(hi, s); wlo = Math.min(wlo, t); whi = Math.max(whi, t); });
    const f = scale / 30, run = (hi - lo) * f, wid = (whi - wlo) * f; let ms = 0; if (src) { ms = 1e9; pts.forEach(p => { ms = Math.min(ms, len(p, src)); }); ms *= f; }
    return { area: A * f * f, perim: P * f, run, wid, main: ms };
  }
  function draw(cv) {
    const c = cv.getContext('2d'), w = cv.width, h = cv.height; c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#E4E4E4'; c.lineWidth = 1; for (let x = 0; x <= w; x += 30) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); c.stroke(); } for (let y = 0; y <= h; y += 30) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
    c.fillStyle = '#404040'; c.font = '10px Tahoma'; c.fillText('1 square = ' + scale + ' m', 6, h - 6);
    if (pts.length) { c.fillStyle = 'rgba(46,139,87,0.18)'; c.strokeStyle = '#2E7D32'; c.lineWidth = 2; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); if (pts.length > 2) c.closePath(); c.fill(); c.stroke(); pts.forEach(p => { c.fillStyle = '#2E7D32'; c.fillRect(p.x - 3, p.y - 3, 6, 6); }); }
    const g = geom(); if (g) { pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; c.fillStyle = '#000'; c.fillText(Math.round(len(p, q) * scale / 30) + ' m', (p.x + q.x) / 2 + 4, (p.y + q.y) / 2 - 4); }); }
    if (src) { c.fillStyle = '#1F5FA8'; c.beginPath(); c.arc(src.x, src.y, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFF'; c.font = 'bold 9px Tahoma'; c.fillText('W', src.x - 4, src.y + 3); c.fillStyle = '#1F5FA8'; c.font = '10px Tahoma'; c.fillText('water source', src.x + 10, src.y + 4);
      if (pts.length) { let b = pts[0]; pts.forEach(p => { if (len(p, src) < len(b, src)) b = p; }); c.strokeStyle = '#1F5FA8'; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(src.x, src.y); c.lineTo(b.x, b.y); c.stroke(); c.setLineDash([]); } }
  }
  function info() {
    const g = geom(), el = document.getElementById('skInfo'); if (!el) return;
    el.innerHTML = g ? '<table class="tbl" style="width:100%"><tr><td>Area</td><td><b>' + (g.area / 10000).toFixed(2) + ' ha</b> (' + Math.round(g.area).toLocaleString('en-US') + ' m²)</td></tr><tr><td>Run length (longest side)</td><td><b>' + Math.round(g.run) + ' m</b></td></tr><tr><td>Width across</td><td><b>' + Math.round(g.wid) + ' m</b></td></tr><tr><td>Perimeter</td><td>' + Math.round(g.perim) + ' m</td></tr><tr><td>Mainline, source to field</td><td>' + (src ? Math.round(g.main) + ' m' : 'mark the water source') + '</td></tr></table>' : 'Click on the grid to place the corners of your field (at least three). Then mark the water source.';
  }
  function open() {
    UI.modal({ title: 'Field sketch to design', icon: 'pipe', width: 'min(860px,96vw)', html:
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><div><canvas id="skCv" width="540" height="390" style="box-shadow:inset 1px 1px #808080,inset -1px -1px #fff;cursor:crosshair;max-width:100%"></canvas>' +
      '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><div class="seg" id="skMode"><button data-m="field" class="on">Field corners</button><button data-m="src">Water source</button></div><button class="btn" id="skUndo">Undo corner</button><button class="btn" id="skClear">Clear</button>' +
      '<label>Grid square <select id="skScale">' + SC.map(v => '<option value="' + v + '"' + (v === scale ? ' selected' : '') + '>' + v + ' m</option>').join('') + '</select></label></div></div>' +
      '<div style="flex:1;min-width:240px"><div id="skInfo"></div><div class="pr" style="margin-top:8px"><label>Ground slope along the run (%)</label><input type="number" id="skSlope" value="0.3" step="0.05" min="0" max="16" style="width:100px"></div>' +
      '<div class="pr"><label>Irrigation system</label><select id="skSys"><option value="sid:border">Surface: border strips</option><option value="sid:furrow">Surface: furrows</option><option value="sid:basin">Surface: basins</option><option value="drip">Drip</option><option value="spr">Sprinklers</option></select></div>' +
      '<div class="pnote">The sketch fills the run length, width, area, lateral and mainline lengths of the design. Check the inputs, then press Run simulation in the design layer.</div></div></div>',
      buttons: [{ label: 'Turn the sketch into the design', pri: true, act: () => apply() }, { label: 'Close' }] });
    const cv = document.getElementById('skCv');
    cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height, p = { x: Math.round(x / 6) * 6, y: Math.round(y / 6) * 6 }; if (mode === 'src') src = p; else pts.push(p); draw(cv); info(); });
    document.getElementById('skMode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; document.querySelectorAll('#skMode button').forEach(x => x.classList.toggle('on', x === b)); });
    document.getElementById('skUndo').onclick = () => { pts.pop(); draw(cv); info(); };
    document.getElementById('skClear').onclick = () => { pts = []; src = null; draw(cv); info(); };
    document.getElementById('skScale').onchange = e => { scale = +e.target.value; draw(cv); info(); };
    draw(cv); info();
  }
  function apply() {
    const g = geom(); if (!g) { UI.toast('Draw the field first (at least three corners)'); return false; }
    const sys = document.getElementById('skSys').value, slope = parseFloat(document.getElementById('skSlope').value) || 0.3, ha = Math.max(0.1, g.area / 10000);
    const [id, sub] = sys.split(':');
    const js = id === 'sid' ? "(function(){sidSys('" + sub + "');var d=SIDDEF[SID.sys];SID.L=Math.max(d.Lr[0],Math.min(d.Lr[1]," + Math.round(g.run) + "));SID.Wf=Math.max(30,Math.min(400," + Math.round(g.wid) + "));SID.S=Math.max(d.Sr[0],Math.min(d.Sr[1]," + slope + "));SID.preset=null;SID.autoQ=true;applyState({method:'M02_Surface'});})()"
      : id === 'drip' ? "(function(){DRP.LL=Math.max(20,Math.min(300," + Math.round(Math.min(g.wid, g.run)) + "));DRP.Af=Math.max(0.2,Math.min(10," + ha.toFixed(2) + "));IRX.Lm=Math.max(20,Math.min(600," + Math.round(g.main || 120) + "));if(state.method.indexOf('Drip')<0)applyState({method:'M04_Drip10-20cm'});})()"
      : "(function(){SPR.Af=Math.max(0.5,Math.min(40," + ha.toFixed(2) + "));SPR.S=Math.max(0,Math.min(16," + slope + "));IRX.LLs=Math.max(40,Math.min(500," + Math.round(Math.min(g.wid, g.run)) + "));IRX.Lm=Math.max(20,Math.min(600," + Math.round(g.main || 120) + "));applyState({method:'M01_Overhead'});})()";
    E.ev(js); E.ev("window.DESIGN_RUN&&(DESIGN_RUN['" + id + "'].on=false,DESIGN_RUN['" + id + "'].why='field sketch applied')");
    UI.log('Field sketch applied to ' + Layers.nameOf(id) + ': ' + ha.toFixed(2) + ' ha, run ' + Math.round(g.run) + ' m, width ' + Math.round(g.wid) + ' m');
    Layers.open(id); UI.toast('Sketch applied: check the inputs and press Run simulation'); return true;
  }
  // the three systems side by side on the present field and soil
  function compare() {
    const R = E.json("(function(){var a=sidRun(),b=drRun(),c=spRun();return [['Surface (' + SID.sys + ')',a.Ea,a.Es,a.dp,a.ro,a.tco/60],['Drip',b.Ea,b.Es,b.dp,b.ev||0,b.t],['Sprinkler',c.Ea,c.Es,c.dp,c.ro,c.T/60]]})()");
    if (!R) { UI.toast('The designs are not ready yet'); return; }
    const p = v => (v * 100).toFixed(1) + ' %';
    UI.modal({ title: 'Irrigation systems compared on this field', icon: 'chart', width: 'min(640px,94vw)', html: '<table class="tbl" style="width:100%"><tr><th>System</th><th>Application efficiency</th><th>Root zone filled</th><th>Deep percolation</th><th>Runoff / evaporation</th><th>Time per irrigation</th></tr>' +
      R.map(r => '<tr><td>' + UI.esc(r[0]) + '</td><td><b>' + p(r[1]) + '</b></td><td>' + p(r[2]) + '</td><td>' + p(r[3]) + '</td><td>' + p(r[4]) + '</td><td>' + r[5].toFixed(1) + ' h</td></tr>').join('') + '</table><p class="pnote">Each system with the inputs it has now in its design layer, on the same soil, crop and trigger. Open a design layer to change them and run it.</p>' });
  }
  return { open, compare };
})();
