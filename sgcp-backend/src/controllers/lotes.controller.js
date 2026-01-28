const lotesService = require('../services/lotes.service');

class LotesController {
  
  // GET /api/lotes
  async obtenerTodos(req, res, next) {
    try {
      const lotes = await lotesService.obtenerTodos();
      res.json({
        ok: true,
        data: lotes
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/lotes/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const lote = await lotesService.obtenerPorId(id);
      res.json({
        ok: true,
        data: lote
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/lotes
  async crear(req, res, next) {
    try {
      const nuevoLote = await lotesService.crear(req.body);
      res.status(201).json({
        ok: true,
        data: nuevoLote,
        mensaje: 'Lote creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/lotes/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const loteActualizado = await lotesService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: loteActualizado,
        mensaje: 'Lote actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/lotes/:id
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await lotesService.eliminar(id);
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/lotes/contenedor/:idContenedor
  async obtenerPorContenedor(req, res, next) {
    try {
      const { idContenedor } = req.params;
      const lotes = await lotesService.obtenerPorContenedor(idContenedor);
      res.json({
        ok: true,
        data: lotes
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/lotes/producto/:idProducto
  async obtenerPorProducto(req, res, next) {
    try {
      const { idProducto } = req.params;
      const lotes = await lotesService.obtenerPorProducto(idProducto);
      res.json({
        ok: true,
        data: lotes
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LotesController();