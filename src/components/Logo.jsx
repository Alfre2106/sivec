/**
 * Logo.jsx — Logo oficial de SIVEC (imagen PNG con fondo transparente).
 *
 * Centraliza el logo: si cambia la imagen, solo se edita aquí.
 *
 * Props:
 *  @param {"sm"|"md"|"lg"|"xl"} [tamaño="md"] — alto del logo
 *  @param {boolean} [conFondo=false] — pone un fondo oscuro redondeado detrás
 *                                      (útil sobre fondos claros, ej: Login)
 *  @param {string}  [className]
 */

import { cn } from "@/utils/cn"

const ALTURAS = {
  sm: "h-10",
  md: "h-12",
  lg: "h-20",
  xl: "h-28",
}

export default function Logo({ tamaño = "md", conFondo = false, className }) {
  const img = (
    <img
      src="/logo-sivec.png"
      alt="SIVEC — Sistema de Venta de Entradas"
      className={cn("w-auto object-contain select-none", ALTURAS[tamaño], className)}
      draggable={false}
    />
  )

  // Fondo oscuro detrás del logo para máximo contraste sobre superficies claras
  if (conFondo) {
    return (
      <span className="inline-flex items-center justify-center rounded-2xl bg-noche-oscuro px-5 py-3 shadow-boton">
        {img}
      </span>
    )
  }

  return img
}
