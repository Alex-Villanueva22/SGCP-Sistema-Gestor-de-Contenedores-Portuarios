const db = require('../config/db');

// Función genérica para reportes SIN parámetros (solo cursor de salida)
async function reporteGenerico(req, res, next, nombreSP, paramName = 'cursor_out') {
  let connection;
  try {
    connection = await db.getConnection();
    const binds = {
      [paramName]: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
    };
    
    const result = await connection.execute(
      `BEGIN ${nombreSP}(:${paramName}); END;`,
      binds
    );

    const cursor = result.outBinds[paramName];
    const rows = await cursor.getRows(1000); // Obtener hasta 1000 filas
    await cursor.close();

    res.json({
      ok: true,
      data: rows
    });
  } catch (err) {
    next(err);
  } finally {
    if (connection) await connection.close();
  }
}

// Función genérica para reportes CON parámetros
async function reporteConParametros(req, res, next, nombreSP, binds) {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Log para debugging
    console.log('Ejecutando:', nombreSP);
    console.log('Binds:', JSON.stringify(binds, null, 2));
    
    const result = await connection.execute(
      `BEGIN ${nombreSP}; END;`,
      binds
    );

    console.log('OutBinds keys:', Object.keys(result.outBinds));
    
    // Buscar el cursor en los outBinds (puede tener diferentes nombres)
    const cursorKey = Object.keys(result.outBinds).find(key => 
      result.outBinds[key] && typeof result.outBinds[key].getRows === 'function'
    );
    
    if (!cursorKey) {
      console.error('No se encontró cursor. OutBinds:', result.outBinds);
      throw new Error('No se encontró cursor en la respuesta del procedimiento');
    }

    console.log('Cursor encontrado en:', cursorKey);
    
    const cursor = result.outBinds[cursorKey];
    const rows = await cursor.getRows(1000); // Obtener hasta 1000 filas
    console.log(rows)
    await cursor.close();
    res.json({
      ok: true,
      data: rows
    });
  } catch (err) {
    console.error('Error en reporteConParametros:', err);
    next(err);
  } finally {
    if (connection) await connection.close();
  }
}

// ============================================================
// REPORTE 1: Contenedores activos con su último movimiento
// ============================================================
async function contenedoresActivos(req, res, next) {
  const estado = req.query.estado || null;
  
  const binds = {
    p_estado: estado,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_contenedores_activos(:p_estado, :p_cursor)', binds);
}

// ============================================================
// REPORTE 2: Ranking de clientes según cantidad de contenedores
// ============================================================
async function rankingClientes(req, res, next) {
  const limite = req.query.limite ? parseInt(req.query.limite) : null;
  
  const binds = {
    p_limite: limite,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_ranking_clientes(:p_limite, :p_cursor)', binds);
}

// ============================================================
// REPORTE 3: Contenedores que saldrán en X días (CON PARÁMETRO)
// ============================================================
async function contenedoresProximaSalida(req, res, next) {
  const dias = parseInt(req.query.dias);
  const nombreEmbarcacion = req.query.embarcacion || null;
  
  // Validar que días sea un número válido
  if (isNaN(dias)) {
    return res.status(400).json({
      ok: false,
      message: 'El parámetro "dias" es requerido y debe ser un número válido'
    });
  }
  
  const binds = {
    dias: dias,
    p_nombre_embarcacion: nombreEmbarcacion,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_contenedores_proxima_salida(:dias, :p_nombre_embarcacion, :p_cursor)', binds);
}

// ============================================================
// REPORTE 4: Productos más enviados del mes actual
// ============================================================
async function productosMensuales(req, res, next) {
  const mes = req.query.mes ? parseInt(req.query.mes) : null;
  const anio = req.query.anio ? parseInt(req.query.anio) : null;
  
  const binds = {
    p_mes: mes,
    p_anio: anio,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_productos_mensuales(:p_mes, :p_anio, :p_cursor)', binds);
}

// ============================================================
// REPORTE 5: Historial completo de un contenedor (CON PARÁMETRO)
// ============================================================
async function historialContenedor(req, res, next) {
  // const id = parseInt(req.params.id);
  const codigo = req.params.codigo;
  
  // Validar que el ID sea válido
  if (!codigo) {
    return res.status(400).json({
      ok: false,
      message: 'Se requiere un codigo de contenedor válido'
    });
  }
  
  const binds = {
    p_codigo_contenedor: codigo,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_historial_contenedor(:p_codigo_contenedor, :p_cursor)', binds);
}

// ============================================================
// REPORTE 6: Embarcaciones con mayor cantidad de contenedores
// ============================================================
async function embarcacionesContenedores(req, res, next) {
  const soloConContenedores = req.query.solo_con_contenedores || 'N';
  
  const binds = {
    p_solo_con_contenedores: soloConContenedores.toUpperCase(),
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_embarcaciones_contenedores(:p_solo_con_contenedores, :p_cursor)', binds);
}

// ============================================================
// REPORTE 7: Resumen del estado general del puerto
// ============================================================
async function estadoPuerto(req, res, next) {
  const excluirVacios = req.query.excluir_vacios || 'N';
  
  const binds = {
    p_excluir_vacios: excluirVacios.toUpperCase(),
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_estado_puerto(:p_excluir_vacios, :p_cursor)', binds);
}

// ============================================================
// REPORTE 8: Contenedores sin movimientos (posibles abandonados)
// ============================================================
async function contenedoresAbandonados(req, res, next) {
  const diasAntiguedad = req.query.dias_antiguedad ? parseInt(req.query.dias_antiguedad) : null;
  
  const binds = {
    p_dias_antiguedad: diasAntiguedad,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_contenedores_abandonados(:p_dias_antiguedad, :p_cursor)', binds);
}

// ============================================================
// REPORTE 9: Alertas activas con detalle completo
// ============================================================
async function alertasDetalle(req, res, next) {
  const estadoAlerta = req.query.estado_alerta || null;
  const diasRecientes = req.query.dias_recientes ? parseInt(req.query.dias_recientes) : null;
  
  const binds = {
    p_estado_alerta: estadoAlerta,
    p_dias_recientes: diasRecientes,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_alertas_detalle(:p_estado_alerta, :p_dias_recientes, :p_cursor)', binds);
}

// ============================================================
// REPORTE 10: Auditoría de usuarios (acciones por día)
// ============================================================
async function auditoriaUsuarios(req, res, next) {
  const usuario = req.query.usuario || null;
  const accion = req.query.accion || null;
  
  // Convertir fechas de string a Date si se proporcionan
  let fechaDesde = null;
  let fechaHasta = null;
  
  if (req.query.fecha_desde) {
    fechaDesde = new Date(req.query.fecha_desde);
  }
  
  if (req.query.fecha_hasta) {
    fechaHasta = new Date(req.query.fecha_hasta);
  }
  
  const binds = {
    p_usuario: usuario,
    p_accion: accion,
    p_fecha_desde: fechaDesde,
    p_fecha_hasta: fechaHasta,
    p_cursor: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
  };
  
  reporteConParametros(req, res, next, 'rep_auditoria_usuarios(:p_usuario, :p_accion, :p_fecha_desde, :p_fecha_hasta, :p_cursor)', binds);
}

module.exports = {
  contenedoresActivos,
  rankingClientes,
  contenedoresProximaSalida,
  productosMensuales,
  historialContenedor,
  embarcacionesContenedores,
  estadoPuerto,
  contenedoresAbandonados,
  alertasDetalle,
  auditoriaUsuarios
};