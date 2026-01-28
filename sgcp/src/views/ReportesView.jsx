import { useState, useEffect } from "react"
import { reportesAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faEye, faDownload, faFileText, faTimes, faSpinner, faFilter } from '@fortawesome/free-solid-svg-icons'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#f97316", "#06b6d4", "#84cc16"]

const IconComponents = {
  TrendingUp: () => <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />,
  Eye: () => <FontAwesomeIcon icon={faEye} className="w-4 h-4" />,
  Download: () => <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />,
  FileText: () => <FontAwesomeIcon icon={faFileText} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Spinner: () => <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
}

// Configuración de reportes disponibles
const reportesConfig = [
  {
    id: 'contenedores-activos',
    nombre: 'Contenedores Activos',
    descripcion: 'Contenedores activos con su último movimiento',
    tipo: 'tabla',
    categoria: 'operacional',
    parametros: [
      { nombre: 'estado', tipo: 'select', opciones: ['Operativo', 'Dañado', 'En Inspección', 'En tránsito'], opcional: true }
    ],
    api: (params) => reportesAPI.contenedoresActivos(params.estado)
  },
  {
    id: 'ranking-clientes',
    nombre: 'Ranking de Clientes',
    descripcion: 'Clientes ordenados por cantidad de contenedores',
    tipo: 'bar',
    categoria: 'comercial',
    parametros: [
      { nombre: 'limite', tipo: 'number', min: 1, max: 50, opcional: true, default: 10 }
    ],
    api: (params) => reportesAPI.rankingClientes(params.limite)
  },
  {
    id: 'contenedores-proxima-salida',
    nombre: 'Próximas Salidas',
    descripcion: 'Embarcaciones que saldrán en los próximos días',
    tipo: 'tabla',
    categoria: 'operacional',
    parametros: [
      { nombre: 'dias', tipo: 'number', min: 1, max: 365, requerido: true, default: 7 },
      { nombre: 'embarcacion', tipo: 'text', opcional: true }
    ],
    api: (params) => reportesAPI.contenedoresProximaSalida(params.dias, params.embarcacion)
  },
  {
    id: 'productos-mensuales',
    nombre: 'Productos del Mes',
    descripcion: 'Productos con mayor actividad en el mes',
    tipo: 'pie',
    categoria: 'comercial',
    parametros: [
      { nombre: 'mes', tipo: 'number', min: 1, max: 12, opcional: false },
      { nombre: 'anio', tipo: 'number', min: 2020, max: 2030, opcional: false }
    ],
    api: (params) => reportesAPI.productosMensuales(params.mes, params.anio)
  },
  {
    id: 'historial-contenedor',
    nombre: 'Historial de Contenedor',
    descripcion: 'Historial completo de movimientos de un contenedor',
    tipo: 'tabla',
    categoria: 'auditoria',
    parametros: [
      { nombre: 'codigo', tipo: 'text', opcional: false }
    ],
    api: (params) => reportesAPI.historialContenedor(params.codigo)
  },
  {
    id: 'embarcaciones-contenedores',
    nombre: 'Embarcaciones y Contenedores',
    descripcion: 'Embarcaciones con mayor cantidad de contenedores',
    tipo: 'bar',
    categoria: 'operacional',
    parametros: [
      { nombre: 'solo_con_contenedores', tipo: 'select', opciones: [{ value: 'S', label: 'Solo con contenedores' }, { value: 'N', label: 'Incluir vacías' }], opcional: true, default: 'N' }
    ],
    api: (params) => reportesAPI.embarcacionesContenedores(params.solo_con_contenedores)
  },
  {
    id: 'estado-puerto',
    nombre: 'Estado del Puerto',
    descripcion: 'Resumen del estado general del puerto',
    tipo: 'pie',
    categoria: 'operacional',
    parametros: [
      { nombre: 'excluir_vacios', tipo: 'select', opciones: [{ value: 'S', label: 'Excluir vacíos' }, { value: 'N', label: 'Incluir vacíos' }], opcional: true, default: 'N' }
    ],
    api: (params) => reportesAPI.estadoPuerto(params.excluir_vacios)
  },
  {
    id: 'contenedores-abandonados',
    nombre: 'Contenedores Abandonados',
    descripcion: 'Contenedores sin movimientos recientes',
    tipo: 'tabla',
    categoria: 'auditoria',
    parametros: [
      { nombre: 'dias_antiguedad', tipo: 'number', min: 1, max: 365, opcional: true, default: 30 }
    ],
    api: (params) => reportesAPI.contenedoresAbandonados(params.dias_antiguedad)
  },
  {
    id: 'alertas-detalle',
    nombre: 'Detalle de Alertas',
    descripcion: 'Alertas de contenedores dañados o en inspección',
    tipo: 'tabla',
    categoria: 'auditoria',
    parametros: [
      { nombre: 'estado_contenedor', tipo: 'select', opciones: ['Dañado', 'En inspección'], opcional: true },
      { nombre: 'dias_recientes', tipo: 'number', min: 1, max: 365, opcional: true, default: 30 }
    ],
    api: (params) => reportesAPI.alertasDetalle(params.estado_contenedor, params.dias_recientes)
  },
  {
    id: 'auditoria-usuarios',
    nombre: 'Auditoría de Usuarios',
    descripcion: 'Registro de acciones de usuarios por día',
    tipo: 'tabla',
    categoria: 'auditoria',
    parametros: [
      { nombre: 'usuario', tipo: 'text', opcional: true },
      { nombre: 'accion', tipo: 'select', opciones: ['creacion', 'baja','reactivacion','cambio_nombre','actualizacion','cambio_rol','cambio_contrasena'], opcional: true },
      { nombre: 'fecha_desde', tipo: 'date', opcional: true },
      { nombre: 'fecha_hasta', tipo: 'date', opcional: true }
    ],
    api: (params) => reportesAPI.auditoriaUsuarios(params.usuario, params.accion, params.fecha_desde, params.fecha_hasta)
  }
]

function ReporteModal({ reporte, onClose }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parametros, setParametros] = useState({})

  // Inicializar parámetros con valores por defecto
  useEffect(() => {
    const defaultParams = {}
    reporte.parametros?.forEach(param => {
      if (param.default !== undefined) {
        defaultParams[param.nombre] = param.default
      }
    })
    setParametros(defaultParams)
  }, [reporte])

  const cargarReporte = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validar parámetros requeridos
      const paramsFaltantes = reporte.parametros?.filter(p => p.requerido && !parametros[p.nombre])
      if (paramsFaltantes?.length > 0) {
        setError(`Parámetros requeridos: ${paramsFaltantes.map(p => p.nombre).join(', ')}`)
        return
      }

      const response = await reporte.api(parametros)
      
      // Mapear datos de Oracle a formato del frontend
      const dataMapeada = response.data.map(row => {
        const item = {}
        Object.keys(row).forEach(key => {
          // Convertir nombres de columnas de Oracle (MAYUSCULAS) a camelCase
          const newKey = key.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
          item[newKey] = row[key]
        })
        return item
      })
      
      setData(dataMapeada)
    } catch (err) {
      console.error('Error al cargar reporte:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleParametroChange = (nombre, valor) => {
    setParametros(prev => ({
      ...prev,
      [nombre]: valor
    }))
  }

  const renderParametros = () => {
    if (!reporte.parametros?.length) return null

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <IconComponents.Filter />
          Parámetros del Reporte
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reporte.parametros.map(param => (
            <div key={param.nombre} className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                {param.nombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {param.requerido && <span className="text-red-500 ml-1">*</span>}
              </label>
              {param.tipo === 'select' ? (
                <select
                  value={parametros[param.nombre] || ''}
                  onChange={(e) => handleParametroChange(param.nombre, e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {param.opcional && <option value="">Seleccionar...</option>}
                  {param.opciones?.map(opcion => (
                    <option 
                      key={typeof opcion === 'string' ? opcion : opcion.value} 
                      value={typeof opcion === 'string' ? opcion : opcion.value}
                    >
                      {typeof opcion === 'string' ? opcion : opcion.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={param.tipo}
                  value={parametros[param.nombre] || ''}
                  onChange={(e) => handleParametroChange(param.nombre, e.target.value)}
                  min={param.min}
                  max={param.max}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={param.opcional ? 'Opcional' : 'Requerido'}
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={cargarReporte}
          disabled={loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <IconComponents.Spinner /> : <IconComponents.TrendingUp />}
          {loading ? 'Cargando...' : 'Generar Reporte'}
        </button>
      </div>
    )
  }

  const renderChart = () => {
    if (!data.length) return null

    switch (reporte.tipo) {
      case 'pie':
        // Para productos mensuales y otros reportes de pie, usar las claves correctas
        const pieValueKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'number') || 'total'
        const pieNameKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'string') || 'nombre'
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ [pieNameKey]: nombre, [pieValueKey]: valor }) => `${nombre}: ${valor}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey={pieValueKey}
                nameKey={pieNameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Producto: ${label}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      case 'bar':
        const barDataKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'number')
        const barNameKey = Object.keys(data[0]).find(key => typeof data[0][key] === 'string')
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={barNameKey} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey={barDataKey} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={Object.keys(data[0])[0]} stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              {Object.keys(data[0]).map(
                (key, idx) =>
                  key !== Object.keys(data[0])[0] && typeof data[0][key] === 'number' && (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={key}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                    />
                  ),
              )}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'tabla':
      default:
        return (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 sticky top-0 bg-white">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 font-semibold text-gray-900 text-xs">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {Object.entries(row).map(([key, val], vIdx) => (
                      <td key={vIdx} className="py-3 px-4 text-gray-700 text-xs">
                        {val === null || val === undefined 
                          ? '-' 
                          : String(val)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-200 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{reporte.nombre}</h3>
            <p className="text-sm text-gray-600 mt-1">{reporte.descripcion}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IconComponents.X />
          </button>
        </div>
        
        <div className="p-6">
          {renderParametros()}
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <IconComponents.Spinner />
                <p className="mt-2 text-sm text-gray-600">Generando reporte...</p>
              </div>
            </div>
          )}
          
          {!loading && data.length > 0 && (
            <>
              {renderChart()}
              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <IconComponents.Download />
                  Descargar PDF
                </button>
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <IconComponents.FileText />
                  Descargar Excel
                </button>
              </div>
            </>
          )}
          
          {!loading && data.length === 0 && !error && parametros && Object.keys(parametros).length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron datos para los parámetros especificados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportesView() {
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('todos')

  const categorias = ['todos', 'operacional', 'comercial', 'auditoria']
  
  const reportesFiltrados = filtroCategoria === 'todos' 
    ? reportesConfig 
    : reportesConfig.filter(r => r.categoria === filtroCategoria)

  const getCategoriaColor = (categoria) => {
    const colors = {
      operacional: 'bg-blue-50 text-blue-700',
      comercial: 'bg-green-50 text-green-700',
      auditoria: 'bg-purple-50 text-purple-700'
    }
    return colors[categoria] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Filtros por categoría */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map(categoria => (
          <button
            key={categoria}
            onClick={() => setFiltroCategoria(categoria)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              filtroCategoria === categoria
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportesFiltrados.map((reporte) => (
          <div
            key={reporte.id}
            className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-lg overflow-hidden"
            onClick={() => setSelectedReporte(reporte)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{reporte.nombre}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoriaColor(reporte.categoria)}`}>
                      {reporte.categoria}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{reporte.descripcion}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      reporte.tipo === 'tabla' ? 'bg-gray-100' :
                      reporte.tipo === 'bar' ? 'bg-blue-100' :
                      reporte.tipo === 'pie' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {reporte.tipo}
                    </span>
                    {reporte.parametros?.length > 0 && (
                      <span className="text-gray-400">
                        {reporte.parametros.length} parámetro{reporte.parametros.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg ml-2">
                  <IconComponents.TrendingUp />
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedReporte(reporte)
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <IconComponents.Eye />
                  Generar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal del reporte */}
      {selectedReporte && (
        <ReporteModal 
          reporte={selectedReporte} 
          onClose={() => setSelectedReporte(null)} 
        />
      )}
    </div>
  )
}