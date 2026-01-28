const contenedoresService = require('../services/contenedores.service');

class ContenedoresController {
  
  // GET /api/contenedores
  async obtenerTodos(req, res, next) {
    try {
      const contenedores = await contenedoresService.obtenerTodos();
      res.json({
        ok: true,
        data: contenedores
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/contenedores/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const contenedor = await contenedoresService.obtenerPorId(id);
      res.json({
        ok: true,
        data: contenedor
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/contenedores
  async crear(req, res, next) {
    try {
      const nuevoContenedor = await contenedoresService.crear(req.body);
      res.status(201).json({
        ok: true,
        data: nuevoContenedor,
        mensaje: 'Contenedor creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/contenedores/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const contenedorActualizado = await contenedoresService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: contenedorActualizado,
        mensaje: 'Contenedor actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/contenedores/:id
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await contenedoresService.eliminar(id);
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/contenedores/buscar/:codigo
  async buscarPorCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      const contenedores = await contenedoresService.buscarPorCodigo(codigo);
      res.json({
        ok: true,
        data: contenedores
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/contenedores/estado/:estado
  async obtenerPorEstado(req, res, next) {
    try {
      const { estado } = req.params;
      const contenedores = await contenedoresService.obtenerPorEstado(estado);
      res.json({
        ok: true,
        data: contenedores
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContenedoresController();