/* Daisy workbench: every log of every run of an experiment, as figures for a paper.
   Every log that Daisy wrote in the runs (the daily and the annual logs, the logs of the library that were added) and every quantity in it
   becomes one figure: small multiples with one panel for each value of one factor, one line for each value of a second factor, the other
   factors averaged over the runs that share these two values, and a shaded band for the spread. Daily logs are drawn through the year
   (the mean of the seasons, day by day, with 10 to 90 % of the seasons and runs as the band) or over the whole period; annual logs year by
   year, with the lowest and the highest run as the band; depth logs as profiles (depth downwards) averaged over the period.
   Each figure has the toolbar of every figure (titles, picture at 300 or 600 dpi, the numbers as a table), and all of them are saved
   with the outputs of the experiment. Figures are drawn when they come into view, so a large experiment stays quick. */
'use strict';
window.DaisyExpTS = (() => {
  const P = () => window.DaisyPlot, IO = () => window.DaisyIO, FK = () => window.DaisyFigKit;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIMECOL = /^(year|month|mday|day|hour|minute|second|date|time)$/i, MAXFIG = 120, LET = 'abcdefghijklmnopqrstuvwxyz';
  const st = { pf: undefined, cf: undefined, mode: 'doy', stat: 'mean', log: '*', q: '' };
  const short = s => String(s || '').replace(/ \(.*/, '');
  const pct = (a, p) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y), k = (s.length - 1) * p, i = Math.floor(k); return i + 1 < s.length ? s[i] + (s[i + 1] - s[i]) * (k - i) : s[i]; };
  const mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;
  const doyOf = t => { const d = new Date(t); return Math.round((t - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5); };
  const isDaily = (name, d) => /daily|hourly/i.test(name) || (d.time && d.n > 60 && (d.time[d.n - 1] - d.time[0]) / Math.max(1, d.n - 1) < 3 * 864e5);
  // readable names of the columns Daisy writes most often, and the quantities a paper shows first
  const NAMES = { DS: 'Development stage', LAI: 'Leaf area index', Height: 'Crop height', WLeaf: 'Leaf dry matter', WStem: 'Stem dry matter', WSOrg: 'Storage organ dry matter', WRoot: 'Root dry matter', WDead: 'Dead leaf dry matter', NCrop: 'Nitrogen in the crop', NLeaf: 'Nitrogen in the leaves', NSOrg: 'Nitrogen in the storage organ', NStem: 'Nitrogen in the stems', NRoot: 'Nitrogen in the roots', H2OStress: 'Water stress', NStress: 'Nitrogen stress', Theta: 'Volumetric water content', h: 'Soil water pressure', pF: 'pF', T: 'Soil temperature', NO3: 'Nitrate', NH4: 'Ammonium', C: 'Concentration', M: 'Content' };
  const PRIO = [/^LAI$/, /WSOrg|yield/i, /^(DS)$/, /evapotranspiration|^Ea$|actual_evap/i, /transpiration/i, /soil.?evap/i, /percolation|matrix.?water|leach|drain/i, /NCrop|uptake/i, /NO3|nitrate/i, /stress/i, /^Theta$/i, /precip|irrigat/i];
  const prio = f => { const t = (f.col || f.v || ''); const i = PRIO.findIndex(r => r.test(t)); return (i < 0 ? 50 : i) + (f.kind === 'heat' ? 0.5 : f.kind === 'prof' ? 0.6 : 0); };
  const uni = u => window.SciText ? window.SciText.unit(String(u || '').replace(/\^-1/g, '⁻¹').replace(/\^-2/g, '⁻²')) : String(u || '').replace(/\^-1/g, '⁻¹').replace(/\^-2/g, '⁻²').replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\bdg C\b/g, '°C');
  // a quantity that flows (summed over a month or a year) or a state (averaged): from its log and its unit
  const isFlux = f => /FWater|SWater|FN|Tracer\b|Balance|Flux|Harvest|N2O|Denitr|Leach|Drain|Precip|Irrig/i.test(f.log + ' ' + f.col) && /(^|\b)(mm|kg|g|Mg|t)\b/.test(f.unit || '') && !/cm\^?3|%|\/m\^?3|m\^?2\/m\^?2|content|Theta/i.test((f.unit || '') + ' ' + f.col);
  const nameOf = c => NAMES[c] ? NAMES[c] + ' (' + c + ')' : String(c).replace(/_/g, ' ');
  const logOrder = n => /^daily/i.test(n) ? 0 : /^hourly/i.test(n) ? 1 : /^annual/i.test(n) ? 2 : 3;

  // the figures one log can give: a time figure for every quantity, a profile for every depth variable
  function figsOf(name, d) {
    const out = [], dc = IO().depthColumns(d), depth = new Set(); Object.keys(dc).forEach(v => { dc[v].forEach(c => depth.add(c.j)); if (dc[v].length > 1) { out.push({ kind: 'heat', log: name, v, unit: d.units[dc[v][0].c] || '' }); out.push({ kind: 'prof', log: name, v, unit: d.units[dc[v][0].c] || '' }); } });
    d.cols.forEach((c, j) => { if (TIMECOL.test(c) || depth.has(j)) return; const y = d.data[j]; if (!y || !y.some(v => isFinite(v) && v !== 0)) return; out.unshift({ kind: 'ts', log: name, col: c, unit: d.units[c] || '' }); });
    return out.reverse();
  }
  // the colour of each value of the colour factor: a ramp for three or more numbers, the Okabe-Ito colours otherwise
  function colours(levels) { const PL = P(), num = levels.length > 2 && levels.every(l => typeof l === 'number' || (l !== '' && !isNaN(+l)));
    return levels.map((l, i) => num ? PL.ramp('viridis', 0.08 + 0.8 * i / Math.max(1, levels.length - 1)) : PL.OKI[i % PL.OKI.length]); }

  if (!document.getElementById('dztsCss')) { const t = document.createElement('style'); t.id = 'dztsCss'; t.textContent = '.dzts{gap:4px 6px;flex-wrap:wrap}.dzts label{margin-left:10px;font-weight:600}.dzts label:first-child{margin-left:0}details.dzgrp{border:1px solid #d5dae1;border-radius:6px;margin:6px 0;background:#fff}details.dzgrp>summary{cursor:pointer;padding:6px 10px;background:#f1f4f8;border-radius:6px}details.dzgrp[open]>summary{border-bottom:1px solid #d5dae1;border-radius:6px 6px 0 0}details.dzgrp>div{padding:4px 8px}'; document.head.appendChild(t); }
  function mount(host, c) {
    if (!host) return; const runs = (c.runs || []).filter(r => r && r.logs && Object.keys(r.logs).length); if (!runs.length) { host.innerHTML = ''; return; }
    if (window.__expRunning) { host.innerHTML = '<div class="dzpan pnote">The figures of every log appear when all the runs have finished, so that the program stays quick while Daisy is running.</div>'; return; }
    const byId = {}; (c.rows || []).forEach(r => { byId[r.id] = r; }); const valOf = r => (byId[r.id] || {}).val || r.val || {}, refOf = r => !!(byId[r.id] || {}).reference;
    const fids = (c.fids || []).filter(f => f !== 'run'), lev = f => { const s = []; runs.forEach(r => { const v = valOf(r)[f]; if (v !== undefined && !s.some(x => String(x) === String(v))) s.push(v); }); return s.sort((a, b) => (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b), undefined, { numeric: true })); };
    const varied = fids.filter(f => lev(f).length > 1);
    if (st.pf === undefined || (st.pf && st.pf !== '__each' && varied.indexOf(st.pf) < 0)) st.pf = varied.length ? '__each' : null;   /* by default every ticked factor gets its own panel, with one line for each of its values */
    if (st.cf === undefined || (st.cf && st.cf !== '__run' && varied.indexOf(st.cf) < 0)) st.cf = varied.length > 1 ? varied[1] : varied[0] || '__run';
    const logs = {}; runs.forEach(r => Object.keys(r.logs).forEach(k => { const d = r.logs[k]; if (d && d.n && d.cols && !logs[k]) logs[k] = d; }));
    const names = Object.keys(logs).sort((a, b) => logOrder(a) - logOrder(b) || a.localeCompare(b)); let figs = []; names.forEach(n => figsOf(n, logs[n]).forEach(f => figs.push(f))); figs = figs.map((f, i) => ({ f, i })).sort((a, b) => prio(a.f) - prio(b.f) || logOrder(a.f.log) - logOrder(b.f.log) || a.i - b.i).map(q => q.f);
    const anyDaily = names.some(n => isDaily(n, logs[n]));
    const opt = (v, t, cur) => '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>';
    let h = '<div class="dzpan"><div class="dzrow"><h3 style="margin:0">Every log of every run</h3><span class="pnote" data-ts="n"></span></div>' +
      '<p class="pnote" style="margin:2px 0 6px">Every quantity that Daisy wrote in the runs of this experiment (' + names.length + ' logs), one figure each, in the style of a journal figure: one panel for each value of one factor, one line for each value of another, the other factors averaged over the runs that share these values, and a band for the spread. ' + (anyDaily ? 'Daily logs are drawn through the year (the mean of the seasons, day by day) or over the whole period; ' : '') + 'annual logs year by year; depth logs as profiles. All of them are saved with the outputs of the experiment.</p>' +
      '<div class="dzrow dzts"><label>Panels by</label><select data-ts="pf">' + opt('', 'one panel', st.pf || '') + (varied.length ? opt('__each', 'every factor, one panel for each', st.pf) : '') + varied.map(f => opt(f, short(c.flabel(f)), st.pf)).join('') + '</select>' +
      '<label>Lines by</label><select data-ts="cf">' + opt('', 'one line (all runs)', st.cf || '') + varied.map(f => opt(f, short(c.flabel(f)), st.cf)).join('') + opt('__run', 'every run', st.cf) + '</select>' +
      '<label>Time</label><select data-ts="mode">' + (anyDaily ? opt('doy', 'through the year (mean of the seasons)', st.mode) + opt('time', 'every day of the period', st.mode) + opt('month', 'monthly', st.mode) : '') + opt('year', 'yearly', st.mode) + opt('cum', 'cumulative over all the years', st.mode) + '</select>' +
      '<label>Line</label><select data-ts="stat">' + opt('mean', 'mean', st.stat) + opt('median', 'median', st.stat) + '</select>' +
      '<label>Log</label><select data-ts="log">' + opt('*', 'every log (' + names.length + ')', st.log) + names.map(n => opt(n, n, st.log)).join('') + '</select>' +
      '<input data-ts="q" placeholder="find a quantity (e.g. LAI, nitrate, evaporation)" value="' + esc(st.q) + '" style="width:230px"><button class="btn" data-ts="zip">Save these figures (.zip)</button></div><div data-ts="figs"></div></div>';
    host.innerHTML = h; const box = host.querySelector('[data-ts="figs"]');
    const sel = () => figs.filter(f => (st.log === '*' || f.log === st.log) && (!st.q || (f.col || f.v || '').toLowerCase().indexOf(st.q.toLowerCase()) >= 0 || f.log.toLowerCase().indexOf(st.q.toLowerCase()) >= 0));
    const pl = st.pf ? lev(st.pf) : [null], cl = st.cf === '__run' ? runs.map(r => r.id) : st.cf ? lev(st.cf) : [null], cols = colours(cl.filter(x => x !== null));
    const lname = (f, v) => f === '__run' ? (window.DaisyExp && window.DaisyExp.shortLabel ? window.DaisyExp.shortLabel(valOf(runs.find(r => r.id === v) || {}), refOf(runs.find(r => r.id === v) || {})) || v : v) : c.lname(f, v);
    const grp = (pv, cv) => runs.filter(r => (pv === null || String(valOf(r)[st.pf]) === String(pv)) && (cv === null || (st.cf === '__run' ? r.id === cv : String(valOf(r)[st.cf]) === String(cv))));
    const PP = st.pf === '__each' ? varied.map(fid => { const cl0 = lev(fid); return { pv: fid, cf: fid, cl: cl0, cols: colours(cl0), rsOf: cv => runs.filter(r => String(valOf(r)[fid]) === String(cv)), title: short(c.flabel(fid)) }; })
      : pl.map(pv => ({ pv, cf: st.cf, cl, cols, rsOf: cv => grp(pv, cv), title: pv === null ? '' : short(c.flabel(st.pf)) + ': ' + lname(st.pf, pv) }));
    const hf = st.pf === '__each' ? varied[0] || null : st.pf;   /* the maps of depth and time: one for each value of one factor */
    const center = a => st.stat === 'median' ? pct(a, 0.5) : mean(a);
    const colOf = (d, name) => { const j = d.cols.indexOf(name); return j >= 0 ? d.data[j] : null; };
    // one figure: the panels and their lines
    function build(f) {
      const panels = [];
      PP.forEach((pp, pi) => { const series = [];
        pp.cl.forEach((cv, ci) => { const rs = pp.rsOf(cv); if (!rs.length) return; const color = cv === null ? '#0072B2' : pp.cols[ci], name = cv === null ? (PP.length > 1 ? '' : 'all runs') : lname(pp.cf, cv);
          if (f.kind === 'prof') { const z = [], v = [], lo = [], hi = []; const dc0 = IO().depthColumns(logs[f.log])[f.v] || []; dc0.forEach(q => { const pool = [], ms = []; rs.forEach(r => { const d = r.logs[f.log]; if (!d) return; const y = d.data[q.j]; if (!y) return; const fin = y.filter(isFinite); if (fin.length) { ms.push(mean(fin)); fin.forEach(x => pool.push(x)); } }); if (!ms.length) return; z.push(q.z); v.push(center(ms)); lo.push(pct(pool, 0.1)); hi.push(pct(pool, 0.9)); }); if (z.length) series.push({ name, color, z, v, lo, hi }); return; }
          const daily = isDaily(f.log, logs[f.log]);
          if (daily && st.mode === 'doy') { const bins = Array.from({ length: 366 }, () => []); rs.forEach(r => { const d = r.logs[f.log]; if (!d || !d.time) return; const y = colOf(d, f.col); if (!y) return; for (let i = 0; i < d.n; i++) if (isFinite(y[i])) bins[Math.min(365, doyOf(d.time[i]))].push(y[i]); });
            const x = [], m = [], lo = [], hi = []; bins.forEach((b, k) => { if (!b.length) return; x.push(k); m.push(center(b)); lo.push(pct(b, 0.1)); hi.push(pct(b, 0.9)); }); if (x.length) series.push({ name, color, x, m, lo, hi }); }
          else { const by = new Map(), fx = isFlux(f), mode = st.mode === 'doy' && !daily ? 'year' : st.mode;
            rs.forEach(r => { const d = r.logs[f.log]; if (!d) return; const y = colOf(d, f.col); if (!y) return; const acc = new Map(); let run = 0, first = true;
              for (let i = 0; i < d.n; i++) { if (!isFinite(y[i])) continue; const t = d.time ? d.time[i] : i, D = d.time ? new Date(t) : null;
                if (!daily && first && y[i] === 0 && d.n > 2) { first = false; continue; } first = false;   /* the first record of an annual log is the start of the run */
                let key; if (mode === 'cum') { run += y[i]; key = daily ? Math.round(t / 864e5) * 864e5 : (D ? D.getUTCFullYear() : i); acc.set(key, [run, 1]); continue; }
                key = !daily ? (D ? D.getUTCFullYear() : i) : mode === 'month' ? Date.UTC(D.getUTCFullYear(), D.getUTCMonth(), 15) : mode === 'year' ? D.getUTCFullYear() : Math.round(t / 864e5) * 864e5;
                let a = acc.get(key); if (!a) acc.set(key, a = [0, 0]); a[0] += y[i]; a[1]++; }
              acc.forEach((a, k) => { const v = mode === 'cum' ? a[0] : (fx || !daily) && mode !== 'time' ? a[0] : a[0] / a[1]; let q = by.get(k); if (!q) by.set(k, q = []); q.push(v); }); });
            const ks = [...by.keys()].sort((a, b) => a - b), many = rs.length > 1, timeX = daily && mode !== 'year';
            series.push({ name, color, x: ks, m: ks.map(k => center(by.get(k))), lo: many ? ks.map(k => Math.min.apply(null, by.get(k))) : null, hi: many ? ks.map(k => Math.max.apply(null, by.get(k))) : null, pts: (!timeX || mode === 'month') && ks.length <= 80, lw: timeX && mode !== 'month' ? 1.3 : 1.7 }); } });
        if (series.length) panels.push({ title: pp.title, letter: '', series }); });
      if (st.pf === '__each' && f.kind !== 'prof') panels.forEach(q => q.series.forEach(z => { z.lo = null; z.hi = null; }));
      // only what the output really shows: a factor whose values give the same curve (they lie within 1 % of the range of the figure) is left out,
      // so that no panel repeats the same line; when no factor changes the quantity, one curve is shown and the caption says so
      if (f.kind !== 'prof' && panels.length) {
        const flat = pn => { const S = pn.series; if (S.length < 2 || S.some(z => !z.m || !z.m.length)) return false; let lo = Infinity, hi = -Infinity; S.forEach(z => z.m.forEach(v => { if (v < lo) lo = v; if (v > hi) hi = v; })); const rng = Math.max(hi - lo, 1e-9 * Math.max(1, Math.abs(hi))), maps = S.map(z => { const m = new Map(); z.x.forEach((x, i) => m.set(x, z.m[i])); return m; }); let dm = 0;
          maps[0].forEach((v0, x) => { let a0 = v0, b0 = v0; for (let k = 1; k < maps.length; k++) { const v = maps[k].get(x); if (v != null) { if (v < a0) a0 = v; if (v > b0) b0 = v; } } if (b0 - a0 > dm) dm = b0 - a0; }); return dm <= 0.01 * rng; };
        const one = pn => ({ title: pn.title, letter: '', series: [Object.assign({}, pn.series[0], { name: 'same for every value', color: '#444444', lo: pn.series[0].lo, hi: pn.series[0].hi })] });
        const fl = panels.map(flat);
        if (st.pf === '__each') { const keep = panels.filter((q, i) => !fl[i]); if (keep.length && keep.length < panels.length) { const out = keep.slice(); out.msg = 'Factors that do not change this quantity (' + panels.filter((q, i) => fl[i]).map(q => q.title.replace(/^.*: /, '').toLowerCase()).join(', ') + ') are left out.'; return out; }
          if (!keep.length) { const out = [one(Object.assign({}, panels[0], { title: 'no factor changes this quantity' }))]; out.msg = 'No factor of the experiment changes this quantity: all runs give the same curve, so one curve is shown.'; return out; } }
        else if (fl.every(Boolean)) { const out = [one(Object.assign({}, panels[0], { title: panels.length > 1 ? 'all panels equal' : panels[0].title }))]; out.msg = 'The runs give the same curve for this quantity, so one curve is shown.'; return out; }
        else panels.forEach((q, i) => { if (fl[i]) panels[i] = one(q); });
      }   /* the spread over the other factors would only hide the lines of the factor shown */
      return panels;
    }
    const titleOf = f => f.kind === 'prof' ? nameOf(f.v) + ': profile' : f.kind === 'heat' ? nameOf(f.v) + ' over depth and time' : nameOf(f.col), unitTxt = f => f.unit && f.unit !== (f.col || f.v) ? ' (' + uni(f.unit) + ')' : '';
    function noteOf(f) { const d = logs[f.log], daily = isDaily(f.log, d), what = st.pf === '__each' ? '' : st.cf === '__run' ? 'one line for each run' : st.cf ? 'one line for each value of ' + short(c.flabel(st.cf)).toLowerCase() : 'all runs together', pan = st.pf === '__each' ? 'one panel for each factor of the experiment, one line for each of its values, the other factors averaged' : st.pf ? 'one panel for each value of ' + short(c.flabel(st.pf)).toLowerCase() : '';
      const rest = st.pf === '__each' ? [] : varied.filter(x => x !== st.pf && x !== st.cf).map(x => short(c.flabel(x)).toLowerCase()), stat = st.stat === 'median' ? 'median' : 'mean';
      let t = f.kind === 'prof' ? 'The ' + stat + ' of ' + f.v + ' at each depth over the whole period, from the log ' + f.log + '; band: 10 to 90 % of the days and runs.'
        : daily && st.mode === 'doy' ? 'Day by day through the year from the log ' + f.log + ': the ' + stat + ' of all seasons and runs on that day; band: 10 to 90 % of them.'
        : st.mode === 'cum' ? 'Cumulative over all the years from the log ' + f.log + ': the running total of every run from the start, the ' + stat + ' of the runs; band: the lowest to the highest run.'
        : daily && st.mode === 'month' ? 'Month by month from the log ' + f.log + ': ' + (isFlux(f) ? 'the total of each month' : 'the mean of each month') + ' in every run, the ' + stat + ' of the runs; band: the lowest to the highest run.'
        : daily && st.mode === 'time' ? 'Every day of the period from the log ' + f.log + ': the ' + stat + ' of the runs; band: the lowest to the highest run.'
        : 'Year by year from the log ' + f.log + ': ' + (daily ? (isFlux(f) ? 'the total of each year' : 'the mean of each year') : 'the value Daisy wrote for each season') + ' in every run, the ' + stat + ' of the runs; band: the lowest to the highest run.';
      if (f.kind === 'heat') return (daily && st.mode === 'doy' ? 'Day of the year (x) and depth (y), the mean of all seasons and runs' : 'Every day (x) and depth (y), the mean of the runs') + ', from the log ' + f.log + '; one map for each value of ' + (hf ? short(c.flabel(hf)).toLowerCase() : 'the experiment') + ', with one colour scale for all maps.';
      const tail = [pan, what].filter(Boolean).join(', '); return t + (tail ? ' ' + tail.charAt(0).toUpperCase() + tail.slice(1) : '') + '.' + (rest.length ? ' Averaged over ' + rest.join(', ') + '.' : ''); }
    // depth and time: one map for each value of the panel factor, the mean of its runs (through the year: of its seasons too), one colour scale
    function heatJob(f, card, cv) {
      if (card._maps) return drawMaps(f, card, cv, card._maps);
      const dc0 = IO().depthColumns(logs[f.log])[f.v] || [], daily = isDaily(f.log, logs[f.log]), doy = daily && st.mode === 'doy', maps = [];
      (hf ? lev(hf) : [null]).slice(0, 6).forEach(pv => { const rs = runs.filter(r => pv === null || String(valOf(r)[hf]) === String(pv)), acc = new Map(); rs.forEach(r => { const d = r.logs[f.log]; if (!d || !d.time) return; dc0.forEach(q => { const y = d.data[q.j]; if (!y) return; for (let i = 0; i < d.n; i++) { if (!isFinite(y[i])) continue; const t = doy ? Date.UTC(2001, 0, 1) + Math.min(364, doyOf(d.time[i])) * 864e5 : Math.round(d.time[i] / 864e5) * 864e5, k = t + '|' + q.z; let a = acc.get(k); if (!a) acc.set(k, a = [0, 0]); a[0] += y[i]; a[1]++; } }); });
        const tt = [], zz = [], vv = []; acc.forEach((a, k) => { const i = k.indexOf('|'); tt.push(+k.slice(0, i)); zz.push(+k.slice(i + 1)); vv.push(a[0] / a[1]); }); if (vv.length) maps.push({ pv, tt, zz, vv }); });
      card._maps = maps; return drawMaps(f, card, cv, maps);
    }
    function drawMaps(f, card, cv, maps) {
      const daily = isDaily(f.log, logs[f.log]), doy = daily && st.mode === 'doy';
      if (!maps.length) { card.remove(); return; } let lo = Infinity, hi = -Infinity; maps.forEach(m => m.vv.forEach(v => { if (v < lo) lo = v; if (v > hi) hi = v; }));
      const gridBox = card.querySelector('[data-ts="cvs"]'); if (maps.length > 1) { gridBox.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px 10px'; card.dataset.cols = 2; cv.parentNode.style.minWidth = '0'; } const cvs = [cv]; while (cvs.length < maps.length) { let c2 = card.querySelectorAll('canvas')[cvs.length]; if (!c2) { const dv = document.createElement('div'); c2 = document.createElement('canvas'); c2.style.cssText = cv.style.cssText; dv.style.minWidth = '0'; dv.appendChild(c2); gridBox.appendChild(dv); } cvs.push(c2); }
      const pal = /theta|water/i.test(f.v) ? 'blues' : /^h$|pF/i.test(f.v) ? 'pf' : /NO3|NH4|nitr|ammon/i.test(f.v) ? 'ylgn' : /^T$|temp/i.test(f.v) ? 'ylorrd' : 'viridis';
      maps.forEach((m, i) => P().heat(cvs[i], m.tt, m.zz, m.vv, { title: (m.pv === null ? nameOf(f.v) : short(c.flabel(hf)) + ': ' + lname(hf, m.pv)), time: true, unit: uni(f.unit) || f.v, pal, lo, hi, h: maps.length > 1 ? 250 : 300, xt: doy ? 'Month of the year (mean of the seasons)' : 'Date', yt: 'Depth (cm)' }));
    }
    function draw() {
      const L = sel(), show = L.slice(0, MAXFIG), cnt = host.querySelector('[data-ts="n"]'); if (cnt) cnt.textContent = L.length + ' figures' + (L.length > MAXFIG ? ' (the first ' + MAXFIG + '; choose one log or find a quantity for the others)' : '');
      box.innerHTML = ''; // the figures are drawn one at a time, each in its own turn, so that the program stays quick while a large experiment is drawn
      const Q = []; let busyQ = false; const pump = () => { if (busyQ) return; const el = Q.shift(); if (!el) return; busyQ = true; setTimeout(() => { try { if (el.isConnected && el._go) { const g = el._go; el._go = null; g(); } } catch (e) { } busyQ = false; pump(); }, 0); };
      const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.target._go) { io.unobserve(e.target); Q.push(e.target); pump(); } }), { rootMargin: '400px' }) : null;
      const groups = {}; show.forEach(f => { (groups[f.log] = groups[f.log] || []).push(f); }); const gbox = {};
      Object.keys(groups).forEach((lg, gi) => { const dt = document.createElement('details'); dt.className = 'dzgrp'; if (gi === 0 || st.log !== '*') dt.open = true; dt.innerHTML = '<summary><b>' + esc(lg) + '</b> <span class="pnote">' + groups[lg].length + ' figure' + (groups[lg].length === 1 ? '' : 's') + (window.DaisyRaw && window.DaisyRaw.describe ? ' · ' + esc(window.DaisyRaw.describe(lg)) : '') + '</span></summary><div></div>'; box.appendChild(dt); gbox[lg] = dt.lastChild; dt.addEventListener('toggle', () => { if (dt.open) dt.querySelectorAll('.dzfig').forEach(cd => { if (cd._go && io) { io.unobserve(cd); io.observe(cd); } }); }); });
      const makeCard = (f, i) => { const card = document.createElement('div'); card.className = 'dzpan dzfig'; card.dataset.xf = 'ts' + i;
        card.innerHTML = '<div class="dzrow"><b>' + esc(titleOf(f)) + unitTxt(f) + '</b><span class="pnote" style="margin-left:8px">' + esc(f.log) + '</span></div><p class="pnote" style="margin:2px 0 4px">' + esc(noteOf(f)) + '</p><div data-ts="cvs"><div><canvas style="display:block;width:100%"></canvas></div></div>';
        gbox[f.log].appendChild(card); const cv = card.querySelector('canvas');
        let memo = null; const job = () => { if (f.kind === 'heat') return heatJob(f, card, cv); const panels = memo || (memo = build(f));   /* the numbers are worked out once; drawing again (saving at 300 dpi) only draws */ if (!panels.length) { card.remove(); return; } const daily = isDaily(f.log, logs[f.log]); if (panels.msg) { const pn = card.querySelector('p.pnote'); if (pn && !pn._m) { pn._m = 1; pn.textContent += ' ' + panels.msg; } }
          if (f.kind === 'prof') P().profiles(cv, panels, { title: '', xt: nameOf(f.v) + unitTxt(f) });
          else P().ribbons(cv, panels, { title: '', yt: (st.mode === 'cum' ? 'Cumulative ' + String(NAMES[f.col] || f.col).replace(/^./, c0 => c0.toLowerCase()) : (NAMES[f.col] || f.col)) + unitTxt(f) + (isDaily(f.log, logs[f.log]) && isFlux(f) && (st.mode === 'month' || st.mode === 'year') ? ' per ' + (st.mode === 'month' ? 'month' : 'year') : ''), xkind: daily && st.mode === 'doy' ? 'doy' : daily && (st.mode === 'time' || st.mode === 'month' || st.mode === 'cum') ? 'time' : 'num', xt: daily && st.mode === 'doy' ? 'Month of the year' : daily && st.mode !== 'year' ? 'Date' : 'Year' }); };
        card._go = () => { try { job(); } catch (e) { console.warn('time series', f.log, e); card.remove(); } };
        if (FK()) FK().attach(card, { name: 'daisy-' + (f.log + '-' + (f.col || f.v)).replace(/[^A-Za-z0-9._-]+/g, '_'), redraw: () => { try { job(); } catch (e) { } } });
        if (io) io.observe(card); else card._go(); };
      // the cards are made a few at a time (a large experiment has up to 120 figures)
      let ix = 0; box._flush = () => { for (; ix < show.length; ix++) makeCard(show[ix], ix); }; const stepC = () => { if (!box.isConnected) return; const e = Math.min(show.length, ix + 6); for (; ix < e; ix++) makeCard(show[ix], ix); if (ix < show.length) setTimeout(stepC, 20); }; stepC();
    }
    const on = (k, ev, fn) => { const e = host.querySelector('[data-ts="' + k + '"]'); if (e) e[ev] = fn; };
    on('pf', 'onchange', e => { st.pf = e.target.value || null; mount(host, c); }); on('cf', 'onchange', e => { st.cf = e.target.value || null; mount(host, c); });
    on('mode', 'onchange', e => { st.mode = e.target.value; mount(host, c); }); on('stat', 'onchange', e => { st.stat = e.target.value; mount(host, c); }); on('log', 'onchange', e => { st.log = e.target.value; draw(); });
    { let tm = null; on('q', 'oninput', e => { st.q = e.target.value; clearTimeout(tm); tm = setTimeout(draw, 300); }); }
    on('zip', 'onclick', async e => { const b = e.target; if (!FK() || !window.DaisyExp) return; b.disabled = true; try { if (box._flush) box._flush(); box.querySelectorAll('.dzfig').forEach(cd => { if (cd._go) { cd._go(); cd._go = null; } }); const fl = await FK().collect(box, 'time-series', 3, (i, n) => { b.textContent = 'Figure ' + i + ' of ' + n + '...'; }); const z = window.DaisyExp.zip(fl), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([z], { type: 'application/zip' })); a.download = SWAFLDate.name('daisy-every-log.zip'); a.click(); } catch (x) { console.warn(x); } b.disabled = false; b.textContent = 'Save these figures (.zip)'; });
    draw();
  }
  // every figure drawn now (before saving the outputs, so that none is missing)
  const drawAll = host => { if (host) host.querySelectorAll('[data-ts="figs"]').forEach(b => { if (b._flush) b._flush(); }); if (host) host.querySelectorAll('details.dzgrp').forEach(d => { d.open = true; }); if (host) host.querySelectorAll('.dzfig').forEach(cd => { if (cd._go) { cd._go(); cd._go = null; } }); };
  return { mount, drawAll, figsOf };
})();
