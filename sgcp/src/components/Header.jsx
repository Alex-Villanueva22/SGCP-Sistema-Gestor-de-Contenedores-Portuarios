import { useNavigate } from "react-router-dom"
import { removeUserFromStorage } from "../lib/auth"

export function Header({ title }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    removeUserFromStorage()
    navigate("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="text-sm font-medium">Logout</span>
      </button>
    </header>
  )
}