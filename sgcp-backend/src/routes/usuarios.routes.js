const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Rutas especiales primero (antes de /:id)
router.post('/login', usuariosController.login);
router.get('/buscar/:nombre', usuariosController.buscarPorNombre);
router.get('/rol/:rol', usuariosController.obtenerPorRol);

// Rutas CRUD estándar
router.get('/', usuariosController.obtenerTodos);
router.get('/:id', usuariosController.obtenerPorId);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar);

// Ruta para cambiar contraseña
router.put('/:id/cambiar-contraseña', usuariosController.cambiarContraseña);

module.exports = router;