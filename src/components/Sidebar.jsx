/**
 * Sidebar.jsx — Barra lateral del panel de control (taquillero y administrador).
 *
 * Características:
 *  - Fondo azul noche con degradado (bg-degradado-sidebar)
 *  - Logo SIVEC en la parte superior
 *  - Lista de links con icono + etiqueta; ítem activo con fondo violeta
 *  - Botón "Cerrar Sesión" en la parte inferior
 *  - En mobile: se oculta y hay un botón en el Topbar para abrirlo (overlay)
 *
 * Props:
 *  @param {Object[]} items — Array de { a, icono, etiqueta }
 *  @param {boolean} [abierto] — Controla visibilidad en mobile (manejado desde PanelLayout)
 *  @param {() => void} [onCerrar] — Cierra el sidebar en mobile
 */

import { NavLink, Link, useNavigate } from "react-router-dom"
import { Film, LogOut, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {{ a: string, icono: React.ReactNode, etiqueta: string }[]} props.items
 * @param {boolean} [props.abierto=true]
 * @param {() => void} [props.onCerrar]
 */
export default function Sidebar({ items = [], abierto = true, onCerrar }) {
  const { usuario, rol, logout } = useAuth()
  const navigate = useNavigate()

  const manejarLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <>
      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {abierto && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      {/* Panel del sidebar */}
      <aside
        className={cn(
          // Base: fijo en mobile, estático en desktop
          "fixed top-0 left-0 h-full z-30 w-64 flex flex-col",
          "bg-degradado-sidebar text-white",
          "transition-transform duration-300",
          // Mobile: oculto por defecto, visible cuando abierto=true
          abierto ? "translate-x-0" : "-translate-x-full",
          // Desktop: siempre visible
          "lg:static lg:translate-x-0"
        )}
        aria-label="Menú lateral del panel"
      >

        {/* ── Logo y botón cerrar (mobile) ───────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="SIVEC — Ir al inicio"
            onClick={onCerrar}
          >
            <div className="w-8 h-8 rounded-lg bg-degradado-violeta flex items-center justify-center">
              <Film className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-titulo font-extrabold italic text-xl text-white tracking-tight">
              SIVEC
            </span>
          </Link>
          {/* Botón cerrar — solo en mobile */}
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar menú lateral"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ── Info del usuario ───────────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-bold text-sm shrink-0">
              {usuario?.nombre?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-titulo font-semibold text-white truncate">
                {usuario?.nombre}
              </p>
              <p className="text-xs text-primario-claro capitalize font-cuerpo">
                {rol}
              </p>
            </div>
          </div>
        </div>

        {/* ── Links de navegación ────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Navegación del panel">
          <ul className="flex flex-col gap-1" role="list">
            {items.map((item) => (
              <li key={item.a + item.etiqueta}>
                <NavLink
                  to={item.a}
                  end={item.end}
                  onClick={onCerrar}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                      "text-sm font-cuerpo font-medium transition-all duration-150",
                      isActive
                        ? "bg-primario text-white shadow-boton"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    )
                  }
                  aria-label={item.etiqueta}
                >
                  <span
                    className="w-5 h-5 shrink-0 [&>svg]:w-5 [&>svg]:h-5"
                    aria-hidden="true"
                  >
                    {item.icono}
                  </span>
                  <span>{item.etiqueta}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Cerrar sesión ─────────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={manejarLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-cuerpo font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
