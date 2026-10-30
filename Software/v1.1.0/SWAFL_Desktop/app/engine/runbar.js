/* SWAFL 1.1 Run simulation for every layer.
   The layers that are not designs compute and draw their results only when the person presses Run simulation, as the irrigation designs do
   (inputs.js). After any change of the settings of the project (Properties) the results wait for the next run, so nothing moves
   or flickers while the controls are being set. Reports and printouts (window.__REPORTING) draw every layer as before. */
'use strict';
(function () {
  if (typeof SCENES === 'undefined' || typeof switchScene !== 'function') return;
  const DES = ['sid', 'drip', 'spr'], RX = {}, UI_ONLY = ['fview', 'range', 'n1Prev'];
  const key = () => { const s = {}; Object.keys(state).forEach(k => { if (UI_ONLY.indexOf(k) < 0) s[k] = state[k]; }); let w = ''; try { w = window.WXD && window.WXD.on ? window.WXD.key : 'rec'; } catch (e) { } let x = ''; try { x = window.RUNKEY_EXTRA ? window.RUNKEY_EXTRA(currentScene.id) : ''; } catch (e) { } return JSON.stringify(s) + '|' + w + '|' + x; };
  const gated = sc => sc && DES.indexOf(sc.id) < 0 && !window.__REPORTING && !window.__NORUNGATE && !document.body.classList.contains('embed');
  function run(id) { const sc = SCENES.find(s => s.id === id); RX[id] = { on: true, st: key(), why: '' }; if (sc && sc.h) { try { setCanvasH(sc.h); } catch (e) { } } if (sc && sc.play) { play.t = 0; play.hold = 0; play.on = true; const pb = document.getElementById('playBtn'); if (pb) pb.textContent = 'Pause'; } }
  window.runLayer = run; window.layerRan = id => id === 'dph' ? !!(window.__phRan && window.__phRan()) : !!(RX[id] && RX[id].on);
  const btn = (x, y, w, h, label) => { ctx.fillStyle = '#0A246A'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#3A6EA5'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h); ctx.fillStyle = '#000'; ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x + w - 2, y, 2, h); T(label, x + w / 2, y + h / 2 + 4, { s: 11, b: true, c: '#FFFFFF', a: 'center' }); };
  function card(sc, R) {
    try { setCanvasH(Math.min(sc.h || 600, 420)); } catch (e) { } paper();
    const bw = Math.min(W - 40, 520), bx = (W - bw) / 2, by = 30, bh = 210;
    ctx.fillStyle = '#D4D0C8'; ctx.fillRect(bx, by, bw, bh); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by, 1, bh); ctx.fillStyle = '#404040'; ctx.fillRect(bx, by + bh - 1, bw, 1); ctx.fillRect(bx + bw - 1, by, 1, bh);
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#0A246A'); g.addColorStop(0.7, '#3A6EA5'); g.addColorStop(1, '#A6CAF0'); ctx.fillStyle = g; ctx.fillRect(bx + 3, by + 3, bw - 6, 20);
    T('Run the simulation: ' + (sc.label || sc.id), bx + 10, by + 17, { s: 11, b: true, c: '#FFFFFF' });
    let y = by + 46; if (sc.title) y += sidWrap(sc.title, bx + 14, y, bw - 28, { s: 10.5, c: '#000' }, 14) * 14 + 6;
    y += sidWrap(R && R.why ? 'The ' + R.why + ': the results wait for a new run.' : 'Set the soil, crop, weather, mulch, irrigation and nitrogen in Properties, then run.', bx + 14, y, bw - 28, { s: 10, c: '#404040' }, 13) * 13 + 6;
    sidWrap('The results, charts and moving pictures are computed from these settings when you press Run, so nothing changes while you set them.', bx + 14, y, bw - 28, { s: 9.5, i: true, c: '#404040' }, 12.5);
    T('▼  Press Run simulation in the bar below this picture.', bx + 14, by + bh - 30, { s: 11, b: true, c: '#0A246A' });
    const pb = document.getElementById('playBtn'); if (pb && pb.textContent !== 'Run simulation') pb.textContent = 'Run simulation';
  }
  function wrap(sc) {
    if (sc._runGate || DES.indexOf(sc.id) >= 0) return; sc._runGate = true; const od = sc.draw;
    sc.draw = function () {
      if (!gated(sc) || sc.id === 'dph') return od.apply(this, arguments);
      const R = RX[sc.id] || (RX[sc.id] = { on: false, st: '', why: '' });
      if (R.on && R.st !== key()) { R.on = false; R.why = 'settings in Properties changed'; try { setCanvasH(Math.min(sc.h || 600, 420)); } catch (e) { } }
      if (!R.on) { play.on = false; play.t = 0; card(sc, R); return; }
      return od.apply(this, arguments);
    };
  }
  SCENES.forEach(wrap);
  // the Play button of a layer that has not run is the Run button
  const pb = document.getElementById('playBtn');
  if (pb) pb.addEventListener('click', e => { const sc = currentScene; if (gated(sc) && sc.id !== 'dph' && !(RX[sc.id] && RX[sc.id].on)) { e.stopImmediatePropagation(); e.preventDefault(); run(sc.id); } }, true);
  // the one Run button: navy and bold while it runs the layer
  { const st = document.createElement('style'); st.textContent = 'body.appmode #playBtn.runme{background:#0A246A !important;color:#fff !important;font-weight:bold !important;border:1px solid #05154a !important;padding:0 16px !important;height:26px !important;font-size:12px !important;line-height:24px !important}'; document.head.appendChild(st); setInterval(() => { const b = document.getElementById('playBtn'); if (b) { const isRun = b.textContent === 'Run simulation'; b.classList.toggle('runme', isRun); b.style.display = isRun && currentScene && DES.indexOf(currentScene.id) >= 0 ? 'none' : ''; } }, 250); }
  // opening a layer never starts it
  const oSwitch = switchScene;
  // a layer always opens at the top of its picture, whatever the position of the layer before it
  const toTop = () => { try { let e = (typeof cv !== 'undefined' && cv) || document.querySelector('canvas'); while (e && (e = e.parentElement)) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollTop) e.scrollTop = 0; } window.scrollTo(0, 0); } catch (e) { } };
  // the layer stays at the top while it draws; the first wheel, touch or key of the person ends it
  let topTok = 0, topUser = false; ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(ev => document.addEventListener(ev, () => { topUser = true; }, true));
  const holdTop = () => { const tok = ++topTok; topUser = false; toTop(); [40, 120, 250, 500, 900, 1500, 2400].forEach(ms => setTimeout(() => { if (tok === topTok && !topUser) toTop(); }, ms)); };
  switchScene = function (sc) { const r = oSwitch.apply(this, arguments); holdTop(); try { if (sc && gated(sc) && sc.id !== 'dph' && !(RX[sc.id] && RX[sc.id].on)) { play.on = false; play.t = 0; } } catch (e) { } return r; };
})();
