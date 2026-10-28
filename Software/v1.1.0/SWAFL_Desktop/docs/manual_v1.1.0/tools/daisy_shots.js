/* Captures the screens of the Daisy workbench (the modal opened with DaisyUI.open) for the manual: one PNG and one JSON with the numbered marks per screen.
   usage: node daisy_shots.js [group ...]   (groups are the files of tools/shots; needs the app served on port 8765 and, for the screens with Daisy results, DAISY_EXE)
   The written spec of each screen (title, introduction, text of every mark) is in tools/shots/*.js and is the single source of the atlas chapters. */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const HERE = __dirname, APP = path.resolve(HERE, '../../../'), OUT = path.join(HERE, '../build_shots'); fs.mkdirSync(OUT, { recursive: true });
const URL = 'http://localhost:8765/app/index.html', SC = 1.6;
let R = null; try { R = require(path.join(APP, 'daisy-runner.js')); } catch (e) { }
const groups = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(path.join(HERE, 'shots')).filter(f => /\.js$/.test(f)).map(f => f.replace(/\.js$/, '')).sort();
(async () => {
  const b = await chromium.launch(), report = [];
  const ctxPage = async (opts = {}) => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: SC }), p = await ctx.newPage(); p.on('pageerror', e => report.push('PAGEERR ' + e.message));
    if (process.env.DAISY_EXE && R) await p.exposeFunction('nodeJob', async job => { const r = await R.runJob(Object.assign(job, { copyDir: path.join(APP, 'app/data/daisy/scenarios/common') }), { exe: process.env.DAISY_EXE }); R.clean(r.dir); delete r.dir; return r; });
    await p.addInitScript(d => { window.swafl = { isDesktop: true, daisyInfo: async () => ({ found: true, version: 'Daisy 7.1.14', exe: 'daisy' }), daisyChoose: async () => ({ found: true }), daisyJob: d ? j => window.nodeJob(j) : async () => ({ code: -1, logs: {}, err: 'Daisy is not available here' }), version: async () => '1.1.0' }; }, !!process.env.DAISY_EXE);
    await p.goto(URL); await p.waitForTimeout(3500); await p.evaluate(() => { document.querySelectorAll('#modalRoot .modal button').forEach(x => { if (/Start|Close/i.test(x.textContent)) x.click(); }); });
    return p;
  };
  const markPos = (p, m) => p.evaluate(({ s, i, at }) => {
    const modal = [...document.querySelectorAll('#modalRoot .modal')].pop(); if (!modal) return null; const mr = modal.getBoundingClientRect(); let el = null;
    if (s.indexOf('text:') === 0) { const q = s.slice(5).toLowerCase(), c = [...modal.querySelectorAll('button,label,b,h3,h4,span,a,summary,th,td,div,p,option')].filter(e => e.offsetParent !== null && (e.innerText || '').trim().toLowerCase().indexOf(q) === 0 && (e.innerText || '').length < q.length + 80); c.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length); el = c[i || 0] || null; }
    else el = modal.querySelectorAll(s)[i || 0] || null;
    if (!el) return null; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null; const body = document.getElementById('dzBody'), br = body ? body.getBoundingClientRect() : mr;
    if (r.bottom < mr.top || r.top > mr.bottom - 36 || r.right < mr.left || r.left > mr.right) return { off: true };
    let x = r.left + (at === 'center' || r.width < 160 ? r.width / 2 : at === 'right' ? r.width - 14 : Math.min(18, r.width * 0.2)), y = r.top + (at === 'top' ? Math.min(10, r.height / 2) : r.height / 2);
    return { x: x - mr.left, y: y - mr.top };
  }, { s: m.s, i: m.i || 0, at: m.at || null });
  for (const g of groups) {
    const specs = require(path.join(HERE, 'shots', g + '.js')); const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
    let p = null;
    for (let sp of specs) {
      if (only && only.indexOf(sp.id) < 0) continue;
      try {
        if (!p || sp.fresh) { if (p) await p.context().close(); p = await ctxPage(); }
        const rr = await sp.run(p, { open: async (t, w = 1200) => { await p.evaluate(t => DaisyUI.open(t), t); await p.waitForTimeout(w); }, wait: ms => p.waitForTimeout(ms), root: APP });
        let tall = null; if (sp.full !== false) { await p.setViewportSize({ width: 1280, height: 3000 }); tall = await p.addStyleTag({ content: '.dzw{height:auto !important;max-height:none !important;overflow:visible !important}' }); await p.waitForTimeout(500); }
        await p.waitForTimeout(250); const mh = await p.evaluateHandle(() => [...document.querySelectorAll('#modalRoot .modal')].pop()), bb = await mh.asElement().boundingBox();
        if (rr && rr.title) sp = Object.assign({}, sp, rr); const marks = []; for (const m of (sp.marks || [])) { const pos = await markPos(p, m); if (!pos || pos.off) { report.push(sp.id + ': mark not found or out of view: ' + m.s + (pos ? ' (below the visible part)' : '')); continue; } marks.push({ x: pos.x * SC, y: pos.y * SC, t: m.t, d: m.d || '' }); }
        await p.screenshot({ path: path.join(OUT, sp.id + '.png'), clip: { x: bb.x, y: bb.y, width: bb.width, height: bb.height } });
        if (tall) { await p.setViewportSize({ width: 1280, height: 900 }); await p.evaluate(() => { [...document.querySelectorAll('style')].forEach(x => { if (/dzw\{height:auto/.test(x.textContent)) x.remove(); }); }); }
        fs.writeFileSync(path.join(OUT, sp.id + '.json'), JSON.stringify({ id: sp.id, group: g, ch: sp.ch, sec: sp.sec, title: sp.title, intro: sp.intro || '', note: sp.note || '', marks }, null, 1)); console.log('ok', sp.id, marks.length + '/' + (sp.marks || []).length);
      } catch (e) { report.push(sp.id + ': ' + e.message.split('\n')[0]); console.log('FAIL', sp.id, e.message.split('\n')[0]); }
    }
    if (p) await p.context().close();
  }
  console.log('REPORT\n' + report.join('\n')); await b.close();
})();
