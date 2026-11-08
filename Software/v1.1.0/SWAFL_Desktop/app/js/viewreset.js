/* Back to the real design. The browser remembers its zoom for each site, so a refresh keeps a zoomed view. When the page sees that the zoom is not 100 % it shows a small button "Reset view"; one click (or Ctrl+0) brings the design back to its real size. */
'use strict';
(() => {
  let pill = null, comp = 1;
  const ratio = () => { const o = window.outerWidth, i = window.innerWidth; return (o > 300 && i > 200) ? o / i : 1; };
  const snap = r => { const S = [.25, .33, .5, .67, .75, .8, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]; return S.reduce((a, b) => Math.abs(b - r) < Math.abs(a - r) ? b : a); };
  function reset() {
    const z = snap(ratio() / comp);
    try { if (window.UIScale) { UIScale.set(0); } } catch (e) { }
    comp = 1; if (!window.UIScale) document.documentElement.style.zoom = '';
    const r = snap(ratio());
    if (r !== 1) { comp = 1 / r; if (window.UIScale) UIScale.set(comp); else document.documentElement.style.zoom = comp; }
    window.dispatchEvent(new Event('resize')); check();
  }
  function check() {
    const r = snap(ratio()), off = r !== 1 && comp === 1;
    if (!off) { if (pill) pill.style.display = 'none'; return; }
    if (!pill) {
      pill = document.createElement('button'); pill.type = 'button';
      pill.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483000;font:600 12px "IBM Plex Mono",Consolas,monospace;background:#0E3B2A;color:#F5D06B;border:1.5px solid #D4A94A;border-radius:18px;padding:7px 13px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.4)';
      pill.title = 'The browser zoom is not 100 %. Click to bring the design back to its real size (the same as Ctrl+0).'; pill.onclick = reset; document.body.appendChild(pill);
    }
    pill.textContent = 'Zoom ' + Math.round(r * 100) + '% · Reset view'; pill.style.display = '';
  }
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && (e.key === '0')) setTimeout(() => { comp = 1; if (window.UIScale) UIScale.set(0); else document.documentElement.style.zoom = ''; check(); }, 150); });
  window.addEventListener('resize', () => setTimeout(check, 200));
  window.addEventListener('load', () => setTimeout(check, 400));
})();
