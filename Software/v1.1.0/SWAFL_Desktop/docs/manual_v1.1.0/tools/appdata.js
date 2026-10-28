/* Loads the data modules of the workbench (manual chapters of Daisy, tested parameters, reference combinations, experiment factors, scenarios) in a plain Node sandbox
   and writes them as JSON to build_data/ for the chapters of the manual. usage: node appdata.js */
const vm = require('vm'), fs = require('fs'), path = require('path');
const JS = path.resolve(__dirname, '../../../app/js'), OUT = path.join(__dirname, '../build_data'); fs.mkdirSync(OUT, { recursive: true });
const sb = { window: {}, console, navigator: { onLine: true }, document: undefined }; sb.globalThis = sb; sb.self = sb; vm.createContext(sb); sb.window = sb;
const load = f => vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), sb, { filename: f });
['daisychapters.js', 'daisyparams.js', 'daisyscen.js', 'daisyexp.js', 'daisyref.js'].forEach(f => { try { load(f); } catch (e) { console.log('load', f, e.message); } });
const w = sb, R = w.DaisyRef, X = w.DaisyExp, SC = w.DaisyScen;
fs.writeFileSync(OUT + '/chapters.json', JSON.stringify(w.DaisyChapters || []));
fs.writeFileSync(OUT + '/params.json', JSON.stringify(w.DaisyParams || []));
const sug = R ? R.suggest({ userSoil: false }) : []; fs.writeFileSync(OUT + '/suggest.json', JSON.stringify(sug));
fs.writeFileSync(OUT + '/factors.json', JSON.stringify(X ? X.FACTORS.map(f => ({ id: f.id, key: f.key, label: f.label, unit: f.unit, kind: f.kind, levels: f.levels, range: f.range, irr: f.irr, words: f.words })) : []));
fs.writeFileSync(OUT + '/resp.json', JSON.stringify(X ? X.RESP : []));
fs.writeFileSync(OUT + '/scen.json', JSON.stringify(SC ? { list: SC.LIST.map(s => ({ id: s.id, title: s.title, opts: s.opts, variants: s.variants.map(v => ({ id: v.id, label: v.label })) })), stations: SC.STATIONS, options: Object.fromEntries(Object.entries(SC.OPTIONS).map(([k, v]) => [k, { label: v.label, type: v.type, opts: v.opts }])) } : {}));
fs.writeFileSync(OUT + '/refmap.json', JSON.stringify(R ? { map: R.CHAPTER_MAP, rel: R.CHAPTER_RELATED, general: R.GENERAL } : {}));
console.log('chapters', (w.DaisyChapters || []).length, 'params', (w.DaisyParams || []).length, 'suggestions', sug.length, 'factors', X ? X.FACTORS.length : 0, 'scenarios', SC ? SC.LIST.length : 0);
