/* Scientific notation of displayed text (display only; the names used inside the program are not changed).
   Chemical formulas (N2O -> N₂O), reference and crop symbols (ET0 -> ET₀, Kc -> K_c, K_OC -> K_OC subscript,
   θs -> θ_s) and units (m2 -> m², cm3 -> cm³, kg ha-1 -> kg ha⁻¹, ^2 -> ²).
   - HTML text gets real <sub>/<sup>; text inside inputs, selects, editors, code and SVG is left as it is.
   - Text drawn on a canvas gets the Unicode sub/superscripts that exist (fillText and measureText agree). */
(function () {
  'use strict';
  const CHEM = /\b(N2O|CO2|NO3|NH4|NH3|NO2|H2O|CH4)(?![A-Za-z0-9])/g;
  const ETS = /\bET(0|c|a|p)(?![A-Za-z0-9])/g;
  const KS = /\bK_?(cb|c|sat|s|OC|oc)(?![A-Za-z0-9])/g;
  const TH = /θ_?(s|r|fc|wp)(?![A-Za-z0-9])/g;
  const UNIT = /(^|[^A-Za-z0-9_])((?:k|c|m|d|µ|μ)?m)(2|3)(?![0-9A-Za-z])/g;
  const CARET = /\^(-?\d+)/g;
  const NEG = /\b(ha|yr|day|kg|cm|mm|Mg|d|s|h|g|L|m|t|y)-1(?![0-9A-Za-z])/g;
  const SLASH = /(^|[^A-Za-z0-9_/])(mm|cm|m|km|Mg|kg N|kg|g|t|L|m³|m3|mm³)\/(yr|year|ha|day|d|h|s|season|m)(?![A-Za-z0-9_/])/g;
  const ANY = /N2O|CO2|NO3|NH4|NH3|NO2|H2O|CH4|ET[0cap]|K_?(?:cb|c|sat|s|OC|oc)|θ|m[23]|\^-?\d|-1|\/(?:yr|year|ha|day|d|h|s|season|m)\b/;

  // ---- HTML: replace a text node by text + <sub>/<sup>
  const html = s => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(CHEM, (m, f) => f.replace(/(\d)/g, '<sub>$1</sub>'))
    .replace(ETS, (m, a) => 'ET<sub>' + a + '</sub>')
    .replace(KS, (m, a) => 'K<sub>' + a + '</sub>')
    .replace(TH, (m, a) => 'θ<sub>' + a + '</sub>')
    .replace(UNIT, (m, pre, u, e) => pre + u + '<sup>' + e + '</sup>')
    .replace(CARET, (m, e) => '<sup>' + e.replace('-', '−') + '</sup>')
    .replace(NEG, (m, u) => u + '<sup>−1</sup>');
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CODE', 'PRE', 'SUB', 'SUP', 'KBD', 'SAMP', 'CANVAS']);
  const skip = el => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (SKIP.has(e.tagName) || e.isContentEditable || e.namespaceURI === 'http://www.w3.org/2000/svg' ||
          (e.dataset && 'nosci' in e.dataset) || (e.classList && (e.classList.contains('CodeMirror') || e.classList.contains('nosci')))) return true;
    }
    return false;
  };
  function fixText(t) {
    const s = t.data; if (!s || !ANY.test(s) || !t.parentNode || skip(t.parentNode)) return;
    const h = html(s); if (h === s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')) return;
    const span = document.createElement('span'); span.innerHTML = h;
    const frag = document.createDocumentFragment(); while (span.firstChild) frag.appendChild(span.firstChild);
    t.parentNode.replaceChild(frag, t);
  }
  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if (root.nodeType === 1 && skip(root)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) if (ANY.test(n.data)) list.push(n);
    list.forEach(fixText);
  }
  let queue = new Set(), planned = false;
  const flush = () => { planned = false; const q = queue; queue = new Set(); q.forEach(n => { if (n.isConnected) scan(n); }); };
  const plan = n => { queue.add(n); if (!planned) { planned = true; requestAnimationFrame(flush); } };
  function startDom() {
    scan(document.body);
    new MutationObserver(ms => ms.forEach(m => {
      if (m.type === 'characterData') plan(m.target);
      else m.addedNodes.forEach(plan);
    })).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  // titles (tooltips) in Unicode
  // ---- Unicode for canvas text and tooltips
  const SUBD = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const SUBL = { a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', h: 'ₕ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', p: 'ₚ', s: 'ₛ', t: 'ₜ', r: 'ᵣ' };
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };
  const subOr = (s, plain) => { const o = [...s].map(c => SUBD[c] || SUBL[c]); return o.every(Boolean) ? o.join('') : plain; };
  const mk = () => !!(window.SciText && window.SciText.pre);       // the canvas typesetter of scitext.js reads X_{..} and ^{..}
  const sb = (t, plainSub) => mk() ? '_{' + t + '}' : subOr(t, plainSub);
  const sp = t => mk() ? '^{' + t.replace('-', '\u2212') + '}' : [...t].map(c => SUP[c] || c).join('');
  const uni = s => {
    if (typeof s !== 'string' || !ANY.test(s)) return s;
    return s
      .replace(CHEM, (m, f) => f.replace(/\d+/g, d => mk() ? '_{' + d + '}' : [...d].map(x => SUBD[x]).join('')))
      .replace(ETS, (m, a) => 'ET' + sb(a, a))
      .replace(KS, (m, a) => 'K' + sb(a, a.toUpperCase() === 'OC' ? 'oc' : a))
      .replace(TH, (m, a) => 'θ' + sb(a, a))
      .replace(UNIT, (m, pre, u, e) => pre + u + sp(e))
      .replace(CARET, (m, e) => sp(e))
      .replace(NEG, (m, u) => u + sp('-1'))
      .replace(SLASH, (m, pre, a, b) => pre + a + ' ' + (b === 'day' ? 'd' : b === 'year' ? 'yr' : b) + sp('-1'));
  };
  window.SciNote = { html, uni, scan };
  // canvas: what is measured is what is drawn
  try {
    const P = CanvasRenderingContext2D.prototype;
    ['fillText', 'strokeText', 'measureText'].forEach(k => {
      const f = P[k]; if (!f || f.__sci) return;
      const g = function (t, ...a) { return f.call(this, uni(t), ...a); }; g.__sci = true; P[k] = g;
    });
  } catch (e) {}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDom); else startDom();
})();
