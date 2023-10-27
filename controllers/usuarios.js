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
    username: req.body.username,
    password: req.body.password
  };
  return credentials;
}