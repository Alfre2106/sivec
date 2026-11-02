/**
 * Topbar.jsx — Barra superior del panel de control.
 *
 * Muestra:
 *  - Botón hamburguesa (abre el sidebar en mobile)
 *  - Título de la sección actual
 *  - Avatar del usuario con rol
 */

import { Menu } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

/**
 * @param {Object} props
 * @param {string} [props.titulo] — Título de la página actual
 * @param {() => void} props.onAbrirSidebar — Abre el sidebar en mobile
 */
export default function Topbar({ titulo = "Panel", onAbrirSidebar }) {
  const { usuario, rol } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
      {/* Botón hamburguesa — solo visible en mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAbrirSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú lateral"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Título */}
        <h1 className="font-titulo font-bold text-gray-900 text-base sm:text-lg">
          {titulo}
        </h1>
      </div>

      {/* Info del usuario */}
      <div className="flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-titulo font-semibold text-gray-800 truncate max-w-[120px]">
            {usuario?.nombre?.split(" ")[0]}
          </p>
          <p className="text-xs text-gray-500 capitalize">{rol}</p>
        </div>
        <div
          className="w-8 h-8 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-bold text-white text-sm"
          aria-hidden="true"
        >
          {usuario?.nombre?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  )
}
