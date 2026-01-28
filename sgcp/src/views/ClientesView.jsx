import { useState, useEffect } from "react"
import { clientesAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
}

export default function ClientesView() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    empresa: "",
    representante: "",
    contacto: "",
    email: "",
  })

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await clientesAPI.obtenerTodos()
      
      // Mapear los datos del backend al formato del frontend
      const clientesFormateados = response.data.map(cliente => ({
        id: cliente.ID_CLIENTE,
        empresa: cliente.NOMBRE_EMPRESA, 
        representante: cliente.REPRESENTANTE || "", 
        contacto: cliente.CONTACTO || "",
        email: ""
      }))
      
      setClientes(clientesFormateados)
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError('Error al cargar los clientes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (cliente) => {
    if (cliente) {
      setFormData({
        empresa: cliente.empresa,
        representante: cliente.representante,
        contacto: cliente.contacto,
        email: cliente.email
      })
      setEditingId(cliente.id)
    } else {
      setFormData({ empresa: "", representante: "", contacto: "", email: "" })
      setEditingId(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ empresa: "", representante: "", contacto: "", email: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      if (editingId) {
        // Actualizar cliente existente
        await clientesAPI.actualizar(editingId, formData)
      } else {
        // Crear nuevo cliente
        await clientesAPI.crear(formData)
      }
      
      // Recargar la lista de clientes
      await cargarClientes()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar cliente:', err)
      setError('Error al guardar el cliente: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, empresa) => {
    if (!confirm(`¿Está seguro de que desea eliminar el cliente "${empresa}"?`)) {
      return
    }
    
    try {
      setError(null)
      await clientesAPI.eliminar(id)
      await cargarClientes()
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      setError('Error al eliminar el cliente: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
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
                onClick={cargarClientes}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total de clientes: {clientes.length}</p>
        <button
          onClick={() => handleOpenModal()}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <IconComponents.Plus />
          Nuevo cliente
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Empresa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Representante</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Contacto</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No hay clientes registrados
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">{cliente.empresa}</td>
                      <td className="py-3 px-4 text-gray-700">{cliente.representante || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{cliente.contacto || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(cliente)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id, cliente.empresa)}
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
                {editingId ? "Editar Cliente" : "Nuevo Cliente"}
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
                  <label className="text-sm font-medium text-gray-700">Empresa *</label>
                  <input
                    required
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="Nombre de la empresa"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Representante</label>
                  <input
                    type="text"
                    value={formData.representante}
                    onChange={(e) => setFormData({ ...formData, representante: e.target.value })}
                    placeholder="Nombre del representante"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contacto</label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    placeholder="+56 9 1234 5678"
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