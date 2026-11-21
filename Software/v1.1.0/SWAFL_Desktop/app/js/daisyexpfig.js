/* Daisy workbench: the figures of one experiment.
   Each experiment of the study has its own figures (daisyexpspec.js); they are drawn again from the results every time results arrive.
   The person is asked which figures to draw (all are ticked at first), and can add figures of their own: any response against any factor,
   coloured by a second factor and split into panels by a third. The process map of Daisy beside the figures is marked for this experiment
   and linked to them: choose a process and the figures that depend on it light up, choose a figure and its processes light up. */
'use strict';
window.DaisyExpFig = (() => {
  const M = {}, X = () => window.DaisyExp, P = () => window.DaisyPlot, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const memo = {};                       // per experiment: which figures are switched off and the figures the person added
  const mean = a => { a = a.filter(isFinite); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN; };
  const fv = r => r.val || r.f || {};
  const short = s => { s = String(s || ''); const m = s.match(/^(.*?), factor on the (weather|rotation)/); if (m) return m[1] + ' (\u00d7 ' + (m[2] === 'weather' ? 'observed' : 'rotation rate') + ')'; return s.replace(/ \((?!\u00d7).*/, '').replace(/, factor.*/, ''); };
  const LET = 'abcdefghijklmnopqrstuvwxyz';
  const same = (a, b) => String(a) === String(b);

  function pick(rows, where) { return rows.filter(r => !r.reference && Object.keys(where || {}).every(k => same(fv(r)[k], where[k]))); }
  function cellMean(rows, conds, resp) { return mean(rows.filter(r => Object.keys(conds).every(k => same(fv(r)[k], conds[k]))).map(r => r.r[resp])); }

  // what a figure is called, in the words of the paper
  function titleOf(f, c) {
    if (f.t) return f.t; const R = short(c.rlabel(f.r || 'yield')), x = f.x ? short(c.flabel(f.x)).toLowerCase() : '';
    switch (f.k) {
      case 'partition': return 'Where the water goes' + (f.perRun ? ', run by run' : ', by ' + x); case 'nfate': return 'Where the nitrogen goes' + (f.perRun ? ', run by run' : ', by ' + x); case 'cfate': return 'Where the chemical goes, by ' + x; case 'effects': return 'Effect of each factor on ' + R.toLowerCase();
      case 'range': return 'Range of ' + R.toLowerCase() + ' for each factor'; case 'ranked': return 'Every run ranked by ' + R.toLowerCase(); case 'tradeoff': return short(c.rlabel(f.r)) + ' against ' + short(c.rlabel(f.r2)).toLowerCase(); case 'slope': return R + ': lowest against highest ' + x + ', by ' + short(c.flabel(f.c)).toLowerCase(); case 'share': return (f.s === 'n' ? 'Share of the nitrogen' : 'Share of the water') + ' by ' + x;
      case 'surface': return R + ' over ' + x + ' and ' + short(c.flabel(f.y)).toLowerCase(); case 'runs': return 'The results of every run'; case 'main': return 'Main effect of each factor on ' + R.toLowerCase();
      default: return R + (x ? ' by ' + x : '');
    }
  }
  const unitOf = (c, r) => { const q = X().RESP.find(z => z.id === r); return q ? q.unit : ''; };

  // the panels of a figure: [{ label, draw(canvas, letter) }]
  function panelsOf(f, c, rows) {
    const E = X(), PL = P(), R = f.r || 'yield', RL = c.rlabel(R), data = pick(rows, f.where), out = [];
    const pLev = f.p ? E.levels(data, f.p) : [null], multiP = pLev.length > 1, letter = i => '';
    const sub = (pv, extra) => (pv === null ? '' : short(c.flabel(f.p)) + ': ' + c.lname(f.p, pv)) + (extra || '');
    // one scale for all panels of a figure, so that the panels can be compared
    const scale = fn => { const v = []; pLev.forEach(pv => fn(pv).forEach(x => { if (isFinite(x)) v.push(x); })); if (!v.length) return {}; const lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), ylo = lo >= 0 ? 0 : lo, nn = PL.nice(ylo, hi > ylo ? hi * 1.04 : ylo + 1, 5); return { ylo: ylo, yhi: nn.hi }; };
    const sel = pv => pv === null ? data : data.filter(r => same(fv(r)[f.p], pv));
    if (f.k === 'runs') {
      const RS = [['yield', '#009E73'], ['irr', '#0072B2'], ['perc', '#56B4E9'], ['leach', '#D55E00'], ['aet', '#E69F00']].filter(q => rows.some(r => isFinite(r.r[q[0]]) && (q[0] !== 'irr' || r.r.irr > 0))).slice(0, 4), all = rows.slice().sort((p1, p2) => (p1.reference ? 1 : 0) - (p2.reference ? 1 : 0) || (p2.r[RS[0][0]] || 0) - (p1.r[RS[0][0]] || 0));
      out.push({ label: '', draw: cv => PL.dotrows(cv, all.map(r => ({ label: E.shortLabel(fv(r), r.reference), ref: r.reference, vals: RS.map(q => r.r[q[0]]) })), RS.map(q => ({ title: short(c.rlabel(q[0])), unit: unitOf(c, q[0]), color: q[1] })), { title: titleOf(f, c), panel: f.letters ? 'a' : '' }) });
      return out; }
    if (f.k === 'range') {
      const fs = c.fids.filter(id => E.levels(data, id).length > 1), items = fs.map(id => { const m = E.marginal(data, id, R).filter(q => isFinite(q.mean)); if (m.length < 2) return null; const a = m[0], b = m[m.length - 1]; return { label: short(c.flabel(id)), lo: a.mean, hi: b.mean, loName: c.lname(id, a.level), hiName: c.lname(id, b.level), gap: Math.abs(b.mean - a.mean) }; }).filter(Boolean).sort((p1, p2) => p2.gap - p1.gap);
      out.push({ label: '', draw: cv => PL.range(cv, items.map(i => Object.assign({}, i, { label: i.label + ' (' + i.loName + ' \u2192 ' + i.hiName + ')' })), { title: titleOf(f, c), xt: short(RL) + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : '') + ': mean of the runs at the lowest and at the highest level' }) });
      return out; }
    if (f.k === 'ranked') {
      const all = rows.filter(r => isFinite(r.r[R])).sort((p1, p2) => (p2.r[R] || 0) - (p1.r[R] || 0)).slice(0, 40);
      out.push({ label: '', draw: cv => PL.ranked(cv, all.map(r => E.shortLabel(fv(r), r.reference)), all.map(r => r.r[R]), { title: titleOf(f, c), refs: all.map(r => !!r.reference), xt: short(RL) + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : '') + (rows.length > 40 ? ' (the 40 highest of ' + rows.length + ' runs)' : '') }) });
      return out; }
    if (f.k === 'tradeoff') {
      const R2 = f.r2, g = f.c, pts = rows.filter(r => !r.reference && isFinite(r.r[R]) && isFinite(r.r[R2])).map(r => ({ x: r.r[R2], y: r.r[R], label: E.shortLabel(fv(r), false), group: g ? c.lname(g, fv(r)[g]) : null })), lowIsBetter = ['irr', 'perc', 'leach', 'run', 'den', 'vol', 'CLF', 'aet'].indexOf(R2) >= 0;
      out.push({ label: '', draw: cv => PL.tradeoff(cv, pts, { title: titleOf(f, c), xt: short(c.rlabel(R2)) + (unitOf(c, R2) ? ' (' + unitOf(c, R2) + ')' : ''), yt: short(RL) + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : ''), better: { x: lowIsBetter ? 'low' : 'high', y: 'high' } }) });
      return out; }
    if (f.k === 'slope') {
      const xs = E.levels(data, f.x), cs = E.levels(data, f.c), a = xs[0], b = xs[xs.length - 1], val = (cv2, xv) => { const cond = {}; cond[f.x] = xv; cond[f.c] = cv2; return cellMean(data, cond, R); };
      const ser = cs.map((cv2, k) => ({ name: c.lname(f.c, cv2), color: PL.OKI[k % PL.OKI.length], vals: [val(cv2, a), val(cv2, b)] }));
      out.push({ label: '', draw: cv => PL.slope(cv, [short(c.flabel(f.x)) + ': ' + c.lname(f.x, a), short(c.flabel(f.x)) + ': ' + c.lname(f.x, b)], ser, { title: titleOf(f, c), yt: short(RL) + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : '') }) });
      return out; }
    if (f.k === 'share') {
      const n = f.s === 'n', xs = E.levels(data, f.x), comp = n ? [['Crop uptake', 'upt', '#009E73'], ['Nitrate leached', 'leach', '#D55E00'], ['Denitrification', 'den', '#CC79A7'], ['Ammonia volatilised', 'vol', '#F0E442']] : [['Evapotranspiration', 'aet', '#E69F00'], ['Drainage below 1 m', 'perc', '#0072B2'], ['Runoff', 'run', '#56B4E9']];
      const parts = comp.map(q => ({ name: q[0], color: q[2], vals: xs.map(xv => { const cond = {}; cond[f.x] = xv; return cellMean(data, cond, q[1]); }) })).filter(q => q.vals.some(isFinite));
      out.push({ label: '', draw: cv => PL.share(cv, xs.map(xv => c.lname(f.x, xv)), parts, { title: titleOf(f, c), xt: 'Share of the ' + (n ? 'nitrogen' : 'water') + ' leaving the field (' + short(c.flabel(f.x)).toLowerCase() + ')' }) });
      return out; }
    if (f.k === 'main') {
      const fs = c.fids.filter(id => E.levels(data, id).length > 1), sd = a => { const v = a.filter(isFinite); if (v.length < 2) return NaN; const m = mean(v); return Math.sqrt(v.reduce((s2, x) => s2 + (x - m) * (x - m), 0) / (v.length - 1)) / Math.sqrt(v.length); };
      const panels = fs.map((id, k) => { const lv = E.levels(data, id), vs = lv.map(l => data.filter(r => same(fv(r)[id], l)).map(r => r.r[R]).filter(isFinite)); return { title: short(c.flabel(id)), xs: lv.map(l => c.lname(id, l)), m: vs.map(mean), se: vs.map(sd), n: vs.map(v => v.length), numeric: lv.every(l => typeof l === 'number'), color: PL.OKI[k % PL.OKI.length] }; });
      out.push({ label: '', draw: cv => PL.facets(cv, panels, { title: titleOf(f, c), yt: RL + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : ''), grand: mean(data.map(r => r.r[R])), panel: f.letters ? 'b' : '' }) });
      return out; }
    if ((f.k === 'partition' || f.k === 'nfate') && f.perRun) {
      const water = f.k === 'partition', all = rows.filter(r => !r.reference || water), comp = water ? [['Evapotranspiration', 'aet', '#E69F00'], ['Drainage below 1 m', 'perc', '#0072B2'], ['Runoff', 'run', '#56B4E9']] : [['Crop uptake', 'upt', '#009E73'], ['Nitrate leached', 'leach', '#D55E00'], ['Denitrification', 'den', '#CC79A7'], ['Ammonia volatilised', 'vol', '#F0E442']];
      out.push({ label: '', draw: cv => PL.runStacks(cv, all.map(r => E.shortLabel(fv(r), r.reference)), comp.map(q => ({ name: q[0], color: q[2], vals: all.map(r => r.r[q[1]]) })).filter(q => q.vals.some(isFinite)), { title: titleOf(f, c), xt: water ? 'Water (mm per season)' : 'Nitrogen (kg N/ha per season)' }) });
      return out; }
    if (f.k === 'cfate') {
      const xs = E.levels(data, f.x);
      pLev.forEach((pv, i) => out.push({ label: sub(pv), draw: cv => {
        const d = sel(pv), g = xv => { const cond = {}; cond[f.x] = xv; return k2 => cellMean(d, cond, k2); };
        const parts = [['Leached below 200 cm', 'CLF', '#D55E00'], ['Degraded', 'CDF', '#009E73']].map(q => ({ name: q[0], color: q[2], vals: xs.map(xv => g(xv)(q[1])) }));
        parts.push({ name: 'Still in the soil or taken up', color: '#999999', vals: xs.map((xv, k) => { const v = 100 - parts[0].vals[k] - parts[1].vals[k]; return isFinite(v) ? Math.max(0, v) : NaN; }) });
        PL.stackBars(cv, xs.map(xv => c.lname(f.x, xv)), parts.filter(q => q.vals.some(isFinite)), { title: multiP ? sub(pv) : titleOf(f, c), panel: letter(i), h: 320, xt: c.flabel(f.x), yt: 'Share of the amount sprayed (%)' });
      } }));
      return out;
    }
    if (f.k === 'lines' || f.k === 'bars') {
      const xs = E.levels(data, f.x), cs = f.c ? E.levels(data, f.c) : [null], numX = xs.length > 2 && xs.every(v => typeof v === 'number') && f.k === 'lines', numC = cs.length > 3 && cs.every(v => typeof v === 'number');
      const val = (pv, cv2, xv) => { const cond = {}; cond[f.x] = xv; if (f.p) cond[f.p] = pv; if (f.c) cond[f.c] = cv2; return cellMean(data, cond, R); };
      const sc = scale(pv => [].concat.apply([], cs.map(cv2 => xs.map(xv => val(pv, cv2, xv)))));
      pLev.forEach((pv, i) => out.push({ label: sub(pv), draw: cv => {
        const ttl = multiP ? sub(pv) : titleOf(f, c);
        if (numX) {
          const ser = cs.map((cv2, k) => ({ name: cv2 === null ? 'Mean of the runs' : c.lname(f.c, cv2), x: xs, y: xs.map(xv => val(pv, cv2, xv)), color: numC ? PL.ramp('viridis', k / Math.max(1, cs.length - 1)) : PL.OKI[k % PL.OKI.length], line: true, pts: true, r: 4 }));
          const o = { title: ttl, panel: letter(i), h: 300, xt: c.flabel(f.x), yt: RL, ylo: sc.ylo, yhi: sc.yhi };
          if (numC) { o.noLegend = true; const tk = cs.length > 6 ? cs.filter((_, k) => k % Math.ceil(cs.length / 6) === 0) : cs; o.cbar = { title: short(c.flabel(f.c)), lo: cs[0], hi: cs[cs.length - 1], pal: 'viridis', ticks: tk.map(v => ({ v, label: String(v) })) }; }
          else if (cs.length === 1) o.noLegend = true;
          PL.line(cv, ser, o);
        } else {
          const ser = cs.map((cv2, k) => ({ name: cv2 === null ? short(RL) : c.lname(f.c, cv2), vals: xs.map(xv => val(pv, cv2, xv)), color: PL.OKI[k % PL.OKI.length] }));
          PL.groupBars(cv, xs.map(xv => c.lname(f.x, xv)), ser, { title: ttl, panel: letter(i), h: 300, xt: c.flabel(f.x), yt: RL, legend: cs.length > 1 });
        }
      } }));
    } else if (f.k === 'surface') {
      pLev.forEach((pv, i) => out.push({ label: sub(pv), draw: cv => {
        const d = sel(pv), xs = E.levels(d, f.x), ys = E.levels(d, f.y), num = a => a.length > 1 && a.every(v => typeof v === 'number'), ttl = multiP ? sub(pv) : titleOf(f, c);
        const Z = ys.map(yv => xs.map(xv => { const cond = {}; cond[f.x] = xv; cond[f.y] = yv; return cellMean(d, cond, R); }));
        if (num(xs) && num(ys)) PL.surface(cv, xs, ys, Z, { title: ttl, panel: letter(i), xt: c.flabel(f.x), yt: c.flabel(f.y), unit: short(RL) + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : ''), pal: f.pal || 'viridis', h: 340 });
        else PL.matrix(cv, xs.map(v => c.lname(f.x, v)), ys.map(v => c.lname(f.y, v)), Z, { title: ttl, panel: letter(i), xt: c.flabel(f.x), yt: c.flabel(f.y), unit: short(RL), pal: f.pal || 'viridis' });
      } }));
    } else if (f.k === 'partition' || f.k === 'nfate') {
      const water = f.k === 'partition', xs = E.levels(data, f.x);
      const comp = water
        ? [['Evapotranspiration', 'aet', '#E69F00'], ['Drainage below 1 m', 'perc', '#0072B2'], ['Runoff', 'run', '#56B4E9'], ['Change in storage', null, '#999999']]
        : [['Crop uptake', 'upt', '#009E73'], ['Nitrate leached', 'leach', '#D55E00'], ['Denitrification', 'den', '#CC79A7'], ['Ammonia volatilised', 'vol', '#F0E442']];
      pLev.forEach((pv, i) => out.push({ label: sub(pv), draw: cv => {
        const d = sel(pv), g = xv => { const cond = {}; cond[f.x] = xv; return k2 => cellMean(d, cond, k2); };
        const parts = comp.map(q => ({ name: q[0], color: q[2], vals: xs.map(xv => { const m = g(xv); if (q[1]) return m(q[1]); const v = m('rain') + (m('irr') || 0) - m('aet') - m('perc') - (m('run') || 0); return isFinite(v) ? Math.max(0, v) : NaN; }) }));
        const top = water ? { name: 'Rain + irrigation', color: '#111111', dash: [5, 3], vals: xs.map(xv => { const m = g(xv); return m('rain') + (m('irr') || 0); }) } : { name: 'Nitrogen applied', color: '#111111', dash: [5, 3], vals: xs.map(xv => g(xv)('fert')) };
        PL.stackBars(cv, xs.map(xv => c.lname(f.x, xv)), parts.filter(q => q.vals.some(isFinite)), { title: multiP ? sub(pv) : titleOf(f, c), panel: letter(i), h: 320, xt: c.flabel(f.x), yt: water ? 'Water (mm per season)' : 'Nitrogen (kg N/ha per season)', lines: top.vals.some(isFinite) ? [top] : [] });
      } }));
    } else if (f.k === 'effects') {
      out.push({ label: '', draw: cv => {
        const fs = c.fids.filter(id => E.levels(data, id).length > 1), eff = fs.map(id => { const m = E.marginal(data, id, R).map(q => q.mean).filter(isFinite); return { id, v: m.length > 1 ? Math.max.apply(null, m) - Math.min.apply(null, m) : 0 }; }).sort((a, b) => b.v - a.v);
        PL.hbars(cv, eff.map(e => short(c.flabel(e.id))), eff.map(e => e.v), { title: titleOf(f, c), xt: 'Range of the mean ' + short(RL).toLowerCase() + (unitOf(c, R) ? ' (' + unitOf(c, R) + ')' : '') + ' between the lowest and the highest level', panel: f.letters ? 'a' : '' });
      } });
    }
    return out;
  }

  // does the experiment hold what a figure needs?
  function usable(f, c, rows) {
    const E = X(); if (f.r && !rows.some(r => isFinite(r.r[f.r]))) return false; const d = pick(rows, f.where); if (!d.length) return false; if (f.k === 'runs' || f.k === 'main') return f.k === 'runs' ? rows.length > 1 && rows.length <= 150 : c.fids.some(id => E.levels(d, id).length > 1);
    // a response against a factor needs the factor at two or more levels: one level gives a lone bar, which says nothing
    if (f.x && !/^(runs|main|surface|effects|cfate|range|ranked|tradeoff)$/.test(f.k) && !f.perRun && E.levels(d, f.x).length < 2) return false;
    const has = id => !id || E.levels(d, id).length > 0; if (!has(f.x) || !has(f.y) || !has(f.c) || !has(f.p)) return false;
    if (f.k === 'runs') return rows.length > 1 && rows.length <= 150; if (f.k === 'main') return c.fids.some(id => E.levels(d, id).length > 1);
    if (f.k === 'surface') return E.levels(d, f.x).length > 1 && E.levels(d, f.y).length > 1; if (f.k === 'range') return c.fids.some(id => E.levels(d, id).length > 1); if (f.k === 'ranked') return rows.filter(r => isFinite(r.r[f.r])).length > 2; if (f.k === 'tradeoff') return rows.filter(r => !r.reference && isFinite(r.r[f.r]) && isFinite(r.r[f.r2])).length > 3 && f.r !== f.r2; if (f.k === 'slope') return !!f.c && f.c !== f.x && E.levels(d, f.x).length > 1 && E.levels(d, f.c).length > 1; if (f.k === 'share') return E.levels(d, f.x).length > 1 && d.some(r => f.s === 'n' ? (isFinite(r.r.leach) || isFinite(r.r.upt)) : (isFinite(r.r.aet) && isFinite(r.r.perc))); if (f.k === 'effects') return c.fids.filter(id => E.levels(d, id).length > 1).length > 1;
    if (f.k === 'cfate') return d.some(r => isFinite(r.r.CLF) || isFinite(r.r.CDF)); if (f.k === 'partition') return d.some(r => isFinite(r.r.aet) && isFinite(r.r.perc)); if (f.k === 'nfate') return d.some(r => isFinite(r.r.leach) || isFinite(r.r.upt)); return E.levels(d, f.x).length > 0;
  }
  // a note written from this figure's own factors and results
  const noteOf = (f, c, rows) => {
    const rl = q => c.rlabel(q), fl = id => c.flabel(id), nm = x => { const t = String(x); return t.replace(/\s*\(.*$/, ''); };
    const vals = (q) => rows.map(r => r.r && r.r[q]).filter(v => typeof v === 'number' && isFinite(v));
    const rng = q => { const v = vals(q); if (!v.length) return ''; const lo = Math.min.apply(null, v), hi = Math.max.apply(null, v), g = z => Math.abs(z) >= 100 ? z.toFixed(0) : z.toFixed(1); return ' It ranges from ' + g(lo) + ' to ' + g(hi) + ' among the ' + rows.length + ' runs.'; };
    if (f.k === 'runs') return 'Every run of the experiment is one row: one combination of the values, named by its values, with its own results side by side (each panel has its own scale). Runs are ordered by ' + nm(rl(rows.some(r => isFinite(r.r.yield)) ? 'yield' : f.r)).toLowerCase() + '.';
    if (f.k === 'main') return 'The mean of ' + nm(rl(f.r)).toLowerCase() + ' over the runs at each value of a factor, with one standard error and the number of runs: the main effect of each factor, the others averaged over the runs that were made.' + rng(f.r);
    if (f.k === 'partition') return 'Where the water went in each run: transpiration and evaporation (actual evapotranspiration), percolation below the root zone and run-off, as parts of the same bar.' + rng('perc').replace('It', ' Percolation');
    if (f.k === 'cfate') return 'Where the chemical went at each value: the share of the amount sprayed that leached below 200 cm, the share degraded, and what is still in the soil or was taken up, with the other factors averaged over the runs that were made.';
    if (f.k === 'nfate') return 'Where the nitrogen went in each run: crop uptake, leaching, denitrification and volatilisation, in kg N per hectare.' + rng('leach').replace('It', ' Leaching');
    if (f.k === 'effects') return 'Main effect of each factor on ' + nm(rl(f.r)).toLowerCase() + ': the change in the mean when the factor moves from its lowest to its highest level.' + rng(f.r);
    if (f.k === 'range') return 'For every factor, the mean of ' + nm(rl(f.r)).toLowerCase() + ' over the runs at its lowest level (blue) and at its highest level (orange), joined by a line; the factor that moves the result most is at the top.' + rng(f.r);
    if (f.k === 'ranked') return 'Every run ranked by ' + nm(rl(f.r)).toLowerCase() + ', the value written at the end of each bar; the highest run is in orange, rainfed references in grey.' + rng(f.r);
    if (f.k === 'tradeoff') return 'Each dot is one run, placed by ' + nm(rl(f.r)).toLowerCase() + ' (up) and ' + nm(rl(f.r2)).toLowerCase() + ' (across). The green corner is the better side of both medians; the runs named are the ones nearest to the best corner and at the extremes.';
    if (f.k === 'slope') return nm(rl(f.r)) + ' at the lowest and at the highest ' + nm(fl(f.x)).toLowerCase() + ', one line for each ' + nm(fl(f.c)).toLowerCase() + '; the value is written at both ends of the line.';
    if (f.k === 'share') return 'The parts of the ' + (f.s === 'n' ? 'nitrogen' : 'water') + ' leaving the field as a percentage of their sum, for each level of ' + nm(fl(f.x)).toLowerCase() + '; each part is the mean over the runs at that level.';
    if (f.k === 'surface') return nm(rl(f.r)) + ' over ' + nm(fl(f.x)).toLowerCase() + ' (x) and ' + nm(fl(f.y)).toLowerCase() + ' (y); lines join equal values, dots are the runs.' + rng(f.r);
    if (f.k === 'bars') return nm(rl(f.r)) + ' for each level of ' + nm(fl(f.x)).toLowerCase() + (f.c ? ', split by ' + nm(fl(f.c)).toLowerCase() : '') + (f.p ? ', one panel for each level of ' + nm(fl(f.p)).toLowerCase() : '') + '.' + rng(f.r);
    return nm(rl(f.r)) + ' against ' + nm(fl(f.x)).toLowerCase() + (f.c ? ', one line for each level of ' + nm(fl(f.c)).toLowerCase() : '') + (f.p ? ', one panel for each level of ' + nm(fl(f.p)).toLowerCase() : '') + '.' + rng(f.r);
  };
  const procsOf = f => { const E = X(), s = new Set(); [f.x, f.y, f.c, f.p, f.r2].forEach(id => id && (E.PROC_F[id] || []).forEach(p => s.add(p))); const r = f.k === 'cfate' ? ['CLF', 'CDF'] : f.k === 'partition' ? ['aet', 'perc', 'run'] : f.k === 'nfate' ? ['upt', 'leach', 'den', 'vol'] : [f.r]; r.forEach(q => q && (E.PROC_R[q] || []).forEach(p => s.add(p))); return Array.from(s); };

  // mount: c = { key, presetId, factors, rows, fids, flabel, rlabel, lname, onMap(procId) }
  M.mount = function (host, c) {
    const E = X(); if (!host || !E || !E.figsFor) return null; const key = c.key || c.presetId || 'own', mm = memo[key] = memo[key] || { off: {}, added: [] };
    const rows = c.rows, real = rows.filter(r => !r.reference), varied = (c.fids || []).filter(id => E.levels(real, id).length > 1), nComb = varied.reduce((a2, id) => a2 * E.levels(real, id).length, 1), nSeen = new Set(real.map(r => JSON.stringify(varied.map(id => String(fv(r)[id]))))).size, complete = nSeen >= nComb;
    // every run is one combination: its own row. When only some of the combinations were run, lines and panels by factor would join runs that differ
    // in other values too, so the figures are those of a screening design: every run, the main effects with their error, the balances run by run
    let base = E.figsFor(c.presetId, c.factors); if (!complete) base = base.filter(f => ['effects', 'partition', 'nfate'].indexOf(f.k) >= 0).map(f => f.k === 'effects' ? f : Object.assign({}, f, { perRun: true, p: undefined, x: undefined, c: undefined }));
    const sens = (id, r) => { const m = E.marginal(real, id, r).map(q => q.mean).filter(isFinite); if (m.length < 2) return 0; const mu = m.reduce((s2, v) => s2 + Math.abs(v), 0) / m.length; return mu > 1e-9 ? (Math.max.apply(null, m) - Math.min.apply(null, m)) / mu : 0; };
    // a factor that does not move the chosen result is shown on the result it does move (a sorption constant does not change the yield, but the leaching)
    const r0 = c.resp || 'yield', extraR = []; varied.forEach(id => { if (sens(id, r0) < 0.02) { let b = 0.02, br = null; E.RESP.forEach(q => { if (q.id === 'rain' || q.id === 'fert' || !rows.some(x => isFinite(x.r[q.id]))) return; const s2 = sens(id, q.id); if (s2 > b) { b = s2; br = q.id; } }); if (br && extraR.indexOf(br) < 0 && br !== r0) extraR.push(br); } });
    const hasR = q => rows.some(r => isFinite(r.r[q])), v2 = varied.filter(id => E.levels(real, id).length > 1), trR2 = ['irr', 'leach', 'perc', 'aet'].filter(q => q !== r0 && hasR(q) && (q !== 'irr' || rows.some(r => r.r.irr > 0)))[0];
    const newer = [{ id: 'range', k: 'range', r: r0 }, { id: 'ranked', k: 'ranked', r: r0 }].concat(trR2 ? [{ id: 'tradeoff', k: 'tradeoff', r: r0, r2: trR2, c: v2[0] }] : []).concat(complete && v2.length > 1 ? [{ id: 'slope', k: 'slope', r: r0, x: v2[0], c: v2[1] }] : []).concat(complete && v2.length && hasR('aet') && hasR('perc') ? [{ id: 'share', k: 'share', x: v2[0], s: 'w' }] : []).concat(complete && v2.length && (hasR('leach') || hasR('upt')) ? [{ id: 'shareN', k: 'share', x: v2[0], s: 'n' }] : []);
    const all = [{ id: 'runs', k: 'runs', r: 'yield', letters: 1 }, { id: 'main', k: 'main', r: r0, letters: 1 }].concat(extraR.slice(0, 4).map(r => ({ id: 'main_' + r, k: 'main', r, letters: 1 }))).concat(base).concat(newer).concat(mm.added.map((f, i) => Object.assign({ id: 'u' + (i + 1) }, f))), figs = all.filter(f => usable(f, c, rows)), spec = c.presetId && E.SPEC[c.presetId];
    const fl = (c.fids || []).filter(id => E.levels(rows.filter(r => !r.reference), id).length > 1), rs = E.RESP.filter(q => rows.some(r => isFinite(r.r[q.id])));
    const KINDS = [['lines', 'Lines: a response against a factor'], ['bars', 'Bars: a response for each level'], ['surface', 'Surface: a response over two factors'], ['partition', 'Where the water goes'], ['nfate', 'Where the nitrogen goes'], ['cfate', 'Where the chemical goes'], ['effects', 'Which factor matters most'], ['range', 'Range: lowest against highest level of every factor'], ['ranked', 'Ranked: every run in order'], ['tradeoff', 'Trade-off: two results, one dot per run'], ['slope', 'Slope: lowest against highest level'], ['share', 'Share: parts as a percentage']];
    const opt = (list, sel, none) => (none ? '<option value="">' + none + '</option>' : '') + list.map(a => '<option value="' + esc(a[0]) + '"' + (a[0] === sel ? ' selected' : '') + '>' + esc(a[1]) + '</option>').join('');
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">Figures of this experiment' + (spec ? ': ' + esc(c.presetId) : '') + '</h3><span class="pnote">' + figs.length + ' figures, drawn from the ' + rows.length + ' runs' + (complete ? ' (every combination of the values was run)' : ' (' + nSeen + ' of the ' + nComb.toLocaleString() + ' combinations were run, so every run is shown as its own row and the effects are means with their error)') + '</span></div>' +
      (spec ? '<p style="margin:4px 0"><b>Question.</b> ' + esc(spec.aim) + '<br><b>Design.</b> ' + esc(spec.design) + '</p>' : '<p class="pnote" style="margin:4px 0">Your own design: the figures follow the factors you chose.</p>') +
      '<p style="margin:6px 0 2px"><b>Which figures do you want?</b> <button class="btn" data-ef="all">All</button> <button class="btn" data-ef="none">None</button> <span class="pnote">All are drawn at first. Untick what you do not need, or add a figure below.</span></p><div style="display:flex;flex-wrap:wrap;gap:4px 16px">' +
      all.map(f => usable(f, c, rows) ? '<label style="font-size:12.5px"><input type="checkbox" data-ef-id="' + f.id + '"' + (mm.off[f.id] ? '' : ' checked') + '> ' + esc(titleOf(f, c)) + (f.p ? ' <span class="pnote">(panels: ' + esc(short(c.flabel(f.p)).toLowerCase()) + ')</span>' : '') + '</label>' : '').join('') + '</div>' +
      '<details style="margin-top:6px"><summary><b>Add a figure</b></summary><div class="dzrow" style="margin-top:4px"><select data-add="k">' + opt(KINDS, 'lines') + '</select><label>x</label><select data-add="x">' + opt(fl.map(id => [id, short(c.flabel(id))]), fl[0]) + '</select><label>colour</label><select data-add="c">' + opt(fl.map(id => [id, short(c.flabel(id))]), '', 'none') + '</select><label>panels</label><select data-add="p">' + opt(fl.map(id => [id, short(c.flabel(id))]), '', 'none') + '</select><label>y (surface)</label><select data-add="y">' + opt(fl.map(id => [id, short(c.flabel(id))]), fl[1] || '', 'none') + '</select><label>2nd result (trade-off)</label><select data-add="r2">' + opt(rs.map(q => [q.id, short(q.label)]), 'irr') + '</select><label>response</label><select data-add="r">' + opt(rs.map(q => [q.id, short(q.label)]), c.resp || 'yield') + '</select><button class="btn pri" data-add="go">Add</button></div></details></div>';
    h += '<div data-ef-cards>' + figs.filter(f => !mm.off[f.id]).map(f => '<div class="dzpan dzfig" data-xf="sp_' + f.id + '" data-procs="' + procsOf(f).join(',') + '"><div class="dzrow"><b>' + esc(titleOf(f, c)) + '</b><span style="flex:1"></span></div>' + '<p class="pnote" data-note>' + esc(f.note ? f.note + ' ' + noteOf(f, c, rows) : noteOf(f, c, rows)) + '</p>' + '<div class="dzspgrid"></div></div>').join('') + '</div>';
    host.innerHTML = h; const redo = {}, cards = {};
    figs.filter(f => !mm.off[f.id]).forEach(f => {
      const card = host.querySelector('[data-xf="sp_' + f.id + '"]'), grid = card.querySelector('.dzspgrid'); let ps; try { ps = panelsOf(f, c, rows); } catch (e) { console.warn(f.id, e); card.remove(); return; }
      const cols = ps.length > 1 ? Math.min(2, ps.length) : 1; grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',minmax(0,1fr));gap:6px'; card.dataset.cols = cols;
      grid.innerHTML = ps.map((p, k) => '<div style="min-width:0"><canvas data-xc="sp_' + f.id + '_' + k + '"></canvas></div>').join(''); cards['sp_' + f.id] = card;
      const draw = () => ps.forEach((p, k) => { const cv = grid.querySelector('[data-xc="sp_' + f.id + '_' + k + '"]'); if (cv) { try { p.draw(cv); } catch (e) { console.warn(f.id, e); } } });
      redo['sp_' + f.id] = () => { if (card._drawn) draw(); }; card._draw = draw; card._drawn = false;   // drawn when its process is clicked on the map, not before
      if (window.DaisyFigKit && DaisyFigKit.procStrip) DaisyFigKit.procStrip(card, procsOf(f), c.runs, 'Drawn from the runs of this experiment.');
    });
    host.querySelector('[data-ef="all"]').onclick = () => { mm.off = {}; c.again(); }; host.querySelector('[data-ef="none"]').onclick = () => { all.forEach(f => { mm.off[f.id] = 1; }); c.again(); };
    host.querySelectorAll('[data-ef-id]').forEach(b => b.onchange = () => { if (b.checked) delete mm.off[b.dataset.efId]; else mm.off[b.dataset.efId] = 1; c.again(); });
    const q = k => host.querySelector('[data-add="' + k + '"]');
    q('go').onclick = () => { const f = { k: q('k').value, x: q('x').value || undefined, r: q('r').value }; if (f.k === 'tradeoff') f.r2 = q('r2').value; if (f.k === 'share') f.s = (f.r === 'leach' || f.r === 'upt') ? 'n' : 'w'; if (f.k === 'slope' && !q('c').value) { alert('A slope chart needs a colour factor.'); return; } ['c', 'p', 'y'].forEach(z => { if (q(z).value) f[z] = q(z).value; }); if (f.k === 'surface' && !f.y) { alert('A surface needs a second factor (y).'); return; } if (f.k !== 'surface') delete f.y; mm.added.push(f); c.again(); };
    // the map lights up the processes of the figure that is pointed at
    Object.keys(cards).forEach(id => { const card = cards[id]; card.addEventListener('mouseenter', () => c.onCard && c.onCard(card.dataset.procs.split(',').filter(Boolean))); card.addEventListener('mouseleave', () => c.onCard && c.onCard(null)); });
    return { redo, cards };
  };
  // the figures that depend on a process of the map
  M.focus = function (host, procId) { host.querySelectorAll('.dzfig[data-procs]').forEach(card => { const on = !procId || card.dataset.procs.split(',').indexOf(procId) >= 0; card.style.opacity = on ? '' : '0.28'; card.style.outline = procId && on ? '2px solid #c0392b' : ''; }); };
  // only the figures of the process chosen on the map (all of them when none is chosen)
  M.only = function (host, procId, all) { host.querySelectorAll('.dzfig[data-procs]').forEach(card => { const on = !!all || (!!procId && card.dataset.procs.split(',').indexOf(procId) >= 0); card.style.display = on ? '' : 'none'; card.style.opacity = ''; card.style.outline = ''; if (on && !card._drawn && card._draw) { card._drawn = true; try { card._draw(); } catch (e) { console.warn(e); } } }); };
  M.count = function (host) { const n = {}; host.querySelectorAll('.dzfig[data-procs]').forEach(card => card.dataset.procs.split(',').filter(Boolean).forEach(p => { n[p] = (n[p] || 0) + 1; })); return n; };
  M.titleOf = titleOf; M.procsOf = procsOf;
  return M;
})();
