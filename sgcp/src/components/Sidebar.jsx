import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { removeUserFromStorage } from "../lib/auth"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShip, 
  faChartLine, 
  faUserGroup, 
  faBoxesStacked, 
  faUser, 
  faTriangleExclamation,
  faClipboardList,
  faTachometerAlt,
  faBars,
  faTimes,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/clientes", label: "Clientes", icon: "Users" },
  { href: "/contenedores", label: "Contenedores", icon: "Package" },
  { href: "/lotes", label: "Lotes", icon: "Package" },
  { href: "/productos", label: "Productos", icon: "Package" },
  { href: "/embarcaciones", label: "Embarcaciones", icon: "Ship" },
  { href: "/movimientos", label: "Movimientos", icon: "TrendingUp" },
  { href: "/usuarios", label: "Usuarios", icon: "Users" },
  { href: "/alertas", label: "Alertas", icon: "AlertTriangle" },
  { href: "/reportes", label: "Reportes", icon: "LayoutDashboard" },
]

const IconComponents = {
  LayoutDashboard: () => <FontAwesomeIcon icon={faTachometerAlt} className="w-5 h-5" />,
  Users: () => <FontAwesomeIcon icon={faUserGroup} className="w-5 h-5" />,
  Package: () => <FontAwesomeIcon icon={faBoxesStacked} className="w-5 h-5" />,
  Ship: () => <FontAwesomeIcon icon={faShip} className="w-5 h-5" />,
  TrendingUp: () => <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />,
  AlertTriangle: () => <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5" />,
  Menu: () => <FontAwesomeIcon icon={faBars} className="w-5 h-5" />,
  X: () => <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />,
  LogOut: () => <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    removeUserFromStorage()
    navigate("/")
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white"
      >
        {open ? <IconComponents.X /> : <IconComponents.Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white border-r border-gray-800 transition-transform duration-300 md:translate-x-0 z-40 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <IconComponents.Ship />
            </div>
            <div>
              <h1 className="font-bold text-lg">SGCP</h1>
              <p className="text-xs text-gray-400">Puerto</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = IconComponents[item.icon]
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <IconComponent />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <IconComponents.LogOut />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={() => setOpen(false)} />}
    </>
  )
}