/**
 * StatCard.jsx — Tarjeta de métrica para el dashboard de administrador.
 *
 * Muestra: icono con fondo de color, etiqueta, valor principal y variación opcional.
 *
 * Uso:
 *   <StatCard
 *     icono={<DollarSign />}
 *     colorIcono="bg-metrica-ventas"
 *     etiqueta="Ventas Totales"
 *     valor="$ 12.450.000"
 *     variacion="+12% este mes"
 *     positivo
 *   />
 */

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {React.ReactNode} props.icono — Icono de lucide-react
 * @param {string} props.colorIcono — Clase de color de fondo del icono (ej: "bg-metrica-ventas")
 * @param {string} props.etiqueta
 * @param {string|number} props.valor
 * @param {string} [props.variacion] — Texto de tendencia (ej: "+12% este mes")
 * @param {boolean} [props.positivo=true] — true=verde, false=rojo
 * @param {string} [props.className]
 */
export default function StatCard({
  icono,
  colorIcono = "bg-primario",
  etiqueta,
  valor,
  variacion,
  positivo = true,
  className,
}) {
  return (
    <div
      className={cn(
        "tarjeta p-5 flex items-center gap-4 animacion-entrada",
        className
      )}
    >
      {/* Icono con fondo de color */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          colorIcono
        )}
        aria-hidden="true"
      >
        <span className="text-white [&>svg]:w-6 [&>svg]:h-6">
          {icono}
        </span>
      </div>

      {/* Datos */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-cuerpo text-gray-500 uppercase tracking-wide truncate">
          {etiqueta}
        </p>
        <p className="font-titulo text-xl font-bold text-gray-900 mt-0.5 truncate">
          {valor}
        </p>

        {/* Indicador de variación */}
        {variacion && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-xs font-cuerpo font-medium",
              positivo ? "text-exito" : "text-error"
            )}
            aria-label={`Variación: ${variacion}`}
          >
            {positivo ? (
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{variacion}</span>
          </div>
        )}
      </div>
    </div>
  )
}
