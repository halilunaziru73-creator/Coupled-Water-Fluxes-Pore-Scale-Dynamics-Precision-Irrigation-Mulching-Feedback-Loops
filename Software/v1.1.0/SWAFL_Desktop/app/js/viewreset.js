/* Always the real design. The browser remembers its zoom for each site, so a refresh keeps a zoomed view. This script measures the browser zoom (window width divided by page width), and when it is not 100 % it scales the page by the opposite amount, so the design looks as it was made, at once on every load and whenever the zoom is changed.
   A small button "Original design: on/off" at the bottom right lets you turn the correction off to use your own zoom. */
'use strict';
(() => {
  const S = [.25, .33, .5, .67, .75, .8, .9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
  let on = true, comp = 1, pill = null, man = 0, sel = null;
  try { man = +localStorage.getItem('viewreset.manual') || 0; } catch (e) { }
  try { on = sessionStorage.getItem('viewreset.off') !== '1'; } catch (e) { }
  const raw = () => { const o = window.outerWidth, i = window.innerWidth; return (o > 300 && i > 200) ? o / i : 1; };
  const snap = r => { const b = S.reduce((a, c) => Math.abs(c - r) < Math.abs(a - r) ? c : a); return Math.abs(b - r) < 0.06 * b ? b : 1; };
  function put(z) {
    comp = z;
    if (window.UIScale) UIScale.set(z === 1 ? 0 : z); else document.documentElement.style.zoom = z === 1 ? '' : z;
    window.dispatchEvent(new Event('resize'));
  }
  function fix() {
    const r = man ? man : snap(raw()), want = (man || (on && r !== 1)) ? 1 / r : 1;
    if (Math.abs(want - comp) > 0.001) put(want);
    button(r); chooser();
  }
  function chooser() {
    if (sel) { sel.value = String(man); return; }
    sel = document.createElement('select'); sel.title = 'If the design is not at its real size, choose the zoom that your browser shows in the address bar. The page then scales itself back to the real design and keeps this choice after a refresh.';
    sel.style.cssText = 'position:fixed;right:14px;bottom:52px;z-index:2147483000;font:600 12px "IBM Plex Mono",Consolas,monospace;background:#0E3B2A;color:#F5D06B;border:1.5px solid #D4A94A;border-radius:14px;padding:4px 8px;cursor:pointer;opacity:.82';
    sel.innerHTML = '<option value="0">Zoom: automatic</option>' + [.25, .33, .5, .67, .75, .8, .9, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5].map(z => '<option value="' + z + '">My browser is at ' + Math.round(z * 100) + '%</option>').join('') + '<option value="1">My browser is at 100% (no change)</option>';
    sel.onchange = () => { man = +sel.value; try { if (man) localStorage.setItem('viewreset.manual', man); else localStorage.removeItem('viewreset.manual'); } catch (e) { } fix(); };
    document.body.appendChild(sel); sel.value = String(man);
  }
  function button(r) {
    if (r === 1 || man) { if (pill) pill.style.display = 'none'; return; }
    if (!pill) {
      pill = document.createElement('button'); pill.type = 'button';
      pill.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:2147483000;font:600 12px "IBM Plex Mono",Consolas,monospace;background:#0E3B2A;color:#F5D06B;border:1.5px solid #D4A94A;border-radius:18px;padding:7px 13px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.4);zoom:1';
      pill.onclick = () => { on = !on; try { sessionStorage.setItem('viewreset.off', on ? '0' : '1'); } catch (e) { } fix(); };
      document.body.appendChild(pill);
    }
    pill.style.zoom = String(comp === 1 ? 1 : 1 / comp * (1));
    pill.textContent = on ? 'Browser zoom ' + Math.round(r * 100) + '% corrected · click for my zoom' : 'Zoom ' + Math.round(r * 100) + '% · click for the original design';
    pill.title = on ? 'The design is shown at its real size although the browser zoom is ' + Math.round(r * 100) + '%. Click to use your own zoom instead.' : 'Click to bring the design back to its real size.';
    pill.style.display = '';
  }
  let t = null; const later = () => { clearTimeout(t); t = setTimeout(fix, 120); };
  window.addEventListener('resize', later);
  window.addEventListener('load', () => { fix(); setTimeout(fix, 600); });
  document.addEventListener('DOMContentLoaded', fix);
})();
