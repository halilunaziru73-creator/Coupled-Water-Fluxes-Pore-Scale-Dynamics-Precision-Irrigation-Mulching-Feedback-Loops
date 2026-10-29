/* The own process figure of one SWAFL layer: drivers, the chain of processes above and below the soil surface,
   the state of the soil, the outputs and the controls, drawn in the style of the figures of the manuscripts.
   Every box is clickable (class dzPb, data-p = the process of Daisy it stands for). */
const LayerFig = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KIND = { water: 'water', surf: 'water', pore: 'soil', om: 'soil', carbon: 'soil', temp: 'soil', drain: 'drain', no3: 'n', nh4: 'n', deni: 'n', crop: 'crop', photo: 'crop', bio: 'info', snow: 'info' };
  const FILL = { water: '#F6C1D1', soil: '#DCC5A8', n: '#EFE6D6', crop: '#F7A24B', info: '#D8CBEA', drain: '#F6C1D1', out: '#FBD9B5' };
  const ABOVE = { bio: 1, snow: 1, surf: 1, photo: 1, crop: 1 };
  const FONT = "font-family:'Segoe UI',Arial,sans-serif";
  function wrap(t, n) { const w = String(t).split(/\s+/), L = []; let c = ''; w.forEach(x => { if ((c + ' ' + x).trim().length > n && c) { L.push(c); c = x; } else c = (c + ' ' + x).trim(); }); if (c) L.push(c); return L; }
  function text(x, y, lines, o) { o = o || {}; const fs = o.fs || 11, lh = fs * 1.25, y0 = y - (lines.length - 1) * lh / 2; return lines.map((l, i) => '<text x="' + x + '" y="' + (y0 + i * lh + fs * 0.35) + '" text-anchor="' + (o.a || 'middle') + '" font-size="' + fs + '" ' + (o.b ? 'font-weight="700" ' : '') + 'fill="' + (o.c || '#222') + '" style="' + FONT + '">' + esc(l) + '</text>').join(''); }
  function hex(x, y, w, h) { const k = 16; return 'M' + (x + k) + ' ' + y + 'L' + (x + w - k) + ' ' + y + 'L' + (x + w) + ' ' + (y + h / 2) + 'L' + (x + w - k) + ' ' + (y + h) + 'L' + (x + k) + ' ' + (y + h) + 'L' + x + ' ' + (y + h / 2) + 'Z'; }
  function elbow(a, b, mid) { if (Math.abs(a[0] - b[0]) < 2 || Math.abs(a[1] - b[1]) < 2) return 'M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1]; return mid === 'x' ? 'M' + a[0] + ' ' + a[1] + 'L' + (a[0] + b[0]) / 2 + ' ' + a[1] + 'L' + (a[0] + b[0]) / 2 + ' ' + b[1] + 'L' + b[0] + ' ' + b[1] : 'M' + a[0] + ' ' + a[1] + 'L' + a[0] + ' ' + (a[1] + b[1]) / 2 + 'L' + b[0] + ' ' + (a[1] + b[1]) / 2 + 'L' + b[0] + ' ' + b[1]; }

  // o: {id, name, drivers:{title,items}, state:{title,lines}, steps:[{p,t,n}], outputs:[{t,p}], controls:[{t,i}], fb, sel, nameOf(p)}
  function svg(o) {
    const W = 1180, H = 720, SY = 330, id = 'lf' + String(o.id || 'x').replace(/\W/g, ''), sel = o.sel || null, S = o.steps || [], n = Math.max(1, S.length);
    const x0 = 290, bw = n > 4 ? 150 : 165, bh = 78, gap = n > 1 ? Math.min(46, (W - 30 - x0 - n * bw) / (n - 1)) : 0, X = i => x0 + i * (bw + gap);
    const cy = s => (ABOVE[s.p] ? SY - 80 : SY + 105);
    const dim = p => sel && p !== sel ? ' opacity="0.3"' : '';
    let d = '<defs>' + [['A', '#222'], ['R', '#c0392b'], ['P', '#7B52AB']].map(m => '<marker id="' + id + m[0] + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="' + m[1] + '"/></marker>').join('') + '</defs>';
    d += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>';
    d += '<text x="' + (W / 2) + '" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#222" style="' + FONT + '">' + esc(o.name) + ': processes, controls and outputs</text>';
    // the soil surface
    d += '<rect x="20" y="' + (SY - 2) + '" width="' + (W - 40) + '" height="5" fill="#C49A6C"/><text x="' + (W - 24) + '" y="' + (SY - 8) + '" text-anchor="end" font-size="11" font-style="italic" fill="#8a6030" style="' + FONT + '">soil surface</text><text x="' + (W - 24) + '" y="' + (SY + 18) + '" text-anchor="end" font-size="11" font-style="italic" fill="#8a6030" style="' + FONT + '">soil</text>';
    // drivers (top left)
    const dr = o.drivers || { title: 'Drivers', items: [] }, dl = Math.max(1, dr.items.length), dh = 44 + dl * 17;
    d += '<g><rect x="30" y="44" width="215" height="' + dh + '" rx="6" fill="#fff" stroke="#7B52AB" stroke-width="1.6" stroke-dasharray="6 4"/>' + text(137, 62, [dr.title], { b: 1, c: '#7B52AB', fs: 11.5 }) + dr.items.map((t, i) => text(44, 84 + i * 17, [t.length > 34 ? t.slice(0, 33) + '...' : t], { a: 'start', fs: 10.5 })).join('') + '</g>';
    // state of the soil (bottom left)
    const st = o.state || { title: 'Soil', lines: [] }, sh = 70 + st.lines.length * 22;
    d += '<g><rect x="30" y="' + (SY + 40) + '" width="215" height="' + sh + '" rx="5" fill="#FBE3EA" stroke="#222" stroke-width="2.2"/>' + text(137, SY + 62, [st.title], { b: 1, fs: 12.5 }) + st.lines.map((t, i) => text(137, SY + 90 + i * 22, [t], { fs: 11, c: '#444' })).join('') + '</g>';
    // outputs (top)
    const out = o.outputs || [], ow = Math.min(190, (W - 30 - x0 - (out.length - 1) * 16) / Math.max(1, out.length)), oy = 50, oh = 62, ox = i => x0 + i * (ow + 16);
    out.forEach((q, i) => {
      let j = S.findIndex(s => s.p === q.p); if (j < 0) j = Math.min(i, n - 1); const s = S[j], sx = X(j) + bw / 2, sy = cy(s) - bh / 2 + (ABOVE[s.p] ? 0 : 0);
      d += '<path d="' + elbow([sx + (i % 2 ? 10 : -10), sy], [ox(i) + ow / 2, oy + oh], 'y') + '" fill="none" stroke="#222" stroke-width="1.6" marker-end="url(#' + id + 'A)"' + dim(q.p) + '/>';
    });
    out.forEach((q, i) => { d += '<g class="dzPb lfN" data-p="' + esc(q.p) + '" style="cursor:pointer"' + dim(q.p) + '><title>Click: show the results of this output</title><rect x="' + ox(i) + '" y="' + oy + '" width="' + ow + '" height="' + oh + '" rx="7" fill="' + FILL.out + '" stroke="#222" stroke-width="1.8"/>' + text(ox(i) + ow / 2, oy + oh / 2, wrap(q.t, Math.floor(ow / 6.4)).slice(0, 3), { b: 1, fs: 11 }) + '</g>'; });
    d += '<text x="' + x0 + '" y="42" font-size="11" font-weight="700" fill="#8a5a1c" style="' + FONT + '" letter-spacing="1">OUTPUTS</text>';
    // chain of processes
    S.forEach((s, i) => { if (i) { const a = S[i - 1], A = [X(i - 1) + bw, cy(a)], B = [X(i), cy(s)]; d += '<path d="' + elbow(A, B, 'x') + '" fill="none" stroke="#222" stroke-width="2" marker-end="url(#' + id + 'A)"' + (sel && sel !== a.p && sel !== s.p ? ' opacity="0.3"' : '') + '/>'; } });
    if (o.fb && n > 2) { const a = S[n - 1], b = S[0], yy = Math.max(cy(a), cy(b)) + bh / 2 + 24; d += '<path d="M' + (X(n - 1) + bw / 2) + ' ' + (cy(a) + bh / 2) + 'L' + (X(n - 1) + bw / 2) + ' ' + yy + 'L' + (X(0) + bw / 2) + ' ' + yy + 'L' + (X(0) + bw / 2) + ' ' + (cy(b) + bh / 2) + '" fill="none" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="7 4" marker-end="url(#' + id + 'R)"/><text x="' + (X(Math.floor(n / 2)) + bw / 2) + '" y="' + (yy - 5) + '" text-anchor="middle" font-size="10.5" fill="#c0392b" style="' + FONT + '">feedback: ' + esc(o.fb) + '</text>'; }
    S.forEach((s, i) => {
      const k = KIND[s.p] || 'info', x = X(i), y = cy(s) - bh / 2, lines = wrap(s.t, Math.floor(bw / 6.2)).slice(0, 4);
      d += '<g class="dzPb lfN" data-p="' + esc(s.p) + '" style="cursor:pointer"' + dim(s.p) + '><title>' + esc((o.nameOf && o.nameOf(s.p)) || s.p) + ': click to see only its results</title>' +
        (k === 'info' ? '<path d="' + hex(x, y, bw, bh) + '" fill="' + FILL.info + '" stroke="#222" stroke-width="1.9"/>' : k === 'drain' ? '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="' + bh / 2 + '" fill="' + FILL.drain + '" stroke="#222" stroke-width="1.9"/>' : '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="9" fill="' + FILL[k] + '" stroke="#222" stroke-width="' + (k === 'soil' || k === 'water' ? 2.2 : 1.9) + '"/>') +
        text(x + bw / 2, y + bh / 2 - 8, [String(i + 1) + ' ' + ((o.nameOf && o.nameOf(s.p)) || '').split(/[:(,]/)[0].slice(0, 26)], { b: 1, fs: 9.5, c: '#555' }) + text(x + bw / 2, y + bh / 2 + 10, lines.slice(0, 3), { fs: 10.5 }) + '</g>';
    });
    // state to the first process below the surface
    const fb = S.findIndex(s => !ABOVE[s.p]); if (fb >= 0) d += '<path d="' + elbow([245, SY + 40 + sh / 2], [X(fb), cy(S[fb])], 'x') + '" fill="none" stroke="#222" stroke-width="1.5" stroke-dasharray="2 4" marker-end="url(#' + id + 'A)" marker-start="url(#' + id + 'A)"/>';
    // drivers to the first process
    d += '<path d="' + elbow([245, 44 + dh / 2], [X(0), cy(S[0] || { p: 'bio' })], 'x') + '" fill="none" stroke="#222" stroke-width="1.5" stroke-dasharray="2 4" marker-end="url(#' + id + 'A)"/>';
    // controls (bottom)
    const cs = o.controls || [], cw = Math.min(190, (W - 30 - x0 - (cs.length - 1) * 14) / Math.max(1, cs.length)), cyy = 575, cx = i => x0 + i * (cw + 14);
    cs.forEach((c, i) => { const j = Math.min(c.i == null ? i : c.i, n - 1), s = S[j] || S[0]; if (s) d += '<path d="' + elbow([cx(i) + cw / 2, cyy], [X(j) + bw / 2 + (i % 2 ? 8 : -8), cy(s) + bh / 2], 'y') + '" fill="none" stroke="#7B52AB" stroke-width="1.5" stroke-dasharray="2 4" marker-end="url(#' + id + 'P)"/>'; });
    cs.forEach((c, i) => { d += '<g><rect x="' + cx(i) + '" y="' + cyy + '" width="' + cw + '" height="52" rx="6" fill="#fff" stroke="#7B52AB" stroke-width="1.6" stroke-dasharray="6 4"/>' + text(cx(i) + cw / 2, cyy + 26, wrap(c.t, Math.floor(cw / 6.2)).slice(0, 3), { fs: 10.5, c: '#4a2f78' }) + '</g>'; });
    d += '<text x="' + x0 + '" y="' + (cyy - 8) + '" font-size="11" font-weight="700" fill="#7B52AB" style="' + FONT + '" letter-spacing="1">CONTROLS</text>';
    // legend
    const ly = 664; d += '<rect x="30" y="' + ly + '" width="' + (W - 60) + '" height="46" rx="4" fill="#fff" stroke="#555"/>';
    const lg = [['solid', 'Flow of water, matter, information', 0], ['dot', 'Information between modules', 1], ['red', 'Feedback', 2], ['box', 'Control of this layer', 3]];
    lg.forEach((l, i) => { const lx = 50 + i * 280; d += l[0] === 'solid' ? '<path d="M' + lx + ' ' + (ly + 23) + 'l40 0" stroke="#222" stroke-width="2" marker-end="url(#' + id + 'A)"/>' : l[0] === 'dot' ? '<path d="M' + lx + ' ' + (ly + 23) + 'l40 0" stroke="#222" stroke-width="1.6" stroke-dasharray="2 4"/>' : l[0] === 'red' ? '<path d="M' + lx + ' ' + (ly + 23) + 'l40 0" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="7 4"/>' : '<rect x="' + lx + '" y="' + (ly + 14) + '" width="40" height="18" rx="4" fill="#fff" stroke="#7B52AB" stroke-width="1.5" stroke-dasharray="5 3"/>'; d += text(lx + 50, ly + 23, [l[1]], { a: 'start', fs: 11 }); });
    d += [['water', 'water'], ['soil', 'soil state'], ['crop', 'crop'], ['info', 'process or information'], ['out', 'output']].map((c, i) => '<rect x="' + (50 + i * 150) + '" y="' + (ly + 34) + '" width="12" height="8" fill="' + FILL[c[0]] + '" stroke="#222" stroke-width=".8"/>' + text(66 + i * 150, ly + 38, [c[1]], { a: 'start', fs: 9.5 })).join('');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;max-width:1180px;background:#fff;display:block">' + d + '</svg>';
  }
  return { svg };
})();
