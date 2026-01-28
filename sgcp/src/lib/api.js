const API_BASE_URL = 'http://localhost:3000/api';

// Configuración base para fetch
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función para formatear fecha y hora en formato legible
const formatearFechaHora = (fecha) => {
  if (!fecha) return ""
  const fechaObj = new Date(fecha)
  return fechaObj.toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para formatear solo fecha (sin hora)
const formatearFecha = (fecha) => {
  if (!fecha) return ""
  const fechaObj = new Date(fecha)
  return fechaObj.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Función recursiva para formatear automáticamente todos los campos de fecha en un objeto
const formatearFechasEnObjeto = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  
  // Si es un array, aplicar la función a cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => formatearFechasEnObjeto(item))
  }
  
  // Si es un objeto, recorrer sus propiedades
  const objetoFormateado = { ...obj }
  
  Object.keys(objetoFormateado).forEach(key => {
    const valor = objetoFormateado[key]
    
    // Si el campo termina en 'fecha_' y tiene un valor, formatearlo
    if (key.toLowerCase().includes('fecha_') && valor) {
      // Para campos que incluyen hora (como fecha_movimiento), usar formatearFechaHora
      if (key.includes('fecha_movimiento') || key.includes('fecha_hora')) {
        objetoFormateado[key] = formatearFechaHora(valor)
      } else {
        // Para otros campos de fecha, usar solo fecha
        objetoFormateado[key] = formatearFecha(valor)
      }
    }
    // Si es un objeto anidado, aplicar recursivamente
    else if (typeof valor === 'object' && valor !== null) {
      objetoFormateado[key] = formatearFechasEnObjeto(valor)
    }
  })
  
  return objetoFormateado
}

// Función helper para manejar respuestas y formatear fechas automáticamente
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Formatear automáticamente todos los campos de fecha en la respuesta
  return formatearFechasEnObjeto(data);
};

// API para clientes
export const clientesAPI = {
  // GET /api/clientes
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/clientes/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/clientes
  crear: async (cliente) => {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        nombre_empresa: cliente.empresa,
        representante: cliente.representante,
        contacto: cliente.contacto
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/clientes/:id
  actualizar: async (id, cliente) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        nombre_empresa: cliente.empresa,
        representante: cliente.representante,
        contacto: cliente.contacto
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/clientes/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/clientes/buscar/:nombre
  buscarPorNombre: async (nombre) => {
    const response = await fetch(`${API_BASE_URL}/clientes/buscar/${encodeURIComponent(nombre)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/clientes/:id/contenedores
  obtenerContenedores: async (id) => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}/contenedores`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para contenedores
export const contenedoresAPI = {
  // GET /api/contenedores
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/contenedores`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/contenedores/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contenedores/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/contenedores
  crear: async (contenedor) => {
    const response = await fetch(`${API_BASE_URL}/contenedores`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        codigo_contenedor: contenedor.codigo,
        tipo: contenedor.tipo,
        estado: contenedor.estado,
        peso: contenedor.peso,
        id_cliente: contenedor.id_cliente,
        id_embarcacion: contenedor.id_embarcacion
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/contenedores/:id
  actualizar: async (id, contenedor) => {
    const response = await fetch(`${API_BASE_URL}/contenedores/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        codigo_contenedor: contenedor.codigo,
        tipo: contenedor.tipo,
        estado: contenedor.estado,
        peso: contenedor.peso,
        id_cliente: contenedor.id_cliente,
        id_embarcacion: contenedor.id_embarcacion
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/contenedores/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/contenedores/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/contenedores/buscar/:codigo
  buscarPorCodigo: async (codigo) => {
    const response = await fetch(`${API_BASE_URL}/contenedores/buscar/${encodeURIComponent(codigo)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/contenedores/estado/:estado
  obtenerPorEstado: async (estado) => {
    const response = await fetch(`${API_BASE_URL}/contenedores/estado/${encodeURIComponent(estado)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para embarcaciones
export const embarcacionesAPI = {
  // GET /api/embarcaciones
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/embarcaciones/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/embarcaciones
  crear: async (embarcacion) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        nombre: embarcacion.nombre,
        bandera: embarcacion.bandera,
        fecha_arribo: embarcacion.fechaArribo,
        fecha_salida: embarcacion.fechaSalida
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/embarcaciones/:id
  actualizar: async (id, embarcacion) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        nombre: embarcacion.nombre,
        bandera: embarcacion.bandera,
        fecha_arribo: embarcacion.fechaArribo,
        fecha_salida: embarcacion.fechaSalida
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/embarcaciones/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/embarcaciones/buscar/:nombre
  buscarPorNombre: async (nombre) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/buscar/${encodeURIComponent(nombre)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/embarcaciones/en-puerto
  obtenerEnPuerto: async () => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/en-puerto`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/embarcaciones/:id/contenedores
  obtenerContenedores: async (id) => {
    const response = await fetch(`${API_BASE_URL}/embarcaciones/${id}/contenedores`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para movimientos
export const movimientosAPI = {
  // GET /api/movimientos
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/movimientos`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/movimientos/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/movimientos
  crear: async (movimiento) => {
    const response = await fetch(`${API_BASE_URL}/movimientos`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        id_contenedor: movimiento.id_contenedor,
        tipo_movimiento: movimiento.tipoMovimiento,
        fecha_movimiento: movimiento.fechaMovimiento,
        observaciones: movimiento.observaciones
      }),
    });
    console.log(movimiento.fechaMovimiento)
    return handleResponse(response);
  },

  // PUT /api/movimientos/:id
  actualizar: async (id, movimiento) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        id_contenedor: movimiento.id_contenedor,
        tipo_movimiento: movimiento.tipoMovimiento,
        fecha_movimiento: movimiento.fechaMovimiento,
        observaciones: movimiento.observaciones
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/movimientos/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/movimientos/contenedor/:idContenedor
  obtenerPorContenedor: async (idContenedor) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/contenedor/${idContenedor}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/movimientos/tipo/:tipo
  obtenerPorTipo: async (tipo) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/tipo/${encodeURIComponent(tipo)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/movimientos/recientes?dias=7
  obtenerRecientes: async (dias = 7) => {
    const response = await fetch(`${API_BASE_URL}/movimientos/recientes?dias=${dias}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para usuarios
export const usuariosAPI = {
  // GET /api/usuarios
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/usuarios/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/usuarios
  crear: async (usuario) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        nombre_usuario: usuario.usuario,
        rol: usuario.rol,
        contraseña: usuario.contraseña
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/usuarios/:id
  actualizar: async (id, usuario) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        nombre_usuario: usuario.usuario,
        rol: usuario.rol,
        contraseña: usuario.contraseña // Solo si se proporciona
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/usuarios/:id/estado - Cambiar estado del usuario
  cambiarEstado: async (id, estado) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/estado`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        estado: estado
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/usuarios/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // POST /api/usuarios/login
  login: async (nombre_usuario, contraseña) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        nombre_usuario,
        contraseña
      }),
    });
    return handleResponse(response);
  },

  // GET /api/usuarios/buscar/:nombre
  buscarPorNombre: async (nombre) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/buscar/${encodeURIComponent(nombre)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/usuarios/rol/:rol
  obtenerPorRol: async (rol) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/rol/${encodeURIComponent(rol)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // PUT /api/usuarios/:id/cambiar-contraseña
  cambiarContraseña: async (id, contraseñaAntigua, contraseñaNueva) => {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/cambiar-contraseña`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        contraseña_antigua: contraseñaAntigua,
        contraseña_nueva: contraseñaNueva
      }),
    });
    return handleResponse(response);
  }
};

// API para lotes
export const lotesAPI = {
  // GET /api/lotes
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/lotes`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/lotes/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/lotes/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/lotes
  crear: async (lote) => {
    const response = await fetch(`${API_BASE_URL}/lotes`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        id_contenedor: lote.id_contenedor,
        id_producto: lote.id_producto,
        cantidad: lote.cantidad
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/lotes/:id
  actualizar: async (id, lote) => {
    const response = await fetch(`${API_BASE_URL}/lotes/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        id_contenedor: lote.id_contenedor,
        id_producto: lote.id_producto,
        cantidad: lote.cantidad
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/lotes/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/lotes/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/lotes/contenedor/:idContenedor
  obtenerPorContenedor: async (idContenedor) => {
    const response = await fetch(`${API_BASE_URL}/lotes/contenedor/${idContenedor}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/lotes/producto/:idProducto
  obtenerPorProducto: async (idProducto) => {
    const response = await fetch(`${API_BASE_URL}/lotes/producto/${idProducto}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para productos
export const productosAPI = {
  // GET /api/productos
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/productos/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // POST /api/productos
  crear: async (producto) => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        tipo_producto: producto.tipo_producto,
        valor_estimado: producto.valor_estimado
      }),
    });
    return handleResponse(response);
  },

  // PUT /api/productos/:id
  actualizar: async (id, producto) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        tipo_producto: producto.tipo_producto,
        valor_estimado: producto.valor_estimado
      }),
    });
    return handleResponse(response);
  },

  // DELETE /api/productos/:id
  eliminar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // GET /api/productos/buscar/:nombre
  buscarPorNombre: async (nombre) => {
    const response = await fetch(`${API_BASE_URL}/productos/buscar/${encodeURIComponent(nombre)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/productos/tipo/:tipo
  obtenerPorTipo: async (tipo) => {
    const response = await fetch(`${API_BASE_URL}/productos/tipo/${encodeURIComponent(tipo)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para reportes
export const reportesAPI = {
  // GET /api/reportes/contenedores-activos?estado=operativo
  contenedoresActivos: async (estado = null) => {
    const params = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    const response = await fetch(`${API_BASE_URL}/reportes/contenedores-activos${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/ranking-clientes?limite=10
  rankingClientes: async (limite = null) => {
    const params = limite ? `?limite=${limite}` : '';
    const response = await fetch(`${API_BASE_URL}/reportes/ranking-clientes${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/contenedores-proxima-salida?dias=10&embarcacion=nombre
  contenedoresProximaSalida: async (dias, embarcacion = null) => {
    if (!dias) throw new Error('El parámetro "dias" es requerido');
    let params = `?dias=${dias}`;
    if (embarcacion) params += `&embarcacion=${encodeURIComponent(embarcacion)}`;
    
    const response = await fetch(`${API_BASE_URL}/reportes/contenedores-proxima-salida${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/productos-mensuales?mes=11&anio=2025
  productosMensuales: async (mes = null, anio = null) => {
    let params = '';
    if (mes || anio) {
      params = '?';
      if (mes) params += `mes=${mes}`;
      if (anio) params += `${mes ? '&' : ''}anio=${anio}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/reportes/productos-mensuales${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/historial-contenedor/:id
  historialContenedor: async (codigo) => {
    if (!codigo) throw new Error('El codigo del contenedor es requerido');
    const response = await fetch(`${API_BASE_URL}/reportes/historial-contenedor/${codigo}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/embarcaciones-contenedores?solo_con_contenedores=Y
  embarcacionesContenedores: async (soloConContenedores = 'N') => {
    const params = `?solo_con_contenedores=${soloConContenedores}`;
    const response = await fetch(`${API_BASE_URL}/reportes/embarcaciones-contenedores${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/estado-puerto?excluir_vacios=N
  estadoPuerto: async (excluirVacios = 'N') => {
    const params = `?excluir_vacios=${excluirVacios}`;
    const response = await fetch(`${API_BASE_URL}/reportes/estado-puerto${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/contenedores-abandonados?dias_antiguedad=30
  contenedoresAbandonados: async (diasAntiguedad = null) => {
    const params = diasAntiguedad ? `?dias_antiguedad=${diasAntiguedad}` : '';
    const response = await fetch(`${API_BASE_URL}/reportes/contenedores-abandonados${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/alertas-detalle?estado_alerta=activa&dias_recientes=7
  alertasDetalle: async (estadoAlerta = null, diasRecientes = null) => {
    let params = '';
    if (estadoAlerta || diasRecientes) {
      params = '?';
      if (estadoAlerta) params += `estado_alerta=${encodeURIComponent(estadoAlerta)}`;
      if (diasRecientes) params += `${estadoAlerta ? '&' : ''}dias_recientes=${diasRecientes}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/reportes/alertas-detalle${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/reportes/auditoria-usuarios?usuario=admin&accion=login&fecha_desde=2025-01-01&fecha_hasta=2025-12-31
  auditoriaUsuarios: async (usuario = null, accion = null, fechaDesde = null, fechaHasta = null) => {
    let params = '';
    const queryParams = [];
    
    if (usuario) queryParams.push(`usuario=${encodeURIComponent(usuario)}`);
    if (accion) queryParams.push(`accion=${encodeURIComponent(accion)}`);
    if (fechaDesde) queryParams.push(`fecha_desde=${fechaDesde}`);
    if (fechaHasta) queryParams.push(`fecha_hasta=${fechaHasta}`);
    
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
    
    const response = await fetch(`${API_BASE_URL}/reportes/auditoria-usuarios${params}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// API para alertas
export const alertasAPI = {
  // GET /api/alertas
  obtenerTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/alertas`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/alertas/:id
  obtenerPorId: async (id) => {
    const response = await fetch(`${API_BASE_URL}/alertas/${id}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // PUT /api/alertas/:id
  actualizar: async (id, alerta) => {
    const response = await fetch(`${API_BASE_URL}/alertas/${id}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify({
        estado: alerta.estado
      }),
    });
    return handleResponse(response);
  },

  // GET /api/alertas/contenedor/:idContenedor
  obtenerPorContenedor: async (idContenedor) => {
    const response = await fetch(`${API_BASE_URL}/alertas/contenedor/${idContenedor}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/alertas/estado/:estado
  obtenerPorEstado: async (estado) => {
    const response = await fetch(`${API_BASE_URL}/alertas/estado/${encodeURIComponent(estado)}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/alertas/recientes?dias=7
  obtenerRecientes: async (dias = 7) => {
    const response = await fetch(`${API_BASE_URL}/alertas/recientes?dias=${dias}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/alertas/activas
  obtenerActivas: async () => {
    const response = await fetch(`${API_BASE_URL}/alertas/activas`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/alertas/fechas?inicio=2024-01-01&fin=2024-12-31
  obtenerPorFechas: async (fechaInicio, fechaFin) => {
    const response = await fetch(`${API_BASE_URL}/alertas/fechas?inicio=${fechaInicio}&fin=${fechaFin}`, {
      ...defaultOptions,
      method: 'GET',
    });
    return handleResponse(response);
  }
};

// Exportar funciones utilitarias de formateo para uso en otros componentes
export { formatearFechaHora, formatearFecha, formatearFechasEnObjeto };