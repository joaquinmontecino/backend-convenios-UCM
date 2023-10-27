const instituciones = require('../db_apis/instituciones.js');

// Controlador para obtener información de una institucion o de todas las instituciones.
async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);           // Se obtiene el ID del institucion de la solicitud

    const rows = await instituciones.find(target);   // Se busca en la base de datos

    if (req.params.id) {                // Si se proporciona un ID en la solicitud
      if (rows.length === 1) {                  // Si se encontró una institucion
        res.status(200).json(rows[0]);          // Responder con los detalles de la institucion
      } else {
        res.status(404).end();                  // Si no se encuentra la institucion, responder con código 404
      }
    } else {
      res.status(200).json(rows);      // Si no se proporciona un ID, responder con una lista de todos las instituciones
    }
  } catch (err) {
    next(err);
  }
}

module.exports.get = get;

// Función para obtener los datos de una institucion a partir de la solicitud.
function getInstitucionFromRec(req) {
  const institucion = {
    nombre_inst: req.body.nombre_inst,
    unidad_academica: req.body.unidad_academica,
    pais: req.body.pais,
    alcance: req.body.alcance,
    tipo_institucion: req.body.tipo_institucion,
  };

  return institucion;
}

// Controlador para crear una nueva institucion.
async function post(req, res, next) {
  try {
    let institucion = getInstitucionFromRec(req);         // Obtener los datos de la institucion de la solicitud

    institucion = await instituciones.create(institucion);    // Crear una nueva institucion en la base de datos

    res.status(201).json(institucion);                 // Responder con los detalles de la nuevo institucion y código 201 (creado)
  } catch (err) {
    next(err);
  }
}

module.exports.post = post;


// Controlador para actualizar una institucion existente.
async function put(req, res, next) {
  try {
    let institucion = getInstitucionFromRec(req);               // Obtener los datos de la institucion de la solicitud

    institucion.id_institucion = parseInt(req.params.id, 10);   // Obtener el ID de la institucion a actualizar

    institucion = await instituciones.update(institucion);          // Actualizar la institucion en la base de datos

    if (institucion !== null) {
      res.status(200).json(institucion);               // Responder con los detalles de la institucion actualizado y código 200 (éxito)
    } else {
      res.status(404).end();                        // Si la institucion no se encontró, responder con código 404
    }
  } catch (err) {
    next(err);
  }
}

module.exports.put = put;

// Controlador para eliminar una institucion existente.
async function del(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);       // Obtener el ID de la institucion a eliminar

    const success = await instituciones.delete(id);   // Intentar eliminar la institucion de la base de datos

    if (success) {
      res.status(204).end();              // Si la eliminación es exitosa, responder con código 204 (sin contenido)
    } else {
      res.status(404).end();              // Si la institucion no se encontró, responder con código 404
    }
  } catch (err) {
    next(err);
  }
}

module.exports.delete = del;
