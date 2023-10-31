const database = require('../services/database.js');
const oracledb = require('oracledb');

const baseSelectQuery = 
 `select id_coordinador "ID_Coordinador",
    tipo "Tipo_Coordinador",
    nombre "Nombre",
    correo "Correo"
  from coordinador`;


async function find(target) {
  let query = baseSelectQuery;
  const binds = {};

  if (target.id) {
    binds.id_coordinador = target.id;
    query += `\nwhere id_coordinador = :id_coordinador`;
  } else {
    query += `\norder by id_coordinador`;
  }
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;


const createSql =
  `DECLARE
    id_coordinador_out NUMBER;
   BEGIN
    CREATE_COORDINADOR(0,:tipo,:nombre,:correo,id_coordinador_out);
    :id_coordinador := id_coordinador_out;
   END;`;

async function create(coord) {
  const coordinador = Object.assign({}, coord);

  coordinador.id_coordinador = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };
  
  const result = await database.simpleExecute(createSql, coordinador);
  
  coordinador.id_coordinador = result.outBinds.id_coordinador;
  
  return coordinador;
}
  
module.exports.create = create;


const updateSql =
  `BEGIN
     UPDATE_COORDINADOR(:id_coordinador,:tipo,:nombre,:correo);
   END;`;


// TO-DO: Solucionar que la funcion no entra al if, resolviendo la solicitud en status 404, cuando en realidad si funciona correctamente
async function update(coord) {
  const coordinador = Object.assign({}, coord);
  const result = await database.simpleExecute(updateSql, coordinador);

  if (result.rowsAffected === 1) {
    return coordinador;
  } else {
    return null;
  }
}

module.exports.update = update;


const deleteSql =
  `
   BEGIN
     
     DELETE_COORDINADOR(:id_coordinador);
 
     :rowcount := sql%rowcount;
 
   END;`

async function del(id) {
  const binds = {
    id_coordinador: id,
    rowcount: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER
    }
  }

  const result = await database.simpleExecute(deleteSql, binds);
  return result.outBinds.rowcount === 1;
}

module.exports.delete = del;