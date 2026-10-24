/* Field on the map: find the farm (place search, coordinates, satellite imagery, Google Earth), demarcate the field on the
   satellite image (hand to pan, zoom in and out, click the corners, drag them), then compute the vegetation and water
   indices of the demarcated field (NDVI, EVI, SAVI, NDRE, NDWI) from open Sentinel-2 L2A data (Element 84 Earth Search,
   Copernicus open data) or, offline, simulated from SWAFL's daily model (vegetation cover and soil water of the working
   date). The field becomes the sketch of the design; the analysis exports as a report (PDF or PNG at a chosen DPI, with the
   coordinates and the authorship), as GeoJSON and as CSV. */
'use strict';
const FieldMap = (() => {
  const F = { map: null, pts: [], mk: [], poly: null, line: null, mode: 'draw', ov: null, res: null, idx: 'NDVI', src: 'auto', cv: null, site: null, srcLay: null, days: 90, cloud: 30,
    author: '', org: '', title: 'Field report', dpi: 300, fmt: 'pdf', base: 'sat', place: '', view: 'cont', smooth: true, cmp: '', lay: true, map2: null, ov2: null, layG: null, layG2: null, leg: null, leg2: null };
  const R = 6378137, rad = Math.PI / 180;
  const IDX = {
    NDVI: { name: 'Normalized Difference Vegetation Index', bands: 'Red, NIR', use: 'Drought tracking, baseline crop health', ramp: 'veg', lo: -0.1, hi: 0.9,
      read: v => v < 0.2 ? 'bare soil or very sparse crop' : v < 0.4 ? 'sparse or stressed vegetation' : v < 0.6 ? 'moderate vegetation' : 'dense, healthy vegetation' },
    EVI: { name: 'Enhanced Vegetation Index', bands: 'Blue, Red, NIR', use: 'Resists saturation in thick canopies (dense crops, forests)', ramp: 'veg', lo: -0.1, hi: 0.8,
      read: v => v < 0.2 ? 'low green biomass' : v < 0.4 ? 'moderate green biomass' : 'high green biomass' },
    SAVI: { name: 'Soil-Adjusted Vegetation Index (L = 0.5)', bands: 'Red, NIR + soil factor L', use: 'Nullifies the soil background (dry land, early crop emergence)', ramp: 'veg', lo: -0.1, hi: 0.8,
      read: v => v < 0.15 ? 'bare soil' : v < 0.3 ? 'emerging or sparse crop' : v < 0.5 ? 'moderate cover' : 'full cover' },
    NDRE: { name: 'Normalized Difference Red Edge', bands: 'Red Edge, NIR', use: 'Deep canopy penetration; nitrogen management, precision farming', ramp: 'veg', lo: -0.1, hi: 0.6,
      read: v => v < 0.15 ? 'little chlorophyll: bare soil or nitrogen deficiency' : v < 0.3 ? 'moderate chlorophyll: check nitrogen' : 'high chlorophyll: nitrogen sufficient' },
    NDWI: { name: 'Normalized Difference Water Index (Gao), also called NDMI', bands: 'NIR, SWIR', use: 'True internal moisture content; crop water stress, fire risk', ramp: 'wat', lo: -0.4, hi: 0.5,
      read: v => v < -0.1 ? 'dry canopy or soil: water stress likely' : v < 0.15 ? 'moderate water content' : 'well-watered canopy' },
    VARI: { name: 'Visible Atmospherically Resistant Index (Gitelson et al., 2002)', bands: 'Red, Green, Blue of the photo', use: 'Crop cover and vigour from an ordinary colour photo', ramp: 'veg', lo: -0.3, hi: 0.5,
      read: v => v < 0 ? 'bare soil, dry or dead plants' : v < 0.12 ? 'sparse or stressed vegetation' : v < 0.25 ? 'moderate green cover' : 'dense green vegetation' },
    GLI: { name: 'Green Leaf Index (Louhaichi et al., 2001)', bands: 'Red, Green, Blue of the photo', use: 'Green leaves against soil and residue', ramp: 'veg', lo: -0.1, hi: 0.35,
      read: v => v < 0.02 ? 'no green leaves' : v < 0.08 ? 'few green leaves' : v < 0.16 ? 'moderate green cover' : 'dense green cover' },
    ExG: { name: 'Excess Green 2g − r − b (Woebbecke et al., 1995)', bands: 'chromatic Red, Green, Blue of the photo', use: 'Separates plants from soil (computer vision of crops)', ramp: 'veg', lo: -0.1, hi: 0.4,
      read: v => v < 0.03 ? 'soil or residue' : v < 0.1 ? 'mixed soil and plants' : 'plants' },
    NGRDI: { name: 'Normalized Green Red Difference Index (Tucker, 1979)', bands: 'Red, Green of the photo', use: 'Green biomass from a colour photo', ramp: 'veg', lo: -0.2, hi: 0.3,
      read: v => v < 0 ? 'bare soil or dry vegetation' : v < 0.08 ? 'sparse green biomass' : 'green biomass' }
  };
  const KEYS = ['NDVI', 'EVI', 'SAVI', 'NDRE', 'NDWI'], RGBK = ['VARI', 'GLI', 'ExG', 'NGRDI'], RK = () => (F.res && F.res.keys) || KEYS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f2 = v => (v == null || !isFinite(v)) ? '-' : (+v).toFixed(3);

  // ------------------------------------------------------------------ geodesy (WGS 84)
  function areaM2(ll) { if (ll.length < 3) return 0; let a = 0; for (let i = 0; i < ll.length; i++) { const p = ll[i], q = ll[(i + 1) % ll.length]; a += (q[1] - p[1]) * rad * (2 + Math.sin(p[0] * rad) + Math.sin(q[0] * rad)); } return Math.abs(a * R * R / 2); }
  function dist(p, q) { const dl = (q[0] - p[0]) * rad, dn = (q[1] - p[1]) * rad, a = Math.sin(dl / 2) ** 2 + Math.cos(p[0] * rad) * Math.cos(q[0] * rad) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(a)); }
  function perim(ll) { let s = 0; for (let i = 0; i < ll.length; i++) s += dist(ll[i], ll[(i + 1) % ll.length]); return s; }
  function centroid(ll) { let a = 0, x = 0, y = 0; const o = ll[0]; for (let i = 0; i < ll.length; i++) { const p = ll[i], q = ll[(i + 1) % ll.length], c = (p[1] - o[1]) * (q[0] - o[0]) - (q[1] - o[1]) * (p[0] - o[0]); a += c; x += (p[1] + q[1] - 2 * o[1]) * c; y += (p[0] + q[0] - 2 * o[0]) * c; } return a ? [o[0] + y / (3 * a), o[1] + x / (3 * a)] : ll[0]; }
  const local = (p, o) => [(p[1] - o[1]) * rad * R * Math.cos(o[0] * rad), (p[0] - o[0]) * rad * R];          // metres east, north
  const unlocal = (xy, o) => [o[0] + xy[1] / R / rad, o[1] + xy[0] / (R * Math.cos(o[0] * rad)) / rad];
  function inside(lat, lon, ll) { let c = false; for (let i = 0, j = ll.length - 1; i < ll.length; j = i++) { const a = ll[i], b = ll[j]; if ((a[0] > lat) !== (b[0] > lat) && lon < (b[1] - a[1]) * (lat - a[0]) / (b[0] - a[0]) + a[1]) c = !c; } return c; }
  function toUTM(lat, lon, zone, south) {
    const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2), l0 = ((zone - 1) * 6 - 180 + 3) * rad, p = lat * rad, l = lon * rad;
    const N = a / Math.sqrt(1 - e2 * Math.sin(p) ** 2), T = Math.tan(p) ** 2, C = ep2 * Math.cos(p) ** 2, A = Math.cos(p) * (l - l0);
    const M = a * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256) * p - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * p) + (15 * e2 * e2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * p) - (35 * e2 ** 3 / 3072) * Math.sin(6 * p));
    const x = k0 * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5 / 120) + 500000;
    let y = k0 * (M + N * Math.tan(p) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A ** 4 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6 / 720)); if (south) y += 10000000; return [x, y];
  }
  const dms = (v, pos, neg) => { const s = v < 0 ? neg : pos, a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), sec = ((a - d) * 60 - m) * 60; return d + '°' + String(m).padStart(2, '0') + '′' + sec.toFixed(1).padStart(4, '0') + '″' + s; };

  // ------------------------------------------------------------------ the window
  function open() {
    if (typeof L === 'undefined') { UI.toast('The map library did not load'); return; }
    UI.modal({ title: 'Field on the map: locate, demarcate, vegetation and water indices', icon: 'field', width: 'min(1240px,98vw)', html:
      '<div class="fmwrap"><div class="fmleft"><div class="fmbar">' +
      '<input id="fmQ" placeholder="Search a place (village, town, district)" style="flex:1;min-width:160px"><button class="btn" id="fmGo">Find</button>' +
      '<label>Lat <input id="fmLat" type="number" step="any" style="width:86px"></label><label>Lon <input id="fmLon" type="number" step="any" style="width:86px"></label><button class="btn" id="fmLL">Go</button></div>' +
      '<div class="fmbar"><div class="seg" id="fmMode"><button data-m="pan">&#9995; Hand (move)</button><button data-m="draw" class="on">&#9998; Demarcate</button></div>' +
      '<button class="btn" id="fmZin" title="Zoom in">&#43;</button><button class="btn" id="fmZout" title="Zoom out">&minus;</button><button class="btn" id="fmFit">Fit the field</button>' +
      '<button class="btn" id="fmUndo">Undo point</button><button class="btn" id="fmClear">Clear</button><button class="btn" id="fmSketch">Place my sketch here</button>' +
      '<select id="fmBase"><option value="sat">Satellite (Esri World Imagery)</option><option value="hyb">Satellite with roads and names</option><option value="osm">Map (OpenStreetMap)</option></select><button class="btn" id="fmGE">Open in Google Earth</button>' +
      '<label title="Draw the furrows, laterals or sprinklers, the submain and the mainline of the field sketch on the map"><input type="checkbox" id="fmLay"' + (F.lay ? ' checked' : '') + '> Irrigation layout</label></div>' +
      '<div class="fmsteps" id="fmSteps"></div>' +
      '<div class="fmmaps" id="fmMaps"><div id="fmMap" class="fmmap"></div><div id="fmMap2" class="fmmap" style="display:none"></div></div><div id="fmInfo" class="fminfo"></div></div>' +
      '<div class="fmright"><h4>1. The demarcated field</h4><div id="fmField" class="pnote">Click the corners of the field on the map (Demarcate). Drag a corner to move it. Use the hand to move the map, + and − or the mouse wheel to zoom.</div>' +
      '<h4>2. Vegetation and water indices</h4><div class="pr"><label>Data</label><select id="fmSrc"><option value="auto">Real data, automatic: Sentinel-2 indices and the photo of the field</option><option value="s2">Sentinel-2 L2A satellite only (NDVI, EVI, SAVI, NDRE, NDWI)</option><option value="rgb">Satellite photo only: image analysis (land cover, VARI, GLI, ExG, NGRDI)</option><option value="sim">Simulated by SWAFL (no internet)</option></select></div>' +
      '<div class="pr" id="fmWhenR"><label>Simulated date</label><select id="fmWhen"><option value="now">The working date of the project</option><option value="peak">The peak of the crop (most cover in the last 12 months)</option></select></div>' +
      '<div class="fmrow" id="fmS2R"><label>Look back <input id="fmDays" type="number" value="' + F.days + '" min="5" max="730" style="width:60px"> days</label><label>Clouds below <input id="fmCloud" type="number" value="' + F.cloud + '" min="1" max="100" style="width:50px"> %</label></div>' +
      '<button class="btn pri" id="fmRun">Compute the indices of the field</button><div id="fmStat" class="pnote"></div>' +
      '<div class="fmrow" id="fmViewR" style="display:none"><label>Show on the map <select id="fmView"><option value="cont">Continuous colours</option><option value="zones">Management zones (5 classes)</option><option value="cover">Land cover read from the photo</option><option value="mzone">Monitoring zones (season)</option><option value="mchange">NDVI change since the previous scene</option><option value="mtrend">NDVI trend of the last scenes</option><option value="mstab">Stability over the season</option><option value="vri">Variable-rate irrigation: depth</option><option value="vridate">Variable-rate irrigation: date</option><option value="gully">Ephemeral gully risk</option><option value="rusle">Soil loss (RUSLE)</option></select></label>' +
      '<label>Rendering <select id="fmSmooth"><option value="1">Smooth</option><option value="0">Pixels (as measured)</option></select></label>' +
      '<label>Compare with <select id="fmCmp"><option value="">nothing (one map)</option>' + KEYS.map(k => '<option value="' + k + '">' + k + ' side by side</option>').join('') + '</select></label></div><div id="fmRes"></div>' +
      '<h4>3. The site: soil, slope, water sources and the irrigation system</h4><button class="btn pri" id="fmSite">Analyse the site (real open data)</button><div id="fmSiteSt" class="pnote">Reads the water features around the field (OpenStreetMap), water seen in the photo, the ground elevation (Copernicus DEM) and the soil (SoilGrids), then suggests where to take the water from and which irrigation system suits the field.</div><div id="fmSiteRes"></div>' +
      '<h4>4. The season and the precision maps</h4><div class="fmrow"><button class="btn pri" id="fmMon" title="The Sentinel-2 scenes of the last twelve months over the field: NDVI and NDMI of every date, changes, trend, stability and monitoring zones">Read the season (Sentinel-2, 12 months)</button></div><div id="fmMonRes"></div><div class="fmrow"><button class="btn pri" id="fmVRI" title="Irrigation depth of every part of the field, from the satellite indices and the SWAFL simulation">Variable-rate irrigation, zone by zone</button><button class="btn pri" id="fmEro" title="Terrain, ephemeral gullies (topographic threshold and the photo) and soil loss (RUSLE)">Ephemeral gullies and soil loss</button></div><div id="fmPrecSt" class="pnote">Read the season first: the monitoring zones and their observed cover drive the variable-rate irrigation (simulated zone by zone with the SWAFL model and the weather in use) and the cover of the soil-loss map. The erosion maps read the terrain from open elevation tiles and the rain of the weather in use.</div><div id="fmPrecRes"></div>' +
      '<h4>5. Use and export</h4><div class="fmrow"><button class="btn" id="fmUse">Use this field in the sketch and the designs</button><button class="btn" id="fmWx" title="Download the daily weather of this field (Open-Meteo) and run the program on it">Online weather of this field</button></div>' +
      '<div class="fmrow"><label>Title <input id="fmTitle" value="' + esc(F.title) + '" style="width:100%"></label></div>' +
      '<div class="fmrow"><label>Author <input id="fmAuthor" value="' + esc(F.author) + '" style="width:100%"></label><label>Organisation <input id="fmOrg" value="' + esc(F.org) + '" style="width:100%"></label></div>' +
      '<div class="fmrow"><label>Resolution <select id="fmDpi">' + [96, 150, 300, 600].map(d => '<option' + (d === F.dpi ? ' selected' : '') + ' value="' + d + '">' + d + ' dpi</option>').join('') + '</select></label><label>Format <select id="fmFmt"><option value="pdf">PDF (A4)</option><option value="png">PNG image (A4)</option></select></label></div>' +
      '<div class="fmrow"><button class="btn pri" id="fmRep">Export the report</button><button class="btn" id="fmGJ">GeoJSON</button><button class="btn" id="fmCSV">CSV</button></div>' +
      '<div class="pnote">Coordinates in WGS 84 (EPSG:4326). Imagery © Esri, Maxar, Earthstar Geographics; map © OpenStreetMap contributors; satellite indices contain modified Copernicus Sentinel data.</div></div></div>',
      buttons: [{ label: 'Back to the field sketch', pri: true, act: () => { setTimeout(() => Sketch.open(), 0); } }, { label: 'Close' }] });
    setTimeout(initMap, 30);
  }
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  function baseLayers(k) { const o = { maxZoom: 20, maxNativeZoom: 19, crossOrigin: 'anonymous' };
    if (k === 'osm') return [L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', Object.assign({ attribution: '© OpenStreetMap contributors' }, o))];
    const a = [L.tileLayer(ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', Object.assign({ attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' }, o))];
    if (k === 'hyb') a.push(L.tileLayer(ESRI + 'Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', Object.assign({ opacity: 0.9 }, o)));
    a.push(L.tileLayer(ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', Object.assign({ opacity: 0.85 }, o))); return a; }
  function setBase(k) { F.base = k; [F.map, F.map2].forEach(mp => { if (!mp) return; (mp.__base || []).forEach(l => mp.removeLayer(l)); mp.__base = baseLayers(k); mp.__base.forEach(l => { l.addTo(mp); l.bringToBack(); }); }); }
  function initMap() {
    const el = document.getElementById('fmMap'); if (!el) return;
    if (F.map) { try { F.map.remove(); } catch (e) {} F.map = null; }
    let c0 = F.pts.length ? centroid(F.pts) : null; if (!c0 && window.__WXLOC) { c0 = [window.__WXLOC.lat, window.__WXLOC.lon]; if (!F.place) F.place = window.__WXLOC.name || ''; }
    F.map = L.map(el, { zoomControl: false, attributionControl: true, preferCanvas: false }).setView(c0 || [9.08, 7.4], c0 ? 16 : 6);
    F.map2 = null; setBase(F.base); F.leg = legendCtl(F.map); F.map.on('click', e => { if (F.mode !== 'draw') return; F.pts.push([e.latlng.lat, e.latlng.lng]); changed(); });
    F.map.on('mousemove', e => cursorInfo(e.latlng)); F.map.on('zoomend', () => drawLayout());
    const $ = id => document.getElementById(id);
    $('fmMode').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; F.mode = b.dataset.m; document.querySelectorAll('#fmMode button').forEach(x => x.classList.toggle('on', x === b)); el.style.cursor = F.mode === 'pan' ? 'grab' : 'crosshair'; });
    el.style.cursor = F.mode === 'pan' ? 'grab' : 'crosshair'; document.querySelectorAll('#fmMode button').forEach(x => x.classList.toggle('on', x.dataset.m === F.mode));
    $('fmZin').onclick = () => F.map.zoomIn(); $('fmZout').onclick = () => F.map.zoomOut(); $('fmFit').onclick = fit;
    $('fmUndo').onclick = () => { F.pts.pop(); changed(); }; $('fmClear').onclick = () => { F.pts = []; changed(); };
    $('fmBase').value = F.base; $('fmBase').onchange = e => setBase(e.target.value);
    $('fmLay').onchange = e => { F.lay = e.target.checked; drawLayout(); if (F.lay && !layoutData()) UI.toast(needLayout()); };
    $('fmView').value = F.view; $('fmView').onchange = e => { F.view = e.target.value; showRes(); }; $('fmSmooth').value = F.smooth ? '1' : '0'; $('fmSmooth').onchange = e => { F.smooth = e.target.value === '1'; showRes(); };
    $('fmCmp').value = F.cmp; $('fmCmp').onchange = e => { F.cmp = e.target.value; showCompare(); showRes(); };
    $('fmGo').onclick = search; $('fmQ').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
    $('fmLL').onclick = () => { const a = parseFloat($('fmLat').value), b = parseFloat($('fmLon').value); if (isFinite(a) && isFinite(b)) F.map.setView([a, b], 16); };
    $('fmGE').onclick = () => { const c = F.pts.length > 2 ? centroid(F.pts) : [F.map.getCenter().lat, F.map.getCenter().lng]; UI.openExternal('https://earth.google.com/web/@' + c[0].toFixed(6) + ',' + c[1].toFixed(6) + ',400a,900d,35y,0h,0t,0r'); };
    $('fmSketch').onclick = placeSketch; $('fmSite').onclick = siteRun; $('fmMon').onclick = () => FieldMon.run(); FieldMon.panel(); $('fmVRI').onclick = () => FieldPrec.runVRI(); $('fmEro').onclick = () => FieldPrec.runEro(); FieldPrec.panel(); $('fmWx').onclick = fieldWeather; $('fmRun').onclick = compute; $('fmUse').onclick = () => useField();
    $('fmRep').onclick = exportReport; $('fmGJ').onclick = exportGeoJSON; $('fmCSV').onclick = exportCSV;
    ['fmTitle', 'fmAuthor', 'fmOrg'].forEach(id => $(id).addEventListener('input', () => { F.title = $('fmTitle').value; F.author = $('fmAuthor').value; F.org = $('fmOrg').value; }));
    $('fmDpi').onchange = e => { F.dpi = +e.target.value; }; $('fmFmt').onchange = e => { F.fmt = e.target.value; }; $('fmFmt').value = F.fmt;
    $('fmSrc').value = F.src; $('fmSrc').onchange = e => { F.src = e.target.value; $('fmWhenR').style.display = F.src === 'sim' ? '' : 'none'; $('fmS2R').style.display = F.src === 'sim' || F.src === 'rgb' ? 'none' : ''; }; $('fmWhenR').style.display = F.src === 'sim' ? '' : 'none'; $('fmS2R').style.display = F.src === 'sim' || F.src === 'rgb' ? 'none' : ''; $('fmWhen').value = F.when || 'now'; $('fmWhen').onchange = e => { F.when = e.target.value; };
    $('fmDays').onchange = e => { F.days = Math.max(5, +e.target.value || 90); }; $('fmCloud').onchange = e => { F.cloud = Math.max(1, Math.min(100, +e.target.value || 30)); };
    setTimeout(() => { F.map.invalidateSize(); redraw(); if (F.pts.length > 2) fit(); if (F.cmp) showCompare(); if (F.res) showRes(); else if (FieldPrec.has(F.view)) F.refresh(F.view); if (F.site) showSite(); drawLayout(); steps(); F.lyc = layersCtl(F.map); mapLayers(); if (!F._lyT) F._lyT = setInterval(() => { if (document.getElementById('fmMap') && F.lyc) { try { mapLayers(); } catch (e) {} } }, 1500); }, 60);
  }
  async function search() {
    const q = document.getElementById('fmQ').value.trim(); if (!q) return; const st = document.getElementById('fmInfo');
    try { st.textContent = 'Searching...'; const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=' + encodeURIComponent(q)); const j = await r.json(); const g = j.results && j.results[0];
      if (!g) { st.textContent = 'No place found for "' + q + '"'; return; } F.place = [g.name, g.admin1, g.country].filter(Boolean).join(', '); F.map.setView([g.latitude, g.longitude], 15); st.textContent = F.place + ' · ' + g.latitude.toFixed(5) + ', ' + g.longitude.toFixed(5); }
    catch (e) { st.textContent = 'The place search needs the internet: ' + e.message; }
  }
  function fit() { if (F.pts.length > 1) F.map.fitBounds(L.latLngBounds(F.pts.map(p => L.latLng(p[0], p[1]))).pad(0.25)); }
  function redraw() {
    if (!F.map) return; F.mk.forEach(m => F.map.removeLayer(m)); F.mk = []; if (F.poly) F.map.removeLayer(F.poly); if (F.line) F.map.removeLayer(F.line); F.poly = F.line = null;
    if (F.pts.length > 2) F.poly = L.polygon(F.pts, { color: F.res ? '#FFFFFF' : '#FFD600', weight: F.res ? 2.5 : 3, fillColor: '#FFD600', fillOpacity: F.res ? 0 : 0.12, interactive: false }).addTo(F.map);
    else if (F.pts.length > 1) F.line = L.polyline(F.pts, { color: '#FFD600', weight: 3 }).addTo(F.map);
    F.pts.forEach((p, i) => { const m = L.marker(p, { draggable: true, icon: L.divIcon({ className: 'fmpt', html: String(i + 1), iconSize: [18, 18] }) }).addTo(F.map);
      m.on('drag', e => { F.pts[i] = [e.latlng.lat, e.latlng.lng]; if (F.poly) F.poly.setLatLngs(F.pts); else if (F.line) F.line.setLatLngs(F.pts); fieldInfo(); });
      m.on('dragend', () => changed()); m.on('contextmenu', () => { F.pts.splice(i, 1); changed(); }); F.mk.push(m); });
    fieldInfo(); steps(); if (F.map2) { if (F.poly2) F.map2.removeLayer(F.poly2); F.poly2 = F.pts.length > 2 ? L.polygon(F.pts, { color: '#FFFFFF', weight: 2.5, fill: false, interactive: false }).addTo(F.map2) : null; }
  }
  function fieldInfo() {
    const el = document.getElementById('fmField'); if (!el) return; if (F.pts.length < 3) { el.innerHTML = 'Click the corners of the field on the map (Demarcate). Drag a corner to move it; right-click a corner to remove it. Use the hand to move the map, + and − or the mouse wheel to zoom.' + (F.pts.length ? '<br><b>' + F.pts.length + ' corner' + (F.pts.length > 1 ? 's' : '') + ' so far.</b>' : ''); return; }
    const A = areaM2(F.pts), P = perim(F.pts), c = centroid(F.pts);
    el.innerHTML = '<table class="tbl" style="width:100%"><tr><td>Area</td><td><b>' + (A / 1e4).toFixed(3) + ' ha</b> (' + Math.round(A).toLocaleString('en-US') + ' m²)</td></tr><tr><td>Perimeter</td><td><b>' + Math.round(P).toLocaleString('en-US') + ' m</b></td></tr>' +
      '<tr><td>Centre</td><td><b>' + c[0].toFixed(6) + ', ' + c[1].toFixed(6) + '</b><br>' + dms(c[0], 'N', 'S') + ' ' + dms(c[1], 'E', 'W') + '</td></tr><tr><td>Corners</td><td>' + F.pts.length + '</td></tr>' + (F.place ? '<tr><td>Place</td><td>' + esc(F.place) + '</td></tr>' : '') + '</table>';
  }
  function placeSketch() {
    const m = typeof Sketch !== 'undefined' && Sketch.getMetres ? Sketch.getMetres() : null; if (!m || m.length < 3) { UI.toast('Draw the field in the sketch first'); return; }
    const c = F.map.getCenter(), o = [c.lat, c.lng], cx = m.reduce((a, p) => a + p[0], 0) / m.length, cy = m.reduce((a, p) => a + p[1], 0) / m.length;
    F.pts = m.map(p => unlocal([p[0] - cx, -(p[1] - cy)], o)); if (Sketch.setGeo) Sketch.setGeo({ lat: o[0], lon: o[1], place: F.place, offx: cx, offy: cy }); F.linked = false; changed(); fit();
  }
  function useField(quiet) {
    if (F.pts.length < 3) { if (!quiet) UI.toast('Demarcate the field first'); return; } const o = centroid(F.pts), xy = F.pts.map(p => local(p, o));
    const D0 = layoutData(), sq = D0 && D0.pts.find(q2 => q2.kind === 'source'), srcLL = sq ? unlocal(sq.p, [D0.lat, D0.lon]) : null;
    if (typeof Sketch !== 'undefined' && Sketch.setMetres) Sketch.setMetres(xy.map(p => [p[0], -p[1]]), { lat: o[0], lon: o[1], place: F.place }, true);
    if (srcLL && Sketch.setSrcMetres) { const l = local(srcLL, o); Sketch.setSrcMetres(l[0], l[1]); }
    F.linked = true; if (quiet) return;
    drawLayout(); UI.toast('The field is now the sketch: ' + (areaM2(F.pts) / 1e4).toFixed(2) + ' ha. Its irrigation layout is drawn on the map; press Back to the field sketch to change the system.'); UI.log('Field from the map: ' + (areaM2(F.pts) / 1e4).toFixed(3) + ' ha at ' + o[0].toFixed(5) + ', ' + o[1].toFixed(5));
  }

  // the demarcation changed: the simulated indices follow at once; satellite indices are read again on request
  function changed() {
    if (F.linked && F.pts.length > 2) useField(true);   // the sketch and its irrigation layout follow the new outline
    F.cv = null; F.site = null; clearSite(); FieldPrec.reset(); FieldPrec.panel(); FieldMon.reset(); FieldMon.panel(); if (PRECV[F.view]) F.view = 'cont'; if (F.res && F.res.sim && F.pts.length > 2) { try { F.res = fromSim(); } catch (e) { F.res = null; } }
    else if (F.res) { F.res = null; const st = document.getElementById('fmStat'); if (st) st.textContent = 'The field changed: press Compute to read the satellite data again for the new outline.'; }
    if (F.pts.length < 3) F.res = null; clearOverlay(); redraw(); mapLayers(); if (F.res) showRes(); else { const r = document.getElementById('fmRes'); if (r) r.innerHTML = ''; const v = document.getElementById('fmViewR'); if (v) v.style.display = 'none'; legend(); }
  }
  function steps() {
    const el = document.getElementById('fmSteps'); if (!el) return; const a = F.pts.length > 2, b = !!F.res, c = !!layoutData();
    const st = (ok, n, t) => '<span class="' + (ok ? 'ok' : '') + '">' + (ok ? '&#10003;' : n) + ' ' + t + '</span>';
    el.innerHTML = st(a, 1, a ? 'Field demarcated: ' + (areaM2(F.pts) / 1e4).toFixed(2) + ' ha' : 'Find the farm, then click its corners') + st(b, 2, b ? F.idx + ' on the map (' + (F.res.sim ? 'simulated' : F.res.photo ? 'from the satellite photo' : 'Sentinel-2, ' + F.res.date) + ')' : 'Compute the indices') + st(c, 3, c ? 'Irrigation layout on the map' : 'Use the field in the sketch for the layout') + st(false, 4, 'Export the report');
  }
  // the value of the index under the cursor
  function valueAt(k, lat, lon) { if (!F.res) return NaN; const G = F.res.G, l = local([lat, lon], G.o), i = Math.floor((l[0] - G.x0) / G.cell), j = Math.floor((G.y1 - l[1]) / G.cell); if (i < 0 || j < 0 || i >= G.nx || j >= G.ny || !inside(lat, lon, F.pts)) return NaN; return F.res.vals[RK().indexOf(k)][j * G.nx + i]; }
  function cursorInfo(ll) {
    const i = document.getElementById('fmInfo'); if (!i) return; let t = 'Cursor ' + ll.lat.toFixed(6) + ', ' + ll.lng.toFixed(6) + ' (' + dms(ll.lat, 'N', 'S') + ' ' + dms(ll.lng, 'E', 'W') + ') · zoom ' + F.map.getZoom();
    if (PRECV[F.view]) { const t2 = FieldPrec.at(F.view, ll.lat, ll.lng); if (t2) t += ' · <b>' + t2 + '</b>'; }
    else if (F.res) { const v = valueAt(F.idx, ll.lat, ll.lng); if (isFinite(v)) { const z = zoneOf(F.idx, v); t += ' · <b>' + F.idx + ' ' + v.toFixed(3) + '</b> (' + IDX[F.idx].read(v) + ', zone ' + (z + 1) + ' of 5)'; if (F.cmp) { const v2 = valueAt(F.cmp, ll.lat, ll.lng); if (isFinite(v2)) t += ' · <b>' + F.cmp + ' ' + v2.toFixed(3) + '</b>'; } } }
    i.innerHTML = t;
  }
  // the irrigation layout of the sketch, drawn on the map
  const needLayout = () => 'To draw the irrigation layout, press "Use this field in the sketch and the designs" (or draw the field in the sketch and press "Place my sketch here").';
  function layoutData() { try { return typeof Sketch !== 'undefined' && Sketch.layoutM ? Sketch.layoutM() : null; } catch (e) { return null; } }
  const LSTY = { lateral: { color: '#4FC3F7', weight: 1.2 }, 'sprinkler lateral': { color: '#4FC3F7', weight: 1.4 }, furrow: { color: '#D7B98E', weight: 1.2 }, border: { color: '#E0C38C', weight: 1.6 }, basin: { color: '#E0C38C', weight: 2 },
    submain: { color: '#1565C0', weight: 5 }, 'head ditch': { color: '#1E88E5', weight: 6 }, mainline: { color: '#0A246A', weight: 4, dashArray: '10 6' } };
  function drawLayout() {
    [[F.map, 'layG'], [F.map2, 'layG2']].forEach(([mp, key]) => { if (F[key] && F[key]._map) F[key].remove(); F[key] = null; if (!mp || !F.lay) return; const D = layoutData(); if (!D) return;
      const o = [D.lat, D.lon], ll = p => unlocal(p, o), g = L.layerGroup(), dense = mp.getZoom() < 16;
      D.lines.forEach(l => { const st = Object.assign({ interactive: false, opacity: 0.95 }, LSTY[l.kind] || {}), thin = /lateral|furrow|border|basin/.test(l.kind); if (thin && (dense || F.res)) { st.weight = 0.7; st.opacity = F.res ? 0.45 : 0.8; if (F.res) st.color = '#FFFFFF'; } if (l.kind === 'submain' || l.kind === 'mainline' || l.kind === 'head ditch') L.polyline(l.pts.map(ll), { color: '#fff', weight: st.weight + 3, opacity: 0.7, interactive: false }).addTo(g); L.polyline(l.pts.map(ll), st).addTo(g); });
      D.pts.forEach(q => { if (q.kind === 'sprinkler') L.circle(ll(q.p), { radius: q.r, color: '#81D4FA', weight: 0.8, fillColor: '#4FC3F7', fillOpacity: 0.12, interactive: false }).addTo(g);
        else if (q.kind === 'source') L.marker(ll(q.p), { icon: L.divIcon({ className: 'fmsrc', html: 'W', iconSize: [22, 22] }), title: 'Water source: ' + q.name }).addTo(g);
        else if (q.kind === 'inlet') L.marker(ll(q.p), { icon: L.divIcon({ className: 'fminl', iconSize: [12, 12] }), title: 'Inlet' }).addTo(g); });
      g.addTo(mp); F[key] = g; });
    steps(); legend();
  }
  async function fieldWeather() {
    if (F.pts.length < 3) { UI.toast('Demarcate the field first'); return; } const c = centroid(F.pts), st = document.getElementById('fmStat'); st.textContent = 'Downloading the weather of the field...';
    try { const s = await E.win.wxOnline(+c[0].toFixed(4), +c[1].toFixed(4), F.place || ('Field at ' + c[0].toFixed(4) + ', ' + c[1].toFixed(4))); window.__WXLOC = { lat: c[0], lon: c[1], name: F.place };
      E.poll(true); if (typeof Props !== 'undefined') { Props.build(); Props.update && Props.update(); } st.textContent = 'Online weather in use: ' + s.name + ' (' + s.years + ').'; UI.log('Online weather of the field in use: ' + s.name); }
    catch (e) { st.textContent = 'The online weather cannot be reached: ' + (e.message || e) + '. The recorded weather of the simulations stays in use.'; }
  }

  // ------------------------------------------------------------------ the indices
  const IX = (b, r, re, n, s) => { const ndvi = (n - r) / (n + r), evi = 2.5 * (n - r) / (n + 6 * r - 7.5 * b + 1), savi = 1.5 * (n - r) / (n + r + 0.5), ndre = (n - re) / (n + re), ndwi = (n - s) / (n + s); return [ndvi, evi, savi, ndre, ndwi]; };
  function grid(mc) {   // cells over the field (Sentinel-2: 10 m; simulated: down to 2 m), at most 220 x 220
    const o = centroid(F.pts), xy = F.pts.map(p => local(p, o)), xs = xy.map(p => p[0]), ys = xy.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const cell = Math.max(mc || 10, Math.max(x1 - x0, y1 - y0) / 220), nx = Math.max(1, Math.ceil((x1 - x0) / cell)), ny = Math.max(1, Math.ceil((y1 - y0) / cell));
    return { o, x0, y0, x1, y1, cell, nx, ny, ll: (i, j) => unlocal([x0 + (i + 0.5) * cell, y1 - (j + 0.5) * cell], o), sw: unlocal([x0, y1 - ny * cell], o), ne: unlocal([x0 + nx * cell, y1], o), nw: unlocal([x0, y1], o) };
  }
  async function compute() {
    if (F.pts.length < 3) { UI.toast('Demarcate the field first (at least three corners)'); return; }
    const st = document.getElementById('fmStat'); st.textContent = 'Computing...'; const net = e => /Failed to fetch|NetworkError|Load failed|aborted/i.test(e && e.message || '') ? 'no internet connection' : (e && e.message || String(e));
    if (F.src === 'auto' || F.src === 'rgb') {
      const msgs = []; let photo = null, s2 = null;
      try { photo = await FieldSite.readField(F, st); F.cv = photo.cv; } catch (e) { msgs.push('Photo: ' + net(e)); F.cv = null; }
      if (F.src === 'auto') { try { s2 = await fromS2(st); } catch (e) { msgs.push('Sentinel-2: ' + net(e)); } }
      if (s2) F.res = s2; else if (photo) F.res = photo.res; else { F.res = fromSim(); msgs.push('simulated by SWAFL instead'); }
      if (F.res.photo && !RK().includes(F.idx)) F.idx = 'VARI'; if (!F.res.photo && !F.res.sim && !KEYS.includes(F.idx)) F.idx = 'NDVI'; if (F.res.sim) F.idx = KEYS.includes(F.idx) ? F.idx : 'NDVI';
      showRes(); st.innerHTML = esc(F.res.note) + (F.cv ? ' Land cover read from the photo: ' + F.cv.shares.filter(c => c.pct >= 1).map(c => c.name.toLowerCase() + ' ' + c.pct.toFixed(0) + ' %').join(', ') + '.' : '') + (msgs.length ? '<br><b style="color:#B01E14">' + esc(msgs.join(' · ')) + '</b>' : '');
      return; }
    try { F.res = F.src === 's2' ? await fromS2(st) : fromSim(); if (!KEYS.includes(F.idx)) F.idx = 'NDVI'; showRes(); st.textContent = F.res.note; }
    catch (e) { if (/Failed to fetch|NetworkError|Load failed/i.test(e.message || '')) e = new Error('the satellite catalogue cannot be reached (no internet connection)'); st.innerHTML = '<b style="color:#B01E14">' + esc(e.message || e) + '</b>' + (F.src === 's2' ? ' The simulated indices are used instead.' : ''); if (F.src === 's2') { F.res = fromSim(); F.res.note = 'Satellite data not available (' + (e.message || e) + '); simulated by SWAFL instead.'; showRes(); } }
  }
  function stats(a) { const v = a.filter(x => isFinite(x)).sort((p, q) => p - q), n = v.length; if (!n) return null; const m = v.reduce((p, q) => p + q, 0) / n, sd = Math.sqrt(v.reduce((p, q) => p + (q - m) ** 2, 0) / n), pc = f => v[Math.min(n - 1, Math.max(0, Math.round(f * (n - 1))))]; return { n, mean: m, sd, min: v[0], max: v[n - 1], p10: pc(0.1), p50: pc(0.5), p90: pc(0.9) }; }
  const hash = (i, j) => { let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h & 0xffff) / 65535 * 2 - 1; };
  const vnoise = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  const fbm = (x, y) => 0.62 * vnoise(x, y) + 0.27 * vnoise(2.03 * x + 17.2, 2.03 * y + 5.1) + 0.11 * vnoise(4.1 * x + 3.7, 4.1 * y + 31.4);
  function runAxis() {   // along the longest side of the field; the inlet end is the end nearest the water source of the sketch
    let best = 0, ang = 0; const o = centroid(F.pts); F.pts.forEach((p, i) => { const q = F.pts[(i + 1) % F.pts.length], a = local(p, o), b = local(q, o), d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d > best) { best = d; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } });
    const ux = Math.cos(ang), uy = Math.sin(ang), s = p => { const l = local(p, o); return l[0] * ux + l[1] * uy; }; let inletHi = false;
    const D = layoutData(); if (D) { const src = D.pts.find(q => q.kind === 'inlet') || D.pts.find(q => q.kind === 'source'); if (src) { const sp = s(unlocal(src.p, [D.lat, D.lon])), v = F.pts.map(s); inletHi = Math.abs(sp - Math.max(...v)) < Math.abs(sp - Math.min(...v)); } }
    return { s, inletHi };
  }
  // simulated: the field's reflectance from the crop cover and the soil water of the daily model, with the spread of the design's uniformity
  function fromSim() {
    let D = null; try { D = E.json("(function(){var S=seasonSim(),k=fclock.kd();if(" + (F.when === 'peak') + "){var b=k;for(var d=Math.max(0,k-365);d<=k;d++)if((S.cover[d]||0)>(S.cover[b]||0))b=d;k=b}var rd=S.rd[k]||30,n=Math.max(1,Math.round(rd/DZ)),a=0;for(var i=0;i<n;i++)a+=Math.max(0,Math.min(1.2,S.s[k][i]));var t=DATA.texture[state.soil]||{},cu=0.85;try{cu=state.method==='M01_Overhead'?spRun().CU:/Drip/.test(state.method)?drRun().Eu:sidRun().cu/100}catch(e){}return {cover:S.cover[k]||0,s:a/n,s0:Math.max(0,Math.min(1.2,S.s[k][0])),fs:S.fs[k],fT:S.fTrig,crop:cropNameAt(S,k),date:fmtDate(dateOfK(k)),soil:DATA.soil_labels[state.soil],color:t.color||'#8B6B4A',sand:t.sand||40,cu:cu,nfac:NRATE_VALUES[state.nIdx]/100}})()"); } catch (e) {}
    if (!D) throw new Error('the simulation is not ready');
    const G = grid(2), hx = D.color.replace('#', ''), rgb = [0, 2, 4].map(i => parseInt(hx.substr(i, 2), 16) / 255), bright = 0.08 + 0.32 * (0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2]);
    const vals = KEYS.map(() => new Float32Array(G.nx * G.ny).fill(NaN));
    const stress = Math.max(0, Math.min(1, (D.fs - D.fT) / Math.max(0.05, 1 - D.fT))), nst = Math.max(0, Math.min(1, D.nfac));
    // the field's own pattern: soil and vigour patches tied to the ground (they stay where they are when the outline changes), and the
    // wetting gradient of the design along the run, from the inlet end (the end nearest the water source of the sketch) to the tail
    const cr = Math.cos(Math.round(G.o[0] * 10) / 10 * rad), AX = p => [p[1] * 111320 * cr, p[0] * 110540];
    const ax = runAxis(), lo = Math.min(...F.pts.map(p => ax.s(p))), hi = Math.max(...F.pts.map(p => ax.s(p)));
    for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const p = G.ll(i, j); if (!inside(p[0], p[1], F.pts)) continue;
      const [X, Y] = AX(p), z1 = fbm(X / 42, Y / 42), z2 = fbm(X / 27 + 91.3, Y / 27 - 45.7), z3 = fbm(X / 9 + 13.1, Y / 9 + 7.9);
      const u0 = (ax.s(p) - lo) / Math.max(1e-6, hi - lo), u = ax.inletHi ? 1 - u0 : u0;
      const wv = 1 + (1 - D.cu) * 1.4 * (0.5 - u) + 0.16 * z2 + 0.03 * z3, s = Math.max(0, Math.min(1.2, D.s * wv)), sTop = Math.max(0, Math.min(1.2, D.s0 * wv));
      const vig = 1 + 0.2 * z1 + 0.025 * z3 - 0.35 * Math.max(0, -z1 - 0.42);
      const c = Math.max(0, Math.min(1, D.cover * vig * (1 - 0.25 * stress) * (0.85 + 0.15 * Math.min(1, s))));
      const wet = 1 - 0.35 * Math.min(1, sTop), Rs = bright * wet, soil = [0.75 * Rs, Rs, 1.06 * Rs, 1.15 * Rs, 1.3 * Rs * (1 - 0.3 * Math.min(1, sTop))];
      const chl = 0.6 + 0.4 * nst, veg = [0.035, 0.05 + 0.04 * (1 - chl) + 0.03 * stress, 0.18 + 0.08 * (1 - chl), 0.46 - 0.12 * stress, 0.16 + 0.12 * stress + 0.06 * (1 - Math.min(1, s))];
      const r = soil.map((x, q) => c * veg[q] + (1 - c) * x), ix = IX(r[0], r[1], r[2], r[3], r[4]); ix.forEach((v, q) => { vals[q][j * G.nx + i] = v; }); }
    return pack(G, vals, { sim: true, src: 'Simulated by SWAFL from the daily model on ' + D.date + ': ' + D.crop + ', crop cover ' + Math.round(D.cover * 100) + ' %, root-zone water ' + Math.round(D.s * 100) + ' % of available, ' + D.soil + '; spread from the design uniformity ' + Math.round(D.cu * 100) + ' %.', date: D.date, note: 'Simulated indices for ' + D.date + ' (no internet needed). Choose the Sentinel-2 data for the real field.' });
  }
  // Sentinel-2 L2A (Copernicus open data): the catalogue of Element 84 Earth Search, or else Microsoft Planetary Computer;
  // the most recent scenes with few clouds over the tile are tried in turn until one has clear pixels over the field
  async function s2Search(ring, start, end, cloudMax) {
    const body = JSON.stringify({ collections: ['sentinel-2-l2a'], intersects: { type: 'Polygon', coordinates: [ring] }, datetime: start.toISOString() + '/' + end.toISOString(), limit: 40, query: { 'eo:cloud_cover': { lt: cloudMax || F.cloud } } }), errs = [];
    const pick = (P, a, keys) => keys.map(k => a[k]).find(Boolean);
    try { const r = await fetch('https://earth-search.aws.element84.com/v1/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }); if (!r.ok) throw new Error('answer ' + r.status); const j = await r.json();
      const it = (j.features || []).map(f => { const P = f.properties, A = f.assets; return { id: f.id, date: P.datetime, cloud: P['eo:cloud_cover'], epsg: P['proj:epsg'] || +(String(P['proj:code'] || '').split(':')[1]), off: (parseFloat(P['s2:processing_baseline'] || '0') >= 4 && !P['earthsearch:boa_offset_applied']) ? -0.1 : 0, cat: 'Element 84 Earth Search',
        href: { blue: (pick(P, A, ['blue', 'B02']) || {}).href, red: (pick(P, A, ['red', 'B04']) || {}).href, rededge1: (pick(P, A, ['rededge1', 'B05']) || {}).href, nir: (pick(P, A, ['nir', 'B08']) || {}).href, swir16: (pick(P, A, ['swir16', 'B11']) || {}).href, scl: (pick(P, A, ['scl', 'SCL']) || {}).href } }; });
      if (it.length) return it; errs.push('Earth Search: no scene'); } catch (e) { errs.push('Earth Search: ' + e.message); }
    try { const r = await fetch('https://planetarycomputer.microsoft.com/api/stac/v1/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }); if (!r.ok) throw new Error('answer ' + r.status); const j = await r.json();
      const tk = await (await fetch('https://planetarycomputer.microsoft.com/api/sas/v1/token/sentinel-2-l2a')).json(), sign = h => h ? h + (h.includes('?') ? '&' : '?') + tk.token : h;
      const it = (j.features || []).map(f => { const P = f.properties, A = f.assets; return { id: f.id, date: P.datetime, cloud: P['eo:cloud_cover'], epsg: P['proj:epsg'] || +(String(P['proj:code'] || '').split(':')[1]), off: parseFloat(P['s2:processing_baseline'] || '0') >= 4 ? -0.1 : 0, cat: 'Microsoft Planetary Computer',
        href: { blue: sign((A.B02 || {}).href), red: sign((A.B04 || {}).href), rededge1: sign((A.B05 || {}).href), nir: sign((A.B08 || {}).href), swir16: sign((A.B11 || {}).href), scl: sign((A.SCL || {}).href) } }; });
      if (it.length) return it; errs.push('Planetary Computer: no scene'); } catch (e) { errs.push('Planetary Computer: ' + e.message); }
    throw new Error(errs.join('; '));
  }
  async function fromS2(st) {
    if (typeof GeoTIFF === 'undefined') throw new Error('the GeoTIFF reader did not load');
    const ring = F.pts.map(p => [p[1], p[0]]); ring.push(ring[0]); const end = new Date(), start = new Date(end - F.days * 864e5);
    st.textContent = 'Searching Sentinel-2 scenes of the last ' + F.days + ' days with less than ' + F.cloud + ' % cloud...';
    const items = await s2Search(ring, start, end); if (!items.length) throw new Error('no Sentinel-2 scene with less than ' + F.cloud + ' % cloud in the last ' + F.days + ' days');
    const cand = items.slice().sort((a, b) => (b.date > a.date ? 1 : -1)).filter(x => x.cloud < F.cloud).slice(0, 4); let lastErr = null;
    for (const it of cand) { try { return await readScene(it, st); } catch (e) { lastErr = e; } }
    throw lastErr || new Error('no clear scene');
  }
  async function readScene(it, st) {
    const zone = it.epsg % 100, south = it.epsg > 32700, d = it.date.slice(0, 10);
    const G = grid(10), cells = []; for (let jj = 0; jj < G.ny; jj++) for (let i = 0; i < G.nx; i++) { const p = G.ll(i, jj); if (inside(p[0], p[1], F.pts)) cells.push([i, jj, toUTM(p[0], p[1], zone, south)]); }
    if (!cells.length) throw new Error('the field is too small (less than one 10 m pixel)');
    const ux = cells.map(c => c[2][0]), uy = cells.map(c => c[2][1]), bb = [Math.min(...ux) - 30, Math.min(...uy) - 30, Math.max(...ux) + 30, Math.max(...uy) + 30], band = {};
    for (const k of ['scl', 'blue', 'red', 'rededge1', 'nir', 'swir16']) { const href = it.href[k]; if (!href) throw new Error('band ' + k + ' is missing in the scene'); st.textContent = 'Reading the ' + k + ' band of the scene of ' + d + ' (' + it.cat + ')...';
      const tif = await GeoTIFF.fromUrl(href, { allowFullFile: true }), img = await tif.getImage(), [ox, oy] = img.getOrigin(), [rx, ry] = img.getResolution(), W = img.getWidth(), H = img.getHeight();
      const c0 = Math.max(0, Math.floor((bb[0] - ox) / rx)), c1 = Math.min(W, Math.ceil((bb[2] - ox) / rx) + 1), r0 = Math.max(0, Math.floor((bb[3] - oy) / ry)), r1 = Math.min(H, Math.ceil((bb[1] - oy) / ry) + 1);
      if (c1 <= c0 || r1 <= r0) throw new Error('the field is outside the scene');
      const ras = await img.readRasters({ window: [c0, r0, c1, r1], samples: [0], interleave: false }); band[k] = { d: ras[0], w: c1 - c0, h: r1 - r0, ox: ox + c0 * rx, oy: oy + r0 * ry, rx, ry };
      if (k === 'scl') { const at0 = (x, y) => { const c = Math.floor((x - band.scl.ox) / rx), r = Math.floor((y - band.scl.oy) / ry); return c < 0 || r < 0 || c >= band.scl.w || r >= band.scl.h ? 0 : band.scl.d[r * band.scl.w + c]; }; const clear = cells.filter(c => ![0, 1, 3, 8, 9, 10, 11].includes(at0(c[2][0], c[2][1]))).length; if (clear < cells.length * 0.3) throw new Error('the scene of ' + d + ' is cloudy over the field'); } }
    const at = (b, x, y) => { const c = Math.floor((x - b.ox) / b.rx), rr = Math.floor((y - b.oy) / b.ry); if (c < 0 || rr < 0 || c >= b.w || rr >= b.h) return NaN; const v = b.d[rr * b.w + c]; return v === undefined ? NaN : v; };
    const vals = KEYS.map(() => new Float32Array(G.nx * G.ny).fill(NaN)); let bad = 0;
    cells.forEach(([i, jj, u]) => { const scl = at(band.scl, u[0], u[1]); if ([0, 1, 3, 8, 9, 10, 11].includes(scl)) { bad++; return; }
      const rf = k => { const v = at(band[k], u[0], u[1]); return v > 0 ? v * 0.0001 + it.off : NaN; }, b = rf('blue'), rr = rf('red'), re = rf('rededge1'), n = rf('nir'), s2 = rf('swir16');
      if (![b, rr, re, n, s2].every(isFinite)) { bad++; return; } IX(b, rr, re, n, s2).forEach((v, q) => { vals[q][jj * G.nx + i] = v; }); });
    if (bad >= cells.length) throw new Error('every pixel of the field is cloud, shadow or no data in the scene of ' + d);
    return pack(G, vals, { s2: true, src: 'Sentinel-2 L2A scene ' + it.id + ' of ' + d + ' (' + it.cat + '), cloud ' + Math.round(it.cloud) + ' % over the tile; ' + (cells.length - bad) + ' of ' + cells.length + ' cells of 10 m clear (scene classification). Contains modified Copernicus Sentinel data ' + d.slice(0, 4) + '.', date: d, note: 'Real Sentinel-2 indices of ' + d + ' (' + Math.round(it.cloud) + ' % cloud over the tile, ' + (cells.length - bad) + ' clear cells of 10 m).' });
  }
  function pack(G, vals, meta, keys) { keys = keys || KEYS; const S = {}; keys.forEach((k, q) => { S[k] = stats(Array.from(vals[q])); }); return Object.assign({ G, vals, S, keys, pts: F.pts.slice() }, meta); }
  const RAMP = { veg: [[0, [165, 0, 38]], [0.25, [244, 109, 67]], [0.45, [254, 224, 139]], [0.65, [166, 217, 106]], [0.85, [26, 152, 80]], [1, [0, 104, 55]]], wat: [[0, [140, 81, 10]], [0.35, [223, 194, 125]], [0.55, [199, 234, 229]], [0.8, [53, 151, 143]], [1, [1, 102, 94]]] };
  const rampAt = (name, t) => { const R2 = RAMP[name]; t = Math.max(0, Math.min(1, t)); for (let i = 1; i < R2.length; i++) if (t <= R2[i][0]) { const a = R2[i - 1], b = R2[i], f = (t - a[0]) / (b[0] - a[0]); return a[1].map((c, q) => Math.round(c + (b[1][q] - c) * f)); } return R2[R2.length - 1][1]; };
  function colour(k, v) { const I = IDX[k]; return rampAt(I.ramp, (v - I.lo) / (I.hi - I.lo)); }
  const ZT = [0.02, 0.27, 0.5, 0.73, 0.98], zoneCol = (k, z) => rampAt(IDX[k].ramp, ZT[z]);
  // natural breaks (Jenks) of the field's values into five management zones, with the area and the mean of each
  function zones(k) {
    F.res._Z = F.res._Z || {}; if (F.res._Z[k]) return F.res._Z[k]; const q = RK().indexOf(k), all = Array.from(F.res.vals[q]).filter(isFinite).sort((a, b) => a - b), n0 = all.length; if (!n0) return null;
    const step = Math.max(1, Math.floor(n0 / 1200)), v = all.filter((x, i) => i % step === 0), n = v.length, K = Math.min(5, n), LC = [], VAR = [];
    for (let i = 0; i <= n; i++) { LC.push(new Array(K + 1).fill(0)); VAR.push(new Array(K + 1).fill(Infinity)); } for (let j = 1; j <= K; j++) { LC[1][j] = 1; VAR[1][j] = 0; }
    for (let l = 2; l <= n; l++) { let s1 = 0, s2 = 0, w = 0, vv = 0; for (let m = 1; m <= l; m++) { const i3 = l - m + 1, val = v[i3 - 1]; s2 += val * val; s1 += val; w++; vv = s2 - s1 * s1 / w; const i4 = i3 - 1; if (i4 !== 0) for (let j = 2; j <= K; j++) if (VAR[l][j] >= vv + VAR[i4][j - 1]) { LC[l][j] = i3; VAR[l][j] = vv + VAR[i4][j - 1]; } } LC[l][1] = 1; VAR[l][1] = vv; }
    const br = new Array(K + 1); br[K] = v[n - 1]; br[0] = v[0]; let kk = n; for (let j = K; j >= 2; j--) { const id = LC[kk][j] - 2; br[j - 1] = v[Math.max(0, id)]; kk = LC[kk][j] - 1; }
    while (br.length < 6) br.push(br[br.length - 1]);
    const A = areaM2(F.pts), Z = [0, 1, 2, 3, 4].map(() => ({ n: 0, s: 0, min: Infinity, max: -Infinity })); all.forEach(x => { const z = cls(br, x), c = Z[z]; c.n++; c.s += x; c.min = Math.min(c.min, x); c.max = Math.max(c.max, x); });
    Z.forEach(c => { c.mean = c.n ? c.s / c.n : NaN; c.ha = c.n / n0 * A / 1e4; c.pct = c.n / n0 * 100; }); const out = { br, Z }; F.res._Z[k] = out; return out;
  }
  const cls = (br, x) => { for (let z = 1; z < 5; z++) if (x <= br[z]) return z - 1; return 4; };
  const zoneOf = (k, v) => { const Z = zones(k); return Z ? cls(Z.br, v) : 0; };
  // the index over the field: interpolated (smooth) or as measured (pixels), cut exactly to the demarcated outline
  function fieldCanvas(k, view, smooth, maxPx) {
    const G = F.res.G, q = RK().indexOf(k), src = view === 'zones' ? blurred(q) : filled(q), sc = Math.max(1, Math.min(48, (maxPx || 1400) / Math.max(G.nx, G.ny))), W = Math.max(1, Math.round(G.nx * sc)), H = Math.max(1, Math.round(G.ny * sc));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), im = c.createImageData(W, H), Z = view === 'zones' ? zones(k) : null, zc = Z ? [0, 1, 2, 3, 4].map(z => zoneCol(k, z)) : null;
    const at = (i, j) => src[Math.max(0, Math.min(G.ny - 1, j)) * G.nx + Math.max(0, Math.min(G.nx - 1, i))];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v; const gx = (x + 0.5) / sc - 0.5, gy = (y + 0.5) / sc - 0.5;
      if (smooth) { const i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j; v = at(i, j) * (1 - fx) * (1 - fy) + at(i + 1, j) * fx * (1 - fy) + at(i, j + 1) * (1 - fx) * fy + at(i + 1, j + 1) * fx * fy; } else v = at(Math.floor((x + 0.5) / sc), Math.floor((y + 0.5) / sc));
      if (!isFinite(v)) continue; const col = Z ? zc[cls(Z.br, v)] : colour(k, v), o = (y * W + x) * 4; im.data[o] = col[0]; im.data[o + 1] = col[1]; im.data[o + 2] = col[2]; im.data[o + 3] = 255; }
    c.putImageData(im, 0, 0); c.globalCompositeOperation = 'destination-in'; c.beginPath(); F.pts.forEach((p, i) => { const l = local(p, G.o), X = (l[0] - G.x0) / G.cell * sc, Y = (G.y1 - l[1]) / G.cell * sc; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over';
    return cv;
  }
  function blurred(q) {   // the zones are drawn from the field smoothed over about 3 cells, like management zones with a minimum size
    F.res._B = F.res._B || {}; if (F.res._B[q]) return F.res._B[q]; const G = F.res.G; let a = Float32Array.from(filled(q));
    const np = Math.max(3, Math.min(12, Math.round(9 / G.cell)));
    for (let pass = 0; pass < np; pass++) { const b = new Float32Array(a.length); for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { let s2 = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= G.nx || jj >= G.ny) continue; s2 += a[jj * G.nx + ii]; n++; } b[j * G.nx + i] = s2 / n; } a = b; }
    F.res._B[q] = a; return a;
  }
  function filled(q) {   // cells outside the outline (or cloudy) take the value of their nearest clear neighbour, so the edge of the field keeps its colour
    F.res._F = F.res._F || {}; if (F.res._F[q]) return F.res._F[q]; const G = F.res.G, a = Float32Array.from(F.res.vals[q]);
    for (let pass = 0; pass < 6; pass++) { const b = Float32Array.from(a); let miss = 0; for (let j = 0; j < G.ny; j++) for (let i = 0; i < G.nx; i++) { const o = j * G.nx + i; if (isFinite(a[o])) continue; let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= G.nx || jj >= G.ny) continue; const v = a[jj * G.nx + ii]; if (isFinite(v)) { s += v; n++; } } if (n) b[o] = s / n; else miss++; } a.set(b); if (!miss) break; }
    const m = F.res.S[RK()[q]] ? F.res.S[RK()[q]].mean : 0; for (let i = 0; i < a.length; i++) if (!isFinite(a[i])) a[i] = m; F.res._F[q] = a; return a;
  }
  function clearOverlay() { [['map', 'ov'], ['map2', 'ov2']].forEach(([m, o]) => { if (F[o] && F[m]) F[m].removeLayer(F[o]); F[o] = null; }); }
  function overlay(mp, k) { if (PRECV[F.view] && mp === F.map) { const l = FieldPrec.layer(F.view); if (l) return l.addTo(mp); } if (F.view === 'cover' && F.cv && mp === F.map) return L.imageOverlay(F.cv.url, F.cv.bounds, { opacity: 0.85, interactive: false }).addTo(mp); const G = F.res.G; return L.imageOverlay(fieldCanvas(k, F.view, F.smooth).toDataURL(), [[G.sw[0], G.sw[1]], [G.ne[0], G.ne[1]]], { opacity: 0.9, interactive: false, className: F.smooth ? '' : 'fmov' }).addTo(mp); }
  function showOverlay() { if (!F.res || !F.map) return; clearOverlay(); F.ov = overlay(F.map, F.idx); if (F.map2 && F.cmp) F.ov2 = overlay(F.map2, F.cmp); if (F.poly) F.poly.setStyle({ fillOpacity: 0, color: '#FFFFFF', weight: 2.5 }); [F.layG, F.layG2].forEach(g => g && g.eachLayer(l => l.bringToFront && l.bringToFront())); }
  // the legend on the map: index, date and source, colour scale or zones, and the spread of the field (histogram)
  function legendCtl(mp) { const C = L.Control.extend({ onAdd() { const d = L.DomUtil.create('div', 'fmlegc'); d.title = 'Click the dark title to fold or unfold the legend'; d.addEventListener('click', e => { if (e.target.closest('.fmchip')) d.classList.toggle('min'); }); L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d); return d; } }); const c = new C({ position: 'bottomleft' }); c.addTo(mp); return c; }
  const PRECV = { vri: 1, vridate: 1, gully: 1, rusle: 1, mzone: 1, mchange: 1, mtrend: 1, mstab: 1 };
  // the maps already computed for this field, as layers: click one to show it again (nothing is computed again); they stay until
  // the outline changes, also when the window is closed and opened again
  function layersCtl(mp) { const C = L.Control.extend({ options: { position: 'topright' }, onAdd() { const d = L.DomUtil.create('div', 'fmlyc'); L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d); d.addEventListener('click', e => { L.DomEvent.stop(e); if (e.target.closest('.fmlyh')) { d.classList.toggle('min'); return; } const b = e.target.closest('[data-ly]'); if (!b) return; const v = b.dataset.ly; setTimeout(() => act(v), 0); }); const act = v => { if (v === 'src') { F.showSrc = F.showSrc === false; drawSources(); return; } if (v === 'lay') { F.lay = !F.lay; const c = document.getElementById('fmLay'); if (c) c.checked = F.lay; drawLayout(); mapLayers(); return; } const [view, idx] = v.split(':'); if (idx) F.idx = idx; F.view = view; if (F.res) showRes(); else F.refresh(view); mapLayers(); }; return d; } }); const c = new C(); c.addTo(mp); return c; }
  function mapLayers() {
    if (!F.lyc || !F.lyc.getContainer) return; const d = F.lyc.getContainer(), rows = [], it = (v, lab, on, sub) => rows.push('<div class="fmly' + (on ? ' on' : '') + '" data-ly="' + v + '"><i>' + (on ? '&#9673;' : '&#9675;') + '</i>' + esc(lab) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>');
    const pv = F.view;
    if (F.res) { rows.push('<div class="fmlyg">Indices · ' + esc(F.res.photo ? 'satellite photo' : F.res.sim ? 'simulated' : 'Sentinel-2 ' + (F.res.date || '')) + '</div>'); RK().forEach(k => it('cont:' + k, k, (pv === 'cont') && F.idx === k)); RK().forEach(k => { if (F.idx === k) it('zones:' + k, k + ' management zones', pv === 'zones'); }); if (F.cv) it('cover', 'Land cover (image analysis)', pv === 'cover'); }
    const mon = [['mzone', 'Monitoring zones'], ['mchange', 'Change since the last scene'], ['mtrend', 'Trend of the last scenes'], ['mstab', 'Stability over the season']].filter(q => FieldPrec.has(q[0]));
    if (mon.length) { rows.push('<div class="fmlyg">Season · Sentinel-2</div>'); mon.forEach(q => it(q[0], q[1], pv === q[0])); }
    const pr = [['vri', 'Irrigation depth by zone'], ['vridate', 'Irrigation date by zone'], ['gully', 'Ephemeral gullies'], ['rusle', 'Soil loss (RUSLE)']].filter(q => FieldPrec.has(q[0]));
    if (pr.length) { rows.push('<div class="fmlyg">Precision maps</div>'); pr.forEach(q => it(q[0], q[1], pv === q[0])); }
    const ov = []; if (F.site) ov.push('<div class="fmly' + (F.showSrc !== false ? ' on' : '') + '" data-ly="src"><i>' + (F.showSrc !== false ? '&#9745;' : '&#9744;') + '</i>Water sources</div>'); if (layoutData()) ov.push('<div class="fmly' + (F.lay ? ' on' : '') + '" data-ly="lay"><i>' + (F.lay ? '&#9745;' : '&#9744;') + '</i>Irrigation layout</div>');
    if (ov.length) rows.push('<div class="fmlyg">On top</div>' + ov.join(''));
    const html = '<div class="fmlyh">Maps of this field' + (rows.length ? '' : ' (none yet)') + '</div>' + (rows.length ? '<div class="fmlyb">' + rows.join('') + '</div>' : '<div class="fmlyb"><small>Each map you compute (indices, season, irrigation zones, erosion, site) is kept here; click it to show it again.</small></div>');
    if (d.__h !== html) { d.__h = html; d.innerHTML = html; }
  }
  function legendFor(k) {
    if (PRECV[F.view] && k === F.idx) return FieldPrec.legend(F.view);
    if (!F.res) return '';
    if (F.view === 'cover' && F.cv && k === F.idx) return '<div class="fmchip">Land cover · satellite photo · image analysis</div><table>' + F.cv.shares.map(c => '<tr><td><i style="background:' + c.col + '"></i></td><td>' + c.name + '</td><td>' + c.ha.toFixed(2) + ' ha</td><td>' + c.pct.toFixed(0) + ' %</td></tr>').join('') + '</table>';
    const I = IDX[k], s = F.res.S[k], head = '<div class="fmchip">' + k + ' · ' + (F.res.photo ? '' : esc(F.res.date) + ' · ') + (F.res.sim ? 'simulated' : F.res.photo ? 'satellite photo' : 'Sentinel-2') + '</div>';
    let body;
    if (F.view === 'zones') { const Z = zones(k); body = Z ? '<table>' + Z.Z.map((z, i) => '<tr><td><i style="background:rgb(' + zoneCol(k, i).join(',') + ')"></i></td><td>' + (i + 1) + '</td><td>' + f2(Z.br[i]) + '–' + f2(Z.br[i + 1]) + '</td><td>' + z.ha.toFixed(2) + ' ha</td><td>' + z.pct.toFixed(0) + ' %</td></tr>').join('') + '</table>' : ''; }
    else { const nb = 28, hb = new Array(nb).fill(0), q = RK().indexOf(k); F.res.vals[q].forEach(v => { if (isFinite(v)) hb[Math.max(0, Math.min(nb - 1, Math.floor((v - I.lo) / (I.hi - I.lo) * nb)))]++; }); const hm = Math.max(1, ...hb), st = [];
      for (let i = 0; i <= 10; i++) st.push('rgb(' + colour(k, I.lo + (I.hi - I.lo) * i / 10).join(',') + ') ' + i * 10 + '%');
      body = '<div class="fmhist">' + hb.map((h, i) => '<b style="height:' + (2 + 26 * h / hm).toFixed(1) + 'px;background:rgb(' + colour(k, I.lo + (I.hi - I.lo) * (i + 0.5) / nb).join(',') + ')"></b>').join('') + '</div><i class="fmgrad" style="background:linear-gradient(90deg,' + st.join(',') + ')"></i><div class="fmends"><span>' + I.lo + ' low</span><span>high ' + I.hi + '</span></div>'; }
    return head + body + (s ? '<div class="fmmean">mean ' + f2(s.mean) + ' · ' + esc(I.read(s.mean)) + '</div>' : '');
  }
  function legend() {
    const D = F.lay ? layoutData() : null, lay = D ? '<div class="fmlay"><b>Irrigation layout</b> · ' + esc(D.label) + '<br><i class="l1"></i> ' + (D.sys === 'drip' ? 'laterals' : D.sys === 'spr' ? 'sprinkler laterals' : D.sys === 'furrow' ? 'furrows' : D.sys === 'basin' ? 'basin borders' : 'borders') + ' <i class="l2"></i> ' + (D.sys === 'border' || D.sys === 'furrow' || D.sys === 'basin' ? 'head ditch' : 'submain') + ' <i class="l3"></i> mainline</div>' : '';
    [[F.leg, F.idx], [F.leg2, F.cmp]].forEach(([c, k]) => { if (!c || !c.getContainer()) return; const html = (k && F.res ? legendFor(k) : '') + (c === F.leg ? lay : ''); c.getContainer().innerHTML = html; c.getContainer().style.display = html ? '' : 'none'; });
  }
  // two indices side by side, the two maps moving together
  function showCompare() {
    const m2 = document.getElementById('fmMap2'), wrap = document.getElementById('fmMaps'); if (!m2) return;
    if (F._sync) { F.map.off('move', F._sync); F._sync = null; } if (F.map2) { try { F.map2.remove(); } catch (e) {} F.map2 = null; F.leg2 = null; F.ov2 = null; F.poly2 = null; F.layG2 = null; }
    const on = !!F.cmp && !!F.res; m2.style.display = on ? '' : 'none'; wrap.classList.toggle('two', on); F.map.invalidateSize();
    if (!on) return;
    F.map2 = L.map(m2, { zoomControl: false, attributionControl: false }).setView(F.map.getCenter(), F.map.getZoom()); setBase(F.base); F.leg2 = legendCtl(F.map2);
    let lock = false; const mk = (a, b) => () => { if (lock || !b._loaded || !a._loaded) return; lock = true; try { b.setView(a.getCenter(), a.getZoom(), { animate: false }); } catch (e) {} lock = false; };
    F._sync = mk(F.map, F.map2); F.map.on('move', F._sync); F.map2.on('move', mk(F.map2, F.map)); F.map2.on('mousemove', e => cursorInfo(e.latlng)); F.map2.on('zoomend', () => drawLayout());
    redraw(); drawLayout();
  }
  function showRes() {
    const el = document.getElementById('fmRes'); if (!el || !F.res) return; const S = F.res.S;
    el.innerHTML = '<div class="pnote">' + esc(F.res.src) + '</div><table class="tbl fmtab"><tr><th>Index</th><th>Mean</th><th>10–90 %</th><th>Min · max</th><th>Reading of the mean</th></tr>' +
      RK().map(k => { const s = S[k]; return '<tr class="' + (k === F.idx ? 'on' : '') + '" data-k="' + k + '"><td><b>' + k + '</b><br><small>' + esc(IDX[k].bands) + '</small></td><td><b>' + f2(s && s.mean) + '</b></td><td>' + (s ? f2(s.p10) + ' to ' + f2(s.p90) : '-') + '</td><td>' + (s ? f2(s.min) + ' · ' + f2(s.max) : '-') + '</td><td>' + (s ? esc(IDX[k].read(s.mean)) : 'no clear cells') + '</td></tr>'; }).join('') + '</table>' +
      '<div class="pnote">Click a row to show that index on the map. ' + esc(IDX[F.idx].name) + ': ' + esc(IDX[F.idx].use) + '. Move the mouse over the field to read the value at any point.</div>' + zoneTable(F.idx);
    el.querySelectorAll('tr[data-k]').forEach(tr => tr.onclick = () => { F.idx = tr.dataset.k; showRes(); });
    const vr = document.getElementById('fmViewR'); if (vr) vr.style.display = '';
    const cs = document.getElementById('fmCmp'); if (cs) { if (!RK().includes(F.cmp)) F.cmp = ''; cs.innerHTML = '<option value="">nothing (one map)</option>' + RK().filter(k => k !== F.idx).map(k => '<option value="' + k + '"' + (k === F.cmp ? ' selected' : '') + '>' + k + ' side by side</option>').join(''); }
    const vs = document.getElementById('fmView'); if (vs) { vs.querySelector('option[value=cover]').disabled = !F.cv; if (F.view === 'cover' && !F.cv) F.view = 'cont'; ['mzone', 'mchange', 'mtrend', 'mstab', 'vri', 'vridate', 'gully', 'rusle'].forEach(v => { vs.querySelector('option[value=' + v + ']').disabled = !FieldPrec.has(v); if (F.view === v && !FieldPrec.has(v)) F.view = 'cont'; }); vs.value = F.view; }
    if (F.cv) el.insertAdjacentHTML('beforeend', coverTable());
    showOverlay(); redraw(); drawLayout(); mapLayers();
  }

  function coverTable() { const C = F.cv; return '<div class="fmzt"><b>Land cover read from the satellite photo</b> (image analysis: colour and texture of every pixel, k-means clustering, named by rules; ' + C.mpp.toFixed(1) + ' m per pixel)<table class="tbl"><tr><th></th><th>Cover</th><th>Area</th><th>Share</th></tr>' +
    C.shares.map(c => '<tr><td><i style="background:' + c.col + '"></i></td><td>' + c.name + '</td><td>' + c.ha.toFixed(3) + ' ha</td><td>' + c.pct.toFixed(1) + ' %</td></tr>').join('') + '</table><div class="pnote">Choose "Land cover read from the photo" under Show on the map to see it.</div></div>'; }
  function zoneTable(k) { const Z = zones(k); if (!Z) return ''; return '<div class="fmzt"><b>Management zones of ' + k + '</b> (natural breaks)<table class="tbl"><tr><th></th><th>Zone</th><th>Range</th><th>Mean</th><th>Area</th><th>Share</th></tr>' +
    Z.Z.map((z, i) => '<tr><td><i style="background:rgb(' + zoneCol(k, i).join(',') + ')"></i></td><td>' + (i + 1) + (i === 0 ? ' low' : i === 4 ? ' high' : '') + '</td><td>' + f2(Z.br[i]) + ' to ' + f2(Z.br[i + 1]) + '</td><td><b>' + f2(z.mean) + '</b></td><td>' + z.ha.toFixed(3) + ' ha</td><td>' + z.pct.toFixed(1) + ' %</td></tr>').join('') + '</table></div>'; }

  // ------------------------------------------------------------------ exports
  function need() { if (F.pts.length < 3) { UI.toast('Demarcate the field first'); return false; } return true; }
  function exportGeoJSON() { if (!need()) return; const c = centroid(F.pts), ring = F.pts.map(p => [+p[1].toFixed(7), +p[0].toFixed(7)]); ring.push(ring[0]);
    const props = { title: F.title, author: F.author, organisation: F.org, place: F.place, area_ha: +(areaM2(F.pts) / 1e4).toFixed(4), perimeter_m: Math.round(perim(F.pts)), centroid_lat: +c[0].toFixed(7), centroid_lon: +c[1].toFixed(7), crs: 'EPSG:4326', software: 'SWAFL 1.1.0', created: new Date().toISOString() };
    if (F.res) { props.indices_source = F.res.src; props.indices_date = F.res.date; RK().forEach(k => { const s = F.res.S[k]; if (s) { props[k + '_mean'] = +s.mean.toFixed(4); props[k + '_p10'] = +s.p10.toFixed(4); props[k + '_p90'] = +s.p90.toFixed(4); } }); }
    UI.saveFile(fileBase() + '.geojson', JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [ring] } }] }, null, 1), false, 'application/geo+json'); }
  function exportCSV() { if (!need()) return; const c = centroid(F.pts); let t = 'title,' + q(F.title) + '\nauthor,' + q(F.author) + '\norganisation,' + q(F.org) + '\nplace,' + q(F.place) + '\ncentroid_lat,' + c[0].toFixed(7) + '\ncentroid_lon,' + c[1].toFixed(7) + '\narea_ha,' + (areaM2(F.pts) / 1e4).toFixed(4) + '\nperimeter_m,' + Math.round(perim(F.pts)) + '\n\ncorner,lat,lon\n' + F.pts.map((p, i) => (i + 1) + ',' + p[0].toFixed(7) + ',' + p[1].toFixed(7)).join('\n') + '\n';
    if (F.res) t += '\nsource,' + q(F.res.src) + '\nindex,mean,sd,min,p10,median,p90,max,cells,reading\n' + RK().map(k => { const s = F.res.S[k]; return s ? [k, s.mean, s.sd, s.min, s.p10, s.p50, s.p90, s.max].map((v, i) => i ? (+v).toFixed(4) : v).join(',') + ',' + s.n + ',' + q(IDX[k].read(s.mean)) : k + ',,,,,,,,0,'; }).join('\n') + '\n';
    UI.saveFile(fileBase() + '.csv', t, false, 'text/csv'); }
  const q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
  const fileBase = () => 'SWAFL_field_' + (F.place ? F.place.split(',')[0].replace(/[^A-Za-z0-9]+/g, '_') + '_' : '') + new Date().toISOString().slice(0, 10);
  // the map picture for the report: the tiles of the field area at a zoom that fills the frame, the field, the index, north and scale
  async function mapImage(w, h, withIdx, key, small, opt) {
    opt = opt || {};
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.fillStyle = '#E9E6DE'; c.fillRect(0, 0, w, h);
    const ext = F.pts.concat(opt.extent || []), lats = ext.map(p => p[0]), lons = ext.map(p => p[1]); let la0 = Math.min(...lats), la1 = Math.max(...lats), lo0 = Math.min(...lons), lo1 = Math.max(...lons); const pl = (la1 - la0) * 0.25 + 1e-4, pn = (lo1 - lo0) * 0.25 + 1e-4; la0 -= pl; la1 += pl; lo0 -= pn; lo1 += pn;
    const mx = (lon, z) => (lon + 180) / 360 * 256 * 2 ** z, my = (lat, z) => (1 - Math.log(Math.tan(lat * rad) + 1 / Math.cos(lat * rad)) / Math.PI) / 2 * 256 * 2 ** z;
    let z = 19; while (z > 2 && (mx(lo1, z) - mx(lo0, z) > w * 1.0 || my(la0, z) - my(la1, z) > h * 1.0)) z--;
    const cxp = (mx(lo0, z) + mx(lo1, z)) / 2, cyp = (my(la0, z) + my(la1, z)) / 2, sc = Math.min(w / (mx(lo1, z) - mx(lo0, z)), h / (my(la0, z) - my(la1, z)));
    const X = lon => w / 2 + (mx(lon, z) - cxp) * sc, Y = lat => h / 2 + (my(lat, z) - cyp) * sc;
    const tx0 = Math.floor((cxp - w / 2 / sc) / 256), tx1 = Math.floor((cxp + w / 2 / sc) / 256), ty0 = Math.floor((cyp - h / 2 / sc) / 256), ty1 = Math.floor((cyp + h / 2 / sc) / 256);
    const url = (x, y) => F.base === 'osm' ? 'https://tile.openstreetmap.org/' + z + '/' + x + '/' + y + '.png' : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + z + '/' + y + '/' + x;
    const jobs = []; let ok = 0; for (let tx = tx0; tx <= tx1; tx++) for (let ty = ty0; ty <= ty1; ty++) jobs.push(new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { try { c.drawImage(im, w / 2 + (tx * 256 - cxp) * sc, h / 2 + (ty * 256 - cyp) * sc, 256 * sc + 1, 256 * sc + 1); ok++; } catch (e) {} res(); }; im.onerror = () => res(); im.src = url(tx, ty); setTimeout(res, 12000); }));
    await Promise.all(jobs);
    try { c.getImageData(0, 0, 1, 1); } catch (e) { c.fillStyle = '#E9E6DE'; c.fillRect(0, 0, w, h); ok = 0; }   // a tile without permission would block the export: draw without tiles
    const u = small ? w / 600 : w / 900, path = () => { c.beginPath(); F.pts.forEach((p, i) => i ? c.lineTo(X(p[1]), Y(p[0])) : c.moveTo(X(p[1]), Y(p[0]))); c.closePath(); };
    if (!ok) { c.fillStyle = '#F4F1E8'; path(); c.fill(); }
    if (typeof withIdx === 'string' && withIdx.indexOf('prec:') === 0) { const pic = FieldPrec.picture(withIdx.slice(5)); if (pic) { const b = pic.bounds; c.save(); c.globalAlpha = 0.9; c.drawImage(pic.cv, X(b[0][1]), Y(b[1][0]), X(b[1][1]) - X(b[0][1]), Y(b[0][0]) - Y(b[1][0])); c.restore(); } }
    else if (withIdx === 'cover' && F.cv) { const im = new Image(); await new Promise(r => { im.onload = r; im.onerror = r; im.src = F.cv.url; }); const b = F.cv.bounds; c.save(); path(); c.clip(); c.globalAlpha = 0.9; c.drawImage(im, X(b[0][1]), Y(b[1][0]), X(b[1][1]) - X(b[0][1]), Y(b[0][0]) - Y(b[1][0])); c.restore(); }
    else if (withIdx && F.res) { const G = F.res.G, rc = fieldCanvas(key || F.idx, opt.view || (F.view === 'cover' ? 'cont' : F.view), F.smooth, Math.min(2400, Math.max(w, h))); c.save(); path(); c.clip(); c.imageSmoothingEnabled = F.smooth; c.globalAlpha = 0.92; c.drawImage(rc, X(G.nw[1]), Y(G.nw[0]), X(G.ne[1]) - X(G.nw[1]), Y(G.sw[0]) - Y(G.nw[0])); c.restore(); }
    // the irrigation layout of the sketch
    const D = F.lay ? layoutData() : null;
    if (opt.sources && F.site) { F.site.water.list.slice(0, 8).forEach(s2 => { const a = [X(s2.at[1]), Y(s2.at[0])]; if (s2 === F.site.water.best && s2.d > 0) { c.strokeStyle = '#00B8D4'; c.lineWidth = 2.5 * u; c.setLineDash([8 * u, 5 * u]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(X(s2.edge[1]), Y(s2.edge[0])); c.stroke(); c.setLineDash([]); } c.fillStyle = s2 === F.site.water.best ? '#0091EA' : '#00B0FF'; c.beginPath(); c.arc(a[0], a[1], 7 * u, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5 * u; c.stroke(); }); }
    if (D) { const o2 = [D.lat, D.lon], P2 = q2 => { const l = unlocal(q2, o2); return [X(l[1]), Y(l[0])]; }, sty = { lateral: ['#4FC3F7', 1], 'sprinkler lateral': ['#4FC3F7', 1.2], furrow: ['#D7B98E', 1], border: ['#E0C38C', 1.4], basin: ['#E0C38C', 1.8], submain: ['#1565C0', 4], 'head ditch': ['#1E88E5', 5], mainline: ['#0A246A', 3.2] };
      D.lines.forEach(l => { const st = sty[l.kind] || ['#4FC3F7', 1], a = P2(l.pts[0]), b = P2(l.pts[1]); if (st[1] > 2) { c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = (st[1] + 2.5) * u; c.setLineDash([]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
        const thin = st[1] < 2; c.strokeStyle = thin && withIdx && F.res ? 'rgba(255,255,255,0.4)' : st[0]; c.lineWidth = Math.max(0.6, st[1] * u * (small ? 0.7 : 1) * (thin && withIdx && F.res ? 0.6 : 1)); c.setLineDash(l.kind === 'mainline' ? [10 * u, 6 * u] : []); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); c.setLineDash([]);
      D.pts.forEach(q2 => { const a = P2(q2.p); if (q2.kind === 'sprinkler') { c.fillStyle = '#E1F5FE'; c.beginPath(); c.arc(a[0], a[1], 1.6 * u, 0, 6.283); c.fill(); }
        else if (q2.kind === 'source') { c.fillStyle = '#1565C0'; c.beginPath(); c.arc(a[0], a[1], 9 * u, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5 * u; c.stroke(); c.fillStyle = '#fff'; c.font = 'bold ' + Math.round(9 * u) + 'px sans-serif'; c.textAlign = 'center'; c.fillText('W', a[0], a[1] + 3.2 * u); }
        else if (q2.kind === 'inlet') { c.fillStyle = '#F2C230'; c.strokeStyle = '#5A4500'; c.lineWidth = 1.2 * u; c.fillRect(a[0] - 5 * u, a[1] - 5 * u, 10 * u, 10 * u); c.strokeRect(a[0] - 5 * u, a[1] - 5 * u, 10 * u, 10 * u); } }); }
    c.strokeStyle = F.res ? '#FFFFFF' : '#FFD600'; c.lineWidth = 2.6 * u; path(); c.stroke(); c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 0.8 * u; path(); c.stroke();
    if (!small) { c.font = 'bold ' + Math.round(10 * u) + 'px sans-serif'; F.pts.forEach((p, i) => { c.fillStyle = '#FFD600'; c.beginPath(); c.arc(X(p[1]), Y(p[0]), 7 * u, 0, 6.283); c.fill(); c.fillStyle = '#111'; c.textAlign = 'center'; c.fillText(String(i + 1), X(p[1]), Y(p[0]) + 3.5 * u); }); }
    // north arrow, scale bar, frame with the coordinates of the edges
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(w - 46 * u, 10 * u, 36 * u, 50 * u); c.fillStyle = '#111'; c.beginPath(); c.moveTo(w - 28 * u, 16 * u); c.lineTo(w - 36 * u, 40 * u); c.lineTo(w - 20 * u, 40 * u); c.closePath(); c.fill(); c.fillText('N', w - 28 * u, 54 * u);
    const mpp = 156543.03392 * Math.cos((la0 + la1) / 2 * rad) / 2 ** z / sc, nice = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000], target = w * 0.22 * mpp, bar = nice.reduce((b, v) => v <= target ? v : b, 1), bw = bar / mpp;
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(10 * u, h - 34 * u, bw + 20 * u, 26 * u); c.fillStyle = '#111'; c.fillRect(20 * u, h - 18 * u, bw, 4 * u); c.textAlign = 'center'; c.font = Math.round(10 * u) + 'px sans-serif'; c.fillText(bar >= 1000 ? bar / 1000 + ' km' : bar + ' m', 20 * u + bw / 2, h - 22 * u);
    c.strokeStyle = '#111'; c.lineWidth = 1.2 * u; c.strokeRect(0.5, 0.5, w - 1, h - 1);
    const lat = yy => { const n = Math.PI - 2 * Math.PI * yy / (256 * 2 ** z); return Math.atan(Math.sinh(n)) / rad; }, lon = xx => xx / (256 * 2 ** z) * 360 - 180;
    // graticule: lines of latitude and longitude with their values in degrees, minutes and seconds
    if (!small) { const N0 = lat(cyp - h / 2 / sc), S0 = lat(cyp + h / 2 / sc), W0 = lon(cxp - w / 2 / sc), E0 = lon(cxp + w / 2 / sc), steps = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 18000].map(v => v / 3600);
      const pick = span => steps.find(v => span / v <= 5) || steps[steps.length - 1], dl = pick(E0 - W0), dp = pick(N0 - S0), lab = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a + 1e-9), mm = Math.floor((a - d) * 60 + 1e-7), ss = Math.round(((a - d) * 60 - mm) * 60); return d + '°' + String(mm).padStart(2, '0') + '′' + String(ss % 60).padStart(2, '0') + '″' + (v < 0 ? neg : pos); };
      c.save(); c.setLineDash([4 * u, 4 * u]); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.8 * u; c.font = Math.round(8.5 * u) + 'px sans-serif';
      for (let v = Math.ceil(W0 / dl) * dl; v < E0; v += dl) { const x = X(v); c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); const t = lab(v, 'E', 'W'), tw = c.measureText(t).width + 6 * u; c.fillStyle = 'rgba(255,255,255,0.88)'; c.fillRect(x - tw / 2, 0, tw, 13 * u); c.fillStyle = '#111'; c.textAlign = 'center'; c.fillText(t, x, 10 * u); }
      for (let v = Math.ceil(S0 / dp) * dp; v < N0; v += dp) { const y = Y(v); if (y < 16 * u || y > h - 40 * u) continue; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); const t = lab(v, 'N', 'S'), tw = c.measureText(t).width + 6 * u; c.fillStyle = 'rgba(255,255,255,0.88)'; c.fillRect(0, y - 7 * u, tw, 13 * u); c.fillStyle = '#111'; c.textAlign = 'left'; c.fillText(t, 3 * u, y + 3 * u); }
      c.restore(); }
    return { cv, tiles: ok, z, edges: { n: lat(cyp - h / 2 / sc), s: lat(cyp + h / 2 / sc), w: lon(cxp - w / 2 / sc), e: lon(cxp + w / 2 / sc) } };
  }
  async function exportReport() {
    if (!need()) return; const st = document.getElementById('fmStat'); st.textContent = 'Building the report at ' + F.dpi + ' dpi...';
    try {
      const dpi = F.dpi, W = Math.round(8.27 * dpi), H = Math.round(11.69 * dpi), k = dpi / 72, pages = [];
      const A = areaM2(F.pts), P = perim(F.pts), cen = centroid(F.pts), now = new Date();
      const page = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); pages.push(cv);
        const T = (t, x, y, s, o) => { o = o || {}; c.font = (o.b ? 'bold ' : '') + (o.i ? 'italic ' : '') + Math.round(s * k) + 'px sans-serif'; c.fillStyle = o.c || '#111'; c.textAlign = o.a || 'left'; c.fillText(t, x * k, y * k); };
        const wrap = (t, x, y, w, s, o) => { o = o || {}; c.font = (o.b ? 'bold ' : '') + Math.round(s * k) + 'px sans-serif'; const words = String(t).split(' '); let line = '', yy = y; words.forEach(wd => { const tt = line ? line + ' ' + wd : wd; if (c.measureText(tt).width > w * k && line) { T(line, x, yy, s, o); yy += s * 1.35; line = wd; } else line = tt; }); if (line) { T(line, x, yy, s, o); yy += s * 1.35; } return yy; };
        const head = sub => { c.fillStyle = '#0A246A'; c.fillRect(0, 0, W, 54 * k); T(F.title || 'Field report', 36, 34, 18, { b: true, c: '#fff' }); T('SWAFL 1.1.0' + (sub ? ' · ' + sub : ''), 559, 34, 10, { c: '#DDE6F5', a: 'right' }); };
        const foot = (M, n) => T((M ? 'Map tiles at zoom ' + M.z + ' (' + (M.tiles ? (F.base === 'osm' ? '© OpenStreetMap contributors' : 'Imagery © Esri, Maxar, Earthstar Geographics') : 'no imagery: offline') + '). ' : '') + (F.author ? 'Author ' + F.author + '. ' : '') + 'Made with SWAFL 1.1.0 · ' + now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC · ' + dpi + ' dpi · page ' + n, 36, 828, 7.2, { c: '#666' });
        const ramp = (kk, x, y, w) => { const I = IDX[kk]; for (let i = 0; i < 200; i++) { const col = colour(kk, I.lo + (I.hi - I.lo) * i / 199); c.fillStyle = 'rgb(' + col.join(',') + ')'; c.fillRect((x + i * w / 200) * k, (y - 8) * k, (w / 200 + 0.2) * k, 9 * k); } T(String(I.lo), x - 3, y, 7.5, { a: 'right' }); T(String(I.hi), x + w + 3, y, 7.5); };
        return { cv, c, T, wrap, head, foot, ramp }; };
      // page 1: the field, the map with the chosen index, the coordinates and the table
      const p1 = page(), { c, T, wrap } = p1; p1.head(F.res ? F.res.date : '');
      let y = 76; T('Author: ' + (F.author || 'not given') + (F.org ? ' · ' + F.org : ''), 36, y, 10); T('Date: ' + now.toISOString().slice(0, 10), 559, y, 10, { a: 'right' }); y += 15;
      T((F.place ? 'Place: ' + F.place + ' · ' : '') + 'Centre ' + cen[0].toFixed(6) + ', ' + cen[1].toFixed(6) + ' (' + dms(cen[0], 'N', 'S') + ' ' + dms(cen[1], 'E', 'W') + ') · WGS 84 (EPSG:4326)', 36, y, 9, { c: '#333' }); y += 12;
      const mw = 523 * k, mh = 320 * k, M = await mapImage(Math.round(mw), Math.round(mh), F.view === 'cover' && F.cv ? 'cover' : true, F.idx); c.drawImage(M.cv, 36 * k, y * k, mw, mh);
      T('N edge ' + M.edges.n.toFixed(5) + '°', 559, y - 2, 7.5, { a: 'right', c: '#555' }); T('W edge ' + M.edges.w.toFixed(5) + '°', 36, y + 320 + 9, 7.5, { c: '#555' }); T('E edge ' + M.edges.e.toFixed(5) + '°', 559, y + 320 + 9, 7.5, { a: 'right', c: '#555' }); T('S edge ' + M.edges.s.toFixed(5) + '°', 36 + 523 / 2, y + 320 + 9, 7.5, { a: 'center', c: '#555' });
      y += 320 + 24;
      if (F.view === 'cover' && F.cv) { T('Land cover read from the satellite photo (image analysis)', 36, y, 9.5, { b: true }); let xx = 330; F.cv.shares.forEach(cc => { if (cc.pct < 0.5) return; c.fillStyle = cc.col; c.fillRect(xx * k, (y - 8) * k, 9 * k, 9 * k); T(cc.pct.toFixed(0) + '%', xx + 11, y, 7.5); xx += 38; }); y += 18; }
      else if (F.res) { T(F.idx + ' on the map' + (F.view === 'zones' ? ' (zones)' : '') + ': ' + IDX[F.idx].name, 36, y, 9.5, { b: true }); if (F.view === 'zones') { const Zt = zones(F.idx); for (let i = 0; i < 5; i++) { c.fillStyle = 'rgb(' + zoneCol(F.idx, i).join(',') + ')'; c.fillRect((380 + i * 34) * k, (y - 8) * k, 34 * k, 9 * k); } T('zone 1', 376, y, 7.5, { a: 'right' }); T('5', 554, y, 7.5); } else p1.ramp(F.idx, 380, y, 160); y += 18; }
      { const D = F.lay ? layoutData() : null; if (D) y = wrap('Irrigation layout: ' + D.label + '; thick blue line: ' + (D.sys === 'border' || D.sys === 'furrow' || D.sys === 'basin' ? 'head ditch' : 'submain') + '; dashed: mainline from the water source (W) to the inlet (yellow square).', 36, y - 4, 523, 7.8, { c: '#333' }) + 6; }
      T('The field', 36, y, 12, { b: true, c: '#0A246A' }); y += 14;
      [['Area', (A / 1e4).toFixed(3) + ' ha (' + Math.round(A).toLocaleString('en-US') + ' m²)'], ['Perimeter', Math.round(P).toLocaleString('en-US') + ' m'], ['Corners', String(F.pts.length)]].forEach(r => { T(r[0], 40, y, 9.5, { c: '#444' }); T(r[1], 160, y, 9.5, { b: true }); y += 13; });
      { const n = F.pts.length, cols = n > 8 ? 3 : n > 3 ? 2 : 1, per = Math.ceil(n / cols); T('Corner coordinates (lat, lon, WGS 84)', 40, y, 9, { b: true }); y += 12; for (let i = 0; i < per; i++) { for (let cc = 0; cc < cols; cc++) { const q2 = cc * per + i; if (q2 >= n) continue; T((q2 + 1) + '.  ' + F.pts[q2][0].toFixed(6) + ', ' + F.pts[q2][1].toFixed(6), 44 + cc * 175, y, 8.2, { c: '#222' }); } y += 11; if (y > 640) { T('(all corners are in the CSV and GeoJSON exports)', 44, y, 8, { c: '#666' }); y += 11; break; } } y += 6; }
      if (F.res) { T('Vegetation and water indices', 36, y, 12, { b: true, c: '#0A246A' }); y += 14; const cx = [40, 92, 140, 200, 262, 330];
        ['Index', 'Mean', 'SD', '10–90 %', 'Min · max', 'Reading of the mean'].forEach((t, i) => T(t, cx[i], y, 8.5, { b: true })); y += 4; c.fillStyle = '#999'; c.fillRect(36 * k, y * k, 523 * k, 0.6 * k); y += 10;
        RK().forEach(kk => { const s2 = F.res.S[kk]; [kk, f2(s2 && s2.mean), f2(s2 && s2.sd), s2 ? f2(s2.p10) + '–' + f2(s2.p90) : '-', s2 ? f2(s2.min) + ' · ' + f2(s2.max) : '-'].forEach((t, i) => T(t, cx[i], y, 8.5, { b: i === 0 })); const yy = wrap(s2 ? IDX[kk].read(s2.mean) : 'no clear cells', cx[5], y, 225, 8.2); y = Math.max(y + 15, yy + 3); });
        y = wrap('Source: ' + F.res.src, 36, y + 2, 523, 8, { c: '#444' }) + 2;
        const Zt = zones(F.idx); if (Zt && y < 742) { y += 6; T('Management zones of ' + F.idx + ' (natural breaks)', 36, y, 10, { b: true, c: '#0A246A' }); y += 12; const zx = [40, 60, 110, 210, 270, 340];
          ['', 'Zone', 'Range', 'Mean', 'Area', 'Share of the field'].forEach((t, i) => T(t, zx[i], y, 8.2, { b: true })); y += 10;
          Zt.Z.forEach((z, i) => { c.fillStyle = 'rgb(' + zoneCol(F.idx, i).join(',') + ')'; c.fillRect(40 * k, (y - 7) * k, 12 * k, 8 * k); [String(i + 1) + (i === 0 ? ' low' : i === 4 ? ' high' : ''), f2(Zt.br[i]) + ' to ' + f2(Zt.br[i + 1]), f2(z.mean), z.ha.toFixed(3) + ' ha'].forEach((t, j) => T(t, zx[j + 1], y, 8.2)); c.fillStyle = 'rgb(' + zoneCol(F.idx, i).join(',') + ')'; c.fillRect(zx[5] * k, (y - 7) * k, Math.max(0.5, z.pct * 1.6) * k, 8 * k); T(z.pct.toFixed(1) + ' %', zx[5] + z.pct * 1.6 + 4, y, 8.2); y += 11; }); } }
      if (y < 790) wrap('Bands: NDVI (Red, NIR), EVI (Blue, Red, NIR), SAVI (Red, NIR, L = 0.5), NDRE (Red Edge, NIR), NDWI (NIR, SWIR, after Gao). Sentinel-2 bands B02, B04, B05, B08 and B11, cloud and shadow cells removed with the scene classification.', 36, y + 4, 523, 7.6, { c: '#555' });
      p1.foot(M, 1);
      // page 2: the five indices side by side, their spread over the field and what they say together
      if (F.res) { const p2 = page(); p2.head(F.res.date); p2.T('The five indices of the field', 36, 80, 13, { b: true, c: '#0A246A' }); p2.wrap(F.res.src, 36, 95, 523, 8, { c: '#444' });
        const bw = 255, bh = 126, pos = (i) => [36 + (i % 2) * 268, 124 + Math.floor(i / 2) * 234];
        for (let i = 0; i < RK().length; i++) { const kk = RK()[i], [x, yb] = pos(i), s2 = F.res.S[kk], Mi = await mapImage(Math.round(bw * k), Math.round(bh * k), true, kk, true);
          p2.T(kk + ' · ' + IDX[kk].bands, x, yb - 4, 9.5, { b: true }); p2.c.drawImage(Mi.cv, x * k, yb * k, bw * k, bh * k); p2.ramp(kk, x + 14, yb + bh + 13, bw - 30);
          // histogram of the cells
          const q = RK().indexOf(kk), I = IDX[kk], nb = 30, hb = new Array(nb).fill(0); F.res.vals[q].forEach(v => { if (isFinite(v)) hb[Math.max(0, Math.min(nb - 1, Math.floor((v - I.lo) / (I.hi - I.lo) * nb)))]++; }); const hm = Math.max(1, ...hb);
          hb.forEach((h2, j) => { const col = colour(kk, I.lo + (I.hi - I.lo) * (j + 0.5) / nb); p2.c.fillStyle = 'rgb(' + col.join(',') + ')'; const hh = 26 * h2 / hm; p2.c.fillRect((x + 14 + j * (bw - 30) / nb) * k, (yb + bh + 46 - hh) * k, ((bw - 30) / nb - 0.5) * k, hh * k); });
          p2.c.fillStyle = '#777'; p2.c.fillRect((x + 14) * k, (yb + bh + 46) * k, (bw - 30) * k, 0.6 * k);
          p2.T(s2 ? 'mean ' + f2(s2.mean) + ' · 10–90 % ' + f2(s2.p10) + ' to ' + f2(s2.p90) + ' · ' + s2.n + ' cells' : 'no clear cells', x, yb + bh + 58, 7.8, { c: '#222' });
          p2.wrap(IDX[kk].use + (s2 ? '. Here: ' + IDX[kk].read(s2.mean) + '.' : ''), x, yb + bh + 69, bw, 7.6, { c: '#444' }); }
        const [ax, ay] = pos(5); p2.T('What the indices say together', ax, ay - 4, 9.5, { b: true }); let yy = ay + 8; advice().forEach(t => { yy = p2.wrap('• ' + t, ax, yy, bw, 8.2) + 3; });
        p2.foot(null, 2); }
      { const groups = [[['mzone', 'Monitoring zones of the Sentinel-2 season'], ['vri', 'Variable-rate irrigation: net depth of the next irrigation of each zone']], [['gully', 'Ephemeral gully risk and predicted gullies'], ['rusle', 'Soil loss, RUSLE (t/ha/yr)']]];
        for (let gi = 0; gi < 2; gi++) { const two = groups[gi].filter(q => FieldPrec.has(q[0])); if (!two.length) continue; const p4 = page(); p4.head(gi ? 'erosion' : 'season and irrigation'); let y4 = 80; p4.T(gi ? 'Erosion of the field: ephemeral gullies and soil loss' : 'The season of the field and its variable-rate irrigation', 36, y4, 13, { b: true, c: '#0A246A' }); y4 += 12; const mh4 = 250;
          for (const [v, t] of two) { p4.T(t, 36, y4 + 10, 9.5, { b: true }); const Mi = await mapImage(Math.round(523 * k), Math.round(mh4 * k), 'prec:' + v, null, false); p4.c.drawImage(Mi.cv, 36 * k, (y4 + 14) * k, 523 * k, mh4 * k);
            const lg = document.createElement('div'); lg.innerHTML = FieldPrec.legend(v); const rows4 = [...lg.querySelectorAll('tr')].map(tr => [tr.querySelector('i') ? tr.querySelector('i').style.background : '#999', [...tr.querySelectorAll('td')].slice(1).map(td => td.textContent).join(' ')]); let lx = 36, ly = y4 + 14 + mh4 + 12; rows4.forEach(([col, txt]) => { p4.c.font = Math.round(7.8 * k) + 'px sans-serif'; const tw = p4.c.measureText(txt).width / k + 18; if (lx + tw > 559) { lx = 36; ly += 10; } p4.c.fillStyle = col; p4.c.fillRect(lx * k, (ly - 7) * k, 9 * k, 7 * k); p4.T(txt, lx + 12, ly, 7.8); lx += tw; }); y4 = ly + 8; }
          const pn = document.getElementById('fmPrecRes'), ad = pn ? [...pn.querySelectorAll('.fmadv')] : [], txt = ad[gi === 0 ? 0 : ad.length - 1] ? ad[gi === 0 ? 0 : ad.length - 1].textContent : '', mon = document.querySelector('#fmMonRes .fmadv');
          if (gi === 0 && mon) y4 = p4.wrap(mon.textContent, 36, y4 + 4, 523, 8, { c: '#333' }) + 2; if (txt && (gi === 1 || FieldPrec.has('vri'))) p4.wrap(txt, 36, Math.min(y4 + 4, 790), 523, 8, { c: '#333' });
          p4.foot(null, pages.length); } }
      if (F.cv || F.site) { const p3 = page(); p3.head('the site'); let y3 = 80; p3.T('The site: land cover, soil, slope, water sources and the irrigation system', 36, y3, 13, { b: true, c: '#0A246A' }); y3 += 12;
        const M3 = await mapImage(Math.round(523 * k), Math.round(250 * k), F.cv ? 'cover' : false, null, false, { sources: true, extent: F.site ? F.site.water.list.slice(0, 8).filter(w2 => w2.d < 1200).map(w2 => w2.at) : [] }); p3.c.drawImage(M3.cv, 36 * k, y3 * k, 523 * k, 250 * k); y3 += 262;
        if (F.cv) { y3 = p3.wrap('Land cover read from the satellite photo by image analysis (colour and texture of every pixel, k-means clustering, named by rules, majority filter; ' + F.cv.mpp.toFixed(1) + ' m per pixel):', 36, y3, 523, 8.2, { c: '#333' });
          F.cv.shares.forEach((cc, i) => { const xx = 40 + (i % 2) * 262, yy = y3 + Math.floor(i / 2) * 12; p3.c.fillStyle = cc.col; p3.c.fillRect(xx * k, (yy - 7) * k, 9 * k, 8 * k); p3.T(cc.name + ': ' + cc.pct.toFixed(1) + ' % (' + cc.ha.toFixed(2) + ' ha)', xx + 13, yy, 8); }); y3 += 42; }
        const S3 = F.site;
        if (S3) { const so = S3.soil, tp = S3.topo; p3.T('Soil (SoilGrids)', 36, y3, 9, { b: true }); p3.T(so ? so.cls + ': sand ' + so.sand.toFixed(0) + ' %, silt ' + so.silt.toFixed(0) + ' %, clay ' + so.clay.toFixed(0) + ' %' : 'not reached', 175, y3, 9); y3 += 12;
          p3.T('Ground (Copernicus DEM)', 36, y3, 9, { b: true }); p3.T(tp ? 'elevation ' + tp.min.toFixed(0) + ' to ' + tp.max.toFixed(0) + ' m, slope ' + tp.slope.toFixed(2) + ' % falling to the ' + tp.to : 'not reached', 175, y3, 9); y3 += 16;
          p3.T('Where to take the water from', 36, y3, 11, { b: true, c: '#0A246A' }); y3 += 12; y3 = p3.wrap(S3.water.advice, 36, y3, 523, 8.6, { b: true }) + 2;
          const cx3 = [40, 175, 255, 290]; ['Source', 'Distance', 'Score', 'Why'].forEach((t, i) => p3.T(t, cx3[i], y3, 8, { b: true })); y3 += 10;
          S3.water.list.slice(0, 6).forEach(w2 => { p3.T((w2.name || '(no name)').slice(0, 26), cx3[0], y3, 7.8, { b: true }); p3.T(w2.type, cx3[0], y3 + 9, 7, { c: '#555' }); p3.T(w2.d > 0 ? Math.round(w2.d) + ' m ' + w2.dir : 'in the field', cx3[1], y3, 7.8); p3.T(String(w2.score), cx3[2], y3, 7.8, { b: true }); const yy = p3.wrap(w2.why.join('; '), cx3[3], y3, 268, 7.2, { c: '#333' }); y3 = Math.max(y3 + 20, yy + 2); });
          y3 += 4; p3.T('Which irrigation system suits this field', 36, y3, 11, { b: true, c: '#0A246A' }); y3 += 12;
          S3.systems.list.forEach((x, i) => { if (y3 > 790) return; p3.T(x.name + (i === 0 ? ' (best)' : ''), 40, y3, 8.4, { b: true }); p3.T(String(x.score), 175, y3, 8.4, { b: true }); const yy = p3.wrap(x.why.join('; ') || 'no strong reason for or against', 200, y3, 358, 7.4, { c: '#333' }); y3 = Math.max(y3 + 13, yy + 2); });
          p3.wrap('Open data: water features © OpenStreetMap contributors (Overpass API); elevation Copernicus DEM GLO-90 (Open-Meteo); soil ISRIC SoilGrids 250 m; photo © Esri, Maxar, Earthstar Geographics. Scores follow the FAO and USDA guidance for choosing an irrigation system; check on the ground.', 36, Math.min(y3 + 4, 806), 523, 7, { c: '#666' }); }
        p3.foot(M3, pages.length); }
      const name = fileBase() + (F.res ? '_' + F.res.date.replace(/ /g, '_') : '');
      if (F.fmt === 'png') { for (let i = 0; i < pages.length; i++) await UI.saveFile(name + (pages.length > 1 ? '_page' + (i + 1) : '') + '.png', pngWithDpi(pages[i].toDataURL('image/png'), dpi), true, 'image/png'); }
      else { const pdf = pdfFromJpeg(pages.map(cv => cv.toDataURL('image/jpeg', 0.92)), W, H, { Title: F.title || 'Field report', Author: F.author || '', Subject: 'Field at ' + cen[0].toFixed(6) + ', ' + cen[1].toFixed(6) + ' (WGS 84), ' + (A / 1e4).toFixed(3) + ' ha', Keywords: 'SWAFL, NDVI, EVI, SAVI, NDRE, NDWI, ' + (F.place || ''), Creator: 'SWAFL 1.1.0' + (F.org ? ' · ' + F.org : '') }); await UI.saveFile(name + '.pdf', pdf, true, 'application/pdf'); }
      st.textContent = 'Report saved: ' + pages.length + ' page' + (pages.length > 1 ? 's' : '') + ', ' + W + ' × ' + H + ' pixels each, ' + dpi + ' dpi.';
    } catch (e) { st.textContent = 'The report could not be made: ' + (e.message || e); }
  }
  // PNG with its resolution written in (pHYs chunk), so the image prints at the chosen dpi
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
  const b64ToBytes = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const bytesToB64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  function pngWithDpi(dataUrl, dpi) {
    const src = b64ToBytes(dataUrl.split(',')[1]), ppm = Math.round(dpi / 0.0254), ch = new Uint8Array(21), dv = new DataView(ch.buffer); dv.setUint32(0, 9); ch.set([112, 72, 89, 115], 4); dv.setUint32(8, ppm); dv.setUint32(12, ppm); ch[16] = 1; dv.setUint32(17, CRC(ch.subarray(4, 17)));
    const out = new Uint8Array(src.length + 21); out.set(src.subarray(0, 33), 0); out.set(ch, 33); out.set(src.subarray(33), 54); return bytesToB64(out);
  }
  // a one-page A4 PDF holding the report image, with the title, author, subject (coordinates) and keywords in its properties
  function pdfFromJpeg(urls, w, h, meta) {
    if (!Array.isArray(urls)) urls = [urls]; const N = urls.length, enc = new TextEncoder(), parts = [], offs = []; let len = 0; const put = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    const str = s2 => '(' + String(s2).replace(/[\\()]/g, m2 => '\\' + m2).replace(/[^\x20-\x7E]/g, ch => { const c2 = ch.charCodeAt(0); return c2 < 256 ? '\\' + c2.toString(8).padStart(3, '0') : '?'; }) + ')';
    const obj = (n, body) => { offs[n] = len; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); };
    put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'); const pg = i => 4 + i * 3, info = 4 + N * 3, cs = 'q 595.28 0 0 841.89 0 0 cm /Im1 Do Q';
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>'); obj(2, '<< /Type /Pages /Kids [' + urls.map((u, i) => pg(i) + ' 0 R').join(' ') + '] /Count ' + N + ' >>'); obj(3, '<< >>');
    urls.forEach((u, i) => { const jpg = b64ToBytes(u.split(',')[1]), n = pg(i);
      obj(n, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 ' + (n + 1) + ' 0 R >> >> /Contents ' + (n + 2) + ' 0 R >>');
      offs[n + 1] = len; put((n + 1) + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n'); put(jpg); put('\nendstream\nendobj\n');
      obj(n + 2, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream'); });
    const d = new Date(), pd = 'D:' + d.toISOString().replace(/[-:T]/g, '').slice(0, 14) + 'Z';
    obj(info, '<< ' + Object.keys(meta).map(k2 => '/' + k2 + ' ' + str(meta[k2])).join(' ') + ' /Producer (SWAFL 1.1.0) /CreationDate (' + pd + ') >>');
    const xref = len; let t = 'xref\n0 ' + (info + 1) + '\n0000000000 65535 f \n'; for (let n = 1; n <= info; n++) t += String(offs[n]).padStart(10, '0') + ' 00000 n \n'; put(t); put('trailer\n<< /Size ' + (info + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    const all = new Uint8Array(len); let o = 0; parts.forEach(b => { all.set(b, o); o += b.length; }); return bytesToB64(all);
  }
  // what the five indices say together: water stress, nitrogen, evenness of the field
  function advice() {
    if (F.res.photo) { const S = F.res.S, v = S.VARI ? S.VARI.mean : NaN, out = [];
      out.push(v < 0 ? 'The photo shows mostly bare soil or dry plants (VARI ' + f2(v) + ').' : v < 0.12 ? 'The photo shows sparse or stressed vegetation (VARI ' + f2(v) + ').' : 'The photo shows green vegetation (VARI ' + f2(v) + ').');
      if (F.cv) { const c = F.cv.shares; out.push('Land cover: ' + c.filter(x => x.pct >= 1).map(x => x.name.toLowerCase() + ' ' + x.pct.toFixed(0) + ' %').join(', ') + '.'); if (c[4].pct > 5) out.push('Buildings, roads or hard surfaces take ' + c[4].pct.toFixed(0) + ' % of the outline: leave them out of the irrigated area.'); if (c[3].pct > 2) out.push('Water or very wet ground covers ' + c[3].pct.toFixed(0) + ' %: check the drainage.'); }
      const s = S.VARI; if (s && s.p90 - s.p10 > 0.15) out.push('The cover is uneven (VARI 10–90 % from ' + f2(s.p10) + ' to ' + f2(s.p90) + '): look at the weak zones on the map.');
      out.push('The photo is a mosaic of dates; for the crop of this season use the Sentinel-2 indices (NDVI and the others).'); return out; }
    const S = F.res.S, g = k2 => S[k2] ? S[k2].mean : NaN, out = [], nd = g('NDVI'), nw = g('NDWI'), re = g('NDRE'), sv = g('SAVI'), ev = g('EVI');
    if (nd < 0.2) out.push('The field is bare or the crop has just emerged (NDVI ' + f2(nd) + '). SAVI (' + f2(sv) + ') is the index to follow until the crop covers the soil.');
    else { if (nw < 0) out.push('The canopy is dry for its greenness (NDWI ' + f2(nw) + ' with NDVI ' + f2(nd) + '): water stress is likely; check the sensor and irrigate if the trigger is reached.'); else if (nw < 0.15) out.push('Moderate canopy water (NDWI ' + f2(nw) + '): keep to the schedule and watch the trigger.'); else out.push('The canopy is well watered (NDWI ' + f2(nw) + ').');
      if (re / nd < 0.45 && nd > 0.4) out.push('Chlorophyll is low for the biomass (NDRE / NDVI ' + (re / nd).toFixed(2) + '): check the nitrogen; a split application may help.'); else out.push('Chlorophyll matches the biomass (NDRE ' + f2(re) + '): no sign of nitrogen shortage.');
      if (nd > 0.7) out.push('NDVI is near saturation (' + f2(nd) + '); EVI (' + f2(ev) + ') separates the dense parts better.'); }
    const s = S.NDVI; if (s && s.p90 - s.p10 > 0.12) out.push('The field is uneven (NDVI 10–90 % from ' + f2(s.p10) + ' to ' + f2(s.p90) + '): check the uniformity of the irrigation, the soil and the drainage in the weak parts.'); else if (s) out.push('The field is even (NDVI 10–90 % within ' + f2(s.p90 - s.p10) + ').');
    out.push(F.src === 'sim' || /Simulated/.test(F.res.src) ? 'These values are simulated by SWAFL; compare with a Sentinel-2 scene when the internet is available.' : 'Satellite values describe the date of the scene; the soil water and crop of other dates come from the SWAFL daily model.');
    return out;
  }
  // ------------------------------------------------------------------ the site: sources and systems
  function clearSite() { if (F.srcLay && F.map) F.map.removeLayer(F.srcLay); F.srcLay = null; const r = document.getElementById('fmSiteRes'); if (r) r.innerHTML = ''; }
  async function siteRun() {
    if (F.pts.length < 3) { UI.toast('Demarcate the field first'); return; } const st = document.getElementById('fmSiteSt');
    try { if (!F.cv) { try { const ph = await FieldSite.readField(F, st); F.cv = ph.cv; if (!F.res) { F.res = ph.res; F.idx = 'VARI'; showRes(); } } catch (e) {} }
      F.site = await FieldSite.analyse(F, st); st.textContent = 'Site analysed ' + new Date().toLocaleString() + (F.site.log.length ? '. Not reached: ' + F.site.log.join('; ') : '.'); showSite(); }
    catch (e) { st.innerHTML = '<b style="color:#B01E14">The site could not be analysed: ' + esc(e.message || e) + '</b>'; }
  }
  const ICON = { river: '&#8776;', canal: '&#8776;', stream: '&#8776;', ditch: '&#8776;', drain: '&#8776;', well: 'W', borehole: 'B', spring: 'S' };
  function showSite() {
    const S = F.site, el = document.getElementById('fmSiteRes'); if (!S || !el) return; const T2 = S.topo, so = S.soil, sy = S.systems;
    let h = '<table class="tbl fmtab"><tr><td>Soil (SoilGrids, 0–60 cm)</td><td>' + (so ? '<b>' + so.cls + '</b>: sand ' + so.sand.toFixed(0) + ' %, silt ' + so.silt.toFixed(0) + ' %, clay ' + so.clay.toFixed(0) + ' %' + (isFinite(so.soc) ? ', organic carbon ' + so.soc.toFixed(1) + ' g/kg' : '') + ' <button class="btn" id="fmSoilUse">Use the nearest SWAFL soil</button>' : 'not reached') + '</td></tr>' +
      '<tr><td>Ground (Copernicus DEM)</td><td>' + (T2 ? 'elevation ' + T2.min.toFixed(0) + ' to ' + T2.max.toFixed(0) + ' m; slope <b>' + T2.slope.toFixed(2) + ' %</b>, falling to the ' + T2.to : 'not reached') + '</td></tr>' +
      '<tr><td>Field</td><td>' + sy.area.toFixed(2) + ' ha; shape ' + (sy.comp > 0.7 ? 'compact' : sy.comp > 0.55 ? 'fairly regular' : 'irregular') + (F.cv ? '; ' + F.cv.shares.filter(c => c.pct >= 2).map(c => c.name.toLowerCase() + ' ' + c.pct.toFixed(0) + ' %').join(', ') : '') + '</td></tr></table>';
    h += '<div class="fmzt"><b>Where to take the water from</b><div class="fmadv">' + esc(S.water.advice) + '</div>';
    h += S.water.list.length ? '<table class="tbl fmtab"><tr><th>Source</th><th>Distance</th><th>Score</th><th>Why</th><th></th></tr>' + S.water.list.slice(0, 8).map((s, i) => '<tr data-src="' + i + '"><td><b>' + esc(s.name || '(no name)') + '</b><br><small>' + esc(s.type) + (s.photo ? ', photo' : ', OpenStreetMap') + '</small></td><td>' + (s.d > 0 ? Math.round(s.d) + ' m ' + s.dir : 'in the field') + '</td><td><b>' + s.score + '</b></td><td><small>' + esc(s.why.join('; ')) + '</small></td><td style="white-space:nowrap"><button class="btn" data-showsrc="' + i + '" title="Move the map to this source">Show</button> <button class="btn" data-usesrc="' + i + '">Use</button></td></tr>').join('') + '</table>' : '<div class="pnote">No water feature is mapped within 3 km.</div>';
    h += '</div><div class="fmzt"><b>Which irrigation system suits this field</b><table class="tbl fmtab"><tr><th>System</th><th>Score</th><th>Reasons</th><th></th></tr>' +
      sy.list.map((x, i) => '<tr' + (i === 0 ? ' class="on"' : '') + '><td><b>' + x.name + '</b>' + (x.Ea != null ? '<br><small>' + (x.id === 'sid' ? 'surface' : x.id === 'drip' ? 'drip' : 'sprinkler') + ' design now: Ea ' + (x.Ea * 100).toFixed(0) + ' %</small>' : '') + '</td><td><b>' + x.score + '</b>' + (i === 0 ? '<br><small>best</small>' : '') + '</td><td><small>' + esc(x.why.join('; ') || 'no strong reason for or against') + '</small></td><td><button class="btn" data-usesys="' + i + '">Use</button></td></tr>').join('') + '</table>' +
      '<div class="pnote">Scores from the slope, the soil, the water source, the crop (' + esc(sy.crop || '-') + '), the field shape and the land cover, after the FAO and USDA guidance for choosing a system. "Use" sets the system or the source in the field sketch; then open the design and run it.</div></div>';
    el.innerHTML = h;
    el.querySelectorAll('[data-usesrc]').forEach(b => b.onclick = () => useSource(S.water.list[+b.dataset.usesrc]));
    el.querySelectorAll('[data-usesys]').forEach(b => b.onclick = () => useSystem(sy.list[+b.dataset.usesys]));
    el.querySelectorAll('[data-showsrc]').forEach(b => b.onclick = () => { const s = S.water.list[+b.dataset.showsrc]; if (!s || !F.map) return; F.showSrc = true; drawSources(); F.map.panTo(s.at); if (F.srcMk && F.srcMk[+b.dataset.showsrc]) F.srcMk[+b.dataset.showsrc].openTooltip(); });
    const sb = document.getElementById('fmSoilUse'); if (sb) sb.onclick = useSoil;
    drawSources();
  }
  function drawSources() {
    if (F.srcLay && F.map) F.map.removeLayer(F.srcLay); F.srcLay = null; F.srcMk = []; const S = F.site; if (!S || !F.map || F.showSrc === false) { mapLayers(); return; } const g = L.layerGroup();
    S.water.list.slice(0, 8).forEach((s, i) => { if (s.pts.length > 1 && !/well|borehole|spring/.test(s.type)) L.polyline(s.pts.length > 600 ? s.pts.filter((_, j) => j % 3 === 0) : s.pts, { color: '#00B0FF', weight: 3, opacity: 0.8, interactive: false }).addTo(g);
      F.srcMk[i] = L.marker(s.at, { icon: L.divIcon({ className: 'fmws' + (s === S.water.best ? ' best' : ''), html: ICON[s.type] || '&#9679;', iconSize: [20, 20] }), title: (s.name || s.type) + ' · ' + s.type + ' · ' + Math.round(s.d) + ' m · score ' + s.score }).bindTooltip((s.name || s.type) + ' · ' + Math.round(s.d) + ' m · score ' + s.score, { direction: 'top' }).addTo(g);
      if (s === S.water.best && s.d > 0) L.polyline([s.at, s.edge], { color: '#00E5FF', weight: 3, dashArray: '8 6', interactive: false }).addTo(g); });
    g.addTo(F.map); F.srcLay = g; mapLayers();
  }
  function useSource(s) {
    if (!s) return; if (!layoutData()) useField(true); const D = layoutData(); if (!D || !Sketch.setAnswers) { UI.toast(needLayout()); return; }
    const l = local(s.at, [D.lat, D.lon]), ty = /well/.test(s.type) ? 'well' : /borehole/.test(s.type) ? 'borehole' : /canal|ditch|drain/.test(s.type) ? 'canal' : /river|stream|spring/.test(s.type) ? 'river' : 'tank';
    Sketch.setSrcMetres(l[0], l[1]); Sketch.setAnswers({ srcType: ty, lift: isFinite(s.lift) ? Math.max(1, Math.round(s.lift + (/well|borehole/.test(ty) ? 25 : 2))) : undefined });
    drawLayout(); UI.toast('Water source set: ' + (s.name || s.type) + ', ' + Math.round(s.d) + ' m. The mainline and the lift go into the design.');
  }
  function useSystem(x) {
    if (!x || !Sketch.setAnswers) return; if (!layoutData()) useField(true);
    const T2 = F.site && F.site.topo, o = { sys: x.id }; if (x.sub) o.sub = x.sub; if (T2 && isFinite(T2.slope)) o.slope = Math.max(0, +T2.slope.toFixed(2));
    Sketch.setAnswers(o); drawLayout(); UI.toast(x.name + ' set in the field sketch' + (o.slope != null ? ', with the slope ' + o.slope + ' %' : '') + '. Press Back to the field sketch, then Turn the sketch into the design.');
  }
  function useSoil() {
    const so = F.site && F.site.soil; if (!so) return; let L2 = null; try { L2 = E.json("DATA.soils.map(function(k){var t=DATA.texture[k]||{};return [k,DATA.soil_labels[k],t.sand,t.clay]})"); } catch (e) {}
    if (!L2) return; let b = null, bd = Infinity; L2.forEach(r => { if (r[2] == null) return; const d = Math.hypot(r[2] - so.sand, r[3] - so.clay); if (d < bd) { bd = d; b = r; } });
    if (!b) return; E.set({ soil: b[0] }); if (Sketch.setAnswers) Sketch.setAnswers({ soil: b[0] }); UI.toast('Soil of the project: ' + b[1] + ' (nearest to sand ' + so.sand.toFixed(0) + ' %, clay ' + so.clay.toFixed(0) + ' %)'); UI.log('Soil from SoilGrids: ' + b[1]);
  }
  F.refresh = view => { if (!F.res && !FieldPrec.has(view)) return; F.view = view; const vr = document.getElementById('fmViewR'); if (vr) vr.style.display = ''; if (F.res) showRes(); else { clearOverlay(); const l = FieldPrec.layer(view); if (l) F.ov = l.addTo(F.map); legend(); mapLayers(); } };
  if (typeof FieldSite !== 'undefined') FieldSite.init({ local, unlocal, centroid, areaM2, perim, inside, grid: mc => grid(mc), pack: (G, v, m, k) => pack(G, v, m, k) });

  const _h = { F, grid: mc => grid(mc), toUTM, s2Search, IX, stats, local, unlocal, centroid, areaM2, perim, inside, valueAt: (k, a, b) => valueAt(k, a, b), refresh: v => F.refresh(v) };
  return { open, _h, _F: F, _sim: () => { F.res = fromSim(); showRes(); return F.res; }, _pdf: pdfFromJpeg, _png: pngWithDpi, _area: areaM2 };
})();
