const os = require('os');
const fs = require('fs-extra');
const { resolve } = require('path');


let defaultPath = os.homedir() + '\\Pictures\\VRChat';
let path = os.homedir() + '\\Pictures\\VRChat';
let abortController = null;
let isRestoring = () => true;

let onPathChanged = async ( p, photos, onImageCreate, onImageDelete ) => {
  p = resolve(p);
  if(p == path)return;

  if(abortController)
    abortController.abort();

  if(!fs.existsSync(p))
    fs.mkdirSync(p);

  console.log(path, p);
  fs.copySync(path, p);

  if(path == os.homedir() + '\\Pictures\\VRChat'){ // Can't delete the VRChat folder dir because that breaks everything.
    for(let folder of fs.readdirSync(p))
      fs.removeSync(path + '\\' + folder);
  } else
    fs.removeSync(path);

  for(let i = 0; i < photos.length; i++)
    photos[i].path = photos[i].path.replace(path, p);

  path = p;

  abortController = new AbortController();

  fs.watch(path, { recursive: true, signal: abortController.signal }, ( event, file ) => {
    if(isRestoring())return;

    switch(event){
      case 'rename':
        if(fs.existsSync(path + '\\' + file)){
          onImageCreate(path + '\\', file, true);
        } else{
          onImageDelete(file);
        }

        break;
    }
  })
}

let onPhotoCreated = ( photo ) => {
  if(path === defaultPath)return false;
  let folder = photo.date.getFullYear() + '-' + (photo.date.getMonth() + 1).toString().padStart(2, '0');

  if(!fs.existsSync(path + '\\' + folder))
    fs.mkdirSync(path + '\\' + folder);

  console.log('Moving: ' + photo.path);
  fs.copySync(photo.path, path + '\\' + folder + '\\' + photo.name);
  fs.removeSync(defaultPath + '\\' + folder);
  
  return true;
}

module.exports = { onPathChanged, onPhotoCreated, isRestoring };