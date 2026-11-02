/**
 * Input.jsx — Campo de texto base con soporte para icono y mensaje de error.
 *
 * Uso:
 *   <Input placeholder="Correo electrónico" />
 *   <Input tipo="password" icono={<Lock />} />
 *   <Input error="Campo requerido" />
 */

import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {React.ReactNode} [props.icono] — Icono a mostrar al inicio del input
 * @param {string} [props.error] — Mensaje de error (pone borde rojo)
 * @param {string} [props.tipo="text"]
 * @param {string} [props.etiqueta] — Label accesible sobre el input
 * @param {string} [props.id]
 * @param {string} [props.className]
 */
export default function Input({
  icono,
  error,
  tipo = "text",
  etiqueta,
  id,
  className,
  ...props
}) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`

  return (
    <div className="flex flex-col gap-1 w-full">
      {etiqueta && (
        <label
          htmlFor={inputId}
          className="text-sm font-cuerpo font-medium text-gray-700"
        >
          {etiqueta}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Icono opcional a la izquierda */}
        {icono && (
          <span
            className="absolute left-3 text-gray-400 pointer-events-none"
            aria-hidden="true"
          >
            {icono}
          </span>
        )}

        <input
          id={inputId}
          type={tipo}
          className={cn(
            // Base
            "w-full px-4 py-2.5 rounded-boton border bg-white font-cuerpo text-sm",
            "transition-colors duration-150 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primario focus:border-transparent",
            // Con icono: padding extra a la izquierda
            icono && "pl-10",
            // Estados de error/normal
            error
              ? "border-error focus:ring-error text-error"
              : "border-gray-200 text-gray-900",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {/* Mensaje de error */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-error font-cuerpo mt-0.5"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
