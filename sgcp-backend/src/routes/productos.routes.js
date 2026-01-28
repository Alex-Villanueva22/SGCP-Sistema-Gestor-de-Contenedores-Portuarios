const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

// Rutas especiales primero (antes de /:id)
router.get('/buscar/:nombre', productosController.buscarPorNombre);
router.get('/tipo/:tipo', productosController.obtenerPorTipo);

// Rutas CRUD estándar
router.get('/', productosController.obtenerTodos);
router.get('/:id', productosController.obtenerPorId);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

module.exports = router;