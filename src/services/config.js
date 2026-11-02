/**
 * config.js — Configuración centralizada de la capa de servicios.
 *
 * Para conectar el backend Flask, basta con:
 *   1. Cambiar API_BASE_URL a la URL real (ej: "http://localhost:5000/api")
 *   2. Cambiar MODO_MOCK a false
 *   3. Reemplazar el cuerpo de cada función en los servicios por fetch/axios.
 */

// URL base de la API. En modo mock no se usa, pero queda lista.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"

// Bandera global: true = usa datos mock; false = llama al backend real
export const MODO_MOCK = true

/**
 * Simula latencia de red (ms) para hacer el mock más realista.
 * @param {number} [ms=300] — Milisegundos a esperar
 * @returns {Promise<void>}
 */
export const simularLatencia = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Simula una respuesta de error aleatoria (para probar manejo de errores).
 * @param {number} [probabilidad=0] — Probabilidad de fallo entre 0 y 1
 * @throws {Error} Si el random cae dentro de la probabilidad indicada
 */
export const simularError = (probabilidad = 0) => {
  if (Math.random() < probabilidad) {
    throw new Error("Error simulado de red")
  }
}
