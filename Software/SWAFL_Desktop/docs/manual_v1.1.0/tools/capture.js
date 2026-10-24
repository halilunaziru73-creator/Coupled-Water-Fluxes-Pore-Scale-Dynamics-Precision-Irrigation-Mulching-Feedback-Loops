// Captures every screen of the current SWAFL workbench for the v1.1.0 manual.
// usage: node capture.js <outdir> <part: ui|default|soils|crops>
const { chromium } = require('playwright'); const fs = require('fs');
const OUT = process.argv[2], PART = process.argv[3] || 'ui'; fs.mkdirSync(OUT, { recursive: true });
const META = OUT + '/meta_' + PART + '.json', meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META)) : {};
const DES = ['sid', 'drip', 'spr'];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const wait = ms => p.waitForTimeout(ms);
  await p.goto('http://127.0.0.1:5199/index.html'); await wait(7000);
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.remove()); });
  const ev = s => p.evaluate(s => E.ev(s), s);
  const shot = async (name, clip) => { await p.screenshot({ path: OUT + '/' + name + '.jpg', type: 'jpeg', quality: 82, clip }); meta[name] = { kind: 'window' }; };
  const closeModal = () => p.evaluate(() => { const r = document.getElementById('modalRoot'); if (r) r.innerHTML = '';  });
  const open = async id => { await p.evaluate(id => Layers.open(id), id); await wait(900); if (DES.includes(id)) { await ev("runDesign('" + id + "');play.on=false;play.t=1"); await wait(700); } };
  async function full(name, id, setup) {
    await open(id); if (setup) { await ev(setup); await wait(700); if (DES.includes(id)) { await ev("runDesign('" + id + "');play.on=false;play.t=1"); await wait(500); } }
    await wait(900);
    const r = await p.evaluate(() => E.json("(function(){window.__REPORTING=true;try{if(['sid','drip','spr'].indexOf(currentScene.id)>=0)play.t=1;var u=canvas.toDataURL('image/jpeg',0.86);return {u:u,W:W,H:H,ss:window.__SS||1,sec:(window.__SEC||{})[currentScene.id]||{},label:currentScene.label,title:currentScene.title||''}}finally{window.__REPORTING=false}})()"));
    fs.writeFileSync(OUT + '/' + name + '.jpg', Buffer.from(r.u.split(',')[1], 'base64'));
    meta[name] = { kind: 'canvas', id, W: r.W, H: r.H, ss: r.ss, sec: r.sec, label: r.label, title: r.title };
  }
  const SC = await p.evaluate(() => E.json('SCENES.map(function(s){return s.id})'));
  const soils = await p.evaluate(() => E.json('DATA.soils')), crops = await p.evaluate(() => E.json('Object.keys(CROPS)'));
  if (PART === 'ui') {
    await shot('w_start'); await p.evaluate(() => Layers.expandAll && Layers.expandAll()); await wait(400); await shot('w_tree');
    for (const m of ['File', 'Edit', 'View', 'Tools', 'Refresh', 'Review', 'Run', 'Help']) { try { await p.click('.mbtn:text-is("' + m + '")'); await wait(400); await shot('menu_' + m.toLowerCase()); } catch (e) { errs.push('menu ' + m + ' ' + e.message); } await p.keyboard.press('Escape'); await p.evaluate(() => { try { document.querySelectorAll('.mbtn.open').forEach(b => b.click()); } catch (e) {} }); await wait(200); }
    for (const id of SC) { if (id === 'farm') continue; await open(id); await wait(600); await shot('wb_' + id); }
    for (const id of ['field', 'sid', 'drip', 'spr', 'crop']) { await open(id); for (const t of ['results', 'design', 'charts', 'messages']) { await p.evaluate(t => { const b = [...document.querySelectorAll('button[data-tab]')].find(x => x.dataset.tab === t); b && b.click(); }, t); await wait(900); await shot('dash_' + id + '_' + t); } await p.evaluate(() => { const b = [...document.querySelectorAll('button[data-tab]')].find(x => x.dataset.tab === 'results'); b && b.click(); }); }
    for (const id of DES) { await p.evaluate(id => Layers.open(id), id); await wait(800); await ev("DESIGN_RUN['" + id + "'].on=false;DESIGN_RUN['" + id + "'].why=''"); await wait(700); await shot('gate_' + id); }
    await p.evaluate(() => Layers.open('sid')); await wait(800); await ev("(function(){var s=SIDW[0];if(s)sidDown({x:s.x+5,y:s.y})})()"); await wait(600); await shot('picker_sid'); await closeModal(); await p.keyboard.press('Escape');
    for (const id of DES) { await p.evaluate(id => Layers.openFarm(id), id); await wait(1200); await ev("DESIGN_RUN['" + DES.find(x => x === id) + "'].on=false"); await wait(800); await shot('farmgate_' + id); await ev("runDesign('" + id + "');play.on=false"); await wait(1500); await shot('farm_' + id); }
    const dlg = [['dlg_weather_import', () => WxUI.importFile()], ['dlg_weather_online', () => WxUI.online()], ['dlg_report', () => Act.report()], ['dlg_sketch', () => Sketch.open()], ['dlg_compare', () => Sketch.compare()], ['dlg_about', () => Act.about && Act.about()], ['dlg_palette', () => Palette.open()]];
    for (const [n, f] of dlg) { await p.evaluate(f); await wait(700); await shot(n); await closeModal(); await p.keyboard.press('Escape'); await wait(200); }
    await p.keyboard.press('F1'); await wait(500); await shot('dlg_help'); await closeModal(); await p.keyboard.press('Escape');
  }
  if (PART === 'default') {
    for (const id of SC) { if (id === 'farm') continue; await full('d_' + id, id); }
    for (const v of ['years', 'gen']) await full('d_field_' + v, 'field', "state.fview='" + v + "'");
    await ev("state.fview='day'");
    for (const id of DES) { await p.evaluate(id => Layers.openFarm(id), id); await wait(800); await ev("runDesign('" + id + "');play.on=false"); await wait(500); await ev("fclock.day=(function(){var s=seasonSim();for(var d=fclock.kd();d<ND;d++)if(s.irr[d]>0)return d+0.45;return fclock.day})();fclock.pause=0"); await full('d_farm_' + id, 'farm'); }
  }
  if (PART === 'soils') {
    for (const s of soils) { await p.evaluate(s => E.set({ soil: s }), s); await wait(900);
      for (const id of SC) { if (id === 'farm') continue; await full('s_' + s + '_' + id, id); }
      for (const id of DES) { await p.evaluate(id => Layers.openFarm(id), id); await wait(800); await ev("runDesign('" + id + "');play.on=false"); await wait(400); await full('s_' + s + '_farm_' + id, 'farm'); } }
  }
  if (PART === 'crops') {
    for (const c of crops) { await p.evaluate(c => E.set({ crop: c }), c); await wait(700); await full('c_' + c + '_crop', 'crop'); }
  }
  fs.writeFileSync(META, JSON.stringify(meta)); console.log(PART, Object.keys(meta).length, 'errors', JSON.stringify(errs.slice(0, 10))); await b.close();
})();
