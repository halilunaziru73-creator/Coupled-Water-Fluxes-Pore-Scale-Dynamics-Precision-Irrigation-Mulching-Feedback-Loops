/* Weather dialogs of the workbench: import a daily weather file, or get the daily weather of a location online.
   The engine does the reading and the runs (engine/weather.js); every layer and the dashboard follow the new weather. */
'use strict';
const WxUI = (() => {
  const st = () => { try { return E.json('wxStatus()') || {}; } catch (e) { return {}; } };
  const fmt = v => (v == null || !isFinite(v)) ? '-' : Math.round(v).toLocaleString('en-US');
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
      '<p>Switch back at any time in Properties, Scenario, <b>Weather source</b>.</p>' });
  }
  function importFile() {
    const r = UI.modal({ title: 'Import weather data', icon: 'open', width: 'min(620px,94vw)', html:
      '<p>Import daily weather to run the whole program on your own climate. Accepted: <b>CSV or TXT</b> (comma, semicolon, tab or space separated), <b>Excel (XLSX, XLS)</b>, Daisy <b>DWF</b> weather files and Daisy <b>DLF</b> daily logs (a Daisy <b>DAI</b> setup names its weather file: import that file).</p>' +
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
      try { const s = await E.win.wxOnline(lat, lon, document.getElementById('wxPlace').dataset.label || ''); UI.log('Online weather in use: ' + s.name + ' (' + s.years + ')'); E.poll(true); Props.build(); Props.update(E.snap); Dash.render(); report(s, 'Online weather in use'); }
      catch (e) { msg().innerHTML = '<b>The online weather could not be reached</b> (' + UI.esc(e.message) + '). The current weather stays in use.'; UI.log('Online weather not reachable: the current weather stays in use', 'warn'); }
    };
  }
  function use(which) { const ok = E.ev("wxUse('" + which + "')"); E.poll(true); Dash.render(); UI.log(which === 'record' ? 'Weather: the recorded weather of the simulations' : which === 'file' ? 'Weather: the imported file' : 'Weather: online weather'); return ok; }
  // the first time the File menu opens, the user is offered to bring in weather data
  let asked = false;
  function offerOnce() {
    if (asked || (st().src && st().src !== 'record')) return; asked = true;
    setTimeout(() => UI.modal({ title: 'Weather data', icon: 'info', width: 'min(560px,94vw)', html: '<p>For the best results, run the program on the weather of your own field: import a daily weather file (CSV, Excel, Daisy DWF or DLF), or get the daily weather of your location online.</p><p>Without it the program uses the recorded weather of the simulations.</p>',
      buttons: [{ label: 'Import a weather file...', pri: true, act: () => { setTimeout(importFile, 30); } }, { label: 'Online weather...', act: () => { setTimeout(online, 30); } }, { label: 'Use the current weather' }] }), 120);
  }
  return { importFile, online, use, status: st, offerOnce };
})();
