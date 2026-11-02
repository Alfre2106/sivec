/**
 * PanelLayout.jsx — Layout para el panel de control (taquillero y administrador).
 * Sidebar oscuro a la izquierda + área de contenido a la derecha.
 * El contenido se renderiza en el <Outlet />.
 */

import { Outlet } from "react-router-dom"

// TODO (Fase 1): Importar Sidebar y Topbar reales
// import Sidebar from "@/components/Sidebar"
// import Topbar from "@/components/Topbar"

export default function PanelLayout() {
  return (
    <div className="min-h-screen flex bg-fondo-panel font-cuerpo">
      {/* Sidebar — se implementará en Fase 1 */}
      <aside className="w-64 bg-degradado-sidebar text-white p-4 shrink-0 hidden md:flex flex-col">
        <div className="font-titulo font-extrabold text-xl italic mb-8 text-primario-claro">
          🎬 SIVEC
        </div>
        <p className="text-xs text-gray-400">Sidebar (Fase 1)</p>
      </aside>

      {/* Área de contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — se implementará en Fase 1 */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-500 font-cuerpo">Panel SIVEC — Topbar (Fase 1)</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
