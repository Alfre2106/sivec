/**
 * almacenamiento.js — Persistencia del estado mock en localStorage.
 *
 * Permite que los cambios (precios, funciones, compras, asientos, usuarios)
 * sobrevivan a recargas de página y se compartan entre pestañas/paneles.
 *
 * Cuando se conecte Flask, este archivo se elimina: el backend será la
 * fuente de verdad y los servicios harán fetch/axios.
 */

const PREFIJO = "sivec_db_"

/**
 * Carga un valor persistido; si no existe, devuelve el valor por defecto
 * (semilla) y lo guarda por primera vez.
 *
 * @param {string} clave     — nombre lógico (ej: "funciones")
 * @param {Function} semilla — función que devuelve el estado inicial
 * @returns {*}
 */
export function cargar(clave, semilla) {
  try {
    const raw = localStorage.getItem(PREFIJO + clave)
    if (raw !== null) return JSON.parse(raw)
  } catch {
    // JSON corrupto o localStorage no disponible → usar semilla
  }
  const inicial = semilla()
  guardar(clave, inicial)
  return inicial
}

/**
 * Persiste un valor.
 * @param {string} clave
 * @param {*} valor
 */
export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
  } catch {
    // Silencioso: si localStorage falla, el estado sigue viviendo en memoria
  }
}

/**
 * Borra todos los datos mock persistidos (reinicio de fábrica).
 * Útil para un botón "Reiniciar datos de prueba".
 */
export function reiniciarTodo() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIJO))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // Silencioso
  }
}
