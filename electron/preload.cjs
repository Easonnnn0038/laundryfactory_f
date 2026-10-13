const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('factory:get-version'),
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome
  }
})
