const IDS = ['bio', 'snow', 'surf', 'water', 'pore', 'drain', 'temp', 'no3', 'nh4', 'om', 'carbon', 'deni', 'photo', 'crop'];
module.exports = IDS.map((id, k) => ({
  id: 'dz_proc_' + String(k + 2).padStart(2, '0'), ch: 'results', sec: 'Processes', fresh: k === 0,
  run: async (p, c) => {
    if (k === 0) { await c.open('proc', 1200); await p.fill('#dzStripWx', '').catch(() => {}); await p.click('#dzPRun').catch(() => {}); await p.waitForFunction(() => { const e = document.getElementById('dzPsum'); return e && /ran|done|log|figure/i.test(e.innerText || ''); }, null, { timeout: 500000 }).catch(() => {}); await c.wait(2500); }
    await p.evaluate(id => { const g = document.querySelector('.dzPb[data-p="' + id + '"]') || document.querySelector('.dzPc[data-p="' + id + '"]'); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, id); await c.wait(1800);
    const r = await p.evaluate(() => { const h = document.querySelector('#dzPdet h3'); return { title: 'Processes: ' + (h ? h.innerText : ''), intro: h ? h.parentNode.children[1].innerText : '' }; });
    return r;
  },
  marks: [{ s: '#dzPmap', t: 'Process map', d: 'The process that is open has a red frame.', at: 'center' }, { s: '#dzPdet h3', t: 'Process', d: 'Name of the process and what Daisy does there.' }, { s: '#dzPSrc', t: 'Source of the figures', d: 'The run whose logs are drawn.' }, { s: '#dzPRun', t: 'Run Daisy with all process logs', d: 'Runs the model with every process log on.' }, { s: '#dzPdet canvas', t: 'First figure', d: 'The figure of the process.', at: 'center' }, { s: '#dzPdet canvas', i: 1, t: 'Second figure', d: 'The next figure of the process.', at: 'center' }, { s: '#dzPdet canvas', i: 2, t: 'Third figure', d: 'The next figure of the process.', at: 'center' }]
}));
