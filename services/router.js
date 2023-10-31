const express = require('express');
const router = new express.Router();
const convenios = require('../controllers/convenios.js');
const instituciones = require('../controllers/instituciones.js');
const usuarios = require('../controllers/usuarios.js');
const coordinadores = require('../controllers/coordinadores.js');
const renovaciones = require('../controllers/renovaciones.js');


// Definición de rutas para la gestión de convenios, opcionalmente especificando un ID
router.route('/convenios/:id?')
  .get(convenios.get)           // Ruta para obtener detalles de un convenio (puede incluir un ID)
  .post(convenios.post)         // Ruta para crear un nuevo convenio
  .put(convenios.put)           // Ruta para actualizar un convenio existente
  .delete(convenios.delete);    // Ruta para eliminar un convenio existente


router.route('/instituciones/:id?')
  .get(instituciones.get)           
  .post(instituciones.post)         
  .put(instituciones.put)           
  .delete(instituciones.delete);    
router.route('/nombresInstituciones').get(instituciones.listar);

router.route('/coordinadores/:id?')
  .get(coordinadores.get)           
  .post(coordinadores.post)         
  .put(coordinadores.put)           
  .delete(coordinadores.delete);

router.route('/renovaciones/:id?')
  .get(renovaciones.get)           
  .post(renovaciones.post)         
  .put(renovaciones.put)           
  .delete(renovaciones.delete);


router.route('/usuarios/register').post(usuarios.register);
router.route('/usuarios/login').post(usuarios.login);
router.route('/usuarios/:id?').get(usuarios.get)
  .put(usuarios.put)
  .delete(usuarios.delete);
//router.route('/usuarios/perfil=:id').get(usuarios.get);

module.exports = router;