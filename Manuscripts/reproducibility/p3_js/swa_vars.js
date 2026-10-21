// Soil-water-atmosphere state and flux variables of SWAFL Desktop for the ten soils (Paper 3, Sections 3 and 5.1, Tables 8-10 and Figure 2).
// Drives the shipped engine in headless Chromium, as the other p3_js scripts do, and writes out/p3_swa_vars.json.
// Reference state: conventional tillage, consolidation 0.005 d-1, bare soil (vapour-flux factor 1.0, capacity 1 mm), rain x1.0,
// no warming, N 100 %, surface method, common trigger -300 cm, sensor 20 cm, cereal rotation (as e1_sens.js).
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.goto('file://' + (process.env.SWAFL_ENGINE || require('path').resolve(__dirname, '../../../Software/SWAFL_Desktop/app/engine/engine.html')));
  await p.waitForTimeout(3000);
  const res = await p.evaluate(() => {
    const S = state;
    const base = soil => {
      S.soil = soil; S.till = 'conv'; S.tcIdx = TC_VALUES.indexOf(0.005); S.vffIdx = VFF_VALUES.length - 1; S.capIdx = CAP_VALUES.indexOf(1.0);
      S.tempIdx = TEMP_VALUES.indexOf(0); S.nIdx = NRATE_VALUES.indexOf(100); S.method = 'M02_Surface'; S.trigIdx = TRIG_VALUES.indexOf(-300);
      S.zIdx = Z_VALUES.indexOf(20); S.rainIdx = RAIN_VALUES.indexOf(1); S.crop = 'cereal'; S.trigMode = 'common';
    };
    const E1 = (vff, rain, ov) => model(vff, rain, ov);
    const soils = DATA.soils.slice().sort();
    const out = [];
    for (const soil of soils) {
      base(soil);
      const m = E1(1.0, 1.0);
      Object.assign(current, m);                                  // Engine 2 reads the Engine 1 result from `current`
      const [a, n] = VGE[soil], tex = DATA.texture[soil];
      const hyd = {
        alpha: a, n, sand: tex.sand, silt: tex.silt, clay: tex.clay, thetaS: soilPhi(soil), thetaR: soilThr(soil), AWC: AWC[soil],
        f300: depletionAt(soil, 300), hStar: invDepletion(soil, 0.45), Se100: vgS(100, VGE[soil]),
      };
      // Engine 2: twenty years of daily bucket simulation
      const sim = computeSim();
      const NY = 20, mean = arr => Array.from(arr).reduce((x, y) => x + y, 0) / arr.length;
      // depth holding 50 % and 90 % of the annual uptake (Eq. 8.7 of the manual), averaged over the years
      const zq = q => { let acc = 0, c = 0; for (let y = 0; y < NY; y++) { const U = new Float64Array(NLAY); for (let d = y * DPY; d < (y + 1) * DPY; d++) for (let i = 0; i < NLAY; i++) U[i] += sim.upt[d][i]; const tot = U.reduce((x, y) => x + y, 0); if (tot <= 0) continue; let cum = 0, k = 0; for (; k < NLAY; k++) { cum += U[k]; if (cum / tot >= q) break; } acc += (k + 1) * DZ; c++; } return c ? acc / c : 0; };
      let nIrr = 0; for (let d = 0; d < ND; d++) if (sim.irr[d] > 0) nIrr++;
      const Uprof = new Array(NLAY).fill(0), Sprof = new Array(NLAY).fill(0); let nS = 0;           // mean annual uptake by layer; mean growing-season relative water content
      for (let d = 0; d < ND; d++) { for (let i = 0; i < NLAY; i++) Uprof[i] += sim.upt[d][i] / NY; const doy = d % DPY; if (doy >= 120 && doy <= 210) { nS++; for (let i = 0; i < NLAY; i++) Sprof[i] += sim.s[d][i]; } }
      for (let i = 0; i < NLAY; i++) Sprof[i] /= nS;
      const e2 = {
        Rmax: sim.Rmax, meanRootMax: mean(sim.yRd), z50: zq(0.5), z90: zq(0.9), kt: sim.kt, dose: sim.dose, fTrig: sim.fTrig,
        irrMean: sim.meanIrr, eventsPerYear: nIrr / NY, uptakeProfile: Uprof, sProfile: Sprof, wetFrontIrr: sim.irrFront, drainUnscaled: sim.meanDrain,
        interceptionUnscaled: mean(sim.yInt), evapUnscaled: mean(sim.yE), transpUnscaled: mean(sim.yT),
      };
      // soil-plant-atmosphere chain (Eqs. 7.1-7.5 of the manual), averaged over crop days of day-of-year 120-210 in all 20 years
      const Sc = dssScale(sim); let nC = 0, sRZ = 0, sLeaf = 0, sRoot = 0, sKr = 0, nClosed = 0;
      for (let y = 0; y < NY; y++) for (let doy = 120; doy <= 210; doy++) {
        const kd = y * DPY + doy; if (sim.cover[kd] <= 0.05) continue;
        const rho = sim.rho[kd]; let sw = 0, sp = 0;
        for (let i = 0; i < NLAY; i++) { const h = Math.max(30, invDepletion(soil, clampN(1 - sim.s[kd][i], 0, 1))); const w = Math.max(0, rho[i]); sw += w; sp += w * h; }
        const hRZ = sw > 1e-9 ? sp / sw : 30, Se = vgS(hRZ, VGE[soil]), mm = 1 - 1 / n, Kr = Math.sqrt(Se) * Math.pow(1 - Math.pow(1 - Math.pow(Se, 1 / mm), mm), 2);
        const F = dssFlux(sim, kd, Sc), E = Math.max(0, F.tr), Rsoil = 0.03 * Math.pow(Math.max(Kr, 0.002), -0.55);
        const psiRZ = -hRZ * MPA_PER_CM, psiRoot = psiRZ - E * Rsoil, psiLeaf = clampN(psiRoot - E * (0.10 + 0.05 + 0.08), -3.2, 0);
        nC++; sRZ += psiRZ; sRoot += psiRoot; sLeaf += psiLeaf; sKr += Kr; if (psiLeaf < -1.6) nClosed++;
      }
      const spac = { psiRZ: sRZ / nC, psiRoot: sRoot / nC, psiLeaf: sLeaf / nC, Kr: sKr / nC, closedShare: nClosed / nC, psiAir: 135.5 * Math.log(clampN(0.66, 0.35, 0.9)), days: nC };
      // two-stage evaporation (Eqs. 9.2-9.5 of the manual) at the season-mean bare-soil demand of 4.2 mm/d
      const th = h => soilTheta(soil, h), hi = 0.25 / a * (1.5 - 0.5 * 1.0), hs = 4 / a, L1 = 40;
      const Q1 = Math.max(2, (th(hi) - th(hs)) * L1 * (0.6 + 0.4 * 1.0)), tau = 0.006 + 0.03 * (tex.clay + tex.silt) / 100, e0 = 4.2;
      const t1 = Q1 / e0, lost12 = 12 <= t1 ? e0 * 12 : Q1 + 2 * e0 * tau * (Math.sqrt(1 + (12 - t1) / tau) - 1);
      const evap = { e0, Q1, tau, t1, lost12, dtheta: clampN(th(hi) - th(1e4), 0.05, 0.4), hi, hs };
      // mulch (wheat straw, vapour-flux factor 0.4, capacity 4 mm) against bare soil, and the fate of the saved water (Eqs. 9.1, 9.6-9.7)
      const capS = CAP_VALUES.indexOf(4.0), bare = E1(1.0, 1.0, { capIdx: capS }), mu = E1(0.4, 1.0, { capIdx: capS });
      const dE = bare.evap - mu.evap, dI = bare.irr - mu.irr, dD = mu.drain - bare.drain, dT = mu.transp - bare.transp, den = Math.max(dE, 0.1);
      const mulch = { dE, dI, dD, dT, fI: Math.max(dI, 0) / den, fD: Math.max(dD, 0) / den, fT: Math.max(dT, 0) / den };
      mulch.fRest = Math.max(0, 1 - mulch.fI - mulch.fD - mulch.fT);
      // regime index (Eq. 9.8) for bare soil and the nitrate cost of drainage (Eq. 10.2) from the +0.1 rain step
      const regime = (m.evap - m.drain) / Math.max(1, m.evap + m.drain);
      const wet = E1(1.0, 1.1), kappaN = Math.abs(wet.drain - m.drain) > 0.5 ? (wet.nl - m.nl) / (wet.drain - m.drain) : null;
      out.push({ soil, label: DATA.soil_labels[soil], hyd, e1: m, e2, spac, evap, mulch, regime, kappaN });
    }
    return out;
  });
  fs.writeFileSync((process.env.SWAFL_MS || '.') + '/out/p3_swa_vars.json', JSON.stringify(res, null, 1));
  console.log(res.map(r => [r.soil.slice(0, 3), r.e1.irr.toFixed(0), r.e2.Rmax.toFixed(0), r.spac.psiLeaf.toFixed(2), r.evap.t1.toFixed(1), r.mulch.fI.toFixed(2)].join(' ')).join('\n'));
  await b.close();
})();
