/**
 * peliculasService.js — Servicio de acceso al catálogo de películas.
 *
 * Los componentes NUNCA importan datos de /data directamente.
 * Todo pasa por aquí para que el swap a Flask solo modifique este archivo.
 *
 * HOY: Lee PELICULAS_MOCK con latencia simulada.
 * DESPUÉS: GET /api/peliculas, GET /api/peliculas/:id
 */

import { simularLatencia } from "./config"
import { PELICULAS_MOCK } from "@/data/peliculas"

// Copia en memoria (permite ediciones admin sin recargar la página)
let peliculas = PELICULAS_MOCK.map((p) => ({ ...p }))

/**
 * Devuelve todas las películas con estado "activa".
 * @returns {Promise<Object[]>}
 */
export async function listarPeliculas() {
  await simularLatencia(350)
  return peliculas.filter((p) => p.estado === "activa")
}

/**
 * Devuelve TODAS las películas (activas e inactivas) — solo para admin.
 * @returns {Promise<Object[]>}
 */
export async function listarTodasPeliculas() {
  await simularLatencia(300)
  return [...peliculas]
}

/**
 * Obtiene una película por su ID.
 * @param {string} id
 * @returns {Promise<Object>}
 * @throws {Error} Si no existe
 */
export async function obtenerPelicula(id) {
  await simularLatencia(200)
  const pelicula = peliculas.find((p) => p.id === id)
  if (!pelicula) throw new Error(`Película con id "${id}" no encontrada.`)
  return { ...pelicula }
}
