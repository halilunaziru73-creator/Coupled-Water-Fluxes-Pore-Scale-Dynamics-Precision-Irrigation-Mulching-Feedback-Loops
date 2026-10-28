/* Runs the Daisy program for the decision-support layers of the SWAFL project (chemical fate, and the answers to the water, nitrogen, climate and soil questions)
   on each of the ten soils of the project, 1979 to 2000, with the built-in Taastrup weather, and writes app/engine/daisydss.js with the annual results.
   usage: DAISY_EXE=/path/to/daisy node tools/build_daisy_dss.js [cacheDir] [concurrency]     (about 40 s per run, 110 runs) */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..'), S = require(path.join(APP, 'app/js/daisyscen.js')), R = require(path.join(APP, 'daisy-runner.js'));
const CD = path.join(APP, 'app/data/daisy/scenarios/common'), CACHE = process.argv[2] || path.join(require('os').tmpdir(), 'dss_cache'), CONC = +process.argv[3] || 2;
fs.mkdirSync(CACHE, { recursive: true });
const files = {}; S.COMMON.forEach(n => files[n] = fs.readFileSync(path.join(CD, n), 'utf8'));
// the ten soils of the SWAFL project, by their sand, silt and clay (%)
const SOILS = { S03_Sand: [92, 5, 3], S04_LoamySand: [82, 12, 6], S05_SandyLoam: [65, 25, 10], S02_CoarseSand: [88, 8, 4], S01_CoarseLoam: [45, 35, 20], S06_Loam: [40, 40, 20], S07_SiltLoam: [20, 65, 15], S08_SandyClayLoam: [55, 15, 30], S09_ClayLoam: [30, 35, 35], S10_SiltyClayLoam: [10, 55, 35] };
const nearestBd = (sa, si, cl) => { let b = null, bd = 1e9; Object.keys(S.USDA).forEach(k => { const c = S.USDA[k], d = Math.pow(c[1] - sa, 2) + Math.pow(c[2] - si, 2) + Math.pow(c[3] - cl, 2); if (d < bd) { bd = d; b = c[4]; } }); return b; };
const userSoil = id => { const [sa, si, cl] = SOILS[id], bd = nearestBd(sa, si, cl); return { horizons: [{ bottom: 30, sand: sa, silt: si, clay: cl, humus: 2, bd }, { bottom: 80, sand: sa, silt: si, clay: cl, humus: 0.8, bd: +(bd + 0.05).toFixed(2) }, { bottom: 200, sand: sa, silt: si, clay: cl, humus: 0.3, bd: +(bd + 0.1).toFixed(2) }] }; };
// one run of each: [id, scenario, variant, options]
const RUNS = [];
Object.keys(SOILS).forEach(soil => {
  const o = { soil: 'user', userSoil: userSoil(soil), start: 1979, stop: 2000 };
  [['rainfed', 'irrigation', 'rainfed'], ['irrigated', 'irrigation', 'irrigated'], ['n50', 'nitrogen', 'n50'], ['n130', 'nitrogen', 'n130'], ['warm', 'climate', 'warm'], ['dry', 'climate', 'dry'], ['warmdry', 'climate', 'warmdry'], ['wet', 'climate', 'wet'], ['mobile', 'chemical', 'mobile'], ['sorb', 'chemical', 'sorb'], ['decay', 'chemical', 'decay']].forEach(r => RUNS.push({ key: soil + '__' + r[0], soil, variant: r[0], sc: r[1], vr: r[2], o }));
});
const SUM = require(path.join(APP, 'app/js/daisysum.js'));
function summarise(logs, withChem) { const get = n => { const k = Object.keys(logs).find(x => x.replace(/^[^-]*-/, '').replace(/\.dlf$/, '') === n); return k ? SUM.parseDlf(logs[k]) : null; }; return SUM.summarise(get, withChem); }
async function one(job) {
  const f = path.join(CACHE, job.key + '.json'); if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  const j = S.buildJob(job.sc, Object.assign({}, job.o), job.vr, files); const r = await R.runJob(Object.assign(j, { copyDir: CD }), { exe: process.env.DAISY_EXE }); R.clean(r.dir);
  if (r.code !== 0 || !Object.keys(r.logs).some(k => /Annual-Harvest/.test(k))) throw new Error(job.key + ': Daisy stopped with code ' + r.code + ' ' + r.err.slice(-300));
  const s = summarise(r.logs, job.sc === 'chemical'); s.seconds = r.seconds; fs.writeFileSync(f, JSON.stringify(s)); return s;
}
(async () => {
  const q = RUNS.slice(); let done = 0; const res = {};
  await Promise.all(Array.from({ length: CONC }, async () => { for (let j; (j = q.shift());) { try { res[j.key] = await one(j); } catch (e) { console.log('FAIL', e.message); } console.log(++done + '/' + RUNS.length, j.key); } }));
  const out = { built: new Date().toISOString().slice(0, 10), model: 'Daisy 7.1.14', weather: 'Taastrup, Denmark (built-in, 1965 to 2000)', years: '1979 to 2000', soils: SOILS, runs: res };
  fs.writeFileSync(path.join(APP, 'app/engine/daisydss.js'), '/* Daisy 7.1.14 results for the decision-support layers of the SWAFL project; written by tools/build_daisy_dss.js */\nwindow.DAISYDSS = ' + JSON.stringify(out) + ';\n'); console.log('written', Object.keys(res).length, 'runs');
})();
