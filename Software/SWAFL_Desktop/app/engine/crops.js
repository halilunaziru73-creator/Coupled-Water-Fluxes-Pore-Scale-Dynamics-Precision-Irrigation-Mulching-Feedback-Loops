/* SWAFL crop library.
   Field crops: crop coefficients Kc ini, Kc mid, Kc end (climate-corrected), season length, plant height and the
   four growth stages (initial, development, mid-season, late-season), from a field study that computed daily crop
   water requirement with the FAO Penman-Monteith reference evapotranspiration (stage days = stage total / daily rate).
   Tree, vine and berry crops: updated indicative standard Kc mid and Kc end, ground cover fc and height for each
   planting density / training system, from a review of FAO-56 crop coefficients of fruit trees and vines.
   Maximum rooting depth, depletion fraction p and yield response factor Ky: FAO-56 / FAO-33 tabulated values;
   where a crop is not tabulated, the group default is used and flagged (src 'group default').
   Kind sets the drawing and root distribution; habit: annual, deciduous or evergreen. */
'use strict';
window.CROPLIB = (function () {
  const F = (label, kind, kc, st, h, root, p, ky, opt) => Object.assign({ label, kind, group: 'field', habit: 'annual', kcIni: kc[0], kcMid: kc[1], kcEnd: kc[2], stages: st, height: h, root, p, ky, kySrc: ky == null ? 'not tabulated' : 'tabulated', fc: 0.9 }, opt || {});
  const crops = {
    rice:        F('Rice', 'rice', [1.05, 1.20, 0.90], [15, 30, 45, 30], 0.8, 75, 0.20, null, { ponded: true }),
    maize:       F('Maize (grain)', 'maize', [0.30, 1.20, 0.60], [15, 30, 40, 20], 1.5, 135, 0.55, 1.25),
    pearlmillet: F('Millet', 'millet', [0.30, 1.00, 0.30], [15, 25, 40, 25], 1.5, 150, 0.55, null),
    sorghum:     F('Sorghum (grain)', 'sorghum', [0.30, 1.00, 0.55], [20, 35, 40, 30], 1.5, 150, 0.55, 0.90),
    cassava:     F('Cassava', 'cassava', [0.30, 0.80, 0.30], [20, 40, 90, 60], 1.0, 65, 0.35, null),
    yam:         F('Yam', 'yam', [0.50, 1.10, 0.85], [30, 60, 90, 60], 1.5, 60, 0.40, null, { rootSrc: 'group default', stSrc: 'group default' }),
    cowpea:      F('Cowpea (beans)', 'cowpea', [0.40, 1.05, 0.50], [20, 30, 30, 20], 0.4, 80, 0.45, null),
    greengram:   F('Green gram (mung bean)', 'legume', [0.40, 0.96, 0.51], [17, 23, 34, 16], 0.4, 75, 0.45, null),
    soybean:     F('Soybean', 'soybean', [0.40, 1.15, 0.50], [20, 30, 45, 25], 0.6, 95, 0.50, 0.85),
    groundnut:   F('Groundnut', 'groundnut', [0.40, 1.15, 0.60], [20, 35, 40, 25], 0.4, 75, 0.50, 0.70),
    cotton:      F('Cotton', 'cotton', [0.35, 1.15, 0.50], [30, 45, 65, 50], 1.1, 135, 0.65, 0.85),
    wheat:       F('Wheat', 'wheat', [0.40, 1.15, 0.41], [20, 30, 45, 25], 0.8, 165, 0.55, 1.05),
    chickpea:    F('Chickpea', 'legume', [0.40, 1.00, 0.40], [15, 35, 45, 25], 0.4, 80, 0.50, null),
    mustard:     F('Mustard', 'mustard', [0.35, 1.15, 0.35], [15, 35, 45, 25], 1.3, 125, 0.60, null),
    tomato:      F('Tomato', 'vegetable', [0.60, 1.15, 0.80], [30, 40, 40, 25], 0.6, 100, 0.40, 1.05),
    potato:      F('Potato', 'vegetable', [0.50, 1.15, 0.75], [25, 30, 45, 30], 0.6, 50, 0.35, 1.10),
    onion:       F('Onion (dry)', 'vegetable', [0.70, 1.05, 0.75], [15, 25, 70, 40], 0.4, 45, 0.30, 1.10),
    cabbage:     F('Cabbage', 'vegetable', [0.70, 1.05, 0.95], [40, 60, 50, 15], 0.4, 65, 0.45, 0.95),
    pepper:      F('Sweet pepper', 'vegetable', [0.60, 1.05, 0.90], [25, 35, 40, 20], 0.7, 75, 0.30, 1.10),
  };
  // tree, vine and berry crops: [density / training system, fc, height (m), Kc mid, Kc end]
  const P = (label, kind, habit, dens, root, p, opt) => Object.assign({ label, kind, group: 'perennial', habit, densities: dens, root, p, ky: null, kySrc: 'not tabulated' }, opt || {});
  const DEC = { start: 100, stages: [20, 70, 90, 30] }, VIN = { start: 110, stages: [20, 40, 120, 60] }, EVG = { start: 0, stages: [60, 90, 120, 95] };
  Object.assign(crops, {
    tablegrape: P('Table grapes', 'vine', 'deciduous', [['Young', 0.27, 1.4, 0.60, 0.55], ['Overhead trellis', 0.92, 2.0, 0.95, 0.70], ['Horizontal trellis', 0.65, 1.75, 0.90, 0.80], ['T trellis', 0.45, 2.0, 0.80, 0.60], ['Y shape', 0.75, 2.2, 0.70, 0.55]], 150, 0.35, VIN),
    winegrape:  P('Wine grapes', 'vine', 'deciduous', [['Young', 0.22, 1.25, 0.45, 0.40], ['Pergola', 0.55, 2.0, 0.65, 0.50], ['Vertical shoot positioned', 0.35, 1.75, 0.70, 0.45], ['Guyot', 0.32, 1.75, 0.50, 0.40]], 150, 0.45, VIN),
    kiwi:       P('Kiwi', 'vine', 'deciduous', [['Pergola', 0.85, 2.0, 0.95, 0.90]], 100, 0.35, VIN),
    blueberry:  P('Highbush blueberry', 'bush', 'deciduous', [['Young', 0.25, 0.8, 0.40, 0.30], ['Low', 0.40, 1.65, 0.50, 0.35], ['Medium', 0.60, 1.65, 0.80, 0.35], ['High', 0.75, 1.9, 0.95, 0.40]], 90, 0.50, { start: 100, stages: [20, 50, 90, 20] }),
    hop:        P('Hop', 'hop', 'deciduous', [['V trellis', 0.15, 5.5, 1.00, 0.85]], 110, 0.50, { start: 110, stages: [25, 40, 80, 10] }),
    citrus:     P('Citrus', 'citrus', 'evergreen', [['Young', 0.20, 1.25, 0.40, 0.60], ['Low density', 0.32, 3.4, 0.55, 0.65], ['Medium density, short', 0.52, 3.0, 0.60, 0.70], ['Medium density, tall', 0.52, 4.0, 0.65, 0.75], ['High density, short', 0.70, 3.0, 0.70, 0.80], ['High density, tall', 0.70, 4.25, 0.90, 0.95]], 135, 0.50, EVG),
    olive:      P('Olive', 'olive', 'evergreen', [['Young', 0.22, 1.75, 0.25, 0.60], ['Traditional, low density', 0.17, 2.75, 0.30, 0.60], ['Traditional, medium density', 0.25, 3.25, 0.45, 0.65], ['Intensive (hedge pruned)', 0.35, 3.0, 0.45, 0.70], ['Super-intensive, medium', 0.30, 3.25, 0.40, 0.70], ['Super-intensive, high', 0.40, 3.5, 0.50, 0.75]], 145, 0.65, EVG),
    apple:      P('Apple', 'tree', 'deciduous', [['Young', 0.20, 2.0, 0.40, 0.35], ['Low', 0.27, 3.0, 0.50, 0.40], ['Medium', 0.35, 3.5, 0.70, 0.55], ['High', 0.45, 3.5, 0.90, 0.65], ['Very high', 0.55, 4.0, 1.00, 0.65]], 150, 0.50, DEC),
    pear:       P('Pear', 'tree', 'deciduous', [['Young', 0.20, 2.0, 0.40, 0.30], ['Low', 0.30, 3.0, 0.55, 0.45], ['Medium', 0.37, 3.5, 0.85, 0.65], ['High', 0.45, 3.5, 1.00, 0.75], ['Very high', 0.55, 4.0, 1.10, 0.85]], 150, 0.50, DEC),
    cherry:     P('Cherry', 'tree', 'deciduous', [['Low', 0.45, 3.0, 0.60, 0.45], ['Medium', 0.45, 3.5, 0.80, 0.55], ['High', 0.55, 4.0, 0.90, 0.60], ['Very high', 0.65, 4.0, 1.05, 0.70]], 150, 0.50, DEC),
    peach:      P('Peach', 'tree', 'deciduous', [['Young', 0.20, 2.0, 0.55, 0.45], ['Low', 0.32, 3.0, 0.65, 0.50], ['Medium', 0.50, 3.5, 0.90, 0.65], ['High', 0.65, 4.0, 1.05, 0.70]], 150, 0.50, DEC),
    apricot:    P('Apricot', 'tree', 'deciduous', [['Young', 0.22, 2.0, 0.55, 0.40]], 150, 0.50, DEC),
    almond:     P('Almond', 'tree', 'deciduous', [['Young', 0.22, 2.0, 0.40, 0.35], ['Low', 0.35, 3.0, 0.45, 0.40], ['Medium', 0.45, 3.5, 0.65, 0.50], ['High', 0.55, 4.0, 0.90, 0.65], ['Very high', 0.65, 4.5, 1.05, 0.75]], 150, 0.40, DEC),
    hazelnut:   P('Hazelnut', 'tree', 'deciduous', [['Young', 0.22, 2.0, 0.45, 0.40], ['Low', 0.37, 3.0, 0.75, 0.55], ['High', 0.52, 4.0, 0.95, 0.65]], 150, 0.50, Object.assign({ rootSrc: 'group default' }, DEC)),
    walnut:     P('Walnut', 'tree', 'deciduous', [['Young, low', 0.25, 3.0, 0.50, 0.45], ['Medium', 0.60, 5.0, 0.85, 0.50], ['High', 0.80, 6.0, 0.95, 0.55], ['Very high', 0.90, 7.0, 1.05, 0.60]], 205, 0.50, DEC),
    pecan:      P('Pecan', 'tree', 'deciduous', [['Young', 0.27, 3.0, 0.55, 0.50], ['Low', 0.45, 6.0, 0.75, 0.55], ['Medium', 0.65, 8.0, 0.85, 0.60], ['High', 0.75, 10.0, 1.00, 0.65]], 150, 0.50, Object.assign({ rootSrc: 'group default' }, DEC)),
    pistachio:  P('Pistachio', 'tree', 'deciduous', [['Young, low', 0.22, 2.0, 0.45, 0.35], ['Medium', 0.40, 3.5, 0.80, 0.55], ['High', 0.55, 4.0, 0.95, 0.65]], 125, 0.40, DEC),
    fig:        P('Fig tree', 'tree', 'deciduous', [['Young, low', 0.25, 2.0, 0.45, 0.35], ['Medium', 0.40, 3.5, 0.65, 0.45]], 150, 0.50, Object.assign({ rootSrc: 'group default' }, DEC)),
    persimmon:  P('Persimmon', 'tree', 'deciduous', [['Young, low', 0.20, 2.0, 0.50, 0.40], ['Medium', 0.40, 3.5, 0.95, 0.75]], 150, 0.50, Object.assign({ rootSrc: 'group default' }, DEC)),
    pomegranate:P('Pomegranate', 'tree', 'deciduous', [['Young', 0.20, 2.0, 0.35, 0.30], ['Low', 0.30, 3.0, 0.50, 0.40], ['Medium', 0.40, 3.5, 0.60, 0.45], ['High', 0.50, 4.0, 0.85, 0.60]], 150, 0.50, Object.assign({ rootSrc: 'group default' }, DEC)),
    avocado:    P('Avocado', 'citrus', 'evergreen', [['Young, low', 0.15, 1.5, 0.65, 0.60], ['Medium', 0.40, 2.5, 0.80, 0.70], ['High', 0.55, 3.5, 1.00, 0.85]], 75, 0.70, EVG),
    mango:      P('Mango', 'citrus', 'evergreen', [['Young, low', 0.15, 2.0, 0.40, 0.35], ['Medium', 0.50, 4.0, 0.75, 0.60], ['High', 0.75, 5.0, 0.90, 0.70]], 120, 0.50, Object.assign({ rootSrc: 'group default' }, EVG)),
    datepalm:   P('Date palm', 'palm', 'evergreen', [['Young, low', 0.20, 3.0, 0.50, 0.55], ['Medium', 0.45, 8.0, 0.70, 0.65], ['High', 0.65, 10.0, 0.85, 0.75]], 200, 0.50, EVG),
    coconut:    P('Coconut', 'palm', 'evergreen', [['Young, low', 0.20, 3.0, 0.75, 0.70], ['High', 0.50, 12.0, 0.95, 0.95], ['Very high', 0.65, 15.0, 1.00, 1.00]], 120, 0.50, Object.assign({ rootSrc: 'group default' }, EVG)),
    papaya:     P('Papaya', 'papaya', 'evergreen', [['High', 0.75, 3.0, 1.00, 0.75]], 90, 0.50, Object.assign({ rootSrc: 'group default' }, EVG)),
    guava:      P('Guava', 'citrus', 'evergreen', [['High', 0.75, 4.0, 0.80, 0.60]], 120, 0.50, Object.assign({ rootSrc: 'group default' }, EVG)),
    oilpalm:    P('Oil palm', 'palm', 'evergreen', [['Young', 0.30, 3.0, 0.90, 0.90], ['Mature', 0.70, 8.0, 0.95, 0.95]], 90, 0.65, Object.assign({ kcIni: 0.90 }, EVG)),
    cocoa:      P('Cocoa', 'cocoa', 'evergreen', [['Under high shade canopy', 0.80, 3.0, 1.05, 1.05]], 85, 0.30, Object.assign({ kcIni: 1.00 }, EVG)),
    cherimoya:  P('Cherimoya', 'citrus', 'evergreen', [['Medium', 0.57, 4.0, 0.65, 0.55]], 120, 0.50, Object.assign({ rootSrc: 'group default' }, EVG)),
  });
  for (const k in crops) { const c = crops[k]; c.key = k; if (!c.rootSrc) c.rootSrc = 'tabulated'; }
  const FIELD = Object.keys(crops).filter(k => crops[k].group === 'field'), PERENNIAL = Object.keys(crops).filter(k => crops[k].group === 'perennial');

  // the crop parameters in use for the selected planting density (perennials) and the stage calendar
  function params(key, densIdx, plantDoy) {
    const c = crops[key]; if (!c) return null;
    if (c.group === 'field') {
      const sow = plantDoy == null ? 120 : plantDoy, st = c.stages, L = st.reduce((a, b) => a + b, 0);
      return { key, c, label: c.label, sow, len: L, st, kcIni: c.kcIni, kcMid: c.kcMid, kcEnd: c.kcEnd, fc: c.fc, height: c.height, root: c.root, p: c.p, ky: c.ky, habit: 'annual', dens: null };
    }
    const d = c.densities[Math.max(0, Math.min(c.densities.length - 1, densIdx == null ? Math.floor((c.densities.length - 1) / 2) : densIdx))];
    const kcEnd = d[4], kcMid = d[3], kcIni = c.kcIni != null ? c.kcIni : c.habit === 'evergreen' ? kcEnd : Math.min(0.45, kcEnd);
    const L = c.stages.reduce((a, b) => a + b, 0);
    return { key, c, label: c.label + ' (' + d[0].toLowerCase() + ')', sow: c.start, len: c.habit === 'evergreen' ? 365 : L, st: c.stages, kcIni, kcMid, kcEnd, fc: d[1], height: d[2], root: c.root, p: c.p, ky: null, habit: c.habit, dens: d[0] };
  }
  // daily crop coefficient over the year (FAO-56 four-stage curve; 0 outside the season)
  function kcCurve(pp) {
    const out = new Float32Array(365), [a, b, m, e] = pp.st;
    for (let doy = 0; doy < 365; doy++) {
      let t = doy - pp.sow; if (pp.habit === 'evergreen') t = ((t % 365) + 365) % 365; else { if (t < 0 && pp.sow + pp.len > 365) t += 365; if (t < 0 || t >= pp.len) { out[doy] = 0; continue; } }
      let kc;
      if (t < a) kc = pp.kcIni; else if (t < a + b) kc = pp.kcIni + (pp.kcMid - pp.kcIni) * (t - a) / b;
      else if (t < a + b + m) kc = pp.kcMid; else kc = pp.kcMid + (pp.kcEnd - pp.kcMid) * Math.min(1, (t - a - b - m) / Math.max(1, e));
      out[doy] = kc;
    }
    return out;
  }
  return { crops, FIELD, PERENNIAL, params, kcCurve };
})();
// root-zone parameters of the daily model: unchanged values for the three original crop types, library values otherwise
window.cropRootBase = function (crop) {
  const o = { cereal: 95, legume: 115, vegetable: 45 }[crop]; if (o != null) return o;
  const c = window.CROPLIB.crops[crop]; return c ? c.root : 95;
};
window.cropLam = function (crop) {
  const o = { cereal: 0.32, legume: 0.24, vegetable: 0.40 }[crop]; if (o != null) return o;
  const c = window.CROPLIB.crops[crop]; if (!c) return 0.32;
  return { rice: 0.40, maize: 0.30, millet: 0.30, legume: 0.30, soybean: 0.28, groundnut: 0.34, cotton: 0.26, wheat: 0.32, mustard: 0.28, sorghum: 0.30, cowpea: 0.30, cassava: 0.30, yam: 0.34, vegetable: 0.40 }[c.kind] || 0.22;   // trees, vines and palms: deeper, flatter root distribution
};
// save a file: through the desktop Save dialog when SWAFL runs as the desktop app, otherwise as a browser download
window.saveBytes = function (name, bytes, mime) {
  const host = (function () { try { return (window.parent && window.parent.swafl) || window.swafl || null; } catch (e) { return window.swafl || null; } })();
  if (host && host.saveFile) {
    const u8 = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(String(bytes)); let bin = '';
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return host.saveFile(name, btoa(bin), true);
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: mime || 'application/octet-stream' })); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
};

// root architecture used by the root drawings: fibrous (grasses), tap or woody (legumes, fibre and oil crops, tubers,
// trees, vines and palms) or shallow (vegetables)
window.cropRootType = function (crop) {
  if (crop === 'cereal' || crop === 'legume' || crop === 'vegetable') return crop;
  const c = window.CROPLIB && CROPLIB.crops[crop]; if (!c) return 'cereal';
  if (['rice', 'maize', 'millet', 'sorghum', 'wheat', 'mustard'].includes(c.kind)) return 'cereal';
  if (c.kind === 'vegetable') return 'vegetable';
  return 'legume';
};
