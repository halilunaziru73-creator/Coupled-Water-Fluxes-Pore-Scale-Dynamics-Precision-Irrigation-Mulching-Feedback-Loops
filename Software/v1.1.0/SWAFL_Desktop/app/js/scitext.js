/* Scientific typesetting for the figures: subscripts and superscripts on every canvas of the program, and units in the form of a paper.
   A text such as  K_oc, K_{OC}, DT_50, m^2  or  theta_s  is drawn as K with a small oc below, DT with a small 50 below, m with a small 2 above;
   units are written in the form of a paper: "m^2/m^2" as "m² m⁻²", "kg N/ha/season" as "kg N ha⁻¹ season⁻¹". Only a single letter (or DT)
   before the underscore is set as a subscript, so that names of files such as r000-Annual_FN are never changed. */
'use strict';
(function (root) {
  if (root.SciText) return;
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺' };
  const sup = s => String(s).replace(/[0-9+-]/g, c => SUP[c]);
  // a unit as in a paper: numerator, then each denominator term with a negative power
  function unit(u) {
    u = String(u == null ? '' : u).trim(); if (!u) return u; if (/⁻|²|³/.test(u) && u.indexOf('/') < 0) return u;
    u = u.replace(/\bdg C\b/g, '°C').replace(/\s+per\s+/g, '/').replace(/\^(-?\d+)/g, (m, n) => sup(n)).replace(/\b([A-Za-z]{1,3})(\d)\b/g, (m, a, d) => /^(mm|cm|dm|m|km|kg|g|mg|ha|l|L|d|h)$/.test(a) ? a + sup(d) : m);
    const parts = u.split('/'); if (parts.length < 2) return parts[0];
    const pw = t => { const m = /^(.*?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/.exec(t.trim()); if (m) { const n = m[2].replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => Object.keys(SUP).find(k => SUP[k] === c)); return m[1] + sup('-' + n); } return t.trim() + '⁻¹'; };
    return [parts[0].trim()].concat(parts.slice(1).map(pw)).join(' ');
  }
  // markup -> plain text with Unicode super and subscripts where they exist
  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', 's': 'ₛ', 'o': 'ₒ', 'a': 'ₐ', 'e': 'ₑ', 'x': 'ₓ', 'n': 'ₙ', 'p': 'ₚ', 't': 'ₜ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', '-': '₋', '+': '₊' };
  const BASE = '(?:DT|[A-Za-zα-ωΑ-Ω])';
  const pre = s => String(s).replace(new RegExp('(^|[^A-Za-z0-9_{])(' + BASE + ')_([A-Za-z0-9]{1,4})(?![A-Za-z0-9_])', 'g'), '$1$2_{$3}').replace(/\bDT(50|90)\b/g, 'DT_{$1}').replace(/\^(-?\d+)/g, '^{$1}');
  const plain = s => pre(s).replace(/_\{([^}]*)\}/g, (m, t) => t.split('').every(c => SUB[c.toLowerCase()]) ? t.split('').map(c => SUB[c.toLowerCase()]).join('') : '_' + t).replace(/\^\{([^}]*)\}/g, (m, t) => sup(t));
  // canvas: fillText and measureText draw the marked parts smaller and raised or lowered
  const P = root.CanvasRenderingContext2D && root.CanvasRenderingContext2D.prototype;
  if (P && !P.__sci) {
    P.__sci = 1; const oF = P.fillText, oM = P.measureText, oS = P.strokeText, quick = t => typeof t === 'string' && (t.indexOf('_') >= 0 || t.indexOf('^') >= 0 || t.indexOf('DT') >= 0);
    const segs = s => { const out = [], re = /([_^])\{([^}]*)\}/g; let k = 0, m; while ((m = re.exec(s))) { if (m.index > k) out.push([s.slice(k, m.index), 0]); out.push([m[2], m[1] === '_' ? 1 : 2]); k = re.lastIndex; } if (k < s.length) out.push([s.slice(k), 0]); return out; };
    const layout = (g, s) => { const f0 = g.font, sz = +((/(\d+(?:\.\d+)?)px/.exec(f0) || [])[1]) || 12, small = f0.replace(/(\d+(?:\.\d+)?)px/, (sz * 0.72).toFixed(2) + 'px'); let x = 0; const L = segs(s).map(([t, k]) => { g.font = k ? small : f0; const w = oM.call(g, t).width; const o = { t, k, x, w, f: k ? small : f0, dy: k === 1 ? sz * 0.24 : k === 2 ? -sz * 0.42 : 0 }; x += w; return o; }); g.font = f0; return { L, w: x }; };
    const draw = (fn, g, text, x, y, mw) => { const s = pre(text); if (!/[_^]\{/.test(s)) return fn.call(g, text, x, y, mw); const { L, w } = layout(g, s), al = g.textAlign, f0 = g.font, x0 = (al === 'center') ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x; g.textAlign = 'left'; L.forEach(o => { g.font = o.f; fn.call(g, o.t, x0 + o.x, y + o.dy); }); g.font = f0; g.textAlign = al; };
    P.fillText = function (t, x, y, mw) { if (!quick(t)) return oF.call(this, t, x, y, mw); return draw(oF, this, t, x, y, mw); };
    P.strokeText = function (t, x, y, mw) { if (!quick(t)) return oS.call(this, t, x, y, mw); return draw(oS, this, t, x, y, mw); };
    P.measureText = function (t) { if (!quick(t)) return oM.call(this, t); const s = pre(t); if (!/[_^]\{/.test(s)) return oM.call(this, t); const r = oM.call(this, 'M'), w = layout(this, s).w; return { width: w, actualBoundingBoxLeft: 0, actualBoundingBoxRight: w, actualBoundingBoxAscent: r.actualBoundingBoxAscent, actualBoundingBoxDescent: r.actualBoundingBoxDescent, fontBoundingBoxAscent: r.fontBoundingBoxAscent, fontBoundingBoxDescent: r.fontBoundingBoxDescent }; };
  }
  root.SciText = { unit, plain, pre, sup };
})(typeof window !== 'undefined' ? window : globalThis);
