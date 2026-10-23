// Paper 3, surface irrigation: Example 6.1 of Walker & Skogerboe (1987) run through the surface layer shipped in
// SWAFL Desktop (SIDM.compute in engine.html), for comparison with the textbook values and with the stand-alone
// reference implementation of the textbook procedure (lib/wsmodel.js, used by v_surface.js).
// The shipped layer describes the furrow by a trapezoidal section; the textbook example by the power-law geometry
// (rho1, rho2). To isolate the advance solver, the inlet flow area A0 of the textbook geometry (from wsmodel.js) is
// passed to the shipped solver, with the textbook intake (k, a, f0), length, slope, roughness and sigma_y = 0.77.
// Three runs: as shipped in release 1.1.0 (the steady-intake term of the volume balance uses the iterated advance
// exponent r), with rAdv set explicitly to the textbook r, and with the fixed rAdv = 0.55 of release 1.0.0.
// Writes out/p3_surface_shipped.json.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const WSB = require(path.resolve(__dirname, '../lib') + '/wsmodel.js');
const BOOK = { first: { 0.1: 80.2, 0.075: 198.6, 0.0625: 441.6 }, later: { 0.1: 26.2, 0.075: 36, 0.0625: 46.3, 0.05: 68.2, 0.0375: 143.5 } };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + (process.env.SWAFL_ENGINE || path.resolve(__dirname, '../../../Software/SWAFL_Desktop/app/engine/engine.html')));
  await p.waitForTimeout(2500);
  const sh = { rho1: 0.325, rho2: 2.734 }, n = 0.04, S0 = 0.008, L = 200;
  const K = { first: { k: 0.0028, a: 0.534, f0: 0.00022 }, later: { k: 0.0021, a: 0.331, f0: 0.00015 } };
  const cases = [];
  for (const nm of ['first', 'later']) for (const Q of Object.keys(BOOK[nm]).map(Number)) {
    const ad = WSB.advance({ Q0: Q, L, K: K[nm], n, S0, sh }); cases.push({ nm, Q, K: K[nm], A0: ad.A0, tL_reference: ad.tL, tL_book: BOOK[nm][Q], r: ad.r });
  }
  const rows = await p.evaluate(cs => cs.map(c => { const P = { L: 200, w: 1, q: c.Q, k: c.K.k, A: c.K.a, f0: c.K.f0, Zn: 0.15, A0: c.A0, sy: 0.77, sz: null };
    const R = SIDM.compute(P), Rc = SIDM.compute(Object.assign({}, P, { rAdv: c.r })), R0 = SIDM.compute(Object.assign({}, P, { rAdv: 0.55 }));
    return { irrigation: c.nm, Q: c.Q, A0: c.A0, r: c.r, tL_book: c.tL_book, tL_reference: c.tL_reference, tL_shipped: R.tL, tL_shipped_rAdv_r: Rc.tL, tL_v100: R0.tL,
             err_reference_pct: 100 * (c.tL_reference / c.tL_book - 1), err_shipped_pct: 100 * (R.tL / c.tL_book - 1), err_shipped_rAdv_r_pct: 100 * (Rc.tL / c.tL_book - 1), err_v100_pct: 100 * (R0.tL / c.tL_book - 1) }; }), cases);
  fs.writeFileSync((process.env.SWAFL_MS || '.') + '/out/p3_surface_shipped.json', JSON.stringify(rows, null, 1));
  for (const r of rows) console.log(r.irrigation, r.Q, 'book', r.tL_book, 'reference', r.tL_reference.toFixed(2), 'shipped', r.tL_shipped.toFixed(2), 'err %', r.err_shipped_pct.toFixed(1), '| rAdv=r', r.tL_shipped_rAdv_r.toFixed(2), r.err_shipped_rAdv_r_pct.toFixed(1), '| release 1.0.0', r.err_v100_pct.toFixed(1));
  await b.close();
})();
