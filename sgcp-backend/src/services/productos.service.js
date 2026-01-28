const db = require('../config/db');

class ProductosService {
  
  // Obtener todos los productos
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_producto,
          nombre,
          descripcion,
          tipo_producto,
          valor_estimado
        FROM productos
        ORDER BY id_producto DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener producto por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_producto,
          nombre,
          descripcion,
          tipo_producto,
          valor_estimado
        FROM productos
        WHERE id_producto = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo producto
  async crear(producto) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre, descripcion, tipo_producto, valor_estimado } = producto;
      
      // Validar campo requerido
      if (!nombre) {
        const error = new Error('El nombre del producto es requerido');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `INSERT INTO productos 
          (nombre, descripcion, tipo_producto, valor_estimado)
        VALUES 
          (:nombre, :descripcion, :tipo_producto, :valor_estimado)
        RETURNING id_producto INTO :id`,
        {
          nombre,
          descripcion: descripcion || null,
          tipo_producto: tipo_producto || null,
          valor_estimado: valor_estimado || null,
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

  // Actualizar producto
  async actualizar(id, producto) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre, descripcion, tipo_producto, valor_estimado } = producto;

      // Validar campo requerido
      if (!nombre) {
        const error = new Error('El nombre del producto es requerido');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE productos 
        SET 
          nombre = :nombre,
          descripcion = :descripcion,
          tipo_producto = :tipo_producto,
          valor_estimado = :valor_estimado
        WHERE id_producto = :id`,
        {
          id,
          nombre,
          descripcion,
          tipo_producto,
          valor_estimado
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar producto
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM productos WHERE id_producto = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Producto no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Producto eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Buscar productos por nombre
  async buscarPorNombre(nombre) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_producto,
          nombre,
          descripcion,
          tipo_producto,
          valor_estimado
        FROM productos
        WHERE UPPER(nombre) LIKE '%' || UPPER(:nombre) || '%'
        ORDER BY nombre`,
        { nombre }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener productos por tipo
  async obtenerPorTipo(tipo) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_producto,
          nombre,
          descripcion,
          tipo_producto,
          valor_estimado
        FROM productos
        WHERE LOWER(tipo_producto) = LOWER(:tipo)
        ORDER BY nombre`,
        { tipo }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new ProductosService();