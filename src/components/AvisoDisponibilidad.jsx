/**
 * AvisoDisponibilidad.jsx — Aviso de cupo de una función.
 *
 * "Agotada" si no quedan asientos; "Quedan N" si quedan 10 o menos.
 * No muestra nada si el dato no es numérico o hay suficientes asientos.
 */

import Badge from "@/components/ui/Badge"
import { UMBRAL_POCOS_ASIENTOS } from "@/utils/disponibilidad"

/**
 * @param {Object} props
 * @param {number} [props.disponibles]
 * @param {string} [props.className]
 */
export default function AvisoDisponibilidad({ disponibles, className }) {
  if (typeof disponibles !== "number") return null
  if (disponibles <= 0) {
    return <Badge variante="vendido" className={className}>Agotada</Badge>
  }
  if (disponibles <= UMBRAL_POCOS_ASIENTOS) {
    return <Badge variante="advertencia" className={className}>Quedan {disponibles}</Badge>
  }
  return null
}
