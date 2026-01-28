import { useState, useEffect } from "react"
import { movimientosAPI, contenedoresAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faFilter, faArrowRight } from '@fortawesome/free-solid-svg-icons'

const tiposMovimiento = ["Entrada", "Salida", "Carga", "Descarga", "Transferencia", "Inspección"]

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />,
  ArrowRight: () => <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
}

export default function MovimientosView() {
  const [movimientos, setMovimientos] = useState([])
  const [contenedores, setContenedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [formData, setFormData] = useState({
    id_contenedor: "",
    tipoMovimiento: "Entrada",
    fechaMovimiento: "",
    observaciones: "",
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrar movimientos por tipo
  const movimientosFiltrados = filtroTipo === "Todos" 
    ? movimientos 
    : movimientos.filter(m => m.tipoMovimiento === filtroTipo)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Cargar movimientos y contenedores en paralelo
      const [movimientosResponse, contenedoresResponse] = await Promise.all([
        movimientosAPI.obtenerTodos(),
        contenedoresAPI.obtenerTodos()
      ])

      // Mapear movimientos del backend al formato del frontend
      const movimientosFormateados = movimientosResponse.data.map(movimiento => ({
        id: movimiento.ID_MOVIMIENTO, // id_movimiento
        id_contenedor: movimiento.ID_CONTENEDOR, // id_contenedor
        contenedor: movimiento.CODIGO_CONTENEDOR || "", // codigo_contenedor
        tipoMovimiento: movimiento.TIPO_MOVIMIENTO || "", // tipo_movimiento
        fechaMovimiento: movimiento.FECHA_MOVIMIENTO, // fecha_movimiento
        observaciones: movimiento.OBSERVACIONES || "" // observaciones
      }))

      // Mapear contenedores para el selector
      const contenedoresFormateados = contenedoresResponse.data.map(contenedor => ({
        id: contenedor.ID_CONTENEDOR,
        codigo: contenedor.CODIGO_CONTENEDOR,
        cliente: contenedor.CLIENTE_NOMBRE || ""
      }))

      setMovimientos(movimientosFormateados)
      setContenedores(contenedoresFormateados)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTipoMovimientoBadge = (tipo) => {
    const colors = {
      "Entrada": "bg-green-100 text-green-700",
      "Salida": "bg-blue-100 text-blue-700",
      "Carga": "bg-yellow-100 text-yellow-700",
      "Descarga": "bg-orange-100 text-orange-700",
      "Transferencia": "bg-purple-100 text-purple-700",
      "Inspección": "bg-red-100 text-red-700"
    }
    return colors[tipo] || "bg-gray-100 text-gray-700"
  }

  const handleOpenModal = (movimiento) => {
    if (movimiento) {
      setFormData({
        id_contenedor: movimiento.id_contenedor,
        tipoMovimiento: movimiento.tipoMovimiento,
        fechaMovimiento: movimiento.fechaMovimiento,
        observaciones: movimiento.observaciones
      })
      setEditingId(movimiento.id)
    } else {
      setFormData({ 
        id_contenedor: "",
        tipoMovimiento: "Entrada", 
        fechaMovimiento: "", 
        observaciones: "" 
      })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ 
      id_contenedor: "",
      tipoMovimiento: "Entrada", 
      fechaMovimiento: "", 
      observaciones: "" 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (editingId) {
        // Actualizar movimiento existente
        await movimientosAPI.actualizar(editingId, formData)
      } else {
        // Crear nuevo movimiento

        const fechaObj = new Date(formData.fechaMovimiento);
        const offset = fechaObj.getTimezoneOffset() * 60000;
        const localISO = new Date(fechaObj - offset).toISOString().slice(0, 19);

        const fechaOracle = localISO.replace("T", " ");

        formData.fechaMovimiento = fechaOracle;
        await movimientosAPI.crear(formData)
      }
      
      // Recargar la lista de movimientos
      await cargarDatos()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar movimiento:', err)
      setError('Error al guardar el movimiento: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, contenedor, tipo) => {
    if (!confirm(`¿Está seguro de que desea eliminar el movimiento "${tipo}" del contenedor "${contenedor}"?`)) {
      return
    }
    
    try {
      setError(null)
      await movimientosAPI.eliminar(id)
      await cargarDatos()
    } catch (err) {
      console.error('Error al eliminar movimiento:', err)
      setError('Error al eliminar el movimiento: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando movimientos...</p>
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
          <p className="text-sm text-gray-600">Total de movimientos: {movimientosFiltrados.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFiltroTipo("Todos")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                filtroTipo === "Todos"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <IconComponents.Filter />
              Todos
            </button>
            {tiposMovimiento.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filtroTipo === tipo
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <IconComponents.Plus />
            Registrar movimiento
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registro de Movimientos</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contenedor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo Movimiento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha y Hora</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Observaciones</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No hay movimientos {filtroTipo !== "Todos" ? `del tipo "${filtroTipo}"` : "registrados"}
                    </td>
                  </tr>
                ) : (
                  movimientosFiltrados.map((movimiento) => (
                    <tr key={movimiento.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-mono font-semibold">{movimiento.contenedor || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoMovimientoBadge(movimiento.tipoMovimiento)}`}
                        >
                          {movimiento.tipoMovimiento || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{movimiento.fechaMovimiento || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{movimiento.observaciones || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(movimiento)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(movimiento.id, movimiento.contenedor, movimiento.tipoMovimiento)}
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
                {editingId ? "Editar Movimiento" : "Registrar Movimiento"}
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
                  <label className="text-sm font-medium text-gray-700">Contenedor *</label>
                  <select
                    required
                    value={formData.id_contenedor}
                    onChange={(e) => setFormData({ ...formData, id_contenedor: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar contenedor...</option>
                    {contenedores.map((contenedor) => (
                      <option key={contenedor.id} value={contenedor.id}>
                        {contenedor.codigo} {contenedor.cliente && `- ${contenedor.cliente}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo Movimiento *</label>
                  <select
                    required
                    value={formData.tipoMovimiento}
                    onChange={(e) => setFormData({ ...formData, tipoMovimiento: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    {tiposMovimiento.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={formData.fechaMovimiento}
                    onChange={(e) => setFormData({ ...formData, fechaMovimiento: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">Si se deja vacío, se usará la fecha y hora actual</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Notas sobre el movimiento"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
                    rows={3}
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
                    {submitting ? "Guardando..." : (editingId ? "Actualizar" : "Registrar")}
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