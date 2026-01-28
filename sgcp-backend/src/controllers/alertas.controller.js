const alertasService = require('../services/alertas.service');

class AlertasController {
  
  // GET /api/alertas
  async obtenerTodos(req, res, next) {
    try {
      const alertas = await alertasService.obtenerTodos();
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const alerta = await alertasService.obtenerPorId(id);
      res.json({
        ok: true,
        data: alerta
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/alertas/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const alertaActualizada = await alertasService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: alertaActualizada,
        mensaje: 'Alerta actualizada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/contenedor/:idContenedor
  async obtenerPorContenedor(req, res, next) {
    try {
      const { idContenedor } = req.params;
      const alertas = await alertasService.obtenerPorContenedor(idContenedor);
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/estado/:estado
  async obtenerPorEstado(req, res, next) {
    try {
      const { estado } = req.params;
      const alertas = await alertasService.obtenerPorEstado(estado);
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/recientes?dias=7
  async obtenerRecientes(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const alertas = await alertasService.obtenerRecientes(dias);
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/activas
  async obtenerActivas(req, res, next) {
    try {
      const alertas = await alertasService.obtenerActivas();
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/alertas/fechas?inicio=2024-01-01&fin=2024-12-31
  async obtenerPorFechas(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      
      if (!inicio || !fin) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Se requieren fechas de inicio y fin'
        });
      }

      const alertas = await alertasService.obtenerPorFechas(inicio, fin);
      res.json({
        ok: true,
        data: alertas
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertasController();