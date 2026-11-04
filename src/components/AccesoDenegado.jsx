/**
 * AccesoDenegado.jsx — Pantalla "Acceso denegado".
 *
 * La usa ProtectedRoute cuando el rol no puede entrar a una ruta, y cualquier
 * pantalla puede mostrarla cuando la API responde 403 (ROL_NO_AUTORIZADO):
 *
 *   if (error?.status === 403) return <AccesoDenegado rol={rol} />
 */

import { ShieldX } from "lucide-react"

/**
 * @param {Object} props
 * @param {string|null} [props.rol] — rol actual del usuario (se muestra como pista)
 */
export default function AccesoDenegado({ rol }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fondo p-6">
      <div className="tarjeta p-10 text-center max-w-md w-full animacion-entrada">
        <ShieldX className="w-16 h-16 text-error mx-auto mb-4" aria-hidden="true" />
        <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-2">
          Acceso denegado
        </h1>
        <p className="text-gray-500 font-cuerpo mb-6">
          No tienes permisos para acceder a esta sección.
          {rol && (
            <span className="block mt-1 text-sm">
              Tu rol actual es: <strong className="capitalize">{rol}</strong>
            </span>
          )}
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-primario"
          aria-label="Volver a la página anterior"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
