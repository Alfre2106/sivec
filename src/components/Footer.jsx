/**
 * Footer.jsx — Pie de página para el layout público.
 *
 * Fondo azul noche, logo, links rápidos y copyright.
 */

import { Link } from "react-router-dom"
import { Film, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const año = new Date().getFullYear()

  return (
    <footer
      className="bg-noche-oscuro text-gray-400 font-cuerpo"
      aria-label="Pie de página"
    >
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

          {/* Logo y descripción */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-degradado-violeta flex items-center justify-center">
                <Film className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-titulo font-extrabold italic text-xl text-white">
                SIVEC
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Sistema de Venta de Entradas para Eventos y Cine. Compra, reserva
              y disfruta tus películas y eventos favoritos.
            </p>
          </div>

          {/* Links rápidos */}
          <nav aria-label="Links rápidos del footer">
            <h3 className="font-titulo font-semibold text-white text-sm mb-3 uppercase tracking-wide">
              Links Rápidos
            </h3>
            <ul className="flex flex-col gap-2 text-sm" role="list">
              {[
                { a: "/", etiqueta: "Inicio" },
                { a: "/cartelera", etiqueta: "Cartelera" },
                { a: "/login", etiqueta: "Iniciar Sesión" },
                { a: "/registro", etiqueta: "Registrarse" },
              ].map((link) => (
                <li key={link.etiqueta}>
                  <Link
                    to={link.a}
                    className="hover:text-primario-claro transition-colors"
                  >
                    {link.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 className="font-titulo font-semibold text-white text-sm mb-3 uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="flex flex-col gap-2 text-sm" role="list">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primario-claro shrink-0" aria-hidden="true" />
                <span>contacto@sivec.edu.co</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primario-claro shrink-0" aria-hidden="true" />
                <span>(605) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primario-claro shrink-0" aria-hidden="true" />
                <span>Universidad — Ing. de Sistemas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra de copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {año} SIVEC. Proyecto universitario — Ingeniería de Sistemas.</p>
          <p className="text-gray-600">Semestre VIII • Datos simulados, sin valor comercial.</p>
        </div>
      </div>
    </footer>
  )
}
