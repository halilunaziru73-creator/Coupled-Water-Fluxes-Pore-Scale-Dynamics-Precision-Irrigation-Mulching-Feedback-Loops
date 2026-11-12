/* Mouse wheel and touchpad scrolling for every panel, in the desktop program as well as the web page.
   The browser scrolls the panel under the pointer by itself. When it does not (in some desktop windows the wheel is ignored while the
   picture is being drawn, and only the bar at the side works), this file scrolls the same panel by the same amount, so both work.
   Nothing is changed when the browser has already scrolled, when the picture or a control uses the wheel itself, or when the panel cannot scroll. */
(function () {
  'use strict';
  if (window.__wheelFix) return; window.__wheelFix = true;
  function canScroll(el, dy, dx) {
    var cs; try { cs = getComputedStyle(el); } catch (e) { return false; }
    var oy = /(auto|scroll|overlay)/.test(cs.overflowY), ox = /(auto|scroll|overlay)/.test(cs.overflowX);
    if (dy && oy && el.scrollHeight > el.clientHeight + 1 && (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1)) return 'y';
    if (dx && ox && el.scrollWidth > el.clientWidth + 1 && (dx < 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1)) return 'x';
    return false;
  }
  function find(t, dy, dx) {
    for (var el = t; el && el.nodeType === 1; el = el.parentElement) {
      if (el === document.body || el === document.documentElement) break;
      var w = canScroll(el, dy, dx); if (w) return { el: el, ax: w };
    }
    return null;
  }
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.defaultPrevented) return;
    var t = e.target; if (!t || t.nodeType !== 1) return;
    if (/^(CANVAS|TEXTAREA)$/.test(t.tagName) || (t.tagName === 'INPUT' && /^(range|number)$/.test(t.type)) || t.tagName === 'SELECT') return;
    var k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1, dy = e.deltaY * k, dx = e.deltaX * k;
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    var f = find(t, dy, dx); if (!f) return;
    var el = f.el, y0 = el.scrollTop, x0 = el.scrollLeft;
    setTimeout(function () {
      if (e.defaultPrevented || el.scrollTop !== y0 || el.scrollLeft !== x0) return;      // the browser scrolled it: nothing to do
      if (f.ax === 'y') el.scrollTop = y0 + dy; else el.scrollLeft = x0 + dx;
    }, 70);
  }, { capture: true, passive: true });
})();
