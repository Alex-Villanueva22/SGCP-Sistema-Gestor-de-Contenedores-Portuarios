const clientesService = require('../services/clientes.service');
const db = require('../config/db');

class ClientesController {
  
  // GET /api/clientes
  async obtenerTodos(req, res, next) {
    try {
      const clientes = await clientesService.obtenerTodos();
      res.json({
        ok: true,
        data: clientes
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cliente = await clientesService.obtenerPorId(id);
      res.json({
        ok: true,
        data: cliente
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/clientes
  async crear(req, res, next) {
    let connection;
    try {
      const { nombre_empresa, representante, contacto } = req.body;
      
      // Validar campo requerido
      if (!nombre_empresa) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre de la empresa es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_insert_cliente(:p_nombre_empresa, :p_representante, :p_contacto); END;`,
        {
          p_nombre_empresa: nombre_empresa,
          p_representante: representante || null,
          p_contacto: contacto || null
        },
        { autoCommit: true }
      );

      // Obtener el cliente recién creado (usando el servicio para obtener)
      const clientesCreados = await clientesService.buscarPorNombre(nombre_empresa);
      const nuevoCliente = clientesCreados.find(c => 
        c.NOMBRE_EMPRESA === nombre_empresa && 
        c.REPRESENTANTE === (representante || null) && 
        c.CONTACTO === (contacto || null)
      ) || clientesCreados[0];

      res.status(201).json({
        ok: true,
        data: nuevoCliente,
        mensaje: 'Cliente creado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // PUT /api/clientes/:id
  async actualizar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;
      const { nombre_empresa, representante, contacto } = req.body;
      
      // Validar campo requerido
      if (!nombre_empresa) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre de la empresa es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_update_cliente(:p_id_cliente, :p_nombre_empresa, :p_representante, :p_contacto); END;`,
        {
          p_id_cliente: parseInt(id),
          p_nombre_empresa: nombre_empresa,
          p_representante: representante || null,
          p_contacto: contacto || null
        },
        { autoCommit: true }
      );

      // Obtener el cliente actualizado (usando el servicio para obtener)
      const clienteActualizado = await clientesService.obtenerPorId(id);

      res.json({
        ok: true,
        data: clienteActualizado,
        mensaje: 'Cliente actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // DELETE /api/clientes/:id
  async eliminar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;

      connection = await db.getConnection();
      
      // Verificar que el cliente exista antes de eliminar
      await clientesService.obtenerPorId(id);
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_delete_cliente(:p_id_cliente); END;`,
        {
          p_id_cliente: parseInt(id)
        },
        { autoCommit: true }
      );

      res.json({
        ok: true,
        mensaje: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // GET /api/clientes/buscar/:nombre
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.params;
      const clientes = await clientesService.buscarPorNombre(nombre);
      res.json({
        ok: true,
        data: clientes
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/clientes/:id/contenedores
  async obtenerContenedores(req, res, next) {
    try {
      const { id } = req.params;
      const contenedores = await clientesService.obtenerContenedores(id);
      res.json({
        ok: true,
        data: contenedores
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientesController();