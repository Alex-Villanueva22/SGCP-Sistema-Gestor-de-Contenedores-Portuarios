const movimientosService = require('../services/movimientos.service');

class MovimientosController {
  
  // GET /api/movimientos
  async obtenerTodos(req, res, next) {
    try {
      const movimientos = await movimientosService.obtenerTodos();
      res.json({
        ok: true,
        data: movimientos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/movimientos/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const movimiento = await movimientosService.obtenerPorId(id);
      res.json({
        ok: true,
        data: movimiento
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/movimientos
  async crear(req, res, next) {
    try {
      const nuevoMovimiento = await movimientosService.crear(req.body);
      res.status(201).json({
        ok: true,
        data: nuevoMovimiento,
        mensaje: 'Movimiento registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/movimientos/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const movimientoActualizado = await movimientosService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: movimientoActualizado,
        mensaje: 'Movimiento actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/movimientos/:id
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await movimientosService.eliminar(id);
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/movimientos/contenedor/:idContenedor
  async obtenerPorContenedor(req, res, next) {
    try {
      const { idContenedor } = req.params;
      const movimientos = await movimientosService.obtenerPorContenedor(idContenedor);
      res.json({
        ok: true,
        data: movimientos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/movimientos/tipo/:tipo
  async obtenerPorTipo(req, res, next) {
    try {
      const { tipo } = req.params;
      const movimientos = await movimientosService.obtenerPorTipo(tipo);
      res.json({
        ok: true,
        data: movimientos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/movimientos/recientes?dias=7
  async obtenerRecientes(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const movimientos = await movimientosService.obtenerRecientes(dias);
      res.json({
        ok: true,
        data: movimientos
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MovimientosController();