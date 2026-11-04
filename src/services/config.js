/**
 * config.js — Configuración centralizada de la capa de servicios.
 *
 * Variables de entorno (archivo .env, plantilla en .env.example):
 *   VITE_API_URL   → URL base de la API real (por defecto http://localhost:5000/api)
 *   VITE_USE_MOCK  → "true" usa los datos simulados; "false" usa la API real
 *
 * IMPORTANTE: Vite lee el .env solo al ARRANCAR. Si lo cambias, reinicia `npm run dev`.
 */

const URL_API_POR_DEFECTO = "http://localhost:5000/api"

// URL base de la API, sin barra final (las rutas se escriben empezando con "/").
export const API_BASE_URL = String(import.meta.env.VITE_API_URL || URL_API_POR_DEFECTO).replace(/\/+$/, "")

// Interruptor datos simulados / API real.
// Solo el texto "false" activa la API real; si falta o tiene cualquier otro valor
// Ya terminada la integración, el valor por defecto es la API real: solo el texto
// "true" activa los datos simulados. Así, si la variable falta, la app usa el backend.
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? "false").trim().toLowerCase() === "true"

/**
 * Servicios migrados a la API real (todos, al terminar la integración I1–I6):
 *   I1 auth · I2 peliculas y funciones · I3 asientos y reservas · I4 compras y entradas
 *   I5 validaciones · I6 salas, usuarios, funciones admin, peliculas admin y reportes
 */
const SERVICIOS_MIGRADOS = new Set([
  "auth", "peliculas", "funciones", "asientos", "compras", "entradas", "validaciones",
  "salas", "usuarios", "funcionesAdmin", "peliculasAdmin", "reportes",
])

/**
 * ¿Este servicio usa la API real?
 *
 * Con la migración terminada, el interruptor VITE_USE_MOCK decide: si está en "true"
 * (USE_MOCK) toda la app usa los datos simulados; si está en "false" usa la API real.
 * Un servicio que no estuviera migrado nunca usaría la API (seguridad para el futuro).
 *
 * @param {string} servicio — nombre lógico (ej: "auth")
 * @returns {boolean}
 */
export const usaApi = (servicio) => SERVICIOS_MIGRADOS.has(servicio) && !USE_MOCK

/**
 * Simula latencia de red (ms) para hacer el mock más realista.
 * Solo la usan los servicios en modo simulado.
 * @param {number} [ms=300] — Milisegundos a esperar
 * @returns {Promise<void>}
 */
export const simularLatencia = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Simula una respuesta de error aleatoria (para probar manejo de errores).
 * Solo la usan los servicios en modo simulado.
 * @param {number} [probabilidad=0] — Probabilidad de fallo entre 0 y 1
 * @throws {Error} Si el random cae dentro de la probabilidad indicada
 */
export const simularError = (probabilidad = 0) => {
  if (Math.random() < probabilidad) {
    throw new Error("Error simulado de red")
  }
}
