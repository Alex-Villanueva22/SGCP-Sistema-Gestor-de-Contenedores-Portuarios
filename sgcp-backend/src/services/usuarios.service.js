const db = require('../config/db');

class UsuariosService {
  
  // Obtener todos los usuarios
  async obtenerTodos() {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_usuario,
          nombre_usuario,
          rol,
          estado,
          fecha_baja
        FROM usuarios
        ORDER BY id_usuario DESC`
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener usuario por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_usuario,
          nombre_usuario,
          rol,
          estado,
          fecha_baja
        FROM usuarios
        WHERE id_usuario = :id`,
        { id }
      );
      
      if (result.rows.length === 0) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener usuario por nombre de usuario (para login)
  async obtenerPorNombreUsuario(nombreUsuario) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_usuario,
          nombre_usuario,
          rol,
          contraseña
        FROM usuarios
        WHERE nombre_usuario = :nombreUsuario`,
        { nombreUsuario }
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  // Crear nuevo usuario
  async crear(usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre_usuario, rol, contraseña } = usuario;
      
      // Validar campos requeridos
      if (!nombre_usuario || !contraseña) {
        const error = new Error('Nombre de usuario y contraseña son requeridos');
        error.status = 400;
        throw error;
      }

      // Verificar que el nombre de usuario no exista
      const usuarioExiste = await this.obtenerPorNombreUsuario(nombre_usuario);
      if (usuarioExiste) {
        const error = new Error('El nombre de usuario ya existe');
        error.status = 409; // Conflict
        throw error;
      }

      // IMPORTANTE: En producción deberías hashear la contraseña
      // Por ahora la guardamos en texto plano para el proyecto académico
      const result = await connection.execute(
        `INSERT INTO usuarios 
          (nombre_usuario, rol, contraseña)
        VALUES 
          (:nombre_usuario, :rol, :contraseña)
        RETURNING id_usuario INTO :id`,
        {
          nombre_usuario,
          rol: rol || 'operador', // Rol por defecto
          contraseña, // En producción: await bcrypt.hash(contraseña, 10)
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

  // Actualizar usuario
  async actualizar(id, usuario) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const { nombre_usuario, rol, contraseña } = usuario;

      // Validar campo requerido
      if (!nombre_usuario) {
        const error = new Error('El nombre de usuario es requerido');
        error.status = 400;
        throw error;
      }

      // Verificar que el usuario existe
      await this.obtenerPorId(id);

      // Si se proporciona contraseña, actualizar todo
      // Si no, solo actualizar nombre y rol
      let query, binds;
      
      if (contraseña) {
        query = `UPDATE usuarios 
                 SET nombre_usuario = :nombre_usuario,
                     rol = :rol,
                     contraseña = :contraseña
                 WHERE id_usuario = :id`;
        binds = {
          id,
          nombre_usuario,
          rol,
          contraseña // En producción: await bcrypt.hash(contraseña, 10)
        };
      } else {
        query = `UPDATE usuarios 
                 SET nombre_usuario = :nombre_usuario,
                     rol = :rol
                 WHERE id_usuario = :id`;
        binds = {
          id,
          nombre_usuario,
          rol
        };
      }

      const result = await connection.execute(query, binds, { autoCommit: true });

      if (result.rowsAffected === 0) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
      }

      return await this.obtenerPorId(id);
    } finally {
      if (connection) await connection.close();
    }
  }

  // Eliminar usuario
  async eliminar(id) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Verificar que el usuario existe antes de eliminar
      await this.obtenerPorId(id);

      const result = await connection.execute(
        `UPDATE usuarios
        SET estado = CASE 
                      WHEN estado = 'ACTIVO' THEN 'INACTIVO'
                      ELSE 'ACTIVO'
                    END,
            fecha_baja = CASE 
                          WHEN estado = 'ACTIVO' THEN SYSDATE
                          ELSE NULL
                        END
        WHERE id_usuario = :id`,
        { id },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
      }

      return { mensaje: 'Usuario eliminado exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Buscar usuarios por nombre
  async buscarPorNombre(nombre) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_usuario,
          nombre_usuario,
          rol
        FROM usuarios
        WHERE UPPER(nombre_usuario) LIKE '%' || UPPER(:nombre) || '%'
        ORDER BY nombre_usuario`,
        { nombre }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Obtener usuarios por rol
  async obtenerPorRol(rol) {
    let connection;
    try {
      connection = await db.getConnection();
      const result = await connection.execute(
        `SELECT 
          id_usuario,
          nombre_usuario,
          rol
        FROM usuarios
        WHERE LOWER(rol) = LOWER(:rol)
        ORDER BY nombre_usuario`,
        { rol }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  // Login simple (para proyecto académico)
  async login(nombre_usuario, contraseña) {
    let connection;
    try {
      connection = await db.getConnection();
      
      const usuario = await this.obtenerPorNombreUsuario(nombre_usuario);
      
      if (!usuario) {
        const error = new Error('Usuario o contraseña incorrectos');
        error.status = 401;
        throw error;
      }

      // En producción: await bcrypt.compare(contraseña, usuario.CONTRASEÑA)
      if (usuario.CONTRASEÑA !== contraseña) {
        const error = new Error('Usuario o contraseña incorrectos');
        error.status = 401;
        throw error;
      }

      // No devolver la contraseña
      return {
        id_usuario: usuario.ID_USUARIO,
        nombre_usuario: usuario.NOMBRE_USUARIO,
        rol: usuario.ROL
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  // Cambiar contraseña
  async cambiarContraseña(id, contraseñaAntigua, contraseñaNueva) {
    let connection;
    try {
      connection = await db.getConnection();
      
      // Obtener usuario con contraseña
      const result = await connection.execute(
        `SELECT contraseña FROM usuarios WHERE id_usuario = :id`,
        { id }
      );

      if (result.rows.length === 0) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
      }

      // Verificar contraseña antigua
      // En producción: await bcrypt.compare(contraseñaAntigua, result.rows[0].CONTRASEÑA)
      if (result.rows[0].CONTRASEÑA !== contraseñaAntigua) {
        const error = new Error('La contraseña actual es incorrecta');
        error.status = 401;
        throw error;
      }

      // Actualizar contraseña
      // En producción: const hash = await bcrypt.hash(contraseñaNueva, 10)
      await connection.execute(
        `UPDATE usuarios SET contraseña = :contraseña WHERE id_usuario = :id`,
        { id, contraseña: contraseñaNueva },
        { autoCommit: true }
      );

      return { mensaje: 'Contraseña actualizada exitosamente' };
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new UsuariosService();