const coordinadores = require('../db_apis/coordinadores.js');


async function get(req, res, next) {
  try {
    const target = {};
 
    target.id = Number(req.params.id);

    const rows = await coordinadores.find(target);

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
  
  
function getCoordinadorFromReq(req) {
  const coordinador = {
    id_institucion: req.body.id_institucion,
    tipo: req.body.tipo,
    nombre: req.body.nombre,
    correo: req.body.correo
  };
 
  return coordinador;
}
  
async function post(req, res, next) {
  try {
    let coordinador = getCoordinadorFromReq(req);

    coordinador = await coordinadores.create(coordinador);

    res.status(201).json(coordinador);
  } catch (err) {
    next(err);
  }
}
  
module.exports.post = post;
  
  
async function put(req, res, next) {
  try {
    let coordinador = getCoordinadorFromReq(req);

    coordinador.id_coordinador = parseInt(req.params.id, 10);

    coordinador = await coordinadores.update(coordinador);

    if (coordinador !== null) {
      res.status(200).json(coordinador);
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

    const success = await coordinadores.delete(id);

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
    const rows = await coordinadores.listarNombres();
    res.status(200).json(rows);
  }catch (err){
    next(err);
  }
}

module.exports.listar = listar;