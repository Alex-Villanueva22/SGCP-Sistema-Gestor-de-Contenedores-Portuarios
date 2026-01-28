const express = require('express');
const router = express.Router();
const embarcacionesController = require('../controllers/embarcaciones.controller');

// Rutas especiales primero (antes de /:id)
router.get('/buscar/:nombre', embarcacionesController.buscarPorNombre);
router.get('/en-puerto', embarcacionesController.obtenerEnPuerto);

// Rutas CRUD estándar
router.get('/', embarcacionesController.obtenerTodos);
router.get('/:id', embarcacionesController.obtenerPorId);
router.post('/', embarcacionesController.crear);
router.put('/:id', embarcacionesController.actualizar);
router.delete('/:id', embarcacionesController.eliminar);

// Ruta para obtener contenedores de una embarcación
router.get('/:id/contenedores', embarcacionesController.obtenerContenedores);

module.exports = router;