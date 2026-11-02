/**
 * Modal.jsx — Diálogo modal accesible construido sobre Radix UI Dialog.
 *
 * Uso:
 *   <Modal
 *     abierto={abierto}
 *     onCerrar={() => setAbierto(false)}
 *     titulo="Confirmar pago"
 *   >
 *     Contenido del modal
 *   </Modal>
 */

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/utils/cn"

/**
 * @param {Object} props
 * @param {boolean} props.abierto
 * @param {() => void} props.onCerrar
 * @param {string} props.titulo
 * @param {string} [props.descripcion]
 * @param {React.ReactNode} props.children
 * @param {"sm"|"md"|"lg"} [props.tamaño="md"]
 */
export default function Modal({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  children,
  tamaño = "md",
}) {
  const anchos = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" }

  return (
    <Dialog.Root open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <Dialog.Portal>
        {/* Fondo oscuro */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animacion-entrada" />

        {/* Panel del modal */}
        <Dialog.Content
          className={cn(
            "fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100vw-2rem)] bg-white rounded-sivec shadow-2xl",
            "focus:outline-none animacion-entrada",
            anchos[tamaño]
          )}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Dialog.Title className="font-titulo text-lg font-bold text-gray-900">
              {titulo}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onCerrar}
                className="rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Descripción opcional */}
          {descripcion && (
            <Dialog.Description className="px-6 pt-3 text-sm text-gray-500 font-cuerpo">
              {descripcion}
            </Dialog.Description>
          )}

          {/* Contenido */}
          <div className="px-6 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
