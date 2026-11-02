/**
 * cn.js — Utilidad para combinar clases de Tailwind de forma segura.
 * Combina clsx (condicionales) + tailwind-merge (elimina conflictos).
 *
 * Uso: cn("px-4 py-2", condicion && "bg-primario", props.className)
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
