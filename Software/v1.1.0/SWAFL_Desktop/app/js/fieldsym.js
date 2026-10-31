/* SWAFL 1.1 symbology of the maps of the field (vegetation and water indices, land cover, terrain, soil water, retention,
   season, irrigation zones, erosion). Every map family has a remote-sensing standard colour ramp, and the user can pick any
   ramp of the QGIS default library (ColorBrewer, matplotlib, cpt-city), invert it, set the transparency, or switch the
   colours off to see the real colour of the satellite photo. The choices are kept in this browser. */
'use strict';
const FieldSym = (() => {
  const hx = s => [1, 3, 5].map(i => parseInt(s.substr(i, 2), 16));
  const even = cols => cols.map((c, i) => [i / (cols.length - 1), hx('#' + c)]);
  // ------------------------------------------------------------------ the library (names as in the QGIS style manager)
  const LIB = {
    'NDVI (Sentinel Hub)': { k: 'remote sensing', d: 'brown bare soil to dark green canopy, as in EO Browser', s: [[0, hx('#8C4A1E')], [0.12, hx('#C8A26B')], [0.2, hx('#EAE29A')], [0.3, hx('#CCC682')], [0.4, hx('#91BF51')], [0.5, hx('#70A33F')], [0.6, hx('#4F892D')], [0.7, hx('#306D1C')], [0.85, hx('#0F540A')], [1, hx('#004400')]] },
    'NDMI (Sentinel Hub)': { k: 'remote sensing', d: 'dry red to wet dark blue, moisture index of EO Browser', s: even(['800000', 'FF0000', 'FFFF00', '00FFFF', '0000FF', '000080']) },
    'NDWI water (McFeeters)': { k: 'remote sensing', d: 'land green-white to open water blue', s: even(['008000', 'C8E6A0', 'FFFFFF', '9ECAE1', '2171B5', '08306B']) },
    'Elevation (hypsometric)': { k: 'remote sensing', d: 'lowland green, upland tan, summits white', s: even(['0B6E3A', '5AA84A', 'B5D36B', 'F2E58F', 'D9A95F', 'A86D3A', '8A5A44', 'C9C0B8', 'FFFFFF']) },
    'Land surface temperature': { k: 'remote sensing', d: 'cool blue to hot red, thermal bands', s: even(['040274', '0502A3', '0602FF', '307EF3', '30C8E2', '3BE285', '86E26F', 'B5E22E', 'FFF705', 'FFD611', 'FF8B13', 'FF0000', 'C21301', '911003']) },
    RdYlGn: { k: 'diverging', d: 'red, yellow, green (vegetation health)', s: even(['A50026', 'D73027', 'F46D43', 'FDAE61', 'FEE08B', 'FFFFBF', 'D9EF8B', 'A6D96A', '66BD63', '1A9850', '006837']) },
    Spectral: { k: 'diverging', d: 'the spectrum from red to violet', s: even(['9E0142', 'D53E4F', 'F46D43', 'FDAE61', 'FEE08B', 'FFFFBF', 'E6F598', 'ABDDA4', '66C2A5', '3288BD', '5E4FA2']) },
    RdYlBu: { k: 'diverging', d: 'red, yellow, blue (dry to wet)', s: even(['A50026', 'D73027', 'F46D43', 'FDAE61', 'FEE090', 'FFFFBF', 'E0F3F8', 'ABD9E9', '74ADD1', '4575B4', '313695']) },
    RdBu: { k: 'diverging', d: 'red, white, blue', s: even(['67001F', 'B2182B', 'D6604D', 'F4A582', 'FDDBC7', 'F7F7F7', 'D1E5F0', '92C5DE', '4393C3', '2166AC', '053061']) },
    BrBG: { k: 'diverging', d: 'brown, white, blue-green (soil to water)', s: even(['543005', '8C510A', 'BF812D', 'DFC27D', 'F6E8C3', 'F5F5F5', 'C7EAE5', '80CDC1', '35978F', '01665E', '003C30']) },
    PuOr: { k: 'diverging', d: 'orange, white, purple', s: even(['7F3B08', 'B35806', 'E08214', 'FDB863', 'FEE0B6', 'F7F7F7', 'D8DAEB', 'B2ABD2', '8073AC', '542788', '2D004B']) },
    YlGn: { k: 'sequential', d: 'yellow to green', s: even(['FFFFE5', 'F7FCB9', 'D9F0A3', 'ADDD8E', '78C679', '41AB5D', '238443', '006837', '004529']) },
    YlGnBu: { k: 'sequential', d: 'yellow, green, blue (wetness)', s: even(['FFFFD9', 'EDF8B1', 'C7E9B4', '7FCDBB', '41B6C4', '1D91C0', '225EA8', '253494', '081D58']) },
    Greens: { k: 'sequential', d: 'light to dark green', s: even(['F7FCF5', 'E5F5E0', 'C7E9C0', 'A1D99B', '74C476', '41AB5D', '238B45', '006D2C', '00441B']) },
    Blues: { k: 'sequential', d: 'light to dark blue', s: even(['F7FBFF', 'DEEBF7', 'C6DBEF', '9ECAE1', '6BAED6', '4292C6', '2171B5', '08519C', '08306B']) },
    YlOrBr: { k: 'sequential', d: 'yellow, orange, brown', s: even(['FFFFE5', 'FFF7BC', 'FEE391', 'FEC44F', 'FE9929', 'EC7014', 'CC4C02', '993404', '662506']) },
    YlOrRd: { k: 'sequential', d: 'yellow, orange, red', s: even(['FFFFCC', 'FFEDA0', 'FED976', 'FEB24C', 'FD8D3C', 'FC4E2A', 'E31A1C', 'BD0026', '800026']) },
    Reds: { k: 'sequential', d: 'light to dark red', s: even(['FFF5F0', 'FEE0D2', 'FCBBA1', 'FC9272', 'FB6A4A', 'EF3B2C', 'CB181D', 'A50F15', '67000D']) },
    Greys: { k: 'sequential', d: 'white to black', s: even(['FFFFFF', 'F0F0F0', 'D9D9D9', 'BDBDBD', '969696', '737373', '525252', '252525', '000000']) },
    Viridis: { k: 'perceptual', d: 'purple, teal, yellow (readable by colour-blind people)', s: even(['440154', '482878', '3E4989', '31688E', '26828E', '1F9E89', '35B779', '6ECE58', 'B5DE2B', 'FDE725']) },
    Magma: { k: 'perceptual', d: 'black, purple, cream', s: even(['000004', '1C1044', '4F127B', '812581', 'B5367A', 'E55964', 'FB8761', 'FEC287', 'FCFDBF']) },
    Inferno: { k: 'perceptual', d: 'black, red, yellow', s: even(['000004', '1B0C41', '4A0C6B', '781C6D', 'A52C60', 'CF4446', 'ED6925', 'FB9B06', 'F7D13D', 'FCFFA4']) },
    Plasma: { k: 'perceptual', d: 'blue, magenta, yellow', s: even(['0D0887', '46039F', '7201A8', '9C179E', 'BD3786', 'D8576B', 'ED7953', 'FB9F3A', 'FDCA26', 'F0F921']) },
    Cividis: { k: 'perceptual', d: 'blue to yellow (colour-blind safe)', s: even(['00224E', '123570', '3B496C', '575D6D', '707173', '8A8678', 'A59C74', 'C3B369', 'E1CC55', 'FEE838']) },
    Turbo: { k: 'perceptual', d: 'improved rainbow', s: even(['30123B', '4662D7', '36AAF9', '1AE4B6', '72FE5E', 'C8EF34', 'FABA39', 'F66B19', 'CA2A04', '7A0403']) }
  };
  // ------------------------------------------------------------------ the map families and their remote-sensing standard
  // the original SWAFL colours of every map (the default), exactly as the maps were first drawn
  const R3 = a => a.map(r => [r[0], [r[1], r[2], r[3]]]);
  const ORIG = {
    'Original: vegetation (red-yellow-green)': [[0, [165, 0, 38]], [0.25, [244, 109, 67]], [0.45, [254, 224, 139]], [0.65, [166, 217, 106]], [0.85, [26, 152, 80]], [1, [0, 104, 55]]],
    'Original: water (brown-teal)': [[0, [140, 81, 10]], [0.35, [223, 194, 125]], [0.55, [199, 234, 229]], [0.8, [53, 151, 143]], [1, [1, 102, 94]]],
    'Original: elevation (blue to red)': R3([[0, 50, 136, 189], [0.14, 102, 194, 165], [0.28, 171, 221, 164], [0.42, 230, 245, 152], [0.57, 254, 224, 139], [0.71, 253, 174, 97], [0.86, 244, 109, 67], [1, 213, 62, 79]]),
    'Original: wetness (yellow-green-blue)': R3([[0, 255, 255, 217], [0.25, 199, 233, 180], [0.5, 65, 182, 196], [0.75, 34, 94, 168], [1, 12, 44, 132]]),
    'Original: soil classes (red-cream-blue)': even(['E64A3B', 'F28E6B', 'F7C79C', 'FCE5B4', 'E8E8C4', 'B3B5D4', '7E88C7', '1F5CD6']),
    'Original: change (red-white-green)': [[0, [215, 48, 39]], [0.5, [255, 255, 255]], [1, [26, 152, 80]]],
    'Original: zones (red to dark green)': even(['D7301F', 'FC8D59', 'FEE08B', '91CF60', '1A9850', '006837', '004529']),
    'Original: irrigation zones (Spectral)': even(['5E4FA2', '3288BD', '66C2A5', 'ABDDA4', 'E6F598', 'FEE08B', 'FDAE61', 'F46D43', 'D53E4F']),
    'Original: dates (red-yellow-blue)': even(['D73027', 'FC8D59', 'FEE090', '91BFDB', '4575B4']),
    'Original: erosion classes (green to red)': even(['1A9850', 'A6D96A', 'FEE08B', 'FC8D59', 'D73027']),
    'Original: bare soil (green to brown)': even(['1A9850', '91CF60', 'D9EF8B', 'F6E8C3', 'D8B365', '8C510A'])
  };
  Object.keys(ORIG).reverse().forEach(n => { const o = {}; o[n] = { k: 'original SWAFL colours', d: 'the colours SWAFL first drew this map with', s: ORIG[n] }; Object.assign(o, LIB); Object.keys(LIB).forEach(k => delete LIB[k]); Object.assign(LIB, o); });
  // each family: its original colours (default) and the styles used for such maps in the literature and in GIS, suggested first
  const GROUPS = {
    veg: { t: 'Vegetation indices (NDVI, EVI, SAVI, NDRE, VARI, GLI, ExG, NGRDI) and their zones', r: 'Original: vegetation (red-yellow-green)', sug: ['RdYlGn', 'NDVI (Sentinel Hub)', 'YlGn', 'Greens', 'Spectral'], why: 'low vegetation red, dense canopy green, as most NDVI, EVI, SAVI and NDRE maps' },
    wat: { t: 'Water and moisture index (NDWI of Gao, also NDMI) and its zones', r: 'Original: water (brown-teal)', sug: ['BrBG', 'Blues', 'NDMI (Sentinel Hub)', 'YlGnBu', 'NDWI water (McFeeters)'], why: 'dry brown, moist blue-green, as NDWI and NDMI maps' },
    spec: { t: 'Elevation under the contours and flow', r: 'Original: elevation (blue to red)', sug: ['Elevation (hypsometric)', 'Spectral', 'Greys', 'Viridis', 'Turbo'], why: 'low blue, high red; the hypsometric tints of topographic maps are next' },
    wet: { t: 'Topographic wetness index', r: 'Original: wetness (yellow-green-blue)', sug: ['YlGnBu', 'Blues', 'Viridis', 'Spectral'], why: 'dry ridges pale yellow, wet hollows deep blue, as TWI maps' },
    dry: { t: 'Soil water now (sensors and satellite fused)', r: 'Original: soil classes (red-cream-blue)', sug: ['RdYlBu', 'BrBG', 'Blues', 'Turbo'], why: 'dry red, wet blue, as soil moisture maps' },
    unc: { t: 'Uncertainty of the fused soil water', r: 'Original: soil classes (red-cream-blue)', sug: ['Magma', 'Plasma', 'Greys'], why: 'classes from low to high' },
    fcR: { t: 'Field capacity', r: 'Original: soil classes (red-cream-blue)', sug: ['YlGnBu', 'Blues', 'Viridis', 'Spectral'], why: 'little water held red, much blue' },
    wpR: { t: 'Wilting point', r: 'Original: soil classes (red-cream-blue)', sug: ['YlOrBr', 'YlOrRd', 'Magma'], why: 'high wilting point red, low blue' },
    awR: { t: 'Available water', r: 'Original: soil classes (red-cream-blue)', sug: ['RdYlBu', 'Spectral', 'YlGnBu', 'Viridis'], why: 'little available water red, much blue, as available water capacity maps' },
    trR: { t: 'Trigger water content', r: 'Original: soil classes (red-cream-blue)', sug: ['YlGnBu', 'Blues', 'Viridis'], why: 'low red, high blue' },
    psiR: { t: 'Matric potential now (suction)', r: 'Original: soil classes (red-cream-blue)', sug: ['RdYlBu', 'Spectral', 'Turbo', 'Plasma'], why: 'high suction (dry) red, low suction (wet) blue' },
    dayR: { t: 'Days to the irrigation trigger', r: 'Original: soil classes (red-cream-blue)', sug: ['RdYlGn', 'Spectral', 'YlOrRd', 'Turbo'], why: 'irrigate soon red, later blue, as irrigation scheduling maps' },
    chg: { t: 'Change, trend and stability of the NDVI over the season', r: 'Original: change (red-white-green)', sug: ['RdYlGn', 'BrBG', 'PuOr', 'RdBu'], why: 'decline red, no change white, growth green' },
    mz: { t: 'Monitoring zones of the season', r: 'Original: zones (red to dark green)', sug: ['RdYlGn', 'Spectral', 'YlGn'], why: 'weak zones red, strong zones green' },
    vri: { t: 'Irrigation depth by zone', r: 'Original: irrigation zones (Spectral)', sug: ['Spectral', 'Turbo', 'YlGnBu', 'Blues'], why: 'a distinct colour for each zone, as variable-rate prescription maps' },
    vrid: { t: 'Irrigation date by zone', r: 'Original: dates (red-yellow-blue)', sug: ['RdYlBu', 'Spectral'], why: 'soon red, later blue' },
    bsi: { t: 'Bare soil index (BSI)', r: 'Original: bare soil (green to brown)', sug: ['BrBG', 'YlOrBr', 'Greys'], rev0: {}, why: 'covered green, bare brown, as bare soil maps' },
    ero: { t: 'Ephemeral gullies and soil loss (RUSLE)', r: 'Original: erosion classes (green to red)', sug: ['RdYlGn', 'YlOrRd', 'Reds'], rev0: { RdYlGn: true }, why: 'low risk green, high risk red, as erosion risk maps' }
  };
  // ------------------------------------------------------------------ land cover: class colours of the main land cover products
  const COVER = {
    swafl: { t: 'SWAFL natural colours', c: ['#1B7837', '#A6D96A', '#C8A26B', '#2C7FB8', '#7B3294', '#3A3A3A'] },
    esa: { t: 'ESA WorldCover 10 m (2021)', c: ['#006400', '#FFFF4C', '#B4B4B4', '#0064C8', '#FA0000', '#000000'] },
    dw: { t: 'Google Dynamic World', c: ['#397D49', '#88B053', '#A59B8F', '#419BDF', '#C4281B', '#2B2B2B'] },
    corine: { t: 'CORINE Land Cover (Copernicus)', c: ['#80FF00', '#CCFFCC', '#CCCCCC', '#80F2E6', '#E6004D', '#4D4D4D'] },
    usgs: { t: 'USGS NLCD (United States)', c: ['#1C5F2C', '#DCCA8F', '#B3AC9F', '#466B9F', '#EB0000', '#333333'] },
    real: { t: 'Real colour: the mean colour of each class in the photo', c: null }
  };
  const KEY = 'swafl.fieldsym2';   // the original colours are the default again (older choices are not carried over)
  let S = {}; try { S = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { S = {}; }
  let onChange = null;   // the field map keeps every change for Ctrl+Z and Ctrl+Y
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } if (onChange) try { onChange(); } catch (e) { } };
  const cfg = g => { const G = GROUPS[g] || { r: 'Spectral' }, u = (S.g || {})[g] || {}; return { r: LIB[u.r] ? u.r : G.r, rev: u.rev != null ? !!u.rev : !!G.rev }; };
  const stopsAt = (s, t) => { t = Math.max(0, Math.min(1, isFinite(t) ? t : 0.5)); for (let i = 1; i < s.length; i++) if (t <= s[i][0]) { const a = s[i - 1], b = s[i], f = (t - a[0]) / ((b[0] - a[0]) || 1); return a[1].map((c, q) => Math.round(c + (b[1][q] - c) * f)); } return s[s.length - 1][1].slice(); };
  const lib = (name, t, rev) => stopsAt((LIB[name] || LIB.Spectral).s, rev ? 1 - t : t);
  // the colour of a family at t (0 low, 1 high)
  const at = (g, t) => { const c = cfg(g); return lib(c.r, t, c.rev); };
  const css = (g, n) => { n = n || 10; const o = []; for (let i = 0; i <= n; i++) o.push('rgb(' + at(g, i / n).join(',') + ') ' + (i * 100 / n) + '%'); return 'linear-gradient(90deg,' + o.join(',') + ')'; };
  const libCss = (name, rev) => { const o = []; for (let i = 0; i <= 10; i++) o.push('rgb(' + lib(name, i / 10, rev).join(',') + ') ' + i * 10 + '%'); return 'linear-gradient(90deg,' + o.join(',') + ')'; };
  const cls = (g, j, m) => at(g, m > 1 ? j / (m - 1) : 0.5);
  const custom = g => !!(S.g && S.g[g] && (S.g[g].r || S.g[g].rev != null));
  const set = (g, o) => { S.g = S.g || {}; S.g[g] = Object.assign({}, S.g[g] || {}, o); save(); };
  const reset = g => { if (S.g) delete S.g[g]; save(); };
  // transparency of the coloured maps, and the real colour of the photo (the coloured maps hidden)
  const op = def => S.real ? 0 : S.op != null ? S.op : def;
  const cover = () => S.cover && COVER[S.cover] ? S.cover : 'swafl';
  const coverCols = real => { const k = cover(); if (k === 'real' && real) return real; const c = (COVER[k].c || COVER.swafl.c).slice(); const u = S.coverC || {}; return c.map((x, i) => u[k + i] || x); };
  // the family of the map in view
  const groupOf = (view, idxRamp) => ({ cont: idxRamp, zones: idxRamp, contour: 'spec', twi: 'wet', sens: 'dry', sensu: 'unc', ret_fc: 'fcR', ret_wp: 'wpR', ret_aw: 'awR', ret_trig: 'trR', ret_psi: 'psiR', ret_days: 'dayR', mchange: 'chg', mtrend: 'chg', mstab: 'chg', mzone: 'mz', vri: 'vri', vridate: 'vrid', gully: 'ero', rusle: 'ero', cover: 'cover' }[view] || null);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // ------------------------------------------------------------------ the panel on the map (like the symbology tab of QGIS)
  function panelHtml(g, names) {
    let h = '<div class="fmsyh" title="Colours of the map: remote-sensing standard, the QGIS library of colour ramps, transparency, or the real colour of the photo. Drag the title to move the panel; double-click it to put it back. Ctrl+Z undoes a change, Ctrl+Y brings it back">&#127912; Symbology</div><div class="fmsyb">';
    h += '<div class="seg fmsyseg"><button data-sy="col" class="' + (S.real ? '' : 'on') + '">Coloured map</button><button data-sy="real" class="' + (S.real ? 'on' : '') + '" title="Hide the coloured maps and see the satellite photo itself">Real colour (photo)</button></div>';
    h += '<label class="fmsyop">Opacity <input type="range" min="0" max="100" step="5" data-sy="op" value="' + Math.round((S.op != null ? S.op : 0.85) * 100) + '"' + (S.real ? ' disabled' : '') + '><span>' + Math.round((S.op != null ? S.op : 0.85) * 100) + ' %</span></label>';
    if (!g) return h + '<small>Compute a map (indices, land cover, terrain, retention, season, zones or erosion) to choose its colours.</small></div>';
    if (g === 'cover') {
      const k = cover(), cols = coverCols(null);
      h += '<div class="fmsyt"><b>Land cover</b>: class colours</div><select data-sy="cover">' + Object.keys(COVER).map(q => '<option value="' + q + '"' + (q === k ? ' selected' : '') + '>' + esc(COVER[q].t) + '</option>').join('') + '</select>';
      if (k !== 'real') h += '<div class="fmsycl">' + (names || []).map((n, i) => '<label><input type="color" data-syc="' + i + '" value="' + cols[i] + '">' + esc(n) + '</label>').join('') + '</div><small>Click a colour to change it. The schemes follow the legends of the land cover products; SWAFL natural colours is the default.</small>';
      else h += '<small>Each class takes the mean colour of its pixels in the satellite photo.</small>';
      return h + '<button class="btn" data-sy="creset">Back to SWAFL natural colours</button></div>';
    }
    const G = GROUPS[g], c = cfg(g);
    h += '<div class="fmsyt"><b>' + esc(G.t) + '</b></div><div class="fmsycur" style="background:' + css(g, 16) + '"></div><div class="fmsyends"><span>low</span><span>' + esc(c.r) + (c.rev ? ', inverted' : '') + '</span><span>high</span></div>';
    const row = n => { const L2 = LIB[n]; return L2 ? '<button data-syr="' + esc(n) + '" class="' + (n === c.r ? 'on' : '') + '" title="' + esc(L2.d) + '"><i style="background:' + libCss(n, c.rev) + '"></i><span>' + esc(n) + (n === G.r ? ' &#9733;' : '') + '</span></button>' : ''; };
    h += '<div class="fmsyt">Colour ramp. Scroll the list:</div><div class="fmsylist"><div class="fmsyk">Suggested for this map</div>' + [G.r].concat(G.sug || []).map(row).join('');
    let last = ''; Object.keys(LIB).forEach(n => { const L2 = LIB[n]; if (L2.k !== last) { last = L2.k; h += '<div class="fmsyk">' + esc(L2.k === 'original SWAFL colours' ? 'Original SWAFL colours of every map' : 'QGIS library: ' + L2.k) + '</div>'; } h += row(n); });
    h += '</div><label class="fmsyinv"><input type="checkbox" data-sy="inv"' + (c.rev ? ' checked' : '') + '> Invert the ramp</label><button class="btn" data-sy="reset" title="' + esc(G.why) + '">&#9733; Original colours of this map</button><small>&#9733; ' + esc(G.why) + '. Ctrl+Z undoes a change, Ctrl+Y brings it back.</small></div>';
    return h;
  }
  // a Leaflet control; ctx: { group: () => family, names: () => class names, apply: () => redraw the maps }
  function control(mp, ctx) {
    const C = L.Control.extend({ options: { position: 'topleft' }, onAdd() {   // top left, so that a long list of opened maps does not push it off the map
      const d = L.DomUtil.create('div', 'fmsyc min'); L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d);
      const redraw = () => { const g = ctx.group(), h = panelHtml(g, ctx.names()); if (d.__h !== h) { d.__h = h; d.innerHTML = h; } };
      const apply = () => { d.__h = ''; redraw(); ctx.apply(); };
      d.addEventListener('click', e => { L.DomEvent.stop(e); const t = e.target; if (t.closest('.fmsyh')) { d.classList.toggle('min'); return; } const g = ctx.group();
        const r = t.closest('[data-syr]'); if (r && g) { set(g, { r: r.dataset.syr }); apply(); return; }
        const b = t.closest('button[data-sy]'); if (!b) return; const a = b.dataset.sy;
        if (a === 'col' || a === 'real') { S.real = a === 'real'; save(); apply(); } else if (a === 'reset' && g) { reset(g); apply(); } else if (a === 'creset') { S.cover = 'swafl'; S.coverC = {}; save(); apply(); } });
      d.addEventListener('change', e => { const t = e.target, g = ctx.group();
        if (t.dataset.sy === 'inv' && g) { set(g, { rev: t.checked }); apply(); }
        else if (t.dataset.sy === 'cover') { S.cover = t.value; save(); apply(); }
        else if (t.dataset.syc != null) { S.coverC = S.coverC || {}; S.coverC[cover() + t.dataset.syc] = t.value; save(); apply(); }
        else if (t.dataset.sy === 'op') { S.op = +t.value / 100; save(); ctx.apply(); } });
      d.addEventListener('input', e => { const t = e.target; if (t.dataset.sy === 'op') { const sp = t.nextElementSibling; if (sp) sp.textContent = t.value + ' %'; } });
      d._redraw = redraw; redraw(); return d; } });
    const c = new C(); c.addTo(mp); movable(mp, c.getContainer(), '.fmsyh', 'sym'); return c;
  }
  // a panel on the map that can be dragged anywhere by its title; a double click on the title puts it back in its corner.
  // The place is kept for the next time. A drag does not fold or unfold the panel.
  const POS = 'swafl.fieldpanels';
  function movable(mp, el, handle, key) {
    let pos = {}; try { pos = JSON.parse(localStorage.getItem(POS) || '{}') || {}; } catch (e) { }
    const box = () => mp.getContainer(), home = el.parentNode;
    const float = (x, y) => { const c = box(), r = c.getBoundingClientRect(); if (el.parentNode !== c) { c.appendChild(el); el.classList.add('fmfloat'); } const w = el.offsetWidth || 200; x = Math.max(0, Math.min(r.width - Math.min(w, 80), x)); y = Math.max(0, Math.min(r.height - 60, y)); el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.maxHeight = Math.max(60, r.height - y - 8) + 'px'; return [x, y]; };
    const dock = () => { el.classList.remove('fmfloat'); el.style.left = el.style.top = el.style.maxHeight = ''; if (home && el.parentNode !== home) home.insertBefore(el, home.firstChild && key === 'ly' ? home.firstChild : null); delete pos[key]; try { localStorage.setItem(POS, JSON.stringify(pos)); } catch (e) { } };
    if (pos[key]) setTimeout(() => { try { float(pos[key][0], pos[key][1]); } catch (e) { } }, 0);
    // a floating panel that is unfolded near the bottom of the map moves up so that all of it is seen
    const refit = () => { if (!el.classList.contains('fmfloat')) return; const r = box().getBoundingClientRect(); el.style.maxHeight = ''; const h = Math.min(el.scrollHeight, r.height - 8); let y = parseFloat(el.style.top) || 0; if (y + h > r.height - 4) y = Math.max(0, r.height - h - 4); el.style.top = y + 'px'; el.style.maxHeight = Math.max(60, r.height - y - 6) + 'px'; pos[key] = [parseFloat(el.style.left) || 0, y]; };
    try { new MutationObserver(() => setTimeout(refit, 0)).observe(el, { attributes: true, attributeFilter: ['class'] }); } catch (e) { }
    el.addEventListener('mousedown', e => { const h = e.target.closest(handle); if (!h || e.button !== 0) return; const c = box().getBoundingClientRect(), r = el.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top, x0 = e.clientX, y0 = e.clientY; let moved = false;
      const mv = ev => { if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return; moved = true; el.classList.add('fmdrag'); pos[key] = float(ev.clientX - c.left - ox, ev.clientY - c.top - oy); ev.preventDefault(); };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); el.classList.remove('fmdrag'); if (moved) { el._dragged = true; setTimeout(() => { el._dragged = false; }, 0); try { localStorage.setItem(POS, JSON.stringify(pos)); } catch (e) { } } };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up); e.preventDefault(); });
    el.addEventListener('click', e => { if (el._dragged && e.target.closest(handle)) { e.stopImmediatePropagation(); e.preventDefault(); el._dragged = false; } }, true);
    el.addEventListener('dblclick', e => { if (e.target.closest(handle)) { dock(); e.stopPropagation(); } });
    const h = el.querySelector(handle); if (h) h.title = (h.title ? h.title + '. ' : '') + 'Drag the title to move this panel anywhere on the map; double-click it to put it back';
  }
  // the whole state, for undo and redo
  const snapshot = () => JSON.stringify(S);
  const load = t => { try { S = JSON.parse(t) || {}; } catch (e) { S = {}; } try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  return { LIB, GROUPS, COVER, at, css, cls, lib, op, cover, coverCols, groupOf, control, movable, set, reset, custom, cfg, state: () => S, snapshot, load, onChange: f => { onChange = f; } };
})();
