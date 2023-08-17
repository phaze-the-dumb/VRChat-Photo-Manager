const { app, BrowserWindow } = require('electron');

let photo = require('./photoServer');

if(require('electron-squirrel-startup'))app.quit();

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 1160,
    height: 700
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL('http://localhost:5173/');

  mainWindow.webContents.on('did-start-navigation', () => photo.allowAuth.allow = true);
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin')
    app.quit();
});