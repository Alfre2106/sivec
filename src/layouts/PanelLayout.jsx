/**
 * PanelLayout.jsx — Layout para el panel de control (taquillero y administrador).
 *
 * Estructura:
 *  - Sidebar oscuro (fijo en desktop, overlay en mobile)
 *  - Topbar con botón hamburguesa y nombre de sección
 *  - Área de contenido scrollable
 *
 * El Sidebar muestra items según el rol del usuario (taquillero / admin).
 */

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import { useAuth } from "@/context/AuthContext"
import { MENU_TAQUILLA, MENU_ADMIN } from "@/routes/menuConfig"

/**
 * Obtiene el título de la página actual a partir de la ruta.
 * @param {string} pathname
 * @param {Object[]} items
 * @returns {string}
 */
function obtenerTitulo(pathname, items) {
  const item = items.find((i) => pathname === i.a || pathname.startsWith(i.a + "/"))
  return item?.etiqueta ?? "Panel"
}

export default function PanelLayout() {
  const { rol } = useAuth()
  const { pathname } = useLocation()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  // Seleccionar el menú según el rol
  const items = rol === "admin" ? MENU_ADMIN : MENU_TAQUILLA
  const titulo = obtenerTitulo(pathname, items)

  return (
    <div className="min-h-screen flex bg-fondo-panel font-cuerpo">

      {/* Sidebar (fijo desktop / overlay mobile) */}
      <Sidebar
        items={items}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Columna principal */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <Topbar
          titulo={titulo}
          onAbrirSidebar={() => setSidebarAbierto(true)}
        />

        {/* Contenido de la ruta activa */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
