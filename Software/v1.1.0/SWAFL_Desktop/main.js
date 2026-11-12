// SWAFL desktop - Electron main process.
// A local static server (127.0.0.1) serves the workbench and the simulation engine from the SAME origin,
// which lets the workbench drive the engine (iframe) directly.
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path'), fs = require('fs');
const { listen } = require('./serve');

// speed: the drawing and the rasterising of the pictures go to the graphics card, a big heap for the engine, no throttling of a window that is in front
try {
  ['ignore-gpu-blocklist', 'enable-gpu-rasterization', 'enable-zero-copy', 'disable-renderer-backgrounding', 'disable-background-timer-throttling'].forEach(f => app.commandLine.appendSwitch(f));
  app.commandLine.appendSwitch('enable-features', 'CanvasOopRasterization');
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
} catch (e) { }

let win = null, srv = null;

// a small window that is on the screen at once, while the program starts, so that nobody waits in front of nothing
let splash = null;
function showSplash() {
  try {
    let img = ''; try { img = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'build', 'icon.png')).toString('base64'); } catch (e) { }
    splash = new BrowserWindow({ width: 420, height: 260, frame: false, resizable: false, movable: true, alwaysOnTop: true, center: true, show: true, skipTaskbar: false, backgroundColor: '#0A246A', title: 'SWAFL', webPreferences: { sandbox: true } });
    const html = '<body style="margin:0;background:linear-gradient(#0A246A,#3A6EA5);color:#fff;font:14px Segoe UI,Tahoma,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;overflow:hidden">' +
      (img ? '<img src="' + img + '" width="84" height="84">' : '') + '<div style="font-size:26px;font-weight:700;margin-top:10px;letter-spacing:1px">SWAFL</div><div style="opacity:.9;margin-top:4px">Soil Water, Atmosphere, Feedback and Layout</div>' +
      '<div style="margin-top:18px;opacity:.9">Starting ...</div><div style="margin-top:8px;width:220px;height:4px;background:rgba(255,255,255,.25);overflow:hidden"><div style="width:90px;height:4px;background:#fff;animation:m 1.1s linear infinite"></div></div><style>@keyframes m{from{margin-left:-90px}to{margin-left:220px}}</style></body>';
    splash.setMenu(null); splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  } catch (e) { splash = null; }
}
function closeSplash() { try { if (splash && !splash.isDestroyed()) splash.close(); } catch (e) { } splash = null; }

async function createWindow() {
  const root = path.join(__dirname, 'app');
  const { server, port } = await listen(root, 0);
  srv = server;
  win = new BrowserWindow({
    width: 1480, height: 900, minWidth: 1000, minHeight: 640,
    title: 'SWAFL ' + app.getVersion(), backgroundColor: '#E8EEF5', show: false,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, spellcheck: false, backgroundThrottling: true }
  });
  Menu.setApplicationMenu(null);              // SWAFL draws its own menu bar (File, Edit, Tools, Refresh, Review, Run, Help)
  win.once('ready-to-show', () => { win.maximize(); win.show(); setTimeout(closeSplash, 150); });
  setTimeout(closeSplash, 30000);
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  try {   // the files of a new version must be loaded afresh; on every other start the cache stays, which makes the start quicker
    const vf = path.join(app.getPath('userData'), 'last-version.txt'); let last = ''; try { last = fs.readFileSync(vf, 'utf8'); } catch (e) { }
    if (last !== app.getVersion() + '|' + process.versions.electron) { await win.webContents.session.clearCache(); try { fs.writeFileSync(vf, app.getVersion() + '|' + process.versions.electron); } catch (e) { } }
  } catch (e) { }
  win.setTitle('SWAFL ' + app.getVersion());
  win.loadURL('http://127.0.0.1:' + port + '/index.html');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => { showSplash(); createWindow(); setTimeout(() => { try { DR.provisionAsync(); } catch (e) { } }, 8000); });
  app.on('window-all-closed', () => { if (srv) srv.close(); app.quit(); });
}

ipcMain.handle('open-external', (_e, url) => { if (/^https?:\/\//i.test(String(url))) { shell.openExternal(url); return true; } return false; });
ipcMain.handle('save-file', async (_e, { name, data, isBase64 }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: name });
  if (r.canceled || !r.filePath) return { ok: false };
  fs.writeFileSync(r.filePath, isBase64 ? Buffer.from(data, 'base64') : data, isBase64 ? undefined : 'utf8');
  return { ok: true, path: r.filePath };
});
ipcMain.handle('open-file', async () => {
  const r = await dialog.showOpenDialog(win, { filters: [{ name: 'SWAFL project', extensions: ['swafl', 'json'] }], properties: ['openFile'] });
  if (r.canceled || !r.filePaths[0]) return { ok: false };
  return { ok: true, path: r.filePaths[0], data: fs.readFileSync(r.filePaths[0], 'utf8') };
});

// ---- Daisy: find and run the Daisy program (daisy-runner.js); the chosen program is remembered
const DR = require('./daisy-runner');
const daisyCfg = () => path.join(app.getPath('userData'), 'daisy.json');
const readCfg = () => { try { return JSON.parse(fs.readFileSync(daisyCfg(), 'utf8')); } catch (e) { return {}; } };
const exeNow = () => DR.findExe(readCfg().exe);
ipcMain.handle('daisy-info', async () => { const e = exeNow(); if (e) return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e) }; return ensureDaisy(); });
// Daisy is found by itself: the copy that comes with SWAFL, its copy in the folder of the user, an installed Daisy, or the installer
// the user has downloaded (run once, silently). The user never has to choose a file.
async function ensureDaisy() {
  let e = exeNow(); if (e) return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e), how: 'found' };
  e = DR.provision(); if (e) return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e), how: 'copied from the Daisy that comes with SWAFL' };
  const inst = DR.findInstaller(); if (inst) { e = await DR.runInstaller(inst); if (e) { fs.mkdirSync(path.dirname(daisyCfg()), { recursive: true }); fs.writeFileSync(daisyCfg(), JSON.stringify({ exe: e })); RUNS_DIR = null; return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e), how: 'installed from ' + path.basename(inst) }; } }
  return { found: false, error: 'Daisy is missing from this copy of SWAFL (the folder daisy next to the program). Unzip the whole SWAFL zip again into a folder of your own (not inside another zip), and start SWAFL from there.' + (inst ? ' The installer ' + path.basename(inst) + ' was found but did not finish: run it once yourself, then press Run again.' : ''), looked: DR.looked() };
}
ipcMain.handle('daisy-choose', () => ensureDaisy());
ipcMain.handle('daisy-ensure', () => ensureDaisy());
// for experts only (Model and documentation): use another Daisy program; an installer chosen here is run, not refused
ipcMain.handle('daisy-pick', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Use another Daisy program (bin\\daisy-bin.exe of an installed Daisy)', properties: ['openFile'], filters: process.platform === 'win32' ? [{ name: 'Daisy', extensions: ['exe'] }] : [] });
  if (r.canceled || !r.filePaths[0]) return { found: false, cancelled: true }; let e = r.filePaths[0];
  if (DR.isInstaller(e)) { e = await DR.runInstaller(e); if (!e) return { found: false, error: 'The installer did not finish.' }; }
  fs.mkdirSync(path.dirname(daisyCfg()), { recursive: true }); fs.writeFileSync(daisyCfg(), JSON.stringify({ exe: e })); RUNS_DIR = null; return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e) };
});
// a run that is asked for again with exactly the same set-up files gives the same logs: they are kept in memory (the last 30 runs) and returned at once
const jobCache = new Map(), jobKey = job => { try { return require('crypto').createHash('sha1').update(JSON.stringify([job.main, job.files, !!job.copyBundle, job.logPattern, job.prefix])).digest('hex'); } catch (e) { return null; } };
ipcMain.handle('daisy-job', async (_e, job) => {
  const ck = job && !job.noCache ? jobKey(job) : null; if (ck && jobCache.has(ck)) { const c = jobCache.get(ck); jobCache.delete(ck); jobCache.set(ck, c); return Object.assign({}, c, { seconds: 0, cached: true }); }
  let exe = exeNow(); if (!exe) { const en = await ensureDaisy(); exe = en.found ? en.exe : null; } if (!exe) return { code: -2, err: 'The Daisy program was not found: unzip the whole SWAFL zip again (the folder daisy must be next to the program).', logs: {}, out: '' };
  if (job && job.copyBundle) job.copyDir = path.join(__dirname, 'app', 'data', 'daisy', 'scenarios', 'common');
  try {
    const r = await DR.runJob(job, { exe, timeoutMs: (job && job.timeoutMs) || 1800000 });
    // keep the whole run folder (set-up files and the raw Daisy logs, untouched) so that it can be checked and reused outside SWAFL
    try { const root = scratchRoot(); fs.mkdirSync(root, { recursive: true }); const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19), clean = t => String(t || '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60), nm = clean((job && job.scenario ? job.scenario + '_' : '') + ((job && job.label) || 'run')), grp = clean(job && job.group), rid = clean(job && job.runId); let base = grp ? path.join(root, grp) : root, dest = path.join(base, grp ? (rid ? rid + '_' : '') + nm : stamp + '_' + nm), k = 1; fs.mkdirSync(base, { recursive: true }); while (fs.existsSync(dest)) dest = dest.replace(/_\d+$/, '') + '_' + (++k); fs.cpSync(r.dir, dest, { recursive: true }); r.saved = dest; r.scratch = true; } catch (e) { r.savedError = String(e.message); }
    DR.clean(r.dir); delete r.dir; if (ck && r.code === 0) { jobCache.set(ck, r); while (jobCache.size > 30) jobCache.delete(jobCache.keys().next().value); } return r;
  } catch (e) { return { code: -1, err: String(e.message), logs: {}, out: '' }; }
});
// the runs are kept next to Daisy itself: "SWAFL runs" in the Daisy folder that runs them (when it can be written; Program Files cannot),
// otherwise next to the Daisy that SWAFL keeps for itself (%LOCALAPPDATA%\SWAFL\Daisy-7.1.14\SWAFL runs). Runs of older versions in
// Documents\SWAFL Daisy runs are still listed and read.
const legacyRoot = () => path.join(app.getPath('documents'), 'SWAFL Daisy runs');
let RUNS_DIR = null;
const writableDir = d => { try { fs.mkdirSync(d, { recursive: true }); const t = path.join(d, '.swafl-write-test'); fs.writeFileSync(t, '1'); fs.unlinkSync(t); return true; } catch (e) { return false; } };
const runsRoot = () => { if (RUNS_DIR) return RUNS_DIR; let e = null; try { e = exeNow(); } catch (x) { } const homes = []; if (e) { homes.push(DR.homeFor(e)); homes.push(path.dirname(path.dirname(e))); } homes.push(DR.ownDir()); for (const h of homes) { if (!h) continue; const d = path.join(h, 'SWAFL runs'); if (writableDir(d)) return (RUNS_DIR = d); } return (RUNS_DIR = legacyRoot()); };
// nothing is kept on the computer until the person chooses a folder: the output of a run waits in a scratch folder that is removed when SWAFL closes
let SCRATCH = null; const USER_DIRS = new Set();
const scratchRoot = () => SCRATCH || (SCRATCH = path.join(require('os').tmpdir(), 'swafl-scratch-' + process.pid));
app.on('will-quit', () => { try { if (SCRATCH) fs.rmSync(SCRATCH, { recursive: true, force: true }); } catch (e) { } });
const allRoots = () => Array.from(new Set([runsRoot(), legacyRoot(), scratchRoot()].map(r => path.resolve(r))));
// saves what waits in the scratch folder into a folder that the person chooses
ipcMain.handle('daisy-save-to', async (_e, dirs, title) => {
  const r = await dialog.showOpenDialog(win, { title: title || 'Choose the folder to save the raw Daisy output in', properties: ['openDirectory', 'createDirectory'], buttonLabel: 'Save here' });
  if (r.canceled || !r.filePaths[0]) return { ok: false, cancelled: true };
  const dest = r.filePaths[0], sr = path.resolve(scratchRoot()); let n = 0; const made = [];
  try {
    const srcs = Array.from(new Set((dirs || []).map(d => path.resolve(String(d))))).filter(d => d.indexOf(sr + path.sep) === 0);
    const tops = Array.from(new Set(srcs.map(d => { const rel = path.relative(sr, d).split(path.sep); return rel.length > 1 ? path.join(sr, rel[0]) : d; })));
    for (const t of tops) { let to = path.join(dest, path.basename(t)), k = 1; while (fs.existsSync(to)) to = path.join(dest, path.basename(t) + '_' + (++k)); fs.cpSync(t, to, { recursive: true }); made.push(to); n++; }
    made.forEach(m => USER_DIRS.add(path.resolve(m))); USER_DIRS.add(path.resolve(dest));
    return { ok: true, dest, made, n };
  } catch (e) { return { ok: false, err: String(e.message) }; }
});
const insideRuns = t => allRoots().some(r => t === r || t.indexOf(r + path.sep) === 0);
ipcMain.handle('daisy-runs-dir', () => { const r = runsRoot(); try { fs.mkdirSync(r, { recursive: true }); } catch (e) { } return r; });
// lists every saved run (a folder that holds .dlf logs) inside the runs folder, newest first: the run library of Run comparison
ipcMain.handle('daisy-list-runs', async () => { const out = []; let root = runsRoot(), pre = ''; const walk = (d, depth) => { if (out.length > 3000 || depth > 4) return; let ents = []; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; } const logs = ents.filter(e => e.isFile() && /\.dlf$/i.test(e.name)).map(e => e.name); if (logs.length) { let mt = 0; try { mt = fs.statSync(d).mtimeMs; } catch (e) { } out.push({ dir: d, rel: pre + path.relative(root, d).split(path.sep).join('/'), logs, mtime: mt }); } ents.filter(e => e.isDirectory()).forEach(e => walk(path.join(d, e.name), depth + 1)); }; try { fs.mkdirSync(root, { recursive: true }); } catch (e) { } walk(root, 0); if (path.resolve(legacyRoot()) !== path.resolve(runsRoot()) && fs.existsSync(legacyRoot())) { root = legacyRoot(); pre = 'Older runs (Documents)/'; walk(root, 0); } out.sort((a, b) => b.mtime - a.mtime); return { root: runsRoot(), runs: out }; });
// reads one file of a saved run (only inside the runs folder)
ipcMain.handle('daisy-read-file', async (_e, p) => { const t = path.resolve(String(p || '')); if (!insideRuns(t)) return null; try { const st = fs.statSync(t); if (!st.isFile() || st.size > 300e6) return null; return fs.readFileSync(t, 'utf8'); } catch (e) { return null; } });
// opens a folder of saved Daisy runs in the file explorer (only inside the runs folder)
// files made by the program for one experiment (tables, plan, figures) are written next to its runs; only inside the runs folder
ipcMain.handle('daisy-write', async (_e, dir, files) => { const base = path.resolve(String(dir || '')); if (!insideRuns(base) || allRoots().indexOf(base) >= 0) return { ok: false, err: 'outside the runs folder' }; let n = 0; try { for (const k of Object.keys(files || {})) { const t = path.resolve(base, k); if (t.indexOf(base) !== 0) continue; fs.mkdirSync(path.dirname(t), { recursive: true }); const v = files[k]; fs.writeFileSync(t, typeof v === 'string' ? v : Buffer.from(v)); n++; } return { ok: true, n, dir: base }; } catch (e) { return { ok: false, err: String(e.message) }; } });
ipcMain.handle('daisy-open-folder', async (_e, p) => { const t = path.resolve(String(p || runsRoot())); if (!insideRuns(t) && !Array.from(USER_DIRS).some(u => t === u || t.indexOf(u + path.sep) === 0)) return false; try { fs.mkdirSync(t, { recursive: true }); } catch (e) { } const er = await shell.openPath(t); return !er; });
const HTTP_OK = /^https:\/\/(dmigw\.govcloud\.dk|api\.dataforsyningen\.dk|data\.geus\.dk|hip\.dataforsyningen\.dk|rest\.isric\.org|maps\.isric\.org)\//i;
ipcMain.handle('http-get', async (_e, url, bin) => {
  if (!HTTP_OK.test(String(url))) return { status: 403, body: 'host not allowed' };
  try { const r = await fetch(url); return { status: r.status, body: bin ? Buffer.from(await r.arrayBuffer()).toString('base64') : await r.text() }; } catch (e) { return { status: 0, body: String(e.message) }; }
});
ipcMain.handle('quit', () => app.quit());
ipcMain.handle('fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.handle('reload-app', () => { if (win) win.webContents.reloadIgnoringCache(); });
ipcMain.handle('version', () => app.getVersion());
// F1: the manual of this version , shipped with the program or, when run from the source, in docs/manual_v1.1.0
const MAN11 = 'SWAFL_Manual_v1.1.0.pdf';
const MAN_REPO = 'halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops';
const MAN_RAW = 'https://raw.githubusercontent.com/' + MAN_REPO + '/main/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf';
const MAN_PAGES = 'https://halilunaziru73-creator.github.io/' + MAN_REPO.split('/')[1] + '/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/SWAFL_Manual_v1.1.0.pdf';
// the manual is not inside a small download: the first time it is needed it is fetched once into the user data folder of SWAFL and kept there
function fetchManual(dest) {
  return new Promise(resolve => {
    const https = require('https'); let done = false; const fin = ok => { if (!done) { done = true; resolve(ok); } };
    const get = (u, n) => { if (n > 5) return fin(false); const rq = https.get(u, { headers: { 'User-Agent': 'SWAFL' } }, rs => {
      if (rs.statusCode >= 300 && rs.statusCode < 400 && rs.headers.location) { rs.resume(); return get(new URL(rs.headers.location, u).href, n + 1); }
      if (rs.statusCode !== 200) { rs.resume(); return fin(false); }
      try { fs.mkdirSync(path.dirname(dest), { recursive: true }); } catch (e) { }
      const tmp = dest + '.part', w = fs.createWriteStream(tmp); rs.pipe(w);
      w.on('finish', () => { try { if (fs.statSync(tmp).size > 1e6) { fs.renameSync(tmp, dest); fin(true); } else fin(false); } catch (e) { fin(false); } });
      w.on('error', () => fin(false)); rs.on('error', () => fin(false)); });
      rq.on('error', () => fin(false)); rq.setTimeout(60000, () => { rq.destroy(); fin(false); }); };
    get(MAN_RAW, 0);
  });
}
const showManual = async (file, page, title) => { try { const mw = new BrowserWindow({ width: 1100, height: 900, title: 'SWAFL manual' + (page ? ', page ' + page : ''), icon: path.join(__dirname, 'build', 'icon.png'), webPreferences: { plugins: true } }); mw.setMenuBarVisibility(false); await mw.loadURL(file + (page ? '#page=' + (+page || 1) : '')); return true; } catch (e) { return false; } };
ipcMain.handle('open-manual', async (_e, page) => {
  const exeDir = path.dirname(process.execPath || ''), cache = path.join(app.getPath('userData'), 'manual', MAN11);
  const cands = [path.join(process.resourcesPath || '', MAN11), path.join(__dirname, 'Manual', MAN11), path.join(__dirname, '..', 'Manual', MAN11), path.join(__dirname, MAN11), path.join(exeDir, 'Manual', MAN11), path.join(exeDir, MAN11), path.join(__dirname, 'docs', 'manual_v1.1.0', MAN11), path.join(process.resourcesPath || '', 'SWAFL_Manual.pdf'), path.join(__dirname, 'docs', 'SWAFL_Manual.pdf'), cache];
  let f = cands.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
  if (!f && await fetchManual(cache)) f = cache;
  // the manual opens in a window of SWAFL itself, at the exact page
  if (f && await showManual(require('url').pathToFileURL(f).href, page)) return true;
  if (f) { const err = await shell.openPath(f); return !err; }
  // no copy and no way to fetch it (offline): the online manual, still inside a SWAFL window at the page, not the GitHub page
  return await showManual(MAN_PAGES, page);
});
