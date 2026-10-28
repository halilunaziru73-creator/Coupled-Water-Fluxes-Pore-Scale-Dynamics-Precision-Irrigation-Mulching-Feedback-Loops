/* SWAFL 1.1 layer P1 Deterministic phenotyping (part 5): the season film.
   Both plants and their roots at eight dates from sowing to maturity, with the time series of the plant below them, and a play button
   that grows the plant from the first day to the last. Everything is read from the model run of the layer. */
'use strict';
(function () {
  const U = window.PHUI; if (!U) return;
  const { BASE, PH, P, K, chip, day, dateOf, todayMark, R, N, NL, ZMAX, RN, RNc, scrub, seriesVals, regimeShade, drawRoots, drawShoot, leafColor } = U;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), fmt = K.fmt, GRID = '#E6E2D6';
  const note = (txt, x, y, w, o) => sidWrap(txt, x, y, w, Object.assign({ s: 9.5, c: MUTE }, o || {}), 12.5);
  const endFrame = (x, y0, y, w) => { ctx.strokeStyle = '#B9B4A6'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y0 + 0.5, w - 1, y - y0); };
  const STAGES = 8, SHH = 150, ROH = 74;
  const ROWS = [
    { t: 'Plant height', u: 'cm', f: r => r.H }, { t: 'Projected shoot area', u: 'cm²', f: r => r.PSA },
    { t: 'Green leaf area index', u: 'm²/m²', f: r => r.LAIg }, { t: 'Root depth', u: 'cm', f: r => r.Rdepth },
    { t: 'Leaf water content', u: '%', f: r => r.RWC, s: 100 }, { t: 'Soil water of the root zone', u: '%', f: r => Array.from(r.store, v => 100 * v / r.awcT) }
  ];
  function thumbs(res, tr, wid, view) {
    const sp = P.SP[PH.sp], key = [PH.key, tr, view, Math.round(PH.rot / 0.26), Math.round(wid)].join('|'); PH.film = PH.film || {};
    if (PH.film[tr] && PH.film[tr].key === key) return PH.film[tr].cv;
    const cv = [], s = (SHH - 12) / (Math.max(R('ww').H[N - 1], R('dr').H[N - 1], 10) * 1.08);
    for (let i = 0; i < STAGES; i++) {
      const dd = Math.round(i * (N - 1) / (STAGES - 1)), el = document.createElement('canvas'); el.width = Math.ceil(wid); el.height = SHH + ROH; const c = el.getContext('2d');
      const sk = c.createLinearGradient(0, 0, 0, SHH); sk.addColorStop(0, '#F3F6EE'); sk.addColorStop(1, '#E0E8D3'); c.fillStyle = view === 'thermal' ? '#F0F2F6' : sk; c.fillRect(0, 0, el.width, SHH);
      const sg = c.createLinearGradient(0, SHH, 0, SHH + ROH); sg.addColorStop(0, '#5A4630'); sg.addColorStop(1, '#3B2E21'); c.fillStyle = sg; c.fillRect(0, SHH, el.width, ROH);
      const xc = el.width / 2; drawShoot(res, dd, xc, SHH, s, view, PH.rot, c);
      const CW = Math.min(el.width - 6, 70); drawRoots(res, dd, xc, SHH + 1, (CW / 2 - 2) / res.Rpot, (ROH - 4) / ZMAX, PH.rot, 'rgb', c);
      c.strokeStyle = '#6B5B3E'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, SHH + 0.5); c.lineTo(el.width, SHH + 0.5); c.stroke();
      cv.push({ el, dd });
    }
    PH.film[tr] = { key, cv }; return cv;
  }
  function grid(rows, x, y, w, cols, gh) {
    const gw = (w - (cols - 1) * 22) / cols, a = R('ww'), b = R('dr'), d = day();
    rows.forEach((row, i) => {
      const gx = x + (i % cols) * (gw + 22), gy = y + 18 + Math.floor(i / cols) * (gh + 34), va = seriesVals(row, a), vb = seriesVals(row, b);
      let lo = Infinity, hi = -Infinity; [va, vb].forEach(q => q.forEach(v => { if (isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } })); if (!isFinite(lo)) { lo = 0; hi = 1; } lo = Math.min(0, lo); hi = hi + (hi - lo) * 0.06 + 1e-9;
      const X = U.xmap(gx, gw), Y = v => gy + gh - (v - lo) / (hi - lo) * gh;
      regimeShade().forEach(s => { ctx.fillStyle = s[2]; ctx.globalAlpha = 0.5; ctx.fillRect(X(s[0]), gy, X(s[1]) - X(s[0]), gh); ctx.globalAlpha = 1; });
      ctx.strokeStyle = GRID; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx, gy + gh + 0.5); ctx.lineTo(gx + gw, gy + gh + 0.5); ctx.moveTo(gx, gy + 0.5); ctx.lineTo(gx + gw, gy + 0.5); ctx.stroke();
      [[va, '#1B1F23'], [vb, '#D93025']].forEach(([q, c]) => { ctx.strokeStyle = c; ctx.lineWidth = 1.8; ctx.beginPath(); for (let k = 0; k <= d; k++) { k ? ctx.lineTo(X(k), Y(q[k])) : ctx.moveTo(X(k), Y(q[k])); } ctx.stroke(); ctx.globalAlpha = 0.28; ctx.beginPath(); for (let k = d; k < N; k++) { k > d ? ctx.lineTo(X(k), Y(q[k])) : ctx.moveTo(X(k), Y(q[k])); } ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(d), Y(q[d]), 3, 0, 7); ctx.fill(); });
      ctx.strokeStyle = '#2E7DE8'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(d) + 0.5, gy); ctx.lineTo(X(d) + 0.5, gy + gh); ctx.stroke(); ctx.setLineDash([]);
      const dp = hi - lo < 5 ? 2 : (hi - lo < 50 ? 1 : 0); T(row.t + ' (' + row.u + ')', gx, gy - 5, { s: 9, b: true }); T(fmt(va[d], dp) + ' / ' + fmt(vb[d], dp), gx + gw, gy - 5, { s: 9, b: true, a: 'right' });
      T(fmt(hi, dp), gx - 3, gy + 8, { s: 7.5, c: MUTE, a: 'right' }); T(fmt(lo, dp), gx - 3, gy + gh, { s: 7.5, c: MUTE, a: 'right' });
      if (U.yearAxis()) U.axisDates(X, gy + gh, gx, gw); else { T(dateOf(0), gx, gy + gh + 11, { s: 7.5, c: MUTE }); T(dateOf(N - 1), gx + gw, gy + gh + 11, { s: 7.5, c: MUTE, a: 'right' }); }
      todayMark(X, gy, gh); scrub(gx, gy, gw, gh, X.sx, X.sw);
    });
    return y + 18 + Math.ceil(rows.length / cols) * (gh + 34);
  }
  function drawFilm(y) {
    const w = W - 32, cx = 16, y0 = y, d = day(), a = R('ww'), b = R('dr'); K.frame(cx, y, w, 24, 'Season film, from sowing to maturity', 'day ' + d + ' after emergence (' + dateOf(d) + ')'); y += 30;
    if (!a || !b) return y + 10;
    let xx = cx + 10;
    xx += chip(xx, y, 'Start', false, () => { PH.anim.on = false; play.on = false; play.t = 0; }, 'back to the first day');
    xx += chip(xx, y, PH.anim.on ? 'Pause' : (play.t >= 0.999 ? 'Play again' : 'Play the season'), PH.anim.on, () => { if (PH.anim.on) PH.anim.on = false; else { if (play.t >= 0.999) play.t = 0; PH.anim.on = true; PH.anim.t0 = performance.now(); play.on = false; } }, 'grow the plants from the first day to the last');
    [['Slow', 28], ['Normal', 14], ['Fast', 6]].forEach(q => { xx += chip(xx, y, q[0], PH.anim.dur === q[1], () => { PH.anim.dur = q[1]; }, 'the whole season in ' + q[1] + ' seconds'); });
    y += 30; const gap = 4, wid = (w - 20 - (STAGES - 1) * gap) / STAGES, view = PH.view === 'thermal' ? 'thermal' : 'rgb', near = Math.round(d / (N - 1) * (STAGES - 1));
    ['ww', 'dr'].forEach(tr => {
      const res = R(tr), col = tr === 'ww' ? '#1B1F23' : '#D93025'; ctx.fillStyle = col; ctx.fillRect(cx + 10, y, 4, 15); T(tr === 'ww' ? RNc() : 'Drought', cx + 20, y + 12, { s: 10.5, b: true, c: col });
      T(tr === 'ww' ? (res.tr === 'pj' ? 'irrigated ' + fmt(res.totals.Ig) + ' mm' : res.tr === 'rf' ? 'rain only' : 'held wet') : 'water held at ' + PH.dr.sev + ' % of the plant-available water for ' + PH.dr.len + ' days from day ' + PH.dr.onset, cx + w - 10, y + 12, { s: 9, c: MUTE, a: 'right' });
      y += 20; const cvs = thumbs(res, tr, wid, view);
      cvs.forEach((q, i) => { const x0 = cx + 10 + i * (wid + gap); ctx.drawImage(q.el, x0, y); ctx.strokeStyle = i === near ? '#2E7DE8' : '#B9B4A6'; ctx.lineWidth = i === near ? 2 : 1; ctx.strokeRect(x0 + 0.5, y + 0.5, wid - 1, SHH + ROH - 1);
        T('day ' + q.dd, x0 + 2, y + SHH + ROH + 11, { s: 8.5, b: i === near }); T(dateOf(q.dd), x0 + wid - 2, y + SHH + ROH + 11, { s: 8, c: MUTE, a: 'right' });
        hot(x0, y, wid, SHH + ROH, () => { PH.anim.on = false; play.on = false; play.t = q.dd / (N - 1); }, 'go to day ' + q.dd + ' (' + dateOf(q.dd) + ')'); });
      y += SHH + ROH + 22;
    });
    T('Time series of the same plants (black ' + RN() + ', red drought; the line is solid up to the day shown). Click or drag on any chart to move the day.', cx + 10, y + 4, { s: 9, c: MUTE }); y += 14;
    y = grid(ROWS, cx + 36, y + 4, w - 52, 2, 56);
    y += 6; endFrame(cx, y0, y, w); return y + 10;
  }
  const it = BASE.findIndex(q => q.id === 'twin'); BASE.splice(it + 1, 0, { id: 'film', t: 'Season film, from sowing to maturity', s: 'the plants and roots at eight dates, with the time series below', fn: drawFilm });
})();
