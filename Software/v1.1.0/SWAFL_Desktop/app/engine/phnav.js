/* SWAFL 1.1 layer P1 Deterministic phenotyping: a bar of buttons that stays at the top of the window and jumps to each section of the page. */
'use strict';
(function () {
  const cv = document.getElementById('profileCanvas'), wrap0 = document.querySelector('.canvaswrap'); if (!cv || !wrap0) return;
  const LAB = { ctl: 'Set up', twin: 'Plants', film: 'Season film', rootday: 'Roots by day', scans: 'Root scans', series: 'Traits', water: 'Water', carbon: 'Carbon', soil: 'Soil', above: 'Roots and shoot', genome: 'Genotype', traits: 'Trait table', swafl: 'SWAFL data', outlook: 'Outlook', stress: 'Stress calendar', data: 'My data' };
  const nav = document.createElement('nav'); nav.id = 'phNav'; nav.style.display = 'none';
  nav.innerHTML = '<style>#phNav{position:sticky;top:0;z-index:30;display:flex;gap:3px;overflow-x:auto;padding:4px 6px;margin:0 0 6px;background:#D4D0C8;border:1px solid #404040;border-top-color:#fff;border-left-color:#fff;scrollbar-width:thin}' +
    '#phNav button{flex:0 0 auto;height:24px;padding:0 10px;background:#D4D0C8;color:#000;font:12px Tahoma,Arial,sans-serif;border:1px solid #404040;border-top-color:#fff;border-left-color:#fff;cursor:pointer;white-space:nowrap}' +
    '#phNav button:hover{background:#E4E1DA}#phNav button.on{background:#0A246A;color:#fff}</style>';
  { const pc0 = document.getElementById('proCenter'), w0 = pc0 && pc0.querySelector(':scope > .wrap'); if (w0) pc0.insertBefore(nav, w0); else wrap0.parentNode.insertBefore(nav, wrap0); }
  const scroller = () => { let e = cv; while ((e = e.parentElement)) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 4) return e; } return null; };
  const posOf = id => { const y = window.PHUI && PHUI.PH.secY && PHUI.PH.secY[id]; if (y == null) return null; const r = cv.getBoundingClientRect(), sc = scroller(); return r.top + y * r.height / cv.height + (sc ? sc.scrollTop - sc.getBoundingClientRect().top : scrollY); };
  const goTo = id => { const y = posOf(id); if (y == null) return; const sc = scroller(), off = nav.offsetHeight + 6; if (sc) sc.scrollTo({ top: Math.max(0, y - off), behavior: 'smooth' }); else scrollTo({ top: Math.max(0, y - off), behavior: 'smooth' }); };
  let built = '';
  function build(ids) { const k = ids.join(','); if (k === built) return; built = k; [...nav.querySelectorAll('button')].forEach(b => b.remove()); ids.forEach(id => { const b = document.createElement('button'); b.textContent = LAB[id] || id; b.dataset.k = id; b.onclick = () => goTo(id); nav.appendChild(b); }); }
  setInterval(() => {
    const vis = typeof currentScene !== 'undefined' && currentScene && currentScene.id === 'dph' && window.PHUI && PHUI.PH.ran && PHUI.PH.secY && Object.keys(PHUI.PH.secY).length > 0; nav.style.display = vis ? 'flex' : 'none'; if (!vis) return;
    build(Object.keys(PHUI.PH.secY)); const sc = scroller(), cur = (sc ? sc.scrollTop : scrollY) + nav.offsetHeight + 30; let best = null;
    Object.keys(PHUI.PH.secY).forEach(id => { const y = posOf(id); if (y != null && y <= cur) best = id; }); [...nav.querySelectorAll('button')].forEach(b => b.classList.toggle('on', b.dataset.k === best));
  }, 350);
})();
