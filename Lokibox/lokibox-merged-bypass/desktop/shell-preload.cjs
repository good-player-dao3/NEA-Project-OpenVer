const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('browserControls', {
  state: () => ipcRenderer.invoke('browser:state'),
  navigate: url => ipcRenderer.invoke('browser:navigate', url),
  back: () => ipcRenderer.invoke('browser:back'),
  forward: () => ipcRenderer.invoke('browser:forward'),
  reload: () => ipcRenderer.invoke('browser:reload'),
  home: () => ipcRenderer.invoke('browser:home'),
  devTools: () => ipcRenderer.invoke('browser:devtools'),
  onState: callback => {
    const listener = (_, state) => callback(state);
    ipcRenderer.on('browser:state', listener);
    return () => ipcRenderer.removeListener('browser:state', listener);
  },
});