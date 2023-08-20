const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let photo = require('./photoServer.js');
let windowRect = () => [ 0, 0, 1160, 700 ];

if(!fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/'))
  fs.mkdirSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/', { recursive: true });

if(!fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json'))
  fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', '{}');

let config = JSON.parse(fs.readFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', 'utf8'));

if(!config.rect){
  config.rect = windowRect();
  fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));
}

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    x: config.rect[0],
    y: config.rect[1],
    width: config.rect[2],
    height: config.rect[3],
  });

  let bounds = mainWindow.getBounds();
  mainWindow.setMenuBarVisibility(false);

  if(isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false)
    mainWindow.loadURL('http://localhost:5173/');
  else
    mainWindow.loadFile(path.join(__dirname, '../ui/index.html'));

  mainWindow.webContents.on('did-start-navigation', () => photo.allowAuth.allow = true);

  windowRect = () => {
    return [ bounds.x, bounds.y, bounds.width, bounds.height ];
  }

  mainWindow.on('resize', () => bounds = mainWindow.getBounds());
  mainWindow.on('moved', () => bounds = mainWindow.getBounds());
});

app.on('window-all-closed', () => {
  config.rect = windowRect();
  fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));

  app.quit();
});