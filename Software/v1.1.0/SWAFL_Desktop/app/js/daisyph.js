/* SWAFL 1.1 placeholders of a Daisy set-up file, explained for everyone: for each ${name} (a parameter that Daisy fills
   itself) or {name} (a value of a template that must be given), what it means, its default, where the file uses it, and a
   scrollable list of the values it can take (names defined in this file and in the Daisy library, units, values used in the
   bundled files), each with a short explanation. Data: data/daisy/daiparams.json and refattrs.json (tools/build_dai_params.py). */
'use strict';
const DaisyPH = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let IX = null, RA = null, loading = null, raLoading = null;
  const load = () => loading || (loading = fetch('data/daisy/daiparams.json').then(r => r.json()).then(j => { IX = j; return j; }).catch(() => { IX = { declare: {}, values: {}, defs: {} }; return IX; }));
  const loadRA = () => raLoading || (raLoading = fetch('data/daisy/refattrs.json').then(r => r.json()).then(j => { RA = j; return j; }).catch(() => { RA = {}; return RA; }));
  // what each kind of name refers to, and plain words for the units
  const COMP = { column: ['column', 'a soil column (the soil profile of a field)'], crop: ['crop', 'a crop'], chemical: ['chemical', 'a chemical (nitrate, ammonium, a pesticide, a tracer)'], solute: ['chemical', 'the dissolved form of a chemical'], colloid: ['chemical', 'the colloid-bound form of a chemical'], soil: ['chemical', 'the immobile (sorbed) form of a chemical'], biopore: ['biopore', 'a class of biopores (earthworm and root channels)'], aom: ['am', 'added organic matter (manure, crop residues)'], horizon: ['horizon', 'a soil horizon'] };
  const UNITS = {
    unit: [['kg N/ha', 'kilograms of nitrogen per hectare: the usual unit of the nitrogen logs'], ['g N/m^2', 'grams of nitrogen per square metre (10 kg N/ha = 1 g N/m^2)'], ['kg/ha', 'kilograms per hectare: chemicals and fertilisers'], ['g/ha', 'grams per hectare: pesticides'], ['g/m^2', 'grams per square metre'], ['mg/m^2', 'milligrams per square metre: traces'], ['mm', 'millimetres of water: the water logs'], ['mg/l', 'milligrams per litre: concentration in water'], ['ug/m^3', 'micrograms per cubic metre'], ['ng/l', 'nanograms per litre: PFAS and other micro-pollutants']],
    T_unit: [['dg C', 'degrees Celsius'], ['K', 'kelvin']], R_unit: [['W/m^2', 'watts per square metre'], ['MJ/m^2/d', 'megajoules per square metre per day']],
    E_unit: [['mm/h', 'millimetres of water per hour'], ['mm/d', 'millimetres of water per day']], e_unit: [['Pa', 'pascal'], ['kPa', 'kilopascal (1000 Pa)'], ['hPa', 'hectopascal (100 Pa), as weather stations report']],
    g_unit: [['m/s', 'metres per second'], ['mm/s', 'millimetres per second']],
    fraction: [['LeafPhot', 'the leaves that photosynthesise (the shaded leaves when the light model separates sunlit and shaded leaves, otherwise all leaves)'], ['sunlit', 'the sunlit leaves'], ['reserved', 'the leaves reserved to this crop in a mixed crop']],
    layer: Array.from({ length: 31 }, (_, i) => [String(i), i === 0 ? 'the top of the vegetation' : i === 30 ? 'the bottom of the vegetation (30 intervals by default)' : 'interval ' + i + ' of the canopy from the top'])
  };
  const ALL = { column: 'every column of the set-up', crop: 'every crop', chemical: 'every chemical', biopore: 'every biopore class', aom: 'every added organic matter', pool: 'every pool', reaction: 'every reaction' };
  // ------------------------------------------------------------------ what the file itself says
  function scan(text, name) {
    const lines = String(text).split('\n'), uses = [], re = new RegExp('\\$?\\{' + name + '\\}');
    lines.forEach((l, i) => { if (re.test(l)) uses.push(i + 1); });
    const dollar = new RegExp('\\$\\{' + name + '\\}').test(text), plain = new RegExp('(^|[^$])\\{' + name + '\\}').test(text);
    const dm = new RegExp('\\(declare\\s+' + name + '\\s+(\\w+)\\s+"((?:[^"\\\\]|\\\\.)*)"', 's').exec(text);
    const vm = new RegExp('\\(' + name + '\\s+(?:"([^"]*)"|(-?[\\d.]+(?:[eE][-+]?\\d+)?))\\s*\\)').exec(text), auto = new RegExp('\\(' + name + '\\s+\\((cond|value|dimension|apply)\\b').test(text);
    const am = new RegExp('\\(([A-Za-z_][\\w]*)\\s+[^()]*?\\$?\\{' + name + '\\}\\s*(?:\\[([^\\]]*)\\])?').exec(text);
    const attr = am && am[1] !== 'declare' ? am[1] : null, unitAfter = am && am[2] != null ? am[2] : null;
    const ex = uses.length ? lines[uses[0] - 1].trim().slice(0, 110) : ''; const xm = new RegExp('\\(' + name + '\\s+(\\((?:cond|value|dimension|apply)\\b[^\\n]*)').exec(text), expr = xm ? xm[1].trim().slice(0, 90) : null;
    return { expr, uses, dollar, plain, doc: dm ? dm[2].replace(/\\"/g, '"').replace(/\s+/g, ' ').trim() : null, type: dm ? dm[1] : null, def: vm ? (vm[1] != null ? vm[1] : vm[2]) : null, auto, attr, unitAfter, ex };
  }
  const defsIn = (text, comp) => { const out = [], re = new RegExp('\\(def' + comp + '\\s+(?:"([^"]+)"|([A-Za-z_][\\w\\-.+]*))', 'g'); let m; while ((m = re.exec(text))) { const n = m[1] || m[2]; if (!out.includes(n)) out.push(n); } return out; };
  // the options of a placeholder, in groups: [group, [[value, explanation], ...]]
  function options(name, text, info) {
    const G = [], seen = new Set(), add = (g, list) => { const l = list.filter(o => o && o[0] != null && o[0] !== '' && !seen.has(o[0])); l.forEach(o => seen.add(o[0])); if (l.length) G.push([g, l]); };
    if (ALL[name]) add('All', [['*', 'all of them: ' + ALL[name]]]);
    if (info.def != null) add('Default of this file', [[info.def, 'the value the file gives when nothing else is said']]);
    if (UNITS[name]) add(name === 'fraction' || name === 'layer' ? 'Possible values' : 'Units Daisy knows', UNITS[name]);
    const c = COMP[name]; if (c) { const here = defsIn(text, c[0]); add('Defined in this file', here.map(n => [n, c[1] + ' defined in this file'])); add('In the Daisy library (bundled files)', ((IX.defs || {})[c[0]] || []).map(n => [n, c[1] + ' of the Daisy library'])); }
    add('Used in the bundled files', ((IX.values || {})[name] || []).map(v => [v.replace(/ \[.*\]$/, ''), 'a value given to ' + name + ' in a bundled set-up' + (/\[.*\]$/.test(v) ? ' (' + v.match(/\[(.*)\]$/)[1] + ')' : '')]));
    return G;
  }
  // ------------------------------------------------------------------ the panel
  function card(name, text, val) {
    const s = scan(text, name), d = (IX.declare || {})[name] || {}, auto = s.auto || d.auto, doc = s.doc || d.doc || '', ra = RA && (RA[s.attr || name] || RA[name]);
    const kind = s.dollar ? 'Daisy parameter ${' + name + '}' : 'template value {' + name + '}';
    let what = doc;
    if (!what && auto) what = 'A value that the file works out by itself' + (s.expr ? ': ' : '.');
    if (!what && ra) what = ra[0][0] + (ra[0][1] ? ' Unit in the manual: ' + ra[0][1] + '.' : '') + ' (Reference manual ' + ra[0][3] + ')';
    if (!what && auto) what = 'A value that the file works out by itself from the other parameters.';
    if (!what) what = s.attr ? 'The value of the attribute ' + s.attr + ' of the model where it stands.' : 'A value the file needs.';
    const shown = !doc && auto && s.expr ? '<code>' + esc(s.expr) + (s.expr.length >= 90 ? '…' : '') + '</code>' : '';
    const how = auto ? '<b>Leave it empty.</b> Daisy works it out by itself' + (/fid\d?$/.test(name) ? ' from the name you choose above (it becomes part of the name of the output file)' : '') + '.'
      : s.dollar ? (s.def != null ? 'Leave it empty to keep the default <code>' + esc(s.def) + '</code>, or pick a value from the list.' : 'Leave it empty: Daisy asks for it when the log is used, or pick a value from the list.') + ' In a set-up you normally choose it where the log is used, for example <code>(output ("name of the log" (' + esc(name) + ' "…")))</code>.'
      : '<b>Give a value</b> before the file can run' + (s.unitAfter ? ', in <code>' + esc(s.unitAfter) + '</code> (the unit written after it in the file)' : ra && ra[0][1] ? ', in ' + esc(ra[0][1]) : '') + '.';
    const O = options(name, text, s), nopt = O.reduce((a, g) => a + g[1].length, 0);
    let h = '<div class="dzpc' + (auto ? ' auto' : '') + '" data-pc="' + esc(name) + '"><div class="dzpch"><b>' + esc(name) + '</b><span class="dzpk">' + esc(kind) + '</span><span class="dzpu">used ' + s.uses.length + (s.uses.length === 1 ? ' time' : ' times') + '</span></div>';
    h += '<div class="dzpcd">' + esc(what) + shown + '</div><div class="dzpch2">' + how + '</div>';
    if (s.ex) h += '<div class="dzpex" data-l="' + s.uses[0] + '" title="Click to show the line in the editor">line ' + s.uses[0] + ': <code>' + esc(s.ex) + '</code></div>';
    h += '<div class="dzpin"><input data-ph="' + esc(name) + '" value="' + esc(val || '') + '" placeholder="' + esc(auto ? 'automatic' : s.def != null ? 'empty = ' + s.def : 'type or choose') + '"' + (auto ? ' disabled' : '') + '>' + (nopt && !auto ? '<button class="btn" data-pl="' + esc(name) + '">&#9662; ' + nopt + ' option' + (nopt > 1 ? 's' : '') + '</button>' : '') + '</div>';
    if (nopt && !auto) { h += '<div class="dzpol" data-ol="' + esc(name) + '" hidden>' + (nopt > 8 ? '<input class="dzpf" placeholder="search the ' + nopt + ' options">' : ''); O.forEach(g => { h += '<div class="dzpg">' + esc(g[0]) + '</div>' + g[1].map(o => '<div class="dzpo" data-v="' + esc(o[0]) + '"><b>' + esc(o[0]) + '</b><small>' + esc(o[1]) + '</small></div>').join(''); }); h += '</div>'; }
    return h + '</div>';
  }
  // el: container; text: the file; vals: remembered values (object); jump(line): show a line in the editor
  async function render(el, text, vals, jump) {
    const names = (window.DaisyIO || DaisyIO).placeholders(text); if (!names.length) { el.innerHTML = ''; return; }
    await load(); const needRA = names.some(n => !(IX.declare || {})[n] && !scan(text, n).doc); if (needRA) await loadRA();
    const nD = names.filter(n => new RegExp('\\$\\{' + n + '\\}').test(text)).length, nT = names.length - nD, open = el.querySelector('details') ? el.querySelector('details').open : names.length <= 12;
    let h = '<details class="dzphd"' + (open ? ' open' : '') + '><summary><b>Placeholders (' + names.length + ')</b>: what they are and how to fill them</summary><div class="pnote">';
    if (nD) h += '<b>${name}</b> (' + nD + '): parameters that Daisy fills by itself, from the default of the file or from the value you give where the log or model is used. You do not have to fill them. ';
    if (nT) h += '<b>{name}</b> (' + nT + '): values of a template: give each one a value, then download the filled set-up. ';
    h += 'Under each one: what it means, how to fill it, and &#9662; a list of the possible values with an explanation. Click a value to take it.</div><div class="dzph2">' + names.map(n => card(n, text, (vals || {})[n])).join('') + '</div><button class="btn pri" id="dzEfill">Download filled file</button> <button class="btn" id="dzEclr">Empty all</button></details>';
    if (el.__h === h) return; el.__h = h; el.innerHTML = h;
    el.querySelectorAll('[data-pl]').forEach(b => b.onclick = () => { const ol = el.querySelector('[data-ol="' + CSS.escape(b.dataset.pl) + '"]'); if (ol) { ol.hidden = !ol.hidden; const f = ol.querySelector('.dzpf'); if (f && !ol.hidden) f.focus(); } });
    el.querySelectorAll('.dzpf').forEach(f => f.oninput = () => { const q = f.value.toLowerCase(); f.parentElement.querySelectorAll('.dzpo').forEach(o => { o.style.display = !q || o.textContent.toLowerCase().includes(q) ? '' : 'none'; }); });
    el.querySelectorAll('.dzpo').forEach(o => o.onclick = () => { const ol = o.closest('.dzpol'), n = ol.dataset.ol, inp = el.querySelector('input[data-ph="' + CSS.escape(n) + '"]'); inp.value = o.dataset.v; inp.dispatchEvent(new Event('input', { bubbles: true })); ol.hidden = true; });
    el.querySelectorAll('input[data-ph]').forEach(i => i.oninput = () => { if (vals) vals[i.dataset.ph] = i.value; });
    el.querySelectorAll('.dzpex').forEach(x => x.onclick = () => jump && jump(+x.dataset.l));
    const cl = el.querySelector('#dzEclr'); if (cl) cl.onclick = () => { el.querySelectorAll('input[data-ph]').forEach(i => { i.value = ''; if (vals) vals[i.dataset.ph] = ''; }); };
  }
  return { render, load, scan, options };
})();
