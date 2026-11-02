/**
 * formato.js — Funciones de formateo reutilizables en toda la app.
 */

/**
 * Formatea un número como moneda colombiana (COP).
 * @param {number} valor
 * @returns {string} ej: "$ 18.000"
 */
export function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

/**
 * Formatea la duración en minutos como "Xh YYmin".
 * @param {number} minutos
 * @returns {string} ej: "2h 07min"
 */
export function formatearDuracion(minutos) {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m}min`
  return `${h}h ${String(m).padStart(2, "0")}min`
}

/**
 * Formatea segundos como "MM:SS" para el countdown.
 * @param {number} segundos
 * @returns {string} ej: "04:32"
 */
export function formatearCountdown(segundos) {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * Capitaliza la primera letra de un string.
 * @param {string} texto
 * @returns {string}
 */
export function capitalizar(texto) {
  if (!texto) return ""
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
