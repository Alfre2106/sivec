/**
 * MovieCard.jsx — Tarjeta de película/evento para la cartelera.
 *
 * Si `proximaFuncion` apunta a una fecha a más de 20 días, la tarjeta muestra
 * "Próximamente · DD MMM" con un badge de estreno en lugar del botón Comprar normal.
 * Si la función más próxima es en los próximos 20 días, se muestra como cartelera normal.
 */

import { Clock, ShoppingCart, CalendarClock } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Poster from "@/components/Poster"
import { formatearDuracion } from "@/utils/formato"
import { formatearFechaCorta } from "@/utils/fechas"
import { cn } from "@/utils/cn"

const DIAS_PROXIMO = 20   // menos de N días → ya en cartelera normal

function esProximamente(proximaFuncion) {
  if (!proximaFuncion) return false
  const diff = (new Date(proximaFuncion) - Date.now()) / (1000 * 60 * 60 * 24)
  return diff > DIAS_PROXIMO
}

export default function MovieCard({ pelicula, onComprar, proximaFuncion, className }) {
  const proximo = esProximamente(proximaFuncion)

  return (
    <article
      className={cn(
        "tarjeta overflow-hidden flex flex-col group animacion-entrada h-full",
        "hover:shadow-boton transition-shadow duration-300",
        className
      )}
      aria-label={`Película: ${pelicula.titulo}${proximo ? " — próximamente" : ""}`}
    >
      {/* ── Póster ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[2/3] bg-gray-100 shrink-0">
        <Poster
          src={pelicula.poster}
          alt={`Póster de ${pelicula.titulo}`}
          titulo={pelicula.titulo}
          mostrarTitulo
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Degradado inferior al hacer hover */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-noche-oscuro/70 via-transparent to-transparent
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Badge de clasificación */}
        <div className="absolute top-2 right-2">
          <Badge variante="neutro" className="backdrop-blur-sm bg-white/85 text-[10px]">
            {pelicula.clasificacion}
          </Badge>
        </div>

        {/* Badge PRÓXIMAMENTE encima del póster */}
        {proximo && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-noche-oscuro via-noche-oscuro/80 to-transparent px-2 pb-2 pt-6 flex flex-col gap-0.5">
            <span className="text-[10px] text-primario-claro font-titulo font-bold uppercase tracking-widest">
              Próximamente
            </span>
            <span className="text-xs text-white font-titulo font-semibold flex items-center gap-1">
              <CalendarClock className="w-3 h-3 shrink-0" aria-hidden="true" />
              Estreno {formatearFechaCorta(proximaFuncion)}
            </span>
          </div>
        )}
      </div>

      {/* ── Información ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">

        <h3
          className={cn(
            "font-titulo font-bold text-gray-900",
            "text-sm leading-snug break-words hyphens-auto"
          )}
          lang="es"
        >
          {pelicula.titulo}
        </h3>

        <p className="text-[11px] text-gray-500 font-cuerpo leading-tight line-clamp-1">
          {pelicula.genero}
        </p>

        {pelicula.duracion ? (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-cuerpo">
            <Clock className="w-3 h-3 text-primario shrink-0" aria-hidden="true" />
            <span>{formatearDuracion(pelicula.duracion)}</span>
          </div>
        ) : null}

        <div className="flex-1" />

        {/* Botón: "Preventa" si es próximamente, "Comprar" si está en cartelera */}
        {proximo ? (
          <Button
            onClick={onComprar}
            tamaño="sm"
            className="w-full mt-2 text-xs bg-gradient-to-r from-amber-500 to-orange-500 border-0"
            aria-label={`Preventa de ${pelicula.titulo}`}
          >
            <CalendarClock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Preventa
          </Button>
        ) : (
          <Button
            onClick={onComprar}
            tamaño="sm"
            className="w-full mt-2 text-xs"
            aria-label={`Comprar entrada para ${pelicula.titulo}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Comprar
          </Button>
        )}
      </div>
    </article>
  )
}
