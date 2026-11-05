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
  // the same on the page itself: text nodes of the Daisy workbench get real <sub> and <sup>; options of a list (which cannot hold mark-up) get the Unicode form
  const SKIP = { INPUT: 1, TEXTAREA: 1, SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, CANVAS: 1, SUB: 1, SUP: 1, KBD: 1 };
  function dom(el) {
    if (!el || !root.document || el.nodeType !== 1) return; const d = root.document, W = d.createTreeWalker(el, 4, null), list = []; let n;
    while ((n = W.nextNode())) { const t = n.nodeValue; if (!t || (t.indexOf('_') < 0 && t.indexOf('^') < 0 && t.indexOf('DT') < 0)) continue; const pe = n.parentElement; if (!pe || SKIP[pe.tagName] || pe.isContentEditable || pe.closest('pre,code,textarea,[data-nosci]')) continue; if (!/[_^]\{/.test(pre(t))) continue; list.push(n); }
    list.forEach(n => { const pe = n.parentElement, s2 = pre(n.nodeValue); if (pe.tagName === 'OPTION') { n.nodeValue = plain(n.nodeValue); return; }
      const f = d.createDocumentFragment(), re = /([_^])\{([^}]*)\}/g; let k = 0, m; while ((m = re.exec(s2))) { if (m.index > k) f.appendChild(d.createTextNode(s2.slice(k, m.index))); const e = d.createElement(m[1] === '_' ? 'sub' : 'sup'); e.textContent = m[2]; e.style.cssText = 'font-size:.75em;line-height:0'; f.appendChild(e); k = re.lastIndex; } if (k < s2.length) f.appendChild(d.createTextNode(s2.slice(k))); pe.replaceChild(f, n); });
  }
  if (root.document && root.MutationObserver) {
    let tm = 0; const todo = new Set(), inDz = e => e.nodeType === 1 && (/^dz/i.test(e.id || '') || e.closest('[id^="dz"],.dzpan,.dzcard,.dzfig,.dzgrp,.dzraw,.dzres'));
    const flush = () => { tm = 0; todo.forEach(e => { if (e.isConnected) { try { dom(e); } catch (x) { } } }); todo.clear(); };
    const start = () => new MutationObserver(ms => { ms.forEach(m => { m.addedNodes.forEach(a => { const e = a.nodeType === 3 ? a.parentElement : a; if (e && e.nodeType === 1 && inDz(e)) todo.add(e); }); if (m.type === 'characterData' && m.target.parentElement && inDz(m.target.parentElement)) todo.add(m.target.parentElement); }); if (todo.size && !tm) tm = setTimeout(flush, 120); }).observe(root.document.body, { childList: true, subtree: true, characterData: true });
    const go = () => { start(); root.document.querySelectorAll('[id^="dz"],.dzpan').forEach(e => todo.add(e)); if (todo.size && !tm) tm = setTimeout(flush, 120); };
    if (root.document.body) go(); else root.document.addEventListener('DOMContentLoaded', go);
  }
  root.SciText = { unit, plain, pre, sup, dom };
})(typeof window !== 'undefined' ? window : globalThis);
