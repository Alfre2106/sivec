/**
 * seleccionPendiente.js — Recuerda los asientos elegidos por alguien SIN sesión.
 *
 * Al pulsar "Continuar" sin sesión se guardan aquí; tras iniciar sesión y volver a la
 * misma función se restauran. Vive en sessionStorage (solo esa pestaña, y se pierde
 * al cerrarla) y caduca a los 30 minutos.
 */

const CLAVE = "sivec_seleccion_pendiente"
const VIGENCIA_MS = 30 * 60 * 1000

/** @param {number} funcionId @param {number[]} asientoIds */
export function guardarSeleccionPendiente(funcionId, asientoIds) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ funcionId, asientoIds, ts: Date.now() }))
  } catch {
    // Almacenamiento no disponible: simplemente no se restaura
  }
}

/**
 * Devuelve (y borra) los ids guardados para esta función, o null si no hay.
 * @param {number} funcionId
 * @returns {number[]|null}
 */
export function tomarSeleccionPendiente(funcionId) {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    if (!crudo) return null
    const dato = JSON.parse(crudo)
    if (Number(dato.funcionId) !== Number(funcionId)) return null   // es de otra función: se conserva
    sessionStorage.removeItem(CLAVE)
    if (Date.now() - dato.ts > VIGENCIA_MS) return null
    return Array.isArray(dato.asientoIds) ? dato.asientoIds : null
  } catch {
    return null
  }
}
