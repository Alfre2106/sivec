/**
 * Navbar.jsx — Barra de navegación superior para páginas públicas.
 *
 * Contenido: Logo SIVEC | Links (Inicio, Funciones, Eventos, Contacto) | Iniciar Sesión / Menú de usuario
 * Responsive: menú hamburguesa en mobile.
 *
 * Fiel a la imagen de referencia: fondo azul noche oscuro, link activo subrayado con violeta,
 * botón "Iniciar Sesión" con degradado violeta.
 */

import { useState } from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { Menu, X, User, ShoppingBag, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"
import Logo from "@/components/Logo"
import { cn } from "@/utils/cn"

// Links de navegación principal.
// Cada ruta debe ser única para que NavLink pueda determinar cuál está activa.
const LINKS_NAV = [
  { a: "/",          etiqueta: "Inicio",    end: true },
  { a: "/cartelera", etiqueta: "Cartelera", end: true },
  { a: "/eventos",   etiqueta: "Eventos",   end: true },
  { a: "/contacto",  etiqueta: "Contacto",  end: true },
]

export default function Navbar() {
  const { autenticado, usuario, rol, logout, cargandoSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const navigate = useNavigate()

  const cerrarMenus = () => {
    setMenuAbierto(false)
    setPerfilAbierto(false)
  }

  const manejarLogout = () => {
    logout()
    cerrarMenus()
    navigate("/")
  }

  // Destino del botón/avatar según rol
  const destioPanel = rol === "admin"
    ? "/panel/admin"
    : rol === "taquillero"
    ? "/panel/taquilla"
    : "/mis-compras"

  return (
    <nav
      className="bg-noche-oscuro text-white sticky top-0 z-30 shadow-sidebar"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center shrink-0"
            aria-label="SIVEC — Ir al inicio"
            onClick={cerrarMenus}
          >
            {/* En celulares muy angostos (≤340 px) el logo baja un poco para que quepa el botón de sesión */}
            <Logo tamaño="md" className="max-[340px]:h-10" />
          </Link>

          {/* ── Links de escritorio ───────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {LINKS_NAV.map((link) => (
              <li key={link.etiqueta}>
                <NavLink
                  to={link.a}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 rounded-lg text-sm font-cuerpo font-medium transition-colors duration-150",
                      isActive
                        ? "text-white border-b-2 border-primario-claro pb-1"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )
                  }
                >
                  {link.etiqueta}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Acciones del lado derecho ─────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {cargandoSesion ? (
              /* Validando la sesión guardada: evita el parpadeo de "Iniciar Sesión" */
              <div className="w-24 md:w-32 h-8 rounded-lg bg-white/10 animate-pulse" aria-hidden="true" />
            ) : !autenticado ? (
              /* Botón Iniciar Sesión: visible SIEMPRE (también en celular, fuera del menú
                 desplegable) para que el visitante sepa que debe iniciar sesión antes de comprar */
              <Button
                onClick={() => { navigate("/login"); cerrarMenus() }}
                tamaño="sm"
                className="px-3 text-xs sm:text-sm whitespace-nowrap"
                aria-label="Iniciar sesión"
              >
                <User className="w-4 h-4 hidden sm:block" aria-hidden="true" />
                Iniciar Sesión
              </Button>
            ) : (
              /* Menú de usuario autenticado */
              <div className="relative hidden md:block">
                <button
                  onClick={() => setPerfilAbierto((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-expanded={perfilAbierto}
                  aria-haspopup="true"
                  aria-label="Menú de usuario"
                >
                  {/* Avatar con inicial */}
                  <div className="w-7 h-7 rounded-full bg-degradado-violeta flex items-center justify-center text-xs font-titulo font-bold">
                    {usuario?.nombre?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm font-cuerpo font-medium text-white max-w-[100px] truncate">
                    {usuario?.nombre?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      perfilAbierto && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown */}
                {perfilAbierto && (
                  <>
                    {/* Cierra al hacer clic fuera */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setPerfilAbierto(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-sivec shadow-2xl border border-gray-100 z-20 animacion-entrada overflow-hidden">
                      {/* Info del usuario */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-titulo font-semibold text-gray-900 truncate">
                          {usuario?.nombre}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{rol}</p>
                      </div>

                      {/* Opciones */}
                      <div className="py-1">
                        <MenuLink
                          icono={<ShoppingBag />}
                          a={destioPanel}
                          onClick={cerrarMenus}
                        >
                          {rol === "cliente" ? "Mis Compras" : "Mi Panel"}
                        </MenuLink>
                        <MenuLink
                          icono={<User />}
                          a="/perfil"
                          onClick={cerrarMenus}
                        >
                          Mi Perfil
                        </MenuLink>
                        <button
                          onClick={manejarLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors font-cuerpo"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Botón hamburguesa (mobile) */}
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-expanded={menuAbierto}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            >
              {menuAbierto ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menú mobile ─────────────────────────────────────────────────────── */}
      {menuAbierto && (
        <div className="md:hidden border-t border-white/10 animacion-entrada">
          <ul className="px-4 py-3 flex flex-col gap-1" role="list">
            {LINKS_NAV.map((link) => (
              <li key={link.etiqueta}>
                <NavLink
                  to={link.a}
                  end={link.end}
                  onClick={cerrarMenus}
                  className={({ isActive }) =>
                    cn(
                      "block px-3 py-2 rounded-lg text-sm font-cuerpo transition-colors",
                      isActive
                        ? "bg-primario/20 text-primario-claro font-semibold"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  {link.etiqueta}
                </NavLink>
              </li>
            ))}

            {/* Con sesión: acceso al panel y cierre de sesión.
                (Sin sesión, "Iniciar Sesión" ya está visible en la barra superior.) */}
            {autenticado && !cargandoSesion && (
              <>
                <li className="h-px bg-white/10 my-1" aria-hidden="true" />
                <li>
                  <Link
                    to={destioPanel}
                    onClick={cerrarMenus}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors font-cuerpo"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    {rol === "cliente" ? "Mis Compras" : "Mi Panel"}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={manejarLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-red-900/20 transition-colors font-cuerpo"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}

// ── Componente auxiliar de link en dropdown ───────────────────────────────────
function MenuLink({ icono, a, onClick, children }) {
  return (
    <Link
      to={a}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primario-suave hover:text-primario transition-colors font-cuerpo"
    >
      <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
        {icono}
      </span>
      {children}
    </Link>
  )
}
