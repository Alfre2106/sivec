/**
 * PublicLayout.jsx — Layout para páginas públicas y del cliente.
 * Incluye la Navbar superior y el Footer.
 * El contenido de cada página se renderiza en el <Outlet />.
 */

import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-fondo font-cuerpo">
      {/* Barra de navegación superior */}
      <Navbar />

      {/* Contenido de la página activa */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  )
}
