/* Daisy workbench: the citation that goes with every figure (caption under the figure, and burnt into the saved picture), and the list of references. */
'use strict';
(() => {
  const C = {};

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
  // No citation is added to any figure: the pictures carry only their own title and axes.
  C.caption = function () { return ''; };
  C.refsHtml = function () { return ''; };
  // the picture exactly as drawn
  C.png = function (cv, name) {
    const list = (Array.isArray(cv) ? cv : [cv]).filter(c => c && c.width), W = Math.max.apply(null, list.map(c => c.width)), H = list.reduce((a, c) => a + c.height, 0), out = document.createElement('canvas'); if (!list.length) return;
    out.width = W; out.height = H; const g = out.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); let y = 0; list.forEach(c => { g.drawImage(c, 0, y); y += c.height; });
    out.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); });
  };
  C.attach = function (root) {
    const run = () => { root.querySelectorAll('.dzcite').forEach(d => d.remove()); };
    const mo = new MutationObserver(() => { clearTimeout(C._t); C._t = setTimeout(run, 120); }); mo.observe(root, { childList: true, subtree: true }); run(); return mo;
  };
  window.DaisyCite = C;
})();
