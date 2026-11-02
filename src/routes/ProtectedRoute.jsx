/**
 * ProtectedRoute.jsx — Componente de ruta protegida por rol.
 *
 * Uso:
 *   <ProtectedRoute rolesPermitidos={["admin"]}>
 *     <MiPagina />
 *   </ProtectedRoute>
 *
 * Comportamiento:
 *  - Si no está autenticado → redirige a /login
 *  - Si no tiene el rol requerido → muestra "Acceso denegado"
 *  - Si tiene el rol → renderiza los children
 */

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ShieldX } from "lucide-react"

/**
 * @param {Object} props
 * @param {string[]} [props.rolesPermitidos] — Roles que pueden acceder. Si está vacío, solo requiere autenticación.
 * @param {React.ReactNode} props.children
 */
export default function ProtectedRoute({ rolesPermitidos = [], children }) {
  const { autenticado, rol } = useAuth()
  const ubicacion = useLocation()

  // No autenticado → redirigir al login guardando la ruta de retorno
  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion }} replace />
  }

  // Rol insuficiente → mostrar pantalla de acceso denegado
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
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

  return children
}
