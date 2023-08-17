const fs = require('fs');
const fastify = require('fastify')();
const { randomUUID } = require('crypto');
const { PNGImage } = require('png-metadata');
const os = require('os');
const { mergeSort } = require('./mergesort');

let allowAuth = { allow: true };
let keys = [];
let keyRequests = [];
let inScan = false;
let pictures = [];

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

    console.log('Found image: '+path);
  }
}

class Key{
  constructor(key){
    this.key = key;
    this.socket = null;

    this.timeout = setTimeout(() =>
      keys = keys.filter(key => key.key !== key.key), 10000);
  }

  heartbeat(){
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() =>
      keys = keys.filter(key => key.key!== key.key), 10000);
  }
}

let genNewKey = () => {
  let key = randomUUID() + randomUUID() + randomUUID();
  keys.push(new Key(key));

  return key;
}

fastify.register(require('@fastify/websocket'))

fastify.register(async ( fastify ) => {
  fastify.options('/api/v1/heartbeat', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send({ ok: true });
  });

  fastify.options('/api/v1/photos', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    reply.send({ ok: true });
  });

  fastify.get('/api/v1/heartbeat', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'key');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    key.heartbeat();
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
  })

  fastify.get('/api/v1/requestKey', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    if(allowAuth.allow){
      allowAuth.allow = false;
      return reply.send({ ok: true, waiting: false, orderID: null, key: genNewKey() });
    }

    let keyID = randomUUID();
    keyRequests.push({ id: keyID, granted: false, key: null });

    reply.send({ ok: true, waiting: true, orderID: keyID });
  })

  fastify.get('/api/v1/photos/:id', ( req, reply ) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Access-Control-Allow-Origin', '*');

    let key = req.headers.key;
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });
    key = keys.find(k => k.key === key);
    if(!key)return reply.send({ ok: false, message: 'Invaild Key.' });

    if(inScan)return reply.send({ ok: true, message: 'Still Scanning Folders.' });

    let image = findImageById(req.query.id);
    if(!image)return reply.send({ ok: false, message: 'Image not found.' });

    reply.send(fs.readFileSync(image.path));
  })
})

fastify.listen({ port: 53413, host: '127.0.0.1' });

let startSpider = async (folder, pictures) => {
  console.log('Starting Spider on ' + folder);
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

  mergeSort(pictures, 0, pictures.length - 1);
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

module.exports = { allowAuth };
scanFolders();