/* Weather dialogs of the workbench: import a daily weather file, or get the daily weather of a location online.
   The engine does the reading and the runs (engine/weather.js); every layer and the dashboard follow the new weather. */
'use strict';
const WxUI = (() => {
  const st = () => { try { return E.json('wxStatus()') || {}; } catch (e) { return {}; } };
  const fmt = v => (v == null || !isFinite(v)) ? '-' : Math.round(v).toLocaleString('en-US');
  // monthly rain, reference ET and temperature of the weather in use, drawn from the daily data the engine runs on
  function drawClim(id) {
    const cv = document.getElementById(id); if (!cv) return; const W0 = E.win && E.win.WXD, c = cv.getContext('2d'), w = cv.width, h = cv.height;
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], dm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let P = new Array(12).fill(0), Ev = new Array(12).fill(0), T = null, src = 'Benchmark record of the software';
    if (W0 && W0.on && W0.P) { const ny = W0.P.length / 365; for (let y = 0; y < ny; y++) { let k = y * 365; for (let m = 0; m < 12; m++) for (let d = 0; d < dm[m]; d++, k++) { P[m] += W0.P[k] / ny; Ev[m] += W0.ET0[k] / ny; } } src = (W0.name || 'Weather in use') + ' (' + (W0.src === 'file' ? 'imported file' : 'online') + ')';
      const tc = W0.Tclim; if (tc && tc.length >= 365) { T = new Array(12).fill(NaN); let k = 0; for (let m = 0; m < 12; m++) { let s = 0, n = 0; for (let d = 0; d < dm[m]; d++, k++) if (isFinite(tc[k])) { s += tc[k]; n++; } if (n) T[m] = s / n; } } }
    else { try { const wx = E.json('(function(){var r=[],e=[];var sim=seasonSim();for(var m=0;m<12;m++){r.push(0);e.push(0)}var ny=Math.floor(sim.rain.length/365);for(var y=0;y<ny;y++){var k=y*365;for(var m=0;m<12;m++){var dm=[31,28,31,30,31,30,31,31,30,31,30,31][m];for(var d=0;d<dm;d++,k++){r[m]+=sim.rain[k]/ny;e[m]+=(sim.dE?sim.dE[k]+sim.dT[k]:0)/ny}}}return {r:r,e:e}})()'); if (wx) { P = wx.r; Ev = wx.e; } } catch (e) {} }
    const L = 54, R = w - 46, Tp = 34, B = h - 34, mx = Math.max(10, ...P, ...Ev) * 1.1, X = m => L + (m + 0.5) / 12 * (R - L), Y = v => B - v / mx * (B - Tp), bw = (R - L) / 12 * 0.32;
    c.font = 'bold 12px sans-serif'; c.fillStyle = '#12303A'; c.fillText('Monthly climate of the weather in use: ' + src, 10, 18);
    c.strokeStyle = '#C9D1D9'; c.fillStyle = '#556'; c.font = '10px sans-serif'; for (let i = 0; i <= 4; i++) { const v = mx / 1.1 * i / 4, yy = Y(v); c.beginPath(); c.moveTo(L, yy); c.lineTo(R, yy); c.stroke(); c.textAlign = 'right'; c.fillText(Math.round(v), L - 4, yy + 3); }
    c.textAlign = 'center'; for (let m = 0; m < 12; m++) { c.fillStyle = '#29B6F6'; c.fillRect(X(m) - bw - 1, Y(P[m]), bw, B - Y(P[m])); c.fillStyle = '#FB8C00'; c.fillRect(X(m) + 1, Y(Ev[m]), bw, B - Y(Ev[m])); c.fillStyle = '#556'; c.fillText(MO[m], X(m), B + 14); }
    if (T) { const tmx = Math.max(...T.filter(isFinite), 10) * 1.1, tmn = Math.min(0, ...T.filter(isFinite)), Yt = v => B - (v - tmn) / (tmx - tmn) * (B - Tp); c.strokeStyle = '#C62828'; c.lineWidth = 2; c.beginPath(); T.forEach((v, m) => { if (!isFinite(v)) return; m ? c.lineTo(X(m), Yt(v)) : c.moveTo(X(m), Yt(v)); }); c.stroke(); c.lineWidth = 1; c.fillStyle = '#C62828'; c.textAlign = 'left'; c.fillText('temperature \u00b0C: ' + Math.round(Math.min(...T.filter(isFinite))) + ' to ' + Math.round(Math.max(...T.filter(isFinite))), R - 150, Tp - 4); }
    c.textAlign = 'left'; c.fillStyle = '#29B6F6'; c.fillRect(L, h - 12, 10, 8); c.fillStyle = '#12303A'; c.fillText('rain (mm/month)', L + 14, h - 4); c.fillStyle = '#FB8C00'; c.fillRect(L + 120, h - 12, 10, 8); c.fillStyle = '#12303A'; c.fillText('reference ET (mm/month)', L + 134, h - 4);
  }
  function climate() { UI.modal({ title: 'Climate of the weather in use', icon: 'info', width: 'min(640px,94vw)', html: '<canvas id="wxClim" width="600" height="250" style="max-width:100%"></canvas><p class="pnote">The irrigation dates, the crop water need, the soil water, the dashboard and every layer are calculated from this weather. Change it in Properties, Scenario, Weather source.</p>' }); setTimeout(() => drawClim('wxClim'), 30); }
  function report(s, title) {
    const notes = (s.notes || []).map(n => '<li>' + UI.esc(n) + '</li>').join('');
    UI.modal({ title, icon: 'info', width: 'min(600px,94vw)', html:
      '<p><b>' + UI.esc(s.name) + '</b> is now the weather of every layer, the crop water requirement and the dashboard.</p>' +
      '<table class="tbl" style="width:100%"><tr><td>Years used</td><td><b>' + UI.esc(s.years) + '</b></td></tr>' +
      (s.first ? '<tr><td>Data in the file</td><td>' + s.first + ' to ' + s.last + ' (' + fmt(s.days) + ' days)</td></tr>' : '') +
      (s.hist != null ? '<tr><td>Days of measured history</td><td>' + fmt(s.hist) + (s.forecast ? ', plus a ' + s.forecast + '-day forecast' : '') + '</td></tr>' : '') +
      '<tr><td>Mean annual rainfall</td><td><b>' + fmt(s.Pmean) + ' mm</b></td></tr><tr><td>Mean annual reference ET</td><td><b>' + fmt(s.ET0mean) + ' mm</b> (' + UI.esc(s.how || '') + ')</td></tr>' +
      '<tr><td>Annual model set to</td><td>rainfall ×' + (+s.rain).toFixed(1) + ', temperature ' + (s.dT >= 0 ? '+' : '') + (+s.dT).toFixed(1) + ' °C</td></tr>' +
      (s.cols ? '<tr><td>Columns read</td><td>' + UI.esc(s.cols.join(', ')) + '</td></tr>' : '') + '</table>' + (notes ? '<p style="margin-top:8px"><b>Notes</b></p><ul>' + notes + '</ul>' : '') +
      '<canvas id="wxClimR" width="560" height="240" style="max-width:100%"></canvas><p>Switch back at any time in Properties, Scenario, <b>Weather source</b>.</p>' }); setTimeout(() => drawClim('wxClimR'), 30);
  }
  function importFile() {
    const r = UI.modal({ title: 'Import weather data', icon: 'open', width: 'min(620px,94vw)', html:
      '<p>Import daily weather to run the whole program on your own climate. Accepted: <b>CSV or TXT</b> (comma, semicolon, tab or space separated), <b>Excel (XLSX, XLS)</b>, <b>DWF</b> weather files and <b>DLF</b> daily logs (a <b>DAI</b> setup names its weather file: import that file).</p>' +
      '<p>Columns: a date (or year, month and day), daily <b>rainfall</b> in mm, and if possible daily <b>reference evapotranspiration</b> (ET0) in mm. Without ET0 it is computed from the daily maximum and minimum temperature (Hargreaves) or from mean temperature and radiation (Makkink).</p>' +
      '<div class="pr"><label>Weather file</label><input type="file" id="wxFile" accept=".csv,.txt,.xlsx,.xls,.ods,.dwf,.dlf,.dai,.dat"></div>' +
      '<div class="pr"><label>Latitude of the station (°, north positive), used only to compute ET0 from temperature</label><input type="number" id="wxLat" value="45" step="0.1" min="-66" max="66" style="width:120px"></div>' +
      '<div id="wxMsg" class="pnote"></div>',
      buttons: [{ label: 'Import', pri: true, act: () => { go(); return false; } }, { label: 'Cancel' }] });
    const go = () => {
      const f = document.getElementById('wxFile').files[0], msg = document.getElementById('wxMsg'), lat = parseFloat(document.getElementById('wxLat').value);
      if (!f) { msg.textContent = 'Choose a file first.'; return; }
      msg.textContent = 'Reading ' + f.name + ' and running the program on it...';
      const rd = new FileReader(); rd.onload = async () => {
        try { const s = await E.win.wxImport(f.name, rd.result, lat); UI.log('Weather imported: ' + f.name + ' (' + s.years + ', ' + Math.round(s.Pmean) + ' mm rain a year)'); E.poll(true); Props.build(); Props.update(E.snap); Dash.render(); report(s, 'Weather imported'); }
        catch (e) { msg.innerHTML = '<b style="color:#A00000">Could not read this file:</b> ' + UI.esc(e.message) + '. The current weather stays in use.'; UI.log('Weather import failed: ' + e.message, 'warn'); }
      };
      rd.readAsArrayBuffer(f);
    };
    return r;
  }
  function online() {
    UI.modal({ title: 'Online weather for a location', icon: 'search', width: 'min(620px,94vw)', html:
      '<p>Get the measured daily weather of your location for the last twenty years and the forecast for the next sixteen days. The program then runs on that weather; the next days on the dashboard follow the forecast.</p>' +
      '<div class="pr"><label>Place (town, village or district)</label><div style="display:flex;gap:6px"><input type="text" id="wxPlace" placeholder="for example: Kano, Nigeria" style="flex:1"><button class="btn" id="wxFind">Find</button></div></div>' +
      '<div class="pr"><label>Or the coordinates (latitude, longitude)</label><div style="display:flex;gap:6px"><input type="number" id="wxLatO" step="0.0001" placeholder="latitude" style="width:130px"><input type="number" id="wxLonO" step="0.0001" placeholder="longitude" style="width:130px"></div></div>' +
      '<div id="wxList"></div><div id="wxMsgO" class="pnote"></div>',
      buttons: [{ label: 'Get the weather', pri: true, act: () => { fetchIt(); return false; } }, { label: 'Cancel' }] });
    const msg = () => document.getElementById('wxMsgO');
    document.getElementById('wxFind').onclick = async () => {
      const q = document.getElementById('wxPlace').value.trim(); if (!q) return; msg().textContent = 'Searching...';
      try { const L = await E.win.wxGeocode(q); if (!L.length) { msg().textContent = 'No place found with that name.'; return; }
        document.getElementById('wxList').innerHTML = '<div class="pr"><label>Choose the place</label><select id="wxPick" size="' + Math.min(6, L.length) + '" style="width:100%">' + L.map((p, i) => '<option value="' + i + '"' + (i ? '' : ' selected') + '>' + UI.esc(p.name) + ' (' + p.lat.toFixed(2) + ', ' + p.lon.toFixed(2) + ')</option>').join('') + '</select></div>';
        const pick = () => { const p = L[+document.getElementById('wxPick').value]; document.getElementById('wxLatO').value = p.lat; document.getElementById('wxLonO').value = p.lon; document.getElementById('wxPlace').dataset.label = p.name; };
        document.getElementById('wxPick').onchange = pick; pick(); msg().textContent = '';
      } catch (e) { msg().textContent = 'The place search is not reachable now (' + e.message + '). Type the coordinates instead.'; }
    };
    const fetchIt = async () => {
      const lat = parseFloat(document.getElementById('wxLatO').value), lon = parseFloat(document.getElementById('wxLonO').value);
      if (!isFinite(lat) || !isFinite(lon)) { msg().textContent = 'Find a place or type its latitude and longitude.'; return; }
      msg().textContent = 'Getting twenty years of daily weather and the forecast...';
      try { const s = await E.win.wxOnline(lat, lon, document.getElementById('wxPlace').dataset.label || ''); window.__WXLOC = { lat, lon, name: document.getElementById('wxPlace').dataset.label || '' }; UI.log('Online weather in use: ' + s.name + ' (' + s.years + ')'); E.poll(true); Props.build(); Props.update(E.snap); Dash.render(); report(s, 'Online weather in use'); }
      catch (e) { msg().innerHTML = '<b>The online weather could not be reached</b> (' + UI.esc(e.message) + '). The current weather stays in use.'; UI.log('Online weather not reachable: the current weather stays in use', 'warn'); }
    };
  }
  function use(which) { const ok = E.ev("wxUse('" + which + "')"); E.poll(true); Dash.render(); UI.log(which === 'record' ? 'Weather: the recorded weather of the simulations' : which === 'file' ? 'Weather: the imported file' : 'Weather: online weather'); return ok; }
  // the first time the File menu opens, the user is offered to bring in weather data
  let asked = false;
  function offerOnce() {
    if (asked || (st().src && st().src !== 'record')) return; asked = true;
    setTimeout(() => UI.modal({ title: 'Weather data', icon: 'info', width: 'min(560px,94vw)', html: '<p>For the best results, run the program on the weather of your own field: import a daily weather file (CSV, Excel, DWF or DLF), or get the daily weather of your location online.</p><p>Without it the program uses the recorded weather of the simulations.</p>',
      buttons: [{ label: 'Import a weather file...', pri: true, act: () => { setTimeout(importFile, 30); } }, { label: 'Online weather...', act: () => { setTimeout(online, 30); } }, { label: 'Use the current weather' }] }), 120);
  }
  return { importFile, online, use, status: st, offerOnce, climate };
})();
window.WxUI = WxUI;
