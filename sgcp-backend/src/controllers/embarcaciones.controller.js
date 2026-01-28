const embarcacionesService = require('../services/embarcaciones.service');
const db = require('../config/db');

class EmbarcacionesController {
  
  // GET /api/embarcaciones
  async obtenerTodos(req, res, next) {
    try {
      const embarcaciones = await embarcacionesService.obtenerTodos();
      res.json({
        ok: true,
        data: embarcaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/embarcaciones/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const embarcacion = await embarcacionesService.obtenerPorId(id);
      res.json({
        ok: true,
        data: embarcacion
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/embarcaciones
  async crear(req, res, next) {
    let connection;
    try {
      const { nombre, bandera, fecha_arribo, fecha_salida } = req.body;
      
      // Validar campo requerido
      if (!nombre) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre de la embarcación es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Convertir fechas si son strings
      let fechaArriboDate = fecha_arribo ? new Date(fecha_arribo) : null;
      let fechaSalidaDate = fecha_salida ? new Date(fecha_salida) : null;
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_insert_embarcacion(:p_nombre, :p_bandera, :p_fecha_arribo, :p_fecha_salida); END;`,
        {
          p_nombre: nombre,
          p_bandera: bandera || null,
          p_fecha_arribo: fechaArriboDate,
          p_fecha_salida: fechaSalidaDate
        },
        { autoCommit: true }
      );

      // Obtener la embarcación recién creada (usando el servicio para obtener)
      const embarcacionesCreadas = await embarcacionesService.buscarPorNombre(nombre);
      const nuevaEmbarcacion = embarcacionesCreadas.find(e => 
        e.NOMBRE === nombre && 
        e.BANDERA === (bandera || null)
      ) || embarcacionesCreadas[0];

      res.status(201).json({
        ok: true,
        data: nuevaEmbarcacion,
        mensaje: 'Embarcación creada exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // PUT /api/embarcaciones/:id
  async actualizar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;
      const { nombre, bandera, fecha_arribo, fecha_salida } = req.body;
      
      // Validar campo requerido
      if (!nombre) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre de la embarcación es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Convertir fechas si son strings
      let fechaArriboDate = fecha_arribo ? new Date(fecha_arribo) : null;
      let fechaSalidaDate = fecha_salida ? new Date(fecha_salida) : null;
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_update_embarcacion(:p_id_embarcacion, :p_nombre, :p_bandera, :p_fecha_arribo, :p_fecha_salida); END;`,
        {
          p_id_embarcacion: parseInt(id),
          p_nombre: nombre,
          p_bandera: bandera || null,
          p_fecha_arribo: fechaArriboDate,
          p_fecha_salida: fechaSalidaDate
        },
        { autoCommit: true }
      );

      // Obtener la embarcación actualizada (usando el servicio para obtener)
      const embarcacionActualizada = await embarcacionesService.obtenerPorId(id);

      res.json({
        ok: true,
        data: embarcacionActualizada,
        mensaje: 'Embarcación actualizada exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // DELETE /api/embarcaciones/:id
  async eliminar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;

      connection = await db.getConnection();
      
      // Verificar que la embarcación exista antes de eliminar
      await embarcacionesService.obtenerPorId(id);
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_delete_embarcacion(:p_id_embarcacion); END;`,
        {
          p_id_embarcacion: parseInt(id)
        },
        { autoCommit: true }
      );

      res.json({
        ok: true,
        mensaje: 'Embarcación eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // GET /api/embarcaciones/buscar/:nombre
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.params;
      const embarcaciones = await embarcacionesService.buscarPorNombre(nombre);
      res.json({
        ok: true,
        data: embarcaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/embarcaciones/en-puerto
  async obtenerEnPuerto(req, res, next) {
    try {
      const embarcaciones = await embarcacionesService.obtenerEnPuerto();
      res.json({
        ok: true,
        data: embarcaciones
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/embarcaciones/:id/contenedores
  async obtenerContenedores(req, res, next) {
    try {
      const { id } = req.params;
      const contenedores = await embarcacionesService.obtenerContenedores(id);
      res.json({
        ok: true,
        data: contenedores
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmbarcacionesController();