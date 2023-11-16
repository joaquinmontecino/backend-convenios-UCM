const convenios = require('../db_apis/convenios.js');


// Controlador para obtener información de un convenio o de todos los convenios.
async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);           // Se obtiene el ID del convenio de la solicitud

    const rows = await convenios.find(target);   // Se busca en la base de datos

    if (req.params.id) {                // Si se proporciona un ID en la solicitud
      if (rows.length === 1) {                  // Si se encontró un convenio
        res.status(200).json(rows[0]);          // Responder con los detalles del convenio
      } else {
        res.status(404).end();                  // Si no se encuentra el convenio, responder con código 404
      }
    } else {
      res.status(200).json(rows);      // Si no se proporciona un ID, responder con una lista de todos los convenios
    }
  } catch (err) {
    next(err);
  }
}


// Función para obtener los datos de un convenio a partir de la solicitud.
function getDatosFromReq(req) {
  const datos = {
    id_institucion: req.body.id_institucion,
    id_coordinador: req.body.id_coordinador,
    nombre_conv: req.body.nombre_conv,
    tipo_conv: req.body.tipo_conv,
    vigencia: req.body.vigencia,
    ano_firma: req.body.ano_firma,
    tipo_firma: req.body.tipo_firma,
    cupos: req.body.cupos,
    documentos: req.body.documentos      
  };

  return datos;
}

// Controlador para crear un nuevo convenio.
async function post(req, res, next) {
  try {
    let datos = getDatosFromReq(req);         // Obtener los datos del convenio de la solicitud

    datos = await convenios.create(datos);    // Crear un nuevo convenio en la base de datos

    res.status(201).json(datos);                 // Responder con los detalles del nuevo convenio y código 201 (creado)
  } catch (err) {
    next(err);
  }
}




async function put(req, res, next) {
  try {
    let convenio = getDatosFromReq(req);

    convenio.id_convenio = parseInt(req.params.id, 10);

    convenio = await convenios.update(convenio);       

    if (convenio !== null) {
      res.status(200).json(convenio);               
    } else {
      res.status(404).end();                        
    }
  } catch (err) {
    next(err);
  }
}
  
// Controlador para eliminar un convenio existente.
async function del(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);       // Obtener el ID del convenio a eliminar

    const success = await convenios.delete(id);   // Intentar eliminar el convenio de la base de datos

    if (success) {
      res.status(204).end();              // Si la eliminación es exitosa, responder con código 204 (sin contenido)
    } else {
      res.status(404).end();              // Si el convenio no se encontró, responder con código 404
    }
  } catch (err) {
    next(err);
  }
}
  




module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.delete = del;