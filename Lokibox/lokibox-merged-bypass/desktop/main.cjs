const {
  app,
  BrowserView,
  BrowserWindow,
  Menu,
  ipcMain,
  safeStorage,
  session,
  shell,
} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const START_URL = 'https://dao3.fun/';
const PROFILE_FILE_NAME = 'dao3-profiles.dat';
const TOOLBAR_HEIGHT = 58;
let mainWindow;
let browserView;
let profileWindow;

function isDao3Host(hostname) {
  return hostname === 'dao3.fun' || hostname.endsWith('.dao3.fun');
}

function profileFilePath() {
  return path.join(app.getPath('userData'), PROFILE_FILE_NAME);
}

function loadProfileStore() {
  try {
    if (!safeStorage.isEncryptionAvailable() || !fs.existsSync(profileFilePath())) {
      return { profiles: [], activeProfileId: null };
    }
    const encrypted = fs.readFileSync(profileFilePath(), 'utf8');
    const parsed = JSON.parse(safeStorage.decryptString(Buffer.from(encrypted, 'base64')));
    if (!Array.isArray(parsed.profiles)) {
      return { profiles: [], activeProfileId: null };
    }
    return {
      profiles: parsed.profiles,
      activeProfileId:
        typeof parsed.activeProfileId === 'string' ? parsed.activeProfileId : null,
    };
  } catch {
    return { profiles: [], activeProfileId: null };
  }
}

function saveProfileStore(store) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('The operating system secure credential store is unavailable.');
  }
  const encrypted = safeStorage.encryptString(JSON.stringify(store));
  fs.writeFileSync(profileFilePath(), encrypted.toString('base64'), 'utf8');
}

function profileSummary(profile) {
  return {
    id: profile.id,
    name: profile.name,
    userAgent: profile.userAgent,
    hasAuthorization: Boolean(profile.authToken),
    hasBoxAuth2: Boolean(profile.boxAuth2),
    cookieCount: profile.cookies.length,
  };
}

function profileSnapshot() {
  const store = loadProfileStore();
  return {
    profiles: store.profiles.map(profileSummary),
    activeProfileId: store.activeProfileId,
  };
}

function normalizeCookie(cookie) {
  if (!cookie || typeof cookie !== 'object') {
    throw new Error('Each cookie must be an object.');
  }
  const name = String(cookie.name ?? '').trim();
  const value = String(cookie.value ?? '');
  const rawDomain = String(cookie.domain ?? '').trim().toLowerCase();
  const rawUrl = String(cookie.url ?? '').trim();
  let hostname;

  if (rawUrl) {
    const parsed = new URL(rawUrl);
    hostname = parsed.hostname;
  } else {
    hostname = rawDomain.replace(/^\./, '');
  }

  if (!name || !hostname || !isDao3Host(hostname)) {
    throw new Error('Cookies must have a name and use a dao3.fun domain.');
  }

  const normalized = {
    url: rawUrl || `https://${hostname}${String(cookie.path ?? '/')}`,
    name,
    value,
    path: String(cookie.path ?? '/'),
    secure: cookie.secure !== false,
    httpOnly: Boolean(cookie.httpOnly),
  };

  if (rawDomain) {
    normalized.domain = rawDomain;
  }
  if (['unspecified', 'no_restriction', 'lax', 'strict'].includes(cookie.sameSite)) {
    normalized.sameSite = cookie.sameSite;
  }
  if (Number.isFinite(cookie.expirationDate)) {
    normalized.expirationDate = Number(cookie.expirationDate);
  }

  return normalized;
}

function normalizeProfile(input) {
  const name = String(input?.name ?? '').trim();
  const userAgent = String(input?.userAgent ?? '').trim();
  const cookies = Array.isArray(input?.cookies) ? input.cookies.map(normalizeCookie) : [];
  const importedAuthorization = cookies.find(cookie => cookie.name.toLowerCase() === 'authorization')?.value ?? '';
  const importedBoxAuth2 = cookies.find(cookie => cookie.name.toLowerCase() === 'box-auth2')?.value ?? '';
  const authToken = String(input?.authToken ?? importedAuthorization).trim();
  const boxAuth2 = String(input?.boxAuth2 ?? importedBoxAuth2).trim();

  if (!name || name.length > 64) {
    throw new Error('Profile name must be between 1 and 64 characters.');
  }
  if (authToken.length > 8192 || boxAuth2.length > 8192 || userAgent.length > 1024) {
    throw new Error('The authorization, box-auth2, or user-agent value is too long.');
  }
  if (!authToken || !boxAuth2) {
    throw new Error('Both authorization and box-auth2 values are required.');
  }

  return { id: randomUUID(), name, authToken, boxAuth2, userAgent, cookies };
}

function dao3SessionCookie(name, value) {
  return {
    url: 'https://dao3.fun/',
    domain: '.dao3.fun',
    path: '/',
    name,
    value,
    secure: true,
    httpOnly: false,
    sameSite: 'lax',
  };
}

function setGlobalUserAgent(userAgent) {
  const value = userAgent || app.userAgentFallback;
  session.defaultSession.setUserAgent(value);
  if (browserView) {
    browserView.webContents.setUserAgent(value);
  }
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.setUserAgent(value);
  }
}

async function clearDao3Cookies() {
  const browserCookies = await session.defaultSession.cookies.get({});
  const daoCookies = browserCookies.filter(cookie => isDao3Host(cookie.domain.replace(/^\./, '')));
  await Promise.all(
    daoCookies.map(cookie =>
      session.defaultSession.cookies.remove(
        `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`,
        cookie.name
      )
    )
  );
}

function activeProfileForPage() {
  const store = loadProfileStore();
  const profile = store.profiles.find(item => item.id === store.activeProfileId);
  return profile ? { authToken: profile.authToken } : null;
}

function normalizeNavigationUrl(rawUrl) {
  const input = String(rawUrl ?? '').trim();
  if (!input) {
    return START_URL;
  }
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input) ? input : `https://${input}`;
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs can be opened in the browser.');
  }
  return parsed.href;
}

function browserState() {
  if (!browserView) {
    return { url: START_URL, canGoBack: false, canGoForward: false, isLoading: false };
  }
  const contents = browserView.webContents;
  return {
    url: contents.getURL() || START_URL,
    canGoBack: contents.canGoBack(),
    canGoForward: contents.canGoForward(),
    isLoading: contents.isLoading(),
  };
}

function publishBrowserState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('browser:state', browserState());
  }
}

async function loadBrowserUrl(rawUrl) {
  if (!browserView) {
    return browserState();
  }
  await browserView.webContents.loadURL(normalizeNavigationUrl(rawUrl));
  return browserState();
}

function resizeBrowserView() {
  if (!mainWindow || !browserView) {
    return;
  }
  const [width, height] = mainWindow.getContentSize();
  browserView.setBounds({ x: 0, y: TOOLBAR_HEIGHT, width, height: Math.max(0, height - TOOLBAR_HEIGHT) });
}

function navigate(action) {
  if (!browserView) {
    return;
  }
  const contents = browserView.webContents;
  if (action === 'back' && contents.canGoBack()) {
    contents.goBack();
  } else if (action === 'forward' && contents.canGoForward()) {
    contents.goForward();
  } else if (action === 'reload') {
    contents.reload();
  } else if (action === 'home') {
    loadBrowserUrl(START_URL);
  }
  publishBrowserState();
}

function toggleDevTools() {
  if (browserView) {
    browserView.webContents.toggleDevTools();
  }
}

async function activateProfile(id) {
  const store = loadProfileStore();
  const profile = store.profiles.find(item => item.id === id);
  if (!profile) {
    throw new Error('Profile not found.');
  }
  if (!profile.authToken || !profile.boxAuth2) {
    throw new Error('This profile is missing authorization or box-auth2. Delete and recreate it.');
  }

  setGlobalUserAgent(profile.userAgent);
  await Promise.all([
    ...profile.cookies.map(cookie => session.defaultSession.cookies.set(cookie)),
    session.defaultSession.cookies.set(dao3SessionCookie('authorization', profile.authToken)),
    session.defaultSession.cookies.set(dao3SessionCookie('box-auth2', profile.boxAuth2)),
  ]);

  store.activeProfileId = profile.id;
  saveProfileStore(store);
  if (browserView) {
    await loadBrowserUrl(START_URL);
  }
  return profileSnapshot();
}

async function deactivateProfile() {
  const store = loadProfileStore();
  store.activeProfileId = null;
  saveProfileStore(store);
  await clearDao3Cookies();
  if (browserView) {
    setGlobalUserAgent('');
    await loadBrowserUrl(START_URL);
  }
  return profileSnapshot();
}

function popupWindowOptions() {
  return {
    width: 980,
    height: 760,
    minWidth: 560,
    minHeight: 500,
    title: 'LokiBox Login',
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  };
}

function allowPopup(url) {
  try {
    normalizeNavigationUrl(url);
    return {
      action: 'allow',
      overrideBrowserWindowOptions: popupWindowOptions(),
    };
  } catch {
    shell.openExternal(url);
    return { action: 'deny' };
  }
}

function configurePopupContents(contents) {
  contents.setWindowOpenHandler(({ url }) => allowPopup(url));
  contents.on('will-navigate', (event, url) => {
    try {
      normalizeNavigationUrl(url);
    } catch {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

function configureBrowserView() {
  browserView.webContents.setWindowOpenHandler(({ url }) => allowPopup(url));
  browserView.webContents.on('did-create-window', childWindow => {
    configurePopupContents(childWindow.webContents);
  });
  browserView.webContents.on('will-navigate', (event, url) => {
    try {
      normalizeNavigationUrl(url);
    } catch {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  for (const eventName of ['did-navigate', 'did-navigate-in-page', 'did-start-loading', 'did-stop-loading']) {
    browserView.webContents.on(eventName, publishBrowserState);
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'LokiBox Browser',
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'shell-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  browserView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });
  mainWindow.setBrowserView(browserView);
  configureBrowserView();
  mainWindow.loadFile(path.join(__dirname, 'browser-shell.html'));
  mainWindow.on('resize', resizeBrowserView);
  mainWindow.on('maximize', resizeBrowserView);
  mainWindow.on('unmaximize', resizeBrowserView);
  mainWindow.webContents.once('did-finish-load', () => {
    resizeBrowserView();
    publishBrowserState();
  });
  loadBrowserUrl(START_URL);
}

function showProfileManager() {
  if (profileWindow && !profileWindow.isDestroyed()) {
    profileWindow.focus();
    return;
  }

  profileWindow = new BrowserWindow({
    width: 680,
    height: 760,
    minWidth: 560,
    minHeight: 620,
    title: 'DAO3 Account Manager',
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'profile-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });
  profileWindow.setMenuBarVisibility(false);
  profileWindow.loadFile(path.join(__dirname, 'login-manager.html'));
  profileWindow.on('closed', () => {
    profileWindow = undefined;
  });
}

function createMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'Profiles',
        submenu: [{ label: 'Account Manager', accelerator: 'Ctrl+Shift+P', click: showProfileManager }],
      },
      {
        label: 'Navigation',
        submenu: [
          { label: 'Back', accelerator: 'Alt+Left', click: () => navigate('back') },
          { label: 'Forward', accelerator: 'Alt+Right', click: () => navigate('forward') },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'Ctrl+R', click: () => navigate('reload') },
          { label: 'Home', accelerator: 'Alt+Home', click: () => navigate('home') },
        ],
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle DevTools', accelerator: 'Ctrl+Shift+I', click: toggleDevTools },
          { role: 'togglefullscreen' },
        ],
      },
    ])
  );
}

function registerHandlers() {
  ipcMain.on('profiles:get-active', event => {
    event.returnValue = activeProfileForPage();
  });
  ipcMain.handle('profiles:list', () => profileSnapshot());
  ipcMain.handle('profiles:create', (_, input) => {
    const store = loadProfileStore();
    store.profiles.push(normalizeProfile(input));
    saveProfileStore(store);
    return profileSnapshot();
  });
  ipcMain.handle('profiles:delete', async (_, id) => {
    const store = loadProfileStore();
    const removedActiveProfile = store.activeProfileId === id;
    store.profiles = store.profiles.filter(profile => profile.id !== id);
    if (removedActiveProfile) {
      store.activeProfileId = null;
    }
    saveProfileStore(store);
    if (removedActiveProfile) {
      await deactivateProfile();
    }
    return profileSnapshot();
  });
  ipcMain.handle('profiles:activate', (_, id) => activateProfile(id));
  ipcMain.handle('profiles:deactivate', () => deactivateProfile());
  ipcMain.handle('browser:state', () => browserState());
  ipcMain.handle('browser:navigate', (_, url) => loadBrowserUrl(url));
  ipcMain.handle('browser:back', () => navigate('back'));
  ipcMain.handle('browser:forward', () => navigate('forward'));
  ipcMain.handle('browser:reload', () => navigate('reload'));
  ipcMain.handle('browser:home', () => navigate('home'));
  ipcMain.handle('browser:devtools', () => toggleDevTools());
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_, __, callback) => callback(false));
  registerHandlers();
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});