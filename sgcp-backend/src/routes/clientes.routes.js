const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');

// Rutas especiales primero (antes de /:id)
router.get('/buscar/:nombre', clientesController.buscarPorNombre);

// Rutas CRUD estándar
router.get('/', clientesController.obtenerTodos);
router.get('/:id', clientesController.obtenerPorId);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.delete('/:id', clientesController.eliminar);

// Ruta para obtener contenedores de un cliente
router.get('/:id/contenedores', clientesController.obtenerContenedores);

module.exports = router;