const express = require('express');
const router = new express.Router();
const convenios = require('../controllers/convenios.js');
const instituciones = require('../controllers/instituciones.js');
const usuarios = require('../controllers/usuarios.js');
const coordinadores = require('../controllers/coordinadores.js');
const renovaciones = require('../controllers/renovaciones.js');
const unidades_gestoras = require('../controllers/unidades_gestoras.js')


router.route('/convenios/:id?')
  .get(convenios.get)
  .post(convenios.post)
  .put(convenios.put)
  .delete(convenios.delete);


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
router.route('/nombresCoordinadores').get(coordinadores.listar);

router.route('/renovaciones/:id?')
  .get(renovaciones.get)           
  .post(renovaciones.post)         
  .put(renovaciones.put)           
  .delete(renovaciones.delete);

router.route('/unidad_gestora/:id?')
  .get(unidades_gestoras.get)
  .post(unidades_gestoras.post)         
  .put(unidades_gestoras.put)           
  .delete(unidades_gestoras.delete);


router.route('/usuarios/register').post(usuarios.register);
router.route('/usuarios/login').post(usuarios.login);
router.route('/usuarios/:id?').get(usuarios.get)
  .put(usuarios.put)
  .delete(usuarios.delete);

module.exports = router;