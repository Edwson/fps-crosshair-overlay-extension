// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Mouse events IPC
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  // Store IPC
  storeGet: async (key) => ipcRenderer.invoke('electron-store-get', key),
  storeSet: (key, value) => ipcRenderer.send('electron-store-set', key, value),
  // i18n IPC
  getI18nResources: async () => ipcRenderer.invoke('get-i18n-resources'),
});
console.log('Preload script updated with getI18nResources.');
