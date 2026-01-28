const historialService = require('../services/historial.service');

class HistorialController {
  
  // GET /api/historial
  async obtenerTodos(req, res, next) {
    try {
      const historial = await historialService.obtenerTodos();
      res.json({
        ok: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/historial/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const registro = await historialService.obtenerPorId(id);
      res.json({
        ok: true,
        data: registro
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/historial/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const registroActualizado = await historialService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: registroActualizado,
        mensaje: 'Historial actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/historial/contenedor/:idContenedor
  async obtenerPorContenedor(req, res, next) {
    try {
      const { idContenedor } = req.params;
      const historial = await historialService.obtenerPorContenedor(idContenedor);
      res.json({
        ok: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/historial/fechas?inicio=2024-01-01&fin=2024-12-31
  async obtenerPorFechas(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      
      if (!inicio || !fin) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Se requieren fechas de inicio y fin'
        });
      }

      const historial = await historialService.obtenerPorFechas(inicio, fin);
      res.json({
        ok: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/historial/usuario/:idUsuario
  async obtenerPorUsuario(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const historial = await historialService.obtenerPorUsuario(idUsuario);
      res.json({
        ok: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HistorialController();