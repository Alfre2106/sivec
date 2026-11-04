/**
 * Perfil.jsx — Perfil del usuario autenticado (SOLO LECTURA).
 *
 * La API no tiene endpoint para editar el perfil propio, así que se muestran los datos
 * que entrega GET /auth/yo. Si más adelante el backend agrega PUT /auth/yo, aquí se
 * vuelve a habilitar la edición.
 */

import { useAuth } from "@/context/AuthContext"
import Badge from "@/components/ui/Badge"
import { formatearFecha } from "@/utils/fechas"
import { User, Mail, CalendarDays, ShieldCheck } from "lucide-react"

const ROL_VARIANTE = { cliente: "info", taquillero: "advertencia", admin: "primario" }
const ROL_ETIQUETA = { cliente: "Cliente", taquillero: "Taquillero", admin: "Administrador" }

export default function Perfil() {
  const { usuario, rol } = useAuth()

  const datos = [
    { icono: <User />,         etiqueta: "Nombre completo",   valor: usuario?.nombre },
    { icono: <Mail />,         etiqueta: "Correo electrónico", valor: usuario?.email },
    { icono: <ShieldCheck />,  etiqueta: "Rol",               valor: ROL_ETIQUETA[rol] ?? rol },
    { icono: <CalendarDays />, etiqueta: "Miembro desde",     valor: formatearFecha(usuario?.fechaRegistro) },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      {/* Avatar + info */}
      <div className="tarjeta p-6 flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-degradado-violeta flex items-center justify-center font-titulo font-extrabold text-white text-2xl shrink-0">
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-titulo font-bold text-gray-900 text-lg truncate">{usuario?.nombre}</p>
          <p className="text-gray-500 text-sm font-cuerpo truncate">{usuario?.email}</p>
          <Badge variante={ROL_VARIANTE[rol] ?? "neutro"} className="mt-1 capitalize">{rol}</Badge>
        </div>
      </div>

      {/* Información de la cuenta */}
      <div className="tarjeta p-6">
        <h2 className="font-titulo font-semibold text-gray-800 mb-5">Información de la cuenta</h2>
        <dl className="flex flex-col gap-4">
          {datos.map(({ icono, etiqueta, valor }) => (
            <div key={etiqueta} className="flex items-start gap-3">
              <span className="text-primario mt-0.5 shrink-0 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
                {icono}
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-gray-500 font-cuerpo">{etiqueta}</dt>
                <dd className="text-sm text-gray-900 font-cuerpo font-medium break-words">{valor || "—"}</dd>
              </div>
            </div>
          ))}
        </dl>
        <p className="text-xs text-gray-400 font-cuerpo mt-6 border-t border-gray-100 pt-4">
          Por ahora los datos de la cuenta no se pueden modificar desde aquí.
        </p>
      </div>
    </div>
  )
}
