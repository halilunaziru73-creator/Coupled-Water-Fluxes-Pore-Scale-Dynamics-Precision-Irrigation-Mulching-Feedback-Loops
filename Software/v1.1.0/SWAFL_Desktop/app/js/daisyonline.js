/* Daisy workbench: weather of the area from the internet (Open-Meteo historical archive, ERA5 based; no key needed), turned into the rows that SWAFL converts to a Daisy weather file. */
'use strict';
(() => {
  const O = {}, DAY = 864e5;
  O.GEO = 'https://geocoding-api.open-meteo.com/v1/search', O.ARCHIVE = 'https://archive-api.open-meteo.com/v1/archive';
  O.DAILY = 'precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,shortwave_radiation_sum';
  const es = T => 6.108 * Math.exp(17.27 * T / (T + 237.3));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // one request that waits and tries again when the service says "too many requests" (429), is busy (5xx) or the network blinks; a daily or hourly limit is not waited for
  O.get = async function (url, note, tries) {
    tries = tries || 3; let last = 'no answer';
    for (let k = 0; k < tries; k++) {
      let r; try { r = await fetch(url); } catch (e) { last = 'no connection (' + (e.message || e) + ')'; if (k < tries - 1) { if (note) note('The connection failed, trying again...'); await sleep(1500 * (k + 1)); continue; } break; }
      if (r.ok) return r;
      let why = ''; try { const e = await r.clone().json(); why = e.reason || e.message || ''; } catch (x) { }
      last = 'HTTP ' + r.status + (why ? ': ' + why : '');
      const hard = r.status === 429 && /daily|hourly|day|hour/i.test(why);   // a limit that lasts: use another service now
      if (hard || (r.status !== 429 && r.status < 500) || k === tries - 1) { const er = new Error(last); er.status = r.status; er.hard = hard; throw er; }
      const ra = +r.headers.get('Retry-After') || 0, w = Math.min(15000, Math.max(ra * 1000, 2500 * (k + 1) * (k + 1)));
      if (note) note('The service is busy (' + r.status + '), waiting ' + Math.round(w / 1000) + ' s and trying again...'); await sleep(w);
    }
    const er = new Error(last); er.status = 0; throw er;
  };
  O.geocode = async function (name) {
    let first;
    try { const r = await O.get(O.GEO + '?count=6&language=en&format=json&name=' + encodeURIComponent(name), null, 2); const j = await r.json();
      const out = (j.results || []).map(x => ({ label: [x.name, x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, elev: x.elevation })); if (out.length) return out; first = 'no place of that name'; }
    catch (e) { first = e.message; }
    try { const r = await O.get('https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=0&q=' + encodeURIComponent(name), null, 2); const j = await r.json();
      return (j || []).map(x => ({ label: x.display_name, lat: +x.lat, lon: +x.lon, elev: null })); }
    catch (e) { if (first === 'no place of that name') return []; throw new Error('the place search is not reachable (' + first + '; second service: ' + e.message + '). Type the latitude and longitude instead.'); }
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
  // the weather already fetched for this place is kept on this computer (the past does not change): no new request, and it works without the internet
  const ckey = (lat, lon, y0, y1) => 'swafl.wx.' + lat.toFixed(2) + ',' + lon.toFixed(2) + ',' + y0 + '-' + y1;
  // kept in the same compact form as the built-in weather: one 16-bit number (value x 100) per day and variable, as base64;
  // a 27-year record takes about 270 kB instead of 1.3 MB of text, and it is read back without parsing a single date
  const COLS = ['P', 'tn', 'tx', 'rad', 'et0', 'wind', 'vp'];
  const day = t => Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10)) / 864e5;
  const dstr = n => new Date(n * 864e5).toISOString().slice(0, 10);
  function pack(rows) {
    const n = rows.length, d0 = day(rows[0].t); for (let i = 1; i < n; i++) if (day(rows[i].t) !== d0 + i) return null;
    const a = new Int16Array(n * 7); for (let i = 0; i < n; i++) COLS.forEach((c, j) => { const v = rows[i][c]; a[j * n + i] = isFinite(v) ? Math.max(-32767, Math.min(32767, Math.round(v * 100))) : -32768; });
    const u = new Uint8Array(a.buffer); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
    return { t0: rows[0].t, n, d: btoa(s) };
  }
  function unpack(p) {
    const s = atob(p.d), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    const a = new Int16Array(u.buffer), n = p.n, d0 = day(p.t0), rows = new Array(n);
    for (let i = 0; i < n; i++) { const q = { t: dstr(d0 + i) }; COLS.forEach((c, j) => { const v = a[j * n + i]; q[c] = v === -32768 ? NaN : v / 100; }); rows[i] = q; }
    return rows;
  }
  const cacheGet = k => { try { const t = localStorage.getItem(k); if (!t) return null; const o = JSON.parse(t); if (o.pk) { o.rows = unpack(o.pk); delete o.pk; } else o.rows = o.rows.map(a => ({ t: a[0], P: a[1], tn: a[2], tx: a[3], rad: a[4], et0: a[5], wind: a[6], vp: a[7] })); return o; } catch (e) { return null; } };
  const cachePut = (k, o) => { try { const keys = Object.keys(localStorage).filter(x => x.indexOf('swafl.wx.') === 0); while (keys.length > 5) localStorage.removeItem(keys.shift());
    const r = x => (isFinite(x) ? Math.round(x * 100) / 100 : null), pk = pack(o.rows), meta = { use: o.use, notes: o.notes, stats: o.stats, elevation: o.elevation, years: o.years, source: o.source };
    localStorage.setItem(k, JSON.stringify(pk ? Object.assign({ pk }, meta) : Object.assign({ rows: o.rows.map(q => [q.t, r(q.P), r(q.tn), r(q.tx), r(q.rad), r(q.et0), r(q.wind), r(q.vp)]) }, meta))); } catch (e) { } };
  const NASA = 'https://power.larc.nasa.gov/api/temporal/daily/point';
  // reference evapotranspiration from temperature and the position (Hargreaves and Samani), used when a service does not give it
  const hargreaves = (lat, t, tn, tx) => { const d = new Date(t), J = Math.round((t - Date.UTC(d.getUTCFullYear(), 0, 0)) / DAY), phi = lat * Math.PI / 180, dr = 1 + 0.033 * Math.cos(2 * Math.PI * J / 365), de = 0.409 * Math.sin(2 * Math.PI * J / 365 - 1.39), ws = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(de)))), Ra = 24 * 60 / Math.PI * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(de) + Math.cos(phi) * Math.cos(de) * Math.sin(ws));
    return Math.max(0, 0.0023 * ((tn + tx) / 2 + 17.8) * Math.sqrt(Math.max(0, tx - tn)) * 0.408 * Ra); };
  async function viaOpenMeteo(lat, lon, y0, y1, note) {
    const q = extra => O.ARCHIVE + '?latitude=' + lat.toFixed(4) + '&longitude=' + lon.toFixed(4) + '&start_date=' + y0 + '-01-01&end_date=' + y1 + '-12-31&timezone=UTC&wind_speed_unit=ms&daily=' + O.DAILY + extra;
    let r; try { r = await O.get(q(',wind_speed_10m_mean,dew_point_2m_mean'), note, 3); } catch (e) { if (e.status === 400) r = await O.get(q(''), note, 3); else throw e; }   // one request (a long period counts as many for the daily limit of the service)
    const j = await r.json(); if (j.error) throw new Error(j.reason || 'the service refused the request'); const out = O.check(O.rows(j)); out.elevation = j.elevation; out.source = 'Open-Meteo'; return out;
  }
  async function viaNasa(lat, lon, y0, y1, note) {
    const rows = []; let elev = null;
    for (let a = y0; a <= y1; a += 5) { const b = Math.min(y1, a + 4); if (note) note('NASA POWER: ' + a + ' to ' + b + '...');
      const r = await O.get(NASA + '?parameters=PRECTOTCORR,T2M_MAX,T2M_MIN,ALLSKY_SFC_SW_DWN,WS2M,RH2M&community=AG&longitude=' + lon.toFixed(4) + '&latitude=' + lat.toFixed(4) + '&start=' + a + '0101&end=' + b + '1231&format=JSON', note, 3); const j = await r.json();
      const P = j && j.properties && j.properties.parameter; if (!P || !P.T2M_MAX) throw new Error('NASA POWER sent no daily data'); if (j.geometry && j.geometry.coordinates && j.geometry.coordinates[2] != null) elev = +j.geometry.coordinates[2];
      const fv = x => (x == null || +x <= -990) ? NaN : +x;
      Object.keys(P.T2M_MAX).sort().forEach(k => { const t = Date.UTC(+k.slice(0, 4), +k.slice(4, 6) - 1, +k.slice(6, 8)), tn = fv(P.T2M_MIN[k]), tx = fv(P.T2M_MAX[k]), tm = (tn + tx) / 2, rh = fv(P.RH2M && P.RH2M[k]);
        rows.push({ t, P: fv(P.PRECTOTCORR[k]), tn, tx, rad: fv(P.ALLSKY_SFC_SW_DWN[k]), et0: isFinite(tm) ? hargreaves(lat, t, tn, tx) : NaN, wind: fv(P.WS2M && P.WS2M[k]), vp: isFinite(rh) && isFinite(tm) ? es(tm) * rh / 100 : NaN }); }); }
    const out = O.check({ rows, use: { date: 'NASA POWER date', precip: 'PRECTOTCORR', tmin: 'T2M_MIN', tmax: 'T2M_MAX', rad: 'ALLSKY_SFC_SW_DWN (MJ/m2)', et0: 'computed from temperature and position (Hargreaves and Samani); wind WS2M; vapour pressure from RH2M' }, notes: ['the weather of the area comes from NASA POWER (satellite and reanalysis, a model estimate on a grid of about 50 km, not a station record); the reference evapotranspiration is computed from temperature (Hargreaves and Samani)'] });
    out.elevation = elev; out.source = 'NASA POWER'; return out;
  }
  O.fetchDaily = async function (lat, lon, y0, y1, note) {
    lat = +lat; lon = +lon; y0 = Math.round(+y0); y1 = Math.round(+y1);
    if (!(lat >= -90 && lat <= 90) || !(lon >= -180 && lon <= 180)) throw new Error('the latitude must lie between -90 and 90 and the longitude between -180 and 180');
    const last = new Date().getUTCFullYear() - 1; // only complete years: the archive runs about five days behind today
    if (y1 > last) y1 = last; if (y0 < 1940) y0 = 1940; if (y1 - y0 < 5) throw new Error('the archive holds complete years from 1940 to ' + last + '; ask for at least six years in that range');
    const k = ckey(lat, lon, y0, y1), c = cacheGet(k); if (c) { c.years = [y0, y1]; c.notes = (c.notes || []).concat(['read from the copy kept on this computer (fetched earlier from ' + (c.source || 'the weather service') + ')']); return c; }
    const tried = []; let out = null;
    try { out = await viaOpenMeteo(lat, lon, y0, y1, note); } catch (e) { tried.push('Open-Meteo: ' + e.message); }
    if (!out) { if (note) note('Open-Meteo did not answer, trying NASA POWER...'); try { out = await viaNasa(lat, lon, Math.max(y0, 1981), y1, note); } catch (e) { tried.push('NASA POWER: ' + e.message); } }
    if (!out) throw new Error('no weather service answered (' + tried.join('; ') + '). Wait a few minutes, change the network (for example your phone hotspot), or use Import weather with a file of your own');
    if (tried.length) out.notes = (out.notes || []).concat(['the first service did not answer (' + tried[0] + '), so ' + out.source + ' was used']);
    out.years = [y0, y1]; cachePut(k, out); return out;
  };
  window.DaisyOnline = O;
})();
