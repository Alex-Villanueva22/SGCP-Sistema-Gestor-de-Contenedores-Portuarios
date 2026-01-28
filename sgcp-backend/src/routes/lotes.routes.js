const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotes.controller');

// Rutas especiales primero (antes de /:id)
router.get('/contenedor/:idContenedor', lotesController.obtenerPorContenedor);
router.get('/producto/:idProducto', lotesController.obtenerPorProducto);

// Rutas CRUD estándar
router.get('/', lotesController.obtenerTodos);
router.get('/:id', lotesController.obtenerPorId);
router.post('/', lotesController.crear);
router.put('/:id', lotesController.actualizar);
router.delete('/:id', lotesController.eliminar);

module.exports = router;