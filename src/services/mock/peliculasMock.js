/**
 * peliculasMock.js — Implementación SIMULADA del catálogo de películas.
 *
 * Es la lógica que antes vivía en peliculasService.js, movida aquí sin cambios.
 * La usan:
 *   - peliculasService.js       cuando el servicio "peliculas" no usa la API (ver usaApi en config.js)
 *   - peliculasAdminService.js  hasta que se migre a la API (Fase I6)
 */

import { simularLatencia } from "../config"
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
