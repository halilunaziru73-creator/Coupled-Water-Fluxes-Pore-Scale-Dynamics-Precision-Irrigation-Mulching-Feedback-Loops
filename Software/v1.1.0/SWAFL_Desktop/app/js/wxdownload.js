/* Download of a fetched weather record in every format: Daisy weather file (.dwf), Daisy log (.dlf), CSV,
   Excel (.xlsx), JSON, or all of them in one .zip. Rows: [{ d|t (date or ms), P, tmin|tn, tmax|tx, vp, wind, rad, et0|ET0 }]. */
(function (root) {
  'use strict';
  const COLS = ['year', 'month', 'day', 'precipitation', 'tmin', 'tmax', 'vapour_pressure', 'wind', 'radiation', 'et0'];
  const UNITS = ['', '', '', 'mm/d', 'dgC', 'dgC', 'hPa', 'm/s', 'kWh/d/m^2', 'mm/d'];
  const MIME = { dwf: 'text/plain', dlf: 'text/plain', csv: 'text/csv', json: 'application/json', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', zip: 'application/zip' };
  const num = v => (v == null || v === '' || !isFinite(+v)) ? null : +v;
  function table(rows) {
    const out = rows.map(r => { const t = (r.d && typeof r.d.getTime === 'function') ? r.d.getTime() : +(r.t != null ? r.t : r.d), d = new Date(t); if (!isFinite(t)) return null;
      return [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), num(r.P), num(r.tmin != null ? r.tmin : r.tn), num(r.tmax != null ? r.tmax : r.tx), num(r.vp), num(r.wind), num(r.rad), num(r.et0 != null ? r.et0 : r.ET0)]; }).filter(Boolean);
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); return out;
  }
  const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), names = Object.keys(files), parts = [], cen = []; let off = 0;
    const u16 = v => [v & 255, v >>> 8 & 255], u32 = v => [v & 255, v >>> 8 & 255, v >>> 16 & 255, v >>> 24 & 255];
    names.forEach(n => { const nb = enc.encode(n), db = typeof files[n] === 'string' ? enc.encode(files[n]) : files[n], c = crc(db);
      const lh = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(db.length), u32(db.length), u16(nb.length), u16(0))); parts.push(lh, nb, db);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(db.length), u32(db.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb);
      off += lh.length + nb.length + db.length; });
    let csz = 0; cen.forEach(b => csz += b.length); const end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(names.length), u16(names.length), u32(csz), u32(off), u16(0)));
    const all = parts.concat(cen, [end]); let tot = 0; all.forEach(b => tot += b.length); const o = new Uint8Array(tot); let p = 0; all.forEach(b => { o.set(b, p); p += b.length; }); return o;
  }
  const xe = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function xlsx(rows, meta) {
    const L = i => String.fromCharCode(65 + i), S = (r, c, v) => '<c r="' + L(c) + r + '" t="inlineStr"><is><t>' + xe(v) + '</t></is></c>', H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    let a = '<row r="1">' + COLS.map((c, i) => S(1, i, c)).join('') + '</row><row r="2">' + UNITS.map((c, i) => S(2, i, c)).join('') + '</row>';
    rows.forEach((r, k) => { a += '<row r="' + (k + 3) + '">' + r.map((v, i) => v == null ? '' : '<c r="' + L(i) + (k + 3) + '"><v>' + v + '</v></c>').join('') + '</row>'; });
    let b = ''; Object.keys(meta).forEach((k, i) => { b += '<row r="' + (i + 1) + '">' + S(i + 1, 0, k) + S(i + 1, 1, meta[k] == null ? '' : meta[k]) + '</row>'; });
    const sh = x => H + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + x + '</sheetData></worksheet>', R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    const ct = 'application/vnd.openxmlformats-officedocument.spreadsheetml.';
    return zip({
      '[Content_Types].xml': H + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="' + ct + 'sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="' + ct + 'worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="' + ct + 'worksheet+xml"/></Types>',
      '_rels/.rels': H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + '/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': H + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + R + '"><sheets><sheet name="Weather" sheetId="1" r:id="rId1"/><sheet name="About" sheetId="2" r:id="rId2"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + R + '/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + R + '/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml': sh(a), 'xl/worksheets/sheet2.xml': sh(b)
    });
  }
  const f2 = v => v == null ? '-999' : (Math.round(v * 100) / 100).toFixed(2);
  const iso = r => r[0] + '-' + String(r[1]).padStart(2, '0') + '-' + String(r[2]).padStart(2, '0');
  function files(rows, m) {
    const t = table(rows); if (!t.length) throw new Error('there is no daily weather to save');
    const base = String(m.name || 'weather').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '') || 'weather', lat = num(m.lat), lon = num(m.lon), f = {};
    const meta = { name: m.name || 'weather', latitude: lat, longitude: lon, elevation_m: num(m.elev), first_date: iso(t[0]), last_date: iso(t[t.length - 1]), days: t.length, source: m.source || '', note: 'missing values are empty (CSV, Excel), null (JSON) or -999 (Daisy files)', created: new Date().toISOString().slice(0, 10) };
    const dcell = r => r.map((v, i) => i < 3 ? v : f2(v));
    f[base + '.dwf'] = 'dwf-0.0 -- ' + meta.name + '\n\n# General information about the station itself.\nStation: ' + String(meta.name).replace(/[^\w .\-]/g, '_') + '\n' + (num(m.elev) != null ? 'Elevation: ' + Math.round(m.elev) + ' m\n' : '') + (lon != null ? 'Longitude: ' + Math.abs(lon).toFixed(2) + ' dg' + (lon >= 0 ? 'East' : 'West') + '\n' : '') + (lat != null ? 'Latitude: ' + Math.abs(lat).toFixed(2) + ' dg' + (lat >= 0 ? 'North' : 'South') + '\n' : '') + '\n# Source: ' + meta.source + '\n# Missing values are written as -999.\nBegin: ' + meta.first_date + '\nEnd:   ' + meta.last_date + '\nTimestep: 24 hours\n\n-------------------------------------------------------------------------------------\nYear\tMonth\tDay\tPrecip\tT_min\tT_max\tVapPres\tWind\tGlobRad\tRefEvap\nyear\tmonth\tday\tmm/d\tdgC\tdgC\thPa\tm/s\tkWh/d/m^2\tmm/d\n' + t.map(r => dcell(r).join('\t')).join('\n') + '\n';
    f[base + '.dlf'] = 'SIMFILE: SWAFL weather\nSource: ' + meta.source + '\n--------------------\n' + COLS.join('\t') + '\n' + UNITS.join('\t') + '\n' + t.map(r => dcell(r).join('\t')).join('\n') + '\n';
    const cell = v => v == null ? '' : v;
    f[base + '.csv'] = COLS.join(',') + '\n' + t.map(r => r.map(cell).join(',')).join('\n') + '\n';
    f[base + '.json'] = JSON.stringify({ metadata: meta, columns: COLS.map((c, i) => ({ name: c, unit: UNITS[i] })), daily: t.map(r => { const o = {}; COLS.forEach((c, i) => { o[c] = r[i]; }); return o; }) }, null, 1);
    f[base + '.xlsx'] = xlsx(t, meta);
    return { files: f, base, meta };
  }
  function save(kind, rows, m) {
    const g = files(rows, m), f = g.files; let name, data;
    if (kind === 'zip') { f.README = 'Weather: ' + g.meta.name + '\nSource: ' + g.meta.source + '\nFiles: ' + Object.keys(f).join(', ') + '\nColumns: ' + COLS.map((c, i) => c + (UNITS[i] ? ' (' + UNITS[i] + ')' : '')).join(', ') + '\n' + g.meta.note + '\n'; data = zip(f); name = g.base + '-weather.zip'; }
    else { data = f[g.base + '.' + kind]; name = g.base + '.' + kind; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: MIME[kind] })); a.download = root.SWAFLDate ? root.SWAFLDate.name(name) : name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return name;
  }
  // html for the row of buttons; bind(host, () => ({ rows, meta })) makes them work
  function html() { return '<div class="dzrow wxdl" style="margin-top:6px;flex-wrap:wrap;gap:4px"><b>Download this weather</b> ' + ['dwf', 'dlf', 'csv', 'xlsx', 'json'].map(k => '<button class="btn" type="button" data-wxd="' + k + '" title="Save as a .' + k + ' file">.' + k + '</button>').join(' ') + ' <button class="btn" type="button" data-wxd="zip" title="All the formats in one .zip file">All formats (.zip)</button> <span class="pnote wxdlmsg"></span></div>'; }
  function bind(host, get) {
    host.querySelectorAll('[data-wxd]').forEach(b => { b.onclick = ev => { ev.preventDefault(); const msg = host.querySelector('.wxdlmsg'); try { const g = get(); msg.textContent = 'Saved ' + save(b.dataset.wxd, g.rows, g.meta || {}) + '.'; } catch (e) { msg.textContent = 'Could not save: ' + e.message; msg.style.color = '#b3261e'; } }; });
  }
  root.WxDownload = { html, bind, files, save, table, zip, COLS, UNITS };
})(window);
