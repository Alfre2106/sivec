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
      {/* Enlace para saltar al contenido (accesibilidad con teclado) */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50
                   focus:bg-primario focus:text-white focus:px-4 focus:py-2 focus:rounded-boton
                   focus:font-cuerpo focus:text-sm"
      >
        Saltar al contenido
      </a>

      {/* Barra de navegación superior */}
      <Navbar />

      {/* Contenido de la página activa */}
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  )
}
