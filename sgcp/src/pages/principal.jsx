import { LayoutWrapper } from "../components/LayoutWrapper"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserFromStorage } from "../lib/auth"

import MovimientosView from "../views/MovimientosView"
import UsuariosView from "../views/UsuariosView"
import ReportesView from "../views/ReportesView"
import AlertasView from "../views/AlertasView"
import ContenedoresView from "../views/ContenedoresView"
import EmbarcacionesView from "../views/EmbarcacionesView"
import DashboardView from "../views/DashboardView"
import ClientesView from "../views/ClientesView"
import LotesView from "../views/LotesView"
import ProductosView from "../views/ProductosView"

export function Clientes() {
    return (
        <LayoutWrapper title="Clientes">
            <ClientesView />
        </LayoutWrapper>
    )
}

export function Dashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = getUserFromStorage()
        if (!userData) {
            navigate("/")
        } else {
            setUser(userData)
        }
    }, [navigate])

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
    }

    return (
        <LayoutWrapper title="Dashboard">
            <DashboardView />
        </LayoutWrapper>
    )
}

export function Embarcaciones() {
    return (
        <LayoutWrapper title="Embarcaciones">
            <EmbarcacionesView />
        </LayoutWrapper>
    )
}

export function Contenedores() {
    return (
        <LayoutWrapper title="Contenedores">
            <ContenedoresView />
        </LayoutWrapper>
    )
}

export function Movimientos() {
    return (
        <LayoutWrapper title="Movimientos">
            <MovimientosView />
        </LayoutWrapper>
    )
}

export function Usuarios() {
    return (
        <LayoutWrapper title="Usuarios">
            <UsuariosView />
        </LayoutWrapper>
    )
}

export function Alertas() {
    return (
        <LayoutWrapper title="Alertas">
            <AlertasView />
        </LayoutWrapper>
    )
}

export function Lotes() {
    return (
        <LayoutWrapper title="Lotes">
            <LotesView />
        </LayoutWrapper>
    )
}

export function Productos() {
    return (
        <LayoutWrapper title="Productos">
            <ProductosView />
        </LayoutWrapper>
    )
}

export function Reportes() {
    return (
        <LayoutWrapper title="Reportes">
            <ReportesView />
        </LayoutWrapper>
    )
}