const db = require('../config/db');

class EmbarcacionesService {
  
  // Obtener todas las embarcaciones
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_embarcacion,
          nombre,
          bandera,
          fecha_arribo,
          fecha_salida
        FROM embarcaciones
        ORDER BY fecha_arribo DESC NULLS LAST`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener embarcación por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_embarcacion,
          nombre,
          bandera,
          fecha_arribo,
          fecha_salida
        FROM embarcaciones
        WHERE id_embarcacion = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Embarcación no encontrada');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nueva embarcación
  async crear(embarcacion) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre, bandera, fecha_arribo, fecha_salida } = embarcacion;
      
      // Validar campo requerido
      if (!nombre) {
        const error = new Error('El nombre de la embarcación es requerido');
        error.status = 400;
        throw error;
      }

      // Validar que fecha_salida no sea anterior a fecha_arribo
      if (fecha_arribo && fecha_salida) {
        const arribo = new Date(fecha_arribo);
        const salida = new Date(fecha_salida);
        if (salida < arribo) {
          const error = new Error('La fecha de salida no puede ser anterior a la fecha de arribo');
          error.status = 400;
          throw error;
        }
      }

      const result = await connection.execute(
        `INSERT INTO embarcaciones 
          (nombre, bandera, fecha_arribo, fecha_salida)
        VALUES 
          (:nombre, :bandera, TO_DATE(:fecha_arribo, 'YYYY-MM-DD'), TO_DATE(:fecha_salida, 'YYYY-MM-DD'))
        RETURNING id_embarcacion INTO :id`,
        {
          nombre,
          bandera: bandera || null,
          fecha_arribo: fecha_arribo || null,
          fecha_salida: fecha_salida || null,
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

  // Actualizar embarcación
  async actualizar(id, embarcacion) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre, bandera, fecha_arribo, fecha_salida } = embarcacion;

      // Validar campo requerido
      if (!nombre) {
        const error = new Error('El nombre de la embarcación es requerido');
        error.status = 400;
        throw error;
      }

      // Validar fechas
      if (fecha_arribo && fecha_salida) {
        const arribo = new Date(fecha_arribo);
        const salida = new Date(fecha_salida);
        if (salida < arribo) {
          const error = new Error('La fecha de salida no puede ser anterior a la fecha de arribo');
          error.status = 400;
          throw error;
        }
      }

      const result = await connection.execute(
        `UPDATE embarcaciones 
        SET 
          nombre = :nombre,
          bandera = :bandera,
          fecha_arribo = TO_DATE(:fecha_arribo, 'YYYY-MM-DD'),
          fecha_salida = TO_DATE(:fecha_salida, 'YYYY-MM-DD')
        WHERE id_embarcacion = :id`,
        {
          id,
          nombre,
          bandera,
          fecha_arribo,
          fecha_salida
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Embarcación no encontrada');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar embarcación
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM embarcaciones WHERE id_embarcacion = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Embarcación no encontrada');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Embarcación eliminada exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Buscar embarcaciones por nombre
  async buscarPorNombre(nombre) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_embarcacion,
          nombre,
          bandera,
          fecha_arribo,
          fecha_salida
        FROM embarcaciones
        WHERE UPPER(nombre) LIKE '%' || UPPER(:nombre) || '%'
        ORDER BY nombre`,
        { nombre }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener embarcaciones en puerto (sin fecha de salida)
  async obtenerEnPuerto() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_embarcacion,
          nombre,
          bandera,
          fecha_arribo,
          fecha_salida
        FROM embarcaciones
        WHERE fecha_salida IS NULL
        ORDER BY fecha_arribo DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener contenedores de una embarcación
  async obtenerContenedores(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          c.id_contenedor,
          c.codigo_contenedor,
          c.tipo,
          c.estado,
          c.peso,
          cl.nombre_empresa AS cliente_nombre
        FROM contenedores c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE c.id_embarcacion = :id
        ORDER BY c.id_contenedor DESC`,
        { id }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new EmbarcacionesService();