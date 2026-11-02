/**
 * Toast.jsx — Sistema de notificaciones tipo toast.
 *
 * Incluye:
 *  - ToastProvider: envuelve la app (ya está en main.jsx vía AppRoutes)
 *  - useToast: hook para disparar toasts desde cualquier componente
 *  - ToastContainer: renderiza la lista de toasts activos
 *
 * Tipos: "exito" | "error" | "advertencia" | "info"
 *
 * Uso:
 *   const { toast } = useToast()
 *   toast({ tipo: "exito", titulo: "¡Compra exitosa!", mensaje: "Tu entrada está lista." })
 */

import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/utils/cn"

// ── Contexto ─────────────────────────────────────────────────────────────────
const ToastContext = createContext(null)

// Duración por defecto en ms
const DURACION_DEFAULT = 4000

// Configuración visual por tipo
const TIPOS = {
  exito: {
    icono: CheckCircle2,
    contenedor: "bg-white border-l-4 border-exito",
    icononColor: "text-exito",
  },
  error: {
    icono: XCircle,
    contenedor: "bg-white border-l-4 border-error",
    icononColor: "text-error",
  },
  advertencia: {
    icono: AlertTriangle,
    contenedor: "bg-white border-l-4 border-advertencia",
    icononColor: "text-advertencia",
  },
  info: {
    icono: Info,
    contenedor: "bg-white border-l-4 border-info",
    icononColor: "text-info",
  },
}

// ── Proveedor ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Muestra un toast.
   * @param {Object} opciones
   * @param {"exito"|"error"|"advertencia"|"info"} opciones.tipo
   * @param {string} opciones.titulo
   * @param {string} [opciones.mensaje]
   * @param {number} [opciones.duracion]
   */
  const toast = useCallback(({ tipo = "info", titulo, mensaje, duracion = DURACION_DEFAULT }) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const nuevoToast = { id, tipo, titulo, mensaje }

    setToasts((prev) => [...prev, nuevoToast])

    // Auto-cerrar después de la duración indicada
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duracion)

    return id
  }, [])

  const cerrarToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onCerrar={cerrarToast} />
    </ToastContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>")
  return ctx
}

// ── Contenedor de toasts ──────────────────────────────────────────────────────
function ToastContainer({ toasts, onCerrar }) {
  if (!toasts.length) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onCerrar={onCerrar} />
      ))}
    </div>
  )
}

// ── Ítem individual ───────────────────────────────────────────────────────────
function ToastItem({ toast, onCerrar }) {
  const config = TIPOS[toast.tipo] ?? TIPOS.info
  const Icono = config.icono

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-sivec shadow-tarjeta animacion-entrada",
        config.contenedor
      )}
    >
      <Icono
        className={cn("w-5 h-5 shrink-0 mt-0.5", config.icononColor)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-titulo font-semibold text-gray-900 leading-tight">
          {toast.titulo}
        </p>
        {toast.mensaje && (
          <p className="text-xs text-gray-500 font-cuerpo mt-0.5 leading-snug">
            {toast.mensaje}
          </p>
        )}
      </div>
      <button
        onClick={() => onCerrar(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
