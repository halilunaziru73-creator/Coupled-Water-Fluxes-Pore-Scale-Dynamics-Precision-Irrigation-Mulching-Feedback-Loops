/* Processing Toolbox: searchable tree of ready-to-run tools. Double-click (or Enter) runs a tool. */
'use strict';
const Toolbox = (() => {
  const tree = document.getElementById('toolTree'), search = document.getElementById('tbSearch');
  const T = () => [
    { id: 't-sim', name: 'Simulation', icon: 'play', tools: [
      ['Play / pause the season', 'play', () => Act.togglePlay(), 'run animate pause start stop'],
      ['Restart the season from day 1', 'restart', () => Act.restart(), 'rewind begin'],
      ['Run 20-year season simulation', 'chart', () => Act.runSeason(), 'years yearly dashboard charts'],
      ['Reset all settings to default', 'reset', () => Act.resetSettings(), 'default clear'] ] },
    { id: 't-case', name: 'Ready-made cases', icon: 'layers', tools: (E.metaData ? E.metaData.presets.filter(p => p[0] !== '') : []).map(p => [p[1].replace(/^Default: /, 'Default: '), 'field', () => Act.preset(p[0]), 'scenario case example preset']) },
    { id: 't-design', name: 'Irrigation design', icon: 'pipe', tools: [
      ['Open surface irrigation design', 'pipe', () => Layers.open('sid'), 'border furrow basin surface'],
      ['Optimise surface layout (best design)', 'run', () => Act.optimise(), 'optimum best length width cutoff'],
      ['Open drip irrigation design', 'drop', () => Layers.open('drip'), 'emitter lateral dripline'],
      ['Open sprinkler design and pipes', 'sprinkler', () => Layers.open('spr'), 'pipe lateral mainline pump nozzle layout'],
      ['Use overhead sprinkler method', 'sprinkler', () => E.set({ method: 'M01_Overhead' }), 'overhead'],
      ['Use surface method', 'pipe', () => E.set({ method: 'M02_Surface' }), 'furrow'],
      ['Use drip 20 to 30 cm method', 'drop', () => E.set({ method: 'M06_Drip20-30cm' }), 'subsurface'] ] },
    { id: 't-cmp', name: 'Compare and review', icon: 'chart', tools: [
      ['Pin current results as baseline', 'pin', () => Dash.pin(), 'reference compare'],
      ['Clear baseline', 'reset', () => Dash.clearPin(), 'compare'],
      ['Show results dashboard', 'chart', () => Dash.tab('results'), 'kpi'],
      ['Show design results', 'pipe', () => Dash.tab('design'), 'efficiency uniformity'],
      ['Show yearly charts', 'chart', () => Dash.tab('charts'), 'plot'] ] },
    { id: 't-exp', name: 'Export', icon: 'save', tools: [
      ['Save picture of the window (PNG)', 'img', () => Act.exportPNG(), 'image screenshot'],
      ['Save yearly results (CSV)', 'csv', () => Act.exportSeasonCSV(), 'spreadsheet excel numbers'],
      ['Save design results (CSV)', 'csv', () => Act.exportDesignCSV(), 'spreadsheet'],
      ['Save project (.swafl)', 'save', () => Act.saveProject(), 'settings'],
      ['Print / save as PDF', 'print', () => Act.print(), 'report pdf'] ] }
  ];
  let q = '';
  function render() {
    const ql = q.trim().toLowerCase();
    let h = '';
    T().forEach(g => {
      const items = g.tools.map((t, i) => ({ t, i })).filter(o => !ql || (o.t[0] + ' ' + o.t[3] + ' ' + g.name).toLowerCase().includes(ql));
      if (!items.length) return;
      const col = !ql && Toolbox.col[g.id];
      h += '<div class="tn grp" data-g="' + g.id + '"><span class="tw">' + (col ? '&#9654;' : '&#9660;') + '</span>' + UI.icon(g.icon) + '<span class="lbl">' + g.name + '</span></div><div class="tkids" ' + (col ? 'hidden' : '') + '>';
      items.forEach(o => { h += '<div class="tn' + (ql ? ' hit' : '') + '" style="padding-left:32px" data-g="' + g.id + '" data-i="' + o.i + '" title="Double-click to run">' + UI.icon(o.t[1]) + '<span class="lbl">' + UI.esc(o.t[0]) + '</span></div>'; });
      h += '</div>';
    });
    tree.innerHTML = h || '<div class="pnote" style="padding:10px">No tool matches &ldquo;' + UI.esc(q) + '&rdquo;.</div>';
  }
  const run = n => { const g = T().find(x => x.id === n.dataset.g); if (!g) return; const t = g.tools[+n.dataset.i]; if (t) { UI.log('Tool: ' + t[0]); t[2](); } };
  let selEl = null;
  tree.addEventListener('click', e => {
    const n = e.target.closest('.tn'); if (!n) return;
    if (n.dataset.i === undefined) { Toolbox.col[n.dataset.g] = !Toolbox.col[n.dataset.g]; render(); return; }
    tree.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); n.classList.add('sel'); selEl = n;
  });
  tree.addEventListener('dblclick', e => { const n = e.target.closest('.tn[data-i]'); if (n) run(n); });
  search.addEventListener('input', () => { q = search.value; render(); });
  search.addEventListener('keydown', e => { if (e.key === 'Enter') { const n = tree.querySelector('.tn[data-i]'); if (n) run(n); } });
  return { render, col: {} };
})();
