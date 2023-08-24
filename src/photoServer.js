const fs = require('fs');
const fastify = require('fastify')({ logger: { level: 'error' } });
const { randomUUID } = require('crypto');
const { PNGImage } = require('png-metadata');
const mergeSort = require('./mergesort.js');
const worlds = require('vrchat-world-scraper');
const { shell } = require('electron');
const os = require('os');
const sharp = require('sharp');
const pth = require('path');

const photoMover = require('./photoMover.js');

let allowAuth = { allow: true };
let keys = [];
let keyRequests = [];
let inScan = false;
let pictures = [];

let testModeDoNotEnableThis = false; // this allows any program to access the backend without being approved!
let configData = null;

class Picture{
  constructor(path, name, stat){
    this.path = pth.resolve(path);
    this.name = name;
    this.stat = stat;
    this.date = getDate(this.name.replace('VRChat_', '').split('.')[0], this.name.split('.')[1].split('_')[0]);
    this.timestamp = this.date.getTime();
    this.res =  this.name.split('.')[1].split('_')[1].split('x').map(x => parseInt(x));
    this.warnings = [];
    this.VRCXData = null;

    let meta = new PNGImage(fs.readFileSync(this.path));

    if(meta.width !== this.res[0] || meta.height !== this.res[1]){
      this.warnings.push('File name claims to be '+this.res[0]+'x'+this.res[1]+' pixels, but it is '+meta.width+'x'+meta.height);
      this.res = [ meta.width, meta.height ];
    }

    if(meta.meta && meta.meta.Description && meta.meta.Description.application === 'VRCX')
      this.VRCXData = meta.meta.Description;
  }
}

class Key{
  constructor(key){
    this.key = key;
    this.socket = null;

    setTimeout(() => {
      if(!this.socket){
        keys = keys.filter(key => key.key !== key.key);
      }
    }, 500);
  }
}

let genNewKey = () => {
  let key = randomUUID() + randomUUID() + randomUUID();
  keys.push(new Key(key));

  return key;
}

fastify.register(require('@fastify/websocket'))

fastify.register(async ( fastify ) => {
  fastify.options('/api/v1/photos', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/worlds/:id', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/photos/:id/delete', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/openurl', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/stats', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/settings', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
  });

  fastify.options('/api/v1/settings/:setting', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key, Content-Type');
    reply.header('Access-Control-Allow-Methods', 'PUT');

    reply.send("PUT");
  });

  fastify.put('/api/v1/settings/finalPhotoPath', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(!req.body || !req.body.value)return reply.send({ ok: false, message: 'Invaild Value.' });

    configData.finalPhotoPath = req.body.value;
    fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.config/vrcphotos.json', JSON.stringify(configData));

    photoMover.onPathChanged(configData.finalPhotoPath, pictures, onImageCreate, onImageDelete);
    reply.send({ ok: true });
  });

  fastify.get('/api/v1/settings', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Value Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    reply.send({ ok: true, originPhotoPath: os.homedir() + '\\Pictures\\VRChat\\', finalPhotoPath: configData.finalPhotoPath });
  });

  fastify.get('/api/v1/stats', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    let size = 0;
    pictures.forEach(picture => size += picture.stat.size);

    reply.send({ ok: true, photoCount: pictures.length, totalSize: size });
  });

  fastify.get('/api/v1/openurl', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(req.query.url.startsWith('http://') || req.query.url.startsWith('https://'))
      shell.openExternal(req.query.url);

    reply.send({ ok: true });
  });

  fastify.get('/api/v1/photos', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });
    reply.send({ ok: true, pictures: pictures });
  });

  fastify.get('/api/v1/socket', { websocket: true }, ( connection, req ) => {
    let socket = connection.socket;

    let key = req.query.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    key.socket = socket;

    socket.on('close', () => {
      keys = keys.filter(k => k.key !== key.key);
    })
  })

  fastify.get('/api/v1/requestKey', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    if(allowAuth.allow || testModeDoNotEnableThis){
      allowAuth.allow = false;
      return reply.send({ ok: true, waiting: false, orderID: null, key: genNewKey() });
    }

    let keyID = randomUUID();
    keyRequests.push({ id: keyID, granted: false, key: null });

    reply.send({ ok: true, waiting: true, orderID: keyID });
  })

  fastify.get('/api/v1/photos/:id/full', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.query.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });

    let image = pictures.find(x => x.timestamp == req.params.id)
    if(!image)return reply.send({ ok: false, message: 'Image not found.' });

    reply.header('Content-Type', 'image/png');
    reply.send(fs.readFileSync(image.path));
  })

  fastify.get('/api/v1/photos/:id/hd', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.query.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });

    let image = pictures.find(x => x.timestamp == req.params.id)
    if(!image)return reply.send({ ok: false, message: 'Image not found.' });

    reply.header('Content-Type', 'image/png');

    sharp(fs.readFileSync(image.path))
      .resize(...findBestResolution(image.res, 1080))
      .toBuffer()
      .then(buffer => reply.send(buffer));
  })

  fastify.get('/api/v1/photos/:id/scaled', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.query.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });

    let image = pictures.find(x => x.timestamp == req.params.id)
    if(!image)return reply.send({ ok: false, message: 'Image not found.' });

    reply.header('Content-Type', 'image/png');

    sharp(fs.readFileSync(image.path))
      .resize(...findBestResolution(image.res, 200))
      .toBuffer()
      .then(buffer => reply.send(buffer));
  })

  fastify.get('/api/v1/photos/:id/open', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.query.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });

    let image = pictures.find(x => x.timestamp == req.params.id)
    if(!image)return reply.send({ ok: false, message: 'Image not found.' });

    require('child_process').exec(`explorer.exe /select,"${image.path.replaceAll('/', '\\')}"`);
    reply.send({ ok: true });
  })

  fastify.get('/api/v1/photos/:id/delete', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    let photo = pictures.find(x => x.timestamp == req.params.id);
    if(!photo)return reply.send({ ok: false, message: 'Image not found.' });

    fs.unlinkSync(photo.path);
    reply.send({ ok: true });
  })

  fastify.get('/api/v1/worlds/:id', async ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key Header.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(!fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds'))
      fs.mkdirSync(os.homedir + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds', { recursive: true });

    if(fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds/' + req.params.id + '.json')){
      let data = JSON.parse(fs.readFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds/' + req.params.id + '.json', 'utf8'));

      if(data.fetchedAt + 6.048e+8 < Date.now()){
        let newData = await worlds.find(req.params.id);
        if(!newData)return reply.send({ ok: false, message: 'World not found.' });

        fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds/' + req.params.id + '.json', JSON.stringify({ fetchedAt: Date.now(), data: newData }));
        reply.send({ ok: true, data: newData });
      } else
        reply.send({ ok: true, data: data.data });
    } else{
      let newData = await worlds.find(req.params.id);
      if(!newData)return reply.send({ ok: false, message: 'World not found.' });

      fs.writeFileSync(os.homedir() + '/AppData/Roaming/PhazeDev/.cache/vrchat/worlds/' + req.params.id + '.json', JSON.stringify({ fetchedAt: Date.now(), data: newData }));
      reply.send({ ok: true, data: newData });
    }
  })
})

fastify.listen({ port: 53413, host: '127.0.0.1' }, ( err, address ) => {
  if(err)
    throw new Error("App already running.");
});

let startSpider = async (folder, pictures) => {
  let files = fs.readdirSync(folder);

  for(let file of files){
    let path = pth.resolve(folder + '/' + file);

    let stat = fs.statSync(path);
    if(stat.isDirectory())
      await startSpider(path, pictures);
    else if(file.match(/VRChat_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.[0-9]{3}_[0-9]{4}x[0-9]{4}.png/gm))
      pictures.push(new Picture(path, file, stat));
    else if(file.match(/VRChat_[0-9]{4}x[0-9]{4}_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.[0-9]{3}.png/gm)){
      let fixedName = 'VRChat_' + file.split('_')[2] + '_' + file.split('_')[3].split('.')[0] + '.' + file.split('_')[3].split('.')[1] + '_' + file.split('_')[1].split('_')[0] + '.png';
      fs.renameSync(path, pth.resolve(folder + '/' + fixedName));

      pictures.push(new Picture(folder + '/' + fixedName, fixedName, stat));
    }
  }
}

let scanFolders = async () => {
  inScan = true;
  pictures = [];

  await startSpider(configData.finalPhotoPath, pictures);
  mergeSort(pictures);

  inScan = false;
  updateThread();
}

let getDate = ( str, ms ) => {
  let d = str.split('_')[0].split('-');
  let t = str.split('_')[1].split('-');

  let date = new Date();
  date.setFullYear(d[0], d[1] - 1, d[2]);
  date.setHours(t[0], t[1], t[2], ms);

  return date;
}

let findBestResolution = ( originalRes, height ) => {
  let sizeMultiplier = height / originalRes[1];

  return [ Math.floor(originalRes[0] * sizeMultiplier), height ];
};

let onImageDelete = ( file ) => {
  if(!file.split('\\').pop().match(/VRChat_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.[0-9]{3}_[0-9]{4}x[0-9]{4}.png/gm))return;

  console.log('Photo Removed: ' + file);
  let name = file.split('\\').pop();

  pictures = pictures.filter(p => p.name !== name);
  keys.forEach(k => k.socket.send(JSON.stringify({ type: 'photo-removed', id: getDate(name.replace('VRChat_', '').split('.')[0], name.split('.')[1].split('_')[0]).getTime() })));
}

let onImageCreate = ( path, file, dontMove ) => {
  if(!file.split('\\').pop().match(/VRChat_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.[0-9]{3}_[0-9]{4}x[0-9]{4}.png/gm))return;
  let stat = fs.statSync(path + file);

  setTimeout(() => {
    let photo = new Picture(path + file, file.split('\\').pop(), stat);
    if(pictures.find(x => x.timestamp === photo.timestamp))return;

    if(!dontMove)
      if(photoMover.onPhotoCreated(photo))return;

    pictures.splice(0, 0, photo);

    console.log('New Photo Found: ' + file);
    keys.forEach(k => k.socket.send(JSON.stringify({ type: 'new-photo', photo: photo })));
  }, 50);
}

let updateThread = () => {
  console.log('Watching image folder...');
  let path = os.homedir() + '\\Pictures\\VRChat\\';
  let lastImage = '';
  let lastEvent = '';

  let queue = [];
  let queueRunning = false;

  let runQueue = () => {
    queueRunning = true;
    let { event, file } = queue.shift();

    switch(event){
      case 'rename':
        if(fs.existsSync(path + file)){
          console.log(lastImage, file, lastEvent, 'added');
          if(lastImage === file && lastEvent === 'added')return;

          onImageCreate(path, file);

          lastEvent = 'added';
          lastImage = file;
        } else{
          console.log(lastImage, file, lastEvent, 'deleted');
          if(lastImage === file && lastEvent === 'deleted')return;

          onImageDelete(file);

          lastEvent = 'deleted';
          lastImage = file;
        }
    }

    if(queue[0])
      runQueue();
    else
      queueRunning = false;
  }

  fs.watch(path, { recursive: true }, ( event, file ) => {
    if(!file)return;

    queue.push({ event, file });

    if(!queueRunning)
      runQueue();
  })
}

let config = ( con ) => {
  configData = con;

  if(!configData.finalPhotoPath)configData.finalPhotoPath = os.homedir() + '\\Pictures\\VRChat\\';

  photoMover.onPathChanged(configData.finalPhotoPath, pictures, onImageCreate, onImageDelete);
  scanFolders();
}

module.exports = { allowAuth, config };