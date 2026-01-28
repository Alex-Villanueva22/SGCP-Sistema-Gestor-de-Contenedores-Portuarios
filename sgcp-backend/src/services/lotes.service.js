const db = require('../config/db');

class LotesService {
  
  // Obtener todos los lotes
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_lote,
          l.id_contenedor,
          c.codigo_contenedor,
          l.id_producto,
          p.nombre AS producto_nombre,
          l.cantidad
        FROM lotes l
        LEFT JOIN contenedores c ON l.id_contenedor = c.id_contenedor
        LEFT JOIN productos p ON l.id_producto = p.id_producto
        ORDER BY l.id_lote DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener lote por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_lote,
          l.id_contenedor,
          c.codigo_contenedor,
          l.id_producto,
          p.nombre AS producto_nombre,
          p.tipo_producto,
          p.valor_estimado,
          l.cantidad
        FROM lotes l
        LEFT JOIN contenedores c ON l.id_contenedor = c.id_contenedor
        LEFT JOIN productos p ON l.id_producto = p.id_producto
        WHERE l.id_lote = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Lote no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo lote
  async crear(lote) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { id_contenedor, id_producto, cantidad } = lote;
      
      // Validar campos requeridos
      if (!id_contenedor || !id_producto) {
        const error = new Error('ID de contenedor e ID de producto son requeridos');
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

      // Verificar que el producto exista
      const productoExiste = await connection.execute(
        `SELECT id_producto FROM productos WHERE id_producto = :id`,
        { id: id_producto }
      );

      if (productoExiste.rows.length === 0) {
        const error = new Error('El producto especificado no existe');
        error.status = 404;
        throw error;
      }

      const result = await connection.execute(
        `INSERT INTO lotes 
          (id_contenedor, id_producto, cantidad)
        VALUES 
          (:id_contenedor, :id_producto, :cantidad)
        RETURNING id_lote INTO :id`,
        {
          id_contenedor,
          id_producto,
          cantidad: cantidad || 1,
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

  // Actualizar lote
  async actualizar(id, lote) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { id_contenedor, id_producto, cantidad } = lote;

      // Validar campos requeridos
      if (!id_contenedor || !id_producto) {
        const error = new Error('ID de contenedor e ID de producto son requeridos');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `UPDATE lotes 
        SET 
          id_contenedor = :id_contenedor,
          id_producto = :id_producto,
          cantidad = :cantidad
        WHERE id_lote = :id`,
        {
          id,
          id_contenedor,
          id_producto,
          cantidad
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Lote no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar lote
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM lotes WHERE id_lote = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Lote no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Lote eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener lotes de un contenedor específico
  async obtenerPorContenedor(idContenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_lote,
          l.id_contenedor,
          c.codigo_contenedor,
          l.id_producto,
          p.nombre AS producto_nombre,
          p.tipo_producto,
          l.cantidad
        FROM lotes l
        LEFT JOIN contenedores c ON l.id_contenedor = c.id_contenedor
        LEFT JOIN productos p ON l.id_producto = p.id_producto
        WHERE l.id_contenedor = :idContenedor
        ORDER BY l.id_lote DESC`,
        { idContenedor }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener lotes de un producto específico
  async obtenerPorProducto(idProducto) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          l.id_lote,
          l.id_contenedor,
          c.codigo_contenedor,
          l.id_producto,
          p.nombre AS producto_nombre,
          l.cantidad
        FROM lotes l
        LEFT JOIN contenedores c ON l.id_contenedor = c.id_contenedor
        LEFT JOIN productos p ON l.id_producto = p.id_producto
        WHERE l.id_producto = :idProducto
        ORDER BY l.id_lote DESC`,
        { idProducto }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new LotesService();