const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

// ============================================================
// RUTAS DE REPORTES CON NOMBRES DESCRIPTIVOS
// ============================================================

// Reportes sin parámetros
router.get('/contenedores-activos', reportesController.contenedoresActivos);
router.get('/ranking-clientes', reportesController.rankingClientes);
router.get('/productos-mensuales', reportesController.productosMensuales);
router.get('/embarcaciones-contenedores', reportesController.embarcacionesContenedores);
router.get('/estado-puerto', reportesController.estadoPuerto);
router.get('/contenedores-abandonados', reportesController.contenedoresAbandonados);
router.get('/alertas-detalle', reportesController.alertasDetalle);
router.get('/auditoria-usuarios', reportesController.auditoriaUsuarios);

// Reportes con parámetros
router.get('/contenedores-proxima-salida', reportesController.contenedoresProximaSalida); // ?dias=10
router.get('/historial-contenedor/:codigo', reportesController.historialContenedor); // /:codigo

module.exports = router;