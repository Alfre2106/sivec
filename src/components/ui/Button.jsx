/**
 * Button.jsx — Botón base de SIVEC con variantes.
 *
 * Variantes: "primario" | "secundario" | "fantasma" | "peligro" | "icono"
 * Tamaños:   "sm" | "md" | "lg"
 *
 * Uso:
 *   <Button>Comprar</Button>
 *   <Button variante="secundario" tamaño="sm">Cancelar</Button>
 *   <Button cargando>Procesando...</Button>
 */

import { Loader2 } from "lucide-react"
import { cn } from "@/utils/cn"

// Estilos base comunes a todas las variantes
const BASE =
  "inline-flex items-center justify-center gap-2 font-titulo font-semibold " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primario focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none select-none"

// Mapa de variantes → clases Tailwind
const VARIANTES = {
  primario:
    "bg-degradado-violeta text-white rounded-boton shadow-boton " +
    "hover:opacity-90 hover:scale-[1.02] active:scale-100",
  secundario:
    "border-2 border-primario text-primario bg-transparent rounded-boton " +
    "hover:bg-primario hover:text-white",
  fantasma:
    "text-gray-600 bg-transparent rounded-boton " +
    "hover:bg-gray-100 hover:text-gray-900",
  peligro:
    "bg-error text-white rounded-boton shadow-sm " +
    "hover:opacity-90 hover:scale-[1.02] active:scale-100",
  icono:
    "text-gray-600 bg-transparent rounded-full p-0 " +
    "hover:bg-gray-100 hover:text-primario",
}

// Mapa de tamaños → clases Tailwind
const TAMAÑOS = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
  // Tamaño especial para el botón de icono (sin padding extra)
  icono: "w-9 h-9",
}

/**
 * @param {Object} props
 * @param {"primario"|"secundario"|"fantasma"|"peligro"|"icono"} [props.variante="primario"]
 * @param {"sm"|"md"|"lg"|"icono"} [props.tamaño="md"]
 * @param {boolean} [props.cargando=false] — Muestra spinner y deshabilita el botón
 * @param {string} [props.className] — Clases adicionales
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variante = "primario",
  tamaño = "md",
  cargando = false,
  className,
  children,
  ...props
}) {
  const tamañoFinal = variante === "icono" ? "icono" : tamaño

  return (
    <button
      className={cn(BASE, VARIANTES[variante], TAMAÑOS[tamañoFinal], className)}
      disabled={cargando || props.disabled}
      {...props}
    >
      {cargando && (
        <Loader2
          className="w-4 h-4 animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
