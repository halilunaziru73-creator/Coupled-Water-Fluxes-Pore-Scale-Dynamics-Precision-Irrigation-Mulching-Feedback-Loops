/* A sign of work for everything that takes a moment: a card at the lower left with a moving bar (or a bar that fills when the amount is known).
   SWBusy.begin('Loading the Daisy tools') gives a handle: h.set(percent, 'text'), h.end(). Several tasks at once are listed one under the other. */
'use strict';
window.SWBusy = (() => {
  const tasks = new Map(); let box = null, n = 0, timer = 0;
  function mk() {
    const st = document.createElement('style');
    st.textContent = '#swBusy{position:fixed;left:16px;bottom:34px;z-index:9400;width:330px;font:12.5px Tahoma,"Segoe UI",Arial,sans-serif;color:#10213f;display:none}#swBusy .bt{background:#fff;border:1px solid #0A246A;box-shadow:0 4px 18px rgba(10,36,106,.3);padding:8px 12px;margin-top:6px}#swBusy .bh{display:flex;align-items:center;gap:9px}#swBusy .bs{width:16px;height:16px;border:3px solid #cfd9ee;border-top-color:#0A246A;border-radius:50%;animation:swbs .8s linear infinite;flex:none}#swBusy .bl{flex:1;min-width:0;font-weight:bold;color:#0A246A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#swBusy .bb{height:6px;background:#e4e7ec;border-radius:3px;margin:6px 0 3px;position:relative;overflow:hidden}#swBusy .bi{height:6px;background:#2b83ba;border-radius:3px;width:0;transition:width .25s}#swBusy .bd{position:absolute;top:0;height:6px;width:35%;background:#2b83ba;border-radius:3px;animation:swbm 1.2s ease-in-out infinite}#swBusy .bx{color:#556;font-size:11.5px}@keyframes swbs{to{transform:rotate(360deg)}}@keyframes swbm{0%{left:-35%}100%{left:100%}}@media (prefers-reduced-motion:reduce){#swBusy .bs,#swBusy .bd{animation:none}}';
    document.head.appendChild(st); box = document.createElement('div'); box.id = 'swBusy'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box);
  }
  function paint() {
    if (!box) mk(); if (!tasks.size) { box.style.display = 'none'; box.innerHTML = ''; clearInterval(timer); timer = 0; return; }
    box.style.display = 'block'; let h = ''; const now = Date.now();
    tasks.forEach(t => { const k = Math.round((now - t.t0) / 1000); h += '<div class="bt"><div class="bh"><span class="bs"></span><span class="bl">' + t.label.replace(/</g, '&lt;') + (t.pct != null ? ' · ' + Math.round(t.pct) + ' %' : '') + '</span></div><div class="bb">' + (t.pct != null ? '<div class="bi" style="width:' + t.pct + '%"></div>' : '<div class="bd"></div>') + '</div><div class="bx">' + (t.note ? t.note.replace(/</g, '&lt;') + ' · ' : '') + (k < 90 ? k + ' s' : Math.floor(k / 60) + ' min ' + (k % 60) + ' s') + '</div></div>'; });
    box.innerHTML = h;
  }
  // the card appears only if the work lasts a little (no flicker for quick things)
  function begin(label, opt) {
    const id = ++n, t = { label, pct: null, note: '', t0: Date.now(), shown: false }; const delay = (opt && opt.delay != null) ? opt.delay : 350;
    const show = () => { if (tasks.has(id) || t.done) return; tasks.set(id, t); paint(); if (!timer) timer = setInterval(paint, 1000); };
    if (delay) t.w = setTimeout(show, delay); else show();
    return { set(p, note, lab) { if (p != null) t.pct = Math.max(0, Math.min(100, p)); if (note != null) t.note = note; if (lab) t.label = lab; if (tasks.has(id)) paint(); }, end() { t.done = true; clearTimeout(t.w); if (tasks.delete(id)) paint(); } };
  }
  return { begin };
})();
