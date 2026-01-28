import {HashRouter  as Router, Routes, Route} from 'react-router-dom'
import { Login } from '../pages/login'
import { Dashboard, Clientes, Contenedores, Lotes, Productos, Embarcaciones, Movimientos, Usuarios, Alertas, Reportes } from '../pages/principal'

export default function MyRoutes() {

    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Login />} />    
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/contenedores" element={<Contenedores />} />
                <Route path="/lotes" element={<Lotes />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/embarcaciones" element={<Embarcaciones />} />
                <Route path="/movimientos" element={<Movimientos />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/alertas" element={<Alertas />} />
                <Route path="/reportes" element={<Reportes />} />
            </Routes>
        </Router>
    )
}