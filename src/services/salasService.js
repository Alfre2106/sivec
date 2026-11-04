/**
 * salasService.js — CRUD de salas (administrador / taquillero).
 *
 * Con usaApi("salas") usa la API real (GET/POST/PUT/DELETE /salas); si no, la lógica
 * simulada de mock/salasMock.js.
 *
 * La API maneja `asientos_por_fila` y calcula `capacidad = filas × asientos_por_fila`.
 * La interfaz histórica usa `columnas`; aquí se traduce en ambos sentidos para no
 * tocar las pantallas. La API no tiene `tipo` de sala (se eliminó del panel en la Fase I6).
 *
 * Forma de sala para la interfaz: { id, nombre, filas, columnas, capacidad }
 */

import { usaApi } from "./config"
import { api } from "./apiClient"
import * as mock from "./mock/salasMock"

/** Sala de la API → sala de la interfaz (asientos_por_fila → columnas). */
export function salaDesdeApi(s) {
  return {
    id: s.id,
    nombre: s.nombre,
    filas: s.filas,
    columnas: s.asientos_por_fila,
    capacidad: s.capacidad,
  }
}

/** Datos del formulario → cuerpo de la API (columnas → asientos_por_fila). */
function salaHaciaApi(datos) {
  const cuerpo = {}
  if (datos.nombre !== undefined) cuerpo.nombre = datos.nombre
  if (datos.filas !== undefined) cuerpo.filas = Number(datos.filas)
  if (datos.columnas !== undefined) cuerpo.asientos_por_fila = Number(datos.columnas)
  return cuerpo
}

/**
 * Lista todas las salas.
 * @param {Object} [opciones] @param {AbortSignal} [opciones.signal]
 * @returns {Promise<Object[]>}
 */
export async function listarSalas({ signal } = {}) {
  if (!usaApi("salas")) return mock.listarSalas()
  const { salas } = await api.get("/salas", { signal })
  return salas.map(salaDesdeApi)
}

/** Obtiene una sala por id. */
export async function obtenerSala(id, { signal } = {}) {
  if (!usaApi("salas")) return mock.obtenerSala(id)
  const { sala } = await api.get(`/salas/${encodeURIComponent(id)}`, { signal })
  return salaDesdeApi(sala)
}

/**
 * Crea una sala.
 * @param {{nombre:string, filas:number, columnas:number}} datos
 * @throws {ApiError} 422 CAMPOS_REQUERIDOS, FILAS_INVALIDAS, ASIENTOS_INVALIDOS
 */
export async function crearSala(datos) {
  if (!usaApi("salas")) return mock.crearSala(datos)
  const { sala } = await api.post("/salas", salaHaciaApi(datos))
  return salaDesdeApi(sala)
}

/**
 * Actualiza una sala. Cambiar filas/columnas con funciones activas da 409 SALA_CON_FUNCIONES.
 * @throws {ApiError} 404 SALA_NO_ENCONTRADA, 409 SALA_CON_FUNCIONES, 422 (validaciones)
 */
export async function actualizarSala(id, datos) {
  if (!usaApi("salas")) return mock.actualizarSala(id, datos)
  const { sala } = await api.put(`/salas/${encodeURIComponent(id)}`, salaHaciaApi(datos))
  return salaDesdeApi(sala)
}

/**
 * Elimina una sala. Solo si no tiene ninguna función.
 * @throws {ApiError} 404 SALA_NO_ENCONTRADA, 409 SALA_CON_FUNCIONES
 */
export async function eliminarSala(id) {
  if (!usaApi("salas")) return mock.eliminarSala(id)
  await api.del(`/salas/${encodeURIComponent(id)}`)
}
