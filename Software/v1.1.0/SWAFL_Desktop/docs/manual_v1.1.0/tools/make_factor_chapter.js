/* Writes the part "Factors" of chapters/34_daisy_factors.md from the code of the Experiments tab: every value that can be varied, what it
   means, where Daisy reads it, the values to type and what changes (js/daisyfactorhelp.js), with the levels and the accepted range of
   js/daisyexp.js, and how the number of runs is kept and the runs are chosen. usage: node tools/make_factor_chapter.js */
const fs = require('fs'), path = require('path'), JS = path.resolve(__dirname, '../../../app/js'), CH = path.resolve(__dirname, '../chapters/34_daisy_factors.md');
global.window = global; const X = require(path.join(JS, 'daisyexp.js')), HP = require(path.join(JS, 'daisyfactorhelp.js'));
const cell = v => String(v == null || v === '' ? 'n/a' : v).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const G = [['Weather and climate', ['precip', 'temp', 'radscale', 'season', 'station', 'bio']], ['Nitrogen and tillage', ['nfac', 'ntype', 'ntime', 'till', 'tc']], ['Irrigation', ['irrig', 'mm', 'hours', 'flux', 'trig', 'z', 'method', 'dripdepth', 'limit', 'window']], ['Soil and crop', ['soil', 'root', 'cropone']], ['Chemicals', ['chem', 'koc', 'half']], ['The Daisy library', ['mgmt', 'prog']]];
const used = new Set(); G.forEach(g => g[1].forEach(id => used.add(id)));
const params = X.FACTORS.filter(f => f.param), byCh = {}; params.forEach(f => { const k = f.param.attr + (f.param.use ? ' ' + f.param.use : ''); (byCh[k] = byCh[k] || []).push(f); });
let t = '## Factors\n\n';
t += 'Each row of *What will be tested* is one factor: one thing that changes between the runs. The text under the row says what the factor is; *more* opens where Daisy reads it, the typical values, what to type and what changes in the results. This chapter gives the same for all ' + X.FACTORS.length + ' factors.\n\n';
t += '### How to fill in a row\n\n';
t += 'A number factor has a box with its values, separated by commas, and a note after it: the unit and *allowed a to b*. Each value is one **level**: the runs combine the levels of every row. Three rows of the Experiments tab as an example:\n\n';
t += '| Row as it appears | What to type | What it means |\n|:----------|:------------|:--------------------|\n';
[['p_OrganicMatter~original~min_AM_N', '0.025, 0.05, 0.1'], ['p_Surface~~DetentionCapacity', '2.5, 5, 10'], ['p_Surface~~LocalDetentionCapacity', '5, 10, 20']].forEach(([id, ex]) => { const F = X.factor(id); if (!F) return; const h = HP.get(F); t += '| ' + cell(F.label.replace(/ \(Daisy reference.*\)$/, '')) + ', ' + cell(F.unit) + ' · allowed ' + F.range.join(' to ') + ' | ' + ex + ' | ' + cell(h.w) + ' Typical: ' + cell(h.t) + ' |\n'; });
t += '\n*Allowed* is what the box accepts: from 0 to ten times the value the farm uses (or the Daisy default when the farm sets none). It is a guard against typing errors, not a limit of Daisy, and the sensible values are much narrower: they are given as *Typical* for every factor below. A value outside the box range is moved to its nearest end.\n\n';
t += 'A choice factor (a soil, a fertiliser, a tillage, a crop of the library) has a list with a search box: tick the choices to compare. Every ticked choice is one level.\n\n';
t += '### The number of runs\n\n';
t += 'Under the rows: *How to combine* (every combination, one thing at a time, or the values in pairs), *number of runs*, *if there are more, choose*, *seed* and *rainfed references*. The number of runs is the number Daisy makes, the rainfed references included, and it is never exceeded:\n\n';
t += '1. The combinations are counted (for every combination: the product of the numbers of levels).\n2. When they fit, every combination is run.\n3. When there are more, as many as fit are chosen in the way set:\n' + X.PICKS.map(p => '    - **' + p[1].replace(/:.*/, '') + '**' + (p[1].indexOf(':') > 0 ? ':' + p[1].replace(/^[^:]*:/, '') : '') + '.').join('\n') + '\n4. Irrigation factors need a rainfed reference for every soil and weather of the chosen runs, so the gain of irrigation is measured against the same soil and weather. They count as runs: with references the runs come in pairs, and an odd number gives one run fewer. Untick *rainfed references* to get exactly the number set.\n5. The same plan and seed always give the same runs. *See the runs* lists them and counts how often each value is used.\n\n';
t += 'The balanced choice is a Latin hypercube over the levels: each level of each factor is used in about the same number of runs, and the levels are mixed at random between the factors, so a small number of runs still covers every value. *My experiments* keeps the number, the way of choosing and the seed of every experiment, and shows how many runs each gives.\n\n';
t += '### All factors at a glance\n\n| Group | Factor | Unit | Typical values |\n|:------|:----------|:----|:--------------|\n';
G.forEach(g => g[1].forEach(id => { const F = X.factor(id); if (!F) return; const h = HP.get(F) || {}; t += '| ' + g[0] + ' | ' + cell(F.label) + ' | ' + cell(F.unit) + ' | ' + cell(h.t) + ' |\n'; }));
Object.keys(byCh).forEach(k => byCh[k].forEach(F => { const h = HP.get(F) || {}; t += '| Daisy reference, ' + cell(k) + ' | ' + cell(F.param.name) + ' | ' + cell(F.unit) + ' | ' + cell(h.t) + ' |\n'; }));
t += '\n';
const block = (F, title) => { const h = HP.get(F) || {}, q = F.param; let b = '#### ' + title + '\n\n' + cell(h.w) + '\n\n| Item | Value |\n|:--------|:--------------------|\n';
  b += '| Where Daisy reads it | ' + cell(h.d) + ' |\n'; if (q) b += '| Daisy default; the farm | ' + cell(q.def) + '; ' + (q.farm != null ? q.farm : 'not set (the default is used)') + ' |\n';
  b += '| Typical values | ' + cell(h.t) + ' |\n| Levels offered | ' + cell((F.levels || []).map(v => v && v.label ? v.label : v).join(', ')) + ' |\n';
  if (F.range) b += '| Box accepts | ' + F.range.join(' to ') + ' ' + cell(F.unit === 'n/a' ? '' : F.unit) + ' |\n';
  b += '| What to type | ' + cell(h.f) + ' |\n| What changes | ' + cell(h.e) + ' |\n| Needs irrigation | ' + (F.irr ? 'yes: the runs are irrigated, with a rainfed reference' : 'no') + ' |\n';
  if (q) b += '| Daisy reference | chapter ' + q.ch + ': ' + cell(HP.cleanDesc(q.desc)) + ' |\n'; if (F.words && F.words.length) b += '| Words that propose it | ' + cell(F.words.slice(0, 10).join(', ')) + ' |\n'; return b + '\n'; };
G.forEach(g => { t += '### ' + g[0] + '\n\n'; g[1].forEach(id => { const F = X.factor(id); if (F) t += block(F, F.label); }); });
t += '### Parameters of the Daisy reference\n\nThese ' + params.length + ' parameters were each written into a run and accepted by Daisy 7.1.14 at the default and at half and double that value. Their levels are fractions of the value the farm uses: 0.5, 0.75, 1, 1.5 and 2 times.\n\n';
Object.keys(byCh).forEach(k => { t += '#### ' + k + '\n\n'; byCh[k].forEach(F => { t += block(F, F.param.name + ' (' + cell(F.unit) + ')').replace(/^####/, '#####'); }); });
X.FACTORS.filter(f => !f.param && !used.has(f.id)).forEach(F => { t += block(F, F.label); });
const old = fs.readFileSync(CH, 'utf8'), a = old.indexOf('## Factors'), z = old.indexOf('## The Daisy library, all of it');
fs.writeFileSync(CH, old.slice(0, a) + t + (z > 0 ? old.slice(z) : ''));
console.log('factors', X.FACTORS.length, 'written', t.length);
