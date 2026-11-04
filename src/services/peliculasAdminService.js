/**
 * peliculasAdminService.js — Gestión de películas (administrador).
 *
 * Con usaApi("peliculasAdmin") usa la API real (POST/PUT/DELETE /peliculas); si no, la
 * lógica simulada de mock/peliculasMock.js.
 *
 * Nota del contrato: no hay endpoint para listar películas inactivas; GET /peliculas solo
 * devuelve las activas. Por eso el panel muestra las activas, y "desactivar" (DELETE) las
 * saca de la lista. Reutiliza peliculaDesdeApi/urlPoster de peliculasService.
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { listarPeliculas, peliculaDesdeApi } from "./peliculasService"
import * as mock from "./mock/peliculasMock"

/**
 * Lista las películas para el panel (activas).
 * @param {Object} [opciones] @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarTodasPeliculas({ signal } = {}) {
  if (!usaApi("peliculasAdmin")) return mock.listarTodasPeliculas()
  return listarPeliculas({ signal })
}

/** Cuerpo del formulario → cuerpo de la API (duracion → duracion_min, poster → poster_url). */
function peliculaHaciaApi(datos) {
  const cuerpo = {}
  if (datos.titulo !== undefined) cuerpo.titulo = datos.titulo
  if (datos.genero !== undefined) cuerpo.genero = datos.genero
  if (datos.clasificacion !== undefined) cuerpo.clasificacion = datos.clasificacion
  if (datos.sinopsis !== undefined) cuerpo.sinopsis = datos.sinopsis
  if (datos.duracion !== undefined && datos.duracion !== "") cuerpo.duracion_min = Number(datos.duracion)
  if (datos.poster !== undefined) cuerpo.poster_url = datos.poster
  return cuerpo
}

/**
 * Crea una película. Solo `titulo` es obligatorio.
 * @throws {ApiError} 422 (CAMPOS_REQUERIDOS, DURACION_INVALIDA, POSTER_INVALIDO)
 */
export async function crearPelicula(datos) {
  if (!usaApi("peliculasAdmin")) return mock.crearPelicula?.(datos) ?? datos
  const { pelicula } = await api.post("/peliculas", peliculaHaciaApi(datos))
  return peliculaDesdeApi(pelicula)
}

/**
 * Edita una película (edición parcial).
 * @throws {ApiError} 404 PELICULA_NO_ENCONTRADA, 422
 */
export async function actualizarPelicula(id, datos) {
  if (!usaApi("peliculasAdmin")) return mock.actualizarPelicula?.(id, datos) ?? datos
  const { pelicula } = await api.put(`/peliculas/${encodeURIComponent(id)}`, peliculaHaciaApi(datos))
  return peliculaDesdeApi(pelicula)
}

/**
 * Desactiva una película (DELETE = activa:false). Sale de la cartelera.
 * @throws {ApiError} 404 PELICULA_NO_ENCONTRADA
 */
export async function desactivarPelicula(id) {
  if (!usaApi("peliculasAdmin")) return mock.eliminarPelicula?.(id)
  const { pelicula } = await api.del(`/peliculas/${encodeURIComponent(id)}`)
  return pelicula ? peliculaDesdeApi(pelicula) : null
}
