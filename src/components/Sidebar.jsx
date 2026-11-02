/**
 * Sidebar.jsx — Barra lateral del panel de control (taquillero y administrador).
 *
 * Desktop: parte del flujo flex normal, ancho fijo w-60, ocupa toda la altura.
 * Mobile:  overlay deslizante desde la izquierda.
 */

import { NavLink, Link, useNavigate } from "react-router-dom"
import { LogOut, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Logo from "@/components/Logo"
import { cn } from "@/utils/cn"

export default function Sidebar({ items = [], abierto = true, onCerrar }) {
  const { usuario, rol, logout } = useAuth()
  const navigate = useNavigate()

  const manejarLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <>
      {/* Overlay en mobile */}
      {abierto && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      {/* ── Panel del sidebar ──────────────────────────────────────────────── */}
      <aside
        className={cn(
          // Mobile: fijo, se desliza; Desktop: estático dentro del flex
          "fixed inset-y-0 left-0 z-30",
          "lg:relative lg:inset-auto lg:z-auto",
          // Ancho: 220 px es suficiente para todos los labels sin recorte
          "w-[220px] flex-shrink-0",
          // Fondo y color
          "bg-degradado-sidebar text-white flex flex-col",
          // Alto completo en ambos modos
          "h-full lg:h-screen",
          // Transición de entrada/salida en mobile
          "transition-transform duration-300 ease-in-out",
          abierto ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
        aria-label="Menú lateral del panel"
      >

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
          <Link
            to="/"
            className="flex items-center min-w-0"
            aria-label="SIVEC — Ir al inicio"
            onClick={onCerrar}
          >
            <Logo tamaño="md" />
          </Link>
          {/* Botón cerrar — solo mobile */}
          <button
            onClick={onCerrar}
            className="lg:hidden shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* ── Usuario ────────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-bold text-sm shrink-0">
              {usuario?.nombre?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-titulo font-semibold text-white truncate leading-tight">
                {usuario?.nombre}
              </p>
              <p className="text-xs text-primario-claro capitalize font-cuerpo leading-tight">
                {rol}
              </p>
            </div>
          </div>
        </div>

        {/* ── Navegación ─────────────────────────────────────────────────── */}
        <nav
          className="flex-1 px-2 py-3 overflow-y-auto"
          aria-label="Navegación del panel"
        >
          <ul className="flex flex-col gap-0.5" role="list">
            {items.map((item) => (
              <li key={item.a + item.etiqueta}>
                <NavLink
                  to={item.a}
                  end={item.end}
                  onClick={onCerrar}
                  className={({ isActive }) =>
                    cn(
                      // Usamos nowrap para que el texto nunca se corte
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
                      "text-sm font-cuerpo font-medium transition-all duration-150",
                      "whitespace-nowrap overflow-hidden",
                      isActive
                        ? "bg-primario text-white shadow-boton"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    )
                  }
                  aria-label={item.etiqueta}
                >
                  <span
                    className="shrink-0 [&>svg]:w-[18px] [&>svg]:h-[18px]"
                    aria-hidden="true"
                  >
                    {item.icono}
                  </span>
                  <span className="truncate">{item.etiqueta}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Cerrar sesión ──────────────────────────────────────────────── */}
        <div className="px-2 py-3 border-t border-white/10 shrink-0">
          <button
            onClick={manejarLogout}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl",
              "text-sm font-cuerpo font-medium whitespace-nowrap",
              "text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150"
            )}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
