import { useState, useEffect } from "react"
import { alertasAPI } from "../lib/api"

const IconComponents = {
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Loader: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Eye: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default function AlertasView() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('todas') // todas, danado, inspeccion

  useEffect(() => {
    cargarAlertas()
  }, [])

  const cargarAlertas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await alertasAPI.obtenerTodos()
      
      if (response.ok) {
        // Mapear los datos del backend al formato esperado por el frontend
        const alertasMapeadas = response.data.map(alerta => ({
          id: alerta.ID_ALERTA,
          contenedor: alerta.CODIGO_CONTENEDOR || 'Sin código',
          estado: alerta.ESTADO,
          fecha: formatearFecha(alerta.FECHA_ALERTA),
          mensaje: generarMensaje(alerta),
          severidad: mapearSeveridad(alerta.ESTADO),
          cliente: alerta.CLIENTE || 'Cliente desconocido',
          embarcacion: alerta.EMBARCACION || 'Sin embarcación'
        }))
        setAlertas(alertasMapeadas)
      } else {
        setError('Error al cargar las alertas')
      }
    } catch (err) {
      setError('Error de conexión al cargar las alertas')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const mapearSeveridad = (estadoBackend) => {
    const estadoLower = estadoBackend?.toLowerCase() || ''
    
    if (estadoLower.includes('dañado') || estadoLower.includes('fuera de servicio')) {
      return 'Crítica'
    } else if (estadoLower.includes('inspección') || estadoLower.includes('con fallas')) {
      return 'Advertencia'
    } else {
      return 'Información'
    }
  }

  const generarMensaje = (alerta) => {
    const estado = alerta.ESTADO?.toLowerCase() || ''
    const contenedor = alerta.CODIGO_CONTENEDOR || 'Contenedor'
    
    if (estado.includes('dañado')) {
      return `${contenedor} presenta daños`
    } else if (estado.includes('inspección')) {
      return `${contenedor} requiere inspección`
    } else if (estado.includes('con fallas')) {
      return `${contenedor} tiene fallas reportadas`
    } else if (estado.includes('fuera de servicio')) {
      return `${contenedor} fuera de servicio`
    } else {
      return `Estado: ${alerta.ESTADO}`
    }
  }

  const esEstadoRelevante = (estado) => {
    const estadoLower = estado?.toLowerCase() || ''
    return estadoLower.includes('dañado') || estadoLower.includes('inspección')
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible'
    
    try {
      const fechaObj = new Date(fecha)
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  const getEstadoColor = (severidad) => {
    switch (severidad) {
      case "Crítica":
        return "bg-red-100 text-red-700 border-red-200"
      case "Advertencia":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Información":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getIcono = (severidad) => {
    switch (severidad) {
      case "Crítica":
        return <IconComponents.AlertTriangle className="w-5 h-5 text-red-700" />
      case "Advertencia":
        return <IconComponents.Clock className="w-5 h-5 text-yellow-700" />
      case "Información":
        return <IconComponents.CheckCircle className="w-5 h-5 text-blue-700" />
      default:
        return <IconComponents.AlertTriangle className="w-5 h-5" />
    }
  }

  const alertasFiltradas = alertas.filter(alerta => {
    const estadoLower = alerta.estado?.toLowerCase() || ''
    switch (filtro) {
      case 'danado':
        return estadoLower.includes('dañado')
      case 'inspeccion':
        return estadoLower.includes('inspección')
      default:
        return true
    }
  })

  // Contadores para las tarjetas
  const alertasDanado = alertas.filter(a => a.estado?.toLowerCase().includes('dañado')).length
  const alertasInspeccion = alertas.filter(a => a.estado?.toLowerCase().includes('inspección')).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <IconComponents.Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando alertas...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <IconComponents.AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={cargarAlertas}
              className="ml-auto px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de alertas</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{alertas.length}</p>
              </div>
              <IconComponents.AlertTriangle className="w-6 h-6 text-blue-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dañados</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{alertasDanado}</p>
              </div>
              <IconComponents.AlertTriangle className="w-6 h-6 text-red-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En inspección</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{alertasInspeccion}</p>
              </div>
              <IconComponents.Eye className="w-6 h-6 text-orange-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Listado de Alertas</h3>
            <div className="flex gap-2">
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las alertas</option>
                <option value="danado">Solo dañados</option>
                <option value="inspeccion">Solo en inspección</option>
              </select>
              <button
                onClick={cargarAlertas}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          {alertasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IconComponents.CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay alertas {filtro === 'todas' ? '' : filtro === 'danado' ? 'de contenedores dañados' : 'de contenedores en inspección'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertasFiltradas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 border rounded-lg ${getEstadoColor(alerta.severidad)}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getIcono(alerta.severidad)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{alerta.contenedor}</p>
                        <span className="text-xs px-2 py-1 bg-white/30 rounded-full">{alerta.estado}</span>
                        {alerta.cliente && (
                          <span className="text-xs px-2 py-1 bg-white/20 rounded-full">{alerta.cliente}</span>
                        )}
                      </div>
                      <p className="text-sm mt-1">{alerta.mensaje}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs opacity-75">
                        <span>{alerta.fecha}</span>
                        {alerta.embarcacion && <span>Embarcación: {alerta.embarcacion}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}