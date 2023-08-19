const { app, BrowserWindow } = require('electron');
const path = require('path');

let photo = require('./photoServer');

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 1160,
    height: 700
  });

  mainWindow.setMenuBarVisibility(false);

  console.log(process.env);

  if(isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false)
    mainWindow.loadURL('http://localhost:5173/');
  else
    mainWindow.loadFile(path.join(__dirname, '../../../ui/index.html'));

  mainWindow.webContents.on('did-start-navigation', () => photo.allowAuth.allow = true);
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin')
    app.quit();
});