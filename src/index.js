const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let photo = require('./photoServer.js');
let windowRect = () => [ 0, 0, 1160, 700 ];

if(!fs.existsSync(os.homedir() + '/Pictures/VRChat')){
  console.log('There is no VRChat picture directory, Is vrc installed?');
  console.log('No photos will be shown as the directory is empty.');

  fs.mkdirSync(os.homedir() + '/Pictures/VRChat');
}

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

  mainWindow.webContents.on('did-start-navigation', () => photo.allowAuth.allow = true);

  windowRect = () => {
    return [ bounds.x, bounds.y, bounds.width, bounds.height ];
  }

  mainWindow.on('resize', () => bounds = mainWindow.getBounds());
  mainWindow.on('moved', () => bounds = mainWindow.getBounds());

  mainWindow.on('close', e => {
    e.preventDefault();
    mainWindow.hide();
  })

  let icon = nativeImage.createFromPath(path.join(__dirname, '../build/icon.ico'));

  let tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setIgnoreDoubleClickEvents(true);

  let trayMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        config.rect = windowRect();
        fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));

        process.exit(0);
      }
    }
  ])

  tray.setContextMenu(trayMenu);

  tray.on('click', () => {
    config.rect = windowRect();
    fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));

    mainWindow.show();
  })

  mainWindow.setIcon(icon);
  photo.config(config, mainWindow);
});

app.on('window-all-closed', () => {
  app.quit();
});