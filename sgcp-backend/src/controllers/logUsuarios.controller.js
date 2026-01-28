const logUsuariosService = require('../services/logUsuarios.service');

class LogUsuariosController {
  
  // GET /api/log-usuarios
  async obtenerTodos(req, res, next) {
    try {
      const logs = await logUsuariosService.obtenerTodos();
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const log = await logUsuariosService.obtenerPorId(id);
      res.json({
        ok: true,
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/log-usuarios/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const logActualizado = await logUsuariosService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: logActualizado,
        mensaje: 'Log actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/usuario-afectado/:idUsuario
  async obtenerPorUsuarioAfectado(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const logs = await logUsuariosService.obtenerPorUsuarioAfectado(idUsuario);
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/usuario-accion/:idUsuario
  async obtenerPorUsuarioAccion(req, res, next) {
    try {
      const { idUsuario } = req.params;
      const logs = await logUsuariosService.obtenerPorUsuarioAccion(idUsuario);
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/accion/:accion
  async obtenerPorAccion(req, res, next) {
    try {
      const { accion } = req.params;
      const logs = await logUsuariosService.obtenerPorAccion(accion);
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/fechas?inicio=2024-01-01&fin=2024-12-31
  async obtenerPorFechas(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      
      if (!inicio || !fin) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Se requieren fechas de inicio y fin'
        });
      }

      const logs = await logUsuariosService.obtenerPorFechas(inicio, fin);
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/log-usuarios/recientes?dias=7
  async obtenerRecientes(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const logs = await logUsuariosService.obtenerRecientes(dias);
      res.json({
        ok: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogUsuariosController();