const https = require('https');
const { Readable } = require('stream');
const fs = require('fs');

let isQueueRunning = false;
let isSyncQueueRunning = false;
let isCheckQueueRunning = false;
let canUpload = true;

let updateCallback = () => {};
let newPhotoCallback = () => {};
let finishedSyncCallback = () => {};

let queue = [];
let checkQueue = [];
let syncQueue = [];

let remoteFiles = null;
let configData;

let runQueue = async () => {
  if(!canUpload)return;

  isQueueRunning = true;
  let photo = queue.shift();
  let size = fs.statSync(photo.path).size;

  console.log('Uploading photo: '+ photo.name, size);

  let uploadReq = https.request({
    hostname: 'photos.phazed.xyz',
    port: 443,
    path: '/api/v1/photos',
    method: 'PUT',
    headers: {
      auth: configData.token,
      filename: photo.name,
      'content-type': 'image/png',
      'content-length': size
    }
  })

  let stream = fs.createReadStream(photo.path)
  let dataSent = 0;

  stream.on('data', chunk => {
    dataSent += chunk.length;

    uploadReq.write(chunk);
    photo.uploadPercent = ((dataSent / size) * 100);
  })

  stream.on('end', () => {
    uploadReq.end();
    photo.isSynced = true;
  })

  uploadReq.on('response', ( res ) => {
    let resp = '';

    if(res.statusCode === 200){
      res.on('data', ( chunk ) => {
        resp += chunk;
      })

      res.on('end', () => {
        console.log('Uploaded photo: '+ photo.name, resp);
        let upload = JSON.parse(resp);
    
        if(!upload.ok){
          if(upload.error === 'Invalid token'){
            canUpload = false;
            queue.splice(0, 0, photo);

            isQueueRunning = false;
            return;
          } else if(upload.error === 'Used too much storage'){
            canUpload = false;
            queue.splice(0, 0, photo);

            isQueueRunning = false;
            return;
          } else
            throw new Error('Upload failed: '+upload.error);
        }

        updateCallback(dataSent, photo);

        if(queue[0])
          runQueue();
        else
          isQueueRunning = false;
      })
    } else{
      setTimeout(() => {
        console.log(res);
        console.log('An error occurred while trying to upload the file, trying again in 1 second. Code: '+res.statusCode);
        queue.splice(0, 0, photo);
        runQueue();
      }, 1000);
    }
  })
}

let runCheckQueue = async () => {
  if(!canUpload)return;

  isCheckQueueRunning = true;
  let photo = checkQueue.shift();

  if(!remoteFiles){
    let existsReq = await fetch('https://photos.phazed.xyz/api/v1/photos/exists?photo=' + photo.name, { headers: { auth: configData.token } });
    let exists = await existsReq.json();

    if(!exists.ok){
      canUpload = false;
      checkQueue.splice(0, 0, photo);

      isCheckQueueRunning = false;
      console.log(exists);
      return
    }

    if(!exists.exists){
      photo.isSynced = false;
      queue.push(photo);

      if(!isQueueRunning)
        runQueue();
    } else{
      // console.log(photo.name + ' already exists, skipping sync');
      photo.isSynced = true;
    }
  } else{
    if(!remoteFiles.includes(photo.name)){
      photo.isSynced = false;
      queue.push(photo);

      if(!isQueueRunning)
        runQueue();
    } else{
      // console.log(photo.name + ' already exists, skipping sync');
      photo.isSynced = true;
    }
  }

  if(checkQueue[0])
    runCheckQueue();
  else
    isCheckQueueRunning = false;
}

let runSyncQueue = async () => {
  if(!canUpload)return;

  isSyncQueueRunning = true;
  file = syncQueue.shift();

  let date = getDate(file.replace('VRChat_', '').split('.')[0], file.split('.')[1].split('_')[0]);

  if(fs.existsSync(configData.finalPhotoPath + '\\' + date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '\\' + file)){
    newPhotoCallback(date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '\\', file);

    if(syncQueue[0])
      runSyncQueue();
    else{
      isSyncQueueRunning = false;
      finishedSyncCallback();
    }

    return console.log(file+' Was marked as not existing but it does actually exist');
  }

  console.log('Restoring '+file+' as it doesn\'t exist locally');
  let fileReq = await fetch('https://photos.phazed.xyz/api/v1/photos?photo=' + file, { headers: { auth: configData.token } });

  if(fileReq.status === 401){
    let fil = await fileReq.json();

    if(!fil.ok){
      canUpload = false;
      syncQueue.splice(0, 0, file);

      isSyncQueueRunning = false;
      console.log(fil);
      return;
    }
  }

  if(!fs.existsSync(configData.finalPhotoPath + '\\' + date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0')))
    fs.mkdirSync(configData.finalPhotoPath + '\\' + date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0'));

  let stream = fs.createWriteStream(configData.finalPhotoPath + '\\' + date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '\\' + file, { flags: 'w' });
  let readStream = Readable.fromWeb(fileReq.body);

  readStream.pipe(stream);

  stream.on('finish', () => {
    console.log(file + ' Restored');
    newPhotoCallback(date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '\\', file);

    if(syncQueue[0])
      runSyncQueue();
    else{
      isSyncQueueRunning = false;
      finishedSyncCallback();
    }
  })
}

let addToQueue = async ( photo ) => {
  checkQueue.push(photo);
}

let config = ( con ) => {
  configData = con;
}

let tryUpload = ( files ) => {
  if(isCheckQueueRunning || isQueueRunning)return;

  if(files)
    remoteFiles = files;

  console.log('Attempting to sync photos again...');
  canUpload = true;

  if(checkQueue[0])
    runCheckQueue();

  if(queue[0])
    runQueue();
}

let updateStorage = ( cb ) => {
  updateCallback = cb;
}

let newPhoto = ( cb ) => {
  newPhotoCallback = cb;
}

let finishedSync = ( cb ) => {
  finishedSyncCallback = cb;
}

let checkRemote = ( remoteFiles, localFiles ) => {
  for(let file of remoteFiles){
    let localFile = localFiles.find(x => x.name === file);

    if(!localFile){
      syncQueue.push(file);

      if(!isSyncQueueRunning)
        runSyncQueue();
    }
  }
}

let getDate = ( str, ms ) => {
  let d = str.split('_')[0].split('-');
  let t = str.split('_')[1].split('-');

  let date = new Date();
  date.setFullYear(d[0], d[1] - 1, d[2]);
  date.setHours(t[0], t[1], t[2], ms);

  return date;
}

module.exports = { addToQueue, config, tryUpload, updateStorage, checkRemote, newPhoto, finishedSync, isRestoring: () => isSyncQueueRunning, isUploading: () => isQueueRunning };