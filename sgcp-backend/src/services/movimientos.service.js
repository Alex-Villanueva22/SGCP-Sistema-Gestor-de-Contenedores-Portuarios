const db = require('../config/db');

class MovimientosService {
  
  // Obtener todos los movimientos
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          m.id_movimiento,
          m.id_contenedor,
          c.codigo_contenedor,
          m.tipo_movimiento,
          m.fecha_movimiento,
          m.observaciones
        FROM movimientos m
        LEFT JOIN contenedores c ON m.id_contenedor = c.id_contenedor
        ORDER BY m.fecha_movimiento DESC`
      );
      console.log('Movimientos obtenidos:', result.rows);
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener movimiento por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          m.id_movimiento,
          m.id_contenedor,
          c.codigo_contenedor,
          m.tipo_movimiento,
          m.fecha_movimiento,
          m.observaciones
        FROM movimientos m
        LEFT JOIN contenedores c ON m.id_contenedor = c.id_contenedor
        WHERE m.id_movimiento = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Movimiento no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo movimiento
  async crear(movimiento) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { id_contenedor, tipo_movimiento, fecha_movimiento, observaciones } = movimiento;
      
      // Validar campos requeridos
      if (!id_contenedor || !tipo_movimiento) {
        const error = new Error('ID de contenedor y tipo de movimiento son requeridos');
        error.status = 400;
        throw error;
      }

      // Verificar que el contenedor exista
      const contenedorExiste = await connection.execute(
        `SELECT id_contenedor FROM contenedores WHERE id_contenedor = :id`,
        { id: id_contenedor }
      );

      if (contenedorExiste.rows.length === 0) {
        const error = new Error('El contenedor especificado no existe');
        error.status = 404;
        throw error;
      }

      const result = await connection.execute(
        `INSERT INTO movimientos 
          (id_contenedor, tipo_movimiento, fecha_movimiento, observaciones)
        VALUES 
          (:id_contenedor, :tipo_movimiento, 
           NVL(TO_DATE(:fecha_movimiento, 'YYYY-MM-DD HH24:MI:SS'), SYSDATE), 
           :observaciones)
        RETURNING id_movimiento INTO :id`,
        {
          id_contenedor,
          tipo_movimiento,
          fecha_movimiento: fecha_movimiento || null,
          observaciones: observaciones || null,
          id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      const nuevoId = result.outBinds.id[0];
      return await this.obtenerPorId(nuevoId);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Actualizar movimiento
  async actualizar(id, movimiento) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { id_contenedor, tipo_movimiento, fecha_movimiento, observaciones } = movimiento;

      // Validar campos requeridos
      if (!id_contenedor || !tipo_movimiento) {
        const error = new Error('ID de contenedor y tipo de movimiento son requeridos');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE movimientos 
        SET 
          id_contenedor = :id_contenedor,
          tipo_movimiento = :tipo_movimiento,
          fecha_movimiento = TO_DATE(:fecha_movimiento, 'YYYY-MM-DD HH24:MI:SS'),
          observaciones = :observaciones
        WHERE id_movimiento = :id`,
        {
          id,
          id_contenedor,
          tipo_movimiento,
          fecha_movimiento,
          observaciones
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Movimiento no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar movimiento
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM movimientos WHERE id_movimiento = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Movimiento no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Movimiento eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener movimientos de un contenedor específico
  async obtenerPorContenedor(idContenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          m.id_movimiento,
          m.id_contenedor,
          c.codigo_contenedor,
          m.tipo_movimiento,
          m.fecha_movimiento,
          m.observaciones
        FROM movimientos m
        LEFT JOIN contenedores c ON m.id_contenedor = c.id_contenedor
        WHERE m.id_contenedor = :idContenedor
        ORDER BY m.fecha_movimiento DESC`,
        { idContenedor }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener movimientos por tipo
  async obtenerPorTipo(tipo) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          m.id_movimiento,
          m.id_contenedor,
          c.codigo_contenedor,
          m.tipo_movimiento,
          m.fecha_movimiento,
          m.observaciones
        FROM movimientos m
        LEFT JOIN contenedores c ON m.id_contenedor = c.id_contenedor
        WHERE LOWER(m.tipo_movimiento) = LOWER(:tipo)
        ORDER BY m.fecha_movimiento DESC`,
        { tipo }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener movimientos recientes (últimos N días)
  async obtenerRecientes(dias = 7) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          m.id_movimiento,
          m.id_contenedor,
          c.codigo_contenedor,
          m.tipo_movimiento,
          m.fecha_movimiento,
          m.observaciones
        FROM movimientos m
        LEFT JOIN contenedores c ON m.id_contenedor = c.id_contenedor
        WHERE m.fecha_movimiento >= SYSDATE - :dias
        ORDER BY m.fecha_movimiento DESC`,
        { dias }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new MovimientosService();