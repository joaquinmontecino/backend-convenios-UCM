const database = require('../services/database.js');
const oracledb = require('oracledb');
/**    email: req.body.email,
    contrasena: req.body.contrasena,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    vigencia: req.body.vigencia,
    privilegios: req.body.privilegios */
const createSql =
  `insert into usuario( 
    id_usuario,
    email,
    contrasena,
    nombre,
    apellido,
    vigencia,
    privilegios
    )values (
    0,
    :email,
    :contrasena,
    :nombre,
    :apellido,
    :vigencia,
    :privilegios
    )returning id_usuario
    into :id_usuario`;

async function create (user){
  const usuario = Object.assign({}, user);
  usuario.id_usuario = {
    dir: oracledb.BIND_OUT,
    type: oracledb.NUMBER
  };

  const result = await database.simpleExecute(createSql, usuario);
  usuario.id_usuario = result.outBinds.id_usuario[0];
  return usuario;
}
module.exports.create = create;


const authenticateUsuarioSql = `
  SELECT id_usuario, email
  FROM usuario
  WHERE email = :email AND contrasena = :contrasena
`;

async function authenticate(credentials){
  const result = await database.simpleExecute(authenticateUsuarioSql, credentials);

  if (result.rows.length === 1) {
    return result.rows[0];
  } else {
    return null;
  }
}
module.exports.authenticate = authenticate;


const selectQueryConID= `
  SELECT email "Email",
  nombre "Nombre",
  apellido "Apellido"
  FROM usuario
  WHERE id_usuario = :id_usuario
`;
const selectQuerySinID= `
  SELECT id_usuario "ID_Usuario",
  email "Email",
  nombre "Nombre",
  apellido "Apellido",
  vigencia "Vigencia",
  privilegios "Privilegios"
  FROM usuario
`;


async function find(target){
  let query = selectQuerySinID;
  const binds = {};

  if (target.id){
    binds.id_usuario = target.id;
    query = selectQueryConID;
  }

  const result = await database.simpleExecute(query, binds);
  return result.rows;
}
module.exports.find = find;