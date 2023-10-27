const express = require('express');
const router = new express.Router();
const convenios = require('../controllers/convenios.js');
const instituciones = require('../controllers/instituciones.js')


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

module.exports = router;