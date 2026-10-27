const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('swafl', {
  isDesktop: true,
  openExternal: url => ipcRenderer.invoke('open-external', url),
  saveFile: (name, data, isBase64) => ipcRenderer.invoke('save-file', { name, data, isBase64 }),
  openFile: () => ipcRenderer.invoke('open-file'),
  quit: () => ipcRenderer.invoke('quit'),
  toggleFullscreen: () => ipcRenderer.invoke('fullscreen'),
  reload: () => ipcRenderer.invoke('reload-app'),
  version: () => ipcRenderer.invoke('version'),
  openManual: () => ipcRenderer.invoke('open-manual'),
  daisyRun: o => ipcRenderer.invoke('daisy-run', o),
  httpGet: u => ipcRenderer.invoke('http-get', u)
});
