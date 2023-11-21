const database = require('../services/database.js');
const oracledb = require('oracledb');

const baseSelectQuery = 
 `SELECT ID_UNIDAD_GESTORA "ID_Unidad_Gestora",
    ID_INSTITUCION "ID_Institucion",
    NOMBRE_UNIDAD "Nombre_Unidad_Gestora"
  FROM UNIDAD_GESTORA`;


async function find(target) {
  let query = baseSelectQuery;
  const binds = {};

  if (target.id) {
    binds.id_unidad_gestora = target.id;
    query += `\nWHERE ID_UNIDAD_GESTORA = :id_unidad_gestora`;
  }else{
    query += `\nORDER BY ID_UNIDAD_GESTORA`;
  }
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;


const createSql =
  `DECLARE
     id_unidad_gestora_out NUMBER;
   BEGIN
    CREATE_UNIDAD_GESTORA(0,:id_institucion,:nombre_unidad,id_unidad_gestora_out);
    :id_unidad_gestora := id_unidad_gestora_out;
   END;`;

async function create(unidad) {
  const unidad_gestora = Object.assign({}, unidad);

  unidad_gestora.id_unidad_gestora = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };
  
  const result = await database.simpleExecute(createSql, unidad_gestora);
  
  unidad_gestora.id_unidad_gestora = result.outBinds.id_unidad_gestora;
  
  return unidad_gestora;
}
  
module.exports.create = create;


const updateSql =
  `BEGIN
     UPDATE_UNIDAD_GESTORA(:id_unidad_gestora,:id_institucion,:nombre_unidad,id_unidad_gestora_out);
   END;`;

async function update(renov) {
  const unidad_gestora = Object.assign({}, renov);
  const result = await database.simpleExecute(updateSql, unidad_gestora);

  if (result.rowsAffected === 1) {
    return unidad_gestora;
  } else {
    return null;
  }
}

module.exports.update = update;


const deleteSql =
  `
   BEGIN
     
     DELETE_UNIDAD_GESTORA(:id_unidad_gestora);
 
     :rowcount := sql%rowcount;
 
   END;`

async function del(id) {
  const binds = {
    id_unidad_gestora: id,
    rowcount: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER
    }
  }

  const result = await database.simpleExecute(deleteSql, binds);
  return result.outBinds.rowcount === 1;
}

module.exports.delete = del;