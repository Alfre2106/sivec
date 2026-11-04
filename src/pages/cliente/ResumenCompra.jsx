/**
 * ResumenCompra.jsx — Resumen de la compra con countdown de reserva.
 * Si la reserva expira, muestra alerta y redirige de vuelta.
 */

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, Armchair } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/components/ui/Toast"
import { cancelarReservas } from "@/services/asientosService"
import Countdown from "@/components/Countdown"
import Button from "@/components/ui/Button"
import Poster from "@/components/Poster"
import { formatearDiaFechaLarga, formatearHora } from "@/utils/fechas"
import { formatearPrecio } from "@/utils/formato"

export default function ResumenCompra() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { funcionActual, asientosSeleccionados, reserva, reservaExpirada, segundosRestantes, limpiarCarrito, totalSeleccionado } = useCart()

  // Redirigir si no hay reserva activa
  useEffect(() => {
    if (!funcionActual || !reserva) navigate("/cartelera", { replace: true })
  }, [funcionActual, reserva, navigate])

  // Manejar expiración: en el servidor la reserva ya venció sola, pero limpiamos por si acaso
  const manejarExpiracion = async () => {
    const idFuncion = funcionActual?.id
    if (idFuncion && reserva) {
      await cancelarReservas(idFuncion, reserva.asientoIds).catch(() => {})
    }
    limpiarCarrito()
    toast({ tipo: "advertencia", titulo: "Reserva expirada", mensaje: "Tus asientos volvieron a estar disponibles." })
    if (idFuncion) navigate(`/funcion/${idFuncion}/asientos`, { replace: true })
    else navigate("/cartelera", { replace: true })
  }

  // Botón "Cancelar": libera la reserva en el servidor y vuelve al mapa
  const cancelarYVolver = async () => {
    const idFuncion = funcionActual?.id
    if (idFuncion && reserva) {
      await cancelarReservas(idFuncion, reserva.asientoIds).catch(() => {})
    }
    limpiarCarrito()
    if (idFuncion) navigate(`/funcion/${idFuncion}/asientos`)
    else navigate("/cartelera")
  }

  if (!funcionActual || !reserva) return null

  const f = funcionActual

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-titulo text-2xl font-bold text-gray-900 mb-2">Resumen de tu compra</h1>
      <p className="text-gray-500 font-cuerpo text-sm mb-6">Confirma los detalles antes de proceder al pago</p>

      {/* Countdown */}
      <div className="mb-6 flex justify-center">
        <Countdown segundos={segundosRestantes} onExpirar={manejarExpiracion} />
      </div>

      {/* Tarjeta resumen */}
      <div className="tarjeta overflow-hidden mb-6">
        {/* Banner de la película */}
        <div className="bg-noche-oscuro px-5 py-4 flex items-center gap-4">
          <Poster src={f.pelicula?.poster} alt={f.pelicula?.titulo} className="w-14 rounded-lg object-cover object-top shrink-0" />
          <div>
            <h2 className="font-titulo font-bold text-white text-lg">{f.pelicula?.titulo}</h2>
            <p className="text-gray-400 text-xs font-cuerpo">{f.pelicula?.genero}</p>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-3">
          {/* Detalles */}
          {[
            { icono: <Calendar />, label: "Fecha",    valor: formatearDiaFechaLarga(f.fechaHora) },
            { icono: <Clock />,    label: "Hora",     valor: formatearHora(f.fechaHora) },
            { icono: <MapPin />,   label: "Sala",     valor: f.sala?.nombre },
            { icono: <Armchair />, label: "Asientos", valor: asientosSeleccionados.map((a) => a.codigo).join(", ") },
          ].map(({ icono, label, valor }) => (
            <div key={label} className="flex items-center gap-3 text-sm font-cuerpo">
              <span className="text-primario [&>svg]:w-4 [&>svg]:h-4 shrink-0" aria-hidden="true">{icono}</span>
              <span className="text-gray-500 w-16 shrink-0">{label}:</span>
              <span className="text-gray-900 font-semibold capitalize">{valor}</span>
            </div>
          ))}

          {/* Total */}
          <div className="border-t border-gray-100 pt-3 mt-1 flex items-center justify-between">
            <span className="font-titulo font-semibold text-gray-700">Total a pagar</span>
            <span className="font-titulo font-extrabold text-primario text-xl">{formatearPrecio(totalSeleccionado)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1" onClick={() => navigate("/pago")} disabled={reservaExpirada}>
          Proceder al pago →
        </Button>
        <Button variante="fantasma" onClick={cancelarYVolver}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
