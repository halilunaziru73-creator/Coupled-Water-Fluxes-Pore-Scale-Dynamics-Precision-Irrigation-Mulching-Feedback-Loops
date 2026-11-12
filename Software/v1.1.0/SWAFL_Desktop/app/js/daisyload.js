/* Loads the Daisy workbench after the program is on the screen, and not before. The workbench is about 40 scripts that are only needed
   when someone opens a Daisy layer, so the first screen no longer waits for them. A call to DaisyUI.open() before they are loaded waits for them. */
'use strict';
var DaisyUI = { lazy: true, open: function (t) { return window.DaisyLoad.ready().then(function () { return DaisyUI.lazy ? null : DaisyUI.open(t); }); } };
window.DaisyLoad = (() => {
  const V = window.SWAFL_V || '20261112p', L = ['js/daisyio.js', 'js/daisyph.js', 'js/daisycalc.js', 'js/daisyparams.js', 'js/daisyscen.js', 'js/daisycrops.js', 'js/daisyexp.js', 'js/daisyexpspec.js', 'js/daisyai.js', 'js/daisycite.js', 'js/daisyplot.js', 'js/daisyfigkit.js', 'js/daisyexpfig.js', 'js/daisyexpts.js', 'js/daisyexpadv.js', 'js/daisyexpeff.js', 'js/daisyonline.js', 'js/daisycode.js', 'js/daisyfactorhelp.js', 'js/daisyui.js', 'js/daisygallery.js', 'js/daisycmp.js', 'js/daisylearn.js', 'js/daisymanual.js', 'js/daisycurves.js', 'js/daisysum.js', 'js/daisyfig.js', 'js/daisyraw.js', 'js/daisydiag.js', 'js/daisytabs.js', 'js/daisyrefbook.js', 'js/daisybuild.js', 'js/daisychapters.js', 'js/daisyref.js', 'js/daisyexpui.js', 'js/daisyproc.js', 'js/daisyflow.js'];
  let p = null; const failed = [];
  const one = src => new Promise(res => { const s = document.createElement('script'); s.src = src + '?v=' + V; s.async = false; s.onload = () => res(); s.onerror = () => { failed.push(src); res(); }; document.head.appendChild(s); });
  const ready = () => p || (p = (async () => { for (const s of L) await one(s); if (!window.DaisyRef) { await one('js/daisyrefbook.js'); await one('js/daisyref.js'); }  /* a file that did not run the first time gets a second try */ if (failed.length && window.Guard) Guard.say('These Daisy files could not be loaded: ' + failed.join(', ') + '. Reload the page; if it persists, the app folder is incomplete.'); return !failed.length; })());
  const idle = () => { (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => { ready(); }, { timeout: 4000 }); };
  if (document.readyState === 'complete') setTimeout(idle, 600); else window.addEventListener('load', () => setTimeout(idle, 600));
  return { ready, failed };
})();
