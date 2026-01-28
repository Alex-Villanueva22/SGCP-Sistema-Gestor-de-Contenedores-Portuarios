const db = require('../config/db');

class AlertasService {
  
  // Obtener todas las alertas
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          c.tipo AS tipo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente,
          e.nombre AS embarcacion
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN embarcaciones e ON c.id_embarcacion = e.id_embarcacion
        ORDER BY a.fecha_alerta DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alerta por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          c.tipo AS tipo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente,
          e.nombre AS embarcacion
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN embarcaciones e ON c.id_embarcacion = e.id_embarcacion
        WHERE a.id_alerta = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Alerta no encontrada');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Actualizar alerta (para marcar como resuelta o cambiar estado)
  async actualizar(id, alerta) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { estado } = alerta;

      // Validar campo requerido
      if (!estado) {
        const error = new Error('El estado es requerido');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE alertas_contenedores 
        SET estado = :estado
        WHERE id_alerta = :id`,
        { id, estado },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Alerta no encontrada');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alertas de un contenedor específico
  async obtenerPorContenedor(idContenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          a.estado,
          a.fecha_alerta
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        WHERE a.id_contenedor = :idContenedor
        ORDER BY a.fecha_alerta DESC`,
        { idContenedor }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alertas por estado
  async obtenerPorEstado(estado) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          c.tipo AS tipo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE LOWER(a.estado) = LOWER(:estado)
        ORDER BY a.fecha_alerta DESC`,
        { estado }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alertas recientes (últimos N días)
  async obtenerRecientes(dias = 7) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          c.tipo AS tipo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE a.fecha_alerta >= SYSDATE - :dias
        ORDER BY a.fecha_alerta DESC`,
        { dias }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alertas activas (estados críticos)
  async obtenerActivas() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          c.tipo AS tipo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente,
          e.nombre AS embarcacion
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN embarcaciones e ON c.id_embarcacion = e.id_embarcacion
        WHERE LOWER(a.estado) IN ('dañado', 'con fallas', 'fuera de servicio')
        ORDER BY a.fecha_alerta DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener alertas por rango de fechas
  async obtenerPorFechas(fechaInicio, fechaFin) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          a.id_alerta,
          a.id_contenedor,
          c.codigo_contenedor,
          a.estado,
          a.fecha_alerta,
          cl.nombre_empresa AS cliente
        FROM alertas_contenedores a
        LEFT JOIN contenedores c ON a.id_contenedor = c.id_contenedor
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE a.fecha_alerta BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') 
                                 AND TO_DATE(:fechaFin, 'YYYY-MM-DD') + 1
        ORDER BY a.fecha_alerta DESC`,
        { fechaInicio, fechaFin }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new AlertasService();