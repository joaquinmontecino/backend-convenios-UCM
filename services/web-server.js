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

    // Usar el middleware 'morgan' para el registro de solicitudes
    app.use(morgan('combined')); 
    // Habilitar el manejo de JSON en las solicitudes
    app.use(express.json({
        reviver: reviveJson
      }));
    app.use(cors())

     // Montar el enrutador en la ruta /api para que todas sus rutas comiencen con /api
    app.use('/api', router);

    
    // Iniciar el servidor HTTP en el puerto especificado en la configuración
    httpServer.listen(webServerConfig.port, err => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`Servidor web escuchando en localhost:${webServerConfig.port}`);

      resolve();  // Resolver la promesa cuando el servidor se inicie correctamente
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
  

// Expresión regular para identificar fechas en formato ISO 8601
const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;


// Función para revivir objetos JSON con fechas ISO 8601 a objetos Date
function reviveJson(key, value) {
  if (typeof value === 'string' && iso8601RegExp.test(value)) {
    return new Date(value);
  } else {
    return value;
  }
}


module.exports.initialize = initialize;
module.exports.close = close;