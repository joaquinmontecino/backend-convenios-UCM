const instituciones = require('../db_apis/instituciones.js');


async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);

    const rows = await instituciones.find(target);

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


function getInstitucionFromReq(req) {
  const institucion = {
    nombre_inst: req.body.nombre_inst,
    pais: req.body.pais,
    alcance: req.body.alcance,
    tipo_institucion: req.body.tipo_institucion
  };

  return institucion;
}


async function post(req, res, next) {
  try {
    let institucion = getInstitucionFromReq(req);

    institucion = await instituciones.create(institucion);

    res.status(201).json(institucion);
  } catch (err) {
    next(err);
  }
}

module.exports.post = post;



async function put(req, res, next) {
  try {
    let institucion = getInstitucionFromReq(req);

    institucion.id_institucion = parseInt(req.params.id, 10);

    institucion = await instituciones.update(institucion);

    if (institucion !== null) {
      res.status(200).json(institucion);
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

    const success = await instituciones.delete(id);

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

async function listar(req,res,next){
  try{
    const rows = await instituciones.listarNombres();
    res.status(200).json(rows);
  }catch (err){
    next(err);
  }
}

module.exports.listar = listar;