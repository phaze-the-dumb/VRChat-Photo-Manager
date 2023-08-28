const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const os = require('os');

console = require('./logger.js');

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

if(!config.vrcoutput){
  config.vrcoutput = os.homedir() + '/Pictures/VRChat';
  fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));
}

if(!config.logToFile){
  config.logToFile = false;
  fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(config));
}

console.logToFile(config.logToFile);

if(!fs.existsSync(config.vrcoutput)){
  console.log('There is no VRChat picture directory, Is vrc installed?');
  console.log('No photos will be shown as the directory is empty.');

  fs.mkdirSync(config.vrcoutput, { recursive: true });
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
  photo.config(config, mainWindow, console);
});

app.on('window-all-closed', () => {
  app.quit();
});

fetch('https://api.github.com/repos/phaze-the-dumb/VRChat-Photo-Manager/releases/latest')
  .then(data => data.json())
  .then(async data => {
    let currentVersion = require('../package.json').version;

    if(data.tag_name !== currentVersion){
      console.log('A new version of VRChat-Photo-Manager is available! Downloading installer to temp directory to get ready for update.');
      photo.updateAvailable(data);

      let req = await fetch('https://github.com/phaze-the-dumb/VRChat-Photo-Manager-Installer/releases/download/v0.1.0/vrcpm-installer.exe');

      if(!fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.temp/'))
        fs.mkdirSync(os.homedir() + '/AppData/Roaming/PhazeDev/.temp/', { recursive: true });

      let stream = fs.createWriteStream(os.homedir() + '/AppData/Roaming/PhazeDev/.temp/vrcpm-installer.exe');
      req.body.pipe(stream);

      stream.on('finish', () => {
        console.log('VRChat-Photo-Manager-Installer downloaded to temp directory.');
      });
    }
  })