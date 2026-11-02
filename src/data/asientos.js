/**
 * asientos.js — Mapa de asientos por función.
 *
 * Cada asiento tiene:
 *   id          : "{funcionId}-{fila}{columna}"   e.g. "f01-A1"
 *   funcionId   : string
 *   fila        : letra  "A"–"F" (s1) / "A"–"H" (s2)
 *   columna     : número 1–12 (s1) / 1–10 (s2)
 *   codigo      : "{fila}{columna}"  e.g. "A1", "C10"
 *   estado      : "disponible" | "reservado" | "vendido"
 *   reservadoHasta : ISO string | null  (solo cuando estado === "reservado")
 *
 * "Seleccionado" NO es un estado de datos: es visual, vive solo en CartContext.
 *
 * Los overrides sirven para preconfigurar asientos vendidos/reservados en el mock.
 */

import { addMinutes } from "date-fns"

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// TTL mock para reservas precargadas (vencen en 4 minutos desde que arranca la app)
const reservadoHastaMock = () => addMinutes(new Date(), 4).toISOString()

/**
 * Genera la cuadrícula de asientos de una función.
 * @param {string}  funcionId
 * @param {number}  filas     — cantidad de filas
 * @param {number}  columnas  — cantidad de columnas por fila
 * @param {Object}  overrides — { "A1": "vendido", "B3": "reservado" }
 * @returns {Object[]}
 */
export function generarAsientos(funcionId, filas, columnas, overrides = {}) {
  const asientos = []
  for (let f = 0; f < filas; f++) {
    for (let c = 1; c <= columnas; c++) {
      const codigo = `${LETRAS[f]}${c}`
      const estado = overrides[codigo] ?? "disponible"
      asientos.push({
        id: `${funcionId}-${codigo}`,
        funcionId,
        fila: LETRAS[f],
        columna: c,
        codigo,
        estado,
        reservadoHasta: estado === "reservado" ? reservadoHastaMock() : null,
      })
    }
  }
  return asientos
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de estados iniciales por función
// Sala 1: 6 filas (A-F) × 12 columnas = 72 asientos
// Sala 2: 8 filas (A-H) × 10 columnas = 80 asientos
// ─────────────────────────────────────────────────────────────────────────────

// f01 — Intensa-Mente 2 / Sala 1 — ocupación media para demo
const ASIENTOS_F01 = generarAsientos("f01", 6, 12, {
  A1:"vendido", A2:"vendido", A3:"vendido", A4:"vendido",
  B2:"vendido", B3:"vendido", B8:"vendido", B9:"vendido",
  C4:"vendido", C5:"vendido", C6:"vendido",
  C10:"reservado", C11:"reservado",
  D1:"vendido", D12:"vendido",
  E6:"reservado", E7:"reservado",
  F3:"vendido", F4:"vendido",
})

// f02 — Intensa-Mente 2 / Sala 2 — baja ocupación
const ASIENTOS_F02 = generarAsientos("f02", 8, 10, {
  A1:"vendido", A2:"vendido",
  C5:"reservado",
  E3:"vendido",
})

// f03 — Intensa-Mente 2 / Sala 1 — casi llena para probar UX
const ASIENTOS_F03 = generarAsientos("f03", 6, 12, {
  A1:"vendido",A2:"vendido",A3:"vendido",A4:"vendido",A5:"vendido",A6:"vendido",A7:"vendido",A8:"vendido",A9:"vendido",A10:"vendido",A11:"vendido",A12:"vendido",
  B1:"vendido",B2:"vendido",B3:"vendido",B4:"vendido",B5:"vendido",B6:"vendido",B7:"vendido",B8:"vendido",B9:"vendido",B10:"vendido",
  C1:"vendido",C2:"vendido",C3:"vendido",C4:"vendido",C5:"vendido",C6:"vendido",C7:"reservado",C8:"reservado",
  D1:"vendido",D2:"vendido",D3:"reservado",D4:"reservado",
})

// f04 — casi vacía (fácil para probar compra)
const ASIENTOS_F04 = generarAsientos("f04", 8, 10, {
  B4:"vendido", D7:"reservado",
})

// f05 — vacía
const ASIENTOS_F05 = generarAsientos("f05", 6, 12, {})

// f06 — Deadpool & Wolverine / Sala 2 — ocupación media
const ASIENTOS_F06 = generarAsientos("f06", 8, 10, {
  A1:"vendido",A2:"vendido",A3:"vendido",
  B5:"vendido",B6:"vendido",
  C8:"reservado",C9:"reservado",
  E2:"vendido",E3:"vendido",
  G1:"reservado",
})

// f07 — D&W / Sala 1 — poca ocupación
const ASIENTOS_F07 = generarAsientos("f07", 6, 12, {
  C3:"vendido", D8:"reservado",
})

// f08 — vacía
const ASIENTOS_F08 = generarAsientos("f08", 8, 10, {})

// f09 — cancelada (algunos vendidos, sus entradas quedarán "anuladas")
const ASIENTOS_F09 = generarAsientos("f09", 6, 12, {
  A2:"vendido", B5:"vendido", C6:"vendido",
})

// f10 — La Odisea / Sala 1
const ASIENTOS_F10 = generarAsientos("f10", 6, 12, {
  A1:"vendido",A2:"vendido",
  B3:"vendido",B4:"vendido",B5:"vendido",
  C7:"reservado",C8:"reservado",
  D11:"vendido",
})

// f11 — La Odisea / Sala 2
const ASIENTOS_F11 = generarAsientos("f11", 8, 10, {
  A4:"vendido", C2:"reservado", F9:"vendido",
})

// f12 — vacía
const ASIENTOS_F12 = generarAsientos("f12", 6, 12, {})

// f13 — vacía
const ASIENTOS_F13 = generarAsientos("f13", 8, 10, {})

// f14 — Moana / Sala 2
const ASIENTOS_F14 = generarAsientos("f14", 8, 10, {
  A1:"vendido",A2:"vendido",A3:"vendido",
  B1:"vendido",B2:"vendido",
  C6:"reservado",
})

// f15 — Moana / Sala 1
const ASIENTOS_F15 = generarAsientos("f15", 6, 12, {
  D4:"vendido",D5:"vendido",E8:"reservado",
})

// f16 — vacía
const ASIENTOS_F16 = generarAsientos("f16", 8, 10, {})

// f17 — La Noche del Demonio / Sala 1
const ASIENTOS_F17 = generarAsientos("f17", 6, 12, {
  A1:"vendido",A2:"vendido",A3:"vendido",A4:"vendido",A5:"vendido",A6:"vendido",
  B1:"vendido",B2:"vendido",B3:"vendido",B4:"vendido",B5:"vendido",
  C1:"vendido",C2:"vendido",C3:"vendido",
  D5:"reservado",D6:"reservado",D7:"reservado",
})

// f18 — La Noche del Demonio / Sala 2
const ASIENTOS_F18 = generarAsientos("f18", 8, 10, {
  A1:"vendido",A2:"vendido",
  B3:"reservado",
})

// f19 y f20 — vacías
const ASIENTOS_F19 = generarAsientos("f19", 6, 12, {})
const ASIENTOS_F20 = generarAsientos("f20", 8, 10, {})

// f21 — Scary Movie / Sala 2
const ASIENTOS_F21 = generarAsientos("f21", 8, 10, {
  C4:"vendido",C5:"vendido",D4:"vendido",D5:"vendido",
  E4:"reservado",E5:"reservado",
})

// f22 y f23 — vacías
const ASIENTOS_F22 = generarAsientos("f22", 6, 12, {})
const ASIENTOS_F23 = generarAsientos("f23", 8, 10, {})

// f_iniciada — función ya comenzada, asientos disponibles (la UI los bloquea)
const ASIENTOS_INICIADA = generarAsientos("f_iniciada", 6, 12, {
  A1:"vendido",A2:"vendido",B3:"vendido",
})

// f24-f26 — Spider-Man: Brand New Day
const ASIENTOS_F24 = generarAsientos("f24", 6, 12, {
  A1:"vendido",A2:"vendido",A3:"vendido",
  B5:"vendido",B6:"vendido",
  C8:"reservado",C9:"reservado",
})
const ASIENTOS_F25 = generarAsientos("f25", 8, 10, {
  D3:"vendido", E7:"reservado",
})
const ASIENTOS_F26 = generarAsientos("f26", 6, 12, {})

// ── Mapa global indexado por funcionId ────────────────────────────────────────
export const ASIENTOS_MOCK = {
  f01: ASIENTOS_F01,
  f02: ASIENTOS_F02,
  f03: ASIENTOS_F03,
  f04: ASIENTOS_F04,
  f05: ASIENTOS_F05,
  f06: ASIENTOS_F06,
  f07: ASIENTOS_F07,
  f08: ASIENTOS_F08,
  f09: ASIENTOS_F09,
  f10: ASIENTOS_F10,
  f11: ASIENTOS_F11,
  f12: ASIENTOS_F12,
  f13: ASIENTOS_F13,
  f14: ASIENTOS_F14,
  f15: ASIENTOS_F15,
  f16: ASIENTOS_F16,
  f17: ASIENTOS_F17,
  f18: ASIENTOS_F18,
  f19: ASIENTOS_F19,
  f20: ASIENTOS_F20,
  f21: ASIENTOS_F21,
  f22: ASIENTOS_F22,
  f23: ASIENTOS_F23,
  f_iniciada: ASIENTOS_INICIADA,
  f24: ASIENTOS_F24,
  f25: ASIENTOS_F25,
  f26: ASIENTOS_F26,
}
