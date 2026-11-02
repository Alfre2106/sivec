/**
 * MensajeError.jsx — Muestra un error de carga con opción de reintentar.
 *
 * Uso:
 *   <MensajeError mensaje="Falla de conexión" onReintentar={cargar} />
 */

import { AlertCircle, RotateCcw } from "lucide-react"
import Button from "./Button"
import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {string} [props.mensaje]
 * @param {() => void} [props.onReintentar]
 * @param {string} [props.className]
 */
export default function MensajeError({ mensaje, onReintentar, className }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center py-16 px-4 gap-3", className)}
      role="alert"
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-error" aria-hidden="true" />
      </div>
      <h3 className="font-titulo font-bold text-gray-800 text-lg">Algo salió mal</h3>
      <p className="text-gray-500 font-cuerpo text-sm max-w-sm">
        {mensaje ?? "No pudimos cargar la información. Revisa tu conexión e inténtalo de nuevo."}
      </p>
      {onReintentar && (
        <Button variante="secundario" tamaño="sm" onClick={onReintentar} className="mt-2">
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reintentar
        </Button>
      )}
    </div>
  )
}
