const { app, BrowserWindow } = require('electron');
const path = require('path');

let photo = require('./photoServer.js');

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 1160,
    height: 700
  });

  mainWindow.setMenuBarVisibility(false);

  if(isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false)
    mainWindow.loadURL('http://localhost:5173/');
  else
    mainWindow.loadFile(path.join(__dirname, './gui/dist/index.html'));

  mainWindow.webContents.on('did-start-navigation', () => photo.allowAuth.allow = true);
});

app.on('window-all-closed', () => {
  app.quit();
});