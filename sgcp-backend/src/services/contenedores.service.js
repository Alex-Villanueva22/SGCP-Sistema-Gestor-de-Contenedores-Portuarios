const db = require('../config/db');

class ContenedoresService {
  
  // Obtener todos los contenedores
  async obtenerTodos() {
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
          c.id_cliente,
          cl.nombre_empresa AS cliente_nombre,
          c.id_embarcacion,
          e.nombre AS embarcacion_nombre
        FROM contenedores c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN embarcaciones e ON c.id_embarcacion = e.id_embarcacion
        ORDER BY c.id_contenedor DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener contenedor por ID
  async obtenerPorId(id) {
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
          c.id_cliente,
          cl.nombre_empresa AS cliente_nombre,
          c.id_embarcacion,
          e.nombre AS embarcacion_nombre
        FROM contenedores c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN embarcaciones e ON c.id_embarcacion = e.id_embarcacion
        WHERE c.id_contenedor = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Contenedor no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo contenedor
  async crear(contenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { codigo_contenedor, tipo, estado, peso, id_cliente, id_embarcacion } = contenedor;
      
      // Validar campos requeridos
      if (!codigo_contenedor || !id_cliente) {
        const error = new Error('Código de contenedor e ID de cliente son requeridos');
        error.status = 400;
        throw error;
      }

      const result = await connection.execute(
        `INSERT INTO contenedores 
          (codigo_contenedor, tipo, estado, peso, id_cliente, id_embarcacion)
        VALUES 
          (:codigo_contenedor, :tipo, :estado, :peso, :id_cliente, :id_embarcacion)
        RETURNING id_contenedor INTO :id`,
        {
          codigo_contenedor,
          tipo: tipo || null,
          estado: estado || 'disponible',
          peso: peso || null,
          id_cliente,
          id_embarcacion: id_embarcacion || null,
          id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      const nuevoId = result.outBinds.id[0];
      
      // Obtener el contenedor recién creado
      return await this.obtenerPorId(nuevoId);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Actualizar contenedor
  async actualizar(id, contenedor) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { codigo_contenedor, tipo, estado, peso, id_cliente, id_embarcacion } = contenedor;

      const result = await connection.execute(
        `UPDATE contenedores 
        SET 
          codigo_contenedor = :codigo_contenedor,
          tipo = :tipo,
          estado = :estado,
          peso = :peso,
          id_cliente = :id_cliente,
          id_embarcacion = :id_embarcacion
        WHERE id_contenedor = :id`,
        {
          id,
          codigo_contenedor,
          tipo,
          estado,
          peso,
          id_cliente,
          id_embarcacion
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Contenedor no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar contenedor
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const result = await connection.execute(
        `DELETE FROM contenedores WHERE id_contenedor = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Contenedor no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Contenedor eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Buscar contenedores por código (búsqueda parcial)
  async buscarPorCodigo(codigo) {
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
          c.id_cliente,
          cl.nombre_empresa AS cliente_nombre
        FROM contenedores c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE UPPER(c.codigo_contenedor) LIKE '%' || UPPER(:codigo) || '%'
        ORDER BY c.codigo_contenedor`,
        { codigo }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener contenedores por estado
  async obtenerPorEstado(estado) {
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
          c.id_cliente,
          cl.nombre_empresa AS cliente_nombre
        FROM contenedores c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE LOWER(c.estado) = LOWER(:estado)
        ORDER BY c.id_contenedor DESC`,
        { estado }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new ContenedoresService();
