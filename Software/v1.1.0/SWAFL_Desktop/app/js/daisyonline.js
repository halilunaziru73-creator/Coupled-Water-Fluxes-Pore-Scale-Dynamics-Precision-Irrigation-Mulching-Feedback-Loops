/* Daisy workbench: weather of the area from the internet (Open-Meteo historical archive, ERA5 based; no key needed), turned into the rows that SWAFL converts to a Daisy weather file. */
'use strict';
(() => {
  const O = {}, DAY = 864e5;
  O.GEO = 'https://geocoding-api.open-meteo.com/v1/search', O.ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
  O.DAILY = 'precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,shortwave_radiation_sum';
  const es = T => 6.108 * Math.exp(17.27 * T / (T + 237.3));
  O.geocode = async function (name) {
    const r = await fetch(O.GEO + '?count=6&language=en&format=json&name=' + encodeURIComponent(name)); if (!r.ok) throw new Error('the place search answered HTTP ' + r.status);
    const j = await r.json(); return (j.results || []).map(x => ({ label: [x.name, x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, elev: x.elevation }));
  };
  // the JSON of the archive -> rows of SWAFL (t in ms, P mm, tn and tx deg C, rad MJ/m2/d, et0 mm/d, wind m/s at 2 m, vp hPa)
  O.rows = function (j) {
    const d = j && j.daily; if (!d || !d.time) throw new Error('the weather service sent no daily data'); const n = d.time.length, rows = [], num = v => v == null ? NaN : +v;
    for (let i = 0; i < n; i++) { const t = Date.parse(d.time[i] + 'T00:00:00Z'), td = d.dew_point_2m_mean ? num(d.dew_point_2m_mean[i]) : NaN, w10 = d.wind_speed_10m_mean ? num(d.wind_speed_10m_mean[i]) : NaN;
      rows.push({ t, P: num(d.precipitation_sum[i]), tn: num(d.temperature_2m_min[i]), tx: num(d.temperature_2m_max[i]), rad: num(d.shortwave_radiation_sum[i]), et0: num(d.et0_fao_evapotranspiration[i]), wind: isFinite(w10) ? w10 * 0.748 : NaN, vp: isFinite(td) ? es(td) : NaN }); }
    return { rows, use: { date: 'Open-Meteo time', precip: 'precipitation_sum', tmin: 'temperature_2m_min', tmax: 'temperature_2m_max', rad: 'shortwave_radiation_sum (MJ/m2)', et0: 'et0_fao_evapotranspiration' + (d.wind_speed_10m_mean ? '; wind_speed_10m_mean scaled to 2 m' : '') + (d.dew_point_2m_mean ? '; vapour pressure from dew_point_2m_mean' : '') }, notes: ['the weather of the area comes from the Open-Meteo historical archive (ERA5 reanalysis), a model estimate on a grid, not a station record'] };
  };
  // checks of the daily data before Daisy sees them: complete years only, no gaps, physically possible values
  O.check = function (out) {
    const R = out.rows, bad = { P: 0, tn: 0, tx: 0, rad: 0 }, fixed = []; let swapped = 0, clipped = 0;
    R.forEach(r => { if (!isFinite(r.P)) bad.P++; if (!isFinite(r.tn)) bad.tn++; if (!isFinite(r.tx)) bad.tx++; if (!isFinite(r.rad)) bad.rad++; });
    const lim = Math.max(2, R.length * 0.01); ['P', 'tn', 'tx'].forEach(k => { if (bad[k] > lim) throw new Error('the weather service has too many gaps in ' + { P: 'rain', tn: 'minimum temperature', tx: 'maximum temperature' }[k] + ' for this place and period (' + bad[k] + ' days); choose other years or a weather file'); });
    const interp = k => { for (let i = 0; i < R.length; i++) if (!isFinite(R[i][k])) { let a = i - 1, b = i + 1; while (a >= 0 && !isFinite(R[a][k])) a--; while (b < R.length && !isFinite(R[b][k])) b++; if (a >= 0 && b < R.length && b - a <= 4) R[i][k] = R[a][k] + (R[b][k] - R[a][k]) * (i - a) / (b - a); else if (a >= 0 && b < R.length) throw new Error('a gap of ' + (b - a - 1) + ' days in the ' + k + ' of the weather service'); } };
    if (bad.tn) { interp('tn'); fixed.push(bad.tn + ' day(s) of minimum temperature filled by straight-line interpolation'); } if (bad.tx) { interp('tx'); fixed.push(bad.tx + ' day(s) of maximum temperature filled by straight-line interpolation'); }
    if (bad.P) { R.forEach(r => { if (!isFinite(r.P)) r.P = 0; }); fixed.push(bad.P + ' day(s) without rain set to 0 mm'); }
    if (bad.rad) { interp('rad'); fixed.push('radiation filled on ' + bad.rad + ' day(s)'); }
    R.forEach(r => { if (r.tx < r.tn) { const t = r.tx; r.tx = r.tn; r.tn = t; swapped++; } if (r.P < 0) { r.P = 0; clipped++; } if (r.rad < 0) { r.rad = 0; clipped++; } });
    if (swapped) fixed.push(swapped + ' day(s) with the minimum above the maximum were swapped'); if (clipped) fixed.push(clipped + ' negative value(s) set to 0');
    const Pm = R.reduce((a, r) => a + r.P, 0) / R.length * 365.25, Tm = R.reduce((a, r) => a + (r.tn + r.tx) / 2, 0) / R.length; out.stats = { days: R.length, Pmean: Pm, Tmean: Tm, fixed };
    if (Pm > 12000 || Tm < -60 || Tm > 50) throw new Error('the weather service sent values that are not possible (' + Math.round(Pm) + ' mm a year, ' + Tm.toFixed(1) + ' degC); nothing was used');
    return out;
  };
  O.fetchDaily = async function (lat, lon, y0, y1) {
    lat = +lat; lon = +lon; y0 = Math.round(+y0); y1 = Math.round(+y1);
    if (!(lat >= -90 && lat <= 90) || !(lon >= -180 && lon <= 180)) throw new Error('the latitude must lie between -90 and 90 and the longitude between -180 and 180');
    const last = new Date().getUTCFullYear() - 1; // only complete years: the archive runs about five days behind today
    if (y1 > last) y1 = last; if (y0 < 1940) y0 = 1940; if (y1 - y0 < 5) throw new Error('the archive holds complete years from 1940 to ' + last + '; ask for at least six years in that range');
    const q = extra => O.ARCHIVE + '?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) + '&start_date=' + y0 + '-01-01&end_date=' + y1 + '-12-31&timezone=UTC&wind_speed_unit=ms&daily=' + O.DAILY + extra;
    const get = async extra => { const r = await fetch(q(extra)); if (r.ok) return { j: await r.json() }; let why = ''; try { const e = await r.json(); why = e.reason || ''; } catch (x) { } return { status: r.status, why }; };
    let g = await get(',wind_speed_10m_mean,dew_point_2m_mean'); if (!g.j) g = await get('');
    if (!g.j) throw new Error('the weather service answered HTTP ' + g.status + (g.why ? ': ' + g.why : '') + (g.status === 429 ? ' (too many requests, try again in a minute)' : ''));
    const j = g.j; if (j.error) throw new Error(j.reason || 'the weather service refused the request'); const out = O.check(O.rows(j)); out.elevation = j.elevation; out.years = [y0, y1]; return out;
  };
  window.DaisyOnline = O;
})();
