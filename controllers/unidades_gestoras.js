const unidades_gestoras = require('../db_apis/unidades_gestoras.js');


async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);

    const rows = await unidades_gestoras.find(target);

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

  
function getUnidadGestoraFromReq(req) {
  const unidad_gestora = {
    id_institucion: req.body.id_institucion,
    nombre_unidad: req.body.nombre_unidad
  };
 
  return unidad_gestora;
}
  
async function post(req, res, next) {
  try {
    let unidad_gestora = getUnidadGestoraFromReq(req);

    unidad_gestora = await unidades_gestoras.create(unidad_gestora);

    res.status(201).json(unidad_gestora);
  } catch (err) {
    next(err);
  }
}
  
module.exports.post = post;
  
  
async function put(req, res, next) {
  try {
    let unidad_gestora = getRenovacionFromReq(req);

    unidad_gestora.id_unidad_gestora = parseInt(req.params.id, 10);

    unidad_gestora = await unidades_gestoras.update(unidad_gestora);

    if (unidad_gestora !== null) {
      res.status(200).json(unidad_gestora);
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

    const success = await unidades_gestoras.delete(id);

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