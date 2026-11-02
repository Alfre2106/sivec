/**
 * AppRoutes.jsx — Árbol de rutas completo de SIVEC.
 */

import { Routes, Route, Navigate } from "react-router-dom"
import PublicLayout   from "@/layouts/PublicLayout"
import PanelLayout    from "@/layouts/PanelLayout"
import ProtectedRoute from "./ProtectedRoute"

// ── Páginas públicas ──────────────────────────────────────────────────────────
import Landing   from "@/pages/public/Landing"
import Login     from "@/pages/public/Login"
import Registro  from "@/pages/public/Registro"
import Demo      from "@/pages/public/Demo"
import Componentes from "@/pages/public/Componentes"
import NoEncontrado from "@/pages/public/NoEncontrado"
import Eventos   from "@/pages/public/Eventos"
import Contacto  from "@/pages/public/Contacto"

// ── Páginas del cliente (Fase 2) ──────────────────────────────────────────────
import Cartelera        from "@/pages/cliente/Cartelera"
import SeleccionAsientos from "@/pages/cliente/SeleccionAsientos"
import ResumenCompra    from "@/pages/cliente/ResumenCompra"
import Pago             from "@/pages/cliente/Pago"
import EntradaQR        from "@/pages/cliente/EntradaQR"
import MisCompras       from "@/pages/cliente/MisCompras"
import Perfil           from "@/pages/cliente/Perfil"

// ── Páginas de taquilla (Fase 3) ─────────────────────────────────────────────
import VentaTaquilla  from "@/pages/taquilla/VentaTaquilla"
import ValidarEntrada from "@/pages/taquilla/ValidarEntrada"
import HistorialVentas from "@/pages/taquilla/HistorialVentas"

// ── Páginas de administración (Fase 4) ───────────────────────────────────────
import Dashboard from "@/pages/admin/Dashboard"
import Funciones from "@/pages/admin/Funciones"
import Salas     from "@/pages/admin/Salas"
import Usuarios  from "@/pages/admin/Usuarios"
import Reportes  from "@/pages/admin/Reportes"
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Públicas / Cliente ────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route index          element={<Landing />} />
        <Route path="login"   element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="cartelera" element={<Cartelera />} />
        <Route path="eventos"   element={<Eventos />} />
        <Route path="contacto"  element={<Contacto />} />
        <Route path="demo"      element={<Demo />} />
        <Route path="componentes" element={<Componentes />} />

        <Route path="funcion/:id/asientos" element={<SeleccionAsientos />} />
        <Route path="resumen"              element={<ResumenCompra />} />
        <Route path="pago"                 element={<Pago />} />
        <Route path="entrada/:id"          element={<EntradaQR />} />

        <Route
          path="mis-compras"
          element={
            <ProtectedRoute rolesPermitidos={["cliente"]}>
              <MisCompras />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute rolesPermitidos={["cliente", "taquillero", "admin"]}>
              <Perfil />
            </ProtectedRoute>
          }
        />
        {/* 404 dentro del layout público (con navbar y footer) */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>

      {/* ── Panel Taquillero ──────────────────────────────────────────────── */}
      <Route
        path="panel/taquilla"
        element={
          <ProtectedRoute rolesPermitidos={["taquillero"]}>
            <PanelLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<VentaTaquilla />} />
        <Route path="validar" element={<ValidarEntrada />} />
        <Route path="historial" element={<HistorialVentas />} />
      </Route>

      {/* ── Panel Administrador ───────────────────────────────────────────── */}
      <Route
        path="panel/admin"
        element={
          <ProtectedRoute rolesPermitidos={["admin"]}>
            <PanelLayout />
          </ProtectedRoute>
        }
      >
        <Route index             element={<Dashboard />} />
        <Route path="funciones"  element={<Funciones />} />
        <Route path="salas"      element={<Salas />} />
        <Route path="usuarios"   element={<Usuarios />} />
        <Route path="reportes"   element={<Reportes />} />
      </Route>

      {/* 404 → inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
