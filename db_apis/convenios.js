const database = require('../services/database.js');
const oracledb = require('oracledb');


// Consulta base para seleccionar los datos de los convenios
const baseSelectQuery = 
 `select id_convenio "ID_Convenio",
    nombre_conv "Nombre_Convenio",
    tipo_conv "Tipo_Convenio",
    vigencia "Vigencia",
    ano_firma "Anio_Firma",
    tipo_firma "Tipo_Firma",
    cupos "Cupos",
    documentos "Documentos"
  from convenio`;

// Función para buscar convenios en la base de datos según el target proporcionado
async function find(target) {
  let query = baseSelectQuery;
  const binds = {};                  // Crea un objeto vacío llamado "binds" para contener los valores a enlazar en la consulta

  if (target.id) {                    // Verifica si el target tiene una propiedad "id"
    binds.id_convenio = target.id;    // Si target tiene id, asigna ese valor a binds con la clave "id_convenio"
                                              // Y se adjunta a la consulta una clausula where usando el id, para asi obtener un solo convenio
    query += `\nwhere id_convenio = :id_convenio`;
  }else {
    query += `\norder by id_convenio`;
  }

  // Ejecuta la consulta en la base de datos, pasando la consulta y los valores a enlazar como argumentos
  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;



// Consulta SQL para insertar un nuevo convenio en la base de datos
const createSql =
 `DECLARE
    id_convenio_out NUMBER;
  BEGIN
   CREATE_CONVENIO(0,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos,id_convenio_out);
   :id_convenio := id_convenio_out;
  END;`;

// Función asincrónica para crear un nuevo convenio
async function create(data) {
  const datos = Object.assign({}, data);
  const id_institucion_bind = datos.id_institucion;
  delete datos.id_institucion;

  const id_coordinador_bind = datos.id_coordinador;
  delete datos.id_coordinador;

  datos.id_convenio = {
    dir: oracledb.BIND_OUT,         // Especifica que es una salida
    type: oracledb.NUMBER           // Especifica el tipo de dato como número
  };


  const result = await database.simpleExecute(createSql, datos);
    
  datos.id_convenio = result.outBinds.id_convenio;


  const id_convenio_bind = datos.id_convenio;

  const insertDetalleInstitucionSql = `INSERT INTO detalle_convenio_institucion (id_detalle_conv_inst, id_convenio, id_institucion) VALUES(0, :id_convenio_bind, :id_institucion_bind)`;
  
  const bindsDetalleInstitucion = {
    id_convenio_bind,
    id_institucion_bind
  };
    
  await database.simpleExecute(insertDetalleInstitucionSql, bindsDetalleInstitucion);


  const insertDetalleCoordinadorSql = `INSERT INTO detalle_convenio_coordinador (id_detalle_conv_coord, id_convenio, id_coordinador) VALUES(0, :id_convenio_bind, :id_coordinador_bind)`;

  const bindsDetalleCoordinador = {
    id_convenio_bind,
    id_coordinador_bind
  };
  console.log("BINDS COORDINADOR");
  console.log(bindsDetalleCoordinador);

  await database.simpleExecute(insertDetalleCoordinadorSql, bindsDetalleCoordinador);


  return datos;

}
  
module.exports.create = create;


// Consulta SQL para actualizar un convenio existente en la base de datos
const updateSql =
 `BEGIN
    UPDATE_CONVENIO(:id_convenio,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos);
  END;`;


// Función asincrónica para actualizar un convenio existente
async function update(conv) {
  const convenio = Object.assign({}, conv);
  const result = await database.simpleExecute(updateSql, convenio);

  if (result.rowsAffected === 1) {                        // Verifica si se afectó una fila en la base de datos (la actualización fue exitosa)
    return convenio;                  // Devuelve el objeto "convenio" actualizado
  } else {
    return null;                      // Devuelve nulo si no se actualizó ninguna fila (convenio no encontrado)
  }
}

module.exports.update = update;


// Consulta SQL para eliminar un convenio de la base de datos
                  // OJO: Luego hay que agregar los intermediarios
                                  //delete from detalle_convenio_institucion where id_convenio = :id_convenio;
const deleteSql =
 `
  BEGIN
    

    DELETE FROM detalle_convenio_coordinador
    WHERE id_convenio = :id_convenio;
    DELETE FROM detalle_convenio_institucion
    WHERE id_convenio = :id_convenio;
    
    DELETE_CONVENIO(:id_convenio);

    :rowcount := sql%rowcount;

  END;`

// Función asincrónica para eliminar un convenio
async function del(id) {
    // Define los valores a enlazar en la consulta, incluyendo "id_convenio" y "rowcount" como salida
  const binds = {
    id_convenio: id,
    rowcount: {
      dir: oracledb.BIND_OUT,         // Especifica que es una salida
      type: oracledb.NUMBER           // Especifica el tipo de dato como número
    }
  }

  // Ejecuta la consulta SQL de eliminación en la base de datos y pasa los "binds" como argumento
  const result = await database.simpleExecute(deleteSql, binds);

  // Devuelve true si se eliminó correctamente (1 fila afectada), de lo contrario, devuelve false
  return result.outBinds.rowcount === 1;
}

module.exports.delete = del;


























/*
 const createSQLCRUD2 = `
  BEGIN
    SELECT id_convenio_out INTO :id_convenio
      FROM CREATE_CONVENIO(0,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos);
  END;
`;

const createSql = `insert into convenio (id_convenio,nombre_conv,tipo_conv,vigencia,ano_firma,tipo_firma,cupos,documentos) values (0,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos) returning id_convenio into :id_convenio`;
 */