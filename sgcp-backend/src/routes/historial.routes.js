const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller');

// Rutas especiales primero (antes de /:id)
router.get('/contenedor/:idContenedor', historialController.obtenerPorContenedor);
router.get('/usuario/:idUsuario', historialController.obtenerPorUsuario);
router.get('/fechas', historialController.obtenerPorFechas);

// Rutas READ y UPDATE
router.get('/', historialController.obtenerTodos);
router.get('/:id', historialController.obtenerPorId);
router.put('/:id', historialController.actualizar);

module.exports = router;