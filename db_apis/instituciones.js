const database = require('../services/database.js');
const oracledb = require('oracledb');



const baseSelectQueryInstitucion = 
  `select id_institucion "id",
  nombre_inst "Nombre_Institucion",
  pais "Pais",
  alcance "Alcance",
  tipo_institucion "Tipo_Institucion"
  from institucion`;


async function find(target) {
  let query = baseSelectQueryInstitucion;
  const binds = {};

  if (target.id) {
    binds.id_institucion = target.id;

    query += `\nwhere id_institucion = :id_institucion`;
  }else {
    query += `\norder by id_institucion`;
  }


  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;




const createSqlInstitucion =
  `DECLARE
     id_institucion_out NUMBER;
   BEGIN
    CREATE_INSTITUCION(0,:nombre_inst,:pais,:alcance,:tipo_institucion,id_institucion_out);
    :id_institucion := id_institucion_out;
   END;`;


async function create(inst) {
  const institucion = Object.assign({}, inst);

  institucion.id_institucion = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };
  
  const result = await database.simpleExecute(createSqlInstitucion, institucion);
  
  institucion.id_institucion = result.outBinds.id_institucion;
  
  return institucion;
}
  
module.exports.create = create;


const updateSqlInstitucion =
`BEGIN
    UPDATE_INSTITUCION(:id_institucion,:nombre_inst,:pais,:alcance,:tipo_institucion);
  END;`;

async function update(inst) {
  const institucion = Object.assign({}, inst);
  const result = await database.simpleExecute(updateSqlInstitucion, institucion);

  if (result.rowsAffected === 1) {
    return institucion;
  } else {
    return null;
  }
}

module.exports.update = update;


const deleteSqlInstitucion =
`BEGIN                      
  DELETE_INSTITUCION(:id_institucion);

  :rowcount := sql%rowcount;                               
END;`


async function del(id) {

const binds = {
  id_institucion: id,
  rowcount: {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  }
}

const result = await database.simpleExecute(deleteSqlInstitucion, binds);


return result.outBinds.rowcount === 1;
}

module.exports.delete = del;


const nombresSqlInstitucion = 
  `select id_institucion "ID_Institucion", nombre_inst "Nombre_Institucion"
  from institucion
  where id_institucion != 0
  order by id_institucion`;

async function listarNombres(){
  let query = nombresSqlInstitucion;
  const result = await database.simpleExecute(query, {});
  return result.rows;
}
module.exports.listarNombres = listarNombres;


