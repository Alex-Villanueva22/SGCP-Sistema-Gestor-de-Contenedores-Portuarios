import { useState, useEffect } from "react"
import { lotesAPI, contenedoresAPI, productosAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faFilter, faBox } from '@fortawesome/free-solid-svg-icons'

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />,
  Box: () => <FontAwesomeIcon icon={faBox} className="w-4 h-4" />
}

export default function LotesView() {
  const [lotes, setLotes] = useState([])
  const [contenedores, setContenedores] = useState([])
  const [productos, setProductos] = useState([]) // Ahora dinámico desde el backend
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroContenedor, setFiltroContenedor] = useState("Todos")
  const [formData, setFormData] = useState({
    id_contenedor: "",
    id_producto: "",
    cantidad: 1,
  })

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos()
  }, [])

  // Filtrar lotes por contenedor
  const lotesFiltrados = filtroContenedor === "Todos" 
    ? lotes 
    : lotes.filter(l => l.contenedor === filtroContenedor)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Cargar lotes, contenedores y productos en paralelo
      const [lotesResponse, contenedoresResponse, productosResponse] = await Promise.all([
        lotesAPI.obtenerTodos(),
        contenedoresAPI.obtenerTodos(),
        productosAPI.obtenerTodos()
      ])

      // Mapear lotes del backend al formato del frontend
      const lotesFormateados = lotesResponse.data.map(lote => ({
        id: lote.ID_LOTE, // id_lote
        id_contenedor: lote.ID_CONTENEDOR, // id_contenedor
        contenedor: lote.CODIGO_CONTENEDOR || "", // codigo_contenedor
        id_producto: lote.ID_PRODUCTO, // id_producto
        producto: lote.PRODUCTO_NOMBRE || "", // producto_nombre
        cantidad: lote.CANTIDAD || 0 // cantidad
      }))

      // Mapear contenedores para el selector
      const contenedoresFormateados = contenedoresResponse.data.map(contenedor => ({
        id: contenedor.ID_CONTENEDOR,
        codigo: contenedor.CODIGO_CONTENEDOR,
        cliente: contenedor.CLIENTE_NOMBRE || ""
      }))

      // Mapear productos para el selector
      const productosFormateados = productosResponse.data.map(producto => ({
        id: producto.ID_PRODUCTO,
        nombre: producto.NOMBRE,
        tipo: producto.TIPO_PRODUCTO || ""
      }))

      setLotes(lotesFormateados)
      setContenedores(contenedoresFormateados)
      setProductos(productosFormateados)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (lote) => {
    if (lote) {
      setFormData({
        id_contenedor: lote.id_contenedor,
        id_producto: lote.id_producto,
        cantidad: lote.cantidad
      })
      setEditingId(lote.id)
    } else {
      setFormData({ 
        id_contenedor: "",
        id_producto: "",
        cantidad: 1
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
      id_producto: "",
      cantidad: 1
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (editingId) {
        // Actualizar lote existente
        await lotesAPI.actualizar(editingId, formData)
      } else {
        // Crear nuevo lote
        await lotesAPI.crear(formData)
      }
      
      // Recargar la lista de lotes
      await cargarDatos()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar lote:', err)
      setError('Error al guardar el lote: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, contenedor, producto) => {
    if (!confirm(`¿Está seguro de que desea eliminar el lote de "${producto}" del contenedor "${contenedor}"?`)) {
      return
    }
    
    try {
      setError(null)
      await lotesAPI.eliminar(id)
      await cargarDatos()
    } catch (err) {
      console.error('Error al eliminar lote:', err)
      setError('Error al eliminar el lote: ' + err.message)
    }
  }

  // Obtener códigos únicos de contenedores para el filtro
  const contenedoresUnicos = ["Todos", ...new Set(lotes.map(l => l.contenedor).filter(c => c))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando lotes...</p>
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
          <p className="text-sm text-gray-600">Total de lotes: {lotesFiltrados.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {contenedoresUnicos.slice(0, 6).map((contenedor) => (
              <button
                key={contenedor}
                onClick={() => setFiltroContenedor(contenedor)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filtroContenedor === contenedor
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {contenedor === "Todos" && <IconComponents.Filter />}
                {contenedor}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleOpenModal()}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <IconComponents.Plus />
            Nuevo lote
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Lotes</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contenedor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Cantidad</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lotesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No hay lotes {filtroContenedor !== "Todos" ? `en el contenedor "${filtroContenedor}"` : "registrados"}
                    </td>
                  </tr>
                ) : (
                  lotesFiltrados.map((lote) => (
                    <tr key={lote.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-mono font-semibold">{lote.contenedor || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{lote.producto || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{lote.cantidad ? lote.cantidad.toLocaleString() : '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(lote)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(lote.id, lote.contenedor, lote.producto)}
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
                {editingId ? "Editar Lote" : "Nuevo Lote"}
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
                  <label className="text-sm font-medium text-gray-700">Producto *</label>
                  <select
                    required
                    value={formData.id_producto}
                    onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })}
                    placeholder="1"
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