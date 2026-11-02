/**
 * MapaAsientosDemo.jsx — Mapa de asientos VISUAL para la demo.
 * Muestra los 4 estados con sus colores: disponible, seleccionado, reservado, vendido.
 * Este componente es SOLO de presentación — no tiene lógica de compra.
 *
 * El componente real SeatMap (con interacción) se construirá en la Fase 2.
 */

import { cn } from "@/utils/cn"

// ── Configuración visual de estados ──────────────────────────────────────────
const ESTILOS_ESTADO = {
  disponible:  "bg-gray-200 hover:bg-primario/30 cursor-pointer border border-gray-300",
  seleccionado:"bg-primario border-2 border-primario-oscuro shadow-boton cursor-pointer",
  reservado:   "bg-advertencia border border-amber-400 cursor-not-allowed opacity-80",
  vendido:     "bg-gray-500 border border-gray-600 cursor-not-allowed opacity-70",
}

const TEXTO_ESTADO = {
  disponible:  "text-gray-500",
  seleccionado:"text-white font-bold",
  reservado:   "text-amber-900",
  vendido:     "text-gray-300",
}

// Leyenda
const LEYENDA = [
  { estado: "disponible",  label: "Disponible",  clase: "bg-gray-200 border border-gray-300" },
  { estado: "seleccionado",label: "Seleccionado", clase: "bg-primario border-2 border-primario-oscuro" },
  { estado: "reservado",   label: "Reservado",    clase: "bg-advertencia border border-amber-400" },
  { estado: "vendido",     label: "Vendido",      clase: "bg-gray-500 border border-gray-600" },
]

/**
 * Genera filas de demo con estados pre-asignados para ilustrar todos los colores.
 * Filas A-F, 10 columnas.
 */
const FILAS_DEMO = (() => {
  const letras = "ABCDEF"
  const overrides = {
    // Fila A: mezcla visible de todos los estados
    "A3": "vendido", "A4": "vendido", "A5": "vendido",
    "A8": "reservado", "A9": "reservado",
    // Fila B: varios vendidos
    "B1": "vendido", "B2": "vendido", "B6": "vendido",
    "B9": "reservado",
    // Fila C: algunos seleccionados (simulados)
    "C4": "seleccionado", "C5": "seleccionado",
    "C8": "vendido",
    // Fila D: reservados en bloque
    "D3": "reservado", "D4": "reservado", "D5": "reservado",
    "D9": "vendido", "D10": "vendido",
    // Fila E y F: mayormente disponibles
    "E5": "vendido", "F7": "reservado",
  }

  return Array.from({ length: 6 }, (_, fi) => {
    const fila = letras[fi]
    return {
      fila,
      asientos: Array.from({ length: 10 }, (_, ci) => {
        const col = ci + 1
        const key = `${fila}${col}`
        return {
          id: key,
          codigo: key,
          estado: overrides[key] ?? "disponible",
        }
      }),
    }
  })
})()

/**
 * @param {Object}  [props]
 * @param {string}  [props.className]
 */
export default function MapaAsientosDemo({ className }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Pantalla/escenario */}
      <div className="flex justify-center">
        <div className="w-3/4 max-w-xs h-2 bg-gradient-to-r from-transparent via-primario/50 to-transparent rounded-full" />
      </div>
      <p className="text-center text-xs text-gray-400 font-cuerpo -mt-2 tracking-widest uppercase">
        Pantalla
      </p>

      {/* Cuadrícula */}
      <div
        className="overflow-x-auto pb-2"
        role="grid"
        aria-label="Mapa de asientos de ejemplo"
      >
        <div className="flex flex-col gap-1 min-w-max mx-auto">
          {FILAS_DEMO.map(({ fila, asientos }) => (
            <div key={fila} className="flex items-center gap-1" role="row">
              {/* Etiqueta de fila */}
              <span
                className="w-5 text-xs text-gray-400 font-titulo font-semibold text-right shrink-0"
                aria-label={`Fila ${fila}`}
              >
                {fila}
              </span>

              {/* Asientos */}
              {asientos.map((asiento) => (
                <div
                  key={asiento.id}
                  role="gridcell"
                  className={cn(
                    "w-7 h-7 rounded-asiento flex items-center justify-center",
                    "text-[10px] font-cuerpo transition-colors duration-150",
                    ESTILOS_ESTADO[asiento.estado],
                    TEXTO_ESTADO[asiento.estado]
                  )}
                  aria-label={`Asiento ${asiento.codigo} — ${asiento.estado}`}
                  title={`${asiento.codigo} · ${asiento.estado}`}
                >
                  {asiento.estado === "seleccionado" ? asiento.codigo : ""}
                </div>
              ))}

              {/* Etiqueta de fila derecha */}
              <span className="w-5 text-xs text-gray-400 font-titulo font-semibold shrink-0">
                {fila}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div
        className="flex flex-wrap justify-center gap-4 pt-2 border-t border-gray-100"
        aria-label="Leyenda del mapa de asientos"
      >
        {LEYENDA.map(({ label, clase }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn("w-5 h-5 rounded-asiento shrink-0", clase)}
              aria-hidden="true"
            />
            <span className="text-xs font-cuerpo text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
