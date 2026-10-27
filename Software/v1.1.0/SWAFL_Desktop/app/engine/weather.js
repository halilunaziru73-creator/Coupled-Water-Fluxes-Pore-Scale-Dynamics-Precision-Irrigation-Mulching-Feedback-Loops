/* SWAFL 1.1 weather: import a daily weather file (CSV, TXT, XLSX, Daisy DWF, DLF or DAI) or fetch the daily weather of a
   location online (the last twenty years and the forecast), and run every part of the program on it:
   - the daily model gets the rain of each day and the evaporative demand of each day (reference ET);
   - the crop water balance gets the same daily rain and reference ET;
   - the annual model gets the rainfall and the demand of the new climate through its rainfall and warming controls
     (the nearest simulated steps; the log says when the climate lies outside the simulated range).
   If nothing is imported, or the online weather cannot be reached, the recorded weather of the simulations is used. */
'use strict';
(function () {
  const W = window; W.WXD = null; W.WXSRC = { file: null, online: null };
  const NYRx = typeof NYR !== 'undefined' ? NYR : 20, DPYx = typeof DPY !== 'undefined' ? DPY : 365;
  const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const doyOf = d => { const y = d.getUTCFullYear(); let k = Math.round((d - Date.UTC(y, 0, 1)) / 864e5); if (isLeap(y) && k >= 59) { if (k === 59) return -1; k -= 1; } return k; };   // 0..364, -1 for 29 Feb
  const num = v => { if (v == null) return NaN; if (typeof v === 'number') return v; const s = String(v).trim().replace(',', '.'); return s === '' ? NaN : +s; };

  // ------------------------------------------------------------------ reading files
  function toDate(row, C) {
    if (C.date != null) {
      const v = row[C.date];
      if (v instanceof Date) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
      if (typeof v === 'number' && v > 20000 && v < 80000) return new Date(Date.UTC(1899, 11, 30) + v * 864e5);           // spreadsheet serial day
      const s = String(v).trim(); let m;
      if ((m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      if ((m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/))) { const a = +m[1], b = +m[2]; return a > 12 ? new Date(Date.UTC(+m[3], b - 1, a)) : new Date(Date.UTC(+m[3], (C.mdy ? a : b) - 1, C.mdy ? b : a)); }
      if ((m = s.match(/^(\d{4})(\d{2})(\d{2})$/))) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      return null;
    }
    if (C.year != null && C.month != null && C.day != null) { const y = num(row[C.year]), mo = num(row[C.month]), d = num(row[C.day]); return isFinite(y + mo + d) ? new Date(Date.UTC(y, mo - 1, d)) : null; }
    if (C.year != null && C.doy != null) { const y = num(row[C.year]), j = num(row[C.doy]); return isFinite(y + j) ? new Date(Date.UTC(y, 0, j)) : null; }
    return null;
  }
  function findCols(head) {
    const h = head.map(x => String(x == null ? '' : x).toLowerCase().replace(/[\s_\-()[\]]+/g, ' ').trim()), C = {}, f = (k, re) => { if (C[k] != null) return; const i = h.findIndex(x => re.test(x)); if (i >= 0) C[k] = i; };
    f('date', /^(date|datetime|time|day date|valid date)\b/); f('year', /^(year|yr|yyyy)\b/); f('month', /^(month|mon|mo|mm)\b/); f('day', /^(day|mday|dd|dom)\b/); f('doy', /^(doy|jday|julian|day of year)\b/);
    f('et0', /(et0|eto|et 0|ref.*ev|refevap|reference ev|fao.*ev|pet\b|potential ev)/); f('p', /(precip|rain|prcp|ppt|^p\b|^p mm)/);
    f('tmax', /(t ?max|max.*temp|temp.*max|tx\b)/); f('tmin', /(t ?min|min.*temp|temp.*min|tn\b)/); f('tmean', /(air ?temp|t ?mean|tavg|t ?avg|mean.*temp|^temp|^t\b)/); f('rad', /(rad|srad|globrad|solar)/);
    if (C.day != null && C.day === C.date) delete C.day;
    C.pInch = C.p != null && /\bin\b|inch/.test(h[C.p]);
    return C;
  }
  function fromTable(rows, name) {
    rows = rows.filter(r => r && r.some(v => v !== '' && v != null));
    let hi = rows.findIndex(r => r.filter(v => typeof v === 'string' && /[a-z]/i.test(v)).length >= 2);
    if (hi < 0 || hi > 40) throw new Error((rows.length < 2 ? 'the file holds no readable table (is it a real spreadsheet or text file?); ' : '') + 'no header row with column names (date, rain or precipitation, reference ET ...) was found');
    const C = findCols(rows[hi]); let start = hi + 1;
    if (rows[start] && rows[start].every(v => typeof v === 'string' && !/^\s*-?\d/.test(v))) start++;   // a units row
    if (C.p == null) throw new Error('no rainfall column (precipitation, rain, P) was found');
    if (C.date == null && !(C.year != null && (C.month != null && C.day != null || C.doy != null))) throw new Error('no date columns (date, or year, month and day) were found');
    const out = []; for (let i = start; i < rows.length; i++) { const r = rows[i], d = toDate(r, C); if (!d || isNaN(d)) continue; let P = num(r[C.p]); if (C.pInch) P *= 25.4; out.push({ d, P: isFinite(P) ? Math.max(0, P) : NaN, ET0: C.et0 != null ? num(r[C.et0]) : NaN, tmax: C.tmax != null ? num(r[C.tmax]) : NaN, tmin: C.tmin != null ? num(r[C.tmin]) : NaN, tmean: C.tmean != null ? num(r[C.tmean]) : NaN, rad: C.rad != null ? num(r[C.rad]) : NaN }); }
    const head = rows[hi].map(String); return { rows: out, cols: Object.keys(C).filter(k => typeof C[k] === 'number').map(k => k + ' = "' + head[C[k]] + '"'), name };
  }
  function splitText(txt) {
    const lines = txt.replace(/\r/g, '').split('\n'); const sample = lines.slice(0, 60).join('\n');
    const delim = (sample.match(/\t/g) || []).length > 10 ? '\t' : (sample.match(/;/g) || []).length > 10 ? ';' : (sample.match(/,/g) || []).length > 10 ? ',' : /\s+/;
    return lines.map(l => (l.trim() === '' ? [] : (delim instanceof RegExp ? l.trim().split(delim) : l.split(delim)).map(x => x.trim().replace(/^"|"$/g, ''))));
  }
  function fromDaisy(txt, name) {
    // Daisy weather (dwf) and log (dlf) files: header lines, a line of dashes, then column names, often a units line, then data
    const lines = txt.replace(/\r/g, '').split('\n'); let di = lines.findIndex(l => /^-{8,}/.test(l.trim()));
    if (di < 0) { const wf = Array.from(new Set((txt.match(/"[^"\n]*\.(dwf|csv|dlf)"/gi) || []).map(x => x.replace(/"/g, '').split(/[\\/]/).pop())));
      throw new Error(wf.length ? 'this setup file holds no weather itself; it uses the weather file ' + wf.join(', ') + ': import that file' : 'this file has no data table (a .dai setup file names its weather file: import that .dwf file, or a log file of daily weather)'); }
    let hi = di + 1; while (hi < lines.length && (lines[hi].trim() === '' || lines[hi].trim().startsWith('#'))) hi++;
    const rows = lines.slice(hi).filter(l => l.trim() !== '' && !l.trim().startsWith('#')).map(l => l.split(/\t|\s{2,}|\s+/).map(x => x.trim()));
    const res = fromTable(rows, name);
    // hourly files: sum the rain and reference ET of each day, average the temperature
    const byDay = new Map(); res.rows.forEach(r => { const k = r.d.getTime(); const q = byDay.get(k); if (!q) byDay.set(k, Object.assign({ n: 1 }, r)); else { q.n++; q.P += r.P || 0; if (isFinite(r.ET0)) q.ET0 = (isFinite(q.ET0) ? q.ET0 : 0) + r.ET0; ['tmean', 'rad'].forEach(f2 => { if (isFinite(r[f2])) q[f2] = (q[f2] * (q.n - 1) + r[f2]) / q.n; }); if (isFinite(r.tmax)) q.tmax = Math.max(isFinite(q.tmax) ? q.tmax : -99, r.tmax); if (isFinite(r.tmin)) q.tmin = Math.min(isFinite(q.tmin) ? q.tmin : 99, r.tmin); } });
    res.rows = [...byDay.values()].sort((a, b) => a.d - b.d); return res;
  }
  W.wxParse = function (name, buf) {
    const ext = (String(name).split('.').pop() || '').toLowerCase();
    if (['xlsx', 'xls', 'ods', 'xlsm'].includes(ext)) {
      if (!W.XLSX) throw new Error('the spreadsheet reader is not loaded');
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true }); let best = null;
      wb.SheetNames.forEach(sn => { try { const r = fromTable(XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: '' }), name + ' / ' + sn); if (!best || r.rows.length > best.rows.length) best = r; } catch (e) { if (!best) best = { err: e }; } });
      if (!best || best.err) throw (best && best.err) || new Error('no sheet with daily weather was found'); return best;
    }
    let txt = new TextDecoder('utf-8').decode(new Uint8Array(buf)); if (txt.includes('�')) txt = new TextDecoder('latin1').decode(new Uint8Array(buf));
    if (/^dwf-|^dlf-|^dai-|^\s*;|^\s*\(/i.test(txt.slice(0, 20)) || ['dwf', 'dlf', 'dai'].includes(ext)) return fromDaisy(txt, name);
    return fromTable(splitText(txt), name);
  };

  // ------------------------------------------------------------------ reference ET when the file has none
  const Ra = (lat, j) => { const phi = lat * Math.PI / 180, dr = 1 + 0.033 * Math.cos(2 * Math.PI * j / 365), del = 0.409 * Math.sin(2 * Math.PI * j / 365 - 1.39), ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(del)))); return 24 * 60 / Math.PI * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(del) + Math.cos(phi) * Math.cos(del) * Math.sin(ws)); };
  function fillET0(rows, lat) {
    let how = 'from the file';
    if (rows.some(r => isFinite(r.ET0))) return how;
    if (rows.some(r => isFinite(r.tmax) && isFinite(r.tmin))) { how = 'Hargreaves, from the daily maximum and minimum temperature at latitude ' + lat + '°'; rows.forEach(r => { if (!isFinite(r.tmax) || !isFinite(r.tmin)) return; const j = Math.round((r.d - Date.UTC(r.d.getUTCFullYear(), 0, 1)) / 864e5) + 1, tm = isFinite(r.tmean) ? r.tmean : (r.tmax + r.tmin) / 2; r.ET0 = Math.max(0, 0.0023 * (tm + 17.8) * Math.sqrt(Math.max(0, r.tmax - r.tmin)) * Ra(lat, j) * 0.408); }); return how; }
    if (rows.some(r => isFinite(r.tmean) && isFinite(r.rad))) { how = 'Makkink, from daily mean temperature and global radiation'; rows.forEach(r => { if (!isFinite(r.tmean) || !isFinite(r.rad)) return; const T = r.tmean, D = 4098 * 0.6108 * Math.exp(17.27 * T / (T + 237.3)) / Math.pow(T + 237.3, 2), g = 0.066, R = r.rad > 60 ? r.rad * 0.0864 : r.rad; r.ET0 = Math.max(0, 0.61 * D / (D + g) * R / 2.45 - 0.12); }); return how; }
    return 'not in the file: the seasonal pattern and annual demand of the simulated climate are used';
  }

  // ------------------------------------------------------------------ put the weather on the 20-year grid of the program
  function daisyET0() { try { const r = W.PERYEAR && PERYEAR.runs['E0_S01_CoarseLoam_Rainfed']; if (r) return r.ET0.reduce((a, b) => a + b, 0) / r.ET0.length; } catch (e) {} return 870; }
  function daisyP() { try { const r = W.PERYEAR && PERYEAR.runs['E0_S01_CoarseLoam_Rainfed']; if (r) return r.P.reduce((a, b) => a + b, 0) / r.P.length; } catch (e) {} return 464; }
  function build(rows, meta) {
    const ND2 = NYRx * DPYx, byYear = new Map(); rows.forEach(r => { const j = doyOf(r.d); if (j < 0) return; const y = r.d.getUTCFullYear(); if (!byYear.has(y)) byYear.set(y, { P: new Float32Array(DPYx).fill(NaN), E: new Float32Array(DPYx).fill(NaN), n: 0 }); const q = byYear.get(y); if (isFinite(r.P)) { if (!isFinite(q.P[j])) q.n++; q.P[j] = r.P; } if (isFinite(r.ET0)) q.E[j] = r.ET0; });
    // the climate of each day of the year (mean and minimum air temperature), when the weather has temperatures: for the planting advice
    const tS = new Float64Array(DPYx), tN = new Float64Array(DPYx), nS = new Float64Array(DPYx), nN = new Float64Array(DPYx);
    rows.forEach(r => { const j = doyOf(r.d); if (j < 0) return; const tm = isFinite(r.tmean) ? r.tmean : (isFinite(r.tmax) && isFinite(r.tmin) ? (r.tmax + r.tmin) / 2 : NaN); if (isFinite(tm)) { tS[j] += tm; nS[j]++; } if (isFinite(r.tmin)) { tN[j] += r.tmin; nN[j]++; } });
    const Tclim = nS.some(v => v > 0) ? Array.from(tS, (v, j) => nS[j] ? v / nS[j] : NaN) : null, Tnclim = nN.some(v => v > 0) ? Array.from(tN, (v, j) => nN[j] ? v / nN[j] : NaN) : null;
    const years = [...byYear.keys()].sort((a, b) => a - b), full = years.filter(y => byYear.get(y).n >= 300);
    if (!years.length) throw new Error('no dated rainfall values were found');
    const useYears = (full.length ? full : years), notes = [];
    // the 20-year window: the last 20 years with data; fewer years are repeated in turn
    const last = meta.lastYear || useYears[useYears.length - 1], y0 = last - NYRx + 1, pick = [];
    for (let i = 0; i < NYRx; i++) { const yy = y0 + i; pick.push(byYear.has(yy) && (byYear.get(yy).n >= 300 || meta.allowPartial) ? yy : useYears[(i + useYears.length * 10) % useYears.length]); }
    const rep = pick.filter((yy, i) => yy !== y0 + i).length; if (rep) notes.push(rep + ' of the 20 years are filled with other years of the file (' + useYears.length + ' complete year' + (useYears.length === 1 ? '' : 's') + ' available)');
    // climatology of each day of the year, for gaps
    const climE = new Float32Array(DPYx), climN = new Float32Array(DPYx); byYear.forEach(q => { for (let j = 0; j < DPYx; j++) if (isFinite(q.E[j])) { climE[j] += q.E[j]; climN[j]++; } });
    const hasE = climN.some(v => v > 0), e0D = daisyET0(), wE = j => 0.35 + 0.65 * 0.5 * (1 + Math.sin(2 * Math.PI * (j - 100) / DPYx)); let wEs = 0; for (let j = 0; j < DPYx; j++) wEs += wE(j);
    const P = new Float32Array(ND2), ET0 = new Float32Array(ND2); let gapP = 0;
    for (let i = 0; i < NYRx; i++) { const q = byYear.get(pick[i]); for (let j = 0; j < DPYx; j++) { const k = i * DPYx + j; let p = q ? q.P[j] : NaN;
      if (!isFinite(p)) { gapP++; for (const yy of useYears) { const qq = byYear.get(yy); if (qq && isFinite(qq.P[j])) { p = qq.P[j]; break; } } }
      P[k] = isFinite(p) ? p : 0;
      let e = q ? q.E[j] : NaN; if (!isFinite(e)) e = hasE && climN[j] > 0 ? climE[j] / climN[j] : e0D * wE(j) / wEs; ET0[k] = Math.max(0, e); } }
    if (gapP > 0) notes.push(gapP + ' missing days of rain filled from the same day of another year');
    let sP = 0, sE = 0; for (let k = 0; k < ND2; k++) { sP += P[k]; sE += ET0[k]; }
    const Pmean = sP / NYRx, Emean = sE / NYRx, e0n = new Float32Array(ND2), md = sE / ND2 || 1; for (let k = 0; k < ND2; k++) e0n[k] = ET0[k] / md;
    return { P, ET0, e0n, Pmean, Emean, y0, years: pick, notes, hasE, Tclim, Tnclim };
  }
  function apply(rows, meta) {
    const B = build(rows, meta), Pd = daisyP(), Ed = daisyET0();
    const rf = B.Pmean / Pd, dT = (B.Emean / Ed - 1) / 0.035, ri = nearestIdx(RAIN_VALUES, Math.max(RAIN_VALUES[0], Math.min(RAIN_VALUES[RAIN_VALUES.length - 1], rf))), ti = nearestIdx(TEMP_VALUES, Math.max(TEMP_VALUES[0], Math.min(TEMP_VALUES[TEMP_VALUES.length - 1], dT)));
    if (rf < RAIN_VALUES[0] - 0.05 || rf > RAIN_VALUES[RAIN_VALUES.length - 1] + 0.05) B.notes.push('the annual rainfall is ' + rf.toFixed(2) + ' times that of the simulations: the annual results use the nearest simulated step (×' + RAIN_VALUES[ri].toFixed(1) + ')');
    if (dT > TEMP_VALUES[TEMP_VALUES.length - 1] + 0.25 || dT < TEMP_VALUES[0] - 0.25) B.notes.push('the evaporative demand equals a warming of ' + dT.toFixed(1) + ' °C against the simulations: the annual results use the nearest simulated step (' + TEMP_VALUES[ti].toFixed(1) + ' °C)');
    if (!W.WXD || !W.WXD.on) W.__wxPrev = W.__wxPrev || { r: state.rainIdx, t: state.tempIdx };
    W.WXD = Object.assign(B, { on: true, key: meta.src + '|' + meta.name + '|' + B.y0 + '|' + B.Pmean.toFixed(1) + '|' + B.Emean.toFixed(1), src: meta.src, name: meta.name, rainRef: RAIN_VALUES[ri], dTref: TEMP_VALUES[ti], et0How: meta.how, fcStart: meta.fcStart == null ? null : meta.fcStart });
    W.WXSRC[meta.src === 'online' ? 'online' : 'file'] = W.WXD;
    applyState({ rainIdx: ri, tempIdx: ti });
    try { const dd = document.getElementById('dssDate'); if (dd && dd.value) dd.dispatchEvent(new Event('change')); } catch (e) {}
    return { name: meta.name, src: meta.src, years: B.y0 + ' to ' + (B.y0 + NYRx - 1), Pmean: B.Pmean, ET0mean: B.Emean, rain: RAIN_VALUES[ri], dT: TEMP_VALUES[ti], how: meta.how, notes: B.notes, days: rows.length };
  }
  const loadScript = src => new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = () => rej(new Error('could not load ' + src)); document.head.appendChild(sc); });
  W.wxImport = async function (name, buf, lat) {
    if (/\.(xlsx|xls|ods|xlsm)$/i.test(name) && !W.XLSX) await loadScript('vendor/xlsx.full.min.js');
    const r = W.wxParse(name, buf); if (!r.rows.length) throw new Error('no daily values were read');
    const how = fillET0(r.rows, isFinite(lat) ? lat : 45);
    const s = apply(r.rows, { src: 'file', name, how }); s.cols = r.cols; s.first = r.rows[0].d.toISOString().slice(0, 10); s.last = r.rows[r.rows.length - 1].d.toISOString().slice(0, 10); return s;
  };
  W.wxUse = function (which) {
    if (which === 'record') { if (W.WXD) W.WXD.on = false; W.WXD = null; const pv = W.__wxPrev || { r: RAIN_VALUES.indexOf(1.0), t: TEMP_VALUES.indexOf(0) }; W.__wxPrev = null; applyState({ rainIdx: pv.r, tempIdx: pv.t }); try { document.getElementById('dssDate').dispatchEvent(new Event('change')); } catch (e) {} return true; }
    const d = W.WXSRC[which]; if (!d) return false; if (!W.WXD) W.__wxPrev = { r: state.rainIdx, t: state.tempIdx }; d.on = true; W.WXD = d; applyState({ rainIdx: RAIN_VALUES.indexOf(d.rainRef), tempIdx: TEMP_VALUES.indexOf(d.dTref) }); try { document.getElementById('dssDate').dispatchEvent(new Event('change')); } catch (e) {} return true;
  };
  W.wxStatus = () => ({ src: W.WXD && W.WXD.on ? W.WXD.src : 'record', name: W.WXD && W.WXD.on ? W.WXD.name : '', file: !!W.WXSRC.file, online: !!W.WXSRC.online, years: W.WXD && W.WXD.on ? W.WXD.y0 + ' to ' + (W.WXD.y0 + NYRx - 1) : '', Pmean: W.WXD && W.WXD.on ? W.WXD.Pmean : null, ET0mean: W.WXD && W.WXD.on ? W.WXD.Emean : null, key: W.WXD && W.WXD.on ? W.WXD.key : 'record' });

  // ------------------------------------------------------------------ online daily weather of a location (history and forecast)
  const ISO = d => d.toISOString().slice(0, 10);
  async function getJSON(url, ms) { const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 25000); try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
  W.wxGeocode = async function (q) {
    const j = await getJSON('https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name=' + encodeURIComponent(q), 15000);
    return (j.results || []).map(r => ({ name: r.name + (r.admin1 ? ', ' + r.admin1 : '') + (r.country ? ', ' + r.country : ''), lat: r.latitude, lon: r.longitude }));
  };
  W.wxOnline = async function (lat, lon, label) {
    const now = new Date(), y1 = now.getUTCFullYear(), start = new Date(Date.UTC(y1 - NYRx + 1, 0, 1)), end = new Date(Date.UTC(y1, now.getUTCMonth(), now.getUTCDate() - 2));
    const q = 'latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) + '&daily=precipitation_sum,et0_fao_evapotranspiration,temperature_2m_max,temperature_2m_min&timezone=UTC';
    const hist = await getJSON('https://archive-api.open-meteo.com/v1/archive?' + q + '&start_date=' + ISO(start) + '&end_date=' + ISO(end), 60000);
    let fc = null; try { fc = await getJSON('https://api.open-meteo.com/v1/forecast?' + q + '&past_days=2&forecast_days=16', 20000); } catch (e) { fc = null; }
    const rows = [], put = (D) => { if (!D || !D.time) return; D.time.forEach((t, i) => { const p = D.precipitation_sum[i], e = D.et0_fao_evapotranspiration[i]; if (p == null && e == null) return; rows.push({ d: new Date(t + 'T00:00:00Z'), P: p == null ? NaN : p, ET0: e == null ? NaN : e, tmax: D.temperature_2m_max ? D.temperature_2m_max[i] : NaN, tmin: D.temperature_2m_min ? D.temperature_2m_min[i] : NaN, tmean: NaN, rad: NaN }); }); };
    put(hist.daily); const nHist = rows.length; if (fc) put(fc.daily);
    const map = new Map(); rows.forEach(r => map.set(r.d.getTime(), r)); const all = [...map.values()].sort((a, b) => a.d - b.d);
    // the rest of the current year after the forecast: the same days of the most typical year of the record
    const lastD = all.length ? all[all.length - 1].d : end, yrs = {}; all.forEach(r => { const y = r.d.getUTCFullYear(); if (y < y1) yrs[y] = (yrs[y] || 0) + (r.P || 0); });
    const ks = Object.keys(yrs).map(Number).sort((a, b) => yrs[a] - yrs[b]), typ = ks[Math.floor(ks.length / 2)];
    for (let d = new Date(lastD.getTime() + 864e5); d.getUTCFullYear() === y1; d = new Date(d.getTime() + 864e5)) { const src = map.get(Date.UTC(typ, d.getUTCMonth(), d.getUTCDate())); if (src) all.push(Object.assign({}, src, { d })); }
    const fcStart = fc ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) : null;
    const s = apply(all, { src: 'online', name: label || (lat.toFixed(3) + ', ' + lon.toFixed(3)), how: 'daily reference ET (FAO Penman-Monteith) of the weather service', lastYear: y1, allowPartial: true, fcStart });
    s.hist = nHist; s.forecast = fc ? 16 : 0; return s;
  };
})();
