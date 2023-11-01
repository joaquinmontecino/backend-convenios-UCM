const database = require('../services/database.js');
const oracledb = require('oracledb');

const baseSelectQuery = 
 `select id_renovacion "ID_Renovacion",
    condicion_renovacion "Condicion_Renovacion",
    estatus "Estatus",
    fecha_inicio "Fecha_Inicio",
    fecha_termino "Fecha_Termino"
  from renovacion`;


async function find(target) {
  let query = baseSelectQuery;
  const binds = {};

  if (target.id) {
    binds.id_renovacion = target.id;
    query += `\nwhere id_renovacion = :id_renovacion`;
  }else{
    query += `\norder by id_renovacion`;
  }
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;


const createSql =
  `DECLARE
     id_renovacion_out NUMBER;
   BEGIN
    CREATE_RENOVACION(0,:condicion_renovacion,:estatus,:fecha_inicio,:fecha_termino,id_renovacion_out);
    :id_renovacion := id_renovacion_out;
   END;`;

async function create(coord) {
  const renovacion = Object.assign({}, coord);

  renovacion.id_renovacion = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };
  
  const result = await database.simpleExecute(createSql, renovacion);
  
  renovacion.id_renovacion = result.outBinds.id_renovacion;
  
  return renovacion;
}
  
module.exports.create = create;


const updateSql =
  `BEGIN
     UPDATE_RENOVACION(:id_renovacion,:condicion_renovacion,:estatus,:fecha_inicio,:fecha_termino);
   END;`;

async function update(renov) {
  const renovacion = Object.assign({}, renov);
  const result = await database.simpleExecute(updateSql, renovacion);

  if (result.rowsAffected === 1) {
    return renovacion;
  } else {
    return null;
  }
}

module.exports.update = update;


const deleteSql =
  `
   BEGIN
     
     DELETE_RENOVACION(:id_renovacion);
 
     :rowcount := sql%rowcount;
 
   END;`

async function del(id) {
  const binds = {
    id_renovacion: id,
    rowcount: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER
    }
  }

  const result = await database.simpleExecute(deleteSql, binds);
  return result.outBinds.rowcount === 1;
}

module.exports.delete = del;