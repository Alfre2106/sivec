/**
 * AppRoutes.jsx — Definición completa del árbol de rutas de SIVEC.
 *
 * Estructura:
 *  / (público)     → PublicLayout
 *  /panel/taquilla → PanelLayout + ProtectedRoute(taquillero)
 *  /panel/admin    → PanelLayout + ProtectedRoute(admin)
 *
 * Las páginas reales se agregarán en Fases 2, 3 y 4.
 * Por ahora cada ruta renderiza un placeholder visible.
 */

import { Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "@/layouts/PublicLayout"
import PanelLayout from "@/layouts/PanelLayout"
import ProtectedRoute from "./ProtectedRoute"

// ── Páginas placeholder (se reemplazarán en cada fase) ───────────────────────
const Placeholder = ({ titulo, descripcion }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8 animacion-entrada">
    <div className="w-14 h-14 rounded-full bg-primario-suave flex items-center justify-center text-2xl">
      🎬
    </div>
    <h2 className="font-titulo text-2xl font-bold text-gray-800">{titulo}</h2>
    <p className="text-gray-500 text-sm font-cuerpo">{descripcion ?? "Próximamente..."}</p>
    <span className="text-xs bg-primario-suave text-primario px-3 py-1 rounded-full font-cuerpo">
      En construcción
    </span>
  </div>
)

// ── Importaciones de páginas existentes ──────────────────────────────────────
import Demo from "@/pages/public/Demo"
import Componentes from "@/pages/public/Componentes"

// ── Importaciones de páginas reales (se irán descomentando en cada fase) ─────
// Fase 2 — Cliente / Público:
// import Landing          from "@/pages/public/Landing"
// import Login            from "@/pages/public/Login"
// import Registro         from "@/pages/public/Registro"
// import Cartelera        from "@/pages/cliente/Cartelera"
// import SeleccionAsientos from "@/pages/cliente/SeleccionAsientos"
// import Reserva          from "@/pages/cliente/Reserva"
// import ResumenCompra    from "@/pages/cliente/ResumenCompra"
// import Pago             from "@/pages/cliente/Pago"
// import EntradaQR        from "@/pages/cliente/EntradaQR"
// import MisCompras       from "@/pages/cliente/MisCompras"
// import Perfil           from "@/pages/cliente/Perfil"

// Fase 3 — Taquilla:
// import VentaTaquilla    from "@/pages/taquilla/VentaTaquilla"
// import ValidarEntrada   from "@/pages/taquilla/ValidarEntrada"
// import HistorialVentas  from "@/pages/taquilla/HistorialVentas"

// Fase 4 — Admin:
// import Dashboard        from "@/pages/admin/Dashboard"
// import Funciones        from "@/pages/admin/Funciones"
// import Salas            from "@/pages/admin/Salas"
// import Usuarios         from "@/pages/admin/Usuarios"
// import Reportes         from "@/pages/admin/Reportes"

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Rutas públicas / cliente ─────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route index element={<Placeholder titulo="Landing — Inicio" descripcion="Fase 2" />} />
        {/* Página de demostración de componentes (Fase 1) */}
        <Route path="demo" element={<Demo />} />
        <Route path="componentes" element={<Componentes />} />
        {/* Rutas de Navbar que necesitan existir para que isActive funcione */}
        <Route path="eventos" element={<Placeholder titulo="Eventos" descripcion="Fase 2" />} />
        <Route path="contacto" element={<Placeholder titulo="Contacto" descripcion="Fase 2" />} />
        <Route path="login" element={<Placeholder titulo="Iniciar Sesión" descripcion="Fase 2" />} />
        <Route path="registro" element={<Placeholder titulo="Registro de Cliente" descripcion="Fase 2" />} />
        <Route path="cartelera" element={<Placeholder titulo="Cartelera" descripcion="Fase 2" />} />
        <Route path="funcion/:id/asientos" element={<Placeholder titulo="Selección de Asientos" descripcion="Fase 2" />} />
        <Route path="reserva" element={<Placeholder titulo="Reserva" descripcion="Fase 2" />} />
        <Route path="resumen" element={<Placeholder titulo="Resumen de Compra" descripcion="Fase 2" />} />
        <Route path="pago" element={<Placeholder titulo="Pago Simulado" descripcion="Fase 2" />} />
        <Route path="entrada/:id" element={<Placeholder titulo="Entrada con QR" descripcion="Fase 2" />} />
        <Route
          path="mis-compras"
          element={
            <ProtectedRoute rolesPermitidos={["cliente"]}>
              <Placeholder titulo="Mis Compras" descripcion="Fase 2" />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute rolesPermitidos={["cliente", "taquillero", "admin"]}>
              <Placeholder titulo="Perfil" descripcion="Fase 2" />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ── Rutas del panel de taquilla ──────────────────────────────────── */}
      <Route
        path="panel/taquilla"
        element={
          <ProtectedRoute rolesPermitidos={["taquillero"]}>
            <PanelLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Placeholder titulo="Venta en Taquilla" descripcion="Fase 3" />} />
        <Route path="validar" element={<Placeholder titulo="Validar Entrada" descripcion="Fase 3" />} />
        <Route path="historial" element={<Placeholder titulo="Historial de Ventas" descripcion="Fase 3" />} />
      </Route>

      {/* ── Rutas del panel de administrador ─────────────────────────────── */}
      <Route
        path="panel/admin"
        element={
          <ProtectedRoute rolesPermitidos={["admin"]}>
            <PanelLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Placeholder titulo="Dashboard" descripcion="Fase 4" />} />
        <Route path="funciones" element={<Placeholder titulo="Gestión de Funciones" descripcion="Fase 4" />} />
        <Route path="salas" element={<Placeholder titulo="Gestión de Salas" descripcion="Fase 4" />} />
        <Route path="usuarios" element={<Placeholder titulo="Gestión de Usuarios" descripcion="Fase 4" />} />
        <Route path="reportes" element={<Placeholder titulo="Reportes" descripcion="Fase 4" />} />
      </Route>

      {/* Ruta no encontrada → inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
