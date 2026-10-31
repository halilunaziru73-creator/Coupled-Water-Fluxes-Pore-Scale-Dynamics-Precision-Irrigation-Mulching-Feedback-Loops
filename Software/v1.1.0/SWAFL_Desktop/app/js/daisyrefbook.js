/* Daisy workbench: the Daisy Program Reference Manual (P. Abrahamsen, 31 August 2026) read in full, laid out as the book: Part I The Framework
   (chapters 1 to 6) and Part II The Components (chapters 7 to 107), each chapter with its models, their signatures and every parameter
   (type, unit, kind, description), the models that use it, and the references. The data come from tools/build_reference.py. */
(function () {
  'use strict';
  const D = DaisyUI, esc = D.esc, S = { idx: null, cur: null, all: null, q: '' };
  const $ = id => document.getElementById('dz' + id);
  const ld = async n => JSON.parse(await D.getText('ref/' + n + '.json'));
  const chf = n => 'ch' + String(n).padStart(3, '0');
  const link = t => esc(t).replace(/\(see (chapter )?(\d+(?:\.\d+)*)(?:, page (\d+))?\)/g, (m, c, id, pg) => '(see <a href="#" data-go="' + id + '">' + (c || '') + id + '</a>' + (pg ? ', page ' + pg : '') + ')');
  const goFrom = id => { const n = parseInt(id); return { n, id: id.indexOf('.') > 0 ? id : null }; };
  function html() {
    return '<div class="dzhelp"><b>The reference manual of Daisy, in the order of the book.</b> Part I explains the framework (concepts, file format, logs, errors). Part II has one chapter for each component of Daisy (crop, soil horizon, bioclimate, log and so on), and in each chapter one section for each model with every parameter, its unit and its meaning. <b>How to use it:</b> 1) press a chapter in the contents on the left (or search for a word, a model or a parameter), 2) read the models and parameters, 3) press a blue section number to jump to what a text refers to.</div>' +
      '<div class="dzrow"><input id="dzRFq" placeholder="search all chapters, models and parameters (for example root depth, N uptake, van Genuchten)" size="58"><span id="dzRFst" class="pnote"></span></div>' +
      '<div class="dzsplit"><div id="dzRFtoc" class="dzlist dzrftoc"><span class="pnote">Reading the contents...</span></div><div id="dzRFmain" class="dzdet dzrfmain"></div></div>';
  }
  // the attributes in the groups of the book: what you set (parameters, components, submodels), the state the model keeps, and what it writes to the log
  const KGRP = [['set', 'What you set: parameters, components and submodels', a => !/state variable|log variable|table column/i.test(a.kind)], ['state', 'State variables (the model keeps and updates them; a start value may be given)', a => /state variable/i.test(a.kind)], ['log', 'Log variables and log columns (what this model can write to a log file)', a => /log variable|table column/i.test(a.kind)]];
  const attrRows = attrs => attrs.map(a => '<tr><td><b>' + esc(a.name) + '</b></td><td>' + link(a.type) + '</td><td>' + esc(a.kind || 'not stated in the manual') + '</td><td class="dzrfd">' + link(a.doc) + '</td></tr>').join('');
  const attrTable = (attrs) => { if (!attrs.length) return ''; const head = '<tr><th>Name</th><th>Type and unit</th><th>Kind</th><th>Meaning</th></tr>';
    return KGRP.map(([k, title, f]) => { const g = attrs.filter(f); return g.length ? '<div class="dzrfg"><b>' + title + '</b> <span class="pnote">' + g.length + '</span></div><table class="dzt dzrft">' + head + attrRows(g) + '</table>' : ''; }).join(''); };
  function skeleton(c, s) { const comp = String(c.title).toLowerCase().replace(/\s+/g, '_'); const body = (s.sig || '').replace(/^\s*<\s*/, '').replace(/\s*>\s*$/, ''); return '(def' + comp + ' "My ' + s.name + '" ' + s.name + '\n  ;; edit the values below; see ' + s.id + ' of the reference manual\n  ' + body.replace(/\n\s*/g, '\n  ') + ')\n'; }
  function secHtml(c, s) {
    const part1 = c.n < 7;
    return '<div class="dzrfs" id="dzRF_' + s.id.replace(/\./g, '_') + '"><h4><a class="dzrfn" href="#" data-go="' + s.id + '">' + esc(s.id) + '</a> ' + esc(s.name) + '</h4>' +
      (part1 ? '<div class="dzrftx">' + link(s.text) + '</div>' : '<div class="dzrftx">' + link(s.desc) + '</div>' + (s.used ? '<div class="pnote"><b>Used by</b> ' + link(s.used) + '</div>' : '') + (s.sig ? '<pre class="dzpre dzrfsig">' + esc(s.sig) + '</pre>' + '<div class="dzrow"><button class="btn" data-sk="' + s.id + '" title="Opens a starting set-up for this model in the set-up editor">Start a set-up from this model</button></div>' : '') + attrTable(s.attrs)) + '</div>';
  }
  async function showChapter(n, secId) {
    const host = $('RFmain'); host.innerHTML = '<span class="pnote">Loading chapter ' + n + '...</span>';
    const c = await ld(chf(n)); S.cur = c;
    const ci = S.idx.chapters.find(x => x.n === n);
    let h = '<h3 style="margin:0 0 6px">' + (c.n < 7 ? 'Chapter ' : 'Chapter ') + c.n + ' &nbsp;' + esc(c.title) + '</h3><div class="pnote">Part ' + (c.n < 7 ? 'I, The Framework' : 'II, The Components') + (c.sections.length ? ' &middot; ' + c.sections.length + ' section' + (c.sections.length > 1 ? 's' : '') : '') + '</div>';
    if (c.intro) { const il = c.intro.split('\n'), a = il.findIndex(l => l.trim().startsWith('<')); const desc = (a >= 0 ? il.slice(0, a) : il).join('\n').trim(); h += '<div class="dzrftx">' + link(desc) + '</div>'; if (a >= 0) h += '<pre class="dzpre dzrfsig">' + esc(il.slice(a, (il.findIndex((l, k) => k >= a && /\>\s*$/.test(l))) + 1 || il.length).join('\n').replace(/\n\s*$/, '')) + '</pre>'; }
    if (c.attrs && c.attrs.length) h += '<h4>Parameters and log variables of the component</h4>' + attrTable(c.attrs);
    if (c.sections.length > 3) h += '<div class="dzrfidx"><b>Models in this chapter</b><br>' + c.sections.map(s => '<a href="#" data-go="' + s.id + '">' + esc(s.id) + ' ' + esc(s.name) + '</a>').join(' &middot; ') + '</div>';
    h += c.sections.map(s => secHtml(c, s)).join('');
    if (c.n === 107 || ci && ci.n === S.idx.chapters[S.idx.chapters.length - 1].n) h += '<h4>References of the manual</h4><div id="dzRFbib"></div>';
    host.innerHTML = h; host.scrollTop = 0; mark(n);
    host.querySelectorAll('[data-go]').forEach(a => a.onclick = ev => { ev.preventDefault(); go(a.dataset.go); });
    host.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => { const s = c.sections.find(x => x.id === b.dataset.sk); D.S.dai = skeleton(c, s); D.S.daiName = s.name.replace(/\W+/g, '_') + '.dai'; D.show('editor'); });
    const bb = $('RFbib'); if (bb) ld('biblio').then(b => { bb.innerHTML = b.map(r => '<p class="pnote" style="margin:2px 0">' + esc(r) + '</p>').join(''); });
    if (secId) { const e = document.getElementById('dzRF_' + secId.replace(/\./g, '_')); if (e) { e.scrollIntoView({ block: 'start' }); e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 1800); } }
  }
  function mark(n) { document.querySelectorAll('#dzRFtoc [data-n]').forEach(e => e.classList.toggle('sel', +e.dataset.n === n)); const s = document.querySelector('#dzRFtoc [data-n="' + n + '"]'); if (s) s.scrollIntoView({ block: 'nearest' }); }
  function go(id) { const g = goFrom(id); if (S.idx.chapters.some(c => c.n === g.n)) showChapter(g.n, g.id); }
  function toc(q) {
    const I = S.idx, row = c => '<div class="dzol-i" data-n="' + c.n + '"><b>' + c.n + '</b> ' + esc(c.title) + (c.models.length ? ' <span class="pnote">' + c.models.length + '</span>' : '') + '</div>';
    $('RFtoc').innerHTML = I.parts.map(p => '<div class="dzrfp">Part ' + p.id + ' &nbsp;' + esc(p.title) + '</div>' + I.chapters.filter(c => c.n >= p.from && c.n <= p.to).filter(c => !q || (c.n + ' ' + c.title).toLowerCase().includes(q)).map(row).join('')).join('') + '<div class="dzrfp">References</div><div class="dzol-i" data-n="107" data-bib="1">Bibliography (' + I.refs + ')</div>';
    $('RFtoc').querySelectorAll('[data-n]').forEach(e => e.onclick = () => { if (e.dataset.bib) { showChapter(107).then(() => { const b = $('RFbib'); if (b) b.scrollIntoView(); }); } else showChapter(+e.dataset.n); });
  }
  async function loadAll() { if (S.all) return S.all; $('RFst').textContent = 'Reading all chapters for the search...'; const a = []; for (const c of S.idx.chapters) { const j = await ld(chf(c.n)); a.push(j); } S.all = a; $('RFst').textContent = ''; return a; }
  async function search(q) {
    q = q.trim().toLowerCase(); const host = $('RFmain'); if (!q) { toc(''); return; }
    const all = await loadAll(), hits = [];
    all.forEach(c => { if ((c.n + ' ' + c.title).toLowerCase().includes(q)) hits.push({ k: 'Chapter', c, t: c.title, n: c.n });
      c.sections.forEach(s => { if (s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) hits.push({ k: 'Model', c, s, t: s.id + ' ' + s.name, x: s.desc.slice(0, 160) });
        s.attrs.forEach(a => { if (a.name.toLowerCase().includes(q) || a.doc.toLowerCase().includes(q)) hits.push({ k: 'Parameter', c, s, t: s.id + ' ' + s.name + ' : ' + a.name, x: a.doc.slice(0, 160) }); }); });
      (c.attrs || []).forEach(a => { if (a.name.toLowerCase().includes(q) || a.doc.toLowerCase().includes(q)) hits.push({ k: 'Parameter', c, t: 'Chapter ' + c.n + ' ' + c.title + ' : ' + a.name, x: a.doc.slice(0, 160) }); }); });
    $('RFst').textContent = hits.length + ' hit' + (hits.length === 1 ? '' : 's') + (hits.length > 300 ? ' (first 300 shown)' : '');
    host.innerHTML = '<h3 style="margin:0 0 6px">Search: ' + esc(q) + '</h3>' + hits.slice(0, 300).map((h, i) => '<div class="dzrfh" data-h="' + i + '"><span class="dzrfk">' + h.k + '</span> <b>' + esc(h.t) + '</b><div class="pnote">' + esc(h.x || '') + '</div></div>').join('') || '<p class="pnote">Nothing found.</p>';
    host.querySelectorAll('[data-h]').forEach(e => e.onclick = () => { const h = hits[+e.dataset.h]; showChapter(h.c.n, h.s ? h.s.id : null); });
  }
  async function bind() {
    try { S.idx = JSON.parse(await D.getText('ref/index.json')); } catch (e) { $('RFtoc').innerHTML = '<div class="warnbox">The manual data are missing: ' + esc(e.message) + '</div>'; return; }
    toc(''); let t = null; $('RFq').oninput = () => { clearTimeout(t); t = setTimeout(() => search($('RFq').value), 250); };
    if (S.q) { $('RFq').value = S.q; }
    const first = S.pending || (S.cur && S.cur.n) || 1; S.pending = null; showChapter(first);
  }
  D.register('refman', { html, bind });
  window.DaisyRefBook = { open: id => { S.pending = parseInt(id); D.show('refman'); } };
})();
