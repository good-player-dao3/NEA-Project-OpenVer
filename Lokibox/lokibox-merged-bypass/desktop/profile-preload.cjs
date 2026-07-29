const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dao3Profiles', {
  list: () => ipcRenderer.invoke('profiles:list'),
  create: profile => ipcRenderer.invoke('profiles:create', profile),
  remove: id => ipcRenderer.invoke('profiles:delete', id),
  activate: id => ipcRenderer.invoke('profiles:activate', id),
  deactivate: () => ipcRenderer.invoke('profiles:deactivate'),
});