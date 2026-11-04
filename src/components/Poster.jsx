/**
 * Poster.jsx — Imagen de póster con respaldo si falta o no carga.
 *
 * Si `src` está vacío o la imagen falla (404, nombre distinto, etc.), muestra un
 * recuadro con degradado e ícono de película. Mantiene proporción 2:3 cuando el
 * llamador solo define el ancho.
 *
 * `alt=""` marca la imagen como decorativa.
 */

import { useState } from "react"
import { Film } from "lucide-react"
import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {string} [props.titulo] — se muestra en el respaldo si mostrarTitulo
 * @param {boolean} [props.mostrarTitulo]
 * @param {string} [props.className]
 */
export default function Poster({ src, alt = "", titulo, mostrarTitulo = false, className }) {
  const [srcFallida, setSrcFallida] = useState(null)
  const decorativo = alt === ""
  const usarRespaldo = !src || srcFallida === src

  if (usarRespaldo) {
    return (
      <div
        className={cn(
          "aspect-[2/3] bg-gradient-to-br from-noche-oscuro to-primario-oscuro",
          "flex flex-col items-center justify-center gap-1 p-1 text-center overflow-hidden",
          className
        )}
        role={decorativo ? undefined : "img"}
        aria-label={decorativo ? undefined : alt}
        aria-hidden={decorativo ? "true" : undefined}
      >
        <Film className="w-1/3 min-w-3 max-w-8 text-white/70" aria-hidden="true" />
        {mostrarTitulo && titulo && (
          <span className="text-white/80 font-titulo font-semibold text-xs leading-tight line-clamp-3 px-2">
            {titulo}
          </span>
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={decorativo ? "true" : undefined}
      loading="lazy"
      onError={() => setSrcFallida(src)}
      className={className}
    />
  )
}
