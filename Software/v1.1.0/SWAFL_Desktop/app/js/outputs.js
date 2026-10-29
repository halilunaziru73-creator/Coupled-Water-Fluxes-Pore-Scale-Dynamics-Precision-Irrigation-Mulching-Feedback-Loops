/* SWAFL layers: the outputs of every layer, with the same tools as the Daisy workbench.
   - A bar above the simulation window: collapse the picture, title and caption for the saved picture, save the picture at screen, 300 dpi, 600 dpi or the highest
     resolution the computer can draw (the layer is drawn again at that size, so lines and letters stay sharp), copy it, save the live numbers, save and load the
     settings of the widgets, and save every layer at once.
   - On every section of the dashboard: collapse, save as a picture at 300 or 600 dpi, copy, and save the numbers of its tables and charts.
   - A Figure tab: the map of the processes of Daisy (Fig. 1 style) marked for the layer; choose a process and the outputs that depend on it light up, choose an output
     and its processes light up. */
'use strict';
window.SWOut = (() => {
  const O = {}, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sane = t => String(t || 'swafl').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'swafl';
  const stamp = n => (window.SWAFLDate ? SWAFLDate.name(n) : n), wait = ms => new Promise(r => setTimeout(r, ms));
  const raf = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const blobOf = cv => new Promise(res => cv.toBlob(res, 'image/png'));
  const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = stamp(name); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const csvText = rows => rows.map(r => r.map(v => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\r\n');
  const mem = { title: '', caption: '', hi: 0 };
  const layerName = () => { try { return Layers.nameOf(E.snap.scene); } catch (e) { return (E.snap && E.snap.scene) || 'SWAFL'; } };

  // the line under a picture: what the layer was set to, so that the picture can be understood on its own
  function settings() {
    let t = {}; try { t = E.json("({soil:DATA.soil_labels[state.soil],till:TILL_LABELS[state.till],crop:(CROPS[state.crop].label||state.crop)})") || {}; } catch (e) { }
    const p = [layerName()]; if (t.soil) p.push('soil: ' + t.soil); if (t.till) p.push('tillage: ' + t.till); if (t.crop) p.push('crop: ' + t.crop); if (E.snap && E.snap.date) p.push('date: ' + E.snap.date);
    return p.join('; ') + '. SWAFL 1.1.0, ' + (window.SWAFLDate ? SWAFLDate.pretty(new Date()) : '') + '.';
  }
  // a picture with a title above and the caption below, as a figure in a paper
  function frameCanvas(src, title, extra) {
    const S = Math.max(1, src.width / Math.max(300, src.clientWidth || src.width || 1)), u = Math.max(1, Math.round(src.width / 900 * 10) / 10), pad = 12 * u, th = title ? 30 * u : 0, lines = [];
    const cap = [extra, mem.caption].filter(Boolean).join(' '), tmp = document.createElement('canvas').getContext('2d'); tmp.font = (12 * u) + 'px Arial';
    const maxW = src.width - 2 * pad; let cur = ''; (cap + ' ' + settings()).split(/\s+/).forEach(w => { if (tmp.measureText(cur + ' ' + w).width > maxW && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); if (cur) lines.push(cur);
    const fh = lines.length * 16 * u + pad, out = document.createElement('canvas'); out.width = src.width; out.height = Math.round(src.height + th + fh); const g = out.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height); if (title) { g.fillStyle = '#0A246A'; g.font = 'bold ' + (16 * u) + 'px Arial'; g.textBaseline = 'alphabetic'; g.fillText(title, pad, 21 * u); }
    g.drawImage(src, 0, th); g.fillStyle = '#333'; g.font = (12 * u) + 'px Arial'; lines.forEach((l, i) => g.fillText(l, pad, th + src.height + 16 * u * (i + 1) - 2 * u)); return out;
  }
  // the simulation picture, drawn again at a scale (1.5 about screen, 3.125 = 300 dpi, 6.25 = 600 dpi, 0 = the highest the computer allows)
  async function enginePicture(scale, noFrame) {
    const w = E.win, cv = w.document.getElementById('profileCanvas'); if (!cv) return null; const keep = w.__hiScale;
    try {
      w.__hiScale = scale === 0 ? 8 : (scale > 1.6 ? scale : null); w.__rephys(); E.ev('refresh()'); await raf(); await wait(120);
      const blobIn = await new Promise(r => cv.toBlob(r, 'image/png')), img = await createImageBitmap(blobIn), c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0);
      c.clientWidth0 = cv.width; return noFrame ? c : frameCanvas(c, mem.title || layerName() + (E.snap && E.snap.title ? ': ' + E.snap.title : ''));
    } finally { w.__hiScale = keep || null; w.__rephys(); E.ev('refresh()'); }
  }
  const SC = { screen: 1.5, 300: 3.125, 600: 6.25, max: 0 };
  async function savePicture(k) {
    const cv = await enginePicture(SC[k]); if (!cv) return; const b = await blobOf(cv); dl(b, 'SWAFL_' + sane(E.snap.scene) + (k === 'screen' ? '' : '_' + (k === 'max' ? 'max-res' : k + 'dpi')) + '.png'); UI.toast('Picture saved (' + cv.width + ' x ' + cv.height + ' pixels)');
  }
  async function copyPicture() { const cv = await enginePicture(SC['300']); const b = await blobOf(cv); try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); UI.toast('Picture copied'); } catch (e) { UI.toast('The picture could not be copied here; use Save'); } }
  function saveNumbers() { let t = ''; try { t = E.win.__csvText(); } catch (e) { } if (!t) { UI.toast('This layer has no numbers to save'); return; } dl(new Blob(['﻿' + t], { type: 'text/csv' }), 'SWAFL_' + sane(E.snap.scene) + '_numbers.csv'); }
  function saveWidget() { const o = { swafl: '1.1.0', scene: E.snap.scene, state: E.snap.state, date: E.snap.date || null, title: mem.title, caption: mem.caption, saved: new Date().toISOString() }; dl(new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' }), 'SWAFL_' + sane(E.snap.scene) + '_widgets.json'); }
  function loadWidget(file) { file.text().then(t => { try { const o = JSON.parse(t); if (!o.state) throw new Error('not a SWAFL widget file'); if (o.scene) E.scene(o.scene); E.set(o.state); if (o.date) E.setDate && E.setDate(o.date); mem.title = o.title || ''; mem.caption = o.caption || ''; bar(); UI.toast('Widgets set as saved'); } catch (e) { UI.toast('Could not load: ' + e.message); } }); }
  async function allLayers(btn) {
    const ids = (E.metaData && E.metaData.scenes ? E.metaData.scenes.map(s => s[0]) : E.json('SCENES.map(function(s){return s.id})')), keep = E.snap.scene, files = {}; if (!window.DaisyExp) { UI.toast('The zip writer is not loaded'); return; }
    for (let i = 0; i < ids.length; i++) { if (btn) btn.textContent = 'Layer ' + (i + 1) + ' of ' + ids.length + '...'; E.scene(ids[i]); await wait(900); try { const cv = await enginePicture(SC['300']); const b = await blobOf(cv); files['SWAFL_layers/' + String(i + 1).padStart(2, '0') + '_' + sane(ids[i]) + '.png'] = new Uint8Array(await b.arrayBuffer()); } catch (e) { console.warn(ids[i], e); } try { const t = E.win.__csvText(); if (t) files['SWAFL_layers/' + String(i + 1).padStart(2, '0') + '_' + sane(ids[i]) + '_numbers.csv'] = '﻿' + t; } catch (e) { } }
    E.scene(keep); dl(new Blob([window.DaisyExp.zip(files)], { type: 'application/zip' }), 'SWAFL_all_layers.zip'); if (btn) btn.textContent = 'Every layer (zip)';
  }

  // ---------------------------------------------------------------- the bar above the simulation window
  let barEl = null, folded = false;
  function bar() {
    if (!barEl) { const vb = document.getElementById('viewBar'); if (!vb) return; barEl = document.createElement('div'); barEl.id = 'outBar'; barEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;padding:3px 8px;background:#D4D0C8;border-bottom:1px solid #808080;font-size:12px'; vb.parentNode.insertBefore(barEl, vb.nextSibling); barEl.onclick = onBar; barEl.onchange = onBarChange; barEl.oninput = e => { if (e.target.dataset.k) mem[e.target.dataset.k] = e.target.value; }; }
    const started = typeof Layers !== 'undefined' && Layers.started && Layers.started(); barEl.style.display = started ? 'flex' : 'none'; if (!started) return;
    if (barEl.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
    const sig = folded + '|' + (E.snap && E.snap.scene); if (barEl.dataset.sig === sig && barEl.firstChild) return; barEl.dataset.sig = sig;
    barEl.innerHTML = '<button class="mini" data-o="fold" title="Collapse or expand the picture">' + (folded ? '&#9654;' : '&#9660;') + '</button><b>Output</b><input data-k="title" placeholder="Title of the picture (empty: the layer name)" value="' + esc(mem.title) + '" size="30"><input data-k="caption" placeholder="Caption (added under the picture)" value="' + esc(mem.caption) + '" size="30">' +
      '<select data-o="save" title="Save the picture of this layer"><option value="">Save picture...</option><option value="screen">Screen resolution (PNG)</option><option value="300">300 dpi (PNG)</option><option value="600">600 dpi (PNG)</option><option value="max">Highest resolution (PNG)</option><option value="copy">Copy the picture</option></select>' +
      '<button class="mini" data-o="full" title="Show the picture of the layer on the whole screen (Esc to leave)">&#9974; Full screen</button><button class="mini" data-o="num" title="The numbers of the layer, with the settings">Numbers (CSV)</button><button class="mini" data-o="wsave" title="Keep the position of every control (soil, crop, tillage, mulch...) in a file">Save widgets</button><button class="mini" data-o="wload">Load widgets</button><input type="file" data-o="wfile" accept=".json" hidden><button class="mini" data-o="all" title="Every layer as a 300 dpi picture and its numbers, in one zip">Every layer (zip)</button>';
  }
  function onBar(e) {
    const b = e.target.closest('[data-o]'); if (!b || b.tagName === 'SELECT') return; const a = b.dataset.o;
    if (a === 'fold') { folded = !folded; const f = document.getElementById('engine'); if (f) f.style.display = folded ? 'none' : ''; bar(); } else if (a === 'full') { const h = document.getElementById('engineHost'); if (h) fs(h); } else if (a === 'num') saveNumbers(); else if (a === 'wsave') saveWidget(); else if (a === 'wload') barEl.querySelector('[data-o="wfile"]').click(); else if (a === 'all') { b.disabled = true; allLayers(b).finally(() => { b.disabled = false; }); }
  }
  function onBarChange(e) { const t = e.target; if (t.dataset.o === 'save' && t.value) { const v = t.value; t.value = ''; v === 'copy' ? copyPicture() : savePicture(v); } else if (t.dataset.o === 'wfile' && t.files[0]) { loadWidget(t.files[0]); t.value = ''; } }

  // ---------------------------------------------------------------- sections of the dashboard
  function tableRows(t) { return Array.from(t.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(c => c.textContent.replace(/\s+/g, ' ').trim())); }
  function tableCanvas(rows, S) {
    const c = document.createElement('canvas'), g = c.getContext('2d'), fs = 12 * S, rh = 20 * S; g.font = fs + 'px Arial'; const cw = []; rows.forEach(r => r.forEach((v, i) => { cw[i] = Math.max(cw[i] || 0, g.measureText(v).width + 14 * S); }));
    c.width = Math.ceil(cw.reduce((a, b) => a + b, 0)) + 2; c.height = rows.length * rh + 2; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.font = fs + 'px Arial'; g.textBaseline = 'middle';
    rows.forEach((r, j) => { let x = 1; if (j === 0) { g.fillStyle = '#e6e9ee'; g.fillRect(0, 0, c.width, rh); } r.forEach((v, i) => { g.fillStyle = '#111'; g.font = (j === 0 ? 'bold ' : '') + fs + 'px Arial'; g.textAlign = i === 0 ? 'left' : 'right'; g.fillText(v, i === 0 ? x + 6 * S : x + cw[i] - 6 * S, j * rh + rh / 2 + 1); x += cw[i]; }); g.strokeStyle = '#c9ced6'; g.beginPath(); g.moveTo(0, (j + 1) * rh); g.lineTo(c.width, (j + 1) * rh); g.stroke(); });
    return c;
  }
  const curTab = () => { const b = document.querySelector('#dashTabs button.on'); return b ? b.dataset.tab : 'results'; };
  const withDpr = async (s, fn) => { const d = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio'); Object.defineProperty(window, 'devicePixelRatio', { get: () => s, configurable: true }); try { return await fn(); } finally { if (d) Object.defineProperty(window, 'devicePixelRatio', d); else delete window.devicePixelRatio; } };
  async function sectionCanvas(secEl, scale) {
    const id = secEl.dataset.sec, title = (secEl.querySelector('h4 b') || {}).textContent || id, S = scale / 1.5;
    const grab = async () => { const el = document.querySelector('#dashBody .dsec[data-sec="' + id + '"]') || secEl, parts = []; el.querySelectorAll('.dsb canvas').forEach(c => { if (c.width) parts.push(c); }); el.querySelectorAll('.dsb table').forEach(t => { const rows = tableRows(t); if (rows.length > 1) parts.push(tableCanvas(rows, S * 1.4)); }); const kr = kpiRows(el); if (kr.length > 1) parts.push(tableCanvas(kr, S * 1.4)); return parts; };
    let parts;
    if (secEl.querySelector('canvas') && typeof Dash !== 'undefined' && Dash.tab) { parts = await withDpr(scale, async () => { Dash.tab(curTab()); await wait(300); return grab(); }); Dash.tab(curTab()); await wait(150); } else parts = await grab();
    if (!parts.length) return null; const W = Math.max.apply(null, parts.map(p => p.width)), H = parts.reduce((a, p) => a + p.height + 10 * S, 0), c = document.createElement('canvas'); c.width = W; c.height = Math.round(H); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, c.height); let y = 0; parts.forEach(p => { g.drawImage(p, 0, y); y += p.height + 10 * S; });
    return frameCanvas(c, title.trim());
  }
  function kpiRows(el) { const r = [['Quantity', 'Value']]; el.querySelectorAll('.kpi').forEach(k => { const l = (k.querySelector('.kl') || {}).textContent, v = (k.querySelector('.kv') || {}).textContent; if (l) r.push([l.trim(), (v || '').trim()]); }); return r; }
  function sectionCsv(secEl) { const out = []; secEl.querySelectorAll('.dsb table').forEach(t => { if (out.length) out.push([]); out.push(['# ' + ((secEl.querySelector('h4 b') || {}).textContent || '').trim()]); tableRows(t).forEach(r => out.push(r)); }); { const kr = kpiRows(secEl); if (kr.length > 1) { if (out.length) out.push([]); kr.forEach(x => out.push(x)); } } secEl.querySelectorAll('.dsb canvas').forEach(c => { if (typeof c._csv === 'function') { try { const r = c._csv(); if (r && r.length) { if (out.length) out.push([]); r.forEach(x => out.push(x)); } } catch (e) { } } }); return out; }
  function decorate(body) {
    body.querySelectorAll('.dsec').forEach(sec => {
      const h = sec.querySelector('h4'); if (!h || h.dataset.sw) return; h.dataset.sw = '1'; const has = sec.querySelector('canvas,table,.kpi'); if (!has) return;
      const s = document.createElement('select'); s.style.cssText = 'margin-left:auto;font-size:11px;max-width:120px'; s.title = 'Save this section'; s.innerHTML = '<option value="">Save...</option><option value="300">Picture 300 dpi</option><option value="600">Picture 600 dpi</option><option value="copy">Copy the picture</option><option value="csv">Numbers (CSV)</option>';
      ['click', 'mousedown'].forEach(ev => s.addEventListener(ev, e => e.stopPropagation()));
      const full = document.createElement('button'); full.className = 'mini'; full.innerHTML = '&#9974;'; full.title = 'Show this section on the whole screen (Esc to leave)'; full.style.marginLeft = '6px'; ['click', 'mousedown'].forEach(ev => full.addEventListener(ev, e => e.stopPropagation())); full.onclick = () => fs(sec, () => { try { Dash.tab(curTab()); } catch (e) { } });
      const pr = procsOfTitle(((h.querySelector('b') || {}).textContent || ''), (MAP[E.snap && E.snap.scene] || [[], []])[1].slice(0, 3)).slice(0, 4), PP = window.DaisyProc;
      const chips = document.createElement('span'); chips.style.cssText = 'margin-left:8px;display:inline-flex;gap:3px;flex-wrap:wrap'; chips.innerHTML = pr.map(id => { const p = PP && PP.byId(id); return p ? '<button class="mini" data-cp="' + id + '" title="Daisy process: ' + esc(p.d) + '" style="border-left:5px solid ' + PP.GC[p.g] + '">' + esc(p.n) + '</button>' : ''; }).join('');
      ['click', 'mousedown'].forEach(ev => chips.addEventListener(ev, e => e.stopPropagation()));
      chips.onclick = e => { const b = e.target.closest('[data-cp]'); if (!b) return; figSel = b.dataset.cp; figKey = ''; const t = document.querySelector('[data-tab="figure"]'); if (t) t.click(); };
      s.onchange = async () => { const v = s.value; s.value = ''; if (!v) return; const base = 'SWAFL_' + sane(E.snap && E.snap.scene) + '_' + sane((h.querySelector('b') || {}).textContent);
        if (v === 'csv') { const r = sectionCsv(sec); if (!r.length) { UI.toast('This section has no numbers'); return; } dl(new Blob(['﻿' + csvText(r)], { type: 'text/csv' }), base + '.csv'); return; }
        const cv = await sectionCanvas(sec, v === 'copy' ? 3.125 : v === '600' ? 6.25 : 3.125); if (!cv) { UI.toast('Nothing to draw in this section'); return; } const b = await blobOf(cv);
        if (v === 'copy') { try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); UI.toast('Picture copied'); } catch (e) { UI.toast('The picture could not be copied here'); } } else dl(b, base + '_' + v + 'dpi.png'); };
      h.appendChild(chips); h.appendChild(full); h.appendChild(s);
    });
  }

  // any element on the whole screen (the screen itself when the browser allows it, otherwise the whole window); Esc leaves
  function fs(el, after) {
    if (el.classList.contains('swfs')) { el.classList.remove('swfs'); el.style.cssText = el._fs || ''; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); setTimeout(() => after && after(), 150); return; }
    el._fs = el.style.cssText; el.classList.add('swfs'); el.style.cssText += ';position:fixed;left:0;top:0;right:0;bottom:0;width:auto;height:auto;z-index:9000;overflow:auto;background:#fff;margin:0;box-sizing:border-box';
    try { if (el.requestFullscreen) el.requestFullscreen().catch(() => { }); } catch (e) { }
    const esc = e => { if (e.key === 'Escape' && el.classList.contains('swfs')) { fs(el, after); document.removeEventListener('keydown', esc); } }; document.addEventListener('keydown', esc);
    el.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && el.classList.contains('swfs')) fs(el, after); }, { once: true }); setTimeout(() => after && after(), 150);
  }
  // the own chain of processes of each layer, in the words of that layer: process id : what happens in this layer
  const FLOW = {
    field: 'surf:rain and irrigation arrive at the soil|water:water is stored in the root zone|crop:roots take it up and the crop transpires|drain:the rest drains below the roots',
    v1: 'water:the soil dries around the sensor|water:suction at the sensor rises to the trigger|surf:irrigation is applied|water:suction falls again',
    v2: 'surf:rain and irrigation wet the top|water:water moves down under gravity and suction|pore:pressure head shows the wetting front|drain:water leaves the bottom',
    v3: 'om:tillage loosens the soil and breaks aggregates|pore:pore sizes and structure change|water:the water retention curve moves|drain:drainage changes as the soil consolidates',
    v4: 'surf:mulch covers the soil|bio:radiation and wind reach the mulch, not the soil|surf:evaporation from the soil falls|water:more water stays in the profile',
    v5: 'bio:climate drives the demand|surf:management brings water and nitrogen|water:soil water carries both|crop:the crop takes them up|drain:what is left leaches',
    v6: 'surf:mulch and tillage change the surface|surf:evaporation changes|water:storage changes|drain:drainage changes',
    v7: 'om:tillage and consolidation act on the structure|pore:the soil texture decides the pores|water:retention and conductivity follow|drain:drainage differs between soils',
    e1: 'bio:the surface is exposed to the air|surf:the top layer dries first|water:liquid water and vapour move in the drying soil|surf:evaporation slows down',
    n1: 'water:the soil dries by uptake and evaporation|water:depletion approaches the trigger|surf:irrigation is called|crop:the crop is kept out of stress',
    n2: 'surf:mulch intercepts rain and cuts evaporation|water:water is saved in the soil|drain:part of it drains|crop:part of it reaches the crop',
    n3: 'surf:rain falls on the mulch|surf:soil evaporation is reduced|water:the profile stays wetter|drain:drainage increases in wet years',
    r1: 'crop:the roots grow to the rooting depth|water:they take water where the soil is wet|crop:uptake meets the demand of the canopy|water:the soil dries from the top',
    spac: 'water:soil water potential|crop:root and stem resistance|photo:stomata and leaf water potential|bio:the air sets the demand',
    sid: 'surf:water is let onto the field surface|surf:it advances along the furrow or border|water:it infiltrates into the soil|drain:what passes the roots is lost',
    drip: 'surf:the emitter delivers a flow|water:a wetted bulb forms around it|crop:the roots reach the bulb|drain:overirrigation drains below it',
    spr: 'surf:the sprinkler throws water in a pattern|surf:neighbouring sprinklers overlap|water:the soil takes the applied depth|drain:uneven application drains in places',
    yby: 'bio:20 seasons of weather|crop:yield each season|surf:irrigation each season|water:reliability across seasons',
    wb2: 'surf:rain and irrigation in|water:storage changes|crop:transpiration and evaporation out|drain:drainage and run-off out',
    nb: 'no3:nitrogen is applied|nh4:it is mineralised and nitrified|crop:the crop takes it up|deni:part is lost as gas|drain:part leaches with the drainage',
    crop: 'bio:reference evapotranspiration|crop:crop coefficient by stage|photo:canopy cover and growth|water:crop water requirement',
    chem: 'surf:the chemical is applied|water:it moves with the water|drain:it leaches below the root zone|om:it is held by the organic matter',
    dsum: 'crop:yield of each Daisy run|water:water used|no3:nitrogen lost|drain:the table of decisions',
    dph: 'bio:air and radiation|photo:leaf photosynthesis|crop:growth of the canopy|temp:canopy temperature against the air'
  };
  const STATE = {
    field: 'Root-zone water|theta, h, K(theta) in 40 layers;storage S;depletion D', v1: 'Soil around the sensor|suction h at depth z;retention theta(h);trigger h*', v2: 'Soil profile|pressure head h(z,t);Richards equation;wetting front', v3: 'Soil structure|consolidation tau;pore network n, Ks;retention theta(h)',
    v4: 'Soil under mulch|soil evaporation E;mulch capacity;litter water', v5: 'Coupled system|water, crop, nitrogen;40-layer cascade;feedback loops', v6: 'Topsoil|mulch cover phi;tillage state;evaporation E', v7: 'Soil series|texture;organic matter;consolidation tau;Ks',
    e1: 'Drying soil|liquid water theta;vapour flux;surface crust', n1: 'Root zone|available water;depletion D;trigger', n2: 'Mulched soil|saved water;drainage D;uptake', n3: 'Soil water|evaporation E;drainage D;storage dS', r1: 'Root zone|root density L(z);rooting depth;uptake S(z)',
    spac: 'Soil-plant-air path|psi soil;psi root;psi leaf;psi air', sid: 'Furrow or border|advance x(t);infiltration I(t);runoff', drip: 'Wetted bulb|emitter flow q;bulb radius;uniformity', spr: 'Application pattern|depth by catch can;overlap;CU',
    yby: 'Twenty seasons|yield by year;irrigation by year;reliability', wb2: 'Water balance|P + I = ET + D + dS;closure error', nb: 'Soil nitrogen|mineral N (NO3, NH4);organic N;uptake', crop: 'Crop|stage lengths;Kc;canopy cover',
    chem: 'Soil chemical|concentration C;sorption Koc;half-life', dsum: 'Daisy ensemble|runs;yield;water;nitrogen', dph: 'Canopy|Tc minus Ta;stomatal conductance;LAI'
  };
  const DRV = { spac: ['air humidity', 'radiation', 'soil water'], nb: ['rain', 'fertiliser N', 'temperature'], sid: ['inflow rate', 'duration', 'soil intake'], drip: ['emitter flow', 'run time', 'soil'], spr: ['sprinkler flow', 'wind', 'soil'], yby: ['20 years of weather'], chem: ['rain', 'dose', 'soil'], dsum: ['10 soils', '17 experiments'], dph: ['air temperature', 'radiation', 'vapour deficit'], crop: ['reference ET0', 'season dates'], e1: ['evaporative demand', 'initial water'], v3: ['rain', 'irrigation'] };
  const FB = { field: 'irrigation, yield', v1: 'irrigation lowers suction', n1: 'irrigation lowers depletion', v5: 'water, crop, nitrogen', wb2: 'irrigation, storage' };
  const flowOf = scene => (FLOW[scene] || '').split('|').map(x => { const i = x.indexOf(':'); return { p: x.slice(0, i), t: x.slice(i + 1) }; }).filter(x => x.p);

  // ---------------------------------------------------------------- the Figure tab: the processes of Daisy, linked to the outputs of the layer
  const MAP = {
    field: [['bio', 'crop'], ['surf', 'water', 'drain', 'crop']], v1: [['water'], ['water', 'bio']], v2: [['bio'], ['water', 'pore']], v3: [['om', 'water'], ['water', 'pore', 'drain']], v4: [['surf'], ['surf', 'water']], v5: [[], ['bio', 'surf', 'water', 'drain', 'crop', 'no3']],
    v6: [['surf', 'om'], ['surf', 'drain']], v7: [['om'], ['water', 'pore', 'drain']], e1: [['surf'], ['surf', 'water']], n1: [['water'], ['water', 'crop']], n2: [['surf'], ['surf', 'drain', 'crop']], n3: [['bio', 'surf'], ['surf', 'drain']], r1: [['crop'], ['crop', 'water']],
    spac: [[], ['bio', 'crop', 'water', 'photo']], sid: [['bio', 'surf'], ['water', 'drain', 'crop']], drip: [['bio', 'surf'], ['water', 'drain', 'crop']], spr: [['bio', 'surf'], ['water', 'drain', 'crop']], yby: [[], ['crop', 'bio']], wb2: [[], ['bio', 'surf', 'water', 'drain', 'crop']],
    nb: [[], ['no3', 'nh4', 'deni', 'crop']], crop: [[], ['crop', 'photo', 'bio']], chem: [[], ['water', 'drain', 'no3']], dsum: [[], ['crop', 'water', 'no3']], dph: [[], ['crop', 'photo', 'temp']]
  };
  const KEY = [[/snow/i, ['snow']], [/weather|climate|et0|reference|radiation|air temp|demand/i, ['bio']], [/rain|precip|irrigation|applied|schedule|inflow/i, ['surf']], [/evapor|mulch|litter|interception/i, ['surf']], [/transpir|crop|yield|growth|canopy|leaf|season|stress|life cycle|phenol|root/i, ['crop', 'photo']],
    [/nitrogen|nitrate|leach|\bN\b/i, ['no3', 'nh4', 'deni']], [/carbon|organic/i, ['om', 'carbon']], [/temperature|heat|frost/i, ['temp']], [/drain|percolat|deep/i, ['drain']], [/pressure|suction|potential|soil water|moisture|depletion|wetted|bulb|infiltrat|intake|storage|profile|hydraul/i, ['water', 'pore']]];
  const procsOfTitle = (t, fallback) => { const s = new Set(); KEY.forEach(k => { if (k[0].test(t)) k[1].forEach(p => s.add(p)); }); return s.size ? Array.from(s) : fallback.slice(); };
  // what the controls of each layer are and what its results are, in the words of the layer
  const LT = {
    field: ['rain, irrigation, crop, mulch', 'transpiration, evaporation, drainage, storage'], v1: ['trigger suction, sensor depth', 'suction of the sensor, irrigation dates'], v2: ['rain, irrigation', 'pressure head through the profile'], v3: ['tillage, consolidation rate', 'pore sizes, structure, drainage'],
    v4: ['mulch material and strength', 'soil evaporation under mulch'], v5: ['climate, management, soil, crop', 'the loops between water, crop and nitrogen'], v6: ['mulch, tillage', 'evaporation and drainage'], v7: ['tillage, consolidation rate, soil', 'drainage change by soil'],
    e1: ['mulch, drying', 'water and vapour in the drying soil'], n1: ['soil, trigger', 'depletion against the trigger'], n2: ['mulch, rain', 'where the water saved by mulch goes'], n3: ['rain, mulch', 'evaporation against drainage'], r1: ['crop, rooting depth', 'root density and water uptake'],
    spac: ['soil, plant, air', 'water potential from soil to air'], sid: ['field, soil, flow', 'advance, infiltration, efficiency'], drip: ['emitter, lateral, soil', 'wetted bulb, uniformity, efficiency'], spr: ['sprinkler, spacing, soil', 'pattern, uniformity, efficiency'],
    yby: ['20 seasons of weather', 'reliability of yield and irrigation'], wb2: ['soil, crop, irrigation', 'the full water balance'], nb: ['nitrogen rate, soil', 'uptake, leaching, losses'], crop: ['crop, season', 'crop water requirement'], chem: ['chemical, soil (Daisy runs)', 'fate of the chemical'],
    dsum: ['Daisy runs', 'the decision table'], dph: ['plant, root, canopy', 'growth, canopy temperature depression']
  };
  const titles = {};   // outputs of each layer, remembered when the Results tab shows them
  function remember(body, scene) { const L = []; body.querySelectorAll('.dsec[data-sec]').forEach(s => { const t = ((s.querySelector('h4 b') || {}).textContent || '').trim(); if (t) L.push({ src: 'dash', id: s.dataset.sec, title: t }); }); if (L.length) titles[scene] = L; }
  let figSel = null, figKey = '';
  let secCache = { key: '', list: null, busy: null };
  async function sectionsOf() {
    const sn = E.snap, key = sn.scene + '|' + JSON.stringify(sn.state) + '|' + sn.date; if (secCache.key === key && secCache.list) return secCache.list; if (secCache.busy && secCache.busyKey === key) return secCache.busy;
    secCache.busyKey = key; secCache.busy = Dash.offscreen().then(l => { secCache = { key, list: l, busy: null }; return l; }); return secCache.busy;
  }
  async function fillRes(box, scene, p, m, host) {
    const pn = (window.DaisyProc.byId(p) || {}).n || p; box.innerHTML = '<div class="pnote">Preparing the results of ' + esc(pn) + '...</div>';
    let list = []; try { list = await sectionsOf(); } catch (e) { console.warn(e); } if (!box.isConnected || figSel !== p) return;
    if (!list.length && !E.ev("(window.layerRan&&layerRan('" + scene + "'))?1:0") && ['sid','drip','spr','dph'].indexOf(scene) < 0) { box.innerHTML = '<div class="pnote" style="padding:4px 0">This layer has not been run yet. Press Run simulation (in the picture, or in the Results tab): the results of ' + esc(pn) + ' appear here after the run.</div>'; return; }
    const fb = (m[1].length ? m[1] : m[0])[0], mine = list.filter(x => procsOfTitle(x.title, [fb]).indexOf(p) >= 0);
    box.innerHTML = '<div style="border:1px solid #808080;background:#fff;padding:6px"><div class="dzrow"><b style="color:' + window.DaisyProc.GC[(window.DaisyProc.byId(p) || {}).g] + '">Results of this layer that belong to: ' + esc(pn) + '</b><span class="pnote">' + mine.length + ' of ' + list.length + ' outputs; the others are hidden</span><span style="flex:1"></span><button class="mini" data-clr>Show all processes</button></div><div data-rs></div></div>';
    const rs = box.querySelector('[data-rs]'); mine.forEach(x => { x.el.classList.remove('shut'); const b = x.el.querySelector('.dsb'); if (b) b.hidden = false; rs.appendChild(x.el.cloneNode(true)); });
    if (!mine.length) rs.innerHTML = '<div class="pnote">This layer has no output of its own for this process. It acts through the other processes in the chain.</div>';
    box.querySelector('[data-clr]').onclick = () => { figSel = null; figKey = ''; figure(host, E.snap); };
  }
  function figure(body, s) {
    const scene = s.scene, m = MAP[scene] || [[], ['bio', 'water', 'crop']], P = window.DaisyProc; if (!P || !P.svg) { body.innerHTML = '<div class="dnote">The process figure is loading.</div>'; return; }
    let engTitles = []; try { engTitles = Object.keys((s.sec && s.sec[scene]) || {}); } catch (e) { }
    const items = (titles[scene] || []).concat(engTitles.map(t => ({ src: 'eng', id: t, title: t }))); const fb = m[1].length ? m[1] : m[0];
    items.forEach(it => { it.p = procsOfTitle(it.title, fb); });
    const key = scene + '|' + figSel + '|' + items.map(i => i.title).join('|'); if (key === figKey && body.querySelector('.swfig')) return; figKey = key;
    const F = {}, R = {}; m[0].forEach(p => { F[p] = ['controls']; }); m[1].forEach(p => { R[p] = ['results']; }); const emph = Array.from(new Set(m[0].concat(m[1]))), lt = LT[scene] || ['', ''];
    const on = new Set(figSel ? [figSel] : []); const hl = figSel && items.some(i => i.p.indexOf(figSel) >= 0);
    body.innerHTML = '<div class="swfig"><div class="dnote">The processes of Daisy for <b>' + esc(layerName()) + '</b>. <span style="color:#e8710a"><b>Orange</b></span>: what its controls act on (' + esc(lt[0]) + '). <span style="color:#0072b2"><b>Blue</b></span>: where its results come from (' + esc(lt[1]) + '). The processes this layer does not use are shown pale; none is hidden. Click a process to see what Daisy does there, its figures from your Daisy runs, and the outputs of the layer that depend on it; click an output to see its processes.</div>' +
      '<div class="swflow" style="display:flex;flex-wrap:wrap;align-items:stretch;gap:4px;margin:6px 0">' + flowOf(scene).map((st, i) => (i ? '<span style="align-self:center">&#8594;</span>' : '') + '<button class="mini" data-fl="' + st.p + '" style="text-align:left;max-width:210px;white-space:normal;border-left:6px solid ' + ((P.byId(st.p) && P.GC[P.byId(st.p).g]) || '#888') + '"><b>' + (i + 1) + '.</b> ' + esc(st.t) + '<br><span class="pnote">' + esc((P.byId(st.p) || {}).n || '') + '</span></button>').join('') + '</div>' +
      '<div class="dzrow" style="gap:4px;margin:4px 0"><button class="mini" data-fg="full">&#9974; Full screen</button><button class="mini" data-fg="big">Enlarge</button><button class="mini" data-fg="png">Save picture (300 dpi)</button><button class="mini" data-fg="svg">Save as SVG</button></div>' +
      '<div class="swmap" data-own>' + LayerFig.svg({ id: scene, name: layerName(), nameOf: p => (P.byId(p) || {}).n || p, drivers: { title: 'Driving variables', items: DRV[scene] || ['rain P', 'irrigation I', 'reference ET0'] }, state: (() => { const q = (STATE[scene] || 'Soil|').split('|'); return { title: q[0], lines: (q[1] || '').split(';').filter(Boolean) }; })(), steps: flowOf(scene).map(x => ({ p: x.p, t: x.t })), outputs: lt[1].split(/,\s*/).filter(Boolean).slice(0, 5).map(t => ({ t: t.charAt(0).toUpperCase() + t.slice(1), p: procsOfTitle(t, m[1].length ? m[1] : m[0])[0] })), controls: lt[0].split(/,\s*/).filter(Boolean).slice(0, 5).map((t, i) => ({ t: t.charAt(0).toUpperCase() + t.slice(1), i })), fb: FB[scene] || '', sel: figSel || null }) + '</div><details style="margin-top:8px"' + (figSel ? '' : '') + '><summary><b>The same processes on the map of the Daisy model</b></summary><div class="swmap">' + P.svg({ marks: { F, R, factors: m[0].map(id => ({ id })), resp: m[1] }, names: { controls: 'controls', results: 'results' }, labels: { f: 'Controls of ' + layerName(), r: 'Results of ' + layerName() }, emph, sel: figSel || null }) + '</div></details><div data-res style="margin-top:8px"></div>' +
      '<div class="swlist" style="margin-top:6px"><b>Outputs of this layer</b>' + (items.length ? '' : ' <span class="pnote">(open the Results tab once to list them)</span>') + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' +
      items.map((it, i) => '<button class="mini" data-it="' + i + '" style="' + (figSel && it.p.indexOf(figSel) >= 0 ? 'font-weight:700;outline:2px solid #c0392b;' : figSel ? 'opacity:.45;' : '') + '" title="' + esc(it.p.join(', ')) + '">' + esc(it.title.length > 48 ? it.title.slice(0, 46) + '...' : it.title) + '</button>').join('') + '</div></div><div data-pdet style="margin-top:6px"></div></div>';
    const det = body.querySelector('[data-pdet]'), runsOf = () => { const r = []; try { (window.DaisyScenUI ? DaisyScenUI.runs() : []).forEach(x => r.push({ label: 'Scenario: ' + (x.label || x.id), logs: x.logs })); (window.DaisyExpUI ? DaisyExpUI.runs() : []).forEach(x => r.push({ label: 'Experiment: ' + x.id + ' ' + (x.label || ''), logs: x.logs })); } catch (e) { } return r; };
    const resBox = body.querySelector('[data-res]');
    if (resBox) { if (figSel) fillRes(resBox, scene, figSel, m, body); else resBox.innerHTML = '<div class="pnote" style="padding:4px 0">Click a process (or an output) in the figure and only the results that belong to it are shown here, as in the process figures of Daisy.</div>'; }
    if (figSel && det) P.detailInto(det, figSel, runsOf(), 'The layer itself shows this process in the section marked in the list above.');
    const svgEl = () => body.querySelector('.swmap svg'), svgText = () => { const el = svgEl().cloneNode(true); el.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); const vb = el.getAttribute('viewBox').split(/\s+/).map(Number); el.setAttribute('width', vb[2]); el.setAttribute('height', vb[3]); el.removeAttribute('style'); return new XMLSerializer().serializeToString(el); };
    body.querySelectorAll('[data-fg]').forEach(b => b.onclick = async () => { const a = b.dataset.fg;
      if (a === 'full') { fs(body.querySelector('.swfig')); return; }
      if (a === 'big') { UI.modal({ title: 'Processes of Daisy: ' + layerName(), width: '1100px', html: '<div style="max-height:75vh;overflow:auto">' + svgEl().outerHTML + '</div>' }); return; }
      if (a === 'svg') { dl(new Blob([svgText()], { type: 'image/svg+xml' }), 'SWAFL_' + sane(scene) + '_process-figure.svg'); return; }
      const vb = svgEl().getAttribute('viewBox').split(/\s+/).map(Number), k = 3.125 * 1.2, img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(vb[2] * k); c.height = Math.round(vb[3] * k); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); c.toBlob(bl => dl(bl, 'SWAFL_' + sane(scene) + '_process-figure_300dpi.png'), 'image/png'); }; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText()); });
    body.querySelectorAll('.dzPb[data-p]').forEach(g => { g.onclick = () => { figSel = figSel === g.dataset.p ? null : g.dataset.p; figKey = ''; if (figSel) { const hit = items.find(i => i.src === 'eng' && i.p.indexOf(figSel) >= 0); if (hit) { try { E.scrollTo(scene, hit.id); } catch (e) { } } } figure(body, s); }; });
    body.querySelectorAll('[data-fl]').forEach(b => b.onclick = () => { figSel = figSel === b.dataset.fl ? null : b.dataset.fl; figKey = ''; figure(body, s); });
    body.querySelectorAll('[data-it]').forEach(b => { const it = items[+b.dataset.it]; b.onmouseenter = () => { b.title = 'processes: ' + it.p.join(', '); }; b.onclick = () => { figSel = it.p[0]; figKey = ''; if (it.src === 'eng') { try { E.scrollTo(scene, it.id); } catch (e) { } } else { const t = document.querySelector('#dashTabs [data-tab="results"]') || document.querySelector('button[data-tab="results"]'); if (t) t.click(); setTimeout(() => { const el = document.querySelector('#dashBody .dsec[data-sec="' + it.id + '"]'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.style.outline = '2px solid #c0392b'; setTimeout(() => { el.style.outline = ''; }, 1800); } }, 120); } };
    });
  }
  O.bar = bar; O.decorate = decorate; O.remember = remember; O.figure = figure; O.savePicture = savePicture; O.allLayers = allLayers; O.enginePicture = enginePicture;
  setInterval(() => { try { bar(); } catch (e) { } }, 700);
  if (typeof E !== 'undefined') { E.on('scene', () => setTimeout(bar, 60)); E.on('snap', () => { if (!barEl || !barEl.firstChild) bar(); }); }
  return O;
})();
