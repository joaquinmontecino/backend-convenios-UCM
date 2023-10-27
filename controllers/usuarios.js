const usuarios = require('../db_apis/usuarios.js');

async function register(req, res, next){
  try{
    let usuario = getUsuarioFromReq(req);
    usuario = await usuarios.create(usuario);
    res.status(201).json(usuario);

  } catch(err){
    next(err);
  }
}
module.exports.register = register;


async function login(req, res ,next){
  try{
    const credentials = getCredentialsFromReq(req);
    const user = await usuarios.authenticate(credentials);

    if (user){
      res.status(200).json(user);
    } else{
      res.status(401).end();
    }
  }catch(err){
    next(err);
  }
}
module.exports.login = login;

async function get(req,res,next){
  try{
    const target = {};
    target.id = Number(req.params.id);
    const rows = await usuarios.find(target);

    if (req.params.id) {
      if (rows.length === 1) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).end();
      }
    } else {
      res.status(200).json(rows);
    }
  } catch(err){
    next(err);
  }
}
module.exports.get = get;


function getUsuarioFromReq(req){
  const usuario = {
    email: req.body.email,
    contrasena: req.body.contrasena,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    vigencia: req.body.vigencia,
    privilegios: req.body.privilegios
  };
  return usuario;
}

function getCredentialsFromReq(req){
  const credentials ={
    email: req.body.email,
    contrasena: req.body.contrasena
  };
  return credentials;
}