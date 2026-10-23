/* Properties panel: every input of the model, arranged in collapsible groups and kept in sync with the engine. */
'use strict';
const Props = (() => {
  const host = document.getElementById('props');
  let built = false, closed = {};
  const SL = (key, label, max, vk) => ({ t: 'slider', key, label, max, vk });
  function groups() {
    const M = E.metaData;
    return [
      { id: 'p-scn', name: 'Scenario', rows: [
        { t: 'select', label: 'Ready-made case', id: 'preset', opts: [['', 'Choose a case...']].concat(M.presets.filter(p => p[0] !== '')), on: v => { if (v !== '') Act.preset(v); } },
        { t: 'select', label: 'Year', id: 'calyear', opts: Array.from({ length: 121 }, (_, i) => [String(1980 + i), String(1980 + i)]), get: s => (s.date || '').slice(0, 4), on: v => { const d = (E.snap && E.snap.date) || (v + '-06-01'); let md = d.slice(4); if (md === '-02-29' && +v % 4) md = '-02-28'; if (+v >= 2000 && E.snap && !['typ', 'dry', 'wet'].includes(E.snap.year)) { E.ev("dss.mode='typ';var _ys=document.getElementById('dssYear');if(_ys)_ys.value='typ'"); } E.setDate(v + md); } },
        { t: 'select', label: 'Weather of years after 1999', id: 'year', opts: [['typ', 'Typical year'], ['dry', 'Dry year'], ['wet', 'Wet year']], get: s => (['typ', 'dry', 'wet'].includes(s.year) ? s.year : 'typ'), on: v => E.setYear(v) },
        { t: 'note', text: 'Years 1980 to 1999 use the recorded weather of that year; later years use the weather pattern chosen above, or your imported weather (File menu).' },
        { t: 'date', label: 'Date in the season', id: 'date', get: s => s.date, on: v => E.setDate(v) },
        { t: 'select', label: 'Weather source', id: 'wxsrc', opts: [['record', 'Recorded weather of the simulations'], ['file', 'Imported weather file'], ['online', 'Online weather of a location']], get: s => (s.wx && s.wx.src) || 'record', dis: (s, v) => v !== 'record' && !(s.wx && s.wx[v]), on: v => { if (v === 'record' || (E.snap.wx && E.snap.wx[v])) WxUI.use(v); else if (v === 'file') WxUI.importFile(); else WxUI.online(); } },
        { t: 'btns', btns: [['Import weather...', () => WxUI.importFile()], ['Online weather...', () => WxUI.online()]] } ] },
      { id: 'p-soil', name: 'Soil and field', rows: [
        { t: 'select', label: 'Soil', id: 'soil', opts: M.soils.map(k => [k, M.soilLabels[k] || k]), get: s => s.state.soil, on: v => E.set({ soil: v }) },
        { t: 'seg', label: 'Tillage', id: 'till', opts: Object.entries(M.tills), get: s => s.state.till, on: v => E.set({ till: v }) },
        { t: 'select', label: 'Crop', id: 'crop', opts: M.crops, groups: M.cropGroups, get: s => s.state.crop, on: v => E.set({ crop: v }) },
        SL('tcIdx', 'Structural consolidation rate', 4, 'tc'),
        { t: 'note', text: 'In your Daisy runs (E5) the consolidation rate changes the results only in the five finer soils (loam to silty clay loam: up to 6 mm/yr of drainage and 14 kg N/ha of leaching); in the five coarser soils all rates give the same result.' } ] },
      { id: 'p-mul', name: 'Mulch', rows: [
        { t: 'select', label: 'Material', id: 'mulch', opts: M.mulches, get: s => s.state.mulchType, on: v => E.setMulch(v) },
        SL('vffIdx', 'Strength (vapour-flux factor)', 9, 'vff'), SL('capIdx', 'Interception capacity (mm)', 3, 'cap') ] },
      { id: 'p-wx', name: 'Weather and climate', rows: [ SL('rainIdx', 'Rainfall scale (x baseline)', 9, 'rain'), SL('tempIdx', 'Temperature shift', 9, 'temp') ] },
      { id: 'p-irr', name: 'Irrigation', rows: [
        { t: 'select', label: 'Method', id: 'method', opts: M.methods, get: s => s.state.method, on: v => E.set({ method: v }) },
        SL('trigIdx', 'Trigger (sensor suction)', 19, 'trig'), SL('zIdx', 'Sensor depth', 19, 'z') ] },
      { id: 'p-n', name: 'Nutrients', rows: [ SL('nIdx', 'Nitrogen rate (% of standard)', 9, 'n') ] },
      { id: 'p-act', name: 'Design shortcuts', rows: [ { t: 'btns', btns: [
        ['Surface design', () => Layers.open('sid')], ['Drip design', () => Layers.open('drip')], ['Sprinklers and pipes', () => Layers.open('spr')], ['Optimise surface', () => Act.optimise()] ] },
        { t: 'note', text: 'The layout drawings, pipe network and design checks are in the Irrigation design layers. Click inside the drawing to move items, or use the buttons above.' } ] }
    ];
  }
  function build() {
    let h = '';
    groups().forEach(g => {
      h += '<div class="pg" data-g="' + g.id + '"><div class="pgh" data-gh="' + g.id + '"><span class="tw">' + (closed[g.id] ? '&#9654;' : '&#9660;') + '</span>' + g.name + '</div><div class="pgb" ' + (closed[g.id] ? 'hidden' : '') + '>';
      g.rows.forEach((r, i) => {
        const rid = g.id + '-' + i;
        if (r.t === 'select') { const op = o => '<option value="' + UI.esc(o[0]) + '">' + UI.esc(o[1]) + '</option>'; h += '<div class="pr"><label>' + r.label + '</label><select data-r="' + rid + '">' + (r.groups && r.groups.length ? r.groups.map(g => '<optgroup label="' + UI.esc(g[0]) + '">' + g[1].map(op).join('') + '</optgroup>').join('') : r.opts.map(op).join('')) + '</select></div>'; }
        else if (r.t === 'date') h += '<div class="pr"><label>' + r.label + '</label><input type="date" data-r="' + rid + '"></div>';
        else if (r.t === 'seg') h += '<div class="pr"><label>' + r.label + '</label><div class="seg" data-r="' + rid + '">' + r.opts.map(o => '<button data-v="' + UI.esc(o[0]) + '">' + UI.esc(o[1]) + '</button>').join('') + '</div></div>';
        else if (r.t === 'slider') h += '<div class="pr"><label>' + r.label + '<b data-val="' + r.vk + '"></b></label><input type="range" min="0" max="' + r.max + '" step="1" data-r="' + rid + '" data-key="' + r.key + '"></div>';
        else if (r.t === 'btns') h += '<div class="pr btnrow">' + r.btns.map((b, j) => '<button class="btn" data-b="' + rid + ':' + j + '">' + b[0] + '</button>').join('') + '</div>';
        else if (r.t === 'note') h += '<div class="pnote">' + r.text + '</div>';
      });
      h += '</div></div>';
    });
    host.innerHTML = h; built = true;
    const map = {}; groups().forEach(g => g.rows.forEach((r, i) => { map[g.id + '-' + i] = r; }));
    host.querySelectorAll('select[data-r]').forEach(el => el.addEventListener('change', () => { const r = map[el.dataset.r]; r.on(el.value); if (r.id === 'preset') el.value = ''; }));
    host.querySelectorAll('input[type=date][data-r]').forEach(el => el.addEventListener('change', () => map[el.dataset.r].on(el.value)));
    host.querySelectorAll('.seg[data-r]').forEach(el => el.addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) map[el.dataset.r].on(b.dataset.v); }));
    host.querySelectorAll('input[type=range]').forEach(el => el.addEventListener('input', () => { E.set({ [el.dataset.key]: +el.value }); }));
    host.querySelectorAll('[data-b]').forEach(el => el.addEventListener('click', () => { const [rid, j] = el.dataset.b.split(':'); map[rid].btns[+j][1](); }));
    host.querySelectorAll('[data-gh]').forEach(el => el.addEventListener('click', () => { const id = el.dataset.gh; closed[id] = !closed[id]; build(); update(E.snap); }));
    host.__map = map;
  }
  function update(s) {
    if (!built || !s) return;
    const map = host.__map;
    host.querySelectorAll('[data-r]').forEach(el => {
      const r = map[el.dataset.r]; if (!r) return;
      if (el.matches('select') && r.dis) [...el.options].forEach(o => { o.disabled = !!r.dis(s, o.value); });
      if (el.matches('select') && r.get) { const v = r.get(s); if (v !== undefined && document.activeElement !== el && el.value !== String(v)) el.value = v; }
      else if (el.matches('input[type=date]') && r.get) { const v = r.get(s); if (v && document.activeElement !== el && el.value !== v) el.value = v; }
      else if (el.classList.contains('seg')) el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === r.get(s)));
      else if (el.matches('input[type=range]')) { const v = s.state[el.dataset.key]; if (document.activeElement !== el && +el.value !== v) el.value = v; }
    });
    host.querySelectorAll('[data-val]').forEach(el => { el.textContent = s.vals[el.dataset.val] || ''; });
  }
  function setAll(open) { groups().forEach(g => { closed[g.id] = !open; }); build(); update(E.snap); }
  document.querySelector('[data-act=expandProps]').onclick = () => setAll(true);
  document.querySelector('[data-act=collapseProps]').onclick = () => setAll(false);
  E.on('snap', ({ s }) => { if (!built && E.metaData) build(); update(s); });
  return { build, update };
})();
