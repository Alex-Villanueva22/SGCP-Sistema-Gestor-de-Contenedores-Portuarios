const express = require('express');
const router = express.Router();
const logUsuariosController = require('../controllers/logUsuarios.controller');

// Rutas especiales primero (antes de /:id)
router.get('/usuario-afectado/:idUsuario', logUsuariosController.obtenerPorUsuarioAfectado);
router.get('/usuario-accion/:idUsuario', logUsuariosController.obtenerPorUsuarioAccion);
router.get('/accion/:accion', logUsuariosController.obtenerPorAccion);
router.get('/fechas', logUsuariosController.obtenerPorFechas);
router.get('/recientes', logUsuariosController.obtenerRecientes);

// Rutas READ y UPDATE
router.get('/', logUsuariosController.obtenerTodos);
router.get('/:id', logUsuariosController.obtenerPorId);
router.put('/:id', logUsuariosController.actualizar);

module.exports = router;