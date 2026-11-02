/**
 * Modal.jsx — Diálogo modal accesible construido sobre Radix UI Dialog.
 *
 * Estrategia de posicionamiento:
 *  - El Overlay ocupa toda la ventana y hace de contenedor con scroll vertical,
 *    alineando el modal arriba con padding. Así, en pantallas bajas (o ventanas
 *    panorámicas) el modal nunca se corta: se puede hacer scroll del overlay
 *    hasta ver el final del modal, incluidos los botones.
 *  - El propio modal también limita su altura y hace scroll interno del cuerpo.
 *
 * Uso:
 *   <Modal abierto={abierto} onCerrar={() => setAbierto(false)} titulo="...">
 *     Contenido
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
        {/* Overlay: cubre la ventana, hace scroll y centra con padding.
            Al ser también el contenedor de posicionamiento, el modal nunca
            queda fuera de la vista en pantallas bajas. */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
            "overflow-y-auto",
            "flex items-start sm:items-center justify-center",
            "p-4 sm:py-8"
          )}
        >
          {/* Panel del modal — Radix requiere que Content esté dentro del Portal;
              lo renderizamos dentro del overlay para que participe del scroll. */}
          <Dialog.Content
            onPointerDownOutside={onCerrar}
            className={cn(
              "relative z-50 w-full bg-white rounded-sivec shadow-2xl",
              "focus:outline-none animacion-entrada",
              "my-auto flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden",
              anchos[tamaño]
            )}
          >
            {/* Cabecera — fija arriba */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <Dialog.Title className="font-titulo text-lg font-bold text-gray-900">
                {titulo}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  onClick={onCerrar}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {/* Descripción opcional */}
            {descripcion && (
              <Dialog.Description className="px-6 pt-3 text-sm text-gray-500 font-cuerpo shrink-0">
                {descripcion}
              </Dialog.Description>
            )}

            {/* Contenido — scrolleable cuando no cabe */}
            <div className="px-6 py-4 overflow-y-auto">
              {children}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
