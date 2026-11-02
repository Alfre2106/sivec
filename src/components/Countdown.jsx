/**
 * Countdown.jsx — Cuenta regresiva de la reserva de asientos.
 * Muestra MM:SS con colores según urgencia.
 * Cuando llega a 0 llama a onExpirar().
 */

import { useEffect } from "react"
import { Clock } from "lucide-react"
import { formatearCountdown } from "@/utils/formato"
import { cn } from "@/utils/cn"

/**
 * @param {Object}   props
 * @param {number}   props.segundos   — Segundos restantes (viene del CartContext)
 * @param {Function} props.onExpirar  — Callback cuando llega a 0
 */
export default function Countdown({ segundos, onExpirar }) {
  useEffect(() => {
    if (segundos === 0) onExpirar?.()
  }, [segundos, onExpirar])

  const urgente   = segundos <= 60
  const muyUrgente= segundos <= 30

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-boton font-titulo font-bold text-sm",
        "border transition-colors duration-300",
        muyUrgente
          ? "bg-red-100 border-red-300 text-red-700 animate-pulse"
          : urgente
          ? "bg-amber-100 border-amber-300 text-amber-700"
          : "bg-primario-suave border-primario/30 text-primario"
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Tiempo restante de reserva: ${formatearCountdown(segundos)}`}
    >
      <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{formatearCountdown(segundos)}</span>
      <span className="text-xs font-cuerpo font-normal opacity-80">para completar</span>
    </div>
  )
}
