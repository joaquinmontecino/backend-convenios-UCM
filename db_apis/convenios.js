const database = require('../services/database.js');
const oracledb = require('oracledb');


const baseSelectQuery = 
 `SELECT
    C.ID_CONVENIO "ID_Convenio",
    C.NOMBRE_CONV "Nombre_Convenio",
    C.TIPO_CONV "Tipo_Convenio",
    C.MOVILIDAD "Movilidad",
    C.VIGENCIA "Vigencia",
    C.ANO_FIRMA "Anio_Firma",
    C.TIPO_FIRMA "Tipo_Firma",
    C.CUPOS "Cupos",
    C.DOCUMENTOS "Documentos",
    C.CONDICION_RENOVACION "Condicion_Renovacion",
    C.ESTATUS "Estatus",
    TO_CHAR(C.FECHA_INICIO, 'DD/MM/YY') "Fecha_Inicio",
    TO_CHAR(C.FECHA_TERMINO, 'DD/MM/YY') "Fecha_Termino",
    I.ID_INSTITUCION "ID_Institucion",
    I.NOMBRE_INST "Nombre_Institucion",
    UG.ID_UNIDAD_GESTORA "ID_Unidad_Gestora",
    UG.NOMBRE_UNIDAD "Nombre_Unidad_Gestora",
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
      UNIDAD_GESTORA UG ON C.ID_UNIDAD_GESTORA = UG.ID_UNIDAD_GESTORA
    JOIN
      INSTITUCION I ON UG.ID_INSTITUCION = I.ID_INSTITUCION
    LEFT JOIN
      DETALLE_CONVENIO_COORDINADOR DCC ON C.ID_CONVENIO = DCC.ID_CONVENIO
    LEFT JOIN
      COORDINADOR CO ON DCC.ID_COORDINADOR = CO.ID_COORDINADOR`;

async function find(target) {
  let query = baseSelectQuery;
  const binds = {};

  if (target.id) {
    binds.id_convenio = target.id;

    query += `\nWHERE C.ID_CONVENIO = :id_convenio`;
  }else {
    query += `\norder by C.id_convenio`;
  }


  const result = await database.simpleExecute(query, binds);

  return result.rows;
}

module.exports.find = find;



const createSql =
 `DECLARE
    id_convenio_out NUMBER;
  BEGIN
   CREATE_CONVENIO(0,:id_unidad_gestora,:nombre_conv,:tipo_conv,:movilidad,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos,:condicion_renovacion,:estatus,:fecha_inicio,:fecha_termino,id_convenio_out);
   :id_convenio := id_convenio_out;
  END;`;


async function create(data) {
  const datos = Object.assign({}, data);
  console.log("datos EN CREATE");
  console.log(datos);
  const id_coordinador_bind = datos.id_coordinador;
  delete datos.id_coordinador;

  datos.id_convenio = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };

  const result = await database.simpleExecute(createSql, datos);
    
  datos.id_convenio = result.outBinds.id_convenio;
  const id_convenio_bind = datos.id_convenio;

  const insertDetalleCoordinadorSql = `INSERT INTO detalle_convenio_coordinador (id_detalle_conv_coord, id_convenio, id_coordinador) VALUES(0, :id_convenio_bind, :id_coordinador_bind)`;

  const bindsDetalleCoordinador = {
    id_convenio_bind,
    id_coordinador_bind
  };

  await database.simpleExecute(insertDetalleCoordinadorSql, bindsDetalleCoordinador);

  return datos;

}
  
module.exports.create = create;


const updateSql =
 `BEGIN
    UPDATE_CONVENIO(:id_convenio,:id_unidad_gestora,:nombre_conv,:tipo_conv,:movilidad,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos,:condicion_renovacion,:estatus,:fecha_inicio,:fecha_termino);
  END;`;


async function update(conv) {
  const convenio = Object.assign({}, conv);
  delete convenio.id_coordinador;
  const result = await database.simpleExecute(updateSql, convenio);

  if (result.rowsAffected === 1) {
    return convenio;
  } else {
    return null;
  }
}

module.exports.update = update;


const deleteSql =
 `
  BEGIN
    
    DELETE FROM detalle_convenio_coordinador
      WHERE id_convenio = :id_convenio;

    DELETE_CONVENIO(:id_convenio);

    :rowcount := sql%rowcount;

  END;`


async function del(id) {

  const binds = {
    id_convenio: id,
    rowcount: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER
    }
  }

  const result = await database.simpleExecute(deleteSql, binds);

  return result.outBinds.rowcount === 1;
}

module.exports.delete = del;




function construirQueryDinamica(criteria){
  let query = 'SELECT C.* FROM CONVENIO C';
  query+= ' LEFT JOIN UNIDAD_GESTORA UG ON C.ID_UNIDAD_GESTORA = UG.ID_UNIDAD_GESTORA'
  query += ' LEFT JOIN INSTITUCION I ON UG.ID_INSTITUCION = I.ID_INSTITUCION';
  let whereClause = '';
  const binds = {};
  if (criteria.id_institucion || criteria.id_unidad_gestora){
    whereClause += ' WHERE';
    
    if (criteria.id_institucion && criteria.id_unidad_gestora) {
      whereClause += ' (UG.ID_INSTITUCION = :id_institucion OR UG.ID_UNIDAD_GESTORA = :id_unidad_gestora)';
      binds.id_institucion = criteria.id_institucion;
      binds.id_unidad_gestora = criteria.id_unidad_gestora;
    }
    else{
      if (criteria.id_institucion){
        whereClause += ' UG.ID_INSTITUCION = :id_institucion';
        binds.id_institucion = criteria.id_institucion;
      }
      if(criteria.id_unidad_gestora){
        whereClause +=' UG.ID_UNIDAD_GESTORA = :id_unidad_gestora';
        binds.id_unidad_gestora = criteria.id_unidad_gestora;
      }
    }
  }

  if (criteria.tipo_conv){
    whereClause += `${whereClause.length > 0 ? ' AND' : ' WHERE'} C.TIPO_CONV = :tipo_conv`;
    binds.tipo_conv = criteria.tipo_conv;
  }
  
  if (criteria.movilidad){
    whereClause += `${whereClause.length > 0 ? ' AND' : ' WHERE'} C.MOVILIDAD = :movilidad`;
    binds.movilidad = criteria.movilidad;
  }
  
  if (criteria.ano_firma){
    whereClause += `${whereClause.length > 0 ? ' AND' : ' WHERE'} C.ANO_FIRMA = :ano_firma`;
    binds.ano_firma = criteria.ano_firma; 
  }
  
  if (criteria.tipo_firma){
    whereClause += `${whereClause.length > 0 ? ' AND' : ' WHERE'} C.TIPO_FIRMA = :tipo_firma`;
    binds.tipo_firma = criteria.tipo_firma;
  }
  
  if (criteria.estatus){
    whereClause += `${whereClause.length > 0 ? ' AND' : ' WHERE'} C.ESTATUS = :estatus`;
    binds.estatus = criteria.estatus;
  }

  if (criteria.fecha_termino){
    whereClause += `${whereClause.length > 0 ? ' AND ' : ' WHERE'} C.FECHA_TERMINO = :fecha_termino`;
    binds.fecha_termino = criteria.fecha_termino;
  }

  if (criteria.pais){
    whereClause += `${whereClause.length > 0 ? ' AND ' : ' WHERE'} I.PAIS = :pais`;
    binds.pais = criteria.pais;
  }


  if (criteria.alcance){
    whereClause += `${whereClause.length > 0 ? ' AND ' : ' WHERE'} I.ALCANCE = :alcance`;
    binds.alcance = criteria.alcance;
  }


  query += whereClause;
  return {query, binds};
}



async function generarReporte(criteria){
  console.log('Criteria: ');
  console.log(criteria);
  const {query, binds} = construirQueryDinamica(criteria);
  console.log(query);
  const result = await database.simpleExecute(query, binds);
  return result;

}



module.exports.generarReporte = generarReporte;














/*
 const createSQLCRUD2 = `
  BEGIN
    SELECT id_convenio_out INTO :id_convenio
      FROM CREATE_CONVENIO(0,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos);
  END;
`;

const createSql = `insert into convenio (id_convenio,nombre_conv,tipo_conv,vigencia,ano_firma,tipo_firma,cupos,documentos) values (0,:nombre_conv,:tipo_conv,:vigencia,:ano_firma,:tipo_firma,:cupos,:documentos) returning id_convenio into :id_convenio`;
 */