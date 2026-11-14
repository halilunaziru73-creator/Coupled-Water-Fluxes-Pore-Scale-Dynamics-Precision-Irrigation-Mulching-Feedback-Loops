/* Realistic soil pictures for every simulation window: the colour follows the texture of the soil (pale sandy soils, brown loams, red
   iron-rich clays like the ferruginous soils of the tropics), with crumbs and clods, gravel, roots, organic topsoil, cracks, litter and weeds.
   Everything is drawn from the soil's own sand, silt and clay shares and a fixed seed, so a soil always looks the same. */
'use strict';
(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = seed => { let s = Math.abs(seed | 0) % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const hash = s => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a == null ? 1 : a) + ')';
  const sh = (c, d) => c.map(v => clamp(Math.round(v + d), 0, 255));
  /* the colour of the soil from sand and clay: pale tan sand, brown loam, red-brown clay loam */
  function base(tex) {
    const sand = tex.sand / 100, clay = tex.clay / 100;
    const sandy = [201, 170, 122], loam = [150, 100, 66], red = [166, 78, 46], dark = [104, 62, 42];
    let c = mixc(sandy, loam, clamp(1 - sand * 1.05 + 0.15, 0, 1));
    c = mixc(c, red, clamp((clay - 0.14) * 3.2, 0, 0.85));
    c = mixc(c, dark, clamp((clay - 0.30) * 3, 0, 0.5));
    return c;
  }
  function noise(w, h, o, rand, cell) {   // soft blotchy variation (value noise, two scales)
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh); for (let i = 0; i < g.length; i++) g[i] = rand();
    const c = document.createElement('canvas'); c.width = Math.ceil(w / 2); c.height = Math.ceil(h / 2); const x = c.getContext('2d'), im = x.createImageData(c.width, c.height);
    for (let py = 0; py < c.height; py++) for (let px = 0; px < c.width; px++) {
      const fx = px * 2 / cell, fy = py * 2 / cell, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], d = g[(iy + 1) * gw + ix], e = g[(iy + 1) * gw + ix + 1];
      const v = (a + (b - a) * sx) * (1 - sy) + (d + (e - d) * sx) * sy, k = (py * c.width + px) * 4;
      im.data[k] = v > .5 ? 255 : 0; im.data[k + 1] = v > .5 ? 235 : 0; im.data[k + 2] = v > .5 ? 200 : 0; im.data[k + 3] = Math.abs(v - .5) * 2 * o * 255;
    }
    x.putImageData(im, 0, 0); return c;
  }
  function clod(x, cx, cy, r, col, rand) {   // a rounded crumb, lit from the top left
    x.save(); x.translate(cx, cy); x.rotate(rand() * 6.28); x.scale(1, 0.7 + rand() * 0.3);
    const g = x.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r); g.addColorStop(0, rgb(sh(col, 26))); g.addColorStop(.7, rgb(col)); g.addColorStop(1, rgb(sh(col, -34)));
    x.fillStyle = g; x.beginPath(); const n = 7; for (let i = 0; i < n; i++) { const a = i / n * 6.283, rr = r * (.78 + rand() * .3); i ? x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : x.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    x.closePath(); x.fill(); x.restore();
  }
  function pebble(x, cx, cy, r, rand, redish) {
    const t = rand(), col = redish ? (t < .5 ? [150, 70, 44] : [120, 84, 62]) : (t < .5 ? [196, 186, 168] : [128, 118, 104]);
    x.save(); x.translate(cx, cy); x.rotate(rand() * 6.28); x.scale(1, .62 + rand() * .3);
    const g = x.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); g.addColorStop(0, rgb(sh(col, 34))); g.addColorStop(1, rgb(sh(col, -40)));
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill(); x.restore();
    x.fillStyle = 'rgba(0,0,0,.28)'; x.beginPath(); x.ellipse(cx + r * .3, cy + r * .45, r * .9, r * .28, 0, 0, 6.283); x.fill();
  }
  function blade(x, bx, by, len, lean, wd, col) {
    x.strokeStyle = col; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + lean * .3, by - len * .6, bx + lean, by - len); x.stroke();
  }
  function weed(x, wx, wy, s, rand) {   // a small weed: a rosette of leaves and a few blades
    const greens = [[64, 128, 52], [84, 148, 60], [46, 104, 44], [112, 158, 68]];
    for (let i = 0; i < 6 + (s / 4 | 0); i++) { const a = -Math.PI / 2 + (rand() - .5) * 2.6, L = s * (.5 + rand() * .7), c = greens[(rand() * 4) | 0];
      x.fillStyle = rgb(c); x.save(); x.translate(wx, wy); x.rotate(a + Math.PI / 2); x.beginPath(); x.ellipse(0, -L * .55, L * .2, L * .5, 0, 0, 6.283); x.fill(); x.restore(); }
    for (let i = 0; i < 5; i++) blade(x, wx + (rand() - .5) * s * .5, wy, s * (.8 + rand() * .8), (rand() - .5) * s * .9, 1.1, rgb(greens[(rand() * 4) | 0]));
  }
  function litter(x, lx, ly, s, rand) {   // a dry leaf or a straw piece
    const cols = [[120, 88, 52], [150, 116, 70], [96, 70, 44], [176, 150, 100]], c = cols[(rand() * 4) | 0];
    x.save(); x.translate(lx, ly); x.rotate(rand() * 3.14); x.fillStyle = rgb(c, .92);
    if (rand() < .55) { x.beginPath(); x.ellipse(0, 0, s, s * .32, 0, 0, 6.283); x.fill(); x.strokeStyle = rgb(sh(c, -40), .8); x.lineWidth = .7; x.beginPath(); x.moveTo(-s, 0); x.lineTo(s, 0); x.stroke(); }
    else { x.fillRect(-s, -.9, s * 2, 1.8); }
    x.restore();
  }
  const cache = {};
  /* a vertical section through the soil (w by h pixels): A, B and C horizons */
  function section(w, h, key, tex) {
    const k = 's|' + key + '|' + w + '|' + h; if (cache[k]) return cache[k]; if (Object.keys(cache).length > 40) for (const q in cache) delete cache[q];
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), rand = rng(hash(key) + 11), b = base(tex), sand = tex.sand / 100, clay = tex.clay / 100;
    const hA = h * .1, hB = h * .42;
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, rgb(sh(mixc(b, [60, 40, 28], .55), 0))); g.addColorStop(hA / h, rgb(sh(b, -22))); g.addColorStop(hB / h, rgb(sh(mixc(b, [190, 120, 70], clay * .5), 6))); g.addColorStop(1, rgb(sh(mixc(b, [214, 190, 150], .35), 24)));
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.drawImage(noise(w, h, .22, rand, 46), 0, 0, w, h); x.drawImage(noise(w, h, .14, rand, 13), 0, 0, w, h);
    // crumbs and clods: finer and rounder in the topsoil, blocky below
    const nC = Math.round(w * h / 420 * (.6 + clay));
    for (let i = 0; i < nC; i++) { const y = rand() * h, d = y < hA ? 1 : y < hB ? .8 : .6; clod(x, rand() * w, y, (2 + rand() * 4.5) * (.7 + clay) * d, sh(b, (rand() - .5) * 44 - (y < hA ? 20 : 0)), rand); }
    // sand grains and mica specks
    const nS = Math.round(w * h / 18 * (.3 + sand));
    for (let i = 0; i < nS; i++) { const l = rand() < .5; x.fillStyle = l ? 'rgba(244,232,206,' + (.25 + rand() * .4) + ')' : 'rgba(40,26,18,' + (.2 + rand() * .3) + ')'; x.fillRect(rand() * w, rand() * h, .8 + rand() * 1.3, .8 + rand() * 1.1); }
    // gravel and stones: more in coarse soils and in the deep horizon
    const nP = Math.round(w * h / 2600 * (.4 + sand * 1.1));
    for (let i = 0; i < nP; i++) { const y = rand() * h; if (y < hA * .6) continue; pebble(x, rand() * w, y, 1.6 + rand() * (2.4 + sand * 2.6), rand, clay > .25); }
    // roots: fine, dark threads that branch in the topsoil and thin out below
    for (let i = 0; i < Math.round(w / 9); i++) { let px = rand() * w, py = 0, len = h * (.15 + rand() * .55); x.strokeStyle = 'rgba(214,196,150,' + (.35 + rand() * .3) + ')'; x.lineWidth = .7 + rand() * .8; x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < len; s += 5) { px += (rand() - .5) * 5; py += 4 + rand() * 2; x.lineTo(px, py); } x.stroke(); }
    // cracks in clay soil
    if (clay > .17) { x.strokeStyle = 'rgba(30,16,8,' + (.22 + clay * .4) + ')'; x.lineWidth = .9 + clay;
      for (let i = 0; i < Math.round(w / 34 * (clay + .3)); i++) { let px = rand() * w, py = hA + rand() * h * .2; x.beginPath(); x.moveTo(px, py); for (let s = 0; s < h * (.2 + rand() * .5); s += 6) { px += (rand() - .5) * 7; py += 5 + rand() * 3; x.lineTo(px, py); } x.stroke(); } }
    // earthworm channels and pores
    for (let i = 0; i < Math.round(w * h / 9000); i++) { x.fillStyle = 'rgba(24,12,6,.55)'; x.beginPath(); x.ellipse(rand() * w, rand() * h * .6, 1.2 + rand() * 2, .9 + rand(), 0, 0, 6.283); x.fill(); }
    // soft light from the left, shadow at the foot
    const v = x.createLinearGradient(0, 0, w, 0); v.addColorStop(0, 'rgba(255,240,210,.07)'); v.addColorStop(1, 'rgba(0,0,0,.14)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
    return (cache[k] = c);
  }
  /* the soil surface seen from above (w by h): crumbs, stones, dry leaves and small weeds, as on a bare field in the dry season */
  function surface(w, h, key, tex, cover) {
    const k = 'u|' + key + '|' + w + '|' + h + '|' + (cover || 0); if (cache[k]) return cache[k];
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), rand = rng(hash(key) + 71), b = sh(base(tex), 6), clay = tex.clay / 100, sand = tex.sand / 100;
    x.fillStyle = rgb(b); x.fillRect(0, 0, w, h); x.drawImage(noise(w, h, .3, rand, 40), 0, 0, w, h); x.drawImage(noise(w, h, .2, rand, 11), 0, 0, w, h);
    for (let i = 0; i < w * h / 70; i++) clod(x, rand() * w, rand() * h, 1.5 + rand() * (2.5 + clay * 4), sh(b, (rand() - .5) * 50), rand);
    for (let i = 0; i < w * h / 900 * (.4 + sand); i++) pebble(x, rand() * w, rand() * h, 1.5 + rand() * 3.2, rand, clay > .2);
    for (let i = 0; i < w * h / 3600; i++) litter(x, rand() * w, rand() * h, 3 + rand() * 6, rand);
    const nW = Math.round(w * h / 5200 * (cover == null ? 1 : cover)); for (let i = 0; i < nW; i++) weed(x, rand() * w, rand() * h, 5 + rand() * 9, rand);
    const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,.18)'); v.addColorStop(.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(255,230,190,.08)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
    return (cache[k] = c);
  }
  /* paint the section texture on top of a flat colour (used where a window colours the soil by water content) */
  function overlay(ctx, x, y, w, h, key, tex, alpha) {
    const s = section(Math.max(40, Math.round(w)), Math.max(40, Math.round(h)), key, tex); ctx.save(); ctx.globalAlpha = alpha == null ? .35 : alpha; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(s, x, y, w, h); ctx.restore();
  }

  /* real detail on top of any soil picture: crumbs with light and shadow, gravel, fine roots, cracks in clay (w by h pixels, grain size px) */
  function detail(o, w, h, key, tex, px) {
    const rand = rng(hash(key) + w * 7 + h), b = base(tex), sand = tex.sand / 100, clay = tex.clay / 100, u = px || 3, area = w * h;
    const nC = Math.round(area / (u * u * 150) * (.5 + clay)); o.save(); o.globalAlpha = .55;
    for (let i = 0; i < nC; i++) clod(o, rand() * w, rand() * h, u * (1.3 + rand() * 2.2) * (.7 + clay), sh(b, (rand() - .5) * 40), rand);
    o.globalAlpha = 1;
    const nP = Math.round(area / (u * u * 900) * (.3 + sand * 1.2)); for (let i = 0; i < nP; i++) pebble(o, rand() * w, rand() * h, u * (.7 + rand() * 1.3), rand, clay > .25);
    for (let i = 0; i < Math.round(w / (u * 14)); i++) { let x = rand() * w, y = rand() * h * .3, len = h * (.1 + rand() * .4); o.strokeStyle = 'rgba(224,206,160,' + (.3 + rand() * .3) + ')'; o.lineWidth = Math.max(.6, u * .25); o.beginPath(); o.moveTo(x, y); for (let q = 0; q < len; q += u * 1.6) { x += (rand() - .5) * u * 1.6; y += u * 1.4; o.lineTo(x, y); } o.stroke(); }
    if (clay > .17) { o.strokeStyle = 'rgba(28,14,6,' + (.2 + clay * .35) + ')'; o.lineWidth = Math.max(.7, u * .3); for (let i = 0; i < Math.round(w / (u * 22) * (clay + .3)); i++) { let x = rand() * w, y = rand() * h * .35; o.beginPath(); o.moveTo(x, y); for (let q = 0; q < h * (.15 + rand() * .4); q += u * 2) { x += (rand() - .5) * u * 2; y += u * 1.8; o.lineTo(x, y); } o.stroke(); } }
    o.restore();
  }
  /* weeds, dry leaves and straw standing on a soil line at y0, from x0 to x1 (the surface of a field picture) */
  function cover(o, x0, x1, y0, key, amount) {
    const rand = rng(hash(key) + 5), n = Math.round((x1 - x0) / 22 * (amount == null ? 1 : amount));
    for (let i = 0; i < n; i++) { const x = x0 + rand() * (x1 - x0); if (rand() < .55) weed(o, x, y0 + 1, 5 + rand() * 7, rand); else litter(o, x, y0 + 2 + rand() * 3, 3 + rand() * 4, rand); }
  }
  function patch(DATA) { try { Object.keys(DATA.texture).forEach(k => { const t = DATA.texture[k]; if (!t.realColor) { t.baseColor = t.color; t.color = RealSoil.color(t); t.realColor = 1; } }); } catch (e) { } }
  window.RealSoil = { patch, detail, cover, base, section, surface, overlay, rng, hash, color: tex => '#' + base(tex).map(v => ('0' + v.toString(16)).slice(-2)).join('') };
})();
