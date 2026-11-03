/* SWAFL safety net, loaded first. It never changes what the program does; it only makes sure that one failing part cannot freeze or break the rest:
   - errors that nobody catches are written to the log of the program (and to the console) and shown once as a quiet message, never as a blank page;
   - Guard.every(fn, ms) is a timer that sleeps while the window is hidden, and stops itself with a message after repeated failures;
   - Guard.safe(fn) runs a function and reports its error instead of throwing;
   - Guard.bigText(n) tells the editors when a text is too large for live colouring. */
'use strict';
window.Guard = (() => {
  const seen = {}; let shown = 0;
  const say = (m, key) => { try { if (key && seen[key] > 2) return; if (key) seen[key] = (seen[key] || 0) + 1; if (window.UI && UI.log) UI.log(m); else console.warn(m); } catch (e) { } };
  const toast = m => { try { if (shown++ > 2) return; const d = document.createElement('div'); d.textContent = m; d.style.cssText = 'position:fixed;right:14px;bottom:34px;z-index:99999;background:#FFFFE1;border:1px solid #808080;padding:7px 12px;font:12px Tahoma,Arial,sans-serif;max-width:360px;box-shadow:2px 2px 0 #404040'; document.body.appendChild(d); setTimeout(() => d.remove(), 6000); } catch (e) { } };
  window.addEventListener('error', ev => { say('A part of the program failed and was skipped: ' + (ev.message || 'error') + (ev.filename ? ' (' + String(ev.filename).split('/').pop() + ':' + ev.lineno + ')' : ''), String(ev.message)); toast('One part of the program had a problem and was skipped. The rest keeps working; the details are in the Messages tab.'); });
  window.addEventListener('unhandledrejection', ev => { const m = ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason || 'failed'); say('A background task failed and was skipped: ' + m, m); try { ev.preventDefault(); } catch (e) { } });
  const timers = [];
  const every = (fn, ms, name) => { let bad = 0, h = null; const t = { name: name || 'task', stop: () => { clearInterval(h); h = null; } }; h = setInterval(() => { if (document.hidden) return; try { const r = fn(); if (r && r.catch) r.catch(e => { bad++; say((name || 'A timer') + ': ' + e.message, name); if (bad >= 5) { t.stop(); say((name || 'A timer') + ' was stopped after repeated errors; reload the page to start it again.'); } }); bad = 0; } catch (e) { bad++; say((name || 'A timer') + ': ' + e.message, name); if (bad >= 5) { t.stop(); say((name || 'A timer') + ' was stopped after repeated errors; reload the page to start it again.'); } } }, ms); timers.push(t); return t; };
  const safe = (fn, fallback, name) => { try { return fn(); } catch (e) { say((name || 'A step') + ' failed: ' + e.message, name); return fallback; } };
  return { every, safe, say, toast, bigText: n => n > 200000, timers };
})();
