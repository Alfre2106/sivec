/**
 * PasoIndicador.jsx — Indicador de pasos (stepper) para el wizard de venta.
 *
 * Uso:
 *   <PasoIndicador pasos={["Función","Asientos","Cliente","Confirmar"]} actual={1} />
 */

import { Check } from "lucide-react"
import { cn } from "@/utils/cn"

/**
 * @param {Object}   props
 * @param {string[]} props.pasos   — etiquetas de cada paso
 * @param {number}   props.actual  — índice del paso actual (0-based)
 */
export default function PasoIndicador({ pasos, actual }) {
  return (
    <nav aria-label="Pasos del proceso" className="w-full">
      <ol className="flex items-center w-full">
        {pasos.map((etiqueta, idx) => {
          const completado = idx < actual
          const enCurso    = idx === actual
          const pendiente  = idx > actual
          const esUltimo   = idx === pasos.length - 1

          return (
            <li
              key={etiqueta}
              className={cn("flex items-center", !esUltimo && "flex-1")}
              aria-current={enCurso ? "step" : undefined}
            >
              {/* Círculo numerado */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-titulo font-bold",
                    "transition-all duration-200 shrink-0",
                    completado && "bg-exito text-white",
                    enCurso    && "bg-primario text-white ring-4 ring-primario/20",
                    pendiente  && "bg-gray-200 text-gray-400"
                  )}
                  aria-label={`Paso ${idx + 1}: ${etiqueta}${completado ? " (completado)" : enCurso ? " (actual)" : ""}`}
                >
                  {completado
                    ? <Check className="w-4 h-4" aria-hidden="true" />
                    : <span>{idx + 1}</span>
                  }
                </div>
                <span
                  className={cn(
                    "text-[10px] font-cuerpo font-medium whitespace-nowrap",
                    completado && "text-exito",
                    enCurso    && "text-primario",
                    pendiente  && "text-gray-400"
                  )}
                >
                  {etiqueta}
                </span>
              </div>

              {/* Línea conectora */}
              {!esUltimo && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-4 rounded transition-all duration-300",
                    idx < actual ? "bg-exito" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
