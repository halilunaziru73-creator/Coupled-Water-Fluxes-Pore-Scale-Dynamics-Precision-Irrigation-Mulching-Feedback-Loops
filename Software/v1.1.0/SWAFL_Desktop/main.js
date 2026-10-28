// SWAFL desktop - Electron main process.
// A local static server (127.0.0.1) serves the workbench and the simulation engine from the SAME origin,
// which lets the workbench drive the engine (iframe) directly.
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const path = require('path'), fs = require('fs');
const { listen } = require('./serve');

let win = null, srv = null;

async function createWindow() {
  const root = path.join(__dirname, 'app');
  const { server, port } = await listen(root, 0);
  srv = server;
  win = new BrowserWindow({
    width: 1480, height: 900, minWidth: 1000, minHeight: 640,
    title: 'SWAFL ' + app.getVersion(), backgroundColor: '#E8EEF5', show: false,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  Menu.setApplicationMenu(null);              // SWAFL draws its own menu bar (File, Edit, Tools, Refresh, Review, Run, Help)
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  try { await win.webContents.session.clearCache(); } catch (e) {}   // always load the files of this version
  win.setTitle('SWAFL ' + app.getVersion());
  win.loadURL('http://127.0.0.1:' + port + '/index.html');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(createWindow);
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
ipcMain.handle('daisy-info', () => { const e = exeNow(); return e ? { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e) } : { found: false }; });
ipcMain.handle('daisy-choose', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Choose the Daisy program (' + DR.EXE + ')', properties: ['openFile'], filters: process.platform === 'win32' ? [{ name: 'Daisy', extensions: ['exe'] }] : [] });
  if (r.canceled || !r.filePaths[0]) return { found: false, cancelled: true };
  if (DR.isInstaller(r.filePaths[0])) return { found: false, installer: true, error: 'That file is the Daisy installer (it asks for administrator rights and cannot be run as the program). SWAFL has Daisy built in, so you do not need to choose a file. To use your own installation, run the installer once and then choose bin\\daisy-bin.exe in the folder where it installed Daisy.' };
  fs.mkdirSync(path.dirname(daisyCfg()), { recursive: true }); fs.writeFileSync(daisyCfg(), JSON.stringify({ exe: r.filePaths[0] })); const e = r.filePaths[0]; return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e) };
});
ipcMain.handle('daisy-job', async (_e, job) => {
  const exe = exeNow(); if (!exe) return { code: -2, err: 'The Daisy program was not found. Install Daisy or choose the program.', logs: {}, out: '' };
  if (job && job.copyBundle) job.copyDir = path.join(__dirname, 'app', 'data', 'daisy', 'scenarios', 'common');
  try {
    const r = await DR.runJob(job, { exe, timeoutMs: (job && job.timeoutMs) || 1800000 });
    // keep the whole run folder (set-up files and the raw Daisy logs, untouched) so that it can be checked and reused outside SWAFL
    try { const root = runsRoot(); fs.mkdirSync(root, { recursive: true }); const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19), clean = t => String(t || '').replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60), nm = clean((job && job.scenario ? job.scenario + '_' : '') + ((job && job.label) || 'run')), grp = clean(job && job.group), rid = clean(job && job.runId); let base = grp ? path.join(root, grp) : root, dest = path.join(base, grp ? (rid ? rid + '_' : '') + nm : stamp + '_' + nm), k = 1; fs.mkdirSync(base, { recursive: true }); while (fs.existsSync(dest)) dest = dest.replace(/_\d+$/, '') + '_' + (++k); fs.cpSync(r.dir, dest, { recursive: true }); r.saved = dest; } catch (e) { r.savedError = String(e.message); }
    DR.clean(r.dir); delete r.dir; return r;
  } catch (e) { return { code: -1, err: String(e.message), logs: {}, out: '' }; }
});
const runsRoot = () => path.join(app.getPath('documents'), 'SWAFL Daisy runs');
ipcMain.handle('daisy-runs-dir', () => { const r = runsRoot(); try { fs.mkdirSync(r, { recursive: true }); } catch (e) { } return r; });
// reads one file of a saved run (only inside the runs folder)
ipcMain.handle('daisy-read-file', async (_e, p) => { const root = path.resolve(runsRoot()), t = path.resolve(String(p || '')); if (t.indexOf(root) !== 0) return null; try { const st = fs.statSync(t); if (!st.isFile() || st.size > 300e6) return null; return fs.readFileSync(t, 'utf8'); } catch (e) { return null; } });
// opens a folder of saved Daisy runs in the file explorer (only inside the runs folder)
ipcMain.handle('daisy-open-folder', async (_e, p) => { const root = path.resolve(runsRoot()), t = path.resolve(String(p || root)); if (t.indexOf(root) !== 0) return false; try { fs.mkdirSync(t, { recursive: true }); } catch (e) { } const er = await shell.openPath(t); return !er; });
const HTTP_OK = /^https:\/\/(dmigw\.govcloud\.dk|api\.dataforsyningen\.dk|data\.geus\.dk|hip\.dataforsyningen\.dk)\//i;
ipcMain.handle('http-get', async (_e, url) => {
  if (!HTTP_OK.test(String(url))) return { status: 403, body: 'host not allowed' };
  try { const r = await fetch(url); return { status: r.status, body: await r.text() }; } catch (e) { return { status: 0, body: String(e.message) }; }
});
ipcMain.handle('quit', () => app.quit());
ipcMain.handle('fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.handle('reload-app', () => { if (win) win.webContents.reloadIgnoringCache(); });
ipcMain.handle('version', () => app.getVersion());
// F1: the manual of this version , shipped with the program or, when run from the source, in docs/manual_v1.1.0
const MAN11 = 'SWAFL_Manual_v1.1.0.pdf';
ipcMain.handle('open-manual', async () => {
  const cands = [path.join(process.resourcesPath || '', MAN11), path.join(__dirname, 'docs', 'manual_v1.1.0', MAN11), path.join(process.resourcesPath || '', 'SWAFL_Manual.pdf'), path.join(__dirname, 'docs', 'SWAFL_Manual.pdf')];
  const f = cands.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
  if (f) { const err = await shell.openPath(f); return !err; }
  shell.openExternal('https://github.com/halilunaziru73-creator/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/blob/main/Software/v1.1.0/SWAFL_Desktop/docs/manual_v1.1.0/' + MAN11); return true;
});
