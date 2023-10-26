const webServer = require('./services/web-server.js');
const dbConfig = require('./config/database.js');
const defaultThreadPoolSize = 4;
const database = require('./services/database.js');

// Aumentar el tamaño del grupo de subprocesos (thread pool)
process.env.UV_THREADPOOL_SIZE = dbConfig.dbPool.poolMax + defaultThreadPoolSize;


// Función asincrónica para iniciar la aplicación
async function startup() {
  console.log('Iniciando la aplicacion');

  try {
    console.log('Inicializando el modulo de la base de datos');

    await database.initialize(); 
  } catch (err) {
    console.error(err);

    process.exit(1); // Código de falla no nulo
  }

  try {
    console.log('Inicializando el modulo del servidor web');

    await webServer.initialize();
  } catch (err) {
    console.error(err);

    process.exit(1); 
  }
}

startup();  // Se inicia la aplicación


// Función asincrónica para cerrar la aplicación
async function shutdown(e) {
    let err = e;
  
    console.log('Cerrando la aplicacion');
  
    try {
      console.log('Cerrando el modulo del servidor web');
  
      await webServer.close();
    } catch (e) {
      console.log('Error encontrado', e);
  
      err = err || e;
    }
    try {
        console.log('Cerrando el modulo de la base de datos');
    
        await database.close(); 
      } catch (err) {
        console.log('Error encontrado', e);
    
        err = err || e;
      }

    console.log('Error encontrado');
  
    if (err) {
      process.exit(1); // Non-zero failure code
    } else {
      process.exit(0);
    }
  }
  
  // Manejar eventos de terminación y excepciones no capturadas
  process.on('SIGTERM', () => {
    console.log('Se recibió una señal SIGTERM (terminación)');
  
    shutdown();
  });
  
  process.on('SIGINT', () => {
    console.log('Se recibió una señal SIGINT (interrupción)');
  
    shutdown();
  });
  
  process.on('uncaughtException', err => {
    console.log('Excepción no capturada');
    console.error(err);
  
    shutdown(err);
  });