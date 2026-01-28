import { useState, useEffect } from "react"
import { usuariosAPI } from "../lib/api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faEdit, faTrash, faTimes, faFilter, faEye, faEyeSlash, faUserCheck, faUserTimes, faUndo } from '@fortawesome/free-solid-svg-icons'

const roles = ["admin", "operador", "viewer"]

const IconComponents = {
  Plus: () => <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />,
  Edit2: () => <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />,
  Trash2: () => <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  Filter: () => <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />,
  Eye: () => <FontAwesomeIcon icon={faEye} className="w-4 h-4" />,
  EyeSlash: () => <FontAwesomeIcon icon={faEyeSlash} className="w-4 h-4" />,
  UserCheck: () => <FontAwesomeIcon icon={faUserCheck} className="w-4 h-4" />,
  UserTimes: () => <FontAwesomeIcon icon={faUserTimes} className="w-4 h-4" />,
  Undo: () => <FontAwesomeIcon icon={faUndo} className="w-4 h-4" />
}

export default function UsuariosView() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroRol, setFiltroRol] = useState("Todos")
  const [filtroEstado, setFiltroEstado] = useState("Todos")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    usuario: "",
    rol: "operador",
    contraseña: "",
  })

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Filtrar usuarios por rol y estado
  const usuariosFiltrados = usuarios.filter(u => {
    const pasaFiltroRol = filtroRol === "Todos" || u.rol === filtroRol
    const pasaFiltroEstado = filtroEstado === "Todos" || u.estado === filtroEstado
    return pasaFiltroRol && pasaFiltroEstado
  })

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usuariosAPI.obtenerTodos()
      
      // Mapear los datos del backend al formato del frontend
      const usuariosFormateados = response.data.map(usuario => ({
        id: usuario.ID_USUARIO, // id_usuario
        usuario: usuario.NOMBRE_USUARIO, // nombre_usuario
        estado: usuario.ESTADO || "ACTIVO", // estado
        fecha_baja: usuario.FECHA_BAJA || null, // fecha_baja
        rol: usuario.ROL || "", // rol
      }))
      
      setUsuarios(usuariosFormateados)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setError('Error al cargar los usuarios: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getRolBadge = (rol) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      operador: "bg-blue-100 text-blue-700",
      viewer: "bg-gray-100 text-gray-700"
    }
    return colors[rol] || "bg-gray-100 text-gray-700"
  }

  const getEstadoBadge = (estado) => {
    return estado === "ACTIVO" 
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700"
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleCambiarEstado = async (id, usuarioNombre, estadoActual) => {
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO"
    const accion = nuevoEstado === "ACTIVO" ? "reactivar" : "desactivar"
    
    if (!confirm(`¿Está seguro de que desea ${accion} el usuario "${usuarioNombre}"?`)) {
      return
    }
    
    try {
      setError(null)
      await usuariosAPI.eliminar(id)
      await cargarUsuarios()
    } catch (err) {
      console.error(`Error al ${accion} usuario:`, err)
      setError(`Error al ${accion} el usuario: ` + err.message)
    }
  }

  const handleOpenModal = (usuario) => {
    if (usuario) {
      setFormData({
        usuario: usuario.usuario,
        rol: usuario.rol,
        contraseña: "", // No mostrar contraseña existente
      })
      setEditingId(usuario.id)
    } else {
      setFormData({ usuario: "", rol: "operador", contraseña: "" })
      setEditingId(null)
    }
    setIsModalOpen(true)
    setShowPassword(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ usuario: "", rol: "operador", contraseña: "" })
    setShowPassword(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Validar que se proporcione contraseña para nuevos usuarios
      if (!editingId && !formData.contraseña) {
        setError('La contraseña es requerida para nuevos usuarios')
        return
      }
      
      if (editingId) {
        // Actualizar usuario existente
        await usuariosAPI.actualizar(editingId, formData)
      } else {
        // Crear nuevo usuario
        await usuariosAPI.crear(formData)
      }
      
      // Recargar la lista de usuarios
      await cargarUsuarios()
      handleCloseModal()
      
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      setError('Error al guardar el usuario: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, usuario) => {
    if (!confirm(`¿Está seguro de que desea eliminar permanentemente el usuario "${usuario}"?`)) {
      return
    }
    
    try {
      setError(null)
      await usuariosAPI.eliminar(id)
      await cargarUsuarios()
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      setError('Error al eliminar el usuario: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
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
                onClick={cargarUsuarios}
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
          <p className="text-sm text-gray-600">Total de usuarios: {usuariosFiltrados.length}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filtros por Estado */}
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
            <button
              onClick={() => setFiltroEstado("ACTIVO")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                filtroEstado === "ACTIVO"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <IconComponents.UserCheck />
              Activos
            </button>
            <button
              onClick={() => setFiltroEstado("INACTIVO")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-1 ${
                filtroEstado === "INACTIVO"
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <IconComponents.UserTimes />
              Inactivos
            </button>
          </div>
          
          {/* Filtros por Rol */}
          <div className="flex gap-1">
            <button
              onClick={() => setFiltroRol("Todos")}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                filtroRol === "Todos"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              Todos los roles
            </button>
            {roles.map((rol) => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  filtroRol === rol
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {rol}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <IconComponents.Plus />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Fecha Baja</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No hay usuarios que coincidan con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((usuario) => (
                    <tr 
                      key={usuario.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        usuario.estado === "INACTIVO" ? "bg-gray-50 opacity-75" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-gray-900 font-mono">{usuario.usuario}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getRolBadge(usuario.rol)}`}
                        >
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(usuario.estado)}`}
                        >
                          {usuario.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {usuario.fecha_baja ? formatearFecha(usuario.fecha_baja) : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(usuario)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <IconComponents.Edit2 />
                          </button>
                          
                          {/* Botón dinámico que cambia según el estado del usuario */}
                          <button
                            onClick={() => handleCambiarEstado(usuario.id, usuario.usuario, usuario.estado)}
                            className={`p-2 rounded-lg transition-colors ${
                              usuario.estado === "ACTIVO" 
                                ? "hover:bg-red-50 text-red-600" 
                                : "hover:bg-green-50 text-green-600"
                            }`}
                            title={usuario.estado === "ACTIVO" ? "Desactivar usuario" : "Reactivar usuario"}
                          >
                            {usuario.estado === "ACTIVO" ? (
                              <IconComponents.Trash2 />
                            ) : (
                              <IconComponents.Undo />
                            )}
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
                {editingId ? "Editar Usuario" : "Nuevo Usuario"}
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
                  <label className="text-sm font-medium text-gray-700">Usuario *</label>
                  <input
                    required
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    placeholder="usuario123"
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    disabled={submitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 disabled:bg-gray-100"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contraseña {editingId ? "(opcional - dejar vacío para mantener)" : "*"}
                  </label>
                  <div className="relative">
                    <input
                      required={!editingId}
                      type={showPassword ? "text" : "password"}
                      value={formData.contraseña}
                      onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                      placeholder={editingId ? "Nueva contraseña (opcional)" : "Contraseña"}
                      disabled={submitting}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={submitting}
                    >
                      {showPassword ? <IconComponents.EyeSlash /> : <IconComponents.Eye />}
                    </button>
                  </div>
                  {editingId && (
                    <p className="text-xs text-gray-500">Si no se especifica, se mantendrá la contraseña actual</p>
                  )}
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