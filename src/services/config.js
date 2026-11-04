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
// se mantienen los datos simulados (así un error de tipeo nunca rompe la app).
// OJO: durante la migración (fases I1 a I6) este valor NO se consulta, ver usaApi().
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? "true").trim().toLowerCase() !== "false"

/**
 * Servicios ya migrados a la API real. Se agregan fase a fase:
 *   I1 auth · I2 peliculas y funciones · I3 asientos y reservas · I4 compras y entradas
 *   I5 validaciones · I6 salas, usuarios y reportes
 */
const SERVICIOS_MIGRADOS = new Set([
  "auth", "peliculas", "funciones", "asientos", "compras", "entradas", "validaciones",
  "salas", "usuarios", "funcionesAdmin", "peliculasAdmin", "reportes",
])

/**
 * ¿Este servicio usa la API real?
 *
 * REGLA DE LA MIGRACIÓN: un servicio migrado usa SIEMPRE la API y uno que aún no
 * se migra usa SIEMPRE los datos simulados, sin importar VITE_USE_MOCK. Así la app
 * nunca queda rota a medias (una pantalla real mezclada con datos de otro tipo).
 * En la Fase I7 se vuelve a conectar el interruptor: migrado && !USE_MOCK.
 *
 * @param {string} servicio — nombre lógico (ej: "auth")
 * @returns {boolean}
 */
export const usaApi = (servicio) => SERVICIOS_MIGRADOS.has(servicio)

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
