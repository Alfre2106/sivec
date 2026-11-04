/**
 * funcionesService.js — Funciones (proyecciones), lectura pública.
 *
 * Usa la API real (GET /funciones, GET /funciones/{id}) cuando usaApi("funciones")
 * es true; si no, la lógica simulada de mock/funcionesMock.js. Los componentes
 * siempre reciben la MISMA forma de función (la que ya usaban):
 *
 *   { id, peliculaId, salaId, fechaHora, fin, precio, estado, capacidad, asientosDisponibles,
 *     pelicula: {...}, sala: { id, nombre, capacidad } }
 *
 * La API devuelve { id, pelicula: {...}, sala: { id, nombre }, inicio, fin, precio, estado,
 * capacidad, asientos_disponibles }. La sala NO trae filas ni columnas.
 *
 * Reglas que ya aplica el servidor (no se repiten aquí):
 *   - GET /funciones solo devuelve funciones activas, futuras y de películas activas.
 *   - `estado` es el efectivo: "activa", "cancelada" o "finalizada".
 *
 * La gestión del administrador (crear, editar, cancelar) está en funcionesAdminService.js
 * (aún simulado, Fase I6).
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import { peliculaDesdeApi } from "./peliculasService"
import * as mock from "./mock/funcionesMock"

/**
 * Función de la API → función de la interfaz.
 * @param {Object} f
 */
export function funcionDesdeApi(f) {
  return {
    id: f.id,
    peliculaId: f.pelicula?.id ?? null,
    salaId: f.sala?.id ?? null,
    fechaHora: f.inicio,
    fin: f.fin ?? null,
    precio: f.precio,
    estado: f.estado,
    capacidad: f.capacidad ?? null,
    // null si el servidor no lo envía; la interfaz solo avisa cuando es un número
    asientosDisponibles: f.asientos_disponibles ?? null,
    pelicula: f.pelicula ? peliculaDesdeApi(f.pelicula) : null,
    sala: f.sala ? { id: f.sala.id, nombre: f.sala.nombre, capacidad: f.capacidad ?? null } : null,
  }
}

/**
 * Lista las funciones activas y futuras (para el cliente y la taquilla).
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarFunciones({ signal } = {}) {
  if (!usaApi("funciones")) return mock.listarFunciones()
  const { funciones } = await api.get("/funciones", { signal })
  return funciones.map(funcionDesdeApi)
}

/**
 * Funciones activas y futuras de una película.
 * @param {string|number} peliculaId
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function funcionesPorPelicula(peliculaId, { signal } = {}) {
  if (!usaApi("funciones")) return mock.funcionesPorPelicula(peliculaId)
  const { funciones } = await api.get("/funciones", { params: { pelicula_id: peliculaId }, signal })
  return funciones.map(funcionDesdeApi)
}

/**
 * Obtiene una función por ID, incluso si ya inició (se muestra con su estado).
 * @param {string|number} id
 * @param {Object} [opciones]
 * @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object>}
 * @throws {ApiError} 404 FUNCION_NO_ENCONTRADA
 */
export async function obtenerFuncion(id, { signal } = {}) {
  if (!usaApi("funciones")) return mock.obtenerFuncion(id)
  const { funcion } = await api.get(`/funciones/${encodeURIComponent(id)}`, { signal })
  return funcionDesdeApi(funcion)
}
