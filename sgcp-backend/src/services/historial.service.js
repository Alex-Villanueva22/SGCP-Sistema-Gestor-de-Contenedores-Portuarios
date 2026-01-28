const db = require('../config/db');

class HistorialService {
  
  // Obtener todo el historial
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          h.id_historial,
          h.id_contenedor,
          c.codigo_contenedor,
          h.estado_anterior,
          h.estado_nuevo,
          h.fecha_cambio,
          h.usuario_modificador,
          u.nombre_usuario
        FROM historial_estado h
        LEFT JOIN contenedores c ON h.id_contenedor = c.id_contenedor
        LEFT JOIN usuarios u ON h.usuario_modificador = u.id_usuario
        ORDER BY h.fecha_cambio DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener historial por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          h.id_historial,
          h.id_contenedor,
          c.codigo_contenedor,
          h.estado_anterior,
          h.estado_nuevo,
          h.fecha_cambio,
          h.usuario_modificador,
          u.nombre_usuario
        FROM historial_estado h
        LEFT JOIN contenedores c ON h.id_contenedor = c.id_contenedor
        LEFT JOIN usuarios u ON h.usuario_modificador = u.id_usuario
        WHERE h.id_historial = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Registro de historial no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Actualizar historial (solo para correcciones administrativas)
  async actualizar(id, historial) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { estado_anterior, estado_nuevo, usuario_modificador } = historial;

      // Validar campos requeridos
      if (!estado_anterior || !estado_nuevo || !usuario_modificador) {
        const error = new Error('Estado anterior, estado nuevo y usuario modificador son requeridos');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE historial_estado 
        SET 
          estado_anterior = :estado_anterior,
          estado_nuevo = :estado_nuevo,
          usuario_modificador = :usuario_modificador
        WHERE id_historial = :id`,
        {
          id,
          estado_anterior,
          estado_nuevo,
          usuario_modificador
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Registro de historial no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener historial de un contenedor específico
  async obtenerPorContenedor(idContenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          h.id_historial,
          h.id_contenedor,
          c.codigo_contenedor,
          h.estado_anterior,
          h.estado_nuevo,
          h.fecha_cambio,
          h.usuario_modificador,
          u.nombre_usuario
        FROM historial_estado h
        LEFT JOIN contenedores c ON h.id_contenedor = c.id_contenedor
        LEFT JOIN usuarios u ON h.usuario_modificador = u.id_usuario
        WHERE h.id_contenedor = :idContenedor
        ORDER BY h.fecha_cambio DESC`,
        { idContenedor }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener historial por rango de fechas
  async obtenerPorFechas(fechaInicio, fechaFin) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          h.id_historial,
          h.id_contenedor,
          c.codigo_contenedor,
          h.estado_anterior,
          h.estado_nuevo,
          h.fecha_cambio,
          h.usuario_modificador,
          u.nombre_usuario
        FROM historial_estado h
        LEFT JOIN contenedores c ON h.id_contenedor = c.id_contenedor
        LEFT JOIN usuarios u ON h.usuario_modificador = u.id_usuario
        WHERE h.fecha_cambio BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') 
                                 AND TO_DATE(:fechaFin, 'YYYY-MM-DD') + 1
        ORDER BY h.fecha_cambio DESC`,
        { fechaInicio, fechaFin }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener cambios por usuario
  async obtenerPorUsuario(idUsuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          h.id_historial,
          h.id_contenedor,
          c.codigo_contenedor,
          h.estado_anterior,
          h.estado_nuevo,
          h.fecha_cambio,
          h.usuario_modificador,
          u.nombre_usuario
        FROM historial_estado h
        LEFT JOIN contenedores c ON h.id_contenedor = c.id_contenedor
        LEFT JOIN usuarios u ON h.usuario_modificador = u.id_usuario
        WHERE h.usuario_modificador = :idUsuario
        ORDER BY h.fecha_cambio DESC`,
        { idUsuario }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new HistorialService();