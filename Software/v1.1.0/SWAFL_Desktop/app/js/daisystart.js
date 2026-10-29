/* Daisy window, Start here: what do you want to do? Big cards for a beginner, and the full set of tools for a researcher.
   Simple hides the tools for building and testing; Researcher shows everything. The choice is remembered when the browser storage is available. */
'use strict';
(() => {
  const D = DaisyUI, esc = D.esc;
  let mode = 'simple'; try { mode = localStorage.getItem('swafl.daisymode') || 'simple'; } catch (e) { }
  const CARDS = [
    ['1', 'Try a ready example', 'Five ready-made questions (irrigation, nitrogen, climate, a chemical, soil) with their figures.', 'Open the examples', 'scen', 0],
    ['2', 'Use my own site', 'Give the weather and the soil of your field once; every run and figure then uses them.', 'Give my data', 'data', 0],
    ['3', 'Ask my own question', 'Write the question or pick factors; Daisy runs the whole set and draws the results.', 'Design an experiment', 'exp', 0],
    ['4', 'See what happens inside', 'The map of the processes of Daisy: click a box to see its figures.', 'Open the process map', 'proc', 0],
    ['5', 'Plot and compare', 'Plot any log, check a mass balance, compare runs against measurements.', 'Plot and compare', 'plot', 0],
    ['6', 'Take it to the SWAFL project', 'Send the results to the layers that turn them into irrigation decisions.', 'To the SWAFL project', 'dss', 0],
    ['7', 'Load Daisy files', 'Logs, weather files and set-ups from earlier runs.', 'Files', 'files', 1],
    ['8', 'Mass balance and tests', 'Close the water, nitrogen and carbon balance of a run; compare and test.', 'Mass balance', 'balance', 1],
    ['9', 'Build and calibrate', 'Edit the set-up, look at the soil column and the process curves, calibrate against data.', 'Set-up editor', 'editor', 1],
    ['10', 'Model and documentation', 'The reference manual of Daisy, chapter by chapter, with search.', 'Documentation', 'docs', 1]
  ];
  const card = c => '<div class="dzSc"><span class="dzSn">' + c[0] + '</span><h4>' + esc(c[1]) + '</h4><p>' + esc(c[2]) + '</p><button class="btn pri" data-go="' + c[4] + '">' + esc(c[3]) + ' &#9654;</button></div>';
  function html() {
    const desk = D.isDesk && D.isDesk();
    return '<div class="dzStart"><div class="dzSh"><div><h2>What do you want to do?</h2><p>Pick a card. Every step of Daisy is on one of them, and the bar at the top of each page tells you what to press next.</p></div>' +
      '<div class="dzSm" role="group" aria-label="Level"><button data-mode="simple" class="' + (mode === 'simple' ? 'on' : '') + '">Simple</button><button data-mode="pro" class="' + (mode === 'pro' ? 'on' : '') + '">Researcher</button></div></div>' +
      '<div class="dzSs"><span class="' + (desk ? 'ok' : 'no') + '">' + (desk ? 'Daisy runs on this computer' : 'This is the web version: you can plan, edit and draw here; Daisy itself runs in the desktop app') + '</span></div>' +
      '<div class="dzSg">' + CARDS.filter(c => !c[5]).map(card).join('') + '</div>' +
      '<div class="dzSr" ' + (mode === 'pro' ? '' : 'hidden') + '><h3>For the researcher</h3><div class="dzSg">' + CARDS.filter(c => c[5]).map(card).join('') + '</div></div>' +
      '<div class="dzSq"><b>Quick start</b> in three steps: <span>1 give your site (card 2)</span> <span>2 run a ready example or your own question (card 1 or 3)</span> <span>3 read the figures and take them to the project (card 6)</span></div></div>';
  }
  function applyMode() {
    document.querySelectorAll('.dztg').forEach(g => { if (/^Tools/.test(g.dataset.g || '')) g.style.display = mode === 'simple' ? 'none' : ''; });
    const r = document.querySelector('.dzSr'); if (r) r.hidden = mode === 'simple';
    document.querySelectorAll('.dzSm button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  }
  function bind() {
    const host = document.getElementById('dzBody'); host.querySelectorAll('[data-go]').forEach(b => b.onclick = () => D.show(b.dataset.go));
    host.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; try { localStorage.setItem('swafl.daisymode', mode); } catch (e) { } applyMode(); });
    applyMode();
  }
  const css = '.dzStart{max-width:1180px;margin:0 auto;padding:4px 6px 16px}.dzSh{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.dzSh h2{margin:4px 0 4px;color:#0A246A;font-size:22px}.dzSh p{margin:0;color:#333;max-width:70ch}' +
    '.dzSm{display:flex}.dzSm button{padding:7px 18px;border:1px solid #6a6a6a;background:#ece9d8;font-weight:600;cursor:pointer}.dzSm button.on{background:#0A246A;color:#fff}.dzSs{margin:10px 0}.dzSs span{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px}.dzSs .ok{background:#e3f4e5;color:#1b5e20;border:1px solid #a5d6a7}.dzSs .no{background:#fff4d6;color:#7a5a00;border:1px solid #e6cf8a}' +
    '.dzSg{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:8px 0}.dzSc{position:relative;background:#fff;border:1px solid #9aa5b1;border-top:4px solid #0A246A;border-radius:6px;padding:14px 14px 12px;display:flex;flex-direction:column;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,.12)}' +
    '.dzSc h4{margin:0;font-size:16px;color:#0A246A;padding-right:30px}.dzSc p{margin:0;flex:1;color:#333;line-height:1.4}.dzSn{position:absolute;right:10px;top:8px;width:24px;height:24px;border-radius:50%;background:#e8eef8;color:#0A246A;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:12px}' +
    '.dzSc .btn{align-self:flex-start;padding:6px 14px}.dzSr h3{margin:14px 0 2px;color:#444}.dzSq{margin-top:12px;padding:10px 12px;background:#eef4fb;border:1px solid #c5d3e6;border-radius:6px}.dzSq span{display:inline-block;margin:2px 6px;padding:2px 10px;background:#fff;border:1px solid #c5d3e6;border-radius:12px}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  window.DaisyStart = { applyMode };
  D.register('start', { html, bind });
})();
