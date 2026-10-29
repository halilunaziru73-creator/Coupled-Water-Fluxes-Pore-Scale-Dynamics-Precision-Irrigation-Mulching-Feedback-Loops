/* Daisy workbench: the toolbar of every figure (scenarios, experiments, process maps).
   Collapse and expand the figure, edit its title and axis texts, save it as a picture at screen, 300 dpi or 600 dpi resolution, copy it,
   save the numbers it shows as a table, and save every figure of a result at once. The pictures are drawn again at the higher resolution,
   so lines and letters stay sharp (they are not enlarged). */
'use strict';
window.DaisyFigKit = (() => {
  const K = {}, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cvs = card => Array.from(card.querySelectorAll('canvas'));
  const sane = t => String(t || 'figure').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'figure';
  const area = card => cvs(card).reduce((a, c) => a + c.width * c.height, 0);
  function compose(list, cols) {
    list = list.filter(c => c && c.width); if (!list.length) return null; cols = Math.max(1, Math.min(cols || 1, list.length)); const W = Math.max.apply(null, list.map(c => c.width)), CH = Math.max.apply(null, list.map(c => c.height)), rowsN = Math.ceil(list.length / cols), out = document.createElement('canvas');
    out.width = W * cols; out.height = CH * rowsN; const g = out.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height); list.forEach((c, i) => g.drawImage(c, (i % cols) * W, Math.floor(i / cols) * CH)); return out;
  }
  const blobOf = cv => new Promise(res => cv.toBlob(res, 'image/png'));
  const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = window.SWAFLDate ? SWAFLDate.name(name) : name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  // the picture of a figure card at a scale (1 = screen, 3 = about 300 dpi, 6 = about 600 dpi); the figure is drawn again at that scale
  async function picture(card, o, scale) {
    const P = window.DaisyPlot; let e = scale || 1;
    if (e > 1 && o && o.redraw && P) { const a0 = area(card) / Math.pow(P.exportScale || 1, 2); e = Math.max(1, Math.min(e, Math.sqrt(70e6 / Math.max(1, a0)))); P.exportScale = e; try { o.redraw(); } catch (x) { console.warn(x); } }
    const out = compose(cvs(card), +card.dataset.cols || 1); const blob = out ? await blobOf(out) : null;
    if (P && P.exportScale !== 1) { P.exportScale = 1; try { o && o.redraw && o.redraw(); } catch (x) { } }
    return { blob, scale: e };
  }
  function csvOf(card) {
    const q = v => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const out = []; cvs(card).forEach((c, i) => { if (typeof c._csv !== 'function') return; let rows; try { rows = c._csv(); } catch (x) { return; } if (!rows || !rows.length) return; if (out.length) out.push(''); out.push(q('# ' + (c.dataset.customTitle != null ? c.dataset.customTitle : c.dataset.autoTitle || 'figure ' + (i + 1)))); rows.forEach(r => out.push(r.map(q).join(','))); });
    return out.join('\r\n');
  }
  function editor(card, o) {
    const old = card.querySelector('.dzfk-ed'); if (old) { old.remove(); return; }
    const list = cvs(card), box = document.createElement('div'); box.className = 'dzfk-ed'; box.style.cssText = 'margin:6px 0;padding:8px;border:1px solid #9aa3ae;background:#f4f1e8';
    box.innerHTML = '<div style="font-size:12px;color:#444;margin-bottom:4px">Write the title and the axis texts as they should stand in your paper or report. Leave a text as it is to keep the one of the program; clear it to draw none. The change is drawn at once and is kept in every picture you save.</div>' +
      list.map((c, i) => '<div style="margin:5px 0;border-top:' + (i ? '1px dashed #bbb' : '0') + ';padding-top:' + (i ? 5 : 0) + 'px"><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><label style="min-width:56px">' + (list.length > 1 ? 'Panel ' + (i + 1) : 'Figure') + '</label><span style="font-size:12px">Title</span><input data-t="' + i + '" size="48"><span style="font-size:12px">x axis</span><input data-x="' + i + '" size="22"><span style="font-size:12px">y axis</span><input data-y="' + i + '" size="22"><span style="font-size:12px">Panel letter</span><input data-l="' + i + '" size="2" maxlength="3"></div></div>').join('') +
      '<div style="margin-top:6px"><button class="btn pri" data-a="apply">Apply</button> <button class="btn" data-a="reset">Back to the texts of the program</button> <button class="btn" data-a="close">Close</button></div>';
    const hdr = card.querySelector('.dzrow'); hdr.parentNode.insertBefore(box, hdr.nextSibling);
    const fill = () => list.forEach((c, i) => { box.querySelector('[data-t="' + i + '"]').value = c.dataset.customTitle != null ? c.dataset.customTitle : (c.dataset.autoTitle || ''); box.querySelector('[data-x="' + i + '"]').value = c.dataset.customX != null ? c.dataset.customX : (c.dataset.autoX || ''); box.querySelector('[data-y="' + i + '"]').value = c.dataset.customY != null ? c.dataset.customY : (c.dataset.autoY || ''); box.querySelector('[data-l="' + i + '"]').value = c.dataset.panel || ''; });
    fill();
    box.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (!a) return; if (a === 'close') { box.remove(); return; }
      list.forEach((c, i) => { if (a === 'reset') { delete c.dataset.customTitle; delete c.dataset.customX; delete c.dataset.customY; return; }
        const t = box.querySelector('[data-t="' + i + '"]').value, x = box.querySelector('[data-x="' + i + '"]').value, y = box.querySelector('[data-y="' + i + '"]').value, l = box.querySelector('[data-l="' + i + '"]').value;
        if (t !== (c.dataset.autoTitle || '')) c.dataset.customTitle = t; else delete c.dataset.customTitle; if (x !== (c.dataset.autoX || '')) c.dataset.customX = x; else delete c.dataset.customX; if (y !== (c.dataset.autoY || '')) c.dataset.customY = y; else delete c.dataset.customY;
        if (l) c.dataset.panel = l; else delete c.dataset.panel; });
      try { o.redraw && o.redraw(); } catch (x) { console.warn(x); } fill(); };
  }
  // put the toolbar on a figure card; o = { name, redraw }
  K.decorate = function (card, o) {
    o = o || {}; if (!card || card.dataset.fk) return; card.dataset.fk = '1'; card._fkOpt = o; let row = card.querySelector('.dzrow');
    if (!row) { row = document.createElement('div'); row.className = 'dzrow'; const b = card.querySelector('b'); if (b) { card.insertBefore(row, b); row.appendChild(b); } else card.insertBefore(row, card.firstChild); }
    card.querySelectorAll('[data-png],[data-xpng],.dzPng').forEach(b => b.remove());
    const fsb = document.createElement('button'); fsb.className = 'btn'; fsb.title = 'Show this figure on the whole screen (Esc to leave)'; fsb.textContent = '\u26F6'; fsb.style.cssText = 'width:auto;padding:1px 7px'; fsb.onclick = () => K.fullscreen(card, o);
    const tg = document.createElement('button'); tg.className = 'btn'; tg.title = 'Collapse or expand this figure'; tg.textContent = '▾'; tg.style.cssText = 'width:auto;padding:1px 7px'; row.insertBefore(tg, row.firstChild);
    const set = open => { card.dataset.open = open ? '1' : '0'; tg.textContent = open ? '▾' : '▸'; Array.from(card.children).forEach(ch => { if (ch !== row) ch.style.display = open ? '' : 'none'; }); };
    tg.onclick = () => set(card.dataset.open === '0'); card._fkSet = set;
    const spacer = row.querySelector('span[style*="flex:1"]') || (() => { const s = document.createElement('span'); s.style.flex = '1'; row.appendChild(s); return s; })();
    const wrap = document.createElement('span'); wrap.style.cssText = 'display:inline-flex;gap:4px;flex-wrap:wrap;align-items:center'; wrap.innerHTML = '<button class="btn" data-fk="titles" title="Edit the title and the axis texts">Titles</button><select data-fk="save" title="Save this figure"><option value="">Save...</option><option value="1.5">Picture, screen resolution (PNG)</option><option value="3">Picture, 300 dpi (PNG)</option><option value="6">Picture, 600 dpi (PNG)</option><option value="copy">Copy the picture</option><option value="csv">Numbers of the figure (CSV)</option></select>';
    spacer.after(wrap);
    wrap.appendChild(fsb);
    wrap.querySelector('[data-fk="titles"]').onclick = () => editor(card, o);
    wrap.querySelector('[data-fk="save"]').onchange = async e => {
      const v = e.target.value; e.target.value = ''; if (!v) return; const base = sane(o.name || (card.querySelector('b') || {}).textContent);
      if (v === 'csv') { const t = csvOf(card); if (!t) { alert('This figure has no table of numbers.'); return; } dl(new Blob(['﻿' + t], { type: 'text/csv' }), base + '.csv'); return; }
      if (v === 'copy') { const r = await picture(card, o, 2); try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': r.blob })]); } catch (x) { alert('The picture could not be copied here. Use Save, then paste the file.'); } return; }
      const r = await picture(card, o, +v); if (r.blob) dl(r.blob, base + (+v >= 3 ? '_' + (+v >= 6 ? '600' : '300') + 'dpi' : '') + '.png');
    };
    set(true);
  };
  // every figure of a result as files: { 'name/01_title.png': bytes, 'name/01_title.csv': text }
  K.collect = async function (host, name, scale, onStep) {
    const files = {}, list = Array.from(host.querySelectorAll('.dzfig')).filter(c => c.querySelector('canvas'));
    for (let i = 0; i < list.length; i++) { const c = list[i], was = c.dataset.open; if (was === '0' && c._fkSet) c._fkSet(true); if (onStep) onStep(i + 1, list.length); const nm = String(i + 1).padStart(2, '0') + '_' + sane((c.querySelector('b') || {}).textContent);
      const r = await picture(c, c._fkOpt, scale || 3); if (r.blob) files[name + '/' + nm + '.png'] = new Uint8Array(await r.blob.arrayBuffer()); const t = csvOf(c); if (t) files[name + '/' + nm + '.csv'] = '\ufeff' + t; if (was === '0' && c._fkSet) c._fkSet(false); }
    return files;
  };
  // the processes of one figure as chips; a click opens the figures of that process inside the card
  K.procStrip = function (card, procs, runsFn, note) {
    const P = window.DaisyProc; if (!P || !procs || !procs.length) return; const old = card.querySelector('.dzchips'); if (old) old.remove();
    const d = document.createElement('div'); d.className = 'dzchips'; d.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:3px 0';
    d.innerHTML = '<span class="pnote">Processes of this figure:</span>' + procs.map(id => { const p = P.byId(id); return p ? '<button class="mini" data-pc="' + id + '" title="' + p.d.replace(/"/g, '&quot;') + '" style="border-left:6px solid ' + P.GC[p.g] + '">' + p.n + '</button>' : ''; }).join('') + '<div data-pcd style="flex-basis:100%"></div>';
    const t = card.querySelector('.dzrow'); (t || card.firstChild).after(d); let open = null;
    d.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => { const det = d.querySelector('[data-pcd]'); if (open === b.dataset.pc) { open = null; det.innerHTML = ''; return; } open = b.dataset.pc; P.detailInto(det, open, runsFn ? runsFn() : [], note); });
  };
  // the processes a figure is about, found from the words of its title and note
  K.procsFromText = function (t) {
    t = String(t || '').toLowerCase(); const R = [['bio', /air temp|bioclimate|radiation|wind|humidity|potential evap|reference evap/], ['snow', /snow/], ['surf', /surface|pond|canopy|litter|infiltrat|run-?off|irrigation|precipitation|rain/], ['water', /water|moisture|content|potential|actual evap|transpir|evapotransp|aet|stress/], ['pore', /macropore|pore|bypass/], ['drain', /drain|percolat|leach|bottom|tile|ground ?water/], ['temp', /soil temp|frost|freez|heat/], ['no3', /nitrate|leach|no3|n uptake|nitrogen|fertili/], ['nh4', /ammon|nh4|volatil/], ['om', /organic|humus|som\b|mineralis|immobilis|decompos/], ['carbon', /carbon|co2|respir|c in /], ['deni', /denitri|n2o|nitrous/], ['photo', /photosynth|assimil|light|lai|leaf area|growth/], ['crop', /yield|biomass|crop|root|dry matter|grain|harvest|nitrogen use|efficiency|\bwue\b/]];
    const out = []; R.forEach(r => { if (r[1].test(t)) out.push(r[0]); }); return out;
  };
  // a figure on the whole screen: the screen itself when the browser allows it, otherwise the whole window; the figure is drawn again at the new size
  K.fullscreen = function (card, o) {
    const on = card.classList.contains('dzfs'), done = () => { setTimeout(() => { try { o && o.redraw && o.redraw(); card.querySelectorAll('canvas').length || 0; } catch (e) { } }, 120); };
    if (on) { card.classList.remove('dzfs'); card.style.cssText = card._fsStyle || ''; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); done(); return; }
    card._fsStyle = card.style.cssText; card.classList.add('dzfs'); card.style.cssText += ';position:fixed;left:0;top:0;right:0;bottom:0;z-index:9000;overflow:auto;background:#fff;margin:0;padding:12px;box-sizing:border-box';
    try { if (card.requestFullscreen) card.requestFullscreen().catch(() => { }); } catch (e) { } done();
    const esc = e => { if (e.key === 'Escape' && card.classList.contains('dzfs')) { K.fullscreen(card, o); document.removeEventListener('keydown', esc); } }; document.addEventListener('keydown', esc);
    card.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && card.classList.contains('dzfs')) K.fullscreen(card, o); }, { once: true });
  };
  // a bar for the whole result: collapse all, expand all, every picture in one zip
  K.bar = function (host, o) {
    o = o || {}; const bar = document.createElement('div'); bar.className = 'dzpan dzfk-bar'; bar.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:6px 8px';
    bar.innerHTML = '<b style="margin-right:6px">Figures</b><button class="btn" data-b="c">Collapse all</button><button class="btn" data-b="e">Expand all</button><span style="flex:1"></span><label style="font-size:12px">Save every figure as</label><select data-b="r"><option value="3">300 dpi PNG</option><option value="1.5">screen PNG</option><option value="6">600 dpi PNG</option></select><button class="btn pri" data-b="z">All pictures (zip)</button>';
    host.insertBefore(bar, host.firstChild);
    const cards = () => Array.from(host.querySelectorAll('.dzfig'));
    bar.querySelector('[data-b="c"]').onclick = () => cards().forEach(c => c._fkSet && c._fkSet(false)); bar.querySelector('[data-b="e"]').onclick = () => cards().forEach(c => c._fkSet && c._fkSet(true));
    bar.querySelector('[data-b="z"]').onclick = async e => {
      const btn = e.target, sc = +bar.querySelector('[data-b="r"]').value, files = {}, list = cards(); btn.disabled = true;
      for (let i = 0; i < list.length; i++) { const c = list[i], was = c.dataset.open; if (was === '0') c._fkSet(true); btn.textContent = 'Drawing ' + (i + 1) + ' of ' + list.length + '...'; const r = await picture(c, c._fkOpt, sc); if (r.blob) files[(o.name || 'daisy') + '/' + String(i + 1).padStart(2, '0') + '_' + sane((c.querySelector('b') || {}).textContent) + '.png'] = new Uint8Array(await r.blob.arrayBuffer()); const t = csvOf(c); if (t) files[(o.name || 'daisy') + '/' + String(i + 1).padStart(2, '0') + '_' + sane((c.querySelector('b') || {}).textContent) + '.csv'] = '﻿' + t; if (was === '0') c._fkSet(false); }
      btn.disabled = false; btn.textContent = 'All pictures (zip)'; if (!Object.keys(files).length || !window.DaisyExp) return; dl(new Blob([window.DaisyExp.zip(files)], { type: 'application/zip' }), (o.name || 'daisy') + '-figures.zip');
    };
    return bar;
  };
  K.attach = (card, o) => { if (card) card._fkOpt = o; K.decorate(card, o); };
  return K;
})();
