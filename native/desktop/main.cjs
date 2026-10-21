'use strict';
const { app, BrowserWindow, Menu, shell, session, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { ORIGIN, isTrusted, isExternal } = require('./navigation.cjs');
const START = ORIGIN + '/';
const OFFLINE = pathToFileURL(path.join(__dirname, 'offline.html')).href;
const legacy = Number(process.versions.electron.split('.')[0]) <= 22;
let mainWindow;

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); }
  });
  app.whenReady().then(async () => {
    const browserSession = session.fromPartition(legacy ? 'persist:chemhouse-legacy' : 'persist:chemhouse');
    browserSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    browserSession.setPermissionCheckHandler(() => false);
    browserSession.on('will-download', (_event, item) => {
      item.setSaveDialogOptions({ title: 'Export study notes / 导出学习笔记', defaultPath: path.basename(item.getFilename()) });
    });
    const openExternal = url => { if (isExternal(url)) void shell.openExternal(url).catch(() => {}); };
    const createWindow = () => {
      mainWindow = new BrowserWindow({
        title: legacy ? 'ChemHouse — Legacy Windows' : 'ChemHouse',
        width: 1280, height: 850, minWidth: 390, minHeight: 500,
        backgroundColor: '#f6f8f1', show: false,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
          partition: legacy ? 'persist:chemhouse-legacy' : 'persist:chemhouse',
          nodeIntegration: false, nodeIntegrationInWorker: false, nodeIntegrationInSubFrames: false,
          contextIsolation: true, sandbox: true, webSecurity: true,
          allowRunningInsecureContent: false, webviewTag: false,
          devTools: !app.isPackaged
        }
      });
      mainWindow.once('ready-to-show', () => mainWindow?.show());
      mainWindow.on('closed', () => { mainWindow = null; });
      const contents = mainWindow.webContents;
      contents.setWindowOpenHandler(({ url }) => { openExternal(url); return { action: 'deny' }; });
      const protectNavigation = (event, url) => {
        if (isTrusted(url) || url === OFFLINE) return;
        event.preventDefault(); openExternal(url);
      };
      contents.on('will-navigate', protectNavigation);
      contents.on('will-redirect', protectNavigation);
      contents.on('will-attach-webview', event => event.preventDefault());
      contents.on('did-fail-load', (_event, code, _description, url, isMainFrame) => {
        if (isMainFrame && code !== -3 && isTrusted(url)) void mainWindow?.loadFile(path.join(__dirname, 'offline.html'));
      });
      void mainWindow.loadURL(START).catch(() => mainWindow?.loadFile(path.join(__dirname, 'offline.html')));
    };
    const studyMenu = [
      { label: 'Home / 首页', click: () => mainWindow?.loadURL(START) },
      { label: 'Ask AI / AI 答疑', click: () => mainWindow?.loadURL(START + '#/en/ai') },
      { label: 'Reload / 刷新', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.webContents.reload() },
      { label: 'Open in browser / 浏览器打开', click: () => openExternal(isTrusted(mainWindow?.webContents.getURL()) ? mainWindow.webContents.getURL() : START) },
      { type: 'separator' },
      { label: 'Print / 打印', accelerator: 'CmdOrCtrl+P', click: () => mainWindow?.webContents.print({ printBackground: true }) },
      { role: process.platform === 'darwin' ? 'close' : 'quit' }
    ];
    const template = [
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { label: 'Study / 学习', submenu: studyMenu },
      { role: 'editMenu' },
      { label: 'View / 显示', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
      { label: 'Help / 帮助', submenu: [{ label: 'About ChemHouse / 关于', click: () => dialog.showMessageBox(mainWindow, {
        type: 'info', title: 'ChemHouse', message: 'ChemHouse ' + app.getVersion(),
        detail: 'Chemistry and English study. An internet connection is required. Notes and progress are saved on this device. AI questions are sent to DeepSeek via ChemHouse.\n\n化学与英语学习。需要联网，笔记与进度保存在本机。AI 问题经化学小屋发送至 DeepSeek。' +
          (legacy ? '\n\nLegacy Windows build: Electron 22 is no longer maintained. Use the modern build on Windows 10/11 when possible.' : '')
      }) }] }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    if (legacy) await dialog.showMessageBox({ type: 'warning', title: 'Legacy Windows / 旧版 Windows',
      message: 'This build uses an unsupported browser runtime.',
      detail: 'Windows 7/8/8.1 requires Electron 22, which no longer receives security updates. Use this compatibility build only if you cannot move to a supported OS.\n\n此兼容版本的浏览器内核已停止安全更新，建议升级系统后使用现代版本。', buttons: ['Continue / 继续'] });
    createWindow();
    app.on('activate', () => { if (!mainWindow) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
