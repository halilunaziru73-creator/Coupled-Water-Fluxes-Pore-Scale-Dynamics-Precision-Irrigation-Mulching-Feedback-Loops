/* SWAFL UI toolkit: icons, menus, modals, toast, message log, splitters. */
'use strict';
const UI = (() => {
  const P = {   // 24x24 stroke icons
    new: 'M6 3h8l4 4v14H6z M14 3v4h4', open: 'M3 7h6l2 2h10v10H3z', save: 'M5 3h12l3 3v15H5z M8 3v6h8V3 M8 21v-7h8v7',
    img: 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15 9h.01', csv: 'M5 3h10l4 4v14H5z M8 12h8 M8 16h8 M12 10v8', print: 'M7 8V3h10v5 M5 8h14v9h-3v4H8v-4H5z',
    undo: 'M9 7L4 12l5 5 M4 12h10a6 6 0 010 8', redo: 'M15 7l5 5-5 5 M20 12H10a6 6 0 000 8', reset: 'M4 12a8 8 0 1114 5 M4 5v7h7',
    play: 'M7 4l13 8-13 8z', pause: 'M7 4h4v16H7z M14 4h4v16h-4z', restart: 'M5 5v14 M9 12l10-7v14z', pin: 'M12 3l4 5-2 4v3l-2 6-2-6v-3l-2-4z',
    refresh: 'M20 12a8 8 0 11-3-6 M20 4v6h-6', help: 'M12 3a9 9 0 100 18 9 9 0 000-18z M9.5 9.5a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4 M12 17h.01',
    github: 'M9 19c-4 1-4-2-6-2 M15 22v-3.5c0-1 .1-1.4-.5-2 3-.3 6-1.5 6-6.5a5 5 0 00-1.4-3.5 4.6 4.6 0 00-.1-3.5s-1.2-.3-3.6 1.4a12 12 0 00-6.8 0C6.200 3.700 5 4 5 4a4.600 4.600 0 00-.1 3.500A5 5 0 003.500 11c0 5 3 6.200 6 6.500-.6.600-.6 1.200-.5 2V22',
    layers: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5', tool: 'M14 6a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 01-2-2z', chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-8',
    drop: 'M12 3s6 6.500 6 11a6 6 0 01-12 0c0-4.500 6-11 6-11z', soil: 'M3 8h18 M3 13h18 M3 18h18 M7 5v3 M15 5v3', sun: 'M12 8a4 4 0 100 8 4 4 0 000-8z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
    pipe: 'M3 9h12a3 3 0 013 3v9 M3 9v6 M18 21h-3', sprinkler: 'M12 20v-8 M12 12l-5-5 M12 12l5-5 M12 12V4 M8 20h8', folder: 'M3 6h7l2 2h9v11H3z', info: 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 11v6 M12 7.500h.01',
    gear: 'M12 9a3 3 0 100 6 3 3 0 000-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2', search: 'M11 4a7 7 0 100 14 7 7 0 000-14z M16 16l5 5',
    exit: 'M9 4H4v16h5 M16 8l4 4-4 4 M20 12H9', copy: 'M8 8h12v12H8z M4 4h12v3 M4 4v12h3', fit: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5', doc: 'M6 3h9l4 4v14H6z M9 12h7 M9 16h7',
    run: 'M5 4l14 8-14 8z', field: 'M3 18l5-9 5 6 3-4 5 7z', book: 'M5 4h13v16H7a2 2 0 01-2-2z M5 18a2 2 0 012-2h11', key: 'M3 7h18v10H3z M7 11h.01 M11 11h.01 M15 11h.01 M8 14h8',
    bug: 'M9 7a3 3 0 016 0 M7 9h10v6a5 5 0 01-10 0z M3 11h4 M17 11h4 M3 17h4 M17 17h4', zoom: 'M11 4a7 7 0 100 14 7 7 0 000-14z M8 11h6 M11 8v6 M16 16l5 5', cloud: 'M7 18a4 4 0 010-8 5 5 0 019.500-1A4 4 0 0117 18z'
  };
  const icon = (n, cls) => '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + (P[n] || P.info) + '"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---- message log ---- */
  const logs = [];
  function log(msg, level) {
    const d = new Date(), t = [d.getHours(), d.getMinutes(), d.getSeconds()].map(x => String(x).padStart(2, '0')).join(':');
    logs.push({ t, msg, level: level || 'info' }); if (logs.length > 400) logs.shift();
    document.dispatchEvent(new CustomEvent('swafl-log'));
  }

  /* ---- toast ---- */
  function toast(msg) {
    let el = document.getElementById('toast'); if (el) el.remove();
    el = document.createElement('div'); el.id = 'toast'; el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---- menus ---- */
  const root = document.getElementById('ctxMenu');
  let openBar = null;
  function closeMenus() { root.hidden = true; root.innerHTML = ''; document.querySelectorAll('.menu.subm').forEach(m => m.remove()); document.querySelectorAll('.mbtn.open').forEach(b => b.classList.remove('open')); openBar = null; }
  function fill(el, defs) {
    el.innerHTML = '';
    defs.forEach(d => {
      if (d.sep) { const s = document.createElement('div'); s.className = 'msep'; el.appendChild(s); return; }
      const dis = d.dis && d.dis();
      const it = document.createElement('div'); it.className = 'mi' + (d.sub ? ' sub' : '') + (dis ? ' dis' : '');
      const chk = d.check ? '<span class="mcheck">' + (d.check() ? '&#10003;' : '') + '</span>' : '';
      it.innerHTML = chk + (d.icon ? icon(d.icon) : (d.check ? '' : '<span class="ico"></span>')) + '<span>' + esc(d.label) + '</span>' + (d.key ? '<span class="key">' + esc(d.key) + '</span>' : '');
      if (d.sub) {
        it.addEventListener('mouseenter', () => {
          document.querySelectorAll('.menu.subm').forEach(m => { if (m.__level >= (el.__level || 0) + 1) m.remove(); });
          const sm = document.createElement('div'); sm.className = 'menu subm'; sm.__level = (el.__level || 0) + 1;
          fill(sm, typeof d.sub === 'function' ? d.sub() : d.sub); document.body.appendChild(sm);
          const r = it.getBoundingClientRect();
          sm.style.left = Math.min(r.right - 2, innerWidth - sm.offsetWidth - 4) + 'px'; sm.style.top = Math.max(2, Math.min(r.top - 3, innerHeight - sm.offsetHeight - 4)) + 'px';
        });
      } else if (!dis) {
        it.addEventListener('mouseenter', () => document.querySelectorAll('.menu.subm').forEach(m => { if (m.__level >= (el.__level || 0) + 1) m.remove(); }));
        it.addEventListener('click', ev => { ev.stopPropagation(); closeMenus(); if (d.act) d.act(); });
      }
      el.appendChild(it);
    });
  }
  function showMenu(defs, x, y) {
    closeMenus(); root.hidden = false; fill(root, defs);
    root.style.left = Math.min(x, innerWidth - root.offsetWidth - 4) + 'px'; root.style.top = Math.min(y, innerHeight - root.offsetHeight - 4) + 'px';
  }
  function buildMenubar(menus) {
    const bar = document.getElementById('menus'); bar.innerHTML = '';
    menus.forEach(m => {
      const b = document.createElement('div'); b.className = 'mbtn'; b.textContent = m.label;
      const open = () => { const r = b.getBoundingClientRect(); showMenu(typeof m.items === 'function' ? m.items() : m.items, r.left, r.bottom); b.classList.add('open'); openBar = b; };
      b.addEventListener('click', ev => { ev.stopPropagation(); if (openBar === b) closeMenus(); else open(); });
      b.addEventListener('mouseenter', () => { if (openBar && openBar !== b) { closeMenus(); open(); } });
      bar.appendChild(b);
    });
  }
  document.addEventListener('click', closeMenus);
  window.addEventListener('blur', closeMenus);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenus(); closeModal(); } });

  /* ---- modal ---- */
  function closeModal() { document.getElementById('modalRoot').innerHTML = ''; }
  function modal(o) {
    const r = document.getElementById('modalRoot');
    r.innerHTML = '<div class="ov"><div class="modal" style="' + (o.width ? 'width:' + o.width : '') + '"><div class="mh">' + icon(o.icon || 'info') + '<span>' + esc(o.title) + '</span><span class="x" data-x>&#10005;</span></div><div class="mb">' + o.html + '</div><div class="mf"></div></div></div>';
    const mf = r.querySelector('.mf');
    (o.buttons || [{ label: 'Close', pri: true }]).forEach(b => {
      const el = document.createElement('button'); el.className = 'btn' + (b.pri ? ' pri' : ''); el.textContent = b.label;
      el.addEventListener('click', () => { if (!b.act || b.act() !== false) closeModal(); }); mf.appendChild(el);
    });
    r.querySelector('[data-x]').addEventListener('click', closeModal);
    r.querySelector('.ov').addEventListener('mousedown', e => { if (e.target.classList.contains('ov')) closeModal(); });
    r.querySelectorAll('a[data-url]').forEach(a => a.addEventListener('click', () => openExternal(a.dataset.url)));
    return r;
  }

  /* ---- external links ---- */
  function openExternal(url) { if (window.swafl) window.swafl.openExternal(url); else window.open(url, '_blank', 'noopener'); }

  /* ---- file output (desktop dialog or browser download) ---- */
  async function saveFile(name, data, isBase64, mime) {
    if (window.swafl) { const r = await window.swafl.saveFile(name, data, !!isBase64); if (r.ok) { toast('Saved ' + r.path); log('Saved file: ' + r.path); } return r.ok; }
    const blob = isBase64 ? new Blob([Uint8Array.from(atob(data), c => c.charCodeAt(0))], { type: mime || 'application/octet-stream' }) : new Blob([data], { type: mime || 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('Saved ' + name); log('Saved file: ' + name); return true;
  }
  function pickFileText() {
    if (window.swafl) return window.swafl.openFile().then(r => r.ok ? { name: r.path.split(/[\\/]/).pop(), data: r.data } : null);
    return new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.swafl,.json'; i.onchange = () => { const f = i.files[0]; if (!f) return res(null); const rd = new FileReader(); rd.onload = () => res({ name: f.name, data: rd.result }); rd.readAsText(f); }; i.click(); });
  }

  /* ---- splitters ---- */
  function hsplit(el, target, side, min, max) {
    el.addEventListener('mousedown', e => {
      e.preventDefault(); el.classList.add('drag'); const x0 = e.clientX, w0 = target.getBoundingClientRect().width;
      const fr = document.getElementById('engine'); fr.style.pointerEvents = 'none';
      const mv = ev => { const d = (ev.clientX - x0) * (side === 'left' ? 1 : -1); target.style.width = Math.max(min, Math.min(max, w0 + d)) + 'px'; };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); el.classList.remove('drag'); fr.style.pointerEvents = ''; };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
  }
  function vsplit(el, getTarget, dir, min, max) {   // dir 'down': dragging down grows target; 'up': dragging up grows target
    el.addEventListener('mousedown', e => {
      e.preventDefault(); el.classList.add('drag'); const t = getTarget(), y0 = e.clientY, h0 = t.getBoundingClientRect().height;
      const fr = document.getElementById('engine'); fr.style.pointerEvents = 'none';
      const mv = ev => { const d = (ev.clientY - y0) * (dir === 'up' ? -1 : 1); const h = Math.max(min, Math.min(max, h0 + d)); t.style.height = h + 'px'; t.style.flex = 'none'; };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); el.classList.remove('drag'); fr.style.pointerEvents = ''; };
      document.addEventListener('mousemove', mv); document.addEventListener('mouseup', up);
    });
  }
  return { icon, esc, log, logs, toast, showMenu, closeMenus, buildMenubar, modal, closeModal, openExternal, saveFile, pickFileText, hsplit, vsplit };
})();
