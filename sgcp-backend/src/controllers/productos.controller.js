const productosService = require('../services/productos.service');
const db = require('../config/db');

class ProductosController {
  
  // GET /api/productos
  async obtenerTodos(req, res, next) {
    try {
      const productos = await productosService.obtenerTodos();
      res.json({
        ok: true,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const producto = await productosService.obtenerPorId(id);
      res.json({
        ok: true,
        data: producto
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/productos
  async crear(req, res, next) {
    let connection;
    try {
      const { nombre, descripcion, tipo_producto, valor_estimado } = req.body;
      
      // Validar campo requerido
      if (!nombre) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre del producto es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_insert_producto(:p_nombre, :p_descripcion, :p_tipo_producto, :p_valor_estimado); END;`,
        {
          p_nombre: nombre,
          p_descripcion: descripcion || null,
          p_tipo_producto: tipo_producto || null,
          p_valor_estimado: valor_estimado || null
        },
        { autoCommit: true }
      );

      // Obtener el producto recién creado (usando el servicio para obtener)
      const productosCreados = await productosService.buscarPorNombre(nombre);
      const nuevoProducto = productosCreados.find(p => 
        p.NOMBRE === nombre && 
        p.DESCRIPCION === (descripcion || null) && 
        p.TIPO_PRODUCTO === (tipo_producto || null) &&
        p.VALOR_ESTIMADO === (valor_estimado || null)
      ) || productosCreados[0];

      res.status(201).json({
        ok: true,
        data: nuevoProducto,
        mensaje: 'Producto creado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // PUT /api/productos/:id
  async actualizar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;
      const { nombre, descripcion, tipo_producto, valor_estimado } = req.body;
      
      // Validar campo requerido
      if (!nombre) {
        return res.status(400).json({
          ok: false,
          message: 'El nombre del producto es requerido'
        });
      }

      connection = await db.getConnection();
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_update_producto(:p_id_producto, :p_nombre, :p_descripcion, :p_tipo_producto, :p_valor_estimado); END;`,
        {
          p_id_producto: parseInt(id),
          p_nombre: nombre,
          p_descripcion: descripcion || null,
          p_tipo_producto: tipo_producto || null,
          p_valor_estimado: valor_estimado || null
        },
        { autoCommit: true }
      );

      // Obtener el producto actualizado (usando el servicio para obtener)
      const productoActualizado = await productosService.obtenerPorId(id);

      res.json({
        ok: true,
        data: productoActualizado,
        mensaje: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // DELETE /api/productos/:id
  async eliminar(req, res, next) {
    let connection;
    try {
      const { id } = req.params;

      connection = await db.getConnection();
      
      // Verificar que el producto exista antes de eliminar
      await productosService.obtenerPorId(id);
      
      // Llamar al procedimiento almacenado
      await connection.execute(
        `BEGIN sp_delete_producto(:p_id_producto); END;`,
        {
          p_id_producto: parseInt(id)
        },
        { autoCommit: true }
      );

      res.json({
        ok: true,
        mensaje: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  // GET /api/productos/buscar/:nombre
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.params;
      const productos = await productosService.buscarPorNombre(nombre);
      res.json({
        ok: true,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/productos/tipo/:tipo
  async obtenerPorTipo(req, res, next) {
    try {
      const { tipo } = req.params;
      const productos = await productosService.obtenerPorTipo(tipo);
      res.json({
        ok: true,
        data: productos
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductosController();