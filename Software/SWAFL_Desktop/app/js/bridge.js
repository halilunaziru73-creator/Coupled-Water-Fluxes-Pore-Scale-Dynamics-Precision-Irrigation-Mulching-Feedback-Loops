/* SWAFL bridge: the workbench talks to the simulation engine (iframe, same origin) through this object only. */
'use strict';
const E = (() => {
  const frame = document.getElementById('engine');
  const subs = {};
  const api = {
    frame, win: null, ready: false, snap: null, _last: '',
    on(ev, fn) { (subs[ev] = subs[ev] || []).push(fn); },
    emit(ev, a) { (subs[ev] || []).forEach(fn => { try { fn(a); } catch (e) { console.error(e); } }); },

    /* run code inside the engine (global scope, so let/const of the engine are visible) */
    ev(code) { try { return api.win.eval(code); } catch (e) { UI && UI.log('Engine: ' + e.message, 'err'); return undefined; } },
    json(expr) { const s = api.ev('JSON.stringify(' + expr + ')'); return s === undefined ? undefined : JSON.parse(s); },

    /* ---- navigation ---- */
    scene(id) { api.ev("switchScene(SCENES.find(function(s){return s.id==='" + id + "'}))"); api.poll(true); },
    scrollTo(sceneId, title) {
      const sec = api.json('window.__SEC||{}') || {}, m = (sec[sceneId] || {})[title]; if (!m) return false;
      const cv = api.win.document.getElementById('profileCanvas'), wrap = api.win.document.querySelector('.canvaswrap');
      if (cv && wrap) { wrap.scrollTo({ top: Math.max(0, m[0] * cv.clientWidth / m[1] - 34), behavior: 'smooth' }); return true; }
      return false;
    },
    scrollTop() { const w = api.win && api.win.document.querySelector('.canvaswrap'); if (w) w.scrollTo({ top: 0, behavior: 'smooth' }); },

    /* ---- state ---- */
    set(o) { api.ev('applyState(' + JSON.stringify(o) + ')'); api.poll(true); },
    setMulch(k) { api.ev("setMulch('" + k + "')"); api.poll(true); },
    setYear(v) { const s = api.win.document.getElementById('dssYear'); if (s) { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); } api.poll(true); },
    setDate(v) { const s = api.win.document.getElementById('dssDate'); if (s) { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); } api.poll(true); },
    preset(v) { const s = api.win.document.getElementById('guiPreset'); if (s) { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); } api.poll(true); },
    click(id) { const b = api.win.document.getElementById(id); if (b) b.click(); api.poll(true); },
    togglePlay() { api.click('playBtn'); },
    restart() { api.ev('play.t=0;play.on=true;play.hold=0;'); const b = api.win.document.getElementById('playBtn'); if (b) b.textContent = 'Pause'; api.poll(true); },
    reset() { api.ev('applyState(' + JSON.stringify(api.defaults) + ')'); api.poll(true); },
    redraw() { api.ev('refresh()'); },
    canvasPNG() { const c = api.win.document.getElementById('profileCanvas'); return c ? c.toDataURL('image/png') : null; },
    print() { try { api.win.focus(); api.win.print(); } catch (e) { window.print(); } },

    /* ---- snapshot of everything the panels need ---- */
    take() {
      return api.json(`(function(){
        var g=function(i){var e=document.getElementById(i);return e?e.textContent:''};
        var o={state:state,scene:currentScene.id,sceneLabel:currentScene.label,playOn:play.on,playT:play.t,
          vals:{tc:g('tcVal'),vff:g('vffVal'),cap:g('capVal'),rain:g('rainVal'),temp:g('tempVal'),trig:g('trigVal'),z:g('zVal'),n:g('nVal')},
          ro:{evap:g('roEvap'),drain:g('roDrain'),irr:g('roIrr'),yield:g('roYield'),transp:g('roTransp'),et:g('roET'),nl:g('roNL'),ie:g('roIE'),rain:g('roRain'),baseIrr:g('roBaseIrr')},
          year:(document.getElementById('dssYear')||{}).value,date:isoDate(dateOfK(fclock.kd())),dateLbl:fmtDate(dateOfK(fclock.kd()))+' (weather like '+(1980+yearOf(fclock.kd()))+')',
          sec:window.__SEC||{}};
        return o;})()`);
    },
    poll(force) {
      if (!api.ready) return;
      let s; try { s = api.take(); } catch (e) { return; } if (!s) return;
      const str = JSON.stringify(s);
      if (!force && str === api._last) return;
      const prev = api.snap; api._last = str; api.snap = s;
      api.emit('snap', { s, prev });
      if (!prev || prev.scene !== s.scene) api.emit('scene', s);
      if (!prev || JSON.stringify(prev.state) !== JSON.stringify(s.state) || prev.year !== s.year || prev.date !== s.date) api.emit('state', s);
    },

    /* ---- data from the engine ---- */
    meta() {
      return api.json(`({soils:DATA.soils,soilLabels:DATA.soil_labels,tills:TILL_LABELS,crops:Object.keys(CROPS).map(function(k){return[k,CROPS[k].label]}),
        methods:METHODS.map(function(m){return[m.k,m.label]}),mulches:MULCHES.map(function(m){return[m.k,m.label]}),
        scenes:SCENES.map(function(s){return[s.id,s.label,s.title||'']}),
        presets:[].map.call(document.querySelectorAll('#guiPreset option'),function(o){return[o.value,o.textContent]}),
        years:[].map.call(document.querySelectorAll('#dssYear option'),function(o){return[o.value,o.textContent]}),
        defaults:state,NYR:NYR,DPY:DPY})`);
    },
    day() {
      return api.json(`(function(){var sim=seasonSim(true),rows=dssRows(sim),adv=dssAdvice(sim,rows),k=fclock.kd(),r0=rows[0],nx=rows.slice(1),yt=yearTable(sim)[yearOf(k)]||{};
        return{date:fmtDate(dateOfK(k)),like:1980+yearOf(k),mode:dss.mode,N:dss.ahead,head:adv.head,text:adv.text,tone:adv.tone,crop:cropNameAt(sim,k),rd:sim.rd[k],f:r0.f,fT:sim.fTrigRaw,
        rain:r0.rain,evap:r0.evap,irr:r0.irr,tr:r0.tr,dr:r0.dr,next:{rain:sumKey(nx,'rain'),irr:sumKey(nx,'irr'),evap:sumKey(nx,'evap'),tr:sumKey(nx,'tr'),dr:sumKey(nx,'dr')},year:yt}})()`);
    },
    season() {
      return api.json(`(function(){var r=seasonSim(true);var f=function(a){return a?Array.prototype.slice.call(a):[]};
        return{yI:f(r.yI),yD:f(r.yD),yRain:f(r.yRain),yE:f(r.yE),yT:f(r.yT),yR:f(r.yR),meanIrr:r.meanIrr,meanDrain:r.meanDrain,cal0:CAL0}})()`);
    },
    design(scene) {
      const fn = { sid: 'sidRun', drip: 'drRun', spr: 'spRun' }[scene]; if (!fn) return null;
      return api.json(`(function(){var R=${fn}();var o={};for(var k in R){if(typeof R[k]==='number'&&isFinite(R[k]))o[k]=R[k];else if(typeof R[k]==='string')o[k]=R[k]}return o})()`);
    },
    optimiseSurface() { return api.ev('(function(){try{sidApply(SIDOPT.best.d);return true}catch(e){return false}})()'); },

    /* ---- start-up ---- */
    start() {
      return new Promise(res => {
        const t0 = Date.now(), iv = setInterval(() => {
          try {
            const w = frame.contentWindow;
            if (w && w.document.getElementById('profileCanvas') && w.eval("typeof SCENES!=='undefined'&&typeof state!=='undefined'&&typeof switchScene==='function'&&typeof DATA!=='undefined'")) {
              clearInterval(iv); api.win = w; api.ready = true;
              api.defaults = JSON.parse(w.eval('JSON.stringify(state)'));
              // visit the three design scenes once so their section headings become layer sub-nodes
              const keep = w.eval('currentScene.id'), sw = id => { try { w.eval("switchScene(SCENES.find(function(s){return s.id==='" + id + "'}))"); } catch (e) {} };
              const seq = ['sid', 'drip', 'spr', keep]; let i = 0;
              (function step() { sw(seq[i]); i++; if (i < seq.length) setTimeout(step, 420); else setTimeout(() => { const t = new Date(), p = n => String(n).padStart(2, '0'); api.setDate(t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate())); api.ev('dssHold()'); api.poll(true); res(true); }, 300); })();
            } else if (Date.now() - t0 > 40000) { clearInterval(iv); res(false); }
          } catch (e) { /* not loaded yet */ }
        }, 150);
      });
    }
  };
  setInterval(() => { if (!document.hidden) api.poll(false); }, 900);
  return api;
})();
