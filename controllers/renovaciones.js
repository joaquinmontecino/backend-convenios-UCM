const renovaciones = require('../db_apis/renovaciones.js');


async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);

    const rows = await renovaciones.find(target);

    if (req.params.id) {
      if (rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch (err) {
    next(err);
  }
}
  
module.exports.get = get;
  
  
function getRenovacionFromReq(req) {
  const renovacion = {
    condicion_renovacion: req.body.condicion_renovacion,
    estatus: req.body.estatus,
    fecha_inicio: req.body.fecha_inicio,
    fecha_termino: req.body.fecha_termino
  };
 
  return renovacion;
}
  
async function post(req, res, next) {
  try {
    let renovacion = getCoordinadorFromReq(req);

    renovacion = await renovaciones.create(renovacion);

    res.status(201).json(renovacion);
  } catch (err) {
    next(err);
  }
}
  
module.exports.post = post;
  
  
async function put(req, res, next) {
  try {
    let renovacion = getRenovacionFromReq(req);

    renovacion.id_renovacion = parseInt(req.params.id, 10);

    renovacion = await renovaciones.update(renovacion);

    if (renovacion !== null) {
      res.status(200).json(renovacion);
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}

module.exports.put = put;


async function del(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const success = await renovaciones.delete(id);

    if (success) {
      res.status(204).end();
    } else {
      res.status(404).end();
    }
  } catch (err) {
    next(err);
  }
}
  
module.exports.delete = del;