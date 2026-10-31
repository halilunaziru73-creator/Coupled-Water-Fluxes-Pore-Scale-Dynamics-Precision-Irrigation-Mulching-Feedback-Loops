/* Daisy workbench, Model builder: every model of the Daisy Program Reference Manual as a form. Choose the component (chapter) and the model,
   fill in the parameters (each with its type, unit, default and meaning from the manual), tick the log variables you want, and the
   definition is written for you, checked, and can be opened in the set-up editor, added to the file there, copied or saved as a .dai file.
   The forms come from app/data/daisy/ref (tools/build_reference.py), so they follow the manual model by model. */
'use strict';
(() => {
  const D = typeof DaisyUI !== 'undefined' ? DaisyUI : null; if (!D) return;
  const esc = D.esc, IO = window.DaisyIO;
  const $ = id => document.getElementById('dzB' + id);
  const ld = async n => JSON.parse(await D.getText('ref/' + n + '.json'));
  const chf = n => 'ch' + String(n).padStart(3, '0');
  const S = { idx: null, ch: null, c: null, sec: null, name: '', v: {}, on: {}, log: {}, pending: null };
  const SKIP = /^(daisy\/|Fixed Components|parser|ui$|uifilter|uiitem)/;          // not definable in a set-up file
  const kw = t => 'def' + String(t).replace(/\s+/g, '_');
  const dn = n => String(n).trim().replace(/\s+/g, '_');                              // the manual prints the underscores of Daisy names as spaces
  const sub = a => /^[\u2013\u2014-]\s/.test(String(a.name));                       // an element of a list value (printed '\u2013 key'), set inside its parent
  const isSet = a => !sub(a) && !/state variable|log variable|table column/i.test(a.kind);
  const isState = a => !sub(a) && /state variable/i.test(a.kind);
  const isLog = a => !sub(a) && /log variable|table column/i.test(a.kind);
  const defOf = a => { const m = /default(?:\s+const\s+value)?\s+[\u2018'"]?([A-Za-z0-9_.+\-]+)[\u2019'"]?\s*(?:\[[^\]]*\])?\)/i.exec(a.kind || ''); return m && !/^(value|with|an|has)$/i.test(m[1]) ? m[1] : ''; };
  const optional = a => /optional/i.test(a.kind) || /default/i.test(a.kind);
  const baseType = a => { const t = String(a.type || '').toLowerCase(); if (/^number|^\[/.test(t)) return 'number'; if (/^integer/.test(t)) return 'integer'; if (/^boolean/.test(t)) return 'boolean'; if (/^string/.test(t)) return 'string'; if (/^plf/.test(t)) return 'plf'; if (/component/.test(t)) return 'component'; if (/^(submodel|fixed)/.test(t) || /fixed component/.test(t)) return 'submodel'; return 'raw'; };
  const chapRef = a => { const m = /see chapter (\d+)/i.exec(a.type || ''); return m ? +m[1] : null; };
  const unitOf = a => (a.unit && !/^<?none>?$/i.test(a.unit) ? a.unit : '');

  function html() {
    return '<div class="dzhelp"><b>Model builder: any Daisy model, filled in as a form.</b> 1) Choose the component (a chapter of the reference manual) and the model. 2) Give it a name and fill in the values: every row shows the type, the unit, the default and what it means. The rows you must fill are ticked; tick an optional row to set it. 3) Tick the log variables you want to follow. 4) The definition is written below as you type, checked, and you can put it into the set-up editor, copy it or save it as a .dai file. Nothing has to be typed in the Daisy language.</div>' +
      '<div class="dzrow" style="flex-wrap:wrap;gap:8px"><label>Component <select id="dzBc" style="max-width:300px"><option>Reading the manual...</option></select></label>' +
      '<label>Model <select id="dzBm" style="max-width:300px"></select></label>' +
      '<label>Name <input id="dzBn" size="22" placeholder="for example My loam"></label>' +
      '<input id="dzBq" size="26" placeholder="find a component or model (for example crop, van Genuchten)"><span id="dzBst" class="pnote"></span></div>' +
      '<div id="dzBdesc" class="pnote" style="margin:4px 0 8px"></div>' +
      '<div id="dzBform"></div>' +
      '<h4 style="margin:12px 0 4px">The definition, written for you</h4><div class="dzrow" style="gap:6px;flex-wrap:wrap"><button class="btn pri" id="dzBed">Open in the set-up editor</button><button class="btn" id="dzBadd">Add to the file in the set-up editor</button><button class="btn" id="dzBcp">Copy</button><button class="btn" id="dzBsv">Save as .dai</button><button class="btn" id="dzBrf">Read this model in the reference manual</button><span id="dzBchk" class="pnote"></span></div>' +
      '<pre id="dzBout" class="dzpre" style="max-height:300px;overflow:auto;white-space:pre;background:#FBFBF8;border:1px solid #d6d2c6;padding:8px"></pre>';
  }
  const comps = () => S.idx.chapters.filter(c => c.n >= 7 && !SKIP.test(c.title) && c.models && c.models.length);
  function fillComps(q) {
    q = (q || '').trim().toLowerCase(); const sel = $('c'); const L = comps().filter(c => !q || (c.n + ' ' + c.title).toLowerCase().includes(q) || c.models.some(m => String(m[1]).toLowerCase().includes(q)));
    sel.innerHTML = L.map(c => '<option value="' + c.n + '">' + c.n + '  ' + esc(c.title) + ' (' + c.models.length + ' model' + (c.models.length > 1 ? 's' : '') + ')</option>').join('') || '<option value="">nothing found</option>';
    $('st').textContent = q ? L.length + ' component' + (L.length === 1 ? '' : 's') + ' found' : comps().length + ' components, ' + comps().reduce((s, c) => s + c.models.length, 0) + ' models';
    if (L.length) { const keep = L.find(c => c.n === S.ch) || L[0]; sel.value = keep.n; return pickComp(keep.n, q); }
  }
  async function pickComp(n, q) {
    S.ch = +n; S.c = await ld(chf(n)); const m = $('m'); q = (q || '').toLowerCase();
    const secs = S.c.sections.filter(s => s.sig || s.attrs.length);
    m.innerHTML = secs.map(s => '<option value="' + s.id + '">' + esc(s.id + '  ' + s.name) + '</option>').join('');
    const hit = q && secs.find(s => s.name.toLowerCase().includes(q)); const want = S.pending && secs.find(s => s.id === S.pending) || hit || secs[0]; S.pending = null;
    if (want) { m.value = want.id; pickModel(want.id); }
  }
  function pickModel(id) {
    S.sec = S.c.sections.find(s => s.id === id); S.v = {}; S.on = {}; S.log = {}; if (!S.name) $('n').value = '';
    const s = S.sec, shared = (S.c.attrs || []).filter(isSet);
    $('desc').innerHTML = '<b>' + esc(s.id + ' ' + s.name) + '</b>: ' + esc((s.desc || '').split('\n')[0]) + (s.used ? ' <span class="pnote">Used by ' + esc(s.used.slice(0, 160)) + '</span>' : '');
    const row = (a, i, grp) => { const t = baseType(a), d = defOf(a), req = !optional(a), key = grp + i, u = unitOf(a); S.on[key] = req; S.v[key] = d;
      let inp;
      if (t === 'boolean') inp = '<select data-k="' + key + '"><option value=""></option><option' + (d === 'true' ? ' selected' : '') + '>true</option><option' + (d === 'false' ? ' selected' : '') + '>false</option></select>';
      else if (t === 'component' && chapRef(a)) { const cc = S.idx.chapters.find(c => c.n === chapRef(a)); inp = '<input data-k="' + key + '" list="dzBl' + key + '" size="22" value="' + esc(d) + '" placeholder="a model of ' + esc(cc ? cc.title : 'chapter ' + chapRef(a)) + '"><datalist id="dzBl' + key + '">' + (cc ? cc.models.map(m => '<option value="' + esc(dn(m[1])) + '">').join('') : '') + '</datalist>'; }
      else if (t === 'plf') inp = '<input data-k="' + key + '" size="26" value="" placeholder="pairs x y; x y (for example 0 0; 10 1)">';
      else if (t === 'submodel' || t === 'raw') inp = '<input data-k="' + key + '" size="26" value="' + esc(d) + '" placeholder="' + (t === 'submodel' ? 'inner values, for example (a 1) (b 2)' : 'value as Daisy writes it') + '">';
      else inp = '<input data-k="' + key + '" size="12" value="' + esc(d) + '"' + (t === 'number' || t === 'integer' ? ' inputmode="decimal"' : '') + '>';
      return '<tr><td><input type="checkbox" data-on="' + key + '"' + (req ? ' checked disabled title="must be given"' : ' title="tick to set this value"') + '></td><td><b>' + esc(dn(a.name)) + '</b>' + (req ? ' <span style="color:#b3261e" title="must be given">*</span>' : '') + '</td><td>' + inp + (u ? ' <span class="pnote">' + esc(u) + '</span>' : '') + '</td><td class="pnote">' + esc(String(a.type).replace(/\s*\(see section[^)]*\)/, '')) + (d ? '<br>default ' + esc(d) : optional(a) && /optional/i.test(a.kind) ? '<br>optional' : '') + '</td><td class="dzrfd">' + esc(a.doc.replace(/-\n\s*/g, '').replace(/\s+/g, ' ')) + '</td></tr>'; };
    const sets = s.attrs.filter(isSet), states = s.attrs.filter(isState), logs = s.attrs.filter(isLog);
    const tbl = (rows, grp, title) => rows.length ? '<div class="dzrfg"><b>' + title + '</b> <span class="pnote">' + rows.length + '</span></div><table class="dzt dzrft"><tr><th></th><th>Name</th><th>Value</th><th>Type, default</th><th>Meaning</th></tr>' + rows.map((a, i) => row(a, i, grp)).join('') + '</table>' : '';
    S.attrs = { p: sets, h: shared, s: states, l: logs };
    $('form').innerHTML = (sets.length || shared.length || states.length ? '' : '<p class="pnote">This model has no parameters to set: its name is enough.</p>') +
      tbl(sets, 'p', 'What you set for this model') + tbl(shared, 'h', 'Shared by every model of ' + esc(S.c.title) + ' (chapter ' + S.c.n + ')') + tbl(states, 's', 'Start values of the state variables (optional)') +
      (logs.length ? '<div class="dzrfg"><b>Log variables you want to follow</b> <span class="pnote">' + logs.length + ' &middot; <a href="#" id="dzBla">tick all</a> &middot; <a href="#" id="dzBln">none</a></span></div><div style="columns:3 220px;font-size:12px">' + logs.map((a, i) => '<label style="display:block" title="' + esc(a.doc.split('\n')[0]) + '"><input type="checkbox" data-lg="' + i + '"> ' + esc(dn(a.name)) + (unitOf(a) ? ' <span class="pnote">[' + esc(unitOf(a)) + ']</span>' : '') + '</label>').join('') + '</div>' : '');
    $('form').querySelectorAll('[data-k]').forEach(el => { el.oninput = el.onchange = () => { S.v[el.dataset.k] = el.value; const c = $('form').querySelector('[data-on="' + el.dataset.k + '"]'); if (c && !c.disabled) { c.checked = el.value !== ''; S.on[el.dataset.k] = c.checked; } write(); }; });
    $('form').querySelectorAll('[data-on]').forEach(c => c.onchange = () => { S.on[c.dataset.on] = c.checked; write(); });
    $('form').querySelectorAll('[data-lg]').forEach(c => c.onchange = () => { S.log[c.dataset.lg] = c.checked; write(); });
    const la = $('la'), ln = $('ln'); if (la) la.onclick = e => { e.preventDefault(); $('form').querySelectorAll('[data-lg]').forEach(c => { c.checked = true; S.log[c.dataset.lg] = true; }); write(); }; if (ln) ln.onclick = e => { e.preventDefault(); $('form').querySelectorAll('[data-lg]').forEach(c => { c.checked = false; S.log[c.dataset.lg] = false; }); write(); };
    write();
  }
  function value(a, v) {
    const t = baseType(a); v = String(v == null ? '' : v).trim(); if (v === '') return null;
    if (t === 'string') return /^".*"$/.test(v) ? v : '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
    if (t === 'plf') { const pr = v.split(/[;\n]+/).map(p => p.trim().split(/[\s,]+/).filter(Boolean)).filter(p => p.length === 2); return pr.map(p => '(' + p[0] + ' ' + p[1] + ')').join(' '); }
    if (t === 'submodel') return /^\(/.test(v) ? v : v;
    return v;
  }
  function text() {
    const s = S.sec; if (!s) return ''; const nm = ($('n').value || '').trim() || 'My ' + s.name, L = [];
    L.push('(' + kw(S.c.title) + ' "' + nm.replace(/"/g, "'") + '" ' + dn(s.name));
    L.push('  ;; ' + s.name + ' (' + S.c.title + '), section ' + s.id + ' of the Daisy reference manual' + ((s.desc || '').split('\n')[0] ? ': ' + (s.desc || '').split('\n')[0].slice(0, 110) : ''));
    let miss = []; const emit = (grp, rows) => rows.forEach((a, i) => { const k = grp + i; if (!S.on[k]) return; const v = value(a, S.v[k]); if (v == null) { if (!optional(a)) miss.push(dn(a.name)); return; } const u = unitOf(a); const t = baseType(a); L.push('  (' + dn(a.name) + ' ' + (t === 'submodel' && /^\(/.test(v) ? v : v) + ')' + (u && (t === 'number' || t === 'integer' || t === 'plf') ? '   ; [' + u + ']' : '')); });
    emit('p', S.attrs.p); emit('h', S.attrs.h); emit('s', S.attrs.s);
    L.push(')');
    const lg = S.attrs.l.filter((a, i) => S.log[i]);
    if (lg.length) { L.push(''); L.push(';; Log variables of ' + nm + ' to follow (log them with a column or log definition, chapter 52 of the manual):'); lg.forEach(a => L.push(';;   ' + dn(a.name) + (unitOf(a) ? '  [' + unitOf(a) + ']' : '') + '  ' + a.doc.split('\n')[0].slice(0, 90))); }
    S.miss = miss; return L.join('\n');
  }
  function write() {
    const t = text(); $('out').textContent = t; let msg = '';
    try { const ast = IO && IO.parseDai ? IO.parseDai(t) : { errors: [] }; msg = ast.errors && ast.errors.length ? '<span style="color:#b3261e">' + esc(ast.errors[0]) + '</span>' : '<span style="color:#1B5E20">Brackets and quotes are balanced.</span>'; } catch (e) { msg = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; }
    if (S.miss && S.miss.length) msg += ' <span style="color:#8A5300">Still to fill: ' + esc(S.miss.join(', ')) + '.</span>';
    $('chk').innerHTML = msg;
  }
  async function bind(arg) {
    try { S.idx = S.idx || JSON.parse(await D.getText('ref/index.json')); } catch (e) { $('form').innerHTML = '<div class="warnbox">The manual data are missing: ' + esc(e.message) + '</div>'; return; }
    if (arg && arg.ch) { S.ch = +arg.ch; S.pending = arg.sec || null; }
    fillComps('');
    $('c').onchange = () => pickComp($('c').value); $('m').onchange = () => pickModel($('m').value); $('n').oninput = () => { S.name = $('n').value; write(); };
    let tq = null; $('q').oninput = () => { clearTimeout(tq); tq = setTimeout(() => fillComps($('q').value), 250); };
    const fname = () => (($('n').value || S.sec.name).trim().replace(/\W+/g, '_') || 'model') + '.dai';
    $('ed').onclick = () => { D.S.dai = text(); D.S.daiName = fname(); D.show('editor'); };
    $('add').onclick = () => { D.S.dai = (D.S.dai ? D.S.dai.replace(/\s*$/, '') + '\n\n' : '') + text() + '\n'; D.S.daiName = D.S.daiName || fname(); D.show('editor'); };
    $('cp').onclick = () => { try { navigator.clipboard.writeText(text()); $('chk').innerHTML += ' <span style="color:#1B5E20">Copied.</span>'; } catch (e) { } };
    $('sv').onclick = () => { const b = new Blob([text() + '\n'], { type: 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 3000); };
    $('rf').onclick = () => { if (window.DaisyRefBook && S.sec) window.DaisyRefBook.open(S.sec.id); };
  }
  D.register('build', { html, bind });
  window.DaisyBuild = { open: (ch, sec) => D.show('build', { ch, sec }) };
})();
