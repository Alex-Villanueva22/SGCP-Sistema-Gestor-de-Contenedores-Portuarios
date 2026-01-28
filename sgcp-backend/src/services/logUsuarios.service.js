const db = require('../config/db');

class LogUsuariosService {
  
  // Obtener todos los logs
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        ORDER BY l.fecha_accion DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener log por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE l.id_log = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Registro de log no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Actualizar log (solo para correcciones administrativas)
  async actualizar(id, log) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { usuario_afectado, usuario_accion, accion } = log;

      // Validar campos requeridos
      if (!usuario_afectado || !usuario_accion || !accion) {
        const error = new Error('Usuario afectado, usuario acción y acción son requeridos');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE log_usuarios 
        SET 
          usuario_afectado = :usuario_afectado,
          usuario_accion = :usuario_accion,
          accion = :accion
        WHERE id_log = :id`,
        {
          id,
          usuario_afectado,
          usuario_accion,
          accion
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Registro de log no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener logs de un usuario específico (como afectado)
  async obtenerPorUsuarioAfectado(idUsuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE l.usuario_afectado = :idUsuario
        ORDER BY l.fecha_accion DESC`,
        { idUsuario }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener logs por usuario que realizó la acción
  async obtenerPorUsuarioAccion(idUsuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE l.usuario_accion = :idUsuario
        ORDER BY l.fecha_accion DESC`,
        { idUsuario }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener logs por tipo de acción
  async obtenerPorAccion(accion) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE LOWER(l.accion) = LOWER(:accion)
        ORDER BY l.fecha_accion DESC`,
        { accion }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener logs por rango de fechas
  async obtenerPorFechas(fechaInicio, fechaFin) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE l.fecha_accion BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') 
                                 AND TO_DATE(:fechaFin, 'YYYY-MM-DD') + 1
        ORDER BY l.fecha_accion DESC`,
        { fechaInicio, fechaFin }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener logs recientes (últimos N días)
  async obtenerRecientes(dias = 7) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_log,
          l.usuario_afectado,
          ua.nombre_usuario AS nombre_usuario_afectado,
          l.usuario_accion,
          uc.nombre_usuario AS nombre_usuario_accion,
          l.accion,
          l.fecha_accion
        FROM log_usuarios l
        LEFT JOIN usuarios ua ON l.usuario_afectado = ua.id_usuario
        LEFT JOIN usuarios uc ON l.usuario_accion = uc.id_usuario
        WHERE l.fecha_accion >= SYSDATE - :dias
        ORDER BY l.fecha_accion DESC`,
        { dias }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new LogUsuariosService();