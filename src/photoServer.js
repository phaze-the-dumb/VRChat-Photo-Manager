const fs = require('fs');
const fastify = require('fastify')();
const { randomUUID } = require('crypto');
const { PNGImage } = require('png-metadata');
const mergeSort = require('./mergeSort');
const worlds = require('vrchat-world-scraper');
const { shell } = require('electron');
const os = require('os');
const sharp = require('sharp');

let allowAuth = { allow: true };
let keys = [];
let keyRequests = [];
let inScan = false;
let pictures = [];

let testModeDoNotEnableThis = false; // this allows any program to access the backend without being approved!

if(!fs.existsSync('./config.json'))
  fs.writeFileSync('./config.json', '{"picFolders":["'+os.homedir().replaceAll('\\', '/')+'/Pictures/VRChat"]}');

let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

class Picture{
  constructor(path, name){
    this.path = path;
    this.name = name;
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

  fastify.options('/api/v1/openurl', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send("GET");
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
      .resize(...findBestResolution(image.res))
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

fastify.listen({ port: 53413, host: '127.0.0.1' });

let startSpider = async (folder, pictures) => {
  let files = fs.readdirSync(folder);

  for(let file of files){
    let path = folder + '/' + file;

    let stat = fs.statSync(path);
    if(stat.isDirectory())
      await startSpider(path, pictures);
    else if(file.match(/VRChat_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.[0-9]{3}_[0-9]{4}x[0-9]{4}.png/gm))
      pictures.push(new Picture(path, file));
  }
}

let scanFolders = async () => {
  inScan = true;
  pictures = [];

  for(let folder of config.picFolders)
    await startSpider(folder, pictures);

  mergeSort(pictures);
  inScan = false;
}

let getDate = ( str, ms ) => {
  let d = str.split('_')[0].split('-');
  let t = str.split('_')[1].split('-');

  let date = new Date();
  date.setFullYear(d[0], d[1] - 1, d[2]);
  date.setHours(t[0], t[1], t[2], ms);

  return date;
}

let findBestResolution = ( originalRes ) => {
  let sizeMultiplier = 200 / originalRes[1];

  return [ Math.floor(originalRes[0] * sizeMultiplier), 200 ];
};

module.exports = { allowAuth };
scanFolders();