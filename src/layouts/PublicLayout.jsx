/**
 * PublicLayout.jsx — Layout para páginas públicas y del cliente.
 * Incluye la Navbar superior y un footer simple.
 * El contenido se renderiza en el <Outlet />.
 */

import { Outlet } from "react-router-dom"

// TODO (Fase 1): Importar Navbar y Footer reales
// import Navbar from "@/components/Navbar"
// import Footer from "@/components/Footer"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-fondo font-cuerpo">
      {/* Navbar — se implementará en Fase 1 */}
      <header className="bg-noche-oscuro text-white p-4 text-center font-titulo text-sm">
        🎬 SIVEC — Navbar (Fase 1)
      </header>

      {/* Contenido de la página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-noche-oscuro text-gray-400 py-4 text-center text-xs font-cuerpo">
        © {new Date().getFullYear()} SIVEC — Sistema de Venta de Entradas para Eventos/Cine
      </footer>
    </div>
  )
}
