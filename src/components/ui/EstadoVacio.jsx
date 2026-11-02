/**
 * EstadoVacio.jsx — Estado vacío reutilizable (sin resultados, lista vacía, etc.).
 *
 * Uso:
 *   <EstadoVacio icono={<Ticket />} titulo="Sin compras" descripcion="..." >
 *     <Button>Acción</Button>
 *   </EstadoVacio>
 */

import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {React.ReactNode} [props.icono]
 * @param {string} props.titulo
 * @param {string} [props.descripcion]
 * @param {React.ReactNode} [props.children] — acción opcional (botón)
 * @param {string} [props.className]
 */
export default function EstadoVacio({ icono, titulo, descripcion, children, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-4 gap-3", className)}>
      {icono && (
        <div className="w-16 h-16 rounded-full bg-primario-suave flex items-center justify-center text-primario [&>svg]:w-8 [&>svg]:h-8">
          {icono}
        </div>
      )}
      <h3 className="font-titulo font-bold text-gray-800 text-lg">{titulo}</h3>
      {descripcion && (
        <p className="text-gray-500 font-cuerpo text-sm max-w-sm">{descripcion}</p>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
