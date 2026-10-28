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
  O.fetchDaily = async function (lat, lon, y0, y1) {
    const q = (extra) => O.ARCHIVE + '?latitude=' + lat + '&longitude=' + lon + '&start_date=' + y0 + '-01-01&end_date=' + y1 + '-12-31&timezone=UTC&wind_speed_unit=ms&daily=' + O.DAILY + extra;
    let r = await fetch(q(',wind_speed_10m_mean,dew_point_2m_mean')); if (!r.ok) r = await fetch(q(''));
    if (!r.ok) throw new Error('the weather service answered HTTP ' + r.status + (r.status === 429 ? ' (too many requests, try again in a minute)' : ''));
    const j = await r.json(); if (j.error) throw new Error(j.reason || 'the weather service refused the request'); const out = O.rows(j); out.elevation = j.elevation; return out;
  };
  window.DaisyOnline = O;
})();
