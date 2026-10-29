/* Text size of the whole program. Automatic: the wider the window, the larger the text, so that it stays easy to read on a large or high resolution screen.
   View > Text size: larger, smaller, automatic. The choice is kept in the browser storage when it is available. */
'use strict';
window.UIScale = (() => {
  let pref = 0; try { pref = +localStorage.getItem('swafl.textsize') || 0; } catch (e) { }
  const ff = false;
  const auto = () => ff ? 1 : Math.max(1.2, Math.min(2.2, Math.round(window.innerWidth / 1200 * 20) / 20));
  const cur = () => ff ? 1 : (pref || auto());
  const apply = () => {
    const z = cur(), app = document.getElementById('app'); document.documentElement.style.zoom = z === 1 ? '' : z; document.documentElement.style.setProperty('--us', z);
    if (app) app.style.height = z === 1 ? '' : (window.innerHeight / z) + 'px';
    window.dispatchEvent(new Event('swafl-scale'));
  };
  const set = v => { pref = v; try { if (v) localStorage.setItem('swafl.textsize', v); else localStorage.removeItem('swafl.textsize'); } catch (e) { } apply(); window.dispatchEvent(new Event('resize')); };
  const step = d => set(Math.max(0.8, Math.min(2.6, Math.round((cur() + d) * 20) / 20)));
  window.addEventListener('resize', () => { if (!pref) apply(); else apply(); });
  document.addEventListener('DOMContentLoaded', apply); apply();
  return { cur, auto, set, step, apply, pct: () => Math.round(cur() * 100) + '%' };
})();
