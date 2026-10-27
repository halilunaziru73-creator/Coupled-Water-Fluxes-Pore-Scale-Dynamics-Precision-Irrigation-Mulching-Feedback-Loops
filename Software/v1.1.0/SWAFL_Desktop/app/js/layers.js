/* Layers panel (project tree), document tabs and the view bar. Click a layer to open it, click a sub-layer to jump to that section. */
'use strict';
const Layers = (() => {
  const GROUPS = [
    { id: 'g-design', name: 'Irrigation design', icon: 'pipe', items: [['sid', 'Surface irrigation design', 'S2'], ['drip', 'Drip irrigation design', 'S3'], ['spr', 'Sprinkler design and pipes', 'S4']] },
    { id: 'g-ctrl', name: 'Irrigation control', icon: 'drop', items: [['v1', 'Sensor and trigger', 'V1'], ['n1', 'Trigger law', 'N1']] },
    { id: 'g-mulch', name: 'Mulch and evaporation', icon: 'layers', items: [['v4', 'Mulch against bare soil', 'V4'], ['v6', 'Mulch control', 'V6'], ['e1', 'Evaporation physics', 'E1'], ['n2', 'Fate of saved water', 'N2'], ['n3', 'Regime map', 'N3']] },
    { id: 'g-soil', name: 'Soil structure and tillage', icon: 'soil', items: [['v3', 'Tillage and structure', 'V3'], ['v7', 'Soil hydraulic drivers', 'V7'], ['r1', 'Root structure', 'R1']] },
    { id: 'g-water', name: 'Field water balance', icon: 'field', items: [['field', 'Field balance', ''], ['spac', 'Soil, plant and air', 'S1'], ['v2', 'Profile evolution', 'V2']] },
    { id: 'g-year', name: 'Seasonal data', icon: 'refresh', items: [['yby', 'Reliability over 20 seasons', 'Y1'], ['wb2', 'Full water balance', 'W1'], ['nb', 'Nitrogen budget', 'N4']] },
    { id: 'g-crop', name: 'Crops', icon: 'drop', items: [['crop', 'Crop water requirement', 'C1']] },
    { id: 'g-daisy', name: 'Daisy model', icon: 'soil', items: [['dz-files', 'Daisy files and library', ''], ['dz-plot', 'Plots of Daisy logs', ''], ['dz-balance', 'Mass balance', ''], ['dz-compare', 'Compare and test', ''], ['dz-editor', 'Set-up editor', ''], ['dz-library', 'Soils, crops, fertilisers', ''], ['dz-richards', 'Soil column (Richards)', ''], ['dz-calib', 'Calibration', ''], ['dz-weather', 'Daisy and DMI weather', ''], ['dz-deni', 'Denitrification', '']] },
    { id: 'g-loop', name: 'Feedback loops', icon: 'refresh', items: [['v5', 'Feedback loops', 'V5']] }
  ];
  const DESIGN = ['sid', 'drip', 'spr'];
  let tabs = [], cur = null, started = false, collapsed = { 'g-water': true, 'g-ctrl': true, 'g-soil': true, 'g-mulch': true, 'g-loop': true, 'g-design': true, 'g-crop': true, 'g-year': true, 'g-daisy': true, 's-sid': true, 's-drip': true, 's-spr': true }, sectionPick = {};
  const groupOf = id => { const g = GROUPS.find(x => x.items.some(i => i[0] === id)); return g && g.id; };
  const reveal = (id, sec) => { collapsed['root'] = false; const g = groupOf(id); if (g) collapsed[g] = false; if (sec) collapsed['s-' + id] = false; };
  const tree = document.getElementById('layerTree');

  const nameOf = id => { for (const g of GROUPS) for (const it of g.items) if (it[0] === id) return it[1]; return id; };
  const sections = id => { const s = (E.snap && E.snap.sec && E.snap.sec[id]) || {}; return Object.entries(s).sort((a, b) => a[1][0] - b[1][0]).map(e => e[0]); };

  function render() {
    const open = id => !collapsed[id];
    let h = '<div class="tn grp" data-id="root"><span class="tw">' + (open('root') ? '&#9660;' : '&#9654;') + '</span>' + UI.icon('folder') + '<span class="lbl">SWAFL project</span></div><div class="tkids" ' + (open('root') ? '' : 'hidden') + '>';
    GROUPS.forEach(g => {
      h += '<div class="tn grp" style="padding-left:14px" data-id="' + g.id + '"><span class="tw">' + (open(g.id) ? '&#9660;' : '&#9654;') + '</span>' + UI.icon(g.icon) + '<span class="lbl">' + g.name + '</span></div><div class="tkids" ' + (open(g.id) ? '' : 'hidden') + '>';
      g.items.forEach(it => {
        const subs = DESIGN.includes(it[0]) ? sections(it[0]) : [], hasKids = DESIGN.includes(it[0]), op = open('s-' + it[0]);
        h += '<div class="tn' + (cur === it[0] && !sectionPick[it[0]] ? ' sel' : '') + '" style="padding-left:30px" data-scene="' + it[0] + '"><span class="tw" data-twist="' + it[0] + '">' + (hasKids ? (op ? '&#9660;' : '&#9654;') : '') + '</span>' + UI.icon('doc') + '<span class="lbl">' + UI.esc(it[1]) + '</span>' + '</div>';
        if (hasKids) {
          h += '<div class="tkids" ' + (op ? '' : 'hidden') + '>';
          subs.forEach(t => { h += '<div class="tn' + (cur === it[0] && sectionPick[it[0]] === t ? ' sel' : '') + '" style="padding-left:58px" data-scene="' + it[0] + '" data-sec="' + UI.esc(t) + '" title="' + UI.esc(t) + '"><span class="lbl">' + UI.esc(short(t)) + '</span></div>'; });
          h += '</div>';
        }
      });
      h += '</div>';
    });
    h += '</div>';
    tree.innerHTML = h;
  }

  tree.addEventListener('click', e => {
    const tw = e.target.closest('[data-twist]');
    if (tw) { const k = 's-' + tw.dataset.twist; collapsed[k] = !collapsed[k]; render(); e.stopPropagation(); return; }
    const n = e.target.closest('.tn'); if (!n) return;
    if (n.dataset.id) { collapsed[n.dataset.id] = !collapsed[n.dataset.id]; render(); return; }
    open(n.dataset.scene, n.dataset.sec);
  });
  tree.addEventListener('contextmenu', e => {
    const n = e.target.closest('[data-scene]'); if (!n) return; e.preventDefault();
    UI.showMenu([{ label: 'Open layer', icon: 'open', act: () => open(n.dataset.scene, n.dataset.sec) }, { label: 'Go to top', act: () => { open(n.dataset.scene); E.scrollTop(); } }, { label: 'Close tab', act: () => closeTab(n.dataset.scene) }], e.clientX, e.clientY);
  });

  function open(id, sec) {
    if (String(id).indexOf('dz-') === 0) { try { DaisyUI.open(id.slice(3)); } catch (e) { UI.log('Daisy workbench: ' + e.message); } return; }
    if (!started) { started = true; document.body.classList.remove('nolayer'); }
    if (!tabs.includes(id)) tabs.push(id);
    sectionPick = {}; if (sec) sectionPick[id] = sec;
    const need = !E.snap || E.snap.scene !== id; if (need) E.scene(id);
    if (sec) setTimeout(() => E.scrollTo(id, sec), need ? 260 : 20); else if (need) setTimeout(() => E.scrollTop(), 80);
    cur = id; reveal(id, sec); renderTabs(); render(); renderViewBar(); try { Dash.render(); } catch (e) {}
  }
  function closeTab(id) {
    if (tabs.length <= 1) return; const i = tabs.indexOf(id); tabs = tabs.filter(t => t !== id);
    if (cur === id) open(tabs[Math.max(0, i - 1)]); else renderTabs();
  }
  function renderTabs() {
    const el = document.getElementById('docTabs');
    el.innerHTML = tabs.map(t => '<div class="dt' + (t === cur ? ' on' : '') + '" data-t="' + t + '">' + UI.icon('doc') + '<span>' + UI.esc(nameOf(t)) + '</span>' + (tabs.length > 1 ? '<span class="x" data-x="' + t + '">&#10005;</span>' : '') + '</div>').join('');
  }
  document.getElementById('docTabs').addEventListener('click', e => {
    const x = e.target.closest('[data-x]'); if (x) { closeTab(x.dataset.x); return; }
    const t = e.target.closest('[data-t]'); if (t) open(t.dataset.t);
  });

  /* View bar: the working views of each design window, mapped to the drawing sections by heading. */
  const VIEWS = {
    sid: [['Layout design', /^Layout in plan/], ['Simulation', /^Longitudinal section/], ['Hydrograph', /^Hydrograph/], ['Advance and opportunity', /^Advance and opportunity/], ['Results', /^Performance indices/], ['Design table', /^Design table/]],
    drip: [['Simulation', /^Soil moisture around/], ['Lateral hydraulics', /^Uniformity along/], ['Layout and pipes', /^Layout and infrastructure/], ['Results', /^Result for this design/], ['Design table', /^Design table/]],
    spr: [['Layout design', /^Layout in plan/], ['Simulation', /^Along the lateral/], ['Pipes and pump', /^Pipes, pump/], ['Infrastructure layout', /^Layout and infrastructure/], ['Results', /^Result for this design/], ['Design checks', /^Does your design pass/], ['Design table', /^Design table/]]
  };
  const short = t => { const p = t.split(':')[0]; return p.length > 64 ? p.slice(0, 61) + '...' : p; };
  function renderViewBar() {
    const el = document.getElementById('viewBar');
    if (!started) { el.innerHTML = ''; return; }
    if (DESIGN.includes(cur)) {
      const secs = sections(cur);
      let h = '<span class="vtitle">' + UI.esc(nameOf(cur)) + '</span>';
      h += '<button class="vb' + (!sectionPick[cur] ? ' on' : '') + '" data-top>Whole design</button>';
      (VIEWS[cur] || []).forEach(v => { const t = secs.find(x => v[1].test(x)); if (t) h += '<button class="vb' + (sectionPick[cur] === t ? ' on' : '') + '" data-sec="' + UI.esc(t) + '" title="' + UI.esc(t) + '">' + v[0] + '</button>'; });
      h += '<button class="vb run" data-vrun title="Run the design simulation, or run it again, without scrolling">&#9654; Run / re-run simulation</button>';
      el.innerHTML = h;
  } else {
      const sc = E.meta && E.metaData ? E.metaData.scenes.find(s => s[0] === cur) : null;
      el.innerHTML = '<span class="vtitle">' + UI.esc(nameOf(cur)) + '</span><span class="pnote">' + UI.esc(sc && sc[2] ? sc[2] : 'Use the Properties panel on the right to change the scenario. The picture updates live.') + '</span>' + '';
    }
  }
  document.getElementById('viewBar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-top')) { sectionPick = {}; E.scrollTop(); renderViewBar(); render(); return; }
    if (b.hasAttribute('data-vrun')) { E.ev("runDesign('" + cur + "')"); E.poll(true); const t = document.querySelector('#dashTabs [data-tab=design]'); if (t) t.click(); try { Dash.render(); } catch (e) {} return; }
    if (b.dataset.sec) open(cur, b.dataset.sec);
  });

  function expandAll() { collapsed = {}; render(); }
  function collapseAll() { GROUPS.forEach(g => { collapsed[g.id] = true; }); collapsed['root'] = false; DESIGN.forEach(d => { collapsed['s-' + d] = true; }); render(); }
  document.querySelector('#layersDock [data-act=expandAll]').onclick = expandAll;
  document.querySelector('#layersDock [data-act=collapseAll]').onclick = collapseAll;

  E.on('scene', s => { if (!started) return; cur = s.scene; if (!tabs.includes(cur)) tabs.push(cur); renderTabs(); render(); renderViewBar(); });
  let lastSec = '';
  E.on('snap', ({ s }) => { const k = JSON.stringify(s.sec); if (k !== lastSec) { lastSec = k; render(); renderViewBar(); } });

  return { GROUPS, render, open, renderTabs, renderViewBar, expandAll, collapseAll, nameOf, current: () => cur, started: () => started, DESIGN };
})();
