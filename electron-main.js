// electron-main.js
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs'); // Import Node.js fs module

const store = new Store();
let mainWindow;
let i18nResources = {}; // To store loaded translations

// Function to load translations from the new 'locales' structure
function loadTranslations() {
  const localesDir = path.join(__dirname, 'locales');
  try {
    const languages = fs.readdirSync(localesDir);
    languages.forEach(lang => {
      const translationFilePath = path.join(localesDir, lang, 'translation.json');
      if (fs.existsSync(translationFilePath)) {
        const content = fs.readFileSync(translationFilePath, 'utf-8');
        i18nResources[lang] = { translation: JSON.parse(content) };
      }
    });
    console.log('Translations loaded:', Object.keys(i18nResources));
  } catch (error) {
    console.error('Failed to load translations:', error);
    // Fallback or error handling
  }
}

function createWindow() {
  // ... (BrowserWindow creation code remains the same)
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', function () { mainWindow = null; });
}

app.whenReady().then(() => {
  loadTranslations(); // Load translations before creating window or on demand
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle IPC for mouse events (already exists)
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setIgnoreMouseEvents(ignore, options || {});
  }
});

// Handle IPC for electron-store GET (already exists)
ipcMain.handle('electron-store-get', async (event, key) => {
  const result = store.get(key);
  console.log(`Main process: store.get('${key}') result:`, result);
  return result;
});

// Handle IPC for electron-store SET (already exists)
ipcMain.on('electron-store-set', (event, key, value) => {
  console.log(`Main process: store.set('${key}',`, value, `)`);
  store.set(key, value);
});

// IPC handler to provide i18n resources to renderer
ipcMain.handle('get-i18n-resources', async () => {
  return i18nResources;
});
