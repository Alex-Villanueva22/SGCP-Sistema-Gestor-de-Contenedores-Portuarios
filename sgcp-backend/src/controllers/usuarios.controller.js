const usuariosService = require('../services/usuarios.service');

class UsuariosController {
  
  // GET /api/usuarios
  async obtenerTodos(req, res, next) {
    try {
      const usuarios = await usuariosService.obtenerTodos();
      res.json({
        ok: true,
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/usuarios/:id
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await usuariosService.obtenerPorId(id);
      res.json({
        ok: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/usuarios
  async crear(req, res, next) {
    try {
      const nuevoUsuario = await usuariosService.crear(req.body);
      res.status(201).json({
        ok: true,
        data: nuevoUsuario,
        mensaje: 'Usuario creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/usuarios/:id
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioActualizado = await usuariosService.actualizar(id, req.body);
      res.json({
        ok: true,
        data: usuarioActualizado,
        mensaje: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/usuarios/:id
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await usuariosService.eliminar(id);
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/usuarios/buscar/:nombre
  async buscarPorNombre(req, res, next) {
    try {
      const { nombre } = req.params;
      const usuarios = await usuariosService.buscarPorNombre(nombre);
      res.json({
        ok: true,
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/usuarios/rol/:rol
  async obtenerPorRol(req, res, next) {
    try {
      const { rol } = req.params;
      const usuarios = await usuariosService.obtenerPorRol(rol);
      res.json({
        ok: true,
        data: usuarios
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/usuarios/login
  async login(req, res, next) {
    try {
      const { nombre_usuario, contraseña } = req.body;

      if (!nombre_usuario || !contraseña) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Nombre de usuario y contraseña son requeridos'
        });
      }

      const usuario = await usuariosService.login(nombre_usuario, contraseña);
      
      res.json({
        ok: true,
        data: usuario,
        mensaje: 'Login exitoso'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/usuarios/:id/cambiar-contraseña
  async cambiarContraseña(req, res, next) {
    try {
      const { id } = req.params;
      const { contraseña_antigua, contraseña_nueva } = req.body;

      if (!contraseña_antigua || !contraseña_nueva) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Contraseña antigua y nueva son requeridas'
        });
      }

      const resultado = await usuariosService.cambiarContraseña(
        id, 
        contraseña_antigua, 
        contraseña_nueva
      );
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuariosController();