const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertas.controller');

// Rutas especiales primero (antes de /:id)
router.get('/contenedor/:idContenedor', alertasController.obtenerPorContenedor);
router.get('/estado/:estado', alertasController.obtenerPorEstado);
router.get('/recientes', alertasController.obtenerRecientes);
router.get('/activas', alertasController.obtenerActivas);
router.get('/fechas', alertasController.obtenerPorFechas);

// Rutas READ y UPDATE
router.get('/', alertasController.obtenerTodos);
router.get('/:id', alertasController.obtenerPorId);
router.put('/:id', alertasController.actualizar);

module.exports = router;