/**
 * funcionesService.js — Servicio de gestión de funciones (proyecciones).
 *
 * HOY: Lee y muta arrays en memoria (datos mock).
 * DESPUÉS: Reemplazar con fetch/axios al backend Flask.
 */

import { simularLatencia } from "./config"
import { FUNCIONES_MOCK } from "@/data/funciones"
import { PELICULAS_MOCK } from "@/data/peliculas"
import { SALAS_MOCK } from "@/data/salas"

// Estado mutable en memoria
let funciones = [...FUNCIONES_MOCK]

/** Enriquece una función con los datos de su película y sala */
const enriquecer = (funcion) => ({
  ...funcion,
  pelicula: PELICULAS_MOCK.find((p) => p.id === funcion.peliculaId) ?? null,
  sala:     SALAS_MOCK.find((s) => s.id === funcion.salaId) ?? null,
})

/**
 * Lista todas las funciones activas con sus datos de película y sala.
 * @returns {Promise<Object[]>}
 */
export async function listarFunciones() {
  await simularLatencia(300)
  return funciones.filter((f) => f.estado === "activa").map(enriquecer)
}

/**
 * Lista todas las funciones (cualquier estado) — para administrador.
 * @returns {Promise<Object[]>}
 */
export async function listarTodasFunciones() {
  await simularLatencia(300)
  return funciones.map(enriquecer)
}

/**
 * Obtiene una función por ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function obtenerFuncion(id) {
  await simularLatencia(200)
  const funcion = funciones.find((f) => f.id === id)
  if (!funcion) throw new Error(`Función con id "${id}" no encontrada.`)
  return enriquecer(funcion)
}

/**
 * Obtiene las funciones de una película específica.
 * @param {string} peliculaId
 * @returns {Promise<Object[]>}
 */
export async function funcionesPorPelicula(peliculaId) {
  await simularLatencia(250)
  return funciones
    .filter((f) => f.peliculaId === peliculaId && f.estado === "activa")
    .map(enriquecer)
}

/**
 * Crea una nueva función (solo admin).
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export async function crearFuncion(datos) {
  await simularLatencia(400)
  const nueva = {
    id: `f${Date.now()}`,
    estado: "activa",
    ...datos,
  }
  funciones.push(nueva)
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
  return enriquecer(funciones[idx])
}

/**
 * Cancela una función. Sus entradas pasarán a "anulada" en comprasService.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function cancelarFuncion(id) {
  return actualizarFuncion(id, { estado: "cancelada" })
}
