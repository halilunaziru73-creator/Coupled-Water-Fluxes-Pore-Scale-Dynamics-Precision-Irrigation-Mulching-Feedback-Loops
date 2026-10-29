/* Daisy workbench: the crops of the rotation, chosen by the person.
   The built-in farm grows spring barley, winter barley, winter rape and winter wheat. Here any crop of the Daisy library can be put in the rotation, in any order,
   with its own dates of tillage, sowing, fertiliser and harvest. The actions are written the way the built-in ones are (so nitrogen factor, tillage, fertiliser type,
   fertiliser timing and irrigation keep working on them). The four crops of the built-in farm are tested; the other templates are starting values to check against
   your own practice. */
'use strict';
(typeof window !== "undefined" ? window : globalThis).DaisyCrops = (() => {
  const C = {};
  // id: [Daisy name, label, tillage, sowing, fertiliser (date:kg N/ha), latest harvest, stop at maturity (DS 2), extra harvest settings, tested]
  const T = {
    sbarley: ['Spring Barley', 'Spring barley', '03-20', '04-05', '04-05:160', '09-01', 1, '', 1], wbarley: ['Winter Barley', 'Winter barley', '09-10', '09-25', '03-25:160,04-25:80', '08-09', 1, '', 1],
    wrape: ['Winter Rape', 'Winter rape', '08-15', '08-20', '08-20:125,03-05:130', '08-09', 1, '(stem 0.0)(leaf 0.0)', 1], wwheat: ['Winter Wheat', 'Winter wheat', '09-10', '09-25', '04-05:155,05-05:74', '09-01', 1, '(stem 0.0)(leaf 0.0)', 1],
    wwheat2: ['Winter Wheat', 'Winter wheat (second year, more nitrogen)', '09-10', '09-25', '04-05:160,05-05:101', '09-01', 1, '(stem 0.0)(leaf 0.0)', 1],
    swheat: ['Spring Wheat', 'Spring wheat', '03-20', '04-05', '04-05:150', '09-01', 1, '', 0], srape: ['Spring Rape', 'Spring rape', '03-25', '04-10', '04-10:140', '09-10', 1, '(stem 0.0)(leaf 0.0)', 0],
    rye: ['Rye', 'Rye', '09-10', '09-25', '03-25:100,04-25:40', '08-05', 0, '', 0], maize: ['Maize', 'Maize', '04-10', '05-01', '04-25:150', '10-05', 0, '', 0], pea: ['Pea', 'Pea (no fertiliser)', '03-25', '04-05', '', '08-10', 0, '', 0],
    potato: ['Potato; V1', 'Potato', '04-10', '04-20', '04-20:140', '09-25', 0, '', 0], sugarbeet: ['Sugar Beet', 'Sugar beet', '03-25', '04-10', '04-10:120', '10-20', 0, '', 0], fodderbeet: ['Fodder Beet', 'Fodder beet', '03-25', '04-10', '04-10:120', '10-20', 0, '', 0],
    grass: ['Grass', 'Grass (one cut at the end)', '03-20', '04-01', '04-05:150', '10-15', 0, '', 0]
  };
  // every crop the Daisy library of this version defines
  C.LIBRARY = ['Beet; V1', 'Beetroot', 'Broccoli', 'Brussels sprouts', 'Celeriac', 'Early potato', 'Fodder Beet', 'Grass', 'Green Pea', 'Maize', 'Onion', 'Pea', 'Potato; Agria', 'Potato; Folva', 'Potato; Koege', 'Potato; Triada', 'Potato; V1', 'Red fescue', 'Rye', 'Ryegrass', 'Silage Maize', 'Spring Barley', 'Spring Barley; Foulum', 'Spring Rape', 'Spring Wheat', 'Sugar Beet', 'White cabbage', 'Winter Barley', 'Winter Barley; Foulum', 'Winter Rape', 'Winter Wheat', 'Winter Wheat; Foulum'];
  C.CATALOG = Object.keys(T).map(id => ({ id, name: T[id][0], label: T[id][1], tested: !!T[id][8] }));
  const entry = id => { const t = T[id]; return { c: t[0], label: t[1], till: t[2], sow: t[3], fert: t[4], harv: t[5], ds: t[6], extra: t[7] }; };
  C.entry = entry;
  C.generic = name => ({ c: name, label: name, till: '04-01', sow: '04-15', fert: '04-15:100', harv: '09-30', ds: 0, extra: '' });
  C.DEFAULT = () => ['sbarley', 'wbarley', 'wrape', 'wwheat', 'wwheat2'].map(entry);
  const md = s => { const m = String(s || '').match(/^(\d{1,2})[-\/.](\d{1,2})$/); if (!m || +m[1] < 1 || +m[1] > 12 || +m[2] < 1 || +m[2] > 31) return null; return [+m[1], +m[2]]; };
  const off = (a, from) => { const d = (Date.UTC(2001, a[0] - 1, a[1]) - Date.UTC(2001, from[0] - 1, from[1])) / 864e5; return d < 0 ? d + 365 : d; };
  const two = n => (n < 10 ? '0' : '') + n;
  // the text of the actions of one crop, in time order from its tillage
  function action(c, i) {
    const t = md(c.till), s = md(c.sow), h = md(c.harv); if (!t || !s || !h) throw new Error('crop ' + (i + 1) + ' (' + c.c + '): the dates must be month-day, for example 04-05');
    const ev = [{ o: off(t, t), x: '(wait_mm_dd ' + t[0] + ' ' + two(t[1]) + ')(plowing)' }];
    String(c.fert || '').split(',').map(x => x.trim()).filter(Boolean).forEach(f => { const m = f.match(/^(\d{1,2}[-\/.]\d{1,2}):\s*([\d.]+)$/); const d = m && md(m[1]); if (!d) throw new Error('crop ' + (i + 1) + ' (' + c.c + '): fertiliser must be like 04-05:160,05-05:70 (month-day and kg N/ha)'); ev.push({ o: off(d, t), x: '(wait_mm_dd ' + d[0] + ' ' + two(d[1]) + ')(fertilize (N25S (weight ' + (+m[2]) + ' [kg N/ha])))\n    (spray "Tracer"   ' + (+m[2]) + ' [kg/ha])' }); });
    ev.push({ o: off(s, t) + 0.5, x: '(wait_mm_dd ' + s[0] + ' ' + two(s[1]) + ')(seed_bed_preparation)(sow "' + c.c + '")' });
    ev.sort((a, b) => a.o - b.o);
    const end = c.ds ? '(wait (or (crop_ds_after "' + c.c + '" 2.0)(mm_dd ' + h[0] + ' ' + h[1] + ')))' : '(wait_mm_dd ' + h[0] + ' ' + h[1] + ')';
    return ';; ' + (c.label || c.c) + ' setup.\n(defaction "crop' + (i + 1) + '_A_F_R" activity\n  ' + ev.map(e => e.x).join('\n  ') + '\n  ' + end + '\n    (harvest "' + c.c + '" (stub 8 [cm])' + (c.extra || '') + ')\n)\n';
  }
  // the rotation file of the built-in farm with the crops of the person in its place; everything else of the file (tracer, irrigation action) is kept
  C.rotation = function (rot, crops) {
    const i0 = rot.indexOf(';; Spring Barley setup.'), i1 = rot.indexOf('(defaction irrigate_'), i2 = rot.indexOf(';; Arable Farm Rotation'); if (i0 < 0 || i1 < 0 || i2 < 0) throw new Error('the rotation file has no crop section to replace');
    const m = rot.match(/\(while \("sbarley_A_F_R"\)(\([^()]*\))\)/), inner = m ? m[1] : '(irrigate_30_tensiometer_overhead)';
    if (!crops || !crops.length) throw new Error('choose at least one crop');
    return rot.slice(0, i0) + crops.map(action).join('\n') + '\n' + rot.slice(i1, i2) + ';; Arable Farm Rotation (the crops chosen in SWAFL)\n(defaction "A_F_R" activity\n' + crops.map((c, i) => '  (while ("crop' + (i + 1) + '_A_F_R")' + inner + ')\n').join('') + ')\n';
  };
  // the chooser: host element, current value (null = the built-in farm), a function that receives the new value
  C.editor = function (host, value, set) {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const draw = () => {
      const on = Array.isArray(value), list = on ? value : [];
      host.innerHTML = '<div class="dzrow"><label><input type="checkbox" data-cr="on"' + (on ? ' checked' : '') + '> <b>Choose the crops of the rotation myself</b></label><span class="pnote">' + (on ? list.length + ' crop' + (list.length === 1 ? '' : 's') + ', grown one after the other and then again' : 'off: the built-in farm (spring barley, winter barley, winter rape, winter wheat twice)') + '</span></div>' +
        (on ? '<table class="dztab" style="font-size:12px;border-collapse:collapse"><tr><th>#</th><th>Crop</th><th>Tillage</th><th>Sowing</th><th>Fertiliser (month-day:kg N/ha, ...)</th><th>Harvest by</th><th title="harvest when the crop is ripe (DS 2), or at the latest on the date">at maturity</th><th></th></tr>' +
          list.map((c, i) => '<tr data-r="' + i + '"><td>' + (i + 1) + '</td><td><select data-f="c">' + C.CATALOG.map(k => '<option value="cat:' + k.id + '"' + (k.name === c.c && (c.label || '') === k.label ? ' selected' : '') + '>' + esc(k.label) + (k.tested ? '' : ' (template)') + '</option>').join('') + '<optgroup label="Any crop of the Daisy library">' + C.LIBRARY.map(n => '<option value="lib:' + esc(n) + '"' + (!C.CATALOG.some(k => k.name === c.c && (c.label || '') === k.label) && n === c.c ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</optgroup></select></td>' +
            ['till', 'sow'].map(f => '<td><input data-f="' + f + '" value="' + esc(c[f]) + '" size="5"></td>').join('') + '<td><input data-f="fert" value="' + esc(c.fert) + '" size="22"></td><td><input data-f="harv" value="' + esc(c.harv) + '" size="5"></td><td><input type="checkbox" data-f="ds"' + (c.ds ? ' checked' : '') + '></td><td><button class="btn" data-a="up">↑</button><button class="btn" data-a="dn">↓</button><button class="btn" data-a="rm">remove</button></td></tr>').join('') + '</table>' +
          '<div class="dzrow"><select data-cr="addsel">' + C.CATALOG.map(k => '<option value="cat:' + k.id + '">' + esc(k.label) + '</option>').join('') + '<optgroup label="Any crop of the Daisy library">' + C.LIBRARY.map(n => '<option value="lib:' + esc(n) + '">' + esc(n) + '</option>').join('') + '</optgroup></select><button class="btn" data-cr="add">Add this crop</button><button class="btn" data-cr="std">Back to the built-in farm crops</button><span class="pnote">Dates are month-day (04-05). Crops marked template are starting values: check the dates and the nitrogen against your own practice.</span></div>' : '');
      const pick = v => v.indexOf('cat:') === 0 ? entry(v.slice(4)) : C.generic(v.slice(4));
      host.querySelector('[data-cr="on"]').onchange = e => { value = e.target.checked ? C.DEFAULT() : null; set(value); draw(); };
      if (!on) return;
      host.querySelectorAll('tr[data-r]').forEach(tr => { const i = +tr.dataset.r; tr.querySelectorAll('[data-f]').forEach(inp => inp.onchange = () => { const f = inp.dataset.f; if (f === 'c') { const n = pick(inp.value); value[i] = n; draw(); } else value[i][f] = inp.type === 'checkbox' ? (inp.checked ? 1 : 0) : inp.value.trim(); set(value); });
        tr.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const a = b.dataset.a; if (a === 'rm' && value.length > 1) value.splice(i, 1); else if (a === 'up' && i > 0) value.splice(i - 1, 0, value.splice(i, 1)[0]); else if (a === 'dn' && i < value.length - 1) value.splice(i + 1, 0, value.splice(i, 1)[0]); set(value); draw(); }); });
      host.querySelector('[data-cr="add"]').onclick = () => { value.push(pick(host.querySelector('[data-cr="addsel"]').value)); set(value); draw(); };
      host.querySelector('[data-cr="std"]').onclick = () => { value = C.DEFAULT(); set(value); draw(); };
    };
    draw();
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = C;
  return C;
})();
