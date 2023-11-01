const database = require('../services/database.js');
const oracledb = require('oracledb');


// Consulta base para seleccionar los datos de las instituciones
const baseSelectQueryInstitucion = 
  `select id_institucion "id",
  nombre_inst "Nombre_Institucion",
  unidad_academica "Unidad_Academica",
  pais "Pais",
  alcance "Alcance",
  tipo_institucion "Tipo_Institucion"
  from institucion`;

// Función para buscar instituciones en la base de datos según el target proporcionado
async function find(target) {
  let query = baseSelectQueryInstitucion;
  const binds = {};                  // Crea un objeto vacío llamado "binds" para contener los valores a enlazar en la consulta

  if (target.id) {                    // Verifica si el target tiene una propiedad "id"
    binds.id_institucion = target.id;    // Si target tiene id, asigna ese valor a binds con la clave "id_institucion"
                                              // Y se adjunta a la consulta una clausula where usando el id, para asi obtener una sola institucion
    query += `\nwhere id_institucion = :id_institucion`;
  }else {
    query += `\norder by id_institucion`;
  }

  // Ejecuta la consulta en la base de datos, pasando la consulta y los valores a enlazar como argumentos
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;


// Consulta SQL para insertar una nueva institucion en la base de datos

  const createSqlInstitucion =
  `DECLARE
     id_institucion_out NUMBER;
   BEGIN
    CREATE_INSTITUCION(0,:nombre_inst,:unidad_academica,:pais,:alcance,:tipo_institucion,id_institucion_out);
    :id_institucion := id_institucion_out;
   END;`;

// Función asincrónica para crear un nuevo institucion
async function create(inst) {
  const institucion = Object.assign({}, inst);           // Crea una copia del objeto "inst" y lo asigna a una nueva variable "institucion"

  // Define la propiedad "id_institucion" en el objeto "institucion" con metadatos para la salida (BIND_OUT)
  institucion.id_institucion = {
    dir: oracledb.BIND_OUT,         // Especifica que es una salida
    type: oracledb.NUMBER           // Especifica el tipo de dato como número
  };
  
  // Ejecuta la consulta SQL de inserción en la base de datos y pasa el objeto "institucion" como argumento
  const result = await database.simpleExecute(createSqlInstitucion, institucion);
  
  // Actualiza la propiedad "id_institucion" en "institucion" con el valor generado en la base de datos
  institucion.id_institucion = result.outBinds.id_institucion;
  
  // Devuelve el objeto "institucion" que contiene la información del nuevo institucion creado
  return institucion;
}
  
module.exports.create = create;


// Consulta SQL para actualizar una institucion existente en la base de datos
const updateSqlInstitucion =
`BEGIN
    UPDATE_INSTITUCION(:id_institucion,:nombre_inst,:unidad_academica,:pais,:alcance,:tipo_institucion);
  END;`;

// Función asincrónica para actualizar una institucion existente
async function update(inst) {
  const institucion = Object.assign({}, inst);
  const result = await database.simpleExecute(updateSqlInstitucion, institucion);

  if (result.rowsAffected === 1) {                        // Verifica si se afectó una fila en la base de datos (la actualización fue exitosa)
    return institucion;                  // Devuelve el objeto "institucion" actualizado
  } else {
    return null;                      // Devuelve nulo si no se actualizó ninguna fila (institucion no encontrado)
  }
}

module.exports.update = update;


// Consulta SQL para eliminar un institucion de la base de datos
                  // OJO: Luego hay que agregar los intermediarios
                                  //delete from detalle_convenio_institucion where id_institucion = :id_institucion;
const deleteSqlInstitucion =
`BEGIN                      
  DELETE FROM detalle_convenio_institucion
  WHERE id_institucion = :id_institucion;
  DELETE_INSTITUCION(:id_institucion);

  :rowcount := sql%rowcount;                               
END;`

// Función asincrónica para eliminar una institucion
async function del(id) {
  // Define los valores a enlazar en la consulta, incluyendo "id_institucion" y "rowcount" como salida
const binds = {
  id_institucion: id,
  rowcount: {
    dir: oracledb.BIND_OUT,         // Especifica que es una salida
    type: oracledb.NUMBER           // Especifica el tipo de dato como número
  }
}

// Ejecuta la consulta SQL de eliminación en la base de datos y pasa los "binds" como argumento
const result = await database.simpleExecute(deleteSqlInstitucion, binds);

// Devuelve true si se eliminó correctamente (1 fila afectada), de lo contrario, devuelve false
return result.outBinds.rowcount === 1;
}

module.exports.delete = del;


const nombresSqlInstitucion = 
  `select id_institucion "ID_Institucion", nombre_inst "Nombre_Institucion"
  from institucion
  order by id_institucion`;

async function listarNombres(){
  let query = nombresSqlInstitucion;
  const result = await database.simpleExecute(query, {});
  return result.rows;
}
module.exports.listarNombres = listarNombres;














/* const createSqlInstitucion =
 `insert into institucion (
    id_institucion,
    nombre_inst,
    unidad_academica,
    pais,
    alcance,
    tipo_institucion
  ) values (
    0,
    :nombre_inst,
    :unidad_academica,
    :pais,
    :alcance,
    :tipo_institucion
  ) returning id_institucion
  into :id_institucion`;
  */