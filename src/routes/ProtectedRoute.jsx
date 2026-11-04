/**
 * ProtectedRoute.jsx — Componente de ruta protegida por rol.
 *
 * Uso:
 *   <ProtectedRoute rolesPermitidos={["admin"]}>
 *     <MiPagina />
 *   </ProtectedRoute>
 *
 * Comportamiento (el rol es el que devolvió el servidor en GET /auth/yo o en el login):
 *  - Mientras se valida la sesión guardada → muestra "Verificando sesión..."
 *  - Si no se pudo validar por falla de conexión → mensaje con botón Reintentar
 *  - Si no está autenticado → redirige a /login (recordando la ruta para volver)
 *  - Si no tiene el rol requerido → muestra "Acceso denegado"
 *  - Si tiene el rol → renderiza los children
 */

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { mensajeDeError } from "@/services/apiClient"
import AccesoDenegado from "@/components/AccesoDenegado"
import Spinner from "@/components/ui/Spinner"
import MensajeError from "@/components/ui/MensajeError"

/**
 * @param {Object} props
 * @param {string[]} [props.rolesPermitidos] — Roles que pueden acceder. Si está vacío, solo requiere autenticación.
 * @param {React.ReactNode} props.children
 */
export default function ProtectedRoute({ rolesPermitidos = [], children }) {
  const { autenticado, rol, cargandoSesion, errorSesion, reintentarSesion } = useAuth()
  const ubicacion = useLocation()

  // Esperar a que el servidor confirme la sesión: sin esto un usuario con sesión
  // válida sería enviado al login por un instante al recargar la página
  if (cargandoSesion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner tamaño="lg" texto="Verificando sesión..." />
      </div>
    )
  }

  // Falla de conexión al validar: no se sabe si la sesión sirve, se ofrece reintentar
  if (errorSesion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <MensajeError mensaje={mensajeDeError(errorSesion)} onReintentar={reintentarSesion} />
      </div>
    )
  }

  // No autenticado → redirigir al login guardando la ruta de retorno
  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion }} replace />
  }

  // Rol insuficiente → mostrar pantalla de acceso denegado
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
    return <AccesoDenegado rol={rol} />
  }

  return children
}
