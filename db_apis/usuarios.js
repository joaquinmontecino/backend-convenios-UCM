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
    :id_usuario,
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