import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShip } from "@fortawesome/free-solid-svg-icons"
import { setUserInStorage } from "../lib/auth"
import { usuariosAPI } from "../lib/api"

export function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        // Validar campos requeridos
        if (!username.trim() || !password.trim()) {
            setError("Usuario y contraseña son requeridos")
            return
        }

        setLoading(true)

        try {
            // Llamar a la API de login
            const response = await usuariosAPI.login(username.trim(), password)
            
            if (response.ok && response.data) {
                // Guardar usuario en localStorage
                setUserInStorage(response.data)
                
                // Redirigir al dashboard
                navigate("/dashboard")
            } else {
                setError("Usuario o contraseña incorrectos")
            }
        } catch (err) {
            console.error("Error en login:", err)
            setError(err.message || "Error al iniciar sesión. Verifique sus credenciales.")
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSubmit(e)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md shadow-lg border border-gray-200 bg-white rounded-lg">
                {/* Header */}
                <div className="space-y-4 text-center p-8 pb-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                            <FontAwesomeIcon icon={faShip} className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">SGCP</h1>
                        <p className="text-gray-600 text-base mt-1">Sistema de Gestión de Contenedores Portuarios</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                onKeyPress={handleKeyPress}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">
                            Ingrese sus credenciales para acceder al sistema
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}