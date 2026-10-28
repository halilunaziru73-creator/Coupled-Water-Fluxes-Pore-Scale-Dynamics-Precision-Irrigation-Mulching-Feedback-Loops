// Runs every scenario variant with the standard options through the real Daisy program and stores thinned logs as the bundled examples.
// usage: DAISY_EXE=/path/to/daisy node tools/build_daisy_examples.js [scenarioId ...]
'use strict';
const fs = require('fs'), path = require('path');
const R = require('../daisy-runner.js'), S = require('../app/js/daisyscen.js'), IO = require('../app/js/daisyio.js');
const COMMON = path.join(__dirname, '..', 'app', 'data', 'daisy', 'scenarios', 'common'), OUT = path.join(__dirname, '..', 'app', 'data', 'daisy', 'examples');
const KEEP_ANNUAL = /Annual-/, KEEP_DAILY = { all: /Daily-(CropProduction|FWater|Theta|pF)\.dlf/, nitrogen: /Daily-SNO3\.dlf/, soil: /Daily-SNO3\.dlf/, chemical: /Daily-(Tracer|Tracer_conc)\.dlf/ };
const EVERY = 7;
(async () => {
  if (process.argv[2] === 'process') return processRun();
  const exe = R.findExe(); if (!exe) throw new Error('Daisy not found (set DAISY_EXE)'); console.log('Daisy:', exe, R.version(exe));
  const files = {}; S.COMMON.forEach(n => files[n] = fs.readFileSync(path.join(COMMON, n), 'utf8'));
  const only = process.argv.slice(2), index = fs.existsSync(path.join(OUT, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8')) : { runs: [] };
  const todo = []; S.LIST.forEach(sc => { if (only.length && !only.includes(sc.id)) return; sc.variants.forEach(v => todo.push({ sc, v })); });
  const pool = 4; let k = 0;
  const worker = async () => { while (k < todo.length) { const { sc, v } = todo[k++]; const job = S.buildJob(sc.id, S.defaultsFor(sc), v.id, files); job.copyDir = COMMON; const t = Date.now();
    const r = await R.runJob(job, { exe }); if (r.code !== 0 || !Object.keys(r.logs).some(n => /Annual-Harvest/.test(n))) { console.log('FAILED', sc.id, v.id, r.err.slice(-400), r.out.slice(-400)); R.clean(r.dir); continue; }
    const dir = path.join(OUT, sc.id, v.id); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); const kept = [];
    Object.keys(r.logs).forEach(n => { const key = S.logKey(n); if (!key) return; const daily = /^Daily/.test(key); if (daily ? !(KEEP_DAILY.all.test(n) || (KEEP_DAILY[sc.id] || /^$/).test(n)) : !KEEP_ANNUAL.test(n)) return;
      let text = r.logs[n]; if (daily) { const d = IO.readDlf(text, n); const rows = []; for (let i = 0; i < d.n; i += EVERY) rows.push(i); d.data = d.data.map(c => rows.map(i => c[i])); d.n = rows.length; if (d.time) d.time = rows.map(i => d.time[i]); text = IO.writeDlf(d); }
      fs.writeFileSync(path.join(dir, key + '.dlf'), text); kept.push(key); });
    index.runs = index.runs.filter(x => !(x.scenario === sc.id && x.variant === v.id)); index.runs.push({ scenario: sc.id, variant: v.id, label: v.label, options: job.options, years: job.years, seconds: Math.round(r.seconds), logs: kept, every: EVERY });
    console.log('ok', sc.id, v.id, Math.round((Date.now() - t) / 1000) + ' s', kept.length + ' logs'); R.clean(r.dir); } };
  await Promise.all(Array.from({ length: pool }, worker));
  index.version = '7.1.14'; index.runs.sort((a, b) => (a.scenario + a.variant).localeCompare(b.scenario + b.variant)); fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1)); console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

// the logs of the process layers (Fig. 1 of the paper) from one standard run of the rotation on the course loam, every 7th day
async function processRun() {
  require('vm'); globalThis.DaisyScen = S; const X = require('../app/js/daisyexp.js'); const exe = R.findExe(); if (!exe) throw new Error('Daisy not found (set DAISY_EXE)');
  const files = {}; S.COMMON.forEach(n => files[n] = fs.readFileSync(path.join(COMMON, n), 'utf8'));
  const o = Object.assign(S.defaultsFor(S.LIST[1]), { log: 'process' }); const job = S.buildJob('nitrogen', o, 'n100', files); job.copyDir = COMMON; const r = await R.runJob(job, { exe });
  if (r.code !== 0) throw new Error('Daisy failed: ' + r.err.slice(-500)); const dir = path.join(OUT, 'process'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true }); const kept = [];
  Object.keys(r.logs).forEach(n => { const key = S.logKey(n); if (!key) return; const daily = /^Daily/.test(key); if (daily && !(S.PROCESS_LOGS.some(p => p[1] === key) || /Daily-(CropProduction|FWater|Theta|pF|SNO3)/.test(key))) return; let text = r.logs[n]; if (daily) { const d = IO.readDlf(text, n); const rows = []; for (let i = 0; i < d.n; i += EVERY) rows.push(i); d.data = d.data.map(c => rows.map(i => c[i])); d.n = rows.length; if (d.time) d.time = rows.map(i => d.time[i]); text = IO.writeDlf(d); } fs.writeFileSync(path.join(dir, key + '.dlf'), text); kept.push(key); });
  const ix = JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8')); ix.runs = ix.runs.filter(x => x.scenario !== 'process'); ix.runs.push({ scenario: 'process', variant: 'standard', label: 'Standard rotation on the course loam, all process logs', options: job.options, years: job.years, seconds: Math.round(r.seconds), logs: kept, every: EVERY }); fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(ix, null, 1)); console.log('process ok', kept.length, 'logs', Math.round(r.seconds) + ' s'); R.clean(r.dir);
}
function thin(text, every) { const L = text.split(/\r?\n/); let h = 0; for (; h < L.length; h++) if (/^-{5,}/.test(L[h])) break; if (h >= L.length) return text; const head = L.slice(0, h + 1), body = L.slice(h + 1); // header lines, units line follow the dashes
  const hdr = body.slice(0, 2), rows = body.slice(2).filter(x => x.trim()); return head.concat(hdr, rows.filter((_, i) => i % every === 0)).join('\n') + '\n'; }
