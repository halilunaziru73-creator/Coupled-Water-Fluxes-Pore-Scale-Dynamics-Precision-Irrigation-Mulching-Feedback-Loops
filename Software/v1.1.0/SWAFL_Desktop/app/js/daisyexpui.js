/* Daisy workbench, Experiments tab: write in your own words what you want to find out; a plan of runs comes back; run it in a batch or one by one
   (desktop app with Daisy) or explore the 10 190 published runs of the study (works offline anywhere); figures are drawn from the results. */
'use strict';
(() => {
  const R = window.DaisyRef, D = DaisyUI, IO = window.DaisyIO, SC = window.DaisyScen, X = window.DaisyExp, AI = window.DaisyAI, esc = D.esc, K = () => D.kit;
  const $ = id => document.getElementById('dzX' + id);
  const st = { text: '', res: null, factors: [], base: {}, design: 'factorial', max: 40, log: 'annual', useMy: true, rows: [], runs: [], source: 'daisy', preset: null, ens: null, resp: 'yield', jobs: Math.max(2, Math.min(8, (navigator.hardwareConcurrency || 4) - 1)), stop: false, running: false, key: '', model: '', ai: false, responses: [] };
  try { st.key = localStorage.getItem('swafl.ai.key') || ''; st.ai = !!st.key; } catch (e) { }
  const EXLAB = ['Trigger and sensor depth', 'Surface, overhead and drip', 'Drier, warmer, wetter', 'Nitrogen rate and leaching'];
  const EXAMPLES = ['How do the trigger suction (-100 to -800 cm) and the sensor depth (10, 30 and 60 cm) change irrigation and yield on sand and loam?', 'Compare overhead, surface and drip irrigation on a sandy loam with Bologna weather for 10 years', 'What if the rain is 20% less and it is 2 degrees warmer? Does irrigation pay off?', 'How much nitrogen should I apply? Nitrate leaching on all soils, from 40 to 100 percent', 'A water limit of 100, 200 and 300 mm per season: effect on yield and water use efficiency', 'Effect of mulch on evaporation'];
  const flabel = id => { const f = X.factor(id); if (f) return f.label.replace(/, factor.*/, '') + (f.unit ? ' (' + f.unit + ')' : ''); const e = Object.keys(X.ENS_FACTORS).find(k => X.ENS_FACTORS[k][0] === id); return e ? X.ENS_FACTORS[e][1] : id; };
  const rlabel = id => { const r = X.RESP.find(x => x.id === id); return r ? r.label + ' (' + r.unit + ')' : id; };
  const lname = (fid, v) => { const f = X.factor(fid); if (!f || typeof v === 'object') return String(v && v.label || v); return X.levelName(f, v); };
  const ctx = () => { const m = window.DaisyScenUI ? window.DaisyScenUI.my() : {}; return { hasUserWx: !!(m && m.wxMode !== 'course' && m.wx), hasUserSoil: !!(m && m.soilOn) }; };

  // ------------------------------------------------------------------ page
  function html(arg) {
    if (arg && arg !== st.arg) { st.arg = arg; setTimeout(() => { const g = R.suggest(refCtx()).find(x => x.id === arg); if (g) useSuggestion(g); }, 30); }
    const desk = D.isDesk();
    return '<div class="dzpan" style="padding:4px 10px"><b>Experiments</b> <span class="pnote">a scenario is a ready-made small experiment: </span><button class="btn" id="dzXToScen">↳ Scenarios</button></div>' + (window.DaisyScenUI ? window.DaisyScenUI.strip() : '') + '<div class="dzpan"><div class="xhero"><div><h3>Experiments</h3><small>Plan, run and compare</small></div><div class="xsteps"><span><b>1</b>Ask</span><span><b>2</b>Check the plan</span><span><b>3</b>Run and read</span></div></div>' +
      (desk ? '' : '<p class="pnote xweb">Web version: plan and save here; Daisy runs in the desktop app.</p>') +
      '<textarea id="dzXText" rows="2" style="width:100%;box-sizing:border-box" placeholder="What do you want to know? e.g. how do the trigger and the sensor depth change yield on sand and loam?">' + esc(st.text) + '</textarea>' +
      '<div class="dzrow"><button class="btn pri" id="dzXGo">Make a plan from my request</button><label title="Without a key the built-in planner works fully offline. With a key, an online AI reads the request first, and each plan it gives is checked against what Daisy can vary."><input type="checkbox" id="dzXAi"' + (st.ai ? ' checked' : '') + '> online AI (optional)</label><input type="password" id="dzXKey" placeholder="access key" value="' + esc(st.key) + '" style="width:150px;' + (st.ai ? '' : 'display:none') + '"></div>' +
      '<div class="dzrow"><label><b>Experiments of the study</b></label><select id="dzXPreSel">' + X.PRESETS.map(p => '<option value="' + p.id + '"' + (st.preset && st.preset.id === p.id ? ' selected' : '') + '>' + esc(p.id + '  ' + p.name) + '</option>').join('') + '</select><button class="btn" id="dzXPreGo">Load this experiment</button><span class="pnote">each has its own design, its own figures and its own folder of results</span></div>' +
      '<div class="dzpan" id="dzXRef"><div class="dzrow" style="margin:0"><b>Start from the Daisy reference</b><button class="btn" id="dzXTabSug">Best combinations</button><button class="btn" id="dzXTabChap">By topic</button><button class="btn" id="dzXTabImp">Import data and set-ups</button></div><div id="dzXSug"></div><div id="dzXChap" style="display:none"></div><div id="dzXImp" style="display:none"></div></div>' +
      '<div class="xchips">' + EXAMPLES.map((e, i) => i < 4 ? '<a href="#" data-ex="' + i + '" title="' + esc(e) + '">' + esc(EXLAB[i]) + '</a>' : '').join('') + '</div></div>' +
      '<div id="dzXSet"></div><div id="dzXPlan"></div><div id="dzXRunBox"></div><div id="dzXRes"></div>';
  }


  // ------------------------------------------------------------------ combinations from the Daisy reference
  function refCtx() {
    const m = window.DaisyScenUI ? window.DaisyScenUI.my() : {}, c = { userSoil: !!(m && m.soilOn) };
    if (m && m.wxMode !== 'course' && m.wx) { c.Pmean = m.wx.Pmean; c.Tmean = m.wx.Tmean; }
    if (c.userSoil && m.soil && m.soil.horizons && m.soil.horizons[0]) { const h = m.soil.horizons[0]; c.sand = +h.sand; c.clay = +h.clay; }
    c.root = +(st.base && st.base.root) || undefined; return c;
  }
  const LIST = 'max-height:340px;overflow-y:auto;background:#fff;color:#000;box-shadow:inset 1px 1px #808080,inset -1px -1px #fff,inset 2px 2px #404040';
  const rowCss = on => 'display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #ECE9D8;padding:7px 10px;cursor:pointer;font:inherit;color:' + (on ? '#fff' : 'inherit') + ';background:' + (on ? '#0A246A' : 'transparent');
  function tab(which) { st.tab = which; const a = $('Sug'), c = $('Chap'), im = $('Imp'); if (!a || !c || !im) return; a.style.display = which === 'sug' ? '' : 'none'; c.style.display = which === 'chap' ? '' : 'none'; im.style.display = which === 'imp' ? '' : 'none'; [['TabSug', 'sug'], ['TabChap', 'chap'], ['TabImp', 'imp']].forEach(x => { $(x[0]).className = 'btn' + (which === x[1] ? ' pri' : ''); }); }
  function showSuggestions() {
    const box = $('Sug'); if (!box) return; const list = R.suggest(refCtx()), groups = {}; list.forEach(g => { const k = g.group || 'Other combinations'; (groups[k] = groups[k] || []).push(g); });
    if (!st.sugSel || !list.some(g => g.id === st.sugSel)) st.sugSel = list[0].id; const sel = list.find(g => g.id === st.sugSel), O = st.chOpt || { max: 24, design: 'factorial', nl: 3 };
    const chs = g => Array.from(new Set(String(g.ref || '').split(/[,;]/).map(x => parseInt(x)).filter(x => x > 0))), chTxt = g => { const c = chs(g); return c.length ? (c.length > 1 ? 'topics ' : 'topic ') + c.join(', ') : ''; }, nCh = new Set([].concat.apply([], list.map(chs))).size;
    box.innerHTML = '<p class="pnote" style="margin:2px 0 6px">' + list.length + ' ready combinations from ' + nCh + ' topics</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px"><div style="flex:1 1 280px;min-width:240px;' + LIST + '">' + Object.keys(groups).map(k => '<div style="position:sticky;top:0;background:#D4D0C8;color:#0A246A;padding:4px 10px;font-weight:bold;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em">' + esc(k) + '</div>' + groups[k].map(g => '<div style="display:flex;align-items:center;border-bottom:1px solid #ECE9D8;background:' + (g.id === st.sugSel ? '#0A246A' : 'transparent') + ';color:' + (g.id === st.sugSel ? '#fff' : '#000') + '"><input type="checkbox" data-sugck="' + esc(g.id) + '"' + ((st.sugTick || {})[g.id] ? ' checked' : '') + ' style="margin:0 4px 0 8px" title="tick to add several at once"><button style="' + rowCss(false) + ';border:0;flex:1" data-pick="' + esc(g.id) + '">' + esc(g.title.replace(/ \(topic \d+\)$/, '')) + ' <span class="pnote">' + esc(chTxt(g)) + '</span></button></div>').join('')).join('') + '</div>' +
      '<div style="flex:2 1 320px;min-width:260px;max-height:340px;overflow-y:auto"><b>' + esc(sel.title) + '</b><p class="pnote" style="margin:4px 0">' + esc(sel.why) + ' <i>Manual section ' + esc(sel.ref) + ' (' + esc(chTxt(sel)) + ').</i></p><div class="dzrow"><button class="btn pri" data-sug="' + esc(sel.id) + '">Load this experiment</button><button class="btn" data-sugadd="' + esc(sel.id) + '">Add to my experiments</button></div><div class="dzrow"><button class="btn pri" id="dzXSugTicked">Add the ticked (' + Object.keys(st.sugTick || {}).filter(k => st.sugTick[k]).length + ') to my experiments</button><button class="btn" id="dzXSugNone">Clear the ticks</button></div></div></div>';
    box.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { st.sugSel = b.dataset.pick; const y = box.querySelector('div[style*="overflow-y"]').scrollTop; showSuggestions(); const l = box.querySelector('div[style*="overflow-y"]'); if (l) l.scrollTop = y; });
    box.querySelectorAll('[data-sug]').forEach(b => b.onclick = () => useSuggestion(list.find(x => x.id === b.dataset.sug)));
    box.querySelectorAll('[data-sugck]').forEach(c => c.onchange = () => { st.sugTick = st.sugTick || {}; st.sugTick[c.dataset.sugck] = c.checked; const b = $('SugTicked'); if (b) b.textContent = 'Add the ticked (' + Object.keys(st.sugTick).filter(k => st.sugTick[k]).length + ') to my experiments'; });
    const stk = $('SugTicked'); if (stk) stk.onclick = () => { const ids = Object.keys(st.sugTick || {}).filter(k => st.sugTick[k]); if (!ids.length) { stk.nextSibling.nextSibling.textContent = 'Tick at least one in the list first.'; return; } ids.forEach(id => { const g = list.find(x => x.id === id); if (g) addPlan(g, st.max); }); st.sugTick = {}; showSuggestions(); const m = $('SetMsg'); if (m) m.textContent = ids.length + ' experiments added.'; };
    const snn = $('SugNone'); if (snn) snn.onclick = () => { st.sugTick = {}; showSuggestions(); };
    box.querySelectorAll('[data-sugadd]').forEach(b => b.onclick = () => { const g = list.find(x => x.id === b.dataset.sugadd); addPlan(g, st.max); const m = $('SetMsg'); if (m) m.textContent = 'Added: ' + g.title; const sb = $('Set'); if (sb && sb.scrollIntoView) sb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  }

  // ------------------------------------------------------------------ import: every kind of Daisy file goes to the place that uses it
  const dec = new TextDecoder('utf-8');
  const stripC = t => String(t).split('\n').map(l => l.replace(/;.*$/, '')).join('\n');
  const dirOf = p => p.indexOf('/') < 0 ? '' : p.replace(/\/[^/]*$/, ''), baseOf = p => p.replace(/^.*\//, '');
  const norm = p => { const o = []; String(p).split('/').forEach(x => { if (x === '..') o.pop(); else if (x && x !== '.') o.push(x); }); return o.join('/'); };
  function classify(path, text) {
    const n = baseOf(path), low = n.toLowerCase();
    if (/^readme/i.test(n) && /\.txt$|\.md$/i.test(n)) return 'readme';
    if (/\.dai$/i.test(n)) { const c = stripC(text); return /^\s*\(time\s/m.test(c) && /^\s*\(stop\s/m.test(c) && /\(column\s/.test(c) ? 'run' : 'lib'; }
    if (/\.dwf$/i.test(n)) return 'weather';
    if (/\.dlf$/i.test(n)) return 'log';
    if (/\.(csv|txt|tsv|dat|ddf)$/i.test(n)) { const head = String(text).split('\n').slice(0, 30).join('\n').toLowerCase(); if (/\.ddf$/i.test(n)) return 'log'; if (/sand/.test(head) && /clay/.test(head) && /silt|humus|bulk|bd/.test(head)) return 'soil'; if (/precip|rain|\bp\b|nedb/.test(head) && /(tmin|tmax|t_min|t_max|temp|tair)/.test(head)) return 'weather'; return 'table'; }
    return 'other';
  }
  async function readEntries(fileList) {
    const files = {};
    for (const f of fileList) {
      const nm = f.webkitRelativePath || f.name;
      if (/\.zip$/i.test(f.name)) { const z = await X.unzip(await f.arrayBuffer()); Object.keys(z).forEach(k => { if (/\.(dai|dwf|dlf|ddf|csv|txt|tsv|dat|md)$/i.test(k)) files[k] = dec.decode(z[k]); }); }
      else if (/\.(dai|dwf|dlf|ddf|csv|txt|tsv|dat|md)$/i.test(f.name)) files[nm] = await f.text();
    }
    const keys = Object.keys(files), tops = new Set(keys.map(k => k.split('/')[0])); if (tops.size === 1 && keys.every(k => k.indexOf('/') > 0)) { const t = [...tops][0] + '/'; keys.forEach(k => { files[k.slice(t.length)] = files[k]; delete files[k]; }); }
    return files;
  }
  /* the files one set-up needs: the ones it names (input file, weather file), searched from its own folder */
  function neededFiles(path, files) {
    const need = {}, todo = [path]; need[path] = files[path];
    while (todo.length) { const p = todo.pop(), c = stripC(files[p]), d = dirOf(p); let m; const re = /(?:input\s+file|\bfile)\s+"([^"]+)"/g;
      while ((m = re.exec(c))) { const q = norm((d ? d + '/' : '') + m[1].replace(/\\/g, '/')); if (files[q] != null && !need[q]) { need[q] = files[q]; if (/\.dai$/i.test(q)) todo.push(q); } } }
    return need;
  }
  function showImport() {
    const box = $('Imp'); if (!box) return; const I = st.imp, desk = D.isDesk();
    let h = '<p class="pnote" style="margin:4px 0">Bring in what you already have, of any kind: an experiment folder as a .zip (one saved here, or a set of runs you made yourself), Daisy set-up files (.dai), weather (.dwf or a table), a soil table, or logs (.dlf). Each goes where it is used: set-ups are run as experiments, weather and soil go to My data, logs go to Files.</p>' +
      '<div class="dzrow"><button class="btn pri" id="dzXImpBtn">Choose files or a .zip</button><input type="file" id="dzXImpIn" multiple accept=".zip,.dai,.dwf,.dlf,.ddf,.csv,.txt,.tsv,.dat" style="display:none"><span class="pnote" id="dzXImpMsg">' + (I ? '' : 'Nothing imported yet.') + '</span></div>';
    if (I) {
      const by = k => Object.keys(I.kind).filter(p => I.kind[p] === k).sort(), runs = by('run'), wx = by('weather'), soil = by('soil'), logs = by('log'), tabs = by('table'), rd = by('readme'), lib = by('lib');
      h += '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px"><div style="flex:2 1 320px;min-width:260px">';
      h += '<b>Set-ups to run (' + runs.length + ')</b>' + (runs.length ? '<div style="max-height:200px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;padding:4px 8px;background:#fff;margin:4px 0">' + runs.map((p, i) => '<label style="display:block"><input type="checkbox" data-imprun="' + esc(p) + '" ' + (I.pick[p] !== false ? 'checked' : '') + '> ' + esc(p) + '</label>').join('') + '</div><div class="dzrow"><button class="btn pri" id="dzXImpRun">Run the ticked set-ups</button><span class="pnote">' + (desk ? 'Each set-up is run with Daisy as it is; the results are drawn like those of any experiment.' : 'Daisy runs in the desktop app; here you can read the set-ups and send weather, soil and logs on.') + '</span></div>' : '<div class="pnote">No complete set-up (a .dai with time, stop and a column) was found.</div>');
      if (lib.length) h += '<div class="pnote">Library files read: ' + lib.length + ' (' + esc(lib.slice(0, 6).map(baseOf).join(', ')) + (lib.length > 6 ? ', ...' : '') + ')</div>';
      if (rd.length) h += '<details style="margin-top:6px"><summary class="pnote">' + esc(baseOf(rd[0])) + '</summary><pre style="white-space:pre-wrap;max-height:240px;overflow:auto;font-size:12px">' + esc(I.files[rd[0]]) + '</pre></details>';
      h += '</div><div style="flex:1 1 240px;min-width:220px">';
      const lst = (title, arr, act, label) => arr.length ? '<b>' + title + ' (' + arr.length + ')</b><div style="max-height:120px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;background:#fff;margin:4px 0 8px">' + arr.map(p => '<div style="padding:3px 8px;border-bottom:1px solid #eef0f3">' + esc(p) + ' <a href="#" data-impact="' + act + '" data-p="' + esc(p) + '">' + label + '</a></div>').join('') + '</div>' : '';
      h += lst('Weather', wx, 'wx', 'use in My data') + lst('Soil tables', soil, 'soil', 'use in My data') + lst('Logs and data tables', logs.concat(tabs), 'log', 'open in Files');
      if (!wx.length && !soil.length && !logs.length && !tabs.length) h += '<div class="pnote">No weather, soil or log files in what was imported.</div>';
      h += '</div></div>';
    }
    box.innerHTML = h + '<div id="dzXImpOut"></div>';
    $('ImpBtn').onclick = () => $('ImpIn').click();
    $('ImpIn').onchange = async ev => { const msg = $('ImpMsg'); try { msg.textContent = 'Reading...'; const files = await readEntries(Array.from(ev.target.files)); const kind = {}; Object.keys(files).forEach(p => { kind[p] = classify(p, files[p]); }); if (!Object.keys(files).length) throw new Error('no Daisy file was found in what you chose'); st.imp = { files, kind, pick: {} }; showImport(); $('ImpMsg').textContent = Object.keys(files).length + ' files read: ' + Object.keys(kind).filter(k => kind[k] === 'run').length + ' set-up(s), ' + Object.keys(kind).filter(k => kind[k] === 'weather').length + ' weather file(s), ' + Object.keys(kind).filter(k => kind[k] === 'log').length + ' log(s).'; } catch (e) { msg.innerHTML = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; } };
    box.querySelectorAll('[data-imprun]').forEach(c => c.onchange = () => { st.imp.pick[c.dataset.imprun] = c.checked; });
    box.querySelectorAll('[data-impact]').forEach(a => a.onclick = ev => { ev.preventDefault(); const p = a.dataset.p, t = st.imp.files[p], act = a.dataset.impact;
      try { if (act === 'log') { const d = D.parseAny(baseOf(p), t); if (!d.n) throw new Error('no table found in ' + baseOf(p)); D.addLog(d, baseOf(p)); D.regList(); D.refreshSelects(); $('ImpOut').innerHTML = '<span class="pnote">' + esc(baseOf(p)) + ' is now in the Files tab (' + d.n + ' rows).</span>'; }
        else if (window.DaisyScenUI && window.DaisyScenUI.useFile) { window.DaisyScenUI.useFile(act, baseOf(p), t); } } catch (e) { $('ImpOut').innerHTML = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; } });
    const rb = $('ImpRun'); if (rb) rb.onclick = () => runImported();
  }
  async function runImported() {
    const I = st.imp; if (!I) return; if (st.running) { st.stop = true; return; }
    const paths = Object.keys(I.kind).filter(p => I.kind[p] === 'run' && I.pick[p] !== false); if (!paths.length) { $('ImpOut').innerHTML = '<span style="color:#b3261e">Tick at least one set-up.</span>'; return; }
    if (!D.isDesk() || !window.swafl || !window.swafl.daisyJob) { $('ImpOut').innerHTML = '<span style="color:#b3261e">Daisy itself runs in the desktop app. Here the set-ups can be read, and the weather, the soil and the logs sent on.</span>'; return; }
    try {
      let info = await window.swafl.daisyInfo(); if (!info.found) info = await window.swafl.daisyChoose(); if (!info.found) throw new Error('The Daisy program of SWAFL was not found (it is the folder daisy next to the program). Unzip the whole SWAFL zip again, or choose bin\\daisy-bin.exe of an installed Daisy 7.1.14 (never the installer file daisy-7.1.14-Windows-...exe).');
      let F = X.factor('run'); if (!F) { F = { id: 'run', key: 'run', label: 'Set-up', unit: '', kind: 'cat', levels: [] }; X.FACTORS.push(F); }
      const jobs = paths.map((p, i) => ({ run: { id: 'i' + String(i + 1).padStart(2, '0'), label: baseOf(p).replace(/\.dai$/i, ''), val: { run: baseOf(p).replace(/\.dai$/i, '') } }, job: { main: p, files: neededFiles(p, I.files), options: {}, scenario: 'import' } }));
      const nm = jobs.map(j => j.run.val.run); if (new Set(nm).size < nm.length) jobs.forEach(j => { j.run.val.run = j.run.label = j.job.main.replace(/\.dai$/i, ''); });
      st.rows = []; st.runs = []; st.fids = ['run']; st.source = 'daisy'; st.design0 = { runs: jobs.map(j => ({ id: j.run.id, label: j.run.label, set: {}, val: j.run.val })), factors: [{ id: 'run', levels: nm }] }; st.running = true; st.stop = false;
      const out = $('ImpOut'); out.innerHTML = '<div class="dzpan"><b id="dzXImpProg">0 of ' + jobs.length + ' set-ups</b><div id="dzXImpList" class="pnote" style="max-height:120px;overflow:auto"></div></div>'; $('ImpRun').textContent = 'Stop';
      let next = 0, done = 0; const t0 = Date.now(), nPar = Math.max(1, Math.min(st.jobs || 2, jobs.length));
      const work = async () => { while (next < jobs.length && !st.stop) { const { run: rn, job } = jobs[next++]; let r; try { r = await window.swafl.daisyJob(job); } catch (e) { r = { code: -1, err: e.message, logs: {} }; }
        const logs = {}; Object.keys(r.logs || {}).forEach(n => { const k = SC.logKey(n); if (k) { try { const d = IO.readDlf(r.logs[n], n); if (d.n) logs[k] = d; } catch (e) { } } });
        done++; if (!logs['Annual-Harvest']) $('ImpList').innerHTML += '<div style="color:#b3261e">' + esc(rn.label) + ': Daisy gave no annual harvest log (code ' + r.code + '): ' + esc(((r.err || r.out || '') + '').split('\n').filter(l => /error/i.test(l)).slice(0, 1).join(' ') || 'the set-up writes no Annual-Harvest.dlf') + '</div>';
        else { const sx = DaisyFig.stats({ logs }); st.rows.push({ id: rn.id, label: rn.label, val: rn.val, f: rn.val, r: X.respOf(sx) }); st.runs.push({ id: rn.id, label: rn.label, logs, options: {} }); }
        $('ImpProg').textContent = done + ' of ' + jobs.length + ' set-ups (' + Math.round((Date.now() - t0) / 1000) + ' s)'; } };
      await Promise.all(Array.from({ length: nPar }, work)); st.running = false; $('ImpRun').textContent = 'Run the ticked set-ups';
      if (!st.rows.length) throw new Error('none of the set-ups gave results; see the messages above'); drawResults(); $('ImpProg').textContent = 'Finished ' + st.rows.length + ' of ' + jobs.length + ' set-ups in ' + Math.round((Date.now() - t0) / 1000) + ' s. The results are below.';
      const r = $('Res'); if (r && r.scrollIntoView) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { st.running = false; const b = $('ImpRun'); if (b) b.textContent = 'Run the ticked set-ups'; $('ImpOut').innerHTML = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; }
  }
  // ------------------------------------------------------------------ chapter by chapter of the Daisy reference manual
  const PART = n => n <= 6 ? 'Part I, the framework' : n <= 106 ? 'Part II, the components' : 'Appendix';
  function showChapters() {
    const box = $('Chap'); const CH = window.DaisyChapters; if (!box || !CH) return; if (st.chap == null) st.chap = 1; st.chOpt = st.chOpt || { max: 24, design: 'factorial', nl: 3 };
    const O = st.chOpt, map = R.CHAPTER_MAP, rel = R.CHAPTER_RELATED, all = R.suggest(Object.assign(refCtx(), { userSoil: false })), n = st.chap, c = CH.find(x => x.n === n) || CH[0];
    const hasX = k => map[k] || rel[k] || (X.PARAMS || []).some(q => q.ch === k);
    const direct = (map[c.n] || []).map(i => all.find(x => x.id === i)).filter(Boolean), relIds = ((rel[c.n] && rel[c.n].ids) || []).filter(i => (map[c.n] || []).indexOf(i) < 0), related = relIds.map(i => all.find(x => x.id === i)).filter(Boolean);
    const general = !direct.length && !related.length ? R.GENERAL.map(i => all.find(x => x.id === i)).filter(Boolean) : [];
    // the size of an experiment: how many levels per parameter, which combinations, at most how many runs
    const shape = plan => { const pick = (lv, k) => { if (!Array.isArray(lv) || lv.length <= k) return lv.slice(); const out = []; for (let i = 0; i < k; i++) out.push(lv[Math.round(i * (lv.length - 1) / Math.max(1, k - 1))]); return out.filter((v, i, a) => a.indexOf(v) === i); };
      return { design: O.design, max: O.max, base: Object.assign({}, plan.base), factors: plan.factors.map(f => ({ id: f.id, levels: (X.factor(f.id) && X.factor(f.id).kind === 'num' ? pick(f.levels, O.nl) : f.levels.slice()) })) }; };
    const count = plan => { try { const d = X.design(Object.assign(shape(plan), { seed: 7 })); return d.runs.length; } catch (e) { return null; } };
    const btn = (g, cls) => { const k = count(g.plan); return '<div class="dzrow" style="align-items:flex-start;margin-top:6px"><button class="btn' + (cls ? ' pri' : '') + '" data-chsug="' + g.id + '" style="min-width:230px;text-align:left">Load: ' + esc(g.title) + '' + '</button><button class="btn" data-chadd="' + g.id + '" title="Add to my experiments">+</button><span class="pnote" style="flex:1">' + esc(g.why) + ' <i>Manual section ' + esc(g.ref) + '.</i></span></div>'; };
    let h = '<p class="pnote" style="margin:4px 0">' + CH.length + ' topics of the Daisy reference. Choose one and load its experiments.';
    h += '<div class="dzrow" style="background:#f4f8fc;padding:6px 8px;border-radius:6px"><b>How big an experiment?</b><label>levels per parameter</label><select id="dzXChNl">' + [2, 3, 4, 5].map(k => '<option' + (O.nl === k ? ' selected' : '') + '>' + k + '</option>').join('') + '</select><label>combinations</label><select id="dzXChDs">' + [['factorial', 'test every combination'], ['oat', 'change one thing at a time'], ['paired', 'pair the values in order']].map(d => '<option value="' + d[0] + '"' + (O.design === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select><label>at most</label><input type="number" id="dzXChMax" min="2" max="500" value="' + O.max + '" style="width:64px"><label>runs</label><span class="pnote">Runs per experiment are shown on its button.</span></div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px"><div id="dzXChList" style="flex:1 1 220px;min-width:200px;' + LIST + '">' + ['Part I, the framework', 'Part II, the components', 'Appendix'].map(pt => '<div style="position:sticky;top:0;background:#f1f4f8;padding:3px 8px;font-weight:600;font-size:12px">' + pt + '</div>' + CH.filter(x => PART(x.n) === pt).map(x => '<button style="' + rowCss(x.n === n) + '" data-chn="' + x.n + '">' + x.n + '. ' + esc(x.title) + (hasX(x.n) ? ' <span class="pnote">*</span>' : '') + '</button>').join('')).join('') + '</div>' +
      '<div id="dzXChDet" style="flex:3 1 340px;min-width:280px;max-height:520px;overflow-y:auto"><div class="dzrow" style="margin:0"><button class="btn" id="dzXChPrev">&laquo; previous</button><button class="btn" id="dzXChNext">next &raquo;</button><span class="pnote">' + esc(PART(n)) + ' &middot; * has its own experiments</span></div>';
    h += '<div style="margin-top:6px"><b>Topic ' + c.n + ': ' + esc(c.title) + '</b> <span class="pnote">' + c.sections.length + ' model' + (c.sections.length === 1 ? '' : 's') + ' listed</span><p class="pnote" style="margin:4px 0">' + esc(c.intro) + '</p></div>';
    if (direct.length) h += '<div><b>Experiments from this topic</b>' + direct.map(g => btn(g, 1)).join('') + '</div>';
    const prs = (X.PARAMS || []).filter(q => q.ch === c.n && X.factor(q.opt));
    if (prs.length) h += '<div style="margin-top:6px"><b>Parameters of this topic you can vary</b> <span class="pnote">each was tested in Daisy: tick one or several and press the button. Levels are fractions of the value the farm uses.</span>' +
      prs.map(q => '<div class="dzrow" style="align-items:flex-start;margin-top:4px"><label style="min-width:230px"><input type="checkbox" data-chpar="' + esc(q.opt) + '"> <b>' + esc(q.name) + '</b> <span class="pnote">' + esc(q.unit || '') + '</span></label><span class="pnote" style="flex:1">' + esc(q.desc) + ' <i>' + esc(q.use || 'the standard model') + (q.farm != null ? '; the farm uses ' + q.farm : '; manual default ' + q.def) + '. ' + (q.use === 'aquitard' ? 'Applies to the loam profile; the sand profile has free drainage. ' : '') + (q.sens ? 'Changed yield, water or nitrogen in the test.' : 'No change in yield, water or nitrogen seen in the test, only in the process it belongs to.') + '</i></span></div>').join('') +
      '<div class="dzrow"><button class="btn pri" id="dzXChPar">Make the experiment from the ticked parameters</button><span class="pnote"></span></div></div>';
    if (related.length) h += '<div style="margin-top:6px"><b>' + (direct.length || prs.length ? 'Related experiments' : 'Experiments for this topic') + '</b> <span class="pnote">' + (direct.length || prs.length ? '' : 'Daisy does not take the parameters of this topic in these runs yet, so the experiments vary ') + 'the process it belongs to: ' + esc(rel[c.n].topic) + '.</span>' + related.map(g => btn(g, !direct.length && !prs.length && g === related[0])).join('') + '</div>';
    if (general.length) h += '<div style="margin-top:6px"><b>Experiments to start with</b> <span class="pnote">' + (c.n <= 6 || /file|format|number|string|unit|ui|parser|log|scope|select|source|plot|summary|program/i.test(c.title) ? 'This topic is about how Daisy reads, writes or presents data, so there is no process to vary in it. ' : 'This topic is a building block with no process of its own to vary. ') + 'These five experiments are the starting set for this farm.</span>' + general.map((g, i) => btn(g, i === 0)).join('') + '</div>';
    if (c.sections.length) h += '<details style="margin-top:6px"><summary class="pnote">The models of this topic and their parameters</summary><div style="max-height:260px;overflow:auto;font-size:12px">' + c.sections.map(x => '<div style="margin:3px 0"><b>' + esc(x.id) + ' ' + esc(x.name) + '</b> ' + esc(x.desc) + (x.params.length ? ' <span class="pnote">(' + esc(x.params.join(', ')) + ')</span>' : '') + '</div>').join('') + '</div></details>';
    box.innerHTML = h + '</div></div>'; const cur = box.querySelector('[data-chn="' + n + '"]'); if (cur && st.chScroll == null) st.chScroll = 1; const lst = $('ChList'); if (lst) { lst.scrollTop = st.chListTop != null ? st.chListTop : Math.max(0, (cur ? cur.offsetTop : 0) - 120); lst.onscroll = () => { st.chListTop = lst.scrollTop; }; }
    const go = k => { st.chap = Math.max(1, Math.min(CH[CH.length - 1].n, k)); st.chapOpen = true; setTimeout(showChapters, 0); };
    box.querySelectorAll('[data-chn]').forEach(b => b.onclick = () => go(+b.dataset.chn)); $('ChPrev').onclick = () => go(n - 1); $('ChNext').onclick = () => go(n + 1);
    const opt = () => { O.nl = +$('ChNl').value; O.design = $('ChDs').value; O.max = Math.max(2, Math.min(500, parseInt($('ChMax').value) || 24)); st.chapOpen = true; setTimeout(showChapters, 0); };
    $('ChNl').onchange = opt; $('ChDs').onchange = opt; $('ChMax').onchange = opt;
    const load = g => { st.chapOpen = true; st.max = O.max; useSuggestion(Object.assign({}, g, { plan: shape(g.plan) })); };
    const pb = $('ChPar'); if (pb) pb.onclick = () => { const ids = [].slice.call(box.querySelectorAll('[data-chpar]:checked')).map(i => i.dataset.chpar); if (!ids.length) { pb.nextSibling.textContent = 'Tick at least one parameter first.'; return; }
      load({ id: 'param', title: 'Vary ' + ids.map(id => X.factor(id).param.name).join(' and '), why: 'Topic ' + c.n + ' (' + c.title + ') of the Daisy reference lists ' + (ids.length > 1 ? 'these parameters' : 'this parameter') + '. Each level is a fraction of the value the farm uses, so the runs show how much the results depend on ' + (ids.length > 1 ? 'them' : 'it') + '.', ref: String(c.n), plan: { design: 'factorial', factors: ids.map(id => ({ id, levels: X.factor(id).levels.slice() })), base: {} } }); };
    box.querySelectorAll('[data-chadd]').forEach(b => b.onclick = () => { const g = [].concat(direct, related, general).find(x => x.id === b.dataset.chadd); if (g) { addPlan(Object.assign({}, g, { plan: shape(g.plan) }), O.max); b.textContent = 'added'; } });
    box.querySelectorAll('[data-chsug]').forEach(b => b.onclick = () => load([].concat(direct, related, general).find(x => x.id === b.dataset.chsug)));
  }
  function useSuggestion(g) {
    if (!g) return; st.text = g.title; const t = $('Text'); if (t) t.value = g.title; const plan = { factors: g.plan.factors.map(f => ({ id: f.id, levels: f.levels.slice() })), base: Object.assign({}, g.plan.base), design: g.plan.design };
    adopt({ plan, understood: [g.title + '. ' + g.why + ' (manual section ' + g.ref + ')'], questions: [], engine: 'reference' }); const pl = $('Plan'); if (pl && pl.scrollIntoView) setTimeout(() => pl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  // ------------------------------------------------------------------ weather: built-in stations, online weather of the user's area, or the weather of My data
  function curPick() { const U = window.DaisyScenUI, m = U ? U.my() : {}; return st.wxPick || (m.wxMode === 'course' || !m.wx ? 'built' : m.wxMode === 'project' ? '__proj' : m.wxMode === 'online' ? '__online' : '__my'); }
  function wxSelect() {
    const U = window.DaisyScenUI, m = U ? U.my() : {}; if (U) U.defaultWx(); const pn = U && U.projectName(), pick = curPick(), dis = st.factors.some(f => f.id === 'station') ? ' disabled' : '';
    return '<select data-b="station"' + dis + '><optgroup label="Online, for my area"><option value="__online"' + (pick === '__online' ? ' selected' : '') + '>Online weather of my area (Open-Meteo, any place)</option>' + (pn ? '<option value="__proj"' + (pick === '__proj' ? ' selected' : '') + '>The weather of my SWAFL project: ' + esc(pn) + '</option>' : '') + (m.wx && m.wxMode !== 'project' && m.wxMode !== 'online' ? '<option value="__my"' + (pick === '__my' ? ' selected' : '') + '>My weather: ' + esc(m.wx.src || m.wx.name || 'from My data') + '</option>' : '') + '</optgroup><optgroup label="Built-in stations">' +
      SC.STATIONS.map(s => '<option value="' + s.id + '"' + (pick === 'built' && (st.base.station || (m.wxMode === 'course' && m.station) || 'course') === s.id ? ' selected' : '') + '>' + esc(s.label) + '</option>').join('') + '</optgroup></select>';
  }
  function wxRow() {
    if (curPick() !== '__online') return ''; const m = window.DaisyScenUI.my(), yE = new Date().getUTCFullYear() - 1;
    return '<span id="dzXWxOn"><label>Place</label><input type="text" id="dzXPlace" value="' + esc(m.place || st.place || '') + '" placeholder="a town, village or farm" style="width:170px"><label>years</label><input type="number" id="dzXY0" value="' + (m.y0 || yE - 11) + '" style="width:64px"> to <input type="number" id="dzXY1" value="' + (m.y1 || yE) + '" style="width:64px"><button class="btn pri" id="dzXWxGet">Get the weather</button><span class="pnote" id="dzXWxMsg">' + (m.wx && m.wxMode === 'online' ? esc(m.wx.src || '') + ' is ready' : 'needs the internet once') + '</span></span>';
  }
  function bindWx() {
    const g = $('WxGet'); if (!g) return;
    g.onclick = async () => { const msg = $('WxMsg'); try { msg.textContent = 'Looking for the place and getting the weather...'; st.place = $('Place').value.trim(); const w = await window.DaisyScenUI.online(st.place, +$('Y0').value, +$('Y1').value); st.useMy = true; msg.textContent = (w.src || 'weather') + ' is ready: ' + w.first + ' to ' + w.last + '.'; const u = $('UseMy'); if (u) u.checked = true; count(); } catch (e) { msg.innerHTML = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; } };
  }

  // ------------------------------------------------------------------ my experiments: several experiments loaded together, run together and saved together
  const slug2 = t => String(t || 'experiment').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 34) || 'experiment';
  const setName = (it, i) => 'E' + (i + 1) + '_' + slug2(it.label);
  function snap(label) { readPlanInputs(); return { label: label || (st.res && st.res.plan && st.res.plan.title) || st.text || 'Experiment', text: st.text, factors: st.factors.map(f => ({ id: f.id, levels: f.levels.slice() })), base: Object.assign({}, st.base), design: st.design, max: st.max, responses: (st.responses || []).slice(), log: st.log, pid: st.preset ? st.preset.id : (st.pid || null) }; }
  function applyItem(it) { st.text = it.text || it.label; st.factors = it.factors.map(f => ({ id: f.id, levels: f.levels.slice() })); st.base = Object.assign({}, it.base); st.design = it.design || 'factorial'; st.max = it.max || 40; st.responses = (it.responses || []).slice(); st.resp = st.responses[0] || 'yield'; if (it.log) st.log = it.log; st.res = { plan: { title: it.label, factors: st.factors, base: st.base }, understood: [it.label], questions: [], engine: 'reference' }; st.preset = null; st.pid = it.pid || null; st.source = 'daisy'; }
  function addToSet(it) { st.set = st.set || []; st.set.push(Object.assign({ res: null }, it)); renderSet(); }
  function addPlan(g, shaped) { addToSet({ label: g.title.replace(/ \(topic \d+\)$/, ''), text: g.title, factors: g.plan.factors.map(f => ({ id: f.id, levels: f.levels.slice() })), base: Object.assign({}, g.plan.base), design: g.plan.design || 'factorial', max: shaped || st.max, responses: [], log: st.log }); }
  function renderSet() {
    const box = $('Set'); if (!box) return; const L = st.set || [];
    let h = '<div class="dzpan"><div class="dzrow" style="margin:0"><h3 style="margin:0">My experiments</h3><span class="pnote">' + (L.length ? L.length + ' loaded. ' : '') + 'Load as many as you like, then run or save them together.</span></div>';
    const nOn = L.filter(it => it.on !== false).length;
    if (L.length) h += '<div style="max-height:260px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;background:#fff;margin-top:6px"><table class="dztab" style="width:100%"><tr><th title="run this one">Run</th><th>Order</th><th>Experiment (each is designed on its own)</th><th>Combinations</th><th>at most</th><th></th></tr>' + L.map((it, i) => '<tr><td><input type="checkbox" data-seton="' + i + '"' + (it.on !== false ? ' checked' : '') + '></td><td style="white-space:nowrap"><b>E' + (i + 1) + '</b></td><td><input type="text" data-setlab="' + i + '" value="' + esc(it.label) + '" style="width:100%;min-width:200px"><div class="pnote">' + it.factors.map(f => esc(flabel(f.id).replace(/ \(.*/, ''))).join(' x ') + (it.res ? ' &middot; ' + it.res.rows.length + ' runs done' : '') + '</div></td><td><select data-setds="' + i + '">' + [['factorial', 'test every combination'], ['oat', 'change one thing at a time'], ['paired', 'pair the values in order']].map(d => '<option value="' + d[0] + '"' + ((it.design || 'factorial') === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select></td><td><input type="number" data-setmax="' + i + '" value="' + (it.max || 40) + '" min="1" max="2000" style="width:62px"> runs</td><td style="white-space:nowrap"><button class="btn" data-setopen="' + i + '">Open</button><button class="btn" data-setup="' + i + '" title="earlier in the list: run first">&uarr;</button><button class="btn" data-setdn="' + i + '" title="later in the list">&darr;</button><button class="btn" data-setdel="' + i + '">remove</button></td></tr>').join('') + '</table></div><div class="pnote">The list is the order of preference: the experiments are run from the top down, and only the ticked ones. ' + nOn + ' of ' + L.length + ' ticked.</div>';
    h += '<div class="dzrow"><button class="btn" id="dzXSetAddCur">Add the experiment below</button>' + (L.length ? '<button class="btn pri" id="dzXSetRun">Run the ticked</button><button class="btn" id="dzXSetZip">Save the ticked as one folder (.zip)</button><button class="btn" id="dzXSetJson">Save the ticked (.json)</button><button class="btn" id="dzXSetAll">Tick all / none</button><button class="btn" id="dzXSetClear">Empty the list</button>' : '') + '<label class="btn" style="cursor:pointer">Open a saved plan (.json)<input type="file" id="dzXSetOpen" accept=".json" style="display:none"></label><span id="dzXSetMsg" class="pnote"></span></div></div>';
    box.innerHTML = h;
    const msg = t => { const e = $('SetMsg'); if (e) e.innerHTML = t; };
    box.querySelectorAll('[data-setlab]').forEach(i => i.onchange = () => { L[+i.dataset.setlab].label = i.value; });
    box.querySelectorAll('[data-setopen]').forEach(b => b.onclick = () => { const it = L[+b.dataset.setopen]; applyItem(it); renderPlan(); const pl = $('Plan'); if (pl && pl.scrollIntoView) pl.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    box.querySelectorAll('[data-setup]').forEach(b => b.onclick = () => { const i = +b.dataset.setup; if (i > 0) { L.splice(i - 1, 0, L.splice(i, 1)[0]); renderSet(); } });
    box.querySelectorAll('[data-seton]').forEach(c => c.onchange = () => { L[+c.dataset.seton].on = c.checked; renderSet(); });
    box.querySelectorAll('[data-setds]').forEach(c => c.onchange = () => { L[+c.dataset.setds].design = c.value; });
    box.querySelectorAll('[data-setmax]').forEach(c => c.onchange = () => { L[+c.dataset.setmax].max = Math.max(1, parseInt(c.value) || 40); });
    box.querySelectorAll('[data-setdn]').forEach(b => b.onclick = () => { const i = +b.dataset.setdn; if (i < L.length - 1) { L.splice(i + 1, 0, L.splice(i, 1)[0]); renderSet(); } });
    const ta = $('SetAll'); if (ta) ta.onclick = () => { const to = L.some(it => it.on === false); L.forEach(it => { it.on = to; }); renderSet(); };
    box.querySelectorAll('[data-setdel]').forEach(b => b.onclick = () => { L.splice(+b.dataset.setdel, 1); renderSet(); });
    const ac = $('SetAddCur'); if (ac) ac.onclick = () => { if (!st.factors.length) { msg('Load or write an experiment first.'); return; } addToSet(snap()); };
    const rb = $('SetRun'); if (rb) rb.onclick = () => runAll();
    const zb = $('SetZip'); if (zb) zb.onclick = saveSetZip;
    const jb = $('SetJson'); if (jb) jb.onclick = () => D.download('daisy-experiments.json', JSON.stringify({ set: L.filter(it => it.on !== false).map(it => ({ name: it.label, text: it.text, plan: { factors: it.factors, base: it.base, design: it.design, max: it.max }, responses: it.responses })) }, null, 1), 'application/json');
    const cl = $('SetClear'); if (cl) cl.onclick = () => { st.set = []; renderSet(); };
    $('SetOpen').onchange = async ev => { try { for (const f of Array.from(ev.target.files)) { const j = JSON.parse(await f.text()), arr = j.set || [j]; arr.forEach(x => { const p = x.plan || x; if (!p.factors) throw new Error(f.name + ' has no experiment in it'); p.factors.forEach(q => { if (!X.factor(q.id)) throw new Error('this plan uses "' + q.id + '", which this version does not know'); }); addToSet({ label: x.name || x.request || f.name.replace(/\.json$/, ''), text: x.request || x.text || x.name, factors: p.factors.map(q => ({ id: q.id, levels: q.levels.slice() })), base: Object.assign({}, p.base), design: p.design || 'factorial', max: p.max || 40, responses: x.responses || [], log: st.log }); }); } } catch (e) { msg('<span style="color:#b3261e">' + esc(e.message) + '</span>'); } };
  }
  async function runAll() {
    if (st.running) { st.stop = true; D.note('Xst', 'Stopping after the runs that have started...'); return; }
    if (!D.isDesk() || !window.swafl || !window.swafl.daisyJob) { D.note('XSetMsg', 'Daisy itself runs in the desktop app. Here you can save all experiments as one folder (.zip) and run it anywhere.', 1); return; }
    const items = (st.set || []).filter(it => it.on !== false), keep = snap(); if (!items.length) { D.note('XSetMsg', 'Tick at least one experiment.', 1); return; } const sm = $('SetMsg'); st.stopAll = false;
    for (let i = 0; i < items.length; i++) {
      applyItem(items[i]); renderPlan(); const m = $('SetMsg'); if (m) m.textContent = 'Experiment E' + ((st.set || []).indexOf(items[i]) + 1) + ' (' + (i + 1) + ' of ' + items.length + '): ' + items[i].label; st.rows = []; st.runs = [];
      await run(false); if (st.rows.length) items[i].res = { rows: st.rows.slice(), runs: st.runs.slice(), fids: st.fids, design0: st.design0, resp: st.resp }; if (st.stop) break;
    }
    st.curSet = items.findIndex(it => it.res); renderSet(); const m = $('SetMsg'); if (m) m.textContent = 'Finished: ' + items.filter(it => it.res).length + ' of ' + items.length + ' experiments have results; choose which to look at above the figures.'; if (st.curSet >= 0) showSetRes(st.curSet);
  }
  function showSetRes(i) { const it = (st.set || [])[i]; if (!it || !it.res) return; st.curSet = i; st.rows = it.res.rows; st.runs = it.res.runs; st.fids = it.res.fids; st.design0 = it.res.design0; st.source = 'daisy'; st.responses = it.responses || []; drawResults(); }
  async function saveSetZip() {
    const all = st.set || [], L = all.filter(it => it.on !== false); if (!L.length) { const m = $('SetMsg'); if (m) m.textContent = 'Tick at least one experiment.'; return; } const keep = snap(); const setName = (it) => 'E' + (all.indexOf(it) + 1) + '_' + slug2(it.label);
    try {
      const tree = {}, readme = ['EXPERIMENTS - ' + L.length + ' experiments in one folder', '='.repeat(60), ''], root = 'Experiments_' + L.length;
      for (let i = 0; i < L.length; i++) {
        applyItem(L[i]); const design = X.design(currentPlan()), files = await commonFiles(), jobs = await buildJobs(design, files), nm = setName(L[i]);
        const t = X.folder(jobs, files, { request: L[i].label, title: L[i].label, plan: currentPlan(), design: design.factors });
        Object.keys(t).forEach(k => { tree[root + '/' + nm + k.slice(k.indexOf('/'))] = t[k]; }); readme.push(nm.padEnd(44) + ' ' + jobs.length + ' runs, ' + L[i].factors.map(f => (X.factor(f.id) || { label: f.id }).label).join(' x '));
      }
      readme.push('', 'Every folder is a complete experiment (README, Common, numbered run folders, run_all.sh, run_all.bat, plan.json). Open the README of an experiment first.');
      tree[root + '/README_experiments.txt'] = readme.join('\r\n'); tree[root + '/plan_all.json'] = JSON.stringify({ set: L.map(it => ({ name: setName(it), text: it.text, plan: { factors: it.factors, base: it.base, design: it.design, max: it.max }, responses: it.responses })) }, null, 1);
      const z = X.zip(tree), b = new Blob([z], { type: 'application/zip' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = SWAFLDate.name('daisy-experiments.zip'); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      const m = $('SetMsg'); if (m) m.textContent = 'Saved ' + L.length + ' experiment folders in one zip.';
    } catch (e) { const m = $('SetMsg'); if (m) m.innerHTML = '<span style="color:#b3261e">' + esc(e.message) + '</span>'; }
    applyItem(keep); renderPlan();
  }

  // ------------------------------------------------------------------ plan
  function adopt(r) {
    st.res = r; st.factors = r.plan.factors.map(f => ({ id: f.id, levels: f.levels.slice() })); st.base = Object.assign({}, r.plan.base); st.design = r.plan.design || 'factorial'; st.responses = (r.plan.responses || []).slice(); st.resp = st.responses[0] || 'yield'; st.source = 'daisy'; st.preset = null; st.pid = null; renderPlan();
  }
  async function understand() {
    st.text = $('Text').value; const box = $('Plan'); box.innerHTML = '<div class="dzpan pnote">Reading your request...</div>';
    st.key = $('Key').value.trim(); st.ai = $('Ai').checked; try { localStorage.setItem('swafl.ai.key', st.ai ? st.key : ''); } catch (e) { }
    const r = await AI.plan(st.text, ctx(), { key: st.ai ? st.key : '', online: navigator.onLine !== false }); adopt(r);
  }
  function usePreset(p) {
    st.text = p.id + ': ' + p.ask; const t = $('Text'); if (t) t.value = st.text; st.res = { plan: p.plan || { factors: [], base: {} }, understood: ['experiment ' + p.id + ' (' + p.name + ') of the study: ' + p.ask + (p.note ? ' (' + p.note + ')' : '')], questions: p.unsupported ? [{ id: 'unsup', text: p.id + ' ' + p.name + ': ' + p.unsupported + '.', options: [], preset: p.id }] : [], engine: 'study' };
    st.factors = ((p.plan && p.plan.factors) || []).map(f => ({ id: f.id, levels: f.levels.slice() })); st.base = Object.assign({}, p.plan && p.plan.base); st.design = (p.plan && p.plan.design) || 'factorial'; st.responses = ['yield', 'irr', 'leach', 'perc']; st.resp = 'yield'; st.preset = p; st.source = p.unsupported || !D.isDesk() ? 'ens' : 'daisy'; renderPlan();
  }
  const factorRow = (f, i) => {
    const F = X.factor(f.id); let cell;
    if (F.kind === 'num') cell = '<input type="text" data-lv="' + i + '" value="' + f.levels.join(', ') + '" style="width:220px"> <span class="pnote">' + esc(F.unit) + ' &middot; allowed ' + (F.range ? F.range[0] + ' to ' + F.range[1] : '') + '</span>';
    else { const all = F.kind === 'set' ? F.levels.map(l => l.label) : F.id === 'soil' ? SC.OPTIONS.soil.opts.map(o => o[0]) : F.id === 'station' ? SC.STATIONS.map(s => s.id) : F.levels; cell = '<div style="' + (all.length > 5 ? 'max-height:112px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;padding:4px 8px;background:#fff' : '') + '">' + all.map(v => '<label style="margin-right:8px;white-space:nowrap;display:' + (all.length > 5 ? 'block' : 'inline-block') + '"><input type="checkbox" data-lc="' + i + '" value="' + esc(v) + '"' + (f.levels.some(l => (l.label || l) === v) ? ' checked' : '') + '> ' + esc(F.kind === 'set' ? v : X.levelName(F, v)) + '</label>').join('') + '</div>'; }
    return '<tr><td><b>' + esc(flabel(f.id).replace(/ \(.*/, '')) + '</b>' + (F.irr ? '<div class="pnote">needs irrigation</div>' : '') + '</td><td>' + cell + '</td><td><button class="btn" data-fdel="' + i + '">remove</button></td></tr>';
  };
  function readPlanInputs() {
    document.querySelectorAll('#dzXPlan [data-lv]').forEach(i => { const f = st.factors[+i.dataset.lv], F = X.factor(f.id); const v = i.value.split(/[,;]\s*|\s+/).map(parseFloat).filter(isFinite); if (v.length) f.levels = F.range ? v.map(x => Math.min(F.range[1], Math.max(F.range[0], x))) : v; });
    const byI = {}; document.querySelectorAll('#dzXPlan [data-lc]').forEach(i => { if (i.checked) (byI[i.dataset.lc] = byI[i.dataset.lc] || []).push(i.value); }); Object.keys(byI).forEach(k => { st.factors[+k].levels = byI[k]; });
    document.querySelectorAll('#dzXPlan [data-b]').forEach(i => { const k = i.dataset.b; if (k === 'station' && /^__/.test(i.value)) { st.wxPick = i.value; return; } if (k === 'station') st.wxPick = 'built'; if (i.type === 'number') { const v = parseFloat(i.value); if (isFinite(v)) st.base[k] = v; } else st.base[k] = i.value; });
    const d = $('Design'); if (d) st.design = d.value; const m = $('Max'); if (m) st.max = Math.max(1, parseInt(m.value) || 40); const l = $('Log'); if (l) st.log = l.value; const u = $('UseMy'); if (u) st.useMy = u.checked; const j = $('Jobs'); if (j) st.jobs = Math.max(1, parseInt(j.value) || 4);
  }
  function currentPlan() { return { factors: st.factors.map(f => ({ id: f.id, levels: f.levels })), design: st.design, base: st.base, max: st.max, seed: 7 }; }
  function optionsFor(run) {
    const yrs = AI.years(st.base), o = Object.assign({}, st.base, { start: yrs.start, stop: yrs.stop, log: st.log }, run.set); delete o.nyears;
    if (st.useMy && window.DaisyScenUI) { const m = window.DaisyScenUI.my(); if (m.wxMode === 'course' && m.station && m.station !== 'course' && !o.station) o.station = m.station;
    if (m.wxMode !== 'course' && m.wx && st.wxPick !== 'built') { o.userWx = m.wx; const lo = m.wx.first + 1; o.start = Math.max(o.start, lo); o.stop = Math.min(Math.max(o.stop, o.start + 2), m.wx.last); } if (m.soilOn && !st.factors.some(f => f.id === 'soil') && !run.set.soil) { o.userSoil = m.soil; o.soil = 'user'; } }
    return o;
  }
  function renderPlan() {
    const r = st.res, box = $('Plan'); if (!box || !r) return; const ens = st.preset && st.preset.ens;
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">' + esc(r.plan.title || 'Plan') + '</h3><span class="dzchip">' + (r.engine === 'AI' ? 'planned by the online AI, checked against the catalogue' : r.engine === 'reference' ? 'from the Daisy reference manual and your data' : r.engine === 'study' ? 'experiment of the study' : 'built-in planner') + '</span></div>';
    if (r.aiError || (r.fallback && false)) h += '<p class="pnote">The online AI could not be used (' + esc(r.aiError) + '); the built-in planner answered.</p>';
    if (r.understood.length) h += '<p><b>What I understood from your request</b></p><ul style="margin:0 0 6px 18px">' + r.understood.map(u => '<li>' + esc(u) + '</li>').join('') + '</ul>';
    if (r.notes && r.notes.length) h += '<p class="pnote">' + r.notes.map(esc).join('; ') + '</p>';
    if (r.questions.length) { h += '<p><b>A few questions to settle</b></p>'; r.questions.forEach((q, i) => { h += '<div class="dzq"><span>' + esc(q.text) + '</span> ' + '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;' + ((q.options || []).length > 5 ? 'max-height:104px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;padding:4px;background:#fff' : '') + '">' + (q.options || []).map((o, k) => '<button class="btn" data-q="' + i + ':' + k + '">' + esc(o) + '</button>').join(' ') + '</div>' + '</div>'; }); }
    h += '</div>';
    if (st.factors.length || ens) {
      h += '<div class="dzpan"><b>What will be tested</b> <span class="pnote">Change the values, remove a row, or add another thing to change.</span>' + (st.factors.length ? '<table class="dztab" style="width:100%">' + '<tr><th>What changes</th><th>Values tested</th><th></th></tr>' + st.factors.map(factorRow).join('') + '</table>' : '') +
        '<div class="dzrow"><label>Add something to change</label><select id="dzXAdd"><option value="">choose...</option>' + (() => { const G = { 'Irrigation': ['irrig', 'mm', 'hours', 'trig', 'z', 'method', 'dripdepth', 'limit', 'window', 'flux'], 'Nitrogen and tillage': ['nfac', 'till', 'ntype', 'ntime'], 'Weather and climate': ['precip', 'temp', 'radscale', 'season', 'station', 'bio'], 'Soil and crop': ['soil', 'root'], 'Chemicals': ['koc', 'half'] }, left = X.FACTORS.filter(f => !st.factors.some(x => x.id === f.id)), used = {}; let o = ''; Object.keys(G).forEach(k => { const L = G[k].map(id => left.find(f => f.id === id)).filter(Boolean); if (L.length) o += '<optgroup label="' + k + '">' + L.map(f => { used[f.id] = 1; return '<option value="' + f.id + '">' + esc(flabel(f.id)) + '</option>'; }).join('') + '</optgroup>'; }); const P = left.filter(f => !used[f.id]); if (P.length) o += '<optgroup label="Parameters of the Daisy reference">' + P.map(f => '<option value="' + f.id + '">' + esc(flabel(f.id)) + '</option>').join('') + '</optgroup>'; return o; })() + '</select>' +
        '<label title="How the values are combined">How to combine</label><select id="dzXDesign">' + [['factorial', 'test every combination'], ['oat', 'change one thing at a time'], ['paired', 'pair the values in order']].map(d => '<option value="' + d[0] + '"' + (st.design === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select><label title="If there are more combinations, a spread of them is chosen">at most</label><input type="number" id="dzXMax" value="' + st.max + '" min="1" max="2000" style="width:70px"><label>runs</label></div>' +
        '<div class="dzrow"><label>Weather</label>' + wxSelect() + wxRow() +
        '<label>Soil</label><select data-b="soil"' + (st.factors.some(f => f.id === 'soil') ? ' disabled' : '') + '>' + SC.OPTIONS.soil.opts.map(o => '<option value="' + o[0] + '"' + ((st.base.soil || 'loam') === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>' +
        '<label>Years</label><input type="number" data-b="start" value="' + (AI.years(st.base).start) + '" style="width:70px"> to <input type="number" data-b="stop" value="' + (AI.years(st.base).stop) + '" style="width:70px">' +
        '<label>Results saved</label><select id="dzXLog">' + [['annual', 'yearly totals only (fastest)'], ['season', 'yearly totals and harvest'], ['light', 'yearly totals and daily crop, water and soil water (for the detailed figures)'], ['full', 'everything Daisy can write'], ['process', 'every process: snow, heat, ice, carbon, N2O, flows']].map(d => '<option value="' + d[0] + '"' + (st.log === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select></div>' +
        '<div class="dzrow"><label><input type="checkbox" id="dzXUseMy"' + (st.useMy ? ' checked' : '') + '> use the weather and soil I gave in My data, when I have given them</label></div><div id="dzXCount" class="pnote"></div><details class="pnote"><summary>What do the ways to combine mean?</summary><b>Test every combination</b>: every value of each thing with every value of the others; the most complete, and the number of runs grows quickly. <b>Change one thing at a time</b>: the others stay at their middle value; few runs, but no interactions. <b>Pair the values in order</b>: first value with first, second with second; the fewest runs, to follow a single path.</details>' +
        '<div id="dzXCrops" class="dzpan" style="padding:6px 10px"></div>' +
        '<div class="dzrow"><button class="btn pri" id="dzXBatch">Run all</button><label title="Several runs at once make it faster on a computer with several cores">at the same time</label><input type="number" id="dzXJobs" value="' + st.jobs + '" min="1" max="16" style="width:55px"><button class="btn" id="dzXSeq">Run one by one</button><button class="btn" id="dzXClear" title="Remove the results of the runs from the screen. The experiment you designed stays, so you can run it again.">Clear the runs</button><button class="btn" id="dzXZip">Save the experiment folder (.zip)</button><button class="btn" id="dzXPlanSave">Save the plan (.json)</button><button class="btn" id="dzXAddPlan">Add to my experiments</button>' + (ens ? '<button class="btn" id="dzXEns">Show the published runs of ' + esc(st.preset.id) + ' (offline)</button>' : '') + '<span id="dzXst" class="pnote"></span></div></div>';
    } else if (!r.questions.length) h += '';
    box.innerHTML = h; bindPlan(); bindWx(); count();
  }
  function count() {
    const e = $('Count'); if (!e) return; readPlanInputs();
    try { const d = X.design(currentPlan()), yrs = AI.years(st.base), sec = Math.max(1, d.runs.length) * (yrs.stop - yrs.start) * 3.2 / Math.max(1, st.jobs); e.innerHTML = '<b>' + d.runs.length + ' runs</b>' + (d.thinned ? ' (a spread of ' + d.total + ' combinations, chosen at random with a fixed seed)' : '') + ', each of ' + (yrs.stop - yrs.start) + ' years; about ' + (sec < 90 ? Math.round(sec) + ' seconds' : Math.round(sec / 60) + ' minutes') + ' on a computer running ' + st.jobs + ' at a time.' + (st.factors.some(f => X.factor(f.id).irr) && d.runs.some(r => r.reference) ? ' A rainfed reference run is added.' : ''); } catch (x) { e.innerHTML = '<span style="color:#b3261e">' + esc(x.message) + '</span>'; }
  }
  function bindPlan() {
    const box = $('Plan'); box.querySelectorAll('[data-q]').forEach(b => b.onclick = () => answer(b.dataset.q));
    box.querySelectorAll('[data-fdel]').forEach(b => b.onclick = () => { readPlanInputs(); st.factors.splice(+b.dataset.fdel, 1); renderPlan(); });
    const add = $('Add'); if (add) add.onchange = () => { readPlanInputs(); if (add.value) { const f = X.factor(add.value); st.factors.push({ id: f.id, levels: f.levels.map(v => typeof v === 'object' ? v.label : v).slice() }); renderPlan(); } };
    box.querySelectorAll('input,select').forEach(i => { if (i.id !== 'dzXAdd') i.onchange = () => { readPlanInputs(); if (i.dataset.b === 'station') { const v = i.value, U = window.DaisyScenUI; if (v === '__proj') { U.project().then(() => { st.useMy = true; st.wxPick = null; renderPlan(); }).catch(e => D.note('Xst', esc(e.message), 1)); return; } else if (v === '__my') { st.useMy = true; } else if (v === '__online') { st.useMy = true; } else { st.useMy = false; } renderPlan(); return; } count(); }; });
    { const cb = $('Crops'); if (cb && window.DaisyCrops) window.DaisyCrops.editor(cb, st.base.crops || null, v => { if (v) st.base.crops = v; else delete st.base.crops; }); }
    const ap = $('AddPlan'); if (ap) ap.onclick = () => { if (!st.factors.length) return; addToSet(snap()); };
    const b = $('Batch'); if (b) b.onclick = () => run(false); const cl = $('Clear'); if (cl) cl.onclick = clearRuns; const s = $('Seq'); if (s) s.onclick = () => run(true); const z = $('Zip'); if (z) z.onclick = saveZip; const p = $('PlanSave'); if (p) p.onclick = () => { readPlanInputs(); D.download('daisy-experiment-plan.json', JSON.stringify({ request: st.text, plan: currentPlan(), responses: st.responses }, null, 1), 'application/json'); };
    const e = $('Ens'); if (e) e.onclick = () => showEnsemble();
    const q0 = (st.res.questions || []).find(q => q.preset); if (q0 && !st.factors.length) { /* nothing else to show */ }
  }
  function answer(code) {
    const [i, k] = code.split(':').map(Number), q = st.res.questions[i], o = (q.options || [])[k] || ''; readPlanInputs();
    if (q.preset && /published/i.test(o)) { const p = X.PRESETS.find(x => x.id === (o.match(/E\d+/) || [q.preset])[0]); st.preset = p; st.source = 'ens'; showEnsemble(); return; }
    if (q.key === 'years') { st.base.nyears = parseInt(o); delete st.base.start; delete st.base.stop; }
    else if (q.key === 'soil') { if (/eight/i.test(o)) { st.factors = st.factors.filter(f => f.id !== 'soil'); st.factors.push({ id: 'soil', levels: ['usda:sand', 'usda:loamysand', 'usda:sandyloam', 'loam', 'usda:siltloam', 'usda:sandyclayloam', 'usda:clayloam', 'usda:siltyclayloam'] }); } else st.base.soil = /sand/i.test(o) ? 'sand' : 'loam'; }
    else if (q.key === 'station') { st.base.station = /bologna/i.test(o) ? 'it-bologna' : /foulum/i.test(o) ? 'dk-foulum' : /valecov/i.test(o) ? 'cz-valecov' : 'course'; }
    else if (q.id === 'factor') { const map = { 'Irrigation': ['trig', 'z'], 'Nitrogen': ['nfac'], 'Rain and': ['precip', 'temp'], 'Soil': ['soil'], 'Rooting': ['root'], 'A chemical': ['koc', 'half'] }; Object.keys(map).forEach(key => { if (o.indexOf(key) === 0) map[key].forEach(id => { if (!st.factors.some(f => f.id === id)) { const F = X.factor(id); st.factors.push({ id, levels: F.levels.slice() }); } }); }); }
    st.res.questions.splice(i, 1); renderPlan();
  }
  // ------------------------------------------------------------------ the experiment folder
  async function commonFiles() { const f = {}; for (const n of SC.COMMON) f[n] = await D.getText('scenarios/common/' + n); f['Daily-1965-2000.dwf'] = await D.getText('scenarios/common/Daily-1965-2000.dwf'); return f; }
  async function stationFiles(files, ids) { for (const id of ids) if (id && id !== 'course') files['weather/' + id + '.dwf'] = await D.getText('weather/' + id + '.dwf'); }
  async function buildJobs(design, files) { const stIds = Array.from(new Set(design.runs.map(r => (r.set.station || st.base.station || (window.DaisyScenUI.my().wxMode === 'course' && window.DaisyScenUI.my().station) || 'course')))); await stationFiles(files, stIds); return design.runs.map(run => ({ run, job: SC.buildJob('exp', optionsFor(run), run.id, files) })); }
  async function saveZip() {
    try { readPlanInputs(); const design = X.design(currentPlan()), files = await commonFiles(), jobs = await buildJobs(design, files); const tree = X.folder(jobs, files, { request: st.text || (st.res && st.res.plan && st.res.plan.title) || '', title: (st.res && st.res.plan && st.res.plan.title) || st.text, plan: currentPlan(), design: design.factors }); const z = X.zip(tree); const b = new Blob([z], { type: 'application/zip' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'daisy-experiment.zip'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); D.note('Xst', 'Saved the experiment folder: ' + design.runs.length + ' numbered run folders, a Common folder with the shared inputs, a README with the design and where to find the indexes, and run_all scripts (' + Object.keys(tree).length + ' files).'); }
    catch (e) { D.note('Xst', esc(e.message), 1); }
  }
  // ------------------------------------------------------------------ running
  // remove the results of the runs from the screen; the design stays
  function clearRuns() {
    if (st.running) st.stop = true; st.rows = []; st.runs = []; st.xmapSel = null; ['Res', 'RunBox'].forEach(k => { const h = $(k); if (h) h.innerHTML = ''; });
    D.note('Xst', 'Runs cleared. Your design is kept: press Run all to run it again.');
  }
  async function run(seq, override) {
    if (st.running) { st.stop = true; D.note('Xst', 'Stopping after the runs that have started...'); return; }
    try {
      readPlanInputs(); if (!D.isDesk() || !window.swafl || !window.swafl.daisyJob) { D.note('Xst', 'Daisy itself runs in the desktop app. Here you can save the experiment folder (.zip) and run it anywhere, or explore the published runs.', 1); return; }
      let info = await window.swafl.daisyInfo(); if (!info.found) info = await window.swafl.daisyChoose(); if (!info.found) throw new Error('The Daisy program of SWAFL was not found (it is the folder daisy next to the program). Unzip the whole SWAFL zip again, or choose bin\\daisy-bin.exe of an installed Daisy 7.1.14 (never the installer file daisy-7.1.14-Windows-...exe).');
      const design = override || X.design(currentPlan()), files = await commonFiles(), jobs = await buildJobs(design, files), fids = override ? st.fids : design.factors.map(f => f.id);
      if (!override) { st.rows = []; st.runs = []; st.design0 = design; } else st.design0 = { runs: st.design0.runs.concat(design.runs), factors: st.design0.factors }; st.fids = fids; st.source = 'daisy'; st.running = true; st.stop = false; $('Batch').textContent = 'Stop'; const box = $('RunBox');
      box.innerHTML = '<div class="dzpan"><b id="dzXProg">0 of ' + jobs.length + ' runs</b> <div id="dzXBar" style="height:8px;background:#e4e7ec;border-radius:4px;margin:6px 0"><div id="dzXBarIn" style="height:8px;width:0;background:#2b83ba;border-radius:4px"></div></div><div id="dzXList" class="pnote" style="max-height:120px;overflow:auto"></div></div>';
      const grp = (((st.preset && st.preset.id) || st.pid || 'experiment') + '_' + String((st.res && st.res.plan && st.res.plan.title) || st.text || '').replace(/^E\d+\s*:?\s*/, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '_' + SWAFLDate.stamp()).replace(/_+/g, '_'); st.grpDir = ''; let next = 0, done = 0, fail = 0; const t0 = Date.now(), nPar = seq ? 1 : st.jobs, lastDraw = { t: 0 };
      const work = async () => { while (next < jobs.length && !st.stop) { const { run: rn, job } = jobs[next++]; job.copyBundle = true; job.group = grp; job.runId = rn.id; let r; try { r = await window.swafl.daisyJob(job); } catch (e) { r = { code: -1, err: e.message, logs: {} }; }
        const logs = {}; Object.keys(r.logs || {}).forEach(n => { const k = SC.logKey(n); if (k) { try { const d = IO.readDlf(r.logs[n], n); if (d.n) logs[k] = d; } catch (e) { } } });
        done++; if (!logs['Annual-Harvest']) { fail++; $('List').innerHTML += '<div style="color:#b3261e">' + esc(rn.id) + ' ' + esc(rn.label) + ': Daisy gave no results (code ' + r.code + '): ' + esc(((r.err || r.out || '') + '').split('\n').filter(l => /error/i.test(l)).slice(0, 1).join(' ') || 'see the set-up') + '</div>'; }
        else { const sx = DaisyFig.stats({ logs }); st.rows.push({ id: rn.id, label: rn.label, val: rn.val, f: rn.val, r: X.respOf(sx), reference: !!rn.reference }); const ri = {}; Object.keys(r.logs || {}).forEach(n => { ri[n] = (r.logs[n] || '').length; }); if (r.saved && !st.grpDir) st.grpDir = r.saved.replace(/[\\/][^\\/]+$/, ''); st.runs.push({ id: rn.id, label: rn.label, logs, options: job.options, saved: r.saved, savedError: r.savedError, rawIndex: ri }); }
        const pct = Math.round(done / jobs.length * 100); $('Prog').textContent = done + ' of ' + jobs.length + ' runs' + (fail ? ', ' + fail + ' without results' : '') + ' (' + Math.round((Date.now() - t0) / 1000) + ' s)'; $('BarIn').style.width = pct + '%';
        if (Date.now() - lastDraw.t > 2500 && st.rows.length >= 3) { lastDraw.t = Date.now(); drawResults(); } } };
      await Promise.all(Array.from({ length: nPar }, work)); st.running = false; $('Batch').textContent = 'Run all'; if (!st.rows.length) throw new Error('none of the runs gave results; see the messages above'); drawResults(); D.note('Xst', st.stop ? 'Stopped: ' + st.rows.length + ' runs finished.' : 'Finished ' + st.rows.length + ' runs in ' + Math.round((Date.now() - t0) / 1000) + ' s.');
      if (st.grpDir && window.swafl && window.swafl.daisyWrite) setTimeout(() => saveOutputs(false), 600);
    } catch (e) { st.running = false; const b = $('Batch'); if (b) b.textContent = 'Run all'; D.note('Xst', esc(e.message), 1); }
  }
  // ------------------------------------------------------------------ the published runs of the study
  async function loadEns() {
    if (st.ens) return st.ens; D.note('Xst', 'Reading the 10 190 published runs...');
    const res = await fetch('data/daisy/ensemble.csv.gz'); if (!res.ok) throw new Error('the table of published runs was not found'); let text;
    if (typeof DecompressionStream !== 'undefined') text = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).text(); else throw new Error('this browser cannot unpack the table; use the desktop app');
    st.ens = X.parseEnsemble(text); return st.ens;
  }
  async function showEnsemble() {
    try { const rows = await loadEns(), p = st.preset; const sel = rows.filter(r => r.exp === p.id && r.valid === 1); if (!sel.length) throw new Error('no published runs for ' + p.id);
      const fids = Object.keys(sel[0].f).filter(k => sel.some(r => r.f[k] !== undefined && r.f[k] !== '' && !(typeof r.f[k] === 'number' && !isFinite(r.f[k]))) && E_has(sel, k)); st.rows = sel.map(r => ({ id: r.id, label: r.treatment, val: r.f, f: r.f, r: r.r })); st.runs = []; st.fids = fids; st.source = 'ens'; st.responses = ['yield', 'irr', 'leach', 'perc']; st.resp = 'yield'; $('RunBox').innerHTML = '<div class="dzpan pnote">Published runs of ' + esc(p.id + ' ' + p.name) + ' (' + sel.length + ' valid runs, ten soils, 20 years of Taastrup weather, 1980 to 1999). Daily detail of single runs is in the Zenodo archive; the figures below use the run means.</div>'; drawResults(); D.note('Xst', ''); }
    catch (e) { D.note('Xst', esc(e.message), 1); }
  }
  const E_has = (rows, k) => new Set(rows.map(r => r.f[k])).size > 1;

  // ------------------------------------------------------------------ figures
  const SPEC = () => K().SPEC, OKI = () => K().OKI;


  // the outputs of ONE experiment, kept apart from every other experiment: README, plan, design, results table and every figure (png and numbers)
  async function outputFiles(scale, onStep) {
    const pid = (st.preset && st.preset.id) || st.pid || 'experiment', sp = X.SPEC && X.SPEC[pid], rows = st.rows, fids = (st.fids || []).filter(f => f !== 'run'), resps = X.RESP.map(r => r.id).filter(r => rows.some(x => isFinite(x.r[r.id || r])));
    const q = v => { v = v == null ? '' : (typeof v === 'object' ? (v.label || JSON.stringify(v)) : String(v)); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const des = (st.design0 && st.design0.runs) || [], dl = ['run,label,reference,' + fids.join(',')].concat(des.map(r => [r.id, r.label, r.reference ? 'rainfed reference' : '', ].concat(fids.map(f => (r.val || {})[f])).map(q).join(',')));
    const name = pid + '_' + (sp ? '' : '') + SWAFLDate.stamp(), F = {}, root = 'Outputs/';
    F[root + 'README.txt'] = ['SWAFL Daisy experiment ' + pid + (sp ? '' : ' (own design)'), 'Made ' + SWAFLDate.pretty(new Date()), '', sp ? 'Question: ' + sp.aim : '', sp ? 'Design: ' + sp.design : '', 'Runs with results: ' + rows.length + ' of ' + des.length, '', 'design.csv   every run and the factor levels it used', 'results.csv  the responses of every run (one row per run)', 'plan.json    the plan, to load again in the Experiments tab', 'figures/     every figure of this experiment as a 300 dpi picture and the numbers behind it (CSV)', 'The raw Daisy output of every run is in the folder of the runs (one sub-folder per run, with the unchanged logs and daisy.log).'].filter(l => l !== '' || true).join('\r\n');
    F[root + 'plan.json'] = JSON.stringify({ experiment: pid, name: (st.preset && st.preset.name) || null, text: st.text, plan: { factors: st.factors, base: st.base, design: st.design, max: st.max }, responses: st.responses }, null, 1);
    F[root + 'design.csv'] = '﻿' + dl.join('\r\n'); F[root + 'results.csv'] = '﻿' + X.csv(rows, st.fids || [], resps);
    if (window.DaisyFigKit) { const host = $('Res'); const fig = await window.DaisyFigKit.collect(host, 'figures', scale || 3, onStep); Object.keys(fig).forEach(k => { F[root + k] = fig[k]; }); }
    return { files: F, name };
  }
  async function saveOutputs(zip) {
    const b = $('SaveOut'); if (!st.rows.length) return; if (b) b.disabled = true;
    try {
      const o = await outputFiles(3, (i, n) => { if (b) b.textContent = 'Drawing figure ' + i + ' of ' + n + '...'; });
      if (zip || !(window.swafl && window.swafl.daisyWrite && st.grpDir)) { D.download(o.name + '_outputs.zip', new Blob([X.zip(o.files)], { type: 'application/zip' }), 'application/zip'); D.note('Xst', 'The outputs of this experiment are saved as a zip.'); }
      else { const r = await window.swafl.daisyWrite(st.grpDir, o.files); D.note('Xst', r && r.ok ? 'Outputs of this experiment written next to its runs (' + r.n + ' files): ' + st.grpDir + (/[\\/]$/.test(st.grpDir) ? '' : '\\') + 'Outputs' : 'Could not write the outputs: ' + ((r && r.err) || ''), !(r && r.ok)); }
    } catch (e) { D.note('Xst', 'Could not save the outputs: ' + e.message, 1); }
    if (b) { b.disabled = false; b.textContent = 'Save the outputs of this experiment'; }
  }
  // the figures made for this experiment, and the process map of Daisy marked for it; both are drawn again from the results each time they arrive
  function mountSpec(host, rows, fids, resp) {
    const F = window.DaisyExpFig, box = host.querySelector('#dzXSpec'); if (!F || !box || !rows.length) return null;
    const pid = (st.preset && st.preset.id) || st.pid || null, factors = fids.filter(f => f !== 'run').map(f => ({ id: f }));
    let focusP = st.xmapSel || null;
    const ctx = { key: pid || 'own', presetId: pid, factors, rows, fids, resp, flabel, rlabel, lname, runs: () => st.runs.map(r => ({ label: r.id + ' ' + r.label, logs: r.logs })), again: () => drawResults(), onCard: ps => F.focus(host, ps && ps.length ? ps[0] : focusP) };
    const m = F.mount(box, ctx); if (!m) return null;
    const mp = host.querySelector('#dzXMap'), P = window.DaisyProc, figs = X.figsFor(pid, factors), marks = X.procMarks(factors, figs, st.responses && st.responses.length ? st.responses : ['yield']);
    const names = {}; marks.factors.forEach(f => { names[f.id] = short(flabel(f.id)).toLowerCase(); }); marks.resp.forEach(r => { names[r] = short(rlabel(r)).toLowerCase(); });
    if (mp && P && P.svg) {
      mp.className = 'dzpan dzfig'; mp.dataset.xf = 'procmap';
      mp.innerHTML = '<div class="dzrow"><b>Processes of Daisy in this experiment</b><span style="flex:1"></span></div><p class="pnote">The map of Daisy redrawn for this experiment: orange frames and the tags F1, F2 mark the processes the factors act on, blue frames and the tags R1, R2 the processes the results come from; the names are in the key under the map. Click a box to light up the figures above that depend on it; click it again to release.</p><div class="dzmapv">' + P.svg({ marks, names, sel: null }) + '</div>';
      mp.insertAdjacentHTML('beforeend', '<div data-pdet></div>'); const det = mp.querySelector('[data-pdet]');
      mp.querySelectorAll('.dzPb[data-p]').forEach(g => { g.onclick = () => { const p = g.dataset.p; focusP = st.xmapSel = (st.xmapSel === p ? null : p); F.focus(host, focusP); if (focusP) P.detailInto(det, focusP, st.runs.map(r => ({ label: r.id + ' ' + r.label, logs: r.logs })), 'The figures of this process are drawn from the runs of this experiment. They need the process logs: set the logs of the experiment to the process level, or run one run in detail from the Processes tab.'); else det.innerHTML = ''; }; });
      F.focus(host, focusP);
    }
    return m;
  }
  function drawResults() {
    const host = $('Res'); if (!host) return; if (st.runs[0] && st.runs[0].options) DaisyCite.ctx = DaisyCite.describe(st.runs[0].options, SC); const rows = st.rows, fids = st.fids || []; if (!rows.length) { host.innerHTML = ''; return; }
    X.indices(rows);
    const resps = X.RESP.filter(r => rows.some(x => isFinite(x.r[r.id]))).map(r => r.id), resp = resps.indexOf(st.resp) >= 0 ? st.resp : resps[0], numF = fids.filter(f => rows.every(r => typeof r.f[f] === 'number' || r.reference || r.f[f] === undefined) && X.levels(rows, f).length > 1), multi = fids.filter(f => X.levels(rows, f).length > 1);
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">Results</h3><button class="btn" id="dzXClear2" title="Remove these results from the screen; the design is kept">Clear the runs</button><span class="pnote">' + rows.length + ' runs' + (st.source === 'ens' ? ' (published)' : '') + '</span><span style="flex:1"></span><label>Look at</label><select id="dzXResp">' + resps.map(r => '<option value="' + r + '"' + (r === resp ? ' selected' : '') + '>' + esc(rlabel(r)) + '</option>').join('') + '</select><button class="btn" id="dzXCsv">Table (CSV)</button><button class="btn pri" id="dzXSaveOut" title="README, plan, design, results table and every figure of this experiment only">Save the outputs of this experiment</button><button class="btn" id="dzXSaveZip">as a zip</button><button class="btn" id="dzXRep">Report (HTML)</button></div>' + keyNumbers(rows, resp) + (st.grpDir ? '<p style="margin:4px 0"><b>Raw Daisy output of every run, kept on this computer:</b> <code>' + esc(st.grpDir) + '</code> <button class="btn" id="dzXOpenRaw">Open the folder</button><br><span class="pnote">One sub-folder per run (its number and name), each with the unchanged logs and daisy.log in Run/ and the set-up that made them. Below, "One run in detail" lists the files of a run with a download button for each.</span></p>' : '') + '</div><div id="dzXSpec"></div><div id="dzXMap"></div>';
    const fig = (id, title, note, n) => '<div class="dzpan dzfig" data-xf="' + id + '"><div class="dzrow"><b>' + esc(title) + '</b><span style="flex:1"></span><button class="btn" data-xpng="' + id + '">Picture (PNG)</button></div><p class="pnote">' + esc(note) + '</p>' + Array.from({ length: n || 1 }, (_, k) => '<div><canvas data-xc="' + id + '_' + k + '"></canvas></div>').join('') + '</div>';
    if (multi.length) h += fig('tor', 'Which factor matters most for ' + rlabel(resp).replace(/ \(.*/, '').toLowerCase(), 'The range of the mean response between the lowest and highest level of each factor, the other factors averaged. Longer bar = bigger influence.');
    multi.forEach((f, i) => { h += fig('me' + i, 'Effect of ' + flabel(f).replace(/ \(.*/, '').toLowerCase() + ' on ' + rlabel(resp).replace(/ \(.*/, '').toLowerCase(), 'Mean over all other factors; the shaded band (line) or the whisker (bars) runs from the lowest to the highest run at each level.'); });
    if (multi.length >= 2) h += fig('heat', 'Interaction: ' + flabel(multi[0]).replace(/ \(.*/, '') + ' with ' + flabel(multi[1]).replace(/ \(.*/, ''), 'Mean of ' + rlabel(resp) + ' in each combination; the other factors are averaged. Colours run from dark purple (low) to yellow (high).');
    if (rows.some(r => isFinite(r.r.irr)) && rows.some(r => isFinite(r.r.yield))) h += fig('trade', 'Trade-off: yield against irrigation water', 'Each point is one run. The line joins the runs that no other run beats on both counts (least water, most yield).');
    if (rows.some(r => isFinite(r.r.leach)) && rows.some(r => isFinite(r.r.yield))) h += fig('trade2', 'Trade-off: yield against nitrate leached', 'Each point is one run; the line joins the best runs (least leaching, most yield).');
    if (st.runs.length) h += '<div class="dzpan"><div class="dzrow"><b>One run in detail</b><select id="dzXOne">' + st.runs.map((r, i) => '<option value="' + i + '">' + esc(r.id + ' ' + r.label) + '</option>').join('') + '</select><span class="pnote">the standard Daisy figures of that run (the daily ones need the logs set to "annual and daily...")</span></div><div id="dzXOneFigs"></div></div>';
    h += learnCard(rows, fids, resp);
    const withRes = (st.set || []).map((it, i) => it.res ? i : -1).filter(i => i >= 0); if (withRes.length > 1) h = '<div class="dzpan"><div class="dzrow" style="margin:0"><b>Results of experiment</b><select id="dzXSetRes">' + withRes.map(i => '<option value="' + i + '"' + (i === st.curSet ? ' selected' : '') + '>E' + (i + 1) + ' ' + esc(st.set[i].label) + '</option>').join('') + '</select></div></div>' + h;
    host.innerHTML = h; { const c2 = $('Clear2'); if (c2) c2.onclick = clearRuns; } const sr = $('SetRes'); if (sr) sr.onchange = () => showSetRes(+sr.value); bindLearn(rows, fids, resp); $('Resp').onchange = e => { st.resp = e.target.value; drawResults(); }; $('Csv').onclick = () => D.download('daisy-experiment.csv', X.csv(rows, fids, X.RESP.map(r => r.id).filter(r => resps.indexOf(r) >= 0)), 'text/csv'); $('Rep').onclick = () => report(resp); $('SaveOut').onclick = () => saveOutputs(false); $('SaveZip').onclick = () => saveOutputs(true);
    host.querySelectorAll('[data-xpng]').forEach(b => b.onclick = () => { const c = Array.from(host.querySelectorAll('[data-xc^="' + b.dataset.xpng + '_"]')); if (c.length) DaisyCite.png(c, 'daisy-' + b.dataset.xpng + '.png'); });
    const cv = id => host.querySelector('[data-xc="' + id + '_0"]'); const REDO = {}; const tryDraw = (id, fn) => { REDO[id] = () => { const c = cv(id); if (c) fn(c); }; try { const c = cv(id); if (c) fn(c); } catch (e) { const p = host.querySelector('[data-xf="' + id + '"]'); if (p) p.insertAdjacentHTML('beforeend', '<span style="color:#b3261e">could not be drawn: ' + esc(e.message) + '</span>'); console.warn(id, e); } };
    tryDraw('tor', c => tornado(c, rows, multi, resp)); multi.forEach((f, i) => tryDraw('me' + i, c => mainEffect(c, rows, f, resp))); tryDraw('heat', c => heat(c, rows, multi[0], multi[1], resp)); tryDraw('trade', c => trade(c, rows, 'irr', 'yield', multi[0])); tryDraw('trade2', c => trade(c, rows, 'leach', 'yield', multi[0]));
    const spec = mountSpec(host, rows, fids, resp); if (spec) Object.assign(REDO, spec.redo);
    if (window.DaisyFigKit) { host.querySelectorAll('.dzfig[data-xf]').forEach(card => window.DaisyFigKit.attach(card, { name: 'experiment-' + card.dataset.xf, redraw: () => REDO[card.dataset.xf] && REDO[card.dataset.xf]() })); window.DaisyFigKit.bar(host, { name: (st.preset && st.preset.id) || st.pid || 'experiment' }); }
    const orw = $('OpenRaw'); if (orw) orw.onclick = () => { try { window.swafl.daisyOpenFolder(st.grpDir); } catch (e) { } };
    const one = $('One'); if (one) { const dr = () => oneRun(st.runs[+one.value]); one.onchange = dr; dr(); }
  }

  // ------------------------------------------------------------------ iteration: learn from the runs so far and propose the next ones
  function learnCard(rows, fids, resp) {
    const nums = fids.filter(f => X.factor(f) && X.factor(f).kind === 'num' && X.levels(rows, f).length > 1 && rows.every(r => r.reference || typeof r.f[f] === 'number'));
    if (!nums.length || !st.design0 || st.source !== 'daisy') return '';
    return '<div class="dzpan"><div class="dzrow"><b>Iterate: learn from these runs</b><span class="pnote" style="flex:1">A regression model is fitted on the finished runs (squares and products of ' + nums.map(f => esc(flabel(f).replace(/ \(.*/, ''))).join(', ') + '), and the next runs are placed between the levels already run where the model expects the best ' + esc(rlabel(resp).replace(/ \(.*/, '').toLowerCase()) + ' and where no run exists yet. Run them, and repeat.</span><button class="btn" id="dzXLearn">Learn and propose the next runs</button></div><div id="dzXLearnOut"></div></div>';
  }
  function bindLearn(rows, fids, resp) {
    const b = $('Learn'); if (!b) return; const nums = fids.filter(f => X.factor(f) && X.factor(f).kind === 'num' && X.levels(rows, f).length > 1 && rows.every(r => r.reference || typeof r.f[f] === 'number'));
    b.onclick = () => {
      const out = $('LearnOut'), good = (X.RESP.find(r => r.id === resp) || {}).good || 1, data = rows.filter(r => !r.reference && isFinite(r.r[resp])), cats = fids.filter(f => nums.indexOf(f) < 0);
      const groups = {}; data.forEach(r => { const k = cats.map(f => String(r.f[f])).join('|'); (groups[k] = groups[k] || []).push(r); });
      let key = null, best = -Infinity; Object.keys(groups).forEach(k => { const g = groups[k]; if (g.length < nums.length + 2) return; const m = g.reduce((a, r) => a + r.r[resp], 0) / g.length * (good === 0 ? 1 : good); if (m > best) { best = m; key = k; } });
      if (key == null) { out.innerHTML = '<p class="pnote" style="color:#b3261e">There are too few runs for each combination of ' + (cats.length ? cats.map(f => esc(flabel(f).replace(/ \(.*/, ''))).join(' and ') : 'the factors') + ' to learn from: ' + (nums.length + 2) + ' or more are needed in one combination.</p>'; return; }
      const g = groups[key], L = R.learn(g, nums, resp, { good: good === 0 ? 1 : good, count: 4 }); if (!L.ok) { out.innerHTML = '<p class="pnote" style="color:#b3261e">' + esc(L.why) + '</p>'; return; }
      const tpl = st.design0.runs.find(r => r.id === g[0].id) || st.design0.runs[0], rd = (f, v) => { const k = X.factor(f).key; return k === 'nfac' || k === 'precip' || k === 'temp' ? Math.round(v * 100) / 100 : Math.round(v); };
      const mk = (val, i) => { const set = Object.assign({}, tpl.set), v = Object.assign({}, g[0].f); nums.forEach(f => { const x = rd(f, val[f]); set[X.factor(f).key] = x; v[f] = x; }); return { id: 'L' + (st.iter = (st.iter || 0) + 1), label: 'Learned: ' + nums.map(f => flabel(f).replace(/ \(.*/, '') + ' ' + v[f]).join(', '), set, level: {}, val: v }; };
      const cand = L.next.map(n => ({ n, run: mk(n.val) }));
      out.innerHTML = '<p>The model explains <b>' + Math.round(L.r2 * 100) + '%</b> of the variation of ' + esc(rlabel(resp)) + ' in ' + L.n + ' runs' + (cats.length ? ' (' + cats.map(f => esc(lname(f, g[0].f[f]))).join(', ') + ')' : '') + '. It expects the best value near ' + nums.map(f => esc(flabel(f).replace(/ \(.*/, '')) + ' <b>' + rd(f, L.best.val[f]) + '</b>').join(', ') + ' (' + K().fmt(L.best.predicted, 3) + '). Next runs:</p><table class="dzt"><tr>' + nums.map(f => '<th>' + esc(flabel(f)) + '</th>').join('') + '<th>expected ' + esc(rlabel(resp).replace(/ \(.*/, '').toLowerCase()) + '</th></tr>' + cand.map(c => '<tr>' + nums.map(f => '<td>' + c.run.val[f] + '</td>').join('') + '<td>' + K().fmt(c.n.predicted, 3) + '</td></tr>').join('') + '</table><div class="dzrow"><button class="btn pri" id="dzXLearnRun">Run these ' + cand.length + ' runs and add them</button>' + (L.r2 < 0.6 ? '<span class="pnote" style="color:#b3261e">the fit is weak: more runs spread over the range will help more than these.</span>' : '') + '</div>';
      $('LearnRun').onclick = () => run(false, { runs: cand.map(c => c.run), factors: st.design0.factors, total: cand.length });
    };
  }

  function keyNumbers(rows, resp) {
    const v = rows.map(r => r.r[resp]).filter(isFinite); if (!v.length) return ''; const mean = v.reduce((a, b) => a + b, 0) / v.length, lo = rows.reduce((a, r) => isFinite(r.r[resp]) && (!a || r.r[resp] < a.r[resp]) ? r : a, null), hi = rows.reduce((a, r) => isFinite(r.r[resp]) && (!a || r.r[resp] > a.r[resp]) ? r : a, null);
    return '<p>' + esc(rlabel(resp)) + ': mean <b>' + K().fmt(mean, 3) + '</b>; lowest <b>' + K().fmt(lo.r[resp], 3) + '</b> (' + esc(lo.label) + '); highest <b>' + K().fmt(hi.r[resp], 3) + '</b> (' + esc(hi.label) + ').</p>';
  }
  function frame(cv, h, L, R, T, B) { const k = K(), s = k.setup(cv, h), w = s.w; return { g: s.g, w, h, L: L || 58, R: R || 14, T: T || 16, B: B || 40, pw: w - (L || 58) - (R || 14), ph: h - (T || 16) - (B || 40) }; }
  const short = t => String(t).replace(/ \(.*/, '');
  function tornado(cv, rows, fids, resp) {
    const S = X.sensitivity(rows, fids, resp), k = K(); window.DaisyPlot.hbars(cv, S.map(s => short(flabel(s.id))), S.map(s => s.range), { title: 'Which factor matters most for ' + short(rlabel(resp)).toLowerCase(), xt: 'Range of the mean ' + short(rlabel(resp)).toLowerCase() + ' between the lowest and highest level of the factor', notes: S.map(s => k.fmt(s.lo, 3) + ' to ' + k.fmt(s.hi, 3)) });
  }
  function mainEffect(cv, rows, fid, resp) {
    const M = X.marginal(rows, fid, resp), k = K(), numeric = M.every(m => typeof m.level === 'number') && M.length > 2, ttl = 'Effect of ' + short(flabel(fid)).toLowerCase() + ' on ' + short(rlabel(resp)).toLowerCase();
    if (numeric) { const x = M.map(m => m.level); k.line(cv, [{ name: 'Mean of all runs at this level', x, y: M.map(m => m.mean), color: k.OKI[1], line: true, pts: true, r: 4 }], { title: ttl, h: 280, xt: flabel(fid), yt: rlabel(resp), bands: [{ x, lo: M.map(m => m.min), hi: M.map(m => m.max), color: 'rgba(0,114,178,0.16)' }] }); }
    else DaisyFig.groupBars(cv, M.map(m => lname(fid, m.level)), [{ name: 'Mean ' + short(rlabel(resp)), vals: M.map(m => m.mean), lo: M.map(m => m.min), hi: M.map(m => m.max), color: k.OKI[0] }], { title: ttl, h: 290, yt: rlabel(resp), xt: flabel(fid) });
  }
  function heat(cv, rows, f1, f2, resp) {
    const G = X.grid(rows, f1, f2, resp); window.DaisyPlot.matrix(cv, G.xs.map(x => lname(f1, x)), G.ys.map(y => lname(f2, y)), G.z, { title: 'Interaction of ' + short(flabel(f1)).toLowerCase() + ' and ' + short(flabel(f2)).toLowerCase(), xt: flabel(f1), yt: flabel(f2), unit: short(rlabel(resp)), pal: 'viridis' });
  }
  function trade(cv, rows, ax, ay, fid) {
    const k = K(), pts = rows.filter(r => isFinite(r.r[ax]) && isFinite(r.r[ay])); if (!pts.length) return; const lv = fid ? X.levels(pts, fid) : [null], groups = lv.map((l, i) => ({ name: l == null ? 'Runs' : lname(fid, l), x: [], y: [], color: k.OKI[i % k.OKI.length], pts: true, line: false, r: 4 }));
    pts.forEach(r => { const gi = fid ? lv.indexOf(r.f[fid]) : 0; if (gi >= 0) { groups[gi].x.push(r.r[ax]); groups[gi].y.push(r.r[ay]); } });
    const P = X.pareto(pts, ax, ay).sort((a, b) => a.r[ax] - b.r[ax]); const ser = groups.filter(g => g.x.length).slice(0, 12).concat([{ name: 'Best runs', x: P.map(r => r.r[ax]), y: P.map(r => r.r[ay]), color: '#222', line: true, pts: false, dash: [6, 4] }]);
    k.line(cv, ser, { title: 'Trade-off: ' + short(rlabel(ay)).toLowerCase() + ' against ' + short(rlabel(ax)).toLowerCase(), h: 340, xt: rlabel(ax), yt: rlabel(ay) });
  }
  const sane0 = t => String(t || 'run').replace(/[^A-Za-z0-9._-]+/g, '_');
  function oneRun(run) {
    const host = $('OneFigs'); if (!host || !run) return; host.innerHTML = ''; const sc = { id: 'exp', figs: ['yield', 'water', 'theta', 'crop', 'nbudget'] }, plan = DaisyFig.plan(sc, [run]);
    plan.forEach((f, i) => { const d = document.createElement('div'); d.className = 'dzpan dzfig'; d.innerHTML = '<b>' + esc(f.title) + '</b><p class="pnote">' + esc(f.note) + '</p>' + Array.from({ length: f.n }, (_, k) => '<div><canvas data-oc="' + i + '_' + k + '"></canvas></div>').join(''); host.appendChild(d); const cvs = Array.from(d.querySelectorAll('canvas')), go = () => f.draw(cvs, run); try { go(); } catch (e) { d.insertAdjacentHTML('beforeend', '<span class="pnote">not drawn: ' + esc(e.message) + '</span>'); } if (window.DaisyFigKit) window.DaisyFigKit.attach(d, { name: 'run-' + sane0(run.id) + '-' + f.id, redraw: go }); });
    if (!plan.length) host.innerHTML = '<span class="pnote">This run kept no logs the standard figures use. Choose "annual and daily ..." under Results saved.</span>';
    if (window.DaisyRaw) { const rw = document.createElement('div'); rw.innerHTML = window.DaisyRaw.html([run], { folder: undefined }); host.appendChild(rw); window.DaisyRaw.bind(rw, [run], { name: 'experiment-' + sane0(run.id) }); }
  }
  function report(resp) {
    const host = $('Res'), imgs = Array.from(host.querySelectorAll('.dzfig[data-xf]')).map(el => '<h2>' + el.querySelector('b').textContent + '</h2><p>' + el.querySelector('p').textContent + '</p>' + Array.from(el.querySelectorAll('canvas')).map(c => '<img src="' + c.toDataURL('image/png') + '" style="max-width:100%">').join('')).join('');
    const fids = st.fids || [], rows = st.rows, tab = '<table><tr><th>run</th>' + fids.map(f => '<th>' + esc(flabel(f)) + '</th>').join('') + X.RESP.map(r => '<th>' + esc(r.label) + '</th>').join('') + '</tr>' + rows.slice(0, 300).map(r => '<tr><td>' + esc(r.id) + '</td>' + fids.map(f => '<td>' + esc(r.f[f] === undefined ? '' : r.f[f]) + '</td>').join('') + X.RESP.map(q => '<td>' + (isFinite(r.r[q.id]) ? K().fmt(r.r[q.id], 3) : '') + '</td>').join('') + '</tr>').join('') + '</table>';
    D.download('daisy-experiment-report.html', '<!doctype html><meta charset="utf-8"><title>Daisy experiment</title><style>body{font:14px Segoe UI,Arial;max-width:1000px;margin:20px auto;padding:0 14px}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #ccc;padding:2px 6px}th{background:#eef1f5}h2{margin-top:26px}</style><h1>' + esc((st.res && st.res.plan.title) || 'Daisy experiment') + '</h1><p>' + esc(st.text) + '</p><p>' + rows.length + ' runs of Daisy 7.1.14' + (st.source === 'ens' ? ' (the published runs of the study)' : '') + '.</p>' + imgs + '<h2>All runs</h2>' + tab, 'text/html');
  }
  function bind() {
    if (window.DaisyScenUI && !st.hooked) { st.hooked = true; window.DaisyScenUI.onWx(() => { st.wxPick = null; st.useMy = true; if (st.res) renderPlan(); }); }
    { const ts = $('ToScen'); if (ts) ts.onclick = () => D.open('scen'); }
    { const pg = $('PreGo'); if (pg) pg.onclick = () => { const p = X.PRESETS.find(x => x.id === $('PreSel').value); if (p) usePreset(p); }; }
    $('Go').onclick = () => understand(); renderSet(); showSuggestions(); showChapters(); $('TabSug').onclick = () => tab('sug'); $('TabChap').onclick = () => tab('chap'); $('TabImp').onclick = () => tab('imp'); showImport(); tab(st.tab || 'sug'); if (window.DaisyScenUI) window.DaisyScenUI.bindStrip();
    $('Ai').onchange = e => { $('Key').style.display = e.target.checked ? '' : 'none'; };
    document.querySelectorAll('[data-ex]').forEach(a => a.onclick = ev => { ev.preventDefault(); $('Text').value = EXAMPLES[+a.dataset.ex]; understand(); });
    $('Text').onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) understand(); };
    if (st.res) renderPlan(); if (st.rows.length) drawResults();
  }
  window.DaisyExpUI = { runs: () => st.runs, imported: () => (st.imp ? st.imp.files : {}) };
  window.DaisyExpRuns = () => (st.runs || []).map(r => ({ id: r.id, label: (r.id || '') + ' ' + (r.label || ''), logs: r.logs || {} }));
  D.register('exp', { html, bind });
})();
