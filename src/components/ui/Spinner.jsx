/**
 * Spinner.jsx — Indicador de carga animado con tres tamaños bien definidos.
 *
 * Tamaños:
 *  sm  → w-4  h-4  (16 px) — dentro de botones o inline
 *  md  → w-7  h-7  (28 px) — carga de sección pequeña
 *  lg  → w-12 h-12 (48 px) — carga de página completa
 *
 * Uso:
 *   <Spinner />
 *   <Spinner tamaño="lg" texto="Cargando cartelera..." />
 */

import { Loader2 } from "lucide-react"
import { cn } from "@/utils/cn"

const TAMAÑOS = {
  sm: "w-4 h-4",
  md: "w-7 h-7",
  lg: "w-12 h-12",
}

// Tamaño de la etiqueta de texto correlacionado con el spinner
const TEXTO_TAMAÑOS = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

/**
 * @param {Object} props
 * @param {"sm"|"md"|"lg"} [props.tamaño="md"]
 * @param {string} [props.texto] — Texto visible debajo del spinner
 * @param {string} [props.className]
 */
export default function Spinner({ tamaño = "md", texto, className }) {
  return (
    <div
      role="status"
      aria-label={texto ?? "Cargando"}
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin text-primario", TAMAÑOS[tamaño])}
        aria-hidden="true"
      />
      {texto && (
        <p className={cn("text-gray-500 font-cuerpo", TEXTO_TAMAÑOS[tamaño])}>
          {texto}
        </p>
      )}
    </div>
  )
}
