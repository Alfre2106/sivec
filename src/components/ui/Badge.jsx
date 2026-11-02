/**
 * Badge.jsx — Etiqueta de estado/categoría con variantes de color.
 *
 * Variantes de asiento: "disponible" | "reservado" | "vendido"
 * Variantes de entrada: "activa" | "usada" | "anulada"
 * Variantes generales:  "primario" | "exito" | "advertencia" | "error" | "info" | "neutro"
 *
 * Uso:
 *   <Badge variante="disponible">Disponible</Badge>
 *   <Badge variante="usada">Usada</Badge>
 */

import { cn } from "@/utils/cn"

const VARIANTES = {
  // ── Generales ──────────────────────────────────────────────────────────
  primario:    "bg-primario-suave text-primario-oscuro",
  exito:       "bg-green-100 text-green-800",
  advertencia: "bg-amber-100 text-amber-800",
  error:       "bg-red-100 text-red-800",
  info:        "bg-blue-100 text-blue-800",
  neutro:      "bg-gray-100 text-gray-700",

  // ── Estados de asiento ─────────────────────────────────────────────────
  // Disponible: verde claro (igual que "exito")
  disponible:  "bg-green-100 text-green-800",
  // Reservado: ámbar (igual que "advertencia")
  reservado:   "bg-amber-100 text-amber-800",
  // Vendido: gris oscuro — asiento ocupado, no se puede seleccionar
  vendido:     "bg-gray-700 text-gray-100",

  // ── Estados de entrada ─────────────────────────────────────────────────
  // Activa: verde (entrada lista para usar)
  activa:      "bg-green-100 text-green-800",
  // Usada: violeta suave — la entrada ya fue canjeada
  usada:       "bg-primario-suave text-primario-oscuro",
  // Anulada: rojo (función cancelada)
  anulada:     "bg-red-100 text-red-800",
}

/**
 * @param {Object} props
 * @param {keyof typeof VARIANTES} [props.variante="primario"]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Badge({ variante = "primario", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full",
        "text-xs font-cuerpo font-semibold whitespace-nowrap",
        VARIANTES[variante] ?? VARIANTES.neutro,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
