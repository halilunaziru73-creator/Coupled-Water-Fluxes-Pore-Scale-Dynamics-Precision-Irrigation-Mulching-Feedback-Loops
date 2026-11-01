/* Why a Daisy run gave no results: the message of Daisy read into its root cause, in plain words.
   DaisyDiag.explain(text, files) finds the error lines of Daisy (file:line:column: message (error)), sorts the cause into a kind
   (a name Daisy does not know, a numerical problem of the solver, a value out of range, a file that is missing, the weather, a syntax
   error, Daisy stopped without a message), finds the line in the set-up files of the run and shows it with the lines around it, and says
   what to do. DaisyDiag.panel(fails) groups the runs that failed for the same reason, so one cause is explained once. */
'use strict';
window.DaisyDiag = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KINDS = [
    { k: 'unknown', re: /Unknown '([^']+)' model '([^']+)'/i, title: 'Daisy does not know a name used in the set-up',
      cause: m => 'The set-up uses the ' + m[1] + ' model "' + m[2] + '", but none of the files of this run defines a ' + m[1] + ' of that name. This happens when a file of the Daisy library or of the Daisy samples is taken into the run and still refers to definitions of its own original run (its logs, its crops, its columns), or when a name is mistyped.',
      fix: (m, w) => (w && /sample|test-|\.dai$/i.test(w.file) ? 'The file ' + w.file + ' comes from the Daisy samples. SWAFL now takes only the definitions a run needs from such a file (its own logs are left out), so run the experiment again. ' : '') + 'If it remains: choose another value for the input that uses this file (for example another soil), or add the file that defines "' + m[2] + '" with Import in the Experiments tab.' },
    { k: 'numerical', re: /(did not converge|didn'?t converge|no convergence|convergence|too many iterations|max(imum)? iterations|singular|NaN|not a number|overflow|underflow|time ?step (too|became) small|negative (water|content|concentration|pressure)|water balance error|mass balance error|Richard)/i, title: 'A numerical problem: the solver of Daisy could not find a solution',
      cause: () => 'Daisy solves the movement of water (the Richards equation) and of solutes step by step; here the solution did not settle (no convergence, a value that is not a number, or a negative amount of water or solute). It is nearly always caused by an extreme combination of inputs: soil hydraulic values far from the usual (a very large K_sat or alpha, an n close to 1, a very small saturated water content), very thin or very contrasting layers, or a very large irrigation flux on a slowly conducting soil.',
      fix: () => 'Bring the extreme values of the experiment closer to the typical ones (see *more* under each row: the typical values are there), or remove the most extreme level; lower the irrigation flux or the amount per irrigation; for soil hydraulic factors keep alpha and K_sat within 0.1 to 10 times and n above 1.1. The other runs are not affected.' },
    { k: 'range', re: /(out of range|outside (the )?(range|bounds)|must be (greater|less|positive|non-?negative|between|at least|at most)|should be (greater|less|positive)|bound|too (large|small|big|high|low))/i, title: 'A value outside what Daisy accepts',
      cause: () => 'A number in the set-up is outside the range Daisy allows for that parameter (for example a negative amount, a fraction above 1, or a depth below the bottom of the soil).',
      fix: () => 'Look at the line shown below: it names the parameter. Change the level of the input that writes it (the rows of What will be tested) to a value within the typical range.' },
    { k: 'missing', re: /(Open '([^']+)' failed|cannot open|can't open|No such file|not found|file .* missing|is missing)/i, title: 'A file of the set-up is missing',
      cause: m => 'Daisy could not open a file that the set-up reads' + (m[2] ? ' (' + m[2] + ')' : '') + '. The run folder is incomplete: a weather file, a soil file or a file of the library was not copied, or it was moved or deleted while the run was waiting.',
      fix: () => 'Run the experiment again (the files are copied again). If it remains, check that the weather and soil chosen in My data still exist, and that the folder SWAFL runs next to Daisy can be written.' },
    { k: 'weather', re: /(weather|\.dwf|climate|precipitation data|global radiation|missing (date|data))/i, title: 'A problem with the weather',
      cause: () => 'The weather file does not cover the years of the run, has gaps, or has a column Daisy cannot read.',
      fix: () => 'Choose years inside the period of the weather (Years from ... to ... of the plan), or another weather in Weather for all Daisy runs.' },
    { k: 'defined', re: /already defined|defined twice|redefin/i, title: 'A name is defined twice',
      cause: () => 'Two files of the run define something with the same name (two crops, chemicals or horizons called the same).',
      fix: () => 'Run again (SWAFL leaves out the second definition); if it remains, do not combine two library entries that carry the same name.' },
    { k: 'syntax', re: /(expected|unexpected|unbalanced|parse error|syntax|unknown (attribute|parameter)|not a valid|bad (value|syntax))/i, title: 'Daisy could not read a line of the set-up',
      cause: () => 'A line of a set-up file is not in the form Daisy expects: a parameter Daisy does not know, a missing bracket, a text where a number is needed, or a unit Daisy cannot convert.',
      fix: () => 'Look at the line shown below. If the file is one you imported or edited, correct it in the Set-up editor; if it comes from SWAFL, run again or remove the input that writes it.' }];
  function locate(text) { const m = String(text).match(/([^\s:'"]+\.(?:dai|dwf|dlf)):(\d+):(\d+):\s*([^\n]*\(error\)[^\n]*|[^\n]*)/); return m ? { file: m[1], line: +m[2], col: +m[3], msg: m[4] } : null; }
  function context(w, files) {
    if (!w || !files) return null; const base = w.file.split(/[\\/]/).pop(), key = Object.keys(files).find(k => k.split(/[\\/]/).pop() === base); if (!key || typeof files[key] !== 'string') return null;
    const L = files[key].split(/\r?\n/), a = Math.max(0, w.line - 4), b = Math.min(L.length, w.line + 3); return { key, text: files[key], lines: L.slice(a, b).map((t, i) => ({ n: a + i + 1, t })) }; }
  // the error of one run: { kind, title, msg, cause, fix, where, ctx }
  function explain(raw, files, code) {
    const text = String(raw || ''), errs = text.split(/\r?\n/).filter(l => /\(error\)|error:|^error/i.test(l)), first = errs[0] || '', w = locate(first || text);
    let K = null, m = null; for (const q of KINDS) { const mm = (first || text).match(q.re); if (mm) { K = q; m = mm; break; } }
    if (!K) for (const q of KINDS) { const mm = text.match(q.re); if (mm && q.k === 'numerical') { K = q; m = mm; break; } }
    if (!first && !K) return { kind: 'stopped', title: 'Daisy stopped without a message', msg: 'code ' + code, cause: 'Daisy ended (code ' + code + ') without writing an error: it was stopped from outside (the run was cancelled, the computer ran short of memory, an antivirus blocked it, or a file of the run folder was locked).', fix: 'Run this run again alone (Run one at a time); close programs that use much memory; if an antivirus is active, allow the Daisy folder.', where: null, ctx: null, n: errs.length };
    if (!K) K = { k: 'other', title: 'Daisy reported an error', cause: () => 'Daisy stopped at the line shown below with the message above.', fix: () => 'Read the line below; the Daisy reference (tab Reference manual) explains every parameter. Run again after changing the input that writes it.' };
    return { kind: K.k, title: K.title, msg: (first || text.split(/\r?\n/).find(l => l.trim()) || '').trim(), cause: K.cause(m || [], w), fix: K.fix(m || [], w), where: w, ctx: context(w, files), n: errs.length, all: errs.slice(0, 8) };
  }
  // the panel: one block for every cause, with the runs that share it
  function panel(fails) {
    if (!fails || !fails.length) return ''; const G = new Map(); fails.forEach(f => { const e = f.e, key = e.kind + '|' + String(e.msg).replace(/\br\d+\b/g, '').replace(/\d+(\.\d+)?/g, '#'); let g = G.get(key); if (!g) G.set(key, g = { e, runs: [] }); g.runs.push(f); });
    let h = '<div class="dzpan" style="border-left:5px solid #b3261e"><h3 style="margin:0 0 4px;color:#b3261e">Why ' + fails.length + ' run' + (fails.length === 1 ? '' : 's') + ' gave no results</h3><p class="pnote" style="margin:0 0 6px">' + G.size + ' cause' + (G.size === 1 ? '' : 's') + '. The other runs are complete and are drawn below.</p>';
    let gi = 0; G.forEach(g => { const e = g.e, w = e.where; gi++;
      h += '<details' + (gi === 1 ? ' open' : '') + ' class="dzgrp" style="margin:6px 0"><summary><b>' + esc(e.title) + '</b> <span class="pnote">' + g.runs.length + ' run' + (g.runs.length === 1 ? '' : 's') + ': ' + esc(g.runs.slice(0, 12).map(r => r.id).join(', ')) + (g.runs.length > 12 ? ' ...' : '') + '</span></summary><div style="padding:6px 10px">' +
        '<p style="margin:2px 0"><b>Daisy said:</b> <code>' + esc(e.msg) + '</code></p>' + (w ? '<p style="margin:2px 0"><b>Where:</b> the file <code>' + esc(w.file) + '</code>, line ' + w.line + ', column ' + w.col + '</p>' : '') +
        (e.ctx ? '<pre style="background:#fff;border:1px solid #c0c0c0;padding:4px 8px;font:12px Consolas,monospace;overflow:auto;margin:4px 0">' + e.ctx.lines.map(l => '<span style="color:#808080">' + String(l.n).padStart(5) + '</span>  ' + (l.n === w.line ? '<span style="background:#ffe0e0">' + esc(l.t) + '</span>\n' + ' '.repeat(7 + Math.max(0, w.col - 1)) + '<span style="color:#b3261e;font-weight:bold">^ here</span>' : esc(l.t))).join('\n') + '</pre>' : '') +
        '<p style="margin:4px 0"><b>Root cause:</b> ' + esc(e.cause) + '</p><p style="margin:4px 0"><b>What to do:</b> ' + esc(e.fix).replace(/\*([^*]+)\*/g, '<i>$1</i>') + '</p>' +
        '<p class="pnote" style="margin:4px 0">The runs: ' + g.runs.map(r => '<b>' + esc(r.id) + '</b> ' + esc(r.label || '')).join('; ') + '</p>' + (e.all && e.all.length > 1 ? '<details><summary class="pnote">Every error line of Daisy for the first of these runs (' + e.all.length + ')</summary><pre style="font:11px Consolas,monospace;white-space:pre-wrap">' + esc(e.all.join('\n')) + '</pre></details>' : '') + '</div></details>'; });
    return h + '</div>';
  }
  return { explain, panel, KINDS };
})();
