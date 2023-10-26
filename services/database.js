const oracledb = require('oracledb');
const dbConfig = require('../config/database.js');

async function initialize() {
  const pool = await oracledb.createPool(dbConfig.dbPool);                  // Crea un pool de conexiones a la base de datos Oracle utilizando la configuración de 'dbConfig.hrPool'
}



async function close() {
  await oracledb.getPool().close();                                       // Cierra el pool de conexiones de Oracle obteniendo el pool actual y llamando a 'close' en él
}


// Define una función llamada 'simpleExecute' que ejecuta declaraciones SQL en la base de datos
function simpleExecute(statement, binds = [], opts = {}) {
  // Retorna una nueva promesa que permite ejecutar una consulta SQL
  return new Promise(async (resolve, reject) => {
    let conn;

    // Configura opciones predeterminadas para la ejecución de la consulta
    opts.outFormat = oracledb.OBJECT;                 // Formato de resultado devuelto como objeto
    opts.autoCommit = true;                           // Realizar commit automático después de la ejecución

    try {
      conn = await oracledb.getConnection();

      // Ejecuta la consulta SQL utilizando la conexión, los parámetros de vinculación y las opciones
      const result = await conn.execute(statement, binds, opts);

      // Resuelve la promesa con el resultado de la consulta
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) {             // Si se logró obtener la conexión, se intenta cerrarla para liberar recursos
        try {
          await conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}
  
module.exports.simpleExecute = simpleExecute;
module.exports.initialize = initialize;
module.exports.close = close;
