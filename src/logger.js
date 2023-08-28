const os = require('os');
const util = require('util');
const fs = require('fs');
const colors = require('colors');

let date = new Date();
let file = os.homedir() + '/AppData/Roaming/PhazeDev/.logs/vrcpm/log_' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '_' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '.log';
let allowLoggingToFile = true;

if(!fs.existsSync(os.homedir() + '/AppData/Roaming/PhazeDev/.logs/vrcpm/'))
  fs.mkdirSync(os.homedir() + '/AppData/Roaming/PhazeDev/.logs/vrcpm/', { recursive: true });

process.on('uncaughtException', ( err ) => {
  fs.appendFileSync(file, '[FATAL] ' + err + '\n');
  process.exit(1);
})

process.on('unhandledRejection', ( err ) => {
  fs.appendFileSync(file, '[ERROR] Unhandled Rejection:'+ err + '\n');
  process.stdout.write('[ERROR]'.red + ' ' + message + '\n')
  process.exit(1);
})

module.exports = {
  log: (...messages) => {
    if(allowLoggingToFile && !fs.existsSync(file))
      fs.writeFileSync(file, '');

    if(allowLoggingToFile)
      fs.appendFileSync(file, '[LOG] ' + messages.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join('\n[LOG] ') + '\n');

    messages.forEach(async message => {
      if(typeof message === 'object'){
        process.stdout.write('[LOG]'.blue + ' ' + util.inspect(message, true, 50, true) + '\n')
        return;
      }

      process.stdout.write('[LOG]'.blue + ' ' + message + '\n')
    });
  },
  warn: (...messages) => {
    if(allowLoggingToFile && !fs.existsSync(file))
      fs.writeFileSync(file, '');

    if(allowLoggingToFile)
      fs.appendFileSync(file, '[WARN] ' + messages.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join('\n[WARN] ') + '\n');

    messages.forEach(async message => {
      if(typeof message === 'object'){
        process.stdout.write('[WARN]'.yellow + ' ' + util.inspect(message, true, 50, true) + '\n')
        return;
      }

      process.stdout.write('[WARN]'.yellow + ' ' + message + '\n')
    });
  },
  error: (...messages) => {
    if(allowLoggingToFile && !fs.existsSync(file))
      fs.writeFileSync(file, '');

    if(allowLoggingToFile)
      fs.appendFileSync(file, '[ERROR] ' + messages.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join('\n[ERROR] ') + '\n');

    messages.forEach(async message => {
      if(typeof message === 'object'){
        process.stdout.write('[ERROR]'.red + ' ' + util.inspect(message, true, 50, true) + '\n')
        return;
      }

      process.stdout.write('[ERROR]'.red + ' ' + message + '\n')
    });
  },
  logToFile: ( log ) => {
    allowLoggingToFile = log;
  }
}