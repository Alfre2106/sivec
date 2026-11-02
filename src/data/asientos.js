/**
 * asientos.js — Estado inicial de los asientos por función.
 *
 * Estructura del ID de asiento: "{funcionId}-{fila}{columna}"
 * Ejemplo: "f1-A1", "f1-B3"
 *
 * Estados posibles: "disponible" | "reservado" | "vendido"
 */

/**
 * Genera la cuadrícula de asientos para una función y sala dados.
 * @param {string} funcionId
 * @param {number} filas — número de filas (6 = A..F)
 * @param {number} columnas — número de columnas (8)
 * @param {Object} overrides — mapa { "A1": "vendido", "B3": "reservado" } para preconfigurar estados
 * @returns {Object[]} Array de asientos
 */
const generarAsientos = (funcionId, filas, columnas, overrides = {}) => {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const asientos = []

  for (let f = 0; f < filas; f++) {
    for (let c = 1; c <= columnas; c++) {
      const clave = `${letras[f]}${c}` // ej: "A1", "B3"
      asientos.push({
        id: `${funcionId}-${clave}`,
        funcionId,
        fila: letras[f],
        columna: c,
        codigo: clave,
        estado: overrides[clave] ?? "disponible",
      })
    }
  }
  return asientos
}

// ── Asientos precargados con algunos estados distintos ─────────────────────

// Función f1: varios vendidos y reservados para ver en demo
const ASIENTOS_F1 = generarAsientos("f1", 6, 8, {
  A1: "vendido", A2: "vendido", A3: "vendido",
  B4: "vendido", B5: "vendido",
  C2: "reservado", C3: "reservado",
  D6: "vendido", D7: "vendido",
  E1: "reservado",
  F5: "vendido", F6: "vendido",
})

// Función f2: más ocupación para la sala VIP
const ASIENTOS_F2 = generarAsientos("f2", 6, 8, {
  A1: "vendido", A2: "vendido",
  B1: "vendido", B2: "vendido", B3: "vendido", B4: "vendido",
  C5: "reservado", C6: "reservado",
  D3: "vendido",
  E7: "reservado",
})

// Función f3: pocos ocupados
const ASIENTOS_F3 = generarAsientos("f3", 6, 8, {
  A4: "vendido",
  C2: "reservado",
})

// Funciones f4 a f9: casi libres (para pruebas fáciles)
const ASIENTOS_F4 = generarAsientos("f4", 6, 8, { B3: "vendido" })
const ASIENTOS_F5 = generarAsientos("f5", 6, 8, { D5: "reservado", D6: "reservado" })
const ASIENTOS_F6 = generarAsientos("f6", 6, 8, {})
const ASIENTOS_F7 = generarAsientos("f7", 6, 8, { A1: "vendido", A2: "vendido" })
const ASIENTOS_F8 = generarAsientos("f8", 6, 8, {})
const ASIENTOS_F9 = generarAsientos("f9", 6, 8, {})

/**
 * Mapa indexado por funcionId para acceso rápido O(1).
 * { "f1": Asiento[], "f2": Asiento[], ... }
 */
export const ASIENTOS_MOCK = {
  f1: ASIENTOS_F1,
  f2: ASIENTOS_F2,
  f3: ASIENTOS_F3,
  f4: ASIENTOS_F4,
  f5: ASIENTOS_F5,
  f6: ASIENTOS_F6,
  f7: ASIENTOS_F7,
  f8: ASIENTOS_F8,
  f9: ASIENTOS_F9,
}
