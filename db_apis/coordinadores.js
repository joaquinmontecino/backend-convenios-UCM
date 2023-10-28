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
  }
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;


const createSql =
 `insert into coordinador (
    id_coordinador,
    tipo,
    nombre,
    correo
  ) values (
    0,
    :tipo,
    :nombre,
    :correo
  ) returning id_coordinador
  into :id_coordinador`;


async function create(coord) {
  const coordinador = Object.assign({}, coord);

  coordinador.id_coordinador = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };
  
  const result = await database.simpleExecute(createSql, coordinador);
  
  coordinador.id_coordinador = result.outBinds.id_coordinador[0];
  
  return coordinador;
}
  
module.exports.create = create;


const updateSql =
 `update coordinador
  set tipo = :tipo,
    nombre = :nombre,
    correo = :correo
  where id_coordinador = :id_coordinador`;


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
 `begin
    
    delete from coordinador
    where id_coordinador = :id_coordinador;

    :rowcount := sql%rowcount;

  end;`

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