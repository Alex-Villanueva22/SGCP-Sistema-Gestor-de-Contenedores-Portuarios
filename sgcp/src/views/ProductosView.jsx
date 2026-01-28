import { useState, useEffect } from "react"
import { productosAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faFilter, faTag } from '@fortawesome/free-solid-svg-icons'

const tiposProducto = ["Alimento", "Inmueble", "Tecnología", "Ropa", "Insumo"]

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />,
  Tag: () => <FontAwesomeIcon icon={faTag} className="w-4 h-4" />
}

export default function ProductosView() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo_producto: "Pescado",
    valor_estimado: 0,
  })

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos()
  }, [])

  // Filtrar productos por tipo
  const productosFiltrados = filtroTipo === "Todos" 
    ? productos 
    : productos.filter(p => p.tipo_producto === filtroTipo)

  const cargarProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productosAPI.obtenerTodos()
      
      // Mapear los datos del backend al formato del frontend
      const productosFormateados = response.data.map(producto => ({
        id: producto.ID_PRODUCTO, // id_producto
        nombre: producto.NOMBRE, // nombre
        descripcion: producto.DESCRIPCION || "", // descripcion
        tipo_producto: producto.TIPO_PRODUCTO || "", // tipo_producto
        valor_estimado: producto.VALOR_ESTIMADO || 0 // valor_estimado
      }))
      
      setProductos(productosFormateados)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError('Error al cargar los productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTipoProductoBadge = (tipo) => {
    const colors = {
      "Pescado": "bg-blue-100 text-blue-700",
      "Marisco": "bg-orange-100 text-orange-700",
      "Conserva": "bg-yellow-100 text-yellow-700",
      "Congelado": "bg-cyan-100 text-cyan-700",
      "Fresco": "bg-green-100 text-green-700"
    }
    return colors[tipo] || "bg-gray-100 text-gray-700"
  }

  const handleOpenModal = (producto) => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        tipo_producto: producto.tipo_producto,
        valor_estimado: producto.valor_estimado
      })
      setEditingId(producto.id)
    } else {
      setFormData({ 
        nombre: "", 
        descripcion: "", 
        tipo_producto: "Pescado", 
        valor_estimado: 0 
      })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ 
      nombre: "", 
      descripcion: "", 
      tipo_producto: "Pescado", 
      valor_estimado: 0 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (editingId) {
        // Actualizar producto existente
        await productosAPI.actualizar(editingId, formData)
      } else {
        // Crear nuevo producto
        await productosAPI.crear(formData)
      }
      
      // Recargar la lista de productos
      await cargarProductos()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar producto:', err)
      setError('Error al guardar el producto: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto "${nombre}"?`)) {
      return
    }
    
    try {
      setError(null)
      await productosAPI.eliminar(id)
      await cargarProductos()
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      setError('Error al eliminar el producto: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
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
                onClick={cargarProductos}
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
          <p className="text-sm text-gray-600">Total de productos: {productosFiltrados.length}</p>
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
            {tiposProducto.map((tipo) => (
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
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Catálogo de Productos</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Descripción</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Valor Estimado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No hay productos {filtroTipo !== "Todos" ? `del tipo "${filtroTipo}"` : "registrados"}
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">{producto.nombre}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoProductoBadge(producto.tipo_producto)}`}
                        >
                          {producto.tipo_producto || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">{producto.descripcion || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {producto.valor_estimado ? `$${producto.valor_estimado.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(producto)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id, producto.nombre)}
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
                {editingId ? "Editar Producto" : "Nuevo Producto"}
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
                    placeholder="Ej: Salmón Atlántico"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={formData.tipo_producto}
                    onChange={(e) => setFormData({ ...formData, tipo_producto: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    {tiposProducto.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del producto"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Valor Estimado ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
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