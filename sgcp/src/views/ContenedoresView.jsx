import { useState, useEffect } from "react"
import { contenedoresAPI, clientesAPI, embarcacionesAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons'

const estados = ["Operativo", "Dañado", "En Inspección", "En tránsito"]
const tipos = ["20ft", "40ft", "Specialized"]

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
}

export default function ContenedoresView() {
  const [contenedores, setContenedores] = useState([])
  const [clientes, setClientes] = useState([])
  const [embarcaciones, setEmbarcaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState("Todos")
  const [formData, setFormData] = useState({
    codigo: "",
    tipo: "20ft",
    estado: "Operativo",
    peso: 0,
    id_cliente: "",
    id_embarcacion: ""
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrar contenedores por estado
  const contenedoresFiltrados = filtroEstado === "Todos" 
    ? contenedores 
    : contenedores.filter(c => c.estado === filtroEstado)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Cargar contenedores, clientes y embarcaciones en paralelo
      const [contenedoresResponse, clientesResponse, embarcacionesResponse] = await Promise.all([
        contenedoresAPI.obtenerTodos(),
        clientesAPI.obtenerTodos(),
        embarcacionesAPI.obtenerTodos()
      ])

      // Mapear contenedores del backend al formato del frontend
      const contenedoresFormateados = contenedoresResponse.data.map(contenedor => ({
        id: contenedor.ID_CONTENEDOR, // id_contenedor
        codigo: contenedor.CODIGO_CONTENEDOR, // codigo_contenedor
        tipo: contenedor.TIPO || "", // tipo
        estado: contenedor.ESTADO|| "", // estado
        peso: contenedor.PESO || 0, // peso
        id_cliente: contenedor.ID_CLIENTE, // id_cliente
        cliente: contenedor.CLIENTE_NOMBRE || "", // cliente_nombre
        id_embarcacion: contenedor.ID_EMBARCACION, // id_embarcacion
        embarcacion: contenedor.EMBARCACION_NOMBRE || "" // embarcacion_nombre
      }))

      // Mapear clientes para el selector
      const clientesFormateados = clientesResponse.data.map(cliente => ({
        id: cliente.ID_CLIENTE,
        nombre: cliente.NOMBRE_EMPRESA
      }))

      // Mapear embarcaciones para el selector
      const embarcacionesFormateadas = embarcacionesResponse.data.map(embarcacion => ({
        id: embarcacion.ID_EMBARCACION,
        nombre: embarcacion.NOMBRE,
        bandera: embarcacion.BANDERA,
        fecha_arribo: embarcacion.FECHA_ARRIBO,
        fecha_salida: embarcacion.FECHA_SALIDA
      }))

      setContenedores(contenedoresFormateados)
      setClientes(clientesFormateados)
      setEmbarcaciones(embarcacionesFormateadas)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const colors = {
      Operativo: "bg-green-100 text-green-700",
      Dañado: "bg-red-100 text-red-700",
      Inspección: "bg-yellow-100 text-yellow-700",
      "En tránsito": "bg-blue-100 text-blue-700",
    }
    return colors[estado] || "bg-gray-100 text-gray-700"
  }

  const handleOpenModal = (contenedor) => {
    if (contenedor) {
      setFormData({
        codigo: contenedor.codigo,
        tipo: contenedor.tipo,
        estado: contenedor.estado,
        peso: contenedor.peso,
        id_cliente: contenedor.id_cliente,
        id_embarcacion: contenedor.id_embarcacion || ""
      })
      setEditingId(contenedor.id)
    } else {
      setFormData({ 
        codigo: "", 
        tipo: "20ft", 
        estado: "Operativo", 
        peso: 0, 
        id_cliente: "", 
        id_embarcacion: "" 
      })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ 
      codigo: "", 
      tipo: "20ft", 
      estado: "Operativo", 
      peso: 0, 
      id_cliente: "", 
      id_embarcacion: "" 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Preparar datos para enviar - convertir strings vacíos a null para id_embarcacion
      const dataToSubmit = {
        ...formData,
        id_embarcacion: formData.id_embarcacion === "" ? null : parseInt(formData.id_embarcacion)
      }
      
      if (editingId) {
        // Actualizar contenedor existente
        await contenedoresAPI.actualizar(editingId, dataToSubmit)
      } else {
        // Crear nuevo contenedor
        await contenedoresAPI.crear(dataToSubmit)
      }
      
      // Recargar la lista de contenedores
      await cargarDatos()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar contenedor:', err)
      setError('Error al guardar el contenedor: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, codigo) => {
    if (!confirm(`¿Está seguro de que desea eliminar el contenedor "${codigo}"?`)) {
      return
    }
    
    try {
      setError(null)
      await contenedoresAPI.eliminar(id)
      await cargarDatos()
    } catch (err) {
      console.error('Error al eliminar contenedor:', err)
      setError('Error al eliminar el contenedor: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contenedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={cargarDatos}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-gray-600">Total de contenedores: {contenedoresFiltrados.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            <button
              onClick={() => setFiltroEstado("Todos")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                filtroEstado === "Todos"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <IconComponents.Filter />
              Todos
            </button>
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filtroEstado === estado
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <IconComponents.Plus />
            Nuevo
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Contenedores</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Código</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Peso (kg)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Embarcación</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contenedoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No hay contenedores {filtroEstado !== "Todos" ? `en estado "${filtroEstado}"` : "registrados"}
                    </td>
                  </tr>
                ) : (
                  contenedoresFiltrados.map((contenedor) => (
                    <tr key={contenedor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-mono font-semibold">{contenedor.codigo}</td>
                      <td className="py-3 px-4 text-gray-700">{contenedor.tipo || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(contenedor.estado)}`}
                        >
                          {contenedor.estado || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{contenedor.peso ? contenedor.peso.toLocaleString() : '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{contenedor.cliente || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{contenedor.embarcacion || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(contenedor)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(contenedor.id, contenedor.codigo)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="Eliminar"
                          >
                            <IconComponents.Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? "Editar Contenedor" : "Nuevo Contenedor"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={submitting}
              >
                <IconComponents.X />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Código *</label>
                  <input
                    required
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="CNT-001"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ej: 20ft, 40ft, Specialized"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    {estados.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: parseInt(e.target.value) || 0 })}
                    placeholder="2400"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cliente *</label>
                  <select
                    required
                    value={formData.id_cliente}
                    onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Embarcación</label>
                  <select
                    value={formData.id_embarcacion}
                    onChange={(e) => setFormData({ ...formData, id_embarcacion: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Sin embarcación asignada</option>
                    {embarcaciones.map((embarcacion) => (
                      <option key={embarcacion.id} value={embarcacion.id}>
                        {embarcacion.nombre} {embarcacion.bandera ? `(${embarcacion.bandera})` : ''}
                        {new Date(embarcacion.fecha_salida) <= new Date() ? ' - Ya partió' : ' - En puerto'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    Opcional: Asigne el contenedor a una embarcación específica
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? "Guardando..." : (editingId ? "Actualizar" : "Crear")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}