/**
 * funcionesMock.js — Implementación SIMULADA de las funciones (proyecciones).
 *
 * Es la lógica que antes vivía en funcionesService.js, movida aquí sin cambios.
 * La usan:
 *   - funcionesService.js       cuando el servicio "funciones" no usa la API (ver usaApi en config.js)
 *   - funcionesAdminService.js  hasta que se migre a la API (Fase I6)
 *
 * Regla de negocio simulada:
 *   - listarFunciones() y funcionesPorPelicula() solo devuelven funciones
 *     cuya fechaHora sea FUTURA (mayor que ahora) y estado "activa".
 *   - La función f_iniciada tiene fechaHora en el pasado → queda excluida
 *     del listado público aunque su estado sea "activa".
 */

import { simularLatencia } from "../config"
import { FUNCIONES_MOCK } from "@/data/funciones"
import { PELICULAS_MOCK } from "@/data/peliculas"
import { SALAS_MOCK } from "@/data/salas"
import { cargar, guardar } from "../almacenamiento"

// Estado mutable persistido en localStorage (sobrevive a recargas)
let funciones = cargar("funciones", () => FUNCIONES_MOCK.map((f) => ({ ...f })))

/** Persiste el estado actual de funciones. */
const persistir = () => guardar("funciones", funciones)

/** Enriquece una función con los objetos de película y sala */
const enriquecer = (f) => ({
  ...f,
  pelicula: PELICULAS_MOCK.find((p) => p.id === f.peliculaId) ?? null,
  sala:     SALAS_MOCK.find((s) => s.id === f.salaId) ?? null,
})

/** True si la función todavía no ha iniciado */
const esFutura = (f) => new Date(f.fechaHora) > new Date()

/**
 * Lista funciones activas Y futuras (para el cliente).
 * @returns {Promise<Object[]>}
 */
export async function listarFunciones() {
  await simularLatencia(300)
  return funciones
    .filter((f) => f.estado === "activa" && esFutura(f))
    .map(enriquecer)
}

/**
 * Lista TODAS las funciones (cualquier estado/fecha) — para administrador.
 * @returns {Promise<Object[]>}
 */
export async function listarTodasFunciones() {
  await simularLatencia(300)
  return funciones.map(enriquecer)
}

/**
 * Obtiene una función por ID (sin filtro de fecha/estado).
 * @param {string} id
 * @returns {Promise<Object>}
 * @throws {Error} Si no existe
 */
export async function obtenerFuncion(id) {
  await simularLatencia(200)
  const f = funciones.find((fn) => fn.id === id)
  if (!f) throw new Error(`Función con id "${id}" no encontrada.`)
  return enriquecer(f)
}

/**
 * Funciones activas y futuras de una película específica.
 * @param {string} peliculaId
 * @returns {Promise<Object[]>}
 */
export async function funcionesPorPelicula(peliculaId) {
  await simularLatencia(250)
  return funciones
    .filter((f) => f.peliculaId === peliculaId && f.estado === "activa" && esFutura(f))
    .map(enriquecer)
}

/**
 * Crea una nueva función (solo admin).
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function crearFuncion(datos) {
  await simularLatencia(400)
  const nueva = { id: `f${Date.now()}`, estado: "activa", ...datos }
  funciones.push(nueva)
  persistir()
  return enriquecer(nueva)
}

/**
 * Actualiza una función existente (solo admin).
 * @param {string} id
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function actualizarFuncion(id, datos) {
  await simularLatencia(350)
  const idx = funciones.findIndex((f) => f.id === id)
  if (idx === -1) throw new Error("Función no encontrada.")
  funciones[idx] = { ...funciones[idx], ...datos }
  persistir()
  return enriquecer(funciones[idx])
}

/**
 * Cancela una función (estado → "cancelada").
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function cancelarFuncion(id) {
  return actualizarFuncion(id, { estado: "cancelada" })
}
