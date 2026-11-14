/* Small screens (phones, narrow windows): one pane at a time, switched from a bar at the bottom: Layers, Picture, Properties, Results.
   Opening a layer returns to the picture. Wide screens keep the usual four-panel workbench. */
'use strict';
(function () {
  const bar = document.getElementById('paneBar'); if (!bar) return;
  const mq = window.matchMedia('(max-width:900px)');
  let pane = 'picture';
  const set = p => { pane = p; document.body.dataset.pane = p; bar.querySelectorAll('button').forEach(b => { const on = b.dataset.p === p; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); try { window.dispatchEvent(new Event('resize')); } catch (e) { } };
  const apply = () => { document.body.classList.toggle('narrow', mq.matches); if (mq.matches) set(pane); else { delete document.body.dataset.pane; } };
  bar.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(b.dataset.p); });
  // a layer opened from the list takes the person to the picture
  const tree = document.getElementById('layerTree'); if (tree) tree.addEventListener('click', e => { if (mq.matches && e.target.closest('[data-scene]') && !e.target.closest('[data-twist]')) setTimeout(() => set('picture'), 60); });
  if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  apply();
})();
