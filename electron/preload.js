const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Backend communication
  sendToBackend: (data) => ipcRenderer.invoke('send-to-backend', data),
  onBackendMessage: (callback) => ipcRenderer.on('backend-message', callback),
  removeBackendListener: () => ipcRenderer.removeAllListeners('backend-message')
});