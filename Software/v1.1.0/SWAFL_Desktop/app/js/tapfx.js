/* Touch response. The look of a button, row or tab changes on the touch itself (pointerdown), not when the finger is lifted, and a thin progress line
   at the top of the window with a progress cursor shows at once whenever the program is busy (a long click handler, a loading window or a long run). */
(function () {
  'use strict'; if (window.__tapFx) return; window.__tapFx = true;
  var SEL = 'button,.btn,[role=button],[role=menuitem],[role=treeitem],.tn,.mi,.pi,.dtab,.chip,summary,label,a', last = null;
  function up() { if (last) { last.classList.remove('tap'); last = null; } }
  document.addEventListener('pointerdown', function (e) { var t = e.target && e.target.closest ? e.target.closest(SEL) : null; if (!t || t.disabled) return; last = t; t.classList.add('tap'); }, { capture: true, passive: true });
  ['pointerup', 'pointercancel', 'pointerleave', 'dragstart', 'blur'].forEach(function (ev) { document.addEventListener(ev, up, { capture: true, passive: true }); });
  var bar = document.createElement('div'); bar.id = 'busyBar'; (document.body || document.documentElement).appendChild(bar);
  var n = 0, tm = 0;
  window.swaflBusy = function (on) { n = Math.max(0, n + (on ? 1 : -1)); clearTimeout(tm); if (n) { bar.classList.add('on'); document.body && document.body.classList.add('busy'); tm = setTimeout(function () { n = 0; window.swaflBusy.off(); }, 60000); } else window.swaflBusy.off(); };
  window.swaflBusy.off = function () { bar.classList.remove('on'); document.body && document.body.classList.remove('busy'); };
  // a click that keeps the program busy for more than 120 ms: show the progress line from the next frame until it is done
  document.addEventListener('click', function () {
    var t0 = performance.now(); requestAnimationFrame(function () { var d = performance.now() - t0; if (d > 120) { bar.classList.add('on'); setTimeout(function () { if (!n) bar.classList.remove('on'); }, 600); } });
  }, { capture: true, passive: true });
  // while the engine window is loading
  var ev = document.getElementById('engVeil'); if (ev) window.swaflBusy(true);
  var f = document.getElementById('engine'); if (f) f.addEventListener('load', function () { setTimeout(function () { if (!document.getElementById('engVeil')) window.swaflBusy(false); }, 300); });
})();
