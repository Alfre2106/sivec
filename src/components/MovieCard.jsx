/**
 * MovieCard.jsx — Tarjeta de película/evento para la cartelera.
 *
 * Muestra: póster (aspect 2/3), badge de clasificación (esquina sup. derecha),
 * título en Poppins con salto de línea automático, género, duración y botón Comprar.
 *
 * Todas las tarjetas tienen la misma altura gracias a flex-col + flex-1 en el cuerpo.
 *
 * Uso:
 *   <MovieCard pelicula={pelicula} onComprar={() => navigate(`/funcion/${id}/asientos`)} />
 */

import { Clock, ShoppingCart } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Poster from "@/components/Poster"
import { formatearDuracion } from "@/utils/formato"
import { cn } from "@/utils/cn"

/**
 * @param {Object}   props
 * @param {Object}   props.pelicula   — Objeto película del mock
 * @param {Function} [props.onComprar] — Handler del botón Comprar
 * @param {string}   [props.className]
 */
export default function MovieCard({ pelicula, onComprar, className }) {
  return (
    <article
      className={cn(
        "tarjeta overflow-hidden flex flex-col group animacion-entrada h-full",
        "hover:shadow-boton transition-shadow duration-300",
        className
      )}
      aria-label={`Película: ${pelicula.titulo}`}
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

        {/* Badge de clasificación — esquina superior derecha */}
        <div className="absolute top-2 right-2">
          <Badge variante="neutro" className="backdrop-blur-sm bg-white/85 text-[10px]">
            {pelicula.clasificacion}
          </Badge>
        </div>
      </div>

      {/* ── Información ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">

        {/* Título: Poppins, tamaño fijo, salto automático (no truncar) */}
        <h3
          className={cn(
            "font-titulo font-bold text-gray-900",
            "text-sm leading-snug",   // tamaño uniforme en todas las tarjetas
            "break-words hyphens-auto" // permite partir palabras largas ("&" incluido)
          )}
          lang="es"
        >
          {pelicula.titulo}
        </h3>

        {/* Género */}
        <p className="text-[11px] text-gray-500 font-cuerpo leading-tight line-clamp-1">
          {pelicula.genero}
        </p>

        {/* Duración */}
        {pelicula.duracion ? (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-cuerpo">
            <Clock className="w-3 h-3 text-primario shrink-0" aria-hidden="true" />
            <span>{formatearDuracion(pelicula.duracion)}</span>
          </div>
        ) : null}

        {/* Empuja el botón al fondo */}
        <div className="flex-1" />

        {/* Botón Comprar */}
        <Button
          onClick={onComprar}
          tamaño="sm"
          className="w-full mt-2 text-xs"
          aria-label={`Comprar entrada para ${pelicula.titulo}`}
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Comprar
        </Button>
      </div>
    </article>
  )
}
