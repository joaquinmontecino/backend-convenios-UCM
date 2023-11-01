const database = require('../services/database.js');
const oracledb = require('oracledb');


// Consulta base para seleccionar los datos de los convenios
const baseSelectQuery = 
 `SELECT
    C.ID_CONVENIO "ID_Convenio",
    C.NOMBRE_CONV "Nombre_Convenio",
    C.TIPO_CONV "Tipo_Convenio",
    C.VIGENCIA "Vigencia",
    C.ANO_FIRMA "Anio_Firma",
    C.TIPO_FIRMA "Tipo_Firma",
    C.CUPOS "Cupos",
    C.DOCUMENTOS "Documentos",
    I.ID_INSTITUCION "ID_Institucion",
    I.NOMBRE_INST "Nombre_Institucion",
    I.UNIDAD_ACADEMICA "Unidad_Academica",
    I.PAIS "Pais",
    I.ALCANCE "Alcance",
    I.TIPO_INSTITUCION "Tipo_Institucion",
    CO.ID_COORDINADOR "ID_Coordinador",
    CO.TIPO "Tipo_Coordinador",
    CO.NOMBRE "Nombre_Coordinador",
    CO.CORREO "Correo_Coordinador"
    FROM
      CONVENIO C
    JOIN
      DETALLE_CONVENIO_INSTITUCION DCI ON C.ID_CONVENIO = DCI.ID_CONVENIO
    JOIN
      INSTITUCION I ON DCI.ID_INSTITUCION = I.ID_INSTITUCION
    LEFT JOIN
      DETALLE_CONVENIO_COORDINADOR DCC ON C.ID_CONVENIO = DCC.ID_CONVENIO
    LEFT JOIN
      COORDINADOR CO ON DCC.ID_COORDINADOR = CO.ID_COORDINADOR`;

// Función para buscar convenios en la base de datos según el target proporcionado
async function find(target) {
  let query = baseSelectQuery;
  const binds = {};                  // Crea un objeto vacío llamado "binds" para contener los valores a enlazar en la consulta

  if (target.id) {                    // Verifica si el target tiene una propiedad "id"
    binds.id_convenio = target.id;    // Si target tiene id, asigna ese valor a binds con la clave "id_convenio"
                                              // Y se adjunta a la consulta una clausula where usando el id, para asi obtener un solo convenio
    query += `\nWHERE C.ID_CONVENIO = :id_convenio`;
  }else {
    query += `\norder by C.id_convenio`;
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
  console.log("binds.rowcount:");
  console.log(binds.rowcount);
  const result = await database.simpleExecute(deleteSql, binds);

  // Devuelve true si se eliminó correctamente (1 fila afectada), de lo contrario, devuelve false
  console.log("RESULT:");
  console.log(result);
  console.log("result.outBinds:");
  console.log(result.outBinds);
  console.log("SE ELIMINO?");
  console.log(result.outBinds.rowcount === 1);
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