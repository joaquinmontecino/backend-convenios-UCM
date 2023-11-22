const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const webServerConfig = require('../config/web-server.js');
const router = require('./router.js');

let httpServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

    
    app.use(morgan('combined')); 
    app.use(express.json({
        reviver: reviveJson
      }));
    app.use(cors())
    app.use('/api', router);

    
    httpServer.listen(webServerConfig.port, err => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Servidor web escuchando en localhost:${webServerConfig.port}`);

      resolve();
    });
  });
}


function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }
  
      resolve();
    });
  });
}
  

const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
const yyyyMMddRegExp = /^\d{4}-\d{2}-\d{2}$/;

function reviveJson(key, value) {
  if (typeof value === 'string') {
    if (iso8601RegExp.test(value)) {
      const date = new Date(value);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() % 100}`;
      return formattedDate;
    } else if (yyyyMMddRegExp.test(value)) {
      const parts = value.split('-');
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0] % 100}`;
      return formattedDate;
    }
  }
  return value;
}

module.exports.initialize = initialize;
module.exports.close = close;


const serverResponse = '{"fecha_inicio": "2026-08-15T04:00:00.000Z"}';
console.log('Antes de reviver:', serverResponse);

const parsedResponse = JSON.parse(serverResponse, reviveJson);
console.log('Después de reviver:', parsedResponse.fecha_inicio);