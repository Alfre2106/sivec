/**
 * peliculasService.js — Catálogo de películas (lectura pública).
 *
 * Usa la API real (GET /peliculas, GET /peliculas/{id}) cuando usaApi("peliculas")
 * es true; si no, la lógica simulada de mock/peliculasMock.js. Los componentes
 * siempre reciben la MISMA forma de película (la que ya usaban):
 *
 *   { id, titulo, genero, clasificacion, duracion, sinopsis, poster, estado }
 *
 * La API devuelve { id, titulo, genero, clasificacion, duracion_min, sinopsis, poster_url, activa }.
 * No tiene banner, director ni idioma: ninguna pantalla los usa.
 *
 * El CRUD y el listado completo para administrador están en peliculasAdminService.js
 * (aún simulado, se migra en la Fase I6).
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import * as mock from "./mock/peliculasMock"

/**
 * Ruta de póster de la API → URL lista para <img>.
 * Codifica espacios, "&" y otros caracteres de cada tramo ("/posters/Mi Peli.jpg" →
 * "/posters/Mi%20Peli.jpg") sin codificar dos veces una URL que ya viene codificada.
 * @param {string|null|undefined} url
 * @returns {string|null} null si no hay póster (el componente Poster muestra un respaldo)
 */
export function urlPoster(url) {
  if (typeof url !== "string" || !url.trim()) return null
  const limpia = url.trim()
  if (/^https?:\/\//i.test(limpia)) return limpia // URL absoluta: se deja tal cual
  return limpia
    .split("/")
    .map((tramo) => {
      try {
        return encodeURIComponent(decodeURIComponent(tramo))
      } catch {
        return tramo
      }
    })
    .join("/")
}

/**
 * Película de la API → película de la interfaz.
 * La película anidada dentro de una función no trae `sinopsis` ni `activa`: esos campos
 * se incluyen solo cuando vienen, para no inventar un estado.
 * @param {Object} p
 */
export function peliculaDesdeApi(p) {
  const pelicula = {
    id: p.id,
    titulo: p.titulo,
    genero: p.genero ?? "",
    clasificacion: p.clasificacion ?? "",
    duracion: p.duracion_min ?? null,
    poster: urlPoster(p.poster_url),
  }
  if ("sinopsis" in p) pelicula.sinopsis = p.sinopsis ?? ""
  if ("activa" in p) pelicula.estado = p.activa ? "activa" : "inactiva"
  return pelicula
}

/**
 * Lista las películas activas (cartelera pública).
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarPeliculas({ signal } = {}) {
  if (!usaApi("peliculas")) return mock.listarPeliculas()
  const { peliculas } = await api.get("/peliculas", { signal })
  return peliculas.map(peliculaDesdeApi)
}

/**
 * Obtiene una película por su ID.
 * @param {string|number} id
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object>}
 * @throws {ApiError} 404 PELICULA_NO_ENCONTRADA si no existe o está inactiva
 */
export async function obtenerPelicula(id, { signal } = {}) {
  if (!usaApi("peliculas")) return mock.obtenerPelicula(id)
  const { pelicula } = await api.get(`/peliculas/${encodeURIComponent(id)}`, { signal })
  return peliculaDesdeApi(pelicula)
}
