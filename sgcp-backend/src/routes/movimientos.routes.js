const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientos.controller');

// Rutas especiales primero (antes de /:id)
router.get('/contenedor/:idContenedor', movimientosController.obtenerPorContenedor);
router.get('/tipo/:tipo', movimientosController.obtenerPorTipo);
router.get('/recientes', movimientosController.obtenerRecientes);

// Rutas CRUD estándar
router.get('/', movimientosController.obtenerTodos);
router.get('/:id', movimientosController.obtenerPorId);
router.post('/', movimientosController.crear);
router.put('/:id', movimientosController.actualizar);
router.delete('/:id', movimientosController.eliminar);

module.exports = router;