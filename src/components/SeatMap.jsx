/**
 * SeatMap.jsx — Mapa interactivo de asientos tipo "butaca".
 *
 * Diseño: cada asiento tiene forma de butaca (esquinas superiores redondeadas),
 * número siempre visible, pantalla curva arriba y pasillo central que separa
 * las dos mitades de columnas.
 *
 * Colores (sin cambios respecto al diseño original):
 *  disponible   → gris claro  (seleccionable)
 *  seleccionado → violeta     (solo visual, esta sesión)
 *  reservado    → ámbar       (no seleccionable)
 *  vendido      → gris oscuro (no seleccionable)
 *
 * Accesibilidad: navegación con teclado (Enter/Espacio), role="gridcell", aria-label.
 */

import { cn } from "@/utils/cn"

// ── Estilos por estado (forma de butaca: rounded-t más marcado) ───────────────
const ESTILOS = {
  disponible:
    "bg-white border-2 border-gray-300 text-gray-500 " +
    "hover:border-primario hover:bg-primario/10 hover:text-primario cursor-pointer " +
    "focus:ring-2 focus:ring-primario",
  seleccionado:
    "bg-primario border-2 border-primario-oscuro text-white shadow-boton cursor-pointer " +
    "focus:ring-2 focus:ring-primario-oscuro",
  reservado:
    "bg-amber-400 border-2 border-amber-500 text-amber-900 cursor-not-allowed",
  vendido:
    "bg-gray-500 border-2 border-gray-600 text-gray-100 cursor-not-allowed",
}

// ── Leyenda ───────────────────────────────────────────────────────────────────
const LEYENDA = [
  { label: "Disponible",   clase: "bg-white border-2 border-gray-300"           },
  { label: "Seleccionado", clase: "bg-primario border-2 border-primario-oscuro" },
  { label: "Reservado",    clase: "bg-amber-400 border-2 border-amber-500"       },
  { label: "Vendido",      clase: "bg-gray-500 border-2 border-gray-600"         },
]

/**
 * @param {Object}   props
 * @param {Object[]} props.asientos
 * @param {string[]} props.seleccionados  — IDs seleccionados por el usuario
 * @param {Function} props.onToggle
 * @param {boolean}  [props.deshabilitado]
 */
export default function SeatMap({ asientos = [], seleccionados = [], onToggle, deshabilitado = false }) {
  // Agrupar por fila
  const filas = asientos.reduce((acc, a) => {
    ;(acc[a.fila] ??= []).push(a)
    return acc
  }, {})
  const letrasFila = Object.keys(filas).sort()

  // Nº de columnas (para calcular el pasillo central)
  const numColumnas = Math.max(0, ...asientos.map((a) => a.columna))
  const mitad = Math.ceil(numColumnas / 2)

  const estadoVisual = (a) => (seleccionados.includes(a.id) ? "seleccionado" : a.estado)

  const manejarClick = (a) => {
    if (deshabilitado || a.estado !== "disponible") return
    onToggle?.(a)
  }
  const manejarTeclado = (e, a) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); manejarClick(a) }
  }

  return (
    <div className="flex flex-col gap-5 select-none">

      {/* ── Pantalla curva ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 400 40" className="w-full max-w-md h-8" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 20 38 Q 200 0 380 38" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-xs text-gray-400 font-cuerpo tracking-[0.3em] uppercase -mt-1">
          Pantalla
        </span>
      </div>

      {/* ── Cuadrícula de butacas ──────────────────────────────────────── */}
      <div role="grid" aria-label="Mapa de asientos" className="overflow-x-auto pb-2">
        <div className="flex flex-col gap-2 min-w-max mx-auto">
          {letrasFila.map((fila) => {
            const asientosFila = filas[fila].sort((a, b) => a.columna - b.columna)
            return (
              <div key={fila} className="flex items-center gap-2" role="row">
                {/* Etiqueta fila izquierda */}
                <span className="w-6 text-sm text-gray-500 font-titulo font-bold text-center shrink-0">
                  {fila}
                </span>

                {/* Butacas con pasillo central */}
                <div className="flex items-center gap-1.5">
                  {asientosFila.map((asiento) => {
                    const estado = estadoVisual(asiento)
                    const interactivo = !deshabilitado && asiento.estado === "disponible"
                    // Pasillo: separación extra antes de la segunda mitad
                    const esInicioSegundaMitad = asiento.columna === mitad + 1
                    return (
                      <div key={asiento.id} className="flex items-center">
                        {esInicioSegundaMitad && <span className="w-6 shrink-0" aria-hidden="true" />}
                        <button
                          type="button"
                          role="gridcell"
                          tabIndex={interactivo ? 0 : -1}
                          disabled={!interactivo}
                          onClick={() => manejarClick(asiento)}
                          onKeyDown={(e) => manejarTeclado(e, asiento)}
                          className={cn(
                            // Forma de butaca: esquinas superiores muy redondeadas, base recta
                            "w-9 h-9 rounded-t-xl rounded-b-md",
                            "flex items-center justify-center shrink-0",
                            "text-xs font-cuerpo font-semibold transition-all duration-150 outline-none",
                            ESTILOS[estado]
                          )}
                          aria-label={`Asiento ${asiento.codigo} — ${estado}`}
                          aria-selected={estado === "seleccionado"}
                          aria-disabled={asiento.estado !== "disponible"}
                          title={`${asiento.codigo} · ${estado}`}
                        >
                          {asiento.columna}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Etiqueta fila derecha */}
                <span className="w-6 text-sm text-gray-500 font-titulo font-bold text-center shrink-0">
                  {fila}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Leyenda ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-4 pt-3 border-t border-gray-100">
        {LEYENDA.map(({ label, clase }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-5 h-5 rounded-t-lg rounded-b-sm shrink-0", clase)} aria-hidden="true" />
            <span className="text-xs font-cuerpo text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
