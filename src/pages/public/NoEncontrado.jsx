/**
 * NoEncontrado.jsx — Página 404 para rutas inexistentes.
 */

import { Link } from "react-router-dom"
import { Home, Film } from "lucide-react"

export default function NoEncontrado() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 gap-4">
      <div className="w-20 h-20 rounded-2xl bg-degradado-violeta flex items-center justify-center shadow-boton">
        <Film className="w-10 h-10 text-white" aria-hidden="true" />
      </div>
      <h1 className="font-titulo font-extrabold text-6xl text-primario">404</h1>
      <h2 className="font-titulo font-bold text-xl text-gray-900">Página no encontrada</h2>
      <p className="text-gray-500 font-cuerpo max-w-sm">
        La página que buscas no existe o fue movida. Revisa la dirección o vuelve al inicio.
      </p>
      <Link to="/" className="btn-primario inline-flex items-center gap-2 mt-2">
        <Home className="w-4 h-4" aria-hidden="true" />
        Volver al inicio
      </Link>
    </div>
  )
}
