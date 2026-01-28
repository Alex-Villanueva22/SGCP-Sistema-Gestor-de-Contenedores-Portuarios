import { useState, useEffect } from "react"
import { 
  clientesAPI, 
  contenedoresAPI, 
  embarcacionesAPI, 
  movimientosAPI, 
  reportesAPI 
} from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBox, 
  faShip, 
  faUsers, 
  faExclamationTriangle,
  faEye,
  faDownload,
  faFileText,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'
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

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#f97316"]

const IconComponents = {
  Container: () => <FontAwesomeIcon icon={faBox} className="w-6 h-6" />,
  TrendingUp: () => <FontAwesomeIcon icon={faShip} className="w-6 h-6" />,
  Users: () => <FontAwesomeIcon icon={faUsers} className="w-6 h-6" />,
  AlertTriangle: () => <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6" />,
  Eye: () => <FontAwesomeIcon icon={faEye} className="w-4 h-4" />,
  Download: () => <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />,
  FileText: () => <FontAwesomeIcon icon={faFileText} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Spinner: () => <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
}

function ReporteModal({ reporte, onClose }) {
  const renderChart = () => {
    switch (reporte.tipo) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reporte.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={reporte.data[0]?.value ? "value" : "cantidad"}
              >
                {reporte.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reporte.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={Object.keys(reporte.data[0])[0]} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey={Object.keys(reporte.data[0])[1]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reporte.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={Object.keys(reporte.data[0])[0]} stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              {Object.keys(reporte.data[0]).map(
                (key, idx) =>
                  key !== Object.keys(reporte.data[0])[0] && (
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
      case "tabla":
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  {Object.keys(reporte.data[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 font-semibold text-gray-900">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reporte.data.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {Object.values(row).map((val, vIdx) => (
                      <td key={vIdx} className="py-3 px-4 text-gray-700 text-xs">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{reporte.nombre}</h3>
            <p className="text-sm text-gray-600 mt-1">{reporte.descripcion}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IconComponents.X />
          </button>
        </div>
        <div className="p-6">
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
        </div>
      </div>
    </div>
  )
}

export default function DashboardView() {
  const [selectedReporte, setSelectedReporte] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para datos dinámicos
  const [statsData, setStatsData] = useState([])
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [actividadReciente, setActividadReciente] = useState([])

  useEffect(() => {
    cargarDatosDashboard()
  }, [])

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar datos de diferentes endpoints en paralelo
      const [
        contenedoresResponse,
        embarcacionesResponse,
        clientesResponse,
        movimientosRecientesResponse,
        estadoPuertoResponse
      ] = await Promise.all([
        contenedoresAPI.obtenerTodos(),
        embarcacionesAPI.obtenerEnPuerto(),
        clientesAPI.obtenerTodos(),
        movimientosAPI.obtenerRecientes(7),
        reportesAPI.estadoPuerto('N').catch(() => ({ data: [] })) // Fallback si falla el reporte
      ])

      // Procesar estadísticas generales
      const contenedores = contenedoresResponse.data
      const embarcaciones = embarcacionesResponse.data
      const clientes = clientesResponse.data
      const movimientosRecientes = movimientosRecientesResponse.data

      // Contar alertas (contenedores dañados como proxy)
      const alertasActivas = contenedores.filter(c => 
        c.ESTADO && c.ESTADO.toLowerCase() === 'dañado'
      ).length

      setStatsData([
        { 
          label: "Total Contenedores", 
          value: contenedores.length, 
          icon: "Container" 
        },
        { 
          label: "Embarcaciones en Puerto", 
          value: embarcaciones.length, 
          icon: "TrendingUp" 
        },
        { 
          label: "Total Clientes", 
          value: clientes.length, 
          icon: "Users" 
        },
        { 
          label: "Alertas Activas", 
          value: alertasActivas, 
          icon: "AlertTriangle" 
        }
      ])

      // Procesar datos para gráfico de líneas (movimientos por día de los últimos 7 días)
      const hoy = new Date()
      const chartDataProcessed = []
      
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy)
        fecha.setDate(hoy.getDate() - i)
        const fechaStr = fecha.toDateString()
        
        // Contar movimientos por tipo en esta fecha
        const movimientosDia = movimientosRecientes.filter(mov => {
          if (!mov.FECHA_MOVIMIENTO) return false
          const fechaMov = new Date(mov.FECHA_MOVIMIENTO)
          return fechaMov.toDateString() === fechaStr
        })
        
        const entradas = movimientosDia.filter(m => 
          m.TIPO_MOVIMIENTO && m.TIPO_MOVIMIENTO.toLowerCase().includes('entrada')
        ).length
        
        const salidas = movimientosDia.filter(m => 
          m.TIPO_MOVIMIENTO && m.TIPO_MOVIMIENTO.toLowerCase().includes('salida')
        ).length
        
        const inspecciones = movimientosDia.filter(m => 
          m.TIPO_MOVIMIENTO && m.TIPO_MOVIMIENTO.toLowerCase().includes('inspecci')
        ).length
        
        chartDataProcessed.push({
          dia: fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
          entradas: Math.round(entradas * 100) / 100,
          salidas: Math.round(salidas * 100) / 100,
          inspecciones: Math.round(inspecciones * 100) / 100
        })
      }
      setChartData(chartDataProcessed)

      // Procesar datos para gráfico de torta
      const estadosCount = contenedores.reduce((acc, contenedor) => {
        const estado = contenedor.ESTADO || 'Sin estado'
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, {})
      
      const totalContenedores = contenedores.length
      const pieDataProcessed = Object.entries(estadosCount).map(([estado, count]) => ({
        name: estado.charAt(0).toUpperCase() + estado.slice(1),
        value: Math.round(((count / totalContenedores) * 100) * 100) / 100
      }))
      setPieData(pieDataProcessed)

      // Procesar actividad reciente
      const actividadProcesada = movimientosRecientes.slice(0, 3).map(mov => ({
        container: mov.CODIGO_CONTENEDOR || 'CNT-???',
        type: mov.TIPO_MOVIMIENTO || 'Movimiento',
        date: (mov.FECHA_MOVIMIENTO),
        status: Math.random() > 0.3 ? "completed" : "pending"
      }))
      setActividadReciente(actividadProcesada)

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err)
      setError('Error al cargar los datos del dashboard')
      
      // Datos fallback en caso de error
      setStatsData([
        { label: "Total Contenedores", value: 0, icon: "Container" },
        { label: "Embarcaciones en Puerto", value: 0, icon: "TrendingUp" },
        { label: "Total Clientes", value: 0, icon: "Users" },
        { label: "Alertas Activas", value: 0, icon: "AlertTriangle" }
      ])
      setChartData([])
      setPieData([])
      setActividadReciente([])
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    try {
      const fechaObj = new Date(fecha)
      const hoy = new Date()
      const ayer = new Date(hoy)
      ayer.setDate(hoy.getDate() - 1)

      if (fechaObj.toDateString() === hoy.toDateString()) {
        return `Hoy ${fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
      } else if (fechaObj.toDateString() === ayer.toDateString()) {
        return `Ayer ${fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
      } else {
        return fechaObj.toLocaleDateString('es-ES')
      }
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <IconComponents.Spinner />
          <p className="mt-2 text-sm text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={cargarDatosDashboard}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const IconComponent = IconComponents[stat.icon]
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <IconComponent />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Movimientos Diarios</h3>
            <p className="text-sm text-gray-600 mt-1">Actividad de los últimos 7 días</p>
          </div>
          <div className="p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="entradas" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="salidas" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="inspecciones" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Sin datos para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Estado General</h3>
            <p className="text-sm text-gray-600 mt-1">Distribución actual</p>
          </div>
          <div className="p-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Sin datos para mostrar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-600 mt-1">Últimos movimientos registrados</p>
          </div>
          <div className="p-6">
            {actividadReciente.length > 0 ? (
              <div className="space-y-4">
                {actividadReciente.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.container}</p>
                      <p className="text-sm text-gray-600">
                        {activity.type} - {activity.date}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {activity.status === "completed" ? "Completado" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay actividad reciente registrada
              </div>
            )}
          </div>
        </div>
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