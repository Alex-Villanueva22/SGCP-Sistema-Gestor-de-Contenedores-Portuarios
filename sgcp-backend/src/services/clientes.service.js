const db = require('../config/db');

class ClientesService {
  
  // Obtener todos los clientes
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_cliente,
          nombre_empresa,
          representante,
          contacto
        FROM clientes
        ORDER BY nombre_empresa`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener cliente por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_cliente,
          nombre_empresa,
          representante,
          contacto
        FROM clientes
        WHERE id_cliente = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Cliente no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo cliente
  async crear(cliente) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre_empresa, representante, contacto } = cliente;
      
      // Validar campo requerido
      if (!nombre_empresa) {
        const error = new Error('El nombre de la empresa es requerido');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `INSERT INTO clientes 
          (nombre_empresa, representante, contacto)
        VALUES 
          (:nombre_empresa, :representante, :contacto)
        RETURNING id_cliente INTO :id`,
        {
          nombre_empresa,
          representante: representante || null,
          contacto: contacto || null,
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

  // Actualizar cliente
  async actualizar(id, cliente) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre_empresa, representante, contacto } = cliente;

      // Validar campo requerido
      if (!nombre_empresa) {
        const error = new Error('El nombre de la empresa es requerido');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE clientes 
        SET 
          nombre_empresa = :nombre_empresa,
          representante = :representante,
          contacto = :contacto
        WHERE id_cliente = :id`,
        {
          id,
          nombre_empresa,
          representante,
          contacto
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Cliente no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar cliente
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM clientes WHERE id_cliente = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Cliente no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Cliente eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Buscar clientes por nombre de empresa
  async buscarPorNombre(nombre) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_cliente,
          nombre_empresa,
          representante,
          contacto
        FROM clientes
        WHERE UPPER(nombre_empresa) LIKE '%' || UPPER(:nombre) || '%'
        ORDER BY nombre_empresa`,
        { nombre }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener contenedores de un cliente
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
          c.peso
        FROM contenedores c
        WHERE c.id_cliente = :id
        ORDER BY c.id_contenedor DESC`,
        { id }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new ClientesService();