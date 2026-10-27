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
  fs.mkdirSync(path.dirname(daisyCfg()), { recursive: true }); fs.writeFileSync(daisyCfg(), JSON.stringify({ exe: r.filePaths[0] })); const e = r.filePaths[0]; return { found: true, exe: e, home: DR.homeFor(e), version: DR.version(e) };
});
ipcMain.handle('daisy-job', async (_e, job) => {
  const exe = exeNow(); if (!exe) return { code: -2, err: 'The Daisy program was not found. Install Daisy or choose the program.', logs: {}, out: '' };
  if (job && job.copyBundle) job.copyDir = path.join(__dirname, 'app', 'data', 'daisy', 'scenarios', 'common');
  try { const r = await DR.runJob(job, { exe, timeoutMs: (job && job.timeoutMs) || 1800000 }); DR.clean(r.dir); delete r.dir; return r; } catch (e) { return { code: -1, err: String(e.message), logs: {}, out: '' }; }
});
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
