/* Daisy workbench: Process curves. One place for the functions of Daisy, whatever the process: a piecewise-linear function (PLF, manual 4.1.6) typed in
   or read from a set-up, soil water retention and conductivity (chapter 48), denitrification, and generic response shapes. Pick one, set its parameters,
   see the curves and the numbers, save the picture. Nothing is drawn from stored results. */
'use strict';
(() => {
  const D = DaisyUI, esc = D.esc, $ = id => document.getElementById('dzCv' + id), CA = window.DaisyCalc || window.DaisyCA || null;
  const st = { sel: 'plf', plf: '(0.8 0.0) (0.9 0.2) (1.0 1.0)', xl: 'water-filled pore space', yl: 'factor', hyd: 'M_vG', soil: 'loam', p: {} };
  // ---- piecewise-linear functions
  const pairs = t => { const o = [], re = /\(\s*(-?[\d.]+(?:[eE][+\-]?\d+)?)\s+(-?[\d.]+(?:[eE][+\-]?\d+)?)\s*(?:\[[^\]]*\])?\s*\)/g; let m; while ((m = re.exec(String(t)))) o.push([+m[1], +m[2]]); return o; };
  const plfAt = (P, x) => { if (!P.length) return NaN; if (x <= P[0][0]) return P[0][1]; if (x >= P[P.length - 1][0]) return P[P.length - 1][1]; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); return NaN; };
  const stripC = t => String(t).split('\n').map(l => l.replace(/;.*$/, '')).join('\n');
  function findPlfs(text) {
    const out = [], c = stripC(text), re = /\(\s*([A-Za-z_][\w \-]*?)\s+((?:\(\s*-?[\d.]+(?:[eE][+\-]?\d+)?\s+-?[\d.]+(?:[eE][+\-]?\d+)?\s*(?:\[[^\]]*\])?\s*\)\s*){2,})\)/g; let m;
    while ((m = re.exec(c))) out.push({ name: m[1].trim(), text: m[2].trim() }); return out;
  }
  function sources() {
    const src = {}; if (D.state && D.state.dai) src[D.state.daiName || 'Set-up editor'] = D.state.dai;
    const I = window.DaisyExpUI && window.DaisyExpUI.imported ? window.DaisyExpUI.imported() : {}; Object.keys(I).forEach(k => { if (/\.dai$/i.test(k)) src[k] = I[k]; });
    const all = []; Object.keys(src).forEach(k => findPlfs(src[k]).forEach(f => all.push({ file: k, name: f.name, text: f.text }))); return all;
  }
  // ---- soil hydraulics (chapter 48): retention and conductivity, five of the models
  const HYD = {
    M_vG: { name: 'Mualem, van Genuchten (M_vG)', sec: '48.12', par: [['Theta_sat', 'saturated water content', 'cm3/cm3'], ['Theta_res', 'residual water content', 'cm3/cm3'], ['alpha', 'alpha', '1/cm'], ['n', 'n', ''], ['K_sat', 'saturated conductivity', 'cm/h']],
      f: p => { const m = 1 - 1 / p.n; return { Se: h => h >= 0 ? 1 : Math.pow(1 + Math.pow(p.alpha * -h, p.n), -m), K: Se => p.K_sat * Math.sqrt(Se) * Math.pow(1 - Math.pow(1 - Math.pow(Se, 1 / m), m), 2) }; } },
    M_BaC: { name: 'Mualem, Brooks and Corey (M_BaC)', sec: '48.8', par: [['Theta_sat', 'saturated water content', 'cm3/cm3'], ['Theta_res', 'residual water content', 'cm3/cm3'], ['h_b', 'bubbling pressure (negative)', 'cm'], ['lambda', 'pore-size index', ''], ['K_sat', 'saturated conductivity', 'cm/h']],
      f: p => ({ Se: h => h >= p.h_b ? 1 : Math.pow(p.h_b / h, p.lambda), K: Se => p.K_sat * Math.pow(Se, 2.5 + 2 / p.lambda) }) },
    B_BaC: { name: 'Burdine, Brooks and Corey (B_BaC)', sec: '48.1', par: [['Theta_sat', 'saturated water content', 'cm3/cm3'], ['Theta_res', 'residual water content', 'cm3/cm3'], ['h_b', 'bubbling pressure (negative)', 'cm'], ['lambda', 'pore-size index', ''], ['K_sat', 'saturated conductivity', 'cm/h']],
      f: p => ({ Se: h => h >= p.h_b ? 1 : Math.pow(p.h_b / h, p.lambda), K: Se => p.K_sat * Math.pow(Se, 3 + 2 / p.lambda) }) },
    M_C: { name: 'Mualem, Campbell (M_C)', sec: '48.11', par: [['Theta_sat', 'saturated water content', 'cm3/cm3'], ['h_b', 'air-entry pressure (negative)', 'cm'], ['b', 'Campbell b', ''], ['K_sat', 'saturated conductivity', 'cm/h']],
      f: p => ({ Se: h => h >= p.h_b ? 1 : Math.pow(p.h_b / h, 1 / p.b), K: Se => p.K_sat * Math.pow(Se, 2 * p.b + 2.5) }) },
    B_C: { name: 'Burdine, Campbell (B_C)', sec: '48.3', par: [['Theta_sat', 'saturated water content', 'cm3/cm3'], ['h_b', 'air-entry pressure (negative)', 'cm'], ['b', 'Campbell b', ''], ['K_sat', 'saturated conductivity', 'cm/h']],
      f: p => ({ Se: h => h >= p.h_b ? 1 : Math.pow(p.h_b / h, 1 / p.b), K: Se => p.K_sat * Math.pow(Se, 2 * p.b + 3) }) }
  };
  // typical van Genuchten values by USDA class (Carsel and Parrish, 1988); to be replaced by the user's own
  const CP = { sand: [0.045, 0.43, 0.145, 2.68, 29.7], 'loamy sand': [0.057, 0.41, 0.124, 2.28, 14.59], 'sandy loam': [0.065, 0.41, 0.075, 1.89, 4.42], loam: [0.078, 0.43, 0.036, 1.56, 1.04], 'silt loam': [0.067, 0.45, 0.02, 1.41, 0.45], 'sandy clay loam': [0.1, 0.39, 0.059, 1.48, 1.31], 'clay loam': [0.095, 0.41, 0.019, 1.31, 0.26], 'silty clay loam': [0.089, 0.43, 0.01, 1.23, 0.07], clay: [0.068, 0.38, 0.008, 1.09, 0.2] };
  const hydDefault = (id, soil) => { const c = CP[soil] || CP.loam; if (id === 'M_vG') return { Theta_res: c[0], Theta_sat: c[1], alpha: c[2], n: c[3], K_sat: c[4] };
    const pb = -1 / c[2], lam = Math.max(0.1, c[3] - 1) * 0.6; if (id === 'M_BaC' || id === 'B_BaC') return { Theta_res: c[0], Theta_sat: c[1], h_b: +pb.toFixed(1), lambda: +lam.toFixed(2), K_sat: c[4] }; return { Theta_sat: c[1], h_b: +pb.toFixed(1), b: +(1 / lam).toFixed(2), K_sat: c[4] }; };
  // ---- generic response shapes
  const SHAPES = {
    q10: { name: 'Temperature factor, Q10', par: [['Q10', 'factor for 10 degrees', '', 2], ['Tref', 'reference temperature', 'degC', 10]], x: [-5, 40, 'temperature (degC)'], y: 'factor', f: (x, p) => Math.pow(p.Q10, (x - p.Tref) / 10) },
    logistic: { name: 'Logistic (S-shaped) response', par: [['mid', 'midpoint', '', 0.7], ['steep', 'steepness', '', 12]], x: [0, 1, 'relative water content'], y: 'factor', f: (x, p) => 1 / (1 + Math.exp(-p.steep * (x - p.mid))) },
    mm: { name: 'Michaelis-Menten saturation', par: [['Vmax', 'maximum rate', '', 1], ['Km', 'half-saturation', '', 10]], x: [0, 100, 'concentration'], y: 'rate', f: (x, p) => p.Vmax * x / (p.Km + x) },
    lin: { name: 'Linear ramp between two values', par: [['x0', 'zero below', '', 0.2], ['x1', 'one above', '', 0.8]], x: [0, 1, 'x'], y: 'factor', f: (x, p) => Math.min(1, Math.max(0, (x - p.x0) / (p.x1 - p.x0))) }
  };
  const LIST = [['plf', 'A piecewise-linear function (PLF)', 'Any function that Daisy takes as (x y) pairs: type it or read it from a set-up'], ['hyd', 'Soil water retention and conductivity', 'The hydraulic models of chapter 48'], ['deni', 'Denitrification and N2O', 'The Daisy default denitrification model'], ['shape', 'Response shapes', 'Temperature (Q10), logistic, saturation, ramp']];
  const lbl = t => '<label style="font-size:12px;color:#444">' + t + '</label>';
  const inp = (k, v, w) => '<input data-cv="' + k + '" value="' + esc(String(v)) + '" style="width:' + (w || 72) + 'px">';
  function html() {
    return '<p class="pnote" style="margin:4px 0">Choose a function, set its parameters and see how it responds. It works for any process Daisy describes with a function: the factors of nitrification and denitrification, the effect of soil water on evaporation, the hydraulic properties of a horizon.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px"><div style="flex:1 1 200px;min-width:190px;max-height:430px;overflow-y:auto;border:1px solid #d5dae1;border-radius:6px;background:#fff" id="dzCvList"></div><div style="flex:3 1 380px;min-width:280px" id="dzCvMain"></div></div>';
  }
  const num = k => parseFloat(document.querySelector('[data-cv="' + k + '"]').value);
  function list() { const e = document.getElementById('dzCvList'); e.innerHTML = LIST.map(l => '<button data-cvsel="' + l[0] + '" style="display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #eef0f3;padding:7px 9px;cursor:pointer;font:inherit;background:' + (st.sel === l[0] ? '#e3f0fb' : 'transparent') + '"><b>' + esc(l[1]) + '</b><br><span class="pnote">' + esc(l[2]) + '</span></button>').join(''); e.querySelectorAll('[data-cvsel]').forEach(b => b.onclick = () => { st.sel = b.dataset.cvsel; list(); main(); }); }
  function box(inner) { return inner + '<div class="dzrow"><button class="btn" id="dzCvPng">Picture (PNG)</button><button class="btn" id="dzCvCsv">Table (CSV)</button></div><div id="dzCvOut"></div>'; }
  let csv = '', cvs = null;
  function main() {
    const m = document.getElementById('dzCvMain'); let h = '';
    if (st.sel === 'plf') {
      const found = sources();
      h = box('<div class="dzrow"><div style="flex:1 1 260px"><label style="font-size:12px;color:#444">The function as pairs (x y), as written in a Daisy file</label><br><textarea data-cv="plf" rows="3" style="width:100%;box-sizing:border-box">' + esc(st.plf) + '</textarea></div></div>' +
        '<div class="dzrow">' + lbl('x is') + inp('xl', st.xl, 190) + lbl('y is') + inp('yl', st.yl, 120) + lbl('value of the function at x =') + inp('x0', st.x0 == null ? '' : st.x0, 70) + '<span class="pnote" id="dzCvAt"></span></div>' +
        (found.length ? '<div class="dzrow">' + lbl('Functions found in your set-up') + '<select id="dzCvFound" style="max-width:360px"><option value="">choose...</option>' + found.map((f, i) => '<option value="' + i + '">' + esc(f.name) + ' (' + esc(f.file.replace(/^.*\//, '')) + ')</option>').join('') + '</select></div>' : '<div class="pnote">Load or write a set-up (Set-up editor, or import a folder in Experiments) and the functions in it are listed here.</div>') +
        '<div class="pnote">Outside the first and last x the value stays at the first and last y; between two pairs it is interpolated straight (manual 4.1.6).</div><canvas id="dzCvC"></canvas>');
      m.innerHTML = h; cvs = document.getElementById('dzCvC');
      const draw = () => { const P = pairs(document.querySelector('[data-cv="plf"]').value); st.plf = document.querySelector('[data-cv="plf"]').value; st.xl = document.querySelector('[data-cv="xl"]').value; st.yl = document.querySelector('[data-cv="yl"]').value; const x0 = document.querySelector('[data-cv="x0"]').value; st.x0 = x0;
        if (P.length < 1) { D.chart(cvs, [], {}); document.getElementById('dzCvOut').innerHTML = '<span class="pnote">Write at least one pair, like (0.5 1).</span>'; return; }
        const lo = P[0][0], hi = P[P.length - 1][0], pad = (hi - lo || 1) * 0.15, xs = []; for (let i = 0; i <= 120; i++) xs.push(lo - pad + (hi - lo + 2 * pad) * i / 120); const ys = xs.map(x => plfAt(P, x));
        D.chart(cvs, [{ name: st.yl, x: xs, y: ys }, { name: 'the pairs', x: P.map(p => p[0]), y: P.map(p => p[1]), pts: true, r: 4 }], { xt: st.xl, yt: st.yl, h: 280 }); csv = 'x,y\n' + P.map(p => p[0] + ',' + p[1]).join('\n');
        document.getElementById('dzCvAt').textContent = x0 !== '' && isFinite(+x0) ? '= ' + (+plfAt(P, +x0).toPrecision(5)) : ''; const bad = P.some((p, i) => i && p[0] <= P[i - 1][0]); document.getElementById('dzCvOut').innerHTML = bad ? '<span style="color:#b3261e">The x values must increase from pair to pair.</span>' : ''; };
      m.querySelectorAll('[data-cv]').forEach(i => i.oninput = draw); const f = document.getElementById('dzCvFound'); if (f) f.onchange = () => { const x = found[+f.value]; if (!x) return; document.querySelector('[data-cv="plf"]').value = x.text; document.querySelector('[data-cv="yl"]').value = x.name; draw(); };
      draw();
    } else if (st.sel === 'hyd') {
      const H = HYD[st.hyd], p = Object.assign(hydDefault(st.hyd, st.soil), st.p[st.hyd] || {});
      h = box('<div class="dzrow">' + lbl('Model') + '<select id="dzCvHyd">' + Object.keys(HYD).map(k => '<option value="' + k + '"' + (k === st.hyd ? ' selected' : '') + '>' + esc(HYD[k].name) + '</option>').join('') + '</select>' + lbl('start from the typical values of') + '<select id="dzCvSoil">' + Object.keys(CP).map(k => '<option' + (k === st.soil ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></div>' +
        '<div class="dzrow">' + H.par.map(a => '<div>' + lbl(a[1] + (a[2] ? ' (' + a[2] + ')' : '')) + '<br>' + inp(a[0], p[a[0]]) + '</div>').join('') + '</div><div class="pnote">Daisy reference, section ' + H.sec + '. Typical values by texture: Carsel and Parrish (1988), van Genuchten form; for the Brooks-Corey and Campbell models they are only a starting point, replace them with your own.</div>' +
        '<canvas id="dzCvC"></canvas><canvas id="dzCvC2"></canvas>');
      m.innerHTML = h; cvs = document.getElementById('dzCvC');
      const draw = () => { const q = {}; H.par.forEach(a => { q[a[0]] = num(a[0]); }); st.p[st.hyd] = q; const F = H.f(q), res = q.Theta_res || 0, hs = [], th = [], K = [], pf = [], rows = ['pF,h_cm,theta,K_cm_per_h'];
        for (let i = 0; i <= 120; i++) { const p = -0.5 + 6.5 * i / 120, hh = -Math.pow(10, p), Se = F.Se(hh), t = res + (q.Theta_sat - res) * Se, k = F.K(Se); pf.push(p); th.push(t); K.push(Math.log10(Math.max(k, 1e-30))); rows.push([p.toFixed(3), hh.toExponential(4), t.toFixed(5), k.toExponential(4)].join(',')); }
        D.chart(cvs, [{ name: 'water content', x: pf, y: th }], { xt: 'pF = log10(-h in cm)', yt: 'water content (cm3/cm3)', h: 240 }); D.chart(document.getElementById('dzCvC2'), [{ name: 'log10 K', x: pf, y: K, color: '#D55E00' }], { xt: 'pF = log10(-h in cm)', yt: 'log10 conductivity (cm/h)', h: 240 }); csv = rows.join('\n');
        const fc = res + (q.Theta_sat - res) * F.Se(-100), wp = res + (q.Theta_sat - res) * F.Se(-15000); document.getElementById('dzCvOut').innerHTML = '<table class="dzt"><tr><td>Water content at -100 cm (about field capacity)</td><td>' + fc.toFixed(3) + '</td></tr><tr><td>Water content at -15 000 cm (wilting point)</td><td>' + wp.toFixed(3) + '</td></tr><tr><td>Plant-available water between the two</td><td>' + (fc - wp).toFixed(3) + ' cm3/cm3 = ' + ((fc - wp) * 100).toFixed(1) + ' mm per 100 cm</td></tr></table>'; };
      m.querySelectorAll('[data-cv]').forEach(i => i.oninput = draw); document.getElementById('dzCvHyd').onchange = ev => { st.hyd = ev.target.value; main(); }; document.getElementById('dzCvSoil').onchange = ev => { st.soil = ev.target.value; st.p = {}; main(); }; draw();
    } else if (st.sel === 'deni') {
      const A = [['Theta', 'water content', 0.33], ['Theta_sat', 'saturation', 0.43], ['NO3', 'nitrate (g N/cm3 soil)', 3e-6], ['rho_b', 'bulk density (g/cm3)', 1.4], ['CO2_C', 'CO2-C', 1e-7], ['CO2_C_fast', 'fast CO2-C', 5e-8], ['h', 'pressure head (cm)', -60], ['fT', 'temperature factor', 1]];
      h = box('<p class="pnote">The Daisy denitrification function (from python-extensions): water-filled pore space, carbon dioxide production and nitrate set the N2O and N2 emission.</p><div class="dzrow">' + A.map(a => '<div>' + lbl(a[1]) + '<br>' + inp(a[0], a[2], 90) + '</div>').join('') + '</div><canvas id="dzCvC"></canvas>');
      m.innerHTML = h; cvs = document.getElementById('dzCvC');
      const draw = () => { const a = {}; A.forEach(x => { a[x[0]] = num(x[0]); }); const C = window.DaisyCalc; if (!C || !C.denitrification) { document.getElementById('dzCvOut').innerHTML = 'The denitrification function is not loaded.'; return; } const y = C.denitrification(a), w = [], n2o = [], n2 = [], rows = ['wfps,N2O,N2'];
        for (let t = 0.3 * a.Theta_sat; t <= a.Theta_sat + 1e-9; t += a.Theta_sat * 0.01) { const r = C.denitrification(Object.assign({}, a, { Theta: t })); w.push(t / a.Theta_sat); n2o.push(r['N2O-Denit']); n2.push(r['N2-Denit']); rows.push([w[w.length - 1], r['N2O-Denit'], r['N2-Denit']].join(',')); }
        D.chart(cvs, [{ name: 'N2O', x: w, y: n2o }, { name: 'N2', x: w, y: n2 }], { xt: 'water-filled pore space', yt: 'emission', h: 240, zero: true }); csv = rows.join('\n');
        document.getElementById('dzCvOut').innerHTML = '<table class="dzt" style="max-width:420px">' + [['Water-filled pore space', y.wfps], ['Water factor', y.fw], ['Potential denitrification', y['Potential-Denit']], ['Actual denitrification', y['Actual-Denit']], ['N2O emission', y['N2O-Denit']], ['N2 emission', y['N2-Denit']]].map(r => '<tr><td>' + r[0] + '</td><td>' + D.kit.fmt(r[1], 5) + '</td></tr>').join('') + '</table>'; };
      m.querySelectorAll('[data-cv]').forEach(i => i.oninput = draw); draw();
    } else {
      const S = SHAPES[st.shape || 'q10']; st.shape = st.shape || 'q10'; const p0 = Object.assign({}, (st.sp || {})[st.shape] || {});
      h = box('<div class="dzrow">' + lbl('Shape') + '<select id="dzCvShape">' + Object.keys(SHAPES).map(k => '<option value="' + k + '"' + (k === st.shape ? ' selected' : '') + '>' + esc(SHAPES[k].name) + '</option>').join('') + '</select>' + S.par.map(a => '<div>' + lbl(a[1] + (a[2] ? ' (' + a[2] + ')' : '')) + '<br>' + inp(a[0], p0[a[0]] != null ? p0[a[0]] : a[3]) + '</div>').join('') + '</div><canvas id="dzCvC"></canvas>');
      m.innerHTML = h; cvs = document.getElementById('dzCvC');
      const draw = () => { const q = {}; S.par.forEach(a => { q[a[0]] = num(a[0]); }); st.sp = st.sp || {}; st.sp[st.shape] = q; const xs = [], ys = []; for (let i = 0; i <= 120; i++) { const x = S.x[0] + (S.x[1] - S.x[0]) * i / 120; xs.push(x); ys.push(S.f(x, q)); } D.chart(cvs, [{ name: S.y, x: xs, y: ys }], { xt: S.x[2], yt: S.y, h: 260 }); csv = 'x,y\n' + xs.map((x, i) => x + ',' + ys[i]).join('\n'); document.getElementById('dzCvOut').innerHTML = '<span class="pnote">To use a curve like this in Daisy, write a few of its points as a PLF (first function above).</span>'; };
      m.querySelectorAll('[data-cv]').forEach(i => i.oninput = draw); document.getElementById('dzCvShape').onchange = ev => { st.shape = ev.target.value; main(); }; draw();
    }
    document.getElementById('dzCvPng').onclick = () => D.kit.savePng(cvs, 'daisy-curve.png'); document.getElementById('dzCvCsv').onclick = () => D.download('daisy-curve.csv', csv, 'text/csv');
  }
  D.register('deni', { html, bind() { list(); main(); } });
})();
