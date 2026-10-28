/* Daisy workbench: the citation that goes with every figure (caption under the figure, and burnt into the saved picture), and the list of references. */
'use strict';
(() => {
  const C = {};
  C.REFS = {
    daisy: 'Hansen, S., Abrahamsen, P., Petersen, C.T., Styczen, M., 2012. Daisy: model use, calibration, and validation. Transactions of the ASABE 55, 1315-1333.',
    holbak: 'Holbak, M., Abrahamsen, P., Grønning, C.R., Klöffel, T., Schwartzkopff, M.V., Styczen, M.E., Svane, S.F., Diamantopoulos, E., 2026. The Daisy model: a tool for simulating agricultural systems - recent (2012-2025) developments, calibrations and validations. Agricultural Systems 238, 104846. https://doi.org/10.1016/j.agsy.2026.104846',
    abrahamsen: 'Abrahamsen, P., Hansen, S., 2000. Daisy: an open soil-crop-atmosphere system model. Environmental Modelling & Software 15, 313-330. https://doi.org/10.1016/S1364-8152(00)00003-7',
    manual: 'Daisy reference manual, version 7.1.14. https://github.com/daisy-model/daisy/releases/download/v7.1.14/reference.pdf',
    openmeteo: 'Zippenfenig, P., 2023. Open-Meteo.com Weather API. Zenodo. https://doi.org/10.5281/zenodo.7970649',
    era5: 'Hersbach, H., et al., 2020. The ERA5 global reanalysis. Quarterly Journal of the Royal Meteorological Society 146, 1999-2049. https://doi.org/10.1002/qj.3803',
    hypres: 'Wösten, J.H.M., Lilly, A., Nemes, A., Le Bas, C., 1999. Development and use of a database of hydraulic properties of European soils. Geoderma 90, 169-185.'
  };
  C.ctx = { weather: '', soil: '', extra: '' };
  const SHORT = 'Daisy 7.1.14 (Hansen et al., 2012; Holbak et al., 2026)';
  // the weather and soil of a run, from its options
  C.describe = function (o, SC) {
    o = o || {}; const r = { weather: '', soil: '', extra: '' };
    if (o.userWx) r.weather = (o.userWx.cite ? o.userWx.cite : 'weather: ' + o.userWx.name) + ', ' + o.userWx.first + '-' + o.userWx.last;
    else if (SC && o.station) { const s = SC.station(o.station); r.weather = 'weather: ' + s.label; }
    if (o.userSoil) r.soil = 'soil: own table of ' + o.userSoil.horizons.length + ' horizons (Daisy HYPRES, Woesten et al., 1999)'; else if (o.soil && SC && SC.OPTIONS.soil) { const f = SC.OPTIONS.soil.opts.find(x => x[0] === String(o.soil)); if (f) r.soil = 'soil: ' + f[1]; }
    if (o.start && o.stop) r.extra = 'years ' + o.start + '-' + o.stop;
    return r;
  };
  C.caption = function (title) {
    const x = C.ctx, d = new Date().toISOString().slice(0, 10), bits = [x.weather, x.soil, x.extra].filter(Boolean);
    return (title ? title.replace(/\s+/g, ' ').trim().replace(/[.:]?$/, '') + '. ' : '') + 'Model: ' + SHORT + (bits.length ? '; ' + bits.join('; ') : '') + '. Drawn with SWAFL on ' + d + '.';
  };
  C.refList = function (keys) { keys = keys || ['daisy', 'holbak']; if (C.ctx.weather && /Open-Meteo/.test(C.ctx.weather)) keys = keys.concat(['openmeteo', 'era5']); if (C.ctx.soil && /HYPRES/.test(C.ctx.soil)) keys = keys.concat(['hypres']); return Array.from(new Set(keys)).map(k => C.REFS[k]); };
  C.refsHtml = function (keys) { const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); return '<h2>References</h2><ol>' + C.refList(keys).map(r => '<li>' + esc(r) + '</li>').join('') + '</ol>'; };
  const titleOf = cv => { const box = cv.closest('.dzfig, .dzcard, .dzpan'); let t = ''; if (box) { const b = box.querySelector('b, h3, h4'); if (b) t = b.textContent; } return t.trim(); };
  const wrap = (g, text, w) => { const words = text.split(' '), lines = []; let cur = ''; words.forEach(x => { const t = cur ? cur + ' ' + x : x; if (g.measureText(t).width > w && cur) { lines.push(cur); cur = x; } else cur = t; }); if (cur) lines.push(cur); return lines; };
  // a picture with the citation under it
  C.png = function (cv, name) {
    const cap = cv.dataset.cite || C.caption(titleOf(cv)), pad = 10, fs = Math.max(11, Math.round(cv.width / 90)), tmp = document.createElement('canvas').getContext('2d'); tmp.font = fs + 'px Segoe UI, Arial';
    const lines = wrap(tmp, cap, cv.width - 2 * pad), h = lines.length * (fs + 4) + 2 * pad, out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height + h; const g = out.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height); g.drawImage(cv, 0, 0); g.fillStyle = '#333'; g.font = fs + 'px Segoe UI, Arial'; g.textBaseline = 'top'; lines.forEach((l, i) => g.fillText(l, pad, cv.height + pad + i * (fs + 4)));
    out.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); });
  };
  // every canvas that appears in the workbench gets its citation line
  C.attach = function (root) {
    const run = () => { root.querySelectorAll('canvas').forEach(cv => { if (cv.dataset.cite || cv.classList.contains('dzNoCite') || !cv.width) return; const t = titleOf(cv), cap = C.caption(t); cv.dataset.cite = cap; const d = document.createElement('div'); d.className = 'dzcite'; d.textContent = cap; d.style.cssText = 'font:11px Segoe UI,Arial;color:#555;margin:2px 0 6px;font-style:italic'; cv.insertAdjacentElement('afterend', d); }); };
    const mo = new MutationObserver(() => { clearTimeout(C._t); C._t = setTimeout(run, 120); }); mo.observe(root, { childList: true, subtree: true }); run(); return mo;
  };
  window.DaisyCite = C;
})();
