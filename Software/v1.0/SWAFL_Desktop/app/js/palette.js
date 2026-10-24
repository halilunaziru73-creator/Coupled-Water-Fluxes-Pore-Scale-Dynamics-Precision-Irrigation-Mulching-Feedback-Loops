/* Command palette (Ctrl+K): type to open any layer, run any tool, or jump to a year / date. Arrow keys + Enter. */
'use strict';
const Palette = (() => {
  let root = null, items = [], sel = 0;
  const all = () => {
    const out = [];
    Layers.GROUPS.forEach(g => g.items.forEach(it => out.push({ t: it[1], k: g.name, ic: g.icon, kw: it[1] + ' ' + g.name, run: () => Layers.open(it[0]) })));
    Toolbox.T().forEach(g => g.tools.forEach(t => out.push({ t: t[0], k: g.name, ic: t[1], kw: t[0] + ' ' + (t[3] || '') + ' ' + g.name, run: t[2] })));
    out.push({ t: 'Help: How to use SWAFL', k: 'Help', ic: 'book', kw: 'guide help troubleshoot', run: () => Act.guide() }, { t: 'Help: Keyboard shortcuts', k: 'Help', ic: 'key', kw: 'keys shortcuts', run: () => shortcutsModal() });
    out.push({ t: 'Focus view (fit the whole drawing)', k: 'View', ic: 'search', kw: 'focus fit full screen', run: () => Act.focus && Act.focus() });
    return out;
  };
  const score = (it, q) => { const s = it.kw.toLowerCase(); if (!q) return 1; let n = 0; for (const w of q.toLowerCase().split(/\s+/)) { if (!w) continue; const i = s.indexOf(w); if (i < 0) return 0; n += 10 - Math.min(i, 9) / 2; } return n; };
  function dateItem(q) {
    q = q.trim(); let iso = null, lbl = '';
    if (/^today$/i.test(q)) { const d = new Date(); iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    else if (/^(19[89]\d|20\d\d|2100)$/.test(q)) iso = q + '-06-15';
    else if (/^\d{4}-\d{2}-\d{2}$/.test(q)) iso = q;
    if (!iso) return null;
    return { t: 'Go to date ' + iso, k: 'Date', ic: 'play', run: () => E.setDate(iso) };
  }
  function draw() {
    const q = root.querySelector('input').value, d = dateItem(q);
    items = all().map(i => [i, score(i, q)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 9).map(x => x[0]);
    if (d) items.unshift(d);
    sel = Math.min(sel, Math.max(0, items.length - 1));
    root.querySelector('.pl').innerHTML = items.length ? items.map((i, n) => '<div class="pi' + (n === sel ? ' on' : '') + '" data-n="' + n + '">' + UI.icon(i.ic || 'info') + '<span class="pt">' + UI.esc(i.t) + '</span><span class="pk">' + UI.esc(i.k) + '</span></div>').join('') : '<div class="pe">Nothing matches. Try "drip", "export", "2050" or "today".</div>';
  }
  function close() { if (root) { root.remove(); root = null; } }
  function go(n) { const it = items[n]; close(); if (it) try { it.run(); } catch (e) { UI.toast('Could not run that: ' + e.message); } }
  function open() {
    if (root) return close();
    root = document.createElement('div'); root.className = 'pal';
    root.innerHTML = '<div class="pbox"><input type="text" placeholder="Type what you want to do: drip, export, 2050, today..." aria-label="Command palette" autocomplete="off"><div class="pl"></div><div class="ph">Up / Down to choose &middot; Enter to run &middot; Esc to close</div></div>';
    document.body.appendChild(root); const inp = root.querySelector('input'); inp.focus(); sel = 0; draw();
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, items.length); draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + items.length) % Math.max(1, items.length); draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(sel); } else if (e.key === 'Escape') close();
    });
    root.addEventListener('mousedown', e => { const p = e.target.closest('.pi'); if (p) go(+p.dataset.n); else if (e.target === root) close(); });
  }
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); } });
  return { open, close };
})();
