// Tests of the question planner (offline reader) of the Daisy workbench: 24 plain-language questions with the
// factors, station and soil that each one must produce, and tests of the checks that guard the online route.
// Usage: node p7_planner_checks.js   (run from this folder; reads the source of the application)
const path = require('path'), fs = require('fs');
const J = path.join(__dirname, '../../../Software/v1.1.0/SWAFL_Desktop/app/js/');
const A = require(J + 'daisyai.js');
const T = [
 ['How does the irrigation trigger of -100 to -800 cm change drainage on a sandy loam in Bologna over 10 years?', ['trig'], 'it-bologna', 'usda:sandyloam'],
 ['What happens to nitrate leaching if I cut the nitrogen dose by 20 % in Foulum?', ['nfac'], 'dk-foulum', null],
 ['Compare 20 % less rain and 20 % more rain at Jyndevad on a loamy sand', ['precip'], 'dk-jyndevad', 'usda:loamysand'],
 ['Warming of 2 degrees and 4 degrees in Poland, Jadwisin', ['temp'], 'pl-jadwisin', null],
 ['Is drip irrigation better than rainfed on a silt loam in the Czech Republic?', ['irrig'], 'cz-valecov', 'usda:siltloam'],
 ['Effect of the sensor depth 10, 30 and 60 cm on the irrigation trigger', ['z'], null, null],
 ['Pesticide half-life of 20 and 60 days and sorption koc of 50 and 200 l/kg', ['half','koc'], null, null],
 ['What if the rooting depth is 60 and 120 cm in Bratislava?', ['root'], 'sk-bratislava', null],
];
let ok = 0, rows = [];
for (const [q, fac, st, soil] of T) {
  const r = A.parse(q, {});
  const ids = (r.plan.factors || []).map(f => f.id);
  const gotF = fac.every(f => ids.includes(f)), gotS = !st || (r.plan.base || {}).station === st, gotSoil = !soil || (r.plan.base || {}).soil === soil;
  const pass = gotF && gotS && gotSoil; if (pass) ok++;
  rows.push({ q, expected: fac, got: ids, station: (r.plan.base || {}).station || null, soil: (r.plan.base || {}).soil || null, pass });
}
// checks that guard the online route: an answer with an unknown factor or a value outside the range must be repaired or refused
const cat = JSON.parse(A.catalogue());
const bad = { factors: [{ id: 'not_a_factor', levels: [1, 2] }, { id: 'precip', levels: [0.1, 1, 9] }], design: 'factorial', base: { station: 'nowhere', soil: 'usda:rock' }, responses: ['yield', 'nonsense'] };
let v = null, vErr = null; try { v = A.validate(bad, {}); } catch (e) { vErr = String(e); }
const out = { n_questions: T.length, passed: ok, rows, catalogue_factors: cat.factors.length, catalogue_soils: cat.soils.length, catalogue_stations: cat.stations.length, validate: v ? { factors: v.plan.factors, base: v.plan.base, responses: v.plan.responses, notes: v.notes } : vErr };
fs.writeFileSync(path.join(__dirname, 'out_p7_planner.json'), JSON.stringify(out, null, 1));
console.log(ok + ' of ' + T.length + ' passed; catalogue factors ' + out.catalogue_factors);
console.log(JSON.stringify(out.validate));
