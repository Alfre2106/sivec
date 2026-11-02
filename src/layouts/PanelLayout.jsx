/**
 * PanelLayout.jsx — Layout del panel de control.
 *
 * Desktop: sidebar estático a la izquierda dentro del flex + contenido a la derecha.
 * Mobile:  sidebar como overlay (controlado por sidebarAbierto).
 */

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "@/components/Sidebar"
import Topbar  from "@/components/Topbar"
import { useAuth } from "@/context/AuthContext"
import { MENU_TAQUILLA, MENU_ADMIN } from "@/routes/menuConfig"

function obtenerTitulo(pathname, items) {
  const item = items.find((i) => pathname === i.a || pathname.startsWith(i.a + "/"))
  return item?.etiqueta ?? "Panel"
}

export default function PanelLayout() {
  const { rol } = useAuth()
  const { pathname } = useLocation()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  const items  = rol === "admin" ? MENU_ADMIN : MENU_TAQUILLA
  const titulo = obtenerTitulo(pathname, items)

  return (
    // h-screen + overflow-hidden para que sidebar y contenido tengan exactamente la altura de la ventana
    <div className="h-screen flex overflow-hidden bg-fondo-panel font-cuerpo">

      {/* Sidebar — en desktop ocupa su ancho fijo; en mobile es overlay */}
      <Sidebar
        items={items}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      {/* Columna principal: ocupa el resto del ancho */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          titulo={titulo}
          onAbrirSidebar={() => setSidebarAbierto(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
