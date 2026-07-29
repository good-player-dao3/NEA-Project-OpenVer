const { ipcRenderer } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function isDao3Page() {
  return location.protocol === 'https:' && (location.hostname === 'dao3.fun' || location.hostname.endsWith('.dao3.fun'));
}

if (isDao3Page()) {
  globalThis.__lokiboxDisableTimeMock = true;
  const bundleDirectory = path.join(__dirname, '..', 'dist-desktop');
  const pluginSource = fs.readFileSync(path.join(bundleDirectory, 'lokibox.iife.js'), 'utf8');
  const pluginStyles = fs.readFileSync(path.join(bundleDirectory, 'lokibox.css'), 'utf8');
  const activeProfile = ipcRenderer.sendSync('profiles:get-active');
  const authToken = activeProfile?.authToken || '';

  if (authToken) {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === 'AUTH' || key === 'AUTHORIZATION') {
        return authToken;
      }
      return originalGetItem.call(this, key);
    };
    localStorage.setItem('AUTH', authToken);
    localStorage.setItem('AUTHORIZATION', authToken);
  } else {
    localStorage.removeItem('AUTH');
    localStorage.removeItem('AUTHORIZATION');
  }

  const style = document.createElement('style');
  style.textContent = pluginStyles;
  document.addEventListener('DOMContentLoaded', () => document.head.append(style), {
    once: true,
  });

  globalThis.eval(pluginSource);
}