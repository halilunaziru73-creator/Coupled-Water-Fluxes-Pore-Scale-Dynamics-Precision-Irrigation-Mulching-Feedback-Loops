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
  openManual: page => ipcRenderer.invoke('open-manual', page),
  daisyInfo: () => ipcRenderer.invoke('daisy-info'),
  daisyChoose: () => ipcRenderer.invoke('daisy-choose'),
  daisyEnsure: () => ipcRenderer.invoke('daisy-ensure'),
  daisyPick: () => ipcRenderer.invoke('daisy-pick'),
  daisyJob: j => ipcRenderer.invoke('daisy-job', j),
  daisyRunsDir: () => ipcRenderer.invoke('daisy-runs-dir'),
  daisyReadFile: p => ipcRenderer.invoke('daisy-read-file', p),
  daisyListRuns: () => ipcRenderer.invoke('daisy-list-runs'),
  daisyWrite: (d, f) => ipcRenderer.invoke('daisy-write', d, f),
  daisyOpenFolder: p => ipcRenderer.invoke('daisy-open-folder', p),
  httpGet: (u, bin) => ipcRenderer.invoke('http-get', u, bin)
});
