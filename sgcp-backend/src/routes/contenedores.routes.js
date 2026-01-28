const express = require('express');
const router = express.Router();
const contenedoresController = require('../controllers/contenedores.controller');

// Rutas especiales primero (antes de /:id)
router.get('/buscar/:codigo', contenedoresController.buscarPorCodigo);
router.get('/estado/:estado', contenedoresController.obtenerPorEstado);

// Rutas CRUD estándar
router.get('/', contenedoresController.obtenerTodos);
router.get('/:id', contenedoresController.obtenerPorId);
router.post('/', contenedoresController.crear);
router.put('/:id', contenedoresController.actualizar);
router.delete('/:id', contenedoresController.eliminar);

module.exports = router;