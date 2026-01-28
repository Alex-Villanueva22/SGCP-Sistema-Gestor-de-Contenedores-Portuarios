import { useState, useEffect } from "react"
import { embarcacionesAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faShip, faAnchor } from '@fortawesome/free-solid-svg-icons'

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Ship: () => <FontAwesomeIcon icon={faShip} className="w-4 h-4" />,
  Anchor: () => <FontAwesomeIcon icon={faAnchor} className="w-4 h-4" />
}

export default function EmbarcacionesView() {
  const [embarcaciones, setEmbarcaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtro, setFiltro] = useState("Todas")
  const [formData, setFormData] = useState({
    nombre: "",
    bandera: "",
    fechaArribo: "",
    fechaSalida: "",
  })

  // Cargar embarcaciones al montar el componente
  useEffect(() => {
    cargarEmbarcaciones()
  }, [])


  // Función auxiliar para determinar el estado de la embarcación
  const getEstadoEmbarcacion = (fechaArribo, fechaSalida) => {
    const hoy = new Date()
    const arribo = fechaArribo ? new Date(fechaArribo) : null
    const salida = fechaSalida ? new Date(fechaSalida) : null

    if (!arribo) return "Programada"
    if (arribo > hoy) return "En tránsito"
    if (!salida) return "En puerto"
    if (salida > hoy) return "En puerto"
    return "Finalizada"
  }

  // Filtrar embarcaciones por estado
  const embarcacionesFiltradas = filtro === "Todas" 
    ? embarcaciones 
    : embarcaciones.filter(e => getEstadoEmbarcacion(e.fechaArribo, e.fechaSalida) === filtro)

  const cargarEmbarcaciones = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await embarcacionesAPI.obtenerTodos()
      
      // Mapear los datos del backend al formato del frontend
      const embarcacionesFormateadas = response.data.map(embarcacion => ({
        id: embarcacion.ID_EMBARCACION, // id_embarcacion
        nombre: embarcacion.NOMBRE, // nombre
        bandera: embarcacion.BANDERA || "", // bandera
        fechaArribo: (embarcacion.FECHA_ARRIBO), // fecha_arribo
        fechaSalida: (embarcacion.FECHA_SALIDA), // fecha_salida
      }))
      
      setEmbarcaciones(embarcacionesFormateadas)
    } catch (err) {
      console.error('Error al cargar embarcaciones:', err)
      setError('Error al cargar las embarcaciones: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (embarcacion) => {
    if (embarcacion) {
      setFormData({
        nombre: embarcacion.nombre,
        bandera: embarcacion.bandera,
        fechaArribo: embarcacion.fechaArribo || "",
        fechaSalida: embarcacion.fechaSalida || "",
      })
      setEditingId(embarcacion.id)
    } else {
      setFormData({ nombre: "", bandera: "", fechaArribo: "", fechaSalida: "" })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ nombre: "", bandera: "", fechaArribo: "", fechaSalida: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (editingId) {
        // Actualizar embarcación existente
        await embarcacionesAPI.actualizar(editingId, formData)
      } else {
        // Crear nueva embarcación
        await embarcacionesAPI.crear(formData)
      }
      
      // Recargar la lista de embarcaciones
      await cargarEmbarcaciones()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar embarcación:', err)
      setError('Error al guardar la embarcación: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Está seguro de que desea eliminar la embarcación "${nombre}"?`)) {
      return
    }
    
    try {
      setError(null)
      await embarcacionesAPI.eliminar(id)
      await cargarEmbarcaciones()
    } catch (err) {
      console.error('Error al eliminar embarcación:', err)
      setError('Error al eliminar la embarcación: ' + err.message)
    }
  }

  const getEstadoBadge = (fechaArribo, fechaSalida) => {
    const estado = getEstadoEmbarcacion(fechaArribo, fechaSalida)
    const colors = {
      "Programada": "bg-gray-100 text-gray-700",
      "En tránsito": "bg-blue-100 text-blue-700", 
      "En puerto": "bg-green-100 text-green-700",
      "Finalizada": "bg-gray-100 text-gray-500"
    }
    return colors[estado] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando embarcaciones...</p>
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
                onClick={cargarEmbarcaciones}
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
          <p className="text-sm text-gray-600">Total de embarcaciones: {embarcacionesFiltradas.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {["Todas", "En puerto", "En tránsito", "Programada", "Finalizada"].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                  filtro === estado
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {estado === "En puerto" && <IconComponents.Anchor />}
                {estado === "En tránsito" && <IconComponents.Ship />}
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
            Nueva embarcación
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Flota de Embarcaciones</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Bandera</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Arribo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Salida</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {embarcacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No hay embarcaciones {filtro !== "Todas" ? `en estado "${filtro}"` : "registradas"}
                    </td>
                  </tr>
                ) : (
                  embarcacionesFiltradas.map((embarcacion) => (
                    <tr key={embarcacion.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">{embarcacion.nombre}</td>
                      <td className="py-3 px-4 text-gray-700">{embarcacion.bandera || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(embarcacion.fechaArribo, embarcacion.fechaSalida)}`}
                        >
                          {getEstadoEmbarcacion(embarcacion.fechaArribo, embarcacion.fechaSalida)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{embarcacion.fechaArribo || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{embarcacion.fechaSalida || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(embarcacion)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(embarcacion.id, embarcacion.nombre)}
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
                {editingId ? "Editar Embarcación" : "Nueva Embarcación"}
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
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: MAERSK-121"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bandera</label>
                  <input
                    type="text"
                    value={formData.bandera}
                    onChange={(e) => setFormData({ ...formData, bandera: e.target.value })}
                    placeholder="Ej: Panamá"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha Arribo</label>
                  <input
                    type="date"
                    value={formData.fechaArribo}
                    onChange={(e) => setFormData({ ...formData, fechaArribo: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha Salida</label>
                  <input
                    type="date"
                    value={formData.fechaSalida}
                    onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
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