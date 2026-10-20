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
    title: 'SWAFL', backgroundColor: '#E8EEF5', show: false,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  Menu.setApplicationMenu(null);              // SWAFL draws its own menu bar (File, Edit, Tools, Refresh, Review, Run, Help)
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
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
ipcMain.handle('quit', () => app.quit());
ipcMain.handle('fullscreen', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.handle('reload-app', () => { if (win) win.webContents.reloadIgnoringCache(); });
ipcMain.handle('version', () => app.getVersion());
